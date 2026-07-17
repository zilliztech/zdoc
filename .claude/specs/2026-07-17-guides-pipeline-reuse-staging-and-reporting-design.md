# Guides Pipeline Reuse, Staging, and Reporting Design

## Goal

Make the Guides workflow faster without weakening publication safety. The
workflow will recover from an invalid media cache, avoid unnecessary sidebar
generation, combine translation batches without reverting earlier batches,
replace per-batch full-tree checks with one pre-promotion validation of the
combined translated tree, publish exactly the validated commit, and report each
state truthfully on the Feishu card.

The design covers three connected bottlenecks:

1. media-cache recovery and misleading prefetch counts;
2. repeated full-directory scans during Guides sidebar generation;
3. repeated full-tree translation publication and validation.

## Current Problems

### Immutable media caches have a recovery limitation

The current v3 key is derived from the committed Guides snapshot. GitHub Actions
caches are immutable, so a bad cache stored under that key could not be
replaced. The currently deployed v3 path has succeeded; this design closes the
recoverability gap rather than asserting that the existing entry is known to be
poisoned. Under v3, a recovery run could rebuild valid media but could not make
that repaired state discoverable under the same key.

The current prefetch log also reports final manifest entries as items
"prefetched." That number does not distinguish network downloads from manifest
reuse or reconstruction from committed Markdown.

### Sidebar generation repeatedly parses the source directory

The Guides source directory contains hundreds of JSON files and roughly 50 MB
of data. `larkDocWriter` source lookup helpers rescan and reparse that directory
while walking navigation nodes. This turns sidebar generation into repeated
whole-directory work instead of one indexed load.

The workflow also lacks a committed identity proving that existing sidebars
were generated from the same semantic source graph, navigation rules, and
generator tooling.

### Translation batches are unsafe to apply as complete trees

Every translation batch artifact is a complete owned tree based on the same
baseline. Applying batch 2 after batch 1 with the general checkpoint applicator
can restore unchanged baseline files from batch 2 and silently revert files
translated by batch 1. Only `.translation-cache/ja-JP.json` currently receives
a semantic three-way merge.

Batch artifacts can also declare `pnpm run build` as a passed validation command
even though batch translation jobs do not run that command. Repeating expensive
full-tree validation for every batch is both slow and less trustworthy than one
real validation of the combined candidate.

## Design Principles

- A cache hit is an untrusted candidate until its contents validate.
- Reuse requires proof from stable semantic inputs, not merely an empty-looking
  delta or a cache key.
- A translation batch contributes only the paths it changed from its baseline.
- The exact commit that passes the authoritative validation is the only commit
  eligible for publication.
- A concurrent target-branch update causes a safe failure, never an automatic
  merge, rebase, or force update of the target.
- Feishu says `Published` only after the target branch points to the validated
  commit.
- The centralized monitor remains the sole Feishu card writer.

## Architecture

The workflow will introduce five focused boundaries:

1. **Media cache generation and validator** restores the newest candidate for
   the exact snapshot, validates it, and creates a new immutable repair
   generation when necessary.
2. **Guides source index** parses source JSON once and exposes deterministic
   lookup methods to sidebar writers.
3. **Guides assembly descriptor** proves whether committed sidebars from the
   exact target baseline are reusable.
4. **Translation batch composer** derives and applies artifact-versus-baseline
   deltas to one staging worktree.
5. **Translation publication report** records staging, validation, promotion,
   and recovery facts for the finalizer and centralized card monitor.

These units exchange versioned JSON contracts. Operational run metrics remain
separate from committed identities so logging changes do not invalidate caches
or sidebar reuse.

## Media Cache Recovery

### Discoverable immutable generations

Introduce cache namespace v4 with keys shaped like:

```text
guides-source-v4-<snapshot-sha256>-<generation>
```

`generation` is unique for a successful cache save, using the workflow run ID
and attempt. The snapshot hash reuses the exact existing `hashSnapshot()`
algorithm: parse the JSON object, recursively sort object keys, serialize compact
canonical JSON, and compute its SHA-256. It is insensitive to whitespace and key
order but intentionally includes the `generated_at` value. Semantic sidebar
identity uses a different projection defined later. Restore uses the exact v4
snapshot prefix and selects the newest matching generation. Exact v3, v2, and
v1 keys remain bounded read-only migration fallbacks during their retention
window.

