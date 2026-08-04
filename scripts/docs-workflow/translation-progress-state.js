'use strict'

const SDK_GROUPS = new Set(['python', 'java', 'node', 'go', 'cli', 'rest', 'reference-landings'])
const FAILURE_CONCLUSIONS = new Set(['failure', 'timed_out', 'action_required', 'startup_failure'])
const CANCELLED_CONCLUSIONS = new Set(['cancelled'])
const INFRASTRUCTURE_STEP = /^(?:set up job|complete job|actions\/checkout@|run actions\/checkout@|post |checkout|set up (?:node|pnpm)|setup (?:node|pnpm)|install dependencies)/i

const GROUP_LABELS = Object.freeze({
  python: 'Python SDK', java: 'Java SDK', node: 'Node.js SDK', go: 'Go SDK', cli: 'Zilliz CLI', rest: 'REST API',
  'reference-landings': 'Reference landing pages',
})

const PUBLISHERS = Object.freeze({
  'ja-JP/guides': 'publish_ja_guides',
  'ja-JP/python': 'publish_ja_python',
  'zh-CN-reference/python': 'publish_zh_python',
  'ja-JP/java': 'publish_ja_java',
  'zh-CN-reference/java': 'publish_zh_java',
  'ja-JP/node': 'publish_ja_node',
  'zh-CN-reference/node': 'publish_zh_node',
  'ja-JP/go': 'publish_ja_go',
  'zh-CN-reference/go': 'publish_zh_go',
  'ja-JP/cli': 'publish_ja_cli',
  'zh-CN-reference/cli': 'publish_zh_cli',
  'ja-JP/rest': 'publish_ja_rest',
  'zh-CN-reference/rest': 'publish_zh_rest',
  'zh-CN-reference/reference-landings': 'publish_zh_reference_landings',
})

const PUBLISH_PREDECESSORS = Object.freeze({
  publish_ja_python: 'publish_ja_guides', publish_zh_python: 'publish_ja_python',
  publish_ja_java: 'publish_zh_python', publish_zh_java: 'publish_ja_java',
  publish_ja_node: 'publish_zh_java', publish_zh_node: 'publish_ja_node',
  publish_ja_go: 'publish_zh_node', publish_zh_go: 'publish_ja_go',
  publish_ja_cli: 'publish_zh_go', publish_zh_cli: 'publish_ja_cli',
  publish_ja_rest: 'publish_zh_cli', publish_zh_rest: 'publish_ja_rest',
  publish_zh_reference_landings: 'publish_zh_rest',
})

const PUBLISHER_LABELS = Object.freeze({
  publish_ja_guides: 'Japanese Guides', publish_ja_python: 'Japanese Python SDK', publish_zh_python: 'Chinese Reference Python SDK',
  publish_ja_java: 'Japanese Java SDK', publish_zh_java: 'Chinese Reference Java SDK',
  publish_ja_node: 'Japanese Node.js SDK', publish_zh_node: 'Chinese Reference Node.js SDK',
  publish_ja_go: 'Japanese Go SDK', publish_zh_go: 'Chinese Reference Go SDK',
  publish_ja_cli: 'Japanese Zilliz CLI', publish_zh_cli: 'Chinese Reference Zilliz CLI',
  publish_ja_rest: 'Japanese REST API', publish_zh_rest: 'Chinese Reference REST API',
})

function parseSdkTranslationJob(job) {
  const match = String(job?.name || '').match(/^translate_sdk \((ja-JP|zh-CN-reference), (python|java|node|go|cli|rest|reference-landings), \2, (?:(?:[^\s,()]+, )?[^\s,()]+\.\.\.|[^\s,()]+, [^\s,()]+\)) \/ translate$/)
  return match && PUBLISHERS[`${match[1]}/${match[2]}`] ? {target: match[1], group: match[2]} : null
}

function parseGuidesBatchJob(job) {
  const match = String(job?.name || '').match(/^translate_guides_batches \((\d+), (\d+)\) \/ translate$/)
  return match ? {batchIndex: Number(match[1]), batchNumber: Number(match[2])} : null
}

function baseJobName(job) {
  return String(job?.name || '').split(' / ')[0].trim()
}

function logicalJobIdentity(job) {
  const sdk = parseSdkTranslationJob(job)
  if (sdk) return `translate:${sdk.target}/${sdk.group}`
  const batch = parseGuidesBatchJob(job)
  if (batch) return `guides-batch:${batch.batchIndex}/${batch.batchNumber}`
  return baseJobName(job)
}

