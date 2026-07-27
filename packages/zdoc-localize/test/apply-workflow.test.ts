import {mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

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
  DocumentGateway,
  LocalizationDocxEngine,
  TranslationMemory,
  TranslationMemoryEntry,
  TranslationMemoryQuery,
  WhiteboardGateway,
} from '../src/application/ports.js';
import {LocalizationWorkflows} from '../src/application/workflows.js';
import type {FetchedDocument, WriteInput, WriteResult} from '../src/adapters/lark-docs-adapter.js';
import {LocalizeError} from '../src/domain/errors.js';
import {semanticDocumentFromSnapshot} from '../src/domain/docx-semantic.js';
import {compileReview, parseReview, type LocalizationPlan} from '../src/domain/review.js';
import {structuredTopologyHash} from '../src/domain/structured-content.js';
import type {TranslationRequest} from '../src/domain/translation.js';
import {canonicalWhiteboard} from '../src/domain/whiteboard.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

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

class NoEngineDirectWrites implements DocumentGateway {
  readonly writes: string[] = [];
  async fetch(): Promise<never> { throw new Error('Engine apply must not fetch through the legacy document gateway.'); }
  async replaceBlock(): Promise<never> { this.writes.push('replace'); throw new Error('unexpected direct replace'); }
  async insertAfter(): Promise<never> { this.writes.push('insert'); throw new Error('unexpected direct insert'); }
  async deleteBlocks(): Promise<never> { this.writes.push('delete'); throw new Error('unexpected direct delete'); }
  async createDocument(): Promise<never> { throw new Error('unexpected create'); }
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

class WritableDocs {
  readonly documents = new Map<string, FetchedDocument>();
  readonly writes: string[] = [];
  failAtWrite?: number;
  failureSubtype = 'fake_partial';
  corruptWrites = false;
  corruptCreates = false;
  misrouteFirstReplace = false;
  readonly creates: Array<{title: string; parentToken?: string; xml: string}> = [];
  private whiteboardSequence = 0;

  async fetch(doc: string): Promise<FetchedDocument> {
    const result = this.documents.get(doc);
    if (!result) throw new Error(`Missing fake document ${doc}`);
    return {...result};
  }

  async replaceBlock(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    const blockId = this.misrouteFirstReplace && this.writes.length === 0 ? 'zh-overview-h1' : input.blockId;
    return this.write(input.doc, `replace:${input.blockId}`, (content) =>
      replaceBlock(content, blockId, this.corruptWrites ? '<p>错误内容</p>' : input.xml),
    );
  }

  async insertAfter(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    if (input.xml === '<whiteboard type="blank"></whiteboard>') {
      const blockId = `new-${input.blockId}`;
      const blockToken = `target-board-${++this.whiteboardSequence}`;
      const result = await this.write(input.doc, `insert:${input.blockId}`, (content) =>
        insertAfter(content, input.blockId, `<whiteboard token="${blockToken}"></whiteboard>`),
      );
      return {
        ...result,
        newBlocks: [{blockId, blockType: 'whiteboard', blockToken}],
      };
    }
    return this.write(input.doc, `insert:${input.blockId}`, (content) =>
      insertAfter(content, input.blockId, this.corruptWrites ? '<p>错误内容</p>' : input.xml),
    );
  }

  async deleteBlocks(input: WriteInput & {blockIds: string[]}): Promise<WriteResult> {
    return this.write(input.doc, `delete:${input.blockIds.join(',')}`, (content) =>
      input.blockIds.reduce((value, blockId) => removeBlock(value, blockId), content),
    );
  }

  async createDocument(input: {title: string; parentToken?: string; xml: string}): Promise<{documentId: string; revisionId: number}> {
    this.creates.push(input);
    const body = this.corruptCreates ? '<p>corrupt creation</p>' : input.xml;
    this.documents.set('created-target', {documentId: 'created-target', revisionId: 1, content: `<title>${input.title}</title>${body}`});
    return {documentId: 'created-target', revisionId: 1};
  }

  protected async write(doc: string, label: string, mutate: (content: string) => string): Promise<WriteResult> {
    this.writes.push(label);
    if (this.failAtWrite === this.writes.length) {
      throw new LocalizeError({type: 'partial_write', subtype: this.failureSubtype, message: 'Fake partial write.'});
    }
    const current = this.documents.get(doc)!;
    const revisionId = current.revisionId + 1;
    this.documents.set(doc, {...current, revisionId, content: mutate(current.content)});
    return {revisionId, updatedBlocksCount: 1, warnings: [], newBlocks: []};
  }
}

class MemoryWhiteboards implements WhiteboardGateway {
  readonly values = new Map<string, unknown>();
  readonly updates: Array<{token: string; raw: unknown; idempotencyToken: string}> = [];
  async queryRaw(token: string): Promise<unknown> { return this.values.get(token); }
  async overwriteRaw(input: {token: string; raw: unknown; idempotencyToken: string}): Promise<void> {
    this.updates.push(input);
    this.values.set(input.token, structuredClone(input.raw));
  }
}

class LiveListDocs extends WritableDocs {
  override async insertAfter(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    let item = 0;
    const liveXml = input.xml.replace(/<li>/g, () => `<li id="live-list-${++item}">`);
    return this.write(input.doc, `insert:${input.blockId}`, (content) =>
      content.replace(blockPattern(input.blockId), (match) => `${match}\n${liveXml}`),
    );
  }

