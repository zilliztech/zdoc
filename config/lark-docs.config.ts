interface TargetConfig {
    outputDir: string;
    imageDir: string;
    sidebarPath?: string;
    overridePath?: string;
}

interface Targets { [key: string]: TargetConfig | { [key: string]: TargetConfig } }

interface Manual {
    root: string;
    base: string;
    sourceType: 'wiki' | 'drive' | 'onePager';
    version?: string;
    displayedSidebar: string;
    docSourceDir: string;
    fallbackSourceDir?: string;
    targets: Targets;
    sidebarPath?: string;
    overridePath?: string;
    contentRoot?: string;
}

// guides ========================

const guides: Manual = {
    root: 'Tg6mwbRGDitPQ3kLUQzc44I7nth',
    base: 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*',
    sourceType: 'wiki',
    displayedSidebar: 'default',
    docSourceDir: './plugins/lark-docs/meta/sources/guides',
    sidebarPath: './config/generated/guides.sidebar.js',
    overridePath: './config/sidebar-overrides/guides.json',
    contentRoot: 'docs',
    targets: {
        zilliz: {
            saas: {
                outputDir: 'docs/tutorials',
                imageDir: 'static/img',
            },
            paas: {
                outputDir: 'docs-byoc/tutorials',
                imageDir: 'static/img',
                sidebarPath: './config/generated/guides-byoc.sidebar.js',
                overridePath: './config/sidebar-overrides/guides-byoc.json',
            },
        },
    },
}

const agents: Manual = {
    root: 'R8ZwwvHrJivIAyk8JkQchM0Anng',
    base: 'YxSibAMZ4aDqhjs5Ru4clmrun4f',
    sourceType: 'wiki',
    displayedSidebar: 'agentsSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/agents-and-prompts',
    sidebarPath: './config/generated/agents.sidebar.js',
    contentRoot: 'docs',
    targets: {
        zilliz: {
            // Keep files in the Tools chapter, but keep master-compatible
            // /docs/agents/* routes via displayedSidebar slug prefixing.
            outputDir: 'docs/tutorials/tools',
            imageDir: 'static/img',
        },
    },
}

// sdk: python =============================

const python : Manual =  {
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
}

const pymilvus25 : Manual = {
    root: 'Z1SFf89zYlGHXvdo6dxcR6gXntc',
    base: 'B8X9bJjJta2q4NskclYcxT7lngG',
    sourceType: 'drive',
    version: 'v2.5.x',
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
}

const pymilvus26: Manual = {
    root: 'IaWgf4osAlpdwqdVIclct97wnCg',
    base: 'J3Qzbv7AWazzivsv7vqcqlGCnFc',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'pythonSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/python/v2.6.x',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/python/v2.5.x',
    sidebarPath: './config/generated/python.sidebar.js',
    overridePath: './config/sidebar-overrides/python.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/python/python',
            imageDir: 'static/img',
        },
    },
}

const pymilvus30: Manual = {
    root: 'UxyTfjS3wl0TF8dn9tZcRT39nUe',
    base: 'Hk05b5eI6aXXSSsd6j9cqwwMn5a',
    sourceType: 'drive',
    version: 'v3.0.x',
    displayedSidebar: 'pythonSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/python/v3.0.x',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/python/v2.6.x',
    sidebarPath: './config/generated/python.sidebar.js',
    overridePath: './config/sidebar-overrides/python.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/python/python',
            imageDir: 'static/img',
        },
    },
}

// sdk: java ================================

const javaV1 : Manual = {
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
}

const javaV2 : Manual = {
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
}

const javaV225 : Manual = {
    root: 'LJ6MfN5wzlHjz8dB642cjUh8nqq',
    base: 'Hsq1bRcqraeQW0sGFJbcI3YIn3d',
    sourceType: 'drive',
    displayedSidebar: 'javaSidebar',
    version: 'v2.5.x',
    docSourceDir: './plugins/lark-docs/meta/sources/java/v2.5.x/v2',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/java/v2.4.x/v2',
    targets: {
        milvus: {
            outputDir: 'milvus/reference/java/docs/v2/v2.5.x',
            imageDir: 'milvus/reference/java/images'
        },
        zilliz: {
            outputDir: 'reference/api/java/java/v2',
            imageDir: 'static/img',
        }
    }
}

const javaV226: Manual = {
    root: 'B1agfRbPglv4tpdTkjlcUMgVnRV',
    base: 'Sbtcbm660abngWsXryKct5nOn2e',
    sourceType: 'drive',
    displayedSidebar: 'javaSidebar',
    version: 'v2.6.x',
    docSourceDir: './plugins/lark-docs/meta/sources/java/v2.6.x/v2',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/java/v2.5.x/v2',
    sidebarPath: './config/generated/java.sidebar.js',
    overridePath: './config/sidebar-overrides/java.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/java/java/v2',
            imageDir: 'static/img',
        },
    },
}

