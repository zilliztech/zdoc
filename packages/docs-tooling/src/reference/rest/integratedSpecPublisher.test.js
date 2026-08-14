const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {publishIntegratedSpecs} = require('./integratedSpecPublisher');

const fixturePath = name => path.join(__dirname, 'test-fixtures/integrated-spec', name);

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'integrated-spec-publisher-'));
}

class RecordingUploader {
  constructor() {
    this.uploads = [];
  }

  async uploadArtifact(artifact) {
    this.uploads.push(artifact);
    return `https://example.com/${artifact.filename}`;
  }
}

test('publishes latest local artifacts and uploads identical prepared bytes', async () => {
  const dir = tempDir();
  const uploader = new RecordingUploader();
  const result = await publishIntegratedSpecs({
    specifications: fixturePath('canonical.json'),
    publicationPolicy: 'latest',
    target: 'zilliz',
    apiSurface: 'v2',
    language: 'en-US',
    outputDirectory: dir,
    uploader,
  });

  const local = fs.readFileSync(path.join(dir, 'openapi-zilliz-v2-en-US.json'));
  const uploaded = uploader.uploads.find(entry => entry.filename === 'openapi-zilliz-v2-en-US.json');
  assert.ok(uploaded);
  assert.deepEqual(Buffer.from(uploaded.bytes), local);
  assert.equal(uploaded.sha256, result.localArtifacts.find(entry => entry.filename === 'openapi-zilliz-v2-en-US.json').sha256);
  assert.ok(result.manifest);
  fs.rmSync(dir, {recursive: true, force: true});
});

test('publishes track artifacts without an api surface', async () => {
  const dir = tempDir();
  const uploader = new RecordingUploader();
  const result = await publishIntegratedSpecs({
    specifications: fixturePath('milvus-2.6.x.json'),
    publicationPolicy: 'track',
    target: 'milvus',
    releaseTrack: '2.6.x',
    language: 'zh-CN',
    outputDirectory: dir,
    uploader,
  });

  assert.equal(fs.existsSync(path.join(dir, 'openapi-milvus-2.6.x-zh-CN.json')), true);
  assert.equal(result.manifest.releaseTrack, '2.6.x');
  assert.equal(result.manifest.apiSurface, null);
  fs.rmSync(dir, {recursive: true, force: true});
});

test('compatibility aliases reuse the exact prepared bytes and digest', async () => {
  const dir = tempDir();
  const uploader = new RecordingUploader();
  const result = await publishIntegratedSpecs({
    specifications: fixturePath('canonical.json'),
    publicationPolicy: 'latest',
    target: 'zilliz',
    apiSurface: 'v2',
    language: 'en-US',
    outputDirectory: dir,
    uploader,
    enableCompatibilityAliases: true,
  });

  const primary = result.localArtifacts.find(entry => entry.filename === 'openapi-zilliz-v2-en-US.json');
  const alias = result.localArtifacts.find(entry => entry.filename === 'openapi-zilliz-v2.json');
  assert.ok(primary);
  assert.ok(alias);
  assert.deepEqual(alias.bytes, primary.bytes);
  assert.equal(alias.sha256, primary.sha256);
  fs.rmSync(dir, {recursive: true, force: true});
});

test('upload failure leaves local artifacts intact', async () => {
  const dir = tempDir();
  const uploader = {
    async uploadArtifact() {
      throw new Error('upload failed');
    },
  };

  await assert.rejects(
    () => publishIntegratedSpecs({
      specifications: fixturePath('canonical.json'),
      publicationPolicy: 'latest',
      target: 'zilliz',
      apiSurface: 'v2',
      language: 'en-US',
      outputDirectory: dir,
      uploader,
    }),
    /upload failed/,
  );

  assert.equal(fs.existsSync(path.join(dir, 'openapi-zilliz-v2-en-US.json')), true);
  assert.equal(fs.existsSync(path.join(dir, 'manifest.json')), true);
  fs.rmSync(dir, {recursive: true, force: true});
});
