# Docs Workflow CI Failure Fix Design

## Goal

Fix the scheduled documentation workflow failures without weakening immutable-input validation or publication safety.

## Scope

The change addresses three confirmed defects:

1. The guides translation batch publisher contains an inline Node heredoc whose YAML-rendered indentation makes the shell script invalid.
2. Final verification checks out the final `dev` commit and then tries to execute tooling that exists only at the immutable `master` commit.
3. The aggregate publication reporter invokes `report-live-card.sh` without the required job override variables.

## Design

### Batch artifact validation

Move the inline Node validation from `_publish-translation-batches.yml` into a focused script under `scripts/docs-workflow/`. The script will accept the translated checkpoint directory, baseline checkpoint directory, expected batch number, and expected batch count. It will reuse `validateCheckpointArtifact`, verify both manifests have the expected batch identity, and require the baseline translation cache to be a regular non-symlink file.

The workflow will invoke this script once per batch. This removes the YAML-to-shell heredoc boundary and makes the validation independently testable.

### Final verification checkout model

Final verification will check out `master_sha` as the primary workspace and install dependencies there. It will then fetch `final_dev_sha`, create a detached worktree for the exact final generated-content state, and restore generated state from that commit into the primary master-tooling workspace using the repository's existing `restore-generated-state.sh --exact --ref` mechanism.

All validators, build tooling, workflow-policy checks, and test files will therefore come from the immutable master commit, while generated documentation and translation state come from the exact final dev commit. The temporary worktree will be removed in an always-running cleanup step.

### Card reporting

The guides translation batch publication reporter will provide `CARD_JOB_NAME` and `CARD_JOB_CONCLUSION`, matching the contract already used by other aggregate-mode workflow steps. The conclusion will reflect the publish step outcome.

## Error handling

- Batch validation exits nonzero before publication if artifact identity or cache safety checks fail.
- Verification retains `set -euo pipefail`, report artifact upload, deterministic `passed`/`failed` output, and the terminal failure step.
- Worktree cleanup runs regardless of verification outcome.
- Card reporting remains `continue-on-error`, so reporting failures cannot replace the operational failure status.

## Testing

- Add unit tests for valid batch artifacts, mismatched batch identity, and unsafe/missing baseline translation cache.
- Extend workflow-policy tests to require the external validator invocation and reject inline Node heredocs in the batch publisher.
- Update final-verification tests to require immutable master checkout, exact final-dev materialization, generated-state restoration, and cleanup.
- Extend workflow-policy tests to require both card job override variables in the aggregate publication reporter.
- Run the focused Node tests, workflow-policy validation, shell syntax checks, and the relevant existing docs-workflow tests.

## Non-goals

- No change to translation batching, publication ordering, checkpoint retry behavior, or content selection.
- No synchronization or merging of the master branch into dev.
- No changes to Node runtime versions or deprecation warnings.
