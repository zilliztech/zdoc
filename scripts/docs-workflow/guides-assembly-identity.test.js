'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const test = require('node:test')

const {
  assemblyDecisionSha256,
  decideAssembly,
  generatorFingerprint,
  navigationOwnershipProjection,
  semanticSourceProjection,
  validateAssemblyDecision,
  validateAssemblyResult,
  validateCommittedDescriptor,
  writeAssemblyResult,
  writeCommittedDescriptor,
} = require('./guides-assembly-identity')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const HASH_A = 'a'.repeat(64)
const ALLOWLIST = [
  'plugins/lark-docs/index.js',
  'plugins/lark-docs/larkDocWriter.js',
  'plugins/lark-docs/larkSourceIndex.js',
  'plugins/lark-docs/guidesBaseRecordSemantics.js',
  'scripts/docs-workflow/guides-assembly-identity.js',
  'scripts/docs-workflow/generate-guides-sidebars.js',
  'config/lark-docs.config.ts',
  'config/sidebar-overrides/guides.json',
  'config/sidebar-overrides/guides-byoc.json',
]

function hash(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }

function snapshot(overrides = {}) {
  return {
    schema_version: 3,
    manual: 'guides',
    targets_built: [],
    build_env: 'uat',
    base_app_token: 'base-token',
    generated_at: '2026-07-17T00:00:00.000Z',
    source_branch: null,
    publish_url: null,
    link_check_remote: 'https://docs.zilliz.com',
    source_dir: 'plugins/lark-docs/meta/sources/guides',
    records: [{
      record_id: 'record', placement_type: 'canonical', source_file: 'doc.json', source_hash: HASH_A,
      doc_token: 'doc', node_token: 'node', origin_node_token: 'origin', obj_token: 'object', obj_type: 'docx',
      outgoing_tokens: ['z', 'a'], doc_link: 'https://volatile.example/doc', revision_id: 'revision', obj_edit_time: '1',
    }],
    navigation_records: [{
      record_id: 'record', table_id: 'table', table_name: 'Tools', placement_type: 'canonical',
      parent_record_ids: ['parent-b', 'parent-a'], order: 2, title: 'Guide', labels: 'Guide', slug: 'guide',
      targets: ['zilliz.saas'], progress: 'Published', doc_token: 'doc', doc_link: 'https://example.test/doc',
      ref_target: 'Reference', ref_target_token: 'ref-token',
    }],
    table_digests: { table: 'b'.repeat(64) },
    ...overrides,
  }
}

function plan(overrides = {}) {
  return {
    mode: 'incremental', changed_tokens: [], removed_tokens: [], changed_records: [], removed_records: [], expanded_tokens: [],
    added_tokens: [], ...overrides,
  }
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-assembly-'))
  const baselineRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-assembly-baseline-'))
  for (const [index, relative] of ALLOWLIST.entries()) {
    const target = path.join(root, relative)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, `allowlist-${index}\n`)
  }
  const paths = {
    descriptor: 'baseline/assembly.json',
    saas: 'baseline/guides.sidebar.js',
    byoc: 'baseline/guides-byoc.sidebar.js',
    candidate: 'inputs/candidate.json',
    incremental: 'inputs/plan.json',
    decision: 'outputs/decision.json',
  }
  fs.mkdirSync(path.join(baselineRoot, 'baseline'), { recursive: true })
  fs.writeFileSync(path.join(baselineRoot, paths.saas), 'module.exports = ["saas"]\n')
  fs.writeFileSync(path.join(baselineRoot, paths.byoc), 'module.exports = ["byoc"]\n')
  return { root, baselineRoot, paths }
}

function cleanup(f) {
  fs.rmSync(f.root, { recursive: true, force: true })
  fs.rmSync(f.baselineRoot, { recursive: true, force: true })
}

function validDescriptor(f, candidate = snapshot(), masterSha = SHA_A) {
  return {
    schemaVersion: 1,
    semanticSourceGraphSha256: hash(JSON.stringify(semanticSourceProjection(candidate))),
    navigationOwnershipSha256: hash(JSON.stringify(navigationOwnershipProjection(candidate))),
    generatorFingerprintSha256: generatorFingerprint({ repositoryRoot: f.root, masterSha }),
    saasSidebarSha256: hash(fs.readFileSync(path.join(f.baselineRoot, f.paths.saas))),
    byocSidebarSha256: hash(fs.readFileSync(path.join(f.baselineRoot, f.paths.byoc))),
  }
}

function writeDescriptor(f, descriptor) {
  fs.writeFileSync(path.join(f.baselineRoot, f.paths.descriptor), JSON.stringify(descriptor))
}

function decide(f, overrides = {}) {
  return decideAssembly({
    candidateSnapshot: snapshot(), incrementalPlan: plan(), tableCount: 0,
    baselineDescriptorPath: f.paths.descriptor,
    baselineSaasSidebarPath: f.paths.saas,
    baselineByocSidebarPath: f.paths.byoc,
    repositoryRoot: f.root, baselineRoot: f.baselineRoot,
    masterSha: SHA_A, devBaselineSha: SHA_B, baselineSourceSha: SHA_B,
    generatedAt: '2026-07-17T01:02:03.000Z',
    ...overrides,
  })
}

test('semantic source identity ignores volatile fields and targets_built', () => {
  const baseline = snapshot()
  const changed = snapshot({
    targets_built: ['zilliz.saas', 'zilliz.paas'], generated_at: '2027-01-01T00:00:00Z',
    source_branch: 'dev', publish_url: 'https://other', link_check_remote: 'https://other', source_dir: '/tmp/other',
    records: [{ ...baseline.records[0], doc_link: 'https://other/doc', revision_id: 'other', obj_edit_time: '2' }],
  })
  assert.deepEqual(semanticSourceProjection(changed), semanticSourceProjection(baseline))
})

