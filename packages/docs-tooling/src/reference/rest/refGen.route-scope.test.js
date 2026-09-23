const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const RefGen = require('./refGen')

function listFiles(dir) {
  return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => path.join(entry.parentPath ?? entry.path, entry.name))
}

function buildGenerator(target, targetPath) {
  return new RefGen({
    specifications: {
      tags: [
        { name: 'Vector (V1)' },
        { name: 'Collection (V1)' },
        { name: 'Vector Operations (V2)' },
      ],
      paths: {
        '/v1/vector/collections': {
          get: { summary: 'List', tags: ['Vector (V1)'], responses: {} },
        },
        '/v1/collections': {
          get: { summary: 'List', tags: ['Collection (V1)'], responses: {} },
        },
        '/v2/vectordb/collections/list': {
          post: { summary: 'List', tags: ['Vector Operations (V2)'], responses: {} },
        },
      },
    },
    lang: 'en-US',
    target,
    target_path: targetPath,
  })
}

async function main() {
  // milvus.io namespaces pages by version and group folder and its slug
  // convention drops the -v2 suffix, so same-verb pages across versions and
  // groups are expected. The uniqueness check must key on the physical page
  // path there, where a repeated key would overwrite an actual file.
  const milvusTarget = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'refgen-route-milvus-')), 'out')
  const milvus = buildGenerator('milvus', milvusTarget)
  milvus.make_groups()
  await milvus.write_refs()
  const milvusListPages = listFiles(milvusTarget).filter(file => path.basename(file) === 'list.mdx')
  assert.equal(milvusListPages.length, 3)
  assert.equal(new Set(milvusListPages.map(file => path.dirname(file))).size, 3)

  // zdoc sites publish a flat /restful/<slug> route space, where a repeated
  // slug really is a collision and must keep failing closed.
  const zillizTarget = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'refgen-route-zilliz-')), 'out')
  const zilliz = buildGenerator('zilliz', zillizTarget)
  zilliz.make_groups()
  await assert.rejects(zilliz.write_refs(), /REST_PAGE_ROUTE_CONFLICT: \/restful\/list/)
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err)
    process.exit(1)
  }
)
