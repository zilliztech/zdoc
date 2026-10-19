import {describe, expect, it} from 'vitest';
import {normalizeDocsLinkLocale, rewriteDocHref, rewriteHtmlHrefAttributes} from './rewriteDocLinks';

describe('normalizeDocsLinkLocale', () => {
  it('maps RestSpecs lang values onto link locales', () => {
    expect(normalizeDocsLinkLocale('en-US')).toBe('en');
    expect(normalizeDocsLinkLocale('zh-CN')).toBe('zh-CN');
    expect(normalizeDocsLinkLocale('ja-JP')).toBe('ja-JP');
    expect(normalizeDocsLinkLocale(undefined)).toBe('en');
  });
});

describe('rewriteDocHref docs site origins', () => {
  it('strips the English site origin to a relative path per locale', () => {
    const href = 'https://docs.zilliz.com/docs/select-zilliz-cloud-service-plans#deployment';
    expect(rewriteDocHref(href, 'en')).toBe('/docs/select-zilliz-cloud-service-plans#deployment');
    expect(rewriteDocHref(href, 'zh-CN')).toBe('/docs/select-zilliz-cloud-service-plans#deployment');
    expect(rewriteDocHref(href, 'ja-JP')).toBe('/ja-JP/docs/select-zilliz-cloud-service-plans#deployment');
  });

  it('strips the Chinese site origin the same way so cross-host drift stays in-language', () => {
    const href = 'https://docs.zilliz.com.cn/docs/enterprise-certification';
    expect(rewriteDocHref(href, 'zh-CN')).toBe('/docs/enterprise-certification');
    expect(rewriteDocHref(href, 'ja-JP')).toBe('/ja-JP/docs/enterprise-certification');
  });

  it('keeps query strings and http variants', () => {
    expect(rewriteDocHref('http://docs.zilliz.com/reference/restful/list-cloud-regions-v2?a=1#b', 'en'))
      .toBe('/reference/restful/list-cloud-regions-v2?a=1#b');
  });

  it('maps an origin-only URL to the site root', () => {
    expect(rewriteDocHref('https://docs.zilliz.com', 'en')).toBe('/');
    expect(rewriteDocHref('https://docs.zilliz.com', 'zh-CN')).toBe('/');
    expect(rewriteDocHref('https://docs.zilliz.com.cn', 'ja-JP')).toBe('/ja-JP/');
  });

  it('does not touch other hosts or relative paths', () => {
    for (const href of [
      'https://support.zilliz.com.cn/hc/zh-cn',
      'https://assets.zilliz.com/logo.png',
      '/docs/local-page',
      './neighbor',
      '#anchor',
    ]) {
      expect(rewriteDocHref(href, 'zh-CN')).toBe(href);
      expect(rewriteDocHref(href, 'ja-JP')).toBe(href);
    }
  });
});

describe('rewriteDocHref milvus.io links', () => {
  it('localizes docs pages into the /docs/<locale>/ tree', () => {
    const href = 'https://milvus.io/docs/pattern-matching.md';
    expect(rewriteDocHref(href, 'en')).toBe(href);
    expect(rewriteDocHref(href, 'zh-CN')).toBe('https://milvus.io/docs/zh/pattern-matching.md');
    expect(rewriteDocHref(href, 'ja-JP')).toBe('https://milvus.io/docs/ja/pattern-matching.md');
  });

  it('keeps query strings and anchors on localized milvus docs links', () => {
    expect(rewriteDocHref('https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access', 'zh-CN'))
      .toBe('https://milvus.io/docs/zh/authenticate.md?tab=docker#Authenticate-User-Access');
  });

  it('localizes the docs index and blog with their different layouts', () => {
    expect(rewriteDocHref('https://milvus.io/docs', 'zh-CN')).toBe('https://milvus.io/docs/zh');
    expect(rewriteDocHref('https://milvus.io/blog/2022-2-21-compact.md', 'ja-JP'))
      .toBe('https://milvus.io/ja/blog/2022-2-21-compact.md');
  });

  it('is idempotent for links that already carry a locale segment', () => {
    for (const href of [
      'https://milvus.io/docs/zh/minhash-lsh.md',
      'https://milvus.io/zh/blog/2022-2-21-compact.md',
      'https://milvus.io/ko/docs/index.md',
      'https://milvus.io/docs/zh-hant/index.md',
    ]) {
      expect(rewriteDocHref(href, 'zh-CN')).toBe(href);
      expect(rewriteDocHref(href, 'ja-JP')).toBe(href);
    }
  });

  it('keeps sections without localized trees on the canonical English URL', () => {
    for (const href of [
      'https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md',
      'https://milvus.io/tools/sizing',
      'https://milvus.io',
    ]) {
      expect(rewriteDocHref(href, 'zh-CN')).toBe(href);
      expect(rewriteDocHref(href, 'ja-JP')).toBe(href);
    }
  });
});

