const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

async function testFeishuJsonFetchesAreThrottled() {
  const originalLoad = Module._load;
  let activeFetches = 0;
  let maxActiveFetches = 0;

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'node-fetch') {
      return async function mockedFetch() {
        activeFetches += 1;
        maxActiveFetches = Math.max(maxActiveFetches, activeFetches);

        await new Promise(resolve => setTimeout(resolve, 20));

        activeFetches -= 1;
        return {
          status: 200,
          headers: { get: () => null },
          text: async () => '{"code":0,"data":{}}',
        };
      };
    }

    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('./larkDocScraper')];
  const larkDocScraper = require('./larkDocScraper');
  Module._load = originalLoad;

  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');
  scraper.token = 'tenant-token';

  await Promise.all([
    scraper.__fetchFeishuJson('https://open.feishu.cn/a', {}, 'a'),
    scraper.__fetchFeishuJson('https://open.feishu.cn/b', {}, 'b'),
    scraper.__fetchFeishuJson('https://open.feishu.cn/c', {}, 'c'),
  ]);

  assert.equal(maxActiveFetches, 1);

  delete require.cache[require.resolve('./larkDocScraper')];
  delete require.cache[require.resolve('./feishuFetch')];
  delete require.cache[require.resolve('./larkTokenFetcher.js')];
}

async function testWikiRootFetchRetriesPrematureClose() {
  const originalLoad = Module._load;
  const originalRetryDelay = process.env.FEISHU_RETRY_DELAY_MS;
  process.env.FEISHU_RETRY_DELAY_MS = '1';

  let attempts = 0;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'node-fetch') {
      return async function mockedFetch() {
        attempts += 1;
        if (attempts === 1) {
          const err = new Error('Premature close');
          err.code = 'ERR_STREAM_PREMATURE_CLOSE';
          err.type = 'system';
          throw err;
        }

        return {
          status: 200,
          headers: { get: () => null },
          text: async () => JSON.stringify({
            code: 0,
            data: {
              node: {
                node_token: 'root-token',
                node_type: 'origin',
                obj_type: 'folder',
                title: 'Root',
                has_child: false,
              },
            },
          }),
        };
      };
    }

    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('./larkDocScraper')];
  delete require.cache[require.resolve('./feishuFetch')];
  const larkDocScraper = require('./larkDocScraper');
  const tokenFetcher = require('./larkTokenFetcher.js');
  Module._load = originalLoad;

  const originalFetchToken = tokenFetcher.prototype.fetchToken;
  const originalToken = tokenFetcher.prototype.token;
  tokenFetcher.prototype.fetchToken = async function fetchToken() {
    this.tenantAccessToken = 'tenant-token';
  };
  tokenFetcher.prototype.token = async () => 'tenant-token';

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-root-retry-'));
  try {
    const scraper = new larkDocScraper('root-token', '', 'wiki', tempDir);
    scraper.__slugify = async () => 'root';
    await scraper.fetch(false);

    assert.equal(attempts, 2);
    assert.equal(scraper.docs.node_token, 'root-token');
    assert.equal(fs.existsSync(path.join(tempDir, 'root-token.json')), true);
  } finally {
    tokenFetcher.prototype.fetchToken = originalFetchToken;
    tokenFetcher.prototype.token = originalToken;
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (originalRetryDelay === undefined) {
      delete process.env.FEISHU_RETRY_DELAY_MS;
    } else {
      process.env.FEISHU_RETRY_DELAY_MS = originalRetryDelay;
    }
    delete require.cache[require.resolve('./larkDocScraper')];
    delete require.cache[require.resolve('./feishuFetch')];
    delete require.cache[require.resolve('./larkTokenFetcher.js')];
  }
}

async function testSlugifyRejectsAmbiguousTitleFallback() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');

  scraper.slugs = {
    N44ndTSrgoEBx7xCID5cXRS7n1c: {
      slug: 'utility-create_user',
      title: 'create_user()',
    },
    BDupd28JqoNY9HxVOTfcv86enRe: {
      slug: 'Authentication-create_user',
      title: 'create_user()',
    },
  };

  await assert.rejects(
    () => scraper.__slugify('EglSdm1jkozDSlxq6SEc4CRonVe', 'create_user()'),
    /Ambiguous slug metadata/
  );
}

async function testSlugifyResolvesAmbiguousTitleWithParentContext() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');

  scraper.slugs = {
    WToudUwm4oVXeKxLg3jcj3IAnjh: {
      slug: 'ORM-CollectionSchema',
      title: 'CollectionSchema',
    },
    WVy8dc7Jaonoxqxk7Cvc72KSnvb: {
      slug: 'MilvusClient-CollectionSchema',
      title: 'CollectionSchema',
    },
  };

  assert.equal(
    await scraper.__slugify('CFK5fYjallg3eZdIWqfcdin8noc', 'CollectionSchema', 'MilvusClient'),
    'MilvusClient-CollectionSchema'
  );
}

async function testSlugifyResolvesAmbiguousTitleWithCompositeParentContext() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');

  scraper.slugs = {
    Bzb6dwkckop6XfxVm2lclXG2nJg: {
      slug: 'Collection-hybrid_search',
      title: 'hybrid_search()',
    },
    NEyWdddQ8oKCw4xQTFPcvDTLn3f: {
      slug: 'Vector-hybrid_search',
      title: 'hybrid_search()',
    },
  };

  assert.equal(
    await scraper.__slugify('QqOSdTDaLoOKGRxiKEtcuuiAnrf', 'hybrid_search()', 'MilvusClient-Vector'),
    'Vector-hybrid_search'
  );
}

