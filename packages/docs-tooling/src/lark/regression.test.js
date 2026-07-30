const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const larkDocWriter = require('./larkDocWriter');
const larkDocScraper = require('./larkDocScraper');

function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-docs-regression-'));
  try {
    return callback(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function testConvertLinkResolvesWikiByNodeTokenWhenOriginMissing() {
  await withTempDir(async dir => {
    const token = 'HxWmwteOEi1Egukx26pcBnnknSd';
    const source = {
      node_token: token,
      origin_node_token: '',
      slug: 'cli-and-agent-integration-guide',
      title: 'Quickstart to CLI & Agent Integration',
      blocks: { items: [] },
    };

    fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify(source, null, 2));

    const writer = new larkDocWriter('', '', '', dir);
    const result = await writer.__convert_link(`https://zilliverse.feishu.cn/wiki/${token}`);

    assert.equal(result, './cli-and-agent-integration-guide');
  });
}

async function testConvertLinkResolvesWikiByOriginTokenForBackwardCompatibility() {
  await withTempDir(async dir => {
    const token = 'OriginToken123';
    const source = {
      node_token: 'DifferentNodeToken123',
      origin_node_token: token,
      slug: 'legacy-page',
      title: 'Legacy Page',
      blocks: { items: [] },
    };

    fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify(source, null, 2));

    const writer = new larkDocWriter('', '', '', dir);
    const result = await writer.__convert_link(`https://zilliverse.feishu.cn/wiki/${token}`);

    assert.equal(result, './legacy-page');
  });
}

async function testConvertLinkCanonicalizesCliOverviewRoute() {
  const writer = new larkDocWriter('', '', '', '/tmp');

  assert.equal(
    await writer.__convert_link('/reference/cli/overview'),
    '/reference/cli/cli/overview'
  );
  assert.equal(
    await writer.__convert_link('https://docs.zilliz.com/reference/cli/overview'),
    '/reference/cli/cli/overview'
  );
}

function testWikiSourceFileTokenFallback() {
  const scraper = new larkDocScraper('', '', 'wiki', '/tmp');
  assert.equal(
    scraper.__resolve_wiki_file_token({ origin_node_token: '', node_token: 'HxWmwteOEi1Egukx26pcBnnknSd' }),
    'HxWmwteOEi1Egukx26pcBnnknSd'
  );
  assert.equal(
    scraper.__resolve_wiki_file_token({ origin_node_token: 'OriginToken123', node_token: 'NodeToken456' }),
    'OriginToken123'
  );
}

function textBlock(blockId, content) {
  return {
    block_id: blockId,
    block_type: 2,
    text: {
      elements: [{
        text_run: {
          content,
          text_element_style: {},
        },
      }],
    },
  };
}

function tableCell(blockId, children = []) {
  return {
    block_id: blockId,
    block_type: 32,
    children,
  };
}

async function testTableDropsColumnsThatAreEmptyInEveryRow() {
  const writer = new larkDocWriter('', '', '', '/tmp');
  writer.page_blocks = [
    tableCell('cell-1', ['text-1']),
    textBlock('text-1', 'Cluster Type'),
    tableCell('cell-2'),
    tableCell('cell-3', ['text-3']),
    textBlock('text-3', 'Performance-optimized'),
    tableCell('cell-4'),
  ];

  const table = await writer.__table({
    cells: ['cell-1', 'cell-2', 'cell-3', 'cell-4'],
    property: {
      row_size: 2,
      column_size: 2,
      merge_info: [
        { row_span: 1, col_span: 1 },
        { row_span: 1, col_span: 1 },
        { row_span: 1, col_span: 1 },
        { row_span: 1, col_span: 1 },
      ],
    },
  }, 0);

  assert.match(table, /Cluster Type/);
  assert.match(table, /Performance-optimized/);
  assert.doesNotMatch(table, /\|\s+\|\s+\|/);
  assert.equal((table.match(/\|/g) || []).length, 6);
}

async function testSheetCellConvertsFeishuWikiUrl() {
  await withTempDir(async dir => {
    const token = 'SheetLinkedWikiToken';
    fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify({
      node_token: token,
      origin_node_token: token,
      slug: 'dedicated-cluster-cost',
      title: 'Dedicated Cluster Cost',
      blocks: { items: [] },
    }, null, 2));

    const writer = new larkDocWriter('', '', '', dir);
    const html = await writer.__sheet({
      meta: { data: { sheet: {} } },
      values: {
        data: {
          valueRange: {
            values: [
              ['Item'],
              [[{
                link: `https://zilliverse.feishu.cn/wiki/${token}`,
                text: 'Compute (CU)',
                type: 'url',
              }]],
            ],
          },
        },
      },
    }, 0);

    assert.match(html, /\[Compute \(CU\)\]\(\.\/dedicated-cluster-cost\)/);
    assert.doesNotMatch(html, /zilliverse\.feishu\.cn/);
  });
}

async function testIframeImageUrlEscapesSpacesInGeneratedMarkdown() {
  const writer = new larkDocWriter('', '', '', '/tmp', 'static/img', 'zilliz.saas', true, true);
  writer.downloader = {
    __fetchCaption: async () => ({
      nodes: {
        '1:2': {
          document: {
            name: 'Group 427326000',
          },
        },
      },
    }),
  };

  const markdown = await writer.__iframe({
    block_id: 'iframe-1',
    iframe: {
      component: {
        iframe_type: 8,
        url: encodeURIComponent('https://www.figma.com/file/test?node-id=1-2'),
      },
    },
  });

  assert.equal(
    markdown,
    '![Group 427326000](https://zdoc-images.s3.us-west-2.amazonaws.com/Group%20427326000.png "Group 427326000")'
  );
}

async function testBoardImageUrlUsesEscapedMarkdownUrl() {
  const writer = new larkDocWriter('', '', '', '/tmp', 'static/img', 'zilliz.saas', true, false);
  const markdown = await writer.__board({ token: 'board token' }, 2);

  assert.equal(markdown, '  ![board token](/img/board%20token.png)');
}

function testDescriptionSkipsFeatureNoteBlocks() {
  const writer = new larkDocWriter('', '', '', '/tmp');
  const markdown = [
    '# Manage Collections',
    '',
    '<FeatureNote variant="plan" titleHref="/docs/pricing">',
    '',
    'Available on paid plans.',
    '',
    '</FeatureNote>',
    '',
    'Create and manage collections in Zilliz Cloud.',
  ].join('\n');

  assert.equal(
    writer.__extract_description(markdown),
    'Create and manage collections in Zilliz Cloud.'
  );
}

async function run() {
  await testConvertLinkResolvesWikiByNodeTokenWhenOriginMissing();
  await testConvertLinkResolvesWikiByOriginTokenForBackwardCompatibility();
  await testConvertLinkCanonicalizesCliOverviewRoute();
  testWikiSourceFileTokenFallback();
  await testTableDropsColumnsThatAreEmptyInEveryRow();
  await testSheetCellConvertsFeishuWikiUrl();
  await testIframeImageUrlEscapesSpacesInGeneratedMarkdown();
  await testBoardImageUrlUsesEscapedMarkdownUrl();
  testDescriptionSkipsFeatureNoteBlocks();
  console.log('lark-docs regression tests passed');
}

run();
