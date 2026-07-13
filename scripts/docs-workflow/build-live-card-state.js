'use strict'

const fs = require('node:fs')

const PHASES = [
  { key: 'produce', label: 'Produce manuals', job: group => `produce_${group}` },
  { key: 'source', label: 'Publish sources', job: group => `publish_${group}` },
  { key: 'translate', label: 'Translate manuals', job: group => `translate_${group}` },
  { key: 'translation', label: 'Publish translations', job: group => `publish_${group}_translation` },
]
const FAILED = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure'])

function parseJobsResponse(value) {
  if (Array.isArray(value)) return value.flatMap(page => Array.isArray(page?.jobs) ? page.jobs : [])
  return Array.isArray(value?.jobs) ? value.jobs : []
}

function normalizeJobName(name) {
  return String(name || '').split(' / ')[0]
}

function jobStatus(job) {
  if (!job) return 'pending'
  if (job.status !== 'completed') return 'running'
  if (job.conclusion === 'success' || job.conclusion === 'neutral') return 'done'
  if (job.conclusion === 'skipped') return 'pending'
  return FAILED.has(job.conclusion) ? 'fail' : 'pending'
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ').replaceAll('`', '\\`')
}

function stageStatus(statuses) {
  if (statuses.includes('fail')) return 'fail'
  if (statuses.every(status => status === 'done')) return 'done'
  if (statuses.some(status => status === 'running' || status === 'done')) return 'running'
  return 'pending'
}

function buildLiveCardState({ requestedGroups, jobs, publishEnabled }) {
  if (!Array.isArray(requestedGroups) || requestedGroups.length === 0) throw new Error('requestedGroups must be a non-empty array')
  const byName = new Map((jobs || []).map(job => [normalizeJobName(job.name), job]))
  const rows = requestedGroups.map(group => {
    const statuses = Object.fromEntries(PHASES.map(phase => [phase.key, publishEnabled ? jobStatus(byName.get(phase.job(group))) : (phase.key === 'produce' ? jobStatus(byName.get(phase.job(group))) : 'pending')]))
    return { group, statuses }
  })
  const stages = PHASES.map(phase => {
    const statuses = rows.map(row => row.statuses[phase.key])
    const done = statuses.filter(status => status === 'done').length
    return { name: `${phase.label} (${done}/${requestedGroups.length})`, status: stageStatus(statuses) }
  })
  const verify = jobStatus(byName.get('verify'))
  stages.push({ name: 'Verify', status: verify })
  const table = [
    '| Manual | Produce | Source | Translate | Translation |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map(({ group, statuses }) => `| ${escapeCell(group)} | ${statuses.produce} | ${statuses.source} | ${statuses.translate} | ${statuses.translation} |`),
  ]
  return {
    stages,
    noteMarkdown: table.join('\n'),
    overallStatus: stages.some(stage => stage.status === 'fail') ? 'fail' : stages.every(stage => stage.status === 'done') ? 'done' : 'running',
  }
}

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid arguments')
    result[flag.slice(2)] = value
  }
  return result
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2))
    const state = buildLiveCardState({
      requestedGroups: JSON.parse(args['groups-json']),
      jobs: [
        ...parseJobsResponse(JSON.parse(fs.readFileSync(args['jobs-file'], 'utf8'))),
        ...(args['override-job'] ? [{ name: args['override-job'], status: 'completed', conclusion: args['override-conclusion'] || 'success' }] : []),
      ],
      publishEnabled: args.publish === 'true',
    })
    fs.writeFileSync(args.output, `${JSON.stringify(state, null, 2)}\n`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { buildLiveCardState, parseJobsResponse }
