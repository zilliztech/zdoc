const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const os = require('node:os');
const path = require('node:path');
const LarkDocWriter = require('./larkDocWriter');

function textRun(content, style = {}) {
  return {
    text_run: {
      content,
      text_element_style: {
        bold: false,
        inline_code: false,
        italic: false,
        strikethrough: false,
        underline: false,
        ...style,
      },
    },
  };
}

function textBlock(block_id, parent_id, elements) {
  return {
    block_id,
    block_type: 2,
    parent_id,
    text: {
      elements,
      style: { align: 1, folded: false },
    },
  };
}

function bulletBlock(block_id, parent_id, elements, children = []) {
  return {
    block_id,
    block_type: 12,
    parent_id,
    bullet: {
      elements,
      style: { align: 1, folded: false },
    },
    ...(children.length ? { children } : {}),
  };
}

function headingBlock(block_id, parent_id, level, elements) {
  return {
    block_id,
    block_type: level + 2,
    parent_id,
    [`heading${level}`]: {
      elements,
      style: { align: 1, folded: false },
    },
  };
}

function codeBlock(block_id, parent_id, content, style = { wrap: false }) {
  return {
    block_id,
    block_type: 14,
    parent_id,
    code: {
      elements: [textRun(content)],
      style,
    },
  };
}

function gridBlock(block_id, children, columnSize = children.length) {
  return {
    block_id,
    block_type: 24,
    grid: { column_size: columnSize },
    children,
  };
}

function gridColumnBlock(block_id, parent_id, width_ratio, children) {
  return {
    block_id,
    block_type: 25,
    parent_id,
    grid_column: { width_ratio },
    children,
  };
}

function createWriter(blocks) {
  const writer = new LarkDocWriter('', '', 'default');
  writer.page_blocks = blocks;
  writer.targets = 'zilliz';
  return writer;
}

async function assertMdxCompiles(markdown) {
  const { compile } = await import('@mdx-js/mdx');
  const remarkMath = (await import('remark-math')).default;
  await compile(`import Admonition from '@theme/Admonition';\n\n${markdown}`, {
    development: false,
    remarkPlugins: [remarkMath],
  });
}

function testExampleHttpUrlsPreservesRawExampleUrls() {
  const writer = createWriter([]);
  const markdown = 'download from https://<bucket-name>.oss-cn-hangzhou.aliyuncs.com/milvus-data';
  const result = writer.__example_http_urls(markdown);

  assert.equal(result, markdown);
  assert.doesNotMatch(result, /<i>http<\/i>/);
}

function testExampleHttpUrlsSkipsInlineCodeSpans() {
  const writer = createWriter([]);
  const markdown = '`https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`';
  const result = writer.__example_http_urls(markdown);

  assert.equal(result, markdown);
}

function testExampleHttpUrlsSkipsFencedCodeBlocks() {
  const writer = createWriter([]);
  const markdown = [
    '```bash',
    'curl https://<bucket-name>.oss-cn-hangzhou.aliyuncs.com/milvus-data',
    '```',
  ].join('\n');
  const result = writer.__example_http_urls(markdown);

  assert.equal(result, markdown);
}

function testKeywordPickerUsesStableSeed() {
  const writer = createWriter([]);
  assert.deepEqual(
    writer.keyword_picker('Authentication-create_user:create_user()'),
    writer.keyword_picker('Authentication-create_user:create_user()')
  );
}

function testHeadingSlugDropsVisibilitySuffixes() {
  const writer = createWriter([]);

  assert.equal(
    writer.__heading_slug('Custom privilege groups | PRIVATE'),
    'custom-privilege-groups'
  );
  assert.equal(
    writer.__heading_slug('Sort search results by scalar fields | ONDEMAND'),
    'sort-search-results-by-scalar-fields'
  );
}

async function testConvertedHeadingLinkDropsVisibilitySuffixes() {
  const writer = createWriter([]);
  const page = {
    title: 'Target',
    slug: 'target-page',
    blocks: {
      items: [
        headingBlock('heading-token', 'page', 3, [textRun('Custom privilege groups | PRIVATE')]),
      ],
    },
  };

  writer.__fetch_link_doc_source = () => page;
  const converted = await writer.__convert_link('https://zilliverse.feishu.cn/docx/doc-token#heading-token');

  assert.equal(converted, './target-page#custom-privilege-groups');
}

