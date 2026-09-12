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

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {loadLocaleContract, formatLocaleContract} = require('./localeContract')
const {promptNamesFor} = require('./prompts')
const {successfulReview} = require('./reviewEvidence')
const {classifyFailure} = require('./failureClassification')
const {validateWithRuntimeChecks} = require('./validate-translation-file')

const DEFAULT_MAX_REPAIR_TURNS = 4
const MAX_FAILURE_ERROR_LENGTH = 2000

function stylePromptPathFor(target) {
  return promptNamesFor(target).style || null
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

async function runAgenticFile({item, target, siteDir, callCodex, validate, maxRepairTurns = DEFAULT_MAX_REPAIR_TURNS, stylePromptPath = stylePromptPathFor(target), model = null, log = console}) {
  if (!item || typeof item.sourcePath !== 'string' || typeof item.targetPath !== 'string') {
    throw new Error('Agentic translation requires manifest item source and target paths')
  }
  const sourceContent = fs.readFileSync(path.join(siteDir, item.sourcePath), 'utf8')
  const draftPath = path.join(siteDir, item.targetPath)
  fs.mkdirSync(path.dirname(draftPath), {recursive: true})
  const validatorCommand = validatorCommandFor(siteDir, target, item)
  const attempts = []
  const runTurn = async (phase, prompt) => {
    const reply = await callCodex({phase, prompt, item})
    if (!fs.existsSync(draftPath)) {
      log.log(`[agentic-provider] reply ${item.sourcePath} ${phase}: ${String(reply || '').slice(0, 2000)}`)
      throw new Error(`agentic ${phase} turn completed without writing ${item.targetPath}; agent reply tail: ${String(reply || '').slice(-800)}`)
    }
    return reply
  }
  await runTurn('translate', buildAgenticTaskPrompt({item, target, siteDir, stylePromptPath, validatorCommand}))
  attempts.push('translate')
  log.log(`[agentic-provider] turn translate ${item.sourcePath}`)
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
  const base = {...item, target, attempts, ...(model ? {model} : {})}
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

async function runAgenticTranslation({siteDir, manifest, callCodex, validate, maxRepairTurns, model, concurrency = 2, now = () => Date.now(), onResult = null, log = console}) {
  if (!Array.isArray(manifest?.items)) throw new Error('Agentic translation requires a manifest with items')
  const results = new Array(manifest.items.length)
  let cursor = 0
  const worker = async () => {
    while (cursor < manifest.items.length) {
      const index = cursor++
      const item = manifest.items[index]
      try {
        results[index] = await runAgenticFile({item, target: manifest.target, siteDir, callCodex, validate, maxRepairTurns, model, log})
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
async function createCodexCall({model, baseUrl, apiKey, workingDirectory, timeoutMs = 20 * 60 * 1000, codexHome, sandboxMode = 'workspace-write'}) {
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
  return async ({prompt}) => {
    const thread = codex.startThread({model, sandboxMode, workingDirectory, approvalPolicy: 'never', skipGitRepoCheck: true})
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error('agentic turn timeout')), timeoutMs)
    try {
      const turn = await thread.run(prompt, {signal: controller.signal})
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
  return 'Usage: node scripts/translation/agenticProvider.js run --site-dir <absolute-dir> --manifest <file> --report <file> --model <id> --base-url <url> --api-key-env <name> [--concurrency 2] [--max-repair-turns 4] [--codex-home <dir>] [--sandbox-mode <workspace-write|danger-full-access>] [--skip-preflight true]'
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
  }
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2))
  const apiKey = process.env[options.apiKeyEnv]
  if (!apiKey) throw new Error(`environment ${options.apiKeyEnv} is required`)
  const manifest = JSON.parse(fs.readFileSync(options.manifestPath, 'utf8'))
  const callCodex = await createCodexCall({model: options.model, baseUrl: options.baseUrl, apiKey, workingDirectory: process.cwd(), codexHome: options.codexHome, sandboxMode: options.sandboxMode})
  if (options.skipPreflight !== true) {
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
  })
  fs.mkdirSync(path.dirname(path.resolve(options.reportPath)), {recursive: true})
  fs.writeFileSync(options.reportPath, `${JSON.stringify(report, null, 2)}\n`)
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, [
      `translated_count=${report.checkpoint.translated}`,
      `failed_count=${report.checkpoint.failed}`,
      `remaining_count=${report.checkpoint.remaining}`,
    ].join('\n') + '\n')
  }
  const failed = report.checkpoint.failed
  if (failed && !process.env.TRANSLATION_ALLOW_PARTIAL) process.exitCode = 1
}

module.exports = {
  DEFAULT_MAX_REPAIR_TURNS,
  preflightAgent,
  buildAgenticTaskPrompt,
  protectedBytesRules,
  buildRepairPrompt,
  createCodexCall,
  parseCliArgs,
  runAgenticFile,
  runAgenticTranslation,
  stylePromptPathFor,
  usage,
  validatorCommandFor,
}

if (require.main === module) {
  main().catch(error => {
    console.error(String(error?.message || error))
    if (process.env.AGENTIC_DEBUG) console.error(error?.stack)
    process.exitCode = 1
  })
}
