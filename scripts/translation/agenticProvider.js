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

Verification loop (required):
1. After writing ${item.targetPath}, run: ${validatorCommand}
2. If it prints VIOLATIONS, fix every listed violation in ${item.targetPath} and run it again.
3. Repeat until it prints OK, then reply with exactly: DONE`
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

Edit ${item.targetPath} until the validator prints OK, then reply with exactly: DONE`
}

function validatorCommandFor(siteDir, target, item) {
  return `node ${path.join('scripts', 'translation', 'validate-translation-file.js')} --site-dir ${siteDir} --target ${target} --source ${item.sourcePath} --draft ${item.targetPath} --write-back false`
}

async function runAgenticFile({item, target, siteDir, callCodex, validate, maxRepairTurns = DEFAULT_MAX_REPAIR_TURNS, stylePromptPath = stylePromptPathFor(target), model = null}) {
  if (!item || typeof item.sourcePath !== 'string' || typeof item.targetPath !== 'string') {
    throw new Error('Agentic translation requires manifest item source and target paths')
  }
  const sourceContent = fs.readFileSync(path.join(siteDir, item.sourcePath), 'utf8')
  const draftPath = path.join(siteDir, item.targetPath)
  fs.mkdirSync(path.dirname(draftPath), {recursive: true})
  const validatorCommand = validatorCommandFor(siteDir, target, item)
  const attempts = []
  await callCodex({phase: 'translate', prompt: buildAgenticTaskPrompt({item, target, siteDir, stylePromptPath, validatorCommand}), item})
  attempts.push('translate')
  let outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
  if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
  let violations = outcome.errors
  while (violations.length && attempts.length <= maxRepairTurns) {
    await callCodex({phase: `repair${attempts.length}`, prompt: buildRepairPrompt({item, target, violations, validatorCommand}), item})
    attempts.push(`repair${attempts.length}`)
    outcome = await validateWithRuntimeChecks({sourceContent, draftContent: fs.readFileSync(draftPath, 'utf8'), relPath: item.sourcePath, target, validate})
    if (outcome.repaired !== fs.readFileSync(draftPath, 'utf8')) fs.writeFileSync(draftPath, outcome.repaired)
    violations = outcome.errors
  }
  const base = {...item, target, attempts, ...(model ? {model} : {})}
  if (!violations.length) {
    return {...base, status: 'translated', review: successfulReview(), validationErrors: []}
  }
  const error = violations.join('; ').slice(0, MAX_FAILURE_ERROR_LENGTH)
  return {
    ...base,
    status: 'failed',
    failureCategory: classifyFailure(new Error(violations[0])),
    error,
    validationErrors: violations.slice(0, 10).map(violation => String(violation).slice(0, 400)),
  }
}

async function runAgenticTranslation({siteDir, manifest, callCodex, validate, maxRepairTurns, model, concurrency = 2, now = () => Date.now(), onResult = null}) {
  if (!Array.isArray(manifest?.items)) throw new Error('Agentic translation requires a manifest with items')
  const results = new Array(manifest.items.length)
  let cursor = 0
  const worker = async () => {
    while (cursor < manifest.items.length) {
      const index = cursor++
      results[index] = await runAgenticFile({item: manifest.items[index], target: manifest.target, siteDir, callCodex, validate, maxRepairTurns, model})
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
async function createCodexCall({model, baseUrl, apiKey, workingDirectory, timeoutMs = 20 * 60 * 1000, codexHome}) {
  const {Codex} = await import('@openai/codex-sdk')
  const codex = new Codex({
    config: {
      model_provider: 'agenticgateway',
      model_providers: {
        agenticgateway: {name: 'agentic gateway', base_url: baseUrl, env_key: 'AGENTIC_PROVIDER_KEY', wire_api: 'responses', query_params: {}},
      },
    },
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      LANG: process.env.LANG || 'en_US.UTF-8',
      TMPDIR: process.env.TMPDIR || '/tmp',
      ...(codexHome ? {CODEX_HOME: codexHome} : {}),
      AGENTIC_PROVIDER_KEY: apiKey,
    },
  })
  return async ({prompt}) => {
    const thread = codex.startThread({model, sandboxMode: 'workspace-write', workingDirectory, approvalPolicy: 'never', skipGitRepoCheck: true})
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

function usage() {
  return 'Usage: node scripts/translation/agenticProvider.js run --site-dir <absolute-dir> --manifest <file> --report <file> --model <id> --base-url <url> --api-key-env <name> [--concurrency 2] [--max-repair-turns 4]'
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
  }
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2))
  const apiKey = process.env[options.apiKeyEnv]
  if (!apiKey) throw new Error(`environment ${options.apiKeyEnv} is required`)
  const manifest = JSON.parse(fs.readFileSync(options.manifest, 'utf8'))
  const callCodex = await createCodexCall({model: options.model, baseUrl: options.baseUrl, apiKey, workingDirectory: process.cwd()})
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
  const failed = report.checkpoint.failed
  if (failed && !process.env.TRANSLATION_ALLOW_PARTIAL) process.exitCode = 1
}

module.exports = {
  DEFAULT_MAX_REPAIR_TURNS,
  buildAgenticTaskPrompt,
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
    process.exitCode = 1
  })
}
