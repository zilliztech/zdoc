'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { assembleRestDocument, collectLocalizableEntries, loadPrompt, parseRestDocument, promptNamesFor, removeLocale, translateRestSpecs } = require('./restSpecLocalization')

const sourceSpecs = {
  summary: 'Search',
  description: 'Search a collection.',
  example: { collectionName: 'quick_setup', message: "User hasn't authenticated" },
  examples: { one: { summary: 'success', value: { message: 'ok' } } },
  properties: { limit: { type: 'integer', description: 'Maximum results.', default: 100 } },
  'x-i18n': { 'zh-CN': { summary: '搜索' } },
}

function taggedJson(messages, tag) {
  const match = messages.at(-1).content.match(new RegExp(`<${tag}>\\n([\\s\\S]*?)\\n<\\/${tag}>`))
  if (!match) throw new Error(`missing ${tag} boundary`)
  return JSON.parse(match[1])
}

function withPassingReview(translationCall) {
  return async input => input.agent === 'review'
    ? '{"pass":true,"issues":[]}'
    : translationCall(input)
}

const REST_IDENTITY_MUTATIONS = [
  {name: 'missing ID', mutate: entries => entries.slice(0, -1)},
  {name: 'duplicate ID', mutate: entries => entries.map((entry, index) => index === 1 ? {...entry, id: entries[0].id} : entry)},
  {name: 'invented ID', mutate: entries => entries.map((entry, index) => index === 0 ? {...entry, id: '["invented","description"]'} : entry)},
]

test('extracts supported prose without examples or existing locale data', () => {
  const entries = collectLocalizableEntries(sourceSpecs)
  assert.deepEqual(entries.map(entry => entry.key), ['summary', 'description', 'description'])
  assert.ok(entries.every(entry => !entry.id.includes('example')))
  assert.ok(entries.every(entry => !entry.id.includes('x-i18n')))
})

test('REST Reviewer prompt declares the strict evidence severity and type enums', () => {
  const prompt = loadPrompt(promptNamesFor('zh-CN-reference').restReview)
  assert.match(prompt, /severity.*high.*medium.*low/is)
  for (const type of [
    'accuracy_omission', 'accuracy_addition', 'accuracy_mistranslation', 'product_claim',
    'terminology', 'consistency', 'untranslated_prose', 'locale_style', 'mdx_structure',
    'protected_content', 'link_or_path',
  ]) assert.match(prompt, new RegExp(`\\b${type}\\b`))
})

test('REST prompts declare entry-local protected marker ordering', () => {
  for (const target of ['zh-CN-reference', 'ja-JP']) {
    const prompt = loadPrompt(promptNamesFor(target).rest)
    assert.match(prompt, /protected marker/i)
    assert.match(prompt, /within (?:the )?same (?:REST )?entry|inside one REST entry/i)
    assert.match(prompt, /must not.*across.*(?:entry|ID)/is)
    assert.match(prompt, /retry_feedback.*prior attempt.*not source/is)
  }
  const correction = loadPrompt(promptNamesFor('zh-CN-reference').restCorrection)
  assert.match(correction, /within (?:the )?same (?:REST )?entry|inside one REST entry/i)
  assert.match(correction, /must not.*across.*(?:entry|ID)/is)
  assert.match(correction, /plain.*remain plain.*(?:backticks|inline code)/is)
  assert.match(loadPrompt(promptNamesFor('zh-CN-reference').rest), /plain.*remain plain.*(?:backticks|inline code)/is)
})

test('adds Japanese locale data without changing the source specification', async () => {
  const { localized, translatedCount } = await translateRestSpecs({
    sourceSpecs, target: 'ja-JP', locale: 'ja-JP',
    callModel: withPassingReview(async ({ messages }) => {
      assert.match(messages[0].content, /from English to Japanese/)
      assert.match(messages[0].content, /ja-JP-2026-08-10-p0\.3/)
      return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
        ...entry,
        text: entry.text === 'Search a collection.' ? 'コレクションを検索します。' : `JA:${entry.text}`,
      })))
    }),
  })
  assert.equal(translatedCount, 3)
  assert.equal(localized['x-i18n']['ja-JP'].summary, 'JA:Search')
  assert.equal(localized['x-i18n']['ja-JP'].description, 'コレクションを検索します。')
  assert.equal(localized.properties.limit['x-i18n']['ja-JP'].description, 'JA:Maximum results.')
  assert.deepEqual(localized.example, sourceSpecs.example)
  assert.deepEqual(removeLocale(localized, 'ja-JP'), sourceSpecs)
})

