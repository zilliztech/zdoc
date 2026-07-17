'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { createSourceCacheManifest } = require('./guides-source-cache')
const generationModule = require('./guides-source-cache-generation')
const {
  createGenerationPayload,
  generationKeys,
  promoteGenerationPayload,
  validateGenerationPayload,
} = generationModule

function write(root, relative, value) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value))
  return file
}

function fixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'guides-cache-generation-')))
  const workspace = path.join(root, 'workspace')
  const { sourceDir, sourceManifestPath, mediaManifestPath } = livePaths(workspace)
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
  write(workspace, 'plugins/lark-docs/meta/media-cache/guides.json', {
    schemaVersion: 1,
    entries: [{ id: 'feishu-image:image', type: 'feishu-image', token: 'image', caption: 'Image', objectKey: 'image.png' }],
  })
  createSourceCacheManifest({ sourceDir, snapshotPath, manifestPath: sourceManifestPath, mediaManifestPath, rootToken: 'root' })
  return { root, workspace, sourceDir, snapshot, snapshotPath, mediaManifestPath, sourceManifestPath, outputDir: path.join(root, 'tmp/guides-source-cache-v4') }
}

function treeBytes(root) {
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

function thrown(operation) {
  try { operation() } catch (error) { return error }
  assert.fail('Expected operation to throw')
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

test('generation module exports only the four public generation operations', () => {
  assert.deepEqual(Object.keys(generationModule).sort(), [
    'createGenerationPayload',
    'generationKeys',
    'promoteGenerationPayload',
    'validateGenerationPayload',
  ])
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
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: f.sourceDir,
  }), /overlap|output/i)
  assert.deepEqual(treeBytes(f.sourceDir), sourceBefore)

  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const payloadBefore = treeBytes(f.outputDir)
  assert.throws(() => promoteGenerationPayload({ payloadDir: f.outputDir, workspace: f.outputDir, snapshotPath: f.snapshotPath, rootToken: 'root' }), /overlap|workspace/i)
  assert.deepEqual(treeBytes(f.outputDir), payloadBefore)
})

test('create rejects a non-existing output beneath a symlink ancestor that aliases live sources', () => {
  const f = fixture()
  const before = treeBytes(f.workspace)
  const alias = path.join(f.root, 'source-alias')
  fs.symlinkSync(f.sourceDir, alias, 'dir')
  const output = path.join(alias, 'new-generation')

  assert.throws(() => createGenerationPayload({
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: output,
  }), /symlink|overlap|ancestor/i)
  assert.deepEqual(treeBytes(f.workspace), before)
  assert.equal(fs.existsSync(output), false)
})

test('create accepts a prospective output through a benign alias and returns its physical path', () => {
  const f = fixture()
  const alias = path.join(f.root, 'benign-root-alias')
  fs.symlinkSync(f.root, alias, 'dir')
  const requested = path.join(alias, 'aliased-output/generation')
  const physical = path.join(f.root, 'aliased-output/generation')

  assert.equal(createGenerationPayload({
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: requested,
  }), physical)
  assert.deepEqual(treeBytes(physical), treeBytes(path.resolve(physical)))
})

test('create rejects internal workspace symlink boundaries without touching external data', async (t) => {
  for (const relative of ['plugins', 'plugins/lark-docs/meta', 'plugins/lark-docs/meta/source-cache']) {
    await t.test(relative, () => {
      const f = fixture()
      const internal = path.join(f.workspace, relative)
      const external = path.join(f.root, `external-${relative.replaceAll('/', '-')}`)
      fs.renameSync(internal, external)
      fs.symlinkSync(external, internal, 'dir')
      const externalBefore = treeBytes(external)

      assert.throws(() => createGenerationPayload({
        workspace: f.workspace,
        snapshotPath: f.snapshotPath,
        rootToken: 'root',
        outputDir: f.outputDir,
      }), /workspace|symlink|outside/i)
      assert.deepEqual(treeBytes(external), externalBefore)
      assert.equal(fs.existsSync(f.outputDir), false)
    })
  }
})

