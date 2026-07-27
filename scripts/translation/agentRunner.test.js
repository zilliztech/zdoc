const assert = require('node:assert/strict')
const crypto = require('node:crypto')
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
  promptNamesFor,
  processItemWithRetry,
  processManifestItem,
  protectEsmStatements,
  restoreProtectedEsm,
  runWorkerPool,
  stabilizeBareUrlFormatting,
  stripCodeFence,
  validateTranslationManifest,
  withTimeout,
} = require('./agentRunner')
const { chunkDocument } = require('./chunker')
const { buildTranslationCandidates } = require('../../packages/docs-tooling/src/translation/candidates.ts')

function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-agent-'))
  try {
    const result = callback(dir)
    if (result && typeof result.then === 'function') return result.finally(() => fs.rmSync(dir, { recursive: true, force: true }))
    fs.rmSync(dir, { recursive: true, force: true })
    return result
  } catch (error) {
    fs.rmSync(dir, { recursive: true, force: true })
    throw error
  }
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function testSelectsPromptsByTranslationTarget() {
  assert.deepEqual(promptNamesFor('ja-JP'), {
    translation: 'codex-translation-agent.ja-JP.md',
    review: 'codex-review-agent.ja-JP.md',
    rest: 'codex-rest-spec-translation-agent.ja-JP.md',
  })
  assert.equal(promptNamesFor('zh-CN-reference').review, 'codex-review-agent.zh-CN-reference.md')
  assert.equal(promptNamesFor('zh-CN-tools').translation, 'codex-translation-agent.zh-CN-tools.md')
  assert.equal(promptNamesFor('zh-CN-tools').rest, undefined)
  assert.throws(() => promptNamesFor('zh-CN'), /Unsupported translation target/)
  assert.throws(() => promptNamesFor('unknown'), /Unsupported translation target/)
}

function testMessageBuildersSelectPromptsFromTarget() {
  const common = {
    target: 'zh-CN-tools',
    sourcePath: 'content/en/guides/tutorials/tools/test.md',
    sourceContent: '# Tool\n',
    locale: 'zh-CN',
  }
  assert.match(buildTranslationMessages(common)[0].content, /complete .*Tools chapter/i)
  assert.match(buildReviewMessages({...common, translatedContent: '# 工具\n'})[0].content, /materially English/i)
  assert.match(buildCorrectionMessages({
    ...common,
    translatedContent: '# Tool\n',
    review: {pass: false, issues: [{severity: 'high', type: 'style', comment: 'Translate the heading.'}]},
  })[0].content, /complete .*Tools chapter/i)
  assert.match(buildCorrectionMessages({
    target: 'ja-JP',
    sourcePath: 'content/en/guides/tutorials/test.md',
    sourceContent: '# Test\n',
    translatedContent: '# テスト\n',
    review: {pass: false, issues: []},
    locale: 'ja-JP',
  })[0].content, /Correction Agent for Japanese/)
}

function validManifest(overrides = {}) {
  return {
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    group: null,
    sourceCheckpointSha: null,
    generatedAt: '2026-07-27T00:00:00.000Z',
    items: [{
      sourcePath: 'content/en/reference/api/python/search.md',
      targetPath: 'content/zh-CN/reference/api/python/search.md',
      sourceHash: 'a'.repeat(64),
      locale: 'zh-CN',
      type: 'reference',
      reason: 'current_delta',
    }],
    ...overrides,
  }
}

