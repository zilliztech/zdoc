const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const {
  assertAuthorizedCacheChanges,
  createBatchInput,
  validateBatchInput,
  writeBatchInput,
} = require('./translation-batch-input')

test('exports the translation batch input API', () => {
  assert.equal(typeof assertAuthorizedCacheChanges, 'function')
  assert.equal(typeof createBatchInput, 'function')
  assert.equal(typeof validateBatchInput, 'function')
  assert.equal(typeof writeBatchInput, 'function')
})

const SHA = '1'.repeat(40)
const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)
const SCRIPT = path.join(__dirname, 'translation-batch-input.js')

function runCli(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' })
}

function temporaryDirectory(prefix) {
  return fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)))
}

function candidate(name = 'a.md', hash = HASH_A, root = 'docs') {
  const plugin = root === 'docs' ? 'docs' : 'docs-byoc'
  return {
    sourcePath: `${root}/tutorials/${name}`,
    targetPath: `i18n/ja-JP/docusaurus-plugin-content-${plugin}/current/tutorials/${name}`,
    sourceHash: hash,
    locale: 'ja-JP',
    type: root === 'docs' ? 'docs' : 'byoc',
    reason: 'current_delta',
  }
}

function rename(oldName = 'old.md', newName = 'new.md', oldRoot = 'docs', newRoot = oldRoot) {
  const oldPlugin = oldRoot === 'docs' ? 'docs' : 'docs-byoc'
  const newPlugin = newRoot === 'docs' ? 'docs' : 'docs-byoc'
  return {
    oldPath: `${oldRoot}/tutorials/${oldName}`,
    newPath: `${newRoot}/tutorials/${newName}`,
    oldI18nPath: `i18n/ja-JP/docusaurus-plugin-content-${oldPlugin}/current/tutorials/${oldName}`,
    newI18nPath: `i18n/ja-JP/docusaurus-plugin-content-${newPlugin}/current/tutorials/${newName}`,
  }
}

function selectedManifest(overrides = {}) {
  const renamed = rename()
  return {
    locale: 'ja-JP',
    group: 'guides',
    sourceCheckpointSha: SHA,
    generatedAt: '2026-07-18T00:00:00.000Z',
    items: [candidate('new.md')],
    source_delta: {
      deleted_i18n: [renamed.oldI18nPath],
      renamed: [renamed],
    },
    batch: {
      batchIndex: 0,
      batchNumber: 1,
      batchCount: 1,
      batchSize: 10,
      pendingCount: 1,
      pendingSetSha256: HASH_B,
    },
    ...overrides,
  }
}

function batchInput(overrides = {}) {
  const renamed = rename()
  return {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: SHA,
    batch: selectedManifest().batch,
    candidates: [{
      sourcePath: renamed.newPath,
      targetPath: renamed.newI18nPath,
      sourceHash: HASH_A,
    }],
    sourceDelta: {
      deletedI18n: [renamed.oldI18nPath],
      renamed: [renamed],
    },
    ...overrides,
  }
}

test('creates exact canonical output and retains intrinsic rename overlaps', () => {
  assert.deepEqual(createBatchInput(selectedManifest()), batchInput())
})

test('sorts candidates, deletions, and renames deterministically', () => {
  const zRename = rename('z-old.md', 'z-new.md')
  const aRename = rename('a-old.md', 'a-new.md')
  const actual = createBatchInput(selectedManifest({
    items: [candidate('z-new.md', HASH_B), candidate('a-new.md', HASH_A)],
    batch: { ...selectedManifest().batch, pendingCount: 2 },
    source_delta: {
      deleted_i18n: [zRename.oldI18nPath, aRename.oldI18nPath],
      renamed: [zRename, aRename],
    },
  }))
  assert.deepEqual(actual.candidates.map(item => item.sourcePath), [aRename.newPath, zRename.newPath])
  assert.deepEqual(actual.sourceDelta.deletedI18n, [aRename.oldI18nPath, zRename.oldI18nPath])
  assert.deepEqual(actual.sourceDelta.renamed, [aRename, zRename])
})

