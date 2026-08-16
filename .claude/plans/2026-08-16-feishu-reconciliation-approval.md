# Feishu Reconciliation Approval Plan

## Goal

Guide review-required Translation units through Feishu card approval instead of requiring manual GitHub Actions operations.

## Phase 1: Structured review state and card text

- [x] Create reconciliation review state builder/validator.
- [x] Upload review state from `_translate-content-group.yml`.
- [x] Teach Translation card rendering to recognize `review_required`.
- [x] Add tests for state schema and card detail.

## Phase 2: Feishu card actions

- [x] Extend the exact card state to carry review actions.
- [x] Render Approve/Reject buttons when review state is present.
- [x] Add workflow-policy tests for card action boundaries.

## Phase 3: Event consumer and approval handler

- [x] Add a bounded `card.action.trigger` consumer.
- [x] Validate card action payload.
- [x] Implement approve/reject handlers.
- [x] Add durable PR and run-scoped approval receipt writers.

## Phase 4: Production integration

- [x] Wire event consumer into a stable runtime or long-running job.
- [x] Add recovery/replay tests.
- [x] Update README operator procedure.

## Verification

```bash
pnpm test:translation
pnpm test:workflow-policy
pnpm test:typescript-runtime-boundary
git diff --check
```
