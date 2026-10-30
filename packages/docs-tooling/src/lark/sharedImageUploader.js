'use strict'
const crypto = require('node:crypto')
const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3')
const {NodeHttpHandler} = require('@smithy/node-http-handler')
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const missing = error => error.$metadata?.httpStatusCode === 404 || ['NoSuchKey', 'NotFound'].includes(error.name)
function validateImageBaseUrl(baseUrl) {
  try {
    // URL parsing repairs malformed schemes and strips controls; reject those raw inputs before publication.
    if (typeof baseUrl !== 'string' || !/^https:\/\/[^/]/i.test(baseUrl) || /[\s\\\u0000-\u001f\u007f?#]/u.test(baseUrl)) throw new Error('invalid URL syntax')
    const url = new URL(baseUrl)
    if (url.protocol !== 'https:' || url.search || url.hash || url.username || url.password) throw new Error('invalid URL')
    return baseUrl.replace(/\/$/, '')
  } catch { throw new Error('IMAGE_BED_URL must be an explicit HTTPS base URL without credentials, query or fragment') }
}
class SharedImageUploader {
  constructor({client, bucket = process.env.AWS_BUCKET, baseUrl = process.env.IMAGE_BED_URL, mode = 'upload'} = {}) {
    if (!['upload', 'skip'].includes(mode)) throw new Error('Invalid shared image upload mode')
    this.baseUrl = validateImageBaseUrl(baseUrl); this.bucket = bucket; this.mode = mode; this.client = client; this.verified = new Map()
  }
  store() {
    if (!this.client) this.client = new S3Client({region: process.env.AWS_REGION,
      credentials: {accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY},
      requestHandler: new NodeHttpHandler({connectionTimeout: 15000, socketTimeout: 60000})})
    return this.client
  }
  async upload({group, key, sha256, bytes}) {
    try {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(group) || !/^shared\/[a-f0-9]{64}\.[a-z0-9]+$/.test(key)
        || !key.startsWith(`shared/${sha256}.`) || bytes.byteLength > 32 * 1024 * 1024 || digest(bytes) !== sha256) throw new Error('Invalid accepted image key or bytes')
      const address = `${this.baseUrl}/${key}`
      if (this.mode === 'skip') return address
      if (this.verified.has(key)) return await this.verified.get(key)
      const operation = (async () => {
        const input = {Bucket: this.bucket, Key: key}
        const read = async () => {
          const response = await this.store().send(new GetObjectCommand(input))
          if (response.ContentLength > 32 * 1024 * 1024) throw new Error('Stored image exceeds size limit')
          const body = await response.Body.transformToByteArray()
          if (body.byteLength > 32 * 1024 * 1024 || digest(body) !== sha256) throw new Error('Stored image digest mismatch')
        }
        try { await read(); return address } catch (error) { if (!missing(error)) throw error }
        try {
          await this.store().send(new PutObjectCommand({...input, Body: bytes, IfNoneMatch: '*', ACL: 'public-read', ContentType: ({png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', avif: 'image/avif'})[key.split('.').at(-1)] || 'application/octet-stream'}))
        } catch (error) {
          if (![409, 412].includes(error.$metadata?.httpStatusCode) && !['PreconditionFailed', 'ConditionalRequestConflict'].includes(error.name)) throw error
        }
        await read()
        return address
      })()
      this.verified.set(key, operation)
      try { return await operation } catch (error) { this.verified.delete(key); throw error }
    } catch (cause) { throw Object.assign(new Error(`PUBLISH_IMAGE_UPLOAD_FAILED: ${cause.message}`, {cause}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'}) }
  }
  destroy() { this.client?.destroy?.() }
}
module.exports = {SharedImageUploader, validateImageBaseUrl}
