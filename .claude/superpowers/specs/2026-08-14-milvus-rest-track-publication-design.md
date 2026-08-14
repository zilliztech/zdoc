# Milvus REST Track Publication and Lifecycle Design

## Goal

Add a shared integrated OpenAPI publication workflow that keeps zdoc outputs latest-only, publishes Milvus outputs by minor track, scans and reviews Milvus `2.6.x` and `3.0.x` independently, and records lifecycle metadata at operation and contract-element level.

## Repositories and Ownership

This design spans two repositories with separate responsibilities:

- `feishu-markdown-bridge` owns the `api-reference-sync` skill, Milvus source discovery, release-track comparison, lifecycle proposal generation, and deterministic review manifests.
- `zdoc` owns canonical public OpenAPI fragments, lifecycle validation, track snapshots, the shared integrated-spec builder, localized integrated OpenAPI artifacts for both zdoc and Milvus, S3 publication, and latest-only REST page generation.

The two repositories exchange JSON artifacts through explicit schemas. Neither repository imports implementation code from the other.

## Confirmed Product Model

### zdoc pages remain latest-only

The existing zdoc REST reference publication model does not become versioned:

- `packages/docs-tooling/src/reference/rest/meta/openapi/` remains the canonical source for the latest public REST contract.
- The existing REST publication adapter continues to generate one current set of MDX pages and one current sidebar for each site.
- Historical Milvus tracks do not create parallel MDX trees, versioned routes, or additional sidebars.
- Chinese REST remains formal OpenAPI-generated content and stays outside the generic Translation workflow.

### zdoc integrated specs remain latest-only

zdoc also publishes complete localized OpenAPI files, but does not expose minor-track selection. The builder reads the latest canonical fragments and produces the current public contract for the selected zdoc target and language.

The latest-only artifact names remain stable and do not acquire a release-track segment. The exact target vocabulary and compatibility aliases are taken from the current zdoc target contract, for example:

```text
openapi-zilliz-v1-en-US.json
openapi-zilliz-v1-zh-CN.json
openapi-zilliz-v2-en-US.json
openapi-zilliz-v2-zh-CN.json
```

If compatibility requires retaining the existing unqualified legacy filenames during migration, those files are aliases of the same builder output rather than a separate merge implementation. zdoc integrated specs and zdoc MDX pages both use the latest canonical fragments, but their output steps remain independently invocable.

### Milvus integrated specs become track-aware

Milvus OpenAPI downloads are published independently from the zdoc page selection model. Initially supported tracks are:

- `2.6.x`: the latest available contract within the Milvus 2.6 minor line.
- `3.0.x`: the latest available contract within the Milvus 3.0 minor line.

Patch history is intentionally not retained. If a field changes several times within `2.6.x`, the `2.6.x` snapshot contains only the latest 2.6 shape.

Each supported track produces localized complete OpenAPI files:

```text
openapi-milvus-2.6.x-en-US.json
openapi-milvus-2.6.x-zh-CN.json
openapi-milvus-3.0.x-en-US.json
openapi-milvus-3.0.x-zh-CN.json
```

The exact same serialized bytes are written to the local artifact directory and uploaded to S3. A deterministic manifest records the SHA256 digest of every file.

## Lifecycle Extension Contract

### Attributes

The canonical fragments and track snapshots support these OpenAPI extensions:

```json
{
  "x-added-at": "2.6.x",
  "x-last-modified": "3.0.x",
  "x-deprecated-since": null
}
```

All non-null lifecycle values use the minor-track format:

```regex
^[0-9]+\.[0-9]+\.x$
```

Their meanings are:

- `x-added-at`: the first managed minor track in which the public contract element exists.
- `x-last-modified`: the most recent managed minor track in which its public contract changed.
- `x-deprecated-since`: the first managed minor track in which the element is deprecated; `null` means it is not deprecated.

Patch-level changes do not alter these values. The lifecycle system records minor-track evolution, not patch history.

### Managed scopes

Lifecycle attributes are required for Milvus data-plane public contract objects at two levels.

Operation level:

- every HTTP operation identified by `(endpoint, method)`.

Contract-element level:

- path, query, header, and cookie parameter objects;
- request and response schema properties;
- reusable schemas and reusable parameter, header, request-body, and response objects when they carry a public contract identity;
- object-valued `oneOf`, `anyOf`, and `allOf` branches when the branch itself is version-sensitive.

Lifecycle attributes are not added to structural containers such as `paths`, `content`, `application/json`, `schema`, or `properties`. Scalar enum members do not receive attributes; an enum change updates the owning field's `x-last-modified` value.

