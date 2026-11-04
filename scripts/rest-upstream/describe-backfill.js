#!/usr/bin/env node
'use strict'

// One-shot backfill (2026-11-03) for the EXISTING description gaps in the REST
// fragments — the 407 prose-less nodes the 2026-11-03 survey found (111
// "(To be added soon)" placeholders + 296 silent blanks across 176 of 240
// operations). PR-only by construction: it never runs inside a workflow, never
// commits, and defaults to a dry run — an operator (or an agent) invokes it
// with --write on a branch, reviews, and opens a PR; the fragments are
// master-authoritative and regenerate through the normal publication pipeline
// after merge.
//
// Same contract as the incremental describe stage
// (scripts/rest-upstream/describe-additions.js): grounding on inlined evidence
// only (node type/enum + reference descriptions the fragments already carry
// for the same property name), one validated string per node, per-node degrade
// on rejection. Because the backfill does NOT ride the refresh translate
// stage, each draft fills en description AND zh-CN/ja-JP x-i18n descriptions
// in the same call — a node that cannot complete all three stays untouched
// (never half-translated, the PR #964 lesson).

const fs = require('node:fs')
const path = require('node:path')

const TOOLING_ROOT = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest')
const {undescribedNodes} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'mirror'))
const {serializeDocument, assertCanonicalBytes} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'formatter'))
const {chatCompletionsUrl, parseModelContent, parseArgs} = require('./decide-batches')
const {descriptionRejection, buildReferenceIndex, nodeEvidence, pathFieldName} = require('./describe-additions')

const DEFAULT_FRAGMENTS_DIR = path.join(TOOLING_ROOT, 'meta', 'openapi')
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_RETRIES = 3
const BATCH_NODES = 12
const REFERENCE_LIMIT = 2

function usage() {
    return [
        'Usage: node scripts/rest-upstream/describe-backfill.js --base-url <url> --api-key-env <NAME> --model <id>',
        '  [--fragments <dir>] [--report <path>] [--write] [--limit <nodes>] [--fragment <file.json>] [--batch-nodes 12]',
        '  [--timeout-ms 300000] [--retries 3]',
        'Dry run by default: prints the plan and writes nothing. --write edits the fragment files in place (canonical bytes).',
    ].join('\n')
}

function fail(message) {
    throw new Error(message)
}

function backfillSystemPrompt() {
    return [
        'You draft REST API reference field descriptions. For each item you receive an evidence object; you return one concise description in English, Simplified Chinese, and Japanese.',
        'Output strict JSON only: {"descriptions":[{"p":"<the p value copied verbatim>","en":"...","zh":"...","ja":"..."}]} with every input p present exactly once.',
        'Rules:',
        '1. Ground every claim on the provided evidence only (reference descriptions, type, enum). Never invent defaults, value ranges, constraints, or behaviors the evidence does not state.',
        '2. When evidence includes an enum, you may list its values exactly as written. When the node carries no enum, do NOT enumerate possible values.',
        '3. One to three sentences of technical reference prose. Use backticks for field names and enum values. No markdown headings, no HTML, no bullet lists.',
        '4. Reference descriptions are how OTHER schemas document the same property name. Use them silently for terminology and claims — NEVER mention references, schemas, fields named like references, or the evidence itself in the output. The reader sees API documentation, not its sources.',
        '5. Write what the field MEANS for an API caller. Never describe schema mechanics: no "root schema", no "an item in the oneOf list", no "references X", no restating the JSON shape the type already shows.',
        '6. Generic envelope fields (code, data, message, status and similar) describe the envelope generically. The `where` context names the enclosing schema/operation — when it signals a generic or shared shape (e.g. EmptyResponse), do not import specifics from unrelated operations\' references.',
        '7. A field inside an array (p ends with []) describes ONE element; write it in the singular.',
        '8. zh and ja are faithful translations of en: keep backticks, field names, and enum values exactly. Product terms stay in English exactly as the docs keep them — Collection is NEVER translated (never 集合, never コレクション); Volume, Pipeline, Stage also stay; Partition stays; Cluster may become 集群/クラスター.',
        '9. Copy p values verbatim. Never invent, shorten, or reformat a p value. Never output placeholder text (to be added, TBD, TODO).',
    ].join('\n')
}

