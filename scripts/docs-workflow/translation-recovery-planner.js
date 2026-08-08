#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const {execFileSync, spawnSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {readPublicationDocument} = require('./publication-contracts')
const {validateTranslationHandoff} = require('./translation-handoff')

const SHA = /^[0-9a-f]{40}$/u
const CHECKSUM = /^[0-9a-f]{64}$/u
const POSITIVE_INTEGER = /^[1-9][0-9]*$/u
const ALLOWED_WORKFLOWS = new Set([
  '.github/workflows/translate-codex.yml',
  '.github/workflows/recover-translation.yml',
])

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function positiveInteger(value, label) {
  if (!POSITIVE_INTEGER.test(String(value || '')) || !Number.isSafeInteger(Number(value))) throw new Error(`${label} must be a positive integer`)
  return Number(value)
}

function safeRelativePath(value, label) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || /[\\\0\r\n]/u.test(value)) throw new Error(`${label} is unsafe`)
  const normalized = path.posix.normalize(value)
  if (normalized !== value || normalized === '.' || normalized.startsWith('../') || value.split('/').includes('..')) throw new Error(`${label} is unsafe`)
  return value
}

function validateRegularTree(root) {
  const absolute = path.resolve(root)
  if (!fs.statSync(absolute).isDirectory()) throw new Error('Downloaded artifact root must be a directory')
  const seen = new Set()
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name)
      const relative = path.relative(absolute, target).split(path.sep).join('/')
      safeRelativePath(relative, 'Downloaded artifact path')
      if (seen.has(relative)) throw new Error(`Downloaded artifact contains a duplicate path: ${relative}`)
      seen.add(relative)
      const stat = fs.lstatSync(target)
      if (stat.isSymbolicLink()) throw new Error(`Downloaded artifact contains a symlink: ${relative}`)
      if (stat.isDirectory()) visit(target)
      else if (!stat.isFile()) throw new Error(`Downloaded artifact contains an unsupported entry: ${relative}`)
    }
  }
  visit(absolute)
  return absolute
}