async function testSlugifyResolvesAmbiguousTitleWithBitableParentMetadata() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');

  scraper.slugs = {
    TG3Rd9aM5offvFxKy2CcKXn9nWc: {
      slug: 'CollectionSchema-add_field',
      title: 'add_field()',
      parent_slug: 'ORM-CollectionSchema',
    },
    X1L2dAjDyo7yqOxqWELcBRBUndd: {
      slug: 'CollectionSchema-add_field_1',
      title: 'add_field()',
      parent_slug: 'MilvusClient-CollectionSchema',
    },
  };

  assert.equal(
    await scraper.__slugify('H9IFdpWWUouzXOxKlx9cImP8nnd', 'add_field()', 'MilvusClient-CollectionSchema'),
    'CollectionSchema-add_field_1'
  );
}

async function testSlugifyPrefersExactSlugForAmbiguousSectionTitle() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');

  scraper.slugs = {
    B2fdfjb1nl9Pjidkaa9cM6lAngd: {
      slug: 'MilvusClient',
      title: 'MilvusClient',
    },
    SojTdgw1joOuA8xMzb5cMUFYnce: {
      slug: 'Client-MilvusClient',
      title: 'MilvusClient',
    },
  };

  assert.equal(
    await scraper.__slugify('BBPZfcRbOlWEnjdbIJgc3wgynsg', 'MilvusClient'),
    'MilvusClient'
  );
}

