import {describe, expect, it} from 'vitest';

import type {DocumentGateway, FetchedDocument, LocalizationReceipt} from '../src/application/ports.js';
import {InitializationInspector} from '../src/application/initialization-inspector.js';
import {isStrictlyEmptyTarget} from '../src/domain/initialization.js';
import type {DocumentPair} from '../src/domain/model.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';

class MemoryDocs implements DocumentGateway {
  readonly documents = new Map<string, FetchedDocument>();
  async fetch(doc: string): Promise<FetchedDocument> {
    const found = this.documents.get(doc);
    if (!found) throw new Error(`Missing ${doc}`);
    return found;
  }
  async replaceBlock(): Promise<{revisionId?: number}> { throw new Error('not used'); }
  async insertAfter(): Promise<{revisionId?: number}> { throw new Error('not used'); }
  async deleteBlocks(): Promise<{revisionId?: number}> { throw new Error('not used'); }
  async createDocument(): Promise<{documentId: string}> { throw new Error('not used'); }
}

const pair = (overrides: Partial<DocumentPair> = {}): DocumentPair => ({
  pairId: 'pair-1',
  sourceLocale: 'en',
  targetLocale: 'zh-CN',
  sourceDocUrl: 'source-url',
  targetDocUrl: 'target-url',
  mode: 'mirror',
  status: 'needs_bootstrap',
  ...overrides,
});

describe('initialization inspection', () => {
  it('treats only a title-only document as strictly empty', () => {
    expect(isStrictlyEmptyTarget(parseFeishuDocument(
      '<title id="doc">临时标题</title>',
      {documentId: 'doc', revisionId: 1},
    ))).toBe(true);

    for (const xml of [
      '<title id="doc">Title</title><p id="p"></p>',
      '<title id="doc">Title</title><whiteboard id="w" token="board"></whiteboard>',
      '<title id="doc">Title</title><synced_reference id="r" src-token="en" src-block-id="s"></synced_reference>',
    ]) {
      expect(isStrictlyEmptyTarget(parseFeishuDocument(xml, {
        documentId: 'doc', revisionId: 1,
      }))).toBe(false);
    }
  });

  it('classifies create, initialize, adopt, and incremental dispositions', async () => {
    const docs = new MemoryDocs();
    docs.documents.set('source-url', {
      documentId: 'source', revisionId: 3, content: '<title id="source">English</title><p id="p">Body</p>',
    });
    docs.documents.set('target-url', {
      documentId: 'target', revisionId: 4, content: '<title id="target">Temporary</title>',
    });
    docs.documents.set('target-body-url', {
      documentId: 'target-body', revisionId: 5, content: '<title id="target-body">中文</title><p id="p">正文</p>',
    });
    const inspector = new InitializationInspector(docs);
    const receipt = {pairId: 'pair-1'} as LocalizationReceipt;

    await expect(inspector.inspect(pair({targetDocUrl: undefined, targetParentToken: 'parent'}))).resolves.toEqual({kind: 'create_target'});
    await expect(inspector.inspect(pair())).resolves.toMatchObject({kind: 'initialize_empty_target'});
    await expect(inspector.inspect(pair({targetDocUrl: 'target-body-url'}))).resolves.toMatchObject({kind: 'adopt_existing_target'});
    await expect(inspector.inspect(pair(), receipt)).resolves.toEqual({kind: 'incremental'});
  });
});
