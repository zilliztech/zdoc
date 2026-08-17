'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { getContentGroup } = require('../docs-workflow/content-groups')
const { getGroupPaths } = require('../docs-workflow/group-paths')
const { loadTypeScript } = require('../lib/load-typescript')
const { selectManifestBatch } = require('./batches')
const {
  evaluateReconciliationPolicy,
  loadReconciliationPolicy,
} = require('./reconciliation-policy')
const {validateReconciliationPlan} = require('./reconciliation-plan')

const {buildTranslationCandidates} = loadTypeScript('../../packages/docs-tooling/src/translation/candidates.ts')
const { resolveManualPublication } = loadTypeScript('../../packages/docs-tooling/src/manuals/registry.ts')
const { resolvePublicationGroupWorkflow } = loadTypeScript('../../packages/docs-tooling/src/workflows/groups.ts')

const SHA = /^[0-9a-f]{40}$/

class ReconciliationReviewRequiredError extends Error {
  constructor(evaluation) {
    super(`Translation reconciliation review required for ${evaluation.summary.reviewRequired} operation(s)`)
    this.name = 'ReconciliationReviewRequiredError'
    this.evaluation = evaluation
    this.reviewArtifact = evaluation.reviewArtifact
  }
}

function cachePathForLocale(siteDir, locale) {
  return path.join(siteDir, '.translation-cache', `${locale}.json`)
}

function readCache(siteDir, locale) {
  const cachePath = cachePathForLocale(siteDir, locale)
  if (!fs.existsSync(cachePath)) return { files: {} }
  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    return parsed && typeof parsed === 'object' && parsed.files ? parsed : { files: {} }
  } catch {
    return { files: {} }
  }
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const temporaryPath = `${filePath}.tmp`
  fs.writeFileSync(temporaryPath, JSON.stringify(value, null, 2) + '\n', 'utf8')
  fs.renameSync(temporaryPath, filePath)
}

function writeCache(siteDir, locale, cache) {
  writeJsonAtomic(cachePathForLocale(siteDir, locale), cache)
}

function sourceMappingsForTarget(target) {
  if (target === 'ja-JP') return [
    {
      type: 'guides',
      sourceRoot: 'content/en/guides/tutorials',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
    },
    {
      type: 'byoc',
      sourceRoot: 'content/en/byoc/tutorials',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
    },
    {
      type: 'reference',
      sourceRoot: 'content/en/reference',
      targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current',
    },
  ]
  if (target === 'zh-CN-reference') return [{
    type: 'reference',
    sourceRoot: 'content/en/reference',
    targetRoot: 'content/zh-CN/reference',
  }]
  throw new Error(`Unknown translation target: ${target}`)
}

function localeForTarget(target) {
  if (target === 'ja-JP') return 'ja-JP'
  if (target === 'zh-CN-reference') return 'zh-CN'
  throw new Error(`Unknown translation target: ${target}`)
}

function typeForSource(target, sourcePath) {
  const mapping = sourceMappingsForTarget(target).find(candidate => sourcePath.startsWith(`${candidate.sourceRoot}/`))
  if (!mapping) throw new Error(`Translation candidate is outside target mappings: ${sourcePath}`)
  return mapping.type
}

function retirementRegistryPath(target) {
  return target === 'zh-CN-reference' ? 'config/reference-retirements.json' : null
}

function readRetirementRegistry(siteDir, target) {
  const relativePath = retirementRegistryPath(target)
  if (!relativePath) return undefined
  const absolutePath = path.join(siteDir, relativePath)
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) : undefined
}

function readJsonIfPresent(siteDir, relativePath) {
  const absolutePath = path.join(siteDir, relativePath)
  return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) : null
}

function readJsonAtCommit(siteDir, commitSha, relativePath) {
  if (!SHA.test(commitSha || '')) return null
  const result = spawnSync('git', ['-C', siteDir, 'show', `${commitSha}:${relativePath}`], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.status !== 0) return null
  try {
    return JSON.parse(result.stdout)
  } catch {
    return null
  }
}

function isWithinPath(filePath, root) {
  return filePath === root || filePath.startsWith(`${root}/`)
}

function retiredSourceRoots(group) {
  if (group === 'reference-landings') return []
  return resolvePublicationGroupWorkflow('en', group).group.manuals.flatMap(manual => {
    const publication = resolveManualPublication(manual, 'en').publication
    return (publication.retiredPaths || []).map(retiredPath => `content/en/${retiredPath}`)
  }).sort()
}

