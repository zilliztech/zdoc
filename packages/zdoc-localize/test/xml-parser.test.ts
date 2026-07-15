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
});
