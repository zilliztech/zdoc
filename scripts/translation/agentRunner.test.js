const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  buildCorrectionMessages,
  buildReviewMessages,
  buildTranslationMessages,
  createProviderCall,
  createProgressCoordinator,
  isRetryableProviderError,
  loadChunkLimits,
  parseNonNegativeInteger,
  processItemWithRetry,
  processManifestItem,
  protectEsmStatements,
  restoreProtectedEsm,
  runWorkerPool,
  stabilizeBareUrlFormatting,
  stripCodeFence,
  withTimeout,
} = require('./agentRunner')
const { chunkDocument } = require('./chunker')

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

async function testRestSpecsUseStructuredLocaleTranslation() {
  await withTempDir(async siteDir => {
    const sourcePath = 'reference/api/restful/restful/v1/search.mdx'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v1/search.mdx'
    write(path.join(siteDir, sourcePath), '# Search\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"summary":"Search","description":"Search a collection.","example":{"message":"User has not authenticated"}}\nexport const endpoint = "/v1/search"\nexport const method = "post"\n')
    const callModel = async ({ agent, messages }) => {
      if (messages[0].content.includes('structured Zilliz Cloud REST API')) {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({ ...entry, text: `JA:${entry.text}` })))
      }
      if (agent === 'translation') return '# 検索\n<RestSpecs specs={specs} lang="en-US" />\n\n'
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error(`unexpected agent ${agent}`)
    }
    const result = await processManifestItem({
      siteDir,
      item: { sourcePath, targetPath, sourceHash: 'rest', locale: 'ja-JP', type: 'reference' },
      callModel,
      validate: async () => [],
    })
    assert.equal(result.status, 'translated')
    const output = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
    assert.match(output, /lang="ja-JP"/)
    assert.match(output, /"summary":"Search"/)
    assert.match(output, /"ja-JP":\{"summary":"JA:Search","description":"JA:Search a collection\."\}/)
    assert.match(output, /"message":"User has not authenticated"/)
    assert.match(output, /export const endpoint = "\/v1\/search"/)
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

function testChunkLimitConfiguration() {
  assert.deepEqual(loadChunkLimits({}), { targetChars: 16000, maxChars: 24000 })
  assert.deepEqual(loadChunkLimits({
    TRANSLATION_CHUNK_TARGET_CHARS: '12000',
    TRANSLATION_CHUNK_MAX_CHARS: '18000',
  }), { targetChars: 12000, maxChars: 18000 })
  assert.throws(
    () => loadChunkLimits({
      TRANSLATION_CHUNK_TARGET_CHARS: '20000',
      TRANSLATION_CHUNK_MAX_CHARS: '10000',
    }),
    /TRANSLATION_CHUNK_MAX_CHARS must be greater than or equal to TRANSLATION_CHUNK_TARGET_CHARS/,
  )
}

function testFileRetryConfiguration() {
  assert.equal(parseNonNegativeInteger(undefined, 1), 1)
  assert.equal(parseNonNegativeInteger('0', 1), 0)
  assert.equal(parseNonNegativeInteger('2', 1), 2)
  assert.equal(parseNonNegativeInteger('-1', 1), 1)
  assert.equal(parseNonNegativeInteger('1.5', 1), 1)
}

function testStripCodeFencePreservesDocumentClosingFence() {
  const document = '---\ntitle: Test\n---\n\n```text\nexpected output\n```'
  assert.equal(stripCodeFence(document), document)
}

function testStripCodeFenceRemovesResponseWrapper() {
  const wrapped = '```markdown\n---\ntitle: Test\n---\n\n```text\nexpected output\n```\n```'
  const document = '---\ntitle: Test\n---\n\n```text\nexpected output\n```'
  assert.equal(stripCodeFence(wrapped), document)
}

function testChunkMessagesContainContinuityContext() {
  const chunkContext = {
    index: 1,
    total: 3,
    documentTitle: 'Analyzer overview',
    previousTranslatedHeading: '概要',
  }
  const common = { sourcePath: 'docs/test.md', sourceContent: '# Section\n', locale: 'ja-JP', chunkContext }
  const translation = buildTranslationMessages(common).at(-1).content
  const review = buildReviewMessages({ ...common, translatedContent: '# セクション\n' }).at(-1).content
  const correction = buildCorrectionMessages({
    ...common,
    translatedContent: '# セクション\n',
    review: { pass: false, issues: [] },
  }).at(-1).content

  for (const message of [translation, review, correction]) {
    assert.match(message, /Chunk: 2 of 3/)
    assert.match(message, /Document title: Analyzer overview/)
    assert.match(message, /Previous translated heading: 概要/)
  }
  assert.match(translation, /Translate this consecutive MDX\/Markdown section/)
  assert.match(buildTranslationMessages({
    sourcePath: 'docs/test.md',
    sourceContent: '# Complete\n',
    locale: 'ja-JP',
  }).at(-1).content, /Translate this complete MDX\/Markdown file/)
}

function testStabilizesBoldBareUrlsBeforeJapanesePunctuation() {
  const url = 'https://in01-&ast;&ast;&ast;.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540'
  const translated = `例: **${url}**。\n通常の **強調** は変更しません。\n`

  assert.equal(
    stabilizeBareUrlFormatting(translated),
    `例: **\`${url}\`**。\n通常の **強調** は変更しません。\n`,
  )
}

async function testLongDocumentTranslatesChunksSequentially() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/long.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/long.md'
    const source = '---\ntitle: Long\n---\n\n# Section One\n\nFirst body.\n\n# Section Two\n\nSecond body.\n\n# Section Three\n\nThird body.\n'
    write(path.join(siteDir, sourcePath), source)
    const expectedChunks = chunkDocument(source, { targetChars: 45, maxChars: 60 })
    const calls = []

    const callModel = async ({ agent, messages }) => {
      calls.push({ agent, message: messages.at(-1).content })
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      const marker = 'Translate this consecutive MDX/Markdown section:\n\n'
      const content = messages.at(-1).content.slice(messages.at(-1).content.indexOf(marker) + marker.length)
      return content
        .replace('title: Long', 'title: 長文')
        .replaceAll('Section', 'セクション')
        .replaceAll('body', '本文')
    }

    const result = await processManifestItem({
      siteDir,
      item: { sourcePath, targetPath, sourceHash: 'long-hash', locale: 'ja-JP', type: 'docs' },
      callModel,
      maxReviewRounds: 0,
      chunkTargetChars: 45,
      chunkMaxChars: 60,
      validate: async content => content.includes('# セクション Three') ? [] : ['assembly failed'],
    })

    assert.equal(result.status, 'translated')
    assert.equal(result.chunks.total, expectedChunks.length)
    assert.deepEqual(calls.map(call => call.agent), expectedChunks.flatMap(() => ['translation', 'review']))
    assert.match(fs.readFileSync(path.join(siteDir, targetPath), 'utf8'), /# セクション Three/)
  })
}

