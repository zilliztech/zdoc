# ZDoc Localization Existing Empty Target Design

**Date:** 2026-07-16

**Status:** Approved in conversation; implementation authorized

## Objective

Extend `zdoc-localize` so a registered mirror pair can safely initialize a user-created Chinese Feishu document whose body is empty. The workflow must translate the full English source into the specified target, preserve non-translatable resources deliberately, retain the existing review and exact-preview approval gates, and create the localization receipt only after all automatic and manual work is verified.

The same model must also support later incremental runs:

- Feishu native synced code blocks remain Feishu-managed and are never rewritten by `zdoc-localize`.
- Whiteboards are mirrored by `zdoc-localize` and refreshed when the English Whiteboard changes.
- Existing translated documents continue to use bootstrap adoption before incremental localization.

## Chosen Approach

Keep `plan create --pair <id>` as the single planning entry point. When a pair has no receipt, inspect the real remote target and route automatically:

1. no target document → create a new Chinese document;
2. existing target with a title and no body blocks → initialize that existing target;
3. existing target with any body block → require normal bootstrap adoption.

`bootstrap accept` uses the same inspection module and rejects an empty target with `empty_target_requires_initialization`. This prevents the current failure mode where the complete English source and an empty Chinese target can be recorded as an already-synchronized baseline.

### Alternatives considered

1. **Explicit `bootstrap initialize-existing` command.** Clear, but makes callers classify the remote document themselves and expands the Skill and CLI interface.
2. **Automatic routing from `plan create`.** Chosen because it keeps one planning interface while the CLI owns the safety-critical remote inspection.
3. **Registry `initialization_mode` field.** Explicit but requires unnecessary Base schema, pair-management, and migration complexity.

## Initialization Disposition Module

Introduce a deep module with a small interface:

```ts
inspectInitialization(pair, receipt): Promise<InitializationDisposition>
```

The result is a closed union:

```ts
type InitializationDisposition =
  | {kind: 'incremental'}
  | {kind: 'create_target'}
  | {kind: 'initialize_empty_target'; source: SemanticDocument; target: SemanticDocument}
  | {kind: 'adopt_existing_target'; source: SemanticDocument; target: SemanticDocument};
```

Strictly empty means:

- a title block is allowed;
- zero body blocks are allowed;
- an empty paragraph, placeholder text, image, Whiteboard, synced reference, or any other body block makes the target non-empty.

The existing title is not trusted as translated content. Empty-target initialization plans a reviewed title replacement.

## Workflow State Model

Runs without manual work retain the existing path:

```text
scanning
→ translation_required
→ review_required
→ applying
→ verifying
→ completed
```

Runs containing native synced-code actions pause after automatic writes:

```text
scanning
→ translation_required
→ review_required
→ applying
→ manual_action_required
→ verifying
→ completed
```

`manual_action_required` is an expected workflow state, not a failure state. While a run is in this state:

- no final localization receipt exists;
- the pair remains `needs_bootstrap`;
- translation memory is not advanced;
- the CLI must not report the localization as complete.

Add `manual_action_required` to the `localization_runs.state` single-select options and the **Needs Review** view.

## Semantic Content Model

Recognize the real Feishu XML forms:

```xml
<synced-source>
<synced_source>
<synced_reference>
```

The current parser recognizes `synced_source` but misses the real `<synced-source>` spelling. Both source spellings must produce the same semantic kind.

Extend semantic node kinds with explicit native-sync identities rather than treating them as generic `resource` or `opaque` nodes:

```ts
type SyncedSourceIdentity = {
  sourceDocumentId: string;
  sourceBlockId: string;
};

type SyncedReferenceIdentity = {
  targetBlockId: string;
  sourceDocumentId: string;
  sourceBlockId: string;
};
```

The source identity is protected data. It may appear in reviews and previews but is never editable.

## Plan Version 2

Upgrade newly generated plans to `planVersion: 2` and represent handling policy explicitly:

```ts
type PlanOperation =
  | TranslationOperation
  | VerbatimCodeOperation
  | WhiteboardMirrorOperation
  | ManualSyncedReferenceOperation
  | VerifySyncedReferenceOperation
  | DeleteOperation;
```

