// Contract test for schema verification: declared-vs-observed field verdicts
// (corroborated / type-mismatch / declared-not-observed / observed-undeclared /
// enum-conflict) and request-side required evidence, on synthetic inputs.
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))

function runNode(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args)
    let stdout = "", stderr = ""
    child.stdout.on("data", (c) => { stdout += c })
    child.stderr.on("data", (c) => { stderr += c })
    child.on("close", (status) => resolve({ status, stdout, stderr }))
  })
}

test("schema-verify: field verdicts and required evidence on synthetic suite", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "schemaverify-"))
  const suiteDir = path.join(tmp, "stub-suite")
  fs.mkdirSync(path.join(suiteDir, "goldens"), { recursive: true })

  // inventory declares an op whose response schema mismatches the golden in
  // four ways + one corroborated field, plus a success example that
  // contradicts the schema (string where integer is declared) and shows a
  // field the schema never declares — and a second op whose golden payload
  // is empty (data === {}), which must NOT be flagged undocumented: there is
  // no structure to document, the envelope declaration is already complete.
  const inv = path.join(tmp, "inv.json")
  fs.writeFileSync(inv, JSON.stringify({
    operations: [
      {
        fragment: "f", path: "/v2/vectordb/echo", method: "post", summary: "s",
        response: {
          shape: { type: "object", properties: {
            code: { type: "integer" },
            data: { type: "object", properties: {
              insertCount: { type: "integer" },
              missingField: { type: "string" },
              wrongType: { type: "boolean" },
              color: { type: "string", enum: ["red", "green"] },
              extra: { type: "string" },
            }, required: ["insertCount"] },
          } },
          examples: [{ key: "1", summary: "success", value: { code: 0, data: { insertCount: "one", exampleExtra: "e" } } }],
        },
      },
      {
        fragment: "f", path: "/v2/vectordb/flush", method: "post", summary: "s",
        response: { shape: { type: "object", properties: {
          code: { type: "integer" },
          data: { type: "object", properties: {} },
        } } },
      },
      {
        fragment: "f", path: "/v2/vectordb/search", method: "post", summary: "s",
        response: { shape: { type: "object", properties: {
          code: { type: "integer" },
          data: { type: "array", items: {
            type: "object",
            additionalProperties: true,
            properties: {
              id: { oneOf: [{ type: "integer" }, { type: "string" }] },
              distance: { type: "number" },
            },
          } },
        } } },
      },
    ],
  }))

  fs.writeFileSync(path.join(suiteDir, "config.json"), JSON.stringify({ name: "stub", prefix: "t", auth: { mode: "none" }, volatileFields: [] }))
  fs.writeFileSync(path.join(suiteDir, "cases.mjs"), `
export default (ctx, call) => ({
  h: {},
  prepare: async () => {},
  setupCases: [],
  finalize: async () => {},
  cases: [
    { id: "pos.echo", family: "pos", op: "/echo", kind: "positive", expect: "ok", param: "p", intent: "i", body: {} },
    { id: "pos.flush", family: "pos", op: "/flush", kind: "positive", expect: "ok", param: "p", intent: "i", body: {} },
    { id: "pos.search", family: "pos", op: "/search", kind: "positive", expect: "ok", param: "p", intent: "i", body: {} },
    { id: "neg.req", family: "neg", op: "/echo", kind: "negative", expect: "err", param: "required probe", intent: "i", body: {} },
    { id: "ghost.id", family: "ghost", op: "/echo", kind: "ghost", expect: "record", param: "id(only)", intent: "i", body: {} },
  ],
})
`)
  // golden: data has insertCount(number ✓), color "blue" (enum ✗), surprise
  // field (observed-undeclared); missingField/wrongType declared but absent →
  // declared-not-observed + type can't mismatch when absent
  fs.writeFileSync(path.join(suiteDir, "goldens", "case.pos.echo.json"), JSON.stringify({
    code: 0, data: { insertCount: 1, color: "blue", surprise: "x" },
  }))
  fs.writeFileSync(path.join(suiteDir, "goldens", "case.pos.flush.json"), JSON.stringify({
    code: 0, data: {},
  }))
  // search item: id is a union-typed PK (observed number — oneOf accepts it),
  // distance corroborates, color is a collection output field under
  // additionalProperties → dynamic-corroborated, never a conflict
  fs.writeFileSync(path.join(suiteDir, "goldens", "case.pos.search.json"), JSON.stringify({
    code: 0, data: [{ id: 8, distance: 1, color: "red" }],
  }))
  const results = path.join(tmp, "r.json")
  fs.writeFileSync(results, JSON.stringify({
    suite: "stub", counts: {}, results: [
      { id: "case.neg.req", family: "neg", op: "/echo", verdict: "REJECTED", code: 1, msg: "missing required Filter" },
      { id: "case.ghost.id", family: "ghost", op: "/echo", verdict: "RECORDED", code: 0, msg: "", effect: "id ignored" },
    ],
  }))

  const out = path.join(tmp, "report.json"), md = path.join(tmp, "report.md")
  const r = await runNode([path.join(HERE, "schema-verify.mjs"), "--inventory", inv, "--suite", suiteDir, "--results", results, "--out", out, "--md", md])
  assert.equal(r.status, 0, r.stderr)
  const report = JSON.parse(fs.readFileSync(out, "utf8"))
  const byVerdict = (v) => report.operations[0].verdicts.filter((x) => x.verdict === v)
  assert.ok(byVerdict("corroborated").some((x) => x.path.endsWith("insertCount")))
  assert.ok(byVerdict("enum-conflict").some((x) => x.path.endsWith("color") && x.sample === "blue"))
  assert.ok(byVerdict("declared-not-observed").some((x) => x.path.endsWith("missingField")))
  assert.ok(byVerdict("observed-undeclared").some((x) => x.path.endsWith("surprise")))
  // wrongType declared boolean: absent in golden → declared-not-observed (no type mismatch possible)
  assert.ok(byVerdict("declared-not-observed").some((x) => x.path.endsWith("wrongType")))
  assert.ok(report.requestEvidence.find((x) => x.caseId === "case.neg.req" && x.verdict === "required-corroborated"))
  assert.ok(report.requestEvidence.find((x) => x.caseId === "case.ghost.id" && x.verdict === "ghost-observed"))
  assert.ok(fs.existsSync(md))
  assert.match(fs.readFileSync(md, "utf8"), /Conflicts/)

  // empty observed payload (data === {}) must not fire the undocumented
  // verdict — envelope-only declaration is already complete for it
  const flushOp = report.operations.find((op) => op.op.endsWith("/flush"))
  assert.ok(flushOp, "flush op verified")
  assert.ok(!flushOp.verdicts.some((v) => v.verdict === "response-structure-undocumented"))

  // example-vs-schema cross-check: the success example contradicts the
  // declared types and shows a field the schema never declares
  assert.ok(byVerdict("example-type-mismatch").some((x) => x.path.endsWith("insertCount") && x.declared === "number" && x.exampleObserved === "string"))
  assert.ok(byVerdict("example-undeclared").some((x) => x.path.endsWith("exampleExtra")))

  // search op: union-typed PK id accepts the observed number, and keys under
  // the additionalProperties items object are dynamic, not conflicts
  const searchOp = report.operations.find((op) => op.op.endsWith("/search"))
  assert.ok(searchOp, "search op verified")
  assert.ok(searchOp.verdicts.some((v) => v.path === "$.data[].id" && v.verdict === "corroborated" && v.observed === "number"))
  assert.ok(searchOp.verdicts.some((v) => v.path === "$.data[].distance" && v.verdict === "corroborated"))
  assert.ok(searchOp.verdicts.some((v) => v.path === "$.data[].color" && v.verdict === "dynamic-corroborated"))
  assert.ok(!searchOp.verdicts.some((v) => v.verdict === "observed-undeclared"))
  assert.ok(!searchOp.verdicts.some((v) => v.verdict === "response-structure-undocumented"))
})