async function testRestoresSourceImportsBeforeValidation() {
  await withTempDir(async siteDir => {
    const sourcePath = 'reference/api/python/python/test.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/test.md'
    const source = "---\ntitle: Test\n---\n\nimport Admonition from '@theme/Admonition';\n\n# Test\n"
    write(path.join(siteDir, sourcePath), source)

    const callModel = async ({ agent, messages }) => {
      if (agent === 'translation') {
        const supplied = messages.at(-1).content.split('Translate this complete MDX/Markdown file:\n\n')[1]
        assert.doesNotMatch(supplied, /import Admonition/)
        return supplied.replace('title: Test', 'title: テスト').replace('# Test', '# テスト')
      }
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error(`unexpected agent ${agent}`)
    }

    const result = await processManifestItem({
      siteDir,
      item: { sourcePath, targetPath, sourceHash: 'import-hash', locale: 'ja-JP', type: 'reference' },
      callModel,
      maxReviewRounds: 0,
    })

    assert.equal(result.status, 'translated')
    assert.match(
      fs.readFileSync(path.join(siteDir, targetPath), 'utf8'),
      /import Admonition from '@theme\/Admonition';/,
    )
  })
}

function testProtectsEsmBeforeModelTranslation() {
  const source = "Before.\n\nimport Admonition from '@theme/Admonition';\n\nAfter.\n"
  const protectedEsm = protectEsmStatements(source)
  assert.doesNotMatch(protectedEsm.content, /import Admonition/)
  assert.match(protectedEsm.content, /zdoc-preserved-esm:0/)
  assert.equal(restoreProtectedEsm(protectedEsm.content, protectedEsm), source)
  assert.throws(
    () => restoreProtectedEsm(protectedEsm.content.replace('zdoc-preserved-esm:0', 'changed'), protectedEsm),
    /protected ESM marker/i,
  )
}

