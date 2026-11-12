'use strict'

const fs = require('node:fs')
const path = require('node:path')

const MAX_AGE_MS = 24 * 60 * 60 * 1000
const REQUIRED_JOBS = Object.freeze([
  { label: 'verify / verify', names: ['verify / verify'] },
  { label: 'aggregate', names: ['aggregate'] },
])
// Shared-source fallback attribution lives in the en Guides sources job log as
// `[shared-fallback]` warn lines (one JSON object per fallback page). They are
// informational: fallback keeps the previous published content, so it never
// gates watchdog health — the daily digest turns new entries into follow-ups.
const SHARED_FALLBACK_JOB_PREFIX = 'produce_guides_sources'
const SHARED_FALLBACK_MARKER = '[shared-fallback]'
const MAX_SHARED_FALLBACK_ENTRIES = 100
// `[shared-reuse]` info lines are the zero-drift replay signal: pages whose
// render identity is unchanged republish pinned baseline bytes without a build.
// Purely informational for the digest; absence only means the round had drift.
// The bound is set well above the current onboarding scale so `reuse_count`
// never silently under-reports a fully replayed round.
const SHARED_REUSE_MARKER = '[shared-reuse]'
const MAX_SHARED_REUSE_ENTRIES = 1000

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

function stripAnsi(value) {
  return String(value ?? '').replace(/\u001B\[[0-9;?]*[0-9A-Za-z]/g, '')
}

function parseSharedFallbackEntry(payload) {
  let parsed
  try { parsed = JSON.parse(payload) } catch { parsed = null }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { raw: payload.slice(0, 500) }
  return {
    record_id: typeof parsed.record_id === 'string' ? parsed.record_id : null,
    page: typeof parsed.page === 'string' ? parsed.page : null,
    code: typeof parsed.code === 'string' ? parsed.code : null,
    message: typeof parsed.message === 'string' ? parsed.message.slice(0, 500) : null,
    paths: Array.isArray(parsed.paths) ? parsed.paths.filter(item => typeof item === 'string').slice(0, 10) : [],
  }
}

function parseSharedFallbackLog(logText) {
  const entries = []
  const seen = new Set()
  for (const line of stripAnsi(logText).split(/\r?\n/)) {
    const marker = line.indexOf(SHARED_FALLBACK_MARKER)
    if (marker < 0) continue
    const payload = line.slice(marker + SHARED_FALLBACK_MARKER.length).trim()
    if (!payload) continue
    const entry = parseSharedFallbackEntry(payload)
    // Malformed payloads cannot be identified, so each is quarantined as-is.
    const key = entry.raw !== undefined ? `raw|${entries.length}` : `${entry.record_id}|${entry.page}|${entry.code}`
    if (seen.has(key)) continue
    seen.add(key)
    entries.push(entry)
    if (entries.length >= MAX_SHARED_FALLBACK_ENTRIES) break
  }
  return entries
}

function countSharedFallbackCodes(entries) {
  const codes = {}
  for (const entry of entries) {
    const code = entry.code || 'UNKNOWN'
    codes[code] = (codes[code] || 0) + 1
  }
  return codes
}

function withSharedFallback(result, fallback) {
  return { ...result, shared_fallback: fallback ?? null }
}

function parseSharedReuseEntry(payload) {
  let parsed
  try { parsed = JSON.parse(payload) } catch { parsed = null }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { raw: payload.slice(0, 500) }
  return {
    record_id: typeof parsed.record_id === 'string' ? parsed.record_id : null,
    page: typeof parsed.page === 'string' ? parsed.page : null,
    outputs: Number.isSafeInteger(parsed.outputs) ? parsed.outputs : null,
  }
}

function parseSharedReuseLog(logText) {
  const entries = []
  const seen = new Set()
  for (const line of stripAnsi(logText).split(/\r?\n/)) {
    const marker = line.indexOf(SHARED_REUSE_MARKER)
    if (marker < 0) continue
    const payload = line.slice(marker + SHARED_REUSE_MARKER.length).trim()
    if (!payload) continue
    const entry = parseSharedReuseEntry(payload)
    const key = entry.raw !== undefined ? `raw|${entries.length}` : `${entry.record_id}|${entry.page}`
    if (seen.has(key)) continue
    seen.add(key)
    entries.push(entry)
    if (entries.length >= MAX_SHARED_REUSE_ENTRIES) break
  }
  return entries
}

function withSharedReuse(result, reuse) {
  return { ...result, shared_reuse: reuse ?? null }
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

  // Job logs redirect to a download URL and stream plain text; the body must
  // never be inlined into an error message.
  async function getLogText(endpoint) {
    const response = await fetch(`${base}${endpoint}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      redirect: 'follow',
    })
    if (!response.ok) throw new Error(`GitHub API request failed (${response.status})`)
    return response.text()
  }

  async function fetchSharedFallbacks(runId, jobs) {
    const detailHint = `guides-sources-en-${runId} artifact bundle.json outcomes[].detail`
    const targets = (Array.isArray(jobs) ? jobs : [])
      .filter(job => normalizedJobName(job?.name).startsWith(SHARED_FALLBACK_JOB_PREFIX) && Number.isSafeInteger(Number(job?.id)))
    if (!targets.length) return { source: 'unavailable', reason: `no ${SHARED_FALLBACK_JOB_PREFIX} job found on the selected run`, detail_hint: detailHint }
    const entries = []
    const warnings = []
    for (const job of targets) {
      try {
        entries.push(...parseSharedFallbackLog(await getLogText(`/actions/jobs/${Number(job.id)}/logs`)))
      } catch (error) {
        warnings.push(`${job.name}: ${String(error.message).slice(0, 200)}`)
      }
    }
    if (!entries.length && warnings.length) {
      return { source: 'unavailable', reason: warnings.join('; ').slice(0, 500), detail_hint: detailHint }
    }
    return {
      source: 'produce_guides_sources job logs',
      count: entries.length,
      pages: [...new Set(entries.map(entry => entry.page).filter(Boolean))],
      codes: countSharedFallbackCodes(entries),
      entries,
      detail_hint: detailHint,
      ...(warnings.length ? { warnings: warnings.map(warning => warning.slice(0, 200)) } : {}),
    }
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

  async function fetchSharedReuse(runId, jobs) {
    const detailHint = `guides-sources-en-${runId} artifact bundle.json outcomes[].status`
    const targets = (Array.isArray(jobs) ? jobs : [])
      .filter(job => normalizedJobName(job?.name).startsWith(SHARED_FALLBACK_JOB_PREFIX) && Number.isSafeInteger(Number(job?.id)))
    if (!targets.length) return { source: 'unavailable', reason: `no ${SHARED_FALLBACK_JOB_PREFIX} job found on the selected run`, detail_hint: detailHint }
    const entries = []
    const warnings = []
    for (const job of targets) {
      try {
        entries.push(...parseSharedReuseLog(await getLogText(`/actions/jobs/${Number(job.id)}/logs`)))
      } catch (error) {
        warnings.push(`${job.name}: ${String(error.message).slice(0, 200)}`)
      }
    }
    if (!entries.length && warnings.length) {
      return { source: 'unavailable', reason: warnings.join('; ').slice(0, 500), detail_hint: detailHint }
    }
    return {
      source: 'produce_guides_sources job logs',
      count: entries.length,
      pages: [...new Set(entries.map(entry => entry.page).filter(Boolean))],
      entries,
      detail_hint: detailHint,
      ...(warnings.length ? { warnings: warnings.map(warning => warning.slice(0, 200)) } : {}),
    }
  }

  return { fetchSharedFallbacks, fetchSharedReuse, inspectRecentRuns }
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
  const fallback = result.shared_fallback || null
  const entries = fallback && Array.isArray(fallback.entries) ? fallback.entries : []
  const pages = [...new Set(entries.map(entry => entry.page).filter(Boolean))]
  const codes = Object.keys((fallback && fallback.codes) || {}).sort()
  const reuse = result.shared_reuse || null
  const reuseEntries = reuse && Array.isArray(reuse.entries) ? reuse.entries : []
  const reusePages = [...new Set(reuseEntries.map(entry => entry.page).filter(Boolean))]
  const lines = [
    `ok=${encode(result.ok)}`,
    `reason=${encode(result.reason)}`,
    `run_url=${encode(result.run_url)}`,
    `last_successful_at=${encode(result.last_successful_at)}`,
    `final_sha=${encode(result.final_sha)}`,
    `fallback_count=${encode(fallback ? fallback.count : 0)}`,
    `fallback_pages=${encode(pages.join(','))}`,
    `fallback_codes=${encode(codes.join(','))}`,
    `reuse_count=${encode(reuse ? reuse.count : 0)}`,
    `reuse_pages=${encode(reusePages.join(','))}`,
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
    if (result.ok) {
      let fallback
      try {
        fallback = await adapter.fetchSharedFallbacks(result.run_id, observation.jobsByRunId[result.run_id] || [])
      } catch (error) {
        fallback = { source: 'unavailable', reason: `GitHub API failure: ${String(error.message).slice(0, 480)}` }
      }
      result = withSharedFallback(result, fallback)
      let reuse
      try {
        reuse = await adapter.fetchSharedReuse(result.run_id, observation.jobsByRunId[result.run_id] || [])
      } catch (error) {
        reuse = { source: 'unavailable', reason: `GitHub API failure: ${String(error.message).slice(0, 480)}` }
      }
      result = withSharedReuse(result, reuse)
    }
  } catch (error) {
    result = failure(`GitHub API failure: ${error.message}`)
  }
  result = withSharedFallback(result, result.shared_fallback ?? null)
  result = withSharedReuse(result, result.shared_reuse ?? null)
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
  parseSharedFallbackLog,
  parseSharedReuseLog,
  safeOutputPath,
  withSharedFallback,
  withSharedReuse,
}
