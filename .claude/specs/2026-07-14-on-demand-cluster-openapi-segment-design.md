# On-Demand Cluster OpenAPI Segment Design

## Objective

Separate the supported on-demand cluster endpoints from `Cluster Operations (V2)` into their own OpenAPI segment and documentation group. Remove the obsolete modify endpoint instead of carrying it into either segment.

## Scope

Create `plugins/apifox-docs/meta/openapi/33-on-demand-cluster-operations-v2.json` and move these operations into it:

- `POST /v2/clusters/createOnDemandCluster`
- `GET /v2/clusters/onDemandClusters`
- `GET /v2/clusters/onDemandClusters/{CLUSTER_ID}`
- `PATCH /v2/clusters/onDemandClusters/{CLUSTER_ID}`
- `DELETE /v2/clusters/onDemandClusters/{CLUSTER_ID}`

Delete this operation entirely:

- `POST /v2/clusters/onDemandClusters/{CLUSTER_ID}/modify`

All other paths remain in `plugins/apifox-docs/meta/openapi/22-cluster-operations-v2.json` under `Cluster Operations (V2)`.

## Segment Structure

The new fragment will follow the existing per-tag OpenAPI structure:

- OpenAPI version: `3.0.1`
- Title: `On-Demand Cluster Operations (V2)`
- Version: `1.0.0`
- Tag: `On-Demand Cluster Operations (V2)`
- Target: `zilliz`
- Chinese tag name: `On-Demand Cluster Operations (V2)`, consistent with nearby untranslated API group names
- Servers and the bearer security scheme copied from the source cluster fragment

Every moved operation will change its operation-level tag from `Cluster Operations (V2)` to `On-Demand Cluster Operations (V2)`. Operation bodies, parameters, examples, translations, response schemas, and custom `x-*` attributes will otherwise remain unchanged.

The complete path item for `/v2/clusters/onDemandClusters/{CLUSTER_ID}` will move as one unit because all three methods on that path belong to the new segment.

## Update Operation Changes

Rename the two PATCH operation summaries as follows:

- `Update On-Demand Cluster Info` becomes `Update On-Demand Cluster`.
- `Update Dedicated Cluster Info` becomes `Update Dedicated Cluster`.

Remove the equivalent “information” wording from their Chinese summaries:

- `更新按需集群信息` becomes `更新按需集群`.
- `更新 Dedicated 集群信息` becomes `更新 Dedicated 集群`.

Update the on-demand PATCH operation description so it states that the operation updates the cluster name, description, or auto-suspend idle window. Add `autoSuspend` to its request schema using the validation and documentation formerly present on the removed modify operation:

```json
"autoSuspend": {
  "type": "string",
  "description": "Auto-suspend idle window. The value must use the `<number><s|m|h>` format, such as `60s`, `5m`, or `1h`, and must be at least 60 seconds.",
  "pattern": "^\\d+[smh]$",
  "example": "5m",
  "x-i18n": {
    "zh-CN": {
      "description": "自动挂起空闲时间。该值必须使用 `<number><s|m|h>` 格式，例如 `60s`、`5m` 或 `1h`，且至少为 60 秒。",
      "example": "5m"
    }
  }
}
```

Extend the on-demand PATCH request examples with `autoSuspend`: include it in the combined update example and add an auto-suspend-only example. The dedicated-cluster request schema does not gain this property.

## Documentation Metadata and Routing

Add the following metadata entry to `plugins/apifox-docs/meta/descriptions.json`:

```json
{
  "name": "on-demand-cluster-operations-v2",
  "description": "This set of APIs provides a way to manage on-demand clusters in Zilliz Cloud."
}
```

The generator derives the group folder from the operation tag. Therefore the five generated pages will move from:

```text
v2/control-plane/cluster-operations-v2/
```

to:

```text
v2/control-plane/on-demand-cluster-operations-v2/
```

Most individual page slugs will remain unchanged. Renaming the two PATCH summaries intentionally changes their generated page slugs:

- `update-on-demand-cluster-info-v2` becomes `update-on-demand-cluster-v2` and moves into the new on-demand group.
- `update-dedicated-cluster-info-v2` becomes `update-dedicated-cluster-v2` within the existing cluster group.

Add Chinese title mappings in `plugins/apifox-docs/meta/titles.json` so Chinese reference generation can resolve the renamed summaries:

```json
"更新按需集群": "update-on-demand-cluster",
"更新 Dedicated 集群": "update-dedicated-cluster"
```

Update the two links in `docs/tutorials/management/clusters/on-demand-cluster/manage-on-demand-clusters.md` from the old `update-on-demand-cluster-info-v2` route and label to `update-on-demand-cluster-v2` and `Update On-Demand Cluster`.

## Loading and Reference Behavior

`specLoader.js` loads all JSON fragments alphabetically and merges tags, paths, components, and servers. The new `33-` prefix places the fragment after the current files without requiring loader changes.

The cluster fragment uses only the bearer security scheme in `components`. The new fragment will include the same scheme so it is valid and usable independently. During directory loading, the identical component is merged without changing behavior.

No cross-file local `$ref` dependency will be introduced. All moved operation content remains self-contained.

## Test Changes

Update `plugins/apifox-docs/issues-10717-10802.test.js` so its create-on-demand regression assertion reads the new segment rather than file 22.

Add a focused segment regression test that verifies:

1. The five supported operations are present in the new fragment with the correct HTTP methods.
2. Every moved operation uses `On-Demand Cluster Operations (V2)`.
3. None of the five moved operations remains in file 22.
4. `POST /v2/clusters/onDemandClusters/{CLUSTER_ID}/modify` is absent from both fragments and the merged specification.
5. Representative general and dedicated cluster operations remain in file 22 with `Cluster Operations (V2)`.
6. Loading the complete OpenAPI directory succeeds and exposes the five moved operations once each.
7. The two PATCH summaries omit `Info`, including their Chinese summaries.
8. The on-demand PATCH schema exposes `autoSuspend` with the expected pattern, while the dedicated PATCH schema does not.
9. Chinese reference generation accepts both renamed summaries.
10. Repository content no longer links to either old `*-cluster-info-v2` slug.

Run the existing Apifox plugin tests, parse all OpenAPI JSON files, and run the documentation generation path relevant to REST references. Check generated output to confirm the new group folder exists and the five pages are no longer generated beneath `cluster-operations-v2`.

## Compatibility and Non-Goals

This change intentionally alters the documentation group path for the five pages. No redirects are included because the request is limited to reorganizing the source specifications and generated sidebar grouping.

The following are out of scope:

- Changing endpoint URLs, methods, or responses
- Changing request bodies other than adding `autoSuspend` to the on-demand PATCH operation
- Renaming operation summaries or generated page slugs other than the two PATCH operations specified above
- Moving `on-demand compute` project APIs from `29-on-demand-compute-v2.json`
- Refactoring the OpenAPI loader or generator
- Changing general, dedicated, free, or serverless cluster documentation
