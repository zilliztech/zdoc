# Guides Translation Staging and Promotion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compose Guides translation batches without reverting prior work, validate the exact combined candidate once, promote it safely, preserve failed staging, and report publication truthfully.

**Architecture:** Numbered batch artifacts use schema 2 with a checksummed candidate/source-delta contract. A pure batch-set validator derives translation-only deltas and rejects conflicts; one transactional staging worktree accumulates one commit per nonempty batch. The exact staged SHA is validated with pinned master tooling, promoted by a normal fast-forward push only if the target remains unchanged, and described by a strict terminal publication report consumed by the finalizer and card.

**Tech Stack:** Node.js CommonJS, Node test runner, Git, Bash, GitHub Actions reusable workflows, existing translation/checkpoint/card infrastructure.

**Prerequisite:** Approved design at `.claude/specs/2026-07-17-guides-pipeline-reuse-staging-and-reporting-design.md`. Complete the descriptor ownership task from the sidebar plan before creating new translation artifacts.

---

## File structure

- Create `scripts/docs-workflow/translation-batch-input.js` and `.test.js`: canonical schema-2 batch input and ownership checks.
- Modify `scripts/docs-workflow/create-checkpoint-artifact.js` / `.test.js`: emit schema 2 for numbered baseline/result artifacts.
- Modify `scripts/docs-workflow/validate-checkpoint-artifact.js` / `.test.js`: strict schema migration rules.
- Modify `scripts/docs-workflow/validate-translation-batch.js` / `.test.js`: pair identity and batch-input equality.
- Modify `.github/workflows/_translate-content-group.yml`: create batch input and stop false build attestation.
- Create `scripts/docs-workflow/translation-batch-set.js` and `.test.js`: complete-set validation, source/target drift gates, normalized baselines, deltas, and conflict ledger.
- Create `scripts/docs-workflow/apply-translation-batch.js` and `.test.js`: transactional worktree mutation and semantic cache merge.
- Create `scripts/docs-workflow/translation-staging.js` and `.test.js`: deterministic ref, commit, push, promotion, and conditional cleanup primitives.
- Create `scripts/docs-workflow/validate-guides-translation-staging.js` and `.test.js`: hard-coded one-time command receipt.
- Create `scripts/docs-workflow/translation-publication-report.js` and `.test.js`: strict terminal evidence.
- Rewrite `.github/workflows/_publish-translation-batches.yml`: one worktree, staging, final gate, promotion, report.
- Modify `scripts/docs-workflow/finalize-translation-batches.js` / `.test.js`: consume verified publisher outputs without refetch.
- Modify `.github/workflows/fetch-docs.yml`: exact output/report wiring and aggregate ingestion.
- Modify `scripts/docs-workflow/docs-progress-state.js` / `.test.js`: staged/validated/promoting live tasks.
- Modify `scripts/collect-build-card-notes.js` / `.test.js`: terminal publication/recovery notes.
- Modify `scripts/docs-workflow/recover-translation-batches.sh` and tests: remove unsafe sequential full-tree publication.
- Modify `scripts/validate-workflow-policy.js` / `.test.js`: lock in the complete safety model.

### Task 1: Define canonical schema-2 batch input

**Files:**
- Create: `scripts/docs-workflow/translation-batch-input.js`
- Create: `scripts/docs-workflow/translation-batch-input.test.js`

- [ ] **Step 1: Write failing canonicalization and authorization tests**

Build a selected Guides manifest with candidates, deletion, and rename. Assert exact canonical output:

```js
assert.deepEqual(createBatchInput(manifest), {
  schemaVersion: 1,
  group: 'guides',
  sourceCheckpointSha: 'a'.repeat(40),
  batch: manifest.batch,
  candidates: [{
    sourcePath: 'docs/tutorials/a.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md',
    sourceHash: 'b'.repeat(64),
  }],
  sourceDelta: {
    deletedI18n: ['i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/old.md'],
    renamed: [{ oldPath, newPath, oldI18nPath, newI18nPath }],
  },
})
```

