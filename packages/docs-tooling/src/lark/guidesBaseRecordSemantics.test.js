'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {
  guidesPlacementType,
  guidesRecordCreatesNavigation,
  guidesRecordCreatesPage,
  guidesCanonicalIsPublishable,
  guidesRecordPublishTargets,
  guidesRecordChannel,
  guidesRecordRefTarget,
} = require('./guidesBaseRecordSemantics')

test('uses explicit Guides placement types', () => {
  for (const placement of ['canonical', 'section', 'link', 'ref']) {
    const record = { fields: { 'Placement Type': placement } }
    assert.equal(guidesPlacementType(record, { guidesMode: true }), placement)
    assert.equal(guidesRecordCreatesNavigation(record, { guidesMode: true }), true)
    assert.equal(guidesRecordCreatesPage(record, { guidesMode: true }), placement === 'canonical')
  }
})

test('publishes canonical only for explicitly allowed Progress values', () => {
  for (const progress of ['Draft', 'Reviewed', 'Published', 'Approved', 'Publish']) {
    assert.equal(guidesCanonicalIsPublishable({ placement_type: 'canonical', progress }), true)
  }
  for (const progress of ['', 'Not Start Yet', 'WIP', 'Deprecated']) {
    assert.equal(guidesCanonicalIsPublishable({ placement_type: 'canonical', progress }), false)
  }
  assert.equal(guidesCanonicalIsPublishable({ placement_type: 'section', progress: 'Draft' }), false)
})

test('infers canonical only from Feishu or Lark document links in Guides mode', () => {
  assert.equal(guidesPlacementType({ fields: { Docs: '[Doc](https://zilliverse.feishu.cn/wiki/token)' } }, { guidesMode: true }), 'canonical')
  assert.equal(guidesPlacementType({ fields: { Docs: { text: 'Doc', link: 'https://example.larksuite.com/docx/token' } } }, { guidesMode: true }), 'canonical')
  assert.equal(guidesPlacementType({ fields: { Docs: '[Section](http://Section)' } }, { guidesMode: true }), 'section')
})

test('does not apply Guides inference to SDK records', () => {
  const sdkRecord = { fields: { Docs: '[Function](https://example.feishu.cn/docx/token)', Type: 'Function' } }
  assert.equal(guidesPlacementType(sdkRecord), null)
  assert.equal(guidesRecordCreatesNavigation(sdkRecord), false)
})

test('normalizes publish targets and ref targets without using Progress', () => {
  const canonical = {
    base_placement_type: 'canonical',
    base_targets: ['Zilliz.SaaS', { text: 'Zilliz.PaaS' }],
    base_status: null,
  }
  assert.deepEqual(guidesRecordPublishTargets(canonical), ['zilliz.saas', 'zilliz.paas'])
  assert.equal(guidesRecordCreatesPage(canonical), true)
  assert.equal(guidesRecordRefTarget({ base_placement_type: 'ref', base_ref_target_doc: 'wiki-token' }), 'wiki-token')
  assert.equal(guidesRecordRefTarget({ fields: {'Ref Target Doc': {text: 'Canonical page', link: 'https://zilliverse.feishu.cn/wiki/wiki-token'}} }), 'https://zilliverse.feishu.cn/wiki/wiki-token')
})

test('normalizes Release Channel with CURRENT default for legacy records', () => {
  assert.equal(guidesRecordChannel({ fields: { 'Release Channel': 'NEXT' } }), 'next')
  assert.equal(guidesRecordChannel({ fields: { 'Release Channel': { text: 'Current' } } }), 'current')
  assert.equal(guidesRecordChannel({ base_channel: 'next' }), 'next')
  assert.equal(guidesRecordChannel({ fields: {} }), 'current')
  assert.equal(guidesRecordChannel({}), 'current')
  assert.equal(guidesRecordChannel(null), 'current')
  // Unrecognized values fall back to CURRENT instead of publishing early.
  assert.equal(guidesRecordChannel({ fields: { 'Release Channel': 'beta' } }), 'current')
})

test('normalizes RETIRE-IN-NEXT and keeps near-misses on CURRENT', () => {
  assert.equal(guidesRecordChannel({ fields: { 'Release Channel': 'RETIRE-IN-NEXT' } }), 'retire-in-next')
  assert.equal(guidesRecordChannel({ fields: { 'Release Channel': { text: 'Retire-in-Next' } } }), 'retire-in-next')
  assert.equal(guidesRecordChannel({ base_channel: 'retire-in-next' }), 'retire-in-next')
  // Staged retirement stays an explicit editorial act, exactly like promotion
  // to NEXT: approximate spellings fall back to CURRENT.
  assert.equal(guidesRecordChannel({ fields: { 'Release Channel': 'to-retire' } }), 'current')
  assert.equal(guidesRecordChannel({ fields: { 'Release Channel': 'retired' } }), 'current')
})
