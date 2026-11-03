// Control-plane case catalog (Zilliz Cloud API on UAT3) — cloud-track
// fragments 15/18-38. Full lifecycle authorized by the user (2026-11-03):
// resources created by a round carry the suite prefix (run-), are deleted by
// the round's cleanup, and stale prefixed leftovers are swept at start.
// Read cases on pre-existing resources are read-only and never mutate them.

import fs from "node:fs"

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
      id: "setup.region", family: "setup", op: "/v2/regions", method: "GET", kind: "setup", critical: true,
      expect: "ok", param: "(no body)", intent: "discover regionId for cluster lifecycle",
      body: {},
      effect: (hh, res) => {
        const regions = (res.json && res.json.data) || []
        const first = Array.isArray(regions) ? regions.find((r) => r.regionId || r.id) : null
        if (first) state.regionId = first.regionId || first.id
        return { ok: !!state.regionId, detail: "regionId=" + state.regionId }
      },
    },
    {
      id: "setup.existing-cluster", family: "setup", op: "/v2/clusters?pageSize=100", method: "GET", kind: "setup", critical: false,
      expect: "ok", param: "(no body)", intent: "note an existing cluster for read-only describe probes",
      body: {},
      effect: (hh, res) => {
        const list = (res.json && res.json.data && (res.json.data.clusters || res.json.data)) || []
        const first = Array.isArray(list) ? list.find((c) => c.clusterId || c.id) : null
        if (first) { state.existingClusterId = first.clusterId || first.id; state.existingRegionId = first.regionId || state.existingRegionId }
        return { ok: res.code === 0 || res.http === 200, detail: "existing=" + (state.existingClusterId || "none") }
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
    body: { name: `${P}_proj_${Date.now() % 100000}` },
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.projectId = d.projectId || d.id
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

  // ---- cluster lifecycle (serverless: minimal required fields) ----
  push({
    id: "clusters.create-serverless", family: "clusters", op: "/v2/clusters/createServerless", method: "POST", kind: "positive", expect: "ok",
    param: "clusterName/projectId/regionId", intent: "serverless cluster lifecycle: create (required fields per fragment)",
    body: (hh) => ({ clusterName: `${P}_cl_${Date.now() % 100000}`, projectId: PROJECT, regionId: state.regionId }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.clusterId = d.clusterId || d.id
      return { ok: !!state.clusterId, detail: "clusterId=" + (state.clusterId || "none") }
    },
  })
  push({
    id: "clusters.describe-run", family: "clusters", op: "/v2/clusters", method: "GET", kind: "positive", expect: "ok",
    param: "CLUSTER_ID(path)", intent: "describe the run- cluster (poll until RUNNING/ready)",
    body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}`,
    poll: async (hh, res) => {
      if (!state.clusterId) return { ok: false, detail: "no clusterId from create" }
      for (let i = 0; i < 90; i++) {
        const d = await call("GET", `/v2/clusters/${state.clusterId}`)
        const c = (d.json && d.json.data) || {}
        const st = c.clusterStatus || c.status || c.state || ""
        if (/running|available|ready|CRUD_COMPLETED/i.test(String(st)) && !/pending|creating|provisioning/i.test(String(st))) {
          state.clusterReady = true
          return { ok: true, detail: `state=${st} after ~${i * 10}s` }
        }
        await new Promise((r) => setTimeout(r, 10000))
      }
      return { ok: false, detail: "cluster not ready within 15min" }
    },
  })
  push({
    id: "clusters.describe-existing", family: "clusters", op: "/v2/clusters", method: "GET", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "read-only describe of a pre-existing cluster (never mutated)",
    body: {}, url: () => `/v2/clusters/${state.existingClusterId || "none"}`,
  })
  push({
    id: "clusters.suspend", family: "clusters", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "suspend run- cluster (serverless may reject — that is data)",
    body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}/suspend`,
  })
  push({
    id: "clusters.resume", family: "clusters", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "resume run- cluster",
    body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}/resume`,
  })
  push({
    id: "clusters.modify", family: "clusters", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record",
    param: "(modify schema)", intent: "modify dedicated cluster (serverless expected to reject — data)",
    body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}/modify`,
  })
  push({
    id: "clusters.update-patch", family: "clusters", op: "/v2/clusters", method: "PATCH", kind: "observe", expect: "record",
    param: "(update schema)", intent: "PATCH update on run- cluster",
    body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}`,
  })
  push({
    id: "clusters.drop", family: "clusters", op: "/v2/clusters", method: "DELETE", kind: "positive", expect: "ok",
    param: "CLUSTER_ID(path)", intent: "cluster lifecycle: drop run- cluster (cleanup guarantee)",
    body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}/drop`,
    effect: (hh, res) => ({ ok: res.http === 200 || res.code === 0, detail: j(res.json) }),
  })

  // ---- backups (read-only + create attempt on run- cluster) ----
  push({ id: "backups.list", family: "backups", op: "/v2/backups?projectId=" + "PROJECT", method: "GET", kind: "positive", expect: "ok", param: "projectId(query)", intent: "list backups", body: {}, url: (hh) => `/v2/backups?projectId=${PROJECT}` })
  push({ id: "backups.policy-get", family: "backups", op: "/v2/clusters", method: "GET", kind: "observe", expect: "record", param: "(policy)", intent: "backup policy of run- cluster", body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}/backups/policy` })
  push({ id: "backups.policy-set", family: "backups", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record", param: "(policy schema)", intent: "set backup policy on run- cluster", body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}/backups/policy` })
  push({ id: "backups.create-run", family: "backups", op: "/v2/clusters", method: "POST", kind: "observe", expect: "record", param: "(create schema)", intent: "create backup of run- cluster (serverless may reject)", body: {}, url: () => `/v2/clusters/${state.clusterId || "none"}/backups/create` })

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
  push({ id: "storageint.list", family: "storage_integrations", op: "/v2/storageIntegrations", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list storage integrations", body: {}, effect: (hh, res) => { const d = (res.json && res.json.data) || []; const first = Array.isArray(d) && d.find((x) => x.integrationId || x.id); if (first) state.integrationId = first.integrationId || first.id; return { ok: true, detail: "n=" + (Array.isArray(d) ? d.length : "?") } } })
  push({ id: "storageint.describe", family: "storage_integrations", op: "/v2/storageIntegrations", method: "GET", kind: "observe", expect: "record", param: "integrationId(path)", intent: "describe first listed integration (read-only)", body: {}, url: () => `/v2/storageIntegrations/${state.integrationId || "none"}` })
  push({ id: "storageint.validate-bogus", family: "storage_integrations", op: "/v2/storageIntegrations/validate", method: "POST", kind: "observe", expect: "record", param: "(validate schema)", intent: "validate with a non-existent bucket — validation failure shape is the data", body: { provider: "aws", bucketName: "conformance-nonexistent-bucket-zz", region: "us-west-2", accessKey: "AKIAZZZZ", secretKey: "zzzz" } })
  push({ id: "storageint.auth-materials", family: "storage_integrations", op: "/v2/storageIntegrations/authorizationMaterials", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "generate authorization materials (empty body → validation shape)", body: {} })

  async function cleanup() {
    for (const [label, doIt] of [
      ["cluster", () => state.clusterId && call("DELETE", `/v2/clusters/${state.clusterId}/drop`, {})],
      ["api-key", () => state.apiKeyId && call("DELETE", `/v2/api-keys/${state.apiKeyId}`)],
      ["project", () => state.projectId && call("DELETE", `/v2/projects/${state.projectId}`)],
    ]) {
      try { if (doIt) { const r = await doIt(); console.log(`# cleanup ${label}: ${r && (r.http || r.code)}`) } } catch (e) { console.error(`# cleanup ${label} failed:`, e && e.message) }
    }
  }

  return { h: { state, PROJECT }, prepare: async () => {}, setupCases, finalize: async () => {}, cases, cleanup }
}
