import {existsSync, mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {resolveSiteProfile} from '@zilliz/site-config';

import {
  buildLinkCheckReport,
  checkLinks,
  classifyExternalResult,
  contentRouteRoots,
  LinkCheckReportSchema,
  renderLinkCheckMarkdown,
  resolveWorkflowRunUrl,
} from './check.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-links-'));
}

function linkCheckFixture(root: string): void {
  mkdirSync(path.join(root, 'build/en/docs'), {recursive: true});
  writeFileSync(path.join(root, 'build/en/sitemap.xml'), '<urlset><url><loc>https://docs.zilliz.com/docs/new/</loc></url></urlset>');
  writeFileSync(path.join(root, 'build/en/docs/new.html'), '<a class="external" href="https://bad.example.com">Bad</a>');
}

function externalLinkFixture(root: string, pages: Record<string, string>): void {
  mkdirSync(path.join(root, 'build/en/docs'), {recursive: true});
  writeFileSync(path.join(root, 'build/en/sitemap.xml'), '<urlset><url><loc>https://docs.zilliz.com/docs/new/</loc></url></urlset>');
  for (const [name, contents] of Object.entries(pages)) {
    writeFileSync(path.join(root, 'build/en/docs', name), contents);
  }
}

function localSitemapFixture(root: string, xml = '<urlset><url><loc>https://docs.zilliz.com/docs/new/</loc></url></urlset>'): void {
  mkdirSync(path.join(root, 'fixtures'), {recursive: true});
  writeFileSync(path.join(root, 'fixtures/remote.xml'), xml);
  writeFileSync(path.join(root, 'fixtures/local.xml'), xml);
}

function fetchResponse(status: number, onRead?: () => void) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => {
      onRead?.();
      return '';
    },
  };
}

const fixedNow = () => new Date('2026-07-02T00:00:00.000Z');

const linkCheckDependencies = {
  fetch: async (url: string | URL, init?: {method?: string}) => {
    if (init?.method === 'HEAD') return {ok: false, status: 404, text: async () => ''};
    expect(String(url)).toBe('https://docs.zilliz.com/sitemap.xml');
    return {ok: true, status: 200, text: async () => '<urlset><url><loc>https://docs.zilliz.com/docs/old/</loc></url></urlset>'};
  },
  now: fixedNow,
  write: () => {},
  environment: {},
};