async function testRepairsUnescapedHeadingAnchorsAfterTranslation() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/anchor.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/anchor.md'
    write(path.join(siteDir, sourcePath), '---\ntitle: Anchor\n---\n\n## Stable heading\\{#stable-anchor}\n\nBody.\n')
    const callModel = async ({ agent }) => agent === 'translation'
      ? '---\ntitle: アンカー\n---\n\n## 安定した見出し{#stable-anchor}\n\n本文。\n'
      : '{"pass":true,"issues":[]}'
    const result = await processManifestItem({
      siteDir,
      item: { sourcePath, targetPath, sourceHash: 'anchor-hash', locale: 'ja-JP', type: 'docs' },
      callModel,
      maxReviewRounds: 0,
    })
    assert.equal(result.status, 'translated')
    assert.match(fs.readFileSync(path.join(siteDir, targetPath), 'utf8'), /\\\{#stable-anchor\}/)
  })
}

async function testRejectsChangedHeadingAnchorIdentity() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/anchor-changed.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/anchor-changed.md'
    write(path.join(siteDir, sourcePath), '## Stable heading\\{#stable-anchor}\n')
    const callModel = async ({ agent }) => agent === 'translation'
      ? '## 安定した見出し{#changed-anchor}\n'
      : '{"pass":true,"issues":[]}'
    const result = await processManifestItem({
      siteDir,
      item: { sourcePath, targetPath, sourceHash: 'changed-anchor-hash', locale: 'ja-JP', type: 'docs' },
      callModel,
      maxReviewRounds: 0,
    })
    assert.equal(result.status, 'failed')
    assert.match(result.validationErrors.join('\n'), /anchor identity/i)
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
  })
}

async function testFailedChunkDoesNotWritePartialTarget() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/long.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/long.md'
    const source = '# One\n\nFirst body.\n\n# Two\n\nSecond body.\n\n# Three\n\nThird body.\n'
    write(path.join(siteDir, sourcePath), source)
    let reviewCount = 0
    const callModel = async ({ agent, messages }) => {
      if (agent === 'translation') {
        const marker = 'Translate this consecutive MDX/Markdown section:\n\n'
        return messages.at(-1).content.slice(messages.at(-1).content.indexOf(marker) + marker.length)
      }
      reviewCount += 1
      return reviewCount === 2
        ? '{"pass":false,"issues":[{"severity":"high","type":"style","comment":"bad chunk"}]}'
        : '{"pass":true,"issues":[]}'
    }

    const result = await processManifestItem({
      siteDir,
      item: { sourcePath, targetPath, sourceHash: 'long-hash', locale: 'ja-JP', type: 'docs' },
      callModel,
      maxReviewRounds: 0,
      chunkTargetChars: 20,
      chunkMaxChars: 28,
      validate: async () => [],
    })

    assert.equal(result.status, 'failed')
    assert.equal(result.chunk.index, 1)
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
  })
}

async function testWorkerPoolLimitsConcurrencyAndProcessesExactlyOnce() {
  const items = Array.from({ length: 8 }, (_, index) => ({ id: index }))
  const processed = []
  let active = 0
  let maxActive = 0
  const results = await runWorkerPool(items, {
    concurrency: 4,
    processItem: async item => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise(resolve => setTimeout(resolve, 5))
      processed.push(item.id)
      active -= 1
      return { ...item, status: 'translated' }
    },
  })

  assert.equal(maxActive, 4)
  assert.deepEqual(processed.slice().sort((a, b) => a - b), items.map(item => item.id))
  assert.equal(new Set(processed).size, items.length)
  assert.deepEqual(results.map(result => result.id), items.map(item => item.id))
}

async function testWorkerPoolIsolatesItemFailures() {
  const items = Array.from({ length: 5 }, (_, index) => ({ id: index }))
  const results = await runWorkerPool(items, {
    concurrency: 3,
    processItem: async item => {
      if (item.id === 2) throw new Error('provider failed')
      return { ...item, status: 'translated' }
    },
  })

  assert.equal(results.filter(result => result.status === 'translated').length, 4)
  assert.equal(results[2].status, 'failed')
  assert.match(results[2].error, /provider failed/)
}

async function testFileRetryRecoversFailedTranslation() {
  const warnings = []
  let attempts = 0
  const result = await processItemWithRetry({ sourcePath: 'docs/retry.md' }, {
    maxRetries: 1,
    log: { warn: message => warnings.push(message) },
    processItem: async item => {
      attempts += 1
      if (attempts === 1) return { ...item, status: 'failed', error: 'review failed' }
      return { ...item, status: 'translated' }
    },
  })

  assert.equal(attempts, 2)
  assert.equal(result.status, 'translated')
  assert.equal(result.attempts, 2)
  assert.deepEqual(result.retryFailures, [{ attempt: 1, error: 'review failed' }])
  assert.equal(warnings.length, 1)
}

