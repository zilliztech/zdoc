#!/usr/bin/env node
'use strict'

// Re-derive the fragment inventory hash inside the milvus lifecycle-evidence
// bootstrap after a legitimate fragment change (design §6.3 follow-up). The
// verify script pins both the inventory hash over fragment BYTES and the
// per-element lifecycle VALUES; a refresh changes the bytes (prose,
// constraints) while the applier keeps every x-* leaf frozen, so the hash
// must follow the tree while the element values still fail closed here: this
// script never writes a lifecycle value, and any observed drift stops it
// before the evidence is touched.
//
// Elements evolution (the §6.3 follow-up): a structural mirror legitimately
// rewrites/retires subtrees, so evidence elements whose pointers no longer
// resolve are expected whenever the refresh's own change-set rewrote that
// coordinate. With `appliedFile` pointing at the run's applied.json, an
// ABSENT element covered by a mirror/addition opPath (segment-boundary-safe
// prefix, same fragment) is retired from the elements list and reported for
// PR review instead of failing. Every other drift — a surviving element whose
// values changed, an uncovered absence, an element the fragments gained —
// still fails closed and never re-hashes.

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const LIFECYCLE_KEYS = ['x-added-at', 'x-last-modified', 'x-deprecated-since']
const REWRITING_KINDS = new Set(['mirror', 'addition'])

function escapePointer(value) {
    return value.replaceAll('~', '~0').replaceAll('/', '~1')
}

// Same walk as scripts/verify-rest-lifecycle-evidence.mjs: every object that
// carries all three lifecycle keys is an element, keyed by its JSON pointer.
function collect(node, pointer = '') {
    const rows = []
    if (!node || typeof node !== 'object') return rows
    if (!Array.isArray(node) && LIFECYCLE_KEYS.every(key => Object.hasOwn(node, key))) {
        rows.push({jsonPointer: pointer || '/', lifecycle: Object.fromEntries(LIFECYCLE_KEYS.map(key => [key, node[key]]))})
    }
    for (const [key, child] of Object.entries(node)) {
        if (LIFECYCLE_KEYS.includes(key)) continue
        rows.push(...collect(child, `${pointer}/${escapePointer(key)}`))
    }
    return rows
}

// JSON-pointer containment on segment boundaries: `/a/b` covers `/a/b/c` but
// never `/a/bc`.
function pointerCovers(outer, inner) {
    return outer === inner || inner.startsWith(`${outer}/`) || outer.startsWith(`${inner}/`)
}

function rewriteCoordinates(appliedFile) {
    const coordinates = new Map()
    if (!appliedFile) return coordinates
    const applied = JSON.parse(fs.readFileSync(appliedFile, 'utf8'))
    for (const entry of applied.appliedLog ?? []) {
        if (!REWRITING_KINDS.has(entry.kind) || !entry.targetFragment || !entry.opPath) continue
        if (!coordinates.has(entry.targetFragment)) coordinates.set(entry.targetFragment, [])
        coordinates.get(entry.targetFragment).push(entry.opPath)
    }
    return coordinates
}

function refreshLifecycleEvidenceInventory({root, restMeta, evidenceFile = 'milvus-2.6.x-bootstrap.json', appliedFile = null}) {
    // The verify script hashes "<sha256>  <repo-relative posix path>" lines;
    // the inventory is only reproducible when this script derives the exact
    // same lines, so the repository root is mandatory context here.
    if (!root) throw new Error('REST_UPSTREAM_LIFECYCLE_INVENTORY_ROOT_REQUIRED: pass the repository root')
    const evidencePath = path.join(restMeta, 'lifecycle-evidence', evidenceFile)
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'))
    const fragmentNames = [...new Set(evidence.elements.map(row => row.fragment))].sort()

    const inventoryHash = crypto.createHash('sha256')
    const observed = new Map()
    for (const fragment of fragmentNames) {
        const fragmentPath = path.join(restMeta, 'openapi', fragment)
        const bytes = fs.readFileSync(fragmentPath)
        const relative = path.relative(root, fragmentPath).split(path.sep).join('/')
        inventoryHash.update(`${crypto.createHash('sha256').update(bytes).digest('hex')}  ${relative}\n`)
        for (const row of collect(JSON.parse(bytes))) observed.set(`${fragment}:${row.jsonPointer}`, row.lifecycle)
    }

    // Element drift is a real contract change, never an inventory refresh —
    // except the one retirement the change-set itself proves: an element whose
    // pointer the fragments no longer resolve AND whose coordinate a
    // mirror/addition entry rewrote was retired by this very refresh, so it
    // leaves the elements list and is reported for PR review. A SURVIVING
    // element whose values differ always fails closed, covered or not.
    const coordinates = rewriteCoordinates(appliedFile)
    const drifts = []
    const retired = []
    const expected = new Map(evidence.elements.map(row => [`${row.fragment}:${row.jsonPointer}`, row]))
    for (const [key, row] of expected) {
        const actual = observed.get(key)
        if (JSON.stringify(actual) === JSON.stringify(row.lifecycle)) continue
        if (actual === undefined && appliedFile) {
            const retiredBy = (coordinates.get(row.fragment) ?? []).find(opPath => pointerCovers(opPath, row.jsonPointer))
            if (retiredBy !== undefined) {
                retired.push({fragment: row.fragment, jsonPointer: row.jsonPointer, lifecycle: row.lifecycle, retiredBy})
                continue
            }
        }
        drifts.push(`${key}: evidence ${JSON.stringify(row.lifecycle)} vs fragments ${JSON.stringify(actual ?? null)}`)
    }
    for (const key of observed.keys()) {
        if (!expected.has(key)) drifts.push(`${key}: lifecycle element present in fragments but absent from the evidence`)
    }
    if (drifts.length > 0) {
        throw new Error(`REST_UPSTREAM_LIFECYCLE_ELEMENT_DRIFT: ${drifts.length} lifecycle value drift(s) between the evidence and the fragments (refresh them in review, do not re-hash):\n  ${drifts.slice(0, 10).join('\n  ')}`)
    }

    const nextHash = inventoryHash.digest('hex')
    if (retired.length > 0) {
        const retiredKeys = new Set(retired.map(item => `${item.fragment}:${item.jsonPointer}`))
        evidence.elements = evidence.elements.filter(row => !retiredKeys.has(`${row.fragment}:${row.jsonPointer}`))
        evidence.summary.elements = evidence.elements.length
    }
    if (evidence.reproducibility.fragmentInventorySha256 === nextHash && retired.length === 0) {
        return {changed: false, hash: nextHash, elements: observed.size, retired: []}
    }
    evidence.reproducibility.fragmentInventorySha256 = nextHash
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`)
    return {changed: true, hash: nextHash, elements: evidence.elements.length, retired}
}

module.exports = {refreshLifecycleEvidenceInventory, collect, pointerCovers}

if (require.main === module) {
    const root = path.resolve(__dirname, '..', '..')
    const restMeta = path.join(root, 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'meta')
    const result = refreshLifecycleEvidenceInventory({root, restMeta})
    console.log(`lifecycle evidence inventory ${result.changed ? 'refreshed' : 'already current'}: sha256:${result.hash} (${result.elements} elements)`)
    if (!result.changed) process.exit(0)
}
