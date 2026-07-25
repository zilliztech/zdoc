import {mkdtempSync, realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {createZhCnPublicationAdapterRegistry} from '../registry.ts';
import type {PublicationContext} from '../types.ts';
import {ZH_CN_ALIYUN_OSS_ID} from './aliyunOss.ts';
import {compactRestTableFixture, restReplacementFixture} from './legacyFixtures.ts';
import {ZH_CN_REST_REPLACEMENTS_ID} from './restReplacements.ts';

function context(site: 'en' | 'zh-CN', manual = 'rest'): PublicationContext {
  return {
    site,
    manual,
    publicationRoot: mkdtempSync(path.join(tmpdir(), 'zh-cn-rest-')),
    baselineCommit: 'sha256:baseline',
    sourceIdentity: {type: 'git', repository: 'zilliztech/zdoc', revision: 'abc123'},
  };
}

function frontmatter(contents: string): string {
  const end = contents.indexOf('\n---\n');
  return contents.slice(0, end + 5);
}

function tablePipes(contents: string): string[] {
  return contents.split(/\r?\n/u).filter(line => line.startsWith('|')).map(line => line.replace(/[^|]/gu, ''));
}

describe('zh-CN REST replacement adapter', () => {
  it('applies representative replacements only to the Chinese REST publication', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const document = {path: 'reference/api/restful/page.mdx', contents: restReplacementFixture.input};

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], document, context('zh-CN')).contents)
      .toBe(restReplacementFixture.output);
    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], document, context('en'))).toEqual(document);
    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], document, context('zh-CN', 'python'))).toEqual(document);
  });

  it('is idempotent and preserves REST table and slug structure', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const publicationContext = context('zh-CN');
    const once = registry.transformDocument(
      [ZH_CN_REST_REPLACEMENTS_ID],
      {path: 'reference/api/restful/page.mdx', contents: restReplacementFixture.input},
      publicationContext,
    );

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], once, publicationContext)).toEqual(once);
    expect(frontmatter(once.contents)).toBe(frontmatter(restReplacementFixture.input));
    expect(once.contents.split('\n')).toContain('| :--- | ---: |');
    expect(tablePipes(once.contents)).toEqual(tablePipes(restReplacementFixture.input));
  });

  it('preserves BOM, CRLF, and unterminated frontmatter fail-safe', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const publicationContext = context('zh-CN');
    const valid = '\uFEFF---\r\nslug: https://YOUR_CLUSTER_ENDPOINT\r\ncloudId: aws\r\n---\r\n\r\ncloudId: aws\r\n';
    const expected = '\uFEFF---\r\nslug: https://YOUR_CLUSTER_ENDPOINT\r\ncloudId: aws\r\n---\r\n\r\ncloudId: ali\r\n';
    const unterminated = '\uFEFF---\r\nslug: https://YOUR_CLUSTER_ENDPOINT\r\ncloudId: aws\r\n';

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], {path: 'page.mdx', contents: valid}, publicationContext).contents).toBe(expected);
    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], {path: 'page.mdx', contents: unterminated}, publicationContext).contents).toBe(unterminated);
  });

  it('preserves every pipe in compact REST tables across endpoint and storage replacements', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const output = registry.transformDocument(
      [ZH_CN_REST_REPLACEMENTS_ID],
      {path: 'compact.mdx', contents: compactRestTableFixture.input},
      context('zh-CN'),
    ).contents;

    expect(output).toBe(compactRestTableFixture.output);
    expect(output.split('\n')[1]).toBe('|---|---|');
    expect(tablePipes(output)).toEqual(tablePipes(compactRestTableFixture.input));
    expect(output.split('\n').filter(Boolean).every(line => (line.match(/\|/gu) ?? []).length === 3)).toBe(true);
  });

  it('normalizes quoted JSON-style provider and region fields without changing prose', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      '```json',
      '{"cloudId":"aws","region_id":"gcp-us-west1"}',
      '```',
      "inline = {'cloud_id': 'azure', 'regionId' = 'az-eastus'}",
      'The "cloudId" prose mentions aws and region_id gcp-us-west1 without assigning values.',
      'mycloudId=aws and region_id_suffix=gcp-us-west1 are unrelated identifiers.',
    ].join('\n');
    const expected = [
      '```json',
      '{"cloudId":"ali","region_id":"ali-cn-hangzhou"}',
      '```',
      "inline = {'cloud_id': 'ali', 'regionId' = 'ali-cn-hangzhou'}",
      'The "cloudId" prose mentions aws and region_id gcp-us-west1 without assigning values.',
      'mycloudId=aws and region_id_suffix=gcp-us-west1 are unrelated identifiers.',
    ].join('\n');

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], {path: 'fields.mdx', contents: input}, context('zh-CN')).contents).toBe(expected);
  });

  it('replaces only standalone endpoint placeholder tokens', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      '{"endpoint":"YOUR_CLUSTER_ENDPOINT"}',
      '{"endpoint":"https://YOUR_PROJECT_ENDPOINT"}',
      'NOTYOUR_CLUSTER_ENDPOINT',
      'YOUR_CLUSTER_ENDPOINT_SUFFIX',
      'prefixYOUR_PROJECT_ENDPOINT',
      '{someYOUR_GLOBAL_ENDPOINTValue}',
    ].join('\n');
    const expected = [
      '{"endpoint":"https://{cluster-id}.{region}.vectordb.zilliz.com.cn:19530"}',
      '{"endpoint":"https://{project-id}.{region}.api.cloud.zilliz.com.cn"}',
      'NOTYOUR_CLUSTER_ENDPOINT',
      'YOUR_CLUSTER_ENDPOINT_SUFFIX',
      'prefixYOUR_PROJECT_ENDPOINT',
      '{someYOUR_GLOBAL_ENDPOINTValue}',
    ].join('\n');

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], {path: 'tokens.mdx', contents: input}, context('zh-CN')).contents).toBe(expected);
  });

  it('uses JavaScript-compatible Unicode identifier boundaries for endpoint placeholders', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      '"YOUR_CLUSTER_ENDPOINT"',
      'https://YOUR_PROJECT_ENDPOINT',
      '变量YOUR_CLUSTER_ENDPOINT',
      'YOUR_CLUSTER_ENDPOINT变量',
      '$YOUR_PROJECT_ENDPOINT',
      'YOUR_PROJECT_ENDPOINT$cache',
      `prefix\u200CYOUR_GLOBAL_ENDPOINT`,
      `YOUR_GLOBAL_ENDPOINT\u200Dsuffix`,
    ].join('\n');
    const expected = [
      '"https://{cluster-id}.{region}.vectordb.zilliz.com.cn:19530"',
      'https://{project-id}.{region}.api.cloud.zilliz.com.cn',
      '变量YOUR_CLUSTER_ENDPOINT',
      'YOUR_CLUSTER_ENDPOINT变量',
      '$YOUR_PROJECT_ENDPOINT',
      'YOUR_PROJECT_ENDPOINT$cache',
      `prefix\u200CYOUR_GLOBAL_ENDPOINT`,
      `YOUR_GLOBAL_ENDPOINT\u200Dsuffix`,
    ].join('\n');

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], {path: 'unicode-tokens.mdx', contents: input}, context('zh-CN')).contents).toBe(expected);
  });

  it('collapses repeated cn suffixes only on REST target endpoint families and stays idempotent', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const publicationContext = context('zh-CN');
    const input = [
      'https://api.cloud.zilliz.com.cn.cn.cn/v2/projects?limit=10#page',
      'https://{project-id}.{region}.api.cloud.zilliz.com.cn.cn/v2/jobs?x=1#result',
      'https://demo.serverless.us-west-2.cloud.zilliz.com.cn.cn/query?x=1#result',
      'https://demo.us-west-2.vectordb.zilliz.com.cn.cn.cn:19530/path?x=1#result',
      'https://unrelated.zilliz.com.cn.cn/path',
      'https://vectordb.zilliz.com.cn.cn.evil/path',
    ].join('\n');
    const expected = [
      'https://api.cloud.zilliz.com.cn/v2/projects?limit=10#page',
      'https://{project-id}.{region}.api.cloud.zilliz.com.cn/v2/jobs?x=1#result',
      'https://demo.serverless.us-west-2.cloud.zilliz.com.cn/query?x=1#result',
      'https://demo.us-west-2.vectordb.zilliz.com.cn:19530/path?x=1#result',
      'https://unrelated.zilliz.com.cn.cn/path',
      'https://vectordb.zilliz.com.cn.cn.evil/path',
    ].join('\n');

    const once = registry.transformDocument(
      [ZH_CN_REST_REPLACEMENTS_ID],
      {path: 'repeated-cn.mdx', contents: input},
      publicationContext,
    );

    expect(once.contents).toBe(expected);
    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], once, publicationContext)).toEqual(once);
  });

  it('requires terminal host boundaries for every legacy endpoint family', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      '|control|https://api.cloud.zilliz.com:443/v2/projects?limit=10#page|',
      '|project|https://project.region.api.zillizcloud.com:443/v2/jobs?x=1#result|',
      '|serverless|https://cluster.serverless.region.vectordb.zillizcloud.com:19530/v1/vector?x=1#result|',
      '|cluster|https://cluster.api.region.zillizcloud.com:19530/v1/vector?x=1#result|',
      'https://api.cloud.zilliz.com.evil/v2/projects',
      'https://project.region.api.zillizcloud.com.evil/v2/jobs',
      'https://cluster.serverless.region.vectordb.zillizcloud.com.evil/v1/vector',
      'https://cluster.api.region.zillizcloud.com.evil/v1/vector',
      'https://cluster.region.vectordb.zillizcloud.com.evil/v1/vector',
    ].join('\n');
    const expected = [
      '|control|https://api.cloud.zilliz.com.cn:443/v2/projects?limit=10#page|',
      '|project|https://project.region.api.cloud.zilliz.com.cn:443/v2/jobs?x=1#result|',
      '|serverless|https://cluster.serverless.region.cloud.zilliz.com.cn:19530/v1/vector?x=1#result|',
      '|cluster|https://cluster.region.vectordb.zilliz.com.cn:19530/v1/vector?x=1#result|',
      'https://api.cloud.zilliz.com.evil/v2/projects',
      'https://project.region.api.zillizcloud.com.evil/v2/jobs',
      'https://cluster.serverless.region.vectordb.zillizcloud.com.evil/v1/vector',
      'https://cluster.api.region.zillizcloud.com.evil/v1/vector',
      'https://cluster.region.vectordb.zillizcloud.com.evil/v1/vector',
    ].join('\n');

    const output = registry.transformDocument(
      [ZH_CN_REST_REPLACEMENTS_ID],
      {path: 'legacy-host-boundaries.mdx', contents: input},
      context('zh-CN'),
    ).contents;

    expect(output).toBe(expected);
    expect(tablePipes(output)).toEqual(tablePipes(input));
  });

  it('requires Unicode-safe field names and complete provider and region value tokens', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      'cloudId=aws',
      '"cloud_id":"gcp"',
      'regionId=aws-us-west-2',
      '"region_id":"gcp-us-west1"',
      'cloudId=aws-west',
      'regionId=aws-us-west-2-test',
      'cloudId=gcpX',
      '变量cloudId=aws',
      '$cloudId=aws',
      `prefix\u200CregionId=aws-us-west-2`,
      `prefix\u200Dcloud_id=gcp`,
    ].join('\n');
    const expected = [
      'cloudId=ali',
      '"cloud_id":"ali"',
      'regionId=ali-cn-hangzhou',
      '"region_id":"ali-cn-hangzhou"',
      'cloudId=aws-west',
      'regionId=aws-us-west-2-test',
      'cloudId=gcpX',
      '变量cloudId=aws',
      '$cloudId=aws',
      `prefix\u200CregionId=aws-us-west-2`,
      `prefix\u200Dcloud_id=gcp`,
    ].join('\n');

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], {path: 'field-boundaries.mdx', contents: input}, context('zh-CN')).contents).toBe(expected);
  });

  it('uses the same allowlisted decorated http tags as the Markdown normalizer', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      '<strong>http</strong>s://YOUR_PROJECT_ENDPOINT',
      '<code>http</code>s://YOUR_PROJECT_ENDPOINT',
      '<Widget>http</Widget>s://YOUR_PROJECT_ENDPOINT',
    ].join('\n');
    const expected = [
      'https://{project-id}.{region}.api.cloud.zilliz.com.cn',
      '<code>http</code>s://YOUR_PROJECT_ENDPOINT',
      '<Widget>http</Widget>s://YOUR_PROJECT_ENDPOINT',
    ].join('\n');

    expect(registry.transformDocument([ZH_CN_REST_REPLACEMENTS_ID], {path: 'decorated.mdx', contents: input}, context('zh-CN')).contents).toBe(expected);
  });
});

describe('zh-CN Aliyun OSS adapter', () => {
  it('fails fast when no storage port is injected', () => {
    expect(() => createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: undefined as never,
    })).toThrow(/aliyun oss.*storage.*required/i);
  });

  it('uses only injected storage during Chinese validation and performs no English I/O', async () => {
    const validateOrPublish = vi.fn(async () => {});
    const registry = createZhCnPublicationAdapterRegistry({aliyunOssStorage: {validateOrPublish}});
    const chinese = context('zh-CN');
    const english = context('en');

    await registry.validatePublication([ZH_CN_ALIYUN_OSS_ID], chinese);
    await registry.validatePublication([ZH_CN_ALIYUN_OSS_ID], english);

    expect(validateOrPublish).toHaveBeenCalledTimes(1);
    expect(validateOrPublish).toHaveBeenCalledWith(realpathSync(chinese.publicationRoot), expect.objectContaining({site: 'zh-CN'}));
  });
});
