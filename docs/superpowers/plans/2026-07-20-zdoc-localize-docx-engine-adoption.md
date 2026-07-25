# ZDoc Localize Docx Engine Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `zdoc-localize`’s duplicate Feishu document writer with the released `feishu-docx-engine`, add typed nested-list and native-table translation/review/apply support, preserve legacy recovery, and unblock a fresh Hugging Face localization run.

**Architecture:** Keep English baseline diffing, Chinese alignment, glossary, translation memory, review, Base/Drive state, correspondence, and business receipts in `zdoc-localize`. Convert engine snapshots into the localization semantic model, compile approved structured translations into engine mutation intents during apply preview, bind the exact engine batch fingerprint into the approval token, and persist engine evidence through a localization journal adapter.

**Tech Stack:** Node.js 20+, TypeScript 5.6 ESM, pnpm workspaces, Vitest 4, Commander 12, released `feishu-docx-engine`, Feishu Base and Drive, SQLite.

---

## Prerequisite Gate

Do not start this plan until Project A has published a tested `feishu-docx-engine` package and a released `feishu-md-sync` consumes it. Install a fixed compatible release; do not use a Git dependency, workspace path outside this repository, or copied engine source.

## File Map

### New localization modules

- Create `packages/zdoc-localize/src/domain/docx-semantic.ts`: convert engine snapshots into localization semantic documents.
- Create `packages/zdoc-localize/src/domain/structured-content.ts`: list/table slot models, protected topology, validation, and desired-node compilation.
- Create `packages/zdoc-localize/src/application/engine-plan.ts`: compile approved localization operations into engine intents and previews.
- Create `packages/zdoc-localize/src/application/engine-journal.ts`: persist verified engine evidence into run metadata and snapshots.
- Create `packages/zdoc-localize/src/application/legacy-recovery.ts`: isolate plan v1/v2 partial/manual recovery compatibility.
- Add focused tests for each new module.

### Modified modules

- Modify `packages/zdoc-localize/package.json` and `pnpm-lock.yaml`: fixed engine dependency.
- Modify `packages/zdoc-localize/src/application/runtime.ts`: construct and inject the engine.
- Modify `packages/zdoc-localize/src/application/ports.ts`: replace document-write methods with the engine seam while retaining registry/snapshot ports.
- Modify `packages/zdoc-localize/src/application/initialization-inspector.ts`: classify via engine snapshots.
- Modify `packages/zdoc-localize/src/application/workflows.ts`: plan v3, structured requests, exact engine preview, apply, journal, finalization, and recovery.
- Modify `packages/zdoc-localize/src/domain/model.ts`: structured semantic content metadata.
- Modify `packages/zdoc-localize/src/domain/initial-plan.ts`: list/table initialization policies.
- Modify `packages/zdoc-localize/src/domain/translation.ts`: translation slots and topology validation.
- Modify `packages/zdoc-localize/src/domain/review.ts`: plan v3 and grouped list/table rendering.
- Modify `packages/zdoc-localize/src/domain/native-sync.ts`: correspondence entries for created descendants and tables.
- Modify `packages/zdoc-localize/src/cli/program.ts`: engine diagnostics and feature flags.
- Retire `packages/zdoc-localize/src/adapters/feishu-md-sync-adapter.ts` and engine-duplicated update behavior. Replace `lark-docs-adapter.ts` with a create-only adapter until document creation is added to a later engine capability.
- Update README, Skill workflow/error references, package smoke, and compatibility tests.

## Task 1: Install the released engine and expose diagnostics

**Files:**
- Modify: `packages/zdoc-localize/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/zdoc-localize/src/cli/program.ts:14-49,143-203`
- Modify: `packages/zdoc-localize/test/cli-contract.test.ts`
- Modify: `packages/zdoc-localize/test/skill-compatibility.test.ts`

- [ ] **Step 1: Write failing capability and doctor tests**

Require capabilities to include the embedded engine identity:

```ts
expect(result.data).toMatchObject({
  docxEngine: {
    version: "0.1.1",
    schemaVersion: 1,
    capabilities: expect.arrayContaining([
      "nested-list-create-v1",
      "native-table-create-v1",
      "whiteboard-overwrite-v1",
      "partial-write-evidence-v1",
    ]),
  },
});
expect(result.data.features).toEqual(expect.arrayContaining([
  "docx-engine-v1",
  "structured-list-localization-v1",
  "native-table-localization-v1",
]));
```

