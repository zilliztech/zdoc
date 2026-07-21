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

function testDriveFallbackRetainsMaterializedTokenWhenReplacementBodyIsMissing() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [
        { name: 'FieldSchema', token: 'NEW_FIELD_FOLDER', parent_token: 'V3_ROOT', type: 'folder' },
      ],
    });
    writeJson(sourceDir, 'NEW_FIELD_FOLDER', {
      token: 'NEW_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V3_ROOT',
      children: [
        { name: 'construct_from_dict()', token: 'NEW_DOC_TOKEN', parent_token: 'NEW_FIELD_FOLDER', type: 'docx' },
      ],
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [
        { name: 'FieldSchema', token: 'OLD_FIELD_FOLDER', parent_token: 'V26_ROOT', type: 'folder' },
      ],
    });
    writeJson(fallbackDir, 'OLD_FIELD_FOLDER', {
      token: 'OLD_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V26_ROOT',
      children: [
        { name: 'construct_from_dict()', token: 'OLD_DOC_TOKEN', parent_token: 'OLD_FIELD_FOLDER', type: 'docx' },
      ],
    });
    writeJson(fallbackDir, 'OLD_DOC_TOKEN', {
      token: 'OLD_DOC_TOKEN',
      name: 'construct_from_dict()',
      slug: 'FieldSchema-construct_from_dict',
      type: 'docx',
      parent_token: 'OLD_FIELD_FOLDER',
      blocks: { items: [{ block_id: 'fallback-page', block_type: 1 }] },
    });

    new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT');

    const fieldSchema = readJson(sourceDir, 'NEW_FIELD_FOLDER');
    assert.deepEqual(fieldSchema.children.map(child => child.token), ['OLD_DOC_TOKEN']);
    const document = readJson(sourceDir, 'OLD_DOC_TOKEN');
    assert.equal(document.token, 'OLD_DOC_TOKEN');
    assert.equal(document.parent_token, 'NEW_FIELD_FOLDER');
    assert.equal(fs.existsSync(path.join(sourceDir, 'NEW_DOC_TOKEN.json')), false);
  });
}

function testDriveFallbackRejectsDanglingChildWhenBothBodiesAreMissing() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [
        { name: 'FieldSchema', token: 'NEW_FIELD_FOLDER', parent_token: 'V3_ROOT', type: 'folder' },
      ],
    });
    writeJson(sourceDir, 'NEW_FIELD_FOLDER', {
      token: 'NEW_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V3_ROOT',
      children: [
        { name: 'construct_from_dict()', token: 'NEW_DOC_TOKEN', parent_token: 'NEW_FIELD_FOLDER', type: 'docx' },
      ],
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [
        { name: 'FieldSchema', token: 'OLD_FIELD_FOLDER', parent_token: 'V26_ROOT', type: 'folder' },
      ],
    });
    writeJson(fallbackDir, 'OLD_FIELD_FOLDER', {
      token: 'OLD_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V26_ROOT',
      children: [
        { name: 'construct_from_dict()', token: 'OLD_DOC_TOKEN', parent_token: 'OLD_FIELD_FOLDER', type: 'docx' },
      ],
    });

    assert.throws(
      () => new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT'),
      /\[fallback-source\] Unresolved child OLD_DOC_TOKEN under NEW_FIELD_FOLDER/
    );
  });
}

function testDriveFallbackRejectsDanglingSourceOnlyChild() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [
        { name: 'FieldSchema', token: 'NEW_FIELD_FOLDER', parent_token: 'V3_ROOT', type: 'folder' },
      ],
    });
    writeJson(sourceDir, 'NEW_FIELD_FOLDER', {
      token: 'NEW_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V3_ROOT',
      children: [
        { name: 'source-only-child', token: 'DANGLING', parent_token: 'NEW_FIELD_FOLDER', type: 'docx' },
      ],
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [
        { name: 'FieldSchema', token: 'OLD_FIELD_FOLDER', parent_token: 'V26_ROOT', type: 'folder' },
      ],
    });
    writeJson(fallbackDir, 'OLD_FIELD_FOLDER', {
      token: 'OLD_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V26_ROOT',
      children: [],
    });

    assert.throws(
      () => new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT'),
      /\[fallback-source\] Unresolved child DANGLING under NEW_FIELD_FOLDER/
    );
  });
}

