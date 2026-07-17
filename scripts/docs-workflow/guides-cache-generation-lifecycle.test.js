'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { generationKeys } = require('./guides-source-cache-generation')
const { sourceCacheKey } = require('./guides-source-cache')
const {
  generationPersistenceReport,
  selectPromotedSnapshotIdentity,
  writeGenerationPersistenceReport,
} = require('./guides-cache-generation-lifecycle')

function snapshot(overrides = {}) {
  return {
    schema_version: 3,
    manual: 'guides',
    build_env: 'uat',
    generated_at: '2026-07-17T00:00:00.000Z',
    base_app_token: 'base-token',
    records: [{
      record_id: 'record', placement_type: 'canonical', source_file: 'doc.json', source_hash: 'a'.repeat(64),
      doc_token: 'doc', node_token: 'node', outgoing_tokens: [],
    }],
    navigation_records: [{
      record_id: 'record', table_id: 'table', table_name: 'Tools', placement_type: 'canonical', order: 1,
      title: 'Guide', labels: 'Guide', slug: 'guide', parent_record_ids: [], targets: ['zilliz.saas'],
      progress: 'Published', doc_token: 'doc', doc_link: 'https://example.test/doc',
    }],
    table_digests: { table: 'b'.repeat(64) },
    ...overrides,
  }
}

function json(root, name, value) {
  const file = path.join(root, name)
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
  return file
}

test('unchanged valid-v4 selection preserves exact baseline bytes and the next-run restore identity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-generation-lifecycle-'))
  const baselineValue = snapshot()
  const baseline = json(root, 'baseline.json', baselineValue)
  const candidate = json(root, 'candidate.json', snapshot({
    generated_at: '2026-07-18T00:00:00.000Z',
    source_branch: 'dev',
    records: [{ ...baselineValue.records[0], title: 'Operational title ignored by stable identity' }],
  }))
  const baselineBytes = fs.readFileSync(baseline)
  const existing = generationKeys({ snapshotPath: baseline, runId: 100, runAttempt: 1 }).saveKey

  const selected = selectPromotedSnapshotIdentity({
    cacheVersion: 'v4', saveRequired: false, candidateSnapshotPath: candidate, baselineSnapshotPath: baseline,
  })

  assert.deepEqual(selected, { selection: 'baseline', snapshotPath: fs.realpathSync(baseline) })
  assert.deepEqual(fs.readFileSync(baseline), baselineBytes)
  assert.notEqual(sourceCacheKey(candidate, { version: 4 }), sourceCacheKey(baseline, { version: 4 }))
  const nextRun = generationKeys({ snapshotPath: selected.snapshotPath, runId: 101, runAttempt: 1 })
  assert.equal(nextRun.prefix, `${sourceCacheKey(baseline, { version: 4 })}-`)
  assert.equal(existing.startsWith(nextRun.prefix), true, 'next run can restore the existing full-key generation by the same prefix')
})

test('semantic changes, recovery, and legacy migration select the candidate and key the exact promoted snapshot', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-generation-lifecycle-change-'))
  const baselineValue = snapshot()
  const baseline = json(root, 'baseline.json', baselineValue)
  const recoveryCandidate = json(root, 'recovery-candidate.json', snapshot({ generated_at: '2026-07-18T00:00:00.000Z' }))
  const candidate = json(root, 'candidate.json', snapshot({
    generated_at: '2026-07-18T00:00:00.000Z',
    records: [{ ...baselineValue.records[0], source_hash: 'c'.repeat(64) }],
  }))

  assert.deepEqual(selectPromotedSnapshotIdentity({
    cacheVersion: 'v4', saveRequired: true, candidateSnapshotPath: recoveryCandidate, baselineSnapshotPath: baseline,
  }), { selection: 'candidate', snapshotPath: fs.realpathSync(recoveryCandidate) })

  for (const cacheVersion of ['v4', 'v3', 'v2', 'v1', 'none']) {
    const selected = selectPromotedSnapshotIdentity({
      cacheVersion, saveRequired: true, candidateSnapshotPath: candidate, baselineSnapshotPath: baseline,
    })
    assert.deepEqual(selected, { selection: 'candidate', snapshotPath: fs.realpathSync(candidate) })
  }

  const promoted = path.join(root, 'promoted.json')
  fs.copyFileSync(candidate, promoted)
  const keys = generationKeys({ snapshotPath: promoted, runId: 200, runAttempt: 2 })
  assert.equal(keys.saveKey.startsWith(`${sourceCacheKey(promoted, { version: 4 })}-`), true)
})

