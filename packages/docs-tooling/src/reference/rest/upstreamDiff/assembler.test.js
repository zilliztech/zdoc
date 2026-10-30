const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {parseDecisions, loadDecisions, assembleChangeSet, stanceError} = require('./assembler')
const {diffDigestOf} = require('./changeSet')

// Fragment copy shaped like the staged copies: scenario branches are oneOf /
// anyOf members tagged x-tab-label, parameters are (name, in) objects.
const FRAGMENTS = new Map([
    ['01-things-v2.json', {
        openapi: '3.0.1',
        paths: {
            '/v2/things': {post: {
                summary: 'Create Thing.',
                requestBody: {content: {'application/json': {schema: {
                    type: 'object', required: ['dbName'],
                    properties: {dbName: {type: 'string', maxLength: 32}, actions: {type: 'array'}},
                }}}},
                responses: {'200': {content: {'application/json': {schema: {oneOf: [
                    {'x-tab-label': 'success', properties: {code: {type: 'integer', description: 'old text'}}},
                    {'x-tab-label': 'error', properties: {code: {type: 'integer'}, message: {type: 'string'}}},
                ]}}}}},
            }},
            '/v2/things/{ID}': {delete: {
                parameters: [
                    {name: 'projectId', in: 'query', required: false, schema: {type: 'string'}},
                    {name: 'dryRun', in: 'query', required: true, schema: {type: 'boolean'}},
                    {name: 'Authorization', in: 'header', required: true},
                    {name: 'Authorization', in: 'header', required: true},
                ],
                responses: {'200': {content: {'application/json': {schema: {anyOf: [
                    {'x-tab-label': 'success', properties: {code: {type: 'integer'}}},
                ]}}}}}
            }},
            '/v2/widgets': {post: {
                requestBody: {content: {'application/json': {schema: {anyOf: [
                    {properties: {size: {type: 'integer'}}},
                    {properties: {name: {type: 'string'}}},
                ]}}}},
            }},
            '/v2/gadgets': {post: {summary: 'Create Gadget.', responses: {'200': {description: 'ok'}}}},
        },
    }],
])