test('parses and assembles a REST endpoint document with Japanese RestSpecs language', () => {
  const content = '# Search\n<RestSpecs specs={specs} lang="en-US" />\n\nexport const specs = {"summary":"Search"}\nexport const endpoint = "/v1/search"\nexport const method = "post"\n'
  const parsed = parseRestDocument(content)
  const output = assembleRestDocument({ translatedPrefix: parsed.prefix, localizedSpecs: parsed.sourceSpecs, suffix: parsed.suffix, locale: 'ja-JP' })
  assert.match(output, /lang="ja-JP"/)
  assert.match(output, /export const endpoint = "\/v1\/search"/)
})

test('allows protected marker reordering inside one REST entry', async () => {
  const source = 'Use `alpha` and `beta` at https://example.com<br/>Done.'
  let translationMarkers
  const {localized} = await translateRestSpecs({
    sourceSpecs: {description: source},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: async ({agent, messages}) => {
      if (agent === 'review') {
        const sourceEntries = taggedJson(messages, 'source')
        const draftEntries = taggedJson(messages, 'draft')
        const markerPattern = /<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/g
        assert.deepEqual(
          [...draftEntries[0].text.matchAll(markerPattern)].map(match => match[0]).sort(),
          [...sourceEntries[0].text.matchAll(markerPattern)].map(match => match[0]).sort(),
        )
        return '{"pass":true,"issues":[]}'
      }
      const [entry] = JSON.parse(messages[1].content.split('\n\n')[1])
      const markers = entry.text.match(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/g)
      assert.equal(markers.length, 4)
      translationMarkers = markers
      return JSON.stringify([{
        id: entry.id,
        text: `访问 ${markers[2]}${markers[3]}，然后使用 ${markers[1]} 和 ${markers[0]}。`,
      }])
    },
  })

  assert.equal(translationMarkers.length, 4)
  assert.equal(
    localized['x-i18n']['zh-CN'].description,
    '访问 https://example.com<br/>，然后使用 `beta` 和 `alpha`。',
  )
})

test('rejects translations that change protected API tokens', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: { description: 'Use `offset` with {{TOKEN}} at https://example.com.' },
    target: 'ja-JP', locale: 'ja-JP',
    callModel: withPassingReview(async ({ messages }) => JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({ ...entry, text: '変更されたテキスト' })))),
  }), error => {
    assert.match(error.message, /protected (?:marker|content|token)/i)
    assert.equal(error.failureCategory, 'protected_content_failed')
    return true
  })
})

test('rejects invented inline-code structure around technical identifiers', async () => {
  const technicalSpecs = {
    description: 'When true, one INDEX function and 0-50 PRESERVE functions are allowed.',
  }
  await assert.rejects(translateRestSpecs({
    sourceSpecs: technicalSpecs,
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: withPassingReview(async ({ messages }) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
        ...entry,
        text: '`true` の場合、1 個の `INDEX` 関数と 0～50 個の `PRESERVE` 関数を使用できます。',
      })),
    )),
  }), /protected content|inline_code/i)
})

test('reports the real REST document and exact entry path for translation protected-content failures', async () => {
  const sourcePath = 'content/en/reference/api/restful/restful/v2/data-plane/vector-operations-v2/hybrid-search-v2.mdx'
  const entryId = 'requestBody.content.application/json.schema.properties.search.items.properties.params.properties.radius.description'
  const sourceSpecs = {
    requestBody: {content: {'application/json': {schema: {properties: {
      search: {items: {properties: {params: {properties: {
        radius: {description: 'Specifies the search radius.'},
      }}}}},
    }}}}},
  }

  await assert.rejects(translateRestSpecs({
    sourceSpecs,
    sourcePath,
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: withPassingReview(async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '指定 `radius` 搜索半径。'})),
    )),
  }), error => {
    assert.match(error.message, new RegExp(sourcePath.replaceAll('/', '\\/')))
    assert.match(error.message, new RegExp(entryId.replaceAll('/', '\\/')))
    assert.match(error.message, /line 1, column \d+, offset \d+, token "`radius`"/)
    return true
  })
})

test('rejects invented code identifiers that do not exist in the source prose', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: { description: 'Use the INDEX function.' },
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: withPassingReview(async ({ messages }) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({ ...entry, text: '`UNKNOWN` 関数を使用します。' })),
    )),
  }), /protected (?:marker|content|token)/i)
})

