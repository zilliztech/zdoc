#!/usr/bin/env node
'use strict'

// REST upstream drift watchdog core (design §7 T1). Read-only: for every
// source in the lock it compares the tracked ref's HEAD with the pin, and on
// drift classifies what moved with the deterministic diff — spec-file sources
// download the upstream spec at HEAD, source-tree sources download the
// non-test Go files, extract the skeleton with the vendored Go extractor, and
// diff against the fragments. The lock file is never written here: the pin
// moves only through reviewed refresh PRs, so lastVerifiedAt rides those PRs
// instead of scheduled watchdog commits.

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const {loadRestUpstreamLock} = require(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'upstreamDiff', 'lock'))
const {substantiveDriftEntries} = require(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'upstreamDiff', 'cli'))
const {diffDigestOf} = require(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'upstreamDiff', 'changeSet'))
const {serializeDocument} = require(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'upstreamDiff', 'formatter'))

const REST_UPSTREAM_ENTRY = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'index.js')
// Vendored single-file extractor (design §6.1); stdlib-only, runs without a module.
const EXTRACTOR = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'upstreamDiff', 'milvus', 'extractor.go')
const GITHUB_API = 'https://api.github.com'
// Repositories that need the private-repo contents:read token; everything
// else reads anonymously through the public token. New private sources must
// be registered here.
const PRIVATE_TOKEN_REPOSITORIES = Object.freeze(new Set(['zilliztech/zilliz-cloud']))

function fail(message) {
    throw new Error(message)
}

async function githubJson(fetchImpl, url, token) {
    const headers = {Accept: 'application/vnd.github+json'}
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetchImpl(url, {headers})
    if (!response.ok) fail(`GITHUB_API_FAILED: ${url} -> ${response.status}`)
    return response.json()
}

async function resolveHeadSha(fetchImpl, {repository, ref, token}) {
    const body = await githubJson(fetchImpl, `${GITHUB_API}/repos/${repository}/commits/${encodeURIComponent(ref)}`, token)
    if (typeof body.sha !== 'string' || !/^[a-f0-9]{40}$/.test(body.sha)) fail(`GITHUB_API_UNEXPECTED: ${repository}@${ref} returned no commit sha`)
    return body.sha
}

async function fetchSpecBytes(fetchImpl, {repository, specPath, ref, token}) {
    const headers = {Accept: 'application/vnd.github.raw+json'}
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetchImpl(`${GITHUB_API}/repos/${repository}/contents/${specPath.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(ref)}`, {headers})
    if (!response.ok) fail(`GITHUB_API_FAILED: contents ${repository}:${specPath}@${ref} -> ${response.status}`)
    return Buffer.from(await response.arrayBuffer())
}

// One source check. `no-drift` is the cheap daily path; `drift` runs the
// classification at HEAD for both artifact kinds: spec-file sources download
// the upstream spec, source-tree sources download the non-test Go files and
// extract the skeleton with the vendored extractor (design §6.1).
async function checkSource(fetchImpl, {source, tokens}) {
    const isPrivate = PRIVATE_TOKEN_REPOSITORIES.has(source.repository)
    const token = isPrivate ? tokens.private : tokens.public
    if (isPrivate && !token) fail('REST_UPSTREAM_WATCHDOG_TOKEN_MISSING: provision REST_UPSTREAM_GITHUB_TOKEN (or PRODUCT_DOC_LINKS_GITHUB_TOKEN) with contents:read on zilliztech/zilliz-cloud')
    const headSha = await resolveHeadSha(fetchImpl, {repository: source.repository, ref: source.trackedRef, token})
    const base = {id: source.id, repository: source.repository, trackedRef: source.trackedRef, pin: source.pin.commit, head: headSha}
    if (headSha === source.pin.commit) return {...base, status: 'no-drift'}
    return {...base, status: 'drift', artifactPath: source.artifact.kind === 'spec-file' ? source.artifact.path : source.artifact.paths.join(',')}
}

