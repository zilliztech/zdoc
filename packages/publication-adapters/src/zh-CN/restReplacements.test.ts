import {mkdtempSync, realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {createZhCnPublicationAdapterRegistry} from '../registry.ts';
import type {PublicationContext} from '../types.ts';
import {ZH_CN_ALIYUN_OSS_ID} from './aliyunOss.ts';
import {restReplacementFixture} from './legacyFixtures.ts';
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
    expect(once.contents).toContain('slug: /restful/create-cluster');
    expect(once.contents).toContain('| --- | --- |');
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
