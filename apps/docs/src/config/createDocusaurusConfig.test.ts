import {mkdtempSync, readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import type {SiteProfile} from '@zilliz/site-config';
import {createDocusaurusConfig} from './createDocusaurusConfig';
import {resolveMarkdownPolicy} from './markdownPolicy';

function profile(overrides: Partial<SiteProfile> = {}): SiteProfile {
  return {
    id: 'en',
    language: 'en',
    title: 'English docs',
    tagline: 'English tagline',
    url: 'https://docs.example.com',
    baseUrl: '/',
    outputDir: 'build/en',
    content: [
      {
        id: 'default',
        sourcePath: 'content/en/guides',
        routeBasePath: 'docs',
        sidebarPath: 'config/sidebars/en/guides.ts',
        include: ['**/*.md'],
        exclude: ['drafts/**'],
      },
      {
        id: 'reference',
        sourcePath: 'content/en/reference',
        routeBasePath: 'reference',
        sidebarPath: 'config/sidebars/en/reference.ts',
      },
    ],
    manuals: [],
    navigation: {
      items: [{label: 'Guides', to: '/docs'}, {label: 'Company', href: 'https://example.com'}],
      secondaryItems: [{label: 'Guides', href: '/docs', prefix: '/docs', icon: 'cloud'}],
    },
    features: {
      chat: true,
      askAi: true,
      feedback: true,
      cloudSelector: true,
      byoc: false,
      onpremise: false,
      agents: false,
      referenceKinds: ['python'],
    },
    markdown: {
      remarkPlugins: ['math', 'math-brace-fix'],
      rehypePlugins: ['katex', 'wrap-tables', 'emoji-marks'],
    },
    integrations: {searchProvider: 'search-one', analyticsProvider: 'analytics-one'},
    staticRoots: ['apps/docs/static/shared', 'apps/docs/static/en'],
    redirects: {rules: [{from: '/old', to: '/docs', permanent: true}]},
    robots: {index: true, sitemap: true},
    ...overrides,
  };
}

function docsPlugins(config: ReturnType<typeof createDocusaurusConfig>) {
  return (config.plugins ?? []).filter(
    (plugin): plugin is [string, Record<string, unknown>] =>
      Array.isArray(plugin) && plugin[0] === '@docusaurus/plugin-content-docs',
  );
}

describe('createDocusaurusConfig', () => {
  it('registers only the English profile content and one configured locale', () => {
    const config = createDocusaurusConfig(profile());

    expect(docsPlugins(config).map(([, options]) => options.id)).toEqual(['default', 'reference']);
    expect(config.i18n).toEqual({defaultLocale: 'en', locales: ['en']});
    expect(config.customFields?.outputDir).toBe('build/en');
    expect(JSON.stringify(config)).not.toContain('i18n/zh-CN');
    expect(config.presets).toContainEqual([
      '@docusaurus/preset-classic',
      {docs: false, blog: false, pages: false, theme: {customCss: expect.stringMatching(/apps\/docs\/src\/css\/custom\.css$/)}},
    ]);
    expect(config.plugins).toContainEqual([
      '@zilliz/docs-ui/docusaurus',
      {modules: ['shared-theme', 'shared-components', 'english-navigation', 'english-home']},
    ]);
    expect(config.future).toMatchObject({
      v4: true,
      faster: {
        rspackBundler: false,
        rspackPersistentCache: false,
        mdxCrossCompilerCache: false,
        ssgWorkerThreads: false,
      },
    });
  });

  it('allows Chinese-only content without leaking it into English', () => {
    const chinese = profile({
      id: 'zh-CN',
      language: 'zh-Hans',
      title: 'Chinese docs',
      outputDir: 'build/zh-CN',
      content: [
        {id: 'onpremise', sourcePath: 'content/zh-CN/onpremise', routeBasePath: 'onpremise', sidebarPath: 'config/sidebars/zh-CN/onpremise.ts'},
        {id: 'agents', sourcePath: 'content/zh-CN/agents', routeBasePath: 'agents', sidebarPath: 'config/sidebars/zh-CN/agents.ts'},
      ],
      markdown: {remarkPlugins: [], rehypePlugins: []},
    });

    expect(docsPlugins(createDocusaurusConfig(chinese)).map(([, options]) => options.id)).toEqual(['onpremise', 'agents']);
    expect(docsPlugins(createDocusaurusConfig(profile())).map(([, options]) => options.id)).not.toContain('onpremise');
    expect(createDocusaurusConfig(chinese).i18n).toEqual({
      defaultLocale: 'zh-CN',
      locales: ['zh-CN'],
      localeConfigs: {'zh-CN': {htmlLang: 'zh-Hans'}},
    });
    expect(createDocusaurusConfig(chinese).plugins).toContainEqual([
      '@zilliz/docs-ui/docusaurus',
      {modules: ['shared-theme', 'shared-components', 'chinese-home']},
    ]);
    expect(createDocusaurusConfig(chinese).plugins).toContainEqual([
      '@docusaurus/plugin-content-pages',
      {path: expect.stringMatching(/packages\/docs-ui\/src\/zh-CN\/pages$/)},
    ]);
    expect(createDocusaurusConfig(chinese).future).toMatchObject({
      faster: {ssgWorkerThreads: true},
    });
  });

  it('restores the legacy Chinese local-search route without enabling it for English', () => {
    const chinese = profile({
      id: 'zh-CN',
      language: 'zh-Hans',
      outputDir: 'build/zh-CN',
      integrations: {searchProvider: 'local', chatProvider: 'inkeep'},
    });

    expect(createDocusaurusConfig(chinese).themes).toContainEqual([
      '@easyops-cn/docusaurus-search-local',
      expect.objectContaining({
        hashed: true,
        indexBlog: false,
        language: ['en', 'zh'],
        docsRouteBasePath: ['docs', 'reference'],
      }),
    ]);
    expect(createDocusaurusConfig(profile()).themes ?? []).toEqual([]);
  });

  it('maps site-owned exclusions and current-version route paths into docs plugin options', () => {
    const chinese = profile({
      id: 'zh-CN',
      language: 'zh-Hans',
      title: 'Chinese docs',
      outputDir: 'build/zh-CN',
      content: [
        {
          id: 'default',
          sourcePath: 'content/zh-CN/guides',
          routeBasePath: 'docs',
          sidebarPath: 'config/sidebars/zh-CN/guides.ts',
          exclude: ['tutorials/get-started/release-notes/release-notes.md'],
        },
        {
          id: 'onpremise',
          sourcePath: 'content/zh-CN/onpremise',
          routeBasePath: 'on-premise',
          sidebarPath: 'config/sidebars/zh-CN/onpremise.ts',
          currentVersionPath: 'v2.4.11',
        },
      ],
      markdown: {remarkPlugins: [], rehypePlugins: []},
    });

    expect(chinese.content[1].currentVersionPath).toBe('v2.4.11');
    const plugins = docsPlugins(createDocusaurusConfig(chinese));
    expect(plugins[0][1]).toMatchObject({
      id: 'default',
      exclude: ['tutorials/get-started/release-notes/release-notes.md'],
    });
    expect(plugins[1][1]).toMatchObject({
      id: 'onpremise',
      lastVersion: 'current',
      versions: {current: {path: 'v2.4.11'}},
    });
  });

  it('maps every declared content field and named English Markdown policy exactly once', () => {
    const config = createDocusaurusConfig(profile());
    const plugins = docsPlugins(config);
    const markdownPolicy = resolveMarkdownPolicy(profile().markdown);

    expect(plugins[0][1]).toMatchObject({
      id: 'default',
      routeBasePath: 'docs',
      include: ['**/*.md'],
      exclude: ['drafts/**'],
      remarkPlugins: markdownPolicy.remarkPlugins,
      rehypePlugins: markdownPolicy.rehypePlugins,
    });
    expect(String(plugins[0][1].path)).toMatch(/content\/en\/guides$/);
    expect(String(plugins[0][1].sidebarPath)).toMatch(/config\/sidebars\/en\/guides\.ts$/);
    for (const [, options] of plugins) {
      expect(options.remarkPlugins).toEqual(markdownPolicy.remarkPlugins);
      expect(options.rehypePlugins).toEqual(markdownPolicy.rehypePlugins);
    }
    expect(config.stylesheets).toEqual(markdownPolicy.stylesheets);
  });

  it('does not apply the English Markdown policy or Docusaurus docs i18n to Chinese', () => {
    const chinese = profile({
      id: 'zh-CN',
      language: 'zh-Hans',
      outputDir: 'build/zh-CN',
      markdown: {remarkPlugins: [], rehypePlugins: []},
    });
    const config = createDocusaurusConfig(chinese);
    expect(docsPlugins(config).every(([, options]) => (
      (options.remarkPlugins as unknown[]).length === 0 &&
      (options.rehypePlugins as unknown[]).length === 0
    ))).toBe(true);
    expect(config.stylesheets).toEqual([]);
    expect(config.i18n).toEqual({
      defaultLocale: 'zh-CN',
      locales: ['zh-CN'],
      localeConfigs: {'zh-CN': {htmlLang: 'zh-Hans'}},
    });
  });

  it('maps profile navigation, redirects, static roots, integrations, and features explicitly', () => {
    const config = createDocusaurusConfig(profile({
      integrations: {
        searchProvider: 'search-one',
        analyticsProvider: 'analytics-one',
        restApi: {planeConfig: {controlPlaneKeywords: {zilliz: ['cluster'], milvus: []}}},
      },
    }));
    const redirectPlugin = (config.plugins ?? []).find(
      plugin => Array.isArray(plugin) && plugin[0] === '@docusaurus/plugin-client-redirects',
    ) as [string, {createRedirects(path: string): string[] | undefined}];

    expect(config.staticDirectories?.map(String).join('|')).toMatch(/static\/shared.*static\/en/);
    expect(config.themeConfig).toMatchObject({
      navbar: {
        title: '',
        logo: {alt: 'Zilliz Logo', src: '/img/logo.svg', href: 'https://zilliz.com'},
        items: [{label: 'Guides', to: '/docs'}, {label: 'Company', href: 'https://example.com'}],
      },
    });
    expect(config.customFields).toMatchObject({
      integrations: {
        searchProvider: 'search-one',
        analyticsProvider: 'analytics-one',
        restApi: {planeConfig: {controlPlaneKeywords: {zilliz: ['cluster'], milvus: []}}},
      },
      planeConfig: {controlPlaneKeywords: {zilliz: ['cluster'], milvus: []}},
      features: {chat: true, referenceKinds: ['python']},
      redirects: {rules: [{from: '/old', to: '/docs', permanent: true}]},
      secondaryNavbar: [{label: 'Guides', href: '/docs', prefix: '/docs', icon: 'cloud'}],
    });
    expect(redirectPlugin[1].createRedirects('/docs')).toEqual(['/old']);
    expect(redirectPlugin[1].createRedirects('/other')).toBeUndefined();
  });

  it('registers disjoint site-owned standalone page roots', () => {
    const englishPages = (createDocusaurusConfig(profile()).plugins ?? []).find(
      plugin => Array.isArray(plugin) && plugin[0] === '@docusaurus/plugin-content-pages',
    ) as [string, {path: string}];
    expect(englishPages[1].path).toMatch(/apps\/docs\/src\/pages$/);

    const chinese = createDocusaurusConfig(profile({id: 'zh-CN', language: 'zh-Hans'}));
    const chinesePages = (chinese.plugins ?? []).find(
      plugin => Array.isArray(plugin) && plugin[0] === '@docusaurus/plugin-content-pages',
    ) as [string, {path: string}];
    expect(chinesePages[1].path).toMatch(/packages\/docs-ui\/src\/zh-CN\/pages$/);
    expect(chinesePages[1].path).not.toBe(englishPages[1].path);
  });

  it('registers English Inkeep runtime integration and loads runtime environment before UI hydration', () => {
    const config = createDocusaurusConfig(profile({
      integrations: {searchProvider: 'inkeep', chatProvider: 'inkeep'},
    }), {
      INKEEP_API_KEY: 'api-key',
      INKEEP_INTEGRATION_ID: 'integration-id',
      INKEEP_ORGANIZATION_ID: 'organization-id',
    });
    expect(config.headTags).toContainEqual({tagName: 'script', attributes: {src: '/env.js'}});
    expect(config.plugins).toContainEqual([
      '@inkeep/cxkit-docusaurus',
      {
        SearchBar: {baseSettings: {
          apiKey: 'api-key', integrationId: 'integration-id', organizationId: 'organization-id',
        }},
        ChatButton: {baseSettings: {
          apiKey: 'api-key', integrationId: 'integration-id', organizationId: 'organization-id',
        }},
      },
    ]);
  });

  it('keeps Inkeep English-only and emits a credential-free config that can degrade safely', () => {
    const integrations = {searchProvider: 'inkeep', chatProvider: 'inkeep'};
    const english = createDocusaurusConfig(profile({integrations}), {});
    const inkeep = (english.plugins ?? []).find(
      plugin => Array.isArray(plugin) && plugin[0] === '@inkeep/cxkit-docusaurus',
    ) as [string, {SearchBar: {baseSettings: Record<string, unknown>}}];
    expect(inkeep[1].SearchBar.baseSettings).toEqual({
      apiKey: undefined, integrationId: undefined, organizationId: undefined,
    });

    const chinese = createDocusaurusConfig(profile({
      id: 'zh-CN', language: 'zh-Hans', outputDir: 'build/zh-CN', integrations,
    }), {
      INKEEP_API_KEY: 'must-not-leak',
      INKEEP_INTEGRATION_ID: 'must-not-leak',
      INKEEP_ORGANIZATION_ID: 'must-not-leak',
    });
    expect(chinese.headTags ?? []).not.toContainEqual({tagName: 'script', attributes: {src: '/env.js'}});
    expect((chinese.plugins ?? []).some(
      plugin => Array.isArray(plugin) && plugin[0] === '@inkeep/cxkit-docusaurus',
    )).toBe(false);
  });

  it('keeps the application bootstrap thin and exact', () => {
    const bootstrap = readFileSync(
      path.join(process.cwd(), 'apps/docs/docusaurus.config.ts'),
      'utf8',
    );
    expect(bootstrap).toBe(
      "import {resolveSiteProfile} from '@zilliz/site-config';\n" +
      "import {createDocusaurusConfig} from './src/config/createDocusaurusConfig';\n\n" +
      `export default createDocusaurusConfig(resolveSiteProfile(${['process', 'env', 'ZDOC_SITE'].join('.')}));\n`,
    );
  });

  it('keeps generated Docusaurus registry files in CommonJS scope', () => {
    const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), 'apps/docs/package.json'), 'utf8'));
    expect(packageJson.type).toBeUndefined();
    expect(packageJson.scripts['build:en']).toMatch(
      /^NODE_OPTIONS=--max-old-space-size=8192 node --experimental-strip-types \.\.\/\.\.\/scripts\/build\/run-with-publication-read-fence\.mjs --site en -- docusaurus build /,
    );
    expect(packageJson.scripts['build:zh-CN']).toMatch(
      /^DOCUSAURUS_SSG_WORKER_THREAD_COUNT=2 NODE_OPTIONS=--max-old-space-size=4096 node --experimental-strip-types \.\.\/\.\.\/scripts\/build\/run-with-publication-read-fence\.mjs --site zh-CN -- docusaurus build /,
    );
  });

  it('keeps the root build command behind the English publication fence', () => {
    const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    expect(packageJson.scripts.build).toBe('pnpm run build:en');
  });

  it('resolves repository paths from the factory module instead of the caller cwd', async () => {
    const originalCwd = process.cwd();
    process.chdir(mkdtempSync(path.join(os.tmpdir(), 'docs-config-cwd-')));
    try {
      vi.resetModules();
      const reloaded = await import('./createDocusaurusConfig');
      const config = reloaded.createDocusaurusConfig(profile());
      expect(String(docsPlugins(config)[0][1].path)).toMatch(/content\/en\/guides$/);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