Update the doctor test to assert there is no subprocess call to `feishu-md-sync --version` and that the engine version check is an in-process passed check.

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- cli-contract.test.ts skill-compatibility.test.ts
```

Expected: engine fields/features are absent and doctor still probes `feishu-md-sync`.

- [ ] **Step 3: Add the fixed dependency and diagnostics**

Run:

```bash
pnpm --filter zdoc-localize add feishu-docx-engine@0.1.1 --save-exact
```

Import `ENGINE_VERSION`, `ENGINE_SCHEMA_VERSION`, and `ENGINE_CAPABILITIES`. Add them to capabilities output. Replace the optional binary probe with:

```ts
checks.push({
  id: "feishu-docx-engine",
  status: ENGINE_SCHEMA_VERSION === 1 ? "passed" : "failed",
  detail: ENGINE_VERSION,
});
```

Keep `lark-cli` version and auth checks because the engine still uses that external dependency.

- [ ] **Step 4: Run focused tests and package typecheck**

```bash
pnpm --filter zdoc-localize test -- cli-contract.test.ts skill-compatibility.test.ts
pnpm --filter zdoc-localize typecheck
```

Expected: tests and typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/package.json pnpm-lock.yaml packages/zdoc-localize/src/cli/program.ts packages/zdoc-localize/test/cli-contract.test.ts packages/zdoc-localize/test/skill-compatibility.test.ts
git commit -m "feat(localize): add shared Docx engine dependency"
```

## Task 2: Convert engine snapshots into localization semantics

**Files:**
- Create: `packages/zdoc-localize/src/domain/docx-semantic.ts`
- Create: `packages/zdoc-localize/test/docx-semantic.test.ts`
- Reuse: `packages/zdoc-localize/test/fixtures/hugging-face-source-snapshot.json`
- Modify: `packages/zdoc-localize/src/domain/model.ts`
- Keep: `packages/zdoc-localize/src/domain/xml-parser.ts` for legacy runs only

- [ ] **Step 1: Write failing semantic conversion tests**

Create `test/fixtures/hugging-face-source-snapshot.json` as a credential-free `DocumentSnapshot` with revision `44`, a title, the “Before you start” nested list, the five-row Hugging Face parameter table, one Code node, one Whiteboard token, and one synced-source identity. Assert titles/headings, nested list topology, table cells, Code, Whiteboard tokens, synced identities, block IDs, heading paths, and canonical hashes.

```ts
const document = semanticDocumentFromSnapshot(snapshot);
expect(document.nodes.find((node) => node.kind === "list")?.structure).toMatchObject({kind: "list"});
expect(document.nodes.find((node) => node.kind === "table")?.structure).toMatchObject({
  kind: "table", rows: expect.any(Array),
});
expect(document.nodes.find((node) => node.kind === "table")?.writable).toBe(true);
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- docx-semantic.test.ts
```

Expected: converter and structured node metadata are missing.

- [ ] **Step 3: Implement the converter**

Extend `SemanticNode` with:

```ts
export interface StructuredListItem {
  content: InlineContent[];
  children: Array<{ordered: boolean; items: StructuredListItem[]}>;
}

export interface StructuredTableRow {
  cells: Array<{content: DesiredNode[]}>;
}

structure?:
  | {kind: "list"; ordered: boolean; items: StructuredListItem[]}
  | {kind: "table"; rows: StructuredTableRow[]}
  | {kind: "code"; language: string; caption?: string};
```

Map engine node hashes directly to localization fingerprints. Preserve heading paths and deterministic sibling ordinals. Mark engine-supported list/table nodes writable while retaining `opaque` for unknown provider shapes. Keep `parseFeishuDocument` available only for plan v1/v2 snapshots and legacy recovery.

- [ ] **Step 4: Run semantic, diff, and alignment tests**

```bash
pnpm --filter zdoc-localize test -- docx-semantic.test.ts diff-alignment.test.ts xml-parser.test.ts
```

