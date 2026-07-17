#!/usr/bin/env node
'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')

const RECORD_FIELDS = Object.freeze([
  'record_id', 'placement_type', 'source_file', 'source_hash', 'doc_token',
  'node_token', 'origin_node_token', 'obj_token', 'obj_type',
])
const NAVIGATION_FIELDS = Object.freeze([
  'record_id', 'table_id', 'table_name', 'placement_type', 'order', 'title', 'labels', 'slug',
  'progress', 'doc_token', 'doc_link', 'ref_target', 'ref_target_token',
])

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')) }
function valueOrNull(value) { return value === undefined ? null : value }
function sortedStrings(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  if (value.some(item => typeof item !== 'string')) throw new Error(`${label} must contain strings`)
  return [...new Set(value)].sort()
}

function semanticGuidesSnapshotProjection(snapshot) {
  if (!snapshot || snapshot.schema_version !== 3 || snapshot.manual !== 'guides' || typeof snapshot.build_env !== 'string' || !snapshot.build_env || typeof snapshot.base_app_token !== 'string' || !snapshot.base_app_token) {
    throw new Error('Stable Guides cache identity requires a Guides schema v3 snapshot')
  }
  if (!Array.isArray(snapshot.records) || !Array.isArray(snapshot.navigation_records) || !snapshot.table_digests || typeof snapshot.table_digests !== 'object' || Array.isArray(snapshot.table_digests)) {
    throw new Error('Stable Guides cache identity requires source, navigation, and table identity')
  }
  const records = snapshot.records.map(record => {
    if (!record || typeof record.record_id !== 'string' || !record.record_id) throw new Error('Stable Guides record identity requires record_id')
    const projected = Object.fromEntries(RECORD_FIELDS.map(field => [field, valueOrNull(record[field])]))
    projected.outgoing_tokens = sortedStrings(record.outgoing_tokens || [], `Guides record ${record.record_id} outgoing_tokens`)
    return projected
  }).sort((left, right) => left.record_id.localeCompare(right.record_id))

  const navigation = snapshot.navigation_records.map(record => {
    if (!record || typeof record.record_id !== 'string' || typeof record.table_id !== 'string' || !Number.isFinite(Number(record.order))) {
      throw new Error('Stable Guides navigation identity requires record_id, table_id, and numeric order')
    }
    const projected = Object.fromEntries(NAVIGATION_FIELDS.map(field => [field, field === 'order' ? Number(record.order) : valueOrNull(record[field])]))
    projected.parent_record_ids = sortedStrings(record.parent_record_ids || [], `Guides navigation ${record.record_id} parent_record_ids`)
    projected.targets = sortedStrings(record.targets || [], `Guides navigation ${record.record_id} targets`)
    return projected
  }).sort((left, right) => left.table_id.localeCompare(right.table_id) || left.order - right.order || left.record_id.localeCompare(right.record_id))

  const tableDigests = Object.entries(snapshot.table_digests).sort(([left], [right]) => left.localeCompare(right)).map(([tableId, digest]) => {
    if (typeof digest !== 'string' || !digest) throw new Error(`Stable Guides table identity is invalid: ${tableId}`)
    return { tableId, digest }
  })
  return {
    projectionVersion: 1,
    schema_version: snapshot.schema_version,
    manual: snapshot.manual,
    build_env: snapshot.build_env,
    base_app_token: valueOrNull(snapshot.base_app_token),
    records,
    navigation_records: navigation,
    table_digests: tableDigests,
  }
}

function semanticGuidesSnapshotHash(snapshotPath) {
  return crypto.createHash('sha256').update(JSON.stringify(semanticGuidesSnapshotProjection(readJson(snapshotPath)))).digest('hex')
}

function cacheSaveRequired({ cacheVersion, prefetchMode, candidateSnapshotPath, baselineSnapshotPath }) {
  if (!['v4', 'v3', 'v2', 'v1', 'none'].includes(cacheVersion)) throw new Error('Invalid Guides cache version')
  if (!['incremental', 'recovery'].includes(prefetchMode)) throw new Error('Invalid Guides media prefetch mode')
  const candidateHash = semanticGuidesSnapshotHash(candidateSnapshotPath)
  if (cacheVersion !== 'v4' || prefetchMode === 'recovery' || !fs.existsSync(baselineSnapshotPath)) return true
  try { return candidateHash !== semanticGuidesSnapshotHash(baselineSnapshotPath) } catch { return true }
}

function parseArgs(argv) {
  const [operation, ...values] = argv
  if (operation !== 'decide') throw new Error('Usage: decide --cache-version <version> --prefetch-mode <mode> --candidate <file> --baseline <file>')
  const required = new Set(['cache-version', 'prefetch-mode', 'candidate', 'baseline'])
  const args = {}
  for (let index = 0; index < values.length; index += 2) {
    const flag = values[index], value = values[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Missing or invalid argument')
    const key = flag.slice(2)
    if (!required.has(key) || Object.hasOwn(args, key) || !value || /[\0\r\n]/.test(value)) throw new Error(`Invalid argument: ${flag}`)
    args[key] = value
  }
  for (const key of required) if (!Object.hasOwn(args, key)) throw new Error(`Missing required argument: --${key}`)
  return args
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  process.stdout.write(`${cacheSaveRequired({
    cacheVersion: args['cache-version'],
    prefetchMode: args['prefetch-mode'],
    candidateSnapshotPath: args.candidate,
    baselineSnapshotPath: args.baseline,
  })}\n`)
}

if (require.main === module) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = { cacheSaveRequired, semanticGuidesSnapshotHash, semanticGuidesSnapshotProjection }
