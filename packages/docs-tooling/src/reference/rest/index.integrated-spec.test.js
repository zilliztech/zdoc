const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const cliPath = path.join(__dirname, 'index.js');
const fixture = name => path.join(__dirname, 'test-fixtures/integrated-spec', name);

function run(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {encoding: 'utf8'});
}

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'integrated-spec-cli-'));
}

test('generates latest artifacts through the explicit CLI command', () => {
  const dir = tempDir();
  const result = run([
    'generate-integrated-spec',
    '--specifications', fixture('canonical.json'),
    '--publication-policy', 'latest',
    '--target', 'zilliz',
    '--api-version', 'v2',
    '--lang', 'en-US',
    '--integrated-spec-output', dir,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(dir, 'openapi-zilliz-v2-en-US.json')), true);
  assert.equal(fs.existsSync(path.join(dir, 'manifest.json')), true);
  fs.rmSync(dir, {recursive: true, force: true});
});

test('generates track artifacts through the explicit CLI command', () => {
  const dir = tempDir();
  const result = run([
    'generate-integrated-spec',
    '--specifications', fixture('milvus-2.6.x.json'),
    '--publication-policy', 'track',
    '--target', 'milvus',
    '--release-track', '2.6.x',
    '--lang', 'zh-CN',
    '--integrated-spec-output', dir,
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(dir, 'openapi-milvus-2.6.x-zh-CN.json')), true);
  assert.equal(fs.existsSync(path.join(dir, 'manifest.json')), true);
  fs.rmSync(dir, {recursive: true, force: true});
});

test('rejects invalid latest and track option combinations before writing', () => {
  const cases = [
    ['--publication-policy', 'latest', '--target', 'zilliz', '--lang', 'en-US'],
    ['--publication-policy', 'latest', '--target', 'zilliz', '--api-version', 'v2', '--release-track', '2.6.x', '--lang', 'en-US'],
    ['--publication-policy', 'track', '--target', 'milvus', '--release-track', '2.6.x', '--api-version', 'v2', '--lang', 'en-US'],
    ['--publication-policy', 'track', '--target', 'milvus', '--lang', 'en-US'],
  ];

  for (const extra of cases) {
    const dir = tempDir();
    const result = run([
      'generate-integrated-spec',
      '--specifications', extra[1] === 'track' ? fixture('milvus-2.6.x.json') : fixture('canonical.json'),
      ...extra,
      '--integrated-spec-output', dir,
    ]);

    assert.notEqual(result.status, 0);
    assert.equal(fs.existsSync(path.join(dir, 'manifest.json')), false);
    assert.equal(fs.readdirSync(dir).length, 0);
    fs.rmSync(dir, {recursive: true, force: true});
  }
});
