const test = require('node:test')
const assert = require('node:assert/strict')
const {DEFAULT_BASE, changedPaths, parseArgs, renderSummary, runVerifyMeta, touchesDir} = require('./verify-rest-meta')

const NODE = process.execPath
const GENERATOR = `${NODE} packages/docs-tooling/src/reference/rest/conformance/inventory/generate-inventory.mjs`
const FORMAT = `${NODE} packages/docs-tooling/src/reference/rest/index.js rest-upstream-format`
const LIFECYCLE = `${NODE} scripts/verify-rest-lifecycle-evidence.mjs`
const SELECTOR = path => `${NODE} scripts/docs-workflow/select-tests-for-changes.js --json ${path}`

function fakeSpawn(log, outcomes = {}) {
  return (file, args, options) => {
    const command = [file, ...args].join(' ')
    log.push({command, stdio: options?.stdio})
    const canned = outcomes[command]
    return {status: 0, stdout: '', stderr: '', ...(canned === undefined ? {} : canned)}
  }
}

function gitFake({tracked = [], untracked = [], inventoryDirty = ''} = {}) {
  return args => {
    if (args[0] === 'diff' && args[1] === '--name-only') return tracked.join('\n')
    if (args[0] === 'ls-files') return untracked.join('\n')
    if (args[0] === 'status') return inventoryDirty
    throw new Error(`unexpected git call: ${args.join(' ')}`)
  }
}

test('parseArgs defaults to the origin base and collects positional paths', () => {
  const args = parseArgs(['a', 'b'])
  assert.equal(args.base, DEFAULT_BASE)
  assert.equal(args.base, 'origin/master')
  assert.deepEqual(args.paths, ['a', 'b'])
  assert.equal(args.skipPnpm, false)
  assert.equal(args.json, false)
})

test('parseArgs accepts --base, flags, and a -- separator', () => {
  const args = parseArgs(['--base', 'origin/main', '--skip-pnpm', '--json', '--', 'x', '--weird'])
  assert.equal(args.base, 'origin/main')
  assert.equal(args.skipPnpm, true)
  assert.equal(args.json, true)
  assert.deepEqual(args.paths, ['x', '--weird'])
  assert.throws(() => parseArgs(['--unknown']), /Unsupported argument/)
  assert.throws(() => parseArgs(['--base']), /Usage/)
})

test('changedPaths merges tracked and untracked edits and dedupes', () => {
  const paths = changedPaths({
    base: 'origin/master',
    explicit: [],
    gitFn: gitFake({tracked: ['a.json', 'b.json'], untracked: ['b.json', 'c.test.js']}),
  })
  assert.deepEqual(paths, ['a.json', 'b.json', 'c.test.js'])
})

test('changedPaths uses explicit paths verbatim', () => {
  const paths = changedPaths({base: 'origin/master', explicit: ['one.js'], gitFn: () => {
    throw new Error('git must not run for explicit paths')
  }})
  assert.deepEqual(paths, ['one.js'])
})

test('touchesDir covers the directory itself and children, not siblings', () => {
  const dir = 'packages/x/meta/openapi'
  assert.equal(touchesDir(dir, dir), true)
  assert.equal(touchesDir(`${dir}/04.json`, dir), true)
  assert.equal(touchesDir('packages/x/meta/openapi-other/04.json', dir), false)
  assert.equal(touchesDir('packages/x/meta/lifecycle-evidence/a.json', dir), false)
})

test('a fragment edit runs the full ceremony: generator, format, union, gates, whitespace', async () => {
  const log = []
  const fragment = 'packages/docs-tooling/src/reference/rest/meta/openapi/04-vector-operations-v2.json'
  const spawnFn = fakeSpawn(log, {
    [SELECTOR(fragment)]: {stdout: `${JSON.stringify({commands: ['echo one', 'echo two']})}\n`},
  })
  const result = await runVerifyMeta({argv: [fragment], spawnFn, gitFn: gitFake({inventoryDirty: 'M schema-inventory.json'})})
  assert.equal(result.ok, true)
  const names = log.map(entry => entry.command)
  assert.equal(names[0], GENERATOR)
  assert.equal(names[1], FORMAT)
  assert.equal(names[2], SELECTOR(fragment))
  assert.deepEqual(names.slice(3), ['/bin/sh -c echo one', '/bin/sh -c echo two', 'pnpm test:rest-publication-contract', 'pnpm test:workflow-policy', `git diff --check origin/master`])
  const inventory = result.steps.find(step => step.name === 'schema-inventory')
  assert.match(inventory.detail, /commit it with the fragments/)
  assert.equal(result.steps.find(step => step.name === 'lifecycle-evidence').status, 'skipped')
})

