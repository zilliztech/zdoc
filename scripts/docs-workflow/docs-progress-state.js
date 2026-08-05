'use strict'

const SDK_LABELS = Object.freeze({
  python: 'Python SDK',
  java: 'Java SDK',
  node: 'Node.js SDK',
  go: 'Go SDK',
  cli: 'Zilliz CLI',
  rest: 'REST API',
})

const FETCH_BUSINESS_ORDER = Object.freeze([
  'source/java', 'source/node', 'source/go', 'source/cli',
  'source/rest', 'source/python', 'source/guides-en', 'source/guides-zh-CN',
])

const UNIT_TO_CARD_ID = Object.freeze({
  'source/java': 'java',
  'source/node': 'node',
  'source/go': 'go',
  'source/cli': 'cli',
  'source/rest': 'rest',
  'source/python': 'python',
  'source/guides-en': 'guides-en',
  'source/guides-zh-CN': 'guides-zh-CN',
})

const GUIDE_LANES = Object.freeze([
  Object.freeze({
    id: 'guides-en', locale: 'en', label: 'English Guides',
    sourceJob: 'produce_guides_sources', renderPrefix: 'render_guides_tables:', assemblyJob: 'produce_guides', publishJob: 'publish_guides',
  }),
  Object.freeze({
    id: 'guides-zh-CN', locale: 'zh-CN', label: 'Chinese Guides',
    sourceJob: 'produce_zh_guides_sources', renderPrefix: 'render_zh_guides_tables:', assemblyJob: 'produce_zh_guides', publishJob: 'publish_zh_guides',
  }),
])

const FAILURE_CONCLUSIONS = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure'])
const INFRASTRUCTURE_STEP = /^(?:actions\/checkout@|checkout|set up (?:node|pnpm)|setup (?:node|pnpm)|install dependencies|post |complete job|cleanup|clean up)/i

const TASK_NAMES = new Map([
  ['restore guides v4 cache candidate', 'Restore Guides v4 cache candidate'],
  ['validate and promote guides v4 cache candidate', 'Validate Guides media cache'],
  ['restore guides v5 cache candidate', 'Restore Guides v5 cache candidate'],
  ['validate and promote guides v5 cache candidate', 'Validate Guides media cache'],
  ['prefetch shared guides media', 'Prefetch shared Guides media'],
  ['save guides v4 generation', 'Save Guides media cache'],
  ['save guides v5 generation', 'Save Guides media cache'],
  ['evaluate guides assembly reuse', 'Evaluate Guides assembly reuse'],
  ['validate guides assembly decision', 'Validate Guides assembly decision'],
  ['generate combined guides sidebars offline', 'Generate combined Guides sidebars offline'],
  ['finalize guides assembly identity', 'Finalize Guides assembly identity'],
  ['validate combined guides output', 'Validate combined Guides output'],
  ['render guides table', 'Render Guides table'],
  ['restore guides source artifact', 'Restore Guides source artifact'],
])

