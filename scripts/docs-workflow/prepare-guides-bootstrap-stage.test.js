'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const { prepareGuidesBootstrapStage } = require('./prepare-guides-bootstrap-stage')

function write(root, relative, contents) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
}

function fixture() {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-bootstrap-stage-'))
  const decision = path.join(workspace, 'decision.json')
  const matrix = path.join(workspace, 'matrix.json')
  write(workspace, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/home.md', 'home')
  write(workspace, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/legacy.md', 'legacy')
  write(workspace, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc/tutorials/legacy.md', 'legacy')
  fs.writeFileSync(decision, JSON.stringify({ mode: 'regenerate', baselineDescriptorPresent: false, tableCount: 2 }))
  fs.writeFileSync(matrix, JSON.stringify({ include: [
    { site: 'zh-CN', target: 'zilliz.saas', table_slug: 'management', cleanup: false },
    { site: 'zh-CN', target: 'zilliz.paas', table_slug: 'management', cleanup: false },
  ] }))
  return { workspace, decision, matrix }
}

test('Chinese first bootstrap clears seeded Guides output while preserving the owned home page', () => {
  const f = fixture()
  const result = prepareGuidesBootstrapStage({ site: 'zh-CN', workspace: f.workspace, decisionFile: f.decision, matrixFile: f.matrix })

  assert.equal(result.cleaned, true)
  assert.equal(fs.readFileSync(path.join(f.workspace, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/home.md'), 'utf8'), 'home')
  assert.equal(fs.existsSync(path.join(f.workspace, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/legacy.md')), false)
  assert.equal(fs.existsSync(path.join(f.workspace, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc/tutorials/legacy.md')), false)
})

test('existing descriptor and English assembly are unchanged', () => {
  for (const [site, baselineDescriptorPresent] of [['zh-CN', true], ['en', false]]) {
    const f = fixture()
    const decision = JSON.parse(fs.readFileSync(f.decision, 'utf8'))
    decision.baselineDescriptorPresent = baselineDescriptorPresent
    fs.writeFileSync(f.decision, JSON.stringify(decision))
    const result = prepareGuidesBootstrapStage({ site, workspace: f.workspace, decisionFile: f.decision, matrixFile: f.matrix })
    assert.equal(result.cleaned, false)
    assert.equal(fs.existsSync(path.join(f.workspace, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/legacy.md')), true)
  }
})
