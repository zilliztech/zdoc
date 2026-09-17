'use strict'

// Agentic whole-file translation provider. This is the file-level counterpart
// of the unit pipeline in agentRunner.js: each manifest item is translated by
// an agent session that edits the target file itself, verifies it with the
// deterministic validator, and repairs bounded rounds of violations. It is
// locale-agnostic — terminology comes from loadLocaleContract(target) and the
// optional style guide is resolved through promptNamesFor(target).style, so a
// zh-CN-reference style guide can join later without code changes.
//
// The provider emits the same translation-report envelope as agentRunner.js
// (target/locale/results/checkpoint) with file-level results only: no unit
// checkpoints are produced, and failed items carry bounded evidence for the
// existing partial-success and recovery contracts.
//
// Recovery consumption mirrors agentRunner: a preflight-produced recovery
// analysis (recovery-preflight.js) restores already-paid translated files into
// the working tree and authenticates their review receipts. For those files
// this provider re-runs only the current deterministic gate and reuses the
// bytes without a model call; everything else is translated fresh.
//
// Semantic seeds mirror agentRunner's --semantic-seeds path: a seed report
// carries per-unit translations of the previously published target whose
// English units are byte-identical to the current source. The provider
// materializes them into a pre-seeded draft before the agent session — a file
// whose every unit is seeded skips the model entirely (the deterministic gate
// still runs), and a partially seeded file is handed to the agent with
// instructions to translate only the units that are still English.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {chunkDocument} = require('./chunker')
const {loadLocaleContract, formatLocaleContract} = require('./localeContract')
const {promptNamesFor} = require('./prompts')
const {successfulReview} = require('./reviewEvidence')
const {classifyFailure} = require('./failureClassification')
const {collectCurrentUnits} = require('./semanticSeeds')
const {filterUsableSemanticCheckpoints, loadSemanticCheckpoints} = require('./semanticRecovery')
const {patchSemanticUnits, protectSemanticUnits} = require('./semanticUnits')
const {validateWithRuntimeChecks} = require('./validate-translation-file')
const {buildRecoveryIdentity, loadChunkLimits, loadRecoveryAnalysis, loadProgressState, loadSemanticSeedIndex, updateProgressState, updateFailedReferenceProgressState, writeProgressState} = require('./agentRunner')

const DEFAULT_MAX_REPAIR_TURNS = 4
const MAX_FAILURE_ERROR_LENGTH = 2000

// The unit pipeline records every successful translation into the target's
// progress state through its coordinator; the agentic provider bypasses that
// coordinator, so it applies the same progress updates itself. Cache-type
// candidates (ja-JP) merge into .translation-cache/<locale>.json, and
// reference-manifest state (zh-CN) is updated record by record exactly like
// updateReferenceProgressState does for the unit pipeline — without this the
// post-translation coverage validation treats freshly translated files as
// stale because the published translation manifest never learns the new
// source hashes.
function mergeTranslatedResultsIntoProgressState(siteDir, manifest, report) {
  const translatedAt = report.checkpoint?.generatedAt || new Date().toISOString()
  const results = (report.results || []).filter(Boolean)
  if (results.length === 0) return
  const progressState = loadProgressState(siteDir, manifest, null)
  for (const result of results) {
    const enriched = {...result, target: manifest.target}
    if (result.status === 'translated') {
      updateProgressState(siteDir, progressState, enriched, translatedAt)
    } else if (progressState.kind === 'reference-manifest') {
      updateFailedReferenceProgressState(siteDir, progressState, enriched)
    }
  }
  writeProgressState(siteDir, progressState)
}

function stylePromptPathFor(target) {
  return promptNamesFor(target).style || null
}

