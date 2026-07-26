import fs from 'node:fs';
import path from 'node:path';
import type {Config, PluginConfig} from '@docusaurus/types';
import type {ContentPluginProfile, DeepReadonly, SiteProfile} from '@zilliz/site-config';
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

function contentPlugin(
  content: DeepReadonly<ContentPluginProfile>,
  markdownPolicy: ReturnType<typeof resolveMarkdownPolicy>,
): PluginConfig {
  return [
    '@docusaurus/plugin-content-docs',
    {
      id: content.id,
      path: repositoryPath(content.sourcePath),
      routeBasePath: content.routeBasePath,
      sidebarPath: repositoryPath(content.sidebarPath),
      include: content.include ? [...content.include] : undefined,
      exclude: content.exclude ? [...content.exclude] : undefined,
      ...(content.currentVersionPath
        ? {lastVersion: 'current', versions: {current: {path: content.currentVersionPath}}}
        : {}),
      breadcrumbs: false,
      remarkPlugins: [...markdownPolicy.remarkPlugins],
      rehypePlugins: [...markdownPolicy.rehypePlugins],
    },
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
  const locale = profile.id;
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
        ssgWorkerThreads: profile.id === 'zh-CN',
      },
    },
    staticDirectories: profile.staticRoots.map(repositoryPath),
    i18n: {
      defaultLocale: locale,
      locales: [locale],
      ...(profile.id === 'zh-CN'
        ? {localeConfigs: {'zh-CN': {htmlLang: profile.language}}}
        : {}),
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
      ...profile.content.map(content => contentPlugin(content, markdownPolicy)),
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
      navbar: {items: profile.navigation.items.map(item => ({...item}))},
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
