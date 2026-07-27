import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {
  createDocumentSnapshot,
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
  DocumentReadGateway,
  LocalizationDocxEngine,
  TranslationMemory,
  TranslationMemoryEntry,
  TranslationMemoryQuery,
} from '../src/application/ports.js';
import {LocalizationWorkflows} from '../src/application/workflows.js';
import {compileReview, type LocalizationPlan} from '../src/domain/review.js';
import {structuredTopologyHash} from '../src/domain/structured-content.js';
import type {TranslationRequest} from '../src/domain/translation.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';

class MemoryTranslationMemory implements TranslationMemory {
  async recordApproved(_entry: TranslationMemoryEntry): Promise<void> {}
  async findExact(_query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined> { return undefined; }
  async close(): Promise<void> {}
}

class UnusedDocs implements DocumentReadGateway {
  async fetch(): Promise<never> { throw new Error('not used'); }
}

class PreviewEngine implements LocalizationDocxEngine {
  async snapshot(_selector: DocumentSelector): Promise<never> { throw new Error('not used'); }
  prepare(input: PrepareMutationInput): PreparedMutationBatch { return prepareMutationBatch(input); }
  async apply(_input: ApplyMutationInput): Promise<MutationOutcome> { throw new Error('not used'); }
  async assessRecovery(_input: AssessRecoveryInput): Promise<RecoveryAssessment> { throw new Error('not used'); }
}

function snapshot(): DocumentSnapshot {
  const blocks: ProviderBlock[] = [{
    block_id: 'target-doc',
    block_type: 1,
    page: {elements: [{text_run: {content: 'Temporary', text_element_style: {}}}]},
    children: [],
  }];
  return createDocumentSnapshot({documentId: 'target-doc', revision: '4', blocks});
}

function request(operationId: string, targetNodeKind: TranslationRequest['targetNodeKind']): TranslationRequest {
  return {
    operationId,
    changeKind: operationId === 'op-title' ? 'replace' : 'insert',
    sourceAfter: operationId === 'op-title' ? 'Guide' : 'Before you start',
    sectionContext: {source: '', target: ''},
    glossary: [],
    memoryExamples: [],
    preserved: [],
    linkMappings: [],
    warnings: [],
    targetNodeKind,
  };
}

describe('engine-backed apply preview', () => {
  it('persists and reuses the exact prepared schema-v2 batch', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-engine-preview-'));
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const target = snapshot();
    const title = target.nodes.find((node) => node.blockId === target.rootBlockId)!;
    const listStructure = {
      kind: 'list' as const,
      ordered: false,
      items: [{content: [{kind: 'text' as const, text: 'Before you start'}], children: []}],
    };
    const topologyHash = structuredTopologyHash(listStructure);
    const plan: LocalizationPlan = {
      planVersion: 3,
      runId: 'run-engine-preview',
      pairId: 'pair-engine-preview',
      sourceRevision: 44,
      targetRevision: 4,
      sourceHash: 'source-hash',
      targetHash: target.canonicalHash,
      operations: [{
        operationId: 'op-title', kind: 'replace', confidence: 'high', policy: 'translation',
        sourceAfter: 'Guide', proposedText: '指南', targetNodeKind: 'title',
        targetBlockId: title.blockId, targetNodeHash: title.canonicalHash,
      }, {
        operationId: 'op-list', kind: 'insert', confidence: 'high', policy: 'translation',
        sourceAfter: 'Before you start', proposedText: '', targetNodeKind: 'list',
        anchorBlockId: title.blockId, anchorNodeHash: title.canonicalHash,
        structured: {
          kind: 'list', topologyHash, sourceStructure: listStructure,
          slots: [{slotId: 'item-0/text', sourceText: 'Before you start', preserved: [], proposedText: '开始之前'}],
        },
      }],
    };
    const requests = [
      request('op-title', 'title'),
      {
        ...request('op-list', 'list'),
        structured: {
          kind: 'list' as const,
          topologyHash,
          slots: [{slotId: 'item-0/text', sourceText: 'Before you start', preserved: []}],
        },
      },
    ];
    const bundleRef = await snapshots.putBundle({
      runId: plan.runId,
      files: {
        'plan.json': `${JSON.stringify(plan, null, 2)}\n`,
        'translation-requests.json': `${JSON.stringify(requests, null, 2)}\n`,
        'target-current.snapshot.json': `${JSON.stringify(target, null, 2)}\n`,
      },
    });
    await registry.saveRun({
      runId: plan.runId,
      pairId: plan.pairId,
      state: 'review_required',
      createdAt: '2026-07-27T00:00:00.000Z',
      updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {kind: 'initialization', documentHashDomain: 'docx-engine-v1', bundleRef, plan},
    });
    const reviewPath = join(cwd, 'review.md');
    await writeFile(reviewPath, compileReview(plan), 'utf8');
    const workflows = new LocalizationWorkflows({
      cwd,
      registry,
      snapshots,
      memory: new MemoryTranslationMemory(),
      engine: new PreviewEngine(),
      docs: new UnusedDocs(),
      clock: {now: () => new Date('2026-07-27T00:00:00.000Z')},
      ids: {next: () => 'unused'},
    });

    const first = await workflows.previewApply(plan.runId, 'review.md');
    const second = await workflows.previewApply(plan.runId, 'review.md');

    expect(first).toMatchObject({
      docxEngineVersion: '0.2.0',
      engineSchemaVersion: 2,
      batchFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      approvalToken: expect.stringMatching(/^[a-f0-9]{64}$/),
      operations: [
        expect.objectContaining({operationId: 'op-title', nodeKind: 'title'}),
        expect.objectContaining({operationId: 'op-list', nodeKind: 'list', createdSubtreeCount: 1}),
      ],
    });
    expect(first.operations[0]).not.toHaveProperty('compiledXml');
    expect(second).toEqual(first);
    const storedRun = await registry.getRun(plan.runId);
    const previewBundleRef = storedRun?.metadata?.previewBundleRef as Parameters<LocalSnapshotStore['getBundle']>[0];
    const previewBundle = await snapshots.getBundle(previewBundleRef);
    expect(previewBundle.files).toMatchObject({
      'prepared-batch.json': expect.stringContaining(first.batchFingerprint),
      'approved-review.json': expect.stringContaining('op-list'),
    });
  });
});
