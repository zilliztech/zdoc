# Publisher Job Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent unselected or artifact-only source publisher reusable workflows from allocating runners while preserving selected-group publication through skipped serialization dependencies.

**Architecture:** Keep `always()` at the caller because each publisher may depend on a skipped predecessor in the serialization chain. Add positive caller-side gates for publish mode, selected-group membership, and the matching producer's `artifact_ready` output. Retain the reusable publisher's `should_publish` input as defense in depth.

**Tech Stack:** GitHub Actions YAML, Node.js built-in test runner, `js-yaml` workflow policy validation.

---

### Task 1: Add the regression policy

**Files:**
- Modify: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Write a failing test**

Add a test that parses `fetch-docs.yml` and verifies each of `guides`, `python`, `java`, `node`, `go`, `cli`, and `rest` source publisher job conditions contain `always()`, the publish-mode check, the matching selected-group check, and the matching producer `artifact_ready` check.

- [ ] **Step 2: Verify the test fails**

Run: `node --test scripts/validate-workflow-policy.test.js`

Expected: FAIL because the current source publisher conditions are only `always()`.

### Task 2: Gate source publisher jobs

**Files:**
- Modify: `.github/workflows/fetch-docs.yml`

- [ ] **Step 1: Implement the minimal workflow change**

For every source publisher, use this group-specific condition:

```yaml
if: ${{ always() && needs.prepare.outputs.publish == 'true' && (needs.prepare.outputs.selected_group == 'all' || needs.prepare.outputs.selected_group == '<group>') && needs.produce_<group>.outputs.status == 'artifact_ready' }}
```

- [ ] **Step 2: Verify the focused tests pass**

Run: `node --test scripts/validate-workflow-policy.test.js scripts/sdk-reference-workflow.test.js`

Expected: PASS with zero failures.

- [ ] **Step 3: Verify the workflow-focused suite**

Run: `node --test scripts/docs-workflow/*.test.js scripts/restore-generated-state.test.js scripts/sdk-reference-workflow.test.js scripts/validate-workflow-policy.test.js scripts/translation/manifest.test.js scripts/translation/workflowReporting.test.js`

Expected: PASS with zero failures.

### Task 3: Controlled publication validation

**Files:**
- No repository changes.

- [ ] **Step 1: Push the reviewed patch when authorized**

Push `codex/checkpointed-docs-workflow` only after reviewing the local diff.

- [ ] **Step 2: Dispatch a CLI publication to a disposable branch**

Use `group=cli`, `publish=true`, `tooling_ref=master`, and a disposable branch copied from `dev`.

- [ ] **Step 3: Confirm runtime behavior**

Verify only `produce_cli` and `publish_cli` run among the source producer/publisher pairs, publication succeeds or reports `no_changes`, and final verification passes.