async function testBaseCapturesRecordIdParentMetadata() {
  const larkDocScraper = require('./larkDocScraper');
  const tokenFetcher = require('./larkTokenFetcher.js');
  const scraper = new larkDocScraper('', 'base-token', 'wiki', '/tmp');
  const originalFetchToken = tokenFetcher.prototype.fetchToken;
  const originalToken = tokenFetcher.prototype.token;

  tokenFetcher.prototype.fetchToken = async function fetchToken() {
    this.tenantAccessToken = 'tenant-token';
  };
  tokenFetcher.prototype.token = async () => 'tenant-token';

  scraper.__fetchFeishuJson = async (url) => {
    if (url.includes('/tables?')) {
      return {
        code: 0,
        data: {
          items: [{ table_id: 'table-token' }],
        },
      };
    }

    if (url.includes('/views')) {
      return {
        code: 0,
        data: {
          items: [],
        },
      };
    }

    if (url.includes('/records')) {
      return {
        code: 0,
        data: {
          items: [
            {
              record_id: 'orm-parent-record',
              fields: {
                'Seq. ID': '1',
                Docs: { text: 'CollectionSchema', link: 'https://example.feishu.cn/docx/orm-parent-token' },
                Slug: 'ORM-CollectionSchema',
              },
            },
            {
              record_id: 'client-parent-record',
              fields: {
                'Seq. ID': '2',
                Docs: { text: 'CollectionSchema', link: 'https://example.feishu.cn/docx/client-parent-token' },
                Slug: 'MilvusClient-CollectionSchema',
              },
            },
            {
              record_id: 'orm-add-field-record',
              fields: {
                'Seq. ID': '3',
                Docs: { text: 'add_field()', link: 'https://example.feishu.cn/docx/orm-add-field-token' },
                Slug: 'CollectionSchema-add_field',
                '父记录': [{ record_ids: ['orm-parent-record'] }],
              },
            },
            {
              record_id: 'client-add-field-record',
              fields: {
                'Seq. ID': '4',
                Docs: { text: 'add_field()', link: 'https://example.feishu.cn/docx/client-add-field-token' },
                Slug: 'CollectionSchema-add_field',
                '父记录': [{ record_ids: ['client-parent-record'] }],
              },
            },
          ],
        },
      };
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  try {
    await scraper.__base();
  } finally {
    tokenFetcher.prototype.fetchToken = originalFetchToken;
    tokenFetcher.prototype.token = originalToken;
  }

  assert.equal(scraper.slugs['client-add-field-token'].parent_slug, 'MilvusClient-CollectionSchema');
  assert.equal(
    await scraper.__slugify('H9IFdpWWUouzXOxKlx9cImP8nnd', 'add_field()', 'MilvusClient-CollectionSchema'),
    'CollectionSchema-add_field_1'
  );
}

async function testBasePreservesDuplicateDocTokenSlugsByParentContext() {
  const larkDocScraper = require('./larkDocScraper');
  const tokenFetcher = require('./larkTokenFetcher.js');
  const scraper = new larkDocScraper('', 'base-token', 'wiki', '/tmp');
  const originalFetchToken = tokenFetcher.prototype.fetchToken;
  const originalToken = tokenFetcher.prototype.token;

  tokenFetcher.prototype.fetchToken = async function fetchToken() {
    this.tenantAccessToken = 'tenant-token';
  };
  tokenFetcher.prototype.token = async () => 'tenant-token';

  scraper.__fetchFeishuJson = async (url) => {
    if (url.includes('/tables?page_size=100')) {
      return {
        code: 0,
        data: {
          items: [{ table_id: 'table-token' }],
        },
      };
    }

    if (url.includes('/views?page_size=100')) {
      return {
        code: 0,
        data: {
          items: [],
        },
      };
    }

    if (url.includes('/records')) {
      return {
        code: 0,
        data: {
          items: [
            {
              record_id: 'orm-parent-record',
              fields: {
                'Seq. ID': '1',
                Docs: { text: 'utility', link: 'https://example.feishu.cn/docx/orm-parent-token' },
                Slug: 'ORM-utility',
              },
            },
            {
              record_id: 'client-parent-record',
              fields: {
                'Seq. ID': '2',
                Docs: { text: 'Authentication', link: 'https://example.feishu.cn/docx/client-parent-token' },
                Slug: 'MilvusClient-Authentication',
              },
            },
            {
              record_id: 'orm-create-user-record',
              fields: {
                'Seq. ID': '3',
                Docs: { text: 'create_user()', link: 'https://example.feishu.cn/docx/shared-create-user-token' },
                Slug: 'utility-create_user',
                '父记录': [{ record_ids: ['orm-parent-record'] }],
              },
            },
            {
              record_id: 'client-create-user-record',
              fields: {
                'Seq. ID': '4',
                Docs: { text: 'create_user()', link: 'https://example.feishu.cn/docx/shared-create-user-token' },
                Slug: 'Authentication-create_user',
                '父记录': [{ record_ids: ['client-parent-record'] }],
              },
            },
          ],
        },
      };
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  try {
    await scraper.__base();
  } finally {
    tokenFetcher.prototype.fetchToken = originalFetchToken;
    tokenFetcher.prototype.token = originalToken;
  }

  assert.equal(
    await scraper.__slugify('shared-create-user-token', 'create_user()', 'MilvusClient-Authentication'),
    'Authentication-create_user'
  );
  assert.equal(
    await scraper.__slugify('shared-create-user-token', 'create_user()', 'ORM-utility'),
    'utility-create_user'
  );
}

async function testDriveFolderSlugifyUsesParentContext() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  const scraper = new larkDocScraper('', '', 'drive', tempDir);

  scraper.docs = {
    token: 'CFK5fYjallg3eZdIWqfcdin8noc',
    name: 'CollectionSchema',
  };
  scraper.slugs = {
    WToudUwm4oVXeKxLg3jcj3IAnjh: {
      slug: 'ORM-CollectionSchema',
      title: 'CollectionSchema',
    },
    WVy8dc7Jaonoxqxk7Cvc72KSnvb: {
      slug: 'MilvusClient-CollectionSchema',
      title: 'CollectionSchema',
    },
  };
  scraper.__fetchFeishuJson = async () => ({
    code: 0,
    data: {
      files: [],
    },
  });

  await scraper.__fetch_drive_children('CFK5fYjallg3eZdIWqfcdin8noc', null, false, 'MilvusClient');

  assert.equal(scraper.docs.slug, 'MilvusClient-CollectionSchema');
}

async function testDriveFolderRecursionKeepsSiblingParentContext() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  const scraper = new larkDocScraper('', '', 'drive', tempDir);

  scraper.docs = {
    token: 'root-token',
    name: 'v2',
  };
  scraper.slugs = {
    'root-token': { slug: 'v2', title: 'v2' },
    'orm-folder-token': { slug: 'ORM', title: 'ORM' },
    'client-folder-token': { slug: 'MilvusClient', title: 'MilvusClient' },
    WToudUwm4oVXeKxLg3jcj3IAnjh: {
      slug: 'ORM-CollectionSchema',
      title: 'CollectionSchema',
    },
    WVy8dc7Jaonoxqxk7Cvc72KSnvb: {
      slug: 'MilvusClient-CollectionSchema',
      title: 'CollectionSchema',
    },
  };
  scraper.__fetchFeishuJson = async (url) => {
    if (url.includes('folder_token=root-token')) {
      return {
        code: 0,
        data: {
          files: [
            { token: 'orm-folder-token', name: 'ORM', type: 'folder' },
            { token: 'client-folder-token', name: 'MilvusClient', type: 'folder' },
          ],
        },
      };
    }

    if (url.includes('folder_token=orm-folder-token')) {
      return {
        code: 0,
        data: {
          files: [],
        },
      };
    }

    if (url.includes('folder_token=client-folder-token')) {
      return {
        code: 0,
        data: {
          files: [
            { token: 'CFK5fYjallg3eZdIWqfcdin8noc', name: 'CollectionSchema', type: 'folder' },
          ],
        },
      };
    }

    if (url.includes('folder_token=CFK5fYjallg3eZdIWqfcdin8noc')) {
      return {
        code: 0,
        data: {
          files: [],
        },
      };
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  await scraper.__fetch_drive_children('root-token', null, true);

  const collectionSchema = JSON.parse(fs.readFileSync(path.join(tempDir, 'CFK5fYjallg3eZdIWqfcdin8noc.json'), 'utf8'));
  assert.equal(collectionSchema.slug, 'MilvusClient-CollectionSchema');
}

async function testDriveDocSlugifyUsesCompositeParentContext() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  const scraper = new larkDocScraper('', '', 'drive', tempDir);

  scraper.docs = {
    token: 'vector-folder-token',
    name: 'Vector',
    slug: 'MilvusClient-Vector',
  };
  scraper.slugs = {
    Bzb6dwkckop6XfxVm2lclXG2nJg: {
      slug: 'Collection-hybrid_search',
      title: 'hybrid_search()',
    },
    NEyWdddQ8oKCw4xQTFPcvDTLn3f: {
      slug: 'Vector-hybrid_search',
      title: 'hybrid_search()',
    },
  };
  scraper.__fetchFeishuJson = async () => ({
    code: 0,
    data: {
      files: [
        { token: 'QqOSdTDaLoOKGRxiKEtcuuiAnrf', name: 'hybrid_search()', type: 'docx' },
      ],
    },
  });
  scraper.__fetch_blocks = async (node) => {
    node.blocks = { items: [{ block_id: 'block-1' }] };
  };

  await scraper.__fetch_drive_children('vector-folder-token', null, true, 'MilvusClient');

  const hybridSearch = JSON.parse(fs.readFileSync(path.join(tempDir, 'QqOSdTDaLoOKGRxiKEtcuuiAnrf.json'), 'utf8'));
  assert.equal(hybridSearch.slug, 'Vector-hybrid_search');
}

async function testValidateContentLinksPreservesLegacyReportShape() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'legacy-content-links-'));
  fs.writeFileSync(path.join(tempDir, 'source-token.json'), JSON.stringify({
    title: 'Source Doc',
    slug: 'source-doc',
    node_token: 'source-token',
    blocks: {
      items: [
        {
          block_id: 'block-1',
          block_type: 2,
          text: {
            elements: [
              {
                mention_doc: {
                  title: 'Missing Doc',
                  url: 'https://zilliverse.feishu.cn/wiki/missing-token',
                },
              },
            ],
          },
        },
      ],
    },
  }, null, 2));

  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', tempDir);
  scraper.records = [
    {
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Source Doc', link: 'https://zilliverse.feishu.cn/wiki/source-token' },
        Slug: 'source-doc',
        Status: 'Published',
        'Publish Targets': ['zilliz.saas'],
      },
    },
  ];
  scraper.base_tables = [{ table_id: 'tbl', name: 'Guides', index: 0 }];

  const reportPath = path.join(tempDir, 'legacy-report.json');
  const report = await scraper.validate_content_links({ reportPath });
  assert.equal(report.summary.broken_content_links, 1);
  assert.equal(report.broken_content_links.length, 1);
  assert.equal(report.broken_content_links[0].source_file, 'source-token.json');
}

