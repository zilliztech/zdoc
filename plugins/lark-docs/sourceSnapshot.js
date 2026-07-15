const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {
  extractContentLinks,
  canonicalRecordsFrom,
  sourceTokenAliases,
  plainValue,
  docField,
  docLink,
  docTitle,
  contentLinkTarget,
} = require('./canonicalLinkAuditor')
const {
  guidesPlacementType,
  guidesRecordPublishTargets,
  guidesRecordRefTarget,
} = require('./guidesBaseRecordSemantics')

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

function readJsonIfExists(file) {
  if (!file || !fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function readSnapshot(file) {
  return readJsonIfExists(file)
}

function writeSnapshot(file, snapshot) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2))
}

function isSafeRelativePath(value) {
  return typeof value === 'string'
    && value !== ''
    && !path.isAbsolute(value)
    && !value.split('/').some(part => part === '' || part === '.' || part === '..')
}

function validateCandidateSnapshot(candidate, expected = {}) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new Error('Candidate snapshot must be an object')
  if (typeof candidate.manual !== 'string' || !candidate.manual) throw new Error('Candidate snapshot manual is required')
  if (expected.manual && candidate.manual !== expected.manual) throw new Error('Candidate snapshot manual mismatch')
  const expectedSchemaVersion = candidate.manual === 'guides' ? 3 : 2
  if (candidate.schema_version !== expectedSchemaVersion) throw new Error(`Candidate snapshot schema version must be ${expectedSchemaVersion}`)
  if (typeof candidate.build_env !== 'string' || !candidate.build_env) throw new Error('Candidate snapshot build environment is required')
  if (expected.buildEnv && candidate.build_env !== expected.buildEnv) throw new Error('Candidate snapshot build environment mismatch')
  if (typeof candidate.source_dir !== 'string' || !candidate.source_dir) throw new Error('Candidate snapshot source directory is required')
  if (expected.sourceDir && path.resolve(candidate.source_dir) !== path.resolve(expected.sourceDir)) throw new Error('Candidate snapshot source directory mismatch')
  if (typeof candidate.base_app_token !== 'string' || !candidate.base_app_token) throw new Error('Candidate snapshot Base application token is required')
  if (expected.baseAppToken && candidate.base_app_token !== expected.baseAppToken) throw new Error('Candidate snapshot Base application token mismatch')
  if (!Number.isFinite(Date.parse(candidate.generated_at))) throw new Error('Candidate snapshot generated timestamp is invalid')
  if (!Array.isArray(candidate.records) || candidate.records.length === 0) throw new Error('Candidate snapshot records must be a non-empty array')
  const recordIds = new Set(), docTokens = new Set()
  for (const record of candidate.records) {
    if (!record || typeof record !== 'object' || typeof record.record_id !== 'string' || !record.record_id) throw new Error('Candidate snapshot record ID is required')
    if (typeof record.doc_token !== 'string' || !record.doc_token) throw new Error('Candidate snapshot document token is required')
    if (recordIds.has(record.record_id) || docTokens.has(record.doc_token)) throw new Error('Candidate snapshot contains duplicate records')
    recordIds.add(record.record_id); docTokens.add(record.doc_token)
    if (typeof record.source_file !== 'string' || !record.source_file) throw new Error(`Candidate snapshot source file is required for ${record.doc_token}`)
    if (!/^[0-9a-f]{64}$/.test(record.source_hash || '')) throw new Error(`Candidate snapshot source hash is invalid for ${record.doc_token}`)
    if (!Array.isArray(record.outgoing_tokens)) throw new Error(`Candidate snapshot outgoing tokens are invalid for ${record.doc_token}`)
    if (record.output_paths !== undefined && !Array.isArray(record.output_paths)) throw new Error(`Candidate snapshot output paths are invalid for ${record.doc_token}`)
    for (const outputPath of record.output_paths || []) {
      if (!isSafeRelativePath(outputPath)) throw new Error(`Candidate snapshot output path is invalid for ${record.doc_token}: ${outputPath}`)
    }
  }
  if (candidate.manual === 'guides') {
    if (!Array.isArray(candidate.navigation_records)) throw new Error('Candidate snapshot navigation records are required for Guides')
    if (!candidate.table_digests || typeof candidate.table_digests !== 'object' || Array.isArray(candidate.table_digests)) throw new Error('Candidate snapshot table digests are required for Guides')
    const navigationRecordIds = new Set()
    for (const record of candidate.navigation_records) {
      if (!record || typeof record.record_id !== 'string' || !record.record_id) throw new Error('Candidate snapshot navigation record ID is required')
      if (navigationRecordIds.has(record.record_id)) throw new Error('Candidate snapshot contains duplicate navigation records')
      navigationRecordIds.add(record.record_id)
      if (typeof record.table_id !== 'string' || !record.table_id) throw new Error(`Candidate snapshot navigation table ID is required for ${record.record_id}`)
      if (!['canonical', 'section', 'link', 'ref'].includes(record.placement_type)) throw new Error(`Candidate snapshot navigation placement is invalid for ${record.record_id}`)
    }
    for (const [tableId, digest] of Object.entries(candidate.table_digests)) {
      if (!tableId || !/^[0-9a-f]{64}$/.test(digest || '')) throw new Error(`Candidate snapshot table digest is invalid for ${tableId || 'unknown table'}`)
    }
  }
  return candidate
}

