import {resolveBootstrapSite} from '../packages/site-config/src/resolve';

interface TargetConfig {
    outputDir: string;
    contentRoot?: string;
    imageDir: string;
    sidebarPath?: string;
    overridePath?: string;
    preserveOutput?: boolean;
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

const site = resolveBootstrapSite(undefined);

// guides ========================

const guidesStage = `tmp/docs-tooling/${site}/guides`;
const guidesByocStage = `tmp/docs-tooling/${site}/guides-byoc`;

const guides: Manual = {
    root: site === 'zh-CN' ? 'XyeFwdx6kiK9A6kq3yIcLNdEnDd' : 'Tg6mwbRGDitPQ3kLUQzc44I7nth',
    base: site === 'zh-CN' ? 'I6YUb1M0JajHrqsJGcLcZNh7neP:*' : 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*',
    sourceType: 'wiki',
    displayedSidebar: 'default',
    docSourceDir: site === 'zh-CN' ? './packages/docs-tooling/src/lark/meta/sources/guides-zh-CN' : './packages/docs-tooling/src/lark/meta/sources/guides',
    sidebarPath: `./${guidesStage}/generated/${site}/sidebars/guides.sidebar.js`,
    overridePath: `./sidebar-overrides/${site}/guides.json`,
    contentRoot: `${guidesStage}/content/${site}/guides`,
    targets: {
        zilliz: {
            saas: {
                outputDir: `${guidesStage}/content/${site}/guides/tutorials`,
                contentRoot: `${guidesStage}/content/${site}/guides`,
                imageDir: 'static/img',
            },
            paas: {
                outputDir: `${guidesByocStage}/content/${site}/byoc/tutorials`,
                contentRoot: `${guidesByocStage}/content/${site}/byoc`,
                imageDir: 'static/img',
                sidebarPath: `./${guidesByocStage}/generated/${site}/sidebars/guides-byoc.sidebar.js`,
                overridePath: `./sidebar-overrides/${site}/guides-byoc.json`,
            },
        },
    },
}

// sdk: python =============================

const python: Manual = {
    root: 'PTJzfzI0ulKGjwdUsxQcFxfJn6b',
    base: 'D1VabelmAansLwsNTvLc2Wxxn1g',
    sourceType: 'drive',
    version: 'v2.4.x',
    displayedSidebar: 'pythonSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/python/v2.4.x',
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/python/python`,
            imageDir: 'static/img',
        },
    },
}

const pymilvus25: Manual = {
    root: 'Z1SFf89zYlGHXvdo6dxcR6gXntc',
    base: 'B8X9bJjJta2q4NskclYcxT7lngG',
    sourceType: 'drive',
    version: 'v2.5.x',
    displayedSidebar: 'pythonSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/python/v2.5.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/python/v2.4.x',
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/python/python`,
            imageDir: 'static/img',
        },
    },
}

const pymilvus26: Manual = {
    root: 'IaWgf4osAlpdwqdVIclct97wnCg',
    base: 'J3Qzbv7AWazzivsv7vqcqlGCnFc',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'pythonSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/python/v2.6.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/python/v2.5.x',
    sidebarPath: `generated/${site}/sidebars/python.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/python.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/python/python`,
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
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/python/v3.0.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/python/v2.6.x',
    sidebarPath: `generated/${site}/sidebars/python.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/python.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/python/python`,
            imageDir: 'static/img',
        },
    },
}

// sdk: java ===============================

const javaV2: Manual = {
    root: 'Sg3EfIgVtlTkeBdtguJchE9ynne',
    base: 'WqHJb3zimaxXjssk4Kic4GEDnte',
    sourceType: 'drive',
    version: 'v2.4.x',
    displayedSidebar: 'javaSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/java/v2.4.x/v2',
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/java/java/v2`,
            imageDir: 'static/img',
        },
    },
}

const javaV225: Manual = {
    root: 'LJ6MfN5wzlHjz8dB642cjUh8nqq',
    base: 'Hsq1bRcqraeQW0sGFJbcI3YIn3d',
    sourceType: 'drive',
    version: 'v2.5.x',
    displayedSidebar: 'javaSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/java/v2.5.x/v2',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/java/v2.4.x/v2',
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/java/java/v2`,
            imageDir: 'static/img',
        },
    },
}

const javaV226: Manual = {
    root: 'B1agfRbPglv4tpdTkjlcUMgVnRV',
    base: 'Sbtcbm660abngWsXryKct5nOn2e',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'javaSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/java/v2.6.x/v2',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/java/v2.5.x/v2',
    sidebarPath: `generated/${site}/sidebars/java.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/java.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/java/java/v2`,
            imageDir: 'static/img',
        },
    },
}

