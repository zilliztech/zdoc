'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { hashSnapshot } = require('../../plugins/lark-docs/sourceCompleteness')
const { sourceCacheKey, createSourceCacheManifest, validateMediaCache, validateSourceCache } = require('./guides-source-cache')

function write(root, relative, value) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value)); return file }

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-cache-'))
  const sourceDir = path.join(root, 'sources')
  write(sourceDir, 'root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  write(sourceDir, 'doc.json', { node_token: 'doc', title: 'Doc', blocks: { items: [{ block_id: 'page', block_type: 1 }, { block_id: 'image', image: { token: 'image', caption: { content: 'Image' } } }] } })
  write(sourceDir, 'orphan.json', { node_token: 'orphan', blocks: { items: [{ iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/deleted/Name?node-id=1-2') } } }] } })
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(sourceDir, 'doc.json'))).digest('hex')
  const snapshot = {
    schema_version: 3, manual: 'guides', build_env: 'uat',
    records: [{ placement_type: 'canonical', doc_token: 'doc', source_file: 'doc.json', source_hash: sourceHash }],
    navigation_records: [{ record_id: 'doc', table_id: 'tbl', placement_type: 'canonical' }],
    table_digests: { tbl: 'a'.repeat(64) },
  }
  const snapshotPath = write(root, 'snapshot.json', snapshot)
  const mediaManifestPath = write(root, 'guides.json', {
    schemaVersion: 1,
    entries: [{ id: 'feishu-image:image', type: 'feishu-image', token: 'image', caption: 'Image', objectKey: 'image.png' }],
  })
  return { root, sourceDir, snapshotPath, mediaManifestPath }
}

function writeLegacyManifest(f, manifestPath) {
  const snapshot = JSON.parse(fs.readFileSync(f.snapshotPath, 'utf8'))
  const files = fs.readdirSync(f.sourceDir).filter(file => file.endsWith('.json')).sort().map(file => {
    const bytes = fs.readFileSync(path.join(f.sourceDir, file))
    return { path: file, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }
  })
  fs.writeFileSync(manifestPath, `${JSON.stringify({
    schemaVersion: 1,
    manual: 'guides',
    buildEnv: 'uat',
    snapshotHash: hashSnapshot(snapshot),
    createdAt: '2026-07-14T00:00:00.000Z',
    files,
  }, null, 2)}\n`)
}

test('uses one snapshot hash with a v3 default and v4-compatible explicit prefixes', () => {
  const f = fixture()
  const v1 = sourceCacheKey(f.snapshotPath, { version: 1 })
  const v2 = sourceCacheKey(f.snapshotPath, { version: 2 })
  const v3 = sourceCacheKey(f.snapshotPath, { version: 3 })
  const v4 = sourceCacheKey(f.snapshotPath, { version: 4 })
  assert.match(v1, /^guides-source-v1-[0-9a-f]{64}$/)
  assert.equal(v2.replace('guides-source-v2-', ''), v1.replace('guides-source-v1-', ''))
  assert.equal(v3.replace('guides-source-v3-', ''), v1.replace('guides-source-v1-', ''))
  assert.equal(v4.replace('guides-source-v4-', ''), v1.replace('guides-source-v1-', ''))
  assert.equal(sourceCacheKey(f.snapshotPath), v3)
  assert.throws(() => sourceCacheKey(f.snapshotPath, { version: 5 }), /unsupported/i)
})

test('accepts a valid v1 source cache only when schema 1 is explicitly allowed', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'legacy-manifest.json')
  writeLegacyManifest(f, manifestPath)
  assert.throws(() => validateSourceCache({
    sourceDir: f.sourceDir,
    snapshotPath: f.snapshotPath,
    manifestPath,
    rootToken: 'root',
    acceptedSchemaVersions: [2],
  }), /identity/i)
  assert.equal(validateSourceCache({
    sourceDir: f.sourceDir,
    snapshotPath: f.snapshotPath,
    manifestPath,
    rootToken: 'root',
    acceptedSchemaVersions: [1, 2],
  }).complete, true)
})

test('rejects a v1 source cache whose sources directory is a symlink', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'legacy-manifest.json')
  writeLegacyManifest(f, manifestPath)
  const realSourceDir = path.join(f.root, 'real-sources')
  fs.renameSync(f.sourceDir, realSourceDir)
  fs.symlinkSync(realSourceDir, f.sourceDir, 'dir')

  assert.throws(() => validateSourceCache({
    sourceDir: f.sourceDir,
    snapshotPath: f.snapshotPath,
    manifestPath,
    rootToken: 'root',
    acceptedSchemaVersions: [1, 2],
  }), /unsafe|symlink|invalid/i)
})

test('rejects a v1 source manifest final symlink before reading it', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'legacy-manifest.json')
  writeLegacyManifest(f, manifestPath)
  const external = path.join(f.root, 'external-legacy-manifest.json')
  fs.renameSync(manifestPath, external)
  fs.symlinkSync(external, manifestPath)
  assert.throws(() => validateSourceCache({
    sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, rootToken: 'root', acceptedSchemaVersions: [1, 2],
  }), /manifest|regular|symlink|unsafe/i)
})

