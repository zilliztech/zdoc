# Parallel Translation Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Process the initial Japanese translation backlog with four concurrent file workers and checkpoint completed work so GitHub's six-hour limit cannot discard an entire run.

**Architecture:** Keep a single GitHub Actions job and introduce a concurrency-limited worker pool inside `agentRunner.js`. Workers own individual documents; a coordinator owns shared cache/report state, periodic checkpoints, deadline handling, and final status. The existing hash-based manifest remains the source of incremental behavior.

**Tech Stack:** Node.js, Node built-in test runner, GitHub Actions, Docusaurus, Feishu progress cards, JSON translation cache.

---

### Task 1: Add worker-pool behavior tests

**Files:**
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `scripts/translation/agentRunner.js`

- [ ] **Step 1: Write a failing concurrency-limit test**

Create eight synthetic manifest items and a processor that tracks active calls. Run with concurrency `4` and assert the maximum active count is exactly four.

- [ ] **Step 2: Write a failing exactly-once test**

Record processed item IDs and assert every manifest item appears once with no duplicates.

- [ ] **Step 3: Write a failing partial-failure test**

Make one processor invocation throw while the others succeed. Assert the worker pool returns one failed result and all other items complete.

- [ ] **Step 4: Run RED verification**

```bash
node --test scripts/translation/agentRunner.test.js
```

Expected: new worker-pool tests fail because no concurrency API exists.

### Task 2: Implement the concurrency-limited file worker pool

**Files:**
- Modify: `scripts/translation/agentRunner.js`
- Test: `scripts/translation/agentRunner.test.js`

- [ ] **Step 1: Add `runWorkerPool(items, options)`**

Accept `concurrency`, `processItem`, `onResult`, and `shouldStopAssigning`. Use a shared index and at most `concurrency` asynchronous workers.

- [ ] **Step 2: Preserve per-document sequencing**

Keep `processManifestItem()` unchanged internally so translation, review, correction, validation, and target write remain sequential within one item.

- [ ] **Step 3: Parse concurrency configuration**

Read `TRANSLATION_CONCURRENCY`, defaulting to `4`, with invalid or non-positive values falling back to four.

- [ ] **Step 4: Integrate the pool into `main()`**

Replace the sequential manifest loop with `runWorkerPool()`. Preserve existing partial-failure semantics and report ordering by manifest position.

- [ ] **Step 5: Run GREEN verification**

```bash
node --test scripts/translation/agentRunner.test.js
```

Expected: concurrency, exactly-once, and failure-isolation tests pass.

### Task 3: Add coordinated checkpoint tests

**Files:**
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `scripts/translation/agentRunner.js`

- [ ] **Step 1: Write a failing serialized-cache test**

Complete items out of order and assert one coordinator-produced cache contains every successful source hash without lost updates.

- [ ] **Step 2: Write a failing checkpoint-frequency test**

Configure checkpoint frequency to two completed items. Assert checkpoint callbacks occur after items two and four and once during finalization.

- [ ] **Step 3: Write a failing partial-report test**

Assert each checkpoint report contains completed and failed results accumulated so far and remains valid JSON.

- [ ] **Step 4: Run RED verification**

```bash
node --test scripts/translation/agentRunner.test.js
```

Expected: checkpoint tests fail before coordinator implementation.

### Task 4: Implement atomic cache and report checkpoints

