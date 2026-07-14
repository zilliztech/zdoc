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

function selectSourceFiles({ sourceDir, planPath = null, snapshotPath = null, docTokens = [] }) {
  const available = new Set(allSourceFiles(sourceDir))
  let selectedTokens = [...new Set(docTokens.filter(Boolean))]
  if (selectedTokens.length === 0 && planPath) {
    const plan = readJson(planPath)
    if (plan.mode !== 'incremental') return [...available].sort()
    selectedTokens = [...new Set(plan.expanded_tokens || [])]
  } else if (selectedTokens.length === 0) {
    return [...available].sort()
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
}) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) throw new Error('Media prefetch concurrency must be between 1 and 16')
  const references = collectMediaReferences(sourceDir, sourceFiles)
  const resolved = new Array(references.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, references.length) }, async () => {
    while (cursor < references.length) {
      const index = cursor
      cursor += 1
      resolved[index] = await resolveReference(references[index], downloader, trim)
    }
  })
  await Promise.all(workers)
  if (references.length === 0) {
    console.log('[guides-media-prefetch] No media referenced by the selected document scope')
  }
  return writeMediaManifest(output, resolved)
}

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || args.has(flag)) throw new Error('Usage: guides-media-prefetch.js --source-dir <path> --output <path> [--plan <path> --snapshot <path>] [--doc-token <token[,token]>] [--concurrency <n>]')
    args.set(flag, value)
  }
  for (const flag of ['--source-dir', '--output']) if (!args.has(flag)) throw new Error(`Missing required argument: ${flag}`)
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const Downloader = require('../../plugins/lark-docs/larkImageDownloader')
  const concurrency = Number(args.get('--concurrency') || 4)
  const sourceDir = path.resolve(args.get('--source-dir'))
  const planPath = args.has('--plan') ? path.resolve(args.get('--plan')) : null
  const snapshotPath = args.has('--snapshot') ? path.resolve(args.get('--snapshot')) : null
  const docTokens = (args.get('--doc-token') || '').split(',').map(value => value.trim()).filter(Boolean)
  const sourceFiles = selectSourceFiles({ sourceDir, planPath, snapshotPath, docTokens })
  const downloader = new Downloader({}, path.dirname(path.resolve(args.get('--output'))), {
    maxConcurrent: concurrency,
    minTime: Number(process.env.GUIDES_MEDIA_PREFETCH_MIN_TIME_MS || 250),
  })
  try {
    const manifest = await prefetchGuidesMedia({
      sourceDir,
      output: path.resolve(args.get('--output')),
      downloader,
      concurrency,
      sourceFiles,
    })
    console.log(`[guides-media-prefetch] ${manifest.entries.length} media item(s) prefetched`)
  } finally {
    downloader.destroy()
  }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1 })

module.exports = { collectMediaReferences, figmaIdentity, prefetchGuidesMedia, selectSourceFiles, validateEntries, writeMediaManifest }
