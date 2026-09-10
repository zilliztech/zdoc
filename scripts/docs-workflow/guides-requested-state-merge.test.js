'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  mergeRequestedSnapshot,
  planRequestedGuidesFetch,
} = require('../../packages/docs-tooling/src/lark/requestedGuidesFetchPlanner')
const { createGuidesNavigationState, sourceFilesByToken } = require('../../packages/docs-tooling/src/lark/sourceSnapshot')
const { canonicalRecordsFrom } = require('../../packages/docs-tooling/src/lark/canonicalLinkAuditor')

const SCRIPT = path.join(__dirname, 'guides-requested-state-merge.js')

function writeRenderableSource(dir, token, { outgoingTokens = [], salt = '' } = {}) {
  fs.writeFileSync(path.join(dir, `${token}.json`), JSON.stringify({
    title: token,
    slug: token,
    node_token: token,
    base_record_id: `rec-${token}`,
    base_placement_type: 'canonical',
    blocks: { items: [
      { block_id: 'page', block_type: 1, text: { elements: [{ text_run: { content: `${token}${salt}` } }] } },
      { block_id: 'body', block_type: 2, text: { elements: [{ text_run: { content: `${token} body${salt}` } }] } },
      ...outgoingTokens.map((target, index) => ({
        block_id: `ref${index}`,
        block_type: 3,
        text: { elements: [{ mention_doc: { title: target, url: `https://zilliverse.feishu.cn/wiki/${target}` } }] },
      })),
    ] },
  }))
}

function record(token, { title = token, table = 'tbl-1' } = {}) {
  return {
    record_id: `rec-${token}`,
    base_table_id: table,
    base_table_name: table,
    fields: {
      Docs: { text: title, link: `https://zilliverse.feishu.cn/wiki/${token}` },
      Slug: token,
      Progress: 'Draft',
      'Placement Type': 'canonical',
    },
  }
}

function buildFixture(directory) {
  fs.mkdirSync(path.join(directory, 'sources'), { recursive: true })
  writeRenderableSource(path.join(directory, 'sources'), 'a')
  writeRenderableSource(path.join(directory, 'sources'), 'b')
  fs.writeFileSync(path.join(directory, 'sources', 'root.json'), JSON.stringify({
    title: 'root', token: 'root', type: 'folder', children: [{ node_token: 'a' }, { node_token: 'b' }],
  }))
  const baselineRecords = [record('a'), record('b')]
  const sources = sourceFilesByToken(path.join(directory, 'sources'))
  const navigation = createGuidesNavigationState(baselineRecords)
  const baseline = {
    schema_version: 3,
    manual: 'guides',
    generated_at: '2026-09-07T00:00:00.000Z',
    records: canonicalRecordsFrom(baselineRecords, { guidesPublishableOnly: true }).map(entry => ({
      record_id: entry.record_id,
      table_id: entry.table_id,
      placement_type: 'canonical',
      title: entry.title,
      slug: entry.slug,
      doc_token: entry.doc_token,
      doc_link: entry.doc_link,
      source_file: `${entry.doc_token}.json`,
      source_hash: sources.get(entry.doc_token).__source_hash,
      publish_targets: [],
      publish_status: 'Draft',
      outgoing_tokens: [],
      output_paths: [],
      node_metadata: null,
      node_token: entry.doc_token,
      origin_node_token: null,
      obj_token: null,
      obj_type: null,
      obj_edit_time: null,
      revision_id: null,
    })),
    navigation_records: navigation.navigationRecords,
    table_digests: navigation.tableDigests,
  }
  const current = [record('a', { title: 'New A' }), record('b')]
  const plan = planRequestedGuidesFetch({
    site: 'en',
    buildEnv: 'uat',
    docSourceDir: path.join(directory, 'sources'),
    records: current,
    previousSnapshot: baseline,
    currentNodeMetadataByToken: new Map(),
    requestedTokens: ['a'],
    selectionEntries: [],
    selectionInputSha256: null,
    refreshedTokens: ['a', 'b'],
    sourceByToken: sources,
    generatedAt: '2026-09-09T00:00:00.000Z',
  })
  writeRenderableSource(path.join(directory, 'sources'), 'a', { outgoingTokens: ['b'], salt: '-refreshed' })
  const { candidate, receipt } = mergeRequestedSnapshot({
    site: 'en',
    buildEnv: 'uat',
    docSourceDir: path.join(directory, 'sources'),
    rootToken: 'root',
    baseAppToken: 'app-token',
    records: current,
    previousSnapshot: baseline,
    plan,
    generatedAt: '2026-09-09T00:00:00.000Z',
  })
  const paths = {
    plan: path.join(directory, 'plan.json'),
    candidate: path.join(directory, 'candidate.json'),
    receipt: path.join(directory, 'receipt.json'),
    baseline: path.join(directory, 'baseline.json'),
    output: path.join(directory, 'verdict.json'),
  }
  fs.writeFileSync(paths.plan, JSON.stringify(plan, null, 2))
  fs.writeFileSync(paths.candidate, JSON.stringify(candidate, null, 2))
  fs.writeFileSync(paths.receipt, JSON.stringify(receipt, null, 2))
  fs.writeFileSync(paths.baseline, JSON.stringify(baseline, null, 2))
  return paths
}

test('state-merge verify CLI authenticates a genuine receipt end to end', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-state-merge-'))
  try {
    const paths = buildFixture(directory)
    const run = spawnSync(process.execPath, [
      SCRIPT, 'verify',
      '--receipt', paths.receipt,
      '--plan', paths.plan,
      '--candidate', paths.candidate,
      '--baseline', paths.baseline,
      '--source-dir', path.join(directory, 'sources'),
      '--root-token', 'root',
      '--site', 'en',
      '--output', paths.output,
    ], { encoding: 'utf8' })
    assert.equal(run.status, 0, run.stderr)
    const verdict = JSON.parse(run.stdout)
    assert.equal(verdict.verified, true)
    assert.equal(verdict.state_promotion, 'none')
    assert.ok(fs.existsSync(paths.output))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('state-merge verify CLI rejects a tampered receipt and a mutated plan', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'requested-state-merge-'))
  try {
    const paths = buildFixture(directory)
    const receiptOriginal = fs.readFileSync(paths.receipt)
    const receipt = JSON.parse(receiptOriginal)
    receipt.merge.replaced_records = 99
    fs.writeFileSync(paths.receipt, JSON.stringify(receipt, null, 2))
    const tampered = spawnSync(process.execPath, [
      SCRIPT, 'verify', '--receipt', paths.receipt, '--plan', paths.plan, '--candidate', paths.candidate,
    ], { encoding: 'utf8' })
    assert.notEqual(tampered.status, 0)
    assert.match(tampered.stderr, /REQUESTED_STATE_MERGE_INVALID/)

    fs.writeFileSync(paths.receipt, receiptOriginal)
    const plan = JSON.parse(fs.readFileSync(paths.plan, 'utf8'))
    plan.automatic_changed_tokens = ['smuggled']
    fs.writeFileSync(paths.plan, JSON.stringify(plan, null, 2))
    const mutatedPlan = spawnSync(process.execPath, [
      SCRIPT, 'verify', '--receipt', paths.receipt, '--plan', paths.plan, '--candidate', paths.candidate,
    ], { encoding: 'utf8' })
    assert.notEqual(mutatedPlan.status, 0)
    assert.match(mutatedPlan.stderr, /REQUESTED_STATE_MERGE_INVALID/)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
