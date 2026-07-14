# Durable Translation Batches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Guides translations in deterministic, resumable batches of 30 documents so a failed or cancelled workflow loses at most one active batch.

**Architecture:** Add generic content-group batching configuration and deterministic manifest partitioning. A read-only preparation workflow emits a dynamic sequential matrix; each reusable matrix invocation translates one batch and calls the existing write-enabled publisher, producing one validated commit. Guides enables batching at 30 documents while every other manual retains the legacy path.

**Tech Stack:** GitHub Actions reusable workflows and dynamic matrices, Node.js 20, Bash, Docusaurus/MDX validation, Git checkpoint artifacts, `node:test`.

---

### Task 1: Add generic durable batch configuration

**Files:**
- Modify: `scripts/docs-workflow/content-groups.js`
- Modify: `scripts/docs-workflow/content-groups.test.js`

- [ ] **Step 1: Write the failing configuration test**

Assert that Guides uses 30 and all other groups use zero:

```js
assert.equal(getContentGroup('guides').durableTranslationBatchSize, 30)
for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
  assert.equal(getContentGroup(group).durableTranslationBatchSize, 0)
}
```

Also assert the frozen definitions cannot be mutated.

- [ ] **Step 2: Run the test and verify RED**

```bash
node --test scripts/docs-workflow/content-groups.test.js
```

Expected: FAIL because `durableTranslationBatchSize` is undefined.

- [ ] **Step 3: Add the configuration property**

Add `durableTranslationBatchSize: 30` to Guides and `durableTranslationBatchSize: 0` to every other group. Reject non-integer or negative batch sizes in a new `validateContentGroups()` helper called at module load.

- [ ] **Step 4: Run the test and verify GREEN**

```bash
node --test scripts/docs-workflow/content-groups.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-workflow/content-groups.js scripts/docs-workflow/content-groups.test.js
git commit -m "feat(i18n): configure durable translation batches"
```

### Task 2: Build deterministic translation batch manifests

**Files:**
- Create: `scripts/translation/batches.js`
- Create: `scripts/translation/batches.test.js`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/manifest.test.js`

- [ ] **Step 1: Write failing partition tests**

Define and test this API:

```js
const summary = createBatchSummary(manifest, 30)
assert.equal(summary.pendingCount, 65)
assert.equal(summary.batchCount, 3)
assert.deepEqual(summary.matrix.include, [
  { batchIndex: 0, batchNumber: 1 },
  { batchIndex: 1, batchNumber: 2 },
  { batchIndex: 2, batchNumber: 3 },
])

const batch = selectManifestBatch(manifest, {
  batchIndex: 2,
  batchSize: 30,
  expectedPendingSetSha256: summary.pendingSetSha256,
})
assert.equal(batch.items.length, 5)
```

Cover empty manifests, exact multiples, invalid size/index/hash, stable hashing, sorted input identity, and defensive copies.

- [ ] **Step 2: Run tests and verify RED**

```bash
node --test scripts/translation/batches.test.js scripts/translation/manifest.test.js
```

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement batching utilities**

`pendingSetSha256` must hash canonical JSON containing locale, group, source checkpoint SHA, and sorted `{sourcePath,targetPath,sourceHash,type}` items. `selectManifestBatch` must return the original manifest metadata plus:

```js
batch: {
  batchIndex,
  batchNumber: batchIndex + 1,
  batchCount: Math.ceil(manifest.items.length / batchSize),
  batchSize,
  pendingCount: manifest.items.length,
  pendingSetSha256,
}
```

- [ ] **Step 4: Extend the manifest CLI**

Add strict optional flags:

```text
--batch-index <zero-based integer>
--batch-size <positive integer>
--expected-pending-set-sha256 <64 lowercase hex>
```

All three must appear together. Build the full pending manifest before selecting a slice; do not apply `--max-files` before batching.

- [ ] **Step 5: Run tests and verify GREEN**

```bash
node --test scripts/translation/batches.test.js scripts/translation/manifest.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/translation/batches.js scripts/translation/batches.test.js scripts/translation/manifest.js scripts/translation/manifest.test.js
git commit -m "feat(i18n): partition translation manifests deterministically"
```

### Task 3: Record and validate batch identity in checkpoint artifacts

**Files:**
- Modify: `scripts/docs-workflow/create-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/create-checkpoint-artifact.test.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.js`
- Modify: `scripts/docs-workflow/validate-checkpoint-artifact.test.js`

- [ ] **Step 1: Write failing artifact metadata tests**

Create a translation artifact with:

```js
batch: {
  batchIndex: 1,
  batchNumber: 2,
  batchCount: 4,
  batchSize: 30,
  pendingCount: 97,
  pendingSetSha256: 'a'.repeat(64),
}
```

Assert exact preservation. Reject partial metadata, unsafe integers, `batchNumber !== batchIndex + 1`, counts outside bounds, and batch metadata on source artifacts.

- [ ] **Step 2: Run tests and verify RED**

```bash
node --test scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
```

Expected: FAIL because batch metadata is unsupported or rejected as an unexpected key.

- [ ] **Step 3: Add strict API and CLI support**

Add an optional `batch` object to `createCheckpointArtifact(options)` and CLI flags matching Task 2. Include `batch` only for translation-stage artifacts. Extend validation without weakening unexpected-key rejection.

- [ ] **Step 4: Run tests and verify GREEN**

```bash
node --test scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-workflow/create-checkpoint-artifact.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
git commit -m "feat(i18n): identify translation batch checkpoints"
```

### Task 4: Make the translation producer batch-aware

**Files:**
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `scripts/translation/workflowReporting.test.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing workflow tests**

