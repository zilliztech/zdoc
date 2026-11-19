#!/usr/bin/env node
'use strict'

// Advisory decide stage for the shared-docs manual update lane. The lane has already
// excluded every unadjudicated upstream addition and staged a deferred ledger entry for
// it, so this stage NEVER changes what publishes: it drafts one proposal per pending
// page (adopt / exclude / defer, plus an optional page-metadata draft) for the PR body
// and the ledger. Everything is advisory by contract: a missing API key, a gateway
// failure, or an unjudged page simply degrade to "no proposal" — the human decision is
// the default anyway. Only wiring errors (bad arguments, unreadable lane report) fail
// the run, and per-line contract gates reject invented files, unknown actions, and
// metadata drafts that the real manual-config validator refuses.

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { chatCompletionsUrl, parseModelContent, parseArgs } = require('../rest-upstream/decide-batches')

const REPOSITORY_ROOT = path.resolve(__dirname, '..', '..')
const { loadTypeScript } = require(path.join(REPOSITORY_ROOT, 'scripts', 'lib', 'load-typescript'))
const { parseManualConfig, PAGE_METADATA_FIELDS } = loadTypeScript(path.join(REPOSITORY_ROOT, 'packages', 'docs-tooling', 'src', 'shared-docs', 'core', 'manual-config.ts'))
const { DOC_HEADING_TAGS } = loadTypeScript(path.join(REPOSITORY_ROOT, 'packages', 'docs-ui', 'src', 'shared', 'utils', 'docHeadingTags.ts'))

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_RETRIES = 3
// One batch holds the whole pending set; the cap only bounds a pathological upstream
// drop so one run cannot spend unbounded tokens. Files beyond the cap degrade.
const MAX_FILES_PER_CALL = 40
const CONTENT_HEAD_CHARS = 4000
const ACTIONS = ['adopt', 'exclude', 'defer']

function usage() {
    return 'Usage: node scripts/docs-workflow/shared-docs-manual-decide.js --lane-report <out/report.json> --shared-docs <dir> --repo <upstream-clone> --out <proposals.jsonl> --report <decide-report.json> --base-url <url> --api-key-env <NAME> --model <id> [--timeout-ms 300000] [--retries 3]'
}

function fail(message) {
    throw new Error(message)
}

function decideSystemPrompt() {
    return [
        'You are the shared-docs manual update advisory stage. Upstream added new SDK reference pages; the pipeline has already excluded every pending page, so nothing you propose changes what publishes. A human reads the ledger and decides.',
        'For every pending page output exactly one proposal object. Output strict JSON only: {"proposals":[...]} where each element is exactly one of',
        '{"file":"<the page path copied verbatim>","action":"adopt","reason":"<short why>","metadata_draft":{...}}',
        '{"file":"<path>","action":"exclude","reason":"<short why>"}',
        '{"file":"<path>","action":"defer","reason":"<short why>"}',
        'Action rules:',
        '1. adopt: the page documents a public API that cloud users need as a standalone reference page. An adopt proposal must carry a metadata_draft.',
        '2. exclude: the page is internal or meta content (About pages, type/enum tables) that should stay out of the manual.',
        '3. defer: you cannot judge confidently. Omitting a page entirely also degrades to human review, so omit rather than guess.',
        'metadata_draft rules (fields are validated by the real schema validator afterwards):',
        'a. description: one English sentence grounded ONLY in the page content, at most 200 characters. Never invent parameters, behavior, or guarantees.',
        'b. keywords: 3 to 8 short search terms.',
        'c. sidebar_position: an integer placing the page near its module peers.',
        'd. beta: only when the page itself clearly presents a preview capability.',
        'e. added_since/last_modified: only when the page states a version.',
        'Copy file values verbatim. Never invent, shorten, or reformat a file path.',
    ].join('\n')
}

// Validate one accepted proposal line against the real manual-config rules by parsing a
// synthetic config that carries only the draft. JSON is a YAML subset, which is how the
// engine itself builds synthetic page configs.
function validateMetadataDraft(file, draft, context, sourceDir, manual) {
    const config = { schema_version: 1, source: { dir: sourceDir }, publish: { manual }, metadata: { [file]: draft } }
    const parsed = parseManualConfig(JSON.stringify(config), context)
    if ('errors' in parsed) return parsed.errors.map(error => `${error.code}: ${error.message}`).join('; ')
    return undefined
}

