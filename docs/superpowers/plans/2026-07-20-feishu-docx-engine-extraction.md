# Feishu Docx Engine Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a separately published `feishu-docx-engine` package from `feishu-md-sync`, route existing scoped Docx writes through it without changing CLI behavior, and publish a versioned engine that other repositories can consume.

**Architecture:** Keep Markdown parsing, dialects, publish planning, confirmations, and receipts in `feishu-md-sync`. Move provider-facing snapshots, typed desired nodes, mutation preparation, `lark-cli` transport, verified execution, and recovery assessment into a deep engine module with a small public interface. Migrate existing publishing operation-by-operation behind compatibility tests before removing the old physical executor.

**Tech Stack:** Node.js 20+, TypeScript 5.7 ESM, npm workspaces, Vitest 3, Commander 12, official `lark-cli`, Feishu Docx OpenAPI, npm package publishing.

---

## Working Directory and Release Gate

Execute this plan in a dedicated worktree created from `/Users/liyun/feishu-md-sync` at commit `7c75b9d` or a reviewed descendant. Do not implement Project B until this plan publishes `feishu-docx-engine` and a released `feishu-md-sync` consumes that package.

## File Map

### New engine package

- Create `packages/docx-engine/package.json`: independent package metadata, exports, scripts, and version.
- Create `packages/docx-engine/README.md`: public module purpose, interface, and compatibility.
- Create `packages/docx-engine/LICENSE`: package license copied from the repository license.
- Create `packages/docx-engine/scripts/clean-dist.mjs`: generated-output cleanup.
- Create `packages/docx-engine/tsconfig.json`: strict NodeNext build.
- Create `packages/docx-engine/vitest.config.ts`: engine test configuration.
- Create `packages/docx-engine/src/index.ts`: public exports only.
- Create `packages/docx-engine/src/model.ts`: snapshots, desired nodes, mutations, results, and recovery types.
- Create `packages/docx-engine/src/hash.ts`: canonical JSON hashing.
- Create `packages/docx-engine/src/transport.ts`: provider transport seam.
- Create `packages/docx-engine/src/lark-cli-transport.ts`: official `lark-cli` adapter.
- Create `packages/docx-engine/src/snapshot.ts`: normalize raw Docx blocks into immutable snapshots.
- Create `packages/docx-engine/src/codec.ts`: convert desired nodes to Feishu block shells/XML.
- Create `packages/docx-engine/src/prepare.ts`: deterministic physical batch compilation.
- Create `packages/docx-engine/src/apply.ts`: preflight, execution, readback, journal, and partial evidence.
- Create `packages/docx-engine/src/structured-tree.ts`: recursive child-block creation and verification.
- Create `packages/docx-engine/src/recovery.ts`: read-only recovery assessment.
- Create `packages/docx-engine/test/*.test.ts`: public-interface, transport, snapshot, codec, apply, and recovery tests.

### Existing `feishu-md-sync` package

- Modify `package.json`: add engine build/test/package scripts.
- Modify `packages/cli/package.json`: depend on the released engine version.
- Create `packages/cli/src/publish/docx-engine-operations.ts`: translate `ScopedPatchOperation` and Whiteboard operations into engine intents.
- Create `packages/cli/src/publish/docx-engine-journal.ts`: adapt publish checkpoint persistence to `MutationJournal`.
- Modify `packages/cli/src/publish/run-publish.ts`: delegate physical scoped writes to the engine.
- Modify `packages/cli/src/adapters/feishu-adapter.ts`: retain only Markdown/Base/product operations not owned by the engine.
- Modify `packages/cli/src/adapters/lark-cli-adapter.ts`: compose or re-export the engine transport while preserving existing caller behavior.
- Modify `packages/cli/src/publish/partial-write-error.ts`: translate engine partial evidence into the existing CLI envelope.
- Modify package, CLI, live, and regression tests named in the tasks below.

## Task 1: Scaffold the independently publishable engine package

**Files:**
- Create: `packages/docx-engine/package.json`
- Create: `packages/docx-engine/README.md`
- Create: `packages/docx-engine/LICENSE`
- Create: `packages/docx-engine/scripts/clean-dist.mjs`
- Create: `packages/docx-engine/tsconfig.json`
- Create: `packages/docx-engine/vitest.config.ts`
- Create: `packages/docx-engine/src/index.ts`
- Create: `packages/docx-engine/test/package-contract.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing workspace/package contract test**

Create `packages/docx-engine/test/package-contract.test.ts`:

```ts
import {describe, expect, it} from "vitest";
import {ENGINE_CAPABILITIES, ENGINE_SCHEMA_VERSION, ENGINE_VERSION} from "../src/index.js";