async function testConvertedAnchorLinkToleratesTargetWithoutBlocks() {
  const writer = createWriter([]);
  writer.__fetch_link_doc_source = () => ({
    title: 'Target',
    slug: 'target-page',
  });

  const converted = await writer.__convert_link('https://zilliverse.feishu.cn/docx/doc-token#missing-heading');

  assert.equal(converted, './target-page');
}

function testFeatureCardMarkerParserAcceptsReadableSpacing() {
  const writer = createWriter([]);
  assert.deepEqual(
    writer.__parse_feature_card_grid_marker('<!-- zdoc:feature-card-grid icons=Quality-first:BadgeCheck, Balanced:Scale, Compressed:Sparkles -->'),
    {
      valid: true,
      pairs: [
        { title: 'Quality-first', icon: 'BadgeCheck' },
        { title: 'Balanced', icon: 'Scale' },
        { title: 'Compressed', icon: 'Sparkles' },
      ],
    }
  );
}

async function testCalloutPreservesMarkdownBody() {
  const callout = {
    block_id: 'callout',
    block_type: 19,
    callout: { emoji_id: 'blue_book' },
    children: ['title', 'intro', 'managed', 'external'],
  };

  const blocks = [
    callout,
    textBlock('title', 'callout', [textRun('Notes')]),
    textBlock('intro', 'callout', [textRun('This method applies only to dedicated serving clusters and on-demand compute.')]),
    bulletBlock('managed', 'callout', [
      textRun('For a managed collection in serving clusters, please create '),
      textRun('MilvusClient', { bold: true }),
      textRun(' with the cluster endpoint.'),
    ], ['free', 'dedicated']),
    bulletBlock('free', 'managed', [textRun('Free & Serverless', { bold: true })], ['free-url']),
    textBlock('free-url', 'free', [textRun('https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com', { inline_code: true })]),
    bulletBlock('dedicated', 'managed', [textRun('Dedicated', { bold: true })], ['dedicated-url']),
    textBlock('dedicated-url', 'dedicated', [textRun('https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530', { inline_code: true })]),
    bulletBlock('external', 'callout', [
      textRun('For an external collection for on-demand compute, create '),
      textRun('MilvusClient', { bold: true }),
      textRun(' with the project endpoints.'),
    ], ['external-url']),
    textBlock('external-url', 'external', [textRun('https://{project-id}.{region}.api.zillizcloud.com', { inline_code: true })]),
  ];

  const markdown = await createWriter(blocks).__callout(callout, 0);

  assert.match(markdown, /<Admonition type="info" icon="📘" title="Notes">/);
  assert.match(markdown, /- For a managed collection in serving clusters, please create \*\*MilvusClient\*\* with the cluster endpoint\./);
  assert.match(markdown, /    - \*\*Free & Serverless\*\*/);
  assert.match(markdown, /        `https:\/\/\{cluster-id\}\.serverless\.\{region\}\.vectordb\.zillizcloud\.com`/);
  assert.doesNotMatch(markdown, /<ul>|<li>|<p>/);

  await assertMdxCompiles(markdown);
}

async function testQuotePreservesMarkdownBody() {
  const quote = {
    block_id: 'quote',
    block_type: 34,
    children: ['title', 'intro', 'managed'],
  };

  const blocks = [
    quote,
    textBlock('title', 'quote', [textRun('Notes')]),
    textBlock('intro', 'quote', [textRun('Use the matching endpoint for your deployment type.')]),
    bulletBlock('managed', 'quote', [textRun('Serving clusters')], ['free']),
    bulletBlock('free', 'managed', [textRun('Free & Serverless', { bold: true })], ['free-url']),
    textBlock('free-url', 'free', [textRun('https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com', { inline_code: true })]),
  ];

  const markdown = await createWriter(blocks).__quote(quote, 0);

  assert.match(markdown, /<Admonition type="info" icon="📘" title="Notes">/);
  assert.match(markdown, /- Serving clusters/);
  assert.match(markdown, /    - \*\*Free & Serverless\*\*/);
  assert.match(markdown, /        `https:\/\/\{cluster-id\}\.serverless\.\{region\}\.vectordb\.zillizcloud\.com`/);
  assert.doesNotMatch(markdown, /<ul>|<li>|<p>/);

  await assertMdxCompiles(markdown);
}

