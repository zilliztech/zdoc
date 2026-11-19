# Docs Workflow CI Failure Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make guides translation batch publication, final documentation verification, and aggregate card reporting reliable against immutable master and dev inputs.

**Architecture:** Replace the YAML-embedded Node heredoc with a focused, unit-tested validator. Keep master as the tooling checkout, restore generated state from the exact final dev SHA, and explicitly satisfy the aggregate card reporter contract.

**Tech Stack:** GitHub Actions YAML, Bash, Node.js CommonJS, `node:test`, `js-yaml`, Git worktrees.

---

### Task 1: Extract translation batch artifact validation

**Files:**
- Create: `scripts/docs-workflow/validate-translation-batch.js`
- Create: `scripts/docs-workflow/validate-translation-batch.test.js`
- Modify: `.github/workflows/_publish-translation-batches.yml:83-115`
- Modify: `scripts/validate-workflow-policy.test.js:241-256`

- [ ] **Step 1: Write failing validator tests**

Create real translation checkpoint fixtures and test matching metadata, mismatched batch identity, and a missing or symlinked baseline cache. The public behavior is:

```js
await validateTranslationBatch({
  artifactDir: pair.artifact,
  baselineDir: pair.baseline,
  batchNumber: 2,
  batchCount: 6,
})
```

The mismatch assertion must reject with `/batch identity mismatch/i`; unsafe cache assertions must reject with `/translation cache/i`.

- [ ] **Step 2: Run the test to verify RED**

```bash
node --test scripts/docs-workflow/validate-translation-batch.test.js
```

Expected: FAIL because `validate-translation-batch.js` does not exist.

- [ ] **Step 3: Implement the focused validator**

Implement this interface and strict CLI:

```js
async function validateTranslationBatch({ artifactDir, baselineDir, batchNumber, batchCount }) {
  if (!Number.isSafeInteger(batchNumber) || batchNumber < 1) throw new Error('batch number must be a positive integer')
  if (!Number.isSafeInteger(batchCount) || batchCount < batchNumber) throw new Error('batch count must not be smaller than batch number')
  const manifests = await Promise.all([
    validateCheckpointArtifact(artifactDir),
    validateCheckpointArtifact(baselineDir),
  ])
  for (const manifest of manifests) {
    if (manifest.batch?.batchNumber !== batchNumber || manifest.batch?.batchCount !== batchCount) {
      throw new Error('Checkpoint translation batch identity mismatch')
    }
  }
  const cache = path.join(manifests[1].resolvedDir, 'payload/.translation-cache/ja-JP.json')
  const stat = await fs.lstat(cache)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Baseline translation cache must be a regular file')
}
```

Accept exactly `--artifact`, `--baseline`, `--batch-number`, and `--batch-count`; reject missing, duplicate, unknown, non-integer, and invalid-range values. Export `parseArgs` and `validateTranslationBatch`.

- [ ] **Step 4: Replace the inline heredoc**

Replace the embedded Node block with:

```yaml
            node scripts/docs-workflow/validate-translation-batch.js \
              --artifact "$artifact_dir" \
              --baseline "$baseline_dir" \
              --batch-number "$number" \
              --batch-count "$BATCH_COUNT"
```

Extend the policy test to require the external validator, reject `node - <<`, and syntax-check the YAML-loaded publish script using `bash -n` after replacing GitHub expressions with inert values.

- [ ] **Step 5: Run focused tests to verify GREEN**

```bash
node --test scripts/docs-workflow/validate-translation-batch.test.js scripts/validate-workflow-policy.test.js
```

Expected: zero failures.

### Task 2: Separate immutable tooling from final dev content

**Files:**
- Modify: `.github/workflows/_verify-docs.yml:55-118`
- Modify: `scripts/validate-workflow-policy.js:158-170`
- Modify: `scripts/validate-workflow-policy.test.js:69-94`

- [ ] **Step 1: Write failing checkout-model assertions**

Require these patterns in the final verification workflow:

```js
assert.match(workflow, /name: Check out immutable master tooling[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
assert.match(workflow, /git fetch --no-tags origin "\$FINAL_DEV_SHA"/)
assert.match(workflow, /git worktree add --detach "\$RUNNER_TEMP\/final-dev" "\$FINAL_DEV_SHA"/)
assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/)
assert.match(workflow, /git worktree remove --force "\$RUNNER_TEMP\/final-dev"/)
```

Update `validate-workflow-policy.js` with equivalent requirements while retaining `contents: read` and the no-push policy.

- [ ] **Step 2: Run workflow-policy tests to verify RED**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because verification still checks out `final_dev_sha` directly.

- [ ] **Step 3: Implement the immutable checkout model**

Check out `${{ inputs.master_sha }}` as `Check out immutable master tooling`. After dependency installation, run:

```yaml
      - name: Materialize exact final dev state
        run: |
          set -euo pipefail
          git fetch --no-tags origin "$FINAL_DEV_SHA"
          git worktree add --detach "$RUNNER_TEMP/final-dev" "$FINAL_DEV_SHA"
          bash scripts/restore-generated-state.sh --exact --ref "$FINAL_DEV_SHA"
```

Add an always-running cleanup before the terminal failure step:

```yaml
      - name: Clean up final dev worktree
        if: ${{ always() }}
        run: git worktree remove --force "$RUNNER_TEMP/final-dev" 2>/dev/null || true
```

- [ ] **Step 4: Run policy validation to verify GREEN**

```bash
node --test scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: both commands exit 0.

### Task 3: Satisfy aggregate card reporting contract

**Files:**
- Modify: `.github/workflows/_publish-translation-batches.yml:125-143`
- Modify: `scripts/validate-workflow-policy.test.js:241-256`

- [ ] **Step 1: Add failing reporter assertions**

```js
const reportStep = reusable.slice(reusable.indexOf('name: Report guides translation publication'))
assert.match(reportStep, /CARD_JOB_NAME: publish_guides_translation_batches \/ publish/)
assert.match(reportStep, /CARD_JOB_CONCLUSION: \$\{\{ steps\.publish\.outcome == 'success' && 'success' \|\| 'failure' \}\}/)
```

- [ ] **Step 2: Run the test to verify RED**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because both variables are absent.

- [ ] **Step 3: Add the report variables**

```yaml
          CARD_JOB_NAME: publish_guides_translation_batches / publish
          CARD_JOB_CONCLUSION: ${{ steps.publish.outcome == 'success' && 'success' || 'failure' }}
```

- [ ] **Step 4: Run the policy test to verify GREEN**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: zero failures.

### Task 4: Full verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run relevant tests**

```bash
node --test \
  scripts/docs-workflow/validate-translation-batch.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js \
  scripts/docs-workflow/publish-checkpoint.test.js \
  scripts/restore-generated-state.test.js \
  scripts/validate-workflow-policy.test.js
```

- [ ] **Step 2: Run policy, syntax, and whitespace checks**

```bash
node scripts/validate-workflow-policy.js
bash -n scripts/restore-generated-state.sh scripts/docs-workflow/report-live-card.sh scripts/docs-workflow/publish-checkpoint.sh
git diff --check
```

- [ ] **Step 3: Review scope**

```bash
git status --short
git diff -- .github/workflows/_publish-translation-batches.yml .github/workflows/_verify-docs.yml scripts/docs-workflow/validate-translation-batch.js scripts/docs-workflow/validate-translation-batch.test.js scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
```

Confirm only the approved CI fixes and tests changed; leave the user's `.claude` files untouched.