// Accumulates per-turn token usage reported by the Codex SDK (Turn.usage).
// Counts are additive snapshots for cost estimation only; a missing or null
// usage payload records nothing and never fails a translation turn.
function createUsageTracker({log = console} = {}) {
  const totals = {
    turns: 0,
    inputTokens: 0,
    cachedInputTokens: 0,
    cacheWriteInputTokens: 0,
    outputTokens: 0,
    reasoningOutputTokens: 0,
  }
  return {
    record({phase, sourcePath, usage}) {
      if (!usage || typeof usage !== 'object') return
      const count = value => Number(value) || 0
      totals.turns += 1
      totals.inputTokens += count(usage.input_tokens)
      totals.cachedInputTokens += count(usage.cached_input_tokens)
      totals.cacheWriteInputTokens += count(usage.cache_write_input_tokens)
      totals.outputTokens += count(usage.output_tokens)
      totals.reasoningOutputTokens += count(usage.reasoning_output_tokens)
      log.log(`[agentic-provider] usage phase=${phase || 'unknown'} file=${sourcePath || '-'} input=${count(usage.input_tokens)} cached=${count(usage.cached_input_tokens)} cache-write=${count(usage.cache_write_input_tokens)} output=${count(usage.output_tokens)} reasoning=${count(usage.reasoning_output_tokens)}`)
    },
    snapshot: () => ({...totals}),
  }
}

function protectedBytesRules() {
  return [
    '- Protected bytes must remain byte-identical — never translate, reformat, add, or remove them, even when the glossary suggests a term translation: URLs and link destinations, slug frontmatter values, heading anchors like {#some-anchor}, fenced code blocks in full (including example tables and comments inside them), inline code, commands, API names, paths, placeholders, and ESM imports.',
    '- Frontmatter: translate ONLY the values of title, sidebar_label, description, keywords. Every other key/value and the --- delimiters stay byte-identical.',
    '- Strict fidelity: translate every fact, number, step, condition, and qualifier — no omissions, no additions.',
  ].join('\n')
}

function buildAgenticTaskPrompt({item, target, siteDir, stylePromptPath, validatorCommand}) {
  const contract = formatLocaleContract(loadLocaleContract(target))
  const styleLine = stylePromptPath
    ? `The workspace file ${path.join(siteDir, '.github', 'prompts', stylePromptPath)} is the authoritative ${target} house style guide. Read it before translating and follow it.`
    : `No ${target} style guide is registered; follow the locale contract and natural ${target} developer-documentation style.`
  return `${contract}

${styleLine}

Translate one ${target} documentation page.

- Source file (read-only, never modify): ${item.sourcePath}
- Write the complete translation to: ${item.targetPath}

Rules:
- Output the full document: same headings and heading levels, same list nesting, same tables, same MDX/JSX elements.
${protectedBytesRules()}

Verification loop (best effort — the external validator gates this file either way):
1. After writing ${item.targetPath}, try to run: ${validatorCommand}
2. If the command runs, fix every VIOLATIONS entry and repeat until it prints OK, then reply with exactly: DONE.
3. If you cannot run commands in this environment, do NOT stop: writing your best complete translation to ${item.targetPath} is mandatory. Reply with exactly: DRAFT_COMPLETE. An external deterministic validator will check the file and send corrections back if needed. Never leave the file unwritten, and never fabricate a validator result.`
}

function buildSeededTaskPrompt({item, target, siteDir, stylePromptPath, validatorCommand, pendingUnits, seededUnits}) {
  const contract = formatLocaleContract(loadLocaleContract(target))
  const styleLine = stylePromptPath
    ? `The workspace file ${path.join(siteDir, '.github', 'prompts', stylePromptPath)} is the authoritative ${target} house style guide. Read it before translating and follow it.`
    : `No ${target} style guide is registered; follow the locale contract and natural ${target} developer-documentation style.`
  const boundedUnits = pendingUnits.slice(0, 60).map(unit => `- [${unit.id}] (${unit.kind}) ${String(unit.source).slice(0, 120).replaceAll('\n', ' ')}`).join('\n')
  const overflow = pendingUnits.length > 60 ? `\n(… ${pendingUnits.length - 60} more; every part of the draft that is still English must be translated.)` : ''
  return `${contract}

${styleLine}

Finish translating one ${target} documentation page from a pre-seeded draft.

- Source file (read-only, never modify): ${item.sourcePath}
- Draft file to finish: ${item.targetPath}
- ${seededUnits} semantic unit(s) in the draft are reused published translations. Keep them byte-identical — do not edit, reformat, or re-translate them, even for style consistency.
- The remaining units are still English. Translate only those, in place, keeping the document structure: same headings and heading levels, same list nesting, same tables, same MDX/JSX elements.

Units still to translate (id, kind, opening excerpt):
${boundedUnits}${overflow}

Rules:
${protectedBytesRules()}

Verification loop (best effort — the external validator gates this file either way):
1. After editing ${item.targetPath}, try to run: ${validatorCommand}
2. If the command runs, fix every VIOLATIONS entry and repeat until it prints OK, then reply with exactly: DONE.
3. If you cannot run commands in this environment, do NOT stop: writing your best complete translation to ${item.targetPath} is mandatory. Reply with exactly: DRAFT_COMPLETE. An external deterministic validator will check the file and send corrections back if needed. Never leave the file unwritten, and never fabricate a validator result.`
}

