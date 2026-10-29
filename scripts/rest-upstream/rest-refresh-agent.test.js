const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {runRefreshAgent, agentPrompt, codexThreadConfig, parseArgs} = require('./rest-refresh-agent')
const {diffDigestOf} = require(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'upstreamDiff', 'changeSet'))

const DIFF = {
    schemaVersion: '1.0',
    source: 'zilliz-cloud-control-plane',
    publicationTarget: 'zilliz',
    upstreamPin: 'a'.repeat(40),
    summary: {'upstream-modified': 1},
    entries: [{
        id: 'upstream-modified|post /v2/projects|21-project-operations-v2.json|requestBody|||projectName|constraint|maxLength',
        category: 'upstream-modified',
        opKey: 'post /v2/projects',
        fragment: '21-project-operations-v2.json',
        scope: 'requestBody',
        field: 'projectName',
        change: {kind: 'constraint', key: 'maxLength', before: 32, after: 50},
        evidence: '#/paths/~1v2~1projects/post',
    }],
}

function makeStaging({withChangeSet = null, withStaleOutput = false} = {}) {
    const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-refresh-agent-'))
    fs.writeFileSync(path.join(staging, 'INSTRUCTIONS.md'), '# Instruction pack\n')
    fs.mkdirSync(path.join(staging, 'diff'), {recursive: true})
    fs.writeFileSync(path.join(staging, 'diff', 'diff.json'), JSON.stringify(DIFF, null, 2) + '\n')
    if (withStaleOutput) fs.writeFileSync(path.join(staging, 'change-set.json'), '{}')
    return staging
}

function fakeSdk(onRun) {
    return async () => ({
        Codex: class {
            constructor() {}
            startThread(options) {
                return {run: async prompt => onRun(prompt, options)}
            }
        },
    })
}

function changeSetFor(diff) {
    return {
        schemaVersion: '1.0',
        source: diff.source,
        diffDigest: diffDigestOf(diff),
        entries: [{
            diffEntryId: diff.entries[0].id,
            kind: 'constraint',
            evidence: diff.entries[0].evidence,
            targetFragment: '21-project-operations-v2.json',
            opPath: '/paths/~1v2~1projects/post/requestBody/content/application~1json/schema/properties/projectName/maxLength',
            value: 50,
        }],
    }
}

test('parseArgs handles paired options and boolean flags', () => {
    assert.deepEqual([...parseArgs(['--staging', '/tmp/x', '--fresh', '--model', 'm'])], [['staging', '/tmp/x'], ['fresh', 'true'], ['model', 'm']])
    assert.throws(() => parseArgs(['staging']), /Usage: node scripts\/rest-upstream\/rest-refresh-agent\.js/)
})

test('the composed prompt is staging-relative and names the two contract files', () => {
    const prompt = agentPrompt()
    assert.match(prompt, /INSTRUCTIONS\.md/)
    assert.match(prompt, /change-set\.json/)
    assert.ok(!prompt.includes('/Users/'))
    assert.ok(!prompt.includes(os.tmpdir()))
})

test('codexThreadConfig rejects unknown reasoning efforts', () => {
    assert.throws(() => codexThreadConfig({baseUrl: 'https://gw', reasoningEffort: 'extreme'}), /reasoning effort/)
    const config = codexThreadConfig({baseUrl: 'https://gw', reasoningEffort: 'high'})
    assert.equal(config.model_providers.agenticgateway.base_url, 'https://gw')
})

test('runRefreshAgent validates the staging layout, binds the change set to the diff, and writes a report', async () => {
    const staging = makeStaging()
    try {
        const report = await runRefreshAgent({
            staging,
            model: 'test-model',
            baseUrl: 'https://gateway.internal',
            apiKey: 'test-key',
            loadSdk: fakeSdk(async (prompt, options) => {
                assert.match(prompt, /INSTRUCTIONS\.md/)
                assert.equal(options.sandboxMode, 'danger-full-access')
                assert.equal(options.workingDirectory, staging)
                fs.writeFileSync(path.join(staging, 'change-set.json'), JSON.stringify(changeSetFor(DIFF), null, 2) + '\n')
                return {finalResponse: 'done'}
            }),
        })
        assert.equal(report.entryCount, 1)
        assert.equal(report.diffDigest, diffDigestOf(DIFF))
        const written = JSON.parse(fs.readFileSync(path.join(staging, 'agent-report.json'), 'utf8'))
        assert.equal(written.source, 'zilliz-cloud-control-plane')
    } finally {
        fs.rmSync(staging, {recursive: true, force: true})
    }
})

test('runRefreshAgent fails closed on incomplete staging, stale output, missing change set, and digest drift', async () => {
    const incomplete = makeStaging()
    fs.rmSync(path.join(incomplete, 'INSTRUCTIONS.md'))
    try {
        await assert.rejects(
            () => runRefreshAgent({staging: incomplete, model: 'm', baseUrl: 'b', apiKey: 'k', loadSdk: fakeSdk(async () => ({finalResponse: ''}))}),
            /REST_UPSTREAM_AGENT_STAGING_INCOMPLETE/,
        )

        const stale = makeStaging({withStaleOutput: true})
        try {
            await assert.rejects(
                () => runRefreshAgent({staging: stale, model: 'm', baseUrl: 'b', apiKey: 'k', loadSdk: fakeSdk(async () => ({finalResponse: ''}))}),
                /REST_UPSTREAM_AGENT_STALE_OUTPUT/,
            )
            await assert.doesNotReject(
                () => runRefreshAgent({staging: stale, model: 'm', baseUrl: 'b', apiKey: 'k', fresh: true, loadSdk: fakeSdk(async (_prompt, options) => {
                    fs.writeFileSync(path.join(options.workingDirectory, 'change-set.json'), JSON.stringify(changeSetFor(DIFF), null, 2) + '\n')
                    return {finalResponse: ''}
                })}),
            )
        } finally {
            fs.rmSync(stale, {recursive: true, force: true})
        }

        const empty = makeStaging()
        try {
            await assert.rejects(
                () => runRefreshAgent({staging: empty, model: 'm', baseUrl: 'b', apiKey: 'k', loadSdk: fakeSdk(async () => ({finalResponse: 'I decided to write nothing'}))}),
                /REST_UPSTREAM_AGENT_NO_OUTPUT/,
            )

            const tampered = changeSetFor(DIFF)
            tampered.diffDigest = 'sha256:' + '0'.repeat(64)
            await assert.rejects(
                () => runRefreshAgent({staging: empty, model: 'm', baseUrl: 'b', apiKey: 'k', fresh: true, loadSdk: fakeSdk(async (_prompt, options) => {
                    fs.writeFileSync(path.join(options.workingDirectory, 'change-set.json'), JSON.stringify(tampered, null, 2) + '\n')
                    return {finalResponse: ''}
                })}),
                /REST_UPSTREAM_CHANGESET_DIFF_MISMATCH/,
            )
        } finally {
            fs.rmSync(empty, {recursive: true, force: true})
        }
    } finally {
        fs.rmSync(incomplete, {recursive: true, force: true})
    }
})