test('promote canonicalizes a workspace reached through a symlinked parent before overlap checks', () => {
  const f = fixture()
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const alias = path.join(f.root, 'root-alias')
  fs.symlinkSync(f.root, alias, 'dir')
  const workspace = path.join(alias, 'tmp')
  const before = treeBytes(path.dirname(f.outputDir))

  assert.throws(() => promoteGenerationPayload({
    payloadDir: f.outputDir,
    workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
  }), /overlap|workspace|symlink/i)
  assert.deepEqual(treeBytes(path.dirname(f.outputDir)), before)
})

test('promote rejects internal workspace symlink boundaries without touching external data', async (t) => {
  for (const relative of ['plugins', 'plugins/lark-docs/meta', 'plugins/lark-docs/meta/media-cache']) {
    await t.test(relative, () => {
      const f = fixture()
      createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
      const workspace = path.join(f.root, `promotion-${relative.replaceAll('/', '-')}`)
      const internal = path.join(workspace, relative)
      const external = path.join(f.root, `promotion-external-${relative.replaceAll('/', '-')}`)
      fs.mkdirSync(path.dirname(internal), { recursive: true })
      write(external, 'marker.txt', `external ${relative}`)
      fs.symlinkSync(external, internal, 'dir')
      const workspaceBefore = treeBytes(workspace)
      const externalBefore = treeBytes(external)

      assert.throws(() => promoteGenerationPayload({
        payloadDir: f.outputDir,
        workspace,
        snapshotPath: f.snapshotPath,
        rootToken: 'root',
      }), /workspace|symlink|outside/i)
      assert.deepEqual(treeBytes(workspace), workspaceBefore)
      assert.deepEqual(treeBytes(external), externalBefore)
    })
  }
})

