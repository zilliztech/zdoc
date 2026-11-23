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
// instructions to translate only the units that are still English. A pending
// unit can itself be an identity translation (pure identifier/code text): the
// identity fast path detects that deterministically and skips the model, and
// the seeded prompt lets the agent keep such a draft unchanged by replying
// NO_TRANSLATION_NEEDED; the unchanged bytes must then pass the same
// deterministic gate as any translated draft. An unchanged draft whose reply
// lacks the marker first gets a bounded nudge turn restating the two allowed
// outcomes (production models repeatedly chose "do nothing" without the
// marker, which used to burn the whole file); only after the nudge bound is
// the draft rejected.

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
const {buildRecoveryIdentity, loadChunkLimits, loadRecoveryAnalysis, loadProgressState, loadSemanticSeedIndex, updateProgressState, updateFailedReferenceProgressState, validateTranslatedContent, writeProgressState} = require('./agentRunner')

const DEFAULT_MAX_REPAIR_TURNS = 4
const MAX_FAILURE_ERROR_LENGTH = 2000

// Reply marker exempting an unchanged seeded draft: pending "new" units can be
// pure identifier/code lines (a parameter list row, a type alias) whose correct
// zh/ja text is byte-identical to the English, so "the agent changed nothing"
// is not automatically a failure. The seeded prompt states the identity
// rule and this marker; the provider only trusts the marker after the same
// deterministic gate any translated draft must pass. Matching is line-anchored
// so a reply that merely quotes the rule inside running prose does not
// qualify. An unchanged draft WITHOUT the marker first gets bounded nudge
// turns restating the two allowed outcomes (models repeatedly chose
// "do nothing" without the marker on markup-only pending units); after the
// bound it still fails hard, so a lazy no-op cannot slip prose through — the
// residual risk is a degraded model claiming the marker on translatable
// prose, which the two independent locale runs and the deterministic gate
// bound but do not eliminate; the unchanged-drafts summary counter keeps
// that route observable.
const NO_TRANSLATION_NEEDED_MARKER = 'NO_TRANSLATION_NEEDED'
const NO_TRANSLATION_NEEDED_LINE = new RegExp('^\\s*NO_TRANSLATION_NEEDED\\s*$', 'm')

