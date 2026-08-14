const { S3Client, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const crypto = require('node:crypto')

class S3Uploader {
  constructor(options = {}) {
    this.options = options
    this.region = options.region || process.env.AWS_REGION
    this.client = options.client || new S3Client({ region: this.region })
    this.bucket = options.bucket || process.env.AWS_BUCKET
    this.prefix = ((options.prefix ?? process.env.S3_PREFIX) || '').replace(/\/+$/, '')
  }

  async uploadArtifact({filename, bytes, sha256}) {
    if (!this.bucket) {
      throw new Error('AWS_BUCKET environment variable is required')
    }
    if (!this.region) {
      throw new Error('AWS_REGION environment variable is required')
    }

    const s3Key = this.prefix ? `${this.prefix}/${filename}` : filename
    const md5 = crypto.createHash('md5').update(bytes).digest('hex')
    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${s3Key}`

    try {
      const head = await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      }))
      const etag = head.ETag?.replace(/"/g, '')
      if (etag === md5) {
        return url
      }
    } catch (err) {
      if (err.name !== 'NotFound') {
        throw err
      }
    }

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      Body: bytes,
      ContentType: 'application/json',
      ACL: 'public-read',
    }))

    return url
  }
}

module.exports = S3Uploader
