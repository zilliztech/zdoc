#!/usr/bin/env node
// Generic conformance case executor for REST reference live-verification suites.
//
// Usage:
//   node case-runner.mjs --suite <dir> --base-url <url> \
//     [--mode plain|capture|verify] [--out <results.json>] \
//     [--auth-env <VAR>] [--filter <substring|family=x>] [--volatiles cost]
//
// Modes:
//   plain    run cases, record verdicts only
//   capture  run cases + freeze golden response shapes under <suite>/goldens/
//   verify   run cases + compare shapes against frozen goldens (no rewrite)
//
// Auth: config.json auth {mode:"none"} or {mode:"bearer", env:"VAR"}; the
// credential is read from the environment and never printed or persisted.

import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--")) args[a.slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith("--") ? true : argv[++i]
  }
  return args
}

const args = parseArgs(process.argv)
const suiteDir = path.resolve(args.suite)
const config = JSON.parse(fs.readFileSync(path.join(suiteDir, "config.json"), "utf8"))
const mod = await import(pathToFileURL(path.join(suiteDir, "cases.mjs")).href)

const BASE = (args["base-url"] || config.baseUrl || "").replace(/\/+$/, "")
const MODE = args.mode || "plain"
const OUT = args.out ? path.resolve(args.out) : null
const FILTER = args.filter || null
const VOLATILES = new Set(String(args.volatiles || config.volatileFields || "cost").split(",").filter(Boolean))

if (!BASE) { console.error("--base-url required (or config.baseUrl)"); process.exit(2) }
if (MODE !== "plain" && !OUT) { console.error(`--out required for mode=${MODE}`); process.exit(2) }

const auth = config.auth || { mode: "none" }
let authHeaders = {}
if (auth.mode === "bearer") {
  const key = process.env[auth.env]
  if (!key) { console.error(`auth.env ${auth.env} not set in environment`); process.exit(2) }
  authHeaders = { Authorization: `Bearer ${key}` }
}

const redact = (s) => {
  let out = String(s)
  if (auth.mode === "bearer" && process.env[auth.env]) out = out.split(process.env[auth.env]).join("***")
  return out
}

const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])

async function callMethod(method, urlPath, body) {
  const url = BASE + urlPath
  let http = 0, json = null, err = null
  try {
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
    })
    http = r.status
    json = await r.json().catch(() => null)
  } catch (e) {
    err = String((e && e.message) || e)
  }
  const code = json ? json.code : undefined
  const msg = json ? (json.message ?? json.msg ?? "") : (err || `http ${http}`)
  return { http, code, msg, data: json ? json.data : undefined, json }
}

// Universal call: call(method, path, body) for explicit verbs, call(path, body)
// for the default POST; dataplane-relative ops get the /v2/vectordb prefix.
function call(a, b, c) {
  if (HTTP_METHODS.has(a)) return callMethod(a, b, c)
  const abs = a.startsWith("/v1/") || a.startsWith("/v2/") ? a : "/v2/vectordb" + a
  return callMethod("POST", abs, b)
}

function stripVolatile(x) {
  if (Array.isArray(x)) return x.map(stripVolatile)
  if (x && typeof x === "object") {
    const out = {}
    for (const [k, v] of Object.entries(x)) {
      if (VOLATILES.has(k)) continue
      out[k] = stripVolatile(v)
    }
    return out
  }
  return x
}

const typeOf = (v) =>
  v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "object" ? "object" : typeof v

function compareShape(golden, actual, p = "$", out = []) {
  const tg = typeOf(golden), ta = typeOf(actual)
  if (tg !== ta) { out.push({ path: p, golden: tg, actual: ta }); return out }
  if (tg === "object") {
    const keys = new Set([...Object.keys(golden), ...Object.keys(actual)])
    for (const k of keys) {
      if (!(k in golden)) out.push({ path: `${p}.${k}`, golden: "<absent>", actual: typeOf(actual[k]) })
      else if (!(k in actual)) out.push({ path: `${p}.${k}`, golden: typeOf(golden[k]), actual: "<absent>" })
      else compareShape(golden[k], actual[k], `${p}.${k}`, out)
    }
  } else if (tg === "array") {
    if (golden.length && actual.length) compareShape(golden[0], actual[0], `${p}[0]`, out)
  }
  return out
}

