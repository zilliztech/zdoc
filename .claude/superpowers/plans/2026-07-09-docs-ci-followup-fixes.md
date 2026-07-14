# Docs CI Follow-up Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the docs CI pipeline read/write incremental state on the correct branch, explain and preserve reports, avoid unnecessary full EN docs fetches, and fix localization checkout failures.

**Architecture:** Keep the existing Docusaurus CLI plugins as the integration points. Run workflow code, plugins, and scripts from the workflow/default branch, but restore generated-state files from the branch that receives generated docs (`dev` for auto UAT builds) before fetch planning. Then make incremental planning stable by treating absent current source JSON as an unknown cache state rather than a content change when live wiki metadata matches the snapshot; make Feishu card notes explicit cross-job state; make localization target branch configurable and default it to `dev`.

**Tech Stack:** Node.js CommonJS, `node:test`, Docusaurus CLI plugins, GitHub Actions YAML, Feishu report card plugin.

---

## File Structure

- Modify: `plugins/lark-docs/incrementalFetchPlanner.js`
  - Change missing-source behavior so unchanged snapshot-backed docs do not trigger full fetch.
- Modify: `plugins/lark-docs/incrementalFetchPlanner.test.js`
  - Add tests for missing source cache with unchanged and changed wiki metadata.
- Create: `plugins/report-to-lark/reportCardState.js`
  - Move pure card-state helpers out of the plugin entrypoint so they can be tested.
- Create: `plugins/report-to-lark/reportCardState.test.js`
  - Test note serialization and final-state note preservation.
- Modify: `plugins/report-to-lark/index.js`
  - Use `reportCardState.js`; add `--notes-json` for cross-job notes.
- Modify: `scripts/run-doc-build-stage.js`
  - Keep current link-check behavior; no broad rewrite.
- Create: `scripts/collect-build-card-notes.js`
  - Build a compact JSON array of report notes from generated report files.
- Modify: `.github/workflows/fetch-docs-auto.yml`
  - Restore generated-state paths from `dev` while keeping workflow code from the workflow branch; expose `card_notes_json` from the fetch job and pass it to `--card-finish`.
- Modify: `.github/workflows/fetch-docs-manual.yml`
  - Restore generated-state paths from the selected generated-output branch while keeping workflow code from the workflow branch; same report-note handling as auto workflow.
- Modify: `.github/workflows/translate-codex.yml`
  - Resolve target branch from dispatch input, repo variable, or `dev`; use it for checkout and commit.

## Task 1: Restore Generated State Without Running Stale Scripts

**Files:**
- Modify: `.github/workflows/fetch-docs-auto.yml`
- Modify: `.github/workflows/fetch-docs-manual.yml`

- [ ] **Step 1: Keep auto workflow checkout on the workflow branch**

In `.github/workflows/fetch-docs-auto.yml`, keep the checkout step as a normal workflow-ref checkout:

```yaml
    - name: checkout repo
      uses: actions/checkout@v4
```

Do not change it to `ref: dev`; that would run `plugins/` and `scripts/` from `dev` and ignore pipeline fixes present only on `master`.

- [ ] **Step 2: Fetch `dev` generated state after checkout**

Immediately after checkout in `.github/workflows/fetch-docs-auto.yml`, add:

```yaml
    - name: restore generated docs state
      run: |
        git fetch origin dev --depth=1
        git checkout origin/dev -- plugins/lark-docs/meta/snapshots plugins/lark-docs/meta/sources || true
```

This makes scheduled runs read the latest snapshot/source cache from `dev` while still running current workflow-branch scripts.

- [ ] **Step 3: Restore manual generated state from selected output branch**

In `.github/workflows/fetch-docs-manual.yml`, keep the checkout step as a normal workflow-ref checkout:

```yaml
    - name: checkout repo
      uses: actions/checkout@v4
```

After that checkout, add a generated-state restore step. If the manual workflow uses an input named `target_branch`, add:

```yaml
    - name: restore generated docs state
      run: |
        TARGET_BRANCH="${{ github.event.inputs.target_branch || 'dev' }}"
        git fetch origin "${TARGET_BRANCH}" --depth=1
        git checkout "origin/${TARGET_BRANCH}" -- plugins/lark-docs/meta/snapshots plugins/lark-docs/meta/sources || true
```

If the manual workflow already has a generated-output branch variable with a different name, use that existing value consistently in the restore step and later auto-commit.

