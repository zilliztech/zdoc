'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { sourceContractConfig, validateGuidesSourceContract, validateGuidesSourceSite } = require('./validate-guides-source-contract')

function write(root, relative, token = null) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, token ? `---\ntoken: ${token}\n---\n# page` : '# page')
}

function fixture() {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-contract-'))
  write(outputDir, 'tools/section/page.md', 'page-token')
  const snapshot = {
    schema_version: 3,
    manual: 'guides',
    navigation_records: [
      { record_id: 'section', table_id: 'tools', table_name: 'Tools', placement_type: 'section', parent_record_ids: [], title: 'Section', slug: '', targets: [] },
      { record_id: 'page', table_id: 'tools', table_name: 'Tools', placement_type: 'canonical', parent_record_ids: ['section'], title: 'Page', slug: 'page', progress: 'Draft', targets: ['zilliz.saas'], doc_token: 'page-token' },
      { record_id: 'link', table_id: 'tools', table_name: 'Tools', placement_type: 'link', parent_record_ids: [], title: 'External', slug: 'external', targets: [], doc_link: 'https://example.com/docs' },
      { record_id: 'ref', table_id: 'tools', table_name: 'Tools', placement_type: 'ref', parent_record_ids: [], title: 'Reuse', slug: 'reuse', targets: [], ref_target: 'page-token' },
    ],
  }
  const sidebar = [{
    type: 'category', label: 'Tools', key: 'category:tutorials/tools', items: [
      { type: 'category', label: 'Section', key: 'category:tutorials/tools/section', items: [
        { type: 'doc', id: 'tutorials/tools/section/page', key: 'doc:tutorials/tools/section/page', label: 'Page' },
      ] },
      { type: 'link', href: 'https://example.com/docs', key: 'link:tutorials/tools/external', label: 'External' },
      { type: 'link', href: '/docs/page', key: 'ref:tutorials/tools/reuse', label: 'Reuse' },
    ],
  }]
  return { outputDir, snapshot, sidebar }
}

test('accepts canonical, section, link, and ref records with their distinct contracts', () => {
  const f = fixture()
  assert.equal(validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }).checkedRecords, 4)
})

test('canonical requires both a generated file and a sidebar node', () => {
  const f = fixture()
  fs.rmSync(path.join(f.outputDir, 'tools/section/page.md'))
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /canonical.*missing file/i)
  write(f.outputDir, 'tools/section/page.md', 'page-token')
  f.sidebar[0].items[0].items = []
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /canonical.*missing navigation/i)
})

test('pure section requires navigation but forbids a landing page', () => {
  const f = fixture()
  f.sidebar[0].items = f.sidebar[0].items.filter(item => item.key !== 'category:tutorials/tools/section')
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /section.*missing category/i)
  const g = fixture()
  g.sidebar[0].items[0].link = { type: 'doc', id: 'tutorials/tools/section/section' }
  assert.throws(() => validateGuidesSourceContract({ ...g, target: 'zilliz.saas' }), /section.*landing page/i)
})

test('canonical identity follows generated token frontmatter paths while ref keeps the canonical route', () => {
  const f = fixture()
  fs.rmSync(path.join(f.outputDir, 'tools/section/page.md'))
  write(f.outputDir, 'tools/section/page/page.md', 'page-token')
  f.sidebar[0].items[0].items[0].id = 'tutorials/tools/section/page/page'

  assert.equal(validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }).checkedRecords, 4)
})

test('section with Docs generates exactly one index and links the category to it', () => {
  const f = fixture()
  const section = f.snapshot.navigation_records.find(record => record.record_id === 'section')
  section.doc_token = 'section-token'
  write(f.outputDir, 'tools/section/index.md', 'section-token')
  f.sidebar[0].items[0].link = { type: 'doc', id: 'tutorials/tools/section/index' }

  assert.equal(validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }).checkedRecords, 4)

  write(f.outputDir, 'tools/section/duplicate.md', 'section-token')
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /section.*exactly one index/i)
})

test('accepts the shared canonical route for internal links', () => {
  const f = fixture()
  f.snapshot.navigation_records.find(record => record.record_id === 'link').doc_link = null
  f.snapshot.navigation_records.find(record => record.record_id === 'link').ref_target = '/reference/cli/overview'
  f.sidebar[0].items.find(item => item.type === 'link').href = '/reference/cli/cli/overview'

  assert.equal(validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }).checkedRecords, 4)
})

test('link href and ref href target must match', () => {
  const f = fixture()
  f.sidebar[0].items.find(item => item.type === 'link').href = 'https://example.com/wrong'
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /link.*href/i)
  const g = fixture()
  g.sidebar[0].items.find(item => item.key?.startsWith('ref:')).href = '/docs/missing'
  assert.throws(() => validateGuidesSourceContract({ ...g, target: 'zilliz.saas' }), /ref.*target/i)
})