function recency(job) {
  return [
    Number.isSafeInteger(job?.run_attempt) ? job.run_attempt : 1,
    String(job?.completed_at || job?.started_at || ''),
    Number.isSafeInteger(job?.id) ? job.id : 0,
  ]
}

function isNewer(candidate, existing) {
  const left = recency(candidate)
  const right = recency(existing)
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] > right[index]) return true
    if (left[index] < right[index]) return false
  }
  return false
}

function selectEffectiveTranslationJobs(jobs) {
  const selected = new Map()
  for (const job of jobs || []) {
    const identity = logicalJobIdentity(job)
    if (!identity) continue
    const existing = selected.get(identity)
    if (!existing || isNewer(job, existing)) selected.set(identity, job)
  }
  return [...selected.values()]
}

function jobStatus(job, {skippedAsCompleted = true} = {}) {
  if (!job) return 'waiting'
  if (job.status === 'completed') {
    if (job.conclusion === 'success' || job.conclusion === 'neutral' || (skippedAsCompleted && job.conclusion === 'skipped')) return 'completed'
    if (CANCELLED_CONCLUSIONS.has(job.conclusion)) return 'cancelled'
    if (FAILURE_CONCLUSIONS.has(job.conclusion)) return 'failed'
    return 'waiting'
  }
  return job.status === 'in_progress' ? 'running' : 'waiting'
}

function currentStep(job) {
  const steps = Array.isArray(job?.steps) ? job.steps : []
  const running = steps.find(step => step.status === 'in_progress')
  if (running && !INFRASTRUCTURE_STEP.test(running.name)) return String(running.name)
  if (['failed', 'cancelled'].includes(jobStatus(job, {skippedAsCompleted: false}))) {
    const failed = [...steps].reverse().find(step => FAILURE_CONCLUSIONS.has(step.conclusion) || CANCELLED_CONCLUSIONS.has(step.conclusion))
    if (failed && !INFRASTRUCTURE_STEP.test(failed.name)) return String(failed.name)
  }
  return null
}

function aggregateStatus(statuses) {
  if (statuses.includes('failed')) return 'failed'
  if (statuses.includes('cancelled')) return 'cancelled'
  if (statuses.length > 0 && statuses.every(status => status === 'completed')) return 'completed'
  if (statuses.includes('running') || statuses.includes('completed')) return 'running'
  return 'waiting'
}

function metric(statuses, detail = null) {
  return {done: statuses.filter(status => status === 'completed').length, total: statuses.length, status: aggregateStatus(statuses), detail}
}

function phase(key, label, statuses) {
  return {key, label, ...metric(statuses)}
}

function unitIdentity(unit) {
  return `${unit.target}/${unit.group}`
}

function validateSelectedUnits(selectedUnits) {
  if (!Array.isArray(selectedUnits) || selectedUnits.length === 0) throw new Error('selectedUnits must be a non-empty array')
  const identities = new Set()
  return selectedUnits.map((unit, index) => {
    if (!unit || typeof unit !== 'object' || Array.isArray(unit)) throw new Error(`selectedUnits[${index}] must be an object`)
    const {target, group} = unit
    if (!['ja-JP', 'zh-CN-reference'].includes(target)) throw new Error(`selectedUnits[${index}].target is invalid`)
    if (group !== 'guides' && !SDK_GROUPS.has(group)) throw new Error(`selectedUnits[${index}].group is invalid`)
    if (group === 'guides' && target !== 'ja-JP') throw new Error('Guides translation target must be ja-JP')
    const identity = `${target}/${group}`
    if (identities.has(identity)) throw new Error(`duplicate selected translation unit: ${identity}`)
    if (!PUBLISHERS[identity]) throw new Error(`unsupported selected translation unit: ${identity}`)
    identities.add(identity)
    return {target, group}
  })
}

function unitLabel(unit) {
  if (unit.group === 'guides') return 'Japanese Guides'
  const locale = unit.target === 'ja-JP' ? 'Japanese' : 'Chinese Reference'
  return `${locale} ${GROUP_LABELS[unit.group]}`
}

function prepareJobs(selectedUnits, byName) {
  const jobs = [byName.get('prepare')]
  if (selectedUnits.some(unit => unit.group === 'guides')) jobs.push(byName.get('prepare_guides_batches'))
  return jobs
}

