# Recoverable Translation Pipelines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split English production, translation, and site publication while making paid translations recoverable per file and making Chinese first-run coverage complete.

**Architecture:** Keep the existing top-level workflows and reusable workflow pattern. Add small tested utilities for ref materialization, bootstrap selection, retirement cleanup, and recovery artifacts; then wire those contracts into `translate-content.yml`, slim `fetch-docs.yml`, and add a reusable site build/publish workflow. Git commits remain published state; GitHub artifacts remain recoverable execution state.

**Tech Stack:** GitHub Actions YAML, Node.js 22 CommonJS utilities and `node:test`, TypeScript/Zod reference tooling, pnpm, GitHub artifacts.

---

## Scope and sequencing

This is one end-to-end plan with three independently testable slices:

1. translation correctness and recovery;
2. English/translation workflow separation;
3. locale-specific site build and publication.

Do not refactor unrelated workflow reporting, checkpoint merging, deployment infrastructure, or general path-security code. Reuse the repository's existing safe-path and checkpoint validators.

### Task 1: Resolve and materialize tooling and source refs

**Files:**
- Create: `scripts/docs-workflow/resolve-docs-refs.js`
- Create: `scripts/docs-workflow/resolve-docs-refs.test.js`
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `.github/workflows/translate-content.yml`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing tests for ref and directory ownership**

Test that branch, tag, and exact SHA resolve to lowercase 40-character SHAs; reject unsafe refs; and require this ownership map:

```js
const DOCS_REF_PATHS = {
  tooling: [
    '.github/workflows', 'scripts', 'packages/docs-tooling', 'packages/site-config',
    'packages/docs-ui', 'apps/docs', 'deploy/contracts', 'config',
    'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.json',
  ],
  source: ['content/en', 'generated/en', 'sidebar-overrides/en'],
};
```

Also test that overlapping ownership fails rather than accepting checkout order.

- [ ] **Step 2: Run the tests and confirm the new contract is absent**

Run:

```bash
node --test scripts/docs-workflow/resolve-docs-refs.test.js scripts/validate-workflow-policy.test.js
```

Expected: ref-resolution tests fail because the utility and workflow outputs do not exist.

- [ ] **Step 3: Implement the minimal utility and workflow outputs**

Export focused functions:

```js
module.exports = {
  DOCS_REF_PATHS,
  assertDisjointOwnership,
  assertSafeGitRef,
  resolveCommit,
  restoreOwnedPaths,
};
```

`restoreOwnedPaths()` must populate a tooling checkout with only the declared source-owned paths from `sourceSha`. Update both workflow prepare jobs to emit `tooling_sha` and `source_sha`; all later checkouts use those outputs.

- [ ] **Step 4: Run focused tests and commit**

```bash
node --test scripts/docs-workflow/resolve-docs-refs.test.js scripts/validate-workflow-policy.test.js
git add scripts/docs-workflow/resolve-docs-refs.js scripts/docs-workflow/resolve-docs-refs.test.js .github/workflows/fetch-docs.yml .github/workflows/translate-content.yml scripts/validate-workflow-policy.test.js
git commit -m "feat(workflow): resolve tooling and source refs"
```

Expected: tests pass and workflows contain no downstream checkout of an unresolved symbolic source/tooling ref.

### Task 2: Implement Chinese bootstrap and scoped retirement cleanup

**Files:**
- Create: `scripts/translation/bootstrap-state.js`
- Create: `scripts/translation/bootstrap-state.test.js`
- Modify: `scripts/translation/manifest.js`
- Modify: `scripts/translation/manifest.test.js`
- Modify: `packages/docs-tooling/src/reference/translationManifest.ts`
- Modify: `packages/docs-tooling/src/reference/translationManifest.test.ts`
- Modify: `packages/docs-tooling/src/reference/translationManifest.integration.test.ts`

- [ ] **Step 1: Write failing mode, coverage, and retirement tests**

Cover these exact rules:

```js
resolveMode('auto', false) === 'full'
resolveMode('auto', true) === 'incremental'
resolveMode('incremental', false) // throws
```

