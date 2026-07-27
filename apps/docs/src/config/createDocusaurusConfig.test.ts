import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import type {SiteProfile} from '@zilliz/site-config';
import {createDocusaurusConfig} from './createDocusaurusConfig';
import {resolveMarkdownPolicy} from './markdownPolicy';

const require = createRequire(import.meta.url);

function profile(overrides: Partial<SiteProfile> = {}): SiteProfile {
  const defaults: SiteProfile = {
    id: 'en',
    language: 'en',
    title: 'English docs',
    tagline: 'English tagline',
    url: 'https://docs.example.com',
    baseUrl: '/',
    outputDir: 'build/en',
    localization: {
      defaultLocale: 'en',
      translationRoot: 'i18n',
      locales: [
        {id: 'en', htmlLang: 'en', source: 'canonical'},
        {id: 'ja-JP', htmlLang: 'ja-JP', source: 'docusaurus-i18n'},
      ],
    },
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
  };

  return {
    ...defaults,
    ...overrides,
    localization: overrides.localization ?? (overrides.id === 'zh-CN'
      ? {
          defaultLocale: 'zh-CN',
          translationRoot: 'i18n',
          locales: [{id: 'zh-CN', htmlLang: 'zh-Hans', source: 'canonical'}],
        }
      : defaults.localization),
  };
}

function docsPlugins(config: ReturnType<typeof createDocusaurusConfig>) {
  return (config.plugins ?? []).filter(
    (plugin): plugin is [string, Record<string, unknown>] =>
      Array.isArray(plugin) && plugin[0] === '@docusaurus/plugin-content-docs',
  );
}

function applicationPlugin(
  config: ReturnType<typeof createDocusaurusConfig>,
  name: 'embed-markdown' | 'llms-txt' | 'structured-data',
): [string, {sources: Array<Record<string, string>>}] | undefined {
  return (config.plugins ?? []).find((plugin): plugin is [string, {sources: Array<Record<string, string>>}] => (
    Array.isArray(plugin) && String(plugin[0]).replaceAll('\\', '/').endsWith(`/plugins/${name}`)
  ));
}

function writeDoc(sourceDir: string, fileName: string, title: string, slug: string): void {
  mkdirSync(sourceDir, {recursive: true});
  writeFileSync(path.join(sourceDir, fileName), [
    '---',
    `title: ${title}`,
    `slug: ${slug}`,
    '---',
    '',
    `${title} fixture body.`,
    '',
  ].join('\n'));
}

function outputFiles(root: string): string[] {
  const files: string[] = [];
  const collect = (directory: string): void => {
    for (const entry of readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(target);
      else files.push(target);
    }
  };
  collect(root);
  return files.sort();
}