Operation behavior is:

| Source content | Operation | Translation request | Target write |
|---|---|---:|---:|
| Title, heading, paragraph, list, quote, supported callout | `translation` | Yes | Insert or replace reviewed Chinese |
| Ordinary `<pre>` code block | `verbatim_code` | No | Insert unchanged |
| Whiteboard | `whiteboard_mirror` | No | Create or update an independent mirrored board |
| New `source_synced` | `manual_synced_reference` | No | Insert a placeholder, then wait for a human |
| Existing matching native reference | `verify_synced_reference` | No | No write; verify only |
| Approved deletion | `delete` | No | Delete exact planned blocks |

Only `translation` operations contain editable review regions. Every other operation is immutable review metadata.

The apply preview labels effects explicitly:

- `WRITE` — translated or verbatim document content;
- `MIRROR` — Whiteboard mirroring;
- `MANUAL` — placeholder plus required Feishu UI action;
- `VERIFY_ONLY` — native synchronization verification with no document write;
- `DELETE` — exact planned deletion.

Continue reading pending plan version 1 runs for apply and recovery. All newly created plans use version 2.

## Native Synced Code Blocks

Feishu block types `49 source_synced` and `50 reference_synced` are query-only in the public OpenAPI and cannot be created or copied by `lark-cli 1.0.67`. `zdoc-localize` therefore supports native sync through manual creation plus deterministic verification.

Primary-source research is recorded in [`packages/zdoc-localize/docs/native-synced-blocks-research.md`](../../../packages/zdoc-localize/docs/native-synced-blocks-research.md).

### Initial insertion

For every `source_synced` node, create a `manual_synced_reference` operation. Automatic apply inserts a conspicuous callout placeholder at the exact intended position. The placeholder contains:

- the immutable operation ID;
- the source document ID;
- the source synced-block ID;
- a direct link to the source synced block;
- instructions to replace the callout with a native Feishu synced reference.

After all automatic operations are verified, persist:

- `target-after-automatic-apply.xml`;
- `manual-actions.json`;
- placeholder block IDs;
- the expected predecessor and successor identities for each placeholder;
- the expected source document/block identities.

Then transition to `manual_action_required`.

### Manual verification

Add:

```bash
zdoc-localize manual verify --run <run-id> --format json
```

This command performs no document write. It verifies that:

1. each placeholder is gone;
2. exactly one `reference_synced` occupies the expected structural position;
3. it points to the approved source document and source block;
4. the source block still exists as `source_synced`;
5. all other reviewed and automatically written content is unchanged;
6. no unplanned target edits occurred.

Only after all checks pass does the command transition through `verifying`, save the source and target snapshots, persist the receipt, mark the pair active, update translation memory, and complete the run.

### Incremental synced-code changes

If descendants inside an existing `source_synced` change but its source document/block identity remains stable:

- generate `verify_synced_reference`;
- verify the target reference points to the same source identity;
- perform no target write;
- let Feishu provide the rendered propagation;
- advance the receipt after readback verification.

Typed failures are:

- `synced_source_missing`;
- `synced_reference_missing`;
- `synced_reference_mismatch`;
- `synced_reference_ambiguous`.

Never flatten a native synced block into ordinary code while claiming synchronization.

## Whiteboard Mirroring

Whiteboards are independent mirrored resources, not native synced blocks.

Use a `WhiteboardMirror` deep module:

```ts
snapshot(token): Promise<CanonicalWhiteboard>
mirror(sourceToken, targetToken, idempotencyKey): Promise<MirrorResult>
verify(sourceToken, targetToken): Promise<VerificationResult>
```

### Initial mirror

1. Insert a blank Whiteboard block at the planned target position.
2. Capture the new target Whiteboard token from the document-write response.
3. Export source raw nodes with `lark-cli whiteboard +query --output_as raw`.
4. Overwrite the blank target with `lark-cli whiteboard +update --input_format raw --overwrite` and a deterministic idempotency token.
5. Export target raw nodes.
6. Normalize dynamic node IDs and other server-assigned fields.
7. Compare canonical source and target hashes.