// Post-validation of one model proposal line. Returns {proposal} or {rejected, reason} —
// a bad line never fails the run on its own; it only degrades that page to human review.
function acceptProposalLine(line, pendingSet, context, sourceDir, manual) {
    if (!line || typeof line !== 'object' || Array.isArray(line)) return { rejected: 'not an object' }
    if (typeof line.file !== 'string' || !pendingSet.has(line.file)) return { rejected: `unknown or invented file: ${JSON.stringify(line.file)}` }
    if (!ACTIONS.includes(line.action)) return { rejected: `action must be one of ${ACTIONS.join(', ')}` }
    if (typeof line.reason !== 'string' || !line.reason.trim()) return { rejected: 'reason must be a nonempty string' }
    const proposal = { file: line.file, action: line.action, reason: line.reason.trim().slice(0, 500) }
    if ('metadata_draft' in line && line.metadata_draft !== undefined) {
        const draft = line.metadata_draft
        if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return { rejected: 'metadata_draft must be an object' }
        const unknownFields = Object.keys(draft).filter(field => !PAGE_METADATA_FIELDS.includes(field))
        if (unknownFields.length) return { rejected: `metadata_draft has unknown field(s): ${unknownFields.join(', ')}` }
        const draftError = validateMetadataDraft(line.file, draft, context, sourceDir, manual)
        if (draftError) return { rejected: `metadata_draft rejected by the schema validator: ${draftError}` }
        proposal.metadata_draft = draft
    } else if (line.action === 'adopt') {
        return { rejected: 'adopt proposals must carry a metadata_draft' }
    }
    return { proposal }
}

