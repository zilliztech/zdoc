const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const {runWatchdog, renderWatchdogMarkdown, watchdogCardStatus, resolveHeadSha} = require('./drift-watchdog')

const ROOT = path.join(__dirname, '..', '..')
const INDEX = path.join(ROOT, 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'index.js')

function writeLock(dir, sources) {
    const lockPath = path.join(dir, 'lock.json')
    fs.writeFileSync(lockPath, JSON.stringify({schemaVersion: '1.0', sources}, null, 2) + '\n')
    return lockPath
}

function lockSource(overrides = {}) {
    return {
        id: 'zilliz-cloud-control-plane',
        repository: 'zilliztech/zilliz-cloud',
        artifact: {kind: 'spec-file', path: 'vdc/global/cloud-control-api/openapi.yaml'},
        pin: {commit: 'a'.repeat(40), contentSha256: 'b'.repeat(64)},
        trackedRef: 'master',
        apiSurface: 'control-plane',
        publicationTarget: 'zilliz',
        upstreamOasVersion: '3.1.0',
        ...overrides,
    }
}

function fetchStub(routes) {
    return async url => {
        const route = routes.find(([pattern]) => url.includes(pattern))
        if (!route) throw new Error(`unexpected fetch: ${url}`)
        const [, response] = route
        return response
    }
}

function jsonResponse(body) {
    return {ok: true, status: 200, json: async () => body, arrayBuffer: async () => Buffer.from('{}')}
}

test('resolveHeadSha returns the tracked ref head', async () => {
    const sha = await resolveHeadSha(fetchStub([['/repos/o/r/commits', jsonResponse({sha: 'c'.repeat(40)})]]), {repository: 'o/r', ref: 'master'})
    assert.equal(sha, 'c'.repeat(40))
    await assert.rejects(() => resolveHeadSha(fetchStub([['/repos/o/r/commits', {ok: false, status: 404}]]), {repository: 'o/r', ref: 'master'}), /GITHUB_API_FAILED/)
})

