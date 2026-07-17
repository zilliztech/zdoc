#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const slugify = require('slugify')

function figmaIdentity(rawUrl) {
  const url = new URL(decodeURIComponent(rawUrl))
  const parts = url.pathname.split('/').filter(Boolean)
  if (!['design', 'file'].includes(parts[0]) || !parts[1]) throw new Error(`Unsupported Figma URL: ${rawUrl}`)
  const rawNode = url.searchParams.get('node-id')
  if (!rawNode) throw new Error(`Figma URL is missing node-id: ${rawUrl}`)
  return { fileKey: parts[1], nodeId: rawNode.replaceAll('-', ':') }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function allSourceFiles(sourceDir) {
  return fs.readdirSync(sourceDir).filter(file => file.endsWith('.json')).sort()
}

function sourceFilesForSnapshot(sourceDir, snapshot) {
  const available = new Set(allSourceFiles(sourceDir))
  const files = [...new Set((snapshot.records || []).map(record => record.source_file).filter(Boolean))].sort()
  for (const file of files) {
    if (typeof file !== 'string' || !/^[^/\\]+\.json$/.test(file) || !available.has(file)) {
      throw new Error(`Cannot resolve media source file from snapshot: ${file}`)
    }
  }
  return files
}

function selectSourceFiles({ sourceDir, planPath = null, snapshotPath = null, docTokens = [] }) {
  const available = new Set(allSourceFiles(sourceDir))
  let selectedTokens = [...new Set(docTokens.filter(Boolean))]
  if (selectedTokens.length === 0 && planPath) {
    const plan = readJson(planPath)
    if (plan.mode !== 'incremental') {
      if (!snapshotPath) return [...available].sort()
      return sourceFilesForSnapshot(sourceDir, readJson(snapshotPath))
    }
    selectedTokens = [...new Set(plan.expanded_tokens || [])]
  } else if (selectedTokens.length === 0) {
    return snapshotPath ? sourceFilesForSnapshot(sourceDir, readJson(snapshotPath)) : [...available].sort()
  }

  if (!snapshotPath) throw new Error('Incremental or single-doc media prefetch requires a source snapshot')
  const snapshot = readJson(snapshotPath)
  const sourceByToken = new Map((snapshot.records || []).map(record => [record.doc_token, record.source_file]))
  return selectedTokens.map(token => {
    const sourceFile = sourceByToken.get(token)
    if (typeof sourceFile !== 'string' || !/^[^/\\]+\.json$/.test(sourceFile) || !available.has(sourceFile)) {
      throw new Error(`Cannot resolve media source file for document token: ${token}`)
    }
    return sourceFile
  }).filter((file, index, files) => files.indexOf(file) === index).sort()
}

function selectRequiredSourceFiles({ sourceDir, planPath = null, snapshotPath = null, docTokens = [] }) {
  if (docTokens.some(Boolean) || !planPath) return selectSourceFiles({ sourceDir, planPath, snapshotPath, docTokens })
  const plan = readJson(planPath)
  if (plan.mode !== 'incremental') {
    if (!snapshotPath) return allSourceFiles(sourceDir)
    return sourceFilesForSnapshot(sourceDir, readJson(snapshotPath))
  }
  if (!snapshotPath) throw new Error('Incremental media coverage validation requires a source snapshot')
  const snapshot = readJson(snapshotPath)
  const affectedTables = new Set(plan.affected_tables || [])
  const requiredTokens = [...new Set([
    ...(plan.expanded_tokens || []),
    ...(snapshot.records || []).filter(record => affectedTables.has(record.table_id)).map(record => record.doc_token),
  ])]
  return selectSourceFiles({ sourceDir, snapshotPath, docTokens: requiredTokens })
}

function collectMediaReferences(sourceDir, sourceFiles = allSourceFiles(sourceDir)) {
  const entries = new Map()
  for (const name of sourceFiles) {
    const source = readJson(path.join(sourceDir, name))
    for (const block of source.blocks?.items || []) {
      if (block.image?.token) {
        const caption = block.image.caption?.content?.trim() || block.image.token
        const id = `feishu-image:${block.image.token}`
        entries.set(id, { id, type: 'feishu-image', token: block.image.token, caption, objectKey: `${slugify(caption, { lower: true, strict: true })}.png` })
      }
      if (block.board?.token) {
        const id = `feishu-board:${block.board.token}`
        entries.set(id, { id, type: 'feishu-board', token: block.board.token })
      }
      if (block.iframe?.component?.iframe_type === 8 && block.iframe.component.url) {
        const { fileKey, nodeId } = figmaIdentity(block.iframe.component.url)
        const id = `figma:${fileKey}:${nodeId}`
        entries.set(id, { id, type: 'figma', fileKey, nodeId })
      }
    }
  }
  return [...entries.values()].sort((a, b) => a.id.localeCompare(b.id))
}

function markdownMediaByToken(docsDirs) {
  const result = new Map()
  function visit(entryPath) {
    if (!fs.existsSync(entryPath)) return
    const stat = fs.lstatSync(entryPath)
    if (stat.isSymbolicLink()) throw new Error(`Baseline docs cannot contain symlinks: ${entryPath}`)
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(entryPath).sort()) visit(path.join(entryPath, name))
      return
    }
    if (!stat.isFile() || !/\.mdx?$/.test(entryPath)) return
    const content = fs.readFileSync(entryPath, 'utf8')
    const token = content.match(/^token:\s*["']?([^\s"']+)["']?\s*$/m)?.[1]
    if (!token) return
    const images = [...content.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+"([^"]*)")?\)/g)].map(match => {
      const objectKey = path.posix.basename(decodeURIComponent(new URL(match[2]).pathname))
      return { caption: (match[3] || match[1] || objectKey.replace(/\.png$/i, '')).trim(), objectKey }
    }).filter(entry => entry.objectKey.endsWith('.png') && !entry.objectKey.includes('..'))
    if (!result.has(token)) result.set(token, [])
    result.get(token).push(images)
  }
  for (const docsDir of docsDirs) visit(docsDir)
  return result
}

