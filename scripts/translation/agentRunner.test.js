const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  buildCorrectionMessages,
  buildReviewMessages,
  buildTranslationMessages,
  buildRecoveryIdentity,
  createProviderCall,
  createProgressCoordinator,
  isRetryableProviderError,
  loadChunkLimits,
  loadRecoveryAnalysis,
  parseNonNegativeInteger,
  partitionRecoveryWork,
  promptNamesFor,
  processItemWithRetry,
  processManifestItem,
  runWorkerPool,
  stabilizeBareUrlFormatting,
  stripCodeFence,
  validateTranslationManifest,
  withTimeout,
} = require('./agentRunner')
const { chunkDocument } = require('./chunker')
const { REVIEW_RESPONSE_JSON_SCHEMA } = require('./reviewEvidence')
const { createRecoveryArtifact } = require('./recovery-artifact')
const { buildTranslationCandidates } = require('../../packages/docs-tooling/src/translation/candidates.ts')
const { validateReferenceTranslation } = require('../../packages/docs-tooling/src/validation/translation.ts')

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

function taggedMessageContent(messages, tag) {
  const message = messages.at(-1).content
  const match = message.match(new RegExp(`<${tag}>\\n([\\s\\S]*?)<\\/${tag}>`))
  if (!match) throw new Error(`Missing <${tag}> boundary in model message`)
  return match[1]
}

function taggedJsonContent(messages, tag) {
  return JSON.parse(taggedMessageContent(messages, tag))
}

function semanticTranslationResponse(messages, transform = text => text) {
  return JSON.stringify({
    translations: taggedJsonContent(messages, 'semantic_units').map(unit => ({
      id: unit.id,
      text: transform(unit.text, unit),
    })),
  })
}

function semanticCorrectionResponse(messages, transform = text => text) {
  return JSON.stringify({
    corrections: taggedJsonContent(messages, 'authorized_units').map(unit => ({
      id: unit.id,
      text: transform(unit.draft, unit),
    })),
  })
}

function testSelectsPromptsByTranslationTarget() {
  assert.deepEqual(promptNamesFor('ja-JP'), {
    translation: 'codex-translation-agent.ja-JP.md',
    review: 'codex-review-agent.ja-JP.md',
    correction: 'codex-correction-agent.md',
    rest: 'codex-rest-spec-translation-agent.ja-JP.md',
    restReview: 'codex-rest-spec-review-agent.md',
    restCorrection: 'codex-rest-spec-correction-agent.md',
  })
  assert.equal(promptNamesFor('zh-CN-reference').review, 'codex-review-agent.zh-CN-reference.md')
  assert.equal(promptNamesFor('zh-CN-reference').correction, 'codex-correction-agent.zh-CN-reference.md')
  assert.throws(() => promptNamesFor('zh-CN-tools'), /Unsupported translation target/)
  assert.throws(() => promptNamesFor('zh-CN'), /Unsupported translation target/)
  assert.throws(() => promptNamesFor('unknown'), /Unsupported translation target/)
}

function testPartitionsRecoveredFilesWithoutChangingOriginalIndexes() {
  const items = [
    {sourcePath: 'content/en/a.md'},
    {sourcePath: 'content/en/b.md'},
    {sourcePath: 'content/en/c.md'},
  ]
  const recovered = [{...items[1], status: 'translated', recovered: true}]
  const partitioned = partitionRecoveryWork({items}, recovered)
  assert.deepEqual(partitioned.recovered, [{index: 1, result: recovered[0]}])
  assert.deepEqual(partitioned.pending, [{index: 0, item: items[0]}, {index: 2, item: items[2]}])
}

function testRecoveryIdentityUsesAuthoritativeToolingSha() {
  const toolingSha = 'a'.repeat(40)
  const identity = buildRecoveryIdentity({
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    group: 'python',
    sourceCheckpointSha: 'b'.repeat(40),
  }, process.cwd(), {
    TRANSLATION_AGENT_MODEL: 'translation-model',
    TOOLING_SHA: toolingSha,
    MASTER_SHA: 'c'.repeat(40),
  })

  assert.equal(identity.toolingSha, toolingSha)
}

function testAuthenticatesRecoveryAnalysisAgainstCurrentManifestAndRestoredBytes() {
  withTempDir(siteDir => {
    const sourcePath = 'content/en/reference/api/python/page.md'
    const targetPath = 'content/zh-CN/reference/api/python/page.md'
    const source = '# Source\n'
    const target = '# 中文\n'
    write(path.join(siteDir, sourcePath), source)
    write(path.join(siteDir, targetPath), target)
    const manifest = {
      target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40),
      items: [{sourcePath, targetPath, sourceHash: sha256(source), locale: 'zh-CN', type: 'reference', reason: 'stale_source'}],
    }
    const identity = {promptContractSha256: 'b'.repeat(64), model: 'translation-model', toolingSha: 'c'.repeat(40)}
    const analysis = {
      schemaVersion: 2, kind: 'translation-recovery-analysis', target: manifest.target, locale: manifest.locale, group: manifest.group,
      sourceCheckpointSha: manifest.sourceCheckpointSha, promptContractSha256: identity.promptContractSha256, model: identity.model,
      executionToolingSha: identity.toolingSha, candidateCount: 1, recoveredCount: 1, pendingCount: 0, rejectedCount: 0,
      fullRetranslation: false, compatibilityMode: 'revalidated',
      restored: [{sourcePath, targetPath, sourceHash: sha256(source), targetHash: sha256(target), targetSize: Buffer.byteLength(target), compatibility: 'revalidated'}],
      pending: [], rejected: [],
    }
    const file = path.join(siteDir, 'recovery-analysis.json')
    fs.writeFileSync(file, JSON.stringify(analysis))
    const loaded = loadRecoveryAnalysis({file, manifest, siteDir, identity})
    assert.deepEqual(loaded.restored, [{...manifest.items[0], status: 'translated', recovered: true, recoveryCompatibility: 'revalidated'}])
    write(path.join(siteDir, targetPath), '# tampered\n')
    assert.throws(() => loadRecoveryAnalysis({file, manifest, siteDir, identity}), /payload changed after preflight/i)
  })
}

function testRejectsRecoveryAnalysisThatWidensOrChangesCurrentPendingWork() {
  withTempDir(siteDir => {
    const sourcePath = 'content/en/reference/api/python/page.md'
    const targetPath = 'content/zh-CN/reference/api/python/page.md'
    const source = '# Source\n'
    write(path.join(siteDir, sourcePath), source)
    const item = {sourcePath, targetPath, sourceHash: sha256(source), locale: 'zh-CN', type: 'reference', reason: 'stale_source'}
    const manifest = {target: 'zh-CN-reference', locale: 'zh-CN', group: 'python', sourceCheckpointSha: 'a'.repeat(40), items: [item]}
    const identity = {promptContractSha256: 'b'.repeat(64), model: 'translation-model', toolingSha: 'c'.repeat(40)}
    const analysis = {
      schemaVersion: 1, kind: 'translation-recovery-analysis', target: manifest.target, locale: manifest.locale, group: manifest.group,
      sourceCheckpointSha: manifest.sourceCheckpointSha, promptContractSha256: identity.promptContractSha256, model: identity.model,
      executionToolingSha: identity.toolingSha, candidateCount: 1, recoveredCount: 0, pendingCount: 1, rejectedCount: 1,
      fullRetranslation: true, restored: [],
      pending: [{sourcePath, targetPath: 'content/zh-CN/reference/api/python/other.md', sourceHash: item.sourceHash}],
      rejected: [{sourcePath, targetPath: 'content/zh-CN/reference/api/python/other.md', reason: 'missing recovery record'}],
    }
    const file = path.join(siteDir, 'recovery-analysis.json')
    fs.writeFileSync(file, JSON.stringify(analysis))
    assert.throws(() => loadRecoveryAnalysis({file, manifest, siteDir, identity}), /pending identity/i)
  })
}

function testMessageBuildersSelectPromptsFromTarget() {
  const common = {
    target: 'zh-CN-reference',
    sourcePath: 'content/en/reference/api/java/test.md',
    sourceContent: '# Reference\n',
    locale: 'zh-CN',
  }
  assert.match(buildTranslationMessages(common)[0].content, /Chinese/i)
  assert.match(buildTranslationMessages(common)[0].content, /zh-CN-reference-2026-08-04-p0/)
  assert.match(buildTranslationMessages(common)[0].content, /semantic_units/)
  assert.match(buildTranslationMessages(common)[0].content, /"translations"/)
  assert.match(buildTranslationMessages(common)[0].content, /document_context.*context only/is)
  assert.match(buildTranslationMessages(common)[0].content, /retry_feedback.*prior attempt.*not source/is)
  assert.match(buildTranslationMessages(common)[0].content, /exact marker identity and count/i)
  assert.match(buildTranslationMessages(common)[0].content, /plain code-like token.*remain plain.*never add backticks/is)
  assert.match(buildTranslationMessages(common)[0].content, /Reference landing-page contract.*Han characters.*2\.5.*do not expand headings/is)
  const reviewPrompt = buildReviewMessages({...common, translatedContent: '# 参考\n'})[0].content
  assert.match(reviewPrompt, /Simplified Chinese/i)
  assert.match(reviewPrompt, /zh-CN-reference-2026-08-04-p0/)
  assert.match(reviewPrompt, /exact semantic unit ID/i)
  assert.match(buildCorrectionMessages({
    ...common,
    translatedContent: '# Tool\n',
    review: {pass: false, issues: [{severity: 'high', type: 'style', comment: 'Translate the heading.'}]},
  })[0].content, /Correction Agent for the Simplified Chinese/)
  const chineseCorrectionPrompt = buildCorrectionMessages({
    ...common,
    translatedContent: '# Tool\n',
    review: {pass: false, issues: []},
  })[0].content
  assert.match(chineseCorrectionPrompt, /"corrections"/i)
  assert.match(chineseCorrectionPrompt, /ordinary English.*technical identifier.*translate/is)
  assert.match(buildCorrectionMessages({
    target: 'ja-JP',
    sourcePath: 'content/en/guides/tutorials/test.md',
    sourceContent: '# Test\n',
    translatedContent: '# テスト\n',
    review: {pass: false, issues: []},
    locale: 'ja-JP',
  })[0].content, /Correction Agent for Japanese/)
}