test('selects the Chinese Reference REST prompt from target', async () => {
  const {localized} = await translateRestSpecs({
    sourceSpecs: {description: 'Search a collection.'},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: withPassingReview(async ({messages}) => {
      assert.match(messages[0].content, /Simplified Chinese/)
      assert.match(messages[0].content, /zh-CN-reference-2026-08-04-p0/)
      assert.match(messages[0].content, /Compaction/)
      return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '搜索 Collection。'})))
    }),
  })
  assert.equal(localized['x-i18n']['zh-CN'].description, '搜索 Collection。')
})

test('normalizes deterministic locale casing inside protected REST entries', async () => {
  const {localized, review} = await translateRestSpecs({
    sourceSpecs: {description: 'This operation creates a PrivateLink endpoint.'},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: async ({agent, messages}) => {
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      if (agent === 'correction') throw new Error('Deterministic Endpoint normalization must not require REST Correction')
      return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
        ...entry,
        text: '此操作会创建一个 PrivateLink endpoint。',
      })))
    },
  })

  assert.equal(review.pass, true)
  assert.equal(localized['x-i18n']['zh-CN'].description, '此操作会创建一个 PrivateLink Endpoint。')
})

test('replaces an existing translation for the requested locale without changing source data', async () => {
  const existing = {
    description: 'Search a collection.',
    'x-i18n': {'zh-CN': {description: '搜索集合。'}},
  }
  const {localized} = await translateRestSpecs({
    sourceSpecs: existing,
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: withPassingReview(async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '搜索 Collection。'})),
    )),
  })
  assert.equal(localized['x-i18n']['zh-CN'].description, '搜索 Collection。')
  assert.deepEqual(removeLocale(localized, 'zh-CN'), removeLocale(existing, 'zh-CN'))
})

test('normalizes a legacy string locale description before replacing it', async () => {
  const existing = {
    description: 'Project ID.',
    'x-i18n': {'zh-CN': '项目 ID。'},
  }
  const {localized} = await translateRestSpecs({
    sourceSpecs: existing,
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: withPassingReview(async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '项目 ID。'})),
    )),
  })
  assert.deepEqual(localized['x-i18n']['zh-CN'], {description: '项目 ID。'})
  assert.deepEqual(removeLocale(localized, 'zh-CN'), removeLocale(existing, 'zh-CN'))
})

test('rejects REST translation for a target without a REST prompt product', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: {description: 'Search a collection.'},
    target: 'zh-CN-tools',
    locale: 'zh-CN',
    callModel: async () => '[]',
  }), /unsupported translation target/i)
})

test('reports a REST translation that replaces Compaction with 压实 when no correction round is available', async () => {
  const {review} = await translateRestSpecs({
    sourceSpecs: {description: 'Compaction plans merge segments.'},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    maxReviewRounds: 0,
    callModel: withPassingReview(async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '压实计划会合并 Segment。'})),
    )),
  })
  assert.equal(review.pass, false)
  assert.match(review.issues[0].comment, /Compaction|locale contract/i)
})

test('does not authorize REST correction for a deterministic issue without aligned draft evidence', async () => {
  const calls = []
  const {review} = await translateRestSpecs({
    sourceSpecs: {description: 'Create a collection.'},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
          ...entry,
          text: '\nリソースを作成します。',
        })))
      }
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      throw new Error('Correction must not be authorized without aligned draft evidence')
    },
  })

  assert.deepEqual(calls, ['translation', 'review'])
  assert.equal(review.pass, false)
  assert.equal(review.localeContractIssues.length, 1)
  assert.equal(review.localeContractIssues[0].draft_quote, '')
  assert.equal(review.localeContractIssues[0].evidenceAvailable, false)
})

test('keeps REST Entity protected by the deterministic locale contract', async () => {
  const {review} = await translateRestSpecs({
    sourceSpecs: {description: 'The response contains the matching entity.'},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    maxReviewRounds: 0,
    callModel: withPassingReview(async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '响应包含匹配的实体。'})),
    )),
  })

  assert.equal(review.pass, false)
  assert.equal(review.localeContractIssues.length, 1)
  assert.equal(review.localeContractIssues[0].source_quote, 'entity')
  assert.match(review.localeContractIssues[0].comment, /Entity/)
})

