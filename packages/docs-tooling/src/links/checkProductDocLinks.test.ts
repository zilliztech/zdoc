import {existsSync, mkdtempSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  buildProductDocLinkReport,
  checkProductDocLinks,
  classifyProductDocLink,
  probeProductDocLink,
  renderProductDocLinkMarkdown,
  type ProbeFetch,
  type ProbeResult,
} from './checkProductDocLinks.ts';
import type {ProductDocLinkEntry} from './productDocLinks.ts';

type RecordedRequest = {url: string; method?: 'HEAD' | 'GET'};

type StubRoute = {
  status: number;
  location?: string;
  fail?: boolean;
};

function stubFetch(routes: Record<string, StubRoute | StubRoute[]>): {fetch: ProbeFetch; requests: RecordedRequest[]} {
  const requests: RecordedRequest[] = [];
  const fetch: ProbeFetch = async (url, init) => {
    const wire = url.toString();
    requests.push({url: wire, method: init?.method});
    const route = routes[wire];
    const resolved = Array.isArray(route) ? route[requests.filter(item => item.url === wire).length - 1] : route;
    if (!resolved) throw new Error(`unexpected probe URL: ${wire}`);
    if (resolved.fail) throw new Error('connection reset');
    return {
      status: resolved.status,
      headers: (name: string) => (name.toLowerCase() === 'location' ? resolved.location ?? null : null),
    };
  };
  return {fetch, requests};
}

const probeOptions = {timeoutMs: 1000, attempts: 2, maxRedirects: 5};

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-product-links-'));
}

const FIXTURE_LINK_SOURCE = `
import { IS_CLOUD_LANGUAGE_EN } from "@/Utils/ProductType";
const EN_DOC = \`https://docs.zilliz.com/docs\`;
export const DIRECT_DOC = \`\${EN_DOC}/direct\`;
export const REDIRECTED_DOC = \`\${EN_DOC}/redirected\`;
export const BROKEN_DOC = \`\${EN_DOC}/gone\`;
export const ANOMALY_DOC = \`https://docs.cloud-uat3.zilliz.com/docs/anomaly\`;
export const FLAKY_DOC = \`\${EN_DOC}/flaky\`;
`;

const FIXTURE_ENTRIES: ProductDocLinkEntry[] = [
  {url: 'https://docs.zilliz.com/docs/direct', scope: 'primary', constants: ['DIRECT_DOC']},
  {url: 'https://docs.zilliz.com/docs/redirected#section', scope: 'primary', constants: ['REDIRECTED_DOC']},
  {url: 'https://docs.zilliz.com/docs/gone', scope: 'primary', constants: ['BROKEN_DOC']},
  {url: 'https://docs.cloud-uat3.zilliz.com/docs/anomaly', scope: 'unknown-docs-domain', constants: ['ANOMALY_DOC']},
  {url: 'https://docs.zilliz.com/docs/flaky', scope: 'primary', constants: ['FLAKY_DOC']},
];

