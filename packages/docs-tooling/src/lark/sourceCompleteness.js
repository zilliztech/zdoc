'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
  return value
}

function hashSnapshot(snapshot) {
  return crypto.createHash('sha256').update(JSON.stringify(stable(snapshot))).digest('hex')
}

function inside(parent, child) {
  const relative = path.relative(parent, child)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function aliases(record) {
  return [record.doc_token, record.node_token, record.origin_node_token, record.obj_token].filter(Boolean)
}

function isRenderableCanonicalSource(source) {
  if (!source || source.base_nav_virtual) return false
  const blocks = source.blocks?.items
  if (!Array.isArray(blocks) || blocks.length === 0) return false
  if (!blocks.some(block => block.block_type === 1)) return false
  return blocks.some(block => block.block_type !== 1)
}

function validateSourceCompleteness({ manual, buildEnv, rootToken, sourceDir, snapshot }) {
  const result = {
    complete: false,
    snapshotHash: hashSnapshot(snapshot || {}),
    expectedCanonicalSources: 0,
    validCanonicalSources: 0,
    missingFiles: [],
    corruptFiles: [],
    hashMismatches: [],
    tokenMismatches: [],
    nonRenderableCanonicalFiles: [],
    unsafeFiles: [],
    identityErrors: [],
    rootError: null,
  }
  if (!snapshot || snapshot.manual !== manual) result.identityErrors.push(`manual:${snapshot?.manual || 'missing'}`)
  if (!snapshot || snapshot.build_env !== buildEnv) result.identityErrors.push(`build_env:${snapshot?.build_env || 'missing'}`)

  const sourceRoot = path.resolve(sourceDir)
  const rootFile = path.join(sourceRoot, `${rootToken}.json`)
  try {
    const stat = fs.lstatSync(rootFile)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('unsafe root source')
    const root = JSON.parse(fs.readFileSync(rootFile, 'utf8'))
    if (!Array.isArray(root.children) || root.children.length === 0) throw new Error('root source has no navigation children')
  } catch (error) {
    result.rootError = fs.existsSync(rootFile) ? error.message : 'missing root source'
  }

  const records = (snapshot?.records || []).filter(record => record.placement_type === 'canonical' && record.source_file)
  result.expectedCanonicalSources = records.length
  for (const record of records) {
    const relative = record.source_file
    const file = path.resolve(sourceRoot, relative)
    if (!inside(sourceRoot, file)) { result.unsafeFiles.push(relative); continue }
    let stat
    try { stat = fs.lstatSync(file) } catch (error) {
      if (error.code === 'ENOENT') result.missingFiles.push(relative)
      else result.unsafeFiles.push(relative)
      continue
    }
    if (!stat.isFile() || stat.isSymbolicLink()) { result.unsafeFiles.push(relative); continue }
    const bytes = fs.readFileSync(file)
    if (record.source_hash && crypto.createHash('sha256').update(bytes).digest('hex') !== record.source_hash) result.hashMismatches.push(relative)
    let source
    try { source = JSON.parse(bytes) } catch (_) { result.corruptFiles.push(relative); continue }
    const sourceAliases = [source.node_token, source.origin_node_token, source.obj_token, source.token].filter(Boolean)
    if (!aliases(record).some(token => sourceAliases.includes(token))) result.tokenMismatches.push(relative)
    if (!isRenderableCanonicalSource(source)) result.nonRenderableCanonicalFiles.push(relative)
    if (
      !result.hashMismatches.includes(relative) &&
      !result.tokenMismatches.includes(relative) &&
      !result.nonRenderableCanonicalFiles.includes(relative)
    ) result.validCanonicalSources++
  }
  for (const key of ['missingFiles', 'corruptFiles', 'hashMismatches', 'tokenMismatches', 'nonRenderableCanonicalFiles', 'unsafeFiles', 'identityErrors']) result[key].sort()
  result.complete = !result.rootError && result.identityErrors.length === 0 && result.validCanonicalSources === result.expectedCanonicalSources
  return result
}

function assertSourceCompleteness(options) {
  const result = validateSourceCompleteness(options)
  if (!result.complete) {
    const samples = [...result.missingFiles, ...result.corruptFiles, ...result.hashMismatches, ...result.tokenMismatches, ...result.nonRenderableCanonicalFiles, ...result.unsafeFiles].slice(0, 5)
    throw new Error(`Lark source graph is incomplete: ${result.validCanonicalSources}/${result.expectedCanonicalSources} canonical sources valid${result.rootError ? `; root: ${result.rootError}` : ''}${samples.length ? `; sample: ${samples.join(', ')}` : ''}`)
  }
  return result
}

module.exports = { hashSnapshot, isRenderableCanonicalSource, validateSourceCompleteness, assertSourceCompleteness }