The restore action uses a run-unique primary lookup key that is never treated as
the saved identity, plus this bounded restore prefix:

```text
primary lookup: guides-source-v4-<snapshot-sha256>-lookup-<run-id>-<attempt>
restore prefix: guides-source-v4-<snapshot-sha256>-
save key:       guides-source-v4-<snapshot-sha256>-<run-id>-<attempt>
```

This design deliberately revises the existing no-`restore-keys` policy for one
case only: a full-snapshot-hash-scoped v4 prefix. This lets Actions select the
most recently created exact-snapshot generation without attempting to overwrite
it. No manual-wide or cross-snapshot prefix is allowed. Prefix restores still
undergo full content validation; `cache-hit` may be false for a prefix match and
is not used as the validity signal.

The snapshot hash remains in the prefix. A restore must never select a cache
from a different snapshot. There is no mutable `latest` pointer and no separate
cache registry. Actions cannot select the second-newest v4 generation after the
newest is rejected. The safe response is to remove the rejected candidate, try
the bounded exact legacy fallbacks, and otherwise rebuild and save a newer v4
generation.

The v4 cache stores a self-contained payload under the fixed
repository-relative directory `tmp/guides-source-cache-v4` rather than restoring
directly over live source and media paths. Validation runs against that isolated
payload; only a validated payload is promoted into the live paths. Legacy caches
retain their historical layout, so each legacy attempt completely removes
source, manifest, and media residue from a rejected attempt before restoring the
next exact version. A fallback can never validate using files left by an earlier
rejected candidate.

The payload layout is fixed:

```text
tmp/guides-source-cache-v4/sources/
tmp/guides-source-cache-v4/source-manifest.json
tmp/guides-source-cache-v4/media-manifest.json
```

Assembly copies the validated live state into a new temporary payload, validates
that payload again, atomically replaces the cache staging directory, and only
then invokes `actions/cache/save`.

### Restore and validation flow

```text
restore newest exact-snapshot v4 candidate
  -> validate source state independently
  -> validate media state independently
  -> valid media: incremental prefetch
  -> invalid or missing media: rebuild complete canonical media scope
  -> validate assembled Guides output
  -> save a new v4 generation after recovery, legacy migration, or a changed candidate
```

`actions/cache` reporting a match is not validity. Source validation continues
to check manifest identity, snapshot identity, file sizes and hashes,
completeness, root validity, and path safety. Media validation checks its schema,
snapshot identity, manifest digest, entry integrity, and complete canonical
coverage.

Source and media validity remain independent. Invalid media removes only media
state. Invalid sources trigger the existing full source bootstrap.

When media is invalid, the prefetcher scans the complete canonical candidate
snapshot even when the incremental source delta is empty. It may reconstruct
reusable object mappings from the exact committed `docs` and `docs-byoc`
baseline, but it must produce and validate complete required coverage before the
new generation can be saved.

An unchanged run that restored a valid v4 generation does not save a duplicate
generation. Cache-save failure does not invalidate a successfully built checkpoint, but the
run report must say that repaired state was not persisted. It must never report
that the next run can reuse a generation that was not saved.

### Media metrics

`guides-media-prefetch.js` will produce a bounded structured result with these
measured counts:

```text
canonicalReferencesRequired
selectedReferences
resolvedByNetwork
validatedManifestReuse
committedDocsReconstruction
staleEntriesDropped
finalManifestEntries
```

Every counter uses unique canonical media references as its unit, not HTTP
requests, Figma caption requests, S3 probes, or bytes. The three disposition
counters are mutually exclusive. For a successful complete candidate:

```text
finalManifestEntries
  = validatedManifestReuse
  + committedDocsReconstruction
  + resolvedByNetwork
  = canonicalReferencesRequired
```

`selectedReferences` is a separate scope diagnostic: incremental mode may
examine only a subset, while recovery examines the complete canonical set.
`staleEntriesDropped` counts prior-manifest entries excluded from final
inventory and is not subtracted from the disposition counters. The final
manifest is pruned to the canonical required set. Reconstruction proves mapping
identity and required coverage; it does not perform a remote-object existence
probe. User-facing logs and Feishu details use `resolvedByNetwork` for freshly
resolved media and name the other sources separately.

