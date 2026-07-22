import {readFileSync} from 'node:fs';

import type {DocumentSnapshot} from 'feishu-docx-engine';
import {describe, expect, it} from 'vitest';

import {semanticDocumentFromSnapshot} from '../src/domain/docx-semantic.js';

const snapshot = JSON.parse(readFileSync(
  new URL('./fixtures/hugging-face-source-snapshot.json', import.meta.url),
  'utf8',
)) as DocumentSnapshot;

describe('semanticDocumentFromSnapshot', () => {
  it('preserves structured content and provider identities from an engine snapshot', () => {
    const document = semanticDocumentFromSnapshot(snapshot);

    expect(document).toMatchObject({
      documentId: 'hugging-face-source',
      revisionId: 44,
      title: 'Hugging Face',
      canonicalHash: snapshot.canonicalHash,
    });
    expect(document.sections.map((section) => section.headingPath)).toEqual([
      ['Hugging Face embedding functions'],
      ['Hugging Face embedding functions', 'Before you start'],
      ['Hugging Face embedding functions', 'Before you start', 'Parameters'],
    ]);
    expect(document.nodes.filter((node) => node.kind === 'heading').map((node) => ({
      nodeId: node.nodeId,
      headingPath: node.headingPath,
      siblingIndex: node.siblingIndex,
    }))).toEqual([
      {
        nodeId: 'Hugging Face embedding functions:heading:0',
        headingPath: ['Hugging Face embedding functions'],
        siblingIndex: 0,
      },
      {
        nodeId: 'Hugging Face embedding functions/Before you start:heading:0',
        headingPath: ['Hugging Face embedding functions', 'Before you start'],
        siblingIndex: 0,
      },
      {
        nodeId: 'Hugging Face embedding functions/Before you start/Parameters:heading:0',
        headingPath: ['Hugging Face embedding functions', 'Before you start', 'Parameters'],
        siblingIndex: 0,
      },
    ]);

    const nestedList = document.nodes.find((node) => node.remote.blockId === 'nested-parent');
    expect(nestedList).toMatchObject({
      kind: 'list',
      writable: true,
      fingerprint: snapshot.nodes.find((node) => node.blockId === 'nested-parent')!.canonicalHash,
      structure: {
        kind: 'list',
        ordered: false,
        items: [{
          content: [{kind: 'text', text: 'Create a Hugging Face account.'}],
          children: [{
            ordered: true,
            items: [{
              content: [{kind: 'text', text: 'Generate an access token.', bold: true}],
              children: [],
            }],
          }],
        }],
      },
    });
    expect(nestedList?.remote.blockIds).toEqual(['nested-parent', 'nested-child']);

    const table = document.nodes.find((node) => node.remote.blockId === 'parameters-table');
    expect(table).toMatchObject({
      kind: 'table',
      writable: true,
      fingerprint: snapshot.nodes.find((node) => node.blockId === 'parameters-table')!.canonicalHash,
      remote: {
        blockIds: [
          'parameters-table',
          'parameter-cell',
          'parameter-label',
          'description-cell',
          'description-label',
          'model-cell',
          'model-label',
          'model-description-cell',
          'model-description',
        ],
      },
      structure: {
        kind: 'table',
        rows: [
          {cells: [
            {content: [{kind: 'paragraph', content: [{kind: 'text', text: 'Parameter', bold: true}]}]},
            {content: [{kind: 'paragraph', content: [{kind: 'text', text: 'Description', bold: true}]}]},
          ]},
          {cells: [
            {content: [{kind: 'paragraph', content: [{kind: 'code', text: 'model_name'}]}]},
            {content: [{kind: 'paragraph', content: [{kind: 'text', text: 'The model used to generate embeddings.'}]}]},
          ]},
        ],
      },
    });

    expect(document.nodes.find((node) => node.remote.blockId === 'example-code')).toMatchObject({
      kind: 'code',
      writable: true,
      fingerprint: snapshot.nodes.find((node) => node.blockId === 'example-code')!.canonicalHash,
      structure: {kind: 'code', language: 'python', caption: undefined},
    });
    expect(document.nodes.find((node) => node.remote.blockId === 'architecture-board')).toMatchObject({
      kind: 'whiteboard',
      remote: {token: 'whiteboard-stable-token'},
    });
    expect(document.nodes.find((node) => node.remote.blockId === 'synced-source')).toMatchObject({
      kind: 'synced_source',
      remote: {sourceDocumentId: 'hugging-face-source', sourceBlockId: 'synced-source'},
    });
    expect(document.nodes.find((node) => node.remote.blockId === 'synced-reference')).toMatchObject({
      kind: 'synced_reference',
      remote: {sourceDocumentId: 'english-source-document', sourceBlockId: 'english-source-block'},
    });
    expect(document.nodes.find((node) => node.remote.blockId === 'unknown-block')).toMatchObject({
      kind: 'opaque',
      writable: false,
    });
    for (const node of document.nodes) {
      expect(node.fingerprint).toBe(
        snapshot.nodes.find((candidate) => candidate.blockId === node.remote.blockId)!.canonicalHash,
      );
    }
  });

  it('fails closed when a provider node claims a writable kind with an unknown shape', () => {
    const malformed = structuredClone(snapshot);
    const list = malformed.nodes.find((node) => node.blockId === 'nested-parent')!;
    delete list.raw.bullet;

    expect(semanticDocumentFromSnapshot(malformed).nodes.find(
      (node) => node.remote.blockId === 'nested-parent',
    )).toMatchObject({kind: 'opaque', writable: false});
  });
});
