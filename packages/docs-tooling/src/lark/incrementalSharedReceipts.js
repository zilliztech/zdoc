'use strict'

// Shared-page records satisfy source completeness through published receipts
// rather than Feishu body files. Incremental planning must therefore see the
// same receipts the source-cache gate accepted; without them every shared
// record counts as a missing canonical source and the planner degrades each
// English Guides fetch to a full fetch.
const fs = require('node:fs')
const path = require('node:path')
const { hashSnapshot } = require('./sourceCompleteness')

const SOURCE_CACHE_DIR = 'packages/docs-tooling/src/lark/meta/source-cache'

function sharedRecords(snapshot) {
  return (snapshot?.records || []).filter(record => record.source_kind === 'shared-page')
}

function receiptsFromSourceCacheManifest(workspace, sourceDirName, snapshot) {
  const manifestPath = path.join(workspace, SOURCE_CACHE_DIR, `${sourceDirName}-manifest.json`)
  if (!fs.lstatSync(manifestPath).isFile()) throw new Error('source cache manifest must be a regular file')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.manual !== 'guides' || manifest.snapshotHash !== hashSnapshot(snapshot)) {
    throw new Error('source cache manifest does not describe this snapshot')
  }
  if (!manifest.sharedReceipts || typeof manifest.sharedReceipts !== 'object' || Array.isArray(manifest.sharedReceipts)) {
    throw new Error('source cache manifest has no shared receipts')
  }
  return new Map(Object.entries(manifest.sharedReceipts))
}

function receiptsFromPublishedAuthority(workspace, snapshot) {
  return require('./sharedPagePublication').publishedEvidence(workspace, snapshot, {verifyFiles: false}).receipts
}

// Receipts are only located here; validateSourceCompleteness still authenticates
// every receipt against the snapshot record, so a stale or foreign receipt set
// degrades to the existing full-fetch decision instead of being trusted.
// `diagnostics` collects why each source was skipped for the caller's log.
function sharedReceiptsForPlanning({ workspace = process.cwd(), sourceDirName, snapshot, diagnostics = [] } = {}) {
  if (typeof sourceDirName !== 'string' || !sourceDirName || sourceDirName.includes('/') || sourceDirName.includes('\\')) {
    throw new Error('sourceDirName must be a bare source directory name')
  }
  if (sharedRecords(snapshot).length === 0) return new Map()
  const sources = [
    ['source cache manifest', () => receiptsFromSourceCacheManifest(workspace, sourceDirName, snapshot)],
    ['published shared authority', () => receiptsFromPublishedAuthority(workspace, snapshot)],
  ]
  for (const [label, source] of sources) {
    try {
      const receipts = source()
      if (receipts.size > 0) return receipts
      diagnostics.push(`${label}: no shared receipts recorded`)
    } catch (error) {
      diagnostics.push(`${label}: ${error.message}`)
    }
  }
  return new Map()
}

module.exports = { sharedReceiptsForPlanning }