function readJsonFile(file, label) {
  const stat = fs.lstatSync(file)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${label} must be a regular non-symlink file`)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { throw new Error(`${label} JSON is invalid`) }
}

function validateDownloadedArtifactTree(root) {
  const absolute = validateRegularTree(root)
  const metadata = readJsonFile(path.join(absolute, 'metadata.json'), 'Recovery metadata')
  const manifest = readJsonFile(path.join(absolute, 'manifest.json'), 'Recovery manifest')
  if (![1, 2].includes(metadata.schemaVersion) || ![1, 2].includes(manifest.schemaVersion) || !Array.isArray(manifest.files)) {
    throw new Error('Recovery artifact schema is invalid')
  }
  const identities = new Set()
  for (const record of manifest.files) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Recovery file record is invalid')
    const sourcePath = safeRelativePath(record.sourcePath, 'Recovery source path')
    const targetPath = safeRelativePath(record.targetPath, 'Recovery target path')
    const identity = `${sourcePath}\0${targetPath}`
    if (identities.has(identity)) throw new Error(`Duplicate recovery file identity: ${sourcePath}`)
    identities.add(identity)
    if (!CHECKSUM.test(record.sourceHash || '') || !CHECKSUM.test(record.targetHash || '') ||
        !Number.isSafeInteger(record.targetSize) || record.targetSize < 0 || record.status !== 'translated') {
      throw new Error(`Recovery file identity is invalid: ${sourcePath}`)
    }
    const translated = path.join(absolute, 'translated-files', ...targetPath.split('/'))
    const translatedStat = fs.lstatSync(translated)
    if (!translatedStat.isFile() || translatedStat.isSymbolicLink() || translatedStat.size !== record.targetSize || sha256(fs.readFileSync(translated)) !== record.targetHash) {
      throw new Error(`Recovery translated file identity mismatch: ${targetPath}`)
    }
  }
  if (metadata.translated !== manifest.files.length) throw new Error('Recovery translated count mismatch')
  return Object.freeze({root: absolute, metadata, files: manifest.files})
}

function workflowPath(run) {
  return String(run?.path || '').split('@')[0]
}

function assertRunIdentity(run, repository, runId) {
  if (!run || Number(run.id) !== runId) throw new Error('Previous Translation workflow run was not found')
  if (run.repository?.full_name !== repository) throw new Error('Previous Translation run belongs to a different repository')
  if (!ALLOWED_WORKFLOWS.has(workflowPath(run))) throw new Error('Previous run is not an allowlisted Translation workflow')
  if (run.status !== 'completed') throw new Error('Previous Translation workflow run must be terminal before recovery')
  if (!Number.isSafeInteger(Number(run.repository?.id)) || Number(run.repository.id) < 1) throw new Error('Previous Translation repository identity is invalid')
}

function artifactsForAttempt(artifacts, attempt, nextAttempt) {
  const start = Date.parse(attempt.run_started_at)
  const end = nextAttempt ? Date.parse(nextAttempt.run_started_at) : Number.POSITIVE_INFINITY
  if (!Number.isFinite(start) || !(end > start)) throw new Error('Previous Translation run-attempt identity is ambiguous')
  return artifacts.filter(artifact => {
    const created = Date.parse(artifact.created_at)
    return Number.isFinite(created) && created >= start && created < end
  })
}

function exactArtifact(artifacts, name, {required = true, label = name} = {}) {
  const matches = artifacts.filter(artifact => artifact.name === name)
  if (!matches.length && !required) return null
  if (matches.length !== 1) throw new Error(`${label} must exist exactly once; artifact identity is ambiguous`)
  const artifact = matches[0]
  if (artifact.expired === true) throw new Error(`${label} is expired`)
  if (!Number.isSafeInteger(Number(artifact.id)) || Number(artifact.id) < 1 || !/^sha256:[0-9a-f]{64}$/u.test(artifact.digest || '')) {
    throw new Error(`${label} artifact identity is invalid`)
  }
  return artifact
}

function assertArtifactEnvelope(artifact, run, runId) {
  if (Number(artifact.workflow_run?.id) !== runId ||
      Number(artifact.workflow_run?.repository_id) !== Number(run.repository.id) ||
      Number(artifact.workflow_run?.head_repository_id) !== Number(run.repository.id)) {
    throw new Error(`Recovery artifact identity mismatch: ${artifact.name}`)
  }
}

async function downloadArtifact(client, artifact, destination, run, runId) {
  assertArtifactEnvelope(artifact, run, runId)
  fs.mkdirSync(destination, {recursive: true})
  await client.downloadArtifact(artifact, destination)
  return validateRegularTree(destination)
}

async function selectAttempt({client, run, runId, explicitAttempt, artifacts}) {
  const latest = positiveInteger(run.run_attempt, 'Previous Translation run attempt')
  const attempts = []
  for (let number = 1; number <= latest; number += 1) {
    const attempt = await client.getAttempt(runId, number)
    if (!attempt || Number(attempt.run_attempt) !== number || Number(attempt.id) !== runId) throw new Error(`Previous Translation attempt ${number} identity is ambiguous`)
    attempts.push(attempt)
  }
  const requested = explicitAttempt === undefined || explicitAttempt === '' ? null : positiveInteger(explicitAttempt, 'previous_run_attempt')
  if (requested !== null && requested > latest) throw new Error('previous_run_attempt does not exist for the selected run')
  const candidates = requested === null ? [...attempts].reverse() : [attempts[requested - 1]]
  for (const attempt of candidates) {
    if (attempt.status !== 'completed') {
      if (requested !== null || Number(attempt.run_attempt) === latest) throw new Error('Previous Translation run attempt must be terminal before recovery')
      continue
    }
    const scoped = artifactsForAttempt(artifacts, attempt, attempts[Number(attempt.run_attempt)] || null)
    const selectionName = `publication-selection-translation-${runId}-${attempt.run_attempt}`
    const matches = scoped.filter(artifact => artifact.name === selectionName)
    if (!matches.length && requested === null) continue
    const selectionArtifact = exactArtifact(scoped, selectionName, {label: 'Previous Translation publication selection'})
    return Object.freeze({attempt, artifacts: scoped, selectionArtifact})
  }
  throw new Error('No valid terminal Translation run attempt has an unexpired publication selection')
}

function buildRecoveryHandoff(selection, targetBaselineSha, executionToolingSha = selection.toolingSha) {
  if (!SHA.test(targetBaselineSha || '')) throw new Error('Queue-owned target baseline must be an exact commit SHA')
  if (!SHA.test(executionToolingSha || '')) throw new Error('Recovery execution tooling must be an exact commit SHA')
  const handoff = {
    schemaVersion: 2,
    locale: selection.inputs.selectedGroup === 'all' ? 'all' : selection.units.every(unit => unit.target === 'ja-JP') ? 'ja-JP' : selection.units.every(unit => unit.target === 'zh-CN-reference') ? 'zh-CN' : 'all',
    group: selection.inputs.selectedGroup,
    toolingSha: executionToolingSha,
    targetBranch: selection.targetBranch,
    targetBaselineSha,
    units: selection.units.map((unit, publicationOrder) => ({
      target: unit.target,
      group: unit.group,
      sourceGroup: unit.sourceGroup,
      sourceBaselineSha: unit.sourceBaselineSha,
      sourceCheckpointSha: unit.sourceCheckpointSha,
      targetBaselineSha,
      publicationOrder,
    })),
  }
  return validateTranslationHandoff(handoff)
}

function exactObjectKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) throw new Error(`${label} keys are invalid`)
}

function zeroWorkReportMarkdown(locale) {
  return `### Translation report\n\n- Locale: \`${locale}\`\n- Pending: 0\n- Current English changes: 0\n- Missing Japanese targets: 0\n- Stale translations: 0\n- Translated: 0\n- Failed: 0\n- Remaining: 0\n\nNo documents require translation or translation-state reconciliation.\n`
}

