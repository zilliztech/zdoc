const assert = require('node:assert/strict')
const { test } = require('node:test')

const { expandLookupTokens, parseBase, recordsFromCliJson, resolveDocInManual, rowsFromCliJson } = require('./baseResolver')

test('parseBase distinguishes all tables, explicit table, and base-only configs', () => {
  assert.deepEqual(parseBase('base123:*'), {
    baseToken: 'base123',
    allTables: true,
    tableSelector: '*',
  })
  assert.deepEqual(parseBase('base123:tbl456'), {
    baseToken: 'base123',
    allTables: false,
    tableSelector: 'tbl456',
  })
  assert.deepEqual(parseBase('base123'), {
    baseToken: 'base123',
    allTables: false,
    tableSelector: null,
  })
})

test('rowsFromCliJson recognizes lark-cli table-list data.tables shape', () => {
  assert.deepEqual(rowsFromCliJson({
    data: {
      tables: [{ id: 'tbl9BeCMjBmalJVb', name: 'Get Started' }],
      total: 1,
    },
  }), [{ id: 'tbl9BeCMjBmalJVb', name: 'Get Started' }])
})

test('resolveDocInManual uses the first table when manual base has no table selector', async () => {
  const calls = []
  const result = await resolveDocInManual({
    manuals: {
      agents: { base: 'base123' },
    },
    manualName: 'agents',
    docToken: 'DOC_TOKEN',
    runCommand: async (argv) => {
      calls.push(argv)
      if (argv.includes('+table-list')) {
        return { items: [{ table_id: 'tbl_first', name: 'Zilliz' }, { table_id: 'tbl_second', name: 'Images' }] }
      }
      if (argv.includes('+record-search')) {
        assert.equal(argv[argv.indexOf('--table-id') + 1], 'tbl_first')
        return {
          items: [{
            record_id: 'rec1',
            fields: {
              Docs: { text: 'Agent doc', link: 'https://zilliverse.feishu.cn/wiki/DOC_TOKEN' },
              'Placement Type': 'canonical',
            },
          }],
        }
      }
      throw new Error(`unexpected command ${argv.join(' ')}`)
    },
  })

  assert.equal(result.manualName, 'agents')
  assert.equal(result.tableId, 'tbl_first')
  assert.equal(result.title, 'Agent doc')
  assert.equal(calls.length, 2)
})

test('resolveDocInManual searches every table only when base ends with all-tables selector', async () => {
  const searchedTables = []
  const result = await resolveDocInManual({
    manuals: {
      guides: { base: 'base123:*' },
    },
    manualName: 'guides',
    docToken: 'DOC_TOKEN',
    runCommand: async (argv) => {
      if (argv.includes('+table-list')) {
        return { items: [{ table_id: 'tbl_first' }, { table_id: 'tbl_second' }] }
      }
      if (argv.includes('+record-search')) {
        const tableId = argv[argv.indexOf('--table-id') + 1]
        searchedTables.push(tableId)
        return tableId === 'tbl_second'
          ? { items: [{ record_id: 'rec2', fields: { Docs: { text: 'Guide doc', link: 'https://zilliverse.feishu.cn/wiki/DOC_TOKEN' } } }] }
          : { items: [] }
      }
      if (argv.includes('+record-list')) {
        return { items: [] }
      }
      throw new Error(`unexpected command ${argv.join(' ')}`)
    },
  })

  assert.deepEqual(searchedTables, ['tbl_first', 'tbl_second'])
  assert.equal(result.tableId, 'tbl_second')
})

test('expandLookupTokens adds wiki node object and origin tokens', async () => {
  const tokens = await expandLookupTokens('WIKI_TOKEN', async (argv) => {
    assert.equal(argv[0], 'lark-cli')
    assert.equal(argv[1], 'wiki')
    assert.equal(argv[2], '+node-get')
    return {
      data: {
        node_token: 'WIKI_TOKEN',
        obj_token: 'DOCX_TOKEN',
        origin_node_token: 'ORIGIN_TOKEN',
        obj_type: 'docx',
      },
    }
  })

  assert.deepEqual(tokens, ['WIKI_TOKEN', 'DOCX_TOKEN', 'ORIGIN_TOKEN'])
})

test('expandLookupTokens passes full doc link when provided so lark-cli can infer type', async () => {
  const tokens = await expandLookupTokens('RAW_TOKEN', async (argv) => {
    assert.equal(argv[argv.indexOf('--node-token') + 1], 'https://zilliverse.feishu.cn/wiki/RAW_TOKEN')
    return { data: { node_token: 'RAW_TOKEN', obj_token: 'DOCX_TOKEN' } }
  }, 'https://zilliverse.feishu.cn/wiki/RAW_TOKEN')

  assert.deepEqual(tokens, ['RAW_TOKEN', 'DOCX_TOKEN'])
})

test('recordsFromCliJson maps lark-cli record-list table rows to field objects', () => {
  const records = recordsFromCliJson({
    data: {
      data: [[
        '[Try Zilliz Cloud For Free](https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf)',
        'free-trials',
        ['Zilliz.SaaS'],
        ['canonical'],
      ]],
      fields: ['Docs', 'Slug', 'Targets', 'Placement Type'],
      record_id_list: ['recvlPmrfIyzsa'],
    },
  })

  assert.deepEqual(records, [{
    record_id: 'recvlPmrfIyzsa',
    fields: {
      Docs: '[Try Zilliz Cloud For Free](https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf)',
      Slug: 'free-trials',
      Targets: ['Zilliz.SaaS'],
      'Placement Type': ['canonical'],
    },
  }])
})
