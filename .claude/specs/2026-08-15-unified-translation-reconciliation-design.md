# Unified Translation Reconciliation Design

**Date:** 2026-08-15
**Status:** Proposed
**Repository:** `zilliztech/zdoc`

## Summary

Introduce one authenticated reconciliation protocol for translated documentation after an English source page is deleted or renamed. The protocol applies to:

- Japanese Guides;
- Japanese Reference manuals;
- Chinese Reference manuals.

Every supported translation unit follows the same lifecycle:

```text
immutable source baseline and checkpoint
  -> scoped source/target inventory comparison
  -> canonical reconciliation plan
  -> policy authorization
  -> reconciliation-only or translation batch
  -> atomic target mutation and state update
  -> publication result and recovery evidence
```

The implementation is shared, while authorization remains policy-driven. A proven complete generated-source deletion may be approved automatically. Ambiguous, large, hand-authored, or incomplete-source changes stop before publication and produce a review artifact. Human participation approves a deterministic plan; it does not manually edit target files or reconstruct workflow state.

The design replaces locale-specific transport fields such as `deletedI18n`, `renamed`, and `retirementCandidates` with one schema. It does not remove the production queue, weaken `REMOTE_STATE_UNKNOWN`, introduce force pushes, or make translation a Fetch responsibility.

## Problem Statement

Deletion and rename reconciliation currently has two incompatible models.

### Japanese Guides and Reference

The Japanese path compares immutable English SHAs, maps deleted English paths to Japanese targets, removes target files and `.translation-cache/ja-JP.json` entries, and can publish a reconciliation-only batch with no model work.

This path is operationally effective, but its contract is encoded in Japanese-specific fields:

- `deletedI18n`;
- `renamed`;
- `deleted_i18n` in translation manifests;
- target-specific mutation logic in `applySourceDelta.js`.

### Chinese Reference

Chinese Reference identifies missing-source mappings as retirement candidates. Publication requires an exact entry in `config/reference-retirements.json`. Reconciliation can retain a target-only path as a `retired` translation record instead of deleting the target.

This fails closed, but it has three operational costs:

- a deletion discovered after Fetch source publication can fail the later Reference reconciliation boundary;
- the static registry is master-authoritative and cannot represent a run-scoped decision without a tooling PR and sync;
- Japanese and Chinese recovery evidence describe the same source change differently.

### Resulting failure mode

A source-only Fetch can leave translated targets temporarily stale. Japanese catches up during a later Translation run. Chinese may stop before Translation because the missing source lacks static retirement authorization. Operators must reason about different schemas, different mutation semantics, and different recovery procedures for the same business event.

## Goals

- Define one deletion and rename reconciliation document for every supported translation target and group.
- Detect current-run deletions and historical orphan translations before paid model work.
- Bind every reconciliation decision to exact source, target, tooling, and policy identities.
- Allow policy-driven automatic approval without treating every missing source as authoritative.
- Make human review approve or reject a complete immutable plan.
- Execute deletion, rename cleanup, cache updates, and manifest updates through one atomic publication checkpoint.
- Support reconciliation-only batches when no document requires translation.
- Preserve all mutation and authorization evidence for recovery and audit.
- Detect unauthorized reconciliation before source publication when Fetch requests downstream Translation.
- Keep manual Translation capable of catching up after a prior Fetch ran without Translation.

## Non-goals

- Running translation agents inside Fetch.
- Automatically approving every source deletion.
- Inferring a rename from Git similarity scores in production.
- Changing translation prompts or translation quality policy.
- Reintroducing retired `zdoc_cn` compatibility.
- Bypassing the `docs-production-dev` production queue.
- Retrying or repairing `REMOTE_STATE_UNKNOWN` automatically.
- Deleting hand-authored landing pages merely because a generator did not emit them.

## Terminology

- **Source baseline:** immutable commit representing the previous published English state for a source group.
- **Source checkpoint:** immutable commit containing the new published English state.
- **Target baseline:** immutable branch SHA from which translation publication starts.
- **Reconciliation operation:** one deterministic target-state mutation caused by a source deletion or path change.
- **Authorization policy:** versioned rule deciding whether an operation is automatic, requires review, or is forbidden.
- **Approval receipt:** immutable evidence that a specific plan was approved by policy or a human.
- **Reconciliation-only batch:** a batch containing target-state operations but no paid translation candidates.

