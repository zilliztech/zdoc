const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {backfillFragments, addressableRoots} = require('./describe-backfill')
const {serializeDocument} = require('../../packages/docs-tooling/src/reference/rest/upstreamDiff/formatter')

function writeFragmentsDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'backfill-fragments-'))
    fs.writeFileSync(path.join(dir, '06-database-operations-v2.json'), serializeDocument({
        openapi: '3.0.1',
        info: {title: 'REST', version: 'v2'},
        components: {schemas: {CustomCollectionParams: {type: 'object', description: 'Custom setup parameters.', properties: {
            consistencyLevel: {type: 'string', description: 'The consistency level of the collection.', enum: ['Strong', 'Bounded']},
        }}}},
    }))
    fs.writeFileSync(path.join(dir, '05-collection-operations-v2.json'), serializeDocument({
        openapi: '3.0.1',
        info: {title: 'REST', version: 'v2'},
        components: {schemas: {
            QuickSetupCollection: {type: 'object', properties: {
                collectionName: {type: 'string', description: 'The name of the collection.'},
                consistencyLevel: {type: 'string', enum: ['Strong', 'Bounded']},
            }},
        }},
        paths: {
            '/v2/vectordb/collections/create': {post: {
                summary: 'Create Collection',
                parameters: [{name: 'Authorization', in: 'header', description: 'The token.'}],
                requestBody: {content: {'application/json': {schema: {$ref: '#/components/schemas/QuickSetupCollection'}}}},
                responses: {'200': {content: {'application/json': {schema: {type: 'object', properties: {
                    code: {type: 'integer', description: 'Response code.'},
                    data: {type: 'object', properties: {}},
                }}}}}},
            }},
        },
    }))
    return dir
}

function stubFetch(byCall) {
    const calls = []
    let index = 0
    const fetchImpl = async (url, options) => {
        const body = JSON.parse(options.body)
        calls.push({url, items: body.messages[1].content.split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line))})
        const payload = byCall[index]
        index += 1
        if (payload instanceof Error) return {ok: false, status: 500, text: async () => payload.message}
        return {ok: true, status: 200, text: async () => '', json: async () => ({choices: [{message: {content: JSON.stringify(payload)}}]})}
    }
    return {calls, fetchImpl}
}

test('backfill plans exactly the prose-less nodes and fills en+zh+ja in one call', async () => {
    process.env.BACKFILL_TEST_KEY = 'key'
    const fragmentsDir = writeFragmentsDir()
    try {
        const {calls, fetchImpl} = stubFetch([
            {descriptions: [
                {p: 'components/schemas/QuickSetupCollection#(root)', en: 'The quick-setup request body.', zh: '快速配置请求体。', ja: 'クイックセットアップのリクエストボディ。'},
                {p: 'components/schemas/QuickSetupCollection#consistencyLevel', en: 'The consistency level of the collection.', zh: '集合的一致性级别。', ja: 'コレクションの一貫性レベル。'},
                {p: 'post /v2/vectordb/collections/create response 200#(root)', en: 'The success envelope.', zh: '成功响应结构。', ja: '成功レスポンスの構造。'},
                {p: 'post /v2/vectordb/collections/create response 200#data', en: 'The collection details returned on success.', zh: '成功时返回的集合详情。', ja: '成功時に返されるコレクションの詳細。'},
            ]},
        ])
        const {plan, described, degraded, changedFiles, documents} = await backfillFragments({
            fragmentsDir, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BACKFILL_TEST_KEY', model: 'm', fetchImpl,
        })
        // The bare-$ref requestBody wrapper is skipped (the component walk plans
        // its target); described nodes (collectionName/code/Authorization) are
        // not planned at all.
        assert.deepEqual(plan.map(item => item.label), [
            'components/schemas/QuickSetupCollection (root)',
            'components/schemas/QuickSetupCollection consistencyLevel',
            'post /v2/vectordb/collections/create response 200 (root)',
            'post /v2/vectordb/collections/create response 200 data',
        ])
        assert.equal(described.length, 4)
        assert.deepEqual(degraded, [])
        assert.deepEqual(changedFiles, ['05-collection-operations-v2.json'])
        const document = documents.get('05-collection-operations-v2.json').document
        const component = document.components.schemas.QuickSetupCollection
        assert.equal(component.description, 'The quick-setup request body.')
        const level = component.properties.consistencyLevel
        assert.equal(level.description, 'The consistency level of the collection.')
        assert.equal(level['x-i18n']['zh-CN'].description, '集合的一致性级别。')
        assert.equal(level['x-i18n']['ja-JP'].description, 'コレクションの一貫性レベル。')
        const envelope = document.paths['/v2/vectordb/collections/create'].post.responses['200']
            .content['application/json'].schema
        assert.equal(envelope.description, 'The success envelope.')
        assert.equal(envelope.properties.data.description, 'The collection details returned on success.')
        // described neighbors untouched
        assert.equal(component.properties.collectionName['x-i18n'], undefined)
        // reference grounding rides the batch: the sibling-described name feeds consistencyLevel
        const consistencyItem = calls[0].items.find(item => item.p === 'components/schemas/QuickSetupCollection#consistencyLevel')
        assert.equal(consistencyItem.references[0].description, 'The consistency level of the collection.')
    } finally {
        fs.rmSync(fragmentsDir, {recursive: true, force: true})
    }
})

