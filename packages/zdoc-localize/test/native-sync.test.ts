import {describe, expect, it} from 'vitest';

import {normalizeCorrespondences} from '../src/domain/native-sync.js';
import {verifyManualSyncedReferences} from '../src/domain/native-sync.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';

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

  it('verifies an exact manual placeholder replacement', () => {
    const planned = parseFeishuDocument(
      '<title id="title">中文</title><p id="before">Before</p>'
        + '<callout id="placeholder"><p>ZDOC-MANUAL-SYNC:sync-1</p></callout>'
        + '<p id="after">After</p>',
      {documentId: 'target', revisionId: 10},
    );
    const current = parseFeishuDocument(
      '<title id="title">中文</title><p id="before">Before</p>'
        + '<synced_reference id="reference" src-token="source" src-block-id="source-sync"></synced_reference>'
        + '<p id="after">After</p>',
      {documentId: 'target', revisionId: 11},
    );

    expect(verifyManualSyncedReferences([{
      operationId: 'sync-1',
      marker: 'ZDOC-MANUAL-SYNC:sync-1',
      placeholderBlockId: 'placeholder',
      sourceNodeId: '$root:synced_source:0',
      sourceDocumentId: 'source',
      sourceBlockId: 'source-sync',
      sourceUrl: 'source-url#source-sync',
      predecessorBlockId: 'before',
      successorBlockId: 'after',
    }], planned, current)).toEqual({
      correspondences: [{
        kind: 'native_sync',
        sourceNodeId: '$root:synced_source:0',
        targetNodeId: '$root:synced_reference:0',
        sourceDocumentId: 'source',
        sourceBlockId: 'source-sync',
      }],
      resolvedBlockIds: new Map([['sync-1', 'reference']]),
    });
  });

  it('rejects a manual reference that points at the wrong source block', () => {
    const planned = parseFeishuDocument(
      '<title id="title">中文</title><callout id="placeholder"><p>ZDOC-MANUAL-SYNC:sync-1</p></callout>',
      {documentId: 'target', revisionId: 10},
    );
    const current = parseFeishuDocument(
      '<title id="title">中文</title><synced_reference id="reference" src-token="source" src-block-id="wrong"></synced_reference>',
      {documentId: 'target', revisionId: 11},
    );

    expect(() => verifyManualSyncedReferences([{
      operationId: 'sync-1', marker: 'ZDOC-MANUAL-SYNC:sync-1', placeholderBlockId: 'placeholder',
      sourceNodeId: '$root:synced_source:0', sourceDocumentId: 'source', sourceBlockId: 'source-sync',
      sourceUrl: 'source-url#source-sync', predecessorBlockId: 'title',
    }], planned, current)).toThrowError(expect.objectContaining({subtype: 'manual_reference_mismatch'}));
  });
});