// Hand-built diff document shaped exactly like diff.js output (id layout:
// category|opKey|fragment|scope|branch|responseStatus|field|changeKind|changeKey).
function diffDocument() {
    return {
        source: 'zilliz-cloud-control-plane',
        entries: [
            {id: 'upstream-modified|post /v2/things|01-things-v2.json|response|success|200|code|description|',
                category: 'upstream-modified', opKey: 'post /v2/things', fragment: '01-things-v2.json', scope: 'response',
                branch: 'success', responseStatus: '200', field: 'code',
                change: {kind: 'description', key: '', before: 'old text', after: 'Business response code; 0 indicates success.'}, evidence: ''},
            {id: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||actions|required|',
                category: 'upstream-modified', opKey: 'post /v2/things', fragment: '01-things-v2.json', scope: 'requestBody',
                branch: '', responseStatus: '', field: 'actions',
                change: {kind: 'required', key: '', before: false, after: true}, evidence: ''},
            {id: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||dbName|required|',
                category: 'upstream-modified', opKey: 'post /v2/things', fragment: '01-things-v2.json', scope: 'requestBody',
                branch: '', responseStatus: '', field: 'dbName',
                change: {kind: 'required', key: '', before: true, after: false}, evidence: '',
                requiresConfirmation: 'required-relaxation'},
            {id: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||dbName|constraint|maxLength',
                category: 'upstream-modified', opKey: 'post /v2/things', fragment: '01-things-v2.json', scope: 'requestBody',
                branch: '', responseStatus: '', field: 'dbName',
                change: {kind: 'constraint', key: 'maxLength', before: 32, after: 50}, evidence: ''},
            {id: 'upstream-modified|delete /v2/things/{ID}|01-things-v2.json|parameter|||projectId:query|required|',
                category: 'upstream-modified', opKey: 'delete /v2/things/{ID}', fragment: '01-things-v2.json', scope: 'parameter',
                branch: '', responseStatus: '', field: 'projectId:query',
                change: {kind: 'required', key: '', before: false, after: true}, evidence: ''},
            {id: 'upstream-modified|delete /v2/things/{ID}|01-things-v2.json|response|success|200|code|constraint|format',
                category: 'upstream-modified', opKey: 'delete /v2/things/{ID}', fragment: '01-things-v2.json', scope: 'response',
                branch: 'success', responseStatus: '200', field: 'code',
                change: {kind: 'constraint', key: 'format', before: null, after: 'int32'}, evidence: ''},
            {id: 'upstream-modified|post /v2/gadgets|01-things-v2.json|operation||||deprecated|',
                category: 'upstream-modified', opKey: 'post /v2/gadgets', fragment: '01-things-v2.json', scope: 'operation',
                branch: '', responseStatus: '', field: '',
                change: {kind: 'deprecated', key: '', before: false, after: true}, evidence: '',
                lifecycle: {'x-last-modified': '3.2.x', 'x-deprecated-since': '3.2.x'}},
            {id: 'upstream-modified|post /v2/widgets|01-things-v2.json|requestBody|branch-1||size|constraint|maximum',
                category: 'upstream-modified', opKey: 'post /v2/widgets', fragment: '01-things-v2.json', scope: 'requestBody',
                branch: 'branch-1', responseStatus: '', field: 'size',
                change: {kind: 'constraint', key: 'maximum', before: null, after: 100}, evidence: ''},
            {id: 'upstream-modified|delete /v2/things/{ID}|01-things-v2.json|parameter|||Authorization:header#1|constraint|description',
                category: 'upstream-modified', opKey: 'delete /v2/things/{ID}', fragment: '01-things-v2.json', scope: 'parameter',
                branch: '', responseStatus: '', field: 'Authorization:header#1',
                change: {kind: 'description', key: '', before: null, after: 'Second auth header.'}, evidence: ''},
            {id: 'unattributed|post /v2/etl/merge|01-things-v2.json|requestBody|||onError|field-uncovered|',
                category: 'unattributed', opKey: 'post /v2/etl/merge', fragment: '01-things-v2.json', scope: 'requestBody',
                branch: '', responseStatus: '', field: 'onError',
                change: {kind: 'field-uncovered', key: '', before: null, after: null}, evidence: ''},
            {id: 'upstream-added|post /v2/snapshots|01-things-v2.json|operation|||||',
                category: 'upstream-added', opKey: 'post /v2/snapshots', fragment: '01-things-v2.json', scope: 'operation',
                branch: '', responseStatus: '', field: '',
                change: {kind: 'operation-absent-in-fragments', key: '', before: null, after: null}, evidence: ''},
            {id: 'upstream-added-field|delete /v2/things/{ID}|01-things-v2.json|response||200|data|field-uncovered|',
                category: 'upstream-added-field', opKey: 'delete /v2/things/{ID}', fragment: '01-things-v2.json', scope: 'response',
                branch: '', responseStatus: '200', field: 'data',
                change: {kind: 'field-uncovered', key: '', before: null, after: null}, evidence: ''},
        ],
    }
}

function fragmentLoader(fileName) {
    const document = FRAGMENTS.get(fileName)
    if (!document) throw new Error(`fixture missing fragment ${fileName}`)
    return document
}

function assemble(decisions) {
    return assembleChangeSet({diffDocument: diffDocument(), decisions, fragmentLoader})
}

