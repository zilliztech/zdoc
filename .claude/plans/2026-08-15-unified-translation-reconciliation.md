# Unified Translation Reconciliation Implementation Plan

> Implement task-by-task. Keep production behavior fail-closed and preserve retained-artifact compatibility until the dedicated retirement task.

**Goal:** Implement one authenticated deletion and rename reconciliation mechanism for Japanese Guides, Japanese Reference, and Chinese Reference, with configurable automatic or human authorization, atomic publication, and recoverable evidence.

**Design:** `.claude/specs/2026-08-15-unified-translation-reconciliation-design.md`

## Guardrails

- Read `README.md` before every workflow/publication phase.
- Use CodeGraph before locating unfamiliar implementation paths.
- Do not modify or clean the user's existing REST metadata changes.
- Use an isolated worktree below `.claude/worktrees/` for implementation and real-artifact replay.
- Do not use the real `origin` as a replay publication remote.
- Do not start paid Translation to create evidence.
- Preserve `docs-production-dev`, `queue: max`, FIFO publication, and `REMOTE_STATE_UNKNOWN` behavior.
- Land tooling through the normal PR and master-to-dev sync path.

## Phase 1: Shared contracts with no behavior change

### Task 1: Add the reconciliation plan schema

**Files:**

- Create: `scripts/translation/reconciliation-plan.js`
- Create: `scripts/translation/reconciliation-plan.test.js`
- Modify: `scripts/translation/schema.ts`
- Modify: `scripts/translation/schema.test.ts`

- [x] Define strict schema-v1 plan, operation, evidence, authorization, and result documents.
- [x] Implement canonical JSON serialization and `planSha256`/`operationId` calculation.
- [x] Validate exact target/group ownership, canonical source/target mapping, safe normalized paths, exact SHA identities, timestamps where used, and canonical ordering.
- [x] Reject duplicate source paths, target paths, operation IDs, conflicting operation kinds, unknown keys, symlinks, and cross-root mappings.
- [x] Add fixtures for `delete_target`, `replace_path`, `remove_navigation_only`, and `preserve_target`.
- [x] Add mutation tests proving every identity field changes the plan digest.

Focused verification:

```bash
node --test scripts/translation/reconciliation-plan.test.js
pnpm exec vitest run scripts/translation/schema.test.ts
git diff --check
```

### Task 2: Add shared discovery

**Files:**

- Create: `scripts/translation/reconciliation-discovery.js`
- Create: `scripts/translation/reconciliation-discovery.test.js`
- Modify: `scripts/translation/sourceDelta.js`
- Modify: `scripts/translation/sourceDelta.test.js`
- Modify: `scripts/validate-translated-coverage.js`
- Modify: relevant coverage tests

- [x] Extract target/group mapping and owned-path discovery from `sourceDelta.js` into reusable functions.
- [x] Collect source changes with `--no-renames` from immutable baseline/checkpoint SHAs.
- [x] Compare checkpoint source inventory, target baseline inventory, and target state to find current deletions and historical orphans.
- [x] Preserve current `preservedEnglish` behavior.
- [x] Emit replacement hints separately from authorized operations; do not use Git similarity as authority.
- [x] Require authoritative replacement metadata or later human approval for `replace_path`.
- [x] Produce identical canonical `delete_target` candidates for equivalent Japanese and Chinese mappings.
- [x] Keep `sourceDelta.js` as a compatibility adapter during migration.

Focused verification:

```bash
node --test scripts/translation/reconciliation-discovery.test.js scripts/translation/sourceDelta.test.js
git diff --check
```

### Task 3: Add policy evaluation and review artifacts

**Files:**

