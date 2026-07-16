# ZDoc Localization Existing Empty Target Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely initialize a registered title-only Chinese Feishu document from the full English source, mirror Whiteboards, pause for manual native synced-code insertion, verify the result, and reuse the same resource model for later incremental runs.

**Architecture:** `plan create` delegates uninitialized-pair classification to an `InitializationInspector`; version-2 plans use typed operation policies instead of treating every change as translated text. `SyncedBlockCoordinator`, `WhiteboardMirror`, and `ManualActionVerifier` hide Feishu-specific resource behavior behind small interfaces, while the existing workflow retains revision binding, review protection, preview approval, per-operation readback, receipts, and recovery.

**Tech Stack:** TypeScript 5.6, Vitest 4, Commander 12, Node.js 20+, `lark-cli 1.0.67`, Feishu Docx/OpenAPI, Feishu Whiteboard OpenAPI, SQLite, Feishu Base and Drive snapshots.

---

## File Map

- Create `packages/zdoc-localize/src/domain/initialization.ts`: strict-empty classification and initialization disposition types.
- Create `packages/zdoc-localize/src/domain/native-sync.ts`: native sync identities, correspondence normalization, planning, and verification helpers.
- Create `packages/zdoc-localize/src/domain/whiteboard.ts`: raw-node normalization and canonical hashing.
- Create `packages/zdoc-localize/src/application/initialization-inspector.ts`: fetch and classify uninitialized pairs.
- Create `packages/zdoc-localize/src/application/whiteboard-mirror.ts`: query, overwrite, verify, and snapshot Whiteboards.
- Create `packages/zdoc-localize/src/application/manual-actions.ts`: placeholder construction and manual replacement verification.
- Create `packages/zdoc-localize/src/adapters/lark-whiteboard-adapter.ts`: `lark-cli whiteboard` adapter.
- Modify `packages/zdoc-localize/src/application/ports.ts`: typed correspondences and document/Whiteboard gateway interfaces.
- Modify `packages/zdoc-localize/src/application/runtime.ts`: construct and inject the Whiteboard adapter.
- Modify `packages/zdoc-localize/src/application/workflows.ts`: automatic routing, plan v2, typed apply effects, manual pause/finalization, incremental resource handling, and recovery integration.
- Modify `packages/zdoc-localize/src/adapters/lark-docs-adapter.ts`: return created block IDs/tokens and support blank-resource insertions.
- Modify `packages/zdoc-localize/src/adapters/lark-base-schema.ts`: add `manual_action_required`.
- Modify `packages/zdoc-localize/src/domain/model.ts`: native-sync node kinds and run state.
- Modify `packages/zdoc-localize/src/domain/review.ts`: plan version 2 and protected non-translation operations.
- Modify `packages/zdoc-localize/src/domain/state-machine.ts`: manual-action transitions.
- Modify `packages/zdoc-localize/src/domain/xml-parser.ts`: parse real synced tags and resource identities.
- Modify `packages/zdoc-localize/src/cli/program.ts`: capabilities and `manual verify`.
- Modify `packages/zdoc-localize/test/domain-foundation.test.ts`, `xml-parser.test.ts`, `storage.test.ts`, `planning-workflow.test.ts`, `review.test.ts`, `translation-protocol.test.ts`, `adapters.test.ts`, `apply-workflow.test.ts`, `validation-report.test.ts`, `diff-alignment.test.ts`, `lark-base-schema.test.ts`, `cli-contract.test.ts`, and `skill-compatibility.test.ts`.
- Modify `packages/zdoc-localize/README.md`, `skills/zdoc-localization/SKILL.md`, `skills/zdoc-localization/references/workflow.md`, and `skills/zdoc-localization/references/errors.md`.

## Task 1: Add the manual workflow state and registry contract

**Files:**
- Modify: `packages/zdoc-localize/src/domain/model.ts`
- Modify: `packages/zdoc-localize/src/domain/state-machine.ts`
- Modify: `packages/zdoc-localize/src/adapters/lark-base-schema.ts`
- Modify: `packages/zdoc-localize/src/cli/program.ts`
- Modify: `packages/zdoc-localize/test/domain-foundation.test.ts`
- Modify: `packages/zdoc-localize/test/lark-base-schema.test.ts`
- Modify: `packages/zdoc-localize/test/cli-contract.test.ts`

- [ ] **Step 1: Write failing state-machine and schema tests**

Add to `domain-foundation.test.ts`:

```ts
it('allows an applying run to pause for a planned manual action', () => {
  expect(transitionRun('applying', 'manual_action_required')).toBe('manual_action_required');
  expect(transitionRun('manual_action_required', 'verifying')).toBe('verifying');
});

it('does not let a manual-action run complete without verification', () => {
  expect(() => transitionRun('manual_action_required', 'completed')).toThrowError(
    expect.objectContaining({subtype: 'illegal_state_transition'}),
  );
});
```

Add assertions that the registry state Label options and capabilities contain:

```ts
expect(stateField.options).toEqual(expect.arrayContaining([
  expect.objectContaining({name: 'manual_action_required'}),
]));

expect(capabilities.data.features).toEqual(expect.arrayContaining([
  'existing-empty-target-initialization-v1',
  'manual-synced-reference-v1',
  'whiteboard-mirror-v1',
]));
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
pnpm --filter zdoc-localize test -- domain-foundation.test.ts lark-base-schema.test.ts cli-contract.test.ts
```

Expected: FAIL because the state and capability values do not exist.

- [ ] **Step 3: Implement the state and capability contract**

Add `manual_action_required` to `RunState`, the state transition table, and registry schema:

