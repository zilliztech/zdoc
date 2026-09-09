'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const {chunkDocument} = require('./chunker')
const {loadChunkLimits} = require('./chunkLimits')
const {loadLocaleContract} = require('./localeContract')
const {
  MAX_SEMANTIC_CHECKPOINT_FILE_BYTES,
  MAX_SEMANTIC_CHECKPOINTS_PER_FILE,
  filterUsableSemanticCheckpoints,
  loadSemanticCheckpoints,
} = require('./semanticRecovery')
const {collectSemanticUnitsSync, protectSemanticUnits} = require('./semanticUnits')

const SUMMARY_KIND = 'semantic-translation-seeds'
const FALLBACK_REASONS = Object.freeze(new Set([
  'missing_baseline_target',
  'old_source_unavailable',
  'alignment_failed',
  'no_matching_units',
  'seed_too_large',
]))
const GIT_SHA = /^[0-9a-f]{40}$/

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function assertSafeRelativePath(value, label) {
  if (typeof value !== 'string' || !value || path.posix.normalize(value) !== value ||
      path.isAbsolute(value) || value.includes('\\') || value.includes('\0') || value.split('/').includes('..')) {
    throw new Error(`${label} must be a safe repository-relative path: ${value}`)
  }
}

function validateSeedManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('Translation manifest must be an object')
  for (const key of ['target', 'locale', 'group', 'sourceCheckpointSha']) {
    if (typeof manifest[key] !== 'string' || !manifest[key]) throw new Error(`Translation manifest ${key} is required`)
  }
  if (!Array.isArray(manifest.items)) throw new Error('Translation manifest items must be an array')
  manifest.items.forEach((item, index) => {
    const label = `Translation manifest item ${index}`
    for (const key of ['sourcePath', 'targetPath']) {
      try {
        assertSafeRelativePath(item[key], `${label} ${key}`)
      } catch {
        throw new Error(`${label} ${key} must be a safe repository-relative path`)
      }
    }
    if (!/^[0-9a-f]{64}$/.test(item.sourceHash || '')) throw new Error(`${label} sourceHash must be 64 lowercase hex characters`)
  })
  return manifest
}

function readBaselineTarget({baseline, targetPath}) {
  const absolutePath = path.join(baseline, targetPath)
  let stat
  try {
    stat = fs.lstatSync(absolutePath)
  } catch {
    return null
  }
  if (!stat.isFile() || stat.isSymbolicLink()) return null
  return fs.readFileSync(absolutePath, 'utf8')
}

function readGitBlob(repository, commitSha, relativePath) {
  if (!GIT_SHA.test(commitSha || '')) return null
  const result = spawnSync('git', ['-C', repository, 'show', `${commitSha}:${relativePath}`], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') return null
  return result.stdout
}

function recordedSourceHashForItem({repository, target, locale, sourcePath}) {
  if (target === 'ja-JP') {
    const cachePath = path.join(repository, '.translation-cache', `${locale}.json`)
    if (!fs.existsSync(cachePath)) return null
    try {
      const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
      const record = parsed?.files?.[sourcePath]
      return typeof record?.sourceHash === 'string' && /^[0-9a-f]{64}$/.test(record.sourceHash) ? record.sourceHash : null
    } catch {
      return null
    }
  }
  if (target === 'zh-CN-reference') {
    const manifestPath = path.join(repository, 'generated', 'zh-CN', 'manifests', 'reference-translations.json')
    if (!fs.existsSync(manifestPath)) return null
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      const record = (parsed?.records || []).find(record => record?.sourcePath === sourcePath)
      return typeof record?.sourceHash === 'string' && /^[0-9a-f]{64}$/.test(record.sourceHash) ? record.sourceHash : null
    } catch {
      return null
    }
  }
  throw new Error(`Unsupported translation target: ${target}`)
}

function resolveOldSource({repository, sourceBaselineSha, sourcePath, currentSource, recordedSourceHash}) {
  const currentHash = sha256(currentSource)
  if (recordedSourceHash && recordedSourceHash === currentHash) return {content: currentSource}
  const baselineContent = readGitBlob(repository, sourceBaselineSha, sourcePath)
  if (recordedSourceHash) {
    return baselineContent !== null && sha256(baselineContent) === recordedSourceHash
      ? {content: baselineContent}
      : {content: null, reason: 'old_source_unavailable'}
  }
  return baselineContent !== null ? {content: baselineContent} : {content: null, reason: 'old_source_unavailable'}
}