function orderedFigmaReferences(source) {
  const seen = new Set(), result = []
  for (const block of source.blocks?.items || []) {
    if (block.iframe?.component?.iframe_type !== 8 || !block.iframe.component.url) continue
    const { fileKey, nodeId } = figmaIdentity(block.iframe.component.url)
    const id = `figma:${fileKey}:${nodeId}`
    if (!seen.has(id)) result.push({ id, type: 'figma', fileKey, nodeId })
    seen.add(id)
  }
  return result
}

function bootstrapMediaEntries({ sourceDir, docsDirs = [] }) {
  const mediaByToken = markdownMediaByToken(docsDirs)
  const entries = new Map()
  for (const name of allSourceFiles(sourceDir)) {
    const source = readJson(path.join(sourceDir, name))
    const token = source.node_token || source.doc_token
    const renderedCandidates = mediaByToken.get(token) || []
    if (renderedCandidates.length === 0) continue
    const references = collectMediaReferences(sourceDir, [name])
    const deterministic = references.filter(reference => reference.type !== 'figma').map(reference => (
      reference.type === 'feishu-board' ? { ...reference, objectKey: `${reference.token}.png` } : reference
    ))
    const deterministicKeys = new Set(deterministic.map(reference => reference.objectKey))
    const renderedKeys = new Set(renderedCandidates.flat().map(entry => entry.objectKey))
    for (const reference of deterministic) if (renderedKeys.has(reference.objectKey)) entries.set(reference.id, reference)

    const figma = orderedFigmaReferences(source)
    if (figma.length === 0) continue
    const renderedFigma = renderedCandidates
      .map(images => images.filter(image => !deterministicKeys.has(image.objectKey)))
      .find(images => images.length === figma.length)
    if (!renderedFigma) continue
    for (let index = 0; index < figma.length; index += 1) {
      entries.set(figma[index].id, { ...figma[index], ...renderedFigma[index] })
    }
  }
  return [...entries.values()].sort((a, b) => a.id.localeCompare(b.id))
}

