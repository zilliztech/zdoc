#!/usr/bin/env node
'use strict'

// Branch-placement stage caller for the 2026-10-30 merge model. Reads the
// diff, builds one placement record per newly added upstream field on a
// scenario-branched fragment schema, and asks the configured model which
// existing tab(s) receive each field. The model only names branches from a
// closed set: invented ids and unknown branch labels are rejected per line,
// and an omitted placement simply degrades to the human-review list. The
// assembler turns validated placements into deterministic additions whose
// structure bytes come from the diff's own upstream subtrees.

const fs = require('node:fs')
const path = require('node:path')

const TOOLING_ROOT = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest')
const {buildPlacementRecords, parseBranchPlan, validatePlacements} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'branchPlan'))
const {chatCompletionsUrl, parseModelContent} = require('./decide-batches')

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_RETRIES = 3

function usage() {
    return 'Usage: node scripts/rest-upstream/branch-plan.js --diff <path> --fragments <dir> --out <branch-plan.json> --base-url <url> --api-key-env <NAME> --model <id> [--report <path>] [--timeout-ms 300000] [--retries 3]'
}

function fail(message) {
    throw new Error(message)
}

function parseArgs(argv) {
    const args = new Map()
    let index = 0
    while (index < argv.length) {
        const key = argv[index]
        const next = argv[index + 1]
        if (!key.startsWith('--')) fail(usage())
        if (next === undefined || next.startsWith('--')) {
            args.set(key.slice(2), 'true')
            index += 1
        } else {
            args.set(key.slice(2), next)
            index += 2
        }
    }
    return args
}

function branchPlanPrompt() {
    return [
        'You are the REST documentation branch-placement stage. Scenario oneOf/anyOf tabs are documentation assets: when the upstream API grows a field on a request/response body that the docs render as scenario tabs, you decide which existing tab(s) document the new field.',
        'Output strict JSON only: {"placements":[...],"reorganizations":[]}',
        'Each placement is exactly {"diffEntryId":"<the record id copied verbatim>","targets":["<branch label from the record\'s branchLabels>"],"reason":"<short why>"}.',
        'reorganizations may propose branch splits/relabels as {"opKey":"...","scope":"requestBody|response","action":"split|relabel|merge|note","reason":"...","branches":[{"xTabLabel":"...","fields":["..."]}]} — proposals only; the pipeline never executes them.',
        'Rules:',
        '1. Copy diffEntryId values verbatim. Never invent, shorten, or reformat an id.',
        '2. targets must be branch labels copied from that record\'s branchLabels — never new names.',
        '3. Place the field in every tab whose scenario genuinely exhibits it; do not spread it into tabs that do not. A field shared by all scenarios belongs in all of them.',
        '4. Judge by the branch field lists, the upstream field name, and the upstream description. Volume/Serving vs On-demand, storage backends, and pipeline kinds are distinct scenarios.',
        '5. Omit a record entirely when genuinely unsure — omissions become human-review items, wrong placements ship wrong docs.',
    ].join('\n')
}

async function callModel({records, baseUrl, apiKey, model, timeoutMs, fetchImpl}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetchImpl(chatCompletionsUrl(baseUrl), {
            method: 'POST',
            headers: {'content-type': 'application/json', authorization: `Bearer ${apiKey}`},
            body: JSON.stringify({
                model,
                temperature: 0,
                response_format: {type: 'json_object'},
                messages: [
                    {role: 'system', content: branchPlanPrompt()},
                    {role: 'user', content: `Place these ${records.length} upstream field(s) into the existing scenario tabs. Each record is a JSON object: "diffEntryId" is the id to copy verbatim, "branchLabels" is the closed set of allowed targets, "branchFields" lists what each tab already documents, "field" and "upstreamDescription" describe the new field.\n\n${records.map(record => JSON.stringify(record)).join('\n')}`},
                ],
            }),
            signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)
        const body = await response.json()
        return body.choices?.[0]?.message?.content
    } finally {
        clearTimeout(timer)
    }
}

