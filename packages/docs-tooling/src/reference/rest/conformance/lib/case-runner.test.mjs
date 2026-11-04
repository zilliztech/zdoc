// Contract test for the generic case runner: stub HTTP server + stub suite,
// exercising plain/capture/verify modes, effects, ghost handling, critical
// setup failure, and golden shape drift detection. No network, no credentials.
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import http from "node:http"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const RUNNER = path.join(HERE, "case-runner.mjs")

// Async spawn: the stub HTTP server lives in THIS process, so the parent event
// loop must stay free while the child runner talks to it (spawnSync deadlocks).
function runNode(args, env = process.env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { env })
    let stdout = "", stderr = ""
    child.stdout.on("data", (c) => { stdout += c })
    child.stderr.on("data", (c) => { stderr += c })
    child.on("close", (status) => resolve({ status, stdout, stderr }))
  })
}

function startServer(state) {
  const server = http.createServer((req, res) => {
    let body = ""
    req.on("data", (c) => { body += c })
    req.on("end", () => {
      state.requests.push({ url: req.url, body: body ? JSON.parse(body) : null })
      if (req.url === "/v2/vectordb/echo") {
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({ code: 0, cost: 3, data: { insertCount: 1, note: state.note } }))
      } else if (req.url === "/v2/vectordb/bad") {
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({ code: 1, message: "business reject" }))
      } else if (req.url === "/v2/vectordb/list") {
        res.setHeader("content-type", "application/json")
        res.end(JSON.stringify({ code: 0, data: { has: state.has } }))
      } else {
        res.statusCode = 404
        res.end(JSON.stringify({ code: 1800, message: "route absent" }))
      }
    })
  })
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)))
}

function writeSuite(dir) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify({
    name: "stub", track: "stub", anchor: "t", prefix: "t",
    auth: { mode: "none" }, volatileFields: ["cost"],
  }))
  fs.writeFileSync(path.join(dir, "cases.mjs"), `
export default (ctx, call) => ({
  h: {},
  prepare: async () => {},
  setupCases: [{
    id: "s.echo", family: "setup", op: "/echo", kind: "setup", critical: true,
    expect: "record", param: "p", intent: "setup sanity", body: {},
  }],
  finalize: async () => {},
  cases: [
    {
      id: "pos.echo", family: "pos", op: "/echo", kind: "positive", expect: "ok",
      param: "p", intent: "accepted with effect",
      body: { a: 1 },
      effect: async (hh) => {
        const r = await call("/list")
        return { ok: r.data && r.data.has === true, detail: "has=" + JSON.stringify(r.data) }
      },
    },
    { id: "neg.bad", family: "neg", op: "/bad", kind: "negative", expect: "err", param: "p", intent: "rejected", body: {} },
    { id: "ghost.absent", family: "ghost", op: "/absent", kind: "ghost", expect: "record", param: "p", intent: "route absent => REJECTED(record)", body: {} },
  ],
})
`)
}

test("case-runner contract: plain, capture, verify, golden drift, critical failure", async (t) => {
  const state = { has: true, note: "v1", requests: [] }
  const server = await startServer(state)
  t.after(() => server.close())
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "case-runner-test-"))
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }))
  const suiteDir = path.join(tmp, "stub-suite")
  writeSuite(suiteDir)

  const run = (extra) => runNode([RUNNER, "--suite", suiteDir, "--base-url", base, ...extra])

  // plain
  let r = await run(["--out", path.join(tmp, "plain.json")])
  assert.equal(r.status, 0, r.stderr)
  let results = JSON.parse(fs.readFileSync(path.join(tmp, "plain.json"), "utf8"))
  assert.equal(results.counts["PASS-EFFECT"], 1) // pos.echo (effect ok)
  assert.equal(results.counts.REJECTED, 1) // neg.bad
  assert.equal(results.counts["REJECTED(record)"], 1) // ghost.absent (route 404)
  assert.equal(results.counts.RECORDED, 1) // setup

  // capture freezes goldens (volatile cost stripped)
  r = await run(["--mode", "capture", "--out", path.join(tmp, "cap.json")])
  assert.equal(r.status, 0, r.stderr)
  const golden = JSON.parse(fs.readFileSync(path.join(suiteDir, "goldens", "case.pos.echo.json"), "utf8"))
  assert.deepEqual(golden, { code: 0, data: { insertCount: 1, note: "v1" } })
  assert.ok(!("cost" in golden), "volatile field stripped")

  // verify passes when the server matches the golden shape
  r = await run(["--mode", "verify", "--out", path.join(tmp, "ver1.json")])
  assert.equal(r.status, 0, r.stderr)
  results = JSON.parse(fs.readFileSync(path.join(tmp, "ver1.json"), "utf8"))
  assert.ok(!results.results.some((x) => x.goldenDiffs), "no golden diffs while shape matches")

  // shape drift (note removed) is detected, not silently accepted
  state.note = undefined
  state.has = false // also flips the effect
  r = await run(["--mode", "verify", "--out", path.join(tmp, "ver2.json")])
  assert.equal(r.status, 0)
  results = JSON.parse(fs.readFileSync(path.join(tmp, "ver2.json"), "utf8"))
  const pos = results.results.find((x) => x.id === "case.pos.echo")
  assert.ok(pos.goldenDiffs && pos.goldenDiffs.some((d) => d.path === "$.data.note"), "golden drift detected")
  assert.equal(pos.verdict, "NO-EFFECT", "effect flip reported")

  // critical setup failure aborts the round
  const broken = path.join(tmp, "broken-suite")
  writeSuite(broken)
  const brokenCases = path.join(broken, "cases.mjs")
  fs.writeFileSync(brokenCases, fs.readFileSync(brokenCases, "utf8").replace('op: "/echo", kind: "setup"', 'op: "/absent", kind: "setup"'))
  r = await runNode([RUNNER, "--suite", broken, "--base-url", base, "--out", path.join(tmp, "broken.json")])
  assert.equal(r.status, 1, "critical setup failure exits non-zero")
  assert.ok(r.stderr.includes("FATAL"))
})

test("case-runner auth: bearer env is read, never printed", async (t) => {
  const state = { has: true, note: "x", requests: [] }
  const server = await startServer(state)
  t.after(() => server.close())
  const port = server.address().port
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "case-runner-auth-"))
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }))
  const suiteDir = path.join(tmp, "stub-suite")
  writeSuite(suiteDir)
  fs.writeFileSync(path.join(suiteDir, "config.json"), JSON.stringify({
    name: "stub", prefix: "t", auth: { mode: "bearer", env: "STUB_KEY" }, volatileFields: [],
  }))
  const out = path.join(tmp, "r.json")
  const r = await runNode([RUNNER, "--suite", suiteDir, "--base-url", `http://127.0.0.1:${port}`, "--out", out], {
    ...process.env, STUB_KEY: "supersecret123",
  })
  assert.equal(r.status, 0, r.stderr)
  assert.ok(state.requests.every((q) => q.url), "requests recorded")
  assert.ok(!r.stdout.includes("supersecret123") && !r.stderr.includes("supersecret123"), "key never printed")
})