- [ ] **Step 4: Verify auto commit still writes generated output to `dev`**

In `.github/workflows/fetch-docs-auto.yml`, keep:

```yaml
      with:
        branch: dev
        create_branch: true
        push_options: --force
```

Expected: checkout reads workflow code; restore step overlays generated state from `dev`; auto-commit writes the refreshed snapshot and generated docs back to `dev`.

- [ ] **Step 5: Verify manual auto commit uses the same selected output branch**

In `.github/workflows/fetch-docs-manual.yml`, ensure every `stefanzweifel/git-auto-commit-action@v5` step writes to the same branch used by checkout. For a manual input named `target_branch`, use:

```yaml
      with:
        branch: ${{ github.event.inputs.target_branch || 'dev' }}
        create_branch: true
        push_options: --force
```

- [ ] **Step 6: Run workflow diff check**

Run:

```bash
git diff --check .github/workflows/fetch-docs-auto.yml .github/workflows/fetch-docs-manual.yml
```

Expected: no whitespace errors.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/fetch-docs-auto.yml .github/workflows/fetch-docs-manual.yml
git commit -m "fix: restore generated docs state before fetch"
```

## Task 2: Stabilize Incremental Missing-Source Handling

**Files:**
- Modify: `plugins/lark-docs/incrementalFetchPlanner.js`
- Modify: `plugins/lark-docs/incrementalFetchPlanner.test.js`

- [ ] **Step 1: Add failing test for missing source with unchanged wiki metadata**

Append this test to `plugins/lark-docs/incrementalFetchPlanner.test.js`:

```js
test('planIncrementalFetch ignores missing current source when wiki metadata is unchanged', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: {
      schema_version: 2,
      manual: 'guides',
      records: [
        {
          record_id: 'rec-a',
          doc_token: 'a',
          title: 'a',
          slug: 'a',
          source_hash: 'previous-source-hash',
          node_metadata: { revision_id: null, obj_edit_time: '100' },
        },
      ],
    },
    currentNodeMetadataByToken: new Map([['a', { revision_id: null, obj_edit_time: '100' }]]),
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, [])
  assert.deepEqual(plan.expanded_tokens, [])
})
```

- [ ] **Step 2: Add failing test for missing source with changed wiki metadata**

Append this test to `plugins/lark-docs/incrementalFetchPlanner.test.js`:

```js
test('planIncrementalFetch includes missing current source when wiki metadata changed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-'))

  const plan = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: [record('a')],
    previousSnapshot: {
      schema_version: 2,
      manual: 'guides',
      records: [
        {
          record_id: 'rec-a',
          doc_token: 'a',
          title: 'a',
          slug: 'a',
          source_hash: 'previous-source-hash',
          node_metadata: { revision_id: null, obj_edit_time: '100' },
        },
      ],
    },
    currentNodeMetadataByToken: new Map([['a', { revision_id: null, obj_edit_time: '200' }]]),
  })

  assert.equal(plan.mode, 'incremental')
  assert.deepEqual(plan.changed_tokens, ['a'])
  assert.match(plan.reasons_by_token.a.join(' '), /wiki node edit time changed/)
  assert.doesNotMatch(plan.reasons_by_token.a.join(' '), /source file missing/)
})
```

- [ ] **Step 3: Run planner tests and verify failure**

Run:

```bash
node plugins/lark-docs/incrementalFetchPlanner.test.js
```

Expected: the first new test fails because the current implementation adds `source file missing`.

- [ ] **Step 4: Change missing-source logic**

In `plugins/lark-docs/incrementalFetchPlanner.js`, replace this block inside `compareRecord`:

```js
  if (!source) {
    reasons.push('source file missing')
  } else if (previous.source_hash && source.__source_hash !== previous.source_hash) {
    reasons.push('source content changed')
  }
```

with:

```js
  if (source && previous.source_hash && source.__source_hash !== previous.source_hash) {
    reasons.push('source content changed')
  }
