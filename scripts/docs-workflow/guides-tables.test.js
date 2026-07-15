'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { buildGuidesTableMatrix } = require('./guides-tables')

const TABLES = [
  ['deployment', 'Deployment', ['zilliz.paas']],
  ['get-started', 'Get Started', ['zilliz.saas', 'zilliz.paas']],
  ['development', 'Development', ['zilliz.saas', 'zilliz.paas']],
  ['management', 'Management', ['zilliz.saas', 'zilliz.paas']],
  ['client-libraries', 'Client Libraries', ['zilliz.saas', 'zilliz.paas']],
  ['tools', 'Tools', ['zilliz.saas', 'zilliz.paas']],
  ['ai-models', 'AI Models', ['zilliz.saas']],
  ['architecture', 'Architecture', ['zilliz.saas', 'zilliz.paas']],
]

function snapshot(extra = []) {
  return {
    schema_version: 3,
    manual: 'guides',
    navigation_records: [
      ...TABLES.flatMap(([tableId, tableName, targets]) => targets.map((target, index) => ({
        record_id: `${tableId}-${index}`,
        table_id: tableId,
        table_name: tableName,
        placement_type: 'canonical',
        progress: 'Draft',
        targets: [target],
      }))),
      { record_id: 'solution-section', table_id: 'solution', table_name: 'Solution', placement_type: 'section', progress: '', targets: [] },
      ...extra,
    ],
    table_digests: {},
  }
}

test('full Guides matrix contains the current 14 publishable target/table combinations', () => {
  const matrix = buildGuidesTableMatrix({ plan: { mode: 'full', affected_tables: TABLES.map(([id]) => id) }, snapshot: snapshot() })
  assert.equal(matrix.length, 14)
  assert.deepEqual(matrix.filter(item => item.table_name === 'Client Libraries').map(item => item.target), ['zilliz.paas', 'zilliz.saas'])
  assert.deepEqual(matrix.filter(item => item.table_name === 'Tools').map(item => item.target), ['zilliz.paas', 'zilliz.saas'])
  assert.equal(matrix.some(item => item.table_name === 'Solution'), false)
  assert.equal(matrix.every(item => item.cleanup === false), true)
})

test('incremental matrix adds newly targeted canonical and ignores empty Progress canonical', () => {
  const current = snapshot([
    { record_id: 'solution-page', table_id: 'solution', table_name: 'Solution', placement_type: 'canonical', progress: 'Draft', targets: ['zilliz.saas'] },
    { record_id: 'hidden-page', table_id: 'hidden', table_name: 'Hidden', placement_type: 'canonical', progress: '', targets: ['zilliz.saas'] },
  ])
  const matrix = buildGuidesTableMatrix({ plan: { mode: 'incremental', affected_tables: ['solution', 'hidden'] }, snapshot: current })
  assert.deepEqual(matrix, [{ table_id: 'solution', table_name: 'Solution', table_slug: 'solution', target: 'zilliz.saas', target_name: 'saas', cleanup: false }])
})

test('incremental matrix emits one cleanup entry after the last canonical target is deleted', () => {
  const matrix = buildGuidesTableMatrix({
    plan: {
      mode: 'incremental',
      affected_tables: ['tools'],
      previous_table_targets: { tools: ['zilliz.saas'] },
      previous_table_names: { tools: 'Tools' },
    },
    snapshot: {
      schema_version: 3,
      manual: 'guides',
      navigation_records: [{ record_id: 'tools-section', table_id: 'tools', table_name: 'Tools', placement_type: 'section', progress: '', targets: [] }],
      table_digests: {},
    },
  })
  assert.deepEqual(matrix, [{ table_id: 'tools', table_name: 'Tools', table_slug: 'tools', target: 'zilliz.saas', target_name: 'saas', cleanup: true }])
})

test('full matrix also cleans a table removed entirely since the previous snapshot', () => {
  const matrix = buildGuidesTableMatrix({
    plan: { mode: 'full', previous_table_targets: { removed: ['zilliz.paas'] }, previous_table_names: { removed: 'Removed Table' } },
    snapshot: snapshot(),
  })
  assert.deepEqual(matrix.find(item => item.table_id === 'removed'), {
    table_id: 'removed', table_name: 'Removed Table', table_slug: 'removed-table',
    target: 'zilliz.paas', target_name: 'byoc', cleanup: true,
  })
})
