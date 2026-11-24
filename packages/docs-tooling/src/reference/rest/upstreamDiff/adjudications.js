const fs = require('node:fs')
const path = require('node:path')
const Ajv2020 = require('ajv/dist/2020')

const adjudicationsSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'contracts', 'rest-upstream-adjudications.schema.json'), 'utf8'))

function fail(code, message) {
    throw new Error(`${code}: ${message}`)
}

const validateAdjudications = new Ajv2020({allErrors: true, strict: false}).compile(adjudicationsSchema)

// Controlled facts grammar (2026-11-23 design, 2026-11-25 review condition 3):
// every fact is one verifiable assertion that must cite machine-checkable
// evidence — a literal set {…} or a Go symbol (leading-uppercase identifier).
// The pattern is a floor, not a parser: it keeps the stance-vs-fact comparison
// mechanical (the decision stage cites symbols and sets, not prose judgments).
const FACT_EVIDENCE_PATTERN = /\{[^{}]+\}|(?:^|[^A-Za-z])[A-Z][A-Za-z0-9_]{2,}/

// The stable identity of one adjudication: source plus the diff entry's
// structural coordinates plus the leaf dot path (2026-11-25 review condition
// 1 — structured diff-entry vocabulary, not free-form JSON pointers; branch
// is empty for unbranched request/response schemas).
function canonicalKey({source, opKey, scope, branch, fieldPath}) {
    return [source, opKey, scope, branch ?? '', fieldPath].join('|')
}

function assertAdjudicationsShape(adjudications) {
    if (!adjudications || typeof adjudications !== 'object' || Array.isArray(adjudications)) fail('REST_UPSTREAM_ADJUDICATIONS_INVALID', 'adjudications must be an object')
    if (!validateAdjudications(adjudications)) {
        const details = validateAdjudications.errors.map(error => `${error.instancePath || '/'} ${error.message}`).join('; ')
        fail('REST_UPSTREAM_ADJUDICATIONS_SCHEMA_INVALID', details)
    }
    const seen = new Set()
    for (const entry of adjudications.adjudications) {
        const unevidenced = entry.facts.find(fact => !FACT_EVIDENCE_PATTERN.test(fact))
        if (unevidenced) fail('REST_UPSTREAM_ADJUDICATIONS_FACT_UNEVIDENCED', `${canonicalKey(entry)}: ${JSON.stringify(unevidenced)}`)
        const key = canonicalKey(entry)
        if (seen.has(key)) fail('REST_UPSTREAM_ADJUDICATIONS_DUPLICATE_ENTRY', key)
        seen.add(key)
    }
}

function parseRestUpstreamAdjudications(text, label = 'adjudications.json') {
    let adjudications
    try {
        adjudications = JSON.parse(text)
    } catch (error) {
        fail('REST_UPSTREAM_ADJUDICATIONS_MALFORMED_JSON', `${label}: ${error.message}`)
    }
    assertAdjudicationsShape(adjudications)
    return adjudications
}

// Absent file means "no recorded adjudications yet", not corruption: legacy
// checkpoints and rehearsal stagings predate the file, and every consumer
// (decision citation gate, describe grounding) must stay inert there instead
// of failing closed on history. A file that EXISTS but is malformed or
// duplicated still fails closed.
function loadRestUpstreamAdjudications(filePath) {
    if (!fs.existsSync(filePath)) return null
    return parseRestUpstreamAdjudications(fs.readFileSync(filePath, 'utf8'), path.basename(filePath))
}

// Parameter-scope diff entries name the field "name:in" (plus copy indexes);
// the adjudication addresses the bare parameter name.
function fieldRootOf(entryField) {
    return String(entryField ?? '').split(':')[0]
}

// Matching rule (2026-11-25 review condition 1): the operation coordinates
// agree exactly (source, opKey, scope, branch — branch absent matches only
// unbranched drift) and the adjudicated leaf sits anywhere inside the drifted
// field's subtree: the diff always names the top-level property, the
// adjudication addresses a leaf within it, so any drift involving the subtree
// re-raises the facts.
function matchAdjudicationsForEntry(adjudications, source, diffEntry) {
    if (!adjudications || !diffEntry) return []
    return adjudications.adjudications.filter(entry => entry.source === source
        && entry.opKey === diffEntry.opKey
        && entry.scope === diffEntry.scope
        && (entry.branch ?? '') === (diffEntry.branch ?? '')
        && entry.fieldPath.split('.')[0] === fieldRootOf(diffEntry.field))
}

// The upstream payload bytes a drift entry carries, when it carries any:
// mirror entries hold the resolved upstream subtree, constraint entries the
// upstream leaf value. Description/summary drift and unresolvable subtrees
// carry no comparable upstream bytes.
function upstreamPayloadOf(diffEntry) {
    const change = diffEntry?.change
    if (!change) return null
    if (change.kind === 'schema' && change.after != null) return JSON.stringify(change.after)
    if (change.kind === 'constraint') return JSON.stringify(change.after)
    return null
}

// Cheap staleness gate (2026-11-25 review condition 4): when the matched drift
// entry carries upstream bytes and a cited literal is gone from them, the fact
// can no longer be confirmed against this round's upstream view — the
// adjudication degrades to stale and the question re-opens for human
// adjudication instead of auto-aligning. Absence of payload is not evidence of
// staleness: the check simply cannot run, so the entry stays applicable (the
// PR body still renders decidedAt and the evidence pin for the reviewer).
function isStaleAgainst(adjudication, payloadText) {
    if (!adjudication.specLiterals || typeof payloadText !== 'string') return false
    return adjudication.specLiterals.some(literal => !payloadText.includes(literal))
}

// Applicability of one diff entry, in one call so the decision stage and the
// assembler share the same fresh/stale verdict for the same diff.
function applicableAdjudications(adjudications, source, diffEntry) {
    const matched = matchAdjudicationsForEntry(adjudications, source, diffEntry)
    const payload = upstreamPayloadOf(diffEntry)
    const fresh = matched.filter(entry => !isStaleAgainst(entry, payload))
    const stale = matched.filter(entry => isStaleAgainst(entry, payload))
    return {matched, fresh, stale, keys: new Set(fresh.map(entry => canonicalKey(entry)))}
}

module.exports = {parseRestUpstreamAdjudications, loadRestUpstreamAdjudications, assertAdjudicationsShape, canonicalKey, matchAdjudicationsForEntry, applicableAdjudications, isStaleAgainst, upstreamPayloadOf, FACT_EVIDENCE_PATTERN}
