import fs from 'node:fs';
import path from 'node:path';
import type {Config, PluginConfig} from '@docusaurus/types';
import type {ContentPluginProfile, DeepReadonly, SiteProfile} from '@zilliz/site-config';

function findRepositoryRoot(startDirectory: string): string {
  let current = path.resolve(startDirectory);
  while (true) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`Unable to locate pnpm-workspace.yaml from ${startDirectory}`);
    current = parent;
  }
}

const repositoryRoot = findRepositoryRoot(process.cwd());

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

  return {
    title: profile.title,
    tagline: profile.tagline,
    url: profile.url,
    baseUrl: profile.baseUrl,
    trailingSlash: false,
    onBrokenLinks: 'warn',
    staticDirectories: profile.staticRoots.map(repositoryPath),
    i18n: {
      defaultLocale: locale,
      locales: [locale],
      ...(profile.id === 'zh-CN'
        ? {localeConfigs: {'zh-CN': {htmlLang: profile.language}}}
        : {}),
    },
    plugins: [
      ...profile.content.map(content => contentPlugin(content, profile)),
      ...redirectPlugin(profile),
    ],
    themeConfig: {
      navbar: {items: profile.navigation.items.map(item => ({...item}))},
    },
    customFields: {
      site: profile.id,
      language: profile.language,
      outputDir: profile.outputDir,
      manuals: [...profile.manuals],
      navigation: {items: profile.navigation.items.map(item => ({...item}))},
      integrations: {...profile.integrations},
      features: {...profile.features, referenceKinds: [...profile.features.referenceKinds]},
      redirects: {rules: profile.redirects.rules.map(rule => ({...rule}))},
      robots: {...profile.robots},
    },
  };
}
