'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const renderIdentity = require('./sharedPageRenderIdentity')

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const overlayFiles = page => [
  {path: 'shared-docs/guides/source.yaml', sha256: sha('source')},
  {path: 'shared-docs/guides/Variables.json', sha256: sha('variables')},
  {path: 'shared-docs/guides/links.yaml', sha256: sha('links')},
  {path: 'shared-docs/guides/product-names.yaml', sha256: sha('names')},
  {path: 'shared-docs/guides/presentation/cloud-sdk-tabs.yaml', sha256: sha('tabs')},
  {path: `shared-docs/guides/pages/${page}/page.yaml`, sha256: sha(`page-${page}`)},
  {path: `shared-docs/guides/pages/${page}/lock.yaml`, sha256: sha(`lock-${page}`)},
  {path: 'shared-docs/guides/pages/other-page/page.yaml', sha256: sha('page-other')},
]
const engineFiles = [{path: 'packages/docs-tooling/src/shared-docs/commands/build.ts', sha256: sha('build')},
  {path: 'docs-ui/src/shared/utils/docHeadingTags.ts', sha256: sha('tags')},
  {path: 'packages/docs-tooling/src/manuals/registry.ts', sha256: sha('registry')}]
const targets = (position, label = 'Search') => [{manual: 'guides', path: 'tutorials/search', extension: '.mdx',
  navigation: {sidebar_label: label, sidebar_position: position}, channel: 'current'}]
const planningProjection = () => ({
  page: 'search',
  pins: {current: '1'.repeat(40), next: '2'.repeat(40)},
  overlay: renderIdentity.overlayInventory(overlayFiles('search'), 'search'),
  engine: {inventory_sha256: renderIdentity.engineDigest(engineFiles), md2md: '9.9.9'},
  devPagePaths: ['content/en/byoc/existing.md', 'content/en/guides/a.mdx', 'content/en/guides/b.mdx'],
  renderTargets: targets(3),
  images: [{source: 'https://origin.test/diagram.png', sha256: sha('diagram')}],
  active: {page: 'search', record: 'rec0', feishu_token: 'old', anchors: {'old-heading': 'current-anchor'}, activated_in: '10'},
})
const receiptInputs = () => ({
  milvus_docs: {repository: 'milvus-io/milvus-docs', current: '1'.repeat(40), next: '2'.repeat(40), files: []},
  zdoc: {repository: 'zilliztech/zdoc', commit: '3'.repeat(40), files: overlayFiles('search')},
  dev: {commit: '4'.repeat(40), files: [{path: 'content/en/byoc/existing.md', sha256: sha('existing')}, {path: 'content/en/guides/a.mdx', sha256: sha('a')}, {path: 'content/en/guides/b.mdx', sha256: sha('b')},
    {path: 'generated/en/manifests/shared-pages/guides', sha256: sha('manifest')}]},
  fetch: {navigation: sha('navigation'), image_base_url: 'https://images.example.test',
    render_targets: {schema_version: 1, targets: targets(3)}, active: planningProjection().active},
  tools: {zdoc: '3'.repeat(40), md2md: '9.9.9', engine_sha256: renderIdentity.engineDigest(engineFiles)},
  images: [{source: 'https://origin.test/diagram.png', sha256: sha('diagram'), object: `shared/${sha('diagram')}.png`}],
})

test('zero drift: planning and receipt projections produce one identity', () => {
  const planned = renderIdentity.renderIdentity(planningProjection())
  const published = renderIdentity.renderIdentity(renderIdentity.receiptProjection(receiptInputs(), 'search'))
  assert.equal(published.group, 'guides'); assert.equal(published.page, 'search')
  assert.equal(published.record, 'generated/en/manifests/shared-pages/guides/search.json')
  assert.equal(planned.inputs_sha256, published.inputs_sha256)
})

test('dev content edits keep the identity; adding, removing or renaming dev pages flips it', () => {
  const base = renderIdentity.renderIdentity(planningProjection()).inputs_sha256
  // The recipe consumes only the dev page path set: rewriting a.dev content bytes
  // (different receipt sha, same path) leaves the identity untouched, while any
  // path-set change — an added, removed or renamed page — flips it.
  const rewritten = receiptInputs()
  rewritten.dev.files = rewritten.dev.files.map(file => file.path === 'content/en/guides/a.mdx' ? {...file, sha256: sha('a-rewritten')} : file)
  assert.equal(renderIdentity.renderIdentity(renderIdentity.receiptProjection(rewritten, 'search')).inputs_sha256, base)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), devPagePaths: ['content/en/byoc/existing.md', 'content/en/guides/a.mdx', 'content/en/guides/b.mdx', 'content/en/guides/new.mdx']}).inputs_sha256, base)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), devPagePaths: ['content/en/byoc/existing.md', 'content/en/guides/a.mdx']}).inputs_sha256, base)
})

