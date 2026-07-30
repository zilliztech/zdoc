import {readFileSync} from 'node:fs';

import {createDocumentSnapshot, type DocumentSnapshot, type ProviderBlock} from 'feishu-docx-engine';
import {describe, expect, it} from 'vitest';

import {semanticDocumentFromSnapshot} from '../src/domain/docx-semantic.js';
import {diffDocuments} from '../src/domain/diff.js';

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
      fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
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
    expect(nestedList?.remote).toMatchObject({
      blockIds: ['nested-parent'],
      subtreeBlockIds: ['nested-parent', 'nested-child'],
    });

    const table = document.nodes.find((node) => node.remote.blockId === 'parameters-table');
    expect(table).toMatchObject({
      kind: 'table',
      writable: true,
      fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      remote: {
        blockIds: ['parameters-table'],
        subtreeBlockIds: [
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
    expect(document.nodes.find((node) => node.remote.blockId === 'note-callout')).toMatchObject({
      kind: 'callout',
      writable: false,
      text: 'Notes\nKeep the token private.',
      remote: {
        blockIds: ['note-callout'],
        subtreeBlockIds: ['note-callout', 'callout-title', 'callout-body'],
      },
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
      const providerFingerprint = snapshot.nodes.find(
        (candidate) => candidate.blockId === node.remote.blockId,
      )!.canonicalHash;
      if ((node.remote.subtreeBlockIds?.length ?? 0) > 1) expect(node.fingerprint).not.toBe(providerFingerprint);
      else expect(node.fingerprint).toBe(providerFingerprint);
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

  it('keeps Engine-supported list continuation paragraphs typed and translatable', () => {
    const continuation = createDocumentSnapshot({
      documentId: 'continuation-list',
      revision: '1',
      blocks: [{
        block_id: 'continuation-list',
        block_type: 1,
        page: {elements: [{text_run: {content: 'Continuation list', text_element_style: {}}}]},
        children: [{
          block_id: 'bullet-item',
          parent_id: 'continuation-list',
          block_type: 12,
          bullet: {elements: [{text_run: {content: 'Primary item', text_element_style: {}}}]},
          children: [{
            block_id: 'continuation-paragraph',
            parent_id: 'bullet-item',
            block_type: 2,
            text: {elements: [{text_run: {content: 'Continuation detail', text_element_style: {}}}]},
          }],
        }],
      }],
    });

    expect(semanticDocumentFromSnapshot(continuation).nodes.find(
      (node) => node.remote.blockId === 'bullet-item',
    )).toMatchObject({
      kind: 'list',
      writable: true,
      text: '- Primary item\n   Continuation detail',
      remote: {
        blockIds: ['bullet-item'],
        subtreeBlockIds: ['bullet-item', 'continuation-paragraph'],
      },
      structure: {
        kind: 'list',
        items: [{
          content: [{kind: 'text', text: 'Primary item'}],
          children: [{
            kind: 'paragraph',
            content: [{kind: 'text', text: 'Continuation detail'}],
          }],
        }],
      },
    });
  });

  it('includes typed descendant content in structured-node fingerprints', () => {
    const calloutSnapshot = (revision: string, body: string) => createDocumentSnapshot({
      documentId: 'callout-fingerprint',
      revision,
      blocks: [{
        block_id: 'callout-fingerprint',
        block_type: 1,
        page: {elements: [{text_run: {content: 'Callout fingerprint', text_element_style: {}}}]},
        children: [{
          block_id: 'note',
          parent_id: 'callout-fingerprint',
          block_type: 19,
          callout: {background_color: 5, border_color: 5, emoji_id: 'blue_book'},
          children: [{
            block_id: 'note-title',
            parent_id: 'note',
            block_type: 2,
            text: {elements: [{text_run: {content: 'Notes', text_element_style: {}}}]},
          }, {
            block_id: 'note-body',
            parent_id: 'note',
            block_type: 2,
            text: {elements: [{text_run: {content: body, text_element_style: {}}}]},
          }],
        }],
      }],
    });
    const beforeSnapshot = calloutSnapshot('1', 'Old guidance.');
    const afterSnapshot = calloutSnapshot('2', 'New guidance.');
    const before = semanticDocumentFromSnapshot(beforeSnapshot);
    const after = semanticDocumentFromSnapshot(afterSnapshot);
    const beforeCallout = before.nodes.find((node) => node.remote.blockId === 'note')!;
    const afterCallout = after.nodes.find((node) => node.remote.blockId === 'note')!;

    expect(beforeSnapshot.nodes.find((node) => node.blockId === 'note')?.canonicalHash)
      .toBe(afterSnapshot.nodes.find((node) => node.blockId === 'note')?.canonicalHash);
    expect(beforeCallout.fingerprint).not.toBe(afterCallout.fingerprint);
    expect(diffDocuments(before, after)).toEqual([
      expect.objectContaining({kind: 'replace', before: beforeCallout, after: afterCallout}),
    ]);
  });

  it('keeps the live Model compatibility paragraph, table, and blue-note Callout typed', () => {
    const paragraph = (
      blockId: string,
      parentId: string,
      content: string,
      link?: string,
    ): ProviderBlock => ({
      block_id: blockId,
      parent_id: parentId,
      block_type: 2,
      text: {
        elements: [{
          text_run: {
            content,
            text_element_style: {
              bold: false,
              inline_code: link !== undefined,
              italic: false,
              ...(link ? {link: {url: link}} : {}),
              strikethrough: false,
              underline: false,
            },
          },
        }],
        style: {align: 1, folded: false},
      },
    });
    const live = createDocumentSnapshot({
      documentId: 'hugging-face-r115',
      revision: '115',
      blocks: [{
        block_id: 'hugging-face-r115',
        block_type: 1,
        page: {elements: [{text_run: {content: 'Hugging Face', text_element_style: {}}}]},
        children: [
          paragraph(
            'model-compatibility',
            'hugging-face-r115',
            'hf-inference',
            'https://huggingface.co/docs/inference-providers/providers/hf-inference',
          ),
          {
            block_id: 'compatibility-table',
            parent_id: 'hugging-face-r115',
            block_type: 31,
            children: [{
              block_id: 'model-cell',
              parent_id: 'compatibility-table',
              block_type: 32,
              table_cell: {},
              children: [paragraph(
                'model-link',
                'model-cell',
                'BAAI/bge-m3',
                'https://huggingface.co/BAAI/bge-m3',
              )],
            }],
            table: {
              cells: ['model-cell'],
              property: {
                column_size: 1,
                column_width: [280],
                header_row: true,
                merge_info: [{col_span: 1, row_span: 1}],
                row_size: 1,
              },
            },
          },
          {
            block_id: 'compatibility-note',
            parent_id: 'hugging-face-r115',
            block_type: 19,
            callout: {background_color: 5, border_color: 5, emoji_id: 'blue_book'},
            children: [
              paragraph('callout-title', 'compatibility-note', 'Notes'),
              paragraph('callout-body', 'compatibility-note', 'This table is not exhaustive.'),
              paragraph(
                'callout-link',
                'compatibility-note',
                'hf-inference',
                'https://huggingface.co/docs/inference-providers/providers/hf-inference',
              ),
            ],
          },
        ],
      }],
    });

    const document = semanticDocumentFromSnapshot(live);

    expect(document.nodes.map((node) => ({kind: node.kind, writable: node.writable}))).toEqual([
      {kind: 'title', writable: true},
      {kind: 'paragraph', writable: true},
      {kind: 'table', writable: true},
      {kind: 'callout', writable: true},
    ]);
    expect(document.nodes.find((node) => node.remote.blockId === 'model-compatibility')?.xml)
      .toContain('<a href="https://huggingface.co/docs/inference-providers/providers/hf-inference"><code>hf-inference</code></a>');
    expect(document.nodes.find((node) => node.remote.blockId === 'compatibility-table')?.structure).toMatchObject({
      kind: 'table',
      columnWidths: [280],
      headerRow: true,
    });
    expect(document.nodes.find((node) => node.remote.blockId === 'compatibility-note')).toMatchObject({
      kind: 'callout',
      text: 'Notes\nThis table is not exhaustive.\nhf-inference',
      writable: true,
      structure: {
        kind: 'callout',
        calloutType: 'note',
        title: 'Notes',
      },
    });
  });
});