function collectProbableRenames({siteDir, sourceCommit, sourceCheckpointSha, ownedSourcePaths}) {
  if (!SHA.test(sourceCommit || '') || !SHA.test(sourceCheckpointSha || '') || sourceCommit === sourceCheckpointSha) return new Map()
  const result = spawnSync('git', [
    '-C', siteDir,
    'diff', '--find-renames=20%', '--name-status', '-z',
    sourceCommit, sourceCheckpointSha,
    '--', ...ownedSourcePaths,
  ], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024})
  if (result.status !== 0) return new Map()
  const fields = result.stdout.split('\0')
  if (fields.at(-1) === '') fields.pop()
  const renames = new Map()
  for (let index = 0; index < fields.length;) {
    const status = fields[index++]
    if (/^R\d{1,3}$/.test(status)) {
      const oldPath = fields[index++]
      const newPath = fields[index++]
      if (oldPath && newPath) renames.set(oldPath, newPath)
      continue
    }
    index += 1
  }
  return renames
}

function sourceSnapshotIndex(snapshots) {
  const byToken = new Map()
  const byRecordId = new Map()
  const targetsBuilt = new Set()
  for (const snapshot of snapshots.filter(Boolean)) {
    for (const target of snapshot.targets_built || []) targetsBuilt.add(String(target).trim().toLowerCase())
    for (const record of snapshot.records || []) {
      const entry = {record, snapshot}
      if (record.doc_token) byToken.set(record.doc_token, entry)
      if (record.record_id) byRecordId.set(record.record_id, entry)
    }
  }
  return {byToken, byRecordId, targetsBuilt: [...targetsBuilt].sort()}
}

function targetExclusionEvidence(entry, targetsBuilt) {
  if (!entry || !Array.isArray(entry.record.publish_targets) || !Array.isArray(entry.record.output_paths)) return null
  if (entry.record.output_paths.length > 0) return null
  const publishTargets = entry.record.publish_targets.map(target => String(target).trim().toLowerCase()).filter(Boolean)
  const targetMatches = publishTargets.some(target => targetsBuilt.includes(target))
  if (targetMatches) return null
  return {
    publishTargets,
    publishStatus: entry.record.publish_status || null,
  }
}

function candidateOwnership({group, target}) {
  const paths = getGroupPaths(group)
  const definition = getContentGroup(group)
  const forceTranslationPaths = definition.forceTranslationPaths || []
  if (forceTranslationPaths.length > 0 && target !== 'zh-CN-reference') {
    throw new Error('Forced Reference landing translation requires target zh-CN-reference')
  }
  return {
    group,
    ownedSourcePaths: paths.englishOutputs.filter(sourcePath => sourcePath.startsWith('content/en/')),
    preservedSourcePaths: [...new Set([...paths.preservedEnglish, ...forceTranslationPaths])],
    forceTranslationPaths,
  }
}

function createManifest({ target, locale, group, sourceCheckpointSha, reconciliation, items }) {
  const manifest = { target, locale, group, sourceCheckpointSha, generatedAt: new Date().toISOString(), items }
  if (reconciliation) {
    manifest.reconciliation = {
      planArtifact: reconciliation.planArtifact,
      planSha256: reconciliation.plan.planSha256,
      operationCount: reconciliation.plan.operations.length,
    }
  }
  return manifest
}

function evaluateManifestReconciliation({siteDir, target, group, toolingSha, discovery, approvalReceipts = [], now}) {
  if (!discovery || typeof discovery !== 'object' || Array.isArray(discovery)) throw new Error('Manifest reconciliation discovery is required')
  const evaluation = evaluateReconciliationPolicy({
    policy: loadReconciliationPolicy(siteDir),
    repositoryRoot: siteDir,
    target,
    group,
    toolingSha,
    sourceBaselineSha: discovery.sourceBaselineSha,
    sourceCheckpointSha: discovery.sourceCheckpointSha,
    targetBaselineSha: discovery.targetBaselineSha,
    candidates: discovery.candidates,
    activeSourceCount: discovery.sourceCheckpointInventory.length,
    retirementRegistry: readRetirementRegistry(siteDir, target),
    approvalReceipts,
    now,
  })
  if (evaluation.status === 'review_required') throw new ReconciliationReviewRequiredError(evaluation)
  if (evaluation.status === 'rejected') throw new Error('Translation reconciliation policy rejected one or more operations')
  return evaluation
}

