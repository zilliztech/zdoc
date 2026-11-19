# Documentation Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent concurrent Feishu fetch and translation jobs from overwriting each other, enforce least-privilege CI defaults, and make the safeguards regression-testable.

**Architecture:** Treat `dev` as a single generated-content publication lane shared by fetch and translation workflows. Add a static workflow-policy validator that checks the operational invariants without requiring a YAML parser, then harden every workflow and run the existing content/build checks.

**Tech Stack:** GitHub Actions YAML, Node.js built-in test runner, pnpm, Docusaurus.

---

### Task 1: Encode workflow safety invariants

**Files:**
- Create: `scripts/validate-workflow-policy.js`
- Create: `scripts/validate-workflow-policy.test.js`
- Modify: `package.json`

- [ ] Write tests requiring explicit permissions, timeouts, stable Node versions, shared publication concurrency, modern outputs, and non-force pushes.
- [ ] Run the test and confirm it fails against the current workflows.
- [ ] Implement the validator and package script.
- [ ] Run the test and retain the expected policy failures until workflows are hardened.

### Task 2: Serialize and constrain generated-content publication

**Files:**
- Modify: `.github/workflows/fetch-docs-auto.yml`
- Modify: `.github/workflows/fetch-docs-manual.yml`
- Modify: `.github/workflows/translate-codex.yml`

- [ ] Add least-privilege workflow permissions and bounded job timeouts.
- [ ] Put all `dev` writers in the same non-cancelling concurrency group.
- [ ] replace deprecated `set-output` usage.
- [ ] remove force-push options so stale jobs fail instead of destroying newer commits.
- [ ] pin Node to the repository-supported major version.

### Task 3: Harden validation workflows and verify the information architecture

**Files:**
- Modify: `.github/workflows/check-404.yml`
- Modify: `.github/workflows/playwright.yml`

- [ ] Add read-only permissions, concurrency cancellation, and timeouts.
- [ ] Run workflow-policy, generated-sidebar, workflow integration, frontend, typecheck, and Docusaurus build checks.
- [ ] Review the final diff for unrelated generated-content changes.