test('a no-save selection rejects non-v4 or semantically changed candidates', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-generation-lifecycle-reject-'))
  const baseline = json(root, 'baseline.json', snapshot())
  const changed = json(root, 'changed.json', snapshot({ table_digests: { table: 'c'.repeat(64) } }))
  assert.throws(() => selectPromotedSnapshotIdentity({
    cacheVersion: 'v3', saveRequired: false, candidateSnapshotPath: baseline, baselineSnapshotPath: baseline,
  }), /valid v4/i)
  assert.throws(() => selectPromotedSnapshotIdentity({
    cacheVersion: 'v4', saveRequired: false, candidateSnapshotPath: changed, baselineSnapshotPath: baseline,
  }), /semantic identity/i)
})

test('generation persistence reports saved, skipped-valid-v4, and save-failed exactly', () => {
  const generatedAt = '2026-07-17T12:00:00.000Z'
  const saveKey = `guides-source-v4-${'a'.repeat(64)}-100-1`
  assert.deepEqual(generationPersistenceReport({
    generatedAt, sourceCacheVersion: 'v4', saveRequired: false,
    preparationOutcome: 'skipped', saveOutcome: 'skipped', saveKey: null,
  }), {
    schemaVersion: 1, generated_at: generatedAt, sourceCacheVersion: 'v4', saveRequired: false,
    persistence: 'skipped-valid-v4', saveKey: null,
  })
  assert.equal(generationPersistenceReport({
    generatedAt, sourceCacheVersion: 'v3', saveRequired: true,
    preparationOutcome: 'success', saveOutcome: 'success', saveKey,
  }).persistence, 'saved')
  assert.equal(generationPersistenceReport({
    generatedAt, sourceCacheVersion: 'none', saveRequired: true,
    preparationOutcome: 'success', saveOutcome: 'failure', saveKey,
  }).persistence, 'save-failed')
  assert.throws(() => generationPersistenceReport({
    generatedAt, sourceCacheVersion: 'v3', saveRequired: true,
    preparationOutcome: 'failure', saveOutcome: 'skipped', saveKey: null,
  }), /preparation failed/i)
  assert.throws(() => generationPersistenceReport({
    generatedAt, sourceCacheVersion: 'v4', saveRequired: false,
    selectionOutcome: 'failure', manifestOutcome: 'skipped',
    preparationOutcome: 'skipped', saveOutcome: 'skipped', saveKey: null,
  }), /assembly prerequisites failed/i)

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-generation-report-'))
  const output = path.join(root, 'reports', 'guides-cache-generation.json')
  writeGenerationPersistenceReport(output, {
    generatedAt, sourceCacheVersion: 'v4', saveRequired: false,
    preparationOutcome: 'skipped', saveOutcome: 'skipped', saveKey: null,
  })
  assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), generationPersistenceReport({
    generatedAt, sourceCacheVersion: 'v4', saveRequired: false,
    preparationOutcome: 'skipped', saveOutcome: 'skipped', saveKey: null,
  }))
})

test('lifecycle CLI supports the skipped empty key and truthful failed-save outcomes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-generation-cli-'))
  const cli = path.resolve(__dirname, 'guides-cache-generation-lifecycle.js')
  const skippedOutput = path.join(root, 'skipped.json')
  const skipped = spawnSync(process.execPath, [
    cli, 'report', '--cache-version', 'v4', '--save-required', 'false',
    '--selection-outcome', 'success', '--manifest-outcome', 'success',
    '--preparation-outcome', 'skipped', '--save-outcome', 'skipped', '--save-key', '', '--output', skippedOutput,
  ], { encoding: 'utf8' })
  assert.equal(skipped.status, 0, skipped.stderr)
  assert.equal(JSON.parse(fs.readFileSync(skippedOutput, 'utf8')).persistence, 'skipped-valid-v4')

  const failedOutput = path.join(root, 'failed.json')
  const key = `guides-source-v4-${'a'.repeat(64)}-100-1`
  const failed = spawnSync(process.execPath, [
    cli, 'report', '--cache-version', 'v3', '--save-required', 'true',
    '--selection-outcome', 'success', '--manifest-outcome', 'success',
    '--preparation-outcome', 'success', '--save-outcome', 'failure', '--save-key', key, '--output', failedOutput,
  ], { encoding: 'utf8' })
  assert.equal(failed.status, 0, failed.stderr)
  assert.deepEqual(JSON.parse(fs.readFileSync(failedOutput, 'utf8')), JSON.parse(failed.stdout))
  assert.equal(JSON.parse(failed.stdout).persistence, 'save-failed')
})
