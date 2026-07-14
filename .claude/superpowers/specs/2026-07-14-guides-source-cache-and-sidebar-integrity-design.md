# Guides Source Cache and Sidebar Integrity Design

## Goal

Keep `plugins/lark-docs/meta/sources/` out of Git while ensuring every incremental guides run starts from a complete, verified source graph and can never publish a sidebar that represents only the incremental delta.

## Confirmed Failure

The guides source JSON directory is ignored and therefore absent on a clean GitHub Actions runner. The source workflow restores generated docs, sidebars, translations, and the last-success snapshot, but not the source JSON used to build them. It then runs an incremental source fetch.

On July 12, the workflow log showed all three conditions together:

- the root source was missing and a virtual Base navigation root was created;
- the incremental plan contained zero changed or expanded documents;
- no document sources were fetched or written.

Base navigation can represent missing canonical documents as virtual leaf records. The sidebar writer deliberately rejects those virtual canonical leaves because they have no renderable document body. Existing Markdown remains present from the restored dev baseline, so the generated sidebar and generated docs silently diverge. The existing sidebar validator checks duplicate IDs and keys only, allowing the mismatch to pass the combined build.

## Architecture

### Durable Source Cache Outside Git

The source JSON remains ignored. GitHub Actions restores a cache before the guides source stage with a key derived from the exact committed UAT last-success snapshot:

```text
guides-source-v1-<sha256(guides-uat-last-success.json)>
```

The cached payload contains only:

```text
plugins/lark-docs/meta/sources/guides/**
plugins/lark-docs/meta/source-cache/guides-manifest.json
```

The cache manifest records schema version, manual, build environment, snapshot hash, creation time, file paths, file sizes, and SHA-256 hashes. It contains no credentials, reports, generated Markdown, translations, Git metadata, or downloaded image assets.

GitHub Actions cache is an optimization, not a source of truth. A cache miss, corrupt cache, manifest mismatch, missing canonical source, mismatched source hash, or missing root source causes a full source fetch. The workflow must never continue incrementally from an unverified cache.

The first workflow run after this design is deployed is a mandatory bootstrap run. Because no validated `guides-source-v1-*` cache exists yet, it must explicitly select `--forceFullFetch`, download every canonical guides source, regenerate both target outputs and sidebars, and create the first cache only after the combined build passes. It must not attempt an incremental fetch from the currently committed snapshot alone.

After the assembled guides checkpoint passes sidebar validation and the full Docusaurus build, the workflow writes a new cache manifest for the promoted snapshot and saves the complete source tree under the new snapshot-derived cache key. Failed or partially rendered runs do not publish a new source cache.

### Source Completeness Contract

Add a source completeness validator that compares the restored source directory with the last-success snapshot. For every current canonical snapshot record with a `source_file`, validation requires:

- the file exists under the configured source directory;
- it is a regular file and does not escape through a symlink;
- its SHA-256 matches `source_hash` when the snapshot supplies one;
- the parsed JSON contains one of the recorded canonical token aliases;
- the configured manual root source exists and contains navigation children.

The validator returns a structured result rather than merely a boolean:

```js
{
  complete: false,
  snapshotHash,
  expectedCanonicalSources,
  validCanonicalSources,
  missingFiles,
  corruptFiles,
  hashMismatches,
  tokenMismatches,
  rootError,
}
```

The source-stage command uses this result to select one of two modes:

```text
verified cache -> incremental fetch
anything else  -> force full fetch
```

For the bootstrap run, `anything else` is the expected path. Logs must state that the exact cache was unavailable and that full-fetch bootstrap mode was selected before any Feishu document download begins.

After either fetch path, completeness is checked again against the candidate snapshot. Failure at that point is fatal and prevents source artifact creation.

### Sidebar Generation Guard

Full sidebar generation is a whole-graph operation. Before `writer.generate_sidebar(...)`, the guides renderer must verify that the restored source directory is complete for the snapshot candidate supplied by the source stage. If completeness cannot be proven, the renderer fails with an actionable message and leaves the baseline sidebar untouched.

This guard is independent of cache restoration. It prevents a future workflow change, local invocation, or artifact bug from recreating the same failure.

