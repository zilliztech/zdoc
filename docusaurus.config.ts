import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import larkDocsConfig from './config/lark-docs.config';
import i18nTranslatorConfig from './config/i18n-translator.config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {visit} from 'unist-util-visit';
const planeConfig = require('./plugins/apifox-docs/meta/plane-config.json');

// Remark plugin: fix escaped braces inside math nodes.
// Doc sources use \{ and \} (MDX escapes) inside $...$ blocks.
// remark-math captures raw text, so KaTeX receives \{ (literal brace char)
// instead of { (group delimiter). This replaces \{ → { and \} → } in math nodes.
function remarkMathFix() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if ((node.type === 'math' || node.type === 'inlineMath') && typeof node.value === 'string') {
        node.value = node.value.replace(/\\{/g, '{').replace(/\\}/g, '}');
      }
    });
  };
}
import 'dotenv/config';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Zilliz Cloud Developer Hub',
  tagline: 'Find what you need to work with Zilliz Cloud',
  favicon: 'icons/favicon.svg',
  trailingSlash: false,

  future: {
    v4: true,
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      mdxCrossCompilerCache: true,
    },
  },

  url: 'https://docs.zilliz.com',
  baseUrl: '/',

  onBrokenLinks: 'warn',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    }
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja-JP'],
  },

  customFields: {
    planeConfig,
    chatEndpoint: process.env.CHAT_ENDPOINT || '/api/chat',
    chatDebug: process.env.CHAT_DEBUG === 'true',
    secondaryNavbar: [
      { label: 'Cloud Guides', href: '/docs/home',            prefix: '/docs',       icon: 'cloud'  },
      { label: 'BYOC Guides',  href: '/docs/byoc/byoc-intro', prefix: '/docs/byoc',  icon: 'server' },
      {
        label: 'API & SDK',
        prefix: '/reference',
        icon: 'code',
        items: [
          { label: 'Python SDK',  href: '/reference/python',  prefix: '/reference/python',   icon: 'python'  },
          { label: 'Java SDK',    href: '/reference/java',    prefix: '/reference/java',     icon: 'java'    },
          { label: 'Node.js SDK', href: '/reference/nodejs',  prefix: '/reference/nodejs',   icon: 'nodejs'  },
          { label: 'Go SDK',      href: '/reference/go',      prefix: '/reference/go',       icon: 'go'      },
          { label: 'REST API',    href: '/reference/restful', prefix: '/reference/restful',  icon: 'rest'    },
        ],
      },
      { label: 'CLI',      href: '/reference/cli/cli/overview', prefix: '/reference/cli', icon: 'terminal' },
      { label: 'Releases', href: '/docs/changelogs', prefix: '/docs/changelogs', icon: 'tag'      },
    ],
  },

  plugins: [
    // Watch sidebar override files so `docusaurus start` rebuilds on changes
    () => ({ name: 'watch-sidebar-overrides', getPathsToWatch: () => ['config/sidebar-overrides'] }),
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'byoc',
        path: 'docs-byoc',
        routeBasePath: 'docs/byoc',
        sidebarPath: './sidebarsByoc.ts',
        breadcrumbs: false,
        remarkPlugins: [remarkMath, remarkMathFix],
        rehypePlugins: [rehypeKatex],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference',
        path: 'reference',
        routeBasePath: 'reference',
        sidebarPath: './sidebarsReference.ts',
        breadcrumbs: false,
        remarkPlugins: [remarkMath, remarkMathFix],
        rehypePlugins: [rehypeKatex],
      },
    ],
    ['./plugins/lark-docs', larkDocsConfig],
    ['./plugins/i18n-translator', i18nTranslatorConfig],
    './plugins/apifox-docs',
    './plugins/link-checks',
    ['./plugins/embed-markdown', {
      sources: [
        { folder: 'docs',      route: '/docs'     },
        { folder: 'reference', route: '/reference' },
        { folder: 'docs-byoc', route: '/docs/byoc' },
      ],
    }],
    ['./plugins/llms-txt', {
      sources: [
        { folder: 'docs',      route: '/docs',      outputFile: 'cloud-guides', label: 'Cloud Guides' },
        { folder: 'docs-byoc', route: '/docs/byoc',  outputFile: 'byoc-guides',  label: 'BYOC Guides' },
        { folder: 'reference', route: '/reference',   outputFile: 'api-reference', label: 'API & SDK Reference' },
      ],
    }],
    ['./plugins/structured-data', {
      sources: [
        { folder: 'docs',      route: '/docs' },
        { folder: 'docs-byoc', route: '/docs/byoc' },
        { folder: 'reference', route: '/reference' },
      ],
    }],
    [
      './plugins/report-to-lark',
      {
        receiveId: 'oc_0e36909edb9247c7b6ecb437e99f1d68',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebarsTutorial.ts',
          breadcrumbs: false,
          remarkPlugins: [remarkMath, remarkMathFix],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ],

  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'true'},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap',
      },
    },
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      disableSwitch: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Zilliz Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://support.zilliz.com/hc/en-us',
          label: 'Support',
          position: 'right',
          className: 'navbar-support-link',
        },
        {
          href: 'https://cloud.zilliz.com/login',
          label: 'Log In',
          position: 'right',
          className: 'navbar-login-link',
        },
        {
          href: 'https://cloud.zilliz.com/signup',
          label: 'Sign Up Free',
          position: 'right',
          className: 'navbar-signup-btn',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `© Zilliz ${new Date().getFullYear()} All rights reserved.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: ['java', 'go', 'bash', 'json'],
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