async function callModel({ files, baseUrl, apiKey, model, timeoutMs, fetchImpl, metadataExample }) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const example = metadataExample ? `Example of an existing entry's style:\n${JSON.stringify({ file: metadataExample.file, metadata: metadataExample.fields })}` : 'No existing metadata entry is available.'
    try {
        const response = await fetchImpl(chatCompletionsUrl(baseUrl), {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model,
                temperature: 0,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: decideSystemPrompt() },
                    { role: 'user', content: `Draft at most one proposal per pending page. Each page block carries its upstream content head.\n\n${example}\n\n${files.map(entry => `### ${entry.file}\n${entry.content}`).join('\n\n')}` },
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

function readUpstreamHead(repoPath, sourceDir, commit, file) {
    try {
        const bytes = execFileSync('git', ['-C', repoPath, 'show', `${commit}:${sourceDir}/${file}`], { maxBuffer: 8 * 1024 * 1024 })
        const text = bytes.toString('utf8')
        return text.length > CONTENT_HEAD_CHARS ? `${text.slice(0, CONTENT_HEAD_CHARS)}\n…[truncated]` : text
    } catch {
        return undefined
    }
}

async function decideManualAdditions({ laneReportPath, sharedDocsPath, repoPath, outPath, reportPath, baseUrl, apiKeyEnv, model, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, fetchImpl = globalThis.fetch }) {
    if (!laneReportPath || !sharedDocsPath || !repoPath || !outPath || !reportPath || !baseUrl || !apiKeyEnv || !model) fail(usage())
    const laneReport = JSON.parse(fs.readFileSync(laneReportPath, 'utf8'))
    if (laneReport.kind !== 'shared-manual-update') fail(`lane report kind mismatch: ${laneReport.kind}`)
    if (laneReport.blocked || laneReport.upToDate || !(laneReport.addedPending ?? []).length) {
        const summary = { pending: 0, proposed: 0, rejectedLines: 0, missingContent: 0, degraded: false, reason: 'no pending additions' }
        fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true })
        fs.writeFileSync(reportPath, `${JSON.stringify({ model, summary, batches: [] }, null, 2)}\n`)
        return { summary, batches: [] }
    }
    const pending = laneReport.addedPending
    const manualText = fs.readFileSync(path.join(sharedDocsPath, 'manual.yaml'), 'utf8')
    const betaValues = DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC')
    const context = { manuals: [laneReport.manual], betaValues }
    const parsedManual = parseManualConfig(manualText, context)
    if ('errors' in parsedManual) fail(`group manual.yaml does not parse: ${parsedManual.errors.map(error => error.message).join('; ')}`)
    const sourceDir = parsedManual.config.source.dir

    const writeReport = summary => {
        fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true })
        fs.writeFileSync(reportPath, `${JSON.stringify({ model, summary, batches: summary.batches ?? [] }, null, 2)}\n`)
    }
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) {
        // Advisory stage: a missing credential degrades the run instead of failing it.
        const summary = { pending: pending.length, proposed: 0, rejectedLines: 0, missingContent: 0, degraded: true, reason: `--api-key-env ${apiKeyEnv} is not set` }
        writeReport(summary)
        return { summary, batches: [] }
    }

    const files = pending.map(file => ({ file, content: readUpstreamHead(repoPath, sourceDir, laneReport.to, file) ?? '' }))
    const missingContent = files.filter(entry => !entry.content).length
    const callable = files.filter(entry => entry.content)
    const batches = []
    const accepted = []
    const rejected = []
    const seen = new Set()
    let lastError = null
    for (let start = 0; start < callable.length; start += MAX_FILES_PER_CALL) {
        const batch = callable.slice(start, start + MAX_FILES_PER_CALL)
        const batchFiles = new Set(batch.map(entry => entry.file))
        let attempts = 0
        let proposals = null
        while (attempts < retries) {
            attempts += 1
            let content
            try {
                content = await callModel({ files: batch, baseUrl, apiKey, model, timeoutMs, fetchImpl, metadataExample: laneReport.metadataExample })
            } catch (error) {
                lastError = `call failed: ${error.message}`
                continue
            }
            let parsed
            try {
                parsed = parseModelContent(content)
                if (!parsed || !Array.isArray(parsed.proposals)) throw new Error('response has no proposals array')
            } catch (error) {
                lastError = error.message
                continue
            }
            proposals = []
            rejected.length = 0
            for (const line of parsed.proposals) {
                const verdict = acceptProposalLine(line, batchFiles, context, sourceDir, laneReport.manual)
                if (verdict.rejected) rejected.push({ line, reason: verdict.rejected })
                else if (seen.has(verdict.proposal.file)) rejected.push({ line, reason: 'duplicate file in one response' })
                else { seen.add(verdict.proposal.file); proposals.push(verdict.proposal) }
            }
            break
        }
        if (proposals === null) {
            // Advisory: exhausted retries degrade this batch; the missing files keep their
            // ledger entries and the human checklist stays the decision surface.
            batches.push({ files: batch.length, proposed: 0, attempts, rejected: [], degraded: true, reason: lastError })
            continue
        }
        accepted.push(...proposals)
        batches.push({ files: batch.length, proposed: proposals.length, attempts, rejected })
    }
    const summary = { pending: pending.length, proposed: accepted.length, rejectedLines: rejected.length,
        missingContent, degraded: accepted.length === 0, reason: accepted.length === 0 ? (lastError ?? 'no proposal accepted') : undefined }
    if (accepted.length > 0) {
        fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true })
        fs.writeFileSync(outPath, `${accepted.map(proposal => JSON.stringify(proposal)).join('\n')}\n`)
    }
    fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true })
    fs.writeFileSync(reportPath, `${JSON.stringify({ model, summary, batches }, null, 2)}\n`)
    console.log(`proposed ${summary.proposed}/${summary.pending} pending page(s); ${summary.rejectedLines} rejected line(s); degraded=${summary.degraded} -> ${outPath}`)
    return { summary, batches }
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    await decideManualAdditions({
        laneReportPath: args.get('lane-report'),
        sharedDocsPath: args.get('shared-docs'),
        repoPath: args.get('repo'),
        outPath: args.get('out'),
        reportPath: args.get('report'),
        baseUrl: args.get('base-url'),
        apiKeyEnv: args.get('api-key-env'),
        model: args.get('model'),
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

module.exports = { decideManualAdditions, acceptProposalLine, validateMetadataDraft, decideSystemPrompt }
