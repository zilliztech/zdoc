import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'packages/docs-tooling/src/reference/rest/index.js');
const fixtures = path.join(root, 'packages/docs-tooling/src/reference/rest/test-fixtures/fragment-collections');

function runCase(name, args, verify) {
  const first = fs.mkdtempSync(path.join(os.tmpdir(), `zdoc-rest-${name}-a-`));
  const second = fs.mkdtempSync(path.join(os.tmpdir(), `zdoc-rest-${name}-b-`));
  try {
    for (const output of [first, second]) {
      const result = spawnSync(process.execPath, [cli, 'generate-integrated-spec', ...args, '--integrated-spec-output', output], {
        cwd: root,
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, `${name} failed:\n${result.stdout}\n${result.stderr}`);
    }
    assert.deepEqual(snapshot(first), snapshot(second), `${name} output is not byte deterministic`);
    verify(first);
  } finally {
    fs.rmSync(first, {recursive: true, force: true});
    fs.rmSync(second, {recursive: true, force: true});
  }
}

function snapshot(directory, prefix = '') {
  const entries = [];
  for (const name of fs.readdirSync(directory).sort()) {
    const absolute = path.join(directory, name);
    const relative = path.join(prefix, name);
    if (fs.statSync(absolute).isDirectory()) entries.push(...snapshot(absolute, relative));
    else entries.push([relative, crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')]);
  }
  return entries;
}

function readJson(directory, filename) {
  return JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8'));
}

runCase('data-latest', [
  '--fragment-collection', path.join(fixtures, 'data-latest'),
  '--api-surface', 'data-plane',
  '--publication-policy', 'latest',
  '--target', 'zilliz',
  '--protocol-version', 'v2',
  '--lang', 'en-US',
], output => {
  const manifest = readJson(output, 'manifest.json');
  assert.equal(manifest.apiSurface, 'data-plane');
  assert.equal(manifest.protocolVersion, 'v2');
  assert.equal(manifest.collection.collectionId, 'fixture-data-plane-latest');
  assert.deepEqual(manifest.operations.map(operation => operation.endpoint), ['/v2/vectordb/collections']);
  assert.ok(fs.existsSync(path.join(output, 'openapi-zilliz-data-plane-v2-en-US.json')));
});

runCase('data-track', [
  '--fragment-collection', path.join(fixtures, 'data-track'),
  '--api-surface', 'data-plane',
  '--publication-policy', 'track',
  '--target', 'milvus',
  '--release-track', '2.6.x',
  '--lang', 'zh-CN',
], output => {
  const manifest = readJson(output, 'manifest.json');
  assert.equal(manifest.releaseTrack, '2.6.x');
  assert.equal(manifest.target, 'milvus');
  assert.equal(manifest.collection.collectionId, 'fixture-data-plane-2.6.x');
  assert.ok(fs.existsSync(path.join(output, 'openapi-milvus-data-plane-2.6.x-zh-CN.json')));
});

runCase('control-latest', [
  '--fragment-collection', path.join(fixtures, 'control-latest'),
  '--api-surface', 'control-plane',
  '--publication-policy', 'latest',
  '--target', 'zilliz',
], output => {
  const bilingual = readJson(output, 'bilingual-manifest.json');
  assert.equal(bilingual.apiSurface, 'control-plane');
  assert.deepEqual(bilingual.languages.map(entry => entry.language), ['en-US', 'zh-CN']);
  for (const language of ['en-US', 'zh-CN']) {
    const manifest = readJson(path.join(output, language), 'manifest.json');
    assert.equal(manifest.collection.collectionId, 'fixture-control-plane-latest');
    assert.deepEqual(manifest.operations.map(operation => operation.endpoint), ['/v2/projects', '/v2/usage']);
    assert.ok(fs.existsSync(path.join(output, language, `openapi-zilliz-control-plane-${language}.json`)));
  }
});

console.log('Verified manifest-backed REST publication CLI for data latest, data track, and bilingual control latest.');