## Supported Scope

| Target | Groups | Source roots | Target roots |
| --- | --- | --- | --- |
| `ja-JP` | `guides` | `content/en/guides/tutorials`, `content/en/byoc/tutorials` | Japanese Guides plugin trees |
| `ja-JP` | `python`, `java`, `node`, `go`, `cli`, `rest` | `content/en/reference` group-owned paths | Japanese Reference plugin tree |
| `zh-CN-reference` | `python`, `java`, `node`, `go`, `cli`, `rest`, manual `reference-landings` | `content/en/reference` group-owned paths | `content/zh-CN/reference` |

Chinese Guides remain direct Fetch output and are outside this translation reconciliation protocol.

## Canonical Reconciliation Plan

Create `scripts/translation/reconciliation-plan.js` and a strict schema-v1 document.

```json
{
  "schemaVersion": 1,
  "document": "translation-reconciliation-plan",
  "target": "zh-CN-reference",
  "group": "rest",
  "toolingSha": "0123456789abcdef0123456789abcdef01234567",
  "sourceBaselineSha": "1111111111111111111111111111111111111111",
  "sourceCheckpointSha": "2222222222222222222222222222222222222222",
  "targetBaselineSha": "3333333333333333333333333333333333333333",
  "policyId": "translation-reconciliation-2026-08-15-v1",
  "operations": [
    {
      "operationId": "sha256:...",
      "kind": "delete_target",
      "sourcePath": "content/en/reference/api/restful/restful/v2/old.mdx",
      "targetPath": "content/zh-CN/reference/api/restful/restful/v2/old.mdx",
      "replacementSourcePath": null,
      "replacementTargetPath": null,
      "reason": "source_deleted",
      "evidence": {
        "sourceExistedAtBaseline": true,
        "sourceMissingAtCheckpoint": true,
        "targetExistsAtBaseline": true,
        "mappingIsCanonical": true,
        "ownedByGroup": true,
        "preserved": false,
        "generatorCompletenessReceipt": "sha256:..."
      },
      "authorization": {
        "status": "approved",
        "method": "automatic",
        "ruleId": "rest-complete-generation-source-delete",
        "receiptSha256": "sha256:..."
      }
    }
  ],
  "planSha256": "..."
}
```

The plan uses canonical JSON and is deeply frozen after validation. Arrays are sorted by target, group, source path, target path, kind, and replacement path. `planSha256` is calculated with that field omitted.

### Operation kinds

Schema v1 supports:

| Kind | Meaning | Required target mutation |
| --- | --- | --- |
| `delete_target` | Source disappeared and no replacement mapping is approved | Remove the translated target and its state/cache entries |
| `replace_path` | Old source disappeared and an explicit new canonical source path replaces it | Remove old target; translate or restore the new target independently |
| `remove_navigation_only` | Source remains but a generated navigation entry was removed | Update generated navigation only; do not delete content |
| `preserve_target` | A reviewed exception intentionally retains a target-only document | Keep target and record an auditable exception |

`replace_path` is explicit. Production Git collection continues to use `--no-renames`; a rename is recognized only by authoritative generator metadata or an approved human receipt. Similarity scoring may be reported as a hint but never authorizes mutation.

## Discovery

### Source delta

For every selected unit, compare group-owned paths between `sourceBaselineSha` and `sourceCheckpointSha` using `git diff --no-renames --name-status -z`.

- `A` and `M` become translation candidate inputs.
- `D` becomes a reconciliation candidate.
- paths outside group ownership are ignored;
- deletion of declared preserved paths never becomes an automatic operation.

### Target inventory reconciliation

Compare the current source checkpoint inventory with the target baseline inventory and translation state.

Detect:

- target-only orphan files not represented by the source delta;
- translation state records whose source is no longer active;
- stale state entries where both sides are absent;
- path mappings that are noncanonical or cross group ownership;
- source-only active documents requiring translation.

This inventory comparison makes a later standalone Translation run catch deletions from any earlier Fetch, even when the original source baseline is no longer selected.

### Completeness evidence

An automatic approval rule may require a generator completeness receipt. The receipt binds:

- source group and manual;
- complete input inventory digest;
- generator fingerprint digest;
- generated output inventory digest;
- source baseline and checkpoint SHAs;
- generation and validation outcomes;
- any declared exclusions or preserved paths.

