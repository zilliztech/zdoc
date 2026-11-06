// Hermetic gate for the committed schema-inventory: regeneration must be
// byte-identical (fragment edits without an inventory refresh fail here) and
// spot checks pin the attribution content.
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))

test("schema-inventory regenerates byte-identical (drift gate)", () => {
  const before = fs.readFileSync(path.join(HERE, "schema-inventory.json"))
  const r = spawnSync(process.execPath, [path.join(HERE, "generate-inventory.mjs")], { encoding: "utf8" })
  assert.equal(r.status, 0, r.stderr)
  const after = fs.readFileSync(path.join(HERE, "schema-inventory.json"))
  assert.deepEqual(after, before, "schema-inventory.json drifted from fragments — regenerate it in the same change")
})

test("inventory: attribution spot checks", () => {
  const inv = JSON.parse(fs.readFileSync(path.join(HERE, "schema-inventory.json"), "utf8"))
  assert.equal(inv.schemaVersion, 1)
  assert.ok(inv.operationCount >= 200, `expected >=200 ops across fragments, got ${inv.operationCount}`)
  assert.ok(Object.keys(inv.fragments).length === 38)

  const find = (p, m = "post") => inv.operations.find((o) => o.path === p && o.method === m)

  const create = find("/v2/vectordb/collections/create")
  assert.ok(create, "collections/create present")
  const branch = create.requestBody.shape.branches.find((b) => b.fields?.some((f) => f.name === "collectionName"))
  assert.ok(branch, "create body expands $ref into a field table")
  const cn = branch.fields.find((f) => f.name === "collectionName")
  assert.equal(cn.required, true, "collectionName marked required")

  const search = find("/v2/vectordb/entities/search")
  assert.ok(search, "entities/search present")

  const clouds = find("/v2/clouds", "get")
  assert.ok(clouds, "cloud-track GET ops inventoried")

  assert.ok(inv.operations.every((o) => o.int64Rendering), "int64 rendering note present on every op")
})
