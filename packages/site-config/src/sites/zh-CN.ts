import {deepFreeze} from '../immutable.ts';
import {SiteProfileSchema} from '../schema.ts';

export const zhCNProfile = deepFreeze(SiteProfileSchema.parse({
  id: 'zh-CN',
  language: 'zh-Hans',
  title: 'Zilliz Cloud 开发指南',
  url: 'https://docs.zilliz.com.cn',
  baseUrl: '/',
  outputDir: 'build/zh-CN',
  content: [
    {id: 'default', sourcePath: 'content/zh-CN/guides', routeBasePath: 'docs', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/guides.ts', exclude: ['tutorials/get-started/release-notes/release-notes.md']},
    {id: 'byoc', sourcePath: 'content/zh-CN/byoc', routeBasePath: 'docs/byoc', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/byoc.ts'},
    {id: 'onpremise', sourcePath: 'content/zh-CN/onpremise', routeBasePath: 'on-premise', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/onpremise.ts', currentVersionPath: 'v2.4.11'},
    {id: 'agents', sourcePath: 'content/zh-CN/agents', routeBasePath: 'docs/agents', sidebarPath: 'packages/site-config/src/sidebars/zh-CN/agents.ts'},
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
    agents: true,
    referenceKinds: ['python', 'java', 'nodejs', 'go', 'restful', 'cli'],
  },
  navigation: {items: [{label: 'Cloud 开发指南', to: '/docs/quick-start'}, {label: 'BYOC 开发指南', to: '/docs/byoc/quick-start'}, {label: 'API & SDK', to: '/reference'}], secondaryItems: []},
  markdown: {remarkPlugins: ['math', 'math-brace-fix'], rehypePlugins: ['katex', 'wrap-tables', 'emoji-marks']},
  publicationAdapters: ['zh-CN.markdown-normalizer', 'zh-CN.rest-replacements', 'zh-CN.aliyun-oss'],
  integrations: {searchProvider: 'local', chatProvider: 'inkeep'},
  redirects: {rules: []},
  robots: {index: true},
}));