function buildManifest({ siteDir, target = 'ja-JP', locale = localeForTarget(target), maxFiles = 0, group, sourceCheckpointSha, sourceChanges = null, mode = 'incremental', reconciliation = null }) {
  if (!['full', 'incremental'].includes(mode)) throw new Error(`Unsupported effective translation mode: ${mode}`)
  if (typeof group !== 'string' || group === '') throw new Error('A canonical translation group is required')
  if (!SHA.test(sourceCheckpointSha || '')) throw new Error('A valid 40-character source checkpoint SHA is required with --group')
  let reconciliationEvaluation = null
  if (reconciliation) {
    if (typeof reconciliation.planArtifact !== 'string' || !reconciliation.planArtifact || /[\0\r\n/\\]/.test(reconciliation.planArtifact)) throw new Error('A valid reconciliation plan artifact name is required')
    if (reconciliation.plan) {
      const plan = validateReconciliationPlan(reconciliation.plan, {repositoryRoot: siteDir})
      if (plan.target !== target || plan.group !== group || plan.sourceCheckpointSha !== sourceCheckpointSha) throw new Error('Reconciliation plan manifest identity mismatch')
      reconciliationEvaluation = {plan}
    } else reconciliationEvaluation = evaluateManifestReconciliation({siteDir, target, group, ...reconciliation})
  }
  const ownership = candidateOwnership({group, target})
  const result = buildTranslationCandidates({
    repositoryRoot: siteDir,
    targetId: target,
    group: ownership.group,
    ownedSourcePaths: ownership.ownedSourcePaths,
    preservedSourcePaths: ownership.preservedSourcePaths,
    forceTranslationPaths: ownership.forceTranslationPaths,
    changedSourcePaths: sourceChanges?.changedEnglish || [],
    mode,
    retirementRegistry: readRetirementRegistry(siteDir, target),
  })
  const items = result.candidates.map(candidate => ({
    ...candidate,
    locale,
    type: typeForSource(target, candidate.sourcePath),
  }))
  const selectedItems = maxFiles > 0 ? items.slice(0, maxFiles) : items
  return createManifest({
    target,
    locale,
    group,
    sourceCheckpointSha,
    reconciliation: reconciliationEvaluation ? {...reconciliationEvaluation, planArtifact: reconciliation.planArtifact} : null,
    items: selectedItems,
  })
}

function main() {
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1])
  const siteDir = process.cwd()
  const target = args.get('--target') || process.env.TRANSLATION_TARGET || 'ja-JP'
  const locale = args.get('--locale') || process.env.TRANSLATION_LOCALE || localeForTarget(target)
  const output = args.get('--output') || 'tmp/translation-manifest.json'
  const maxFiles = Number(args.get('--max-files') || process.env.TRANSLATION_MAX_FILES || 0)
  const group = args.get('--group')
  const sourceCheckpointSha = args.get('--source-checkpoint-sha')
  const sourceChangesPath = args.get('--source-changes') || null
  const reconciliationPlanPath = args.get('--reconciliation-plan') || null
  const reconciliationPlanArtifact = args.get('--reconciliation-plan-artifact') || null
  const mode = args.get('--mode') || process.env.TRANSLATION_MODE || 'incremental'
  const sourceChanges = sourceChangesPath ? JSON.parse(fs.readFileSync(path.join(siteDir, sourceChangesPath), 'utf8')) : null
  const batchFlags = ['--batch-index', '--batch-size', '--expected-pending-set-sha256']
  const presentBatchFlags = batchFlags.filter(flag => args.has(flag))
  if (presentBatchFlags.length !== 0 && presentBatchFlags.length !== batchFlags.length) throw new Error('Batch manifest flags must be provided together')
  let manifest
  try {
    const reconciliation = reconciliationPlanPath ? {
      plan: JSON.parse(fs.readFileSync(path.join(siteDir, reconciliationPlanPath), 'utf8')),
      planArtifact: reconciliationPlanArtifact,
    } : null
    manifest = buildManifest({siteDir, target, locale, maxFiles: presentBatchFlags.length ? 0 : maxFiles, group, sourceCheckpointSha, sourceChanges, mode, reconciliation})
  } catch (error) {
    throw error
  }
  if (presentBatchFlags.length) {
    manifest = selectManifestBatch(manifest, {
      batchIndex: Number(args.get('--batch-index')),
      batchSize: Number(args.get('--batch-size')),
      expectedPendingSetSha256: args.get('--expected-pending-set-sha256'),
    })
  }
  fs.mkdirSync(path.dirname(path.join(siteDir, output)), { recursive: true })
  fs.writeFileSync(path.join(siteDir, output), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(`[translation-manifest] ${manifest.items.length} file(s) pending -> ${output}`)
}

if (require.main === module) main()

module.exports = {
  ReconciliationReviewRequiredError,
  buildManifest,
  cachePathForLocale,
  localeForTarget,
  evaluateManifestReconciliation,
  readCache,
  writeCache,
  writeJsonAtomic,
}