function validateEntries(entries) {
  if (!Array.isArray(entries)) throw new Error('Media manifest entries must be an array')
  const seen = new Set()
  const allowedFields = {
    'feishu-image': new Set(['id', 'type', 'token', 'caption', 'objectKey']),
    'feishu-board': new Set(['id', 'type', 'token', 'objectKey']),
    figma: new Set(['id', 'type', 'fileKey', 'nodeId', 'caption', 'objectKey']),
  }
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || seen.has(entry.id)) throw new Error('Media manifest entries require unique ids')
    if (!['feishu-image', 'feishu-board', 'figma'].includes(entry.type)) throw new Error(`Unsupported media type: ${entry.type}`)
    for (const field of Object.keys(entry)) {
      if (!allowedFields[entry.type].has(field)) throw new Error(`Unexpected media manifest field: ${field}`)
    }
    if (typeof entry.objectKey !== 'string' || !entry.objectKey.endsWith('.png') || entry.objectKey.includes('/') || entry.objectKey.includes('..')) throw new Error(`Unsafe media object key: ${entry.objectKey}`)
    if (entry.type.startsWith('feishu-') && (typeof entry.token !== 'string' || !entry.token || entry.id !== `${entry.type}:${entry.token}`)) throw new Error(`Invalid Feishu media identity: ${entry.id}`)
    if (entry.type === 'feishu-image' && (typeof entry.caption !== 'string' || !entry.caption)) throw new Error(`Invalid Feishu image caption: ${entry.id}`)
    if (entry.type === 'figma' && (
      typeof entry.fileKey !== 'string' || !entry.fileKey ||
      typeof entry.nodeId !== 'string' || !entry.nodeId ||
      typeof entry.caption !== 'string' || !entry.caption ||
      entry.id !== `figma:${entry.fileKey}:${entry.nodeId}`
    )) throw new Error(`Invalid Figma media identity: ${entry.id}`)
    seen.add(entry.id)
  }
}

function readMediaManifest(manifestPath) {
  if (!manifestPath || !fs.existsSync(manifestPath)) return []
  const manifest = readJson(manifestPath)
  if (manifest.schemaVersion !== 1) throw new Error('Invalid guides media manifest schema')
  validateEntries(manifest.entries)
  return manifest.entries
}

function assertMediaCoverage(entries, references) {
  const available = new Set(entries.map(entry => entry.id))
  const missing = references.map(reference => reference.id).filter(id => !available.has(id))
  if (missing.length > 0) {
    throw new Error(`Guides media manifest coverage is incomplete: ${missing.length} missing (${missing.slice(0, 10).join(', ')})`)
  }
}