test('a clean regeneration reports the inventory as already current', async () => {
  const log = []
  const fragment = 'packages/docs-tooling/src/reference/rest/meta/openapi/05-collection-operations-v2.json'
  const result = await runVerifyMeta({
    argv: ['--skip-pnpm', fragment],
    spawnFn: fakeSpawn(log, {[SELECTOR(fragment)]: {stdout: JSON.stringify({commands: []})}}),
    gitFn: gitFake({}),
  })
  assert.equal(result.ok, true)
  const inventory = result.steps.find(step => step.name === 'schema-inventory')
  assert.match(inventory.detail, /already current/)
  assert.equal(log.some(entry => entry.command.startsWith('pnpm')), false)
  assert.equal(result.steps.find(step => step.name === 'contract-gates').status, 'skipped')
})

test('a lifecycle-evidence edit verifies the evidence tree without the fragment generator', async () => {
  const log = []
  const evidence = 'packages/docs-tooling/src/reference/rest/meta/lifecycle-evidence/milvus-2.6.x-bootstrap.json'
  const result = await runVerifyMeta({
    argv: ['--skip-pnpm', evidence],
    spawnFn: fakeSpawn(log, {[SELECTOR(evidence)]: {stdout: JSON.stringify({commands: []})}}),
    gitFn: gitFake({}),
  })
  assert.equal(result.ok, true)
  const commands = log.map(entry => entry.command)
  assert.equal(commands.includes(GENERATOR), false)
  assert.equal(commands.includes(LIFECYCLE), true)
  assert.equal(commands.includes(FORMAT), true)
})

test('a selector throw fails the run and stops before any union command', async () => {
  const log = []
  const fragment = 'packages/docs-tooling/src/reference/rest/meta/openapi/06-database-operations-v2.json'
  const result = await runVerifyMeta({
    argv: ['--skip-pnpm', fragment],
    spawnFn: fakeSpawn(log, {[SELECTOR(fragment)]: {status: 1, stdout: '', stderr: 'unmapped path'}}),
    gitFn: gitFake({}),
  })
  assert.equal(result.ok, false)
  const union = result.steps.find(step => step.name === 'test-union')
  assert.equal(union.status, 'fail')
  assert.match(union.detail, /matrix gap/)
  assert.equal(log.some(entry => entry.command === 'echo one'), false)
})

test('a failing union command stops the ceremony at the first failure', async () => {
  const log = []
  const fragment = 'packages/docs-tooling/src/reference/rest/meta/openapi/07-index-operations-v2.json'
  const result = await runVerifyMeta({
    argv: ['--skip-pnpm', fragment],
    spawnFn: fakeSpawn(log, {
      [SELECTOR(fragment)]: {stdout: JSON.stringify({commands: ['echo good', 'echo bad', 'echo never']})},
      '/bin/sh -c echo bad': {status: 1},
    }),
    gitFn: gitFake({}),
  })
  assert.equal(result.ok, false)
  const commands = log.map(entry => entry.command)
  assert.deepEqual(commands.slice(-2), ['/bin/sh -c echo good', '/bin/sh -c echo bad'])
  assert.equal(commands.includes('/bin/sh -c echo never'), false)
  assert.equal(result.steps.find(step => step.name === 'whitespace'), undefined)
})

test('a failing contract gate stops before the whitespace check', async () => {
  const log = []
  const fragment = 'packages/docs-tooling/src/reference/rest/meta/openapi/14-privilege-group-operations-v2.json'
  const result = await runVerifyMeta({
    argv: [fragment],
    spawnFn: fakeSpawn(log, {
      [SELECTOR(fragment)]: {stdout: JSON.stringify({commands: []})},
      'pnpm test:workflow-policy': {status: 1},
    }),
    gitFn: gitFake({}),
  })
  assert.equal(result.ok, false)
  const commands = log.map(entry => entry.command)
  assert.equal(commands.includes('pnpm test:rest-publication-contract'), true)
  assert.equal(commands.includes('pnpm test:workflow-policy'), true)
  assert.equal(result.steps.find(step => step.name === 'whitespace'), undefined)
})

test('no changed paths short-circuits the ceremony', async () => {
  const log = []
  const result = await runVerifyMeta({argv: [], spawnFn: fakeSpawn(log), gitFn: gitFake({})})
  assert.equal(result.ok, true)
  assert.match(result.note, /no changed paths/)
  assert.equal(log.length, 0)
})

test('renderSummary keeps failures visible in the final line', () => {
  const failing = {
    ok: false,
    base: 'origin/master',
    changedPaths: ['a'],
    steps: [
      {name: 'schema-inventory', command: 'node gen', status: 'pass', detail: 'regenerated'},
      {name: 'canonical-bytes', command: 'node fmt', status: 'fail'},
    ],
  }
  const text = renderSummary(failing)
  assert.match(text, /\[pass\] schema-inventory: node gen — regenerated/)
  assert.match(text, /\[fail\] canonical-bytes: node fmt/)
  assert.match(text, /FAILED AT: canonical-bytes/)
  assert.match(renderSummary({ok: true, note: 'no changed paths against the base; nothing to verify'}), /verify-rest-meta: no changed paths/)
})
