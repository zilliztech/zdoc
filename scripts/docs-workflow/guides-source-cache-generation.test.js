'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { createSourceCacheManifest } = require('./guides-source-cache')
const {
  createGenerationPayload,
  generationKeys,
  parseArgs,
  promoteGenerationPayload,
  validateGenerationPayload,
} = require('./guides-source-cache-generation')

function write(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value))
  return file
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-cache-generation-'))
  const sourceDir = path.join(root, 'source-input')
  write(sourceDir, 'root.json', { node_token: 'root', children: [{ node_token: 'doc' }] })
  const docPath = write(sourceDir, 'doc.json', {
    node_token: 'doc',
    title: 'Doc',
    blocks: { items: [{ block_id: 'page', block_type: 1 }, { block_id: 'image', image: { token: 'image', caption: { content: 'Image' } } }] },
  })
  const snapshot = {
    schema_version: 3,
    manual: 'guides',
    build_env: 'uat',
    generated_at: '2026-07-17T00:00:00.000Z',
    records: [{
      record_id: 'record',
      placement_type: 'canonical',
      doc_token: 'doc',
      source_file: 'doc.json',
      source_hash: crypto.createHash('sha256').update(fs.readFileSync(docPath)).digest('hex'),
    }],
    navigation_records: [{ record_id: 'record', table_id: 'table', placement_type: 'canonical' }],
    table_digests: { table: 'a'.repeat(64) },
  }
  const snapshotPath = write(root, 'snapshot.json', snapshot)
  const mediaManifestPath = write(root, 'media-input.json', {
    schemaVersion: 1,
    entries: [{ id: 'feishu-image:image', type: 'feishu-image', token: 'image', caption: 'Image', objectKey: 'image.png' }],
  })
  const sourceManifestPath = path.join(root, 'source-input-manifest.json')
  createSourceCacheManifest({ sourceDir, snapshotPath, manifestPath: sourceManifestPath, mediaManifestPath, rootToken: 'root' })
  return { root, sourceDir, snapshot, snapshotPath, mediaManifestPath, sourceManifestPath, outputDir: path.join(root, 'tmp/guides-source-cache-v4') }
}

function treeBytes(root) {
  const result = {}
  function visit(current, relative = '') {
    if (!fs.existsSync(current)) return
    const stat = fs.lstatSync(current)
    if (stat.isSymbolicLink()) { result[relative] = `symlink:${fs.readlinkSync(current)}`; return }
    if (stat.isFile()) { result[relative] = fs.readFileSync(current).toString('hex'); return }
    for (const name of fs.readdirSync(current).sort()) visit(path.join(current, name), relative ? `${relative}/${name}` : name)
  }
  visit(root)
  return result
}

