import {describe, expect, it} from 'vitest';

import {analyzeBrokenLinks, pathInfo} from './brokenLinkAnalysis.ts';
import type {SourceRecord} from './brokenLinkAnalysis.ts';
import {parseBrokenLinksReport} from './brokenLinks.ts';

function report(brokenLinks: Array<{link: string; resolvedLink: string; anchor: boolean; path: string}>, brokenAnchors: Array<{link: string; resolvedLink: string; anchor: boolean; path: string}> = []) {
  return parseBrokenLinksReport({
    schema_version: 1,
    generated_at: '2026-08-26T00:00:00.000Z',
    site: 'en',
    workflow_run_url: null,
    local_sitemap_source: 'build/en/sitemap.xml',
    summary: {checked_internal_links: brokenLinks.length + brokenAnchors.length, broken_links: brokenLinks.length, broken_anchors: brokenAnchors.length},
    broken_links: brokenLinks,
    broken_anchors: brokenAnchors,
  });
}

const records: SourceRecord[] = [
  {recordId: 'r1', slug: 'pattern-match', title: 'Pattern Matching', docLink: 'https://zilliverse.feishu.cn/wiki/NqgAww', targets: ['zilliz.saas', 'zilliz.paas'], publishable: true},
  {recordId: 'r2', slug: 'integrate-with-alibaba-cloud-oss', title: 'Alibaba OSS', docLink: 'https://zilliverse.feishu.cn/wiki/IwAbwx', targets: ['zilliz.saas'], publishable: true},
  {recordId: 'r3', slug: 'use-text-field', title: 'Text Field', docLink: 'https://zilliverse.feishu.cn/wiki/QD5jwH', targets: ['zilliz.saas', 'zilliz.paas'], publishable: false},
  {recordId: 'r4', slug: 'migrations', title: 'Migrations', docLink: 'http://Migrations', targets: [], publishable: false},
];

describe('pathInfo', () => {
  it('derives paas/saas/reference groups and slugs', () => {
    expect(pathInfo('/docs/byoc/basic-filtering-operators')).toEqual({kind: 'docs', slug: 'basic-filtering-operators', group: 'paas'});
    expect(pathInfo('/docs/filtering-overview')).toEqual({kind: 'docs', slug: 'filtering-overview', group: 'saas'});
    expect(pathInfo('/reference/cli/cli/overview')).toEqual({kind: 'reference', slug: 'overview', group: 'reference'});
    expect(pathInfo('/docs/agents/zilliz-plugin')).toEqual({kind: 'agents', slug: 'zilliz-plugin', group: 'agents'});
  });

  it('strips anchors before deriving slug', () => {
    expect(pathInfo('/docs/index-scalar-fields#overview')).toEqual({kind: 'docs', slug: 'index-scalar-fields', group: 'saas'});
  });
});

describe('analyzeBrokenLinks', () => {
  it('classifies a paas source linking to a saas-only target as target-missing-group', () => {
    const result = analyzeBrokenLinks(report([
      {link: './integrate-with-alibaba-cloud-oss', resolvedLink: '/docs/byoc/integrate-with-alibaba-cloud-oss', anchor: false, path: '/docs/byoc/configure-access-logs'},
    ]), records);
    expect(result.items[0].category).toBe('target-missing-group');
    expect(result.summary.target_missing_group).toBe(1);
  });

  it('classifies a missing slug as target-missing', () => {
    const result = analyzeBrokenLinks(report([
      {link: './connect-to-cluster', resolvedLink: '/docs/connect-to-cluster', anchor: false, path: '/docs/home'},
    ]), records);
    expect(result.items[0].category).toBe('target-missing');
  });

  it('classifies a WIP (non-publishable) target as target-missing', () => {
    const result = analyzeBrokenLinks(report([
      {link: './use-text-field', resolvedLink: '/docs/use-text-field', anchor: false, path: '/docs/use-string-field'},
    ]), records);
    expect(result.items[0].category).toBe('target-missing');
  });

  it('classifies a reference/agents target as reference', () => {
    const result = analyzeBrokenLinks(report([
      {link: '/docs/agents/zilliz-plugin', resolvedLink: '/docs/agents/zilliz-plugin', anchor: false, path: '/docs/cli-and-agent-integration-guide'},
    ]), records);
    expect(result.items[0].category).toBe('reference');
    expect(result.summary.reference).toBe(1);
  });

  it('classifies a broken anchor as anchor', () => {
    const result = analyzeBrokenLinks(report([], [
      {link: './json-indexing#compatibility-reference', resolvedLink: '/docs/json-indexing#compatibility-reference', anchor: true, path: '/docs/json-indexing'},
    ]), []);
    expect(result.items[0].category).toBe('anchor');
    expect(result.summary.broken_anchors).toBe(1);
  });

  it('matches by slug and reports the target doc link and title', () => {
    const result = analyzeBrokenLinks(report([
      {link: './integrate-with-alibaba-cloud-oss', resolvedLink: '/docs/byoc/integrate-with-alibaba-cloud-oss', anchor: false, path: '/docs/byoc/configure-access-logs'},
    ]), records);
    expect(result.items[0].target.title).toBe('Alibaba OSS');
    expect(result.items[0].target.docLink).toBe('https://zilliverse.feishu.cn/wiki/IwAbwx');
  });
});
