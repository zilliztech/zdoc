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
});
