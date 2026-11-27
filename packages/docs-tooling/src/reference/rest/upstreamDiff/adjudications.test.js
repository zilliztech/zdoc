const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {parseRestUpstreamAdjudications, loadRestUpstreamAdjudications, assertAdjudicationsShape, canonicalKey, matchAdjudicationsForEntry, applicableAdjudications, isStaleAgainst, upstreamPayloadOf, FACT_EVIDENCE_PATTERN} = require('./adjudications')

// The shipped bootstrap file must always satisfy its own contract: a broken
// adjudications file would fail prepare (and so every refresh run) closed.
const BOOTSTRAP_PATH = path.join(__dirname, '..', 'meta', 'upstream', 'adjudications.json')

function adjudication(overrides = {}) {
    return {
        source: 'milvus-data-plane',
        opKey: 'post /v2/vectordb/entities/upsert',
        scope: 'requestBody',
        fieldPath: 'writeCondition.op',
        decision: 'upstream-truth',
        facts: ['writeCondition.op accepts only {gt, gte} — WriteConditionReq.toProto rejects any other value'],
        specLiterals: ['gt', 'gte'],
        evidence: {pr: 1414},
        decidedAt: '2026-11-23',
        decidedBy: 'human-review',
        ...overrides,
    }
}

function diffEntry(overrides = {}) {
    return {
        id: 'upstream-modified|post /v2/vectordb/entities/upsert|04-vector-operations-v2.json|requestBody|||writeCondition|schema|mirror',
        category: 'upstream-modified',
        opKey: 'post /v2/vectordb/entities/upsert',
        fragment: '04-vector-operations-v2.json',
        scope: 'requestBody',
        branch: '',
        responseStatus: '',
        field: 'writeCondition',
        change: {kind: 'schema', key: 'mirror', before: null, after: {type: 'object', properties: {op: {enum: ['gt', 'gte']}, onMissing: {enum: ['insert', 'skip', 'error']}}}},
        ...overrides,
    }
}

test('the shipped bootstrap adjudications file parses, validates, and carries unique keys', () => {
    const doc = parseRestUpstreamAdjudications(fs.readFileSync(BOOTSTRAP_PATH, 'utf8'), 'adjudications.json')
    assert.equal(doc.schemaVersion, 1)
    assert.ok(doc.adjudications.length >= 6)
    const keys = doc.adjudications.map(entry => canonicalKey(entry))
    assert.equal(new Set(keys).size, keys.length)
})

test('shape rejects duplicates, unevidenced facts, and unknown decisions', () => {
    assert.throws(() => assertAdjudicationsShape({schemaVersion: 1, adjudications: [adjudication(), adjudication()]}),
        /REST_UPSTREAM_ADJUDICATIONS_DUPLICATE_ENTRY/)
    assert.throws(() => assertAdjudicationsShape({schemaVersion: 1, adjudications: [adjudication({facts: ['the condition is evaluated in plain prose with no citation']})]}),
        /REST_UPSTREAM_ADJUDICATIONS_FACT_UNEVIDENCED/)
    assert.throws(() => assertAdjudicationsShape({schemaVersion: 1, adjudications: [adjudication({decision: 'adopt'})]}),
        /REST_UPSTREAM_ADJUDICATIONS_SCHEMA_INVALID/)
    // response/operation scopes are dead vocabulary: response entries are
    // addressed by HTTP status (not nameable in fieldPath) and operation
    // entries carry no field, while the key omits responseStatus.
    assert.throws(() => assertAdjudicationsShape({schemaVersion: 1, adjudications: [adjudication({scope: 'response'})]}),
        /REST_UPSTREAM_ADJUDICATIONS_SCHEMA_INVALID/)
    assert.throws(() => assertAdjudicationsShape({schemaVersion: 1, adjudications: [adjudication({scope: 'operation'})]}),
        /REST_UPSTREAM_ADJUDICATIONS_SCHEMA_INVALID/)
    assert.throws(() => parseRestUpstreamAdjudications('{nope'),
        /REST_UPSTREAM_ADJUDICATIONS_MALFORMED_JSON/)
})

