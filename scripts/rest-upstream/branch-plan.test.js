const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {planBranches, branchPlanPrompt, parseArgs} = require('./branch-plan')

const FRAGMENT = {
    openapi: '3.0.1',
    paths: {
        '/v2/etl/merge': {post: {requestBody: {content: {'application/json': {schema: {anyOf: [
            {'x-tab-label': 'use volume', properties: {clusterId: {type: 'string'}}},
            {'x-tab-label': 'use object storage', properties: {objectUrl: {type: 'string'}}},
        ]}}}}}},
    },
}

function writeDiff(dir) {
    const diff = {source: 'zilliz-cloud-control-plane', upstreamPin: 'a'.repeat(40), entries: [
        {id: 'unattributed|post /v2/etl/merge|19-etl-v2.json|requestBody|||onError|field-uncovered|',
            category: 'unattributed', opKey: 'post /v2/etl/merge', fragment: '19-etl-v2.json', scope: 'requestBody',
            field: 'onError', change: {kind: 'field-uncovered', before: null,
                after: {type: 'string', enum: ['fail', 'cancel'], description: 'Error handling mode.'}}, evidence: ''},
    ]}
    const diffPath = path.join(dir, 'diff.json')
    fs.writeFileSync(diffPath, `${JSON.stringify(diff, null, 2)}\n`)
    return diffPath
}

function writeFragments(dir) {
    const fragmentsDir = path.join(dir, 'fragments')
    fs.mkdirSync(fragmentsDir, {recursive: true})
    fs.writeFileSync(path.join(fragmentsDir, '19-etl-v2.json'), `${JSON.stringify(FRAGMENT, null, 2)}\n`)
    return fragmentsDir
}

test('planBranches writes the validated placements and the report', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-branch-plan-'))
    process.env.BRANCH_PLAN_TEST_KEY = 'key'
    try {
        const diffPath = writeDiff(dir)
        const fragmentsDir = writeFragments(dir)
        const fetchImpl = async (url, options) => {
            assert.equal(url, 'https://gateway.invalid/v1/chat/completions')
            const body = JSON.parse(options.body)
            const record = JSON.parse(body.messages[1].content.split('\n\n')[1].trim())
            assert.equal(record.field, 'onError')
            assert.deepEqual(record.branchLabels, ['use volume', 'use object storage'])
            return {ok: true, status: 200, text: async () => '', json: async () => ({choices: [{message: {content: JSON.stringify({placements: [
                {diffEntryId: record.diffEntryId, targets: ['use volume', 'use object storage'], reason: 'shared error semantics'},
            ], reorganizations: []})}}]}) }
        }
        const outPath = path.join(dir, 'branch-plan.json')
        const reportPath = path.join(dir, 'report.json')
        const result = await planBranches({
            diffPath, fragmentsDir, outPath, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BRANCH_PLAN_TEST_KEY',
            model: 'm', reportPath, fetchImpl,
        })
        assert.deepEqual(result, {records: 1, placements: 1, rejected: []})
        const plan = JSON.parse(fs.readFileSync(outPath, 'utf8'))
        assert.deepEqual(plan.placements, [{diffEntryId: 'unattributed|post /v2/etl/merge|19-etl-v2.json|requestBody|||onError|field-uncovered|',
            targets: ['use volume', 'use object storage']}])
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
        assert.equal(report.placements, 1)
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('no placement-needing fields short-circuits to an empty plan without a model call', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-branch-plan-empty-'))
    process.env.BRANCH_PLAN_TEST_KEY = 'key'
    try {
        const diffPath = path.join(dir, 'diff.json')
        fs.writeFileSync(diffPath, `${JSON.stringify({source: 's', upstreamPin: 'a'.repeat(40), entries: []}, null, 2)}\n`)
        const fragmentsDir = writeFragments(dir)
        let called = 0
        const outPath = path.join(dir, 'branch-plan.json')
        const result = await planBranches({
            diffPath, fragmentsDir, outPath, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BRANCH_PLAN_TEST_KEY',
            model: 'm', fetchImpl: async () => {called += 1},
        })
        assert.equal(called, 0)
        assert.deepEqual(result, {records: 0, placements: 0, rejected: []})
        assert.deepEqual(JSON.parse(fs.readFileSync(outPath, 'utf8')), {placements: [], reorganizations: []})
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('invented ids and unknown labels are rejected per line; a half-covered retry still lands', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-branch-plan-bad-'))
    process.env.BRANCH_PLAN_TEST_KEY = 'key'
    try {
        const diffPath = writeDiff(dir)
        const fragmentsDir = writeFragments(dir)
        let call = 0
        const fetchImpl = async (url, options) => {
            call += 1
            const body = JSON.parse(options.body)
            const id = JSON.parse(body.messages[1].content.split('\n\n')[1].trim()).diffEntryId
            const content = call === 1
                ? {placements: [
                    {diffEntryId: 'invented', targets: ['use volume']},
                    {diffEntryId: id, targets: ['no-such-tab']},
                ], reorganizations: []}
                : {placements: [{diffEntryId: id, targets: ['use volume']}], reorganizations: []}
            return {ok: true, status: 200, text: async () => '', json: async () => ({choices: [{message: {content: JSON.stringify(content)}}]})}
        }
        const outPath = path.join(dir, 'branch-plan.json')
        const result = await planBranches({
            diffPath, fragmentsDir, outPath, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'BRANCH_PLAN_TEST_KEY',
            model: 'm', retries: 2, fetchImpl,
        })
        assert.deepEqual(result, {records: 1, placements: 1, rejected: []})
        const plan = JSON.parse(fs.readFileSync(outPath, 'utf8'))
        assert.equal(plan.placements[0].targets[0], 'use volume')
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('missing api key fails closed before any model call', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-branch-plan-nokey-'))
    try {
        const diffPath = writeDiff(dir)
        const fragmentsDir = writeFragments(dir)
        let called = 0
        await assert.rejects(
            planBranches({diffPath, fragmentsDir, outPath: path.join(dir, 'o.json'), baseUrl: 'https://gateway.invalid',
                apiKeyEnv: 'BRANCH_PLAN_TEST_KEY_ABSENT', model: 'm', fetchImpl: async () => {called += 1}}),
            /REST_UPSTREAM_BRANCH_PLAN_API_KEY_MISSING/,
        )
        assert.equal(called, 0)
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('the prompt pins the closed label set and copy-verbatim rules', () => {
    const prompt = branchPlanPrompt()
    assert.match(prompt, /branchLabels — never new names/)
    assert.match(prompt, /Copy diffEntryId values verbatim/)
    assert.match(prompt, /reorganizations.*proposals only/s)
})

test('parseArgs keeps boolean flags and valued options apart', () => {
    const args = parseArgs(['--diff', 'a.json', '--out', 'b.json', '--flag'])
    assert.equal(args.get('diff'), 'a.json')
    assert.equal(args.get('out'), 'b.json')
    assert.equal(args.get('flag'), 'true')
})