describe("package contract", () => {
  it("exports stable engine identity", () => {
    expect(ENGINE_VERSION).toBe("0.1.0");
    expect(ENGINE_SCHEMA_VERSION).toBe(1);
    expect(ENGINE_CAPABILITIES).toEqual([
      "nested-list-create-v1",
      "native-table-create-v1",
      "whiteboard-overwrite-v1",
      "partial-write-evidence-v1",
    ]);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test --workspace=feishu-docx-engine -- --run test/package-contract.test.ts
```

Expected: npm reports that workspace `feishu-docx-engine` does not exist.

- [ ] **Step 3: Add the minimal package and root scripts**

Create `packages/docx-engine/package.json` with:

```json
{
  "name": "feishu-docx-engine",
  "version": "0.1.0",
  "description": "Verified Feishu Docx snapshots, mutations, and recovery through lark-cli.",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {".": {"types": "./dist/index.d.ts", "import": "./dist/index.js"}},
  "files": ["dist", "README.md", "LICENSE"],
  "engines": {"node": ">=20"},
  "scripts": {
    "clean": "node scripts/clean-dist.mjs",
    "build": "npm run clean && tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "prepack": "npm run build"
  },
  "devDependencies": {"@types/node": "^22.10.2", "typescript": "^5.7.2", "vitest": "^3.2.4"}
}
```

Export constants from `src/index.ts`:

```ts
export const ENGINE_VERSION = "0.1.0";
export const ENGINE_SCHEMA_VERSION = 1;
export const ENGINE_CAPABILITIES = [
  "nested-list-create-v1",
  "native-table-create-v1",
  "whiteboard-overwrite-v1",
  "partial-write-evidence-v1",
] as const;
```

Create `scripts/clean-dist.mjs`:

```js
import {rm} from "node:fs/promises";
await rm(new URL("../dist", import.meta.url), {recursive: true, force: true});
```

Add root scripts `build:engine`, `test:engine`, `typecheck:engine`, and `pack:engine` that target the new workspace. Keep the existing CLI scripts intact.
Add `packages/docx-engine` to the root `workspaces` array. Create `README.md` with the module name, the four public operations, supported capability list, and the rule that product receipts remain caller-owned. Copy `packages/cli/LICENSE` to `packages/docx-engine/LICENSE`.

- [ ] **Step 4: Run the package contract and build**

Run:

```bash
npm install
npm test --workspace=feishu-docx-engine -- --run test/package-contract.test.ts
npm run build --workspace=feishu-docx-engine
```

Expected: one test passes and `packages/docx-engine/dist/index.js` plus declarations are generated.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json packages/docx-engine
git commit -m "feat(engine): scaffold Feishu Docx engine package"
```

## Task 2: Define the typed engine interface

**Files:**
- Create: `packages/docx-engine/src/model.ts`
- Create: `packages/docx-engine/src/hash.ts`
- Modify: `packages/docx-engine/src/index.ts`
- Create: `packages/docx-engine/test/model.test.ts`

- [ ] **Step 1: Write failing canonical batch tests**

Test that equivalent inputs produce the same fingerprint and reordered operations do not:

```ts
const batch = preparedBatch([insert("op-a"), insert("op-b")]);
expect(batch.fingerprint).toMatch(/^[a-f0-9]{64}$/);
expect(preparedBatch([insert("op-a"), insert("op-b")]).fingerprint).toBe(batch.fingerprint);
expect(preparedBatch([insert("op-b"), insert("op-a")]).fingerprint).not.toBe(batch.fingerprint);
```

- [ ] **Step 2: Run the test and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/model.test.ts
```

Expected: module/type failures for the engine model.

- [ ] **Step 3: Implement the complete public types**

Define these core types in `model.ts`:

```ts
export type DocumentSelector =
  | {kind: "docx"; token: string}
  | {kind: "wiki"; token: string}
  | {kind: "url"; url: string};

export type InlineContent =
  | {kind: "text"; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean}
  | {kind: "code"; text: string}
  | {kind: "link"; text: string; url: string};

export type DesiredNode =
  | {kind: "title"; content: InlineContent[]}
  | {kind: "paragraph"; content: InlineContent[]}
  | {kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: InlineContent[]}
  | {kind: "list"; ordered: boolean; items: Array<{content: InlineContent[]; children: DesiredListNode[]}>}
  | {kind: "table"; rows: Array<{cells: Array<{content: DesiredNode[]}>}>}
  | {kind: "code"; language: string; text: string; caption?: string}
  | {kind: "quote"; content: InlineContent[]}
  | {kind: "callout"; calloutType: string; title?: string; children: DesiredNode[]};

export type DesiredListNode = Extract<DesiredNode, {kind: "list"}>;

export interface SnapshotNode {
  blockId: string;
  parentBlockId?: string;
  childBlockIds: string[];
  blockType: number;
  kind: DesiredNode["kind"] | "page" | "whiteboard" | "synced_source" | "synced_reference" | "opaque";
  canonicalHash: string;
  raw: Record<string, unknown>;
}

export interface DocumentSnapshot {
  documentId: string;
  revision: string;
  rootBlockId: string;
  canonicalHash: string;
  nodes: SnapshotNode[];
}

export type MutationIntent =
  | {operationId: string; kind: "replace"; targetBlockId: string; expectedHash: string; desired: DesiredNode}
  | {operationId: string; kind: "insert"; parentBlockId: string; insertAfterBlockId: string; insertBeforeBlockId?: string; desired: DesiredNode[]}
  | {operationId: string; kind: "delete"; parentBlockId: string; blockIds: string[]; expectedHashes: string[]}
  | {operationId: string; kind: "move"; parentBlockId: string; blockIds: string[]; insertAfterBlockId: string}
  | {operationId: string; kind: "assert"; blockId: string; expectedHash: string}
  | {
      operationId: string;
      kind: "whiteboard-overwrite";
      targetBlockId?: string;
      targetToken?: string;
      expectedTargetHash?: string;
      desired:
        | {kind: "copy-token"; sourceToken: string}
        | {kind: "raw"; value: unknown}
        | {kind: "svg"; value: string};
    };

export interface PreparedMutationStep {
  operationId: string;
  kind: MutationIntent["kind"];
  idempotencyToken: string;
  intent: MutationIntent;
}

export interface PreparedMutationBatch {
  schemaVersion: 1;
  engineVersion: string;
  documentId: string;
  expectedRevision: string;
  beforeSnapshotHash: string;
  steps: PreparedMutationStep[];
  fingerprint: string;
}

export interface VerifiedOperationEvidence {
  operationId: string;
  createdBlockIds: string[];
  resourceTokens?: string[];
  revision: string;
  afterSnapshotHash: string;
  verified: true;
}

export interface MutationJournal {
  recordVerified(evidence: VerifiedOperationEvidence): Promise<void>;
}

export interface MutationOutcome {
  finalSnapshot: DocumentSnapshot;
  operations: VerifiedOperationEvidence[];
}

export interface PartialMutationEvidence {
  batchFingerprint: string;
  beforeSnapshotHash: string;
  lastObservedRevision: string;
  completedOperations: VerifiedOperationEvidence[];
  failedOperation: {operationId: string; kind: string; message: string; cause?: unknown};
  pendingOperationIds: string[];
  createdBlockIds: string[];
  recoveryDisposition: "resume_possible" | "reverse_possible" | "manual_inspection_required";
}

export type RecoveryAssessment =
  | {disposition: "resume_possible"; completedOperationIds: string[]; pendingOperationIds: string[]}
  | {disposition: "reverse_possible"; reverseIntents: MutationIntent[]}
  | {disposition: "manual_inspection_required"; reason: string};

export interface PrepareMutationInput {
  snapshot: DocumentSnapshot;
  operations: MutationIntent[];
  idempotencyNamespace: string;
}

export interface ApplyMutationInput {
  batch: PreparedMutationBatch;
  journal: MutationJournal;
}

export interface AssessRecoveryInput {
  batch: PreparedMutationBatch;
  checkpoint: {completedOperations: VerifiedOperationEvidence[]; prewriteSnapshot: DocumentSnapshot};
}

export interface FeishuDocxEngine {
  snapshot(document: DocumentSelector): Promise<DocumentSnapshot>;
  prepare(input: PrepareMutationInput): PreparedMutationBatch;
  apply(input: ApplyMutationInput): Promise<MutationOutcome>;
  assessRecovery(input: AssessRecoveryInput): Promise<RecoveryAssessment>;
}
```

Implement `canonicalHash(value)` with sorted object keys and SHA-256. Export a `PartialMutationError` class whose `evidence` field is `PartialMutationEvidence` and whose `cause` preserves the structured provider failure.

- [ ] **Step 4: Run tests and typecheck**

```bash
npm test --workspace=feishu-docx-engine -- --run test/model.test.ts
npm run typecheck --workspace=feishu-docx-engine
```

Expected: focused tests and strict typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src packages/docx-engine/test/model.test.ts
git commit -m "feat(engine): define typed mutation contract"
```

## Task 3: Extract the `lark-cli` transport

**Files:**
- Create: `packages/docx-engine/src/transport.ts`
- Create: `packages/docx-engine/src/lark-cli-transport.ts`
- Create: `packages/docx-engine/test/lark-cli-transport.test.ts`
- Modify: `packages/docx-engine/src/index.ts`
- Reference: `packages/cli/src/adapters/lark-cli-adapter.ts:32-330`

- [ ] **Step 1: Port failing adapter contract tests**

Cover Wiki resolution, paginated block fetch, XML block replace/insert, child creation with `client_token`, block move/delete, document creation, and structured provider error preservation. Inject a fake executor and assert exact argument arrays.

```ts
const transport = new LarkCliTransport({
  identity: "user",
  exec: async (args) => { calls.push(args); return responseFor(args); },
});
await transport.createChildren({documentId: "doc", parentBlockId: "parent", index: 1, clientToken: "token-1", blocks: [{block_type: 2}]});
expect(calls[0]).toContain("/open-apis/docx/v1/documents/doc/blocks/parent/children");
expect(calls[0]).toContain(JSON.stringify({document_revision_id: -1, client_token: "token-1"}));
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/lark-cli-transport.test.ts
```

Expected: `LarkCliTransport` is not exported.

- [ ] **Step 3: Implement the transport seam and adapter**

Define a `DocxTransport` that contains only provider operations needed by the engine:

```ts
export interface ProviderBlock {
  block_id?: string;
  parent_id?: string;
  block_type: number;
  children?: string[] | ProviderBlock[];
  [key: string]: unknown;
}

export interface ProviderMutationInput {
  documentId: string;
  blockId: string;
  content: string;
  format: "markdown" | "xml";
}

export interface CreateChildrenInput {
  documentId: string;
  parentBlockId: string;
  index: number;
  blocks: ProviderBlock[];
  clientToken: string;
}

export interface DocxTransport {
  resolveDocument(selector: DocumentSelector): Promise<{documentId: string}>;
  fetchBlocks(documentId: string): Promise<{revision: string; blocks: ProviderBlock[]}>;
  replaceBlock(input: ProviderMutationInput): Promise<{revision?: string}>;
  insertAfter(input: ProviderMutationInput): Promise<{revision?: string}>;
  createChildren(input: CreateChildrenInput): Promise<{revision?: string; blocks: ProviderBlock[]}>;
  moveAfter(input: {documentId: string; anchorBlockId: string; blockIds: string[]}): Promise<void>;
  deleteBlocks(input: {documentId: string; blockIds: string[]}): Promise<void>;
  queryWhiteboard(token: string): Promise<unknown>;
  overwriteWhiteboard(input: {
    token: string;
    format: "raw" | "svg";
    value: unknown;
    idempotencyToken: string;
  }): Promise<void>;
}
```

Move argument construction and structured JSON parsing from the CLI adapter. Do not import publish receipts, Markdown configuration, or CLI output types into the engine package.

- [ ] **Step 4: Run transport tests and existing CLI adapter tests**

```bash
npm test --workspace=feishu-docx-engine -- --run test/lark-cli-transport.test.ts
npm test --workspace=feishu-md-sync -- --run test/lark-cli-adapter.test.ts
```

Expected: engine transport tests pass; existing CLI adapter tests still pass because the old adapter has not yet been removed.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src packages/docx-engine/test/lark-cli-transport.test.ts
git commit -m "feat(engine): add official lark CLI transport"
```

## Task 4: Normalize immutable Docx snapshots

**Files:**
- Create: `packages/docx-engine/src/snapshot.ts`
- Create: `packages/docx-engine/test/snapshot.test.ts`
- Create: `packages/docx-engine/test/fixtures/hugging-face-blocks.json`
- Modify: `packages/docx-engine/src/index.ts`
- Reference: `packages/cli/src/semantic/remote-document.ts`
- Reference: `packages/cli/src/semantic/text-tree.ts`

- [ ] **Step 1: Add failing hierarchy and hash tests**

Use a credential-free fixture containing a page, headings, the “Before you start” nested list, and the Hugging Face parameter table. Assert:

```ts
expect(snapshot.rootBlockId).toBe("doc");
expect(snapshot.nodes.find((node) => node.blockId === "nested-child")).toMatchObject({
  parentBlockId: "nested-parent", kind: "list",
});
expect(snapshot.canonicalHash).toBe(snapshotFrom(reorderedObjectKeys).canonicalHash);
expect(snapshotFrom(changedCellText).canonicalHash).not.toBe(snapshot.canonicalHash);
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/snapshot.test.ts
```

Expected: snapshot factory is missing.

- [ ] **Step 3: Implement normalization**

Implement `createDocumentSnapshot({documentId, revision, blocks})` so it:

- resolves child IDs and embedded child objects;
- records exact parent and child order;
- recognizes page/title, text, headings, bullets, ordered lists, Code, Callout, table, Whiteboard, synced-source, and synced-reference types;
- stores unknown blocks as `opaque`;
- excludes volatile revision fields from node hashes;
- includes semantic content, structure, block type, and stable resource identity in hashes.

- [ ] **Step 4: Run snapshot and full engine tests**

```bash
npm test --workspace=feishu-docx-engine -- --run test/snapshot.test.ts
npm test --workspace=feishu-docx-engine
```

Expected: all engine tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src/snapshot.ts packages/docx-engine/src/index.ts packages/docx-engine/test
git commit -m "feat(engine): normalize immutable Docx snapshots"
```

## Task 5: Encode desired text, list, table, Code, and Callout nodes

**Files:**
- Create: `packages/docx-engine/src/codec.ts`
- Create: `packages/docx-engine/test/codec.test.ts`
- Modify: `packages/docx-engine/src/index.ts`
- Reference: `packages/cli/src/markdown/blocks.ts`
- Reference: `packages/cli/src/publish/table-xml.ts`
- Reference: `packages/cli/src/callouts/callout-xml.ts`

- [ ] **Step 1: Write failing typed codec tests**

Test exact provider shells for title/paragraph inline formatting, nested lists, Code language, Callout title/body, and table XML. Include provider-link URL encoding.

```ts
expect(toProviderBlock({kind: "paragraph", content: [{kind: "code", text: "curl"}]})).toMatchObject({
  block_type: 2,
  text: {elements: [{text_run: {content: "curl", text_element_style: {inline_code: true}}}]},
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/codec.test.ts
```

Expected: codec exports are missing.

- [ ] **Step 3: Implement provider-neutral codecs**

Export:

```ts
export function toProviderBlock(node: Exclude<DesiredNode, {kind: "table"}>): ProviderBlock;
export function toProviderTree(nodes: DesiredNode[]): ProviderBlock[];
export function tableToXml(table: Extract<DesiredNode, {kind: "table"}>): string;
```

Do not accept Markdown strings. Keep `markdownToFeishuBlocks` in the CLI package; the CLI converts Markdown into `DesiredNode` before calling the engine.

- [ ] **Step 4: Run codec tests and compare existing formatter tests**

```bash
npm test --workspace=feishu-docx-engine -- --run test/codec.test.ts
npm test --workspace=feishu-md-sync -- --run test/markdown.test.ts test/table-xml.test.ts test/callout-xml.test.ts
```

Expected: all tests pass with equivalent provider shapes.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src/codec.ts packages/docx-engine/src/index.ts packages/docx-engine/test/codec.test.ts
git commit -m "feat(engine): encode typed Docx nodes"
```

## Task 6: Prepare deterministic mutation batches

**Files:**
- Create: `packages/docx-engine/src/prepare.ts`
- Create: `packages/docx-engine/test/prepare.test.ts`
- Modify: `packages/docx-engine/src/index.ts`

- [ ] **Step 1: Write failing preflight compilation tests**

Cover missing anchors, mismatched expected hashes, non-adjacent insert anchors, duplicate operation IDs, and deterministic idempotency tokens.

```ts
expect(() => prepareMutationBatch({snapshot, operations: [insertAfterMissing], idempotencyNamespace: "run-1"}))
  .toThrowError(expect.objectContaining({code: "anchor_missing"}));
expect(prepareMutationBatch(input).steps[0]?.idempotencyToken)
  .toBe(prepareMutationBatch(input).steps[0]?.idempotencyToken);
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/prepare.test.ts
```

Expected: batch compiler is missing.

- [ ] **Step 3: Implement `prepareMutationBatch`**

The function must validate every operation against the supplied snapshot and return a serializable batch containing schema version, engine version, expected revision, physical steps, assertions, and canonical fingerprint. No remote I/O occurs in `prepare`.

- [ ] **Step 4: Run tests and typecheck**

```bash
npm test --workspace=feishu-docx-engine -- --run test/prepare.test.ts
npm run typecheck --workspace=feishu-docx-engine
```

Expected: tests and typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src/prepare.ts packages/docx-engine/src/index.ts packages/docx-engine/test/prepare.test.ts
git commit -m "feat(engine): prepare deterministic mutation batches"
```

## Task 7: Execute and verify ordinary mutations

**Files:**
- Create: `packages/docx-engine/src/apply.ts`
- Create: `packages/docx-engine/test/apply.test.ts`
- Modify: `packages/docx-engine/src/index.ts`

- [ ] **Step 1: Write failing execution tests**

Use an in-memory `DocxTransport` and journal. Cover stale revision, replace, simple insert, delete, move, assert-only operations, per-operation readback, and journal failure.

```ts
await expect(engine.apply({batch, journal})).resolves.toMatchObject({
  finalSnapshot: {canonicalHash: expect.any(String)},
  operations: [{operationId: "op-1", verified: true}],
});
expect(journal.entries.map((entry) => entry.operationId)).toEqual(["op-1"]);
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/apply.test.ts
```

Expected: engine apply implementation is missing.

- [ ] **Step 3: Implement preflight, mutation, and readback loop**

Create `createFeishuDocxEngine({transport})`. `apply` must refetch before the first write, compare revision and batch assertions, execute one operation, refetch, verify only the planned change occurred, call `journal.recordVerified`, and then continue.

Map a post-write verification or journal failure to `PartialMutationError` with completed, failed, and pending operation IDs.

- [ ] **Step 4: Run focused and full engine tests**

```bash
npm test --workspace=feishu-docx-engine -- --run test/apply.test.ts
npm test --workspace=feishu-docx-engine
```

Expected: all engine tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src/apply.ts packages/docx-engine/src/index.ts packages/docx-engine/test/apply.test.ts
git commit -m "feat(engine): apply verified Docx mutations"
```

## Task 8: Add recursive nested-list execution and recovery evidence

**Files:**
- Create: `packages/docx-engine/src/structured-tree.ts`
- Create: `packages/docx-engine/test/structured-tree.test.ts`
- Modify: `packages/docx-engine/src/apply.ts`
- Reference: `packages/cli/src/publish/run-publish.ts:2624-2735`

- [ ] **Step 1: Write failing recursive creation tests**

Cover root creation, child creation under returned IDs, deterministic tokens per path, readback after every level, and failure after a verified prefix.

```ts
expect(transport.createCalls.map((call) => call.parentBlockId)).toEqual(["page", "root-1", "child-1"]);
expect(partial.evidence.createdBlockIds).toEqual(["root-1", "child-1"]);
expect(partial.evidence.recoveryDisposition).toBe("resume_possible");
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/structured-tree.test.ts
```

Expected: structured subtree inserts use only the simple insert path.

- [ ] **Step 3: Implement recursive child creation**

Port the existing `createStructuredTextTrees`, `createStructuredTextChildren`, block-shell validation, sibling-order verification, and deterministic path token logic into the engine. Accept typed list trees rather than Markdown.

- [ ] **Step 4: Run engine and existing nested-list regression tests**

```bash
npm test --workspace=feishu-docx-engine -- --run test/structured-tree.test.ts
npm test --workspace=feishu-md-sync -- --run test/run-publish.test.ts test/scoped-patch-plan.test.ts test/run-pull.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src packages/docx-engine/test/structured-tree.test.ts
git commit -m "feat(engine): create verified nested Docx trees"
```

## Task 9: Add native table and Whiteboard mutations

**Files:**
- Modify: `packages/docx-engine/src/apply.ts`
- Modify: `packages/docx-engine/src/codec.ts`
- Create: `packages/docx-engine/test/table-whiteboard.test.ts`
- Reference: `packages/cli/src/publish/run-publish.ts:1278-1294`
- Reference: `packages/cli/src/whiteboards/whiteboard-plan.ts`

- [ ] **Step 1: Write failing table and Whiteboard tests**

Assert adjacent table anchors, native table XML, full cell readback, unchanged surrounding nodes, raw Whiteboard hash equality, and partial evidence after a successful raw overwrite with failed readback.

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/table-whiteboard.test.ts
```

Expected: table insert and Whiteboard mirror intents are unsupported.

- [ ] **Step 3: Implement mutations and verification**

For table insert/replace, verify both adjacent anchors before writing and compare dimensions, merges, cell content, and placement afterward. For Whiteboards, support `copy-token` for localization, `svg` for Markdown publishing, and `raw` for recovery. Snapshot target raw data before overwrite, use the operation token as idempotency input, normalize raw nodes, and compare canonical hashes.

- [ ] **Step 4: Run focused and existing table/Whiteboard tests**

```bash
npm test --workspace=feishu-docx-engine -- --run test/table-whiteboard.test.ts
npm test --workspace=feishu-md-sync -- --run test/table-xml.test.ts test/table-diff.test.ts test/whiteboard-plan.test.ts test/whiteboard-remote-state.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src packages/docx-engine/test/table-whiteboard.test.ts
git commit -m "feat(engine): support tables and Whiteboard mutations"
```

## Task 10: Implement read-only recovery assessment

**Files:**
- Create: `packages/docx-engine/src/recovery.ts`
- Create: `packages/docx-engine/test/recovery.test.ts`
- Modify: `packages/docx-engine/src/index.ts`

- [ ] **Step 1: Write failing recovery classification tests**

Cover exact completed prefix, exact nested descendant graph, exact table placement, unchanged suffix, extra remote block, changed anchor, and ambiguous content.

```ts
expect(await assessRecovery({batch, checkpoint: afterVerifiedPrefix})).toMatchObject({
  disposition: "resume_possible", completedOperationIds: ["op-1"],
});
expect(await assessRecovery({batch, checkpoint: withExtraRemoteBlock})).toMatchObject({
  disposition: "manual_inspection_required", reason: "unexpected_remote_change",
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-docx-engine -- --run test/recovery.test.ts
```

Expected: recovery assessment is missing.

- [ ] **Step 3: Implement conservative assessment**

Compare current snapshot with the batch and checkpoint. Return `resume_possible` only for an exact verified prefix plus unchanged suffix, `reverse_possible` only when every created or overwritten node has exact durable prewrite evidence, and otherwise `manual_inspection_required`. Do not write remotely.

- [ ] **Step 4: Run recovery and full engine tests**

```bash
npm test --workspace=feishu-docx-engine -- --run test/recovery.test.ts
npm test --workspace=feishu-docx-engine
```

Expected: all engine tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/docx-engine/src/recovery.ts packages/docx-engine/src/index.ts packages/docx-engine/test/recovery.test.ts
git commit -m "feat(engine): assess Docx mutation recovery"
```

## Task 11: Route `feishu-md-sync` scoped writes through the engine

**Files:**
- Create: `packages/cli/src/publish/docx-engine-operations.ts`
- Create: `packages/cli/src/publish/docx-engine-journal.ts`
- Create: `packages/cli/test/docx-engine-operations.test.ts`
- Modify: `packages/cli/package.json`
- Modify: `packages/cli/src/publish/run-publish.ts:1192-1437`
- Modify: `packages/cli/src/publish/partial-write-error.ts`
- Modify: `packages/cli/src/adapters/lark-cli-adapter.ts`

- [ ] **Step 1: Write failing operation translation tests**

For each existing `ScopedPatchOperation` kind, assert the exact engine intent. Examples:

```ts
expect(toMutationIntent(textCreate)).toMatchObject({
  operationId: expect.stringContaining("create"), kind: "insert",
  parentBlockId: textCreate.parentBlockId, insertAfterBlockId: textCreate.insertAfterBlockId,
});
expect(toMutationIntent(tableCreate)).toMatchObject({kind: "insert", desired: [{kind: "table"}]});
expect(toMutationIntent(authoringMove)).toMatchObject({kind: "move", blockIds: [authoringMove.remoteBlockId]});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test --workspace=feishu-md-sync -- --run test/docx-engine-operations.test.ts
```

Expected: translator module is missing.

- [ ] **Step 3: Implement translation, journal, and error bridge**

Translate Markdown-derived desired content into typed nodes before entering the engine. Preserve existing operation summaries and map `PartialMutationEvidence` back to `PartialWriteError`, including recovery checkpoint flags and structured causes.

Replace the body of `applyScopedOperations` with engine `snapshot`, `prepare`, and `apply` calls. Keep product-level partitioning, confirmation decisions, receipt writes, and Whiteboard asset policy in `run-publish.ts`.

- [ ] **Step 4: Run the complete publish regression suite**

```bash
npm test --workspace=feishu-md-sync -- --run test/docx-engine-operations.test.ts test/run-publish.test.ts test/scoped-patch-plan.test.ts test/error-cli.test.ts test/publish-receipt.test.ts test/publish-baseline-bundle.test.ts
npm run typecheck --workspace=feishu-md-sync
```

Expected: all selected tests pass and public CLI JSON fixtures are unchanged.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/package.json package-lock.json packages/cli/src packages/cli/test/docx-engine-operations.test.ts
git commit -m "refactor(sync): execute scoped writes through Docx engine"
```

## Task 12: Remove duplicate physical execution and prove package compatibility

**Files:**
- Modify: `packages/cli/src/adapters/feishu-adapter.ts`
- Modify: `packages/cli/src/adapters/lark-cli-adapter.ts`
- Modify: `packages/cli/src/publish/run-publish.ts`
- Modify: `packages/cli/test/lark-cli-adapter.test.ts`
- Create: `packages/docx-engine/scripts/package-smoke.mjs`
- Modify: `packages/docx-engine/package.json`
- Modify: `packages/cli/scripts/package-smoke.mjs`
- Modify: `README.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add failing packaged smoke assertions**

The engine smoke test must install the generated tarball into a temporary directory and import `createFeishuDocxEngine`, `LarkCliTransport`, `ENGINE_VERSION`, and the public types. The CLI smoke test must install the same tarball version and run `feishu-md-sync --version` plus `publish --help`.

- [ ] **Step 2: Run package smoke tests and verify RED**

```bash
npm pack --workspace=feishu-docx-engine
node packages/docx-engine/scripts/package-smoke.mjs
npm run test:package --workspace=feishu-md-sync
```

Expected: smoke test fails until files, exports, executable integration, and package dependency are complete.

- [ ] **Step 3: Remove duplicate engine-owned methods**

Remove scoped Docx replace/insert/child-create/move/delete and Whiteboard physical logic from the CLI adapter once every caller uses the engine transport. Retain Markdown fetch, Base resolver, document creation compatibility, and other product-only calls that are not yet engine-owned. Document the ownership split and engine compatibility range.

- [ ] **Step 4: Run full verification**

```bash
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:package
npm pack --workspace=feishu-docx-engine
```

Expected: all commands exit 0; coverage remains above repository thresholds; both tarballs contain only declared runtime files.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json packages/docx-engine packages/cli README.md CHANGELOG.md
git commit -m "chore(engine): finalize shared Docx package"
```

## Task 13: Controlled live parity and release

**Files:**
- Modify: `packages/cli/test/live-feishu-publish.test.ts`
- Modify: `packages/cli/test/live-zdoc-authoring-release-dogfood.test.ts`
- Modify: `packages/cli/package.json`
- Modify: `skills/feishu-md-sync/SKILL.md`
- Modify: `scripts/validate-agent-skill.mjs`
- Modify: `CHANGELOG.md`
- Create: `docs/plans/2026-07-20-feishu-docx-engine-release-checklist.md`

- [ ] **Step 1: Add opt-in live assertions**

Add an environment-gated test that performs a no-op read against an existing controlled document and, in a disposable document, creates a nested list and native table, verifies their block tree, then deletes the disposable document according to the existing live-test cleanup policy. Update the Skill validator to require `feishu-md-sync >=0.6.0 <0.7.0` and the engine-backed nested-list/table safety language.

- [ ] **Step 2: Run read-only parity checks first**

```bash
test -n "${CONTROLLED_DOC:-}"
npm run dev -- status packages/cli/test/fixtures/dialects/zdoc-authoring/hugging-face.md --target "$CONTROLLED_DOC" --dialect zdoc-authoring --profile none --format json
npm run dev -- diff packages/cli/test/fixtures/dialects/zdoc-authoring/hugging-face.md --target "$CONTROLLED_DOC" --dialect zdoc-authoring --profile none --format json
```

Expected: outputs match the pre-extraction fixture except for explicitly additive engine diagnostic fields; no write occurs.

- [ ] **Step 3: Run controlled live write tests only with explicit test credentials and target**

```bash
npm run test:live:feishu --workspace=feishu-md-sync
```

Expected: nested list/table writes pass exact readback, cleanup succeeds, and no production document is modified.

- [ ] **Step 4: Publish in dependency order**

```bash
npm publish --workspace=feishu-docx-engine
npm install feishu-docx-engine@0.1.0 --workspace=feishu-md-sync --save-exact
npm version 0.6.0 --workspace=feishu-md-sync --no-git-tag-version
npm run build
npm test
npm run test:skill:release
npm publish --workspace=feishu-md-sync
```

Expected: the registry contains `feishu-docx-engine@0.1.0`; `feishu-md-sync@0.6.0` depends on that exact release, the installed Skill accepts `>=0.6.0 <0.7.0`, and package/Skill smoke tests pass.

- [ ] **Step 5: Commit release metadata**

```bash
git add package.json package-lock.json packages/cli/package.json packages/docx-engine/package.json skills/feishu-md-sync/SKILL.md scripts/validate-agent-skill.mjs CHANGELOG.md docs/plans/2026-07-20-feishu-docx-engine-release-checklist.md
git commit -m "release: publish shared Feishu Docx engine"
```

## Project A Completion Gate

Do not start Project B until all conditions hold:

- `feishu-docx-engine` is available from the package registry at a fixed version.
- the released `feishu-md-sync` consumes the package and passes status, diff, publish dry-run, package smoke, and controlled live tests;
- existing `feishu-md-sync` receipt and JSON contracts remain compatible;
- nested lists, tables, Whiteboards, readback, and partial evidence are exercised through the engine rather than duplicate CLI code.