async function testCalloutWarningUsesWarningType() {
  const callout = {
    block_id: 'callout-warning',
    block_type: 19,
    callout: { emoji_id: 'construction' },
    children: ['title', 'body'],
  };
  const blocks = [
    callout,
    textBlock('title', 'callout-warning', [textRun('Warning')]),
    textBlock('body', 'callout-warning', [textRun('Nullable StructArray fields are available only in clusters compatible with Milvus v3.0.x.')]),
  ];

  const markdown = await createWriter(blocks).__callout(callout, 0);

  assert.match(markdown, /<Admonition type="warning" icon="🚧" title="Warning">/);
  assert.match(markdown, /Nullable StructArray fields are available only/);
  await assertMdxCompiles(markdown);
}

async function testCalloutDestructiveSentenceKeepsDangerAndMovesTitleToBody() {
  const callout = {
    block_id: 'callout-danger',
    block_type: 19,
    callout: { emoji_id: 'construction' },
    children: ['sentence'],
  };
  const blocks = [
    callout,
    textBlock('sentence', 'callout-danger', [textRun('Once you drop a database, it is removed immediately and cannot be recovered. This action cannot be undone.')]),
  ];

  const markdown = await createWriter(blocks).__callout(callout, 0);

  assert.match(markdown, /<Admonition type="danger" icon="🚧" title="Danger">/);
  assert.match(markdown, /Once you drop a database, it is removed immediately and cannot be recovered/);
  assert.doesNotMatch(markdown, /title="Once you drop a database/);
  await assertMdxCompiles(markdown);
}

async function testQuoteWarningUsesWarningType() {
  const quote = {
    block_id: 'quote-warning',
    block_type: 34,
    children: ['title', 'body'],
  };
  const blocks = [
    quote,
    textBlock('title', 'quote-warning', [textRun('Warning')]),
    textBlock('body', 'quote-warning', [textRun('Deleted files and folders cannot be recovered.')]),
  ];

  const markdown = await createWriter(blocks).__quote(quote, 0);

  assert.match(markdown, /<Admonition type="warning" icon="🚧" title="Warning">/);
  assert.match(markdown, /Deleted files and folders cannot be recovered/);
  await assertMdxCompiles(markdown);
}

async function testGridWithHeadingColumnsRendersFeatureCards() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid icons=Problem:AlertTriangle,Strategy:Workflow -->')]);
  const grid = gridBlock('grid-cards', ['problem-col', 'strategy-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('problem-col', 'grid-cards', 0.5, ['problem-title', 'problem-1', 'problem-2']),
    headingBlock('problem-title', 'problem-col', 3, [textRun('Problem')]),
    bulletBlock('problem-1', 'problem-col', [textRun('Each row may contain many vectors.')]),
    bulletBlock('problem-2', 'problem-col', [textRun('Exact MaxSim over all rows is expensive.')]),
    gridColumnBlock('strategy-col', 'grid-cards', 0.5, ['strategy-title', 'strategy-1']),
    headingBlock('strategy-title', 'strategy-col', 3, [textRun('Strategy')]),
    bulletBlock('strategy-1', 'strategy-col', [textRun('Use an approximate first-stage retrieval method.')]),
  ];

  const markdown = await createWriter(blocks).__markdown([marker, grid], 0);

  assert.match(markdown, /<FeatureCardGrid columns=\{2\}>/);
  assert.match(markdown, /<FeatureCard icon="AlertTriangle" title="Problem">/);
  assert.match(markdown, /- Each row may contain many vectors\./);
  assert.match(markdown, /<FeatureCard icon="Workflow" title="Strategy">/);
  assert.doesNotMatch(markdown, /<Grid columnSize=/);
  assert.doesNotMatch(markdown, /<h3|### Problem/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
  await assertMdxCompiles([
    "import {FeatureCard} from '@site/src/components/FeatureCardGrid';",
    "import FeatureCardGrid from '@site/src/components/FeatureCardGrid';",
    markdown,
  ].join('\n\n'));
}

async function testGridWithoutHeadingColumnKeepsGenericGrid() {
  const grid = gridBlock('grid-generic', ['left-col', 'right-col'], 2);
  const blocks = [
    grid,
    gridColumnBlock('left-col', 'grid-generic', 0.5, ['left-text']),
    textBlock('left-text', 'left-col', [textRun('Plain left column.')]),
    gridColumnBlock('right-col', 'grid-generic', 0.5, ['right-text']),
    textBlock('right-text', 'right-col', [textRun('Plain right column.')]),
  ];

  const markdown = await createWriter(blocks).__grid(grid, 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
}

async function testMarkedGridWithoutHeadingFallsBackAndSuppressesMarker() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid icons=Plain:Sparkles,Other:Workflow -->')]);
  const grid = gridBlock('grid-generic', ['left-col', 'right-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('left-col', 'grid-generic', 0.5, ['left-text']),
    textBlock('left-text', 'left-col', [textRun('Plain left column.')]),
    gridColumnBlock('right-col', 'grid-generic', 0.5, ['right-text']),
    textBlock('right-text', 'right-col', [textRun('Plain right column.')]),
  ];

  const markdown = await createWriter(blocks).__markdown([marker, grid], 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
}

async function testMarkedGridWithUnsupportedIconFallsBackAndSuppressesMarker() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid icons=Problem:UnknownIcon,Strategy:Workflow -->')]);
  const grid = gridBlock('grid-cards', ['problem-col', 'strategy-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('problem-col', 'grid-cards', 0.5, ['problem-title', 'problem-1']),
    headingBlock('problem-title', 'problem-col', 3, [textRun('Problem')]),
    bulletBlock('problem-1', 'problem-col', [textRun('Each row may contain many vectors.')]),
    gridColumnBlock('strategy-col', 'grid-cards', 0.5, ['strategy-title', 'strategy-1']),
    headingBlock('strategy-title', 'strategy-col', 3, [textRun('Strategy')]),
    bulletBlock('strategy-1', 'strategy-col', [textRun('Use an approximate first-stage retrieval method.')]),
  ];

  const markdown = await createWriter(blocks).__markdown([marker, grid], 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
  assert.doesNotMatch(markdown, /UnknownIcon/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
}

async function testFeatureCardMarkerWithoutIconsFallsBackAndSuppressesMarker() {
  const marker = textBlock('marker', 'page', [textRun('<!-- zdoc:feature-card-grid -->')]);
  const grid = gridBlock('grid-cards', ['problem-col', 'strategy-col'], 2);
  const blocks = [
    marker,
    grid,
    gridColumnBlock('problem-col', 'grid-cards', 0.5, ['problem-title', 'problem-1']),
    headingBlock('problem-title', 'problem-col', 3, [textRun('Problem')]),
    bulletBlock('problem-1', 'problem-col', [textRun('Each row may contain many vectors.')]),
    gridColumnBlock('strategy-col', 'grid-cards', 0.5, ['strategy-title', 'strategy-1']),
    headingBlock('strategy-title', 'strategy-col', 3, [textRun('Strategy')]),
    bulletBlock('strategy-1', 'strategy-col', [textRun('Use an approximate first-stage retrieval method.')]),
  ];

  const markdown = await createWriter(blocks).__markdown([marker, grid], 0);

  assert.match(markdown, /<Grid columnSize="2" widthRatios="0.5,0.5">/);
  assert.doesNotMatch(markdown, /<FeatureCardGrid/);
  assert.doesNotMatch(markdown, /zdoc:feature-card-grid/);
}

async function testBaseTablesRetriesPrematureClose() {
  const originalLoad = Module._load;
  const originalRetryDelay = process.env.FEISHU_RETRY_DELAY_MS;
  process.env.FEISHU_RETRY_DELAY_MS = '1';
  process.env.FEISHU_HOST = 'https://open.feishu.cn';

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
              items: [{ table_id: 'tbl', name: 'Docs' }],
              has_more: false,
            },
          }),
        };
      };
    }

    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('./larkDocWriter')];
  delete require.cache[require.resolve('./feishuFetch')];

  try {
    const WriterWithMockedFetch = require('./larkDocWriter');
    const writer = new WriterWithMockedFetch('', 'base:*', 'default');
    try {
      const tables = await writer.__base_tables('tenant-token');

      assert.equal(attempts, 2);
      assert.deepEqual(tables.map(table => table.table_id), ['tbl']);
    } finally {
      writer.destroy();
    }
  } finally {
    Module._load = originalLoad;
    if (originalRetryDelay === undefined) {
      delete process.env.FEISHU_RETRY_DELAY_MS;
    } else {
      process.env.FEISHU_RETRY_DELAY_MS = originalRetryDelay;
    }
    delete require.cache[require.resolve('./larkDocWriter')];
    delete require.cache[require.resolve('./feishuFetch')];
  }
}

