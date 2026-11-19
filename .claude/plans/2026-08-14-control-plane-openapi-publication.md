# REST OpenAPI Data-Plane and Control-Plane Integrated Publication Plan

**Status:** Implementation in progress, source-verified on 2026-08-14. No release snapshot, S3 object, or production page has been changed.

Publication-impact and compatibility decisions are recorded in `2026-08-14-zdoc-rest-publication-impact-assessment.md`. That assessment is authoritative for preserving `/restful/<slug>`, keeping the legacy `fetch-apifox-docs` upload contract separate, and requiring zero redirects from this project.

## Implementation Progress (2026-08-14)

The first implementation vertical slice is now present in the two existing worktrees and remains uncommitted.

Completed in `/private/tmp/feishu-markdown-bridge-api-reference-sync-rest`:

- canonical collection JSON Schema and deterministic manifest builder;
- full 40-character source/generator revision enforcement;
- approval/review-bound data-plane fragment production and local atomic output;
- control-plane `baseRevision -> headRevision` review IDs and shared-component propagation;
- production removal blockers;
- explicit control-plane service allowlist config derived from existing zdoc fragments;
- local `rest-fragments.js` entrypoint, package script, capability/skill guidance, and read-only write-entrypoint admission.
- pinned-revision Milvus Go adapter that resolves constants and composed Gin routes into 98 normalized route records;
- pinned-revision zilliz-cloud Spring adapter restricted to the explicit 18-service allowlist, with public-path mapping support;
- deterministic `rest-source-scan.js` CLI and real-source smoke tests for both upstream repositories;
- deterministic reconciliation of all 18 allowlisted services against zdoc fragments `15-*` through `35-*`.

Completed in `/Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi`:

- schema mirror with byte-for-byte parity verification;
- manifest-first collection loading with digest, identity, mixed-revision/plane, path/method, operationId, component, and undeclared-file gates;
- explicit `apiSurface=data-plane|control-plane` and separate `protocolVersion=v1|v2` semantics;
- legal publication-matrix enforcement and removal of the unlaunched integrated compatibility interface;
- plane-aware artifact names and S3 key layout;
- immutable artifact upload plus stale-latest SHA guard;
- bilingual control-plane release preparation with one promoted bilingual release manifest;
- explicit plane classification with existing public REST slugs preserved, plus route collision detection.
- isolated legacy upload behavior: `fetch-apifox-docs --upload-s3` retains `openapi-<target>-<v1|v2>.json`, while only the new manifest-backed command uses plane-aware keys.

Verification evidence:

- bridge REST/contract/path suite: 49 passed, 0 failed;
- bridge `npm run validate:skills`: passed, including write-entrypoint admission;
- zdoc new and existing REST functionality after URL and upload compatibility review: 60 passed; one pre-existing unrelated content-link test still fails in `on-demand-cluster-segment.test.js` because `manage-on-demand-clusters.md` still references `update-on-demand-cluster-info-v2`;
- zdoc `pnpm typecheck`: passed;
- cross-repository local handoff completed from REST review to collection production to zdoc integrated artifact; output SHA256 was `c828114bc8f5fff12dbba8ed2f656431412821b2b592a6c4b6544ce3ba1939df`.
- source-adapter/reconciliation tests: 5 passed, 0 failed, including both pinned upstream repositories;
- Milvus inventory: `.claude/superpowers/plans/evidence/milvus-rest-route-inventory.json` in the zdoc worktree;
- control-plane report at zilliz-cloud `cad69e5b51d7bc62a6bf3ab9871d1e76a5afd6ec`: `.claude/superpowers/plans/evidence/control-plane-fragment-reconciliation.json`, report digest `sha256:84d8ce552b9e9728a71ebfdedcf3c840f06899f45fa3f2682a517d7f181068cb`;
- source-backed base/head review: `.claude/superpowers/plans/evidence/control-plane-source-review.json`, review digest `sha256:c6c0e424933b59fc262d27943c335d72fb98a52a9fd0313c9331131264aa8af5`, 114 review units and 3 blocked services.

The refreshed control-plane reconciliation is intentionally not forced green. Six services match by HTTP method and path shape (`backup-restore`, `cloud-api-keys`, `etl`, `migrations`, `storage-integrations`, and `usage`). Templated path parameters are matched by segment position, while naming differences remain visible under `parameterNameDifferences`. `cloud-access-control` now resolves `RoleController` and 13 `/cloud/v1` ACL routes through cross-file Java constants, but remains `MAPPING_REQUIRED` because those internal role operations do not establish one-to-one ownership for the 14 public `/v2/roles`, `/v2/members`, and `/v2/groups` operations. `pipelines` and `spark-jobs` remain `CONTROLLER_MISSING`. Other source/document differences remain explicit for Agent investigation. The report preserves every `SOURCE_ONLY` and `ZDOC_ONLY` route for follow-up review.

Remaining before the full Definition of Done:

- finish service-derived sidebar integration and generated-page end-to-end fixtures;
- add the production CI handoff/promotion workflow and run an S3 canary/rollback drill;
- create production release snapshots only after review and approval.

## 1. Executive Decision

Build one versioned canonical-fragment contract with an explicit `apiSurface` discriminator:

- `data-plane` fragments are produced from the Milvus repository and may be published to Milvus or Zilliz as `latest` or a minor release track.
- `control-plane` fragments are produced from the zilliz-cloud repository and may be published only to Zilliz as `latest`.
- zdoc consumes a collection manifest, validates the publication matrix before merging, and never discovers either upstream repository layout.
- `info.version`, `/v1`, and `/v2` remain OpenAPI protocol content. They are not publication versions and are not used to distinguish data plane from control plane.

The implementation must preserve the data-plane behavior completed on `codex/rest-versioned-openapi`, while replacing the current overloaded `apiSurface=v1|v2` name with two separate concepts:

- `apiSurface`: `data-plane | control-plane`
- `protocolVersion`: optional `v1 | v2` path projection retained for data-plane latest compatibility

## 2. Source-Verified Acceptance of Completed Work

### 2.1 zdoc integrated publication branch

**Confirmed facts**

- Branch `codex/rest-versioned-openapi` exists in this repository at full SHA `7a9402abce05ea432902901c8a1218ab29cff9c7`.
- Its existing worktree is `/Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi` and is checked out at that exact SHA.
- Its nine implementation commits match the supplied report, from `906656c48` through `7a9402abc`.
- The branch adds the reported lifecycle, component graph, builder, artifact, publisher, and CLI modules under `packages/docs-tooling/src/reference/rest/`.
- The branch also contains the prior data-plane plans under `.claude/superpowers/plans/`, establishing the plan-location convention used by this file.
- The current zdoc checkout is `master`, is two commits behind `origin/master`, and was clean before this plan file was created.