test('degraded nodes stay untouched and are reported per node', async () => {
    process.env.BACKFILL_TEST_KEY = 'key'
    const fragmentsDir = writeFragmentsDir()
    try {
        const {fetchImpl} = stubFetch([
            {descriptions: [
                {p: 'components/schemas/QuickSetupCollection#(root)', en: 'The quick-setup request body.', zh: '快速配置请求体。', ja: 'クイックセットアップのリクエストボディ。'},
                {p: 'components/schemas/QuickSetupCollection#consistencyLevel', en: 'Picks `strong`.', zh: '选 `strong`。', ja: '`strong` を選ぶ。'},  // wrong enum casing
                {p: 'post /v2/vectordb/collections/create response 200#(root)', en: 'The success envelope.', zh: '成功响应结构。', ja: '成功レスポンスの構造。'},
                {p: 'post /v2/vectordb/collections/create response 200#data', en: 'The collection details returned on success.', zh: '成功时返回的集合详情。', ja: '成功時に返されるコレクションの詳細。'},
            ]},
        ])
        const {described, degraded, changedFiles} = await backfillFragments({
            fragmentsDir, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BACKFILL_TEST_KEY', model: 'm', fetchImpl,
        })
        assert.equal(described.length, 3)
        assert.equal(degraded.length, 1)
        assert.equal(degraded[0].label, 'components/schemas/QuickSetupCollection consistencyLevel')
        assert.match(degraded[0].reason, /wrong casing/)
        assert.deepEqual(changedFiles, ['05-collection-operations-v2.json'])
    } finally {
        fs.rmSync(fragmentsDir, {recursive: true, force: true})
    }
})

test('all-degraded fails closed instead of a silent no-op', async () => {
    process.env.BACKFILL_TEST_KEY = 'key'
    const fragmentsDir = writeFragmentsDir()
    try {
        const {fetchImpl} = stubFetch([new Error('gateway down'), new Error('gateway down'), new Error('gateway down')])
        await assert.rejects(
            backfillFragments({fragmentsDir, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BACKFILL_TEST_KEY', model: 'm', fetchImpl}),
            /REST_UPSTREAM_BACKFILL_ALL_DEGRADED/,
        )
    } finally {
        fs.rmSync(fragmentsDir, {recursive: true, force: true})
    }
})

test('limit bounds the plan; non-canonical fragment bytes fail closed before any call', async () => {
    process.env.BACKFILL_TEST_KEY = 'key'
    const fragmentsDir = writeFragmentsDir()
    try {
        const {calls, fetchImpl} = stubFetch([
            {descriptions: [{p: 'components/schemas/QuickSetupCollection#(root)', en: 'The quick-setup request body.', zh: '快速配置请求体。', ja: 'クイックセットアップのリクエストボディ。'}]},
        ])
        const {plan} = await backfillFragments({fragmentsDir, limit: 1,
            baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BACKFILL_TEST_KEY', model: 'm', fetchImpl})
        assert.equal(plan.length, 1)
        assert.equal(calls.length, 1)
        // canonical guard: hand-mangled bytes refuse to participate
        const mangled = path.join(fragmentsDir, '05-collection-operations-v2.json')
        fs.writeFileSync(mangled, fs.readFileSync(mangled, 'utf8').replace(/\n  "openapi"/, '\n    "openapi"'))
        await assert.rejects(
            backfillFragments({fragmentsDir, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BACKFILL_TEST_KEY', model: 'm', fetchImpl}),
            /REST_UPSTREAM_FORMAT_NON_CANONICAL|assert|canonical/i,
        )
    } finally {
        fs.rmSync(fragmentsDir, {recursive: true, force: true})
    }
})

test('addressableRoots covers components, request/response schemas, and parameters', () => {
    const fragmentsDir = writeFragmentsDir()
    try {
        const document = JSON.parse(fs.readFileSync(path.join(fragmentsDir, '05-collection-operations-v2.json'), 'utf8'))
        assert.deepEqual(addressableRoots(document).map(root => root.label), [
            'components/schemas/QuickSetupCollection',
            'post /v2/vectordb/collections/create parameter Authorization:header',
            // the bare-$ref requestBody wrapper is skipped: its component is walked
            'post /v2/vectordb/collections/create response 200',
        ])
    } finally {
        fs.rmSync(fragmentsDir, {recursive: true, force: true})
    }
})