```

This intentionally treats absent local source JSON as cache absence, not upstream content change. Upstream changes remain covered by title, slug, doc token, wiki metadata, and new/removed record checks.

- [ ] **Step 5: Run planner tests**

Run:

```bash
node plugins/lark-docs/incrementalFetchPlanner.test.js
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add plugins/lark-docs/incrementalFetchPlanner.js plugins/lark-docs/incrementalFetchPlanner.test.js
git commit -m "fix: stabilize incremental docs fetch planning"
```

## Task 3: Extract Testable Feishu Card State Helpers

**Files:**
- Create: `plugins/report-to-lark/reportCardState.js`
- Create: `plugins/report-to-lark/reportCardState.test.js`
- Modify: `plugins/report-to-lark/index.js`

- [ ] **Step 1: Create failing tests for note preservation**

Create `plugins/report-to-lark/reportCardState.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const {
  appendNotes,
  buildFinishState,
  finishStatuses,
  parseNotesJson,
} = require('./reportCardState')

test('parseNotesJson returns notes from a JSON array', () => {
  assert.deepEqual(parseNotesJson('["A","B"]'), ['A', 'B'])
})

test('parseNotesJson ignores malformed input', () => {
  assert.deepEqual(parseNotesJson('{bad json'), [])
})

test('appendNotes keeps existing notes and skips blanks', () => {
  const state = { notes: ['Existing'] }
  appendNotes(state, ['Next', '', '  '])
  assert.deepEqual(state.notes, ['Existing', 'Next'])
})

test('buildFinishState preserves cross-job notes when local state is absent', () => {
  const state = buildFinishState({
    existingState: null,
    title: 'Global Docs Build',
    stages: ['Fetch EN docs', 'Build EN docs'],
    status: 'success',
    startedAt: '2026-07-08T18:36:16.119Z',
    notes: ['# Link Checks', '# Canonical Links'],
  })

  assert.deepEqual(state.statuses, ['done', 'done'])
  assert.deepEqual(state.notes, ['# Link Checks', '# Canonical Links'])
  assert.equal(state.startedAt, '2026-07-08T18:36:16.119Z')
})

test('finishStatuses marks first unfinished stage failed', () => {
  assert.deepEqual(
    finishStatuses(['Fetch', 'Build', 'Check'], false, ['done', 'running', 'pending']),
    ['done', 'fail', 'pending']
  )
})
```

- [ ] **Step 2: Run card-state tests and verify failure**

Run:

```bash
node plugins/report-to-lark/reportCardState.test.js
```

Expected: fail with `Cannot find module './reportCardState'`.

- [ ] **Step 3: Create `reportCardState.js`**

Create `plugins/report-to-lark/reportCardState.js`:

```js
function finishStatuses(stages, success, existingStatuses = null) {
  if (success) return stages.map(() => 'done')

  if (existingStatuses) {
    const failedIndex = existingStatuses.findIndex(s => s === 'running' || s === 'pending')
    if (failedIndex === -1) {
      return existingStatuses.map((s, i) => i === existingStatuses.length - 1 ? 'fail' : s)
    }
    return existingStatuses.map((s, i) => i === failedIndex ? 'fail' : s)
  }

  return stages.map((_, i) => i === 0 ? 'fail' : 'pending')
}

function parseNotesJson(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())
  } catch (_) {
    return []
  }
}

function appendNotes(state, notes) {
  if (!state.notes) state.notes = []
  for (const note of notes || []) {
    if (typeof note === 'string' && note.trim()) state.notes.push(note.trim())
  }
  return state
}

function buildFinishState({
  existingState,
  title,
  stages,
  status,
  startedAt,
  notes = [],
}) {
  const success = status === 'success' || status === 'done'
  const effectiveStages = stages && stages.length ? stages : [success ? 'Build succeeded' : 'Build failed']
  const state = existingState || {
    title: title || 'Build',
    stages: effectiveStages,
    statuses: finishStatuses(effectiveStages, success),
    currentIndex: 0,
    notes: [],
    startedAt: startedAt || new Date().toISOString(),
  }

  if (existingState) {
    state.statuses = finishStatuses(state.stages, success, state.statuses)
  }

  appendNotes(state, notes)
  return state
}

module.exports = {
  appendNotes,
  buildFinishState,
  finishStatuses,
  parseNotesJson,
}
```

- [ ] **Step 4: Update `report-to-lark/index.js` imports**

At the top of `plugins/report-to-lark/index.js`, add:

```js
const {
  buildFinishState,
  finishStatuses,
  parseNotesJson,
} = require('./reportCardState')
```

Remove the local `finishStatuses` function from `plugins/report-to-lark/index.js`.

- [ ] **Step 5: Add `--notes-json` CLI option**

In the CLI option chain in `plugins/report-to-lark/index.js`, after `--note-file`, add:

```js
        .option('--notes-json <json>', 'JSON array of note strings to append to the card')