**Acceptance conclusion**

The branch is a valid implementation baseline for data-plane latest/track publication, but it is not ready to model control plane without follow-up changes. Its builder currently treats `apiSurface` as a protocol path prefix, its latest policy requires `v1` or `v2`, and its filenames do not contain a plane namespace.

### 2.2 api-reference-sync REST track branch

**Confirmed facts**

- In `/Users/anthony/Documents/projects/feishu-markdown-bridge`, branch `codex/api-reference-sync-rest-versioning` exists at full SHA `0f259b2a543515cc64993b3a6ac410fa51707ce1`.
- Its existing worktree is `/private/tmp/feishu-markdown-bridge-api-reference-sync-rest` and is checked out at that exact SHA.
- Its six commits match the supplied report, from `b4082d0` through `0f259b2`.
- The branch adds REST track normalization, OpenAPI inventory, deterministic review manifests, a CLI, fixtures, and focused tests.
- `rest-track-review.js` is registered in `.claude/skills/doc-ops-core/write-entrypoints.json` as `read-only`.
- The current bridge checkout is `master`, two commits behind `origin/master`, with an unrelated untracked plan file. This plan does not modify that repository.

**Acceptance conclusion**

The branch produces inventory and review manifests only. It does not produce canonical OpenAPI fragments, a fragment collection manifest, prepared publication artifacts, or zdoc writes.

### 2.3 Skill authority and routing

The available `api-reference-sync` skill resolves to:

`/Users/anthony/Documents/projects/feishu-markdown-bridge/.claude/skills/api-reference-sync/SKILL.md`

No second copy exists in the current zdoc checkout. The current bridge `master` copy still contains the older direct zdoc/Feishu-oriented REST guidance. The review branch changes `SKILL.md` to declare REST review units as `(versionTrack, endpoint, method)` and replaces `sdk-rest.md` with a data-plane track workflow. Therefore:

- the branch copy is authoritative for the completed REST track implementation;
- the current `master` copy remains relevant evidence for existing zilliz-cloud source knowledge;
- the final integration must merge the branch and then restore control-plane source guidance in a deliberately redesigned `sdk-rest.md`, rather than reverting to direct hand-editing of zdoc fragments.

## 3. Current State

### 3.1 zdoc fragment loading contract

`packages/docs-tooling/src/reference/rest/specLoader.js` accepts either:

- one JSON file, returned as parsed; or
- one directory whose top-level `.json` files are sorted lexically and merged.

Directory loading currently has no collection manifest, no recursive layout, no schema version, no source revision constraint, and no plane constraint. Merge behavior is:

- singleton top-level fields: `openapi`, `info`, `externalDocs`, `jsonSchemaDialect`;
- keyed maps: `paths`, `webhooks`, `callbacks`;
- explicit merges for `tags`, `security`, `servers`, and `components`;
- all top-level `x-*` fields are treated as singletons.

The Task 1-9 branch improves metadata preservation relative to the old loader, but provenance outside OpenAPI `x-*` fields is still not represented. Component entries with the same category/name are currently overwritten by the later fragment in `mergeComponents`; this is incompatible with the required fail-fast cross-service conflict policy.

### 3.2 Existing fragment metadata

The checked-in fragments under `packages/docs-tooling/src/reference/rest/meta/openapi/` carry ordinary OpenAPI fields plus authoring extensions documented in `CUSTOM_ATTRIBUTES.md`, including:

- `x-i18n`
- `x-include-target`
- `x-include-langs`
- `x-target-lang`
- `x-target-request`
- `x-target-response`
- `x-base-urls`
- `x-base-url-target`
- `x-added-at`, `x-last-modified`, `x-deprecated-since` on managed data-plane elements

The integrated builder removes `x-i18n` after applying localization and then removes every remaining `x-*` key before artifact output. Thus authoring/lifecycle metadata is intentionally absent from published integrated specs. Source repository, full source SHA, generator SHA, service identity, and approval binding are not fragment fields today; the artifact manifest records only one source identity/digest and one generator SHA.

### 3.3 Real `apiSurface` semantics

In `integratedSpecBuilder.js`, `apiSurface` is a publication request option used only by `filterApiSurface()`:

- `v1` retains paths beginning `/v1/`;
- every other accepted value is `v2` and retains paths beginning `/v2/`.

It is not fragment-level or operation-level metadata and does not mean data plane/control plane. It is passed by `index.js`, included in artifact names and manifests, and required for `latest` publication. The plan therefore renames this existing meaning to `protocolVersion` while reserving `apiSurface` for the plane discriminator.

### 3.4 Actual build order

The Task 1-9 builder applies transformations in this order:

1. validate latest/track options;
2. filter by protocol path prefix (`apiSurface` today);
3. recursively filter `x-include-target`, `x-include-langs`, and `x-target-lang`;
4. clean empty paths and unused tags;
5. for track builds, require and apply lifecycle projection; for latest, validate any lifecycle metadata present;
6. localize from `x-i18n`;
7. strip all internal `x-*` extensions;
8. prune unreachable components;
9. fail on dangling local references;
10. build endpoint inventory and stats.

This order is sound for a selected homogeneous collection and should be retained. Plane validation must occur before step 2 and collection/service conflict validation before any lossy transform.

### 3.5 CLI, artifacts, and S3

The new command is `generate-integrated-spec`. Its current options are `--specifications`, `--publication-policy`, `--target`, `--api-version`, `--release-track`, `--lang`, `--integrated-spec-output`, `--upload-s3`, `--enable-compatibility-aliases`, and `--generator-git-sha`.

Current deterministic filenames are:

- latest: `openapi-<target>-<apiSurface>-<language>.json`
- track: `openapi-<target>-<releaseTrack>-<language>.json`
- manifest: `manifest.json`
- optional latest alias: `openapi-<target>-<apiSurface>.json`

`S3Uploader.uploadArtifact()` uploads exactly the prepared bytes it receives and prefixes only with `S3_PREFIX`. It uses `HeadObject` plus an MD5/ETag comparison before `PutObject`. There is no generation/version precondition, latest pointer compare-and-swap, or protection against an older job overwriting a newer latest artifact.

### 3.6 Page generation, routes, and sidebar