function testTranslationMessagesIncludeOnlyExplicitRetryFeedback() {
  const common = {
    target: 'zh-CN-reference',
    sourcePath: 'content/en/reference/api/java/test.md',
    sourceContent: '# Reference\n',
    locale: 'zh-CN',
  }
  assert.doesNotMatch(buildTranslationMessages(common).at(-1).content, /<retry_feedback>/)
  assert.match(
    buildTranslationMessages({...common, retryFeedback: 'Protected marker 000042 was missing during translation'}).at(-1).content,
    /<retry_feedback>\nProtected marker 000042 was missing during translation\n<\/retry_feedback>/,
  )
}

function testReferenceLandingMessagesContainNavigationContract() {
  const common = {
    target: 'zh-CN-reference',
    sourcePath: 'content/en/reference/api/go/go/go.md',
    sourceContent: '# Go SDK\n\n## Install\n\nUse the Go SDK.\n',
    locale: 'zh-CN',
  }
  const messages = [
    buildTranslationMessages(common).at(-1).content,
    buildReviewMessages({...common, translatedContent: '# Go SDK\n\n## 安装\n\n使用 Go SDK。\n'}).at(-1).content,
    buildCorrectionMessages({
      ...common,
      translatedContent: '# Go SDK\n\n## 安装\n\n使用 Go SDK。\n',
      review: {pass: false, issues: []},
    }).at(-1).content,
  ]

  for (const message of messages) {
    assert.match(message, /Reference landing-page contract.*config\/reference-navigation\.json/is)
    assert.match(message, /at least 2 Markdown headings/i)
    assert.match(message, /validator minimum meaningful prose: 250/i)
    assert.match(message, /aim for at least 263 meaningful prose units/i)
    assert.match(message, /5% safety margin/i)
    assert.match(message, /reviewer must return pass=false/i)
  }

  const ordinaryReference = buildTranslationMessages({
    ...common,
    sourcePath: 'content/en/reference/api/go/go/client.md',
  }).at(-1).content
  assert.doesNotMatch(ordinaryReference, /Reference landing-page contract/i)

  const cliLanding = buildTranslationMessages({
    ...common,
    sourcePath: 'content/en/reference/cli/cli/Overview.md',
  }).at(-1).content
  assert.match(cliLanding, /at least 3 Markdown headings/i)
  assert.match(cliLanding, /validator minimum meaningful prose: 400/i)
  assert.match(cliLanding, /aim for at least 420 meaningful prose units/i)

  const restLanding = buildTranslationMessages({
    ...common,
    sourcePath: 'content/en/reference/api/restful/restful/restful.md',
  }).at(-1).content
  assert.match(restLanding, /Han characters count as 2\.5 meaningful prose units/i)
  assert.match(restLanding, /do not add source facts or repetitive filler/i)
  assert.match(restLanding, /do not expand headings/i)
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
    const attempt = new AbortController()
    const callModel = async ({ agent, messages, signal }) => {
      assert.equal(signal, attempt.signal)
      calls.push(agent)
      if (agent === 'translation') return semanticTranslationResponse(messages, text => text
        .replace('Test', 'テスト')
        .replace('Hello', 'こんにちは')
        .replace('Use ', '')
        .replace(/\.$/, ' を使用します。'))
      if (agent === 'review') {
        return calls.filter(name => name === 'review').length === 1
          ? '{"pass":false,"issues":[{"severity":"low","type":"locale_style","location":"document.heading.0001","source_quote":"Hello","draft_quote":"こんにちは","comment":"Use a more specific Japanese heading."}]}'
          : '{"pass":true,"issues":[]}'
      }
      if (agent === 'correction') {
        const authorized = taggedJsonContent(messages, 'authorized_units')
        assert.deepEqual(authorized.map(unit => unit.id), ['document.heading.0001'])
        return semanticCorrectionResponse(messages, text => text.replace('こんにちは', '使用方法'))
      }
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
      signal: attempt.signal,
      maxReviewRounds: 2,
      validate: async () => [],
    })

    assert.equal(result.status, 'translated')
    assert.deepEqual(calls, ['translation', 'review', 'correction', 'review'])
    const output = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
    assert.equal(output.includes('client.search()'), true)
    assert.match(output, /# 使用方法/)
  })
}

async function testSemanticUnitsUseCoherentContextAndStableIds() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/cli/cli/semantic.md'
    const targetPath = 'content/zh-CN/reference/cli/cli/semantic.md'
    const source = [
      '---',
      'title: "Search"',
      'slug: /cli/search',
      '---',
      '',
      '# Usage\\{#usage}',
      '',
      'Use `alpha`.',
      '',
      '```bash',
      '# Keep this English comment',
      'search --name alpha',
      '```',
      '',
    ].join('\n')
    write(path.join(siteDir, sourcePath), source)
    const calls = []
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'semantic', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        calls.push(agent)
        if (agent === 'translation') {
          const context = taggedMessageContent(messages, 'document_context')
          const units = taggedJsonContent(messages, 'semantic_units')
          assert.match(context, /# Usage/)
          assert.match(context, /Keep this English comment|ZDOC-PROTECTED/)
          assert.deepEqual(units.map(unit => unit.id), [
            'document.frontmatter.title',
            'document.heading.0001',
            'document.paragraph.0001',
          ])
          return JSON.stringify({translations: [...units].reverse().map(unit => ({
            id: unit.id,
            text: unit.text
              .replace('Search', '搜索')
              .replace('Usage', '用法')
              .replace('Use ', '使用 ')
              .replace(/\.$/, '。'),
          }))})
        }
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        throw new Error(`unexpected ${agent} call`)
      },
    })

    assert.equal(result.status, 'translated')
    assert.deepEqual(calls, ['translation', 'review'])
    const output = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
    assert.match(output, /^title: "搜索"$/m)
    assert.match(output, /^# 用法\\\{#usage\}$/m)
    assert.match(output, /使用 `alpha`。/)
    assert.equal(output.match(/```bash[\s\S]*?```\n/)[0], source.match(/```bash[\s\S]*?```\n/)[0])
  })
}

async function testRestSpecsUseStructuredLocaleTranslation() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/restful/restful/v1/search.mdx'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v1/search.mdx'
    write(path.join(siteDir, sourcePath), '# Search\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"summary":"Search","description":"Search a collection.","example":{"message":"User has not authenticated"}}\nexport const endpoint = "/v1/search"\nexport const method = "post"\n')
    const specCalls = []
    let specReviewRound = 0
    const attempt = new AbortController()
    const callModel = async ({ agent, messages, signal }) => {
      assert.equal(signal, attempt.signal)
      if (messages[0].content.includes('structured Zilliz Cloud REST API')) {
        specCalls.push(agent)
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
          ...entry,
          text: entry.text === 'Search a collection.' ? '誤った検索文。' : `JA:${entry.text}`,
        })))
      }
      if (agent === 'review' && messages[0].content.includes('structured REST API localization entries')) {
        specCalls.push(agent)
        specReviewRound += 1
        if (specReviewRound > 1) return '{"pass":true,"issues":[]}'
        return JSON.stringify({
          pass: false,
          issues: [{
            severity: 'medium', type: 'accuracy_mistranslation', location: '["description"]',
            source_quote: 'Search a collection.', draft_quote: '誤った検索文。', comment: 'Correct the REST description.',
          }],
        })
      }
      if (agent === 'correction' && messages[0].content.includes('structured REST API localization entries')) {
        specCalls.push(agent)
        return JSON.stringify(JSON.parse(taggedMessageContent(messages, 'draft')).map(entry => ({
          ...entry,
          text: entry.id === '["description"]' ? 'コレクションを検索します。' : entry.text,
        })))
      }
      if (agent === 'translation') return semanticTranslationResponse(messages, text => text.replace('Search', '検索'))
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error(`unexpected agent ${agent}`)
    }
    const result = await processManifestItem({
      siteDir,
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'rest', locale: 'ja-JP', type: 'reference' },
      callModel,
      signal: attempt.signal,
      validate: async () => [],
    })
    assert.equal(result.status, 'translated')
    const output = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
    assert.match(output, /lang="ja-JP"/)
    assert.match(output, /"summary":"Search"/)
    assert.match(output, /"ja-JP":\{"summary":"JA:Search","description":"コレクションを検索します。"\}/)
    assert.match(output, /"message":"User has not authenticated"/)
    assert.match(output, /export const endpoint = "\/v1\/search"/)
    assert.deepEqual(specCalls, ['translation', 'review', 'correction', 'review'])
    assert.equal(result.restSpecReview.pass, true)
  })
}

async function testRestSpecReviewFailureDoesNotWriteTarget() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/restful/restful/v1/compaction.mdx'
    const targetPath = 'content/zh-CN/reference/api/restful/restful/v1/compaction.mdx'
    write(path.join(siteDir, sourcePath), '# Compaction\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"description":"Compaction plans merge segments."}\nexport const endpoint = "/v1/compaction"\nexport const method = "post"\n')
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'rest-compaction', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        if (messages[0].content.includes('structured Zilliz Cloud REST API')) {
          return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '压实计划会合并 Segment。'})))
        }
        if (agent === 'translation') return semanticTranslationResponse(messages)
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        throw new Error(`unexpected ${agent} call`)
      },
    })

    assert.equal(result.status, 'failed')
    assert.equal(result.failureCategory, 'locale_contract_failed')
    assert.equal(result.review.localeContractIssues.length, 1)
    assert.match(result.review.issues[0].comment, /Compaction/)
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
  })
}