describe('createDocusaurusConfig', () => {
  it('registers English build plugins with exact profile-derived source descriptors and no Japanese source tree', () => {
    const english = profile({
      content: [
        {
          id: 'default',
          sourcePath: 'content/fixtures/cloud',
          routeBasePath: '/guides',
          sidebarPath: 'config/sidebars/fixtures/cloud.ts',
        },
        {
          id: 'reference',
          sourcePath: 'content/fixtures/sdk',
          routeBasePath: 'api/sdk',
          sidebarPath: 'config/sidebars/fixtures/sdk.ts',
        },
      ],
    });
    const config = createDocusaurusConfig(english);
    const sources = [
      {
        id: 'default',
        folder: path.resolve(process.cwd(), 'content/fixtures/cloud'),
        route: '/guides',
        outputFile: 'cloud-guides',
        label: 'Cloud Guides',
      },
      {
        id: 'reference',
        folder: path.resolve(process.cwd(), 'content/fixtures/sdk'),
        route: '/api/sdk',
        outputFile: 'reference',
        label: 'reference',
      },
    ];

    for (const name of ['embed-markdown', 'llms-txt', 'structured-data'] as const) {
      const plugin = applicationPlugin(config, name);
      expect(plugin?.[0]).toBe(path.resolve(process.cwd(), `apps/docs/plugins/${name}`));
      expect(plugin?.[1].sources).toEqual(sources);
      expect(JSON.stringify(plugin?.[1].sources)).not.toContain('i18n/ja-JP');
      expect(require(plugin![0])({}, plugin![1]).name).toBe(name);
    }
    expect(config.i18n?.locales).toEqual(['en', 'ja-JP']);
    expect(docsPlugins(config)).toHaveLength(english.content.length);
  });

  it('keeps build plugins English-only to preserve the documented Chinese product difference', () => {
    const chinese = createDocusaurusConfig(profile({
      id: 'zh-CN',
      language: 'zh-Hans',
      outputDir: 'build/zh-CN',
    }));

    expect(applicationPlugin(chinese, 'embed-markdown')).toBeUndefined();
    expect(applicationPlugin(chinese, 'llms-txt')).toBeUndefined();
    expect(applicationPlugin(chinese, 'structured-data')).toBeUndefined();
  });

  it('writes deterministic LLMS artifacts from absolute profile source folders', async () => {
    const fixture = mkdtempSync(path.join(os.tmpdir(), 'docs-llms-plugin-'));
    const cloud = path.join(fixture, 'profile-content', 'cloud-source');
    const sdk = path.join(fixture, 'profile-content', 'sdk-source');
    writeDoc(cloud, 'start.md', 'Cloud Start', 'start');
    writeDoc(sdk, 'client.md', 'SDK Client', 'client');
    const sources = [
      {id: 'default', folder: cloud, route: '/guides', outputFile: 'cloud-guides', label: 'Cloud Guides'},
      {id: 'sdk', folder: sdk, route: '/api/sdk', outputFile: 'sdk', label: 'sdk'},
    ];
    const outDir = path.join(fixture, 'build', 'en');
    const llmsPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/llms-txt'));

    await llmsPlugin({}, {sources}).postBuild({
      siteDir: path.join(fixture, 'legacy-site-root'),
      outDir,
      siteConfig: {url: 'https://docs.example.com', title: 'Docs', tagline: 'Documentation', customFields: {}},
    });

    expect(existsSync(path.join(outDir, 'llms.txt'))).toBe(true);
    expect(existsSync(path.join(outDir, 'llms', 'cloud-guides.txt'))).toBe(true);
    expect(existsSync(path.join(outDir, 'llms', 'sdk.txt'))).toBe(true);
    expect(readFileSync(path.join(outDir, 'llms.txt'), 'utf8')).toContain(
      '- [Cloud Guides](https://docs.example.com/llms/cloud-guides.txt)',
    );
    expect(readFileSync(path.join(outDir, 'llms', 'cloud-guides.txt'), 'utf8')).toContain(
      'https://docs.example.com/guides/start.md',
    );
    const generated = outputFiles(outDir).map(file => readFileSync(file, 'utf8')).join('\n');
    expect(generated).not.toContain(cloud);
    expect(generated).not.toContain(sdk);
    expect(generated).not.toContain('docs-byoc');
  });

  it('injects structured data into representative English and Japanese Docusaurus pages', async () => {
    const fixture = mkdtempSync(path.join(os.tmpdir(), 'docs-structured-plugin-'));
    const source = path.join(fixture, 'profile-content', 'cloud-source');
    writeDoc(source, 'start.md', 'Cloud Start', 'start');
    const outDir = path.join(fixture, 'build', 'en');
    for (const localePrefix of ['', 'ja-JP']) {
      const htmlDir = path.join(outDir, localePrefix, 'guides');
      mkdirSync(htmlDir, {recursive: true});
      writeFileSync(path.join(htmlDir, 'start.html'), '<html><head></head><body>Fixture</body></html>');
    }
    const structuredDataPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/structured-data'));

    await structuredDataPlugin({}, {
      sources: [
        {id: 'default', folder: source, route: '/guides', outputFile: 'cloud-guides', label: 'Cloud Guides'},
      ],
    }).postBuild({
      siteDir: path.join(fixture, 'legacy-site-root'),
      outDir,
      siteConfig: {
        url: 'https://docs.example.com',
        i18n: {defaultLocale: 'en', locales: ['en', 'ja-JP']},
      },
    });

    const english = readFileSync(path.join(outDir, 'guides', 'start.html'), 'utf8');
    const japanese = readFileSync(path.join(outDir, 'ja-JP', 'guides', 'start.html'), 'utf8');
    expect(english).toContain('<script type="application/ld+json">');
    expect(english).toContain('"url":"https://docs.example.com/guides/start"');
    expect(japanese).toContain('<script type="application/ld+json">');
    expect(japanese).toContain('"url":"https://docs.example.com/ja-JP/guides/start"');
    expect(`${english}\n${japanese}`).not.toContain(source);
  });

  it('publishes sanitized embed-markdown data for docs UI consumers', async () => {
    const fixture = mkdtempSync(path.join(os.tmpdir(), 'docs-embed-plugin-'));
    const source = path.join(fixture, 'profile-content', 'cloud-source');
    writeDoc(source, 'start.md', 'Cloud Start', 'start');
    const sources = [
      {id: 'default', folder: source, route: '/guides', outputFile: 'cloud-guides', label: 'Cloud Guides'},
    ];
    const embedMarkdownPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/embed-markdown'));
    let pluginData: unknown;

    await embedMarkdownPlugin({siteDir: path.join(fixture, 'legacy-site-root')}, {
      sources,
      enableSourceView: true,
    }).contentLoaded({actions: {setGlobalData(data: unknown) { pluginData = data; }}});

    expect(pluginData).toEqual(expect.objectContaining({
      enableSourceView: true,
      sources: [{id: 'default', route: '/guides'}],
    }));
    expect(JSON.stringify(pluginData)).not.toContain(source);
    expect(JSON.stringify(pluginData)).not.toContain('legacy-site-root');
  });

  it('registers only the English profile content and its configured locales', () => {
    const config = createDocusaurusConfig(profile());

    expect(docsPlugins(config).map(([, options]) => options.id)).toEqual(['default', 'reference']);
    expect(config.i18n).toEqual({
      defaultLocale: 'en',
      path: path.resolve(process.cwd(), 'i18n'),
      locales: ['en', 'ja-JP'],
      localeConfigs: {
        en: {htmlLang: 'en'},
        'ja-JP': {htmlLang: 'ja-JP'},
      },
    });
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
      path: path.resolve(process.cwd(), 'i18n'),
      locales: ['zh-CN'],
      localeConfigs: {'zh-CN': {htmlLang: 'zh-Hans'}},
    });
    expect(docsPlugins(createDocusaurusConfig(chinese)).every(([, options]) => (
      !path.relative(process.cwd(), String(options.path)).startsWith('i18n/')
    ))).toBe(true);
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
      path: path.resolve(process.cwd(), 'i18n'),
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