Expected: new and legacy parsing tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/domain/model.ts packages/zdoc-localize/src/domain/docx-semantic.ts packages/zdoc-localize/test/docx-semantic.test.ts packages/zdoc-localize/test/fixtures/hugging-face-source-snapshot.json
git commit -m "feat(localize): model typed Docx snapshots"
```

## Task 3: Inject the engine into initialization and workflows

**Files:**
- Modify: `packages/zdoc-localize/src/application/ports.ts:5-39`
- Modify: `packages/zdoc-localize/src/application/runtime.ts:5-75`
- Modify: `packages/zdoc-localize/src/application/initialization-inspector.ts`
- Modify: `packages/zdoc-localize/test/initialization.test.ts`
- Modify: `packages/zdoc-localize/test/planning-workflow.test.ts`

- [ ] **Step 1: Write failing engine-injection tests**

Replace fake XML documents with an in-memory engine exposing `snapshot`, `prepare`, `apply`, and `assessRecovery`. Assert title-only classification from a snapshot containing only a page/title node and incremental routing when a receipt exists.

```ts
expect(await inspector.inspect(pairWithEmptyTarget)).toMatchObject({
  kind: "initialize_empty_target",
  source: {revision: "44"},
  target: {revision: "4"},
});
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- initialization.test.ts planning-workflow.test.ts
```

Expected: constructors still require `DocumentGateway` and XML content.

- [ ] **Step 3: Replace the document-write port with engine injection**

Define:

```ts
export type LocalizationDocxEngine = Pick<FeishuDocxEngine,
  "snapshot" | "prepare" | "apply" | "assessRecovery"
>;

export interface DocumentCreationGateway {
  createDocument(input: {title: string; parentToken?: string; xml: string}): Promise<{
    documentId: string; documentUrl?: string; revisionId?: number;
  }>;
}
```

Runtime constructs the official engine with the released `LarkCliTransport` and keeps a create-only document adapter for the existing missing-target workflow. Registry, Drive snapshots, and SQLite remain unchanged. `InitializationInspector` consumes engine snapshots and `semanticDocumentFromSnapshot`.

- [ ] **Step 4: Run focused tests**

```bash
pnpm --filter zdoc-localize test -- initialization.test.ts planning-workflow.test.ts adapters.test.ts
```

Expected: classification and workflow tests pass with engine fakes; legacy adapter tests remain until cleanup.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/application packages/zdoc-localize/test/initialization.test.ts packages/zdoc-localize/test/planning-workflow.test.ts
git commit -m "refactor(localize): inject shared Docx engine"
```

## Task 4: Add structured list and table translation slots

**Files:**
- Create: `packages/zdoc-localize/src/domain/structured-content.ts`
- Create: `packages/zdoc-localize/test/structured-content.test.ts`
- Modify: `packages/zdoc-localize/src/domain/translation.ts`
- Modify: `packages/zdoc-localize/test/translation-protocol.test.ts`

- [ ] **Step 1: Write failing slot extraction and validation tests**

Require stable slots and immutable topology:

```ts
expect(extractTranslationSlots(nestedList)).toEqual([
  {slotId: "item-0/text", sourceText: "You have an integration"},
  {slotId: "item-1/text", sourceText: "You selected a model"},
  {slotId: "item-1/child-0/item-0/text", sourceText: "Feature Extraction is supported"},
]);
expect(() => applySlotTranslations(nestedList, [{slotId: "unknown", translatedText: "错误"}]))
  .toThrowError(expect.objectContaining({subtype: "structured_slot_mismatch"}));
```

For tables, assert row/cell indices and nested paragraph slots. Assert that code-only cells create no translation slot and retain exact content.

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- structured-content.test.ts translation-protocol.test.ts
```

Expected: structured slot protocol is missing.

- [ ] **Step 3: Implement structured request/response types**

Extend translation requests with:

```ts
export interface StructuredTranslationSlot {
  slotId: string;
  sourceText: string;
  targetCurrent?: string;
  preserved: PreservedToken[];
}

export interface StructuredTranslationShape {
  kind: "list" | "table";
  topologyHash: string;
  slots: StructuredTranslationSlot[];
}
```

Responses contain `{operationId, slots: [{slotId, translatedText}]}` for structured operations. Validate exact slot identity, topology hash, glossary, links, and protected tokens per slot. Keep plan v1/v2 text responses readable.

- [ ] **Step 4: Run translation tests**

```bash
pnpm --filter zdoc-localize test -- structured-content.test.ts translation-protocol.test.ts
```

Expected: all tests pass, including existing paragraph/list compatibility cases.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/domain/structured-content.ts packages/zdoc-localize/src/domain/translation.ts packages/zdoc-localize/test/structured-content.test.ts packages/zdoc-localize/test/translation-protocol.test.ts
git commit -m "feat(localize): add structured translation slots"
```

## Task 5: Plan existing-empty-target lists and tables