Missing, malformed, or mismatched completeness evidence changes the authorization result to `review_required`; it never degrades to automatic approval.

## Authorization Policy

Create `config/translation/reconciliation-policy.json`, master-authoritative and versioned through the normal tooling sync.

The policy determines one of:

- `approved`;
- `review_required`;
- `rejected`.

### Initial policy

| Target/group | `source_deleted` | rename/path replacement | navigation-only | preserved/landing |
| --- | --- | --- | --- | --- |
| `ja-JP/guides` | automatic after scoped immutable diff or orphan proof | delete old plus translate new; no inferred rename | automatic for generated navigation | reject automatic deletion |
| `ja-JP/Reference` | automatic after scoped immutable diff or orphan proof | delete old plus translate new; no inferred rename | automatic for generated navigation | reject automatic deletion |
| `zh-CN-reference/rest` | automatic only with complete OpenAPI generation receipt and thresholds | review required unless authoritative operation identity proves replacement | automatic for generated navigation | reject automatic deletion |
| `zh-CN-reference/SDK/CLI` | review required initially | review required | automatic only for generated navigation | reject automatic deletion |
| `zh-CN-reference/reference-landings` | review required | review required | review required | manual only |

### Automatic approval thresholds

All automatic rules must also satisfy configurable blast-radius limits:

- maximum operation count;
- maximum percentage of active source inventory;
- no deletion of an entire owned root;
- no unexpected disappearance of the source inventory or generator receipt;
- no duplicate or conflicting target operations;
- target baseline must equal the authenticated publication baseline;
- every path must be a regular file under an owned root with no symlink ancestors.

Threshold failure produces `review_required`, not partial automatic execution.

### Human approval

When review is required, the workflow uploads `translation-reconciliation-review-<target>-<group>-<run>-<batch>.json` and stops before paid work or publication.

A reviewer approves the exact `planSha256` through one of two supported mechanisms:

1. merge a bot-generated PR containing a durable policy exception when the decision should apply to future equivalent states; or
2. dispatch a recovery workflow with a signed/validated approval receipt bound to the plan, source SHAs, target baseline, tooling SHA, reviewer identity, rationale, and expiry.

Changing any operation or identity invalidates the receipt.

`config/reference-retirements.json` remains readable during migration but becomes a legacy authorization adapter. New runtime decisions use the shared plan and receipt contract.

## Execution Semantics

Create `scripts/translation/apply-reconciliation-plan.js`.

The executor:

1. validates the plan and approval receipts;
2. rechecks source and target baseline identities;
3. verifies all path ownership and filesystem safety constraints;
4. stages target removals and state updates in a private workspace;
5. updates target-specific state through adapters;
6. emits a reconciliation result bound to `planSha256`;
7. leaves final branch mutation to the existing checkpoint publication transaction.

### Japanese state adapter

For `ja-JP`:

- remove selected Japanese files;
- remove source and target cache keys from `.translation-cache/ja-JP.json`;
- remove cache entries whose `targetPath` references a deleted target;
- ensure new replacement paths enter the ordinary translation candidate set;
- report byte-level removed paths and cache keys.

This preserves current Japanese behavior while changing the transport schema.

### Chinese Reference state adapter

For `zh-CN-reference`:

- `delete_target` removes the Chinese target file;
- remove the active or retired record for that source/target pair;
- remove stale pending or language-excluded overlap if and only if the operation explicitly owns it;
- rebuild the group-scoped source and translation manifests from the post-operation snapshot;
- keep an immutable reconciliation ledger record in generated state rather than retaining a target-only `retired` record;
- `preserve_target` remains representable as an explicit exception record and is never produced automatically.

The ledger is proposed at:

```text
generated/zh-CN/manifests/reference-reconciliation-ledger.json
```

It stores completed operation identity and evidence, not standing authorization. A later restoration of both source and target is not blocked by old ledger history.

### Reconciliation result

```json
{
  "schemaVersion": 1,
  "document": "translation-reconciliation-result",
  "planSha256": "...",
  "targetBaselineSha": "...",
  "status": "applied",
  "operations": [
    {
      "operationId": "sha256:...",
      "status": "applied",
      "removedPaths": ["content/zh-CN/reference/.../old.mdx"],
      "removedStateKeys": ["content/en/reference/.../old.mdx"]
    }
  ],
  "resultSha256": "..."
}
```