test('requires Reviewer source and draft evidence to belong to the same REST entry', async () => {
  const calls = []
  const source = {
    paths: {
      alpha: {description: 'Alpha source prose.'},
      beta: {description: 'Beta source prose.'},
    },
  }
  const {localized, review} = await translateRestSpecs({
    sourceSpecs: source,
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
          ...entry,
          text: entry.id.includes('alpha') ? 'アルファ翻訳。' : 'ベータ翻訳。',
        })))
      }
      if (agent === 'review') {
        return JSON.stringify({
          pass: false,
          issues: [{
            severity: 'medium',
            type: 'accuracy_mistranslation',
            location: '["paths","alpha","description"]',
            source_quote: 'Alpha source prose.',
            draft_quote: 'ベータ翻訳。',
            comment: 'The draft quote belongs to another REST entry.',
          }],
        })
      }
      throw new Error(`unexpected ${agent} call`)
    },
  })

  assert.deepEqual(calls, ['translation', 'review'])
  assert.equal(review.pass, true)
  assert.equal(review.unsupportedIssues.length, 1)
  assert.equal(localized.paths.alpha['x-i18n']['ja-JP'].description, 'アルファ翻訳。')
  assert.equal(localized.paths.beta['x-i18n']['ja-JP'].description, 'ベータ翻訳。')
})

test('requires Reviewer location to name the matching REST entry ID', async () => {
  const {review} = await translateRestSpecs({
    sourceSpecs: {paths: {alpha: {description: 'Alpha source prose.'}}},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: 'アルファ翻訳。'})))
      }
      if (agent === 'review') {
        return JSON.stringify({
          pass: false,
          issues: [{
            severity: 'medium',
            type: 'accuracy_mistranslation',
            location: 'REST description',
            source_quote: 'Alpha source prose.',
            draft_quote: 'アルファ翻訳。',
            comment: 'The location does not identify the structured entry.',
          }],
        })
      }
      throw new Error(`unexpected ${agent} call`)
    },
  })

  assert.equal(review.pass, true)
  assert.equal(review.issues.length, 0)
  assert.equal(review.unsupportedIssues.length, 1)
})

test('rejects a forged REST entry ID suffix in Reviewer evidence', async () => {
  const {review} = await translateRestSpecs({
    sourceSpecs: {paths: {alpha: {description: 'Alpha source prose.'}}},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: 'アルファ翻訳。'})))
      }
      if (agent === 'review') return JSON.stringify({
        pass: false,
        issues: [{
          severity: 'medium', type: 'accuracy_mistranslation',
          location: '["paths","alpha","description"]-forged',
          source_quote: 'Alpha source prose.', draft_quote: 'アルファ翻訳。', comment: 'Forged REST ID suffix.',
        }],
      })
      throw new Error('Correction must not run for a forged REST entry ID')
    },
  })

  assert.equal(review.pass, true)
  assert.equal(review.issues.length, 0)
  assert.equal(review.unsupportedIssues.length, 1)
})

test('rejects protected marker movement across REST entry IDs', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: {paths: {
      alpha: {description: 'Use `alpha`.'},
      beta: {description: 'Use `beta`.'},
    }},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: withPassingReview(async ({messages}) => {
      const entries = JSON.parse(messages[1].content.split('\n\n')[1])
      const markers = entries.map(entry => entry.text.match(/<!-- ZDOC-PROTECTED:\d{6}:[0-9a-f]{16} -->/)[0])
      return JSON.stringify([
        {id: entries[0].id, text: `使用 ${markers[1]}。`},
        {id: entries[1].id, text: `使用 ${markers[0]}。`},
      ])
    }),
  }), /unknown|missing protected marker/i)
})

test('uses a deterministic REST terminology issue to authorize Correction', async () => {
  const calls = []
  const {localized, review} = await translateRestSpecs({
    sourceSpecs: {description: 'Compaction plans merge segments.'},
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    maxReviewRounds: 2,
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '压实计划会合并 Segment。'})))
      }
      if (agent === 'review') return '{"pass":true,"issues":[]}'
      if (agent === 'correction') {
        assert.match(messages.at(-1).content, /Compaction/)
        return JSON.stringify(taggedJson(messages, 'draft').map(entry => ({...entry, text: 'Compaction 计划会合并 Segment。'})))
      }
      throw new Error(`unexpected ${agent} call`)
    },
  })

  assert.deepEqual(calls, ['translation', 'review', 'correction', 'review'])
  assert.equal(review.pass, true)
  assert.equal(localized['x-i18n']['zh-CN'].description, 'Compaction 计划会合并 Segment。')
})

