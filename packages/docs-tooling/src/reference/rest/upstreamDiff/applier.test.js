const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {diffSpecifications} = require('./diff')
const {parseChangeSet, diffDigestOf} = require('./changeSet')
const {applyChangeSet, applyTitleEntries, reconcile, writeCanonicalOutputs} = require('./applier')
const {assertCanonicalBytes} = require('./formatter')

const SHA = 'c'.repeat(40)
const RULESET = {internalFieldDenylist: ['accessKey', 'secretKey', 'token', 'innerCall']}
const SOURCE = {id: 'zilliz-cloud-control-plane', publicationTarget: 'zilliz'}

function importFragment() {
    return {
        openapi: '3.0.1',
        info: {title: 'REST', version: 'v2'},
        paths: {
            '/v2/vectordb/jobs/import/create': {
                post: {
                    summary: 'Import Data.',
                    description: 'Create an import job.',
                    requestBody: {content: {'application/json': {schema: {oneOf: [
                        {'x-tab-label': 'Volume (Serving)', type: 'object', properties: {clusterId: {type: 'string'}}},
                        {'x-tab-label': 'External storage (Serving)', type: 'object', properties: {
                            objectUrl: {type: 'string', maxLength: 128},
                        }},
                        {'x-tab-label': 'External storage (On-demand)', type: 'object', properties: {
                            objectUrl: {type: 'string', maxLength: 128},
                        }},
                    ]}}}},
                    responses: {'200': {description: 'ok'}},
                },
            },
        },
    }
}

function importUpstream() {
    return {openapi: '3.0.3', paths: {
        '/v2/vectordb/jobs/import/create': {post: {
            summary: 'Import Data',
            description: 'Create an import job',
            requestBody: {content: {'application/json': {schema: {type: 'object', properties: {
                clusterId: {type: 'string'},
                objectUrl: {type: 'string', maxLength: 256},
                stageName: {type: 'string'},
            }}}}},
            responses: {'200': {description: 'ok'}},
        }},
        '/v2/vectordb/jobs/import/get_progress': {post: {summary: 'Get Import Progress', responses: {'200': {description: 'ok'}}}},
    }}
}

function baseDiff() {
    return diffSpecifications({source: SOURCE, upstreamPin: SHA, upstream: importUpstream(),
        fragments: new Map([['11-import-operations-v2.json', importFragment()]]),
        ledger: {schemaVersion: '1.0', entries: []}, ruleset: RULESET})
}

const SUMMARY_ID = 'upstream-modified|post /v2/vectordb/jobs/import/create|11-import-operations-v2.json|operation||||summary|'
const DESCRIPTION_ID = 'upstream-modified|post /v2/vectordb/jobs/import/create|11-import-operations-v2.json|operation||||description|'
const MAXLENGTH_SERVING_ID = 'upstream-modified|post /v2/vectordb/jobs/import/create|11-import-operations-v2.json|requestBody|External storage (Serving)||objectUrl|constraint|maxLength'
const MAXLENGTH_ONDEMAND_ID = 'upstream-modified|post /v2/vectordb/jobs/import/create|11-import-operations-v2.json|requestBody|External storage (On-demand)||objectUrl|constraint|maxLength'
const UNATTRIBUTED_STAGE_NAME_ID = 'unattributed|post /v2/vectordb/jobs/import/create|11-import-operations-v2.json|requestBody|||stageName|field-uncovered|'
const ADDED_OP_ID = 'upstream-added|post /v2/vectordb/jobs/import/get_progress||operation||||operation-absent-in-fragments|'
const CREATE_POINTER = '/paths/~1v2~1vectordb~1jobs~1import~1create/post'

function changeSet(entries, diff = baseDiff()) {
    return {
        schemaVersion: '1.0',
        source: SOURCE.id,
        diffDigest: diffDigestOf(diff),
        entries: entries.map(({id, ...rest}) => ({evidence: 'upstream pin e64f3bd7', ...rest, diffEntryId: rest.diffEntryId || id})),
    }
}

