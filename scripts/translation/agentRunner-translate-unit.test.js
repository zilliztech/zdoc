'use strict'

const assert = require('node:assert/strict')
const {loadLocaleContract} = require('./localeContract')

const {
  createAdaptiveCallBudget,
  createProviderRetryBudget,
  translateAndReviewUnit,
} = require('./agentRunner')

// These integration tests call translateAndReviewUnit directly with a mocked
// callModel, exercising the unit's own orchestration (semantic subdivision,
// adaptive retry, protected-token preservation, review loop) without the file
// scaffolding processManifestItem layers on top.
async function runTranslationUnit({
  sourceContent,
  locale = 'ja-JP',
  maxReviewRounds = 0,
  adaptiveTargetChars = 16000,
  adaptiveMaxChars = 24000,
  callModel,
  signal,
  env = {TRANSLATION_POLISH: undefined},
}) {
  const previous = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]))
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  try {
    return await translateAndReviewUnit({
      target: locale,
      sourcePath: 'content/en/guides/unit.md',
      sourceContent,
      locale,
      callModel,
      maxReviewRounds,
      chunkContext: null,
      providerRetryBudget: createProviderRetryBudget(3),
      adaptiveCallBudget: createAdaptiveCallBudget(4),
      adaptiveTargetChars,
      adaptiveMaxChars,
      signal,
    })
  } finally {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    for (const key of Object.keys(previous)) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  }
}

function passthroughTranslation(messages) {
  // The <semantic_units> block carries the protected source text; returning
  // the same text translated to Japanese for the prose lets a test keep every
  // protected marker byte-identical while producing a distinct translation.
  const match = messages.at(-1).content.match(/<semantic_units>\n([\s\S]*?)<\/semantic_units>/)
  const units = JSON.parse(match[1])
  return JSON.stringify({translations: units.map(unit => ({id: unit.id, text: unit.text}))})
}

async function testEmptyDocumentReturnsSourceVerbatim() {
  const calls = []
  const result = await runTranslationUnit({
    sourceContent: '',
    callModel: async ({agent}) => {
      calls.push(agent)
      throw new Error(`model must not be called for an empty document (got ${agent})`)
    },
  })
  assert.equal(result.translatedContent, '')
  assert.equal(result.semanticUnits, 0)
  assert.equal(result.review.pass, true)
  assert.deepEqual(calls, [])
}

