const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {describeChangeSet, descriptionRejection, entrySubtree, buildReferenceIndex} = require('./describe-additions')

const CHANGE_SET = {
    schemaVersion: '1.0',
    source: 'milvus-data-plane',
    diffDigest: 'sha256:' + 'a'.repeat(64),
    entries: [
        // mirror with one described node and two prose-less ones (root + nested)
        {diffEntryId: 'upstream-modified|post /v2/x|05-a.json|requestBody|||params|schema|mirror', kind: 'mirror',
            targetFragment: '05-a.json', opPath: '/paths/~1v2~1x/post/requestBody/content/application~1json/schema/properties/params',
            value: {type: 'object', properties: {
                ttl: {type: 'integer', description: 'Time to live in seconds.'},
                consistencyLevel: {type: 'string', enum: ['Strong', 'Bounded', 'Eventually']},
            }}, requiredMembership: null, evidence: 'e', override: false},
        // field addition: single-key wrapper, subtree prose-less at the root
        {diffEntryId: 'upstream-added-field|post /v2/x|05-a.json|response||200|vectorFieldType|field-uncovered|', kind: 'addition',
            targetFragment: '05-a.json', opPath: '/paths/~1v2~1x/post/responses/200/content/application~1json/schema/properties',
            value: {vectorFieldType: {type: 'string'}}},
        // parameter addition: the parameter object itself is the addressable row
        {diffEntryId: 'upstream-added-param|post /v2/x|05-a.json|parameter|||connectTimeout:query|param-uncovered|', kind: 'addition',
            targetFragment: '05-a.json', opPath: '/paths/~1v2~1x/post/parameters',
            value: {name: 'connectTimeout', in: 'query', required: false, schema: {type: 'integer'}}},
        {diffEntryId: 'upstream-modified|post /v2/x|05-a.json|operation||||deprecated|', kind: 'constraint',
            targetFragment: '05-a.json', opPath: '/paths/~1v2~1x/post/deprecated', value: true, evidence: 'e', override: false},
    ],
}

const DIFF = {
    source: 'milvus-data-plane',
    entries: [
        {id: 'upstream-modified|post /v2/x|05-a.json|requestBody|||params|schema|mirror', opKey: 'post /v2/x',
            upstreamComments: {'consistencyLevel': 'ConsistencyLevel guards read-your-writes for quick-setup collections.'}},
        {id: 'upstream-added-field|post /v2/x|05-a.json|response||200|vectorFieldType|field-uncovered|', opKey: 'post /v2/x', upstreamComments: {}},
    ],
}

function stubFetch(byCall) {
    const calls = []
    let index = 0
    const fetchImpl = async (url, options) => {
        const body = JSON.parse(options.body)
        calls.push({url, system: body.messages[0].content, user: body.messages[1].content,
            items: body.messages[1].content.split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line))})
        const payload = byCall[index]
        index += 1
        if (payload instanceof Error) return {ok: false, status: 500, text: async () => payload.message}
        return {ok: true, status: 200, text: async () => '', json: async () => ({choices: [{message: {content: JSON.stringify(payload)}}]})}
    }
    return {calls, fetchImpl}
}

function writeFragmentsDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'describe-fragments-'))
    fs.writeFileSync(path.join(dir, '05-a.json'), JSON.stringify({
        paths: {'/v2/x': {post: {summary: 'Do the thing'}}},
        components: {schemas: {QuickSetupCollection: {type: 'object', properties: {
            consistencyLevel: {type: 'string', description: 'The consistency level of the collection.', enum: ['Strong', 'Bounded', 'Eventually']},
        }}}},
    }))
    return dir
}

test('describeChangeSet fills prose-less mirror/addition nodes and leaves other kinds untouched', async () => {
    process.env.DESCRIBE_TEST_KEY = 'key'
    const fragmentsDir = writeFragmentsDir()
    try {
        const {calls, fetchImpl} = stubFetch([
            {descriptions: [
                {p: '', en: 'Extra parameters applied to the operation.'},
                {p: 'consistencyLevel', en: 'The consistency level applied to the collection.'},
            ]},
            {descriptions: [{p: '', en: 'The element type of the vector field.'}]},
            {descriptions: [{p: '', en: 'Timeout for establishing the connection in milliseconds.'}]},
        ])
        const {changeSet, report} = await describeChangeSet({
            changeSet: structuredClone(CHANGE_SET), diff: DIFF, fragmentsDir,
            baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DESCRIBE_TEST_KEY', model: 'm', fetchImpl,
        })
        const [mirror, fieldAddition, paramAddition, constraint] = changeSet.entries
        // the mirror root is itself an addressable wrapper row and gets described too
        assert.equal(mirror.value.description, 'Extra parameters applied to the operation.')
        assert.equal(mirror.value.properties.consistencyLevel.description, 'The consistency level applied to the collection.')
        assert.equal(mirror.value.properties.ttl.description, 'Time to live in seconds.')
        assert.equal(fieldAddition.value.vectorFieldType.description, 'The element type of the vector field.')
        assert.equal(paramAddition.value.description, 'Timeout for establishing the connection in milliseconds.')
        assert.deepEqual(constraint, CHANGE_SET.entries[3])
        assert.equal(report.describedNodes, 4)
        assert.equal(report.describedEntries, 3)
        assert.deepEqual(report.degraded, [])
        assert.equal(report.grounding.upstreamCommentsUsed, 1)
        assert.equal(report.grounding.referencesUsed, 1)
        // one batch per entry with prose-less nodes; the constraint entry never calls
        assert.equal(calls.length, 3)
        // grounding rides the prompt: upstream comment + reference description + enum
        const consistencyItem = calls[0].items.find(item => item.p === 'consistencyLevel')
        assert.equal(consistencyItem.upstreamComment, 'ConsistencyLevel guards read-your-writes for quick-setup collections.')
        assert.equal(consistencyItem.references[0].description, 'The consistency level of the collection.')
        assert.deepEqual(consistencyItem.enum, ['Strong', 'Bounded', 'Eventually'])
        assert.match(calls[0].user, /Do the thing/)
    } finally {
        fs.rmSync(fragmentsDir, {recursive: true, force: true})
    }
})

