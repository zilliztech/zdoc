import {SiteProfileSchema} from '../schema';

export const enProfile = SiteProfileSchema.parse({
  id: 'en',
  language: 'en',
  title: 'Zilliz Cloud Developer Hub',
  url: 'https://docs.zilliz.com',
  baseUrl: '/',
  outputDir: 'build/en',
  content: [],
  manuals: [],
  staticRoots: ['apps/docs/static/shared', 'apps/docs/static/en'],
  features: {
    chat: true,
    askAi: true,
    feedback: true,
    cloudSelector: true,
    byoc: true,
    onpremise: false,
    agents: false,
    referenceKinds: [],
  },
  navigation: {items: []},
  markdown: {remarkPlugins: [], rehypePlugins: []},
  integrations: {},
  redirects: {rules: []},
  robots: {index: true},
});
