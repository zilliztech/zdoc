import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import larkDocsConfig from './config/lark-docs.config';
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

// Rehype plugin: wrap every <table> in a horizontal-scroll container so wide
// tables scroll left/right instead of overflowing into the TOC. Works at the
// HAST level, so it catches BOTH markdown pipe tables and raw-HTML <table>
// elements (the latter bypass MDXComponents entirely).
function rehypeWrapTables() {
  // Markdown pipe tables become hast `element` nodes (tagName 'table'); raw-HTML
  // tables in MDX become `mdxJsxFlowElement` nodes (name 'table'). Wrap both.
  const isTable = (n: any) =>
    (n.type === 'element' && n.tagName === 'table') ||
    (n.type === 'mdxJsxFlowElement' && n.name === 'table');
  const wrap = (node: any) => {
    if (!node || !Array.isArray(node.children)) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (!child) continue;
      if (isTable(child)) {
        const parentClasses = ([] as any[]).concat(node.properties?.className || []);
        const alreadyWrapped =
          node.type === 'element' && node.tagName === 'div' && parentClasses.includes('zd-table-scroll');
        wrap(child); // descend first (handles any nested tables)
        if (!alreadyWrapped) {
          node.children[i] = {
            type: 'element',
            tagName: 'div',
            properties: {className: ['zd-table-scroll']},
            children: [child],
          };
        }
        continue;
      }
      wrap(child);
    }
  };
  return (tree: any) => wrap(tree);
}

// Rehype plugin: replace check/cross emoji (✅ ✔ ✓ ☑ / ❌ ✖ ✗ ✘) in text with
// clean inline SVG marks — green check / red cross — so doc tables read crisply
// instead of using OS-dependent emoji glyphs. Skips code/pre.
function rehypeEmojiMarks() {
  const isCheck = (c: string) => c === '✅' || c === '✔' || c === '✓' || c === '☑';
  const isCross = (c: string) => c === '❌' || c === '✖' || c === '✗' || c === '✘';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svgChildren = (kind: string): any[] =>
    kind === 'check'
      ? [{type: 'element', tagName: 'path', properties: {d: 'M20 6 9 17l-5-5'}, children: []}]
      : [
          {type: 'element', tagName: 'path', properties: {d: 'M18 6 6 18'}, children: []},
          {type: 'element', tagName: 'path', properties: {d: 'm6 6 12 12'}, children: []},
        ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mark = (kind: string): any => ({
    type: 'element',
    tagName: 'span',
    properties: {className: ['zd-mark', kind === 'check' ? 'zd-mark--check' : 'zd-mark--cross']},
    children: [
      {
        type: 'element',
        tagName: 'svg',
        properties: {
          viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
        },
        children: svgChildren(kind),
      },
    ],
  });
  const re = /[✅✔✓☑❌✖✗✘]/;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = (node: any) => {
    if (!node || !Array.isArray(node.children)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any[] = [];
    let changed = false;
    for (const child of node.children) {
      if (child && child.type === 'text' && re.test(child.value)) {
        changed = true;
        let buf = '';
        for (const ch of child.value as string) {
          if (isCheck(ch)) { if (buf) { out.push({type: 'text', value: buf}); buf = ''; } out.push(mark('check')); }
          else if (isCross(ch)) { if (buf) { out.push({type: 'text', value: buf}); buf = ''; } out.push(mark('cross')); }
          else if (ch === '️') { /* drop emoji variation selector */ }
          else buf += ch;
        }
        if (buf) out.push({type: 'text', value: buf});
      } else {
        if (!(child && child.type === 'element' && (child.tagName === 'code' || child.tagName === 'pre'))) {
          walk(child);
        }
        out.push(child);
      }
    }
    if (changed) node.children = out;
  };
  return (tree: any) => walk(tree);
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
    faster: {
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
    chatEndpoint: process.env.CHAT_ENDPOINT || '/api/chat/stream',
    chatDebug: process.env.CHAT_DEBUG === 'true',
    secondaryNavbar: [
      { label: 'Cloud Guides', href: '/docs/register-with-zilliz-cloud', prefix: '/docs',       icon: 'cloud'  },
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
      { label: 'Releases', href: '/docs/byoc/changelogs', prefix: '/docs/byoc/changelogs', icon: 'tag'      },
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
        rehypePlugins: [rehypeKatex, rehypeWrapTables, rehypeEmojiMarks],
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
        rehypePlugins: [rehypeKatex, rehypeWrapTables, rehypeEmojiMarks],
      },
    ],
    ['./plugins/lark-docs', larkDocsConfig],
    './plugins/apifox-docs',
    './plugins/link-checks',
    './plugins/mdx-parse',
    [
      '@inkeep/cxkit-docusaurus',
      {
        SearchBar: {
          baseSettings: {
            apiKey: process.env.INKEEP_API_KEY,
          },
        },
        ChatButton: {
          baseSettings: {
            apiKey: process.env.INKEEP_API_KEY,
          },
        },
      },
    ],
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
          rehypePlugins: [rehypeKatex, rehypeWrapTables, rehypeEmojiMarks],
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
      tagName: 'script',
      attributes: {src: '/env.js'},
    },
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
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap',
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
        src: '/img/logo.svg',
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