async function planBranches({diffPath, fragmentsDir, outPath, baseUrl, apiKeyEnv, model, reportPath = null, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, fetchImpl = globalThis.fetch}) {
    if (!diffPath || !fragmentsDir || !outPath || !baseUrl || !apiKeyEnv || !model) fail(usage())
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) fail(`REST_UPSTREAM_BRANCH_PLAN_API_KEY_MISSING: --api-key-env ${apiKeyEnv} is not set`)
    const diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'))
    const fragmentCache = new Map()
    const fragmentLoader = fileName => {
        if (!fragmentCache.has(fileName)) {
            const filePath = path.join(fragmentsDir, fileName)
            if (!fs.existsSync(filePath)) fail(`REST_UPSTREAM_BRANCH_PLAN_FRAGMENT_MISSING: ${filePath}`)
            fragmentCache.set(fileName, JSON.parse(fs.readFileSync(filePath, 'utf8')))
        }
        return fragmentCache.get(fileName)
    }
    const records = buildPlacementRecords(diff, fragmentLoader)
    if (records.length === 0) {
        const empty = {placements: [], reorganizations: []}
        fs.mkdirSync(path.dirname(path.resolve(outPath)), {recursive: true})
        fs.writeFileSync(outPath, `${JSON.stringify(empty, null, 2)}\n`)
        if (reportPath) fs.writeFileSync(reportPath, `${JSON.stringify({source: diff.source, upstreamPin: diff.upstreamPin, model, records: 0, placements: 0, rejected: []}, null, 2)}\n`)
        console.log('branch-plan: no placement-needing fields -> empty plan')
        return {records: 0, placements: 0, rejected: []}
    }
    let lastError = null
    let validated = null
    let attempts = 0
    while (attempts < retries) {
        attempts += 1
        let content
        try {
            content = await callModel({records, baseUrl, apiKey, model, timeoutMs, fetchImpl})
        } catch (error) {
            lastError = `call failed: ${error.message}`
            continue
        }
        let parsed
        try {
            parsed = parseModelContent(content)
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('response is not a JSON object')
            parseBranchPlan(JSON.stringify(parsed))
        } catch (error) {
            lastError = error.message
            continue
        }
        validated = validatePlacements(parsed, records)
        // Retry while coverage is implausibly low; omissions are legal (they
        // degrade to human review) but a near-empty response is model failure.
        if (validated.placements.size >= Math.ceil(records.length / 2)) break
        lastError = `placement coverage ${validated.placements.size}/${records.length} below half`
    }
    if (!validated) fail(`REST_UPSTREAM_BRANCH_PLAN_FAILED: ${lastError}`)
    const plan = {
        placements: [...validated.placements.entries()].map(([diffEntryId, targets]) => ({diffEntryId, targets})),
        reorganizations: [],
    }
    fs.mkdirSync(path.dirname(path.resolve(outPath)), {recursive: true})
    fs.writeFileSync(outPath, `${JSON.stringify(plan, null, 2)}\n`)
    if (reportPath) {
        fs.writeFileSync(reportPath, `${JSON.stringify({source: diff.source, upstreamPin: diff.upstreamPin, model, records: records.length, placements: validated.placements.size, rejected: validated.rejected}, null, 2)}\n`)
    }
    console.log(`branch-plan: placed ${validated.placements.size}/${records.length} field(s); ${validated.rejected.length} rejected line(s) -> ${outPath}`)
    return {records: records.length, placements: validated.placements.size, rejected: validated.rejected}
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    await planBranches({
        diffPath: args.get('diff'),
        fragmentsDir: args.get('fragments'),
        outPath: args.get('out'),
        baseUrl: args.get('base-url'),
        apiKeyEnv: args.get('api-key-env'),
        model: args.get('model'),
        reportPath: args.get('report'),
        timeoutMs: args.has('timeout-ms') ? Number(args.get('timeout-ms')) : DEFAULT_TIMEOUT_MS,
        retries: args.has('retries') ? Number(args.get('retries')) : DEFAULT_RETRIES,
    })
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message)
        process.exit(1)
    })
}

module.exports = {planBranches, branchPlanPrompt, parseArgs}