function testValidatesExactManifestTargetContract() {
  assert.equal(validateTranslationManifest(validManifest()).target, 'zh-CN-reference')
  assert.throws(() => validateTranslationManifest(validManifest({target: undefined})), /target/i)
  assert.throws(() => validateTranslationManifest(validManifest({target: 'zh-CN'})), /Unsupported translation target/)
  assert.throws(() => validateTranslationManifest(validManifest({locale: undefined})), /locale/i)
  assert.throws(() => validateTranslationManifest(validManifest({locale: 'ja-JP'})), /locale/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    locale: 'ja-JP',
  }]})), /locale/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    sourcePath: 'content/en/guides/tutorials/tools/search.md',
  }]})), /source path/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    sourcePath: undefined,
  }]})), /source path/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    targetPath: 'content/zh-CN/guides/tutorials/tools/search.md',
  }]})), /target path/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    targetPath: undefined,
  }]})), /target path/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    sourcePath: 'content/en/reference/../guides/search.md',
    targetPath: 'content/zh-CN/reference/../guides/search.md',
  }]})), /source path/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    type: 'tools',
  }]})), /type/i)
  assert.throws(() => validateTranslationManifest({...validManifest(), retirementAuthority: true}), /exact schema/i)
  assert.throws(() => validateTranslationManifest(validManifest({items: [{
    ...validManifest().items[0],
    retirementReason: 'source_deleted',
  }]})), /exact schema/i)
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
        target: 'ja-JP',
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
    const sourcePath = 'content/en/reference/api/restful/restful/v1/search.mdx'
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
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'rest', locale: 'ja-JP', type: 'reference' },
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

function toolsSidebarItem() {
  return {
    target: 'zh-CN-tools',
    sourcePath: 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools',
    targetPath: 'generated/zh-CN/sidebars/tools.sidebar.js',
    sourceHash: 'b'.repeat(64),
    locale: 'zh-CN',
    type: 'sidebar',
  }
}

function toolsSidebarFragment(label = 'Tools') {
  return {
    type: 'category',
    label,
    key: 'category:tutorials/tools',
    items: [
      {
        type: 'doc',
        id: 'tutorials/tools/cli',
        label: 'CLI Tool',
        key: 'doc:tutorials/tools/cli',
      },
      {
        type: 'link',
        href: 'https://example.com/tools',
        label: 'External Tool',
        key: 'link:tutorials/tools/external',
      },
    ],
  }
}

async function testTranslatesToolsSidebarFragmentWithoutReadingPseudoPath() {
  await withTempDir(async siteDir => {
    write(
      path.join(siteDir, 'generated/en/sidebars/guides.sidebar.js'),
      `module.exports = ${JSON.stringify([{type: 'category', label: 'Other', key: 'category:other', items: []}, toolsSidebarFragment()])}\n`,
    )
    const translated = toolsSidebarFragment('工具')
    translated.items[0].label = 'CLI 工具'
    translated.items[1].label = '外部工具'
    const calls = []
    const result = await processManifestItem({
      siteDir,
      item: toolsSidebarItem(),
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        calls.push(agent)
        assert.match(messages[0].content, /Tools chapter/i)
        return agent === 'translation'
          ? JSON.stringify(translated)
          : '{"pass":true,"issues":[]}'
      },
    })

    assert.equal(result.status, 'translated')
    assert.equal(result.sourcePath, toolsSidebarItem().sourcePath)
    assert.equal(result.targetPath, toolsSidebarItem().targetPath)
    assert.deepEqual(calls, ['translation', 'review'])
    const outputPath = path.join(siteDir, toolsSidebarItem().targetPath)
    const resolved = require.resolve(outputPath)
    delete require.cache[resolved]
    const output = require(resolved)
    assert.deepEqual(output, [translated])
    assert.equal(output[0].items[0].id, 'tutorials/tools/cli')
    assert.equal(output[0].items[1].href, 'https://example.com/tools')
  })
}

async function testToolsSidebarReviewFailureDoesNotWriteTarget() {
  await withTempDir(async siteDir => {
    write(path.join(siteDir, 'generated/en/sidebars/guides.sidebar.js'), `module.exports = ${JSON.stringify([toolsSidebarFragment()])}\n`)
    const result = await processManifestItem({
      siteDir,
      item: toolsSidebarItem(),
      maxReviewRounds: 0,
      callModel: async ({agent}) => agent === 'translation'
        ? JSON.stringify(toolsSidebarFragment())
        : '{"pass":false,"issues":[{"severity":"high","type":"untranslated_prose","comment":"Labels remain materially English."}]}',
    })
    assert.equal(result.status, 'failed')
    assert.match(result.review.issues[0].comment, /materially English/i)
    assert.equal(fs.existsSync(path.join(siteDir, toolsSidebarItem().targetPath)), false)
  })
}