  override async deleteBlocks(input: WriteInput & {blockIds: string[]}): Promise<WriteResult> {
    return this.write(input.doc, `delete:${input.blockIds.join(',')}`, (content) =>
      input.blockIds
        .reduce((value, blockId) => removeBlock(value, blockId), content)
        .replace(/<(ol|ul)>\s*<\/\1>/g, ''),
    );
  }
}

function blockPattern(blockId: string): RegExp {
  return new RegExp(`<([a-zA-Z0-9_]+)([^>]*\\sid="${blockId}"[^>]*)>[\\s\\S]*?<\\/\\1>`);
}

function withId(xml: string, blockId: string): string {
  return xml.replace(/^<([a-zA-Z0-9_]+)/, `<$1 id="${blockId}"`);
}

function replaceBlock(content: string, blockId: string, xml: string): string {
  return content.replace(blockPattern(blockId), withId(xml, blockId));
}

function insertAfter(content: string, blockId: string, xml: string): string {
  return content.replace(blockPattern(blockId), (match) => `${match}\n${withId(xml, `new-${blockId}`)}`);
}

function removeBlock(content: string, blockId: string): string {
  return content.replace(blockPattern(blockId), '');
}

async function preparedWorkflow(options: {failAtWrite?: number; corruptWrites?: boolean; misrouteFirstReplace?: boolean; failMemory?: boolean; failReceipt?: boolean; failPendingRun?: boolean; secondInsertion?: boolean} = {}) {
  const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-apply-'));
  const [baselineXml, currentXmlRaw, targetXml] = await Promise.all([
    readFile(fixture('source-baseline.xml'), 'utf8'),
    readFile(fixture('source-current.xml'), 'utf8'),
    readFile(fixture('target-current.xml'), 'utf8'),
  ]);
  const withOptionalInsertion = options.secondInsertion
    ? currentXmlRaw.replace(
      '<p id="p-alerts-new">Review alert delivery after saving the integration.</p>',
      '<p id="p-alerts-new">Review alert delivery after saving the integration.</p><p id="p-alerts-followup">Confirm alerts in the dashboard.</p>',
    )
    : currentXmlRaw;
  const currentXml = `${withOptionalInsertion}<img id="image-current" token="img-token" name="metrics.png"/>\n`;
  const docs = new WritableDocs();
  docs.failAtWrite = options.failAtWrite;
  docs.corruptWrites = options.corruptWrites ?? false;
  docs.misrouteFirstReplace = options.misrouteFirstReplace ?? false;
  docs.documents.set('source-url', {documentId: 'source', revisionId: 1, content: baselineXml});
  docs.documents.set('target-url', {documentId: 'target', revisionId: 10, content: targetXml});
  const registry = options.failReceipt || options.failPendingRun ? new FailOnceReceiptRegistry(cwd) : new LocalRegistryStore(cwd);
  const snapshots = new LocalSnapshotStore(cwd);
  const memory = new MemoryTranslationMemory();
  memory.failWrites = options.failMemory ?? false;
  await registry.savePair({
    pairId: 'pair-1', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
    targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
  });
  await registry.savePair({
    pairId: 'pair-console', sourceLocale: 'en', targetLocale: 'zh-CN',
    sourceDocUrl: 'https://example.com/console', targetDocUrl: 'https://cn.example.com/console',
    mode: 'mirror', status: 'active',
  });
  let id = 0;
  const workflows = new LocalizationWorkflows({
    cwd, registry, snapshots, memory, docs,
    clock: {now: () => new Date('2026-07-15T00:00:00.000Z')},
    ids: {next: () => `run-${++id}`},
  });
  const bootstrap = await workflows.planBootstrap('pair-1');
  await workflows.acceptBootstrap(bootstrap.runId);
  if (registry instanceof FailOnceReceiptRegistry) {
    registry.failNextReceipt = options.failReceipt ?? false;
    registry.failPendingRun = options.failPendingRun ?? false;
  }
  docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: currentXml});
  const created = await workflows.createPlan('pair-1');
  const responses = created.translationRequests.map((request) => {
    if (request.changeKind === 'delete') {
      return {operationId: request.operationId, decision: 'delete' as const};
    }
    if (request.sourceAfter?.includes('metrics and alerts')) {
      return {operationId: request.operationId, translatedText: '使用 **Zilliz Cloud** 和 `Prometheus` 监控指标和告警。', targetNodeKind: request.targetNodeKind};
    }
    if (request.sourceAfter?.includes('Copy the endpoint')) {
      return {operationId: request.operationId, translatedText: '1. 打开[控制台](https://cn.example.com/console)。\n2. 创建集成。\n3. 复制端点。', targetNodeKind: request.targetNodeKind};
    }
    if (request.sourceAfter?.includes('Confirm alerts')) {
      return {operationId: request.operationId, translatedText: '然后在控制面板中确认告警。', targetNodeKind: request.targetNodeKind};
    }
    return {operationId: request.operationId, translatedText: '保存集成后，检查告警发送情况。', targetNodeKind: request.targetNodeKind};
  });
  const completed = await workflows.completePlan(created.runId, responses);
  return {cwd, docs, registry, snapshots, memory, workflows, created, completed};
}