test('rejected lines degrade per node: the entry still lands with its described siblings', async () => {
    process.env.DESCRIBE_TEST_KEY = 'key'
    const {fetchImpl} = stubFetch([
        {descriptions: [
            {p: '', en: 'Extra parameters applied to the operation.'},
            {p: 'consistencyLevel', en: 'Picks `bounded` or `eventually`.'},   // wrong enum casing
        ]},
        {descriptions: [{p: '', en: 'The element type of the vector field.'}]},
        {descriptions: [{p: '', en: 'Timeout for establishing the connection in milliseconds.'}]},
    ])
    const {changeSet, report} = await describeChangeSet({
        changeSet: structuredClone(CHANGE_SET), diff: DIFF, fragmentsDir: null,
        baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DESCRIBE_TEST_KEY', model: 'm', fetchImpl,
    })
    const mirror = changeSet.entries[0]
    assert.equal(mirror.value.description, 'Extra parameters applied to the operation.')
    assert.equal(mirror.value.properties.consistencyLevel.description, undefined)
    assert.equal(report.degraded.length, 1)
    assert.equal(report.degraded[0].path, 'consistencyLevel')
    assert.match(report.degraded[0].reason, /wrong casing/)
    assert.equal(report.describedNodes, 3)
    assert.equal(report.describedEntries, 3)
})

test('every pending node failing with zero described fails the stage', async () => {
    process.env.DESCRIBE_TEST_KEY = 'key'
    const {fetchImpl} = stubFetch([new Error('gateway down'), new Error('gateway down'), new Error('gateway down')])
    await assert.rejects(
        describeChangeSet({changeSet: structuredClone(CHANGE_SET), diff: DIFF, fragmentsDir: null,
            baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DESCRIBE_TEST_KEY', model: 'm', fetchImpl}),
        /REST_UPSTREAM_DESCRIBE_ALL_DEGRADED/,
    )
})

test('entries whose values are fully described never reach the model', async () => {
    process.env.DESCRIBE_TEST_KEY = 'key'
    const described = structuredClone(CHANGE_SET)
    described.entries[0].value.description = 'Described at the root.'
    described.entries[0].value.properties.consistencyLevel.description = 'Already described.'
    const {calls, fetchImpl} = stubFetch([
        {descriptions: [{p: '', en: 'The element type of the vector field.'}]},
        {descriptions: [{p: '', en: 'Timeout for establishing the connection in milliseconds.'}]},
    ])
    const {report} = await describeChangeSet({
        changeSet: described, diff: DIFF, fragmentsDir: null,
        baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DESCRIBE_TEST_KEY', model: 'm', fetchImpl,
    })
    // mirror is done; the two additions still carry prose-less roots
    assert.equal(calls.length, 2)
    assert.equal(report.describedNodes, 2)
})

test('descriptionRejection enforces the prose contract', () => {
    const node = {type: 'string', enum: ['Strong', 'Bounded']}
    assert.equal(descriptionRejection({node, en: 'The `Strong` or `Bounded` level.'}), null)
    assert.match(descriptionRejection({node, en: 'The `strong` level.'}), /wrong casing/)
    assert.match(descriptionRejection({node, en: ''}), /empty/)
    assert.match(descriptionRejection({node, en: 'To be added soon.'}), /placeholder/i)
    assert.match(descriptionRejection({node, en: '# Heading\nText.'}), /markup/)
    assert.match(descriptionRejection({node, en: 'x'.repeat(501)}), /exceeds/)
    assert.match(descriptionRejection({node, en: 42}), /not a string/)
})

test('entrySubtree resolves mirror roots, field-addition wrappers, and parameters', () => {
    const [mirror, fieldAddition, paramAddition, constraint] = CHANGE_SET.entries
    assert.equal(entrySubtree(mirror).field, 'params')
    assert.equal(entrySubtree(fieldAddition).field, 'vectorFieldType')
    assert.equal(entrySubtree(fieldAddition).subtree.type, 'string')
    assert.equal(entrySubtree(paramAddition).field, 'connectTimeout')
    assert.equal(entrySubtree(constraint), null)
})

test('buildReferenceIndex collects fragment descriptions by property name, deduped', () => {
    const fragmentsDir = writeFragmentsDir()
    try {
        const index = buildReferenceIndex(fragmentsDir)
        assert.deepEqual(index.get('consistencyLevel'), [
            {description: 'The consistency level of the collection.', enum: ['Strong', 'Bounded', 'Eventually']},
        ])
        assert.equal(index.get('absent'), undefined)
    } finally {
        fs.rmSync(fragmentsDir, {recursive: true, force: true})
    }
})
