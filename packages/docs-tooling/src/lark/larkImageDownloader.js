const utils = require('./larkUtils.js')
const tokenFetcher = require('./larkTokenFetcher.js')
const https = require('node:https')
const Bottleneck = require('bottleneck')
const process = require('node:process')
const crypto = require('node:crypto')
const OSS = require('ali-oss')
const { XMLParser } = require('fast-xml-parser')
const { S3Client, PutObjectCommand, HeadObjectCommand, PutObjectAclCommand } = require('@aws-sdk/client-s3');
const { NodeHttpHandler } = require('@smithy/node-http-handler');
const { fetchBufferWithRetry, fetchFeishuBufferWithRetry, fetchJsonWithRetry } = require('./feishuFetch.js')

require('dotenv/config')

class larkImageDownloader {
    constructor(docs, target_path, limiterOptions = {}) {
        this.docs = docs;
        this.images = new utils(this.docs, 'image');
        this.iframes = new utils(this.docs, 'iframe');
        this.target_path = target_path;   
        this.limiter = new Bottleneck({
            maxConcurrent: limiterOptions.maxConcurrent || 1,
            minTime: limiterOptions.minTime ?? 52,
        });
        this.figmaLimiter = new Bottleneck({
            maxConcurrent: limiterOptions.figmaMaxConcurrent || 1,
            minTime: limiterOptions.figmaMinTime ?? 1000,
        });
        const hasOssConfig = process.env.OSS_ACCESS_KEY_ID
            && process.env.OSS_ACCESS_KEY_SECRET
            && process.env.OSS_REGION
            && process.env.OSS_BUCKET
            && process.env.OSS_ENDPOINT
        if (hasOssConfig) {
            this.storageKind = 'oss'
            console.log(`[oss] init — region=${process.env.OSS_REGION} bucket=${process.env.OSS_BUCKET} key_id=set`)
            const createOssClient = limiterOptions.createOssClient || (options => new OSS(options))
            this.client = createOssClient({
                accessKeyId: process.env.OSS_ACCESS_KEY_ID,
                accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
                region: process.env.OSS_REGION,
                bucket: process.env.OSS_BUCKET,
                authorizationV4: true,
                endpoint: process.env.OSS_ENDPOINT,
            })
        } else {
            this.storageKind = 's3'
            console.log(`[s3] init — region=${process.env.AWS_REGION ?? '(unset)'} bucket=${process.env.AWS_BUCKET ?? '(unset)'} key_id=${process.env.AWS_ACCESS_KEY_ID ? 'set' : '(unset)'}`)
            this.s3 = new S3Client({
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
                region: process.env.AWS_REGION,
                requestHandler: new NodeHttpHandler({
                    connectionTimeout: 15000,
                    socketTimeout: 60000,
                }),
            })
        }
    }    

    async __uploadToS3(buffer, key) {
        if (this.storageKind === 'oss') return await this.__uploadToOSS(buffer, key)

        const get_params = {
            Bucket: process.env.AWS_BUCKET,
            Key: key,
        }

        const put_params = {
            ...get_params,
            Body: buffer,
            ContentType: 'image/png',
            ACL: 'public-read',
            Metadata: {
                hash: crypto.createHash('md5').update(buffer).digest('hex'),
            }
        }

        try {
            console.log(`[s3] checking if ${key} exists`)
            const headObjectCommand = new HeadObjectCommand(get_params);
            const response = await this.s3.send(headObjectCommand);
            console.log(`[s3] ${key} found in bucket, checking hash`)
            if (response.Metadata?.hash === crypto.createHash('md5').update(buffer).digest('hex')) {
                console.log(`[s3] ${key} unchanged, skipping upload`);
                const aclCommand = new PutObjectAclCommand({ Bucket: process.env.AWS_BUCKET, Key: key, ACL: 'public-read' });
                await this.s3.send(aclCommand);
                console.log(`[s3] ${key} ACL ensured public-read`);
                return
            }
            console.log(`[s3] ${key} hash changed, re-uploading`)
            const putObjectCommand = new PutObjectCommand(put_params);
            await this.s3.send(putObjectCommand);
            console.log(`[s3] uploaded ${key}`);
        } catch (err) {
            if (err.$metadata?.httpStatusCode === 404 || err.name === 'NotFound' || err.name === 'NoSuchKey') {
                console.log(`[s3] ${key} not found, uploading`)
                const putObjectCommand = new PutObjectCommand(put_params);
                await this.s3.send(putObjectCommand);
                console.log(`[s3] uploaded ${key}`)
            } else {
                console.error(`[s3] ERROR uploading ${key}:`, err.message ?? err);
                throw err;
            }
        }
    }

