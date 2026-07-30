import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {
  PartialMutationError,
  canonicalWhiteboardRawHash,
  createDocumentSnapshot,
  prepareMutationBatch,
  preparedMutationBatchFingerprint,
  type ApplyMutationInput,
  type AssessRecoveryInput,
  type DocumentSelector,
  type DocumentSnapshot,
  type MutationOutcome,
  type MutationIntentV2,
  type PrepareMutationInput,
  type PreparedMutationBatch,
  type ProviderBlock,
  type RecoveryAssessment,
  type VerifiedOperationEvidenceV2,
} from 'feishu-docx-engine';
import {describe, expect, it} from 'vitest';

import type {
  DocumentCreationGateway,
  DocumentReadGateway,
  FetchedDocument,
  LocalizationDocxEngine,
  TranslationMemory,
  TranslationMemoryEntry,
  TranslationMemoryQuery,
  WhiteboardReadGateway,
} from '../src/application/ports.js';
import {LocalizationWorkflows} from '../src/application/workflows.js';
import {semanticDocumentFromSnapshot} from '../src/domain/docx-semantic.js';
import {compileReview, parseReview, type LocalizationPlan} from '../src/domain/review.js';
import {STRUCTURED_TOPOLOGY_VERSION, structuredTopologyHash} from '../src/domain/structured-content.js';
import type {TranslationRequest} from '../src/domain/translation.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';

class MemoryTranslationMemory implements TranslationMemory {
  readonly entries: TranslationMemoryEntry[] = [];
  failWrites = false;
  async recordApproved(entry: TranslationMemoryEntry): Promise<void> {
    if (this.failWrites) throw new Error('translation memory unavailable');
    this.entries.push(entry);
  }
  async findExact(_query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined> { return undefined; }
  async close(): Promise<void> {}
}

class NoEngineDirectWrites implements DocumentReadGateway {
  readonly writes: string[] = [];
  async fetch(): Promise<never> { throw new Error('Engine apply must not fetch through the legacy document gateway.'); }
}

class MemoryDocumentReader implements DocumentReadGateway {
  constructor(readonly documents: Map<string, FetchedDocument>) {}

  async fetch(doc: string): Promise<FetchedDocument> {
    const result = this.documents.get(doc);
    if (!result) throw new Error(`Missing fake document ${doc}`);
    return {...result};
  }
}

class MemoryDocumentCreation implements DocumentCreationGateway {
  readonly creates: Array<{title: string; parentToken?: string; xml: string}> = [];
  corruptCreates = false;

  constructor(private readonly documents: Map<string, FetchedDocument>) {}

  async createDocument(input: {title: string; parentToken?: string; xml: string}): Promise<{
    documentId: string;
    revisionId: number;
  }> {
    this.creates.push(input);
    const body = this.corruptCreates ? '<p>corrupt creation</p>' : input.xml;
    this.documents.set('created-target', {
      documentId: 'created-target', revisionId: 1, content: `<title>${input.title}</title>${body}`,
    });
    return {documentId: 'created-target', revisionId: 1};
  }
}

function engineSnapshot(documentId: string, revision: string, blocks: ProviderBlock[]): DocumentSnapshot {
  return createDocumentSnapshot({documentId, revision, blocks});
}

function engineEvidence(
  operationId: string,
  revision: string,
  afterSnapshotHash: string,
  rootBlockIds: string[],
  createdBlockIds: string[],
): VerifiedOperationEvidenceV2 {
  return {
    operationId, revision, afterSnapshotHash, createdBlockIds, verified: true,
    outputs: [{slotId: 'created-roots', kind: 'block-roots', rootBlockIds, createdBlockIds}],
  };
}

class ApplyingEngine implements LocalizationDocxEngine {
  readonly snapshots = new Map<string, DocumentSnapshot>();
  readonly persistedEvidenceCounts: number[] = [];
  appliedBatch?: PreparedMutationBatch;

  constructor(
    private readonly registry: LocalRegistryStore,
    private readonly runId: string,
    private readonly finalSnapshot: DocumentSnapshot,
    private readonly failureMode: 'none' | 'partial' | 'invalid-partial' | 'short-success' = 'none',
  ) {}

  async snapshot(selector: DocumentSelector): Promise<DocumentSnapshot> {
    const key = selector.kind === 'url' ? selector.url : selector.token;
    const value = this.snapshots.get(key);
    if (!value) throw new Error(`Missing Engine snapshot ${key}`);
    return value;
  }

  prepare(input: PrepareMutationInput): PreparedMutationBatch { return prepareMutationBatch(input); }

  async apply(input: ApplyMutationInput): Promise<MutationOutcome> {
    this.appliedBatch = input.batch;
    const listEvidence = engineEvidence(
      'op-list', '5', 'after-list', ['list-root'], ['list-root', 'list-child'],
    );
    await input.journal.recordVerified(listEvidence);
    this.persistedEvidenceCounts.push(((await this.registry.getRun(this.runId))?.metadata?.engineEvidence as unknown[])?.length ?? 0);
    if (this.failureMode === 'partial' || this.failureMode === 'invalid-partial') {
      throw new PartialMutationError({
        batchFingerprint: this.failureMode === 'invalid-partial' ? 'wrong-batch' : input.batch.fingerprint,
        beforeSnapshotHash: input.batch.beforeSnapshotHash,
        lastObservedRevision: '5',
        lastObservedSnapshotHash: listEvidence.afterSnapshotHash,
        completedOperations: [listEvidence],
        failedOperation: {operationId: 'op-table', kind: 'insert', message: 'fake table failure'},
        pendingOperationIds: [],
        createdBlockIds: listEvidence.createdBlockIds,
        recoveryDisposition: 'reverse_possible',
      });
    }
    if (this.failureMode === 'short-success') {
      return {finalSnapshot: this.finalSnapshot, operations: [listEvidence]};
    }
    const tableEvidence = engineEvidence(
      'op-table', this.finalSnapshot.revision, this.finalSnapshot.canonicalHash,
      ['table-root'], ['table-root', 'table-cell', 'table-paragraph'],
    );
    await input.journal.recordVerified(tableEvidence);
    this.persistedEvidenceCounts.push(((await this.registry.getRun(this.runId))?.metadata?.engineEvidence as unknown[])?.length ?? 0);
    this.snapshots.set('target-url', this.finalSnapshot);
    return {finalSnapshot: this.finalSnapshot, operations: [listEvidence, tableEvidence]};
  }