describe('rewriteHtmlHrefAttributes', () => {
  it('rewrites markdown-rendered and inline anchors while leaving other markup intact', () => {
    const html = '<p>See <a href="https://docs.zilliz.com/docs/limits#ingestion">Limits</a> and <a href=\'https://milvus.io/docs/index.md\'>Milvus</a> or <a href="https://example.com/x">other</a>.</p>';
    expect(rewriteHtmlHrefAttributes(html, 'zh-CN')).toBe(
      '<p>See <a href="/docs/limits#ingestion">Limits</a> and <a href=\'https://milvus.io/docs/zh/index.md\'>Milvus</a> or <a href="https://example.com/x">other</a>.</p>',
    );
  });

  it('prefixes Japanese pages with /ja-JP', () => {
    expect(rewriteHtmlHrefAttributes('<a href="https://docs.zilliz.com.cn/docs/byoc/quick-start">BYOC</a>', 'ja-JP'))
      .toBe('<a href="/ja-JP/docs/byoc/quick-start">BYOC</a>');
  });

  it('returns input unchanged for empty or non-matching values', () => {
    expect(rewriteHtmlHrefAttributes('', 'zh-CN')).toBe('');
    expect(rewriteHtmlHrefAttributes('<code>docs.zilliz.com</code>', 'zh-CN'))
      .toBe('<code>docs.zilliz.com</code>');
  });

  it('does not match href inside compound attribute names like data-href or xlink:href', () => {
    const html = '<div data-href="https://docs.zilliz.com/docs/x" xlink:href="https://docs.zilliz.com/docs/y"></div>';
    expect(rewriteHtmlHrefAttributes(html, 'zh-CN')).toBe(html);
  });

  it('is idempotent over its own output', () => {
    const html = '<p><a href="https://docs.zilliz.com/docs/limits#ingestion">a</a> <a href="https://milvus.io/docs/index.md">b</a></p>';
    const once = rewriteHtmlHrefAttributes(html, 'zh-CN');
    expect(rewriteHtmlHrefAttributes(once, 'zh-CN')).toBe(once);
  });

  it('keeps HTML-escaped query strings byte-identical beyond the locale insertion', () => {
    expect(rewriteHtmlHrefAttributes('<a href="https://milvus.io/docs/authenticate.md?tab=docker&amp;lang=1#x">t</a>', 'ja-JP'))
      .toBe('<a href="https://milvus.io/docs/ja/authenticate.md?tab=docker&amp;lang=1#x">t</a>');
  });

  it('ignores case-sensitive host casing and non-http schemes', () => {
    const html = '<a href="https://DOCS.ZILLIZ.COM/docs/x">a</a><a href="mailto:hi@docs.zilliz.com">b</a>';
    expect(rewriteHtmlHrefAttributes(html, 'zh-CN')).toBe(html);
  });

  it('leaves displayed code samples untouched and still rewrites anchors after them', () => {
    const html = '<pre><code>&lt;a href="https://docs.zilliz.com/docs/x"&gt;copy me&lt;/a&gt;</code></pre><p><a href="https://docs.zilliz.com/docs/limits">Limits</a></p>';
    expect(rewriteHtmlHrefAttributes(html, 'zh-CN')).toBe(
      '<pre><code>&lt;a href="https://docs.zilliz.com/docs/x"&gt;copy me&lt;/a&gt;</code></pre><p><a href="/docs/limits">Limits</a></p>',
    );
  });

  it('skips inline code regions that contain anchor markup', () => {
    const html = '<p>run <code><a href="https://docs.zilliz.com/docs/x">cmd</a></code> now <a href="https://milvus.io/docs/index.md">docs</a></p>';
    expect(rewriteHtmlHrefAttributes(html, 'ja-JP')).toBe(
      '<p>run <code><a href="https://docs.zilliz.com/docs/x">cmd</a></code> now <a href="https://milvus.io/docs/ja/index.md">docs</a></p>',
    );
  });
});