async function testFileRetryRecordsPersistentFailure() {
  let attempts = 0
  const result = await processItemWithRetry({ sourcePath: 'docs/fail.md' }, {
    maxRetries: 1,
    log: { warn: () => {} },
    processItem: async item => {
      attempts += 1
      throw new Error(`provider failed ${attempts}`)
    },
  })

  assert.equal(attempts, 2)
  assert.equal(result.status, 'failed')
  assert.equal(result.attempts, 2)
  assert.equal(result.error, 'provider failed 2')
  assert.deepEqual(result.retryFailures, [
    { attempt: 1, error: 'provider failed 1' },
    { attempt: 2, error: 'provider failed 2' },
  ])
}

async function testWorkerPoolStopsAssigningNewItems() {
  const items = Array.from({ length: 5 }, (_, index) => ({ id: index }))
  let processed = 0
  const results = await runWorkerPool(items, {
    concurrency: 1,
    shouldStopAssigning: () => processed >= 2,
    processItem: async item => {
      processed += 1
      return { ...item, status: 'translated' }
    },
  })

  assert.equal(processed, 2)
  assert.equal(results.filter(Boolean).length, 2)
}

async function testProgressCoordinatorCheckpointsCacheAndReport() {
  await withTempDir(async siteDir => {
    const manifest = {
      locale: 'ja-JP',
      items: Array.from({ length: 4 }, (_, index) => ({
        sourcePath: `docs/${index}.md`,
        targetPath: `i18n/${index}.md`,
        sourceHash: `hash-${index}`,
      })),
    }
    const checkpoints = []
    const coordinator = createProgressCoordinator({
      siteDir,
      manifest,
      cache: { files: {} },
      reportPath: 'tmp/report.json',
      checkpointFiles: 2,
      checkpointIntervalMs: 60_000,
      onCheckpoint: metadata => checkpoints.push(metadata.processed),
    })

    await coordinator.record({ ...manifest.items[1], status: 'translated' }, 1)
    await coordinator.record({ ...manifest.items[0], status: 'translated' }, 0)
    await coordinator.record({ ...manifest.items[2], status: 'failed', error: 'bad file' }, 2)
    await coordinator.record({ ...manifest.items[3], status: 'translated' }, 3)
    await coordinator.checkpoint(true)

    assert.deepEqual(checkpoints, [2, 4, 4])
    const cache = JSON.parse(fs.readFileSync(path.join(siteDir, '.translation-cache/ja-JP.json'), 'utf8'))
    assert.deepEqual(Object.keys(cache.files).sort(), ['docs/0.md', 'docs/1.md', 'docs/3.md'])
    const report = JSON.parse(fs.readFileSync(path.join(siteDir, 'tmp/report.json'), 'utf8'))
    assert.equal(report.checkpoint.processed, 4)
    assert.equal(report.checkpoint.remaining, 0)
    assert.deepEqual(report.results.map(item => item.sourcePath), ['docs/0.md', 'docs/1.md', 'docs/2.md', 'docs/3.md'])
    assert.equal(fs.existsSync(path.join(siteDir, 'tmp/report.json.tmp')), false)
  })
}

async function run() {
  await testCorrectionRunsWhenReviewFails()
  await testRestSpecsUseStructuredLocaleTranslation()
  await testProviderCallRetriesTransientFailures()
  await testProviderCallTimesOutHungRequests()
  await testFileTimeoutRejectsSlowWork()
  testRetryableProviderErrors()
  testChunkLimitConfiguration()
  testFileRetryConfiguration()
  testStripCodeFencePreservesDocumentClosingFence()
  testStripCodeFenceRemovesResponseWrapper()
  testChunkMessagesContainContinuityContext()
  testStabilizesBoldBareUrlsBeforeJapanesePunctuation()
  await testLongDocumentTranslatesChunksSequentially()
  testProtectsEsmBeforeModelTranslation()
  await testRestoresSourceImportsBeforeValidation()
  await testRepairsUnescapedHeadingAnchorsAfterTranslation()
  await testRejectsChangedHeadingAnchorIdentity()
  await testFailedChunkDoesNotWritePartialTarget()
  await testWorkerPoolLimitsConcurrencyAndProcessesExactlyOnce()
  await testWorkerPoolIsolatesItemFailures()
  await testFileRetryRecoversFailedTranslation()
  await testFileRetryRecordsPersistentFailure()
  await testWorkerPoolStopsAssigningNewItems()
  await testProgressCoordinatorCheckpointsCacheAndReport()
  console.log('translation agent runner tests passed')
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