**Files:**
- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/translation/manifest.js`
- Test: `scripts/translation/agentRunner.test.js`
- Test: `scripts/translation/manifest.test.js`

- [ ] **Step 1: Add atomic JSON writing**

Write cache and report JSON to sibling temporary files and rename them into place to prevent truncated state if the process is interrupted.

- [ ] **Step 2: Centralize successful cache updates**

Workers return results; only the coordinator updates `cache.files[sourcePath]` and writes the cache.

- [ ] **Step 3: Add checkpoint settings**

Read:

```text
TRANSLATION_CHECKPOINT_FILES=10
TRANSLATION_CHECKPOINT_INTERVAL_MS=300000
```

Checkpoint when either threshold is reached.

- [ ] **Step 4: Write partial reports at checkpoints**

Preserve the existing final report structure and add checkpoint metadata: processed count, remaining count, and checkpoint timestamp.

- [ ] **Step 5: Verify cache recovery**

Write a cache checkpoint, rebuild the manifest, and assert successfully completed files are excluded while failed/unstarted files remain pending.

- [ ] **Step 6: Run tests**

```bash
node --test scripts/translation/agentRunner.test.js scripts/translation/manifest.test.js
```

### Task 5: Add soft-deadline and graceful-stop tests

**Files:**
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `scripts/translation/agentRunner.js`

- [ ] **Step 1: Write a failing soft-deadline test**

Use a fake clock where the deadline expires after two assignments. Assert no additional items are assigned and active items are allowed to finish.

- [ ] **Step 2: Write a failing signal-flush test**

Invoke the coordinator's stop handler and assert it requests assignment shutdown and writes a final checkpoint.

- [ ] **Step 3: Run RED verification**

```bash
node --test scripts/translation/agentRunner.test.js
```

- [ ] **Step 4: Implement the deadline**

Read `TRANSLATION_SOFT_DEADLINE_MS`, defaulting to `18000000` (five hours). Stop assigning new files after the deadline.

- [ ] **Step 5: Implement signal handling**

Handle `SIGINT` and `SIGTERM` by setting the stop flag, checkpointing, and avoiding new assignments. Do not start asynchronous work directly inside the signal callback without awaiting it from the coordinator.

- [ ] **Step 6: Run GREEN verification**

```bash
node --test scripts/translation/agentRunner.test.js
```

### Task 6: Make workflow batching and concurrency explicit

**Files:**
- Modify: `.github/workflows/translate-codex.yml`
- Modify: `scripts/translation/workflowReporting.test.js`

- [ ] **Step 1: Keep the hosted-runner maximum timeout**

Retain:

```yaml
timeout-minutes: 360
```

Document in the workflow that this is GitHub's hosted-runner ceiling.

- [ ] **Step 2: Configure four workers**

Add:

```yaml
TRANSLATION_CONCURRENCY: ${{ vars.TRANSLATION_CONCURRENCY || 4 }}
TRANSLATION_SOFT_DEADLINE_MS: ${{ vars.TRANSLATION_SOFT_DEADLINE_MS || 18000000 }}
TRANSLATION_CHECKPOINT_FILES: ${{ vars.TRANSLATION_CHECKPOINT_FILES || 10 }}
TRANSLATION_CHECKPOINT_INTERVAL_MS: ${{ vars.TRANSLATION_CHECKPOINT_INTERVAL_MS || 300000 }}
```

- [ ] **Step 3: Set a bootstrap safety batch**

Change `max_files` default to `500` and use `500` when neither workflow input nor repository variable is configured. Four workers project to complete this batch within the five-hour soft deadline under observed throughput.

- [ ] **Step 4: Update workflow tests**

Assert the 360-minute timeout, four-worker default, five-hour soft deadline, checkpoint configuration, and 500-file default.

- [ ] **Step 5: Run workflow tests**

```bash
node --test scripts/translation/workflowReporting.test.js
```

### Task 7: Commit partial progress before final validation status

**Files:**
- Modify: `.github/workflows/translate-codex.yml`
- Modify: `scripts/translation/workflowReporting.test.js`

- [ ] **Step 1: Expose completion metadata**

Have `agentRunner.js` write GitHub outputs for translated, failed, and remaining counts.

- [ ] **Step 2: Validate completed output**

Run MDX validation and the Docusaurus build when at least one translation completed, even if the soft deadline left files pending.

- [ ] **Step 3: Commit completed translations and cache**

Commit whenever translated count is greater than zero. Do not require the original manifest count to be fully completed.

- [ ] **Step 4: Report partial completion**

Include translated, failed, and remaining counts in the Feishu report. Mark the run successful when completed output validates and remaining files are intentionally deferred by the soft deadline; mark it failed for validation or unrecoverable runner errors.

- [ ] **Step 5: Test workflow conditions**

Assert partial translated output reaches validation and commit steps and that no-output runs skip them.

### Task 8: Full verification

**Files:**
- No additional production files expected.

- [ ] **Step 1: Run translation tests**

```bash
npm run test:translation
```

- [ ] **Step 2: Run focused agent tests**

```bash
node --test scripts/translation/agentRunner.test.js scripts/translation/manifest.test.js scripts/translation/workflowReporting.test.js
```

- [ ] **Step 3: Run workflow policy**

```bash
npm run test:workflow-policy
```

- [ ] **Step 4: Run type checking**

```bash
npm run typecheck
```

- [ ] **Step 5: Run the production build**

```bash
npm run build
```

- [ ] **Step 6: Verify measured bootstrap capacity**

Confirm logs show no more than four active file workers, periodic checkpoints, a soft stop before five hours, validation of completed files, and a commit before the 360-minute hard timeout.