// Every addressable schema root of a fragment document: the components, each
// operation's request/response schemas, and its parameters. Label prefixes the
// node path for the human-readable report; the model only ever sees the
// undescribedNodes path (p).
function addressableRoots(document) {
    const roots = []
    for (const [name, schema] of Object.entries(document.components?.schemas ?? {})) {
        roots.push({label: `components/schemas/${name}`, node: schema, opKey: null})
    }
    for (const [route, item] of Object.entries(document.paths ?? {})) {
        for (const method of ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']) {
            const operation = item?.[method]
            if (!operation) continue
            const opKey = `${method} ${route}`
            const summary = typeof operation.summary === 'string' ? operation.summary : null
            for (const parameter of operation.parameters ?? []) {
                roots.push({label: `${opKey} parameter ${parameter.name}:${parameter.in}`, node: parameter, opKey, summary})
            }
            // A bare $ref request/response schema resolves to its component,
            // which the components walk already plans — filling the $ref site
            // instead would write a sibling that overrides the component at
            // this usage only and duplicate the same logical row. Skip the
            // wrapper; the component root gets the description.
            const requestSchema = operation.requestBody?.content?.['application/json']?.schema
            if (requestSchema && !requestSchema.$ref) roots.push({label: `${opKey} requestBody`, node: requestSchema, opKey, summary})
            for (const [status, response] of Object.entries(operation.responses ?? {})) {
                const responseSchema = response?.content?.['application/json']?.schema
                if (responseSchema && !responseSchema.$ref) roots.push({label: `${opKey} response ${status}`, node: responseSchema, opKey, summary})
            }
        }
    }
    return roots
}

