import {describe, expect, it} from 'vitest';
import {parseDocsRoute, withLocalePrefix} from './docsRoute';

describe('parseDocsRoute', () => {
  it('classifies an English Python reference route', () => {
    expect(parseDocsRoute('/reference/python', 'en')).toMatchObject({
      locale: 'en',
      localePrefix: '',
      pathname: '/reference/python',
      normalizedPathname: '/reference/python',
      manual: 'reference',
      referenceTarget: 'python',
    });
  });

  it('strips the Japanese prefix only for route classification', () => {
    expect(parseDocsRoute('/ja-JP/reference/python', 'ja-JP')).toMatchObject({
      localePrefix: '/ja-JP',
      pathname: '/ja-JP/reference/python',
      normalizedPathname: '/reference/python',
      manual: 'reference',
      referenceTarget: 'python',
    });
  });

  it('maps the node reference path to nodejs', () => {
    expect(parseDocsRoute('/ja-JP/reference/node/collections', 'ja-JP')).toMatchObject({
      normalizedPathname: '/reference/node/collections',
      manual: 'reference',
      referenceTarget: 'nodejs',
    });
  });

  it('normalizes Chinese CLI routes with trailing slashes, queries, and hashes', () => {
    expect(parseDocsRoute('/reference/cli/?page=1#install', 'zh-CN')).toMatchObject({
      locale: 'zh-CN',
      localePrefix: '',
      pathname: '/reference/cli',
      normalizedPathname: '/reference/cli',
      manual: 'reference',
      referenceTarget: 'cli',
    });
  });
});

describe('withLocalePrefix', () => {
  const japaneseContext = parseDocsRoute('/ja-JP/docs/quickstart', 'ja-JP');

  it('prefixes Japanese root-relative docs links', () => {
    expect(withLocalePrefix('/docs/install', japaneseContext)).toBe('/ja-JP/docs/install');
  });

  it('does not double-prefix Japanese links', () => {
    expect(withLocalePrefix('/ja-JP/docs/install', japaneseContext)).toBe('/ja-JP/docs/install');
  });

  it('leaves external URLs unchanged', () => {
    expect(withLocalePrefix('https://zilliz.com/docs', japaneseContext)).toBe('https://zilliz.com/docs');
  });
});
