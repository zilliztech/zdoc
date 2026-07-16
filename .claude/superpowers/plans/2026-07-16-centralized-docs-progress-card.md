# Centralized Documentation Progress Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fragmented Feishu progress updates with one 60-second central monitor that presents readable per-manual progress, Guides table-render detail, waiting dependencies, and validated final reports without affecting documentation production.

**Architecture:** A pure state module converts GitHub Actions jobs into a complete card snapshot on every poll. A single monitor job reads the Jobs and Artifacts APIs, patches the Card V2 message on every heartbeat, and consumes a fixed-schema final report artifact produced by `aggregate`; a conditional fallback performs the terminal patch only when the monitor fails. Existing producer, publisher, translator, and verifier workflows keep their domain work and report artifacts but stop owning live card presentation.

**Tech Stack:** Node.js 20 CommonJS, `node:test`, native `fetch`, GitHub Actions reusable workflows, GitHub Actions Jobs/Artifacts REST APIs, Feishu/Lark Card JSON V2.

---

## File map and invariants

**Create**

- `scripts/docs-workflow/docs-progress-state.js` — pure GitHub-job-to-card-state derivation, job retry selection, Guides matrix aggregation, dependency descriptions, and task-name normalization.
- `scripts/docs-workflow/docs-progress-state.test.js` — fixture-driven state tests.
- `scripts/docs-workflow/fixtures/docs-progress/*.json` — sanitized Jobs API snapshots for Guides bootstrap/render/assembly, SDK queues, retries, failures, and terminal runs.
- `scripts/docs-workflow/docs-card-report.js` — fixed-schema final report creation and validation CLI.
- `scripts/docs-workflow/docs-card-report.test.js` — schema, bound, CLI, and rejection tests.
- `plugins/report-to-lark/cardClient.js` — reusable Feishu token acquisition and card PATCH client shared by the Docusaurus command and monitor.
- `plugins/report-to-lark/cardClient.test.js` — request-shape and retry-boundary tests.
- `scripts/docs-workflow/monitor-docs-progress.js` — 60-second polling loop, GitHub API pagination, artifact download, heartbeat PATCH, terminal update, and signal handling.
- `scripts/docs-workflow/monitor-docs-progress.test.js` — injected-client monitor tests with a fake clock.
- `.github/workflows/_monitor-docs-progress.yml` — reusable read-only monitor workflow.

**Modify**

- `plugins/report-to-lark/cardV2.js` and `plugins/report-to-lark/cardV2.test.js` — two-row phase grid, active/waiting/failed manual blocks, collapsed completed panel, report panels, semantic header, and compact footer.
- `plugins/report-to-lark/reportCardState.js` and `plugins/report-to-lark/reportCardState.test.js` — preserve the exact structured state instead of converting it back into the legacy stage/manual-table shape.
- `plugins/report-to-lark/index.js` — use `cardClient.js` and allow `--card-state-file` to pass the complete exact state.
- `scripts/docs-workflow/build-live-card-state.js` and `scripts/docs-workflow/build-live-card-state.test.js` — become a compatibility adapter over `docs-progress-state.js` for any remaining local callers.
- `scripts/docs-workflow/aggregate-results.js`, `scripts/docs-workflow/aggregate-results.test.js`, `scripts/collect-build-card-notes.js`, and `scripts/collect-build-card-notes.test.js` — provide bounded structured inputs to the final report artifact.
- `.github/workflows/fetch-docs.yml` — start the monitor after `prepare`, upload the final report artifact, remove aggregate PATCH ownership, and add the conditional fallback.
- `.github/workflows/_fetch-content-group.yml`, `.github/workflows/_fetch-guides-sources.yml`, `.github/workflows/_assemble-guides.yml`, `.github/workflows/_publish-content-group.yml`, `.github/workflows/_translate-content-group.yml`, `.github/workflows/_publish-translation-batches.yml`, `.github/workflows/_translate-publish-batch.yml`, and `.github/workflows/_verify-docs.yml` — remove reporting-only card inputs, secrets, and PATCH steps while retaining domain outputs and report uploads.
- `scripts/validate-workflow-policy.js` and `scripts/validate-workflow-policy.test.js` — enforce centralized ownership, credential boundaries, artifact creation, and non-blocking reporting.

**Non-negotiable invariants**

- The monitor PATCHes once per 60-second heartbeat even when the derived workflow state is unchanged.
- `aggregate` never depends on the monitor, and no documentation job depends on a card update succeeding.
- The monitor derives each snapshot from GitHub; it never treats the current card body as workflow state.
- Guides render retries count once per logical target/table identity, using the latest effective attempt.
- Publishers and translation publishers keep their existing dependency order; the card only describes that queue.
- Jobs that need Feishu credentials to read source documents keep them scoped to those source-fetch steps. Renderers, assemblers, publishers, translators, verifiers, and report upload steps receive no Feishu credentials.
- The final report artifact contains bounded Markdown and fixed keys only; it contains no raw logs, arbitrary paths, environment dumps, or credentials.

### Task 1: Define the pure progress state and sanitized replay fixtures

**Files:**

- Create: `scripts/docs-workflow/docs-progress-state.js`
- Create: `scripts/docs-workflow/docs-progress-state.test.js`
- Create: `scripts/docs-workflow/fixtures/docs-progress/guides-rendering.json`
- Create: `scripts/docs-workflow/fixtures/docs-progress/sdk-publisher-queue.json`
- Create: `scripts/docs-workflow/fixtures/docs-progress/retry-and-failure.json`
- Create: `scripts/docs-workflow/fixtures/docs-progress/terminal-success.json`
- Modify: `scripts/docs-workflow/build-live-card-state.js`
- Modify: `scripts/docs-workflow/build-live-card-state.test.js`

- [ ] **Step 1: Add failing tests for the public state contract and phase omission**

Use this state contract in `docs-progress-state.test.js`:

```js
const assert = require('node:assert/strict')
const test = require('node:test')
const { deriveDocsProgressState } = require('./docs-progress-state')

test('omits publish phases in artifact-only mode and expands the running manual', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['python'],
    publishEnabled: false,
    jobs: [{
      id: 101,
      name: 'produce_python / produce',
      status: 'in_progress',
      conclusion: null,
      steps: [{ name: 'Fetch content group', status: 'in_progress', conclusion: null }],
    }],
  })

  assert.deepEqual(state.phases.map(phase => phase.key), ['produce'])
  assert.deepEqual(state.manuals, [{
    group: 'python',
    label: 'Python SDK',
    phase: 'produce',
    status: 'running',
    currentTask: 'Fetch content group',
    detail: null,
  }])
  assert.equal(state.overallStatus, 'running')
})

test('orders failed, running, waiting, then completed manuals', () => {
  const state = deriveDocsProgressState({
    requestedGroups: ['python', 'java', 'node', 'go'],
    publishEnabled: true,
    jobs: [
      { id: 1, name: 'produce_python / produce', status: 'completed', conclusion: 'success' },
      { id: 2, name: 'publish_python / publish', status: 'in_progress', conclusion: null, steps: [{ name: 'Publish checkpoint', status: 'in_progress' }] },
      { id: 3, name: 'produce_java / produce', status: 'completed', conclusion: 'success' },
      { id: 4, name: 'publish_java / publish', status: 'completed', conclusion: 'failure', steps: [{ name: 'Publish checkpoint', status: 'completed', conclusion: 'failure' }] },
      { id: 5, name: 'produce_node / produce', status: 'completed', conclusion: 'success' },
      { id: 6, name: 'produce_go / produce', status: 'completed', conclusion: 'success' },
      { id: 7, name: 'publish_go / publish', status: 'completed', conclusion: 'success' },
      { id: 8, name: 'translate_go / translate', status: 'completed', conclusion: 'success' },
      { id: 9, name: 'publish_go_translation / publish', status: 'completed', conclusion: 'success' },
    ],
  })

  assert.deepEqual(state.manuals.map(manual => [manual.group, manual.status]), [
    ['java', 'failed'],
    ['python', 'running'],
    ['node', 'waiting'],
    ['go', 'completed'],
  ])
  assert.equal(state.manuals[2].currentTask, 'Waiting for Java publisher')
})
```

- [ ] **Step 2: Run the new tests and confirm the missing module failure**

Run:

```bash
node --test scripts/docs-workflow/docs-progress-state.test.js
```

Expected: FAIL with `Cannot find module './docs-progress-state'`.

- [ ] **Step 3: Implement the state vocabulary, phase descriptors, dependency map, and public entry point**

Start `docs-progress-state.js` with these exact exported concepts:

```js
'use strict'

const GROUP_LABELS = Object.freeze({
  guides: 'Guides',
  python: 'Python SDK',
  java: 'Java SDK',
  node: 'Node.js SDK',
  go: 'Go SDK',
  cli: 'Zilliz CLI',
  rest: 'REST API',
})

const PHASES = Object.freeze([
  { key: 'produce', label: 'Produce', job: group => `produce_${group}` },
  { key: 'publish', label: 'Publish', job: group => `publish_${group}` },
  { key: 'translate', label: 'Translate', job: group => `translate_${group}` },
  { key: 'translation', label: 'Publish translations', job: group => `publish_${group}_translation` },
  { key: 'verify', label: 'Verify', job: () => 'verify' },
])

const PUBLISH_PREDECESSOR = Object.freeze({
  guides: 'python',
  python: 'rest',
  node: 'java',
  go: 'node',
  cli: 'go',
  rest: 'cli',
})

const TRANSLATION_PUBLISH_PREDECESSOR = Object.freeze({
  guides: 'rest',
  python: 'guides',
  java: 'python',
  node: 'java',
  go: 'node',
  cli: 'go',
  rest: 'cli',
})

const FAILURE_CONCLUSIONS = new Set([
  'failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure',
])

function deriveDocsProgressState({ requestedGroups, jobs = [], publishEnabled, reports = [], terminalStatus = null }) {
  if (!Array.isArray(requestedGroups) || requestedGroups.length === 0) {
    throw new Error('requestedGroups must be a non-empty array')
  }
  const selectedPhases = publishEnabled ? PHASES : PHASES.filter(phase => phase.key === 'produce')
  const effectiveJobs = selectEffectiveJobs(jobs)
  const manuals = requestedGroups.map(group => deriveManual({ group, effectiveJobs, publishEnabled }))
  const phases = selectedPhases.map(phase => derivePhase({ phase, manuals, effectiveJobs, requestedGroups }))
  return {
    overallStatus: terminalStatus || overallStatus(phases, manuals),
    phases,
    manuals: orderManuals(manuals),
    reports: Array.isArray(reports) ? reports : [],
  }
}
```

Implement and export these helpers so later tests can isolate behavior:

```js
module.exports = {
  deriveDocsProgressState,
  logicalJobIdentity,
  normalizeCurrentTask,
  selectEffectiveJobs,
}
```

`selectEffectiveJobs(jobs)` must group on `logicalJobIdentity(job)`, then select the item with the greatest tuple `(run_attempt || 1, completed_at || started_at || '', id || 0)`. `logicalJobIdentity` must preserve Guides matrix identity (`target_name` plus `table_name`) while removing reusable-workflow suffixes such as ` / fetch`, ` / publish`, and ` / translate` from non-matrix jobs.

- [ ] **Step 4: Add and replay sanitized Guides progress fixtures**

Store only these Jobs API fields in fixture files: `id`, `run_attempt`, `name`, `status`, `conclusion`, `started_at`, `completed_at`, and step `name/status/conclusion`. Do not copy URLs, runner names, labels, repository data, or log text.

Add assertions for the `guides-rendering.json` snapshot:

```js
test('derives Guides table progress and current task from a sanitized snapshot', () => {
  const jobs = require('./fixtures/docs-progress/guides-rendering.json')
  const state = deriveDocsProgressState({ requestedGroups: ['guides'], publishEnabled: false, jobs })
  assert.deepEqual(state.manuals[0], {
    group: 'guides',
    label: 'Guides',
    phase: 'produce',
    status: 'running',
    currentTask: 'Render Guides tables',
    detail: '8/14 complete · 4 active · 2 pending · 0 failed',
  })
  assert.deepEqual(state.phases[0], {
    key: 'produce', label: 'Produce', done: 0, total: 1, status: 'running',
  })
})
```

Map Guides source and assembly step names with an explicit ordered table, including `Restore Guides source cache`, `Fetch shared Guides sources`, `Prefetch shared Guides media`, `Create shared source artifact`, `Restore validated Guides table artifacts`, `Generate combined Guides sidebars`, `Validate combined guides output`, `Create Guides checkpoint artifact`, and `Upload Guides checkpoint artifact`. Infrastructure steps such as checkout, Node setup, dependency installation, cache post-actions, and cleanup must return `null` from `normalizeCurrentTask`.

