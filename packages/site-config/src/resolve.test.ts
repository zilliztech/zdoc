import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {resolveSiteProfile} from './resolve';
import type {DeepReadonly} from './immutable';
import {
  BaseUrlSchema,
  canonicalRouteKey,
  ContentPluginProfileSchema,
  FeatureProfileSchema,
  IntegrationProfileSchema,
  MarkdownProfileSchema,
  NavigationItemSchema,
  NavigationProfileSchema,
  RedirectProfileSchema,
  RepositoryRelativePathSchema,
  RobotsProfileSchema,
  RoutePathSchema,
  SiteOriginSchema,
  SiteProfileSchema,
  type SiteProfile,
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

  it('registers exactly the migrated English Guides, BYOC, and Reference plugins', () => {
    expect(enProfile.content).toEqual([
      {
        id: 'default',
        sourcePath: 'content/en/guides',
        routeBasePath: 'docs',
        sidebarPath: 'packages/site-config/src/sidebars/en/guides.legacy.ts',
      },
      {
        id: 'byoc',
        sourcePath: 'content/en/byoc',
        routeBasePath: 'docs/byoc',
        sidebarPath: 'packages/site-config/src/sidebars/en/byoc.legacy.ts',
      },
      {
        id: 'reference',
        sourcePath: 'content/en/reference',
        routeBasePath: 'reference',
        sidebarPath: 'packages/site-config/src/sidebars/en/reference.ts',
      },
    ]);
  });

  it('publishes translated Tools through Chinese Guides without a standalone Agents root', () => {
    expect(zhCNProfile.content).toEqual([
      {
        id: 'default',
        sourcePath: 'content/zh-CN/guides',
        routeBasePath: 'docs',
        sidebarPath: 'packages/site-config/src/sidebars/zh-CN/guides.ts',
        exclude: ['tutorials/get-started/release-notes/release-notes.md'],
      },
      {
        id: 'byoc',
        sourcePath: 'content/zh-CN/byoc',
        routeBasePath: 'docs/byoc',
        sidebarPath: 'packages/site-config/src/sidebars/zh-CN/byoc.ts',
      },
      {
        id: 'onpremise',
        sourcePath: 'content/zh-CN/onpremise',
        routeBasePath: 'on-premise',
        sidebarPath: 'packages/site-config/src/sidebars/zh-CN/onpremise.ts',
        currentVersionPath: 'v2.4.11',
      },
      {
        id: 'reference',
        sourcePath: 'content/zh-CN/reference',
        routeBasePath: 'reference',
        sidebarPath: 'packages/site-config/src/sidebars/zh-CN/reference.ts',
      },
    ]);
    expect(zhCNProfile.features.agents).toBe(false);
    expect(zhCNProfile.content.every(plugin => !plugin.sourcePath.startsWith('i18n/'))).toBe(true);
  });

  it('declares deterministic publication adapters per site', () => {
    expect(enProfile.publicationAdapters).toEqual([]);
    expect(zhCNProfile.publicationAdapters).toEqual([
      'zh-CN.markdown-normalizer',
      'zh-CN.rest-replacements',
      'zh-CN.aliyun-oss',
    ]);
  });

  it('returns the same deeply frozen profile object', () => {
    const profile = resolveSiteProfile('en');
    expect(resolveSiteProfile('en')).toBe(profile);
    expect([
      profile,
      profile.content,
      profile.manuals,
      profile.staticRoots,
      profile.features,
      profile.features.referenceKinds,
      profile.navigation,
      profile.navigation.items,
      profile.markdown,
      profile.markdown.remarkPlugins,
      profile.markdown.rehypePlugins,
      profile.integrations,
      profile.redirects,
      profile.redirects.rules,
      profile.robots,
    ].every(Object.isFrozen)).toBe(true);
    expect(() => {
      (profile.features as {chat: boolean}).chat = false;
    }).toThrow(TypeError);
    expect(profile.features.chat).toBe(true);
  });

  it('exposes deeply readonly profile types', () => {
    const profile: DeepReadonly<SiteProfile> = resolveSiteProfile('zh-CN');
    expect(profile.id).toBe('zh-CN');
  });
});

