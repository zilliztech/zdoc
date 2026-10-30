'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const {SharedImageUploader} = require('./sharedImageUploader')
const bytes = Buffer.from('accepted image'), sha = crypto.createHash('sha256').update(bytes).digest('hex'), key = `shared/${sha}.png`
function fixture(mode) {
  const calls = []; let stored = mode.startsWith('existing') ? bytes : null
  const client = {async send(command) {
    calls.push(command)
    if (command.constructor.name === 'GetObjectCommand') {
      if (!stored) throw Object.assign(new Error('missing'), {$metadata: {httpStatusCode: 404}})
      return {Body: {transformToByteArray: async () => mode.includes('corrupt') ? Buffer.from('wrong') : stored}}
    }
    assert.equal(command.constructor.name, 'PutObjectCommand'); assert.equal(command.input.IfNoneMatch, '*')
    assert.equal(command.input.ACL, 'public-read')
    if (mode === 'failure') throw Object.assign(new Error('storage unavailable'), {$metadata: {httpStatusCode: 500}})
    stored = bytes
    if (mode === 'race') throw Object.assign(new Error('race'), {$metadata: {httpStatusCode: 412}})
    return {}
  }}
  return {calls, uploader: new SharedImageUploader({client, bucket: 'test', baseUrl: 'https://images.test'})}
}
for (const mode of ['new', 'existing', 'race']) test(`immutable ${mode} storage verifies bytes and deduplicates accepted content`, async () => {
  const {uploader, calls} = fixture(mode)
  assert.equal(await uploader.upload({group: 'guides', key, sha256: sha, bytes}), `https://images.test/${key}`)
  await uploader.upload({group: 'guides', key, sha256: sha, bytes})
  assert.equal(calls.filter(c => c.constructor.name === 'PutObjectCommand').length, mode === 'existing' ? 0 : 1)
  assert.equal(calls.filter(c => c.constructor.name === 'GetObjectCommand').length, mode === 'existing' ? 1 : 2)
  assert.deepEqual(calls.map(c => c.constructor.name), mode === 'existing'
    ? ['GetObjectCommand'] : ['GetObjectCommand', 'PutObjectCommand', 'GetObjectCommand'])
})
test('[PUBLISH_IMAGE_UPLOAD_FAILED] tampering and corrupt readback fail without overwrite or deletion', async () => {
  const {uploader, calls} = fixture('corrupt')
  await assert.rejects(uploader.upload({group: 'guides', key, sha256: sha, bytes: Buffer.from('tamper')}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'})
  assert.equal(calls.length, 0)
  await assert.rejects(uploader.upload({group: 'guides', key, sha256: sha, bytes}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'})
  assert.equal(calls.length, 3)
})
test('skip validates bytes and produces full addresses with no store calls', async () => {
  const uploader = new SharedImageUploader({mode: 'skip', baseUrl: 'https://images.test/', client: {send() {throw Error('forbidden')}}})
  assert.equal(await uploader.upload({group: 'other-group', key, sha256: sha, bytes}), `https://images.test/${key}`)
  await assert.rejects(uploader.upload({group: 'guides', key: '../unsafe', sha256: sha, bytes}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'})
})
test('pinned SDK serializes conditional create into the signed HTTP If-None-Match header', async () => {
  const {S3Client} = require('@aws-sdk/client-s3')
  const requests = []
  const client = new S3Client({region: 'us-west-2', credentials: {accessKeyId: 'fixture', secretAccessKey: 'fixture'},
    requestHandler: {async handle(request) {
      requests.push(request)
      if (requests.length === 1) return {response: {statusCode: 404, headers: {}, body: Buffer.alloc(0)}}
      return {response: {statusCode: 200, headers: {}, body: require('node:stream').Readable.from(request.method === 'GET' ? [bytes] : [])}}
    }}})
  const uploader = new SharedImageUploader({client, bucket: 'fixture', baseUrl: 'https://images.test'})
  try {
    await uploader.upload({group: 'guides', key, sha256: sha, bytes})
    assert.deepEqual(requests.map(request => request.method), ['GET', 'PUT', 'GET'])
    assert.equal(requests[1].headers['if-none-match'], '*')
    assert.match(requests[1].headers.authorization, /SignedHeaders=[^,]*if-none-match/)
    assert.equal(requests[1].headers['x-amz-acl'], 'public-read')
    assert.match(requests[1].headers.authorization, /SignedHeaders=[^,]*x-amz-acl/)
  } finally {uploader.destroy()}
})

test('corrupt existing content and write failures stop without repair, deletion or ACL reset', async () => {
  for (const mode of ['existing-corrupt', 'failure']) {
    const {uploader, calls} = fixture(mode)
    await assert.rejects(uploader.upload({group: 'guides', key, sha256: sha, bytes}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'})
    assert.deepEqual(calls.map(call => call.constructor.name), mode === 'existing-corrupt' ? ['GetObjectCommand'] : ['GetObjectCommand', 'PutObjectCommand'])
  }
})

test('shared uploader requires an explicit valid image base even in skip mode', () => {
  const previous = process.env.IMAGE_BED_URL
  delete process.env.IMAGE_BED_URL
  try {
    for (const baseUrl of [undefined, '', 'http://images.test', 'https://user:secret@images.test', 'https://images.test/?query=1']) {
      assert.throws(() => new SharedImageUploader({baseUrl, mode: 'skip'}), /IMAGE_BED_URL/)
    }
    process.env.IMAGE_BED_URL = 'https://environment.test/'
    assert.equal(new SharedImageUploader({mode: 'skip'}).baseUrl, 'https://environment.test')
  } finally {if (previous === undefined) delete process.env.IMAGE_BED_URL; else process.env.IMAGE_BED_URL = previous}
})

for (const baseUrl of ['https:images.test', 'https:/images.test', 'https:///images.test', 'https://images.test/\npath',
  'https://images.test/\rpath', 'https://images.test/\tpath', 'https://images.test/\\path', 'https://images.test/?', 'https://images.test/#']) {
  test(`shared image base rejects malformed raw URL ${JSON.stringify(baseUrl)}`, () => {
    assert.throws(() => new SharedImageUploader({baseUrl, mode: 'skip'}), /IMAGE_BED_URL/)
  })
}