  async assessRecovery(_input: AssessRecoveryInput): Promise<RecoveryAssessment> { throw new Error('not used'); }
}

class FailOnceReceiptRegistry extends LocalRegistryStore {
  failNextReceipt = false;
  failPendingRun = false;
  failCreatedRun = false;
  override async saveReceipt(receipt: Parameters<LocalRegistryStore['saveReceipt']>[0]): Promise<void> {
    if (this.failNextReceipt) {
      this.failNextReceipt = false;
      throw new Error('registry temporarily unavailable');
    }
    await super.saveReceipt(receipt);
  }
  override async saveRun(run: Parameters<LocalRegistryStore['saveRun']>[0]): Promise<void> {
    if (this.failPendingRun && run.state === 'verifying' && run.metadata?.pendingReceipt) {
      this.failPendingRun = false;
      throw new Error('pending receipt metadata unavailable');
    }
    if (this.failCreatedRun && run.state === 'verifying' && run.metadata?.createdDocumentId) {
      this.failCreatedRun = false;
      throw new Error('created document registry unavailable');
    }
    await super.saveRun(run);
  }
}

class MemoryWhiteboards implements WhiteboardReadGateway {
  readonly values = new Map<string, unknown>();
  async queryRaw(token: string): Promise<unknown> { return this.values.get(token); }
}

describe('schema-v2 Engine apply', () => {
  it('applies the approved stored batch, journals every operation, and receipts created list/table roots', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-engine-apply-'));
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const docs = new NoEngineDirectWrites();
    const sourceSnapshot = engineSnapshot('source-doc', '44', [{
      block_id: 'source-doc', block_type: 1,
      page: {elements: [{text_run: {content: 'English source', text_element_style: {}}}]}, children: [],
    }]);
    const targetSnapshot = engineSnapshot('target-doc', '4', [{
      block_id: 'target-doc', block_type: 1,
      page: {elements: [{text_run: {content: 'Temporary', text_element_style: {}}}]}, children: [],
    }]);
    const finalSnapshot = engineSnapshot('target-doc', '6', [{
      block_id: 'target-doc', block_type: 1,
      page: {elements: [{text_run: {content: 'Temporary', text_element_style: {}}}]},
      children: ['list-root', 'table-root'],
    }, {
      block_id: 'list-root', parent_id: 'target-doc', block_type: 12,
      bullet: {elements: [{text_run: {content: '开始之前', text_element_style: {}}}]},
      children: ['list-child'],
    }, {
      block_id: 'list-child', parent_id: 'list-root', block_type: 13,
      ordered: {elements: [{text_run: {content: '创建令牌', text_element_style: {}}}]},
      children: [],
    }, {
      block_id: 'table-root', parent_id: 'target-doc', block_type: 31,
      children: ['table-cell'],
      table: {property: {row_size: 1, column_size: 1, header_row: true}, cells: ['table-cell']},
    }, {
      block_id: 'table-cell', parent_id: 'table-root', block_type: 32,
      children: ['table-paragraph'], table_cell: {},
    }, {
      block_id: 'table-paragraph', parent_id: 'table-cell', block_type: 2,
      text: {elements: [{text_run: {content: '模型 ID', text_element_style: {}}}]},
      children: [],
    }]);
    const listStructure = {
      kind: 'list' as const,
      ordered: false,
      items: [{
        content: [{kind: 'text' as const, text: 'Before you start'}],
        children: [{
          ordered: true,
          items: [{content: [{kind: 'text' as const, text: 'Create a token'}], children: []}],
        }],
      }],
    };
    const tableStructure = {
      kind: 'table' as const,
      rows: [{cells: [{content: [{kind: 'paragraph' as const, content: [{kind: 'text' as const, text: 'Model ID'}]}]}]}],
    };
    const plan: LocalizationPlan = {
      planVersion: 3,
      runId: 'run-engine-apply',
      pairId: 'pair-engine-apply',
      sourceRevision: 44,
      targetRevision: 4,
      sourceHash: sourceSnapshot.canonicalHash,
      targetHash: targetSnapshot.canonicalHash,
      operations: [{
        operationId: 'op-list', kind: 'insert', confidence: 'high', policy: 'translation',
        sourceNodeId: 'source-list', sourceNodeHash: 'source-list-hash',
        sourceAfter: 'Before you start\nCreate a token', proposedText: '', targetNodeKind: 'list',
        anchorNodeId: '$root:title:0',
        anchorBlockId: targetSnapshot.rootBlockId,
        anchorNodeHash: targetSnapshot.nodes.find((node) => node.blockId === targetSnapshot.rootBlockId)!.canonicalHash,
        structured: {
          kind: 'list', topologyVersion: STRUCTURED_TOPOLOGY_VERSION,
          topologyHash: structuredTopologyHash(listStructure), sourceStructure: listStructure,
          slots: [
            {slotId: 'item-0/text', sourceText: 'Before you start', preserved: [], proposedText: '开始之前'},
            {slotId: 'item-0/child-0/item-0/text', sourceText: 'Create a token', preserved: [], proposedText: '创建令牌'},
          ],
        },
      }, {
        operationId: 'op-table', kind: 'insert', confidence: 'high', policy: 'translation',
        sourceNodeId: 'source-table', sourceNodeHash: 'source-table-hash',
        sourceAfter: 'Model ID', proposedText: '', targetNodeKind: 'table', anchorOperationId: 'op-list',
        structured: {
          kind: 'table', topologyVersion: STRUCTURED_TOPOLOGY_VERSION,
          topologyHash: structuredTopologyHash(tableStructure), sourceStructure: tableStructure,
          slots: [{slotId: 'row-0/cell-0/paragraph-0', sourceText: 'Model ID', preserved: [], proposedText: '模型 ID'}],
        },
      }],
    };
    const requests: TranslationRequest[] = plan.operations.map((operation) => ({
      operationId: operation.operationId,
      changeKind: 'insert',
      sourceAfter: operation.sourceAfter,
      sectionContext: {source: '', target: ''},
      glossary: [], memoryExamples: [], preserved: [], linkMappings: [], warnings: [],
      targetNodeKind: operation.targetNodeKind,
      structured: {
        kind: operation.structured!.kind,
        topologyVersion: operation.structured!.topologyVersion,
        topologyHash: operation.structured!.topologyHash,
        slots: operation.structured!.slots.map((slot) => ({
          slotId: slot.slotId, sourceText: slot.sourceText, preserved: slot.preserved,
        })),
      },
    }));
    const bundleRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {
        'plan.json': `${JSON.stringify(plan, null, 2)}\n`,
        'translation-requests.json': `${JSON.stringify(requests, null, 2)}\n`,
        'source-current.snapshot.json': `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
        'target-current.snapshot.json': `${JSON.stringify(targetSnapshot, null, 2)}\n`,
      },
    });
    await registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN',
      sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    await registry.saveRun({
      runId: plan.runId, pairId: plan.pairId, state: 'review_required',
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef, plan},
    });
    const reviewPath = join(cwd, 'review.md');
    await writeFile(reviewPath, compileReview(plan), 'utf8');
    const engine = new ApplyingEngine(registry, plan.runId, finalSnapshot);
    engine.snapshots.set('source-url', sourceSnapshot);
    engine.snapshots.set('target-url', targetSnapshot);
    const memory = new MemoryTranslationMemory();
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory, engine, docs,
      clock: {now: () => new Date('2026-07-27T00:02:00.000Z')}, ids: {next: () => 'unused'},
    });
    const preview = await workflows.previewApply(plan.runId, 'review.md');
    const previewRun = await registry.getRun(plan.runId);
    const previewBundleRef = previewRun?.metadata?.previewBundleRef as Parameters<LocalSnapshotStore['getBundle']>[0];
    const previewBundle = await snapshots.getBundle(previewBundleRef);
    const storedBatch = JSON.parse(previewBundle.files['prepared-batch.json']!) as PreparedMutationBatch;

    await expect(workflows.apply(plan.runId, 'review.md', preview.approvalToken)).resolves.toMatchObject({state: 'completed'});

    expect(engine.appliedBatch).toEqual(storedBatch);
    expect(engine.persistedEvidenceCounts).toEqual([1, 2]);
    expect(docs.writes).toEqual([]);
    const completedRun = await registry.getRun(plan.runId);
    expect(completedRun).toMatchObject({
      state: 'completed',
      metadata: {
        engineEvidence: [
          expect.objectContaining({operationId: 'op-list', createdBlockIds: ['list-root', 'list-child']}),
          expect.objectContaining({operationId: 'op-table', createdBlockIds: ['table-root', 'table-cell', 'table-paragraph']}),
        ],
        engineEvidenceRef: expect.any(Object),
      },
    });
    const evidenceBundle = await snapshots.getBundle(
      completedRun?.metadata?.engineEvidenceRef as Parameters<LocalSnapshotStore['getBundle']>[0],
    );
    expect(evidenceBundle.files['apply-evidence.json']).toContain('table-paragraph');
    const finalSemantic = semanticDocumentFromSnapshot(finalSnapshot);
    const expectedListNodeId = finalSemantic.nodes.find((node) => node.remote.blockId === 'list-root')!.nodeId;
    const expectedTableNodeId = finalSemantic.nodes.find((node) => node.remote.blockId === 'table-root')!.nodeId;
    expect(await registry.getReceipt(plan.pairId)).toMatchObject({
      targetRevision: 6,
      targetHash: finalSnapshot.canonicalHash,
      correspondences: expect.arrayContaining([
        expect.objectContaining({kind: 'content', sourceNodeId: 'source-list', targetNodeId: expectedListNodeId}),
        expect.objectContaining({kind: 'content', sourceNodeId: 'source-table', targetNodeId: expectedTableNodeId}),
      ]),
    });
    expect(await registry.getPair(plan.pairId)).toMatchObject({status: 'active'});
    expect(memory.entries.map((entry) => ({sourceText: entry.sourceText, targetText: entry.targetText}))).toEqual([
      {sourceText: 'Before you start', targetText: '开始之前'},
      {sourceText: 'Create a token', targetText: '创建令牌'},
      {sourceText: 'Model ID', targetText: '模型 ID'},
    ]);

    const partialPlan: LocalizationPlan = {...plan, runId: 'run-engine-partial'};
    const partialBundleRef = await snapshots.putBundle({
      runId: partialPlan.runId,
      files: {
        'plan.json': `${JSON.stringify(partialPlan, null, 2)}\n`,
        'translation-requests.json': `${JSON.stringify(requests, null, 2)}\n`,
        'source-current.snapshot.json': `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
        'target-current.snapshot.json': `${JSON.stringify(targetSnapshot, null, 2)}\n`,
      },
    });
    await registry.saveRun({
      runId: partialPlan.runId, pairId: partialPlan.pairId, state: 'review_required',
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef: partialBundleRef, plan: partialPlan},
    });
    await writeFile(join(cwd, 'partial-review.md'), compileReview(partialPlan), 'utf8');
    const partialEngine = new ApplyingEngine(registry, partialPlan.runId, finalSnapshot, 'partial');
    partialEngine.snapshots.set('source-url', sourceSnapshot);
    partialEngine.snapshots.set('target-url', targetSnapshot);
    const partialWorkflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), engine: partialEngine, docs,
      clock: {now: () => new Date('2026-07-27T00:03:00.000Z')}, ids: {next: () => 'unused'},
    });
    const partialPreview = await partialWorkflows.previewApply(partialPlan.runId, 'partial-review.md');

    await expect(partialWorkflows.apply(
      partialPlan.runId, 'partial-review.md', partialPreview.approvalToken,
    )).rejects.toMatchObject({type: 'partial_write', subtype: 'engine_partial_mutation'});

    const partialRun = await registry.getRun(partialPlan.runId);
    expect(partialRun).toMatchObject({
      state: 'partial',
      metadata: {
        engineBatchFingerprint: partialPreview.batchFingerprint,
        engineEvidence: [expect.objectContaining({operationId: 'op-list'})],
        enginePartialMutationEvidence: expect.objectContaining({
          failedOperation: expect.objectContaining({operationId: 'op-table'}),
          completedOperations: [expect.objectContaining({operationId: 'op-list'})],
        }),
        enginePartialMutationEvidenceRef: expect.any(Object),
        prewriteRef: expect.any(Object),
      },
    });
    const partialEvidenceBundle = await snapshots.getBundle(
      partialRun?.metadata?.enginePartialMutationEvidenceRef as Parameters<LocalSnapshotStore['getBundle']>[0],
    );
    expect(partialEvidenceBundle.files).toMatchObject({
      'partial-mutation-evidence.json': expect.stringContaining('op-table'),
      'target-prewrite.snapshot.json': expect.stringContaining(targetSnapshot.canonicalHash),
      'prepared-batch.json': expect.stringContaining(partialPreview.batchFingerprint),
    });
    for (const mode of ['invalid-partial', 'short-success'] as const) {
      const mismatchPlan: LocalizationPlan = {...plan, runId: `run-engine-${mode}`};
      const mismatchBundleRef = await snapshots.putBundle({
        runId: mismatchPlan.runId,
        files: {
          'plan.json': `${JSON.stringify(mismatchPlan, null, 2)}\n`,
          'translation-requests.json': `${JSON.stringify(requests, null, 2)}\n`,
          'source-current.snapshot.json': `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
          'target-current.snapshot.json': `${JSON.stringify(targetSnapshot, null, 2)}\n`,
        },
      });
      await registry.saveRun({
        runId: mismatchPlan.runId, pairId: mismatchPlan.pairId, state: 'review_required',
        createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
        metadata: {kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef: mismatchBundleRef, plan: mismatchPlan},
      });
      const mismatchReview = `${mode}-review.md`;
      await writeFile(join(cwd, mismatchReview), compileReview(mismatchPlan), 'utf8');
      const mismatchEngine = new ApplyingEngine(registry, mismatchPlan.runId, finalSnapshot, mode);
      mismatchEngine.snapshots.set('source-url', sourceSnapshot);
      mismatchEngine.snapshots.set('target-url', targetSnapshot);
      const mismatchWorkflows = new LocalizationWorkflows({
        cwd, registry, snapshots, memory: new MemoryTranslationMemory(), engine: mismatchEngine, docs,
        clock: {now: () => new Date('2026-07-27T00:03:30.000Z')}, ids: {next: () => 'unused'},
      });
      const mismatchPreview = await mismatchWorkflows.previewApply(mismatchPlan.runId, mismatchReview);
      await expect(mismatchWorkflows.apply(
        mismatchPlan.runId, mismatchReview, mismatchPreview.approvalToken,
      )).rejects.toMatchObject({
        subtype: mode === 'invalid-partial'
          ? 'engine_partial_evidence_mismatch'
          : 'engine_outcome_evidence_mismatch',
      });
      expect(await registry.getRun(mismatchPlan.runId)).toMatchObject({state: 'partial'});
    }

    const corruptBlocks = finalSnapshot.nodes.map((node) => structuredClone(node.raw) as ProviderBlock);
    const corruptList = corruptBlocks.find((block) => block.block_id === 'list-root')!;
    corruptList.bullet = {elements: [{text_run: {content: '错误内容', text_element_style: {}}}]};
    const corruptFinalSnapshot = createDocumentSnapshot({documentId: 'target-doc', revision: '6', blocks: corruptBlocks});
    const corruptPlan: LocalizationPlan = {...plan, runId: 'run-engine-corrupt'};
    const corruptBundleRef = await snapshots.putBundle({
      runId: corruptPlan.runId,
      files: {
        'plan.json': `${JSON.stringify(corruptPlan, null, 2)}\n`,
        'translation-requests.json': `${JSON.stringify(requests, null, 2)}\n`,
        'source-current.snapshot.json': `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
        'target-current.snapshot.json': `${JSON.stringify(targetSnapshot, null, 2)}\n`,
      },
    });
    await registry.saveRun({
      runId: corruptPlan.runId, pairId: corruptPlan.pairId, state: 'review_required',
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef: corruptBundleRef, plan: corruptPlan},
    });
    await writeFile(join(cwd, 'corrupt-review.md'), compileReview(corruptPlan), 'utf8');
    const corruptEngine = new ApplyingEngine(registry, corruptPlan.runId, corruptFinalSnapshot);
    corruptEngine.snapshots.set('source-url', sourceSnapshot);
    corruptEngine.snapshots.set('target-url', targetSnapshot);
    const corruptWorkflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), engine: corruptEngine, docs,
      clock: {now: () => new Date('2026-07-27T00:04:00.000Z')}, ids: {next: () => 'unused'},
    });
    const corruptPreview = await corruptWorkflows.previewApply(corruptPlan.runId, 'corrupt-review.md');
    await expect(corruptWorkflows.apply(
      corruptPlan.runId, 'corrupt-review.md', corruptPreview.approvalToken,
    )).rejects.toMatchObject({subtype: 'target_readback_mismatch'});
    expect(await registry.getRun(corruptPlan.runId)).toMatchObject({state: 'partial'});

    for (const failure of ['pending-run', 'receipt'] as const) {
      const failureCwd = await mkdtemp(join(tmpdir(), `zdoc-localize-engine-finalize-${failure}-`));
      const failureRegistry = new FailOnceReceiptRegistry(failureCwd);
      const failureSnapshots = new LocalSnapshotStore(failureCwd);
      const failurePlan: LocalizationPlan = {...plan, runId: `run-engine-${failure}`};
      const failureBundleRef = await failureSnapshots.putBundle({
        runId: failurePlan.runId,
        files: {
          'plan.json': `${JSON.stringify(failurePlan, null, 2)}\n`,
          'translation-requests.json': `${JSON.stringify(requests, null, 2)}\n`,
          'source-current.snapshot.json': `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
          'target-current.snapshot.json': `${JSON.stringify(targetSnapshot, null, 2)}\n`,
        },
      });
      await failureRegistry.savePair({
        pairId: failurePlan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
        targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
      });
      await failureRegistry.saveRun({
        runId: failurePlan.runId, pairId: failurePlan.pairId, state: 'review_required',
        createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
        metadata: {kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef: failureBundleRef, plan: failurePlan},
      });
      await writeFile(join(failureCwd, 'review.md'), compileReview(failurePlan), 'utf8');
      const failureEngine = new ApplyingEngine(failureRegistry, failurePlan.runId, finalSnapshot);
      failureEngine.snapshots.set('source-url', sourceSnapshot);
      failureEngine.snapshots.set('target-url', targetSnapshot);
      const failureWorkflows = new LocalizationWorkflows({
        cwd: failureCwd, registry: failureRegistry, snapshots: failureSnapshots,
        memory: new MemoryTranslationMemory(), engine: failureEngine, docs: new NoEngineDirectWrites(),
        clock: {now: () => new Date('2026-07-27T00:06:00.000Z')}, ids: {next: () => 'unused'},
      });
      const failurePreview = await failureWorkflows.previewApply(failurePlan.runId, 'review.md');
      failureRegistry.failPendingRun = failure === 'pending-run';
      failureRegistry.failNextReceipt = failure === 'receipt';
      await expect(failureWorkflows.apply(
        failurePlan.runId, 'review.md', failurePreview.approvalToken,
      )).rejects.toThrow(failure === 'pending-run' ? 'pending receipt' : 'registry');
      expect(await failureRegistry.getPair(failurePlan.pairId)).toMatchObject({status: 'needs_bootstrap'});
      if (failure === 'pending-run') {
        const driftBlocks = finalSnapshot.nodes.map((node) => structuredClone(node.raw) as ProviderBlock);
        const driftRoot = driftBlocks.find((block) => block.block_id === 'target-doc')!;
        driftRoot.children = [...(driftRoot.children ?? []), 'unrelated-drift'];
        driftBlocks.push({
          block_id: 'unrelated-drift', parent_id: 'target-doc', block_type: 2,
          text: {elements: [{text_run: {content: 'Unrelated edit', text_element_style: {}}}]}, children: [],
        });
        failureEngine.snapshots.set('target-url', createDocumentSnapshot({
          documentId: 'target-doc', revision: '7', blocks: driftBlocks,
        }));
        await expect(failureWorkflows.finalizeVerified(failurePlan.runId)).rejects.toMatchObject({
          subtype: 'finalization_target_changed',
        });
        failureEngine.snapshots.set('target-url', finalSnapshot);
      }
      failureEngine.snapshots.set('source-url', engineSnapshot('source-doc', '45', [{
        block_id: 'source-doc', block_type: 1,
        page: {elements: [{text_run: {content: 'Source changed later', text_element_style: {}}}]}, children: [],
      }]));
      await expect(failureWorkflows.finalizeVerified(failurePlan.runId)).resolves.toMatchObject({state: 'completed'});
      expect(await failureRegistry.getPair(failurePlan.pairId)).toMatchObject({status: 'active'});
      expect(await failureRegistry.getReceipt(failurePlan.pairId)).toMatchObject({
        sourceRevision: 44,
        sourceHash: sourceSnapshot.canonicalHash,
        targetHash: finalSnapshot.canonicalHash,
      });
    }

    const memoryFailurePlan: LocalizationPlan = {...plan, runId: 'run-engine-memory-failure'};
    const memoryFailureBundleRef = await snapshots.putBundle({
      runId: memoryFailurePlan.runId,
      files: {
        'plan.json': `${JSON.stringify(memoryFailurePlan, null, 2)}\n`,
        'translation-requests.json': `${JSON.stringify(requests, null, 2)}\n`,
        'source-current.snapshot.json': `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
        'target-current.snapshot.json': `${JSON.stringify(targetSnapshot, null, 2)}\n`,
      },
    });
    await registry.saveRun({
      runId: memoryFailurePlan.runId, pairId: memoryFailurePlan.pairId, state: 'review_required',
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef: memoryFailureBundleRef, plan: memoryFailurePlan},
    });
    await writeFile(join(cwd, 'memory-failure-review.md'), compileReview(memoryFailurePlan), 'utf8');
    const memoryFailureEngine = new ApplyingEngine(registry, memoryFailurePlan.runId, finalSnapshot);
    memoryFailureEngine.snapshots.set('source-url', sourceSnapshot);
    memoryFailureEngine.snapshots.set('target-url', targetSnapshot);
    const failingMemory = new MemoryTranslationMemory();
    failingMemory.failWrites = true;
    const memoryFailureWorkflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: failingMemory, engine: memoryFailureEngine, docs,
      clock: {now: () => new Date('2026-07-27T00:07:00.000Z')}, ids: {next: () => 'unused'},
    });
    const memoryFailurePreview = await memoryFailureWorkflows.previewApply(
      memoryFailurePlan.runId, 'memory-failure-review.md',
    );
    await expect(memoryFailureWorkflows.apply(
      memoryFailurePlan.runId, 'memory-failure-review.md', memoryFailurePreview.approvalToken,
    )).resolves.toMatchObject({state: 'completed'});
    expect(await registry.getRun(memoryFailurePlan.runId)).toMatchObject({
      state: 'completed',
      metadata: {translationMemoryWarning: expect.stringContaining('translation memory')},
    });
  });

  it('verifies an Engine manual synced reference after structured and Whiteboard operations', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-engine-manual-'));
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const docs = new NoEngineDirectWrites();
    const sourceSnapshot = engineSnapshot('source-doc', '44', [{
      block_id: 'source-doc', block_type: 1,
      page: {elements: [{text_run: {content: 'English source', text_element_style: {}}}]},
      children: ['source-sync'],
    }, {
      block_id: 'source-sync', parent_id: 'source-doc', block_type: 49,
      source_synced: {elements: [{text_run: {content: 'Synced code', text_element_style: {}}}]},
      children: [],
    }]);
    const postAutomaticSnapshot = engineSnapshot('target-doc', '7', [{
      block_id: 'target-doc', block_type: 1,
      page: {elements: [{text_run: {content: '中文', text_element_style: {}}}]},
      children: ['list-root', 'board-root', 'manual-placeholder'],
    }, {
      block_id: 'list-root', parent_id: 'target-doc', block_type: 12,
      bullet: {elements: [{text_run: {content: '开始之前', text_element_style: {}}}]}, children: ['list-child'],
    }, {
      block_id: 'list-child', parent_id: 'list-root', block_type: 13,
      ordered: {elements: [{text_run: {content: '嵌套步骤', text_element_style: {}}}]}, children: [],
    }, {
      block_id: 'board-root', parent_id: 'target-doc', block_type: 43,
      board: {token: 'target-board'}, children: [],
    }, {
      block_id: 'manual-placeholder', parent_id: 'target-doc', block_type: 19,
      callout: {emoji_id: 'warning'}, children: ['manual-marker'],
    }, {
      block_id: 'manual-marker', parent_id: 'manual-placeholder', block_type: 2,
      text: {elements: [{text_run: {content: 'ZDOC-MANUAL-SYNC:op-manual', text_element_style: {}}}]},
      children: [],
    }]);
    const currentTargetSnapshot = engineSnapshot('target-doc', '8', [{
      block_id: 'target-doc', block_type: 1,
      page: {elements: [{text_run: {content: '中文', text_element_style: {}}}]},
      children: ['list-root', 'board-root', 'native-reference'],
    }, {
      block_id: 'list-root', parent_id: 'target-doc', block_type: 12,
      bullet: {elements: [{text_run: {content: '开始之前', text_element_style: {}}}]}, children: ['list-child'],
    }, {
      block_id: 'list-child', parent_id: 'list-root', block_type: 13,
      ordered: {elements: [{text_run: {content: '嵌套步骤', text_element_style: {}}}]}, children: [],
    }, {
      block_id: 'board-root', parent_id: 'target-doc', block_type: 43,
      board: {token: 'target-board'}, children: [],
    }, {
      block_id: 'native-reference', parent_id: 'target-doc', block_type: 50,
      reference_synced: {source_document_id: 'source-doc', source_block_id: 'source-sync'}, children: [],
    }]);
    const listStructure = {
      kind: 'list' as const, ordered: false,
      items: [{
        content: [{kind: 'text' as const, text: 'Before you start'}],
        children: [{
          ordered: true,
          items: [{content: [{kind: 'text' as const, text: 'Nested step'}], children: []}],
        }],
      }],
    };
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'run-engine-manual', pairId: 'pair-engine-manual',
      sourceRevision: 44, targetRevision: 4,
      sourceHash: sourceSnapshot.canonicalHash, targetHash: 'prewrite-hash',
      operations: [{
        operationId: 'op-list', kind: 'insert', confidence: 'high', policy: 'translation',
        sourceNodeId: 'source-list', sourceAfter: 'Before you start', proposedText: '', targetNodeKind: 'list',
        structured: {
          kind: 'list', topologyVersion: STRUCTURED_TOPOLOGY_VERSION,
          topologyHash: structuredTopologyHash(listStructure), sourceStructure: listStructure,
          slots: [
            {slotId: 'item-0/text', sourceText: 'Before you start', preserved: [], proposedText: '开始之前'},
            {slotId: 'item-0/child-0/item-0/text', sourceText: 'Nested step', preserved: [], proposedText: '嵌套步骤'},
          ],
        },
      }, {
        operationId: 'op-board', kind: 'insert', confidence: 'high', policy: 'whiteboard_mirror',
        sourceNodeId: 'source-board', proposedText: '', targetNodeKind: 'whiteboard',
        sourceResourceToken: 'source-board', sourceResourceHash: 'legacy-board-hash', sourceResourceRawHash: 'engine-board-hash',
      }, {
        operationId: 'op-manual', kind: 'insert', confidence: 'high', policy: 'manual_synced_reference',
        sourceNodeId: 'source-sync-node', sourceDocumentId: 'source-doc', sourceBlockId: 'source-sync',
        proposedText: '', targetNodeKind: 'synced_reference',
      }],
    };
    const approved = parseReview(compileReview(plan), plan);
    const targetBoardRaw = {nodes: [{id: 'board-node', type: 'text_shape', text: 'Workflow'}]};
    const bundleRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {
        'plan.json': `${JSON.stringify(plan, null, 2)}\n`,
        'source-current.snapshot.json': `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
      },
    });
    const prewriteRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {'approved-review.json': `${JSON.stringify(approved, null, 2)}\n`},
    });
    const postAutomaticRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {
        'target-after-automatic-apply.snapshot.json': `${JSON.stringify(postAutomaticSnapshot, null, 2)}\n`,
      },
    });
    const manualEngineEvidence = [{
      operationId: 'op-list', createdBlockIds: ['list-root'], revision: '5', afterSnapshotHash: 'list-hash', verified: true as const,
      outputs: [{slotId: 'created-roots', kind: 'block-roots' as const, rootBlockIds: ['list-root'], createdBlockIds: ['list-root']}],
    }, {
      operationId: 'op-board', createdBlockIds: ['board-root'], revision: '6', afterSnapshotHash: 'board-hash', verified: true as const,
      outputs: [
        {slotId: 'created-roots', kind: 'block-roots' as const, rootBlockIds: ['board-root'], createdBlockIds: ['board-root']},
        {slotId: 'whiteboard', kind: 'resource' as const, resourceKind: 'whiteboard' as const, ownerBlockId: 'board-root', token: 'target-board', rawHash: canonicalWhiteboardRawHash(targetBoardRaw)},
      ],
    }, {
      operationId: 'op-manual', createdBlockIds: ['manual-placeholder', 'manual-marker'], revision: '7',
      afterSnapshotHash: postAutomaticSnapshot.canonicalHash, verified: true as const,
      outputs: [{slotId: 'created-roots', kind: 'block-roots' as const, rootBlockIds: ['manual-placeholder'], createdBlockIds: ['manual-placeholder', 'manual-marker']}],
    }];
    const engineEvidenceRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {'apply-evidence.json': `${JSON.stringify(manualEngineEvidence, null, 2)}\n`},
    });
    const manualTargetRoot = currentTargetSnapshot.nodes.find((node) => node.blockId === currentTargetSnapshot.rootBlockId)!;
    const manualBatch = prepareMutationBatch({
      snapshot: currentTargetSnapshot,
      operations: ['op-list', 'op-board', 'op-manual'].map((operationId): MutationIntentV2 => ({
        operationId,
        kind: 'assert',
        target: {kind: 'snapshot-block', blockId: manualTargetRoot.blockId},
        expectedHash: manualTargetRoot.canonicalHash,
      })) as [MutationIntentV2, ...MutationIntentV2[]],
      idempotencyNamespace: 'manual-test',
    });
    const previewBundleRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {'prepared-batch.json': `${JSON.stringify(manualBatch, null, 2)}\n`},
    });
    await registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    await registry.saveRun({
      runId: plan.runId, pairId: plan.pairId, state: 'manual_action_required',
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {
        kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef, plan,
        prewriteRef, postAutomaticRef,
        manualActions: [{
          operationId: 'op-manual', marker: 'ZDOC-MANUAL-SYNC:op-manual',
          placeholderBlockId: 'manual-placeholder', sourceNodeId: 'source-sync-node',
          sourceDocumentId: 'source-doc', sourceBlockId: 'source-sync', sourceUrl: 'source-url#source-sync',
          predecessorBlockId: 'board-root',
        }],
        engineEvidence: manualEngineEvidence,
        engineEvidenceRef,
        previewBundleRef,
        engineBatchFingerprint: manualBatch.fingerprint,
      },
    });
    const engine = new ApplyingEngine(registry, plan.runId, currentTargetSnapshot);
    engine.snapshots.set('source-url', sourceSnapshot);
    engine.snapshots.set('target-url', currentTargetSnapshot);
    const memory = new MemoryTranslationMemory();
    const whiteboards = new MemoryWhiteboards();
    whiteboards.values.set('target-board', targetBoardRaw);
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory, engine, docs, whiteboards,
      clock: {now: () => new Date('2026-07-27T00:05:00.000Z')}, ids: {next: () => 'unused'},
    });

    const fabricatedBatch = {
      ...manualBatch,
      engineVersion: '9.9.9',
      fingerprint: '',
    } as PreparedMutationBatch;
    fabricatedBatch.fingerprint = preparedMutationBatchFingerprint(fabricatedBatch);
    const fabricatedPreviewRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {'prepared-batch.json': `${JSON.stringify(fabricatedBatch, null, 2)}\n`},
    });
    const originalManualRun = (await registry.getRun(plan.runId))!;
    await registry.saveRun({
      ...originalManualRun,
      metadata: {
        ...originalManualRun.metadata,
        previewBundleRef: fabricatedPreviewRef,
        engineBatchFingerprint: fabricatedBatch.fingerprint,
      },
    });
    await expect(workflows.verifyManualActions(plan.runId)).rejects.toMatchObject({
      subtype: 'engine_evidence_batch_mismatch',
    });
    await registry.saveRun(originalManualRun);
    const malformedEvidenceRef = await snapshots.putBundle({
      runId: plan.runId, files: {'apply-evidence.json': '{'},
    });
    const manualRun = (await registry.getRun(plan.runId))!;
    await registry.saveRun({
      ...manualRun,
      metadata: {...manualRun.metadata, engineEvidenceRef: malformedEvidenceRef},
    });
    await expect(workflows.verifyManualActions(plan.runId)).rejects.toMatchObject({
      subtype: 'engine_evidence_bundle_invalid',
    });
    await registry.saveRun(manualRun);
    const nestedDriftBlocks = currentTargetSnapshot.nodes.map((node) => structuredClone(node.raw) as ProviderBlock);
    const nestedDrift = nestedDriftBlocks.find((block) => block.block_id === 'list-child')!;
    nestedDrift.ordered = {elements: [{text_run: {content: '未批准的嵌套编辑', text_element_style: {}}}]};
    engine.snapshots.set('target-url', createDocumentSnapshot({
      documentId: 'target-doc', revision: '8', blocks: nestedDriftBlocks,
    }));
    await expect(workflows.verifyManualActions(plan.runId)).rejects.toMatchObject({
      subtype: 'manual_target_changed',
    });
    engine.snapshots.set('target-url', currentTargetSnapshot);
    whiteboards.values.set('target-board', {nodes: []});
    await expect(workflows.verifyManualActions(plan.runId)).rejects.toMatchObject({
      subtype: 'whiteboard_raw_invalid',
    });
    whiteboards.values.set('target-board', {nodes: [{id: 'changed', type: 'text_shape', text: 'Changed'}]});
    await expect(workflows.verifyManualActions(plan.runId)).rejects.toMatchObject({
      subtype: 'manual_whiteboard_changed',
    });
    whiteboards.values.set('target-board', targetBoardRaw);
    await expect(workflows.verifyManualActions(plan.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await registry.getPair(plan.pairId)).toMatchObject({status: 'active'});
    expect(await registry.getReceipt(plan.pairId)).toMatchObject({
      targetRevision: 8,
      correspondences: expect.arrayContaining([
        expect.objectContaining({kind: 'content', sourceNodeId: 'source-list'}),
        expect.objectContaining({kind: 'copied_resource', sourceNodeId: 'source-board', sourceResourceHash: 'legacy-board-hash'}),
        expect.objectContaining({kind: 'native_sync', sourceNodeId: 'source-sync-node', sourceBlockId: 'source-sync'}),
      ]),
    });
    expect(memory.entries).toEqual([
      expect.objectContaining({sourceText: 'Before you start', targetText: '开始之前'}),
      expect.objectContaining({sourceText: 'Nested step', targetText: '嵌套步骤'}),
    ]);
  });
});

describe('create-only document workflow', () => {
  function creationRuntime(input: {
    cwd: string;
    registry: LocalRegistryStore;
    documents: Map<string, FetchedDocument>;
    runId: string;
  }) {
    const reader = new MemoryDocumentReader(input.documents);
    const creation = new MemoryDocumentCreation(input.documents);
    const workflows = new LocalizationWorkflows({
      cwd: input.cwd,
      registry: input.registry,
      snapshots: new LocalSnapshotStore(input.cwd),
      memory: new MemoryTranslationMemory(),
      docs: reader,
      documentCreation: creation,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')},
      ids: {next: () => input.runId},
    });
    return {workflows, creation};
  }

  async function reviewedCreation(input: {
    cwd: string;
    registry: LocalRegistryStore;
    documents: Map<string, FetchedDocument>;
    sourceUrl: string;
    runId: string;
  }) {
    await input.registry.savePair({
      pairId: 'new-pair', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: input.sourceUrl,
      targetParentToken: 'wiki-parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const runtime = creationRuntime(input);
    const created = await runtime.workflows.createPlan('new-pair');
    const completed = await runtime.workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId,
      translatedText: request.targetNodeKind === 'title' ? '配置' : request.targetNodeKind === 'heading' ? '开始' : '运行 `curl`。',
      targetNodeKind: request.targetNodeKind,
    })));
    const preview = await runtime.workflows.previewApply(created.runId, completed.reviewPath);
    return {...runtime, created, completed, preview};
  }

  it('creates a missing Chinese document through the dedicated creation gateway', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-'));
    const sourceUrl = 'https://example.feishu.cn/docx/source';
    const documents = new Map<string, FetchedDocument>([[sourceUrl, {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><h1 id="h1">Start</h1><p id="p1">Run `curl`.</p><pre id="code"><code>curl</code></pre>',
    }]]);
    const registry = new LocalRegistryStore(cwd);
    const context = await reviewedCreation({cwd, registry, documents, sourceUrl, runId: 'run-create'});

    expect(context.preview.creationDraftXml).toContain('<pre><code>curl</code></pre>');
    await expect(context.workflows.apply(
      context.created.runId, context.completed.reviewPath, context.preview.approvalToken,
    )).resolves.toMatchObject({state: 'completed'});

    expect(context.creation.creates).toHaveLength(1);
    expect(context.creation.creates[0]?.xml).toContain('<pre><code>curl</code></pre>');
    expect(await registry.getPair('new-pair')).toMatchObject({
      targetDocUrl: 'https://example.feishu.cn/docx/created-target', targetDocToken: 'created-target', status: 'active',
    });
    expect(await registry.getReceipt('new-pair')).toMatchObject({sourceRevision: 1, targetRevision: 1});
  });

  it('records create-only readback mismatches as partial verification failures', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-mismatch-'));
    const sourceUrl = 'source-url';
    const documents = new Map<string, FetchedDocument>([[sourceUrl, {
      documentId: 'source', revisionId: 1, content: '<title id="title">Setup</title><p id="p1">Run <code>curl</code>.</p>',
    }]]);
    const registry = new LocalRegistryStore(cwd);
    const context = await reviewedCreation({cwd, registry, documents, sourceUrl, runId: 'run-create-mismatch'});
    context.creation.corruptCreates = true;

    await expect(context.workflows.apply(
      context.created.runId, context.completed.reviewPath, context.preview.approvalToken,
    )).rejects.toMatchObject({type: 'verification_failed', subtype: 'created_document_mismatch'});
    expect(await registry.getRun(context.created.runId)).toMatchObject({
      state: 'partial', errorType: 'created_document_mismatch',
    });
  });

  it('recovers a created document ID from the local journal when registry persistence fails', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-journal-'));
    const sourceUrl = 'https://example.feishu.cn/docx/source';
    const documents = new Map<string, FetchedDocument>([[sourceUrl, {
      documentId: 'source', revisionId: 1, content: '<title id="title">Setup</title><p id="p1">Run `curl`.</p>',
    }]]);
    const registry = new FailOnceReceiptRegistry(cwd);
    registry.failCreatedRun = true;
    const context = await reviewedCreation({cwd, registry, documents, sourceUrl, runId: 'run-create'});

    await expect(context.workflows.apply(
      context.created.runId, context.completed.reviewPath, context.preview.approvalToken,
    )).rejects.toThrow('created document registry unavailable');
    expect((await registry.getRun(context.created.runId))?.state).toBe('applying');

    await expect(context.workflows.finalizeVerified(context.created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await registry.getPair('new-pair')).toMatchObject({targetDocToken: 'created-target'});
  });
});
