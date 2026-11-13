'use strict'

// Parameter-level availability tiers (§1.14). refGen materializes the
// effective x-zilliz-availability onto every parameter/schema node of zilliz
// v2 pages — explicit marks win, otherwise x-added-at at/after 3.0.x derives
// PUBLIC_PREVIEW — and strips the internal lifecycle evidence keys from the
// page payload. Pages whose operation-level beta badge already expresses
// preview maturity stay chip-free, the milvus target gets neither tier keys
// nor lifecycle keys, and per-page mutation must not leak across pages that
// share a component schema.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const RefGen = require('./refGen')

const LIFECYCLE_KEYS = ['x-added-at', 'x-last-modified', 'x-deprecated-since']

function buildSpecifications() {
  return {
    tags: [
      {name: 'Collection Operations (V2)'},
      {name: 'Collection Operations'},
    ],
    components: {
      schemas: {
        SharedPayload: {
          type: 'object',
          properties: {
            sharedField: {
              type: 'string',
              'x-added-at': '3.0.x',
            },
            sharedLegacy: {type: 'string'},
          },
        },
      },
    },
    paths: {
      '/v2/vectordb/collections/fields/drop': {
        post: {
          summary: 'Drop Collection Field',
          tags: ['Collection Operations (V2)'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['collectionName', 'fieldName'],
                  properties: {
                    collectionName: {
                      type: 'string',
                      'x-i18n': {'zh-CN': {description: '目标集合名称'}},
                    },
                    // Derived badge: introduced on the 3.0 track.
                    fieldName: {
                      type: 'string',
                      'x-added-at': '3.0.x',
                      'x-last-modified': '3.0.x',
                    },
                    fieldId: {
                      type: 'integer',
                      'x-added-at': '2.6.x',
                    },
                    // Explicit mark beats the derivation floor.
                    explicitGrafted: {
                      type: 'string',
                      'x-added-at': '3.0.x',
                      'x-zilliz-availability': 'GA',
                    },
                    nested: {
                      type: 'object',
                      properties: {
                        inner: {type: 'string', 'x-added-at': '3.0.x'},
                      },
                    },
                    wrappedList: {
                      type: 'array',
                      items: {type: 'string', 'x-added-at': '3.0.x'},
                    },
                    mergedPart: {
                      allOf: [
                        {$ref: '#/components/schemas/SharedPayload'},
                      ],
                    },
                  },
                },
              },
            },
          },
          parameters: [
            {
              name: 'Authorization',
              in: 'header',
              schema: {type: 'string'},
            },
            {
              name: 'PreviewOnly',
              in: 'query',
              'x-added-at': '3.0.x',
              schema: {
                type: 'string',
                'x-added-at': '3.0.x',
              },
            },
          ],
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      responseData: {type: 'string', 'x-added-at': '3.0.x'},
                    },
                  },
                },
              },
            },
          },
        },
      },
      // Same operation body served under a preview-tier operation badge: the
      // page badge already expresses maturity, so no per-parameter chips.
      '/v2/vectordb/collections/fields/drop_preview': {
        post: {
          summary: 'Drop Collection Field Preview',
          tags: ['Collection Operations (V2)'],
          'x-beta': 'PUBLIC',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fieldName: {type: 'string', 'x-added-at': '3.0.x'},
                  },
                },
              },
            },
          },
          responses: {200: {description: 'ok'}},
        },
      },
      // Shared component schema consumed by a second, GA operation: the
      // shared 3.0.x property must badge there too, and neither page may
      // leak mutations into the other (resolveRefs hands back shared
      // component references).
      '/v2/vectordb/collections/fields/describe': {
        post: {
          summary: 'Describe Collection Field',
          tags: ['Collection Operations (V2)'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payload: {
                      allOf: [{$ref: '#/components/schemas/SharedPayload'}],
                    },
                  },
                },
              },
            },
          },
          responses: {200: {description: 'ok'}},
        },
      },
      '/v1/vectordb/collections/fields/drop_legacy': {
        post: {
          summary: 'Drop Collection Field Legacy',
          tags: ['Collection Operations'],
          'x-added-at': '3.0.x',
          responses: {200: {description: 'ok'}},
        },
      },
    },
  }
}