async function testFetchSourceTokensFetchesSelectedTokensWithoutClearingSources() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  fs.writeFileSync(path.join(tempDir, 'existing.json'), JSON.stringify({ token: 'existing' }));
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', tempDir);
  scraper.use_all_base_tables = true;

  const fetched = [];
  let navigationRewrites = 0;
  scraper.fetch = async (recursive, token) => {
    fetched.push({ recursive, token });
  };
  scraper.__apply_base_navigation = async (opts) => {
    navigationRewrites++;
    assert.deepEqual(opts, { partialTables: true });
  };

  await scraper.fetch_source_tokens(['a', 'b', 'a']);

  assert.deepEqual(fetched, [
    { recursive: false, token: 'a' },
    { recursive: false, token: 'b' },
  ]);
  assert.equal(navigationRewrites, 1);
  assert.equal(fs.existsSync(path.join(tempDir, 'existing.json')), true);
}

async function testFullWikiFetchHydratesBaseCanonicalSources() {
  const larkDocScraper = require('./larkDocScraper');
  const tokenFetcher = require('./larkTokenFetcher.js');
  const originalFetchToken = tokenFetcher.prototype.fetchToken;
  const originalToken = tokenFetcher.prototype.token;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-full-fetch-'));

  tokenFetcher.prototype.fetchToken = async function fetchToken() {
    this.tenantAccessToken = 'tenant-token';
  };
  tokenFetcher.prototype.token = async () => 'tenant-token';

  try {
    const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', tempDir);
    scraper.__fetchFeishuJson = async () => ({
      code: 0,
      data: {
        node: {
          node_token: 'root-token',
          origin_node_token: 'root-token',
          obj_type: 'folder',
          title: 'Root',
          has_child: false,
        },
      },
    });
    scraper.__fetch_wiki_children = async node => {
      fs.writeFileSync(path.join(tempDir, 'root-token.json'), JSON.stringify(node));
    };
    let navigationOptions = null;
    scraper.__apply_base_navigation = async options => {
      navigationOptions = options;
    };

    await scraper.fetch(true);

    assert.deepEqual(navigationOptions, { hydrateLinkedDocs: true });
  } finally {
    tokenFetcher.prototype.fetchToken = originalFetchToken;
    tokenFetcher.prototype.token = originalToken;
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testBaseNavigationCreatesRootWhenSourceCacheIsEmpty() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', tempDir);
  scraper.use_all_base_tables = true;
  scraper.records = [
    {
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      base_record_index: 0,
      fields: {
        Docs: { text: 'Source Doc', link: 'https://zilliverse.feishu.cn/wiki/source-token' },
        Slug: 'source-doc',
        Status: 'Published',
        'Publish Targets': ['zilliz.saas'],
      },
    },
  ];
  scraper.base_tables = [{ table_id: 'tbl', name: 'Guides', index: 0 }];
  scraper.__fetch_base_doc_sources = async () => {};

  await scraper.__apply_base_navigation({ partialTables: true });

  const root = JSON.parse(fs.readFileSync(path.join(tempDir, 'root-token.json'), 'utf8'));
  assert.equal(root.node_token, 'root-token');
  assert.equal(root.has_child, true);
  assert.equal(root.children[0].node_token, 'base:tbl');
}

async function testBaseNavigationUsesBaseRecordsWithoutFetchingEveryLinkedDoc() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', tempDir);
  scraper.use_all_base_tables = true;
  scraper.records = [
    {
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      base_record_index: 0,
      fields: {
        Docs: { text: 'Source Doc', link: 'https://zilliverse.feishu.cn/wiki/source-token' },
        Slug: 'source-doc',
        Status: 'Published',
        'Publish Targets': ['zilliz.saas'],
      },
    },
  ];
  scraper.base_tables = [{ table_id: 'tbl', name: 'Guides', index: 0 }];
  let fetched = false;
  scraper.__fetch_base_doc_sources = async () => {
    fetched = true;
  };

  await scraper.__apply_base_navigation({ partialTables: true });

  assert.equal(fetched, false);
  const source = JSON.parse(fs.readFileSync(path.join(tempDir, 'source-token.json'), 'utf8'));
  assert.equal(source.node_token, 'source-token');
  assert.equal(source.base_nav_virtual, true);
  assert.equal(source.base_placement_type, 'canonical');
}