async function testProtectedTokensRemainByteIdentical() {
  const ja = loadLocaleContract('ja-JP')
  const token = ja.doNotTranslate[0]
  const source = `# ${token}\n\nConnect to ${token} from your cluster.\n`
  const calls = []
  const result = await runTranslationUnit({
    sourceContent: source,
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') {
        const match = messages.at(-1).content.match(/<semantic_units>\n([\s\S]*?)<\/semantic_units>/)
        const units = JSON.parse(match[1])
        return JSON.stringify({
          translations: units.map(unit => ({id: unit.id, text: unit.text.replace(`${token} から接続します`, '変更済み')})),
        })
      }
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error(`unexpected agent ${agent}`)
    },
  })
  assert.equal(result.review.pass, true)
  assert.match(result.translatedContent, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(result.translatedContent, /# /)
}

async function testProviderTimeoutTriggersAdaptiveSubdivision() {
  const source = [
    '# Overview',
    '',
    'First paragraph of a multi-unit document.',
    '',
    'Second paragraph of a multi-unit document.',
    '',
  ].join('\n')
  const batches = []
  const result = await runTranslationUnit({
    sourceContent: source,
    adaptiveTargetChars: 1,
    adaptiveMaxChars: 2,
    callModel: async ({agent, messages}) => {
      if (agent === 'translation') {
        const match = messages.at(-1).content.match(/<semantic_units>\n([\s\S]*?)<\/semantic_units>/)
        const unitIds = JSON.parse(match[1]).map(unit => unit.id)
        batches.push(unitIds)
        if (batches.length === 1) {
          throw Object.assign(new Error('Request timed out after 240.0s'), {
            failureCategory: 'provider_timeout',
            code: 'PROVIDER_TIMEOUT',
            providerAttempts: 1,
            adaptiveSubdivisionRecommended: true,
          })
        }
        return passthroughTranslation(messages)
      }
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error(`unexpected agent ${agent}`)
    },
  })
  assert.equal(result.review.pass, true)
  assert.ok(batches.length >= 2, `expected adaptive subdivision, got ${batches.length} translation batches`)
  assert.ok(batches[0].length > Math.max(...batches.slice(1).map(batch => batch.length)))
}

async function testPolishBrokenLocaleContractRevertsToTranslationDraft() {
  const ja = loadLocaleContract('ja-JP')
  const term = ja.mandatoryTerms.find(candidate => candidate.source === 'cluster')
  const source = `# Setup\n\nCreate a cluster for the deployment.\n`
  const calls = []
  const result = await runTranslationUnit({
    sourceContent: source,
    maxReviewRounds: 0,
    env: {TRANSLATION_POLISH: 'true'},
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') {
        const match = messages.at(-1).content.match(/<semantic_units>\n([\s\S]*?)<\/semantic_units>/)
        const units = JSON.parse(match[1])
        return JSON.stringify({
          translations: units.map(unit => ({id: unit.id, text: unit.text.replace('cluster', term.target)})),
        })
      }
      if (agent === 'polish') {
        const match = messages.at(-1).content.match(/<draft_units>\n([\s\S]*?)<\/draft_units>/)
        const units = JSON.parse(match[1])
        return JSON.stringify({
          translations: units.map(unit => ({id: unit.id, text: unit.text.replace(term.target, '壊れた訳語')})),
        })
      }
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error(`unexpected agent ${agent}`)
    },
  })
  assert.deepEqual(calls, ['translation', 'polish', 'review'])
  assert.match(result.translatedContent, new RegExp(term.target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.doesNotMatch(result.translatedContent, /壊れた訳語/)
}

async function testReviewLoopIteratesIssueDrivenCorrectionUpToMaxRounds() {
  const source = '# Search\n\nUse client.search().\n'
  const calls = []
  const result = await runTranslationUnit({
    sourceContent: source,
    maxReviewRounds: 1,
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') {
        const match = messages.at(-1).content.match(/<semantic_units>\n([\s\S]*?)<\/semantic_units>/)
        const units = JSON.parse(match[1])
        return JSON.stringify({
          translations: units.map(unit => ({id: unit.id, text: unit.text.replace('Search', '検索').replace('Use client.search().', 'client.search() を使用します。')})),
        })
      }
      if (agent === 'review') {
        const reviewCalls = calls.filter(name => name === 'review').length
        if (reviewCalls === 1) {
          const sourceUnits = JSON.parse(messages.at(-1).content.match(/<source_units>\n([\s\S]*?)<\/source_units>/)[1])
          const draftUnits = JSON.parse(messages.at(-1).content.match(/<draft_units>\n([\s\S]*?)<\/draft_units>/)[1])
          return JSON.stringify({
            pass: false,
            issues: [{
              severity: 'medium',
              type: 'locale_style',
              location: sourceUnits[1].id,
              source_quote: sourceUnits[1].text,
              draft_quote: draftUnits[1].text,
              comment: 'Refine the second unit wording.',
            }],
          })
        }
        return '{"pass":true,"issues":[]}'
      }
      if (agent === 'correction') {
        const match = messages.at(-1).content.match(/<authorized_units>\n([\s\S]*?)<\/authorized_units>/)
        const units = JSON.parse(match[1])
        return JSON.stringify({corrections: units.map(unit => ({id: unit.id, text: unit.draft.replace('client.search() を使用します。', 'client.search() メソッドを利用します。')}))})
      }
      throw new Error(`unexpected agent ${agent}`)
    },
  })
  assert.equal(result.review.pass, true)
  assert.match(result.translatedContent, /client\.search\(\)/)
  const reviewCalls = calls.filter(name => name === 'review').length
  const correctionCalls = calls.filter(name => name === 'correction').length
  assert.equal(correctionCalls, 1)
  assert.equal(reviewCalls, 2)
}

async function run() {
  await testEmptyDocumentReturnsSourceVerbatim()
  await testProtectedTokensRemainByteIdentical()
  await testProviderTimeoutTriggersAdaptiveSubdivision()
  await testPolishBrokenLocaleContractRevertsToTranslationDraft()
  await testReviewLoopIteratesIssueDrivenCorrectionUpToMaxRounds()
  console.log('translate and review unit tests passed')
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
