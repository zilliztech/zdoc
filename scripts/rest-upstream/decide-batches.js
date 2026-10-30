#!/usr/bin/env node
'use strict'

// Batched decision-stage caller for the decisions-first refresh pipeline
// (design: .claude/specs/2026-10-29-rest-upstream-decisions-pipeline-design.md).
// Reads a diff.json, builds the machine-generated candidate list, and asks the
// configured model for one stance per candidate — one batch per fragment. The
// model never writes structure: every response line is validated against the
// decisions contract, invented ids are rejected, duplicate ids are collapsed,
// and a batch whose stance coverage falls below --min-coverage is retried and
// then fails the run. The assembler (rest-upstream-assemble) turns the merged
// stances into the change set; the deterministic gates stay authoritative.

const fs = require('node:fs')
const path = require('node:path')

const TOOLING_ROOT = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest')
const {buildCandidateRecords} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'candidates'))
const {decisionShapeError, stanceError} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'assembler'))

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_RETRIES = 3
const DEFAULT_MIN_COVERAGE = 0.5

function usage() {
    return 'Usage: node scripts/rest-upstream/decide-batches.js --diff <path> --out <decisions.jsonl> --base-url <url> --api-key-env <NAME> --model <id> [--report <path>] [--min-coverage 0.5] [--timeout-ms 300000] [--retries 3]'
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

// Decision rules for the stance-only stage. Structure is never requested:
// loci and values are derived downstream from the diff itself.
function decisionSystemPrompt() {
    return [
        'You are the REST documentation refresh decision stage. For every candidate drift entry you take at most one stance. You never write paths, values, or any structure: the pipeline derives them deterministically from the drift itself.',
        'Output strict JSON only: {"decisions":[...]} where each element is exactly one of',
        '{"diffEntryId":"<the candidate id copied verbatim>","action":"adopt"}',
        '{"diffEntryId":"<id>","action":"skip","reason":"<short why>"}',
        '{"diffEntryId":"<id>","action":"ledger","classification":"adopted|rejected|deferred|external","reason":"<short why>"}',
        'Candidates you omit entirely count as skip-for-human-review, so only emit lines you are confident about.',
        'Rules:',
        '1. upstream-modified with change=description or summary: adopt.',
        '2. upstream-modified with scalar constraints (type, format, enum, minimum/maximum and exclusive forms, minLength/maxLength, minItems/maxItems, pattern, default, nullable): adopt.',
        '3. upstream-modified with change=deprecated: adopt.',
        '4. upstream-modified with change=required and after=true (upstream now requires the field): adopt.',
        '5. upstream-modified with change=required and after=false (upstream relaxed the field): omit whenever the summary shows requiresConfirmation=required-relaxation; otherwise adopt only when unambiguous.',
        '6. unattributed or upstream-added (operation-level attribution or new operations): emit a ledger proposal, classification deferred, reason naming the operation and field. Never adopt.',
        '7. upstream-added-field or upstream-added-param, and fragment-only operations: omit — field attribution and retirement are human content decisions. Never adopt, never ledger.',
        '8. Copy diffEntryId values verbatim. Never invent, shorten, or reformat an id.',
    ].join('\n')
}

// Tolerant response parsing: json_object providers occasionally append a second
// object or commentary. Take the first balanced JSON object and parse it.
function parseModelContent(content) {
    if (typeof content !== 'string') fail('REST_UPSTREAM_DECIDE_RESPONSE_EMPTY')
    let text = content.trim()
    const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
    if (fence) text = fence[1].trim()
    try {
        return JSON.parse(text)
    } catch { /* fall through to balanced-object scan */ }
    const start = text.indexOf('{')
    if (start < 0) fail(`REST_UPSTREAM_DECIDE_RESPONSE_UNPARSEABLE: no JSON object in: ${content.slice(0, 200)}`)
    let depth = 0
    let inString = false
    let escaped = false
    for (let index = start; index < text.length; index++) {
        const character = text[index]
        if (inString) {
            if (escaped) escaped = false
            else if (character === '\\') escaped = true
            else if (character === '"') inString = false
            continue
        }
        if (character === '"') inString = true
        else if (character === '{') depth += 1
        else if (character === '}') {
            depth -= 1
            if (depth === 0) {
                try {
                    return JSON.parse(text.slice(start, index + 1))
                } catch (error) {
                    fail(`REST_UPSTREAM_DECIDE_RESPONSE_UNPARSEABLE: ${error.message}`)
                }
            }
        }
    }
    fail(`REST_UPSTREAM_DECIDE_RESPONSE_UNPARSEABLE: unbalanced JSON in: ${content.slice(0, 200)}`)
}

// Post-validation of one model stance line. Returns {decision} when the line is
// a usable stance for this batch, or {rejected, reason} — a bad line never
// fails the batch on its own; the coverage gate and the assembler judge.
// Assemblability (the diff-only subset of the assembler's gates) rejects the
// line here too, so one out-of-grid stance cannot discard every other stance
// with the run.
function acceptDecisionLine(line, candidateIds, entryById) {
    if (!line || typeof line !== 'object' || Array.isArray(line)) return {rejected: 'not an object'}
    if (typeof line.diffEntryId !== 'string' || !candidateIds.has(line.diffEntryId)) return {rejected: `unknown or invented diffEntryId: ${JSON.stringify(line.diffEntryId)}`}
    const shapeError = decisionShapeError(line)
    if (shapeError) return {rejected: `contract: ${shapeError}`}
    const assemblabilityError = stanceError(line, entryById.get(line.diffEntryId))
    if (assemblabilityError) return {rejected: `not mechanically writable: ${assemblabilityError}`}
    return {decision: line}
}

async function callModel({candidates, baseUrl, apiKey, model, timeoutMs, fetchImpl}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
            method: 'POST',
            headers: {'content-type': 'application/json', authorization: `Bearer ${apiKey}`},
            body: JSON.stringify({
                model,
                temperature: 0,
                response_format: {type: 'json_object'},
                messages: [
                    {role: 'system', content: decisionSystemPrompt()},
                    {role: 'user', content: `Take stances on these ${candidates.length} candidates. Each line is a JSON object: field "d" is the id to copy verbatim, field "c" is the drift summary.\n\n${candidates.map(line => JSON.stringify(line)).join('\n')}`},
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

async function decideBatches({diffPath, outPath, baseUrl, apiKeyEnv, model, reportPath = null, minCoverage = DEFAULT_MIN_COVERAGE, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, fetchImpl = globalThis.fetch}) {
    if (!diffPath || !outPath || !baseUrl || !apiKeyEnv || !model) fail(usage())
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) fail(`REST_UPSTREAM_DECIDE_API_KEY_MISSING: --api-key-env ${apiKeyEnv} is not set`)
    const diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'))
    const entryById = new Map(diff.entries.map(entry => [entry.id, entry]))
    const fragments = [...new Set(diff.entries.map(entry => entry.fragment).filter(Boolean))].sort()
    const batches = []
    const accepted = []
    for (const fragment of fragments) {
        const records = buildCandidateRecords(diff, {fragmentFilter: fragment})
        if (records.length === 0) continue
        const candidates = records.map(record => ({d: record.d, c: record.c}))
        const candidateIds = new Set(candidates.map(line => line.d))
        // The coverage base counts only the candidates the decision rules
        // expect a stance for: flagged relaxations are instructed omissions
        // (rule 5), and the rule-7 field/retirement classes are never stance
        // targets. Gating on instructed omissions would punish exactly the
        // compliance the rules demand.
        const stanceBaseIds = new Set(records.filter(record => record.stanceExpected).map(record => record.d))
        const coverageBase = stanceBaseIds.size
        const omittableCount = records.length - coverageBase
        const rejected = []
        const stances = []
        let attempts = 0
        let coverage = 0
        let lastError = null
        while (attempts < retries) {
            attempts += 1
            let content
            try {
                content = await callModel({candidates, baseUrl, apiKey, model, timeoutMs, fetchImpl})
            } catch (error) {
                lastError = `call failed: ${error.message}`
                continue
            }
            let parsed
            try {
                parsed = parseModelContent(content)
                if (!parsed || !Array.isArray(parsed.decisions)) throw new Error('response has no decisions array')
            } catch (error) {
                lastError = error.message
                continue
            }
            const seen = new Set()
            stances.length = 0
            rejected.length = 0
            for (const line of parsed.decisions) {
                const verdict = acceptDecisionLine(line, candidateIds, entryById)
                if (verdict.rejected) {
                    rejected.push({line, reason: verdict.rejected})
                } else if (seen.has(verdict.decision.diffEntryId)) {
                    rejected.push({line, reason: 'duplicate diffEntryId in one response'})
                } else {
                    seen.add(verdict.decision.diffEntryId)
                    stances.push(verdict.decision)
                }
            }
            // Only stances inside the base prove coverage; a stance on an
            // instructed-omission line must not mask omitted base candidates.
            const baseStances = stances.filter(stance => stanceBaseIds.has(stance.diffEntryId)).length
            coverage = coverageBase === 0 ? 1 : baseStances / coverageBase
            if (coverage >= minCoverage) break
            lastError = `stance coverage ${(coverage * 100).toFixed(1)}% < ${(minCoverage * 100).toFixed(1)}% (${baseStances}/${coverageBase})`
        }
        if (coverage < minCoverage) {
            fail(`REST_UPSTREAM_DECIDE_BATCH_FAILED: ${fragment} after ${attempts} attempt(s): ${lastError}`)
        }
        accepted.push(...stances)
        batches.push({fragment, candidates: candidates.length, omittableByRule: omittableCount, stanceBase: coverageBase, stances: stances.length, coverage, attempts, rejected})
    }
    fs.mkdirSync(path.dirname(path.resolve(outPath)), {recursive: true})
    fs.writeFileSync(outPath, `${accepted.map(decision => JSON.stringify(decision)).join('\n')}\n`)
    const summary = {
        candidates: batches.reduce((total, batch) => total + batch.candidates, 0),
        stances: accepted.length,
        rejectedLines: batches.reduce((total, batch) => total + batch.rejected.length, 0),
        batches: batches.length,
    }
    if (reportPath) {
        fs.mkdirSync(path.dirname(path.resolve(reportPath)), {recursive: true})
        fs.writeFileSync(reportPath, `${JSON.stringify({source: diff.source, upstreamPin: diff.upstreamPin, model, summary, batches}, null, 2)}\n`)
    }
    console.log(`decided ${summary.stances}/${summary.candidates} candidate(s) across ${summary.batches} batch(es); ${summary.rejectedLines} rejected line(s) -> ${outPath}`)
    return {summary, batches}
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    await decideBatches({
        diffPath: args.get('diff'),
        outPath: args.get('out'),
        baseUrl: args.get('base-url'),
        apiKeyEnv: args.get('api-key-env'),
        model: args.get('model'),
        reportPath: args.get('report'),
        minCoverage: args.has('min-coverage') ? Number(args.get('min-coverage')) : DEFAULT_MIN_COVERAGE,
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

module.exports = {decideBatches, parseModelContent, acceptDecisionLine, decisionSystemPrompt, DEFAULT_MIN_COVERAGE}
