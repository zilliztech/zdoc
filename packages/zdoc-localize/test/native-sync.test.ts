import {describe, expect, it} from 'vitest';

import {normalizeCorrespondences} from '../src/domain/native-sync.js';

describe('native sync correspondences', () => {
  it('normalizes legacy content correspondences while preserving typed entries', () => {
    expect(normalizeCorrespondences([
      {sourceNodeId: 's1', targetNodeId: 't1'},
      {
        kind: 'native_sync',
        sourceNodeId: 's2',
        targetNodeId: 't2',
        sourceDocumentId: 'doc-en',
        sourceBlockId: 'sync-1',
      },
      {
        kind: 'copied_resource',
        sourceNodeId: 's3',
        targetNodeId: 't3',
        resourceKind: 'whiteboard',
        sourceResourceHash: 'board-hash',
      },
    ])).toEqual([
      {kind: 'content', sourceNodeId: 's1', targetNodeId: 't1'},
      {
        kind: 'native_sync',
        sourceNodeId: 's2',
        targetNodeId: 't2',
        sourceDocumentId: 'doc-en',
        sourceBlockId: 'sync-1',
      },
      {
        kind: 'copied_resource',
        sourceNodeId: 's3',
        targetNodeId: 't3',
        resourceKind: 'whiteboard',
        sourceResourceHash: 'board-hash',
      },
    ]);
  });
});