```ts
const transitions: Readonly<Record<RunState, readonly RunState[]>> = {
  scanning: ['classification_required', 'translation_required', 'blocked'],
  classification_required: ['translation_required', 'blocked'],
  translation_required: ['review_required', 'blocked'],
  review_required: ['stale', 'applying', 'blocked'],
  stale: ['scanning'],
  applying: ['manual_action_required', 'verifying', 'partial', 'blocked'],
  manual_action_required: ['verifying', 'partial', 'blocked', 'recovering'],
  verifying: ['completed', 'blocked'],
  completed: [],
  blocked: ['scanning'],
  partial: ['recovering'],
  recovering: ['scanning', 'partial', 'blocked'],
};
```

Add the new state to the **Needs Review** view and add the three approved feature flags. Keep `CLI_VERSION` at `0.1.0` during development; bump it only in the final release task.

- [ ] **Step 4: Run focused tests**

Run the command from Step 2.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/domain/model.ts packages/zdoc-localize/src/domain/state-machine.ts packages/zdoc-localize/src/adapters/lark-base-schema.ts packages/zdoc-localize/src/cli/program.ts packages/zdoc-localize/test/domain-foundation.test.ts packages/zdoc-localize/test/lark-base-schema.test.ts packages/zdoc-localize/test/cli-contract.test.ts
git commit -m "feat(localize): add manual action workflow state"
```

## Task 2: Parse and model native synced blocks

**Files:**
- Create: `packages/zdoc-localize/src/domain/native-sync.ts`
- Modify: `packages/zdoc-localize/src/domain/model.ts`
- Modify: `packages/zdoc-localize/src/domain/xml-parser.ts`
- Modify: `packages/zdoc-localize/src/application/ports.ts`
- Modify: `packages/zdoc-localize/test/xml-parser.test.ts`
- Create: `packages/zdoc-localize/test/native-sync.test.ts`
- Modify: `packages/zdoc-localize/test/storage.test.ts`

- [ ] **Step 1: Write parser tests for real Feishu tag spellings**

```ts
it('parses real source and reference synced blocks with protected identities', () => {
  const source = parseFeishuDocument(
    '<synced-source id="src-block"><pre id="code"><code>print(1)</code></pre></synced-source>',
    {documentId: 'source-doc', revisionId: 3},
  );
  const target = parseFeishuDocument(
    '<synced_reference id="ref-block" src-token="source-doc" src-block-id="src-block"></synced_reference>',
    {documentId: 'target-doc', revisionId: 7},
  );

  expect(source.nodes[0]).toMatchObject({
    kind: 'synced_source',
    writable: false,
    remote: {blockId: 'src-block', sourceDocumentId: 'source-doc', sourceBlockId: 'src-block'},
  });
  expect(target.nodes[0]).toMatchObject({
    kind: 'synced_reference',
    writable: false,
    remote: {blockId: 'ref-block', sourceDocumentId: 'source-doc', sourceBlockId: 'src-block'},
  });
});

it('accepts the underscore source spelling for compatibility', () => {
  const document = parseFeishuDocument('<synced_source id="src"></synced_source>', {
    documentId: 'doc', revisionId: 1,
  });
  expect(document.nodes[0]?.kind).toBe('synced_source');
});
```

- [ ] **Step 2: Write correspondence normalization tests**

Define the new receipt type and verify legacy entries normalize:

```ts
expect(normalizeCorrespondences([
  {sourceNodeId: 's1', targetNodeId: 't1'},
  {
    kind: 'native_sync', sourceNodeId: 's2', targetNodeId: 't2',
    sourceDocumentId: 'doc-en', sourceBlockId: 'sync-1',
  },
])).toEqual([
  {kind: 'content', sourceNodeId: 's1', targetNodeId: 't1'},
  {
    kind: 'native_sync', sourceNodeId: 's2', targetNodeId: 't2',
    sourceDocumentId: 'doc-en', sourceBlockId: 'sync-1',
  },
]);
```

- [ ] **Step 3: Run tests and verify failure**

```bash
pnpm --filter zdoc-localize test -- xml-parser.test.ts native-sync.test.ts storage.test.ts
```

Expected: FAIL because the synced kinds and normalization module are missing.

- [ ] **Step 4: Implement explicit sync identities**

Add node kinds `synced_source` and `synced_reference`. Extend `SemanticNode.remote` with optional `sourceDocumentId` and `sourceBlockId`. Map both source tag spellings and the reference tag before the generic `resource` mapping.

Create:

```ts
export type Correspondence =
  | {kind: 'content'; sourceNodeId: string; targetNodeId: string}
  | {
      kind: 'native_sync'; sourceNodeId: string; targetNodeId: string;
      sourceDocumentId: string; sourceBlockId: string;
    }
  | {
      kind: 'copied_resource'; sourceNodeId: string; targetNodeId: string;
      resourceKind: 'whiteboard'; sourceResourceHash: string;
    };

export function normalizeCorrespondences(
  values: Array<Correspondence | {sourceNodeId: string; targetNodeId: string}>,
): Correspondence[] {
  return values.map((value) => 'kind' in value ? value : {kind: 'content', ...value});
}
```

Update `LocalizationReceipt.correspondences` to accept typed entries while registry deserialization remains tolerant of legacy payloads.

- [ ] **Step 5: Run focused tests**

Run the command from Step 3.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/zdoc-localize/src/domain/native-sync.ts packages/zdoc-localize/src/domain/model.ts packages/zdoc-localize/src/domain/xml-parser.ts packages/zdoc-localize/src/application/ports.ts packages/zdoc-localize/test/xml-parser.test.ts packages/zdoc-localize/test/native-sync.test.ts packages/zdoc-localize/test/storage.test.ts
git commit -m "feat(localize): model native synced blocks"
```

## Task 3: Classify uninitialized targets and guard bootstrap acceptance

