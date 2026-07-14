# Guides Source Cache and Sidebar Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore and verify a complete ignored guides source graph before incremental fetching, fall back safely to a full fetch, and prevent publication when generated sidebars do not exactly cover publishable generated docs.

**Architecture:** A snapshot-keyed GitHub Actions cache seeds the guides source job, while a new validator proves that the cached source files match the committed last-success snapshot. Cache misses or invalid caches force a full fetch; renderers require a complete per-run source artifact before regenerating sidebars; assembly checks exact source/sidebar/docs coverage before promoting the snapshot and saving the next cache.

**Tech Stack:** Node.js 20, `node:test`, GitHub Actions cache v4, Docusaurus, existing Lark source snapshots and guides stage artifacts, SHA-256 manifests.

---

### Task 1: Define the source completeness contract

**Files:**
- Create: `plugins/lark-docs/sourceCompleteness.js`
- Create: `plugins/lark-docs/sourceCompleteness.test.js`

- [ ] **Step 1: Write failing tests for a complete source graph**

Create a temporary fixture containing a root source, two canonical source files, and a schema-v2 snapshot. Import the planned API:

```js
const {
  hashSnapshot,
  validateSourceCompleteness,
} = require('./sourceCompleteness')
```

Assert:

```js
const result = validateSourceCompleteness({
  manual: 'guides',
  buildEnv: 'uat',
  rootToken: 'root-token',
  sourceDir,
  snapshot,
})

assert.equal(result.complete, true)
assert.equal(result.expectedCanonicalSources, 2)
assert.equal(result.validCanonicalSources, 2)
assert.match(result.snapshotHash, /^[0-9a-f]{64}$/)
assert.deepEqual(result.missingFiles, [])
```

- [ ] **Step 2: Add failing corruption and safety cases**

Add individual tests for missing root source, root without children, missing canonical file, invalid JSON, source hash mismatch, token mismatch, symlinked source file, a `source_file` outside the source directory, wrong manual, and wrong build environment. Each test must assert `complete === false` and the specific result collection containing the error.

- [ ] **Step 3: Run the tests and verify the module is missing**

```bash
node --test plugins/lark-docs/sourceCompleteness.test.js
```

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 4: Implement deterministic snapshot hashing and validation**

Export:

```js
function hashSnapshot(snapshot) { /* stable JSON SHA-256 */ }
function validateSourceCompleteness(options) { /* structured result */ }
function assertSourceCompleteness(options) { /* throw with bounded summary */ }
```

Use `lstatSync`, `realpathSync`, and path containment checks. Accept canonical token aliases from `doc_token`, `node_token`, `origin_node_token`, and `obj_token`. Validate `source_hash` only when present so older valid snapshots can trigger a controlled full-fetch migration rather than an opaque crash.

- [ ] **Step 5: Run the source completeness tests**

```bash
node --test plugins/lark-docs/sourceCompleteness.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the completeness contract**

```bash
git add plugins/lark-docs/sourceCompleteness.js plugins/lark-docs/sourceCompleteness.test.js
git commit -m "feat: validate complete Lark source snapshots"
```

### Task 2: Make incremental mode conditional on a verified source graph

**Files:**
- Modify: `plugins/lark-docs/index.js`
- Modify: `plugins/lark-docs/incrementalFetchPlanner.js`
- Modify: `plugins/lark-docs/incrementalFetchPlanner.test.js`
- Modify: `plugins/lark-docs/regression.test.js`

- [ ] **Step 1: Add failing planner tests for absent and incomplete caches**

Extend the planner input with:

```js
sourceCompleteness: {
  complete: false,
  reason: 'missing-source-cache',
}
```

Assert that a requested incremental run returns `mode: 'full'` and includes `source-cache-incomplete` in its warnings/reasons. Add the corresponding `complete: true` test and assert that unchanged records still return `mode: 'incremental'` with zero expanded tokens.

- [ ] **Step 2: Run planner tests and verify failure**

```bash
node --test plugins/lark-docs/incrementalFetchPlanner.test.js
```

Expected: FAIL because planner mode does not consider source completeness.

- [ ] **Step 3: Pass completeness into incremental planning**

In `planIncrementalSourceFetch()`, load the configured last-success snapshot, validate the current source directory, and pass the structured result to `planIncrementalFetch`. A missing snapshot remains the existing full-fetch case. An existing snapshot with an incomplete source directory must also select full mode.

- [ ] **Step 4: Assert completeness after fetching**

After `fullSourceFetch()` or `fetch_source_tokens(...)`, create the candidate snapshot in memory and call `assertSourceCompleteness` against that candidate before writing `guides-source-snapshot-candidate.json`. Do not create a source artifact candidate when this assertion fails.

- [ ] **Step 5: Add a regression test reproducing the July 12 failure**

Create a fixture with a valid last-success snapshot, no source JSON, zero changed records, and existing generated Markdown. Assert that the selected fetch mode is full and that sidebar generation is never invoked against virtual navigation-only sources.

- [ ] **Step 6: Run focused tests**

```bash
node --test plugins/lark-docs/sourceCompleteness.test.js plugins/lark-docs/incrementalFetchPlanner.test.js plugins/lark-docs/regression.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit safe incremental fallback**

