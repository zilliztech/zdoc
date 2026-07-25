import {describe, expect, it} from 'vitest';

import {
  compileReview,
  parseReview,
  type LocalizationPlan,
} from '../src/domain/review.js';

const plan: LocalizationPlan = {
  planVersion: 1,
  runId: 'run-1',
  pairId: 'pair-1',
  sourceRevision: 4,
  targetRevision: 7,
  sourceHash: 'source-hash',
  targetHash: 'target-hash',
  operations: [{
    operationId: 'op-1',
    kind: 'replace',
    confidence: 'high',
    sourceBefore: 'Old English.',
    sourceAfter: 'New English.',
    targetCurrent: '当前中文。',
    proposedText: '建议中文。',
    targetNodeKind: 'paragraph',
    targetNodeId: 'section:paragraph:0',
    targetBlockId: 'blk-target',
    targetNodeHash: 'target-node-hash',
  }],
};

describe('review artifacts', () => {
  it('round-trips edited translation text without changing operation topology', () => {
    const review = compileReview(plan);
    const edited = review.replace('建议中文。', '人工修改后的中文。');

    expect(parseReview(edited, plan)).toEqual({
      planHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      operations: [{operationId: 'op-1', approvedText: '人工修改后的中文。'}],
    });
  });

  it.each([
    ['removed marker', (review: string) => review.replace('<!-- END EDITABLE TRANSLATION op:op-1 -->', '')],
    ['unknown operation', (review: string) => review.replaceAll('op:op-1', 'op:unknown')],
    ['edited metadata', (review: string) => review.replace('Confidence: high', 'Confidence: low')],
    ['blank translation', (review: string) => review.replace('建议中文。', '   ')],
  ])('rejects %s', (_label, mutate) => {
    expect(() => parseReview(mutate(compileReview(plan)), plan)).toThrowError(
      expect.objectContaining({type: 'validation'}),
    );
  });

  it('requires DELETE to remain explicit for a deletion operation', () => {
    const deletionPlan: LocalizationPlan = {
      ...plan,
      operations: [{
        ...plan.operations[0]!,
        operationId: 'op-delete',
        kind: 'delete',
        proposedText: 'DELETE',
      }],
    };
    const review = compileReview(deletionPlan);

    expect(parseReview(review, deletionPlan).operations).toEqual([
      {operationId: 'op-delete', decision: 'delete'},
    ]);
    expect(() => parseReview(review.replace('DELETE', 'KEEP'), deletionPlan)).toThrowError(
      expect.objectContaining({subtype: 'delete_review_changed'}),
    );
  });

  it('keeps version-2 non-translation operations protected and non-editable', () => {
    const planV2: LocalizationPlan = {
      planVersion: 2,
      runId: 'run-v2',
      pairId: 'pair-v2',
      sourceRevision: 4,
      targetRevision: 7,
      sourceHash: 'source-hash',
      targetHash: 'target-hash',
      operations: [
        {
          operationId: 'translate-1',
          policy: 'translation',
          effect: 'write',
          kind: 'insert',
          confidence: 'high',
          sourceAfter: 'Hello.',
          proposedText: '你好。',
          targetNodeKind: 'paragraph',
          anchorBlockId: 'target-doc',
        },
        {
          operationId: 'code-1',
          policy: 'verbatim_code',
          effect: 'write',
          kind: 'insert',
          confidence: 'high',
          sourceAfter: 'print(1)',
          proposedText: 'print(1)',
          targetNodeKind: 'code',
          anchorOperationId: 'translate-1',
        },
        {
          operationId: 'board-1',
          policy: 'whiteboard_mirror',
          effect: 'mirror',
          kind: 'insert',
          confidence: 'high',
          proposedText: '',
          targetNodeKind: 'whiteboard',
          sourceResourceToken: 'board-source',
        },
        {
          operationId: 'sync-1',
          policy: 'manual_synced_reference',
          effect: 'manual',
          kind: 'insert',
          confidence: 'high',
          proposedText: '',
          targetNodeKind: 'synced_reference',
          sourceDocumentId: 'source-doc',
          sourceBlockId: 'sync-source',
        },
        {
          operationId: 'verify-1',
          policy: 'verify_synced_reference',
          effect: 'verify_only',
          kind: 'replace',
          confidence: 'high',
          proposedText: '',
          targetNodeKind: 'synced_reference',
          sourceDocumentId: 'source-doc',
          sourceBlockId: 'sync-source',
          targetBlockId: 'sync-reference',
        },
      ],
    };
    const review = compileReview(planV2);

    expect(review.match(/BEGIN EDITABLE TRANSLATION/g)).toHaveLength(1);
    expect(review).toContain('Policy: manual_synced_reference');
    expect(parseReview(review.replace('你好。', '人工修改。'), planV2).operations).toEqual([
      {operationId: 'translate-1', approvedText: '人工修改。'},
      {operationId: 'code-1', decision: 'protected'},
      {operationId: 'board-1', decision: 'protected'},
      {operationId: 'sync-1', decision: 'protected'},
      {operationId: 'verify-1', decision: 'protected'},
    ]);
    expect(() => parseReview(
      review.replace('Source block: sync-source', 'Source block: other'),
      planV2,
    )).toThrowError(expect.objectContaining({subtype: 'review_metadata_changed'}));
  });

  it('renders and parses immutable plan-v3 list and table slots', () => {
    const planV3: LocalizationPlan = {
      planVersion: 3,
      runId: 'run-v3',
      pairId: 'pair-v3',
      sourceRevision: 44,
      targetRevision: 4,
      sourceHash: 'source-v3',
      targetHash: 'target-v3',
      operations: [
        {
          operationId: 'op-list',
          policy: 'translation',
          effect: 'write',
          kind: 'insert',
          confidence: 'high',
          proposedText: '创建账户\n生成令牌',
          targetNodeKind: 'list',
          structured: {
            kind: 'list',
            topologyHash: '1'.repeat(64),
            sourceStructure: {
              kind: 'list',
              ordered: true,
              items: [{
                content: [{kind: 'text', text: 'Create an account'}],
                children: [{
                  ordered: false,
                  items: [{
                    content: [{kind: 'text', text: 'Generate a token', bold: true}],
                    children: [],
                  }],
                }],
              }],
            },
            slots: [
              {slotId: 'item-0/text', sourceText: 'Create an account', proposedText: '创建账户', preserved: []},
              {
                slotId: 'item-0/child-0/item-0/text',
                sourceText: '**Generate a token**',
                targetCurrent: '**生成旧令牌**',
                proposedText: '**生成令牌**',
                preserved: [{kind: 'bold_span', value: '', count: 1}],
              },
            ],
          },
        },
        {
          operationId: 'op-table',
          policy: 'translation',
          effect: 'write',
          kind: 'insert',
          confidence: 'high',
          proposedText: '模型 ID\n描述',
          targetNodeKind: 'table',
          structured: {
            kind: 'table',
            topologyHash: '2'.repeat(64),
            sourceStructure: {
              kind: 'table',
              rows: [
                {cells: [
                  {content: [{kind: 'paragraph', content: [{kind: 'text', text: 'Parameter', bold: true}]}]},
                  {content: [{kind: 'paragraph', content: [{kind: 'text', text: 'Description', bold: true}]}]},
                ]},
                {cells: [
                  {content: [{kind: 'code', language: 'text', text: 'model_name'}]},
                  {content: [{kind: 'paragraph', content: [{kind: 'text', text: 'Model ID'}]}]},
                ]},
              ],
            },
            slots: [
              {
                slotId: 'row-0/cell-0/paragraph-0',
                sourceText: '**Parameter**',
                proposedText: '**参数**',
                preserved: [{kind: 'bold_span', value: '', count: 1}],
              },
              {
                slotId: 'row-0/cell-1/paragraph-0',
                sourceText: '**Description**',
                proposedText: '**描述**',
                preserved: [{kind: 'bold_span', value: '', count: 1}],
              },
              {
                slotId: 'row-1/cell-1/paragraph-0',
                sourceText: 'Model ID',
                proposedText: '模型 ID',
                preserved: [],
              },
            ],
          },
        },
        {
          operationId: 'op-code',
          policy: 'verbatim_code',
          effect: 'write',
          kind: 'insert',
          confidence: 'high',
          proposedText: 'print("hello")',
          targetNodeKind: 'code',
        },
      ],
    };
    const review = compileReview(planV3);

    expect(review).toContain('### Structured list · 2 editable slots');
    expect(review).toContain('### Structured table · 3 editable slots');
    expect(review).toContain('Rows: 2');
    expect(review).toContain('Columns: 2');
    expect(review).toContain('| Row | Cell 1 | Cell 2 |');
    expect(review).toContain('| 2 | `model_name` | Model ID |');
    expect(review).toContain('#### Proposed target structure');
    expect(review).toContain('| 2 | `model_name` | 模型 ID |');
    expect(review).toContain('1. Create an account');
    expect(review).toContain('  - **Generate a token**');
    expect(review).toContain('<!-- BEGIN EDITABLE TRANSLATION op:op-table slot:row-1/cell-1/paragraph-0 -->');
    expect(review).toContain('Protected content: print("hello")');

    const edited = review
      .replace('创建账户\n<!-- END EDITABLE TRANSLATION op:op-list slot:item-0/text -->', '注册账户\n<!-- END EDITABLE TRANSLATION op:op-list slot:item-0/text -->')
      .replace('模型 ID\n<!-- END EDITABLE TRANSLATION op:op-table slot:row-1/cell-1/paragraph-0 -->', '模型标识符\n<!-- END EDITABLE TRANSLATION op:op-table slot:row-1/cell-1/paragraph-0 -->');

    expect(parseReview(edited, planV3).operations).toEqual([
      {
        operationId: 'op-list',
        approvedSlots: [
          {slotId: 'item-0/text', approvedText: '注册账户'},
          {slotId: 'item-0/child-0/item-0/text', approvedText: '**生成令牌**'},
        ],
      },
      {
        operationId: 'op-table',
        approvedSlots: [
          {slotId: 'row-0/cell-0/paragraph-0', approvedText: '**参数**'},
          {slotId: 'row-0/cell-1/paragraph-0', approvedText: '**描述**'},
          {slotId: 'row-1/cell-1/paragraph-0', approvedText: '模型标识符'},
        ],
      },
      {operationId: 'op-code', decision: 'protected'},
    ]);

    for (const tampered of [
      review.replace('Rows: 2', 'Rows: 3'),
      review.replace('Topology hash: 2222', 'Topology hash: 9999'),
      review.replaceAll('slot:row-1/cell-1/paragraph-0', 'slot:row-9/cell-9/paragraph-9'),
      review.replace('`model_name`', '`changed_name`'),
      review.replace('Protected content: print("hello")', 'Protected content: print("changed")'),
    ]) {
      expect(() => parseReview(tampered, planV3)).toThrowError(expect.objectContaining({
        subtype: expect.stringMatching(/^review_(metadata_changed|operation_mismatch)$/),
      }));
    }
  });
});