## Sidebar Generation and Reuse

### Immutable in-process source index

Add a Guides source index at `plugins/lark-docs/larkSourceIndex.js`. It loads
each regular JSON source file once, validates identities, and builds immutable
maps for the lookup forms used
by `larkDocWriter`, including:

- node, origin, object, and document tokens;
- navigation children;
- Base title and slug identities;
- aliases required by link and reference nodes.

Duplicate identities are never resolved by filesystem enumeration order. The
index either applies an explicitly documented deterministic rule for an
already-supported duplicate case or fails with both conflicting source paths.

`larkDocWriter` receives the index through an explicit constructor or method
dependency. Lookup helpers query the index instead of reading the whole source
directory. Writer-specific mutable state is not shared between SaaS and BYOC.

The combined Guides sidebar command is
`scripts/docs-workflow/generate-guides-sidebars.js`. It loads one immutable
index and invokes two target-specific writers. Repeated per-node directory scans
are forbidden. The implementation plan benchmarks both-target output before and
after the change; structural parse-count tests remain the correctness guard
rather than a brittle wall-clock threshold.

### Stable assembly descriptor

Commit a descriptor at:

```text
plugins/lark-docs/meta/assembly/guides.json
```

with this logical identity:

```json
{
  "schemaVersion": 1,
  "semanticSourceGraphSha256": "...",
  "navigationOwnershipSha256": "...",
  "generatorFingerprintSha256": "...",
  "saasSidebarSha256": "...",
  "byocSidebarSha256": "..."
}
```

The descriptor does not embed its own Git commit SHA because a commit cannot
contain its final identity without becoming self-referential. Instead, the
workflow reads the descriptor and sidebar files from the exact immutable
`dev_baseline_sha` checkout. The run report records that baseline SHA.

The semantic source projection canonically serializes these top-level fields:
`schema_version`, `manual`, `build_env`, and `base_app_token`. It excludes
`targets_built` because source-stage candidates intentionally use an empty array
before promotion; target configuration is covered by the generator fingerprint.
It then sorts records by `record_id` and includes:

```text
record_id, placement_type, source_file, source_hash, doc_token,
node_token, origin_node_token, obj_token, obj_type, sorted outgoing_tokens
```

The navigation/ownership projection requires Guides snapshot schema 3. It sorts
`navigation_records` by `table_id`, numeric `order`, then `record_id`, and
includes every sidebar-relevant field emitted by `createGuidesNavigationState`:

```text
record_id, table_id, table_name, placement_type, sorted parent_record_ids,
order, title, labels, slug, sorted targets, progress, doc_token, doc_link,
ref_target, ref_target_token
```

It also includes `table_digests` as table-ID-sorted `{tableId,digest}` entries.
The semantic source projection excludes `generated_at`, branch and URL fields,
`source_dir`, `doc_link`, creation/edit times, and `revision_id`. Navigation
retains `doc_link` because link and ref navigation behavior depends on it. A
snapshot schema change must update the corresponding projection version
explicitly. A baseline without schema-3 navigation identity cannot be reused and
therefore regenerates once to establish the descriptor.

For the initial safe rollout, the generator fingerprint canonically hashes the
declared fingerprint schema version, the exact immutable `master_sha`, and the
bytes of this allowlist:

```text
plugins/lark-docs/index.js
plugins/lark-docs/larkDocWriter.js
plugins/lark-docs/larkSourceIndex.js
plugins/lark-docs/guidesBaseRecordSemantics.js
scripts/docs-workflow/guides-assembly-identity.js
scripts/docs-workflow/generate-guides-sidebars.js
config/lark-docs.config.ts
config/sidebar-overrides/guides.json
config/sidebar-overrides/guides-byoc.json
```

Including `master_sha` conservatively covers `pnpm-lock.yaml` resolutions,
transitive dependencies, and tooling files not yet proven irrelevant. This may
regenerate after an unrelated master change, but it cannot reuse across an
unreviewed tooling change. Narrowing the fingerprint later requires separate
evidence and is not part of this rollout.

