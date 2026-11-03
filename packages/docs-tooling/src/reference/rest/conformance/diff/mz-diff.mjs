#!/usr/bin/env node
// M/Z incompatibility diff: compare a milvus-suite round against a
// uat-dataplane round (same shared catalog) and emit the interface+parameter
// level incompatibility list that the REST reference pages need.
//
// Usage: node mz-diff.mjs --milvus <results.json> --uat <results.json> \
//          --out <report.json> [--md <report.md>]

import fs from "node:fs"
import path from "node:path"

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[++i]
  return args
}

const args = parseArgs(process.argv)
const milvus = JSON.parse(fs.readFileSync(args.milvus, "utf8"))
const uat = JSON.parse(fs.readFileSync(args.uat, "utf8"))

const idx = (r) => {
  const m = new Map()
  for (const x of r.results) m.set(x.id, x)
  return m
}
const M = idx(milvus), U = idx(uat)

const BAD = new Set(["FAIL", "NO-EFFECT"])
const verdictRank = { "PASS-EFFECT": 3, PASS: 3, RECORDED: 2, "REJECTED(record)": 2, REJECTED: 2, "FAIL": 1, "NO-EFFECT": 1 }
const accepted = (v) => v === "PASS" || v === "PASS-EFFECT" || v === "RECORDED" || v === "REJECTED(record)" && false
const accept = (v) => ["PASS", "PASS-EFFECT", "RECORDED"].includes(v)

const rows = []
for (const [id, m] of M) {
  const u = U.get(id)
  if (!u) continue
  const cats = []
  const mAcc = accept(m.verdict), uAcc = accept(u.verdict)
  if (mAcc !== uAcc) cats.push("acceptance-diff")
  if (m.verdict === "REJECTED" && u.verdict === "REJECTED") {
    // both reject — fine
  }
  if ((m.verdict === "PASS-EFFECT") !== (u.verdict === "PASS-EFFECT")) cats.push("effect-diff")
  if ((m.goldenDiffs || []).length !== (u.goldenDiffs || []).length && (u.goldenDiffs || []).length) cats.push("shape-diff")
  if (cats.length) {
    rows.push({
      id, family: m.family, op: m.op, param: m.param, intent: m.intent,
      categories: cats,
      milvus: { verdict: m.verdict, code: m.code, msg: m.msg, effect: m.effect },
      uat: { verdict: u.verdict, code: u.code, msg: u.msg, effect: u.effect, goldenDiffs: u.goldenDiffs },
    })
  }
}

const byCat = {}
for (const r of rows) for (const c of r.categories) byCat[c] = (byCat[c] || 0) + 1

const report = {
  schemaVersion: 1,
  milvusSuite: milvus.suite, uatSuite: uat.suite,
  comparedCases: [...M.keys()].filter((k) => U.has(k)).length,
  incompatibilities: rows.length,
  byCategory: byCat,
  note: "acceptance-diff = one side accepts (code 0) while the other rejects; effect-diff = accepted on both but observable behavior differs; shape-diff = response shape deviates from the frozen milvus golden.",
  rows,
}
fs.mkdirSync(path.dirname(args.out), { recursive: true })
fs.writeFileSync(args.out, JSON.stringify(report, null, 1) + "\n")

if (args.md) {
  const lines = [
    `# M/Z incompatibility report — ${milvus.suite} vs ${uat.suite}`,
    "",
    `Compared ${report.comparedCases} cases; **${rows.length} incompatibilities** (${JSON.stringify(byCat)}).`,
    "",
    "| Case | Category | Milvus | UAT | Detail |",
    "|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${r.categories.join(",")} | ${r.milvus.verdict} | ${r.uat.verdict} | ${String(r.uat.msg || r.milvus.msg || "").slice(0, 80)} |`),
  ]
  fs.writeFileSync(args.md, lines.join("\n") + "\n")
}
console.log(`mz-diff: ${rows.length} incompatibilities (${JSON.stringify(byCat)}) out of ${report.comparedCases} compared`)
