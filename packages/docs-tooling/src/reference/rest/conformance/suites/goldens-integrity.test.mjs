// Golden policy gate: frozen goldens must be ACCEPTED responses only.
// A golden whose envelope carries code!==0 (a rejection) pins error text that
// drifts across versions and products — that belongs in round results, not in
// goldens/. Hermetic: parses every committed golden and cross-checks it
// against the suite catalog.
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SUITES_DIR = path.dirname(HERE)

process.env.ZILLIZ_UAT3_PROJECT ||= "proj-conformance-stub"

const stubCall = async () => ({ http: 0, code: 0, msg: "", data: null, json: null })

const SUITES = ["milvus-2.6.26", "milvus-3.0.5", "uat-dataplane", "uat-controlplane"]

for (const suite of SUITES) {
  test(`suite ${suite}: goldens are accepted responses for known cases`, async () => {
    const dir = path.join(SUITES_DIR, suite)
    const goldenDir = path.join(dir, "goldens")
    if (!fs.existsSync(goldenDir)) return // suite without frozen goldens yet

    const config = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf8"))
    const mod = await import(path.join(dir, "cases.mjs"))
    const s = mod.default({ prefix: config.prefix, dim: config.dim, projectEnv: config.projectEnv }, stubCall)
    const caseById = new Map()
    for (const c of [...(s.setupCases || []), ...(s.cases || [])]) caseById.set(c.id, c)

    const files = fs.readdirSync(goldenDir).filter((f) => f.endsWith(".json"))
    assert.ok(files.length > 0, `${suite}: goldens dir exists but is empty`)
    for (const f of files) {
      const gid = f.slice(0, -5)
      const phaseSep = gid.indexOf(".")
      const caseId = gid.slice(phaseSep + 1)
      const c = caseById.get(caseId)
      assert.ok(c, `${suite}/${f}: no catalog case '${caseId}' — stale golden from a renamed or removed case`)
      assert.notEqual(c.expect, "err", `${suite}/${f}: negative cases (expect=err) must not carry goldens`)
      const env = JSON.parse(fs.readFileSync(path.join(goldenDir, f), "utf8"))
      assert.ok(env && typeof env === "object", `${suite}/${f}: golden must be a JSON object`)
      assert.equal(env.code, 0, `${suite}/${f}: golden envelope code must be 0 (accepted response) — rejection envelopes belong in round results, not goldens`)
    }
  })
}
