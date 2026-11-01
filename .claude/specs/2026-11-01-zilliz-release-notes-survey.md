# Zilliz release-notes survey: GA / Public Preview / Private Preview / ON REQUEST

2026-11-01. Source of truth: `origin/dev` release notes
(`content/en/guides/tutorials/get-started/release-notes/`, Feishu-sourced
publication state — read dev, not master), cross-referenced with the
zilliz-cloud spec, the zdoc REST fragments, and zilliz-cloud-config.
This is the prior-derivation input for the zilliz availability track (P2) and
the ground truth for confirming `x-beta` marks.

## 1. Status vocabulary

Release notes use four tiers (unmarked = GA):

| Tier | Meaning | Console path | Fragment representation |
|---|---|---|---|
| GA | generally available | — | `x-beta: FALSE` (default for v2 via `betaDefaults`) |
| **Public Preview** | anyone can opt in | "Try Preview Features" on Cluster Overview | `x-beta: PUBLIC` |
| **Private Preview** | contact support to enable per account | support ticket | `x-beta: PRIVATE` (op/tag, or `CONFIG.betaOverrides` slug rules: `extract`, `merge`) |
| **ON REQUEST** | contact to enable, closer-to-GA delivery | support ticket | `x-beta: "ON REQUEST"` — **used at tag level on 38-snapshot; not in the CUSTOM_ATTRIBUTES §1.3 enum** (doc gap) |

Guides carry the same tier in H2 title suffixes (`## Zero Downtime Migration |
ON REQUEST`, release-notes-2610) — the guides title-suffix path from the
x-beta workflow (PR #873).

## 2. Inventory (per-version release notes, en)

### Public Preview

| Item | Announced | Scope / cluster constraint | REST surface |
|---|---|---|---|
| **Milvus v3.0.x** | 2610 (2026-10-29); first announced 2605 | **Dedicated clusters only; Global Clusters excluded; upgrade from v2.6.x only** (no 2.5.x path) | ORDER BY (`orderByFields`), query aggregation (`groupByFields`), Search Aggregation, `TEXT` type, add_function_field / fields drop / struct_fields (flexible schema), entity TTL, regex `=~`/`!~`, membership match, MinHash function |
| Milvus v2.6.x | 2510 | opt-in upgrade | v2.6 feature set |
| Milvus v2.5.x (incl. full-text search) | 2130, still preview per 2150 | opt-in upgrade | v2.5 feature set |
| Milvus 2.3.x | changelogs (2024-02) | opt-in | v2 API era |
| Vector Lakebase | 2605 | new product | lakebase endpoints |
| Multi-replica | 2100 | **Enterprise Plan** | — |
| Access logs | changelogs | — | — |
| Model-based embedding & rerank functions | 2601 | — | collection functions surface |
| On-demand compute (inferred) | — | — | 5 onDemandClusters ops `x-beta: PUBLIC` (spec + fragment agree) |

### Private Preview

| Item | Announced | REST surface / notes |
|---|---|---|
| Merge Data | 2180 | **documented REST page** (merge-data-v2); fragment badge via `betaOverrides` slug rule (PRIVATE) |
| MINHASH_LSH index | 2510 | index surface |
| Zilliz Hosted Models | 2601 | — |
| External Backfill (Snapshot + AddCollectionField flow) | 2605 | snapshots + add_function_field; fragment marks snapshots **ON REQUEST** (tier fuzziness) |
| Custom dictionaries/tokenizers via FileResource | 2605 | `file_resources/*` — fragments currently `x-include-target: ["milvus"]` (**hidden on zilliz** despite the announcement) |
| Spark Semantic Dedup / Abnormal Detection | 2605 | spark-job fragment (32; jar op carries empty target) |
| BYOC-I + data-plane audit logging | 2140 | BYOC deployment option |
| Auto-scaling | 291 | **Dedicated (Enterprise) clusters only**; later multi-replica public |

### ON REQUEST

| Item | Announced | REST surface |
|---|---|---|
| Zero Downtime Migration | 2610 (2026-10-19) | cloud-migration surface — **no fragment x-beta mark** |
| Data Backfill | 2610 | volumes + import surface — **no fragment x-beta mark** |

### Explicit GA markers

Serverless GA + Milvus 2.4 GA (2100); RESTful API v2 (291).

## 3. Cross-reference findings (fragments vs release notes)

1. **Consistent:** the six Milvus-3.0 schema-change ops (add_function,
   drop_function, add_function_field, drop_function_field, fields/drop,
   struct_fields/add) carry `x-beta: PUBLIC` and match 2610's Public Preview
   one-to-one; the on-demand five agree across spec and fragments.
2. **Enum gap:** `x-beta: "ON REQUEST"` is live at tag level (38-snapshot)
   but missing from the documented valid values in CUSTOM_ATTRIBUTES §1.3
   (`DEPRECATED|FALSE|PRIVATE|PUBLIC`). Either document it or normalize.
3. **ON REQUEST features without marks:** Zero Downtime Migration and Data
   Backfill REST pages render with the v2 default (GA-looking) badge; nothing
   carries their ON REQUEST status.
4. **file_resources hidden on zilliz** (`x-include-target: ["milvus"]`) while
   release notes announce the FileResource mechanism for custom
   dictionaries — decide whether zilliz pages should exist with a preview
   badge.
5. **First real cluster-type constraint data:** Milvus v3.0.x preview =
   Dedicated-only, Global-Clusters-excluded (2610); autoscaling was
   Dedicated-Enterprise-only (291); multi-replica Enterprise-plan (2100).
   These are exactly the priors the proposed `x-zilliz-cluster-types`
   attribute records, and the zilliz availability suite (P2) verifies.
6. Version ladder from release notes: 2.5.x → 2.6.x → 3.0.x previews, with
   zilliz-side default = latest stable 2.6.x (matches zilliz-cloud-config's
   dual-record v2.6.23-hotfix1/-byoc evidence).

## 4. Feeding P2

- Prior derivation input #1 (this survey): tier per feature/API + cluster
  constraints, from `origin/dev` release notes (parse: tier keywords in
  headings/bold + "| ON REQUEST" suffixes).
- Input #2: zilliz-cloud spec presence + its 5 `x-beta: PUBLIC` marks.
- Input #3: zilliz-cloud-config manifests (CU taxonomy) +
  `milvus-instance/` cuType layers for parameter-level priors.
- Empirical confirmation: UAT3 (write-path allowed, incl. `createFree`) and
  prod (read-only) from the `.env` `# Zilliz` block, via the landed
  availability runner; matrices labeled `{env, deployment, clusterType}`.
- Confirmed marks land as reviewed PRs; the enum gap (finding 2) and the
  missing ON REQUEST marks (finding 3) are the first corrections to file.

## Pending external reports (2026-11-01)

- `GET /v2/projects/{projectId}/regions` returns `An internal system error
  occurred` on BOTH UAT3 and prod (repro: any valid API key + an existing
  project id). Spec-documented endpoint; worth a bug report to the cloud
  team. Captured in both control-plane read-only matrices.
- `createServerless` requires `projectId` in practice, but the zilliz-cloud
  spec marks only `regionId` as required.
