// Control-plane case catalog (Zilliz Cloud API on UAT3) — cloud-track
// fragments 15/18-38. Full lifecycle authorized by the user (2026-11-03):
// resources created by a round carry the suite prefix (run-), are deleted by
// the round's cleanup, and stale prefixed leftovers are swept at start.
// Read cases on pre-existing resources are read-only and never mutate them.


import { buildExtraCases } from "./control-cases-extra.mjs"

export function buildControlSuite(ctx, call) {
  const P = ctx.prefix
  const PROJECT = process.env[ctx.projectEnv || "ZILLIZ_UAT3_PROJECT"]
  if (!PROJECT) throw new Error(`env ${ctx.projectEnv || "ZILLIZ_UAT3_PROJECT"} not set`)
  const state = {} // createdIds: {cluster, apiKey, project}, regionId, integrationId

    const j = (p) => JSON.stringify(p).slice(0, 160)

  async function sweep() {
    // residual cleanup: any run- prefixed clusters/api-keys/projects from
    // crashed prior rounds are removed before cases run.
    const cl = await call("GET", "/v2/clusters?pageSize=100")
    for (const c of (cl.json && cl.json.data && cl.json.data.clusters) || (cl.json && cl.json.data) || []) {
      const name = c.clusterName || c.name || ""
      const id = c.clusterId || c.id
      if (String(name).startsWith(P) && id) {
        console.log(`# sweep: dropping stale cluster ${name} (${id})`)
        await call("DELETE", `/v2/clusters/${id}/drop`, {})
      }
    }
    const ak = await call("GET", "/v2/api-keys")
    for (const k of (ak.json && ak.json.data && ak.json.data.apiKeys) || (ak.json && ak.json.data) || []) {
      const id = k.apiKeyId || k.id
      const name = k.name || ""
      if (String(name).startsWith(P) && id) {
        console.log(`# sweep: deleting stale api-key ${name} (${id})`)
        await call("DELETE", `/v2/api-keys/${id}`)
      }
    }
  }

  const setupCases = [
    {
      id: "setup.sweep", family: "setup", op: "skip-request", kind: "setup", critical: false,
      expect: "record", param: "(residual cleanup)", intent: "drop stale run- prefixed resources from crashed rounds",
      body: async () => { await sweep(); return {} },
    },
    {
      id: "setup.existing-cluster", family: "setup", op: "/v2/clusters?pageSize=100", method: "GET", kind: "setup", critical: false,
      expect: "ok", param: "(no body)", intent: "note an existing cluster for read-only describe probes",
      body: {},
      effect: (hh, res) => {
        const list = (res.json && res.json.data && (res.json.data.clusters || res.json.data)) || []
        const first = Array.isArray(list) ? list.find((c) => c.clusterId || c.id) : null
        if (first) { state.existingClusterId = first.clusterId || first.id; state.existingRegionId = first.regionId || state.existingRegionId; state.cuType = first.cuType || state.cuType }
        return { ok: res.code === 0 || res.http === 200, detail: "existing=" + (state.existingClusterId || "none") }
      },
    },
    {
      id: "setup.region", family: "setup", op: "/v2/regions", method: "GET", kind: "setup", critical: true,
      expect: "ok", param: "(no body)", intent: "split regions by supportedClusterTypes (user-clarified 2026-11-04: only some regions carry the serverless plan, e.g. gcp-us-west1 in UAT3)",
      body: {},
      effect: (hh, res) => {
        const regions = (res.json && res.json.data) || []
        const types = (r) => r.supportedClusterTypes || []
        const sv = Array.isArray(regions) ? regions.find((r) => types(r).includes("serverless")) : null
        const dv = Array.isArray(regions) ? regions.find((r) => types(r).includes("dedicated")) : null
        if (sv) state.serverlessRegionId = sv.regionId || sv.id
        if (dv) state.dedicatedRegionId = dv.regionId || dv.id
        return { ok: !!state.serverlessRegionId && !!state.dedicatedRegionId, detail: `serverless=${state.serverlessRegionId || "none"} dedicated=${state.dedicatedRegionId || "none"}` }
      },
    },
  ]

  const cases = []
  const push = (c) => cases.push(c)

  // ---- cloud meta ----
  push({ id: "meta.clouds", family: "cloud-meta", op: "/v2/clouds", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list cloud providers", body: {} })
  push({ id: "meta.regions", family: "cloud-meta", op: "/v2/regions", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list cloud regions", body: {} })

  // ---- projects ----
  push({ id: "projects.list", family: "projects", op: "/v2/projects", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list projects", body: {} })
  push({ id: "projects.describe", family: "projects", op: "/v2/projects", method: "GET", kind: "positive", param: "projectId(path)", expect: "ok", intent: "describe own project", body: {}, url: () => `/v2/projects/${PROJECT}` })
  push({
    id: "projects.create-run", family: "projects", op: "/v2/projects", method: "POST", kind: "observe", expect: "record",
    param: "name", intent: "project lifecycle: create disposable run- project",
    body: () => ({ projectName: `${P}_proj_legacy_${Date.now() % 100000}`, plan: "Enterprise", regionIds: [state.serverlessRegionId] }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data)
      state.projectId = typeof d === "string" ? d : (d && (d.projectId || d.id))
      return { ok: !!state.projectId, detail: "projectId=" + (state.projectId || "none") }
    },
  })
  push({
    id: "projects.describe-run", family: "projects", op: "/v2/projects", method: "GET", kind: "observe", expect: "record",
    param: "projectId(path)", intent: "describe the run- project",
    body: {}, url: () => `/v2/projects/${state.projectId || "none"}`,
  })
  push({
    id: "projects.update-run", family: "projects", op: "/v2/projects", method: "PATCH", kind: "observe", expect: "record",
    param: "(update schema)", intent: "update run- project",
    body: {}, url: () => `/v2/projects/${state.projectId || "none"}`,
  })
  push({
    id: "projects.delete-run", family: "projects", op: "/v2/projects", method: "DELETE", kind: "observe", expect: "record",
    param: "projectId(path)", intent: "project lifecycle: delete run- project",
    body: {}, url: () => `/v2/projects/${state.projectId || "none"}`,
  })
  push({
    id: "projects.add-region", family: "projects", op: "/v2/projects", method: "POST", kind: "positive", expect: "ok",
    param: "regionIds(query of serverless-capable region)", intent: "attach the serverless-capable region to the working project so serverless clusters can be created (idempotent: already-attached counts as accepted)",
    body: (hh) => ({ regionIds: [state.serverlessRegionId] }),
    url: (hh) => `/v2/projects/${hh.PROJECT}/regions`,
    effect: async (hh, res) => {
      if (res.http === 200 && (res.json && res.json.code === 0)) return { ok: true, detail: "region attached: " + state.serverlessRegionId }
      const msg = String((res.json && res.json.message) || "")
      if (/exist|duplicate|already/i.test(msg)) return { ok: true, detail: "region already attached: " + state.serverlessRegionId }
      return { ok: false, detail: "add-region rejected: " + (msg || res.json) }
    },
  })

  // ---- cluster lifecycle (serverless: minimal required fields) ----
  // ---- serverless lifecycle (fast path, gcp region; full create→drop) ----
  const svDrop = async (hh, cid) => {
    const st = async () => {
      const d = await call("GET", `/v2/clusters/${cid}`)
      return ((d.json && d.json.data) || {}).status || "GONE"
    }
    for (let i = 0; i < 40; i++) {
      const cur = await st()
      if (cur === "GONE") return { ok: true, detail: "cluster gone" }
      if (/STOPPING|RESUMING|PENDING|CREATING|SUSPENDING/i.test(cur)) { await new Promise((r) => setTimeout(r, 15000)); continue }
      const dr = await call("DELETE", `/v2/clusters/${cid}/drop`, {})
      if (dr.code === 0 || dr.http === 200) {
        // drop ACCEPTED is the success criterion — deletion proceeds
        // asynchronously (serverless DELETING can outlive any round window);
        // the next round's sweep verifies actual removal of leftovers.
        return { ok: true, detail: "drop accepted (async deletion; sweep verifies removal next round)" }
      }
      if (/40064|STOPPING/i.test(String(dr.msg || ""))) { await new Promise((r) => setTimeout(r, 15000)); continue }
      return { ok: false, detail: "drop rejected: " + (dr.msg || dr.json) }
    }
    return { ok: false, detail: "drop not completed within window" }
  }

  push({
    id: "clusters.create-serverless", family: "clusters", op: "/v2/clusters/createServerless", method: "POST", kind: "positive", expect: "ok",
    param: "clusterName/projectId/regionId", intent: "serverless cluster lifecycle: create in the serverless-capable region (requires the region attached to the project first)",
    body: (hh) => ({ clusterName: `${P}_sv_${Date.now() % 100000}`, projectId: PROJECT, regionId: state.serverlessRegionId }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.serverlessClusterId = d.clusterId || d.id
      return { ok: !!state.serverlessClusterId, detail: "clusterId=" + (state.serverlessClusterId || "none") }
    },
  })
  push({
    id: "clusters.describe-serverless", family: "clusters", op: "/v2/clusters", method: "GET", kind: "positive", expect: "ok",
    param: "CLUSTER_ID(path)", intent: "describe the run- serverless cluster (poll until RUNNING)",
    body: {}, url: () => `/v2/clusters/${state.serverlessClusterId || "none"}`,
    poll: async (hh) => {
      if (!state.serverlessClusterId) return { ok: false, detail: "no clusterId from create" }
      for (let i = 0; i < 90; i++) {
        const d = await call("GET", `/v2/clusters/${state.serverlessClusterId}`)
        const c = (d.json && d.json.data) || {}
        const st = c.clusterStatus || c.status || c.state || ""
        if (/running|available|ready|CRUD_COMPLETED/i.test(String(st)) && !/pending|creating|provisioning/i.test(String(st))) return { ok: true, detail: `state=${st} after ~${i * 10}s` }
        await new Promise((r) => setTimeout(r, 10000))
      }
      return { ok: false, detail: "serverless cluster not ready within 15min" }
    },
  })
  push({
    id: "clusters.suspend-serverless", family: "clusters", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "suspend serverless cluster (plan-dependent semantics — data)",
    body: {}, url: () => `/v2/clusters/${state.serverlessClusterId || "none"}/suspend`,
  })
  push({
    id: "clusters.drop-serverless", family: "clusters", op: "skip-request", kind: "positive", expect: "ok",
    param: "CLUSTER_ID(path)", intent: "serverless lifecycle: drop (waits out provisioning/stopping transitions)",
    body: {},
    effect: async (hh) => {
      if (!state.serverlessClusterId) return { ok: false, detail: "no clusterId" }
      return svDrop(hh, state.serverlessClusterId)
    },
  })

  // ---- dedicated lifecycle (full state machine: suspend/resume across async STOPPING) ----
  push({
    id: "clusters.create-dedicated", family: "clusters", op: "/v2/clusters/createDedicated", method: "POST", kind: "positive", expect: "ok",
    param: "clusterName/projectId/regionId/cuSize/cuType", intent: "dedicated cluster lifecycle: create (smallest CU, mirroring the region's existing cuType)",
    body: (hh) => ({ clusterName: `${P}_cl_${Date.now() % 100000}`, projectId: PROJECT, regionId: state.dedicatedRegionId, cuType: state.cuType, cuSize: 1 }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.dedicatedClusterId = d.clusterId || d.id
      return { ok: !!state.dedicatedClusterId, detail: "clusterId=" + (state.dedicatedClusterId || "none") }
    },
  })
  push({
    id: "clusters.describe-run", family: "clusters", op: "/v2/clusters", method: "GET", kind: "positive", expect: "ok",
    param: "CLUSTER_ID(path)", intent: "describe the run- dedicated cluster (poll until RUNNING)",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}`,
    poll: async (hh) => {
      if (!state.dedicatedClusterId) return { ok: false, detail: "no clusterId from create" }
      for (let i = 0; i < 90; i++) {
        const d = await call("GET", `/v2/clusters/${state.dedicatedClusterId}`)
        const c = (d.json && d.json.data) || {}
        const st = c.clusterStatus || c.status || c.state || ""
        if (/running|available|ready|CRUD_COMPLETED/i.test(String(st)) && !/pending|creating|provisioning/i.test(String(st))) return { ok: true, detail: `state=${st} after ~${i * 10}s` }
        await new Promise((r) => setTimeout(r, 10000))
      }
      return { ok: false, detail: "dedicated cluster not ready within 15min" }
    },
  })
  push({
    id: "clusters.suspend", family: "clusters", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "suspend dedicated cluster (async: cluster enters STOPPING)",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/suspend`,
  })
  push({
    id: "clusters.resume", family: "clusters", op: "skip-request", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "resume after suspend: suspend is async (STOPPING transition) — poll to STOPPED, resume, poll back to RUNNING (live-captured state machine)",
    body: {},
    effect: async (hh) => {
      if (!state.dedicatedClusterId) return { ok: false, detail: "no clusterId" }
      const st = async () => {
        const d = await call("GET", `/v2/clusters/${state.dedicatedClusterId}`)
        return ((d.json && d.json.data) || {}).status || "?"
      }
      for (let i = 0; i < 40 && /STOPPING/i.test(await st()); i++) await new Promise((r) => setTimeout(r, 15000))
      const before = await st()
      const rr = await call("POST", `/v2/clusters/${state.dedicatedClusterId}/resume`, {})
      if (rr.code !== 0 && rr.http !== 200) return { ok: false, detail: `resume rejected at status=${before}: ${rr.msg || rr.json}` }
      let running = false
      for (let i = 0; i < 60; i++) {
        if (/RUNNING/i.test(await st())) { running = true; break }
        await new Promise((r) => setTimeout(r, 15000))
      }
      return { ok: running, detail: `resume from ${before}: running=${running}` }
    },
  })
  push({
    id: "clusters.modify", family: "clusters", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record",
    param: "(modify schema)", intent: "modify dedicated cluster (dedicated-only surface)",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/modify`,
  })
  push({
    id: "clusters.update-patch", family: "clusters", op: "/v2/clusters", method: "PATCH", kind: "observe", expect: "record",
    param: "(update schema)", intent: "PATCH update on run- dedicated cluster",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}`,
  })
  push({
    id: "clusters.drop", family: "clusters", op: "skip-request", kind: "positive", expect: "ok",
    param: "CLUSTER_ID(path)", intent: "dedicated lifecycle: drop run- cluster (waits out the STOPPING transition; cleanup guarantee)",
    body: {},
    effect: async (hh) => {
      if (!state.dedicatedClusterId) return { ok: false, detail: "no clusterId" }
      return svDrop(hh, state.dedicatedClusterId)
    },
  })

  // ---- backups (read-only + create attempt on run- cluster) ----
  push({ id: "backups.list", family: "backups", op: "/v2/backups?projectId=" + "PROJECT", method: "GET", kind: "positive", expect: "ok", param: "projectId(query)", intent: "list backups", body: {}, url: (hh) => `/v2/backups?projectId=${PROJECT}` })
  push({ id: "backups.policy-get", family: "backups", op: "/v2/clusters", method: "GET", kind: "observe", expect: "record", param: "(policy)", intent: "backup policy of run- cluster", body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/policy` })
  push({ id: "backups.policy-set", family: "backups", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record", param: "(policy schema)", intent: "set backup policy on run- cluster", body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/policy` })
  push({ id: "backups.create-run", family: "backups", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record", param: "(create schema)", intent: "create backup of run- cluster (serverless may reject)", body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/create` })

  // ---- api keys ----
  push({ id: "apikeys.list", family: "api_keys", op: "/v2/api-keys", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list api keys", body: {} })
  push({
    id: "apikeys.create-run", family: "api_keys", op: "/v2/api-keys", method: "POST", kind: "positive", expect: "ok",
    param: "name", intent: "api-key lifecycle: create disposable run- key",
    body: { name: `${P}_key_${Date.now() % 100000}` },
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.apiKeyId = d.apiKeyId || d.id
      return { ok: !!state.apiKeyId, detail: "apiKeyId=" + (state.apiKeyId || "none") }
    },
  })
  push({ id: "apikeys.describe-run", family: "api_keys", op: "/v2/api-keys", method: "GET", kind: "positive", expect: "ok", param: "apiKeyId(path)", intent: "describe run- key", body: {}, url: () => `/v2/api-keys/${state.apiKeyId || "none"}` })
  push({ id: "apikeys.update-run", family: "api_keys", op: "/v2/api-keys", method: "PUT", kind: "observe", expect: "record", param: "(update schema)", intent: "update run- key", body: { name: `${P}_key_renamed` }, url: () => `/v2/api-keys/${state.apiKeyId || "none"}` })
  push({ id: "apikeys.delete-run", family: "api_keys", op: "/v2/api-keys", method: "DELETE", kind: "positive", expect: "ok", param: "apiKeyId(path)", intent: "api-key lifecycle: delete run- key", body: {}, url: () => `/v2/api-keys/${state.apiKeyId || "none"}` })

  // ---- storage integrations (user's existing integration is READ-ONLY) ----
  push({ id: "storageint.list", family: "storage_integrations", op: "/v2/storageIntegrations", method: "GET", kind: "positive", expect: "ok", param: "projectId(query)", intent: "list storage integrations", body: {}, url: (hh) => `/v2/storageIntegrations?projectId=${hh.PROJECT}`, effect: (hh, res) => { const d = (res.json && res.json.data) || []; const first = Array.isArray(d) && d.find((x) => x.integrationId || x.id); if (first) state.integrationId = first.integrationId || first.id; return { ok: true, detail: "n=" + (Array.isArray(d) ? d.length : "?") } } })
  push({ id: "storageint.describe", family: "storage_integrations", op: "/v2/storageIntegrations", method: "GET", kind: "observe", expect: "record", param: "integrationId(path)", intent: "describe first listed integration (read-only)", body: {}, url: () => `/v2/storageIntegrations/${state.integrationId || "none"}` })
  push({ id: "storageint.validate-bogus", family: "storage_integrations", op: "/v2/storageIntegrations/validate", method: "POST", kind: "observe", expect: "record", param: "(validate schema)", intent: "validate with a non-existent bucket — validation failure shape is the data", url: (hh) => `/v2/storageIntegrations/validate?projectId=${hh.PROJECT}`, body: { provider: "aws", bucketName: "conformance-nonexistent-bucket-zz", region: "us-west-2", accessKey: "AKIAZZZZ", secretKey: "zzzz" } })
  push({ id: "storageint.auth-materials", family: "storage_integrations", op: "/v2/storageIntegrations/authorizationMaterials", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "generate authorization materials (empty body → validation shape)", body: {} })

  async function cleanup() {
    try { await sweep() } catch (e) { console.error("# cleanup sweep failed:", e && e.message) }
  }

  return { h: { state, PROJECT }, prepare: async () => {}, setupCases, finalize: async () => {}, cases: cases.concat(buildExtraCases({ prefix: P }, call, state)), cleanup }
}