function promoteCandidateSnapshot(candidate, options) {
  validateCandidateSnapshot(candidate, options)
  if (!Array.isArray(options.targetsBuilt) || options.targetsBuilt.length === 0 || options.targetsBuilt.some(value => typeof value !== 'string' || !value)) throw new Error('targetsBuilt must be a non-empty string array')
  for (const name of ['sourceBranch', 'publishUrl', 'linkCheckRemote']) if (typeof options[name] !== 'string' || !options[name]) throw new Error(`${name} is required`)
  return {
    ...JSON.parse(JSON.stringify(candidate)),
    targets_built: [...options.targetsBuilt],
    source_branch: options.sourceBranch,
    publish_url: options.publishUrl,
    link_check_remote: options.linkCheckRemote,
  }
}

function sourceFilesByToken(docSourceDir) {
  const byToken = new Map()
  if (!fs.existsSync(docSourceDir)) return byToken
  for (const file of fs.readdirSync(docSourceDir).filter(item => item.endsWith('.json'))) {
    const filePath = path.join(docSourceDir, file)
    const raw = fs.readFileSync(filePath, 'utf8')
    const source = JSON.parse(raw)
    source.__source_file = file
    source.__source_hash = hashText(raw)
    for (const token of sourceTokenAliases(source)) {
      byToken.set(token, source)
    }
  }
  return byToken
}

function outputPathsByTokenFromDirs({ outputDirs, cwd = process.cwd() }) {
  const root = path.resolve(cwd)
  const byToken = new Map()
  for (const outputDir of outputDirs || []) {
    if (!isSafeRelativePath(outputDir)) throw new Error(`Invalid output directory: ${outputDir}`)
    const absoluteOutputDir = path.resolve(root, ...outputDir.split('/'))
    if (!absoluteOutputDir.startsWith(`${root}${path.sep}`) || !fs.existsSync(absoluteOutputDir)) continue
    const stack = [absoluteOutputDir]
    while (stack.length > 0) {
      const directory = stack.pop()
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
          stack.push(entryPath)
          continue
        }
        if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue
        const content = fs.readFileSync(entryPath, 'utf8')
        const match = content.match(/^token:\s*['"]?([^'"\r\n]+)['"]?\s*$/m)
        const token = match?.[1]?.trim()
        if (!token) continue
        const relativePath = path.relative(root, entryPath).split(path.sep).join('/')
        if (!byToken.has(token)) byToken.set(token, [])
        byToken.get(token).push(relativePath)
      }
    }
  }
  for (const [token, outputPaths] of byToken) {
    byToken.set(token, [...new Set(outputPaths)].sort())
  }
  return byToken
}

function recordToken(record) {
  const link = docLink(docField(record.fields || {}))
  if (!link) return null
  const target = contentLinkTarget(link)
  if (target?.token) return target.token
  try {
    return new URL(link).pathname.split('/').filter(Boolean).pop() || null
  } catch (_) {
    return null
  }
}

function parentRecordIds(record) {
  const values = Array.isArray(record.fields?.Parent) ? record.fields.Parent : record.fields?.Parent == null ? [] : [record.fields.Parent]
  return values.flatMap(value => {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value?.record_ids)) return value.record_ids
    return [value?.record_id || value?.id].filter(Boolean)
  }).sort()
}

function navigationOrder(record) {
  const explicit = plainValue(record.fields?.['Sidebar Order'] ?? record.fields?.['Nav Order'] ?? record.fields?.Order)
  return explicit != null && explicit !== '' && Number.isFinite(Number(explicit)) ? Number(explicit) : Number(record.base_record_index || 0)
}

