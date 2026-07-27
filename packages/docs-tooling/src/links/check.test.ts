import {existsSync, mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {resolveSiteProfile} from '@zilliz/site-config';

import {buildLinkCheckReport, checkLinks, contentRouteRoots, renderLinkCheckMarkdown, resolveWorkflowRunUrl} from './check.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-links-'));
}

function linkCheckFixture(root: string): void {
  mkdirSync(path.join(root, 'build/en/docs'), {recursive: true});
  writeFileSync(path.join(root, 'build/en/sitemap.xml'), '<urlset><url><loc>https://docs.zilliz.com/docs/new/</loc></url></urlset>');
  writeFileSync(path.join(root, 'build/en/docs/new.html'), '<a class="external" href="https://bad.example.com">Bad</a>');
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

  it('groups broken external links with their pages', () => {
    const report = buildLinkCheckReport({
      generatedAt: '2026-07-02T00:00:00.000Z',
      remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
      localSitemapSource: 'build/en/sitemap.xml',
      remoteUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/old/'],
      localUrls: ['https://docs.zilliz.com/docs/a/', 'https://docs.zilliz.com/docs/new/'],
      workflowRunUrl: 'https://github.com/zilliztech/zdoc/actions/runs/1',
      externalLinks: [
        {url: 'https://bad.example.com', page: 'docs/a.html', status: 404},
        {url: 'https://bad.example.com', page: 'docs/b.html', status: 404},
        {url: 'https://timeout.example.com', page: 'reference/c.html', error: 'timeout'},
      ],
    });
    expect(report.summary).toEqual({deleted_links: 1, added_links: 1, external_links: 2, broken_external_links: 2});
    expect(report.deleted).toEqual(['https://docs.zilliz.com/docs/old/']);
    expect(report.added).toEqual(['https://docs.zilliz.com/docs/new/']);
    expect(report.broken_external_links[0]).toMatchObject({url: 'https://bad.example.com', pages: ['docs/a.html', 'docs/b.html']});
  });

  it('renders the compact Feishu-ready summary', () => {
    const markdown = renderLinkCheckMarkdown(buildLinkCheckReport({
      generatedAt: '2026-07-02T00:00:00.000Z', remoteSitemapSource: 'https://docs.zilliz.com/sitemap.xml',
      localSitemapSource: 'build/en/sitemap.xml', remoteUrls: ['https://docs.zilliz.com/docs/old/'],
      localUrls: ['https://docs.zilliz.com/docs/new/'],
      externalLinks: [{url: 'https://bad.example.com', page: 'docs/a.html', status: 404}],
    }));
    expect(markdown).toMatch(/Deleted routes: 1/);
    expect(markdown).toMatch(/Added routes: 1/);
    expect(markdown).toMatch(/Broken external URLs: 1/);
  });

  it('checks a selected site and writes the requested Markdown and JSON report', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, linkCheckDependencies);
    const report = JSON.parse(readFileSync(path.join(root, 'tmp/link-report.json'), 'utf8'));
    expect(report.summary).toEqual({deleted_links: 1, added_links: 1, external_links: 1, broken_external_links: 1});
    expect(readFileSync(path.join(root, 'tmp/link-report.md'), 'utf8')).toMatch(/https:\/\/bad\.example\.com/);
  });

  it('checks external links under the Chinese on-premise content route', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'build/zh-CN/on-premise'), {recursive: true});
    writeFileSync(path.join(root, 'build/zh-CN/sitemap.xml'), '<urlset/>');
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

    expect(checked).toEqual(['https://broken-on-prem.example.com']);
    expect(report.broken_external_links).toEqual([expect.objectContaining({
      url: 'https://broken-on-prem.example.com',
      pages: ['on-premise/install.html'],
      status: 503,
    })]);
  });

  it('bounds concurrent external-link requests', async () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'build/en/docs'), {recursive: true});
    writeFileSync(path.join(root, 'build/en/sitemap.xml'), '<urlset/>');
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

  it('aborts and reports an external-link request after its timeout', async () => {
    const root = temporaryRoot();
    linkCheckFixture(root);
    const report = await checkLinks({repositoryRoot: root, site: 'en', output: 'tmp/link-report.md'}, {
      fetch: async (_url, init?: {method?: string; signal?: AbortSignal}) => {
        if (init?.method !== 'HEAD') return {ok: true, status: 200, text: async () => '<urlset/>'};
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

    expect(report.broken_external_links).toEqual([expect.objectContaining({
      url: 'https://bad.example.com',
      error: 'External link request timed out after 10ms',
    })]);
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
