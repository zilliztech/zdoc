import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {
  canonicalWhiteboardRawHash,
  createDocumentSnapshot,
  PartialMutationError,
  prepareMutationBatch,
  type ApplyMutationInput,
  type AssessRecoveryInput,
  type DocumentSelector,
  type DocumentSnapshot,
  type MutationOutcome,
  type PrepareMutationInput,
  type PreparedMutationBatch,
  type ProviderBlock,
  type RecoveryAssessment,
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
import {
  assertRecoveryOutcome,
  RecoveryApplyJournal,
  verifyLegacyRecoveryResources,
} from '../src/application/legacy-recovery.js';
import {compileReview, type LocalizationPlan} from '../src/domain/review.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';
import {canonicalWhiteboard} from '../src/domain/whiteboard.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';

class MemoryTranslationMemory implements TranslationMemory {
  async recordApproved(_entry: TranslationMemoryEntry): Promise<void> {}
  async findExact(_query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined> { return undefined; }
  async close(): Promise<void> {}
}

class MemoryDocs implements DocumentGateway {
  readonly documents = new Map<string, {documentId: string; revisionId: number; content: string}>();
  readonly mutations: string[] = [];
  async fetch(doc: string) {
    const value = this.documents.get(doc);
    if (!value) throw new Error(`Missing document ${doc}`);
    return {...value};
  }
  async replaceBlock(): Promise<never> { this.mutations.push('replace'); throw new Error('legacy writer used'); }
  async insertAfter(): Promise<never> { this.mutations.push('insert'); throw new Error('legacy writer used'); }
  async deleteBlocks(): Promise<never> { this.mutations.push('delete'); throw new Error('legacy writer used'); }
  async createDocument(): Promise<never> { throw new Error('not used'); }
}

class RecoveryEngine implements LocalizationDocxEngine {
  readonly snapshots = new Map<string, DocumentSnapshot>();
  assessments: RecoveryAssessment[] = [];
  assessmentInputs: AssessRecoveryInput[] = [];
  prepared: PreparedMutationBatch[] = [];
  applyImpl?: (input: ApplyMutationInput) => Promise<MutationOutcome>;

  async snapshot(selector: DocumentSelector): Promise<DocumentSnapshot> {
    const key = selector.kind === 'url' ? selector.url : selector.token;
    const value = this.snapshots.get(key);
    if (!value) throw new Error(`Missing snapshot ${key}`);
    return value;
  }
  prepare(input: PrepareMutationInput): PreparedMutationBatch {
    const batch = prepareMutationBatch(input);
    this.prepared.push(batch);
    return batch;
  }
  async apply(input: ApplyMutationInput): Promise<MutationOutcome> {
    if (!this.applyImpl) throw new Error('not used');
    return this.applyImpl(input);
  }
  async assessRecovery(input: AssessRecoveryInput): Promise<RecoveryAssessment> {
    this.assessmentInputs.push(structuredClone(input));
    const assessment = this.assessments.shift();
    if (!assessment) throw new Error('Missing recovery assessment');
    return assessment;
  }
}

class MemoryWhiteboards implements WhiteboardGateway {
  readonly values = new Map<string, unknown>();
  readonly updates: Array<{token: string; raw: unknown; idempotencyToken: string}> = [];
  async queryRaw(token: string): Promise<unknown> { return structuredClone(this.values.get(token)); }
  async overwriteRaw(input: {token: string; raw: unknown; idempotencyToken: string}): Promise<void> {
    this.updates.push(input);
    this.values.set(input.token, structuredClone(input.raw));
  }
}

function snapshot(documentId: string, revision: string, title: string, children: ProviderBlock[] = []): DocumentSnapshot {
  return createDocumentSnapshot({
    documentId,
    revision,
    blocks: [{
      block_id: documentId,
      block_type: 1,
      page: {elements: [{text_run: {content: title, text_element_style: {}}}]},
      children: children.map((block) => block.block_id as string),
    }, ...children],
  });
}

async function workflowContext() {
  const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-legacy-recovery-'));
  const registry = new LocalRegistryStore(cwd);
  const snapshots = new LocalSnapshotStore(cwd);
  const docs = new MemoryDocs();
  const engine = new RecoveryEngine();
  const whiteboards = new MemoryWhiteboards();
  const workflows = new LocalizationWorkflows({
    cwd, registry, snapshots, docs, engine, whiteboards, memory: new MemoryTranslationMemory(),
    clock: {now: () => new Date('2026-07-27T00:00:00.000Z')},
    ids: {next: () => 'new-run'},
  });
  return {cwd, registry, snapshots, docs, engine, whiteboards, workflows};
}

async function savePlanRun(
  context: Awaited<ReturnType<typeof workflowContext>>,
  plan: LocalizationPlan,
  state: 'review_required' | 'blocked' | 'stale' | 'partial',
  metadata: Record<string, unknown> = {},
) {
  const bundleRef = await context.snapshots.putBundle({
    runId: plan.runId,
    files: {
      'plan.json': `${JSON.stringify(plan, null, 2)}\n`,
      'translation-requests.json': '[]\n',
      'review.md': compileReview(plan),
    },
  });
  await context.registry.saveRun({
    runId: plan.runId, pairId: plan.pairId, state,
    createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
    metadata: {kind: 'localization', bundleRef, plan, ...metadata},
  });
  return bundleRef;
}

describe('legacy and Engine recovery compatibility', () => {
  it('migrates a changed legacy receipt into an Engine plan v3 without whole-document churn', async () => {
    const context = await workflowContext();
    const baselineXml = '<title id="source">Guide</title><p id="source-body">Old body.</p><p id="source-stable">Stable.</p>';
    const currentXml = '<title id="source">Guide</title><p id="source-body">New body.</p><p id="source-stable">Stable.</p>';
    const targetBaselineXml = '<title id="target">指南</title><p id="target-body">旧正文。</p><p id="target-stable">稳定。</p>';
    const baseline = parseFeishuDocument(baselineXml, {documentId: 'source', revisionId: 3});
    const targetBaseline = parseFeishuDocument(targetBaselineXml, {documentId: 'target', revisionId: 8});
    context.docs.documents.set('source-url', {documentId: 'source', revisionId: 4, content: currentXml});
    context.engine.snapshots.set('source-url', snapshot('source', '4', 'Guide', [{
      block_id: 'source-body', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'New body.', text_element_style: {}}}]},
    }, {
      block_id: 'source-stable', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'Stable.', text_element_style: {}}}]},
    }]));
    context.engine.snapshots.set('target-url', snapshot('target', '8', '指南', [{
      block_id: 'target-distractor', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '结构干扰项。', text_element_style: {}}}]},
    }, {
      block_id: 'target-body', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '旧正文。', text_element_style: {}}}]},
    }, {
      block_id: 'target-stable', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '稳定。', text_element_style: {}}}]},
    }]));
    await context.registry.savePair({
      pairId: 'pair-legacy-migrate', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const sourceSnapshotRef = await context.snapshots.putBundle({
      runId: 'legacy-receipt', files: {'source.xml': baselineXml, 'target.xml': targetBaselineXml},
    });
    await context.registry.saveReceipt({
      pairId: 'pair-legacy-migrate', sourceRevision: 3, sourceHash: baseline.canonicalHash,
      sourceSnapshotRef, targetRevision: 8, targetHash: targetBaseline.canonicalHash,
      runId: 'legacy-receipt', completedAt: '2026-07-26T00:00:00.000Z',
      correspondences: [{
        sourceNodeId: baseline.nodes[1]!.nodeId,
        targetNodeId: targetBaseline.nodes[1]!.nodeId,
      }, {
        sourceNodeId: baseline.nodes[2]!.nodeId,
        targetNodeId: targetBaseline.nodes[2]!.nodeId,
      }],
    });

    const result = await context.workflows.createPlan('pair-legacy-migrate');

    expect(result).toMatchObject({
      state: 'translation_required',
      changes: [expect.objectContaining({kind: 'replace', after: expect.objectContaining({text: 'New body.'})})],
      translationRequests: [expect.objectContaining({sourceAfter: 'New body.', targetCurrent: '旧正文。'})],
    });
    const run = await context.registry.getRun(result.runId);
    expect(run?.metadata).toMatchObject({documentHashDomain: 'docx-engine-v1'});
    const bundle = await context.snapshots.getBundle(run?.metadata?.bundleRef as Parameters<LocalSnapshotStore['getBundle']>[0]);
    expect(bundle.files).toMatchObject({
      'source-current.snapshot.json': expect.stringContaining('source-body'),
      'target-current.snapshot.json': expect.stringContaining('target-body'),
      'current-correspondences.json': expect.stringContaining('targetNodeId'),
    });
  });

  it('migrates a legitimate legacy source deletion without requiring the deleted correspondence to survive', async () => {
    const context = await workflowContext();
    const baselineXml = '<title id="source">Guide</title><p id="source-keep">Keep.</p><p id="source-delete">Delete me.</p>';
    const currentXml = '<title id="source">Guide</title><p id="source-keep">Keep.</p>';
    const targetXml = '<title id="target">指南</title><p id="target-keep">保留。</p><p id="target-delete">删除我。</p>';
    const baseline = parseFeishuDocument(baselineXml, {documentId: 'source', revisionId: 3});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 8});
    context.docs.documents.set('source-url', {documentId: 'source', revisionId: 4, content: currentXml});
    context.engine.snapshots.set('source-url', snapshot('source', '4', 'Guide', [{
      block_id: 'source-keep', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'Keep.', text_element_style: {}}}]},
    }]));
    context.engine.snapshots.set('target-url', snapshot('target', '8', '指南', [{
      block_id: 'target-keep', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '保留。', text_element_style: {}}}]},
    }, {
      block_id: 'target-delete', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '删除我。', text_element_style: {}}}]},
    }]));
    await context.registry.savePair({pairId: 'pair-legacy-delete', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const sourceSnapshotRef = await context.snapshots.putBundle({runId: 'legacy-delete', files: {'source.xml': baselineXml, 'target.xml': targetXml}});
    await context.registry.saveReceipt({
      pairId: 'pair-legacy-delete', sourceRevision: 3, sourceHash: baseline.canonicalHash,
      sourceSnapshotRef, targetRevision: 8, targetHash: target.canonicalHash,
      runId: 'legacy-delete', completedAt: '2026-07-26T00:00:00.000Z',
      correspondences: [
        {sourceNodeId: baseline.nodes[1]!.nodeId, targetNodeId: target.nodes[1]!.nodeId},
        {sourceNodeId: baseline.nodes[2]!.nodeId, targetNodeId: target.nodes[2]!.nodeId},
      ],
    });

    await expect(context.workflows.createPlan('pair-legacy-delete')).resolves.toMatchObject({
      state: 'translation_required',
      changes: [expect.objectContaining({kind: 'delete', before: expect.objectContaining({text: 'Delete me.'})})],
    });
  });

  it('fails mixed legacy migration when an unrelated unchanged correspondence is lost', async () => {
    const context = await workflowContext();
    const baselineXml = '<title id="source">Guide</title><p id="source-change">Old.</p><p id="source-stable">Stable.</p>';
    const currentXml = '<title id="source">Guide</title><p id="source-change">New.</p><p id="source-stable">Stable.</p>';
    const targetXml = '<title id="target">指南</title><p id="target-change">旧。</p><p id="target-stable">稳定。</p>';
    const baseline = parseFeishuDocument(baselineXml, {documentId: 'source', revisionId: 3});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 8});
    context.docs.documents.set('source-url', {documentId: 'source', revisionId: 4, content: currentXml});
    context.engine.snapshots.set('source-url', snapshot('source', '4', 'Guide', [{
      block_id: 'source-change', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'New.', text_element_style: {}}}]},
    }, {
      block_id: 'recreated-stable', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'Engine lost stable identity.', text_element_style: {}}}]},
    }]));
    context.engine.snapshots.set('target-url', snapshot('target', '8', '指南', [{
      block_id: 'target-change', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '旧。', text_element_style: {}}}]},
    }, {
      block_id: 'target-stable', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '稳定。', text_element_style: {}}}]},
    }]));
    await context.registry.savePair({pairId: 'pair-legacy-mixed-loss', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const sourceSnapshotRef = await context.snapshots.putBundle({runId: 'legacy-mixed-loss', files: {'source.xml': baselineXml, 'target.xml': targetXml}});
    await context.registry.saveReceipt({
      pairId: 'pair-legacy-mixed-loss', sourceRevision: 3, sourceHash: baseline.canonicalHash,
      sourceSnapshotRef, targetRevision: 8, targetHash: target.canonicalHash,
      runId: 'legacy-mixed-loss', completedAt: '2026-07-26T00:00:00.000Z',
      correspondences: [
        {sourceNodeId: baseline.nodes[1]!.nodeId, targetNodeId: target.nodes[1]!.nodeId},
        {sourceNodeId: baseline.nodes[2]!.nodeId, targetNodeId: target.nodes[2]!.nodeId},
      ],
    });

    await expect(context.workflows.createPlan('pair-legacy-mixed-loss')).rejects.toMatchObject({
      type: 'alignment_blocked', subtype: 'legacy_correspondence_migration_incomplete',
    });
  });

  it('upgrades an unchanged legacy receipt to Engine snapshots without a document write', async () => {
    const context = await workflowContext();
    const sourceXml = '<title id="source">Guide</title><p id="source-body">Stable.</p>';
    const targetXml = '<title id="target">指南</title><p id="target-body">稳定。</p>';
    const source = parseFeishuDocument(sourceXml, {documentId: 'source', revisionId: 3});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 8});
    const sourceEngine = snapshot('source', '3', 'Guide', [{
      block_id: 'source-body', parent_id: 'source', block_type: 2,
      text: {elements: [{text_run: {content: 'Stable.', text_element_style: {}}}]},
    }]);
    const targetEngine = snapshot('target', '8', '指南', [{
      block_id: 'target-body', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '稳定。', text_element_style: {}}}]},
    }]);
    context.docs.documents.set('source-url', {documentId: 'source', revisionId: 3, content: sourceXml});
    context.engine.snapshots.set('source-url', sourceEngine);
    context.engine.snapshots.set('target-url', targetEngine);
    await context.registry.savePair({
      pairId: 'pair-legacy-nochange', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const sourceSnapshotRef = await context.snapshots.putBundle({runId: 'legacy', files: {'source.xml': sourceXml, 'target.xml': targetXml}});
    await context.registry.saveReceipt({
      pairId: 'pair-legacy-nochange', sourceRevision: 3, sourceHash: source.canonicalHash,
      sourceSnapshotRef, targetRevision: 8, targetHash: target.canonicalHash,
      runId: 'legacy', completedAt: '2026-07-26T00:00:00.000Z',
      correspondences: [{sourceNodeId: source.nodes[1]!.nodeId, targetNodeId: target.nodes[1]!.nodeId}],
    });

    await expect(context.workflows.createPlan('pair-legacy-nochange')).resolves.toMatchObject({state: 'completed', changes: []});

    const migrated = await context.registry.getReceipt('pair-legacy-nochange');
    expect(migrated).toMatchObject({sourceHash: sourceEngine.canonicalHash, targetHash: targetEngine.canonicalHash, runId: 'new-run'});
    const bundle = await context.snapshots.getBundle(migrated!.sourceSnapshotRef);
    expect(bundle.files).toMatchObject({
      'source.snapshot.json': expect.stringContaining(sourceEngine.canonicalHash),
      'target.snapshot.json': expect.stringContaining(targetEngine.canonicalHash),
    });
    expect(context.docs.mutations).toEqual([]);
  });

  it('does not persist a completed migration run when an unchanged legacy target revision drifted', async () => {
    const context = await workflowContext();
    const sourceXml = '<title id="source">Guide</title>';
    const targetXml = '<title id="target">指南</title>';
    const source = parseFeishuDocument(sourceXml, {documentId: 'source', revisionId: 3});
    const target = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 8});
    context.docs.documents.set('source-url', {documentId: 'source', revisionId: 3, content: sourceXml});
    context.engine.snapshots.set('source-url', snapshot('source', '3', 'Guide'));
    context.engine.snapshots.set('target-url', snapshot('target', '9', '指南'));
    await context.registry.savePair({
      pairId: 'pair-legacy-drift', sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const sourceSnapshotRef = await context.snapshots.putBundle({runId: 'legacy-drift', files: {'source.xml': sourceXml, 'target.xml': targetXml}});
    await context.registry.saveReceipt({
      pairId: 'pair-legacy-drift', sourceRevision: 3, sourceHash: source.canonicalHash,
      sourceSnapshotRef, targetRevision: 8, targetHash: target.canonicalHash,
      runId: 'legacy-drift', completedAt: '2026-07-26T00:00:00.000Z', correspondences: [],
    });

    await expect(context.workflows.createPlan('pair-legacy-drift')).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'legacy_target_changed_during_migration',
    });
    expect(await context.registry.getRun('new-run')).toBeUndefined();
  });

  it('requires unresolved plan v1/v2 reviews to be regenerated before preview', async () => {
    const context = await workflowContext();
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-review', pairId: 'pair-legacy',
      sourceRevision: 1, targetRevision: 1, sourceHash: 'source', targetHash: 'target', operations: [],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    await savePlanRun(context, plan, 'review_required');
    await writeFile(join(context.cwd, 'review.md'), compileReview(plan), 'utf8');

    await expect(context.workflows.previewApply(plan.runId, 'review.md')).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'legacy_plan_requires_regeneration',
    });
  });

  it('requires a historical plan v3 in the legacy hash domain to be regenerated when Engine is available', async () => {
    const context = await workflowContext();
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'legacy-domain-v3', pairId: 'pair-legacy-v3',
      sourceRevision: 1, targetRevision: 1, sourceHash: 'source', targetHash: 'target', operations: [],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    await savePlanRun(context, plan, 'review_required', {documentHashDomain: 'legacy-xml-v1'});

    await expect(context.workflows.previewApply(plan.runId, 'missing.md')).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'legacy_plan_requires_regeneration',
    });
  });

  it.each(['blocked', 'stale'] as const)('reports regeneration for an unresolved legacy %s run before generic state validation', async (state) => {
    const context = await workflowContext();
    const plan: LocalizationPlan = {
      planVersion: 1, runId: `legacy-${state}`, pairId: 'pair-legacy-state',
      sourceRevision: 1, targetRevision: 1, sourceHash: 'source', targetHash: 'target', operations: [],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    await savePlanRun(context, plan, state);

    await expect(context.workflows.previewApply(plan.runId, 'missing-review.md')).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'legacy_plan_requires_regeneration',
    });
  });

  it('loads an immutable bundle-only legacy plan before blocked-state validation', async () => {
    const context = await workflowContext();
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-bundle-only', pairId: 'pair-bundle-only',
      sourceRevision: 1, targetRevision: 1, sourceHash: 'source', targetHash: 'target', operations: [],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const bundleRef = await savePlanRun(context, plan, 'blocked');
    const stored = await context.registry.getRun(plan.runId);
    await context.registry.saveRun({...stored!, metadata: {kind: 'localization', bundleRef}});

    await expect(context.workflows.previewApply(plan.runId, 'missing.md')).rejects.toMatchObject({
      type: 'stale_plan', subtype: 'legacy_plan_requires_regeneration',
    });
  });

  it('assesses a plan v3 partial run from the exact immutable Engine checkpoint', async () => {
    const context = await workflowContext();
    const target = snapshot('target', '4', '指南');
    const batch = context.engine.prepare({
      snapshot: target,
      idempotencyNamespace: 'run-engine-partial',
      operations: [{
        operationId: 'assert-title', kind: 'assert',
        target: {kind: 'snapshot-block', blockId: target.rootBlockId},
        expectedHash: target.nodes[0]!.canonicalHash,
      }],
    });
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'run-engine-partial', pairId: 'pair-engine',
      sourceRevision: 1, targetRevision: 4, sourceHash: 'source', targetHash: target.canonicalHash,
      operations: [],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const previewBundleRef = await context.snapshots.putBundle({
      runId: plan.runId, files: {'prepared-batch.json': `${JSON.stringify(batch)}\n`},
    });
    const prewriteRef = await context.snapshots.putBundle({
      runId: plan.runId, files: {'target-prewrite.snapshot.json': `${JSON.stringify(target)}\n`},
    });
    const engineEvidenceRef = await context.snapshots.putBundle({
      runId: plan.runId, files: {'apply-evidence.json': '[]\n'},
    });
    await savePlanRun(context, plan, 'partial', {
      documentHashDomain: 'docx-engine-v1', previewBundleRef, prewriteRef,
      engineBatchFingerprint: batch.fingerprint, engineEvidence: [], engineEvidenceRef,
    });
    context.engine.assessments.push({
      disposition: 'resume_possible', completedOperationIds: [], pendingOperationIds: ['assert-title'],
    });

    await expect(context.workflows.inspectRecovery(plan.runId)).resolves.toMatchObject({
      disposition: 'resume_possible', batchFingerprint: batch.fingerprint,
      completedOperationIds: [], pendingOperationIds: ['assert-title'], safeToRecover: false,
    });
    expect(context.engine.assessmentInputs).toEqual([{
      batch,
      checkpoint: {completedOperations: [], prewriteSnapshot: target},
    }]);
    context.engine.assessments.push({
      disposition: 'resume_possible', completedOperationIds: [], pendingOperationIds: ['assert-title'],
    });
    await expect(context.workflows.previewReverse(plan.runId)).rejects.toMatchObject({
      type: 'confirmation_required', subtype: 'reverse_not_proven_safe',
    });
  });

  it('does not issue a recovery token for Engine manual inspection', async () => {
    const context = await workflowContext();
    const target = snapshot('target', '4', '指南');
    const batch = context.engine.prepare({
      snapshot: target,
      idempotencyNamespace: 'run-engine-manual',
      operations: [{
        operationId: 'assert-title', kind: 'assert',
        target: {kind: 'snapshot-block', blockId: target.rootBlockId},
        expectedHash: target.nodes[0]!.canonicalHash,
      }],
    });
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'run-engine-manual', pairId: 'pair-engine-manual',
      sourceRevision: 1, targetRevision: 4, sourceHash: 'source', targetHash: target.canonicalHash,
      operations: [],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const previewBundleRef = await context.snapshots.putBundle({runId: plan.runId, files: {'prepared-batch.json': JSON.stringify(batch)}});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.snapshot.json': JSON.stringify(target)}});
    await savePlanRun(context, plan, 'partial', {
      documentHashDomain: 'docx-engine-v1', previewBundleRef, prewriteRef,
      engineBatchFingerprint: batch.fingerprint, engineEvidence: [],
    });
    context.engine.assessments.push({disposition: 'manual_inspection_required', reason: 'unexpected_remote_change'});

    const result = await context.workflows.inspectRecovery(plan.runId);
    expect(result).toMatchObject({
      disposition: 'manual_inspection_required', reason: 'unexpected_remote_change', safeToRecover: false,
    });
    expect(result).not.toHaveProperty('recoveryToken');
    context.engine.assessments.push({disposition: 'manual_inspection_required', reason: 'unexpected_remote_change'});
    await expect(context.workflows.previewReverse(plan.runId)).rejects.toMatchObject({
      type: 'confirmation_required', subtype: 'reverse_not_proven_safe',
    });
    expect(context.engine.applyImpl).toBeUndefined();
  });

  it('wraps malformed immutable Engine recovery JSON in a typed verification error', async () => {
    const context = await workflowContext();
    const target = snapshot('target', '4', '指南');
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'run-malformed-recovery', pairId: 'pair-malformed',
      sourceRevision: 1, targetRevision: 4, sourceHash: 'source', targetHash: target.canonicalHash, operations: [],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const previewBundleRef = await context.snapshots.putBundle({runId: plan.runId, files: {'prepared-batch.json': '{bad'}});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.snapshot.json': JSON.stringify(target)}});
    await savePlanRun(context, plan, 'partial', {
      documentHashDomain: 'docx-engine-v1', previewBundleRef, prewriteRef,
      engineBatchFingerprint: 'invalid', engineEvidence: [],
    });

    await expect(context.workflows.inspectRecovery(plan.runId)).rejects.toMatchObject({
      type: 'verification_failed', subtype: 'engine_recovery_evidence_malformed',
    });
  });

  it('rejects unverified evidence in the separate recovery journal', async () => {
    const context = await workflowContext();
    const run = {
      runId: 'recovery-journal-unverified', pairId: 'pair', state: 'recovering' as const,
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z', metadata: {},
    };
    await context.registry.saveRun(run);
    const journal = new RecoveryApplyJournal({
      run, operationIds: ['reverse'], registry: context.registry, snapshots: context.snapshots,
      now: () => new Date('2026-07-27T00:00:00.000Z'),
    });

    await expect(journal.recordVerified({
      operationId: 'reverse', createdBlockIds: [], revision: '5', afterSnapshotHash: 'hash', verified: false as true,
    })).rejects.toMatchObject({subtype: 'recovery_evidence_unverified'});
  });

  it('rejects a recovery outcome that does not cover every approved batch step', () => {
    const target = snapshot('target', '4', '指南');
    const engine = new RecoveryEngine();
    const batch = engine.prepare({
      snapshot: target, idempotencyNamespace: 'short-outcome',
      operations: [{operationId: 'reverse', kind: 'assert', blockId: target.rootBlockId, expectedHash: target.nodes[0]!.canonicalHash}],
    });

    expect(() => assertRecoveryOutcome({
      batch,
      evidence: [],
      outcome: {finalSnapshot: target, operations: []},
      expectedFinalSnapshotHash: target.canonicalHash,
    })).toThrow(expect.objectContaining({subtype: 'engine_recovery_outcome_mismatch'}));
  });

  it('previews and applies Engine reverse_possible with a separate current-snapshot-bound recovery batch', async () => {
    const context = await workflowContext();
    const target = snapshot('target', '4', '指南');
    context.engine.snapshots.set('target-url', target);
    const originalBatch = context.engine.prepare({
      snapshot: target,
      idempotencyNamespace: 'run-engine-reverse',
      operations: [{
        operationId: 'forward-assert', kind: 'assert',
        target: {kind: 'snapshot-block', blockId: target.rootBlockId},
        expectedHash: target.nodes[0]!.canonicalHash,
      }],
    });
    const reverseIntent = {
      operationId: 'reverse-active', kind: 'assert' as const,
      blockId: target.rootBlockId, expectedHash: target.nodes[0]!.canonicalHash,
    };
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'run-engine-reverse', pairId: 'pair-engine-reverse',
      sourceRevision: 1, targetRevision: 4, sourceHash: 'source', targetHash: target.canonicalHash,
      operations: [],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const previewBundleRef = await context.snapshots.putBundle({runId: plan.runId, files: {'prepared-batch.json': JSON.stringify(originalBatch)}});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.snapshot.json': JSON.stringify(target)}});
    await savePlanRun(context, plan, 'partial', {
      documentHashDomain: 'docx-engine-v1', previewBundleRef, prewriteRef,
      engineBatchFingerprint: originalBatch.fingerprint, engineEvidence: [],
    });
    context.engine.assessments.push(
      {disposition: 'reverse_possible', reverseIntents: [reverseIntent]},
      {disposition: 'reverse_possible', reverseIntents: [reverseIntent]},
    );
    context.engine.applyImpl = async ({batch, journal}) => {
      expect(batch.schemaVersion).toBe(1);
      expect(batch.fingerprint).not.toBe(originalBatch.fingerprint);
      const evidence = {
        operationId: 'reverse-active', createdBlockIds: [], revision: '4',
        afterSnapshotHash: target.canonicalHash, verified: true as const,
      };
      await journal.recordVerified(evidence);
      return {finalSnapshot: target, operations: [evidence]};
    };

    const preview = await context.workflows.previewReverse(plan.runId);
    expect(preview).toMatchObject({
      engineSchemaVersion: 1,
      batchFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      currentTargetHash: target.canonicalHash,
    });
    await context.workflows.reversePartial(plan.runId, preview.approvalToken);

    const stored = await context.registry.getRun(plan.runId);
    expect(stored).toMatchObject({
      state: 'blocked',
      metadata: {
        engineEvidence: [],
        reverseEngineEvidence: [expect.objectContaining({operationId: 'reverse-active'})],
        reverseEngineEvidenceRef: expect.any(Object),
      },
    });
  });

  it('recovers a partially-written schema-v1 v3 reverse through its own actionable recovery phase', async () => {
    const context = await workflowContext();
    const target = snapshot('target', '4', '指南');
    context.engine.snapshots.set('target-url', target);
    const originalBatch = context.engine.prepare({
      snapshot: target, idempotencyNamespace: 'run-engine-reverse-partial',
      operations: [{
        operationId: 'forward-assert', kind: 'assert',
        target: {kind: 'snapshot-block', blockId: target.rootBlockId},
        expectedHash: target.nodes[0]!.canonicalHash,
      }],
    });
    const reverseIntent = {operationId: 'reverse-active', kind: 'assert' as const, blockId: target.rootBlockId, expectedHash: target.nodes[0]!.canonicalHash};
    const undoPartialReverse = {operationId: 'undo-partial-reverse', kind: 'assert' as const, blockId: target.rootBlockId, expectedHash: target.nodes[0]!.canonicalHash};
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'run-engine-reverse-partial', pairId: 'pair-engine-reverse-partial',
      sourceRevision: 1, targetRevision: 4, sourceHash: 'source', targetHash: target.canonicalHash, operations: [],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const previewBundleRef = await context.snapshots.putBundle({runId: plan.runId, files: {'prepared-batch.json': JSON.stringify(originalBatch)}});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.snapshot.json': JSON.stringify(target)}});
    await savePlanRun(context, plan, 'partial', {
      documentHashDomain: 'docx-engine-v1', previewBundleRef, prewriteRef,
      engineBatchFingerprint: originalBatch.fingerprint, engineEvidence: [],
    });
    context.engine.assessments.push(
      {disposition: 'reverse_possible', reverseIntents: [reverseIntent]},
      {disposition: 'reverse_possible', reverseIntents: [reverseIntent]},
    );
    let applyCalls = 0;
    let partialReverseBatchFingerprint = '';
    context.engine.applyImpl = async ({batch, journal}) => {
      applyCalls += 1;
      if (applyCalls === 1) {
        partialReverseBatchFingerprint = batch.fingerprint;
        expect(batch.schemaVersion).toBe(1);
        throw new PartialMutationError({
          batchFingerprint: batch.fingerprint,
          beforeSnapshotHash: batch.beforeSnapshotHash,
          lastObservedRevision: '5', lastObservedSnapshotHash: 'partial-reverse', completedOperations: [],
          failedOperation: {operationId: batch.steps[0]!.operationId, kind: batch.steps[0]!.kind, message: 'reverse partially wrote'},
          pendingOperationIds: [], createdBlockIds: [], recoveryDisposition: 'reverse_possible',
        });
      }
      expect(batch.schemaVersion).toBe(1);
      expect(batch.fingerprint).not.toBe(partialReverseBatchFingerprint);
      const evidence = {
        operationId: 'undo-partial-reverse', createdBlockIds: [], revision: '6',
        afterSnapshotHash: target.canonicalHash, verified: true as const,
      };
      await journal.recordVerified(evidence);
      return {finalSnapshot: target, operations: [evidence]};
    };

    const initialPreview = await context.workflows.previewReverse(plan.runId);
    await expect(context.workflows.reversePartial(plan.runId, initialPreview.approvalToken)).rejects.toMatchObject({
      type: 'partial_write', subtype: 'engine_recovery_partial',
    });
    expect(await context.registry.getRun(plan.runId)).toMatchObject({
      state: 'partial', metadata: {
        recoveryPhaseRef: expect.any(Object),
        recoveryPhaseBatchFingerprint: partialReverseBatchFingerprint,
      },
    });

    context.engine.assessments.push({disposition: 'manual_inspection_required', reason: 'inspect recovery phase manually'});
    await expect(context.workflows.inspectRecovery(plan.runId)).resolves.toMatchObject({
      disposition: 'manual_inspection_required', batchFingerprint: partialReverseBatchFingerprint,
    });
    context.engine.assessments.push({disposition: 'manual_inspection_required', reason: 'inspect recovery phase manually'});
    await expect(context.workflows.previewReverse(plan.runId)).rejects.toMatchObject({
      type: 'confirmation_required', subtype: 'reverse_not_proven_safe',
    });

    context.engine.assessments.push(
      {disposition: 'reverse_possible', reverseIntents: [undoPartialReverse]},
      {disposition: 'reverse_possible', reverseIntents: [undoPartialReverse]},
    );
    const recoveryPreview = await context.workflows.previewReverse(plan.runId);
    expect(recoveryPreview).toMatchObject({
      engineSchemaVersion: 1,
      currentTargetHash: target.canonicalHash,
      restoreTargetHash: target.canonicalHash,
      batchFingerprint: expect.any(String),
    });
    expect(recoveryPreview.batchFingerprint).not.toBe(partialReverseBatchFingerprint);
    await expect(context.workflows.reversePartial(plan.runId, recoveryPreview.approvalToken)).resolves.toMatchObject({
      state: 'partial', restoredTargetHash: target.canonicalHash,
    });
    expect(await context.registry.getRun(plan.runId)).toMatchObject({
      state: 'partial', metadata: {recoveryPhaseResolved: true},
    });
    expect((await context.registry.getRun(plan.runId))?.metadata?.recoveryPhaseRef).toBeUndefined();

    context.engine.assessments.push({disposition: 'manual_inspection_required', reason: 'back to original forward recovery'});
    await expect(context.workflows.inspectRecovery(plan.runId)).resolves.toMatchObject({
      batchFingerprint: originalBatch.fingerprint,
      reason: 'back to original forward recovery',
    });
  });

  it('keeps a recovery phase checkpoint when reversing an active operation beyond its completed prefix', async () => {
    const context = await workflowContext();
    const prewrite = snapshot('target', '4', 'Prewrite');
    const prefix = snapshot('target', '5', 'Prefix');
    const partial = snapshot('target', '6', 'Partial');
    context.engine.snapshots.set('target-url', prewrite);
    const originalBatch = context.engine.prepare({
      snapshot: prewrite, idempotencyNamespace: 'phase-prefix-original',
      operations: [{operationId: 'forward', kind: 'assert', target: {kind: 'snapshot-block', blockId: prewrite.rootBlockId}, expectedHash: prewrite.nodes[0]!.canonicalHash}],
    });
    const reverseCompleted = {operationId: 'reverse-completed', kind: 'assert' as const, blockId: prewrite.rootBlockId, expectedHash: prewrite.nodes[0]!.canonicalHash};
    const reverseActive = {operationId: 'reverse-active', kind: 'assert' as const, blockId: prewrite.rootBlockId, expectedHash: prewrite.nodes[0]!.canonicalHash};
    const undoActive = {operationId: 'undo-active', kind: 'assert' as const, blockId: partial.rootBlockId, expectedHash: partial.nodes[0]!.canonicalHash};
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'phase-prefix-run', pairId: 'phase-prefix-pair',
      sourceRevision: 1, targetRevision: 4, sourceHash: 'source', targetHash: prewrite.canonicalHash, operations: [],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const previewBundleRef = await context.snapshots.putBundle({runId: plan.runId, files: {'prepared-batch.json': JSON.stringify(originalBatch)}});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.snapshot.json': JSON.stringify(prewrite)}});
    await savePlanRun(context, plan, 'partial', {
      documentHashDomain: 'docx-engine-v1', previewBundleRef, prewriteRef,
      engineBatchFingerprint: originalBatch.fingerprint, engineEvidence: [],
    });
    context.engine.assessments.push(
      {disposition: 'reverse_possible', reverseIntents: [reverseCompleted, reverseActive]},
      {disposition: 'reverse_possible', reverseIntents: [reverseCompleted, reverseActive]},
    );
    let applyCalls = 0;
    let phaseBatchFingerprint = '';
    const completedEvidence = {
      operationId: 'reverse-completed', createdBlockIds: [], revision: prefix.revision,
      afterSnapshotHash: prefix.canonicalHash, verified: true as const,
    };
    context.engine.applyImpl = async ({batch, journal}) => {
      applyCalls += 1;
      if (applyCalls === 1) {
        phaseBatchFingerprint = batch.fingerprint;
        await journal.recordVerified(completedEvidence);
        context.engine.snapshots.set('target-url', partial);
        throw new PartialMutationError({
          batchFingerprint: batch.fingerprint, beforeSnapshotHash: batch.beforeSnapshotHash,
          lastObservedRevision: partial.revision, lastObservedSnapshotHash: partial.canonicalHash,
          completedOperations: [completedEvidence],
          failedOperation: {operationId: 'reverse-active', kind: 'assert', message: 'active reverse partially wrote'},
          pendingOperationIds: [], createdBlockIds: [], recoveryDisposition: 'reverse_possible',
        });
      }
      const evidence = {
        operationId: 'undo-active', createdBlockIds: [], revision: prefix.revision,
        afterSnapshotHash: prefix.canonicalHash, verified: true as const,
      };
      await journal.recordVerified(evidence);
      context.engine.snapshots.set('target-url', prefix);
      return {finalSnapshot: prefix, operations: [evidence]};
    };

    const initialPreview = await context.workflows.previewReverse(plan.runId);
    await expect(context.workflows.reversePartial(plan.runId, initialPreview.approvalToken)).rejects.toMatchObject({type: 'partial_write'});
    context.engine.assessments.push(
      {disposition: 'reverse_possible', reverseIntents: [undoActive]},
      {disposition: 'reverse_possible', reverseIntents: [undoActive]},
    );
    const actionPreview = await context.workflows.previewReverse(plan.runId);
    expect(actionPreview).toMatchObject({
      restoreTargetHash: prefix.canonicalHash,
      currentTargetHash: partial.canonicalHash,
    });
    await expect(context.workflows.reversePartial(plan.runId, actionPreview.approvalToken)).resolves.toMatchObject({
      state: 'partial', restoredTargetHash: prefix.canonicalHash,
    });
    const remaining = (await context.registry.getRun(plan.runId))!;
    expect(remaining).toMatchObject({
      state: 'partial',
      metadata: {
        recoveryPhaseRef: expect.any(Object),
        recoveryPhaseBatchFingerprint: phaseBatchFingerprint,
        reverseEngineEvidence: [expect.objectContaining({operationId: 'reverse-completed'})],
        recoveryPhaseActiveOperationReversed: true,
      },
    });
    expect(remaining.metadata?.recoveryPhaseResolved).not.toBe(true);
    expect(remaining.metadata?.reversePartialMutationEvidence).toBeUndefined();

    context.engine.assessments.push({
      disposition: 'resume_possible', completedOperationIds: ['reverse-completed'], pendingOperationIds: ['reverse-active'],
    });
    await expect(context.workflows.inspectRecovery(plan.runId)).resolves.toMatchObject({
      disposition: 'resume_possible', batchFingerprint: phaseBatchFingerprint,
      completedOperationIds: ['reverse-completed'],
    });
  });

  it('keeps a v3 run partial after reversing only the active operation beyond a completed prefix', async () => {
    const context = await workflowContext();
    const target = snapshot('target', '4', '指南');
    context.engine.snapshots.set('target-url', target);
    const originalBatch = context.engine.prepare({
      snapshot: target, idempotencyNamespace: 'run-engine-prefix',
      operations: [{
        operationId: 'completed', kind: 'assert', target: {kind: 'snapshot-block', blockId: target.rootBlockId},
        expectedHash: target.nodes[0]!.canonicalHash,
      }, {
        operationId: 'active', kind: 'assert', target: {kind: 'snapshot-block', blockId: target.rootBlockId},
        expectedHash: target.nodes[0]!.canonicalHash,
      }],
    });
    const completedEvidence = {
      operationId: 'completed', createdBlockIds: [], revision: '4',
      afterSnapshotHash: target.canonicalHash, verified: true as const, outputs: [],
    };
    const reverseIntent = {operationId: 'reverse-active', kind: 'assert' as const, blockId: target.rootBlockId, expectedHash: target.nodes[0]!.canonicalHash};
    const plan: LocalizationPlan = {
      planVersion: 3, runId: 'run-engine-prefix', pairId: 'pair-engine-prefix',
      sourceRevision: 1, targetRevision: 4, sourceHash: 'source', targetHash: target.canonicalHash, operations: [],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const previewBundleRef = await context.snapshots.putBundle({runId: plan.runId, files: {'prepared-batch.json': JSON.stringify(originalBatch)}});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.snapshot.json': JSON.stringify(target)}});
    const engineEvidenceRef = await context.snapshots.putBundle({runId: plan.runId, files: {'apply-evidence.json': JSON.stringify([completedEvidence])}});
    await savePlanRun(context, plan, 'partial', {
      documentHashDomain: 'docx-engine-v1', previewBundleRef, prewriteRef,
      engineBatchFingerprint: originalBatch.fingerprint, engineEvidence: [completedEvidence], engineEvidenceRef,
    });
    context.engine.assessments.push(
      {disposition: 'reverse_possible', reverseIntents: [reverseIntent]},
      {disposition: 'reverse_possible', reverseIntents: [reverseIntent]},
    );
    context.engine.applyImpl = async ({journal}) => {
      const evidence = {operationId: 'reverse-active', createdBlockIds: [], revision: '4', afterSnapshotHash: target.canonicalHash, verified: true as const};
      await journal.recordVerified(evidence);
      return {finalSnapshot: target, operations: [evidence]};
    };

    const preview = await context.workflows.previewReverse(plan.runId);
    await expect(context.workflows.reversePartial(plan.runId, preview.approvalToken)).resolves.toMatchObject({state: 'partial'});
    const stored = await context.registry.getRun(plan.runId);
    expect(stored).toMatchObject({state: 'partial', metadata: {activeOperationReversed: true}});
    expect(stored?.metadata).not.toHaveProperty('recoveryCompleted');
  });

  it('previews and executes a legacy inserted-block reversal only through an Engine schema-v2 batch', async () => {
    const context = await workflowContext();
    const prewriteXml = '<title id="target">指南</title>';
    const currentXml = `${prewriteXml}<p id="inserted">新增 <code>curl</code>。</p>`;
    const currentSnapshot = snapshot('target', '5', '指南', [{
      block_id: 'inserted', parent_id: 'target', block_type: 2,
      text: {elements: [
        {text_run: {content: '新增 ', text_element_style: {}}},
        {text_run: {content: 'curl', text_element_style: {inline_code: true}}},
        {text_run: {content: '。', text_element_style: {}}},
      ]},
    }]);
    const restoredSnapshot = snapshot('target', '6', '指南');
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: currentXml});
    context.engine.snapshots.set('target-url', currentSnapshot);
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-insert-partial', pairId: 'pair-legacy-reverse',
      sourceRevision: 2, targetRevision: 4, sourceHash: 'source',
      targetHash: parseFeishuDocument(prewriteXml, {documentId: 'target', revisionId: 4}).canonicalHash,
      operations: [{
        operationId: 'insert-new', kind: 'insert', confidence: 'high', policy: 'translation',
        proposedText: '新增 `curl`。', targetNodeKind: 'paragraph', anchorBlockId: 'target',
      }],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const prewriteRef = await context.snapshots.putBundle({
      runId: plan.runId, files: {'target-prewrite.xml': prewriteXml},
    });
    const currentLegacy = parseFeishuDocument(currentXml, {documentId: 'target', revisionId: 5});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef,
      appliedOperations: 1,
      lastVerifiedTargetHash: currentLegacy.canonicalHash,
      applyLog: [{
        operationId: 'insert-new', kind: 'insert', policy: 'translation',
        resolvedBlockId: 'inserted', resolvedBlockIds: ['inserted'], targetHash: currentLegacy.canonicalHash,
      }],
    });
    context.engine.applyImpl = async ({batch, journal}) => {
      expect(batch.schemaVersion).toBe(2);
      expect(batch.steps).toEqual([
        expect.objectContaining({operationId: 'legacy-reverse:insert-new', kind: 'delete'}),
      ]);
      await journal.recordVerified({
        operationId: 'legacy-reverse:insert-new', createdBlockIds: [], revision: '6',
        afterSnapshotHash: restoredSnapshot.canonicalHash, verified: true, outputs: [],
      });
      context.docs.documents.set('target-url', {documentId: 'target', revisionId: 6, content: prewriteXml});
      context.engine.snapshots.set('target-url', restoredSnapshot);
      return {finalSnapshot: restoredSnapshot, operations: [{
        operationId: 'legacy-reverse:insert-new', createdBlockIds: [], revision: '6',
        afterSnapshotHash: restoredSnapshot.canonicalHash, verified: true, outputs: [],
      }]};
    };

    const first = await context.workflows.previewReverse(plan.runId);
    const second = await context.workflows.previewReverse(plan.runId);
    expect(first).toMatchObject({
      batchFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      engineSchemaVersion: 2,
    });
    expect(second.approvalToken).toBe(first.approvalToken);
    await context.workflows.reversePartial(plan.runId, first.approvalToken);

    expect(context.docs.mutations).toEqual([]);
    expect(await context.registry.getRun(plan.runId)).toMatchObject({state: 'blocked'});
  });

  it('marks legacy recovery partial when post-write Engine verification fails', async () => {
    const context = await workflowContext();
    const prewriteXml = '<title id="target">指南</title>';
    const currentXml = `${prewriteXml}<p id="inserted">新增。</p>`;
    const currentSnapshot = snapshot('target', '5', '指南', [{
      block_id: 'inserted', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '新增。', text_element_style: {}}}]},
    }]);
    const restoredSnapshot = snapshot('target', '6', '指南');
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: currentXml});
    context.engine.snapshots.set('target-url', currentSnapshot);
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-postwrite-failure', pairId: 'pair-postwrite-failure',
      sourceRevision: 2, targetRevision: 4, sourceHash: 'source', targetHash: 'target',
      operations: [{
        operationId: 'insert-new', kind: 'insert', confidence: 'high', policy: 'translation',
        proposedText: '新增。', targetNodeKind: 'paragraph', anchorBlockId: 'target',
      }],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': prewriteXml}});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, appliedOperations: 1,
      lastVerifiedTargetHash: parseFeishuDocument(currentXml, {documentId: 'target', revisionId: 5}).canonicalHash,
      applyLog: [{operationId: 'insert-new', kind: 'insert', policy: 'translation', resolvedBlockId: 'inserted', resolvedBlockIds: ['inserted'], targetHash: 'current'}],
    });
    context.engine.applyImpl = async ({journal}) => {
      const evidence = {
        operationId: 'legacy-reverse:insert-new', createdBlockIds: [], revision: '6',
        afterSnapshotHash: restoredSnapshot.canonicalHash, verified: true as const, outputs: [],
      };
      await journal.recordVerified(evidence);
      context.engine.snapshots.delete('target-url');
      return {finalSnapshot: restoredSnapshot, operations: [evidence]};
    };

    const preview = await context.workflows.previewReverse(plan.runId);
    await expect(context.workflows.reversePartial(plan.runId, preview.approvalToken)).rejects.toThrow('Missing snapshot target-url');

    expect(await context.registry.getRun(plan.runId)).toMatchObject({
      state: 'partial',
      metadata: {reverseEngineEvidence: [expect.objectContaining({operationId: 'legacy-reverse:insert-new'})]},
    });
  });

  it('persists and inspects an immutable recovery-phase checkpoint after reverse partially writes', async () => {
    const context = await workflowContext();
    const prewriteXml = '<title id="target">指南</title>';
    const currentXml = `${prewriteXml}<p id="inserted">新增。</p>`;
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: currentXml});
    context.engine.snapshots.set('target-url', snapshot('target', '5', '指南', [{
      block_id: 'inserted', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '新增。', text_element_style: {}}}]},
    }]));
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-recovery-partial', pairId: 'pair-recovery-partial',
      sourceRevision: 2, targetRevision: 4, sourceHash: 'source', targetHash: 'target',
      operations: [{operationId: 'insert-new', kind: 'insert', confidence: 'high', policy: 'translation', proposedText: '新增。', targetNodeKind: 'paragraph', anchorBlockId: 'target'}],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': prewriteXml}});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, appliedOperations: 1,
      lastVerifiedTargetHash: parseFeishuDocument(currentXml, {documentId: 'target', revisionId: 5}).canonicalHash,
      applyLog: [{operationId: 'insert-new', kind: 'insert', policy: 'translation', resolvedBlockId: 'inserted', resolvedBlockIds: ['inserted'], targetHash: 'current'}],
    });
    context.engine.applyImpl = async ({batch}) => {
      throw new PartialMutationError({
        batchFingerprint: batch.fingerprint,
        beforeSnapshotHash: batch.beforeSnapshotHash,
        lastObservedRevision: '6',
        lastObservedSnapshotHash: 'partial-recovery-snapshot',
        completedOperations: [],
        failedOperation: {operationId: batch.steps[0]!.operationId, kind: batch.steps[0]!.kind, message: 'partial reverse'},
        pendingOperationIds: [],
        createdBlockIds: [],
        recoveryDisposition: 'manual_inspection_required',
      });
    };

    const preview = await context.workflows.previewReverse(plan.runId);
    await expect(context.workflows.reversePartial(plan.runId, preview.approvalToken)).rejects.toMatchObject({
      type: 'partial_write', subtype: 'legacy_reverse_engine_partial',
    });
    const partialRun = (await context.registry.getRun(plan.runId))!;
    expect(partialRun).toMatchObject({
      state: 'partial',
      metadata: {
        recoveryPhaseRef: expect.any(Object),
        recoveryPhaseBatchFingerprint: preview.batchFingerprint,
        reversePartialMutationEvidence: expect.objectContaining({batchFingerprint: preview.batchFingerprint}),
      },
    });
    const checkpoint = await context.snapshots.getBundle(partialRun.metadata!.recoveryPhaseRef as Parameters<LocalSnapshotStore['getBundle']>[0]);
    expect(checkpoint.files).toMatchObject({
      'prepared-batch.json': expect.stringContaining(preview.batchFingerprint!),
      'target-prewrite.snapshot.json': expect.stringContaining('inserted'),
      'apply-evidence.json': '[]\n',
      'partial-mutation-evidence.json': expect.stringContaining('partial reverse'),
    });

    context.engine.assessments.push({disposition: 'manual_inspection_required', reason: 'recovery_phase_partial'});
    await expect(context.workflows.inspectRecovery(plan.runId)).resolves.toMatchObject({
      disposition: 'manual_inspection_required', reason: 'recovery_phase_partial',
      batchFingerprint: preview.batchFingerprint,
    });
    expect(context.engine.assessmentInputs.at(-1)).toMatchObject({
      batch: {fingerprint: preview.batchFingerprint},
      checkpoint: {partialMutationEvidence: {batchFingerprint: preview.batchFingerprint}},
    });

    const undoPartialReverse = {
      operationId: 'undo-legacy-partial-reverse', kind: 'assert' as const,
      blockId: 'target', expectedHash: context.engine.snapshots.get('target-url')!.nodes[0]!.canonicalHash,
    };
    context.engine.assessments.push(
      {disposition: 'reverse_possible', reverseIntents: [undoPartialReverse]},
      {disposition: 'reverse_possible', reverseIntents: [undoPartialReverse]},
    );
    context.engine.applyImpl = async ({batch, journal}) => {
      const restored = context.engine.snapshots.get('target-url')!;
      const evidence = {
        operationId: 'undo-legacy-partial-reverse', createdBlockIds: [], revision: restored.revision,
        afterSnapshotHash: restored.canonicalHash, verified: true as const,
      };
      await journal.recordVerified(evidence);
      return {finalSnapshot: restored, operations: [evidence]};
    };
    const actionPreview = await context.workflows.previewReverse(plan.runId);
    await expect(context.workflows.reversePartial(plan.runId, actionPreview.approvalToken)).resolves.toMatchObject({
      state: 'partial', restoredTargetHash: actionPreview.restoreTargetHash,
    });
    expect((await context.registry.getRun(plan.runId))?.metadata).toMatchObject({recoveryPhaseResolved: true});
  });

  it('restores adjacent legacy deletions as one ordered Engine insertion', async () => {
    const context = await workflowContext();
    const prewriteXml = '<title id="target">指南</title><p id="deleted-a">第一段。</p><p id="deleted-b">第二段。</p><p id="successor">后续。</p>';
    const currentXml = '<title id="target">指南</title><p id="successor">后续。</p>';
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: currentXml});
    context.engine.snapshots.set('target-url', snapshot('target', '5', '指南', [{
      block_id: 'successor', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '后续。', text_element_style: {}}}]},
    }]));
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-adjacent-deletes', pairId: 'pair-adjacent-deletes',
      sourceRevision: 2, targetRevision: 4, sourceHash: 'source', targetHash: 'target',
      operations: [
        {operationId: 'delete-a', kind: 'delete', confidence: 'high', policy: 'delete', proposedText: 'DELETE', targetNodeKind: 'paragraph', targetBlockId: 'deleted-a'},
        {operationId: 'delete-b', kind: 'delete', confidence: 'high', policy: 'delete', proposedText: 'DELETE', targetNodeKind: 'paragraph', targetBlockId: 'deleted-b'},
      ],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': prewriteXml}});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, appliedOperations: 2,
      lastVerifiedTargetHash: parseFeishuDocument(currentXml, {documentId: 'target', revisionId: 5}).canonicalHash,
      applyLog: [
        {operationId: 'delete-a', kind: 'delete', policy: 'delete', targetHash: 'after-a'},
        {operationId: 'delete-b', kind: 'delete', policy: 'delete', targetHash: 'after-b'},
      ],
    });

    await context.workflows.previewReverse(plan.runId);

    expect(context.engine.prepared.at(-1)?.steps).toEqual([
      expect.objectContaining({
        kind: 'insert',
        intent: expect.objectContaining({
          after: {kind: 'snapshot-block', blockId: 'target'},
          before: {kind: 'snapshot-block', blockId: 'successor'},
          desired: [
            {kind: 'paragraph', content: [{kind: 'text', text: '第一段。'}]},
            {kind: 'paragraph', content: [{kind: 'text', text: '第二段。'}]},
          ],
        }),
      }),
    ]);
  });

  it('restores a deleted first body block with rich inline content at the exact Engine boundary', async () => {
    const context = await workflowContext();
    const prewriteXml = '<title id="target">指南</title><p id="deleted">运行 <code>curl</code>。</p><p id="successor">下一步。</p>';
    const currentXml = '<title id="target">指南</title><p id="successor">下一步。</p>';
    const currentSnapshot = snapshot('target', '5', '指南', [{
      block_id: 'successor', parent_id: 'target', block_type: 2,
      text: {elements: [{text_run: {content: '下一步。', text_element_style: {}}}]},
    }]);
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: currentXml});
    context.engine.snapshots.set('target-url', currentSnapshot);
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-delete-partial', pairId: 'pair-legacy-first-body',
      sourceRevision: 2, targetRevision: 4, sourceHash: 'source', targetHash: 'target-before',
      operations: [{
        operationId: 'delete-old', kind: 'delete', confidence: 'high', policy: 'delete',
        proposedText: 'DELETE', targetNodeKind: 'paragraph', targetBlockId: 'deleted',
      }],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': prewriteXml}});
    const currentLegacy = parseFeishuDocument(currentXml, {documentId: 'target', revisionId: 5});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, appliedOperations: 1, lastVerifiedTargetHash: currentLegacy.canonicalHash,
      applyLog: [{operationId: 'delete-old', kind: 'delete', policy: 'delete', targetHash: currentLegacy.canonicalHash}],
    });

    const preview = await context.workflows.previewReverse(plan.runId);
    expect(preview).toMatchObject({engineSchemaVersion: 2, batchFingerprint: expect.any(String)});
    const batch = context.engine.prepared.at(-1)!;
    expect(batch.schemaVersion).toBe(2);
    expect(batch.steps[0]).toMatchObject({
      operationId: 'legacy-reverse:delete-old',
      kind: 'insert',
      intent: {
        parent: {kind: 'snapshot-block', blockId: 'target'},
        after: {kind: 'snapshot-block', blockId: 'target'},
        before: {kind: 'snapshot-block', blockId: 'successor'},
        desired: [{
          kind: 'paragraph',
          content: [
            {kind: 'text', text: '运行 '},
            {kind: 'code', text: 'curl'},
            {kind: 'text', text: '。'},
          ],
        }],
      },
    });
  });

  it('compiles a one-root legacy list restoration as replace-range', async () => {
    const context = await workflowContext();
    const prewriteXml = '<title id="target">指南</title><ul><li id="list-item">旧项目。</li></ul>';
    const currentXml = '<title id="target">指南</title><ul><li id="list-item">新项目。</li></ul>';
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: currentXml});
    context.engine.snapshots.set('target-url', snapshot('target', '5', '指南', [{
      block_id: 'list-item', parent_id: 'target', block_type: 12,
      bullet: {elements: [{text_run: {content: '新项目。', text_element_style: {}}}]},
    }]));
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-list-replace', pairId: 'pair-list-replace',
      sourceRevision: 2, targetRevision: 4, sourceHash: 'source', targetHash: 'target',
      operations: [{
        operationId: 'replace-list', kind: 'replace', confidence: 'high', policy: 'translation',
        proposedText: '新项目。', targetNodeKind: 'list', targetBlockId: 'list-item', targetBlockIds: ['list-item'],
      }],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': prewriteXml}});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, appliedOperations: 1,
      lastVerifiedTargetHash: parseFeishuDocument(currentXml, {documentId: 'target', revisionId: 5}).canonicalHash,
      applyLog: [{operationId: 'replace-list', kind: 'replace', policy: 'translation', resolvedBlockId: 'list-item', resolvedBlockIds: ['list-item'], targetHash: 'current'}],
    });

    await context.workflows.previewReverse(plan.runId);

    expect(context.engine.prepared.at(-1)?.steps[0]).toMatchObject({
      kind: 'replace-range',
      intent: {targets: [{ref: {kind: 'snapshot-block', blockId: 'list-item'}}]},
    });
  });

  it('bridges legacy and Engine Whiteboard hashes without calling the legacy updater', async () => {
    const context = await workflowContext();
    const targetXml = '<title id="target">指南</title><whiteboard id="board" token="target-board"></whiteboard>';
    const oldRaw = {nodes: [{id: 'old', type: 'text_shape', text: 'Old'}]};
    const currentRaw = {nodes: [{id: 'new', type: 'text_shape', text: 'New'}]};
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: targetXml});
    context.engine.snapshots.set('target-url', snapshot('target', '5', '指南', [{
      block_id: 'board', parent_id: 'target', block_type: 43, board: {token: 'target-board'},
    }]));
    context.whiteboards.values.set('target-board', currentRaw);
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-board-partial', pairId: 'pair-legacy-board',
      sourceRevision: 2, targetRevision: 5, sourceHash: 'source', targetHash: 'target',
      operations: [{
        operationId: 'board-op', kind: 'replace', confidence: 'high', policy: 'whiteboard_mirror',
        proposedText: '', targetNodeKind: 'whiteboard', targetBlockId: 'board', targetResourceToken: 'target-board',
      }],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': targetXml}});
    const resourceRef = await context.snapshots.putBundle({runId: plan.runId, files: {'whiteboard-board-op-prewrite.json': JSON.stringify(oldRaw)}});
    const current = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 5});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, appliedOperations: 1, lastVerifiedTargetHash: current.canonicalHash,
      applyLog: [{
        operationId: 'board-op', kind: 'replace', policy: 'whiteboard_mirror', targetHash: current.canonicalHash,
        targetResourceToken: 'target-board', sourceResourceHash: canonicalWhiteboard(currentRaw).hash,
        targetResourcePrewriteRef: resourceRef, targetResourcePrewriteHash: canonicalWhiteboard(oldRaw).hash,
      }],
    });

    const preview = await context.workflows.previewReverse(plan.runId);
    expect(preview).toMatchObject({engineSchemaVersion: 2, batchFingerprint: expect.any(String)});
    const batch = context.engine.prepared.at(-1)!;
    expect(batch.steps[0]).toMatchObject({
      kind: 'whiteboard-overwrite',
      intent: {
        target: {ref: {kind: 'snapshot-block', blockId: 'board'}, token: 'target-board'},
        content: {kind: 'raw', value: oldRaw},
      },
    });
    expect(canonicalWhiteboardRawHash(oldRaw)).not.toBe(canonicalWhiteboard(oldRaw).hash);
    expect(context.whiteboards.updates).toEqual([]);
  });

  it('uses an Engine assertion to finalize an already-restored legacy Whiteboard recovery', async () => {
    const context = await workflowContext();
    const targetXml = '<title id="target">指南</title><whiteboard id="board" token="target-board"></whiteboard>';
    const oldRaw = {nodes: [{id: 'old', type: 'text_shape', text: 'Old'}]};
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 5, content: targetXml});
    context.engine.snapshots.set('target-url', snapshot('target', '5', '指南', [{block_id: 'board', parent_id: 'target', block_type: 43, board: {token: 'target-board'}}]));
    context.whiteboards.values.set('target-board', oldRaw);
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-board-restored', pairId: 'pair-board-restored',
      sourceRevision: 2, targetRevision: 5, sourceHash: 'source', targetHash: 'target',
      operations: [{operationId: 'board-op', kind: 'replace', confidence: 'high', policy: 'whiteboard_mirror', proposedText: '', targetNodeKind: 'whiteboard', targetBlockId: 'board'}],
    };
    await context.registry.savePair({pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url', targetDocUrl: 'target-url', mode: 'mirror', status: 'active'});
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': targetXml}});
    const resourceRef = await context.snapshots.putBundle({runId: plan.runId, files: {'whiteboard-board-op-prewrite.json': JSON.stringify(oldRaw)}});
    const current = parseFeishuDocument(targetXml, {documentId: 'target', revisionId: 5});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, appliedOperations: 1, lastVerifiedTargetHash: current.canonicalHash,
      applyLog: [{operationId: 'board-op', kind: 'replace', policy: 'whiteboard_mirror', targetHash: current.canonicalHash, targetResourceToken: 'target-board', sourceResourceHash: 'different-new-hash', targetResourcePrewriteRef: resourceRef, targetResourcePrewriteHash: canonicalWhiteboard(oldRaw).hash}],
    });

    await context.workflows.previewReverse(plan.runId);

    expect(context.engine.prepared.at(-1)?.steps).toEqual([
      expect.objectContaining({kind: 'assert', operationId: 'legacy-reverse:verify-restored-resources'}),
    ]);
  });

  it('does not require prewrite resource evidence for an inserted Whiteboard', async () => {
    const context = await workflowContext();
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-inserted-board', pairId: 'pair-inserted-board',
      sourceRevision: 2, targetRevision: 5, sourceHash: 'source', targetHash: 'target',
      operations: [{operationId: 'insert-board', kind: 'insert', confidence: 'high', policy: 'whiteboard_mirror', proposedText: '', targetNodeKind: 'whiteboard', anchorBlockId: 'target'}],
    };
    await savePlanRun(context, plan, 'partial', {
      applyLog: [{operationId: 'insert-board', kind: 'insert', policy: 'whiteboard_mirror', targetResourceToken: 'created-board'}],
    });
    const run = (await context.registry.getRun(plan.runId))!;

    await expect(verifyLegacyRecoveryResources({
      run, snapshots: context.snapshots, whiteboards: context.whiteboards,
    })).resolves.toBeUndefined();
  });

  it('resolves a legacy manual placeholder to the actual native reference before Engine reverse', async () => {
    const context = await workflowContext();
    const marker = 'ZDOC-MANUAL-SYNC:manual-sync';
    const prewriteXml = '<title id="target">指南</title>';
    const postAutomaticXml = `${prewriteXml}<callout id="placeholder"><p>${marker}</p></callout>`;
    const currentXml = `${prewriteXml}<synced_reference id="actual-reference" src-token="source" src-block-id="sync-source"></synced_reference>`;
    context.docs.documents.set('target-url', {documentId: 'target', revisionId: 6, content: currentXml});
    context.engine.snapshots.set('target-url', snapshot('target', '6', '指南', [{
      block_id: 'actual-reference', parent_id: 'target', block_type: 18,
      reference_synced: {source_document_id: 'source', source_block_id: 'sync-source'},
    }]));
    const plan: LocalizationPlan = {
      planVersion: 2, runId: 'legacy-manual-reverse', pairId: 'pair-legacy-manual',
      sourceRevision: 2, targetRevision: 4, sourceHash: 'source', targetHash: 'target',
      operations: [{
        operationId: 'manual-sync', kind: 'insert', confidence: 'high', policy: 'manual_synced_reference',
        proposedText: marker, targetNodeKind: 'synced_reference', anchorBlockId: 'target',
        sourceNodeId: 'source-node', sourceDocumentId: 'source', sourceBlockId: 'sync-source',
      }],
    };
    await context.registry.savePair({
      pairId: plan.pairId, sourceLocale: 'en', targetLocale: 'zh-CN', sourceDocUrl: 'source-url',
      targetDocUrl: 'target-url', mode: 'mirror', status: 'active',
    });
    const prewriteRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-prewrite.xml': prewriteXml}});
    const postAutomaticRef = await context.snapshots.putBundle({runId: plan.runId, files: {'target-after-automatic-apply.xml': postAutomaticXml}});
    await savePlanRun(context, plan, 'partial', {
      prewriteRef, postAutomaticRef, appliedOperations: 1,
      lastVerifiedTargetHash: parseFeishuDocument(currentXml, {documentId: 'target', revisionId: 6}).canonicalHash,
      applyLog: [{operationId: 'manual-sync', kind: 'insert', policy: 'manual_synced_reference', resolvedBlockId: 'placeholder', resolvedBlockIds: ['placeholder'], targetHash: 'post-auto'}],
      manualActions: [{
        operationId: 'manual-sync', marker, placeholderBlockId: 'placeholder', sourceNodeId: 'source-node',
        sourceDocumentId: 'source', sourceBlockId: 'sync-source', sourceUrl: 'source-url#sync-source',
      }],
    });
    await context.registry.saveRun({...await context.registry.getRun(plan.runId)!, state: 'manual_action_required'});

    await context.workflows.previewReverse(plan.runId);

    expect(context.engine.prepared.at(-1)?.steps[0]).toMatchObject({
      kind: 'delete',
      intent: {targets: [{ref: {blockId: 'actual-reference'}}]},
    });
  });
});