test('unrelated master tooling commits do not flip identity; engine or lock changes do', () => {
  const base = renderIdentity.renderIdentity(planningProjection())
  // The recipe never sees commits: a master tip move with unchanged subtrees is a
  // no-op, and a lock re-pin (content change at the pins) is the real flip.
  const inputs = receiptInputs()
  inputs.zdoc.commit = 'a'.repeat(40); inputs.dev.commit = 'b'.repeat(40)
  assert.equal(renderIdentity.renderIdentity(renderIdentity.receiptProjection(inputs, 'search')).inputs_sha256, base.inputs_sha256)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), pins: {current: '1'.repeat(40), next: '3'.repeat(40)}}).inputs_sha256, base.inputs_sha256)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), engine: {inventory_sha256: renderIdentity.engineDigest([{path: 'packages/docs-tooling/src/shared-docs/commands/build.ts', sha256: sha('build2')}]) , md2md: '9.9.9'}}).inputs_sha256, base.inputs_sha256)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), engine: {inventory_sha256: renderIdentity.engineDigest(engineFiles), md2md: '10.0.0'}}).inputs_sha256, base.inputs_sha256)
})

test('overlay flips are page-local except the global links.yaml component', () => {
  const base = renderIdentity.renderIdentity(planningProjection()).inputs_sha256
  const files = overlayFiles('search')
  const ownPage = files.map(file => file.path === 'shared-docs/guides/pages/search/page.yaml' ? {...file, sha256: sha('page-search-2')} : file)
  const otherPage = files.map(file => file.path === 'shared-docs/guides/pages/other-page/page.yaml' ? {...file, sha256: sha('page-other-2')} : file)
  const links = files.map(file => file.path === 'shared-docs/guides/links.yaml' ? {...file, sha256: sha('links-2')} : file)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), overlay: renderIdentity.overlayInventory(ownPage, 'search')}).inputs_sha256, base)
  assert.equal(renderIdentity.renderIdentity({...planningProjection(), overlay: renderIdentity.overlayInventory(otherPage, 'search')}).inputs_sha256, base)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), overlay: renderIdentity.overlayInventory(links, 'search')}).inputs_sha256, base)
})

test('render targets, images and the consumed active entry flip the identity', () => {
  const base = renderIdentity.renderIdentity(planningProjection()).inputs_sha256
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), renderTargets: targets(4)}).inputs_sha256, base)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), renderTargets: targets(3, 'Renamed')}).inputs_sha256, base)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), images: [{source: 'https://origin.test/diagram.png', sha256: sha('diagram2')}]}).inputs_sha256, base)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), active: {...planningProjection().active, feishu_aliases: ['old', 'older']}}).inputs_sha256, base)
  assert.notEqual(renderIdentity.renderIdentity({...planningProjection(), active: null}).inputs_sha256, base)
})

test('first-onboarding shape agrees: absent targets, images and active entry project like their empty forms', () => {
  const planned = renderIdentity.renderIdentity({...planningProjection(), renderTargets: null, images: null, active: null})
  const inputs = receiptInputs()
  delete inputs.fetch.render_targets; inputs.fetch.active = null; inputs.images = []
  assert.equal(planned.inputs_sha256, renderIdentity.renderIdentity(renderIdentity.receiptProjection(inputs, 'search')).inputs_sha256)
})

test('legacy receipts authenticate through the pre-render-identity whole-input digest', () => {
  const {digest} = require('./sharedPageFetch')
  const inputs = receiptInputs()
  delete inputs.fetch.active; delete inputs.tools.engine_sha256
  const receipt = {inputs}
  // Golden form of the recipe this replaces (guides-shared-sources publication digest).
  const expected = digest(JSON.stringify({...inputs, fetch: {...inputs.fetch, navigation: inputs.fetch.navigation}}))
  assert.equal(renderIdentity.legacyReceiptInputsDigest(receipt), expected)
  const objectNavigation = {inputs: structuredClone(inputs), }
  objectNavigation.inputs.fetch.navigation = {navigationRecords: [{record_id: 'rec0'}], tableDigests: {}}
  const normalized = {...objectNavigation.inputs, fetch: {...objectNavigation.inputs.fetch, navigation: sha(JSON.stringify(objectNavigation.inputs.fetch.navigation))}}
  assert.equal(renderIdentity.legacyReceiptInputsDigest(objectNavigation), digest(JSON.stringify(normalized)))
})

test('engine digest canonicalizes inventory order', () => {
  const a = renderIdentity.engineDigest(engineFiles)
  const b = renderIdentity.engineDigest([...engineFiles].reverse())
  assert.equal(a, b)
})
