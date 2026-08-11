import fs from 'node:fs';
import path from 'node:path';
import type {Config, PluginConfig} from '@docusaurus/types';
import {canonicalRouteKey, type ContentPluginProfile, type DeepReadonly, type SiteProfile} from '@zilliz/site-config';
import {chineseUiModules, englishUiModules, sharedUiModules} from '@zilliz/docs-ui';
import {resolveMarkdownPolicy} from './markdownPolicy';

function findRepositoryRoot(startDirectory: string): string {
  let current = path.resolve(startDirectory);
  while (true) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`Unable to locate pnpm-workspace.yaml from ${startDirectory}`);
    current = parent;
  }
}

// Docusaurus loads TypeScript config through jiti's CommonJS transform, where
// __dirname is the module-location equivalent of dirname(import.meta.url).
const repositoryRoot = findRepositoryRoot(__dirname);

function repositoryPath(relativePath: string): string {
  return path.resolve(repositoryRoot, relativePath);
}

function retiredReferenceExcludes(
  profile: DeepReadonly<SiteProfile>,
  content: DeepReadonly<ContentPluginProfile>,
): string[] {
  if (
    profile.id !== 'zh-CN' ||
    content.id !== 'reference' ||
    content.sourcePath !== 'content/zh-CN/reference'
  ) return [];
  const manifestPath = repositoryPath('generated/zh-CN/manifests/reference-translations.json');
  if (!fs.existsSync(manifestPath)) return [];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    records?: Array<{status?: unknown; targetPath?: unknown}>;
  };
  if (!Array.isArray(manifest.records)) {
    throw new Error('Chinese Reference translation manifest must contain records');
  }
  return [...new Set(manifest.records.flatMap(record => {
    if (record.status !== 'retired' || typeof record.targetPath !== 'string') return [];
    const relativePath = path.posix.relative(content.sourcePath, record.targetPath);
    if (!relativePath || relativePath === '..' || relativePath.startsWith('../')) {
      throw new Error(`Retired Chinese Reference target must stay within ${content.sourcePath}: ${record.targetPath}`);
    }
    return [relativePath];
  }))].sort();
}

function contentPlugin(
  profile: DeepReadonly<SiteProfile>,
  content: DeepReadonly<ContentPluginProfile>,
  markdownPolicy: ReturnType<typeof resolveMarkdownPolicy>,
): PluginConfig {
  const excludes = [...(content.exclude ?? []), ...retiredReferenceExcludes(profile, content)];
  return [
    '@docusaurus/plugin-content-docs',
    {
      id: content.id,
      path: repositoryPath(content.sourcePath),
      routeBasePath: content.routeBasePath,
      sidebarPath: repositoryPath(content.sidebarPath),
      include: content.include ? [...content.include] : undefined,
      exclude: excludes.length > 0 ? excludes : undefined,
      ...(content.currentVersionPath
        ? {lastVersion: 'current', versions: {current: {path: content.currentVersionPath}}}
        : {}),
      breadcrumbs: false,
      remarkPlugins: [...markdownPolicy.remarkPlugins],
      rehypePlugins: [...markdownPolicy.rehypePlugins],
    },
  ];
}

function buildCapabilityPlugins(profile: DeepReadonly<SiteProfile>): PluginConfig[] {
  if (profile.id !== 'en') return [];

  const sources = profile.content.map(content => ({
    id: content.id,
    folder: repositoryPath(content.sourcePath),
    route: `/${canonicalRouteKey(content.routeBasePath)}`,
    outputFile: content.id === 'default' ? 'cloud-guides' : content.id,
    label: content.id === 'default' ? 'Cloud Guides' : content.id,
  }));

  return [
    [repositoryPath('apps/docs/plugins/embed-markdown'), {sources}],
    [repositoryPath('apps/docs/plugins/llms-txt'), {sources}],
    [repositoryPath('apps/docs/plugins/structured-data'), {sources}],
  ];
}

function redirectPlugin(profile: DeepReadonly<SiteProfile>): PluginConfig[] {
  if (profile.redirects.rules.length === 0) {
    return [];
  }
  return [[
    '@docusaurus/plugin-client-redirects',
    {
      createRedirects(existingPath: string): string[] | undefined {
        const sources = profile.redirects.rules
          .filter(rule => rule.to === existingPath)
          .map(rule => rule.from);
        return sources.length > 0 ? sources : undefined;
      },
    },
  ]];
}

type BuildEnvironment = Record<string, string | undefined>;

function inkeepPlugin(
  profile: DeepReadonly<SiteProfile>,
  environment: BuildEnvironment,
): PluginConfig[] {
  if (
    profile.id !== 'en' ||
    profile.integrations.searchProvider !== 'inkeep' ||
    profile.integrations.chatProvider !== 'inkeep'
  ) {
    return [];
  }
  const baseSettings = {
    apiKey: environment.INKEEP_API_KEY,
    integrationId: environment.INKEEP_INTEGRATION_ID,
    organizationId: environment.INKEEP_ORGANIZATION_ID,
  };
  return [[
    '@inkeep/cxkit-docusaurus',
    {
      SearchBar: {baseSettings: {...baseSettings}},
      ChatButton: {baseSettings: {...baseSettings}},
    },
  ]];
}