test('watchdog reports no-drift and classified drift per source, including source-tree extraction', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-watchdog-'))
    try {
        const lockPath = writeLock(dir, [
            lockSource(),
            lockSource({id: 'milvus-data-plane', repository: 'milvus-io/milvus', artifact: {kind: 'source-tree', paths: ['internal/distributed/proxy/httpserver/']}, pin: {commit: 'd'.repeat(40)}, apiSurface: 'data-plane', publicationTarget: 'milvus'}),
            lockSource({id: 'zilliz-cloud-control-plane-at-pin', repository: 'example/at-pin', pin: {commit: 'a'.repeat(40), contentSha256: 'b'.repeat(64)}}),
        ])
        const goFile = (name, body) => ({type: 'file', name, path: `internal/distributed/proxy/httpserver/${name}`})
        const raw = body => ({ok: true, status: 200, json: async () => ({}), arrayBuffer: async () => Buffer.from(body)})
        const routes = [
            ['zilliztech/zilliz-cloud/commits', jsonResponse({sha: 'e'.repeat(40)})],
            ['milvus-io/milvus/commits', jsonResponse({sha: 'f'.repeat(40)})],
            ['example/at-pin/commits', jsonResponse({sha: 'a'.repeat(40)})],
            ['contents/vdc', {ok: true, status: 200, json: async () => ({}), arrayBuffer: async () => Buffer.from('openapi: 3.1.0\ninfo: {title: t, version: v1}\npaths: {}\n')}],
            ['milvus-io/milvus/contents/internal/distributed/proxy/httpserver?', jsonResponse([
                goFile('handler_v2.go'),
                goFile('request_v2.go'),
                goFile('handler_v2_test.go'),
            ])],
            ['milvus-io/milvus/contents/internal/distributed/proxy/httpserver/handler_v2.go?', raw([
                'package httpserver',
                '',
                'import "github.com/gin-gonic/gin"',
                '',
                'const CollectionCategory = "/collections/"',
                'const ListAction = "list"',
                '',
                'type HandlersV2 struct{}',
                '',
                'func (h *HandlersV2) RegisterRoutesToV2(router gin.IRouter) {',
                '\trouter.POST(CollectionCategory+ListAction, timeoutMiddleware(wrapperPost(func() any { return &DatabaseReq{} }, h.listCollections)))',
                '}',
                '',
                'func timeoutMiddleware(h gin.HandlerFunc) gin.HandlerFunc { return h }',
                '',
                'func (h *HandlersV2) listCollections(c *gin.Context) {}',
            ].join('\n'))],
            ['milvus-io/milvus/contents/internal/distributed/proxy/httpserver/request_v2.go?', raw([
                'package httpserver',
                '',
                'type DatabaseReq struct {',
                '\tDbName string `json:"dbName"`',
                '}',
            ].join('\n'))],
        ]
        const outDir = path.join(dir, 'out')
        const report = await runWatchdog({
            lockPath,
            outDir,
            tokens: {private: 'token', public: 'public-token'},
            fetchImpl: fetchStub(routes),
            date: '2026-10-28',
        })
        assert.deepEqual(report.sources.map(source => [source.id, source.status]), [
            ['zilliz-cloud-control-plane', 'drift'],
            ['milvus-data-plane', 'drift'],
            ['zilliz-cloud-control-plane-at-pin', 'no-drift'],
        ])
        // The drift sources ran the deterministic diff through the real CLI;
        // the source-tree one extracted its skeleton with the real Go toolchain.
        const diffDocument = JSON.parse(fs.readFileSync(path.join(outDir, 'zilliz-cloud-control-plane', 'diff', 'diff.json'), 'utf8'))
        assert.equal(diffDocument.upstreamPin, 'e'.repeat(40))
        const treeDiff = JSON.parse(fs.readFileSync(path.join(outDir, 'milvus-data-plane', 'diff', 'diff.json'), 'utf8'))
        assert.equal(treeDiff.source, 'milvus-data-plane')
        assert.equal(treeDiff.upstreamPin, 'f'.repeat(40))
        assert.ok(treeDiff.entries.length > 0)
        assert.ok(fs.existsSync(path.join(outDir, 'milvus-data-plane', 'skeleton.json')))
        assert.match(fs.readFileSync(path.join(outDir, 'watchdog-report.md'), 'utf8'), /⚠️ drift/)
        assert.match(fs.readFileSync(path.join(outDir, 'watchdog-report.md'), 'utf8'), /✅ no drift/)
        assert.equal(watchdogCardStatus(report), 'fail')
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('watchdog fails closed when the private-repo token is missing and on diff failures', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-watchdog-neg-'))
    try {
        const lockPath = writeLock(dir, [lockSource()])
        await assert.rejects(
            () => runWatchdog({lockPath, outDir: path.join(dir, 'out'), tokens: {private: null, public: 'x'}, fetchImpl: fetchStub([['zilliztech', jsonResponse({sha: 'e'.repeat(40)})]])}),
            /REST_UPSTREAM_WATCHDOG_TOKEN_MISSING/,
        )

        // A spec the diff CLI cannot parse fails the watchdog closed.
        fs.mkdirSync(path.join(dir, 'broken'))
        const brokenLock = writeLock(path.join(dir, 'broken'), [lockSource()])
        const brokenRoutes = [
            ['zilliztech/zilliz-cloud/commits', jsonResponse({sha: 'e'.repeat(40)})],
            ['contents/vdc', {ok: true, status: 200, json: async () => ({}), arrayBuffer: async () => Buffer.from('not: [valid: yaml')}],
        ]
        await assert.rejects(
            () => runWatchdog({lockPath: brokenLock, outDir: path.join(dir, 'out2'), tokens: {private: 't', public: 'x'}, fetchImpl: fetchStub(brokenRoutes)}),
            /REST_UPSTREAM_WATCHDOG_DIFF_FAILED/,
        )
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('the committed CLI renders a markdown report and card status for a no-drift run', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-watchdog-cli-'))
    try {
        // The real lock has both sources pinned today: with no network the
        // watchdog would fail, so exercise only the render helpers.
        const report = {schemaVersion: '1.0', generatedOn: '2026-10-28', sources: [{id: 's', repository: 'o/r', trackedRef: 'master', pin: 'a'.repeat(40), head: 'a'.repeat(40), status: 'no-drift'}]}
        assert.match(renderWatchdogMarkdown(report), /✅ no drift/)
        assert.equal(watchdogCardStatus(report), 'success')
        execFileSync(process.execPath, [INDEX, 'rest-upstream-lock'], {cwd: ROOT, encoding: 'utf8'})
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})
