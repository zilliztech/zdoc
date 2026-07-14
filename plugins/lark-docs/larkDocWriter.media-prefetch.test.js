'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const LarkDocWriter = require('./larkDocWriter')

function createWriter(entries, { strict = true } = {}) {
  const calls = []
  const byId = new Map(entries.map(entry => [entry.id, entry]))
  const writer = Object.create(LarkDocWriter.prototype)
  writer.upload_to_s3 = true
  writer.skip_image_download = false
  writer.imageDir = 'static/img'
  writer.iframes = []
  writer.downloader = {
    __prefetchedMedia(id) {
      const entry = byId.get(id) || null
      if (!entry && strict) {
        const error = new Error(`Prefetched media is missing: ${id}`)
        error.code = 'MEDIA_PREFETCH_MISS'
        throw error
      }
      return entry
    },
    async __downloadImage() { calls.push('download-image') },
    async __downloadBoardPreview() { calls.push('download-board') },
    async __fetchCaption() { calls.push('fetch-caption') },
    async __downloadIframe() { calls.push('download-figma') },
    async __uploadToS3() { calls.push('upload') },
  }
  return { calls, writer }
}

test('renders prefetched Feishu images and boards without downloading binaries', async () => {
  const { calls, writer } = createWriter([
    { id: 'feishu-image:image-token', objectKey: 'architecture.png' },
    { id: 'feishu-board:board-token', objectKey: 'board-token.png' },
  ])

  assert.match(await writer.__image({ token: 'image-token', caption: { content: 'Architecture' } }), /\/architecture\.png/)
  assert.match(await writer.__board({ token: 'board-token' }, 2), /\/board-token\.png/)
  assert.deepEqual(calls, [])
})

test('renders prefetched Figma media without calling Figma or S3', async () => {
  const { calls, writer } = createWriter([
    { id: 'figma:file-key:1:2', caption: 'System Diagram', objectKey: 'system-diagram.png' },
  ])
  const block = {
    block_id: 'iframe-block',
    iframe: {
      component: {
        iframe_type: 8,
        url: encodeURIComponent('https://www.figma.com/design/file-key/Name?node-id=1-2'),
      },
    },
  }

  const markdown = await writer.__iframe(block)

  assert.match(markdown, /!\[System Diagram\]\([^)]*\/system-diagram\.png/)
  assert.deepEqual(calls, [])
})

test('strict media misses fail immediately instead of entering downloader retries', async () => {
  const { calls, writer } = createWriter([])

  await assert.rejects(writer.__image({ token: 'missing', caption: { content: 'Missing' } }), error => error.code === 'MEDIA_PREFETCH_MISS')
  assert.deepEqual(calls, [])
})