### Incremental mirror

When the source Whiteboard canonical hash changes, update the existing target Whiteboard token in place and verify the normalized raw-node hash. Preserve the target document block and token.

Before every Whiteboard update, save the target raw snapshot so recovery can restore it. A failed or mismatched mirror is a partial write when the target board may have changed.

Typed failures are:

- `whiteboard_source_unreadable`;
- `whiteboard_target_missing`;
- `whiteboard_mirror_failed`;
- `whiteboard_verification_mismatch`.

## Modules and Adapters

### `InitializationInspector`

Owns remote-target classification and the bootstrap empty-target guard.

### `InitialPlanBuilder`

Builds the initial insert/replace plan against an existing empty target while reusing translation-input, glossary, review, preview, and snapshot machinery.

### `SyncedBlockCoordinator`

Owns native-sync parsing, correspondence, manual actions, incremental verify-only behavior, and exact reference validation.

### `WhiteboardMirror`

Owns raw export, normalization, idempotent overwrite, hash verification, and recovery snapshots.

### `ManualActionVerifier`

Validates the target delta from the post-automatic snapshot to the final manual state and finalizes the receipt.

### `LarkDocsAdapter`

Extend write results with new resource metadata:

```ts
type NewBlock = {
  blockId: string;
  blockType: string;
  blockToken?: string;
};
```

### `LarkWhiteboardAdapter`

Add an adapter for raw query/update operations and idempotency-token handling. Business workflows must not construct `lark-cli whiteboard` arguments directly.

## Receipt Correspondences

Use typed correspondences in receipt payloads and snapshots:

```ts
type Correspondence =
  | {kind: 'content'; sourceNodeId: string; targetNodeId: string}
  | {
      kind: 'native_sync';
      sourceNodeId: string;
      targetNodeId: string;
      sourceDocumentId: string;
      sourceBlockId: string;
    }
  | {
      kind: 'copied_resource';
      sourceNodeId: string;
      targetNodeId: string;
      resourceKind: 'whiteboard';
      sourceResourceHash: string;
    };
```

Continue accepting legacy untyped `{sourceNodeId, targetNodeId}` correspondence entries and normalize them to `kind: 'content'` when read.

## Concurrency and Staleness

Normal review and apply remain bound to source/target revisions and canonical hashes.

During `manual_action_required`:

- changes limited to descendants of already planned `source_synced` nodes are allowed because Feishu owns their propagation;
- any translatable or structural English change prevents finalization with `manual_source_changed`;
- unexpected Chinese changes prevent finalization with `manual_target_changed`.

The run retains all evidence and does not save a receipt.

`recover inspect` must understand `manual_action_required`. If the current target differs from the prewrite state only by verified automatic operations and expected manual replacements, it may report a safe reverse. `recover reverse --preview` remains approval-token gated and restores the original empty target plus any pre-existing title.

## CLI and Capability Contract

Adjusted commands:

```bash
zdoc-localize plan create --pair <id> --format json
zdoc-localize bootstrap accept --run <id> --format json
zdoc-localize status --run <id> --format json
```

New command:

```bash
zdoc-localize manual verify --run <id> --format json
```

Add capabilities:

```json
[
  "existing-empty-target-initialization-v1",
  "manual-synced-reference-v1",
  "whiteboard-mirror-v1"
]
```

`apply` returns `state: manual_action_required` and `manualActionsPath` when manual work remains. `status` exposes the immutable manual-action summary and validation failures without requiring callers to decode internal snapshot payloads.

## Error Model

New stable subtypes include:

- `empty_target_requires_initialization`;
- `existing_target_not_empty`;
- `manual_action_not_required`;
- `manual_placeholder_missing`;
- `manual_reference_missing`;
- `manual_reference_mismatch`;
- `manual_reference_ambiguous`;
- `manual_source_changed`;
- `manual_target_changed`;
- `synced_source_missing`;
- `synced_reference_missing`;
- `synced_reference_mismatch`;
- `synced_reference_ambiguous`;
- `whiteboard_source_unreadable`;
- `whiteboard_target_missing`;
- `whiteboard_mirror_failed`;
- `whiteboard_verification_mismatch`.

