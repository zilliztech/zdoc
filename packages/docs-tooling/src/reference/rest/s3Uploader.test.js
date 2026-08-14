const test = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {HeadObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const S3Uploader = require('./s3Uploader');

function md5(bytes) {
  return createHash('md5').update(bytes).digest('hex');
}

class MockClient {
  constructor() {
    this.commands = [];
    this.headResponse = null;
    this.putError = null;
  }

  async send(command) {
    this.commands.push(command);
    if (command instanceof HeadObjectCommand) {
      if (this.headResponse) return this.headResponse;
      const error = new Error('NotFound');
      error.name = 'NotFound';
      throw error;
    }
    if (command instanceof PutObjectCommand && this.putError) throw this.putError;
    return {};
  }
}

test('accepts an injected client and uploads the exact supplied bytes', async () => {
  const client = new MockClient();
  const uploader = new S3Uploader({
    client,
    bucket: 'bucket',
    region: 'us-east-1',
    prefix: 'rest/',
  });
  const bytes = Buffer.from('{"openapi":"3.0.1"}');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const url = await uploader.uploadArtifact({
    filename: 'openapi-zilliz-v2-en-US.json',
    bytes,
    sha256,
  });

  assert.equal(client.commands.length, 2);
  assert.ok(client.commands[0] instanceof HeadObjectCommand);
  assert.ok(client.commands[1] instanceof PutObjectCommand);
  const put = client.commands[1].input;
  assert.equal(put.Key, 'rest/openapi-zilliz-v2-en-US.json');
  assert.equal(put.ContentType, 'application/json');
  assert.deepEqual(put.Body, bytes);
  assert.equal(url, 'https://bucket.s3.us-east-1.amazonaws.com/rest/openapi-zilliz-v2-en-US.json');
});

test('skips upload when the remote checksum is unchanged', async () => {
  const client = new MockClient();
  const bytes = Buffer.from('{"openapi":"3.0.1"}');
  client.headResponse = {ETag: `"${md5(bytes)}"`};
  const uploader = new S3Uploader({
    client,
    bucket: 'bucket',
    region: 'us-east-1',
    prefix: '',
  });

  await uploader.uploadArtifact({
    filename: 'openapi-zilliz-v2-en-US.json',
    bytes,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });

  assert.equal(client.commands.length, 1);
  assert.ok(client.commands[0] instanceof HeadObjectCommand);
});

test('propagates head and put failures without deleting prepared content', async () => {
  const client = new MockClient();
  client.putError = new Error('network down');
  const uploader = new S3Uploader({client, bucket: 'bucket', region: 'us-east-1'});

  await assert.rejects(
    () => uploader.uploadArtifact({filename: 'x.json', bytes: Buffer.from('{}'), sha256: 'abc'}),
    /network down/,
  );
});
