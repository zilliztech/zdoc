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
const { buildManifest } = require('../translation/manifest')
const { createBatchSummary, selectManifestBatch } = require('../translation/batches')
const {createReconciliationOperation, createReconciliationPlan} = require('../translation/reconciliation-plan')

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

function candidate(name = 'a.md', hash = HASH_A, root = 'content/en/guides') {
  const plugin = root === 'content/en/guides' ? 'docs' : 'docs-byoc'
  return {
    sourcePath: `${root}/tutorials/${name}`,
    targetPath: `i18n/ja-JP/docusaurus-plugin-content-${plugin}/current/tutorials/${name}`,
    sourceHash: hash,
    locale: 'ja-JP',
    type: root === 'content/en/guides' ? 'guides' : 'byoc',
    reason: 'current_delta',
  }
}

function rename(oldName = 'old.md', newName = 'new.md', oldRoot = 'content/en/guides', newRoot = oldRoot) {
  const oldPlugin = oldRoot === 'content/en/guides' ? 'docs' : 'docs-byoc'
  const newPlugin = newRoot === 'content/en/guides' ? 'docs' : 'docs-byoc'
  return {
    oldPath: `${oldRoot}/tutorials/${oldName}`,
    newPath: `${newRoot}/tutorials/${newName}`,
    oldI18nPath: `i18n/ja-JP/docusaurus-plugin-content-${oldPlugin}/current/tutorials/${oldName}`,
    newI18nPath: `i18n/ja-JP/docusaurus-plugin-content-${newPlugin}/current/tutorials/${newName}`,
  }
}

function reconciliationPlan(renames = [rename()], deletions = []) {
  const list = Array.isArray(renames) ? renames : [renames]
  const operations = [
    ...list.map(renamed => createReconciliationOperation({kind: 'replace_path', sourcePath: renamed.oldPath, targetPath: renamed.oldI18nPath, replacementSourcePath: renamed.newPath, replacementTargetPath: renamed.newI18nPath, reason: 'source_replaced', evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null}, authorization: {status: 'approved', method: 'automatic', ruleId: 'test-policy:ja-JP:guides', receiptSha256: null}})),
    ...deletions.map(({sourcePath, targetPath}) => createReconciliationOperation({kind: 'delete_target', sourcePath, targetPath, replacementSourcePath: null, replacementTargetPath: null, reason: 'source_deleted', evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null}, authorization: {status: 'approved', method: 'automatic', ruleId: 'test-policy:ja-JP:guides', receiptSha256: null}})),
  ]
  return createReconciliationPlan({schemaVersion: 1, document: 'translation-reconciliation-plan', target: 'ja-JP', group: 'guides', toolingSha: '4'.repeat(40), sourceBaselineSha: '2'.repeat(40), sourceCheckpointSha: SHA, targetBaselineSha: '3'.repeat(40), policyId: 'test-policy', operations})
}

function canonicalBatch(overrides = {}) {
  const { reconciliationOwner, ...batch } = selectedManifest().batch
  return { ...batch, ...overrides }
}