- [ ] **Step 5: Add retry, failure, empty-matrix, and queue tests**

Use `retry-and-failure.json` to prove that a failed attempt followed by a successful retry counts as one completed table, while a latest failed identity appears once in the detail. Use `sdk-publisher-queue.json` to assert the actual source publisher chain and translation publisher chain from `fetch-docs.yml`.

Add an empty-matrix test where `produce_guides_sources` succeeds and `produce_guides / assemble` is running; expected task is `Restore Guides source artifact`, with no synthetic `0/0` table detail.

- [ ] **Step 6: Convert the old live-state builder into a compatibility adapter**

Replace its duplicated phase logic with:

```js
const { deriveDocsProgressState } = require('./docs-progress-state')

function buildLiveCardState(input) {
  return deriveDocsProgressState({
    requestedGroups: input.requestedGroups,
    jobs: input.jobs,
    publishEnabled: input.publishEnabled,
    reports: (input.notes || []).map(markdown => ({ markdown })),
  })
}
```

Keep `parseJobsResponse` and the CLI argument parser for compatibility. Update its tests to assert the new `phases/manuals/reports` shape and remove expectations for `noteMarkdown`, legacy `stages`, and the five-column manual status row.

- [ ] **Step 7: Run state tests**

Run:

```bash
node --test scripts/docs-workflow/docs-progress-state.test.js scripts/docs-workflow/build-live-card-state.test.js
```

Expected: PASS with no skipped tests.

- [ ] **Step 8: Commit the pure state layer**

```bash
git add scripts/docs-workflow/docs-progress-state.js scripts/docs-workflow/docs-progress-state.test.js scripts/docs-workflow/fixtures/docs-progress scripts/docs-workflow/build-live-card-state.js scripts/docs-workflow/build-live-card-state.test.js
git commit -m "feat: derive centralized docs progress state"
```

### Task 2: Add the bounded final card-report artifact schema

**Files:**

- Create: `scripts/docs-workflow/docs-card-report.js`
- Create: `scripts/docs-workflow/docs-card-report.test.js`
- Modify: `scripts/docs-workflow/aggregate-results.js`
- Modify: `scripts/docs-workflow/aggregate-results.test.js`
- Modify: `scripts/collect-build-card-notes.js`
- Modify: `scripts/collect-build-card-notes.test.js`

- [ ] **Step 1: Write failing schema and CLI tests**

Define the only accepted artifact shape:

```js
{
  schemaVersion: 1,
  runId: 29408776779,
  generatedAt: '2026-07-16T10:00:00.000Z',
  overallStatus: 'success',
  summary: 'Documentation workflow succeeded.',
  reports: [
    { title: 'Link report', markdown: '# Link report\n\n- Broken links: 0', attention: false },
  ],
}
```

Tests must enforce:

- `runId` is a positive safe integer;
- `generatedAt` is an ISO timestamp;
- `overallStatus` is `success`, `failure`, or `cancelled`;
- `summary` is at most 2,000 UTF-16 code units;
- `reports` contains at most 12 entries;
- report `title` is 1–120 code units and `markdown` is 1–12,000 code units;
- unknown top-level or report keys are rejected;
- control characters other than newline and tab are rejected;
- validation returns a deeply frozen copy.

- [ ] **Step 2: Run the report tests and confirm the missing module failure**

```bash
node --test scripts/docs-workflow/docs-card-report.test.js
```

Expected: FAIL with `Cannot find module './docs-card-report'`.

- [ ] **Step 3: Implement create, validate, read, and CLI operations**

Export this API:

```js
module.exports = {
  createCardReport,
  readCardReport,
  validateCardReport,
  writeCardReport,
}
```

Use an exact-key helper rather than permissive destructuring:

```js
function assertExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter(key => !allowed.includes(key))
  if (unknown.length) throw new Error(`${label} contains unknown keys: ${unknown.join(', ')}`)
}
```

Support these CLI forms:

```bash
node scripts/docs-workflow/docs-card-report.js create \
  --run-id 29408776779 \
  --overall-status success \
  --summary-file tmp/docs-workflow-summary.md \
  --reports-json tmp/card-notes.json \
  --output tmp/docs-card-report/card-report.json

node scripts/docs-workflow/docs-card-report.js validate \
  --input tmp/docs-card-report/card-report.json \
  --run-id 29408776779
```

The `create` operation must derive `title` from the first Markdown heading, compute `attention` using the existing report warning/error metrics, bound all strings before validation, create the output directory, and write a trailing newline. The `validate` operation must reject a mismatched run ID.

- [ ] **Step 4: Give aggregate and report collection structured outputs**

Keep `aggregate-results.js` responsible for terminal workflow status. Add an output named `summary_text` containing a single bounded sentence suitable for the artifact.

Change `collect-build-card-notes.js` to write both:

```text
card_notes_json=["# Link report\n\n- Broken links: 0"]
card_notes_file=/absolute/runner/path/card-notes.json
```

The JSON file must contain the same bounded Markdown array as `card_notes_json`. Tests must confirm deterministic report ordering and maximum collection/string bounds.

- [ ] **Step 5: Run report and aggregate tests**

```bash
node --test scripts/docs-workflow/docs-card-report.test.js scripts/docs-workflow/aggregate-results.test.js scripts/collect-build-card-notes.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the report artifact layer**

```bash
git add scripts/docs-workflow/docs-card-report.js scripts/docs-workflow/docs-card-report.test.js scripts/docs-workflow/aggregate-results.js scripts/docs-workflow/aggregate-results.test.js scripts/collect-build-card-notes.js scripts/collect-build-card-notes.test.js
git commit -m "feat: add validated docs card report artifact"
```

### Task 3: Redesign Card V2 for narrow Feishu windows

**Files:**

- Modify: `plugins/report-to-lark/cardV2.js`
- Modify: `plugins/report-to-lark/cardV2.test.js`
- Modify: `plugins/report-to-lark/reportCardState.js`
- Modify: `plugins/report-to-lark/reportCardState.test.js`

- [ ] **Step 1: Replace legacy table expectations with failing native-component tests**

Build a representative state containing one failed, one running, one waiting, and one completed manual. Assert:

```js
const card = buildCardV2(state, {
  now: new Date('2026-07-16T10:10:00.000Z'),
  workflowUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
})
const serialized = JSON.stringify(card)