In `full` mode, assert that all active English files are candidates even when target files and legacy `translated` records exist. Add four retirement fixtures: source-only becomes a candidate, both present is active, target-only remains retired, both missing removes the stale group record.

- [ ] **Step 2: Run tests and confirm current placeholder behavior fails**

```bash
node --test scripts/translation/bootstrap-state.test.js scripts/translation/manifest.test.js
pnpm exec vitest run packages/docs-tooling/src/reference/translationManifest.test.ts packages/docs-tooling/src/reference/translationManifest.integration.test.ts
```

Expected: full-mode and stale-retirement cases fail against current selection logic.

- [ ] **Step 3: Add explicit bootstrap state and group-scoped normalization**

Use this state shape:

```json
{"schemaVersion":1,"bootstrapCompletedGroups":[],"records":[]}
```

Export:

```js
resolveTranslationMode({requestedMode, bootstrapCompletedGroups, group})
markBootstrapComplete({manifest, group})
```

`buildManifest()` receives `mode`; full mode ignores legacy completion records when selecting active sources. Add a group-scoped retirement normalization function that returns `{registry, candidates}` without validating unrelated groups. Require `candidateCount === activeSourceCount` before a full run starts.

- [ ] **Step 4: Run focused tests and commit**

```bash
node --test scripts/translation/bootstrap-state.test.js scripts/translation/manifest.test.js
pnpm exec vitest run packages/docs-tooling/src/reference/translationManifest.test.ts packages/docs-tooling/src/reference/translationManifest.integration.test.ts
git add scripts/translation/bootstrap-state.js scripts/translation/bootstrap-state.test.js scripts/translation/manifest.js scripts/translation/manifest.test.js packages/docs-tooling/src/reference/translationManifest.ts packages/docs-tooling/src/reference/translationManifest.test.ts packages/docs-tooling/src/reference/translationManifest.integration.test.ts
git commit -m "feat(translation): require full Chinese bootstrap"
```

Expected: the Chinese Python fixture plans every active English file, and unrelated Java retirement state cannot fail Python preflight.

### Task 3: Create and restore per-file recovery artifacts

**Files:**
- Create: `scripts/translation/recovery-artifact.js`
- Create: `scripts/translation/recovery-artifact.test.js`
- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `.github/workflows/_translate-content-group.yml`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing recovery eligibility and integrity tests**

Use records with this exact minimum shape:

```js
{
  sourcePath, targetPath, sourceHash, targetHash, targetSize,
  locale, group, promptContractSha256, model, status: 'translated'
}
```

Test that a file is reusable across different source commits, tooling SHAs, pending sets, and batch boundaries when current `sourceHash`, locale, group, translation contract, `targetHash`, and size match. Test rejection for each mismatching field and unsafe path.

- [ ] **Step 2: Run tests and confirm recovery is not yet file-addressable**

```bash
node --test scripts/translation/recovery-artifact.test.js scripts/translation/agentRunner.test.js scripts/validate-workflow-policy.test.js
```

Expected: tests fail because the artifact manifest and per-file restore functions are missing.

- [ ] **Step 3: Implement artifact creation and restore-before-translate**

Export:

```js
createRecoveryManifest({siteDir, results, identity})
restoreRecoveryFiles({siteDir, candidates, artifacts, identity})
```

`createRecoveryManifest()` hashes exact source and target bytes and writes canonical records. `restoreRecoveryFiles()` returns `{restored, pending, rejected}`; only `pending` is sent to `agentRunner`. Restored files still pass current per-file and group validation.

Update `_translate-content-group.yml` to upload `translation-recovery-<locale>-<group>-<run>-<batch>` with `if: ${{ always() }}` immediately after the runner step. Do not add another archive format; use the existing checkpoint/archive helpers.

Set recovery retention to 30 days, validated checkpoints to 14 days, and keep short diagnostic reports at 3 days.

- [ ] **Step 4: Run focused tests and commit**

```bash
node --test scripts/translation/recovery-artifact.test.js scripts/translation/agentRunner.test.js scripts/validate-workflow-policy.test.js
git add scripts/translation/recovery-artifact.js scripts/translation/recovery-artifact.test.js scripts/translation/agentRunner.js scripts/translation/agentRunner.test.js .github/workflows/_translate-content-group.yml scripts/validate-workflow-policy.test.js
git commit -m "feat(translation): recover translated files by source hash"
```

