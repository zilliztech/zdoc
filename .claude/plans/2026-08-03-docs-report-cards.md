# Zilliz Cloud Docs Report Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale mixed source/translation Feishu report with independent `Zilliz Cloud Docs Build` and `Zilliz Cloud Docs Translation` cards that monitor real jobs, expose Chinese Guides progress, and link exact report artifacts.

**Architecture:** Keep job interpretation in JavaScript state builders and Card V2 rendering in `packages/docs-tooling/src/reporting/lark.ts`. The parent and child workflows each create a best-effort card and run an independent monitor; source handoff metadata and locale-qualified Guides metadata are fixed-schema artifacts. The source card terminates with the parent aggregate, while the translation card terminates with the child aggregate.

**Tech Stack:** GitHub Actions YAML, Node.js 22 CommonJS scripts and `node:test`, TypeScript Card V2 renderer with Vitest, Feishu Card V2, GitHub Actions REST API, pnpm.

---

## Evidence Anchors

- Source run `30771415941` uploaded two artifacts with the same name `docs-progress-metadata-30771415941`, proving the English/Chinese denominator collision.
- Translation run `30729813420` exposed SDK jobs as `translate_sdk (<target>, <group>, ...) / translate` and publishers as `publish_ja_<group>` / `publish_zh_<group>`.
- Translation run `30738338949` exposed Guides batches as `translate_guides_batches (<batch_index>, <batch_number>) / translate` and the Guides publisher as `publish_ja_guides / publish`.
- The current report collector accepts only a run-wide `#artifacts` URL, so artifact-only paths cannot open the exact locale artifact.

## File Map

- Modify `packages/docs-tooling/src/reporting/lark.ts`: validate and render tagged source and translation card states.
- Modify `packages/docs-tooling/src/reporting/lark.test.ts`: structural Card V2 tests for both approved layouts and header colors.
- Modify `scripts/docs-workflow/docs-progress-state.js`: derive real source-only phases plus independent English/Chinese Guides lanes and handoff.
- Modify `scripts/docs-workflow/docs-progress-state.test.js`: source state TDD coverage.
- Modify `scripts/docs-workflow/build-live-card-state.js` and `.test.js`: pass locale metadata and handoff state through the CLI boundary.
- Modify `scripts/docs-workflow/monitor-docs-progress.js` and `.test.js`: download two metadata artifacts plus validated handoff metadata and terminate with the source aggregate.
- Create `scripts/docs-workflow/translation-progress-state.js` and `.test.js`: classify real child jobs into phases, target summaries, and units.
- Create `scripts/docs-workflow/monitor-translation-progress.js` and `.test.js`: poll the child run and patch its independent card.
- Create `.github/workflows/_monitor-translation-progress.yml`: reusable child monitor job.
- Modify `.github/workflows/_fetch-guides-sources.yml`: locale-qualified progress artifacts and payloads.
- Modify `.github/workflows/fetch-docs.yml`: best-effort Build card, real phase names, handoff metadata artifact, exact report artifact links.
- Modify `.github/workflows/translate-codex.yml`: best-effort Translation card and child monitor wiring.
- Create `scripts/docs-workflow/resolve-card-artifact-links.js` and `.test.js`: resolve fixed artifact names to exact artifact-ID URLs.
- Modify `scripts/collect-build-card-notes.js` and `.test.js`: use the correct locale artifact URL and remove inline translation publication notes.
- Delete `scripts/docs-workflow/translation-publication-report.js` and `.test.js` after all callers are removed.
- Modify `scripts/validate-workflow-policy.js` and `.test.js`: enforce the new two-card boundary.

### Task 1: Tagged Card V2 states and approved layouts

**Files:**
- Modify: `packages/docs-tooling/src/reporting/lark.ts`
- Test: `packages/docs-tooling/src/reporting/lark.test.ts`

- [ ] **Step 1: Write failing renderer tests**

