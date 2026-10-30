const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {decideBatches, parseModelContent, acceptDecisionLine, chatCompletionsUrl, decisionSystemPrompt} = require('./decide-batches')

// Minimal diff shaped like diff.js output: two fragment batches. The 2026-10-30
// merge model keeps prose/mirrors/additions out of the candidate list, so the
// stanceable fixtures are deprecation flips, parameter required drifts, and
// hand-built leaf constraints.
function writeDiff(dir) {
    const diff = {
        source: 'zilliz-cloud-control-plane',
        upstreamPin: 'e64f3bd77c94971d2352ca61eb86d1a1f11bf2cb',
        entries: [
            {id: 'upstream-modified|post /v2/things|01-things-v2.json|operation||||deprecated|',
                category: 'upstream-modified', opKey: 'post /v2/things', fragment: '01-things-v2.json', scope: 'operation',
                branch: '', responseStatus: '', field: '', change: {kind: 'deprecated', key: '', before: false, after: true}, evidence: ''},
            {id: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||name|constraint|maxLength',
                category: 'upstream-modified', opKey: 'post /v2/things', fragment: '01-things-v2.json', scope: 'requestBody',
                branch: '', responseStatus: '', field: 'name', change: {kind: 'constraint', key: 'maxLength', before: 32, after: 50}, evidence: ''},
            {id: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||dryRun:query|required|',
                category: 'upstream-modified', opKey: 'delete /v2/things/{ID}', fragment: '02-singles-v2.json', scope: 'parameter',
                branch: '', responseStatus: '', field: 'dryRun:query', change: {kind: 'required', key: '', before: false, after: true}, evidence: ''},
            {id: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||zoneId:query|required|',
                category: 'upstream-modified', opKey: 'delete /v2/things/{ID}', fragment: '02-singles-v2.json', scope: 'parameter',
                branch: '', responseStatus: '', field: 'zoneId:query', change: {kind: 'required', key: '', before: true, after: false}, evidence: '',
                requiresConfirmation: 'required-relaxation'},
            {id: 'fragment-only|post /v2/legacy|02-singles-v2.json|operation|||||',
                category: 'fragment-only', opKey: 'post /v2/legacy', fragment: '02-singles-v2.json', scope: 'operation',
                branch: '', responseStatus: '', field: '', change: {kind: 'operation-absent-upstream', key: '', before: null, after: null}, evidence: ''},
        ],
    }
    const diffPath = path.join(dir, 'diff.json')
    fs.writeFileSync(diffPath, `${JSON.stringify(diff, null, 2)}\n`)
    return diffPath
}

function stubFetch(responsesByFragment) {
    const calls = []
    return {calls, fetchImpl: async (url, options) => {
        const body = JSON.parse(options.body)
        const fragmentLine = body.messages[1].content.split('\n').find(line => line.includes('"d":'))
        const fragment = fragmentLine.includes('01-things') ? '01-things-v2.json' : '02-singles-v2.json'
        calls.push({url, fragment})
        return {ok: true, status: 200, text: async () => '', json: async () => ({choices: [{message: {content: responsesByFragment[fragment]}}]})}
    }}
}