```bash
git add plugins/lark-docs/index.js plugins/lark-docs/incrementalFetchPlanner.js plugins/lark-docs/incrementalFetchPlanner.test.js plugins/lark-docs/regression.test.js
git commit -m "fix: require complete sources for incremental guides fetches"
```

### Task 3: Add a validated cross-run guides source cache

**Files:**
- Create: `scripts/docs-workflow/guides-source-cache.js`
- Create: `scripts/docs-workflow/guides-source-cache.test.js`
- Modify: `scripts/docs-workflow/guides-stage-artifact.js`
- Modify: `scripts/docs-workflow/guides-stage-artifact.test.js`

- [ ] **Step 1: Write failing cache-manifest tests**

Define CLI and module operations:

```text
create --source-dir <dir> --snapshot <file> --output <manifest>
validate --source-dir <dir> --snapshot <file> --manifest <manifest>
key --snapshot <file>
```

Assert that `key` prints `guides-source-v1-<64 hex>`. Assert that `create` records only regular JSON source files with size and SHA-256, and that `validate` rejects tampering, missing files, extra manifest paths, symlinks, traversal, wrong manual/build environment, and a snapshot hash mismatch.

- [ ] **Step 2: Run tests and verify failure**

```bash
node --test scripts/docs-workflow/guides-source-cache.test.js
```

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement cache manifest creation, validation, and key derivation**

Reuse `validateSourceCompleteness` rather than duplicating snapshot semantics. Write the manifest atomically and sort file entries by repository-relative path. Export `sourceCacheKey(snapshot)`, `createSourceCacheManifest(options)`, and `validateSourceCache(options)`.

- [ ] **Step 4: Require complete sources in source stage artifacts**

Extend `createGuidesStageArtifact` for `stage === 'source'` with optional `snapshotCandidatePath` and `rootToken`. Before collecting files, assert that the candidate snapshot and source directory are complete. Preserve existing generic artifact validation for SaaS and BYOC.

- [ ] **Step 5: Run cache and artifact tests**

```bash
node --test scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-stage-artifact.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit cache integrity support**

```bash
git add scripts/docs-workflow/guides-source-cache.js scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-stage-artifact.js scripts/docs-workflow/guides-stage-artifact.test.js
git commit -m "feat: package verified guides source caches"
```

### Task 4: Guard sidebar generation at render time

**Files:**
- Modify: `plugins/lark-docs/index.js`
- Modify: `scripts/docs-workflow/run-content-group.js`
- Modify: `scripts/docs-workflow/run-content-group.test.js`
- Modify: `plugins/lark-docs/regression.test.js`

- [ ] **Step 1: Add a failing render-guard test**

Construct a source artifact containing navigation JSON but omitting one canonical source required by the candidate snapshot. Run the SaaS render command through an injected runner and assert that it fails before `writer.generate_sidebar` or any sidebar file write.

- [ ] **Step 2: Add the candidate snapshot to render-stage inputs**

Require renderer stages to receive `plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json` from the source artifact. Before any target output cleanup or document writing, call `assertSourceCompleteness` using the candidate snapshot and target-independent guides source directory.

- [ ] **Step 3: Preserve the baseline sidebar on guard failure**

Ensure the completeness assertion occurs before `utils.pre_process_file_paths`, `cleanupRemovedIncrementalRecords`, and `fs.writeFileSync(effectiveSidebarPath, ...)`. The thrown message must include expected/valid source counts and bounded missing/corrupt samples.

- [ ] **Step 4: Run render tests**

```bash
node --test scripts/docs-workflow/run-content-group.test.js plugins/lark-docs/regression.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit render-time protection**

```bash
git add plugins/lark-docs/index.js scripts/docs-workflow/run-content-group.js scripts/docs-workflow/run-content-group.test.js plugins/lark-docs/regression.test.js
git commit -m "fix: block sidebar generation from partial sources"
```

