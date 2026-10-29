const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
const {refreshLifecycleEvidenceInventory, collect} = require('./refresh-lifecycle-inventory')

// The inventory line format is owned by scripts/verify-rest-lifecycle-evidence.mjs:
// "<fragment sha256>  <repo-relative posix path>\n" over the evidence's fragment
// set, sorted. These fixtures keep a miniature copy of that contract.

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const REAL_REST_META = path.join(REPO_ROOT, 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'meta')

function fragmentDocument(endpoint, lastModified = '3.0.x') {
    return {
        openapi: '3.0.1',
        paths: {
            [endpoint]: {post: {
                summary: 'Op',
                'x-added-at': '3.0.x', 'x-last-modified': lastModified, 'x-deprecated-since': null,
                responses: {'200': {description: 'ok'}},
            }},
        },
    }
}

function workspace() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-lifecycle-inventory-'))
    const restMeta = path.join(root, 'meta')
    fs.mkdirSync(path.join(restMeta, 'openapi'), {recursive: true})
    fs.mkdirSync(path.join(restMeta, 'lifecycle-evidence'), {recursive: true})
    const fragments = {'37-file-resource-operations-v2.json': fragmentDocument('/v2/vectordb/file_resources/list')}
    const elements = []
    for (const [name, spec] of Object.entries(fragments)) {
        fs.writeFileSync(path.join(restMeta, 'openapi', name), `${JSON.stringify(spec, null, 2)}\n`)
        for (const row of collect(spec)) {
            elements.push({fragment: name, jsonPointer: row.jsonPointer, change: 'added',
                lifecycle: row.lifecycle, source: {commit: 'a'.repeat(40), file: 'request.go', symbol: 'List'}})
        }
    }
    const inventoryHash = crypto.createHash('sha256')
    for (const name of Object.keys(fragments).sort()) {
        const bytes = fs.readFileSync(path.join(restMeta, 'openapi', name))
        inventoryHash.update(`${crypto.createHash('sha256').update(bytes).digest('hex')}  meta/openapi/${name}\n`)
    }
    const evidence = {
        schemaVersion: 1,
        apiSurface: 'data-plane',
        managedFloor: '2.6.x',
        source: {repository: 'milvus-io/milvus', baseCommit: 'a'.repeat(40), headCommit: 'b'.repeat(40)},
        summary: {elements: elements.length},
        reproducibility: {fragmentInventorySha256: inventoryHash.digest('hex')},
        elements,
    }
    fs.writeFileSync(path.join(restMeta, 'lifecycle-evidence', 'milvus-2.6.x-bootstrap.json'), `${JSON.stringify(evidence, null, 2)}\n`)
    return {root, restMeta, fragments: Object.keys(fragments)}
}

test('the real tree is already current: the hash algorithm stays same-source with the verify script', () => {
    const result = refreshLifecycleEvidenceInventory({root: REPO_ROOT, restMeta: REAL_REST_META})
    assert.equal(result.changed, false)
    assert.equal(result.hash, JSON.parse(fs.readFileSync(path.join(REAL_REST_META, 'lifecycle-evidence', 'milvus-2.6.x-bootstrap.json'), 'utf8')).reproducibility.fragmentInventorySha256)
    assert.ok(result.elements > 2000)
})

test('a legitimate fragment byte change refreshes the hash and nothing else', () => {
    const ws = workspace()
    try {
        const fragmentPath = path.join(ws.restMeta, 'openapi', ws.fragments[0])
        const spec = JSON.parse(fs.readFileSync(fragmentPath, 'utf8'))
        spec.paths['/v2/vectordb/file_resources/list'].post.summary = 'Op (refreshed)'
        fs.writeFileSync(fragmentPath, `${JSON.stringify(spec, null, 2)}\n`)

        const result = refreshLifecycleEvidenceInventory({root: ws.root, restMeta: ws.restMeta})
        assert.equal(result.changed, true)
        // same element count, same values: only the inventory hash moved
        const evidence = JSON.parse(fs.readFileSync(path.join(ws.restMeta, 'lifecycle-evidence', 'milvus-2.6.x-bootstrap.json'), 'utf8'))
        assert.equal(result.hash, evidence.reproducibility.fragmentInventorySha256)
        assert.equal(evidence.summary.elements, result.elements)
        // and the recomputed hash is exactly what the verify algorithm derives
        const check = crypto.createHash('sha256')
        const bytes = fs.readFileSync(fragmentPath)
        check.update(`${crypto.createHash('sha256').update(bytes).digest('hex')}  meta/openapi/${ws.fragments[0]}\n`)
        assert.equal(result.hash, check.digest('hex'))
    } finally {
        fs.rmSync(ws.root, {recursive: true, force: true})
    }
})

test('a lifecycle value drift fails closed and never gets re-hashed', () => {
    const ws = workspace()
    try {
        const fragmentPath = path.join(ws.restMeta, 'openapi', ws.fragments[0])
        const spec = JSON.parse(fs.readFileSync(fragmentPath, 'utf8'))
        spec.paths['/v2/vectordb/file_resources/list'].post['x-last-modified'] = '9.9.x'
        fs.writeFileSync(fragmentPath, `${JSON.stringify(spec, null, 2)}\n`)
        const before = fs.readFileSync(path.join(ws.restMeta, 'lifecycle-evidence', 'milvus-2.6.x-bootstrap.json'), 'utf8')

        assert.throws(
            () => refreshLifecycleEvidenceInventory({root: ws.root, restMeta: ws.restMeta}),
            error => {
                assert.match(error.message, /REST_UPSTREAM_LIFECYCLE_ELEMENT_DRIFT/)
                assert.match(error.message, /refresh them in review, do not re-hash/)
                return true
            },
        )
        // the evidence file is untouched on the failure path
        assert.equal(fs.readFileSync(path.join(ws.restMeta, 'lifecycle-evidence', 'milvus-2.6.x-bootstrap.json'), 'utf8'), before)
    } finally {
        fs.rmSync(ws.root, {recursive: true, force: true})
    }
})

test('an element present in fragments but absent from the evidence is drift too', () => {
    const ws = workspace()
    try {
        const fragmentPath = path.join(ws.restMeta, 'openapi', ws.fragments[0])
        const spec = JSON.parse(fs.readFileSync(fragmentPath, 'utf8'))
        spec.paths['/v2/vectordb/file_resources/list'].post.responses['200']['x-added-at'] = '3.0.x'
        spec.paths['/v2/vectordb/file_resources/list'].post.responses['200']['x-last-modified'] = '3.0.x'
        spec.paths['/v2/vectordb/file_resources/list'].post.responses['200']['x-deprecated-since'] = null
        fs.writeFileSync(fragmentPath, `${JSON.stringify(spec, null, 2)}\n`)
        assert.throws(
            () => refreshLifecycleEvidenceInventory({root: ws.root, restMeta: ws.restMeta}),
            /absent from the evidence/,
        )
    } finally {
        fs.rmSync(ws.root, {recursive: true, force: true})
    }
})
