# REST Fragment CI and Migration Plan

## Problem

The site validation workflow builds rendered sites but did not execute `generate-integrated-spec`. A green site build therefore did not prove that manifest-backed collections could pass the real CLI and produce deterministic artifacts. The 35 files under `meta/openapi` also predate the collection contract: they have no authoritative fragment identity, source revision, generator revision, review digest, or approval digest.

## Safety boundary

- Keep `fetch-apifox-docs` reading the legacy directory until a shadow comparison passes.
- Do not fabricate canonical provenance for existing fragments.
- Do not upload to S3 from CI.
- Preserve `/restful/<slug>` routes and the legacy S3 compatibility path.
- Require exact path/method and operation coverage before switching a service.

## Phase 1: executable zdoc contract gate

Check in small canonical fixture collections for:

- data-plane latest with protocol projection;
- data-plane release track with lifecycle metadata;
- multi-service control-plane latest with bilingual output.

Run the public CLI twice for every case, compare every output byte, validate expected filenames and manifest provenance, and attach the check to the final site validation gate.

## Phase 2: legacy migration inventory

Track every legacy fragment by file, plane, service, operation count, and migration state. CI must reject missing files, undeclared files, operation-count drift, duplicate service IDs, or a file whose canonical identity disagrees with its declared state.

Migration states:

- `legacy-shadow-required`: current page input; producer provenance unavailable or not yet compared;
- `shadow-equivalent`: a producer-backed collection exists and normalized comparison passes;
- `canonical`: page generation consumes the collection rather than the legacy file.

## Phase 3: producer handoff

For each bounded service batch, obtain a bridge-produced archive containing `collection-manifest.json` and fragments. Verify schema parity, full source and generator SHAs, config/review/approval digests, file digests, service identity, local refs, and conflict rules. Store only intentional contract fixtures in zdoc; production inputs should arrive as immutable handoff artifacts rather than copied source trees.

## Phase 4: shadow reconciliation

Normalize the legacy and canonical inputs into inventories containing path, method, operationId, parameters, request/response schemas, lifecycle metadata, and component reachability. Parameter names that differ only in presentation require an explicit reviewed mapping; the agent may confirm source intent and record the mapping, while unexplained semantic differences block migration.

Advance a service to `shadow-equivalent` only when:

- path/method coverage is equal;
- every intentional rename has recorded evidence;
- no response/request schema or lifecycle difference is unexplained;
- English and Chinese page generation succeeds;
- the public route registry remains unchanged.

## Phase 5: consumer cutover

Switch page generation one service batch at a time to collection input. Keep the old fragment available for rollback during the observation window. Promote the migration state to `canonical` only after CI and a production-like dry run pass. Remove legacy inputs and any compatibility loader only in a separate retirement change.

## Initial batches

1. Control-plane services with direct source reconciliation already available: projects, usage, cloud access control, and cloud API keys.
2. Remaining control-plane services, grouped by owning source repository/module.
3. Data-plane v2 latest.
4. Data-plane v1 and release-track snapshots.

## Exit criteria

- CI executes the real integrated publication CLI for every supported policy shape.
- All 35 legacy fragments are accounted for and no service is marked canonical without provenance.
- Every migrated service has a deterministic shadow report and unchanged public routes.
- Production upload remains a separately authorized operation with immutable keys and guarded latest promotion.