### Ordering and validation

For every managed object:

```text
x-added-at <= x-last-modified
x-deprecated-since is null or x-added-at <= x-deprecated-since
x-deprecated-since is null or x-last-modified <= x-deprecated-since
```

Track comparison is numeric by major and minor. Lexical string comparison is forbidden.

Deprecation means retained-but-marked, not removed:

- before `x-deprecated-since`, the generated element is not deprecated;
- at and after `x-deprecated-since`, it remains present and receives standard OpenAPI `deprecated: true` where the OpenAPI object supports that keyword;
- existing `deprecated: true` requires a non-null `x-deprecated-since`;
- a non-null `x-deprecated-since` requires the generated public representation to be deprecated.

This design does not introduce `x-removed-since`. Removal requires a future explicit contract rather than overloading deprecation.

### Visibility rules

For a target track `T`:

```text
x-added-at > T  => omit the object
x-added-at <= T => retain the object
x-deprecated-since <= T => retain and mark deprecated
```

`x-last-modified` never controls visibility. It supports audit, source comparison, and review.

When filtering a schema property, the builder also removes that property name from the schema's `required` array. A retained schema that still contains an unresolved required field or dangling reference is a build error.

## Existing Fragment Baseline

The initial migration applies only to Milvus data-plane contracts. File numbers are not authoritative. Scope is determined from target and plane metadata plus the actual operation contract.

`2.6.x` is the managed-history floor:

| Existing state | `x-added-at` | `x-last-modified` | `x-deprecated-since` |
|---|---|---|---|
| Exists in 2.6 and unchanged in 3.0 | `2.6.x` | `2.6.x` | `null` unless deprecated |
| Exists in 2.6 and changed in 3.0 | `2.6.x` | `3.0.x` | `null` unless deprecated |
| Added in 3.0 | `3.0.x` | `3.0.x` | `null` unless deprecated |
| Deprecated in 3.0 | original managed track | `3.0.x` | `3.0.x` |

An element that predates Milvus 2.6 is recorded as `2.6.x`, meaning “present at the earliest managed baseline,” not claiming it was first introduced by Milvus 2.6.

The migration updates operation and affected contract-element metadata together. Formatting, property order, examples, and translations are preserved unless the reviewed API change requires a content update.

## Track Snapshots

Each supported minor track has one complete, integrated latest snapshot:

```text
packages/docs-tooling/src/reference/rest/meta/releases/milvus/
├── 2.6.x/openapi.json
├── 2.6.x/manifest.json
├── 3.0.x/openapi.json
└── 3.0.x/manifest.json
```

These snapshots are internal versioned-spec inputs, not zdoc page sources.

- A snapshot may be updated when a newer patch is released within the same minor track.
- Earlier patch shapes are not retained.
- A snapshot records its source Milvus tag or commit, track, generation time, schema version, and content SHA256.
- Updating one track must not rewrite another track.
- The latest canonical fragments and the active latest-track snapshot are validated for compatible Milvus data-plane coverage, but they may differ in zdoc-only authoring metadata or non-Milvus operations.

The track snapshot preserves lifecycle metadata and localization source metadata. Public generated files remove internal authoring extensions after filtering and localization.

## Review Unit and Manifest

The approval-grade unit is exactly:

```text
(versionTrack, endpoint, method)
```

No unit may contain multiple endpoint/method pairs. The method is normalized to lowercase.

Each review unit records:

- stable unit ID derived from track, endpoint, and method;
- source Milvus range and evidence paths;
- current zdoc fragment path;
- action: `ADD`, `UPDATE`, `DEPRECATE`, `BACKFILL_LIFECYCLE`, or `NOOP`;
- proposed operation lifecycle values;
- request, response, parameter, and schema-property changes owned by the operation;
- referenced shared-component IDs and their semantic digests;
- blockers, warnings, and source-confidence state.

Shared components are not standalone review units. A changed shared component is listed beneath every affected operation. The manifest also contains one deduplicated component record and digest so repeated ownership cannot result in contradictory edits.

The complete manifest is sorted by numeric track, endpoint, and method and receives a deterministic semantic SHA256. Spec writes remain blocked until the user approves the exact grouping digest under the existing `api-reference-sync` approval contract.

## api-reference-sync Changes

The skill is updated around a REST-specific reference and deterministic scripts rather than expanding the top-level `SKILL.md` with implementation detail.

### Skill guidance

