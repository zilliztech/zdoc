import {describe, expect, it} from 'vitest';

import {cloudConsoleOrigin, cloudConsoleSite, cloudConsoleUrl} from './cloudConsole';

describe('cloudConsoleSite', () => {
  it('maps the zh-CN site id to the China console and everything else to international', () => {
    expect(cloudConsoleSite('zh-CN')).toBe('zh-CN');
    expect(cloudConsoleSite('en')).toBe('en');
    expect(cloudConsoleSite(undefined)).toBe('en');
    expect(cloudConsoleSite(null)).toBe('en');
    expect(cloudConsoleSite('ja-JP')).toBe('en');
    // customFields values are untyped at the call sites.
    expect(cloudConsoleSite({not: 'a-string'})).toBe('en');
  });
});

describe('cloudConsoleOrigin', () => {
  it('returns the China console origin for the zh-CN site', () => {
    expect(cloudConsoleOrigin('zh-CN')).toBe('https://cloud.zilliz.com.cn');
  });

  it('returns the international console origin by default', () => {
    expect(cloudConsoleOrigin('en')).toBe('https://cloud.zilliz.com');
    expect(cloudConsoleOrigin(undefined)).toBe('https://cloud.zilliz.com');
  });
});

describe('cloudConsoleUrl', () => {
  it('builds login and signup URLs per site', () => {
    expect(cloudConsoleUrl('en', '/login')).toBe('https://cloud.zilliz.com/login');
    expect(cloudConsoleUrl('en', '/signup')).toBe('https://cloud.zilliz.com/signup');
    expect(cloudConsoleUrl('zh-CN', '/login')).toBe('https://cloud.zilliz.com.cn/login');
    expect(cloudConsoleUrl('zh-CN', '/signup')).toBe('https://cloud.zilliz.com.cn/signup');
  });
});