The committed descriptor path is added to the Guides `ownedPaths` in
`scripts/docs-workflow/content-groups.js`, its ownership tests, checkpoint
tests, and the generated-state restore list in
`scripts/restore-generated-state.sh`. This ensures source publication restores
it and translation artifact construction cannot mistake an absent descriptor
for an intentional deletion.

Run-time identity and decision data is separate at:

```text
plugins/lark-docs/meta/reports/guides-assembly-decision.json
```

The source job loads the committed descriptor and sidebars from the exact
baseline checkout, computes candidate projections, and writes this run report.
`guides-stage-artifact.js` adds the report to its fixed source-stage allowlist
and checksums it. Assembly validates the report identity against the restored
source artifact and baseline SHA. On reuse, assembly copies the two sidebars and
committed descriptor from the exact baseline. On regeneration, it generates and
validates both sidebars and writes the new committed descriptor. The final
checkpoint always contains the sidebars and matching committed descriptor.

### Sidebar reuse gate

Committed sidebars may be reused only when all conditions are true:

1. the descriptor and sidebars were loaded from the exact target baseline;
2. the canonical Guides delta has no added, changed, or deleted source nodes;
3. no table render is required;
4. candidate semantic source hash equals the descriptor value;
5. candidate navigation/ownership hash equals the descriptor value;
6. current generator fingerprint equals the descriptor value;
7. the baseline SaaS and BYOC sidebar files match their recorded hashes;
8. the descriptor schema is supported and every field validates.

Missing, corrupt, stale, or old-schema identity selects regeneration. Reuse is
an optimization and therefore fails closed to normal generation.

After generation, the workflow validates both sidebars and writes a new
descriptor into the candidate checkpoint. Run-only timing and decision reasons
go into reports, not the committed descriptor.

## Translation Batch Composition

### Batch identity validation

Before modifying the staging worktree, the publisher validates every artifact
and requires agreement on:

- group (`guides`);
- master/tooling SHA;
- existing `devBaselineSha`, interpreted as the translation source checkpoint;
- batch count and pending count;
- pending-set SHA-256;
- a normalized baseline payload SHA-256 derived from translation-mutable paths;
- unique batch identities exactly `1..N`, processed in numeric order regardless
  of artifact download order.

The normalized baseline identity is the SHA-256 of a canonical sorted list of
`{path,size,sha256}` entries and deletions under these translation-mutable roots:

```text
i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials
i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials
.translation-cache/ja-JP.json
```

Every paired baseline must have the same normalized identity and must match the
Git tree at `devBaselineSha` for those paths. English `docs`, `docs-byoc`,
sidebars, snapshots, reports, and the assembly descriptor may remain present in
the current full-tree artifact format for migration compatibility, but they
must equal the paired baseline and are never translation mutations.
If `.translation-cache/ja-JP.json` is absent from the source commit, both Git
comparison and producer baseline normalize it to the existing canonical
`{"files":{}}` default before hashing.

The translation cache receives key-level ownership validation. Every changed
cache key must correspond to a normalized Guides translation path listed in the
batch's deterministic candidate set or in its validated Guides source-delta
delete/rename set. All Python, Java, Node, Go, CLI, REST, and otherwise
non-Guides cache entries must be byte-semantically equal to baseline.

Numbered checkpoint manifest schema 2 therefore adds a checksummed
`batch-input.json` containing the normalized candidate translation paths and
validated source-delta delete/rename paths, plus their SHA-256. Baseline and
translated artifacts for the same batch carry the same batch-input identity.
The composer uses this contract for cache-key and output-path authorization.

The expected target SHA is not artifact metadata. The publisher resolves it
once from the remote target at startup, after the existing source-publisher
serialization dependency, and uses it as the staging base. Before composition,
these Guides source-authority paths at that target must exactly match the
recorded translation source checkpoint:

```text
docs
docs-byoc
config/generated/guides.sidebar.js
config/generated/guides-byoc.sidebar.js
plugins/lark-docs/meta/snapshots/guides-uat-last-success.json
plugins/lark-docs/meta/assembly/guides.json
```

Other SDK commits may differ. Any Guides source drift fails before applying a
batch.

