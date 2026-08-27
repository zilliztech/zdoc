import {describe, expect, it} from 'vitest';

import {
  detectBrokenLinks,
  filePathToPathname,
  renderBrokenLinksMarkdown,
  resolveLinkPath,
  sitemapPathnames,
  parseBrokenLinksReport,
  collectPageAnchors,
} from './brokenLinks.ts';

describe('filePathToPathname', () => {
  it('maps an index.html file to its route pathname without trailing slash', () => {
    expect(filePathToPathname('docs/foo/index.html')).toBe('/docs/foo');
    expect(filePathToPathname('docs/index.html')).toBe('/docs');
    expect(filePathToPathname('index.html')).toBe('/');
  });

  it('maps a standalone .html file to its route pathname', () => {
    expect(filePathToPathname('404.html')).toBe('/404');
  });
});

describe('sitemapPathnames', () => {
  it('converts absolute sitemap URLs to pathname set and normalizes trailing slash', () => {
    const pathnames = sitemapPathnames([
      'https://docs.zilliz.com/docs/foo',
      'https://docs.zilliz.com/docs/bar/',
      'https://docs.zilliz.com/',
      'not-a-url',
    ]);
    expect(pathnames.has('/docs/foo')).toBe(true);
    expect(pathnames.has('/docs/bar')).toBe(true);
    expect(pathnames.has('/')).toBe(true);
    expect(pathnames.size).toBe(3);
  });
});

describe('collectPageAnchors', () => {
  it('collects heading and non-internal ids but skips Docusaurus internals', () => {
    const anchors = collectPageAnchors(`
      <html><body>
        <h2 id="compatibility-reference">Compatibility</h2>
        <h3 id="example-3-convert-data-type-at-index-time">Example 3</h3>
        <div id="__docusaurus">internal</div>
        <div id="__unused">internal</div>
      </body></html>
    `);
    expect(anchors.has('compatibility-reference')).toBe(true);
    expect(anchors.has('example-3-convert-data-type-at-index-time')).toBe(true);
    expect(anchors.has('__docusaurus')).toBe(false);
  });
});

describe('resolveLinkPath', () => {
  it('resolves relative, absolute, and fragment links against a page pathname', () => {
    expect(resolveLinkPath('./pattern-match', '/docs/byoc/basic-filtering-operators'))
      .toEqual({pathname: '/docs/byoc/pattern-match', hash: undefined});
    expect(resolveLinkPath('../filtering-overview', '/docs/byoc/basic-filtering-operators'))
      .toEqual({pathname: '/docs/filtering-overview', hash: undefined});
    expect(resolveLinkPath('/docs/index-scalar-fields', '/docs/byoc/basic-filtering-operators'))
      .toEqual({pathname: '/docs/index-scalar-fields', hash: undefined});
    expect(resolveLinkPath('./json-indexing#supported-cast-types', '/docs/byoc/enable-dynamic-field'))
      .toEqual({pathname: '/docs/byoc/json-indexing', hash: 'supported-cast-types'});
    expect(resolveLinkPath('#understand-model-inference', '/docs/function-and-model-inference-overview'))
      .toEqual({pathname: '/docs/function-and-model-inference-overview', hash: 'understand-model-inference'});
  });
});

describe('detectBrokenLinks', () => {
  const pathnames = new Set(['/docs/a', '/docs/b', '/docs/byoc/c']);

  it('flags a link whose pathname does not resolve to any route as a broken link', () => {
    const result = detectBrokenLinks({
      pathnames,
      anchorsByPathname: new Map(),
      internalLinks: [{href: './missing', page: 'docs/a/index.html', pagePathname: '/docs/a'}],
    });
    expect(result.brokenLinks).toEqual([
      {link: './missing', resolvedLink: '/docs/missing', anchor: false, path: '/docs/a'},
    ]);
    expect(result.brokenAnchors).toHaveLength(0);
  });

  it('flags a link to an existing page with a missing anchor as a broken anchor', () => {
    const result = detectBrokenLinks({
      pathnames,
      anchorsByPathname: new Map([['/docs/b', new Set(['real-anchor'])]]),
      internalLinks: [{href: './b#missing-anchor', page: 'docs/a/index.html', pagePathname: '/docs/a'}],
    });
    expect(result.brokenAnchors).toEqual([
      {link: './b#missing-anchor', resolvedLink: '/docs/b#missing-anchor', anchor: true, path: '/docs/a'},
    ]);
    expect(result.brokenLinks).toHaveLength(0);
  });

  it('does not flag a link to an existing page with an existing anchor', () => {
    const result = detectBrokenLinks({
      pathnames,
      anchorsByPathname: new Map([['/docs/b', new Set(['real-anchor'])]]),
      internalLinks: [{href: './b#real-anchor', page: 'docs/a/index.html', pagePathname: '/docs/a'}],
    });
    expect(result.brokenLinks).toHaveLength(0);
    expect(result.brokenAnchors).toHaveLength(0);
  });

  it('does not flag an existing intra-site link', () => {
    const result = detectBrokenLinks({
      pathnames,
      anchorsByPathname: new Map(),
      internalLinks: [{href: './b', page: 'docs/a/index.html', pagePathname: '/docs/a'}],
    });
    expect(result.brokenLinks).toHaveLength(0);
    expect(result.brokenAnchors).toHaveLength(0);
  });
});

describe('parseBrokenLinksReport', () => {
  it('validates a well-formed report', () => {
    const report = parseBrokenLinksReport({
      schema_version: 1,
      generated_at: '2026-08-26T00:00:00.000Z',
      site: 'en',
      workflow_run_url: null,
      local_sitemap_source: 'build/en/sitemap.xml',
      summary: {checked_internal_links: 3, broken_links: 1, broken_anchors: 1},
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
      generated_at: '2026-08-26T00:00:00.000Z',
      site: 'zh-CN',
      workflow_run_url: null,
      local_sitemap_source: 'build/zh-CN/sitemap.xml',
      summary: {checked_internal_links: 0, broken_links: 0, broken_anchors: 0},
      broken_links: [],
      broken_anchors: [],
    });
    const markdown = renderBrokenLinksMarkdown(report);
    expect(markdown).toContain('- None');
  });
});