Require optional inputs `batch_index`, `batch_number`, `batch_count`, `batch_size`, `pending_count`, and `pending_set_sha256`. Assert batch artifact names are unique:

```text
translation-checkpoint-guides-<run>-batch-3
translation-baseline-guides-<run>-batch-3
translation-report-guides-<run>-batch-3
```

Assert legacy artifact names remain unchanged when batching is disabled.

- [ ] **Step 2: Run tests and verify RED**

```bash
node --test scripts/translation/workflowReporting.test.js scripts/validate-workflow-policy.test.js
```

Expected: FAIL because batch inputs and unique names do not exist.

- [ ] **Step 3: Add strict batch inputs and manifest selection**

Validate that all batch inputs are either disabled together or form a consistent identity. Pass them to `manifest.js` and both checkpoint artifacts. Add `failed_count` and `remaining_count` outputs from `agentRunner.js` to the reusable workflow.

- [ ] **Step 4: Bound validation to the active batch producer**

Keep per-document validation and group-scoped `mdx-parse`. For batch mode, do not run the duplicate full `pnpm run build` in the read-only producer; the publisher remains responsible for applying the batch to the latest target tip and running the full build before commit. Keep the current producer build for legacy non-batched groups.

- [ ] **Step 5: Run tests and verify GREEN**

```bash
node --test scripts/translation/workflowReporting.test.js scripts/validate-workflow-policy.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/_translate-content-group.yml scripts/translation/workflowReporting.test.js scripts/validate-workflow-policy.test.js
git commit -m "feat(i18n): produce unique translation batch artifacts"
```

### Task 5: Permit safe batch publication commits

**Files:**
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/docs-workflow/publish-checkpoint.test.js`

- [ ] **Step 1: Write failing publisher contract tests**

Add optional numeric inputs `translation_batch_number` and `translation_batch_count`. Require both together, require `1 <= number <= count`, and permit exactly:

```text
i18n(<group>): publish batch <number> of <count>
```

Reject newline injection, mismatched numbers, zero, negative values, and batch messages without batch inputs.

- [ ] **Step 2: Run tests and verify RED**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/publish-checkpoint.test.js
```

Expected: FAIL because the publisher permits only the legacy translation message.

- [ ] **Step 3: Implement the publisher contract**

Generate the expected batch message from validated inputs rather than trusting arbitrary caller text. Validate checkpoint batch metadata against the same number/count before applying the artifact. Retain the existing full-build validation, dependency symlink, non-force push, and bounded retry behavior.

- [ ] **Step 4: Run tests and verify GREEN**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/publish-checkpoint.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/_publish-content-group.yml scripts/validate-workflow-policy.test.js scripts/docs-workflow/publish-checkpoint.test.js
git commit -m "feat(i18n): publish validated translation batch commits"
```

### Task 6: Add reusable preparation and translate-publish batch workflows

**Files:**
- Create: `.github/workflows/_prepare-translation-batches.yml`
- Create: `.github/workflows/_translate-publish-batch.yml`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/sdk-reference-workflow.test.js`

- [ ] **Step 1: Write failing reusable-workflow tests**