Archive paths, payload hashes, owned paths, and manifest schema continue to
receive the existing security checks. Numbered translation baseline and result
artifacts use checkpoint manifest schema 2, which replaces the required schema-1
`validation.commands/passed` object with the checksummed batch-input contract.
`validate-checkpoint-artifact.js` accepts schema 1 for existing source and
unbatched artifacts and schema 2 only for complete numbered translation batch
metadata. It rejects a schema-1 numbered batch after the migration. GitHub job
steps remain the authority for per-document checks. The final publication
report records commands actually executed against staging.

### Delta derivation and application

Add a translation-specific composer:

```text
scripts/docs-workflow/apply-translation-batch.js
```

For each batch, it compares translation-mutable paths in the artifact payload
with that artifact's validated baseline and classifies them as added, modified,
deleted, or unchanged. Only added, modified, and deleted paths are applied to
the shared staging worktree. Unchanged full-tree payload files and all English
owned paths are ignored after equality validation.

The composer tracks mutations contributed by prior batches:

- the same resulting bytes are idempotent and allowed;
- the same deletion is idempotent and allowed;
- different writes to the same path fail;
- write/delete and ancestor/descendant conflicts fail;
- paths outside Guides translation ownership fail.

`.translation-cache/ja-JP.json` retains semantic three-way merging using the
validated baseline, batch cache, and accumulated staging cache.

Application remains transactional. A failed batch restores the worktree to the
state before that batch and does not create its local commit.

### Local commits and staging ref

The job's primary checkout remains pinned to `master_sha` and supplies tooling.
The publisher creates one additional detached staging worktree from the
expected target baseline; this is the single worktree reused for every batch.
Each non-empty, successfully applied batch creates one local commit. Empty or
fully idempotent batches are recorded but do not create empty commits.

If preparation produced `batch_count > 0` but every batch is idempotent against
the current target, the publisher creates no staging ref, runs no promotion,
and returns:

```text
status=no_changes
commit_sha=<expected-target-sha>
```

The publication report uses `status: no_changes` and records that composition
was idempotent. `finalize-translation-batches.js` maps this to translator
`translation_ready`, publisher `no_changes`, and the exact expected target SHA.
Aggregate and Feishu show `No translation changes`, not `Published`. This is
distinct from preparation finding zero batches, which keeps the existing
zero-batch no-change result and need not report a commit SHA.

After all batches compose successfully, push the commit chain to an internally
constructed run-unique ref:

```text
refs/heads/docs-translation-staging/guides/<run-id>-<run-attempt>-<pending-sha-prefix>
```

User input cannot control the ref. Its components are validated and bounded.
The staging namespace must not trigger documentation deployment workflows.

The staging ref is pushed before expensive final validation. Validation failure
therefore preserves the exact candidate and its commit history for diagnosis.

## Final Validation and Promotion

### One authoritative Guides batch-composition gate

Per-batch jobs keep inexpensive checks:

- provider/reviewer result validation;
- translated-document checks;
- archive, manifest, and payload integrity;
- batch identity and changed-path ownership.

After pushing staging, the job requires the staging worktree to be clean and
its `HEAD` to equal the staged SHA. In the primary checkout pinned to
`master_sha`, it restores the exact generated state from the staged SHA, then
runs these hard-coded commands once:

```text
npx docusaurus mdx-parse -d docs
npx docusaurus mdx-parse -d docs-byoc
npx docusaurus mdx-parse -d i18n/ja-JP/docusaurus-plugin-content-docs/current
npx docusaurus mdx-parse -d i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current
node scripts/validate-generated-sidebars.js
node scripts/validate-translated-coverage.js --group guides
node scripts/run-doc-build-stage.js --build "pnpm run build" --skipCardReporting
```

Missing required roots fail. This gate runs once in the Guides batch publisher
and removes repeated per-batch full-tree checks. It does not replace the later
workflow-wide `_verify-docs.yml` gate, which verifies the final branch after all
content-group publishers.

The validation report records each command, exit result, tooling SHA, expected
target SHA, staging ref, and staging SHA. Only commands actually executed may be
recorded as passed.

### Fast-forward-only promotion

Promotion follows this sequence:

