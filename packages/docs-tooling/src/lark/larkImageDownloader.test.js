'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const LarkImageDownloader = require('./larkImageDownloader')

function withEnvironment(values, run) {
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]))
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  try {
    return run()
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

test('selects Aliyun OSS when the Chinese storage environment is complete', () => {
  withEnvironment({
    OSS_ACCESS_KEY_ID: 'test-id',
    OSS_ACCESS_KEY_SECRET: 'test-secret',
    OSS_REGION: 'oss-cn-hangzhou',
    OSS_BUCKET: 'test-bucket',
    OSS_ENDPOINT: 'https://oss-cn-hangzhou.aliyuncs.com',
  }, () => {
    const downloader = new LarkImageDownloader({}, os.tmpdir(), {
      createOssClient: options => ({options}),
    })
    try {
      assert.equal(downloader.storageKind, 'oss')
      assert.equal(downloader.client.options.bucket, 'test-bucket')
      assert.equal(downloader.client.options.authorizationV4, true)
    } finally {
      downloader.destroy()
    }
  })
})

test('__uploadToS3 delegates to Aliyun OSS for compatibility', async () => {
  await withEnvironment({
    OSS_ACCESS_KEY_ID: 'test-id',
    OSS_ACCESS_KEY_SECRET: 'test-secret',
    OSS_REGION: 'oss-cn-hangzhou',
    OSS_BUCKET: 'test-bucket',
    OSS_ENDPOINT: 'https://oss-cn-hangzhou.aliyuncs.com',
  }, async () => {
    const calls = []
    const downloader = new LarkImageDownloader({}, os.tmpdir(), {
      createOssClient: () => ({
        async getObjectTagging() {
          const error = new Error('missing')
          error.code = 'NoSuchKey'
          throw error
        },
        async put(key, buffer, options) {
          calls.push({key, buffer, options})
        },
      }),
    })
    try {
      const buffer = Buffer.from('image')
      await downloader.__uploadToS3(buffer, 'image.png')
      assert.equal(calls.length, 1)
      assert.equal(calls[0].key, 'image.png')
      assert.equal(calls[0].buffer, buffer)
      assert.equal(calls[0].options.headers['x-oss-object-acl'], 'public-read')
    } finally {
      downloader.destroy()
    }
  })
})

test('does not read Guides media manifest environment variables', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-media-manifest-'))
  const previousPath = process.env.GUIDES_MEDIA_MANIFEST
  const previousStrict = process.env.GUIDES_MEDIA_PREFETCH_REQUIRED
  process.env.GUIDES_MEDIA_MANIFEST = path.join(root, 'missing.json')
  process.env.GUIDES_MEDIA_PREFETCH_REQUIRED = 'true'
  const downloader = new LarkImageDownloader({}, root)
  try {
    assert.equal(typeof downloader.__prefetchedMedia, 'undefined')
  } finally {
    downloader.destroy()
    if (previousPath === undefined) delete process.env.GUIDES_MEDIA_MANIFEST
    else process.env.GUIDES_MEDIA_MANIFEST = previousPath
    if (previousStrict === undefined) delete process.env.GUIDES_MEDIA_PREFETCH_REQUIRED
    else process.env.GUIDES_MEDIA_PREFETCH_REQUIRED = previousStrict
  }
})

test('routes Figma API work through its dedicated limiter', async () => {
  assert.match(LarkImageDownloader.prototype.__fetchCaption.toString(), /__scheduleFigmaApi/)
  assert.match(LarkImageDownloader.prototype.__downloadIframe.toString(), /__scheduleFigmaApi/)
  const downloader = new LarkImageDownloader({}, os.tmpdir())
  let scheduled = 0
  downloader.figmaLimiter = {
    async schedule(task) {
      scheduled += 1
      return await task()
    },
  }
  try {
    const result = await downloader.__scheduleFigmaApi(async () => 'figma-response')
    assert.equal(result, 'figma-response')
    assert.equal(scheduled, 1)
  } finally {
    downloader.destroy()
  }
})
