const { spawn } = require('node:child_process')
const { currentPublishManuals } = require('./publishRequest')

function runJsonCommand(argv, { env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(argv[0], argv.slice(1), {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...env,
        LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1',
        LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1',
      },
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`${argv.join(' ')} failed with code ${code}: ${stderr.trim()}`))
        return
      }
      try {
        resolve(JSON.parse(stdout))
      } catch (error) {
        reject(new Error(`${argv.join(' ')} did not return JSON: ${error.message}`))
      }
    })
  })
}

function parseBase(base) {
  const [baseToken, tableSelector] = String(base).split(':')
  return {
    baseToken,
    allTables: tableSelector === '*',
    tableSelector: tableSelector || null,
  }
}

function recordsFromCliJson(payload) {
  const table = payload?.data
  if (Array.isArray(table?.data) && Array.isArray(table?.fields)) {
    return table.data.map((row, rowIndex) => ({
      record_id: table.record_id_list?.[rowIndex] || null,
      fields: Object.fromEntries(table.fields.map((field, fieldIndex) => [field, row[fieldIndex]])),
    }))
  }
  if (Array.isArray(payload)) return payload
  return payload?.data?.items ||
    payload?.data?.tables ||
    payload?.items ||
    payload?.records ||
    payload?.data?.records ||
    []
}

function rowsFromCliJson(payload) {
  return recordsFromCliJson(payload)
}

function recordContainsToken(record, token) {
  return JSON.stringify(record).includes(token)
}

function recordTitle(record, token) {
  const docs = record?.fields?.Docs
  if (docs?.text) return docs.text
  if (typeof docs === 'string') return docs
  return record?.fields?.Title || record?.fields?.Name || token
}

function unique(items) {
  return [...new Set(items.filter(Boolean).map(String))]
}

function rowsOrObjectFromCliJson(payload) {
  return payload?.data || payload?.item || payload
}

async function listTables(baseToken, runCommand = runJsonCommand) {
  const payload = await runCommand([
    'lark-cli', 'base', '+table-list',
    '--base-token', baseToken,
    '--as', 'user',
    '--format', 'json',
  ])
  return rowsFromCliJson(payload)
}

async function expandLookupTokens(docToken, runCommand = runJsonCommand, docLink = null) {
  const tokens = [docToken]
  try {
    const payload = await runCommand([
      'lark-cli', 'wiki', '+node-get',
      '--node-token', docLink || docToken,
      '--as', 'user',
      '--format', 'json',
    ])
    const node = rowsOrObjectFromCliJson(payload)
    tokens.push(node.node_token, node.obj_token, node.origin_node_token, node.token)
  } catch {
    // Not every doc token is a wiki node. Keep the original token and continue.
  }
  return unique(tokens)
}

async function searchTable({ baseToken, tableId, docToken, runCommand = runJsonCommand }) {
  const payload = await runCommand([
    'lark-cli', 'base', '+record-search',
    '--base-token', baseToken,
    '--table-id', tableId,
    '--keyword', docToken,
    '--search-field', 'Docs',
    '--field-id', 'Docs',
    '--field-id', 'Slug',
    '--field-id', 'Targets',
    '--field-id', 'Publish Targets',
    '--field-id', 'Status',
    '--field-id', 'Placement Type',
    '--limit', '20',
    '--format', 'json',
    '--as', 'user',
  ])
  const searched = recordsFromCliJson(payload)
  if (searched.length) return searched

  const listed = await runCommand([
    'lark-cli', 'base', '+record-list',
    '--base-token', baseToken,
    '--table-id', tableId,
    '--field-id', 'Docs',
    '--field-id', 'Slug',
    '--field-id', 'Targets',
    '--field-id', 'Publish Targets',
    '--field-id', 'Status',
    '--field-id', 'Placement Type',
    '--limit', '200',
    '--format', 'json',
    '--as', 'user',
  ])
  return recordsFromCliJson(listed).filter(record => recordContainsToken(record, docToken))
}

async function resolveDocInManual({ manuals, manualName, docToken, runCommand = runJsonCommand }) {
  const manual = manuals[manualName]
  if (!manual?.base) return null
  const { baseToken, allTables, tableSelector } = parseBase(manual.base)
  let tables
  if (allTables) {
    tables = await listTables(baseToken, runCommand)
  } else if (tableSelector) {
    tables = [{ table_id: tableSelector, name: tableSelector }]
  } else {
    tables = (await listTables(baseToken, runCommand)).slice(0, 1)
  }

  for (const table of tables) {
    const tableId = table.table_id || table.tableId || table.id || table.name
    if (!tableId) continue
    const records = await searchTable({ baseToken, tableId, docToken, runCommand })
    const record = records.find(item => recordContainsToken(item, docToken))
    if (record) {
      return {
        manualName,
        title: recordTitle(record, docToken),
        record,
        tableId,
        baseToken,
      }
    }
  }
  return null
}

async function resolveDocToken({ manuals, docToken, docLink, runCommand = runJsonCommand, manualNames = currentPublishManuals() }) {
  const matches = []
  const lookupTokens = await expandLookupTokens(docToken, runCommand, docLink)
  for (const lookupToken of lookupTokens) {
    for (const manualName of manualNames) {
      const match = await resolveDocInManual({ manuals, manualName, docToken: lookupToken, runCommand })
      if (match) matches.push({ ...match, requestedToken: docToken, lookupToken })
    }
  }
  const uniqueMatches = []
  const seen = new Set()
  for (const match of matches) {
    const key = `${match.manualName}:${match.record?.record_id || match.tableId}:${match.lookupToken}`
    if (seen.has(key)) continue
    seen.add(key)
    uniqueMatches.push(match)
  }
  const manualsMatched = [...new Set(uniqueMatches.map(item => item.manualName))]
  if (manualsMatched.length > 1) {
    throw new Error(`doc token ${docToken} matched multiple manuals: ${manualsMatched.join(', ')}`)
  }
  return uniqueMatches[0] || null
}

module.exports = {
  expandLookupTokens,
  listTables,
  parseBase,
  recordsFromCliJson,
  resolveDocInManual,
  resolveDocToken,
  runJsonCommand,
  rowsFromCliJson,
  searchTable,
}