function localSearchTheme(profile: DeepReadonly<SiteProfile>): PluginConfig[] {
  if (profile.integrations.searchProvider !== 'local') return [];
  const searchable = profile.content.filter(content => content.id === 'default' || content.id === 'reference');
  return [[
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: true,
      indexBlog: false,
      language: ['en', 'zh'],
      docsDir: searchable.map(content => path.relative(
        repositoryPath('apps/docs'),
        repositoryPath(content.sourcePath),
      )),
      docsRouteBasePath: searchable.map(content => content.routeBasePath),
      highlightSearchTermsOnTargetPage: true,
    },
  ]];
}

export function createDocusaurusConfig(
  profile: DeepReadonly<SiteProfile>,
  environment: BuildEnvironment = process.env,
): Config {
  const markdownPolicy = resolveMarkdownPolicy(profile.markdown);
  const uiModules = profile.id === 'en'
    ? [...sharedUiModules, ...englishUiModules]
    : [...sharedUiModules, ...chineseUiModules];

  return {
    title: profile.title,
    tagline: profile.tagline,
    url: profile.url,
    baseUrl: profile.baseUrl,
    trailingSlash: false,
    onBrokenLinks: 'warn',
    future: {
      v4: true,
      faster: {
        swcJsLoader: true,
        swcJsMinimizer: true,
        swcHtmlMinimizer: true,
        lightningCssMinimizer: true,
        rspackBundler: false,
        rspackPersistentCache: false,
        mdxCrossCompilerCache: false,
        ssgWorkerThreads: false,
      },
    },
    staticDirectories: profile.staticRoots.map(repositoryPath),
    i18n: {
      defaultLocale: profile.localization.defaultLocale,
      path: repositoryPath(profile.localization.translationRoot),
      locales: profile.localization.locales.map(locale => locale.id),
      localeConfigs: Object.fromEntries(profile.localization.locales.map(locale => [
        locale.id,
        {htmlLang: locale.htmlLang},
      ])),
    },
    plugins: [
      ['@zilliz/docs-ui/docusaurus', {modules: uiModules}],
      ...(profile.id === 'en'
        ? [[
            '@docusaurus/plugin-content-pages',
            {path: repositoryPath('apps/docs/src/pages')},
          ] satisfies PluginConfig]
        : [[
            '@docusaurus/plugin-content-pages',
            {path: repositoryPath('packages/docs-ui/src/zh-CN/pages')},
          ] satisfies PluginConfig]),
      ...profile.content.map(content => contentPlugin(profile, content, markdownPolicy)),
      ...buildCapabilityPlugins(profile),
      ...redirectPlugin(profile),
      ...inkeepPlugin(profile, environment),
    ],
    themes: localSearchTheme(profile),
    presets: [[
      '@docusaurus/preset-classic',
      {
        docs: false,
        blog: false,
        pages: false,
        theme: {customCss: repositoryPath('apps/docs/src/css/custom.css')},
      },
    ]],
    stylesheets: [...markdownPolicy.stylesheets],
    headTags: profile.id === 'en' &&
      profile.integrations.searchProvider === 'inkeep' &&
      profile.integrations.chatProvider === 'inkeep'
      ? [{tagName: 'script', attributes: {src: '/env.js'}}]
      : [],
    themeConfig: {
      navbar: {
        title: '',
        logo: {
          alt: profile.id === 'zh-CN' ? 'Zilliz 标志' : 'Zilliz Logo',
          src: '/img/logo.svg',
          href: 'https://zilliz.com',
        },
        items: profile.navigation.items.map(item => ({...item})),
      },
    },
    customFields: {
      site: profile.id,
      language: profile.language,
      outputDir: profile.outputDir,
      manuals: [...profile.manuals],
      navigation: {items: profile.navigation.items.map(item => ({...item}))},
      secondaryNavbar: profile.navigation.secondaryItems.map(item => ({
        ...item,
        items: item.items?.map(child => ({...child})),
      })),
      integrations: {...profile.integrations},
      planeConfig: profile.integrations.restApi
        ? {
            controlPlaneKeywords: Object.fromEntries(
              Object.entries(profile.integrations.restApi.planeConfig.controlPlaneKeywords)
                .map(([target, keywords]) => [target, [...keywords]]),
            ),
          }
        : undefined,
      features: {...profile.features, referenceKinds: [...profile.features.referenceKinds]},
      redirects: {rules: profile.redirects.rules.map(rule => ({...rule}))},
      robots: {...profile.robots},
    },
  };
}