assert.equal(card.schema, '2.0')
assert.equal(card.body.elements.filter(element => element.tag === 'column_set').length, 5)
assert.equal(card.body.elements.some(element => element.tag === 'table'), false)
assert.match(serialized, /CURRENT TASK/)
assert.match(serialized, /Waiting for Python publisher/)
assert.match(serialized, /blue-50/)
assert.match(serialized, /grey-50/)
assert.match(serialized, /red-50/)
assert.match(serialized, /Completed \(1\)/)
```

The five `column_set` elements are two phase rows plus three non-completed manual blocks. Also assert that the Completed panel is collapsed and appears after all active manual blocks but before report panels.

- [ ] **Step 2: Run Card V2 tests and confirm failure against the native manual table**

```bash
node --test plugins/report-to-lark/cardV2.test.js plugins/report-to-lark/reportCardState.test.js
```

Expected: FAIL because `cardV2.js` still renders a `table` and a single five-column phase row.

- [ ] **Step 3: Implement semantic status presentation and the two phase rows**

Replace the legacy status vocabulary with:

```js
const STATUS = Object.freeze({
  waiting: { label: 'Waiting', color: 'grey', icon: '○', background: 'grey-50' },
  running: { label: 'Running', color: 'blue', icon: '◉', background: 'blue-50' },
  completed: { label: 'Done', color: 'green', icon: '✓', background: 'grey-50' },
  failed: { label: 'Failed', color: 'red', icon: '✕', background: 'red-50' },
  cancelled: { label: 'Cancelled', color: 'red', icon: '✕', background: 'red-50' },
})
```

Render `state.phases.slice(0, 3)` in the first `column_set` and `state.phases.slice(3, 5)` in the second. Omit an empty second row. Each phase cell must show `label`, `done/total` when `total > 1`, and a native `text_tag` encoded as Card V2 markup inside the Markdown element.

Preserve the initial card created by `prepare` until the monitor's first PATCH. Add a `normalizeCardState(state)` compatibility boundary that uses `state.phases` when present and otherwise converts legacy `state.stages/state.statuses` into phase objects and maps `pending/running/done/fail` to `waiting/running/completed/failed`. `buildCardV2` must call this normalizer before rendering; no other new code may consume the legacy shape.

- [ ] **Step 4: Implement manual blocks and the collapsed completed panel**

Use this block shape for failed, running, and waiting manuals:

```js
function manualBlock(manual) {
  const presentation = STATUS[manual.status]
  const detail = manual.detail ? `\n${manual.detail}` : ''
  return {
    tag: 'column_set',
    flex_mode: 'flow',
    columns: [{
      tag: 'column',
      width: 'weighted',
      weight: 1,
      background_style: presentation.background,
      padding: '10px',
      elements: [{
        tag: 'markdown',
        text_size: 'normal',
        content: `**${manual.label} · ${phaseLabel(manual.phase)}**  <text_tag color='${presentation.color}'>${presentation.label}</text_tag>\n<font color='grey'>CURRENT TASK</font>\n${manual.currentTask}${detail}`,
      }],
    }],
  }
}
```

Escape user-derived Markdown and tag delimiters before interpolation. Cap displayed task text at 160 code units and detail at 240 even though the state layer already bounds them.

Render completed manuals as one `collapsible_panel` with `expanded: false`, header `Completed (<count>)`, grey border, and one notation-sized Markdown element per manual. Do not nest a panel inside a table or another panel.

- [ ] **Step 5: Preserve report attention behavior and compact footer**

Accept reports as `{ title, markdown, attention }`; use `attention` when present and fall back to `reportNeedsAttention(markdown)` for compatibility. Keep one root-level `collapsible_panel` per report. Add a root-level `hr`, then a notation footer containing start time, elapsed time, target branch, and immutable workflow link.

Map overall states exactly:

```js
const OVERALL = {
  running: { template: 'blue', label: 'Running', color: 'blue' },
  success: { template: 'green', label: 'Succeeded', color: 'green' },
  failure: { template: 'red', label: 'Failed', color: 'red' },
  cancelled: { template: 'red', label: 'Cancelled', color: 'red' },
}
```

- [ ] **Step 6: Make exact state truly exact**

Change `buildExactState` to accept and validate this input:

```js
function buildExactState({ messageId, title, startedAt, targetBranch, input }) {
  return {
    messageId,
    title: title || input.title || 'Global Docs Build',
    startedAt: startedAt || input.startedAt || new Date().toISOString(),
    targetBranch: targetBranch || input.targetBranch,
    overallStatus: input.overallStatus,
    phases: input.phases,
    manuals: input.manuals,
    reports: input.reports || [],
  }
}
```

Reject absent `overallStatus`, non-array `phases/manuals/reports`, and any manual status outside `failed/running/waiting/completed/cancelled`. Remove the old `selectExactStateNotes` special case that discarded notes when manuals were present.

- [ ] **Step 7: Run Card V2 tests**

```bash
node --test plugins/report-to-lark/cardV2.test.js plugins/report-to-lark/reportCardState.test.js
```

Expected: PASS, and the serialized representative card contains no `\"tag\":\"table\"`.

- [ ] **Step 8: Commit the Card V2 redesign**

```bash
git add plugins/report-to-lark/cardV2.js plugins/report-to-lark/cardV2.test.js plugins/report-to-lark/reportCardState.js plugins/report-to-lark/reportCardState.test.js
git commit -m "feat: redesign docs progress card for narrow windows"
```

### Task 4: Extract a reusable Feishu card client

**Files:**

- Create: `plugins/report-to-lark/cardClient.js`
- Create: `plugins/report-to-lark/cardClient.test.js`
- Modify: `plugins/report-to-lark/index.js`

- [ ] **Step 1: Write failing request-shape tests with injected dependencies**

Test a client created with fake `fetchToken`, `getToken`, and `requestJson` functions. Assert one PATCH to `/open-apis/im/v1/messages/<message-id>` with body:

```js
{
  content: JSON.stringify(buildCardV2(state)),
}
```

Also assert that missing `messageId`, `feishuHost`, `appId`, or `appSecret` fails before any network call.

- [ ] **Step 2: Run the client test and confirm the missing module failure**

```bash
node --test plugins/report-to-lark/cardClient.test.js
```

