'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {fixture, regenerate, image} = require('./replay-shared-pages')
const {digest} = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const regeneration = require('./guides-shared-regeneration')

async function candidate(t) {
  const options = await fixture(t, {pages: ['sample'], imageSource: true})
  options.imageBaseUrl = 'https://images.example.test'; options.sequence = 0
  const bundle = await regenerate(options)
  assert.equal(bundle.outcomes[0].status, 'success', JSON.stringify(bundle.outcomes))
  const outcome = bundle.outcomes[0]
  const receipt = JSON.parse(fs.readFileSync(path.join(options.out, outcome.receipt)))
  const outputs = outcome.outputs.map(row => ({...row, bytes: fs.readFileSync(path.join(options.out, row.file))}))
  return {options, bundle, outcome, receipt, outputs}
}
function replay(value) {
  return regeneration.regenerateReceipt({receipt: value.receipt, navigation: value.bundle.navigation,
    repositoryRoot: value.options.repositoryRoot, baselineRoot: value.options.baselineRoot, repo: value.options.repo,
    scratch: value.options.scratch, outputs: value.outputs,
    readAcceptedImage: async () => image}, {assertToolIdentity: () => {}})
}
for (const mutation of ['digest', 'bytes', 'missing', 'extra', 'inventory']) test(`[PUBLISH_REGEN_MISMATCH] independent replay rejects ${mutation} with file evidence`, async t => {
  const value = await candidate(t)
  if (mutation === 'digest') value.receipt.outputs[0].sha256 = '0'.repeat(64)
  if (mutation === 'bytes') value.outputs[0].bytes = Buffer.from('tampered')
  if (mutation === 'missing') value.outputs.pop()
  if (mutation === 'extra') value.outputs.push({...value.outputs[0], path: 'content/en/guides/tutorials/manage-data/extra.md'})
  if (mutation === 'inventory') value.receipt.inputs.zdoc.files[0].sha256 = '0'.repeat(64)
  await assert.rejects(replay(value), error => {
    assert.equal(error.code, 'PUBLISH_REGEN_MISMATCH')
    assert.ok(error.detail.length)
    assert.ok(error.detail.every(row => row.page === 'sample' && row.file && 'expected' in row && 'actual' in row))
    return true
  })
})
test('[PUBLISH_REGEN_MISMATCH] structured destinations exclude inline and fenced code', () => {
  const address = `shared/${digest(image)}.png`, base = 'https://images.example.test'
  const source = `![real](${address})\n<img src="${address}" />\n\`${address}\`\n\`\`\`md\n![code](${address})\nhttps://origin.test/a.png\n\`\`\`\n`
  assert.equal(regeneration.rewriteImageDestinations(source, [{object: address}], base), source.replace(`](${address})`, `](${base}/${address})`).replace(`src="${address}"`, `src="${base}/${address}"`))
})
test('bounded replay proof binds draft and permanent navigation plus actual output set', async t => {
  const value = await candidate(t)
  const proof = await replay(value)
  regeneration.validateRegenerationEvidence(proof, value.receipt, value.outputs)
  const final = structuredClone(value.receipt); final.inputs.fetch.navigation = value.bundle.navigation
  regeneration.validateRegenerationEvidence(proof, final, value.outputs)
  assert.throws(() => regeneration.validateRegenerationEvidence({...proof, inputs_sha256: '0'.repeat(64)}, final, value.outputs), /PUBLISH_REGEN_MISMATCH/)
  assert.throws(() => regeneration.validateRegenerationEvidence({passed: true}, final, value.outputs), /PUBLISH_REGEN_MISMATCH/)
})