**Files:**
- Modify: `packages/zdoc-localize/src/domain/initial-plan.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts:804-875`
- Modify: `packages/zdoc-localize/test/planning-workflow.test.ts`
- Create: `packages/zdoc-localize/test/fixtures/hugging-face-source-snapshot.json`

- [ ] **Step 1: Replace the blocker regression with a failing full-plan test**

Build an existing title-only target and source revision 44 fixture. Assert:

```ts
const result = await workflows.createPlan("hugging-face-en-zh");
expect(result.state).toBe("translation_required");
expect(result.translationRequests).toEqual(expect.arrayContaining([
  expect.objectContaining({targetNodeKind: "list", structured: {kind: "list"}}),
  expect.objectContaining({targetNodeKind: "table", structured: {kind: "table"}}),
]));
expect(result.blocker).toBeUndefined();
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- planning-workflow.test.ts
```

Expected: initialization returns `initialization_unsupported_content` for list/table.

- [ ] **Step 3: Update initial planning policy**

`buildInitialPlanInputs` treats engine-supported list and table structures as `translation` operations with immutable topology. Ordinary Code remains `verbatim_code`; Whiteboards remain `whiteboard_mirror`; synced sources remain manual references. Unknown tables/resources remain blockers.

Persist `source-snapshot.json`, `target-snapshot.json`, structured requests, and topology hashes in the immutable bundle. New plans use `planVersion: 3`.

- [ ] **Step 4: Run planning and fixture tests**

```bash
pnpm --filter zdoc-localize test -- planning-workflow.test.ts initialization.test.ts docx-semantic.test.ts
```

Expected: revision 44 fixture reaches `translation_required` with complete list/table requests.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/domain/initial-plan.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/planning-workflow.test.ts
git commit -m "feat(localize): plan structured empty targets"
```

## Task 6: Render and protect structured review content

**Files:**
- Modify: `packages/zdoc-localize/src/domain/review.ts`
- Modify: `packages/zdoc-localize/test/review.test.ts`
- Modify: `packages/zdoc-localize/src/domain/model.ts`

- [ ] **Step 1: Write failing plan v3 review tests**

Require a grouped human-readable list/table and slot-specific editable markers:

```md
<!-- BEGIN EDITABLE TRANSLATION op:op-table slot:row-1/cell-2/paragraph-1 -->
模型 ID
<!-- END EDITABLE TRANSLATION op:op-table slot:row-1/cell-2/paragraph-1 -->
```

Assert changing row count, slot order, operation metadata, topology hash, or protected Code causes `review_metadata_changed` or `review_operation_mismatch`.

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- review.test.ts
```

Expected: plan v3 and structured markers are unsupported.

- [ ] **Step 3: Implement plan v3 review compilation/parsing**

Change `LocalizationPlan.planVersion` to `1 | 2 | 3`. Add structured operation metadata and a second marker parser keyed by both operation ID and slot ID. Render complete list outlines and Markdown-like tables for review, but derive parsed approvals only from exact immutable slots.

Return approved operations as:

```ts
type ApprovedReviewOperation =
  | {operationId: string; approvedText: string}
  | {operationId: string; approvedSlots: Array<{slotId: string; approvedText: string}>}
  | {operationId: string; decision: "delete" | "protected"};
```

- [ ] **Step 4: Run review and translation tests**

```bash
pnpm --filter zdoc-localize test -- review.test.ts translation-protocol.test.ts structured-content.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/domain/model.ts packages/zdoc-localize/src/domain/review.ts packages/zdoc-localize/test/review.test.ts
git commit -m "feat(localize): render structured translation reviews"
```

## Task 7: Compile exact engine preview batches

**Files:**
- Create: `packages/zdoc-localize/src/application/engine-plan.ts`
- Create: `packages/zdoc-localize/test/engine-plan.test.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts:1075-1146`
- Modify: `packages/zdoc-localize/test/apply-workflow.test.ts`

- [ ] **Step 1: Write failing preview tests**

Assert the preview includes engine version, batch fingerprint, typed operation summaries, created subtree counts, and no compiled raw XML:

```ts
expect(preview).toMatchObject({
  docxEngineVersion: "0.1.1",
  batchFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
  operations: expect.arrayContaining([
    expect.objectContaining({operationId: "op-list", kind: "insert", nodeKind: "list"}),
    expect.objectContaining({operationId: "op-table", kind: "insert", nodeKind: "table"}),
  ]),
});
expect(preview.operations[0]).not.toHaveProperty("compiledXml");
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- engine-plan.test.ts apply-workflow.test.ts
```