// Assemble a draft from the current source by splicing seeded translations into
// their unit ranges; units without a seed keep their English bytes. Unit ids
// and chunk tiling follow collectCurrentUnits so the ids match the seed report
// exactly.
function assembleSeededDraft({sourceContent, chunkOptions, units, usable}) {
  const chunks = chunkOptions ? chunkDocument(sourceContent, chunkOptions) : []
  if (chunks.length > 1) {
    const parts = []
    for (const chunk of chunks) {
      const prefix = `chunk.${String(chunk.index + 1).padStart(4, '0')}`
      const chunkUnits = units.filter(unit => unit.id.startsWith(`${prefix}.`))
      const patches = chunkUnits
        .filter(unit => usable.has(unit.id))
        .map(unit => ({id: unit.id, translation: usable.get(unit.id).translation}))
      parts.push(patches.length ? patchSemanticUnits(chunk.source, chunkUnits, patches) : chunk.source)
    }
    return parts.join('')
  }
  const patches = units
    .filter(unit => usable.has(unit.id))
    .map(unit => ({id: unit.id, translation: usable.get(unit.id).translation}))
  return patches.length ? patchSemanticUnits(sourceContent, units, patches) : sourceContent
}

// Resolve the seeded draft for one manifest item, or null when no seed entry
// survives validation. Throws on malformed seed reports so callers can degrade
// that single file to a fresh full translation.
function resolveSeededDraft({item, target, siteDir, chunkOptions, seedReport}) {
  if (!seedReport) return null
  const localeContract = loadLocaleContract(target)
  const sourceContent = fs.readFileSync(path.join(siteDir, item.sourcePath), 'utf8')
  const checkpoints = loadSemanticCheckpoints(seedReport, {...item, target})
  const units = collectCurrentUnits(sourceContent, chunkOptions)
  if (!units.length) return null
  const protectedUnits = protectSemanticUnits(units, unit => unit.source, {literalTokens: localeContract.doNotTranslate})
  const usable = filterUsableSemanticCheckpoints(checkpoints, protectedUnits, localeContract)
  if (!usable.size) return null
  return {
    usableCount: usable.size,
    totalUnits: units.length,
    pendingUnits: units.filter(unit => !usable.has(unit.id)),
    draft: assembleSeededDraft({sourceContent, chunkOptions, units, usable}),
  }
}

function buildRepairPrompt({item, target, violations, validatorCommand}) {
  const bounded = violations.slice(0, 30).map(violation => `- ${violation}`).join('\n')
  return `A ${target} translation draft failed deterministic validation. Fix it.

- Source file (read-only, never modify): ${item.sourcePath}
- Draft file to fix: ${item.targetPath}
- Validator: ${validatorCommand}

Violations reported by the validator just now:
${bounded}

${protectedBytesRules()}

Edit ${item.targetPath} so the listed violations are gone. If you can run the validator, iterate until it prints OK and reply with exactly: DONE. If you cannot run commands, still apply your best fix to ${item.targetPath} and reply with exactly: DRAFT_COMPLETE — the external validator will re-check the file. Never fabricate a validator result.`
}

function validatorCommandFor(siteDir, target, item) {
  return `node ${path.join('scripts', 'translation', 'validate-translation-file.js')} --site-dir ${siteDir} --target ${target} --source ${item.sourcePath} --draft ${item.targetPath} --write-back false`
}