Expected: matching files skip the model call but still run validation; artifact upload remains reachable when translation or later validation fails.

### Task 4: Complete the independent translation workflow

**Files:**
- Modify: `.github/workflows/translate-content.yml`
- Modify: `.github/workflows/_prepare-translation-batches.yml`
- Modify: `.github/workflows/_publish-translation-batches.yml`
- Modify: `.github/workflows/_publish-content-group.yml`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing workflow-policy tests for the public inputs and gates**

Require these dispatch inputs:

```yaml
locale: {type: choice, options: [ja-JP, zh-CN, all]}
group: {type: choice, options: [all, guides, python, java, node, go, cli, rest, tools]}
mode: {type: choice, options: [auto, full, incremental], default: auto}
publish: {type: boolean, default: false}
source_ref: {type: string, default: dev}
target_branch: {type: string, default: dev}
tooling_sha: {type: string, required: true}
recovery_run_id: {type: string, required: false}
batch_size: {type: number, default: 25}
```

Require free preflight before the first secret-bearing translation job, group-local validation before publication, serial Chinese Reference publication, and one final whole-locale validation job.

- [ ] **Step 2: Run the policy test and confirm the old interface fails**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: failures list the missing inputs, recovery download, mode propagation, and final locale gate.

- [ ] **Step 3: Wire the existing reusable jobs to the new contract**

Keep current producers and publishers; pass the resolved mode and recovery directory into them. Mark bootstrap complete only in the validated publication checkpoint. Replace whole-tree validation inside each SDK publisher with its group-local command; retain whole Reference validation in the final locale job.

For Chinese Reference publication dependencies, preserve:

```text
python -> java -> node -> go -> cli -> rest
```

and require predecessor `success`, not `success || skipped`, for selected groups.

- [ ] **Step 4: Run workflow tests and commit**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/translation/manifest.test.js scripts/translation/recovery-artifact.test.js
git add .github/workflows/translate-content.yml .github/workflows/_prepare-translation-batches.yml .github/workflows/_publish-translation-batches.yml .github/workflows/_publish-content-group.yml scripts/validate-workflow-policy.test.js
git commit -m "feat(workflow): add independent recoverable translation entry"
```

Expected: policy tests prove paid jobs are behind preflight and whole-tree validation is absent from per-SDK jobs.

### Task 5: Remove normal translation work from English production

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/docs-workflow/aggregate-results.js`
- Modify: `scripts/docs-workflow/aggregate-results.test.js`

- [ ] **Step 1: Write a failing policy test for the reduced English graph**

Require `run_translations` with default `false`. When false, no translation producer, paid secret, translation publisher, or locale-wide build is selected. When true, the compatibility bridge calls `translate-content.yml` only after source publication and passes the exact published `source_sha`.

- [ ] **Step 2: Run tests and confirm the current coupled graph fails**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/aggregate-results.test.js
```

Expected: policy tests detect unconditional translation graph coupling and old aggregate assumptions.

- [ ] **Step 3: Reduce orchestration without rewriting source producers**

Leave existing fetch/render/checkpoint publishers intact. Gate the temporary translation caller behind:

```yaml
run_translations:
  type: boolean
  default: false
```

Update aggregation so an English-only run succeeds based on requested source groups and English publication, without expecting translation or final site-build results.

- [ ] **Step 4: Run tests and commit**

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/aggregate-results.test.js
git add .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.test.js scripts/docs-workflow/aggregate-results.js scripts/docs-workflow/aggregate-results.test.js
git commit -m "refactor(workflow): separate English production from translation"
```

Expected: `publish=true,run_translations=false` publishes English content without starting translation jobs.

### Task 6: Add locale-specific site build and publication

**Files:**
- Create: `.github/workflows/_build-publish-site.yml`
- Create: `.github/workflows/publish-sites.yml`
- Modify: `.github/workflows/site-validation.yml`
- Modify: `deploy/contracts/site-validation-workflow.test.mjs`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write failing workflow tests for site selection and artifact-only deployment**