`packages/docs-tooling/src/reference/rest/refGen.js` already has a plane concept, but it is inferred from `meta/plane-config.json` keyword matching against tag/page slugs. Generated files use this structure:

`<target_path>/<protocol-version>/<inferred-plane>/<tag-slug>/<page-slug>.mdx`

The MDX templates create `/restful/<page-slug>` slugs, so the filesystem plane directory does not by itself namespace the public route. Page slugs derive from localized summary text, not `operationId`, and there is no explicit cross-plane collision registry. The REST sidebar is one `restful` sidebar; groups are generated from tags and inferred plane folders.

### 3.7 feishu-markdown-bridge responsibility

The bridge repository hosts the `api-reference-sync` skill, scanners, review/approval contracts, Feishu document operations, and source-specific authoring guidance. Existing `sdk-rest.md` also knows Milvus and zilliz-cloud source layouts. The completed REST track branch deliberately makes REST review read-only and separate from the generic Feishu document write state machine. Therefore the repository is an appropriate home for source adapters and deterministic fragment production, but Feishu documents are not the control-plane source of truth and Feishu mutation machinery must not be inserted into the fragment pipeline.

### 3.8 Reusable zilliz-cloud knowledge

Existing skill guidance identifies these real source areas:

- `vdc/global/cloud-control-api/src/main/java/com/zilliz/cloud/control/api/controller/`
- request DTOs below the same API module
- `vdc/global/cloud-service/src/main/java/com/zilliz/cloud/controller/`
- `vdc/global/cloud-service/src/main/java/com/zilliz/cloud/controller/vectorlake`
- `vdc/cloud-client/packages/cloud/src/api/`

It documents Spring route annotations, Jakarta/FluentValidate required-field rules, inherited DTOs, mixed HTTP methods, and explicit internal-to-public route mappings for some services. These are reusable adapter inputs, not a sufficient general source adapter. No allowlisted multi-service discovery configuration or canonical control-plane fragment producer exists.

### 3.9 Write-entrypoint admission

The doc-ops registry classifies entrypoints as read-only, canonical-governed, or quarantined legacy-live based on mutation behavior and reviewed exceptions. `rest-track-review.js` is admitted as read-only. New fragment producers should remain read-only with respect to external systems and write only deterministic local output paths. Any future entrypoint that writes zdoc, S3, Feishu, or another repository must be separately admitted with exact-digest approval, journaling, reconciliation, and focused tests; this plan keeps publication writes in zdoc.

## 4. Goals and Non-Goals

### Goals

- Produce canonical data-plane fragments from a pinned Milvus commit.
- Produce canonical control-plane fragments from a pinned zilliz-cloud commit and an explicit public-service allowlist.
- Bind review approval to the exact normalized source contract used for fragment generation.
- Publish homogeneous data-plane or control-plane collections through zdoc.
- Preserve the established page-generation behavior needed by current data-plane documentation. The unlaunched Task 1-9 integrated CLI names, artifact names, and compatibility aliases are not a compatibility contract and may be replaced directly by the plane-aware design.
- Make artifacts, manifests, provenance, routes, and S3 keys plane-aware and collision-safe.
- Guarantee byte-identical output for the same source SHA, config digest, generator SHA, and approved inputs.

### Non-goals

- Do not manufacture control-plane release tracks or publication API versions.
- Do not recursively publish every OpenAPI file in zilliz-cloud.
- Do not merge data-plane and control-plane operations into one integrated spec.
- Do not make zdoc understand Milvus or zilliz-cloud directories.
- Do not use Feishu as a control-plane source reader.
- Do not implement `x-removed-since` in this project.
- Do not perform lifecycle backfill, production upload, or release snapshot creation as part of implementing this plan.

## 5. System Boundaries and Data Flow

```text
Milvus repository @ full SHA
  -> api-reference-sync Milvus source adapter
  -> normalized data-plane source model
  -> data-plane review manifest and approval binding
  -> canonical data-plane fragment collection
  -> immutable handoff artifact
  -> zdoc collection loader and integrated builder
  -> Milvus or Zilliz data-plane artifacts/pages

zilliz-cloud repository @ full SHA
  -> api-reference-sync allowlisted control-plane service adapters
  -> normalized control-plane source model
  -> baseRevision -> headRevision review manifest and approval binding
  -> canonical control-plane fragment collection
  -> immutable handoff artifact
  -> zdoc collection loader and integrated builder
  -> Zilliz control-plane artifacts/pages only
```

## 6. Legal Publication Matrix

| apiSurface | target | policy | releaseTrack | Result |
|---|---|---|---|---|
| data-plane | milvus | latest | absent | allowed |
| data-plane | milvus | track | required | allowed |
| data-plane | zilliz | latest | absent | allowed |
| data-plane | zilliz | track | required | allowed |
| control-plane | zilliz | latest | absent | allowed |
| control-plane | zilliz | track | any | reject |
| control-plane | milvus | any | any | reject |

Additional control-plane rejections:

- reject `releaseTrack` even when policy is omitted or latest;
- reject the legacy `--api-version`/`protocolVersion` publication selector;
- never infer publication semantics from `info.version` or path prefixes.

## 7. Canonical Fragment Contract

### 7.1 Decision: OpenAPI JSON plus collection manifest

Keep each canonical fragment as valid OpenAPI JSON with authoring extensions. Do not add a per-fragment sidecar. Add one required `collection-manifest.json` because the current directory loader cannot prove plane homogeneity, source/config/generator revisions, service membership, file digests, approval binding, or deterministic ordering.

The manifest solves an existing loader problem rather than duplicating OpenAPI content. It is the only non-OpenAPI file in a canonical collection and is mandatory for producer-generated input. Legacy raw directories remain temporarily supported only through an explicit compatibility mode.

### 7.2 Collection manifest schema

Suggested new shared fixture/schema paths:

- bridge: `.claude/skills/api-reference-sync/contracts/rest-fragment-collection.schema.json` (suggested new)
- zdoc: `packages/docs-tooling/src/reference/rest/contracts/rest-fragment-collection.schema.json` (suggested new generated/copy-verified mirror)

Example:

```json
{
  "schemaVersion": "1.0",
  "collectionId": "control-plane-zilliz-cloud-8f2d...",
  "apiSurface": "control-plane",
  "source": {
    "repository": "zilliz-cloud",
    "revision": "8f2d7f4e5c1f0000000000000000000000000000"
  },
  "generator": {
    "repository": "feishu-markdown-bridge",
    "revision": "1a2b3c4d5e6f0000000000000000000000000000",
    "configDigest": "sha256:..."
  },
  "review": {
    "manifestDigest": "sha256:...",
    "approvalDigest": "sha256:..."
  },
  "services": [
    {
      "id": "cluster-management",
      "fragment": "cluster-management.openapi.json",
      "sha256": "...",
      "operationCount": 12
    }
  ]
}
```

