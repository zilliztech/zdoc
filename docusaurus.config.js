require('dotenv/config');

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
    // ],
    // [
    //   'redocusaurus',
    //   {
    //     specs: [
    //       {
    //         spec: 'plugins/apifox-docs/meta/openapi.json',
    //         route: '/reference/restful'
    //       }
    //     ],
    //     theme: {
    //       primaryColor: '#0077cc',
    //     }
    //   }
    ]
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'reference',
        path: 'reference',
        breadcrumbs: false,
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
    ['./plugins/lark-docs', {
      guides: {
        root: 'OUWXw5c4gia34ZkQUcEcMFbWn6s',
        base: 'PnsobATKVayIDFs6hhQcChlGnje',
        sourceType: 'wiki',
        displayedSidebar: 'default',
        docSourceDir: './plugins/lark-docs/meta/sources/guides',
        targets: {
          milvus: {
            outputDir: 'milvus/guides/docs',
            imageDir: 'milvus/guides/images'
          },
          zilliz: {
            saas: {
              outputDir: 'docs/tutorials',
              imageDir: 'static/img',
            },
            paas: {
              outputDir: 'versioned_docs/version-byoc/tutorials',
              imageDir: 'static/byoc'
            } 
          }
        }
      },
      python: {
        root: 'PTJzfzI0ulKGjwdUsxQcFxfJn6b',
        base: 'D1VabelmAansLwsNTvLc2Wxxn1g',
        sourceType: 'drive',
        version: 'v2.3.x',
        displayedSidebar: 'pythonSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/python/v2.3.x',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/python/docs',
            imageDir: 'milvus/reference/python/images'
          },
          zilliz: {
            outputDir: 'reference/api/python/python',
            imageDir: 'static/img',
          }
        }
      },
      javaV1: {
        root: 'D0cfwvTqMiyhSrkCUv4c1a2Fnjd',
        base: 'A4ivb7y2XaIND9s93QZcvwykn0d',
        // root: 'wikcnu8oU4VVbRFKKLjDH5aCIIh',
        // base: 'XJ2RbEDgTakJ80sfUAPcLG4Tnug',
        sourceType: 'onePager',
        version: 'v2.3.x',
        displayedSidebar: 'javaSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/java/v2.3.x/v1',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/java/docs/v1',
            imageDir: 'milvus/reference/java/images'
          },
          zilliz: {
            outputDir: 'reference/api/java/java/v1',
            imageDir: 'static/img',
          }
        }
      },
      javaV2: {
        root: 'GYfPfBbdglDhh5dzLH3cYaV1nDf',
        base: 'Bp72bJ9wEazV1SsA30lcsuJgnfe',
        sourceType: 'drive',
        version: 'v2.3.x',
        displayedSidebar: 'javaSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/java/v2.3.x/v2',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/java/docs/v2',
            imageDir: 'milvus/reference/java/images'
          },
          zilliz: {
            outputDir: 'reference/api/java/java/v2',
            imageDir: 'static/img',
          }
        }
      },
      node: {
        root: 'Vg1kfluyll0h7MdlUMaciXfEnZd',
        base: 'DVVobtXQMamuLqsQij5c29nVn3c',
        sourceType: 'drive',
        version: 'v2.3.x',
        displayedSidebar: 'nodeSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/node/v2.3.x',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/node/docs',
            imageDir: 'milvus/reference/node/images'
          },
          zilliz: {
            outputDir: 'reference/api/nodejs/nodejs',
            imageDir: 'static/img',
          }
        }
      }
    }],
    './plugins/apifox-docs',
    './plugins/link-checks',
    './plugins/nb-to-mdx',
    ['./plugins/report-to-lark',{
        receiveId: 'oc_0e36909edb9247c7b6ecb437e99f1d68'
      }
    ]
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
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
            type: 'dropdown',
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
        additionalLanguages: ['java', 'go', 'bash', 'json'],
      },
      colorMode: {
        disableSwitch: true,
      },
      hotjar: {
        applicationId: 3711906,
      },
      inkeepConfig: {
        baseSettings: {
          apiKey: process.env.INKEEP_API_KEY,
          integrationId: process.env.INKEEP_INTEGRATION_ID,
          organizationId: process.env.INKEEP_ORGANIZATION_ID,
          primaryBrandColor: null
        },
        aiChatSettings: {
            chatSubjectName: "Zilliz Cloud",
            botAvatarSrcUrl: null,
            getHelpCallToActions: [],
            quickQuestions: []
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
    'docusaurus-theme-frontmatter',
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