Add exact source and translation fixtures with these discriminators and assertions:

```ts
const sourceState = {
  kind: 'source', title: 'Zilliz Cloud Docs Build', overallStatus: 'success',
  startedAt: '2026-08-03T02:08:00.000Z', targetBranch: 'dev',
  phases: [{key: 'produce', label: 'Produce', done: 8, total: 8, status: 'completed'}],
  guides: [
    {id: 'guides-en', locale: 'en', label: 'English Guides', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: '14/14 tables'},
    {id: 'guides-zh-CN', locale: 'zh-CN', label: 'Chinese Guides', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: '11/11 tables'},
  ],
  items: [{id: 'python', label: 'Python SDK', phase: 'publish', status: 'completed', currentTask: 'Workflow completed', detail: null}],
  handoff: {status: 'completed', label: 'Translation dispatched', url: 'https://github.com/zilliztech/zdoc/actions/runs/2'},
  reports: [], links: [{label: 'Open source workflow', url: 'https://github.com/zilliztech/zdoc/actions/runs/1'}],
} as const

test('renders the approved bilingual Build card and white success tag', () => {
  const card = buildCardV2(sourceState)
  assert.equal(card.header.title.content, 'Zilliz Cloud Docs Build')
  assert.equal(card.header.text_tag_list[0].text.content, 'Succeeded')
  assert.equal(card.header.text_tag_list[0].color, 'green')
  assert.match(JSON.stringify(card), /English Guides/)
  assert.match(JSON.stringify(card), /Chinese Guides/)
  assert.match(JSON.stringify(card), /Completed SDK publications/)
  assert.match(JSON.stringify(card), /Translation dispatched/)
})
```

Add a translation fixture with `kind: 'translation'`, four phases, three target summaries, active units, completed units, and a parent workflow link. Assert the title, target labels, active unit blocks, and collapsed `Completed translation units` panel.

- [ ] **Step 2: Run the renderer test and verify RED**

Run: `pnpm vitest run packages/docs-tooling/src/reporting/lark.test.ts`

Expected: FAIL because `kind`, `guides`, `items`, `handoff`, `targets`, `units`, and `links` are not accepted or rendered.

- [ ] **Step 3: Implement the tagged state union and renderers**

Define exact bounded types:

```ts
type CardKind = 'source' | 'translation';
interface CardWorkItem { id: string; label: string; phase: string; status: PhaseStatus; currentTask: string; detail: string | null }
interface CardGuide extends CardWorkItem { locale: 'en' | 'zh-CN' }
interface CardLink { label: string; url: string }
interface CardTargetSummary { key: string; label: string; translate: CardMetric; publish: CardMetric }
interface CardMetric { done: number; total: number; status: PhaseStatus; detail: string | null }
interface SourceCardState extends CardStateBase { kind: 'source'; guides: CardGuide[]; items: CardWorkItem[]; handoff: CardHandoff | null; reports: CardReportInput[]; links: CardLink[] }
interface TranslationCardState extends CardStateBase { kind: 'translation'; targets: CardTargetSummary[]; units: CardWorkItem[]; reports: CardReportInput[]; links: CardLink[] }
type ExactCardState = SourceCardState | TranslationCardState | LegacyExactCardState;
```

Validate `https://github.com/<owner>/<repo>/actions/runs/<id>` links, bound every label/detail, and escape user-derived values. Render source Guides in a two-column set, non-completed SDK items as normal blocks, completed SDKs in a collapsed panel, and the handoff block after SDKs. Render translation target summaries before active units and collapse only completed units. Keep the native Card V2 header tag; setting `color: 'green'` produces the approved green tag with white Feishu text.

- [ ] **Step 4: Run renderer tests and typecheck**