const {prepare} = require('./replay-shared-pages')
const {git, snapshotPath} = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const {loadBundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle')
const publication = require('../../packages/docs-tooling/src/lark/sharedPagePublication')
function commit(root, message) {git(root, ['add', '.']); git(root, ['-c', 'user.name=Replay', '-c', 'user.email=replay@example.test', 'commit', '--quiet', '-m', message]); return git(root, ['rev-parse', 'HEAD']).toString().trim()}
function put(root, file, bytes) {fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), bytes)}
function finalize(options, bundle) {
  const handoff = loadBundle(options.out)
  for (const outcome of bundle.outcomes) for (const output of outcome.status === 'success' ? outcome.outputs : outcome.baseline.outputs) put(options.baselineRoot, output.path, handoff.files.get(output.file))
  const result = publication.finalizePublication({workspace: options.baselineRoot, handoff, candidate: options.candidate})
  put(options.baselineRoot, snapshotPath, JSON.stringify(result.snapshot))
  return result
}
for (const baseline of ['legacy', 'new', 'active']) test(`[PUBLISH_REGEN_MISMATCH] real broad image replacement falls back ${baseline} page and preserves successful sibling`, async t => {
  const options = await fixture(t, {pages: ['sample', 'sibling'], old: baseline !== 'new'})
  options.imageBaseUrl = 'https://images.example.test'; options.sequence = 0
  if (baseline === 'active') {
    const first = await regenerate(options)
    assert.ok(first.outcomes.every(row => row.status === 'success'), JSON.stringify(first.outcomes))
    finalize(options, first)
    options.devCommit = commit(options.baselineRoot, 'Accepted shared baseline')
  }
  const oldReceipt = baseline === 'active' ? fs.readFileSync(path.join(options.baselineRoot, `${publication.MANIFEST}/sample.json`)) : null
  const address = `shared/${digest(image)}.png`
  const sourceFile = path.join(options.repo, 'site/en/sample.md')
  fs.writeFileSync(sourceFile, fs.readFileSync(sourceFile, 'utf8').replace('![Diagram](assets/diagram.png)', '![Diagram](https://origin.test/diagram.png)'))
  fs.appendFileSync(sourceFile, `\n\`${address}\` and \`https://origin.test/diagram.png\`\n\n\`\`\`md\n![code](${address})\nhttps://origin.test/diagram.png\n\`\`\`\n`)
  const next = commit(options.repo, 'Literal image addresses inside code')
  for (const page of ['sample', 'sibling']) put(options.repositoryRoot, `shared-docs/guides/pages/${page}/lock.yaml`, JSON.stringify({schema_version: 1, current: next, next}))
  options.masterCommit = commit(options.repositoryRoot, 'Pin code regression fixture')
  await prepare(options)
  const before = structuredClone(options.preparation)
  const bundle = await regenerate(options, {fetcher: {async fetch() {return image}}})
  const failed = bundle.outcomes.find(row => row.page === 'sample'), sibling = bundle.outcomes.find(row => row.page === 'sibling')
  assert.equal(failed.status, 'fallback', JSON.stringify(failed)); assert.equal(failed.code, 'PUBLISH_REGEN_MISMATCH')
  assert.equal(failed.detail.length, 2); assert.ok(failed.detail.every(row => row.file.includes('sample') && row.expected !== row.actual))
  assert.equal(sibling.status, 'success', JSON.stringify(sibling))
  assert.ok(!fs.existsSync(path.join(options.out, 'pages/sample')))
  if (baseline === 'new') assert.equal(failed.baseline.outputs.length, 0)
  else for (const output of failed.baseline.outputs) assert.deepEqual(fs.readFileSync(path.join(options.out, output.file)), fs.readFileSync(path.join(options.baselineRoot, output.path)))
  if (oldReceipt) assert.deepEqual(fs.readFileSync(path.join(options.out, failed.baseline.receipt.file)), oldReceipt)
  assert.deepEqual(failed.baseline.active, before.active.pages.find(row => row.page === 'sample') || null)
  const result = finalize(options, bundle)
  assert.equal(result.publication.cache_eligible, false)
  assert.deepEqual(result.snapshot.navigation_records.find(row => row.record_id === 'rec0'), before.previous_snapshot.navigation_records.find(row => row.record_id === 'rec0'))
  publication.publishedEvidence(options.baselineRoot, result.snapshot)
})
test('[PUBLISH_REGEN_MISMATCH] checkpoint CLI validates bound proof offline and rejects proof and output tampering', async t => {
  const value = await candidate(t), result = finalize(value.options, value.bundle)
  fs.rmSync(value.options.out, {recursive: true}); fs.rmSync(value.options.scratch, {recursive: true}); fs.rmSync(value.options.repo, {recursive: true})
  const validate = () => require('./guides-shared-publication').main(['--operation', 'validate', '--workspace', value.options.baselineRoot, '--snapshot', snapshotPath])
  validate()
  const file = `${publication.MANIFEST}/_publication.json`, original = fs.readFileSync(path.join(value.options.baselineRoot, file))
  const proof = JSON.parse(original); proof.regeneration.rec0.inputs_sha256 = '0'.repeat(64)
  put(value.options.baselineRoot, file, JSON.stringify(proof))
  assert.throws(validate, /PUBLISH_REGEN_MISMATCH/)
  put(value.options.baselineRoot, file, original)
  const output = result.snapshot.records.find(row => row.record_id === 'rec0').output_paths[0]
  fs.appendFileSync(path.join(value.options.baselineRoot, output), 'tamper')
  assert.throws(validate, /output digest mismatch/)
})
test('production tool identity rejects a synthetic configuration commit', async t => {
  const value = await candidate(t)
  assert.throws(() => regeneration.assertToolIdentity(value.receipt.inputs.tools), /Executing tooling identity/)
})
test('fresh replay restores Git bytes despite dirty live configuration, upstream and dev files', async t => {
  const value = await candidate(t)
  fs.writeFileSync(path.join(value.options.repositoryRoot, 'shared-docs/guides/Variables.json'), '{}')
  fs.writeFileSync(path.join(value.options.repo, 'site/en/sample.md'), 'dirty upstream')
  fs.writeFileSync(path.join(value.options.baselineRoot, 'content/en/guides/existing.md'), 'dirty dev')
  const proof = await replay(value)
  assert.equal(proof.inputs_sha256, value.outcome.identity.inputs_sha256)
  assert.ok(fs.readdirSync(value.options.scratch).every(file => !file.startsWith('receipt-replay-')))
})
test('new render targets validate exact version, paired manuals, path, position and channel; legacy receipts remain readable', async t => {
  const value = await candidate(t)
  const {validateSharedReceipt} = require('../../packages/docs-tooling/src/lark/sharedPageRouting')
  const validate = receipt => validateSharedReceipt(receipt, {group: 'guides', page: receipt.page})
  for (const mutate of [r => {r.inputs.fetch.render_targets.schema_version = 2}, r => {r.inputs.fetch.render_targets.targets[0].path = '../escape'},
    r => {r.inputs.fetch.render_targets.targets[0].navigation.sidebar_position = 0}, r => {r.inputs.fetch.render_targets.targets[0].channel = 'current'},
    r => {r.inputs.fetch.render_targets.targets[0].manual = 'other'}]) {
    const receipt = structuredClone(value.receipt); mutate(receipt); assert.throws(() => validate(receipt))
  }
  const legacy = structuredClone(value.receipt); delete legacy.inputs.fetch.render_targets
  validate(legacy)
  assert.throws(() => regeneration.validateRegenerationEvidence(value.outcome.regeneration, legacy, value.outputs), /PUBLISH_REGEN_MISMATCH/)
})
test('bundle rejects missing proof, unbound passed flag, target drift and a changed receipt digest', async t => {
  const value = await candidate(t), handoff = loadBundle(value.options.out)
  for (const mutate of [b => {delete b.outcomes[0].regeneration}, b => {b.outcomes[0].regeneration = {passed: true}},
    b => {b.outcomes[0].targets[0].navigation.sidebar_position++}, b => {b.outcomes[0].regeneration.outputs[0].sha256 = '0'.repeat(64)}]) {
    const bundle = structuredClone(value.bundle); mutate(bundle)
    const files = new Map(handoff.files); files.set('bundle.json', Buffer.from(JSON.stringify(bundle)))
    assert.throws(() => require('../../packages/docs-tooling/src/lark/sharedPageBundle').validateBundle(files), /PUBLISH_REGEN_MISMATCH|frozen render targets/)
  }
})
test('[PUBLISH_REGEN_MISMATCH] frozen sidebar position is replayed, never inferred from navigation sort keys or output front matter', async t => {
  const value = await candidate(t)
  for (const target of value.receipt.inputs.fetch.render_targets.targets) target.navigation.sidebar_position = 2
  await assert.rejects(replay(value), error => error.code === 'PUBLISH_REGEN_MISMATCH' && error.detail.length === 2 && error.detail.every(row => row.expected !== row.actual))
})
test('[PUBLISH_REGEN_MISMATCH] accepted image bytes are verified without origin requests', async t => {
  const value = await candidate(t)
  await assert.rejects(regeneration.regenerateReceipt({receipt: value.receipt, navigation: value.bundle.navigation,
    repositoryRoot: value.options.repositoryRoot, baselineRoot: value.options.baselineRoot, repo: value.options.repo,
    scratch: value.options.scratch, outputs: value.outputs, readAcceptedImage: async () => Buffer.from('corrupt')},
  {assertToolIdentity: () => {}}), error => error.code === 'PUBLISH_REGEN_MISMATCH' && error.detail[0].file.startsWith('shared/'))
})
test('executing tool identity rejects drift in its consumed docHeadingTags dependency', async t => {
  const value = await candidate(t)
  const root = path.join(value.options.root, 'synthetic-tooling')
  const dependency = 'packages/docs-ui/src/shared/utils/docHeadingTags.ts'
  put(root, dependency, 'export const DOC_HEADING_TAGS = ["main"]\n')
  git(root, ['init', '--quiet', '--initial-branch=master', '--template='])
  const tools = {...value.receipt.inputs.tools, zdoc: commit(root, 'Pinned consumed heading tags')}
  assert.doesNotThrow(() => regeneration.assertToolIdentity(tools, {root}))
  put(root, dependency, 'export const DOC_HEADING_TAGS = ["changed"]\n')
  assert.throws(() => regeneration.assertToolIdentity(tools, {root}), error => error.message === `Executing tooling drift: ${dependency}`)
})
