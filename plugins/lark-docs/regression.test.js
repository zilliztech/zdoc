const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const matter = require('gray-matter');

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

  const html = await writer.__table({
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

  assert.match(html, /Cluster Type/);
  assert.match(html, /Performance-optimized/);
  assert.doesNotMatch(html, /<th><\/th>/);
  assert.doesNotMatch(html, /<td><\/td>/);
  assert.equal((html.match(/<th/g) || []).length, 1);
  assert.equal((html.match(/<td/g) || []).length, 1);
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

function testFrontMatterEscapesYamlDoubleQuotedBackslashes() {
  const writer = new larkDocWriter('', '', 'javaSidebar', '/tmp');
  const frontMatter = writer.__front_matters(
    'createRole()',
    'Java | v2',
    'java/v2-Authentication-createRole',
    false,
    false,
    'docx',
    'WJCAdWmpIolcU1x3T3fcZ1J2nWb',
    3,
    'createRole()',
    '',
    'javaSidebar',
    '# createRole()\\{#createrole}'
  );

  const parsed = matter(`${frontMatter}\n\n# createRole()`);

  assert.equal(parsed.data.description, '# createRole()\\{#createrole} | Java | v2');
}

async function run() {
  await testConvertLinkResolvesWikiByNodeTokenWhenOriginMissing();
  await testConvertLinkResolvesWikiByOriginTokenForBackwardCompatibility();
  testWikiSourceFileTokenFallback();
  await testTableDropsColumnsThatAreEmptyInEveryRow();
  await testIframeImageUrlEscapesSpacesInGeneratedMarkdown();
  await testBoardImageUrlUsesEscapedMarkdownUrl();
  testFrontMatterEscapesYamlDoubleQuotedBackslashes();
  console.log('lark-docs regression tests passed');
}

run();