**Files:**
- Create: `packages/zdoc-localize/src/domain/initialization.ts`
- Create: `packages/zdoc-localize/src/application/initialization-inspector.ts`
- Modify: `packages/zdoc-localize/src/application/ports.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Create: `packages/zdoc-localize/test/initialization.test.ts`
- Modify: `packages/zdoc-localize/test/planning-workflow.test.ts`

- [ ] **Step 1: Write strict-empty classification tests**

```ts
describe('strict empty target detection', () => {
  it('accepts a title-only document', () => {
    expect(isStrictlyEmptyTarget(parseFeishuDocument('<title id="doc">临时标题</title>', {
      documentId: 'doc', revisionId: 1,
    }))).toBe(true);
  });

  it.each([
    '<title id="doc">Title</title><p id="p"></p>',
    '<title id="doc">Title</title><whiteboard id="w" token="board"></whiteboard>',
    '<title id="doc">Title</title><synced_reference id="r" src-token="en" src-block-id="s"></synced_reference>',
  ])('rejects any body block: %s', (xml) => {
    expect(isStrictlyEmptyTarget(parseFeishuDocument(xml, {documentId: 'doc', revisionId: 1}))).toBe(false);
  });
});
```

- [ ] **Step 2: Write routing and bootstrap-guard tests**

Cover these exact cases with `MutableDocs` and the local registry:

```ts
expect(await inspector.inspect(pairWithoutTarget, undefined)).toMatchObject({kind: 'create_target'});
expect(await inspector.inspect(pairWithTitleOnlyTarget, undefined)).toMatchObject({kind: 'initialize_empty_target'});
expect(await inspector.inspect(pairWithBodyTarget, undefined)).toMatchObject({kind: 'adopt_existing_target'});
expect(await inspector.inspect(activePair, receipt)).toMatchObject({kind: 'incremental'});
```

Add a workflow test asserting `acceptBootstrap` on a title-only target throws:

```ts
await expect(workflows.acceptBootstrap(runId)).rejects.toMatchObject({
  type: 'validation', subtype: 'empty_target_requires_initialization',
});
```

- [ ] **Step 3: Run tests and verify failure**

```bash
pnpm --filter zdoc-localize test -- initialization.test.ts planning-workflow.test.ts
```

Expected: FAIL because classification and guard behavior are missing.

- [ ] **Step 4: Implement the inspector**

Use this interface:

```ts
export type InitializationDisposition =
  | {kind: 'incremental'}
  | {kind: 'create_target'}
  | {kind: 'initialize_empty_target'; source: FetchedDocument; target: FetchedDocument}
  | {kind: 'adopt_existing_target'; source: FetchedDocument; target: FetchedDocument};

export class InitializationInspector {
  constructor(private readonly docs: DocumentGateway) {}
  async inspect(pair: DocumentPair, receipt?: LocalizationReceipt): Promise<InitializationDisposition> {
    if (receipt) return {kind: 'incremental'};
    if (!pair.targetDocUrl && !pair.targetDocToken) return {kind: 'create_target'};
    const [source, target] = await Promise.all([
      this.docs.fetch(pair.sourceDocUrl),
      this.docs.fetch(pair.targetDocUrl ?? pair.targetDocToken!),
    ]);
    const parsedTarget = parseFeishuDocument(target.content, {
      documentId: target.documentId, revisionId: target.revisionId,
    });
    return isStrictlyEmptyTarget(parsedTarget)
      ? {kind: 'initialize_empty_target', source, target}
      : {kind: 'adopt_existing_target', source, target};
  }
}
```

Route `createPlan` through the inspector when no receipt exists. Reuse the same strict-empty predicate in `acceptBootstrap` before receipt persistence.

- [ ] **Step 5: Run focused tests**

Run the command from Step 3.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/zdoc-localize/src/domain/initialization.ts packages/zdoc-localize/src/application/initialization-inspector.ts packages/zdoc-localize/src/application/ports.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/initialization.test.ts packages/zdoc-localize/test/planning-workflow.test.ts
git commit -m "feat(localize): route title-only targets to initialization"
```

## Task 4: Introduce plan version 2 and protected operation policies

**Files:**
- Modify: `packages/zdoc-localize/src/domain/review.ts`
- Modify: `packages/zdoc-localize/src/domain/translation.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Modify: `packages/zdoc-localize/test/review.test.ts`
- Modify: `packages/zdoc-localize/test/translation-protocol.test.ts`

- [ ] **Step 1: Write version-2 review tests**

Create a plan containing one editable translation and four protected operations:

```ts
const planV2: LocalizationPlan = {
  planVersion: 2,
  runId: 'run-v2', pairId: 'pair', sourceRevision: 4, targetRevision: 7,
  sourceHash: 'source', targetHash: 'target',
  operations: [
    {
      operationId: 'translate-1', policy: 'translation', effect: 'write', kind: 'insert',
      confidence: 'high', sourceAfter: 'Hello', proposedText: '你好',
      targetNodeKind: 'paragraph', anchorBlockId: 'doc',
    },
    {
      operationId: 'code-1', policy: 'verbatim_code', effect: 'write', kind: 'insert',
      confidence: 'high', sourceAfter: 'print(1)', proposedText: 'print(1)',
      targetNodeKind: 'code', anchorOperationId: 'translate-1',
    },
    {
      operationId: 'board-1', policy: 'whiteboard_mirror', effect: 'mirror', kind: 'insert',
      confidence: 'high', proposedText: '', targetNodeKind: 'whiteboard', sourceResourceToken: 'board-src',
    },
    {
      operationId: 'sync-1', policy: 'manual_synced_reference', effect: 'manual', kind: 'insert',
      confidence: 'high', proposedText: '', targetNodeKind: 'synced_reference',
      sourceDocumentId: 'en-doc', sourceBlockId: 'sync-src',
    },
    {
      operationId: 'verify-1', policy: 'verify_synced_reference', effect: 'verify_only', kind: 'replace',
      confidence: 'high', proposedText: '', targetNodeKind: 'synced_reference',
      sourceDocumentId: 'en-doc', sourceBlockId: 'sync-src', targetBlockId: 'sync-ref',
    },
  ],
};
```

Assert that only `translate-1` has editable markers, protected metadata changes are rejected, and `parseReview` returns approved entries for every operation without asking for translations for protected policies.

- [ ] **Step 2: Run review tests and verify failure**

```bash
pnpm --filter zdoc-localize test -- review.test.ts translation-protocol.test.ts
```

Expected: FAIL because `LocalizationPlan` only supports version 1 and every non-delete operation requires editable text.

- [ ] **Step 3: Implement versioned operation unions**

Define shared fields plus policy-specific fields:

```ts
export type OperationPolicy =
  | 'translation'
  | 'verbatim_code'
  | 'whiteboard_mirror'
  | 'manual_synced_reference'
  | 'verify_synced_reference'
  | 'delete';

