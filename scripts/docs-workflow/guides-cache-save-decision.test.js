'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { cacheSaveRequired, semanticGuidesSnapshotHash } = require('./guides-cache-save-decision')
const { sourceCacheKey } = require('./guides-source-cache')

function snapshot(overrides = {}) {
  return {
    schema_version: 3,
    manual: 'guides',
    targets_built: [],
    build_env: 'uat',
    source_branch: null,
    publish_url: null,
    link_check_remote: 'https://docs.zilliz.com',
    generated_at: '2026-07-17T00:00:00.000Z',
    source_dir: 'plugins/lark-docs/meta/sources/guides',
    base_app_token: 'base-token',
    records: [{
      record_id: 'record', table_id: 'table', table_name: 'Tools', placement_type: 'canonical',
      title: 'Guide', slug: 'guide', doc_token: 'doc', doc_link: 'https://example.test/doc',
      source_file: 'doc.json', source_hash: 'a'.repeat(64), node_token: 'node', origin_node_token: null,
      obj_token: 'object', obj_type: 'docx', obj_edit_time: '1', revision_id: 'revision',
      outgoing_tokens: ['z', 'a'], output_paths: ['docs/guide.md'], node_metadata: { revision_id: 'revision' },
    }],
    navigation_records: [{
      record_id: 'record', table_id: 'table', table_name: 'Tools', placement_type: 'canonical',
      parent_record_ids: ['parent-b', 'parent-a'], order: 2, title: 'Guide', labels: 'Guide', slug: 'guide',
      targets: ['zilliz.saas'], progress: 'Published', doc_token: 'doc', doc_link: 'https://example.test/doc',
      ref_target: null, ref_target_token: null,
    }],
    table_digests: { table: 'b'.repeat(64) },
    ...overrides,
  }
}

function json(root, name, value) {
  const file = path.join(root, name)
  fs.writeFileSync(file, JSON.stringify(value))
  return file
}

test('stable Guides identity ignores operational snapshot metadata but immutable v4 keys remain timestamp-sensitive', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-save-decision-'))
  const baselineValue = snapshot()
  const candidateValue = snapshot({
    generated_at: '2026-07-18T00:00:00.000Z',
    targets_built: ['zilliz.saas'],
    source_branch: 'dev',
    publish_url: 'https://docs.example.test',
    link_check_remote: 'https://other.example.test',
    source_dir: '/different/checkout/sources',
    records: [{
      ...baselineValue.records[0],
      table_id: 'operational-table', table_name: 'Operational', title: 'Operational title', slug: 'operational-slug',
      doc_link: 'https://operational.example.test/doc', revision_id: 'new-revision', obj_edit_time: '2',
      output_paths: ['other.md'], node_metadata: { revision_id: 'new-revision' },
    }],
  })
  const baseline = json(root, 'baseline.json', baselineValue)
  const candidate = json(root, 'candidate.json', candidateValue)

  assert.equal(semanticGuidesSnapshotHash(candidate), semanticGuidesSnapshotHash(baseline))
  assert.notEqual(sourceCacheKey(candidate, { version: 4 }), sourceCacheKey(baseline, { version: 4 }))
  assert.equal(cacheSaveRequired({ cacheVersion: 'v4', prefetchMode: 'incremental', candidateSnapshotPath: candidate, baselineSnapshotPath: baseline }), false)
})

test('stable Guides identity changes for source, ownership, navigation, and table identity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-save-decision-change-'))
  const baselineValue = snapshot()
  const baseline = json(root, 'baseline.json', baselineValue)
  const changes = [
    { ...baselineValue, base_app_token: 'other-base' },
    { ...baselineValue, records: [{ ...baselineValue.records[0], source_hash: 'c'.repeat(64) }] },
    { ...baselineValue, records: [{ ...baselineValue.records[0], outgoing_tokens: ['different'] }] },
    { ...baselineValue, navigation_records: [{ ...baselineValue.navigation_records[0], slug: 'different' }] },
    { ...baselineValue, navigation_records: [{ ...baselineValue.navigation_records[0], doc_link: 'https://example.test/other' }] },
    { ...baselineValue, table_digests: { table: 'd'.repeat(64) } },
  ]

  for (const [index, changed] of changes.entries()) {
    const candidate = json(root, `candidate-${index}.json`, changed)
    assert.equal(cacheSaveRequired({ cacheVersion: 'v4', prefetchMode: 'incremental', candidateSnapshotPath: candidate, baselineSnapshotPath: baseline }), true)
  }
})

test('legacy, recovery, and missing baseline always require a cache save', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-save-decision-forced-'))
  const candidate = json(root, 'candidate.json', snapshot())
  const baseline = json(root, 'baseline.json', snapshot({ generated_at: '2026-07-18T00:00:00.000Z' }))

  assert.equal(cacheSaveRequired({ cacheVersion: 'v3', prefetchMode: 'incremental', candidateSnapshotPath: candidate, baselineSnapshotPath: baseline }), true)
  assert.equal(cacheSaveRequired({ cacheVersion: 'v4', prefetchMode: 'recovery', candidateSnapshotPath: candidate, baselineSnapshotPath: baseline }), true)
  assert.equal(cacheSaveRequired({ cacheVersion: 'v4', prefetchMode: 'incremental', candidateSnapshotPath: candidate, baselineSnapshotPath: path.join(root, 'missing.json') }), true)
  const invalidBaseline = json(root, 'invalid-baseline.json', { schema_version: 2, manual: 'guides' })
  assert.equal(cacheSaveRequired({ cacheVersion: 'v4', prefetchMode: 'incremental', candidateSnapshotPath: candidate, baselineSnapshotPath: invalidBaseline }), true)

  const cli = path.resolve(__dirname, 'guides-cache-save-decision.js')
  const result = spawnSync(process.execPath, [
    cli, 'decide', '--cache-version', 'v4', '--prefetch-mode', 'incremental',
    '--candidate', candidate, '--baseline', baseline,
  ], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout.trim(), 'false')
})
