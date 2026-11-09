'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  NO_DECISIONS,
  PROPOSAL_MARKER,
  buildInterpretPrompt,
  buildProposePrompt,
  createCodexTurn,
  extractTriageEntries,
  parseArgs,
  scopeCheckDecisions,
  stripReplyMarkers,
  threadConfig,
} = require('./triage-agent.js')

const ENTRIES = [
  {from: '/docs/failed-payments', events: 1, users: 1, reason: 'no ladder resolved'},
  {from: '/docs/free-tier-overview', events: 1, users: 1, reason: 'no ladder resolved'},
]

function triageComment(entries) {
  return [
    '<!-- ga4-404-triage:v1 -->',
    '<!-- ga4-404-triage-data begin; the JSON between these markers is the machine-readable protocol -->',
    '```json',
    JSON.stringify({schema_version: 1, entries}, null, 2),
    '```',
    '<!-- ga4-404-triage-data end -->',
    '',
    '## Triage needed',
  ].join('\n')
}

function writeTemp(root, name, content) {
  const file = path.join(root, name)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, content)
  return file
}

test('threadConfig pins the agentic gateway shape the translation provider also uses', () => {
  const config = threadConfig({baseUrl: 'https://gateway.example/v1', reasoningEffort: 'low'})
  assert.equal(config.model_provider, 'agenticgateway')
  assert.equal(config.model_reasoning_summary, 'none')
  const provider = config.model_providers.agenticgateway
  assert.equal(provider.env_key, 'AGENTIC_PROVIDER_KEY')
  assert.equal(provider.wire_api, 'responses')
  assert.equal(provider.base_url, 'https://gateway.example/v1')
  assert.throws(() => threadConfig({baseUrl: 'x', reasoningEffort: 'bogus'}), /reasoning effort/)
})

test('createCodexTurn allowlists the agent env and never inherits secrets', async () => {
  const captured = {}
  const fakeCodex = class {
    constructor(options) {
      captured.config = options.config
      captured.env = options.env
    }

    startThread() {
      return {
        run: async prompt => {
          captured.prompt = prompt
          return {finalResponse: 'ok'}
        },
      }
    }
  }
  process.env.SOME_SECRET_IN_RUNNER = 'leak-me'
  try {
    const turn = await createCodexTurn({
      model: 'deepseek-flash',
      baseUrl: 'https://gateway.example/v1',
      apiKey: 'key-123',
      workingDirectory: os.tmpdir(),
      timeoutMs: 1000,
      codexHome: path.join(os.tmpdir(), 'triage-agent-test-codex-home'),
      loadSdk: async () => ({Codex: fakeCodex}),
    })
    const response = await turn({prompt: 'hello'})
    assert.equal(response, 'ok')
    assert.equal(captured.env.AGENTIC_PROVIDER_KEY, 'key-123')
    assert.equal(captured.env.SOME_SECRET_IN_RUNNER, undefined)
    for (const forbidden of ['GA4_SERVICE_ACCOUNT_JSON', 'REST_UPSTREAM_REFRESH_PAT', 'GH_TOKEN', 'AGENTIC_PROVIDER_API_KEY']) {
      assert.equal(captured.env[forbidden], undefined, `${forbidden} must not enter the agent env`)
    }
    assert.match(captured.prompt, /hello/)
  } finally {
    delete process.env.SOME_SECRET_IN_RUNNER
  }
})

test('buildProposePrompt carries the entries, the snapshot authority and the marker ban', () => {
  const prompt = buildProposePrompt({entries: ENTRIES, days: 7})
  for (const fragment of [
    '/docs/failed-payments',
    '/docs/free-tier-overview',
    'deploy/contracts/en-redirect-target-routes.json',
    'no ladder resolved',
    'declined',
    'denylist',
    'Never write the literal strings "ga4-404-reply-data begin"',
    '"ga4-404-triage-data begin" or "ga4-404-triage-data end"',
  ]) {
    assert.ok(prompt.includes(fragment), `prompt must include ${fragment}`)
  }
})

