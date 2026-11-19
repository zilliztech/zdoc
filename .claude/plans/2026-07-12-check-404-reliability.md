# Reliable External Link Checking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the permanently failing external-link check with a deterministic, source-aware CI gate that distinguishes genuine broken links from blocked or transient requests.

**Architecture:** Split link discovery, URL normalization, HTTP classification, and reporting into testable functions. Parse Markdown links without treating image titles as URL content, exclude images from the external-page gate, classify only confirmed 404/410 responses as broken, and report blocked/transient responses separately. Keep genuine generated-content defects visible through an explicit baseline that can only shrink.

**Tech Stack:** Node.js, Node built-in test runner, axios, GitHub Actions, Markdown generated from Feishu and SDK sources.

---

### Task 1: Capture current failure modes with tests

**Files:**
- Create: `scripts/check-404.test.js`
- Modify: `scripts/check-404.js`

- [ ] Export pure helpers from `scripts/check-404.js` without changing runtime behavior.
- [ ] Add a failing test proving an image such as `![alt](https://bucket/image.png "title")` is not emitted as an external page link.
- [ ] Add a failing test proving `[label](https://example.com/page "title")` yields only `https://example.com/page`.
- [ ] Add failing tests for response classification: 404/410 are broken; 401/403/429 and network timeouts are blocked or transient.
- [ ] Add a failing test that records every source file containing a duplicated URL.
- [ ] Run `node --test scripts/check-404.test.js` and confirm failures match the missing behavior.

### Task 2: Make extraction and normalization correct

**Files:**
- Modify: `scripts/check-404.js`
- Test: `scripts/check-404.test.js`

- [ ] Replace the current broad regular expression with extraction that distinguishes links from images and removes optional Markdown titles.
- [ ] Normalize URLs by trimming surrounding syntax while preserving query strings and fragments.
- [ ] Deduplicate requests by normalized URL while retaining all source file and line references.
- [ ] Ignore non-HTTP schemes, examples containing placeholders, and URLs inside fenced code blocks.
- [ ] Run the focused tests and confirm extraction tests pass.

### Task 3: Introduce an actionable HTTP policy

**Files:**
- Modify: `scripts/check-404.js`
- Test: `scripts/check-404.test.js`

- [ ] Send GET requests with a browser-like user agent and bounded redirects instead of relying on HEAD behavior.
- [ ] Retry timeouts, 429, and 5xx responses with bounded backoff.
- [ ] Classify outcomes as `ok`, `redirected`, `broken`, `blocked`, or `transient`.
- [ ] Fail only on confirmed 404 and 410 responses after retries.
- [ ] Print blocked and transient URLs as warnings without failing the job.
- [ ] Run focused classification tests and confirm they pass.

### Task 4: Add source-aware reports and a shrinking baseline

**Files:**
- Create: `config/link-check-baseline.json`
- Modify: `scripts/check-404.js`
- Modify: `scripts/check-404.test.js`

- [ ] Emit a concise console summary grouped by classification and host.
- [ ] List source file and line locations for every confirmed broken URL.
- [ ] Seed the baseline with currently confirmed content defects such as `https://TopHits.md` and obsolete generated SDK links.
- [ ] Fail when a new confirmed broken URL appears.
- [ ] Fail when the baseline grows, but allow fixed entries to disappear.
- [ ] Add tests for new regression, unchanged baseline, and shrinking baseline behavior.

### Task 5: Correct and harden the GitHub Actions workflow

**Files:**
- Modify: `.github/workflows/check-404.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] Restore `push` and `pull_request` as siblings beneath `on`.
- [ ] Run the check on the actual protected documentation branches instead of only `feat/zdoc-redesign`.
- [ ] Preserve read-only permissions, cancellation of superseded runs, and a bounded timeout.
- [ ] Upload the JSON link report as an artifact even when the checker fails.
- [ ] Strengthen workflow validation by parsing YAML structurally or testing trigger placement explicitly.
- [ ] Run workflow-policy tests and confirm malformed trigger nesting is rejected.

### Task 6: Repair upstream content defects by ownership

**Files:**
- Modify generated-source templates or Feishu source documents identified by the report.
- Avoid directly patching generated Markdown unless no upstream source exists.

- [ ] Fix SDK generator output that creates `https://TopHits.md`.
- [ ] Update obsolete FlagEmbedding and sentence-transformers source links.
- [ ] Correct Google API service references that point at bare HTTP service hosts.
- [ ] Correct or remove obsolete `docs.zilliz.com.cn` links.
- [ ] Re-run the checker after each ownership group and remove resolved baseline entries.

### Task 7: Full verification

**Files:**
- No additional production files expected.

- [ ] Run `node --test scripts/check-404.test.js`.
- [ ] Run `npm run test:workflow-policy`.
- [ ] Run `node scripts/check-404.js` twice to check deterministic output.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build` and compare its internal-link warnings with the external-link report.
- [ ] Confirm the final report contains source locations, no malformed image-title URLs, and no new confirmed broken links.