async function testCodeBlocksInferLanguageWhenFeishuOmitsLanguage() {
  const writer = createWriter([]);
  const python = await writer.__code(
    codeBlock('code-python', 'page', 'from pymilvus import MilvusClient\n\ncollections = client.list_collections()').code,
    0,
    null,
    null,
    []
  );
  const java = await writer.__code(
    codeBlock('code-java', 'page', 'import io.milvus.v2.client.MilvusClientV2;\n\nString TOKEN = "YOUR_CLUSTER_TOKEN";').code,
    0,
    null,
    null,
    []
  );

  assert.match(python, /^```python\n/);
  assert.match(java, /^```java\n/);
  assert.doesNotMatch(python + java, /```plaintext/);
}

async function testCodeTabGroupKeepsInferredMiddleLanguageInsideTabs() {
  const blocks = [
    codeBlock('code-python', 'page', 'from pymilvus import MilvusClient\nclient.create_collection(collection_name="c", schema=schema)', { language: 49 }),
    codeBlock('code-java', 'page', 'import io.milvus.param.Constant;\nclient.createCollection(request);', { language: 29 }),
    codeBlock('code-js', 'page', 'client.create_collection({ collection_name: "c", schema })', { language: 30 }),
    codeBlock('code-go', 'page', 'err = client.CreateCollection(ctx, option)\nfmt.Println("collection created")', { language: 22 }),
    codeBlock('code-bash', 'page', [
      'export params=\'{',
      '  "mmap.enabled": true',
      '}\'',
      '',
      'curl --request POST \\',
      '--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create"',
    ].join('\n'), { wrap: false }),
    codeBlock('code-cpp', 'page', 'auto status = client->CreateCollection(milvus::CreateCollectionRequest());', { language: 9 }),
  ];
  const writer = createWriter(blocks);
  const markdown = await writer.__markdown(blocks, 0);
  const lines = markdown.split('\n');
  let depth = 0;

  for (const line of lines) {
    if (/<TabItem\b/.test(line)) {
      assert.ok(depth > 0, `orphan TabItem rendered outside Tabs: ${line}`);
    }
    if (/<Tabs\b/.test(line)) depth += 1;
    if (/<\/Tabs>/.test(line)) depth -= 1;
  }

  assert.match(markdown, /"label":"cURL","value":"bash"/);
  assert.match(markdown, /"label":"C\+\+","value":"c\+\+"/);
  assert.match(markdown, /<TabItem value='bash'>/);
  assert.match(markdown, /<TabItem value='c\+\+'>/);
  assert.equal(depth, 0);
}

function testSourceIndexDelegatesLookupHelpersWithoutFilesystemEnumeration() {
  const calls = [];
  const indexedSource = { title: 'Indexed', slug: 'indexed', node_token: 'indexed-token' };
  const sourceIndex = {
    find(type, value, options) {
      calls.push({ method: 'find', type, value, options });
      return value === 'missing' ? undefined : indexedSource;
    },
    findAnyToken(token) {
      calls.push({ method: 'findAnyToken', token });
      return indexedSource;
    },
    findBaseSourceMeta(options) {
      calls.push({ method: 'findBaseSourceMeta', options });
      return indexedSource;
    },
  };
  const mediaResolver = { resolveFeishuImage() {} };
  const writer = new LarkDocWriter(
    'root', 'base:*', 'default', '/missing/indexed-sources', 'static/img',
    'zilliz.saas', true, false, null, mediaResolver, sourceIndex
  );
  const readdirSync = fs.readdirSync;
  let enumerations = 0;
  fs.readdirSync = function countedReaddir(...args) {
    enumerations += 1;
    return readdirSync.apply(this, args);
  };

  try {
    assert.equal(writer.mediaResolver, mediaResolver);
    assert.equal(writer.sourceIndex, sourceIndex);
    assert.equal(writer.__fetch_doc_source(['token', 'obj_token'], 'indexed-token', 'indexed'), indexedSource);
    assert.equal(writer.__fetch_doc_source('node_token', 'indexed-token'), indexedSource);
    assert.equal(writer.__fetch_doc_source_by_any_token('indexed-token'), indexedSource);
    assert.equal(writer.__fetch_base_source_meta('Indexed', 'indexed', 'indexed-token'), indexedSource);
    assert.throws(
      () => writer.__fetch_doc_source('node_token', 'missing', 'missing-slug'),
      /Cannot find missing in \/missing\/indexed-sources/
    );
  } finally {
    fs.readdirSync = readdirSync;
    writer.destroy();
  }

  assert.equal(enumerations, 0);
  assert.deepEqual(calls, [
    {
      method: 'find',
      type: ['token', 'obj_token'],
      value: 'indexed-token',
      options: { slug: 'indexed' },
    },
    {
      method: 'find',
      type: 'node_token',
      value: 'indexed-token',
      options: { slug: '' },
    },
    { method: 'findAnyToken', token: 'indexed-token' },
    {
      method: 'findBaseSourceMeta',
      options: { title: 'Indexed', slug: 'indexed', token: 'indexed-token' },
    },
    {
      method: 'find',
      type: 'node_token',
      value: 'missing',
      options: { slug: 'missing-slug' },
    },
  ]);
}

function testNullAndOmittedSourceIndexKeepLegacyFilesystemLookupSemantics() {
  const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-writer-index-fallback-'));
  const omittedWriter = new LarkDocWriter('root', 'base:*', 'default', sourceDir);
  const nullWriter = new LarkDocWriter(
    'root', 'base:*', 'default', sourceDir, 'static/img',
    'zilliz.saas', false, false, null, null, null
  );
  fs.writeFileSync(path.join(sourceDir, 'first.json'), JSON.stringify({
    title: 'First',
    slug: 'first',
    node_token: 'node-first',
    origin_node_token: 'origin-first',
    base_record_id: 'rec-first',
  }));
  fs.writeFileSync(path.join(sourceDir, 'duplicate-first.json'), JSON.stringify({
    title: 'Duplicate First',
    slug: 'duplicate-first',
    node_token: 'duplicate-token',
  }));
  fs.writeFileSync(path.join(sourceDir, 'duplicate-second.json'), JSON.stringify({
    title: 'Duplicate Second',
    slug: 'duplicate-second',
    node_token: 'duplicate-token',
  }));

  try {
    assert.equal(omittedWriter.sourceIndex, null);
    assert.equal(nullWriter.sourceIndex, null);
    assert.equal(omittedWriter.__fetch_doc_source('node_token', 'node-first').title, 'First');
    assert.equal(nullWriter.__fetch_doc_source('node_token', 'duplicate-token', 'duplicate-second').title, 'Duplicate Second');
    assert.equal(omittedWriter.__fetch_doc_source('node_token', 'duplicate-token', 'missing-slug'), undefined);
    assert.equal(nullWriter.__fetch_doc_source_by_any_token('origin-first').title, 'First');
    assert.equal(omittedWriter.__fetch_doc_source_by_any_token('missing-token'), null);
    assert.equal(
      omittedWriter.__fetch_base_source_meta('First', 'first', 'origin-first').base_record_id,
      'rec-first'
    );
    assert.equal(nullWriter.__fetch_base_source_meta('Missing', 'missing'), null);
    assert.throws(
      () => omittedWriter.__fetch_doc_source('node_token', 'missing-token'),
      error => {
        assert.equal(error.message, `2. Cannot find missing-token in ${sourceDir}`);
        return true;
      }
    );
  } finally {
    omittedWriter.destroy();
    nullWriter.destroy();
    fs.rmSync(sourceDir, { recursive: true, force: true });
  }
}

async function run() {
  testExampleHttpUrlsPreservesRawExampleUrls();
  testExampleHttpUrlsSkipsInlineCodeSpans();
  testExampleHttpUrlsSkipsFencedCodeBlocks();
  testKeywordPickerUsesStableSeed();
  testHeadingSlugDropsVisibilitySuffixes();
  await testConvertedHeadingLinkDropsVisibilitySuffixes();
  await testConvertedAnchorLinkToleratesTargetWithoutBlocks();
  testFeatureCardMarkerParserAcceptsReadableSpacing();
  await testCalloutPreservesMarkdownBody();
  await testQuotePreservesMarkdownBody();
  await testCalloutWarningUsesWarningType();
  await testCalloutDestructiveSentenceKeepsDangerAndMovesTitleToBody();
  await testQuoteWarningUsesWarningType();
  await testGridWithHeadingColumnsRendersFeatureCards();
  await testGridWithoutHeadingColumnKeepsGenericGrid();
  await testMarkedGridWithoutHeadingFallsBackAndSuppressesMarker();
  await testMarkedGridWithUnsupportedIconFallsBackAndSuppressesMarker();
  await testFeatureCardMarkerWithoutIconsFallsBackAndSuppressesMarker();
  await testCodeBlocksInferLanguageWhenFeishuOmitsLanguage();
  await testCodeTabGroupKeepsInferredMiddleLanguageInsideTabs();
  testSourceIndexDelegatesLookupHelpersWithoutFilesystemEnumeration();
  testNullAndOmittedSourceIndexKeepLegacyFilesystemLookupSemantics();
  await testBaseTablesRetriesPrematureClose();
  console.log('larkDocWriter tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
