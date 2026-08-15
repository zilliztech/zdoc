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

const {
  buildTranslationCandidates,
  TranslationRetirementRequiredError,
} = loadTypeScript('../../packages/docs-tooling/src/translation/candidates.ts')
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

function buildRetirementReview({siteDir, target, locale, group, sourceCheckpointSha, sourceDelta, candidates}) {
  const ownership = candidateOwnership({group, target})
  const state = readJsonIfPresent(siteDir, 'generated/zh-CN/manifests/reference-translations.json')
  const stateBySource = new Map((state?.records || []).map(record => [record.sourcePath, record]))
  const inventoryPath = `generated/en/manifests/lark-revisions/${group}.json`
  const currentInventory = readJsonIfPresent(siteDir, inventoryPath)
  const currentInventoryByTitle = new Map()
  for (const record of currentInventory?.records || []) {
    const matches = currentInventoryByTitle.get(record.title) || []
    matches.push(record)
    currentInventoryByTitle.set(record.title, matches)
  }
  const historicalInventories = new Map()
  const workflow = resolvePublicationGroupWorkflow('en', group)
  const snapshotPaths = workflow.sourceSnapshots || []
  const currentSourceIndex = sourceSnapshotIndex(snapshotPaths.map(snapshotPath => readJsonIfPresent(siteDir, snapshotPath)))
  const historicalSourceIndexes = new Map()
  const renameMaps = new Map()
  const declaredRoots = retiredSourceRoots(group)
  const currentRunKeys = new Set((sourceDelta?.retirementCandidates || []).map(candidate => (
    `${candidate.sourcePath}\0${candidate.targetPath}\0${candidate.changeKind}`
  )))

  const reviewedCandidates = [...candidates].sort((left, right) => (
    left.sourcePath.localeCompare(right.sourcePath) || left.targetPath.localeCompare(right.targetPath)
  )).map(candidate => {
    const stateRecord = stateBySource.get(candidate.sourcePath) || null
    const sourceCommit = stateRecord?.sourceCommit || null
    if (sourceCommit && !historicalInventories.has(sourceCommit)) {
      historicalInventories.set(sourceCommit, readJsonAtCommit(siteDir, sourceCommit, inventoryPath))
      historicalSourceIndexes.set(sourceCommit, sourceSnapshotIndex(snapshotPaths.map(snapshotPath => readJsonAtCommit(siteDir, sourceCommit, snapshotPath))))
      renameMaps.set(sourceCommit, collectProbableRenames({
        siteDir,
        sourceCommit,
        sourceCheckpointSha,
        ownedSourcePaths: ownership.ownedSourcePaths,
      }))
    }
    const historicalInventory = historicalInventories.get(sourceCommit) || null
    const historicalRecord = (historicalInventory?.records || []).find(record => record.contentPath === candidate.sourcePath) || null
    const historicalSourceIndex = historicalSourceIndexes.get(sourceCommit) || sourceSnapshotIndex([])
    const historicalSourceEntry = historicalSourceIndex.byToken.get(historicalRecord?.canonicalToken)
      || [...historicalSourceIndex.byRecordId.values()].find(entry => (entry.record.output_paths || []).includes(candidate.sourcePath))
      || null
    const baseRecordId = historicalSourceEntry?.record.record_id || null
    const currentSourceEntry = baseRecordId ? currentSourceIndex.byRecordId.get(baseRecordId) || null : null
    const sourceTargetExclusion = targetExclusionEvidence(currentSourceEntry, currentSourceIndex.targetsBuilt)
    const baseReplacementPath = currentSourceEntry?.record.output_paths?.find(outputPath => outputPath !== candidate.sourcePath) || null
    const titleMatches = historicalRecord ? (currentInventoryByTitle.get(historicalRecord.title) || []) : []
    const currentRun = currentRunKeys.has(`${candidate.sourcePath}\0${candidate.targetPath}\0${candidate.changeKind}`)
    const declaredRetiredRoot = declaredRoots.find(root => isWithinPath(candidate.sourcePath, root)) || null
    const gitRenamePath = renameMaps.get(sourceCommit)?.get(candidate.sourcePath) || null
    const generatedReplacement = titleMatches.find(record => typeof record.contentPath === 'string' && record.contentPath !== candidate.sourcePath)?.contentPath || null
    const missingGeneratedOutput = titleMatches.some(record => record.contentPath === null)

    let classification = 'historical_source_missing'
    let recommendedDisposition = 'review_historical_state'
    let probableReplacementPath = null
    if (currentRun) {
      classification = 'current_run_retirement'
      recommendedDisposition = 'review_current_source_change'
    } else if (declaredRetiredRoot) {
      classification = 'declared_retired_path'
      recommendedDisposition = 'approve_declared_retirement'
    } else if (sourceTargetExclusion) {
      classification = 'source_target_excluded'
      recommendedDisposition = 'review_source_target_configuration'
    } else if (baseReplacementPath) {
      classification = 'source_replacement_with_path_move'
      recommendedDisposition = 'retranslate_and_move'
      probableReplacementPath = baseReplacementPath
    } else if (gitRenamePath || generatedReplacement) {
      classification = 'probable_source_rename'
      recommendedDisposition = 'review_source_move'
      probableReplacementPath = gitRenamePath || generatedReplacement
    } else if (missingGeneratedOutput) {
      classification = 'source_inventory_missing_output'
      recommendedDisposition = 'repair_source_generation'
    }

    return {
      ...candidate,
      classification,
      recommendedDisposition,
      evidence: {
        currentRun,
        sourcePresentAtCheckpoint: fs.existsSync(path.join(siteDir, candidate.sourcePath)),
        targetPresent: fs.existsSync(path.join(siteDir, candidate.targetPath)),
        translationStateStatus: stateRecord?.status || null,
        translationStateSourceCommit: sourceCommit,
        declaredRetiredRoot,
        probableReplacementPath,
        baseRecordId,
        previousCanonicalToken: historicalSourceEntry?.record.doc_token || historicalRecord?.canonicalToken || null,
        replacementCanonicalToken: currentSourceEntry?.record.doc_token || null,
        publishTargets: sourceTargetExclusion?.publishTargets || (currentSourceEntry && Array.isArray(currentSourceEntry.record.publish_targets) ? currentSourceEntry.record.publish_targets : null),
        publishStatus: sourceTargetExclusion?.publishStatus || currentSourceEntry?.record.publish_status || null,
        targetsBuilt: currentSourceIndex.targetsBuilt,
        historicalInventoryTitle: historicalRecord?.title || null,
        currentInventoryMatches: titleMatches.map(record => ({
          canonicalToken: record.canonicalToken,
          contentPath: record.contentPath,
        })),
      },
    }
  })

  const classificationCounts = new Map()
  for (const candidate of reviewedCandidates) {
    classificationCounts.set(candidate.classification, (classificationCounts.get(candidate.classification) || 0) + 1)
  }
  return {
    schemaVersion: 1,
    status: 'retirement_review_required',
    target,
    locale,
    group,
    sourceCheckpointSha,
    generatedAt: new Date().toISOString(),
    summary: {
      total: reviewedCandidates.length,
      currentRunRetirements: reviewedCandidates.filter(candidate => candidate.evidence.currentRun).length,
      historicalReconciliations: reviewedCandidates.filter(candidate => !candidate.evidence.currentRun).length,
      classifications: Object.fromEntries([...classificationCounts.entries()].sort(([left], [right]) => left.localeCompare(right))),
    },
    candidates: reviewedCandidates,
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

function createManifest({ target, locale, group, sourceCheckpointSha, sourceDelta, items }) {
  const manifest = { target, locale, group, sourceCheckpointSha, generatedAt: new Date().toISOString(), items }
  if (sourceDelta) {
    manifest.source_delta = {
      deleted_i18n: [...(sourceDelta.deletedI18n || [])],
      renamed: [...(sourceDelta.renamed || [])],
      retirement_candidates: [...(sourceDelta.retirementCandidates || [])],
    }
  }
  return manifest
}

function evaluateManifestReconciliation({siteDir, target, group, toolingSha, discovery, approvalReceipts = [], now}) {
  if (!discovery || typeof discovery !== 'object' || Array.isArray(discovery)) throw new Error('Manifest reconciliation discovery is required')
  const evaluation = evaluateReconciliationPolicy({
    policy: loadReconciliationPolicy(siteDir),
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

function buildManifest({ siteDir, target = 'ja-JP', locale = localeForTarget(target), maxFiles = 0, group, sourceCheckpointSha, sourceDelta = null, mode = 'incremental', reconciliation = null }) {
  if (!['full', 'incremental'].includes(mode)) throw new Error(`Unsupported effective translation mode: ${mode}`)
  if (typeof group !== 'string' || group === '') throw new Error('A canonical translation group is required')
  if (!SHA.test(sourceCheckpointSha || '')) throw new Error('A valid 40-character source checkpoint SHA is required with --group')
  if (reconciliation) evaluateManifestReconciliation({siteDir, target, group, ...reconciliation})
  const ownership = candidateOwnership({group, target})
  const result = buildTranslationCandidates({
    repositoryRoot: siteDir,
    targetId: target,
    group: ownership.group,
    ownedSourcePaths: ownership.ownedSourcePaths,
    preservedSourcePaths: ownership.preservedSourcePaths,
    forceTranslationPaths: ownership.forceTranslationPaths,
    changedSourcePaths: sourceDelta?.changedEnglish || [],
    mode,
    retirementRegistry: readRetirementRegistry(siteDir, target),
  })
  const items = result.candidates.map(candidate => ({
    ...candidate,
    locale,
    type: typeForSource(target, candidate.sourcePath),
  }))
  const selectedItems = maxFiles > 0 ? items.slice(0, maxFiles) : items
  const effectiveSourceDelta = sourceDelta || result.retirementCandidates.length > 0
    ? {
        ...(sourceDelta || {}),
        retirementCandidates: result.retirementCandidates,
      }
    : null
  return createManifest({target, locale, group, sourceCheckpointSha, sourceDelta: effectiveSourceDelta, items: selectedItems})
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
  const sourceDeltaPath = args.get('--source-delta') || null
  const retirementReportPath = args.get('--retirement-report') || null
  const mode = args.get('--mode') || process.env.TRANSLATION_MODE || 'incremental'
  const sourceDelta = sourceDeltaPath ? JSON.parse(fs.readFileSync(path.join(siteDir, sourceDeltaPath), 'utf8')) : null
  const batchFlags = ['--batch-index', '--batch-size', '--expected-pending-set-sha256']
  const presentBatchFlags = batchFlags.filter(flag => args.has(flag))
  if (presentBatchFlags.length !== 0 && presentBatchFlags.length !== batchFlags.length) throw new Error('Batch manifest flags must be provided together')
  let manifest
  try {
    manifest = buildManifest({siteDir, target, locale, maxFiles: presentBatchFlags.length ? 0 : maxFiles, group, sourceCheckpointSha, sourceDelta, mode})
  } catch (error) {
    if (retirementReportPath && error instanceof TranslationRetirementRequiredError) {
      try {
        const review = buildRetirementReview({
          siteDir,
          target,
          locale,
          group,
          sourceCheckpointSha,
          sourceDelta,
          candidates: error.retirementCandidates,
        })
        writeJsonAtomic(path.join(siteDir, retirementReportPath), review)
        console.error(`[translation-manifest] retirement review written -> ${retirementReportPath}`)
      } catch (reportError) {
        console.error(`[translation-manifest] could not write retirement review: ${reportError.message}`)
      }
    }
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
  buildRetirementReview,
  cachePathForLocale,
  localeForTarget,
  evaluateManifestReconciliation,
  readCache,
  writeCache,
  writeJsonAtomic,
}