async function generatePages(target) {
  const targetPath = fs.mkdtempSync(path.join(os.tmpdir(), `rest-availability-${target}-`))
  try {
    const generator = new RefGen({
      lang: 'en-US',
      target,
      target_path: targetPath,
      specifications: buildSpecifications(),
    })
    generator.make_groups()
    await generator.write_refs()

    const pages = {}
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name.endsWith('.mdx')) pages[entry.name] = fs.readFileSync(full, 'utf8')
      }
    }
    walk(targetPath)
    return pages
  } finally {
    fs.rmSync(targetPath, {recursive: true, force: true})
  }
}

function specsJson(page) {
  const match = page.match(/^export const specs = (.+)$/m)
  assert.ok(match, 'generated page must embed the specs JSON export')
  return JSON.parse(match[1])
}

test('derives PUBLIC_PREVIEW from x-added-at at the 3.0 floor on zilliz v2', async () => {
  const pages = await generatePages('zilliz')
  const page = Object.values(pages).find(body => body.includes('# Drop Collection Field (V2)'))
  assert.ok(page, 'drop field page must be generated')

  const specs = specsJson(page)
  const props = specs.requestBody.content['application/json'].schema.properties

  assert.equal(props.fieldName['x-zilliz-availability'], 'PUBLIC_PREVIEW')
  // 2.6.x is the GA floor — no badge.
  assert.equal(props.fieldId['x-zilliz-availability'], undefined)
  assert.equal(props.collectionName['x-zilliz-availability'], undefined)
  // Explicit mark wins over the derivation.
  assert.equal(props.explicitGrafted['x-zilliz-availability'], 'GA')

  // Nested object properties, array items, and allOf-resolved component
  // properties all carry the derived tier.
  assert.equal(props.nested.properties.inner['x-zilliz-availability'], 'PUBLIC_PREVIEW')
  assert.equal(props.wrappedList.items['x-zilliz-availability'], 'PUBLIC_PREVIEW')
  assert.equal(
    props.mergedPart.allOf[0].properties.sharedField['x-zilliz-availability'],
    'PUBLIC_PREVIEW',
  )

  // Parameters and the 200 response schema are covered too.
  assert.equal(specs.parameters[1]['x-zilliz-availability'], 'PUBLIC_PREVIEW')
  assert.equal(specs.parameters[1].schema['x-zilliz-availability'], 'PUBLIC_PREVIEW')
  assert.equal(specs.parameters[0]['x-zilliz-availability'], undefined)
  assert.equal(
    specs.responses['200'].content['application/json'].schema.properties.responseData['x-zilliz-availability'],
    'PUBLIC_PREVIEW',
  )
})

test('strips lifecycle evidence keys from the page payload', async () => {
  const pages = await generatePages('zilliz')
  for (const [name, page] of Object.entries(pages)) {
    if (!page.includes('export const specs = ')) continue
    const raw = page.match(/^export const specs = (.+)$/m)[1]
    for (const key of LIFECYCLE_KEYS) {
      assert.ok(!raw.includes(`"${key}"`), `${name} must not embed lifecycle key ${key}`)
    }
  }
  // Runtime-consumed extensions survive the strip.
  const dropPage = Object.values(pages).find(body => body.includes('# Drop Collection Field (V2)'))
  assert.ok(dropPage.match(/^export const specs = (.+)$/m)[1].includes('"x-i18n"'), 'x-i18n must survive the strip')
})

test('skips per-parameter chips when the page beta badge already expresses preview maturity', async () => {
  const pages = await generatePages('zilliz')
  const page = Object.values(pages).find(body => body.includes('# Drop Collection Field Preview (V2)'))
  assert.ok(page, 'preview-tier page must be generated')

  const raw = page.match(/^export const specs = (.+)$/m)[1]
  assert.ok(!raw.includes('"x-zilliz-availability"'), 'preview-tier page must not carry parameter chips')
  // The lifecycle strip still applies on skipped pages.
  assert.ok(!raw.includes('"x-added-at"'))
})

