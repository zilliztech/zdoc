'use strict'

// Codex triage agent for the GA4 404 remediation loop (PR3 slice).
//
// Two one-shot modes over the same reply protocol that scripts/redirects/reply.js
// defines and the issue_comment executor applies:
//
// - propose: given the classification report's triage entries, research each
//   unresolved path against this repository checkout (routes snapshot, content
//   tree, git history) and produce the proposal comment body for the remediation
//   PR. The proposal is advisory: it is posted by github-actions[bot], which is
//   never on the executor allowlist, and its body never carries live reply
//   markers, so a quote-reply of it can never auto-apply.
// - interpret: translate an operator's free-text PR comment into exactly one
//   ga4-404-reply-data block, which the workflow then feeds to the same
//   `--reply-file` apply path the operator's own structured block would take.
//   Conf and ledger are still written only by the deterministic generator.
// - extract-triage: pull the machine triage JSON out of a PR's triage comment
//   so the interpreter runs against the same entries the operator saw.
//
// Isolation contract (mirrors scripts/translation/agenticProvider.js): the
// codex process env is an explicit allowlist — the GA4 service account and the
// push PAT never enter it — and the GitHub token of the jobs that run this
// module holds no push scope, so the IAM layer, not the prompt, enforces
// "codex never commits". Sandbox mode is danger-full-access because codex
// workspace-write needs a bubblewrap network namespace that GitHub-hosted
// runners reject (see _translate-content-group.yml); with no credentials in
// the allowlisted env a full-access sandbox still cannot write anywhere that
// matters, and the generator remains the only conf writer.

const fs = require('fs')
const os = require('os')
const path = require('path')

const {extractReplyBlock, validateMappingShape} = require('./reply')

const PROPOSAL_MARKER = '<!-- ga4-404-triage-proposal:v1 -->'
const NO_DECISIONS = 'NO_DECISIONS'
const DEFAULT_MODEL = 'deepseek-flash'
const DEFAULT_REASONING_EFFORT = 'medium'
const AGENTIC_REASONING_EFFORTS = Object.freeze(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'ultra', 'max'])
const PROPOSE_TIMEOUT_MS = 12 * 60 * 1000
const INTERPRET_TIMEOUT_MS = 8 * 60 * 1000
const DEFAULT_SANDBOX_MODE = 'danger-full-access'
const REPLY_MARKER_LITERALS = ['ga4-404-reply-data begin', 'ga4-404-reply-data end']

const ROUTES_SNAPSHOT = 'deploy/contracts/en-redirect-target-routes.json'

function threadConfig({baseUrl, reasoningEffort}) {
  if (!AGENTIC_REASONING_EFFORTS.includes(reasoningEffort)) {
    throw new Error(`reasoning effort must be one of ${AGENTIC_REASONING_EFFORTS.join(', ')}`)
  }
  return {
    model_provider: 'agenticgateway',
    model_reasoning_effort: reasoningEffort,
    model_reasoning_summary: 'none',
    model_providers: {
      agenticgateway: {name: 'agentic gateway', base_url: baseUrl, env_key: 'AGENTIC_PROVIDER_KEY', wire_api: 'responses', query_params: {}},
    },
  }
}

// One codex turn: build the client, run the prompt, return the final text.
// `loadSdk` is injectable so tests never touch the real SDK.
async function createCodexTurn({model, baseUrl, apiKey, workingDirectory, timeoutMs, codexHome, sandboxMode = DEFAULT_SANDBOX_MODE, reasoningEffort = DEFAULT_REASONING_EFFORT, loadSdk = () => import('@openai/codex-sdk')}) {
  if (!model || !baseUrl || !apiKey) throw new Error('codex turn needs model, base url and api key')
  const {Codex} = await loadSdk()
  if (codexHome) fs.mkdirSync(path.resolve(codexHome), {recursive: true})
  const codex = new Codex({
    config: threadConfig({baseUrl, reasoningEffort}),
    // Explicit env allowlist: nothing else leaks into the agent process.
    env: {
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      HOME: process.env.HOME || path.join(os.tmpdir(), 'triage-agent-home'),
      LANG: process.env.LANG || 'en_US.UTF-8',
      TMPDIR: process.env.TMPDIR || os.tmpdir(),
      ...(codexHome ? {CODEX_HOME: codexHome} : {}),
      AGENTIC_PROVIDER_KEY: apiKey,
    },
  })
  return async ({prompt}) => {
    const thread = codex.startThread({model, sandboxMode, workingDirectory, approvalPolicy: 'never', skipGitRepoCheck: true})
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error(`triage agent turn timeout after ${Math.round(timeoutMs / 60000)} minutes`)), timeoutMs)
    try {
      const turn = await thread.run(prompt, {signal: controller.signal})
      return String(turn.finalResponse || '')
    } finally {
      clearTimeout(timer)
    }
  }
}

