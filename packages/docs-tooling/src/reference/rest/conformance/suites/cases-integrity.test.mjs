// Integrity gate for the conformance suites: every case must resolve to a
// declared fragment operation, have a serializable body, unique ids, and only
// reference overrides that exist. Hermetic — no network.
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const CONFORMANCE = path.dirname(HERE)

const inventory = JSON.parse(fs.readFileSync(path.join(CONFORMANCE, "inventory", "schema-inventory.json"), "utf8"))
const declared = new Set(inventory.operations.map((o) => `${o.method.toUpperCase()} ${o.path}`))

const stubCall = async () => ({ http: 0, code: 0, msg: "", data: null, json: null })
process.env.ZILLIZ_UAT3_PROJECT ||= "proj-conformance-stub"

const DATAPLANE_SUITES = ["milvus-2.6.26", "milvus-3.0.5", "uat-dataplane"]
const CONTROL_SUITES = ["uat-controlplane"]

for (const suite of [...DATAPLANE_SUITES, ...CONTROL_SUITES]) {
  test(`suite ${suite}: cases resolve, bodies serialize, overrides exist`, async () => {
    const dir = path.join(CONFORMANCE, "suites", suite)
    const config = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"))
    assert.ok(config.name === suite)
    assert.ok(config.auth, "auth profile declared")

    const mod = await import(path.join(dir, "cases.mjs"))
    const s = mod.default({ prefix: config.prefix, dim: config.dim, projectEnv: config.projectEnv }, stubCall)
    const all = [...(s.setupCases || []), ...(s.cases || [])]

    const ids = new Set()
    for (const c of all) {
      assert.ok(!ids.has(c.id), `duplicate case id ${c.id} in ${suite}`)
      ids.add(c.id)
      assert.ok(c.expect === "ok" || c.expect === "err" || c.expect === "record", `${c.id}: bad expect`)
      assert.ok(c.intent, `${c.id}: intent required`)
      if (c.op !== "skip-request") {
        const short = c.op.startsWith("/v1/") || c.op.startsWith("/v2/") ? c.op : "/v2/vectordb" + c.op
        if (!c.op.endsWith("/{CLUSTER_ID}") && !c.op.includes("?")) {
          assert.ok(declared.has(`POST ${short}`) || declared.has(`GET ${short}`),
            `${c.id}: op ${short} not declared in any fragment`)
        }
      }
      if (typeof c.body === "function") {
        const b = await c.body(s.h)
        assert.ok(b !== undefined && JSON.stringify(b) !== undefined, `${c.id}: body not serializable`)
      }
    }
    // setup cases precede main cases and only setup cases are critical
    if (s.setupCases) for (const c of s.setupCases) assert.equal(c.kind, "setup", `${c.id}: setupCases must be kind=setup`)
    if (s.cases) for (const c of s.cases) assert.notEqual(c.kind, "setup", `${c.id}: main case marked setup`)

    // overrides reference real cases
    const overrides = JSON.parse(fs.readFileSync(path.join(dir, "overrides.json"), "utf8"))
    for (const id of Object.keys(overrides)) assert.ok(ids.has(id), `${suite}: override references unknown case ${id}`)
  })
}
