import {
  createDocumentSnapshot,
  type DocumentSelector,
  type DocumentSnapshot,
} from 'feishu-docx-engine';
import {describe, expect, it} from 'vitest';

import type {LocalizationDocxEngine, LocalizationReceipt} from '../src/application/ports.js';
import {InitializationInspector} from '../src/application/initialization-inspector.js';
import {isStrictlyEmptyTarget} from '../src/domain/initialization.js';
import type {DocumentPair} from '../src/domain/model.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';

class MemoryEngine implements LocalizationDocxEngine {
  readonly documents = new Map<string, DocumentSnapshot>();
  readonly requests: DocumentSelector[] = [];
  async snapshot(selector: DocumentSelector): Promise<DocumentSnapshot> {
    this.requests.push(selector);
    const key = selector.kind === 'url' ? selector.url : selector.token;
    const found = this.documents.get(key);
    if (!found) throw new Error(`Missing ${key}`);
    return found;
  }
  prepare(): never { throw new Error('not used'); }
  async apply(): Promise<never> { throw new Error('not used'); }
  async assessRecovery(): Promise<never> { throw new Error('not used'); }
}

function snapshot(documentId: string, revision: string, title: string, body?: string): DocumentSnapshot {
  const bodyId = body ? `${documentId}-body` : undefined;
  return createDocumentSnapshot({
    documentId,
    revision,
    blocks: [{
      block_id: documentId,
      block_type: 1,
      page: {elements: [{text_run: {content: title, text_element_style: {}}}]},
      children: bodyId ? [bodyId] : [],
    }, ...(bodyId ? [{
      block_id: bodyId,
      parent_id: documentId,
      block_type: 2,
      text: {elements: [{text_run: {content: body, text_element_style: {}}}]},
    }] : [])],
  });
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
    const engine = new MemoryEngine();
    engine.documents.set('source-url', snapshot('source', '44', 'English', 'Body'));
    engine.documents.set('target-url', snapshot('target', '4', 'Temporary'));
    engine.documents.set('target-body-url', snapshot('target-body', '5', '中文', '正文'));
    const inspector = new InitializationInspector(engine);
    const receipt = {pairId: 'pair-1'} as LocalizationReceipt;

    await expect(inspector.inspect(pair({targetDocUrl: undefined, targetParentToken: 'parent'}))).resolves.toEqual({kind: 'create_target'});
    await expect(inspector.inspect(pair())).resolves.toMatchObject({
      kind: 'initialize_empty_target',
      source: {revision: '44'},
      target: {revision: '4'},
    });
    await expect(inspector.inspect(pair({targetDocUrl: 'target-body-url'}))).resolves.toMatchObject({kind: 'adopt_existing_target'});
    await expect(inspector.inspect(pair(), receipt)).resolves.toEqual({kind: 'incremental'});
    expect(engine.requests).toHaveLength(4);
  });
});