async function testToolsSidebarRejectsChangedStructure() {
  await withTempDir(async siteDir => {
    write(path.join(siteDir, 'generated/en/sidebars/guides.sidebar.js'), `module.exports = ${JSON.stringify([toolsSidebarFragment()])}\n`)
    const changed = toolsSidebarFragment('工具')
    changed.items[0].id = 'tutorials/tools/changed'
    const result = await processManifestItem({
      siteDir,
      item: toolsSidebarItem(),
      maxReviewRounds: 0,
      callModel: async ({agent}) => agent === 'translation'
        ? JSON.stringify(changed)
        : '{"pass":true,"issues":[]}',
    })
    assert.equal(result.status, 'failed')
    assert.match(result.validationErrors.join('\n'), /sidebar fragment validation.*structure/i)
    assert.equal(fs.existsSync(path.join(siteDir, toolsSidebarItem().targetPath)), false)
  })
}

async function testToolsSidebarFragmentIdentityFailsClosed() {
  await withTempDir(async siteDir => {
    const sourceModule = path.join(siteDir, 'generated/en/sidebars/guides.sidebar.js')
    write(sourceModule, `module.exports = ${JSON.stringify([{type: 'category', label: 'Other', key: 'category:other', items: []}])}\n`)
    await assert.rejects(processManifestItem({
      siteDir,
      item: toolsSidebarItem(),
      callModel: async () => { throw new Error('model must not be called') },
    }), /missing.*category:tutorials\/tools/i)

    write(sourceModule, `module.exports = ${JSON.stringify([toolsSidebarFragment(), toolsSidebarFragment('Duplicate')])}\n`)
    delete require.cache[require.resolve(sourceModule)]
    await assert.rejects(processManifestItem({
      siteDir,
      item: toolsSidebarItem(),
      callModel: async () => { throw new Error('model must not be called') },
    }), /ambiguous.*category:tutorials\/tools/i)
  })
}

async function testRejectsSidebarPseudoPathForNonToolsTarget() {
  await withTempDir(async siteDir => {
    await assert.rejects(processManifestItem({
      siteDir,
      item: {...toolsSidebarItem(), target: 'ja-JP'},
      callModel: async () => { throw new Error('model must not be called') },
    }), /fragment pseudo-path.*zh-CN-tools/i)
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
  const common = { target: 'ja-JP', sourcePath: 'docs/test.md', sourceContent: '# Section\n', locale: 'ja-JP', chunkContext }
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
    target: 'ja-JP',
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
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'long-hash', locale: 'ja-JP', type: 'docs' },
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
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'import-hash', locale: 'ja-JP', type: 'reference' },
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
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'anchor-hash', locale: 'ja-JP', type: 'docs' },
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
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'changed-anchor-hash', locale: 'ja-JP', type: 'docs' },
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
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'long-hash', locale: 'ja-JP', type: 'docs' },
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
      target: 'ja-JP',
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
    assert.equal(report.target, 'ja-JP')
    assert.equal(report.locale, 'ja-JP')
    assert.equal(report.checkpoint.target, 'ja-JP')
    assert.equal(report.checkpoint.processed, 4)
    assert.equal(report.checkpoint.remaining, 0)
    assert.deepEqual(report.results.map(item => item.sourcePath), ['docs/0.md', 'docs/1.md', 'docs/2.md', 'docs/3.md'])
    assert.equal(fs.existsSync(path.join(siteDir, 'tmp/report.json.tmp')), false)
  })
}