async function testRestReviewerContractConflictFailsStructurally() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/restful/restful/v1/compaction-conflict.mdx'
    const targetPath = 'content/zh-CN/reference/api/restful/restful/v1/compaction-conflict.mdx'
    write(path.join(siteDir, sourcePath), '# Compaction\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"description":"Compaction plans merge segments."}\nexport const endpoint = "/v1/compaction"\nexport const method = "post"\n')
    const calls = []
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'rest-compaction-conflict', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 2,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        calls.push(agent)
        if (agent === 'translation' && messages[0].content.includes('structured Zilliz Cloud REST API')) {
          return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: 'Compaction 计划会合并 Segment。'})))
        }
        if (agent === 'translation') return semanticTranslationResponse(messages)
        if (agent === 'review' && messages.at(-1).content.includes('<source>')) {
          return JSON.stringify({
            pass: false,
            issues: [{
              severity: 'medium', type: 'terminology', location: '["description"]',
              source_quote: 'Compaction plans', draft_quote: 'Compaction 计划',
              comment: 'Compaction should be translated as 压实。',
            }],
          })
        }
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        throw new Error('Correction must not run for a REST locale-contract conflict')
      },
    })

    assert.equal(result.status, 'failed')
    assert.equal(result.failureCategory, 'contract_conflict')
    assert.equal(result.review.contractConflicts.length, 1)
    assert.equal(result.review.unsupportedIssues.length, 0)
    assert.deepEqual(calls, ['translation', 'review', 'translation', 'review'])
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
  })
}

async function testRestSpecFileRetryReceivesEntryScopedProtectedFeedback() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/restful/restful/v1/retry.mdx'
    const targetPath = 'content/zh-CN/reference/api/restful/restful/v1/retry.mdx'
    write(path.join(siteDir, sourcePath), '# Retry\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"paths":{"alpha":{"description":"Use `alpha`."},"beta":{"description":"Use `beta`."}}}\nexport const endpoint = "/v1/retry"\nexport const method = "post"\n')
    let restTranslationRound = 0
    const item = {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'a'.repeat(64), locale: 'zh-CN', type: 'reference'}
    const result = await processItemWithRetry(item, {
      maxRetries: 1,
      log: {warn: () => {}},
      processItem: (_item, _attempt, retryFeedback) => processManifestItem({
        siteDir,
        item,
        retryFeedback,
        maxReviewRounds: 0,
        validate: async () => [],
        callModel: async ({agent, messages}) => {
          if (messages[0].content.includes('structured Zilliz Cloud REST API')) {
            restTranslationRound += 1
            const entries = JSON.parse(messages[1].content.split('\n\n').at(-1))
            const markers = entries.map(entry => entry.text.match(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/)[0])
            if (restTranslationRound === 1) return JSON.stringify([
              {id: entries[0].id, text: `使用 ${markers[1]}。`},
              {id: entries[1].id, text: `使用 ${markers[0]}。`},
            ])
            assert.match(messages[1].content, /<retry_feedback>/)
            assert.match(messages[1].content, new RegExp(sourcePath.replaceAll('/', '\\/')))
            assert.match(messages[1].content, /REST translation entry \["paths","alpha","description"\]/)
            assert.match(messages[1].content, /paths\.alpha\.description/)
            return JSON.stringify(entries)
          }
          if (agent === 'translation') return semanticTranslationResponse(messages)
          if (agent === 'review') return '{"pass":true,"issues":[]}'
          throw new Error(`unexpected ${agent} call`)
        },
      }),
    })

    assert.equal(result.status, 'translated', JSON.stringify(result))
    assert.equal(result.attempts, 2)
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
          ? taggedMessageContent(messages, 'source')
            .replace('"label":"Tools"', '"label":"工具"')
            .replace('"label":"CLI"', '"label":"CLI 工具"')
            .replace('"label":"External"', '"label":"外部工具"')
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
      callModel: async ({agent, messages}) => agent === 'translation'
        ? taggedMessageContent(messages, 'source')
        : '{"pass":false,"issues":[{"severity":"high","type":"untranslated_prose","location":"sidebar label","source_quote":"Tools","draft_quote":"Tools","comment":"Labels remain materially English."}]}',
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
      callModel: async ({agent, messages}) => agent === 'translation'
        ? taggedMessageContent(messages, 'source').replace('tutorials/tools/cli', 'tutorials/tools/changed')
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

async function testProviderCallDoesNotRetryPermanentHttpClientErrors() {
  const originalFetch = global.fetch
  try {
    for (const status of [400, 401, 403, 404]) {
      let calls = 0
      global.fetch = async () => {
        calls += 1
        return {ok: false, status, json: async () => ({error: {message: `permanent ${status}`}})}
      }
      const callModel = await createProviderCall({
        translation: {baseUrl: 'https://example.com', apiKey: 'test-key', model: 'test-model'},
      }, {maxRetries: 3, retryDelayMs: 1})
      await assert.rejects(() => callModel({agent: 'translation', messages: []}), error => {
        assert.equal(error.status, status)
        assert.equal(error.failureCategory, 'unknown')
        assert.equal(error.code, 'PROVIDER_HTTP_ERROR')
        return true
      })
      assert.equal(calls, 1, `HTTP ${status} must fail without consuming provider retries`)
    }
  } finally {
    global.fetch = originalFetch
  }
}

async function testProviderStructuredOutputIsCapabilityGated() {
  const originalFetch = global.fetch
  const bodies = []
  global.fetch = async (_url, options = {}) => {
    bodies.push(JSON.parse(options.body))
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '{"pass":true,"issues":[]}' } }] }),
    }
  }

  try {
    const callModel = await createProviderCall({
      review: {
        baseUrl: 'https://example.com',
        apiKey: 'test-key',
        model: 'review-model',
        structuredOutput: true,
      },
      translation: {
        baseUrl: 'https://example.com',
        apiKey: 'test-key',
        model: 'translation-model',
      },
    })

    await callModel({agent: 'review', messages: [{role: 'user', content: 'review'}]})
    await callModel({agent: 'translation', messages: [{role: 'user', content: 'translate'}]})

    assert.deepEqual(bodies[0].response_format, {
      type: 'json_schema',
      json_schema: REVIEW_RESPONSE_JSON_SCHEMA,
    })
    assert.equal(Object.hasOwn(bodies[1], 'response_format'), false)
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
      error => {
        assert.match(error.message, /timed out/i)
        assert.equal(error.failureCategory, 'provider_timeout')
        assert.equal(error.code, 'PROVIDER_TIMEOUT')
        return true
      },
    )
    assert.equal(calls, 2)
  } finally {
    global.fetch = originalFetch
  }
}

async function testFileTimeoutRejectsSlowWork() {
  let completed = 0
  await assert.rejects(
    () => withTimeout(signal => new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        completed += 1
        resolve('late')
      }, 30)
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(signal.reason)
      }, {once: true})
    }), 1, 'Timed out translating docs/test.md after 900000ms', {code: 'FILE_TIMEOUT'}),
    error => {
      assert.equal(error.failureCategory, 'provider_timeout')
      assert.equal(error.code, 'FILE_TIMEOUT')
      assert.equal(error.timeoutMs, 1)
      assert.match(error.message, /after 900000ms/)
      return true
    },
  )
  await new Promise(resolve => setTimeout(resolve, 40))
  assert.equal(completed, 0)
}

async function testFileAttemptDeadlineSpansAllMarkdownChunksAndStopsLateCheckpoints() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/file-deadline.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/file-deadline.md'
    const source = '# One\n\nFirst paragraph.\n\n# Two\n\nSecond paragraph.\n'
    write(path.join(siteDir, sourcePath), source)
    const item = {target: 'ja-JP', sourcePath, targetPath, sourceHash: sha256(source), locale: 'ja-JP', type: 'guides'}
    const completed = []
    let active = 0
    let backgroundCompletions = 0

    const result = await processItemWithRetry(item, {
      maxRetries: 0,
      fileTimeoutMs: 25,
      processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
        siteDir,
        item,
        retryFeedback,
        chunkTargetChars: 25,
        chunkMaxChars: 35,
        chunkCheckpoint: retryContext.chunkCheckpoint,
        onChunkCompleted: checkpoint => {
          completed.push(checkpoint.index)
          retryContext.onChunkCompleted(checkpoint)
        },
        signal: retryContext.signal,
        validate: async () => [],
        maxReviewRounds: 0,
        callModel: ({agent, messages, signal}) => {
          if (agent === 'review') return Promise.resolve('{"pass":true,"issues":[]}')
          active += 1
          return new Promise((resolve, reject) => {
            const onAbort = () => {
              clearTimeout(timer)
              active -= 1
              reject(signal.reason)
            }
            const timer = setTimeout(() => {
              signal?.removeEventListener('abort', onAbort)
              active -= 1
              backgroundCompletions += 1
              resolve(semanticTranslationResponse(messages, text => `JA:${text}`))
            }, 18)
            signal?.addEventListener('abort', onAbort, {once: true})
          })
        },
      }),
    })

    await new Promise(resolve => setTimeout(resolve, 50))
    assert.equal(result.status, 'failed')
    assert.equal(result.failureCategory, 'provider_timeout')
    assert.equal(result.errorDetails.code, 'FILE_TIMEOUT')
    assert.deepEqual(completed, [0], 'only the prefix completed before the shared file deadline may checkpoint')
    assert.equal(active, 0)
    assert.equal(backgroundCompletions, 1, 'the second chunk must be aborted instead of completing after the deadline')
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
  })
}

async function testFileAttemptDeadlineAbortsRestTranslation() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/restful/restful/deadline.md'
    const targetPath = 'content/zh-CN/reference/api/restful/restful/deadline.md'
    const source = '# Search\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"description":"Search a collection."}\nexport const endpoint = "/v1/search"\nexport const method = "post"\n'
    write(path.join(siteDir, sourcePath), source)
    const item = {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: sha256(source), locale: 'zh-CN', type: 'reference'}
    let aborted = 0

    const result = await processItemWithRetry(item, {
      maxRetries: 0,
      fileTimeoutMs: 10,
      processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
        siteDir,
        item,
        retryFeedback,
        signal: retryContext.signal,
        maxReviewRounds: 0,
        validate: async () => [],
        callModel: ({agent, messages, signal}) => {
          if (agent === 'translation' && messages.at(-1).content.includes('<semantic_units>')) {
            return Promise.resolve(semanticTranslationResponse(messages, text => text.replace('Search', '搜索')))
          }
          if (agent === 'review') return Promise.resolve('{"pass":true,"issues":[]}')
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => resolve('[]'), 50)
            signal?.addEventListener('abort', () => {
              aborted += 1
              clearTimeout(timer)
              reject(signal.reason)
            }, {once: true})
          })
        },
      }),
    })

    assert.equal(result.status, 'failed')
    assert.equal(result.failureCategory, 'provider_timeout')
    assert.equal(result.errorDetails.code, 'FILE_TIMEOUT')
    assert.equal(aborted, 1, 'REST translation must receive and honor the file attempt abort signal')
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
  })
}

