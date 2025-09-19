import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import larkDocsConfig from './config/lark-docs.config';
import { tutorialsItemsGenerator, ReferenceItemsGenerator } from './config/sidebar-generators';
import i18nTranslatorConfig from './config/i18n-translator.config';

import 'dotenv/config';

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zilliz Cloud Developer Hub',
  tagline: 'Find what you need to work with Zilliz Cloud',
  favicon: 'img/favicon.svg',
  trailingSlash: false,

  // Set the production url of your site here
  url: 'https://docs.zilliz.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'zilliztech', // Usually your GitHub org/user name.
  // projectName: 'zdoc_cn', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja-JP'],
  },

  // future settings
  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      mdxCrossCompilerCache: true,
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebarsTutorial.js'),
          routeBasePath: 'docs',
          lastVersion: 'current',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          versions: {
            current: {
              label: 'User Guides (Cloud)',
            },
            'byoc': {
              label: 'User Guides (BYOC)',
              path: 'byoc',
              banner: 'none'
            },
          },
          sidebarItemsGenerator: tutorialsItemsGenerator,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        }
      }),
    ]
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference',
        path: 'reference',
        breadcrumbs: true,
        routeBasePath: 'reference',
        sidebarPath: require.resolve('./sidebarsReference.js'),
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        sidebarItemsGenerator: ReferenceItemsGenerator,
      },
    ],
    [
      '@inkeep/cxkit-docusaurus', { 
        SearchBar: {
          baseSettings: {
            apiKey: process.env.INKEEP_API_KEY,
          },
        },
        ChatButton: {
          baseSettings: {
            apiKey: process.env.INKEEP_API_KEY,
          },
        }
      }
    ],
    [
      'docusaurus-gtm-plugin',
      {
        id: 'GTM-MBBF2KR',
      },
    ],
    ['./plugins/lark-docs', larkDocsConfig],
    './plugins/apifox-docs',
    './plugins/link-checks',
    './plugins/nb-to-mdx',
    'docusaurus-plugin-image-zoom',
    [
      './plugins/report-to-lark',
      {
        receiveId: 'oc_0e36909edb9247c7b6ecb437e99f1d68'
      }
    ],
    [
      './plugins/i18n-translator',
      i18nTranslatorConfig
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      docs: {
        sidebar: {
          autoCollapseCategories: false,
        },
      },
      navbar: {
        title: '',
        logo: {
          alt: 'Zilliz Logo',
          src: 'img/logo.svg',
          href: 'https://zilliz.com'
        },
        items: [
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            type: 'custom-searchbtn',
            position: 'right'
          },
          {
            href: 'https://support.zilliz.com/hc/en-us',
            icon: '/img/icons/support.svg',
            label: 'Support',
            position: 'right',
            className: 'header-link',
          },
          {
            href: 'https://cloud.zilliz.com/login',
            label: 'Log In',
            position: 'right',
            className: 'header-link',
          },
          {
            type: 'custom-signupbtn',
            position: 'right',
            href: 'https://cloud.zilliz.com/signup',
            label: 'Sign Up Free',
          },
          {
            href: '/docs/quick-start',
            label: 'Cloud Guides',
            position: 'left',
            className: 'header-link',
          },
          {
            href: '/docs/byoc/quick-start',
            label: 'BYOC Guides',
            position: 'left',
            className: 'header-link',
          },
          {
            type: 'dropdown',
            label: 'API & SDKs',
            position: 'left',
            items: [
              {
                label: 'RESTful API',
                to: '/reference/restful'
              },
              {
                label: 'Python SDK',
                to: '/reference/python'
              },
              {
                label: 'Java SDK',
                to: '/reference/java',
              },
              {
                label: 'Go SDK',
                to: '/reference/go'
              },
              {
                label: 'Node.js SDK',
                to: '/reference/nodejs'
              }
            ]
          },
          {
            type: 'dropdown',
            label: 'Releases',
            position: 'left',
            items: [
              {
                label: 'Feature Availability',
                to: '/docs/feature-availability',
              },
              {
                label: 'Release Notes',
                to: '/docs/release-notes',
              }
            ],
          },
          {
            href: 'https://zilliz.com/use-cases',
            label: 'Use Cases',
            position: 'left',
            className: 'header-link',
          },
          {
            href: 'https://zilliz.com/pricing',
            label: 'Pricing',
            position: 'left',
            className: 'header-link',
          }
        ],
      },
      footer: {
        style: 'light',
        logo: {
          alt: 'Zilliz',
          src: '/img/logo.svg',
          href: 'https://zilliz.com',
          width: 160,
          height: 51,
        },
        links: [
          {
            title: 'Documents',
            items: [
              {
                label: 'Developer Guides',
                to: '/docs/quick-start',
              },
              {
                label: 'RESTful API',
                to: '/reference/restful',
              },
              {
                label: 'Python SDK',
                to: '/reference/python',
              },
              {
                label: 'Java SDK',
                to: '/reference/java',
              },
              {
                label: 'Go SDK',
                to: '/reference/go',
              },
              {
                label: 'Node.js SDK',
                to: '/reference/nodejs',
              },
            ],
          },
          {
            title: 'Product',
            items: [
              {
                label: 'Zilliz Cloud',
                href: 'https://zilliz.com/cloud',
              },
            ],
          },
          {
            title: 'Media',
            items: [
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/c/MilvusVectorDatabase',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/zilliz',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/zilliz_universe',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/zilliztech',
              },
              {
                label: 'Discord',
                href: 'https://discord.com/invite/8uyFbECzPX'
              }
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Blogs',
                to: 'https://zilliz.com/blog',
              },
              {
                label: 'Whitepapers',
                href: 'https://zilliz.com/resources?tag=whitepapers',
              },
              {
                label: 'Webinars',
                href: 'https://zilliz.com/resources?tag=webinars',
              },
              {
                label: 'Trainings',
                href: 'https://zilliz.com/resources?tag=trainings',
              },
              {
                label: 'Events',
                href: 'https://zilliz.com/event',
              },
            ],
          },
        ],
        copyright: `LF AI, LF AI & data, Milvus, and associated open-source project names are trademarks of the the Linux Foundation. <br/>© Zilliz ${new Date().getFullYear()} All rights reserved. <a class="setting-cookie-btn" >Cookie Settings</a>`,
      },
      prism: {
        additionalLanguages: ['java', 'go', 'bash', 'json'],
        theme: prismThemes.github,
      },
      colorMode: {
        disableSwitch: true,
      },
      hotjar: {
        applicationId: 3711906,
      },
      zoom: {
        selector: '.markdown img',
        background: {
          light: 'rgb(255, 255, 255, 0.5)',
          dark: 'rgb(0, 0, 0, 0.5)',
        }
      }
    }),
  themes: [
    [ '@easyops-cn/docusaurus-search-local', {
      id: 'saas',
      hashed: true,
      indexBlog: false,
      language: ['en', 'zh'],
      docsDir: ['docs', 'reference'],
      docsRouteBasePath: 'docs',
      highlightSearchTermsOnTargetPage: true,
    }],
    
    '@inkeep/docusaurus/chatButton'
  ],
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'true',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel:'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap'
      }
    },
    {
      tagName: 'link',
      attributes: {
        rel:'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0'
      }
    }
  ],
  scripts: [],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
};

module.exports = config;