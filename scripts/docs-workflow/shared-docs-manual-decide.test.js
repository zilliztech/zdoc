'use strict'

// Contract tests for the shared-docs manual advisory stage: per-line gates (invented
// files, unknown actions, adopt without a draft, drafts the real schema validator
// rejects), degrade-safe behavior (missing key, gateway failure), and the deterministic
// proposal merge into the candidate ledger. No network: every case runs on a stubbed
// fetch implementation.

const test = require('node:test')
const assert = require('node:assert')
const { execFileSync } = require('node:child_process')
const { mkdtemp, mkdir, readFile, rm, writeFile } = require('node:fs/promises')
const { existsSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { decideManualAdditions, validateMetadataDraft } = require('./shared-docs-manual-decide')
const { mergeProposals } = require('./shared-docs-manual-merge-proposals')

const MANUAL = `schema_version: 1
source:
  dir: API_Reference/node
publish:
  manual: node
metadata:
  Client/createCollection.md:
    added_since: v2.3.x
    description: Creates a collection.
    keywords:
      - Vector retrieval
`

async function temp(prefix) {
    const root = await mkdtemp(path.join(os.tmpdir(), prefix))
    return { root, cleanup: () => rm(root, { recursive: true, force: true }) }
}

async function writeFixture(root, { pending = ['Extras/pointer.md'], blocked = false, upToDate = false } = {}) {
    const sharedDocs = path.join(root, 'shared-docs', 'node')
    await mkdir(sharedDocs, { recursive: true })
    await writeFile(path.join(sharedDocs, 'manual.yaml'), MANUAL)
    const report = {
        schema_version: 1, kind: 'shared-manual-update', group: 'node', manual: 'node', tracking: 'master',
        from: '1'.repeat(40), to: '2'.repeat(40), added: pending, addedPending: pending,
        removed: [], removedPublished: [], removedExcluded: [], changed: [], blocked, upToDate,
        counts: { added: pending.length, removed: 0, changed: 0, addedPending: pending.length, removedPublished: 0 },
    }
    const repo = path.join(root, 'upstream')
    await mkdir(path.join(repo, 'API_Reference/node/Extras'), { recursive: true })
    await writeFile(path.join(repo, 'API_Reference/node/Extras/pointer.md'), '# pointer()\n\nAdds a pointer to a collection.\n')
    // The decide stage reads page content through `git show`, so the fixture upstream
    // must be a real repository and the lane report's `to` must be its head before the
    // report file is written.
    const gitEnv = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1',
        GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.test',
        GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.test' }
    execFileSync('git', ['-C', repo, 'init', '--quiet', '--initial-branch=master', '--object-format=sha1', '--template='])
    execFileSync('git', ['-C', repo, 'add', '.'])
    execFileSync('git', ['-c', 'commit.gpgsign=false', '-C', repo, 'commit', '--quiet', '-m', 'Fixture upstream'], { env: gitEnv })
    report.to = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD']).toString().trim()
    const laneReportPath = path.join(root, 'report.json')
    await writeFile(laneReportPath, JSON.stringify(report))
    return { sharedDocs, laneReportPath, repo }
}

const gateway = content => async () => ({ ok: true, status: 200, text: async () => '', json: async () => ({ choices: [{ message: { content } }] }) })

test('skips the call entirely when the lane report has no pending additions', async() => {
    const { root, cleanup } = await temp('decide-skip-')
    try {
        const fixture = await writeFixture(root, { pending: [] })
        let calls = 0
        const { summary } = await decideManualAdditions({
            laneReportPath: fixture.laneReportPath, sharedDocsPath: fixture.sharedDocs, repoPath: fixture.repo,
            outPath: path.join(root, 'proposals.jsonl'), reportPath: path.join(root, 'decide-report.json'),
            baseUrl: 'https://gateway.example/v1', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'test-model', fetchImpl: () => { calls += 1 } })
        assert.equal(calls, 0)
        assert.equal(summary.proposed, 0)
        assert.equal(summary.degraded, false)
        assert.ok(!existsSync(path.join(root, 'proposals.jsonl')))
    } finally { await cleanup() }
})

test('degrades without proposals when the API key is missing', async() => {
    const { root, cleanup } = await temp('decide-nokey-')
    try {
        const fixture = await writeFixture(root)
        delete process.env.DECIDE_TEST_ABSENT_KEY
        const { summary } = await decideManualAdditions({
            laneReportPath: fixture.laneReportPath, sharedDocsPath: fixture.sharedDocs, repoPath: fixture.repo,
            outPath: path.join(root, 'proposals.jsonl'), reportPath: path.join(root, 'decide-report.json'),
            baseUrl: 'https://gateway.example/v1', apiKeyEnv: 'DECIDE_TEST_ABSENT_KEY', model: 'test-model' })
        assert.equal(summary.degraded, true)
        assert.equal(summary.proposed, 0)
        assert.ok(!existsSync(path.join(root, 'proposals.jsonl')))
    } finally { await cleanup() }
})

test('degrades after exhausted gateway failures instead of failing the run', async() => {
    const { root, cleanup } = await temp('decide-gwfail-')
    try {
        const fixture = await writeFixture(root)
        process.env.DECIDE_TEST_KEY = 'k'
        let calls = 0
        const { summary } = await decideManualAdditions({
            laneReportPath: fixture.laneReportPath, sharedDocsPath: fixture.sharedDocs, repoPath: fixture.repo,
            outPath: path.join(root, 'proposals.jsonl'), reportPath: path.join(root, 'decide-report.json'),
            baseUrl: 'https://gateway.example/v1', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'test-model', retries: 2,
            fetchImpl: async () => { calls += 1; throw new Error('gateway down') } })
        assert.equal(calls, 2)
        assert.equal(summary.degraded, true)
        assert.equal(summary.proposed, 0)
        assert.ok(!existsSync(path.join(root, 'proposals.jsonl')))
    } finally { await cleanup() }
})

test('accepts valid proposals and rejects invented files, unknown actions, and undrafted adopts', async() => {
    const { root, cleanup } = await temp('decide-accept-')
    try {
        const fixture = await writeFixture(root)
        process.env.DECIDE_TEST_KEY = 'k'
        const content = JSON.stringify({ proposals: [
            { file: 'Extras/pointer.md', action: 'adopt', reason: 'public API page',
                metadata_draft: { description: 'Adds a pointer to a collection.', keywords: ['pointer', 'collection'] } },
            { file: 'Client/Invented.md', action: 'adopt', reason: 'not pending', metadata_draft: { description: 'x' } },
            { file: 'Extras/pointer.md', action: 'publish', reason: 'bad action' },
            { file: 'Extras/pointer.md', action: 'adopt', reason: 'no draft' },
        ] })
        const { summary } = await decideManualAdditions({
            laneReportPath: fixture.laneReportPath, sharedDocsPath: fixture.sharedDocs, repoPath: fixture.repo,
            outPath: path.join(root, 'proposals.jsonl'), reportPath: path.join(root, 'decide-report.json'),
            baseUrl: 'https://gateway.example/v1', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'test-model',
            fetchImpl: gateway(content) })
        assert.equal(summary.proposed, 1)
        assert.equal(summary.rejectedLines, 3)
        const lines = (await readFile(path.join(root, 'proposals.jsonl'), 'utf8')).trim().split('\n')
        assert.deepEqual(lines.map(line => JSON.parse(line).file), ['Extras/pointer.md'])
        assert.equal(JSON.parse(lines[0]).metadata_draft.description, 'Adds a pointer to a collection.')
    } finally { await cleanup() }
})

test('rejects a metadata draft the real manual-config validator refuses', async() => {
    const { root, cleanup } = await temp('decide-draft-')
    try {
        const fixture = await writeFixture(root)
        process.env.DECIDE_TEST_KEY = 'k'
        const content = JSON.stringify({ proposals: [
            { file: 'Extras/pointer.md', action: 'adopt', reason: 'beta is BYOC', metadata_draft: { description: 'Adds a pointer.', beta: 'BYOC' } },
        ] })
        const { summary } = await decideManualAdditions({
            laneReportPath: fixture.laneReportPath, sharedDocsPath: fixture.sharedDocs, repoPath: fixture.repo,
            outPath: path.join(root, 'proposals.jsonl'), reportPath: path.join(root, 'decide-report.json'),
            baseUrl: 'https://gateway.example/v1', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'test-model',
            fetchImpl: gateway(content) })
        assert.equal(summary.proposed, 0)
        assert.equal(summary.degraded, true)
        assert.ok(!existsSync(path.join(root, 'proposals.jsonl')))
    } finally { await cleanup() }
})

test('validateMetadataDraft passes a good draft through the real parser', () => {
    const context = { manuals: ['node'], betaValues: ['ON REQUEST', 'PUBLIC'] }
    assert.equal(validateMetadataDraft('Extras/pointer.md', { description: 'Adds a pointer.', sidebar_position: 7 }, context, 'API_Reference/node', 'node'), undefined)
    assert.match(validateMetadataDraft('Extras/pointer.md', { notebook: 'yes' }, context, 'API_Reference/node', 'node'), /notebook must be a boolean/)
})

test('mergeProposals fills deferred proposals only and skips invalid lines', async() => {
    const { root, cleanup } = await temp('merge-propose-')
    try {
        const sharedDocs = path.join(root, 'shared-docs', 'node')
        await mkdir(sharedDocs, { recursive: true })
        await writeFile(path.join(sharedDocs, 'manual.yaml'), MANUAL)
        const entry = { file: 'Extras/pointer.md', first_seen_pin: '2'.repeat(40), first_seen_at: '2026-11-19',
            classification: 'deferred', reason: 'pending', owner: 'shared-docs-manual-lane', decided_at: '2026-11-19' }
        const adopted = { ...entry, file: 'Client/session.md', classification: 'adopted' }
        const ledgerPath = path.join(root, 'ledger.json')
        await writeFile(ledgerPath, JSON.stringify({ schema_version: 1, entries: [entry, adopted] }))
        const proposalsPath = path.join(root, 'proposals.jsonl')
        await writeFile(proposalsPath, [
            JSON.stringify({ file: 'Extras/pointer.md', action: 'adopt', reason: 'public API', metadata_draft: { description: 'Adds a pointer.' } }),
            JSON.stringify({ file: 'Client/session.md', action: 'adopt', reason: 'already decided by a human', metadata_draft: { description: 'x' } }),
            JSON.stringify({ file: 'Extras/pointer.md', action: 'explode', reason: 'invalid action' }),
            JSON.stringify({ file: 'Extras/pointer.md', action: 'adopt', reason: 'undrafted adopt' }),
        ].join('\n'))
        const summary = await mergeProposals({ ledgerPath, proposalsPath, sharedDocsPath: sharedDocs, outPath: ledgerPath })
        assert.equal(summary.merged, 1)
        assert.equal(summary.unmatched, 0)
        assert.equal(summary.rejected, 1)
        assert.equal(summary.skipped, 2)
        const merged = JSON.parse(await readFile(ledgerPath, 'utf8'))
        assert.equal(merged.entries[0].proposal.metadata_draft.description, 'Adds a pointer.')
        assert.equal(merged.entries[0].classification, 'deferred')
        assert.equal(merged.entries[1].proposal, undefined)
        assert.equal(merged.entries[1].classification, 'adopted')
    } finally { await cleanup() }
})
