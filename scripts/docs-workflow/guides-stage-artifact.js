#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const { assertSourceCompleteness } = require('../../plugins/lark-docs/sourceCompleteness')
const { validateMediaPrefetchMetrics } = require('./guides-media-prefetch')

const SHA = /^[0-9a-f]{40}$/
const MEDIA_PREFETCH_REPORT = 'plugins/lark-docs/meta/reports/guides-media-prefetch.json'
const STAGE_PATHS = Object.freeze({
  source: [
    'plugins/lark-docs/meta/sources/guides',
    'plugins/lark-docs/meta/media-cache/guides.json',
    'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json',
    'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md',
    'plugins/lark-docs/meta/reports/guides-broken-content-links.json',
    'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json',
    MEDIA_PREFETCH_REPORT,
  ],
  saas: [
    'docs',
    'config/generated/guides.sidebar.js',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.json',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.csv',
  ],
  byoc: ['docs-byoc', 'config/generated/guides-byoc.sidebar.js'],
})
const REQUIRED_STAGE_FILES = Object.freeze({
  source: [
    'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json',
    'plugins/lark-docs/meta/media-cache/guides.json',
    MEDIA_PREFETCH_REPORT,
  ],
  saas: [],
  byoc: [],
})

function allowed(stage, relative) {
  return STAGE_PATHS[stage].some(prefix => relative === prefix || relative.startsWith(`${prefix}/`))
}

function requiredLabel(relative) {
  if (relative.includes('/media-cache/')) return 'media manifest'
  if (relative === MEDIA_PREFETCH_REPORT) return 'media prefetch report'
  return 'snapshot candidate'
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  const keys = Object.keys(value)
  if (keys.length !== expected.length || keys.some(key => !expected.includes(key))) throw new Error(`${label} must contain exact keys: ${expected.join(', ')}`)
}

function validateMediaPrefetchReport(value) {
  exactKeys(value, ['schemaVersion', 'generated_at', 'mode', 'cacheState', 'metrics'], 'Guides media prefetch report')
  if (value.schemaVersion !== 1) throw new Error('Guides media prefetch report schemaVersion must be 1')
  if (typeof value.generated_at !== 'string' || Number.isNaN(Date.parse(value.generated_at)) || new Date(value.generated_at).toISOString() !== value.generated_at) {
    throw new Error('Guides media prefetch report generated_at must be an ISO timestamp')
  }
  if (!['incremental', 'recovery'].includes(value.mode)) throw new Error('Guides media prefetch report mode must be incremental or recovery')
  if (!['valid', 'invalid', 'missing', 'legacy'].includes(value.cacheState)) throw new Error('Guides media prefetch report cacheState is invalid')
  validateMediaPrefetchMetrics(value.metrics)
  return value
}

function parseMediaPrefetchReport(bytes) {
  let value
  try { value = JSON.parse(bytes.toString('utf8')) } catch (error) { throw new Error(`Guides media prefetch report is invalid JSON: ${error.message}`) }
  return validateMediaPrefetchReport(value)
}

async function collect(root, prefixes) {
  const result = new Map()
  async function visit(relative) {
    const full = path.join(root, relative)
    let stat
    try { stat = await fs.lstat(full) } catch (error) { if (error.code === 'ENOENT') return; throw error }
    if (stat.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${relative}`)
    if (stat.isDirectory()) {
      for (const entry of (await fs.readdir(full)).sort()) await visit(path.posix.join(relative, entry))
      return
    }
    if (!stat.isFile()) throw new Error(`Unsupported file type: ${relative}`)
    result.set(relative, await fs.readFile(full))
  }
  for (const prefix of prefixes) await visit(prefix)
  return result
}

async function assertSourceStageCompleteness({ workspace, snapshotCandidatePath, rootToken }) {
  if (!rootToken) throw new Error('Guides source artifact requires rootToken')
  const relativeSnapshot = snapshotCandidatePath || 'plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json'
  const snapshotPath = path.join(workspace, relativeSnapshot)
  let snapshot
  try {
    snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Guides source artifact is missing required snapshot candidate: ${relativeSnapshot}`)
    throw error
  }
  assertSourceCompleteness({
    manual: 'guides',
    buildEnv: 'uat',
    rootToken,
    sourceDir: path.join(workspace, 'plugins/lark-docs/meta/sources/guides'),
    snapshot,
  })
}