test('every approved semantic source field changes semantic identity', () => {
  const baseline = snapshot()
  const fields = ['record_id', 'source_file', 'source_hash', 'doc_token', 'node_token', 'origin_node_token', 'obj_token', 'obj_type']
  const baselineHash = hash(JSON.stringify(semanticSourceProjection(baseline)))
  for (const field of fields) {
    const value = field === 'source_hash' ? 'c'.repeat(64) : `other-${field}`
    assert.notEqual(hash(JSON.stringify(semanticSourceProjection(snapshot({ records: [{ ...baseline.records[0], [field]: value }] })))), baselineHash, field)
  }
  assert.notEqual(hash(JSON.stringify(semanticSourceProjection(snapshot({ base_app_token: 'other' })))), baselineHash)
  assert.notEqual(hash(JSON.stringify(semanticSourceProjection(snapshot({ build_env: 'prod' })))), baselineHash)
  assert.notEqual(hash(JSON.stringify(semanticSourceProjection(snapshot({ records: [{ ...baseline.records[0], outgoing_tokens: ['different'] }] })))), baselineHash)
  assert.throws(() => semanticSourceProjection(snapshot({ records: [{ ...baseline.records[0], placement_type: 'section' }] })), /placement/i)
})

test('every navigation field and table digest changes navigation ownership identity', () => {
  const baseline = snapshot()
  const baselineHash = hash(JSON.stringify(navigationOwnershipProjection(baseline)))
  const fields = ['record_id', 'table_name', 'placement_type', 'title', 'labels', 'slug', 'progress', 'doc_token', 'doc_link', 'ref_target', 'ref_target_token']
  for (const field of fields) {
    const value = field === 'placement_type' ? 'section' : `other-${field}`
    assert.notEqual(hash(JSON.stringify(navigationOwnershipProjection(snapshot({ navigation_records: [{ ...baseline.navigation_records[0], [field]: value }] })))), baselineHash, field)
  }
  assert.notEqual(hash(JSON.stringify(navigationOwnershipProjection(snapshot({
    navigation_records: [{ ...baseline.navigation_records[0], table_id: 'other-table' }],
    table_digests: { 'other-table': 'b'.repeat(64) },
  })))), baselineHash, 'table_id')
  for (const [field, value] of [['parent_record_ids', ['other']], ['order', 9], ['targets', ['zilliz.paas']]]) {
    assert.notEqual(hash(JSON.stringify(navigationOwnershipProjection(snapshot({ navigation_records: [{ ...baseline.navigation_records[0], [field]: value }] })))), baselineHash, field)
  }
  assert.notEqual(hash(JSON.stringify(navigationOwnershipProjection(snapshot({ table_digests: { table: 'd'.repeat(64) } })))), baselineHash)
})

test('projections are canonical and sort records, navigation arrays, and table digests', () => {
  const value = snapshot({
    records: [snapshot().records[0], { ...snapshot().records[0], record_id: 'aaa', doc_token: 'aaa', outgoing_tokens: ['b', 'a'] }],
    navigation_records: [
      { ...snapshot().navigation_records[0], table_id: 'z' },
      { ...snapshot().navigation_records[0], record_id: 'aaa', table_id: 'a', order: 1, parent_record_ids: ['z', 'a'], targets: ['z', 'a'] },
    ],
    table_digests: { z: 'c'.repeat(64), a: 'd'.repeat(64) },
  })
  assert.deepEqual(semanticSourceProjection(value).records.map(item => item.record_id), ['aaa', 'record'])
  assert.deepEqual(semanticSourceProjection(value).records[0].outgoing_tokens, ['a', 'b'])
  assert.deepEqual(navigationOwnershipProjection(value).navigation_records.map(item => item.record_id), ['aaa', 'record'])
  assert.deepEqual(navigationOwnershipProjection(value).navigation_records[0].parent_record_ids, ['a', 'z'])
  assert.deepEqual(navigationOwnershipProjection(value).table_digests.map(item => item.tableId), ['a', 'z'])
})

test('strict projections reject missing nullable fields, duplicates, unsafe source files, and coercive navigation', () => {
  const record = snapshot().records[0]
  for (const field of ['node_token', 'origin_node_token', 'obj_token', 'obj_type']) {
    const changed = { ...record }
    delete changed[field]
    assert.throws(() => semanticSourceProjection(snapshot({ records: [changed] })), new RegExp(field))
  }
  assert.throws(() => semanticSourceProjection(snapshot({ records: [record, { ...record, record_id: 'other' }] })), /duplicate.*doc_token/i)
  assert.throws(() => semanticSourceProjection(snapshot({ records: [{ ...record, source_file: '../escape.json' }] })), /source_file/i)
  assert.throws(() => semanticSourceProjection(snapshot({ records: [{ ...record, outgoing_tokens: ['a', 'a'] }] })), /duplicate/i)
  assert.throws(() => semanticSourceProjection(snapshot({ records: [{ ...record, node_token: '' }] })), /node_token/i)

  const navigation = snapshot().navigation_records[0]
  for (const field of ['table_name', 'doc_token', 'ref_target', 'ref_target_token']) {
    const changed = { ...navigation }
    delete changed[field]
    assert.throws(() => navigationOwnershipProjection(snapshot({ navigation_records: [changed] })), new RegExp(field))
  }
  for (const field of ['title', 'labels', 'slug', 'progress', 'doc_link', 'parent_record_ids', 'targets']) {
    const changed = { ...navigation }
    delete changed[field]
    assert.throws(() => navigationOwnershipProjection(snapshot({ navigation_records: [changed] })), new RegExp(field))
  }
  assert.throws(() => navigationOwnershipProjection(snapshot({ navigation_records: [{ ...navigation, order: '2' }] })), /order/i)
  assert.throws(() => navigationOwnershipProjection(snapshot({ navigation_records: [{ ...navigation, order: -0 }] })), /order/i)
  assert.throws(() => navigationOwnershipProjection(snapshot({ navigation_records: [{ ...navigation, parent_record_ids: ['a', 'a'] }] })), /duplicate/i)
  assert.throws(() => navigationOwnershipProjection(snapshot({ table_digests: { other: 'b'.repeat(64) } })), /table.*match|digest.*table/i)
})

