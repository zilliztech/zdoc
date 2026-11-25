import {execFileSync, spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {constants, openSync, fstatSync, readSync, closeSync, appendFileSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const repositoryId = 660446555
const fetchPath = '.github/workflows/fetch-docs.yml'
const latestFetch = 'repos/zilliztech/zdoc/actions/workflows/fetch-docs.yml/runs?branch=master&per_page=1'
const summaryLimit = 64 * 1024 + 1
const indexLimit = 16 * 1024 * 1024
const pageResponseLimit = 128 * 1024 * 1024
const oid = /^[a-f0-9]{40}$/
const digest = /^[a-f0-9]{64}$/
const pageId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function previewBatchFetch(value) {
  const runs = value?.workflow_runs
  const run = Array.isArray(runs) && runs.length === 1 ? runs[0] : null
  if (!Number.isSafeInteger(run?.id) || run.id < 1 || run.repository?.id !== repositoryId ||
      run.head_repository?.id !== repositoryId || run.workflow_id !== 83360731 || run.path !== fetchPath ||
      run.head_branch !== 'master' || !['schedule', 'workflow_dispatch'].includes(run.event) || run.run_attempt !== 1 ||
      (run.event === 'workflow_dispatch' && (!Number.isSafeInteger(run.actor?.id) || run.actor.id < 1 ||
        run.triggering_actor?.id !== run.actor.id)) ||
      typeof run.head_sha !== 'string' || !oid.test(run.head_sha)) return {status: 'held', reason: 'BATCH_FETCH_UNOBSERVED'}
  if (run.status !== 'completed' || run.conclusion !== 'success') return {status: 'held', reason: 'BATCH_FETCH_UNAVAILABLE'}
  // This gate only avoids starting an expensive runner when the latest run
  // cannot qualify. The collector independently authenticates the evidence.
  return {status: 'check', runId: run.id, head: run.head_sha}
}

export function summarizeCollection(value, exitCode) {
  if (value?.kind !== 'guides-batch-collection-v1' || value.observation !== 'observed' ||
      value.writeEligible !== false || !Array.isArray(value.operations) || value.operations.length ||
      Object.hasOwn(value, 'localCandidate') || !Array.isArray(value.reasons) ||
      value.reasons.some(reason => typeof reason !== 'string' || !/^[A-Z][A-Z0-9_]{0,79}$/.test(reason))) {
    throw Error('BATCH_WORKFLOW_RESULT_INVALID')
  }
  const {status, reasons, index} = value
  if (status === 'collected' && exitCode === 0 && reasons.length === 0 &&
      typeof index?.sha256 === 'string' && digest.test(index.sha256) &&
      index.path === 'blobs/' + index.sha256 && Number.isSafeInteger(index.bytes) &&
      index.bytes > 0 && index.bytes <= indexLimit) {
    return {status, reasons, indexSha256: index.sha256}
  }
  if ((status === 'no-group' && exitCode === 0 && reasons.length === 0 && index === null) ||
      (status === 'held' && exitCode === 1 && reasons.length > 0)) return {status, reasons, indexSha256: null}
  throw Error('BATCH_WORKFLOW_RESULT_INVALID')
}

export function collectionCounts(index, measurement) {
  if (index?.kind !== 'guides-batch-collection-index-v1' || index.base?.origin?.kind !== 'observed' ||
      Object.hasOwn(index.base.origin, 'purpose') || index.writeEligible !== false ||
      !Array.isArray(index.operations) || index.operations.length || !Array.isArray(index.pages) || !index.pages.length ||
      measurement?.kind !== 'guides-batch-measurement-v1' || measurement.observation !== 'observed' ||
      !Array.isArray(measurement.pages)) throw Error('BATCH_WORKFLOW_MEASUREMENT_INVALID')
  const measured = new Map()
  let maxResponseBytes = 0
  for (const {pageId: page, responseBytes} of measurement.pages) {
    if (typeof page !== 'string' || !pageId.test(page) || measured.has(page) ||
        !Number.isSafeInteger(responseBytes) || responseBytes < 1 || responseBytes > pageResponseLimit) {
      throw Error('BATCH_WORKFLOW_MEASUREMENT_INVALID')
    }
    measured.set(page, responseBytes)
    maxResponseBytes = Math.max(maxResponseBytes, responseBytes)
  }
  const qualified = new Set(index.pages.map(page => page?.pageId))
  if (qualified.size !== index.pages.length || [...qualified].some(page => !measured.has(page))) {
    throw Error('BATCH_WORKFLOW_MEASUREMENT_INVALID')
  }
  return {qualifiedPageCount: qualified.size, measuredPageCount: measured.size, maxResponseBytes}
}

function readBounded(path, limit) {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
  try {
    const stat = fstatSync(fd)
    if (!stat.isFile() || stat.size < 1 || stat.size > limit) throw Error('BATCH_WORKFLOW_RESULT_INVALID')
    const buffer = Buffer.alloc(stat.size + 1)
    let offset = 0
    while (offset < buffer.length) {
      const bytes = readSync(fd, buffer, offset, buffer.length - offset, null)
      if (!bytes) break
      offset += bytes
    }
    if (offset !== stat.size) throw Error('BATCH_WORKFLOW_RESULT_INVALID')
    return buffer.subarray(0, offset)
  } finally {
    closeSync(fd)
  }
}

export const batchQualifyTimeoutMs = 245 * 60 * 1000

function collect(directory) {
  const resultPath = join(directory, 'collector-result.json')
  const output = openSync(resultPath, 'wx', 0o600)
  let child
  try {
    child = spawnSync(process.execPath, [fileURLToPath(new URL('batch-collect.mjs', import.meta.url)),
      '--source-repo', join(directory, 'source.git'), '--out', join(directory, 'evidence')], {
      // Match the provisioned capture environment used by the existing prepare
      // lane. Hosted package-manager metadata must not reach the collector.
      env: {LANG: 'C', LC_ALL: 'C', TZ: 'UTC', JITI_CACHE: 'false',
        PATH: '/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin', GH_TOKEN: process.env.GH_TOKEN},
      stdio: ['ignore', output, 'ignore'],
      timeout: batchQualifyTimeoutMs,
    })
  } finally {
    closeSync(output)
  }
  if (child.error || child.signal || child.status === null) throw Error('BATCH_WORKFLOW_COLLECTOR_UNCONFIRMED')
  const report = collectionSummary(resultPath, child.status)
  writeFileSync(join(directory, 'summary.json'), JSON.stringify(report) + '\n', {flag: 'wx', mode: 0o600})
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    'Batch qualification: ' + report.status + (report.reasons.length ? ' (' + report.reasons.join(', ') + ')' : '') + '\n' +
    (report.status === 'collected' ? 'Qualified pages: ' + report.qualifiedPageCount + '. Measured pages: ' +
      report.measuredPageCount + '. Largest response: ' + report.maxResponseBytes + ' bytes.\n' : ''))
}

export function collectionSummary(resultPath, exitCode) {
  const result = JSON.parse(readBounded(resultPath, summaryLimit))
  const report = summarizeCollection(result, exitCode)
  if (report.status !== 'collected') return report
  const evidence = join(dirname(resultPath), 'evidence')
  const rawIndex = readBounded(join(evidence, result.index.path), indexLimit)
  if (result.index.bytes !== rawIndex.length || createHash('sha256').update(rawIndex).digest('hex') !== report.indexSha256) {
    throw Error('BATCH_WORKFLOW_RESULT_INVALID')
  }
  const measurement = JSON.parse(readBounded(join(evidence, 'measurement.json'), summaryLimit))
  return {...report, ...collectionCounts(JSON.parse(rawIndex), measurement)}
}

function run(args) {
  if (args.length === 1 && args[0] === 'preview') {
    let preview
    try {
      const raw = execFileSync('gh', ['api', '--hostname', 'github.com', '--method', 'GET', latestFetch],
        {stdio: ['ignore', 'pipe', 'pipe'], timeout: 25000, maxBuffer: 256 * 1024})
      preview = previewBatchFetch(JSON.parse(raw))
    } catch {
      preview = {status: 'held', reason: 'BATCH_FETCH_UNOBSERVED'}
    }
    appendFileSync(process.env.GITHUB_OUTPUT, 'status=' + preview.status + '\n')
    const summary = preview.status === 'check'
      ? 'Latest normal Fetch ' + preview.runId + ' finished successfully. Batch verification is pending.'
      : 'Batch qualification paused (' + preview.reason + ').'
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n')
  } else if (args.length === 2 && args[0] === 'collect') collect(args[1])
  else throw Error('BATCH_WORKFLOW_ARGUMENTS')
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try { run(process.argv.slice(2)) } catch {
    process.stderr.write('Invalid batch qualification workflow result or inputs.\n')
    process.exitCode = 1
  }
}