test('buildInterpretPrompt scopes the agent to triage paths and injects the verbatim comment', () => {
  const prompt = buildInterpretPrompt({entries: ENTRIES, decidedPaths: ['/docs/old-page'], freeText: 'send failed-payments to the recovery page please'})
  for (const fragment of [
    '/docs/failed-payments',
    '/docs/old-page',
    'send failed-payments to the recovery page please',
    '---COMMENT',
    NO_DECISIONS,
    'ga4-404-reply-data begin',
  ]) {
    assert.ok(prompt.includes(fragment), `prompt must include ${fragment}`)
  }
})

test('extractTriageEntries reads the last machine block and rejects broken payloads', () => {
  const older = triageComment([{from: '/docs/old', events: 1, users: 1}])
  const newer = triageComment(ENTRIES)
  const both = `${older}\n\n---\n\n${newer}`
  assert.deepEqual(extractTriageEntries(both).entries.map(entry => entry.from), ENTRIES.map(entry => entry.from))
  assert.equal(extractTriageEntries('no markers here').ok, false)
  assert.equal(extractTriageEntries('').ok, false)
  const broken = triageComment([{from: '/docs/x'}]).replace('```json', '```json\n{"entries":')
  assert.equal(extractTriageEntries(broken).ok, false)
})

test('scopeCheckDecisions rejects invented and duplicated paths', () => {
  const allowed = ENTRIES.map(entry => entry.from)
  assert.equal(scopeCheckDecisions({mappings: [{from: '/docs/failed-payments', to: '/docs/x'}]}, allowed), null)
  assert.match(scopeCheckDecisions({mappings: [{from: '/docs/invented', to: '/docs/x'}]}, allowed), /not part of the current triage/)
  assert.match(scopeCheckDecisions({mappings: [{from: '/docs/failed-payments', to: '/docs/x'}], declined: [{from: '/docs/failed-payments'}]}, allowed), /both/)
})

test('stripReplyMarkers removes live reply and triage marker literals', () => {
  const text = '<!-- ga4-404-reply-data begin --> block <!-- ga4-404-reply-data end --> <!-- ga4-404-triage-data begin -->'
  const stripped = stripReplyMarkers(text)
  assert.ok(!stripped.includes('ga4-404-reply-data begin'))
  assert.ok(!stripped.includes('ga4-404-reply-data end'))
  assert.ok(!stripped.includes('ga4-404-triage-data begin'), 'a counterfeit machine triage block must be neutralized too')
  assert.ok(stripped.includes('(reply marker elided)'))
})

test('runPropose writes an advisory proposal and neutralizes bad JSON fences', async () => {
  const triageAgent = require('./triage-agent.js')
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'triage-propose-'))
  const reportPath = writeTemp(root, 'report.json', JSON.stringify({schema_version: 1, days: 7, triage: ENTRIES}))
  const goodOutput = writeTemp(root, 'proposal-good.md', '')
  const badOutput = writeTemp(root, 'proposal-bad.md', '')

  const good = await triageAgent.runPropose({
    reportPath,
    outputPath: goodOutput,
    days: 7,
    agent: async ({prompt}) => `Summary: two paths.\n\n\`\`\`json\n${JSON.stringify({schema_version: 1, mappings: [{from: '/docs/failed-payments', to: '/docs/failed-payments-organization-recovery', note: 'renamed'}]})}\n\`\`\``,
  })
  assert.equal(good.ok, true)
  const goodBody = fs.readFileSync(goodOutput, 'utf8')
  assert.ok(goodBody.startsWith(PROPOSAL_MARKER))
  assert.ok(goodBody.includes('advisory'))
  assert.ok(goodBody.includes('/docs/failed-payments-organization-recovery'))

  await triageAgent.runPropose({
    reportPath,
    outputPath: badOutput,
    days: 7,
    agent: async () => `Evidence only.\n\n\`\`\`json\n{"schema_version": 3, "bogus": true}\n\`\`\``,
  })
  const badBody = fs.readFileSync(badOutput, 'utf8')
  assert.ok(badBody.includes('not schema-valid'))
  assert.ok(!badBody.includes('"bogus"'))

  // A marker literal in the agent's draft is stripped, not fatal: the posted
  // proposal must never carry a live reply block even when the agent misbehaves.
  const sanitizedPath = path.join(root, 'noop.md')
  const sanitized = await triageAgent.runPropose({
    reportPath,
    outputPath: sanitizedPath,
    days: 7,
    agent: async () => 'carries <!-- ga4-404-reply-data begin --> live',
  })
  assert.equal(sanitized.ok, true)
  assert.ok(!fs.readFileSync(sanitizedPath, 'utf8').includes('ga4-404-reply-data begin'))
})

