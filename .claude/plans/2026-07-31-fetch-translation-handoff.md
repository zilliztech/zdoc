# Fetch-to-Translation Workflow Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `fetch-docs.yml` source-only while allowing it to dispatch one `translate-codex.yml` run that translates Japanese and Chinese SDK targets in parallel and publishes all translation checkpoints serially.

**Architecture:** A tested handoff contract converts the selected source group and exact published source SHAs into translation units. `translate-codex.yml` owns all translation producers and publishers: producers run without branch writes, Japanese Guides keeps its recoverable batch path, and explicit publisher jobs form one deterministic chain. `fetch-docs.yml` waits only for source publication, dispatches the downstream workflow once, and records its run URL.

**Tech Stack:** GitHub Actions reusable workflows, Node.js 22, existing translation/checkpoint scripts, `node:test`, workflow policy tests, GitHub CLI.

---

## File map

- Modify `scripts/translation/selection.js`: produce canonical Japanese/Chinese translation units and publication order.
- Modify `scripts/translation/selection.test.js`: lock Guides exclusion from Chinese translation and paired SDK order.
- Create `scripts/docs-workflow/translation-handoff.js`: validate exact per-group source SHAs and render dispatch inputs.
- Create `scripts/docs-workflow/translation-handoff.test.js`: cover single-group, all-group, missing SHA, and Chinese Guides rejection.
- Modify `.github/workflows/translate-codex.yml`: become the single translation orchestrator.
- Modify `.github/workflows/_translate-content-group.yml`: make artifact names target-qualified so parallel locale producers cannot collide.
- Modify `.github/workflows/_publish-content-group.yml`: accept target-qualified artifacts without changing checkpoint validation semantics.
- Modify `.github/workflows/fetch-docs.yml`: remove embedded translation jobs and add one downstream dispatch job.
- Modify `scripts/validate-workflow-policy.js`: enforce the new workflow ownership and topology.
- Modify `scripts/validate-workflow-policy.test.js`: prove mutations cannot restore embedded translation or concurrent publication.
- Modify `scripts/docs-workflow/aggregate-results.js` and its test only where needed to report a downstream run URL instead of embedded translation jobs.

### Task 1: Define the translation selection and handoff contract

**Files:**
- Modify: `scripts/translation/selection.js`
- Modify: `scripts/translation/selection.test.js`
- Create: `scripts/docs-workflow/translation-handoff.js`
- Create: `scripts/docs-workflow/translation-handoff.test.js`

- [ ] **Step 1: Write failing selection-order tests**

Add tests asserting that `group=java, locale=all` expands to Japanese and Chinese producers, while `group=guides, locale=all` expands only to Japanese:

```js
test('pairs Japanese and Chinese SDK translations in publication order', () => {
  assert.deepEqual(
    buildTranslationSelection({locale: 'all', group: 'java'}).map(item => `${item.target}/${item.group}`),
    ['ja-JP/java', 'zh-CN-reference/java'],
  )
})

test('never selects Chinese Guides translation', () => {
  assert.deepEqual(
    buildTranslationSelection({locale: 'all', group: 'guides'}).map(item => `${item.target}/${item.group}`),
    ['ja-JP/guides'],
  )
})
```

- [ ] **Step 2: Run the tests and verify the current locale-first ordering fails**

Run:

```bash
node --test scripts/translation/selection.test.js
```

Expected: the new paired-order or Guides selection assertion fails.

- [ ] **Step 3: Implement canonical translation unit ordering**

Use this canonical order in `selection.js`:

```js
const GROUPS = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']

function targetsFor(group, locale) {
  if (locale === 'ja-JP') return ['ja-JP']
  if (locale === 'zh-CN') return group === 'guides' ? [] : ['zh-CN-reference']
  if (locale === 'all') return group === 'guides' ? ['ja-JP'] : ['ja-JP', 'zh-CN-reference']
  throw new Error(`Unsupported translation locale: ${locale}`)
}
```

For `group=all`, emit `ja-JP/guides`, then the Japanese/Chinese pair for each SDK group in `python`, `java`, `node`, `go`, `cli`, `rest` order. Preserve `sourceGroup` and add `publicationOrder` matching the array index.

Preserve the existing manual-only `zh-CN-reference/reference-landings` selection when the caller explicitly requests `locale=zh-CN, group=reference-landings`; it is not included in `group=all` and is never dispatched by `fetch-docs.yml`.

- [ ] **Step 4: Write failing handoff contract tests**

Define `buildTranslationHandoff({locale, group, toolingSha, targetBranch, sourceShas})`. Test exact SHA binding:

