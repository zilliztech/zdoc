# Feishu Reconciliation Approval Design

**Date:** 2026-08-16
**Status:** Proposed

## Summary

When Translation reconciliation produces `review_required`, the user should be guided through approval in Feishu instead of manually operating GitHub Actions.

The Feishu progress card must:

- show that a specific translation unit is waiting for reconciliation approval;
- show the exact plan SHA, target, group, operation count, and affected source/target paths;
- provide Approve and Reject actions;
- update itself after approval or rejection.

## Current State

- `prepare-reconciliation-plan.js` writes `translation-reconciliation-review-*.json`.
- `_translate-content-group.yml` uploads review evidence but the job fails.
- The monitor currently sees only a failed translation job.
- `reconciliation-review-pr.js` can build a PR plan, but is not connected to Feishu.

## Target Flow

```text
worker detects review_required
  -> writes structured reconciliation-review-state.json
  -> translation card enters review_required
  -> card shows Approve / Reject
  -> user clicks a button
  -> card.action.trigger event is consumed
  -> handler authenticates reviewer and plan identity
  -> approve: create durable policy PR or run-scoped approval receipt
  -> reject: record rejection evidence
  -> card updates to approved / rejected / awaiting-tooling-sync
```

## Review State Schema

```json
{
  "schemaVersion": 1,
  "document": "translation-reconciliation-review-state",
  "runId": 123,
  "runAttempt": 1,
  "target": "zh-CN-reference",
  "group": "cli",
  "planSha256": "sha256:...",
  "policyId": "...",
  "status": "review_required",
  "operationCount": 1,
  "operations": [
    {
      "operationId": "sha256:...",
      "kind": "delete_target",
      "sourcePath": "...",
      "targetPath": "...",
      "reason": "source_deleted"
    }
  ],
  "reviewArtifactSha256": "sha256:...",
  "githubRunUrl": "https://github.com/.../actions/runs/123"
}
```

This state is intentionally bounded so the card and approval handler do not need to download the full review artifact before rendering.

## Card Changes

Add a new work-item status:

```text
review_required
```

For a unit with review state:

- status label: `Approval required`
- detail: `target/group · N operations`
- action block: Approve / Reject

The card should not claim the unit is merely `failed`.

## Approval Handler

Use `card.action.trigger` from Feishu interactive cards.

The handler must:

- validate `operator` and `action`;
- validate `planSha256` and `reviewArtifactSha256`;
- validate target/group and source/target identities;
- reject duplicate approvals;
- create one of:
  - durable policy exception PR;
  - run-scoped approval receipt;
- never write master-authoritative policy directly to `dev`.

## Rejection Handler

Rejection:

- records reviewer identity and rationale;
- does not create a PR;
- does not modify policy;
- marks the review state as `rejected`.

## Security

- Approval buttons must bind the complete plan identity.
- Changing any operation invalidates the plan SHA and receipt.
- Reviewer identity must be non-empty.
- Duplicate approval must be idempotent.
- Tooling sync still happens through the normal master-to-dev PR path.

## Rollout

1. Add structured review state and card rendering.
2. Add card action schema and event consumer.
3. Add durable PR and run-scoped approval handlers.
4. Add workflow policy and replay tests.