function writeMediaManifest(output, entries) {
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id))
  validateEntries(sorted)
  const manifest = { schemaVersion: 1, entries: sorted }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  const temporary = `${output}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
  fs.renameSync(temporary, output)
  return manifest
}

const MEDIA_METRIC_KEYS = Object.freeze([
  'canonicalReferencesRequired',
  'selectedReferences',
  'validatedManifestReuse',
  'committedDocsReconstruction',
  'resolvedByNetwork',
  'staleEntriesDropped',
  'finalManifestEntries',
])

function validateMediaPrefetchMetrics(metrics) {
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) throw new Error('Media prefetch metrics must be an object')
  const keys = Object.keys(metrics)
  if (keys.length !== MEDIA_METRIC_KEYS.length || keys.some(key => !MEDIA_METRIC_KEYS.includes(key))) {
    throw new Error('Media prefetch metrics contain unexpected or missing counters')
  }
  for (const key of MEDIA_METRIC_KEYS) {
    if (!Number.isSafeInteger(metrics[key]) || metrics[key] < 0) throw new Error(`Media prefetch metric ${key} must be a safe nonnegative integer`)
  }
  const dispositions = metrics.validatedManifestReuse + metrics.committedDocsReconstruction + metrics.resolvedByNetwork
  if (metrics.finalManifestEntries !== dispositions || metrics.finalManifestEntries !== metrics.canonicalReferencesRequired) {
    throw new Error('Media prefetch metrics do not reconcile final inventory and provenance dispositions')
  }
  if (metrics.selectedReferences > metrics.canonicalReferencesRequired) throw new Error('Selected media references cannot exceed canonical inventory')
  return Object.freeze({ ...metrics })
}

function writeMediaPrefetchReport(output, { mode, cacheState, metrics, generatedAt = new Date().toISOString() }) {
  if (!['incremental', 'recovery'].includes(mode)) throw new Error('Media prefetch report mode must be incremental or recovery')
  if (!['valid', 'invalid', 'missing', 'legacy'].includes(cacheState)) throw new Error('Media prefetch report cache state is invalid')
  if (typeof generatedAt !== 'string' || Number.isNaN(Date.parse(generatedAt)) || new Date(generatedAt).toISOString() !== generatedAt) {
    throw new Error('Media prefetch report generatedAt must be an ISO timestamp')
  }
  const report = {
    schemaVersion: 1,
    generated_at: generatedAt,
    mode,
    cacheState,
    metrics: validateMediaPrefetchMetrics(metrics),
  }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  const temporary = `${output}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
  fs.renameSync(temporary, output)
  return report
}

async function trimBoard(buffer) {
  const sharp = require('sharp')
  return sharp(buffer)
    .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 10 })
    .png()
    .extend({ top: 20, bottom: 20, left: 20, right: 20, background: { r: 255, g: 255, b: 255 } })
    .toBuffer()
}

async function resolveReference(reference, downloader, trim) {
    if (reference.type === 'feishu-image') {
      const buffer = await downloader.__downloadImage(reference.token)
      await downloader.__uploadToS3(buffer, reference.objectKey)
      return reference
    }
    if (reference.type === 'feishu-board') {
      const objectKey = `${reference.token}.png`
      const buffer = await trim(await downloader.__downloadBoardPreview(reference.token))
      await downloader.__uploadToS3(buffer, objectKey)
      return { ...reference, objectKey }
    }
    const response = await downloader.__fetchCaption(reference.fileKey, reference.nodeId)
    const caption = response?.nodes?.[reference.nodeId]?.document?.name
    if (typeof caption !== 'string' || !caption.trim()) throw new Error(`Figma caption is missing: ${reference.id}`)
    const objectKey = `${slugify(caption, { lower: true, strict: true }) || `${reference.fileKey}-${reference.nodeId.replaceAll(':', '-')}`}.png`
    const buffer = await downloader.__downloadIframe(reference.fileKey, reference.nodeId)
    await downloader.__uploadToS3(buffer, objectKey)
    return { ...reference, caption, objectKey }
}