export type OperationEffect = 'write' | 'mirror' | 'manual' | 'verify_only' | 'delete';

export interface PlanOperation {
  operationId: string;
  policy?: OperationPolicy; // absent means legacy plan v1 translation/delete behavior
  effect?: OperationEffect;
  kind: ChangeKind;
  confidence: AlignmentConfidence;
  sourceBefore?: string;
  sourceAfter?: string;
  sourceNodeId?: string;
  sourceNodeHash?: string;
  sourceHeadingPath?: string[];
  targetCurrent?: string;
  proposedText: string;
  targetNodeKind: SemanticNodeKind;
  targetElementName?: string;
  targetAttributes?: Record<string, string>;
  targetNodeId?: string;
  targetBlockId?: string;
  targetBlockIds?: string[];
  targetNodeHash?: string;
  anchorNodeId?: string;
  anchorOperationId?: string;
  anchorBlockId?: string;
  anchorNodeHash?: string;
  preserved?: Array<{kind: string; value: string; count: number}>;
  sourceDocumentId?: string;
  sourceBlockId?: string;
  sourceResourceToken?: string;
  targetResourceToken?: string;
}

export interface LocalizationPlanV2 extends Omit<LocalizationPlanV1, 'planVersion'> {
  planVersion: 2;
}
```

Render protected operations as immutable Markdown sections without editable markers. Parse them into approved operations such as `{operationId, decision: 'protected'}`. `validateTranslations` receives only translation-policy requests/responses.

- [ ] **Step 4: Run focused tests**

Run the command from Step 2.

Expected: PASS, including existing v1 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/domain/review.ts packages/zdoc-localize/src/domain/translation.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/review.test.ts packages/zdoc-localize/test/translation-protocol.test.ts
git commit -m "feat(localize): add protected plan operation policies"
```

## Task 5: Build the full initial plan for an existing empty target

**Files:**
- Create: `packages/zdoc-localize/src/domain/initial-plan.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Modify: `packages/zdoc-localize/test/planning-workflow.test.ts`

- [ ] **Step 1: Write an empty-target planning test**

Use source XML containing title, paragraph, ordinary code, Whiteboard, and synced source; use a title-only target. Assert:

```ts
expect(plan.state).toBe('translation_required');
expect(plan.translationRequests.map((request) => request.targetNodeKind)).toEqual([
  'title', 'paragraph',
]);
const run = await registry.getRun(plan.runId);
expect(run?.metadata?.initialOperations).toEqual(expect.arrayContaining([
  expect.objectContaining({policy: 'translation', targetNodeKind: 'title', kind: 'replace'}),
  expect.objectContaining({policy: 'translation', targetNodeKind: 'paragraph', kind: 'insert'}),
  expect.objectContaining({policy: 'verbatim_code', targetNodeKind: 'code'}),
  expect.objectContaining({policy: 'whiteboard_mirror', sourceResourceToken: 'board-source'}),
  expect.objectContaining({
    policy: 'manual_synced_reference', sourceDocumentId: 'source', sourceBlockId: 'sync-source',
  }),
]));
```

- [ ] **Step 2: Run the test and verify failure**

```bash
pnpm --filter zdoc-localize test -- planning-workflow.test.ts
```

Expected: FAIL because empty targets do not yet produce an initial insert plan.

- [ ] **Step 3: Implement pure initial operation construction**

Create:

```ts
export function buildInitialOperations(
  source: SemanticDocument,
  target: SemanticDocument,
): InitialOperationInput[] {
  const targetTitle = target.nodes.find((node) => node.kind === 'title');
  let previousOperationId: string | undefined;
  return source.nodes.map((node, index) => {
    const operationId = canonicalHash({kind: 'initial', nodeId: node.nodeId, index}).slice(0, 16);
    const common = {
      operationId, sourceNodeId: node.nodeId, sourceNodeHash: node.fingerprint,
      sourceAfter: node.text, targetNodeKind: node.kind, confidence: 'high' as const,
    };
    const anchor = previousOperationId ? {anchorOperationId: previousOperationId} : {};
    previousOperationId = operationId;
    if (node.kind === 'title') return {
      ...common, policy: 'translation' as const, kind: 'replace' as const,
      targetNodeId: targetTitle?.nodeId, targetBlockId: targetTitle?.remote.blockId,
      targetNodeHash: targetTitle?.fingerprint, targetCurrent: targetTitle?.text ?? '',
    };
    if (node.kind === 'code') return {...common, ...anchor, policy: 'verbatim_code' as const, kind: 'insert' as const};
    if (node.kind === 'whiteboard') return {
      ...common, ...anchor, policy: 'whiteboard_mirror' as const, kind: 'insert' as const,
      sourceResourceToken: node.remote.token,
    };
    if (node.kind === 'synced_source') return {
      ...common, ...anchor, policy: 'manual_synced_reference' as const, kind: 'insert' as const,
      sourceDocumentId: source.documentId, sourceBlockId: node.remote.blockId,
    };
    return {...common, ...anchor, policy: 'translation' as const, kind: 'insert' as const};
  });
}
```

Reject unsupported `table`, `image`, `resource`, and `opaque` nodes with a complete blocker listing; do not silently omit them.

- [ ] **Step 4: Wire translation inputs and plan artifacts**

In `createPlan`, route `initialize_empty_target` to a new private workflow method. Generate translation requests only for translation policies, persist target revision/hash from the real title-only target, save `operations.json` alongside changes/requests, and mark the run `translation_required` with metadata `kind: 'initialization'` and `initialOperations`. `completePlan` consumes those inputs to produce the version-2 `plan.json`.

- [ ] **Step 5: Run planning tests**

Run the command from Step 2.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/zdoc-localize/src/domain/initial-plan.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/planning-workflow.test.ts
git commit -m "feat(localize): plan existing empty target initialization"
```