test('rejects unknown fields in a structured REST response identity', async () => {
  await assert.rejects(translateRestSpecs({
    sourceSpecs: {description: 'Search results.'},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: withPassingReview(async ({messages}) => JSON.stringify(
      JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '検索結果。', note: 'unexpected'})),
    )),
  }), /exact|unknown|fields/i)
})

test('rejects missing, duplicate, or invented IDs in REST Translation responses', async t => {
  for (const identityCase of REST_IDENTITY_MUTATIONS) {
    await t.test(identityCase.name, async () => {
      await assert.rejects(translateRestSpecs({
        sourceSpecs: {paths: {alpha: {description: 'Alpha source.'}, beta: {description: 'Beta source.'}}},
        target: 'ja-JP',
        locale: 'ja-JP',
        callModel: withPassingReview(async ({messages}) => JSON.stringify(identityCase.mutate(
          JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: `JA:${entry.text}`})),
        ))),
      }), /count mismatch|unique IDs|missing REST translation entry/i)
    })
  }
})

test('rejects missing, duplicate, or invented IDs in REST Correction responses', async t => {
  for (const identityCase of REST_IDENTITY_MUTATIONS) {
    await t.test(identityCase.name, async () => {
      let reviewRound = 0
      await assert.rejects(translateRestSpecs({
        sourceSpecs: {paths: {alpha: {description: 'Alpha source.'}, beta: {description: 'Beta source.'}}},
        target: 'ja-JP',
        locale: 'ja-JP',
        callModel: async ({agent, messages}) => {
          if (agent === 'translation') {
            return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({
              ...entry,
              text: entry.id.includes('alpha') ? '誤ったアルファ。' : '正しいベータ。',
            })))
          }
          if (agent === 'review') {
            reviewRound += 1
            if (reviewRound > 1) return '{"pass":true,"issues":[]}'
            return JSON.stringify({
              pass: false,
              issues: [{
                severity: 'medium', type: 'accuracy_mistranslation', location: '["paths","alpha","description"]',
                source_quote: 'Alpha source.', draft_quote: '誤ったアルファ。', comment: 'Correct the alpha translation.',
              }],
            })
          }
          if (agent === 'correction') return JSON.stringify(identityCase.mutate(taggedJson(messages, 'draft')))
          throw new Error(`unexpected ${agent} call`)
        },
      }), /count mismatch|unique IDs|missing REST translation entry/i)
    })
  }
})

test('passes only same-entry validated REST issues to Correction', async () => {
  let reviewRound = 0
  const {localized, review} = await translateRestSpecs({
    sourceSpecs: {paths: {alpha: {description: 'Alpha source.'}, beta: {description: 'Beta source.'}}},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: entry.id.includes('alpha') ? '誤ったアルファ。' : '正しいベータ。'})))
      }
      if (agent === 'review') {
        reviewRound += 1
        if (reviewRound > 1) return '{"pass":true,"issues":[]}'
        return JSON.stringify({
          pass: false,
          issues: [
            {
              severity: 'medium', type: 'accuracy_mistranslation', location: '["paths","alpha","description"]',
              source_quote: 'Alpha source.', draft_quote: '誤ったアルファ。', comment: 'Correct the alpha translation.',
            },
            {
              severity: 'medium', type: 'accuracy_mistranslation', location: '["paths","alpha","description"]',
              source_quote: 'Alpha source.', draft_quote: '正しいベータ。', comment: 'Cross-entry allegation.',
            },
          ],
        })
      }
      if (agent === 'correction') {
        const message = messages.at(-1).content
        assert.match(message, /Correct the alpha translation/)
        assert.doesNotMatch(message, /Cross-entry allegation/)
        return JSON.stringify(taggedJson(messages, 'draft').map(entry => ({...entry, text: entry.id.includes('alpha') ? '正しいアルファ。' : entry.text})))
      }
      throw new Error(`unexpected ${agent} call`)
    },
  })

  assert.equal(review.pass, true)
  assert.equal(localized.paths.alpha['x-i18n']['ja-JP'].description, '正しいアルファ。')
  assert.equal(localized.paths.beta['x-i18n']['ja-JP'].description, '正しいベータ。')
})

