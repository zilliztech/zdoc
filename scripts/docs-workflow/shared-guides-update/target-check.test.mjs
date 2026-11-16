import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { targetFixture } from './fixtures/target-check-fixture.mjs'
const exec = promisify(execFile)

test('normal production CLIs hold the unregistered default with no credentials or GitHub operations', async () => {
  const root = mkdtempSync(join(tmpdir(), 'target-check-unregistered-'))
  for (const phase of ['reserve', 'validate', 'finalize']) {
    const out = join(root, phase)
    let failed
    try {
      await exec(
        process.execPath,
        [
          resolve(
            'scripts/docs-workflow/shared-guides-update/' +
              (phase === 'finalize' ? 'finalize' : 'validate') +
              '.mjs'
          )
        ],
        {
          env: {
            PATH: '/opt/homebrew/bin:/usr/bin:/bin',
            GITHUB_JOB: phase,
            VALIDATE_OUTPUT: out,
            FINALIZE_OUTPUT: out
          },
          timeout: 30000
        }
      )
    } catch (error) {
      failed = error
    }
    assert.equal(failed?.code, 1)
    assert.deepEqual(
      JSON.parse(readFileSync(join(out, 'result.json'), 'utf8')),
      {
        status: 'held',
        reasons: ['REGISTRATION_UNREGISTERED'],
        mutationRequested: false
      }
    )
    assert.deepEqual(readdirSync(out), ['result.json'])
  }
})

test('actual CLI subprocesses reserve on S, archive canonical receipt/output, finalize one exact PATCH and authenticate repeated success', async () => {
  const f = await targetFixture()
  try {
    const validated = await f.validate()
    assert.equal(validated.code, 0, validated.stdout + ' ' + validated.stderr)
    assert.equal(validated.result.status, 'prepared')
    assert.deepEqual([...f.state.validatorFiles.keys()].sort(), [
      'output.json',
      'receipt.json'
    ])
    const receipt = f.c.parseStrictJson(
      f.state.validatorFiles.get('receipt.json')
    )
    assert.deepEqual(
      Buffer.from(f.c.canonicalBytes(receipt)),
      f.state.validatorFiles.get('receipt.json')
    )
    assert.equal(receipt.targetCheckHead, f.seal)
    assert.notEqual(f.seal, f.master)
    assert.equal(receipt.targetSuiteId, 51)
    assert.deepEqual(
      f.state.writes.map((w) => [
        w.method,
        w.body.head_sha ?? w.path.split('/').at(-1)
      ]),
      [['POST', f.seal]]
    )
    const finalized = await f.invoke('finalize')
    assert.equal(finalized.code, 0, finalized.stdout + ' ' + finalized.stderr)
    assert.equal(finalized.result.status, 'accepted')
    assert.deepEqual(
      f.state.writes.map((w) => [w.method, w.path]),
      [
        ['POST', '/repos/zilliztech/zdoc/check-runs'],
        ['PATCH', '/repos/zilliztech/zdoc/check-runs/41']
      ]
    )
    assert.deepEqual(f.state.writes[1].body, {
      status: 'completed',
      conclusion: 'success'
    })
    assert.ok(finalized.result.evidence.length > 0)
    const again = await f.invoke('finalize')
    assert.equal(again.result.status, 'accepted')
    assert.equal(again.result.reused, true)
    assert.equal(f.state.writes.length, 2)
    const repeated = await f.invoke('reserve')
    assert.equal(repeated.result.status, 'held')
    assert.equal(f.state.writes.length, 2)
  } finally {
    await f.close()
  }
})

