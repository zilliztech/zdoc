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

function rowsFromCliJson(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.data?.items || payload?.items || payload?.records || payload?.data?.records || []
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

async function listTables(baseToken, runCommand = runJsonCommand) {
  const payload = await runCommand([
    'lark-cli', 'base', '+table-list',
    '--base-token', baseToken,
    '--as', 'user',
    '--format', 'json',
  ])
  return rowsFromCliJson(payload)
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
  return rowsFromCliJson(payload)
}

async function resolveDocInManual({ manuals, manualName, docToken, runCommand = runJsonCommand }) {
  const manual = manuals[manualName]
  if (!manual?.base) return null
  const { baseToken, allTables, tableSelector } = parseBase(manual.base)
  const tables = allTables
    ? await listTables(baseToken, runCommand)
    : [{ table_id: tableSelector || manual.base, name: tableSelector || manual.base }]

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

async function resolveDocToken({ manuals, docToken, runCommand = runJsonCommand, manualNames = currentPublishManuals() }) {
  const matches = []
  for (const manualName of manualNames) {
    const match = await resolveDocInManual({ manuals, manualName, docToken, runCommand })
    if (match) matches.push(match)
  }
  if (matches.length > 1) {
    throw new Error(`doc token ${docToken} matched multiple manuals: ${matches.map(item => item.manualName).join(', ')}`)
  }
  return matches[0] || null
}

module.exports = {
  listTables,
  parseBase,
  resolveDocInManual,
  resolveDocToken,
  runJsonCommand,
  searchTable,
}
