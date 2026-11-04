// Golden contract for the diff tools: verdict/effect/shape categories and the
// cross-track tally, on synthetic inputs. Hermetic.
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))

function writeResults(file, suite, results) {
  fs.writeFileSync(file, JSON.stringify({ base: "x", suite, startedAt: "t", durationMs: 1, counts: {}, results }))
}

test("mz-diff: acceptance/effect/shape categories on synthetic rounds", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mzdiff-"))
  const mv = path.join(tmp, "mv.json"), ua = path.join(tmp, "ua.json"), out = path.join(tmp, "diff.json")
  writeResults(mv, "milvus-2.6.26", [
    { id: "case.a", family: "f", op: "/a", verdict: "PASS-EFFECT", code: 0, msg: "" },
    { id: "case.b", family: "f", op: "/b", verdict: "REJECTED", code: 1, msg: "milvus rejects" },
    { id: "case.c", family: "f", op: "/c", verdict: "PASS-EFFECT", code: 0, msg: "" },
  ])
  writeResults(ua, "uat-dataplane", [
    { id: "case.a", family: "f", op: "/a", verdict: "REJECTED", code: 1800, msg: "uat rejects" },
    { id: "case.b", family: "f", op: "/b", verdict: "PASS-EFFECT", code: 0, msg: "" },
    { id: "case.c", family: "f", op: "/c", verdict: "NO-EFFECT", code: 0, msg: "" },
  ])
  const r = spawnSync(process.execPath, [path.join(HERE, "mz-diff.mjs"), "--milvus", mv, "--uat", ua, "--out", out], { encoding: "utf8" })
  assert.equal(r.status, 0, r.stderr)
  const report = JSON.parse(fs.readFileSync(out, "utf8"))
  assert.equal(report.incompatibilities, 3)
  assert.ok(report.rows.find((x) => x.id === "case.a" && x.categories.includes("acceptance-diff")))
  assert.ok(report.rows.find((x) => x.id === "case.b" && x.categories.includes("acceptance-diff")))
  assert.ok(report.rows.find((x) => x.id === "case.c" && x.categories.includes("effect-diff")))
})

test("cross-track: skeleton tally and live verdict attachment", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "xtrack-"))
  const inv = path.join(tmp, "inv.json")
  fs.writeFileSync(inv, JSON.stringify({
    operations: [
      { fragment: "f", path: "/v2/vectordb/entities/search", method: "post", summary: "s" },
      { fragment: "f", path: "/v2/vectordb/snapshots/create", method: "post", summary: "s" },
    ],
  }))
  const sk = (ops) => JSON.stringify({ operations: ops.map((p) => ({ method: "post", path: p })) })
  const s26 = path.join(tmp, "s26.json"); fs.writeFileSync(s26, sk(["/v2/vectordb/entities/search"]))
  const s30 = path.join(tmp, "s30.json"); fs.writeFileSync(s30, sk(["/v2/vectordb/entities/search", "/v2/vectordb/snapshots/create"]))
  const mv = path.join(tmp, "mv.json")
  writeResults(mv, "milvus-2.6.26", [{ id: "case.search.x", family: "search", op: "/entities/search", verdict: "PASS-EFFECT", code: 0, msg: "" }])
  const out = path.join(tmp, "x.json")
  const r = spawnSync(process.execPath, [path.join(HERE, "cross-track.mjs"), "--inventory", inv, "--skeleton-2626", s26, "--skeleton-305", s30, "--milvus-results", mv, "--out", out], { encoding: "utf8" })
  assert.equal(r.status, 0, r.stderr)
  const report = JSON.parse(fs.readFileSync(out, "utf8"))
  assert.equal(report.declaredOps, 2)
  const search = report.rows.find((x) => x.op === "POST /v2/vectordb/entities/search")
  const snap = report.rows.find((x) => x.op === "POST /v2/vectordb/snapshots/create")
  assert.equal(search.trackGuess, "both")
  assert.equal(snap.trackGuess, "3.0-only(+master)")
  assert.match(search.liveMilvus, /PASS-EFFECT/)
})