test('prose adoption copies the upstream text at the branch-scoped leaf and notes the ja follow-up', () => {
    const changeSet = assemble([{diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|response|success|200|code|description|', action: 'adopt'}])
    assert.deepEqual(changeSet, {
        schemaVersion: '1.0',
        source: 'zilliz-cloud-control-plane',
        diffDigest: diffDigestOf(diffDocument()),
        entries: [{
            diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|response|success|200|code|description|',
            kind: 'prose', targetFragment: '01-things-v2.json',
            opPath: '/paths/~1v2~1things/post/responses/200/content/application~1json/schema/oneOf/0/properties/code/description',
            value: 'Business response code; 0 indicates success.',
            evidence: "post /v2/things response branch 'success' field 'code' description updated to upstream text; ja-JP page for post /v2/things needs the matching follow-up update",
            override: false,
        }],
    })
})

test('schema-level required adoption derives membership from the fragment copy', () => {
    const changeSet = assemble([{diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||actions|required|', action: 'adopt'}])
    assert.deepEqual(changeSet.entries, [{
        diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||actions|required|',
        kind: 'constraint', targetFragment: '01-things-v2.json',
        opPath: '/paths/~1v2~1things/post/requestBody/content/application~1json/schema/required',
        value: ['dbName', 'actions'],
        evidence: "post /v2/things requestBody field 'actions' required gains 'actions' (membership derived from the fragment copy)",
        override: false,
    }])
})

test('parameter required adoption writes the boolean on the parameter object (#946 semantics)', () => {
    const changeSet = assemble([{diffEntryId: 'upstream-modified|delete /v2/things/{ID}|01-things-v2.json|parameter|||projectId:query|required|', action: 'adopt'}])
    assert.deepEqual(changeSet.entries, [{
        diffEntryId: 'upstream-modified|delete /v2/things/{ID}|01-things-v2.json|parameter|||projectId:query|required|',
        kind: 'constraint', targetFragment: '01-things-v2.json',
        opPath: '/paths/~1v2~1things~1{ID}/delete/parameters/0',
        value: true,
        evidence: "delete /v2/things/{ID} parameter field 'projectId:query' required → true",
        override: false,
    }])
})

test('constraint adoption writes the upstream scalar; deprecated adoption writes the flag plus diff-suggested lifecycle leaves', () => {
    const changeSet = assemble([
        {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||dbName|constraint|maxLength', action: 'adopt'},
        {diffEntryId: 'upstream-modified|post /v2/gadgets|01-things-v2.json|operation||||deprecated|', action: 'adopt'},
    ])
    assert.deepEqual(changeSet.entries, [
        {
            diffEntryId: 'upstream-modified|post /v2/gadgets|01-things-v2.json|operation||||deprecated|',
            kind: 'constraint', targetFragment: '01-things-v2.json',
            opPath: '/paths/~1v2~1gadgets/post/deprecated', value: true,
            evidence: 'post /v2/gadgets operation deprecated false → true', override: false,
        },
        {
            diffEntryId: 'upstream-modified|post /v2/gadgets|01-things-v2.json|operation||||deprecated|',
            kind: 'lifecycle', targetFragment: '01-things-v2.json',
            opPath: '/paths/~1v2~1gadgets/post/x-last-modified', value: '3.2.x',
            evidence: 'post /v2/gadgets operation x-last-modified="3.2.x" (diff-suggested lifecycle)', override: false,
        },
        {
            diffEntryId: 'upstream-modified|post /v2/gadgets|01-things-v2.json|operation||||deprecated|',
            kind: 'lifecycle', targetFragment: '01-things-v2.json',
            opPath: '/paths/~1v2~1gadgets/post/x-deprecated-since', value: '3.2.x',
            evidence: 'post /v2/gadgets operation x-deprecated-since="3.2.x" (diff-suggested lifecycle)', override: false,
        },
        {
            diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||dbName|constraint|maxLength',
            kind: 'constraint', targetFragment: '01-things-v2.json',
            opPath: '/paths/~1v2~1things/post/requestBody/content/application~1json/schema/properties/dbName/maxLength', value: 50,
            evidence: "post /v2/things requestBody field 'dbName' maxLength 32 → 50", override: false,
        },
    ])
})

test('override decisions pass through to the change set with their reason', () => {
    const changeSet = assemble([{diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||dbName|required|', action: 'adopt', override: true, overrideReason: 'R&D confirmed the relaxation upstream'}])
    assert.equal(changeSet.entries[0].override, true)
    assert.equal(changeSet.entries[0].overrideReason, 'R&D confirmed the relaxation upstream')
})

test('skip rows produce nothing; ledger rows become operation-bound drafts', () => {
    const changeSet = assemble([
        {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||dbName|required|', action: 'skip', reason: 'flagged relaxation; human decision pending'},
        {diffEntryId: 'unattributed|post /v2/etl/merge|01-things-v2.json|requestBody|||onError|field-uncovered|', action: 'ledger', classification: 'deferred', reason: 'branch attribution unclear'},
        {diffEntryId: 'upstream-added|post /v2/snapshots|01-things-v2.json|operation|||||', action: 'ledger', classification: 'deferred', reason: 'confirmed public, content work pending'},
    ])
    assert.deepEqual(changeSet.entries.map(entry => [entry.kind, entry.ledgerDraft?.classification]), [
        ['ledgerDraft', 'deferred'],
        ['ledgerDraft', 'deferred'],
    ])
    assert.equal(changeSet.entries[0].ledgerDraft.opKey, 'post /v2/etl/merge')
    assert.equal(changeSet.entries[1].ledgerDraft.opKey, 'post /v2/snapshots')
})

test('a required drift with a lifecycle suggestion anchors the lifecycle leaves on the schema object', () => {
    // The applier binds required-cited entries to the schema declaring the
    // field (its .properties), so the field object is not a legal lifecycle
    // locus for them; the schema itself is.
    const diff = diffDocument()
    diff.entries[1].lifecycle = {'x-last-modified': '3.0.x'}
    const changeSet = assembleChangeSet({diffDocument: diff, decisions: [{diffEntryId: diff.entries[1].id, action: 'adopt'}], fragmentLoader})
    assert.deepEqual(changeSet.entries.map(entry => [entry.kind, entry.opPath]), [
        ['constraint', '/paths/~1v2~1things/post/requestBody/content/application~1json/schema/required'],
        ['lifecycle', '/paths/~1v2~1things/post/requestBody/content/application~1json/schema/x-last-modified'],
    ])
})

test('positional branch-N citations resolve unlabeled oneOf/anyOf members', () => {
    const changeSet = assemble([{diffEntryId: 'upstream-modified|post /v2/widgets|01-things-v2.json|requestBody|branch-1||size|constraint|maximum', action: 'adopt'}])
    assert.equal(changeSet.entries[0].opPath, '/paths/~1v2~1widgets/post/requestBody/content/application~1json/schema/anyOf/0/properties/size/maximum')
})

test('copy-indexed parameter fields resolve the cited duplicate occurrence', () => {
    const changeSet = assemble([{diffEntryId: 'upstream-modified|delete /v2/things/{ID}|01-things-v2.json|parameter|||Authorization:header#1|constraint|description', action: 'adopt'}])
    assert.equal(changeSet.entries[0].opPath, '/paths/~1v2~1things~1{ID}/delete/parameters/3/description')
})

test('stanceError mirrors the assembler gates on the diff entry alone', () => {
    const diff = diffDocument()
    const byId = new Map(diff.entries.map(entry => [entry.id, entry]))
    assert.equal(stanceError({action: 'adopt'}, byId.get('upstream-modified|post /v2/things|01-things-v2.json|response|success|200|code|description|')), null)
    assert.equal(stanceError({action: 'adopt'}, byId.get('upstream-modified|post /v2/things|01-things-v2.json|requestBody|||actions|required|')), null)
    assert.match(stanceError({action: 'adopt'}, byId.get('unattributed|post /v2/etl/merge|01-things-v2.json|requestBody|||onError|field-uncovered|')), /only upstream-modified/)
    assert.match(stanceError({action: 'ledger'}, byId.get('upstream-added-field|delete /v2/things/{ID}|01-things-v2.json|response||200|data|field-uncovered|')), /operation-level drift/)
    assert.match(stanceError({action: 'adopt'}, {category: 'upstream-modified', change: {kind: 'param-uncovered'}}), /param-uncovered/)
    assert.equal(stanceError({action: 'skip'}, byId.get('upstream-added|post /v2/snapshots|01-things-v2.json|operation|||||')), null)
})

test('fail-closed: unknown ids, field-level ledger targets, and non-mechanical adopt targets', () => {
    assert.throws(() => assemble([{diffEntryId: 'upstream-modified|invented|01-things-v2.json|operation||||deprecated|', action: 'adopt'}]),
        /REST_UPSTREAM_ASSEMBLE_DIFF_ENTRY_UNKNOWN/)
    assert.throws(() => assemble([{diffEntryId: 'upstream-added-field|delete /v2/things/{ID}|01-things-v2.json|response||200|data|field-uncovered|', action: 'ledger', classification: 'deferred', reason: 'x'}]),
        /REST_UPSTREAM_ASSEMBLE_LEDGER_TARGET_INVALID/)
    assert.throws(() => assemble([{diffEntryId: 'upstream-added|post /v2/snapshots|01-things-v2.json|operation|||||', action: 'adopt'}]),
        /REST_UPSTREAM_ASSEMBLE_ADOPT_TARGET_INVALID/)
    assert.throws(() => assemble([{diffEntryId: 'upstream-modified|post /v2/gadgets|01-things-v2.json|operation||||deprecated|', action: 'ledger', classification: 'deferred', reason: 'x'}]),
        /REST_UPSTREAM_ASSEMBLE_LEDGER_TARGET_INVALID/)
})

test('fail-closed: branch resolution and unknown constraint keys', () => {
    const diff = diffDocument()
    diff.entries[0].branch = 'no-such-branch'
    assert.throws(() => assembleChangeSet({diffDocument: diff, decisions: [{diffEntryId: diff.entries[0].id, action: 'adopt'}], fragmentLoader}),
        /REST_UPSTREAM_ASSEMBLE_BRANCH_NOT_FOUND/)
    const constraint = diffDocument()
    constraint.entries[3].change = {kind: 'constraint', key: 'unknownKey', before: 1, after: 2}
    assert.throws(() => assembleChangeSet({diffDocument: constraint, decisions: [{diffEntryId: constraint.entries[3].id, action: 'adopt'}], fragmentLoader}),
        /REST_UPSTREAM_ASSEMBLE_CHANGE_UNSUPPORTED/)
})

test('decision parsing enforces the contract and rejects duplicates', () => {
    assert.throws(() => parseDecisions('{"diffEntryId":"x","action":"ledger"}\n'), /REST_UPSTREAM_DECISION_INVALID/)
    assert.throws(() => parseDecisions('{"diffEntryId":"x","action":"skip"}\n'), /REST_UPSTREAM_DECISION_INVALID/)
    assert.throws(() => parseDecisions('{"diffEntryId":"x","action":"adopt","override":true}\n'), /REST_UPSTREAM_DECISION_INVALID/)
    assert.throws(() => parseDecisions('{"diffEntryId":"x","action":"adopt"}\n{"diffEntryId":"x","action":"skip","reason":"y"}\n'), /REST_UPSTREAM_DECISION_DUPLICATE/)
    assert.throws(() => parseDecisions('{"diffEntryId":"x","action":\n'), /REST_UPSTREAM_DECISIONS_MALFORMED_JSON/)
    assert.deepEqual(parseDecisions('{"diffEntryId":"x","action":"skip","reason":"y"}\n\n'), [{diffEntryId: 'x', action: 'skip', reason: 'y'}])
})

test('loadDecisions reads a JSONL file from disk', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-decisions-'))
    try {
        const file = path.join(dir, 'decisions.jsonl')
        fs.writeFileSync(file, '{"diffEntryId":"a","action":"adopt"}\n{"diffEntryId":"b","action":"ledger","classification":"deferred","reason":"r"}\n')
        assert.deepEqual(loadDecisions(file).map(decision => decision.diffEntryId), ['a', 'b'])
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})