function selectedManifest(overrides = {}) {
  const renamed = rename()
  const plan = reconciliationPlan(renamed)
  return {
    target: 'ja-JP',
    locale: 'ja-JP',
    group: 'guides',
    sourceCheckpointSha: SHA,
    generatedAt: '2026-07-18T00:00:00.000Z',
    items: [candidate('new.md')],
    reconciliation: {
      planArtifact: 'translation-reconciliation-plan-ja-JP-guides-1',
      planSha256: plan.planSha256,
      operationCount: plan.operations.length,
    },
    batch: {
      batchIndex: 0,
      batchNumber: 1,
      batchCount: 1,
      batchSize: 10,
      pendingCount: 1,
      pendingSetSha256: HASH_B,
      reconciliationOwner: true,
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
    batch: canonicalBatch(),
    candidates: [{
      sourcePath: renamed.newPath,
      targetPath: renamed.newI18nPath,
      sourceHash: HASH_A,
    }],
    reconciliation: {
      deletions: [],
      renames: [renamed],
    },
    ...overrides,
  }
}

test('creates exact canonical output and retains intrinsic rename overlaps', () => {
  assert.deepEqual(createBatchInput(selectedManifest(), reconciliationPlan()), batchInput())
})

test('derives legacy batch authority from the exact plan and assigns it only to batch zero', () => {
  const operation = createReconciliationOperation({kind: 'delete_target', sourcePath: 'content/en/guides/tutorials/old.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md', replacementSourcePath: null, replacementTargetPath: null, reason: 'source_deleted', evidence: {sourceExistedAtBaseline: true, sourceMissingAtCheckpoint: true, targetExistsAtBaseline: true, mappingIsCanonical: true, ownedByGroup: true, preserved: false, generatorCompletenessReceipt: null}, authorization: {status: 'approved', method: 'automatic', ruleId: 'test-policy:ja-JP:guides', receiptSha256: null}})
  const plan = createReconciliationPlan({schemaVersion: 1, document: 'translation-reconciliation-plan', target: 'ja-JP', group: 'guides', toolingSha: '4'.repeat(40), sourceBaselineSha: '2'.repeat(40), sourceCheckpointSha: SHA, targetBaselineSha: '3'.repeat(40), policyId: 'test-policy', operations: [operation]})
  const base = {
    target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: SHA,
    generatedAt: '2026-07-18T00:00:00.000Z', items: [candidate('new.md')],
    reconciliation: {planArtifact: 'translation-reconciliation-plan-ja-JP-guides-1', planSha256: plan.planSha256, operationCount: 1},
  }
  const first = createBatchInput({...base, batch: {batchIndex: 0, batchNumber: 1, batchCount: 2, batchSize: 1, pendingCount: 2, pendingSetSha256: HASH_B, reconciliationOwner: true}}, plan)
  const second = createBatchInput({...base, batch: {batchIndex: 1, batchNumber: 2, batchCount: 2, batchSize: 1, pendingCount: 2, pendingSetSha256: HASH_B, reconciliationOwner: false}}, plan)
  assert.deepEqual(first.reconciliation.deletions, [operation.targetPath])
  assert.deepEqual(second.reconciliation, {deletions: [], renames: []})
})

test('creates durable batch input from a canonical unified Guides manifest', () => {
  const siteDir = temporaryDirectory('translation-batch-unified-')
  const sourcePath = 'content/en/guides/tutorials/new.md'
  fs.mkdirSync(path.join(siteDir, path.dirname(sourcePath)), {recursive: true})
  fs.writeFileSync(path.join(siteDir, sourcePath), '# New\n')
  const plan = reconciliationPlan()
  const manifest = buildManifest({siteDir, group: 'guides', sourceCheckpointSha: SHA, reconciliation: {plan, planArtifact: 'translation-reconciliation-plan-ja-JP-guides-1'}})
  const summary = createBatchSummary(manifest, 10)
  const selected = selectManifestBatch(manifest, {
    batchIndex: 0,
    batchSize: 10,
    expectedPendingSetSha256: summary.pendingSetSha256,
  })

  const input = createBatchInput(selected, plan)
  assert.equal(input.candidates[0].sourcePath, sourcePath)
  assert.deepEqual(input.reconciliation, {deletions: [], renames: [rename()]})
})

test('sorts candidates, deletions, and renames deterministically', () => {
  const zRename = rename('z-old.md', 'z-new.md')
  const aRename = rename('a-old.md', 'a-new.md')
  const deleted = {
    sourcePath: 'content/en/guides/tutorials/deleted.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/deleted.md',
  }
  const plan = reconciliationPlan([aRename, zRename], [deleted])
  const actual = createBatchInput(selectedManifest({
    items: [candidate('z-new.md', HASH_B), candidate('a-new.md', HASH_A)],
    reconciliation: {
      planArtifact: 'translation-reconciliation-plan-ja-JP-guides-1',
      planSha256: plan.planSha256,
      operationCount: plan.operations.length,
    },
    batch: { ...selectedManifest().batch, pendingCount: 2 },
  }), plan)
  assert.deepEqual(actual.candidates.map(item => item.sourcePath), [aRename.newPath, zRename.newPath])
  assert.deepEqual(actual.reconciliation.deletions, [deleted.targetPath])
  assert.deepEqual(actual.reconciliation.renames, [aRename, zRename])
})

test('rejects unknown or missing keys at every manifest level', () => {
  const mutations = [
    value => { value.extra = true },
    value => { delete value.locale },
    value => { value.batch.extra = true },
    value => { delete value.batch.batchSize },
    value => { value.items[0].extra = true },
    value => { delete value.items[0].reason },
    value => { value.reconciliation.extra = true },
    value => { delete value.reconciliation.planSha256 },
    value => { delete value.reconciliation.operationCount },
    value => { value.batch.reconciliationOwner = 'yes' },
    value => { delete value.reconciliation.planArtifact },
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
    value => { value.reconciliation.extra = true },
    value => { delete value.reconciliation.deletions },
    value => { delete value.reconciliation.renames },
    value => { value.reconciliation.renames[0].extra = true },
    value => { delete value.reconciliation.renames[0].oldPath },
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
    batch: canonicalBatch({ pendingCount: 0 }),
    reconciliation: {
      deletions: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/deleted.md'],
      renames: [],
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
    reconciliation: { deletions: [], renames: [] },
  })
  assert.throws(() => validateBatchInput(ambiguous), /normal|ambiguous|path/i)
})

test('rejects duplicate entries, unrelated overlaps, and ancestor conflicts', () => {
  const duplicateCandidate = batchInput()
  duplicateCandidate.candidates.push({ ...duplicateCandidate.candidates[0] })
  assert.throws(() => validateBatchInput(duplicateCandidate), /duplicate/i)

  const duplicateDeletion = batchInput()
  duplicateDeletion.reconciliation.deletions = [duplicateDeletion.reconciliation.renames[0].oldI18nPath]
  duplicateDeletion.reconciliation.deletions.push(duplicateDeletion.reconciliation.deletions[0])
  assert.throws(() => validateBatchInput(duplicateDeletion), /duplicate/i)

  const duplicateRename = batchInput()
  duplicateRename.reconciliation.renames.push({ ...duplicateRename.reconciliation.renames[0] })
  assert.throws(() => validateBatchInput(duplicateRename), /duplicate|multiple/i)

  const unrelated = batchInput()
  unrelated.reconciliation.deletions.push(unrelated.candidates[0].targetPath)
  unrelated.reconciliation.deletions.sort()
  assert.throws(() => validateBatchInput(unrelated), /overlap|rename|conflict/i)

  const ancestor = batchInput({
    candidates: [
      { sourcePath: 'content/en/guides/tutorials/a.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', sourceHash: HASH_A },
      { sourcePath: 'content/en/guides/tutorials/a.md/b.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md/b.md', sourceHash: HASH_B },
    ],
    reconciliation: { deletions: [], renames: [] },
  })
  assert.throws(() => validateBatchInput(ancestor), /ancestor|directory|conflict/i)

  const nonAdjacentAncestor = batchInput({
    candidates: [
      { sourcePath: 'content/en/guides/tutorials/a.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', sourceHash: HASH_A },
      { sourcePath: 'content/en/guides/tutorials/a.md-b.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md-b.md', sourceHash: HASH_B },
      { sourcePath: 'content/en/guides/tutorials/a.md/b.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md/b.md', sourceHash: 'c'.repeat(64) },
    ],
    batch: { ...selectedManifest().batch, pendingCount: 3 },
    reconciliation: { deletions: [], renames: [] },
  })
  assert.throws(() => validateBatchInput(nonAdjacentAncestor), /ancestor|directory|conflict/i)
})

test('accepts only exact intrinsic rename overlaps and rejects near misses', () => {
  assert.doesNotThrow(() => validateBatchInput(batchInput()))

  const deletionAtNew = batchInput()
  deletionAtNew.reconciliation.deletions = [deletionAtNew.reconciliation.renames[0].newI18nPath]
  assert.throws(() => validateBatchInput(deletionAtNew), /overlap|rename|conflict/i)

  const candidateAtOld = batchInput()
  const r = candidateAtOld.reconciliation.renames[0]
  candidateAtOld.candidates[0] = { sourcePath: r.oldPath, targetPath: r.oldI18nPath, sourceHash: HASH_A }
  assert.throws(() => validateBatchInput(candidateAtOld), /overlap|rename|conflict/i)

  const mismatchedRename = batchInput()
  mismatchedRename.reconciliation.renames[0].newI18nPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/other.md'
  assert.throws(() => validateBatchInput(mismatchedRename), /mapping|suffix|rename/i)

  const twoRenamesOneDeletion = batchInput()
  const second = rename('old.md', 'other-new.md')
  twoRenamesOneDeletion.reconciliation.renames.push(second)
  assert.throws(() => validateBatchInput(twoRenamesOneDeletion), /duplicate|multiple|rename|overlap/i)

  const twoRenamesOneCandidate = batchInput()
  const duplicateNew = rename('other-old.md', 'new.md')
  twoRenamesOneCandidate.reconciliation.renames.push(duplicateNew)
  assert.throws(() => validateBatchInput(twoRenamesOneCandidate), /duplicate|multiple|rename|overlap/i)

  const chainedRenames = batchInput({
    candidates: [],
    batch: canonicalBatch({ pendingCount: 0 }),
    reconciliation: {
      deletions: [],
      renames: [rename('a.md', 'b.md'), rename('b.md', 'c.md')],
    },
  })
  assert.throws(() => validateBatchInput(chainedRenames), /duplicate|overlap|conflict/i)
})

test('canonical validation rejects non-deterministic array ordering', () => {
  const input = batchInput({
    candidates: [
      { sourcePath: 'content/en/guides/tutorials/z.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/z.md', sourceHash: HASH_A },
      { sourcePath: 'content/en/guides/tutorials/a.md', targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', sourceHash: HASH_B },
    ],
    batch: canonicalBatch({ pendingCount: 2 }),
    reconciliation: { deletions: [], renames: [] },
  })
  assert.throws(() => validateBatchInput(input), /canonical|sort|order/i)
})

test('rejects non-Guides manifests and unauthorized source-delta shapes', () => {
  assert.throws(() => createBatchInput(selectedManifest({ group: 'java' })), /guides|group/i)
  assert.throws(() => createBatchInput(selectedManifest({ locale: 'zh-CN' })), /ja-JP|locale/i)
  assert.throws(() => createBatchInput(selectedManifest({ reconciliation: { planArtifact: 'x', planSha256: 'sha256:' + '0'.repeat(64), operationCount: 1 } })), /key|schema|identity/i)
})

function cacheEntry(sourcePath, hash = HASH_A) {
  let targetPath
  if (sourcePath.startsWith('content/en/guides/tutorials/')) {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/${sourcePath.slice('content/en/guides/tutorials/'.length)}`
  } else if (sourcePath.startsWith('content/en/byoc/tutorials/')) {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/${sourcePath.slice('content/en/byoc/tutorials/'.length)}`
  } else if (sourcePath.startsWith('docs/tutorials/')) {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/${sourcePath.slice('docs/tutorials/'.length)}`
  } else if (sourcePath.startsWith('docs-byoc/tutorials/')) {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials/${sourcePath.slice('docs-byoc/tutorials/'.length)}`
  } else if (sourcePath.startsWith('content/en/reference/')) {
    targetPath = `i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/${sourcePath.slice('content/en/reference/'.length)}`
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
  input.reconciliation.deletions.push('i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/deleted.md')
  input.reconciliation.deletions.sort()
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
    batch: canonicalBatch({ pendingCount: 0 }),
    reconciliation: { deletions: [], renames: [rename()] },
  })
  const beforeRename = { files: { 'docs/tutorials/old.md': cacheEntry('docs/tutorials/old.md') } }
  const afterOldRemoval = { files: {} }
  assert.doesNotThrow(() => assertAuthorizedCacheChanges(beforeRename, afterOldRemoval, renameOnly))
  const afterNewAddition = { files: { 'docs/tutorials/new.md': cacheEntry('docs/tutorials/new.md') } }
  assert.throws(() => assertAuthorizedCacheChanges({ files: {} }, afterNewAddition, renameOnly), /unauthorized|cache|change/i)
})