function logicalJobIdentity(job) {
  const parts = String(job?.name || '').split(' / ').map(part => part.trim())
  if ((parts[0] === 'render_guides_tables' || parts[0] === 'render_zh_guides_tables') && parts.length >= 4) {
    return `${parts[0]}:${parts[1]}:${parts.slice(2, -1).join(' / ')}`
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
    if (job.conclusion === 'success' || job.conclusion === 'neutral' || job.conclusion === 'skipped') return 'completed'
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

function renderIdentity(job) {
  const identity = logicalJobIdentity(job)
  const [, target, ...tableParts] = identity.split(':')
  return `${target} / ${tableParts.join(':')}`
}

function deriveGuideProduce(lane, effectiveJobs, tableTotal) {
  const byIdentity = new Map(effectiveJobs.map(job => [logicalJobIdentity(job), job]))
  const source = byIdentity.get(lane.sourceJob)
  const sourceStatus = jobStatus(source)
  if (sourceStatus !== 'completed') {
    return phaseResult(source, sourceStatus === 'waiting' ? `Waiting to fetch ${lane.label} sources` : `Fetch ${lane.label} sources`)
  }

  const renderJobs = effectiveJobs.filter(job => logicalJobIdentity(job).startsWith(lane.renderPrefix))
  const stableTotal = Number.isSafeInteger(tableTotal) && tableTotal >= 0 ? Math.max(tableTotal, renderJobs.length) : renderJobs.length
  if (stableTotal > 0) {
    const counts = { completed: 0, running: 0, waiting: 0, failed: 0 }
    for (const job of renderJobs) counts[jobStatus(job)] += 1
    const pending = Math.max(0, stableTotal - counts.completed - counts.running - counts.failed)
    if (counts.failed || counts.running || pending) {
      const failed = renderJobs.filter(job => jobStatus(job) === 'failed').map(renderIdentity).sort()
      return {
        status: counts.failed ? 'failed' : counts.running ? 'running' : 'waiting',
        currentTask: `Render ${lane.label} tables`,
        detail: `${counts.completed}/${stableTotal} complete · ${counts.running} active · ${pending} pending · ${counts.failed} failed${failed.length ? ` · failed: ${failed.join(', ')}` : ''}`,
      }
    }
  }

  const assembly = byIdentity.get(lane.assemblyJob)
  return phaseResult(assembly, jobStatus(assembly) === 'waiting' ? `Waiting for ${lane.label} assembly` : `Assemble ${lane.label} checkpoint`)
}

function selectPresentation(phases, orderedKeys) {
  let phase = orderedKeys.find(key => phases[key].status === 'failed')
  if (!phase) phase = orderedKeys.find(key => phases[key].status === 'running')
  if (!phase) phase = orderedKeys.find(key => phases[key].status === 'waiting')
  if (!phase) phase = orderedKeys.at(-1)
  return {phase, ...phases[phase]}
}

function publicationDetail(stale) {
  return stale ? 'Publication progress may be stale' : null
}

function publicationPhase(unit, progress, stale) {
  if (!unit) return { status: 'waiting', currentTask: 'Waiting to publish', detail: publicationDetail(stale) }
  if (unit.state === 'producing') return { status: 'waiting', currentTask: 'Waiting for production', detail: publicationDetail(stale) }
  if (unit.state === 'candidate') return { status: 'waiting', currentTask: 'Preparing publication candidate', detail: publicationDetail(stale) }
  if (unit.state === 'ready') {
    const position = progress.queue.indexOf(unit.unitKey) + 1
    return { status: 'waiting', currentTask: position > 0 ? `Ready - queue position ${position}` : 'Ready', detail: publicationDetail(stale) }
  }
  if (unit.state === 'publishing') {
    return {
      status: 'running',
      currentTask: `Publishing - FIFO sequence ${unit.sequence} - attempt ${Math.max(1, unit.attempts || 0)}`,
      detail: publicationDetail(stale),
    }
  }
  if (unit.state === 'published') {
    return { status: 'completed', currentTask: `Published - ${String(unit.resultSha || '').slice(0, 7)}`, detail: publicationDetail(stale) }
  }
  if (unit.state === 'no_changes') return { status: 'completed', currentTask: 'No changes', detail: publicationDetail(stale) }
  if (['producer_failed', 'candidate_rejected', 'publish_failed'].includes(unit.state)) {
    return { status: 'failed', currentTask: 'Failed - queue continued', detail: publicationDetail(stale) }
  }
  return { status: 'waiting', currentTask: 'Waiting to publish', detail: publicationDetail(stale) }
}

function publicationUnit(progress, unitKey) {
  return progress?.units?.find(unit => unit.unitKey === unitKey) || null
}

function selectLanePresentation(phases, keys, progressUnit) {
  if (progressUnit && progressUnit.state !== 'producing') return {phase: 'publish', ...phases.publish}
  return selectPresentation(phases, keys)
}

function deriveGuideLane({ lane, effectiveJobs, publishEnabled, tableTotal, publicationProgress, publicationProgressStale }) {
  const byIdentity = new Map(effectiveJobs.map(job => [logicalJobIdentity(job), job]))
  const phases = { produce: deriveGuideProduce(lane, effectiveJobs, tableTotal) }
  const keys = ['produce']
  const progressUnit = publicationUnit(publicationProgress, `source/${lane.id}`)
  if (publishEnabled) {
    phases.publish = publicationProgress
      ? publicationPhase(progressUnit, publicationProgress, publicationProgressStale)
      : phases.produce.status !== 'completed'
        ? { status: 'waiting', currentTask: 'Waiting for production', detail: null }
        : byIdentity.get(lane.publishJob) && jobStatus(byIdentity.get(lane.publishJob)) !== 'waiting'
          ? phaseResult(byIdentity.get(lane.publishJob), `Publish ${lane.label}`)
          : { status: 'waiting', currentTask: 'Waiting to publish', detail: null }
    keys.push('publish')
  }
  return { id: lane.id, locale: lane.locale, label: lane.label, ...selectLanePresentation(phases, keys, progressUnit), phaseResults: phases }
}

function deriveSdkItem({ group, effectiveJobs, publishEnabled, publicationProgress, publicationProgressStale }) {
  const byIdentity = new Map(effectiveJobs.map(job => [logicalJobIdentity(job), job]))
  const phases = { produce: phaseResult(byIdentity.get(`produce_${group}`), `Produce ${SDK_LABELS[group]}`) }
  const keys = ['produce']
  const progressUnit = publicationUnit(publicationProgress, `source/${group}`)
  if (publishEnabled) {
    const publishJob = byIdentity.get(`publish_${group}`)
    phases.publish = publicationProgress
      ? publicationPhase(progressUnit, publicationProgress, publicationProgressStale)
      : phases.produce.status !== 'completed'
        ? { status: 'waiting', currentTask: 'Waiting for production', detail: null }
        : publishJob && jobStatus(publishJob) !== 'waiting'
          ? phaseResult(publishJob, `Publish ${SDK_LABELS[group]}`)
          : { status: 'waiting', currentTask: 'Waiting to publish', detail: null }
    keys.push('publish')
  }
  return { id: group, label: SDK_LABELS[group], ...selectLanePresentation(phases, keys, progressUnit), phaseResults: phases }
}

function aggregateStatus(statuses) {
  if (statuses.includes('failed')) return 'failed'
  if (statuses.length > 0 && statuses.every(status => status === 'completed')) return 'completed'
  if (statuses.includes('running') || statuses.includes('completed')) return 'running'
  return 'waiting'
}

function phaseSummary(key, label, statuses) {
  return { key, label, done: statuses.filter(status => status === 'completed').length, total: statuses.length, status: aggregateStatus(statuses) }
}

function normalizeHandoff(input, effectiveJobs) {
  if (input && ['waiting', 'running', 'completed', 'failed', 'cancelled'].includes(input.status)) {
    return {
      status: input.status,
      label: input.status === 'completed' ? 'Translation dispatched' : input.status === 'failed' ? 'Translation handoff failed' : 'Translation handoff',
      url: typeof input.childRunUrl === 'string' ? input.childRunUrl : null,
    }
  }
  const byIdentity = new Map(effectiveJobs.map(job => [logicalJobIdentity(job), job]))
  const prepare = byIdentity.get('prepare_translation_handoff')
  const dispatch = byIdentity.get('dispatch_translations')
  const selected = jobStatus(prepare) === 'failed' ? prepare : dispatch || prepare
  const status = jobStatus(selected)
  return { status, label: status === 'completed' ? 'Translation dispatched' : status === 'failed' ? 'Translation handoff failed' : 'Translation handoff', url: null }
}

function orderItems(items) {
  const order = { failed: 0, cancelled: 0, running: 1, waiting: 2, completed: 3 }
  return [...items].sort((left, right) => order[left.status] - order[right.status])
}

function completedItem(item) {
  return {...item, phase: item.phaseResults.publish ? 'publish' : 'produce', status: 'completed', currentTask: 'Workflow completed', detail: null}
}

function canonicalPublicationItems(guides, items) {
  const byId = new Map([...guides, ...items].map(item => [item.id, item]))
  return FETCH_BUSINESS_ORDER.map(unitKey => byId.get(UNIT_TO_CARD_ID[unitKey])).filter(Boolean)
}

function deriveDocsProgressState({
  requestedGroups,
  jobs = [],
  publishEnabled,
  runTranslations = false,
  reports = [],
  terminalStatus = null,
  guideTableTotals = {},
  handoff = null,
  publicationProgress = null,
  publicationProgressStale = false,
}) {
  if (!Array.isArray(requestedGroups) || requestedGroups.length === 0) throw new Error('requestedGroups must be a non-empty array')
  for (const group of requestedGroups) if (group !== 'guides' && !SDK_LABELS[group]) throw new Error(`Unknown documentation group: ${group}`)
  const effectiveJobs = selectEffectiveJobs(jobs)
  let guides = requestedGroups.includes('guides')
    ? GUIDE_LANES.map(lane => deriveGuideLane({
      lane, effectiveJobs, publishEnabled, tableTotal: guideTableTotals[lane.locale], publicationProgress, publicationProgressStale,
    }))
    : []
  let items = requestedGroups.filter(group => group !== 'guides').map(group => deriveSdkItem({
    group, effectiveJobs, publishEnabled, publicationProgress, publicationProgressStale,
  }))
  const allLanes = [...guides, ...items]
  let phases = [phaseSummary('produce', 'Produce', allLanes.map(lane => lane.phaseResults.produce.status))]
  if (publishEnabled) {
    phases.push(phaseSummary('publish', 'Publish', allLanes.map(lane => lane.phaseResults.publish.status)))
    const verifyStatus = jobStatus(effectiveJobs.find(job => logicalJobIdentity(job) === 'verify'))
    phases.push({ key: 'verify', label: 'Verify', done: verifyStatus === 'completed' ? 1 : 0, total: 1, status: verifyStatus })
  }
  let normalizedHandoff = null
  if (runTranslations) {
    normalizedHandoff = normalizeHandoff(handoff, effectiveJobs)
    phases.push({ key: 'handoff', label: 'Handoff', done: normalizedHandoff.status === 'completed' ? 1 : 0, total: 1, status: normalizedHandoff.status })
  }

  if (terminalStatus === 'success') {
    phases = phases.map(phase => ({...phase, done: phase.total, status: 'completed'}))
    guides = guides.map(completedItem)
    items = items.map(completedItem)
    if (normalizedHandoff) normalizedHandoff = {...normalizedHandoff, status: 'completed', label: 'Translation dispatched'}
  }

  const visibleFailures = [...guides, ...items].some(item => item.status === 'failed') || phases.some(phase => phase.status === 'failed')
  const overallStatus = terminalStatus || (publicationProgress ? 'running' : visibleFailures ? 'failure' : 'running')
  const orderedItems = (publicationProgress
    ? canonicalPublicationItems([], items)
    : orderItems(items)).map(({phaseResults, ...item}) => item)
  const visibleGuides = guides.map(({phaseResults, ...guide}) => guide)
  const manuals = (publicationProgress
    ? canonicalPublicationItems(visibleGuides, orderedItems)
    : [...visibleGuides, ...orderedItems]).map(item => ({group: item.id, ...item}))
  return {
    kind: 'source',
    title: 'Zilliz Cloud Docs Build',
    overallStatus,
    phases,
    guides: visibleGuides,
    items: orderedItems,
    handoff: normalizedHandoff,
    manuals,
    reports: Array.isArray(reports) ? reports : [],
    links: [],
  }
}

module.exports = { deriveDocsProgressState, logicalJobIdentity, normalizeCurrentTask, selectEffectiveJobs }
