#!/usr/bin/env node
// Cross-track quantification: fragments (declared) vs upstream route skeletons
// (v2.6.26 / v3.0.5) vs live round results (milvus anchor / UAT). Feeds the
// version-track decision (pin-vs-branch vs dual-track) with per-operation
// evidence instead of prose.
//
// Usage: node cross-track.mjs --inventory <schema-inventory.json> \
//   --skeleton-2626 <skeleton-2626.json> --skeleton-305 <skeleton-305.json> \
//   [--milvus-results <results.json>] [--uat-results <results.json>] \
//   --out <cross-track.json> [--md <cross-track.md>]

import fs from "node:fs"
import path from "node:path"

function parseArgs(argv) {
  const a = {}
  for (let i = 2; i < argv.length; i++) if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[++i]
  return a
}
const args = parseArgs(process.argv)
const inv = JSON.parse(fs.readFileSync(args.inventory, "utf8"))
const sk26 = JSON.parse(fs.readFileSync(args["skeleton-2626"], "utf8"))
const sk30 = JSON.parse(fs.readFileSync(args["skeleton-305"], "utf8"))

const sk = (s) => new Set(s.operations.map((o) => `${o.method.toUpperCase()} /v2/vectordb${o.path.replace(/^\/v2\/vectordb/, "")}`))
const S26 = sk(sk26), S30 = sk(sk30)

function liveVerdicts(resultsFile) {
  if (!resultsFile) return null
  const r = JSON.parse(fs.readFileSync(resultsFile, "utf8"))
  const m = new Map()
  for (const x of r.results) m.set(x.id, x.verdict)
  return { map: m, suite: r.suite, counts: r.counts }
}
const L26 = liveVerdicts(args["milvus-results"])
const LU = liveVerdicts(args["uat-results"])

// case-id → op mapping: catalog ids are family.param; recover op from results
function opByCase(resultsFile) {
  if (!resultsFile) return new Map()
  const r = JSON.parse(fs.readFileSync(resultsFile, "utf8"))
  return new Map(r.results.map((x) => [x.id, x.op]))
}
const opM = opByCase(args["milvus-results"])

const rows = []
for (const op of inv.operations) {
  const key = `${op.method.toUpperCase()} ${op.path}`
  if (!op.path.startsWith("/v2/vectordb/")) continue // cloud-track handled separately
  const short = op.path.replace("/v2/vectordb", "")
  const caseIds = [...opM.entries()].filter(([, v]) => v.endsWith(short)).map(([k]) => k)
  const row = {
    op: key,
    summary: op.summary,
    declaredInFragments: true,
    inSkeleton2626: S26.has(key),
    inSkeleton305: S30.has(key),
    trackGuess: S26.has(key) && S30.has(key) ? "both" : S30.has(key) ? "3.0-only(+master)" : "2.6-only",
    liveMilvus: L26 && caseIds.length ? caseIds.map((c) => `${c}=${L26.map.get(c)}`).join("; ") : null,
    liveUat: LU && caseIds.length ? caseIds.map((c) => `${c}=${LU.map.get(c)}`).join("; ") : null,
  }
  rows.push(row)
}

const tally = {}
for (const r of rows) tally[r.trackGuess] = (tally[r.trackGuess] || 0) + 1

const out = {
  schemaVersion: 1,
  declaredOps: rows.length,
  trackGuessTally: tally,
  milvusSuite: L26 && L26.suite, uatSuite: LU && LU.suite,
  note: "trackGuess from upstream route skeletons only; live columns carry the observed verdicts from the latest round.",
  rows,
}
fs.mkdirSync(path.dirname(args.out), { recursive: true })
fs.writeFileSync(args.out, JSON.stringify(out, null, 1) + "\n")

if (args.md) {
  const lines = [
    "# Cross-track quantification (fragments vs v2.6.26 vs v3.0.5 vs live)",
    "",
    `Declared /v2/vectordb ops in fragments: **${rows.length}**; skeleton tally: ${JSON.stringify(tally)}`,
    "",
    "| Op | 2.6.26 | 3.0.5 | guess | live (milvus / uat) |",
    "|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.op} | ${r.inSkeleton2626 ? "✓" : "—"} | ${r.inSkeleton305 ? "✓" : "—"} | ${r.trackGuess} | ${r.liveMilvus || r.liveUat ? `${r.liveMilvus || "-"} / ${r.liveUat || "-"}` : "-"} |`),
  ]
  fs.writeFileSync(args.md, lines.join("\n") + "\n")
}
console.log(`cross-track: ${rows.length} declared ops; tally=${JSON.stringify(tally)}`)