- Create: `config/translation/reconciliation-policy.json`
- Create: `scripts/translation/reconciliation-policy.js`
- Create: `scripts/translation/reconciliation-policy.test.js`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/manifest.test.js`

- [x] Define versioned target/group policy, thresholds, preserved roots, and completeness-evidence requirements.
- [x] Start with current Japanese automatic behavior, Chinese REST complete-generation automation disabled, and Chinese SDK/CLI/landing review required.
- [x] Adapt exact matching `config/reference-retirements.json` records into human-approved legacy operations.
- [x] Write deterministic review artifacts for unresolved operations.
- [x] Bind approval receipts to plan SHA, source SHAs, target baseline, tooling SHA, policy ID, reviewer/rule identity, rationale, and expiry.
- [x] Ensure missing approval stops before model invocation.
- [x] Add count and percentage blast-radius tests.

Focused verification:

```bash
node --test scripts/translation/reconciliation-policy.test.js scripts/translation/manifest.test.js
pnpm test:translation
git diff --check
```

## Phase 2: Migrate Japanese without semantic changes

### Task 4: Implement the shared plan executor and Japanese adapter

**Files:**

- Create: `scripts/translation/apply-reconciliation-plan.js`
- Create: `scripts/translation/apply-reconciliation-plan.test.js`
- Modify: `scripts/translation/applySourceDelta.js`
- Modify: `scripts/translation/applySourceDelta.test.js`

- [x] Validate plan, approval, source checkpoint, and target baseline before mutation.
- [x] Implement filesystem safety checks equivalent to or stronger than current Japanese deletion checks.
- [x] Remove Japanese target files and related `.translation-cache/ja-JP.json` entries.
- [x] Generate a strict reconciliation result with `applied` and `already_applied` semantics.
- [x] Make legacy `applySourceDelta` convert its input to a plan and delegate to the new executor.
- [x] Prove existing Japanese deletion and cache tests remain behaviorally identical.
- [x] Test interruption before and after staged mutation without touching the target baseline checkout.

Focused verification:

```bash
node --test scripts/translation/apply-reconciliation-plan.test.js scripts/translation/applySourceDelta.test.js
git diff --check
```

### Task 5: Replace Japanese manifest transport

**Files:**

- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/manifest.test.js`
- Modify: `scripts/translation/batches.js`
- Modify: `scripts/translation/batches.test.js`
- Modify: `scripts/translation/agentRunner.js`
- Modify: relevant agent runner tests

- [x] Replace writer output for `deleted_i18n`/`renamed` with a reconciliation plan artifact reference and digest.
- [x] Retain readers for legacy manifests and convert them in memory.
- [x] Assign operation ownership to exactly one canonical batch.
- [x] Keep reconciliation-only batch creation when candidate count is zero.
- [x] Ensure paid model work is skipped for operation-only batches.
- [x] Preserve candidate reason ordering and backlog behavior.

Focused verification:

```bash
node --test scripts/translation/manifest.test.js scripts/translation/batches.test.js scripts/translation/agentRunner.test.js
git diff --check
```

### Task 6: Update Japanese checkpoint artifacts and publication

**Files:**

- Modify: `scripts/docs-workflow/create-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/create-checkpoint-artifact.test.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.test.js`
- Modify: `scripts/docs-workflow/apply-translation-batch.js`
- Modify: `scripts/docs-workflow/apply-translation-batch.test.js`
- Modify: `.github/workflows/_translate-content-group.yml`

- [x] Package plan, approval, result, and updated cache in checkpoint artifacts.
- [x] Validate exact artifact identities and reject plan/result mismatches.
- [x] Ensure only the publisher writes Git state.
- [x] Preserve target/group-qualified artifact names.
- [x] Add workflow outputs for plan and result digests.
- [x] Verify `publish=false` performs no branch mutation.

Focused verification:

```bash
node --test scripts/docs-workflow/create-checkpoint-artifact.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js \
  scripts/docs-workflow/apply-translation-batch.test.js
pnpm test:workflow-policy
git diff --check
```

## Phase 3: Chinese Reference reviewed deletion

### Task 7: Add the Chinese Reference state adapter

**Files:**

