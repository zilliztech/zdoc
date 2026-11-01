#!/usr/bin/env node
'use strict'

// Aggregates GitHub Actions activity for the daily ops digest: the current
// production-queue occupancy (docs-production-dev members plus the translation
// producer), per-workflow run statistics for a window, and a run-count
// cross-check against the watchdog known-issues ledger. Read-only: it lists
// runs through the gh CLI and never dispatches, reruns, or cancels anything.

const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const REPOSITORY_DEFAULT = 'zilliztech/zdoc'
const LEDGER_PATH = path.join(__dirname, 'watchdog-known-issues.json')
const WORKFLOWS_DIR = path.join(__dirname, '..', '..', '.github', 'workflows')
const RUN_FIELDS = [
  'databaseId', 'workflowDatabaseId', 'workflowName', 'displayTitle', 'event',
  'status', 'conclusion', 'createdAt', 'startedAt', 'updatedAt', 'url', 'headBranch',
]
const ACTIVE_STATUSES = new Set(['queued', 'in_progress', 'waiting', 'requested'])
const KNOWN_ISSUE_STATUSES = new Set(['known-expected', 'watch', 'in-progress', 'resolved'])
const CADENCES = new Set(['daily', 'weekly'])
const CONCLUSION_ORDER = ['success', 'failure', 'cancelled', 'skipped', 'other']

function parseArgs(argv) {
  const args = new Map()
  const valueFlags = new Set(['--window', '--limit', '--repository', '--ledger'])
  const booleanFlags = new Set(['--json', '--markdown', '--validate-ledger'])
  let index = 0
  while (index < argv.length) {
    const flag = argv[index]
    if (booleanFlags.has(flag)) {
      if (args.has(flag)) throw new Error(`Duplicate argument: ${flag}`)
      args.set(flag, true)
      index += 1
      continue
    }
    if (!valueFlags.has(flag)) throw new Error(`Unsupported argument: ${flag || '<missing>'}`)
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) throw new Error(`Invalid value for ${flag}`)
    if (args.has(flag)) throw new Error(`Duplicate argument: ${flag}`)
    args.set(flag, value)
    index += 2
  }
  if (args.get('--json') && args.get('--markdown')) throw new Error('--json and --markdown are mutually exclusive')
  const limit = args.get('--limit') === undefined ? 300 : Number(args.get('--limit'))
  if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a positive integer')
  return {
    window: args.get('--window') || null,
    limit,
    repository: args.get('--repository') || REPOSITORY_DEFAULT,
    ledgerPath: args.get('--ledger') || LEDGER_PATH,
    json: args.get('--json') === true,
    validateLedger: args.get('--validate-ledger') === true,
  }
}

function formatTimezoneOffset(date) {
  const totalMinutes = -date.getTimezoneOffset()
  const sign = totalMinutes < 0 ? '-' : '+'
  const abs = Math.abs(totalMinutes)
  const hours = String(Math.floor(abs / 60)).padStart(2, '0')
  const minutes = String(abs % 60).padStart(2, '0')
  return `${sign}${hours}:${minutes}`
}

function localDayWindow(now = new Date()) {
  const offset = formatTimezoneOffset(now)
  const day = new Date(now)
  day.setDate(day.getDate() - 1)
  const pad = value => String(value).padStart(2, '0')
  const yesterday = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `${yesterday}T00:00:00${offset}..${today}T00:00:00${offset}`
}