Expected: preview still emits `compiledXml` and approval token excludes an engine fingerprint.

- [ ] **Step 3: Implement approved plan compilation**

`compileEngineBatch` converts approved paragraph/list/table/Code/Callout operations into typed engine intents. It calls `engine.prepare` against the stored target snapshot. The preview approval token becomes:

```ts
canonicalHash({
  runId,
  planHash: approved.planHash,
  approvedOperations: approved.operations,
  engineSchemaVersion: batch.schemaVersion,
  engineVersion: batch.engineVersion,
  batchFingerprint: batch.fingerprint,
});
```

Persist `prepared-batch.json` and `approved-review.json` in an immutable preview bundle, and store its reference on the run. Re-running preview with unchanged inputs must produce the same fingerprint and token.

- [ ] **Step 4: Run preview tests**

```bash
pnpm --filter zdoc-localize test -- engine-plan.test.ts apply-workflow.test.ts
```

Expected: preview tests pass and existing approval-token tests remain green.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/application/engine-plan.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/test/engine-plan.test.ts packages/zdoc-localize/test/apply-workflow.test.ts
git commit -m "feat(localize): bind previews to Docx engine batches"
```

## Task 8: Apply through the engine and persist operation evidence

**Files:**
- Create: `packages/zdoc-localize/src/application/engine-journal.ts`
- Create: `packages/zdoc-localize/test/engine-journal.test.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts:1149-1515`
- Modify: `packages/zdoc-localize/src/domain/native-sync.ts`
- Modify: `packages/zdoc-localize/test/apply-workflow.test.ts`

- [ ] **Step 1: Write failing apply/journal tests**

Use an in-memory engine that returns created root and descendant IDs for a list and table. Assert that each verified operation is persisted before the next operation and that final correspondences reference the created target nodes.

```ts
expect(run.metadata?.engineEvidence).toEqual([
  expect.objectContaining({operationId: "op-list", createdBlockIds: ["list-root", "list-child"]}),
  expect.objectContaining({operationId: "op-table", createdBlockIds: ["table-root"]}),
]);
expect(receipt.correspondences).toEqual(expect.arrayContaining([
  expect.objectContaining({kind: "content", sourceNodeId: "source-list", targetNodeId: expect.any(String)}),
]));
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- engine-journal.test.ts apply-workflow.test.ts
```

Expected: workflow still calls `replaceBlock`, `insertAfter`, and `deleteBlocks` directly.

- [ ] **Step 3: Implement engine application and journal bridge**

Load the exact stored preview batch, regenerate preview, require the same approval token and fingerprint, save the prewrite snapshot, mark the run `applying`, and call `engine.apply` with a journal that appends verified evidence to run metadata plus an immutable `apply-evidence.json` bundle.

After engine success, use `MutationOutcome.finalSnapshot` for final semantic verification and correspondence updates. Do not write the localization receipt until every automatic operation and any required manual synced-reference action is verified.

- [ ] **Step 4: Run apply, storage, and correspondence tests**

```bash
pnpm --filter zdoc-localize test -- engine-journal.test.ts apply-workflow.test.ts storage.test.ts native-sync.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/application packages/zdoc-localize/src/domain/native-sync.ts packages/zdoc-localize/test/engine-journal.test.ts packages/zdoc-localize/test/apply-workflow.test.ts
git commit -m "refactor(localize): apply through shared Docx engine"
```

## Task 9: Preserve legacy recovery and adopt engine recovery evidence

**Files:**
- Create: `packages/zdoc-localize/src/application/legacy-recovery.ts`
- Create: `packages/zdoc-localize/test/legacy-recovery.test.ts`
- Modify: `packages/zdoc-localize/src/application/workflows.ts:2260-2440`
- Modify: `packages/zdoc-localize/src/domain/recovery.ts`
- Modify: `packages/zdoc-localize/test/apply-workflow.test.ts`

- [ ] **Step 1: Write failing compatibility tests**

Cover:

- completed v1/v2 receipts remain usable for a new v3 run;
- v1/v2 `review_required`, `blocked`, and `stale` runs cannot apply after migration;
- v1/v2 `partial` and `manual_action_required` runs still use legacy inspect/reverse/manual verify;
- v3 partial runs delegate assessment to the engine;
- engine `manual_inspection_required` never produces a reverse token.

```ts
await expect(workflows.previewApply("legacy-review", "review.md")).rejects.toMatchObject({
  type: "stale_plan", subtype: "legacy_plan_requires_regeneration",
});
expect(await workflows.inspectRecovery("engine-partial")).toMatchObject({
  disposition: "resume_possible", batchFingerprint: expect.any(String),
});
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- legacy-recovery.test.ts apply-workflow.test.ts
```

Expected: workflows do not branch by plan version/engine evidence.

- [ ] **Step 3: Isolate legacy and engine recovery paths**

Move current XML/prewrite reverse logic behind `LegacyRecoveryCoordinator`. For plan v3, use `engine.assessRecovery` and translate its disposition into existing recovery preview output. Preserve explicit approval tokens for reverse/resume; never execute recovery because the engine reports it as possible.

- [ ] **Step 4: Run recovery and state-machine tests**

```bash
pnpm --filter zdoc-localize test -- legacy-recovery.test.ts apply-workflow.test.ts domain-foundation.test.ts validation-report.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/src/application/legacy-recovery.ts packages/zdoc-localize/src/application/workflows.ts packages/zdoc-localize/src/domain/recovery.ts packages/zdoc-localize/test/legacy-recovery.test.ts packages/zdoc-localize/test/apply-workflow.test.ts
git commit -m "feat(localize): preserve legacy and engine recovery"
```

## Task 10: Retire duplicate document mutation adapters

**Files:**
- Delete: `packages/zdoc-localize/src/adapters/feishu-md-sync-adapter.ts`
- Rename: `packages/zdoc-localize/src/adapters/lark-docs-adapter.ts` -> `packages/zdoc-localize/src/adapters/lark-document-creation-adapter.ts`
- Delete or reduce: `packages/zdoc-localize/src/adapters/lark-whiteboard-adapter.ts`
- Modify: `packages/zdoc-localize/src/application/runtime.ts`
- Modify: `packages/zdoc-localize/src/application/ports.ts`
- Modify: `packages/zdoc-localize/test/adapters.test.ts`
- Modify: `packages/zdoc-localize/test/whiteboard.test.ts`

- [ ] **Step 1: Add a failing duplicate-writer guard**

Add a source contract test:

```ts
const files = await sourceFiles("src");
expect(await occurrences(files, "docs +update")).toBe(0);
expect(await occurrences(files, "block_insert_after")).toBe(0);
expect(await occurrences(files, "feishu-md-sync")).toBe(0);
```

Permit `lark-cli docs +create` only in `lark-document-creation-adapter.ts`; permit other direct `lark-cli` calls only in Base/Drive adapters and engine construction.

- [ ] **Step 2: Run and verify RED**

```bash
pnpm --filter zdoc-localize test -- adapters.test.ts whiteboard.test.ts
```

Expected: direct document adapters and stale compatibility code are still present.

- [ ] **Step 3: Remove duplicate physical behavior**

Delete the unused `FeishuMdSyncAdapter`. Rename and reduce `LarkDocsAdapter` so it exposes only `createDocument`; remove replace, insert, delete, fetch, and update methods from it and from ports. Remove the Whiteboard update adapter because the Project A gate requires `whiteboard-overwrite-v1`; retain only Base/Drive-specific code not owned by the engine.

Keep the legacy XML parser and recovery coordinator because stored v1/v2 runs may still require them.

- [ ] **Step 4: Run the full package suite**

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
```