const javaV230: Manual = {
    root: 'C4Ckfsx5qlKHbnd5PVrcpxvTn2d',
    base: 'AOFDbSmwma9XrNsLa8KcQgt9ngc',
    sourceType: 'drive',
    displayedSidebar: 'javaSidebar',
    version: 'v3.0.x',
    docSourceDir: './plugins/lark-docs/meta/sources/java/v3.0.x/v2',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/java/v2.6.x/v2',
    sidebarPath: './config/generated/java.sidebar.js',
    overridePath: './config/sidebar-overrides/java.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/java/java/v2',
            imageDir: 'static/img',
        },
    },
}

// sdk: node ===============================

const node : Manual = {
    root: 'Vg1kfluyll0h7MdlUMaciXfEnZd',
    base: 'DVVobtXQMamuLqsQij5c29nVn3c',
    sourceType: 'drive',
    version: 'v2.4.x',
    displayedSidebar: 'nodeSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/node/v2.4.x',
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
}

const nodejs25 : Manual = {
    root: 'U9fWfMPdelsPMydYnolcr2aEnBf',
    base: 'JTBebezMDaV8ZhsHF5wc7lJSnuh',
    sourceType: 'drive',
    version: 'v2.5.x',
    displayedSidebar: 'nodeSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/node/v2.5.x',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/node/v2.4.x',
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

const nodejs26: Manual = {
    root: 'NFmOfwILlln3JgdePZUclweZnIe',
    base: 'R9i8bww4faNsR6smwQwcAtHGnkb',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'nodeSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/node/v2.6.x',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/node/v2.5.x',
    sidebarPath: './config/generated/node.sidebar.js',
    overridePath: './config/sidebar-overrides/node.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/nodejs/nodejs',
            imageDir: 'static/img',
        },
    },
}

const nodejs30: Manual = {
    root: 'LW67fVlTvlNCZRdxOVYcQZyJnFQ',
    base: 'LlrPbysPZau2dGsSVuicHmvCn0e',
    sourceType: 'drive',
    version: 'v3.0.x',
    displayedSidebar: 'nodeSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/node/v3.0.x',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/node/v2.6.x',
    sidebarPath: './config/generated/node.sidebar.js',
    overridePath: './config/sidebar-overrides/node.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/nodejs/nodejs',
            imageDir: 'static/img',
        },
    },
}

// sdk: go =================================

const gov1 : Manual = {
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
}

const gov226: Manual = {
    root: 'Pzejf3x4WlXq1HdtTndcfMjVnxh',
    base: 'Yc7gbtmgSal2ewsdqlhcLWVanbh',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'goSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/go/v2.6.x',
    sidebarPath: './config/generated/go.sidebar.js',
    overridePath: './config/sidebar-overrides/go.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/go/go/v2',
            imageDir: 'static/img',
        },
    },
}

const gov230: Manual = {
    root: 'F9M3fK4Dbl69PPdSxTXcsIwgnDh',
    base: 'KQT5bV62QaioKisKZT0crwZDnke',
    sourceType: 'drive',
    version: 'v3.0.x',
    displayedSidebar: 'goSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/go/v3.0.x',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/go/v2.6.x',
    sidebarPath: './config/generated/go.sidebar.js',
    overridePath: './config/sidebar-overrides/go.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/go/go/v2',
            imageDir: 'static/img',
        },
    },
}

const cli01: Manual = {
    root: 'PPuBfnEIWltim9dw8hxcC3EDnwb',
    base: 'OAK4bJaNuac501sX6Y1cS3OGnzf',
    sourceType: 'drive',
    version: 'v0.1.x',
    displayedSidebar: 'cliSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/cli/v0.1.x',
    sidebarPath: './config/generated/cli.sidebar.js',
    overridePath: './config/sidebar-overrides/cli.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/cli/cli',
            imageDir: 'static/img',
        },
    },
}

const cliv01 = cli01

const cliv13: Manual = {
    root: 'QBLKf6CCPloK0cddw6gcXUZqnob',
    base: 'Rr4lbWr8baQj5psICV9cEFa2nYe',
    sourceType: 'drive',
    version: 'v1.3.x',
    displayedSidebar: 'cliSidebar',
    docSourceDir: './plugins/lark-docs/meta/sources/cli/v1.3.x',
    fallbackSourceDir: './plugins/lark-docs/meta/sources/cli/v0.1.x',
    sidebarPath: './config/generated/cli.sidebar.js',
    overridePath: './config/sidebar-overrides/cli.json',
    contentRoot: 'reference',
    targets: {
        zilliz: {
            outputDir: 'reference/api/cli/cli',
            imageDir: 'static/img',
        },
    },
}

export default {
    guides,
    agents,
    python,
    pymilvus25,
    pymilvus26,
    pymilvus30,
    javaV1,
    javaV2,
    javaV225,
    javaV226,
    javaV230,
    node,
    nodejs25,
    nodejs26,
    nodejs30,
    gov1,
    gov226,
    gov230,
    cli01,
    cliv01,
    cliv13
}