async function testBaseDocHydrationRefetchesVirtualCanonicalSources() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', tempDir);
  scraper.records = [{
    record_id: 'rec-source',
    fields: { Docs: { text: 'Source Doc', link: 'https://zilliverse.feishu.cn/wiki/source-token' }, Progress: 'Draft' },
  }];
  fs.writeFileSync(path.join(tempDir, 'source-token.json'), JSON.stringify({
    node_token: 'source-token',
    origin_node_token: 'source-token',
    base_nav_virtual: true,
    base_placement_type: 'canonical',
  }));
  let metadataFetches = 0;
  scraper.__fetchFeishuJson = async () => {
    metadataFetches += 1;
    return { code: 0, data: { node: { node_token: 'source-token', origin_node_token: 'source-token', obj_type: 'docx', title: 'Source Doc' } } };
  };
  scraper.__slugify = async () => 'source-doc';
  scraper.__fetch_blocks = async node => {
    node.blocks = { items: [{ block_id: 'page', block_type: 1 }, { block_id: 'body', block_type: 2 }] };
  };

  await scraper.__fetch_base_doc_sources();

  const source = JSON.parse(fs.readFileSync(path.join(tempDir, 'source-token.json'), 'utf8'));
  assert.equal(metadataFetches, 1);
  assert.equal(source.base_nav_virtual, undefined);
  assert.equal(source.blocks.items.length, 2);
}

async function testBaseDocHydrationSkipsCanonicalWithEmptyProgress() {
  const larkDocScraper = require('./larkDocScraper');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-scraper-'));
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', tempDir);
  scraper.records = [{
    record_id: 'rec-hidden',
    fields: {
      Docs: { text: 'Hidden Doc', link: 'https://zilliverse.feishu.cn/wiki/hidden-token' },
      Progress: '',
      'Placement Type': 'canonical',
    },
  }];
  let metadataFetches = 0;
  scraper.__fetchFeishuJson = async () => {
    metadataFetches += 1;
    return { code: 0, data: {} };
  };

  await scraper.__fetch_base_doc_sources();

  assert.equal(metadataFetches, 0);
}

async function testFetchWikiNodeMetadataResolvesShortcutRevisionFields() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', '/tmp');
  scraper.token = 'tenant-token';
  const fetched = [];

  scraper.__fetchFeishuJson = async (url) => {
    fetched.push(url);
    if (url.includes('shortcut-token')) {
      return {
        code: 0,
        data: {
          node: {
            node_token: 'shortcut-token',
            node_type: 'shortcut',
            origin_node_token: 'origin-token',
            obj_type: 'docx',
          },
        },
      };
    }
    if (url.includes('raw-docx-token')) {
      return {
        code: 0,
        data: {
          node: {
            node_token: 'wiki-for-docx-token',
            node_type: 'origin',
            obj_token: 'raw-docx-token',
            obj_type: 'docx',
            title: 'Docx Source',
            obj_edit_time: '1800000001',
            revision_id: 'rev-docx',
          },
        },
      };
    }
    return {
      code: 0,
      data: {
        node: {
          node_token: 'origin-token',
          node_type: 'origin',
          obj_token: 'docx-token',
          obj_type: 'docx',
          title: 'Source',
          obj_edit_time: '1800000000',
          revision_id: 'rev-2',
        },
      },
    };
  };

  const metadata = await scraper.fetch_wiki_node_metadata([
    {
      record_id: 'rec-source',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Source', link: 'https://zilliverse.feishu.cn/wiki/shortcut-token' },
        Slug: 'source',
        Progress: 'Draft',
        'Placement Type': 'canonical',
      },
    },
    {
      record_id: 'rec-docx',
      base_table_id: 'tbl',
      base_table_name: 'Guides',
      fields: {
        Docs: { text: 'Docx Source', link: 'https://zilliverse.feishu.cn/docx/raw-docx-token' },
        Slug: 'docx-source',
        Progress: 'Draft',
        'Placement Type': 'canonical',
      },
    },
  ]);

  assert.equal(fetched.length, 3);
  assert.equal(fetched.some(url => url.includes('raw-docx-token') && url.includes('obj_type=docx')), true);
  assert.equal(metadata.get('shortcut-token').node_token, 'origin-token');
  assert.equal(metadata.get('shortcut-token').requested_node_token, 'shortcut-token');
  assert.equal(metadata.get('shortcut-token').obj_edit_time, '1800000000');
  assert.equal(metadata.get('shortcut-token').revision_id, 'rev-2');
  assert.equal(metadata.get('raw-docx-token').obj_type, 'docx');
  assert.equal(metadata.get('raw-docx-token').revision_id, 'rev-docx');
}

