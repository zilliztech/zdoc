# Translation Handoff Replay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove that the current fetch-to-translation handoff can consume the latest published documentation identities, start the translation workflow locally, run its non-paid preparation path, and only then pass an online dispatch validation.

**Architecture:** Use fetch run `30724495267` as the immutable publication source, download its publication/checkpoint artifacts into `/tmp`, and reconstruct `source_shas_json` from validated publication receipts. Reproduce GitHub workflow loading with `actionlint`, replay `translation-handoff.js` and the translation preparation commands in an isolated worktree, then dispatch the smallest non-publishing online validation that proves the workflow loads and runs without writing the target branch.

**Tech Stack:** GitHub Actions, GitHub CLI, Node.js 22, pnpm, actionlint, Git worktrees, existing documentation workflow scripts.

---

## File map

- Modify `scripts/validate-workflow-policy.js`: reject GitHub expression string keys written with unsupported double quotes.
- Modify `scripts/validate-workflow-policy.test.js`: add a regression test reproducing the workflow-load failure.
- Modify `.github/workflows/translate-codex.yml`: replace the invalid double-quoted `reference-landings` expression key with GitHub-compatible single-quoted syntax.
- Use `/tmp/zdoc-translation-handoff-30724495267/`: hold downloaded artifacts and replay outputs without contaminating the repository.

### Task 1: Restore workflow loadability

**Files:**
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `.github/workflows/translate-codex.yml:240`

- [ ] **Step 1: Add the failing regression test**

Add a test that copies `.github/workflows`, runs `validateWorkflowPolicies`, and requires this error for an expression containing `[\"reference-landings\"]`:

```text
translate-codex.yml: GitHub expressions must use single-quoted string literals
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test --test-name-pattern='GitHub expressions use single-quoted' scripts/validate-workflow-policy.test.js
```

Expected: FAIL because the current policy validator does not report the invalid expression.

- [ ] **Step 3: Add the minimal policy check**

Scan only `${{ ... }}` expression bodies and report the error when a bracket property key uses a double-quoted string. Do not reject double quotes in shell scripts or ordinary YAML strings.

- [ ] **Step 4: Fix the workflow expression**

Change:

```yaml
source_sha: '${{ fromJSON(inputs.source_shas_json)["reference-landings"] }}'
```

to a YAML scalar that contains this valid Actions expression:

```yaml
source_sha: ${{ fromJSON(inputs.source_shas_json)['reference-landings'] }}
```

- [ ] **Step 5: Verify GREEN and workflow schema**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
env GOPATH=/tmp/zdoc-actionlint-gopath GOCACHE=/tmp/zdoc-actionlint-cache go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 .github/workflows/translate-codex.yml .github/workflows/fetch-docs.yml .github/workflows/_translate-content-group.yml
```

Expected: all tests pass and actionlint exits 0.

### Task 2: Recover exact latest publication identities

**Files:**
- Read: GitHub Actions artifacts from run `30724495267`
- Create outside repository: `/tmp/zdoc-translation-handoff-30724495267/`

- [ ] **Step 1: Download publication receipts, final verification, card report, and source checkpoints**

Run `gh run download 30724495267` with explicit artifact names into the isolated `/tmp` directory.

- [ ] **Step 2: Validate checkpoint archives and receipts**

Safely extract each `checkpoint-group.tar`, run `validate-checkpoint-artifact.js` with the manifest identities, and confirm publication receipts bind the final commit SHA for each selected group.

- [ ] **Step 3: Build exact handoff JSON**

Construct `/tmp/zdoc-translation-handoff-30724495267/source-shas.json` with `guides`, `python`, `java`, `node`, `go`, `cli`, and `rest`, using the published commit SHA or the validated baseline SHA exactly as `fetch-docs.yml` does.

### Task 3: Replay handoff and translation preparation locally

**Files:**
- Read: `scripts/docs-workflow/translation-handoff.js`
- Read: `scripts/translation/sourceDelta.js`
- Read: `scripts/translation/bootstrap-state.js`
- Read: `scripts/translation/manifest.js`
- Create outside repository: isolated Git worktree and replay JSON under `/tmp/zdoc-translation-handoff-30724495267/`

- [ ] **Step 1: Replay the complete handoff CLI**

Run the CLI with `locale=all`, the published group selection, tooling SHA `ef9f45d822137c5621b98dc59427bf1b2b1f2c37`, target branch `dev`, and the reconstructed source SHA map.

- [ ] **Step 2: Reproduce the `prepare` job outputs**

Resolve the exact `origin/dev` SHA, validate recovery input `{}`, and produce the SDK matrix and Guides selection exactly as `.github/workflows/translate-codex.yml` does.

- [ ] **Step 3: Replay translation preparation without model calls or publication**

For the smallest selected unit, materialize the exact source checkpoint, apply the source delta, resolve mode, and build the translation manifest. Stop before `agentRunner.js` so local verification does not spend paid model calls or mutate a remote branch.

- [ ] **Step 4: Run focused translation and handoff tests**

Run:

```bash
node --test scripts/docs-workflow/translation-handoff.test.js scripts/translation/selection.test.js scripts/translation/sourceDelta.test.js scripts/translation/applySourceDelta.test.js scripts/translation/manifest.test.js scripts/translation/bootstrap-state.test.js
pnpm test:translation
```

Expected: all tests pass.

### Task 4: Online validation after local gates

**Files:**
- No repository changes expected.

- [ ] **Step 1: Confirm the workflow definition is available on the dispatch ref**

The fixed workflow must exist on the ref used by `gh workflow run`; do not dispatch an unfixed remote SHA.

- [ ] **Step 2: Dispatch the smallest safe validation**

Dispatch `translate-codex.yml` with the exact handoff identities, `publish=false`, and a single group that has zero pending work when possible. This proves workflow loading, checkout, handoff preparation, source materialization, and terminal aggregation without writing `dev`.

- [ ] **Step 3: Monitor to terminal state**

Use `gh run view` and `gh run watch` to confirm jobs started, record the run URL/ID, inspect failures if any, and report the exact terminal evidence.

- [ ] **Step 4: Final verification**

Run `git diff --check`, the focused tests, workflow policy, and actionlint again before reporting completion.