Expected: FAIL with `Cannot find module './cardClient'`.

- [ ] **Step 3: Implement the injectable client**

Expose:

```js
function createCardClient({ feishuHost, appId, appSecret, tokenProvider, requestJson, now }) {
  return {
    async patch({ messageId, state }) {
      const token = await tokenProvider({ appId, appSecret })
      return requestJson(`${feishuHost}/open-apis/im/v1/messages/${encodeURIComponent(messageId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: JSON.stringify(buildCardV2(state, { now: now() })) }),
      }, 'report-to-lark patch card')
    },
  }
}
```

The production `tokenProvider` must use the existing `larkTokenFetcher`; the production `requestJson` must use `fetchFeishuJsonWithRetry`. Do not log tokens or the authorization header.

Because `larkTokenFetcher.js` currently reads `APP_ID`, `APP_SECRET`, and `FEISHU_HOST` at module load, require it lazily inside the production token provider after CLI environment validation. Tests continue to inject a provider and must not mutate global environment variables.

- [ ] **Step 4: Switch the Docusaurus command to the shared client and exact input**

In `index.js`, remove the local `buildCardContent` and `patchCard` functions. Instantiate the shared client once inside `.action()`. For `--card-state-file`, call:

```js
const state = buildExactState({
  messageId: opts.messageId,
  title: opts.title,
  startedAt: opts.startedAt,
  targetBranch: opts.targetBranch || input.targetBranch,
  input,
})
await cardClient.patch({ messageId: opts.messageId, state })
```

Keep card creation behavior and GitHub outputs unchanged.

- [ ] **Step 5: Run all report-to-lark tests**

```bash
node --test plugins/report-to-lark/cardClient.test.js plugins/report-to-lark/cardV2.test.js plugins/report-to-lark/reportCardState.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the shared client**

```bash
git add plugins/report-to-lark/cardClient.js plugins/report-to-lark/cardClient.test.js plugins/report-to-lark/index.js
git commit -m "refactor: share Feishu card patch client"
```

### Task 5: Implement the 60-second central monitor

**Files:**

- Create: `scripts/docs-workflow/monitor-docs-progress.js`
- Create: `scripts/docs-workflow/monitor-docs-progress.test.js`

- [ ] **Step 1: Write failing heartbeat, state-change, terminal, and signal tests**

Construct the monitor with injected functions:

```js
const monitor = createDocsProgressMonitor({
  runId: 42,
  repository: 'zilliztech/zdoc',
  requestedGroups: ['guides'],
  publishEnabled: false,
  startedAt: '2026-07-16T10:00:00.000Z',
  targetBranch: 'test/docs-card',
  pollIntervalMs: 60_000,
  listJobs,
  downloadFinalReport,
  patchCard,
  sleep,
  now,
  log,
})
```

Prove all of the following:

- two identical snapshots produce two PATCH calls separated by `sleep(60000)`;
- a changed current step appears in the next PATCH;
- two transient Jobs API errors are retried with 1s then 2s backoff and recover;
- completed `aggregate` downloads and validates `docs-card-report-42`, then issues exactly one terminal PATCH and exits;
- an invalid or missing report produces a terminal PATCH with report `Final report unavailable`;
- `SIGTERM` or `SIGINT` attempts one cancellation PATCH using the latest snapshot and does not start another poll;
- card PATCH failure is logged in bounded form and polling continues;
- logs never include response bodies, headers, tokens, or full Markdown reports.

- [ ] **Step 2: Run monitor tests and confirm the missing module failure**

```bash
node --test scripts/docs-workflow/monitor-docs-progress.test.js
```

Expected: FAIL with `Cannot find module './monitor-docs-progress'`.

- [ ] **Step 3: Implement GitHub API pagination and retry helpers**

Use native `fetch` with these headers:

```js
{
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'zdoc-progress-monitor',
}
```

Fetch `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs?filter=all&per_page=100&page=N` until a page contains fewer than 100 jobs. Retry network errors, HTTP 429, and HTTP 5xx up to three attempts with delays `1000`, `2000`, `4000` milliseconds. Treat other 4xx responses as terminal monitor errors with status code only.

- [ ] **Step 4: Implement the heartbeat loop and terminal boundary**

Use this control flow:

```js
async function run() {
  while (!stopping) {
    const jobs = await withRetry(() => listJobs())
    latestState = deriveDocsProgressState({
      requestedGroups,
      jobs,
      publishEnabled,
    })
    await bestEffortPatch(latestState)

    const aggregate = selectAggregateJob(jobs)
    if (aggregate?.status === 'completed') {
      const report = await bestEffortFinalReport()
      await bestEffortPatch(buildTerminalState({ jobs, report }))
      return
    }
    await sleep(pollIntervalMs)
  }
}
```

Do not suppress `bestEffortPatch` based on a content hash. A hash may be logged as `heartbeat state=<12 hex chars>`.

- [ ] **Step 5: Implement artifact download and validation**

After aggregate completion, query `GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts?name=docs-card-report-{run_id}`. Retry artifact discovery five times with 10-second delays because upload visibility may lag job completion. Download the selected non-expired artifact from its `archive_download_url`, write it under a newly created `RUNNER_TEMP` directory, extract with `execFile('unzip', ['-q', archive, '-d', directory])`, reject symlinks and any extracted path outside the directory, then call `readCardReport(path, { expectedRunId: runId })`. Always remove the temporary directory in `finally`.

- [ ] **Step 6: Add CLI validation and finalize-only mode**

Normal mode reads:

```text
GITHUB_RUN_ID
GITHUB_REPOSITORY
GITHUB_TOKEN
CARD_ID
CARD_STARTED_AT
CARD_TARGET_BRANCH
SELECTED_GROUP
PUBLISH_ENABLED
APP_ID
APP_SECRET
FEISHU_HOST
```

`--finalize-only --report-file <path>` performs one Jobs API read and one terminal PATCH, using the supplied validated report when available. This mode is used only by the fallback job. Reject unknown flags, duplicate flags, invalid booleans, invalid run IDs, invalid selected groups, and a poll interval below 10 seconds outside tests.

- [ ] **Step 7: Run monitor tests**

```bash
node --test scripts/docs-workflow/monitor-docs-progress.test.js
```

Expected: PASS with fake time; no test waits for a real minute.

- [ ] **Step 8: Commit the monitor**