test('runInterpret writes the canonical block, scopes decisions and reports no-decisions', async () => {
  const triageAgent = require('./triage-agent.js')
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'triage-interpret-'))
  const commentPath = writeTemp(root, 'comment.md', 'failed-payments should go to the recovery page, and never-redirect the other one')
  const ledgerPath = writeTemp(root, 'ledger.json', JSON.stringify({schema_version: 1, entries: [{from: '/docs/decided-elsewhere', status: 'declined'}]}))
  const replyPath = path.join(root, 'out', 'reply.md')

  const ok = await triageAgent.runInterpret({
    triageEntries: ENTRIES,
    commentPath,
    ledgerPath,
    outputPath: replyPath,
    agent: async ({prompt}) => [
      '<!-- ga4-404-reply-data begin -->',
      '```json',
      JSON.stringify({schema_version: 1, mappings: [{from: '/docs/failed-payments', to: '/docs/failed-payments-organization-recovery'}], denylist: [{from: '/docs/free-tier-overview'}]}),
      '```',
      '<!-- ga4-404-reply-data end -->',
    ].join('\n'),
  })
  assert.deepEqual(ok.counts, {mappings: 1, declined: 0, denylist: 1})
  const block = fs.readFileSync(replyPath, 'utf8')
  assert.ok(block.startsWith('<!-- ga4-404-reply-data begin -->'))
  assert.ok(block.trimEnd().endsWith('<!-- ga4-404-reply-data end -->'))

  const noDecisions = await triageAgent.runInterpret({
    triageEntries: ENTRIES,
    commentPath,
    ledgerPath,
    outputPath: path.join(root, 'out2.md'),
    agent: async () => `  ${NO_DECISIONS}  `,
  })
  assert.deepEqual(noDecisions, {ok: false, kind: 'no_decisions'})

  await assert.rejects(
    () => triageAgent.runInterpret({
      triageEntries: ENTRIES,
      commentPath,
      ledgerPath,
      outputPath: path.join(root, 'out3.md'),
      agent: async () => [
        '<!-- ga4-404-reply-data begin -->',
        '```json',
        JSON.stringify({schema_version: 1, mappings: [{from: '/docs/invented', to: '/docs/home'}]}),
        '```',
        '<!-- ga4-404-reply-data end -->',
      ].join('\n'),
    }),
    /not part of the current triage/,
  )

  await assert.rejects(
    () => triageAgent.runInterpret({
      triageEntries: ENTRIES,
      commentPath,
      ledgerPath,
      outputPath: path.join(root, 'out4.md'),
      agent: async () => 'I am not sure what you mean.',
    }),
    /did not return a reply block/,
  )

  await assert.rejects(
    () => triageAgent.runInterpret({
      triageEntries: ENTRIES,
      commentPath: writeTemp(root, 'empty.md', '\n'),
      ledgerPath,
      outputPath: path.join(root, 'out5.md'),
      agent: async () => 'x',
    }),
    /empty/,
  )
})

test('parseArgs rejects bare tokens and missing values', () => {
  assert.deepEqual(parseArgs(['--mode', 'propose', '--days', '7']), new Map([['mode', 'propose'], ['days', '7']]))
  assert.throws(() => parseArgs(['mode', 'propose']), /unexpected argument/)
  assert.throws(() => parseArgs(['--mode']), /missing value/)
})
