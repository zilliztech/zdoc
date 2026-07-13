# Feishu Card JSON v2 Implementation Plan

**Goal:** Replace the progress card's legacy JSON and Markdown compatibility rendering with native Feishu Card JSON 2.0 components.

### Task 1: Card builder

- [x] Add failing tests for schema 2.0, semantic headers, responsive phases, native tables, report panels, and footer content.
- [x] Implement a focused Card JSON v2 builder.
- [x] Retire the compact-row Markdown compatibility converter.

### Task 2: Structured workflow state

- [x] Preserve per-manual phase statuses in exact live card state.
- [x] Keep native manual tables at workflow completion.
- [x] Merge collected report notes into terminal exact state.
- [x] Omit the manual table for single-manual cards.

### Task 3: Verification

- [x] Run reporting and workflow-policy tests.
- [x] Run translation tests and shell syntax validation.
- [x] Inspect a generated seven-row Card JSON v2 payload.
- [x] Prepare the verified branch for commit and push without dispatching a workflow.