test('the controlled facts grammar demands a literal set or a Go symbol', () => {
    assert.match('{gt, gte} enforced', FACT_EVIDENCE_PATTERN)
    assert.match('WriteConditionReq.toProto rejects other values', FACT_EVIDENCE_PATTERN)
    assert.doesNotMatch('the field accepts whatever the caller sends', FACT_EVIDENCE_PATTERN)
})

test('matching is exact on coordinates and subtree-wide on the field root', () => {
    const doc = {schemaVersion: 1, adjudications: [
        adjudication(),
        adjudication({fieldPath: 'writeCondition.onMissing'}),
        adjudication({fieldPath: 'writeCondition', opKey: 'post /v2/vectordb/entities/insert'}),
    ]}
    // A mirror drift on the writeCondition subtree raises both upsert facts, not the insert one.
    const matched = matchAdjudicationsForEntry(doc, 'milvus-data-plane', diffEntry())
    assert.deepEqual(matched.map(entry => entry.fieldPath), ['writeCondition.op', 'writeCondition.onMissing'])
    // scope, branch, and source must agree exactly
    assert.deepEqual(matchAdjudicationsForEntry(doc, 'milvus-data-plane', diffEntry({scope: 'response'})), [])
    assert.deepEqual(matchAdjudicationsForEntry(doc, 'milvus-data-plane', diffEntry({branch: 'quick-setup'})), [])
    assert.deepEqual(matchAdjudicationsForEntry(doc, 'zilliz-cloud-control-plane', diffEntry()), [])
    // parameter fields strip the :in/#N suffix against the bare parameter name
    const parameterDoc = {schemaVersion: 1, adjudications: [adjudication({scope: 'parameter', fieldPath: 'limit'})]}
    assert.equal(matchAdjudicationsForEntry(parameterDoc, 'milvus-data-plane',
        diffEntry({scope: 'parameter', field: 'limit:int64', change: {kind: 'required', key: '', before: false, after: true}})).length, 1)
})

test('staleness runs only against upstream payload bytes that exist', () => {
    const entry = adjudication()
    assert.equal(isStaleAgainst(entry, JSON.stringify({enum: ['gt', 'gte']})), false)
    assert.equal(isStaleAgainst(entry, JSON.stringify({enum: ['gt', 'gte', 'lt']})), false, 'superset payloads still contain the cited literals; the human sees the drift in the diff')
    assert.equal(isStaleAgainst(entry, JSON.stringify({enum: ['eq', 'neq']})), true, 'gone literals degrade the entry to stale')
    assert.equal(isStaleAgainst(entry, null), false, 'no payload bytes = the check cannot run, not staleness')
    assert.equal(isStaleAgainst(adjudication({specLiterals: undefined}), '{}'), false, 'no specLiterals = never stale via this gate')
    assert.equal(upstreamPayloadOf(diffEntry({change: {kind: 'description', key: '', before: 'a', after: 'b'}})), null)
    assert.equal(upstreamPayloadOf(diffEntry({change: {kind: 'constraint', key: 'enum', before: ['gt'], after: ['gt', 'gte']}})), '["gt","gte"]')
})

test('applicableAdjudications splits fresh from stale and exposes citable keys', () => {
    const doc = {schemaVersion: 1, adjudications: [
        adjudication(),
        adjudication({fieldPath: 'writeCondition.onMissing', specLiterals: ['lt']}),
    ]}
    const applicable = applicableAdjudications(doc, 'milvus-data-plane', diffEntry())
    assert.equal(applicable.fresh.length, 1)
    assert.equal(applicable.stale.length, 1)
    assert.deepEqual([...applicable.keys], [canonicalKey(adjudication())])
    assert.deepEqual([...applicable.keys].map(key => key.split('|')),
        [['milvus-data-plane', 'post /v2/vectordb/entities/upsert', 'requestBody', '', 'writeCondition.op']])
})

test('a missing adjudications file stays inert; a present-but-broken one fails closed', () => {
    const absent = path.join(fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'rest-adjudications-')), 'adjudications.json')
    assert.equal(loadRestUpstreamAdjudications(absent), null)
    const broken = path.join(fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'rest-adjudications-')), 'adjudications.json')
    fs.writeFileSync(broken, '{"schemaVersion": 1, "adjudications": []}{')
    assert.throws(() => loadRestUpstreamAdjudications(broken), /REST_UPSTREAM_ADJUDICATIONS_MALFORMED_JSON/)
})
