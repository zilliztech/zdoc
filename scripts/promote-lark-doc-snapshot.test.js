'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

test('promotion CLI writes final publication metadata without a remote scan', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promote-snapshot-'))
  const candidate = path.join(dir, 'candidate.json')
  const output = path.join(dir, 'last-success.json')
  fs.writeFileSync(candidate, JSON.stringify({
    schema_version: 2, manual: 'guides', targets_built: [], build_env: 'uat', source_branch: null,
    publish_url: null, link_check_remote: 'https://docs.zilliz.com', generated_at: '2026-07-14T01:00:00.000Z',
    source_dir: 'plugins/lark-docs/meta/sources/guides', base_app_token: 'base-token',
    records: [{ record_id: 'rec-1', doc_token: 'doc-1', source_file: 'doc-1.json', source_hash: 'a'.repeat(64), outgoing_tokens: [] }],
  }))
  const result = spawnSync(process.execPath, ['scripts/promote-lark-doc-snapshot.js',
    '--candidate', candidate, '--output', output, '--manual', 'guides', '--build-env', 'uat',
    '--source-dir', 'plugins/lark-docs/meta/sources/guides', '--targets-built', 'zilliz.saas,zilliz.paas',
    '--source-branch', 'dev', '--publish-url', 'https://docs.cloud-uat3.zilliz.com',
    '--link-check-remote', 'https://docs.zilliz.com',
  ], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  const promoted = JSON.parse(fs.readFileSync(output, 'utf8'))
  assert.deepEqual(promoted.targets_built, ['zilliz.saas', 'zilliz.paas'])
  assert.equal(promoted.source_branch, 'dev')
  assert.equal(promoted.records[0].source_hash, 'a'.repeat(64))
  assert.doesNotMatch(result.stdout + result.stderr, /Base scan|Wiki metadata/)
})