// ---------- run ----------
const results = []
const goldenRoot = path.join(suiteDir, "goldens")
if (MODE === "capture") fs.mkdirSync(goldenRoot, { recursive: true })
let seq = 0
let fatal = null

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function runCase(c, phase) {
  const id = `${phase}.${c.id}`
  const body = typeof c.body === "function" ? await c.body(suite.h) : c.body
  const useCall = c.method && c.method !== "POST"
    ? (p, b) => callMethod(c.method, p, b)
    : call
  const target = typeof c.url === "function" ? c.url(suite.h) : c.op
  const res = c.op === "skip-request"
    ? { http: 0, code: 0, msg: "", data: null, json: null }
    : await useCall(target, body)
  let effect = null
  if (typeof c.poll === "function") {
    try { effect = await c.poll(suite.h, res) }
    catch (e) { effect = { ok: false, detail: "poll-error: " + ((e && e.message) || e) } }
  } else if (typeof c.effect === "function") {
    try {
      effect = await c.effect(suite.h, res)
      for (let t = 0; t < 3 && effect && !effect.ok; t++) { await sleep(500); effect = await c.effect(suite.h, res) }
    } catch (e) { effect = { ok: false, detail: "effect-error: " + ((e && e.message) || e) } }
  }

  let verdict
  if (c.expect === "err") verdict = res.code === undefined || res.code !== 0 ? "REJECTED" : "FAIL"
  else if (c.expect === "ok" || c.expect === "record") {
    if (res.code === 0) verdict = effect ? (effect.ok ? "PASS-EFFECT" : "NO-EFFECT") : (c.expect === "record" ? "RECORDED" : "PASS")
    else verdict = c.expect === "record" ? "REJECTED(record)" : "FAIL"
  } else verdict = "??"

  let goldenDiff = null
  const goldenFile = path.join(goldenRoot, `${id}.json`)
  // Golden policy: only ACCEPTED responses (envelope code===0) are frozen.
  // Rejection envelopes are just {code, message} — no shape value, and they
  // would pin error text that drifts across versions/products.
  const accepted = res.json !== null && typeof res.json === "object" && res.json.code === 0
  if (MODE === "capture" && phase !== "setup" && accepted) {
    fs.writeFileSync(goldenFile, JSON.stringify(stripVolatile(res.json), null, 1))
  } else if (MODE === "capture" && phase !== "setup" && !accepted && fs.existsSync(goldenFile)) {
    fs.unlinkSync(goldenFile) // re-capture: a previously accepted case now rejects — drop its stale golden
  } else if (MODE === "verify" && phase !== "setup" && accepted && fs.existsSync(goldenFile)) {
    goldenDiff = compareShape(JSON.parse(fs.readFileSync(goldenFile, "utf8")), stripVolatile(res.json))
  }

  results.push({
    id, family: c.family, op: c.op, param: c.param, intent: c.intent, kind: c.kind,
    expect: c.expect, verdict, code: res.code, http: res.http,
    msg: redact(String(res.msg || "")).slice(0, 220),
    effect: effect ? effect.detail : undefined,
    goldenDiffs: goldenDiff && goldenDiff.length ? goldenDiff : undefined,
  })

  const mark = { "PASS-EFFECT": "✓", PASS: "✓", REJECTED: "·", "REJECTED(record)": "·", RECORDED: "·", FAIL: "✗", "NO-EFFECT": "⚠" }[verdict] || "?"
  const showMsg = verdict !== "PASS" && verdict !== "PASS-EFFECT"
  console.log(`${mark} ${id} — ${verdict}${effect && effect.detail ? " | " + effect.detail : ""}${showMsg ? " | " + redact(String(res.msg)).slice(0, 140) : ""}`)

  // Critical (setup) discipline: business rejections (already-exists etc.) are
  // tolerated for expect=record, but route-absent / not-accepted outcomes abort
  // the round — the suite cannot run on a broken fixture world.
  const criticalBroken =
    (c.critical && ["FAIL", "NO-EFFECT", "??"].includes(verdict)) ||
    (c.critical && c.expect === "ok" && !["PASS", "PASS-EFFECT"].includes(verdict)) ||
    (c.critical && c.expect === "record" && verdict === "REJECTED(record)")
  if (criticalBroken) fatal = `critical setup case failed: ${id} verdict=${verdict}`
}

const t0 = Date.now()
console.log(`# conformance suite ${config.name} — ${MODE} mode — target ${BASE}`)

const ctx = { prefix: config.prefix, dim: config.dim }
const suite = mod.default(ctx, call)

try {
  await suite.prepare()
  for (const c of suite.setupCases) await runCase(c, "setup")
  if (fatal) throw new Error(fatal)
  await suite.finalize()
  const all = FILTER
    ? suite.cases.filter((c) => FILTER.includes("=") ? (FILTER.startsWith("family=") ? c.family === FILTER.slice(7) : c.id.includes(FILTER.split("=")[1])) : (c.id + c.family).includes(FILTER))
    : suite.cases
  for (const c of all) await runCase(c, "case")
} catch (e) {
  fatal = redact((e && e.message) || e)
  console.error("FATAL:", fatal)
} finally {
  if (suite.cleanup) {
    try { await suite.cleanup(suite.h) } catch (e) { console.error("cleanup error:", redact((e && e.message) || e)) }
  }
}

const counts = {}
for (const r of results) counts[r.verdict] = (counts[r.verdict] || 0) + 1
const goldenTotal = MODE === "verify" ? results.filter((r) => r.goldenDiffs).length : 0
console.log("\n===== SUMMARY =====")
console.log(JSON.stringify({ ...counts, goldenCasesWithDiffs: goldenTotal || undefined }, null, 1))

if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify({
    base: BASE, suite: config.name, anchor: config.anchor || null, mode: MODE,
    startedAt: new Date(t0).toISOString(), durationMs: Date.now() - t0,
    counts, fatal: fatal || undefined, results,
  }, null, 1))
  console.log("results written:", OUT)
}
process.exit(fatal ? 1 : 0)