test('accepts unchanged unified reference entries in a Guides batch cache', () => {
  const referencePath = 'content/en/reference/api/python/python/example.md'
  const before = { files: { [referencePath]: cacheEntry(referencePath) } }
  const after = structuredClone(before)
  const input = {
    schemaVersion: 1,
    group: 'guides',
    sourceCheckpointSha: SHA,
    batch: {batchIndex: 0, batchNumber: 1, batchCount: 1, batchSize: 10, pendingCount: 1, pendingSetSha256: HASH_B},
    candidates: [{
      sourcePath: 'content/en/guides/tutorials/new.md',
      targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md',
      sourceHash: HASH_A,
    }],
    reconciliation: {deletions: [], renames: []},
  }
  assert.doesNotThrow(() => assertAuthorizedCacheChanges(before, after, input))
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
  const renameOld = input.reconciliation.renames[0].oldPath
  const deletionKey = 'docs/tutorials/deleted.md'
  input.reconciliation.deletions.push('i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/deleted.md')
  input.reconciliation.deletions.sort()

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
  const planPath = path.join(dir, 'plan.json')
  const output = path.join(dir, 'batch.json')
  fs.writeFileSync(manifest, JSON.stringify(selectedManifest()))
  fs.writeFileSync(planPath, JSON.stringify(reconciliationPlan()))
  assert.equal(runCli(['create', '--manifest', manifest, '--plan', planPath, '--output', output]).status, 0)
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
  const linked = runCli(['create', '--manifest', link, '--plan', planPath, '--output', output])
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
  const planPath = path.join(root, 'plan.json')
  fs.writeFileSync(manifest, JSON.stringify(selectedManifest()))
  fs.writeFileSync(planPath, JSON.stringify(reconciliationPlan()))
  fs.writeFileSync(sentinel, 'outside sentinel\n')
  fs.symlinkSync(outside, alias)

  const replace = runCli(['create', '--manifest', manifest, '--plan', planPath, '--output', path.join(alias, 'batch.json')])
  assert.notEqual(replace.status, 0)
  assert.match(replace.stderr, /symlink|path chain|parent/i)
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'outside sentinel\n')

  const create = runCli(['create', '--manifest', manifest, '--plan', planPath, '--output', path.join(alias, 'missing.json')])
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
  const planPath = path.join(root, 'plan.json')
  fs.writeFileSync(manifest, JSON.stringify(selectedManifest()))
  fs.writeFileSync(planPath, JSON.stringify(reconciliationPlan()))
  const write = runCli(['create', '--manifest', manifest, '--plan', planPath, '--output', path.join(notDirectory, 'output.json')])
  assert.notEqual(write.status, 0)
  assert.match(write.stderr, /directory|path chain|ENOTDIR/i)
  assert.equal(fs.readFileSync(notDirectory, 'utf8'), 'sentinel\n')
})
