'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const RefGen = require('./refGen')

test('synthetic REST version pages serialize empty descriptions as YAML strings', () => {
  const targetPath = fs.mkdtempSync(path.join(os.tmpdir(), 'rest-frontmatter-'))
  try {
    const generator = new RefGen({
      lang: 'en-US',
      target: 'zilliz',
      target_path: targetPath,
      specifications: {
        tags: [{ name: 'Collections (V2)' }],
        paths: {
          '/v2/collections': {
            get: {
              summary: 'List Collections',
              tags: ['Collections (V2)'],
              responses: { 200: { description: 'ok' } },
            },
          },
        },
      },
    })

    generator.make_groups()

    const versionPage = fs.readFileSync(path.join(targetPath, 'v2/v2.mdx'), 'utf8')
    assert.match(versionPage, /^description: ""$/m)
    assert.doesNotMatch(versionPage, /^description: null$/m)
  } finally {
    fs.rmSync(targetPath, { recursive: true, force: true })
  }
})
