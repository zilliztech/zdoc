# Parallel Documentation Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let every completed documentation group publish and translate independently while keeping the all-groups Feishu card synchronized with authoritative GitHub Actions job state.

**Architecture:** Remove cross-group dependencies from `fetch-docs.yml` and retain only each group's internal lane. Add a pure job-state-to-card-state mapper and invoke it from non-fatal reporting steps; single-group runs retain ordered phase reporting while all-group runs replace the complete aggregate state.

**Tech Stack:** GitHub Actions, Node.js 20, GitHub REST API through `gh api`, Docusaurus `report-to-lark`, Lark interactive cards, `node:test`, `js-yaml`.

---

### Task 1: Specify independent lane dependencies

**Files:**
- Modify: `scripts/sdk-reference-workflow.test.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Replace the sequential-chain assertions with independent-lane assertions**

Parse `.github/workflows/fetch-docs.yml` with `js-yaml`. For every group in `['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']`, assert:

```js
assert.deepEqual(workflow.jobs[`publish_${group}`].needs, ['prepare', `produce_${group}`])
assert.deepEqual(workflow.jobs[`translate_${group}`].needs, ['prepare', `publish_${group}`])
assert.deepEqual(
  workflow.jobs[`publish_${group}_translation`].needs,
  ['prepare', `publish_${group}`, `translate_${group}`],
)
```

Also assert that no job's `needs` contains another group's publish or translation job.

- [ ] **Step 2: Run the workflow tests and verify the new assertions fail**

Run:

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js
```

Expected: FAIL because Python through REST still depend on the preceding group's translation publication and `resolve_final` only depends on the last translation publisher.

- [ ] **Step 3: Commit the failing policy tests**

```bash
git add scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js
git commit -m "test: require independent docs workflow lanes"
```

### Task 2: Remove cross-group head-of-line blocking

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`

- [ ] **Step 1: Change every source publisher to depend only on its producer**

Use this shape for every group:

```yaml
publish_python:
  needs: [prepare, produce_python]
```

Do not add workflow-level concurrency. Publication safety continues to come from disjoint checkpoint ownership and the retry loop in `scripts/docs-workflow/publish-checkpoint.sh`.

- [ ] **Step 2: Make final-SHA resolution wait for every translation publication lane**

Set `resolve_final.needs` to:

```yaml
needs:
  - prepare
  - publish_guides_translation
  - publish_python_translation
  - publish_java_translation
  - publish_node_translation
  - publish_go_translation
  - publish_cli_translation
  - publish_rest_translation
```

Retain `if: ${{ always() && needs.prepare.outputs.publish == 'true' }}` so failed or skipped lanes do not suppress final resolution.

- [ ] **Step 3: Run the focused tests**

Run:

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/checkpoint-contention.test.js
```

Expected: PASS, including the existing non-fast-forward publication retry coverage.

- [ ] **Step 4: Commit the independent orchestration**

```bash
git add .github/workflows/fetch-docs.yml
git commit -m "fix: unblock independent docs publication lanes"
```

### Task 3: Build exact all-groups card state from job data

**Files:**
- Create: `scripts/docs-workflow/build-live-card-state.js`
- Create: `scripts/docs-workflow/build-live-card-state.test.js`

- [ ] **Step 1: Write failing tests for running, successful, failed, and skipped jobs**

Use fixtures shaped like GitHub's Actions jobs response:

```js
const jobs = [
  { name: 'produce_rest / produce', status: 'completed', conclusion: 'success' },
  { name: 'publish_rest / publish', status: 'completed', conclusion: 'success' },
  { name: 'translate_rest / translate', status: 'in_progress', conclusion: null },
  { name: 'produce_guides / produce', status: 'in_progress', conclusion: null },
]
```

Assert that `buildLiveCardState({ requestedGroups: ['guides', 'rest'], jobs })` returns five aggregate stages, reports Produce as `1/2 complete`, Publish sources as `1/2 complete`, Translate as running, and includes a two-row manual table. Add tests proving that `failure`, `cancelled`, and `timed_out` map to failed, while selection-driven skipped jobs do not count as failures.

- [ ] **Step 2: Run the tests and verify they fail because the module does not exist**

```bash
node --test scripts/docs-workflow/build-live-card-state.test.js
```

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the pure mapper and CLI**

Export:

```js
function buildLiveCardState({ requestedGroups, jobs, publishEnabled })
function parseJobsResponse(value)
function parseArgs(argv)
```

The CLI accepts `--groups-json`, `--jobs-file`, `--publish`, and `--output`. It writes JSON containing:

```js
{
  stages: [{ name, status, detail }],
  noteMarkdown,
  overallStatus,
}
```

Recognize reusable job names by their prefix before ` / `. Ignore setup and post-job suffixes. Keep the Markdown table bounded to the requested groups and escape `|`, newlines, and backticks in cell values.

- [ ] **Step 4: Run the mapper tests**