test('milvus target receives neither availability tiers nor lifecycle keys', async () => {
  const pages = await generatePages('milvus')
  assert.ok(Object.keys(pages).length > 0, 'milvus pages must be generated')
  for (const [name, page] of Object.entries(pages)) {
    if (!page.includes('export const specs = ')) continue
    const raw = page.match(/^export const specs = (.+)$/m)[1]
    assert.ok(!raw.includes('"x-zilliz-availability"'), `${name} must not carry availability tiers`)
    for (const key of LIFECYCLE_KEYS) {
      assert.ok(!raw.includes(`"${key}"`), `${name} must not embed lifecycle key ${key}`)
    }
  }
})

test('v1 pages stay unmarked', async () => {
  const pages = await generatePages('zilliz')
  const page = Object.values(pages).find(body => body.includes('# Drop Collection Field Legacy (V1)'))
  assert.ok(page, 'v1 page must be generated')
  const raw = page.match(/^export const specs = (.+)$/m)[1]
  assert.ok(!raw.includes('"x-zilliz-availability"'), 'v1 pages must not carry availability tiers')
  assert.ok(!raw.includes('"x-added-at"'))
})

test('per-page materialization does not leak across pages sharing a component schema', async () => {
  const pages = await generatePages('zilliz')

  // The preview-tier page must stay clean even though the GA pages it is
  // generated alongside share component schemas through resolveRefs.
  const previewPage = Object.values(pages).find(body => body.includes('# Drop Collection Field Preview (V2)'))
  assert.ok(!previewPage.match(/^export const specs = (.+)$/m)[1].includes('"x-zilliz-availability"'))

  const describePage = Object.values(pages).find(body => body.includes('# Describe Collection Field (V2)'))
  const specs = specsJson(describePage)
  assert.equal(
    specs.requestBody.content['application/json'].schema.properties.payload.allOf[0].properties.sharedField['x-zilliz-availability'],
    'PUBLIC_PREVIEW',
    'shared component properties badge on the GA page too',
  )
  assert.equal(
    specs.requestBody.content['application/json'].schema.properties.payload.allOf[0].properties.sharedLegacy['x-zilliz-availability'],
    undefined,
  )
})

test('rejects availability marks outside the tier vocabulary', async () => {
  const specifications = buildSpecifications()
  specifications.paths['/v2/vectordb/collections/fields/drop'].post
    .requestBody.content['application/json'].schema.properties.fieldName['x-zilliz-availability'] = 'BETA'

  const targetPath = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-availability-invalid-'))
  try {
    assert.throws(
      () => new RefGen({
        lang: 'en-US',
        target: 'zilliz',
        target_path: targetPath,
        specifications,
      }),
      /x-zilliz-availability.*expected one of/s,
    )
  } finally {
    fs.rmSync(targetPath, {recursive: true, force: true})
  }
})

test('reserved tiers outside the accepted authoring set are rejected', () => {
  const specifications = buildSpecifications()
  specifications.paths['/v2/vectordb/collections/fields/drop'].post
    .requestBody.content['application/json'].schema.properties.fieldName['x-zilliz-availability'] = 'PRIVATE_PREVIEW'

  const targetPath = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-availability-reserved-'))
  try {
    assert.throws(
      () => new RefGen({
        lang: 'en-US',
        target: 'zilliz',
        target_path: targetPath,
        specifications,
      }),
      /x-zilliz-availability.*expected one of GA, PUBLIC_PREVIEW/s,
    )
  } finally {
    fs.rmSync(targetPath, {recursive: true, force: true})
  }
})