function createGhAdapter({repository = REPOSITORY_DEFAULT, exec = execFileSync} = {}) {
  if (!/^[^/\s]+\/[^/\s]+$/.test(repository)) throw new Error('repository must be owner/name')
  const run = (args) => {
    try {
      return exec('gh', args, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']})
    } catch (error) {
      const detail = error.stderr || error.message
      throw new Error(`gh ${args.slice(0, 3).join(' ')} failed: ${detail}`)
    }
  }
  return {
    listRuns({created = null, limit = 300} = {}) {
      const args = ['run', 'list', '--repo', repository, '--limit', String(limit), '--json', RUN_FIELDS.join(',')]
      if (created) args.push('--created', created)
      return JSON.parse(run(args))
    },
    listWorkflows() {
      const pages = JSON.parse(run(['api', `repos/${repository}/actions/workflows`, '--paginate', '--slurp']))
      return pages.flatMap(page => page?.workflows || [])
    },
  }
}

function workflowFileIndex(workflows) {
  const index = new Map()
  for (const workflow of workflows || []) {
    if (!workflow || typeof workflow.id !== 'number') continue
    const file = path.basename(String(workflow.path || ''))
    if (file.endsWith('.yml') || file.endsWith('.yaml')) index.set(workflow.id, file)
  }
  return index
}

function runFile(run, fileByWorkflowId) {
  return fileByWorkflowId.get(run.workflowDatabaseId) || null
}

function runLabel(run, fileByWorkflowId) {
  return runFile(run, fileByWorkflowId) || run.workflowName || `workflow-${run.workflowDatabaseId}`
}

function summarizeWindow({runs, fileByWorkflowId}) {
  const byWorkflow = new Map()
  const failures = []
  for (const run of runs || []) {
    const file = runFile(run, fileByWorkflowId)
    const label = runLabel(run, fileByWorkflowId)
    const bucket = byWorkflow.get(label) || {
      file, name: run.workflowName || null, runs: 0, success: 0, failure: 0, cancelled: 0, other: 0,
    }
    bucket.runs += 1
    if (run.status !== 'completed') {
      bucket.other += 1 // still-active runs inside the window are neither success nor failure
    } else if (run.conclusion === 'success') bucket.success += 1
    else if (run.conclusion === 'failure') {
      bucket.failure += 1
      failures.push({
        runId: run.databaseId, file, name: run.workflowName || null, title: run.displayTitle || null,
        event: run.event || null, branch: run.headBranch || null, url: run.url || null,
      })
    } else if (run.conclusion === 'cancelled') bucket.cancelled += 1
    else bucket.other += 1
    byWorkflow.set(label, bucket)
  }
  const workflows = [...byWorkflow.values()].sort((a, b) => b.runs - a.runs || String(a.file).localeCompare(String(b.file)))
  const total = (runs || []).length
  const failuresOnly = failures.length
  const successOnly = [...byWorkflow.values()].reduce((sum, bucket) => sum + bucket.success, 0)
  return Object.freeze({
    total,
    success: successOnly,
    failure: failuresOnly,
    workflows: Object.freeze(workflows),
    failures: Object.freeze(failures.sort((a, b) => String(a.file).localeCompare(String(b.file)))),
  })
}

function elapsed(now, run) {
  const started = Date.parse(run.startedAt || run.createdAt || '')
  if (!Number.isFinite(started)) return null
  return Math.max(0, now - started)
}

function formatDuration(milliseconds) {
  if (milliseconds === null || !Number.isFinite(milliseconds)) return '?'
  const totalMinutes = Math.floor(milliseconds / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h${String(minutes).padStart(2, '0')}m` : `${minutes}m`
}

function snapshotQueue({runs, fileByWorkflowId, ledger, now = Date.now()}) {
  const members = new Set(ledger.productionQueueWorkflows || [])
  const producers = new Set(ledger.producerWorkflows || [])
  const entry = run => ({
    file: runFile(run, fileByWorkflowId),
    name: run.workflowName || null,
    status: run.status,
    runId: run.databaseId,
    title: run.displayTitle || null,
    event: run.event || null,
    branch: run.headBranch || null,
    url: run.url || null,
    elapsedMs: elapsed(now, run),
  })
  const active = (runs || []).filter(run => ACTIVE_STATUSES.has(run.status))
  const queue = []
  const producer = []
  let otherActive = 0
  for (const run of active) {
    const file = runFile(run, fileByWorkflowId)
    if (file && members.has(file)) queue.push(entry(run))
    else if (file && producers.has(file)) producer.push(entry(run))
    else otherActive += 1
  }
  const byElapsed = (a, b) => (b.elapsedMs ?? -1) - (a.elapsedMs ?? -1)
  return Object.freeze({
    queue: Object.freeze(queue.sort(byElapsed)),
    producer: Object.freeze(producer.sort(byElapsed)),
    otherActive,
  })
}

function crossCheckWatchdogs({runs, fileByWorkflowId, ledger}) {
  const countByFile = new Map()
  for (const run of runs || []) {
    const file = runFile(run, fileByWorkflowId)
    if (file) countByFile.set(file, (countByFile.get(file) || 0) + 1)
  }
  return Object.freeze((ledger.watchdogs || []).map(watchdog => {
    const runCount = countByFile.get(watchdog.workflow) || 0
    const cadence = watchdog.cadence || 'daily'
    let flag = null
    if (runCount === 0 && cadence === 'daily') flag = 'no-run-yesterday'
    if (runCount === 0 && cadence === 'weekly') flag = 'no-run-nonrunning-day'
    return Object.freeze({workflow: watchdog.workflow, cadence, runCount, flag})
  }))
}

function loadLedger(ledgerPath = LEDGER_PATH) {
  const raw = fs.readFileSync(ledgerPath, 'utf8')
  const ledger = JSON.parse(raw)
  if (!ledger || typeof ledger !== 'object' || Array.isArray(ledger)) throw new Error('ledger must be a JSON object')
  return ledger
}

function validateLedger(ledger, {workflowsDir = WORKFLOWS_DIR} = {}) {
  const errors = []
  if (ledger.schemaVersion !== 1) errors.push(`schemaVersion must be 1 (got ${JSON.stringify(ledger.schemaVersion)})`)
  const checkWorkflowList = (key, {required = true} = {}) => {
    const list = ledger[key]
    if (!Array.isArray(list) || list.length === 0) {
      if (required) errors.push(`${key} must be a non-empty array`)
      return new Set()
    }
    const seen = new Set()
    for (const item of list) {
      if (typeof item !== 'string' || !/\.ya?ml$/.test(item)) errors.push(`${key} entries must be workflow file names (.yml): ${JSON.stringify(item)}`)
      else if (seen.has(item)) errors.push(`${key} contains a duplicate: ${item}`)
      else if (!fs.existsSync(path.join(workflowsDir, item))) errors.push(`${key} references a missing workflow file: ${item}`)
      else seen.add(item)
    }
    return seen
  }
  checkWorkflowList('productionQueueWorkflows')
  const producerFiles = checkWorkflowList('producerWorkflows', {required: false})
  for (const item of producerFiles) {
    if ((ledger.productionQueueWorkflows || []).includes(item)) {
      errors.push(`producerWorkflows must stay off the production queue: ${item}`)
    }
  }
  if (!Array.isArray(ledger.watchdogs) || ledger.watchdogs.length === 0) {
    errors.push('watchdogs must be a non-empty array')
  } else {
    const ids = new Set()
    for (const watchdog of ledger.watchdogs) {
      const at = `watchdogs[${watchdog && watchdog.workflow}]`
      if (!watchdog || typeof watchdog !== 'object') {
        errors.push(`${at} must be an object`)
        continue
      }
      if (typeof watchdog.workflow !== 'string' || !fs.existsSync(path.join(workflowsDir, watchdog.workflow))) {
        errors.push(`${at} references a missing workflow file: ${JSON.stringify(watchdog.workflow)}`)
      }
      if (!CADENCES.has(watchdog.cadence)) errors.push(`${at} cadence must be daily|weekly (got ${JSON.stringify(watchdog.cadence)})`)
      for (const issue of watchdog.knownIssues || []) {
        if (!issue || typeof issue !== 'object' || typeof issue.id !== 'string' || issue.id.length === 0) {
          errors.push(`${at} knownIssues entries need a non-empty string id`)
          continue
        }
        if (ids.has(issue.id)) errors.push(`duplicate known-issue id: ${issue.id}`)
        ids.add(issue.id)
        if (!KNOWN_ISSUE_STATUSES.has(issue.status)) {
          errors.push(`${at} knownIssue ${issue.id} status must be one of ${[...KNOWN_ISSUE_STATUSES].join('|')} (got ${JSON.stringify(issue.status)})`)
        }
      }
    }
  }
  return Object.freeze({ok: errors.length === 0, errors: Object.freeze(errors)})
}

function renderQueueLine(entry) {
  const where = entry.branch ? ` on ${entry.branch}` : ''
  const title = entry.title ? ` — ${entry.title}` : ''
  return `- ${entry.file || entry.name}: [run ${entry.runId}](${entry.url}) ${entry.status}${where}, ${formatDuration(entry.elapsedMs)}${title}`
}

function renderMarkdown({windowLabel, summary, queue, watchdogCheck, producerNote}) {
  const lines = []
  lines.push(`## Production queue snapshot`)
  if (queue.queue.length === 0) lines.push('- docs-production-dev: idle (no member run in progress or queued)')
  else queue.queue.forEach(entry => lines.push(renderQueueLine(entry)))
  if (queue.producer.length === 0) lines.push('- Translation producer: none running')
  else queue.producer.forEach(entry => lines.push(renderQueueLine(entry)))
  if (queue.otherActive > 0) lines.push(`- Other active runs (non-queue): ${queue.otherActive}`)
  if (producerNote) lines.push(`- Note: ${producerNote}`)

  lines.push('')
  lines.push(`## Workflow runs ${windowLabel}`)
  lines.push(`Total ${summary.total} runs: ${summary.success} success, ${summary.failure} failure.`)
  lines.push('')
  lines.push('| Workflow | Runs | Success | Failure | Cancelled | Other |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: |')
  for (const row of summary.workflows) {
    lines.push(`| ${row.file || row.name} | ${row.runs} | ${row.success} | ${row.failure} | ${row.cancelled} | ${row.other} |`)
  }
  if (summary.failures.length > 0) {
    lines.push('')
    lines.push('Failures:')
    for (const failure of summary.failures) {
      lines.push(`- ${failure.file || failure.name}: [run ${failure.runId}](${failure.url}) (${failure.event}${failure.branch ? `, ${failure.branch}` : ''}) — ${failure.title}`)
    }
  }

  lines.push('')
  lines.push('## Watchdog run cross-check')
  for (const check of watchdogCheck) {
    if (check.flag === 'no-run-yesterday') lines.push(`- ${check.workflow}: **no run in window** (daily)`)
    else if (check.flag === 'no-run-nonrunning-day') lines.push(`- ${check.workflow}: no run in window (weekly; non-running day)`)
    else lines.push(`- ${check.workflow}: ${check.runCount} run${check.runCount === 1 ? '' : 's'}`)
  }
  return lines.join('\n')
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const ledger = loadLedger(args.ledgerPath)
  const validation = validateLedger(ledger)
  if (!validation.ok) {
    console.error(`watchdog-known-issues ledger is invalid (${args.ledgerPath}):`)
    for (const error of validation.errors) console.error(`- ${error}`)
    process.exitCode = 2
    return {ok: false, errors: validation.errors}
  }
  if (args.validateLedger) {
    process.stdout.write(`ledger ok: ${args.ledgerPath} (${ledger.watchdogs.length} watchdogs)\n`)
    return {ok: true}
  }
  const adapter = createGhAdapter({repository: args.repository})
  const window = args.window || localDayWindow()
  const [windowRuns, currentRuns, workflows] = [
    adapter.listRuns({created: window, limit: args.limit}),
    adapter.listRuns({limit: 100}),
    adapter.listWorkflows(),
  ]
  const fileByWorkflowId = workflowFileIndex(workflows)
  const summary = summarizeWindow({runs: windowRuns, fileByWorkflowId})
  const queue = snapshotQueue({runs: currentRuns, fileByWorkflowId, ledger})
  const watchdogCheck = crossCheckWatchdogs({runs: windowRuns, fileByWorkflowId, ledger})
  const result = {
    generatedAt: new Date().toISOString(),
    repository: args.repository,
    window,
    summary,
    queue,
    watchdogCheck,
  }
  if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  else process.stdout.write(`${renderMarkdown({windowLabel: window, summary, queue, watchdogCheck, producerNote: ledger.producerNote})}\n`)
  return {ok: true, result}
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = {
  REPOSITORY_DEFAULT,
  LEDGER_PATH,
  WORKFLOWS_DIR,
  KNOWN_ISSUE_STATUSES,
  CADENCES,
  parseArgs,
  localDayWindow,
  createGhAdapter,
  workflowFileIndex,
  summarizeWindow,
  snapshotQueue,
  crossCheckWatchdogs,
  validateLedger,
  loadLedger,
  renderMarkdown,
  main,
}