function reportPending(directory, expectedTarget) {
  validateRegularTree(directory)
  const markdownFile = path.join(directory, 'translation-report.md')
  if (!fs.existsSync(markdownFile)) throw new Error('Translation report Markdown is missing')
  const markdown = fs.readFileSync(markdownFile, 'utf8')
  const expectedLocale = expectedTarget === 'ja-JP' ? 'ja-JP' : 'zh-CN'
  const jsonFile = path.join(directory, 'translation-report.json')
  if (!fs.existsSync(jsonFile)) {
    if (markdown !== zeroWorkReportMarkdown(expectedLocale)) {
      throw new Error('Markdown-only Translation report must exactly prove unambiguous zero work')
    }
    return Object.freeze({candidateCount: 0, report: null})
  }
  const match = markdown.match(/^- Pending: ([0-9]+)$/mu)
  if (!match || !Number.isSafeInteger(Number(match[1]))) throw new Error('Translation report pending count is invalid')
  const report = readJsonFile(jsonFile, 'Translation report')
  exactObjectKeys(report, ['checkpoint', 'locale', 'results', 'target'], 'Translation report')
  exactObjectKeys(report.checkpoint, ['failed', 'generatedAt', 'processed', 'remaining', 'target', 'translated'], 'Translation report checkpoint')
  if (report.target !== expectedTarget || report.locale !== expectedLocale || report.checkpoint.target !== expectedTarget || !Array.isArray(report.results)) {
    throw new Error('Translation report identity mismatch')
  }
  for (const key of ['processed', 'remaining', 'translated', 'failed']) {
    if (!Number.isSafeInteger(report.checkpoint[key]) || report.checkpoint[key] < 0) throw new Error(`Translation report checkpoint ${key} is invalid`)
  }
  if (!Number.isFinite(Date.parse(report.checkpoint.generatedAt))) throw new Error('Translation report checkpoint generatedAt is invalid')
  if (report.checkpoint.processed !== report.results.length || report.checkpoint.translated + report.checkpoint.failed !== report.checkpoint.processed) {
    throw new Error('Translation report checkpoint counts do not match results')
  }
  const resultIdentities = new Set()
  for (const result of report.results) {
    if (!result || typeof result !== 'object' || Array.isArray(result) || result.target !== expectedTarget || result.locale !== expectedLocale ||
        !CHECKSUM.test(result.sourceHash || '') || !['translated', 'failed'].includes(result.status)) {
      throw new Error('Translation report result identity is invalid')
    }
    const sourcePath = safeRelativePath(result.sourcePath, 'Translation report source path')
    const targetPath = safeRelativePath(result.targetPath, 'Translation report target path')
    const identity = `${sourcePath}\0${targetPath}`
    if (resultIdentities.has(identity)) throw new Error('Translation report result identity is duplicated')
    resultIdentities.add(identity)
  }
  if (report.results.filter(result => result.status === 'translated').length !== report.checkpoint.translated ||
      report.results.filter(result => result.status === 'failed').length !== report.checkpoint.failed) {
    throw new Error('Translation report result statuses do not match checkpoint counts')
  }
  const candidateCount = report.checkpoint.processed + report.checkpoint.remaining
  if (candidateCount !== Number(match[1])) throw new Error('Translation report candidate count does not match the strict JSON checkpoint')
  return Object.freeze({candidateCount, report})
}

