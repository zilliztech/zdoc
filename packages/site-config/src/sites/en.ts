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
    referenceKinds: ['python', 'java', 'nodejs', 'go', 'restful', 'cli'],
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
        items: [
          {label: 'Python SDK', href: '/reference/python', prefix: '/reference/python', icon: 'python'},
          {label: 'Java SDK', href: '/reference/java', prefix: '/reference/java', icon: 'java'},
          {label: 'Node.js SDK', href: '/reference/nodejs', prefix: '/reference/nodejs', icon: 'nodejs'},
          {label: 'Go SDK', href: '/reference/go', prefix: '/reference/go', icon: 'go'},
          {label: 'REST API', href: '/reference/restful', prefix: '/reference/restful', icon: 'rest'},
        ],
      },
      {label: 'CLI', href: '/reference/cli/cli/overview', prefix: '/reference/cli', icon: 'terminal'},
      {label: 'Releases', href: '/docs/changelogs', prefix: '/docs/changelogs', icon: 'tag'},
    ],
  },
  markdown: {remarkPlugins: [], rehypePlugins: []},
  integrations: {},
  redirects: {rules: []},
  robots: {index: true},
}));
