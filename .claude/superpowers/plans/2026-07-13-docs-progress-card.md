# Documentation Progress Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve and display live phase progress across documentation workflow jobs.

**Architecture:** Add a stateless phase-state builder and CLI operation, generate detailed stages in `prepare`, and pass optional card metadata into producer, publisher, translator, and verifier reusable workflows. Each phase updates only its assigned stage.

**Tech Stack:** Node.js, Docusaurus CLI plugin, GitHub Actions, Lark interactive cards.

---

### Task 1: Stateless phase state

- [ ] Add failing unit tests for deterministic cross-job phase state.
- [ ] Implement `buildPhaseState` and a `--card-phase` CLI operation.
- [ ] Verify plugin tests.

### Task 2: Workflow phase metadata

- [ ] Add failing workflow-policy assertions for detailed stages and card inputs.
- [ ] Generate publish and artifact-only stage lists.
- [ ] Pass card metadata and phase indexes to reusable workflows.
- [ ] Add non-fatal phase reporting steps with step-scoped secrets.

### Task 3: Verification

- [ ] Run focused workflow and reporting tests.
- [ ] Run the complete workflow-focused suite.
- [ ] Review the final diff and push only after verification.