test('a malformed track value skips the derivation instead of failing mid-write', async () => {
  const specifications = buildSpecifications()
  specifications.paths['/v2/vectordb/collections/fields/drop'].post
    .requestBody.content['application/json'].schema.properties.fieldName['x-added-at'] = '3.0'

  const targetPath = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-availability-malformed-'))
  try {
    const generator = new RefGen({
      lang: 'en-US',
      target: 'zilliz',
      target_path: targetPath,
      specifications,
    })
    generator.make_groups()
    await generator.write_refs()
    const pages = {}
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name.endsWith('.mdx')) pages[entry.name] = fs.readFileSync(full, 'utf8')
      }
    }
    walk(targetPath)
    const raw = Object.values(pages).find(body => body.includes('# Drop Collection Field (V2)'))
    assert.ok(raw, 'generation must complete despite the malformed track')
    const specs = JSON.parse(raw.match(/^export const specs = (.+)$/m)[1])
    const props = specs.requestBody.content['application/json'].schema.properties
    assert.equal(props.fieldName['x-zilliz-availability'], undefined, 'malformed track must not derive a tier')
  } finally {
    fs.rmSync(targetPath, {recursive: true, force: true})
  }
})

test('per-page mutation on shared `description`-named properties cannot leak through the clone', async () => {
  const specifications = {
    tags: [{name: 'Collection Operations (V2)'}],
    components: {
      schemas: {
        SharedPayload: {
          type: 'object',
          properties: {
            // `description` is the only property name resolveRefs hands back
            // as a shared object across pages (specLoader transparent-ref
            // path) — the exact shape the deep clone must protect.
            description: {type: 'string', 'x-added-at': '3.0.x'},
          },
        },
      },
    },
    paths: {
      '/v2/vectordb/collections/shared_a': {
        post: {
          summary: 'Shared Payload A',
          tags: ['Collection Operations (V2)'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payload: {$ref: '#/components/schemas/SharedPayload'},
                  },
                },
              },
            },
          },
          responses: {200: {description: 'ok'}},
        },
      },
      '/v2/vectordb/collections/shared_b': {
        post: {
          summary: 'Shared Payload B',
          tags: ['Collection Operations (V2)'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payload: {$ref: '#/components/schemas/SharedPayload'},
                  },
                },
              },
            },
          },
          responses: {200: {description: 'ok'}},
        },
      },
    },
  }

  const targetPath = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-availability-clone-'))
  try {
    const generator = new RefGen({
      lang: 'en-US',
      target: 'zilliz',
      target_path: targetPath,
      specifications,
    })
    // The admonition overlay mutates properties per page — with shared
    // component references this is the leak channel the clone must close.
    generator.admonitions = {
      'shared-payload-a-v2': {
        properties: {
          requestBody: {
            'payload.description': [{type: 'info', title: 'Note', content: 'Page A overlay only'}],
          },
        },
      },
    }
    generator.make_groups()
    await generator.write_refs()

    const readSpecs = (summary) => {
      const file = fs.readdirSync(targetPath, {recursive: true, withFileTypes: true})
        .filter(e => e.isFile() && e.name.endsWith('.mdx'))
        .map(e => path.join(e.parentPath ?? e.path, e.name))
        .map(p => fs.readFileSync(p, 'utf8'))
        .find(body => body.includes(`# ${summary}`))
      return JSON.parse(file.match(/^export const specs = (.+)$/m)[1])
    }

    const pageA = readSpecs('Shared Payload A (V2)')
    const pageB = readSpecs('Shared Payload B (V2)')
    const propA = pageA.requestBody.content['application/json'].schema.properties.payload.properties.description
    const propB = pageB.requestBody.content['application/json'].schema.properties.payload.properties.description

    assert.ok(Array.isArray(propA['x-admonition']) && propA['x-admonition'][0].content === 'Page A overlay only',
      'page A must carry its own overlay')
    assert.equal(propB['x-admonition'], undefined, 'page B must not inherit page A overlay through the shared reference')
    assert.equal(propA['x-zilliz-availability'], 'PUBLIC_PREVIEW')
    assert.equal(propB['x-zilliz-availability'], 'PUBLIC_PREVIEW')
  } finally {
    fs.rmSync(targetPath, {recursive: true, force: true})
  }
})
