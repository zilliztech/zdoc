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
});