## Task 6: Add document resource metadata and Whiteboard adapters

**Files:**
- Create: `packages/zdoc-localize/src/domain/whiteboard.ts`
- Create: `packages/zdoc-localize/src/adapters/lark-whiteboard-adapter.ts`
- Create: `packages/zdoc-localize/src/application/whiteboard-mirror.ts`
- Modify: `packages/zdoc-localize/src/adapters/lark-docs-adapter.ts`
- Modify: `packages/zdoc-localize/src/application/ports.ts`
- Modify: `packages/zdoc-localize/src/application/runtime.ts`
- Modify: `packages/zdoc-localize/test/adapters.test.ts`
- Create: `packages/zdoc-localize/test/whiteboard.test.ts`

- [ ] **Step 1: Write adapter command tests**

Assert the document adapter returns `newBlocks` from:

```json
{
  "document": {
    "revision_id": 12,
    "new_blocks": [{"block_id":"wb-block","block_type":"whiteboard","block_token":"board-target"}]
  },
  "result":"success",
  "updated_blocks_count":1,
  "warnings":[]
}
```

Assert the Whiteboard adapter issues:

```ts
expect(runner.calls[0]).toMatchObject({
  executable: 'lark-cli',
  args: ['whiteboard', '+query', '--whiteboard-token', 'source-board', '--output_as', 'raw', '--format', 'json', '--as', 'user'],
});
expect(runner.calls[1]).toMatchObject({
  executable: 'lark-cli',
  args: expect.arrayContaining([
    'whiteboard', '+update', '--whiteboard-token', 'target-board',
    '--input_format', 'raw', '--source', '-', '--overwrite',
    '--idempotent-token', 'run-1-board-1',
  ]),
});
```

- [ ] **Step 2: Write canonicalization tests**

Use two raw payloads with different node IDs but the same shapes/text and assert equal hashes. Change visible text or geometry and assert different hashes. Explicitly list ignored fields in the implementation; do not recursively delete every field named `id`.

- [ ] **Step 3: Run tests and verify failure**

```bash
pnpm --filter zdoc-localize test -- adapters.test.ts whiteboard.test.ts
```

Expected: FAIL because resource metadata and Whiteboard modules are missing.

- [ ] **Step 4: Implement the gateways and canonicalizer**

Move `DocumentGateway` into `application/ports.ts` and add:

```ts
export interface NewDocumentBlock {
  blockId: string;
  blockType: string;
  blockToken?: string;
}

export interface DocumentWriteResult {
  revisionId?: number;
  updatedBlocksCount: number;
  warnings: string[];
  newBlocks: NewDocumentBlock[];
}

export interface WhiteboardGateway {
  queryRaw(token: string): Promise<unknown>;
  overwriteRaw(input: {token: string; raw: unknown; idempotencyToken: string}): Promise<void>;
}
```

Normalize only known volatile fields, including server node IDs and timestamps, while preserving node type, geometry, style, text, bindings, and child order.

- [ ] **Step 5: Implement `WhiteboardMirror`**

```ts
export class WhiteboardMirror {
  constructor(private readonly whiteboards: WhiteboardGateway) {}
  async snapshot(token: string): Promise<CanonicalWhiteboard> {
    const raw = await this.whiteboards.queryRaw(token);
    const normalized = normalizeWhiteboardRaw(raw);
    return {raw, normalized, hash: canonicalHash(normalized)};
  }
  async mirror(sourceToken: string, targetToken: string, idempotencyToken: string): Promise<MirrorResult> {
    const source = await this.snapshot(sourceToken);
    await this.whiteboards.overwriteRaw({token: targetToken, raw: source.raw, idempotencyToken});
    const target = await this.snapshot(targetToken);
    if (source.hash !== target.hash) throw new LocalizeError({
      type: 'verification_failed', subtype: 'whiteboard_verification_mismatch',
      message: 'The mirrored Whiteboard does not match the source Whiteboard.',
    });
    return {source, target};
  }
}
```

- [ ] **Step 6: Run focused tests**