Run: `pnpm vitest run packages/docs-tooling/src/reporting/lark.test.ts && pnpm typecheck`

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add packages/docs-tooling/src/reporting/lark.ts packages/docs-tooling/src/reporting/lark.test.ts
git commit -m "feat: render separate docs build and translation cards"
```

### Task 2: Real source workflow state with Chinese Guides

**Files:**
- Modify: `scripts/docs-workflow/docs-progress-state.js`
- Test: `scripts/docs-workflow/docs-progress-state.test.js`
- Modify: `scripts/docs-workflow/build-live-card-state.js`
- Test: `scripts/docs-workflow/build-live-card-state.test.js`

- [ ] **Step 1: Replace inline-translation expectations with failing source tests**

Add tests that pass both English and Chinese jobs, locale totals, and requested handoff:

```js
const state = deriveDocsProgressState({
  requestedGroups: ['guides', 'python'], publishEnabled: true, runTranslations: true,
  guideTableTotals: { en: 14, 'zh-CN': 11 },
  handoff: { status: 'completed', childRunId: 99, childRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/99' },
  jobs: [
    { id: 1, name: 'produce_guides_sources / fetch', status: 'completed', conclusion: 'success' },
    { id: 2, name: 'render_guides_tables / saas / Tools / render', status: 'in_progress', conclusion: null },
    { id: 3, name: 'produce_zh_guides_sources / fetch', status: 'completed', conclusion: 'success' },
    { id: 4, name: 'render_zh_guides_tables / saas / Tools / render', status: 'completed', conclusion: 'success' },
    { id: 5, name: 'produce_python / produce', status: 'completed', conclusion: 'success' },
  ],
})
assert.equal(state.kind, 'source')
assert.deepEqual(state.phases.map(phase => phase.key), ['produce', 'publish', 'verify', 'handoff'])
assert.deepEqual(state.guides.map(guide => [guide.locale, guide.detail]), [
  ['en', '0/14 complete · 1 active · 13 pending · 0 failed'],
  ['zh-CN', '1/11 complete · 0 active · 10 pending · 0 failed'],
])
assert.equal(state.items[0].id, 'python')
assert.equal(state.handoff.url, 'https://github.com/zilliztech/zdoc/actions/runs/99')
assert.doesNotMatch(JSON.stringify(state), /Publish translations|Translate manuals/)
```

Add tests for artifact-only omission of Publish/Verify/Handoff, handoff waiting/failure, independent locale failure, retry deduplication, and terminal normalization.

- [ ] **Step 2: Run source-state tests and verify RED**

Run: `node --test scripts/docs-workflow/docs-progress-state.test.js scripts/docs-workflow/build-live-card-state.test.js`

Expected: FAIL because the state is source/translation mixed and has no Chinese lane or handoff model.

- [ ] **Step 3: Implement source-only classification**

Replace `PHASES` with real source descriptors and add locale descriptors:

```js
const GUIDE_LANES = Object.freeze([
  { id: 'guides-en', locale: 'en', label: 'English Guides', prefix: '' },
  { id: 'guides-zh-CN', locale: 'zh-CN', label: 'Chinese Guides', prefix: 'zh_' },
])
const SOURCE_PHASES = Object.freeze([
  { key: 'produce', label: 'Produce' },
  { key: 'publish', label: 'Publish' },
  { key: 'verify', label: 'Verify' },
  { key: 'handoff', label: 'Handoff' },
])
```

Make `logicalJobIdentity()` retain locale for `render_zh_guides_tables`. Derive each Guides lane from its own source, render, assembly, and publisher names. Derive SDK lanes only through Produce/Publish. Add Handoff from `prepare_translation_handoff` and `dispatch_translations`, enriched by validated metadata when available. Return `{kind:'source', title:'Zilliz Cloud Docs Build', guides, items, handoff, phases, reports, links:[]}`.

- [ ] **Step 4: Pass exact inputs through `build-live-card-state.js`**

Accept `runTranslations`, `guideTableTotals`, and `handoff` and forward them unchanged to `deriveDocsProgressState`. Extend the CLI with optional `--guide-table-totals-json`, `--handoff-json`, and `--run-translations` flags.

- [ ] **Step 5: Run source-state tests**

Run: `node --test scripts/docs-workflow/docs-progress-state.test.js scripts/docs-workflow/build-live-card-state.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/docs-workflow/docs-progress-state.js scripts/docs-workflow/docs-progress-state.test.js scripts/docs-workflow/build-live-card-state.js scripts/docs-workflow/build-live-card-state.test.js
git commit -m "feat: report bilingual source workflow progress"
```

### Task 3: Locale metadata and source monitor handoff

**Files:**
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `scripts/docs-workflow/monitor-docs-progress.js`
- Test: `scripts/docs-workflow/monitor-docs-progress.test.js`
- Modify: `.github/workflows/fetch-docs.yml`

- [ ] **Step 1: Write failing metadata and monitor tests**

Change the validated metadata shape to:

```js
{ schemaVersion: 2, runId: 42, locale: 'en', tableTotal: 14 }
```

Test both `en` and `zh-CN`, reject mismatched locale, reject unknown keys, and assert the GitHub client requests:

```text
docs-progress-metadata-en-42
docs-progress-metadata-zh-CN-42
docs-translation-handoff-42
```

Add a monitor test where English metadata is available and Chinese metadata is missing; assert only English gets the stable denominator. Add a test that a validated handoff artifact updates the source card with the exact child URL.

- [ ] **Step 2: Run monitor tests and verify RED**

Run: `node --test scripts/docs-workflow/monitor-docs-progress.test.js`

Expected: FAIL because only one schema-v1 metadata artifact is supported and handoff metadata is not downloaded.

- [ ] **Step 3: Implement locale-qualified metadata**

In `_fetch-guides-sources.yml`, write schema v2 with `inputs.site` and upload:

```yaml
name: docs-progress-metadata-${{ inputs.site }}-${{ github.run_id }}
```

In the monitor, cache a map keyed by locale. Expose `downloadProgressMetadata(locale)` and `downloadHandoffMetadata()`. Validate handoff metadata as exact schema v1 with `parentRunId`, `childRunId`, and authenticated `childRunUrl`.

- [ ] **Step 4: Make source card creation best effort and upload handoff metadata**

In `fetch-docs.yml`:

- set the title to `Zilliz Cloud Docs Build`;
- create only Produce/Publish/Verify/Handoff stage labels;
- mark the create step `continue-on-error: true`;
- guard `monitor_docs_progress` with `needs.prepare.outputs.card_id != ''`;
- after resolving `run_id` and `run_url`, write and best-effort upload `docs-translation-handoff-${{ github.run_id }}` containing the fixed schema;
- pass `RUN_TRANSLATIONS` into the source monitor.

- [ ] **Step 5: Run monitor and workflow-policy tests**

Run: `node --test scripts/docs-workflow/monitor-docs-progress.test.js scripts/validate-workflow-policy.test.js`

Expected: monitor tests PASS; policy tests may remain RED until Task 7 updates the policy contract, but no source-monitor behavior test may fail.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/_fetch-guides-sources.yml .github/workflows/fetch-docs.yml scripts/docs-workflow/monitor-docs-progress.js scripts/docs-workflow/monitor-docs-progress.test.js
git commit -m "feat: monitor source handoff and locale progress"
```

### Task 4: Translation progress state from real child jobs

**Files:**
- Create: `scripts/docs-workflow/translation-progress-state.js`
- Create: `scripts/docs-workflow/translation-progress-state.test.js`
- Create fixtures under: `scripts/docs-workflow/fixtures/translation-progress/`

- [ ] **Step 1: Add failing fixtures and tests from real runs**

Create bounded fixtures using job names observed in runs `30729813420` and `30738338949`. Test:

```js
const state = deriveTranslationProgressState({
  selectedUnits: [
    {target: 'ja-JP', group: 'guides'},
    {target: 'ja-JP', group: 'python'},
    {target: 'zh-CN-reference', group: 'python'},
  ],
  publishEnabled: true,
  jobs,
})
assert.equal(state.kind, 'translation')
assert.equal(state.title, 'Zilliz Cloud Docs Translation')
assert.deepEqual(state.phases.map(phase => phase.key), ['prepare', 'translate', 'publish', 'aggregate'])
assert.deepEqual(state.targets.map(target => target.key), ['ja-guides', 'ja-sdks', 'zh-reference-sdks'])
assert.ok(state.units.some(unit => unit.id === 'ja-JP/python'))
assert.ok(state.units.some(unit => unit.id === 'zh-CN-reference/python'))
```

Add tests for Guides batch detail, failed SDK producer, serial publisher waiting labels, skipped unselected publishers, newest retry selection, prepare failure, and aggregate terminal normalization.

- [ ] **Step 2: Run the new tests and verify RED**

Run: `node --test scripts/docs-workflow/translation-progress-state.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement translation job parsing**

Export:

```js
module.exports = {
  deriveTranslationProgressState,
  parseGuidesBatchJob,
  parseSdkTranslationJob,
  selectEffectiveTranslationJobs,
}
```

Parse SDK matrix names with a bounded regex anchored at `translate_sdk (` and use only the first two matrix values as target/group. Parse Guides batch index/number from `translate_guides_batches (<index>, <number>) / translate`. Map publisher identities explicitly: `publish_ja_guides`, plus `publish_ja_python`, `publish_zh_python`, `publish_ja_java`, `publish_zh_java`, `publish_ja_node`, `publish_zh_node`, `publish_ja_go`, `publish_zh_go`, `publish_ja_cli`, `publish_zh_cli`, `publish_ja_rest`, and `publish_zh_rest`. Never infer a selected unit from a skipped publisher; selection comes from validated handoff input.

- [ ] **Step 4: Run translation-state tests**

Run: `node --test scripts/docs-workflow/translation-progress-state.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/docs-workflow/translation-progress-state.js scripts/docs-workflow/translation-progress-state.test.js scripts/docs-workflow/fixtures/translation-progress
git commit -m "feat: derive downstream translation card state"
```

### Task 5: Independent Translation card monitor

**Files:**
- Create: `scripts/docs-workflow/monitor-translation-progress.js`
- Create: `scripts/docs-workflow/monitor-translation-progress.test.js`
- Create: `.github/workflows/_monitor-translation-progress.yml`
- Modify: `.github/workflows/translate-codex.yml`

- [ ] **Step 1: Write failing monitor tests**

Test heartbeat patching, aggregate terminal status, parent URL derivation, cancellation, retry behavior, and configuration validation. The configuration must accept only a `request_id` matching `<parent_run_id>-<parent_run_attempt>` and build:

```text
https://github.com/zilliztech/zdoc/actions/runs/<parent_run_id>
```

Assert that card patch failure logs a bounded warning and does not stop polling.

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test scripts/docs-workflow/monitor-translation-progress.test.js`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the translation monitor**

Reuse the tested GitHub Jobs client and card patcher exported by `monitor-docs-progress.js`. Validate `handoff_json` with `translation-handoff.js`, reduce units to `{target, group}`, derive state with `deriveTranslationProgressState`, add the parent workflow link, and patch until the child aggregate completes.

- [ ] **Step 4: Wire the child workflow**

Add `initialize_translation_card` to `translate-codex.yml`. It checks out `${{ github.sha }}`, installs frozen dependencies, and invokes:

```bash
pnpm docs-tooling report-card create \
  --title "Zilliz Cloud Docs Translation" \
  --stages "Prepare,Translate,Publish,Aggregate" \
  --target-branch "$TARGET_BRANCH"
```

The create step is `continue-on-error: true`; the job always emits empty-safe `card_id` and `card_started_at` outputs. Add `monitor_translation_progress` using `_monitor-translation-progress.yml`, guarded by a non-empty card ID. It depends only on card initialization and must not appear in `aggregate.needs`.

- [ ] **Step 5: Run translation monitor tests and parse workflows**

Run: `node --test scripts/docs-workflow/monitor-translation-progress.test.js && node -e "require('js-yaml').load(require('node:fs').readFileSync('.github/workflows/translate-codex.yml','utf8'))"`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/docs-workflow/monitor-translation-progress.js scripts/docs-workflow/monitor-translation-progress.test.js .github/workflows/_monitor-translation-progress.yml .github/workflows/translate-codex.yml
git commit -m "feat: add independent translation progress card"
```

### Task 6: Exact artifact links and retired report cleanup

**Files:**
- Create: `scripts/docs-workflow/resolve-card-artifact-links.js`
- Create: `scripts/docs-workflow/resolve-card-artifact-links.test.js`
- Modify: `scripts/collect-build-card-notes.js`
- Modify: `scripts/collect-build-card-notes.test.js`
- Modify: `.github/workflows/fetch-docs.yml`
- Delete: `scripts/docs-workflow/translation-publication-report.js`
- Delete: `scripts/docs-workflow/translation-publication-report.test.js`

- [ ] **Step 1: Write failing resolver and collector tests**

Test exact URLs:

```js
assert.deepEqual(resolveArtifactLinks({ repository: 'zilliztech/zdoc', runId: 42, artifacts: [
  {id: 100, name: 'docs-checkpoint-guides-en-42-reports', expired: false},
  {id: 101, name: 'docs-checkpoint-guides-zh-CN-42-reports', expired: false},
]}), {
  en: 'https://github.com/zilliztech/zdoc/actions/runs/42/artifacts/100',
  'zh-CN': 'https://github.com/zilliztech/zdoc/actions/runs/42/artifacts/101',
})
```

Collector tests must assert English notes use only the English URL, Chinese notes use only the Chinese URL, no note contains `#artifacts`, and no source card note contains `Guides translation publication`.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test scripts/docs-workflow/resolve-card-artifact-links.test.js scripts/collect-build-card-notes.test.js`

Expected: FAIL because the resolver does not exist and the collector uses one run-wide URL.

- [ ] **Step 3: Implement exact artifact resolution**

Validate repository, run ID, artifact IDs, expiry, duplicate names, and expected fixed names. Write `en_url` and `zh_cn_url` to `GITHUB_OUTPUT`. In the aggregate workflow, fetch all run artifacts with `gh api`, call the resolver, and pass `CARD_REPORT_ARTIFACT_URL_EN` / `CARD_REPORT_ARTIFACT_URL_ZH_CN` to the collector.

Change `reportFileLine()` and `runtimeReportFileLine()` to receive the locale-specific URL from the report-set configuration. Accept only exact `/actions/runs/<run>/artifacts/<artifact_id>` URLs. Fall back to plain code plus one bounded missing-link attention note.

- [ ] **Step 4: Remove retired inline translation publication collection**

Delete the publication-report reader, environment variables, aggregate download step, and standalone module/tests. Keep translation publication status solely in the Translation card state.

- [ ] **Step 5: Run resolver and collector tests**

Run: `node --test scripts/docs-workflow/resolve-card-artifact-links.test.js scripts/collect-build-card-notes.test.js scripts/docs-workflow/monitor-docs-progress.test.js`

Expected: PASS, including the formerly failing monitor assertion.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/fetch-docs.yml scripts/collect-build-card-notes.js scripts/collect-build-card-notes.test.js scripts/docs-workflow/resolve-card-artifact-links.js scripts/docs-workflow/resolve-card-artifact-links.test.js scripts/docs-workflow/translation-publication-report.js scripts/docs-workflow/translation-publication-report.test.js
git commit -m "fix: link exact docs report artifacts"
```

### Task 7: Workflow policy and integrated regression suite

**Files:**
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing policy assertions**

Require:

- Build and Translation titles;
- best-effort card creation in both workflows;
- locale-qualified progress metadata artifacts;
- one source monitor and one translation monitor;
- source monitor receives `run_translations`;
- translation monitor is absent from child aggregate dependencies;
- handoff metadata artifact fixed name/schema;
- exact artifact resolver runs before report collection;
- no `#artifacts`, source inline translation phases, or retired publication report references.

- [ ] **Step 2: Run policy tests and verify RED**

Run: `node --test scripts/validate-workflow-policy.test.js`

Expected: FAIL until validator logic matches the new workflow contract.

- [ ] **Step 3: Implement minimal validator updates**

Update only the reporting-related checks. Preserve all unrelated publication, translation, security, and recovery policies.

- [ ] **Step 4: Run focused and full reporting tests**

Run:

```bash
node --test \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/docs-workflow/build-live-card-state.test.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  scripts/docs-workflow/translation-progress-state.test.js \
  scripts/docs-workflow/monitor-translation-progress.test.js \
  scripts/docs-workflow/resolve-card-artifact-links.test.js \
  scripts/collect-build-card-notes.test.js \
  scripts/validate-workflow-policy.test.js
pnpm vitest run packages/docs-tooling/src/reporting/lark.test.ts
pnpm typecheck
```

Expected: all commands exit 0 with zero failures.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test: enforce separate docs report cards"
```

### Task 8: Full local real-artifact replay

**Files:**
- No production-file changes unless a replay exposes a reproduced defect; any defect requires a new failing test before a fix.
- Preserve evidence under a resolved `/tmp` replay root and record its path in the final handoff.

- [ ] **Step 1: Select one retained representative source run**

Use a run whose eight checkpoint artifacts and both locale report artifacts share one `devBaselineSha`. Record source run ID, tooling SHA, baseline SHA, artifact IDs, and exact artifact URLs. Stop if any required artifact is expired or based on a different baseline.

- [ ] **Step 2: Download and preflight all artifacts**

Download Java, Node, Go, CLI, REST, Python, English Guides, Chinese Guides, and both locale report artifacts. Run `preflight-checkpoint-archive.js` against every `checkpoint-group.tar` before extraction.

- [ ] **Step 3: Replay publication against an isolated bare remote**

Create the bare remote with `dev` at the recorded baseline. Run `publish-checkpoint.sh` in production order: Java, Node, Go, CLI, REST, Python, English Guides, Chinese Guides. Match workflow commit messages, validation commands, and environment; set `ZDOC_SITE=zh-CN` only for Chinese Guides.

Expected: every lane is `published` or `no_changes`.

- [ ] **Step 4: Run the publication barrier and exact final validation**

Run the source publication barrier, materialize final `dev` with `restore-generated-state.sh --exact`, then run:

```bash
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
```

Expected: all commands exit 0.

- [ ] **Step 5: Replay card collection and rendering**

Use isolated `en` and `zh-CN` report directories and the exact artifact-ID URLs. Require exactly nine notes: one workflow summary, four English Guides sections, and four Chinese Guides sections, with no `Unavailable` and no `#artifacts`. Build representative source and translation exact states and render both Card V2 JSON payloads locally.

- [ ] **Step 6: Run final verification**

Run `git diff --check`, the complete focused suite from Task 7, `pnpm test:workflow-policy`, and inspect `git status --short`. Record test counts, replay root, final SHA, lane statuses, note count, artifact URLs, and card JSON paths.

- [ ] **Step 7: Commit any replay-only test fixture updates**

If no fixture update is needed, do not create an empty commit. If a real defect was fixed through TDD, commit only its tested code and fixture changes with a scoped message.
