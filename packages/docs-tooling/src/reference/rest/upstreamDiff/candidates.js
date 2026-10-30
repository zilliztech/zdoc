// Machine-generated candidate list for the refresh decision stage (decisions-first
// pipeline, 2026-10-29). The diff stays the only structural authority: candidates
// restate each stanceable drift entry as one compact line the decision model must
// echo or omit. No path, value, or locus ever appears as something the model has
// to produce — the assembler derives those from the diff entry itself.

const STANCEABLE_CATEGORIES = new Set([
    'upstream-modified',
    'unattributed',
    'upstream-added',
    'upstream-added-field',
    'upstream-added-param',
    'fragment-only',
])

// Rule 6 asks for a ledger proposal on these; everything else stanceable is an
// instructed omission (rule 7) and stays out of the stance-coverage base.
const STANCE_EXPECTED_CATEGORIES = new Set(['upstream-modified', 'unattributed', 'upstream-added'])

function candidateSummary(entry) {
    const change = entry.change || {}
    return [
        entry.opKey,
        entry.scope,
        entry.branch ? `branch=${entry.branch}` : '',
        entry.field ? `field=${entry.field}` : '',
        change.kind ? `change=${change.kind}${change.key ? `(${change.key})` : ''}` : '',
        entry.requiresConfirmation ? `requiresConfirmation=${entry.requiresConfirmation}` : '',
        'before' in change ? `before=${JSON.stringify(change.before)}` : '',
        'after' in change ? `after=${JSON.stringify(change.after)}` : '',
    ].filter(Boolean).join(' ')
}

// Ledger-classified drift is already decided stock; zdoc-only drift is
// deliberate documentation design. Everything stanceable is offered to the
// decision stage, one record per diff entry. `stanceExpected` marks the
// entries the decision rules expect a stance for — flagged relaxations are
// instructed omissions (rule 5), as are the rule-7 field/retirement classes —
// so the coverage gate can measure compliance instead of punishing it.
function buildCandidateRecords(diffDocument, {fragmentFilter = null} = {}) {
    const records = []
    for (const entry of diffDocument.entries) {
        if (!STANCEABLE_CATEGORIES.has(entry.category)) continue
        if ((entry.ledgerStatus ?? 'pending') === 'classified') continue
        if (fragmentFilter && entry.fragment !== fragmentFilter) continue
        records.push({
            d: entry.id,
            c: candidateSummary(entry),
            stanceExpected: STANCE_EXPECTED_CATEGORIES.has(entry.category) && !(entry.category === 'upstream-modified' && entry.requiresConfirmation),
        })
    }
    return records
}

// The model-facing wire shape: id plus summary only.
function buildCandidateLines(diffDocument, options = {}) {
    return buildCandidateRecords(diffDocument, options).map(record => ({d: record.d, c: record.c}))
}

function serializeCandidateLines(lines) {
    return `${lines.map(line => JSON.stringify(line)).join('\n')}\n`
}

module.exports = {buildCandidateLines, buildCandidateRecords, serializeCandidateLines, STANCEABLE_CATEGORIES, STANCE_EXPECTED_CATEGORIES}