async function testFetchWikiNodeUsesEndpointSpecificLimiter() {
  const originalWikiNodeMinTime = process.env.FEISHU_WIKI_NODE_MIN_TIME_MS;
  process.env.FEISHU_WIKI_NODE_MIN_TIME_MS = '20';
  delete require.cache[require.resolve('./larkDocScraper')];
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', '/tmp');
  scraper.token = 'tenant-token';

  const callTimes = [];
  scraper.__fetchFeishuJson = async () => {
    callTimes.push(Date.now());
    return {
      code: 0,
      data: {
        node: {
          node_token: `node-${callTimes.length}`,
          node_type: 'origin',
          obj_token: `docx-${callTimes.length}`,
          obj_type: 'docx',
          title: `Source ${callTimes.length}`,
          obj_edit_time: '1800000000',
          revision_id: `rev-${callTimes.length}`,
        },
      },
    };
  };

  try {
    await scraper.fetch_wiki_node_metadata([
      {
        record_id: 'rec-a',
        fields: {
          Docs: { text: 'A', link: 'https://zilliverse.feishu.cn/wiki/a-token' },
          Slug: 'a',
          Progress: 'Draft',
          'Placement Type': 'canonical',
        },
      },
      {
        record_id: 'rec-b',
        fields: {
          Docs: { text: 'B', link: 'https://zilliverse.feishu.cn/wiki/b-token' },
          Slug: 'b',
          Progress: 'Draft',
          'Placement Type': 'canonical',
        },
      },
    ]);

    assert.equal(callTimes.length, 2);
    assert.ok(callTimes[1] - callTimes[0] >= 15, `second get_node call started after ${callTimes[1] - callTimes[0]}ms`);
  } finally {
    if (originalWikiNodeMinTime === undefined) {
      delete process.env.FEISHU_WIKI_NODE_MIN_TIME_MS;
    } else {
      process.env.FEISHU_WIKI_NODE_MIN_TIME_MS = originalWikiNodeMinTime;
    }
    delete require.cache[require.resolve('./larkDocScraper')];
  }
}

async function testBaseScanProgressLogsTablesAndRecords() {
  const larkDocScraper = require('./larkDocScraper');
  const tokenFetcher = require('./larkTokenFetcher.js');
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', '/tmp');
  const logs = [];
  const originalLog = console.log;
  const originalFetchToken = tokenFetcher.prototype.fetchToken;
  const originalToken = tokenFetcher.prototype.token;
  console.log = (message) => logs.push(String(message));
  tokenFetcher.prototype.fetchToken = async function fetchToken() {
    this.tenantAccessToken = 'tenant-token';
  };
  tokenFetcher.prototype.token = async () => 'tenant-token';

  scraper.__base_tables = async (_token, _tableFilter, progressLabel) => {
    assert.equal(progressLabel, '[incremental-fetch] Base scan');
    return [{ table_id: 'tbl-a', name: 'Guides', index: 0 }];
  };
  scraper.__base_records = async (_token, table, progressLabel) => {
    assert.equal(table.table_id, 'tbl-a');
    assert.equal(progressLabel, '[incremental-fetch] Base scan');
    return [{
      record_id: 'rec-a',
      base_table_id: table.table_id,
      base_table_name: table.name,
      base_table_index: table.index,
      base_record_index: 0,
      fields: {
        Docs: { text: 'Doc A', link: 'https://zilliverse.feishu.cn/wiki/doc-a-token' },
        Slug: 'doc-a',
        Parent: [],
        'Seq. ID': '1',
      },
    }];
  };

  try {
    await scraper.__base({ progressLabel: '[incremental-fetch] Base scan' });

    assert.match(logs.join('\n'), /scanning Base tables/);
    assert.match(logs.join('\n'), /scanning table 1\/1 \(Guides\)/);
    assert.match(logs.join('\n'), /loaded 1 Base record\(s\)/);
  } finally {
    console.log = originalLog;
    tokenFetcher.prototype.fetchToken = originalFetchToken;
    tokenFetcher.prototype.token = originalToken;
  }
}