function readEnvAgentOptions({apiKeyEnv, baseUrl, model, reasoningEffort}) {
  const apiKey = process.env[apiKeyEnv]
  if (!apiKey) throw new Error(`api key env ${apiKeyEnv} is not set; the triage agent stays disabled`)
  if (!baseUrl) throw new Error('agentic base url is not set; the triage agent stays disabled')
  const effort = reasoningEffort || DEFAULT_REASONING_EFFORT
  if (!AGENTIC_REASONING_EFFORTS.includes(effort)) {
    throw new Error(`reasoning effort must be one of ${AGENTIC_REASONING_EFFORTS.join(', ')}`)
  }
  return {model: model || DEFAULT_MODEL, baseUrl, apiKey, reasoningEffort: effort}
}

function loadReportEntries(reportPath) {
  let report
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch (error) {
    throw new Error(`cannot read triage report at ${reportPath}: ${error.message}`)
  }
  const entries = Array.isArray(report.triage) ? report.triage : []
  if (entries.length === 0) throw new Error('the report carries no triage entries')
  for (const entry of entries) {
    if (!entry || typeof entry.from !== 'string' || entry.from === '') {
      throw new Error('every triage entry needs a string from')
    }
  }
  return entries
}

// Pull the machine triage block out of one or more PR comments (the bot's
// triage comment, possibly interleaved with others). The last block wins so a
// quoted older triage never shadows the current one.
function extractTriageEntries(commentsText) {
  if (typeof commentsText !== 'string' || commentsText === '') return {ok: false, reason: 'no comment text'}
  const blocks = [...commentsText.matchAll(/<!--\s*ga4-404-triage-data begin[^>]*-->[\s\S]*?```(?:json)?[ \t]*\r?\n([\s\S]*?)```[\s\S]*?<!--\s*ga4-404-triage-data end[^>]*-->/gu)]
  if (blocks.length === 0) return {ok: false, reason: 'no ga4-404-triage-data block found'}
  let raw
  try {
    raw = JSON.parse(blocks[blocks.length - 1][1])
  } catch (error) {
    return {ok: false, reason: `triage payload is not valid JSON: ${error.message}`}
  }
  const entries = Array.isArray(raw.entries) ? raw.entries : []
  if (entries.length === 0) return {ok: false, reason: 'triage payload carries no entries'}
  for (const entry of entries) {
    if (!entry || typeof entry.from !== 'string' || entry.from === '') return {ok: false, reason: 'every triage entry needs a string from'}
  }
  return {ok: true, entries}
}

function loadLedgerDecidedPaths(ledgerPath) {
  if (!ledgerPath || !fs.existsSync(ledgerPath)) return []
  let ledger
  try {
    ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
  } catch {
    return []
  }
  return (Array.isArray(ledger.entries) ? ledger.entries : [])
    .filter(entry => entry && typeof entry.from === 'string')
    .map(entry => entry.from)
}

// The interpreter may only decide paths that are on the current triage: the
// operator saw exactly those, and the apply ledger gate alone would not stop
// an invented path from landing a brand-new rule.
function scopeCheckDecisions(mapping, allowedPaths) {
  const allowed = new Set(allowedPaths)
  const seen = new Map()
  for (const key of ['mappings', 'declined', 'denylist']) {
    for (const entry of mapping[key] ?? []) {
      if (!allowed.has(entry.from)) return `${key} path ${entry.from} is not part of the current triage`
      if (seen.has(entry.from)) return `path ${entry.from} appears under both ${seen.get(entry.from)} and ${key}`
      seen.set(entry.from, key)
    }
  }
  return null
}