- Modify: `scripts/translation/apply-reconciliation-plan.js`
- Modify: `scripts/translation/apply-reconciliation-plan.test.js`
- Modify: `packages/docs-tooling/src/reference/translationManifest.ts`
- Modify: `packages/docs-tooling/src/reference/translationManifest.test.ts`
- Modify: `packages/docs-tooling/src/validation/translation.ts`
- Modify: related validation tests
- Create: generated ledger schema module and tests in `packages/docs-tooling/src/reference/`

- [x] Remove approved Chinese targets in a staged workspace.
- [x] Rebuild source and translation manifests from the post-operation trees.
- [x] Stop creating target-only `retired` records for new plan-based deletions.
- [x] Record applied operation evidence in `generated/zh-CN/manifests/reference-reconciliation-ledger.json`.
- [x] Keep legacy retired records valid during compatibility reads.
- [x] Normalize stale both-missing legacy retirements without deleting unrelated records.
- [x] Ensure a restored source/target pair can become active again.
- [x] Validate Reference navigation after deletion.

Focused verification:

```bash
pnpm exec vitest run packages/docs-tooling/src/reference/translationManifest.test.ts \
  packages/docs-tooling/src/reference/translationManifest.integration.test.ts
node --test scripts/translation/apply-reconciliation-plan.test.js
pnpm docs-tooling validate-reference --site zh-CN
git diff --check
```

### Task 8: Make Chinese Translation consume approved plans

**Files:**

- Modify: `packages/docs-tooling/src/translation/candidates.ts`
- Modify: `packages/docs-tooling/src/translation/candidates.test.ts`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/manifest.test.js`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `.github/workflows/_prepare-translation-batches.yml`

- [x] Replace direct retirement-registry candidate gating with reconciliation policy evaluation.
- [x] Convert existing exact registry entries into legacy approval receipts.
- [x] Generate a review artifact and stop before paid work when approval is absent.
- [x] Create reconciliation-only Chinese batches with zero translation candidates.
- [x] Apply deletion and manifest updates in the same checkpoint as translated replacements.
- [x] Keep group ownership isolation so one manual cannot fail on another manual's pending review.

Focused verification:

```bash
pnpm exec vitest run packages/docs-tooling/src/translation/candidates.test.ts
node --test scripts/translation/manifest.test.js scripts/translation/batches.test.js
pnpm test:translation
git diff --check
```

## Phase 4: Handoff, Fetch preflight, and recovery

### Task 9: Advance the handoff to schema v3

**Files:**

- Modify: `scripts/docs-workflow/translation-handoff.js`
- Modify: `scripts/docs-workflow/translation-handoff.test.js`
- Modify: `scripts/docs-workflow/monitor-translation-progress.js`
- Modify: related monitor tests
- Modify: `scripts/docs-workflow/translation-publication-selection.js`
- Modify: `.github/workflows/translate-codex.yml`

- [x] Add plan artifact, plan digest, and policy ID to every handoff unit.
- [x] Require an authenticated empty plan for units with no operations.
- [x] Verify plan source identities, target baseline, tooling SHA, target, and group.
- [x] Keep schema-v2 recovery reads behind an explicit compatibility path.
- [x] Reject mixed v2/v3 unit identities in one orchestration.
- [x] Surface plan status in progress state and cards.

Focused verification:

```bash
node --test scripts/docs-workflow/translation-handoff.test.js \
  scripts/docs-workflow/monitor-translation-progress.test.js \
  scripts/docs-workflow/translation-progress-state.test.js \
  scripts/docs-workflow/translation-publication-selection.test.js