```js
test('binds both Java translation targets to the exact published Java source SHA', () => {
  const value = buildTranslationHandoff({
    locale: 'all', group: 'java', toolingSha: SHA_A, targetBranch: 'dev',
    sourceShas: {java: SHA_B},
  })
  assert.deepEqual(value.units.map(unit => [unit.target, unit.group, unit.sourceSha]), [
    ['ja-JP', 'java', SHA_B],
    ['zh-CN-reference', 'java', SHA_B],
  ])
})

test('rejects missing source identities before paid work', () => {
  assert.throws(() => buildTranslationHandoff({
    locale: 'all', group: 'java', toolingSha: SHA_A, targetBranch: 'dev', sourceShas: {},
  }), /missing source SHA for java/i)
})
```

- [ ] **Step 5: Implement and expose the handoff CLI**

The CLI accepts `--locale`, `--group`, `--tooling-sha`, `--target-branch`, `--source-shas-json`, and optional `--github-output`. It validates lowercase 40-character SHAs, safe target branch syntax, exact source coverage, and writes compact JSON:

```json
{
  "schemaVersion": 1,
  "locale": "all",
  "group": "java",
  "toolingSha": "...",
  "targetBranch": "dev",
  "units": [
    {"target":"ja-JP","group":"java","sourceGroup":"java","sourceSha":"...","publicationOrder":0},
    {"target":"zh-CN-reference","group":"java","sourceGroup":"java","sourceSha":"...","publicationOrder":1}
  ]
}
```

- [ ] **Step 6: Run focused tests and commit**

Run:

```bash
node --test scripts/translation/selection.test.js scripts/docs-workflow/translation-handoff.test.js
git diff --check
```

Expected: all tests pass.

Commit:

```bash
git add scripts/translation/selection.js scripts/translation/selection.test.js scripts/docs-workflow/translation-handoff.js scripts/docs-workflow/translation-handoff.test.js
git commit -m "feat(translation): define downstream handoff contract"
```

### Task 2: Make translation producer artifacts safe for parallel locales

**Files:**
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add a failing policy test for artifact-name collisions**

Assert every checkpoint, baseline, report, and recovery artifact name contains both `${{ inputs.target }}` and `${{ inputs.group }}`. The test must fail against names such as `translation-checkpoint-${group}-${run_id}`.

- [ ] **Step 2: Run the workflow policy test and verify failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: failure explaining that parallel locale producers can collide.

- [ ] **Step 3: Target-qualify all producer artifacts**

Use the same normalized identity in workflow outputs and upload steps:

```yaml
artifact_name: translation-checkpoint-${{ inputs.target }}-${{ inputs.group }}-${{ github.run_id }}
baseline_artifact_name: translation-baseline-${{ inputs.target }}-${{ inputs.group }}-${{ github.run_id }}
```

Apply the same target/group qualification to translation reports and recovery artifacts. Update consumers that construct these names; do not weaken artifact manifest validation.

- [ ] **Step 4: Run producer, checkpoint, and policy tests**

Run:

```bash
node --test scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/validate-workflow-policy.test.js
pnpm test:workflow-policy
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/_translate-content-group.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "refactor(translation): qualify parallel producer artifacts"
```

### Task 3: Turn `translate-codex.yml` into the translation orchestrator

**Files:**
- Modify: `.github/workflows/translate-codex.yml`
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `.github/workflows/_prepare-translation-batches.yml`
- Modify: `.github/workflows/_publish-translation-batches.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing topology tests**

Add policy assertions that:

```js
assert.doesNotMatch(translateCodex, /^concurrency:\s*[\s\S]*docs-production-dev/m)
assert.match(translateCodex, /strategy:[\s\S]*matrix:[\s\S]*fromJSON\(needs\.prepare\.outputs\.producer_matrix\)/)
assert.match(translateCodex, /publish_ja_guides:[\s\S]*publish_ja_python:[\s\S]*publish_zh_python:[\s\S]*publish_ja_java:[\s\S]*publish_zh_java:/)
```

Also assert every publisher after the first has the previous publisher in `needs`, ensuring publication cannot overlap.

- [ ] **Step 2: Run policy tests and verify failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: failures for missing producer matrix and publisher chain.

- [ ] **Step 3: Replace the single-target dispatch inputs**

Use these manual and callable inputs:

```yaml
locale:
  type: choice
  options: [all, ja-JP, zh-CN]
  default: all
group:
  type: choice
  options: [all, guides, python, java, node, go, cli, rest, reference-landings]
source_shas_json:
  type: string
  required: true
tooling_sha:
  type: string
  required: true
target_branch:
  type: string
  default: dev
mode:
  type: choice
  options: [auto, full, incremental]
  default: auto
publish:
  type: boolean
  default: false
recovery_run_ids_json:
  type: string
  required: false
  default: '{}'