function stripReplyMarkers(text) {
  let out = String(text ?? '')
  for (const literal of REPLY_MARKER_LITERALS) {
    out = out.split(literal).join('(reply marker elided)')
  }
  return out
}

function decisionCounts(mapping) {
  return {
    mappings: (mapping.mappings ?? []).length,
    declined: (mapping.declined ?? []).length,
    denylist: (mapping.denylist ?? []).length,
  }
}

function buildProposePrompt({entries, days}) {
  const entryLines = entries.map(entry => {
    const countries = Object.entries(entry.countries ?? {}).map(([name, bucket]) => `${name}=${bucket.events}e/${bucket.users}u`).join(', ') || 'unknown'
    return `- ${entry.from} (${entry.events ?? '?'} events / ${entry.users ?? '?'} users; ${countries}); probe=${JSON.stringify(entry.probe ?? {})}; ladders tried: ${(entry.attempted ?? []).join(', ') || 'none'} (${entry.reason || 'no ladder resolved'})`
  }).join('\n')
  return `You are the triage research agent for the zilliztech/zdoc documentation site's GA4 404 remediation loop.

The deterministic target ladders could not resolve the paths below (window: last ${days} days of GA4 page-not-found events). Research each one in THIS repository checkout and produce a proposal for a human operator.

Triage entries:
${entryLines}

Research rules:
- The authority for "this target exists" is the redirect routes snapshot at ${ROUTES_SNAPSHOT}. Grep it for candidate targets; a target you cannot find there must not be proposed.
- content/en holds the English source pages; git log --follow helps detect renames or retirements of a source path.
- NEVER invent a target path. If you cannot verify a confident target, recommend "declined" (do not fix this window) with a one-line reason. Recommend "denylist" only for structural never-redirect paths (test fixtures, e2e probes, bot noise).
- Propose a mapping only when the target page clearly serves the intent of the dead path.
- Do not include /ja-JP twin rules; the generator derives them mechanically.
- Never write the literal strings "ga4-404-reply-data begin" or "ga4-404-reply-data end" anywhere in your output.

Output format (markdown, no code outside the one JSON fence):
1. One-line summary.
2. A table: path | verdict (mapping/declined/denylist) | proposed target or - | evidence in a few words.
3. A short evidence paragraph per path (what you checked, what you found).
4. Exactly one fenced \`\`\`json block with the combined proposal:
{ "schema_version": 1, "mappings": [{"from": "...", "to": "...", "note": "..."}], "declined": [{"from": "...", "note": "..."}], "denylist": [{"from": "...", "note": "..."}] }
Every triage path must appear in exactly one bucket. Operators will copy this JSON into their own reply, so keep it minimal and valid.`
}

function buildInterpretPrompt({entries, decidedPaths, freeText}) {
  const entryPaths = entries.map(entry => `- ${entry.from} (${entry.events ?? '?'} events / ${entry.users ?? '?'} users; ${entry.reason || 'no ladder resolved'})`).join('\n')
  const decided = decidedPaths.length > 0 ? `\nAlready decided in the ledger (do not re-propose; only an identical decision is legal, and omitting is better):\n${decidedPaths.map(p => `- ${p}`).join('\n')}\n` : '\n'
  return `You are the triage reply interpreter for the zilliztech/zdoc GA4 404 remediation loop. Translate the operator's free-text comment into exactly one machine-readable decision block. You are a translator, not a decider: every decision must be grounded in what the operator wrote, and anything the operator did not clearly decide must be left out.

Paths on the current triage (the only ones you may decide):
${entryPaths}
${decided}
Decision semantics:
- "mappings": fix this window; "to" must be an existing route — verify candidates against the routes snapshot at ${ROUTES_SNAPSHOT} in this checkout. Never invent a target; when the operator's wording does not pin a verifiable target, use "declined" instead.
- "declined": record "do not fix this window" (ledger only, no rule).
- "denylist": record a structural never-redirect path (ledger only, tool-level rejection).
- /ja-JP twin rules are derived automatically; never include them.

The operator's comment, verbatim, between the COMMENT markers:
---COMMENT
${freeText}
---COMMENT

Output rules:
- If the comment contains at least one actionable decision for the triage paths, output exactly one block and nothing else, in this shape:
<!-- ga4-404-reply-data begin -->
\`\`\`json
{ "schema_version": 1, "mappings": [{"from": "...", "to": "...", "note": "..."}], "declined": [{"from": "...", "note": "..."}], "denylist": [{"from": "...", "note": "..."}] }
\`\`\`
<!-- ga4-404-reply-data end -->
- If the comment holds no actionable decision (chit-chat, question, approval without specifics), output exactly ${NO_DECISIONS} and nothing else.`
}