`SKILL.md` will state the REST-specific review-unit exception to the generic one-document rule and route REST/OpenAPI tasks to the REST reference.

`sdk-rest.md` will be refreshed to:

- use the current zdoc path under `packages/docs-tooling/src/reference/rest/`;
- classify Milvus as data-plane in zdoc;
- require separate `2.6.x` and `3.0.x` scans;
- define operation and contract-element lifecycle scopes;
- explain the managed-history floor and track-snapshot model;
- require the per-`(versionTrack, endpoint, method)` manifest;
- preserve discovery/dry-run/write approval boundaries.

### Deterministic scripts

The skill will provide or extend scripts for:

- parsing and comparing minor-track identifiers;
- scanning operation and contract-element lifecycle coverage;
- comparing adjacent Milvus track snapshots and upstream source evidence;
- assigning changes to operation owners;
- emitting the complete review-unit manifest and semantic digest;
- rejecting ambiguous ownership, missing source evidence, invalid lifecycle ordering, or manifest instability.

The scanner must treat request and response fields as first-class contract elements. It must not reduce “parameter changes” to OpenAPI `parameters[]` alone.

## zdoc Changes

### Lifecycle library

Add a focused REST lifecycle module responsible for:

- parsing and comparing track identifiers;
- validating lifecycle shape and ordering;
- deciding visibility and deprecation for a target track;
- recursively filtering contract elements;
- repairing `required` arrays after property filtering;
- reporting precise JSON paths for invalid metadata.

The page generator can validate lifecycle metadata but, by default, does not select an older track. Existing latest-only generation arguments remain valid.

### Shared integrated spec builder

Replace the current upload-time partial merge with a reusable builder that produces a complete OpenAPI document containing:

- `openapi`;
- `info`;
- `servers` when present;
- filtered `tags`;
- filtered `paths`;
- required `components` sections;
- other supported top-level OpenAPI fields from the source.

The builder supports two source-selection policies:

- `latest`: load the canonical fragments and publish zdoc's current target contract without a minor-track selector.
- `track`: load the selected Milvus minor snapshot and publish that track's current contract.

The builder applies these stages in order:

1. resolve the source through the explicit `latest` or `track` policy;
2. select publication target;
3. validate lifecycle metadata, then apply track lifecycle filtering and deprecation only for `track` policy;
4. apply language filtering and `x-i18n` localization;
5. remove internal authoring extensions from the public file;
6. prune unreachable components;
7. validate references and OpenAPI structure;
8. serialize deterministically and calculate SHA256.

Target filtering remains independent of source policy and language filtering. Both policies pass through the same localization, pruning, validation, deterministic serialization, manifest, local-artifact, and S3-upload code paths.

### Local artifact and S3 publication

Introduce an explicit integrated-spec command rather than coupling all behavior to MDX generation. Its contract supports both publication policies.

Latest zdoc output:

```text
--specifications <canonical-fragment-directory>
--publication-policy latest
--target zilliz
--lang en-US|zh-CN
--integrated-spec-output <directory>
--upload-s3
```

Versioned Milvus output:

```text
--specifications <canonical-or-snapshot-path>
--publication-policy track
--target milvus
--release-track 2.6.x
--lang en-US|zh-CN
--integrated-spec-output <directory>
--upload-s3
```

`--release-track` is required for `track` and rejected for `latest`. Local generation is always available without AWS credentials. S3 upload consumes the already-generated bytes and uses the same filename and digest. Upload remains idempotent by content hash.

The current page-publication command remains backward compatible. Existing latest zdoc filenames are not silently repurposed to mean minor tracks. Any compatibility aliases are explicit and tested, and they must be emitted from the shared builder bytes.

### Language behavior

- `en-US` uses canonical English text.
- `zh-CN` applies `x-i18n.zh-CN` recursively before removing `x-i18n`.
- Missing required Chinese localization is reported according to the existing REST localization policy; it does not silently copy an unrelated language.
- Public files strip internal lifecycle and authoring `x-*` extensions unless an extension is explicitly approved as part of the public OpenAPI contract.
- Standard OpenAPI `deprecated` remains in the public output.

## Artifact Manifest

Every local/S3 generation batch emits a deterministic manifest containing:

- schema version;
- target;
- publication policy and nullable release track;
- language;
- canonical-fragment or track-snapshot source identity and digest;
- output filename, byte length, and SHA256;
- sorted retained `(endpoint, method)` inventory;
- counts of retained, omitted, and deprecated operations and contract elements;
- generator version or Git SHA;
- validation result.