function pairOldSourceWithTarget(oldSource, targetContent) {
  const oldUnits = collectSemanticUnitsSync(oldSource, {idPrefix: 'document'})
  const targetUnits = collectSemanticUnitsSync(targetContent, {idPrefix: 'document'})
  if (!oldUnits.length || oldUnits.length !== targetUnits.length) return null
  for (let index = 0; index < oldUnits.length; index += 1) {
    if (oldUnits[index].kind !== targetUnits[index].kind) return null
  }
  const translationsByHash = new Map()
  for (let index = 0; index < oldUnits.length; index += 1) {
    translationsByHash.set(sha256(oldUnits[index].source), targetUnits[index].source)
  }
  return translationsByHash
}

function collectCurrentUnits(sourceContent, chunkOptions) {
  const units = []
  const chunks = chunkOptions ? chunkDocument(sourceContent, chunkOptions) : [null]
  if (chunks.length > 1) {
    for (const chunk of chunks) {
      units.push(...collectSemanticUnitsSync(chunk.source, {idPrefix: `chunk.${String(chunk.index + 1).padStart(4, '0')}`}))
    }
  } else {
    units.push(...collectSemanticUnitsSync(sourceContent, {idPrefix: 'document'}))
  }
  return units
}

function buildSeedReport({item, manifest, currentSource, translationsByHash, chunkOptions, localeContract}) {
  const currentUnits = collectCurrentUnits(currentSource, chunkOptions)
  if (!currentUnits.length) return {report: null, reason: 'no_matching_units'}
  const candidates = new Map()
  for (const unit of currentUnits) {
    const translation = translationsByHash.get(sha256(unit.source))
    if (translation !== undefined) candidates.set(unit.id, {id: unit.id, sourceHash: sha256(unit.source), translation})
  }
  if (!candidates.size) return {report: null, reason: 'no_matching_units'}
  const protectedCurrentUnits = protectSemanticUnits(currentUnits, unit => unit.source, {literalTokens: localeContract.doNotTranslate})
  const usable = filterUsableSemanticCheckpoints(candidates, protectedCurrentUnits, localeContract)
  if (!usable.size) return {report: null, reason: 'no_matching_units'}
  const entries = [...usable.values()].sort((left, right) => left.id.localeCompare(right.id))
  if (entries.length > MAX_SEMANTIC_CHECKPOINTS_PER_FILE ||
      entries.reduce((total, entry) => total + Buffer.byteLength(entry.translation), 0) > MAX_SEMANTIC_CHECKPOINT_FILE_BYTES) {
    return {report: null, reason: 'seed_too_large'}
  }
  const report = {
    schemaVersion: 1,
    sourcePath: item.sourcePath,
    targetPath: item.targetPath,
    sourceHash: item.sourceHash,
    target: manifest.target,
    locale: manifest.locale,
    contractId: localeContract.contractId,
    entries,
  }
  loadSemanticCheckpoints(report, {...item, target: manifest.target})
  return {report, seededUnits: entries.length}
}

