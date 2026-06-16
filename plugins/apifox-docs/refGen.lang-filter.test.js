const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const RefGen = require('./refGen')

async function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apifox-refgen-lang-filter-'))
  try {
    await callback(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

async function testGlobalClustersGenerateUnderControlPlane() {
  await withTempDir(async targetPath => {
    const spec = {
      openapi: '3.0.1',
      info: { title: 'test', version: '1.0.0' },
      tags: [
        {
          name: 'Global Clusters (V2)',
          'x-include-target': ['zilliz'],
        },
      ],
      paths: {
        '/v2/globalClusters': {
          get: {
            summary: 'List Global Clusters',
            description: 'List all global clusters in the account.',
            tags: ['Global Clusters (V2)'],
            parameters: [
              {
                name: 'Authorization',
                in: 'header',
                description: 'API key token',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: {
              200: {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        code: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {},
      servers: [],
    }

    const refGen = new RefGen({
      specifications: spec,
      lang: 'en-US',
      target: 'zilliz',
      target_path: targetPath,
    })

    refGen.make_groups()
    await refGen.write_refs()

    const controlPlanePath = path.join(
      targetPath,
      'v2',
      'control-plane',
      'global-clusters-v2',
      'list-global-clusters-v2.mdx',
    )
    const dataPlanePath = path.join(
      targetPath,
      'v2',
      'data-plane',
      'global-clusters-v2',
      'list-global-clusters-v2.mdx',
    )

    assert.equal(fs.existsSync(controlPlanePath), true)
    assert.equal(fs.existsSync(dataPlanePath), false)
  })
}

async function run() {
  await testGlobalClustersGenerateUnderControlPlane()
  console.log('apifox refGen lang filter tests passed')
}

run()
