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

async function run() {
  await testConvertLinkResolvesWikiByNodeTokenWhenOriginMissing();
  await testConvertLinkResolvesWikiByOriginTokenForBackwardCompatibility();
  testWikiSourceFileTokenFallback();
  console.log('lark-docs regression tests passed');
}

run();
