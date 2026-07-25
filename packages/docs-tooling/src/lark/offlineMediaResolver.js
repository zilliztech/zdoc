'use strict'

const fs = require('node:fs')

function miss(id) {
  const error = new Error(`Prefetched media is missing: ${id}`)
  error.code = 'MEDIA_PREFETCH_MISS'
  throw error
}

function createOfflineMediaResolver({ manifestPath, imageBedUrl }) {
  if (!manifestPath) throw new Error('offline media manifestPath is required')
  if (!imageBedUrl) throw new Error('offline media imageBedUrl is required')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.entries)) throw new Error('Invalid guides media manifest')
  const entries = new Map()
  const root = String(imageBedUrl).replace(/\/+$/, '')
  for (const entry of manifest.entries) {
    if (!entry?.id || entries.has(entry.id)) throw new Error('Guides media manifest requires unique ids')
    if (!entry.objectKey || entry.objectKey.includes('/') || entry.objectKey.includes('..')) throw new Error(`Unsafe media object key: ${entry.objectKey || entry.id}`)
    entries.set(entry.id, Object.freeze({ ...entry, url: `${root}/${encodeURIComponent(entry.objectKey)}` }))
  }
  const resolve = id => entries.get(id) || miss(id)
  return Object.freeze({
    resolveFeishuImage: token => resolve(`feishu-image:${token}`),
    resolveBoard: token => resolve(`feishu-board:${token}`),
    resolveFigma: (fileKey, nodeId) => resolve(`figma:${fileKey}:${nodeId}`),
  })
}

module.exports = { createOfflineMediaResolver }
