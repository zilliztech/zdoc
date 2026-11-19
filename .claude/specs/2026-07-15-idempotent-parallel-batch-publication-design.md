# Idempotent Parallel Translation Batch Publication

## Goal

Keep translation agents parallel while making sequential batch publication safe when independently produced artifacts repeat source-reconciliation changes such as deletions and renames.

## Problem

Every parallel translation batch starts from the same immutable source publication SHA and generated-state baseline. Before selecting its translation slice, each batch applies the complete source reconciliation delta. Consequently, every checkpoint may contain the same legitimate deletions.

The existing publication coordinator already fetches the latest target-branch tip before applying every batch. Application is idempotent, but scoped Git staging passes every manifest path directly to `git add --all`. After an earlier batch commits a deletion, a later batch's repeated deletion is absent from both the filesystem and the latest Git index. Git rejects that unmatched pathspec and the later batch publishes none of its translations.

## Constraints

- Translation agents remain parallel and continue using the same immutable baseline.
- Batch artifacts remain independently valid and do not depend on publication order.
- Publication remains sequential so the target branch has a simple fast-forward history.
- Only paths declared by the validated checkpoint manifest may be staged.
- Existing translation-cache three-way merging and non-fast-forward retry behavior remain intact.
- Already-applied mutations become no-ops rather than errors.

## Considered Approaches

### External watcher or sibling-job notification

A watcher could poll the target branch and notify publishers when another batch pushes. This adds API polling or an external coordination store because GitHub Actions cannot directly broadcast live sibling-job outputs. It also does not address the observed failure: batch 2 already fetched batch 1's commit before failing.

### Assign shared deletions to one designated batch

Only batch 1 could carry source-reconciliation deletions. This would couple correctness to publication order and prevent later batches from publishing independently if batch 1 fails or is skipped.

### Latest-tip coordinator with actual-diff staging

Retain the current single publication coordinator. For every batch, fetch the latest target tip, apply and validate the checkpoint, then stage only declared paths that still represent a change relative to that tip. This preserves parallel translation, order-independent artifacts, scoped publication, and existing retry semantics.

This is the selected approach.

## Design

### Publication data flow

For each validated batch artifact, the coordinator performs:

1. Fetch the latest target-branch tip.
2. Create a detached publication worktree at that exact tip.
3. Apply the artifact, including translation-cache three-way merging.
4. Run the configured validation command.
5. Reduce the manifest's declared paths to stageable paths:
   - If the path exists after application, include it as a new or modified candidate.
   - If the path is tracked in the current publication worktree's `HEAD`, include it as a deletion candidate.
   - If it neither exists nor is tracked, classify it as an already-applied no-op and omit it.
6. Stage the remaining paths with literal pathspecs.
7. Verify that every staged path is covered by a declared manifest path.
8. Return `no_changes` if the index is unchanged; otherwise commit and push.
9. On a retryable non-fast-forward rejection, discard the worktree and repeat from step 1.

The coordinator does not rewrite or mutate uploaded checkpoint artifacts.

### Scoped staging

The publisher will use a focused helper to build the stageable path set. It will not use repository-wide `git add --all`.

For each validated manifest path, the helper checks the publication worktree rather than the producer baseline. Git queries use literal pathspecs so filenames cannot be interpreted as glob patterns. Directory deletions and file-directory transitions remain supported by testing both filesystem existence and tracked descendants.

After staging, the publisher obtains the cached changed paths and verifies that each path is equal to, or nested under, one of the declared manifest paths. An out-of-scope staged path fails publication before commit.

### Repeated deletion behavior

Given a deletion present in multiple batch manifests:

- The first published batch finds the path tracked in `HEAD`, stages its deletion, and commits it.
- A later batch starts from the new tip, finds the path absent and untracked, logs it as already applied, and continues staging its own remaining translations.
- Reapplying an artifact whose complete mutation set is already present returns `no_changes` with the current target SHA.

### Observability

The publisher will log counts for declared paths, stageable paths, already-applied paths, and staged changes. Diagnostics will identify skipped already-applied paths without treating them as warnings or failures.

## Error Handling

- Invalid or unsafe checkpoint manifests continue to fail before target mutation.
- Out-of-scope staged paths fail closed before commit.
- Validation failures publish nothing and clean the temporary worktree.
- Genuine translation-cache conflicts still fail closed.
- Non-fast-forward pushes retain the current bounded retry loop and recompute the actual diff from the new tip.
- Missing paths are ignored only when they are also untracked in the current target tip. A tracked missing path remains a real deletion and is staged.

## Testing

Regression coverage will include:

1. A first artifact deletes a tracked translated file and publishes successfully.
2. A second artifact repeats that deletion, adds a different translation, and publishes the new translation successfully.
3. Reapplying a fully published artifact returns `no_changes`.
4. A tracked missing file is still staged as a deletion.
5. An absent and untracked manifest path is classified as already applied.
6. Directory deletions and file-directory transitions remain supported.
7. Literal pathspec handling prevents glob interpretation.
8. Cached staged paths cannot escape the validated manifest scope.
9. A non-fast-forward retry recalculates the stageable set from the new target tip.
10. Workflow policy continues to require parallel translation and the single ordered batch publisher.

## Non-goals

- No external watcher, queue service, database, or GitHub API polling loop.
- No serialization of translation agents.
- No assignment of shared reconciliation changes to a special batch.
- No changes to translation manifest partitioning, agent behavior, or translation-cache schema.
