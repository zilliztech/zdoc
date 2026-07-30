import assert from 'node:assert/strict'
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {createAliyunOssValidator} from '../providers/aliyun-oss-validator.mjs'

function publication(markdown) {
  const root = mkdtempSync(path.join(tmpdir(), 'aliyun-validator-'))
  const docs = path.join(root, 'content/zh-CN/guides')
  mkdirSync(docs, {recursive: true})
  writeFileSync(path.join(docs, 'page.md'), markdown)
  return root
}

test('rejects Chinese publication images hosted on Amazon S3', async () => {
  const validator = createAliyunOssValidator({
    environment: {IMAGE_BED_URL: 'https://docs-images.oss-cn-hangzhou.aliyuncs.com'},
    fetchImpl: async () => new Response(null, {status: 200}),
  })

  await assert.rejects(
    validator.validatePublication(publication('![bad](https://zdoc-images.s3.us-west-2.amazonaws.com/a.png)\n'), {}),
    /Amazon S3|Aliyun OSS/i,
  )
})

test('checks that Aliyun-hosted publication images are reachable', async () => {
  const checked = []
  const validator = createAliyunOssValidator({
    environment: {IMAGE_BED_URL: 'https://docs-images.oss-cn-hangzhou.aliyuncs.com'},
    fetchImpl: async (url, init) => {
      checked.push({url: String(url), method: init.method})
      return new Response(null, {status: 200})
    },
  })

  await validator.validatePublication(publication([
    '![one](https://docs-images.oss-cn-hangzhou.aliyuncs.com/a.png)',
    '<img src="https://docs-images.oss-cn-hangzhou.aliyuncs.com/b.png" />',
    '',
  ].join('\n')), {})

  assert.deepEqual(checked, [
    {url: 'https://docs-images.oss-cn-hangzhou.aliyuncs.com/a.png', method: 'HEAD'},
    {url: 'https://docs-images.oss-cn-hangzhou.aliyuncs.com/b.png', method: 'HEAD'},
  ])
})

test('fails when an Aliyun-hosted publication image is unavailable', async () => {
  const validator = createAliyunOssValidator({
    environment: {IMAGE_BED_URL: 'https://docs-images.oss-cn-hangzhou.aliyuncs.com'},
    fetchImpl: async () => new Response(null, {status: 404}),
  })

  await assert.rejects(
    validator.validatePublication(publication('![missing](https://docs-images.oss-cn-hangzhou.aliyuncs.com/missing.png)\n'), {}),
    /404|unavailable/i,
  )
})
