// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

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
    locales: ['en'],
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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference',
        path: 'reference',
        routeBasePath: 'reference',
        sidebarPath: require.resolve('./sidebarsReference.js'),
      },
    ],
    [
      'docusaurus-gtm-plugin',
      {
        id: 'GTM-MBBF2KR',
      },
    ],
    ['./plugins/lark-docs',
    {
      root: 'OUWXw5c4gia34ZkQUcEcMFbWn6s',
      base: 'PnsobATKVayIDFs6hhQcChlGnje',
      docSourceDir: './plugins/lark-docs/meta/sources',
      targets: [
        ['zilliz.saas', {
          outputDir: 'docs/tutorials',
          imageDir: 'static/img',
        }],
        ['zilliz.paas', {
          outputDir: 'versioned_docs/version-byoc/tutorials',
          imageDir: 'static/byoc',
        }]
      ]
    }],
    './plugins/apifox-docs',
    './plugins/link-checks',
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: '',
        logo: {
          alt: 'Zilliz Logo',
          src: 'img/logo.svg',
          href: '/docs/quick-start'
        },
        items: [
          {
            type: 'search',
            position: 'right',
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
            href: '/reference',
            label: 'Reference',
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
            href: 'https://zilliz.com/pricing',
            label: 'Pricing',
            position: 'left',
            className: 'header-link',
          },
          {
            type: 'dropdown',
            label: 'Resources',
            position: 'left',
            items: [
              {
                label: 'Developers',
                to: '/docs/quick-start',
              },
              {
                label: 'Blogs',
                href: 'https://zilliz.com/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/zilliztech/',
              },
              {
                label: 'Resources',
                href: 'https://zilliz.com/resources',
              },
            ],
          },
          {
            href: 'https://zilliz.com/use-cases',
            label: 'Solutions',
            position: 'left',
            className: 'header-link',
          },
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
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java', 'go'],
      },
      colorMode: {
        disableSwitch: true,
      },
      hotjar: {
        applicationId: 3711906,
      },
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
    'docusaurus-theme-frontmatter',
  ],
  scripts: [
    {
      src: '/js/cookieconsent.js',
      async: true,
    },
    '/js/zilliz.js',
  ],
  stylesheets: ['/css/cookieconsent.css'],
};

module.exports = config;