```bash
git add scripts/docs-workflow/monitor-docs-progress.js scripts/docs-workflow/monitor-docs-progress.test.js
git commit -m "feat: add centralized docs progress monitor"
```

### Task 6: Add the reusable monitor workflow and top-level lifecycle

**Files:**

- Create: `.github/workflows/_monitor-docs-progress.yml`
- Modify: `.github/workflows/fetch-docs.yml`

- [ ] **Step 1: Add failing workflow-policy tests for the topology**

Parse YAML and assert:

```js
assert.deepEqual(workflow.jobs.monitor_docs_progress.needs, ['prepare'])
assert.equal(workflow.jobs.monitor_docs_progress.uses, './.github/workflows/_monitor-docs-progress.yml')
assert.equal(workflow.jobs.aggregate.needs.includes('monitor_docs_progress'), false)
assert.deepEqual(workflow.jobs.finalize_card_fallback.needs, ['prepare', 'aggregate', 'monitor_docs_progress'])
assert.match(workflow.jobs.finalize_card_fallback.if, /monitor_docs_progress\.result != 'success'/)
```

Also assert that `aggregate` uploads `docs-card-report-${{ github.run_id }}` with `if: ${{ always() }}`, and that the old `Finish progress card` step is absent.

- [ ] **Step 2: Run policy tests and confirm failure before workflow changes**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because `monitor_docs_progress` and `finalize_card_fallback` do not exist.

- [ ] **Step 3: Create the reusable monitor workflow**

Use this job boundary:

```yaml
name: monitor docs progress
on:
  workflow_call:
    inputs:
      master_sha: { required: true, type: string }
      card_id: { required: true, type: string }
      card_started_at: { required: true, type: string }
      target_branch: { required: true, type: string }
      selected_group: { required: true, type: string }
      publish_enabled: { required: true, type: boolean }
    secrets:
      APP_ID: { required: true }
      APP_SECRET: { required: true }

jobs:
  monitor:
    runs-on: ubuntu-latest
    timeout-minutes: 360
    permissions:
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.master_sha }}
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - name: Monitor workflow and update Feishu card
        run: node scripts/docs-workflow/monitor-docs-progress.js
        env:
          GITHUB_TOKEN: ${{ github.token }}
          CARD_ID: ${{ inputs.card_id }}
          CARD_STARTED_AT: ${{ inputs.card_started_at }}
          CARD_TARGET_BRANCH: ${{ inputs.target_branch }}
          SELECTED_GROUP: ${{ inputs.selected_group }}
          PUBLISH_ENABLED: ${{ inputs.publish_enabled }}
          APP_ID: ${{ secrets.APP_ID }}
          APP_SECRET: ${{ secrets.APP_SECRET }}
          FEISHU_HOST: ${{ vars.FEISHU_HOST }}
```

Do not grant `contents: write`, `actions: write`, or pass source-document secrets such as `SPACE_ID`, model keys, Figma keys, or AWS keys.

- [ ] **Step 4: Start the monitor concurrently after `prepare`**

Add to `fetch-docs.yml`:

```yaml
  monitor_docs_progress:
    needs: [prepare]
    uses: ./.github/workflows/_monitor-docs-progress.yml
    with:
      master_sha: ${{ needs.prepare.outputs.master_sha }}
      card_id: ${{ needs.prepare.outputs.card_id }}
      card_started_at: ${{ needs.prepare.outputs.card_started_at }}
      target_branch: ${{ needs.prepare.outputs.target_branch }}
      selected_group: ${{ needs.prepare.outputs.selected_group }}
      publish_enabled: ${{ needs.prepare.outputs.publish == 'true' }}
    secrets:
      APP_ID: ${{ secrets.APP_ID }}
      APP_SECRET: ${{ secrets.APP_SECRET }}
```

Leave every production job independent of `monitor_docs_progress`.

- [ ] **Step 5: Replace aggregate card PATCH with final artifact creation**

After report collection, add:

```yaml
      - name: Create final card report artifact
        if: ${{ always() }}
        continue-on-error: true
        run: |
          node scripts/docs-workflow/docs-card-report.js create \
            --run-id "$GITHUB_RUN_ID" \
            --overall-status "$OVERALL_STATUS" \
            --summary-file tmp/docs-workflow-summary.md \
            --reports-json "${{ steps.reports.outputs.card_notes_file }}" \
            --output tmp/docs-card-report/card-report.json
        env:
          OVERALL_STATUS: ${{ steps.aggregate.outputs.overall_status == 'success' && 'success' || 'failure' }}
      - name: Upload final card report artifact
        if: ${{ always() }}
        continue-on-error: true
        uses: actions/upload-artifact@v4
        with:
          name: docs-card-report-${{ github.run_id }}
          path: tmp/docs-card-report/card-report.json
          if-no-files-found: warn
          retention-days: ${{ fromJSON(needs.prepare.outputs.retention_days) }}
```

Delete the aggregate `Finish progress card` step and its Feishu/GitHub/card environment values. Keep `Fail unsuccessful workflow` after the upload attempt.

- [ ] **Step 6: Add the conditional terminal fallback**

Add:

```yaml
  finalize_card_fallback:
    needs: [prepare, aggregate, monitor_docs_progress]
    if: ${{ always() && needs.prepare.outputs.card_id != '' && needs.monitor_docs_progress.result != 'success' }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    permissions:
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4
        with: { ref: '${{ needs.prepare.outputs.master_sha }}' }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - uses: actions/download-artifact@v4
        continue-on-error: true
        with:
          name: docs-card-report-${{ github.run_id }}
          path: tmp/docs-card-report
      - name: Perform best-effort terminal card update
        continue-on-error: true
        run: node scripts/docs-workflow/monitor-docs-progress.js --finalize-only --report-file tmp/docs-card-report/card-report.json
        env:
          GITHUB_TOKEN: ${{ github.token }}
          CARD_ID: ${{ needs.prepare.outputs.card_id }}
          CARD_STARTED_AT: ${{ needs.prepare.outputs.card_started_at }}
          CARD_TARGET_BRANCH: ${{ needs.prepare.outputs.target_branch }}
          SELECTED_GROUP: ${{ needs.prepare.outputs.selected_group }}
          PUBLISH_ENABLED: ${{ needs.prepare.outputs.publish }}
          APP_ID: ${{ secrets.APP_ID }}
          APP_SECRET: ${{ secrets.APP_SECRET }}
          FEISHU_HOST: ${{ vars.FEISHU_HOST }}
```

