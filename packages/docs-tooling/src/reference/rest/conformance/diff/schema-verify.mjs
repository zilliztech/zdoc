#!/usr/bin/env node
// Schema verification: corroborate the DOCUMENTED (fragment-declared) request
// and response schemas against LIVE-OBSERVED evidence.
//
//   declared  ← inventory/schema-inventory.json (what the docs claim:
//               field names, types, required, enums — $refs expanded)
//   observed  ← suites/<suite>/goldens/*.json (frozen ACCEPTED responses)
//            + results.json (negative probes: omitted documented-required
//               params that the server rejected = required corroborated;
//               accepted = required-declaration CONFLICT; ghost params)
//
// Output per operation: field-level verdicts —
//   corroborated          declared field observed with matching type
//   declared-not-observed doc declares a response field the live response lacks
//   observed-undeclared   live response carries a field the doc never declares
//   type-mismatch         declared integer/... but live returns another type
//   enum-conflict         observed value outside the documented enum
//   required-corroborated omitted documented-required param → server rejected
//   required-conflict     omitted documented-required param → server ACCEPTED
//
// Usage: node schema-verify.mjs --inventory <inventory.json> --suite <dir> \
//          --results <results.json> --out <report.json> [--md <report.md>]

import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

function parseArgs(argv) {
  const a = {}
  for (let i = 2; i < argv.length; i++) if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[++i]
  return a
}
process.env.ZILLIZ_UAT3_PROJECT ||= "proj-conformance-stub"
const args = parseArgs(process.argv)
const inventory = JSON.parse(fs.readFileSync(args.inventory, "utf8"))
const results = JSON.parse(fs.readFileSync(args.results, "utf8"))
const suiteDir = path.resolve(args.suite)

// ---------- declared tree flattening ----------
const jsType = (v) =>
  v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "object" ? "object" : typeof v
const oaType = (t) => (t === "integer" || t === "number" ? "number" : t || "?")

// Flatten a declared schema into { "path.to.field": {type, enum} }. Accepts
// BOTH formats: the inventory's flattened fieldTable ({type:"object",
// fields:[{name,type,enum,required}]} — the real input) and raw OpenAPI
// ({properties:{...}}) — used by tests.
function flattenDeclared(schema, prefix = "$", out = {}, depth = 0) {
  if (!schema || typeof schema !== "object" || depth > 8) return out
  if (schema.$circular || schema.$unresolved) return out
  if (schema.oneOf || schema.anyOf || schema.branches) {
    for (const b of schema.oneOf || schema.anyOf || schema.branches) flattenDeclared(b, prefix, out, depth + 1)
    return out
  }
  if (schema.type === "object" || schema.properties || schema.fields) {
    // additionalProperties (raw OpenAPI) or its `dynamic` marker (inventory
    // fieldTable) means the object legitimately carries caller-dependent
    // keys — record it so undeclared observed keys can be classified as
    // dynamic instead of conflicts.
    if ((schema.additionalProperties || schema.dynamic) && prefix !== "$") {
      out[prefix] = { ...(out[prefix] || {}), type: oaType(schema.type || "object"), dynamic: true }
    }
    const fields = schema.fields || Object.entries(schema.properties || {}).map(([name, p]) => ({ name, ...p }))
    for (const f of fields) {
      const fp = `${prefix}.${f.name}`
      out[fp] = { type: oaType(f.type), enum: f.enum || null, required: !!f.required || (schema.required || []).includes(f.name) }
      flattenDeclared(f, fp, out, depth + 1)
      if (schema.properties && schema.properties[f.name]) flattenDeclared(schema.properties[f.name], fp, out, depth + 1)
    }
  } else if (schema.type === "array" && (schema.items || schema.itemsSchema)) {
    const items = schema.items || schema.itemsSchema
    // Declare the element node itself: flattenObserved always emits the
    // element path (prefix + "[]"), so a list-of-strings response would
    // otherwise never find its own structure documented and every
    // array payload would show a phantom undocumented/observed-undeclared
    // verdict (batch 2, 2026-11-04).
    out[`${prefix}[]`] = { type: oaType(items.type), enum: items.enum || null, required: false }
    flattenDeclared(items, `${prefix}[]`, out, depth + 1)
  }
  return out
}

