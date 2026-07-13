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

function parseGuidesBatchJob(job) {
  const name = String(job?.name || '')
  const identity = name.match(/^guides_translation_batch_(\d+)_of_(\d+)_pending_(\d+)\s*\/\s*/)
  if (!identity) return null
  const phase = name.match(/\/\s*(translate|publish) batch\s+(\d+)\s+of\s+(\d+)(?:\s+\((\d+) docs\))?/)
  if (!phase) return null
  const batchNumber = Number(identity[1])
  const batchCount = Number(identity[2])
  if (Number(phase[2]) !== batchNumber || Number(phase[3]) !== batchCount) return null
  return {
    job,
    phase: phase[1],
    batchNumber,
    batchCount,
    pendingCount: Number(identity[3]),
    publishedCount: phase[4] === undefined ? null : Number(phase[4]),
  }
}

function guidesBatchState(jobs) {
  const parsed = (jobs || []).map(parseGuidesBatchJob).filter(Boolean)
  if (!parsed.length) return null
  const batchCount = Math.max(...parsed.map(item => item.batchCount))
  const pendingCount = Math.max(...parsed.map(item => item.pendingCount))
  const byPhase = phase => {
    const batches = new Map()
    for (const item of parsed.filter(item => item.phase === phase)) {
      const existing = batches.get(item.batchNumber)
      if (!existing || jobStatus(item.job) === 'fail' || existing.status === 'pending') {
        batches.set(item.batchNumber, { status: jobStatus(item.job), publishedCount: item.publishedCount })
      }
    }
    return batches
  }
  const translators = byPhase('translate')
  const publishers = byPhase('publish')
  const translatorStatuses = Array.from({ length: batchCount }, (_, index) => translators.get(index + 1)?.status || 'pending')
  const publisherStatuses = Array.from({ length: batchCount }, (_, index) => publishers.get(index + 1)?.status || 'pending')
  const translate = stageStatus(translatorStatuses)
  const translation = translate === 'fail' ? 'fail' : stageStatus(publisherStatuses)
  const publishedDocuments = [...publishers.values()]
    .filter(item => item.status === 'done' && Number.isSafeInteger(item.publishedCount))
    .reduce((sum, item) => sum + item.publishedCount, 0)
  const publishedBatches = [...publishers.values()].filter(item => item.status === 'done').length
  return {
    translate,
    translation,
    summary: `${publishedDocuments} documents published · ${Math.max(0, pendingCount - publishedDocuments)} remaining · ${publishedBatches}/${batchCount} batches`,
  }
}

function buildLiveCardState({ requestedGroups, jobs, publishEnabled, notes = [], noChangeGroups = [] }) {
  if (!Array.isArray(requestedGroups) || requestedGroups.length === 0) throw new Error('requestedGroups must be a non-empty array')
  const byName = new Map((jobs || []).map(job => [normalizeJobName(job.name), job]))
  const noChangeSet = new Set(noChangeGroups)
  const guidesBatches = guidesBatchState(jobs)
  const rows = requestedGroups.map(group => {
    const statuses = Object.fromEntries(PHASES.map(phase => {
      const jobName = phase.job(group)
      const status = group === 'guides' && guidesBatches && (phase.key === 'translate' || phase.key === 'translation')
        ? guidesBatches[phase.key]
        : group === 'guides' && noChangeSet.has(group) && (phase.key === 'translate' || phase.key === 'translation')
          ? 'done'
        : phase.key === 'translation' && noChangeSet.has(group) && !byName.has(jobName)
        ? 'done'
        : phase.key === 'produce' && group === 'guides'
          ? guidesProduceStatus(byName)
          : jobStatus(byName.get(jobName))
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
  if (requestedGroups.includes('guides') && guidesBatches) progressRows.push('', `Guides batches: ${guidesBatches.summary}`)
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
      noChangeGroups: args['no-change-groups-json'] ? JSON.parse(args['no-change-groups-json']) : [],
    })
    fs.writeFileSync(args.output, `${JSON.stringify(state, null, 2)}\n`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { buildLiveCardState, parseJobsResponse }