```

The `prepare` job checks out `tooling_sha`, runs `translation-handoff.js`, and exposes `producer_matrix` plus exact per-unit source identities before secrets reach any producer.

- [ ] **Step 4: Add parallel SDK producer jobs**

Use one matrix reusable-workflow job with no publisher or branch-write dependency:

```yaml
translate_sdk:
  needs: prepare
  strategy:
    fail-fast: false
    matrix: ${{ fromJSON(needs.prepare.outputs.sdk_producer_matrix) }}
  uses: ./.github/workflows/_translate-content-group.yml
  with:
    target: ${{ matrix.target }}
    group: ${{ matrix.group }}
    bootstrap_group: ${{ matrix.group }}
    tooling_sha: ${{ needs.prepare.outputs.tooling_sha }}
    source_sha: ${{ matrix.sourceSha }}
    master_sha: ${{ needs.prepare.outputs.tooling_sha }}
    source_commit_sha: ${{ matrix.sourceSha }}
    should_translate: true
    max_files: '500'
    mode: ${{ inputs.mode }}
    recovery_run_id: ${{ matrix.recoveryRunId }}
```

Do not add dependencies between Japanese and Chinese producers.

- [ ] **Step 5: Move the Japanese Guides batch producer path into `translate-codex.yml`**

Reuse `_prepare-translation-batches.yml`, the existing batch producer, and `_publish-translation-batches.yml`. Select it only for `ja-JP/guides`. Keep pending-set identity, per-batch recovery artifacts, and exact source SHA validation unchanged.

- [ ] **Step 6: Add the deterministic publisher chain**

Declare explicit reusable publisher jobs in this order:

```text
publish_ja_guides
publish_ja_python -> publish_zh_python
publish_ja_java   -> publish_zh_java
publish_ja_node   -> publish_zh_node
publish_ja_go     -> publish_zh_go
publish_ja_cli    -> publish_zh_cli
publish_ja_rest   -> publish_zh_rest
```

Each job must include the previous publisher in `needs`, even when the previous unit is unselected; use `always()` plus selection outputs so skipped units preserve the queue. Each selected publisher downloads its deterministic target-qualified artifacts and calls `_publish-content-group.yml` with the unit's exact source SHA and group validation command.

- [ ] **Step 7: Remove workflow-level concurrency and retain publisher safety**

Translation producers must not use `docs-production-dev` concurrency. Publication remains protected by the explicit dependency chain and the current target-SHA/three-way merge checks in `_publish-content-group.yml`. Do not add `cancel-in-progress: true`.

- [ ] **Step 8: Add aggregate downstream reporting**

The final job reports each unit as `translated`, `recovered`, `published`, `failed`, or `skipped`, and includes recovery run IDs. A producer failure must still allow unrelated producers to upload recovery artifacts, but must prevent the serial publisher queue from advancing past the failed selected unit.

- [ ] **Step 9: Run workflow and translation tests**

Run:

```bash
node --test scripts/translation/selection.test.js scripts/docs-workflow/translation-batch-set.test.js scripts/docs-workflow/translation-batch-recovery.test.js scripts/docs-workflow/apply-checkpoint-artifact.test.js scripts/validate-workflow-policy.test.js
pnpm test:workflow-policy
git diff --check
```

Expected: all tests pass and policy confirms parallel producers plus serial publishers.

- [ ] **Step 10: Commit**

```bash
git add .github/workflows/translate-codex.yml .github/workflows/_publish-content-group.yml .github/workflows/_prepare-translation-batches.yml .github/workflows/_publish-translation-batches.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat(translation): orchestrate parallel locales and serial publish"
```

### Task 4: Reduce `fetch-docs.yml` to source production and one translation dispatch

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/docs-workflow/aggregate-results.js`
- Modify: `scripts/docs-workflow/aggregate-results.test.js`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing ownership tests**

Assert `fetch-docs.yml` contains none of the reusable translation implementations:

```js
for (const forbidden of [
  '_translate-content-group.yml',
  '_prepare-translation-batches.yml',
  '_publish-translation-batches.yml',
  '_publish-content-group.yml',
  'TRANSLATION_AGENT_API_KEY',
  'REVIEW_AGENT_API_KEY',
]) assert.doesNotMatch(fetchDocs, new RegExp(forbidden.replace('.', '\\.')))
```

Assert it contains exactly one dispatch of `translate-codex.yml` after the source publication barrier.

- [ ] **Step 2: Run the policy test and verify it fails against embedded translation jobs**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: failure listing embedded translation workflow references.

- [ ] **Step 3: Remove embedded translation jobs and dependencies**

Delete Guides translation batching, Japanese SDK translation, Chinese Reference translation, their publishers, translation barriers, and translation-specific final verification dependencies from `fetch-docs.yml`. Preserve all source producer, source publisher, Guides render/assembly, monitor, and source verification jobs.

