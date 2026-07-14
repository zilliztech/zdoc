# Card and Translation Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Feishu publication target and no-change statuses, preserve executable MDX ESM during translation, and repair safe translated MDX syntax before validation.

**Architecture:** Card state will carry an explicit `targetBranch`. A successful translator followed by a skipped translation publisher is treated as a no-change completion without allocating extra runners. Translation will shield ESM statements before model calls, restore them deterministically, run the existing MDX patcher, then require source/translation anchor identity before checkpointing.

**Tech Stack:** Node.js 20, GitHub Actions reusable workflows, Feishu Card JSON 2.0, `@mdx-js/mdx`, existing `plugins/mdx-parse` patcher, Node test runner.

---

### Task 1: Preserve explicit card target branch

**Files:**
- Modify: `plugins/report-to-lark/cardV2.js`
- Modify: `plugins/report-to-lark/index.js`
- Modify: `plugins/report-to-lark/reportCardState.js`
- Modify: `plugins/report-to-lark/cardV2.test.js`
- Modify: `scripts/docs-workflow/report-live-card.sh`
- Modify: `.github/workflows/fetch-docs.yml`

- [x] Add failing tests proving `state.targetBranch` overrides `GITHUB_REF_NAME` and survives exact/phase card state construction.
- [x] Run `node --test plugins/report-to-lark/cardV2.test.js plugins/report-to-lark/reportCardState.test.js` and confirm failure.
- [x] Add `--target-branch`, store it in every generated card state, and pass `needs.prepare.outputs.target_branch` to initial and terminal card updates.
- [x] Run card tests and workflow-policy tests.

### Task 2: Show no-change translation publication as complete

**Files:**
- Modify: `scripts/docs-workflow/build-live-card-state.js`
- Modify: `scripts/docs-workflow/build-live-card-state.test.js`
- Modify: `scripts/docs-workflow/report-live-card.sh`
- Modify: `.github/workflows/fetch-docs.yml`

- [x] Add a failing test where a translator succeeds, its publisher is skipped, and the translation publication status must be `done`.
- [x] Infer no-change completion from the successful translator and skipped publisher job graph, avoiding unnecessary publisher runners.
- [x] Run live-card tests and shell syntax validation.

### Task 3: Shield ESM from translation

**Files:**
- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/translation/agentRunner.test.js`
- Modify: `.github/prompts/codex-translation-agent.md`

- [x] Add failing tests where the model would corrupt or split an import statement, while the final translated file must contain the exact source ESM.
- [x] Replace ESM statements with deterministic protected markers before translation/review and restore them exactly afterward; fail explicitly if a marker is missing or duplicated.
- [x] Run agent runner and full translation tests.

### Task 4: Apply safe MDX patches and preserve anchor identity

**Files:**
- Modify: `scripts/translation/agentRunner.js`
- Modify: `scripts/translation/agentRunner.test.js`

- [x] Add a failing test where the model removes the backslash from `\{#anchor}` and expect successful repair.
- [x] Add a failing test where the model changes the anchor ID and expect rejection.
- [x] Run `applyMdxPatches()` after ESM restoration, compare ordered source and translated anchor IDs, then run normal validation.
- [x] Run full translation tests and targeted MDX checks.

### Task 5: Verify and integrate

**Files:**
- Verify all modified files above.

- [x] Run `pnpm run test:translation`.
- [x] Run card, workflow policy, and live-card tests.
- [x] Run `git diff --check` and inspect the complete diff.
- [x] Commit the plan and implementation, merge the isolated branch into `master`, push normally, and remove the temporary worktree and branch.