1. fetch the remote target and require it to equal the expected target SHA;
2. require the staged SHA to descend from that expected target SHA;
3. perform a normal, non-force push of the exact staged SHA to the target branch;
4. fetch the target again and require it to equal the staged SHA;
5. return that exact staged SHA as the published Guides translation SHA.

Git's receive-side ref update rejects a concurrent stale update. If the target
moved before or during promotion, publication fails and staging is retained.
The workflow never automatically rebases, merges, force-updates the target, or
validates one commit and publishes another.

On success, delete the staging ref with an expected-old-SHA lease scoped to that
staging ref, for example
`--force-with-lease=<staging-ref>:<staged-sha>`. This conditional deletion is
permitted only for cleanup; target promotion remains a normal non-force push.
A lease mismatch or cleanup failure is best-effort cleanup debt and does not
change the already-completed publication result. On validation or promotion
failure, retain the ref.

Old retained staging refs are never promoted automatically. Recovery must
verify current ownership and source identities, replay the candidate onto the
then-current target when necessary, and rerun the complete final gate.

`_publish-translation-batches.yml` returns the verified promoted staging SHA
directly. `finalize_guides_translation` passes that output into
`finalize-translation-batches.js`; the finalizer must not refetch the branch to
infer a commit. Aggregate and the final card report consume the same verified
SHA.

### Publication report and cancellation

The publisher writes this terminal artifact on `always()` when the runner is
still able to execute cleanup steps:

```text
artifact: docs-translation-publication-guides-<run-id>-<run-attempt>
file:     publication-report.json
```

Its schema is:

```text
schemaVersion, runId, runAttempt, group, masterSha, sourceCheckpointSha,
expectedTargetSha, stagingRef, stagingSha,
status: no_changes | composition_failed | staged | validation_failed |
        promotion_conflict | published | cancelled,
validation: [{ id, command, result }],
resultSha,
cleanup: { status, detail },
failure: { gate, detail, recovery }
```

SHA and run identities are validated before the finalizer or aggregate accepts
the report. `resultSha` is the staged SHA for `published`, the expected target
SHA for a nonzero idempotent `no_changes`, and empty for failure. The aggregate
downloads this artifact with `continue-on-error` and adds its bounded recovery
facts to `docs-card-report-<run-id>`.

A hard cancellation or timeout may prevent the terminal artifact from being
uploaded. The staging ref name is therefore deterministic from run ID and
attempt, with the pending-hash suffix discoverable by listing only:

```text
refs/heads/docs-translation-staging/guides/<run-id>-<run-attempt>-
```

After cancellation, the card uses GitHub's cancelled state and never displays
`Published`. Recovery instructions explain how to locate the deterministic ref
when no report exists. If cancellation happens before staging push, no remote
candidate exists and recovery restarts composition from the retained batch
artifacts.

## Feishu Card State

The existing top-level `Publish translations` phase remains. The centralized
monitor remains the only component with Feishu credentials and the only card
writer.

Live state comes from these exact publisher step names through the GitHub Jobs
API:

```text
Validate Guides translation batch identities
Apply Guides translation batches to staging
Push Guides translation staging ref
Validate combined Guides translation
Promote validated Guides translation
Clean up Guides translation staging ref
```

`scripts/docs-workflow/docs-progress-state.js` maps those steps to the card's
current task. GitHub polling may skip short-lived intermediate labels; the
design does not require every transient state to be visible. Immutable
artifacts are terminal evidence, not a live update channel.

The Guides translation details progress through:

```text
Applying batches
  -> Staged
  -> Validating combined translation
  -> Validated
  -> Promoting to dev
  -> Published
```

`Staged` and `Validated` are not publication. The card advances translated
completion counts and displays `Published` only after promotion and remote SHA
verification succeed.

When preparation finds zero batches, no staging ref or promotion occurs. The
phase completes as `No translation changes`, never `Published`.

Media and sidebar details distinguish:

- media cache candidate rejected, rebuilt, reused, or repaired but not saved;
- freshly network-resolved media versus manifest reuse and committed-doc
  reconstruction;
- sidebar reused or regenerated, with a bounded decision reason;
- staging ref creation, final gate, target promotion, and cleanup.

For failures where the runner can emit the terminal publication report, it
includes:

```text
staging ref
staging SHA
expected target SHA
current target SHA when available
failed gate or promotion check
recovery instruction
```

