# Schema verification — uat-controlplane

Ops with accepted-response evidence: **29**; field verdicts: {"response-structure-undocumented":29,"corroborated":45,"type-mismatch":11,"error-branch-not-exercised":28,"declared-not-observed":5}

## Conflicts (73) — the doc-fix worklist

| Op | Case | Verdict | Detail |
|---|---|---|---|
| GET /v2/clusters | backups.policy-get | response-structure-undocumented | {"observed":"object"} |
| GET /v2/clusters | backups.policy-get | type-mismatch | {"declared":"array","observed":"object"} |
| GET /v2/clusters | backups.policy-get | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/clusters | backups.policy-set | response-structure-undocumented | {"observed":"object"} |
| GET /v2/clusters | backups.policy-set | type-mismatch | {"declared":"array","observed":"object"} |
| GET /v2/clusters | backups.policy-set | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/clusters/createDedicated | clusters.create-dedicated | response-structure-undocumented | {"observed":"object"} |
| POST /v2/clusters/createDedicated | clusters.create-dedicated | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/clusters/createServerless | clusters.create-serverless | response-structure-undocumented | {"observed":"object"} |
| POST /v2/clusters/createServerless | clusters.create-serverless | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/clusters | clusters.describe-run | response-structure-undocumented | {"observed":"object"} |
| GET /v2/clusters | clusters.describe-run | type-mismatch | {"declared":"array","observed":"object"} |
| GET /v2/clusters | clusters.describe-run | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/clusters | clusters.describe-serverless | response-structure-undocumented | {"observed":"object"} |
| GET /v2/clusters | clusters.describe-serverless | type-mismatch | {"declared":"array","observed":"object"} |
| GET /v2/clusters | clusters.describe-serverless | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/clusters | clusters.modify | response-structure-undocumented | {"observed":"object"} |
| GET /v2/clusters | clusters.modify | type-mismatch | {"declared":"array","observed":"object"} |
| GET /v2/clusters | clusters.modify | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/clusters | clusters.suspend | response-structure-undocumented | {"observed":"object"} |
| GET /v2/clusters | clusters.suspend | type-mismatch | {"declared":"array","observed":"object"} |
| GET /v2/clusters | clusters.suspend | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/groups/{groupId}/roles | extra.ac.group-roles | response-structure-undocumented | {"observed":"object"} |
| GET /v2/groups/{groupId}/roles | extra.ac.group-roles | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/groups | extra.ac.groups-list | response-structure-undocumented | {"observed":"object"} |
| GET /v2/groups | extra.ac.groups-list | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/alertRules | extra.alertRules.list | response-structure-undocumented | {"observed":"object"} |
| POST /v2/alertRules | extra.alertRules.list | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/clusters/{CLUSTER_ID}/modifyReplica | extra.clusters.modifyReplica | response-structure-undocumented | {"observed":"object"} |
| POST /v2/clusters/{CLUSTER_ID}/modifyReplica | extra.clusters.modifyReplica | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/globalClusters/availableRegions | extra.gc.availableRegions | response-structure-undocumented | {"observed":"object"} |
| GET /v2/globalClusters/availableRegions | extra.gc.availableRegions | declared-not-observed | {"declared":"array","required":false} |
| GET /v2/globalClusters/availableRegions | extra.gc.availableRegions | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/globalClusters | extra.gc.list | response-structure-undocumented | {"observed":"object"} |
| GET /v2/globalClusters | extra.gc.list | declared-not-observed | {"declared":"number","required":false} |
| GET /v2/globalClusters | extra.gc.list | declared-not-observed | {"declared":"number","required":false} |
| GET /v2/globalClusters | extra.gc.list | declared-not-observed | {"declared":"number","required":false} |
| GET /v2/globalClusters | extra.gc.list | declared-not-observed | {"declared":"array","required":false} |
| GET /v2/globalClusters | extra.gc.list | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/invoices | extra.invoices.list | response-structure-undocumented | {"observed":"object"} |
| GET /v2/invoices | extra.invoices.list | type-mismatch | {"declared":"array","observed":"object"} |
| GET /v2/invoices | extra.invoices.list | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/clusters/onDemandClusters | extra.odclusters.list | response-structure-undocumented | {"observed":"object"} |
| GET /v2/on-demand-compute | extra.ondemand.describe | response-structure-undocumented | {"observed":"object"} |
| GET /v2/on-demand-compute | extra.ondemand.describe | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/projects/{projectId}/privateEndpoints | extra.pe.list | response-structure-undocumented | {"observed":"object"} |
| POST /v2/projects/{projectId}/privateEndpoints | extra.pe.list | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/privateEndpointServices | extra.pe.services | response-structure-undocumented | {"observed":"object"} |
| GET /v2/privateEndpointServices | extra.pe.services | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/projects | extra.projects.create-full | response-structure-undocumented | {"observed":"string"} |
| POST /v2/projects | extra.projects.create-full | type-mismatch | {"declared":"object","observed":"string","sample":"proj-e317f93845739563fae7ce"} |
| POST /v2/projects | extra.projects.create-full | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/usage/query | extra.usage.query | response-structure-undocumented | {"observed":"object"} |
| POST /v2/usage/query | extra.usage.query | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/volumes | extra.volumes.list | response-structure-undocumented | {"observed":"object"} |
| GET /v2/volumes | extra.volumes.list | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/clouds | meta.clouds | response-structure-undocumented | {"observed":"array"} |
| GET /v2/clouds | meta.clouds | error-branch-not-exercised | {"declared":"string"} |
| GET /v2/regions | meta.regions | response-structure-undocumented | {"observed":"array"} |
| GET /v2/regions | meta.regions | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/projects | projects.add-region | response-structure-undocumented | {"observed":"array"} |
| POST /v2/projects | projects.add-region | type-mismatch | {"declared":"object","observed":"array"} |
| POST /v2/projects | projects.add-region | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/projects | projects.create-run | response-structure-undocumented | {"observed":"string"} |
| POST /v2/projects | projects.create-run | type-mismatch | {"declared":"object","observed":"string","sample":"proj-640c503be4d5697f365e11"} |
| POST /v2/projects | projects.create-run | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/projects | projects.describe | response-structure-undocumented | {"observed":"object"} |
| POST /v2/projects | projects.describe | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/projects | projects.list | response-structure-undocumented | {"observed":"array"} |
| POST /v2/projects | projects.list | type-mismatch | {"declared":"object","observed":"array"} |
| POST /v2/projects | projects.list | error-branch-not-exercised | {"declared":"string"} |
| POST /v2/storageIntegrations | storageint.list | response-structure-undocumented | {"observed":"object"} |
| POST /v2/storageIntegrations | storageint.list | error-branch-not-exercised | {"declared":"string"} |

## Corroborated fields: 45

## Required-param probes: 0

| Case | Op | Param | Verdict |
|---|---|---|---|
