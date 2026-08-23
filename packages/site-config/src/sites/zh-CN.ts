import {deepFreeze} from '../immutable.ts';
import {referenceKinds, referenceNavigation} from '../generated/referencePresentation.ts';
import {SiteProfileSchema} from '../schema.ts';

export const zhCNProfile = deepFreeze(SiteProfileSchema.parse({
  id: 'zh-CN',
  language: 'zh-Hans',
  title: 'Zilliz Cloud 开发指南',
  url: 'https://docs.zilliz.com.cn',
  baseUrl: '/',
  outputDir: 'build/zh-CN',
  localization: {
    defaultLocale: 'zh-CN',
    translationRoot: 'i18n',
    locales: [{id: 'zh-CN', htmlLang: 'zh-Hans', source: 'canonical'}],
  },
  content: [
    {id: 'default', sourcePath: 'content/zh-CN/guides', routeBasePath: 'docs', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/guides.ts', exclude: ['tutorials/get-started/release-notes/release-notes.md']},
    {id: 'byoc', sourcePath: 'content/zh-CN/byoc', routeBasePath: 'docs/byoc', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/byoc.ts'},
    {id: 'onpremise', sourcePath: 'content/zh-CN/onpremise', routeBasePath: 'on-premise', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/onpremise.ts', currentVersionPath: 'v2.4.11'},
    {id: 'reference', sourcePath: 'content/zh-CN/reference', routeBasePath: 'reference', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/reference.ts'},
  ],
  manuals: [],
  staticRoots: ['apps/docs/static/shared', 'apps/docs/static/zh-CN'],
  features: {
    chat: true,
    askAi: true,
    feedback: true,
    cloudSelector: false,
    byoc: true,
    onpremise: true,
    agents: false,
    referenceKinds: [...referenceKinds],
  },
  navigation: {
    items: [],
    secondaryItems: [
      {label: 'Cloud 开发指南', href: '/docs/quick-start', prefix: '/docs', icon: 'cloud'},
      {label: 'BYOC 开发指南', href: '/docs/byoc/quick-start', prefix: '/docs/byoc', icon: 'server'},
      {
        label: 'API 与 SDK',
        prefix: '/reference',
        icon: 'code',
        items: referenceNavigation['zh-CN'].dropdown,
      },
      referenceNavigation['zh-CN'].standalone,
      {
        label: '版本文档',
        prefix: '/docs/changelogs',
        icon: 'tag',
        items: [
          {label: '功能支持情况', href: '/docs/feature-availability', prefix: '/docs/feature-availability', icon: 'book'},
          {label: '版本说明书', href: '/docs/changelogs', prefix: '/docs/changelogs', icon: 'tag'},
        ],
      },
    ],
  },
  markdown: {remarkPlugins: ['math', 'math-brace-fix'], rehypePlugins: ['katex', 'wrap-tables', 'emoji-marks']},
  publicationAdapters: ['zh-CN.markdown-normalizer', 'zh-CN.rest-replacements', 'zh-CN.aliyun-oss'],
  integrations: {
    searchProvider: 'local',
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
