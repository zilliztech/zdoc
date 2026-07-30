import {
  createDocumentSnapshot,
  ENGINE_VERSION,
  prepareMutationBatch,
  type FeishuDocxEngine,
  type ProviderBlock,
} from 'feishu-docx-engine';
import {describe, expect, it} from 'vitest';

import {compileEngineBatch} from '../src/application/engine-plan.js';
import {canonicalHash} from '../src/domain/hash.js';
import type {ApprovedReview, LocalizationPlan} from '../src/domain/review.js';
import {structuredTopologyHash} from '../src/domain/structured-content.js';

function targetSnapshot() {
  const blocks: ProviderBlock[] = [{
    block_id: 'target-doc',
    block_type: 1,
    page: {elements: [{text_run: {content: 'Temporary', text_element_style: {}}}]},
    children: [],
  }];
  return createDocumentSnapshot({documentId: 'target-doc', revision: '4', blocks});
}

function plan(snapshot = targetSnapshot()): LocalizationPlan {
  const title = snapshot.nodes.find((node) => node.blockId === snapshot.rootBlockId)!;
  const listStructure = {
    kind: 'list' as const,
    ordered: false,
    items: [{
      content: [{kind: 'text' as const, text: 'Before you start'}],
      children: [{
        kind: 'paragraph' as const,
        content: [{kind: 'text' as const, text: 'Continuation detail'}],
      }],
    }],
  };
  const tableStructure = {
    kind: 'table' as const,
    columnWidths: [280],
    headerRow: true,
    rows: [{cells: [{content: [{kind: 'paragraph' as const, content: [{kind: 'text' as const, text: 'Model ID'}]}]}]}],
  };
  const calloutStructure = {
    kind: 'callout' as const,
    calloutType: 'note',
    title: 'Notes',
    presentation: {
      emoji: '📘',
      backgroundColor: 'rgb(240,244,255)',
      borderColor: 'rgb(130,167,252)',
    },
    children: [{
      kind: 'paragraph' as const,
      content: [{kind: 'text' as const, text: 'This table is not exhaustive.'}],
    }],
  };
  return {
    planVersion: 3,
    runId: 'run-structured',
    pairId: 'pair-structured',
    sourceRevision: 44,
    targetRevision: 4,
    sourceHash: 'source-hash',
    targetHash: snapshot.canonicalHash,
    operations: [{
      operationId: 'op-title',
      kind: 'replace',
      confidence: 'high',
      policy: 'translation',
      proposedText: '指南',
      targetNodeKind: 'title',
      targetBlockId: title.blockId,
      targetNodeHash: title.canonicalHash,
    }, {
      operationId: 'op-list',
      kind: 'insert',
      confidence: 'high',
      policy: 'translation',
      proposedText: '',
      targetNodeKind: 'list',
      anchorBlockId: title.blockId,
      anchorNodeHash: title.canonicalHash,
      structured: {
        kind: 'list',
        topologyHash: structuredTopologyHash(listStructure),
        sourceStructure: listStructure,
        slots: [{
          slotId: 'item-0/text',
          sourceText: 'Before you start',
          preserved: [],
          proposedText: '开始之前',
        }, {
          slotId: 'item-0/child-0/paragraph-0',
          sourceText: 'Continuation detail',
          preserved: [],
          proposedText: '续写说明',
        }],
      },
    }, {
      operationId: 'op-table',
      kind: 'insert',
      confidence: 'high',
      policy: 'translation',
      proposedText: '',
      targetNodeKind: 'table',
      anchorOperationId: 'op-list',
      structured: {
        kind: 'table',
        topologyHash: structuredTopologyHash(tableStructure),
        sourceStructure: tableStructure,
        slots: [{
          slotId: 'row-0/cell-0/paragraph-0',
          sourceText: 'Model ID',
          preserved: [],
          proposedText: '模型 ID',
        }],
      },
    }, {
      operationId: 'op-callout',
      kind: 'insert',
      confidence: 'high',
      policy: 'translation',
      proposedText: '',
      targetNodeKind: 'callout',
      anchorOperationId: 'op-table',
      structured: {
        kind: 'callout',
        topologyHash: structuredTopologyHash(calloutStructure),
        sourceStructure: calloutStructure,
        slots: [{
          slotId: 'callout/title',
          sourceText: 'Notes',
          preserved: [],
          proposedText: '说明',
        }, {
          slotId: 'callout/paragraph-0',
          sourceText: 'This table is not exhaustive.',
          preserved: [],
          proposedText: '此表并未穷举所有兼容模型。',
        }],
      },
    }],
  };
}

