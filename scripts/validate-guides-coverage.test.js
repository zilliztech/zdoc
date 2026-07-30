'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { coverageConfigs, validateGuidesCoverage, validateGuidesSite } = require('./validate-guides-coverage')

function write(root, relative, value = '# Doc') { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); return file }

test('fails when generated docs are missing from the sidebar', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-')), docs = path.join(root, 'docs')
  write(docs, 'a.md'); write(docs, 'b.md'); write(docs, 'c.md')
  assert.throws(
    () => validateGuidesCoverage({ outputDir: docs, idPrefix: 'tutorials', sidebar: [{ type: 'doc', id: 'tutorials/a' }] }),
    error => /generated docs: 3/.test(error.message) && /sidebar docs\/refs: 1/.test(error.message) && /missing from sidebar: 2/.test(error.message),
  )
})

test('accepts category links and excludes only explicit release sidebar docs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-')), docs = path.join(root, 'docs')
  write(docs, 'guide/guide.md')
  write(docs, 'releases/note.md', '---\ndisplayed_sidebar: releasesSidebar\n---\n# Release')
  const result = validateGuidesCoverage({
    outputDir: docs,
    idPrefix: 'tutorials',
    sidebar: [{ type: 'category', label: 'Guide', link: { type: 'doc', id: 'tutorials/guide/guide' }, items: [] }],
  })
  assert.equal(result.generatedDocs, 1)
  assert.equal(result.sidebarDocs, 1)
})

test('fails when the sidebar references a missing generated document', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-')), docs = path.join(root, 'docs')
  write(docs, 'a.md')
  assert.throws(() => validateGuidesCoverage({ outputDir: docs, idPrefix: 'tutorials', sidebar: [{ type: 'doc', id: 'tutorials/missing' }] }), /missing generated files: 1/)
})

test('does not exempt obsolete Agents standalone sidebar metadata', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-')), docs = path.join(root, 'docs')
  write(docs, 'agents/tool.md', '---\ndisplayed_sidebar: agentsSidebar\n---\n# Agent')
  assert.throws(() => validateGuidesCoverage({ outputDir: docs, idPrefix: 'tutorials', sidebar: [] }), /missing from sidebar: 1/)
})

test('allows an explicitly preserved landing page outside Base navigation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-')), docs = path.join(root, 'docs')
  write(docs, 'home.md')
  const result = validateGuidesCoverage({
    outputDir: docs,
    idPrefix: 'tutorials',
    sidebar: [],
    ignoredGeneratedIds: ['tutorials/home'],
  })
  assert.equal(result.generatedDocs, 1)
  assert.deepEqual(result.missingFromSidebar, [])
})

test('maps both Chinese Cloud and BYOC publication units', () => {
  assert.deepEqual(coverageConfigs('zh-CN').map(config => [config.outputDir, config.sidebarPath]), [
    ['content/zh-CN/guides/tutorials', 'generated/zh-CN/sidebars/guides.sidebar.js'],
    ['content/zh-CN/byoc/tutorials', 'generated/zh-CN/sidebars/guides-byoc.sidebar.js'],
  ])
})

test('Chinese coverage requires Cloud, BYOC, and reachable Tools content', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-zh-'))
  const cloud = path.join(root, 'cloud')
  const byoc = path.join(root, 'byoc')
  const configs = [
    { outputDir: cloud, idPrefix: 'tutorials', sidebarPath: 'cloud.sidebar.js', kind: 'cloud' },
    { outputDir: byoc, idPrefix: 'tutorials', sidebarPath: 'byoc.sidebar.js', kind: 'byoc' },
  ]
  write(cloud, 'tools/tool.md')
  write(byoc, 'guide.md')
  const sidebars = {
    'cloud.sidebar.js': [{ type: 'doc', id: 'tutorials/tools/tool' }],
    'byoc.sidebar.js': [{ type: 'doc', id: 'tutorials/guide' }],
  }
  assert.equal(validateGuidesSite({ site: 'zh-CN', configs, loadSidebar: name => sidebars[name] }).length, 2)

  fs.rmSync(path.join(cloud, 'tools'), { recursive: true })
  assert.throws(
    () => validateGuidesSite({ site: 'zh-CN', configs, loadSidebar: name => sidebars[name] }),
    /missing generated files|must include Tools content/i,
  )
  write(cloud, 'tools/tool.md')
  sidebars['cloud.sidebar.js'] = []
  assert.throws(
    () => validateGuidesSite({ site: 'zh-CN', configs, loadSidebar: name => sidebars[name] }),
    /missing from sidebar|unreachable/i,
  )
  sidebars['cloud.sidebar.js'] = [{ type: 'doc', id: 'tutorials/tools/tool' }]
  fs.rmSync(byoc, { recursive: true })
  assert.throws(
    () => validateGuidesSite({ site: 'zh-CN', configs, loadSidebar: name => sidebars[name] }),
    /missing generated files|coverage mismatch/i,
  )
})