The fallback remains successful even when the card cannot be updated.

- [ ] **Step 7: Run workflow policy tests**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: existing distributed-reporting assertions may still fail; the new topology assertions pass. Resolve the remaining failures in Task 7.

- [ ] **Step 8: Commit the monitor lifecycle**

```bash
git add .github/workflows/_monitor-docs-progress.yml .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.test.js
git commit -m "feat: centralize docs card lifecycle"
```

### Task 7: Remove distributed live PATCH ownership

**Files:**

- Modify: `.github/workflows/_fetch-content-group.yml`
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `.github/workflows/_publish-translation-batches.yml`
- Modify: `.github/workflows/_translate-publish-batch.yml`
- Modify: `.github/workflows/_verify-docs.yml`
- Modify: `.github/workflows/fetch-docs.yml`

- [ ] **Step 1: Strengthen the failing policy test before removal**

For every reusable workflow in this task, assert absence of:

```js
for (const pattern of [
  /report-live-card\.sh/,
  /report-to-lark --card-(?:phase|finish|state-file|advance)/,
  /^      card_id:/m,
  /^      card_started_at:/m,
  /^      card_stages:/m,
  /^      card_mode:/m,
]) assert.doesNotMatch(source, pattern)
```

Assert that `_render-guides-table.yml`, `_assemble-guides.yml`, publishers, translators, and `_verify-docs.yml` contain neither `APP_ID` nor `APP_SECRET`. For `_fetch-content-group.yml` and `_fetch-guides-sources.yml`, assert those secrets occur only in the source-fetch/prefetch step environment and are absent from artifact creation/upload/result steps.

- [ ] **Step 2: Remove exact reporting inputs and steps from reusable workflows**

Delete `card_id`, `card_mode`, `card_started_at`, and `card_stages` workflow-call inputs wherever present. Delete steps named:

- `Advance progress card for content group`
- `Report content group producer failure`
- `Report aggregate guides progress`
- `Report publication phase`
- `Report translation phase`
- `Report translation batch progress`
- `Report verification phase`

Delete their `CARD_*`, `SELECTED_GROUP`, `PUBLISH_ENABLED`, `APP_ID`, `APP_SECRET`, `FEISHU_HOST`, and `GH_TOKEN` environments when those values exist only for presentation. Preserve result-emission steps, checkpoint artifacts, translation artifacts, and report artifact uploads.

- [ ] **Step 3: Remove reporting-only caller inputs and secrets**

In `fetch-docs.yml`, remove `card_id`, `card_started_at`, `card_stages`, and `card_mode` from all reusable-workflow `with` blocks. Remove `APP_ID` and `APP_SECRET` from assembler, publisher, translator, translation-batch, and verifier `secrets` blocks. Keep them for source workflows only because those workflows read Feishu source documents; keep `SPACE_ID`, model, Figma, and AWS credentials only where their domain steps use them.

- [ ] **Step 4: Run YAML parse and policy tests**

```bash
node -e "require('js-yaml').load(require('node:fs').readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))"
node --test scripts/validate-workflow-policy.test.js
```

Expected: YAML parse succeeds and policy tests pass after obsolete distributed-reporting assertions are replaced.

- [ ] **Step 5: Commit ownership cleanup**

```bash
git add .github/workflows/fetch-docs.yml .github/workflows/_fetch-content-group.yml .github/workflows/_fetch-guides-sources.yml .github/workflows/_assemble-guides.yml .github/workflows/_publish-content-group.yml .github/workflows/_translate-content-group.yml .github/workflows/_publish-translation-batches.yml .github/workflows/_translate-publish-batch.yml .github/workflows/_verify-docs.yml scripts/validate-workflow-policy.test.js
git commit -m "refactor: remove distributed docs card updates"
```

### Task 8: Enforce centralized reporting policy in the validator

**Files:**

- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing validator cases for forbidden ownership**

Create temporary workflow fixtures in the test that include one forbidden distributed PATCH, one producer-to-monitor dependency, one monitor with `contents: write`, and one aggregate without an always-attempted artifact. Assert a non-zero validator result and a specific message for each.

- [ ] **Step 2: Implement explicit centralized-card policy checks**

Add checks equivalent to:

```js
const DISTRIBUTED_CARD_PATTERN = /report-live-card\.sh|report-to-lark --card-(?:phase|finish|state-file|advance)/
const CARD_OWNER_FILES = new Set([
  '.github/workflows/fetch-docs.yml',
  '.github/workflows/_monitor-docs-progress.yml',
])
```

Require:

- exactly one `monitor_docs_progress` job in `fetch-docs.yml`;
- monitor needs only `prepare` and has `actions: read`, `contents: read`;
- no producer/publisher/translator/verifier needs the monitor;
- aggregate does not need the monitor;
- aggregate always attempts creation and upload of `docs-card-report-${{ github.run_id }}`;
- fallback needs `prepare`, `aggregate`, and monitor and runs only when monitor result is not success;
- distributed card patterns occur only in the initial card creation path or the monitor/fallback implementation;
- card update steps use `continue-on-error: true` or catch/log without failing production;
- render, assembly, publish, translate, and verify reusable workflows have no Feishu app credentials.

- [ ] **Step 3: Run validator and tests**

```bash
node scripts/validate-workflow-policy.js
node --test scripts/validate-workflow-policy.test.js
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit policy enforcement**

```bash
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test: enforce centralized docs card ownership"
```

### Task 9: Run integrated replay and regression verification

**Files:**

- Modify if failures reveal contract mismatches: only files already listed in Tasks 1–8

- [ ] **Step 1: Run the focused central-monitor suite**

```bash
node --test \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/docs-workflow/docs-card-report.test.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  scripts/docs-workflow/build-live-card-state.test.js \
  plugins/report-to-lark/cardClient.test.js \
  plugins/report-to-lark/cardV2.test.js \
  plugins/report-to-lark/reportCardState.test.js \
  scripts/collect-build-card-notes.test.js \
  scripts/docs-workflow/aggregate-results.test.js \
  scripts/validate-workflow-policy.test.js
