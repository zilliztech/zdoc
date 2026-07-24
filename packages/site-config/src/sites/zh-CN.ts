import {SiteProfileSchema} from '../schema';

export const zhCNProfile = SiteProfileSchema.parse({
  id: 'zh-CN',
  language: 'zh-Hans',
  title: 'Zilliz Cloud 开发指南',
  url: 'https://docs.zilliz.com.cn',
  baseUrl: '/',
  outputDir: 'build/zh-CN',
  content: [],
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
  navigation: {items: []},
  markdown: {remarkPlugins: [], rehypePlugins: []},
  integrations: {},
  redirects: {rules: []},
  robots: {index: true},
});
