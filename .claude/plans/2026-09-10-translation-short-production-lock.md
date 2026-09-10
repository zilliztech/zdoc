# Translation short production lock (Phase 2 of the online translation efficiency spec)

Implementation plan record for `.claude/specs/2026-09-09-online-translation-efficiency.md` Phase 2. Implemented on `feat/translation-short-production-lock`.

## Shape

- `translate-codex.yml` becomes a producer workflow. Its concurrency group is unconditionally `format('translation-readonly-{0}', github.run_id)`; it never owns `docs-production-dev`.
  - `publish=false` (artifact-only) and `production_queue_owned=true` (recovery `workflow_call`) keep the existing inline `publish_ready`/`aggregate` jobs. Their `if` gains the inline gate `(!inputs.publish || inputs.production_queue_owned || false)`.
  - Standalone publish (`publish=true`, no owned queue) ends with the new `dispatch_publication` job: `gh workflow run publish-translation.yml -f producer_run_id -f producer_run_attempt -f selection_sha256 -f request_id`, request-id title disambiguation (the `dispatch_translations` pattern), and a `docs-translation-publication-handoff-<run_id>` metadata artifact (`publication-handoff.json` with producer/publisher run identity) for the monitor and recovery planner.
- `publish-translation.yml` (new) owns `docs-production-dev` + `queue: max` unconditionally.
  - `publish_ready` downloads the selection artifact from the producer run by derived name (`gh run download`), pre-checks identity with `jq`, checks out `selection.toolingSha`, fully authenticates the selection (`publication-contracts.js validate-selection` plus producer-run/checksum/publish-mode assertions), and runs the coordinator with `--publisher-run-id/--publisher-run-attempt`. The coordinator client keeps using `selection.runId/runAttempt` (producer identity), so producer jobs/artifacts are polled cross-run unchanged.
  - `aggregate` mirrors the previous translate-codex aggregate with producer identity substituted for `GITHUB_RUN_ID` and two new bindings: `results.publisherRunId/publisherRunAttempt` must equal the publisher run, and the final-tip equality check runs while the publisher still holds the lock.
- Identity model: selection/ready/checkpoint/baseline documents and artifact names stay bound to the producer run. `publication-progress`/`publication-results` gain optional all-or-nothing `publisherRunId`/`publisherRunAttempt` conditional keys (the `recoveryProvenance` precedent). Artifacts uploaded from the publisher run keep producer-derived names.
- Monitor: `_monitor-translation-progress.yml` gains `split_publication`. In split mode the producer-side monitor drops the producer run's skipped inline `publish_ready`/`aggregate` ghost jobs, discovers the publisher run through the handoff metadata artifact, merges the publisher run's jobs for state derivation, and reads progress/results from the publisher run with strict producer/publisher identity checks. `dispatch_publication` failing terminates the card with failure.
- Recovery: `translation-recovery-planner.js` accepts the producer run id as before; when the handoff metadata artifact exists it authenticates the publisher run (repository, jobs, artifact inventory) and pulls publication evidence from it, requiring the documents' publisher identity to match. The recovery provenance evidence records `publisherRunId/publisherRunAttempt` (adapter schema accepts them as an optional pair).
- Governance: `publish-translation.yml` is an unconditional `docs-production-dev` owner and `TOP_LEVEL_WRITER_INVENTORY` member (`publish_ready` only); translate-codex must keep the unique readonly group; the `production_queue_owned` input bindings are the inline gate (twice), the split monitor flag, and the dispatch gate. Offline publication workflows, recovery, and Fetch are unchanged.

## Out of scope

- Fetch keeps its whole-run `repair → publish → reconcile → handoff` locked transaction (spec contract point 4).
- No new replay harness or package script; `test:replay:translation` covers the split identity through the extended default replay lane (`publisherIdentity` threads into the real coordinator run, CLI parity `--publisher-run-id/--publisher-run-attempt`).

## Verification

Same selector union as the spec's Phase 2 acceptance: focused contract tests, `pnpm test:translation-workflow`, `pnpm test:translation`, Translation FIFO replay, workflow policy tests, matrix selector over the full diff, `git diff --check`. No paid translation run and no real `dev` publication was performed.