function testDriveFallbackPrefersMaterializedMappedDocumentOverFallbackSlug() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [
        { name: 'FieldSchema', token: 'NEW_FIELD_FOLDER', parent_token: 'V3_ROOT', type: 'folder' },
      ],
    });
    writeJson(sourceDir, 'NEW_FIELD_FOLDER', {
      token: 'NEW_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V3_ROOT',
      children: [
        { name: 'shared-child', token: 'NEW_DOC', parent_token: 'NEW_FIELD_FOLDER', type: 'docx' },
      ],
    });
    writeJson(sourceDir, 'NEW_DOC', {
      token: 'NEW_DOC',
      name: 'shared-child',
      slug: 'source-child-slug',
      type: 'docx',
      parent_token: 'NEW_FIELD_FOLDER',
      blocks: { items: [{ block_id: 'source-page', block_type: 1 }] },
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [
        { name: 'FieldSchema', token: 'OLD_FIELD_FOLDER', parent_token: 'V26_ROOT', type: 'folder' },
      ],
    });
    writeJson(fallbackDir, 'OLD_FIELD_FOLDER', {
      token: 'OLD_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V26_ROOT',
      children: [
        { name: 'shared-child', token: 'OLD_DOC', parent_token: 'OLD_FIELD_FOLDER', type: 'docx' },
      ],
    });
    writeJson(fallbackDir, 'OLD_DOC', {
      token: 'OLD_DOC',
      name: 'shared-child',
      slug: 'fallback-child-slug',
      type: 'docx',
      parent_token: 'OLD_FIELD_FOLDER',
      blocks: { items: [{ block_id: 'fallback-page', block_type: 1 }] },
    });

    new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT');

    const fieldSchema = readJson(sourceDir, 'NEW_FIELD_FOLDER');
    assert.deepEqual(fieldSchema.children.map(child => child.token), ['NEW_DOC']);

    const document = readJson(sourceDir, 'NEW_DOC');
    assert.equal(document.token, 'NEW_DOC');
    assert.equal(document.slug, 'source-child-slug');
    assert.deepEqual(document.blocks, { items: [{ block_id: 'source-page', block_type: 1 }] });
    assert.equal(fs.existsSync(path.join(sourceDir, 'OLD_DOC.json')), false);
  });
}

function testDriveFallbackRejectsDuplicateTokensInTouchedFolderGraph() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [
        { name: 'FieldSchema', token: 'NEW_FIELD_FOLDER', parent_token: 'V3_ROOT', type: 'folder' },
      ],
    });
    writeJson(sourceDir, 'NEW_FIELD_FOLDER', {
      token: 'NEW_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V3_ROOT',
      children: [
        { name: 'duplicate-child', token: 'DUPLICATE_DOC', parent_token: 'NEW_FIELD_FOLDER', type: 'docx' },
      ],
    });
    writeJson(sourceDir, 'duplicate-a', {
      token: 'DUPLICATE_DOC',
      name: 'duplicate-child-a',
      slug: 'duplicate-child-a',
      type: 'docx',
      parent_token: 'NEW_FIELD_FOLDER',
    });
    writeJson(sourceDir, 'duplicate-b', {
      token: 'DUPLICATE_DOC',
      name: 'duplicate-child-b',
      slug: 'duplicate-child-b',
      type: 'docx',
      parent_token: 'NEW_FIELD_FOLDER',
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [
        { name: 'FieldSchema', token: 'OLD_FIELD_FOLDER', parent_token: 'V26_ROOT', type: 'folder' },
      ],
    });
    writeJson(fallbackDir, 'OLD_FIELD_FOLDER', {
      token: 'OLD_FIELD_FOLDER',
      name: 'FieldSchema',
      slug: 'FieldSchema',
      type: 'folder',
      parent_token: 'V26_ROOT',
      children: [
        { name: 'fallback-only', token: 'FALLBACK_ONLY', parent_token: 'OLD_FIELD_FOLDER', type: 'docx' },
      ],
    });
    writeJson(fallbackDir, 'FALLBACK_ONLY', {
      token: 'FALLBACK_ONLY',
      name: 'fallback-only',
      slug: 'FieldSchema-fallback-only',
      type: 'docx',
      parent_token: 'OLD_FIELD_FOLDER',
    });

    assert.throws(
      () => new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT'),
      /\[fallback-source\] Duplicate token DUPLICATE_DOC in duplicate-a\.json and duplicate-b\.json/
    );
  });
}

