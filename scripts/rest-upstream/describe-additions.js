#!/usr/bin/env node
'use strict'

// Describe stage for the 2026-11-03 describe lane: mirrors and additions may
// land schema nodes the upstream could not describe (the Go extractor emits
// structure only — 109 prose-less nodes rode the 2026-11-01 refresh
// unnoticed). This stage drafts the missing ENGLISH descriptions on the same
// gateway the decision/translation stages use, grounded on inlined evidence
// only — the node's own type/enum, the upstream Go field comment harvested
// onto the diff entry (upstreamComments), and reference descriptions the
// fragments already carry for the same property name elsewhere. The model
// never writes structure: it returns one string per cited node path, every
// line is validated (verbatim path, length, no placeholders, exact-case enum
// mentions), and a node whose description cannot be completed degrades to the
// PR human-review list — the entry still lands, exactly like a translation
// degrade. zh-CN/ja-JP are NOT produced here: the translate stage runs after
// this one and fills x-i18n for every description-bearing node.
//
// Behavior note for reviewers: an entry this stage described that the
// translate stage then cannot complete is dropped ENTIRELY by the translation
// gate (never half-translated) — including a mirror that would previously
// have landed undescribed. That is the accepted trade: a described node must
// not appear English-only on zh/ja sites, and the degraded entry rides the PR
// body for a re-dispatch.
//
// Grounding is anti-hallucination, not decoration: descriptions are factual
// claims about API behavior, so the prompt forbids inventing defaults, ranges,
// or behaviors absent from the evidence, and the validator rejects enum
// mentions that do not match the schema's enum exactly.

const fs = require('node:fs')
const path = require('node:path')

const {undescribedNodes, hasDescription} = require(path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'upstreamDiff', 'mirror'))
const {chatCompletionsUrl, parseModelContent, parseArgs} = require('./decide-batches')

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_RETRIES = 3
const DESCRIBABLE_KINDS = new Set(['mirror', 'addition'])
const MAX_DESCRIPTION_LENGTH = 500
const REFERENCE_LIMIT = 2
// Placeholder-shaped text the fragments render as "(To be added soon)" — a
// draft that says the description is missing is worse than no draft.
const PLACEHOLDER_PATTERNS = /\b(to be added|tbd|todo|coming soon|placeholder)\b/i

function usage() {
    return 'Usage: node scripts/rest-upstream/describe-additions.js --change-set <path> --out <file> --base-url <url> --api-key-env <NAME> --model <id> [--report <path>] [--diff <path>] [--fragments <dir>] [--timeout-ms 300000] [--retries 3]'
}

function fail(message) {
    throw new Error(message)
}

function descriptionSystemPrompt() {
    return [
        'You draft REST API reference field descriptions. For each item you receive an evidence object; you return one concise English description of that schema field.',
        'Output strict JSON only: {"descriptions":[{"p":"<the p value copied verbatim>","en":"<description>"}]} with every input p present exactly once.',
        'Rules:',
        '1. Ground every claim on the provided evidence only (upstream comment, reference descriptions, type, enum). Never invent defaults, value ranges, constraints, or behaviors the evidence does not state.',
        '2. When evidence includes an enum, you may list its values exactly as written. When the node carries no enum, do NOT enumerate possible values.',
        '3. One to three sentences of technical reference prose. Use backticks for field names and enum values. No markdown headings, no HTML, no bullet lists.',
        '4. Reference descriptions are how OTHER schemas document the same property name. Use them silently for terminology and claims — NEVER mention references, schemas, or the evidence itself in the output. The reader sees API documentation, not its sources.',
        '5. Write what the field MEANS for an API caller. Never describe schema mechanics: no "root schema", no "an item in the oneOf list", no "references X", no restating the JSON shape the type already shows.',
        '6. A field inside an array (p ends with []) describes ONE element; write it in the singular.',
        '7. Copy p values verbatim. Never invent, shorten, or reformat a p value.',
        '8. Never output placeholder text (to be added, TBD, TODO); when evidence is thin, describe conservatively what the field name and type imply and nothing more.',
    ].join('\n')
}

