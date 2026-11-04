// Dataplane case catalog — faithful port of the 2026-11-01 first round
// (reports/2026-11-01/rest-v2-param-tests.mjs, 130 param-level cases) plus the
// admin-family additions (W1: partition/index/alias/user/role/privilege-group/
// resource-group/database/import/collection-admin, ~55 cases).
//
// Expectations encode the v2.6.26 reference behavior. Suites override per
// track (suites/<name>/config.json + overrides in their cases.mjs) — the
// runner reports diffs as data, never silently rewrites expectations.
//
// Case shape:
//   { id, family, op, kind, expect, param, intent, body(h), effect(h,res), critical? }
// op is relative to /v2/vectordb unless it starts with "/v1/" or "/v2/" (absolute).

import { buildFixtureHelpers } from "./fixtures.mjs"

export function buildSuite(ctx, call) {
  const h = buildFixtureHelpers({ ctx, call })

  // Silent pre-phase: drop stale resources from previous rounds.
  const prepare = async () => {
    for (const c of [h.BASIC, h.HYBRID]) await call("/collections/drop", { collectionName: c })
    await call("/collections/drop", { dbName: h.DB2, collectionName: h.DB2_COLL })
    await call("/databases/drop", { dbName: h.DB2 })
  }

  // Silent post-setup: hybrid + db2 + load all + seed (ported verbatim).
  const finalize = h.bootstrap

  // ---- setup cases (were rec()'d "setup" in the first round) ----
  const setupCases = [
    {
      id: "setup.databases-create", family: "setup", op: "/databases/create", kind: "setup",
      expect: "record", param: "databases/create(dbName)", intent: "create second database for dbName tests",
      body: { dbName: h.DB2 },
    },
    {
      id: "setup.collections-create", family: "setup", op: "/collections/create", kind: "setup",
      expect: "record", param: "collections/create(schema+enableDynamicField)", intent: "schema fields incl max_length/max_capacity/dimension",
      body: { collectionName: h.BASIC, schema: h.basicSchema() },
    },
    {
      id: "setup.indexes-create", family: "setup", op: "/indexes/create", kind: "setup",
      expect: "record", param: "indexes/create(indexParams)", intent: "HNSW/COSINE with params.M + efConstruction",
      body: {
        collectionName: h.BASIC,
        indexParams: [{ fieldName: "vector", indexName: "vec_hnsw", indexType: "HNSW", metricType: "COSINE", params: { M: 16, efConstruction: 200 } }],
      },
    },
    ...["p1", "p2", "p3"].map((p) => ({
      id: `setup.partitions-create-${p}`, family: "setup", op: "/partitions/create", kind: "setup",
      expect: "record", param: `partitions/create(${p})`, intent: "partition ops from 08 fragment",
      body: { collectionName: h.BASIC, partitionName: p },
    })),
    {
      id: "setup.partitions-has", family: "setup", op: "/partitions/has", kind: "setup",
      expect: "record", param: "partitions/has(partitionName)", intent: "effect: has=true",
      body: { collectionName: h.BASIC, partitionName: "p1" },
      effect: (hh, res) => ({ ok: res.code === 0 && res.data && res.data.has === true, detail: "has=" + JSON.stringify(res.data) }),
    },
    {
      id: "admin.collections-rename-create", family: "collections", op: "/collections/create", kind: "setup", critical: true, expect: "record",
      param: "(rename fixture)", intent: "disposable collection for rename/truncate/fields probes",
      body: (hh) => ({
        collectionName: `${P}_rn_src`,
        schema: { autoId: false, enableDynamicField: false, fields: [
          { fieldName: "id", dataType: "Int64", isPrimary: true, elementTypeParams: {} },
          { fieldName: "vector", dataType: "FloatVector", elementTypeParams: { dim: "8" } },
        ] },
      }),
    },
    {
      id: "admin.partitions-drop-create", family: "partitions", op: "/partitions/create", kind: "setup", critical: true, expect: "record",
      param: "(drop fixture)", intent: "disposable partition for the drop probe",
      body: (hh) => ({ collectionName: hh.BASIC, partitionName: `${P}_tmp_p` }),
    },
  ].map((c) => ({ ...c, critical: true }))

  // ---- the 130-case port (insert/upsert/delete/get/query/search/hybrid) ----
  const cases = []

  const push = (c) => cases.push(c)

  // ================= INSERT =================
  push({
    id: "insert.collectionName", family: "insert", op: "/entities/insert", kind: "positive", expect: "ok",
    param: "collectionName", intent: "valid collection name accepted",
    body: (hh) => ({ collectionName: hh.BASIC, partitionName: "p1", data: [{ id: 51, vector: hh.hot(1), title: "x51", tags: ["t"], meta: {}, price: 3, grp: "g1" }] }),
    effect: (hh, res) => ({ ok: res.data && res.data.insertCount === 1, detail: "insertCount=" + JSON.stringify(res.data && res.data.insertCount) }),
  })
  push({
    id: "insert.collectionName-missing", family: "insert", op: "/entities/insert", kind: "negative", expect: "err",
    param: "collectionName(missing)", intent: "doc marks collectionName required",
    body: { data: [{ id: 52, vector: h.hot(1) }] },
  })
  push({
    id: "insert.collectionName-unknown", family: "insert", op: "/entities/insert", kind: "negative", expect: "err",
    param: "collectionName(unknown)", intent: "nonexistent collection rejected",
    body: { collectionName: "no_such_coll_zz", data: [{ id: 1 }] },
  })
  push({
    id: "insert.dbName", family: "insert", op: "/entities/insert", kind: "positive", expect: "ok",
    param: "dbName", intent: "routes insert into target database",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, data: [{ id: 201, vector: hh.hot(2), price: 9 }] }),
    effect: async (hh) => {
      const qr = await hh.call("/entities/query", { dbName: hh.DB2, collectionName: hh.DB2_COLL, filter: "id == 201", outputFields: ["id"] })
      return { ok: qr.code === 0 && (qr.data || []).length === 1, detail: "db2 rows=" + (qr.data || []).length }
    },
  })
  push({
    id: "insert.dbName-unknown", family: "insert", op: "/entities/insert", kind: "negative", expect: "err",
    param: "dbName(unknown)", intent: "nonexistent db rejected",
    body: (hh) => ({ dbName: "no_such_db_zz", collectionName: hh.DB2_COLL, data: [{ id: 1 }] }),
  })
  push({
    id: "insert.data-array", family: "insert", op: "/entities/insert", kind: "positive", expect: "ok",
    param: "data(array)", intent: "array form (doc oneOf array branch), full rows",
    body: (hh) => {
      const full = (i, t) => ({ id: i, vector: hh.hot(i), title: t, tags: ["t"], meta: {}, price: 1, grp: "g1" })
      return { collectionName: hh.BASIC, data: [full(53, "a"), full(54, "b")] }
    },
    effect: (hh, res) => ({ ok: res.data && res.data.insertCount === 2, detail: "insertCount=" + JSON.stringify(res.data && res.data.insertCount) }),
  })
  push({
    id: "insert.partial-no-flag", family: "insert", op: "/entities/insert", kind: "observe", expect: "record",
    param: "(partial fields w/o partialUpdate)", intent: "missing scalar fields without partialUpdate flag",
    body: (hh) => ({ collectionName: hh.BASIC, data: [{ id: 55, vector: hh.hot(1), title: "partial-no-flag" }] }),
  })
  push({
    id: "insert.data-objectForm", family: "insert", op: "/entities/insert", kind: "observe", expect: "record",
    param: "data(objectForm)", intent: "doc oneOf allows single object; upstream Data is []map",
    body: (hh) => ({ collectionName: hh.BASIC, data: { id: 55, vector: hh.hot(1) } }),
  })
  push({
    id: "insert.data-missing", family: "insert", op: "/entities/insert", kind: "negative", expect: "err",
    param: "data(missing)", intent: "doc marks data required",
    body: (hh) => ({ collectionName: hh.BASIC }),
  })
  push({
    id: "insert.data-wrongDim", family: "insert", op: "/entities/insert", kind: "negative", expect: "err",
    param: "data(wrongDim)", intent: "dimension mismatch must be rejected (data is actually validated)",
    body: (hh) => ({ collectionName: hh.BASIC, data: [{ id: 56, vector: hh.hot(1).slice(0, 5) }] }),
  })
  push({
    id: "insert.partitionName", family: "insert", op: "/entities/insert", kind: "positive", expect: "ok",
    param: "partitionName", intent: "insert lands in the named partition",
    body: (hh) => ({ collectionName: hh.BASIC, partitionName: "p1", data: [{ id: 57, vector: hh.hot(3), title: "p57", tags: ["p"], meta: {}, price: 2, grp: "g1" }] }),
    effect: async (hh) => {
      const a = await hh.q("id == 57", { partitionNames: ["p1"] })
      const b = await hh.q("id == 57", { partitionNames: ["p2"] })
      return { ok: a.length === 1 && b.length === 0, detail: `p1=${a.length} p2=${b.length}` }
    },
  })
  push({
    id: "insert.partitionName-unknown", family: "insert", op: "/entities/insert", kind: "negative", expect: "err",
    param: "partitionName(unknown)", intent: "nonexistent partition rejected",
    body: (hh) => ({ collectionName: hh.BASIC, partitionName: "no_such_p", data: [{ id: 58, vector: hh.hot(1) }] }),
  })
  push({
    id: "insert.partialUpdate-subset", family: "insert", op: "/entities/insert", kind: "observe", expect: "record",
    param: "partialUpdate(subset row)", intent: "doc: only specified fields updated — 2.6.26 behavior?",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, data: [{ id: 120, vector: hh.hot(4), title: "partial-new" }] }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "msg=" + String(res.msg).slice(0, 140) }),
  })
  push({
    id: "insert.partialUpdate-existing", family: "insert", op: "/entities/insert", kind: "observe", expect: "record",
    param: "partialUpdate(existing, subset)", intent: "update title only on seeded row; doc says other fields survive",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, data: [{ id: 100, vector: hh.hot(0), title: "upd-100" }] }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "msg=" + String(res.msg).slice(0, 140) }),
  })
  push({
    id: "insert.fieldOps-REPLACE", family: "insert", op: "/entities/insert", kind: "positive", expect: "ok",
    param: "fieldOps(REPLACE)", intent: "explicit replace op (complete row)",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "title", op: "REPLACE" }], data: [{ id: 102, vector: hh.hot(2), title: "repl-102", tags: ["x"], meta: { a: { b: 1 }, keep: "yes" }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 102")
      return { ok: rows.length === 1 && rows[0].title === "repl-102" && rows[0].price === 1, detail: "title=" + (rows[0] && rows[0].title) }
    },
  })
  push({
    id: "insert.fieldOps-ARRAY_APPEND", family: "insert", op: "/entities/insert", kind: "positive", expect: "ok",
    param: "fieldOps(ARRAY_APPEND)", intent: "array append op (complete row); prior tags=[\"x\"]",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "tags", op: "ARRAY_APPEND" }], data: [{ id: 103, vector: hh.hot(3), title: "orig-103", tags: ["z"], meta: { a: { b: 1 }, keep: "yes" }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 103")
      let tags = rows[0] && rows[0].tags
      if (tags && tags.Data && tags.Data.StringData) tags = tags.Data.StringData.data || []
      return { ok: JSON.stringify(tags) === JSON.stringify(["x", "z"]) || JSON.stringify(tags) === JSON.stringify(["z"]), detail: "tags=" + JSON.stringify(tags) }
    },
  })
  push({
    id: "insert.fieldOps-ARRAY_REMOVE", family: "insert", op: "/entities/insert", kind: "observe", expect: "record",
    param: "fieldOps(ARRAY_REMOVE)", intent: "array remove op (complete row); prior tags=[\"x\"] — upsert path removes; insert path?",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "tags", op: "ARRAY_REMOVE" }], data: [{ id: 104, vector: hh.hot(4), title: "orig-104", tags: ["x"], meta: { a: { b: 1 }, keep: "yes" }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 104")
      let tags = rows[0] && rows[0].tags
      if (tags && tags.Data && tags.Data.StringData) tags = tags.Data.StringData.data || []
      return { ok: true, detail: "tags=" + JSON.stringify(tags) + (JSON.stringify(tags) === JSON.stringify([]) ? " (removed)" : " (NOT removed => insert-path ARRAY_REMOVE no-op)") }
    },
  })
  push({
    id: "insert.fieldOps-PATH_REPLACE", family: "insert", op: "/entities/insert", kind: "observe", expect: "record",
    param: "fieldOps(PATH_REPLACE+path)", intent: "json path replace (upstream V2 parser incl path)",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "meta", op: "PATH_REPLACE", path: "a.b" }], data: [{ id: 105, vector: hh.hot(5), title: "orig-105", tags: ["x"], meta: { b: 42 }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 105")
      return { ok: rows.length === 1, detail: "meta=" + JSON.stringify(rows[0] && rows[0].meta) }
    },
  })
  push({
    id: "insert.fieldOps-unknownOp", family: "insert", op: "/entities/insert", kind: "negative", expect: "err",
    param: "fieldOps(unknownOp)", intent: "unsupported op must be rejected",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "title", op: "NO_SUCH_OP" }], data: [{ id: 100, title: "zz" }] }),
  })
  push({
    id: "insert.fieldOps-without-partialUpdate", family: "insert", op: "/entities/insert", kind: "observe", expect: "record",
    param: "fieldOps(without partialUpdate)", intent: "fieldOps without partialUpdate=true",
    body: (hh) => ({ collectionName: hh.BASIC, fieldOps: [{ fieldName: "title", op: "REPLACE" }], data: [{ id: 100, title: "zz" }] }),
  })

  // ================= UPSERT =================
  push({
    id: "upsert.data-arrayForm", family: "upsert", op: "/entities/upsert", kind: "positive", expect: "ok",
    param: "data(arrayForm)", intent: "upstream Data=[]map so array works; fragment documents object only",
    body: (hh) => ({ collectionName: hh.BASIC, data: [{ id: 106, vector: hh.hot(6), title: "ups-106", tags: ["u"], meta: {}, price: 2, grp: "gx" }] }),
    effect: (hh, res) => ({ ok: res.data && (res.data.upsertCount === 1 || res.data.insertCount === undefined), detail: JSON.stringify(res.data) }),
  })
  push({
    id: "upsert.data-objectForm", family: "upsert", op: "/entities/upsert", kind: "observe", expect: "record",
    param: "data(objectForm)", intent: "fragment documents data as object(map) — upstream struct is []map",
    body: (hh) => ({ collectionName: hh.BASIC, data: { id: 106, vector: hh.hot(6) } }),
  })
  push({
    id: "upsert.data-missing", family: "upsert", op: "/entities/upsert", kind: "negative", expect: "err",
    param: "data(missing)", intent: "doc marks data required",
    body: (hh) => ({ collectionName: hh.BASIC }),
  })
  push({
    id: "upsert.partitionName", family: "upsert", op: "/entities/upsert", kind: "positive", expect: "ok",
    param: "partitionName", intent: "upsert into named partition",
    body: (hh) => ({ collectionName: hh.BASIC, partitionName: "p2", data: [{ id: 130, vector: hh.hot(5), title: "u130", tags: [], meta: {}, price: 3, grp: "g3" }] }),
    effect: async (hh) => {
      const a = await hh.q("id == 130", { partitionNames: ["p2"] })
      const b = await hh.q("id == 130", { partitionNames: ["p1"] })
      return { ok: a.length === 1 && b.length === 0, detail: `p2=${a.length} p1=${b.length}` }
    },
  })
  push({
    id: "upsert.partialUpdate-subset", family: "upsert", op: "/entities/upsert", kind: "observe", expect: "record",
    param: "partialUpdate(subset row)", intent: "doc: only specified fields updated",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, data: [{ id: 101, vector: hh.hot(1), title: "ups-partial-101" }] }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "msg=" + String(res.msg).slice(0, 140) }),
  })
  push({
    id: "upsert.fieldOps-REPLACE", family: "upsert", op: "/entities/upsert", kind: "positive", expect: "ok",
    param: "fieldOps(REPLACE)", intent: "explicit replace (complete row)",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "title", op: "REPLACE" }], data: [{ id: 100, vector: hh.hot(0), title: "u-repl-100", tags: ["x"], meta: { a: { b: 1 }, keep: "yes" }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 100")
      return { ok: rows.length === 1 && rows[0].title === "u-repl-100", detail: "title=" + (rows[0] && rows[0].title) }
    },
  })
  push({
    id: "upsert.fieldOps-ARRAY_APPEND", family: "upsert", op: "/entities/upsert", kind: "positive", expect: "ok",
    param: "fieldOps(ARRAY_APPEND)", intent: "append on upsert path (complete row)",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "tags", op: "ARRAY_APPEND" }], data: [{ id: 103, vector: hh.hot(3), title: "orig-103", tags: ["w"], meta: { a: { b: 1 }, keep: "yes" }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 103")
      let tags = rows[0] && rows[0].tags
      if (tags && tags.Data && tags.Data.StringData) tags = tags.Data.StringData.data || []
      return { ok: Array.isArray(tags) && tags.includes("w"), detail: "tags=" + JSON.stringify(tags) }
    },
  })
  push({
    id: "upsert.fieldOps-ARRAY_REMOVE", family: "upsert", op: "/entities/upsert", kind: "positive", expect: "ok",
    param: "fieldOps(ARRAY_REMOVE)", intent: "remove on upsert path (complete row)",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "tags", op: "ARRAY_REMOVE" }], data: [{ id: 103, vector: hh.hot(3), title: "orig-103", tags: ["z"], meta: { a: { b: 1 }, keep: "yes" }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 103")
      let tags = rows[0] && rows[0].tags
      if (tags && tags.Data && tags.Data.StringData) tags = tags.Data.StringData.data || []
      return { ok: Array.isArray(tags) && !tags.includes("z"), detail: "tags=" + JSON.stringify(tags) }
    },
  })
  push({
    id: "upsert.fieldOps-PATH_REPLACE", family: "upsert", op: "/entities/upsert", kind: "observe", expect: "record",
    param: "fieldOps(PATH_REPLACE+path)", intent: "json path replace on upsert",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "meta", op: "PATH_REPLACE", path: "a.b" }], data: [{ id: 105, vector: hh.hot(5), title: "orig-105", tags: ["x"], meta: { b: 7 }, price: 1, grp: "gx" }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 105")
      return { ok: rows.length === 1, detail: "meta=" + JSON.stringify(rows[0] && rows[0].meta) }
    },
  })
  push({
    id: "upsert.fieldOps-fieldName-missing", family: "upsert", op: "/entities/upsert", kind: "negative", expect: "err",
    param: "fieldOps.fieldName(missing)", intent: "upstream binding required on fieldName",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ op: "REPLACE" }], data: [{ id: 100, title: "zz" }] }),
  })
  push({
    id: "upsert.fieldOps-unknownOp", family: "upsert", op: "/entities/upsert", kind: "negative", expect: "err",
    param: "fieldOps.op(unknown)", intent: "unsupported op rejected",
    body: (hh) => ({ collectionName: hh.BASIC, partialUpdate: true, fieldOps: [{ fieldName: "title", op: "NO_SUCH_OP" }], data: [{ id: 100, title: "zz" }] }),
  })
  push({
    id: "upsert.default-overwrite", family: "upsert", op: "/entities/upsert", kind: "observe", expect: "record",
    param: "(default overwrite semantics)", intent: "no partialUpdate: omitted fields are wiped",
    body: (hh) => ({ collectionName: hh.BASIC, data: [{ id: 100, title: "full-ows", vector: hh.hot(0) }] }),
    effect: async (hh) => {
      const rows = await hh.q("id == 100")
      const row = rows[0] || {}
      return { ok: rows.length >= 1, detail: JSON.stringify({ title: row.title, price: row.price, keep: row.meta && row.meta.keep }) }
    },
  })

  // ================= DELETE =================
  push({
    id: "delete.filter", family: "delete", op: "/entities/delete", kind: "positive", expect: "ok",
    param: "filter", intent: "delete by scalar filter",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "price == 999" }),
    effect: async (hh, res) => {
      const rows = await hh.q("price == 999")
      return { ok: rows.length === 0, detail: "deleteCount=" + JSON.stringify(res.data && res.data.deleteCount) + " remaining=" + rows.length }
    },
  })
  push({
    id: "delete.filter-missing", family: "delete", op: "/entities/delete", kind: "negative", expect: "err",
    param: "filter(missing)", intent: "doc+upstream binding mark filter required",
    body: (hh) => ({ collectionName: hh.BASIC }),
  })
  push({
    id: "delete.id-only", family: "delete", op: "/entities/delete", kind: "ghost", expect: "record",
    param: "id(only)", intent: "fragment documents id as filter replacement; upstream DeleteReq has no id field",
    body: (hh) => ({ collectionName: hh.BASIC, id: "21" }),
  })
  push({
    id: "delete.id-plus-filter", family: "delete", op: "/entities/delete", kind: "ghost", expect: "ok",
    param: "id(+filter)", intent: "id points elsewhere; only filter target should be deleted (ghost-param probe)",
    body: (hh) => ({ collectionName: hh.BASIC, id: "2", filter: "id == 7" }),
    effect: async (hh, res) => {
      const g = await hh.q("id == 7")
      const s = await hh.q("id == 2")
      return { ok: g.length === 0 && s.length === 1, detail: `deleteCount=${JSON.stringify(res.data && res.data.deleteCount)} id7=${g.length} id2=${s.length} => id param ${g.length === 0 && s.length === 1 ? "ignored (no-op)" : "has effect"}` }
    },
  })
  push({
    id: "delete.partitionName", family: "delete", op: "/entities/delete", kind: "positive", expect: "ok",
    param: "partitionName", intent: "delete confined to partition",
    body: (hh) => ({ collectionName: hh.BASIC, partitionName: "p2", filter: "id == 2" }),
    effect: async (hh, res) => {
      const inP1 = await hh.q("id == 2", { partitionNames: ["p1"] })
      const inP2 = await hh.q("id == 2", { partitionNames: ["p2"] })
      return { ok: inP1.length === 1 && inP2.length === 0, detail: `deleteCount=${JSON.stringify(res.data && res.data.deleteCount)} p1=${inP1.length} p2=${inP2.length}` }
    },
  })
  push({
    id: "delete.exprParams", family: "delete", op: "/entities/delete", kind: "positive", expect: "ok",
    param: "exprParams", intent: "parameterized filter template",
    body: { collectionName: "__BASIC__", filter: "id in {ids}", exprParams: { ids: [3] } },
    effect: async (hh, res) => {
      const rows = await hh.q("id == 3")
      return { ok: rows.length === 0, detail: "deleteCount=" + JSON.stringify(res.data && res.data.deleteCount) + " remaining=" + rows.length }
    },
  })
  push({
    id: "delete.dbName", family: "delete", op: "/entities/delete", kind: "positive", expect: "ok",
    param: "dbName", intent: "delete inside named database",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, filter: "id == 201" }),
    effect: async (hh) => {
      const qr = await hh.call("/entities/query", { dbName: hh.DB2, collectionName: hh.DB2_COLL, filter: "id == 201", outputFields: ["id"] })
      return { ok: qr.code === 0 && (qr.data || []).length === 0, detail: "remaining=" + (qr.data || []).length }
    },
  })
  push({
    id: "delete.filter-emptyString", family: "delete", op: "/entities/delete", kind: "observe", expect: "record",
    param: "filter(emptyString)", intent: "doc: empty string skips scalar filtering — upstream binding:required rejects empty",
    body: (hh) => ({ collectionName: hh.BASIC, partitionName: "p3", filter: "" }),
    effect: async (hh) => {
      const after = await hh.q("id >= 21 and id <= 23", { partitionNames: ["p3"] })
      return { ok: true, detail: `after=${after.length}` }
    },
  })

  // ================= GET =================
  push({
    id: "get.id-array", family: "get", op: "/entities/get", kind: "positive", expect: "ok",
    param: "id(array)", intent: "array of int pks (upstream ID interface{})",
    body: (hh) => ({ collectionName: hh.BASIC, id: [1, 2], outputFields: ["id", "title"] }),
    effect: (hh, res) => ({ ok: (res.data || []).length === 2, detail: "rows=" + (res.data || []).length }),
  })
  push({
    id: "get.id-scalar", family: "get", op: "/entities/get", kind: "observe", expect: "record",
    param: "id(scalar)", intent: "single scalar pk",
    body: (hh) => ({ collectionName: hh.BASIC, id: 5, outputFields: ["id"] }),
    effect: (hh, res) => ({ ok: res.code === 0 && (res.data || []).length >= 1, detail: "rows=" + (res.data || []).length }),
  })
  push({
    id: "get.id-objectForm", family: "get", op: "/entities/get", kind: "observe", expect: "record",
    param: "id(objectForm)", intent: "fragment documents id as object map",
    body: (hh) => ({ collectionName: hh.BASIC, id: { id: [1, 2] }, outputFields: ["id"] }),
  })
  push({
    id: "get.id-missing", family: "get", op: "/entities/get", kind: "negative", expect: "err",
    param: "id(missing)", intent: "doc+binding mark id required",
    body: (hh) => ({ collectionName: hh.BASIC, outputFields: ["id"] }),
  })
  push({
    id: "get.outputFields-specific", family: "get", op: "/entities/get", kind: "positive", expect: "ok",
    param: "outputFields(specific)", intent: "only requested fields returned",
    body: (hh) => ({ collectionName: hh.BASIC, id: [1], outputFields: ["title"] }),
    effect: (hh, res) => {
      const row = (res.data || [])[0] || {}
      return { ok: "title" in row && !("tags" in row), detail: "keys=" + Object.keys(row).join(",") }
    },
  })
  push({
    id: "get.outputFields-star", family: "get", op: "/entities/get", kind: "positive", expect: "ok",
    param: "outputFields(*)", intent: "star returns all fields incl dynamic",
    body: (hh) => ({ collectionName: hh.BASIC, id: [6], outputFields: ["*"] }),
    effect: (hh, res) => {
      const row = (res.data || [])[0] || {}
      return { ok: "vector" in row, detail: "keys=" + Object.keys(row).join(",").slice(0, 120) }
    },
  })
  push({
    id: "get.partitionNames", family: "get", op: "/entities/get", kind: "positive", expect: "ok",
    param: "partitionNames", intent: "get scoped to partitions",
    body: (hh) => ({ collectionName: hh.BASIC, id: [1, 7], partitionNames: ["p1"], outputFields: ["id"] }),
    effect: (hh, res) => {
      const ids = (res.data || []).map((x) => x.id)
      return { ok: ids.includes(1) && !ids.includes(7), detail: "ids=" + ids.join(",") }
    },
  })
  push({
    id: "get.partitionNames-unknown", family: "get", op: "/entities/get", kind: "negative", expect: "err",
    param: "partitionNames(unknown)", intent: "nonexistent partition rejected",
    body: (hh) => ({ collectionName: hh.BASIC, id: [1], partitionNames: ["no_such_p"], outputFields: ["id"] }),
  })
  push({
    id: "get.partitionName-singular", family: "get", op: "/entities/get", kind: "observe", expect: "record",
    param: "partitionName(singular)", intent: "legacy singular partition param still on fragment",
    body: (hh) => ({ collectionName: hh.BASIC, id: [1], partitionName: "p1", outputFields: ["id"] }),
  })
  for (const cl of ["Strong", "Session", "Bounded", "Eventually"]) {
    push({
      id: `get.consistencyLevel-${cl}`, family: "get", op: "/entities/get", kind: "positive", expect: "ok",
      param: `consistencyLevel(${cl})`, intent: "enum value",
      body: (hh) => ({ collectionName: hh.BASIC, id: [1], outputFields: ["id"], consistencyLevel: cl }),
    })
  }

  // ================= QUERY =================
  push({
    id: "query.filter", family: "query", op: "/entities/query", kind: "positive", expect: "ok",
    param: "filter", intent: "scalar filtering",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "price > 50", outputFields: ["id", "price"] }),
    effect: (hh, res) => {
      const rows = res.data || []
      return { ok: rows.length >= 5 && rows.every((x) => x.price > 50), detail: "rows=" + rows.length }
    },
  })
  push({
    id: "query.filter-omitted", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "filter(omitted)", intent: "upstream Filter has no binding: what does empty filter do?",
    body: (hh) => ({ collectionName: hh.BASIC, outputFields: ["id"] }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "rows=" + ((res.data || [])).length }),
  })
  push({
    id: "query.outputFields-star", family: "query", op: "/entities/query", kind: "positive", expect: "ok",
    param: "outputFields(*)", intent: "star + dynamic field visibility",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["*"], limit: 1 }),
    effect: (hh, res) => {
      const row = (res.data || [])[0] || {}
      return { ok: "id" in row, detail: "keys=" + Object.keys(row).join(",").slice(0, 140) }
    },
  })
  push({
    id: "query.limit-offset", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "limit/offset", intent: "paging (no orderBy: natural order)",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["id", "price"], limit: 100, offset: 2 }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "rows=" + (res.data || []).length }),
  })
  push({
    id: "query.orderByFields-paging", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "orderByFields(paging)", intent: "order + offset/limit combo",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["id", "price"], orderByFields: ["price:asc"], limit: 4, offset: 2 }),
    effect: (hh, res) => {
      const rows = res.data || []
      return { ok: true, detail: "rows=" + rows.length + " prices=" + rows.map((x) => x.price).join(",") }
    },
  })
  push({
    id: "query.limit-0", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "limit(0)", intent: "limit=0 rejected or full scan?",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["id"], limit: 0 }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "rows=" + ((res.data || [])).length }),
  })
  push({
    id: "query.partitionNames", family: "query", op: "/entities/query", kind: "positive", expect: "ok",
    param: "partitionNames", intent: "scope to partition",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id >= 1", outputFields: ["id"], partitionNames: ["p2"], limit: 20 }),
    effect: (hh, res) => {
      const rows = res.data || []
      return { ok: rows.length >= 5 && rows.every((x) => x.id >= 7 && x.id <= 130), detail: "ids=" + rows.map((x) => x.id).join(",") }
    },
  })
  push({
    id: "query.exprParams", family: "query", op: "/entities/query", kind: "positive", expect: "ok",
    param: "exprParams", intent: "filter template parameters",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "price > {p}", exprParams: { p: 100 }, outputFields: ["id", "price"] }),
    effect: (hh, res) => {
      const rows = res.data || []
      return { ok: rows.length >= 1 && rows.every((x) => x.price > 100), detail: "rows=" + rows.length }
    },
  })
  for (const cl of ["Strong", "Session", "Bounded", "Eventually"]) {
    push({
      id: `query.consistencyLevel-${cl}`, family: "query", op: "/entities/query", kind: "positive", expect: "ok",
      param: `consistencyLevel(${cl})`, intent: "enum value",
      body: (hh) => ({ collectionName: hh.BASIC, filter: "id == 1", outputFields: ["id"], consistencyLevel: cl }),
    })
  }
  push({
    id: "query.orderByFields-desc", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "orderByFields(desc)", intent: "explicit desc ordering — 2.6.26: applied?",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["id", "price"], orderByFields: ["price:desc"], limit: 5 }),
    effect: (hh, res) => {
      const ps = (res.data || []).map((x) => x.price)
      const sorted = [...ps].sort((a, b) => b - a)
      const applied = JSON.stringify(ps) === JSON.stringify(sorted)
      return { ok: true, detail: "prices=" + ps.join(",") + (applied ? " (sorted desc)" : " (NOT sorted => ignored)") }
    },
  })
  push({
    id: "query.orderByFields-asc", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "orderByFields(default asc)", intent: "bare fieldName defaults to asc (note: pk order coincides with price order)",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["id", "price"], orderByFields: ["price"], limit: 5 }),
    effect: (hh, res) => {
      const ps = (res.data || []).map((x) => x.price)
      const sorted = [...ps].sort((a, b) => a - b)
      return { ok: true, detail: "prices=" + ps.join(",") + " asc-ordered=" + (JSON.stringify(ps) === JSON.stringify(sorted)) }
    },
  })
  push({
    id: "query.orderByFields-badField", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "orderByFields(badField)", intent: "unknown sort field: rejected or silently accepted?",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["id"], orderByFields: ["no_such_field:asc"] }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "rows=" + ((res.data || [])).length }),
  })
  push({
    id: "query.groupByFields-agg", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "groupByFields(+count(*)/sum)", intent: "groupBy + aggregation expressions in outputFields",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["grp", "count(*)", "sum(price)"], groupByFields: ["grp"], limit: 10 }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: JSON.stringify(res.data || res.msg).slice(0, 200) }),
  })
  push({
    id: "query.groupByFields-countOnly", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "groupByFields(count(*) only)", intent: "aggregation-only output",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["count(*)"], groupByFields: ["grp"], limit: 10 }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: JSON.stringify(res.data || res.msg).slice(0, 200) }),
  })
  push({
    id: "query.groupByFields-noAgg", family: "query", op: "/entities/query", kind: "observe", expect: "record",
    param: "groupByFields(no agg output)", intent: "groupBy without aggregation output",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "id > 0", outputFields: ["grp", "price"], groupByFields: ["grp"], limit: 10 }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "rows=" + ((res.data || [])).length }),
  })
  push({
    id: "query.filter-jsonPath", family: "query", op: "/entities/query", kind: "positive", expect: "ok",
    param: "filter(jsonPath)", intent: "JSON path filtering (note: JSON fields return as strings in output)",
    body: (hh) => ({ collectionName: hh.BASIC, filter: 'meta["cat"] == "x"', outputFields: ["id", "meta"] }),
    effect: (hh, res) => {
      const rows = res.data || []
      const cat = (x) => typeof x.meta === "string" ? JSON.parse(x.meta).cat : (x.meta || {}).cat
      return { ok: rows.length >= 5 && rows.every((x) => cat(x) === "x"), detail: "rows=" + rows.length + " all-cat-x=" + rows.every((x) => cat(x) === "x") }
    },
  })
  push({
    id: "query.filter-arrayContains", family: "query", op: "/entities/query", kind: "positive", expect: "ok",
    param: "filter(arrayContains)", intent: "array function filtering",
    body: (hh) => ({ collectionName: hh.BASIC, filter: "ARRAY_CONTAINS(tags, 'a')", outputFields: ["id"] }),
    effect: (hh, res) => {
      const rows = res.data || []
      return { ok: rows.length >= 5, detail: "rows=" + rows.length }
    },
  })
  push({
    id: "query.dbName", family: "query", op: "/entities/query", kind: "positive", expect: "ok",
    param: "dbName", intent: "query inside named database",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, filter: "id == 200", outputFields: ["id"] }),
    effect: (hh, res) => ({ ok: (res.data || []).length === 1, detail: "rows=" + (res.data || []).length }),
  })

  // ================= SEARCH =================
  const baseSearch = (hh) => ({ collectionName: hh.BASIC, annsField: "vector", limit: 5, outputFields: ["id", "price"] })
  push({
    id: "search.data-batch", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "data(batch)", intent: "two query vectors; 2.6.26 response = flat concatenation (limit per query)",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0), hh.hot(2)] }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: Array.isArray(d) && d.length === 10 && d.every((x) => typeof x.distance === "number"), detail: "rows=" + d.length + " (flat)" }
    },
  })
  push({
    id: "search.data-missing", family: "search", op: "/entities/search", kind: "negative", expect: "err",
    param: "data(missing)", intent: "doc+binding mark data required",
    body: (hh) => ({ ...baseSearch(hh) }),
  })
  push({
    id: "search.ids", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "ids", intent: "search by primary key (no data)",
    body: (hh) => ({ ...baseSearch(hh), ids: [1] }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: d.length > 0 && d[0].id === 1, detail: "top1=" + JSON.stringify(d[0] && d[0].id) }
    },
  })
  push({
    id: "search.ids-data-mutual", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "ids+data(mutual)", intent: "doc says mutually exclusive",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], ids: [1] }),
  })
  push({
    id: "search.annsField-omitted", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "annsField(omitted)", intent: "single vector field => omission allowed",
    body: (hh) => ({ collectionName: hh.BASIC, data: [hh.hot(0)], limit: 3, outputFields: ["id"] }),
  })
  push({
    id: "search.filter", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "filter", intent: "search with scalar filter",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], filter: "price >= 70" }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: d.length > 0 && d.every((x) => x.price >= 70), detail: "hits=" + d.length }
    },
  })
  push({
    id: "search.limit-offset", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "limit/offset", intent: "search paging",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], limit: 3, offset: 2 }),
    effect: (hh, res) => ({ ok: (res.data || []).length === 3, detail: "hits=" + (res.data || []).length }),
  })
  push({
    id: "search.metricType-match", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "searchParams.metricType(match)", intent: "metric matches index",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], searchParams: { metricType: "COSINE" } }),
  })
  push({
    id: "search.metricType-mismatch", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "searchParams.metricType(mismatch)", intent: "L2 against COSINE index: rejected or silently re-metriced?",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], searchParams: { metricType: "L2" } }),
    effect: (hh, res) => ({ ok: res.code === 0, detail: "hits=" + (res.data || []).length + " dist0=" + JSON.stringify((res.data || [])[0] && (res.data || [])[0].distance) }),
  })
  push({
    id: "search.radius-rangeFilter", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "searchParams.params(radius/range_filter)", intent: "range search bounds hit distances",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], limit: 10, searchParams: { params: { radius: 0.5, range_filter: 0.99 } } }),
    effect: (hh, res) => {
      const ds = (res.data || []).map((x) => x.distance)
      return { ok: ds.every((v) => v <= 0.99 && v > 0.5), detail: "hits=" + ds.length + " distances=" + ds.map((v) => Number(v).toFixed(3)).join(",") }
    },
  })
  push({
    id: "search.params-topLevel", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "params(topLevel legacy)", intent: "upstream comment: 'not use Params any more, just for compatibility'",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], params: { ef: 64 } }),
  })
  push({
    id: "search.searchParams-flat-ef", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "searchParams(flat ef)", intent: "flat index-level param passthrough",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], searchParams: { ef: 64 } }),
  })
  push({
    id: "search.groupingField", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "groupingField+groupSize", intent: "grouped search",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], groupingField: "grp", groupSize: 2, limit: 10 }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: res.code === 0 && d.length > 0, detail: "hits=" + d.length }
    },
  })
  push({
    id: "search.strictGroupSize", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "strictGroupSize", intent: "strict grouping flag",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], groupingField: "grp", groupSize: 2, strictGroupSize: true, limit: 10 }),
  })
  push({
    id: "search.partitionNames", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "partitionNames", intent: "search scoped to partition",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], partitionNames: ["p1"], limit: 10 }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: d.length > 0 && d.every((x) => x.id <= 6 || x.id >= 51 || x.id >= 100), detail: "ids=" + d.map((x) => x.id).join(",") }
    },
  })
  for (const cl of ["Strong", "Session", "Bounded", "Eventually"]) {
    push({
      id: `search.consistencyLevel-${cl}`, family: "search", op: "/entities/search", kind: "positive", expect: "ok",
      param: `consistencyLevel(${cl})`, intent: "enum value",
      body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], consistencyLevel: cl }),
    })
  }
  push({
    id: "search.exprParams", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "exprParams", intent: "filter templating in search",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], filter: "price > {p}", exprParams: { p: 80 } }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: d.length > 0 && d.every((x) => x.price > 80), detail: "hits=" + d.length }
    },
  })
  push({
    id: "search.functionScore-decay", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "functionScore(decay)", intent: "decay reranker on search (shape per upstream test)",
    body: (hh) => ({
      ...baseSearch(hh), data: [hh.hot(0)], limit: 5,
      functionScore: {
        functions: [{
          name: "decay_price", type: "Rerank", inputFieldNames: ["price"],
          params: { reranker: "decay", function: "linear", origin: 30, scale: 10, offset: 0, decay: 0.5 },
        }],
      },
    }),
  })
  push({
    id: "search.functionScore-boost", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "functionScore(boost+params)", intent: "boost reranker with functionScore.params — expect boosted distances >= 1000",
    body: (hh) => ({
      ...baseSearch(hh), data: [hh.hot(0)], limit: 5,
      functionScore: {
        functions: [{ name: "boost_ts", type: "Rerank", inputFieldNames: [], params: { reranker: "boost", filter: "price > 0", weight: 10 } }],
        params: { boost_mode: "sum" },
      },
    }),
    effect: (hh, res) => {
      const d = res.data || []
      const boosted = d.some((x) => x.distance >= 11)
      return { ok: d.length > 0 && boosted, detail: "top distances=" + d.slice(0, 3).map((x) => Number(x.distance).toFixed(1)).join(",") + (boosted ? " (boost applied: base 1 + weight 10)" : " (not applied)") }
    },
  })
  push({
    id: "search.fs-fc-mutual", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "functionScore+functionChains(mutual)", intent: "upstream pin rejects; 2.6.26 behavior?",
    body: (hh) => ({
      ...baseSearch(hh), data: [hh.hot(0)], limit: 5,
      functionScore: { functions: [{ name: "d", type: "Rerank", inputFieldNames: ["price"], params: { reranker: "decay", function: "linear", origin: 30, scale: 10, offset: 0, decay: 0.5 } }] },
      functionChains: h.fcL2(),
    }),
    effect: (hh, res) => ({ ok: true, detail: "hits=" + (res.data || []).length + " (accepted silently)" }),
  })
  push({
    id: "search.functionChains-L2", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "functionChains(L2 map+sort)", intent: "L2 rerank chain per upstream test shape — 2.6.26: wired?",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], limit: 5, functionChains: h.fcL2() }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: true, detail: "hits=" + d.length + " order=" + JSON.stringify(d.slice(0, 4).map((x) => x.id)) }
    },
  })
  push({
    id: "search.functionChains-limit", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "functionChains(limit op)", intent: "chain limit op trims final results (upstream: 2 hits)",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], limit: 5, functionChains: h.fcL2([{ op: "limit", params: { limit: 2 } }]) }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: true, detail: "hits=" + d.length + (d.length === 2 ? " (applied)" : " (NOT applied)") }
    },
  })
  push({
    id: "search.functionChains-badStage", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "functionChains(badStage)", intent: "unknown/ingest stage: rejected at search time?",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], functionChains: [{ name: "x", stage: "FunctionChainStageIngestion", ops: [{ op: "sort" }] }] }),
    effect: (hh, res) => ({ ok: true, detail: "hits=" + (res.data || []).length }),
  })
  push({
    id: "search.searchAggregation-full", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "searchAggregation(full)", intent: "fields/metrics/order/topHits per upstream test — 2.6.26: wired?",
    body: (hh) => ({
      ...baseSearch(hh), data: [hh.hot(0)], limit: 10,
      searchAggregation: {
        fields: ["grp"], size: 5,
        metrics: {
          n: { op: "count", fieldName: "*" },
          total: { op: "sum", fieldName: "price" },
          avg: { op: "avg", fieldName: "price" },
          min: { op: "min", fieldName: "price" },
          max: { op: "max", fieldName: "price" },
        },
        order: [{ key: "_key", direction: "asc" }],
        topHits: { size: 2, sort: [{ fieldName: "price", direction: "asc" }] },
      },
    }),
    effect: (hh, res) => {
      const j = res.json || {}
      const hasAgg = j.aggTopks !== undefined || (((j.data || [])[0] || {}).buckets !== undefined)
      return { ok: true, detail: hasAgg ? "aggregation response present" : "NO aggregation response (plain search rows returned) => not wired" }
    },
  })
  push({
    id: "search.searchAggregation-ids", family: "search", op: "/entities/search", kind: "negative", expect: "err",
    param: "searchAggregation(+ids)", intent: "mutual exclusion with ids",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], ids: [1], searchAggregation: { fields: ["grp"], size: 5 } }),
  })
  push({
    id: "search.searchAggregation-offset", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "searchAggregation(+offset)", intent: "mutual exclusion with offset (upstream pin rejects)",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], offset: 2, searchAggregation: { fields: ["grp"], size: 5 } }),
    effect: (hh, res) => ({ ok: true, detail: "hits=" + (res.data || []).length + " msg=" + String(res.msg).slice(0, 100) }),
  })
  push({
    id: "search.orderByFields-desc", family: "search", op: "/entities/search", kind: "observe", expect: "record",
    param: "orderByFields(desc)", intent: "top-level orderByFields re-sorts search results — 2.6.26: applied?",
    body: (hh) => ({ ...baseSearch(hh), data: [hh.hot(0)], orderByFields: ["price:desc"], limit: 5 }),
    effect: (hh, res) => {
      const d = res.data || []
      const ps = d.map((x) => x.price)
      const sorted = [...ps].sort((a, b) => b - a)
      const applied = JSON.stringify(ps) === JSON.stringify(sorted)
      return { ok: true, detail: "prices=" + ps.join(",") + (applied ? " (sorted desc)" : " (NOT sorted => ignored)") }
    },
  })
  push({
    id: "search.dbName", family: "search", op: "/entities/search", kind: "positive", expect: "ok",
    param: "dbName", intent: "search inside named database",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, data: [hh.hot(0)], limit: 3, outputFields: ["id"] }),
  })

  // ================= HYBRID SEARCH =================
  const hybridSub = (o = {}) => ({ data: [h.hot(0)], annsField: "vec1", limit: 5, ...o })
  push({
    id: "hybrid_search.search-minimal", family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
    param: "search[](minimal)", intent: "fragment marks filter/groupingField/offset/ignoreGrowing required on sub-search — upstream binds only data",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 5,
      outputFields: ["id", "grp"],
    }),
    effect: (hh, res) => {
      const d = res.data || []
      const g = Array.isArray(d[0]) ? d[0] : d
      return { ok: g.length > 0, detail: "hits=" + g.length + " shape=" + (Array.isArray(d[0]) ? "nested" : "flat") }
    },
  })
  push({
    id: "hybrid_search.search-filter", family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
    param: "search[].filter", intent: "per-sub-search filters applied",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub({ filter: "id <= 4" }), { data: [hh.hot(3)], annsField: "vec2", limit: 5, filter: "id >= 3" }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 5,
      outputFields: ["id"],
    }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: d.length > 0, detail: "ids=" + d.map((x) => x.id).join(",") }
    },
  })
  push({
    id: "hybrid_search.rerank-weighted", family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
    param: "rerank(weighted+weights)", intent: "weighted rerank needs weights map (fragment only documents k)",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "weighted", params: { weights: [0.7, 0.3] } },
      limit: 5,
      outputFields: ["id"],
    }),
  })
  push({
    id: "hybrid_search.rerank-omitted", family: "hybrid_search", op: "/entities/hybrid_search", kind: "observe", expect: "record",
    param: "rerank(omitted)", intent: "is rerank optional?",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      limit: 5,
      outputFields: ["id"],
    }),
  })
  push({
    id: "hybrid_search.limit-offset", family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
    param: "limit/offset", intent: "final result paging",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 3, offset: 2,
      outputFields: ["id"],
    }),
    effect: (hh, res) => {
      const d = res.data || []
      const g = Array.isArray(d[0]) ? d[0] : d
      return { ok: g.length === 3, detail: "hits=" + g.length + " shape=" + (Array.isArray(d[0]) ? "nested" : "flat") }
    },
  })
  push({
    id: "hybrid_search.partitionNames", family: "hybrid_search", op: "/entities/hybrid_search", kind: "observe", expect: "record",
    param: "partitionNames(_default)", intent: "scoped to default partition (hybrid rows live in _default)",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 10,
      partitionNames: ["_default"],
      outputFields: ["id"],
    }),
    effect: (hh, res) => {
      const d = res.data || []
      const g = Array.isArray(d[0]) ? d[0] : d
      return { ok: res.code === 0 && g.length > 0, detail: "hits=" + g.length }
    },
  })
  for (const cl of ["Strong", "Session", "Bounded", "Eventually"]) {
    push({
      id: `hybrid_search.consistencyLevel-${cl}`, family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
      param: `consistencyLevel(${cl})`, intent: "enum value",
      body: (hh) => ({
        collectionName: hh.HYBRID,
        search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
        rerank: { strategy: "rrf", params: { k: 60 } },
        limit: 5, consistencyLevel: cl, outputFields: ["id"],
      }),
    })
  }
  push({
    id: "hybrid_search.radius-rangeFilter", family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
    param: "search[].params(radius/range_filter)", intent: "per-sub range search",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub({ params: { radius: 0.5, range_filter: 0.99 } }), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 5, outputFields: ["id"],
    }),
  })
  push({
    id: "hybrid_search.metricType-mismatch", family: "hybrid_search", op: "/entities/hybrid_search", kind: "observe", expect: "record",
    param: "search[].metricType(mismatch)", intent: "COSINE on IP-indexed vec2: rejected or silently re-metriced?",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub({ annsField: "vec2", metricType: "COSINE" }), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 5, outputFields: ["id"],
    }),
    effect: (hh, res) => ({ ok: true, detail: "hits=" + (res.data || []).length + " dist0=" + JSON.stringify((res.data || [])[0] && (res.data || [])[0].distance) }),
  })
  push({
    id: "hybrid_search.ignoreGrowing", family: "hybrid_search", op: "/entities/hybrid_search", kind: "observe", expect: "record",
    param: "search[].ignoreGrowing", intent: "field absent from upstream SubSearchReq struct; if the fresh growing row is visible the flag is a no-op",
    body: async (hh) => {
      await hh.call("/entities/insert", { collectionName: hh.HYBRID, data: [{ id: 999, vec1: hh.hot(0), vec2: hh.hot(0), grp: "gz", price: 1, title: "fresh" }] })
      return {
        collectionName: hh.HYBRID,
        search: [{ data: [hh.hot(0)], annsField: "vec1", limit: 20, filter: "id == 999", ignoreGrowing: true }, { data: [hh.hot(0)], annsField: "vec2", limit: 5, filter: "id == 999" }],
        rerank: { strategy: "rrf", params: { k: 60 } },
        limit: 10, outputFields: ["id"],
      }
    },
    effect: (hh, res) => {
      const d = res.data || []
      const sawIt = ((d[0] || [])).some?.((x) => x.id === 999) || (d[0] || {}).id === 999
      return { ok: res.code === 0, detail: sawIt ? "growing row VISIBLE with ignoreGrowing=true => param ignored" : "growing row not visible (inconclusive or honored)" }
    },
  })
  push({
    id: "hybrid_search.functionScore-decay", family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
    param: "functionScore(decay)", intent: "decay reranker over fused results",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 5,
      functionScore: {
        functions: [{ name: "d", type: "Rerank", inputFieldNames: ["price"], params: { reranker: "decay", function: "linear", origin: 30, scale: 10, offset: 0, decay: 0.5 } }],
      },
      outputFields: ["id"],
    }),
  })
  push({
    id: "hybrid_search.functionChains-merge", family: "hybrid_search", op: "/entities/hybrid_search", kind: "observe", expect: "record",
    param: "functionChains(merge chain, no rerank)", intent: "merge+map+sort+limit chain per upstream test — 2.6.26: wired?",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      limit: 5,
      functionChains: [{
        name: "hyb", stage: "FunctionChainStageL2Rerank",
        ops: [
          { op: "merge", params: { strategy: "rrf" } },
          { op: "map", outputs: ["$score"], expr: { name: "num_combine", args: [{ column: "$score" }, { column: "price" }], params: { mode: "sum" } } },
          { op: "sort", inputs: ["$score"], params: { column: "$score", desc: true } },
          { op: "limit", params: { limit: 3 } },
        ],
      }],
      outputFields: ["id"],
    }),
    effect: (hh, res) => {
      const d = res.data || []
      return { ok: true, detail: "code=" + res.code + " hits=" + d.length + " msg=" + String(res.msg).slice(0, 120) }
    },
  })
  push({
    id: "hybrid_search.grouping", family: "hybrid_search", op: "/entities/hybrid_search", kind: "observe", expect: "record",
    param: "groupingField+groupSize+strictGroupSize", intent: "grouped hybrid search",
    body: (hh) => ({
      collectionName: hh.HYBRID,
      search: [hybridSub(), { data: [hh.hot(3)], annsField: "vec2", limit: 5 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 5, groupSize: 2, strictGroupSize: true,
      groupingField: "grp",
      outputFields: ["id", "grp"],
    }),
  })
  push({
    id: "hybrid_search.dbName", family: "hybrid_search", op: "/entities/hybrid_search", kind: "positive", expect: "ok",
    param: "dbName", intent: "hybrid search inside named database (single annsField)",
    body: (hh) => ({
      dbName: hh.DB2, collectionName: hh.DB2_COLL,
      search: [{ data: [hh.hot(0)], annsField: "vector", limit: 3 }],
      rerank: { strategy: "rrf", params: { k: 60 } },
      limit: 3, outputFields: ["id"],
    }),
  })
  push({
    id: "hybrid_search.search-missing", family: "hybrid_search", op: "/entities/hybrid_search", kind: "negative", expect: "err",
    param: "search(missing)", intent: "doc marks search required",
    body: (hh) => ({ collectionName: hh.HYBRID }),
  })

  // ================= ADMIN FAMILIES (W1 additions, ~55 cases) =================
  // Self-contained lifecycle blocks; safe to run last. "record" verdicts
  // document reality where availability is version/product-dependent.
  const P = ctx.prefix
  push({ id: "admin.collections-list", family: "collections", op: "/collections/list", kind: "positive", expect: "ok", param: "(no body)", intent: "list collections includes fixtures", body: {}, effect: (hh, res) => ({ ok: (res.data || []).includes(hh.BASIC), detail: "n=" + (res.data || []).length }) })
  push({ id: "admin.collections-flush", family: "collections", op: "/collections/flush", kind: "positive", expect: "ok", param: "collectionName", intent: "flush sealed segments", body: (hh) => ({ collectionName: hh.BASIC }) })
  push({ id: "admin.collections-get_stats", family: "collections", op: "/collections/get_stats", kind: "positive", expect: "ok", param: "collectionName", intent: "row count observable", body: (hh) => ({ collectionName: hh.BASIC }), effect: (hh, res) => ({ ok: res.code === 0 && res.data !== undefined, detail: JSON.stringify(res.data).slice(0, 120) }) })
  push({ id: "admin.collections-get_load_state", family: "collections", op: "/collections/get_load_state", kind: "positive", expect: "ok", param: "collectionName", intent: "load state observable", body: (hh) => ({ collectionName: hh.BASIC }), effect: (hh, res) => ({ ok: /Loaded/i.test(String((res.data || {}).loadState || "")), detail: "loadState=" + JSON.stringify(res.data && res.data.loadState) }) })
  push({ id: "admin.collections-compact", family: "collections", op: "/collections/compact", kind: "positive", expect: "ok", param: "collectionName", intent: "compaction job accepted", body: (hh) => ({ collectionName: hh.BASIC }) })
  push({ id: "admin.collections-get_compaction_state", family: "collections", op: "/collections/get_compaction_state", kind: "positive", expect: "ok", param: "collectionName", intent: "compaction state observable", body: (hh) => ({ collectionName: hh.BASIC }) })
  push({ id: "admin.collections-alter_properties", family: "collections", op: "/collections/alter_properties", kind: "observe", expect: "record", param: "properties", intent: "collection property write", body: (hh) => ({ collectionName: hh.BASIC, properties: { "conformance.probe": "v1" } }) })
  push({ id: "admin.collections-drop_properties", family: "collections", op: "/collections/drop_properties", kind: "observe", expect: "record", param: "propertyKeys", intent: "collection property delete", body: (hh) => ({ collectionName: hh.BASIC, propertyKeys: ["conformance.probe"] }) })
  push({
    id: "admin.collections-release-reload", family: "collections", op: "/collections/release", kind: "positive", expect: "ok",
    param: "release then load", intent: "release DB2_COLL then reload (never release fixtures used elsewhere)",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL }),
    effect: async (hh) => {
      const r = await hh.call("/collections/load", { dbName: hh.DB2, collectionName: hh.DB2_COLL })
      return { ok: r.code === 0 || /loaded|already/i.test(String(r.msg)), detail: "reload code=" + r.code }
    },
  })
  push({
    id: "admin.collections-refresh_load", family: "collections", op: "/collections/refresh_load", kind: "observe", expect: "record",
    param: "collectionName", intent: "refresh load with new config",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL }),
  })
  push({
    id: "admin.collections-rename", family: "collections", op: "/collections/rename", kind: "positive", expect: "ok",
    param: "newCollectionName", intent: "rename lifecycle on a disposable collection",
    body: (hh) => ({ collectionName: `${P}_rn_src`, newCollectionName: `${P}_rn_dst` }),
    effect: async (hh, res) => {
      if (res.code !== 0) return { ok: false, detail: "rename failed: " + res.msg }
      const d = await hh.call("/collections/drop", { collectionName: `${P}_rn_dst` })
      return { ok: d.code === 0, detail: "renamed+dropped" }
    },
    // src must exist: fixture created in setupCases (admin.collections-rename-create)
  })
  push({
    id: "admin.collections-truncate", family: "collections", op: "/collections/truncate", kind: "positive", expect: "ok",
    param: "collectionName", intent: "truncate wipes rows, keeps schema",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL }),
  })
  push({
    id: "admin.collections-fields-add", family: "collections", op: "/collections/fields/add", kind: "observe", expect: "record",
    param: "field schema", intent: "dynamic field add (3.0-era; route may be absent on 2.6)",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, field: { fieldName: "extra", dataType: "VarChar", elementTypeParams: { max_length: "32" }, nullable: true } }),
  })
  push({
    id: "admin.collections-fields-drop", family: "collections", op: "/collections/fields/drop", kind: "observe", expect: "record",
    param: "fieldName", intent: "field drop (3.0-era; route may be absent on 2.6)",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, fieldName: "extra" }),
  })
  push({
    id: "admin.collections-add_function", family: "collections", op: "/collections/add_function", kind: "observe", expect: "record",
    param: "function schema", intent: "function add (3.0-era)",
    body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, function: { name: "fn1", type: "unknown" } }),
  })
  push({ id: "admin.collections-alter_function", family: "collections", op: "/collections/alter_function", kind: "observe", expect: "record", param: "function schema", intent: "function alter (3.0-era)", body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, function: { name: "fn1", type: "unknown" } }) })
  push({ id: "admin.collections-drop_function", family: "collections", op: "/collections/drop_function", kind: "observe", expect: "record", param: "functionName", intent: "function drop (3.0-era)", body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, functionName: "fn1" }) })
  push({ id: "admin.collections-add_function_field", family: "collections", op: "/collections/add_function_field", kind: "observe", expect: "record", param: "(3.0-only)", intent: "function-field add (3.0-only route)", body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL }) })
  push({ id: "admin.collections-drop_function_field", family: "collections", op: "/collections/drop_function_field", kind: "observe", expect: "record", param: "(3.0-only)", intent: "function-field drop (3.0-only route)", body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL }) })
  push({ id: "admin.collections-struct_fields-add", family: "collections", op: "/collections/struct_fields/add", kind: "observe", expect: "record", param: "(3.0-only)", intent: "struct-field add (3.0-only route)", body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL }) })
  push({ id: "admin.common-run_analyzer", family: "common", op: "/common/run_analyzer", kind: "observe", expect: "record", param: "analyzerParams", intent: "analyzer probe endpoint", body: { texts: ["hello world"], analyzerParams: { type: "standard" } } })
  push({ id: "admin.jobs-external-refresh", family: "jobs", op: "/jobs/external_collection/refresh", kind: "observe", expect: "record", param: "(3.0-only)", intent: "external collection refresh (3.0-only route)", body: {} })
  push({ id: "admin.jobs-external-describe", family: "jobs", op: "/jobs/external_collection/describe", kind: "observe", expect: "record", param: "(3.0-only)", intent: "external collection job describe (3.0-only route)", body: { jobId: "none" } })
  push({ id: "admin.jobs-external-list", family: "jobs", op: "/jobs/external_collection/list", kind: "observe", expect: "record", param: "(3.0-only)", intent: "external collection job list (3.0-only route)", body: {} })

  // partitions admin
  push({ id: "admin.partitions-list", family: "partitions", op: "/partitions/list", kind: "positive", expect: "ok", param: "collectionName", intent: "list partitions", body: (hh) => ({ collectionName: hh.BASIC }), effect: (hh, res) => ({ ok: (res.data || []).includes("p1"), detail: JSON.stringify(res.data).slice(0, 120) }) })
  push({ id: "admin.partitions-load", family: "partitions", op: "/partitions/load", kind: "positive", expect: "ok", param: "partitionNames", intent: "load single partition", body: (hh) => ({ collectionName: hh.BASIC, partitionNames: ["p1"] }) })
  push({ id: "admin.partitions-release", family: "partitions", op: "/partitions/release", kind: "positive", expect: "ok", param: "partitionNames", intent: "release single partition", body: (hh) => ({ collectionName: hh.BASIC, partitionNames: ["p1"] }) })
  push({ id: "admin.partitions-get_stats", family: "partitions", op: "/partitions/get_stats", kind: "positive", expect: "ok", param: "partitionName", intent: "partition row stats", body: (hh) => ({ collectionName: hh.BASIC, partitionName: "p1" }) })
  push({
    id: "admin.partitions-drop", family: "partitions", op: "skip-request", kind: "positive", expect: "ok",
    param: "partitionName (singular — drop uses PartitionReq; load/release use plural partitionNames)",
    intent: "release→drop lifecycle on disposable partition (drop requires the partition released first, on both tracks)",
    body: {},
    effect: async (hh) => {
      const rel = await hh.call("/partitions/release", { collectionName: hh.BASIC, partitionNames: [`${P}_tmp_p`] })
      const dr = await hh.call("/partitions/drop", { collectionName: hh.BASIC, partitionName: `${P}_tmp_p` })
      if (dr.code !== 0) return { ok: false, detail: "drop failed after release (rel code=" + rel.code + "): " + dr.msg }
      const has = await hh.call("/partitions/has", { collectionName: hh.BASIC, partitionName: `${P}_tmp_p` })
      return { ok: has.code === 0 && has.data && has.data.has === false, detail: "released+dropped, has=false" }
    },
    // fixture created in setupCases (admin.partitions-drop-create)
  })

  // indexes admin
  push({ id: "admin.indexes-describe", family: "indexes", op: "/indexes/describe", kind: "positive", expect: "ok", param: "indexName", intent: "describe vector index (data[] with indexParams key-value pairs)", body: (hh) => ({ collectionName: hh.BASIC, indexName: "vec_hnsw" }), effect: (hh, res) => { const arr = Array.isArray(res.data) ? res.data : []; const idx = arr.find((x) => x.indexName === "vec_hnsw"); const t = idx && (idx.indexParams || []).find((kv) => kv.key === "index_type"); return { ok: !!t && t.value === "HNSW", detail: "index_type=" + (t && t.value) } } })
  push({ id: "admin.indexes-list", family: "indexes", op: "/indexes/list", kind: "positive", expect: "ok", param: "collectionName", intent: "list indexes", body: (hh) => ({ collectionName: hh.BASIC }), effect: (hh, res) => ({ ok: (res.data || []).includes("vec_hnsw"), detail: JSON.stringify(res.data).slice(0, 120) }) })
  push({ id: "admin.indexes-alter_properties", family: "indexes", op: "/indexes/alter_properties", kind: "observe", expect: "record", param: "extraParams", intent: "index property write", body: (hh) => ({ collectionName: hh.BASIC, indexName: "vec_hnsw", properties: { "index.probe": "v1" } }) })
  push({ id: "admin.indexes-drop_properties", family: "indexes", op: "/indexes/drop_properties", kind: "observe", expect: "record", param: "propertyKeys", intent: "index property delete", body: (hh) => ({ collectionName: hh.BASIC, indexName: "vec_hnsw", propertyKeys: ["index.probe"] }) })
  push({
    id: "admin.indexes-drop", family: "indexes", op: "skip-request", kind: "positive", expect: "ok",
    param: "indexName", intent: "create→drop scalar index lifecycle (index type falls back STL_SORT→AUTOINDEX: cloud accepts AUTOINDEX only)",
    body: {},
    effect: async (hh) => {
      const mk = (indexType) => hh.call("/indexes/create", { collectionName: hh.BASIC, indexParams: [{ fieldName: "price", indexName: `${P}_tmp_idx`, indexType }] })
      let r = await mk("STL_SORT")
      if (r.code !== 0) r = await mk("AUTOINDEX")
      if (r.code !== 0) return { ok: false, detail: "create failed both types: " + r.msg }
      const d = await hh.call("/indexes/drop", { collectionName: hh.BASIC, indexName: `${P}_tmp_idx` })
      if (d.code !== 0) return { ok: false, detail: "drop failed: " + d.msg }
      const l = await hh.call("/indexes/list", { collectionName: hh.BASIC })
      return { ok: !(l.data || []).includes(`${P}_tmp_idx`), detail: "created+dropped, gone from list" }
    },
  })

  // aliases
  push({
    id: "admin.aliases-create", family: "aliases", op: "/aliases/create", kind: "positive", expect: "ok",
    param: "aliasName", intent: "alias lifecycle: create",
    body: (hh) => ({ collectionName: hh.BASIC, aliasName: `${P}_alias` }),
  })
  push({
    id: "admin.aliases-describe", family: "aliases", op: "/aliases/describe", kind: "positive", expect: "ok",
    param: "aliasName", intent: "describe resolves to collection",
    body: (hh) => ({ aliasName: `${P}_alias` }),
    effect: (hh, res) => ({ ok: (res.data || {}).collectionName === hh.BASIC, detail: "collectionName=" + JSON.stringify(res.data && res.data.collectionName) }),
  })
  push({
    id: "admin.aliases-list", family: "aliases", op: "/aliases/list", kind: "positive", expect: "ok",
    param: "collectionName", intent: "list aliases for collection",
    body: (hh) => ({ collectionName: hh.BASIC }),
    effect: (hh, res) => ({ ok: (res.data || []).includes(`${P}_alias`), detail: JSON.stringify(res.data).slice(0, 120) }),
  })
  push({
    id: "admin.aliases-alter", family: "aliases", op: "/aliases/alter", kind: "observe", expect: "record",
    param: "aliasName+collectionName", intent: "re-point alias (cross-collection)",
    body: (hh) => ({ collectionName: hh.HYBRID, aliasName: `${P}_alias` }),
  })
  push({
    id: "admin.aliases-drop", family: "aliases", op: "/aliases/drop", kind: "positive", expect: "ok",
    param: "aliasName", intent: "alias lifecycle: drop",
    body: (hh) => ({ aliasName: `${P}_alias` }),
    effect: async (hh, res) => {
      if (res.code !== 0) return { ok: false, detail: "drop failed: " + res.msg }
      const l = await hh.call("/aliases/list", { collectionName: hh.BASIC })
      const inBasic = (l.data || []).includes(`${P}_alias`)
      const l2 = await hh.call("/aliases/list", { collectionName: hh.HYBRID })
      return { ok: !inBasic && !(l2.data || []).includes(`${P}_alias`), detail: "gone from both lists" }
    },
  })

  // roles (created first; users grant/revoke below depend on the role)
  push({ id: "admin.roles-create", family: "roles", op: "/roles/create", kind: "positive", expect: "ok", param: "roleName", intent: "role lifecycle: create", body: { roleName: `${P}_role` } })
  push({ id: "admin.roles-list", family: "roles", op: "/roles/list", kind: "positive", expect: "ok", param: "(no body)", intent: "list roles", body: {}, effect: (hh, res) => ({ ok: (res.data || []).includes(`${P}_role`), detail: "n=" + (res.data || []).length }) })
  push({ id: "admin.roles-describe", family: "roles", op: "/roles/describe", kind: "positive", expect: "ok", param: "roleName", intent: "describe role", body: { roleName: `${P}_role` } })
  push({ id: "admin.roles-grant_privilege", family: "roles", op: "/roles/grant_privilege", kind: "observe", expect: "record", param: "objectType/privilege/objectName", intent: "legacy grant shape", body: { roleName: `${P}_role`, objectType: "Collection", privilege: "Search", objectName: "*" } })
  push({ id: "admin.roles-grant_privilege_v2", family: "roles", op: "/roles/grant_privilege_v2", kind: "observe", expect: "record", param: "privilege/collectionName/dbName", intent: "v2 grant shape (may be absent on 2.6)", body: { roleName: `${P}_role`, privilege: "Search", collectionName: "*", dbName: "*" } })
  push({ id: "admin.roles-revoke_privilege", family: "roles", op: "/roles/revoke_privilege", kind: "observe", expect: "record", param: "objectType/privilege/objectName", intent: "legacy revoke", body: { roleName: `${P}_role`, objectType: "Collection", privilege: "Search", objectName: "*" } })
  push({ id: "admin.roles-revoke_privilege_v2", family: "roles", op: "/roles/revoke_privilege_v2", kind: "observe", expect: "record", param: "privilege/collectionName/dbName", intent: "v2 revoke (may be absent on 2.6)", body: { roleName: `${P}_role`, privilege: "Search", collectionName: "*", dbName: "*" } })
  push({ id: "admin.roles-alter", family: "roles", op: "/roles/alter", kind: "observe", expect: "record", param: "(unknown body shape)", intent: "roles/alter documented shape probe", body: { roleName: `${P}_role` } })

  // users (grant/revoke need the role → runs after roles-create; role dropped after)
  push({ id: "admin.users-create", family: "users", op: "/users/create", kind: "positive", expect: "ok", param: "userName/password", intent: "user lifecycle: create", body: { userName: `${P}_user`, password: "Conf0rm4nce!" } })
  push({ id: "admin.users-describe", family: "users", op: "/users/describe", kind: "positive", expect: "ok", param: "userName", intent: "describe user roles", body: { userName: `${P}_user` } })
  push({ id: "admin.users-list", family: "users", op: "/users/list", kind: "positive", expect: "ok", param: "(no body)", intent: "list users", body: {}, effect: (hh, res) => ({ ok: (res.data || []).includes(`${P}_user`), detail: "n=" + (res.data || []).length }) })
  push({ id: "admin.users-update_password", family: "users", op: "/users/update_password", kind: "positive", expect: "ok", param: "password+newPassword", intent: "password rotation (old password required)", body: { userName: `${P}_user`, password: "Conf0rm4nce!", newPassword: "Conf0rm4nce!2" } })
  push({ id: "admin.users-grant_role", family: "users", op: "/users/grant_role", kind: "positive", expect: "ok", param: "roleName", intent: "attach role", body: { userName: `${P}_user`, roleName: `${P}_role` } })
  push({ id: "admin.users-revoke_role", family: "users", op: "/users/revoke_role", kind: "positive", expect: "ok", param: "roleName", intent: "detach role", body: { userName: `${P}_user`, roleName: `${P}_role` } })
  push({ id: "admin.roles-drop", family: "roles", op: "/roles/drop", kind: "positive", expect: "ok", param: "roleName", intent: "role lifecycle: drop (after users detach)", body: { roleName: `${P}_role` } })
  push({ id: "admin.users-drop", family: "users", op: "/users/drop", kind: "positive", expect: "ok", param: "userName", intent: "user lifecycle: drop", body: { userName: `${P}_user` } })

  // privilege groups
  push({ id: "admin.privilege_groups-create", family: "privilege_groups", op: "/privilege_groups/create", kind: "positive", expect: "ok", param: "groupName/privileges", intent: "group lifecycle: create", body: { privilegeGroupName: `${P}_pg`, privileges: ["CollectionSearch", "CollectionLoad"] } })
  push({ id: "admin.privilege_groups-list", family: "privilege_groups", op: "/privilege_groups/list", kind: "positive", expect: "ok", param: "(no body)", intent: "list groups", body: {} })
  push({ id: "admin.privilege_groups-add", family: "privilege_groups", op: "/privilege_groups/add_privileges_to_group", kind: "observe", expect: "record", param: "privileges", intent: "add privilege to group", body: { privilegeGroupName: `${P}_pg`, privileges: ["CollectionQuery"] } })
  push({ id: "admin.privilege_groups-remove", family: "privilege_groups", op: "/privilege_groups/remove_privileges_from_group", kind: "observe", expect: "record", param: "privileges", intent: "remove privilege from group", body: { privilegeGroupName: `${P}_pg`, privileges: ["CollectionQuery"] } })
  push({ id: "admin.privilege_groups-drop", family: "privilege_groups", op: "/privilege_groups/drop", kind: "positive", expect: "ok", param: "groupName", intent: "group lifecycle: drop", body: { privilegeGroupName: `${P}_pg` } })

  // resource groups
  push({ id: "admin.resource_groups-create", family: "resource_groups", op: "/resource_groups/create", kind: "observe", expect: "record", param: "name", intent: "RG lifecycle: create (quota-dependent)", body: { name: `${P}_rg` } })
  push({ id: "admin.resource_groups-list", family: "resource_groups", op: "/resource_groups/list", kind: "positive", expect: "ok", param: "(no body)", intent: "list resource groups", body: {} })
  push({ id: "admin.resource_groups-describe", family: "resource_groups", op: "/resource_groups/describe", kind: "observe", expect: "record", param: "name", intent: "describe RG", body: { name: `${P}_rg` } })
  push({ id: "admin.resource_groups-alter", family: "resource_groups", op: "/resource_groups/alter", kind: "observe", expect: "record", param: "config", intent: "alter RG config", body: { name: `${P}_rg` } })
  push({ id: "admin.resource_groups-transfer_replica", family: "resource_groups", op: "/resource_groups/transfer_replica", kind: "observe", expect: "record", param: "source/target", intent: "replica transfer (needs loaded replicas)", body: { source: `${P}_rg`, target: "__default_resource_group", collectionName: "__BASIC__", numReplica: 1 } })
  push({ id: "admin.resource_groups-drop", family: "resource_groups", op: "/resource_groups/drop", kind: "observe", expect: "record", param: "name", intent: "RG lifecycle: drop", body: { name: `${P}_rg` } })

  // databases admin (beyond setup)
  push({ id: "admin.databases-list", family: "databases", op: "/databases/list", kind: "positive", expect: "ok", param: "(no body)", intent: "list databases", body: {}, effect: (hh, res) => ({ ok: (res.data || []).includes(hh.DB2), detail: JSON.stringify(res.data).slice(0, 120) }) })
  push({ id: "admin.databases-describe", family: "databases", op: "/databases/describe", kind: "positive", expect: "ok", param: "dbName", intent: "describe database", body: (hh) => ({ dbName: hh.DB2 }) })
  push({ id: "admin.databases-alter", family: "databases", op: "/databases/alter", kind: "observe", expect: "record", param: "properties", intent: "database alter", body: (hh) => ({ dbName: hh.DB2, properties: { "database.probe": "v1" } }) })
  push({ id: "admin.databases-alter_properties", family: "databases", op: "/databases/alter_properties", kind: "observe", expect: "record", param: "properties", intent: "database property write", body: (hh) => ({ dbName: hh.DB2, properties: { "database.probe": "v1" } }) })
  push({ id: "admin.databases-drop_properties", family: "databases", op: "/databases/drop_properties", kind: "observe", expect: "record", param: "propertyKeys", intent: "database property delete", body: (hh) => ({ dbName: hh.DB2, propertyKeys: ["database.probe"] }) })

  // import v2 (needs external bucket fixtures → document reality)
  push({ id: "admin.import-create", family: "import", op: "/jobs/import/create", kind: "observe", expect: "record", param: "files", intent: "import job create (needs bucket fixture)", body: (hh) => ({ dbName: hh.DB2, collectionName: hh.DB2_COLL, files: ["conformance-nonexistent.parquet"] }) })
  push({ id: "admin.import-list", family: "import", op: "/jobs/import/list", kind: "positive", expect: "ok", param: "(no body)", intent: "list import jobs", body: {} })
  push({ id: "admin.import-get_progress", family: "import", op: "/jobs/import/get_progress", kind: "observe", expect: "record", param: "jobId", intent: "progress with unknown id", body: { jobId: "none" } })
  push({ id: "admin.import-describe", family: "import", op: "/jobs/import/describe", kind: "observe", expect: "record", param: "jobId", intent: "describe with unknown id", body: { jobId: "none" } })
  push({ id: "admin.import-abort", family: "import", op: "/jobs/import/abort", kind: "observe", expect: "record", param: "jobId", intent: "abort with unknown id", body: { jobId: "none" } })
  push({ id: "admin.import-commit", family: "import", op: "/jobs/import/commit", kind: "observe", expect: "record", param: "(unknown shape)", intent: "commit probe (3.0-era route)", body: {} })

  // file resources + snapshot jobs (37/38 fragments, 3.0-era routes)
  push({ id: "admin.file_resources-add", family: "file_resources", op: "/file_resources/add", kind: "observe", expect: "record", param: "(3.0-only)", intent: "file resource add probe (3.0-era route; needs real object storage)", body: {} })
  push({ id: "admin.file_resources-list", family: "file_resources", op: "/file_resources/list", kind: "observe", expect: "record", param: "(3.0-only)", intent: "file resource list probe", body: {} })
  push({ id: "admin.file_resources-remove", family: "file_resources", op: "/file_resources/remove", kind: "observe", expect: "record", param: "(3.0-only)", intent: "file resource remove probe", body: {} })
  push({ id: "admin.jobs-snapshot-describe", family: "snapshots", op: "/jobs/snapshot/describe", kind: "observe", expect: "record", param: "(3.0-only)", intent: "snapshot restore-job describe probe", body: { jobId: "none" } })
  push({ id: "admin.jobs-snapshot-list", family: "snapshots", op: "/jobs/snapshot/list", kind: "observe", expect: "record", param: "(3.0-only)", intent: "snapshot restore-job list probe", body: {} })
  push({ id: "admin.jobs-snapshot-export", family: "snapshots", op: "/jobs/snapshot/export", kind: "observe", expect: "record", param: "(3.0-only)", intent: "snapshot export probe (needs snapshot fixture)", body: {} })
  push({ id: "admin.jobs-snapshot-restore", family: "snapshots", op: "/jobs/snapshot/restore_external", kind: "observe", expect: "record", param: "(3.0-only)", intent: "external snapshot restore probe", body: {} })

  // import v1 (absolute paths; 01 fragment)
  push({ id: "admin.importv1-create", family: "import_v1", op: "/v1/vector/collections/import", kind: "observe", expect: "record", param: "(v1 API)", intent: "v1 import create", body: (hh) => ({ collectionName: hh.DB2_COLL, dbName: hh.DB2 }) })
  push({ id: "admin.importv1-get", family: "import_v1", op: "/v1/vector/collections/import/get", kind: "observe", expect: "record", param: "(v1 API)", intent: "v1 import get", body: { jobId: "none" } })
  push({ id: "admin.importv1-list", family: "import_v1", op: "/v1/vector/collections/import/list", kind: "observe", expect: "record", param: "(v1 API)", intent: "v1 import list", body: {} })

  // resolve the __BASIC__ placeholder used in delete.exprParams / transfer_replica
  for (const c of cases) {
    const resolve = (v) => {
      if (typeof v === "string" && v === "__BASIC__") return h.BASIC
      if (Array.isArray(v)) return v.map(resolve)
      if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)]))
      return v
    }
    if (typeof c.body === "object" && c.body) c.body = resolve(c.body)
  }

  return { h, prepare, setupCases, finalize, cases }
}
