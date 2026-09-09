# Online Translation efficiency plan

## Goal

Reduce the paid online Translation critical path and wasted retries while preserving the existing immutable handoff, per-file recovery, checkpoint, FIFO publication, and `dev` branch safety contracts.

## Observed baseline

- Japanese Guides uses durable batches of 30 files.
- Guides batches are serialized with `max-parallel: 1`.
- A normal Guides producer uses one translation worker; recovery uses two.
- A file may run for 60 minutes and the agent runner soft deadline defaults to five hours.
- The publish coordinator starts with the producers and may poll for almost six hours.
- A failed numbered batch does not currently stop later serialized batches because the matrix has `fail-fast: false`.
- A publish-enabled Translation run owns `docs-production-dev` for its complete lifetime, although only the final publication transaction writes `dev`.

## Phase 1: bounded paid work

Implement first because it is local to the producer contract and recoverable through existing per-file artifacts.

1. Reduce the Guides durable batch size from 30 to 15.
2. Use two workers for normal Guides translation, matching the already-supported recovery concurrency.
3. Bound a Guides producer to a 90-minute soft deadline and a 30-minute per-file timeout.
4. Enable matrix fail-fast for serialized Guides batches so a failed shared validation/checkpoint contract prevents later paid batches from starting.
5. Preserve `TRANSLATION_ALLOW_PARTIAL=true`: completed and failed files must still be emitted into the per-file recovery artifact, and unfinished files remain recoverable rather than being silently accepted for publication.
6. Add structural tests for all four runtime limits and retain the existing batch/recovery/checkpoint tests.

Expected outcome: common full Guides work has half the per-batch failure domain and up to two files in flight; a defective batch stops the remaining paid sequence. This is an operational hypothesis until measured by an artifact-only/authorized online A/B run.

## Phase 2: short production lock

Do not combine this mechanically with Phase 1. Design and implement it as a separate publication-transaction change because workflow-run identity is part of the publication documents.

Required contract before implementation:

1. Producer workflow runs outside `docs-production-dev` and emits immutable selection, ready descriptors, checkpoints, baselines, and per-file recovery artifacts.
2. A separately triggered publication workflow owns `docs-production-dev` and authenticates the producer repository, run id/attempt, tooling SHA, selection checksum, target baseline, and exact artifact digests.
3. The publication workflow performs target-baseline CAS, FIFO application, result publication, and terminal ancestry verification under the lock.
4. Fetch retains its larger `repair -> publish -> reconcile` locked transaction; this phase changes Translation only.
5. Recovery and offline publication continue using the same writer queue without nested lock acquisition.

Phase 2 is accepted only after focused contract tests, Translation FIFO replay, workflow policy tests, and a real retained-artifact local replay demonstrate that no unauthenticated or stale producer can write `dev`.

## Verification

Run the selector command union for every changed path, beginning with focused tests:

```bash
pnpm test:translation-workflow
pnpm test:translation
node --test deploy/contracts/fetch-translation-workflow.test.mjs deploy/contracts/site-validation-workflow.test.mjs deploy/contracts/master-tooling-sync-workflow.test.mjs
pnpm vitest run packages/docs-tooling/src/workflows/run.test.ts packages/docs-tooling/src/workflows/groups.test.ts
pnpm test:replay:translation
pnpm test:workflow-policy
pnpm test:workflow-matrix
git diff --check
```

Run `actionlint` for each changed workflow when available. No paid Translation run and no real `dev` publication is authorized by this implementation task.
