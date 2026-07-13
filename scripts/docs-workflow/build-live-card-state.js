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

function stageStatus(statuses) {
  if (statuses.includes('fail')) return 'fail'
  if (statuses.every(status => status === 'done')) return 'done'
  if (statuses.some(status => status === 'running' || status === 'done')) return 'running'
  return 'pending'
}

function guidesProduceStatus(byName) {
  const assembly = byName.get('produce_guides')
  if (assembly) return jobStatus(assembly)
  const prerequisites = [
    byName.get('produce_guides_sources'),
    byName.get('render_guides_saas'),
    byName.get('render_guides_byoc'),
  ].map(jobStatus)
  if (prerequisites.includes('fail')) return 'fail'
  if (prerequisites.some(status => status === 'running' || status === 'done')) return 'running'
  return 'pending'
}

function buildLiveCardState({ requestedGroups, jobs, publishEnabled, notes = [] }) {
  if (!Array.isArray(requestedGroups) || requestedGroups.length === 0) throw new Error('requestedGroups must be a non-empty array')
  const byName = new Map((jobs || []).map(job => [normalizeJobName(job.name), job]))
  const rows = requestedGroups.map(group => {
    const statuses = Object.fromEntries(PHASES.map(phase => {
      const status = phase.key === 'produce' && group === 'guides'
        ? guidesProduceStatus(byName)
        : jobStatus(byName.get(phase.job(group)))
      return [phase.key, publishEnabled ? status : (phase.key === 'produce' ? status : 'pending')]
    }))
    return { group, statuses }
  })
  const stages = PHASES.map(phase => {
    const statuses = rows.map(row => row.statuses[phase.key])
    const done = statuses.filter(status => status === 'done').length
    return { name: `${phase.label} (${done}/${requestedGroups.length})`, status: stageStatus(statuses) }
  })
  const verify = jobStatus(byName.get('verify'))
  stages.push({ name: 'Verify', status: verify })
  const icon = { pending: '⬜', running: '⏳', done: '✅', fail: '❌' }
  const progressRows = [
    '**Manual progress**',
    '',
    ...rows.map(({ group, statuses }) => `- **${group}** · ${icon[statuses.produce]} Produce · ${icon[statuses.source]} Source · ${icon[statuses.translate]} Translate · ${icon[statuses.translation]} Translation`),
  ]
  const state = {
    stages,
    noteMarkdown: progressRows.join('\n'),
    overallStatus: stages.some(stage => stage.status === 'fail') ? 'fail' : stages.every(stage => stage.status === 'done') ? 'done' : 'running',
  }
  if (rows.length > 1) state.manuals = rows.map(({ group, statuses }) => ({ group, ...statuses }))
  if (Array.isArray(notes) && notes.length) state.notes = notes.filter(note => typeof note === 'string' && note.trim())
  return state
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
      notes: args['notes-json'] ? JSON.parse(args['notes-json']) : [],
    })
    fs.writeFileSync(args.output, `${JSON.stringify(state, null, 2)}\n`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { buildLiveCardState, parseJobsResponse }
