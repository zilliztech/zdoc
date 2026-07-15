'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { validateGuidesCoverage } = require('./validate-guides-coverage')

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