function approved(plan: LocalizationPlan): ApprovedReview {
  return {
    planHash: canonicalHash(plan),
    operations: [{operationId: 'op-title', approvedText: '指南'}, {
      operationId: 'op-list',
      approvedSlots: [
        {slotId: 'item-0/text', approvedText: '开始之前'},
        {slotId: 'item-0/child-0/paragraph-0', approvedText: '续写说明'},
      ],
    }, {
      operationId: 'op-table',
      approvedSlots: [{slotId: 'row-0/cell-0/paragraph-0', approvedText: '模型 ID'}],
    }, {
      operationId: 'op-callout',
      approvedSlots: [
        {slotId: 'callout/title', approvedText: '说明'},
        {slotId: 'callout/paragraph-0', approvedText: '此表并未穷举所有兼容模型。'},
      ],
    }],
  };
}

describe('Docx engine plan compilation', () => {
  it('prepares one deterministic schema-v2 batch without exposing raw XML', () => {
    const snapshot = targetSnapshot();
    const localizationPlan = plan(snapshot);
    const engine = {prepare: prepareMutationBatch} as Pick<FeishuDocxEngine, 'prepare'>;

    const compiled = compileEngineBatch({
      runId: localizationPlan.runId,
      plan: localizationPlan,
      approved: approved(localizationPlan),
      targetSnapshot: snapshot,
      engine,
    });

    expect(compiled.batch).toMatchObject({
      schemaVersion: 2,
      engineVersion: ENGINE_VERSION,
      fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(compiled.operations).toEqual([
      expect.objectContaining({operationId: 'op-title', kind: 'replace', nodeKind: 'title', createdSubtreeCount: 0}),
      expect.objectContaining({operationId: 'op-list', kind: 'insert', nodeKind: 'list', createdSubtreeCount: 2}),
      expect.objectContaining({operationId: 'op-table', kind: 'insert', nodeKind: 'table', createdSubtreeCount: 2}),
      expect.objectContaining({operationId: 'op-callout', kind: 'insert', nodeKind: 'callout', createdSubtreeCount: 2}),
    ]);
    expect(compiled.operations).not.toContainEqual(expect.objectContaining({compiledXml: expect.anything()}));
    expect(compiled.batch.steps[1]).toMatchObject({
      operationId: 'op-list',
      intent: {
        desired: [expect.objectContaining({
          kind: 'list',
          items: [expect.objectContaining({
            children: [{kind: 'paragraph', content: [{kind: 'text', text: '续写说明'}]}],
          })],
        })],
      },
    });
    expect(compiled.batch.steps[2]).toMatchObject({
      operationId: 'op-table',
      dependsOn: ['op-list'],
      intent: {after: {kind: 'operation-output', operationId: 'op-list'}},
    });
    expect(compiled.batch.steps[3]).toMatchObject({
      operationId: 'op-callout',
      dependsOn: ['op-table'],
      intent: {
        after: {kind: 'operation-output', operationId: 'op-table'},
        desired: [expect.objectContaining({
          kind: 'callout',
          title: '说明',
          presentation: {
            emoji: '📘',
            backgroundColor: 'rgb(240,244,255)',
            borderColor: 'rgb(130,167,252)',
          },
        })],
      },
    });
  });
});