Data-plane collections additionally carry `releaseTrack` for track snapshots or `null` for latest. Control-plane manifests omit `releaseTrack` entirely; they do not serialize a fake null publication version. All revisions must match `/^[0-9a-f]{40}$/`.

### 7.3 Fragment OpenAPI metadata

Each fragment remains valid OpenAPI and adds stable producer metadata at the document root:

```json
{
  "openapi": "3.0.3",
  "info": {"title": "Cluster Management", "version": "v2"},
  "x-zdoc-fragment": {
    "schemaVersion": "1.0",
    "apiSurface": "control-plane",
    "service": "cluster-management"
  },
  "paths": {},
  "components": {}
}
```

`x-zdoc-fragment` is fragment-level identity. Lifecycle remains operation/contract-element metadata only for data plane. Publication target, language, policy, and protocol projection remain publication request properties. The collection manifest is authoritative if fragment metadata disagrees, and disagreement is a hard failure.

### 7.4 Collection invariants

- A collection may contain multiple services only when every fragment has the same `apiSurface`, source repository, full source revision, generator revision, and config digest.
- Mixed source revisions are rejected.
- Mixed data/control plane is rejected.
- Duplicate `(path, method)` is rejected even if definitions are byte-identical.
- Duplicate `operationId` across services is rejected.
- Duplicate component category/name is allowed only when canonical JSON digests are identical; otherwise reject and report both owning services.
- Cross-service local `$ref` is allowed only through a declared shared fragment included in `services`; undeclared filesystem references are rejected.

## 8. api-reference-sync Design

### 8.1 Source adapter interface

Suggested new files in the bridge repository:

- `.claude/skills/api-reference-sync/src/rest-source/source-adapter.js`
- `.claude/skills/api-reference-sync/src/rest-source/milvus-adapter.js`
- `.claude/skills/api-reference-sync/src/rest-source/zilliz-cloud-adapter.js`
- `.claude/skills/api-reference-sync/src/rest-source/source-revision.js`
- `.claude/skills/api-reference-sync/src/rest-fragments/fragment-producer.js`
- `.claude/skills/api-reference-sync/src/rest-fragments/collection-manifest.js`

The adapter returns a normalized, deterministic service model containing public route, method, operationId, tags, request/response schemas, source locations, and source evidence. It must resolve a user-provided tag/branch/ref to a full commit SHA before scanning and record that SHA everywhere downstream.

### 8.2 Data-plane producer

Build on the existing `OpenApiScanner`, `inventoryOpenApi`, and track manifest logic. The Milvus adapter understands the Milvus source layout and emits canonical OpenAPI fragments grouped by reviewed service/tag policy. Track snapshots retain lifecycle metadata. Latest data-plane output may retain lifecycle metadata for audit, while zdoc strips it from published artifacts.

The existing data-plane review-unit ID remains unchanged:

`rest:<versionTrack>:<method>:<percent-encoded-endpoint>`

### 8.3 Control-plane source discovery

Suggested new config:

`.claude/skills/api-reference-sync/config/rest-control-plane-services.json`

Each allowlisted service entry declares:

- stable service ID and display/tag metadata;
- one or more controller roots or exact controller classes;
- DTO roots and optional inherited-type roots;
- route prefix/public route mapping rules;
- include/exclude controller patterns;
- optional client/schema evidence roots;
- shared-component ownership;
- visibility state (`public`, never an implicit recursive default).

Unknown controllers and unclaimed public-looking routes appear as review warnings/blockers; they are not auto-published. Config order is normalized by service ID before digesting.

The initial allowlist is derived from the control-plane public surface already represented by zdoc fragments `15-cloud-meta.json` through `35-cloud-api-key-operations-v2.json`. File numbering is only migration evidence, not a lasting classification rule. Consolidate the existing fragments into these stable service IDs:

- `cloud-meta`
- `cluster-management`
- `pipelines`
- `etl`
- `volumes`
- `projects`
- `migrations`
- `backup-restore`
- `metrics-alerts`
- `cloud-jobs`
- `invoices`
- `usage`
- `on-demand-compute`
- `global-clusters`
- `storage-integrations`
- `spark-jobs`
- `cloud-access-control`
- `cloud-api-keys`

V1 and V2 paths for the same product capability belong to one service ID; protocol paths do not create separate publication services. Before a service enters the generated collection, its existing zdoc operations must be reconciled against the pinned zilliz-cloud source revision. An existing fragment is evidence that the API is intended to be public, but it does not override source truth or bypass review. Any existing fragment that cannot be mapped to allowlisted source ownership blocks that service's migration instead of being silently copied.

### 8.4 Control-plane review

Control-plane review compares two immutable commits:

`baseRevision -> headRevision`

It does not project lifecycle tracks. Suggested review-unit ID:

`rest:control-plane:<serviceId>:<method>:<percent-encoded-endpoint>`

This adds a new namespace without changing existing data-plane IDs. Each unit records before/after semantic digests, source locations, affected shared components, and action (`ADD`, `UPDATE`, `DEPRECATE`, `REMOVE`, `NOOP`). Removal is a review action, not lifecycle metadata.

Shared components are inventoried once per service/shared owner. A changed component is propagated to every operation reachable through the component graph. A changed component with no public consumer is reported separately as an orphan warning; it does not create a synthetic operation review unit.

### 8.5 Approval binding and production

Fragment generation accepts only:

- the exact review manifest digest;
- the exact base/head or track source SHAs represented by that manifest;
- an approval artifact/digest produced by the existing review gate mechanism;
- the same allowlist/config digest and generator SHA.

Any mismatch blocks generation. The producer writes to a temporary directory, validates every fragment and the collection, computes digests, then atomically renames the completed collection. It performs no zdoc, Feishu, or network mutation.

Suggested CLI:

```text
rest-fragments produce-data-plane
rest-fragments review-control-plane
rest-fragments produce-control-plane
```

Suggested entrypoint:

`.claude/skills/api-reference-sync/bin/rest-fragments.js` (suggested new)

Register it as read-only/external-side-effect-free in `.claude/skills/doc-ops-core/write-entrypoints.json`, with local output constrained to an explicit `--output` directory.

## 9. zdoc Design

### 9.1 Manifest-first loading