- [ ] **Step 4: Build exact source handoff after publication**

Add a `prepare_translation_handoff` job that needs the source publication barrier and selected source publishers. It writes a JSON map using each publisher's committed SHA, falling back only to the authenticated `dev_baseline_sha` when the publisher reports `no_changes`:

```json
{
  "guides": "<publish_guides commit>",
  "python": "<publish_python commit>",
  "java": "<publish_java commit>",
  "node": "<publish_node commit>",
  "go": "<publish_go commit>",
  "cli": "<publish_cli commit>",
  "rest": "<publish_rest commit>"
}
```

Run `translation-handoff.js --locale all` to reject missing or mismatched identities before dispatch.

- [ ] **Step 5: Dispatch one downstream workflow**

Add a single job guarded by `run_translations == 'true' && publish == 'true'`:

```bash
run_url=$(gh workflow run translate-codex.yml \
  --repo "$GITHUB_REPOSITORY" \
  --ref "$WORKFLOW_REF" \
  -f locale=all \
  -f group="$SELECTED_GROUP" \
  -f source_shas_json="$SOURCE_SHAS_JSON" \
  -f tooling_sha="$TOOLING_SHA" \
  -f target_branch="$TARGET_BRANCH" \
  -f mode=auto \
  -f publish=true)
run_id=${run_url##*/}
printf 'run_url=%s\nrun_id=%s\n' "$run_url" "$run_id" >> "$GITHUB_OUTPUT"
```

Set `WORKFLOW_REF` from the current trusted workflow ref (`github.ref_name`) and validate it with the existing safe-ref helper. The downstream workflow definition is selected by that branch or tag, while all executable tooling is restored from the separate exact `tooling_sha`. Validate that `run_url` belongs to `github.com/<repository>/actions/runs/<positive integer>` before recording it.

- [ ] **Step 6: Update source-run reporting**

Replace embedded translation status fields with one downstream handoff report containing `requested`, `dispatched`, `run_id`, and `run_url`. The fetch run succeeds once the source workflow and dispatch succeed; downstream translation completion belongs to the downstream run.

- [ ] **Step 7: Run focused tests**

Run:

```bash
node --test scripts/docs-workflow/translation-handoff.test.js scripts/docs-workflow/aggregate-results.test.js scripts/validate-workflow-policy.test.js
pnpm test:workflow-policy
git diff --check
```

Expected: no embedded translation implementation remains and one exact downstream dispatch is required.

- [ ] **Step 8: Commit**

```bash
git add .github/workflows/fetch-docs.yml scripts/docs-workflow/aggregate-results.js scripts/docs-workflow/aggregate-results.test.js scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "refactor(workflow): hand translations to codex workflow"
```

### Task 5: Verify recovery, parallelism, and serial publication on the branch

**Files:**
- Modify only if a verification defect is found in files already listed above.

- [ ] **Step 1: Run the complete local policy suite**

```bash
node --test scripts/translation/*.test.js scripts/docs-workflow/apply-checkpoint-artifact.test.js scripts/docs-workflow/translation-batch-set.test.js scripts/docs-workflow/translation-batch-recovery.test.js scripts/docs-workflow/aggregate-results.test.js
pnpm test:workflow-policy
git diff --check
```

Expected: all tests pass.

- [ ] **Step 2: Dispatch an artifact-only source validation**

Run `fetch-docs.yml` from the exact branch SHA with:

```text
group=java
publish=false
run_translations=false
source_ref=dev
target_branch=dev
```

Expected: source validation succeeds and no translation workflow is dispatched.

- [ ] **Step 3: Dispatch a no-publication translation topology test**

Run `translate-codex.yml` with `locale=all`, `group=java`, exact source SHA JSON, `publish=false`, and recovery artifacts from the already completed Java run where compatible.

Expected: Japanese and Chinese producers are simultaneously runnable; neither writes to `dev`; recovery avoids repeated successful model calls.

- [ ] **Step 4: Verify serial publication with reusable artifacts**

After producer artifacts succeed, run the publication path with `publish=true`. Confirm from job timestamps that Japanese and Chinese publishers do not overlap and that the second publisher starts from the first publisher's resulting target SHA.

- [ ] **Step 5: Verify fetch handoff without repeating source work**

Run `fetch-docs.yml` with a single inexpensive or no-change SDK group, `publish=true`, and `run_translations=true`. Confirm it dispatches exactly one `translate-codex.yml` run and reports its URL, while no translation implementation job appears in the fetch run.

- [ ] **Step 6: Final branch checks and commit any test-only corrections**

```bash
git status --short
git log --oneline -5
git diff origin/codex/zh-cn-guides-direct-fetch...HEAD --check
```

Expected: clean worktree and only scoped workflow, contract, policy, and reporting changes.