Validation and unsupported-state errors remain pre-write blockers. Whiteboard failures after a target board mutation become `partial_write`. Manual verification failures remain `manual_action_required` unless evidence shows an uncontrolled target mutation requiring recovery.

## Testing Strategy

### Domain tests

- strict empty target accepts title-only XML and rejects every body-block type;
- `plan create` routes correctly for receipt, missing target, empty target, and non-empty target;
- bootstrap acceptance rejects an empty target;
- parser recognizes `synced-source`, `synced_source`, and `synced_reference` with typed identities;
- plan version 2 review permits edits only for translation operations;
- legacy plan version 1 and legacy correspondences remain readable;
- state machine accepts `applying → manual_action_required → verifying → completed` and rejects illegal transitions.

### Planning tests

- empty-target initialization emits title replacement and full body insert operations;
- ordinary code emits `verbatim_code` without a translation request;
- Whiteboard emits `whiteboard_mirror` without a translation request;
- source synced blocks emit `manual_synced_reference` and manual actions;
- existing matching references emit `verify_synced_reference` with no write;
- missing, mismatched, and ambiguous references block deterministically.

### Apply and verification tests

- automatic operations are revision-bound and individually read back;
- placeholder metadata and position evidence are persisted;
- apply pauses without receipt when manual actions exist;
- manual verify accepts an exact replacement and finalizes once;
- repeated manual verify is idempotent;
- manual verify rejects missing, wrong, duplicate, or misplaced references;
- allowed synced-source descendant changes do not invalidate finalization;
- unrelated source or target edits prevent finalization;
- translation memory updates only after final verification.

### Whiteboard tests

- raw-node canonicalization ignores only documented server-assigned fields;
- initial mirror creates and fills a blank target board;
- incremental mirror updates an existing target board token;
- idempotency keys are stable per run/operation;
- mismatched readback creates the correct failure state;
- recovery restores the prewrite raw board snapshot.

### Adapter and CLI tests

- document adapter exposes newly created block IDs/tokens;
- Whiteboard adapter issues the expected query/update commands;
- capabilities include the three new feature flags;
- registry schema contains `manual_action_required`;
- `manual verify` CLI JSON contracts are stable;
- `status` exposes manual actions without leaking secrets.

### Live dogfood tests

Use dedicated Feishu documents only. Verify:

1. title-only target is detected as empty;
2. full translation review and preview are generated;
3. Whiteboard is mirrored and raw-hash verified;
4. synced code produces a placeholder and manual action;
5. manual UI replacement is verified;
6. receipt and pair state advance only after manual verification;
7. a later source synced-code change performs no Chinese document write;
8. a later source Whiteboard change refreshes the target board;
9. readback, Base receipt projection, and Drive snapshots all match.

No live test may use whole-document overwrite or modify the English source.

## Documentation Changes

Update:

- `packages/zdoc-localize/README.md` with automatic routing, manual verification, and Whiteboard mirroring;
- `skills/zdoc-localization/SKILL.md` with the empty-target guard and manual-action workflow;
- `skills/zdoc-localization/references/workflow.md` with plan v2 operation handling;
- `skills/zdoc-localization/references/errors.md` with manual and resource recovery routing.

## Acceptance Criteria

The feature is complete when:

- a registered mirror pair targeting a title-only Chinese document produces a full initial localization plan rather than requiring or accepting bootstrap;
- title, translatable text, ordinary code, and Whiteboards are represented by the approved operation policies;
- native synced code is represented by placeholders and exact manual actions, never flattened silently;
- apply cannot complete or save a receipt while a manual action remains;
- `manual verify` validates exact native references and completes idempotently;
- later synced-code changes perform verification only and no target code write;
- later Whiteboard changes mirror and verify raw content;
- all writes retain preview approval, revision binding, per-operation readback, partial-write evidence, and recovery support;
- registry schema, capabilities, CLI docs, Skill instructions, tests, and live dogfood evidence are updated consistently.
