import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

import {renderDiagnosticMarkdown} from '../src/domain/markdown-renderer.js';
import {parseFeishuDocument} from '../src/domain/xml-parser.js';

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

describe('Feishu XML semantic parsing', () => {
  it('preserves document structure and marks resource blocks as non-writable', async () => {
    const xml = await readFile(fixture('source-baseline.xml'), 'utf8');
    const document = parseFeishuDocument(xml, {documentId: 'doc-en', revisionId: 12});

    expect(document.title).toBe('Configure metrics');
    expect(document.sections.map((section) => section.headingPath)).toEqual([
      ['Overview'],
      ['Overview', 'Configure monitoring'],
    ]);
    expect(document.nodes.find((node) => node.kind === 'image')).toMatchObject({
      writable: false,
      remote: {blockId: 'image-1', token: 'img-token'},
    });
    expect(document.canonicalHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('excludes volatile block IDs from the canonical hash', async () => {
    const baselineXml = await readFile(fixture('source-baseline.xml'), 'utf8');
    const changedIdsXml = baselineXml.replaceAll('id="', 'id="changed-');

    const baseline = parseFeishuDocument(baselineXml, {documentId: 'doc-en', revisionId: 12});
    const changedIds = parseFeishuDocument(changedIdsXml, {documentId: 'doc-en', revisionId: 13});

    expect(changedIds.canonicalHash).toBe(baseline.canonicalHash);
  });

  it('renders unsupported nodes explicitly in diagnostic Markdown', async () => {
    const xml = await readFile(fixture('source-baseline.xml'), 'utf8');
    const markdown = renderDiagnosticMarkdown(
      parseFeishuDocument(xml, {documentId: 'doc-en', revisionId: 12}),
    );

    expect(markdown).toContain('<!-- unsupported:table block=table-1 -->');
    expect(markdown).toContain('<!-- unsupported:image block=image-1 token=img-token -->');
  });

  it('marks a nominally writable container as read-only when it contains an opaque resource', () => {
    const document = parseFeishuDocument(
      '<callout id="note"><p>Keep this</p><img id="nested-image" token="img-token"/></callout>',
      {documentId: 'doc-en', revisionId: 1},
    );

    expect(document.nodes[0]).toMatchObject({kind: 'callout', writable: false});
  });

  it('marks inline styles that the review renderer cannot round-trip as read-only', () => {
    const document = parseFeishuDocument(
      '<p id="styled">Keep <em>emphasis</em> and <u>underline</u>.</p>',
      {documentId: 'doc-en', revisionId: 1},
    );

    expect(document.nodes[0]).toMatchObject({kind: 'paragraph', writable: false});

    const nested = parseFeishuDocument(
      '<p id="nested"><a href="https://example.com"><b>Nested</b></a><br/>Next line</p>',
      {documentId: 'doc-en', revisionId: 1},
    );
    expect(nested.nodes[0]).toMatchObject({kind: 'paragraph', writable: false});
  });

  it('preserves a live Feishu nested-list outline and its top-level block IDs', () => {
    const document = parseFeishuDocument(
      '<ol><li id="step-1" seq="1">Scan the remote English document.</li><li id="step-2">Review the proposed Chinese changes.<ul><li id="child-1">Preserve URLs and inline <code>commands</code>.</li><li id="child-2">Apply only approved block-level writes.</li></ul></li></ol>',
      {documentId: 'doc-en', revisionId: 8},
    );

    expect(document.nodes[0]).toMatchObject({
      kind: 'list',
      writable: true,
      text: '1. Scan the remote English document.\n2. Review the proposed Chinese changes.\n   - Preserve URLs and inline commands.\n   - Apply only approved block-level writes.',
      remote: {
        blockId: 'step-1',
        blockIds: ['step-1', 'step-2'],
        elementName: 'ol',
      },
    });
    expect(renderDiagnosticMarkdown(document)).toContain(
      '1. Scan the remote English document.\n2. Review the proposed Chinese changes.\n   - Preserve URLs and inline commands.\n   - Apply only approved block-level writes.',
    );
  });

  it('parses real source and reference synced blocks with protected identities', () => {
    const source = parseFeishuDocument(
      '<synced-source id="src-block"><pre id="code"><code>print(1)</code></pre></synced-source>',
      {documentId: 'source-doc', revisionId: 3},
    );
    const target = parseFeishuDocument(
      '<synced_reference id="ref-block" src-token="source-doc" src-block-id="src-block"></synced_reference>',
      {documentId: 'target-doc', revisionId: 7},
    );

    expect(source.nodes[0]).toMatchObject({
      kind: 'synced_source',
      writable: false,
      remote: {
        blockId: 'src-block',
        sourceDocumentId: 'source-doc',
        sourceBlockId: 'src-block',
      },
    });
    expect(target.nodes[0]).toMatchObject({
      kind: 'synced_reference',
      writable: false,
      remote: {
        blockId: 'ref-block',
        sourceDocumentId: 'source-doc',
        sourceBlockId: 'src-block',
      },
    });
  });

  it('accepts the underscore source spelling for compatibility', () => {
    const document = parseFeishuDocument('<synced_source id="src"></synced_source>', {
      documentId: 'doc', revisionId: 1,
    });

    expect(document.nodes[0]).toMatchObject({
      kind: 'synced_source',
      remote: {sourceDocumentId: 'doc', sourceBlockId: 'src'},
    });
  });
});
