const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const larkUtils = require('./larkUtils');

function writeJson(dir, token, source) {
  fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify(source, null, 2));
}

function readJson(dir, token) {
  return JSON.parse(fs.readFileSync(path.join(dir, `${token}.json`), 'utf8'));
}

function withTempSourceDirs(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-utils-'));
  const sourceDir = path.join(dir, 'source');
  const fallbackDir = path.join(dir, 'fallback');
  fs.mkdirSync(sourceDir);
  fs.mkdirSync(fallbackDir);

  try {
    callback(sourceDir, fallbackDir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function testDriveFallbackMatchesUnsluggedFoldersByTitleAndParent() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'F9M3fK4Dbl69PPdSxTXcsIwgnDh', {
      token: 'F9M3fK4Dbl69PPdSxTXcsIwgnDh',
      name: 'v3.0.0',
      children: [
        {
          name: 'Client',
          token: 'P8hMfnsOjlir3rdvsKDcEQG8nCc',
          parent_token: 'F9M3fK4Dbl69PPdSxTXcsIwgnDh',
          type: 'folder',
        },
      ],
    });
    writeJson(sourceDir, 'P8hMfnsOjlir3rdvsKDcEQG8nCc', {
      token: 'P8hMfnsOjlir3rdvsKDcEQG8nCc',
      name: 'Client',
      type: 'folder',
      slug: 'v2-Client',
      parent_token: 'F9M3fK4Dbl69PPdSxTXcsIwgnDh',
      children: [
        {
          name: 'ClientConfig',
          token: 'NNQmdw1DloRDi6xeO0acaMfdnib',
          parent_token: 'P8hMfnsOjlir3rdvsKDcEQG8nCc',
          type: 'docx',
        },
      ],
    });
    writeJson(sourceDir, 'NNQmdw1DloRDi6xeO0acaMfdnib', {
      token: 'NNQmdw1DloRDi6xeO0acaMfdnib',
      name: 'ClientConfig',
      type: 'docx',
      slug: 'v2-Client-ClientConfig',
      parent_token: 'P8hMfnsOjlir3rdvsKDcEQG8nCc',
      blocks: { items: [{ block_id: 'source-block' }] },
    });

    writeJson(fallbackDir, 'Pzejf3x4WlXq1HdtTndcfMjVnxh', {
      token: 'Pzejf3x4WlXq1HdtTndcfMjVnxh',
      name: 'v2.6.x',
      children: [
        {
          name: 'Client',
          token: 'X06jf5CQ7lPN7wd68CFcUJ0Kn6g',
          parent_token: 'Pzejf3x4WlXq1HdtTndcfMjVnxh',
          type: 'folder',
        },
      ],
    });
    writeJson(fallbackDir, 'X06jf5CQ7lPN7wd68CFcUJ0Kn6g', {
      token: 'X06jf5CQ7lPN7wd68CFcUJ0Kn6g',
      name: 'Client',
      type: 'folder',
      parent_token: 'Pzejf3x4WlXq1HdtTndcfMjVnxh',
      children: [
        {
          name: 'ClientConfig',
          token: 'B7eadZ3KboNCSzxGyhDcGLCIn6e',
          parent_token: 'X06jf5CQ7lPN7wd68CFcUJ0Kn6g',
          type: 'docx',
        },
      ],
    });
    writeJson(fallbackDir, 'B7eadZ3KboNCSzxGyhDcGLCIn6e', {
      token: 'B7eadZ3KboNCSzxGyhDcGLCIn6e',
      name: 'ClientConfig',
      type: 'docx',
      slug: 'v2-Client-ClientConfig',
      parent_token: 'X06jf5CQ7lPN7wd68CFcUJ0Kn6g',
      blocks: { items: [{ block_id: 'fallback-block' }] },
    });

    new larkUtils().fetch_fallback_sources(
      sourceDir,
      fallbackDir,
      'drive',
      'F9M3fK4Dbl69PPdSxTXcsIwgnDh'
    );

    const root = readJson(sourceDir, 'F9M3fK4Dbl69PPdSxTXcsIwgnDh');
    assert.equal(
      root.children.some(child => child.token === 'B7eadZ3KboNCSzxGyhDcGLCIn6e'),
      false
    );

    const client = readJson(sourceDir, 'P8hMfnsOjlir3rdvsKDcEQG8nCc');
    assert.equal(client.slug, 'v2-Client');
    assert.deepEqual(
      client.children.filter(child => child.name === 'ClientConfig').map(child => child.token),
      ['NNQmdw1DloRDi6xeO0acaMfdnib']
    );
    assert.equal(
      fs.existsSync(path.join(sourceDir, 'B7eadZ3KboNCSzxGyhDcGLCIn6e.json')),
      false
    );
  });
}

function testPreProcessRemovesRootMarkdownFiles() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-utils-preprocess-'));

  try {
    fs.writeFileSync(path.join(dir, 'stale-root.md'), 'stale');
    fs.mkdirSync(path.join(dir, 'nested'));
    fs.writeFileSync(path.join(dir, 'nested', 'stale-nested.md'), 'stale');

    new larkUtils().pre_process_file_paths(dir);

    assert.equal(fs.existsSync(path.join(dir, 'stale-root.md')), false);
    assert.equal(fs.existsSync(path.join(dir, 'nested')), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function testPreProcessPreservesSelectedFiles() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-utils-preprocess-preserve-'));

  try {
    const overview = path.join(dir, 'api', 'python', 'python', 'python.md');
    const stale = path.join(dir, 'api', 'python', 'python', 'stale.md');
    const emptyNested = path.join(dir, 'api', 'python', 'python', 'empty');
    fs.mkdirSync(path.dirname(overview), { recursive: true });
    fs.mkdirSync(emptyNested);
    fs.writeFileSync(overview, 'overview');
    fs.writeFileSync(stale, 'stale');

    new larkUtils().pre_process_file_paths(dir, [overview]);

    assert.equal(fs.existsSync(overview), true);
    assert.equal(fs.existsSync(stale), false);
    assert.equal(fs.existsSync(emptyNested), false);
    assert.equal(fs.existsSync(path.dirname(overview)), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function testPreProcessPreservesHomeByDefault() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-utils-preprocess-home-'));

  try {
    fs.writeFileSync(path.join(dir, 'home.md'), 'home');
    fs.writeFileSync(path.join(dir, 'stale-root.md'), 'stale');

    new larkUtils().pre_process_file_paths(dir);

    assert.equal(fs.existsSync(path.join(dir, 'home.md')), true);
    assert.equal(fs.existsSync(path.join(dir, 'stale-root.md')), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function run() {
  testDriveFallbackMatchesUnsluggedFoldersByTitleAndParent();
  testPreProcessRemovesRootMarkdownFiles();
  testPreProcessPreservesSelectedFiles();
  testPreProcessPreservesHomeByDefault();
  console.log('larkUtils tests passed');
}

run();
