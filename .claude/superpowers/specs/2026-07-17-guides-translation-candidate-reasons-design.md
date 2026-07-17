# Guides Translation Candidate Reasons and Idempotent Publication

## Goal

Make Guides translation runs report and process only documents whose Japanese state requires work, while preserving recovery for stale, missing, failed, or unpublished translations. Integrate the existing idempotent batch-publication fix so independently produced translation batches can safely repeat shared source deletions.

## Current Behavior

The translation manifest scans every owned Guides Markdown source. A document is skipped only when its Japanese target exists and `.translation-cache/ja-JP.json` records the current English `sourceHash`. The current English source delta affects ordering but does not restrict the candidate set.

This behavior recovered 163 candidates in workflow run `29524179358`:

- 15 documents changed in the current English source delta;
- 18 unchanged documents had no Japanese target;
- 130 unchanged documents had a Japanese target but a stale cached English hash.

All three categories require processing. The problem is that the workflow reports only an undifferentiated total, which makes historical reconciliation look like an unexpectedly large current delta.

The same run also exposed a publication race. Every parallel batch carried the deletion of the removed BYOC `managed-volume.md` translation. Batch 1 published the deletion, then batch 2 failed because scoped `git add` received the now-absent path as an unmatched pathspec. The complete fix already exists on `fix/idempotent-batch-publication` but is not merged into `master` and has no GitHub pull request.

## Selected Approach

Retain per-file cache reconciliation and add an explicit candidate reason to every translation manifest item. Merge the existing idempotent-publication branch into the current Guides workflow-fix branch.

This approach is selected because the per-file cache is the durable completion record. A failed or unpublished translation must not advance its cache hash, so it naturally remains eligible on the next run. Restricting translation to the current source delta would lose such work after the source checkpoint advances. A separate retry ledger would duplicate completion state and create another state-consistency boundary.

## Candidate Classification

Each manifest item will contain exactly one `reason` with the following precedence:

1. `current_delta`: the live English source path appears in `sourceDelta.changedEnglish`.
2. `missing_target`: the Japanese target does not exist and the source is not in the current delta.
3. `stale_source`: the Japanese target exists, but the cache entry is missing or its `sourceHash` differs from the current English hash.

A document is excluded only when the Japanese target exists and its cached `sourceHash` equals the current English hash.

Current-delta precedence keeps the run's actual source changes visible even when a newly added page also lacks a target or a modified page necessarily has an older cached hash. The other reasons describe historical reconciliation work.

Deleted English sources do not become model-translation candidates. Source-delta reconciliation continues to delete their Japanese targets and cache entries through the checkpoint deletion flow.

## One-Time Stale Backlog

The 130 stale-hash pages will be translated once. Their cache entries advance only when their translation checkpoint publishes successfully. After the backlog is published, later runs will skip those pages unless their English source changes again or their Japanese target is removed.

The implementation will not trust existing Japanese files by rewriting stale cache hashes without translation. Doing so could certify an outdated translation as current.

## Manifest and Batch Data Flow

The unpartitioned manifest remains the canonical pending set. Candidate reasons are computed before sorting and batching and are included in the pending-set identity. This prevents two logically different candidate sets from sharing the same durable batch identity.

Sorting remains deterministic:

1. `current_delta` candidates first;
2. `missing_target` candidates second;
3. `stale_source` candidates third;
4. source path as the stable tie-breaker within each reason.

Every selected batch preserves the original item's `reason`. Translation reports and checkpoint metadata therefore retain the classification without recomputing it from a later filesystem state.

## Reporting and Observability

The prepare stage will emit machine-readable and human-readable counts:

```text
translation candidates: total=163 current_delta=15 missing_target=18 stale_source=130
```

The aggregate workflow and Feishu card report will use these counts when available. User-facing wording must distinguish "current English changes" from "translation candidates." A large stale backlog may be noteworthy, but it is not a source-fetch delta.

Batch reports will include each document's candidate reason. Failed documents retain both the reason and the translation/review failure details.

## Idempotent Batch Publication Integration

The current feature branch will integrate all commits from `fix/idempotent-batch-publication`:

- select only checkpoint-declared paths that still differ from the latest publication tip;
- stage a missing path only when it remains tracked and therefore represents a real deletion;
- treat an absent, untracked declared path as an already-applied no-op;
- validate that staged paths remain within checkpoint ownership;
- preserve bounded non-fast-forward retry behavior and recompute stageable paths from each new tip.

This allows every batch artifact to remain independently valid while publication stays sequential and idempotent.

## Failure and Retry Semantics

- A translation or review failure does not update the document's cache entry, so the document remains a candidate.
- A successfully generated checkpoint that fails publication does not update the target branch cache, so its documents remain candidates.
- A published batch updates only the cache entries covered by its successful translations.
- Repeated source deletions become no-ops after the first successful publication.
- Genuine translation-cache merge conflicts, unsafe manifests, validation failures, and out-of-scope staged paths continue to fail closed.

## Testing

Candidate-selection tests will verify:

1. A current changed document is classified as `current_delta`.
2. An unchanged source without a Japanese target is classified as `missing_target`.
3. An unchanged source with a target and an old or absent cache hash is classified as `stale_source`.
4. A target with a current cache hash is excluded.
5. Current-delta classification takes precedence over missing-target and stale-source conditions.
6. Candidate ordering and pending-set hashing include the reason deterministically.
7. Batch manifests and translation reports preserve the reason.
8. Summary counts distinguish current changes, missing targets, and stale translations.
9. A failed or unpublished translation is selected again on the next manifest build.
10. A successfully published translation is skipped on the next manifest build.

Publication regression tests will verify:

1. The first batch can publish a shared deletion.
2. A later batch can repeat the same deletion and still publish its translations.
3. An entirely repeated artifact returns `no_changes`.
4. Tracked deletions, directory transitions, literal pathspecs, scope validation, and non-fast-forward retry behavior remain correct.

Workflow-policy tests will require candidate-reason reporting and idempotent scoped publication to remain wired into the reusable workflows.

## Rollout and Verification

The combined branch will run focused manifest, batching, reporting, publisher, and workflow-policy tests first, followed by the complete docs-workflow test suite, type checking, workflow-policy validation, and whitespace checks.

The first successful production run may still show the one-time stale backlog. The acceptance criterion is not an artificially small first run; it is accurate reason reporting and successful cache advancement. A subsequent run with no new English changes, no removed Japanese targets, and no failed publications should produce zero candidates.

## Non-goals

- Do not mark stale translations current without translating them.
- Do not restrict recovery to the current source delta.
- Do not add an external retry database or a second persistent pending ledger.
- Do not serialize translation agents.
- Do not change translation prompts, language quality rules, or source-fetch selection.
