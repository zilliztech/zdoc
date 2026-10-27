#!/usr/bin/env node
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const {SharedImageUploader} = require('../../packages/docs-tooling/src/lark/sharedImageUploader')
const {regularBytes} = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const {loadTypeScript} = require('../lib/load-typescript')
const {AcceptedImageStore} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/adapters/image-store.ts'))
async function uploadSharedImages({bundleRoot, scratch, mode = 'write', uploader = new SharedImageUploader({mode: mode === 'write' ? 'upload' : mode})}) {
  if (!fs.existsSync(bundleRoot)) return {images: 0}
  try {
    const {bundle} = require('../../packages/docs-tooling/src/lark/sharedPageBundle').loadBundle(bundleRoot)
    if (fs.realpathSync(scratch) !== path.resolve(scratch)) throw new Error('Unsafe scratch root')
    const seen = new Set()
    for (const outcome of bundle.outcomes) if (outcome.status === 'success') for (const image of outcome.images) {
      if (seen.has(image.address)) continue
      if (fs.lstatSync(path.join(scratch, 'images', image.sha256)).size > 32 * 1024 * 1024) throw new Error('Accepted image exceeds size limit')
      const bytes = regularBytes(scratch, `images/${image.sha256}`)
      const address = await new AcceptedImageStore('guides', image.address, uploader).upload(image.sha256, bytes)
      if (address !== `${outcome.image_base_url}/${image.address}`) throw new Error('Source image address does not match upload configuration')
      seen.add(image.address)
    }
    return {images: seen.size}
  } catch (cause) { throw Object.assign(new Error(`PUBLISH_IMAGE_UPLOAD_FAILED: ${cause.message}`, {cause}), {code: 'PUBLISH_IMAGE_UPLOAD_FAILED'}) }
  finally { uploader.destroy() }
}
if (require.main === module) {
  const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, index, all) => arg.startsWith('--') ? [...pairs, [arg.slice(2), all[index + 1]]] : pairs, []))
  uploadSharedImages({bundleRoot: args.bundle, scratch: args.scratch, mode: args.mode}).catch(error => { console.error(error.message); process.exitCode = 1 })
}
module.exports = {uploadSharedImages}