Add tests for arbitrary input order, duplicate paths, non-tutorial target paths, other groups, malformed hashes, unauthorized cache keys, and changed cache keys outside candidate/source-delta ownership.

- [ ] **Step 2: Run the new tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/translation-batch-input.test.js
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement strict functions and CLI**

Export:

```js
module.exports = {
  assertAuthorizedCacheChanges,
  createBatchInput,
  validateBatchInput,
  writeBatchInput,
}
```

Use only these mutable roots:

```js
const GUIDES_TARGET_ROOTS = Object.freeze([
  'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials',
])
```

Cache keys are source paths. Permit candidate `sourcePath` keys and old/new source keys derived from the validated source delta. Require every other cache entry to remain semantically equal to baseline.

CLI:

```text
create --manifest <tmp/translation-manifest.json> --output <tmp/translation-batch-input.json>
validate --input <file>
```

- [ ] **Step 4: Run tests and commit**

Run:

```bash
node --test scripts/docs-workflow/translation-batch-input.test.js
node --check scripts/docs-workflow/translation-batch-input.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/translation-batch-input.js scripts/docs-workflow/translation-batch-input.test.js
git commit -m "feat(ci): define translation batch inputs"
```

### Task 2: Upgrade numbered checkpoint artifacts to schema 2

**Files:**
- Modify: `scripts/docs-workflow/create-checkpoint-artifact.js`
- Test: `scripts/docs-workflow/create-checkpoint-artifact.test.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.js`
- Test: `scripts/docs-workflow/validate-checkpoint-artifact.test.js`
- Modify: `scripts/docs-workflow/validate-translation-batch.js`
- Test: `scripts/docs-workflow/validate-translation-batch.test.js`
- Modify: `.github/workflows/_translate-content-group.yml`

- [ ] **Step 1: Add failing schema migration tests**

Require schema-2 numbered artifacts to contain:

```js
{
  schemaVersion: 2,
  stage: 'translation',
  // existing identity/files/deletions/batch fields
  batchInput: {
    path: 'batch-input.json',
    size: 123,
    sha256: 'a'.repeat(64),
  },
}
```

Assert schema 2 rejects `validation`, schema-1 numbered batches are rejected after migration, schema-2 source/unbatched artifacts are rejected, tampered batch input fails, and baseline/result inputs must be byte-identical.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/docs-workflow/validate-translation-batch.test.js
```

Expected: FAIL against schema 1.

- [ ] **Step 3: Implement schema-2 creation and validation**

Add `batchInputPath` to `createCheckpointArtifact()` options and `--batch-input` to its CLI. For numbered batches, copy validated input to top-level `batch-input.json`, emit schema 2 and its checksum, and omit `validation`. Keep schema 1 unchanged for source/unbatched artifacts.

`validateCheckpointArtifact()` must branch explicitly by schema and return parsed `batchInput` only after checksum and semantic validation. `validateTranslationBatch()` compares the pair's bytes, source checkpoint, batch identity, pending set, and baseline cache presence.

- [ ] **Step 4: Generate batch input in translation jobs**

In `_translate-content-group.yml`, after the selected manifest is written:

```bash
node scripts/docs-workflow/translation-batch-input.js create \
  --manifest tmp/translation-manifest.json \
  --output tmp/translation-batch-input.json
