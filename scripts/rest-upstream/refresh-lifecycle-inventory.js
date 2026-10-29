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

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const LIFECYCLE_KEYS = ['x-added-at', 'x-last-modified', 'x-deprecated-since']

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

function refreshLifecycleEvidenceInventory({root, restMeta, evidenceFile = 'milvus-2.6.x-bootstrap.json'}) {
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

    // Element drift is a real contract change, never an inventory refresh:
    // list it and stop (a refresh that lands lifecycle writes needs the
    // evidence elements reviewed and updated by a human in the PR).
    const drifts = []
    const expected = new Map(evidence.elements.map(row => [`${row.fragment}:${row.jsonPointer}`, row.lifecycle]))
    for (const [key, lifecycle] of expected) {
        const actual = observed.get(key)
        if (JSON.stringify(actual) !== JSON.stringify(lifecycle)) {
            drifts.push(`${key}: evidence ${JSON.stringify(lifecycle)} vs fragments ${JSON.stringify(actual ?? null)}`)
        }
    }
    for (const key of observed.keys()) {
        if (!expected.has(key)) drifts.push(`${key}: lifecycle element present in fragments but absent from the evidence`)
    }
    if (drifts.length > 0) {
        throw new Error(`REST_UPSTREAM_LIFECYCLE_ELEMENT_DRIFT: ${drifts.length} lifecycle value drift(s) between the evidence and the fragments (refresh them in review, do not re-hash):\n  ${drifts.slice(0, 10).join('\n  ')}`)
    }

    const nextHash = inventoryHash.digest('hex')
    if (evidence.reproducibility.fragmentInventorySha256 === nextHash) {
        return {changed: false, hash: nextHash, elements: observed.size}
    }
    evidence.reproducibility.fragmentInventorySha256 = nextHash
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`)
    return {changed: true, hash: nextHash, elements: observed.size}
}

module.exports = {refreshLifecycleEvidenceInventory, collect}

if (require.main === module) {
    const root = path.resolve(__dirname, '..', '..')
    const restMeta = path.join(root, 'packages', 'docs-tooling', 'src', 'reference', 'rest', 'meta')
    const result = refreshLifecycleEvidenceInventory({root, restMeta})
    console.log(`lifecycle evidence inventory ${result.changed ? 'refreshed' : 'already current'}: sha256:${result.hash} (${result.elements} elements)`)
    if (!result.changed) process.exit(0)
}
