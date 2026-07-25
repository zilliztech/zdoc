import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {createZhCnPublicationAdapterRegistry} from '../index.ts';
import type {PublicationContext} from '../types.ts';
import {markdownNormalizerFixture} from './legacyFixtures.ts';
import {ZH_CN_MARKDOWN_NORMALIZER_ID} from './normalizer.ts';

function context(site: 'en' | 'zh-CN'): PublicationContext {
  return {
    site,
    manual: 'guides',
    publicationRoot: mkdtempSync(path.join(tmpdir(), 'zh-cn-normalizer-')),
    baselineCommit: 'sha256:baseline',
    sourceIdentity: {type: 'git', repository: 'zilliztech/zdoc', revision: 'abc123'},
  };
}

describe('zh-CN Markdown normalizer adapter', () => {
  it('normalizes representative Markdown deterministically while preserving table syntax and slug', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const document = {path: 'guides/page.md', contents: markdownNormalizerFixture.input};

    const first = registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], document, context('zh-CN'));
    const second = registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], document, context('zh-CN'));

    expect(first.contents).toBe(markdownNormalizerFixture.output);
    expect(second).toEqual(first);
    expect(first.path).toBe(document.path);
    expect(first.contents).toContain('slug: /cloud/aws-support');
    expect(first.contents).toContain('| --- | --- |');
  });

  it('is idempotent', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const publicationContext = context('zh-CN');
    const once = registry.transformDocument(
      [ZH_CN_MARKDOWN_NORMALIZER_ID],
      {path: 'guides/page.md', contents: markdownNormalizerFixture.input},
      publicationContext,
    );

    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], once, publicationContext)).toEqual(once);
  });

  it('does not apply the Chinese transform to an English publication through the real registry', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const document = {path: 'guides/page.md', contents: markdownNormalizerFixture.input};

    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], document, context('en'))).toEqual(document);
  });
});