function prepareState(jobs) {
  const statuses = jobs.map(job => jobStatus(job))
  const status = aggregateStatus(statuses)
  const visible = jobs.find(job => ['failed', 'cancelled'].includes(jobStatus(job))) || jobs.find(job => jobStatus(job) === 'running')
  return {status, currentTask: currentStep(visible) || (status === 'failed' ? 'Prepare translation failed' : status === 'running' ? 'Prepare translation inputs' : 'Waiting for translation preparation')}
}

function publisherState(identity, byName) {
  const publisherName = PUBLISHERS[identity]
  const publisher = byName.get(publisherName)
  const status = jobStatus(publisher, {skippedAsCompleted: false})
  if (status === 'completed') return {status, currentTask: 'Workflow completed'}
  if (status === 'running') return {status, currentTask: currentStep(publisher) || `Publish ${PUBLISHER_LABELS[publisherName] || identity}`}
  if (status === 'failed' || status === 'cancelled') return {status, currentTask: currentStep(publisher) || `Publish ${PUBLISHER_LABELS[publisherName] || identity} failed`}
  const predecessorName = PUBLISH_PREDECESSORS[publisherName]
  const predecessor = byName.get(predecessorName)
  if (predecessorName && predecessor && jobStatus(predecessor) !== 'completed') {
    return {status: 'waiting', currentTask: `Waiting for ${PUBLISHER_LABELS[predecessorName] || predecessorName} publisher`}
  }
  return {status: 'waiting', currentTask: 'Waiting to publish'}
}

function sdkTranslationState(unit, sdkJobs) {
  const job = sdkJobs.get(unitIdentity(unit))
  const status = jobStatus(job)
  return {
    status,
    currentTask: currentStep(job) || (status === 'failed' || status === 'cancelled' ? `Translate ${unitLabel(unit)} failed` : status === 'running' ? `Translate ${unitLabel(unit)}` : status === 'completed' ? 'Translation completed' : 'Waiting to translate'),
  }
}

function guideTranslationState(batchJobs) {
  if (!batchJobs.length) return {status: 'waiting', currentTask: 'Waiting for Guides batch matrix', detail: '0 batches available', statuses: ['waiting']}
  const statuses = batchJobs.map(job => jobStatus(job))
  const counts = {completed: 0, running: 0, waiting: 0, failed: 0, cancelled: 0}
  for (const status of statuses) counts[status] += 1
  const selected = batchJobs.find(job => ['failed', 'cancelled'].includes(jobStatus(job))) || batchJobs.find(job => jobStatus(job) === 'running')
  const status = aggregateStatus(statuses)
  const failed = counts.failed + counts.cancelled
  return {
    status,
    currentTask: currentStep(selected) || (status === 'completed' ? 'Translation completed' : status === 'failed' || status === 'cancelled' ? 'Translate Japanese Guides failed' : 'Waiting to translate Guides batches'),
    detail: `${counts.completed}/${batchJobs.length} batches complete · ${counts.running} active · ${counts.waiting} pending · ${failed} failed`,
    statuses,
  }
}

function deriveUnit({unit, preparation, sdkJobs, batchJobs, byName, publishEnabled}) {
  const label = unitLabel(unit)
  if (preparation.status !== 'completed') return {id: unitIdentity(unit), label, phase: 'prepare', status: preparation.status, currentTask: preparation.currentTask, detail: null}
  const translated = unit.group === 'guides' ? guideTranslationState(batchJobs) : sdkTranslationState(unit, sdkJobs)
  if (translated.status !== 'completed') return {id: unitIdentity(unit), label, phase: 'translate', status: translated.status, currentTask: translated.currentTask, detail: translated.detail || null}
  if (!publishEnabled) return {id: unitIdentity(unit), label, phase: 'translate', status: 'completed', currentTask: 'Workflow completed', detail: null}
  const published = publisherState(unitIdentity(unit), byName)
  return {id: unitIdentity(unit), label, phase: 'publish', status: published.status, currentTask: published.currentTask, detail: null}
}

function targetKey(unit) {
  if (unit.group === 'guides') return 'ja-guides'
  return unit.target === 'ja-JP' ? 'ja-sdks' : 'zh-reference-sdks'
}

const TARGETS = Object.freeze([
  {key: 'ja-guides', label: 'Japanese Guides'},
  {key: 'ja-sdks', label: 'Japanese SDKs'},
  {key: 'zh-reference-sdks', label: 'Chinese Reference SDKs'},
])