function exactJob(jobs, name, attemptNumber, {required = true, label = name} = {}) {
  const matches = jobs.filter(job => job?.name === name && Number(job.run_attempt) === attemptNumber)
  if (!matches.length && !required) return null
  if (matches.length !== 1) throw new Error(`${label} job identity must exist exactly once`)
  const job = matches[0]
  if (!Number.isSafeInteger(Number(job.id)) || Number(job.id) < 1 || job.status !== 'completed') throw new Error(`${label} job identity is invalid`)
  return job
}

function assertArtifactInJobWindow(artifact, job, label) {
  const created = Date.parse(artifact.created_at)
  const started = Date.parse(job.started_at)
  const completed = Date.parse(job.completed_at)
  if (!Number.isFinite(created) || !Number.isFinite(started) || !Number.isFinite(completed) || completed < started || created < started || created > completed) {
    throw new Error(`${label} artifact is outside its producer job time window`)
  }
}

function jobNameForRun(run, name) {
  return workflowPath(run) === '.github/workflows/recover-translation.yml' ? `run_translation / ${name}` : name
}

async function authenticatePublicationEvidence({client, selectedAttempt, selection, jobs, run, runId, attemptNumber, root}) {
  const publisherName = jobNameForRun(run, 'publish_ready')
  const publisherMatches = jobs.filter(job => job?.name === publisherName && Number(job.run_attempt) === attemptNumber)
  if (publisherMatches.length > 1) throw new Error('publish_ready job identity must exist at most once')
  const publisher = publisherMatches[0] || null
  if (publisher) exactJob(jobs, publisherName, attemptNumber, {label: 'publish_ready'})
  const progressPattern = new RegExp(`^publication-progress-translation-${runId}-${attemptNumber}-([1-9][0-9]*)$`, 'u')
  const progressArtifacts = selectedAttempt.artifacts
    .map(artifact => ({artifact, match: progressPattern.exec(artifact.name || '')}))
    .filter(value => value.match)
    .map(value => ({artifact: value.artifact, revision: Number(value.match[1])}))
    .sort((left, right) => left.revision - right.revision)
  if (new Set(progressArtifacts.map(value => value.revision)).size !== progressArtifacts.length) throw new Error('Publication progress artifact identity is ambiguous')
  const resultsName = `publication-results-translation-${runId}-${attemptNumber}`
  const resultsArtifact = exactArtifact(selectedAttempt.artifacts, resultsName, {required: false, label: 'Publication results'})
  if ((progressArtifacts.length || resultsArtifact) && !publisher) throw new Error('Publication progress or results identity has no publish_ready producer job')
  const progress = []
  for (const value of progressArtifacts) {
    const artifact = exactArtifact(selectedAttempt.artifacts, value.artifact.name, {label: 'Publication progress'})
    assertArtifactInJobWindow(artifact, publisher, 'Publication progress')
    const destination = path.join(root, 'downloads', 'publication', `progress-${value.revision}`)
    await downloadArtifact(client, artifact, destination, run, runId)
    const file = path.join(destination, `publication-progress-${value.revision}.json`)
    if (!fs.existsSync(file)) throw new Error('Publication progress artifact payload identity is invalid')
    const document = readPublicationDocument(file, 'publication-progress', {selection, artifactRevision: value.revision})
    const expectedMode = selection.inputs.publish ? 'publish' : 'artifact_only'
    if (document.mode !== expectedMode) throw new Error('Publication progress mode identity mismatch')
    progress.push({artifactId: Number(artifact.id), artifactName: artifact.name, artifactDigest: artifact.digest, revision: value.revision})
  }
  let results = null
  if (resultsArtifact) {
    assertArtifactInJobWindow(resultsArtifact, publisher, 'Publication results')
    const destination = path.join(root, 'downloads', 'publication', 'results')
    await downloadArtifact(client, resultsArtifact, destination, run, runId)
    const file = path.join(destination, 'publication-results.json')
    if (!fs.existsSync(file)) throw new Error('Publication results artifact payload identity is invalid')
    const document = readPublicationDocument(file, 'publication-results', {selection})
    const expectedMode = selection.inputs.publish ? 'publish' : 'artifact_only'
    if (document.mode !== expectedMode) throw new Error('Publication results mode identity mismatch')
    results = {artifactId: Number(resultsArtifact.id), artifactName: resultsArtifact.name, artifactDigest: resultsArtifact.digest, overallStatus: document.overallStatus, finalTargetSha: document.finalTargetSha}
  }
  if (publisher?.conclusion === 'success' && !results) throw new Error('Terminal publication results are required after successful publish_ready')
  const publisherJob = publisher ? {
    jobId: Number(publisher.id),
    status: publisher.status,
    conclusion: publisher.conclusion,
    startedAt: publisher.started_at,
    completedAt: publisher.completed_at,
  } : null
  return Object.freeze({
    publisherJob,
    progress,
    results,
    resultsAbsenceReason: results ? null : publisher ? `publish_ready-${publisher.conclusion || 'unknown'}` : 'publish_ready-absent',
  })
}