Run the command from Step 3.

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/zdoc-localize/src/domain/whiteboard.ts packages/zdoc-localize/src/adapters/lark-whiteboard-adapter.ts packages/zdoc-localize/src/application/whiteboard-mirror.ts packages/zdoc-localize/src/adapters/lark-docs-adapter.ts packages/zdoc-localize/src/application/ports.ts packages/zdoc-localize/src/application/runtime.ts packages/zdoc-localize/test/adapters.test.ts packages/zdoc-localize/test/whiteboard.test.ts
git commit -m "feat(localize): add verified Whiteboard mirroring"
```

## Task 7: Apply version-2 operations and pause for manual actions

**Files:**
- Create: `packages/zdoc-localize/src/application/manual-actions.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Modify: `packages/zdoc-localize/test/apply-workflow.test.ts`
- Modify: `packages/zdoc-localize/test/validation-report.test.ts`

- [ ] **Step 1: Write an apply test with translation, code, Whiteboard, and native sync**

Assert that approved apply:

```ts
expect(result).toMatchObject({
  runId: 'run-initialize',
  state: 'manual_action_required',
  manualActionsPath: expect.stringContaining('manual-actions.json'),
});
expect(await registry.getReceipt('pair-1')).toBeUndefined();
expect(await registry.getPair('pair-1')).toMatchObject({status: 'needs_bootstrap'});
expect(await registry.getRun('run-initialize')).toMatchObject({state: 'manual_action_required'});
```

Verify the target contains the reviewed translation, unchanged ordinary code, a mirrored Whiteboard, and a callout containing `ZDOC-MANUAL-SYNC:<operationId>`.

- [ ] **Step 2: Run the apply test and verify failure**

```bash
pnpm --filter zdoc-localize test -- apply-workflow.test.ts validation-report.test.ts
```

Expected: FAIL because apply only understands translated insert/replace/delete operations and always finalizes.

- [ ] **Step 3: Implement protected placeholder construction**

Create:

```ts
export function syncedReferencePlaceholder(operation: PlanOperation, sourceUrl: string): string {
  const marker = `ZDOC-MANUAL-SYNC:${operation.operationId}`;
  const blockUrl = `${sourceUrl.split('#')[0]}#${operation.sourceBlockId}`;
  return `<callout emoji="🧩" background-color="light-yellow" border-color="yellow">`
    + `<p><b>需要人工插入飞书同步块</b></p>`
    + `<p><code>${escapeXml(marker)}</code></p>`
    + `<p><a href="${escapeXml(blockUrl)}">打开英文同步源</a></p>`
    + `<p>Source document: <code>${escapeXml(operation.sourceDocumentId!)}</code><br/>`
    + `Source block: <code>${escapeXml(operation.sourceBlockId!)}</code></p>`
    + `</callout>`;
}
```

Persist immutable manual action records containing operation ID, placeholder block ID, source identity, and predecessor/successor block IDs.

- [ ] **Step 4: Dispatch apply by policy**

Implement policy behavior:

- `translation` → existing compiled XML write;
- `verbatim_code` → insert stored source XML without a translation response;
- `whiteboard_mirror` → insert `<whiteboard type="blank"></whiteboard>`, extract the returned token, snapshot prewrite raw state, and call `WhiteboardMirror.mirror`;
- `manual_synced_reference` → insert the protected placeholder and add a manual action;
- `verify_synced_reference` → no write, but include verification evidence;
- `delete` → call `docs.deleteBlocks` with the exact planned `targetBlockIds`, current revision, and no compiled XML.

Keep per-operation document re-fetch and progression verification. Extend progression verification for resource policies instead of comparing plain text.

- [ ] **Step 5: Pause instead of finalizing**

After automatic operations:

```ts
if (manualActions.length > 0) {
  const targetAfterAutomatic = await this.dependencies.docs.fetch(targetUrl);
  const manualActionsPath = await this.writeRunFile(
    runId, 'manual-actions.json', `${JSON.stringify(manualActions, null, 2)}\n`,
  );
  const postAutomaticRef = await this.dependencies.snapshots.putBundle({
    runId,
    files: {'target-after-automatic-apply.xml': targetAfterAutomatic.content},
  });
  await this.markRun(run, 'manual_action_required', {
    manualActions, manualActionsPath, postAutomaticRef,
  });
  return {runId, state: 'manual_action_required', manualActionsPath};
}
```

Do not persist pair/receipt/translation memory in this branch.

- [ ] **Step 6: Run focused tests**

Run the command from Step 2.

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/zdoc-localize/src/application/manual-actions.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/apply-workflow.test.ts packages/zdoc-localize/test/validation-report.test.ts
git commit -m "feat(localize): pause apply for manual synced references"
```

## Task 8: Verify manual replacements and finalize the initialization