async function testProviderNamedFailuresRetryBoundedlyAndExternalAbortDoesNotRetry() {
  const originalFetch = global.fetch
  try {
    for (const [label, response, category] of [
      ['HTTP 408', () => ({ok: false, status: 408, json: async () => ({error: 'timeout'})}), 'provider_timeout'],
      ['APITimeoutError', () => { const error = new Error('opaque'); error.name = 'APITimeoutError'; throw error }, 'provider_timeout'],
      ['stream before response.completed', () => { throw new Error('stream closed before response.completed') }, 'provider_transport'],
    ]) {
      let calls = 0
      global.fetch = async () => {
        calls += 1
        return response()
      }
      const callModel = await createProviderCall({translation: {baseUrl: 'https://example.com', apiKey: 'key', model: 'model'}}, {maxRetries: 1, retryDelayMs: 1})
      await assert.rejects(() => callModel({agent: 'translation', messages: []}), error => {
        assert.equal(error.failureCategory, category, label)
        return true
      })
      assert.equal(calls, 2, label)
    }

    let abortedCalls = 0
    global.fetch = async (_url, options) => new Promise((resolve, reject) => {
      abortedCalls += 1
      options.signal.addEventListener('abort', () => reject(options.signal.reason), {once: true})
    })
    const callModel = await createProviderCall({translation: {baseUrl: 'https://example.com', apiKey: 'key', model: 'model'}}, {maxRetries: 3, retryDelayMs: 1})
    const controller = new AbortController()
    const pending = callModel({agent: 'translation', messages: [], signal: controller.signal})
    const reason = Object.assign(new Error('file attempt cancelled'), {failureCategory: 'provider_timeout', code: 'CHUNK_TIMEOUT'})
    controller.abort(reason)
    await assert.rejects(() => pending, error => error === reason)
    assert.equal(abortedCalls, 1)
  } finally {
    global.fetch = originalFetch
  }
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
      return semanticTranslationResponse(messages, text => text
        .replace('Long', '長文')
        .replaceAll('Section', 'セクション')
        .replaceAll('body', '本文'))
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

async function testChangelogsVisibleLinkLabelsRemainReviewableWhileUrlsStayProtected() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/changelogs.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/changelogs.md'
    const source = '# Changelog\n\nRead [JSON indexing](https://example.com/json), [collections](https://example.com/collections), and [indexing](https://example.com/indexing).\n'
    write(path.join(siteDir, sourcePath), source)
    let reviewerSawLabels = false
    const result = await processManifestItem({
      siteDir,
      item: {target: 'ja-JP', sourcePath, targetPath, sourceHash: sha256(source), locale: 'ja-JP', type: 'guides'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        if (agent === 'translation') {
          const units = taggedJsonContent(messages, 'semantic_units')
          assert.match(JSON.stringify(units), /JSON indexing/)
          assert.match(JSON.stringify(units), /collections/)
          assert.match(JSON.stringify(units), /indexing/)
          assert.doesNotMatch(JSON.stringify(units), /https:\/\/example\.com/)
          return semanticTranslationResponse(messages)
        }
        const sourceUnits = taggedJsonContent(messages, 'source_units')
        reviewerSawLabels = /JSON indexing/.test(JSON.stringify(sourceUnits)) && /collections/.test(JSON.stringify(sourceUnits))
        return JSON.stringify({pass: false, issues: [{
          severity: 'medium', type: 'untranslated_prose', location: sourceUnits.at(-1).id,
          source_quote: 'JSON indexing', draft_quote: 'JSON indexing', comment: 'Translate the visible Markdown link label.',
        }]})
      },
    })
    assert.equal(reviewerSawLabels, true)
    assert.equal(result.status, 'failed')
    assert.equal(result.failureCategory, 'locale_contract_failed')
    assert.ok(result.review.issues.some(issue => issue.source_quote === 'JSON indexing'))
    assert.ok(result.review.localeContractIssues.some(issue => /collection/i.test(issue.source_quote)))
  })
}

async function testJapaneseMandatoryTermsUseRealGuidePathsWithoutMatchingHtmlCodePayloads() {
  await withTempDir(async siteDir => {
    const modifySourcePath = 'docs/userGuide/manage-collections/modify-collections.md'
    const modifyTargetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/userGuide/manage-collections/modify-collections.md'
    const modifySource = '# Modify collections\n\nSet <code>collection.ttl.seconds</code> for the collection in the database.\n'
    write(path.join(siteDir, modifySourcePath), modifySource)
    const valid = await processManifestItem({
      siteDir,
      item: {target: 'ja-JP', sourcePath: modifySourcePath, targetPath: modifyTargetPath, sourceHash: sha256(modifySource), locale: 'ja-JP', type: 'guides'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => agent === 'review'
        ? '{"pass":true,"issues":[]}'
        : semanticTranslationResponse(messages, text => text
          .replace('Modify collections', 'コレクションの変更')
          .replace('for the collection in the database', 'コレクションをデータベースで設定します')),
    })
    assert.equal(valid.status, 'translated')
    assert.match(fs.readFileSync(path.join(siteDir, modifyTargetPath), 'utf8'), /<code>collection\.ttl\.seconds<\/code>/)

    const auditSourcePath = 'docs/userGuide/monitor/audit-logs-ref.md'
    const auditTargetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/userGuide/monitor/audit-logs-ref.md'
    const auditSource = '# Audit logs\n\nAudit logs are stored in the database for each collection.\n'
    write(path.join(siteDir, auditSourcePath), auditSource)
    const invalid = await processManifestItem({
      siteDir,
      item: {target: 'ja-JP', sourcePath: auditSourcePath, targetPath: auditTargetPath, sourceHash: sha256(auditSource), locale: 'ja-JP', type: 'guides'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => agent === 'review' ? '{"pass":true,"issues":[]}' : semanticTranslationResponse(messages),
    })
    assert.equal(invalid.status, 'failed')
    assert.equal(invalid.failureCategory, 'locale_contract_failed')
    assert.ok(invalid.review.localeContractIssues.some(issue => /database|collection/i.test(issue.source_quote)))
  })
}

async function testFileRetryResumesFromCompletedChunkCheckpoint() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/large-guide.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/large-guide.md'
    const source = '# One\n\nFirst paragraph.\n\n# Two\n\nSecond paragraph.\n\n# Three\n\nThird paragraph.\n'
    write(path.join(siteDir, sourcePath), source)
    const item = {target: 'ja-JP', sourcePath, targetPath, sourceHash: sha256(source), locale: 'ja-JP', type: 'guides'}
    const translationCalls = new Map()
    let failSecondChunk = true

    const result = await processItemWithRetry(item, {
      maxRetries: 1,
      log: {warn: () => {}},
      processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
        siteDir,
        item,
        retryFeedback,
        chunkTargetChars: 25,
        chunkMaxChars: 35,
        chunkCheckpoint: retryContext.chunkCheckpoint,
        onChunkCompleted: retryContext.onChunkCompleted,
        validate: async () => [],
        maxReviewRounds: 0,
        callModel: async ({agent, messages}) => {
          if (agent === 'review') return '{"pass":true,"issues":[]}'
          const unit = taggedJsonContent(messages, 'semantic_units')[0]
          const chunk = Number(unit.id.match(/chunk\.(\d+)/)?.[1] || 0)
          translationCalls.set(chunk, (translationCalls.get(chunk) || 0) + 1)
          if (chunk === 2 && failSecondChunk) {
            failSecondChunk = false
            throw new Error('stream disconnected before completion: stream closed before response.completed')
          }
          return semanticTranslationResponse(messages, text => `JA:${text}`)
        },
      }),
    })

    assert.equal(result.status, 'translated')
    assert.equal(result.attempts, 2)
    assert.equal(translationCalls.get(1), 1, 'completed chunk 1 must be reused')
    assert.equal(translationCalls.get(2), 2, 'failed chunk 2 must be retried')
    assert.ok(result.chunks.reused >= 1)
  })
}

async function testPostAssemblyFailureDoesNotPoisonTheNextFileAttemptWithACompleteChunkMap() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/assembly-retry.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/assembly-retry.md'
    const source = '# One\n\nFirst paragraph.\n\n# Two\n\nSecond paragraph.\n'
    write(path.join(siteDir, sourcePath), source)
    const item = {target: 'ja-JP', sourcePath, targetPath, sourceHash: sha256(source), locale: 'ja-JP', type: 'guides'}
    const translationCalls = new Map()

    const result = await processItemWithRetry(item, {
      maxRetries: 1,
      log: {warn: () => {}},
      processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
        siteDir,
        item,
        retryFeedback,
        chunkTargetChars: 25,
        chunkMaxChars: 35,
        chunkCheckpoint: retryContext.chunkCheckpoint,
        onChunkCompleted: retryContext.onChunkCompleted,
        signal: retryContext.signal,
        maxReviewRounds: 0,
        validate: async content => content.includes('POISON') ? ['assembled document is invalid'] : [],
        callModel: async ({agent, messages}) => {
          if (agent === 'review') return '{"pass":true,"issues":[]}'
          const unit = taggedJsonContent(messages, 'semantic_units')[0]
          const chunk = Number(unit.id.match(/chunk\.(\d+)/)?.[1] || 0)
          const calls = (translationCalls.get(chunk) || 0) + 1
          translationCalls.set(chunk, calls)
          return semanticTranslationResponse(messages, text => chunk === 1 && calls === 1 ? `POISON:${text}` : `JA:${text}`)
        },
      }),
    })

    assert.equal(result.status, 'translated')
    assert.equal(result.attempts, 2)
    assert.equal(translationCalls.get(1), 2, 'an unlocated failure in a non-final chunk must be regenerated')
    assert.equal(translationCalls.get(2), 2, 'an unlocated assembly failure must not retain a 100% invalid prefix')
    assert.doesNotMatch(fs.readFileSync(path.join(siteDir, targetPath), 'utf8'), /POISON/)
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
        const context = taggedMessageContent(messages, 'document_context')
        const supplied = taggedJsonContent(messages, 'semantic_units')
        assert.doesNotMatch(JSON.stringify(supplied), /import Admonition/)
        assert.match(context, /ZDOC-PROTECTED/)
        return semanticTranslationResponse(messages, text => text.replace('Test', 'テスト'))
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