```

- [ ] **Step 6: Use `buildFinishState` in `--card-finish`**

In the `if (opts.cardFinish)` block, replace state reconstruction with:

```js
            const passedStages = opts.stages ? opts.stages.split(',').map(s => s.trim()).filter(Boolean) : null
            const notes = parseNotesJson(opts.notesJson)
            if (noteText) notes.push(noteText)
            const state = buildFinishState({
              existingState: loadState(context.siteDir),
              title: opts.title || 'Build',
              stages: passedStages,
              status: opts.status,
              startedAt: opts.startedAt,
              notes,
            })
            await patchCard(token, messageId, state, FEISHU_HOST)
            return
```

- [ ] **Step 7: Run card-state tests**

Run:

```bash
node plugins/report-to-lark/reportCardState.test.js
```

Expected: all tests pass.

- [ ] **Step 8: Run smoke check for existing plugin syntax**

Run:

```bash
node -e "require('./plugins/report-to-lark/reportCardState'); require('./plugins/report-to-lark')"
```

Expected: command exits successfully.

- [ ] **Step 9: Commit**

```bash
git add plugins/report-to-lark/index.js plugins/report-to-lark/reportCardState.js plugins/report-to-lark/reportCardState.test.js
git commit -m "fix: preserve Feishu report card notes"
```

## Task 4: Collect Build Report Notes for Cross-job Card Finish

**Files:**
- Create: `scripts/collect-build-card-notes.js`
- Modify: `.github/workflows/fetch-docs-auto.yml`
- Modify: `.github/workflows/fetch-docs-manual.yml`

- [ ] **Step 1: Create note collector script**

Create `scripts/collect-build-card-notes.js`:

```js
const fs = require('node:fs')
const path = require('node:path')

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : ''
}

function compactMarkdown(markdown, maxLines = 80) {
  const lines = markdown.split(/\r?\n/)
  if (lines.length <= maxLines) return markdown
  return [
    ...lines.slice(0, maxLines),
    '',
    `...truncated ${lines.length - maxLines} lines. See committed report file for full details.`,
  ].join('\n')
}

function collectNotes() {
  const candidates = [
    'plugins/link-checks/meta/reports/latest.md',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md',
    'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.md',
  ]

  return candidates
    .map(file => {
      const content = readIfExists(file)
      if (!content) return null
      return `${compactMarkdown(content)}\n\nReport file: \`${file}\``
    })
    .filter(Boolean)
}

function writeGithubOutput(notes) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) return
  const value = JSON.stringify(notes)
  fs.appendFileSync(output, `card_notes_json<<CARD_NOTES_JSON\n${value}\nCARD_NOTES_JSON\n`)
}

const notes = collectNotes()
writeGithubOutput(notes)
process.stdout.write(JSON.stringify(notes, null, 2) + '\n')

module.exports = {
  collectNotes,
  compactMarkdown,
}
```

- [ ] **Step 2: Add fetch-job output to auto workflow**

In `.github/workflows/fetch-docs-auto.yml`, add this output under `jobs.fetch.outputs`:

```yaml
      card_notes_json: ${{ steps.card_notes.outputs.card_notes_json }}
```

- [ ] **Step 3: Add note collection step after SDK link checks in auto workflow**

In `.github/workflows/fetch-docs-auto.yml`, after the final `build and check sdk docs` step and before the final `commit to dev`, add:

```yaml
    - name: collect card report notes
      id: card_notes
      run: node scripts/collect-build-card-notes.js
```

- [ ] **Step 4: Pass notes to auto success/failure card finish**

In both `report failure` and `report success` commands in `.github/workflows/fetch-docs-auto.yml`, add:

```bash
          --notes-json '${{ needs.fetch.outputs.card_notes_json }}'
