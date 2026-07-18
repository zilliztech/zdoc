'use strict'

const GROUP_LABELS = Object.freeze({
  guides: 'Guides',
  python: 'Python SDK',
  java: 'Java SDK',
  node: 'Node.js SDK',
  go: 'Go SDK',
  cli: 'Zilliz CLI',
  rest: 'REST API',
})

const DEPENDENCY_LABELS = Object.freeze({
  guides: 'Guides',
  python: 'Python',
  java: 'Java',
  node: 'Node.js',
  go: 'Go',
  cli: 'CLI',
  rest: 'REST API',
})

const PHASES = Object.freeze([
  { key: 'produce', label: 'Produce', job: group => `produce_${group}` },
  { key: 'publish', label: 'Publish', job: group => `publish_${group}` },
  { key: 'translate', label: 'Translate', job: group => `translate_${group}` },
  { key: 'translation', label: 'Publish translations', job: group => `publish_${group}_translation` },
])

const PUBLISH_PREDECESSOR = Object.freeze({
  guides: 'python',
  python: 'rest',
  node: 'java',
  go: 'node',
  cli: 'go',
  rest: 'cli',
})

const TRANSLATION_PUBLISH_PREDECESSOR = Object.freeze({
  guides: 'rest',
  python: 'guides',
  java: 'python',
  node: 'java',
  go: 'node',
  cli: 'go',
  rest: 'cli',
})

const FAILURE_CONCLUSIONS = new Set([
  'failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure',
])

const INFRASTRUCTURE_STEP = /^(?:actions\/checkout@|checkout|set up (?:node|pnpm)|setup (?:node|pnpm)|install dependencies|post |complete job|cleanup|clean up)/i

const TASK_NAMES = new Map([
  ['restore guides v4 cache candidate', 'Restore Guides v4 cache candidate'],
  ['validate and promote guides v4 cache candidate', 'Validate Guides media cache'],
  ['prefetch shared guides media', 'Prefetch shared Guides media'],
  ['save guides v4 generation', 'Save Guides media cache'],
  ['evaluate guides assembly reuse', 'Evaluate Guides assembly reuse'],
  ['validate guides assembly decision', 'Validate Guides assembly decision'],
  ['generate combined guides sidebars offline', 'Generate combined Guides sidebars offline'],
  ['finalize guides assembly identity', 'Finalize Guides assembly identity'],
  ['validate combined guides output', 'Validate combined Guides output'],
  ['render guides table', 'Render Guides table'],
  ['restore guides source artifact', 'Restore Guides source artifact'],
  ['validate guides translation batch identities', 'Validate Guides translation batch identities'],
  ['apply guides translation batches to staging', 'Apply Guides translation batches to staging'],
  ['push guides translation staging ref', 'Push Guides translation staging ref'],
  ['validate combined guides translation', 'Validate combined Guides translation'],
  ['promote validated guides translation', 'Promote validated Guides translation'],
  ['clean up guides translation staging ref', 'Clean up Guides translation staging ref'],
  ['write guides translation publication report', 'Write Guides translation publication report'],
  ['emit guides translation publication result', 'Emit Guides translation publication result'],
])

function logicalJobIdentity(job) {
  const parts = String(job?.name || '').split(' / ').map(part => part.trim())
  if (parts[0] === 'render_guides_tables' && parts.length >= 4) {
    return `render_guides_tables:${parts[1]}:${parts.slice(2, -1).join(' / ')}`
  }
  if (/^guides_translation_batch_/.test(parts[0])) {
    const phase = parts.slice(1).join(' / ').match(/^(translate|publish) batch\b/i)?.[1]?.toLowerCase() || 'unknown'
    return `${parts[0]}:${phase}`
  }
  return parts[0]
}

function jobRecency(job) {
  return [
    Number.isSafeInteger(job?.run_attempt) ? job.run_attempt : 1,
    String(job?.completed_at || job?.started_at || ''),
    Number.isSafeInteger(job?.id) ? job.id : 0,
  ]
}

function isNewer(candidate, existing) {
  const left = jobRecency(candidate)
  const right = jobRecency(existing)
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] > right[index]) return true
    if (left[index] < right[index]) return false
  }
  return false
}

