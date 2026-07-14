#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { hashSnapshot, assertSourceCompleteness } = require('../../plugins/lark-docs/sourceCompleteness')

function readSnapshot(snapshotPath) { return JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) }
function sha(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex') }
function sourceCacheKey(snapshotPath) { return `guides-source-v1-${hashSnapshot(readSnapshot(snapshotPath))}` }

function sourceFiles(sourceDir) {
  return fs.readdirSync(sourceDir).filter(file => file.endsWith('.json')).sort().map(file => {
    const full = path.join(sourceDir, file), stat = fs.lstatSync(full)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Unsafe source cache file: ${file}`)
    const bytes = fs.readFileSync(full)
    return { path: file, size: bytes.length, sha256: sha(bytes) }
  })
}

function createSourceCacheManifest({ sourceDir, snapshotPath, manifestPath, rootToken }) {
  const snapshot = readSnapshot(snapshotPath)
  assertSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken, sourceDir, snapshot })
  const manifest = {
    schemaVersion: 1,
    manual: 'guides',
    buildEnv: 'uat',
    snapshotHash: hashSnapshot(snapshot),
    createdAt: new Date().toISOString(),
    files: sourceFiles(sourceDir),
  }
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  const temporary = `${manifestPath}.${process.pid}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
  fs.renameSync(temporary, manifestPath)
  return manifest
}

function validateSourceCache({ sourceDir, snapshotPath, manifestPath, rootToken }) {
  const snapshot = readSnapshot(snapshotPath), manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.schemaVersion !== 1 || manifest.manual !== 'guides' || manifest.buildEnv !== 'uat') throw new Error('Source cache manifest identity is invalid')
  if (manifest.snapshotHash !== hashSnapshot(snapshot)) throw new Error('Source cache snapshot identity mismatch')
  const actual = sourceFiles(sourceDir)
  if (JSON.stringify(actual) !== JSON.stringify(manifest.files)) throw new Error('Source cache is invalid: file manifest mismatch')
  return assertSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken, sourceDir, snapshot })
}

function args(argv) {
  const operation = argv.shift(), result = { operation }
  while (argv.length) { const key = argv.shift(), value = argv.shift(); if (!key?.startsWith('--') || value === undefined) throw new Error('Invalid arguments'); result[key.slice(2)] = value }
  return result
}

if (require.main === module) {
  try {
    const input = args(process.argv.slice(2))
    if (input.operation === 'key') process.stdout.write(sourceCacheKey(input.snapshot))
    else if (input.operation === 'create') createSourceCacheManifest({ sourceDir: input['source-dir'], snapshotPath: input.snapshot, manifestPath: input.output, rootToken: input['root-token'] })
    else if (input.operation === 'validate') validateSourceCache({ sourceDir: input['source-dir'], snapshotPath: input.snapshot, manifestPath: input.manifest, rootToken: input['root-token'] })
    else throw new Error('Unknown operation')
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { sourceCacheKey, createSourceCacheManifest, validateSourceCache }