test('reserve preflight rejects producer identity/signature, stale refs, moved PR, unknown reads and candidate scripts with zero writes', async () => {
  const cases = [
    { producerActor: true },
    { producerM: true },
    { signer: 999 },
    { master: 'c'.repeat(40) },
    { dev: 'c'.repeat(40) },
    { source: 'c'.repeat(40) },
    { prHead: 'c'.repeat(40) },
    { unknownRead: true },
    { archiveDigest: true }
  ]
  const f = await targetFixture()
  try {
    for (const changes of cases) {
      f.state.changes = changes
      const result = await f.invoke('reserve')
      assert.equal(
        result.result.status,
        'held',
        JSON.stringify(changes) + result.stdout
      )
      assert.equal(f.state.writes.length, 0)
    }
  } finally {
    await f.close()
  }
  const injected = await targetFixture({ inject: true })
  try {
    const result = await injected.invoke('reserve')
    assert.equal(result.result.status, 'held')
    assert.equal(injected.state.writes.length, 0)
  } finally {
    await injected.close()
  }
})

test('finalize authenticates completed successful exact attempt before writing and rejects Check identity changes', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.validate()).result.status, 'prepared')
    for (const [status, conclusion] of [
      ['in_progress', null],
      ['completed', 'failure'],
      ['completed', 'cancelled']
    ]) {
      f.state.run31 = status
      f.state.run31Conclusion = conclusion
      assert.equal((await f.invoke('finalize')).result.status, 'held')
      assert.equal(f.state.writes.length, 1)
    }
    f.state.run31 = 'completed'
    f.state.run31Conclusion = 'success'
    for (const changes of [
      { attempt: true },
      { master: 'c'.repeat(40) },
      { dev: 'c'.repeat(40) },
      { source: 'c'.repeat(40) },
      { prHead: 'c'.repeat(40) },
      { check: { id: 99 } },
      { check: { check_suite: { id: 99 } } },
      { check: { app: { id: 99 } } },
      { check: { name: 'foreign' } },
      { check: { head_sha: 'c'.repeat(40) } },
      { unknownRead: true }
    ]) {
      f.state.changes = changes
      const result = await f.invoke('finalize')
      assert.equal(
        result.result.status,
        'held',
        JSON.stringify(changes) + result.stdout
      )
      assert.equal(f.state.writes.length, 1)
    }
  } finally {
    await f.close()
  }
})

test('finalize rejects malformed archive, receipt and output; lost mutation responses are unknown and never retried', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.validate()).result.status, 'prepared')
    const original = new Map(f.state.validatorFiles)
    const receipt = f.c.parseStrictJson(original.get('receipt.json'))
    const bad = [
      new Map([...original, ['unexpected.json', Buffer.from('{}')]]),
      new Map([...original, ['receipt.json', Buffer.from('invalid')]]),
      new Map([...original, ['output.json', Buffer.from('{}')]]),
      new Map([
        ...original,
        ['receipt.json', f.canonical({ ...receipt, targetSuiteId: 99 })]
      ])
    ]
    for (const files of bad) {
      f.state.validatorFiles = files
      assert.equal((await f.invoke('finalize')).result.status, 'held')
      assert.equal(f.state.writes.length, 1)
    }
    f.state.validatorFiles = original
    f.state.changes = { lostWrite: true }
    const lost = await f.invoke('finalize')
    assert.equal(lost.result.status, 'unknown')
    assert.equal(f.state.writes.length, 2)
    assert.match(
      readFileSync(join(lost.out, 'journal.ndjson'), 'utf8'),
      /"phase":"before"/
    )
    f.state.changes = {}
    const inspected = await f.invoke('finalize')
    assert.equal(inspected.result.status, 'accepted')
    assert.equal(inspected.result.reused, true)
    assert.equal(f.state.writes.length, 2)
  } finally {
    await f.close()
  }
  const lostReserve = await targetFixture()
  try {
    lostReserve.state.changes = { lostWrite: true }
    const first = await lostReserve.invoke('reserve')
    assert.equal(first.result.status, 'unknown')
    assert.equal(lostReserve.state.writes.length, 1)
    lostReserve.state.changes = {}
    assert.equal((await lostReserve.invoke('reserve')).result.status, 'held')
    assert.equal(lostReserve.state.writes.length, 1)
  } finally {
    await lostReserve.close()
  }
})