function selectEffectiveJobs(jobs) {
  const selected = new Map()
  for (const job of jobs || []) {
    const identity = logicalJobIdentity(job)
    if (!identity) continue
    const existing = selected.get(identity)
    if (!existing || isNewer(job, existing)) selected.set(identity, job)
  }
  return [...selected.values()]
}

function normalizeCurrentTask(name) {
  const task = String(name || '').trim()
  if (!task) return null
  const mapped = TASK_NAMES.get(task.toLowerCase())
  if (mapped) return mapped
  if (INFRASTRUCTURE_STEP.test(task)) return null
  return task
}

function jobStatus(job) {
  if (!job) return 'waiting'
  if (job.status === 'completed') {
    if (job.conclusion === 'success' || job.conclusion === 'neutral') return 'completed'
    if (FAILURE_CONCLUSIONS.has(job.conclusion)) return 'failed'
    return 'waiting'
  }
  return job.status === 'in_progress' ? 'running' : 'waiting'
}

function currentStep(job) {
  const steps = Array.isArray(job?.steps) ? job.steps : []
  const running = steps.find(step => step.status === 'in_progress')
  if (running) return normalizeCurrentTask(running.name)
  if (jobStatus(job) === 'failed') {
    const failed = [...steps].reverse().find(step => FAILURE_CONCLUSIONS.has(step.conclusion))
    if (failed) return normalizeCurrentTask(failed.name)
  }
  return null
}

function phaseResult(job, fallbackTask) {
  const status = jobStatus(job)
  return {
    status,
    currentTask: currentStep(job) || (status === 'failed' ? `${fallbackTask} failed` : fallbackTask),
    detail: null,
  }
}

function guidesRenderIdentity(job) {
  const identity = logicalJobIdentity(job)
  if (!identity.startsWith('render_guides_tables:')) return null
  const [, target, ...tableParts] = identity.split(':')
  return `${target} / ${tableParts.join(':')}`
}

function deriveGuidesProduce(effectiveJobs, guidesTableTotal = null) {
  const byIdentity = new Map(effectiveJobs.map(job => [logicalJobIdentity(job), job]))
  const source = byIdentity.get('produce_guides_sources')
  const sourceStatus = jobStatus(source)
  if (sourceStatus !== 'completed') return phaseResult(source, sourceStatus === 'waiting' ? 'Waiting to fetch Guides sources' : 'Fetch shared Guides sources')

  const renderJobs = effectiveJobs.filter(job => logicalJobIdentity(job).startsWith('render_guides_tables:'))
  const stableTotal = Number.isSafeInteger(guidesTableTotal) && guidesTableTotal >= 0
    ? Math.max(guidesTableTotal, renderJobs.length)
    : renderJobs.length
  if (stableTotal > 0) {
    const counts = { completed: 0, running: 0, waiting: 0, failed: 0 }
    for (const job of renderJobs) counts[jobStatus(job)] += 1
    const pending = Math.max(0, stableTotal - counts.completed - counts.running - counts.failed)
    if (counts.failed || counts.running || pending) {
      const failed = renderJobs.filter(job => jobStatus(job) === 'failed').map(guidesRenderIdentity).sort()
      const detail = `${counts.completed}/${stableTotal} complete · ${counts.running} active · ${pending} pending · ${counts.failed} failed${failed.length ? ` · failed: ${failed.join(', ')}` : ''}`
      return {
        status: counts.failed ? 'failed' : counts.running ? 'running' : 'waiting',
        currentTask: 'Render Guides tables',
        detail,
      }
    }
  }

  const assembly = byIdentity.get('produce_guides')
  return phaseResult(assembly, jobStatus(assembly) === 'waiting' ? 'Waiting for Guides assembly' : 'Assemble Guides checkpoint')
}

function translatorHasNoChanges(job) {
  if (jobStatus(job) !== 'completed') return false
  const steps = new Map((job.steps || []).map(step => [step.name, step]))
  return steps.get('Create validated translation checkpoints')?.conclusion === 'skipped' &&
    steps.get('Upload translation checkpoint')?.conclusion === 'skipped' &&
    steps.get('Emit translation result')?.conclusion === 'success'
}