function testDriveFallbackIgnoresDuplicateTokensOutsideTouchedFolders() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [],
    });
    writeJson(sourceDir, 'unrelated-a', {
      token: 'UNRELATED_DUP',
      name: 'unrelated-a',
      slug: 'unrelated-a',
      type: 'docx',
      parent_token: 'UNRELATED_FOLDER',
    });
    writeJson(sourceDir, 'unrelated-b', {
      token: 'UNRELATED_DUP',
      name: 'unrelated-b',
      slug: 'unrelated-b',
      type: 'docx',
      parent_token: 'UNRELATED_FOLDER',
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [],
    });

    assert.doesNotThrow(
      () => new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT')
    );
  });
}

function testDriveFallbackRetainsMaterializedRootChildWhenReplacementBodyIsMissing() {
  withTempSourceDirs((sourceDir, fallbackDir) => {
    writeJson(sourceDir, 'V3_ROOT', {
      token: 'V3_ROOT',
      name: 'v3.0.x',
      children: [
        { name: 'FieldSchema', token: 'NEW_FOLDER', parent_token: 'V3_ROOT', type: 'folder' },
      ],
    });

    writeJson(fallbackDir, 'V26_ROOT', {
      token: 'V26_ROOT',
      name: 'v2.6.x',
      children: [
        { name: 'FieldSchema', token: 'OLD_FOLDER', parent_token: 'V26_ROOT', type: 'folder' },
      ],
    });
    writeJson(fallbackDir, 'OLD_FOLDER', {
      token: 'OLD_FOLDER',
      name: 'FieldSchema',
      type: 'folder',
      parent_token: 'V26_ROOT',
      children: [],
    });

    new larkUtils().fetch_fallback_sources(sourceDir, fallbackDir, 'drive', 'V3_ROOT');

    const root = readJson(sourceDir, 'V3_ROOT');
    assert.deepEqual(root.children.map(child => child.token), ['OLD_FOLDER']);
    const folder = readJson(sourceDir, 'OLD_FOLDER');
    assert.equal(folder.token, 'OLD_FOLDER');
    assert.equal(folder.parent_token, 'V3_ROOT');
    assert.equal(fs.existsSync(path.join(sourceDir, 'NEW_FOLDER.json')), false);
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
  testDriveFallbackRetainsMaterializedTokenWhenReplacementBodyIsMissing();
  testDriveFallbackRejectsDanglingChildWhenBothBodiesAreMissing();
  testDriveFallbackRejectsDanglingSourceOnlyChild();
  testDriveFallbackPrefersMaterializedMappedDocumentOverFallbackSlug();
  testDriveFallbackRejectsDuplicateTokensInTouchedFolderGraph();
  testDriveFallbackIgnoresDuplicateTokensOutsideTouchedFolders();
  testDriveFallbackRetainsMaterializedRootChildWhenReplacementBodyIsMissing();
  testPreProcessRemovesRootMarkdownFiles();
  testPreProcessPreservesSelectedFiles();
  testPreProcessPreservesHomeByDefault();
  console.log('larkUtils tests passed');
}

run();