Assert preparation has `contents: read`, emits `matrix`, `pending_count`, `batch_count`, `batch_size`, `pending_set_sha256`, and produces an empty `include` array for no changes. Assert the batch workflow contains separate nested translation and publisher jobs and passes unique artifact names and batch identity.

- [ ] **Step 2: Run tests and verify RED**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
```

Expected: FAIL because the reusable workflows do not exist.

- [ ] **Step 3: Implement `_prepare-translation-batches.yml`**

Checkout immutable tooling, fetch the immutable source checkpoint, restore generated state and cache, build the complete manifest, then call `createBatchSummary()`. Write compact JSON to `$GITHUB_OUTPUT`; validate JSON round-trip before emitting it.

- [ ] **Step 4: Implement `_translate-publish-batch.yml`**

Call `_translate-content-group.yml` with batch inputs. If it emits `translation_ready`, call `_publish-content-group.yml` with batch inputs and `pnpm run build`. Give the translator read-only permissions and the publisher write permission through the nested reusable workflow contracts. Expose terminal status and counts.

- [ ] **Step 5: Run tests and verify GREEN**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/_prepare-translation-batches.yml .github/workflows/_translate-publish-batch.yml scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
git commit -m "feat(i18n): orchestrate reusable durable batches"
```

### Task 7: Replace the Guides translation lane with a sequential dynamic matrix

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Create: `scripts/docs-workflow/finalize-translation-batches.js`
- Create: `scripts/docs-workflow/finalize-translation-batches.test.js`
- Modify: `scripts/sdk-reference-workflow.test.js`
- Modify: `scripts/docs-workflow/build-aggregate-input.test.js`

- [ ] **Step 1: Write failing orchestration and finalizer tests**

Require this Guides dependency chain:

```text
publish_guides
  -> prepare_guides_translation_batches
  -> translate_guides_batches
  -> finalize_guides_translation
```

Assert `translate_guides_batches.strategy` uses `fail-fast: false`, `max-parallel: 1`, and `matrix` from preparation output. Assert Python through REST retain legacy jobs.

Test finalizer mappings:

```js
no pending documents -> { translatorStatus: 'no_changes', publisherStatus: 'no_changes' }
all matrix entries succeed -> { translatorStatus: 'translation_ready', publisherStatus: 'published' }
any matrix failure/cancellation -> { translatorStatus: 'failed', publisherStatus: 'failed' }
```

- [ ] **Step 2: Run tests and verify RED**

```bash
node --test scripts/docs-workflow/finalize-translation-batches.test.js scripts/sdk-reference-workflow.test.js scripts/docs-workflow/build-aggregate-input.test.js
```

Expected: FAIL because the batch lane and finalizer do not exist.

- [ ] **Step 3: Implement the finalizer**

Use strict JSON input describing preparation and matrix terminal state. Fetch or accept the latest target SHA only for successful/no-change publication outcomes. Emit existing aggregate-compatible statuses and document/batch counts.

- [ ] **Step 4: Integrate the Guides matrix**

Remove legacy `translate_guides` and `publish_guides_translation` calls. Use the content-group batch size, preparation matrix, and `_translate-publish-batch.yml`. Update `resolve_final` and `aggregate` dependencies and map finalizer outputs into `GUIDES_TRANSLATOR`, `GUIDES_TRANSLATION`, and `GUIDES_TRANSLATION_SHA`.

- [ ] **Step 5: Run tests and verify GREEN**

```bash
node --test scripts/docs-workflow/finalize-translation-batches.test.js scripts/sdk-reference-workflow.test.js scripts/docs-workflow/build-aggregate-input.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/fetch-docs.yml scripts/docs-workflow/finalize-translation-batches.js scripts/docs-workflow/finalize-translation-batches.test.js scripts/sdk-reference-workflow.test.js scripts/docs-workflow/build-aggregate-input.test.js
git commit -m "feat(i18n): publish Guides translations in durable batches"
```

### Task 8: Aggregate batch progress in the Feishu card

**Files:**
- Modify: `scripts/docs-workflow/build-live-card-state.js`
- Modify: `scripts/docs-workflow/build-live-card-state.test.js`
- Modify: `scripts/docs-workflow/report-live-card.sh`
- Modify: `scripts/translation/workflowReporting.test.js`

- [ ] **Step 1: Write failing card-state tests**

Use representative names such as:

```text
guides_translation_batch_2_of_4 / translate guides batch 2 of 4
guides_translation_batch_2_of_4 / publish guides batch 2 of 4 (28 docs)
```

Assert batch jobs derive Guides Translate/Translation pending, running, done, and failed states. Sum successful publisher document counts and render `58 documents published · 62 remaining` from known pending count. Cover no-change and partial failure.

- [ ] **Step 2: Run tests and verify RED**

```bash
node --test scripts/docs-workflow/build-live-card-state.test.js scripts/translation/workflowReporting.test.js
```

Expected: FAIL because batch jobs are not recognized.

- [ ] **Step 3: Implement batch job parsing and state derivation**

Parse full job names without weakening existing `normalizeJobName()` behavior. Prefer batch-derived status when matching batch jobs exist; otherwise use legacy logical jobs. Add batch summary Markdown to `noteMarkdown` while keeping the five top-level stages.

- [ ] **Step 4: Pass pending and batch metadata to reporters**

Ensure preparation and each batch reporter provide the immutable pending count, batch count, and batch size. Do not persist progress only in temporary notes; reconstruct it from GitHub job state and encoded terminal job names.

- [ ] **Step 5: Run tests and verify GREEN**

```bash
node --test scripts/docs-workflow/build-live-card-state.test.js scripts/translation/workflowReporting.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/docs-workflow/build-live-card-state.js scripts/docs-workflow/build-live-card-state.test.js scripts/docs-workflow/report-live-card.sh scripts/translation/workflowReporting.test.js
git commit -m "feat(workflow): report durable Guides batch progress"
```

### Task 9: Prove durability, cancellation recovery, and legacy compatibility

**Files:**
- Create: `scripts/docs-workflow/translation-batch-recovery.test.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `.claude/superpowers/specs/2026-07-13-durable-translation-batches-design.md` only if verified implementation details require clarification

- [ ] **Step 1: Write the end-to-end local recovery fixture**

Create a bare remote, a target branch with 65 pending Guides documents, and three deterministic batch artifacts. Publish batches 1 and 2, simulate cancellation before batch 3, rebuild the manifest from the remote tip, and assert only batch 3’s documents remain pending. Add a failing second-batch fixture and prove batch 1 remains committed.

- [ ] **Step 2: Run the recovery test**

```bash
node --test scripts/docs-workflow/translation-batch-recovery.test.js
```

Expected: PASS after Tasks 1–8; failures indicate the durability contract is incomplete.

- [ ] **Step 3: Run all workflow and translation tests**

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/*.test.js scripts/run-doc-build-stage.test.js
node --test scripts/translation/*.test.js
bash -n scripts/docs-workflow/*.sh
git diff --check
```

Expected: all tests pass and shell syntax is valid.

- [ ] **Step 4: Run the complete local documentation build**

```bash
pnpm run build
```

Expected: English and Japanese builds succeed; existing broken-link warnings may remain.

- [ ] **Step 5: Commit final recovery coverage**

```bash
git add scripts/docs-workflow/translation-batch-recovery.test.js scripts/validate-workflow-policy.test.js .claude/superpowers/specs/2026-07-13-durable-translation-batches-design.md
git commit -m "test(i18n): prove durable batch recovery"
```

### Task 10: Verify on the disposable publication branch

**Files:**
- No additional production files unless the run reveals a root-cause defect covered by a new failing test.

- [ ] **Step 1: Push the implementation branch**

```bash
git push origin codex/checkpointed-docs-workflow
```

- [ ] **Step 2: Preserve the current disposable target tip**

Create a dated preservation branch pointing at the current `codex/checkpointed-docs-publish-test-20260713` tip before any reset or mutation.

- [ ] **Step 3: Dispatch a Guides-only publish-enabled run**

Use `group=guides`, `publish=true`, the disposable target branch, and the Codex tooling ref. Verify at least two separate `i18n(guides): publish batch N of M` commits.

- [ ] **Step 4: Force-cancel during a later batch and resume**

Verify prior batch commits remain and the resumed manifest excludes their documents.

- [ ] **Step 5: Run the full all-groups workflow**

Do not promote while any requested source, translation batch, publisher, or final verification fails. Confirm the Feishu card, GitHub conclusion, final aggregate report, and target branch agree.

- [ ] **Step 6: Merge only after green**

After a complete green run, merge the verified Codex branch to `master` and synchronize `dev` through the repository’s established generated-state process.