async function runPropose({reportPath, outputPath, days, agent}) {
  const entries = loadReportEntries(reportPath)
  const output = await agent({prompt: buildProposePrompt({entries, days})})
  if (output.trim() === '') throw new Error('the triage agent returned an empty proposal')
  let body = stripReplyMarkers(output)
  // Defense in depth: the proposal JSON is advisory; if it is not even
  // shape-valid, replace it with a note instead of posting machine garbage.
  const jsonFence = /```(?:json)?[ \t]*\r?\n([\s\S]*?)```/u.exec(body)
  if (jsonFence) {
    let valid = false
    try {
      valid = validateMappingShape(JSON.parse(jsonFence[1])) === null
    } catch {
      valid = false
    }
    if (!valid) {
      body = body.slice(0, jsonFence.index) + '```json\n(the combined proposal JSON was omitted: the agent\'s draft was not schema-valid; decide from the evidence above)\n```' + body.slice(jsonFence.index + jsonFence[0].length)
    }
  }
  const header = `${PROPOSAL_MARKER}\n\nCodex triage proposal for the ${entries.length} unresolved path(s) in this batch. **This comment is advisory** — it never applies anything. To act, copy the JSON you agree with into your own reply wrapped in the reply-data begin/end markers (see the triage comment's "How to answer" section).\n\n`
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), {recursive: true})
  fs.writeFileSync(outputPath, header + body.trimEnd() + '\n')
  return {ok: true, entries: entries.length, outputPath}
}

async function runInterpret({triageEntries, commentPath, ledgerPath, outputPath, agent}) {
  let freeText
  try {
    freeText = fs.readFileSync(commentPath, 'utf8')
  } catch (error) {
    throw new Error(`cannot read the comment to interpret at ${commentPath}: ${error.message}`)
  }
  if (freeText.trim() === '') throw new Error('the comment to interpret is empty')
  const decidedPaths = loadLedgerDecidedPaths(ledgerPath)
  const output = await agent({prompt: buildInterpretPrompt({entries: triageEntries, decidedPaths, freeText})})
  if (output.trim() === NO_DECISIONS || output.trim() === `"${NO_DECISIONS}"`) {
    return {ok: false, kind: 'no_decisions'}
  }
  const extracted = extractReplyBlock(output)
  if (!extracted.ok) throw new Error(`the triage agent did not return a reply block: ${extracted.reason}`)
  let mapping
  try {
    mapping = JSON.parse(extracted.payload)
  } catch (error) {
    throw new Error(`the triage agent's reply block is not valid JSON: ${error.message}`)
  }
  const invalid = validateMappingShape(mapping)
  if (invalid) throw new Error(`the triage agent's reply block is invalid: ${invalid}`)
  const outOfScope = scopeCheckDecisions(mapping, triageEntries.map(entry => entry.from))
  if (outOfScope) throw new Error(`the triage agent's reply is out of scope: ${outOfScope}`)
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), {recursive: true})
  fs.writeFileSync(outputPath, `<!-- ga4-404-reply-data begin -->\n\`\`\`json\n${JSON.stringify(mapping, null, 2)}\n\`\`\`\n<!-- ga4-404-reply-data end -->\n`)
  return {ok: true, counts: decisionCounts(mapping), outputPath}
}

function usage() {
  return `Usage: node scripts/redirects/triage-agent.js --mode <propose|interpret|extract-triage> [options]
  propose:        --report <report.json> --output <proposal.md> [--days N]
  interpret:      --triage-file <entries.json> --comment-file <comment.md> --output <reply.md> [--ledger <ledger.json>]
  extract-triage: --comment-file <comments.md> --output <entries.json>
  agent options:  --model <id> --base-url <url> --api-key-env <NAME> --reasoning-effort <level> --codex-home <dir> --working-directory <dir>`
}

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) throw new Error(`unexpected argument: ${token}`)
    const key = token.slice(2)
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) throw new Error(`missing value for --${key}`)
    args.set(key, value)
    index += 1
  }
  return args
}

