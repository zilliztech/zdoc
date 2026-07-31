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