function assertResolvedProfileIsReadonly(profile: ReturnType<typeof resolveSiteProfile>): void {
  // @ts-expect-error resolved profiles are deeply readonly
  profile.features.chat = false;
}
void assertResolvedProfileIsReadonly;

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

describe('publication adapter profile selection', () => {
  it('fails closed on unknown or duplicate adapter IDs', () => {
    const unknown = SiteProfileSchema.safeParse({...enProfile, publicationAdapters: ['zh-CN.unknown']});
    const duplicate = SiteProfileSchema.safeParse({
      ...zhCNProfile,
      publicationAdapters: ['zh-CN.markdown-normalizer', 'zh-CN.markdown-normalizer'],
    });

    expect(unknown.success).toBe(false);
    expect(duplicate.success).toBe(false);
    if (!unknown.success) expect(unknown.error.issues).toContainEqual(expect.objectContaining({path: ['publicationAdapters', 0]}));
    if (!duplicate.success) expect(duplicate.error.issues).toContainEqual(expect.objectContaining({path: ['publicationAdapters', 1]}));
  });
});

describe('REST API plane configuration', () => {
  it('validates plane keywords as closed profile data', () => {
    expect(IntegrationProfileSchema.parse({
      restApi: {planeConfig: {controlPlaneKeywords: {zilliz: ['cluster'], milvus: []}}},
    })).toEqual({
      restApi: {planeConfig: {controlPlaneKeywords: {zilliz: ['cluster'], milvus: []}}},
    });
    expect(IntegrationProfileSchema.safeParse({
      restApi: {planeConfig: {controlPlaneKeywords: {zilliz: ['cluster']}, unknown: true}},
    }).success).toBe(false);
    expect(IntegrationProfileSchema.safeParse({
      restApi: {planeConfig: {controlPlaneKeywords: {zilliz: ['']}}},
    }).success).toBe(false);
  });
});