Extend `packages/docs-tooling/src/reference/rest/specLoader.js` to expose:

- `loadFragmentCollection(path, expectedRequest)` for manifest-backed collections;
- existing `loadSpecifications(path)` only for legacy compatibility and tests.

The collection loader verifies schema, full SHAs, every file digest, sorted service identity, homogeneous source metadata, plane, revision, conflicts, and local refs before returning a merged spec plus provenance. `generate-integrated-spec` should use manifest loading by default. A temporary `--legacy-specifications` flag keeps existing jobs operational during migration; raw directory fallback must not silently activate.

### 9.2 Surface-aware builder

Modify `packages/docs-tooling/src/reference/rest/integratedSpecBuilder.js`:

- validate `apiSurface`, target, policy, releaseTrack, and protocolVersion as one request;
- reject all illegal control-plane combinations before cloning/filtering;
- replace `filterApiSurface` with `filterProtocolVersion`;
- keep the verified transform order after collection validation;
- include service identity in endpoint inventory;
- preserve current latest/track data-plane semantics.

The builder receives one already-homogeneous collection. It never selects plane by examining paths, tags, `info.version`, or filenames.

### 9.3 CLI compatibility

New canonical CLI options:

- `--fragment-collection <path>` required for manifest-backed publication;
- `--api-surface <data-plane|control-plane>` required;
- `--publication-policy <latest|track>` required;
- `--target <zilliz|milvus>` required/default preserved as appropriate;
- `--protocol-version <v1|v2>` optional for data-plane latest;
- `--release-track <major.minor.x>` only for data-plane track;
- existing language/output/upload/provenance flags retained.

Compatibility decision:

- do not retain the unlaunched Task 1-9 `--specifications`/`--api-version` integrated-publication interface;
- ship only the manifest-backed `--fragment-collection`, explicit `--api-surface`, and `--protocol-version` interface;
- update tests, examples, and CI jobs in the same change rather than adding a deprecation mode;
- preserve the separate existing `fetch-apifox-docs` page-generation command until page generation itself is migrated, because it is outside the unlaunched integrated-publication interface.

### 9.4 Artifact and S3 layout

Canonical local filenames:

- data-plane latest: `openapi-<target>-data-plane-<protocolVersion>-<language>.json`
- data-plane track: `openapi-<target>-data-plane-<releaseTrack>-<language>.json`
- control-plane latest total spec: `openapi-zilliz-control-plane-<language>.json`
- per-service control-plane spec: `openapi-zilliz-control-plane-<serviceId>-<language>.json`
- manifest: `manifest.json` within each prepared artifact directory

Canonical S3 keys:

```text
openapi/v2/data-plane/<target>/latest/<protocolVersion>/<language>/openapi.json
openapi/v2/data-plane/<target>/tracks/<releaseTrack>/<language>/openapi.json
openapi/v2/control-plane/zilliz/latest/all/<language>/openapi.json
openapi/v2/control-plane/zilliz/latest/services/<serviceId>/<language>/openapi.json
```

Do not emit the unlaunched compatibility aliases introduced by Task 1-9. Existing production keys used by the older page-generation/upload path must first be inventoried during implementation; if they are confirmed unused by the new integrated publication, the new publisher writes only the canonical plane-aware keys above. Control-plane artifacts can never write `openapi-zilliz-v2-en-US.json` or any other data-plane-shaped key.

### 9.5 Artifact manifest and provenance

Extend `integratedSpecArtifacts.js` manifest schema to include:

- `apiSurface` and optional `protocolVersion`;
- collection ID and collection semantic digest;
- upstream repository and full SHA;
- producer repository/full SHA/config digest;
- zdoc generator full SHA;
- review manifest and approval digests;
- per-service source fragment digests;
- per-artifact bytes, length, SHA256, operation inventory, and validation results.

Do not include timestamps or absolute local paths in deterministic artifacts. Upload only the already validated `Buffer` objects returned by preparation.

### 9.6 Stale latest protection

Before publishing a mutable `latest` key, read its current manifest. Reject the upload when:

- the incoming upstream SHA is not the expected CI handoff SHA;
- the current object records a different lineage and the job lacks an explicit promotion token;
- the publication generation number/approved promotion record is older than the current pointer.

Publish immutable digest-addressed objects first, then update the latest manifest/pointer conditionally. Rollback repoints latest to a previously verified immutable manifest; it does not rebuild bytes.

## 10. Pages, Routes, and Sidebar

### 10.1 Plane is explicit

Pass `apiSurface` from the validated collection into `RefGen`. Keep `plane-config.json` only as a temporary legacy classifier and runtime endpoint fallback. New manifest-backed generation must not call `getPlane()` to decide the output namespace.

### 10.2 Public route stability

Use explicit public routes:

- data plane: preserve existing routes during migration;
- control plane: preserve the established `/restful/<operation-slug>` route.

Suggested modifications:

- `packages/docs-tooling/src/reference/rest/refGen.js`
- `packages/docs-tooling/src/reference/rest/templates/reference.mdx`
- `packages/docs-tooling/src/reference/rest/templates/group.mdx`
- `packages/docs-tooling/src/reference/rest/meta/plane-config.json` for legacy-only annotations

Generate operation slugs from the existing title rules and preserve current public URLs. Enforce global route uniqueness on the final `/restful/<slug>` value before writing any page. A data-plane/control-plane slug collision blocks generation and requires an explicit reviewed slug correction; it must not be resolved by silently adding a plane or service path namespace. Do not depend on globally unique `operationId` for URLs, though duplicate operation IDs inside one collection remain a contract error.

### 10.3 Sidebar

Keep the existing `restful` sidebar ID so site wiring remains compatible. Add stable top-level `Data Plane` and `Control Plane` groups derived from explicit collection metadata. Control-plane children are grouped by service ID, not keyword-inferred tags. Milvus publication never receives the control-plane group because the publication matrix rejects the collection earlier.

### 10.4 Total spec plus service specs

Produce both:

- one total control-plane integrated spec for broad download/search/validation;
- one spec per service for ownership, review, page generation, and bounded consumer use.

The total spec is deterministically assembled from the same prepared service specs. Any conflict fails before either form is published.

## 11. Localization

Control-plane source adapters produce source-language contract facts, not invented translations. Canonical fragments may carry reviewed `x-i18n` overlays when present in approved authoring inputs.

Initial policy:

- `en-US` and `zh-CN` are one release unit and must be generated and promoted together.
- Both languages are required before a control-plane service can launch.
- `zh-CN` fails closed when a user-visible operation/tag/field lacks required reviewed localization; do not silently copy English into Chinese artifacts.
- The bilingual artifact pair is prepared and validated before either language's latest pointer is updated. A partial English-only or Chinese-only promotion is rejected.
- Other languages are rejected until explicitly supported.

Keep localization overlays logically separate from source extraction but merge them into canonical OpenAPI fragments before review digest and fragment generation, so approval binds the exact published wording. Reuse the current zdoc `x-i18n` localization pass; do not route this through Feishu translation writes.

## 12. Determinism, Provenance, and Security Gates

- Resolve all refs to full 40-character Git SHAs before scanning.
- Sort services, fragments, paths, methods, tags, components, manifest keys, and inventories deterministically.
- Normalize line endings and serialize with the existing deterministic JSON serializer.
- Include config and generator revisions in provenance.
- Verify source checkout cleanliness is irrelevant by reading committed blobs at the pinned SHA, or record and reject dirty-source generation.
- Reject path traversal, symlinks escaping the collection, undeclared files, digest mismatch, duplicate IDs, mixed revisions, and dangling refs.
- Validate prepared bytes before upload and upload those exact bytes.
- Never place credentials, repository-local absolute paths, or private source URLs in public artifacts.
- Require CI identity and promotion authorization for mutable S3 pointers.

## 13. CI Handoff

The producer CI publishes an immutable archive containing the fragment directory, `collection-manifest.json`, review/approval evidence digests, and archive SHA256. It exposes:

- upstream repository + full SHA;
- producer repository + full SHA;
- config digest;
- archive digest and immutable artifact URL/ID;
- approved review manifest digest.

zdoc CI downloads by immutable artifact ID and verifies every value before building. It must not clone or inspect upstream source repositories. zdoc then records its own full SHA in the publication manifest.

## 14. Migration, Rollout, and Rollback

### Phase 0: integrate completed branches

1. Reuse the existing bridge worktree at `/private/tmp/feishu-markdown-bridge-api-reference-sync-rest` and the existing zdoc worktree at `/Users/anthony/Documents/projects/zdoc/.claude/worktrees/rest-versioned-openapi`; do not recreate them or switch the primary `master` worktrees.
2. Fetch/update each repository's `origin/master` without discarding local work in any worktree.
3. In the bridge worktree, merge or rebase the updated master baseline first because that branch establishes the review IDs and lifecycle semantics.
4. In the zdoc worktree, merge or rebase the updated master baseline independently and resolve only zdoc conflicts.
5. Run each worktree's focused tests before contract changes, then continue Tasks 2-7 in the bridge worktree and Tasks 8-12 in the zdoc worktree unless a later implementation task explicitly creates a narrower child branch/worktree.

The repositories remain independently versioned; neither branch is merged into the other repository.

### Phase 1: contract and producer, no publication

- implement shared schema fixtures and producers;
- generate synthetic and real dry-run collections;
- compare deterministic reruns;
- do not upload or generate checked-in pages.

### Phase 2: zdoc manifest consumption

- add manifest-first loading and plane-aware validation;
- prove old data-plane outputs are byte-equivalent except for intentionally versioned manifest/name changes;
- retain legacy CLI aliases.

### Phase 3: control-plane shadow build

- build English control-plane total/service artifacts and pages in CI-only staging;
- compare with the current checked-in cloud fragments and classify differences;
- require explicit product/API review before promotion.

### Phase 4: production canary

- publish one allowlisted control-plane service to immutable S3 keys while preserving existing public page routes;
- verify pages, sidebar, downloads, auth copy, base URLs, and rollback pointer;
- then enable the control-plane latest pointer.

### Phase 5: retire legacy mixed fragments

- stop adding new control-plane source facts directly to the mixed `meta/openapi/15-*` and later convention;
- migrate service by service;
- remove the mixed-fragment input and unlaunched Task 1-9 integrated CLI/artifact forms in the same rollout; no deprecation window is required.

### Rollback

- keep previous immutable artifact manifests and page-generation artifacts;
- repoint S3 latest to the previous manifest with conditional update;
- revert the control-plane route/sidebar publication as one release unit;
- leave producer review evidence and source SHAs intact for audit;
- never roll back by editing Milvus lifecycle tracks or manufacturing a control-plane track.

## 15. Implementation Plan

### Task 1: Land and re-verify the two completed baselines

**Purpose:** Establish known-good independent baselines before changing contracts.

**Files:** Existing branch files listed in Section 2; no new production file required.

**Steps:** Reuse the two existing worktrees identified in Phase 0, update their master baselines, integrate without switching the primary worktrees, inspect conflict resolutions, run focused tests/typecheck/smoke tests, and record resulting full SHAs in the implementation PRs.

**Tests:** Existing Task 1-9 zdoc tests; bridge `rest-*` tests and `tests/run-all.js --list`/focused runner.

**Acceptance:** Both repositories are clean, all reported tests pass, and behavior matches the source-verified current state above.

**Suggested commit:** No new commit if integration is performed by merge/rebase; otherwise `chore(rest): integrate versioned OpenAPI baselines`.

### Task 2: Define the canonical collection contract

**Purpose:** Make plane, service, provenance, revision, ordering, and approval binding machine-verifiable.

**Files:** Suggested new bridge and zdoc schema paths from Section 7; shared JSON fixtures under each repository's existing REST test fixture directory.

**Steps:** Define schema v1.0, full-SHA validation, plane-specific conditional fields, service entries, file digests, review binding, and canonical examples. Add a parity test that both repositories carry the same schema digest.

**Tests:** Valid data/control collections; mixed plane/revision; malformed SHA; missing/extra file; digest mismatch; forbidden control releaseTrack.

**Acceptance:** Both repositories validate identical fixtures and reject every invalid invariant.

**Suggested commit:** `feat(rest): define canonical fragment collections`

### Task 3: Add source revision resolution and adapter core

**Purpose:** Give api-reference-sync a stable interface for committed upstream facts.

**Files:** Suggested new `src/rest-source/*` files and focused tests in `.claude/skills/api-reference-sync/tests/`.

**Steps:** Resolve refs to full SHAs, read committed blobs, define normalized service IR, normalize source locations, and reject dirty/unresolved inputs.

**Tests:** Tag/branch/full-SHA resolution, missing ref, abbreviated SHA rejection, deterministic ordering, source-location normalization.

**Acceptance:** Identical committed source at the same SHA yields identical normalized IR.

**Suggested commit:** `feat(api-reference-sync): add REST source adapter core`

### Task 4: Produce canonical Milvus data-plane fragments

