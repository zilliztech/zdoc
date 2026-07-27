#!/usr/bin/env node
'use strict'

const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const SHA = /^[0-9a-f]{40}$/
const MANIFEST_PATH = 'checkpoint-group/manifest.json'

function safeArchivePath(value) {
  if (typeof value !== 'string' || value === '' || value.includes('\\') || /[\0\r\n]/.test(value) || path.posix.isAbsolute(value)) {
    throw new Error(`Unsafe archive path: ${JSON.stringify(value)}`)
  }
  const withoutSlash = value.endsWith('/') ? value.slice(0, -1) : value
  const segments = withoutSlash.split('/')
  if (!withoutSlash || segments.some(segment => segment === '' || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe archive path: ${JSON.stringify(value)}`)
  }
  const normalized = path.posix.normalize(withoutSlash)
  if (normalized !== withoutSlash || (normalized !== 'checkpoint-group' && !normalized.startsWith('checkpoint-group/'))) {
    throw new Error(`Unexpected archive path: ${JSON.stringify(value)}`)
  }
  return normalized
}

function tarLines(archive, args, label) {
  let output
  try { output = execFileSync('tar', [...args, archive], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024}) }
  catch (error) { throw new Error(`Unable to ${label} checkpoint archive: ${error.message}`) }
  if (output.includes('\0') || output.includes('\r')) throw new Error(`Unsafe ${label} output from checkpoint archive`)
  return output.split('\n').filter(Boolean)
}

function inspectArchive(archive) {
  if (typeof archive !== 'string' || !path.isAbsolute(archive) || /[\0\r\n]/.test(archive)) throw new Error('archive must be an absolute path')
  const stat = fs.lstatSync(archive)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('archive must be a regular non-symlink file')
  const names = tarLines(archive, ['-tf'], 'list')
  const verbose = tarLines(archive, ['-tvf'], 'inspect')
  if (names.length === 0 || names.length !== verbose.length) throw new Error('Checkpoint archive entry listing is inconsistent')
  const normalized = []
  const seen = new Set()
  for (let index = 0; index < names.length; index += 1) {
    const relative = safeArchivePath(names[index])
    if (seen.has(relative)) throw new Error(`Duplicate normalized archive path: ${relative}`)
    seen.add(relative)
    normalized.push(relative)
    const type = verbose[index][0]
    if (!['-', 'd'].includes(type)) throw new Error(`Unsafe archive entry type for ${relative}: ${type}`)
    if (type === 'd' && relative === MANIFEST_PATH) throw new Error('Checkpoint manifest entry must be a regular file')
  }
  if (normalized.filter(relative => relative === MANIFEST_PATH).length !== 1) throw new Error('Checkpoint archive must contain exactly one checkpoint-group/manifest.json entry')
  return Object.freeze(normalized)
}

function assertString(value, label) {
  if (typeof value !== 'string' || !value || /[\0\r\n]/.test(value)) throw new Error(`${label} must be a non-empty single-line string`)
}

function validateManifestIdentity(manifest, expected) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('Checkpoint manifest must be an object')
  if (manifest.group !== expected.group) throw new Error('Checkpoint manifest group mismatch')
  if (manifest.masterSha !== expected.masterSha) throw new Error('Checkpoint manifest master/tooling checkout mismatch')
  if (expected.translationTarget) {
    const fields = [
      ['translation target', 'translationTarget', expected.translationTarget],
      ['source checkpoint SHA', 'sourceCheckpointSha', expected.sourceCheckpointSha],
      ['tooling SHA', 'toolingSha', expected.toolingSha],
      ['source site', 'sourceSite', expected.sourceSite],
      ['target site', 'targetSite', expected.targetSite],
    ]
    if (manifest.stage !== 'translation') throw new Error('Checkpoint manifest translation stage mismatch')
    for (const [label, key, value] of fields) if (manifest[key] !== value) throw new Error(`Checkpoint manifest ${label} mismatch`)
  } else if (manifest.stage !== 'source' || Object.hasOwn(manifest, 'translationTarget')) {
    throw new Error('Checkpoint manifest source stage mismatch')
  }
  return manifest
}

function writeManifest(output, bytes) {
  if (typeof output !== 'string' || !path.isAbsolute(output) || /[\0\r\n]/.test(output)) throw new Error('manifest output must be an absolute path')
  const parent = path.dirname(output)
  const stat = fs.lstatSync(parent)
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(parent) !== path.resolve(parent)) throw new Error('manifest output parent must be a real directory')
  const descriptor = fs.openSync(output, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0), 0o600)
  try { fs.writeFileSync(descriptor, bytes) } finally { fs.closeSync(descriptor) }
}

function preflightCheckpointArchive(options) {
  const required = ['archive', 'manifestOutput', 'group', 'masterSha']
  for (const key of required) assertString(options?.[key], key)
  if (!SHA.test(options.masterSha)) throw new Error('masterSha must be an exact lowercase 40-character SHA')
  const translationKeys = ['translationTarget', 'sourceCheckpointSha', 'toolingSha', 'sourceSite', 'targetSite']
  const presentTranslationKeys = translationKeys.filter(key => options[key] !== undefined)
  if (presentTranslationKeys.length !== 0 && presentTranslationKeys.length !== translationKeys.length) throw new Error('translation identity flags must be provided together')
  if (options.translationTarget) {
    for (const key of ['translationTarget', 'sourceCheckpointSha', 'toolingSha', 'sourceSite', 'targetSite']) assertString(options[key], key)
    if (!SHA.test(options.sourceCheckpointSha) || !SHA.test(options.toolingSha)) throw new Error('translation identity SHAs must be exact lowercase 40-character SHAs')
  }
  const before = fs.lstatSync(options.archive)
  const entries = inspectArchive(options.archive)
  let bytes
  try { bytes = execFileSync('tar', ['-xOf', options.archive, MANIFEST_PATH], {maxBuffer: 2 * 1024 * 1024}) }
  catch (error) { throw new Error(`Unable to read checkpoint manifest: ${error.message}`) }
  const after = fs.lstatSync(options.archive)
  if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeMs !== after.mtimeMs) throw new Error('Checkpoint archive changed during preflight')
  let manifest
  try { manifest = JSON.parse(bytes.toString('utf8')) } catch (error) { throw new Error(`Checkpoint manifest is invalid JSON: ${error.message}`) }
  validateManifestIdentity(manifest, options)
  writeManifest(options.manifestOutput, bytes)
  return Object.freeze({manifest, entries})
}

function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return {help: true}
  const names = {
    archive: 'archive', 'manifest-output': 'manifestOutput', group: 'group', 'master-sha': 'masterSha',
    'translation-target': 'translationTarget', 'source-checkpoint-sha': 'sourceCheckpointSha', 'tooling-sha': 'toolingSha',
    'source-site': 'sourceSite', 'target-site': 'targetSite',
  }
  const result = {}
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index]
    if (!flag?.startsWith('--') || args[index + 1] === undefined || !Object.hasOwn(names, flag.slice(2)) || Object.hasOwn(result, names[flag.slice(2)])) throw new Error('Invalid preflight checkpoint archive arguments')
    result[names[flag.slice(2)]] = args[index + 1]
  }
  return result
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2))
    if (options.help) console.log('Usage: node preflight-checkpoint-archive.js --archive <tar> --manifest-output <file> --group <group> --master-sha <sha> [translation identity flags]')
    else preflightCheckpointArchive(options)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {inspectArchive, preflightCheckpointArchive, safeArchivePath, validateManifestIdentity}