Expected: all commands pass and source guard finds no duplicate document writer.

- [ ] **Step 5: Commit**

```bash
git add -A packages/zdoc-localize/src packages/zdoc-localize/test
git commit -m "refactor(localize): remove duplicate Feishu writer"
```

## Task 11: Update CLI, Skill, documentation, and package smoke

**Files:**
- Modify: `packages/zdoc-localize/README.md`
- Modify: `packages/zdoc-localize/scripts/package-smoke.mjs`
- Modify: `skills/zdoc-localization/SKILL.md`
- Modify: `skills/zdoc-localization/references/workflow.md`
- Modify: `skills/zdoc-localization/references/errors.md`
- Modify: `scripts/check-zdoc-localize-skill-compat.mjs`
- Modify: `packages/zdoc-localize/test/skill-compatibility.test.ts`

- [ ] **Step 1: Write failing documentation/Skill contract assertions**

Require the Skill to check `docx-engine-v1`, `structured-list-localization-v1`, and `native-table-localization-v1`; forbid instructions that invoke `feishu-md-sync` from inside localization; require structured slot and engine recovery routing.

- [ ] **Step 2: Run compatibility checks and verify RED**

```bash
pnpm --filter zdoc-localize test -- skill-compatibility.test.ts
node scripts/check-zdoc-localize-skill-compat.mjs
pnpm --filter zdoc-localize test:package
```

