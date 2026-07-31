'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {validateGuidesBasePreflight} = require('./guidesBasePreflight')

function canonical(overrides = {}) {
  return {
    record_id: 'record-1', base_table_id: 'table-1', base_table_name: '从这里开始', base_record_index: 0,
    fields: {
      'Placement Type': 'canonical', Progress: 'Draft', Slug: 'intro', Targets: ['zilliz.saas'],
      Docs: {text: 'Intro', link: 'https://zilliverse.feishu.cn/wiki/token-1'},
    },
    ...overrides,
  }
}

test('Guides Base preflight validates table mappings and publishable records before source fetch', () => {
  assert.deepEqual(validateGuidesBasePreflight({
    site: 'zh-CN', tables: [{table_id: 'table-1', name: '从这里开始'}], records: [canonical()],
  }), {tables: 1, records: 1})
})

test('Guides Base preflight rejects render blockers available from Base metadata', () => {
  assert.throws(() => validateGuidesBasePreflight({
    site: 'zh-CN', tables: [{table_id: 'table-1', name: '未知表格'}], records: [canonical()],
  }), /slug mapping/)
  assert.throws(() => validateGuidesBasePreflight({
    site: 'zh-CN', tables: [{table_id: 'table-1', name: '从这里开始'}], records: [canonical({fields: {...canonical().fields, Slug: ''}})],
  }), /missing Slug/)
  assert.throws(() => validateGuidesBasePreflight({
    site: 'zh-CN', tables: [{table_id: 'table-1', name: '从这里开始'}], records: [canonical({fields: {...canonical().fields, Targets: ['unknown']}})],
  }), /unsupported publish target/)
})

for (const fixture of [
  {site: 'en', tableName: 'Get Started'},
  {site: 'zh-CN', tableName: '从这里开始'},
]) {
  test(`Guides Base preflight requires section Slug for ${fixture.site}`, () => {
    assert.throws(() => validateGuidesBasePreflight({
      site: fixture.site,
      tables: [{table_id: 'table-1', name: fixture.tableName}],
      records: [{
        record_id: 'section-1', base_table_id: 'table-1', base_table_name: fixture.tableName, base_record_index: 0,
        fields: {'Placement Type': 'section', Labels: 'Section', Slug: ''},
      }],
    }), new RegExp([
      'section is missing Slug',
      `Site: ${fixture.site}`,
      `Table: ${fixture.tableName}`,
      'Record: section-1',
      'Title: Section',
      'Field: Slug',
      'How to fix: Set a stable English kebab-case Slug',
    ].join('[\\s\\S]*')))
  })

  test(`Guides Base preflight requires ref target canonical for ${fixture.site}`, () => {
    const ref = {
      record_id: 'ref-1', base_table_id: 'table-1', base_table_name: fixture.tableName, base_record_index: 1,
      fields: {'Placement Type': 'ref', Labels: 'Reference', Slug: 'reference', 'Ref Target Doc': 'missing-token'},
    }
    assert.throws(() => validateGuidesBasePreflight({
      site: fixture.site,
      tables: [{table_id: 'table-1', name: fixture.tableName}],
      records: [canonical({base_table_name: fixture.tableName}), ref],
    }), new RegExp([
      'ref must resolve to exactly one canonical record',
      `Site: ${fixture.site}`,
      `Table: ${fixture.tableName}`,
      'Record: ref-1',
      'Title: Reference',
      'Field: Ref Target Doc',
      'Current value: missing-token',
      'How to fix:',
    ].join('[\\s\\S]*')))
  })

  test(`Guides Base preflight resolves URL ref target canonical for ${fixture.site}`, () => {
    const target = canonical({base_table_name: fixture.tableName})
    const ref = {
      record_id: 'ref-1', base_table_id: 'table-1', base_table_name: fixture.tableName, base_record_index: 1,
      fields: {
        'Placement Type': 'ref', Labels: 'Reference', Slug: 'reference',
        'Ref Target Doc': {text: 'Intro', link: 'https://zilliverse.feishu.cn/wiki/token-1'},
      },
    }
    assert.deepEqual(validateGuidesBasePreflight({
      site: fixture.site,
      tables: [{table_id: 'table-1', name: fixture.tableName}],
      records: [target, ref],
    }), {tables: 1, records: 2})
  })

  test(`Guides Base preflight resolves anchored ref target canonical for ${fixture.site}`, () => {
    const target = canonical({base_table_name: fixture.tableName})
    const ref = {
      record_id: 'ref-anchor', base_table_id: 'table-1', base_table_name: fixture.tableName, base_record_index: 1,
      fields: {
        'Placement Type': 'ref', Labels: 'Install',
        'Ref Target Doc': {text: 'Intro', link: 'https://zilliverse.feishu.cn/wiki/token-1#install'},
      },
    }
    assert.deepEqual(validateGuidesBasePreflight({
      site: fixture.site,
      tables: [{table_id: 'table-1', name: fixture.tableName}],
      records: [target, ref],
    }), {tables: 1, records: 2})
  })
}

test('Guides Base preflight requires an explicit placement type with repair guidance', () => {
  const record = canonical({fields: {...canonical().fields}})
  delete record.fields['Placement Type']
  assert.throws(() => validateGuidesBasePreflight({
    site: 'en', tables: [{table_id: 'table-1', name: 'Get Started'}], records: [record],
  }), /Placement Type[\s\S]*Record: record-1[\s\S]*How to fix:/)
})

test('Guides Base preflight rejects duplicate canonical ownership with repair guidance', () => {
  assert.throws(() => validateGuidesBasePreflight({
    site: 'en', tables: [{table_id: 'table-1', name: 'Get Started'}], records: [
      canonical(),
      canonical({record_id: 'record-2', base_record_index: 1, fields: {...canonical().fields, Slug: 'intro-copy'}}),
    ],
  }), /multiple canonical[\s\S]*token-1[\s\S]*How to fix:/)
})

test('Guides Base preflight treats non-Feishu section Docs as empty', () => {
  assert.doesNotThrow(() => validateGuidesBasePreflight({
    site: 'en', tables: [{table_id: 'table-1', name: 'Get Started'}], records: [{
      record_id: 'section-1', base_table_id: 'table-1', base_table_name: 'Get Started', base_record_index: 0,
      fields: {'Placement Type': 'section', Labels: 'Section', Slug: 'section', Docs: {text: 'Section', link: 'https://example.com/not-feishu'}},
    }],
  }))
})
