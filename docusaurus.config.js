import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
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
          sidebarItemsGenerator: async function ({
            defaultSidebarItemsGenerator, ...args
          }) {
            var sidebarItems = defaultSidebarItemsGenerator(args)
            sidebarItems = sidebarItems.map(item => {
              if (item.type === 'category') {
                item.collapsible = false;
                item.collapsed = false;
              }

              if (item.label === 'Get Started') {
                item.items = item.items.map(subItem => {
                  if (subItem.label === 'API & SDKs') {
                    subItem.items.push(...[
                      {
                        type: 'link',
                        label: 'Python SDK',
                        href: '/reference/python'
                      },
                      {
                        type: 'link',
                        label: 'Java SDK',
                        href: '/reference/java'
                      },
                      {
                        type: 'link',
                        label: 'Go SDK',
                        href: '/reference/go'
                      },
                      {
                        type: 'link',
                        label: 'Node.js SDK',
                        href: '/reference/nodejs'
                      },
                      {
                        type: 'link',
                        label: 'RESTful API',
                        href: '/reference/restful'
                      }
                    ])
                  }

                  return subItem;
                })
              }

              if (item.label === '始める') {
                item.items = item.items.map(subItem => {
                  if (subItem.label === 'APIとSDK') {
                    subItem.items.push(...[
                      {
                        type: 'link',
                        label: 'Python SDK',
                        href: '/ja-JP/reference/python'
                      },
                      {
                        type: 'link',
                        label: 'Java SDK',
                        href: '/ja-JP/reference/java'
                      },
                      {
                        type: 'link',
                        label: 'Go SDK',
                        href: '/ja-JP/reference/go'
                      },
                      {
                        type: 'link',
                        label: 'Node.js SDK',
                        href: '/ja-JP/reference/nodejs'
                      },
                      {
                        type: 'link',
                        label: 'RESTful API',
                        href: '/ja-JP/reference/restful'
                      }
                    ])
                  }

                  return subItem;
                })
              }

              if (item.label === 'Security') {
                item.items = item.items.map(subItem => {
                  if (subItem.label === 'Access Control') {
                    subItem.items.splice(1, 0, ...[
                      {
                        type: 'link',
                        label: 'Manage Organization Roles',
                        href: '/docs/organization-users#organization-roles'
                      },
                      {
                        type: 'link',
                        label: 'Manage Project Roles',
                        href: '/docs/project-users#project-roles'
                      },
                    ])

                  }

                  return subItem;
                })
              }

              if (item.label === 'セキュリティ') {
                item.items = item.items.map(subItem => {
                  if (subItem.label === 'アクセス制御') {
                    subItem.items.splice(1, 0, ...[
                      {
                        type: 'link',
                        label: '組織の役割',
                        href: '/ja-JP/docs/organization-users#organization-roles'
                      },
                      {
                        type: 'link',
                        label: 'プロジェクトの役割',
                        href: '/ja-JP/docs/project-users#project-roles'
                      },
                    ])

                  }

                  return subItem;
                })
              }

              return item;
            })

            return sidebarItems;
          }
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
        sidebarItemsGenerator: async function ({
          defaultSidebarItemsGenerator, ...args
        }) {
          var sidebarItems = defaultSidebarItemsGenerator(args)
          var iterate = (items) => {
            return items.map(item => {
              if (item.type === 'category') {
                item.collapsed = false;
                item.items = iterate(item.items)
              }

              return item
            })
          }
          sidebarItems = sidebarItems.map(item => {
            // restful
            if (item.label === 'RESTful API Reference') {
              item.collapsed = false;

              item.items = item.items.map(subItem => {
                if (subItem.label === 'V2') {
                  subItem.collapsed = false;

                  subItem.items = iterate(subItem.items)
                }

                return subItem
              })
            }

            // python
            if (item.label === 'Python SDK Reference') {
              item.collapsed = false;

              item.items = item.items.map(subItem => {
                if (subItem.label === 'MilvusClient') {
                  subItem.collapsed = false;

                  subItem.items = iterate(subItem.items)
                }

                if (subItem.label === 'ORM') {
                  subItem.className = 'to-be-deprecated'
                }

                return subItem;
              })
            }

            // java
            if (item.label === 'Java SDK Reference') {
              item.collapsed = false;

              item.items = item.items.map(subItem => {
                if (subItem.label === 'Java SDK Reference (v1)') {
                  subItem.label = 'V1';
                  subItem.className = 'to-be-deprecated';
                }

                if (subItem.label === 'Java SDK Reference (v2)') {
                  subItem.label = 'V2';
                  subItem.collapsed = false;

                  subItem.items = iterate(subItem.items)
                }

                return subItem;
              })
            }

            // go
            if (item.label === 'Go SDK Reference') {
              item.collapsed = false;

              item.items = item.items.map(subItem => {
                if (subItem.label === 'Go SDK Reference (v1)') {
                  subItem.label = 'V1';
                  subItem.className = 'to-be-deprecated';
                }

                if (subItem.label === 'Go SDK Reference (v2)') {
                  subItem.label = 'V2';
                  subItem.collapsed = false;

                  subItem.items = iterate(subItem.items)
                }

                return subItem;
              }) 
            }

            return item;
          })

          return sidebarItems;
        }
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
              imageDir: 'static/img'
            } 
          }
        }
      },
      guidesJapanese: {
        root: 'KSvxw0h8LiXtIdkpAnCcrl7cnio',
        base: 'LkxfbrY6sa5jQ4sHquEcMqOsnCe',
        sourceType: 'wiki',
        displayedSidebar: 'default',
        docSourceDir: './plugins/lark-docs/meta/sources/guidesJapanese',
        targets: {
          milvus: {
            outputDir: 'milvus/guides/docs',
            imageDir: 'milvus/guides/images'
          },
          zilliz: {
            saas: {
              outputDir: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials',
              imageDir: 'static/img',
            },
            paas: {
              outputDir: 'i18n/ja-JP/docusaurus-plugin-content-docs/version-byoc/tutorials',
              imageDir: 'static/img'
            } 
          }
        }        
      },
      python: {
        root: 'PTJzfzI0ulKGjwdUsxQcFxfJn6b',
        base: 'D1VabelmAansLwsNTvLc2Wxxn1g',
        sourceType: 'drive',
        version: 'v2.4.x',
        displayedSidebar: 'pythonSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/python/v2.4.x',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/python/docs/v2.4.x',
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
        version: 'v2.4.x',
        displayedSidebar: 'javaSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/java/v2.4.x/v1',
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
        root: 'Sg3EfIgVtlTkeBdtguJchE9ynne',
        base: 'WqHJb3zimaxXjssk4Kic4GEDnte',
        // root: 'GYfPfBbdglDhh5dzLH3cYaV1nDf',
        // base: 'Bp72bJ9wEazV1SsA30lcsuJgnfe',
        sourceType: 'drive',
        version: 'v2.4.x',
        displayedSidebar: 'javaSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/java/v2.4.x/v2',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/java/docs/v2/v2.4.x',
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
            outputDir: 'milvus/reference/node/docs/v2.4.x',
            imageDir: 'milvus/reference/node/images'
          },
          zilliz: {
            outputDir: 'reference/api/nodejs/nodejs',
            imageDir: 'static/img',
          }
        }
      },
      gov1: {
        root: 'V0SCw3U3siZBynkKhUCcRRAin69',
        base: 'WA8rbgtu8aq3wtsBm02cepOznPJ',
        sourceType: 'wiki',
        version: 'v2.4.x',
        displayedSidebar: 'goSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/go/v2.4.x',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/go/docs/v1',
            imageDir: 'milvus/reference/go/images'
          },
          zilliz: {
            outputDir: 'reference/api/go/go/v1',
            imageDir: 'static/img',
          }
        }
      },
      gov2: {
        root: 'LaQ1wPdnSiDXDLkMieEcrv95nRc',
        base: 'RWi9b79oeaDNkBsCkAGcoc90nif',
        sourceType: 'wiki',
        version: 'v2.5.x',
        displayedSidebar: 'goSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/go/v2.5.x',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/go/docs/v2',
            imageDir: 'milvus/reference/go/images'
          },
          zilliz: {
            outputDir: 'reference/api/go/go/v2',
            imageDir: 'static/img',
          }
        }
      },
      pymilvus25: {
        root: 'Z1SFf89zYlGHXvdo6dxcR6gXntc',
        base: 'B8X9bJjJta2q4NskclYcxT7lngG',
        sourceType: 'drive',
        displayedSidebar: 'pythonSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/python/v2.5.x',
        fallbackSourceDir: './plugins/lark-docs/meta/sources/python/v2.4.x',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/python/docs/v2.5.x',
            imageDir: 'milvus/reference/python/images'
          },
          zilliz: {
            outputDir: 'reference/api/python/python',
            imageDir: 'static/img',
          }
        }
      },
      javaV225: {
        root: 'LJ6MfN5wzlHjz8dB642cjUh8nqq',
        base: 'Hsq1bRcqraeQW0sGFJbcI3YIn3d',
        sourceType: 'drive',
        displayedSidebar: 'javaSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/java/v2.5.x',
        fallbackSourceDir: './plugins/lark-docs/meta/sources/java/v2.4.x/v2',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/java/docs/v2.5.x',
            imageDir: 'milvus/reference/java/images'
          },
          zilliz: {
            outputDir: 'reference/api/java/java/v2',
            imageDir: 'static/img',
          }
        }
      },
      nodejs25: {
        root: 'U9fWfMPdelsPMydYnolcr2aEnBf',
        base: 'JTBebezMDaV8ZhsHF5wc7lJSnuh',
        sourceType: 'drive',
        displayedSidebar: 'nodeSidebar',
        docSourceDir: './plugins/lark-docs/meta/sources/node/v2.5.x',
        fallbackSourceDir: './plugins/lark-docs/meta/sources/node/v2.3.x',
        targets: {
          milvus: {
            outputDir: 'milvus/reference/node/docs/v2.5.x',
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
    'docusaurus-plugin-image-zoom',
    [
      './plugins/report-to-lark',
      {
        receiveId: 'oc_0e36909edb9247c7b6ecb437e99f1d68'
      }
    ],
    [
      './plugins/i18n-check',
      {
        "zh-CN": {
          base: 'PnsobATKVayIDFs6hhQcChlGnje:tblZepmOM8LcM8BZ'
        },
        "ja-JP": {
          base: 'PnsobATKVayIDFs6hhQcChlGnje:tblb5k5XPRT7PEFY'
        }
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
            label: 'Resources',
            position: 'left',
            items: [
              {
                label: 'Developers',
                to: '/docs/quick-start',
              },
              {
                label: 'Notebooks',
                to: 'https://zilliz.com/learn/milvus-notebooks',
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
      },
      inkeepConfig: {
        baseSettings: {
          apiKey: process.env.INKEEP_API_KEY,
          integrationId: process.env.INKEEP_INTEGRATION_ID,
          organizationId: process.env.INKEEP_ORGANIZATION_ID,
          primaryBrandColor: "#175fff",
          organizationDisplayName: "Zilliz",
          theme: {
            stylesheetUrls: ["/css/inkeep-overrides.css"],
          },
          customCardSettings: [
            {
              filters: {
                UrlMatch: {
                  ruleType: 'PartialUrl',
                  partialUrl: 'docs.zilliz.com/docs/byoc',
                },
              },
              searchTabLabel: 'BYOC',
            },
            {
              filters: {
                UrlMatch: {
                  ruleType: 'PartialUrl',
                  partialUrl: 'docs.zilliz.com/docs',
                },
              },
              searchTabLabel: 'Guides',
            },
            {
              filters: {
                UrlMatch: {
                  ruleType: 'PartialUrl',
                  partialUrl: 'docs.zilliz.com/reference',
                },
              },
              searchTabLabel: 'Reference',
            },
            {
              filters: {
                UrlMatch: {
                  ruleType: 'PartialUrl',
                  partialUrl: 'support.zilliz.com/hc/en-us',
                },
              },
              searchTabLabel: 'Support',
            },
            {
              filters: {
                UrlMatch: {
                  ruleType: 'PartialUrl',
                  partialUrl: 'zilliz.com/learn',
                },
              },
              searchTabLabel: 'Learn',
            },
            {
              filters: {
                UrlMatch: {
                  ruleType: 'PartialUrl',
                  partialUrl: 'zilliz.com/customers',
                },
              },
              searchTabLabel: 'Customers',
            },
            {
              filters: {
                UrlMatch: {
                  ruleType: 'PartialUrl',
                  partialUrl: 'zilliz.com/event',
                },
              },
              searchTabLabel: 'Events',
            },
          ],
        },
        aiChatSettings: {
            chatSubjectName: "Zilliz Cloud",
            botAvatarSrcUrl: "/img/zilliz-star.svg",
            getHelpCallToActions: [
              {
                type: "OPEN_LINK",
                icon: { builtIn: "IoHelpBuoyOutline" },
                name: "Support Portal",
                url: "https://support.zilliz.com/hc/en-us/"
              },
              {
                type: "OPEN_LINK",
                icon: { builtIn: "IoChatbubblesOutline" },
                name: "Contact Sales",
                url: "https://zilliz.com/contact-sales"
              }
            ],
            quickQuestions: [
              "How do I create and connect to a cluster in Zilliz Cloud?",
              "How can I optimize vector search performance for large datasets?",
              "What are the differences between Serverless and Dedicated clusters?"
            ]
        },
        searchSettings: {
          tabSettings: {
            isAllTabEnabled: false,
            rootBreadcrumbsToUseAsTabs: ['Guides', 'BYOC', 'Reference', 'Support', 'Customers', 'Events'],
          }
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
  scripts: [],
  stylesheets: [],
};

module.exports = config;