async function callModel({items, context, baseUrl, apiKey, model, timeoutMs, fetchImpl}) {
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
                    {role: 'system', content: backfillSystemPrompt()},
                    {role: 'user', content: `Draft descriptions for these ${items.length} schema field(s). Context: ${context}\n\n${items.map(item => JSON.stringify(item)).join('\n')}`},
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

function parseBackfill(content) {
    const parsed = parseModelContent(content)
    if (!parsed || !Array.isArray(parsed.descriptions)) fail('REST_UPSTREAM_BACKFILL_RESPONSE_INVALID: response has no descriptions array')
    const byPath = new Map()
    for (const line of parsed.descriptions) {
        if (!line || typeof line !== 'object' || typeof line.p !== 'string') continue
        if (typeof line.en !== 'string' || typeof line.zh !== 'string' || typeof line.ja !== 'string') continue
        if (!byPath.has(line.p)) byPath.set(line.p, {en: line.en.trim(), zh: line.zh.trim(), ja: line.ja.trim()})
    }
    return byPath
}

// Returns {described, degraded, changedFragments}: mutates the loaded fragment
// documents in place; the caller decides whether to persist (--write).
async function backfillFragments({fragmentsDir = DEFAULT_FRAGMENTS_DIR, fragmentFilter = null, baseUrl, apiKeyEnv, model, limit = null, batchNodes = BATCH_NODES, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, fetchImpl = globalThis.fetch}) {
    if (!baseUrl || !apiKeyEnv || !model) fail(usage())
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) fail(`REST_UPSTREAM_BACKFILL_API_KEY_MISSING: --api-key-env ${apiKeyEnv} is not set`)

    const fileNames = fs.readdirSync(fragmentsDir).filter(name => name.endsWith('.json'))
        .filter(name => !fragmentFilter || name === fragmentFilter).sort()
    if (fileNames.length === 0) fail(`REST_UPSTREAM_BACKFILL_NO_FRAGMENTS: no fragment files in ${fragmentsDir}`)
    const referenceIndex = buildReferenceIndex(fragmentsDir)

    const documents = new Map()
    const plan = [] // {fileName, label, opKey, summary, node, nodePath, evidence}
    for (const fileName of fileNames) {
        const raw = fs.readFileSync(path.join(fragmentsDir, fileName), 'utf8')
        assertCanonicalBytes(raw, fileName)
        const document = JSON.parse(raw)
        documents.set(fileName, {raw, document})
        for (const root of addressableRoots(document)) {
            for (const {node, path: nodePath} of undescribedNodes(root.node)) {
                // A bare {$ref} (plus x-* tags) resolves to its component at
                // render time — the component's own description renders, so a
                // prose-less member here is a FALSE gap (oneOf/anyOf tab
                // members). The components walk owns the real row.
                const structuralKeys = Object.keys(node).filter(key => !key.startsWith('x-'))
                if (structuralKeys.length === 1 && structuralKeys[0] === '$ref') continue
                const fieldName = pathFieldName(nodePath) || nodePath || '(root)'
                const references = (referenceIndex.get(fieldName) || []).slice(0, REFERENCE_LIMIT)
                // The model address p must be unique across the WHOLE batch:
                // relative node paths collide between roots (every schema root
                // has a ''), so the root label prefixes the path.
                const evidence = {p: `${root.label}#${nodePath || '(root)'}`, field: fieldName, where: root.label, ...nodeEvidence(node)}
                if (references.length > 0) evidence.references = references
                if (root.label.startsWith('parameter')) evidence.parameter = true
                plan.push({fileName, label: `${root.label} ${nodePath || '(root)'}`, opKey: root.opKey, summary: root.summary, node, evidence, references})
            }
        }
    }
    if (limit !== null) plan.splice(Math.max(limit, 0))

    const described = []
    const degraded = []
    const changedFiles = new Set()
    for (let offset = 0; offset < plan.length; offset += batchNodes) {
        const batch = plan.slice(offset, offset + batchNodes)
        const summary = batch.find(item => item.summary)?.summary ?? null
        const context = summary ? `fragment REST API reference (${summary} and neighbors)` : 'fragment REST API reference'
        let byPath = null
        let lastError = null
        for (let attempt = 0; attempt < retries && !byPath; attempt++) {
            try {
                byPath = parseBackfill(await callModel({items: batch.map(item => item.evidence), context, baseUrl, apiKey, model, timeoutMs, fetchImpl}))
            } catch (error) {
                lastError = error.message
            }
        }
        for (const item of batch) {
            const line = byPath?.get(item.evidence.p)
            const rejection = !line ? (lastError ?? 'no line for this path') : descriptionRejection({node: item.node, en: line.en})
                ?? (line.zh ? null : 'zh translation is empty')
                ?? (line.ja ? null : 'ja translation is empty')
                ?? (/集合/.test(line.zh) ? 'zh translates Collection as 集合; the docs keep Collection in English' : null)
                ?? (/コレクション/.test(line.ja) ? 'ja translates Collection as コレクション; the docs keep Collection in English' : null)
            if (rejection) {
                degraded.push({fragment: item.fileName, label: item.label, reason: rejection})
                continue
            }
            item.node.description = line.en
            item.node['x-i18n'] = {...(item.node['x-i18n'] ?? {})}
            if (!item.node['x-i18n']['zh-CN']?.description) {
                item.node['x-i18n']['zh-CN'] = {...(item.node['x-i18n']['zh-CN'] ?? {}), description: line.zh}
            }
            if (!item.node['x-i18n']['ja-JP']?.description) {
                item.node['x-i18n']['ja-JP'] = {...(item.node['x-i18n']['ja-JP'] ?? {}), description: line.ja}
            }
            described.push({fragment: item.fileName, label: item.label, en: line.en, zh: line.zh, ja: line.ja})
            changedFiles.add(item.fileName)
        }
    }

    // All-degraded is returned, not thrown: the failure reasons ARE the
    // evidence the caller needs in the report (a probe run against a broken
    // gateway is useless without them), and main fails after writing it.
    const allDegraded = plan.length > 0 && described.length === 0
    return {plan, described, degraded, changedFiles: [...changedFiles].sort(), documents, allDegraded}
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    const write = args.has('write')
    const model = args.get('model')
    const {plan, described, degraded, changedFiles, documents, allDegraded: allDegradedFlag} = await backfillFragments({
        fragmentsDir: args.get('fragments') ?? DEFAULT_FRAGMENTS_DIR,
        fragmentFilter: args.get('fragment') ?? null,
        baseUrl: args.get('base-url'),
        apiKeyEnv: args.get('api-key-env'),
        model,
        limit: args.has('limit') ? Number(args.get('limit')) : null,
        batchNodes: args.has('batch-nodes') ? Number(args.get('batch-nodes')) : BATCH_NODES,
        timeoutMs: args.has('timeout-ms') ? Number(args.get('timeout-ms')) : DEFAULT_TIMEOUT_MS,
        retries: args.has('retries') ? Number(args.get('retries')) : DEFAULT_RETRIES,
    })
    if (write) {
        for (const fileName of changedFiles) {
            const {document} = documents.get(fileName)
            fs.writeFileSync(path.join(args.get('fragments') ?? DEFAULT_FRAGMENTS_DIR, fileName), serializeDocument(document))
        }
    }
    // The report is the review artifact for a probe batch as much as for a
    // write run: drafted text is included in dry-run mode too (that is the
    // point of probing — judge quality before any file moves).
    const report = {model, mode: write ? 'write' : 'dry-run', candidates: plan.length, described: described.length,
        degraded: degraded.length, changedFiles,
        degradedDetail: degraded.slice(0, 200), describedDetail: described.slice(0, 400)}
    if (args.get('report')) {
        fs.mkdirSync(path.dirname(path.resolve(args.get('report'))), {recursive: true})
        fs.writeFileSync(args.get('report'), `${JSON.stringify(report, null, 2)}\n`)
    }
    console.log(`backfill (${report.mode}): ${described.length}/${plan.length} node(s) described, ${degraded.length} degraded; ${changedFiles.length} fragment file(s) ${write ? 'updated' : 'would update'}`)
    if (allDegradedFlag) fail('REST_UPSTREAM_BACKFILL_ALL_DEGRADED: every candidate node failed; the reasons are in the report — restore the gateway and re-run')
    for (const item of described.slice(0, 10)) console.log(`  + ${item.fragment}: ${item.label}`)
    for (const item of degraded.slice(0, 10)) console.log(`  - ${item.fragment}: ${item.label} — ${item.reason}`)
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message)
        process.exit(1)
    })
}

module.exports = {backfillFragments, backfillSystemPrompt, addressableRoots, parseBackfill}