test('decide-batches merges per-fragment stances, records rejections, and writes the report', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-decide-'))
    process.env.DECIDE_TEST_KEY = 'test-key'
    try {
        const diffPath = writeDiff(dir)
        const responses = {
            '01-things-v2.json': JSON.stringify({decisions: [
                {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|operation||||deprecated|', action: 'adopt'},
                {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||name|constraint|maxLength', action: 'adopt'},
            ]}),
            '02-singles-v2.json': JSON.stringify({decisions: [
                {diffEntryId: 'upstream-modified|invented-id', action: 'adopt'},
                {diffEntryId: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||dryRun:query|required|', action: 'adopt'},
                {diffEntryId: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||dryRun:query|required|', action: 'adopt'},
                {diffEntryId: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||zoneId:query|required|', action: 'skip', reason: 'flagged relaxation; human decision pending'},
                {diffEntryId: 'fragment-only|post /v2/legacy|02-singles-v2.json|operation|||||', action: 'skip', reason: 'retirement is a human decision'},
            ]}),
        }
        const {fetchImpl, calls} = stubFetch(responses)
        const outPath = path.join(dir, 'decisions.jsonl')
        const reportPath = path.join(dir, 'report.json')
        const {summary} = await decideBatches({
            diffPath, outPath, baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'test-model',
            reportPath, fetchImpl,
        })
        assert.equal(summary.candidates, 5)
        assert.equal(summary.stances, 5)
        assert.equal(summary.rejectedLines, 2)
        assert.equal(summary.batches, 2)
        // A bare-host base URL must still land on the versioned endpoint.
        assert.ok(calls.length > 0)
        assert.ok(calls.every(call => call.url === 'https://gateway.invalid/v1/chat/completions'),
            `unexpected request URLs: ${calls.map(call => call.url).join(', ')}`)
        const decisions = fs.readFileSync(outPath, 'utf8').trim().split('\n').map(line => JSON.parse(line))
        assert.deepEqual(decisions.map(decision => decision.action), ['adopt', 'adopt', 'adopt', 'skip', 'skip'])
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
        const singles = report.batches.find(batch => batch.fragment === '02-singles-v2.json')
        // Coverage counts only stances inside the base: the flagged relaxation
        // was taken as a skip but stays out of the base, so coverage is 1/1.
        assert.equal(singles.coverage, 1)
        assert.equal(singles.attempts, 1)
        assert.equal(singles.omittableByRule, 2)
        assert.equal(singles.stanceBase, 1)
        assert.match(singles.rejected[0].reason, /invented/)
        assert.equal(singles.rejected[1].reason, 'duplicate diffEntryId in one response')
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('the decision rules never ask for prose, mirrors, or additions', () => {
    const prompt = decisionSystemPrompt()
    assert.match(prompt, /never adopt|never appears as candidates|never appear as candidates/i)
    assert.match(prompt, /Copy diffEntryId values verbatim/)
})

test('chatCompletionsUrl accepts SDK-style base URLs that already carry the /v1 prefix', () => {
    // Run 40992573983 regression: the provisioned DEEPSEEK_BASE_URL shape
    // produced https://host/v1/v1/chat/completions and every batch 404'd.
    assert.equal(chatCompletionsUrl('https://token.zasdas.com/v1'), 'https://token.zasdas.com/v1/chat/completions')
    assert.equal(chatCompletionsUrl('https://token.zasdas.com/v1/'), 'https://token.zasdas.com/v1/chat/completions')
    assert.equal(chatCompletionsUrl('https://gateway.invalid'), 'https://gateway.invalid/v1/chat/completions')
    assert.equal(chatCompletionsUrl('https://gateway.invalid/'), 'https://gateway.invalid/v1/chat/completions')
})

test('parseModelContent tolerates fences, trailing garbage, and concatenated objects', () => {
    assert.deepEqual(parseModelContent('{"decisions":[]}'), {decisions: []})
    assert.deepEqual(parseModelContent('```json\n{"decisions":[]}\n```'), {decisions: []})
    assert.deepEqual(parseModelContent('{"decisions":[]} {"stray":true} trailing'), {decisions: []})
    assert.deepEqual(parseModelContent('Sure. {"decisions":[{"diffEntryId":"a","action":"adopt"}]}'), {decisions: [{diffEntryId: 'a', action: 'adopt'}]})
    assert.throws(() => parseModelContent('no json here'), /REST_UPSTREAM_DECIDE_RESPONSE_UNPARSEABLE/)
    assert.throws(() => parseModelContent('{"decisions":'), /REST_UPSTREAM_DECIDE_RESPONSE_UNPARSEABLE/)
})

test('acceptDecisionLine rejects invented ids, contract violations, and out-of-grid stances without throwing', () => {
    const candidateIds = new Set(['upstream-modified|x'])
    const deprecatedEntry = {id: 'upstream-modified|x', category: 'upstream-modified', change: {kind: 'deprecated'}}
    const proseEntry = {id: 'upstream-modified|x', category: 'upstream-modified', change: {kind: 'description'}}
    assert.equal(acceptDecisionLine({diffEntryId: 'upstream-modified|x', action: 'adopt'}, candidateIds, new Map([['upstream-modified|x', deprecatedEntry]])).decision.action, 'adopt')
    assert.match(acceptDecisionLine({diffEntryId: 'invented', action: 'adopt'}, candidateIds, new Map([['upstream-modified|x', deprecatedEntry]])).rejected, /invented/)
    assert.match(acceptDecisionLine({diffEntryId: 'upstream-modified|x', action: 'adopt'}, candidateIds, new Map([['upstream-modified|x', proseEntry]])).rejected, /report lane/)
    assert.match(acceptDecisionLine({diffEntryId: 'upstream-modified|x', action: 'ledger'}, candidateIds, new Map([['upstream-modified|x', deprecatedEntry]])).rejected, /contract/)
    assert.match(acceptDecisionLine({diffEntryId: 'upstream-modified|x', action: 'adopt', override: true}, candidateIds, new Map([['upstream-modified|x', deprecatedEntry]])).rejected, /contract/)
    assert.equal(acceptDecisionLine('nope', candidateIds, new Map([['upstream-modified|x', deprecatedEntry]])).rejected, 'not an object')
    assert.match(acceptDecisionLine({diffEntryId: 'upstream-modified|x', action: 'ledger', classification: 'deferred', reason: 'r'}, candidateIds, new Map([['upstream-modified|x', deprecatedEntry]])).rejected, /not mechanically writable/)
})

test('batches below the coverage gate retry and then fail the run closed', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-decide-lowcov-'))
    process.env.DECIDE_TEST_KEY = 'test-key'
    try {
        const diffPath = writeDiff(dir)
        const responses = {
            '01-things-v2.json': JSON.stringify({decisions: [
                {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|operation||||deprecated|', action: 'adopt'},
                {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||name|constraint|maxLength', action: 'adopt'},
            ]}),
            '02-singles-v2.json': JSON.stringify({decisions: []}),
        }
        const {fetchImpl, calls} = stubFetch(responses)
        await assert.rejects(
            decideBatches({diffPath, outPath: path.join(dir, 'out.jsonl'), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'm', retries: 2, fetchImpl}),
            /REST_UPSTREAM_DECIDE_BATCH_FAILED: 02-singles-v2\.json after 2 attempt\(s\): stance coverage 0\.0%/,
        )
        assert.equal(calls.filter(call => call.fragment === '02-singles-v2.json').length, 2)
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('a failing retry recovers when a later attempt reaches the coverage gate', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-decide-retry-'))
    process.env.DECIDE_TEST_KEY = 'test-key'
    try {
        const diffPath = writeDiff(dir)
        const full = JSON.stringify({decisions: [
            {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|operation||||deprecated|', action: 'adopt'},
            {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||name|constraint|maxLength', action: 'adopt'},
        ]})
        let singlesCalls = 0
        const fetchImpl = async (url, options) => {
            const content = options.body.includes('02-singles-v2.json') ? (
                (singlesCalls += 1) === 1
                    ? JSON.stringify({decisions: []})
                    : JSON.stringify({decisions: [
                        {diffEntryId: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||dryRun:query|required|', action: 'adopt'},
                        {diffEntryId: 'fragment-only|post /v2/legacy|02-singles-v2.json|operation|||||', action: 'skip', reason: 'human decision'},
                    ]})
            ) : full
            return {ok: true, status: 200, text: async () => '', json: async () => ({choices: [{message: {content}}]})}
        }
        const {summary, batches} = await decideBatches({
            diffPath, outPath: path.join(dir, 'out.jsonl'), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'm', retries: 3, fetchImpl,
        })
        assert.equal(summary.stances, 4)
        const singles = batches.find(batch => batch.fragment === '02-singles-v2.json')
        assert.equal(singles.attempts, 2)
        assert.equal(singles.coverage, 1)
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('omission-only batches pass the coverage gate with an empty stance response', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-decide-rule7-'))
    process.env.DECIDE_TEST_KEY = 'test-key'
    try {
        const diff = {
            source: 'zilliz-cloud-control-plane',
            upstreamPin: 'abc',
            entries: [
                {id: 'upstream-added-field|delete /v2/x|01-things-v2.json|response||200|data|field-uncovered|',
                    category: 'upstream-added-field', opKey: 'delete /v2/x', fragment: '01-things-v2.json', scope: 'response',
                    branch: '', responseStatus: '200', field: 'data', change: {kind: 'field-uncovered', key: '', before: null, after: null}, evidence: ''},
                {id: 'fragment-only|post /v2/legacy|01-things-v2.json|operation|||||',
                    category: 'fragment-only', opKey: 'post /v2/legacy', fragment: '01-things-v2.json', scope: 'operation',
                    branch: '', responseStatus: '', field: '', change: {kind: 'operation-absent-upstream', key: '', before: null, after: null}, evidence: ''},
            ],
        }
        const diffPath = path.join(dir, 'diff.json')
        fs.writeFileSync(diffPath, `${JSON.stringify(diff, null, 2)}\n`)
        const {fetchImpl} = stubFetch({'01-things-v2.json': JSON.stringify({decisions: []})})
        const {summary, batches} = await decideBatches({
            diffPath, outPath: path.join(dir, 'out.jsonl'), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'm', fetchImpl,
        })
        // added fields are the branch-plan/auto lane and never become candidates;
        // the fragment-only retirement is an instructed omission (rule 5)
        assert.equal(summary.stances, 0)
        assert.equal(batches[0].candidates, 1)
        assert.equal(batches[0].stanceBase, 0)
        assert.equal(batches[0].omittableByRule, 1)
        assert.equal(batches[0].coverage, 1)
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('an out-of-grid stance is downgraded to a per-line rejection, not a run failure', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-decide-grid-'))
    process.env.DECIDE_TEST_KEY = 'test-key'
    try {
        const diffPath = writeDiff(dir)
        const responses = {
            '01-things-v2.json': JSON.stringify({decisions: [
                {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|operation||||deprecated|', action: 'adopt'},
                {diffEntryId: 'upstream-modified|post /v2/things|01-things-v2.json|requestBody|||name|constraint|maxLength', action: 'adopt'},
            ]}),
            '02-singles-v2.json': JSON.stringify({decisions: [
                {diffEntryId: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||dryRun:query|required|', action: 'adopt'},
                {diffEntryId: 'fragment-only|post /v2/legacy|02-singles-v2.json|operation|||||', action: 'skip', reason: 'human decision'},
                {diffEntryId: 'upstream-modified|delete /v2/things/{ID}|02-singles-v2.json|parameter|||dryRun:query|required|', action: 'ledger', classification: 'deferred', reason: 'x'},
                {diffEntryId: 'upstream-added-field|delete /v2/x|01-things-v2.json|response||200|data|field-uncovered|', action: 'adopt'},
            ]}),
        }
        const {fetchImpl} = stubFetch(responses)
        const {summary, batches} = await decideBatches({
            diffPath, outPath: path.join(dir, 'out.jsonl'), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DECIDE_TEST_KEY', model: 'm', fetchImpl,
        })
        assert.equal(summary.stances, 4)
        const singles = batches.find(batch => batch.fragment === '02-singles-v2.json')
        assert.equal(singles.rejected.length, 2)
        assert.match(singles.rejected[0].reason, /not mechanically writable: ledger drafts must cite an operation-level drift/)
        assert.match(singles.rejected[1].reason, /unknown or invented diffEntryId/)
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})

test('missing api key fails closed before any model call', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-upstream-decide-nokey-'))
    try {
        const diffPath = writeDiff(dir)
        let called = 0
        await assert.rejects(
            decideBatches({diffPath, outPath: path.join(dir, 'out.jsonl'), baseUrl: 'https://gateway.invalid', apiKeyEnv: 'DECIDE_TEST_KEY_ABSENT', model: 'm', fetchImpl: async () => {called += 1}}),
            /REST_UPSTREAM_DECIDE_API_KEY_MISSING/,
        )
        assert.equal(called, 0)
    } finally {
        fs.rmSync(dir, {recursive: true, force: true})
    }
})