async function testWikiMetadataProgressLogsResolutionCounts() {
  const larkDocScraper = require('./larkDocScraper');
  const scraper = new larkDocScraper('root-token', 'base-token:*', 'wiki', '/tmp');
  scraper.token = 'tenant-token';
  const logs = [];
  const originalLog = console.log;
  console.log = (message) => logs.push(String(message));

  scraper.__fetchFeishuJson = async () => ({
    code: 0,
    data: {
      node: {
        node_token: 'node-token',
        node_type: 'origin',
        obj_token: 'docx-token',
        obj_type: 'docx',
        title: 'Source',
        revision_id: 'rev-1',
      },
    },
  });

  try {
    await scraper.fetch_wiki_node_metadata([
      {
        record_id: 'rec-a',
        fields: {
          Docs: { text: 'A', link: 'https://zilliverse.feishu.cn/wiki/a-token' },
          Slug: 'a',
          Progress: 'Draft',
          'Placement Type': 'canonical',
        },
      },
      {
        record_id: 'rec-b',
        fields: {
          Docs: { text: 'B', link: 'https://zilliverse.feishu.cn/wiki/b-token' },
          Slug: 'b',
          Progress: 'Draft',
          'Placement Type': 'canonical',
        },
      },
    ], {
      progressLabel: '[incremental-fetch] Wiki metadata',
      progressEvery: 1,
    });

    assert.match(logs.join('\n'), /resolving 2 wiki node\(s\)/);
    assert.match(logs.join('\n'), /resolved 1\/2 wiki node\(s\)/);
    assert.match(logs.join('\n'), /resolved 2\/2 wiki node\(s\)/);
  } finally {
    console.log = originalLog;
  }
}