test('rejects unknown or missing keys at every manifest level', () => {
  const mutations = [
    value => { value.extra = true },
    value => { delete value.locale },
    value => { value.batch.extra = true },
    value => { delete value.batch.batchSize },
    value => { value.items[0].extra = true },
    value => { delete value.items[0].reason },
    value => { value.source_delta.extra = true },
    value => { delete value.source_delta.renamed },
    value => { value.source_delta.renamed[0].extra = true },
    value => { delete value.source_delta.renamed[0].newPath },
  ]
  for (const mutate of mutations) {
    const value = structuredClone(selectedManifest())
    mutate(value)
    assert.throws(() => createBatchInput(value), /key|schema|required/i)
  }
})

test('rejects unknown or missing keys at every canonical input level', () => {
  const mutations = [
    value => { value.extra = true },
    value => { delete value.group },
    value => { value.batch.extra = true },
    value => { delete value.batch.pendingCount },
    value => { value.candidates[0].extra = true },
    value => { delete value.candidates[0].sourceHash },
    value => { value.sourceDelta.extra = true },
    value => { delete value.sourceDelta.deletedI18n },
    value => { value.sourceDelta.renamed[0].extra = true },
    value => { delete value.sourceDelta.renamed[0].oldPath },
  ]
  for (const mutate of mutations) {
    const value = structuredClone(batchInput())
    mutate(value)
    assert.throws(() => validateBatchInput(value), /key|schema|required/i)
  }
})

test('rejects malformed hashes, numeric strings, and inconsistent batch numbers', () => {
  for (const [field, value] of [
    ['batchIndex', '0'], ['batchNumber', 0], ['batchCount', 0], ['batchSize', 0],
    ['pendingCount', -1], ['pendingSetSha256', 'A'.repeat(64)],
  ]) {
    const input = structuredClone(batchInput())
    input.batch[field] = value
    assert.throws(() => validateBatchInput(input), /batch|integer|hash|sha/i)
  }
  for (const hash of ['a'.repeat(63), 'A'.repeat(64), 'z'.repeat(64)]) {
    const input = structuredClone(batchInput())
    input.candidates[0].sourceHash = hash
    assert.throws(() => validateBatchInput(input), /hash/i)
  }
  for (const checkpoint of ['1'.repeat(39), 'G'.repeat(40)]) {
    assert.throws(() => validateBatchInput({ ...batchInput(), sourceCheckpointSha: checkpoint }), /checkpoint|sha/i)
  }
})

test('enforces selected item metadata and reconciliation batch arithmetic', () => {
  for (const [field, value] of [['locale', 'en-US'], ['type', 'byoc'], ['reason', 'unknown']]) {
    const manifest = selectedManifest()
    manifest.items[0][field] = value
    assert.throws(() => createBatchInput(manifest), /locale|type|reason|root/i)
  }
  const reconciliationOnly = batchInput({
    candidates: [],
    batch: { ...selectedManifest().batch, pendingCount: 0 },
    sourceDelta: {
      deletedI18n: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/deleted.md'],
      renamed: [],
    },
  })
  assert.doesNotThrow(() => validateBatchInput(reconciliationOnly))
  assert.throws(() => validateBatchInput({ ...reconciliationOnly, batch: { ...reconciliationOnly.batch, batchCount: 0 } }), /batch count|index/i)
  assert.throws(() => validateBatchInput({ ...batchInput(), candidates: [] }), /selected item count/i)
})

