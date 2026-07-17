'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { createSourceCacheManifest, validateSourceCache } = require('./guides-source-cache')
const {
  cleanupGuidesLiveCache,
  promoteSourceGenerationPayload,
  validateSourceGenerationPayload,
} = require('./guides-source-cache-source-promotion')

function write(root, relative, value) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value))
  return target
}

function tree(root) {
  const result = {}
  function visit(current, relative = '') {
    if (!fs.existsSync(current)) { result[relative] = 'absent'; return }
    const stat = fs.lstatSync(current)
    if (stat.isSymbolicLink()) { result[relative] = `symlink:${fs.readlinkSync(current)}`; return }
    if (stat.isFile()) { result[relative] = `file:${fs.readFileSync(current).toString('hex')}`; return }
    result[relative] = stat.isDirectory() ? 'directory' : `other:${stat.mode}`
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

function thrown(operation) {
  try { operation() } catch (error) { return error }
  assert.fail('Expected operation to throw')
}

function fixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-source-promotion-')))
  const payload = path.join(root, 'payload')
  const sourceDir = path.join(payload, 'sources')
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
      record_id: 'record', placement_type: 'canonical', doc_token: 'doc', source_file: 'doc.json',
      source_hash: crypto.createHash('sha256').update(fs.readFileSync(docPath)).digest('hex'),
    }],
    navigation_records: [{ record_id: 'record', table_id: 'table', placement_type: 'canonical' }],
    table_digests: { table: 'a'.repeat(64) },
  }
  const snapshotPath = write(root, 'snapshot.json', snapshot)
  const mediaManifestPath = write(payload, 'media-manifest.json', {
    schemaVersion: 1,
    entries: [{ id: 'feishu-image:image', type: 'feishu-image', token: 'image', caption: 'Image', objectKey: 'image.png' }],
  })
  const sourceManifestPath = path.join(payload, 'source-manifest.json')
  createSourceCacheManifest({ sourceDir, snapshotPath, manifestPath: sourceManifestPath, mediaManifestPath, rootToken: 'root' })
  return { root, payload, sourceDir, sourceManifestPath, mediaManifestPath, snapshotPath, workspace: path.join(root, 'workspace') }
}

test('source-only payload validation enforces the exact safe v4 layout while ignoring media semantics', async (t) => {
  const valid = fixture()
  fs.writeFileSync(valid.mediaManifestPath, '{}')
  assert.equal(validateSourceGenerationPayload({ payloadDir: valid.payload, snapshotPath: valid.snapshotPath, rootToken: 'root' }).source.complete, true)

  for (const kind of ['extra-child', 'nested-json-directory', 'media-symlink', 'manifest-traversal']) {
    await t.test(kind, () => {
      const f = fixture()
      if (kind === 'extra-child') write(f.payload, 'extra.txt', 'extra')
      if (kind === 'nested-json-directory') fs.mkdirSync(path.join(f.sourceDir, 'nested.json'))
      if (kind === 'media-symlink') {
        fs.rmSync(f.mediaManifestPath)
        fs.symlinkSync(f.snapshotPath, f.mediaManifestPath)
      }
      if (kind === 'manifest-traversal') {
        const manifest = JSON.parse(fs.readFileSync(f.sourceManifestPath, 'utf8'))
        manifest.files[0].path = '../escape.json'
        fs.writeFileSync(f.sourceManifestPath, JSON.stringify(manifest))
      }
      assert.throws(() => validateSourceGenerationPayload({ payloadDir: f.payload, snapshotPath: f.snapshotPath, rootToken: 'root' }), /payload|symlink|regular|unsafe|manifest|path/i)
    })
  }
})