// Flatten an observed JSON value into { path: jsType } (+ sample scalar values).
function flattenObserved(value, prefix = "$", out = {}, samples = {}, depth = 0) {
  const t = jsType(value)
  out[prefix] = t
  if (t === "object") {
    for (const [k, v] of Object.entries(value)) {
      const fp = `${prefix}.${k}`
      out[fp] = jsType(v)
      if (!["object", "array"].includes(jsType(v))) samples[fp] = v
      flattenObserved(v, fp, out, samples, depth + 1)
    }
  } else if (t === "array" && value.length) {
    flattenObserved(value[0], `${prefix}[]`, out, samples, depth + 1)
  }
  return { out, samples }
}

// ---------- load suite catalog: caseId → op ----------
async function loadCatalog(suiteDir) {
  const config = JSON.parse(fs.readFileSync(path.join(suiteDir, "config.json"), "utf8"))
  const mod = await import(pathToFileURL(path.join(suiteDir, "cases.mjs")).href)
  const stubCall = async () => ({ http: 0, code: 0, msg: "", data: null, json: null })
  const s = mod.default({ prefix: config.prefix, dim: config.dim, projectEnv: config.projectEnv }, stubCall)
  const byId = new Map()
  for (const c of [...(s.setupCases || []), ...(s.cases || [])]) byId.set(c.id, c)
  return { byId, config }
}

const { byId } = await loadCatalog(suiteDir)

// inventory lookup: POST ops (dataplane is POST-everything; control-plane mixed)
const invByPath = new Map()
for (const o of inventory.operations) invByPath.set(`${o.method.toUpperCase()} ${o.path}`, o)

const goldenDir = path.join(suiteDir, "goldens")
const goldenFiles = fs.existsSync(goldenDir) ? fs.readdirSync(goldenDir).filter((f) => f.endsWith(".json")) : []

const opReports = []
let corroboratedFields = 0, conflicts = 0