describe('site-owned navigation', () => {
  it('accepts nested secondary navigation declared by a site profile', () => {
    const result = NavigationProfileSchema.safeParse({
      items: [],
      secondaryItems: [
        {label: 'Guides', href: '/docs', prefix: '/docs', icon: 'cloud'},
        {
          label: 'API & SDK',
          prefix: '/reference',
          icon: 'code',
          items: [{label: 'Python SDK', href: '/reference/python', prefix: '/reference/python', icon: 'python'}],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('publishes the Chinese product navigation through the shared navigation shell', () => {
    expect(zhCNProfile.navigation.secondaryItems.map(item => item.label)).toEqual([
      'Cloud 开发指南',
      'BYOC 开发指南',
      'API & SDK',
      'CLI',
      '版本文档',
    ]);
    expect(zhCNProfile.navigation.secondaryItems.find(item => item.label === 'API & SDK')?.items)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({label: 'Python SDK', href: '/reference/python'}),
        expect.objectContaining({label: 'RESTful API', href: '/reference/restful'}),
      ]));
  });

  it('attaches the preserved Chinese home page to the default sidebar', () => {
    const home = readFileSync(
      path.join(process.cwd(), 'content/zh-CN/guides/tutorials/home.md'),
      'utf8',
    );
    expect(home).toMatch(/^displayed_sidebar: default$/m);
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
    'docs?x',
    'docs#x',
    'docs/\u0000control',
    'docs/%2e%2e',
    'docs/%2f',
    'docs/%5c',
    'docs/%zz',
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
    '/docs/?x',
    '/docs/#x',
    '/docs/\u0000control/',
    '/docs/%2e%2e/',
    '/docs/%2f/',
    '/docs/%5c/',
    '/docs/%zz/',
  ])('rejects unsafe or non-normalized baseUrl %s', value => {
    expect(BaseUrlSchema.safeParse(value).success).toBe(false);
  });

  it.each(['/', '/docs/', '/developer/reference/'])('accepts normalized baseUrl %s', value => {
    expect(BaseUrlSchema.parse(value)).toBe(value);
  });

  it.each([
    'ftp://docs.zilliz.com',
    'https://docs.zilliz.com/reference',
    'https://docs.zilliz.com/%2e%2e',
    'https://docs.zilliz.com?preview=true',
    'https://docs.zilliz.com#reference',
    'https://user:secret@docs.zilliz.com',
  ])('rejects non-origin site URL %s', value => {
    expect(SiteOriginSchema.safeParse(value).success).toBe(false);
  });

  it.each(['https://docs.zilliz.com', 'https://docs.zilliz.com.cn', 'http://localhost:3000'])('accepts HTTP site origin %s', value => {
    expect(SiteOriginSchema.parse(value)).toBe(value);
  });
});

describe('set-like profile declarations', () => {
  const content = [
    {id: 'default', sourcePath: 'content/en/guides', routeBasePath: 'guides', sidebarPath: 'generated/en/sidebars/guides.ts'},
    {id: 'reference', sourcePath: 'content/en/reference', routeBasePath: 'reference', sidebarPath: 'generated/en/sidebars/reference.ts'},
  ] as const;

  it('rejects duplicate content plugin ids', () => {
    const result = SiteProfileSchema.safeParse({
      ...enProfile,
      content: [content[0], {...content[1], id: 'default'}],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({path: ['content', 1, 'id']}));
    }
  });

  it('rejects duplicate content routeBasePath values', () => {
    const result = SiteProfileSchema.safeParse({
      ...enProfile,
      content: [content[0], {...content[1], routeBasePath: 'guides'}],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({path: ['content', 1, 'routeBasePath']}));
    }
  });

  it('rejects content routeBasePath values that differ only by a leading slash', () => {
    const result = SiteProfileSchema.safeParse({
      ...enProfile,
      content: [content[0], {...content[1], routeBasePath: '/guides'}],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({path: ['content', 1, 'routeBasePath']}));
    }
  });

  it('rejects duplicate redirect sources', () => {
    const result = SiteProfileSchema.safeParse({
      ...enProfile,
      redirects: {rules: [
        {from: '/old', to: '/new'},
        {from: '/old', to: '/newer'},
      ]},
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({path: ['redirects', 'rules', 1, 'from']}));
    }
  });

  it('rejects redirect sources that differ only by a leading slash', () => {
    const result = SiteProfileSchema.safeParse({
      ...enProfile,
      redirects: {rules: [
        {from: 'old', to: '/new'},
        {from: '/old', to: '/newer'},
      ]},
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({path: ['redirects', 'rules', 1, 'from']}));
    }
  });

  it('keeps distinct routes and the root route in separate canonical keys', () => {
    expect(canonicalRouteKey('/')).toBe('/');
    expect(canonicalRouteKey('guides')).toBe(canonicalRouteKey('/guides'));
    expect(canonicalRouteKey('/')).not.toBe(canonicalRouteKey('root'));
    expect(SiteProfileSchema.safeParse({
      ...enProfile,
      content: [
        {...content[0], routeBasePath: '/'},
        {...content[1], routeBasePath: '/reference'},
      ],
      redirects: {rules: [
        {from: '/', to: '/docs'},
        {from: 'old', to: '/new'},
      ]},
    }).success).toBe(true);
  });

  it('rejects duplicate reference kinds', () => {
    const result = SiteProfileSchema.safeParse({
      ...enProfile,
      features: {...enProfile.features, referenceKinds: ['python', 'python']},
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({path: ['features', 'referenceKinds', 1]}));
    }
  });

  it('requires navigation items to declare exactly one destination kind', () => {
    expect(NavigationItemSchema.safeParse({label: 'Docs', to: '/docs', href: 'https://example.com'}).success).toBe(false);
    expect(NavigationItemSchema.safeParse({label: 'Docs'}).success).toBe(false);
    expect(NavigationItemSchema.safeParse({label: 'Docs', to: '/docs'}).success).toBe(true);
    expect(NavigationItemSchema.safeParse({label: 'External', href: 'https://example.com/a path'}).success).toBe(true);
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
