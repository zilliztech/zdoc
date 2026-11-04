#!/usr/bin/env node
// Schema-attribution inventory generator: walks the REST OpenAPI fragments
// (packages/docs-tooling/src/reference/rest/meta/openapi/*.json) and emits
// schema-inventory.json — the machine-readable "which parameter/field belongs
// to which operation, with which request/response shape" table that the
// conformance program verifies against live systems.
//
// Hermetic and deterministic: the committed schema-inventory.json must equal
// a regeneration byte-for-byte (enforced by inventory.test.mjs), so any
// fragment edit without an inventory refresh fails the hermetic test.

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FRAG_DIR = path.resolve(HERE, "../../meta/openapi")
const OUT = path.join(HERE, "schema-inventory.json")

function loadFragment(file) {
  const raw = fs.readFileSync(path.join(FRAG_DIR, file), "utf8")
  return { spec: JSON.parse(raw), sha256: crypto.createHash("sha256").update(raw).digest("hex").slice(0, 12) }
}

function resolver(spec) {
  const seen = new Set()
  return function resolve(node, depth = 0) {
    if (!node || typeof node !== "object" || depth > 6) return node
    if (node.$ref) {
      const ptr = node.$ref
      if (seen.has(ptr)) return { $circular: ptr }
      seen.add(ptr)
      const target = ptr.startsWith("#/components/schemas/")
        ? spec.components?.schemas?.[ptr.slice("#/components/schemas/".length)]
        : undefined
      const out = target ? resolve(target, depth + 1) : { $unresolved: ptr }
      seen.delete(ptr)
      return out
    }
    const out = Array.isArray(node) ? node.map((x) => resolve(x, depth + 1)) : {}
    if (!Array.isArray(node)) for (const [k, v] of Object.entries(node)) out[k] = resolve(v, depth + 1)
    return out
  }
}

function fieldTable(schema, spec, depth = 0) {
  if (!schema || typeof schema !== "object" || depth > 3) return null
  const resolve = resolver(spec)
  const s = resolve(schema)
  if (s.$circular || s.$unresolved) return { refProblem: s.$circular || s.$unresolved }
  if (s.type === "object" || s.properties) {
    const fields = []
    for (const [name, p] of Object.entries(s.properties || {})) {
      const rp = resolve(p)
      fields.push({
        name,
        in: "body",
        type: rp.type || (rp.oneOf || rp.anyOf ? (rp.oneOf || rp.anyOf).map((b) => b.type || "ref").join("|") : rp.$circular ? "circular" : rp.$unresolved ? "unresolved" : "ref"),
        required: (s.required || []).includes(name),
        enum: rp.enum,
        default: rp.default,
        format: rp.format,
      })
    }
    return { type: "object", fields, required: s.required || [] }
  }
  if (s.type === "array") return { type: "array", items: fieldTable(s.items, spec, depth + 1) }
  if (s.oneOf || s.anyOf) return { type: s.oneOf ? "oneOf" : "anyOf", branches: (s.oneOf || s.anyOf).map((b) => fieldTable(b, spec, depth + 1)) }
  return { type: s.type || "ref" }
}

const fragments = fs.readdirSync(FRAG_DIR).filter((f) => f.endsWith(".json")).sort()
const operations = []
for (const file of fragments) {
  const { spec, sha256 } = loadFragment(file)
  for (const [p, methods] of Object.entries(spec.paths || {})) {
    for (const [m, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(m)) continue
      const reqSchema = op.requestBody?.content?.["application/json"]?.schema
      const resSchema = op.responses?.["200"]?.content?.["application/json"]?.schema
      const params = []
      for (const prm of op.parameters || []) params.push({ name: prm.name, in: prm.in, required: prm.required || false, schemaType: prm.schema?.type })
      operations.push({
        fragment: file,
        path: p,
        method: m,
        summary: op.summary || null,
        tags: op.tags || [],
        parameters: params,
        requestBody: reqSchema
          ? { required: op.requestBody.required !== false, shape: fieldTable(reqSchema, spec) }
          : null,
        response: resSchema ? { shape: fieldTable(resSchema, spec) } : null,
        // per #3801 live verification (2026-11-03): GA int64 renders as JSON
        // numbers by default; Accept-Type-Allow-Int64: false switches to strings.
        int64Rendering: "number-by-default (Accept-Type-Allow-Int64: false -> string)",
      })
    }
  }
}

const inventory = {
  schemaVersion: 1,
  generatedAt: "committed (see inventory.test.mjs — regeneration must be byte-identical)",
  fragments: Object.fromEntries(fragments.map((f) => [f, loadFragment(f).sha256])),
  operationCount: operations.length,
  operations,
}

fs.writeFileSync(OUT, JSON.stringify(inventory, null, 1) + "\n")
console.log(`schema-inventory.json written: ${operations.length} operations across ${fragments.length} fragments`)