for (const f of goldenFiles) {
  const gid = f.slice(0, -5)
  const caseId = gid.replace(/^(case|setup)\./, "")
  const c = byId.get(caseId)
  if (!c) continue
  const short = c.op.startsWith("/v1/") || c.op.startsWith("/v2/") ? c.op : "/v2/vectordb" + c.op
  const inv = invByPath.get(`POST ${short}`) || invByPath.get(`GET ${short}`.replace("POST", "GET"))
  if (!inv || !inv.response) continue // no declared response schema → nothing to corroborate

  const golden = JSON.parse(fs.readFileSync(path.join(goldenDir, f), "utf8"))
  if (golden.code !== 0) continue
  const declared = flattenDeclared(inv.response.shape)
  const { out: observed, samples } = flattenObserved(golden)

  const fields = []
  const dataDeclared = declared["$.data"]
  // Data-internals declaration check: milvus-track fragments only declare the
  // envelope (code/data/message with data as an untyped array/object). When the
  // docs never describe the payload structure, the finding is per-OP, not
  // per-field: "response structure undocumented" + the observed structure as
  // ready-made material for the fragment fix.
  const dataObserved = observed["$.data"]
  const dataChildren = Object.keys(observed).filter((k) => k.startsWith("$.data.") || k.startsWith("$.data[]"))
  const structureDocumented = dataChildren.some((k) => k in declared)
  // An empty observed payload (data === {}) has no structure to document at
  // all — envelope-only declaration is already complete, so the undocumented
  // verdict can never clear and would fire forever (same false-positive
  // family as the $.message error branch, pinned 2026-11-04 batch 2).
  if (dataObserved && dataChildren.length > 0 && !structureDocumented) {
    fields.push({
      path: "$.data", verdict: "response-structure-undocumented",
      observed: dataObserved,
      observedTopLevelKeys: [...new Set(dataChildren.map((k) => k.split(".").slice(0, 3).join(".").replace(/\[\]$/, "")))].slice(0, 12),
    })
    conflicts++
  }
  for (const [p, meta] of Object.entries(declared)) {
    if (p === "$") continue
    // volatile exemption: the whole cost subtree is stripped from goldens by policy
    if (p === "$.cost" || p.startsWith("$.cost.")) continue
    // the oneOf error branch declares $.message; a success golden (code===0)
    // never carries it — that is a branch not exercised, not a doc conflict
    if (p === "$.message") {
      fields.push({ path: p, verdict: "error-branch-not-exercised", declared: meta.type })
      continue
    }
    if (p in observed) {
      // Union-typed leaves (oneOf/anyOf of scalar branches, e.g. PK ids that
      // may be Int64 or VarChar per collection schema) accept any observed
      // scalar type — the branch walk below covers the alternatives.
      const tOk = observed[p] === meta.type || observed[p] === "null" || meta.type === "?" || meta.type === "oneOf" || meta.type === "anyOf"
      let enumOk = true
      if (meta.enum && samples[p] !== undefined) enumOk = meta.enum.includes(samples[p])
      if (!tOk) {
        fields.push({ path: p, verdict: "type-mismatch", declared: meta.type, observed: observed[p], sample: samples[p] })
        conflicts++
      } else if (!enumOk) {
        fields.push({ path: p, verdict: "enum-conflict", declaredEnum: meta.enum, sample: samples[p] })
        conflicts++
      } else {
        fields.push({ path: p, verdict: "corroborated", declared: meta.type, observed: observed[p] })
        corroboratedFields++
      }
    } else {
      const parent = p.split(".").slice(0, -1).join(".")
      if (parent === "$" || parent in observed || (parent + "[]") in observed) {
        fields.push({ path: p, verdict: "declared-not-observed", declared: meta.type, required: meta.required })
        conflicts++
      }
    }
  }
  for (const [p, t] of Object.entries(observed)) {
    if (p === "$" || p in declared) continue
    const parent = p.split(".").slice(0, -1).join(".")
    if (parent !== "$" && !(parent in declared) && !((parent + "[]") in declared)) continue
    // keys under an additionalProperties object are caller-dependent output
    // fields (e.g. collection schema fields echoed in result items)
    const parentMeta = declared[parent] || declared[parent + "[]"]
    if (parentMeta?.dynamic) {
      fields.push({ path: p, verdict: "dynamic-corroborated", observed: t, sample: samples[p] })
      continue
    }
    if (structureDocumented) {
      fields.push({ path: p, verdict: "observed-undeclared", observed: t, sample: samples[p] })
      conflicts++
    }
  }
  // Example-vs-schema cross-check: the response examples embedded in the
  // fragments are rendered verbatim in the docs, so a value that contradicts
  // the declared schema (or shows a field the schema never declares) is a doc
  // bug of its own — batch 2, 2026-11-04. The indexes/describe and invoices
  // conflicts were exactly this shape: examples had led the schemas.
  for (const ex of inv.response?.examples || []) {
    if (!ex.value || typeof ex.value !== "object" || Array.isArray(ex.value)) continue
    const { out: exObserved, samples: exSamples } = flattenObserved(ex.value)
    for (const [p, meta] of Object.entries(declared)) {
      if (p === "$") continue
      if (p === "$.message" || p === "$.cost" || p.startsWith("$.cost.")) continue
      if (p in exObserved) {
        const tOk = exObserved[p] === meta.type || exObserved[p] === "null" || meta.type === "?" || meta.type === "oneOf" || meta.type === "anyOf"
        if (!tOk) {
          fields.push({ path: p, verdict: "example-type-mismatch", example: ex.summary, declared: meta.type, exampleObserved: exObserved[p] })
          conflicts++
        }
      }
    }
    for (const [p, t] of Object.entries(exObserved)) {
      if (p === "$" || p === "$.cost" || p.startsWith("$.cost.") || p in declared) continue
      const parent = p.split(".").slice(0, -1).join(".")
      if (parent !== "$" && !(parent in declared) && !((parent + "[]") in declared)) continue
      const parentMeta = declared[parent] || declared[parent + "[]"]
      if (parentMeta?.dynamic) continue
      fields.push({ path: p, verdict: "example-undeclared", example: ex.summary, exampleObserved: t, sample: exSamples[p] })
      conflicts++
    }
  }
  opReports.push({
    suite: results.suite,
    caseId,
    op: `${(inv.method || "post").toUpperCase()} ${inv.path}`,
    golden: gid,
    declaredFields: Object.keys(declared).length - 1,
    verdicts: fields,
  })
}