function planSemanticSeeds({manifest, repository, baseline, sourceBaselineSha, chunkOptions}) {
  validateSeedManifest(manifest)
  const localeContract = loadLocaleContract(manifest.target)
  const files = {}
  const counts = {candidates: manifest.items.length, seededFiles: 0, fallbackFiles: 0, seededUnits: 0}
  const reports = []
  manifest.items.forEach((item, index) => {
    const record = {sourcePath: item.sourcePath, reason: null, seededUnits: 0}
    const targetContent = readBaselineTarget({baseline, targetPath: item.targetPath})
    const currentSource = fs.readFileSync(path.join(repository, item.sourcePath), 'utf8')
    if (targetContent === null) {
      record.reason = 'missing_baseline_target'
    } else {
      const recordedSourceHash = recordedSourceHashForItem({repository, target: manifest.target, locale: manifest.locale, sourcePath: item.sourcePath})
      const oldSource = resolveOldSource({repository, sourceBaselineSha, sourcePath: item.sourcePath, currentSource, recordedSourceHash})
      if (oldSource.content === null) {
        record.reason = oldSource.reason
      } else {
        const translationsByHash = pairOldSourceWithTarget(oldSource.content, targetContent)
        if (!translationsByHash) {
          record.reason = 'alignment_failed'
        } else {
          const seeded = buildSeedReport({item, manifest, currentSource, translationsByHash, chunkOptions, localeContract})
          if (seeded.report) {
            const reportFile = path.join('reports', `${String(index + 1).padStart(6, '0')}.json`)
            reports.push({reportFile, report: seeded.report})
            record.reportFile = reportFile
            record.seededUnits = seeded.seededUnits
            counts.seededUnits += seeded.seededUnits
            counts.seededFiles += 1
          } else {
            record.reason = seeded.reason
          }
        }
      }
    }
    if (record.reason) {
      if (!FALLBACK_REASONS.has(record.reason)) throw new Error(`Unknown seed fallback reason: ${record.reason}`)
      counts.fallbackFiles += 1
    }
    files[item.sourcePath] = record
  })
  const summary = {
    schemaVersion: 1,
    kind: SUMMARY_KIND,
    target: manifest.target,
    locale: manifest.locale,
    group: manifest.group,
    sourceCheckpointSha: manifest.sourceCheckpointSha,
    generatedAt: new Date().toISOString(),
    counts,
    files,
  }
  return {summary, reports}
}

function writeSeedPlan({output, plan}) {
  fs.mkdirSync(path.join(output, 'reports'), {recursive: true})
  for (const {reportFile, report} of plan.reports) {
    const temporaryPath = path.join(output, `${reportFile}.tmp`)
    fs.writeFileSync(temporaryPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    fs.renameSync(temporaryPath, path.join(output, reportFile))
  }
  const summaryPath = path.join(output, 'summary.json')
  const temporarySummaryPath = `${summaryPath}.tmp`
  fs.writeFileSync(temporarySummaryPath, `${JSON.stringify(plan.summary, null, 2)}\n`, 'utf8')
  fs.renameSync(temporarySummaryPath, summaryPath)
}

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || args.has(flag)) {
      throw new Error('Usage: node scripts/translation/semanticSeeds.js --manifest <path> --repository <absolute-path> --baseline <absolute-path> --source-baseline-sha <sha> --output <path>')
    }
    args.set(flag, value)
  }
  for (const flag of ['--manifest', '--repository', '--baseline', '--source-baseline-sha', '--output']) {
    if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  }
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const repository = path.resolve(args.get('--repository'))
  if (repository !== args.get('--repository')) throw new Error('Semantic seeds repository must be an absolute normalized path')
  const baseline = path.resolve(args.get('--baseline'))
  if (baseline !== args.get('--baseline')) throw new Error('Semantic seeds baseline must be an absolute normalized path')
  const manifest = JSON.parse(fs.readFileSync(path.join(repository, args.get('--manifest')), 'utf8'))
  const plan = planSemanticSeeds({
    manifest,
    repository,
    baseline,
    sourceBaselineSha: args.get('--source-baseline-sha'),
    chunkOptions: loadChunkLimits(),
  })
  writeSeedPlan({output: path.join(repository, args.get('--output')), plan})
  console.log(`[semantic-seeds] candidates=${plan.summary.counts.candidates} seededFiles=${plan.summary.counts.seededFiles} fallbackFiles=${plan.summary.counts.fallbackFiles} seededUnits=${plan.summary.counts.seededUnits}`)
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
      '### Semantic translation seeds', '',
      `- Candidate files: ${plan.summary.counts.candidates}`,
      `- Seeded files: ${plan.summary.counts.seededFiles}`,
      `- Fallback files: ${plan.summary.counts.fallbackFiles}`,
      `- Seeded units: ${plan.summary.counts.seededUnits}`,
      '',
    ].join('\n'))
  }
}

module.exports = {
  FALLBACK_REASONS,
  buildSeedReport,
  collectCurrentUnits,
  pairOldSourceWithTarget,
  planSemanticSeeds,
  recordedSourceHashForItem,
  resolveOldSource,
  validateSeedManifest,
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