Allowed statuses are `applied`, `already_applied`, `review_required`, `rejected`, and `failed`. Idempotent replay must produce `already_applied` only after verifying the expected post-state.

## Translation Manifest and Batch Contract

Replace locale-specific `source_delta` payloads with:

```json
{
  "reconciliation": {
    "planArtifact": "translation-reconciliation-plan-...",
    "planSha256": "...",
    "operationCount": 2
  }
}
```

The actual plan remains a separate immutable artifact to keep manifests bounded.

Batch preparation creates one reconciliation-only batch when:

- translation candidate count is zero; and
- approved operation count is greater than zero.

When translation candidates exist, the same plan identity is attached to every batch, but reconciliation operations are owned by exactly one canonical batch. Other batches declare the same plan digest and zero operation ownership. This prevents repeated deletion attempts while allowing every artifact to authenticate the global plan.

Paid model invocation starts only after all operations are either approved or proven unrelated to the selected batch.

## Fetch Integration

Fetch remains the source producer. It does not execute translated target mutations.

When `run_translations=true`, each source producer creates a reconciliation preflight artifact from its staged source checkpoint and the immutable target baseline. Before `publish_ready` writes any source unit, the source publication barrier verifies:

- every detected target-impacting deletion has an `approved` or `review_required` classification;
- no operation is `rejected` or structurally invalid;
- any required human approval already exists if production policy forbids partial source publication.

Initial rollout policy is:

- approved automatic operations permit source publication;
- review-required operations stop before source publication and open/upload the review package;
- artifact-only Fetch may complete without target mutation but must report the unresolved plan.

This removes the current failure mode where all English units publish and Chinese reconciliation fails afterward.

If `run_translations=false`, Fetch may publish source-only after recording the pending reconciliation plan in its result artifacts. It must not mutate target content. A later Translation recomputes and authenticates the plan against current target state rather than trusting an expired artifact blindly.

## Handoff Contract

Advance the Fetch-to-Translation handoff to schema v3. Each unit adds:

```json
{
  "reconciliationPlanArtifact": "translation-reconciliation-plan-...",
  "reconciliationPlanSha256": "...",
  "reconciliationPolicyId": "translation-reconciliation-2026-08-15-v1"
}
```

The handoff validator verifies:

- plan source SHAs equal the unit source publication identities;
- plan target baseline equals the reconciled global target baseline;
- target, group, and tooling SHA match the unit;
- artifact digest and canonical plan digest match;
- every selected source group has exactly one plan, including an empty plan.

An empty plan is evidence that reconciliation was evaluated, not that the check was skipped.

## Publication

Translation checkpoint artifacts include:

- translated files;
- target baseline files needed for three-way application;
- reconciliation plan and approval receipt;
- reconciliation result;
- updated target state/cache;
- validation reports.

The existing publisher remains the only Git writer. It applies the checkpoint against the authenticated target branch SHA, validates the group, commits, and pushes through the publication transaction.

Publication results add plan/result digests to unit evidence. A successful translation unit proves both translation and reconciliation terminal state.

All ordinary publication conflict and retry rules remain. `REMOTE_STATE_UNKNOWN` remains a safe stop and must never cause reconciliation replay or another paid Translation run automatically.

## Validation

### Common invariants

After applying a plan:

- no target file exists without active source coverage or an explicit `preserve_target` exception;
- no active source is missing translation, pending, or language-exclusion coverage;
- all target and state paths use canonical group mappings;
- no state entry refers to a removed target;
- every completed operation is represented in the reconciliation result and ledger/cache mutation report;
- the plan and result identities match the checkpoint artifact.

### Japanese invariants

- deleted target files are absent;
- all corresponding cache keys are absent;
- no orphan translation remains in selected ownership;
- replacement sources are translated or remain explicit pending candidates.

### Chinese Reference invariants

- deleted target files are absent unless an approved `preserve_target` operation exists;
- active/retired records do not retain both-missing or target-only deleted mappings;
- source and translation manifests cover the exact post-operation trees;
- reconciliation ledger entries match completed result operations;
- Reference navigation contains no removed target route.

## Recovery

Extend `recover-translation.yml` to authenticate reconciliation evidence before reusing paid output.

Recovery compatibility requires exact matches for:

- tooling SHA;
- target and group;
- source baseline/checkpoint SHA;
- target baseline or a validated publication ancestry transition;
- policy ID;
- plan SHA;
- approval receipt SHA;
- operation ownership batch;
- prompt/model identities for paid translation files.

