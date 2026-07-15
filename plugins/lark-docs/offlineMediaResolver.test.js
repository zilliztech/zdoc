'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createOfflineMediaResolver } = require('./offlineMediaResolver')

test('resolves Feishu image, board, and Figma entries to final URLs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-media-'))
  const manifestPath = path.join(root, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify({ schemaVersion: 1, entries: [
    { id: 'feishu-image:image', type: 'feishu-image', token: 'image', caption: 'Image', objectKey: 'image.png' },
    { id: 'feishu-board:board', type: 'feishu-board', token: 'board', objectKey: 'board.png' },
    { id: 'figma:key:1:2', type: 'figma', fileKey: 'key', nodeId: '1:2', caption: 'Diagram', objectKey: 'diagram.png' },
  ] }))
  const resolver = createOfflineMediaResolver({ manifestPath, imageBedUrl: 'https://images.test/root/' })
  assert.equal(resolver.resolveFeishuImage('image').url, 'https://images.test/root/image.png')
  assert.equal(resolver.resolveBoard('board').url, 'https://images.test/root/board.png')
  assert.equal(resolver.resolveFigma('key', '1:2').caption, 'Diagram')
})

test('throws MEDIA_PREFETCH_MISS without invoking an online fallback', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-media-'))
  const manifestPath = path.join(root, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify({ schemaVersion: 1, entries: [] }))
  const resolver = createOfflineMediaResolver({ manifestPath, imageBedUrl: 'https://images.test' })
  assert.throws(() => resolver.resolveFeishuImage('missing'), error => error.code === 'MEDIA_PREFETCH_MISS')
})