async function runAgenticFile({item, target, siteDir, callCodex, validate, maxRepairTurns = DEFAULT_MAX_REPAIR_TURNS, stylePromptPath = stylePromptPathFor(target), model = null, log = console, seedReport = null, chunkOptions = null}) {
  if (!item || typeof item.sourcePath !== 'string' || typeof item.targetPath !== 'string') {
    throw new Error('Agentic translation requires manifest item source and target paths')
  }
  const sourceContent = fs.readFileSync(path.join(siteDir, item.sourcePath), 'utf8')
  const draftPath = path.join(siteDir, item.targetPath)
  fs.mkdirSync(path.dirname(draftPath), {recursive: true})
  const validatorCommand = validatorCommandFor(siteDir, target, item)
  const attempts = []
  let seeded = null
  if (seedReport) {
    try {
      seeded = resolveSeededDraft({item, target, siteDir, chunkOptions, seedReport})
    } catch (error) {
      // A malformed or stale seed report must never fail the file: fall back
      // to a fresh full translation and leave a trail in the log.
      log.log(`[agentic-provider] seeds unusable for ${item.sourcePath}: ${String(error?.message || error).slice(0, 300)}`)
    }
  }
  const writeDraft = content => fs.writeFileSync(draftPath, content.endsWith('\n') ? content : `${content}\n`)
  if (seeded && seeded.pendingUnits.length === 0) {
    writeDraft(seeded.draft)
    let outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
    if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
    if (!outcome.errors.length) {
      log.log(`[agentic-provider] seeded ${item.sourcePath} without a model call (${seeded.usableCount}/${seeded.totalUnits} units reused)`)
      return {...item, target, attempts, status: 'translated', review: successfulReview(), validationErrors: [], semanticSeedUnits: seeded.usableCount}
    }
    log.log(`[agentic-provider] fully seeded draft failed the current gate; retranslating ${item.sourcePath}`)
    seeded = null
  } else if (seeded) {
    writeDraft(seeded.draft)
  }
  const runTurn = async (phase, prompt) => {
    const reply = await callCodex({phase, prompt, item})
    if (!fs.existsSync(draftPath)) {
      log.log(`[agentic-provider] reply ${item.sourcePath} ${phase}: ${String(reply || '').slice(0, 2000)}`)
      throw new Error(`agentic ${phase} turn completed without writing ${item.targetPath}; agent reply tail: ${String(reply || '').slice(-800)}`)
    }
    return reply
  }
  const seededDraftBytes = seeded ? fs.readFileSync(draftPath, 'utf8') : null
  const taskPrompt = seeded
    ? buildSeededTaskPrompt({item, target, siteDir, stylePromptPath, validatorCommand, pendingUnits: seeded.pendingUnits, seededUnits: seeded.usableCount})
    : buildAgenticTaskPrompt({item, target, siteDir, stylePromptPath, validatorCommand})
  await runTurn('translate', taskPrompt)
  attempts.push('translate')
  log.log(`[agentic-provider] turn translate ${item.sourcePath}${seeded ? ` seeded=${seeded.usableCount}/${seeded.totalUnits}` : ''}`)
  if (seededDraftBytes !== null && fs.readFileSync(draftPath, 'utf8') === seededDraftBytes) {
    throw new Error(`agentic translate turn left the seeded draft of ${item.targetPath} unchanged; ${seeded.pendingUnits.length} unit(s) remain untranslated`)
  }
  let outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
  if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
  let violations = outcome.errors
  while (violations.length && attempts.length <= maxRepairTurns) {
    await runTurn(`repair${attempts.length}`, buildRepairPrompt({item, target, violations, validatorCommand}))
    attempts.push(`repair${attempts.length}`)
    log.log(`[agentic-provider] turn ${attempts.at(-1)} ${item.sourcePath}`)
    outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
    if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
    violations = outcome.errors
  }
  const base = {...item, target, attempts, ...(model ? {model} : {}), ...(seeded ? {semanticSeedUnits: seeded.usableCount} : {})}
  if (!violations.length) {
    log.log(`[agentic-provider] translated ${item.sourcePath} attempts=${attempts.join(',')}`)
    return {...base, status: 'translated', review: successfulReview(), validationErrors: []}
  }
  const error = violations.join('; ').slice(0, MAX_FAILURE_ERROR_LENGTH)
  log.log(`[agentic-provider] failed ${item.sourcePath} attempts=${attempts.join(',')}: ${error.slice(0, 200)}`)
  return {
    ...base,
    status: 'failed',
    failureCategory: classifyFailure(new Error(violations[0])),
    error,
    validationErrors: violations.slice(0, 10).map(violation => String(violation).slice(0, 400)),
  }
}

