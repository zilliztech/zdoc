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

function writeDoc(
  sourceDir: string,
  fileName: string,
  title: string,
  slug: string,
  description = `${title} description.`,
  body = `${title} fixture body.`,
): void {
  const target = path.join(sourceDir, fileName);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, [
    '---',
    `title: ${JSON.stringify(title)}`,
    `slug: ${slug}`,
    `description: ${JSON.stringify(description)}`,
    '---',
    '',
    body,
    '',
  ].join('\n'));
}

type PluginSourceFixture = {
  id: 'default' | 'byoc' | 'reference';
  folder: string;
  route: string;
  outputFile: string;
  label: string;
  slug: string;
  englishTitle: string;
  japaneseTitle: string;
  japaneseDescription: string;
  japaneseBody: string;
  fallbackSlug: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackBody: string;
  orphanSlug: string;
  orphanTitle: string;
  orphanBody: string;
};

function translatedSourceFolder(localizationDir: string, id: PluginSourceFixture['id']): string {
  const pluginDirectory = id === 'default'
    ? 'docusaurus-plugin-content-docs'
    : `docusaurus-plugin-content-docs-${id}`;
  return path.join(localizationDir, pluginDirectory, 'current');
}

function createLocalePluginFixture(prefix: string) {
  const root = mkdtempSync(path.join(os.tmpdir(), prefix));
  const localizationDir = path.join(root, 'i18n', 'ja-JP');
  const sources: PluginSourceFixture[] = [
    {
      id: 'default',
      folder: path.join(root, 'profile-content', 'cloud'),
      route: '/guides',
      outputFile: 'cloud-guides',
      label: 'Cloud Guides',
      slug: 'cloud-start',
      englishTitle: 'Cloud Start',
      japaneseTitle: 'クラウド入門',
      japaneseDescription: 'クラウドの日本語説明。',
      japaneseBody: 'クラウドの日本語本文。',
      fallbackSlug: 'cloud-fallback',
      fallbackTitle: 'Cloud Fallback',
      fallbackDescription: 'Cloud fallback description.',
      fallbackBody: 'Cloud fallback English body.',
      orphanSlug: 'cloud-orphan',
      orphanTitle: 'クラウド孤立翻訳',
      orphanBody: 'クラウド孤立翻訳本文。',
    },
    {
      id: 'byoc',
      folder: path.join(root, 'profile-content', 'byoc'),
      route: '/guides/byoc',
      outputFile: 'byoc',
      label: 'byoc',
      slug: 'byoc-start',
      englishTitle: 'BYOC Start',
      japaneseTitle: 'BYOC 入門',
      japaneseDescription: 'BYOC の日本語説明。',
      japaneseBody: 'BYOC の日本語本文。',
      fallbackSlug: 'byoc-fallback',
      fallbackTitle: 'BYOC Fallback',
      fallbackDescription: 'BYOC fallback description.',
      fallbackBody: 'BYOC fallback English body.',
      orphanSlug: 'byoc-orphan',
      orphanTitle: 'BYOC 孤立翻訳',
      orphanBody: 'BYOC 孤立翻訳本文。',
    },
    {
      id: 'reference',
      folder: path.join(root, 'profile-content', 'reference'),
      route: '/reference',
      outputFile: 'reference',
      label: 'reference',
      slug: 'api-client',
      englishTitle: 'API Client',
      japaneseTitle: 'API クライアント',
      japaneseDescription: 'API の日本語説明。',
      japaneseBody: 'API の日本語本文。',
      fallbackSlug: 'api-fallback',
      fallbackTitle: 'API Fallback',
      fallbackDescription: 'API fallback description.',
      fallbackBody: 'API fallback English body.',
      orphanSlug: 'api-orphan',
      orphanTitle: 'API 孤立翻訳',
      orphanBody: 'API 孤立翻訳本文。',
    },
  ];

  for (const source of sources) {
    writeDoc(source.folder, `${source.slug}.md`, source.englishTitle, source.slug);
    writeDoc(
      source.folder,
      path.join('fallback', `${source.fallbackSlug}.md`),
      source.fallbackTitle,
      source.fallbackSlug,
      source.fallbackDescription,
      source.fallbackBody,
    );
    writeDoc(
      translatedSourceFolder(localizationDir, source.id),
      `${source.slug}.md`,
      source.japaneseTitle,
      source.slug,
      source.japaneseDescription,
      source.japaneseBody,
    );
    writeDoc(
      translatedSourceFolder(localizationDir, source.id),
      path.join('orphan', `${source.orphanSlug}.md`),
      source.orphanTitle,
      source.orphanSlug,
      `${source.orphanTitle} description.`,
      source.orphanBody,
    );
  }

  return {root, localizationDir, sources};
}

