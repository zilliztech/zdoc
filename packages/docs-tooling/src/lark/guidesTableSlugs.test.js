'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {guidesTableSlug, validateGuidesTableNames} = require('./guidesTableSlugs')

test('Chinese Guides tables use their corresponding English table name slugs', () => {
  assert.deepEqual(validateGuidesTableNames('zh-CN', [
    {table_id: 'start', name: '从这里开始'},
    {table_id: 'development', name: '开发指南'},
    {table_id: 'management', name: '运维指南'},
    {table_id: 'clients', name: '客户端参考'},
    {table_id: 'tools', name: '工具'},
    {table_id: 'models', name: 'AI 模型'},
  ]).map(table => table.table_slug), [
    'get-started', 'development', 'management', 'client-libraries', 'tools', 'ai-models',
  ])
})

test('Chinese Guides table preflight rejects an unmapped table name', () => {
  assert.throws(() => guidesTableSlug('zh-CN', '未知表格'), /Missing English Guides table slug mapping/)
})
