import {readdir, readFile} from 'node:fs/promises'
import path from 'node:path'

const MARKDOWN_IMAGE = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)(?:\s+[^)]*)?\)/giu
const HTML_IMAGE = /<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["'][^>]*>/giu
const AMAZON_S3 = /(?:^|\.)s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/iu

async function markdownFiles(root) {
  const files = []
  async function visit(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) await visit(target)
      else if (entry.isFile() && /\.mdx?$/iu.test(entry.name)) files.push(target)
    }
  }
  await visit(root)
  return files.sort()
}

function imageUrls(source) {
  return [...source.matchAll(MARKDOWN_IMAGE), ...source.matchAll(HTML_IMAGE)].map(match => match[1])
}

async function forEachConcurrent(values, concurrency, action) {
  let next = 0
  await Promise.all(Array.from({length: Math.min(concurrency, values.length)}, async () => {
    while (next < values.length) {
      const value = values[next++]
      await action(value)
    }
  }))
}

export function createAliyunOssValidator(options = {}) {
  const environment = options.environment ?? process.env
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const imageBedUrl = environment.IMAGE_BED_URL
  if (!imageBedUrl) throw new Error('IMAGE_BED_URL is required for Aliyun OSS publication validation')
  const imageBedOrigin = new URL(imageBedUrl).origin

  return Object.freeze({
    async validatePublication(root) {
      const urls = new Set()
      for (const file of await markdownFiles(root)) {
        for (const value of imageUrls(await readFile(file, 'utf8'))) urls.add(value)
      }

      const amazon = [...urls].filter(value => AMAZON_S3.test(new URL(value).hostname))
      if (amazon.length > 0) {
        throw new Error(`Chinese publication contains ${amazon.length} Amazon S3 image URL(s); Aliyun OSS is required: ${amazon[0]}`)
      }

      const aliyun = [...urls].filter(value => new URL(value).origin === imageBedOrigin).sort()
      await forEachConcurrent(aliyun, 8, async value => {
        const response = await fetchImpl(value, {method: 'HEAD', redirect: 'follow'})
        if (!response.ok) throw new Error(`Aliyun OSS image is unavailable (${response.status}): ${value}`)
      })
    },
  })
}