Timestamps, when present, are informational and excluded from the semantic digest. Re-running from the same source and options must produce identical OpenAPI bytes and the same semantic manifest digest.

## Error Handling

Generation fails before writing or uploading when any of these conditions occurs:

- malformed or unsupported release-track value;
- missing required lifecycle attributes in managed Milvus scope;
- invalid lifecycle ordering;
- `deprecated` and `x-deprecated-since` disagreement;
- dangling `$ref` after filtering;
- retained `required` entry without a retained property;
- operation without an approved tag or target classification;
- duplicate `(track, endpoint, method)` review unit;
- shared-component ownership ambiguity;
- local output digest differing from upload content.

S3 failure never invalidates or deletes the successfully generated local artifact. The command reports local artifact paths and upload status separately.

## Testing Strategy

### api-reference-sync

Add fixtures and focused tests covering:

- numeric minor-track ordering;
- operation-level and field-level additions, modifications, and deprecations;
- one review unit per `(track, endpoint, method)`;
- request/response property ownership;
- shared-component deduplication and affected-operation expansion;
- deterministic sorting and digest generation;
- invalid lifecycle and ambiguous ownership failures;
- separate `2.6.x` and `3.0.x` scan outputs.

Run the skill's focused Node tests, full `api-reference-sync` test harness, and skill validation.

### zdoc

Add focused tests covering:

- lifecycle parsing and validation;
- visibility and deprecation at track boundaries;
- recursive property filtering and `required` repair;
- complete component preservation and pruning;
- English and Chinese localized output;
- deterministic JSON and manifest SHA256;
- local artifact generation without AWS;
- mocked idempotent S3 upload using exactly the local bytes;
- latest zdoc and track-based Milvus policies sharing one builder implementation;
- latest policy rejecting `--release-track` and track policy requiring it;
- unchanged latest-only REST page publication CLI and publication adapter behavior.

Run the smallest REST tooling tests first, followed by relevant docs-tooling validation, workflow-policy tests, generation smoke tests for both sites, and `git diff --check`.

## Initial Dry-Run and Migration Evidence

Before changing existing fragments, the refreshed scanner produces a complete dry-run for both tracks. The migration package includes:

- one review manifest containing separate `2.6.x` and `3.0.x` units;
- a semantic grouping digest;
- proposed lifecycle backfill for existing Milvus data-plane operations and fields;
- proposed additions and modifications discovered from Milvus source;
- snapshot candidates for the latest patch in each track;
- localized integrated-spec previews and manifests;
- explicit blockers or unknown ownership.

No existing fragment is changed until the grouping manifest is reviewed and approved under the `api-reference-sync` gate. Tooling and documentation-contract implementation can be developed and tested before this data migration approval because it does not itself approve or apply spec content changes.

## Non-Goals

- Publishing versioned zdoc REST pages or sidebars.
- Retaining every Milvus patch-level OpenAPI shape.
- Inferring history before the managed `2.6.x` floor.
- Adding `x-removed-since` in this iteration.
- Applying the lifecycle migration to Zilliz Cloud control-plane operations.
- Treating scalar enum values as independently versioned objects.
- Replacing formal OpenAPI generation with hand-edited generated MDX.

## Delivery Boundaries

Implementation is split into two independently reviewable branches/worktrees:

1. `api-reference-sync`: skill contract, REST references, lifecycle/source scanners, per-operation review manifest, fixtures, and tests.
2. `zdoc`: lifecycle validation/filtering, track snapshots and manifests, a shared integrated-spec builder for latest zdoc and track-based Milvus outputs, local artifacts, S3 upload, custom-attribute documentation, and regression tests for latest-only page publication.

The initial branches deliver tooling and an approval-grade dry-run. Applying the proposed lifecycle metadata to all existing canonical fragments is a subsequent gated execution step bound to the generated grouping digest.

## Success Criteria

- zdoc continues to publish only its latest REST reference pages with unchanged routes and sidebar model.
- zdoc publishes latest-only localized integrated specs through the shared builder.
- Milvus `2.6.x` and `3.0.x` are scanned and reviewed independently.
- Every review unit represents exactly one `(versionTrack, endpoint, method)`.
- Milvus operation and contract-element lifecycle metadata is valid and auditable.
- Each track retains only its latest patch-level contract snapshot.
- Latest zdoc and track-based Milvus English/Chinese complete OpenAPI files are reproducible locally and uploadable to S3 with identical SHA256 values.
- Deprecated elements remain present and use standard OpenAPI deprecation semantics.
- Existing fragment migration remains blocked until the exact grouping digest is approved.