Require `site` values `auto`, `en`, `zh-CN`, and `all`; `source_ref`; `publish=false`; environment; and retention. Assert:

- `en` runs only `pnpm build:en`;
- `zh-CN` runs only `pnpm build:zh-CN`;
- `auto` delegates selection to `deploy/contracts/path-filters.json` and fails closed when classification fails;
- `all,publish=true` deploys neither artifact unless both builds pass;
- deployment downloads a validated artifact and contains no build command;
- the reusable workflow contains no fetch or translation command.

- [ ] **Step 2: Run tests and confirm the build/publish contract is missing**

```bash
node --test deploy/contracts/site-validation-workflow.test.mjs scripts/validate-workflow-policy.test.js
```

Expected: failures identify the missing reusable workflow and dispatch inputs.

- [ ] **Step 3: Implement the reusable site jobs and PR-visible caller**

`_build-publish-site.yml` accepts exact `build_sha`, one site, environment, publish flag, and retention. Its build job uploads `site-build-<site>-<sha>` plus checksums/provenance. Its deployment job downloads and verifies that artifact without rebuilding.

Extend existing `site-validation.yml` manual dispatch to resolve `source_ref` and call the reusable workflow, allowing PR testing through an entry already present on the default branch. Add `publish-sites.yml` as the eventual direct production entry; do not treat manual dispatch of this new file as PR evidence before merge.

- [ ] **Step 4: Run tests and commit**

```bash
node --test deploy/contracts/site-validation-workflow.test.mjs scripts/validate-workflow-policy.test.js
git add .github/workflows/_build-publish-site.yml .github/workflows/publish-sites.yml .github/workflows/site-validation.yml deploy/contracts/site-validation-workflow.test.mjs scripts/validate-workflow-policy.test.js
git commit -m "feat(workflow): build and publish sites independently"
```

Expected: workflow tests prove independent site selection and no rebuild during deployment.

### Task 7: Verify locally and run controlled PR workflows

**Files:**
- Modify only if a verification failure exposes a defect in files already listed above.

- [ ] **Step 1: Run the complete local verification set**

```bash
node --test scripts/translation/*.test.js scripts/docs-workflow/*.test.js scripts/validate-workflow-policy.test.js deploy/contracts/site-validation-workflow.test.mjs
pnpm exec vitest run packages/docs-tooling/src/reference/translationManifest.test.ts packages/docs-tooling/src/reference/translationManifest.integration.test.ts
pnpm exec tsc --noEmit
git diff --check
```

Expected: all tests pass, TypeScript reports no errors, and `git diff --check` is clean.

- [ ] **Step 2: Push and run artifact-only PR tests**

Dispatch existing top-level workflows with:

```text
--ref codex/unified-docs/01-foundation
tooling_sha=<exact PR HEAD SHA>
source_ref=<exact disposable source SHA>
publish=false
```

Run one Chinese Python full-mode preflight, one recovery interruption test, and separate `site=en` and `site=zh-CN` builds. Expected: Python candidate count equals its active English source count; a rerun restores completed files without model calls; both sites build independently.

- [ ] **Step 3: Run one disposable-branch publication test**

Use `publish=true` only with a disposable target branch. Complete one Chinese SDK bootstrap, rerun `mode=auto`, and require zero unchanged candidates. Build only `zh-CN` from the resulting exact commit. Do not run all paid locale groups until this gate passes.

- [ ] **Step 4: Record evidence and commit only necessary fixes**

Add run URLs and resolved SHAs to the PR description or workflow report, not to repository source files. If fixes were needed, rerun the focused failing test plus the complete verification set before committing.

## Completion criteria

- English fetch can publish without translation or site builds.
- Translation can run for one locale/group from a custom source ref.
- Chinese full mode selects every active English document despite existing placeholders.
- Compatible recovered files skip paid translation and pass current validation.
- Per-group validation is isolated; whole-locale validation remains a final gate.
- English and Chinese sites build and publish independently from exact SHAs.
- PR evidence uses the PR workflow graph and exact PR tooling SHA.
