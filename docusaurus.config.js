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
  url: 'https://docs.zilliz.com.cn',
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
          sidebarPath: require.resolve('./sidebarsTutorial.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
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
      }
    ],
    [
      'docusaurus-gtm-plugin',
      {
        id: 'GTM-MBBF2KR',
      }
    ],
    'docusaurus-plugin-hotjar',
    './plugins/lark-docs',
    './plugins/apifox-docs',
    './plugins/landing-page',
    './plugins/github-code'
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
        },
        items: [
          {
            type: "search",
            position: "right",
          },
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'tutorialSidebar',
          //   position: 'left',
          //   label: '文档',
          // },
          // {to: '/api', label: 'API 参考', position: 'left'},
          {
            href: 'https://zilliz.com',
            label: "Product",
            position: 'left',
            className: 'header-link',
          },
          {
            href: 'https://zilliz.com/pricing',
            label: 'Pricing',
            position: 'left',
            className: 'header-link',
          },
          {
            type: "dropdown",
            label: "Resources",
            position: "left",
            items: [
              {
                label: "Developers",
                to: "/docs/quick-start-1",
              },
              {
                label: "Blogs",
                href: "https://zilliz.com/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/zilliztech/",
              },
              {
                label: "Resources",
                href: "https://zilliz.com/resources",
              },              
            ]
          },
          {
            href: 'https://zilliz.com/use-cases',
            label: 'Solutions',
            position: 'left',
            className: 'header-link',
          }
        ],
      },
      footer: {
        style: 'light',
        logo: {
          alt: "Zilliz",
          src: "/img/logo.svg",
          href: "https://zilliz.com.cn",
          width: 160,
          height: 51,
        },
        links: [
          {
            title: 'Documents',
            items: [
              {
                label: 'Developer Guides',
                to: '/docs/quick-start-1',
              },
              {
                label: 'API Reference',
                to: '/reference',
              },
            ],
          },
          {
            title: 'Product',
            items: [
              {
                label: "Zilliz Cloud",
                href: "https://zilliz.com/cloud"
              }
            ]
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
        copyright: `LF AI, LF AI & data, Milvus, and associated open-source project names are trademarks of the the Linux Foundation. <br/>© Zilliz ${new Date().getFullYear()} All rights reserved.`,
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
        applicationId: 3711906
      }
    }),
  themes: [
      // ... Your other themes.
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        // language: ["en", "zh"],
        // ```
      }),
    ],
    'docusaurus-theme-frontmatter'
  ],
};

module.exports = config;