test('happy path: sourced entries apply, skeleton stays put, reconcile reports the remainder', () => {
    const diff = baseDiff()
    const diffIds = new Set(diff.entries.map(entry => entry.id))
    for (const id of [SUMMARY_ID, DESCRIPTION_ID, MAXLENGTH_SERVING_ID, MAXLENGTH_ONDEMAND_ID, UNATTRIBUTED_STAGE_NAME_ID, ADDED_OP_ID]) {
        assert.ok(diffIds.has(id), `fixture drift: ${id} missing from diff`)
    }
    const documents = new Map([['11-import-operations-v2.json', importFragment()]])
    const changeSetDoc = parseChangeSet(JSON.stringify(changeSet([
        {id: SUMMARY_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/summary`, value: 'Import Data'},
        {id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
            opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/1/properties/objectUrl/maxLength`, value: 256},
        {id: MAXLENGTH_ONDEMAND_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
            opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/2/properties/objectUrl/maxLength`, value: 256},
        {id: UNATTRIBUTED_STAGE_NAME_ID, kind: 'ledgerDraft', ledgerDraft: {opKey: 'post /v2/vectordb/jobs/import/create',
            classification: 'deferred', reason: 'branch attribution needs PM input', owner: 'doc-team'}},
        {id: ADDED_OP_ID, kind: 'title', value: {action: 'add', zhTitle: '查询导入进度', slug: 'get-import-progress'}},
        {id: DESCRIPTION_ID, kind: 'lifecycle', targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/x-added-at`, value: '3.1.x',
            override: true, overrideReason: 'lifecycle derived by hand from the 3.1 release notes'},
    ])))

    const result = applyChangeSet({documents, titles: {'查看导入': 'import-data'}, changeSet: changeSetDoc, diff, ruleset: RULESET})
    const operation = result.documents.get('11-import-operations-v2.json').paths['/v2/vectordb/jobs/import/create'].post
    assert.equal(operation.summary, 'Import Data')
    assert.equal(operation['x-added-at'], '3.1.x')
    const schema = operation.requestBody.content['application/json'].schema
    assert.equal(schema.oneOf[1].properties.objectUrl.maxLength, 256)
    assert.equal(schema.oneOf[2].properties.objectUrl.maxLength, 256)
    // scenario branch structure untouched
    assert.equal(schema.oneOf.length, 3)
    assert.deepEqual(result.titles, {'查看导入': 'import-data', '查询导入进度': 'get-import-progress'})
    assert.deepEqual(result.ledgerDrafts.map(draft => draft.classification), ['deferred'])
    assert.deepEqual(result.appliedLog.map(logEntry => logEntry.kind), ['prose', 'constraint', 'constraint', 'ledgerDraft', 'title', 'lifecycle'])
    assert.deepEqual(result.overrides, [{diffEntryId: DESCRIPTION_ID, kind: 'lifecycle', reason: 'lifecycle derived by hand from the 3.1 release notes'}])
    assert.equal(result.appliedLog[5].override, true)

    const unaddressed = reconcile(result.appliedLog, changeSetDoc, diff)
    assert.deepEqual(unaddressed, [])
    // Deferring an entry is legal: reconcile reports it instead of failing.
    const partialChangeSet = {...changeSetDoc, entries: changeSetDoc.entries.filter(entry => entry.diffEntryId !== DESCRIPTION_ID)}
    const partialLog = result.appliedLog.filter(logEntry => logEntry.diffEntryId !== DESCRIPTION_ID)
    assert.deepEqual(reconcile(partialLog, partialChangeSet, diff), [DESCRIPTION_ID])
    assert.throws(() => reconcile(result.appliedLog, partialChangeSet, diff), /REST_UPSTREAM_RECONCILE_STRAY/)
    assert.throws(() => reconcile(partialLog, changeSetDoc, diff), /REST_UPSTREAM_RECONCILE_INCOMPLETE/)
})