async function createGuidesStageArtifact({ stage, workspace, baselineDir, output, masterSha, devBaselineSha, sourceArtifactSha256 = null, snapshotCandidatePath = null, rootToken = null }) {
  if (!Object.hasOwn(STAGE_PATHS, stage)) throw new Error(`Unknown guides stage: ${stage}`)
  if (!SHA.test(masterSha) || !SHA.test(devBaselineSha)) throw new Error('Invalid SHA')
  if (stage === 'source') await assertSourceStageCompleteness({ workspace, snapshotCandidatePath, rootToken })
  const [current, baseline] = await Promise.all([collect(workspace, STAGE_PATHS[stage]), collect(baselineDir, STAGE_PATHS[stage])])
  if (current.size === 0) throw new Error(`Guides ${stage} artifact has no files`)
  for (const required of REQUIRED_STAGE_FILES[stage]) {
    if (!current.has(required)) {
      throw new Error(`Guides ${stage} artifact is missing required ${requiredLabel(required)}: ${required}`)
    }
  }
  if (stage === 'source') parseMediaPrefetchReport(current.get(MEDIA_PREFETCH_REPORT))
  await fs.rm(output, { recursive: true, force: true })
  await fs.mkdir(path.join(output, 'payload'), { recursive: true })
  const files = []
  for (const [relative, bytes] of [...current].sort(([a], [b]) => a.localeCompare(b))) {
    const destination = path.join(output, 'payload', relative)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.writeFile(destination, bytes, { flag: 'wx' })
    files.push({ path: relative, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), size: bytes.length })
  }
  const deletions = [...baseline.keys()].filter(relative => !current.has(relative)).sort()
  const manifest = { schemaVersion: 1, manual: 'guides', stage, masterSha, devBaselineSha, sourceArtifactSha256, createdAt: new Date().toISOString(), files, deletions }
  await fs.writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
  await validateGuidesStageArtifact(output)
  return manifest
}

async function validateGuidesStageArtifact(directory, expected = {}) {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'))
  if (manifest.schemaVersion !== 1 || manifest.manual !== 'guides' || !Object.hasOwn(STAGE_PATHS, manifest.stage)) throw new Error('Invalid guides artifact identity')
  if (!SHA.test(manifest.masterSha) || !SHA.test(manifest.devBaselineSha)) throw new Error('Invalid guides artifact SHA')
  if (expected.stage && manifest.stage !== expected.stage) throw new Error(`Expected guides stage ${expected.stage}`)
  if (expected.masterSha && manifest.masterSha !== expected.masterSha) throw new Error('Guides artifact master SHA mismatch')
  if (expected.devBaselineSha && manifest.devBaselineSha !== expected.devBaselineSha) throw new Error('Guides artifact baseline SHA mismatch')
  if (expected.sourceArtifactSha256 && manifest.sourceArtifactSha256 !== expected.sourceArtifactSha256) throw new Error('Guides source artifact identity mismatch')
  const seen = new Set()
  for (const file of manifest.files || []) {
    if (!allowed(manifest.stage, file.path) || seen.has(file.path)) throw new Error(`Unauthorized or duplicate path: ${file.path}`)
    seen.add(file.path)
    const full = path.join(directory, 'payload', file.path)
    const stat = await fs.lstat(full)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Invalid payload file: ${file.path}`)
    const bytes = await fs.readFile(full)
    if (bytes.length !== file.size) throw new Error(`Payload size mismatch: ${file.path}`)
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Payload checksum mismatch: ${file.path}`)
    if (manifest.stage === 'source' && file.path === MEDIA_PREFETCH_REPORT) parseMediaPrefetchReport(bytes)
  }
  for (const required of REQUIRED_STAGE_FILES[manifest.stage]) {
    if (!seen.has(required)) {
      throw new Error(`Guides ${manifest.stage} artifact is missing required ${requiredLabel(required)}: ${required}`)
    }
  }
  for (const relative of manifest.deletions || []) if (!allowed(manifest.stage, relative) || seen.has(relative)) throw new Error(`Unauthorized deletion: ${relative}`)
  return manifest
}

async function restoreGuidesStageArtifact({ artifact, target, expected = {} }) {
  const manifest = await validateGuidesStageArtifact(artifact, expected)
  for (const relative of manifest.deletions) await fs.rm(path.join(target, relative), { recursive: true, force: true })
  for (const file of manifest.files) {
    const destination = path.join(target, file.path)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.copyFile(path.join(artifact, 'payload', file.path), destination)
  }
  return manifest
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid arguments')
    args[flag.slice(2)] = value
  }
  return args
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2))
  const operation = args.operation
  const promise = operation === 'create'
    ? createGuidesStageArtifact({ stage: args.stage, workspace: args.workspace, baselineDir: args['baseline-dir'], output: args.output, masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], sourceArtifactSha256: args['source-artifact-sha256'] || null, snapshotCandidatePath: args['snapshot-candidate'] || null, rootToken: args['root-token'] || null })
    : operation === 'validate'
      ? validateGuidesStageArtifact(args.artifact, { stage: args.stage, masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], sourceArtifactSha256: args['source-artifact-sha256'] })
      : operation === 'restore'
        ? restoreGuidesStageArtifact({ artifact: args.artifact, target: args.target, expected: { stage: args.stage, masterSha: args['master-sha'], devBaselineSha: args['dev-baseline-sha'], sourceArtifactSha256: args['source-artifact-sha256'] } })
        : Promise.reject(new Error('Unknown operation'))
  promise.catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = { createGuidesStageArtifact, restoreGuidesStageArtifact, validateGuidesStageArtifact }