// Restored recovery files are already-paid work: preflight wrote their bytes
// into the working tree and authenticated the review receipt. The provider
// only re-runs the current deterministic gate (the same one a fresh
// translation must pass) and, on success, emits the unit pipeline's restored
// result shape. The bytes are never rewritten here: strict review receipts are
// bound to the exact on-disk hash the recovery artifact recorded, so any
// mutation would break downstream receipt chaining.
async function reuseRestoredTranslation({item, restored, target, siteDir, validate}) {
  const outcome = await validateWithRuntimeChecks({
    sourceContent: fs.readFileSync(path.join(siteDir, item.sourcePath), 'utf8'),
    draftContent: fs.readFileSync(path.join(siteDir, item.targetPath), 'utf8'),
    relPath: item.sourcePath,
    target,
    validate,
  })
  if (outcome.errors.length) return null
  return {
    ...item,
    target,
    status: 'translated',
    recovered: true,
    ...(restored.recoveryCompatibility ? {recoveryCompatibility: restored.recoveryCompatibility} : {}),
    ...(restored.recoveryReviewReceipt ? {recoveryReviewReceipt: restored.recoveryReviewReceipt} : {}),
    review: restored.review,
    validationErrors: restored.validationErrors || [],
  }
}

async function runAgenticTranslation({siteDir, manifest, callCodex, validate, maxRepairTurns, model, concurrency = 2, now = () => Date.now(), onResult = null, log = console, recovery = null, semanticSeedsDir = null, chunkOptions = null, usageTracker = null}) {
  if (!Array.isArray(manifest?.items)) throw new Error('Agentic translation requires a manifest with items')
  const seedIndex = semanticSeedsDir ? loadSemanticSeedIndex(semanticSeedsDir, manifest) : null
  const restoredByIdentity = new Map()
  for (const restored of recovery?.restored || []) {
    restoredByIdentity.set(`${restored.sourcePath}\0${restored.targetPath}`, restored)
  }
  // Workload overview for cost estimation: how many files this batch carries,
  // how many skip the model through recovery reuse, and the English source
  // volume the remaining files represent.
  const modelEligible = manifest.items.filter(item => {
    const restored = restoredByIdentity.get(`${item.sourcePath}\0${item.targetPath}`)
    return !(restored && restored.sourceHash === item.sourceHash)
  })
  const englishBytes = modelEligible.reduce((total, item) => {
    try { return total + fs.statSync(path.join(siteDir, item.sourcePath)).size } catch { return total }
  }, 0)
  log.log(`[agentic-provider] batch target=${manifest.target} locale=${manifest.locale} files=${manifest.items.length} restored=${manifest.items.length - modelEligible.length} model-files=${modelEligible.length} english=${Math.round(englishBytes / 1024)}KB`)
  const results = new Array(manifest.items.length)
  let cursor = 0
  const worker = async () => {
    while (cursor < manifest.items.length) {
      const index = cursor++
      const item = manifest.items[index]
      try {
        const restored = restoredByIdentity.get(`${item.sourcePath}\0${item.targetPath}`)
        const reused = restored && restored.sourceHash === item.sourceHash
          ? await reuseRestoredTranslation({item, restored, target: manifest.target, siteDir, validate})
          : null
        if (reused) {
          log.log(`[agentic-provider] recovered ${item.sourcePath} without a model call`)
          results[index] = reused
        } else {
          if (restored) log.log(`[agentic-provider] recovered draft for ${item.sourcePath} failed the current validation gate; retranslating`)
          const seedReportFile = seedIndex?.reportsBySourcePath.get(item.sourcePath)
          const seedReport = seedReportFile
            ? JSON.parse(fs.readFileSync(path.join(semanticSeedsDir, seedReportFile), 'utf8'))
            : null
          results[index] = await runAgenticFile({item, target: manifest.target, siteDir, callCodex, validate, maxRepairTurns, model, log, seedReport, chunkOptions})
        }
      } catch (error) {
        // One broken file (or one agent session that failed to act) must not
        // abort the whole run: record it as a bounded failed result, exactly
        // like the unit pipeline does, so TRANSLATION_ALLOW_PARTIAL can hold.
        const message = String(error?.message || error).slice(0, MAX_FAILURE_ERROR_LENGTH)
        log.log(`[agentic-provider] error ${item.sourcePath}: ${message.slice(0, 300)}`)
        results[index] = {
          ...item,
          target: manifest.target,
          attempts: [],
          status: 'failed',
          failureCategory: classifyFailure(error),
          error: message,
          validationErrors: [],
          ...(model ? {model} : {}),
        }
      }
      if (onResult) await onResult(results[index], index)
    }
  }
  await Promise.all(Array.from({length: Math.max(1, Math.min(concurrency, manifest.items.length))}, worker))
  const translated = results.filter(result => result?.status === 'translated').length
  const failed = results.filter(result => result && result.status !== 'translated').length
  const seededFull = results.filter(result => result?.status === 'translated' && result.semanticSeedUnits && Array.isArray(result.attempts) && result.attempts.length === 0).length
  const agentFiles = results.filter(result => Array.isArray(result?.attempts) && result.attempts.length > 0).length
  const repairTurns = results.reduce((total, result) => total + (Array.isArray(result?.attempts) ? result.attempts.filter(attempt => String(attempt).startsWith('repair')).length : 0), 0)
  log.log(`[agentic-provider] summary translated=${translated} failed=${failed} seeded-full=${seededFull} agent-files=${agentFiles} repair-turns=${repairTurns}`)
  if (usageTracker) {
    const usage = usageTracker.snapshot()
    log.log(`[agentic-provider] tokens turns=${usage.turns} input=${usage.inputTokens} cached=${usage.cachedInputTokens} cache-write=${usage.cacheWriteInputTokens} output=${usage.outputTokens} reasoning=${usage.reasoningOutputTokens}`)
  }
  return {
    target: manifest.target,
    locale: manifest.locale,
    results,
    checkpoint: {
      target: manifest.target,
      processed: manifest.items.length,
      remaining: 0,
      translated,
      failed,
      generatedAt: new Date(now()).toISOString(),
    },
  }
}