function livePaths(workspace) {
  return {
    sourceDir: path.join(workspace, 'plugins/lark-docs/meta/sources/guides'),
    sourceManifestPath: path.join(workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json'),
    mediaManifestPath: path.join(workspace, 'plugins/lark-docs/meta/media-cache/guides.json'),
  }
}

test('generation keys use canonical snapshot hash and isolate generated_at changes', () => {
  const f = fixture()
  const reordered = path.join(f.root, 'snapshot-reordered.json')
  const reorderedValue = Object.fromEntries(Object.entries(f.snapshot).reverse())
  fs.writeFileSync(reordered, JSON.stringify(reorderedValue, null, 4))
  const one = generationKeys({ snapshotPath: f.snapshotPath, runId: 29550685342, runAttempt: 3 })
  const same = generationKeys({ snapshotPath: reordered, runId: 29550685342, runAttempt: 3 })
  assert.deepEqual(same, one)
  assert.match(one.prefix, /^guides-source-v4-[0-9a-f]{64}-$/)
  assert.equal(one.lookupKey, `${one.prefix}lookup-29550685342-3`)
  assert.equal(one.saveKey, `${one.prefix}29550685342-3`)
  const changed = { ...f.snapshot, generated_at: '2026-07-18T00:00:00.000Z' }
  const changedPath = write(f.root, 'snapshot-changed.json', changed)
  assert.notEqual(generationKeys({ snapshotPath: changedPath, runId: 29550685342, runAttempt: 3 }).prefix, one.prefix)
})

test('generation keys reject invalid or unbounded run identities', () => {
  const f = fixture()
  for (const [runId, runAttempt] of [[0, 1], [-1, 1], [1.5, 1], [Number.MAX_SAFE_INTEGER + 1, 1], ['01', 1], ['1e2', 1], [1, 0], [1, 101]]) {
    assert.throws(() => generationKeys({ snapshotPath: f.snapshotPath, runId, runAttempt }), /run|attempt|positive|bounded/i)
  }
})

test('create and promote reject overlapping input and destination roots without mutation', () => {
  const f = fixture()
  const sourceBefore = treeBytes(f.sourceDir)
  assert.throws(() => createGenerationPayload({
    sourceDir: f.sourceDir,
    sourceManifestPath: f.sourceManifestPath,
    mediaManifestPath: f.mediaManifestPath,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: f.sourceDir,
  }), /overlap|output/i)
  assert.deepEqual(treeBytes(f.sourceDir), sourceBefore)

  createGenerationPayload({ sourceDir: f.sourceDir, sourceManifestPath: f.sourceManifestPath, mediaManifestPath: f.mediaManifestPath, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const payloadBefore = treeBytes(f.outputDir)
  assert.throws(() => promoteGenerationPayload({ payloadDir: f.outputDir, workspace: f.outputDir, snapshotPath: f.snapshotPath, rootToken: 'root' }), /overlap|workspace/i)
  assert.deepEqual(treeBytes(f.outputDir), payloadBefore)
})

test('creates, validates, and promotes the exact v4 payload while removing stale live sources', () => {
  const f = fixture()
  const created = createGenerationPayload({
    sourceDir: f.sourceDir,
    sourceManifestPath: f.sourceManifestPath,
    mediaManifestPath: f.mediaManifestPath,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: f.outputDir,
  })
  assert.equal(created, path.resolve(f.outputDir))
  assert.deepEqual(fs.readdirSync(f.outputDir).sort(), ['media-manifest.json', 'source-manifest.json', 'sources'])
  assert.equal(validateGenerationPayload({ payloadDir: f.outputDir, snapshotPath: f.snapshotPath, rootToken: 'root' }).source.complete, true)

  const workspace = path.join(f.root, 'workspace')
  const live = livePaths(workspace)
  write(live.sourceDir, 'stale.json', '{"stale":true}')
  write(workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'old source manifest')
  write(workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media manifest')
  promoteGenerationPayload({ payloadDir: f.outputDir, workspace, snapshotPath: f.snapshotPath, rootToken: 'root' })
  assert.deepEqual(treeBytes(live.sourceDir), treeBytes(path.join(f.outputDir, 'sources')))
  assert.equal(fs.readFileSync(live.sourceManifestPath, 'utf8'), fs.readFileSync(path.join(f.outputDir, 'source-manifest.json'), 'utf8'))
  assert.equal(fs.readFileSync(live.mediaManifestPath, 'utf8'), fs.readFileSync(path.join(f.outputDir, 'media-manifest.json'), 'utf8'))
  assert.equal(fs.existsSync(path.join(live.sourceDir, 'stale.json')), false)
})

test('rejected payload cannot mutate live paths', () => {
  const f = fixture()
  createGenerationPayload({ sourceDir: f.sourceDir, sourceManifestPath: f.sourceManifestPath, mediaManifestPath: f.mediaManifestPath, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  fs.writeFileSync(path.join(f.outputDir, 'source-manifest.json'), '{}')
  const workspace = path.join(f.root, 'workspace')
  const live = livePaths(workspace)
  write(live.sourceDir, 'kept.json', 'kept source')
  write(workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'kept manifest')
  write(workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'kept media')
  const before = treeBytes(workspace)
  assert.throws(() => promoteGenerationPayload({ payloadDir: f.outputDir, workspace, snapshotPath: f.snapshotPath, rootToken: 'root' }), /cache|manifest|identity/i)
  assert.deepEqual(treeBytes(workspace), before)
})

test('validation rejects symlinks, nonregular children, and manifest traversal', async (t) => {
  for (const kind of ['manifest-symlink', 'sources-symlink', 'nested-source', 'manifest-traversal']) {
    await t.test(kind, () => {
      const f = fixture()
      createGenerationPayload({ sourceDir: f.sourceDir, sourceManifestPath: f.sourceManifestPath, mediaManifestPath: f.mediaManifestPath, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
      if (kind === 'manifest-symlink') {
        fs.rmSync(path.join(f.outputDir, 'source-manifest.json'))
        fs.symlinkSync(f.sourceManifestPath, path.join(f.outputDir, 'source-manifest.json'))
      } else if (kind === 'sources-symlink') {
        fs.rmSync(path.join(f.outputDir, 'sources'), { recursive: true })
        fs.symlinkSync(f.sourceDir, path.join(f.outputDir, 'sources'), 'dir')
      } else if (kind === 'nested-source') {
        fs.mkdirSync(path.join(f.outputDir, 'sources/nested'))
      } else {
        const manifestPath = path.join(f.outputDir, 'source-manifest.json')
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
        manifest.files[0].path = '../escape.json'
        fs.writeFileSync(manifestPath, JSON.stringify(manifest))
      }
      assert.throws(() => validateGenerationPayload({ payloadDir: f.outputDir, snapshotPath: f.snapshotPath, rootToken: 'root' }), /unsafe|symlink|regular|path|manifest|invalid/i)
    })
  }
})

test('promotion rolls live paths back byte-for-byte after an injected install failure', () => {
  const f = fixture()
  createGenerationPayload({ sourceDir: f.sourceDir, sourceManifestPath: f.sourceManifestPath, mediaManifestPath: f.mediaManifestPath, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const workspace = path.join(f.root, 'workspace')
  const live = livePaths(workspace)
  write(live.sourceDir, 'old.json', 'old source bytes')
  write(workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'old source manifest bytes')
  write(workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media manifest bytes')
  const before = treeBytes(workspace)
  assert.throws(() => promoteGenerationPayload({
    payloadDir: f.outputDir,
    workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    hooks: { afterInstall({ index }) { if (index === 0) throw new Error('injected install failure') } },
  }), /injected install failure/i)
  assert.deepEqual(treeBytes(workspace), before)
})

test('CLI argument parsing rejects duplicates, unknowns, missing values, and traversal paths', () => {
  assert.deepEqual(parseArgs(['keys', '--snapshot', 'snapshot.json', '--run-id', '42', '--run-attempt', '2']), {
    operation: 'keys', snapshot: 'snapshot.json', 'run-id': '42', 'run-attempt': '2',
  })
  for (const argv of [
    ['keys', '--snapshot', 'snapshot.json', '--snapshot', 'other.json', '--run-id', '42', '--run-attempt', '2'],
    ['keys', '--wat', 'x', '--snapshot', 'snapshot.json', '--run-id', '42', '--run-attempt', '2'],
    ['keys', '--snapshot'],
    ['keys', '--snapshot', '../snapshot.json', '--run-id', '42', '--run-attempt', '2'],
    ['validate', '--payload', 'payload', '--snapshot', 'snapshot.json'],
  ]) assert.throws(() => parseArgs(argv), /argument|duplicate|unknown|missing|path|root-token/i)
})

test('CLI executes keys, create, validate, and promote operations', () => {
  const f = fixture()
  const cli = path.resolve(__dirname, 'guides-source-cache-generation.js')
  const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
  const keys = run(['keys', '--snapshot', f.snapshotPath, '--run-id', '42', '--run-attempt', '2'])
  assert.equal(keys.status, 0, keys.stderr)
  assert.equal(JSON.parse(keys.stdout).saveKey.endsWith('-42-2'), true)

  const created = run([
    'create',
    '--source-dir', f.sourceDir,
    '--source-manifest', f.sourceManifestPath,
    '--media-manifest', f.mediaManifestPath,
    '--snapshot', f.snapshotPath,
    '--root-token', 'root',
    '--output', f.outputDir,
  ])
  assert.equal(created.status, 0, created.stderr)
  assert.equal(JSON.parse(created.stdout).output, path.resolve(f.outputDir))

  const validated = run(['validate', '--payload', f.outputDir, '--snapshot', f.snapshotPath, '--root-token', 'root'])
  assert.equal(validated.status, 0, validated.stderr)
  assert.equal(JSON.parse(validated.stdout).valid, true)

  const workspace = path.join(f.root, 'workspace')
  fs.mkdirSync(workspace)
  const promoted = run(['promote', '--payload', f.outputDir, '--workspace', workspace, '--snapshot', f.snapshotPath, '--root-token', 'root'])
  assert.equal(promoted.status, 0, promoted.stderr)
  const live = livePaths(workspace)
  assert.equal(JSON.parse(promoted.stdout).sourceDir, live.sourceDir)
  assert.deepEqual(treeBytes(live.sourceDir), treeBytes(path.join(f.outputDir, 'sources')))
})
