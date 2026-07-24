import {mkdtempSync, readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import type {SiteProfile} from '@zilliz/site-config';
import {createDocusaurusConfig} from './createDocusaurusConfig';

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
    navigation: {items: [{label: 'Guides', to: '/docs'}, {label: 'Company', href: 'https://example.com'}]},
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
    markdown: {remarkPlugins: ['remark-gfm'], rehypePlugins: ['rehype-katex']},
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
      faster: {rspackBundler: false, rspackPersistentCache: false, mdxCrossCompilerCache: true},
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
      {modules: ['shared-theme', 'shared-components']},
    ]);
  });

  it('maps every declared content field and shared Markdown plugin exactly once', () => {
    const config = createDocusaurusConfig(profile());
    const plugins = docsPlugins(config);

    expect(plugins[0][1]).toMatchObject({
      id: 'default',
      routeBasePath: 'docs',
      include: ['**/*.md'],
      exclude: ['drafts/**'],
      remarkPlugins: ['remark-gfm'],
      rehypePlugins: ['rehype-katex'],
    });
    expect(String(plugins[0][1].path)).toMatch(/content\/en\/guides$/);
    expect(String(plugins[0][1].sidebarPath)).toMatch(/config\/sidebars\/en\/guides\.ts$/);
    for (const [, options] of plugins) {
      expect(options.remarkPlugins).toEqual(['remark-gfm']);
      expect(options.rehypePlugins).toEqual(['rehype-katex']);
    }
  });

  it('maps profile navigation, redirects, static roots, integrations, and features explicitly', () => {
    const config = createDocusaurusConfig(profile());
    const redirectPlugin = (config.plugins ?? []).find(
      plugin => Array.isArray(plugin) && plugin[0] === '@docusaurus/plugin-client-redirects',
    ) as [string, {createRedirects(path: string): string[] | undefined}];

    expect(config.staticDirectories?.map(String).join('|')).toMatch(/static\/shared.*static\/en/);
    expect(config.themeConfig).toMatchObject({navbar: {items: [{label: 'Guides', to: '/docs'}, {label: 'Company', href: 'https://example.com'}]}});
    expect(config.customFields).toMatchObject({
      integrations: {searchProvider: 'search-one', analyticsProvider: 'analytics-one'},
      features: {chat: true, referenceKinds: ['python']},
      redirects: {rules: [{from: '/old', to: '/docs', permanent: true}]},
    });
    expect(redirectPlugin[1].createRedirects('/docs')).toEqual(['/old']);
    expect(redirectPlugin[1].createRedirects('/other')).toBeUndefined();
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