test('ref key uses the canonical slug when the Base ref slug is empty', () => {
  const f = fixture()
  const canonical = f.snapshot.navigation_records.find(record => record.record_id === 'page')
  canonical.slug = 'canonical-page'
  const ref = f.snapshot.navigation_records.find(record => record.record_id === 'ref')
  ref.title = 'Different Ref Label'
  ref.slug = ''
  fs.rmSync(path.join(f.outputDir, 'tools/section/page.md'))
  write(f.outputDir, 'tools/section/canonical-page.md', 'page-token')
  f.sidebar[0].items[0].items[0].id = 'tutorials/tools/section/canonical-page'
  const refItem = f.sidebar[0].items.find(item => item.key?.startsWith('ref:'))
  refItem.key = 'ref:tutorials/tools/canonical-page'
  refItem.href = '/docs/canonical-page'

  assert.equal(validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }).checkedRecords, 4)
})

test('anchored ref requires a resolved fragment on the canonical route', () => {
  const f = fixture()
  const ref = f.snapshot.navigation_records.find(record => record.record_id === 'ref')
  ref.ref_target_anchor = 'block-id'
  const refItem = f.sidebar[0].items.find(item => item.key?.startsWith('ref:'))
  refItem.href = '/docs/page#resolved-heading'

  assert.equal(validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }).checkedRecords, 4)
  refItem.href = '/docs/page'
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /ref.*target/i)
})

test('canonical token must generate exactly one body even when referenced elsewhere', () => {
  const h = fixture()
  write(h.outputDir, 'tools/reuse.md', 'page-token')
  assert.throws(() => validateGuidesSourceContract({ ...h, target: 'zilliz.saas' }), /canonical.*duplicate files/i)
})

test('Chinese contract uses the canonical English slug for localized table names', () => {
  const f = fixture()
  for (const record of f.snapshot.navigation_records) record.table_name = '运维指南'
  fs.renameSync(path.join(f.outputDir, 'tools'), path.join(f.outputDir, 'management'))
  f.sidebar = JSON.parse(JSON.stringify(f.sidebar).replaceAll('tutorials/tools', 'tutorials/management'))

  assert.equal(validateGuidesSourceContract({ ...f, site: 'zh-CN', target: 'zilliz.saas' }).checkedRecords, 4)
})

test('FAQ canonical accepts generated child pages that inherit the source token', () => {
  const f = fixture()
  const canonical = f.snapshot.navigation_records.find(record => record.record_id === 'page')
  canonical.title = 'FAQs'
  canonical.slug = 'faqs'
  f.snapshot.navigation_records = f.snapshot.navigation_records.filter(record => record.record_id !== 'ref')
  fs.rmSync(path.join(f.outputDir, 'tools/section/page.md'))
  write(f.outputDir, 'tools/section/faqs/faq-account.md', 'page-token')
  f.sidebar[0].items = f.sidebar[0].items.filter(item => !item.key?.startsWith('ref:'))
  f.sidebar[0].items[0].items = [{
    type: 'category',
    label: 'FAQs',
    key: 'category:tutorials/tools/section/faqs',
    items: [{ type: 'doc', id: 'tutorials/tools/section/faqs/faq-account', key: 'doc:tutorials/tools/section/faqs/faq-account', label: 'Account' }],
  }]

  assert.equal(validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }).checkedRecords, 3)
})

test('Chinese source contract resolves its own source, snapshot, media, Cloud, and BYOC paths', () => {
  const config = sourceContractConfig('zh-CN')
  assert.equal(config.sourceDir, 'packages/docs-tooling/src/lark/meta/sources/guides-zh-CN')
  assert.equal(config.snapshotPath, 'packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json')
  assert.equal(config.mediaManifestPath, 'packages/docs-tooling/src/lark/meta/media-cache/guides-zh-CN.json')
  assert.deepEqual(config.targets.map(target => target.outputDir), [
    'content/zh-CN/guides/tutorials',
    'content/zh-CN/byoc/tutorials',
  ])
})

test('CLI accepts an explicit candidate snapshot for first-run validation', () => {
  const missing = path.join(os.tmpdir(), `guides-candidate-${process.pid}.json`)
  const result = spawnSync(process.execPath, [
    path.join(__dirname, 'validate-guides-source-contract.js'),
    '--site', 'zh-CN', '--snapshot', missing,
  ], { encoding: 'utf8' })
  assert.notEqual(result.status, 0)
  assert.doesNotMatch(result.stderr, /Usage:/)
  assert.match(result.stderr, new RegExp(path.basename(missing).replaceAll('.', '\\.')))
})

test('site validation fails separately for an incomplete source graph and missing media manifest', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-source-site-'))
  const sourceDir = path.join(root, 'sources')
  const snapshotPath = path.join(root, 'snapshot.json')
  const mediaManifestPath = path.join(root, 'media.json')
  fs.mkdirSync(sourceDir)
  const config = {
    site: 'zh-CN', rootToken: 'root', sourceDir, snapshotPath, mediaManifestPath, targets: [],
  }
  fs.writeFileSync(snapshotPath, JSON.stringify({
    schema_version: 3, manual: 'guides', build_env: 'uat', records: [], navigation_records: [],
  }))
  fs.writeFileSync(mediaManifestPath, JSON.stringify({ schemaVersion: 1, entries: [] }))
  assert.throws(() => validateGuidesSourceSite({ site: 'zh-CN', config }), /source graph is incomplete|root source/i)

  fs.writeFileSync(path.join(sourceDir, 'root.json'), JSON.stringify({ children: ['child'] }))
  fs.rmSync(mediaManifestPath)
  assert.throws(() => validateGuidesSourceSite({ site: 'zh-CN', config }), /media\.json|no such file|ENOENT/i)
})