```

Expected: PASS.

- [ ] **Step 2: Replay every sanitized snapshot through state and Card V2 rendering**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs')
const path = require('node:path')
const { deriveDocsProgressState } = require('./scripts/docs-workflow/docs-progress-state')
const { buildCardV2 } = require('./plugins/report-to-lark/cardV2')
const dir = 'scripts/docs-workflow/fixtures/docs-progress'
for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.json')).sort()) {
  const jobs = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
  const state = deriveDocsProgressState({
    requestedGroups: ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest'],
    jobs,
    publishEnabled: true,
  })
  const card = buildCardV2({
    ...state,
    title: 'Replay',
    startedAt: '2026-07-16T00:00:00.000Z',
    targetBranch: 'test/docs-card',
  })
  if (JSON.stringify(card).includes('\"tag\":\"table\"')) throw new Error(`${file}: table found`)
  process.stdout.write(`${file}: ${state.overallStatus} ${state.manuals.length} manuals\n`)
}
NODE
```

Expected: one summary line per fixture and exit 0.

The `terminal-success.json` replay must include a completed `aggregate` job and all selected manuals in terminal states so the same fixture can exercise the monitor's terminal boundary without live API access.

- [ ] **Step 3: Run the existing workflow regression suite**

```bash
node --test \
  scripts/sdk-reference-workflow.test.js \
  scripts/restore-generated-state.test.js \
  scripts/validate-workflow-policy.test.js \
  scripts/docs-workflow/aggregate-results.test.js \
  scripts/docs-workflow/build-aggregate-input.test.js \
  scripts/docs-workflow/apply-checkpoint-artifact.test.js \
  scripts/docs-workflow/checkpoint-contention.test.js \
  scripts/docs-workflow/content-groups.test.js \
  scripts/docs-workflow/create-checkpoint-artifact.test.js \
  scripts/docs-workflow/publish-checkpoint.test.js \
  scripts/docs-workflow/run-content-group.test.js \
  scripts/docs-workflow/validate-checkpoint-artifact.test.js
```

Expected: PASS.

- [ ] **Step 4: Check syntax and whitespace**

```bash
node --check scripts/docs-workflow/docs-progress-state.js
node --check scripts/docs-workflow/docs-card-report.js
node --check scripts/docs-workflow/monitor-docs-progress.js
node --check plugins/report-to-lark/cardClient.js
node --check plugins/report-to-lark/cardV2.js
git diff --check
```

Expected: every command exits 0 with no output from `git diff --check`.

- [ ] **Step 5: Commit integration corrections if verification required changes**

If Step 1–4 required edits, commit only those corrections:

```bash
git add scripts/docs-workflow plugins/report-to-lark .github/workflows scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js scripts/collect-build-card-notes.js scripts/collect-build-card-notes.test.js
git commit -m "fix: align centralized card integration"
```

If no files changed, record the verification result and do not create an empty commit.

### Task 10: Validate with disposable GitHub workflow runs

**Files:**

- No source changes expected; use the branch containing Tasks 1–9.

- [ ] **Step 1: Push the implementation branch and start an artifact-only Guides run**

Use a disposable target branch that is neither `dev` nor a production branch:

```bash
git push -u origin fix/guides-media-prefetch-scope
gh workflow run fetch-docs.yml \
  --ref fix/guides-media-prefetch-scope \
  -f group=guides \
  -f publish=false \
  -f target_branch=test/central-docs-card \
  -f tooling_ref=fix/guides-media-prefetch-scope
```

Expected: a new run starts from the implementation branch while publication remains disabled.

- [ ] **Step 2: Observe at least two heartbeats during a long Guides stage**

Use `gh run view <run-id> --json jobs,status,conclusion,url` and the Feishu card. Confirm elapsed time advances across two checks separated by at least 60 seconds, `CURRENT TASK` changes through source fetch/media prefetch/table rendering, and table rendering shows completed/active/pending/failed counts.

- [ ] **Step 3: Confirm terminal artifact and card ownership**

Run:

```bash
gh api repos/zilliztech/zdoc/actions/runs/<run-id>/artifacts --jq '.artifacts[] | select(.name == "docs-card-report-<run-id>") | {name,expired,size_in_bytes}'
```

Expected: one non-expired report artifact. Confirm the monitor completes successfully, `finalize_card_fallback` is skipped, the final card is terminal, and the Completed panel is collapsed at the bottom.

- [ ] **Step 4: Run an all-manual artifact-only test for SDK visibility**

```bash
gh workflow run fetch-docs.yml \
  --ref fix/guides-media-prefetch-scope \
  -f group=all \
  -f publish=false \
  -f target_branch=test/central-docs-card-all \
  -f tooling_ref=fix/guides-media-prefetch-scope
```

Expected: producer manuals appear concurrently; irrelevant publish/translation phases are omitted; failed blocks, if any, remain first.

- [ ] **Step 5: Exercise publisher waiting states without using `dev`**

Start a publish-enabled run only after creating a disposable branch from the current `master`. Confirm waiting blocks describe the actual dependency chain, completed manuals move to the bottom panel, and no horizontal table appears. Do not use `dev`, because its content is intentionally divergent.

- [ ] **Step 6: Exercise the fallback path in a disposable run**

On a temporary test-only commit, make the monitor command exit non-zero after its first PATCH while leaving production jobs unchanged. Run against a disposable branch, verify aggregate still runs and uploads the report, and verify `finalize_card_fallback` performs the terminal PATCH. Revert the temporary commit before review.

- [ ] **Step 7: Record run URLs and final verification**

Add the successful artifact-only run, all-manual run, publish-enabled disposable run, and fallback run URLs to the implementation handoff message. Do not add live run identifiers to source fixtures or production code.

## Completion criteria

- The card elapsed time changes at least every 60 seconds while a run is active.
- Guides visibly progresses through source fetch, shared media prefetch, `x/y` table rendering, assembly, and validation.
- SDK/manual blocks show Produce, Publish, Translate, and Publish Translation work, including dependency-based waiting reasons.
- Failed manuals are first; running and waiting manuals remain expanded; completed manuals are grey and collapsed at the bottom.
- The Card V2 payload contains no native manual table and uses only native supported components.
- `aggregate` always attempts a validated `docs-card-report-<run_id>` artifact and never PATCHes the card.
- The monitor owns normal live and terminal presentation; fallback owns only monitor-failure terminal recovery.
- Reporting failures do not block documentation production or publication.
- Render, assembly, publish, translate, and verify jobs receive no Feishu card credentials.
- Focused tests, workflow-policy tests, regression tests, replay rendering, syntax checks, and `git diff --check` all pass.