```bash
node --test scripts/docs-workflow/build-live-card-state.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit the card-state mapper**

```bash
git add scripts/docs-workflow/build-live-card-state.js scripts/docs-workflow/build-live-card-state.test.js
git commit -m "feat: derive docs card state from workflow jobs"
```

### Task 4: Add exact-state card replacement

**Files:**
- Modify: `plugins/report-to-lark/index.js`
- Modify: `plugins/report-to-lark/index.test.js`

- [ ] **Step 1: Add failing CLI and state-validation tests**

Test a `--card-state-file` operation whose input contains the five aggregate stages and Markdown note. Assert that it preserves the supplied message ID, title, and original start time; uses the exact supplied stage statuses rather than marking preceding stages complete; and rejects unknown statuses, duplicate stage names, an empty stage list, or more than 20 stages.

- [ ] **Step 2: Run the plugin tests and verify failure**

```bash
node --test plugins/report-to-lark/index.test.js
```

Expected: FAIL because `--card-state-file` is not registered.

- [ ] **Step 3: Implement exact-state replacement**

Add CLI options:

```text
--card-state-file <path>
--message-id <id>
--title <title>
--started-at <iso-date>
```

Read and validate the JSON file, construct the existing card state model without ordered-phase inference, attach the bounded Markdown note, and call the same message-update transport used by `--card-phase`. Do not add GitHub API access to the Lark plugin.

- [ ] **Step 4: Run plugin tests**

```bash
node --test plugins/report-to-lark/index.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit exact-state reporting**

```bash
git add plugins/report-to-lark/index.js plugins/report-to-lark/index.test.js
git commit -m "feat: replace lark card with exact workflow state"
```

### Task 5: Wire aggregate reporting into reusable workflow phases

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `.github/workflows/_fetch-content-group.yml`
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `.github/workflows/_verify-docs.yml`
- Modify: `scripts/sdk-reference-workflow.test.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing workflow assertions for all-groups reporting inputs**

Assert that `prepare` always exposes the created card ID and separately exposes `card_mode` as `aggregate` or `ordered`. Assert that every reusable workflow receives `card_mode`, `requested_groups_json`, repository, and run ID, and that aggregate reporting uses `gh api` plus `build-live-card-state.js` and `report-to-lark --card-state-file`.

- [ ] **Step 2: Run focused workflow tests and verify failure**

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js
```

Expected: FAIL because all-group card IDs are currently blank and reusable workflows only support ordered phase updates.

- [ ] **Step 3: Preserve ordered single-group reporting and add aggregate mode**

In `prepare`, emit:

```yaml
phase_card_id: ${{ steps.card.outputs.card_id }}
card_mode: ${{ steps.refs.outputs.selected_group == 'all' && 'aggregate' || 'ordered' }}
requested_groups_json: ${{ steps.refs.outputs.requested_groups_json }}
```

In each reusable workflow's terminal reporting step:

1. If `card_mode == 'ordered'`, keep the current `--card-phase` call.
2. If `card_mode == 'aggregate'`, call the Actions jobs endpoint with `gh api --paginate`, write the response to `$RUNNER_TEMP/docs-jobs.json`, build `$RUNNER_TEMP/docs-card-state.json`, then invoke `report-to-lark --card-state-file`.
3. Set `GH_TOKEN: ${{ github.token }}` only on the aggregate reporting step.
4. Keep `continue-on-error: true` and Lark secrets scoped to that step.

- [ ] **Step 4: Make aggregate perform the terminal exact-state update**

Before `--card-finish`, refresh the job list and derived aggregate state one final time. Pass the already collected report summaries so the finished card contains both the exact manual table and bounded report Markdown with immutable repository links.

- [ ] **Step 5: Run workflow and reporting tests**

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/build-live-card-state.test.js plugins/report-to-lark/index.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit aggregate progress reporting**

```bash
git add .github/workflows/fetch-docs.yml .github/workflows/_fetch-content-group.yml .github/workflows/_publish-content-group.yml .github/workflows/_translate-content-group.yml .github/workflows/_verify-docs.yml scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js
git commit -m "feat: report live all-manual docs progress"
```

### Task 6: Verify orchestration and card behavior

**Files:**
- Modify only if tests expose a defect in files from Tasks 1-5.

- [ ] **Step 1: Run the complete workflow-focused suite**

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/*.test.js plugins/report-to-lark/index.test.js scripts/collect-build-card-notes.test.js scripts/translation/*.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Run repository workflow policy validation**

```bash
node scripts/validate-workflow-policy.js
```

Expected: `All GitHub Actions workflows satisfy documentation production policy.`

- [ ] **Step 3: Review dependency and secret diffs**

```bash
git diff --check
git diff -- .github/workflows scripts/docs-workflow plugins/report-to-lark
```

Expected: no whitespace errors, no cross-group dependency chain, no broad `secrets: inherit`, and no GitHub token outside aggregate reporting steps.

- [ ] **Step 4: Commit any verification-only corrections**

```bash
git add .github/workflows scripts/docs-workflow plugins/report-to-lark scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js
git commit -m "test: verify parallel docs orchestration"
```

Skip this commit when verification required no corrections.
