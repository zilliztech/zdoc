# Guides Shared-Source Parallel Render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fetch guides sources once per workflow run, render SaaS and BYOC concurrently, and publish one validated atomic guides checkpoint.

**Architecture:** A source producer creates a hashed per-run artifact from `plugins/lark-docs/meta/sources/guides`. Two target renderers consume the identical artifact and emit disjoint render artifacts. An assembler validates and combines both renders, updates the shared guides snapshot, runs the full validation, and emits the existing guides checkpoint contract.

**Tech Stack:** GitHub Actions reusable workflows, Node.js 20, Docusaurus `fetch-lark-docs`, Actions artifacts, SHA-256 manifests, `node:test`, shell workflow steps.

---

### Task 1: Separate guides source and target command contracts

**Files:**
- Modify: `scripts/docs-workflow/run-content-group.js`
- Modify: `scripts/docs-workflow/run-content-group.test.js`

- [ ] **Step 1: Add failing tests for source-only and target-only guides commands**

Add exported `commandsForGuidesStage(stage)` coverage with these exact contracts:

```js
assert.deepEqual(commandsForGuidesStage('source'), [
  fetch('guides', '-src-only', '--incremental', '--buildEnv', 'uat'),
])
assert.deepEqual(commandsForGuidesStage('saas'), [
  fetch('guides', '-tar', 'zilliz.saas', '-s3', '-skipS', '--buildEnv', 'uat', '--auditCanonicalLinks'),
  fetch('guides', '-tar', 'zilliz.saas', '-post', '-skipS'),
])
assert.deepEqual(commandsForGuidesStage('byoc'), [
  fetch('guides', '-tar', 'zilliz.paas', '-s3', '-skipS', '--buildEnv', 'uat', '--skipLinkValidation'),
  fetch('guides', '-tar', 'zilliz.paas', '-post', '-skipS'),
])
```

Keep `commandsFor('guides')` compatible until the workflow is switched, but implement it by concatenating the three stage command lists so there is one source of truth.

- [ ] **Step 2: Run the command tests and verify failure**

```bash
node --test scripts/docs-workflow/run-content-group.test.js
```

Expected: FAIL because staged guides commands are not implemented.

- [ ] **Step 3: Add `--stage source|saas|byoc` for guides**

Reject `--stage` for non-guides groups and reject unknown stages. The source stage must not generate `docs` or `docs-byoc`; renderer stages must use `-skipS` and therefore fail naturally when validated sources are absent.

- [ ] **Step 4: Run command tests**