const javaV230: Manual = {
    root: 'C4Ckfsx5qlKHbnd5PVrcpxvTn2d',
    base: 'AOFDbSmwma9XrNsLa8KcQgt9ngc',
    sourceType: 'drive',
    version: 'v3.0.x',
    displayedSidebar: 'javaSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/java/v3.0.x/v2',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/java/v2.6.x/v2',
    sidebarPath: `generated/${site}/sidebars/java.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/java.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/java/java/v2`,
            imageDir: 'static/img',
        },
    },
}

// sdk: node ===============================

const node: Manual = {
    root: 'Vg1kfluyll0h7MdlUMaciXfEnZd',
    base: 'DVVobtXQMamuLqsQij5c29nVn3c',
    sourceType: 'drive',
    version: 'v2.4.x',
    displayedSidebar: 'nodeSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/node/v2.4.x',
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/nodejs/nodejs`,
            imageDir: 'static/img',
        },
    },
}

const nodejs25: Manual = {
    root: 'U9fWfMPdelsPMydYnolcr2aEnBf',
    base: 'JTBebezMDaV8ZhsHF5wc7lJSnuh',
    sourceType: 'drive',
    version: 'v2.5.x',
    displayedSidebar: 'nodeSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/node/v2.5.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/node/v2.4.x',
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/nodejs/nodejs`,
            imageDir: 'static/img',
        },
    },
}

const nodejs26: Manual = {
    root: 'NFmOfwILlln3JgdePZUclweZnIe',
    base: 'R9i8bww4faNsR6smwQwcAtHGnkb',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'nodeSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/node/v2.6.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/node/v2.5.x',
    sidebarPath: `generated/${site}/sidebars/node.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/node.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/nodejs/nodejs`,
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
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/node/v3.0.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/node/v2.6.x',
    sidebarPath: `generated/${site}/sidebars/node.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/node.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/nodejs/nodejs`,
            imageDir: 'static/img',
        },
    },
}

// sdk: go =================================

const gov226: Manual = {
    root: 'Pzejf3x4WlXq1HdtTndcfMjVnxh',
    base: 'Yc7gbtmgSal2ewsdqlhcLWVanbh',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'goSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/go/v2.6.x',
    sidebarPath: `generated/${site}/sidebars/go.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/go.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/go/go/v2`,
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
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/go/v3.0.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/go/v2.6.x',
    sidebarPath: `generated/${site}/sidebars/go.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/go.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/go/go/v2`,
            imageDir: 'static/img',
        },
    },
}

// sdk: cli ================================

const cliv13: Manual = {
    root: 'QBLKf6CCPloK0cddw6gcXUZqnob',
    base: 'Rr4lbWr8baQj5psICV9cEFa2nYe',
    sourceType: 'drive',
    version: 'v1.3.x',
    displayedSidebar: 'cliSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/cli/v1.3.x',
    sidebarPath: `generated/${site}/sidebars/cli.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/cli.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/cli/cli`,
            imageDir: 'static/img',
        },
    },
}

const cliv14: Manual = {
    root: 'LF1Kf54jFllUBydVk7hcha30nUh',
    base: 'Lx1bbCdpMaSmJXs8wz5cjsDengf',
    sourceType: 'drive',
    version: '1.4.x',
    displayedSidebar: 'cliSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/cli/v1.4.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/cli/v1.3.x',
    sidebarPath: `generated/${site}/sidebars/cli.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/cli.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/cli/cli`,
            imageDir: 'static/img',
        },
    },
}

// sdk: cpp ================================

const cppv26: Manual = {
    root: 'CSzVfDgfAlne87dDj3vcnR3nnsg',
    base: 'XmndbkxkQaigA8soRiCcTT41nMd',
    sourceType: 'drive',
    version: 'v2.6.x',
    displayedSidebar: 'cppSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/cpp/v2.6.x',
    sidebarPath: `generated/${site}/sidebars/cpp.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/cpp.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/cpp/cpp`,
            imageDir: 'static/img',
        },
    },
}

const cppv30: Manual = {
    root: 'NVjgfJr5aleBsedDoKCcDpnJn9b',
    base: 'QdLkbfmnFatl4TsThKDc5Dobn5g',
    sourceType: 'drive',
    version: 'v3.0.x',
    displayedSidebar: 'cppSidebar',
    docSourceDir: './packages/docs-tooling/src/lark/meta/sources/cpp/v3.0.x',
    fallbackSourceDir: './packages/docs-tooling/src/lark/meta/sources/cpp/v2.6.x',
    sidebarPath: `generated/${site}/sidebars/cpp.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/cpp.json`,
    contentRoot: `content/${site}/reference`,
    targets: {
        zilliz: {
            outputDir: `content/${site}/reference/api/cpp/cpp`,
            imageDir: 'static/img',
        },
    },
}

export default {
    guides,
    python,
    pymilvus25,
    pymilvus26,
    pymilvus30,
    javaV2,
    javaV225,
    javaV226,
    javaV230,
    node,
    nodejs25,
    nodejs26,
    nodejs30,
    gov226,
    gov230,
    cliv13,
    cliv14,
    cppv26,
    cppv30,
}