// Network adapter over the Codex SDK. Kept separate from the tested library
// surface above so tests inject a fake callCodex and never touch the network.
async function createCodexCall({model, baseUrl, apiKey, workingDirectory, timeoutMs = 20 * 60 * 1000, codexHome, sandboxMode = 'workspace-write', usageTracker = null}) {
  if (!['read-only', 'workspace-write', 'danger-full-access'].includes(sandboxMode)) throw new Error('Unsupported agentic sandbox mode')

  const {Codex} = await import('@openai/codex-sdk')
  if (codexHome) fs.mkdirSync(path.resolve(codexHome), {recursive: true})
  const codex = new Codex({
    config: {
      model_provider: 'agenticgateway',
      model_providers: {
        agenticgateway: {name: 'agentic gateway', base_url: baseUrl, env_key: 'AGENTIC_PROVIDER_KEY', wire_api: 'responses', query_params: {}},
      },
    },
    env: Object.fromEntries(Object.entries({
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      HOME: process.env.HOME || path.join(os.tmpdir(), 'agentic-provider-home'),
      LANG: process.env.LANG || 'en_US.UTF-8',
      TMPDIR: process.env.TMPDIR || os.tmpdir(),
      ...(codexHome ? {CODEX_HOME: codexHome} : {}),
      AGENTIC_PROVIDER_KEY: apiKey,
    }).filter(([, value]) => value !== undefined)),
  })
  return async ({phase, prompt, item}) => {
    const thread = codex.startThread({model, sandboxMode, workingDirectory, approvalPolicy: 'never', skipGitRepoCheck: true})
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error('agentic turn timeout')), timeoutMs)
    try {
      const turn = await thread.run(prompt, {signal: controller.signal})
      usageTracker?.record({phase, sourcePath: item?.sourcePath, usage: turn.usage})
      return String(turn.finalResponse || '')
    } finally {
      clearTimeout(timer)
    }
  }
}