Missing or malformed publication metadata falls back to authoritative GitHub
job/step and aggregate state. It must never invent staging or publication facts.
A successful aggregate remains the authority for overall terminal child
normalization, matching current monitor behavior; Guides translation is labeled
`Published` only when aggregate input contains the publisher's verified promoted
SHA. A missing final card-report artifact may remove detail but cannot create or
erase that aggregate publication fact.

## Failure Semantics

| Failure | Result |
| --- | --- |
| v4 candidate missing or invalid | Try bounded legacy fallback, then rebuild the required scope |
| Media invalid with zero source delta | Rebuild complete canonical media coverage |
| Repaired media cache cannot be saved | Checkpoint may succeed; report persistence failure |
| Sidebar descriptor proof fails | Regenerate and validate both sidebars |
| Duplicate source index identity | Fail with both conflicting paths unless an explicit deterministic rule exists |
| Batch identities disagree | Fail before changing staging |
| Paired baseline differs from the source checkpoint | Fail before changing staging |
| Guides source-authority paths drift on the target | Fail before changing staging |
| Batch deltas conflict | Roll back that batch and fail before staging publication |
| Final staged-tip validation fails | Retain staging ref and report recovery data |
| Target branch moves | Do not publish; retain staging ref |
| Promotion succeeds but staging deletion fails | Publication remains successful; report cleanup debt |
| Cancellation after staging push | Deterministic ref remains discoverable; render cancelled, never published |
| Publication artifact missing or invalid | Render GitHub/aggregate-derived state without inventing staging or publication facts |

## Testing and Acceptance Criteria

### Media recovery

1. A cache match with an invalid manifest is rejected.
2. Invalid media with valid sources and an empty delta scans the full canonical
   snapshot and produces complete coverage.
3. A repaired cache saves under a new v4 generation.
4. The next identical run restores the repaired generation rather than the
   older rejected candidate and uses the incremental path.
5. Cache-save failure is visible and is not reported as persisted.
6. Rejected candidate files cannot remain in or influence a later fallback.
7. Media metrics reconcile: final entries equal manifest reuse plus committed
   reconstruction plus fresh network resolution, and equal canonical required
   references. Stale drops remain a separate diagnostic.

### Sidebar performance and correctness

1. Each source file is parsed at most once per index construction.
2. Source lookups do not enumerate the source directory after index creation.
3. Indexed generation is byte-for-byte equivalent to current valid SaaS and
   BYOC sidebar fixtures.
4. Volatile snapshot metadata does not change semantic identity.
5. Relevant navigation, ownership, generator, configuration, or schema changes
   change the corresponding identity.
6. Missing or tampered descriptor/sidebar files force regeneration.
7. An unchanged exact baseline with zero canonical delta and zero tables reuses
   both sidebars.
8. A benchmark fixture records before/after wall time and demonstrates removal
   of repeated whole-directory parsing; no fixed CI timing threshold is used.
9. Source publication restores and checkpoints the descriptor, and translation
   artifact construction does not declare it deleted.
10. Navigation parent, order, label, target, progress, link, ref, or table-digest
    changes force regeneration.
11. Candidate and promoted snapshots with the same content identity but
    different `targets_built` staging values can match; a different
    `master_sha` cannot reuse the initial-rollout descriptor.

### Translation safety and publication

1. Applying batch 2 cannot revert a file changed only by batch 1.
2. Identical overlapping changes are accepted; different overlapping changes
   fail.
3. Incomplete, duplicate, or identity-mismatched batches fail before staging
   mutation; arbitrary download order is normalized to numeric batch order.
4. Translation-cache changes merge semantically across batches.
5. A failed batch restores the pre-batch worktree state.
6. Batch artifacts never claim an unexecuted production build.
7. Schema-2 batch input is checksummed, complete, and rejected under schema 1
   after migration.
8. Non-Guides translation-cache key changes and cache keys outside the batch
   candidate/source-delta set are rejected.
9. Paired baselines must match one another and the translation source Git tree.
10. Guides source drift between the source checkpoint and publisher target tip
   fails before composition.
11. File/directory, write/delete, and ancestor/descendant conflicts fail.
12. Pinned `master_sha` tooling validates generated state restored from the
    exact staged SHA, and the Guides composition gate runs once.
