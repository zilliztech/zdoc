import {describe, expect, it} from 'vitest';

import {contactSalesUrl, resolveTagLink, supportUrl} from './tagLinks';

describe('resolveTagLink', () => {
  it('links both preview tags to the site-local feature-availability page', () => {
    expect(resolveTagLink('PUBLIC', '/docs/manage-indexes', 'en')).toBe('/docs/feature-availability');
    expect(resolveTagLink('PRIVATE', '/docs/manage-indexes', 'zh-CN')).toBe('/docs/feature-availability');
  });

  it('keeps the ja-JP pages of the English site on their translated page', () => {
    expect(resolveTagLink('PUBLIC', '/ja-JP/docs/manage-indexes', 'en')).toBe('/ja-JP/docs/feature-availability');
    expect(resolveTagLink('PRIVATE', '/ja-JP/reference/python/search', 'en')).toBe('/ja-JP/docs/feature-availability');
  });

  it('splits the CONTACT SALES link by site language', () => {
    expect(resolveTagLink('CONTACT SALES', '/docs/byoc/byoc-intro', 'en')).toBe('https://zilliz.com/contact-sales');
    expect(resolveTagLink('CONTACT SALES', '/docs/byoc/byoc-intro', 'zh-CN')).toBe('https://zilliz.com.cn/contact-sales');
  });

  it('links ON REQUEST to the support center matching the site language', () => {
    expect(resolveTagLink('ON REQUEST', '/docs/manage-indexes', 'en')).toBe('https://support.zilliz.com/hc/en-us');
    expect(resolveTagLink('ON REQUEST', '/docs/manage-indexes', 'zh-CN')).toBe('https://support.zilliz.com.cn/hc/zh-cn');
  });

  it('keeps ON REQUEST on the English support center for ja-JP pages', () => {
    expect(resolveTagLink('ON REQUEST', '/ja-JP/docs/manage-indexes', 'en')).toBe('https://support.zilliz.com/hc/en-us');
  });

  it('leaves other tags unlinked', () => {
    expect(resolveTagLink('BYOC', '/docs/byoc/byoc-intro', 'en')).toBeUndefined();
    expect(resolveTagLink('DEPRECATED', '/docs/manage-indexes', 'zh-CN')).toBeUndefined();
    expect(resolveTagLink('NEAR DEPRECATE', '/docs/manage-indexes', 'en')).toBeUndefined();
  });
});

describe('supportUrl', () => {
  it('serves the support center that matches the docs deployment', () => {
    expect(supportUrl('en')).toBe('https://support.zilliz.com/hc/en-us');
    expect(supportUrl('zh-CN')).toBe('https://support.zilliz.com.cn/hc/zh-cn');
  });
});

describe('contactSalesUrl', () => {
  it('serves the marketing site that matches the docs deployment', () => {
    expect(contactSalesUrl('en')).toBe('https://zilliz.com/contact-sales');
    expect(contactSalesUrl('zh-CN')).toBe('https://zilliz.com.cn/contact-sales');
  });
});