async function testRepairsUnescapedHeadingAnchorsAfterTranslation() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/anchor.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/anchor.md'
    write(path.join(siteDir, sourcePath), '---\ntitle: Anchor\n---\n\n## Stable heading\\{#stable-anchor}\n\nBody.\n')
    const callModel = async ({ agent, messages }) => agent === 'translation'
      ? semanticTranslationResponse(messages, text => text.replace('Anchor', 'アンカー').replace('Stable heading', '安定した見出し').replace('Body.', '本文。'))
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

async function testRepairsTranslatedProseThatLooksLikeInvalidMdxEsm() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/python/import-jobs.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/import-jobs.md'
    write(path.join(siteDir, sourcePath), '# Import jobs\n\nReturns import jobs and pagination details.\n')
    const callModel = async ({ agent, messages }) => agent === 'translation'
      ? semanticTranslationResponse(messages, text => text
        .replace('Import jobs', 'インポートジョブ')
        .replace('Returns import jobs and pagination details.', 'import jobs の一覧とページネーション情報を含む HTTP レスポンス。'))
      : '{"pass":true,"issues":[]}'
    const result = await processManifestItem({
      siteDir,
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'import-prose-hash', locale: 'ja-JP', type: 'reference' },
      callModel,
      maxReviewRounds: 0,
    })
    assert.equal(result.status, 'translated')
    assert.match(fs.readFileSync(path.join(siteDir, targetPath), 'utf8'), /`import` jobs/)
  })
}

async function testRejectsChangedHeadingAnchorIdentity() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/tutorials/anchor-changed.md'
    const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/anchor-changed.md'
    write(path.join(siteDir, sourcePath), 'Use `stable-anchor`.\n')
    const callModel = async ({ agent, messages }) => agent === 'translation'
      ? semanticTranslationResponse(messages, text => text.replace('ZDOC-PROTECTED', 'ZDOC-PROTECTED-CHANGED'))
      : '{"pass":true,"issues":[]}'
    await assert.rejects(processManifestItem({
      siteDir,
      item: { target: 'ja-JP', sourcePath, targetPath, sourceHash: 'changed-anchor-hash', locale: 'ja-JP', type: 'docs' },
      callModel,
      maxReviewRounds: 0,
    }), /protected marker/i)
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
        return semanticTranslationResponse(messages, text => `JA:${text}`)
      }
      reviewCount += 1
      if (reviewCount !== 2) return '{"pass":true,"issues":[]}'
      const sourceUnit = taggedJsonContent(messages, 'source_units')[0]
      const draftUnit = taggedJsonContent(messages, 'draft_units')[0]
      return JSON.stringify({pass: false, issues: [{
        severity: 'low', type: 'locale_style', location: sourceUnit.id,
        source_quote: sourceUnit.text, draft_quote: draftUnit.text, comment: 'bad chunk',
      }]})
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
  assert.deepEqual(result.retryFailures, [{ attempt: 1, category: 'unknown', error: 'review failed' }])
  assert.equal(warnings.length, 1)
}

async function testFileRetryFeedsProtectedFailuresAndValidatedReviewEvidenceBackToTranslation() {
  const feedback = []
  const result = await processItemWithRetry({sourcePath: 'docs/protected-retry.md'}, {
    maxRetries: 1,
    log: {warn: () => {}},
    processItem: async (item, _attempt, retryFeedback) => {
      feedback.push(retryFeedback || null)
      if (feedback.length === 1) return {...item, status: 'failed', error: 'Protected marker 000042 was missing during translation'}
      return {...item, status: 'translated'}
    },
  })

  assert.equal(result.status, 'translated')
  assert.deepEqual(feedback, [null, 'Protected marker 000042 was missing during translation'])

  const unexpectedInlineCodeFeedback = []
  await processItemWithRetry({sourcePath: 'docs/plain-region.md'}, {
    maxRetries: 1,
    log: {warn: () => {}},
    processItem: async (item, attempt, retryFeedback) => {
      unexpectedInlineCodeFeedback.push(retryFeedback || null)
      return attempt === 0
        ? {...item, status: 'failed', error: 'Semantic unit document.paragraph.0008 changed protected content: Unexpected protected inline_code: target sha256 378e8daaca80'}
        : {...item, status: 'translated'}
    },
  })
  assert.match(unexpectedInlineCodeFeedback[1], /plain code-like tokens must remain plain/i)
  assert.match(unexpectedInlineCodeFeedback[1], /never add backticks/i)

  const invalidJsonFeedback = []
  await processItemWithRetry({sourcePath: 'docs/invalid-json.md'}, {
    maxRetries: 1,
    log: {warn: () => {}},
    processItem: async (item, attempt, retryFeedback) => {
      invalidJsonFeedback.push(retryFeedback || null)
      return attempt === 0
        ? {...item, status: 'failed', error: 'Semantic unit response must be valid JSON: Bad control character in string literal in JSON at position 1772'}
        : {...item, status: 'translated'}
    },
  })
  assert.match(invalidJsonFeedback[1], /return strict JSON/i)
  assert.match(invalidJsonFeedback[1], /escape all control characters/i)

  const semanticFeedback = []
  await processItemWithRetry({sourcePath: 'docs/semantic-retry.md'}, {
    maxRetries: 1,
    log: {warn: () => {}},
    processItem: async (item, attempt, retryFeedback) => {
      semanticFeedback.push(retryFeedback || null)
      return attempt === 0
        ? {...item, status: 'failed', error: 'review failed'}
        : {...item, status: 'translated'}
    },
  })
  assert.deepEqual(semanticFeedback, [null, null])

  const reviewFeedback = []
  await processItemWithRetry({sourcePath: 'docs/review-retry.md'}, {
    maxRetries: 1,
    log: {warn: () => {}},
    processItem: async (item, attempt, retryFeedback) => {
      reviewFeedback.push(retryFeedback || null)
      return attempt === 0
        ? {...item, status: 'failed', review: {pass: false, issues: [{
          severity: 'low', type: 'untranslated_prose', location: 'document.frontmatter.description',
          source_quote: 'bulkImport request', draft_quote: 'bulkImport request',
          comment: 'Free-form reviewer instructions must not enter retry feedback.',
        }]}}
        : {...item, status: 'translated'}
    },
  })
  assert.equal(reviewFeedback[0], null)
  assert.match(reviewFeedback[1], /validated_review_issues/)
  assert.match(reviewFeedback[1], /bulkImport request/)
  assert.doesNotMatch(reviewFeedback[1], /Free-form reviewer instructions/)
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
  assert.equal(result.failureCategory, 'unknown')
  assert.equal(result.attempts, 2)
  assert.equal(result.error, 'provider failed 2')
  assert.deepEqual(result.retryFailures, [
    { attempt: 1, category: 'unknown', error: 'provider failed 1' },
    { attempt: 2, category: 'unknown', error: 'provider failed 2' },
  ])
}

async function testFileRetryPreservesProviderFailureCategories() {
  const result = await processItemWithRetry({sourcePath: 'docs/boost-ranker.md'}, {
    maxRetries: 1,
    log: {warn: () => {}},
    processItem: async item => {
      const error = new Error('litellm.APITimeoutError: Request timed out after 240.0s')
      error.name = 'APITimeoutError'
      throw error
    },
  })

  assert.equal(result.failureCategory, 'provider_timeout')
  assert.deepEqual(result.retryFailures.map(item => item.category), ['provider_timeout', 'provider_timeout'])
}

async function testFileRetryPreservesStructuredFailureFieldsWithoutMessageParsing() {
  const longName = 'ProviderEnvelopeError'.repeat(20)
  const result = await processItemWithRetry({sourcePath: 'docs/opaque.md'}, {
    maxRetries: 0,
    processItem: async () => {
      const cause = Object.assign(new Error('inner opaque'), {name: 'ProviderCause', status: 599, code: 'INNER_CODE', failureCategory: 'provider_transport'})
      throw Object.assign(new Error('outer opaque'), {
        name: longName, status: 598, code: 'OUTER_CODE', failureCategory: 'provider_transport', cause, ignored: {secret: true},
      })
    },
  })

  assert.equal(result.failureCategory, 'provider_transport')
  assert.deepEqual(result.errorDetails, {
    name: longName.slice(0, 200), status: 598, code: 'OUTER_CODE',
    cause: {name: 'ProviderCause', status: 599, code: 'INNER_CODE', failureCategory: 'provider_transport'},
  })
  assert.deepEqual(result.retryFailures.map(item => item.category), ['provider_transport'])
}