### Task 5: Validate exact sidebar, source, and generated-doc coverage

**Files:**
- Create: `scripts/validate-guides-coverage.js`
- Create: `scripts/validate-guides-coverage.test.js`
- Modify: `scripts/validate-generated-sidebars.js`
- Modify: `package.json`

- [ ] **Step 1: Write a failing reproduction test**

Create a fixture with three publishable canonical sources and three Markdown files but a sidebar containing one doc ID. Assert failure containing:

```text
expected publishable docs: 3
sidebar docs/refs: 1
generated docs: 3
missing from sidebar: 2
```

- [ ] **Step 2: Add exact exclusion-contract tests**

Cover link placements, ref placements, `agentsSidebar`, `releasesSidebar`, `hide` and `hideCategoriesDeep` overrides, and category index pages. Assert that only explicitly excluded IDs are removed from the expected set. Do not use minimum counts or percentage thresholds.

- [ ] **Step 3: Run tests and verify failure**

```bash
node --test scripts/validate-guides-coverage.test.js
```

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 4: Implement target-aware coverage validation**

Export:

```js
function collectSidebarIds(sidebar) {}
function collectGeneratedDocIds(outputDir, contentRoot) {}
function collectExpectedGuideIds({ sourceDir, target, overrides }) {}
function validateGuidesCoverage(options) {}
```

Provide CLI defaults for SaaS and BYOC. Resolve IDs using the same parent-token and category-index rules as `larkDocWriter`; extract shared path logic into a small exported helper if necessary so validation and generation cannot drift.

- [ ] **Step 5: Wire coverage into generated-sidebar validation**

Keep duplicate validation for all generated sidebars. When the guides candidate snapshot and source tree are available, additionally validate:

```text
zilliz.saas -> docs/tutorials + guides.sidebar.js
zilliz.paas -> docs-byoc/tutorials + guides-byoc.sidebar.js
```

Add `test:guides-coverage` to `package.json` for the unit suite.

- [ ] **Step 6: Run coverage and existing sidebar tests**

```bash
node --test scripts/validate-guides-coverage.test.js
node scripts/validate-generated-sidebars.js
```

Expected: unit tests PASS. The repository command may initially FAIL against the known sparse checked-in sidebar; record this as the expected red state until Task 7 regenerates it from a full source fetch.

- [ ] **Step 7: Commit coverage validation**

```bash
git add scripts/validate-guides-coverage.js scripts/validate-guides-coverage.test.js scripts/validate-generated-sidebars.js package.json
git commit -m "test: enforce generated guides sidebar coverage"
```

### Task 6: Restore and save the source cache in GitHub Actions

**Files:**
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `.github/workflows/_render-guides-target.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/sdk-reference-workflow.test.js`

- [ ] **Step 1: Add failing workflow-policy assertions**

Assert that the source workflow:

- computes the cache key from `guides-uat-last-success.json`;
- restores only `plugins/lark-docs/meta/sources/guides` and its cache manifest;
- validates a cache hit before invoking the source stage;
- deletes an invalid restored cache before fetching;
- invokes the source stage with `--forceFullFetch` on a cache miss or validation failure;
- permits incremental mode only after an exact cache hit passes completeness validation;
- uploads a source artifact only after candidate completeness succeeds.

Assert that assembly saves a new cache only after combined coverage validation, build success, and snapshot promotion. Assert that render jobs validate candidate completeness before invoking their target stage.

- [ ] **Step 2: Run policy tests and verify failure**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
```

Expected: FAIL because cache and completeness steps are absent.

- [ ] **Step 3: Add cache restore to `_fetch-guides-sources.yml`**

Use `actions/cache/restore@v4` with the exact snapshot-derived key and no broad restore prefix. On a hit, run `guides-source-cache.js validate`. On a miss or validation failure, remove the source directory and explicitly invoke the source command in forced-full mode. Never treat the cache action's hit output alone as proof of completeness.

Build the command explicitly so the bootstrap behavior is visible in logs:

```bash
fetch_args=(--group guides --stage source)
if [[ "$SOURCE_CACHE_VALID" != true ]]; then
  fetch_args+=(--force-full-fetch)