test('rejects a v1 source manifest FIFO before reading it', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'legacy-manifest.json')
  const fifo = spawnSync('mkfifo', [manifestPath], { encoding: 'utf8' })
  assert.equal(fifo.status, 0, fifo.stderr)
  const cli = path.resolve(__dirname, 'guides-source-cache.js')
  const result = spawnSync(process.execPath, [
    cli, 'validate-source', '--source-dir', f.sourceDir, '--snapshot', f.snapshotPath,
    '--manifest', manifestPath, '--root-token', 'root', '--schemas', '1,2',
  ], { encoding: 'utf8', timeout: 1000 })
  assert.notEqual(result.error?.code, 'ETIMEDOUT', 'v1 validator must reject a FIFO through lstat without opening it')
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /manifest|regular|unsafe/i)
})

test('creates and validates a snapshot-keyed source cache manifest', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  assert.match(sourceCacheKey(f.snapshotPath), /^guides-source-v3-[0-9a-f]{64}$/)
  const manifest = createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })
  assert.equal(manifest.files.length, 3)
  assert.match(manifest.mediaManifest.sha256, /^[0-9a-f]{64}$/)
  assert.equal(validateSourceCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' }).complete, true)
})

test('rejects a v2 source cache whose sources directory is a symlink', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })
  const realSourceDir = path.join(f.root, 'real-sources')
  fs.renameSync(f.sourceDir, realSourceDir)
  fs.symlinkSync(realSourceDir, f.sourceDir, 'dir')

  assert.throws(() => validateSourceCache({
    sourceDir: `${f.sourceDir}${path.sep}`,
    snapshotPath: f.snapshotPath,
    manifestPath,
    rootToken: 'root',
  }), /unsafe|symlink|invalid/i)
})

test('rejects nonregular v2 source manifests without opening them', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })
  fs.rmSync(manifestPath)
  fs.mkdirSync(manifestPath)
  assert.throws(() => validateSourceCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, rootToken: 'root' }), /manifest|regular|unsafe/i)

  fs.rmSync(manifestPath, { recursive: true })
  const fifo = spawnSync('mkfifo', [manifestPath], { encoding: 'utf8' })
  assert.equal(fifo.status, 0, fifo.stderr)
  const cli = path.resolve(__dirname, 'guides-source-cache.js')
  const result = spawnSync(process.execPath, [
    cli, 'validate-source', '--source-dir', f.sourceDir, '--snapshot', f.snapshotPath,
    '--manifest', manifestPath, '--root-token', 'root', '--schemas', '2',
  ], { encoding: 'utf8', timeout: 1000 })
  assert.notEqual(result.error?.code, 'ETIMEDOUT', 'validator must reject a FIFO through lstat without opening it')
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /manifest|regular|unsafe/i)
})

test('media validation rejects an unsafe source manifest before reading it', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })
  const external = path.join(f.root, 'external-source-manifest.json')
  fs.renameSync(manifestPath, external)
  fs.symlinkSync(external, manifestPath)
  assert.throws(() => validateMediaCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath }), /manifest|regular|symlink|unsafe/i)
})

test('media validation rejects a media manifest FIFO without opening it', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })
  fs.rmSync(f.mediaManifestPath)
  const fifo = spawnSync('mkfifo', [f.mediaManifestPath], { encoding: 'utf8' })
  assert.equal(fifo.status, 0, fifo.stderr)
  const cli = path.resolve(__dirname, 'guides-source-cache.js')
  const result = spawnSync(process.execPath, [
    cli, 'validate-media', '--source-dir', f.sourceDir, '--snapshot', f.snapshotPath,
    '--manifest', manifestPath, '--media-manifest', f.mediaManifestPath,
  ], { encoding: 'utf8', timeout: 1000 })
  assert.notEqual(result.error?.code, 'ETIMEDOUT', 'validator must reject a media FIFO through lstat without opening it')
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /media manifest|regular|unsafe/i)
})

test('manifest readers reject directory and device leaves before parsing JSON', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })

  assert.throws(() => validateSourceCache({
    sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath: '/dev/null', rootToken: 'root', acceptedSchemaVersions: [1, 2],
  }), /manifest|regular|unsafe/i)

  fs.rmSync(f.mediaManifestPath)
  fs.mkdirSync(f.mediaManifestPath)
  assert.throws(() => validateMediaCache({
    sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath,
  }), /media manifest|regular|unsafe/i)
  assert.throws(() => validateMediaCache({
    sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: '/dev/null',
  }), /media manifest|regular|unsafe/i)
})

test('rejects tampered cached sources and snapshot identity changes', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })
  fs.writeFileSync(path.join(f.sourceDir, 'doc.json'), '{}')
  assert.throws(() => validateSourceCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' }), /cache.*invalid/i)
  const snapshot = JSON.parse(fs.readFileSync(f.snapshotPath)); snapshot.generated_at = 'changed'; fs.writeFileSync(f.snapshotPath, JSON.stringify(snapshot))
  assert.throws(() => validateSourceCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' }), /snapshot/i)
})

test('rejects a tampered or incomplete cached media manifest', () => {
  const f = fixture(), manifestPath = path.join(f.root, 'manifest.json')
  createSourceCacheManifest({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath, rootToken: 'root' })
  fs.writeFileSync(f.mediaManifestPath, JSON.stringify({ schemaVersion: 1, entries: [] }))
  assert.equal(validateSourceCache({
    sourceDir: f.sourceDir,
    snapshotPath: f.snapshotPath,
    manifestPath,
    rootToken: 'root',
    acceptedSchemaVersions: [2],
  }).complete, true)
  assert.throws(
    () => validateMediaCache({ sourceDir: f.sourceDir, snapshotPath: f.snapshotPath, manifestPath, mediaManifestPath: f.mediaManifestPath }),
    /media manifest|coverage/i,
  )
})
