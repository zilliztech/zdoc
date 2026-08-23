'use strict'

const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')
const { commandsFor } = require('./docs-workflow/run-content-group')
const { buildGuidesTableMatrix } = require('./docs-workflow/guides-tables')
const { guidesPlacementType } = require('../packages/docs-tooling/src/lark/guidesBaseRecordSemantics')
const { loadTypeScript } = require('./lib/load-typescript')

const { larkDocsConfigForSite } = loadTypeScript(path.resolve(__dirname, '../packages/docs-tooling/src/manuals/derive/larkConfigView.ts'))

function activeSdks(site = 'en') {
  const view = larkDocsConfigForSite(site)
  return Object.entries(view).filter(([name]) => name !== 'guides')
}

test('Guides is the only all-table manual and SDK manuals keep independent single-table Bases', () => {
  const view = larkDocsConfigForSite('en')
  const guides = view.guides
  assert.match(guides.base, /:\*$/)
  assert.equal(guides.sourceType, 'wiki')
  assert.equal(Object.hasOwn(view, 'agents'), false)

  const sdk = activeSdks('en')
  for (const [name, block] of sdk) {
    assert.ok(block.base, `${name} must have a Base`)
    assert.equal(block.base.includes(':'), false, `${name} must not use an all-table selector`)
  }
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
    site: 'en',
    plan: { mode: 'incremental', affected_tables: [] },
    snapshot: { schema_version: 2, manual: 'pymilvus30', records: [] },
  }), /Guides snapshot schema v3/i)
})
