import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {compile} from '@mdx-js/mdx';
import {describe, expect, it} from 'vitest';

import {createZhCnPublicationAdapterRegistry} from '../index.ts';
import type {PublicationContext} from '../types.ts';
import {compactMarkdownTableFixture, markdownNormalizerFixture} from './legacyFixtures.ts';
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

function frontmatter(contents: string): string {
  const end = contents.indexOf('\n---\n');
  return contents.slice(0, end + 5);
}

function tablePipes(contents: string): string[] {
  return contents.split(/\r?\n/u).filter(line => line.startsWith('|')).map(line => line.replace(/[^|]/gu, ''));
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
    expect(frontmatter(first.contents)).toBe(frontmatter(markdownNormalizerFixture.input));
    expect(first.contents.split('\n')).toContain('| :--- | ---: |');
    expect(tablePipes(first.contents)).toEqual(tablePipes(markdownNormalizerFixture.input));
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

  it('preserves every pipe in compact Markdown tables while normalizing URL paths, queries, and hashes', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const output = registry.transformDocument(
      [ZH_CN_MARKDOWN_NORMALIZER_ID],
      {path: 'compact.md', contents: compactMarkdownTableFixture.input},
      context('zh-CN'),
    ).contents;

    expect(output).toBe(compactMarkdownTableFixture.output);
    expect(output.split('\n')[1]).toBe('|---|---|');
    expect(tablePipes(output)).toEqual(tablePipes(compactMarkdownTableFixture.input));
    expect(output.split('\n').filter(Boolean).every(line => (line.match(/\|/gu) ?? []).length === 3)).toBe(true);
  });

  it('does not apply the Chinese transform to an English publication through the real registry', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const document = {path: 'guides/page.md', contents: markdownNormalizerFixture.input};

    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], document, context('en'))).toEqual(document);
  });

  it('preserves BOM, CRLF, and unterminated frontmatter fail-safe', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const publicationContext = context('zh-CN');
    const valid = '\uFEFF---\r\nslug: https://support.zilliz.com/hc/en-us\r\nnote: https://zilliz.com/pricing\r\n---\r\n\r\nhttps://support.zilliz.com/hc/en-us\r\n';
    const expected = '\uFEFF---\r\nslug: https://support.zilliz.com/hc/en-us\r\nnote: https://zilliz.com/pricing\r\n---\r\n\r\nhttps://support.zilliz.com.cn/hc/zh-cn\r\n';
    const unterminated = '\uFEFF---\r\nslug: https://support.zilliz.com/hc/en-us\r\nnote: https://zilliz.com/pricing\r\n';

    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], {path: 'page.md', contents: valid}, publicationContext).contents).toBe(expected);
    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], {path: 'page.md', contents: unterminated}, publicationContext).contents).toBe(unterminated);
  });

  it('matches complete supported URLs, collapses repeated cn hosts, and preserves suffixes', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      'https://support.zilliz.com.cn.cn/hc/en-us/articles/123?a=1#section',
      'https://zilliz.com.cn.cn/contact-sales?from=footer#form',
      'https://zilliz.com.cn.cn/pricing#calculator',
      'https://support.zilliz.com/article',
      'https://zilliz.com/contact-salesforce?from=footer',
      'https://zilliz.com/pricing-guide#calculator',
    ].join('\n');
    const expected = [
      'https://support.zilliz.com.cn/hc/zh-cn/articles/123?a=1#section',
      'https://zilliz.com.cn/contact-sales?from=footer#form',
      'https://zilliz.com.cn/pricing#calculator',
      'https://support.zilliz.com/article',
      'https://zilliz.com/contact-salesforce?from=footer',
      'https://zilliz.com/pricing-guide#calculator',
    ].join('\n');

    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], {path: 'urls.md', contents: input}, context('zh-CN')).contents).toBe(expected);
  });

  it('normalizes legacy www sales and pricing hosts in prose and compact tables', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      'Sales: https://www.zilliz.com/contact-sales?from=prose#form',
      '|pricing|https://www.zilliz.com.cn/pricing?plan=pro#calculator|',
      'https://www.zilliz.com/contact-salesforce?from=footer',
      'https://www.zilliz.com/pricing-guide#calculator',
      'https://www.zilliz.com.evil/contact-sales',
      'https://notwww.zilliz.com/pricing',
      'https://www.zilliz.com.cn.evil/pricing',
    ].join('\n');
    const expected = [
      'Sales: https://zilliz.com.cn/contact-sales?from=prose#form',
      '|pricing|https://zilliz.com.cn/pricing?plan=pro#calculator|',
      'https://www.zilliz.com/contact-salesforce?from=footer',
      'https://www.zilliz.com/pricing-guide#calculator',
      'https://www.zilliz.com.evil/contact-sales',
      'https://notwww.zilliz.com/pricing',
      'https://www.zilliz.com.cn.evil/pricing',
    ].join('\n');

    const output = registry.transformDocument(
      [ZH_CN_MARKDOWN_NORMALIZER_ID],
      {path: 'www-urls.md', contents: input},
      context('zh-CN'),
    ).contents;

    expect(output).toBe(expected);
    expect(tablePipes(output)).toEqual(tablePipes(input));
  });

  it('repairs simple Chinese bold punctuation into CommonMark strong nodes', async () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      '**建议：**首次注册后请尽早添加支付方式。',
      '- **这个操作在什么时候执行？**在搜索之前，还是在搜索之后。',
      '1. 在左侧导航栏，单击 **Bucket 列表，**然后单击**创建 Bucket**。',
    ].join('\n');
    const expected = [
      '**建议**：首次注册后请尽早添加支付方式。',
      '- **这个操作在什么时候执行**？在搜索之前，还是在搜索之后。',
      '1. 在左侧导航栏，单击 **Bucket 列表**，然后单击**创建 Bucket**。',
    ].join('\n');

    const output = registry.transformDocument(
      [ZH_CN_MARKDOWN_NORMALIZER_ID],
      {path: 'bold-punctuation.md', contents: input},
      context('zh-CN'),
    ).contents;
    const compiled = String(await compile(output));

    expect(output).toBe(expected);
    expect(compiled).toContain('strong');
    expect(compiled).not.toContain('**');
  });

  it('keeps unsafe bold punctuation contexts unchanged and remains frontmatter-safe and idempotent', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const publicationContext = context('zh-CN');
    const unsafe = [
      '**建议：** 首次',
      '**建议**：首次',
      '```md',
      '**建议：**首次',
      '```',
      '~~~md',
      '**问题？**回答',
      '~~~',
      '> ```md',
      '> **建议：**首次',
      '> ```',
      '- ~~~md',
      '  **问题？**回答',
      '  ~~~',
      '`**建议：**首次`',
      '\\**建议：**首次',
      '[**建议：**](https://example.com)首次',
      '**建议：`code`**首次',
      '***建议：***首次',
      '<span>**建议：**首次</span>',
      '<Widget label="**建议：**首次" />',
      '{condition && <Thing>**建议：**首次</Thing>}',
      '<Widget>',
      '**建议：**首次',
      '</Widget>',
      '{condition ? (',
      '**问题？**回答',
      ') : null}',
      '**建议：**',
      '首次',
    ].join('\n');
    const withFrontmatter = `---\r\ntitle: **建议：**首次\r\n---\r\n${unsafe}\r\n**问题？**回答\r\n`;
    const expected = `---\r\ntitle: **建议：**首次\r\n---\r\n${unsafe}\r\n**问题**？回答\r\n`;

    const once = registry.transformDocument(
      [ZH_CN_MARKDOWN_NORMALIZER_ID],
      {path: 'bold-boundaries.mdx', contents: withFrontmatter},
      publicationContext,
    );

    expect(once.contents).toBe(expected);
    expect(frontmatter(once.contents)).toBe(frontmatter(withFrontmatter));
    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], once, publicationContext)).toEqual(once);
  });

  it('preserves multiline HTML comments across LF and CRLF documents', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const lfInput = [
      'Before <!-- first comment',
      '**建议：**首次',
      '--> after comment',
      '<!-- same-line comment --> **问题？**回答',
      '<!-- second comment',
      '**问题？**回答',
      '-->',
      '**建议：**首次',
    ].join('\n');
    const lfExpected = [
      'Before <!-- first comment',
      '**建议：**首次',
      '--> after comment',
      '<!-- same-line comment --> **问题？**回答',
      '<!-- second comment',
      '**问题？**回答',
      '-->',
      '**建议**：首次',
    ].join('\n');
    const crlfInput = '<!-- CRLF comment\r\n**问题？**回答\r\n-->\r\n**问题？**回答\r\n';
    const crlfExpected = '<!-- CRLF comment\r\n**问题？**回答\r\n-->\r\n**问题**？回答\r\n';

    expect(registry.transformDocument(
      [ZH_CN_MARKDOWN_NORMALIZER_ID],
      {path: 'comments-lf.md', contents: lfInput},
      context('zh-CN'),
    ).contents).toBe(lfExpected);
    expect(registry.transformDocument(
      [ZH_CN_MARKDOWN_NORMALIZER_ID],
      {path: 'comments-crlf.md', contents: crlfInput},
      context('zh-CN'),
    ).contents).toBe(crlfExpected);
  });

  it('normalizes only allowlisted paired decorated http tags', () => {
    const registry = createZhCnPublicationAdapterRegistry({
      aliyunOssStorage: {validateOrPublish: async () => {}},
    });
    const input = [
      '<i>http</i>s://support.zilliz.com/hc/en-us',
      '<em>http</em>s://support.zilliz.com/hc/en-us',
      '<strong>http</strong>s://support.zilliz.com/hc/en-us',
      '<b>http</b>s://support.zilliz.com/hc/en-us',
      '<code>http</code>s://support.zilliz.com/hc/en-us',
      '<span>http</span>s://support.zilliz.com/hc/en-us',
      '<Custom>http</Custom>s://support.zilliz.com/hc/en-us',
    ].join('\n');
    const expected = [
      'https://support.zilliz.com.cn/hc/zh-cn',
      'https://support.zilliz.com.cn/hc/zh-cn',
      'https://support.zilliz.com.cn/hc/zh-cn',
      'https://support.zilliz.com.cn/hc/zh-cn',
      '<code>http</code>s://support.zilliz.com/hc/en-us',
      '<span>http</span>s://support.zilliz.com/hc/en-us',
      '<Custom>http</Custom>s://support.zilliz.com/hc/en-us',
    ].join('\n');

    expect(registry.transformDocument([ZH_CN_MARKDOWN_NORMALIZER_ID], {path: 'decorated.md', contents: input}, context('zh-CN')).contents).toBe(expected);
  });
});