test('rejects unsafe paths, wrong roots, suffix mismatches, and invalid extensions', () => {
  const unsafe = ['/abs.md', '../x.md', 'docs\\tutorials\\x.md', 'docs/tutorials/a\0.md', 'docs/tutorials/a\n.md', 'docs/tutorials/a\r.md']
  for (const sourcePath of unsafe) {
    const input = structuredClone(batchInput())
    input.candidates[0].sourcePath = sourcePath
    assert.throws(() => validateBatchInput(input), /path|safe|relative/i)
  }
  const mismatches = [
    ['docs/other/a.md', 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'],
    ['docs/tutorials/a.txt', 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.txt'],
    ['docs/tutorials/a.md', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/a.md'],
    ['docs/tutorials/a.md', 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/b.md'],
  ]
  for (const [sourcePath, targetPath] of mismatches) {
    const input = structuredClone(batchInput())
    Object.assign(input.candidates[0], { sourcePath, targetPath })
    assert.throws(() => validateBatchInput(input), /guide|root|mapping|suffix|extension|path/i)
  }

  const decomposed = 'docs/tutorials/cafe\u0301.md'
  const ambiguous = batchInput({
    candidates: [{
      sourcePath: decomposed,
      targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/cafe\u0301.md',
      sourceHash: HASH_A,
    }],
    sourceDelta: { deletedI18n: [], renamed: [] },
  })
  assert.throws(() => validateBatchInput(ambiguous), /normal|ambiguous|path/i)
})

test('rejects duplicate entries, unrelated overlaps, and ancestor conflicts', () => {
  const duplicateCandidate = batchInput()
  duplicateCandidate.candidates.push({ ...duplicateCandidate.candidates[0] })
  assert.throws(() => validateBatchInput(duplicateCandidate), /duplicate/i)

  const duplicateDeletion = batchInput()
  duplicateDeletion.sourceDelta.deletedI18n.push(duplicateDeletion.sourceDelta.deletedI18n[0])
  assert.throws(() => validateBatchInput(duplicateDeletion), /duplicate/i)

  const duplicateRename = batchInput()
  duplicateRename.sourceDelta.renamed.push({ ...duplicateRename.sourceDelta.renamed[0] })
  assert.throws(() => validateBatchInput(duplicateRename), /duplicate|multiple/i)

  const unrelated = batchInput()
  unrelated.sourceDelta.deletedI18n.push(unrelated.candidates[0].targetPath)
  unrelated.sourceDelta.deletedI18n.sort()
  assert.throws(() => validateBatchInput(unrelated), /overlap|rename|conflict/i)

  const ancestor = batchInput({
    candidates: [
      { sourcePath: 'docs/tutorials/a.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', sourceHash: HASH_A },
      { sourcePath: 'docs/tutorials/a.md/b.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md/b.md', sourceHash: HASH_B },
    ],
    sourceDelta: { deletedI18n: [], renamed: [] },
  })
  assert.throws(() => validateBatchInput(ancestor), /ancestor|directory|conflict/i)

  const nonAdjacentAncestor = batchInput({
    candidates: [
      { sourcePath: 'docs/tutorials/a.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', sourceHash: HASH_A },
      { sourcePath: 'docs/tutorials/a.md-b.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md-b.md', sourceHash: HASH_B },
      { sourcePath: 'docs/tutorials/a.md/b.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md/b.md', sourceHash: 'c'.repeat(64) },
    ],
    batch: { ...selectedManifest().batch, pendingCount: 3 },
    sourceDelta: { deletedI18n: [], renamed: [] },
  })
  assert.throws(() => validateBatchInput(nonAdjacentAncestor), /ancestor|directory|conflict/i)
})

test('accepts only exact intrinsic rename overlaps and rejects near misses', () => {
  assert.doesNotThrow(() => validateBatchInput(batchInput()))

  const deletionAtNew = batchInput()
  deletionAtNew.sourceDelta.deletedI18n = [deletionAtNew.sourceDelta.renamed[0].newI18nPath]
  assert.throws(() => validateBatchInput(deletionAtNew), /overlap|rename|conflict/i)

  const candidateAtOld = batchInput()
  const r = candidateAtOld.sourceDelta.renamed[0]
  candidateAtOld.candidates[0] = { sourcePath: r.oldPath, targetPath: r.oldI18nPath, sourceHash: HASH_A }
  assert.throws(() => validateBatchInput(candidateAtOld), /overlap|rename|conflict/i)

  const mismatchedRename = batchInput()
  mismatchedRename.sourceDelta.renamed[0].newI18nPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/other.md'
  assert.throws(() => validateBatchInput(mismatchedRename), /mapping|suffix|rename/i)

  const twoRenamesOneDeletion = batchInput()
  const second = rename('old.md', 'other-new.md')
  twoRenamesOneDeletion.sourceDelta.renamed.push(second)
  assert.throws(() => validateBatchInput(twoRenamesOneDeletion), /duplicate|multiple|rename|overlap/i)

  const twoRenamesOneCandidate = batchInput()
  const duplicateNew = rename('other-old.md', 'new.md')
  twoRenamesOneCandidate.sourceDelta.renamed.push(duplicateNew)
  assert.throws(() => validateBatchInput(twoRenamesOneCandidate), /duplicate|multiple|rename|overlap/i)

  const chainedRenames = batchInput({
    candidates: [],
    batch: { ...selectedManifest().batch, pendingCount: 0 },
    sourceDelta: {
      deletedI18n: [],
      renamed: [rename('a.md', 'b.md'), rename('b.md', 'c.md')],
    },
  })
  assert.throws(() => validateBatchInput(chainedRenames), /duplicate|overlap|conflict/i)
})

test('canonical validation rejects non-deterministic array ordering', () => {
  const input = batchInput({
    candidates: [
      { sourcePath: 'docs/tutorials/z.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/z.md', sourceHash: HASH_A },
      { sourcePath: 'docs/tutorials/a.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', sourceHash: HASH_B },
    ],
    batch: { ...selectedManifest().batch, pendingCount: 2 },
    sourceDelta: { deletedI18n: [], renamed: [] },
  })
  assert.throws(() => validateBatchInput(input), /canonical|sort|order/i)
})

test('rejects non-Guides manifests and unauthorized source-delta shapes', () => {
  assert.throws(() => createBatchInput(selectedManifest({ group: 'java' })), /guides|group/i)
  assert.throws(() => createBatchInput(selectedManifest({ locale: 'zh-CN' })), /ja-JP|locale/i)
  assert.throws(() => createBatchInput(selectedManifest({ source_delta: { changedEnglish: [], deleted_i18n: [], renamed: [] } })), /key|source.delta|schema/i)
})

function cacheEntry(sourcePath, hash = HASH_A) {
  let targetPath
  if (sourcePath.startsWith('docs/tutorials/')) {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/${sourcePath.slice('docs/tutorials/'.length)}`
  } else if (sourcePath.startsWith('docs-byoc/tutorials/')) {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/${sourcePath.slice('docs-byoc/tutorials/'.length)}`
  } else {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/${sourcePath.slice('reference/'.length)}`
  }
  return { sourceHash: hash, targetPath, translatedAt: '2026-07-18T00:00:00.000Z' }
}

test('authorizes only candidate, rename, and deletion-derived cache changes', () => {
  const input = batchInput()
  const before = { files: {
    'docs/tutorials/old.md': cacheEntry('docs/tutorials/old.md'),
    'docs/tutorials/new.md': cacheEntry('docs/tutorials/new.md'),
    'docs/tutorials/deleted.md': cacheEntry('docs/tutorials/deleted.md'),
    'docs/tutorials/stable.md': cacheEntry('docs/tutorials/stable.md'),
  } }
  input.sourceDelta.deletedI18n.push('i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/deleted.md')
  input.sourceDelta.deletedI18n.sort()
  const after = structuredClone(before)
  delete after.files['docs/tutorials/old.md']
  delete after.files['docs/tutorials/deleted.md']
  after.files['docs/tutorials/new.md'] = cacheEntry('docs/tutorials/new.md', HASH_A)
  assert.doesNotThrow(() => assertAuthorizedCacheChanges(before, after, input))

  for (const key of ['reference/api/node/a.md', 'docs/tutorials/stable.md']) {
    const changed = structuredClone(after)
    changed.files[key] = cacheEntry(key, HASH_B)
    assert.throws(() => assertAuthorizedCacheChanges(before, changed, input), /unauthorized|cache|change/i)
  }
  const deletedStable = structuredClone(after)
  delete deletedStable.files['docs/tutorials/stable.md']
  assert.throws(() => assertAuthorizedCacheChanges(before, deletedStable, input), /unauthorized|cache|change/i)

  const renameOnly = batchInput({
    candidates: [],
    batch: { ...selectedManifest().batch, pendingCount: 0 },
    sourceDelta: { deletedI18n: [], renamed: [rename()] },
  })
  const beforeRename = { files: { 'docs/tutorials/old.md': cacheEntry('docs/tutorials/old.md') } }
  const afterOldRemoval = { files: {} }
  assert.doesNotThrow(() => assertAuthorizedCacheChanges(beforeRename, afterOldRemoval, renameOnly))
  const afterNewAddition = { files: { 'docs/tutorials/new.md': cacheEntry('docs/tutorials/new.md') } }
  assert.throws(() => assertAuthorizedCacheChanges({ files: {} }, afterNewAddition, renameOnly), /unauthorized|cache|change/i)
})

test('binds candidate cache additions and changes to exact batch values', () => {
  const input = batchInput()
  const key = input.candidates[0].sourcePath
  const exact = cacheEntry(key, input.candidates[0].sourceHash)
  assert.doesNotThrow(() => assertAuthorizedCacheChanges({ files: {} }, { files: { [key]: exact } }, input))

  const previous = cacheEntry(key, HASH_B)
  const changed = { ...exact, translatedAt: '2026-07-18T01:00:00.000Z' }
  assert.doesNotThrow(() => assertAuthorizedCacheChanges({ files: { [key]: previous } }, { files: { [key]: changed } }, input))
  assert.doesNotThrow(() => assertAuthorizedCacheChanges({ files: { [key]: previous } }, { files: { [key]: previous } }, input))

  for (const result of [
    { ...exact, sourceHash: HASH_B },
    { ...exact, targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/wrong.md' },
    { ...exact, translatedAt: 'today' },
  ]) {
    assert.throws(
      () => assertAuthorizedCacheChanges({ files: {} }, { files: { [key]: result } }, input),
      /candidate|cache|hash|target|timestamp/i,
    )
  }
  assert.throws(
    () => assertAuthorizedCacheChanges(
      { files: { [key]: exact } },
      { files: { [key]: { ...exact, sourceHash: HASH_B } } },
      input,
    ),
    /candidate|cache|hash/i,
  )

  assert.throws(
    () => assertAuthorizedCacheChanges({ files: { [key]: exact } }, { files: {} }, input),
    /candidate|removal|unauthorized/i,
  )
})

test('allows deletion and rename-old cache identities to be removed only', () => {
  const input = batchInput()
  const renameOld = input.sourceDelta.renamed[0].oldPath
  const deletionKey = 'docs/tutorials/deleted.md'
  input.sourceDelta.deletedI18n.push('i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/deleted.md')
  input.sourceDelta.deletedI18n.sort()

  for (const key of [renameOld, deletionKey]) {
    const existing = cacheEntry(key)
    assert.doesNotThrow(() => assertAuthorizedCacheChanges({ files: { [key]: existing } }, { files: {} }, input))
    assert.doesNotThrow(() => assertAuthorizedCacheChanges({ files: {} }, { files: {} }, input))
    assert.doesNotThrow(() => assertAuthorizedCacheChanges({ files: { [key]: existing } }, { files: { [key]: existing } }, input))
    assert.throws(
      () => assertAuthorizedCacheChanges({ files: {} }, { files: { [key]: existing } }, input),
      /removal|unauthorized|cache/i,
    )
    assert.throws(
      () => assertAuthorizedCacheChanges(
        { files: { [key]: existing } },
        { files: { [key]: { ...existing, sourceHash: HASH_B } } },
        input,
      ),
      /removal|unauthorized|cache/i,
    )
  }
})

test('rejects malformed caches, prototype keys, and ambiguous paths', () => {
  const valid = { files: { 'docs/tutorials/a.md': cacheEntry('docs/tutorials/a.md') } }
  const malformed = [
    {},
    { files: [] },
    { files: { 'docs/tutorials/a.md': { ...cacheEntry('docs/tutorials/a.md'), extra: true } } },
    { files: { 'docs/tutorials/a.md': { ...cacheEntry('docs/tutorials/a.md'), sourceHash: 'bad' } } },
    { files: { 'docs/tutorials/a.md': { ...cacheEntry('docs/tutorials/a.md'), translatedAt: 'today' } } },
    { files: { 'docs/tutorials/a/../b.md': cacheEntry('docs/tutorials/b.md') } },
  ]
  for (const cache of malformed) {
    assert.throws(() => assertAuthorizedCacheChanges(cache, valid, batchInput()), /cache|schema|path|hash|timestamp|key/i)
  }
  const polluted = JSON.parse('{"files":{"__proto__":{"sourceHash":"' + HASH_A + '","targetPath":"x","translatedAt":"2026-07-18T00:00:00.000Z"}}}')
  assert.throws(() => assertAuthorizedCacheChanges(polluted, valid, batchInput()), /prototype|key|cache/i)
})

test('writes canonical JSON atomically and preserves an existing file on validation failure', () => {
  const dir = temporaryDirectory('translation-batch-input-')
  const output = path.join(dir, 'batch.json')
  fs.writeFileSync(output, 'old\n')
  assert.throws(() => writeBatchInput(output, { nope: true }), /schema|key|required/i)
  assert.equal(fs.readFileSync(output, 'utf8'), 'old\n')
  writeBatchInput(output, batchInput())
  assert.equal(fs.readFileSync(output, 'utf8'), `${JSON.stringify(batchInput(), null, 2)}\n`)
  assert.equal(fs.readdirSync(dir).length, 1)
})

test('CLI create and validate use strict flags and reject symlink reads', () => {
  const dir = temporaryDirectory('translation-batch-cli-')
  const manifest = path.join(dir, 'manifest.json')
  const output = path.join(dir, 'batch.json')
  fs.writeFileSync(manifest, JSON.stringify(selectedManifest()))
  assert.equal(runCli(['create', '--manifest', manifest, '--output', output]).status, 0)
  assert.deepEqual(JSON.parse(fs.readFileSync(output, 'utf8')), batchInput())
  assert.equal(runCli(['validate', '--input', output]).status, 0)
  for (const args of [
    [], ['wat'], ['create', '--manifest', manifest],
    ['validate', '--input', output, '--input', output],
    ['validate', '--input', output, 'extra'],
    ['validate', '--input', output, '--unknown', 'x'],
  ]) assert.notEqual(runCli(args).status, 0)

  const link = path.join(dir, 'manifest-link.json')
  fs.symlinkSync(manifest, link)
  const linked = runCli(['create', '--manifest', link, '--output', output])
  assert.notEqual(linked.status, 0)
  assert.match(linked.stderr, /symlink|regular/i)
})

test('CLI rejects manifest and batch inputs beneath a symlinked parent', () => {
  const root = temporaryDirectory('translation-batch-input-parent-')
  const outside = temporaryDirectory('translation-batch-input-outside-')
  const alias = path.join(root, 'outside-alias')
  const manifest = path.join(outside, 'manifest.json')
  const input = path.join(outside, 'input.json')
  fs.writeFileSync(manifest, JSON.stringify(selectedManifest()))
  fs.writeFileSync(input, JSON.stringify(batchInput()))
  fs.symlinkSync(outside, alias)

  const create = runCli(['create', '--manifest', path.join(alias, 'manifest.json'), '--output', path.join(root, 'output.json')])
  assert.notEqual(create.status, 0)
  assert.match(create.stderr, /symlink|path chain|parent/i)
  assert.equal(fs.existsSync(path.join(root, 'output.json')), false)

  const validate = runCli(['validate', '--input', path.join(alias, 'input.json')])
  assert.notEqual(validate.status, 0)
  assert.match(validate.stderr, /symlink|path chain|parent/i)
})

test('CLI rejects output beneath a symlinked parent without touching outside files', () => {
  const root = temporaryDirectory('translation-batch-output-parent-')
  const outside = temporaryDirectory('translation-batch-output-outside-')
  const manifest = path.join(root, 'manifest.json')
  const alias = path.join(root, 'outside-alias')
  const sentinel = path.join(outside, 'batch.json')
  const missing = path.join(outside, 'missing.json')
  fs.writeFileSync(manifest, JSON.stringify(selectedManifest()))
  fs.writeFileSync(sentinel, 'outside sentinel\n')
  fs.symlinkSync(outside, alias)

  const replace = runCli(['create', '--manifest', manifest, '--output', path.join(alias, 'batch.json')])
  assert.notEqual(replace.status, 0)
  assert.match(replace.stderr, /symlink|path chain|parent/i)
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'outside sentinel\n')

  const create = runCli(['create', '--manifest', manifest, '--output', path.join(alias, 'missing.json')])
  assert.notEqual(create.status, 0)
  assert.match(create.stderr, /symlink|path chain|parent/i)
  assert.equal(fs.existsSync(missing), false)
})

test('CLI rejects nested non-directory parents for reads and writes', () => {
  const root = temporaryDirectory('translation-batch-nondirectory-')
  const notDirectory = path.join(root, 'not-a-directory')
  fs.writeFileSync(notDirectory, 'sentinel\n')

  const read = runCli(['validate', '--input', path.join(notDirectory, 'input.json')])
  assert.notEqual(read.status, 0)
  assert.match(read.stderr, /directory|path chain|ENOTDIR/i)

  const manifest = path.join(root, 'manifest.json')
  fs.writeFileSync(manifest, JSON.stringify(selectedManifest()))
  const write = runCli(['create', '--manifest', manifest, '--output', path.join(notDirectory, 'output.json')])
  assert.notEqual(write.status, 0)
  assert.match(write.stderr, /directory|path chain|ENOTDIR/i)
  assert.equal(fs.readFileSync(notDirectory, 'utf8'), 'sentinel\n')
})