function translationStatuses(unit, sdkJobs, batchJobs) {
  if (unit.group === 'guides') return batchJobs.length ? batchJobs.map(job => jobStatus(job)) : ['waiting']
  return [jobStatus(sdkJobs.get(unitIdentity(unit)))]
}

function publishStatus(unit, byName, publishEnabled) {
  if (!publishEnabled) return 'completed'
  return publisherState(unitIdentity(unit), byName).status
}

function normalizeSuccess(state, publishEnabled) {
  return {
    ...state,
    overallStatus: 'success',
    phases: state.phases.map(item => ({...item, done: item.total, status: 'completed'})),
    targets: state.targets.map(target => ({
      ...target,
      translate: {...target.translate, done: target.translate.total, status: 'completed'},
      publish: {...target.publish, done: target.publish.total, status: 'completed'},
    })),
    units: state.units.map(unit => ({...unit, phase: publishEnabled ? 'publish' : 'translate', status: 'completed', currentTask: 'Workflow completed', detail: null})),
  }
}

function deriveTranslationProgressState({selectedUnits, jobs = [], publishEnabled = true, terminalStatus = null, reports = []}) {
  const selection = validateSelectedUnits(selectedUnits)
  const effectiveJobs = selectEffectiveTranslationJobs(jobs)
  const byName = new Map(effectiveJobs.map(job => [baseJobName(job), job]))
  const sdkJobs = new Map(effectiveJobs.map(job => [parseSdkTranslationJob(job), job]).filter(([parsed]) => parsed).map(([parsed, job]) => [unitIdentity(parsed), job]))
  const batchJobs = effectiveJobs.filter(job => parseGuidesBatchJob(job)).sort((left, right) => parseGuidesBatchJob(left).batchIndex - parseGuidesBatchJob(right).batchIndex)
  const preparationJobs = prepareJobs(selection, byName)
  const preparation = prepareState(preparationJobs)
  const units = selection.map(unit => deriveUnit({unit, preparation, sdkJobs, batchJobs, byName, publishEnabled}))

  const targets = TARGETS.filter(target => selection.some(unit => targetKey(unit) === target.key)).map(target => {
    const targetUnits = selection.filter(unit => targetKey(unit) === target.key)
    const translateStatuses = targetUnits.flatMap(unit => translationStatuses(unit, sdkJobs, batchJobs))
    const guideDetail = target.key === 'ja-guides' ? `${translateStatuses.filter(status => status === 'completed').length}/${translateStatuses.length} batches` : null
    const publishStatuses = targetUnits.map(unit => publishStatus(unit, byName, publishEnabled))
    return {key: target.key, label: target.label, translate: metric(translateStatuses, guideDetail), publish: metric(publishStatuses, publishEnabled ? null : 'Disabled')}
  })

  const aggregateJob = byName.get('aggregate')
  const aggregateJobStatus = jobStatus(aggregateJob, {skippedAsCompleted: false})
  const resolvedTerminal = terminalStatus || (aggregateJob?.status === 'completed'
    ? aggregateJob.conclusion === 'success' ? 'success' : aggregateJob.conclusion === 'cancelled' ? 'cancelled' : 'failure'
    : null)
  const phases = [
    phase('prepare', 'Prepare', preparationJobs.map(job => jobStatus(job))),
    phase('translate', 'Translate', selection.flatMap(unit => translationStatuses(unit, sdkJobs, batchJobs))),
    phase('publish', 'Publish', selection.map(unit => publishStatus(unit, byName, publishEnabled))),
    {key: 'aggregate', label: 'Aggregate', done: aggregateJobStatus === 'completed' ? 1 : 0, total: 1, status: aggregateJobStatus},
  ]
  const visibleFailure = units.some(unit => unit.status === 'failed') || phases.some(item => item.status === 'failed')
  const visibleCancellation = units.some(unit => unit.status === 'cancelled') || phases.some(item => item.status === 'cancelled')
  const state = {
    kind: 'translation',
    title: 'Zilliz Cloud Docs Translation',
    overallStatus: resolvedTerminal || (visibleFailure ? 'failure' : visibleCancellation ? 'cancelled' : 'running'),
    phases,
    targets,
    units,
    reports: Array.isArray(reports) ? reports : [],
    links: [],
  }
  return resolvedTerminal === 'success' ? normalizeSuccess(state, publishEnabled) : state
}

module.exports = {
  deriveTranslationProgressState,
  parseGuidesBatchJob,
  parseSdkTranslationJob,
  selectEffectiveTranslationJobs,
}