fi
node scripts/docs-workflow/run-content-group.js "${fetch_args[@]}"
```

Extend `run-content-group.js` argument parsing so `--force-full-fetch` is accepted only for `--group guides --stage source` and appends `--forceFullFetch` to the Docusaurus command. A missing or invalid cache must therefore perform a full fetch by construction, not merely by planner inference.

- [ ] **Step 4: Validate source and render artifacts**

Require the source workflow to run completeness validation against the candidate snapshot before artifact creation. Require both target workflows to repeat the check immediately after restoring the source artifact and before rendering.

- [ ] **Step 5: Add post-assembly cache save**

After coverage validation, full build, and snapshot promotion, create `guides-manifest.json`, compute the promoted snapshot key, and use `actions/cache/save@v4`. Set cache saving to non-fatal while retaining manifest creation and validation as fatal correctness checks.

- [ ] **Step 6: Run workflow tests**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
node scripts/validate-workflow-policy.js
```

Expected: PASS.

- [ ] **Step 7: Commit workflow cache integration**

```bash
git add .github/workflows/_fetch-guides-sources.yml .github/workflows/_assemble-guides.yml .github/workflows/_render-guides-target.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
git commit -m "ci: restore verified guides sources before incremental fetches"
```

### Task 7: Regenerate complete sidebars and verify the full system

**Files:**
- Modify: `config/generated/guides.sidebar.js`
- Modify: `config/generated/guides-byoc.sidebar.js`
- Modify as generated: `docs/**`
- Modify as generated: `docs-byoc/**`
- Modify: `plugins/lark-docs/meta/snapshots/guides-uat-last-success.json`

- [ ] **Step 1: Run a forced full guides source fetch**

With required Feishu credentials available, run:

```bash
pnpm docusaurus fetch-lark-docs --manual guides --sourceOnly --forceFullFetch --buildEnv uat --snapshotCandidatePath plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json
```

Expected: all canonical sources are fetched and candidate completeness passes.

This is the required bootstrap path for the first run after deployment. Do not seed the new cache from the current partial source state or skip this step because a last-success metadata snapshot exists.

- [ ] **Step 2: Render both targets from the complete source graph**

```bash
node scripts/docs-workflow/run-content-group.js --group guides --stage saas
node scripts/docs-workflow/run-content-group.js --group guides --stage byoc
```

Expected: both sidebars contain the complete publishable target sets rather than incremental deltas.

- [ ] **Step 3: Run exact coverage validation**

```bash
node scripts/validate-generated-sidebars.js
```

Expected: PASS with matching expected, sidebar, and generated-doc counts for SaaS and BYOC.

- [ ] **Step 4: Run focused and workflow tests**

```bash
node --test plugins/lark-docs/sourceCompleteness.test.js plugins/lark-docs/incrementalFetchPlanner.test.js plugins/lark-docs/regression.test.js scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/validate-guides-coverage.test.js scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js
```

Expected: PASS.

- [ ] **Step 5: Run the production build**

```bash
node scripts/run-doc-build-stage.js --build "pnpm run build" --skipLinkChecks --skipCardReporting
```

Expected: PASS.

- [ ] **Step 6: Commit the regenerated complete state**

Review generated changes before staging, then run:

```bash
git add config/generated/guides.sidebar.js config/generated/guides-byoc.sidebar.js docs docs-byoc plugins/lark-docs/meta/snapshots/guides-uat-last-success.json
git commit -m "docs: regenerate complete guides sidebars"
```

### Task 8: Verify cache miss and cache hit on a disposable branch

**Files:**
- No repository changes expected unless verification exposes a defect.

- [ ] **Step 1: Trigger a publish-disabled disposable-branch run with an empty cache key**

Expected evidence in logs:

```text
source cache: miss
source completeness: incomplete
fetch mode: forced full bootstrap
source completeness after fetch: complete
guides coverage: pass
```

- [ ] **Step 2: Confirm full sidebar counts on the deployed preview**

Open `/docs/home`, expand representative Get Started, Development, Management, and Architecture categories, and confirm direct navigation to at least one page from each category.

- [ ] **Step 3: Trigger the same workflow again without Feishu changes**

Expected evidence:

```text
source cache: exact hit
source completeness: complete
fetch mode: incremental
changed docs: 0
expanded docs: 0
guides coverage: pass
```

- [ ] **Step 4: Confirm the second run preserves the complete sidebar**

Compare sidebar hashes and counts between the two runs. Expected: identical sidebar IDs despite the second run fetching zero document bodies.

- [ ] **Step 5: Record rollout evidence**

Add the two run URLs, cache keys, coverage counts, and deployed preview URL to the implementation handoff or pull-request description. Do not enable the workflow for `dev` until both runs satisfy the design acceptance criteria.
