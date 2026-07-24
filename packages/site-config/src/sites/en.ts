import {deepFreeze} from '../immutable';
import {SiteProfileSchema} from '../schema';

export const enProfile = deepFreeze(SiteProfileSchema.parse({
  id: 'en',
  language: 'en',
  title: 'Zilliz Cloud Developer Hub',
  url: 'https://docs.zilliz.com',
  baseUrl: '/',
  outputDir: 'build/en',
  content: [
    {
      id: 'default',
      sourcePath: 'content/en/guides',
      routeBasePath: 'docs',
      sidebarPath: 'generated/en/sidebars/guides.sidebar.js',
    },
    {
      id: 'byoc',
      sourcePath: 'content/en/byoc',
      routeBasePath: 'docs/byoc',
      sidebarPath: 'generated/en/sidebars/guides-byoc.sidebar.js',
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
    referenceKinds: [],
  },
  navigation: {items: []},
  markdown: {remarkPlugins: [], rehypePlugins: []},
  integrations: {},
  redirects: {rules: []},
  robots: {index: true},
}));
