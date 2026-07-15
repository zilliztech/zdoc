'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { sourceCacheKey, createSourceCacheManifest, validateSourceCache } = require('./guides-source-cache')

function write(root, relative, value) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value)); return file }

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-cache-'))
  const sourceDir = path.join(root, 'sources')
  write(sourceDir, 'root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  write(sourceDir, 'doc.json', { node_token: 'doc', title: 'Doc', blocks: { items: [{ block_id: 'page', block_type: 1 }, { block_id: 'body', block_type: 2 }] } })
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(sourceDir, 'doc.json'))).digest('hex')
  const snapshot = {
    schema_version: 3, manual: 'guides', build_env: 'uat',
    records: [{ placement_type: 'canonical', doc_token: 'doc', source_file: 'doc.json', source_hash: sourceHash }],
    navigation_records: [{ record_id: 'doc', table_id: 'tbl', placement_type: 'canonical' }],
    table_digests: { tbl: 'a'.repeat(64) },
  }
  const snapshotPath = write(root, 'snapshot.json', snapshot)
  return { root, sourceDir, snapshotPath }
}

test('creates and validates a snapshot-keyed source cache manifest', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  assert.match(sourceCacheKey(f.snapshotPath), /^guides-source-v1-[0-9a-f]{64}$/)
  const manifest = createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, rootToken: 'root' })
  assert.equal(manifest.files.length, 2)
  assert.equal(validateSourceCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, rootToken: 'root' }).complete, true)
})

test('rejects tampered cached sources and snapshot identity changes', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, rootToken: 'root' })
  fs.writeFileSync(path.join(f.sourceDir, 'doc.json'), '{}')
  assert.throws(() => validateSourceCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, rootToken: 'root' }), /cache.*invalid/i)
  const snapshot = JSON.parse(fs.readFileSync(f.snapshotPath)); snapshot.generated_at = 'changed'; fs.writeFileSync(f.snapshotPath, JSON.stringify(snapshot))
  assert.throws(() => validateSourceCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, rootToken: 'root' }), /snapshot/i)
})