pnpm test:workflow-policy
git diff --check
```

### Task 10: Move reconciliation preflight before Fetch publication

**Files:**

- Modify: `.github/workflows/fetch-docs.yml`
- Modify: reusable producer workflows as required
- Modify: `scripts/docs-workflow/fetch-publication-selection.js`
- Modify: `scripts/docs-workflow/fetch-publication-results.js`
- Modify: `scripts/docs-workflow/fetch-reference-reconciliation.js`
- Modify: `scripts/docs-workflow/translation-handoff.js`
- Modify: `scripts/translation/reconciliation-plan.js`
- Create: `scripts/docs-workflow/fetch-reconciliation-plans.js`
- Create: `scripts/docs-workflow/fetch-reconciliation-preflight.js`
- Modify: related tests

- [x] Generate per-source-group reconciliation plans from immutable staged checkpoints.
- [x] Validate plan status before `publish_ready` can write source commits when `run_translations=true`.
- [x] Stop review-required production publication before any writer runs.
- [x] Allow source-only publication when `run_translations=false`, but record pending reconciliation evidence in results.
- [x] Build handoff v3 only after source publication, Reference reconciliation, and target baseline reconciliation succeed.
- [x] Remove the late failure mode where a missing retirement is first discovered after all source commits publish.
- [x] Preserve Fetch FIFO and production queue ownership.

Focused verification:

```bash
node --test scripts/docs-workflow/fetch-reference-reconciliation.test.js \
  scripts/docs-workflow/fetch-publication-results.test.js \
  scripts/docs-workflow/translation-handoff.test.js
pnpm test:workflow-policy
git diff --check
```

### Task 11: Extend recovery compatibility

**Files:**

- Modify: `.github/workflows/recover-translation.yml`
- Modify: recovery planning and artifact modules under `scripts/translation/`
- Create: `scripts/translation/reconciliation-recovery.js`
- Create: `scripts/translation/reconciliation-recovery.test.js`
- Modify: recovery tests

- [ ] Include plan/policy/approval identities in recovery metadata.
- [x] Classify operations as reusable, already applied, changed, rejected, or missing approval.
- [ ] Reuse paid files independently from changed reconciliation operations only after revalidation.
- [ ] Require `publish=false` preflight before plan-based recovery publication.
- [ ] Reject a changed target baseline unless ancestry and post-state checks establish compatibility.
- [ ] Preserve the `allow_full_retranslate` authorization boundary.
- [ ] Stop on `REMOTE_STATE_UNKNOWN` without replay.

Focused verification:

```bash
node --test scripts/translation/recovery-preflight.test.js \
  scripts/translation/recovery-artifact.test.js \
  scripts/translation/replay-recovery-preflight.test.js