```bash
node --test scripts/docs-workflow/run-content-group.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit staged guides commands**

```bash
git add scripts/docs-workflow/run-content-group.js scripts/docs-workflow/run-content-group.test.js
git commit -m "refactor: separate guides source and render stages"
```

### Task 2: Define and validate guides source artifacts

**Files:**
- Create: `scripts/docs-workflow/create-guides-source-artifact.js`
- Create: `scripts/docs-workflow/validate-guides-source-artifact.js`
- Create: `scripts/docs-workflow/guides-source-artifact.test.js`

- [ ] **Step 1: Write failing artifact integrity tests**

Create fixtures with source JSON and reports. Assert that creation writes:

```json
{
  "schemaVersion": 1,
  "manual": "guides",
  "masterSha": "<40 lowercase hex>",
  "devBaselineSha": "<40 lowercase hex>",
  "buildEnv": "uat",
  "files": [{ "path": "sources/...json", "sha256": "...", "size": 123 }]
}
```

Add rejection tests for traversal, symlinks, unexpected roots, duplicate paths, changed bytes, invalid SHAs, missing source files, and a manifest containing credential-like files such as `.env` or Git metadata.

- [ ] **Step 2: Run the tests and verify missing modules**

```bash
node --test scripts/docs-workflow/guides-source-artifact.test.js
```

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement creation and validation**

The artifact root contains `manifest.json` and `payload/`. Map repository paths into:

```text
payload/sources/**
payload/reports/guides-incremental-fetch-plan.*
payload/reports/guides-broken-content-links.json
```

Use regular-file, no-follow reads and SHA-256. Export `createGuidesSourceArtifact(options)` and `validateGuidesSourceArtifact(directory)` and provide strict CLI argument parsing consistent with the checkpoint scripts.

- [ ] **Step 4: Run source artifact tests**

```bash
node --test scripts/docs-workflow/guides-source-artifact.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit source artifact support**

```bash
git add scripts/docs-workflow/create-guides-source-artifact.js scripts/docs-workflow/validate-guides-source-artifact.js scripts/docs-workflow/guides-source-artifact.test.js
git commit -m "feat: package reusable guides source artifacts"
```

### Task 3: Define target render artifacts and atomic assembly

**Files:**
- Create: `scripts/docs-workflow/create-guides-render-artifact.js`
- Create: `scripts/docs-workflow/assemble-guides-checkpoint.js`
- Create: `scripts/docs-workflow/guides-render-artifact.test.js`
- Modify: `scripts/docs-workflow/content-groups.js`
- Modify: `scripts/docs-workflow/content-groups.test.js`

- [ ] **Step 1: Add failing target ownership tests**

Define target ownership constants:

```js
const GUIDES_RENDER_TARGETS = {
  saas: [
    'docs',
    'config/generated/guides.sidebar.js',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.json',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.md',
    'plugins/lark-docs/meta/reports/guides-canonical-link-audit.csv',
  ],
  byoc: ['docs-byoc', 'config/generated/guides-byoc.sidebar.js'],
}
```

Assert they are disjoint, remain subsets of the published `guides` group, and cannot include the shared snapshot, incremental plan, or broken-content-link report. Render manifests must carry `target`, `sourceArtifactSha256`, `masterSha`, and `devBaselineSha`.

- [ ] **Step 2: Add failing assembly tests**

Verify assembly rejects missing targets, duplicate targets, different source artifact identities, different baseline/master SHAs, overlapping files, tampered bytes, and undeclared paths. Verify successful assembly overlays both target payloads plus source reports on a baseline workspace, calls the supplied snapshot hook with `targetsBuilt: ['zilliz.saas', 'zilliz.paas']`, and creates a standard group `guides` checkpoint.

- [ ] **Step 3: Run tests and verify failure**

```bash
node --test scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/guides-render-artifact.test.js
```

Expected: FAIL because render contracts and assembly do not exist.

- [ ] **Step 4: Implement render creation and assembly**

Reuse checkpoint path normalization and regular-file safety helpers rather than copying permissive filesystem logic. The assembler must invoke `createCheckpointArtifact({ group: 'guides', ... })` only after both target payloads and source reports are restored and the shared snapshot command succeeds.

- [ ] **Step 5: Run render and checkpoint tests**

```bash
node --test scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/guides-render-artifact.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit render and assembly support**

```bash
git add scripts/docs-workflow/create-guides-render-artifact.js scripts/docs-workflow/assemble-guides-checkpoint.js scripts/docs-workflow/guides-render-artifact.test.js scripts/docs-workflow/content-groups.js scripts/docs-workflow/content-groups.test.js
git commit -m "feat: assemble parallel guides renders atomically"
```

### Task 4: Add reusable guides source, render, and assembly workflows

**Files:**
- Create: `.github/workflows/_fetch-guides-sources.yml`
- Create: `.github/workflows/_render-guides-target.yml`
- Create: `.github/workflows/_assemble-guides.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing workflow-policy tests**

Assert:

- all three workflows are `workflow_call` workflows;
- source and renderer workflows have `contents: read` and no push commands;
- the source workflow uploads `guides-sources-${{ github.run_id }}` with short retention;
- render workflow accepts `target: saas|byoc`, downloads and validates the source artifact, and uploads `guides-render-${target}-${run_id}`;
- assembler downloads both render artifacts and the source artifact, validates all three, runs sidebar and full build validation, updates the shared snapshot for both targets, and uploads the standard `docs-checkpoint-guides-${run_id}` artifact;
- artifact extraction performs path/type validation before `tar -xf`.

- [ ] **Step 2: Run policy tests and verify failure**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because the reusable workflows do not exist.

- [ ] **Step 3: Implement `_fetch-guides-sources.yml`**

Checkout immutable master tooling, restore the dev baseline, run:

```bash
node scripts/docs-workflow/run-content-group.js --group guides --stage source
```

Then create, validate, package, and upload the source artifact. Upload reports separately on failure for diagnostics. Emit `status`, `artifact_name`, and `artifact_sha256` outputs.

- [ ] **Step 4: Implement `_render-guides-target.yml`**

Checkout immutable master tooling, restore the same baseline, safely download and restore the source payload, run the requested guides renderer stage, validate its sidebar, create the target render artifact, and upload it. Do not run the full site build in each renderer; the assembler owns the combined build.

- [ ] **Step 5: Implement `_assemble-guides.yml`**

Safely download and validate source, SaaS, and BYOC artifacts. Assemble both target payloads and reports on the baseline, run:

```bash
node scripts/validate-generated-sidebars.js
node scripts/run-doc-build-stage.js --build "pnpm run build" --skipLinkChecks
node scripts/update-lark-doc-snapshot.js --manual guides --targets-built zilliz.saas,zilliz.paas --build-env uat --source-branch "$TARGET_BRANCH" --publish-url https://docs.cloud-uat3.zilliz.com --link-check-remote https://docs.zilliz.com
```

Create and upload the standard guides checkpoint only after those commands succeed.

- [ ] **Step 6: Run workflow policy tests**

```bash
node --test scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: PASS and the policy validator prints its success message.

- [ ] **Step 7: Commit reusable guides workflows**

```bash
git add .github/workflows/_fetch-guides-sources.yml .github/workflows/_render-guides-target.yml .github/workflows/_assemble-guides.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat: render guides targets in parallel"
```

### Task 5: Replace the monolithic guides producer in the orchestrator

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/sdk-reference-workflow.test.js`
- Modify: `scripts/docs-workflow/build-aggregate-input.js`
- Modify: `scripts/docs-workflow/build-aggregate-input.test.js`

- [ ] **Step 1: Add failing topology tests**

Assert this exact dependency graph:

```text
produce_guides_sources
  -> render_guides_saas
  -> render_guides_byoc
render_guides_saas + render_guides_byoc + produce_guides_sources
  -> produce_guides
produce_guides -> publish_guides -> translate_guides -> publish_guides_translation
```

Assert the SaaS and BYOC jobs both depend only on `prepare` and `produce_guides_sources`, so they can overlap. Assert unrelated producers still depend only on `prepare`.

- [ ] **Step 2: Run topology and aggregate tests and verify failure**

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/docs-workflow/build-aggregate-input.test.js
```

Expected: FAIL because `produce_guides` still calls the monolithic reusable producer.

- [ ] **Step 3: Wire the guides subgraph**

Make `produce_guides` the assembly job and preserve its existing external outputs: `status` and `artifact_name`. This keeps `publish_guides`, aggregate result construction, and report restoration compatible. Propagate failures so source or either renderer failure yields guides producer status `failed`.

- [ ] **Step 4: Pass aggregate card metadata to every guides sub-job**

The source and render jobs report aggregate state only. They must not claim the top-level guides Produce phase is complete until assembly uploads the standard checkpoint. Their per-manual table detail may show `sources ready`, `rendering SaaS`, or `rendering BYOC` while the aggregate Produce counter remains incomplete.

- [ ] **Step 5: Run topology and aggregate tests**

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/docs-workflow/build-aggregate-input.test.js scripts/validate-workflow-policy.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit orchestrator integration**

```bash
git add .github/workflows/fetch-docs.yml scripts/sdk-reference-workflow.test.js scripts/docs-workflow/build-aggregate-input.js scripts/docs-workflow/build-aggregate-input.test.js
git commit -m "feat: integrate shared-source guides production"
```

### Task 6: Verify guides correctness and parallel topology

**Files:**
- Modify only if verification exposes a defect in files from Tasks 1-5.

- [ ] **Step 1: Run all guides and checkpoint tests**

```bash
node --test scripts/docs-workflow/run-content-group.test.js scripts/docs-workflow/guides-source-artifact.test.js scripts/docs-workflow/guides-render-artifact.test.js scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js scripts/docs-workflow/validate-checkpoint-artifact.test.js scripts/docs-workflow/build-aggregate-input.test.js
```

Expected: all tests pass.

- [ ] **Step 2: Run the full workflow-focused suite**

```bash
node --test scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/*.test.js scripts/collect-build-card-notes.test.js
```

Expected: all tests pass.

- [ ] **Step 3: Run static policy and diff checks**

```bash
node scripts/validate-workflow-policy.js
git diff --check
```

Expected: policy success and no whitespace errors.

- [ ] **Step 4: Commit verification-only corrections**

```bash
git add .github/workflows scripts/docs-workflow scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test: verify parallel guides production"
```

Skip this commit when verification required no corrections.

### Task 7: Dispatch the acceptance run

**Files:**
- No repository files unless the run exposes a defect.

- [ ] **Step 1: Push the implementation branch**

```bash
git push origin codex/checkpointed-docs-workflow
```

Expected: the remote branch advances to the verified implementation commit.

- [ ] **Step 2: Create a disposable target branch at the implementation baseline**

Use the GitHub API to create a uniquely named branch such as `codex/checkpointed-docs-parallel-test-YYYYMMDD` from the confirmed tooling commit.

- [ ] **Step 3: Dispatch a publish-enabled all-groups or targeted multi-group run**

Dispatch `fetch-docs.yml` with `tooling_ref=codex/checkpointed-docs-workflow`, the disposable target branch, `publish=true`, and a selection that includes guides plus at least two inexpensive groups. If the workflow input cannot express a subset, use `group=all`.

- [ ] **Step 4: Verify runtime acceptance criteria**

Confirm from job timestamps and logs:

- `render_guides_saas` and `render_guides_byoc` overlap;
- both validate the same source artifact SHA-256;
- a non-guides publisher and translator start before guides assembly completes;
- the Feishu card counters update before all producers complete;
- one guides source checkpoint is published;
- final verification and aggregate status match the target branch contents.

- [ ] **Step 5: Record the run URL and findings**

Add the acceptance run URL and observed timestamps to the implementation handoff. Do not commit generated logs or credentials.
