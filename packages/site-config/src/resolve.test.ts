import {describe, expect, it} from 'vitest';

import {resolveSiteProfile} from './resolve';
import {
  ContentPluginProfileSchema,
  FeatureProfileSchema,
  IntegrationProfileSchema,
  MarkdownProfileSchema,
  NavigationProfileSchema,
  BaseUrlSchema,
  RedirectProfileSchema,
  RepositoryRelativePathSchema,
  RobotsProfileSchema,
  RoutePathSchema,
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

describe('normalized web paths', () => {
  it.each([
    ' guides',
    'guides ',
    'docs/foo bar',
    'docs/foo\tbar',
    'docs\\foo',
    './docs',
    '../docs',
    'docs/../foo',
    'docs/./foo',
    'docs//foo',
    '/docs//foo',
    'docs/foo/',
    '/docs/foo/',
  ])('rejects unsafe or non-normalized route path %s', value => {
    expect(RoutePathSchema.safeParse(value).success).toBe(false);
  });

  it.each(['guides', '/docs/foo', '/'])('accepts normalized route path %s', value => {
    expect(RoutePathSchema.parse(value)).toBe(value);
  });

  it.each([
    ' /docs/',
    '/docs/ ',
    '/docs/foo bar/',
    '/docs/foo\tbar/',
    '/docs',
    '/docs\\reference/',
    '/../',
    '/./',
    '/docs/../reference/',
    '/docs/./reference/',
    '/docs//reference/',
    '//docs/',
  ])('rejects unsafe or non-normalized baseUrl %s', value => {
    expect(BaseUrlSchema.safeParse(value).success).toBe(false);
  });

  it.each(['/', '/docs/', '/developer/reference/'])('accepts normalized baseUrl %s', value => {
    expect(BaseUrlSchema.parse(value)).toBe(value);
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

  it.each([
    ['outputDir', {outputDir: 'generated/en', staticRoots: enProfile.staticRoots, manuals: []}],
    ['static root', {outputDir: enProfile.outputDir, staticRoots: ['apps/docs/static/shared', 'generated/en'], manuals: []}],
    ['manual output', {outputDir: enProfile.outputDir, staticRoots: enProfile.staticRoots, manuals: ['generated/en']}],
  ])('rejects a sidebar target overlapping %s', (_name, overrides) => {
    expect(() => SiteProfileSchema.parse({
      ...enProfile,
      ...overrides,
      content: [{
        id: 'default',
        sourcePath: 'content/en/guides',
        routeBasePath: 'guides',
        sidebarPath: 'generated/en/sidebars/guides.ts',
      }],
    })).toThrow(/sidebarPath.*ownership overlap/);
  });

  it.each([
    ['duplicate', 'generated/en/sidebars/guides.ts'],
    ['nested', 'generated/en/sidebars/guides.ts/nested'],
  ])('rejects %s sidebar targets', (_name, secondSidebarPath) => {
    expect(() => SiteProfileSchema.parse({
      ...enProfile,
      content: [
        {id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'guides', sidebarPath: 'generated/en/sidebars/guides.ts'},
        {id: 'reference', sourcePath: 'content/en/reference', routeBasePath: 'reference', sidebarPath: secondSidebarPath},
      ],
    })).toThrow(/sidebarPath.*sidebarPath.*ownership overlap/);
  });

  it('allows a sidebar target inside its content source root', () => {
    expect(SiteProfileSchema.parse({
      ...enProfile,
      content: [{
        id: 'default',
        sourcePath: 'content/en/guides',
        routeBasePath: 'guides',
        sidebarPath: 'content/en/guides/sidebar.ts',
      }],
    }).content).toHaveLength(1);
  });

  it('rejects a plugin sidebar equal to its own source root', () => {
    expect(() => SiteProfileSchema.parse({
      ...enProfile,
      content: [{
        id: 'default',
        sourcePath: 'content/en/guides',
        routeBasePath: 'guides',
        sidebarPath: 'content/en/guides',
      }],
    })).toThrow(/sidebarPath.*equal to its own sourcePath/);
  });

  it('rejects a plugin sidebar inside another plugin source root', () => {
    expect(() => SiteProfileSchema.parse({
      ...enProfile,
      content: [
        {id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'guides', sidebarPath: 'content/en/reference/sidebar.ts'},
        {id: 'reference', sourcePath: 'content/en/reference', routeBasePath: 'reference', sidebarPath: 'generated/en/sidebars/reference.ts'},
      ],
    })).toThrow(/content\[0\].sidebarPath.*content\[1\].sourcePath.*ownership overlap/);
  });

  it('rejects a plugin sidebar that is an ancestor of another plugin source root', () => {
    expect(() => SiteProfileSchema.parse({
      ...enProfile,
      content: [
        {id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'guides', sidebarPath: 'content/en/reference'},
        {id: 'reference', sourcePath: 'content/en/reference/pages', routeBasePath: 'reference', sidebarPath: 'generated/en/sidebars/reference.ts'},
      ],
    })).toThrow(/content\[0\].sidebarPath.*content\[1\].sourcePath.*ownership overlap/);
  });

  it('rejects a plugin sidebar that is an ancestor of its own source root', () => {
    expect(() => SiteProfileSchema.parse({
      ...enProfile,
      content: [{
        id: 'default',
        sourcePath: 'content/en/guides/pages',
        routeBasePath: 'guides',
        sidebarPath: 'content/en/guides',
      }],
    })).toThrow(/sidebarPath.*own sourcePath/);
  });
});
