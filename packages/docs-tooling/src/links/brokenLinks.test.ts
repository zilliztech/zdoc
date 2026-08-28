import {describe, expect, it} from 'vitest';

import {parseBrokenLinksLog, parseBrokenLinksReport, renderBrokenLinksMarkdown} from './brokenLinks.ts';

const SAMPLE_LOG = [
  '[WARNING] Docusaurus found broken links!',
  '',
  'Frequent broken links are linking to:',
  '- ./pattern-match',
  '- ./use-array-fields',
  '',
  'Exhaustive list of all broken links found:',
  '- Broken link on source page path = /docs/byoc/basic-filtering-operators:',
  '   -> linking to ./pattern-match (resolved as: /docs/byoc/pattern-match)',
  '   -> linking to ./use-array-fields (resolved as: /docs/byoc/use-array-fields)',
  '- Broken link on source page path = /docs/home:',
  '   -> linking to ./connect-to-cluster (resolved as: /docs/connect-to-cluster)',
  '- Broken link on source page path = /docs/cli-and-agent-integration-guide:',
  '   -> linking to /docs/agents/zilliz-plugin',
  '',
  '[WARNING] Docusaurus found broken anchors!',
  '',
  'Exhaustive list of all broken anchors found:',
  '- Broken anchor on source page path = /docs/json-indexing:',
  '   -> linking to ./json-indexing#compatibility-reference (resolved as: /docs/json-indexing#compatibility-reference)',
].join('\n');

describe('parseBrokenLinksLog', () => {
  it('parses broken links and anchors, ignoring the frequent-links summary', () => {
    const {brokenLinks, brokenAnchors} = parseBrokenLinksLog(SAMPLE_LOG);
    expect(brokenLinks).toEqual([
      {link: './pattern-match', resolvedLink: '/docs/byoc/pattern-match', anchor: false, path: '/docs/byoc/basic-filtering-operators'},
      {link: './use-array-fields', resolvedLink: '/docs/byoc/use-array-fields', anchor: false, path: '/docs/byoc/basic-filtering-operators'},
      {link: './connect-to-cluster', resolvedLink: '/docs/connect-to-cluster', anchor: false, path: '/docs/home'},
      {link: '/docs/agents/zilliz-plugin', resolvedLink: '/docs/agents/zilliz-plugin', anchor: false, path: '/docs/cli-and-agent-integration-guide'},
    ]);
    expect(brokenAnchors).toEqual([
      {link: './json-indexing#compatibility-reference', resolvedLink: '/docs/json-indexing#compatibility-reference', anchor: true, path: '/docs/json-indexing'},
    ]);
  });

  it('returns empty arrays for a log without broken links', () => {
    const {brokenLinks, brokenAnchors} = parseBrokenLinksLog('[SUCCESS] Generated static files.');
    expect(brokenLinks).toEqual([]);
    expect(brokenAnchors).toEqual([]);
  });
});

describe('parseBrokenLinksReport', () => {
  it('validates a well-formed report', () => {
    const report = parseBrokenLinksReport({
      schema_version: 1,
      generated_at: '2026-08-27T00:00:00.000Z',
      site: 'en',
      summary: {broken_links: 1, broken_anchors: 1},
      broken_links: [{link: './x', resolvedLink: '/docs/x', anchor: false, path: '/docs/a'}],
      broken_anchors: [{link: './b#y', resolvedLink: '/docs/b#y', anchor: true, path: '/docs/a'}],
    });
    expect(report.summary.broken_links).toBe(1);
  });
});

describe('renderBrokenLinksMarkdown', () => {
  it('renders empty sections as None', () => {
    const report = parseBrokenLinksReport({
      schema_version: 1,
      generated_at: '2026-08-27T00:00:00.000Z',
      site: 'zh-CN',
      summary: {broken_links: 0, broken_anchors: 0},
      broken_links: [],
      broken_anchors: [],
    });
    const markdown = renderBrokenLinksMarkdown(report);
    expect(markdown).toContain('- None');
  });
});