async function preparedLiveListWorkflow(failAtWrite?: number) {
  const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-live-list-recovery-'));
  const docs = new LiveListDocs();
  docs.failAtWrite = failAtWrite;
  docs.documents.set('source-url', {
    documentId: 'source', revisionId: 1,
    content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2">Review the proposed Chinese changes.</li></ol><ul><li id="en-bullet-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-bullet-2">Apply only approved block-level writes.</li></ul>',
  });
  docs.documents.set('target-url', {
    documentId: 'target', revisionId: 3,
    content: '<h1 id="zh-workflow">工作流程</h1><ol><li id="zh-step-1" seq="1">扫描远端英文文档。</li><li id="zh-step-2">审核建议的中文变更。</li></ol><ul><li id="zh-bullet-1">保留 URL 和内联 <code>commands</code>。</li><li id="zh-bullet-2">仅应用已批准的块级写入。</li></ul>',
  });
  const registry = new LocalRegistryStore(cwd);
  await registry.savePair({
    pairId: 'pair-list', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
    targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
  });
  let id = 0;
  const workflows = new LocalizationWorkflows({
    cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
    clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => `run-list-${++id}`},
  });
  const bootstrap = await workflows.planBootstrap('pair-list');
  await workflows.acceptBootstrap(bootstrap.runId);
  docs.documents.set('source-url', {
    documentId: 'source', revisionId: 2,
    content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2-new">Review the proposed Chinese changes.<ul><li id="en-child-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-child-2">Apply only approved block-level writes.</li></ul></li></ol>',
  });
  const created = await workflows.createPlan('pair-list');
  const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => request.changeKind === 'delete'
    ? {operationId: request.operationId, decision: 'delete'}
    : {
        operationId: request.operationId,
        translatedText: '1. 扫描远端英文文档。\n2. 审核建议的中文变更。\n   - 保留 URL 和内联 `commands`。\n   - 仅应用已批准的块级写入。',
        targetNodeKind: request.targetNodeKind,
      }));
  return {cwd, docs, registry, workflows, created, completed};
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
      table: {property: {row_size: 1, column_size: 1}, cells: ['table-cell']},
    }, {
      block_id: 'table-cell', parent_id: 'table-root', block_type: 32,
      children: ['table-paragraph'],
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
          kind: 'list', topologyHash: structuredTopologyHash(listStructure), sourceStructure: listStructure,
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
          kind: 'table', topologyHash: structuredTopologyHash(tableStructure), sourceStructure: tableStructure,
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
          kind: 'list', topologyHash: structuredTopologyHash(listStructure), sourceStructure: listStructure,
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

describe('plan completion and apply', () => {
  it('verifies incremental native sync changes without document writes', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-native-sync-apply-'));
    const docs = new WritableDocs();
    const baselineXml = '<title id="title">Guide</title>'
      + '<synced-source id="sync-source"><pre id="code"><code>print(1)</code></pre></synced-source>';
    const currentXml = '<title id="title">Guide</title>'
      + '<synced-source id="sync-source"><pre id="code"><code>print(2)</code></pre></synced-source>';
    const targetXml = '<title id="zh-title">指南</title>'
      + '<synced_reference id="sync-reference" src-token="source" src-block-id="sync-source"></synced_reference>';
    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: currentXml});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: targetXml});
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const baseline = parseFeishuDocument(baselineXml, {documentId: 'source', revisionId: 1});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 5});
    const sourceSync = baseline.nodes.find((node) => node.kind === 'synced_source')!;
    const targetSync = target.nodes.find((node) => node.kind === 'synced_reference')!;
    const sourceSnapshotRef = await snapshots.putBundle({runId: 'baseline', files: {'source.xml': baselineXml}});
    await registry.savePair({
      pairId: 'pair-native', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    await registry.saveReceipt({
      pairId: 'pair-native', sourceRevision: 1, sourceHash: baseline.canonicalHash, sourceSnapshotRef,
      targetRevision: 5, targetHash: target.canonicalHash, runId: 'baseline', completedAt: '2026-07-15T00:00:00.000Z',
      correspondences: [{
        kind: 'native_sync', sourceNodeId: sourceSync.nodeId, targetNodeId: targetSync.nodeId,
        sourceDocumentId: 'source', sourceBlockId: 'sync-source',
      }],
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'run-native'},
    });
    const created = await workflows.createPlan('pair-native');
    const completed = await workflows.completePlan(created.runId, []);
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken))
      .resolves.toMatchObject({state: 'completed'});
    expect(docs.writes).toEqual([]);
    expect(await registry.getReceipt('pair-native')).toMatchObject({
      sourceRevision: 2,
      correspondences: [expect.objectContaining({kind: 'native_sync', targetNodeId: targetSync.nodeId})],
    });
  });

  it('mirrors an incrementally changed Whiteboard without replacing its document block', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-whiteboard-apply-'));
    const docs = new WritableDocs();
    const whiteboards = new MemoryWhiteboards();
    const sourceXml = '<title id="title">Guide</title><whiteboard id="board" token="source-board"></whiteboard>';
    const targetXml = '<title id="zh-title">指南</title><whiteboard id="zh-board" token="target-board"></whiteboard>';
    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: sourceXml});
    docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: targetXml});
    const oldBoard = {nodes: [{id: 'old', type: 'text', text: 'Old', x: 1}]};
    const newBoard = {nodes: [{id: 'new', type: 'text', text: 'New', x: 1}]};
    whiteboards.values.set('source-board', newBoard);
    whiteboards.values.set('target-board', oldBoard);
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const source = parseFeishuDocument(sourceXml, {documentId: 'source', revisionId: 1});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 5});
    const sourceBoard = source.nodes.find((node) => node.kind === 'whiteboard')!;
    const targetBoard = target.nodes.find((node) => node.kind === 'whiteboard')!;
    const sourceSnapshotRef = await snapshots.putBundle({runId: 'baseline', files: {'source.xml': sourceXml}});
    await registry.savePair({
      pairId: 'pair-board', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    await registry.saveReceipt({
      pairId: 'pair-board', sourceRevision: 1, sourceHash: source.canonicalHash, sourceSnapshotRef,
      targetRevision: 5, targetHash: target.canonicalHash, runId: 'baseline', completedAt: '2026-07-15T00:00:00.000Z',
      correspondences: [{
        kind: 'copied_resource', sourceNodeId: sourceBoard.nodeId, targetNodeId: targetBoard.nodeId,
        resourceKind: 'whiteboard', sourceResourceHash: canonicalWhiteboard(oldBoard).hash,
      }],
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), docs, whiteboards,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'run-board'},
    });
    const created = await workflows.createPlan('pair-board');
    const completed = await workflows.completePlan(created.runId, []);
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken))
      .resolves.toMatchObject({state: 'completed'});
    expect(docs.writes).toEqual([]);
    expect(whiteboards.updates).toEqual([expect.objectContaining({token: 'target-board'})]);
    expect(canonicalWhiteboard(whiteboards.values.get('target-board')).hash).toBe(canonicalWhiteboard(newBoard).hash);
    expect(await registry.getReceipt('pair-board')).toMatchObject({
      correspondences: [expect.objectContaining({
        kind: 'copied_resource', sourceResourceHash: canonicalWhiteboard(newBoard).hash,
      })],
    });
  });

  it('initializes automatic content and pauses for a manual synced reference', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-initialize-apply-'));
    const docs = new WritableDocs();
    const whiteboards = new MemoryWhiteboards();
    whiteboards.values.set('board-source', {nodes: [{id: 'source-node', type: 'text', text: 'Workflow'}]});
    whiteboards.values.set('target-board-1', {nodes: []});
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 31,
      content: '<title id="source">Hugging Face</title>'
        + '<p id="intro">English body.</p>'
        + '<pre id="code" lang="python"><code>print("hello")</code></pre>'
        + '<whiteboard id="board" token="board-source"></whiteboard>'
        + '<synced-source id="sync-source"><pre id="sync-code"><code>print("synced")</code></pre></synced-source>',
    });
    docs.documents.set('target-url', {
      documentId: 'target', revisionId: 4,
      content: '<title id="target">Hugging Face</title>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-initialize', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs, whiteboards,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'run-initialize'},
    });
    const created = await workflows.createPlan('pair-initialize');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId,
      translatedText: request.targetNodeKind === 'title' ? 'Hugging Face' : '中文正文。',
      targetNodeKind: request.targetNodeKind,
    })));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    const result = await workflows.apply(created.runId, completed.reviewPath, preview.approvalToken);

    expect(result).toMatchObject({
      runId: created.runId,
      state: 'manual_action_required',
      manualActionsPath: expect.stringContaining('manual-actions.json'),
    });
    expect(await registry.getReceipt('pair-initialize')).toBeUndefined();
    expect(await registry.getPair('pair-initialize')).toMatchObject({status: 'needs_bootstrap'});
    expect(await registry.getRun(created.runId)).toMatchObject({state: 'manual_action_required'});
    expect(docs.documents.get('target-url')?.content).toContain('中文正文。');
    expect(docs.documents.get('target-url')?.content).toContain('print(&quot;hello&quot;)');
    expect(docs.documents.get('target-url')?.content).toContain('token="target-board-1"');
    expect(docs.documents.get('target-url')?.content).toContain('ZDOC-MANUAL-SYNC:');
    expect(whiteboards.updates).toEqual([expect.objectContaining({
      token: 'target-board-1', idempotencyToken: expect.stringContaining(created.runId),
    })]);

    const manualRun = await registry.getRun(created.runId);
    const action = (manualRun?.metadata?.manualActions as Array<{placeholderBlockId: string; sourceDocumentId: string; sourceBlockId: string}>)[0]!;
    const target = docs.documents.get('target-url')!;
    docs.documents.set('target-url', {
      ...target,
      revisionId: target.revisionId + 1,
      content: target.content.replace(
        blockPattern(action.placeholderBlockId),
        `<synced_reference id="manual-reference" src-token="${action.sourceDocumentId}" src-block-id="${action.sourceBlockId}"></synced_reference>`,
      ),
    });

    await expect(workflows.inspectRecovery(created.runId)).resolves.toMatchObject({
      state: 'manual_action_required', safeToRecover: true, manualActionsVerified: true,
    });
    const manualTarget = docs.documents.get('target-url')!;
    docs.documents.set('target-url', {
      ...manualTarget,
      revisionId: manualTarget.revisionId + 1,
      content: `${manualTarget.content}<p id="unexpected">unexpected edit</p>`,
    });
    await expect(workflows.inspectRecovery(created.runId)).resolves.toMatchObject({
      state: 'manual_action_required', safeToRecover: false, manualActionsVerified: false,
    });
    docs.documents.set('target-url', manualTarget);
    await expect(workflows.previewReverse(created.runId)).resolves.toMatchObject({
      state: 'confirmation_required', approvalToken: expect.any(String),
      operations: expect.arrayContaining([expect.objectContaining({kind: 'delete', blockId: 'manual-reference'})]),
    });

    await expect(workflows.verifyManualActions(created.runId)).resolves.toMatchObject({state: 'completed'});
    await expect(workflows.verifyManualActions(created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await registry.getReceipt('pair-initialize')).toMatchObject({sourceRevision: 31});
    expect(await registry.getPair('pair-initialize')).toMatchObject({status: 'active'});
  });

  it('applies a live Feishu flat-to-nested list change with atomic list-item groups', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-live-list-'));
    const docs = new LiveListDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2">Review the proposed Chinese changes.</li></ol><ul><li id="en-bullet-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-bullet-2">Apply only approved block-level writes.</li></ul>',
    });
    docs.documents.set('target-url', {
      documentId: 'target', revisionId: 3,
      content: '<h1 id="zh-workflow">工作流程</h1><ol><li id="zh-step-1" seq="1">扫描远端英文文档。</li><li id="zh-step-2">审核建议的中文变更。</li></ol><ul><li id="zh-bullet-1">保留 URL 和内联 <code>commands</code>。</li><li id="zh-bullet-2">仅应用已批准的块级写入。</li></ul>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'pair-list', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'needs_bootstrap',
    });
    let id = 0;
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => `run-list-${++id}`},
    });
    const bootstrap = await workflows.planBootstrap('pair-list');
    await workflows.acceptBootstrap(bootstrap.runId);
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 2,
      content: '<h1 id="en-workflow">Workflow</h1><ol><li id="en-step-1" seq="1">Scan the remote English document.</li><li id="en-step-2-new">Review the proposed Chinese changes.<ul><li id="en-child-1">Preserve URLs and inline <code>commands</code>.</li><li id="en-child-2">Apply only approved block-level writes.</li></ul></li></ol>',
    });
    const created = await workflows.createPlan('pair-list');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => request.changeKind === 'delete'
      ? {operationId: request.operationId, decision: 'delete'}
      : {
          operationId: request.operationId,
          translatedText: '1. 扫描远端英文文档。\n2. 审核建议的中文变更。\n   - 保留 URL 和内联 `commands`。\n   - 仅应用已批准的块级写入。',
          targetNodeKind: request.targetNodeKind,
        }));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken)).resolves.toMatchObject({state: 'completed'});
    expect(docs.writes).toEqual([
      'delete:zh-step-1,zh-step-2',
      'insert:zh-workflow',
      'delete:zh-bullet-1,zh-bullet-2',
    ]);
    expect(docs.documents.get('target-url')?.content).toContain('<ol><li id="live-list-1">扫描远端英文文档。</li><li id="live-list-2">审核建议的中文变更。<ul><li id="live-list-3">保留 URL 和内联 <code>commands</code>。</li><li id="live-list-4">仅应用已批准的块级写入。</li></ul></li></ol>');
  });

  it('previews reversal of every top-level block created by a partial nested-list apply', async () => {
    const context = await preparedLiveListWorkflow(3);
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'partial_write',
    });

    const reverse = await context.workflows.previewReverse(context.created.runId);

    expect(reverse.operations).toEqual(expect.arrayContaining([
      expect.objectContaining({kind: 'delete', blockIds: ['live-list-1', 'live-list-2']}),
    ]));
  });

  it('creates a missing Chinese document only after full review and preview approval', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-'));
    const docs = new WritableDocs();
    docs.documents.set('https://example.feishu.cn/docx/source', {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><h1 id="h1">Start</h1><p id="p1">Run `curl`.</p><pre id="code"><code>curl</code></pre>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'new-pair', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'https://example.feishu.cn/docx/source',
      targetParentToken: 'wiki-parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create'},
    });

    const created = await workflows.createPlan('new-pair');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId,
      translatedText: request.targetNodeKind === 'title' ? '配置' : request.targetNodeKind === 'heading' ? '开始' : '运行 `curl`。',
      targetNodeKind: request.targetNodeKind,
    })));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);
    expect(preview.creationDraftXml).toContain('<pre><code>curl</code></pre>');
    const result = await workflows.apply(created.runId, completed.reviewPath, preview.approvalToken);

    expect(result.state).toBe('completed');
    expect(docs.creates).toHaveLength(1);
    expect(docs.creates[0]?.xml).toContain('<pre><code>curl</code></pre>');
    expect(await registry.getPair('new-pair')).toMatchObject({
      targetDocUrl: 'https://example.feishu.cn/docx/created-target', targetDocToken: 'created-target', status: 'active',
    });
    expect(await registry.getReceipt('new-pair')).toMatchObject({sourceRevision: 1, targetRevision: 1});
  });

  it('records creation verification failures in typed run fields', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-mismatch-'));
    const docs = new WritableDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 1,
      content: '<title id="title">Setup</title><p id="p1">Run <code>curl</code>.</p>',
    });
    const registry = new LocalRegistryStore(cwd);
    await registry.savePair({
      pairId: 'new-pair', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetParentToken: 'wiki-parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create-mismatch'},
    });
    const created = await workflows.createPlan('new-pair');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId,
      translatedText: request.targetNodeKind === 'title' ? '配置' : '运行 `curl`。',
      targetNodeKind: request.targetNodeKind,
    })));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);
    docs.corruptCreates = true;

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'verification_failed', subtype: 'created_document_mismatch',
    });
    expect(await registry.getRun(created.runId)).toMatchObject({
      state: 'partial', errorType: 'created_document_mismatch',
    });
  });

  it('recovers a created document ID from the local journal when registry persistence fails', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-create-journal-'));
    const docs = new WritableDocs();
    docs.documents.set('https://example.feishu.cn/docx/source', {
      documentId: 'source', revisionId: 1, content: '<title id="title">Setup</title><p id="p1">Run `curl`.</p>',
    });
    const registry = new FailOnceReceiptRegistry(cwd);
    registry.failCreatedRun = true;
    await registry.savePair({
      pairId: 'new-pair', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'https://example.feishu.cn/docx/source',
      targetParentToken: 'wiki-parent', mode: 'mirror', status: 'needs_bootstrap',
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots: new LocalSnapshotStore(cwd), memory: new MemoryTranslationMemory(), docs,
      clock: {now: () => new Date('2026-07-15T00:00:00.000Z')}, ids: {next: () => 'run-create'},
    });
    const created = await workflows.createPlan('new-pair');
    const completed = await workflows.completePlan(created.runId, created.translationRequests.map((request) => ({
      operationId: request.operationId, translatedText: request.targetNodeKind === 'title' ? '配置' : '运行 `curl`。', targetNodeKind: request.targetNodeKind,
    })));
    const preview = await workflows.previewApply(created.runId, completed.reviewPath);

    await expect(workflows.apply(created.runId, completed.reviewPath, preview.approvalToken)).rejects.toThrow('created document registry unavailable');
    expect((await registry.getRun(created.runId))?.state).toBe('applying');

    await expect(workflows.finalizeVerified(created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await registry.getPair('new-pair')).toMatchObject({targetDocToken: 'created-target'});
  });

  it('applies an approved document, re-fetches, verifies, and advances the receipt', async () => {
    const context = await preparedWorkflow();
    const absoluteReviewPath = join(context.cwd, context.completed.reviewPath);
    const review = await readFile(absoluteReviewPath, 'utf8');
    await writeFile(absoluteReviewPath, review.replace('检查告警发送情况', '确认告警发送情况'), 'utf8');

    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const result = await context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken);

    expect(result.state).toBe('completed');
    expect(context.docs.writes).toHaveLength(4);
    expect(context.memory.entries).toHaveLength(3);
    const receipt = await context.registry.getReceipt('pair-1');
    expect(receipt).toMatchObject({sourceRevision: 2, runId: context.created.runId});
    const baseline = await context.snapshots.getBundle(receipt!.sourceSnapshotRef);
    expect(baseline.files).toMatchObject({
      'source.semantic.json': expect.any(String),
      'source.md': expect.stringContaining('# Overview'),
      'target.semantic.json': expect.any(String),
      'target.md': expect.any(String),
    });
    expect(context.docs.documents.get('target-url')?.content).toContain('确认告警发送情况');
    expect(context.docs.documents.get('target-url')?.content).toContain('复制端点');
  });

  it('requires the exact preview token before any write', async () => {
    const context = await preparedWorkflow();

    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    expect(preview).toMatchObject({
      sourceRevision: 2,
      targetRevision: 10,
      sourceHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      targetHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      operations: expect.arrayContaining([
        expect.objectContaining({approvedText: expect.any(String), compiledXml: expect.stringContaining('<')}),
      ]),
    });

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath)).rejects.toMatchObject({
      type: 'confirmation_required', subtype: 'apply_approval_token_required',
    });
    expect(context.docs.writes).toHaveLength(0);
  });

  it('chains consecutive insertions so their approved source order is preserved', async () => {
    const context = await preparedWorkflow({secondInsertion: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken);

    const content = context.docs.documents.get('target-url')!.content;
    expect(content.indexOf('保存集成后，检查告警发送情况')).toBeLessThan(content.indexOf('然后在控制面板中确认告警'));
  });

  it('invalidates the plan before writes when the English revision changes', async () => {
    const context = await preparedWorkflow();
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const source = context.docs.documents.get('source-url')!;
    context.docs.documents.set('source-url', {...source, revisionId: 3, content: `${source.content}<p id="late">Late edit</p>`});

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'stale_plan',
      subtype: 'source_changed',
    });
    expect(context.docs.writes).toHaveLength(0);
    expect(await context.registry.getRun(context.created.runId)).toMatchObject({
      state: 'stale',
      errorType: 'source_changed',
      errorDetail: expect.objectContaining({subtype: 'source_changed'}),
    });
  });

  it('invalidates the plan before writes when a planned target block ID is rebound', async () => {
    const context = await preparedWorkflow();
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const target = context.docs.documents.get('target-url')!;
    context.docs.documents.set('target-url', {
      ...target,
      content: target.content.replace('id="zh-overview-p1"', 'id="rebound-overview-p1"'),
    });

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'target_block_changed',
    });
    expect(context.docs.writes).toHaveLength(0);
  });

  it('revalidates preserved tokens after a human edits the review', async () => {
    const context = await preparedWorkflow();
    const absoluteReviewPath = join(context.cwd, context.completed.reviewPath);
    const review = await readFile(absoluteReviewPath, 'utf8');
    await writeFile(absoluteReviewPath, review.replace('https://cn.example.com/console', '#'), 'utf8');

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath)).rejects.toMatchObject({
      type: 'validation',
      subtype: 'internal_link_not_localized',
    });
    expect(context.docs.writes).toHaveLength(0);
  });

  it('records a partial run without advancing the receipt', async () => {
    const context = await preparedWorkflow({failAtWrite: 2});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    const receiptBefore = await context.registry.getReceipt('pair-1');

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'partial_write',
    });

    expect(await context.registry.getRun(context.created.runId)).toMatchObject({
      state: 'partial',
      errorType: 'fake_partial',
      errorDetail: expect.objectContaining({subtype: 'fake_partial'}),
    });
    expect(await context.registry.getReceipt('pair-1')).toEqual(receiptBefore);
    const inspection = await context.workflows.inspectRecovery(context.created.runId);
    expect(inspection).toMatchObject({
      state: 'partial',
      appliedOperations: 1,
      safeToRecover: true,
      currentTargetHashMatchesLastVerified: true,
      recoveryToken: expect.any(String),
    });
    await expect(context.workflows.restartFromCurrent(context.created.runId)).rejects.toMatchObject({
      type: 'confirmation_required', subtype: 'partial_recovery_required',
    });
    const reversePreview = await context.workflows.previewReverse(context.created.runId);
    expect(reversePreview.operations).toHaveLength(1);
    await context.workflows.reversePartial(context.created.runId, reversePreview.approvalToken);
    expect(context.docs.documents.get('target-url')?.content).toContain('监控指标。</p>');
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('blocked');
  });

  it('previews and restores a verified Whiteboard partial write from its raw prewrite snapshot', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-whiteboard-recovery-'));
    const docs = new WritableDocs();
    const whiteboards = new MemoryWhiteboards();
    const targetXml = '<title id="title">指南</title><whiteboard id="board" token="target-board"></whiteboard>';
    docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: targetXml});
    docs.documents.set('source-url', {documentId: 'source', revisionId: 2, content: '<title id="title">Guide</title>'});
    const oldBoard = {nodes: [{id: 'old', type: 'text', text: 'Old'}]};
    const newBoard = {nodes: [{id: 'new', type: 'text', text: 'New'}]};
    whiteboards.values.set('target-board', newBoard);
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    await registry.savePair({
      pairId: 'pair-board-recovery', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 5});
    const prewriteRef = await snapshots.putBundle({runId: 'run-board-recovery', files: {'target-prewrite.xml': targetXml}});
    const resourcePrewriteRef = await snapshots.putBundle({
      runId: 'run-board-recovery', files: {'whiteboard-board-op-prewrite.json': JSON.stringify(oldBoard)},
    });
    const plan = {
      planVersion: 2 as const, runId: 'run-board-recovery', pairId: 'pair-board-recovery',
      sourceRevision: 2, targetRevision: 5, sourceHash: 'source-hash', targetHash: target.canonicalHash,
      operations: [{
        operationId: 'board-op', policy: 'whiteboard_mirror' as const, effect: 'mirror' as const,
        kind: 'replace' as const, confidence: 'high' as const, proposedText: '', targetNodeKind: 'whiteboard' as const,
        targetNodeId: target.nodes[1]!.nodeId, targetBlockId: 'board', targetResourceToken: 'target-board',
        sourceResourceToken: 'source-board', sourceResourceHash: canonicalWhiteboard(newBoard).hash,
      }],
    };
    await registry.saveRun({
      runId: 'run-board-recovery', pairId: 'pair-board-recovery', state: 'partial',
      createdAt: '2026-07-16T00:00:00.000Z', updatedAt: '2026-07-16T00:00:00.000Z',
      metadata: {
        kind: 'localization', plan, prewriteRef, appliedOperations: 1,
        lastVerifiedTargetHash: target.canonicalHash,
        applyLog: [{
          operationId: 'board-op', kind: 'replace', policy: 'whiteboard_mirror', resolvedBlockId: 'board',
          targetHash: target.canonicalHash, sourceResourceHash: canonicalWhiteboard(newBoard).hash,
          targetResourceToken: 'target-board', targetResourcePrewriteRef: resourcePrewriteRef,
          targetResourcePrewriteHash: canonicalWhiteboard(oldBoard).hash,
        }],
      },
    });
    const workflows = new LocalizationWorkflows({
      cwd, registry, snapshots, memory: new MemoryTranslationMemory(), docs, whiteboards,
      clock: {now: () => new Date('2026-07-16T00:00:00.000Z')}, ids: {next: () => 'unused'},
    });

    await expect(workflows.inspectRecovery('run-board-recovery')).resolves.toMatchObject({
      safeToRecover: true, resourceHashesMatch: true,
    });
    const preview = await workflows.previewReverse('run-board-recovery');
    expect(preview.operations).toEqual([expect.objectContaining({
      kind: 'whiteboard_restore', targetResourceToken: 'target-board',
      expectedResourceHash: canonicalWhiteboard(oldBoard).hash,
    })]);
    await workflows.reversePartial('run-board-recovery', preview.approvalToken);
    expect(canonicalWhiteboard(whiteboards.values.get('target-board')).hash).toBe(canonicalWhiteboard(oldBoard).hash);
    expect(await registry.getRun('run-board-recovery')).toMatchObject({state: 'blocked'});
  });

  it('records the latest error subtype when reverse recovery fails', async () => {
    const context = await preparedWorkflow({failAtWrite: 2});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken))
      .rejects.toMatchObject({subtype: 'fake_partial'});
    const reverse = await context.workflows.previewReverse(context.created.runId);
    context.docs.failureSubtype = 'fake_reverse';
    context.docs.failAtWrite = 3;

    await expect(context.workflows.reversePartial(context.created.runId, reverse.approvalToken))
      .rejects.toMatchObject({subtype: 'fake_reverse'});
    expect(await context.registry.getRun(context.created.runId)).toMatchObject({
      state: 'partial',
      errorType: 'fake_reverse',
    });
  });

  it('does not advance the receipt when readback verification fails', async () => {
    const context = await preparedWorkflow({corruptWrites: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'verification_failed',
    });
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('partial');
  });

  it('rejects a write that places approved text in the wrong block', async () => {
    const context = await preparedWorkflow({misrouteFirstReplace: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toMatchObject({
      type: 'verification_failed', subtype: 'operation_progression_mismatch',
    });
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 1});
  });

  it('treats translation-memory persistence as rebuildable after verified remote writes', async () => {
    const context = await preparedWorkflow({failMemory: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    const result = await context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken);

    expect(result.state).toBe('completed');
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 2});
    expect((await context.registry.getRun(context.created.runId))?.metadata).toMatchObject({translationMemoryWarning: expect.any(String)});
  });

  it('can idempotently finalize a verified write after a transient receipt failure', async () => {
    const context = await preparedWorkflow({failReceipt: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toThrow('registry temporarily unavailable');
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('verifying');

    await expect(context.workflows.finalizeVerified(context.created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 2});
  });

  it('reconstructs finalization when persisting pending receipt metadata itself fails', async () => {
    const context = await preparedWorkflow({failPendingRun: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);

    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toThrow('pending receipt metadata unavailable');
    expect((await context.registry.getRun(context.created.runId))?.state).toBe('verifying');
    const source = context.docs.documents.get('source-url')!;
    context.docs.documents.set('source-url', {...source, revisionId: 3, content: `${source.content}<p id="later">Later source edit</p>`});

    await expect(context.workflows.finalizeVerified(context.created.runId)).resolves.toMatchObject({state: 'completed'});
    expect(await context.registry.getReceipt('pair-1')).toMatchObject({sourceRevision: 2});
  });

  it('refuses reconstructed finalization after an unrelated target edit', async () => {
    const context = await preparedWorkflow({failPendingRun: true});
    const preview = await context.workflows.previewApply(context.created.runId, context.completed.reviewPath);
    await expect(context.workflows.apply(context.created.runId, context.completed.reviewPath, preview.approvalToken)).rejects.toThrow('pending receipt metadata unavailable');
    const target = context.docs.documents.get('target-url')!;
    context.docs.documents.set('target-url', {...target, revisionId: target.revisionId + 1, content: `${target.content}<p id="human">人工编辑</p>`});

    await expect(context.workflows.finalizeVerified(context.created.runId)).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'finalization_target_changed',
    });
  });
});
