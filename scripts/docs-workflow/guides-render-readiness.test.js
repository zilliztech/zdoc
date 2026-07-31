'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { validateGuidesRenderReadiness } = require('./guides-render-readiness')

function fixture() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-render-readiness-'))
  const sourceDir = 'packages/docs-tooling/src/lark/meta/sources/guides-zh-CN'
  fs.mkdirSync(path.join(workspace, sourceDir), { recursive: true })
  fs.writeFileSync(path.join(workspace, sourceDir, 'root.json'), JSON.stringify({ node_token: 'root', children: [{ node_token: 'doc' }] }))
  const source = { node_token: 'doc', blocks: { items: [{ block_type: 1 }, { block_type: 2 }] } }
  const bytes = Buffer.from(JSON.stringify(source))
  fs.writeFileSync(path.join(workspace, sourceDir, 'doc.json'), bytes)
  const snapshot = {
    manual: 'guides', build_env: 'uat',
    records: [{ placement_type: 'canonical', doc_token: 'doc', source_file: 'doc.json', source_hash: require('node:crypto').createHash('sha256').update(bytes).digest('hex') }],
  }
  return { workspace, sourceDir, snapshot }
}

test('accepts a renderer bound to the exact site-owned Guides source graph', () => {
  const value = fixture()
  assert.equal(validateGuidesRenderReadiness({
    ...value,
    site: 'zh-CN',
    manual: { root: 'root', base: 'base:*', docSourceDir: `./${value.sourceDir}` },
    expectedSource: { root: 'root', base: 'base:*', sourceDir: value.sourceDir },
  }).validCanonicalSources, 1)
})

test('rejects a renderer still bound to another locale before table jobs start', () => {
  const value = fixture()
  assert.throws(() => validateGuidesRenderReadiness({
    ...value,
    site: 'zh-CN',
    manual: { root: 'english-root', base: 'english-base:*', docSourceDir: './packages/docs-tooling/src/lark/meta/sources/guides' },
    expectedSource: { root: 'root', base: 'base:*', sourceDir: value.sourceDir },
  }), /renderer source identity mismatch/i)
})