async function testJapaneseProgressStatePreservesExistingLocaleCache() {
  await withTempDir(async siteDir => {
    write(path.join(siteDir, '.translation-cache/ja-JP.json'), JSON.stringify({files: {
      'content/en/guides/tutorials/existing.md': {
        sourceHash: 'a'.repeat(64),
        targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/existing.md',
        translatedAt: '2026-07-01T00:00:00.000Z',
      },
    }}))
    const manifest = {
      target: 'ja-JP',
      locale: 'ja-JP',
      items: [{
        sourcePath: 'content/en/guides/tutorials/new.md',
        targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/new.md',
        sourceHash: 'b'.repeat(64),
      }],
    }
    const coordinator = createProgressCoordinator({
      siteDir,
      manifest,
      reportPath: 'tmp/ja-report.json',
      checkpointFiles: 1,
      now: () => Date.parse('2026-07-27T00:00:00.000Z'),
    })
    await coordinator.record({...manifest.items[0], status: 'translated'}, 0)
    const cache = JSON.parse(fs.readFileSync(path.join(siteDir, '.translation-cache/ja-JP.json'), 'utf8'))
    assert.deepEqual(Object.keys(cache.files).sort(), [
      'content/en/guides/tutorials/existing.md',
      'content/en/guides/tutorials/new.md',
    ])
    assert.equal(cache.files['content/en/guides/tutorials/existing.md'].translatedAt, '2026-07-01T00:00:00.000Z')
    assert.equal(cache.files['content/en/guides/tutorials/new.md'].translatedAt, '2026-07-27T00:00:00.000Z')
  })
}

