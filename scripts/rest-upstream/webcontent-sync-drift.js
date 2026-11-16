#!/usr/bin/env node
// Drift check for the milvus.io RESTful reference mirror: compares the
// zdoc fragment-generation inputs (meta/openapi/**, titles.json,
// descriptions.json, fragment-migration.json) against the vendored
// scripts/apifox-docs/meta copies in milvus-io/web-content@master, via
// git blob hashes over `gh api`. Report-only by default; `--gate` exits
// 1 when any drift is pending, so CI or the watchdog digest can fail a
// stale mirror. Procedure: runbook/web-content-restful-mirror.md.

const crypto = require('node:crypto')
const {execFileSync} = require('node:child_process')
const path = require('node:path')

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const ZDOC_META = path.join(REPO_ROOT, 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'meta')
const DEFAULT_REMOTE_REPO = 'milvus-io/web-content'
const DEFAULT_REMOTE_REF = 'master'
const REMOTE_META = 'scripts/apifox-docs/meta'
const SYNC_ROOT_FILES = ['titles.json', 'descriptions.json', 'fragment-migration.json']

function fail(code, message) {
    throw new Error(`${code}: ${message}`)
}

// Git blob object id: sha1("blob <byteLength>\0" + bytes).
function computeBlobSha(bytes) {
    return crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}

function ghApi(repo, ref, remoteMeta, arg = '') {
    const out = execFileSync('gh', ['api', `repos/${repo}/contents/${remoteMeta}${arg}?ref=${ref}`],
        {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024})
    return JSON.parse(out)
}

// Remote inventory: one contents call for the fragment directory plus one
// per sync-set root file (the contents API is per-directory).
function fetchRemoteMap({fetcher = ghApi, repo, ref, remoteMeta}) {
    const map = new Map()
    for (const entry of fetcher(repo, ref, remoteMeta, '/openapi')) {
        if (entry.type === 'file') map.set(`openapi/${entry.name}`, entry.sha)
    }
    for (const name of SYNC_ROOT_FILES) {
        const entry = fetcher(repo, ref, remoteMeta, `/${name}`)
        if (entry && entry.type === 'file') map.set(name, entry.sha)
    }
    return map
}

function localMap() {
    const map = new Map()
    const openapiDir = path.join(ZDOC_META, 'openapi')
    for (const name of require('node:fs').readdirSync(openapiDir).sort()) {
        map.set(`openapi/${name}`, computeBlobSha(require('node:fs').readFileSync(path.join(openapiDir, name))))
    }
    for (const name of SYNC_ROOT_FILES) {
        map.set(name, computeBlobSha(require('node:fs').readFileSync(path.join(ZDOC_META, name))))
    }
    return map
}

// Returns {changed, missingRemote, missingLocal} keyed "openapi/x.json"-style.
function compareTrees(local, remote) {
    const changed = []
    const missingRemote = []
    const missingLocal = []
    for (const [rel, sha] of local) {
        if (!remote.has(rel)) missingRemote.push(rel)
        else if (remote.get(rel) !== sha) changed.push(rel)
    }
    for (const rel of remote.keys()) {
        if (!local.has(rel)) missingLocal.push(rel)
    }
    const byName = (a, b) => a.localeCompare(b)
    return {changed: changed.sort(byName), missingRemote: missingRemote.sort(byName), missingLocal: missingLocal.sort(byName)}
}

function formatReport({changed, missingRemote, missingLocal}) {
    const lines = []
    const total = changed.length + missingRemote.length + missingLocal.length
    lines.push(total === 0
        ? 'web-content restful mirror: in sync (0 file(s) pending)'
        : `web-content restful sync drift: ${total} file(s) pending`)
    for (const rel of changed) lines.push(`  M ${rel}`)
    for (const rel of missingRemote) lines.push(`  + ${rel}  (in zdoc, absent from web-content)`)
    for (const rel of missingLocal) lines.push(`  - ${rel}  (in web-content, absent from zdoc)`)
    if (total > 0) lines.push('  procedure: runbook/web-content-restful-mirror.md')
    return lines.join('\n')
}

function main(argv) {
    const gate = argv.includes('--gate')
    const repoIndex = argv.indexOf('--repo')
    const repo = repoIndex >= 0 ? argv[repoIndex + 1] : DEFAULT_REMOTE_REPO
    const refIndex = argv.indexOf('--ref')
    const ref = refIndex >= 0 ? argv[refIndex + 1] : DEFAULT_REMOTE_REF
    const drift = compareTrees(localMap(), fetchRemoteMap({repo, ref, remoteMeta: REMOTE_META}))
    const report = formatReport(drift)
    console.log(report)
    if (gate && drift.changed.length + drift.missingRemote.length + drift.missingLocal.length > 0) {
        fail('REST_WEBCONTENT_MIRROR_DRIFT', `${report.split('\n')[0]}`)
    }
}

module.exports = {computeBlobSha, compareTrees, fetchRemoteMap, formatReport, SYNC_ROOT_FILES}

if (require.main === module) {
    try {
        main(process.argv.slice(2))
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}