function createGuidesNavigationState(records) {
  const navigationRecords = (records || []).map(record => {
    const fields = record.fields || {}
    const placementType = guidesPlacementType(record, { guidesMode: true })
    const doc = docField(fields)
    const link = docLink(doc)
    const refTarget = guidesRecordRefTarget(record)
    const refLink = typeof refTarget === 'string' ? refTarget : null
    return {
      record_id: record.record_id,
      table_id: record.base_table_id,
      table_name: record.base_table_name || null,
      placement_type: placementType,
      parent_record_ids: parentRecordIds(record),
      order: navigationOrder(record),
      title: docTitle(doc) || plainValue(fields.Labels) || record.record_id,
      labels: plainValue(fields.Labels) || '',
      slug: plainValue(fields.Slug) || '',
      targets: guidesRecordPublishTargets(record).sort(),
      progress: plainValue(fields.Progress ?? fields.Status) || '',
      doc_token: recordToken(record),
      doc_link: link || '',
      ref_target: refTarget || null,
      ref_target_token: refLink ? (contentLinkTarget(refLink)?.token || null) : null,
    }
  }).filter(record => record.record_id && record.table_id && record.placement_type)
    .sort((a, b) => a.table_id.localeCompare(b.table_id) || a.order - b.order || a.record_id.localeCompare(b.record_id))

  const recordsByTable = new Map()
  for (const record of navigationRecords) {
    if (!recordsByTable.has(record.table_id)) recordsByTable.set(record.table_id, [])
    recordsByTable.get(record.table_id).push(record)
  }
  const tableDigests = Object.fromEntries([...recordsByTable.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tableId, tableRecords]) => [tableId, hashText(JSON.stringify(tableRecords))]))
  return { navigationRecords, tableDigests }
}

function createSourceSnapshot({
  manualName,
  targetsBuilt = [],
  buildEnv = null,
  sourceBranch = null,
  publishUrl = null,
  linkCheckRemote = 'https://docs.zilliz.com',
  docSourceDir,
  baseAppToken = null,
  records,
  nodeMetadataByToken = new Map(),
  outputPathsByToken = new Map(),
}) {
  const sourceByToken = sourceFilesByToken(docSourceDir)
  const canonicalRecords = canonicalRecordsFrom(records, { guidesPublishableOnly: manualName === 'guides' })
  const guidesNavigation = manualName === 'guides' ? createGuidesNavigationState(records) : null
  const snapshot = {
    schema_version: manualName === 'guides' ? 3 : 2,
    manual: manualName,
    targets_built: targetsBuilt,
    build_env: buildEnv,
    source_branch: sourceBranch,
    publish_url: publishUrl,
    link_check_remote: linkCheckRemote,
    generated_at: new Date().toISOString(),
    source_dir: docSourceDir,
    base_app_token: baseAppToken,
    records: canonicalRecords.map(record => {
      const source = sourceByToken.get(record.doc_token)
      const outgoingTokens = source ? extractContentLinks(source).map(link => link.token) : []
      const nodeMetadata = nodeMetadataByToken.get(record.doc_token) || null
      return {
        record_id: record.record_id,
        table_id: record.table_id,
        table_name: record.table_name,
        placement_type: 'canonical',
        title: record.title,
        slug: record.slug,
        doc_token: record.doc_token,
        doc_link: record.doc_link,
        source_file: source?.__source_file || null,
        source_hash: source?.__source_hash || null,
        node_metadata: nodeMetadata,
        node_token: nodeMetadata?.node_token || source?.node_token || null,
        origin_node_token: nodeMetadata?.origin_node_token || source?.origin_node_token || null,
        obj_token: nodeMetadata?.obj_token || source?.obj_token || null,
        obj_type: nodeMetadata?.obj_type || source?.obj_type || null,
        obj_edit_time: nodeMetadata?.obj_edit_time || source?.obj_edit_time || null,
        revision_id: nodeMetadata?.revision_id || source?.revision_id || null,
        outgoing_tokens: [...new Set(outgoingTokens)].sort(),
        output_paths: [...new Set(outputPathsByToken.get(record.doc_token) || [])].sort(),
      }
    }),
  }
  if (guidesNavigation) {
    snapshot.navigation_records = guidesNavigation.navigationRecords
    snapshot.table_digests = guidesNavigation.tableDigests
  }
  return snapshot
}

module.exports = {
  createSourceSnapshot,
  promoteCandidateSnapshot,
  readSnapshot,
  validateCandidateSnapshot,
  writeSnapshot,
  sourceFilesByToken,
  outputPathsByTokenFromDirs,
  createGuidesNavigationState,
  hashText,
}