describe('link-check reporting', () => {
  it.each([
    [200, 'healthy'], [204, 'healthy'], [301, 'healthy'], [308, 'healthy'],
    [404, 'expired'], [410, 'expired'], [401, 'blocked'], [403, 'blocked'],
    [408, 'transient'], [425, 'transient'], [429, 'transient'], [503, 'transient'],
    [400, 'other'], [409, 'other'], [451, 'other'],
  ] as const)('classifies HTTP %s as %s', (status, expected) => {
    expect(classifyExternalResult({status, error: null})).toBe(expected);
  });

  it('classifies network errors as transient', () => {
    expect(classifyExternalResult({status: null, error: 'connection reset'})).toBe('transient');
  });

  it('derives minimal scan roots from every declared site content route', () => {
    expect(contentRouteRoots(resolveSiteProfile('en').content.map(item => item.routeBasePath))).toEqual(['docs', 'reference']);
    expect(contentRouteRoots(resolveSiteProfile('zh-CN').content.map(item => item.routeBasePath))).toEqual(['docs', 'on-premise', 'reference']);
  });

  it('deduplicates nested route roots and safely collapses a root route', () => {
    expect(contentRouteRoots(['docs/byoc', '/docs/', 'reference', 'reference'])).toEqual(['docs', 'reference']);
    expect(contentRouteRoots(['docs', '/', 'reference'])).toEqual(['']);
  });

  it('builds a GitHub Actions run URL from environment', () => {
    expect(resolveWorkflowRunUrl({GITHUB_SERVER_URL: 'https://github.com', GITHUB_REPOSITORY: 'zilliztech/zdoc', GITHUB_RUN_ID: '28835409913'}))
      .toBe('https://github.com/zilliztech/zdoc/actions/runs/28835409913');
  });

  it('builds a schema-valid classified report and aggregates bounded referring pages', () => {
    const report = buildLinkCheckReport({
      generatedAt: '2026-07-02T00:00:00.000Z',
      toolingSha: 'a'.repeat(40),
      contentSha: 'b'.repeat(40),
      remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
      localSitemapSource: 'build/en/sitemap.xml',
      remoteUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/old/'],
      localUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/new/'],
      workflowRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
      checkedExternalLinks: [
        {url: 'https://healthy.example.com'},
        {url: 'https://expired.example.com'},
        {url: 'https://blocked.example.com'},
        {url: 'https://transient.example.com'},
        {url: 'https://other.example.com'},
      ],
      observations: [
        {url: 'https://healthy.example.com', pages: ['docs/healthy.html'], status: 200, error: null},
        {url: 'https://expired.example.com', pages: ['docs/f.html', 'docs/e.html', 'docs/d.html'], status: 404, error: null},
        {url: 'https://expired.example.com', pages: ['docs/c.html', 'docs/b.html', 'docs/a.html'], status: 404, error: null},
        {url: 'https://blocked.example.com', pages: ['docs/blocked.html'], status: 403, error: null},
        {url: 'https://transient.example.com', pages: ['docs/transient.html'], status: 503, error: null},
        {url: 'https://other.example.com', pages: ['docs/other.html'], status: 451, error: null},
      ],
    });
    expect(report.summary).toEqual({
      deleted_routes: 1,
      added_routes: 1,
      checked_external_links: 5,
      healthy_external_links: 1,
      expired_external_links: 1,
      blocked_external_links: 1,
      transient_external_links: 1,
      other_external_links: 1,
    });
    expect(report.deleted_routes).toEqual(['https://docs.zilliz.com/docs/old/']);
    expect(report.added_routes).toEqual(['https://docs.zilliz.com/docs/new/']);
    expect(report.expired_external_links).toEqual([{
      url: 'https://expired.example.com',
      classification: 'expired',
      status: 404,
      error: null,
      pages: ['docs/a.html', 'docs/b.html', 'docs/c.html', 'docs/d.html', 'docs/e.html'],
      page_count: 6,
    }]);
    expect(report.blocked_external_links[0]).toMatchObject({classification: 'blocked', status: 403, error: null, page_count: 1});
    expect(report.transient_external_links[0]).toMatchObject({classification: 'transient', status: 503, error: null, page_count: 1});
    expect(report.other_external_links[0]).toMatchObject({classification: 'other', status: 451, error: null, page_count: 1});
    expect(() => LinkCheckReportSchema.parse(report)).not.toThrow();
  });

  it('renders the exact stable classified Markdown contract', () => {
    const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
      generatedAt: '2026-07-02T00:00:00.000Z',
      toolingSha: 'a'.repeat(40),
      contentSha: 'b'.repeat(40),
      workflowRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
      remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
      localSitemapSource: 'build/en/sitemap.xml',
      remoteUrls: ['https://docs.zilliz.com/docs/old/'],
      localUrls: ['https://docs.zilliz.com/docs/new/'],
      checkedExternalLinks: [
        {url: 'https://healthy.example.com'},
        {url: 'https://expired.example.com'},
        {url: 'https://blocked.example.com'},
        {url: 'https://transient.example.com'},
        {url: 'https://other.example.com'},
      ],
      observations: [
        {url: 'https://healthy.example.com', page: 'docs/healthy.html', status: 200, error: null},
        {url: 'https://expired.example.com', pages: ['docs/a.html', 'docs/b.html'], status: 404, error: null, page_count: 2},
        {url: 'https://blocked.example.com', page: 'docs/c.html', status: 403, error: null},
        {url: 'https://transient.example.com', page: 'docs/d.html', status: null, error: 'connection reset'},
        {url: 'https://other.example.com', page: 'docs/e.html', status: 451, error: null},
      ],
    }));
    expect(markdown).toBe([
      '# Documentation Site Change & Link Health Report',
      '',
      'Generated: 2026-07-02T00:00:00.000Z',
      'Workflow run: https://github.com/zilliztech/zdoc/actions/runs/1',
      `Tooling SHA: ${'a'.repeat(40)}`,
      `Content SHA: ${'b'.repeat(40)}`,
      'Remote sitemap: https://docs.zilliz.com/sitemap.xml',
      'Local sitemap: build/en/sitemap.xml',
      '',
      '## Summary',
      '',
      '- Deleted routes: 1',
      '- Added routes: 1',
      '- External URLs checked: 5',
      '- Healthy external URLs: 1',
      '- Confirmed expired external URLs: 1',
      '- Blocked external URLs: 1',
      '- Transient external URLs: 1',
      '- Other external URL responses: 1',
      '',
      '## Confirmed Expired External URLs',
      '',
      '> These URLs returned HTTP 404 or 410. They are likely removed or permanently unavailable and should be corrected, replaced, or removed.',
      '',
      '- https://expired.example.com',
      '  - Result: HTTP 404',
      '  - Referring pages: docs/a.html, docs/b.html',
      '  - Pages shown: 2 of 2',
      '',
      '## Blocked External URLs',
      '',
      '> These URLs returned HTTP 401 or 403. The scanner was denied access, so this does not prove the links are broken; review them only if users also cannot open them.',
      '',
      '- https://blocked.example.com',
      '  - Result: HTTP 403',
      '  - Referring pages: docs/c.html',
      '  - Pages shown: 1 of 1',
      '',
      '## Transient External URLs',
      '',
      '> These URLs failed because of network errors, timeouts, or retryable HTTP responses such as 408, 425, 429, or 5xx. They are not confirmed broken and should be checked again in a later run.',
      '',
      '- https://transient.example.com',
      '  - Result: Error: connection reset',
      '  - Referring pages: docs/d.html',
      '  - Pages shown: 1 of 1',
      '',
      '## Other External URL Responses',
      '',
      '> These URLs returned non-success responses that are not classified as expired, blocked, or transient. Review them manually to determine whether the response is expected.',
      '',
      '- https://other.example.com',
      '  - Result: HTTP 451',
      '  - Referring pages: docs/e.html',
      '  - Pages shown: 1 of 1',
      '',
      '## Deleted Routes',
      '',
      '> These routes exist in the production sitemap but are absent from the current `dev` build. They may represent intended removals or renames, or unexpected content loss.',
      '',
      '- https://docs.zilliz.com/docs/old/',
      '',
      '## Added Routes',
      '',
      '> These routes exist in the current `dev` build but not in the production sitemap. They are expected to become public after deployment, unless they represent unintended new routes.',
      '',
      '- https://docs.zilliz.com/docs/new/',
    ].join('\n'));
  });

  it('renders every unique URL and route without folding or truncation', () => {
    const statuses = {expired: 404, blocked: 403, transient: 503, other: 451} as const;
    const observations = Object.entries(statuses).flatMap(([classification, status]) => (
      Array.from({length: 12}, (_, index) => ({
        url: `https://${classification}-${index}.example.com`,
        pages: [`docs/${classification}-${index}.html`],
        status,
        error: null,
      }))
    ));
    const remoteUrls = Array.from({length: 12}, (_, index) => `https://docs.zilliz.com/docs/deleted-${index}/`);
    const localUrls = Array.from({length: 12}, (_, index) => `https://docs.zilliz.com/docs/added-${index}/`);
    const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
      generatedAt: '2026-07-02T00:00:00.000Z',
      toolingSha: 'a'.repeat(40),
      contentSha: 'b'.repeat(40),
      workflowRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
      remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
      localSitemapSource: 'build/en/sitemap.xml',
      remoteUrls,
      localUrls,
      checkedExternalLinks: observations.map(({url}) => ({url})),
      observations,
    }));

    for (const item of observations) expect(markdown).toContain(`- ${item.url}\n`);
    for (const url of [...remoteUrls, ...localUrls]) expect(markdown).toContain(`- ${url}`);
    expect(markdown).not.toContain('...and');
    expect(markdown).not.toContain('<details>');
    expect(markdown).not.toContain('</details>');
  });

  it('keeps explanations visible when detailed sections are empty', () => {
    const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
      generatedAt: '2026-07-02T00:00:00.000Z',
      toolingSha: null,
      contentSha: null,
      workflowRunUrl: null,
      remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
      localSitemapSource: 'build/en/sitemap.xml',
      remoteUrls: ['https://docs.zilliz.com/docs/shared/'],
      localUrls: ['https://docs.zilliz.com/docs/shared/'],
      checkedExternalLinks: [],
      observations: [],
    }));

    expect(markdown.match(/^- None$/gmu)).toHaveLength(6);
    expect(markdown).toContain('These URLs returned HTTP 404 or 410.');
    expect(markdown).toContain('These routes exist in the current `dev` build but not in the production sitemap.');
  });

  it('rejects a missing rendered-site build directory', async () => {
    const root = temporaryRoot();
    localSitemapFixture(root);

    await expect(checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      ...linkCheckDependencies,
      environment: {
        LINK_CHECKS_REMOTE_SITEMAP: 'fixtures/remote.xml',
        LINK_CHECKS_LOCAL_SITEMAP: 'fixtures/local.xml',
      },
    })).rejects.toThrow(/No rendered HTML pages exist below the configured content route roots/);
  });

  it('rejects a local sitemap with zero documentation routes', async () => {
    const root = temporaryRoot();
    localSitemapFixture(root, '<urlset/>');
    mkdirSync(path.join(root, 'build/en/docs'), {recursive: true});
    writeFileSync(path.join(root, 'build/en/docs/page.html'), '<main>No external URLs</main>');

    await expect(checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      ...linkCheckDependencies,
      environment: {
        LINK_CHECKS_REMOTE_SITEMAP: 'fixtures/remote.xml',
        LINK_CHECKS_LOCAL_SITEMAP: 'fixtures/local.xml',
      },
    })).rejects.toThrow('Local sitemap contains no documentation routes');
  });

  it('rejects a rendered build with no HTML below the configured content route roots', async () => {
    const root = temporaryRoot();
    localSitemapFixture(root);
    mkdirSync(path.join(root, 'build/en/unrelated'), {recursive: true});
    writeFileSync(path.join(root, 'build/en/unrelated/page.html'), '<main>Outside content roots</main>');

    await expect(checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      ...linkCheckDependencies,
      environment: {
        LINK_CHECKS_REMOTE_SITEMAP: 'fixtures/remote.xml',
        LINK_CHECKS_LOCAL_SITEMAP: 'fixtures/local.xml',
      },
    })).rejects.toThrow(/No rendered HTML pages exist below the configured content route roots/);
  });

  it('accepts a meaningful rendered scan with zero external URLs', async () => {
    const root = temporaryRoot();
    localSitemapFixture(root);
    mkdirSync(path.join(root, 'build/en/docs'), {recursive: true});
    writeFileSync(path.join(root, 'build/en/docs/page.html'), '<main>No external URLs</main>');

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      ...linkCheckDependencies,
      environment: {
        LINK_CHECKS_REMOTE_SITEMAP: 'fixtures/remote.xml',
        LINK_CHECKS_LOCAL_SITEMAP: 'fixtures/local.xml',
      },
    });

    expect(report.summary.checked_external_links).toBe(0);
    expect(report.summary.healthy_external_links).toBe(0);
  });

  it('rejects malformed rendered external URLs as an infrastructure failure', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, {'new.html': '<a class="external" href="http://[">Malformed</a>'});

    await expect(checkLinks(
      {repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'},
      linkCheckDependencies,
    )).rejects.toThrow(/Invalid URL|Invalid URL input/i);
  });

  it.each([
    [{LINK_CHECKS_TOOLING_SHA: 'a'.repeat(40)}, 'one supplied SHA'],
    [{LINK_CHECKS_CONTENT_SHA: 'b'.repeat(40)}, 'the other supplied SHA'],
    [{LINK_CHECKS_TOOLING_SHA: 'A'.repeat(40), LINK_CHECKS_CONTENT_SHA: 'b'.repeat(40)}, 'an uppercase SHA'],
    [{LINK_CHECKS_TOOLING_SHA: 'a'.repeat(39), LINK_CHECKS_CONTENT_SHA: 'b'.repeat(40)}, 'a short SHA'],
  ])('rejects %s before creating report files (%s)', async (environment, _case) => {
    const root = temporaryRoot();
    linkCheckFixture(root);

    await expect(checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      ...linkCheckDependencies,
      environment,
    })).rejects.toThrow(/tooling.*content.*40-character lowercase SHA|both.*valid/i);

    expect(existsSync(path.join(root, 'tmp/link-report.md'))).toBe(false);
    expect(existsSync(path.join(root, 'tmp/link-report.json'))).toBe(false);
  });

  it('uses null identity fields when neither SHA environment value is supplied', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);

    const report = await checkLinks(
      {repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'},
      linkCheckDependencies,
    );

    expect(report.tooling_sha).toBeNull();
    expect(report.content_sha).toBeNull();
    expect(() => LinkCheckReportSchema.parse(report)).not.toThrow();
  });

  it('checks a selected site and writes the requested Markdown and JSON report', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, linkCheckDependencies);
    const report = JSON.parse(readFileSync(path.join(root, 'tmp/link-report.json'), 'utf8'));
    expect(report.summary).toEqual({
      deleted_routes: 1,
      added_routes: 1,
      checked_external_links: 1,
      healthy_external_links: 0,
      expired_external_links: 1,
      blocked_external_links: 0,
      transient_external_links: 0,
      other_external_links: 0,
    });
    expect(readFileSync(path.join(root, 'tmp/link-report.md'), 'utf8')).toMatch(/https:\/\/bad\.example\.com/);
  });

  it('falls back from HEAD 405 to GET 200 and records a healthy result', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, {'new.html': '<a class="external" href="https://fallback.example.com">Fallback</a>'});
    const methods: string[] = [];

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        methods.push(init.method);
        return fetchResponse(init.method === 'HEAD' ? 405 : 200);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
    });

    expect(methods).toEqual(['HEAD', 'GET']);
    expect(report.summary).toMatchObject({checked_external_links: 1, healthy_external_links: 1});
    expect(report.expired_external_links).toEqual([]);
    expect(report.blocked_external_links).toEqual([]);
    expect(report.transient_external_links).toEqual([]);
    expect(report.other_external_links).toEqual([]);
  });

  it('extracts every direct external anchor from minified rendered HTML', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, {
      'new.html': [
        '<a href="https://first.example.com">First</a>',
        '<a href="/docs/internal">Internal</a>',
        '<a href="https://second.example.com/path">Second</a>',
      ].join(''),
    });
    const checked: string[] = [];

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        checked.push(String(url));
        return fetchResponse(200);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
      externalLinkAttempts: 1,
    });

    expect(checked.sort()).toEqual([
      'https://first.example.com',
      'https://second.example.com/path',
    ]);
    expect(report.summary).toMatchObject({checked_external_links: 2, healthy_external_links: 2});
  });

  it('classifies HEAD 403 followed by GET 403 as blocked', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, {'new.html': '<a class="external" href="https://blocked.example.com">Blocked</a>'});
    const methods: string[] = [];

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        methods.push(init.method);
        return fetchResponse(403);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
    });

    expect(methods).toEqual(['HEAD', 'GET']);
    expect(report.blocked_external_links).toEqual([expect.objectContaining({
      url: 'https://blocked.example.com',
      classification: 'blocked',
      status: 403,
      error: null,
    })]);
  });

  it.each([404, 410])('classifies HEAD %s as expired without a GET fallback', async status => {
    const root = temporaryRoot();
    externalLinkFixture(root, {'new.html': '<a class="external" href="https://expired.example.com">Expired</a>'});
    const methods: string[] = [];

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        methods.push(init.method);
        return fetchResponse(status);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
    });

    expect(methods).toEqual(['HEAD']);
    expect(report.expired_external_links).toEqual([expect.objectContaining({status, error: null})]);
  });

  it('retries HEAD 503 only up to the default bounded attempt count', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, {'new.html': '<a class="external" href="https://unavailable.example.com">Unavailable</a>'});
    const methods: string[] = [];

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        methods.push(init.method);
        return fetchResponse(503);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
    });

    expect(methods).toEqual(['HEAD', 'HEAD']);
    expect(report.transient_external_links).toEqual([expect.objectContaining({status: 503, error: null})]);
  });

  it('sends a range-limited GET fallback without reading either response body', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, {'new.html': '<a class="external" href="https://range.example.com">Range</a>'});
    const requests: Array<{method?: string; headers?: Record<string, string>; redirect?: string}> = [];
    let bodyReads = 0;

    await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        requests.push(init);
        return fetchResponse(init.method === 'HEAD' ? 405 : 200, () => { bodyReads += 1; });
      },
      now: fixedNow,
      write: () => {},
      environment: {},
    });

    expect(requests).toEqual([
      {method: 'HEAD', redirect: 'follow', signal: expect.any(AbortSignal), headers: {'Accept-Encoding': 'identity'}},
      {method: 'GET', redirect: 'follow', signal: expect.any(AbortSignal), headers: {'Accept-Encoding': 'identity', Range: 'bytes=0-0'}},
    ]);
    expect(bodyReads).toBe(0);
  });

  it('probes duplicate URLs once while retaining every referring page', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, {
      'a.html': '<a class="external" href="https://duplicate.example.com">Duplicate A</a>',
      'b.html': '<a class="external" href="https://duplicate.example.com">Duplicate B</a>',
    });
    let probes = 0;

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        probes += 1;
        return fetchResponse(404);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
      externalLinkAttempts: 1,
    });

    expect(probes).toBe(1);
    expect(report.expired_external_links).toEqual([expect.objectContaining({
      pages: ['docs/a.html', 'docs/b.html'],
      page_count: 2,
    })]);
  });

  it('preserves the full duplicate-page count while retaining five sorted pages', async () => {
    const root = temporaryRoot();
    externalLinkFixture(root, Object.fromEntries(['g', 'c', 'a', 'f', 'b', 'e', 'd'].map(name => [
      `${name}.html`,
      '<a class="external" href="https://many-pages.example.com">Many pages</a>',
    ])));
    let probes = 0;

    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        probes += 1;
        return fetchResponse(404);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
      externalLinkAttempts: 1,
    });

    expect(probes).toBe(1);
    expect(report.expired_external_links).toEqual([expect.objectContaining({
      pages: ['docs/a.html', 'docs/b.html', 'docs/c.html', 'docs/d.html', 'docs/e.html'],
      page_count: 7,
    })]);
  });

  it('checks external links under the Chinese on-premise content route', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'build/zh-CN/on-premise'), {recursive: true});
    writeFileSync(path.join(root, 'build/zh-CN/sitemap.xml'), '<urlset><url><loc>https://docs.zilliz.com/zh-CN/on-premise/install/</loc></url></urlset>');
    writeFileSync(path.join(root, 'build/zh-CN/on-premise/install.html'), '<a class="external" href="https://broken-on-prem.example.com">Broken</a>');
    const checked: string[] = [];

    const report = await checkLinks({repositoryRoot: root, site: 'zh-CN', output: 'tmp/link-report.md'}, {
      fetch: async (url, init) => {
        if (init?.method === 'HEAD') {
          checked.push(String(url));
          return {ok: false, status: 503, text: async () => ''};
        }
        return {ok: true, status: 200, text: async () => '<urlset/>'};
      },
      now: fixedNow,
      write: () => {},
      environment: {},
    });

    expect(checked).toEqual(['https://broken-on-prem.example.com', 'https://broken-on-prem.example.com']);
    expect(report.transient_external_links).toEqual([expect.objectContaining({
      url: 'https://broken-on-prem.example.com',
      pages: ['on-premise/install.html'],
      status: 503,
    })]);
  });

  it('bounds concurrent external-link requests', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'build/en/docs'), {recursive: true});
    writeFileSync(path.join(root, 'build/en/sitemap.xml'), '<urlset><url><loc>https://docs.zilliz.com/docs/links/</loc></url></urlset>');
    writeFileSync(path.join(root, 'build/en/docs/links.html'), Array.from({length: 5}, (_, index) => (
      `<a class="external" href="https://external-${index}.example.com">Link</a>`
    )).join('\n'));
    let active = 0;
    let maximumActive = 0;

    await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (init?.method !== 'HEAD') return {ok: true, status: 200, text: async () => '<urlset/>'};
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        await new Promise(resolve => setTimeout(resolve, 5));
        active -= 1;
        return {ok: true, status: 200, text: async () => ''};
      },
      now: fixedNow,
      write: () => {},
      environment: {},
      externalLinkConcurrency: 2,
      externalLinkTimeoutMs: 100,
    });

    expect(maximumActive).toBe(2);
  });

  it('bounds retries and sanitizes timeout observations', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    let attempts = 0;
    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init?: {method?: string; signal?: AbortSignal}) => {
        if (init?.method !== 'HEAD') return {ok: true, status: 200, text: async () => '<urlset/>'};
        attempts += 1;
        if (!init.signal) throw new Error('missing abort signal');
        return await new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new Error('request aborted')), {once: true});
        });
      },
      now: fixedNow,
      write: () => {},
      environment: {},
      externalLinkTimeoutMs: 10,
    });

    expect(attempts).toBe(2);
    expect(report.transient_external_links).toEqual([expect.objectContaining({
      url: 'https://bad.example.com',
      status: null,
      error: 'request timed out after 10ms',
    })]);
  });

  it('bounds retries and sanitizes connection-error observations', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    let attempts = 0;
    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init) => {
        if (!init?.method) return {ok: true, status: 200, text: async () => '<urlset/>'};
        attempts += 1;
        throw new Error(` connection\0 reset\n private\t detail ${'x'.repeat(300)}`);
      },
      now: fixedNow,
      write: () => {},
      environment: {},
    });

    expect(attempts).toBe(2);
    const observation = report.transient_external_links[0];
    expect(observation.status).toBeNull();
    expect(observation.error).toMatch(/^connection reset private detail x+/u);
    expect(observation.error).not.toMatch(/[\u0000-\u001f\u007f-\u009f]/u);
    expect(observation.error?.length).toBe(240);
  });

  it.each([0, 4, 1.5])('rejects an external-link attempt count outside 1-3: %s', async externalLinkAttempts => {
    const root = temporaryRoot();
    linkCheckFixture(root);

    await expect(checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      ...linkCheckDependencies,
      externalLinkAttempts,
    })).rejects.toThrow(/attempts.*integer between 1 and 3/i);
  });

  it.each([
    'link-report.json',
    `report_${fixedNow().getTime()}.md`,
    `report_${fixedNow().getTime()}.json`,
  ])('rejects a symlinked secondary output before creating any report files: %s', async maliciousName => {
    const root = temporaryRoot();
    const outside = path.join(temporaryRoot(), 'sentinel.txt');
    linkCheckFixture(root);
    mkdirSync(path.join(root, 'tmp'), {recursive: true});
    writeFileSync(outside, 'outside sentinel');
    symlinkSync(outside, path.join(root, 'tmp', maliciousName));

    await expect(checkLinks(
      {repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'},
      linkCheckDependencies,
    )).rejects.toThrow(/symlink/i);

    expect(readFileSync(outside, 'utf8')).toBe('outside sentinel');
    for (const name of ['link-report.md', 'link-report.json', `report_${fixedNow().getTime()}.md`, `report_${fixedNow().getTime()}.json`]) {
      if (name !== maliciousName) expect(existsSync(path.join(root, 'tmp', name))).toBe(false);
    }
  });

  it('rejects colliding final report paths before writing', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    const timestampedOutput = `tmp/report_${fixedNow().getTime()}.md`;

    await expect(checkLinks(
      {repositoryRoot: root, site: 'en', output: timestampedOutput},
      linkCheckDependencies,
    )).rejects.toThrow(/collision/i);

    expect(existsSync(path.join(root, timestampedOutput))).toBe(false);
    expect(existsSync(path.join(root, timestampedOutput.replace(/\.md$/u, '.json')))).toBe(false);
  });

  it('rejects a non-file secondary output before writing', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    mkdirSync(path.join(root, 'tmp/link-report.json'), {recursive: true});

    await expect(checkLinks(
      {repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'},
      linkCheckDependencies,
    )).rejects.toThrow(/regular file/i);

    expect(existsSync(path.join(root, 'tmp/link-report.md'))).toBe(false);
  });

  it.each([
    ['case', 'Link-Report.json', 'tmp/link-report.md'],
    ['Unicode normalization', 're\u0301sume\u0301.json', 'tmp/résumé.md'],
  ])('rejects a %s sibling collision before writing', async (_kind, existingName, output) => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    mkdirSync(path.join(root, 'tmp'), {recursive: true});
    writeFileSync(path.join(root, 'tmp', existingName), 'existing sibling');

    await expect(checkLinks(
      {repositoryRoot: root, site: 'en', output},
      linkCheckDependencies,
    )).rejects.toThrow(/collision/i);

    expect(readFileSync(path.join(root, 'tmp', existingName), 'utf8')).toBe('existing sibling');
    expect(existsSync(path.join(root, output))).toBe(false);
  });
});