describe('probeProductDocLink', () => {
  it('reports direct responses with zero redirects and strips fragments from the wire', async () => {
    const {fetch, requests} = stubFetch({
      'https://docs.zilliz.com/docs/direct': {status: 200},
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/direct#heading', fetch, probeOptions);
    expect(result).toEqual({status: 200, finalUrl: 'https://docs.zilliz.com/docs/direct', redirectCount: 0, error: null});
    expect(requests.every(request => !request.url.includes('#'))).toBe(true);
    expect(requests[0]?.method).toBe('HEAD');
  });

  it('requests redirects to stay visible instead of being auto-followed', async () => {
    const seenRedirectModes: (string | undefined)[] = [];
    const fetch: ProbeFetch = async (_url, init) => {
      seenRedirectModes.push(init?.redirect);
      return {status: 200, headers: () => null};
    };
    await probeProductDocLink('https://docs.zilliz.com/docs/direct', fetch, probeOptions);
    expect(seenRedirectModes.every(mode => mode === 'manual')).toBe(true);
  });

  it('normalizes Headers-like response objects from the global fetch', async () => {
    const fetch: ProbeFetch = async () => ({
      status: 301,
      headers: {get: (name: string) => (name.toLowerCase() === 'location' ? '/docs/final' : null)},
    } as unknown as {status: number; headers: (name: string) => string | null});
    const follow: ProbeFetch = async () => ({
      status: 200,
      headers: {get: () => null},
    } as unknown as {status: number; headers: (name: string) => string | null});
    let call = 0;
    const mixed: ProbeFetch = async (url, init) => (call++ === 0 ? fetch(url, init) : follow(url, init));
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/redirected', mixed, probeOptions);
    expect(result.status).toBe(200);
    expect(result.finalUrl).toBe('https://docs.zilliz.com/docs/final');
    expect(result.redirectCount).toBe(1);
  });

  it('walks redirect chains and records the landing URL', async () => {
    const {fetch} = stubFetch({
      'https://docs.zilliz.com/docs/redirected': [
        {status: 301, location: 'https://docs.zilliz.com/docs/renamed'},
        {status: 301, location: '/docs/final'},
      ],
      'https://docs.zilliz.com/docs/renamed': {status: 301, location: '/docs/final'},
      'https://docs.zilliz.com/docs/final': {status: 200},
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/redirected', fetch, probeOptions);
    expect(result.status).toBe(200);
    expect(result.finalUrl).toBe('https://docs.zilliz.com/docs/final');
    expect(result.redirectCount).toBe(2);
    expect(result.error).toBeNull();
  });

  it('detects redirect loops', async () => {
    const {fetch} = stubFetch({
      'https://docs.zilliz.com/docs/loop': [
        {status: 301, location: '/docs/loop-2'},
        {status: 301, location: '/docs/loop'},
      ],
      'https://docs.zilliz.com/docs/loop-2': {status: 301, location: '/docs/loop'},
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/loop', fetch, probeOptions);
    expect(result.error).toBe('redirect loop detected');
    expect(result.status).toBeNull();
  });

  it('rejects redirect responses without a location header', async () => {
    const {fetch} = stubFetch({
      'https://docs.zilliz.com/docs/bare': {status: 302},
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/bare', fetch, probeOptions);
    expect(result.error).toBe('redirect response without a location header');
    expect(result.status).toBe(302);
  });

  it('stops walking beyond maxRedirects', async () => {
    const {fetch} = stubFetch({
      'https://docs.zilliz.com/docs/one': {status: 301, location: '/docs/two'},
      'https://docs.zilliz.com/docs/two': {status: 301, location: '/docs/three'},
      'https://docs.zilliz.com/docs/three': {status: 200},
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/one', fetch, {...probeOptions, maxRedirects: 1});
    expect(result.error).toBe('more than 1 redirects');
  });

  it('falls back to GET when HEAD is rejected', async () => {
    const {fetch, requests} = stubFetch({
      'https://docs.zilliz.com/docs/direct': [
        {status: 405},
        {status: 200},
      ],
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/direct', fetch, probeOptions);
    expect(result.status).toBe(200);
    expect(requests.map(request => request.method)).toEqual(['HEAD', 'GET']);
  });

  it('retries retryable statuses before succeeding', async () => {
    const {fetch, requests} = stubFetch({
      'https://docs.zilliz.com/docs/flaky': [
        {status: 503},
        {status: 200},
      ],
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/flaky', fetch, probeOptions);
    expect(result.status).toBe(200);
    expect(requests).toHaveLength(2);
  });

  it('surfaces network errors as transient failures', async () => {
    const {fetch} = stubFetch({
      'https://docs.zilliz.com/docs/gone': {status: 200, fail: true},
    });
    const result = await probeProductDocLink('https://docs.zilliz.com/docs/gone', fetch, {...probeOptions, attempts: 1});
    expect(result.status).toBeNull();
    expect(result.error).toBe('connection reset');
  });
});

describe('classifyProductDocLink', () => {
  const base: ProbeResult = {status: 200, finalUrl: 'https://docs.zilliz.com/docs/x', redirectCount: 0, error: null};
  it('separates direct from redirect-dependent health', () => {
    expect(classifyProductDocLink(base)).toBe('direct');
    expect(classifyProductDocLink({...base, redirectCount: 1})).toBe('redirected');
  });
  it('classifies the failure buckets', () => {
    expect(classifyProductDocLink({...base, status: 404})).toBe('broken');
    expect(classifyProductDocLink({...base, status: 410})).toBe('broken');
    expect(classifyProductDocLink({...base, status: 403})).toBe('blocked');
    expect(classifyProductDocLink({...base, status: 429})).toBe('transient');
    expect(classifyProductDocLink({...base, status: null, error: 'request timed out after 1000ms'})).toBe('transient');
    expect(classifyProductDocLink({...base, status: 418})).toBe('other');
  });
});

describe('buildProductDocLinkReport', () => {
  it('buckets observations, cross-counts unknown hosts, and validates bucket sums', () => {
    const observations = FIXTURE_ENTRIES.map(entry => buildObservationFor(entry));
    const report = buildProductDocLinkReport({
      generatedAt: '2026-09-20T00:00:00.000Z',
      source: 'fixture://Link.ts',
      sourceRevision: null,
      entries: FIXTURE_ENTRIES,
      observations,
      workflowRunUrl: null,
    });
    expect(report.summary.checked).toBe(5);
    expect(report.summary.direct).toBe(3);
    expect(report.summary.redirected).toBe(1);
    expect(report.summary.broken).toBe(1);
    expect(report.summary.unknown_docs_domain).toBe(1);
    expect(report.broken_links.map(item => item.url)).toEqual(['https://docs.zilliz.com/docs/gone']);
    expect(report.redirected_links[0]?.final_url).toBe('https://docs.zilliz.com/docs/renamed');
    expect(report.unknown_docs_domain_links.map(item => item.constants[0])).toEqual(['ANOMALY_DOC']);
  });
});

function buildObservationFor(entry: ProductDocLinkEntry) {
  const outcomes: Record<string, ProbeResult> = {
    'https://docs.zilliz.com/docs/direct': {status: 200, finalUrl: entry.url, redirectCount: 0, error: null},
    'https://docs.zilliz.com/docs/redirected#section': {status: 200, finalUrl: 'https://docs.zilliz.com/docs/renamed', redirectCount: 1, error: null},
    'https://docs.zilliz.com/docs/gone': {status: 404, finalUrl: entry.url, redirectCount: 0, error: null},
    'https://docs.cloud-uat3.zilliz.com/docs/anomaly': {status: 200, finalUrl: entry.url, redirectCount: 0, error: null},
    'https://docs.zilliz.com/docs/flaky': {status: 200, finalUrl: entry.url, redirectCount: 0, error: null},
  };
  const result = outcomes[entry.url];
  if (!result) throw new Error(`no fixture outcome for ${entry.url}`);
  return {
    url: entry.url,
    scope: entry.scope,
    health: entry.url.includes('gone') ? 'broken' as const : entry.url.includes('redirected') ? 'redirected' as const : 'direct' as const,
    status: result.status,
    final_url: result.finalUrl,
    redirect_count: result.redirectCount,
    error: result.error,
    constants: entry.constants,
  };
}

describe('renderProductDocLinkMarkdown', () => {
  it('renders summary, constants, and redirect landing pages', () => {
    const observations = FIXTURE_ENTRIES.map(entry => buildObservationFor(entry));
    const report = buildProductDocLinkReport({
      generatedAt: '2026-09-20T00:00:00.000Z',
      source: 'fixture://Link.ts',
      sourceRevision: null,
      entries: FIXTURE_ENTRIES,
      observations,
      workflowRunUrl: null,
    });
    const markdown = renderProductDocLinkMarkdown(report);
    expect(markdown).toContain('# Product UI Doc Links Watchdog Report');
    expect(markdown).toContain('- Checked URLs: 5');
    expect(markdown).toContain('- Broken: 1');
    expect(markdown).toContain('## Broken Links');
    expect(markdown).toContain('## Non-Production Docs Hosts');
    expect(markdown).toContain('https://docs.zilliz.com/docs/gone');
    expect(markdown).toContain('Constants: BROKEN_DOC');
    expect(markdown).toContain('after 1 redirect(s)');
    expect(markdown).toContain('Lands on: https://docs.zilliz.com/docs/renamed');
  });
});

describe('checkProductDocLinks', () => {
  const routes: Record<string, StubRoute | StubRoute[]> = {
    'https://docs.zilliz.com/docs/direct': {status: 200},
    'https://docs.zilliz.com/docs/redirected': {status: 301, location: 'https://docs.zilliz.com/docs/renamed'},
    'https://docs.zilliz.com/docs/renamed': {status: 200},
    'https://docs.zilliz.com/docs/gone': {status: 404},
    'https://docs.cloud-uat3.zilliz.com/docs/anomaly': {status: 200},
    'https://docs.zilliz.com/docs/flaky': {status: 200},
  };

  function commandDependencies(root: string) {
    const {fetch} = stubFetch(routes);
    return {
      fetch,
      readSource: async (source: string) => {
        expect(source).toBe('fixture://Link.ts');
        return FIXTURE_LINK_SOURCE;
      },
      now: () => new Date('2026-09-20T00:00:00.000Z'),
      write: () => undefined,
      environment: {},
    };
  }

  it('extracts, probes, and writes md and json reports atomically', async () => {
    const root = temporaryRoot();
    const report = await checkProductDocLinks(
      {repositoryRoot: root, output: 'tmp/report.md', source: 'fixture://Link.ts'},
      commandDependencies(root),
    );
    expect(report.summary.checked).toBe(5);
    expect(report.summary.broken).toBe(1);
    expect(report.summary.redirected).toBe(1);
    expect(report.summary.unknown_docs_domain).toBe(1);
    const markdown = readFileSync(path.join(root, 'tmp/report.md'), 'utf8');
    const json = JSON.parse(readFileSync(path.join(root, 'tmp/report.json'), 'utf8'));
    expect(markdown).toContain('Broken: 1');
    expect(json.summary.checked).toBe(5);
    expect(existsSync(path.join(root, 'tmp/report.md'))).toBe(true);
  });

  it('rejects non-markdown outputs and malformed revisions', async () => {
    const root = temporaryRoot();
    await expect(checkProductDocLinks(
      {repositoryRoot: root, output: 'tmp/report.txt', source: 'fixture://Link.ts'},
      commandDependencies(root),
    )).rejects.toThrow(/must end in \.md/u);
    await expect(checkProductDocLinks(
      {repositoryRoot: root, output: 'tmp/report.md', source: 'fixture://Link.ts', sourceRevision: 'not-a-sha'},
      commandDependencies(root),
    )).rejects.toThrow(/40-character lowercase SHA/u);
  });

  it('keeps the whole run broken when extraction fails loudly', async () => {
    const root = temporaryRoot();
    await expect(checkProductDocLinks(
      {repositoryRoot: root, output: 'tmp/report.md', source: 'fixture://Link.ts'},
      {
        ...commandDependencies(root),
        readSource: async () => 'export const NOT_LINKS = 1;',
      },
    )).rejects.toThrow(/does not reference the zilliz docs hosts/u);
  });
});