// ---------- request-side evidence from negative probes ----------
const requiredRows = []
for (const r of results.results) {
  if (!r.id.startsWith("case.")) continue
  const c = byId.get(r.id.replace(/^case\./, ""))
  if (!c) continue
  const short = c.op.startsWith("/v1/") || c.op.startsWith("/v2/") ? c.op : "/v2/vectordb" + c.op
  const inv = invByPath.get(`POST ${short}`) || invByPath.get(`GET ${short}`)
  if (!inv) continue
  if (c.kind === "negative") {
    // omitted a documented-required param:
    const accepted = r.verdict !== "REJECTED"
    requiredRows.push({
      caseId: r.id, op: `POST ${inv.path}`, param: c.param, intent: c.intent,
      verdict: accepted ? "required-conflict" : "required-corroborated",
      detail: String(r.msg || "").slice(0, 160),
    })
  } else if (c.kind === "ghost") {
    requiredRows.push({
      caseId: r.id, op: `POST ${inv.path}`, param: c.param, intent: c.intent,
      verdict: r.verdict === "FAIL" || r.verdict === "NO-EFFECT" ? "ghost-conflict" : "ghost-observed",
      detail: String(r.effect || r.msg || "").slice(0, 160),
    })
  }
}

const tally = {}
for (const op of opReports) for (const v of op.verdicts) tally[v.verdict] = (tally[v.verdict] || 0) + 1
for (const r of requiredRows) tally[r.verdict] = (tally[r.verdict] || 0) + 1

const report = {
  schemaVersion: 1,
  suite: results.suite,
  opsVerified: opReports.length,
  requiredProbes: requiredRows.length,
  tally,
  note: "declared = fragment/OpenAPI claims ($refs expanded); observed = frozen accepted responses (goldens) + negative-probe verdicts. This report is the doc-fix worklist: every conflict names the field and the evidence.",
  operations: opReports,
  requestEvidence: requiredRows,
}
fs.mkdirSync(path.dirname(args.out), { recursive: true })
fs.writeFileSync(args.out, JSON.stringify(report, null, 1) + "\n")

if (args.md) {
  const conflictsAll = [
    ...opReports.flatMap((op) => op.verdicts.filter((v) => v.verdict !== "corroborated").map((v) => ({ op: op.op, caseId: op.caseId, ...v }))),
    ...requiredRows.filter((r) => r.verdict.includes("conflict")),
  ]
  const lines = [
    `# Schema verification — ${results.suite}`,
    "",
    `Ops with accepted-response evidence: **${opReports.length}**; field verdicts: ${JSON.stringify(tally)}`,
    "",
    `## Conflicts (${conflictsAll.length}) — the doc-fix worklist`,
    "",
    conflictsAll.length ? "| Op | Case | Verdict | Detail |" : "(none — every declared field checked so far is corroborated)",
    conflictsAll.length ? "|---|---|---|---|" : "",
    ...conflictsAll.slice(0, 200).map((c) => `| ${c.op} | ${c.caseId} | ${c.verdict} | ${JSON.stringify({ declared: c.declared, observed: c.observed, sample: c.sample, required: c.required, declaredEnum: c.declaredEnum, example: c.example, exampleObserved: c.exampleObserved, detail: c.detail, param: c.param }).slice(0, 140)} |`),
    "",
    `## Corroborated fields: ${corroboratedFields}`,
    "",
    `## Required-param probes: ${requiredRows.length}`,
    "",
    "| Case | Op | Param | Verdict |",
    "|---|---|---|---|",
    ...requiredRows.map((r) => `| ${r.caseId} | ${r.op} | ${r.param} | ${r.verdict} |`),
  ]
  fs.writeFileSync(args.md, lines.join("\n") + "\n")
}
console.log(`schema-verify[${results.suite}]: ${opReports.length} ops verified, ${corroboratedFields} fields corroborated, ${JSON.stringify(tally)}`)
