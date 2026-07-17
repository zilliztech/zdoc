# Guides Cache Migration and Independent Validity Design

## Goal

Prevent a missing or obsolete Guides media cache from forcing a complete Feishu
source download when the snapshot-matched source cache is still complete and
safe. Preserve the full-fetch fallback for genuinely missing, corrupt, or
snapshot-mismatched sources.

## Confirmed Failure

Workflow run `29497634909` requested the exact cache key
`guides-source-v2-400fd92e...`. The branch had changed the cache format from v1
to v2 so the cache could include `plugins/lark-docs/meta/media-cache/guides.json`.
No v2 entry existed for the committed snapshot, although a v1 source cache could
still contain a complete source graph.

The source workflow treated the combined source-plus-media cache as one boolean.
The cache miss therefore caused it to delete the source directory and pass
`--force-full-fetch`. The generated incremental plan correctly recorded
`mode: full`, `changed_tokens: []`, `expanded_tokens: 373`, and
`Forced full fetch requested.` The source job fetched approximately 470 JSON
objects even though no content delta had been calculated.

## Design

### Separate Source and Media Validity

The workflow will derive two independent results:

```text
source_valid: cached source files and source manifest match the committed snapshot
media_valid: cached media manifest is structurally valid and covers the committed snapshot
```

Only `source_valid` controls `--force-full-fetch`:

| Source validity | Media validity | Source behavior | Media behavior |
| --- | --- | --- | --- |
| valid | valid | incremental | refresh the current render scope and retain unaffected entries |
| valid | invalid or absent | incremental | rebuild from baseline docs plus current incremental scope |
| invalid or absent | any | full bootstrap | rebuild complete required media coverage |

An invalid media manifest is removed without removing the source directory. An
invalid source cache removes the source directory and source manifest. This
prevents stale media metadata from making an otherwise safe source graph
unusable.

### Backward-Compatible v1 Source Restore

The source job will calculate both keys for the committed snapshot:

```text
guides-source-v2-<snapshot hash>
guides-source-v1-<snapshot hash>
```

It restores v2 first. On an exact v2 miss, it attempts the exact v1 key. A v1
restore is accepted only after the same source-file checks used for v2:

- manifest manual and build environment match Guides/UAT;
- manifest snapshot hash matches the committed snapshot;
- the source file list, sizes, and SHA-256 values match the manifest;
- source completeness succeeds for every canonical snapshot record;
- the configured Guides root is a regular renderable source with navigation
  children;
- no source path escapes the source directory or resolves through a symlink.

The v1 manifest is not required to contain media metadata. It seeds source
planning only. The assembly job continues to create and save only v2 caches, so
v1 support is a read-only migration path that can be removed after the old cache
retention window has passed.

### Cache Helper Contract

`scripts/docs-workflow/guides-source-cache.js` will expose source-only and
media-only validation instead of requiring callers to validate both at once:

```js
sourceCacheKey(snapshotPath, { version: 2 })
validateSourceCache({ sourceDir, snapshotPath, manifestPath, rootToken, acceptedSchemaVersions })
validateMediaCache({ sourceDir, snapshotPath, manifestPath, mediaManifestPath })
createSourceCacheManifest({ sourceDir, snapshotPath, manifestPath, mediaManifestPath, rootToken })
```

`validateSourceCache` accepts schema 1 only when the caller explicitly supplies
`acceptedSchemaVersions: [1, 2]`. Normal v2 validation remains strict.
`validateMediaCache` requires a schema-v2 source manifest whose recorded media
manifest size and SHA-256 match the current file, then validates complete media
coverage for the snapshot.

The CLI will support:

```text
key --snapshot <file> --version <1|2>
validate-source --source-dir ... --snapshot ... --manifest ... --root-token ... --schemas 1,2
validate-media --source-dir ... --snapshot ... --manifest ... --media-manifest ...
create ...
```

Unknown versions, duplicate arguments, missing required files, and unsupported
schema lists fail closed.

### Media Reconstruction

When source validation succeeds but media validation does not, the workflow
retains the sources and removes only
`plugins/lark-docs/meta/media-cache/guides.json`. The existing media-prefetch
logic reconstructs reusable entries from the restored baseline `docs` and
`docs-byoc` directories. It downloads media for the plan's current source scope
and asserts coverage for the affected tables before writing the new manifest.

This behavior deliberately does not reuse a stale manifest for changed
documents. Baseline Markdown may seed unaffected object keys, while current
incremental sources determine which references must be downloaded and
validated.

### Artifact-Only Runs

Artifact-only runs continue to use the committed target-branch snapshot as the
incremental comparison authority. They do not introduce a separate hidden
"latest artifact-only snapshot."

During the compatibility window, repeated artifact-only runs may continue to
restore the exact v1 cache for the unchanged committed baseline. They may repeat
the delta since that baseline until a publish run advances the committed
snapshot, but they do not perform a complete bootstrap solely because the
media-cache schema changed. Assembly still saves the candidate v2 cache; that
key becomes the normal exact restore key after the candidate snapshot is
published to the target branch.

## Failure Semantics

- Exact v2 hit with valid source and media: continue incrementally.
- Exact v2 hit with valid source but invalid media: delete only the media
  manifest and continue incrementally.
- Exact v2 miss followed by valid v1 source hit: continue incrementally and
  rebuild media.
- Restored source cache with manifest, hash, completeness, or safety failure:
  delete source state and force a full fetch.
- Media reconstruction failure: fail the source job; do not upload a shared
  source artifact with incomplete media coverage.
- Cache save failure after successful assembly: warn and allow the validated
  checkpoint to remain successful.

Logs must state the selected path using bounded messages such as
`source=v2-valid media=valid`, `source=v1-migrated media=rebuild`, or
`source=invalid mode=full-bootstrap`.

## Security and Integrity

- A v1 cache is never trusted solely because Actions reports a cache hit.
- Source and media paths remain fixed repository-relative paths.
- Symlinks, traversal paths, non-regular files, unexpected manifest identity,
  and file hash mismatches fail validation.
- Credentials and downloaded binary data are not written into cache manifests.
- Only assembly after successful Guides validation saves the promoted v2 cache.

## Testing

Automated tests will prove:

1. v1 and v2 keys use the same snapshot hash with different version prefixes;
2. source-only validation accepts an explicitly allowed valid v1 manifest;
3. strict v2 validation rejects a v1 manifest;
4. valid v1 sources with no media select incremental source mode;
5. valid v2 sources with invalid media select incremental source mode and media
   reconstruction;
6. source tampering still selects full bootstrap;
7. media tampering does not delete or invalidate source files;
8. assembly creates and saves only schema-v2 manifests;
9. workflow policy requires v2-first/v1-fallback restore and forbids using media
   validity to select `--force-full-fetch`;
10. two artifact-only test runs against the same committed snapshot do not
    perform a full fetch after a valid baseline cache exists.

## Rollout

Run the updated workflow on a disposable target branch with a known v1 cache
and no v2 cache. Confirm the log selects `source=v1-migrated`, the plan remains
incremental, and assembly saves a candidate v2 cache. Run the same artifact-only
workflow again and confirm it can still use the exact v1 baseline without a
full bootstrap. Then publish the candidate snapshot on the disposable branch
and confirm the following run restores the exact v2 key. Finally, tamper with
one cached source file in a fixture-driven test and confirm the workflow selects
full bootstrap.

## Non-Goals

- Removing the safe full-fetch fallback.
- Treating Actions cache as authoritative storage.
- Persisting an independent artifact-only success snapshot.
- Changing incremental delta thresholds or reference expansion.
- Changing the generated Guides content or publication order.
