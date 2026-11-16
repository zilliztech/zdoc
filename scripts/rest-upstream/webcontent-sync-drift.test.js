const test = require('node:test')
const assert = require('node:assert/strict')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {computeBlobSha, compareTrees, fetchRemoteMap, formatReport, SYNC_ROOT_FILES} = require('./webcontent-sync-drift')

test('computeBlobSha matches git hash-object', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'webcontent-drift-'))
    try {
        const file = path.join(dir, 'fixture.json')
        fs.writeFileSync(file, '{"openapi":"3.0.1"}\n')
        assert.equal(computeBlobSha(fs.readFileSync(file)), execFileSync('git', ['hash-object', file], {encoding: 'utf8'}).trim())
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('compareTrees reports changed, missing-remote, and missing-local files sorted', () => {
    const local = new Map([['openapi/02-b.json', 'b2'], ['openapi/01-a.json', 'a-local'], ['titles.json', 't1']])
    const remote = new Map([['openapi/01-a.json', 'a-remote'], ['openapi/02-b.json', 'b2'], ['openapi/03-c.json', 'c3'], ['descriptions.json', 'd9']])
    const drift = compareTrees(local, remote)
    assert.deepEqual(drift.changed, ['openapi/01-a.json'])
    assert.deepEqual(drift.missingRemote, ['titles.json'])
    assert.deepEqual(drift.missingLocal, ['descriptions.json', 'openapi/03-c.json'])
})

test('formatReport summarizes drift and stays quiet when in sync', () => {
    const drift = compareTrees(
        new Map([['openapi/01-a.json', 'x'], ['titles.json', 'y']]),
        new Map([['openapi/01-a.json', 'z'], ['titles.json', 'y']]))
    const report = formatReport(drift)
    assert.match(report, /web-content restful sync drift: 1 file\(s\) pending/)
    assert.match(report, /M openapi\/01-a\.json/)
    assert.match(report, /runbook\/web-content-restful-mirror\.md/)
    assert.equal(formatReport(compareTrees(new Map([['titles.json', 'y']]), new Map([['titles.json', 'y']]))),
        'web-content restful mirror: in sync (0 file(s) pending)')
})

test('fetchRemoteMap reads the fragment directory plus the sync-set root files', () => {
    const calls = []
    const fetcher = (repo, ref, remoteMeta, arg) => {
        calls.push(`${repo}@${ref}:${remoteMeta}${arg}`)
        if (arg === '/openapi') {
            return [{type: 'file', name: '01-x.json', sha: 's1'}, {type: 'dir', name: 'sub', sha: 'ignore'}]
        }
        return {type: 'file', name: path.basename(arg), sha: `s-${arg}`}
    }
    const map = fetchRemoteMap({fetcher, repo: 'milvus-io/web-content', ref: 'master', remoteMeta: 'scripts/apifox-docs/meta'})
    assert.deepEqual(map.get('openapi/01-x.json'), 's1')
    assert.equal(map.size, 1 + SYNC_ROOT_FILES.length)
    assert.equal(calls.length, 1 + SYNC_ROOT_FILES.length)
    assert.ok(calls.every(call => call.startsWith('milvus-io/web-content@master:scripts/apifox-docs/meta')))
})
