const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const os = require('node:os');
const path = require('node:path');
const LarkDocWriter = require('./larkDocWriter');
const LarkSourceIndex = require('./larkSourceIndex');

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

function sourceSyncedBlock(block_id, parent_id, children) {
  return {
    block_id,
    block_type: 49,
    parent_id,
    source_synced: {},
    children,
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
  const rehypeKatex = (await import('rehype-katex')).default;
  return compile(`import Admonition from '@theme/Admonition';\n\n${markdown}`, {
    development: false,
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
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

async function testStyledWhitespaceClosesMarkdownSpans() {
  const cases = [
    {style: 'bold', decorator: '**'},
    {style: 'italic', decorator: '*'},
    {style: 'strikethrough', decorator: '~~'},
    {style: 'inline_code', decorator: '`'},
  ];

  for (const {style, decorator} of cases) {
    const markdown = await createWriter([]).__text_elements([
      textRun('label', {[style]: true}),
      textRun(' ', {[style]: true}),
      textRun('description'),
    ]);

    assert.equal(markdown, `${decorator}label${decorator} description`);
  }
}

async function testStyledWhitespaceKeepsAContinuousMarkdownSpan() {
  const markdown = await createWriter([]).__text_elements([
    textRun('first', {bold: true}),
    textRun(' ', {bold: true}),
    textRun('second', {bold: true}),
    textRun(' description'),
  ]);

  assert.equal(markdown, '**first second** description');
}

async function testStyledWhitespacePreservesCombinedMarkdownSpans() {
  const markdown = await createWriter([]).__text_elements([
    textRun('label', {bold: true, italic: true}),
    textRun(' ', {bold: true, italic: true}),
    textRun('description'),
  ]);

  assert.equal(markdown, '***label*** description');
}

async function testProseDollarsDoNotBecomeMathDelimiters() {
  const writer = createWriter([]);

  // Real Chinese source shapes that caused unicodeTextInMathMode warnings:
  // currency amounts in one prose run and repeated $meta identifiers split
  // across styled runs. Genuine equations arrive as equation elements instead.
  const currencyRuns = [textRun('$2.38 是最终价格，而 $2.46 是挂牌价格。')];
  const dynamicFieldRuns = [
    textRun('纳入一个名为 '),
    textRun('$meta', {bold: true}),
    textRun(' 的字段，并将所有未在 Schema 中定义的字段以键值对的方式存放到 '),
    textRun('$meta', {bold: true}),
    textRun(' 字段中。'),
  ];
  const currency = await writer.__text_elements(currencyRuns);
  const dynamicField = await writer.__text_elements(dynamicFieldRuns);
  const inlineCode = await writer.__text_elements([
    textRun('$meta', {inline_code: true}),
  ]);
  const equation = await writer.__text_elements([
    {equation: {content: 'x + y', text_element_style: {}}},
  ]);

  assert.equal(currency, '&#36;2.38 是最终价格，而 &#36;2.46 是挂牌价格。');
  assert.equal(
    dynamicField,
    '纳入一个名为 **&#36;meta** 的字段，并将所有未在 Schema 中定义的字段以键值对的方式存放到 **&#36;meta** 字段中。'
  );
  assert.equal(inlineCode, '`$meta`');
  assert.equal(equation, '$$\nx + y\n$$\n');
  assert.equal(currencyRuns[0].text_run.content, '$2.38 是最终价格，而 $2.46 是挂牌价格。');
  assert.equal(dynamicFieldRuns[1].text_run.content, '$meta');
  const compiledCurrency = await assertMdxCompiles(currency);
  const compiledDynamicField = await assertMdxCompiles(dynamicField);
  assert.doesNotMatch(String(compiledCurrency), /katex/);
  assert.doesNotMatch(String(compiledDynamicField), /katex/);
}

async function testBoldEndingWithPunctuationBeforeTextUsesHtmlPair() {
  const markdown = await createWriter([]).__text_elements([
    textRun('结构化字段：', { bold: true }),
    textRun('包含时间戳、执行耗时。'),
  ]);

  assert.equal(markdown, '<strong>结构化字段：</strong>包含时间戳、执行耗时。');
  await assertMdxCompiles(markdown);
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

async function testHeadingsPreserveInlineLessThanOperatorsAndCustomAnchors() {
  const writer = createWriter([]);
  const lessThan = await writer.__heading({elements: [
    textRun('示例 4：使用小于'),
    textRun('（'),
    textRun('<', {inline_code: true}),
    textRun('）操作符过滤'),
    textRun('{#example-4-filtering-with-less-than}'),
  ]}, 3);
  const lessThanOrEqual = await writer.__heading({elements: [
    textRun('示例 6：使用小于或等于'),
    textRun('（'),
    textRun('<=', {inline_code: true}),
    textRun('）操作符过滤'),
    textRun('{#example-6-filtering-with-less-than-or-equal-to}'),
  ]}, 3);

  assert.equal(
    lessThan,
    '### 示例 4：使用小于（`<`）操作符过滤{#example-4-filtering-with-less-than}'
  );
  assert.equal(
    lessThanOrEqual,
    '### 示例 6：使用小于或等于（`<=`）操作符过滤{#example-6-filtering-with-less-than-or-equal-to}'
  );
}

async function testHeadingStripsEmphasisButKeepsInlineCode() {
  const writer = createWriter([]);

  // Feishu bold headings become plain heading text: site CSS already renders
  // headings bold, and nested <strong> inside a heading adds no value.
  const bold = await writer.__heading({elements: [
    textRun('Tier 1 \u2013 Mission-Critical Workloads', { bold: true }),
    textRun('{#tier-1-mission-critical-workloads}'),
  ]}, 4);
  assert.equal(
    bold,
    '#### Tier 1 \u2013 Mission-Critical Workloads{#tier-1-mission-critical-workloads}'
  );

  // Inline code is semantic content in headings and must survive the strip.
  const code = await writer.__heading({elements: [
    textRun('Step 2: Update '),
    textRun('data.tf', { inline_code: true }),
  ]}, 2);
  assert.equal(code, '## Step 2: Update `data.tf`{#step-2-update-datatf}');
}

async function testHeadingRepairsMangledAnchor() {
  const writer = createWriter([]);

  // A translation glitch can drop the '#' from a heading anchor, leaving a bare
  // "{slug}" as a standalone trailing text_run. __heading must restore it so the
  // heading keeps its custom anchor instead of compiling a subtraction expression
  // that crashes SSG (ReferenceError: verify is not defined).
  const repaired = await writer.__heading({elements: [
    textRun('验证连接'),
    textRun('{verify-the-connection}'),
  ]}, 3);
  assert.equal(repaired, '### 验证连接{#verify-the-connection}');

  // An already-correct "{#...}" anchor is left untouched (idempotent).
  const intact = await writer.__heading({elements: [
    textRun('验证连接'),
    textRun('{#verify-the-connection}'),
  ]}, 3);
  assert.equal(intact, '### 验证连接{#verify-the-connection}');

  // A non-ASCII brace group is not a slug and must not be rewritten into an
  // anchor; the MDX brace-escaping pass handles it as literal text downstream.
  const literal = await writer.__heading({elements: [
    textRun('使用'),
    textRun('{参数}'),
  ]}, 3);
  assert.ok(literal.includes('{参数}'), 'expected literal placeholder to be preserved');
  assert.ok(!literal.includes('{#参数}'), 'expected literal placeholder not to become an anchor');
}

function testHeadingCleanupStillRemovesActualHtmlTags() {
  const writer = createWriter([]);
  assert.equal(
    writer.__clean_headings('<span>Heading</span>{#heading}'),
    'Heading{#heading}'
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

async function testCalloutStripsStyledTitleMarkers() {
  const callout = {
    block_id: 'callout-styled',
    block_type: 19,
    callout: { emoji_id: 'blue_book' },
    children: ['styled-title', 'body'],
  };

  const blocks = [
    callout,
    textBlock('styled-title', 'callout-styled', [
      textRun('说明', { bold: true }),
    ]),
    textBlock('body', 'callout-styled', [textRun('正文内容。')]),
  ];

  const markdown = await createWriter(blocks).__callout(callout, 0);

  assert.match(markdown, /<Admonition type="info" icon="📘" title="说明">/);
  assert.doesNotMatch(markdown, /title="\*\*/);

  const warning = {
    block_id: 'callout-warning-styled',
    block_type: 19,
    callout: { emoji_id: 'construction' },
    children: ['warning-title', 'warning-body'],
  };

  const warningBlocks = [
    warning,
    textBlock('warning-title', 'callout-warning-styled', [textRun('警告', { bold: true })]),
    textBlock('warning-body', 'callout-warning-styled', [textRun('警告正文。')]),
  ];

  const warningMarkdown = await createWriter(warningBlocks).__callout(warning, 0);
  assert.match(warningMarkdown, /<Admonition type="warning" icon="🚧" title="警告">/);

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

async function testBaseRecordsRetriesDataNotReadyResponse() {
  const originalLoad = Module._load;
  const originalRetryDelay = process.env.FEISHU_RETRY_DELAY_MS;
  process.env.FEISHU_RETRY_DELAY_MS = '1';
  process.env.FEISHU_HOST = 'https://open.feishu.cn';

  let attempts = 0;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'node-fetch') {
      return async function mockedFetch() {
        attempts += 1;
        return {
          status: 200,
          headers: { get: () => null },
          text: async () => JSON.stringify(attempts === 1 ? {
            code: 1254607,
            msg: 'Data not ready, please try again later',
          } : {
            code: 0,
            data: {
              items: [{ record_id: 'record-1', fields: {} }],
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
      const records = await writer.__base_records('tenant-token', {
        table_id: 'tbl',
        name: '数据表',
      });

      assert.equal(attempts, 2);
      assert.deepEqual(records.map(record => record.record_id), ['record-1']);
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

async function testCodeVariantsFilterBeforeFencing() {
  const blocks = [
    codeBlock('code-python', 'page', [
      'params={',
      '    "provider": "openai",',
      '    # include-next-line zilliz',
      '    "integration_id": "YOUR_INTEGRATION_ID",',
      '    # include-next-line milvus',
      '    "credential": "YOUR_API_KEY",',
      '',
      '    "dim": "1536",',
      '}',
    ].join('\n'), { language: 49 }),
  ];
  const writer = createWriter(blocks);
  writer.targets = 'zilliz.saas';

  try {
    const markdown = await writer.__markdown(blocks, 0);
    assert.match(markdown, /```python\nparams=\{\n    "provider": "openai",\n    "integration_id": "YOUR_INTEGRATION_ID",\n\n    "dim": "1536",\n\}\n```/);
    assert.doesNotMatch(markdown, /include-next-line|credential/);
    assert.doesNotMatch(markdown, /openai",\n\n    "integration_id/);
  } finally {
    writer.destroy();
  }
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

async function testCodeTabGroupCrossesSourceSyncedBoundary() {
  const blocks = [
    sourceSyncedBlock('synced-code', 'page', ['code-python', 'code-java']),
    codeBlock('code-python', 'synced-code', 'from pymilvus import MilvusClient', { language: 49 }),
    codeBlock('code-java', 'synced-code', 'import io.milvus.param.Constant;', { language: 29 }),
    codeBlock('code-cpp', 'page', 'auto status = client->Search(request, response);', { language: 9 }),
  ];
  const writer = createWriter(blocks);
  const markdown = await writer.__markdown([blocks[0], blocks[3]], 0);

  assert.match(markdown, /"label":"C\+\+","value":"c\+\+"/);
  assert.match(markdown, /<TabItem value='c\+\+'>/);
  assert.doesNotMatch(markdown, /<\/Tabs>\s*```c\+\+/);
  await assertMdxCompiles(markdown);
}

async function testBulletPreservesInlineLineBreaks() {
  const blocks = [
    bulletBlock('parameter', 'page', [
      textRun('collection_name', { bold: true }),
      textRun(' (str) -\n'),
      textRun('[REQUIRED]', { bold: true }),
      textRun('\nThe name of the target collection.'),
    ]),
  ];
  const writer = createWriter(blocks);
  const markdown = await writer.__markdown(blocks, 0);

  assert.equal(markdown.trimEnd(), '- **collection_name** (str) -<br/>\n  **[REQUIRED]**<br/>\n  The name of the target collection.');
  await assertMdxCompiles(markdown);
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

function testSourceIndexSourcesAreClonedBeforeWriterMutation() {
  const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-writer-clone-index-'));
  fs.writeFileSync(path.join(sourceDir, 'source.json'), JSON.stringify({
    title: 'Indexed',
    slug: 'indexed',
    node_token: 'indexed-token',
    blocks: {
      items: [
        {
          block_id: 'paragraph',
          block_type: 2,
          text: {
            elements: [
              {
                text_run: {
                  content: 'price is $5',
                  text_element_style: {},
                },
              },
            ],
          },
        },
      ],
    },
  }));
  const sourceIndex = LarkSourceIndex.load(sourceDir);
  const writer = new LarkDocWriter(
    'root', 'base:*', 'default', sourceDir, 'static/img',
    'zilliz.saas', true, false, null, null, sourceIndex
  );

  try {
    const source = writer.__fetch_doc_source_by_any_token('indexed-token');
    assert.equal(Object.isFrozen(source), false);
    assert.equal(Object.isFrozen(source.blocks.items[0].text.elements[0].text_run), false);
    source.blocks.items[0].text.elements[0].text_run.content = 'mutated';
  } finally {
    writer.destroy();
    fs.rmSync(sourceDir, { recursive: true, force: true });
  }
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
  await testStyledWhitespaceClosesMarkdownSpans();
  await testStyledWhitespaceKeepsAContinuousMarkdownSpan();
  await testStyledWhitespacePreservesCombinedMarkdownSpans();
  await testProseDollarsDoNotBecomeMathDelimiters();
  await testBoldEndingWithPunctuationBeforeTextUsesHtmlPair();
  testKeywordPickerUsesStableSeed();
  testHeadingSlugDropsVisibilitySuffixes();
  await testHeadingsPreserveInlineLessThanOperatorsAndCustomAnchors();
  await testHeadingStripsEmphasisButKeepsInlineCode();
  await testHeadingRepairsMangledAnchor();
  testHeadingCleanupStillRemovesActualHtmlTags();
  await testConvertedHeadingLinkDropsVisibilitySuffixes();
  await testConvertedAnchorLinkToleratesTargetWithoutBlocks();
  testFeatureCardMarkerParserAcceptsReadableSpacing();
  await testCalloutPreservesMarkdownBody();
  await testCalloutStripsStyledTitleMarkers();
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
  await testCodeVariantsFilterBeforeFencing();
  await testCodeTabGroupKeepsInferredMiddleLanguageInsideTabs();
  await testBulletPreservesInlineLineBreaks();
  await testCodeTabGroupCrossesSourceSyncedBoundary();
  testSourceIndexDelegatesLookupHelpersWithoutFilesystemEnumeration();
  testSourceIndexSourcesAreClonedBeforeWriterMutation();
  testNullAndOmittedSourceIndexKeepLegacyFilesystemLookupSemantics();
  await testBaseTablesRetriesPrematureClose();
  await testBaseRecordsRetriesDataNotReadyResponse();
  console.log('larkDocWriter tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