async function testChineseProgressStateUsesIndependentTargetManifests() {
  await withTempDir(async siteDir => {
    const sourceCommit = 'c'.repeat(40)
    const referenceSourcePath = 'content/en/reference/api/python/page.md'
    const referenceTargetPath = 'content/zh-CN/reference/api/python/page.md'
    const referenceSource = '# Reference\n'
    const referenceTarget = '# 参考\n'
    write(path.join(siteDir, referenceSourcePath), referenceSource)
    write(path.join(siteDir, referenceTargetPath), referenceTarget)
    write(path.join(siteDir, 'generated/en/manifests/reference.json'), JSON.stringify({
      schemaVersion: 1,
      sourceCommit,
      records: [{manual: 'python', sourcePath: referenceSourcePath, sourceHash: sha256(referenceSource)}],
    }))
    const retiredReference = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/retired.md',
      targetPath: 'content/zh-CN/reference/api/python/retired.md',
      sourceCommit,
      sourceHash: 'd'.repeat(64),
      targetHash: 'e'.repeat(64),
      status: 'retired',
    }
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [retiredReference],
    }))

    const referenceManifest = {
      target: 'zh-CN-reference',
      locale: 'zh-CN',
      sourceCheckpointSha: sourceCommit,
      items: [{
        sourcePath: referenceSourcePath,
        targetPath: referenceTargetPath,
        sourceHash: sha256(referenceSource),
        locale: 'zh-CN',
        type: 'reference',
        reason: 'missing_target',
      }],
    }
    const referenceCoordinator = createProgressCoordinator({
      siteDir,
      manifest: referenceManifest,
      cache: {files: {}},
      reportPath: 'tmp/reference-report.json',
      checkpointFiles: 1,
    })
    await referenceCoordinator.record({...referenceManifest.items[0], status: 'translated'}, 0)
    await referenceCoordinator.checkpoint(true)

    const toolsSourcePath = 'content/en/guides/tutorials/tools/tool.md'
    const toolsTargetPath = 'content/zh-CN/guides/tutorials/tools/tool.md'
    const toolsSource = '# Tool\n'
    write(path.join(siteDir, toolsSourcePath), toolsSource)
    write(path.join(siteDir, toolsTargetPath), '# 工具\n')
    const retiredTool = {
      sourcePath: 'content/en/guides/tutorials/tools/retired.md',
      targetPath: 'content/zh-CN/guides/tutorials/tools/retired.md',
      sourceHash: 'f'.repeat(64),
      status: 'retired',
    }
    write(path.join(siteDir, 'generated/zh-CN/manifests/tools-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [retiredTool],
    }))
    const toolsManifest = {
      target: 'zh-CN-tools',
      locale: 'zh-CN',
      sourceCheckpointSha: sourceCommit,
      items: [{
        sourcePath: toolsSourcePath,
        targetPath: toolsTargetPath,
        sourceHash: sha256(toolsSource),
        locale: 'zh-CN',
        type: 'tools',
        reason: 'missing_target',
      }],
    }
    const toolsCoordinator = createProgressCoordinator({
      siteDir,
      manifest: toolsManifest,
      cache: {files: {}},
      reportPath: 'tmp/tools-report.json',
      checkpointFiles: 1,
    })
    await toolsCoordinator.record({...toolsManifest.items[0], status: 'translated'}, 0)
    await toolsCoordinator.checkpoint(true)

    assert.equal(fs.existsSync(path.join(siteDir, '.translation-cache/zh-CN.json')), false)
    const referenceState = JSON.parse(fs.readFileSync(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'))
    const toolsState = JSON.parse(fs.readFileSync(path.join(siteDir, 'generated/zh-CN/manifests/tools-translations.json'), 'utf8'))
    assert.deepEqual(referenceState.records.map(record => record.sourcePath), [referenceSourcePath, retiredReference.sourcePath])
    assert.equal(referenceState.records[0].manual, 'python')
    assert.equal(referenceState.records[0].sourceCommit, sourceCommit)
    assert.equal(referenceState.records[0].sourceHash, sha256(referenceSource))
    assert.equal(referenceState.records[0].targetHash, sha256(referenceTarget))
    assert.equal(referenceState.records[1].status, 'retired')
    assert.deepEqual(toolsState.records.map(record => record.sourcePath), [retiredTool.sourcePath, toolsSourcePath])
    assert.equal(toolsState.records[0].status, 'retired')
    assert.equal(toolsState.records[1].sourceHash, sha256(toolsSource))
    assert.ok(referenceState.records.every(record => record.sourcePath.startsWith('content/en/reference/')))
    assert.ok(toolsState.records.every(record => record.sourcePath.startsWith('content/en/guides/tutorials/tools/')))
    assert.deepEqual(buildTranslationCandidates({repositoryRoot: siteDir, targetId: 'zh-CN-reference'}).candidates, [])
    assert.deepEqual(buildTranslationCandidates({repositoryRoot: siteDir, targetId: 'zh-CN-tools'}).candidates, [])

    const referenceReport = JSON.parse(fs.readFileSync(path.join(siteDir, 'tmp/reference-report.json'), 'utf8'))
    const toolsReport = JSON.parse(fs.readFileSync(path.join(siteDir, 'tmp/tools-report.json'), 'utf8'))
    assert.equal(referenceReport.target, 'zh-CN-reference')
    assert.equal(toolsReport.target, 'zh-CN-tools')
    assert.equal(referenceReport.checkpoint.target, 'zh-CN-reference')
    assert.equal(toolsReport.checkpoint.target, 'zh-CN-tools')
    assert.ok(referenceReport.results.every(result => result.target === 'zh-CN-reference'))
    assert.ok(toolsReport.results.every(result => result.target === 'zh-CN-tools'))
  })
}

async function run() {
  testSelectsPromptsByTranslationTarget()
  testMessageBuildersSelectPromptsFromTarget()
  testValidatesExactManifestTargetContract()
  await testCorrectionRunsWhenReviewFails()
  await testRestSpecsUseStructuredLocaleTranslation()
  await testTranslatesToolsSidebarFragmentWithoutReadingPseudoPath()
  await testToolsSidebarReviewFailureDoesNotWriteTarget()
  await testToolsSidebarRejectsChangedStructure()
  await testToolsSidebarFragmentIdentityFailsClosed()
  await testRejectsSidebarPseudoPathForNonToolsTarget()
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
  await testChineseProgressStateUsesIndependentTargetManifests()
  await testProgressCoordinatorCheckpointsCacheAndReport()
  await testJapaneseProgressStatePreservesExistingLocaleCache()
  console.log('translation agent runner tests passed')
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