Expected: old Skill capabilities and package smoke assumptions fail.

- [ ] **Step 3: Update public contracts**

Document:

- remote English to remote Chinese incremental baseline model;
- structured list/table review format;
- exact engine batch fingerprint in apply preview;
- engine partial/recovery evidence;
- legacy run behavior;
- removal of the `feishu-md-sync` executable dependency.

Package smoke must install the packed `zdoc-localize` artifact in a temporary directory and verify that the released engine dependency resolves and capabilities report its version.

- [ ] **Step 4: Run docs/Skill/package verification**

```bash
pnpm --filter zdoc-localize test -- skill-compatibility.test.ts cli-contract.test.ts
node scripts/check-zdoc-localize-skill-compat.mjs
pnpm --filter zdoc-localize pack:check
```

Expected: all commands pass.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/README.md packages/zdoc-localize/scripts/package-smoke.mjs skills/zdoc-localization scripts/check-zdoc-localize-skill-compat.mjs packages/zdoc-localize/test
git commit -m "docs(localize): document shared Docx engine workflow"
```

## Task 12: Full verification and release preparation

**Files:**
- Modify: `packages/zdoc-localize/package.json`
- Modify: `CHANGELOG.md` or the repository release-notes location
- Create: `docs/superpowers/plans/2026-07-20-zdoc-localize-engine-release-checklist.md`

- [ ] **Step 1: Add release assertions**

The release checklist must record exact CLI, Skill, engine, `lark-cli`, registry schema, and package hashes. Add a test that the new CLI version remains inside the updated Skill compatibility range.

- [ ] **Step 2: Run the complete credential-free verification suite**

```bash
pnpm --filter zdoc-localize typecheck
pnpm --filter zdoc-localize test
pnpm --filter zdoc-localize build
pnpm --filter zdoc-localize pack:check
node scripts/check-zdoc-localize-skill-compat.mjs
```

Expected: every command exits 0.

- [ ] **Step 3: Bump compatible CLI and Skill versions**

Set `zdoc-localize` and its package to `0.2.0`. Update the Skill compatibility range to `>=0.2.0 <0.3.0`, update release notes and capabilities together, and keep the engine dependency fixed to the tested `0.1.1` release for this rollout.

- [ ] **Step 4: Re-run package verification after the version bump**

Run the commands from Step 2.

Expected: all commands pass and packed metadata contains the released engine dependency.

- [ ] **Step 5: Commit**

```bash
git add packages/zdoc-localize/package.json pnpm-lock.yaml packages/zdoc-localize/src/cli/program.ts skills/zdoc-localization CHANGELOG.md docs/superpowers/plans/2026-07-20-zdoc-localize-engine-release-checklist.md
git commit -m "release(localize): prepare Docx engine integration"
```

## Task 13: Hugging Face dogfood through the review gate

**Files:**
- No implementation files unless credential-free regression fixtures reveal a defect.
- Generated run artifacts remain under `.zdoc-localize/runs/$RUN_ID/` and the configured immutable Drive state folder.

- [ ] **Step 1: Verify installed versions and registry health**

```bash
zdoc-localize --version
zdoc-localize capabilities --format json
zdoc-localize doctor --format json
zdoc-localize registry schema --format json
zdoc-localize pair show --pair hugging-face-en-zh --format json
```

Expected: doctor passes; engine capabilities include lists, native tables, and partial evidence; the pair remains mirror/needs-bootstrap with the specified source and target URLs.

- [ ] **Step 2: Confirm English Source of Truth is still synchronized**

Run the released `feishu-md-sync` status, diff, and publish dry-run using the canonical local Markdown, `zdoc-authoring`, and profile `none`.

Expected: either `no-op`, or a separately reviewed English publish plan. Do not continue localization until the English remote is verified current.

- [ ] **Step 3: Create a fresh localization run**

```bash
PLAN_JSON="$(zdoc-localize plan create --pair hugging-face-en-zh --format json)"
RUN_ID="$(node -e \'const value=JSON.parse(process.argv[1]); process.stdout.write(value.data.runId)\' "$PLAN_JSON")"
test -n "$RUN_ID"
printf "%s\n" "$RUN_ID" > .zdoc-localize/hugging-face-dogfood-run-id
printf "%s\n" "$PLAN_JSON"
```

Expected: a new run in `translation_required`; no `initialization_unsupported_content`; requests include every paragraph, nested-list slot, table cell slot, Code policy, Whiteboard policy, and synced-reference action.

- [ ] **Step 4: Complete translations and present review**

Generate `translations.json` from the exact requests, preserving glossary, code, URLs, topology, and protected tokens. Then run:

```bash
RUN_ID="$(node -e \'const fs=require("node:fs"); process.stdout.write(fs.readFileSync(".zdoc-localize/hugging-face-dogfood-run-id","utf8").trim())\')"
zdoc-localize plan complete --run "$RUN_ID" --translations ".zdoc-localize/runs/$RUN_ID/translations.json" --format json
```

Expected: `review_required`; `review.md` contains the complete list/table review and every warning. Present the review to the user and stop. Do not generate an apply write without explicit review approval.

- [ ] **Step 5: Commit only credential-free regression fixes**

If dogfood exposed no defect, make no source commit. If a defect was fixed, add a credential-free regression test, run the full suite, and commit only the tested fix. Never commit run artifacts, credentials, Base tokens, or remote document snapshots containing sensitive content.

## Task 14: Approved preview, apply, and completion verification

This task is blocked until the user explicitly approves the complete review from Task 13.

- [ ] **Step 1: Generate the exact apply preview**

```bash
RUN_ID="$(node -e \'const fs=require("node:fs"); process.stdout.write(fs.readFileSync(".zdoc-localize/hugging-face-dogfood-run-id","utf8").trim())\')"
PREVIEW_JSON="$(zdoc-localize apply --run "$RUN_ID" --review ".zdoc-localize/runs/$RUN_ID/review.md" --preview --format json)"
printf "%s\n" "$PREVIEW_JSON" > ".zdoc-localize/runs/$RUN_ID/approved-apply-preview.json"
printf "%s\n" "$PREVIEW_JSON"
```

Expected: preview contains exact operation summaries, source/target revisions, engine version, batch fingerprint, and approval token. Present it and stop.

- [ ] **Step 2: Wait for separate approval of that exact preview**

Do not add an approval token or perform a write until the user explicitly approves the current preview. If either remote revision changes, discard the preview and regenerate the plan/review.

- [ ] **Step 3: Apply only the approved batch**

```bash
RUN_ID="$(node -e \'const fs=require("node:fs"); process.stdout.write(fs.readFileSync(".zdoc-localize/hugging-face-dogfood-run-id","utf8").trim())\')"
APPROVAL_TOKEN="$(node -e \'const fs=require("node:fs"); const value=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(value.data.approvalToken)\' ".zdoc-localize/runs/$RUN_ID/approved-apply-preview.json")"
zdoc-localize apply --run "$RUN_ID" --review ".zdoc-localize/runs/$RUN_ID/review.md" --approval-token "$APPROVAL_TOKEN" --format json
```

Expected: automatic writes verify successfully or return structured partial/manual-action state. Do not claim completion from a successful provider call alone.

- [ ] **Step 4: Complete manual synced-reference actions if required**

Present every immutable manual action. After the user creates the native references in Feishu, run:

```bash
RUN_ID="$(node -e \'const fs=require("node:fs"); process.stdout.write(fs.readFileSync(".zdoc-localize/hugging-face-dogfood-run-id","utf8").trim())\')"
zdoc-localize manual verify --run "$RUN_ID" --format json
```

Expected: exact source document/block identities verify.

- [ ] **Step 5: Verify final completion**

```bash
RUN_ID="$(node -e \'const fs=require("node:fs"); process.stdout.write(fs.readFileSync(".zdoc-localize/hugging-face-dogfood-run-id","utf8").trim())\')"
zdoc-localize status --run "$RUN_ID" --format json
```

Expected: `state=completed`, source revision equals the reviewed English revision, target readback matches every operation, the localization receipt references the new run, and the pair status is active.

## Project B Completion Gate

Project B is complete only when:

- `zdoc-localize` consumes a released `feishu-docx-engine` package;
- no duplicate direct Feishu document writer remains in localization code;
- completed legacy receipts remain usable and unresolved legacy runs follow explicit compatibility rules;
- title-only initialization generates complete nested-list and native-table translation requests;
- structured review and exact engine preview approval gates are preserved;
- engine evidence drives readback, correspondence, partial recovery, and final receipt persistence;
- the Hugging Face run reaches `completed` only after separate user approval of review and apply preview.