async function main(argv) {
  let args
  try {
    args = parseArgs(argv)
  } catch (error) {
    console.error(usage())
    console.error(`::error::${error.message}`)
    return 2
  }
  const mode = args.get('mode')
  const workingDirectory = args.get('working-directory') || process.cwd()
  try {
    if (mode === 'extract-triage') {
      const text = fs.readFileSync(requirePath(args.get('comment-file')), 'utf8')
      const extracted = extractTriageEntries(text)
      if (!extracted.ok) throw new Error(extracted.reason)
      fs.mkdirSync(path.dirname(path.resolve(args.get('output'))), {recursive: true})
      fs.writeFileSync(args.get('output'), JSON.stringify({schema_version: 1, entries: extracted.entries}, null, 2) + '\n')
      console.log(`extract_triage=ok entries=${extracted.entries.length}`)
      return 0
    }
    const agentOptions = readEnvAgentOptions({
      apiKeyEnv: args.get('api-key-env') || 'AGENTIC_PROVIDER_API_KEY',
      baseUrl: args.get('base-url'),
      model: args.get('model'),
      reasoningEffort: args.get('reasoning-effort'),
    })
    const agent = await createCodexTurn({
      model: agentOptions.model,
      baseUrl: agentOptions.baseUrl,
      apiKey: agentOptions.apiKey,
      reasoningEffort: agentOptions.reasoningEffort,
      workingDirectory,
      codexHome: args.get('codex-home'),
      timeoutMs: mode === 'interpret' ? INTERPRET_TIMEOUT_MS : PROPOSE_TIMEOUT_MS,
    })
    if (mode === 'propose') {
      const result = await runPropose({reportPath: requirePath(args.get('report')), outputPath: requirePath(args.get('output')), days: args.get('days'), agent})
      console.log(`mode=propose entries=${result.entries} proposal=${result.outputPath}`)
      return 0
    }
    if (mode === 'interpret') {
      const triageFile = requirePath(args.get('triage-file'))
      const triage = JSON.parse(fs.readFileSync(triageFile, 'utf8'))
      const entries = Array.isArray(triage.entries) ? triage.entries : null
      if (!entries || entries.length === 0) throw new Error(`the triage file ${triageFile} carries no entries`)
      const result = await runInterpret({
        triageEntries: entries,
        commentPath: requirePath(args.get('comment-file')),
        ledgerPath: args.get('ledger'),
        outputPath: requirePath(args.get('output')),
        agent,
      })
      if (!result.ok && result.kind === 'no_decisions') {
        console.log('interpret_result=no_decisions')
        return 0
      }
      console.log(`interpret_result=ok mappings=${result.counts.mappings} declined=${result.counts.declined} denylist=${result.counts.denylist} reply=${result.outputPath}`)
      return 0
    }
    console.error(usage())
    console.error('::error::unknown mode; expected propose, interpret or extract-triage')
    return 2
  } catch (error) {
    console.error(`::error::triage agent ${mode || '(no mode)'} failed: ${stripReplyMarkers(error.message)}`)
    return 1
  }
}

function requirePath(value) {
  if (!value) throw new Error('a required --output/--report/--comment-file/--triage-file path is missing')
  return value
}

module.exports = {
  DEFAULT_MODEL,
  DEFAULT_REASONING_EFFORT,
  DEFAULT_SANDBOX_MODE,
  NO_DECISIONS,
  PROPOSAL_MARKER,
  buildInterpretPrompt,
  buildProposePrompt,
  createCodexTurn,
  extractTriageEntries,
  parseArgs,
  runInterpret,
  runPropose,
  scopeCheckDecisions,
  stripReplyMarkers,
  threadConfig,
}

if (require.main === module) {
  main(process.argv.slice(2)).then(code => {
    process.exitCode = code
  }).catch(error => {
    console.error(`::error::triage agent crashed: ${stripReplyMarkers(error.message)}`)
    process.exitCode = 1
  })
}