function assertRecoveryIdentity(parsed, selected) {
  const expectedLocale = selected.target === 'ja-JP' ? 'ja-JP' : 'zh-CN'
  const metadata = parsed.metadata
  if (metadata.locale !== expectedLocale || metadata.group !== selected.group || metadata.sourceSha !== selected.sourceCheckpointSha ||
      metadata.toolingSha !== selected.toolingSha || !CHECKSUM.test(metadata.promptContractSha256 || '') || typeof metadata.model !== 'string' || !metadata.model) {
    throw new Error(`Recovery artifact identity mismatch for ${selected.unitKey}`)
  }
  for (const file of parsed.files) {
    if (file.locale !== expectedLocale || file.group !== selected.group || file.promptContractSha256 !== metadata.promptContractSha256 || file.model !== metadata.model) {
      throw new Error(`Recovery artifact identity mismatch for ${selected.unitKey}`)
    }
  }
  return parsed
}

function canonicalPlan(value) {
  return `${JSON.stringify(value)}\n`
}

async function planTranslationRecovery({repository, previousRunId, previousRunAttempt = '', outputRoot, targetBaselineSha, targetResolver, executionToolingSha = '', publish = false, client}) {
  if (typeof repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(repository)) throw new Error('repository is invalid')
  if (typeof publish !== 'boolean') throw new Error('publish must be a boolean')
  const runId = positiveInteger(previousRunId, 'previous_translation_run_id')
  if (!client || typeof client !== 'object') throw new Error('GitHub client is required')
  const run = await client.getRun(runId)
  if (!run) {
    const job = await client.getJob?.(runId)
    if (job) throw new Error('previous_translation_run_id is a job ID; enter a workflow run ID')
    throw new Error('Previous Translation workflow run was not found')
  }
  assertRunIdentity(run, repository, runId)
  const allArtifacts = await client.listArtifacts(runId)
  if (!Array.isArray(allArtifacts)) throw new Error('Previous Translation artifact inventory is invalid')
  const selectedAttempt = await selectAttempt({client, run, runId, explicitAttempt: previousRunAttempt, artifacts: allArtifacts})
  const attemptNumber = Number(selectedAttempt.attempt.run_attempt)
  const root = path.resolve(outputRoot)
  if (fs.existsSync(root) && fs.readdirSync(root).length) throw new Error('Recovery output root must be empty')
  fs.mkdirSync(root, {recursive: true})
  const selectionDirectory = path.join(root, 'downloads', 'selection')
  await downloadArtifact(client, selectedAttempt.selectionArtifact, selectionDirectory, run, runId)
  const selectionFile = path.join(selectionDirectory, 'publication-selection.json')
  const selection = readPublicationDocument(selectionFile, 'publication-selection')
  if (selection.workflow !== 'translation' || selection.repository !== repository || selection.runId !== runId || selection.runAttempt !== attemptNumber) {
    throw new Error('Previous Translation publication selection artifact identity mismatch')
  }
  if (!SHA.test(run.head_sha || '')) throw new Error('Previous Translation workflow SHA is invalid')
  const currentExecutionToolingSha = executionToolingSha || selection.toolingSha
  if (!SHA.test(currentExecutionToolingSha || '')) throw new Error('Recovery execution tooling SHA is invalid')
  const jobs = await client.listJobs?.(runId, attemptNumber)
  if (!Array.isArray(jobs)) throw new Error('Previous Translation job inventory is invalid')
  const queueOwnedTargetBaselineSha = targetBaselineSha || await targetResolver?.(selection.targetBranch)
  const handoff = buildRecoveryHandoff(selection, queueOwnedTargetBaselineSha, currentExecutionToolingSha)
  const bundleRoot = path.join(root, 'recovery-bundle')
  const artifactRoot = path.join(bundleRoot, 'artifacts')
  fs.mkdirSync(artifactRoot, {recursive: true})
  const recoveryMap = {}
  const provenanceArtifacts = []
  let retainedFileCount = 0
  let sourceCandidateCount = 0
  const rejected = []

  for (const selected of selection.units) {
    const unitIdentity = `${selected.target}/${selected.group}`
    const unitToken = unitIdentity.replaceAll('/', '-')
    const batches = []
    if (selected.strategy === 'ja-guides') {
      const expression = new RegExp(`^translation-report-${selected.target}-${selected.group}-${runId}-batch-([1-9][0-9]*)$`, 'u')
      for (const artifact of selectedAttempt.artifacts) {
        const match = expression.exec(artifact.name || '')
        if (match) batches.push({batchNumber: Number(match[1]), reportArtifact: artifact})
      }
      batches.sort((left, right) => left.batchNumber - right.batchNumber)
      if (!batches.length || batches.some((batch, index) => batch.batchNumber !== index + 1)) throw new Error('Japanese Guides recovery report artifact identity is incomplete or ambiguous')
      if (new Set(batches.map(batch => batch.batchNumber)).size !== batches.length) throw new Error('Japanese Guides recovery report artifact identity is duplicated')
    } else {
      batches.push({batchNumber: 0, reportArtifact: exactArtifact(selectedAttempt.artifacts, `translation-report-${selected.target}-${selected.group}-${runId}`, {label: `${unitIdentity} Translation report`})})
    }
    const plannedArtifacts = []
    for (const batch of batches) {
      const producerJobName = jobNameForRun(run, selected.strategy === 'ja-guides'
        ? `translate_guides_batches (${batch.batchNumber - 1}, ${batch.batchNumber}) / translate`
        : `${selected.producerJob} / translate`)
      const producerJob = exactJob(jobs, producerJobName, attemptNumber, {label: `Producer job for ${unitIdentity}`})
      assertArtifactInJobWindow(batch.reportArtifact, producerJob, `${unitIdentity} Translation report`)
      const reportDirectory = path.join(root, 'downloads', unitToken, `report-${batch.batchNumber}`)
      await downloadArtifact(client, batch.reportArtifact, reportDirectory, run, runId)
      const {candidateCount} = reportPending(reportDirectory, selected.target)
      sourceCandidateCount += candidateCount
      const recoveryName = `translation-recovery-${selected.target}-${selected.group}-${runId}-${batch.batchNumber}`
      const recoveryArtifact = exactArtifact(selectedAttempt.artifacts, recoveryName, {required: false, label: `${unitIdentity} recovery artifact`})
      if (candidateCount > 0 && !recoveryArtifact) throw new Error(`Missing recovery artifact for ${unitIdentity}; stopping before model invocation`)
      if (!recoveryArtifact) continue
      assertArtifactInJobWindow(recoveryArtifact, producerJob, `${unitIdentity} recovery artifact`)
      const downloadDirectory = path.join(root, 'downloads', unitToken, `recovery-${batch.batchNumber}`)
      await downloadArtifact(client, recoveryArtifact, downloadDirectory, run, runId)
      const parsed = assertRecoveryIdentity(validateDownloadedArtifactTree(downloadDirectory), selected)
      const bundleDirectory = path.join(artifactRoot, unitToken, `batch-${batch.batchNumber}`)
      fs.mkdirSync(path.dirname(bundleDirectory), {recursive: true})
      fs.cpSync(downloadDirectory, bundleDirectory, {recursive: true})
      const retained = parsed.files.length
      retainedFileCount += retained
      if (retained > candidateCount) rejected.push({unit: unitIdentity, batchNumber: batch.batchNumber, reason: 'recovery artifact translated count exceeds authenticated source candidate count'})
      const identity = {artifactId: Number(recoveryArtifact.id), artifactName: recoveryArtifact.name, artifactDigest: recoveryArtifact.digest, batchNumber: batch.batchNumber, retainedFileCount: retained, sourceCandidateCount: candidateCount}
      plannedArtifacts.push(identity)
      provenanceArtifacts.push({unit: unitIdentity, ...identity})
    }
    recoveryMap[unitIdentity] = {unitToken, artifacts: plannedArtifacts}
  }

  const publicationEvidence = await authenticatePublicationEvidence({client, selectedAttempt, selection, jobs, run, runId, attemptNumber, root})

  const provenance = {
    schemaVersion: 2,
    kind: 'operator-recovery',
    sourceRepository: repository,
    sourceWorkflow: workflowPath(run),
    sourceRunId: runId,
    sourceRunAttempt: attemptNumber,
    sourceWorkflowSha: run.head_sha,
    sourceToolingSha: selection.toolingSha,
    executionToolingSha: currentExecutionToolingSha,
    sourceSelectionSha256: selection.selectionSha256,
    publicationEvidence,
    artifacts: provenanceArtifacts,
  }
  const plan = {
    schemaVersion: 2,
    repository,
    previousRunId: runId,
    previousRunAttempt: attemptNumber,
    selectionSha256: selection.selectionSha256,
    targetBranch: handoff.targetBranch,
    targetBaselineSha: handoff.targetBaselineSha,
    handoff,
    recoveryMap,
    retainedFileCount,
    sourceCandidateCount,
    compatibilityStatus: 'pending-current-contract-preflight',
    rejectedRecoveryCount: rejected.length,
    rejected,
    publish,
    provenance,
  }
  const planBytes = canonicalPlan(plan)
  fs.writeFileSync(path.join(bundleRoot, 'recovery-plan.json'), planBytes)
  fs.writeFileSync(path.join(root, 'translation-handoff.json'), `${JSON.stringify(handoff)}\n`)
  return Object.freeze({plan, handoff, recoveryPlanSha256: sha256(planBytes), bundleRoot})
}

