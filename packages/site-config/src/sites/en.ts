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
    remarkPlugins: ['math', 'math-brace-fix'],
    rehypePlugins: ['katex', 'wrap-tables', 'emoji-marks'],
  },
  publicationAdapters: [],
  integrations: {
    searchProvider: 'inkeep',
    chatProvider: 'inkeep',
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
  redirects: {rules: []},
  robots: {index: true},
}));
