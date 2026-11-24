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
const {buildCandidateRecords, UNFRAGMENTED_OPERATIONS_BUCKET} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'candidates'))
const {decisionShapeError, stanceError} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'assembler'))
const {applicableAdjudications, canonicalKey, loadRestUpstreamAdjudications} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'adjudications'))

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_RETRIES = 3
const DEFAULT_MIN_COVERAGE = 0.5

function usage() {
    return 'Usage: node scripts/rest-upstream/decide-batches.js --diff <path> --out <decisions.jsonl> --base-url <url> --api-key-env <NAME> --model <id> [--adjudications <path>] [--report <path>] [--min-coverage 0.5] [--timeout-ms 300000] [--retries 3]'
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

// Decision rules for the stance-only stage (2026-10-30 merge model). Structure
// is never requested: loci and values are derived downstream from the diff
// itself. Prose, field mirrors, and added fields/params never appear as
// candidates at all — structure follows upstream automatically, the fragments
// keep their own text, and branch placement of new fields runs in its own
// stage — so the model judges semantics only.
function decisionSystemPrompt() {
    return [
        'You are the REST documentation refresh decision stage. For every candidate drift entry you take at most one stance. You never write paths, values, or any structure: the pipeline derives them deterministically from the drift itself.',
        'Output strict JSON only: {"decisions":[...]} where each element is exactly one of',
        '{"diffEntryId":"<the candidate id copied verbatim>","action":"adopt"}',
        '{"diffEntryId":"<id>","action":"skip","reason":"<short why>"}',
        '{"diffEntryId":"<id>","action":"ledger","classification":"adopted|rejected|deferred|external","reason":"<short why>"}',
        'Candidates you omit entirely count as skip-for-human-review, so only emit lines you are confident about.',
        'Rules:',
        '1. upstream-modified with change=deprecated (operation-level deprecation flip): adopt.',
        '2. upstream-modified with change=required and after=true (upstream now requires the parameter): adopt.',
        '3. upstream-modified with change=required and after=false (upstream relaxed the parameter): omit whenever the summary shows requiresConfirmation=required-relaxation; otherwise adopt only when unambiguous.',
        '4. upstream-added (new operations) and unattributed (unplaced fields on scenario-branched bodies): emit a ledger proposal, classification deferred, reason naming the operation and field. Never adopt.',
        '5. fragment-only operations (retirement candidates): omit — retirement is a human content decision. Never adopt, never ledger.',
        '6. Description, summary, schema-mirror, and added-field/param drift never appear as candidates: prose stays local, structure follows upstream, and new fields are placed by a separate stage. If you believe upstream prose is materially better, note it in a skip reason.',
        '7. Copy diffEntryId values verbatim. Never invent, shorten, or reformat an id.',
        '8. A candidate line whose summary carries "|| prior adjudication(s) <key> — facts: …" records settled field-level facts from an earlier human adjudication. Align your stance with those facts: emit {"diffEntryId":"<id>","action":"adopt","adjudication":"<one key copied verbatim from the annotation>"}. To contradict a recorded fact you must carry the same "adjudication" key plus "deviationReason":"<why the facts no longer hold>". An annotation marked STALE means the upstream moved: never align with stale facts — skip with your reasoning or deviate explicitly, and never cite the stale key.',
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
// with the run. applicableById carries the per-entry prior-adjudication
// verdicts (fresh keys, stale entries): an adopt/ledger stance on a governed
// entry must cite a fresh key — the same rule the assembler enforces later,
// applied per line so one uncited stance cannot sink the whole batch.
function acceptDecisionLine(line, candidateIds, entryById, applicableById = null) {
    if (!line || typeof line !== 'object' || Array.isArray(line)) return {rejected: 'not an object'}
    if (typeof line.diffEntryId !== 'string' || !candidateIds.has(line.diffEntryId)) return {rejected: `unknown or invented diffEntryId: ${JSON.stringify(line.diffEntryId)}`}
    const shapeError = decisionShapeError(line)
    if (shapeError) return {rejected: `contract: ${shapeError}`}
    const assemblabilityError = stanceError(line, entryById.get(line.diffEntryId))
    if (assemblabilityError) return {rejected: `not mechanically writable: ${assemblabilityError}`}
    const applicable = applicableById?.get(line.diffEntryId)
    if (line.deviationReason !== undefined && line.adjudication === undefined) return {rejected: 'deviationReason requires adjudication'}
    if (line.adjudication !== undefined && (!applicable || !applicable.keys.has(line.adjudication))) {
        return {rejected: `unknown, stale, or non-applicable adjudication key: ${JSON.stringify(line.adjudication)}`}
    }
    if (applicable && applicable.keys.size > 0 && ['adopt', 'ledger'].includes(line.action) && line.adjudication === undefined) {
        return {rejected: `prior adjudication(s) ${[...applicable.keys].join(', ')} govern this entry; cite one via "adjudication" or omit the line for human review`}
    }
    return {decision: line}
}

// The provisioned gateway vars (DEEPSEEK_BASE_URL and friends) follow the
// OpenAI SDK convention where the base URL already carries the /v1 prefix;
// accept both shapes so this never POSTs to a doubled /v1/v1 path again.
function chatCompletionsUrl(baseUrl) {
    return `${baseUrl.replace(/\/+$/, '').replace(/\/v1$/, '')}/v1/chat/completions`
}

async function callModel({candidates, baseUrl, apiKey, model, timeoutMs, fetchImpl}) {
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

// The in-prompt carrier of prior adjudications (2026-11-23 design, 2026-11-25
// review conditions 1/2/4): the annotation restates the settled facts and the
// canonical key the stance must cite, and flags STALE entries so the model
// never aligns with facts the current upstream payload no longer confirms.
function candidateAdjudicationAnnotation(applicable) {
    if (!applicable) return ''
    const parts = []
    if (applicable.fresh.length > 0) {
        parts.push(`|| prior adjudication(s) ${applicable.fresh.map(entry => canonicalKey(entry)).join(' + ')} — facts: ${applicable.fresh.flatMap(entry => entry.facts).join(' ')} (evidence: PR #${applicable.fresh[0].evidence.pr}, decided ${applicable.fresh[0].decidedAt}); align and cite one key via "adjudication"`)
    }
    if (applicable.stale.length > 0) {
        parts.push(`|| prior adjudication(s) ${applicable.stale.map(entry => canonicalKey(entry)).join(' + ')} STALE this round — the recorded literals no longer hold in the upstream payload; re-adjudicate and never cite the stale key`)
    }
    return parts.length ? ` ${parts.join(' ')}` : ''
}

async function decideBatches({diffPath, outPath, baseUrl, apiKeyEnv, model, reportPath = null, adjudicationsPath = null, minCoverage = DEFAULT_MIN_COVERAGE, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, fetchImpl = globalThis.fetch}) {
    if (!diffPath || !outPath || !baseUrl || !apiKeyEnv || !model) fail(usage())
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) fail(`REST_UPSTREAM_DECIDE_API_KEY_MISSING: --api-key-env ${apiKeyEnv} is not set`)
    const diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'))
    const entryById = new Map(diff.entries.map(entry => [entry.id, entry]))
    // Prior semantic adjudications (meta/upstream/adjudications.json, staged as
    // meta/adjudications.json): absent file keeps every consumer inert; a
    // present-but-broken file fails closed here, before any paid turn.
    const adjudications = adjudicationsPath ? loadRestUpstreamAdjudications(adjudicationsPath) : null
    // Fragment-less entries (operation-level upstream-added operations) must
    // not vanish from the decision stage: they group into the synthetic
    // operations bucket, and a pending upstream-added operation without a
    // stance would fail the T4 accounting gate later anyway.
    const fragments = [...new Set(diff.entries.map(entry => entry.fragment ?? UNFRAGMENTED_OPERATIONS_BUCKET))].sort()
    const batches = []
    const accepted = []
    for (const fragment of fragments) {
        const records = buildCandidateRecords(diff, {fragmentFilter: fragment})
        if (records.length === 0) continue
        const applicableById = new Map(records.map(record => {
            const entry = entryById.get(record.d)
            return [record.d, adjudications && entry ? applicableAdjudications(adjudications, diff.source, entry) : null]
        }))
        const candidates = records.map(record => ({d: record.d, c: record.c + candidateAdjudicationAnnotation(applicableById.get(record.d))}))
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
                const verdict = acceptDecisionLine(line, candidateIds, entryById, applicableById)
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
        const staleKeys = new Set()
        for (const applicable of applicableById.values()) {
            for (const entry of applicable?.stale ?? []) staleKeys.add(canonicalKey(entry))
        }
        batches.push({fragment, candidates: candidates.length, omittableByRule: omittableCount, stanceBase: coverageBase, stances: stances.length, coverage, attempts, rejected,
            adjudications: {
                applied: stances.filter(stance => stance.adjudication !== undefined && stance.deviationReason === undefined).length,
                deviated: stances.filter(stance => stance.deviationReason !== undefined).length,
                stale: [...staleKeys].sort(),
            }})
    }
    fs.mkdirSync(path.dirname(path.resolve(outPath)), {recursive: true})
    fs.writeFileSync(outPath, `${accepted.map(decision => JSON.stringify(decision)).join('\n')}\n`)
    const summary = {
        candidates: batches.reduce((total, batch) => total + batch.candidates, 0),
        stances: accepted.length,
        rejectedLines: batches.reduce((total, batch) => total + batch.rejected.length, 0),
        batches: batches.length,
        adjudications: {
            applied: batches.reduce((total, batch) => total + batch.adjudications.applied, 0),
            deviated: batches.reduce((total, batch) => total + batch.adjudications.deviated, 0),
            stale: [...new Set(batches.flatMap(batch => batch.adjudications.stale))].sort(),
        },
    }
    if (reportPath) {
        fs.mkdirSync(path.dirname(path.resolve(reportPath)), {recursive: true})
        fs.writeFileSync(reportPath, `${JSON.stringify({source: diff.source, upstreamPin: diff.upstreamPin, model, summary, batches}, null, 2)}\n`)
    }
    console.log(`decided ${summary.stances}/${summary.candidates} candidate(s) across ${summary.batches} batch(es); ${summary.rejectedLines} rejected line(s); adjudications ${summary.adjudications.applied} aligned / ${summary.adjudications.deviated} deviated / ${summary.adjudications.stale.length} stale -> ${outPath}`)
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
        adjudicationsPath: args.get('adjudications') ?? null,
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

module.exports = {decideBatches, parseModelContent, acceptDecisionLine, decisionSystemPrompt, chatCompletionsUrl, parseArgs, candidateAdjudicationAnnotation, DEFAULT_MIN_COVERAGE}