function ghJson(args, {allowFailure = false} = {}) {
  const result = spawnSync('gh', args, {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})
  if (result.status !== 0) {
    if (allowFailure) return null
    throw new Error(result.stderr.trim() || result.stdout.trim() || 'gh API request failed')
  }
  return JSON.parse(result.stdout)
}

function extractArtifactZip(bytes, destination, expectedDigest) {
  if (sha256(bytes) !== expectedDigest.replace(/^sha256:/u, '')) throw new Error('Downloaded artifact digest mismatch')
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-zip-'))
  const archive = path.join(temp, 'artifact.zip')
  try {
    fs.writeFileSync(archive, bytes)
    const listing = execFileSync('unzip', ['-Z1', archive], {encoding: 'utf8'}).split('\n').filter(Boolean)
    const seen = new Set()
    for (const entry of listing) {
      const normalized = entry.endsWith('/') ? entry.slice(0, -1) : entry
      safeRelativePath(normalized, 'Downloaded zip entry')
      if (seen.has(normalized)) throw new Error(`Downloaded zip contains a duplicate entry: ${normalized}`)
      seen.add(normalized)
    }
    fs.mkdirSync(destination, {recursive: true})
    execFileSync('unzip', ['-qq', archive, '-d', destination])
    validateRegularTree(destination)
  } finally {
    fs.rmSync(temp, {recursive: true, force: true})
  }
}