The renderer must not infer completeness from the number of changed tokens. A zero-change incremental plan is valid only when the pre-existing source graph has passed validation.

### Sidebar-to-Docs Integrity Validation

Extend generated sidebar validation with a guides coverage check. The check builds the set of publishable canonical documents for each target from the complete source graph, converts those records to expected Docusaurus document IDs, and compares them with:

- document and ref IDs in the generated sidebar;
- generated Markdown/MDX files under the target output directory.

The validator fails for:

- a publishable generated document missing from the sidebar;
- a sidebar document ID whose generated file is absent;
- a publishable source whose generated file is absent;
- coverage falling below the exact expected set after approved exclusions.

Intentional non-sidebar pages must be represented explicitly, not through a percentage threshold. Initial exclusions are limited to existing contracts such as release notes handled by `releasesSidebar`, agent pages handled by `agentsSidebar`, hidden categories from sidebar overrides, and link-only/ref placements. The validator prints bounded samples plus total counts.

### Workflow Sequence

The guides lane becomes:

```text
restore dev baseline and last-success snapshot
  -> restore snapshot-keyed source cache
  -> validate cache completeness
  -> incremental fetch or full-fetch fallback
  -> validate candidate source completeness
  -> upload immutable per-run source artifact
  -> render SaaS and BYOC from that artifact
  -> require completeness before sidebar generation
  -> assemble outputs
  -> validate sidebar/docs/source coverage
  -> build site
  -> promote snapshot
  -> save complete source cache under promoted snapshot key
  -> publish guides checkpoint
```

The per-run source artifact remains the immutable handoff between the source job and parallel render jobs. The cross-run Actions cache only seeds the source job.

## Failure Semantics

- Cache miss: log the miss and perform a full source fetch.
- Cache validation failure: log bounded reasons, discard the restored cache, and perform a full fetch.
- Full-fetch completeness failure: fail the source job; do not upload a source artifact.
- Render-time completeness failure: fail that renderer; do not create a render artifact.
- Sidebar coverage failure: fail assembly; do not promote the snapshot, save a cache, or publish a checkpoint.
- Cache save failure after a valid build: report a warning but allow publication, because the next run can safely perform a full fetch.

## Security and Integrity

- Cache and artifact paths are fixed to the guides source directory and manifest.
- Symlinks, traversal paths, devices, sockets, and unexpected files are rejected.
- Every cached file is checked by size and SHA-256.
- Snapshot and cache manifest identity includes manual and build environment.
- Cache restore never makes an incremental run authoritative without completeness validation.
- Secrets remain confined to the source-fetch job and are never included in cache manifests or payloads.

## Verification

Automated tests must prove:

1. a complete source fixture passes snapshot validation;
2. missing root, missing canonical files, corrupt JSON, token mismatch, and hash mismatch fail validation;
3. a clean workspace with a valid snapshot selects full-fetch fallback rather than incremental mode;
4. a verified source cache selects incremental mode;
5. post-fetch incompleteness is fatal;
6. a renderer refuses sidebar generation from a partial source artifact;
7. a sidebar with one entry and hundreds of generated docs fails coverage validation;
8. explicit agents, releases, hidden-category, link, and ref exclusions do not create false failures;
9. workflow policy requires cache restore before source fetch and cache save only after successful assembly;
10. a full build succeeds with exact sidebar/source/docs coverage for SaaS and BYOC.

## Rollout

First run the updated workflow on a disposable branch with an intentionally empty Actions cache. Confirm that it performs a full fetch, produces complete sidebars, passes coverage validation, and saves a cache. Run it again without changing Feishu content and confirm that the second run restores the cache, produces a zero-change incremental plan, preserves complete sidebars, and finishes without a full fetch.

The same two-run sequence applies when enabling the change for `dev`: the first `dev` run is full-fetch bootstrap, and only the next successful run may use incremental mode.

Only after those two runs succeed should the workflow be enabled for `dev`. Existing sparse sidebars must be regenerated once from a confirmed full source fetch before deployment.

## Non-Goals

- Committing Lark source JSON to Git.
- Treating GitHub Actions cache as durable authoritative storage.
- Changing Feishu publishing status or target semantics.
- Replacing the existing per-run guides source and render artifacts.
- Using approximate sidebar coverage thresholds.