function parseGuidesBatch(job) {
  const parts = String(job?.name || '').split(' / ')
  if (!/^guides_translation_batch_/.test(parts[0] || '')) return null
  const identity = parts[0].match(/^guides_translation_batch_(\d+)_of_(\d+)_pending_(\d+)$/)
  const phaseText = parts.slice(1).join(' / ')
  const phase = phaseText.match(/^(translate|publish)(?:\s+batch\s+\d+\s+of\s+\d+(?:\s+\(\d+ docs\))?)?$/)
  if (!identity || !phase) return null
  return {
    job,
    phase: phase[1],
    batchNumber: Number(identity[1]),
    batchCount: Number(identity[2]),
    pendingCount: Number(identity[3]),
  }
}

function guidesBatchPhase(effectiveJobs, phase) {
  const batches = effectiveJobs.map(parseGuidesBatch).filter(item => item?.phase === phase)
  if (!batches.length) return null
  const total = Math.max(...batches.map(item => item.batchCount))
  const completed = batches.filter(item => jobStatus(item.job) === 'completed').length
  const running = batches.filter(item => jobStatus(item.job) === 'running').length
  const failed = batches.filter(item => jobStatus(item.job) === 'failed').length
  const waiting = Math.max(0, total - completed - running - failed)
  return {
    status: failed ? 'failed' : completed === total ? 'completed' : (running || completed > 0) ? 'running' : 'waiting',
    currentTask: phase === 'translate' ? 'Translate Guides batches' : 'Stage Guides translation publication',
    detail: `${completed}/${total} complete · ${running} active · ${waiting} pending · ${failed} failed`,
  }
}

function waitingFor(group, phase) {
  const predecessor = phase === 'publish' ? PUBLISH_PREDECESSOR[group] : TRANSLATION_PUBLISH_PREDECESSOR[group]
  if (!predecessor) return phase === 'publish' ? 'Waiting to publish' : 'Waiting to publish translation'
  return `Waiting for ${DEPENDENCY_LABELS[predecessor]} publisher`
}

function deriveManualPhases({ group, effectiveJobs, publishEnabled, guidesTableTotal }) {
  const byIdentity = new Map(effectiveJobs.map(job => [logicalJobIdentity(job), job]))
  const phases = {}
  phases.produce = group === 'guides'
    ? deriveGuidesProduce(effectiveJobs, guidesTableTotal)
    : phaseResult(byIdentity.get(`produce_${group}`), `Produce ${GROUP_LABELS[group]}`)
  if (!publishEnabled) return phases

  const publishJob = byIdentity.get(`publish_${group}`)
  phases.publish = phases.produce.status !== 'completed'
    ? { status: 'waiting', currentTask: 'Waiting for production', detail: null }
    : publishJob && jobStatus(publishJob) !== 'waiting'
      ? phaseResult(publishJob, `Publish ${GROUP_LABELS[group]}`)
      : { status: 'waiting', currentTask: waitingFor(group, 'publish'), detail: null }

  const guidesTranslate = group === 'guides' ? guidesBatchPhase(effectiveJobs, 'translate') : null
  const translateJob = byIdentity.get(`translate_${group}`)
  phases.translate = phases.publish.status !== 'completed'
    ? { status: 'waiting', currentTask: 'Waiting for source publication', detail: null }
    : guidesTranslate || phaseResult(translateJob, `Translate ${GROUP_LABELS[group]}`)

  const guidesPublish = group === 'guides'
    ? phaseResult(byIdentity.get('publish_guides_translation_batches'), 'Stage Guides translation publication')
    : null
  const translationJob = byIdentity.get(`publish_${group}_translation`)
  if (phases.translate.status !== 'completed') {
    phases.translation = { status: 'waiting', currentTask: 'Waiting for translation', detail: null }
  } else if (guidesPublish) {
    phases.translation = guidesPublish
  } else if (translatorHasNoChanges(translateJob) && (!translationJob || translationJob.conclusion === 'skipped')) {
    phases.translation = { status: 'completed', currentTask: 'No translation changes', detail: null }
  } else if (translationJob && jobStatus(translationJob) !== 'waiting') {
    phases.translation = phaseResult(translationJob, `Publish ${GROUP_LABELS[group]} translation`)
  } else {
    phases.translation = { status: 'waiting', currentTask: waitingFor(group, 'translation'), detail: null }
  }
  return phases
}