```

Pass this file to both baseline and result checkpoint creators. Remove `--validation-command "pnpm run build"` for numbered batches. Unbatched translation behavior remains unchanged.

- [ ] **Step 5: Run and commit**

Run:

```bash
node --test scripts/docs-workflow/translation-batch-input.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/docs-workflow/validate-translation-batch.test.js
node -e "const fs=require('node:fs'),yaml=require('js-yaml'); yaml.load(fs.readFileSync('.github/workflows/_translate-content-group.yml','utf8'))"
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/create-checkpoint-artifact.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/docs-workflow/validate-translation-batch.js scripts/docs-workflow/validate-translation-batch.test.js .github/workflows/_translate-content-group.yml
git commit -m "feat(ci): add schema 2 translation batch inputs"
```

### Task 3: Validate the complete batch set and derive safe deltas

**Files:**
- Create: `scripts/docs-workflow/translation-batch-set.js`
- Create: `scripts/docs-workflow/translation-batch-set.test.js`

- [ ] **Step 1: Write failing complete-set tests**

Cover missing, duplicate, and out-of-range batches; arbitrary download order; identity mismatch; baseline mismatch across batches; baseline mismatch with source Git tree; English payload difference; source-authority drift on the target; later-batch reversion; identical overlap; different write, write/delete, file/directory, and ancestor/descendant conflicts.

The expected planner shape is:

```js
const plan = await planTranslationBatchSet({
  pairs,
  sourceRepository,
  sourceCheckpointSha,
  targetRepository,
  expectedTargetSha,
})
assert.deepEqual(plan.batches.map(batch => batch.batchNumber), [1, 2])
assert.deepEqual(plan.batches[0].writes.map(item => item.path), [targetA])
assert.deepEqual(plan.batches[1].writes.map(item => item.path), [targetB])
assert.equal(plan.baselinePayloadSha256.length, 64)
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/translation-batch-set.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement pure validation and conflict planning**

Export:

```js
module.exports = {
  assertGuidesSourceAuthority,
  normalizedBaselineIdentity,
  planTranslationBatchSet,
}
```

For each pair, compare only the two tutorial roots and normalized translation cache. Require all full English owned payload files to equal the paired baseline, but never include them in writes/deletions. Compare every normalized baseline with the source checkpoint Git tree. Compare target source-authority paths with the source checkpoint before planning.

Normalize an absent source-checkpoint `.translation-cache/ja-JP.json` to the exact bytes `{"files":{}}\n` before hashing. The target source-authority comparison uses exactly:

```text
docs
docs-byoc
config/generated/guides.sidebar.js
config/generated/guides-byoc.sidebar.js
plugins/lark-docs/meta/snapshots/guides-uat-last-success.json
plugins/lark-docs/meta/assembly/guides.json
```

Build a ledger keyed by path. Identical bytes/deletions are idempotent; all differing overlaps and ancestor conflicts throw before any worktree mutation.

- [ ] **Step 4: Add CLI JSON planning output**

Support a fixed `plan` operation that reads a pairs manifest, verifies expected SHAs, and writes a checksummed plan JSON under `$RUNNER_TEMP`. Do not accept arbitrary mutation roots.

- [ ] **Step 5: Run and commit**

Run:

```bash
node --test scripts/docs-workflow/translation-batch-set.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
node --check scripts/docs-workflow/translation-batch-set.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/translation-batch-set.js scripts/docs-workflow/translation-batch-set.test.js
git commit -m "feat(ci): validate and compose translation batch deltas"
```

### Task 4: Apply one planned batch transactionally

**Files:**
- Create: `scripts/docs-workflow/apply-translation-batch.js`
- Create: `scripts/docs-workflow/apply-translation-batch.test.js`
- Modify: `scripts/docs-workflow/apply-checkpoint-artifact.js` and test only if extracting the semantic cache merge helper.

- [ ] **Step 1: Write failing transactional/fault tests**

Test successful write/delete/cache merge, batch 2 preserving batch 1, idempotent changes, and failure hooks after deletion, midway through copies, during cache write, and before completion. After every injected failure assert worktree bytes and `git status --porcelain` equal the pre-batch state.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/apply-translation-batch.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement journaled application**

Export:

```js
async function applyTranslationBatch({ plan, batchNumber, artifactDir, baselineDir, targetDir, hooks = {} })
```

Validate the plan/pair again, capture target identity guards, journal every mutation path, apply deepest deletions first, atomically write regular files, and semantically merge only authorized cache keys. On any error restore the journal and remove directories created by the attempt. Return `{ changedPaths, deletedPaths, cacheChanged, idempotent }`.

- [ ] **Step 4: Run generic and focused tests**

Run:

```bash
node --test scripts/docs-workflow/apply-translation-batch.test.js scripts/docs-workflow/apply-checkpoint-artifact.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-workflow/apply-translation-batch.js scripts/docs-workflow/apply-translation-batch.test.js scripts/docs-workflow/apply-checkpoint-artifact.js scripts/docs-workflow/apply-checkpoint-artifact.test.js
git commit -m "feat(ci): apply translation batch deltas transactionally"
```

### Task 5: Add staging Git lifecycle primitives

**Files:**
- Create: `scripts/docs-workflow/translation-staging.js`
- Create: `scripts/docs-workflow/translation-staging.test.js`

- [ ] **Step 1: Write bare-repository failure tests**

Use local bare remotes to prove deterministic ref naming, one detached worktree, unrelated SDK commit retention, one commit per nonempty batch, fully idempotent no-ref behavior, combined staged history, target-movement rejection, exact staged-SHA promotion, conditional cleanup race, and cleanup failure remaining nonfatal.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/translation-staging.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement fixed Git operations**

Export operations with `execFileSync('git', args)` only—never shell interpolation:

```js
deterministicStagingRef({ runId, runAttempt, pendingSetSha256 })
prepareStagingWorktree({ repository, expectedTargetSha, worktree })
commitAppliedBatch({ worktree, batchNumber, batchCount })
pushStagingRef({ repository, worktree, stagingRef, stagedSha })
promoteStaging({ repository, targetBranch, expectedTargetSha, stagedSha })
deleteStagingWithLease({ repository, stagingRef, stagedSha })
```

Promotion fetches target, requires exact equality and ancestry, performs a normal non-force push of `stagedSha:refs/heads/<target>`, then verifies the remote SHA. Cleanup alone uses expected-SHA `--force-with-lease` and is returned as debt on failure.

- [ ] **Step 4: Run and commit**

Run:

```bash
node --test scripts/docs-workflow/translation-staging.test.js
node --check scripts/docs-workflow/translation-staging.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/translation-staging.js scripts/docs-workflow/translation-staging.test.js
git commit -m "feat(ci): add Guides translation staging lifecycle"
```

### Task 6: Add strict publication report and actual validation receipt

**Files:**
- Create: `scripts/docs-workflow/translation-publication-report.js`
- Create: `scripts/docs-workflow/translation-publication-report.test.js`
- Create: `scripts/docs-workflow/validate-guides-translation-staging.js`
- Create: `scripts/docs-workflow/validate-guides-translation-staging.test.js`

- [ ] **Step 1: Write failing exact-schema report tests**

Use all spec fields with unavailable values represented as `null`. Test every status invariant. Example published invariant:

```js
assert.doesNotThrow(() => validatePublicationReport({
  schemaVersion: 1,
  runId: 42,
  runAttempt: 2,
  group: 'guides',
  masterSha,
  sourceCheckpointSha,
  expectedTargetSha,
  stagingRef,
  stagingSha,
  status: 'published',
  validation: receipts,
  resultSha: stagingSha,
  cleanup: { status: 'deleted', detail: null },
  failure: { gate: null, detail: null, recovery: null },
}))
```

Reject extra keys, bad SHAs/refs, unbounded details, inconsistent status/result, and commands outside the hard-coded allowlist.

- [ ] **Step 2: Write failing validation-runner tests**

Inject an executor and assert exact order, stop-on-first-failure, receipt for the failed command, and no claim for commands not executed.

- [ ] **Step 3: Implement the report module**

Export `createPublicationReport`, `validatePublicationReport`, `readPublicationReport`, `writePublicationReport`, and `publicationReportMarkdown`. Use atomic writes and fixed status enums.

- [ ] **Step 4: Implement the hard-coded validation runner**

The only allowed commands are:

```js
const COMMANDS = Object.freeze([
  ['english-saas-mdx', ['npx', 'docusaurus', 'mdx-parse', '-d', 'docs']],
  ['english-byoc-mdx', ['npx', 'docusaurus', 'mdx-parse', '-d', 'docs-byoc']],
  ['ja-saas-mdx', ['npx', 'docusaurus', 'mdx-parse', '-d', 'i18n/ja-JP/docusaurus-plugin-content-docs/current']],
  ['ja-byoc-mdx', ['npx', 'docusaurus', 'mdx-parse', '-d', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current']],
  ['sidebars', ['node', 'scripts/validate-generated-sidebars.js']],
  ['coverage', ['node', 'scripts/validate-translated-coverage.js', '--group', 'guides']],
  ['build', ['node', 'scripts/run-doc-build-stage.js', '--build', 'pnpm run build', '--skipCardReporting']],
])
```

Require `masterSha`, `stagedSha`, and proof that exact staged generated state was restored before execution. Emit receipts with `id`, rendered command, and `success|failure`.

- [ ] **Step 5: Run and commit**

Run:

```bash
node --test scripts/docs-workflow/translation-publication-report.test.js scripts/docs-workflow/validate-guides-translation-staging.test.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/translation-publication-report.js scripts/docs-workflow/translation-publication-report.test.js scripts/docs-workflow/validate-guides-translation-staging.js scripts/docs-workflow/validate-guides-translation-staging.test.js
git commit -m "feat(ci): attest staged Guides translation validation"
```

### Task 7: Remove repeated numbered-batch full-tree validation

**Files:**
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Test: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing policy tests**

For `batch_number > 0`, forbid full-tree `mdx-parse`, `validate-translated-coverage`, and `pnpm run build`. Require provider/reviewer result checks, per-document validation performed by the agent pipeline, schema-2 artifact creation, and artifact integrity validation. Unbatched SDK translation keeps current full validation.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because numbered batches currently parse full translated directories and run coverage.

- [ ] **Step 3: Split numbered and unbatched validation paths**

Make the current full validation step conditional on `batch_number == 0`. For numbered batches, add a clearly named `Validate translated batch outputs` step that validates the translation report, listed candidate output files, batch input, and resulting checkpoint only.

- [ ] **Step 4: Run translation/policy tests and commit**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js scripts/translation/agentRunner.test.js scripts/docs-workflow/validate-translation-batch.test.js
npm run test:translation
```

Expected: PASS.

Commit:

```bash
git add .github/workflows/_translate-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "fix(ci): validate numbered translation batches locally"
```

### Task 8: Replace batch publication with one staging publisher

**Files:**
- Rewrite: `.github/workflows/_publish-translation-batches.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Test: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing workflow structure tests**

Require these exact steps:

```text
Validate Guides translation batch identities
Apply Guides translation batches to staging
Push Guides translation staging ref
Validate combined Guides translation
Promote validated Guides translation
Clean up Guides translation staging ref
Write Guides translation publication report
Upload Guides translation publication report
Emit Guides translation publication result
```

Forbid `publish-checkpoint.sh`, per-batch target pushes, log-parsed state, force update of the target, and Feishu credentials.

Also require the existing later `_verify-docs.yml` workflow-wide verification job to remain wired after all publishers; the one-time staging gate replaces only repeated Guides batch-publication validation.

- [ ] **Step 2: Run policy tests and confirm failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL against the current loop that publishes each complete tree directly to the target.

- [ ] **Step 3: Implement one-worktree composition**

Keep the primary checkout pinned to `master_sha`. Safely extract every numbered pair, call the batch-set planner, create one detached staging worktree at the captured target SHA, apply batches in numeric order, and commit each nonempty result. Store all state in strict JSON under `$RUNNER_TEMP`; do not scrape logs.

If all batches are idempotent, skip staging push/validation/promotion and emit `status=no_changes`, `commit_sha=<expectedTargetSha>`.

- [ ] **Step 4: Push, validate, promote, and clean up**

Construct the deterministic staging ref, push the exact combined SHA, restore exact staged generated state into the pinned-master primary checkout, run the validation wrapper once, promote with the Git helper, and conditionally delete staging. Cleanup and report steps use `if: always()`; cleanup debt cannot change a successful publication.

- [ ] **Step 5: Upload terminal evidence and outputs**

Artifact name:

```text
docs-translation-publication-guides-${{ github.run_id }}-${{ github.run_attempt }}
```