test('creates, validates, and promotes the exact v4 payload while removing stale live sources', () => {
  const f = fixture()
  const created = createGenerationPayload({
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: f.outputDir,
  })
  assert.equal(created, path.resolve(f.outputDir))
  assert.deepEqual(fs.readdirSync(f.outputDir).sort(), ['media-manifest.json', 'source-manifest.json', 'sources'])
  assert.equal(validateGenerationPayload({ payloadDir: f.outputDir, snapshotPath: f.snapshotPath, rootToken: 'root' }).source.complete, true)

  const workspace = path.join(f.root, 'promotion-workspace')
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
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
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

test('snapshot-B validation and promotion reject a snapshot-A payload without mutating live state', () => {
  const f = fixture()
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const snapshotBPath = write(f.root, 'snapshot-b.json', {
    ...f.snapshot,
    generated_at: '2026-07-18T00:00:00.000Z',
  })
  const before = treeBytes(f.workspace)

  assert.throws(
    () => validateGenerationPayload({ payloadDir: f.outputDir, snapshotPath: snapshotBPath, rootToken: 'root' }),
    /snapshot/i,
  )
  assert.throws(
    () => promoteGenerationPayload({ payloadDir: f.outputDir, workspace: f.workspace, snapshotPath: snapshotBPath, rootToken: 'root' }),
    /snapshot/i,
  )
  assert.deepEqual(treeBytes(f.workspace), before)
})

test('validation rejects symlinks, nonregular children, and manifest traversal', async (t) => {
  for (const kind of ['manifest-symlink', 'sources-symlink', 'nested-source', 'manifest-traversal']) {
    await t.test(kind, () => {
      const f = fixture()
      createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
      if (kind === 'manifest-symlink') {
        fs.rmSync(path.join(f.outputDir, 'source-manifest.json'))
        fs.symlinkSync(f.sourceManifestPath, path.join(f.outputDir, 'source-manifest.json'))
      } else if (kind === 'sources-symlink') {
        fs.rmSync(path.join(f.outputDir, 'sources'), { recursive: true })
        fs.symlinkSync(f.sourceDir, path.join(f.outputDir, 'sources'), 'dir')
      } else if (kind === 'nested-source') {
        fs.mkdirSync(path.join(f.outputDir, 'sources/nested.json'))
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
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
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

test('promotion rollback removes directory residue for initially absent and mixed live paths', () => {
  const f = fixture()
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const workspace = path.join(f.root, 'mixed-workspace')
  const live = livePaths(workspace)
  write(workspace, 'plugins/lark-docs/meta/media-cache/guides.json', 'old media bytes')
  const before = treeBytes(workspace)

  assert.throws(() => promoteGenerationPayload({
    payloadDir: f.outputDir,
    workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    hooks: { afterInstall({ index }) { if (index === 1) throw new Error('mixed install failure') } },
  }), /mixed install failure/i)
  assert.deepEqual(treeBytes(workspace), before)
  assert.deepEqual(treeBytes(live.sourceDir), { '': 'absent' })
  assert.deepEqual(treeBytes(live.sourceManifestPath), { '': 'absent' })
})

test('promotion aggregates rollback faults, attempts later actions, and preserves its journal', () => {
  const f = fixture()
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const workspace = path.join(f.root, 'faulted-promotion-workspace')
  const live = livePaths(workspace)
  write(live.sourceDir, 'old.json', 'old source')
  const calls = []
  let journalRoot
  let directoryFaulted = false

  const error = thrown(() => promoteGenerationPayload({
    payloadDir: f.outputDir,
    workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    hooks: {
      afterInstall({ index }) { if (index === 0) throw new Error('original promotion failure') },
      beforeRollbackRemove({ index, journal }) {
        calls.push(`remove-${index}`)
        journalRoot = journal
        if (index === 0) throw new Error('remove rollback failure')
      },
      beforeRollbackRestore({ index }) {
        calls.push(`restore-${index}`)
        if (index === 0) throw new Error('restore rollback failure')
      },
      beforeRollbackDirectoryCleanup({ path: directory }) {
        calls.push(`directory-${path.basename(directory)}`)
        if (!directoryFaulted) {
          directoryFaulted = true
          throw new Error('directory cleanup failure')
        }
      },
    },
  }))

  assert.equal(error instanceof AggregateError, true)
  assert.match(error.message, /original promotion failure.*remove rollback failure.*restore rollback failure.*directory cleanup failure/i)
  assert.deepEqual(calls.slice(0, 3), ['remove-0', 'remove-1', 'remove-2'])
  assert.equal(calls.includes('restore-0'), true)
  assert.equal(calls.filter(call => call.startsWith('directory-')).length >= 2, true)
  assert.equal(fs.existsSync(journalRoot), true)
  fs.rmSync(journalRoot, { recursive: true, force: true })
})

test('create restores an existing output byte-for-byte after an injected swap failure', () => {
  const f = fixture()
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const before = treeBytes(f.outputDir)
  const docPath = path.join(f.sourceDir, 'doc.json')
  const changedDoc = { ...JSON.parse(fs.readFileSync(docPath, 'utf8')), title: 'Changed Doc' }
  fs.writeFileSync(docPath, JSON.stringify(changedDoc))
  const changedSnapshot = {
    ...f.snapshot,
    records: [{
      ...f.snapshot.records[0],
      source_hash: crypto.createHash('sha256').update(fs.readFileSync(docPath)).digest('hex'),
    }],
  }
  fs.writeFileSync(f.snapshotPath, JSON.stringify(changedSnapshot))
  createSourceCacheManifest({
    sourceDir: f.sourceDir,
    snapshotPath: f.snapshotPath,
    manifestPath: f.sourceManifestPath,
    mediaManifestPath: f.mediaManifestPath,
    rootToken: 'root',
  })

  assert.throws(() => createGenerationPayload({
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: f.outputDir,
    hooks: { beforeSwapCommit() { throw new Error('injected swap failure') } },
  }), /injected swap failure/i)
  assert.deepEqual(treeBytes(f.outputDir), before)
  const leftovers = fs.readdirSync(path.dirname(f.outputDir)).filter(name => name.startsWith(`.${path.basename(f.outputDir)}.`))
  assert.deepEqual(leftovers, [])
})

test('create aggregates rollback faults, attempts later cleanup, and preserves its backup', () => {
  const f = fixture()
  createGenerationPayload({ workspace: f.workspace, snapshotPath: f.snapshotPath, rootToken: 'root', outputDir: f.outputDir })
  const calls = []
  let backupPath

  const error = thrown(() => createGenerationPayload({
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: f.outputDir,
    hooks: {
      afterSwapCommit() { throw new Error('original create failure') },
      beforeRollbackRemoveOutput({ backup }) {
        calls.push('remove-output')
        backupPath = backup
        throw new Error('remove output failure')
      },
      beforeRollbackRestoreBackup() {
        calls.push('restore-backup')
        throw new Error('restore backup failure')
      },
      beforeTemporaryCleanup() {
        calls.push('cleanup-temporary')
        throw new Error('temporary cleanup failure')
      },
    },
  }))

  assert.equal(error instanceof AggregateError, true)
  assert.match(error.message, /original create failure.*remove output failure.*restore backup failure.*temporary cleanup failure/i)
  assert.deepEqual(calls, ['remove-output', 'restore-backup', 'cleanup-temporary'])
  assert.equal(fs.existsSync(backupPath), true)
  fs.rmSync(f.outputDir, { recursive: true, force: true })
  fs.renameSync(backupPath, f.outputDir)
})

test('create refuses to replace a preexisting non-directory output', async (t) => {
  for (const kind of ['file', 'symlink']) {
    await t.test(kind, () => {
      const f = fixture()
      fs.mkdirSync(path.dirname(f.outputDir), { recursive: true })
      if (kind === 'file') fs.writeFileSync(f.outputDir, 'keep this file')
      else fs.symlinkSync(f.sourceDir, f.outputDir, 'dir')
      const before = treeBytes(f.outputDir)

      assert.throws(() => createGenerationPayload({
        workspace: f.workspace,
        snapshotPath: f.snapshotPath,
        rootToken: 'root',
        outputDir: f.outputDir,
      }), /output|directory|symlink/i)
      assert.deepEqual(treeBytes(f.outputDir), before)
    })
  }
})

test('create rejects unsupported swap hooks before touching output', () => {
  const f = fixture()
  assert.throws(() => createGenerationPayload({
    workspace: f.workspace,
    snapshotPath: f.snapshotPath,
    rootToken: 'root',
    outputDir: f.outputDir,
    hooks: { afterSwap() {} },
  }), /hook/i)
  assert.equal(fs.existsSync(f.outputDir), false)
})

test('CLI argument parsing rejects duplicates, unknowns, missing values, and traversal paths', () => {
  const cli = path.resolve(__dirname, 'guides-source-cache-generation.js')
  const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
  for (const argv of [
    ['keys', '--snapshot', 'snapshot.json', '--snapshot', 'other.json', '--run-id', '42', '--run-attempt', '2'],
    ['keys', '--wat', 'x', '--snapshot', 'snapshot.json', '--run-id', '42', '--run-attempt', '2'],
    ['keys', '--snapshot'],
    ['keys', '--snapshot', '../snapshot.json', '--run-id', '42', '--run-attempt', '2'],
    ['validate', '--payload', 'payload', '--snapshot', 'snapshot.json'],
  ]) {
    const result = run(argv)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /argument|duplicate|unknown|missing|path|root-token/i)
  }
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
    '--workspace', f.workspace,
    '--snapshot', f.snapshotPath,
    '--root-token', 'root',
    '--output', f.outputDir,
  ])
  assert.equal(created.status, 0, created.stderr)
  assert.equal(JSON.parse(created.stdout).output, path.resolve(f.outputDir))

  for (const [flag, value] of [
    ['--source-dir', f.sourceDir],
    ['--source-manifest', f.sourceManifestPath],
    ['--media-manifest', f.mediaManifestPath],
  ]) {
    const rejected = run([
      'create', '--workspace', f.workspace, '--snapshot', f.snapshotPath,
      '--root-token', 'root', '--output', path.join(f.root, 'rejected'), flag, value,
    ])
    assert.notEqual(rejected.status, 0)
    assert.match(rejected.stderr, /unknown argument/i)
  }

  const validated = run(['validate', '--payload', f.outputDir, '--snapshot', f.snapshotPath, '--root-token', 'root'])
  assert.equal(validated.status, 0, validated.stderr)
  assert.equal(JSON.parse(validated.stdout).valid, true)

  const workspace = path.join(f.root, 'promotion-workspace')
  fs.mkdirSync(workspace)
  const promoted = run(['promote', '--payload', f.outputDir, '--workspace', workspace, '--snapshot', f.snapshotPath, '--root-token', 'root'])
  assert.equal(promoted.status, 0, promoted.stderr)
  const live = livePaths(workspace)
  assert.equal(JSON.parse(promoted.stdout).sourceDir, live.sourceDir)
  assert.deepEqual(treeBytes(live.sourceDir), treeBytes(path.join(f.outputDir, 'sources')))
})