test('generator fingerprint changes with masterSha and approved file bytes', () => {
  const f = fixture()
  try {
    const initial = generatorFingerprint({ repositoryRoot: f.root, masterSha: SHA_A })
    assert.notEqual(generatorFingerprint({ repositoryRoot: f.root, masterSha: SHA_B }), initial)
    fs.appendFileSync(path.join(f.root, ALLOWLIST[0]), 'changed')
    assert.notEqual(generatorFingerprint({ repositoryRoot: f.root, masterSha: SHA_A }), initial)
    fs.symlinkSync(path.join(f.root, ALLOWLIST[1]), path.join(f.root, 'linked.js'))
    fs.rmSync(path.join(f.root, ALLOWLIST[0]))
    fs.symlinkSync(path.join(f.root, 'linked.js'), path.join(f.root, ALLOWLIST[0]))
    assert.throws(() => generatorFingerprint({ repositoryRoot: f.root, masterSha: SHA_A }), /symlink|regular/i)
  } finally { cleanup(f) }
})

test('generator fingerprint fails closed when an intermediate allowlist parent is replaced before open', () => {
  const f = fixture()
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-assembly-outside-tooling-'))
  const parent = path.join(fs.realpathSync(f.root), 'plugins/lark-docs')
  const displaced = `${parent}.displaced`
  const targetFile = path.join(parent, 'index.js')
  fs.mkdirSync(outside, { recursive: true })
  fs.writeFileSync(path.join(outside, 'index.js'), 'outside tooling bytes')
  let swapped = false
  let outsideOpened = false
  const fsImpl = new Proxy(fs, {
    get(target, property) {
      if (property === 'lstatSync') return function (targetPath) {
        const stat = target.lstatSync(targetPath)
        if (!swapped && targetPath === targetFile) {
          swapped = true
          target.renameSync(parent, displaced)
          target.symlinkSync(outside, parent)
        }
        return stat
      }
      if (property === 'openSync') return function (targetPath, ...args) {
        if (swapped && targetPath === targetFile) outsideOpened = true
        return target.openSync(targetPath, ...args)
      }
      return target[property]
    },
  })
  try {
    assert.throws(() => generatorFingerprint({ repositoryRoot: f.root, masterSha: SHA_A, fsImpl }), /fingerprint|identity|directory|symlink/i)
    assert.equal(outsideOpened, false)
  } finally {
    cleanup(f)
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

test('baseline facts fail closed when an intermediate baseline parent is replaced before open', () => {
  const f = fixture()
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-assembly-outside-baseline-'))
  const parent = path.join(fs.realpathSync(f.baselineRoot), 'baseline')
  const displaced = `${parent}.displaced`
  const byocFile = path.join(parent, 'guides-byoc.sidebar.js')
  fs.writeFileSync(path.join(outside, 'guides-byoc.sidebar.js'), fs.readFileSync(byocFile))
  let swapped = false
  let outsideOpened = false
  const fsImpl = new Proxy(fs, {
    get(target, property) {
      if (property === 'lstatSync') return function (targetPath) {
        const stat = target.lstatSync(targetPath)
        if (!swapped && targetPath === byocFile) {
          swapped = true
          target.renameSync(parent, displaced)
          target.symlinkSync(outside, parent)
        }
        return stat
      }
      if (property === 'openSync') return function (targetPath, ...args) {
        if (swapped && targetPath === byocFile) outsideOpened = true
        return target.openSync(targetPath, ...args)
      }
      return target[property]
    },
  })
  try {
    writeDescriptor(f, validDescriptor(f))
    const decision = decide(f, { fsImpl })
    assert.equal(decision.mode, 'regenerate')
    assert.equal(decision.baselineByocSidebarValid, false)
    assert.equal(outsideOpened, false)
  } finally {
    cleanup(f)
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

test('missing read ancestors fail closed before a final target can appear through a symlink', () => {
  const f = fixture()
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-assembly-missing-parent-'))
  const missingParent = path.join(fs.realpathSync(f.baselineRoot), 'missing')
  const targetFile = path.join(missingParent, 'descriptor.json')
  fs.writeFileSync(path.join(outside, 'descriptor.json'), JSON.stringify(validDescriptor(f)))
  let finalTouched = false
  let outsideOpened = false
  const fsImpl = new Proxy(fs, {
    get(target, property) {
      if (property === 'lstatSync') return function (targetPath) {
        if (targetPath === targetFile) {
          finalTouched = true
          if (!target.existsSync(missingParent)) target.symlinkSync(outside, missingParent)
        }
        return target.lstatSync(targetPath)
      }
      if (property === 'openSync') return function (targetPath, ...args) {
        if (targetPath === targetFile) outsideOpened = true
        return target.openSync(targetPath, ...args)
      }
      return target[property]
    },
  })
  try {
    writeDescriptor(f, validDescriptor(f))
    const decision = decide(f, { baselineDescriptorPath: 'missing/descriptor.json', fsImpl })
    assert.equal(decision.mode, 'regenerate')
    assert.equal(decision.baselineDescriptorPresent, false)
    assert.equal(finalTouched, false)
    assert.equal(outsideOpened, false)
  } finally {
    cleanup(f)
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

test('reuse requires the exact schema-3 identity, empty delta, baseline facts, and sidebar bytes', () => {
  const f = fixture()
  try {
    const descriptor = validDescriptor(f)
    writeDescriptor(f, descriptor)
    const decision = decide(f)
    assert.equal(decision.mode, 'reuse')
    assert.deepEqual(decision.reasons, [])
    assert.equal(decision.semanticSourceGraphSha256, descriptor.semanticSourceGraphSha256)
    assert.equal(decision.navigationOwnershipSha256, descriptor.navigationOwnershipSha256)
    assert.equal(decision.generatorFingerprintSha256, descriptor.generatorFingerprintSha256)
    assert.equal(decision.baselineDescriptorPresent, true)
    assert.equal(decision.baselineDescriptorValid, true)
    assert.equal(decision.baselineSourceSha, SHA_B)
    assert.deepEqual(validateAssemblyDecision(decision, { masterSha: SHA_A, devBaselineSha: SHA_B }), decision)
  } finally { cleanup(f) }
})

test('assembly decision fingerprints only masterRoot and reads artifacts only from baselineRoot', () => {
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    fs.mkdirSync(path.join(f.root, 'baseline'), { recursive: true })
    fs.writeFileSync(path.join(f.root, f.paths.descriptor), '{"wrong":"descriptor"}')
    fs.writeFileSync(path.join(f.root, f.paths.saas), 'wrong master saas')
    fs.writeFileSync(path.join(f.root, f.paths.byoc), 'wrong master byoc')
    assert.equal(decide(f).mode, 'reuse')

    const baselineTooling = path.join(f.baselineRoot, ALLOWLIST[0])
    fs.mkdirSync(path.dirname(baselineTooling), { recursive: true })
    fs.writeFileSync(baselineTooling, 'baseline tooling must be ignored')
    assert.equal(decide(f).mode, 'reuse')

    fs.appendFileSync(path.join(f.root, ALLOWLIST[0]), 'master tooling changed')
    assert.deepEqual(decide(f).reasons, ['generator-fingerprint-mismatch'])

    fs.writeFileSync(path.join(f.root, ALLOWLIST[0]), 'allowlist-0\n')
    fs.appendFileSync(path.join(f.baselineRoot, f.paths.saas), 'baseline changed')
    assert.deepEqual(decide(f).reasons, ['saas-sidebar-hash-mismatch'])
    assert.throws(() => decide(f, { baselineDescriptorPath: '../escape.json' }), /baseline|safe|relative|escape/i)
  } finally { cleanup(f) }
})

test('regenerate reasons are bounded, deterministic, and non-cascading', () => {
  const scenarios = [
    ['baseline-source-sha-mismatch', f => decide(f, { baselineSourceSha: SHA_A })],
    ['source-delta', f => decide(f, { incrementalPlan: plan({ changed_tokens: ['doc'] }) })],
    ['source-delta', f => decide(f, { incrementalPlan: plan({ added_tokens: ['doc'] }) })],
    ['source-delta', f => decide(f, { incrementalPlan: plan({ removed_tokens: ['doc'] }) })],
    ['table-render-required', f => decide(f, { tableCount: 1 })],
    ['baseline-descriptor-missing', f => { fs.rmSync(path.join(f.baselineRoot, f.paths.descriptor)); return decide(f) }],
    ['baseline-descriptor-invalid', f => { fs.writeFileSync(path.join(f.baselineRoot, f.paths.descriptor), '{bad'); return decide(f) }],
    ['baseline-descriptor-invalid', f => { writeDescriptor(f, { ...validDescriptor(f), extra: true }); return decide(f) }],
    ['baseline-descriptor-invalid', f => { writeDescriptor(f, { ...validDescriptor(f), schemaVersion: 0 }); return decide(f) }],
    ['baseline-saas-sidebar-missing', f => { fs.rmSync(path.join(f.baselineRoot, f.paths.saas)); return decide(f) }],
    ['baseline-saas-sidebar-invalid', f => { const target = path.join(f.baselineRoot, f.paths.saas); fs.rmSync(target); fs.mkdirSync(target); return decide(f) }],
    ['baseline-saas-sidebar-invalid', f => { const target = path.join(f.baselineRoot, f.paths.saas); fs.rmSync(target); fs.symlinkSync(path.join(f.baselineRoot, f.paths.byoc), target); return decide(f) }],
    ['baseline-byoc-sidebar-missing', f => { fs.rmSync(path.join(f.baselineRoot, f.paths.byoc)); return decide(f) }],
    ['semantic-source-mismatch', (f, d) => decide(f, { candidateSnapshot: snapshot({ records: [{ ...snapshot().records[0], source_hash: 'c'.repeat(64) }] }) })],
    ['navigation-ownership-mismatch', f => decide(f, { candidateSnapshot: snapshot({ navigation_records: [{ ...snapshot().navigation_records[0], slug: 'other' }] }) })],
    ['generator-fingerprint-mismatch', f => decide(f, { masterSha: SHA_B })],
    ['saas-sidebar-hash-mismatch', f => { fs.appendFileSync(path.join(f.baselineRoot, f.paths.saas), 'tampered'); return decide(f) }],
    ['byoc-sidebar-hash-mismatch', f => { fs.appendFileSync(path.join(f.baselineRoot, f.paths.byoc), 'tampered'); return decide(f) }],
  ]
  for (const [expected, operation] of scenarios) {
    const f = fixture()
    try {
      writeDescriptor(f, validDescriptor(f))
      const decision = operation(f)
      assert.equal(decision.mode, 'regenerate', expected)
      assert.equal(decision.reasons.includes(expected), true, JSON.stringify(decision.reasons))
      assert.equal(decision.reasons.length <= 14, true)
      if (expected === 'baseline-descriptor-invalid') assert.deepEqual(decision.reasons, ['baseline-descriptor-invalid'])
    } finally { cleanup(f) }
  }
})

test('legacy schema-2 Guides candidates regenerate with deterministic unavailable marker hashes', () => {
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    const legacy = snapshot({ schema_version: 2 })
    const decision = decide(f, { candidateSnapshot: legacy })
    assert.equal(decision.mode, 'regenerate')
    assert.deepEqual(decision.reasons, ['unsupported-snapshot-schema'])
    assert.equal(decision.semanticSourceGraphSha256, hash(JSON.stringify({
      projectionVersion: 1, snapshotSchemaVersion: 2, unavailable: 'semantic-source',
    })))
    assert.equal(decision.navigationOwnershipSha256, hash(JSON.stringify({
      projectionVersion: 1, snapshotSchemaVersion: 2, unavailable: 'navigation-ownership',
    })))
    assert.throws(() => semanticSourceProjection(legacy), /schema.*3/i)
    assert.throws(() => navigationOwnershipProjection(legacy), /schema.*3/i)
    for (const invalid of [
      snapshot({ schema_version: 1 }), snapshot({ schema_version: 4 }), snapshot({ schema_version: '2' }),
      snapshot({ schema_version: undefined }), snapshot({ schema_version: 2, manual: 'other' }),
    ]) assert.throws(() => decide(f, { candidateSnapshot: invalid }), /schema|manual/i)
  } finally { cleanup(f) }
})

test('full, missing, null, and internally inconsistent plan deltas regenerate', () => {
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    for (const incrementalPlan of [
      null,
      { mode: 'full', changed_tokens: [], removed_tokens: [] },
      { mode: 'incremental', changed_tokens: null, removed_tokens: [] },
      { ...plan(), changed_tokens: [42] },
      { mode: 'incremental', changed_tokens: [], removed_tokens: [], changed_records: [{}] },
      { mode: 'incremental', changed_tokens: [], removed_tokens: [], removed_records: [{}] },
      { mode: 'incremental', changed_tokens: [], removed_tokens: [], expanded_tokens: ['doc'] },
    ]) {
      const decision = decide(f, { incrementalPlan })
      assert.equal(decision.mode, 'regenerate')
      assert.equal(decision.reasons.includes('source-delta'), true)
    }
    for (const key of ['changed_tokens', 'removed_tokens', 'changed_records', 'removed_records', 'expanded_tokens']) {
      const incrementalPlan = plan()
      delete incrementalPlan[key]
      assert.equal(decide(f, { incrementalPlan }).reasons.includes('source-delta'), true, key)
    }
    for (const key of ['changed_records', 'removed_records', 'expanded_tokens']) {
      assert.equal(decide(f, { incrementalPlan: { ...plan(), [key]: {} } }).reasons.includes('source-delta'), true, key)
    }
  } finally { cleanup(f) }
})

test('unsupported schema decisions cannot write committed descriptors but supported regenerate decisions can', () => {
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    const descriptor = validDescriptor(f)
    const supportedRegenerate = decide(f, { baselineSourceSha: SHA_A })
    const unsupported = decide(f, { candidateSnapshot: snapshot({ schema_version: 2 }) })
    const bound = {
      repositoryRoot: f.root, descriptor, decision: supportedRegenerate,
      expectedMasterSha: SHA_A, expectedDevBaselineSha: SHA_B,
      expectedDecisionSha256: assemblyDecisionSha256(supportedRegenerate),
    }
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/no-decision.json', decision: undefined }), /decision.*required/i)
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/no-master.json', expectedMasterSha: undefined }), /expected.*master/i)
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/no-baseline.json', expectedDevBaselineSha: undefined }), /expected.*baseline/i)
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/no-decision-hash.json', expectedDecisionSha256: undefined }), /expected.*decision/i)
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/stale-decision-hash.json', expectedDecisionSha256: 'f'.repeat(64) }), /decision.*hash|sha.*mismatch/i)
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/different-decision.json', decision: { ...supportedRegenerate, tableCount: 1 } }), /decision.*hash|sha.*mismatch/i)
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/stale-master.json', expectedMasterSha: SHA_B }), /master.*mismatch/i)
    assert.throws(() => writeCommittedDescriptor({ ...bound, outputPath: 'output/stale-baseline.json', expectedDevBaselineSha: SHA_A }), /baseline.*mismatch/i)
    assert.throws(() => writeCommittedDescriptor({
      ...bound, outputPath: 'output/identity-mismatch.json', descriptor: { ...descriptor, semanticSourceGraphSha256: 'f'.repeat(64) },
    }), /semantic.*mismatch|identity.*decision/i)
    assert.throws(() => writeCommittedDescriptor({
      ...bound, outputPath: 'output/unsupported.json', decision: unsupported,
      expectedDecisionSha256: assemblyDecisionSha256(unsupported),
    }), /unsupported.*snapshot|schema/i)
    assert.throws(() => writeCommittedDescriptor({
      ...bound, outputPath: 'output/marker.json', decision: { ...unsupported, reasons: ['source-delta'] },
      expectedDecisionSha256: assemblyDecisionSha256({ ...unsupported, reasons: ['source-delta'] }),
      descriptor: {
        ...descriptor,
        semanticSourceGraphSha256: unsupported.semanticSourceGraphSha256,
        navigationOwnershipSha256: unsupported.navigationOwnershipSha256,
      },
    }), /unsupported.*marker|snapshot.*schema/i)

    const regeneratedDescriptor = { ...descriptor, saasSidebarSha256: 'c'.repeat(64), byocSidebarSha256: 'd'.repeat(64) }
    writeCommittedDescriptor({ ...bound, outputPath: 'output/supported.json', descriptor: regeneratedDescriptor })
    assert.equal(fs.existsSync(path.join(f.root, 'output/supported.json')), true)

    const reuseDecision = decide(f)
    assert.throws(() => writeCommittedDescriptor({
      repositoryRoot: f.root, outputPath: 'output/reuse-changed-sidebar.json',
      descriptor: { ...descriptor, saasSidebarSha256: 'e'.repeat(64) }, decision: reuseDecision,
      expectedMasterSha: SHA_A, expectedDevBaselineSha: SHA_B,
      expectedDecisionSha256: assemblyDecisionSha256(reuseDecision),
    }), /reuse.*sidebar|sidebar.*baseline/i)
  } finally { cleanup(f) }
})

test('target, navigation, and table digest changes select regeneration', () => {
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    for (const candidateSnapshot of [
      snapshot({ navigation_records: [{ ...snapshot().navigation_records[0], targets: ['zilliz.paas'] }] }),
      snapshot({ navigation_records: [{ ...snapshot().navigation_records[0], parent_record_ids: ['different'] }] }),
      snapshot({ table_digests: { table: 'd'.repeat(64) } }),
    ]) {
      const decision = decide(f, { candidateSnapshot })
      assert.equal(decision.mode, 'regenerate')
      assert.equal(decision.reasons.includes('navigation-ownership-mismatch'), true)
    }
  } finally { cleanup(f) }
})

test('strict descriptor and decision validation reject extras, hashes, schemas, and expected SHA mismatches', () => {
  const f = fixture()
  try {
    const descriptor = validDescriptor(f)
    assert.deepEqual(validateCommittedDescriptor(descriptor), descriptor)
    assert.throws(() => validateCommittedDescriptor({ ...descriptor, extra: true }), /keys|extra/i)
    assert.throws(() => validateCommittedDescriptor({ ...descriptor, schemaVersion: 2 }), /schema/i)
    assert.throws(() => validateCommittedDescriptor({ ...descriptor, saasSidebarSha256: 'bad' }), /sha/i)
    writeDescriptor(f, descriptor)
    const decision = decide(f)
    assert.throws(() => validateAssemblyDecision({ ...decision, extra: true }), /keys|extra/i)
    assert.throws(() => validateAssemblyDecision({ ...decision, reasons: ['unknown'] }), /reason/i)
    assert.throws(() => validateAssemblyDecision({ ...decision, mode: 'reuse', reasons: [], tableCount: 1 }), /reuse|table/i)
    assert.throws(() => validateAssemblyDecision({ ...decision, mode: 'reuse', reasons: [], baselineSourceSha: SHA_A }), /reuse|baseline/i)
    assert.throws(() => validateAssemblyDecision({ ...decision, mode: 'reuse', reasons: [], baselineDescriptorValid: false, baselineDescriptorSha256: null }), /reuse|descriptor/i)
    assert.throws(() => validateAssemblyDecision(decision, { masterSha: SHA_B }), /master.*mismatch/i)
    assert.throws(() => validateAssemblyDecision(decision, { devBaselineSha: SHA_A }), /baseline.*mismatch/i)
  } finally { cleanup(f) }
})

test('assembly result is strict, bounded, and bound to the immutable decision', () => {
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    const reuseDecision = decide(f)
    const reuseHash = assemblyDecisionSha256(reuseDecision)
    const reuse = writeAssemblyResult({
      repositoryRoot: f.root,
      outputPath: 'outputs/reuse-result.json',
      decision: reuseDecision,
      expectedMasterSha: SHA_A,
      expectedDevBaselineSha: SHA_B,
      expectedDecisionSha256: reuseHash,
      elapsedMilliseconds: 42,
      saasEqual: true,
      byocEqual: true,
      descriptorVerified: true,
      generatedAt: '2026-07-17T02:03:04.000Z',
    })
    assert.deepEqual(reuse, {
      schemaVersion: 1,
      generated_at: '2026-07-17T02:03:04.000Z',
      mode: 'reuse_observed',
      decisionSha256: reuseHash,
      reasons: [],
      elapsedMilliseconds: 42,
      byteComparison: { required: true, saasEqual: true, byocEqual: true, descriptorVerified: true },
    })
    assert.deepEqual(validateAssemblyResult(JSON.parse(fs.readFileSync(path.join(f.root, 'outputs/reuse-result.json'), 'utf8')), reuseDecision), reuse)

    const regenerateDecision = decide(f, { baselineSourceSha: SHA_A })
    const regenerated = writeAssemblyResult({
      repositoryRoot: f.root,
      outputPath: 'outputs/regenerated-result.json',
      decision: regenerateDecision,
      expectedMasterSha: SHA_A,
      expectedDevBaselineSha: SHA_B,
      expectedDecisionSha256: assemblyDecisionSha256(regenerateDecision),
      elapsedMilliseconds: 0,
      saasEqual: null,
      byocEqual: null,
      descriptorVerified: true,
      generatedAt: '2026-07-17T02:03:05.000Z',
    })
    assert.equal(regenerated.mode, 'regenerated')
    assert.deepEqual(regenerated.reasons, ['baseline-source-sha-mismatch'])
    assert.deepEqual(regenerated.byteComparison, { required: false, saasEqual: null, byocEqual: null, descriptorVerified: true })

    for (const invalid of [
      { ...reuse, extra: true },
      { ...reuse, mode: 'regenerated' },
      { ...reuse, reasons: ['source-delta'] },
      { ...reuse, elapsedMilliseconds: -1 },
      { ...reuse, byteComparison: { ...reuse.byteComparison, saasEqual: false } },
      { ...regenerated, byteComparison: { ...regenerated.byteComparison, required: true } },
    ]) assert.throws(() => validateAssemblyResult(invalid, invalid.mode === 'reuse_observed' ? reuseDecision : regenerateDecision), /result|mode|reason|elapsed|comparison|reuse|regenerat/i)
  } finally { cleanup(f) }
})

test('malformed source, navigation, plans, digests, SHAs, and unsafe baseline paths are hard errors', () => {
  assert.throws(() => semanticSourceProjection(snapshot({ records: [{ ...snapshot().records[0], outgoing_tokens: 'bad' }] })), /outgoing/i)
  assert.throws(() => navigationOwnershipProjection(snapshot({ navigation_records: [{ ...snapshot().navigation_records[0], order: 'bad' }] })), /order/i)
  assert.throws(() => navigationOwnershipProjection(snapshot({ navigation_records: [{ ...snapshot().navigation_records[0], targets: 'bad' }] })), /targets/i)
  assert.throws(() => navigationOwnershipProjection(snapshot({ table_digests: { table: 'bad' } })), /digest/i)
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    assert.equal(decide(f, { incrementalPlan: { mode: 'incremental' } }).reasons.includes('source-delta'), true)
    assert.throws(() => decide(f, { masterSha: 'bad' }), /master.*sha/i)
    assert.throws(() => decide(f, { baselineRoot: undefined }), /baseline.*root/i)
    for (const tableCount of ['0', -1, 0.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => decide(f, { tableCount }), /tableCount/i)
    assert.throws(() => decide(f, { baselineDescriptorPath: '../escape.json' }), /safe|relative|escape/i)
  } finally { cleanup(f) }
})

test('committed descriptor writes atomically and verifies exact sidebar hashes', () => {
  const f = fixture()
  try {
    writeDescriptor(f, validDescriptor(f))
    const descriptor = validDescriptor(f)
    const decision = decide(f)
    const binding = {
      decision, expectedMasterSha: SHA_A, expectedDevBaselineSha: SHA_B,
      expectedDecisionSha256: assemblyDecisionSha256(decision),
    }
    const output = 'output/descriptor.json'
    writeCommittedDescriptor({ repositoryRoot: f.root, outputPath: output, descriptor, ...binding })
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.root, output), 'utf8')), descriptor)
    assert.deepEqual(validateCommittedDescriptor(JSON.parse(fs.readFileSync(path.join(f.root, output), 'utf8'))), descriptor)
    assert.deepEqual(fs.readdirSync(path.join(f.root, 'output')).filter(name => name.includes('.tmp-')), [])
    const linkedFinal = 'output/linked.json'
    fs.symlinkSync(path.join(f.root, output), path.join(f.root, linkedFinal))
    assert.throws(() => writeCommittedDescriptor({ repositoryRoot: f.root, outputPath: linkedFinal, descriptor, ...binding }), /symlink|regular/i)
    fs.mkdirSync(path.join(f.root, 'outside'))
    fs.symlinkSync(path.join(f.root, 'outside'), path.join(f.root, 'linked-parent'))
    assert.throws(() => writeCommittedDescriptor({ repositoryRoot: f.root, outputPath: 'linked-parent/descriptor.json', descriptor, ...binding }), /parent|symlink|directory/i)
  } finally { cleanup(f) }
})