function manualPresentation(group, phaseResults, publishEnabled) {
  const keys = publishEnabled ? PHASES.map(phase => phase.key) : ['produce']
  let phase = keys.find(key => phaseResults[key].status === 'failed')
  if (!phase) phase = keys.find(key => phaseResults[key].status === 'running')
  if (!phase) phase = keys.find(key => phaseResults[key].status === 'waiting')
  if (!phase) {
    const finalPhase = keys[keys.length - 1]
    return {
      group,
      label: GROUP_LABELS[group],
      phase: finalPhase,
      status: 'completed',
      currentTask: phaseResults[finalPhase].currentTask,
      detail: phaseResults[finalPhase].detail,
    }
  }
  return { group, label: GROUP_LABELS[group], phase, ...phaseResults[phase] }
}

function aggregatePhaseStatus(statuses) {
  if (statuses.includes('failed')) return 'failed'
  if (statuses.every(status => status === 'completed')) return 'completed'
  if (statuses.includes('running') || statuses.includes('completed')) return 'running'
  return 'waiting'
}

function derivePhase({ descriptor, manuals, effectiveJobs }) {
  if (descriptor.key === 'verify') {
    const status = jobStatus(effectiveJobs.find(job => logicalJobIdentity(job) === 'verify'))
    return { key: 'verify', label: 'Verify', done: status === 'completed' ? 1 : 0, total: 1, status }
  }
  const statuses = manuals.map(manual => manual.phaseResults[descriptor.key].status)
  return {
    key: descriptor.key,
    label: descriptor.label,
    done: statuses.filter(status => status === 'completed').length,
    total: statuses.length,
    status: aggregatePhaseStatus(statuses),
  }
}

function orderManuals(manuals) {
  const order = { failed: 0, running: 1, waiting: 2, completed: 3, cancelled: 0 }
  return [...manuals].sort((left, right) => order[left.status] - order[right.status])
}

function normalizeSuccessfulChildren(phases, manuals, publishEnabled) {
  const finalPhase = publishEnabled ? PHASES.at(-1).key : PHASES[0].key
  return {
    phases: phases.map(phase => ({ ...phase, done: phase.total, status: 'completed' })),
    manuals: manuals.map(manual => ({
      ...manual,
      phase: finalPhase,
      status: 'completed',
      currentTask: 'Workflow completed',
      detail: null,
    })),
  }
}

function deriveDocsProgressState({ requestedGroups, jobs = [], publishEnabled, reports = [], terminalStatus = null, guidesTableTotal = null }) {
  if (!Array.isArray(requestedGroups) || requestedGroups.length === 0) throw new Error('requestedGroups must be a non-empty array')
  for (const group of requestedGroups) if (!GROUP_LABELS[group]) throw new Error(`Unknown documentation group: ${group}`)
  const effectiveJobs = selectEffectiveJobs(jobs)
  const internalManuals = requestedGroups.map(group => {
    const phaseResults = deriveManualPhases({ group, effectiveJobs, publishEnabled, guidesTableTotal })
    return { phaseResults, presentation: manualPresentation(group, phaseResults, publishEnabled) }
  })
  const descriptors = publishEnabled ? [...PHASES, { key: 'verify', label: 'Verify' }] : [PHASES[0]]
  let phases = descriptors.map(descriptor => derivePhase({ descriptor, manuals: internalManuals, effectiveJobs }))
  let manuals = orderManuals(internalManuals.map(manual => manual.presentation))
  if (terminalStatus === 'success') ({ phases, manuals } = normalizeSuccessfulChildren(phases, manuals, publishEnabled))
  return {
    overallStatus: terminalStatus || (phases.some(phase => phase.status === 'failed') || manuals.some(manual => manual.status === 'failed') ? 'failure' : 'running'),
    phases,
    manuals,
    reports: Array.isArray(reports) ? reports : [],
  }
}

module.exports = {
  deriveDocsProgressState,
  logicalJobIdentity,
  normalizeCurrentTask,
  selectEffectiveJobs,
}