async function testInternalRecoveryChunkSeedsNeverEnterPublicResultsOrReports() {
  await withTempDir(async siteDir => {
    const sourcePath = 'docs/internal-seed.md'
    const targetPath = 'i18n/ja-JP/internal-seed.md'
    const source = '# Source\n'
    write(path.join(siteDir, sourcePath), source)
    const item = {
      target: 'ja-JP', sourcePath, targetPath, sourceHash: sha256(source), locale: 'ja-JP', type: 'guides',
      recoveryChunkCheckpoints: [{index: 0, total: 1, sourceHash: sha256(source), translatedContent: '# ソース\n', review: {pass: true, issues: []}, semanticUnits: []}],
    }
    const result = await processItemWithRetry(item, {
      maxRetries: 0,
      initialChunkCheckpoints: item.recoveryChunkCheckpoints,
      processItem: async value => ({...value, status: 'translated'}),
    })
    assert.equal(Object.hasOwn(result, 'recoveryChunkCheckpoints'), false)

    const reportPath = 'tmp/report.json'
    const coordinator = createProgressCoordinator({
      siteDir,
      manifest: {target: 'ja-JP', locale: 'ja-JP', group: 'guides', items: [item]},
      reportPath,
      checkpointFiles: 1,
      checkpointIntervalMs: 1000,
    })
    await coordinator.record(result, 0)
    await coordinator.checkpoint(true)
    assert.doesNotMatch(fs.readFileSync(path.join(siteDir, reportPath), 'utf8'), /recoveryChunkCheckpoints/)

    const failed = await processItemWithRetry(item, {
      maxRetries: 0,
      initialChunkCheckpoints: item.recoveryChunkCheckpoints,
      processItem: async value => ({...value, status: 'failed', error: 'opaque'}),
    })
    assert.equal(Object.hasOwn(failed, 'recoveryChunkCheckpoints'), false)
    assert.equal(Object.hasOwn(failed, 'chunkCheckpoints'), true)
  })
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

async function testChineseReferenceProgressStateUsesItsTargetManifest() {
  await withTempDir(async siteDir => {
    const sourceCommit = 'c'.repeat(40)
    const workflowSha = 'a'.repeat(40)
    const changedSourcePath = 'content/en/reference/api/python/changed.md'
    const changedTargetPath = 'content/zh-CN/reference/api/python/changed.md'
    const unchangedSourcePath = 'content/en/reference/api/python/unchanged.md'
    const unchangedTargetPath = 'content/zh-CN/reference/api/python/unchanged.md'
    const changedSource = '# Changed Reference\n'
    const changedTarget = '# 已更改的参考\n'
    const unchanged = '# Same Reference\n'
    write(path.join(siteDir, changedSourcePath), changedSource)
    write(path.join(siteDir, changedTargetPath), changedTarget)
    write(path.join(siteDir, unchangedSourcePath), unchanged)
    write(path.join(siteDir, unchangedTargetPath), unchanged)
    const referenceSourceManifest = {
      schemaVersion: 1,
      sourceCommit,
      records: [
        {manual: 'python', sourcePath: changedSourcePath, sourceHash: sha256(changedSource)},
        {manual: 'python', sourcePath: unchangedSourcePath, sourceHash: sha256(unchanged)},
      ],
    }
    write(path.join(siteDir, 'generated/en/manifests/reference.json'), JSON.stringify(referenceSourceManifest))
    const retiredTargetPath = 'content/zh-CN/reference/api/python/retired.md'
    const retiredTarget = '# 退役\n'
    write(path.join(siteDir, retiredTargetPath), retiredTarget)
    const retiredReference = {
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/retired.md',
      targetPath: retiredTargetPath,
      sourceCommit,
      sourceHash: sha256(''),
      targetHash: sha256(retiredTarget),
      status: 'retired',
    }
    write(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), JSON.stringify({
      schemaVersion: 1,
      records: [retiredReference],
    }))

    const referenceManifest = {
      target: 'zh-CN-reference',
      locale: 'zh-CN',
      sourceCheckpointSha: workflowSha,
      items: [
        {
          sourcePath: changedSourcePath,
          targetPath: changedTargetPath,
          sourceHash: sha256(changedSource),
          locale: 'zh-CN',
          type: 'reference',
          reason: 'missing_target',
        },
        {
          sourcePath: unchangedSourcePath,
          targetPath: unchangedTargetPath,
          sourceHash: sha256(unchanged),
          locale: 'zh-CN',
          type: 'reference',
          reason: 'missing_target',
        },
      ],
    }
    const referenceCoordinator = createProgressCoordinator({
      siteDir,
      manifest: referenceManifest,
      cache: {files: {}},
      reportPath: 'tmp/reference-report.json',
      checkpointFiles: 1,
    })
    await referenceCoordinator.record({...referenceManifest.items[0], status: 'translated'}, 0)
    await referenceCoordinator.record({...referenceManifest.items[1], status: 'translated'}, 1)
    await referenceCoordinator.checkpoint(true)

    assert.equal(fs.existsSync(path.join(siteDir, '.translation-cache/zh-CN.json')), false)
    const referenceState = JSON.parse(fs.readFileSync(path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'))
    assert.deepEqual(referenceState.records.map(record => record.sourcePath), [
      changedSourcePath,
      retiredReference.sourcePath,
      unchangedSourcePath,
    ])
    assert.equal(referenceState.records[0].manual, 'python')
    assert.equal(referenceState.records[0].sourceCommit, workflowSha)
    assert.equal(referenceState.records[0].sourceHash, sha256(changedSource))
    assert.equal(referenceState.records[0].targetHash, sha256(changedTarget))
    assert.equal(referenceState.records[0].status, 'translated')
    assert.equal(referenceState.records[1].status, 'retired')
    assert.equal(referenceState.records[2].sourceCommit, workflowSha)
    assert.equal(referenceState.records[2].sourceHash, sha256(unchanged))
    assert.equal(referenceState.records[2].targetHash, sha256(unchanged))
    assert.equal(referenceState.records[2].status, 'unchanged')
    assert.ok(referenceState.records.every(record => record.sourcePath.startsWith('content/en/reference/')))
    const candidateOptions = {
      repositoryRoot: siteDir,
      targetId: 'zh-CN-reference',
      group: 'python',
      ownedSourcePaths: ['content/en/reference/api/python/python'],
      preservedSourcePaths: ['content/en/reference/api/python/python/python.md'],
      changedSourcePaths: [],
      mode: 'incremental',
    }
    assert.deepEqual(buildTranslationCandidates(candidateOptions).candidates, [])
    assert.throws(
      () => buildTranslationCandidates({...candidateOptions, targetId: 'zh-CN-tools'}),
      /Unknown translation target: zh-CN-tools/,
    )

    const referenceReport = JSON.parse(fs.readFileSync(path.join(siteDir, 'tmp/reference-report.json'), 'utf8'))
    assert.equal(referenceReport.target, 'zh-CN-reference')
    assert.equal(referenceReport.checkpoint.target, 'zh-CN-reference')
    assert.ok(referenceReport.results.every(result => result.target === 'zh-CN-reference'))
    assert.doesNotThrow(() => validateReferenceTranslation({
      repositoryRoot: siteDir,
      sourceRoot: 'content/en/reference',
      targetRoot: 'content/zh-CN/reference',
      sourceManifest: {...referenceSourceManifest, sourceCommit: workflowSha},
      translationManifest: {
        ...referenceState,
        records: referenceState.records.map(record => ({...record, sourceCommit: workflowSha})),
      },
    }))
  })
}

async function testReferenceProgressStateAcceptsNewSourceMissingFromStaleManifest() {
  await withTempDir(async siteDir => {
    const staleSourceCommit = 'a'.repeat(40)
    const currentSourceCommit = 'b'.repeat(40)
    const sourcePath = 'content/en/reference/api/python/python/MilvusClient/MilvusClient-Authentication/utility-create_user.md'
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/')
    const source = '# Create user\n'
    const target = '# 创建用户\n'
    write(path.join(siteDir, sourcePath), source)
    write(path.join(siteDir, targetPath), target)
    write(path.join(siteDir, 'generated/en/manifests/reference.json'), JSON.stringify({
      schemaVersion: 1,
      sourceCommit: staleSourceCommit,
      records: [],
    }))

    const manifest = {
      target: 'zh-CN-reference',
      locale: 'zh-CN',
      group: 'python',
      sourceCheckpointSha: currentSourceCommit,
      items: [{
        sourcePath,
        targetPath,
        sourceHash: sha256(source),
        locale: 'zh-CN',
        type: 'reference',
        reason: 'missing_target',
      }],
    }
    const coordinator = createProgressCoordinator({
      siteDir,
      manifest,
      reportPath: 'tmp/reference-new-source-report.json',
      checkpointFiles: 1,
    })
    await coordinator.record({...manifest.items[0], status: 'translated'}, 0)
    await coordinator.checkpoint(true)

    const state = JSON.parse(fs.readFileSync(
      path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'),
      'utf8',
    ))
    assert.equal(state.records[0].manual, 'python')
    assert.equal(state.records[0].sourceCommit, currentSourceCommit)
  })
}

async function testReferenceProgressStateUsesCanonicalRawLexicalOrder() {
  await withTempDir(async siteDir => {
    const sourceCommit = 'c'.repeat(40)
    const importSourcePath = 'content/en/reference/api/go/v2-DataImport.md'
    const databaseSourcePath = 'content/en/reference/api/go/v2-Database.md'
    const importTargetPath = 'content/zh-CN/reference/api/go/v2-DataImport.md'
    const databaseTargetPath = 'content/zh-CN/reference/api/go/v2-Database.md'
    const importSource = '# Data Import\n'
    const databaseSource = '# Database\n'

    write(path.join(siteDir, importSourcePath), importSource)
    write(path.join(siteDir, databaseSourcePath), databaseSource)
    write(path.join(siteDir, importTargetPath), '# 数据导入\n')
    write(path.join(siteDir, databaseTargetPath), '# 数据库\n')
    write(path.join(siteDir, 'generated/en/manifests/reference.json'), JSON.stringify({
      schemaVersion: 1,
      sourceCommit,
      records: [
        {manual: 'go', sourcePath: importSourcePath, sourceHash: sha256(importSource)},
        {manual: 'go', sourcePath: databaseSourcePath, sourceHash: sha256(databaseSource)},
      ],
    }))

    const manifest = {
      target: 'zh-CN-reference',
      locale: 'zh-CN',
      sourceCheckpointSha: sourceCommit,
      items: [
        {
          sourcePath: importSourcePath,
          targetPath: importTargetPath,
          sourceHash: sha256(importSource),
          locale: 'zh-CN',
          type: 'reference',
          reason: 'missing_target',
        },
        {
          sourcePath: databaseSourcePath,
          targetPath: databaseTargetPath,
          sourceHash: sha256(databaseSource),
          locale: 'zh-CN',
          type: 'reference',
          reason: 'missing_target',
        },
      ],
    }
    const coordinator = createProgressCoordinator({
      siteDir,
      manifest,
      reportPath: 'tmp/reference-order-report.json',
      checkpointFiles: 1,
    })

    await runWorkerPool(manifest.items, {
      concurrency: 2,
      processItem: async (item, index) => {
        if (index === 0) await new Promise(resolve => setTimeout(resolve, 5))
        return {...item, status: 'translated'}
      },
      onResult: coordinator.record,
    })
    await coordinator.checkpoint(true)

    const referenceState = JSON.parse(fs.readFileSync(
      path.join(siteDir, 'generated/zh-CN/manifests/reference-translations.json'),
      'utf8',
    ))
    assert.deepEqual(referenceState.records.map(record => record.sourcePath), [
      importSourcePath,
      databaseSourcePath,
    ])
  })
}

async function testRestoresFencedCodeCommentsByteForByte() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/java/code-comment.md'
    const targetPath = 'content/zh-CN/reference/api/java/code-comment.md'
    const source = '# Java example\n\n```java\n// Create a collection\nString name = "quick_setup";\n\n// output: quick_setup\n```\n\nContinue.\n'
    write(path.join(siteDir, sourcePath), source)
    const callModel = async ({agent, messages}) => {
      if (agent === 'translation') {
        const units = taggedJsonContent(messages, 'semantic_units')
        assert.doesNotMatch(JSON.stringify(units), /Create a collection/)
        return semanticTranslationResponse(messages, text => text
          .replace('Java example', 'Java 示例')
          .replace('Continue.', '继续。'))
      }
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error(`unexpected agent ${agent}`)
    }
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'code-comment', locale: 'zh-CN', type: 'reference'},
      callModel,
      maxReviewRounds: 0,
      validate: async () => [],
    })
    assert.equal(result.status, 'translated')
    const output = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
    assert.equal(output.match(/```java[\s\S]*?```\n/)[0], source.match(/```java[\s\S]*?```\n/)[0])
  })
}