async function prefetchGuidesMedia({
  sourceDir,
  output,
  downloader,
  trimBoard: trim = trimBoard,
  concurrency = 4,
  sourceFiles = allSourceFiles(sourceDir),
  requiredSourceFiles = sourceFiles,
  canonicalSourceFiles = requiredSourceFiles,
  previousManifestPath = null,
  bootstrapDocsDirs = [],
  reuseExisting = false,
}) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) throw new Error('Media prefetch concurrency must be between 1 and 16')
  const references = collectMediaReferences(sourceDir, sourceFiles)
  const canonicalReferences = collectMediaReferences(sourceDir, canonicalSourceFiles)
  const canonicalById = new Map(canonicalReferences.map(reference => [reference.id, reference]))
  const selectedIds = new Set(references.map(reference => reference.id))
  const reconstructed = new Map(bootstrapMediaEntries({ sourceDir, docsDirs: bootstrapDocsDirs }).map(entry => [entry.id, entry]))
  const previousEntries = readMediaManifest(previousManifestPath)
  const previous = new Map(previousEntries.map(entry => [entry.id, entry]))
  const finalEntries = new Map()
  const provenance = new Map()
  const pendingResolution = []

  for (const reference of canonicalReferences) {
    if (selectedIds.has(reference.id) && !reuseExisting) {
      pendingResolution.push(reference)
      continue
    }
    if (previous.has(reference.id)) {
      finalEntries.set(reference.id, previous.get(reference.id))
      provenance.set(reference.id, 'validatedManifestReuse')
      continue
    }
    if (reconstructed.has(reference.id)) {
      finalEntries.set(reference.id, reconstructed.get(reference.id))
      provenance.set(reference.id, 'committedDocsReconstruction')
      continue
    }
    if (selectedIds.has(reference.id)) pendingResolution.push(reference)
  }

  const resolutionById = new Map(pendingResolution.map(reference => [reference.id, reference]))
  const referencesToResolve = [...resolutionById.values()]
  const resolved = new Array(referencesToResolve.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, referencesToResolve.length) }, async () => {
    while (cursor < referencesToResolve.length) {
      const index = cursor
      cursor += 1
      resolved[index] = await resolveReference(referencesToResolve[index], downloader, trim)
    }
  })
  await Promise.all(workers)
  if (references.length === 0) {
    console.log('[guides-media-prefetch] No media referenced by the selected document scope')
  }
  for (const entry of resolved) {
    finalEntries.set(entry.id, entry)
    provenance.set(entry.id, 'resolvedByNetwork')
  }
  const entries = canonicalReferences.map(reference => finalEntries.get(reference.id)).filter(Boolean)
  assertMediaCoverage(entries, canonicalReferences)
  const metrics = validateMediaPrefetchMetrics({
    canonicalReferencesRequired: canonicalReferences.length,
    selectedReferences: selectedIds.size,
    validatedManifestReuse: [...provenance.values()].filter(value => value === 'validatedManifestReuse').length,
    committedDocsReconstruction: [...provenance.values()].filter(value => value === 'committedDocsReconstruction').length,
    resolvedByNetwork: [...provenance.values()].filter(value => value === 'resolvedByNetwork').length,
    staleEntriesDropped: previousEntries.filter(entry => !canonicalById.has(entry.id)).length,
    finalManifestEntries: entries.length,
  })
  return { manifest: writeMediaManifest(output, entries), metrics }
}

function parseArgs(argv) {
  const args = new Map()
  const allowed = new Set(['--source-dir', '--output', '--report', '--mode', '--cache-state', '--snapshot', '--plan', '--doc-token', '--previous-manifest', '--bootstrap-docs', '--concurrency'])
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || args.has(flag)) throw new Error('Usage: guides-media-prefetch.js --source-dir <path> --output <path> --report <path> --mode <incremental|recovery> --cache-state <valid|invalid|missing|legacy> --snapshot <path> [--plan <path> | --doc-token <token[,token]>] [--previous-manifest <path>] [--bootstrap-docs <dir[,dir]>] [--concurrency <n>]')
    args.set(flag, value)
  }
  for (const flag of ['--source-dir', '--output', '--report', '--mode', '--cache-state', '--snapshot']) if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  if (!['incremental', 'recovery'].includes(args.get('--mode'))) throw new Error('--mode must be incremental or recovery')
  if (!['valid', 'invalid', 'missing', 'legacy'].includes(args.get('--cache-state'))) throw new Error('--cache-state must be valid, invalid, missing, or legacy')
  const hasPlan = args.has('--plan')
  const hasDocToken = args.has('--doc-token')
  if (args.get('--mode') === 'incremental' && hasPlan === hasDocToken) {
    throw new Error('Incremental mode requires exactly one selector: --plan or --doc-token')
  }
  if (args.get('--mode') === 'incremental' && hasPlan && !args.get('--plan').trim()) throw new Error('--plan selector must be non-empty')
  if (args.get('--mode') === 'incremental' && hasDocToken && !args.get('--doc-token').split(',').some(value => value.trim())) throw new Error('--doc-token selector must be non-empty')
  if (args.get('--mode') === 'recovery' && (hasPlan || hasDocToken)) {
    throw new Error('Recovery mode rejects --plan and --doc-token selectors')
  }
  return args
}