13. The later workflow-wide verification remains enabled.
14. A failed final gate leaves the staging ref and recovery metadata.
15. A moved target branch cannot be overwritten or marked published.
16. The finalizer returns the exact promoted staged SHA, not a later refetch
    inferred as the translation commit.
17. Successful promotion deletes only the expected staging candidate; a lease
    race leaves the replacement ref untouched, and failed
    cleanup does not erase publication evidence.
18. Cancellation or timeout after staging push leaves a discoverable candidate
    and cannot produce a published state.
19. Nonzero but fully idempotent batches create no staging ref, return the
    expected target SHA with publisher `no_changes`, and never render published.

### Feishu truthfulness

1. Staging and validation never render as `Published`.
2. Completion counts advance only after verified target promotion.
3. Media manifest size is never labeled as the number downloaded.
4. A retained staging ref and failed gate appear in the terminal report.
5. Invalid progress metadata cannot produce a false successful state.
6. Zero translation batches render `No translation changes` without staging or
   promotion.
7. Aggregate success with a missing card-report artifact preserves the verified
   publication fact but does not invent unavailable recovery details.

## Rollout

The umbrella design is executed through three implementation plans so each
boundary can be reviewed, tested, and rolled out independently:

### Milestone A: Media generations and reporting

1. Add unit and policy tests for the new contracts without changing production
   behavior.
2. Introduce v4 generational restore/save and verify two identical disposable
   runs: the first repairs and the second restores the repaired generation.

### Milestone B: Sidebar index and assembly identity

3. Add source indexing and assembly identity in observe-only mode, recording
   reuse decisions while still regenerating. Compare sidebar bytes and timing.
4. Enable sidebar reuse after observe-only results agree for representative
   zero-delta runs.

### Milestone C: Translation staging and Feishu integration

5. Add translation delta composition and staging publication on a disposable
   target branch. Inject overlapping batches, validation failure, and target
   movement, cancellation, and cleanup lease races.
6. Enable fast-forward promotion to `dev` and verify the Feishu state sequence.
7. Retain manual cleanup instructions for abandoned staging refs. Add scheduled
   TTL cleanup only if accumulation becomes measurable.

Media rollback disables v4 and returns to the validated legacy path. Sidebar
rollback disables reuse and returns to full regeneration. Translation rollback
must either retain the delta-safe composer while disabling staging promotion,
or disable Guides translation publication entirely; it must never return to
sequential complete-tree batch application. v4 cache entries are isolated by
namespace and do not alter legacy cache contents.

## Operational Recovery

For a retained staging candidate, the terminal report and recovery documentation
supply commands that:

1. fetch the exact staging ref and target;
2. verify the recorded staging SHA and original target lineage;
3. show the batch commit chain and failed gate;
4. recreate or replay the candidate on the current target if required;
5. run the complete authoritative gate;
6. perform the same fast-forward-only promotion checks.

Staging refs have a documented retention expectation. Manual deletion uses an
expected-SHA lease. Automated cleanup is outside the initial implementation.

## Security and Integrity

- Cache, artifact, and descriptor paths are fixed repository-relative paths.
- Restored files remain subject to hash, regular-file, traversal, symlink, and
  ownership checks.
- Staging ref names are generated internally from bounded trusted values.
- Translation workers do not receive Feishu credentials or target-branch write
  permission.
- Only the publisher receives the minimum permission needed to create staging
  and fast-forward the configured target.
- Operational reports contain hashes, counts, commands, and ref names but no
  credentials or downloaded media bytes.

## Non-Goals

- Building a dedicated content-addressed cache service.
- Committing the operational media manifest solely to repair Actions caches.
- Checking every remote object-store item on every run.
- Creating a persistent sidebar index database or daemon.
- Changing translated text or translation provider behavior.
- Allowing workers to update the Feishu card.
- Force-updating the target branch, broad force pushes, automatic rebases,
  automatic merges, distributed locks, or a separate staging repository. The
  narrowly scoped expected-SHA staging-ref deletion lease is allowed.
- Automatically promoting an old retained staging ref.
- Adding scheduled staging-ref garbage collection before retained-ref volume is
  measurable.
