'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const {loadTypeScript} = require('../lib/load-typescript')

const repositoryRoot = path.resolve(__dirname, '../..')
const {classifyEvidencePath, evidenceGroup, evidenceGroupPaths, evidenceGroups} = loadTypeScript(
  '../../packages/docs-tooling/src/publication/evidenceGroups.ts',
)

const GROUP_ENTRY_IDS = Object.freeze({
  'fetch': 'evidence-fetch-publication',
  'spec-derived': 'evidence-rest-derivation',
  'translation': 'evidence-translation-publication',
})

function loadMatrix() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'test-matrix.json'), 'utf8'))
}

// A matrix pattern maps to an authority path: directory patterns declare their
// root; exact patterns declare themselves.
function patternToAuthorityPath(pattern) {
  if (pattern.endsWith('/**')) return pattern.slice(0, -3)
  return pattern
}

test('evidence group matrix entries exist and their patterns mirror the evidenceGroups authority', () => {
  const matrix = loadMatrix()
  for (const [groupId, entryId] of Object.entries(GROUP_ENTRY_IDS)) {
    const entry = matrix.entries.find(candidate => candidate.id === entryId)
    assert.ok(entry, `matrix entry ${entryId} must exist`)
    const authority = new Set(evidenceGroupPaths(evidenceGroup(groupId)))
    for (const pattern of entry.paths) {
      const authorityPath = patternToAuthorityPath(pattern)
      assert.equal(
        authority.has(authorityPath),
        true,
        `${entryId} pattern ${pattern} is not a ${groupId} evidence-group path`,
      )
    }
  }
})

test('every on-disk evidence group path is mapped by its group matrix entry', () => {
  const matrix = loadMatrix()
  for (const [groupId, entryId] of Object.entries(GROUP_ENTRY_IDS)) {
    const entry = matrix.entries.find(candidate => candidate.id === entryId)
    const patterns = new Set(entry.paths)
    for (const authorityPath of evidenceGroupPaths(evidenceGroup(groupId))) {
      const onDisk = fs.existsSync(path.join(repositoryRoot, authorityPath))
      if (!onDisk) continue
      const pattern = authorityPath.endsWith('.js') || authorityPath.endsWith('.json')
        ? authorityPath
        : `${authorityPath}/**`
      assert.equal(
        patterns.has(pattern),
        true,
        `${entryId} must map the on-disk ${groupId} path ${authorityPath} (expected pattern ${pattern})`,
      )
    }
  }
})

test('classification contract: retired manifests and overlapping group roots', () => {
  assert.deepEqual(evidenceGroups.map(group => group.id).sort(), ['fetch', 'spec-derived', 'translation'])
  // Retired governance manifests classify into no group.
  for (const retired of [
    'generated/zh-CN/manifests/import.json',
    'generated/zh-CN/manifests/tools-translations.json',
  ]) {
    assert.deepEqual(classifyEvidencePath(retired), [], retired)
  }
  // REST content under translation target roots classifies into both groups.
  assert.deepEqual(
    classifyEvidencePath('content/zh-CN/reference/api/restful/restful/v2/collections-list.md'),
    ['spec-derived', 'translation'],
  )
  assert.deepEqual(
    classifyEvidencePath('i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/collections-list.md'),
    ['spec-derived', 'translation'],
  )
})