// Node-level evidence for the prompt: what the schema itself asserts.
function nodeEvidence(node) {
    const evidence = {}
    if (node.type) evidence.type = node.type
    if (node.format) evidence.format = node.format
    if (Array.isArray(node.enum)) evidence.enum = node.enum.map(String)
    if (Array.isArray(node.required)) evidence.required = node.required
    if (node.$ref) evidence.ref = node.$ref
    return evidence
}

function pathFieldName(nodePath) {
    const tail = nodePath.split(/[./]/).filter(Boolean).pop() ?? nodePath
    return tail.replace(/\[\]|\{\}/g, '')
}

// Validation of one model line: verbatim path, non-placeholder prose, length
// cap, and exact-case enum mentions (a backticked token that matches an enum
// member case-insensitively but not exactly is a misspelled value).
function descriptionRejection({node, en}) {
    if (typeof en !== 'string') return 'en is not a string'
    const text = en.trim()
    if (!text) return 'en is empty'
    if (text.length > MAX_DESCRIPTION_LENGTH) return `en exceeds ${MAX_DESCRIPTION_LENGTH} characters`
    if (PLACEHOLDER_PATTERNS.test(text)) return 'en contains placeholder-shaped text'
    if (/^#|<\w+[>/]|\n\s*[-*]\s/.test(text)) return 'en uses markup (headings/HTML/bullets) the contract forbids'
    // Fragments serve BOTH publication targets; prose cannot carry the
    // include-span gating that protects target-specific wording, so drafted
    // descriptions must be product-neutral. The reference pool contains
    // zilliz-flavored text inside include spans — a paraphrase that drops the
    // span leaks it onto milvus.io.
    if (/\b(zilliz cloud|zilliz|dedicated clusters?|serverless clusters?)\b/i.test(text)) return 'en uses publication-target vocabulary (Zilliz Cloud / dedicated cluster / serverless cluster); descriptions must be product-neutral'
    if (Array.isArray(node?.enum)) {
        for (const mention of text.matchAll(/`([^`]+)`/g)) {
            const token = mention[1]
            const lower = token.toLowerCase()
            const caseInsensitive = node.enum.some(value => String(value).toLowerCase() === lower)
            const caseExact = node.enum.some(value => String(value) === token)
            if (caseInsensitive && !caseExact) return `en mentions enum value \`${token}\` with wrong casing (schema enum has the exact form)`
        }
    } else if (/\b(possible values|valid values|allowed values|supported values|values include|values are)\b/i.test(text)) {
        // A node whose own schema declares no enum must not enumerate values in
        // prose: the family's reference enums can be target-gated (x-include
        // markup hides values per publication target), and prose cannot — a
        // listed value would render on every site. The right fix for such
        // fields is copying the enum into the schema, by hand.
        return 'en enumerates possible values the node schema does not declare'
    }
    return null
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
                    {role: 'system', content: descriptionSystemPrompt()},
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

function parseDescriptions(content) {
    const parsed = parseModelContent(content)
    if (!parsed || !Array.isArray(parsed.descriptions)) fail('REST_UPSTREAM_DESCRIBE_RESPONSE_INVALID: response has no descriptions array')
    const byPath = new Map()
    for (const line of parsed.descriptions) {
        if (!line || typeof line !== 'object' || typeof line.p !== 'string' || typeof line.en !== 'string') continue
        if (!byPath.has(line.p)) byPath.set(line.p, line.en)
    }
    return byPath
}

// Property-name → reference descriptions the fragments already carry for that
// name elsewhere (the same field documented in a sibling schema is the
// highest-quality grounding there is).
function buildReferenceIndex(fragmentsDir) {
    const index = new Map()
    if (!fragmentsDir) return index
    for (const file of fs.readdirSync(fragmentsDir).filter(name => name.endsWith('.json')).sort()) {
        let document
        try {
            document = JSON.parse(fs.readFileSync(path.join(fragmentsDir, file), 'utf8'))
        } catch {
            continue
        }
        const walk = node => {
            if (Array.isArray(node)) {
                node.forEach(walk)
                return
            }
            if (!node || typeof node !== 'object') return
            const properties = node.properties
            if (properties && typeof properties === 'object') {
                for (const [name, property] of Object.entries(properties)) {
                    if (property && typeof property === 'object' && hasDescription(property)) {
                        const entry = {description: property.description, enum: Array.isArray(property.enum) ? property.enum.map(String) : undefined}
                        const list = index.get(name) || []
                        if (!list.some(existing => existing.description === entry.description)) list.push(entry)
                        index.set(name, list)
                    }
                }
            }
            for (const [key, child] of Object.entries(node)) {
                if (key.startsWith('x-')) continue
                if (child && typeof child === 'object') walk(child)
            }
        }
        walk(document)
    }
    return index
}

function referencesFor(referenceIndex, fieldName) {
    const list = referenceIndex.get(fieldName) || []
    return list.slice(0, REFERENCE_LIMIT)
}

// Operation summary lookup for prompt context ("POST /v2/... — Create ...").
function operationSummary(fragmentsDir, opKey) {
    if (!fragmentsDir || !opKey) return null
    const space = opKey.indexOf(' ')
    if (space <= 0) return null
    const method = opKey.slice(0, space).toLowerCase()
    const operationPath = opKey.slice(space + 1)
    for (const file of fs.readdirSync(fragmentsDir).filter(name => name.endsWith('.json')).sort()) {
        let document
        try {
            document = JSON.parse(fs.readFileSync(path.join(fragmentsDir, file), 'utf8'))
        } catch {
            continue
        }
        const operation = document.paths?.[operationPath]?.[method]
        if (operation && typeof operation.summary === 'string') return operation.summary
    }
    return null
}

// The addressable subtree(s) of a change-set entry: mirrors carry the field
// subtree directly; field additions wrap it once ({field: subtree});
// parameter additions carry the parameter object itself.
function entrySubtree(entry) {
    if (!entry.value || typeof entry.value !== 'object') return null
    if (entry.kind === 'mirror') return {subtree: entry.value, field: entry.opPath?.split('/').pop() ?? null}
    if (typeof entry.value.name === 'string' && typeof entry.value.in === 'string') {
        return {subtree: entry.value, field: entry.value.name}
    }
    const keys = Object.keys(entry.value)
    if (keys.length !== 1) return null
    return {subtree: entry.value[keys[0]], field: keys[0]}
}

// Returns {changeSet, report}: the change set with descriptions filled on
// prose-less mirror/addition nodes, minus nothing — degraded nodes simply stay
// undescribed and ride the report back to the PR body.
async function describeChangeSet({changeSet, diff = null, fragmentsDir = null, baseUrl, apiKeyEnv, model, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, fetchImpl = globalThis.fetch}) {
    if (!changeSet || !baseUrl || !apiKeyEnv || !model) fail(usage())
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) fail(`REST_UPSTREAM_DESCRIBE_API_KEY_MISSING: --api-key-env ${apiKeyEnv} is not set`)
    const upstreamCommentsByEntry = new Map((diff?.entries ?? []).map(entry => [entry.id, entry.upstreamComments ?? {}]))
    // Change-set entries carry opPath but not opKey; the diff entry has it.
    const opKeyByEntry = new Map((diff?.entries ?? []).map(entry => [entry.id, entry.opKey ?? null]))
    const referenceIndex = buildReferenceIndex(fragmentsDir)
    const report = {model, describedEntries: 0, describedNodes: 0, degraded: [], grounding: {upstreamCommentsUsed: 0, referencesUsed: 0}}

    for (const entry of changeSet.entries) {
        if (!DESCRIBABLE_KINDS.has(entry.kind)) continue
        const located = entrySubtree(entry)
        if (!located) continue
        // Live references into entry.value: descriptions are written straight
        // onto these nodes, no splice-back step.
        const nodes = undescribedNodes(located.subtree)
        if (nodes.length === 0) continue

        const pending = nodes.map(({node, path: nodePath}) => {
            const fieldName = pathFieldName(nodePath) || located.field || nodePath
            const upstreamComment = upstreamCommentsByEntry.get(entry.diffEntryId)?.[nodePath]
            const references = referencesFor(referenceIndex, fieldName)
            if (upstreamComment) report.grounding.upstreamCommentsUsed += 1
            if (references.length > 0) report.grounding.referencesUsed += 1
            const evidence = {p: nodePath, field: fieldName, ...nodeEvidence(node)}
            if (upstreamComment) evidence.upstreamComment = upstreamComment
            if (references.length > 0) evidence.references = references
            return {node, evidence}
        })

        const opKey = opKeyByEntry.get(entry.diffEntryId) ?? null
        const summary = operationSummary(fragmentsDir, opKey)
        const context = `operation ${opKey ?? 'unknown'}${summary ? ` (${summary})` : ''}`
        let byPath = null
        let lastError = null
        for (let attempt = 0; attempt < retries && !byPath; attempt++) {
            try {
                byPath = parseDescriptions(await callModel({items: pending.map(item => item.evidence), context, baseUrl, apiKey, model, timeoutMs, fetchImpl}))
            } catch (error) {
                lastError = error.message
            }
        }
        let filled = 0
        if (byPath) {
            for (const item of pending) {
                const en = byPath.get(item.evidence.p)
                const rejection = en === undefined ? 'no line for this path' : descriptionRejection({node: item.node, en})
                if (rejection) {
                    report.degraded.push({diffEntryId: entry.diffEntryId, kind: entry.kind, path: item.evidence.p, reason: rejection})
                    continue
                }
                item.node.description = en.trim()
                filled += 1
            }
        } else {
            for (const item of pending) {
                report.degraded.push({diffEntryId: entry.diffEntryId, kind: entry.kind, path: item.evidence.p, reason: lastError ?? 'model returned no usable descriptions'})
            }
        }
        if (filled === 0) continue
        report.describedEntries += 1
        report.describedNodes += filled
    }

    // All-degraded guard, same shape as the translate stage: every pending
    // node failing while none was described is a gateway/contract problem, not
    // content judgment — fail loudly instead of shipping a silent no-op.
    const pendingNodes = report.describedNodes + report.degraded.length
    if (pendingNodes > 0 && report.describedNodes === 0) {
        fail('REST_UPSTREAM_DESCRIBE_ALL_DEGRADED: every mirror/addition node failed description; the describe report artifact lists them — restore the gateway and re-run')
    }
    return {changeSet, report}
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    if (!args.get('change-set') || !args.get('out') || !args.get('base-url') || !args.get('api-key-env') || !args.get('model')) fail(usage())
    const changeSet = JSON.parse(fs.readFileSync(args.get('change-set'), 'utf8'))
    const diff = args.get('diff') ? JSON.parse(fs.readFileSync(args.get('diff'), 'utf8')) : null
    const {changeSet: described, report} = await describeChangeSet({
        changeSet,
        diff,
        fragmentsDir: args.get('fragments') ?? null,
        baseUrl: args.get('base-url'),
        apiKeyEnv: args.get('api-key-env'),
        model: args.get('model'),
        timeoutMs: args.has('timeout-ms') ? Number(args.get('timeout-ms')) : DEFAULT_TIMEOUT_MS,
        retries: args.has('retries') ? Number(args.get('retries')) : DEFAULT_RETRIES,
    })
    fs.mkdirSync(path.dirname(path.resolve(args.get('out'))), {recursive: true})
    fs.writeFileSync(args.get('out'), `${JSON.stringify(described, null, 2)}\n`)
    if (args.get('report')) {
        fs.mkdirSync(path.dirname(path.resolve(args.get('report'))), {recursive: true})
        fs.writeFileSync(args.get('report'), `${JSON.stringify(report, null, 2)}\n`)
    }
    console.log(`describe: ${report.describedNodes} node(s) across ${report.describedEntries} entr(ies); ${report.degraded.length} degraded to human review -> ${args.get('out')}`)
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message)
        process.exit(1)
    })
}

module.exports = {describeChangeSet, descriptionSystemPrompt, descriptionRejection, entrySubtree, buildReferenceIndex, nodeEvidence, pathFieldName, parseDescriptions, MAX_DESCRIPTION_LENGTH}
