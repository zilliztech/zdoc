#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { hashSnapshot, assertSourceCompleteness } = require('../../plugins/lark-docs/sourceCompleteness')
const { assertMediaCoverage, collectMediaReferences, sourceFilesForSnapshot, validateEntries } = require('./guides-media-prefetch')

function readSnapshot(snapshotPath) { return JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) }
function readRegularJson(file, label) {
  const stat = fs.lstatSync(file)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${label} must be a regular non-symlink file`)
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
function sha(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }
function sourceCacheKey(snapshotPath, { version = 3 } = {}) {
  if (![1, 2, 3, 4].includes(version)) throw new Error(`Unsupported Guides source cache version: ${version}`)
  return `guides-source-v${version}-${hashSnapshot(readSnapshot(snapshotPath))}`
}

function sourceFiles(sourceDir) {
  const sourceRoot = path.resolve(sourceDir)
  const sourceDirStat = fs.lstatSync(sourceRoot)
  if (!sourceDirStat.isDirectory() || sourceDirStat.isSymbolicLink()) throw new Error('Unsafe source cache directory')
  const canonicalSourceDir = fs.realpathSync(sourceRoot)
  return fs.readdirSync(sourceRoot).filter(file => file.endsWith('.json')).sort().map(file => {
    const full = path.join(sourceRoot, file), stat = fs.lstatSync(full)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Unsafe source cache file: ${file}`)
    const relative = path.relative(canonicalSourceDir, fs.realpathSync(full))
    if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error(`Unsafe source cache file: ${file}`)
    const bytes = fs.readFileSync(full)
    return { path: file, size: bytes.length, sha256: sha(bytes) }
  })
}

function mediaManifestFile(mediaManifestPath, sourceDir, snapshot) {
  if (!mediaManifestPath) throw new Error('Guides source cache requires a media manifest')
  const stat = fs.lstatSync(mediaManifestPath)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Unsafe guides media manifest file')
  const bytes = fs.readFileSync(mediaManifestPath)
  const manifest = JSON.parse(bytes)
  if (manifest.schemaVersion !== 1) throw new Error('Guides media manifest identity is invalid')
  validateEntries(manifest.entries)
  assertMediaCoverage(manifest.entries, collectMediaReferences(sourceDir, sourceFilesForSnapshot(sourceDir, snapshot)))
  return { size: bytes.length, sha256: sha(bytes) }
}

function createSourceCacheManifest({ sourceDir, snapshotPath, manifestPath, mediaManifestPath, rootToken }) {
  const snapshot = readSnapshot(snapshotPath)
  assertSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken, sourceDir, snapshot })
  const manifest = {
    schemaVersion: 2,
    manual: 'guides',
    buildEnv: 'uat',
    snapshotHash: hashSnapshot(snapshot),
    createdAt: new Date().toISOString(),
    files: sourceFiles(sourceDir),
    mediaManifest: mediaManifestFile(mediaManifestPath, sourceDir, snapshot),
  }
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  const temporary = `${manifestPath}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
  fs.renameSync(temporary, manifestPath)
  return manifest
}

function validateSourceCache({ sourceDir, snapshotPath, manifestPath, rootToken, acceptedSchemaVersions = [2] }) {
  if (!Array.isArray(acceptedSchemaVersions) || acceptedSchemaVersions.length === 0 || acceptedSchemaVersions.some(version => ![1, 2].includes(version))) {
    throw new Error('Accepted source cache schemas must contain only versions 1 or 2')
  }
  const snapshot = readSnapshot(snapshotPath), manifest = readRegularJson(manifestPath, 'Guides source cache manifest')
  if (!acceptedSchemaVersions.includes(manifest.schemaVersion) || manifest.manual !== 'guides' || manifest.buildEnv !== 'uat') throw new Error('Source cache manifest identity is invalid')
  if (manifest.snapshotHash !== hashSnapshot(snapshot)) throw new Error('Source cache snapshot identity mismatch')
  const actual = sourceFiles(sourceDir)
  if (JSON.stringify(actual) !== JSON.stringify(manifest.files)) throw new Error('Source cache is invalid: file manifest mismatch')
  return assertSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken, sourceDir, snapshot })
}

function validateMediaCache({ sourceDir, snapshotPath, manifestPath, mediaManifestPath }) {
  const snapshot = readSnapshot(snapshotPath), manifest = readRegularJson(manifestPath, 'Guides source cache manifest')
  if (manifest.schemaVersion !== 2 || manifest.manual !== 'guides' || manifest.buildEnv !== 'uat' || !manifest.mediaManifest) {
    throw new Error('Source cache does not contain v2 media identity')
  }
  if (manifest.snapshotHash !== hashSnapshot(snapshot)) throw new Error('Source cache snapshot identity mismatch')
  const actualMedia = mediaManifestFile(mediaManifestPath, sourceDir, snapshot)
  if (JSON.stringify(actualMedia) !== JSON.stringify(manifest.mediaManifest)) throw new Error('Source cache is invalid: media manifest mismatch')
  return actualMedia
}

function args(argv) {
  const operation = argv.shift(), result = { operation }
  while (argv.length) {
    const key = argv.shift(), value = argv.shift()
    if (!key?.startsWith('--') || value === undefined || Object.hasOwn(result, key.slice(2))) throw new Error('Invalid arguments')
    result[key.slice(2)] = value
  }
  return result
}

if (require.main === module) {
  try {
    const input = args(process.argv.slice(2))
    if (input.operation === 'key') process.stdout.write(sourceCacheKey(input.snapshot, { version: Number(input.version || 2) }))
    else if (input.operation === 'create') createSourceCacheManifest({ sourceDir: input['source-dir'], snapshotPath: input.snapshot, manifestPath: input.output, mediaManifestPath: input['media-manifest'], rootToken: input['root-token'] })
    else if (input.operation === 'validate-source') validateSourceCache({
      sourceDir: input['source-dir'],
      snapshotPath: input.snapshot,
      manifestPath: input.manifest,
      rootToken: input['root-token'],
      acceptedSchemaVersions: String(input.schemas || '2').split(',').map(Number),
    })
    else if (input.operation === 'validate-media') validateMediaCache({ sourceDir: input['source-dir'], snapshotPath: input.snapshot, manifestPath: input.manifest, mediaManifestPath: input['media-manifest'] })
    else if (input.operation === 'validate') {
      validateSourceCache({ sourceDir: input['source-dir'], snapshotPath: input.snapshot, manifestPath: input.manifest, rootToken: input['root-token'] })
      validateMediaCache({ sourceDir: input['source-dir'], snapshotPath: input.snapshot, manifestPath: input.manifest, mediaManifestPath: input['media-manifest'] })
    }
    else throw new Error('Unknown operation')
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { sourceCacheKey, createSourceCacheManifest, validateMediaCache, validateSourceCache }