async function testIncrementalSourceFetchWritesCandidateFromRetainedScan() {
  const originalLoad = Module._load;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-candidate-'));
  const sourceDir = path.join(tempDir, 'sources');
  const candidatePath = path.join(tempDir, 'candidate.json');
  const records = [{ record_id: 'rec-a', fields: { Docs: { text: 'A', link: 'https://example.feishu.cn/wiki/doc-a' }, Slug: 'a', 'Placement Type': 'canonical' } }];
  const metadata = new Map([['doc-a', { node_token: 'node-a', obj_token: 'doc-a', revision_id: 'rev-1' }]]);
  let baseCalls = 0;
  let metadataCalls = 0;
  let candidateInput = null;
  let writtenCandidate = null;
  let action = null;

  class FakeScraper {
    constructor() { this.base_app_token = 'base-token'; this.records = null; }
    async __base() { baseCalls += 1; this.records = records; }
    async fetch_wiki_node_metadata(inputRecords) { metadataCalls += 1; assert.equal(inputRecords, records); return metadata; }
    async fetch_source_tokens(tokens) {
      assert.deepEqual(tokens, ['doc-a']);
      fs.mkdirSync(sourceDir, { recursive: true });
      fs.writeFileSync(path.join(sourceDir, 'root-token.json'), JSON.stringify({ node_token: 'root-token', children: [{ node_token: 'doc-a' }] }));
      fs.writeFileSync(path.join(sourceDir, 'doc-a.json'), JSON.stringify({
        node_token: 'doc-a',
        title: 'A',
        blocks: { items: [{ block_id: 'page', block_type: 1 }, { block_id: 'body', block_type: 2 }] },
      }));
    }
  }
  class FakeUtils {}

  Module._load = function patchedLoad(request, parent, isMain) {
    if (parent?.filename?.endsWith('/plugins/lark-docs/index.js')) {
      if (request === './larkDocScraper.js') return FakeScraper;
      if (request === './larkUtils.js') return FakeUtils;
      if (request === './incrementalFetchPlanner') return {
        planIncrementalFetch(input) {
          assert.equal(input.records, records);
          assert.equal(input.currentNodeMetadataByToken, metadata);
          return { manual: 'guides', mode: 'incremental', expanded_tokens: ['doc-a'], removed_records: [] };
        },
        writeIncrementalFetchPlanReports() { return { markdownPath: path.join(tempDir, 'plan.md') }; },
      };
      if (request === './sourceSnapshot') return {
        readSnapshot() { return null; },
        createSourceSnapshot(input) {
          candidateInput = input;
          return {
            schema_version: 2,
            manual: 'guides',
            build_env: 'uat',
            records: [
              {
                placement_type: 'canonical',
                doc_token: 'doc-a',
                source_file: 'doc-a.json',
              },
            ],
          };
        },
        validateCandidateSnapshot(candidate) { assert.equal(candidate.manual, 'guides'); },
        writeSnapshot(file, candidate) { writtenCandidate = { file, candidate }; },
      };
    }
    return originalLoad.apply(this, arguments);
  };

  try {
    delete require.cache[require.resolve('./index')];
    const plugin = require('./index')(null, {
      guides: {
        root: 'root-token', base: 'base-token:*', sourceType: 'wiki', displayedSidebar: [],
        docSourceDir: sourceDir, targets: {},
      },
    });
    const command = { option() { return this; }, action(callback) { action = callback; return this; } };
    plugin.extendCli({ command() { return command; } });
    await action({ manual: 'guides', sourceOnly: true, incremental: true, buildEnv: 'uat', snapshotCandidatePath: candidatePath });

    assert.equal(baseCalls, 1);
    assert.equal(metadataCalls, 1);
    assert.equal(candidateInput.records, records);
    assert.equal(candidateInput.nodeMetadataByToken, metadata);
    assert.equal(candidateInput.docSourceDir, sourceDir);
    assert.equal(candidateInput.baseAppToken, 'base-token');
    assert.equal(writtenCandidate.file, candidatePath);
    assert.equal(writtenCandidate.candidate.manual, 'guides');
    assert.equal(writtenCandidate.candidate.records[0].source_file, 'doc-a.json');
  } finally {
    Module._load = originalLoad;
    delete require.cache[require.resolve('./index')];
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testDriveIncrementalRefreshesSourcesBeforePlanningRenderDelta() {
  const originalLoad = Module._load;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-drive-incremental-'));
  const sourceDir = path.join(tempDir, 'sources');
  const records = [{
    record_id: 'rec-a',
    fields: { Docs: { text: 'A', link: 'https://example.feishu.cn/docx/doc-a' } },
  }];
  let fetchCalls = 0;
  let planCalls = 0;
  let action = null;

  class FakeScraper {
    constructor() { this.base_app_token = 'base-token'; this.records = null; }
    async fetch(recursive) {
      fetchCalls += 1;
      assert.equal(recursive, true);
      this.records = records;
      fs.mkdirSync(sourceDir, { recursive: true });
      fs.writeFileSync(path.join(sourceDir, 'doc-a.json'), JSON.stringify({
        token: 'doc-a', type: 'docx', name: 'A', blocks: { items: [{ block_type: 1 }] },
      }));
    }
  }
  class FakeUtils {}

  Module._load = function patchedLoad(request, parent, isMain) {
    if (parent?.filename?.endsWith('/plugins/lark-docs/index.js')) {
      if (request === './larkDocScraper.js') return FakeScraper;
      if (request === './larkUtils.js') return FakeUtils;
      if (request === './incrementalFetchPlanner') return {
        planIncrementalFetch(input) {
          planCalls += 1;
          assert.equal(fs.existsSync(path.join(sourceDir, 'doc-a.json')), true);
          assert.equal(input.records, records);
          return { manual: 'pymilvus30', mode: 'incremental', expanded_tokens: ['doc-a'], removed_records: [] };
        },
        writeIncrementalFetchPlanReports() { return { markdownPath: path.join(tempDir, 'plan.md') }; },
      };
      if (request === './sourceSnapshot') return {
        readSnapshot() { return { schema_version: 2, manual: 'pymilvus30', records: [] }; },
        createSourceSnapshot() { throw new Error('candidate snapshot should not be written'); },
        validateCandidateSnapshot() {},
        writeSnapshot() {},
      };
      if (request === './sourceCompleteness') return {
        validateSourceCompleteness() { throw new Error('refreshed Drive sources must not validate the stale cache'); },
        assertSourceCompleteness() {},
      };
    }
    return originalLoad.apply(this, arguments);
  };

  try {
    delete require.cache[require.resolve('./index')];
    const plugin = require('./index')(null, {
      pymilvus30: {
        root: 'root-token', base: 'base-token', sourceType: 'drive', displayedSidebar: [],
        docSourceDir: sourceDir, targets: {},
      },
    });
    const command = { option() { return this; }, action(callback) { action = callback; return this; } };
    plugin.extendCli({ command() { return command; } });
    await action({ manual: 'pymilvus30', sourceOnly: true, incremental: true, buildEnv: 'uat' });

    assert.equal(fetchCalls, 1);
    assert.equal(planCalls, 1);
  } finally {
    Module._load = originalLoad;
    delete require.cache[require.resolve('./index')];
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function run() {
  await testFeishuJsonFetchesAreThrottled();
  await testWikiRootFetchRetriesPrematureClose();
  await testSlugifyRejectsAmbiguousTitleFallback();
  await testSlugifyResolvesAmbiguousTitleWithParentContext();
  await testSlugifyResolvesAmbiguousTitleWithCompositeParentContext();
  await testSlugifyResolvesAmbiguousTitleWithBitableParentMetadata();
  await testSlugifyPrefersExactSlugForAmbiguousSectionTitle();
  await testBaseCapturesRecordIdParentMetadata();
  await testBasePreservesDuplicateDocTokenSlugsByParentContext();
  await testDriveFolderSlugifyUsesParentContext();
  await testDriveFolderRecursionKeepsSiblingParentContext();
  await testDriveDocSlugifyUsesCompositeParentContext();
  await testValidateContentLinksPreservesLegacyReportShape();
  await testFetchSourceTokensFetchesSelectedTokensWithoutClearingSources();
  await testFullWikiFetchHydratesBaseCanonicalSources();
  await testBaseNavigationCreatesRootWhenSourceCacheIsEmpty();
  await testBaseNavigationUsesBaseRecordsWithoutFetchingEveryLinkedDoc();
  await testBaseDocHydrationRefetchesVirtualCanonicalSources();
  await testBaseDocHydrationSkipsCanonicalWithEmptyProgress();
  await testFetchWikiNodeMetadataResolvesShortcutRevisionFields();
  await testFetchWikiNodeUsesEndpointSpecificLimiter();
  await testBaseScanProgressLogsTablesAndRecords();
  await testWikiMetadataProgressLogsResolutionCounts();
  await testIncrementalSourceFetchWritesCandidateFromRetainedScan();
  await testDriveIncrementalRefreshesSourcesBeforePlanningRenderDelta();
  console.log('lark-docs scraper tests passed');
}

run();