function createGitHubClient(repository) {
  return {
    async getRun(runId) { return ghJson(['api', `repos/${repository}/actions/runs/${runId}`], {allowFailure: true}) },
    async getJob(jobId) { return ghJson(['api', `repos/${repository}/actions/jobs/${jobId}`], {allowFailure: true}) },
    async getAttempt(runId, attempt) { return ghJson(['api', `repos/${repository}/actions/runs/${runId}/attempts/${attempt}`], {allowFailure: true}) },
    async listArtifacts(runId) {
      const pages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${runId}/artifacts?per_page=100`])
      return pages.flatMap(page => page.artifacts || [])
    },
    async listJobs(runId, attempt) {
      const pages = ghJson(['api', '--paginate', '--slurp', `repos/${repository}/actions/runs/${runId}/attempts/${attempt}/jobs?filter=all&per_page=100`])
      return pages.flatMap(page => page.jobs || [])
    },
    async downloadArtifact(artifact, destination) {
      const bytes = execFileSync('gh', ['api', `repos/${repository}/actions/artifacts/${artifact.id}/zip`], {maxBuffer: 256 * 1024 * 1024})
      extractArtifactZip(bytes, destination, artifact.digest)
    },
  }
}

function resolveQueueOwnedTarget(repositoryRoot, targetBranch) {
  const check = spawnSync('git', ['check-ref-format', '--branch', targetBranch], {cwd: repositoryRoot, encoding: 'utf8'})
  if (check.status !== 0) throw new Error('Previous Translation target branch is invalid')
  const remoteRef = `+refs/heads/${targetBranch}:refs/remotes/origin/${targetBranch}`
  const fetched = spawnSync('git', ['fetch', '--no-tags', 'origin', remoteRef], {cwd: repositoryRoot, encoding: 'utf8'})
  if (fetched.status !== 0) throw new Error(fetched.stderr.trim() || 'Unable to observe the queue-owned target branch')
  const resolved = spawnSync('git', ['rev-parse', `refs/remotes/origin/${targetBranch}^{commit}`], {cwd: repositoryRoot, encoding: 'utf8'})
  const sha = resolved.stdout.trim()
  if (resolved.status !== 0 || !SHA.test(sha)) throw new Error('Queue-owned target branch did not resolve to an exact commit')
  return sha
}

function parseArgs(argv) {
  const allowed = new Set(['--repository', '--previous-run-id', '--previous-run-attempt', '--target-baseline-sha', '--execution-tooling-sha', '--output-root', '--publish'])
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || Object.hasOwn(values, flag)) throw new Error('Translation recovery planner arguments are invalid or duplicated')
    values[flag] = value
  }
  for (const required of ['--repository', '--previous-run-id', '--execution-tooling-sha', '--output-root', '--publish']) if (!values[required]) throw new Error(`${required} is required`)
  if (!['true', 'false'].includes(values['--publish'])) throw new Error('--publish must be true or false')
  return values
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const args = parseArgs(argv)
  const result = await planTranslationRecovery({
    repository: args['--repository'],
    previousRunId: args['--previous-run-id'],
    previousRunAttempt: args['--previous-run-attempt'] || '',
    targetBaselineSha: args['--target-baseline-sha'] || '',
    executionToolingSha: args['--execution-tooling-sha'],
    targetResolver: targetBranch => resolveQueueOwnedTarget(process.cwd(), targetBranch),
    outputRoot: args['--output-root'],
    publish: args['--publish'] === 'true',
    client: createGitHubClient(args['--repository']),
  })
  const outputs = {
    handoff_json: JSON.stringify(result.handoff),
    recovery_map_json: JSON.stringify(result.plan.recoveryMap),
    recovery_provenance_json: JSON.stringify(result.plan.provenance),
    recovery_plan_sha256: result.recoveryPlanSha256,
    previous_run_attempt: String(result.plan.previousRunAttempt),
    retained_file_count: String(result.plan.retainedFileCount),
    source_candidate_count: String(result.plan.sourceCandidateCount),
    compatibility_status: result.plan.compatibilityStatus,
    rejected_recovery_count: String(result.plan.rejectedRecoveryCount),
  }
  if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, Object.entries(outputs).map(([key, value]) => `${key}=${value}\n`).join(''))
  process.stdout.write(`${JSON.stringify(outputs)}\n`)
  return result
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = {
  buildRecoveryHandoff,
  createGitHubClient,
  extractArtifactZip,
  planTranslationRecovery,
  resolveQueueOwnedTarget,
  validateDownloadedArtifactTree,
}