test('source-only promotion replaces stale sources, revalidates, and removes only the exact media manifest', () => {
  const f = fixture()
  fs.writeFileSync(f.mediaManifestPath, '{}')
  const live = livePaths(f.workspace)
  write(live.sourceDir, 'stale.json', 'stale source')
  write(f.workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'stale manifest')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'stale media')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/keep.txt', 'keep')
  const payloadBefore = tree(f.payload)

  promoteSourceGenerationPayload({ payloadDir: f.payload, workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root' })

  assert.deepEqual(tree(live.sourceDir), tree(f.sourceDir))
  assert.equal(fs.readFileSync(live.sourceManifestPath, 'utf8'), fs.readFileSync(f.sourceManifestPath, 'utf8'))
  assert.equal(fs.existsSync(live.mediaManifestPath), false)
  assert.equal(fs.readFileSync(path.join(f.workspace, 'plugins/lark-docs/meta/media-cache/keep.txt'), 'utf8'), 'keep')
  assert.equal(validateSourceCache({ sourceDir: live.sourceDir, snapshotPath: f.snapshotPath, manifestPath: live.sourceManifestPath, rootToken: 'root', acceptedSchemaVersions: [2] }).complete, true)
  assert.deepEqual(tree(f.payload), payloadBefore)
})

test('source-only promotion rejects internal destination symlinks without touching external targets', async (t) => {
  for (const relative of ['plugins', 'plugins/lark-docs/meta', 'plugins/lark-docs/meta/sources', 'plugins/lark-docs/meta/source-cache', 'plugins/lark-docs/meta/media-cache']) {
    await t.test(relative, () => {
      const f = fixture()
      fs.writeFileSync(f.mediaManifestPath, '{}')
      const internal = path.join(f.workspace, relative)
      const external = path.join(f.root, `external-${relative.replaceAll('/', '-')}`)
      fs.mkdirSync(path.dirname(internal), { recursive: true })
      write(external, 'marker.txt', relative)
      fs.symlinkSync(external, internal, 'dir')
      const externalBefore = tree(external)
      const workspaceBefore = tree(f.workspace)

      assert.throws(() => promoteSourceGenerationPayload({ payloadDir: f.payload, workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root' }), /symlink|workspace|outside/i)
      assert.deepEqual(tree(external), externalBefore)
      assert.deepEqual(tree(f.workspace), workspaceBefore)
    })
  }
})

test('source-only promotion rolls back mixed live state byte-for-byte and leaves no directory residue', () => {
  const f = fixture()
  fs.writeFileSync(f.mediaManifestPath, '{}')
  const live = livePaths(f.workspace)
  write(live.sourceDir, 'old.json', 'old source')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media')
  const workspaceBefore = tree(f.workspace)
  const payloadBefore = tree(f.payload)

  assert.throws(() => promoteSourceGenerationPayload({
    payloadDir: f.payload,
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    hooks: { afterInstall({ index }) { if (index === 0) throw new Error('injected source install failure') } },
  }), /injected source install failure/i)

  assert.deepEqual(tree(f.workspace), workspaceBefore)
  assert.deepEqual(tree(live.sourceManifestPath), { '': 'absent' })
  assert.deepEqual(tree(f.payload), payloadBefore)
})

test('source-only promotion restores media and sources when exact media removal fails', () => {
  const f = fixture()
  fs.writeFileSync(f.mediaManifestPath, '{}')
  const live = livePaths(f.workspace)
  write(live.sourceDir, 'old.json', 'old source')
  write(f.workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'old manifest')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media')
  const before = tree(f.workspace)

  assert.throws(() => promoteSourceGenerationPayload({
    payloadDir: f.payload,
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    hooks: { beforeMediaRemoval() { throw new Error('injected media removal failure') } },
  }), /injected media removal failure/i)
  assert.deepEqual(tree(f.workspace), before)
})

test('source-only promotion aggregates rollback failures, attempts later restores, and preserves its journal', () => {
  const f = fixture()
  fs.writeFileSync(f.mediaManifestPath, '{}')
  const live = livePaths(f.workspace)
  write(live.sourceDir, 'old.json', 'old source')
  write(f.workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'old manifest')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media')
  const calls = []
  let journal

  const error = thrown(() => promoteSourceGenerationPayload({
    payloadDir: f.payload,
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    hooks: {
      afterInstall({ index }) { if (index === 0) throw new Error('original source promotion failure') },
      beforeRollbackRemove({ index, journal: value }) {
        calls.push(`remove-${index}`)
        journal = value
        if (index === 0) throw new Error('rollback remove failure')
      },
      beforeRollbackRestore({ index }) {
        calls.push(`restore-${index}`)
        if (index === 2) throw new Error('rollback restore failure')
      },
    },
  }))

  assert.equal(error instanceof AggregateError, true)
  assert.match(error.message, /original source promotion failure.*rollback remove failure.*rollback restore failure/i)
  assert.deepEqual(calls.slice(0, 3), ['remove-0', 'remove-1', 'remove-2'])
  assert.equal(calls.includes('restore-0'), true)
  assert.equal(calls.includes('restore-2'), true)
  assert.equal(fs.existsSync(journal), true)
  fs.rmSync(journal, { recursive: true, force: true })
})

test('source-only promotion CLI preserves the validated payload and promotes recovery sources', () => {
  const f = fixture()
  fs.writeFileSync(f.mediaManifestPath, '{}')
  fs.mkdirSync(f.workspace)
  const before = tree(f.payload)
  const cli = path.resolve(__dirname, 'guides-source-cache-source-promotion.js')
  const result = spawnSync(process.execPath, [
    cli, 'promote', '--payload', f.payload, '--workspace', f.workspace,
    '--snapshot', f.snapshotPath, '--root-token', 'root',
  ], { encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(result.stdout).sourceDir, livePaths(f.workspace).sourceDir)
  assert.deepEqual(tree(f.payload), before)
})

test('exact Guides cleanup preserves unrelated source and media cache sentinels', () => {
  const f = fixture()
  const live = livePaths(f.workspace)
  write(live.sourceDir, 'old.json', 'old source')
  write(f.workspace, 'plugins/lark-docs/meta/sources/keep.txt', 'keep sources')
  write(f.workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'old manifest')
  write(f.workspace, 'plugins/lark-docs/meta/source-cache/keep.json', 'keep source cache')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/keep.json', 'keep media cache')

  const cli = path.resolve(__dirname, 'guides-source-cache-source-promotion.js')
  const result = spawnSync(process.execPath, [cli, 'cleanup', '--workspace', f.workspace, '--scope', 'all'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)

  assert.deepEqual(tree(live.sourceDir), { '': 'absent' })
  assert.deepEqual(tree(live.sourceManifestPath), { '': 'absent' })
  assert.deepEqual(tree(live.mediaManifestPath), { '': 'absent' })
  assert.equal(fs.readFileSync(path.join(f.workspace, 'plugins/lark-docs/meta/sources/keep.txt'), 'utf8'), 'keep sources')
  assert.equal(fs.readFileSync(path.join(f.workspace, 'plugins/lark-docs/meta/source-cache/keep.json'), 'utf8'), 'keep source cache')
  assert.equal(fs.readFileSync(path.join(f.workspace, 'plugins/lark-docs/meta/media-cache/keep.json'), 'utf8'), 'keep media cache')
})

test('media-only Guides cleanup preserves valid sources, source manifest, and unrelated media state', () => {
  const f = fixture()
  const live = livePaths(f.workspace)
  write(live.sourceDir, 'old.json', 'old source')
  write(f.workspace, 'plugins/lark-docs/meta/source-cache/guides-manifest.json', 'old manifest')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/keep.json', 'keep media cache')
  const sourcesBefore = tree(live.sourceDir)

  cleanupGuidesLiveCache({ workspace: f.workspace, scope: 'media' })

  assert.deepEqual(tree(live.sourceDir), sourcesBefore)
  assert.equal(fs.readFileSync(live.sourceManifestPath, 'utf8'), 'old manifest')
  assert.equal(fs.existsSync(live.mediaManifestPath), false)
  assert.equal(fs.readFileSync(path.join(f.workspace, 'plugins/lark-docs/meta/media-cache/keep.json'), 'utf8'), 'keep media cache')
})

test('Guides cleanup rejects internal symlink redirection before touching external or sibling state', () => {
  const f = fixture()
  const external = path.join(f.root, 'external-source-cache')
  write(external, 'guides-manifest.json', 'external manifest')
  write(external, 'keep.json', 'external sentinel')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'live media')
  write(f.workspace, 'plugins/lark-docs/meta/media-cache/keep.json', 'live sentinel')
  const internal = path.join(f.workspace, 'plugins/lark-docs/meta/source-cache')
  fs.mkdirSync(path.dirname(internal), { recursive: true })
  fs.symlinkSync(external, internal, 'dir')
  const externalBefore = tree(external)
  const workspaceBefore = tree(f.workspace)

  assert.throws(() => cleanupGuidesLiveCache({ workspace: f.workspace, scope: 'all' }), /symlink|workspace|outside/i)
  assert.deepEqual(tree(external), externalBefore)
  assert.deepEqual(tree(f.workspace), workspaceBefore)
})