pnpm test:workflow-policy
git diff --check
```

## Phase 5: Controlled automation

### Task 12: Add REST completeness receipts

**Files:**

- Modify REST generation metadata modules under `packages/docs-tooling/src/reference/rest/`
- Add receipt schema and tests
- Modify producer checkpoint artifact tooling
- Modify reconciliation policy tests

- [ ] Bind complete OpenAPI input inventory, generator fingerprint, exclusions, and output inventory to a receipt.
- [ ] Require all selected specs and fragments to validate before marking generation complete.
- [ ] Prove a deleted path existed at the baseline and is absent from the complete checkpoint output.
- [ ] Reject partial spec selection, missing fragments, or changed ownership metadata.
- [ ] Add deletion count/percentage/root-disappearance thresholds.
- [ ] Enable automatic `zh-CN-reference/rest` `source_deleted` approval only after receipt validation.

Focused verification:

```bash
pnpm test:translation
pnpm docs-tooling validate-revision-inventory --site en
pnpm build:en
git diff --check
```

### Task 13: Add bot-generated approval PRs

**Files:**

- Add workflow/script for reconciliation review PR creation
- Modify workflow policy tests
- Update `README.md`

- [ ] Generate a deterministic branch and PR body from a review artifact.
- [ ] Add durable policy exceptions only for decisions intended to remain standing.
- [ ] Never write master-authoritative policy directly to `dev`.
- [ ] Deduplicate PRs by plan SHA and policy ID.
- [ ] Link source run, target baseline, candidate paths, evidence, and expected mutation.
- [ ] Trigger normal tooling sync after merge; do not directly promote policy files.
- [ ] Document operator approval and rejection procedures in `README.md`.

Focused verification:

```bash
pnpm test:workflow-policy
node --test scripts/docs-workflow/master-tooling-sync.test.js
git diff --check
```

### Task 14: Evaluate SDK and CLI automatic policies

- [ ] Collect retained artifacts proving complete inventories for Python, Java, Node, Go, and CLI.
- [ ] Replay representative no-change, add, delete, directory move, incomplete-fetch, and mass-deletion cases locally.
- [ ] Enable automatic deletion per manual only after its completeness receipt and threshold tests pass.
- [ ] Keep landing pages and ambiguous replacements review-required.
- [ ] Record the evidence root and approval decision in a follow-up specification or README operator note.

No paid production Translation may be started solely for this evaluation.

## Phase 6: Legacy retirement

### Task 15: Retire legacy transport and registry in a separate approved change

- [ ] Confirm no retained recovery artifact requiring legacy write behavior remains within the supported recovery window.
- [ ] Stop writing `deletedI18n`, `renamed`, `retirementCandidates`, and manifest `source_delta` fields.
- [ ] Remove legacy compatibility adapters only after production replay evidence passes.
- [ ] Migrate active registry exceptions to the shared policy format.
- [ ] Remove stale completed retirement records from `config/reference-retirements.json`.
- [ ] Retire the registry only when no current workflow or validator reads it.
- [ ] Update `README.md` with the final operator procedure.

This task is intentionally deferred and must not be bundled into the initial rollout.

## Verification Matrix

The implementation is not complete until the following scenarios pass for each applicable target:

| Scenario | Japanese Guides | Japanese Reference | Chinese Reference |
| --- | --- | --- | --- |
| no source change | no-op plan | no-op plan | no-op plan |
| source add | translate | translate | translate/pending |
| source modify | translate | translate | translate |
| source delete | automatic removal | automatic removal | reviewed or policy-approved removal |
| historical target orphan | automatic removal | automatic removal | reviewed or policy-approved removal |
| delete plus add replacement | remove old, translate new | remove old, translate new | approved remove old, translate new |
| preserved/landing delete | safe stop | safe stop | safe stop |
| mass deletion | threshold stop | threshold stop | threshold stop |
| incomplete generation | safe stop | safe stop | safe stop |
| zero model candidates plus deletion | reconciliation-only publish | reconciliation-only publish | reconciliation-only publish |
| `publish=false` | artifact only | artifact only | artifact only |
| target advances before publish | rebase/retry contract | rebase/retry contract | rebase/retry contract |
| unknown remote state | safe stop | safe stop | safe stop |
| recovery same plan | reusable | reusable | reusable |
| recovery changed plan | replan/revalidate | replan/revalidate | replan/revalidate |

## Broad Verification Before Handoff

Run the smallest focused tests during each task, then before production handoff run:

```bash
pnpm test:translation
pnpm test:workflow-policy
pnpm test:typescript-runtime-boundary
pnpm typecheck
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
pnpm build:en
pnpm build:zh-CN
git diff --check
```

For publication, handoff, checkpoint, or recovery changes, also complete the zdoc real-artifact replay procedure:

- preflight retained checkpoint archives;
- use an isolated local bare Git remote;
- restore exact generated state and app-local dependencies;
- run inventories and both required builds;
- verify plan/result/approval identities and publication ancestry;
- preserve the evidence root and final SHA;
- never use the real `origin` as the replay remote.

## Delivery Strategy

Recommended pull-request sequence:

1. contracts, discovery, and policy with no production behavior change;
2. Japanese adapter migration and artifact contracts;
3. Chinese reviewed deletion and ledger;
4. handoff v3, Fetch preflight, and recovery;
5. REST completeness receipts and controlled automation;
6. per-manual SDK/CLI policy enablement;
7. legacy retirement after the recovery window.

Each PR must remain independently deployable and must not require a later PR to restore existing production safety.