    async __uploadToOSS(buffer, key) {
        if (!this.client) throw new Error('OSS client is not configured')

        const hash = crypto.createHash('md5').update(buffer).digest('hex')
        const headers = {
            'x-oss-storage-class': 'Standard',
            'x-oss-object-acl': 'public-read',
            'Content-Disposition': 'inline',
            'Content-Type': 'image/png',
            'x-oss-tagging': `hash=${hash}`,
            'x-oss-forbid-overwrite': 'false',
        }

        try {
            console.log(`[oss] checking if ${key} exists`)
            const response = await this.client.getObjectTagging(key)
            const tagSet = new XMLParser().parse(response.res.data.toString('utf8')).Tagging?.TagSet
            const tags = Array.isArray(tagSet?.Tag) ? tagSet.Tag : [tagSet?.Tag].filter(Boolean)
            if (tags.some(tag => tag.Key === 'hash' && tag.Value === hash)) {
                console.log(`[oss] ${key} unchanged, skipping upload`)
                return
            }
            console.log(`[oss] ${key} hash changed, re-uploading`)
            await this.client.put(key, buffer, {headers})
            console.log(`[oss] uploaded ${key}`)
        } catch (err) {
            if (err.code === 'NoSuchKey' || err.name === 'NoSuchKey' || err.status === 404) {
                console.log(`[oss] ${key} not found, uploading`)
                await this.client.put(key, buffer, {headers})
                console.log(`[oss] uploaded ${key}`)
                return
            }
            console.error(`[oss] ERROR uploading ${key}:`, err.message ?? err)
            throw err
        }
    }

    async __downloadImage(image_token) {
        return this.limiter.schedule(async () => {
            console.log(`ImageToken: ${image_token}`)
            const fetcher = new tokenFetcher()
            await fetcher.fetchToken()
            const token = await fetcher.token()

            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 30000)
            try {
                return await fetchFeishuBufferWithRetry(
                    `${process.env.FEISHU_HOST}/open-apis/drive/v1/medias/${image_token}/download`,
                    { method: 'GET', headers: { Authorization: `Bearer ${token}` }, signal: controller.signal },
                    `download image ${image_token}`
                )
            } finally {
                clearTimeout(timeout)
            }
        })
    }

    async __downloadBoardPreview(board_token) {
        return this.limiter.schedule(async () => {
            console.log(`BoardToken: ${board_token}`)
            const fetcher = new tokenFetcher()
            await fetcher.fetchToken()
            const token = await fetcher.token()

            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 30000)
            try {
                return await fetchFeishuBufferWithRetry(
                    `${process.env.FEISHU_HOST}/open-apis/board/v1/whiteboards/${board_token}/download_as_image`,
                    { method: 'GET', headers: { Authorization: `Bearer ${token}` }, signal: controller.signal },
                    `download board preview ${board_token}`
                )
            } finally {
                clearTimeout(timeout)
            }
        })
    }

    async __fetchCaption(key, node) {
        console.log(`CaptionReq: ${key} ${node}`)
        const req = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Figma-Token': process.env.FIGMA_API_KEY                
            },
        }

        return await this.__scheduleFigmaApi(async () => {
            return await fetchJsonWithRetry(
                `https://api.figma.com/v1/files/${key}/nodes?ids=${node}`,
                req,
                `fetch Figma caption ${key}:${node}`
            )
        })
    }

    async __downloadIframe(key, node) {
        console.log(`ImageReq: ${key} ${node}`)
        const imageJson = await this.__scheduleFigmaApi(async () => {
            return await fetchJsonWithRetry(`https://api.figma.com/v1/images/${key}?ids=${node}&format=png&scale=3`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Figma-Token': process.env.FIGMA_API_KEY
                }
            }, `fetch Figma image URL ${key}:${node}`)
        })
        const url = imageJson.images[node]
        return await fetchBufferWithRetry(url, {
            method: 'GET',
            headers: {
                'Connection': 'keep-alive',
                'X-Figma-Token': process.env.FIGMA_API_KEY                
            },
            agent: new https.Agent({ keepAlive: true, maxSockets: 10 })
        }, `download Figma image ${key}:${node}`)
    }

    async __scheduleFigmaApi(task) {
        return await this.figmaLimiter.schedule(task)
    }

    destroy() {
        this.s3?.destroy()
        this.client?.destroy?.()
    }

    async __wait(duration) {
        return new Promise((resolve, _) => {
            setTimeout(() => {
                resolve()
            }, duration)
        })
    }

}

module.exports = larkImageDownloader;