**Purpose:** Close the gap between REST review and zdoc-consumable artifacts.

**Files:** `openapi-scanner.js`, existing `src/rest-track/*`, suggested new `src/rest-fragments/*`, suggested `bin/rest-fragments.js`, fixtures/tests.

**Steps:** Convert approved inventory to fragments, preserve authoring/lifecycle extensions, emit collection manifest, bind existing review IDs/digest, and enforce track/latest metadata rules.

**Tests:** 2.6.x/3.0.x fixtures, lifecycle backfill case, shared refs, deterministic rerun, approval/config/source mismatch.

**Acceptance:** Producer emits a valid data-plane collection that zdoc's schema fixture validator accepts byte-for-byte.

**Suggested commit:** `feat(api-reference-sync): produce data-plane OpenAPI fragments`

### Task 5: Configure zilliz-cloud public service discovery

**Purpose:** Make multi-service discovery explicit and bounded.

**Files:** Suggested `config/rest-control-plane-services.json`, `zilliz-cloud-adapter.js`, config schema/tests.

**Steps:** Encode current controller/DTO roots, public route mappings, service IDs, shared ownership, and excludes. Report unclaimed candidates without publishing them.

**Tests:** allowlisted service, excluded/private controller, inherited DTO, mixed methods, internal/public route mapping, unclaimed route warning.

**Acceptance:** Scanning the same zilliz-cloud SHA and config produces the same service inventory and config digest; no unlisted service is emitted.

**Suggested commit:** `feat(api-reference-sync): discover allowlisted control-plane services`

### Task 6: Add control-plane revision review and producer

**Purpose:** Review latest-to-latest source changes and generate approved fragments without release tracks.

**Files:** Suggested new `src/rest-control-plane/review-manifest.js`, additions to `bin/rest-fragments.js`, fragment producer extensions, fixtures/tests.

**Steps:** Diff base/head normalized IR, create namespaced IDs, propagate shared component changes, bind approval, emit service fragments and collection manifest.

**Tests:** add/update/deprecate/remove/noop, shared component fan-out, orphan component, ID stability, releaseTrack rejection, source/config/approval mismatch.

**Acceptance:** No control-plane output contains publication track metadata; the manifest records exact base/head SHAs and approved digest.

**Suggested commit:** `feat(api-reference-sync): review and produce control-plane fragments`

### Task 7: Admit and document producer entrypoints

**Purpose:** Keep local generation within the skill's operational safety boundary.

**Files:** Existing `SKILL.md`, `sdk-rest.md`, `capabilities.json`, `.claude/skills/doc-ops-core/write-entrypoints.json`, package scripts, focused contract tests.

**Steps:** Document both planes, source ownership, review units, no-Feishu rule, local-output behavior, and recovery. Register producer as read-only/local-artifact generation.

**Tests:** skill contract, script paths, entrypoint classification, negative trigger for direct control-plane zdoc hand-edit workflow.

**Acceptance:** Guidance no longer says control-plane truth is sourced from zdoc or Feishu and does not regress data-plane track rules.

**Suggested commit:** `docs(api-reference-sync): define plane-aware REST production workflow`

### Task 8: Add zdoc manifest-first loading and conflict validation

**Purpose:** Consume producer output without upstream layout knowledge.

**Files:** Existing `specLoader.js`; suggested new `fragmentCollection.js` and tests/fixtures under `packages/docs-tooling/src/reference/rest/`.

**Steps:** Validate manifest/files, provenance, homogeneous collection, service conflicts, and refs; return merged spec plus metadata; preserve explicit legacy loader.

**Tests:** all collection invariants, component identity/conflict, duplicate path/method/operationId, undeclared file/ref, legacy compatibility.

**Acceptance:** Invalid collections fail before builder transforms; valid multi-service control-plane collections merge deterministically.

**Suggested commit:** `feat(rest): load canonical fragment collections`

### Task 9: Make builder and CLI plane-aware

**Purpose:** Enforce the publication matrix while preserving data-plane behavior.

**Files:** Existing `integratedSpecBuilder.js`, `integratedSpecPublisher.js`, `index.js`, lifecycle/component modules, tests.

**Steps:** Introduce `apiSurface`, rename path projection to `protocolVersion`, add the validation table, thread service/provenance metadata, replace the unlaunched integrated CLI flags directly, and keep the separate page-generation command working until Task 11 migrates it.

**Tests:** every matrix row; every explicit control-plane rejection; new latest/track CLI; rejection of removed legacy integrated flags; transform-order regression; data-plane golden artifacts.

**Acceptance:** Control-plane cannot reach builder output for Milvus, track, releaseTrack, or publication protocolVersion; the new data-plane commands work without a compatibility mode, and existing page generation remains functional through its dedicated command until Task 11.

**Suggested commit:** `feat(rest): enforce plane-aware publication policy`

### Task 10: Version artifacts, S3 keys, and stale-write protection

**Purpose:** Prevent collision and ensure immutable, recoverable promotion.

**Files:** Existing `integratedSpecArtifacts.js`, `integratedSpecPublisher.js`, `s3Uploader.js`; suggested new promotion/pointer helper and tests.

**Steps:** Implement names/keys from Section 9, expanded provenance, immutable digest upload, conditional latest pointer, and prepared-byte-only writes.

**Tests:** deterministic bytes, alias isolation, control/data collision attempts, stale job rejection, retry/noop, rollback pointer, upload failure leaves latest unchanged.

**Acceptance:** Control-plane never writes `openapi-zilliz-v2-en-US.json`; an older job cannot overwrite a newer approved latest pointer.

**Suggested commit:** `feat(rest): publish immutable plane-aware artifacts`

### Task 11: Namespace control-plane pages and sidebar

**Purpose:** Remove keyword inference from new publication and prevent route collisions.

**Files:** Existing `refGen.js`, templates, `plane-config.json`, sidebar generation/config files reached by the current REST page workflow; add focused page/route/sidebar tests.

**Steps:** Pass explicit surface/service, precompute route registry, write explicit control-plane routes, retain existing data-plane routes, and derive stable sidebar groups.

**Tests:** same title across planes/services, duplicate slug in one service, Milvus absence, total/service generation, English and Chinese paths, legacy keyword fallback.

**Acceptance:** Control-plane routes preserve existing `/restful/<slug>` URLs and are deterministic; no page is classified by keywords in manifest-backed mode, and cross-plane slug collisions fail before writes.

**Suggested commit:** `feat(rest): add explicit control-plane page classification`

