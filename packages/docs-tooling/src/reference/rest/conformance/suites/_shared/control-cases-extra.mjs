// Control-plane coverage extension (2026-11-04 gap closure): probes for every
// cloud-track operation declared in the fragments but missing from the original
// catalog (95-op gap). Policy per family:
//   - read-only GETs: expect ok (real list/describe)
//   - cheap-org-resource lifecycles (alert rules, cloud roles, volumes): full
//     create→use→delete chains on run- prefixed resources
//   - heavy/billing/fixture-gated surfaces (migrations, restores, global
//     cluster writes, spark job creation, private endpoints, ETL): empty-body
//     validation-shape probes, expect record — the server's rejection shape is
//     the documented data; real chains stay out until explicitly authorized.
// Every case id is `extra.` prefixed to keep golden/result namespaces distinct.

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export function buildExtraCases(ctx, call, state) {
  const P = ctx.prefix
  const PROJECT = () => state.PROJECT
  const cases = []
  const push = (c) => cases.push(c)

  // ---- projects: real create (plan required per fragment) + upgrade probe ----
  push({
    id: "extra.projects.create-full", family: "projects", op: "/v2/projects", method: "POST", kind: "positive", expect: "ok",
    param: "projectName/plan/regionIds", intent: "create run- project with required plan + serverless region (fragment requires plan)",
    body: () => ({ projectName: `${P}_proj_${Date.now() % 100000}`, plan: "Enterprise", regionIds: [state.serverlessRegionId] }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data)
      state.projectId = (typeof d === "string" ? d : (d && (d.projectId || d.id))) || state.projectId
      return { ok: !!state.projectId, detail: "projectId=" + state.projectId }
    },
  })
  push({
    id: "extra.projects.upgrade-plan", family: "projects", op: "/v2/projects", method: "PATCH", kind: "observe", expect: "record",
    param: "(plan schema)", intent: "upgrade-project probe on working project — billing surface, empty body documents validation shape without changing anything",
    body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/plan`,
  })

  push({
    id: "extra.projects.remove-region", family: "projects", op: "/v2/projects/{projectId}/regions/{regionId}", method: "DELETE", kind: "observe", expect: "record",
    param: "regionId(path)", intent: "remove-region probe with bogus regionId — not-found shape (the serverless-capable region stays attached; removal is a deliberate operation, never a side effect)",
    body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/regions/none`,
  })

  // ---- clusters: free lifecycle (gcp region supports free) + modifyReplica ----
  push({
    id: "extra.clusters.create-free", family: "clusters", op: "/v2/clusters/createFree", method: "POST", kind: "observe", expect: "record",
    param: "clusterName/projectId/regionId", intent: "free cluster lifecycle: create in the free-capable region (region-supported per /v2/regions)",
    body: () => ({ clusterName: `${P}_free_${Date.now() % 100000}`, projectId: PROJECT(), regionId: state.serverlessRegionId }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.freeClusterId = d.clusterId || d.id || null
      return { ok: true, detail: "freeClusterId=" + (state.freeClusterId || "none (rejected — plan/quota data)") }
    },
  })
  push({
    id: "extra.clusters.describe-free", family: "clusters", op: "/v2/clusters", method: "GET", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "poll run- free cluster to RUNNING (skipped gracefully when create was rejected)",
    body: {}, url: () => `/v2/clusters/${state.freeClusterId || "none"}`,
    effect: async (hh) => {
      if (!state.freeClusterId) return { ok: true, detail: "no free cluster created — skipped" }
      for (let i = 0; i < 60; i++) {
        const d = await call("GET", `/v2/clusters/${state.freeClusterId}`)
        const st = (((d.json || {}).data) || {}).status || ""
        if (/RUNNING/i.test(st)) return { ok: true, detail: `state=${st} after ~${i * 10}s` }
        if (/FAILED|ERROR/i.test(st)) return { ok: false, detail: "free cluster failed: " + st }
        await wait(10000)
      }
      return { ok: false, detail: "free cluster not ready within 10min" }
    },
  })
  push({
    id: "extra.clusters.drop-free", family: "clusters", op: "skip-request", kind: "observe", expect: "record",
    param: "CLUSTER_ID(path)", intent: "free lifecycle: drop (acceptance semantics; no-op when create was rejected)",
    body: {},
    effect: async (hh) => {
      if (!state.freeClusterId) return { ok: true, detail: "no free cluster to drop" }
      const dr = await call("DELETE", `/v2/clusters/${state.freeClusterId}/drop`, {})
      return { ok: dr.code === 0 || dr.http === 200, detail: "drop accepted=" + (dr.code === 0 || dr.http === 200) + " " + String(dr.msg || "").slice(0, 80) }
    },
  })
  push({
    id: "extra.clusters.modifyReplica", family: "clusters", op: "/v2/clusters/{CLUSTER_ID}/modifyReplica", method: "POST", kind: "observe", expect: "record",
    param: "replica", intent: "replica count change on the run- dedicated cluster (needs loaded replicas)",
    body: { replica: 1 }, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/modifyReplica`,
  })

  // ---- backups: full chain on the run- dedicated cluster ----
  push({
    id: "extra.backups.create-manual", family: "backups", op: "/v2/clusters/{CLUSTER_ID}/backups/create", method: "POST", kind: "observe", expect: "record",
    param: "backupType/dbCollections", intent: "manual backup of the run- dedicated cluster (backupType required per fragment)",
    body: { backupType: "MANUAL", dbCollections: [] }, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/create`,
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.backupId = d.backupId || d.id || null
      return { ok: true, detail: "backupId=" + (state.backupId || "none (rejected — type/param data)") }
    },
  })
  push({
    id: "extra.backups.describe", family: "backups", op: "/v2/clusters/{CLUSTER_ID}/backups/{BACKUP_ID}", method: "GET", kind: "observe", expect: "record",
    param: "BACKUP_ID(path)", intent: "describe the created backup",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/${state.backupId || "none"}`,
  })
  push({
    id: "extra.backups.export", family: "backups", op: "/v2/clusters/{CLUSTER_ID}/backups/{BACKUP_ID}/export", method: "POST", kind: "observe", expect: "record",
    param: "(export schema)", intent: "export backup files — needs a real storage integration; empty body documents validation shape",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/${state.backupId || "none"}/export`,
  })
  push({
    id: "extra.backups.restoreCluster", family: "backups", op: "/v2/clusters/{CLUSTER_ID}/backups/{BACKUP_ID}/restoreCluster", method: "POST", kind: "observe", expect: "record",
    param: "(restore schema)", intent: "restore-to-cluster probe — heavy surface, empty body documents validation shape without restoring",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/${state.backupId || "none"}/restoreCluster`,
  })
  push({
    id: "extra.backups.restoreCollection", family: "backups", op: "/v2/clusters/{CLUSTER_ID}/backups/{BACKUP_ID}/restoreCollection", method: "POST", kind: "observe", expect: "record",
    param: "(restore schema)", intent: "restore-collection probe — same discipline as restoreCluster",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/${state.backupId || "none"}/restoreCollection`,
  })
  push({
    id: "extra.backups.delete", family: "backups", op: "/v2/clusters/{CLUSTER_ID}/backups/{BACKUP_ID}", method: "DELETE", kind: "observe", expect: "record",
    param: "BACKUP_ID(path)", intent: "backup chain teardown (acceptance semantics)",
    body: {}, url: () => `/v2/clusters/${state.dedicatedClusterId || "none"}/backups/${state.backupId || "none"}`,
    effect: (hh, res) => ({ ok: true, detail: "delete accepted=" + (res.http === 200 || res.code === 0) + (state.backupId ? "" : " (no backup created — skipped)") }),
  })

  // ---- metrics + alert rules lifecycle ----
  push({
    id: "extra.metrics.query", family: "metrics", op: "/v2/clusters/{CLUSTER_ID}/metrics/query", method: "POST", kind: "observe", expect: "record",
    param: "(metrics query schema)", intent: "cluster metrics query on the existing cluster (read-only)",
    body: {}, url: () => `/v2/clusters/${state.existingClusterId || "none"}/metrics/query`,
  })
  push({ id: "extra.alertRules.list", family: "alert_rules", op: "/v2/alertRules", method: "GET", kind: "positive", expect: "ok", param: "projectId(query)", intent: "list alert rules for the project", body: {}, url: (hh) => `/v2/alertRules?projectId=${hh.PROJECT}` })
  push({
    id: "extra.alertRules.create", family: "alert_rules", op: "/v2/alertRules", method: "POST", kind: "observe", expect: "record",
    param: "projectId/ruleName/level/metricName/enabled/sendResolved/actions", intent: "alert-rule lifecycle: create run- rule (required fields per fragment)",
    body: () => ({ projectId: PROJECT(), ruleName: `${P}_alert_${Date.now() % 100000}`, level: "P3", metricName: "CU", enabled: true, sendResolved: false, actions: [] }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.alertRuleId = d.alertRuleId || d.id || null
      return { ok: true, detail: "alertRuleId=" + (state.alertRuleId || "none (rejected — enum/param data)") }
    },
  })
  push({
    id: "extra.alertRules.update", family: "alert_rules", op: "/v2/alertRules/{ALERT_RULE_ID}", method: "PUT", kind: "observe", expect: "record",
    param: "(update schema)", intent: "update the run- alert rule",
    body: { enabled: false }, url: () => `/v2/alertRules/${state.alertRuleId || "none"}`,
  })
  push({
    id: "extra.alertRules.delete", family: "alert_rules", op: "/v2/alertRules/{ALERT_RULE_ID}", method: "DELETE", kind: "observe", expect: "record",
    param: "ALERT_RULE_ID(path)", intent: "alert-rule teardown (acceptance semantics)",
    body: {}, url: () => `/v2/alertRules/${state.alertRuleId || "none"}`,
    effect: (hh, res) => ({ ok: true, detail: "delete accepted=" + (res.http === 200 || res.code === 0) + (state.alertRuleId ? "" : " (no rule created — skipped)") }),
  })

  // ---- invoices / usage / cloud job ----
  push({ id: "extra.invoices.list", family: "invoices", op: "/v2/invoices", method: "GET", kind: "positive", expect: "ok", param: "pageSize/currentPage(query)", intent: "list invoices (paged)", body: {}, url: () => `/v2/invoices?pageSize=100&currentPage=1` })
  push({ id: "extra.invoices.describe", family: "invoices", op: "/v2/invoices/{INVOICE_ID}", method: "GET", kind: "observe", expect: "record", param: "INVOICE_ID(path)", intent: "describe with unknown id — not-found shape", body: {}, url: () => `/v2/invoices/none` })
  push({
    id: "extra.usage.query", family: "usage", op: "/v2/usage/query", method: "POST", kind: "positive", expect: "ok",
    param: "start/end", intent: "query daily usage for the last 7 days (read-only)",
    body: () => {
      const end = new Date(); const start = new Date(Date.now() - 7 * 86400000)
      return { start: start.toISOString().replace(/\.\d{3}Z$/, "Z"), end: end.toISOString().replace(/\.\d{3}Z$/, "Z") }
    },
  })
  push({ id: "extra.jobs.describe", family: "cloud_job", op: "/v2/jobs/{JOB_ID}", method: "GET", kind: "observe", expect: "record", param: "JOB_ID(path)", intent: "describe cloud job with unknown id — not-found shape", body: {}, url: () => `/v2/jobs/none` })

  // ---- volumes lifecycle ----
  push({ id: "extra.volumes.list", family: "volumes", op: "/v2/volumes", method: "GET", kind: "positive", expect: "ok", param: "projectId(query)", intent: "list volumes for the project", body: {}, url: (hh) => `/v2/volumes?projectId=${hh.PROJECT}` })
  push({
    id: "extra.volumes.create", family: "volumes", op: "/v2/volumes/create", method: "POST", kind: "observe", expect: "record",
    param: "volumeName/regionId/projectId", intent: "volume lifecycle: create run- volume (storage integration/path may be required — rejection shape is data)",
    body: () => ({ volumeName: `${P}_vol_${Date.now() % 100000}`, regionId: state.dedicatedRegionId, projectId: PROJECT() }),
    effect: (hh, res) => {
      state.volumeName = ((res.json || {}).data || {}).volumeName || null
      return { ok: true, detail: "volumeName=" + (state.volumeName || "none (rejected — param data)") }
    },
  })
  push({ id: "extra.volumes.describe", family: "volumes", op: "/v2/volumes/{VOLUME_NAME}", method: "GET", kind: "observe", expect: "record", param: "VOLUME_NAME(path)", intent: "describe the run- volume", body: {}, url: () => `/v2/volumes/${state.volumeName || "none"}` })
  push({ id: "extra.volumes.update", family: "volumes", op: "/v2/volumes/{VOLUME_NAME}", method: "PATCH", kind: "observe", expect: "record", param: "(update schema)", intent: "update the run- volume", body: {}, url: () => `/v2/volumes/${state.volumeName || "none"}` })
  push({
    id: "extra.volumes.delete", family: "volumes", op: "/v2/volumes/{VOLUME_NAME}", method: "DELETE", kind: "observe", expect: "record",
    param: "VOLUME_NAME(path)", intent: "volume teardown (acceptance semantics)",
    body: {}, url: () => `/v2/volumes/${state.volumeName || "none"}`,
    effect: (hh, res) => ({ ok: true, detail: "delete accepted=" + (res.http === 200 || res.code === 0) + (state.volumeName ? "" : " (no volume created — skipped)") }),
  })

  // ---- global clusters: reads real, writes shape-probes ----
  push({ id: "extra.gc.availableRegions", family: "global_clusters", op: "/v2/globalClusters/availableRegions", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list available global-cluster regions", body: {} })
  push({ id: "extra.gc.list", family: "global_clusters", op: "/v2/globalClusters", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list global clusters", body: {} })
  push({ id: "extra.gc.describe", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}", method: "GET", kind: "observe", expect: "record", param: "globalClusterId(path)", intent: "describe with unknown id — not-found shape", body: {}, url: () => `/v2/globalClusters/none` })
  push({ id: "extra.gc.replicationLag", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}/replicationLag", method: "GET", kind: "observe", expect: "record", param: "globalClusterId(path)", intent: "replication lag with unknown id — not-found shape", body: {}, url: () => `/v2/globalClusters/none/replicationLag` })
  push({ id: "extra.gc.create", family: "global_clusters", op: "/v2/globalClusters/create", method: "POST", kind: "observe", expect: "record", param: "(create schema)", intent: "global-cluster create — multi-region heavy surface, empty body documents validation shape", body: {} })
  push({ id: "extra.gc.convert", family: "global_clusters", op: "/v2/globalClusters/convert", method: "POST", kind: "observe", expect: "record", param: "(convert schema)", intent: "convert-to-global probe, empty body", body: {} })
  push({ id: "extra.gc.addSecondary", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}/secondaryClusters", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "add-secondary probe on unknown id", body: {}, url: () => `/v2/globalClusters/none/secondaryClusters` })
  push({ id: "extra.gc.switchover", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}/switchover", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "switchover probe on unknown id", body: {}, url: () => `/v2/globalClusters/none/switchover` })
  push({ id: "extra.gc.failover", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}/failover", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "failover probe on unknown id", body: {}, url: () => `/v2/globalClusters/none/failover` })
  push({ id: "extra.gc.modifyCU", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}/modifyCU", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "modify-CU probe on unknown id", body: {}, url: () => `/v2/globalClusters/none/modifyCU` })
  push({ id: "extra.gc.removeEndpoint", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}/removeGlobalEndpoint", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "remove-endpoint probe on unknown id", body: {}, url: () => `/v2/globalClusters/none/removeGlobalEndpoint` })
  push({ id: "extra.gc.removeMember", family: "global_clusters", op: "/v2/globalClusters/{globalClusterId}/clusters/{clusterId}", method: "DELETE", kind: "observe", expect: "record", param: "(ids)", intent: "remove-member probe on unknown ids", body: {}, url: () => `/v2/globalClusters/none/clusters/none` })

  // ---- spark jobs: list real, creates shape-probes ----
  push({ id: "extra.spark.list", family: "spark_jobs", op: "/v2/jobs", method: "GET", kind: "observe", expect: "record", param: "projectId(query)", intent: "list spark jobs (type/clusterId/regionId required per fragment; type enum probed)", body: {}, url: (hh) => `/v2/jobs?projectId=${hh.PROJECT}&clusterId=${state.existingClusterId || ""}&regionId=${state.dedicatedRegionId || ""}&type=jar` })
  push({ id: "extra.spark.describe", family: "spark_jobs", op: "/v2/projects/{projectId}/jobs/{jobId}", method: "GET", kind: "observe", expect: "record", param: "jobId(path)", intent: "describe with unknown id — not-found shape", body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/jobs/none` })
  push({ id: "extra.spark.cancel", family: "spark_jobs", op: "/v2/projects/{projectId}/jobs/{jobId}/cancel", method: "POST", kind: "observe", expect: "record", param: "jobId(path)", intent: "cancel with unknown id — not-found shape", body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/jobs/none/cancel` })
  for (const [key, path] of [
    ["jar", "/v2/projects/{projectId}/jobs/jar"],
    ["dedup-pk", "/v2/projects/{projectId}/jobs/dedup/pk"],
    ["dedup-vector", "/v2/projects/{projectId}/jobs/dedup/vector"],
    ["kmeans", "/v2/projects/{projectId}/jobs/kmeans"],
    ["anomaly", "/v2/projects/{projectId}/jobs/anomaly-detection"],
    ["backfill", "/v2/projects/{projectId}/jobs/backfill"],
    ["backfill-precheck", "/v2/projects/{projectId}/jobs/backfill/precheck"],
  ]) {
    push({
      id: `extra.spark.create-${key}`, family: "spark_jobs", op: path, method: "POST", kind: "observe", expect: "record",
      param: "(create schema)", intent: `${key} job creation — needs real input fixtures; empty body documents validation shape`,
      body: {}, url: (hh) => path.replace("{projectId}", hh.PROJECT),
    })
  }

  // ---- on-demand clusters + on-demand compute ----
  push({ id: "extra.odclusters.list", family: "on_demand_clusters", op: "/v2/clusters/onDemandClusters", method: "GET", kind: "positive", expect: "ok", param: "projectId/regionId(query)", intent: "list on-demand clusters", body: {}, url: (hh) => `/v2/clusters/onDemandClusters?projectId=${hh.PROJECT}&regionId=${state.dedicatedRegionId || ""}` })
  push({ id: "extra.odclusters.describe", family: "on_demand_clusters", op: "/v2/clusters/onDemandClusters/{CLUSTER_ID}", method: "GET", kind: "observe", expect: "record", param: "CLUSTER_ID(path)", intent: "describe with unknown id", body: {}, url: () => `/v2/clusters/onDemandClusters/none` })
  push({ id: "extra.odclusters.create", family: "on_demand_clusters", op: "/v2/clusters/createOnDemandCluster", method: "POST", kind: "observe", expect: "record", param: "(create schema)", intent: "on-demand cluster create — likely gated by on-demand billing; empty body documents validation shape", body: {} })
  push({ id: "extra.odclusters.update", family: "on_demand_clusters", op: "/v2/clusters/onDemandClusters/{CLUSTER_ID}", method: "PATCH", kind: "observe", expect: "record", param: "(update schema)", intent: "update with unknown id", body: {}, url: () => `/v2/clusters/onDemandClusters/none` })
  push({ id: "extra.odclusters.delete", family: "on_demand_clusters", op: "/v2/clusters/onDemandClusters/{CLUSTER_ID}", method: "DELETE", kind: "observe", expect: "record", param: "CLUSTER_ID(path)", intent: "delete with unknown id", body: {}, url: () => `/v2/clusters/onDemandClusters/none` })
  push({ id: "extra.ondemand.describe", family: "on_demand_compute", op: "/v2/on-demand-compute", method: "GET", kind: "positive", expect: "ok", param: "projectId/regionId(query)", intent: "describe on-demand compute setting (read-only)", body: {}, url: (hh) => `/v2/on-demand-compute?projectId=${hh.PROJECT}&regionId=${state.dedicatedRegionId || ""}` })
  push({
    id: "extra.ondemand.enable", family: "on_demand_compute", op: "/v2/on-demand-compute/enable", method: "POST", kind: "observe", expect: "record",
    param: "(enable schema)", intent: "enable probe — BILLING surface; empty body documents validation shape without flipping the project's billing mode",
    body: {},
  })

  // ---- migrations / ETL ----
  push({ id: "extra.migrations.startByRemote", family: "migrations", op: "/v2/migrations/startByRemote", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "migrate-from-remote — needs remote source fixture; empty body documents validation shape", body: {} })
  push({ id: "extra.migrations.toExisting", family: "migrations", op: "/v2/migrations/toExisting", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "migrate-to-existing probe, empty body", body: {} })
  push({ id: "extra.migrations.toNewDedicated", family: "migrations", op: "/v2/migrations/toNewDedicated", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "migrate-to-new-dedicated probe, empty body", body: {} })
  push({ id: "extra.etl.merge", family: "etl", op: "/v2/etl/merge", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "ETL merge — needs source collections fixture; empty body documents validation shape", body: {} })

  // ---- access control (cloud RBAC): role lifecycle + reads + grant probes ----
  push({ id: "extra.ac.roles-list", family: "access_control", op: "/v2/roles", method: "GET", kind: "observe", expect: "record", param: "roleType(query)", intent: "list cloud roles (roleType enum probed)", body: {}, url: () => `/v2/roles?roleType=custom` })
  push({
    id: "extra.ac.roles-create", family: "access_control", op: "/v2/roles", method: "POST", kind: "observe", expect: "record",
    param: "(create schema — fragment declares no properties)", intent: "cloud-role lifecycle: create run- role (body shape undocumented in fragment — probe documents it)",
    body: () => ({ roleName: `${P}_crole_${Date.now() % 100000}` }),
    effect: (hh, res) => {
      const d = (res.json && res.json.data) || {}
      state.cloudRoleId = d.roleId || d.id || null
      return { ok: true, detail: "cloudRoleId=" + (state.cloudRoleId || "none (rejected — shape data)") }
    },
  })
  push({ id: "extra.ac.roles-describe", family: "access_control", op: "/v2/roles/{roleId}", method: "GET", kind: "observe", expect: "record", param: "roleId(path)", intent: "describe the run- cloud role", body: {}, url: () => `/v2/roles/${state.cloudRoleId || "none"}` })
  push({ id: "extra.ac.roles-principals", family: "access_control", op: "/v2/roles/{roleId}/principals", method: "GET", kind: "observe", expect: "record", param: "roleId(path)", intent: "list principals of the run- role", body: {}, url: () => `/v2/roles/${state.cloudRoleId || "none"}/principals` })
  push({ id: "extra.ac.roles-update", family: "access_control", op: "/v2/roles/{roleId}", method: "PUT", kind: "observe", expect: "record", param: "(update schema)", intent: "update the run- cloud role", body: {}, url: () => `/v2/roles/${state.cloudRoleId || "none"}` })
  push({
    id: "extra.ac.roles-delete", family: "access_control", op: "/v2/roles/{roleId}", method: "DELETE", kind: "observe", expect: "record",
    param: "roleId(path)", intent: "cloud-role teardown (acceptance semantics)",
    body: {}, url: () => `/v2/roles/${state.cloudRoleId || "none"}`,
    effect: (hh, res) => ({ ok: true, detail: "delete accepted=" + (res.http === 200 || res.code === 0) + (state.cloudRoleId ? "" : " (no role created — skipped)") }),
  })
  push({ id: "extra.ac.groups-list", family: "access_control", op: "/v2/groups", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list groups", body: {} })
  push({ id: "extra.ac.group-roles", family: "access_control", op: "/v2/groups/{groupId}/roles", method: "GET", kind: "observe", expect: "record", param: "groupId(path)", intent: "list roles of unknown group — not-found shape", body: {}, url: () => `/v2/groups/none/roles` })
  push({ id: "extra.ac.group-members", family: "access_control", op: "/v2/groups/{groupId}/members", method: "GET", kind: "observe", expect: "record", param: "groupId(path)", intent: "list members of unknown group", body: {}, url: () => `/v2/groups/none/members` })
  push({ id: "extra.ac.group-grant", family: "access_control", op: "/v2/groups/{groupId}/roles/{roleId}", method: "PUT", kind: "observe", expect: "record", param: "(ids)", intent: "grant-role-to-group probe on unknown ids (never touches real groups)", body: {}, url: () => `/v2/groups/none/roles/none` })
  push({ id: "extra.ac.group-revoke", family: "access_control", op: "/v2/groups/{groupId}/roles/{roleId}", method: "DELETE", kind: "observe", expect: "record", param: "(ids)", intent: "revoke probe on unknown ids", body: {}, url: () => `/v2/groups/none/roles/none` })
  push({ id: "extra.ac.member-roles", family: "access_control", op: "/v2/members/{userId}/roles", method: "GET", kind: "observe", expect: "record", param: "userId(path)", intent: "list roles of unknown member", body: {}, url: () => `/v2/members/none/roles` })
  push({ id: "extra.ac.member-grant", family: "access_control", op: "/v2/members/{userId}/roles/{roleId}", method: "PUT", kind: "observe", expect: "record", param: "(ids)", intent: "grant-to-member probe on unknown ids (never invites real users)", body: {}, url: () => `/v2/members/none/roles/none` })
  push({ id: "extra.ac.member-revoke", family: "access_control", op: "/v2/members/{userId}/roles/{roleId}", method: "DELETE", kind: "observe", expect: "record", param: "(ids)", intent: "revoke-from-member probe on unknown ids", body: {}, url: () => `/v2/members/none/roles/none` })
  push({ id: "extra.ac.members-resolve", family: "access_control", op: "/v2/members", method: "GET", kind: "observe", expect: "record", param: "email(query)", intent: "resolve member by bogus email — exactly-one-of email/userId per live error", body: {}, url: () => `/v2/members?email=conformance@invalid.example` })

  // ---- private endpoints ----
  push({ id: "extra.pe.services", family: "private_endpoints", op: "/v2/privateEndpointServices", method: "GET", kind: "positive", expect: "ok", param: "(no body)", intent: "list private endpoint services", body: {} })
  push({ id: "extra.pe.list", family: "private_endpoints", op: "/v2/projects/{projectId}/privateEndpoints", method: "GET", kind: "positive", expect: "ok", param: "projectId(path)", intent: "list project private endpoints", body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/privateEndpoints` })
  push({ id: "extra.pe.create", family: "private_endpoints", op: "/v2/projects/{projectId}/privateEndpoints", method: "POST", kind: "observe", expect: "record", param: "(create schema)", intent: "create probe — needs real VPC/endpoint IDs; empty body documents validation shape", body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/privateEndpoints` })
  push({ id: "extra.pe.delete", family: "private_endpoints", op: "/v2/projects/{projectId}/privateEndpoints/{endpointId}", method: "DELETE", kind: "observe", expect: "record", param: "endpointId(path)", intent: "delete with unknown id", body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/privateEndpoints/none` })
  push({ id: "extra.pe.whitelist", family: "private_endpoints", op: "/v2/projects/{projectId}/privateEndpointWhitelist", method: "POST", kind: "observe", expect: "record", param: "(schema)", intent: "whitelist-entry probe, empty body", body: {}, url: (hh) => `/v2/projects/${hh.PROJECT}/privateEndpointWhitelist` })

  return cases
}