// Preflight: one minimal agent round-trip plus file write and validator run
// on a throwaway file. Catches runner-level blockers (sandbox namespace
// failures, missing binaries) before any paid translation turn is spent.
async function preflightAgent({siteDir, callCodex, target, log = console}) {
  const token = `agentic-preflight-${Date.now()}`
  const sourcePath = path.join(siteDir, 'tmp', 'agentic-preflight', `${token}.md`)
  const draftPath = path.join(siteDir, 'tmp', 'agentic-preflight', `${token}.out.md`)
  fs.mkdirSync(path.dirname(sourcePath), {recursive: true})
  // Deliberately term-free sample: the preflight proves write/execute/report
  // mechanics, must not depend on any locale's terminology contract, and must
  // pass the deterministic gates for every target.
  fs.writeFileSync(sourcePath, `---\ntitle: Preflight\n---\n\n# Preflight\n\nThe sentinel word is zebra.\n`)
  try {
    const validatorCommand = `node ${path.join('scripts', 'translation', 'validate-translation-file.js')} --site-dir ${siteDir} --target ${target} --source tmp/agentic-preflight/${token}.md --draft tmp/agentic-preflight/${token}.out.md --write-back false`
    const prompt = `Environment smoke test.
1. Create the file ${path.relative(siteDir, draftPath)} with exactly this content:
---
title: Preflight output
---

# Preflight output

The sentinel word is still zebra.
2. Run: ${validatorCommand}
3. Reply with exactly: OK if the validator printed OK, otherwise reply with the failure output.`
    const reply = String(await callCodex({phase: 'preflight', prompt, item: {sourcePath: path.relative(siteDir, sourcePath), targetPath: path.relative(siteDir, draftPath)}}) || '')
    if (!fs.existsSync(draftPath)) {
      throw new Error(`preflight agent did not write the draft; reply: ${reply.slice(0, 600)}`)
    }
    const {errors} = await validateWithRuntimeChecks({
      sourceContent: fs.readFileSync(sourcePath, 'utf8'),
      draftContent: fs.readFileSync(draftPath, 'utf8'),
      relPath: path.relative(siteDir, sourcePath),
      target,
    })
    if (errors.length) throw new Error(`preflight draft failed validation: ${errors.join('; ').slice(0, 400)}`)
    if (!/\bOK\b/.test(reply)) {
      throw new Error(`preflight agent could not execute the validator command; reply: ${reply.slice(0, 600)}`)
    }
    log.log('[agentic-provider] preflight OK: file write, validator execution, and validator reporting all work')
    return {ok: true}
  } catch (error) {
    const message = String(error?.message || error)
    log.log(`[agentic-provider] preflight FAILED: ${message}`)
    return {ok: false, error: message}
  } finally {
    fs.rmSync(path.dirname(sourcePath), {recursive: true, force: true})
  }
}

function usage() {
  return 'Usage: node scripts/translation/agenticProvider.js run --site-dir <absolute-dir> --manifest <file> --report <file> --model <id> --base-url <url> --api-key-env <name> [--concurrency 2] [--max-repair-turns 4] [--codex-home <dir>] [--sandbox-mode <workspace-write|danger-full-access>] [--skip-preflight true] [--recovery-analysis <file>] [--semantic-seeds <dir>]'
}