// Source-tree classification input: every non-test .go file of the pinned
// directory at HEAD, downloaded flat so `go run extractor.go` can parse the
// package. Test files are excluded on purpose — they are not part of the
// shipped route table.
async function fetchSourceTreeFiles(fetchImpl, {repository, sourceDir, ref, token}) {
    const dirPath = sourceDir.replace(/\/+$/, '')
    const listing = await githubJson(fetchImpl, `${GITHUB_API}/repos/${repository}/contents/${dirPath.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(ref)}`, token)
    if (!Array.isArray(listing)) fail(`GITHUB_API_UNEXPECTED: contents listing for ${repository}:${dirPath} is not a list`)
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-source-tree-'))
    try {
        for (const entry of listing) {
            if (entry.type !== 'file' || !entry.name.endsWith('.go') || entry.name.endsWith('_test.go')) continue
            const bytes = await fetchSpecBytes(fetchImpl, {repository, specPath: entry.path, ref, token})
            fs.writeFileSync(path.join(outDir, entry.name), bytes)
        }
    } catch (error) {
        // A failed download must not leak the partial checkout directory.
        fs.rmSync(outDir, {recursive: true, force: true})
        throw error
    }
    if (fs.readdirSync(outDir).length === 0) {
        fs.rmSync(outDir, {recursive: true, force: true})
        fail(`GITHUB_API_UNEXPECTED: ${repository}:${dirPath}@${ref} has no non-test Go files`)
    }
    return outDir
}

function extractSourceTreeSkeleton(goFilesDir, skeletonPath) {
    const result = spawnSync('go', ['run', EXTRACTOR, '--dir', goFilesDir, '--out', skeletonPath], {encoding: 'utf8'})
    if (result.status !== 0) {
        const detail = (result.stderr || String(result.error) || 'no stderr').slice(0, 500)
        fail(`REST_UPSTREAM_WATCHDOG_EXTRACT_FAILED: go run extractor.go failed for the source-tree checkout (${detail}); the watchdog needs the pinned Go toolchain on PATH (workflow: actions/setup-go)`)
    }
}

async function runWatchdog({lockPath, outDir, tokens, fetchImpl = globalThis.fetch, date = new Date().toISOString().slice(0, 10)}) {
    const lock = loadRestUpstreamLock(lockPath)
    const sources = []
    for (const source of lock.sources) {
        const check = await checkSource(fetchImpl, {source, tokens})
        if (check.status === 'drift') {
            const sourceDir = path.join(outDir, source.id)
            fs.mkdirSync(sourceDir, {recursive: true})
            const diffArgs = ['rest-upstream-diff', '--source', source.id, '--upstream-commit', check.head, '--out', path.join(sourceDir, 'diff')]
            if (source.artifact.kind === 'source-tree') {
                // Multi-directory sources are a lock contract the watchdog has
                // never exercised: fail loudly instead of silently diffing a
                // subset of the upstream surface.
                if (source.artifact.paths.length !== 1) {
                    fail(`REST_UPSTREAM_WATCHDOG_PATHS_UNSUPPORTED: ${source.id}: source-tree sources support exactly one directory, lock declares ${source.artifact.paths.length}`)
                }
                const goFilesDir = await fetchSourceTreeFiles(fetchImpl, {repository: source.repository, sourceDir: source.artifact.paths[0], ref: check.head, token: PRIVATE_TOKEN_REPOSITORIES.has(source.repository) ? tokens.private : tokens.public})
                try {
                    const skeletonPath = path.join(sourceDir, 'skeleton.json')
                    extractSourceTreeSkeleton(goFilesDir, skeletonPath)
                    diffArgs.push('--skeleton', skeletonPath)
                    const result = spawnSync(process.execPath, [REST_UPSTREAM_ENTRY, ...diffArgs], {encoding: 'utf8'})
                    if (result.status !== 0) fail(`REST_UPSTREAM_WATCHDOG_DIFF_FAILED: ${source.id}: ${(result.stderr || String(result.error) || 'no stderr').slice(0, 1000)}`)
                } finally {
                    fs.rmSync(goFilesDir, {recursive: true, force: true})
                }
            } else {
                // Keep the upstream extension: loadSpecFile dispatches YAML vs JSON on it.
                const specPath = path.join(sourceDir, `upstream-spec${path.extname(check.artifactPath) || '.yaml'}`)
                fs.writeFileSync(specPath, await fetchSpecBytes(fetchImpl, {repository: source.repository, specPath: check.artifactPath, ref: check.head, token: PRIVATE_TOKEN_REPOSITORIES.has(source.repository) ? tokens.private : tokens.public}))
                diffArgs.push('--spec', specPath)
                const result = spawnSync(process.execPath, [REST_UPSTREAM_ENTRY, ...diffArgs], {encoding: 'utf8'})
                if (result.status !== 0) fail(`REST_UPSTREAM_WATCHDOG_DIFF_FAILED: ${source.id}: ${(result.stderr || String(result.error) || 'no stderr').slice(0, 1000)}`)
            }
            const diffDocument = JSON.parse(fs.readFileSync(path.join(sourceDir, 'diff', 'diff.json'), 'utf8'))
            const driftEntries = substantiveDriftEntries(diffDocument)
            Object.assign(check, {
                substantiveCount: driftEntries.length,
                summary: diffDocument.summary,
                diffDigest: diffDigestOf(diffDocument),
            })
        }
        sources.push(check)
    }
    const report = {schemaVersion: '1.0', generatedOn: date, sources}
    fs.mkdirSync(outDir, {recursive: true})
    fs.writeFileSync(path.join(outDir, 'watchdog-report.json'), serializeDocument(report))
    fs.writeFileSync(path.join(outDir, 'watchdog-report.md'), renderWatchdogMarkdown(report))
    return report
}

