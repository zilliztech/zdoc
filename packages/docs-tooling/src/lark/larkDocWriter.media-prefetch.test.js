'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const LarkDocWriter = require('./larkDocWriter')

function writerFixture({ resolver = null, skip = false } = {}) {
  const calls = []
  const writer = Object.create(LarkDocWriter.prototype)
  writer.upload_to_s3 = true
  writer.skip_image_download = skip
  writer.imageDir = 'static/img'
  writer.iframes = []
  writer.mediaResolver = resolver
  writer.downloader = {
    target_path: 'static/img',
    async __downloadImage() { calls.push('download-image'); return Buffer.from('image') },
    async __downloadBoardPreview() { calls.push('download-board'); return Buffer.from('board') },
    async __fetchCaption(_key, node) { calls.push('fetch-caption'); return { nodes: { [node]: { document: { name: 'Online Diagram' } } } } },
    async __downloadIframe() { calls.push('download-figma'); return Buffer.from('figma') },
    async __uploadToS3(_buffer, key) { calls.push(`upload:${key}`) },
  }
  writer.__trim_white_borders = async buffer => buffer
  return { calls, writer }
}

test('default writer keeps online image, board, and Figma behavior', async () => {
  const { calls, writer } = writerFixture()
  await writer.__image({ token: 'image-token', caption: { content: 'Architecture' } })
  await writer.__board({ token: 'board-token' }, 0)
  await writer.__iframe({ block_id: 'iframe', iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/file-key/Name?node-id=1-2') } } })
  assert.deepEqual(calls, [
    'download-image', 'upload:architecture.png',
    'download-board', 'upload:board-token.png',
    'fetch-caption', 'download-figma', 'upload:Online Diagram.png',
  ])
})

test('skipImageDown preserves URLs while retaining online Figma caption lookup', async () => {
  const { calls, writer } = writerFixture({ skip: true })
  assert.match(await writer.__image({ token: 'image-token', caption: { content: 'Architecture' } }), /architecture\.png/)
  assert.match(await writer.__board({ token: 'board-token' }, 0), /board-token\.png/)
  assert.match(await writer.__iframe({ block_id: 'iframe', iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/file-key/Name?node-id=1-2') } } }), /Online%20Diagram\.png/)
  assert.deepEqual(calls, ['fetch-caption'])
})

test('explicit offline resolver renders media without downloader or S3 calls', async () => {
  const resolver = {
    resolveFeishuImage() { return { caption: 'Architecture', objectKey: 'architecture.png', url: 'https://images.test/architecture.png' } },
    resolveBoard() { return { objectKey: 'board.png', url: 'https://images.test/board.png' } },
    resolveFigma() { return { caption: 'System Diagram', objectKey: 'diagram.png', url: 'https://images.test/diagram.png' } },
  }
  const { calls, writer } = writerFixture({ resolver })
  assert.match(await writer.__image({ token: 'image-token', caption: { content: 'Architecture' } }), /images\.test\/architecture\.png/)
  assert.match(await writer.__board({ token: 'board-token' }, 0), /images\.test\/board\.png/)
  assert.match(await writer.__iframe({ block_id: 'iframe', iframe: { component: { iframe_type: 8, url: encodeURIComponent('https://www.figma.com/design/file-key/Name?node-id=1-2') } } }), /images\.test\/diagram\.png/)
  assert.deepEqual(calls, [])
})