function parseCliArgs(argv) {
  if (argv[0] !== 'run' || argv.length % 2 !== 1) throw new Error(usage())
  const args = new Map()
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index]
    if (!flag?.startsWith('--') || args.has(flag.slice(2))) throw new Error(usage())
    args.set(flag.slice(2), argv[index + 1])
  }
  for (const required of ['site-dir', 'manifest', 'report', 'model', 'base-url', 'api-key-env']) {
    if (!args.has(required)) throw new Error(usage())
  }
  const siteDir = path.resolve(args.get('site-dir'))
  if (!path.isAbsolute(args.get('site-dir')) || siteDir !== args.get('site-dir')) {
    throw new Error('--site-dir must be an absolute normalized path')
  }
  return {
    siteDir,
    manifestPath: args.get('manifest'),
    reportPath: args.get('report'),
    model: args.get('model'),
    baseUrl: args.get('base-url'),
    apiKeyEnv: args.get('api-key-env'),
    concurrency: Number.parseInt(args.get('concurrency') || '2', 10),
    maxRepairTurns: Number.parseInt(args.get('max-repair-turns') || String(DEFAULT_MAX_REPAIR_TURNS), 10),
    codexHome: args.get('codex-home') || null,
    sandboxMode: args.get('sandbox-mode') || 'workspace-write',
    skipPreflight: args.get('skip-preflight') === 'true',
    recoveryAnalysis: args.get('recovery-analysis') || '',
    semanticSeeds: args.get('semantic-seeds') || '',
  }
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2))
  const apiKey = process.env[options.apiKeyEnv]
  if (!apiKey) throw new Error(`environment ${options.apiKeyEnv} is required`)
  const manifest = JSON.parse(fs.readFileSync(options.manifestPath, 'utf8'))
  const recovery = options.recoveryAnalysis
    ? loadRecoveryAnalysis({
      file: path.resolve(options.recoveryAnalysis),
      manifest,
      siteDir: options.siteDir,
      identity: buildRecoveryIdentity(manifest, options.siteDir),
      chunkOptions: loadChunkLimits(),
    })
    : null
  const usageTracker = createUsageTracker()
  const callCodex = await createCodexCall({model: options.model, baseUrl: options.baseUrl, apiKey, workingDirectory: process.cwd(), codexHome: options.codexHome, sandboxMode: options.sandboxMode, usageTracker})
  // The preflight spends one paid agent turn; skip it when recovery already
  // covers every manifest item and no model call remains. Semantic seeds can
  // also eliminate every model call, but that is only knowable after per-file
  // unit collection, so a fully seeded run still pays this one bounded turn.
  const pendingWork = manifest.items.filter(item => !recovery?.restored?.some(restored => restored.sourcePath === item.sourcePath && restored.targetPath === item.targetPath && restored.sourceHash === item.sourceHash))
  if (options.skipPreflight !== true && pendingWork.length > 0) {
    const preflight = await preflightAgent({siteDir: options.siteDir, callCodex, target: manifest.target})
    if (!preflight.ok) throw new Error(`agentic preflight failed; refusing to spend translation turns. ${preflight.error}`)
  }
  const report = await runAgenticTranslation({
    siteDir: options.siteDir,
    manifest,
    callCodex,
    concurrency: options.concurrency,
    maxRepairTurns: options.maxRepairTurns,
    model: options.model,
    recovery,
    usageTracker,
    ...(options.semanticSeeds ? {semanticSeedsDir: path.resolve(options.siteDir, options.semanticSeeds), chunkOptions: loadChunkLimits()} : {}),
  })
  fs.mkdirSync(path.dirname(path.resolve(options.reportPath)), {recursive: true})
  fs.writeFileSync(options.reportPath, `${JSON.stringify(report, null, 2)}\n`)
  mergeTranslatedResultsIntoProgressState(options.siteDir, manifest, report)
  const usage = usageTracker.snapshot()
  const seededFull = report.results.filter(result => result?.status === 'translated' && result.semanticSeedUnits && Array.isArray(result.attempts) && result.attempts.length === 0).length
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, [
      `translated_count=${report.checkpoint.translated}`,
      `failed_count=${report.checkpoint.failed}`,
      `remaining_count=${report.checkpoint.remaining}`,
      `token_turns=${usage.turns}`,
      `token_input=${usage.inputTokens}`,
      `token_cached_input=${usage.cachedInputTokens}`,
      `token_output=${usage.outputTokens}`,
    ].join('\n') + '\n')
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
      '### Agentic translation cost', '',
      `- Files: ${report.checkpoint.processed} (fully seeded without a model call: ${seededFull})`,
      `- Agent turns: ${usage.turns} (cached input: ${Math.round(usage.cachedInputTokens / 1000)}K tokens)`,
      `- Input tokens: **${usage.inputTokens.toLocaleString('en-US')}**`,
      `- Output tokens: **${usage.outputTokens.toLocaleString('en-US')}** (reasoning: ${usage.reasoningOutputTokens.toLocaleString('en-US')})`,
      '',
    ].join('\n'))
  }
  const failed = report.checkpoint.failed
  if (failed && !process.env.TRANSLATION_ALLOW_PARTIAL) process.exitCode = 1
}

module.exports = {
  DEFAULT_MAX_REPAIR_TURNS,
  createUsageTracker,
  mergeTranslatedResultsIntoProgressState,
  preflightAgent,
  assembleSeededDraft,
  buildAgenticTaskPrompt,
  buildSeededTaskPrompt,
  protectedBytesRules,
  buildRepairPrompt,
  createCodexCall,
  parseCliArgs,
  resolveSeededDraft,
  reuseRestoredTranslation,
  runAgenticFile,
  runAgenticTranslation,
  stylePromptPathFor,
  validatorCommandFor,
}

if (require.main === module) {
  main().catch(error => {
    console.error(String(error?.message || error))
    if (process.env.AGENTIC_DEBUG) console.error(error?.stack)
    process.exitCode = 1
  })
}