```

The success command should become:

```bash
npx docusaurus report-to-lark --card-finish --message-id ${{ needs.fetch.outputs.card_id }} --status success --started-at "${{ needs.fetch.outputs.card_started_at }}" --stages "${{ needs.fetch.outputs.card_stages }}" --title "${{ needs.fetch.outputs.card_title }}" --notes-json '${{ needs.fetch.outputs.card_notes_json }}'
```

- [ ] **Step 5: Apply the same changes to manual workflow**

Repeat Steps 2-4 in `.github/workflows/fetch-docs-manual.yml`.

- [ ] **Step 6: Run collector locally**

Run:

```bash
node scripts/collect-build-card-notes.js
```

Expected: prints a JSON array. In a clean checkout without generated reports, it may print `[]`.

- [ ] **Step 7: Run diff check**

Run:

```bash
git diff --check .github/workflows/fetch-docs-auto.yml .github/workflows/fetch-docs-manual.yml scripts/collect-build-card-notes.js
```

Expected: no whitespace errors.

- [ ] **Step 8: Commit**

```bash
git add scripts/collect-build-card-notes.js .github/workflows/fetch-docs-auto.yml .github/workflows/fetch-docs-manual.yml
git commit -m "fix: carry docs reports into final Feishu card"
```

## Task 5: Fix Translation Target Branch Resolution

**Files:**
- Modify: `.github/workflows/translate-codex.yml`

- [ ] **Step 1: Add dispatch input**

In `.github/workflows/translate-codex.yml`, under `workflow_dispatch.inputs`, add:

```yaml
      target_branch:
        description: "Branch to checkout and commit translations to."
        required: false
        default: ""
```

- [ ] **Step 2: Add branch resolution step**

Before checkout in `.github/workflows/translate-codex.yml`, add:

```yaml
    - name: resolve translation target branch
      id: target
      run: |
        TARGET="${{ github.event.inputs.target_branch || vars.TRANSLATION_TARGET_BRANCH || 'dev' }}"
        echo "branch=${TARGET}" >> "$GITHUB_OUTPUT"
        echo "Translation target branch: ${TARGET}"
```

- [ ] **Step 3: Use resolved branch for checkout**

Replace:

```yaml
    - name: checkout feat/zdoc-redesign branch
      uses: actions/checkout@v4
      with:
        ref: feat/zdoc-redesign
```

with:

```yaml
    - name: checkout translation target branch
      uses: actions/checkout@v4
      with:
        ref: ${{ steps.target.outputs.branch }}
```

- [ ] **Step 4: Use resolved branch for translation commits**

Replace:

```yaml
        branch: feat/zdoc-redesign
```

with:

```yaml
        branch: ${{ steps.target.outputs.branch }}
```

- [ ] **Step 5: Run workflow diff check**

Run:

```bash
git diff --check .github/workflows/translate-codex.yml
```

Expected: no whitespace errors.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/translate-codex.yml
git commit -m "fix: resolve translation target branch"
```

## Task 6: Verification

**Files:**
- Verify: all modified files

- [ ] **Step 1: Run focused unit tests**

Run:

```bash
node plugins/lark-docs/incrementalFetchPlanner.test.js
node plugins/report-to-lark/reportCardState.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Run existing related tests**

Run:

```bash
node plugins/link-checks/linkCheckReporter.test.js
node plugins/lark-docs/sourceSnapshot.test.js
```

Expected: all tests pass.

- [ ] **Step 3: Run YAML and whitespace checks**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 4: Inspect the final diff**

Run:

```bash
git diff -- .github/workflows/fetch-docs-auto.yml .github/workflows/fetch-docs-manual.yml .github/workflows/translate-codex.yml plugins/lark-docs/incrementalFetchPlanner.js plugins/report-to-lark scripts/collect-build-card-notes.js
```

Expected: diff shows only the planned changes.

- [ ] **Step 5: Manual CI expectations**

After pushing, verify:

```bash
gh run list --repo zilliztech/zdoc --workflow fetch-docs-auto.yml --limit 1
gh run list --repo zilliztech/zdoc --workflow translate-codex.yml --limit 1
```

Expected:

- fetch workflow completes successfully,
- Feishu final card still includes report notes,
- translate workflow no longer fails during checkout,
- if fetch is slow, the card includes an incremental plan note explaining why.

## Self-review

Spec coverage:

- Stale snapshot baseline branch mismatch without stale script execution is addressed in Task 1.
- Incremental missing-source fallback cause is addressed in Task 2.
- Feishu report note loss is addressed in Tasks 3 and 4.
- Missing link/canonical report attachment is addressed in Task 4.
- Localization checkout failure is addressed in Task 5.
- Verification is addressed in Task 6.

Placeholder scan:

- No placeholder markers or undefined implementation gaps remain.

Type consistency:

- `notes-json`, `card_notes_json`, `parseNotesJson`, and `buildFinishState` are named consistently across plugin, tests, and workflow.