async function testAllowsProtectedMarkerReorderingInsideOneSemanticUnit() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/cli/cli/reorder.md'
    const targetPath = 'content/zh-CN/reference/cli/cli/reorder.md'
    write(path.join(siteDir, sourcePath), 'Use `alpha` at https://example.com.\n')
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'reorder', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        if (agent === 'review') {
          const markerPattern = /<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/g
          assert.deepEqual(
            [...taggedMessageContent(messages, 'draft_document').matchAll(markerPattern)].map(match => match[0]).sort(),
            [...taggedMessageContent(messages, 'source_document').matchAll(markerPattern)].map(match => match[0]).sort(),
          )
          return '{"pass":true,"issues":[]}'
        }
        const unit = taggedJsonContent(messages, 'semantic_units')[0]
        const markers = unit.text.match(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/g)
        assert.equal(markers.length, 2)
        return JSON.stringify({translations: [{
          id: unit.id,
          text: `请访问 ${markers[1]} 并使用 ${markers[0]}。`,
        }]})
      },
    })

    assert.equal(result.status, 'translated')
    assert.equal(fs.readFileSync(path.join(siteDir, targetPath), 'utf8'), '请访问 https://example.com. 并使用 `alpha`。\n')
  })
}

async function testRejectsProtectedMarkerMovementAcrossSemanticUnits() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/cli/cli/cross-unit-marker.md'
    const targetPath = 'content/zh-CN/reference/cli/cli/cross-unit-marker.md'
    write(path.join(siteDir, sourcePath), 'Use `alpha`.\n\nUse `beta`.\n')
    await assert.rejects(processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'cross-unit', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        if (agent !== 'translation') throw new Error('Review must not run after cross-unit marker movement')
        const units = taggedJsonContent(messages, 'semantic_units')
        const markers = units.map(unit => unit.text.match(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/)[0])
        return JSON.stringify({translations: [
          {id: units[0].id, text: `使用 ${markers[1]}。`},
          {id: units[1].id, text: `使用 ${markers[0]}。`},
        ]})
      },
    }), /unknown|missing protected marker/i)
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)
  })
}

async function testNormalizesPrivateLinkEndpointWithoutRewritingCliCommandHeading() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/cli/cli/create.md'
    const targetPath = 'content/zh-CN/reference/cli/cli/create.md'
    const source = [
      '---',
      'description: "This operation creates a PrivateLink endpoint. | Cloud"',
      '---',
      '',
      '# create',
      '',
      'This operation creates a PrivateLink endpoint.',
      '',
      '## Usage\\{#usage}',
      '',
    ].join('\n')
    write(path.join(siteDir, sourcePath), source)
    const calls = []
    let reviewRound = 0
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'endpoint', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 1,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        calls.push(agent)
        if (agent === 'translation') return semanticTranslationResponse(messages, (text, unit) => {
          if (unit.id === 'document.frontmatter.description') return '此操作会创建一个 PrivateLink endpoint。 | Cloud'
          if (unit.id === 'document.paragraph.0001') return '此操作会创建一个 PrivateLink endpoint。'
          if (unit.id === 'document.heading.0002') return '用法'
          return text
        })
        if (agent === 'review') {
          reviewRound += 1
          return '{"pass":true,"issues":[]}'
        }
        throw new Error('Deterministic Endpoint normalization must not require Correction')
      },
    })

    assert.equal(reviewRound, 1)
    assert.deepEqual(calls, ['translation', 'review'])
    assert.equal(result.status, 'translated')
    const output = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
    assert.match(output, /^# create$/m)
    assert.match(output, /PrivateLink Endpoint/g)
    assert.doesNotMatch(output, /PrivateLink endpoint/)
    assert.match(output, /^## 用法\\\{#usage\}$/m)
  })
}

async function testContractConflictingReviewerIssueFailsStructurallyAndEntersRecoveryArtifact() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/java/compaction.md'
    const targetPath = 'content/zh-CN/reference/api/java/compaction.md'
    write(path.join(siteDir, sourcePath), '# Compaction plans\n')
    const calls = []
    const callModel = async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') return semanticTranslationResponse(messages, text => text.replace('Compaction plans', 'Compaction 计划'))
      if (agent === 'review') return JSON.stringify({
        pass: false,
        issues: [{
          severity: 'medium',
          type: 'terminology',
          location: 'document.heading.0001',
          source_quote: 'Compaction plans',
          draft_quote: 'Compaction 计划',
          comment: 'Compaction should be translated as 压实。',
        }],
      })
      throw new Error('Correction must not run for a locale-contract conflict')
    }
    const item = {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'compaction-correct', locale: 'zh-CN', type: 'reference'}
    const result = await processItemWithRetry(item, {
      maxRetries: 1,
      log: {warn: () => {}},
      processItem: () => processManifestItem({
        siteDir,
        item,
        callModel,
        maxReviewRounds: 2,
        validate: async () => [],
      }),
    })
    assert.equal(result.status, 'failed')
    assert.equal(result.failureCategory, 'contract_conflict')
    assert.equal(result.review.contractConflicts.length, 1)
    assert.deepEqual(result.retryFailures.map(failure => failure.category), ['contract_conflict', 'contract_conflict'])
    assert.deepEqual(calls, ['translation', 'review', 'translation', 'review'])
    assert.equal(fs.existsSync(path.join(siteDir, targetPath)), false)

    const artifactDir = path.join(siteDir, 'recovery-artifact')
    const artifact = createRecoveryArtifact({
      siteDir,
      outputDir: artifactDir,
      results: [result],
      identity: {
        locale: 'zh-CN', group: 'java', promptContractSha256: 'c'.repeat(64), model: 'translation-model',
        sourceSha: 'a'.repeat(40), toolingSha: 'b'.repeat(40), mode: 'full', batchIndex: 0, batchCount: 1,
      },
    })
    assert.deepEqual(artifact.metadata.failureCounts, {contract_conflict: 1})
    assert.equal(artifact.failures[0].failureCategory, 'contract_conflict')
    assert.deepEqual(artifact.failures[0].retryFailures.map(failure => failure.category), ['contract_conflict', 'contract_conflict'])
  })
}

async function testOrdinaryMandatoryLocaleIssueRemainsLocaleContractFailure() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/java/compaction-locale-failure.md'
    const targetPath = 'content/zh-CN/reference/api/java/compaction-locale-failure.md'
    write(path.join(siteDir, sourcePath), '# Compaction plans\n')
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'compaction-locale-failure', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 0,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        if (agent === 'translation') return semanticTranslationResponse(messages, () => '压实计划')
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        throw new Error(`unexpected ${agent} call`)
      },
    })

    assert.equal(result.status, 'failed')
    assert.equal(result.failureCategory, 'locale_contract_failed')
    assert.equal(result.review.localeContractIssues.length, 1)
  })
}

async function testDeterministicCompactionIssueCorrectsForbiddenChineseTerms() {
  for (const forbidden of ['压缩', '压实']) {
    await withTempDir(async siteDir => {
      const sourcePath = `content/en/reference/api/java/compaction-${forbidden}.md`
      const targetPath = `content/zh-CN/reference/api/java/compaction-${forbidden}.md`
      write(path.join(siteDir, sourcePath), '# Compaction plans\n')
      const calls = []
      let reviewRound = 0
      const callModel = async ({agent, messages}) => {
        calls.push(agent)
        if (agent === 'translation') return semanticTranslationResponse(messages, () => `${forbidden}计划`)
        if (agent === 'review') {
          reviewRound += 1
          if (reviewRound > 1) return '{"pass":true,"issues":[]}'
          return JSON.stringify({
            pass: false,
            issues: [{
              severity: 'medium',
              type: 'terminology',
              location: 'document.heading.0001',
              source_quote: 'Compaction plans',
              draft_quote: `${forbidden}计划`,
              comment: 'Compaction should be translated as 压实。',
            }],
          })
        }
        if (agent === 'correction') {
          const message = messages.at(-1).content
          assert.match(message, /Locale contract .* requires Compaction/)
          assert.match(message, new RegExp(forbidden))
          assert.doesNotMatch(message, /Compaction should be translated as 压实/)
          return semanticCorrectionResponse(messages, () => 'Compaction 计划')
        }
        throw new Error(`unexpected agent ${agent}`)
      }
      const result = await processManifestItem({
        siteDir,
        item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: `compaction-${forbidden}`, locale: 'zh-CN', type: 'reference'},
        callModel,
        maxReviewRounds: 2,
        validate: async () => [],
      })
      assert.equal(result.status, 'translated')
      assert.deepEqual(calls, ['translation', 'review', 'correction', 'review'])
      assert.equal(fs.readFileSync(path.join(siteDir, targetPath), 'utf8'), '# Compaction 计划\n')
    })
  }

  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/java/compression.md'
    const targetPath = 'content/zh-CN/reference/api/java/compression.md'
    write(path.join(siteDir, sourcePath), '# Enable response compression\n')
    const calls = []
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'compression', locale: 'zh-CN', type: 'reference'},
      callModel: async ({agent, messages}) => {
        calls.push(agent)
        if (agent === 'translation') return semanticTranslationResponse(messages, () => '启用响应压缩')
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        throw new Error(`unexpected agent ${agent}`)
      },
      maxReviewRounds: 2,
      validate: async () => [],
    })
    assert.equal(result.status, 'translated')
    assert.deepEqual(calls, ['translation', 'review'])
  })
}