test('descriptor writes fail closed when an intermediate output ancestor is replaced before staging', () => {
  const f = fixture()
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-assembly-output-outside-'))
  try {
    writeDescriptor(f, validDescriptor(f))
    const descriptor = validDescriptor(f)
    const decision = decide(f)
    const root = fs.realpathSync(f.root)
    const outputParent = path.join(root, 'output')
    const nestedParent = path.join(outputParent, 'nested')
    const displaced = `${outputParent}.displaced`
    const outputPath = 'output/nested/descriptor.json'
    const targetFile = path.join(root, outputPath)
    fs.mkdirSync(nestedParent, { recursive: true })
    fs.writeFileSync(targetFile, 'existing descriptor')
    fs.mkdirSync(path.join(outside, 'nested'), { recursive: true })
    let swapped = false
    let outsideOpened = false
    const fsImpl = new Proxy(fs, {
      get(target, property) {
        if (property === 'lstatSync') return function (targetPath) {
          const stat = target.lstatSync(targetPath)
          if (!swapped && targetPath === targetFile) {
            swapped = true
            target.renameSync(outputParent, displaced)
            target.symlinkSync(outside, outputParent)
          }
          return stat
        }
        if (property === 'openSync') return function (targetPath, ...args) {
          if (swapped && targetPath.startsWith(`${targetFile}.tmp-`)) outsideOpened = true
          return target.openSync(targetPath, ...args)
        }
        return target[property]
      },
    })
    assert.throws(() => writeCommittedDescriptor({
      repositoryRoot: f.root, outputPath, descriptor, decision,
      expectedMasterSha: SHA_A, expectedDevBaselineSha: SHA_B,
      expectedDecisionSha256: assemblyDecisionSha256(decision), fsImpl,
    }), /ancestor|directory|identity|symlink|recovery/i)
    assert.equal(outsideOpened, false)
    assert.equal(fs.readFileSync(path.join(displaced, 'nested/descriptor.json'), 'utf8'), 'existing descriptor')
  } finally {
    cleanup(f)
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

test('CLI rejects duplicate, unknown, missing flags, positional extras, and validates a decision', () => {
  const f = fixture()
  const cli = path.resolve(__dirname, 'guides-assembly-identity.js')
  try {
    writeDescriptor(f, validDescriptor(f))
    fs.mkdirSync(path.join(f.root, 'inputs'), { recursive: true })
    fs.writeFileSync(path.join(f.root, f.paths.candidate), JSON.stringify(snapshot()))
    fs.writeFileSync(path.join(f.root, f.paths.incremental), JSON.stringify(plan()))
    const args = [
      'decide', '--repository-root', f.root, '--candidate-snapshot', f.paths.candidate,
      '--baseline-root', f.baselineRoot,
      '--incremental-plan', f.paths.incremental, '--baseline-descriptor', f.paths.descriptor,
      '--baseline-saas-sidebar', f.paths.saas, '--baseline-byoc-sidebar', f.paths.byoc,
      '--master-sha', SHA_A, '--dev-baseline-sha', SHA_B, '--baseline-source-sha', SHA_B,
      '--table-count', '0', '--output', f.paths.decision,
    ]
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const decision = JSON.parse(fs.readFileSync(path.join(f.root, f.paths.decision), 'utf8'))
    assert.equal(decision.mode, 'reuse')
    const valid = spawnSync(process.execPath, [cli, 'validate-decision', '--repository-root', f.root, '--input', f.paths.decision, '--expected-master-sha', SHA_A, '--expected-dev-baseline-sha', SHA_B], { encoding: 'utf8' })
    assert.equal(valid.status, 0, valid.stderr)
    const currentSaas = 'outputs/guides.sidebar.js'
    const currentByoc = 'outputs/guides-byoc.sidebar.js'
    fs.mkdirSync(path.join(f.root, 'outputs'), { recursive: true })
    fs.copyFileSync(path.join(f.baselineRoot, f.paths.saas), path.join(f.root, currentSaas))
    fs.copyFileSync(path.join(f.baselineRoot, f.paths.byoc), path.join(f.root, currentByoc))
    const descriptorOutput = 'outputs/committed.json'
    const writeArgs = [
      'write-descriptor', '--repository-root', f.root, '--decision', f.paths.decision,
      '--expected-master-sha', SHA_A, '--expected-dev-baseline-sha', SHA_B,
      '--expected-decision-sha256', assemblyDecisionSha256(decision),
      '--saas-sidebar', currentSaas, '--byoc-sidebar', currentByoc, '--output', descriptorOutput,
    ]
    const written = spawnSync(process.execPath, [cli, ...writeArgs], { encoding: 'utf8' })
    assert.equal(written.status, 0, written.stderr)
    for (const [removedFlag, expected] of [
      ['--expected-master-sha', /expected-master-sha/i],
      ['--expected-dev-baseline-sha', /expected-dev-baseline-sha/i],
      ['--expected-decision-sha256', /expected-decision-sha256/i],
    ]) {
      const index = writeArgs.indexOf(removedFlag)
      const missingArgs = [...writeArgs.slice(0, index), ...writeArgs.slice(index + 2)]
      const missing = spawnSync(process.execPath, [cli, ...missingArgs], { encoding: 'utf8' })
      assert.notEqual(missing.status, 0)
      assert.match(missing.stderr, expected)
    }
    for (const [flag, value, expected] of [['--expected-master-sha', SHA_B, /master.*mismatch/i], ['--expected-dev-baseline-sha', SHA_A, /baseline.*mismatch/i]]) {
      const staleArgs = [...writeArgs]
      staleArgs[staleArgs.indexOf(flag) + 1] = value
      const stale = spawnSync(process.execPath, [cli, ...staleArgs], { encoding: 'utf8' })
      assert.notEqual(stale.status, 0)
      assert.match(stale.stderr, expected)
    }
    const verified = spawnSync(process.execPath, [cli, 'verify-descriptor', '--repository-root', f.root, '--descriptor', descriptorOutput, '--saas-sidebar', currentSaas, '--byoc-sidebar', currentByoc], { encoding: 'utf8' })
    assert.equal(verified.status, 0, verified.stderr)
    fs.appendFileSync(path.join(f.root, currentSaas), 'tamper')
    const rejected = spawnSync(process.execPath, [cli, 'verify-descriptor', '--repository-root', f.root, '--descriptor', descriptorOutput, '--saas-sidebar', currentSaas, '--byoc-sidebar', currentByoc], { encoding: 'utf8' })
    assert.notEqual(rejected.status, 0)

    const unsupportedPath = 'outputs/unsupported-decision.json'
    fs.writeFileSync(path.join(f.root, unsupportedPath), JSON.stringify(decide(f, { candidateSnapshot: snapshot({ schema_version: 2 }) })))
    const unsupportedDecision = JSON.parse(fs.readFileSync(path.join(f.root, unsupportedPath), 'utf8'))
    const unsupportedWrite = spawnSync(process.execPath, [cli, 'write-descriptor', '--repository-root', f.root, '--decision', unsupportedPath, '--expected-master-sha', SHA_A, '--expected-dev-baseline-sha', SHA_B, '--expected-decision-sha256', assemblyDecisionSha256(unsupportedDecision), '--saas-sidebar', currentSaas, '--byoc-sidebar', currentByoc, '--output', 'outputs/unsupported.json'], { encoding: 'utf8' })
    assert.notEqual(unsupportedWrite.status, 0)
    assert.match(unsupportedWrite.stderr, /unsupported.*snapshot|schema/i)
    for (const extra of [['--unknown', 'x'], ['positional'], ['--table-count', '0']]) {
      const failed = spawnSync(process.execPath, [cli, ...args, ...extra], { encoding: 'utf8' })
      assert.notEqual(failed.status, 0)
    }
  } finally { cleanup(f) }
})

test('CLI emits the canonical decision hash and writes a validated runtime result', () => {
  const f = fixture()
  const cli = path.resolve(__dirname, 'guides-assembly-identity.js')
  try {
    writeDescriptor(f, validDescriptor(f))
    const decision = decide(f)
    fs.mkdirSync(path.join(f.root, 'outputs'), { recursive: true })
    fs.writeFileSync(path.join(f.root, f.paths.decision), JSON.stringify(decision))
    const expectedHash = assemblyDecisionSha256(decision)
    const hashResult = spawnSync(process.execPath, [
      cli, 'decision-sha', '--repository-root', f.root, '--input', f.paths.decision,
      '--expected-master-sha', SHA_A, '--expected-dev-baseline-sha', SHA_B,
    ], { encoding: 'utf8' })
    assert.equal(hashResult.status, 0, hashResult.stderr)
    assert.equal(hashResult.stdout.trim(), expectedHash)

    const result = spawnSync(process.execPath, [
      cli, 'write-result', '--repository-root', f.root, '--decision', f.paths.decision,
      '--expected-master-sha', SHA_A, '--expected-dev-baseline-sha', SHA_B,
      '--expected-decision-sha256', expectedHash, '--elapsed-milliseconds', '7',
      '--saas-equal', 'true', '--byoc-equal', 'true', '--descriptor-verified', 'true',
      '--output', 'outputs/result.json',
    ], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, 'outputs/result.json'), 'utf8')).mode, 'reuse_observed')
  } finally { cleanup(f) }
})
