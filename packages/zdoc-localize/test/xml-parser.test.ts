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
});
