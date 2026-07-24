import {describe, expect, it} from 'vitest';

import {resolveSiteProfile} from './resolve';
import {
  ContentPluginProfileSchema,
  FeatureProfileSchema,
  IntegrationProfileSchema,
  MarkdownProfileSchema,
  NavigationProfileSchema,
  RedirectProfileSchema,
  RepositoryRelativePathSchema,
  RobotsProfileSchema,
  SiteProfileSchema,
} from './schema';
import {enProfile} from './sites/en';
import {zhCNProfile} from './sites/zh-CN';

describe('site profile resolution', () => {
  it('resolves only named site profiles', () => {
    expect(resolveSiteProfile('en').id).toBe('en');
    expect(resolveSiteProfile('zh-CN').id).toBe('zh-CN');
    expect(() => resolveSiteProfile(undefined)).toThrow(/ZDOC_SITE/);
    expect(() => resolveSiteProfile('fr')).toThrow(/Unsupported site/);
  });

  it('keeps English and Chinese output ownership separate', () => {
    expect(enProfile.outputDir).not.toBe(zhCNProfile.outputDir);
  });
});

describe('closed profile schemas', () => {
  it.each([
    ['content plugin', ContentPluginProfileSchema, {id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'guides', sidebarPath: 'generated/en/sidebars/guides.ts', unknown: true}],
    ['feature', FeatureProfileSchema, {...enProfile.features, unknown: true}],
    ['integration', IntegrationProfileSchema, {unknown: true}],
    ['redirect', RedirectProfileSchema, {rules: [], unknown: true}],
    ['navigation', NavigationProfileSchema, {items: [], unknown: true}],
    ['markdown', MarkdownProfileSchema, {remarkPlugins: [], rehypePlugins: [], unknown: true}],
    ['robots', RobotsProfileSchema, {index: true, unknown: true}],
    ['site profile', SiteProfileSchema, {...enProfile, unknown: true}],
  ])('rejects unknown keys in the %s schema', (_name, schema, value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});

describe('repository-relative paths', () => {
  it.each([
    '',
    '/content/en',
    'C:/content/en',
    '../content/en',
    'content/../en',
    'content\\en',
    'content//en',
    'content/en/',
  ])('rejects non-normalized or unsafe path %s', value => {
    expect(RepositoryRelativePathSchema.safeParse(value).success).toBe(false);
  });

  it('accepts a normalized repository-relative path', () => {
    expect(RepositoryRelativePathSchema.parse('content/zh-CN/reference')).toBe('content/zh-CN/reference');
  });
});

describe('exclusive path ownership', () => {
  it.each([
    ['content source', {content: [{id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'guides', sidebarPath: 'generated/en/sidebars/guides.ts'}], outputDir: 'content/en'}],
    ['static root', {staticRoots: ['apps/docs/static/shared', 'build/en/assets']}],
    ['manual output', {manuals: ['build/en/manuals']}],
  ])('rejects outputDir overlap with a %s', (_name, overrides) => {
    expect(() => SiteProfileSchema.parse({...enProfile, ...overrides})).toThrow(/ownership overlap/);
  });

  it('rejects overlapping content plugin source roots', () => {
    expect(() => SiteProfileSchema.parse({
      ...enProfile,
      content: [
        {id: 'default', sourcePath: 'content/en', routeBasePath: 'guides', sidebarPath: 'generated/en/sidebars/guides.ts'},
        {id: 'reference', sourcePath: 'content/en/reference', routeBasePath: 'reference', sidebarPath: 'generated/en/sidebars/reference.ts'},
      ],
    })).toThrow(/content\[0\].*content\[1\].*ownership overlap/);
  });
});
