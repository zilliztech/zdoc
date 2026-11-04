import fs from 'node:fs';
import path from 'node:path';
import type {Config, PluginConfig} from '@docusaurus/types';
import {canonicalRouteKey, type ContentPluginProfile, type DeepReadonly, type SiteProfile} from '@zilliz/site-config';
import {chineseUiModules, englishUiModules, sharedUiModules} from '@zilliz/docs-ui';
import {config as loadDotenv} from 'dotenv';
import {resolveMarkdownPolicy} from './markdownPolicy';
import {loadNginxRedirectRules, mergeRedirectRules} from './nginxRedirectRules';

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

// Load local .env (gitignored) so local `docusaurus start`/`build` can resolve
// Inkeep credentials the same way production resolves them at runtime via env.js.
loadDotenv({path: path.join(repositoryRoot, '.env'), override: false});

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
      beforeDefaultRemarkPlugins: [...markdownPolicy.beforeDefaultRemarkPlugins],
      remarkPlugins: [...markdownPolicy.remarkPlugins],
      rehypePlugins: [...markdownPolicy.rehypePlugins],
    },
  ];
}

function buildCapabilityPlugins(profile: DeepReadonly<SiteProfile>): PluginConfig[] {
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
    [repositoryPath('apps/docs/plugins/release-channel-routes'), {sources}],
  ];
}

// The hand-maintained nginx map lives under the site's deploy directory; the
// client-side SPA map derives from the same file so the two surfaces cannot
// drift apart (nginx 301s cover full page loads, the SPA map covers in-app
// clicks — but both must agree on where a retired path goes).
const SITE_NGINX_CONF: Record<string, string> = {
  en: 'deploy/en/nginx.conf',
  'zh-CN': 'deploy/zh-CN/nginx.conf',
};

// The redirect-target route snapshots (deploy/contracts) record which pages
// production actually serves. postBuild uses them to tell "this checkout's
// build inventory lags dev-owned generated content" (warn — nginx owns the
// full-page-load hop and production serves the page) apart from "the target
// is dead everywhere" (fail the build).
const SITE_REDIRECT_TARGET_ROUTES: Record<string, string> = {
  en: 'deploy/contracts/en-redirect-target-routes.json',
  'zh-CN': 'deploy/contracts/zh-CN-redirect-target-routes.json',
};

function loadProductionRedirectRoutes(siteId: string): string[] {
  const snapshotPath = repositoryPath(SITE_REDIRECT_TARGET_ROUTES[siteId]);
  let snapshot: {routes?: unknown};
  try {
    snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) as {routes?: unknown};
  } catch (error) {
    throw new Error(`Unable to read the redirect-target route snapshot at ${snapshotPath}: ${String(error)}`);
  }
  if (!Array.isArray(snapshot.routes) || snapshot.routes.some(route => typeof route !== 'string')) {
    throw new Error(`The redirect-target route snapshot at ${snapshotPath} must contain a string[] "routes"`);
  }
  return snapshot.routes as string[];
}

function redirectPlugin(profile: DeepReadonly<SiteProfile>): PluginConfig[] {
  const confRelativePath = SITE_NGINX_CONF[profile.id];
  if (confRelativePath === undefined) {
    throw new Error(`No nginx redirect map is configured for site "${profile.id}"`);
  }
  const derivedRules = loadNginxRedirectRules(repositoryPath(confRelativePath));
  const profileRules = profile.redirects.rules.map(rule => ({from: rule.from, to: rule.to}));
  const spaRules = mergeRedirectRules(derivedRules, profileRules);
  const productionRoutes = loadProductionRedirectRoutes(profile.id);
  return [
    ...(profileRules.length > 0
      ? [
          [
            '@docusaurus/plugin-client-redirects',
            {
              createRedirects(existingPath: string): string[] | undefined {
                const sources = profileRules
                  .filter(rule => rule.to === existingPath)
                  .map(rule => rule.from);
                return sources.length > 0 ? sources : undefined;
              },
            },
          ] as PluginConfig,
        ]
      : []),
    // The static redirect HTML above only covers full page loads; this plugin
    // hands the (nginx-derived ∪ profile) rules to the 404 page so in-app SPA
    // clicks redirect too.
    ...(spaRules.length > 0
      ? [[repositoryPath('apps/docs/plugins/spa-redirect-map'), {rules: spaRules, productionRoutes}] as PluginConfig]
      : []),
  ];
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

function gtmPlugin(profile: DeepReadonly<SiteProfile>): PluginConfig[] {
  const containerId = profile.integrations.gtmContainerId;
  if (!containerId) return [];
  return [['docusaurus-gtm-plugin', {id: containerId}]];
}

export function createDocusaurusConfig(
  profile: DeepReadonly<SiteProfile>,
  environment: BuildEnvironment = process.env,
): Config {
  const markdownPolicy = resolveMarkdownPolicy(profile.markdown, profile.id);
  const uiModules = profile.id === 'en'
    ? [...sharedUiModules, ...englishUiModules]
    : [...sharedUiModules, ...chineseUiModules];

  return {
    title: profile.title,
    tagline: profile.tagline,
    // Served from static/shared/icons/ and static/zh-CN/icons/. Without this
    // declaration Docusaurus emits no <link rel="icon"> at all, browsers fall
    // back to /favicon.ico, and nginx's inherited `return 204` tombstone leaves
    // them with a generic tab icon.
    favicon: 'icons/favicon.svg',
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
        rspackBundler: true,
        rspackPersistentCache: true,
        mdxCrossCompilerCache: true,
        ssgWorkerThreads: true,
        gitEagerVcs: true,
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
      ...gtmPlugin(profile),
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
    /* Post-mount DOM enhancements: FAQ accordions, grouped-table row headers,
       scrollable-table edges. The file survived the monorepo move but its
       registration did not, so every "## FAQ" section had silently gone back to
       rendering as plain paragraphs. */
    clientModules: [
      repositoryPath('apps/docs/src/clientModules/tableRowHeaders.js'),
      /* Heading anchor icons copy their own link and flash a check. */
      repositoryPath('apps/docs/src/clientModules/hashLinkCopy.js'),
    ],
    // /env.js is rewritten by the container entrypoint (deploy/runtime/40-zdoc-env.sh)
    // with runtime-only values. Both sites need it: it carries the deployment's
    // release channel in addition to the English site's Inkeep credentials.
    headTags: [{tagName: 'script', attributes: {src: '/env.js'}}],
    themeConfig: {
      navbar: {
        title: '',
        logo: {
          alt: profile.id === 'zh-CN' ? 'Zilliz 标志' : 'Zilliz Logo',
          src: '/img/logo.svg',
          href: profile.id === 'zh-CN' ? 'https://zilliz.com.cn' : 'https://zilliz.com',
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
            dataPlaneKeywords: Object.fromEntries(
              Object.entries(profile.integrations.restApi.planeConfig.dataPlaneKeywords ?? {})
                .map(([target, keywords]) => [target, [...keywords]]),
            ),
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
