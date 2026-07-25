'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { commandsFor } = require('./docs-workflow/run-content-group')
const { buildGuidesTableMatrix } = require('./docs-workflow/guides-tables')
const { guidesPlacementType } = require('../packages/docs-tooling/src/lark/guidesBaseRecordSemantics')

function manualBlocks(source) {
  const blocks = new Map()
  const pattern = /const\s+(\w+)\s*:\s*Manual\s*=\s*\{/g
  let match
  while ((match = pattern.exec(source))) {
    let depth = 1
    let index = pattern.lastIndex
    while (depth > 0 && index < source.length) {
      if (source[index] === '{') depth += 1
      if (source[index] === '}') depth -= 1
      index += 1
    }
    blocks.set(match[1], source.slice(match.index, index))
  }
  return blocks
}

test('Guides is the only all-table manual and 18 SDK manuals keep independent single-table Bases', () => {
  const source = fs.readFileSync('config/lark-docs.config.ts', 'utf8')
  const manuals = manualBlocks(source)
  const guides = manuals.get('guides')
  assert.match(guides, /base:\s*'[^']+:\*'/)
  assert.match(guides, /sourceType:\s*'wiki'/)
  assert.equal(manuals.has('agents'), false)

  const sdk = [...manuals.entries()].filter(([name]) => name !== 'guides')
  assert.equal(sdk.length, 18)
  for (const [name, block] of sdk) {
    const base = block.match(/\n\s*base:\s*'([^']+)'/)?.[1]
    assert.ok(base, `${name} must have a Base`)
    assert.equal(base.includes(':'), false, `${name} must not use an all-table selector`)
    assert.doesNotMatch(block, /Placement Type|mediaManifest|offline/)
  }
  assert.match(manuals.get('javaV1'), /sourceType:\s*'onePager'/)
  assert.match(manuals.get('gov1'), /sourceType:\s*'wiki'/)
})

test('SDK command sequences never inherit Guides table or offline options', () => {
  for (const group of ['python', 'java', 'node', 'go', 'cli']) {
    const flat = commandsFor(group).flat()
    for (const forbidden of ['--offline', '--mediaManifest', '--table', '--snapshotCandidatePath']) {
      assert.equal(flat.includes(forbidden), false, `${group} must not include ${forbidden}`)
    }
  }
})

test('SDK record schemas do not enter Guides placement or matrix semantics', () => {
  const fixtures = [
    { fields: { Type: 'Function', '父记录': [{ record_ids: ['parent'] }], Slug: 'create' } },
    { fields: { Token: 'heading-token', Parent: [{ text: '1' }] } },
    { fields: { Parent: [{ text: '1' }], Docs: { text: 'Legacy', link: 'https://example.feishu.cn/wiki/token' } } },
  ]
  for (const fixture of fixtures) assert.equal(guidesPlacementType(fixture), null)
  assert.throws(() => buildGuidesTableMatrix({
    plan: { mode: 'incremental', affected_tables: [] },
    snapshot: { schema_version: 2, manual: 'pymilvus30', records: [] },
  }), /Guides snapshot schema v3/i)
})
