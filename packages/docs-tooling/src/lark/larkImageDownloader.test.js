'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
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

async function withMockedFetch(mockedFetch, run) {
  const originalLoad = Module._load
  const envKeys = [
    'FEISHU_RETRY_ATTEMPTS',
    'FEISHU_RETRY_DELAY_MS',
    'GUIDES_MEDIA_FETCH_TIMEOUT_MS',
    'FEISHU_HOST',
    'APP_ID',
    'APP_SECRET',
    'AWS_BUCKET',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
  ]
  const previous = Object.fromEntries(envKeys.map(key => [key, process.env[key]]))
  process.env.FEISHU_RETRY_ATTEMPTS = '3'
  process.env.FEISHU_RETRY_DELAY_MS = '1'
  process.env.GUIDES_MEDIA_FETCH_TIMEOUT_MS = '25'
  process.env.FEISHU_HOST = 'https://open.feishu.cn'
  process.env.APP_ID = 'app'
  process.env.APP_SECRET = 'secret'
  process.env.AWS_BUCKET = 'bucket'
  process.env.AWS_REGION = 'us-west-2'
  process.env.AWS_ACCESS_KEY_ID = 'id'
  process.env.AWS_SECRET_ACCESS_KEY = 'secret'
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'node-fetch') {
      return mockedFetch
    }
    return originalLoad.apply(this, arguments)
  }
  delete require.cache[require.resolve('./feishuFetch')]
  delete require.cache[require.resolve('./larkImageDownloader')]
  try {
    const Downloader = require('./larkImageDownloader')
    await run(new Downloader({}, os.tmpdir(), {
      maxConcurrent: 1,
      minTime: 0,
      figmaMaxConcurrent: 1,
      figmaMinTime: 0,
    }))
  } finally {
    Module._load = originalLoad
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    delete require.cache[require.resolve('./feishuFetch')]
    delete require.cache[require.resolve('./larkImageDownloader')]
  }
}

test('caption requests arm the per-attempt timeout and retry with a fresh signal', async () => {
  const signals = []
  const optionKeys = []
  let attempts = 0
  const tokenResponse = {
    status: 200,
    headers: { get: () => null },
    text: async () => JSON.stringify({ code: 0, tenant_access_token: 'token', expire: 7200000 }),
  }

  await withMockedFetch(async (url, options) => {
    if (String(url).includes('/auth/v3/')) {
      return tokenResponse
    }
    attempts += 1
    signals.push(options.signal)
    optionKeys.push(Object.keys(options).sort())
    if (attempts === 1) {
      return await new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const err = new Error('The user aborted a request.')
          err.name = 'AbortError'
          err.type = 'aborted'
          reject(err)
        })
      })
    }
    return {
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ nodes: { '1:2': { document: { name: 'Diagram' } } } }),
    }
  }, async (downloader) => {
    const caption = await downloader.__fetchCaption('key', '1:2')

    assert.equal(caption.nodes['1:2'].document.name, 'Diagram')
    assert.equal(attempts, 2)
    assert.equal(signals[0].aborted, true)
    assert.equal(signals[1].aborted, false)
    // timeoutMs must never leak into the node-fetch options.
    assert.deepEqual(optionKeys[0], ['compress', 'headers', 'method', 'signal'])
  })
})

test('a malformed GUIDES_MEDIA_FETCH_TIMEOUT_MS fails fast at load', () => {
  const previous = process.env.GUIDES_MEDIA_FETCH_TIMEOUT_MS
  process.env.GUIDES_MEDIA_FETCH_TIMEOUT_MS = 'not-a-number'
  delete require.cache[require.resolve('./feishuFetch')]
  delete require.cache[require.resolve('./larkImageDownloader')]
  try {
    assert.throws(() => require('./larkImageDownloader'), /GUIDES_MEDIA_FETCH_TIMEOUT_MS must be a positive integer/)
  } finally {
    if (previous === undefined) delete process.env.GUIDES_MEDIA_FETCH_TIMEOUT_MS
    else process.env.GUIDES_MEDIA_FETCH_TIMEOUT_MS = previous
    delete require.cache[require.resolve('./feishuFetch')]
    delete require.cache[require.resolve('./larkImageDownloader')]
  }
})