function resolvePrefetchScopes({ sourceDir, snapshotPath, planPath = null, docTokens = [], mode }) {
  if (!['incremental', 'recovery'].includes(mode)) throw new Error('Media prefetch scope mode must be incremental or recovery')
  const canonicalSourceFiles = sourceFilesForSnapshot(sourceDir, readJson(snapshotPath))
  if (mode === 'recovery') {
    return { sourceFiles: canonicalSourceFiles, requiredSourceFiles: canonicalSourceFiles, canonicalSourceFiles }
  }
  return {
    sourceFiles: selectSourceFiles({ sourceDir, planPath, snapshotPath, docTokens }),
    requiredSourceFiles: selectRequiredSourceFiles({ sourceDir, planPath, snapshotPath, docTokens }),
    canonicalSourceFiles,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const Downloader = require('../../plugins/lark-docs/larkImageDownloader')
  const concurrency = Number(args.get('--concurrency') || 4)
  const sourceDir = path.resolve(args.get('--source-dir'))
  const planPath = args.has('--plan') ? path.resolve(args.get('--plan')) : null
  const snapshotPath = path.resolve(args.get('--snapshot'))
  const docTokens = (args.get('--doc-token') || '').split(',').map(value => value.trim()).filter(Boolean)
  const { sourceFiles, requiredSourceFiles, canonicalSourceFiles } = resolvePrefetchScopes({
    sourceDir,
    snapshotPath,
    planPath,
    docTokens,
    mode: args.get('--mode'),
  })
  const bootstrapDocsDirs = (args.get('--bootstrap-docs') || '').split(',').map(value => value.trim()).filter(Boolean).map(value => path.resolve(value))
  const downloader = new Downloader({}, path.dirname(path.resolve(args.get('--output'))), {
    maxConcurrent: concurrency,
    minTime: Number(process.env.GUIDES_MEDIA_PREFETCH_MIN_TIME_MS || 250),
    figmaMaxConcurrent: Number(process.env.GUIDES_FIGMA_MAX_CONCURRENT || 1),
    figmaMinTime: Number(process.env.GUIDES_FIGMA_MIN_TIME_MS || 1000),
  })
  try {
    const result = await prefetchGuidesMedia({
      sourceDir,
      output: path.resolve(args.get('--output')),
      downloader,
      concurrency,
      sourceFiles,
      requiredSourceFiles,
      canonicalSourceFiles,
      previousManifestPath: args.has('--previous-manifest') ? path.resolve(args.get('--previous-manifest')) : null,
      bootstrapDocsDirs,
      reuseExisting: args.get('--mode') === 'recovery',
    })
    writeMediaPrefetchReport(path.resolve(args.get('--report')), {
      mode: args.get('--mode'),
      cacheState: args.get('--cache-state'),
      metrics: result.metrics,
    })
    console.log(`[guides-media-prefetch] canonical=${result.metrics.canonicalReferencesRequired} selected=${result.metrics.selectedReferences} manifest_reuse=${result.metrics.validatedManifestReuse} docs_reconstruction=${result.metrics.committedDocsReconstruction} network_resolved=${result.metrics.resolvedByNetwork} stale_dropped=${result.metrics.staleEntriesDropped} final=${result.metrics.finalManifestEntries}`)
  } finally {
    downloader.destroy()
  }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = { assertMediaCoverage, bootstrapMediaEntries, collectMediaReferences, figmaIdentity, parseArgs, prefetchGuidesMedia, readMediaManifest, resolvePrefetchScopes, selectRequiredSourceFiles, selectSourceFiles, sourceFilesForSnapshot, validateEntries, validateMediaPrefetchMetrics, writeMediaManifest, writeMediaPrefetchReport }