**Files:**
- Modify: `packages/zdoc-localize/src/domain/native-sync.ts`
- Modify: `packages/zdoc-localize/src/application/manual-actions.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Modify: `packages/zdoc-localize/src/cli/program.ts`
- Modify: `packages/zdoc-localize/test/native-sync.test.ts`
- Modify: `packages/zdoc-localize/test/apply-workflow.test.ts`
- Modify: `packages/zdoc-localize/test/cli-contract.test.ts`

- [ ] **Step 1: Write manual verification domain tests**

Test exact, missing, wrong, duplicate, and misplaced references:

```ts
expect(verifyManualSyncedReferences(actions, plannedTarget, currentTarget)).toEqual({
  ok: true,
  correspondences: [{
    kind: 'native_sync', sourceNodeId: 'source:sync:0', targetNodeId: 'target:sync:0',
    sourceDocumentId: 'source-doc', sourceBlockId: 'sync-source',
  }],
});
```

Each failure returns a stable subtype rather than a boolean-only result.

- [ ] **Step 2: Write workflow and CLI tests**

Assert:

```ts
const first = await workflows.verifyManualActions('run-initialize');
const second = await workflows.verifyManualActions('run-initialize');
expect(first).toMatchObject({state: 'completed'});
expect(second).toMatchObject({state: 'completed'});
expect(await registry.getReceipt('pair-1')).toBeDefined();
expect(await registry.getPair('pair-1')).toMatchObject({status: 'active'});
```

Add CLI help and JSON envelope coverage for:

```bash
zdoc-localize manual verify --run run-initialize --format json
```

- [ ] **Step 3: Run tests and verify failure**

```bash
pnpm --filter zdoc-localize test -- native-sync.test.ts apply-workflow.test.ts cli-contract.test.ts
```

Expected: FAIL because manual verification and the command do not exist.

- [ ] **Step 4: Implement exact manual delta verification**

Compare the post-automatic snapshot with the current target. For each action:

- the placeholder marker/block must be absent;
- exactly one current `synced_reference` must match source document/block identity;
- its index must be between the recorded predecessor and successor, allowing either side to be absent at document edges;
- all non-placeholder nodes must preserve their block IDs and fingerprints.

Map failures to:

```ts
manual_placeholder_missing
manual_reference_missing
manual_reference_mismatch
manual_reference_ambiguous
manual_target_changed
```

- [ ] **Step 5: Implement workflow finalization and idempotency**

`verifyManualActions(runId)` returns the existing completed result if the run is already complete. Otherwise it requires `manual_action_required`, verifies the source revision rules, transitions to `verifying`, builds typed correspondences, saves final source/target snapshots, pair, receipt, and translation memory, writes `validation-report.json`, then marks completed.

Allow a source revision change only when semantic diff shows changes exclusively inside the same planned `synced_source` identities. Otherwise return `manual_source_changed` and retain the manual state.

- [ ] **Step 6: Add the CLI command**

```ts
const manual = program.command('manual').description('Verify planned human localization actions');
formatOption(manual.command('verify'))
  .requiredOption('--run <id>')
  .action(async (options: {run: string; format: string}) => {
    const result = await withRuntime(cwd, runtimeFactory, (runtime) =>
      runtime.workflows.verifyManualActions(options.run));
    emit(io, result, options.format);
  });
```

Add `manual` to capabilities commands.

- [ ] **Step 7: Run focused tests**

Run the command from Step 3.

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/zdoc-localize/src/domain/native-sync.ts packages/zdoc-localize/src/application/manual-actions.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/src/cli/program.ts packages/zdoc-localize/test/native-sync.test.ts packages/zdoc-localize/test/apply-workflow.test.ts packages/zdoc-localize/test/cli-contract.test.ts
git commit -m "feat(localize): verify manual synced references"
```

## Task 9: Reuse native sync and Whiteboard policies in incremental plans

**Files:**
- Modify: `packages/zdoc-localize/src/domain/native-sync.ts`
- Modify: `packages/zdoc-localize/src/domain/alignment.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Modify: `packages/zdoc-localize/test/planning-workflow.test.ts`
- Modify: `packages/zdoc-localize/test/apply-workflow.test.ts`
- Modify: `packages/zdoc-localize/test/diff-alignment.test.ts`

- [ ] **Step 1: Write incremental synced-code tests**

Start from a receipt with a typed native-sync correspondence. Change only descendants inside the same `synced_source`. Assert:

```ts
expect(plan.operations).toEqual([
  expect.objectContaining({
    policy: 'verify_synced_reference', effect: 'verify_only',
    sourceDocumentId: 'source-doc', sourceBlockId: 'sync-source', targetBlockId: 'sync-reference',
  }),
]);
expect(plan.translationRequests).toEqual([]);
```

Applying this plan must make zero document write calls and advance the receipt only after verifying the reference.

- [ ] **Step 2: Write incremental Whiteboard tests**

Start from a `copied_resource` correspondence. Change the source Whiteboard hash and assert a `whiteboard_mirror` replace operation targets the existing target token. An unchanged source hash produces no operation.

- [ ] **Step 3: Run tests and verify failure**

```bash
pnpm --filter zdoc-localize test -- planning-workflow.test.ts apply-workflow.test.ts diff-alignment.test.ts
```

Expected: FAIL because generic alignment treats these resources as unsupported/report-only.

- [ ] **Step 4: Implement resource-aware diff planning**

Before generic low-confidence/report-only blocking:

- match `synced_source` changes by typed native-sync correspondence and emit verify-only operations;
- match Whiteboards by copied-resource correspondence and emit mirror operations when the source resource hash changes;
- retain the existing blocker for unrecognized tables, images, resources, and opaque nodes.

Never send resource operations through translation request generation.

- [ ] **Step 5: Implement verify-only apply and receipt advancement**

Verify the target reference identity and source existence. For Whiteboards, mirror and verify the target token. Update typed correspondences and source resource hashes in the new receipt.

- [ ] **Step 6: Run focused tests**

Run the command from Step 3.

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/zdoc-localize/src/domain/native-sync.ts packages/zdoc-localize/src/domain/alignment.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/planning-workflow.test.ts packages/zdoc-localize/test/apply-workflow.test.ts packages/zdoc-localize/test/diff-alignment.test.ts
git commit -m "feat(localize): preserve synced resources incrementally"
```

## Task 10: Extend recovery for manual and Whiteboard writes

**Files:**
- Modify: `packages/zdoc-localize/src/domain/recovery.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts`
- Modify: `packages/zdoc-localize/test/apply-workflow.test.ts`
- Modify: `packages/zdoc-localize/test/domain-foundation.test.ts`

- [ ] **Step 1: Write recovery inspection tests**

Cover:

1. a manual-action target that differs only by automatic writes and exact manual replacements reports `safeToRecover=true`;
2. an unexpected target edit reports `safeToRecover=false`;
3. a Whiteboard partial write includes the prewrite raw snapshot and a reverse operation;
4. reverse preview remains approval-token gated.

