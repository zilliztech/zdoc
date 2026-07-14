# Guides Candidate Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse the Guides source-stage Feishu Base/Wiki scan to create the last-success snapshot after assembly, eliminating the second remote scan.

**Architecture:** Extend the source snapshot module with strict candidate creation/promotion helpers. The source fetch writes a complete candidate after downloading sources, the source-stage artifact carries it, and assembly promotes it only after the combined build passes.

**Tech Stack:** Node.js 20, Docusaurus CLI, GitHub Actions, `node:test`.

---

### Task 1: Add candidate snapshot validation and promotion

**Files:**
- Modify: `plugins/lark-docs/sourceSnapshot.js`
- Modify: `plugins/lark-docs/sourceSnapshot.test.js`
- Create: `scripts/promote-lark-doc-snapshot.js`
- Create: `scripts/promote-lark-doc-snapshot.test.js`

- [ ] Write failing tests for `validateCandidateSnapshot(candidate, expected)` and `promoteCandidateSnapshot(options)`. Require schema 2, expected manual/build environment/source directory/Base token, unique canonical records, valid hashes, and promotion that preserves source facts while replacing only publication metadata.
- [ ] Run `node --test plugins/lark-docs/sourceSnapshot.test.js scripts/promote-lark-doc-snapshot.test.js` and confirm the new APIs are missing.
- [ ] Implement the strict helpers and a CLI accepting `--candidate`, `--output`, `--manual`, `--build-env`, `--targets-built`, `--source-branch`, `--publish-url`, and `--link-check-remote`.
- [ ] Run the focused tests and confirm they pass.
- [ ] Commit with `feat(guides): validate and promote source snapshots`.

### Task 2: Write the candidate during the existing source scan

**Files:**
- Modify: `plugins/lark-docs/index.js`
- Modify: `plugins/lark-docs/larkDocScraper.test.js`
- Modify: `scripts/docs-workflow/run-content-group.test.js`

- [ ] Add a failing fetch test proving incremental Guides source fetching writes `plugins/lark-docs/meta/reports/guides-source-snapshot-candidate.json` using the already-loaded records and Wiki metadata, without a second `__base()` or metadata request.
- [ ] Run the focused tests and confirm the candidate is absent.
- [ ] Retain `currentNodeMetadataByToken` from planning; after source download/removal cleanup, call `createSourceSnapshot()` and `writeSnapshot()` with `manualName`, `buildEnv`, `docSourceDir`, `scraper.base_app_token`, `scraper.records`, and the retained metadata.
- [ ] Ensure candidate generation is limited to incremental source-only runs so render/postprocess commands do not rewrite it.
- [ ] Run the focused tests and commit with `feat(guides): persist source snapshot candidates`.

### Task 3: Carry and promote the candidate in assembly

**Files:**
- Modify: `scripts/docs-workflow/guides-stage-artifact.js`
- Modify: `scripts/docs-workflow/guides-stage-artifact.test.js`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `scripts/sdk-reference-workflow.test.js`

- [ ] Add failing tests requiring the candidate in source-stage artifacts and requiring assembly to call `promote-lark-doc-snapshot.js` after the combined build while never calling `update-lark-doc-snapshot.js`.
- [ ] Run the focused tests and confirm failure.
- [ ] Add the candidate path to `STAGE_PATHS.source`; fail source artifact creation if it is missing.
- [ ] Split assembly validation from snapshot promotion: run sidebar/build validation first, promote the restored candidate second, then create the combined checkpoint.
- [ ] Run focused tests and commit with `feat(guides): promote validated source snapshots`.

### Task 4: Verify the complete workflow

**Files:**
- Modify only if verification reveals a covered defect.

- [ ] Run `node --test plugins/lark-docs/sourceSnapshot.test.js plugins/lark-docs/larkDocScraper.test.js scripts/promote-lark-doc-snapshot.test.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js`.
- [ ] Run `node --test scripts/sdk-reference-workflow.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/*.test.js scripts/run-doc-build-stage.test.js`.
- [ ] Run `node --test scripts/translation/*.test.js`, `bash -n scripts/docs-workflow/*.sh`, and `git diff --check`.
- [ ] Run `pnpm run build` and confirm both locales succeed with only known link warnings.
- [ ] Push the branch and dispatch a Guides-only disposable run. Confirm assembly logs contain no `[snapshot] Base scan` or `[snapshot] Wiki metadata` and the published checkpoint contains the promoted last-success snapshot.
