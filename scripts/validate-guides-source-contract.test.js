'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { validateGuidesSourceContract } = require('./validate-guides-source-contract')

function write(root, relative) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, '# page')
}

function fixture() {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-contract-'))
  write(outputDir, 'tools/section/page.md')
  const snapshot = {
    schema_version: 3,
    manual: 'guides',
    navigation_records: [
      { record_id: 'section', table_id: 'tools', table_name: 'Tools', placement_type: 'section', parent_record_ids: [], title: 'Section', slug: 'section', targets: [] },
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
      { type: 'ref', id: 'tutorials/tools/section/page', key: 'ref:tutorials/tools/reuse', label: 'Reuse' },
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
  write(f.outputDir, 'tools/section/page.md')
  f.sidebar[0].items[0].items = []
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /canonical.*missing navigation/i)
})

test('section requires navigation but forbids a landing page', () => {
  const f = fixture()
  f.sidebar[0].items = f.sidebar[0].items.filter(item => item.key !== 'category:tutorials/tools/section')
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /section.*missing category/i)
  const g = fixture()
  write(g.outputDir, 'tools/section/section.md')
  assert.throws(() => validateGuidesSourceContract({ ...g, target: 'zilliz.saas' }), /section.*landing page/i)
})

test('link href and ref target must match without duplicate bodies', () => {
  const f = fixture()
  f.sidebar[0].items.find(item => item.type === 'link').href = 'https://example.com/wrong'
  assert.throws(() => validateGuidesSourceContract({ ...f, target: 'zilliz.saas' }), /link.*href/i)
  const g = fixture()
  g.sidebar[0].items.find(item => item.type === 'ref').id = 'tutorials/missing'
  assert.throws(() => validateGuidesSourceContract({ ...g, target: 'zilliz.saas' }), /ref.*target/i)
  const h = fixture()
  write(h.outputDir, 'tools/reuse.md')
  assert.throws(() => validateGuidesSourceContract({ ...h, target: 'zilliz.saas' }), /ref.*duplicate body/i)
})