Outputs are `status`, exact `commit_sha`, `staging_ref`, `staging_sha`, and report artifact name. A hard cancellation may prevent upload; deterministic ref naming remains recovery fallback.

- [ ] **Step 6: Validate and commit**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/translation-batch-set.test.js scripts/docs-workflow/apply-translation-batch.test.js scripts/docs-workflow/translation-staging.test.js scripts/docs-workflow/translation-publication-report.test.js
node scripts/validate-workflow-policy.js
node -e "const fs=require('node:fs'),yaml=require('js-yaml'); yaml.load(fs.readFileSync('.github/workflows/_publish-translation-batches.yml','utf8'))"
```

Expected: PASS.

Commit:

```bash
git add .github/workflows/_publish-translation-batches.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat(ci): publish Guides translations through staging"
```

### Task 9: Make the publisher output authoritative end to end

**Files:**
- Modify: `scripts/docs-workflow/finalize-translation-batches.js`
- Test: `scripts/docs-workflow/finalize-translation-batches.test.js`
- Modify: `.github/workflows/fetch-docs.yml`
- Test: `scripts/docs-workflow/build-aggregate-input.test.js`
- Test: `scripts/docs-workflow/aggregate-results.test.js`

- [ ] **Step 1: Add failing finalizer tests**

Add cases for published, nonzero idempotent no-change, zero-batch no-change, failure, cancellation, and skipped. Prove a later branch tip cannot replace the publisher SHA:

```js
assert.deepEqual(finalizeTranslationBatches({
  publish: true,
  preparationResult: 'success',
  batchCount: 3,
  batchResult: 'success',
  publisherStatus: 'published',
  publisherCommitSha: stagedSha,
}), {
  translatorStatus: 'translation_ready',
  publisherStatus: 'published',
  commitSha: stagedSha,
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/finalize-translation-batches.test.js
```

Expected: FAIL because the finalizer still refetches the target.

- [ ] **Step 3: Remove branch-tip inference and wire outputs**

Delete `resolveTargetCommit()`. Read `PUBLISHER_STATUS` and `PUBLISHER_COMMIT_SHA`; validate status-dependent SHA invariants. In `fetch-docs.yml`, pass reusable publisher outputs into `finalize_guides_translation`, aggregate, and final report. Never refetch to infer the Guides translation SHA.

- [ ] **Step 4: Run and commit**

Run:

```bash
node --test scripts/docs-workflow/finalize-translation-batches.test.js scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/finalize-translation-batches.js scripts/docs-workflow/finalize-translation-batches.test.js .github/workflows/fetch-docs.yml scripts/docs-workflow/build-aggregate-input.test.js scripts/docs-workflow/aggregate-results.test.js
git commit -m "fix(ci): preserve verified Guides translation SHA"
```

### Task 10: Integrate live and terminal Feishu state

**Files:**
- Modify: `scripts/docs-workflow/docs-progress-state.js`
- Test: `scripts/docs-workflow/docs-progress-state.test.js`
- Modify: `scripts/collect-build-card-notes.js`
- Test: `scripts/collect-build-card-notes.test.js`
- Modify: `.github/workflows/fetch-docs.yml`
- Test: `scripts/docs-workflow/monitor-docs-progress.test.js`

- [ ] **Step 1: Replace old partial-published-count tests**

Add Jobs API fixtures for each exact publisher step. Assert apply/staging/validation/promotion remain running, failed staging remains failed, and no intermediate state renders `Published`. Add zero-batch and nonzero-idempotent `No translation changes` cases.

- [ ] **Step 2: Add failing publication-report note tests**

Cover published, no-change, retained staging with failed gate, target movement, cleanup debt, stale/wrong-run report, missing report, and hard cancellation fallback. Only verified `status=published` may render `Published`.

- [ ] **Step 3: Implement live task mapping**

Map the six exact workflow steps in `TASK_NAMES`. Remove old Guides per-batch “documents published” presentation because batches are staged, not published. Keep aggregate success as overall terminal authority.

- [ ] **Step 4: Download and collect terminal evidence**

In aggregate, download the run-attempt-scoped publication artifact with `continue-on-error` before collecting card notes. Validate it with expected run ID/attempt and add bounded Markdown. Invalid/missing evidence never changes aggregate status or invents a staging ref/SHA.

- [ ] **Step 5: Run and commit**

Run:

```bash
node --test scripts/docs-workflow/docs-progress-state.test.js scripts/docs-workflow/build-live-card-state.test.js scripts/docs-workflow/monitor-docs-progress.test.js scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-card-report.test.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/docs-progress-state.js scripts/docs-workflow/docs-progress-state.test.js scripts/collect-build-card-notes.js scripts/collect-build-card-notes.test.js .github/workflows/fetch-docs.yml scripts/docs-workflow/monitor-docs-progress.test.js
git commit -m "feat(ci): report staged Guides publication truthfully"
```

### Task 11: Replace the unsafe recovery path and lock policy

**Files:**
- Rewrite: `scripts/docs-workflow/recover-translation-batches.sh`
- Modify: `scripts/docs-workflow/recover-translation-batches.test.js`
- Rewrite: `scripts/docs-workflow/translation-batch-recovery.test.js`
- Modify: `scripts/validate-workflow-policy.js`
- Test: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing recovery safety tests**

Require the helper to accept retained staging identity, expected target SHA, and tooling SHA; locate deterministic refs; verify lineage and source authority; rerun the same hard-coded gate; and use the same fast-forward promotion helper. Forbid sequential full-tree artifact replay, `publish-checkpoint.sh`, direct old-ref promotion, and target force pushes.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/recover-translation-batches.test.js scripts/docs-workflow/translation-batch-recovery.test.js scripts/validate-workflow-policy.test.js
```

Expected: FAIL against the old sequential recovery script and durability test.

- [ ] **Step 3: Implement retained-staging recovery**

The script validates strict arguments, fetches the named/ref-prefix candidate, verifies the recorded SHA, requires current target/source authority, recreates through the delta-safe path when target lineage changed, reruns the validation wrapper, then uses normal fast-forward promotion. It never promotes an unvalidated old staging ref.

- [ ] **Step 4: Add full policy invariants**

Require schema-2 numbered artifacts, tutorial-only roots, one staging worktree, one final Guides composition gate, no per-batch target publisher, normal target push, expected-SHA staging cleanup, always-run report steps, centralized Feishu ownership, and a staging namespace excluded from deployment triggers.

- [ ] **Step 5: Run and commit**

Run:

```bash
bash -n scripts/docs-workflow/recover-translation-batches.sh
node --test scripts/docs-workflow/recover-translation-batches.test.js scripts/docs-workflow/translation-batch-recovery.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/recover-translation-batches.sh scripts/docs-workflow/recover-translation-batches.test.js scripts/docs-workflow/translation-batch-recovery.test.js scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "fix(ci): make Guides translation recovery delta-safe"
```

### Task 12: Full verification and disposable-branch drill

**Files:**
- Modify only for test-backed defects.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
node --test scripts/docs-workflow/*.test.js plugins/report-to-lark/*.test.js
npm run test:translation
npm run test:workflow-policy
npm run typecheck
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 2: Run local bare-repository failure drills**

Verify final validation failure, target advance, cancellation-after-staging simulation, cleanup lease race, and nonzero idempotent no-change. In every failure before promotion, the target SHA remains unchanged.

- [ ] **Step 3: Run a disposable GitHub branch drill**

Exercise:

1. two batches changing distinct files;
2. an injected overlap conflict;
3. final validation failure retaining staging;
4. target movement between validation and promotion;
5. successful exact promotion and cleanup;
6. Feishu/card-report inspection for staged, failed, no-change, and published wording.

- [ ] **Step 4: Have Hooke approve the evidence before enabling `dev`**

Do not enable production target promotion until Hooke confirms the staged SHA, validation receipt, promoted SHA, target lineage, cleanup result, aggregate input, and Feishu terminal wording all agree.