function renderWatchdogMarkdown(report) {
    const lines = [`# REST upstream drift watchdog — ${report.generatedOn}`, '']
    for (const source of report.sources) {
        const label = source.status === 'no-drift' ? '✅ no drift'
            : `⚠️ drift — ${source.substantiveCount ?? '?'} substantive entr(ies)`
        lines.push(`## ${source.id} — ${label}`, '')
        lines.push(`- upstream: \`${source.repository}@${source.trackedRef}\`, HEAD \`${source.head}\`, pin \`${source.pin}\``)
        if (source.note) lines.push(`- ${source.note}`)
        if (source.summary) lines.push(`- diff summary: ${Object.entries(source.summary).map(([category, count]) => `${category} ${count}`).sort().join(', ')}`)
        lines.push('')
    }
    return `${lines.join('\n')}\n`
}

function watchdogCardStatus(report) {
    return report.sources.every(source => source.status === 'no-drift') ? 'success' : 'fail'
}

module.exports = {runWatchdog, renderWatchdogMarkdown, watchdogCardStatus, resolveHeadSha, fetchSpecBytes, fetchSourceTreeFiles, extractSourceTreeSkeleton, PRIVATE_TOKEN_REPOSITORIES}

if (require.main === module) {
    const args = process.argv.slice(2)
    const readOption = name => {
        const index = args.indexOf(name)
        return index >= 0 ? args[index + 1] : undefined
    }
    const lockPath = readOption('--lock') || path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'meta', 'upstream', 'rest-upstream-lock.json')
    const outDir = readOption('--out')
    if (!outDir) fail('Usage: node scripts/rest-upstream/drift-watchdog.js --out <dir> [--lock <path>]')
    runWatchdog({
        lockPath,
        outDir,
        tokens: {
            private: process.env.REST_UPSTREAM_GITHUB_TOKEN || process.env.PRODUCT_DOC_LINKS_GITHUB_TOKEN,
            public: process.env.REST_UPSTREAM_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN,
        },
    }).then(report => {
        console.log(`watchdog: ${report.sources.map(source => `${source.id}=${source.status}`).join(', ')}`)
    }).catch(error => {
        console.error(String(error?.message || error))
        process.exitCode = 1
    })
}