test('read-only validate binds reserve outputs/request and holds partial or concurrently visible reservations', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.invoke('reserve')).result.status, 'reserved')
    for (const inputs of [
      { RESERVED_CHECK_ID: '42' },
      { RESERVED_SUITE_ID: '52' },
      { REQUEST_ID: 'other-request' },
      { PRODUCER_ATTEMPT: '2' },
      { REQUEST_ID: 'x'.repeat(201) }
    ]) {
      const result = await f.invoke('validate', inputs)
      assert.equal(result.result.status, 'held')
      assert.equal(f.state.writes.length, 1)
      assert.ok(!readdirSync(result.out).includes('archive'))
    }
    // A concurrently visible second reservation is ambiguous. Neither CLI may write again.
    f.state.checks.push({ ...f.state.checks[0], id: 42 })
    const results = await Promise.all([
      f.invoke('reserve'),
      f.invoke('validate')
    ])
    assert.ok(results.every((result) => result.result.status === 'held'))
    assert.equal(f.state.writes.length, 1)
    f.state.checks = []
    const missing = await f.invoke('validate')
    assert.equal(missing.result.status, 'held')
    assert.equal(f.state.writes.length, 1)
  } finally {
    await f.close()
  }
})

test('malformed producer member bindings and raw seal signatures hold before POST', async () => {
  const f = await targetFixture()
  try {
    const original = new Map(f.state.producerFiles)
    for (const member of [
      'plan.json',
      'proof.json',
      'patch.raw',
      ...[...original.keys()].filter(
        (name) => name.startsWith('reports/') || name.startsWith('locks/')
      )
    ]) {
      f.state.producerFiles = new Map(original)
      f.state.producerFiles.set(member, Buffer.from('tampered'))
      assert.equal((await f.invoke('reserve')).result.status, 'held')
      assert.equal(f.state.writes.length, 0)
    }
    f.state.producerFiles = original
    f.state.changes = { signature: true }
    assert.equal((await f.invoke('reserve')).result.status, 'held')
    assert.equal(f.state.writes.length, 0)
  } finally {
    await f.close()
  }
})

test('finalizer rechecks freshness after prepublish and authenticates terminal failure read-only', async () => {
  const f = await targetFixture()
  try {
    assert.equal((await f.validate()).result.status, 'prepared')
    let checkReads = 0
    f.state.onRead = (path) => {
      if (path.endsWith('/check-runs') && ++checkReads === 5)
        f.state.changes.source = 'c'.repeat(40)
    }
    const raced = await f.invoke('finalize')
    assert.equal(raced.result.status, 'held')
    assert.equal(f.state.writes.length, 1)
    f.state.onRead = undefined
    f.state.changes = {}
    f.state.checks[0].status = 'completed'
    f.state.checks[0].conclusion = 'failure'
    assert.equal((await f.invoke('finalize')).result.status, 'held')
    assert.equal(f.state.writes.length, 1)
  } finally {
    await f.close()
  }
})

test('trusted registry and Actions runtime identities cannot be supplied by request data', async () => {
  const f = await targetFixture()
  try {
    for (const inputs of [
      { GITHUB_ACTOR_ID: '999' },
      { GITHUB_REPOSITORY: 'untrusted/fork' },
      { GITHUB_WORKFLOW_SHA: f.seal },
      { GITHUB_SHA: f.candidate },
      { GITHUB_RUN_ATTEMPT: '2' },
      { GITHUB_EVENT_NAME: 'pull_request' },
      {
        GITHUB_WORKFLOW_REF:
          'zilliztech/zdoc/.github/workflows/untrusted.yml@refs/heads/master'
      }
    ]) {
      assert.equal((await f.invoke('reserve', inputs)).result.status, 'held')
      assert.equal(f.state.writes.length, 0)
      assert.equal(f.state.reads.length, 0)
    }
    f.registration.policy.validator.workflowDefinitionSha256 = '0'.repeat(64)
    assert.equal((await f.invoke('reserve')).result.status, 'held')
    assert.equal(f.state.writes.length, 0)
  } finally {
    await f.close()
  }
})
