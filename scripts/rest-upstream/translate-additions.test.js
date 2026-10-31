const test = require('node:test')
const assert = require('node:assert/strict')
const {translateChangeSet, translationPrompt, missingLanguage} = require('./translate-additions')
const {proseNodes} = require('../../packages/docs-tooling/src/reference/rest/upstreamDiff/mirror')

const CHANGE_SET = {
    schemaVersion: '1.0',
    source: 'zilliz-cloud-control-plane',
    diffDigest: 'sha256:' + 'a'.repeat(64),
    entries: [
        // carries upstream zh already: only ja needs translating
        {diffEntryId: 'upstream-modified|post /v2/x|01-a.json|requestBody|||data|schema|mirror', kind: 'mirror',
            targetFragment: '01-a.json', opPath: '/paths/~1v2~1x/post/requestBody/content/application~1json/schema/properties/data',
            value: {type: 'object', properties: {jobId: {type: 'string', description: 'ID of the job.',
                'x-i18n': {'zh-CN': {description: '任务 ID'}}}}}, requiredMembership: null, evidence: 'e', override: false},
        // carries nothing: both locales must be filled
        {diffEntryId: 'upstream-added-field|post /v2/x|01-a.json|response||200|result|field-uncovered|', kind: 'addition',
            targetFragment: '01-a.json', opPath: '/paths/~1v2~1x/post/responses/200/content/application~1json/schema/properties',
            value: {result: {type: 'string', description: 'The result.'}}},
        {diffEntryId: 'upstream-modified|post /v2/x|01-a.json|operation||||deprecated|', kind: 'constraint',
            targetFragment: '01-a.json', opPath: '/paths/~1v2~1x/post/deprecated', value: true, evidence: 'e', override: false},
    ],
}

function stubFetch(byCall) {
    const calls = []
    let index = 0
    const fetchImpl = async (url, options) => {
        const body = JSON.parse(options.body)
        calls.push({url, items: body.messages[1].content.split('\n\n')[1].split('\n').filter(Boolean).map(line => JSON.parse(line))})
        const payload = byCall[index]
        index += 1
        if (payload instanceof Error) return {ok: false, status: 500, text: async () => payload.message}
        return {ok: true, status: 200, text: async () => '', json: async () => ({choices: [{message: {content: JSON.stringify(payload)}}]})}
    }
    return {calls, fetchImpl}
}

test('translateChangeSet fills missing locales and keeps upstream zh verbatim', async () => {
    process.env.TRANSLATE_TEST_KEY = 'key'
    const {calls, fetchImpl} = stubFetch([
        {translations: [{i: 0, zh: '任务 ID（日语）', ja: 'ジョブ ID'}]},
        {translations: [{i: 0, zh: '结果。', ja: '結果。'}]},
    ])
    const {changeSet, report} = await translateChangeSet({
        changeSet: structuredClone(CHANGE_SET), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'TRANSLATE_TEST_KEY',
        model: 'm', fetchImpl,
    })
    assert.equal(report.translatedEntries, 2)
    assert.equal(report.translatedNodes, 2)
    assert.deepEqual(report.degraded, [])
    const mirror = changeSet.entries[0]
    assert.equal(mirror.value.properties.jobId['x-i18n']['zh-CN'].description, '任务 ID')
    assert.equal(mirror.value.properties.jobId['x-i18n']['ja-JP'].description, 'ジョブ ID')
    const addition = changeSet.entries[1]
    assert.deepEqual(addition.value.result['x-i18n'], {'zh-CN': {description: '结果。'}, 'ja-JP': {description: '結果。'}})
    assert.equal(changeSet.entries.length, 3)
    // one batch call per translatable entry; non-translatable kinds untouched
    assert.equal(calls.length, 2)
    assert.ok(calls.every(call => call.url === 'https://gateway.invalid/v1/chat/completions'))
})

test('an entry whose translation cannot be completed is dropped to the degrade list, never half-applied', async () => {
    process.env.TRANSLATE_TEST_KEY = 'key'
    const {fetchImpl} = stubFetch([
        {translations: [{i: 0, zh: '任务 ID（日语）', ja: 'ジョブ ID'}]},
        new Error('gateway down'),
        new Error('gateway down'),
        new Error('gateway down'),
    ])
    const {changeSet, report} = await translateChangeSet({
        changeSet: structuredClone(CHANGE_SET), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'TRANSLATE_TEST_KEY',
        model: 'm', retries: 4, fetchImpl,
    })
    assert.deepEqual(report.degraded.map(entry => entry.diffEntryId),
        ['upstream-added-field|post /v2/x|01-a.json|response||200|result|field-uncovered|'])
    assert.ok(!changeSet.entries.some(entry => entry.kind === 'addition'))
    // the mirror survived (its first batch succeeded)
    assert.equal(changeSet.entries.length, 2)
})

