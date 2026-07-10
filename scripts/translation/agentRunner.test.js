const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { createProviderCall, isRetryableProviderError, processManifestItem, withTimeout } = require('./agentRunner')

function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-agent-'))
  try {
    return callback(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

async function testCorrectionRunsWhenReviewFails() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/test.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/test.md'
    write(path.join(siteDir, sourcePath), '---\ntitle: Test\n---\n# Hello\n\nUse `client.search()`.\n')

    const calls = []
    const callModel = async ({ agent }) => {
      calls.push(agent)
      if (agent === 'translation') return '---\ntitle: テスト\n---\n# こんにちは\n\n`client.search()` を使用します。\n'
      if (agent === 'review') {
        return calls.filter(name => name === 'review').length === 1
          ? '{"pass":false,"issues":[{"severity":"high","type":"style","comment":"Use more natural Japanese."}]}'
          : '{"pass":true,"issues":[]}'
      }
      if (agent === 'correction') return '---\ntitle: テスト\n---\n# こんにちは\n\n`client.search()` を使用します。\n'
      throw new Error(`unexpected agent ${agent}`)
    }

    const result = await processManifestItem({
      siteDir,
      item: {
        sourcePath,
        targetPath,
        sourceHash: 'abc123',
        locale: 'ja-JP',
        type: 'docs',
      },
      callModel,
      maxReviewRounds: 2,
      validate: async () => [],
    })

    assert.equal(result.status, 'translated')
    assert.deepEqual(calls, ['translation', 'review', 'correction', 'review'])
    assert.equal(fs.readFileSync(path.join(siteDir, targetPath), 'utf8').includes('client.search()'), true)
  })
}

async function testProviderCallRetriesTransientFailures() {
  const originalFetch = global.fetch
  let calls = 0
  global.fetch = async () => {
    calls += 1
    if (calls === 1) {
      return {
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Connection error.' } }),
      }
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: ' translated ' } }] }),
    }
  }

  try {
    const callModel = await createProviderCall({
      translation: {
        baseUrl: 'https://example.com',
        apiKey: 'test-key',
        model: 'test-model',
      },
    }, { maxRetries: 1, retryDelayMs: 1 })

    const content = await callModel({
      agent: 'translation',
      messages: [{ role: 'user', content: 'hello' }],
    })

    assert.equal(content, 'translated')
    assert.equal(calls, 2)
  } finally {
    global.fetch = originalFetch
  }
}

async function testProviderCallTimesOutHungRequests() {
  const originalFetch = global.fetch
  let calls = 0
  global.fetch = async (_url, options = {}) => {
    calls += 1
    return new Promise((resolve, reject) => {
      options.signal?.addEventListener('abort', () => {
        const error = new Error('The operation was aborted')
        error.name = 'AbortError'
        reject(error)
      })
    })
  }

  try {
    const callModel = await createProviderCall({
      translation: {
        baseUrl: 'https://example.com',
        apiKey: 'test-key',
        model: 'test-model',
      },
    }, { maxRetries: 1, retryDelayMs: 1, timeoutMs: 1 })

    await assert.rejects(
      () => callModel({
        agent: 'translation',
        messages: [{ role: 'user', content: 'hello' }],
      }),
      /aborted/i,
    )
    assert.equal(calls, 2)
  } finally {
    global.fetch = originalFetch
  }
}

async function testFileTimeoutRejectsSlowWork() {
  await assert.rejects(
    () => withTimeout(new Promise(() => {}), 1, 'Timed out translating docs/test.md after 1ms'),
    /Timed out translating docs\/test\.md/,
  )
}

function testRetryableProviderErrors() {
  assert.equal(isRetryableProviderError(new Error('translation agent failed with HTTP 500: {}')), true)
  assert.equal(isRetryableProviderError(new Error('fetch failed')), true)
  const abortError = new Error('The operation was aborted')
  abortError.name = 'AbortError'
  assert.equal(isRetryableProviderError(abortError), true)
  assert.equal(isRetryableProviderError(new Error('translation agent failed with HTTP 400: {}')), false)
}

async function run() {
  await testCorrectionRunsWhenReviewFails()
  await testProviderCallRetriesTransientFailures()
  await testProviderCallTimesOutHungRequests()
  await testFileTimeoutRejectsSlowWork()
  testRetryableProviderErrors()
  console.log('translation agent runner tests passed')
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
