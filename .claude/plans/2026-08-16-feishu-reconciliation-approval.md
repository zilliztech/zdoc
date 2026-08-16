# Feishu Reconciliation Approval Plan

## Goal

Guide review-required Translation units through Feishu card approval instead of requiring manual GitHub Actions operations.

## Phase 1: Structured review state and card text

- [ ] Create reconciliation review state builder/validator.
- [ ] Upload review state from `_translate-content-group.yml`.
- [ ] Teach Translation card rendering to recognize `review_required`.
- [ ] Add tests for state schema and card detail.

## Phase 2: Feishu card actions

- [ ] Extend the exact card state to carry review actions.
- [ ] Render Approve/Reject buttons when review state is present.
- [ ] Add workflow-policy tests for card action boundaries.

## Phase 3: Event consumer and approval handler

- [ ] Add a bounded `card.action.trigger` consumer.
- [ ] Validate card action payload.
- [ ] Implement approve/reject handlers.
- [ ] Add durable PR and run-scoped approval receipt writers.

## Phase 4: Production integration

- [ ] Wire event consumer into a stable runtime or long-running job.
- [ ] Add recovery/replay tests.
- [ ] Update README operator procedure.

## Verification

```bash
pnpm test:translation
pnpm test:workflow-policy
pnpm test:typescript-runtime-boundary
git diff --check
```