- [ ] **Step 2: Run tests and verify failure**

```bash
pnpm --filter zdoc-localize test -- apply-workflow.test.ts domain-foundation.test.ts
```

Expected: FAIL because recovery only understands ordinary plan operations and partial runs.

- [ ] **Step 3: Extend recovery evidence**

Allow `recover inspect` for `manual_action_required`. Add reverse operation variants:

```ts
type ReverseOperation =
  | ExistingReverseBlockOperation
  | {kind: 'whiteboard_restore'; operationId: string; targetToken: string; rawSnapshotPath: string};
```

Manual reverse removes all planned inserted blocks, including verified native references, and restores the original title/body snapshot. Whiteboard reverse uses the target token and prewrite raw snapshot.

- [ ] **Step 4: Apply reverse operations safely**

Preserve exact preview token hashing. Execute Whiteboard restoration through `WhiteboardMirror`/gateway, read back and verify the canonical prewrite hash, then continue ordinary block reversal. Any mismatch remains `partial`.

- [ ] **Step 5: Run focused tests**

Run the command from Step 2.

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/zdoc-localize/src/domain/recovery.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/apply-workflow.test.ts packages/zdoc-localize/test/domain-foundation.test.ts
git commit -m "feat(localize): recover manual and Whiteboard writes"
```

## Task 11: Update status, docs, Skill, version, and full verification

**Files:**
- Modify: `packages/zdoc-localize/src/cli/program.ts`
- Modify: `packages/zdoc-localize/package.json`
- Modify: `packages/zdoc-localize/README.md`
- Modify: `skills/zdoc-localization/SKILL.md`
- Modify: `skills/zdoc-localization/references/workflow.md`
- Modify: `skills/zdoc-localization/references/errors.md`
- Modify: `packages/zdoc-localize/test/skill-compatibility.test.ts`
- Modify: `packages/zdoc-localize/test/cli-contract.test.ts`

- [ ] **Step 1: Write final CLI/status assertions**

Assert `status --run` exposes this stable projection for manual runs:

```json
{
  "runId": "run-initialize",
  "state": "manual_action_required",
  "manualActions": [{
    "operationId": "sync-1",
    "sourceDocumentId": "source-doc",
    "sourceBlockId": "sync-source",
    "sourceUrl": "https://example.feishu.cn/docx/source-doc#sync-source"
  }]
}
```

Do not expose raw access tokens, authentication material, or full internal recovery payloads.

- [ ] **Step 2: Update documentation and Skill instructions**

Document the exact workflow:

```text
pair add
plan create
plan complete
apply --preview
apply --approval-token
manual Feishu replacement when required
manual verify
status
```

Add explicit warnings:

- never bootstrap-accept a title-only target;
- never flatten native synced code;
- never claim completion while `manual_action_required`;
- Whiteboards are independent mirrors and are refreshed by `zdoc-localize`;
- manual verification and reverse recovery do not bypass preview approval for document writes.

- [ ] **Step 3: Bump the patch version**

Set package and `CLI_VERSION` to `0.1.1`. Keep Skill compatibility `>=0.1.0 <0.2.0` and add the three required capabilities to the Skill preflight.

- [ ] **Step 4: Run all package checks**

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
pnpm --filter zdoc-localize test:package
node scripts/check-zdoc-localize-skill-compat.mjs
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 5: Inspect the final diff**

```bash
git status --short
git diff --stat HEAD~10..HEAD
git diff -- packages/zdoc-localize/src/application/workflows.ts
```

Verify that no unrelated ZDoc documentation or user changes are included.

- [ ] **Step 6: Commit**

```bash
git add packages/zdoc-localize/src/cli/program.ts packages/zdoc-localize/package.json packages/zdoc-localize/README.md skills/zdoc-localization/SKILL.md skills/zdoc-localization/references/workflow.md skills/zdoc-localization/references/errors.md packages/zdoc-localize/test/skill-compatibility.test.ts packages/zdoc-localize/test/cli-contract.test.ts
git commit -m "docs(localize): document empty target workflow"
```

## Task 12: Prepare the live dogfood without writing the target

**Files:**
- Runtime artifacts only under `.zdoc-localize/runs/<run-id>/`; do not commit.

- [ ] **Step 1: Re-run compatibility and environment checks**

```bash
zdoc-localize --version
zdoc-localize capabilities --format json
zdoc-localize doctor --format json
zdoc-localize registry schema --format json
```

Expected: version `0.1.1`, healthy doctor, and all three new capabilities.

- [ ] **Step 2: Validate the live registry schema**

Confirm `manual_action_required` exists as a single-select Label option before creating a run. Missing schema is blocking; do not let the CLI create an unknown option implicitly.

- [ ] **Step 3: Register the approved mirror pair if still absent**

Use the stable pair ID from the dogfood conversation and the exact source/target Wiki URLs. Confirm pair data before the registry write.

- [ ] **Step 4: Create the initial plan and translation artifacts**

```bash
zdoc-localize plan create --pair <pair-id> --format json
```

Expected: `translation_required`, full translation requests, one Whiteboard mirror operation, and any native synced-code manual operations present in the source.

- [ ] **Step 5: Generate translations and complete the plan**

Create exactly one translation response per requested operation, preserve protected tokens and links, apply the approved glossary, then run:

```bash
zdoc-localize plan complete --run <run-id> --translations <relative-translations.json> --format json
```

Expected: `review_required` with `plan.json` and `review.md`.

- [ ] **Step 6: Stop at user review**

Present the complete review and every warning. Do not run apply preview until the user approves the review. Do not run apply with an approval token until the user approves the exact preview. This live step remains governed by the `zdoc-localization` Skill even though implementation work is authorized.