Recovery may reuse translated files while recomputing the reconciliation plan only when the new plan is byte-identical. A changed plan invalidates publication reuse for the affected unit but does not invalidate unrelated paid files; they must be revalidated against the new target baseline.

`publish=false` remains the first recovery step. It reports:

- reusable translations;
- reusable reconciliation operations;
- already-applied operations;
- changed or rejected operations;
- missing approvals;
- expected production mutations.

## Observability

Progress and final cards report per unit:

- discovered delete/replace/preserve counts;
- automatic, human-approved, review-required, and rejected counts;
- plan SHA and policy ID;
- reconciliation-only status;
- applied/already-applied/failed counts;
- removed target and state counts;
- exact review or recovery artifact links;
- whether paid work was skipped.

A Fetch card must distinguish:

- source published, translation not requested;
- source publication stopped for reconciliation review;
- handoff created with approved reconciliation;
- downstream Translation terminal status unknown or failed.

## Migration

### Compatibility period

During migration:

- readers accept legacy Japanese `source_delta` and Chinese retirement registry inputs;
- writers emit only the new plan/result schema once the shared executor is enabled for a target;
- legacy inputs are adapted into an in-memory reconciliation plan and validated under the new ownership rules;
- checkpoint artifacts declare which contract version they use;
- recovery supports retained legacy artifacts through an explicit compatibility adapter.

### Registry transition

`config/reference-retirements.json` remains master-authoritative until every Chinese Reference group publishes successfully with the new ledger.

Then:

- active source/target exceptions migrate to `preserve_target` policy exceptions;
- stale both-missing entries are removed;
- completed deletions move to the generated ledger and no longer require standing policy entries;
- the registry becomes read-only compatibility input before final retirement in a separate task.

No bulk registry deletion occurs in the initial implementation.

## Failure Codes

Add stable reconciliation failure codes:

| Code | Meaning | Retry behavior |
| --- | --- | --- |
| `RECONCILIATION_PLAN_INVALID` | Schema, checksum, ownership, or identity failure | non-retryable until inputs change |
| `RECONCILIATION_REVIEW_REQUIRED` | Valid plan lacks required approval | non-retryable; obtain approval |
| `RECONCILIATION_REJECTED` | Policy forbids operation | non-retryable |
| `RECONCILIATION_BASELINE_CHANGED` | Target no longer matches authenticated baseline | rebuild plan against new baseline |
| `RECONCILIATION_APPLY_FAILED` | Local staged mutation failed | retryable only with unchanged identities |
| `RECONCILIATION_VALIDATION_FAILED` | Post-mutation invariants failed | non-retryable until corrected |
| `REMOTE_STATE_UNKNOWN` | Existing Git writer uncertainty | safe stop; no automatic retry |

## Rollout Phases

1. Define shared schemas, discovery, policy evaluation, and evidence without changing publication behavior.
2. Migrate Japanese Guides and Japanese Reference to the shared plan while preserving current deletion semantics.
3. Add Chinese Reference plan generation and review artifacts while retaining registry-backed `preserve_target` behavior.
4. Enable physical Chinese target deletion and ledger updates for reviewed operations.
5. Enable strict automatic REST deletion with complete-generation receipts and blast-radius limits.
6. Add SDK/CLI automatic policies only after retained-artifact evidence proves complete source inventories.
7. Move Fetch reconciliation preflight before publication and advance handoff to schema v3.
8. Retire legacy transport fields and, in a later explicit task, the static retirement registry.

## Acceptance Criteria

- The same source deletion produces the same canonical operation shape for all supported targets.
- Japanese behavior remains byte-for-byte equivalent after plan adaptation.
- Chinese deletion can be completed without hand-editing translated content or manifests.
- A review-required operation stops before paid work and before production target mutation.
- A reconciliation-only run publishes a deletion with zero model calls.
- A source-only Fetch is caught up by a later Translation through inventory reconciliation.
- A rename never silently loses the old target or skips translation of the new source.
- Every published mutation is bound to plan, approval, source, target, tooling, and publication identities.
- Recovery can distinguish reusable paid output from stale reconciliation operations.
- Unknown remote state never triggers automatic replay.
- Workflow-policy, TypeScript boundary, translation, publication contract, and real-artifact replay checks pass.
