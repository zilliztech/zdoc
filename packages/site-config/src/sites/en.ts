import {deepFreeze} from '../immutable.ts';
import {referenceKinds, referenceNavigation} from '../generated/referencePresentation.ts';
import {SiteProfileSchema} from '../schema.ts';

export const enProfile = deepFreeze(SiteProfileSchema.parse({
  id: 'en',
  language: 'en',
  title: 'Zilliz Cloud Developer Hub',
  url: 'https://docs.zilliz.com',
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
  ],
  manuals: [],
  staticRoots: ['apps/docs/static/shared'],
  features: {
    chat: true,
    askAi: true,
    feedback: true,
    cloudSelector: true,
    byoc: true,
    onpremise: false,
    agents: false,
    referenceKinds: [...referenceKinds],
  },
  navigation: {
    items: [],
    secondaryItems: [
      {label: 'Zilliz-Managed Cloud', href: '/docs/register-with-zilliz-cloud', prefix: '/docs', icon: 'cloud'},
      {label: 'Bring Your Own Cloud', href: '/docs/byoc/byoc-intro', prefix: '/docs/byoc', icon: 'server'},
      {
        label: 'API & SDK',
        prefix: '/reference',
        icon: 'code',
        items: referenceNavigation.en.dropdown,
      },
      referenceNavigation.en.standalone,
      {label: 'Releases', href: '/docs/changelogs', prefix: '/docs/changelogs', icon: 'tag'},
    ],
  },
  markdown: {
    remarkPlugins: ['math', 'math-brace-fix', 'doc-links'],
    rehypePlugins: ['katex', 'wrap-tables', 'emoji-marks'],
  },
  publicationAdapters: [],
  integrations: {
    searchProvider: 'inkeep',
    chatProvider: 'inkeep',
    cloudData: {cmsBaseUrl: 'https://cms.zilliz.cc'},
    // Legacy zdoc container (v3.0.0 docusaurus.config.js); the registration
    // was lost in the monorepo move, not the container itself.
    gtmContainerId: 'GTM-MBBF2KR',
    restApi: {
      planeConfig: {
        dataPlaneKeywords: {
          zilliz: [
            'cluster-role-operations-v2', 'cluster-user-operations-v2',
            '/v2/vectordb/roles', '/v2/vectordb/users',
          ],
          milvus: [],
        },
        controlPlaneKeywords: {
          zilliz: [
            'cloud', 'cluster', 'import', 'pipeline', 'backup', 'restore',
            'invoices', 'usage', 'metrics', 'extract', 'volume', 'project',
            'on-demand', 'region', 'migration', 'job', 'spark', 'alert',
            'etl', 'stage', 'storage-integration', 'storageIntegrations',
            '/v2/roles', '/v2/members', '/v2/groups', '/v2/api-keys',
          ],
          milvus: [],
        },
      },
    },
  },
  redirects: {rules: [
    // nginx 301s (deploy/en/nginx.conf) cover full page loads; these rules
    // also feed the client-side redirect map (apps/docs/plugins/spa-redirect-map)
    // that the 404 page consults, so in-app SPA clicks to retired paths
    // redirect too. A rule may only target a route the site serves.
    {from: '/docs/on-zilliz-cloud-console', to: '/docs/byoc/quick-start'},
    {from: '/docs/data-import', to: '/docs/data-import-zero-to-hero'},
    {from: '/docs/metrics-and-alerts', to: '/docs/metrics-alerts-reference'},
    {from: '/docs/setup-a-private-link', to: '/docs/setup-a-private-link-aws'},
    {from: '/ja-JP/docs/setup-a-private-link', to: '/ja-JP/docs/setup-a-private-link-aws'},
    {from: '/ja-JP/docs/metrics-and-alerts', to: '/ja-JP/docs/metrics-alerts-reference'},
  ]},
  robots: {index: true},
}));
