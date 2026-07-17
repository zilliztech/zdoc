# Guides Media Cache Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a Guides run rebuild complete canonical media coverage when its media cache is invalid, and persist the repaired cache under a new immutable key.

**Architecture:** Keep source and media validity independent. Restore exact cache keys in v3, v2, v1 order; reuse valid legacy media when possible; when media is invalid, omit the incremental plan so the existing prefetcher scans every canonical source in the candidate snapshot. Save only the validated promoted cache under a v3 key.

**Tech Stack:** GitHub Actions YAML, Node.js CommonJS scripts, Node test runner.

---

### Task 1: Version the immutable Guides cache key

**Files:**
- Modify: `scripts/docs-workflow/guides-source-cache.js`
- Test: `scripts/docs-workflow/guides-source-cache.test.js`

- [x] Add a failing test proving the default key is `guides-source-v3-*`, explicit v1/v2 keys remain available, and version 4 is rejected.
- [x] Run `node --test scripts/docs-workflow/guides-source-cache.test.js` and confirm the new assertion fails because version 3 is unsupported.
- [x] Extend `sourceCacheKey()` to accept versions 1, 2, and 3, defaulting to 3 without changing the schema of the validated source manifest.
- [x] Re-run the targeted test and confirm it passes.

### Task 2: Recover media independently from an empty delta

**Files:**
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `.github/workflows/_assemble-guides.yml`
- Test: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/validate-workflow-policy.js`

- [x] Add failing policy assertions requiring exact v3→v2→v1 restore order, v3 save keys, and a media-invalid branch that invokes `guides-media-prefetch.js` without `--plan`.
- [x] Run `node --test scripts/validate-workflow-policy.test.js` and confirm the new assertions fail against the v2-only workflow.
- [x] Add a v3 restore step, retain exact v2/v1 migration fallbacks, and allow both v3 and v2 caches to pass independent media validation.
- [x] Build prefetch arguments in YAML: include `--plan` and `--previous-manifest` only when `media_valid=true`; otherwise log recovery, omit `--plan`, scan all candidate snapshot sources, and enable safe baseline reuse.
- [x] Save the promoted validated cache with an explicit v3 key.
- [x] Update policy validation so future workflow changes cannot remove the full-snapshot recovery branch or reintroduce inexact cache restores.
- [x] Re-run the policy tests and confirm they pass.

### Task 3: Verify the complete workflow change

**Files:**
- Verify all modified files and preserve the existing Feishu-card edits.

- [x] Run `node --test scripts/docs-workflow/guides-source-cache.test.js scripts/docs-workflow/guides-media-prefetch.test.js scripts/validate-workflow-policy.test.js`.
- [x] Run `npm run test:workflow-policy`.
- [x] Run `node --test scripts/docs-workflow/*.test.js plugins/report-to-lark/*.test.js`.
- [x] Run `git diff --check` and inspect the final diff for unrelated changes.
