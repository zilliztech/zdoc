import fs from 'node:fs';
import path from 'node:path';
import type {Config, PluginConfig} from '@docusaurus/types';
import type {ContentPluginProfile, DeepReadonly, SiteProfile} from '@zilliz/site-config';
import {englishUiModules, sharedUiModules} from '@zilliz/docs-ui';

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
  profile: DeepReadonly<SiteProfile>,
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
      breadcrumbs: false,
      remarkPlugins: [...profile.markdown.remarkPlugins],
      rehypePlugins: [...profile.markdown.rehypePlugins],
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

export function createDocusaurusConfig(profile: DeepReadonly<SiteProfile>): Config {
  const locale = profile.id;
  const uiModules = profile.id === 'en'
    ? [...sharedUiModules, ...englishUiModules]
    : [...sharedUiModules];

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
        mdxCrossCompilerCache: true,
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
        : []),
      ...profile.content.map(content => contentPlugin(content, profile)),
      ...redirectPlugin(profile),
    ],
    presets: [[
      '@docusaurus/preset-classic',
      {
        docs: false,
        blog: false,
        pages: false,
        theme: {customCss: repositoryPath('apps/docs/src/css/custom.css')},
      },
    ]],
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
      features: {...profile.features, referenceKinds: [...profile.features.referenceKinds]},
      redirects: {rules: profile.redirects.rules.map(rule => ({...rule}))},
      robots: {...profile.robots},
    },
  };
}