test('a degraded-then-completed response still fails the post-verify when lines are missing', async () => {
    process.env.TRANSLATE_TEST_KEY = 'key'
    // model returns only one of two requested nodes: dropped, not partial
    const {fetchImpl} = stubFetch([
        {translations: [{i: 0, zh: '任务 ID（日语）', ja: 'ジョブ ID'}]},
        {translations: [{i: 0, zh: '结果。', ja: ''}]},
        {translations: [{i: 0, zh: '结果。', ja: ''}]},
        {translations: [{i: 0, zh: '结果。', ja: ''}]},
    ])
    const {changeSet, report} = await translateChangeSet({
        changeSet: structuredClone(CHANGE_SET), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'TRANSLATE_TEST_KEY',
        model: 'm', retries: 4, fetchImpl,
    })
    assert.equal(report.degraded.length, 1)
    assert.ok(!changeSet.entries.some(entry => entry.kind === 'addition'))
})



test('entries with zero pending prose pass through without a model call and never false-fail', async () => {
    process.env.TRANSLATE_TEST_KEY = 'key'
    // the milvus structure-only shape: mirrors carry no prose at all, so the
    // translate stage has nothing to do — it must succeed with zero model
    // calls, not report ALL_DEGRADED (P1-B regression)
    const changeSet = {
        schemaVersion: '1.0', source: 's', diffDigest: 'sha256:' + 'a'.repeat(64),
        entries: [
            {diffEntryId: 'm1', kind: 'mirror', targetFragment: '01-a.json', opPath: '/p',
                value: {type: 'object', properties: {id: {type: 'string'}}}, requiredMembership: null, evidence: 'e', override: false},
            {diffEntryId: 'm2', kind: 'mirror', targetFragment: '01-a.json', opPath: '/q',
                value: {type: 'string'}, requiredMembership: null, evidence: 'e', override: false},
        ],
    }
    let called = 0
    const {changeSet: translated, report} = await translateChangeSet({
        changeSet, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'TRANSLATE_TEST_KEY', model: 'm',
        fetchImpl: async () => { called += 1; throw new Error('must not be called') },
    })
    assert.equal(called, 0)
    assert.equal(report.translatedEntries, 0)
    assert.deepEqual(report.degraded, [])
    assert.equal(translated.entries.length, 2)
})

test('every entry degrading fails with its own code, not an opaque schema error', async () => {
    process.env.TRANSLATE_TEST_KEY = 'key'
    const {fetchImpl} = stubFetch([new Error('gateway down'), new Error('gateway down'), new Error('gateway down'), new Error('gateway down')])
    await assert.rejects(
        translateChangeSet({changeSet: structuredClone(CHANGE_SET), baseUrl: 'https://gateway.invalid',
            apiKeyEnv: 'TRANSLATE_TEST_KEY', model: 'm', retries: 4, fetchImpl}),
        /REST_UPSTREAM_TRANSLATE_ALL_DEGRADED/,
    )
})

test('missing api key fails closed before any model call', async () => {
    let called = 0
    await assert.rejects(
        translateChangeSet({changeSet: CHANGE_SET, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'TRANSLATE_TEST_KEY_ABSENT', model: 'm', fetchImpl: async () => {called += 1}}),
        /REST_UPSTREAM_TRANSLATE_API_KEY_MISSING/,
    )
    assert.equal(called, 0)
})

test('the prompt pins the output contract and keep-rules', () => {
    const prompt = translationPrompt()
    assert.match(prompt, /"translations":\[\{"i":<index>,"zh":"\.\.\.","ja":"\.\.\."\}\]/)
    assert.match(prompt, /Keep markdown links/)
    assert.match(prompt, /Never leave an empty string/)
})

test('missingLanguage and proseNodes agree on the ladder problem', () => {
    const node = {description: 'x', 'x-i18n': {'zh-CN': {description: '中'}, 'ja-JP': {description: '日'}}}
    assert.equal(missingLanguage(node, 'zh-CN'), false)
    assert.equal(missingLanguage(node, 'ja-JP'), false)
    // the walker must not treat translations as new source prose
    assert.deepEqual(proseNodes(node), [node])
})