// Deterministic counterpart of the seeded prompt's identity-translation rule:
// decide whether a pending unit's current English bytes can be published as-is
// (pure markup: identifiers, parameter or type names, code, paths — no
// natural-language prose). The identity fast path uses it to splice and gate
// markup-only pending units (for example a parameter row whose type
// annotation gained a cross-link) without burning a model turn that would
// only answer NO_TRANSLATION_NEEDED. The classifier must stay conservative
// because a false "identity" verdict would leak translatable English into a
// published translation: frontmatter scalars and headings always translate,
// inline code and link destinations are protected bytes and never count as
// prose, bold parameter-name positions may hold plain lowercase words
// (**data**), and any other word must be identifier-shaped (PascalCase with
// at least two humps, camelCase, an underscore, a digit, or a single letter)
// — so plain lowercase prose (see, options) and ALL-CAPS labels (REQUIRED)
// always reject and fall back to the agent.
function isIdentityTranslationUnit(unit) {
  if (!unit || typeof unit.source !== 'string') return false
  if (unit.kind !== 'paragraph' && unit.kind !== 'table-cell') return false
  // Inline code is protected byte material in every locale, so it never
  // translates and cannot make a unit prose-shaped.
  const withoutCode = unit.source.replace(/`[^`\n]*`/g, ' ')
  // Markdown link destinations are protected bytes that may contain arbitrary
  // English words; drop them before the word scan. Parenthesized prose stays
  // and still counts against identity.
  const withoutLinkDestinations = withoutCode.replace(/\]\([^)\n]*\)/g, ']')
  return withoutLinkDestinations.split('**').every((segment, index) => segmentHasOnlyIdentityTokens(segment, index % 2 === 1))
}

function segmentHasOnlyIdentityTokens(segment, boldPosition) {
  const remainder = segment.replace(/[A-Za-z][A-Za-z0-9_]*/g, token =>
    isIdentifierShapedToken(token, boldPosition) ? ' ' : token)
  return !/[A-Za-z]/.test(remainder)
}

function isIdentifierShapedToken(token, boldPosition) {
  if (boldPosition && /^[a-z][a-z0-9_]*$/.test(token)) return true
  return /^[A-Z]$/.test(token) ||
    /^[A-Z][a-z0-9]+[A-Z][A-Za-z0-9]*$/.test(token) ||
    /^[A-Za-z0-9]*_[A-Za-z0-9_]+$/.test(token) ||
    /^[a-z]+[A-Z][A-Za-z0-9]*$/.test(token) ||
    (/[0-9]/.test(token) && /^[A-Za-z0-9.]+$/.test(token))
}

// Reasoning efforts accepted by both codex and the DeepSeek native API
// (responses gateways translate the Responses `reasoning` object into
// DeepSeek's `reasoning_effort` enum). litellm releases up to v1.100 forward
// the whole `reasoning` dict whenever it carries a `summary` key, which
// DeepSeek rejects with 422 "unknown variant `summary`" — so the wire shape
// must be `reasoning: {effort: <value>}` with summaries disabled.
// 'none' is accepted by the codex binary even though the SDK .d.ts omits it;
// codex's own 'persistent' effort is excluded (it maps to a nonstandard wire
// value DeepSeek would reject).
const AGENTIC_REASONING_EFFORTS = Object.freeze(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'ultra', 'max'])
const DEFAULT_REASONING_EFFORT = 'medium'

function codexThreadConfig({baseUrl, reasoningEffort}) {
  if (!AGENTIC_REASONING_EFFORTS.includes(reasoningEffort)) throw new Error(`reasoning effort must be one of ${AGENTIC_REASONING_EFFORTS.join(', ')}`)
  return {
    model_provider: 'agenticgateway',
    model_reasoning_effort: reasoningEffort,
    model_reasoning_summary: 'none',
    model_providers: {
      agenticgateway: {name: 'agentic gateway', base_url: baseUrl, env_key: 'AGENTIC_PROVIDER_KEY', wire_api: 'responses', query_params: {}},
    },
  }
}

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

function buildAgenticTaskPrompt({item, target, validatorCommand, styleStaged = false}) {
  const contract = formatLocaleContract(loadLocaleContract(target))
  const styleLine = stylePromptLine(target, styleStaged)
  return `${contract}

${styleLine}

Translate one ${target} documentation page.

- Source file (read-only, never modify): source.md
- Write the complete translation to: draft.md

Rules:
- Output the full document: same headings and heading levels, same list nesting, same tables, same MDX/JSX elements.
${protectedBytesRules()}

Verification loop (best effort — the external validator gates this file either way):
1. After writing draft.md, try to run: ${validatorCommand}
2. If the command runs, fix every VIOLATIONS entry and repeat until it prints OK, then reply with exactly: DONE.
3. If you cannot run commands in this environment, do NOT stop: writing your best complete translation to draft.md is mandatory. Reply with exactly: DRAFT_COMPLETE. An external deterministic validator will check the file and send corrections back if needed. Never leave the file unwritten, and never fabricate a validator result.`
}

function buildSeededTaskPrompt({item, target, validatorCommand, pendingUnits, seededUnits, styleStaged = false}) {
  const contract = formatLocaleContract(loadLocaleContract(target))
  const styleLine = stylePromptLine(target, styleStaged)
  const boundedUnits = pendingUnits.slice(0, 60).map(unit => `- [${unit.id}] (${unit.kind}) ${String(unit.source).slice(0, 120).replaceAll('\n', ' ')}`).join('\n')
  const overflow = pendingUnits.length > 60 ? `\n(… ${pendingUnits.length - 60} more; every part of the draft that is still English must be translated.)` : ''
  return `${contract}

${styleLine}

Finish translating one ${target} documentation page from a pre-seeded draft.

- Source file (read-only, never modify): source.md
- Draft file to finish: draft.md
- ${seededUnits} semantic unit(s) in the draft are reused published translations. Keep them byte-identical — do not edit, reformat, or re-translate them, even for style consistency.
- The remaining units are still English. Translate only those, in place, keeping the document structure: same headings and heading levels, same list nesting, same tables, same MDX/JSX elements.

Units still to translate (id, kind, opening excerpt):
${boundedUnits}${overflow}

Identity-translation rule: a remaining unit whose text is only identifiers, parameter or type names, code, paths, or markup (for example \`**privileges** (*PrivilegeEntity[]*) -\`) must stay byte-identical; there is nothing to translate in it. If EVERY remaining unit is of that kind, leave draft.md exactly as you received it and reply with exactly: ${NO_TRANSLATION_NEEDED_MARKER}. This is the only case in which an unchanged draft.md is correct.

Rules:
${protectedBytesRules()}

Verification loop (best effort — the external validator gates this file either way):
1. After editing draft.md, try to run: ${validatorCommand}
2. If the command runs, fix every VIOLATIONS entry and repeat until it prints OK, then reply with exactly: DONE.
3. If you cannot run commands in this environment, do NOT stop: writing your best complete translation to draft.md is mandatory. Reply with exactly: DRAFT_COMPLETE. An external deterministic validator will check the file and send corrections back if needed. Never leave the file unwritten, and never fabricate a validator result.`
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

// Agents translate inside a per-file scratch workspace outside the repository
// checkout: the codex thread's working directory anchors its context (codex
// auto-loads AGENTS.md and freely explores the tree it starts in), so a
// repository-rooted thread both bloats every paid turn with unrelated repo
// content and exposes pipeline state (tmp/translation-batch-input.json, seed
// reports) to accidental destruction by agent shell commands. The scratch
// workspace holds only staged copies of the source, the pre-seeded draft, and
// the style guide; the provider copies the finished draft back into the
// repository and runs the deterministic gates itself.
function createAgentWorkspace({scratchRoot, sourceContent, seededDraft = null, styleContent = null}) {
  const root = path.resolve(scratchRoot)
  fs.mkdirSync(root, {recursive: true})
  const dir = fs.mkdtempSync(path.join(root, 'agentic-file-'))
  fs.writeFileSync(path.join(dir, 'source.md'), sourceContent)
  if (seededDraft !== null) fs.writeFileSync(path.join(dir, 'draft.md'), seededDraft)
  if (styleContent !== null) fs.writeFileSync(path.join(dir, 'style.md'), styleContent)
  return {dir, sourcePath: path.join(dir, 'source.md'), draftPath: path.join(dir, 'draft.md')}
}

function styleGuideContent(siteDir, stylePromptPath) {
  if (!stylePromptPath) return null
  const stylePath = path.join(siteDir, '.github', 'prompts', stylePromptPath)
  return fs.existsSync(stylePath) ? fs.readFileSync(stylePath, 'utf8') : null
}

function stylePromptLine(target, styleStaged) {
  return styleStaged
    ? `The workspace file style.md is the authoritative ${target} house style guide. Read it before translating and follow it.`
    : `No ${target} style guide is registered; follow the locale contract and natural ${target} developer-documentation style.`
}

function buildRepairPrompt({item, target, violations, validatorCommand}) {
  const bounded = violations.slice(0, 30).map(violation => `- ${violation}`).join('\n')
  return `A ${target} translation draft failed deterministic validation. Fix it.

- Source file (read-only, never modify): source.md
- Draft file to fix: draft.md
- Validator: ${validatorCommand}

Violations reported by the validator just now:
${bounded}

${protectedBytesRules()}

Edit draft.md so the listed violations are gone. If you can run the validator, iterate until it prints OK and reply with exactly: DONE. If you cannot run commands, still apply your best fix to draft.md and reply with exactly: DRAFT_COMPLETE — the external validator will re-check the file. Never fabricate a validator result.`
}

// Bounded recovery for the production loop where the agent correctly leaves a
// seeded draft untouched (every pending unit is markup-only) but omits the
// exact marker line from its reply. The nudge restates the two allowed
// outcomes; a still-unchanged draft without the marker after it keeps failing
// hard, so a lazy no-op cannot slip prose through.
function buildUnchangedDraftRepairPrompt({item, target, pendingUnits, validatorCommand}) {
  const boundedUnits = pendingUnits.slice(0, 60).map(unit => `- [${unit.id}] (${unit.kind}) ${String(unit.source).slice(0, 120).replaceAll('\n', ' ')}`).join('\n')
  return `Your previous turn left draft.md byte-identical to the pre-seeded draft while ${pendingUnits.length} unit(s) are still English, and your reply did not state the marker.

- Source file (read-only, never modify): source.md
- Draft file to finish: draft.md
- Validator: ${validatorCommand}

Units still to translate (id, kind, opening excerpt):
${boundedUnits}

Decide now, exactly one of:
1. If EVERY remaining unit is markup-only (identifiers, parameter or type names, code, paths, markup — nothing to translate), leave draft.md exactly as it is and reply with exactly: ${NO_TRANSLATION_NEEDED_MARKER}
2. Otherwise translate every remaining English unit in place in draft.md — same headings and heading levels, same list nesting, same tables, same MDX/JSX elements — running ${validatorCommand} first if you can, and reply with exactly: DONE

${protectedBytesRules()}

Leaving draft.md unchanged without the exact marker on its own reply line is the only forbidden outcome.`
}

function validatorCommandFor(siteDir, target, workspace) {
  return `node ${path.join(siteDir, 'scripts', 'translation', 'validate-translation-file.js')} --site-dir ${siteDir} --target ${target} --source "${workspace.sourcePath}" --draft "${workspace.draftPath}" --write-back false`
}

async function runAgenticFile({item, target, siteDir, callCodex, validate, maxRepairTurns = DEFAULT_MAX_REPAIR_TURNS, stylePromptPath = stylePromptPathFor(target), model = null, log = console, seedReport = null, chunkOptions = null, pendingInfo = null, scratchRoot = null}) {
  if (!item || typeof item.sourcePath !== 'string' || typeof item.targetPath !== 'string') {
    throw new Error('Agentic translation requires manifest item source and target paths')
  }
  const sourceContent = fs.readFileSync(path.join(siteDir, item.sourcePath), 'utf8')
  const draftPath = path.join(siteDir, item.targetPath)
  fs.mkdirSync(path.dirname(draftPath), {recursive: true})
  // A failed candidate must leave its target byte-identical to the batch
  // baseline (assertFailedCandidatePreserved in validate-translation-batch-
  // outputs.js): snapshot whatever the materialized baseline holds before the
  // first draft write and restore it on every failed exit.
  const baselineDraftBytes = fs.existsSync(draftPath) ? fs.readFileSync(draftPath) : null
  const restoreBaselineDraft = () => {
    if (baselineDraftBytes === null) fs.rmSync(draftPath, {force: true})
    else fs.writeFileSync(draftPath, baselineDraftBytes)
  }
  // Zero-cost source preflight: run the content-intrinsic deterministic gates
  // (MDX compile + structure) on the raw source. A source that cannot pass
  // them byte-identical to itself — e.g. malformed fences whose first opening
  // runs to a distant bare closer and swallows <Tabs> openers, making tag
  // parity unsatisfiable while protected bytes must be preserved — can never
  // be satisfied by any translation, so the agent (translate + up to 4 repair
  // turns) is skipped entirely and the file fails with source evidence.
  const preflightErrors = await (validate || validateTranslatedContent)(sourceContent)
  if (preflightErrors.length) {
    restoreBaselineDraft()
    const error = `source preflight: source cannot pass the deterministic content gates even byte-identical to itself (${preflightErrors.length} violation(s)); fix the source document, retranslation cannot succeed: ${preflightErrors.join('; ').slice(0, 400)}`.slice(0, MAX_FAILURE_ERROR_LENGTH)
    log.log(`[agentic-provider] source preflight failed ${item.sourcePath} without a model call: ${String(preflightErrors[0]).slice(0, 200)}`)
    return {
      ...item,
      target,
      attempts: [],
      status: 'failed',
      failureCategory: classifyFailure(new Error(preflightErrors[0])),
      error,
      validationErrors: preflightErrors.slice(0, 10).map(violation => String(violation).slice(0, 400)),
    }
  }
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
  if (seeded) {
    // The fast path writes the seeded draft and its gate-repaired bytes
    // before the agent section's try begins; an infra-level throw here (for
    // example the validator failing to load) owes the same baseline rollback.
    try {
      writeDraft(seeded.draft)
      // Verified-current fast path: when every pending unit is "filtered" — the
      // published translation exists and its English is unchanged, but the
      // stricter per-unit seed gate rejected it while the whole-file validator
      // accepts it (protected-span content such as fenced-table column names) —
      // the assembled draft may already satisfy the full deterministic gate. In
      // that case there is nothing to translate and the agent is skipped. Drafts
      // with "new" (changed or added) English units, and legacy seed summaries
      // without classification metadata, always go to the agent: passing the
      // gate alone would risk publishing untranslated prose.
      //
      // Identity fast path: a "new" pending unit whose bytes are already the
      // correct published text (pure markup — a parameter row whose type
      // annotation gained a cross-link) would otherwise cost a model turn that
      // only answers NO_TRANSLATION_NEEDED. When every pending unit is
      // identifier-shaped by isIdentityTranslationUnit, the seeded draft (which
      // already carries those English bytes) is held to the same deterministic
      // gate; gate failures fall through to the agent exactly like the
      // filtered route.
      const allPendingIdentity = seeded.pendingUnits.length > 0 &&
        seeded.pendingUnits.every(unit => isIdentityTranslationUnit(unit))
      const allPendingFiltered = seeded.pendingUnits.length === 0 ||
        (pendingInfo !== null && seeded.pendingUnits.every(unit => pendingInfo.filtered.has(unit.id)))
      if (allPendingFiltered || allPendingIdentity) {
        let outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
        if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
        if (!outcome.errors.length) {
          if (seeded.pendingUnits.length === 0) {
            log.log(`[agentic-provider] seeded ${item.sourcePath} without a model call (${seeded.usableCount}/${seeded.totalUnits} units reused)`)
            return {...item, target, attempts, status: 'translated', review: successfulReview(), validationErrors: [], semanticSeedUnits: seeded.usableCount}
          }
          if (allPendingFiltered) {
            log.log(`[agentic-provider] verified-current ${item.sourcePath} without a model call (${seeded.usableCount}/${seeded.totalUnits} units reused, ${seeded.pendingUnits.length} pending unit(s) already satisfy the gate)`)
            return {...item, target, attempts: ['verified-current'], status: 'translated', review: successfulReview(), validationErrors: [], semanticSeedUnits: seeded.usableCount}
          }
          log.log(`[agentic-provider] identity-current ${item.sourcePath} without a model call (${seeded.usableCount}/${seeded.totalUnits} units reused, ${seeded.pendingUnits.length} markup-only pending unit(s) spliced from source)`)
          return {...item, target, attempts: ['verified-current'], status: 'translated', review: successfulReview(), validationErrors: [], semanticSeedUnits: seeded.usableCount, identityPendingAccepted: true}
        }
        if (seeded.pendingUnits.length === 0) {
          log.log(`[agentic-provider] fully seeded draft failed the current gate; retranslating ${item.sourcePath}`)
          seeded = null
        } else {
          log.log(`[agentic-provider] seeded draft failed the current gate; handing ${item.sourcePath} to the agent`)
        }
      }
    } catch (error) {
      restoreBaselineDraft()
      throw error
    }
  }
  // The agent never works in the repository: it gets a per-file scratch
  // workspace holding staged copies (source.md, the pre-seeded draft.md, and
  // the style guide) and hands its result back through draft.md, which the
  // provider copies into the repository target path. The production sandbox
  // mode is danger-full-access (GitHub-hosted runners reject the bubblewrap
  // namespace workspace-write needs), so this is context isolation, NOT a
  // write barrier: the validator command embeds absolute repository and
  // RUNNER_TEMP paths in the prompt, and a misbehaving agent can still reach
  // repository tmp/ state. Do not treat anything outside the scratch dir as
  // agent-safe; the canonical batch input lives in RUNNER_TEMP and seed
  // reports are loaded eagerly precisely because of that.
  const workspaceRoot = scratchRoot ? path.resolve(scratchRoot) : fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-workspace-'))
  const styleContent = styleGuideContent(siteDir, stylePromptPath)
  const workspace = createAgentWorkspace({
    scratchRoot: workspaceRoot,
    sourceContent,
    seededDraft: seeded ? seeded.draft : null,
    styleContent,
  })
  const validatorCommand = validatorCommandFor(siteDir, target, workspace)
  try {
    const runTurn = async (phase, prompt) => {
      const reply = await callCodex({phase, prompt, item, workingDirectory: workspace.dir})
      if (!fs.existsSync(workspace.draftPath)) {
        log.log(`[agentic-provider] reply ${item.sourcePath} ${phase}: ${String(reply || '').slice(0, 2000)}`)
        throw new Error(`agentic ${phase} turn completed without writing the workspace draft (expected draft.md in ${workspace.dir}); agent reply tail: ${String(reply || '').slice(-800)}`)
      }
      writeDraft(fs.readFileSync(workspace.draftPath, 'utf8'))
      return reply
    }
    const seededDraftBytes = seeded ? fs.readFileSync(draftPath, 'utf8') : null
    const taskPrompt = seeded
      ? buildSeededTaskPrompt({item, target, validatorCommand, pendingUnits: seeded.pendingUnits, seededUnits: seeded.usableCount, styleStaged: styleContent !== null})
      : buildAgenticTaskPrompt({item, target, validatorCommand, styleStaged: styleContent !== null})
    let reply = await runTurn('translate', taskPrompt)
    attempts.push('translate')
    log.log(`[agentic-provider] turn translate ${item.sourcePath}${seeded ? ` seeded=${seeded.usableCount}/${seeded.totalUnits}` : ''}`)
    // An unchanged seeded draft without the marker gets bounded nudge turns
    // before the hard failure: production loops show the model correctly
    // deciding "nothing to translate" but omitting the exact marker line,
    // which used to burn the whole file with no repair chance. A draft that is
    // still unchanged without the marker after the bound keeps failing hard,
    // so a lazy no-op cannot slip prose through.
    while (
      seededDraftBytes !== null &&
      fs.readFileSync(draftPath, 'utf8') === seededDraftBytes &&
      !NO_TRANSLATION_NEEDED_LINE.test(String(reply || '')) &&
      attempts.length <= maxRepairTurns
    ) {
      log.log(`[agentic-provider] unchanged seeded draft without marker; nudging ${item.sourcePath} (${attempts.length}/${maxRepairTurns})`)
      reply = await runTurn(`repair${attempts.length}`, buildUnchangedDraftRepairPrompt({item, target, pendingUnits: seeded.pendingUnits, validatorCommand}))
      attempts.push(`repair${attempts.length}`)
      log.log(`[agentic-provider] turn ${attempts.at(-1)} ${item.sourcePath}`)
    }
    const base = {...item, target, attempts, ...(model ? {model} : {}), ...(seeded ? {semanticSeedUnits: seeded.usableCount} : {})}
    let outcome
    if (seededDraftBytes !== null && fs.readFileSync(draftPath, 'utf8') === seededDraftBytes) {
      if (!NO_TRANSLATION_NEEDED_LINE.test(String(reply || ''))) {
        throw new Error(`agentic translate turn left the seeded draft of ${item.targetPath} unchanged; ${seeded.pendingUnits.length} unit(s) remain untranslated`)
      }
      // The agent claims every pending unit is an identity translation; hold
      // the unchanged draft to the same deterministic gate as a translated
      // one. Gate failures keep the normal repair loop below — the seed draft
      // itself can drift out of validity.
      outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
      if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
      if (!outcome.errors.length) {
        log.log(`[agentic-provider] unchanged seeded draft accepted ${item.sourcePath} (${seeded.usableCount}/${seeded.totalUnits} seeded, ${seeded.pendingUnits.length} pending unit(s) identical in ${target})`)
        return {...base, status: 'translated', review: successfulReview(), validationErrors: [], unchangedDraftAccepted: true}
      }
    } else {
      outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
      if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
    }
    let violations = outcome.errors
    while (violations.length && attempts.length <= maxRepairTurns) {
      await runTurn(`repair${attempts.length}`, buildRepairPrompt({item, target, violations, validatorCommand}))
      attempts.push(`repair${attempts.length}`)
      log.log(`[agentic-provider] turn ${attempts.at(-1)} ${item.sourcePath}`)
      outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
      if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
      violations = outcome.errors
    }
    if (!violations.length) {
      log.log(`[agentic-provider] translated ${item.sourcePath} attempts=${attempts.join(',')}`)
      return {...base, status: 'translated', review: successfulReview(), validationErrors: []}
    }
    const error = violations.join('; ').slice(0, MAX_FAILURE_ERROR_LENGTH)
    log.log(`[agentic-provider] failed ${item.sourcePath} attempts=${attempts.join(',')}: ${error.slice(0, 200)}`)
    restoreBaselineDraft()
    return {
      ...base,
      status: 'failed',
      failureCategory: classifyFailure(new Error(violations[0])),
      error,
      validationErrors: violations.slice(0, 10).map(violation => String(violation).slice(0, 400)),
    }
  } catch (error) {
    // Rethrown agent failures are recorded as bounded failed results by the
    // coordinator; they owe the same baseline rollback as explicit failures.
    restoreBaselineDraft()
    throw error
  } finally {
    fs.rmSync(workspace.dir, {recursive: true, force: true})
    if (!scratchRoot) fs.rmSync(workspaceRoot, {recursive: true, force: true})
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

async function runAgenticTranslation({siteDir, manifest, callCodex, validate, maxRepairTurns, model, concurrency = 2, now = () => Date.now(), onResult = null, log = console, recovery = null, semanticSeedsDir = null, chunkOptions = null, usageTracker = null, scratchRoot = null}) {
  if (!Array.isArray(manifest?.items)) throw new Error('Agentic translation requires a manifest with items')
  const seedIndex = semanticSeedsDir ? loadSemanticSeedIndex(semanticSeedsDir, manifest) : null
  for (const ignored of seedIndex?.ignoredReports || []) {
    log.log(`[agentic-provider] seed report ignored for ${ignored.sourcePath} (${ignored.reportFile}): ${ignored.reason}; translating fresh`)
  }
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
          const seedReport = seedIndex?.reportContentsBySourcePath.get(item.sourcePath) ?? null
          const pendingInfo = seedIndex?.pendingBySourcePath.get(item.sourcePath) || null
          results[index] = await runAgenticFile({item, target: manifest.target, siteDir, callCodex, validate, maxRepairTurns, model, log, seedReport, chunkOptions, pendingInfo, scratchRoot})
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
  const verifiedCurrent = results.filter(result => result?.status === 'translated' && Array.isArray(result.attempts) && result.attempts.length === 1 && result.attempts[0] === 'verified-current').length
  const agentFiles = results.filter(result => Array.isArray(result?.attempts) && result.attempts.some(attempt => attempt === 'translate' || String(attempt).startsWith('repair'))).length
  const repairTurns = results.reduce((total, result) => total + (Array.isArray(result?.attempts) ? result.attempts.filter(attempt => String(attempt).startsWith('repair')).length : 0), 0)
  const sourcePreflightFailed = results.filter(result => result?.status === 'failed' && typeof result.error === 'string' && result.error.startsWith('source preflight:')).length
  const unchangedDrafts = results.filter(result => result?.status === 'translated' && result.unchangedDraftAccepted === true).length
  const identityCurrent = results.filter(result => result?.status === 'translated' && result.identityPendingAccepted === true).length
  log.log(`[agentic-provider] summary translated=${translated} failed=${failed} seeded-full=${seededFull} verified-current=${verifiedCurrent} unchanged-drafts=${unchangedDrafts} agent-files=${agentFiles} repair-turns=${repairTurns} source-preflight-failed=${sourcePreflightFailed} identity-current=${identityCurrent}`)
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
// surface above so tests inject a fake callCodex and never touch the network;
// loadSdk exists so a test can pin this adapter's config assembly the same way.
async function createCodexCall({model, baseUrl, apiKey, workingDirectory, timeoutMs = 20 * 60 * 1000, codexHome, sandboxMode = 'workspace-write', usageTracker = null, reasoningEffort = DEFAULT_REASONING_EFFORT, loadSdk = () => import('@openai/codex-sdk')}) {
  if (!['read-only', 'workspace-write', 'danger-full-access'].includes(sandboxMode)) throw new Error('Unsupported agentic sandbox mode')

  const {Codex} = await loadSdk()
  if (codexHome) fs.mkdirSync(path.resolve(codexHome), {recursive: true})
  const codex = new Codex({
    config: codexThreadConfig({baseUrl, reasoningEffort}),
    env: Object.fromEntries(Object.entries({
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      HOME: process.env.HOME || path.join(os.tmpdir(), 'agentic-provider-home'),
      LANG: process.env.LANG || 'en_US.UTF-8',
      TMPDIR: process.env.TMPDIR || os.tmpdir(),
      ...(codexHome ? {CODEX_HOME: codexHome} : {}),
      AGENTIC_PROVIDER_KEY: apiKey,
    }).filter(([, value]) => value !== undefined)),
  })
  return async ({phase, prompt, item, workingDirectory: turnWorkingDirectory = workingDirectory}) => {
    const thread = codex.startThread({model, sandboxMode, workingDirectory: turnWorkingDirectory, approvalPolicy: 'never', skipGitRepoCheck: true})
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
async function preflightAgent({siteDir, callCodex, target, log = console, scratchRoot = null}) {
  // The preflight mirrors the production turn shape: the agent works in an
  // isolated scratch workspace (never the repository), writes draft.md there,
  // and validates it through the repository validator with absolute input
  // paths — so a sandbox-restricted runner fails here, before any paid
  // translation turn is spent.
  const workspace = createAgentWorkspace({
    scratchRoot: scratchRoot ? path.join(path.resolve(scratchRoot), 'preflight') : fs.mkdtempSync(path.join(os.tmpdir(), 'agentic-preflight-')),
    sourceContent: `---\ntitle: Preflight\n---\n\n# Preflight\n\nThe sentinel word is zebra.\n`,
  })
  const ownsRoot = !scratchRoot
  try {
    const validatorCommand = validatorCommandFor(siteDir, target, workspace)
    const prompt = `Environment smoke test.
1. Create the file draft.md in this workspace with exactly this content:
---
title: Preflight output
---

# Preflight output

The sentinel word is still zebra.
2. Run: ${validatorCommand}
3. Reply with exactly: OK if the validator printed OK, otherwise reply with the failure output.`
    const reply = String(await callCodex({phase: 'preflight', prompt, item: {sourcePath: 'source.md', targetPath: 'draft.md'}, workingDirectory: workspace.dir}) || '')
    if (!fs.existsSync(workspace.draftPath)) {
      throw new Error(`preflight agent did not write the draft; reply: ${reply.slice(0, 600)}`)
    }
    const {errors} = await validateWithRuntimeChecks({
      sourceContent: fs.readFileSync(workspace.sourcePath, 'utf8'),
      draftContent: fs.readFileSync(workspace.draftPath, 'utf8'),
      relPath: 'preflight.md',
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
    fs.rmSync(workspace.dir, {recursive: true, force: true})
    if (ownsRoot) fs.rmSync(path.dirname(workspace.dir), {recursive: true, force: true})
  }
}

function usage() {
  return `Usage: node scripts/translation/agenticProvider.js run --site-dir <absolute-dir> --manifest <file> --report <file> --model <id> --base-url <url> --api-key-env <name> [--concurrency 2] [--max-repair-turns 4] [--codex-home <dir>] [--sandbox-mode <workspace-write|danger-full-access>] [--skip-preflight true] [--recovery-analysis <file>] [--semantic-seeds <dir>] [--agent-scratch-root <dir>] [--reasoning-effort <${AGENTIC_REASONING_EFFORTS.join('|')}>]`
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
  const reasoningEffort = args.get('reasoning-effort') || DEFAULT_REASONING_EFFORT
  if (!AGENTIC_REASONING_EFFORTS.includes(reasoningEffort)) throw new Error(`--reasoning-effort must be one of ${AGENTIC_REASONING_EFFORTS.join(', ')}`)
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
    agentScratchRoot: args.get('agent-scratch-root') || null,
    reasoningEffort,
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
  const callCodex = await createCodexCall({model: options.model, baseUrl: options.baseUrl, apiKey, workingDirectory: process.cwd(), codexHome: options.codexHome, sandboxMode: options.sandboxMode, usageTracker, reasoningEffort: options.reasoningEffort})
  // The preflight spends one paid agent turn; skip it when recovery already
  // covers every manifest item and no model call remains. Semantic seeds can
  // also eliminate every model call, but that is only knowable after per-file
  // unit collection, so a fully seeded run still pays this one bounded turn.
  const pendingWork = manifest.items.filter(item => !recovery?.restored?.some(restored => restored.sourcePath === item.sourcePath && restored.targetPath === item.targetPath && restored.sourceHash === item.sourceHash))
  if (options.skipPreflight !== true && pendingWork.length > 0) {
    const preflight = await preflightAgent({siteDir: options.siteDir, callCodex, target: manifest.target, ...(options.agentScratchRoot ? {scratchRoot: options.agentScratchRoot} : {})})
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
    ...(options.agentScratchRoot ? {scratchRoot: options.agentScratchRoot} : {}),
    ...(options.semanticSeeds ? {semanticSeedsDir: path.resolve(options.siteDir, options.semanticSeeds), chunkOptions: loadChunkLimits()} : {}),
  })
  fs.mkdirSync(path.dirname(path.resolve(options.reportPath)), {recursive: true})
  fs.writeFileSync(options.reportPath, `${JSON.stringify(report, null, 2)}\n`)
  mergeTranslatedResultsIntoProgressState(options.siteDir, manifest, report)
  const usage = usageTracker.snapshot()
  const seededFull = report.results.filter(result => result?.status === 'translated' && result.semanticSeedUnits && Array.isArray(result.attempts) && result.attempts.length === 0).length
  const verifiedCurrent = report.results.filter(result => result?.status === 'translated' && Array.isArray(result.attempts) && result.attempts.length === 1 && result.attempts[0] === 'verified-current').length
  const sourcePreflightFailed = report.results.filter(result => result?.status === 'failed' && typeof result.error === 'string' && result.error.startsWith('source preflight:')).length
  const unchangedDrafts = report.results.filter(result => result?.status === 'translated' && result.unchangedDraftAccepted === true).length
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
      `- Files: ${report.checkpoint.processed} (fully seeded: ${seededFull}, verified-current: ${verifiedCurrent} — both without a model call; unchanged drafts accepted: ${unchangedDrafts}; source-preflight failed: ${sourcePreflightFailed} — skipped the model because the source itself cannot pass the gates)`,
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
  AGENTIC_REASONING_EFFORTS,
  DEFAULT_REASONING_EFFORT,
  NO_TRANSLATION_NEEDED_MARKER,
  codexThreadConfig,
  createUsageTracker,
  mergeTranslatedResultsIntoProgressState,
  preflightAgent,
  assembleSeededDraft,
  buildAgenticTaskPrompt,
  buildSeededTaskPrompt,
  buildUnchangedDraftRepairPrompt,
  isIdentityTranslationUnit,
  protectedBytesRules,
  buildRepairPrompt,
  createAgentWorkspace,
  createCodexCall,
  parseCliArgs,
  resolveSeededDraft,
  reuseRestoredTranslation,
  runAgenticFile,
  runAgenticTranslation,
  stylePromptLine,
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