### Task 12: Add cross-repository handoff and release gates

**Purpose:** Prove the complete contract without coupling repositories at runtime.

**Files:** Existing CI/workflow locations selected during implementation; suggested cross-repo contract fixtures in both REST test suites; publication runbook update.

**Steps:** Produce immutable archive, verify handoff metadata in zdoc, shadow build, canary, promotion, and rollback drill. Pin all three revisions: upstream, producer, zdoc.

**Tests:** archive tamper, wrong producer/source SHA, wrong config/review digest, repeated build byte equality, canary publish, rollback, stale concurrent job.

**Acceptance:** One approved source revision flows to verified pages and immutable artifacts with complete provenance, and rollback succeeds without rebuilding.

**Suggested commit:** `ci(rest): verify cross-repository OpenAPI handoff`

## 16. End-to-End Test Matrix

| Case | Producer | zdoc build | Expected |
|---|---|---|---|
| Milvus latest -> Milvus | data plane | latest | pass |
| Milvus track 2.6.x -> Milvus | data plane | track | pass with lifecycle projection |
| Milvus latest -> Zilliz | data plane | latest | pass |
| Milvus track 3.0.x -> Zilliz | data plane | track | pass |
| zilliz-cloud latest -> Zilliz | control plane | latest | pass |
| zilliz-cloud -> Milvus | control plane | latest | reject before build |
| zilliz-cloud -> Zilliz track | control plane | track | reject before build |
| control plane with releaseTrack | control plane | latest | reject |
| control plane with protocolVersion | control plane | latest | reject |
| mixed plane collection | mixed | any | reject loader |
| mixed source SHA collection | either | any | reject loader |
| duplicate path/method across services | control plane | latest | reject loader |
| duplicate operationId | control plane | latest | reject loader |
| conflicting component name | control plane | latest | reject loader |
| identical shared component | control plane | latest | dedupe deterministically |
| missing Chinese overlay | control plane | bilingual release | fail both-language promotion closed |
| only one language prepared | control plane | bilingual release | reject promotion |
| repeated identical inputs | either | any | identical bytes/digests |
| modified handoff archive | either | any | reject digest |
| older concurrent latest job | either | latest | reject pointer update |
| S3 failure after immutable upload | either | latest | latest pointer unchanged |
| rollback | control plane | latest | prior immutable manifest restored |

## 17. Risks and Recommended Defaults

### Confirmed risks

- Existing cloud fragments are mixed into one numbered directory with data-plane fragments.
- Existing page plane classification is heuristic.
- Current component merge can overwrite conflicting definitions.
- Current S3 latest uploads lack ordering/concurrency protection.
- zilliz-cloud public routes may require explicit mappings not derivable from annotations alone.
- Chinese authoring coverage may be incomplete for source-generated control-plane fields.

### Recommended defaults

- **Manifest:** required for all producer-generated collections.
- **Metadata:** OpenAPI `x-zdoc-fragment` plus one collection manifest; no per-file sidecars.
- **apiSurface:** fragment/collection identity validated against a publication request, never inferred per operation.
- **Services:** multiple services allowed in one collection only at one source revision/config/generator revision.
- **Review ID:** preserve data-plane IDs; use `rest:control-plane:<serviceId>:...` for control plane.
- **Discovery:** explicit allowlist/config with warnings for unclaimed candidates.
- **Components:** explicit owner plus dependency fan-out; fail on ambiguous/conflicting ownership.
- **Localization:** English and Chinese are required and promoted atomically; either language failing blocks both.
- **Artifacts:** per-service plus one deterministic total spec.
- **Routes:** preserve existing `/restful/<slug>` URLs; explicit plane/service identities are metadata and artifact boundaries, not URL path segments.
- **Input:** manifest-backed collection required; no compatibility mode for the unlaunched integrated interface.
- **Approval:** exact review/config/source digest must bind fragment generation.
- **CI:** immutable archive and full SHA pinning across repositories.
- **Latest safety:** immutable upload followed by conditional pointer promotion.

## 18. Resolved Product and Operations Decisions

1. **Initial public service allowlist:** use the existing zdoc control-plane fragments `15-cloud-meta.json` through `35-cloud-api-key-operations-v2.json` as migration evidence and consolidate them into the stable service IDs listed in Section 8.3. Every operation must still be reconciled against a pinned zilliz-cloud revision; numbering never becomes discovery logic. Additions require explicit allowlist changes and review.
2. **Localization:** generate and release `en-US` and `zh-CN` together. Missing reviewed Chinese content blocks the complete bilingual release; there is no English-only launch fallback.
3. **Latest publication safety:** follow the recommended immutable-artifact design. Upload digest-addressed artifacts first, then conditionally update the latest manifest/pointer. Use a CI promotion lock only as defense in depth, not as the sole concurrency control.
4. **Compatibility:** no compatibility layer is required for the Task 1-9 integrated CLI flags, artifact names, or aliases because they have not launched. Replace them directly with the plane-aware manifest-backed interface. This does not authorize breaking the separate existing page-generation command before its planned migration.
5. **Production removals:** a detected control-plane removal is blocking by default. Product/API ownership must confirm that the public API is intentionally removed and approve any replacement or migration guidance before its page/spec is removed. Pre-production fixture cleanup may proceed through normal review because it cannot remove an already published contract.

These decisions remove the prior product-policy blockers. Implementation still needs to select the concrete S3 conditional-write mechanism supported by the deployment environment, but it must satisfy Decision 3 rather than reconsidering the publication model.

## 19. Definition of Done

- Both completed branches are integrated and re-verified on updated masters.
- The same canonical collection schema and fixtures pass in both repositories.
- api-reference-sync produces deterministic, approval-bound data-plane and control-plane collections from full upstream SHAs.
- zdoc consumes only validated collection contracts for new workflows and enforces the legal publication matrix.
- The plane-aware manifest-backed CLI replaces the unlaunched Task 1-9 integrated interface without a compatibility window, while the separate existing page-generation command remains operational until its planned migration.
- Control-plane artifacts and S3 keys are explicitly namespaced and can never reach Milvus; existing public page routes remain stable and cross-plane slug collisions block generation.
- English and Chinese control-plane total/service specs and pages are generated, validated, and promoted as one release unit.
- Provenance records upstream, producer, config, review/approval, and zdoc revisions.
- Prepared bytes are verified before immutable upload; latest promotion is stale-write-safe.
- A production-like canary and rollback drill complete successfully.
- No implementation depends on Feishu as the control-plane source or on zdoc knowing upstream repository layout.
