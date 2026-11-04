// Shared dataplane fixture recipes (pure definitions — no mutable state lives
// here; each suite instantiates its own resource names via ctx.prefix).
// Ported verbatim from reports/2026-11-01/rest-v2-param-tests.mjs so every
// suite replays the same seeded world.

export const DIM = 8

export function buildFixtureHelpers(h) {
  const { call } = h
  const ctx = h.ctx
  const hot = (i) => { const v = Array(DIM).fill(0.1); v[((i % DIM) + DIM) % DIM] = 0.9; return v }

  const BASIC = `${ctx.prefix}_basic`
  const HYBRID = `${ctx.prefix}_hybrid`
  const DB2 = `${ctx.prefix}_db2`
  const DB2_COLL = `${ctx.prefix}_db2coll`

  const basicSchema = () => ({
    autoId: false,
    enableDynamicField: true,
    fields: [
      { fieldName: "id", dataType: "Int64", isPrimary: true, elementTypeParams: {} },
      { fieldName: "vector", dataType: "FloatVector", elementTypeParams: { dim: String(DIM) } },
      { fieldName: "title", dataType: "VarChar", elementTypeParams: { max_length: "64" } },
      { fieldName: "tags", dataType: "Array", elementDataType: "VarChar", elementTypeParams: { max_capacity: "16", max_length: "32" } },
      { fieldName: "meta", dataType: "JSON", elementTypeParams: {} },
      { fieldName: "price", dataType: "Int32", elementTypeParams: {} },
      { fieldName: "grp", dataType: "VarChar", elementTypeParams: { max_length: "16" } },
    ],
  })

  const basicRow = (i, part) => ({
    id: i,
    vector: hot(i),
    title: (part === "p1" ? "alpha-" : "beta-") + i,
    tags: part === "p1" ? ["a", "b"] : ["b", "c"],
    meta: { cat: part === "p1" ? "x" : "y", n: i },
    price: i * 10,
    grp: part === "p1" ? (i <= 3 ? "g1" : "g2") : "g3",
  })

  const fcL2 = (extraOps = []) => [{
    name: "l2_score_plus_ts",
    stage: "FunctionChainStageL2Rerank",
    ops: [
      {
        op: "map", outputs: ["$score"],
        expr: { name: "num_combine", args: [{ column: "$score" }, { column: "price" }], params: { mode: "sum" } },
      },
      { op: "sort", inputs: ["$score"], params: { column: "$score", desc: true } },
      ...extraOps,
    ],
  }]

  const wait = (ms) => new Promise((r) => setTimeout(r, ms))

  const q = async (filter, extra = {}) => {
    const r = await call("/entities/query", { collectionName: BASIC, filter, outputFields: ["*"], consistencyLevel: "Strong", ...extra })
    if (r.code !== 0) throw new Error("query failed: " + r.msg + " | filter=" + filter)
    return r.data || []
  }

  const loadAndWait = async (coll, dbName) => {
    const r = await call("/collections/load", dbName ? { dbName, collectionName: coll } : { collectionName: coll })
    if (r.code !== 0 && !/loaded|already/i.test(String(r.msg))) throw new Error("load failed: " + r.msg)
    for (let i = 0; i < 60; i++) {
      const d = await call("/collections/describe", dbName ? { dbName, collectionName: coll } : { collectionName: coll })
      const st = d.data && (d.data.loadState || d.data.load)
      if (st && /Loaded/i.test(String(st)) && !/Loading/i.test(String(st))) return
      await wait(1000)
    }
    throw new Error("load timeout: " + coll)
  }

  const createHybrid = async () => {
    const r = await call("/collections/create", {
      collectionName: HYBRID,
      schema: {
        autoId: false,
        enableDynamicField: false,
        fields: [
          { fieldName: "id", dataType: "Int64", isPrimary: true, elementTypeParams: {} },
          { fieldName: "vec1", dataType: "FloatVector", elementTypeParams: { dim: String(DIM) } },
          { fieldName: "vec2", dataType: "FloatVector", elementTypeParams: { dim: String(DIM) } },
          { fieldName: "grp", dataType: "VarChar", elementTypeParams: { max_length: "16" } },
          { fieldName: "price", dataType: "Int32", elementTypeParams: {} },
          { fieldName: "title", dataType: "VarChar", elementTypeParams: { max_length: "32" } },
        ],
      },
      indexParams: [
        { fieldName: "vec1", indexName: "v1", indexType: "HNSW", metricType: "COSINE", params: { M: 16, efConstruction: 200 } },
        { fieldName: "vec2", indexName: "v2", indexType: "HNSW", metricType: "IP", params: { M: 16, efConstruction: 200 } },
      ],
    })
    if (r.code !== 0) throw new Error("create hybrid failed: " + r.msg)
  }

  const createDb2 = async () => {
    let r = await call("/databases/create", { dbName: DB2 })
    if (r.code !== 0 && !/exist/i.test(r.msg)) throw new Error("create db failed: " + r.msg)
    r = await call("/collections/create", {
      dbName: DB2,
      collectionName: DB2_COLL,
      schema: {
        autoId: false, enableDynamicField: false,
        fields: [
          { fieldName: "id", dataType: "Int64", isPrimary: true, elementTypeParams: {} },
          { fieldName: "vector", dataType: "FloatVector", elementTypeParams: { dim: String(DIM) } },
          { fieldName: "price", dataType: "Int32", elementTypeParams: {} },
        ],
      },
      indexParams: [{ fieldName: "vector", indexName: "v", indexType: "FLAT", metricType: "COSINE" }],
    })
    if (r.code !== 0) throw new Error("create db2 collection failed: " + r.msg)
  }

  const seed = async () => {
    const rowsP1 = [1, 2, 3, 4, 5, 6].map((i) => basicRow(i, "p1"))
    const rowsP2 = [7, 8, 9, 10, 11, 12].map((i) => basicRow(i, "p2"))
    const rowsP3 = [21, 22, 23].map((i) => ({ ...basicRow(i, "p3"), price: 5, tags: [], meta: {} }))
    const exp = []
    for (let i = 100; i <= 106; i++) {
      exp.push({ id: i, vector: hot(i), title: "orig-" + i, tags: ["x"], meta: { a: { b: 1 }, keep: "yes" }, price: 1, grp: "gx" })
    }
    exp.push({ id: 6, vector: hot(6), title: "alpha-6", tags: ["a", "b"], meta: { cat: "x", n: 6 }, price: 60, grp: "g2", dyn_flag: "yes" })
    let r = await call("/entities/insert", { collectionName: BASIC, partitionName: "p1", data: [...rowsP1, ...exp] })
    if (r.code !== 0) throw new Error("seed p1 failed: " + r.msg)
    r = await call("/entities/insert", { collectionName: BASIC, partitionName: "p2", data: rowsP2 })
    if (r.code !== 0) throw new Error("seed p2 failed: " + r.msg)
    r = await call("/entities/insert", { collectionName: BASIC, partitionName: "p3", data: rowsP3 })
    if (r.code !== 0) throw new Error("seed p3 failed: " + r.msg)
    const hrows = []
    for (let i = 1; i <= 10; i++) {
      hrows.push({ id: i, vec1: hot(i), vec2: hot(i + 3), grp: i % 2 === 0 ? "g1" : "g2", price: i, title: "h-" + i })
    }
    r = await call("/entities/insert", { collectionName: HYBRID, data: hrows })
    if (r.code !== 0) throw new Error("seed hybrid failed: " + r.msg)
    r = await call("/entities/insert", { dbName: DB2, collectionName: DB2_COLL, data: [{ id: 200, vector: hot(0), price: 7 }] })
    if (r.code !== 0) throw new Error("seed db2 failed: " + r.msg)
  }

  // Post-setup: create remaining fixtures, load all, seed (drops live in prepare).
  const bootstrap = async () => {
    await createHybrid()
    await createDb2()
    await loadAndWait(BASIC)
    await loadAndWait(HYBRID)
    await loadAndWait(DB2_COLL, DB2)
    await seed()
    const rows = await q("id >= 1")
    if (rows.length < 15) throw new Error("bootstrap sanity failed: rows=" + rows.length)
  }

  return { ctx, call, BASIC, HYBRID, DB2, DB2_COLL, hot, basicSchema, basicRow, fcL2, q, wait, loadAndWait, bootstrap }
}
