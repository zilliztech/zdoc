'use strict'

const fs = require('node:fs')
const path = require('node:path')

const MAX_AGE_MS = 24 * 60 * 60 * 1000
const REQUIRED_JOBS = Object.freeze([
  { label: 'verify / verify', names: ['verify / verify'] },
  { label: 'aggregate', names: ['aggregate'] },
])

function normalizedJobName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function completionTime(run) {
  if (!run) return null
  const value = run.completed_at || run.updated_at
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

function isProductionRun(run, detail) {
  if (run.event === 'schedule') return true
  if (run.event !== 'workflow_dispatch') return false
  const inputs = detail?.inputs
  return inputs?.group === 'all' && (inputs.publish === true || inputs.publish === 'true')
}

function finalShaFromReport(report) {
  const ref = report?.ref
  return typeof ref === 'string' && /^[0-9a-f]{40}$/.test(ref) ? ref : null
}

function failure(reason, run = null) {
  return {
    ok: false,
    reason,
    run_url: run?.html_url || null,
    last_successful_at: completionTime(run) === null ? null : new Date(completionTime(run)).toISOString(),
    final_sha: null,
    final_sha_reason: 'docs-card report artifact unavailable',
    run_id: run?.id || null,
  }
}

function evaluateDocsIngestion(runs, options = {}) {
  const now = options.now instanceof Date ? options.now.getTime() : new Date(options.now || Date.now()).getTime()
  const details = options.detailsByRunId || {}
  const candidate = [...(runs || [])]
    .filter(run => run.status === 'completed' && run.conclusion === 'success' && isProductionRun(run, details[run.id]))
    .sort((left, right) => (completionTime(right) || 0) - (completionTime(left) || 0))[0]

  if (!candidate) return failure('no qualifying completed successful production run found')
  const completed = completionTime(candidate)
  if (completed === null) return failure('last qualifying production run has no completion time', candidate)
  if (now - completed > MAX_AGE_MS) return failure('last qualifying production run is older than 24 hours', candidate)

  const jobs = options.jobsByRunId?.[candidate.id] || []
  for (const required of REQUIRED_JOBS) {
    const job = jobs.find(item => required.names.includes(normalizedJobName(item.name)))
    if (!job) return failure(`required job ${required.label} is missing`, candidate)
    if (job.status !== 'completed' || job.conclusion !== 'success') {
      return failure(`required job ${required.label} concluded ${job.conclusion || job.status || 'unknown'}`, candidate)
    }
  }

  const finalSha = finalShaFromReport(options.reportsByRunId?.[candidate.id])
  return {
    ok: true,
    reason: 'healthy',
    run_url: candidate.html_url || null,
    last_successful_at: new Date(completed).toISOString(),
    final_sha: finalSha,
    final_sha_reason: finalSha ? 'docs-card report artifact ref' : 'docs-card report artifact unavailable',
    run_id: candidate.id,
  }
}

function createGitHubAdapter({ repository, token, fetch = globalThis.fetch }) {
  if (!/^[^/\s]+\/[^/\s]+$/.test(repository || '')) throw new Error('--repository must be owner/repo')
  if (!token) throw new Error('GITHUB_TOKEN is required')
  if (typeof fetch !== 'function') throw new Error('fetch implementation is required')
  const base = `https://api.github.com/repos/${repository}`

  async function get(endpoint) {
    const response = await fetch(`${base}${endpoint}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (!response.ok) {
      const body = typeof response.text === 'function' ? await response.text() : ''
      throw new Error(`GitHub API request failed (${response.status}): ${body}`)
    }
    return response.json()
  }

  async function inspectRecentRuns() {
    const listing = await get('/actions/workflows/fetch-docs.yml/runs?status=completed&per_page=20')
    const runs = Array.isArray(listing.workflow_runs) ? listing.workflow_runs : []
    const detailsByRunId = {}
    const jobsByRunId = {}
    const reportsByRunId = {}
    for (const run of runs) {
      detailsByRunId[run.id] = await get(`/actions/runs/${run.id}`)
      jobsByRunId[run.id] = (await get(`/actions/runs/${run.id}/jobs?per_page=100`)).jobs || []
    }
    return { runs, detailsByRunId, jobsByRunId, reportsByRunId }
  }

  return { inspectRecentRuns }
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Usage: docs-ingestion-watchdog.js --repository owner/repo --output path')
    const key = flag.slice(2)
    if (!['repository', 'output'].includes(key) || Object.hasOwn(values, key)) throw new Error(`Invalid argument: ${flag}`)
    values[key] = value
  }
  if (!values.repository || !values.output) throw new Error('--repository and --output are required')
  return values
}

function safeOutputPath(value, root = process.cwd()) {
  if (!value || path.isAbsolute(value) || /[\r\n\0]/.test(value)) throw new Error('--output must be a safe repository-relative path')
  const resolvedRoot = path.resolve(root)
  const resolved = path.resolve(resolvedRoot, value)
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('--output must stay inside the repository')
  return resolved
}

function appendGitHubOutputs(result, outputFile = process.env.GITHUB_OUTPUT) {
  if (!outputFile) return
  const encode = value => String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)
  const lines = [
    `ok=${encode(result.ok)}`,
    `reason=${encode(result.reason)}`,
    `run_url=${encode(result.run_url)}`,
    `last_successful_at=${encode(result.last_successful_at)}`,
    `final_sha=${encode(result.final_sha)}`,
  ]
  fs.appendFileSync(outputFile, `${lines.join('\n')}\n`)
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const output = safeOutputPath(args.output)
  let result
  try {
    const adapter = createGitHubAdapter({ repository: args.repository, token: process.env.GITHUB_TOKEN })
    const observation = await adapter.inspectRecentRuns()
    result = evaluateDocsIngestion(observation.runs, observation)
  } catch (error) {
    result = failure(`GitHub API failure: ${error.message}`)
  }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 })
  appendGitHubOutputs(result)
  if (!result.ok) process.exitCode = 1
  return result
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = {
  appendGitHubOutputs,
  createGitHubAdapter,
  evaluateDocsIngestion,
  main,
  safeOutputPath,
}