test('rejects a REST Correction that changes protected content', async () => {
  let reviewRound = 0
  await assert.rejects(translateRestSpecs({
    sourceSpecs: {description: 'Use `offset` for pagination.'},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: `ページネーションには ${entry.text.match(/<!-- ZDOC-PROTECTED:[^>]+ -->/)[0]} を使用します。`})))
      }
      if (agent === 'review') {
        reviewRound += 1
        return JSON.stringify(reviewRound === 1 ? {
          pass: false,
          issues: [{
            severity: 'low', type: 'locale_style', location: '["description"]',
            source_quote: 'pagination', draft_quote: 'ページネーション', comment: 'Apply a local style correction.',
          }],
        } : {pass: true, issues: []})
      }
      if (agent === 'correction') return JSON.stringify(taggedJson(messages, 'draft').map(entry => ({...entry, text: 'ページネーションには `changed` を使用します。'})))
      throw new Error(`unexpected ${agent} call`)
    },
  }), /protected marker|protected content/i)
})

test('reports the real REST document and exact entry path for Correction protected-content failures', async () => {
  const sourcePath = 'content/en/reference/api/restful/restful/v2/data-plane/vector-operations-v2/hybrid-search-v2.mdx'
  const entryId = 'requestBody.content.application/json.schema.properties.search.items.properties.params.properties.radius.description'
  const sourceSpecs = {
    requestBody: {content: {'application/json': {schema: {properties: {
      search: {items: {properties: {params: {properties: {
        radius: {description: 'Specifies the search radius.'},
      }}}}},
    }}}}},
  }
  let reviewRound = 0

  await assert.rejects(translateRestSpecs({
    sourceSpecs,
    sourcePath,
    target: 'zh-CN-reference',
    locale: 'zh-CN',
    callModel: async ({agent, messages}) => {
      if (agent === 'translation') return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '指定搜索半径。'})))
      if (agent === 'review') {
        reviewRound += 1
        return JSON.stringify(reviewRound === 1 ? {
          pass: false,
          issues: [{
            severity: 'low', type: 'locale_style', location: JSON.stringify(entryId.split('.')),
            source_quote: 'search radius', draft_quote: '搜索半径', comment: 'Apply a local style correction.',
          }],
        } : {pass: true, issues: []})
      }
      if (agent === 'correction') return JSON.stringify(taggedJson(messages, 'draft').map(entry => ({...entry, text: '指定 `radius` 搜索半径。'})))
      throw new Error(`unexpected ${agent} call`)
    },
  }), error => {
    assert.match(error.message, new RegExp(sourcePath.replaceAll('/', '\\/')))
    assert.match(error.message, new RegExp(entryId.replaceAll('/', '\\/')))
    assert.match(error.message, /line 1, column \d+, offset \d+, token "`radius`"/)
    return true
  })
})

test('fails a contradictory REST Reviewer response without Correction', async () => {
  const calls = []
  const {review} = await translateRestSpecs({
    sourceSpecs: {description: 'Search results.'},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: '検索結果。'})))
      if (agent === 'review') return JSON.stringify({
        pass: true,
        issues: [{
          severity: 'low', type: 'locale_style', location: '["description"]',
          source_quote: 'Search results.', draft_quote: '検索結果。', comment: 'Contradictory issue.',
        }],
      })
      throw new Error('Correction must not run for a fatal Reviewer response')
    },
  })

  assert.equal(review.pass, false)
  assert.match(review.error, /pass=true/i)
  assert.deepEqual(calls, ['translation', 'review'])
})

test('stops later REST batches after the first failed review', async () => {
  const calls = []
  const {review, translatedCount} = await translateRestSpecs({
    sourceSpecs: {paths: {alpha: {description: 'A'.repeat(11980)}, beta: {description: 'Beta source.'}}},
    target: 'ja-JP',
    locale: 'ja-JP',
    callModel: async ({agent, messages}) => {
      calls.push(agent)
      if (agent === 'translation') {
        return JSON.stringify(JSON.parse(messages[1].content.split('\n\n')[1]).map(entry => ({...entry, text: `JA:${entry.text}`})))
      }
      if (agent === 'review') return '{"pass":true,"issues":[],"unknown":true}'
      throw new Error(`unexpected ${agent} call`)
    },
  })

  assert.equal(review.pass, false)
  assert.equal(translatedCount, 1)
  assert.deepEqual(calls, ['translation', 'review'])
})