test('every sourcing and shape guarantee fails closed', () => {
    const diff = baseDiff()
    const documents = new Map([['11-import-operations-v2.json', importFragment()]])

    // Same write twice (diff entry + kind + locus) is rejected; a different
    // kind or leaf on the same drift entry stays expressible (design §6.3).
    assert.throws(() => parseChangeSet(JSON.stringify(changeSet([
        {id: SUMMARY_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/summary`, value: 'a'},
        {id: SUMMARY_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/summary`, value: 'b'},
    ]))), /REST_UPSTREAM_CHANGESET_DUPLICATE_DIFF_ENTRY/)

    assert.throws(() => parseChangeSet(JSON.stringify(changeSet([
        {id: SUMMARY_ID, kind: 'lifecycle', targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/x-added-at`, value: 'soon'},
    ]))), /REST_UPSTREAM_CHANGESET_VALUE_INVALID/)

    const wrongDigest = changeSet([{id: SUMMARY_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/summary`, value: 'x'}])
    wrongDigest.diffDigest = `sha256:${'0'.repeat(64)}`
    assert.throws(() => applyChangeSet({documents, changeSet: wrongDigest, diff, ruleset: RULESET}), /REST_UPSTREAM_CHANGESET_DIFF_MISMATCH/)

    const unsourced = changeSet([{diffEntryId: 'upstream-modified|post /v2/nope|21-project-operations-v2.json|operation||||summary|', kind: 'prose',
        targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/summary`, value: 'x'}])
    assert.throws(() => applyChangeSet({documents, changeSet: unsourced, diff, ruleset: RULESET}), /REST_UPSTREAM_CHANGESET_UNSOURCED/)

    const structural = changeSet([{id: SUMMARY_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/1/properties/evil`, value: 'x'}])
    assert.throws(() => applyChangeSet({documents, changeSet: structural, diff, ruleset: RULESET}), /REST_UPSTREAM_APPLY_TARGET_INVALID/)

    const internal = changeSet([{id: SUMMARY_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/properties/token`, value: 'x'}])
    assert.throws(() => applyChangeSet({documents, changeSet: internal, diff, ruleset: RULESET}), /REST_UPSTREAM_INTERNAL_FIELD/)

    const smuggledType = changeSet([{id: SUMMARY_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/0/properties/clusterId/type`, value: {object: true}}])
    assert.throws(() => applyChangeSet({documents, changeSet: smuggledType, diff, ruleset: RULESET}), /REST_UPSTREAM_APPLY_VALUE_INVALID/)

    const unknownFragment = changeSet([{id: SUMMARY_ID, kind: 'prose', targetFragment: '99-unknown.json', opPath: `${CREATE_POINTER}/summary`, value: 'x'}])
    assert.throws(() => applyChangeSet({documents, changeSet: unknownFragment, diff, ruleset: RULESET}), /REST_UPSTREAM_APPLY_FRAGMENT_UNKNOWN/)
})

test('title conflicts fail closed in both directions', () => {
    assert.throws(() => applyTitleEntries({'查看导入': 'other-slug'}, [
        {diffEntryId: 'x', value: {action: 'add', zhTitle: '查看导入', slug: 'import-data'}},
    ]), /REST_UPSTREAM_TITLES_CONFLICT/)
    assert.throws(() => applyTitleEntries({}, [
        {diffEntryId: 'x', value: {action: 'remove', zhTitle: '不存在', slug: 'nope'}},
    ]), /REST_UPSTREAM_TITLES_CONFLICT/)
})

test('writeCanonicalOutputs leaves untouched fragments byte-identical and changed ones canonical', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-apply-'))
    const outDir = path.join(dir, 'out')
    try {
        fs.writeFileSync(path.join(dir, '11-import-operations-v2.json'), JSON.stringify(importFragment(), null, 2) + '\n')
        fs.writeFileSync(path.join(dir, '12-alias-operations-v2.json'), JSON.stringify({openapi: '3.0.1', paths: {}}, null, 2) + '\n')
        const documents = new Map([['11-import-operations-v2.json', importFragment()]])
        const changeSetDoc = parseChangeSet(JSON.stringify(changeSet([
            {id: SUMMARY_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json', opPath: `${CREATE_POINTER}/summary`, value: 'Import Data'},
        ])))
        const diff = baseDiff()
        const result = applyChangeSet({documents, changeSet: changeSetDoc, diff, ruleset: RULESET})
        const written = writeCanonicalOutputs({outDir, fragmentsDir: dir, documents: result.documents, changedFiles: result.changedFiles, titles: result.titles})
        assert.deepEqual(written, ['11-import-operations-v2.json', '12-alias-operations-v2.json'])
        assert.equal(fs.readFileSync(path.join(outDir, '12-alias-operations-v2.json'), 'utf8'), fs.readFileSync(path.join(dir, '12-alias-operations-v2.json'), 'utf8'))
        const reparsed = assertCanonicalBytes(fs.readFileSync(path.join(outDir, '11-import-operations-v2.json'), 'utf8'), 'applied')
        assert.equal(reparsed.paths['/v2/vectordb/jobs/import/create'].post.summary, 'Import Data')
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('parameter required flags apply as booleans; schema required stays an array', () => {
    const fragment = {openapi: '3.0.1', paths: {'/v2/x': {post: {
        summary: 'X',
        parameters: [{name: 'projectId', in: 'query', required: true, description: 'Project.'}],
        requestBody: {content: {'application/json': {schema: {type: 'object', required: ['name'], properties: {name: {type: 'string'}}}}}},
        responses: {'200': {description: 'ok'}},
    }}}}
    const upstream = {openapi: '3.0.3', paths: {'/v2/x': {post: {
        summary: 'X',
        parameters: [{name: 'projectId', in: 'query', required: false, description: 'Project.'}],
        requestBody: {content: {'application/json': {schema: {type: 'object', required: [], properties: {name: {type: 'string'}}}}}},
        responses: {'200': {description: 'ok'}},
    }}}}
    const diff = diffSpecifications({source: SOURCE, upstreamPin: SHA, upstream, fragments: new Map([['21-project-operations-v2.json', fragment]]),
        ledger: {schemaVersion: '1.0', entries: []}, ruleset: RULESET})
    const paramId = 'upstream-modified|post /v2/x|21-project-operations-v2.json|parameter|||projectId:query|required|'
    const bodyId = 'upstream-modified|post /v2/x|21-project-operations-v2.json|requestBody|||name|required|'
    assert.deepEqual(diff.entries.map(entry => entry.id), [paramId, bodyId])

    const apply = entries => applyChangeSet({documents: new Map([['21-project-operations-v2.json', structuredClone(fragment)]]),
        changeSet: changeSet(entries, diff), diff, ruleset: RULESET})
    // Both drifts relax a requirement: flagged for R&D confirmation, so they apply only with an override.
    assert.ok(diff.entries.every(entry => entry.requiresConfirmation === 'required-relaxation'))
    assert.throws(() => apply([
        {id: paramId, kind: 'constraint', targetFragment: '21-project-operations-v2.json', opPath: '/paths/~1v2~1x/post/parameters/0/required', value: false},
    ]), /REST_UPSTREAM_APPLY_CONFIRMATION_REQUIRED/)
    const confirmed = {override: true, overrideReason: 'R&D confirmed 2026-10-28'}
    const ok = apply([
        {id: paramId, kind: 'constraint', targetFragment: '21-project-operations-v2.json', opPath: '/paths/~1v2~1x/post/parameters/0/required', value: false, ...confirmed},
        {id: bodyId, kind: 'constraint', targetFragment: '21-project-operations-v2.json', opPath: '/paths/~1v2~1x/post/requestBody/content/application~1json/schema/required', value: [], ...confirmed},
    ])
    const operation = ok.documents.get('21-project-operations-v2.json').paths['/v2/x'].post
    assert.equal(operation.parameters[0].required, false)
    assert.deepEqual(operation.requestBody.content['application/json'].schema.required, [])

    assert.throws(() => apply([{id: paramId, kind: 'constraint', targetFragment: '21-project-operations-v2.json',
        opPath: '/paths/~1v2~1x/post/parameters/0/required', value: ['projectId'], ...confirmed}]), /REST_UPSTREAM_APPLY_VALUE_INVALID/)
    assert.throws(() => apply([{id: bodyId, kind: 'constraint', targetFragment: '21-project-operations-v2.json',
        opPath: '/paths/~1v2~1x/post/requestBody/content/application~1json/schema/required', value: true, ...confirmed}]), /REST_UPSTREAM_APPLY_VALUE_INVALID/)
    // Internal field names cannot enter through a required array either, override or not.
    assert.throws(() => apply([{id: bodyId, kind: 'constraint', targetFragment: '21-project-operations-v2.json',
        opPath: '/paths/~1v2~1x/post/requestBody/content/application~1json/schema/required', value: ['name', 'token'], ...confirmed}]), /REST_UPSTREAM_INTERNAL_FIELD/)
})

test('writes are bound to the cited drift: kind, leaf, locus, and value must match unless overridden', () => {
    const diff = baseDiff()
    const fresh = () => new Map([['11-import-operations-v2.json', importFragment()]])
    const apply = entries => applyChangeSet({documents: fresh(), changeSet: changeSet(entries, diff), diff, ruleset: RULESET})
    const servingObjectUrl = `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/1/properties/objectUrl`

    // Borrowing an unrelated id to write prose (the hallucination path) is rejected.
    assert.throws(() => apply([{id: MAXLENGTH_SERVING_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/description`, value: 'HALLUCINATED'}]), /REST_UPSTREAM_APPLY_UNBOUND_TARGET/)
    // A summary drift cannot be used to rewrite the description.
    assert.throws(() => apply([{id: SUMMARY_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/description`, value: 'x'}]), /REST_UPSTREAM_APPLY_UNBOUND_TARGET/)
    // Operation-scoped drift must land on the operation object, not inside a branch.
    assert.throws(() => apply([{id: SUMMARY_ID, kind: 'prose', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/0/summary`, value: 'x'}]), /REST_UPSTREAM_APPLY_UNBOUND_LOCUS/)
    // Constraint value must equal the upstream value the diff reported...
    assert.throws(() => apply([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${servingObjectUrl}/maxLength`, value: 9999}]), /REST_UPSTREAM_APPLY_VALUE_UNBOUND/)
    // ...unless the deviation is explicit and explained, in which case it is logged.
    const overridden = apply([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${servingObjectUrl}/maxLength`, value: 512, override: true, overrideReason: 'PM asked for the documented limit, not the enforced one'}])
    assert.deepEqual(overridden.overrides.map(entry => entry.kind), ['constraint'])
    // The cited drift names objectUrl; writing clusterId instead is a locus mismatch.
    assert.throws(() => apply([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/0/properties/clusterId/maxLength`, value: 256}]), /REST_UPSTREAM_APPLY_UNBOUND_LOCUS/)
    // A maxLength drift cannot be used to write a different constraint key.
    assert.throws(() => apply([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${servingObjectUrl}/default`, value: 'x'}]), /REST_UPSTREAM_APPLY_UNBOUND_TARGET/)
    // Object defaults are never a legal constraint value shape.
    assert.throws(() => apply([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${servingObjectUrl}/default`, value: {smuggled: {deep: true}}}]), /REST_UPSTREAM_APPLY_VALUE_INVALID/)
    // Lifecycle writes need an explicit override; titles must cite the matching inventory category.
    assert.throws(() => apply([{id: DESCRIPTION_ID, kind: 'lifecycle', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/x-added-at`, value: '3.1.x'}]), /REST_UPSTREAM_APPLY_OVERRIDE_REQUIRED/)
    assert.throws(() => apply([{id: SUMMARY_ID, kind: 'title', value: {action: 'add', zhTitle: '错', slug: 'wrong'}}]), /REST_UPSTREAM_APPLY_UNBOUND_TARGET/)
    // Overrides must carry a reason (parse-time) and cannot appear without the flag.
    assert.throws(() => parseChangeSet(JSON.stringify(changeSet([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${servingObjectUrl}/maxLength`, value: 512, override: true}], diff))), /REST_UPSTREAM_CHANGESET_OVERRIDE_REASON_REQUIRED/)
    assert.throws(() => parseChangeSet(JSON.stringify(changeSet([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${servingObjectUrl}/maxLength`, value: 256, overrideReason: 'stray'}], diff))), /REST_UPSTREAM_CHANGESET_OVERRIDE_REASON_UNEXPECTED/)
})

test('branch-scoped drift must be written into the cited branch, not a sibling branch with the same field', () => {
    const diff = baseDiff()
    const apply = entries => applyChangeSet({documents: new Map([['11-import-operations-v2.json', importFragment()]]),
        changeSet: changeSet(entries, diff), diff, ruleset: RULESET})
    // MAXLENGTH_SERVING_ID is scoped to "External storage (Serving)" (oneOf/1); oneOf/2 is the On-demand branch.
    assert.throws(() => apply([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/2/properties/objectUrl/maxLength`, value: 256}]),
    /REST_UPSTREAM_APPLY_UNBOUND_LOCUS.*sits in branch "External storage \(On-demand\)"/)
    const ok = apply([{id: MAXLENGTH_SERVING_ID, kind: 'constraint', targetFragment: '11-import-operations-v2.json',
        opPath: `${CREATE_POINTER}/requestBody/content/application~1json/schema/oneOf/1/properties/objectUrl/maxLength`, value: 256}])
    assert.equal(ok.appliedLog.length, 1)
})

// Design §6.3: lifecycle writes bind to the diff-derived suggestion without an
// override; deviations and un-derived leaves still need the logged override.
const TREE_SOURCE = {id: 'milvus-data-plane', repository: 'milvus-io/milvus', apiSurface: 'data-plane', publicationTarget: 'milvus', artifact: {kind: 'source-tree'}}
const TRACK = '3.0.x'

function lifecycleFragment() {
    return {
        openapi: '3.0.1',
        info: {title: 'REST', version: 'v2'},
        paths: {
            '/v2/vectordb/collections/describe': {
                post: {
                    summary: 'Describe Collection',
                    'x-added-at': '2.6.x', 'x-last-modified': '2.6.x', 'x-deprecated-since': null,
                    requestBody: {content: {'application/json': {schema: {type: 'object', properties: {
                        collectionName: {type: 'string', maxLength: 256, 'x-added-at': '2.6.x', 'x-last-modified': '2.6.x', 'x-deprecated-since': null},
                    }}}}},
                    responses: {'200': {description: 'ok'}},
                },
            },
        },
    }
}

function lifecycleUpstream() {
    return {
        openapi: '3.0.3',
        info: {title: 'REST upstream source-tree skeleton', version: '/v2/vectordb'},
        paths: {
            '/v2/vectordb/collections/describe': {
                post: {
                    requestBody: {content: {'application/json': {schema: {type: 'object', properties: {
                        collectionName: {type: 'string', maxLength: 128},
                    }}}}},
                    responses: {'200': {description: 'ok'}},
                },
            },
        },
    }
}

function lifecycleDiff() {
    return diffSpecifications({source: TREE_SOURCE, upstreamPin: SHA, upstream: lifecycleUpstream(),
        fragments: new Map([['05-collection-operations-v2.json', lifecycleFragment()]]),
        ledger: {schemaVersion: '1.0', entries: []}, ruleset: RULESET, lifecycleTrack: TRACK})
}

const DESCRIBE_POINTER = '/paths/~1v2~1vectordb~1collections~1describe/post'
const MAXLENGTH_ID = 'upstream-modified|post /v2/vectordb/collections/describe|05-collection-operations-v2.json|requestBody|||collectionName|constraint|maxLength'
const PROPERTY_POINTER = `${DESCRIBE_POINTER}/requestBody/content/application~1json/schema/properties/collectionName`

test('lifecycle writes bind to the diff-derived suggestion without an override', () => {
    const diff = lifecycleDiff()
    const changeSetDoc = parseChangeSet(JSON.stringify(changeSet([
        {id: MAXLENGTH_ID, kind: 'constraint', targetFragment: '05-collection-operations-v2.json', opPath: `${PROPERTY_POINTER}/maxLength`, value: 128},
        {id: MAXLENGTH_ID, kind: 'lifecycle', targetFragment: '05-collection-operations-v2.json', opPath: `${PROPERTY_POINTER}/x-last-modified`, value: TRACK},
    ], diff)))
    const result = applyChangeSet({documents: new Map([['05-collection-operations-v2.json', lifecycleFragment()]]), titles: {}, changeSet: changeSetDoc, diff, ruleset: RULESET})
    const property = result.documents.get('05-collection-operations-v2.json').paths['/v2/vectordb/collections/describe'].post
        .requestBody.content['application/json'].schema.properties.collectionName
    assert.equal(property.maxLength, 128)
    assert.equal(property['x-last-modified'], TRACK)
    assert.deepEqual(result.overrides, [])
})

test('lifecycle values that deviate from the derived suggestion fail closed unless overridden', () => {
    const diff = lifecycleDiff()
    // The track format parses; the applier binding rejects the deviation.
    const changeSetDoc = parseChangeSet(JSON.stringify(changeSet([
        {id: MAXLENGTH_ID, kind: 'lifecycle', targetFragment: '05-collection-operations-v2.json', opPath: `${PROPERTY_POINTER}/x-last-modified`, value: '2.6.x', override: true, overrideReason: 'the 2.6 backport changed the field first'},
    ], diff)))
    assert.throws(
        () => applyChangeSet({documents: new Map([['05-collection-operations-v2.json', lifecycleFragment()]]), titles: {},
            changeSet: parseChangeSet(JSON.stringify(changeSet([
                {id: MAXLENGTH_ID, kind: 'lifecycle', targetFragment: '05-collection-operations-v2.json', opPath: `${PROPERTY_POINTER}/x-last-modified`, value: '2.6.x'},
            ], diff))), diff, ruleset: RULESET}),
        /REST_UPSTREAM_APPLY_VALUE_UNBOUND/,
    )
    const result = applyChangeSet({documents: new Map([['05-collection-operations-v2.json', lifecycleFragment()]]), titles: {}, changeSet: changeSetDoc, diff, ruleset: RULESET})
    assert.equal(result.overrides.length, 1)
    assert.equal(result.overrides[0].kind, 'lifecycle')
    assert.match(result.overrides[0].reason, /backport/)
})

test('ledger drafts are bound to the cited operation: a forged opKey or field-level citation is rejected', () => {
    // a draft whose opKey differs from the cited upstream-added operation is
    // an invented decision about an operation the diff never reported
    const addedDiff = {schemaVersion: '1.0', source: 'milvus-data-plane', publicationTarget: 'milvus', upstreamPin: SHA, summary: {},
        entries: [{opKey: 'post /v2/vectordb/collections/compact', category: 'upstream-added', scope: 'operation',
            change: {kind: 'operation-absent-in-fragments', before: null, after: null}, evidence: '/paths/x/post',
            id: 'upstream-added|post /v2/vectordb/collections/compact||operation||||operation-absent-in-fragments|'}]}
    assert.throws(
        () => applyChangeSet({documents: new Map(), titles: {},
            changeSet: parseChangeSet(JSON.stringify(changeSet([
                {id: 'upstream-added|post /v2/vectordb/collections/compact||operation||||operation-absent-in-fragments|',
                    kind: 'ledgerDraft', ledgerDraft: {opKey: 'post /v2/vectordb/snapshots/list',
                        classification: 'external', reason: 'invented decision', owner: 'codex-rest-refresh-agent'}},
            ], addedDiff))), diff: addedDiff, ruleset: RULESET}),
        /REST_UPSTREAM_APPLY_UNBOUND_LOCUS/,
    )
    const diff = lifecycleDiff()
    // a non-operation drift cannot carry a ledger draft at all
    assert.throws(
        () => applyChangeSet({documents: new Map([['05-collection-operations-v2.json', lifecycleFragment()]]), titles: {},
            changeSet: parseChangeSet(JSON.stringify(changeSet([
                {id: MAXLENGTH_ID, kind: 'ledgerDraft', ledgerDraft: {opKey: 'post /v2/vectordb/collections/describe',
                    classification: 'external', reason: 'field-level citation', owner: 'codex-rest-refresh-agent'}},
            ], diff))), diff, ruleset: RULESET}),
        /REST_UPSTREAM_APPLY_UNBOUND_TARGET/,
    )
    // the legit shape: an unattributed union field citing its branched operation
    const fieldDiff = {schemaVersion: '1.0', source: 'milvus-data-plane', publicationTarget: 'milvus', upstreamPin: SHA, summary: {},
        entries: [{opKey: 'post /v2/vectordb/collections/create', category: 'unattributed', scope: 'requestBody', field: 'dbName',
            change: {kind: 'field-uncovered', before: null, after: null}, evidence: '/paths/x/post',
            id: 'unattributed|post /v2/vectordb/collections/create|f.json|requestBody|||dbName|field-uncovered|'}]}
    const drafted = applyChangeSet({documents: new Map(), titles: {},
        changeSet: parseChangeSet(JSON.stringify(changeSet([
            {id: 'unattributed|post /v2/vectordb/collections/create|f.json|requestBody|||dbName|field-uncovered|',
                kind: 'ledgerDraft', ledgerDraft: {opKey: 'post /v2/vectordb/collections/create',
                    classification: 'deferred', reason: 'branch attribution needs review', owner: 'codex-rest-refresh-agent'}},
        ], fieldDiff))), diff: fieldDiff, ruleset: RULESET})
    assert.deepEqual(drafted.ledgerDrafts.map(draft => draft.opKey), ['post /v2/vectordb/collections/create'])
})

test('lifecycle leaves the diff did not derive still require the override', () => {
    const diff = lifecycleDiff()
    assert.throws(
        () => applyChangeSet({documents: new Map([['05-collection-operations-v2.json', lifecycleFragment()]]), titles: {},
            changeSet: parseChangeSet(JSON.stringify(changeSet([
                {id: MAXLENGTH_ID, kind: 'lifecycle', targetFragment: '05-collection-operations-v2.json', opPath: `${PROPERTY_POINTER}/x-added-at`, value: TRACK},
            ], diff))), diff, ruleset: RULESET}),
        /REST_UPSTREAM_APPLY_OVERRIDE_REQUIRED/,
    )
})

test('lifecycle writes honor the locus binding: cited field, operation scope, and branch labels', () => {
    const diff = lifecycleDiff()
    // Writing inside the cited property's sibling is rejected as an unbound locus.
    assert.throws(
        () => applyChangeSet({documents: new Map([['05-collection-operations-v2.json', lifecycleFragment()]]), titles: {},
            changeSet: parseChangeSet(JSON.stringify(changeSet([
                {id: MAXLENGTH_ID, kind: 'lifecycle', targetFragment: '05-collection-operations-v2.json', opPath: `${DESCRIBE_POINTER}/x-last-modified`, value: TRACK, override: true, overrideReason: 'op-scoped bump'},
            ], diff))), diff, ruleset: RULESET}),
        /REST_UPSTREAM_APPLY_UNBOUND_LOCUS/,
    )
})
