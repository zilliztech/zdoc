const test = require('node:test')
const assert = require('node:assert/strict')
const {buildCandidateLines, serializeCandidateLines} = require('./candidates')

// Hand-built diff documents shaped exactly like diff.js output (id layout:
// category|opKey|fragment|scope|branch|responseStatus|field|changeKind|changeKey).
function diffDocument() {
    return {
        source: 'zilliz-cloud-control-plane',
        entries: [
            {id: 'upstream-modified|post /v2/things|01-things-v2.json|response|success|200|code|description|',
                category: 'upstream-modified', opKey: 'post /v2/things', fragment: '01-things-v2.json', scope: 'response',
                branch: 'success', responseStatus: '200', field: 'code', change: {kind: 'description', key: '', before: 'old', after: 'Business code.'}, evidence: ''},
            {id: 'upstream-modified|put /v2/things/{ID}|01-things-v2.json|parameter|||projectId:query|required|',
                category: 'upstream-modified', opKey: 'put /v2/things/{ID}', fragment: '01-things-v2.json', scope: 'parameter',
                branch: '', responseStatus: '', field: 'projectId:query', change: {kind: 'required', key: '', before: true, after: false}, evidence: '',
                requiresConfirmation: 'required-relaxation'},
            {id: 'unattributed|post /v2/etl/merge|02-etl-v2.json|requestBody|||onError|field-uncovered|',
                category: 'unattributed', opKey: 'post /v2/etl/merge', fragment: '02-etl-v2.json', scope: 'requestBody',
                branch: '', responseStatus: '', field: 'onError', change: {kind: 'field-uncovered', key: '', before: null, after: null}, evidence: ''},
            {id: 'upstream-added|post /v2/snapshots|03-snapshots-v2.json|operation|||||',
                category: 'upstream-added', opKey: 'post /v2/snapshots', fragment: '03-snapshots-v2.json', scope: 'operation',
                branch: '', responseStatus: '', field: '', change: {kind: 'operation-absent-in-fragments', key: '', before: null, after: null}, evidence: ''},
            {id: 'fragment-only|post /v2/legacy|04-legacy-v2.json|operation|||||',
                category: 'fragment-only', opKey: 'post /v2/legacy', fragment: '04-legacy-v2.json', scope: 'operation',
                branch: '', responseStatus: '', field: '', change: {kind: 'operation-absent-upstream', key: '', before: null, after: null}, evidence: '',
                ledgerStatus: 'classified'},
            {id: 'zdoc-only|post /v2/designed|01-things-v2.json|operation|||||',
                category: 'zdoc-only', opKey: 'post /v2/designed', fragment: '01-things-v2.json', scope: 'operation',
                branch: '', responseStatus: '', field: '', change: {kind: '', key: '', before: null, after: null}, evidence: ''},
        ],
    }
}

test('candidates list every stanceable, unclassified diff entry as a compact stance line', () => {
    const lines = buildCandidateLines(diffDocument())
    assert.deepEqual(lines.map(line => line.d), [
        'upstream-modified|post /v2/things|01-things-v2.json|response|success|200|code|description|',
        'upstream-modified|put /v2/things/{ID}|01-things-v2.json|parameter|||projectId:query|required|',
        'unattributed|post /v2/etl/merge|02-etl-v2.json|requestBody|||onError|field-uncovered|',
        'upstream-added|post /v2/snapshots|03-snapshots-v2.json|operation|||||',
    ])
    // Ledger-classified fragment-only and zdoc-only drift never reaches the
    // decision stage; requiresConfirmation rides the summary so a relaxation
    // can never be adopted by mistake.
    assert.match(lines[0].c, /post \/v2\/things response branch=success field=code change=description before="old" after="Business code\."/)
    assert.match(lines[1].c, /change=required requiresConfirmation=required-relaxation before=true after=false/)
})

test('candidates honor the fragment batch filter', () => {
    const lines = buildCandidateLines(diffDocument(), {fragmentFilter: '01-things-v2.json'})
    assert.equal(lines.length, 2)
    assert.ok(lines.every(line => line.d.includes('|01-things-v2.json|')))
})

test('candidate serialization is one JSON object per line with a trailing newline', () => {
    const text = serializeCandidateLines([{d: 'a|b', c: 'summary'}])
    assert.equal(text, '{"d":"a|b","c":"summary"}\n')
})
