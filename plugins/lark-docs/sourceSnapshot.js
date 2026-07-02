const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const {
  extractContentLinks,
  canonicalRecordsFrom,
  sourceTokenAliases,
} = require('./canonicalLinkAuditor')

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
}) {
  const sourceByToken = sourceFilesByToken(docSourceDir)
  const canonicalRecords = canonicalRecordsFrom(records)
  return {
    schema_version: 2,
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
      }
    }),
  }
}

module.exports = {
  createSourceSnapshot,
  readSnapshot,
  writeSnapshot,
  sourceFilesByToken,
  hashText,
}