function pluginSourceOptions(fixture: ReturnType<typeof createLocalePluginFixture>) {
  return fixture.sources.map(({id, folder, route, outputFile, label}) => ({
    id, folder, route, outputFile, label,
  }));
}

function localeLifecycle(
  fixture: ReturnType<typeof createLocalePluginFixture>,
  locale: 'en' | 'ja-JP',
) {
  const baseUrl = locale === 'en' ? '/' : '/ja-JP/';
  return {
    siteDir: path.join(fixture.root, 'site'),
    localizationDir: fixture.localizationDir,
    outDir: path.join(fixture.root, 'build', 'en', locale === 'en' ? '' : locale),
    baseUrl,
    i18n: {defaultLocale: 'en', currentLocale: locale, locales: ['en', 'ja-JP']},
    siteConfig: {
      url: 'https://docs.example.com',
      title: locale === 'en' ? 'Docs' : 'ドキュメント',
      tagline: locale === 'en' ? 'Documentation' : '製品ドキュメント',
      baseUrl,
      customFields: {},
    },
  };
}

function localizedRoute(baseUrl: string, route: string, slug: string): string {
  return `${baseUrl}${route.replace(/^\//, '')}/${slug}`.replace(/\/+/g, '/');
}

function jsonLdFromHtml(html: string): {raw: string; value: Record<string, unknown>} {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  expect(match).not.toBeNull();
  return {raw: match![1], value: JSON.parse(match![1])};
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

  it('writes LLMS artifacts with Docusaurus locale fallback and no translation-only routes', async () => {
    const fixture = createLocalePluginFixture('docs-llms-plugin-');
    const llmsPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/llms-txt'));
    const pluginSources = pluginSourceOptions(fixture);
    const english = localeLifecycle(fixture, 'en');
    const japanese = localeLifecycle(fixture, 'ja-JP');

    await llmsPlugin(english, {sources: pluginSources}).postBuild(english);
    await llmsPlugin(japanese, {sources: pluginSources}).postBuild(japanese);

    expect(existsSync(path.join(english.outDir, 'llms.txt'))).toBe(true);
    expect(existsSync(path.join(japanese.outDir, 'llms.txt'))).toBe(true);
    for (const source of fixture.sources) {
      const englishSection = readFileSync(path.join(english.outDir, 'llms', `${source.outputFile}.txt`), 'utf8');
      const japaneseSection = readFileSync(path.join(japanese.outDir, 'llms', `${source.outputFile}.txt`), 'utf8');
      expect(englishSection).toContain(`## ${source.englishTitle}`);
      expect(japaneseSection).toContain(`## ${source.japaneseTitle}`);
      expect(japaneseSection).toContain(source.japaneseDescription);
      expect(japaneseSection).toContain(`## ${source.fallbackTitle}`);
      expect(japaneseSection).toContain(source.fallbackDescription);
      expect(japaneseSection).toContain(
        `https://docs.example.com/ja-JP${source.route}/${source.slug}.md`,
      );
      expect(japaneseSection).toContain(
        `https://docs.example.com/ja-JP${source.route}/${source.fallbackSlug}.md`,
      );
      expect(japaneseSection).not.toContain(source.englishTitle);
      expect(japaneseSection).not.toContain(source.orphanTitle);
      expect(japaneseSection).not.toContain(source.orphanBody);
    }
    expect(readFileSync(path.join(english.outDir, 'llms.txt'), 'utf8')).toContain(
      '- [Cloud Guides](https://docs.example.com/llms/cloud-guides.txt)',
    );
    expect(readFileSync(path.join(japanese.outDir, 'llms.txt'), 'utf8')).toContain(
      '- [Cloud Guides](https://docs.example.com/ja-JP/llms/cloud-guides.txt)',
    );
    const generated = outputFiles(path.join(fixture.root, 'build'))
      .map(file => readFileSync(file, 'utf8')).join('\n');
    for (const source of fixture.sources) expect(generated).not.toContain(source.folder);
    expect(generated).not.toContain('docs-byoc');
  });

  it('injects structured data with Docusaurus locale fallback and no translation-only routes', async () => {
    const fixture = createLocalePluginFixture('docs-structured-plugin-');
    const pluginSources = pluginSourceOptions(fixture);
    const english = localeLifecycle(fixture, 'en');
    const japanese = localeLifecycle(fixture, 'ja-JP');
    for (const lifecycle of [english, japanese]) {
      for (const source of fixture.sources) {
        const htmlDir = path.join(lifecycle.outDir, source.route.replace(/^\//, ''));
        mkdirSync(htmlDir, {recursive: true});
        writeFileSync(path.join(htmlDir, `${source.slug}.html`), '<html><head></head><body>Fixture</body></html>');
        writeFileSync(path.join(htmlDir, `${source.fallbackSlug}.html`), '<html><head></head><body>Fixture</body></html>');
        writeFileSync(path.join(htmlDir, `${source.orphanSlug}.html`), '<html><head></head><body>Orphan fixture</body></html>');
      }
    }
    const structuredDataPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/structured-data'));

    await structuredDataPlugin(english, {sources: pluginSources}).postBuild(english);
    await structuredDataPlugin(japanese, {sources: pluginSources}).postBuild(japanese);

    for (const source of fixture.sources) {
      const englishHtml = readFileSync(
        path.join(english.outDir, source.route.replace(/^\//, ''), `${source.slug}.html`),
        'utf8',
      );
      const japaneseHtml = readFileSync(
        path.join(japanese.outDir, source.route.replace(/^\//, ''), `${source.slug}.html`),
        'utf8',
      );
      const englishData = jsonLdFromHtml(englishHtml).value;
      const japaneseData = jsonLdFromHtml(japaneseHtml).value;
      expect(englishData.name).toBe(source.englishTitle);
      expect(japaneseData.name).toBe(source.japaneseTitle);
      expect(japaneseData.description).toBe(source.japaneseDescription);
      expect(japaneseData.url).toBe(`https://docs.example.com/ja-JP${source.route}/${source.slug}`);
      expect(japaneseHtml).not.toContain(source.englishTitle);
      const japaneseFallbackHtml = readFileSync(
        path.join(japanese.outDir, source.route.replace(/^\//, ''), `${source.fallbackSlug}.html`),
        'utf8',
      );
      const japaneseFallbackData = jsonLdFromHtml(japaneseFallbackHtml).value;
      expect(japaneseFallbackData.name).toBe(source.fallbackTitle);
      expect(japaneseFallbackData.description).toBe(source.fallbackDescription);
      expect(japaneseFallbackData.url).toBe(
        `https://docs.example.com/ja-JP${source.route}/${source.fallbackSlug}`,
      );
      const japaneseOrphanHtml = readFileSync(
        path.join(japanese.outDir, source.route.replace(/^\//, ''), `${source.orphanSlug}.html`),
        'utf8',
      );
      expect(japaneseOrphanHtml).not.toContain('application/ld+json');
    }
  });

  it('copies Markdown with Docusaurus locale fallback and no translation-only routes', async () => {
    const fixture = createLocalePluginFixture('docs-embed-locales-');
    const pluginSources = pluginSourceOptions(fixture);
    const english = localeLifecycle(fixture, 'en');
    const japanese = localeLifecycle(fixture, 'ja-JP');
    const embedMarkdownPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/embed-markdown'));

    await embedMarkdownPlugin(english, {sources: pluginSources}).postBuild({
      ...english,
      routesPaths: fixture.sources.flatMap(source => [
        localizedRoute(english.baseUrl, source.route, source.slug),
        localizedRoute(english.baseUrl, source.route, source.fallbackSlug),
      ]),
    });
    await embedMarkdownPlugin(japanese, {sources: pluginSources}).postBuild({
      ...japanese,
      routesPaths: fixture.sources.flatMap(source => [
        localizedRoute(japanese.baseUrl, source.route, source.slug),
        localizedRoute(japanese.baseUrl, source.route, source.fallbackSlug),
        localizedRoute(japanese.baseUrl, source.route, source.orphanSlug),
      ]),
    });

    for (const source of fixture.sources) {
      const englishMarkdown = readFileSync(
        path.join(english.outDir, source.route.replace(/^\//, ''), `${source.slug}.md`),
        'utf8',
      );
      const japaneseMarkdown = readFileSync(
        path.join(japanese.outDir, source.route.replace(/^\//, ''), `${source.slug}.md`),
        'utf8',
      );
      expect(englishMarkdown).toContain(source.englishTitle);
      expect(japaneseMarkdown).toContain(source.japaneseTitle);
      expect(japaneseMarkdown).toContain(source.japaneseBody);
      expect(japaneseMarkdown).not.toContain(source.englishTitle);
      const japaneseFallbackMarkdown = readFileSync(
        path.join(japanese.outDir, source.route.replace(/^\//, ''), `${source.fallbackSlug}.md`),
        'utf8',
      );
      expect(japaneseFallbackMarkdown).toContain(source.fallbackTitle);
      expect(japaneseFallbackMarkdown).toContain(source.fallbackBody);
      expect(existsSync(
        path.join(japanese.outDir, source.route.replace(/^\//, ''), `${source.orphanSlug}.md`),
      )).toBe(false);
    }

    let japanesePluginData: unknown;
    await embedMarkdownPlugin(japanese, {sources: pluginSources}).contentLoaded({
      actions: {setGlobalData(data: unknown) { japanesePluginData = data; }},
    });
    expect(japanesePluginData).toEqual(expect.objectContaining({
      sources: fixture.sources.map(source => ({
        id: source.id,
        route: localizedRoute(japanese.baseUrl, source.route, '').replace(/\/$/, ''),
      })),
    }));
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

  it('rejects relative source folders in every build plugin', () => {
    const source = {
      id: 'default',
      folder: 'content/en/guides',
      route: '/guides',
      outputFile: 'cloud-guides',
      label: 'Cloud Guides',
    };

    for (const name of ['embed-markdown', 'llms-txt', 'structured-data']) {
      const plugin = require(path.resolve(process.cwd(), `apps/docs/plugins/${name}`));
      expect(() => plugin({}, {sources: [source]})).toThrow(/absolute/i);
    }
  });

  it('rejects unsafe LLMS destination options before writing output', () => {
    const fixture = mkdtempSync(path.join(os.tmpdir(), 'docs-llms-safety-'));
    const sourceFolder = path.join(fixture, 'source');
    writeDoc(sourceFolder, 'start.md', 'Start', 'start');
    const llmsPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/llms-txt'));
    const source = {
      id: 'default', folder: sourceFolder, route: '/guides', outputFile: 'cloud-guides', label: 'Cloud Guides',
    };
    const invalidOptions = [
      {sources: [source], outputDir: '../escape'},
      {sources: [source], outputDir: path.join(fixture, 'absolute-output')},
      {sources: [source], outputPaths: ['../llms.txt']},
      {sources: [source], outputPaths: [path.join(fixture, 'absolute-llms.txt')]},
      {sources: [{...source, outputFile: '../escape'}]},
      {sources: [{...source, outputFile: 'nested/file'}]},
    ];

    for (const options of invalidOptions) {
      expect(() => llmsPlugin({}, options)).toThrow(/output|relative|safe|token|absolute/i);
    }
    expect(existsSync(path.join(fixture, 'build'))).toBe(false);
  });

  it('rejects duplicate or colliding LLMS output paths before writing output', () => {
    const fixture = mkdtempSync(path.join(os.tmpdir(), 'docs-llms-collision-'));
    const sourceFolder = path.join(fixture, 'source');
    writeDoc(sourceFolder, 'start.md', 'Start', 'start');
    const llmsPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/llms-txt'));
    const source = {
      id: 'default', folder: sourceFolder, route: '/guides', outputFile: 'cloud-guides', label: 'Cloud Guides',
    };

    expect(() => llmsPlugin({}, {
      sources: [source, {...source, id: 'reference', outputFile: 'cloud-guides'}],
    })).toThrow(/duplicate|collision/i);
    expect(() => llmsPlugin({}, {
      sources: [source], outputPaths: ['llms.txt', './llms.txt'],
    })).toThrow(/duplicate|collision/i);
    expect(() => llmsPlugin({}, {
      sources: [source], outputPaths: ['llms/cloud-guides.txt'],
    })).toThrow(/duplicate|collision/i);
    expect(() => llmsPlugin({}, {
      sources: [source], outputPaths: ['llms'],
    })).toThrow(/duplicate|collision/i);
    expect(existsSync(path.join(fixture, 'build'))).toBe(false);
  });

  it('escapes structured-data JSON so frontmatter cannot terminate its script element', async () => {
    const fixture = createLocalePluginFixture('docs-structured-escape-');
    const dangerousTitle = 'Danger </script><script>alert(1)</script>';
    const source = fixture.sources[0];
    writeDoc(source.folder, `${source.slug}.md`, dangerousTitle, source.slug, 'Safe description');
    const english = localeLifecycle(fixture, 'en');
    const htmlDir = path.join(english.outDir, source.route.replace(/^\//, ''));
    mkdirSync(htmlDir, {recursive: true});
    writeFileSync(path.join(htmlDir, `${source.slug}.html`), '<html><head></head><body>Fixture</body></html>');
    const structuredDataPlugin = require(path.resolve(process.cwd(), 'apps/docs/plugins/structured-data'));

    await structuredDataPlugin(english, {sources: [{
      id: source.id,
      folder: source.folder,
      route: source.route,
      outputFile: source.outputFile,
      label: source.label,
    }]}).postBuild(english);

    const html = readFileSync(path.join(htmlDir, `${source.slug}.html`), 'utf8');
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const jsonLd = jsonLdFromHtml(html);
    expect(jsonLd.raw).not.toContain('</script>');
    expect(jsonLd.value.name).toBe(dangerousTitle);
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
      faster: {ssgWorkerThreads: false},
    });
  });

  it('excludes retained Chinese Reference retirement targets from published routes', () => {
    const chinese = profile({
      id: 'zh-CN',
      language: 'zh-Hans',
      outputDir: 'build/zh-CN',
      content: [{
        id: 'reference',
        sourcePath: 'content/zh-CN/reference',
        routeBasePath: 'reference',
        sidebarPath: 'config/sidebars/zh-CN/reference.ts',
      }],
    });
    const manifest = JSON.parse(readFileSync(
      path.join(process.cwd(), 'generated/zh-CN/manifests/reference-translations.json'),
      'utf8',
    )) as {records: Array<{status: string; targetPath: string}>};
    const expected = manifest.records
      .filter(record => record.status === 'retired')
      .map(record => path.posix.relative('content/zh-CN/reference', record.targetPath))
      .sort();
    const reference = docsPlugins(createDocusaurusConfig(chinese))
      .find(([, options]) => options.id === 'reference');

    expect(reference?.[1].exclude).toEqual(expected);
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
      /^NODE_OPTIONS=--max-old-space-size=8192 node \.\.\/\.\.\/scripts\/build\/run-with-publication-read-fence\.mjs --site en -- docusaurus build /,
    );
    expect(packageJson.scripts['build:zh-CN']).toMatch(
      /^pnpm --dir \.\.\/\.\. docs-tooling validate-reference --site zh-CN && NODE_OPTIONS=--max-old-space-size=4096 node \.\.\/\.\.\/scripts\/build\/run-with-publication-read-fence\.mjs --site zh-CN -- docusaurus build /,
    );
    expect(packageJson.scripts['build:zh-CN']).not.toContain('DOCUSAURUS_SSG_WORKER_THREAD_COUNT');
    expect(packageJson.scripts['build:en']).not.toContain('--experimental-strip-types');
    expect(packageJson.scripts['build:zh-CN']).not.toContain('--experimental-strip-types');
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