async function testOnlyValidatedReviewerIssuesReachCorrection() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/java/evidence.md'
    const targetPath = 'content/zh-CN/reference/api/java/evidence.md'
    write(path.join(siteDir, sourcePath), '# Create an index\n')
    let reviewRound = 0
    const calls = []
    const callModel = async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') return semanticTranslationResponse(messages, () => '创建一个索引')
      if (agent === 'review') {
        reviewRound += 1
        if (reviewRound > 1) return '{"pass":true,"issues":[]}'
        return JSON.stringify({
          pass: false,
          issues: [
            {
              severity: 'medium', type: 'accuracy_mistranslation', location: 'document.heading.0001',
              source_quote: 'Create an index', draft_quote: '创建一个索引', comment: 'Remove the unnecessary classifier.',
            },
            {
              severity: 'high', type: 'accuracy_addition', location: 'missing',
              source_quote: 'not in source', draft_quote: '创建一个索引', comment: 'Unsupported allegation.',
            },
          ],
        })
      }
      if (agent === 'correction') {
        const message = messages.at(-1).content
        assert.match(message, /Remove the unnecessary classifier/)
        assert.doesNotMatch(message, /Unsupported allegation/)
        return semanticCorrectionResponse(messages, () => '创建索引')
      }
      throw new Error(`unexpected agent ${agent}`)
    }
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'evidence', locale: 'zh-CN', type: 'reference'},
      callModel,
      maxReviewRounds: 2,
      validate: async () => [],
    })
    assert.equal(result.status, 'translated')
    assert.deepEqual(calls, ['translation', 'review', 'correction', 'review'])
  })
}

async function testIdenticalFrontmatterTokenAllegationDoesNotRewriteDraft() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/go/token.md'
    const targetPath = 'content/zh-CN/reference/api/go/token.md'
    write(path.join(siteDir, sourcePath), '---\ntitle: Token\ntoken: same-token\ntype: reference\n---\n\n# Token\n')
    const calls = []
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'same-token', locale: 'zh-CN', type: 'reference'},
      callModel: async ({agent, messages}) => {
        calls.push(agent)
        if (agent === 'translation') return semanticTranslationResponse(messages, text => text.replaceAll('Token', '令牌'))
        if (agent === 'review') return JSON.stringify({
          pass: false,
          issues: [{
            severity: 'high', type: 'protected_content', location: 'frontmatter token',
            source_quote: 'same-token', draft_quote: 'same-token', comment: 'Frontmatter token was changed from same-token to same-token.',
          }],
        })
        throw new Error('Correction must not run for identical token evidence')
      },
      maxReviewRounds: 2,
      validate: async () => [],
    })
    assert.equal(result.status, 'translated')
    assert.deepEqual(calls, ['translation', 'review'])
    assert.equal(fs.readFileSync(path.join(siteDir, targetPath), 'utf8').includes('token: same-token'), true)
  })
}

async function testCorrectionsPreserveProtectedBytesAcrossMultipleRounds() {
  await withTempDir(async siteDir => {
    const sourcePath = 'content/en/reference/api/java/multi-correction.md'
    const targetPath = 'content/zh-CN/reference/api/java/multi-correction.md'
    const source = '# Initial heading\n\n```java\n// Keep this English comment\nSystem.out.println("ok");\n```\n'
    write(path.join(siteDir, sourcePath), source)
    let reviewRound = 0
    let correctionRound = 0
    const result = await processManifestItem({
      siteDir,
      item: {target: 'zh-CN-reference', sourcePath, targetPath, sourceHash: 'multi-correction', locale: 'zh-CN', type: 'reference'},
      maxReviewRounds: 2,
      validate: async () => [],
      callModel: async ({agent, messages}) => {
        if (agent === 'translation') return semanticTranslationResponse(messages, text => text.replace('Initial heading', '错误一'))
        if (agent === 'review') {
          reviewRound += 1
          if (reviewRound === 3) return '{"pass":true,"issues":[]}'
          return JSON.stringify({
            pass: false,
            issues: [{
              severity: 'medium', type: 'accuracy_mistranslation', location: 'document.heading.0001',
              source_quote: 'Initial heading', draft_quote: reviewRound === 1 ? '错误一' : '错误二',
              comment: 'Correct the heading with a local edit.',
            }],
          })
        }
        correctionRound += 1
        return semanticCorrectionResponse(messages, text => text
          .replace(correctionRound === 1 ? '错误一' : '错误二', correctionRound === 1 ? '错误二' : '正确标题'))
      },
    })
    assert.equal(result.status, 'translated')
    const output = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
    assert.match(output, /# 正确标题/)
    assert.equal(output.match(/```java[\s\S]*?```\n/)[0], source.match(/```java[\s\S]*?```\n/)[0])
  })
}

async function run() {
  testSelectsPromptsByTranslationTarget()
  testPartitionsRecoveredFilesWithoutChangingOriginalIndexes()
  testRecoveryIdentityUsesAuthoritativeToolingSha()
  testAuthenticatesRecoveryAnalysisAgainstCurrentManifestAndRestoredBytes()
  testRejectsRecoveryAnalysisThatWidensOrChangesCurrentPendingWork()
  testMessageBuildersSelectPromptsFromTarget()
  testTranslationMessagesIncludeOnlyExplicitRetryFeedback()
  testReferenceLandingMessagesContainNavigationContract()
  testValidatesExactManifestTargetContract()
  await testSemanticUnitsUseCoherentContextAndStableIds()
  await testCorrectionRunsWhenReviewFails()
  await testRestSpecsUseStructuredLocaleTranslation()
  await testRestSpecReviewFailureDoesNotWriteTarget()
  await testRestReviewerContractConflictFailsStructurally()
  await testRestSpecFileRetryReceivesEntryScopedProtectedFeedback()
  await testProviderCallRetriesTransientFailures()
  await testProviderCallDoesNotRetryPermanentHttpClientErrors()
  await testProviderStructuredOutputIsCapabilityGated()
  await testProviderCallTimesOutHungRequests()
  await testFileTimeoutRejectsSlowWork()
  await testFileAttemptDeadlineSpansAllMarkdownChunksAndStopsLateCheckpoints()
  await testFileAttemptDeadlineAbortsRestTranslation()
  await testProviderNamedFailuresRetryBoundedlyAndExternalAbortDoesNotRetry()
  testRetryableProviderErrors()
  testChunkLimitConfiguration()
  testFileRetryConfiguration()
  testStripCodeFencePreservesDocumentClosingFence()
  testStripCodeFenceRemovesResponseWrapper()
  testChunkMessagesContainContinuityContext()
  testStabilizesBoldBareUrlsBeforeJapanesePunctuation()
  await testLongDocumentTranslatesChunksSequentially()
  await testChangelogsVisibleLinkLabelsRemainReviewableWhileUrlsStayProtected()
  await testJapaneseMandatoryTermsUseRealGuidePathsWithoutMatchingHtmlCodePayloads()
  await testFileRetryResumesFromCompletedChunkCheckpoint()
  await testPostAssemblyFailureDoesNotPoisonTheNextFileAttemptWithACompleteChunkMap()
  await testRestoresSourceImportsBeforeValidation()
  await testRepairsUnescapedHeadingAnchorsAfterTranslation()
  await testRepairsTranslatedProseThatLooksLikeInvalidMdxEsm()
  await testRejectsChangedHeadingAnchorIdentity()
  await testFailedChunkDoesNotWritePartialTarget()
  await testWorkerPoolLimitsConcurrencyAndProcessesExactlyOnce()
  await testWorkerPoolIsolatesItemFailures()
  await testFileRetryRecoversFailedTranslation()
  await testFileRetryFeedsProtectedFailuresAndValidatedReviewEvidenceBackToTranslation()
  await testFileRetryRecordsPersistentFailure()
  await testFileRetryPreservesProviderFailureCategories()
  await testFileRetryPreservesStructuredFailureFieldsWithoutMessageParsing()
  await testInternalRecoveryChunkSeedsNeverEnterPublicResultsOrReports()
  await testWorkerPoolStopsAssigningNewItems()
  await testChineseReferenceProgressStateUsesItsTargetManifest()
  await testReferenceProgressStateAcceptsNewSourceMissingFromStaleManifest()
  await testReferenceProgressStateUsesCanonicalRawLexicalOrder()
  await testProgressCoordinatorCheckpointsCacheAndReport()
  await testJapaneseProgressStatePreservesExistingLocaleCache()
  await testAllowsProtectedMarkerReorderingInsideOneSemanticUnit()
  await testRejectsProtectedMarkerMovementAcrossSemanticUnits()
  await testNormalizesPrivateLinkEndpointWithoutRewritingCliCommandHeading()
  await testRestoresFencedCodeCommentsByteForByte()
  await testContractConflictingReviewerIssueFailsStructurallyAndEntersRecoveryArtifact()
  await testOrdinaryMandatoryLocaleIssueRemainsLocaleContractFailure()
  await testDeterministicCompactionIssueCorrectsForbiddenChineseTerms()
  await testOnlyValidatedReviewerIssuesReachCorrection()
  await testIdenticalFrontmatterTokenAllegationDoesNotRewriteDraft()
  await testCorrectionsPreserveProtectedBytesAcrossMultipleRounds()
  console.log('translation agent runner tests passed')
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
