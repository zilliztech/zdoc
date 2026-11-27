'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const sharedRouting = require('./sharedPageRouting')
const localizedRouting = require('./localizedPageRouting')
const { validateGuidesBasePreflight } = require('./guidesBasePreflight')
const { createSourceSnapshot, validateCandidateSnapshot } = require('./sourceSnapshot')
const { planIncrementalFetch } = require('./incrementalFetchPlanner')

const ZH_LINK = 'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/delete-entities'
const EN_LINK = 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/delete-entities'
const DIGEST = 'a'.repeat(64)

function zhRow(id = 'rec-zh', docs = ZH_LINK, slug = 'delete-entities', table = 'tbl-zh') {
  return {
    record_id: id,
    base_table_id: table,
    base_table_name: '从这里开始',
    fields: {
      Docs: { link: docs, text: slug },
      'Placement Type': 'canonical',
      Slug: slug,
      'Page URL': `tutorials/manage-data/${slug}`,
      Progress: 'Published',
      Targets: ['zilliz.saas'],
    },
  }
}

function makeTemp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'localized-routing-test-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  return dir
}

test('symmetric site isolation: EN rejects localized-docs URLs with OWNERSHIP_PATH_MISMATCH and zh-CN rejects shared-docs URLs', () => {
  // EN encountering localized-docs/... -> OWNERSHIP_PATH_MISMATCH
  const enRoute = sharedRouting.classifySourceRoute(ZH_LINK)
  assert.equal(enRoute.kind, 'invalid')
  assert.equal(enRoute.code, 'OWNERSHIP_PATH_MISMATCH')

  const enCtx = sharedRouting.createRoutingContext({
    records: [zhRow('rec-en-bad', ZH_LINK)],
    availablePages: ['guides/delete-entities'],
  })
  assert.equal(enCtx.routesByRecordId.get('rec-en-bad').code, 'OWNERSHIP_PATH_MISMATCH')
  assert.equal(enCtx.errors[0].code, 'OWNERSHIP_PATH_MISMATCH')

  // zh-CN encountering shared-docs/... -> OWNERSHIP_PATH_MISMATCH
  const zhRoute = localizedRouting.classifyLocalizedSourceRoute(EN_LINK, {
    site: 'zh-CN',
    availablePages: ['delete-entities'],
  })
  assert.equal(zhRoute.kind, 'invalid')
  assert.equal(zhRoute.code, 'OWNERSHIP_PATH_MISMATCH')

  const zhCtx = localizedRouting.createLocalizedRoutingContext({
    site: 'zh-CN',
    records: [zhRow('rec-zh-bad', EN_LINK)],
    availablePages: ['delete-entities'],
  })
  assert.equal(zhCtx.errors[0].code, 'OWNERSHIP_PATH_MISMATCH')
})

test('zh-CN Guides Base preflight accepts localized-page records, rejects OWNERSHIP_REVERTED, and skips Feishu doc requirement', () => {
  const records = [zhRow('rec-1', ZH_LINK, 'delete-entities')]
  const routingContext = localizedRouting.createLocalizedRoutingContext({
    site: 'zh-CN',
    records,
    availablePages: ['delete-entities'],
    localizedInputsByPageUrl: new Map([
      [
        'tutorials/manage-data/delete-entities',
        {
          locale: 'zh-CN',
          group: 'guides',
          page: 'delete-entities',
          page_url: 'tutorials/manage-data/delete-entities',
          inputs_sha256: DIGEST,
          record: 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json',
        },
      ],
    ]),
  })

  const preflight = validateGuidesBasePreflight({
    site: 'zh-CN',
    tables: [{ table_id: 'tbl-zh', name: '从这里开始' }],
    records,
    routingContext,
  })
  assert.deepEqual(preflight, { tables: 1, records: 1 })

  // Active page_url reverted to Feishu must throw OWNERSHIP_REVERTED even if record_id changed
  assert.throws(
    () =>
      localizedRouting.createLocalizedRoutingContext({
        site: 'zh-CN',
        records: [zhRow('rec-NEW-ID', 'https://zilliverse.feishu.cn/wiki/old-doc', 'delete-entities')],
        availablePages: ['delete-entities'],
        active: {
          schema_version: 1,
          locale: 'zh-CN',
          group: 'guides',
          pages: [
            {
              page: 'delete-entities',
              page_url: 'tutorials/manage-data/delete-entities',
              feishu_token: 'old-doc',
              anchors: {},
              activated_in: 'run-1',
              last_seen_record_id: 'rec-OLD-ID',
            },
          ],
        },
      }),
    { code: 'OWNERSHIP_REVERTED' },
  )
})

test('sourceSnapshot and incrementalFetchPlanner support localized-page with record_id change immunity and digest delta detection', t => {
  const dir = makeTemp(t)
  const recordsV1 = [zhRow('rec-OLD', ZH_LINK, 'delete-entities')]
  const ctxV1 = localizedRouting.createLocalizedRoutingContext({
    site: 'zh-CN',
    records: recordsV1,
    availablePages: ['delete-entities'],
    localizedInputsByPageUrl: new Map([
      [
        'tutorials/manage-data/delete-entities',
        {
          locale: 'zh-CN',
          group: 'guides',
          page: 'delete-entities',
          page_url: 'tutorials/manage-data/delete-entities',
          inputs_sha256: DIGEST,
          record: 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json',
        },
      ],
    ]),
  })

  const snap1 = createSourceSnapshot({
    manualName: 'guides',
    buildEnv: 'uat',
    docSourceDir: dir,
    baseAppToken: 'base-zh',
    records: recordsV1,
    routingContext: ctxV1,
    outputPathsByPageUrl: new Map([
      ['tutorials/manage-data/delete-entities', ['content/zh-CN/guides/tutorials/manage-data/delete-entities.md']],
    ]),
  })
  assert.equal(snap1.records[0].source_kind, 'localized-page')
  assert.equal(snap1.records[0].doc_token, null)
  assert.equal(snap1.records[0].localized_page.inputs_sha256, DIGEST)
  assert.doesNotThrow(() => validateCandidateSnapshot(snap1))

  // record_id changes rec-OLD -> rec-NEW while page_url & inputs_sha256 stay identical => zero changed/removed records!
  const recordsV2 = [zhRow('rec-NEW', ZH_LINK, 'delete-entities')]
  const ctxV2 = localizedRouting.createLocalizedRoutingContext({
    site: 'zh-CN',
    records: recordsV2,
    availablePages: ['delete-entities'],
    localizedInputsByPageUrl: new Map([
      [
        'tutorials/manage-data/delete-entities',
        {
          locale: 'zh-CN',
          group: 'guides',
          page: 'delete-entities',
          page_url: 'tutorials/manage-data/delete-entities',
          inputs_sha256: DIGEST,
          record: 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json',
        },
      ],
    ]),
  })
  const planSameDigest = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: recordsV2,
    previousSnapshot: snap1,
    routingContext: ctxV2,
  })
  assert.equal(planSameDigest.removed_records.length, 0)
  assert.equal(planSameDigest.changed_records.length, 0)

  // Git Chinese source changes (new inputs_sha256) while Feishu record is unchanged => triggers localized inputs changed!
  const ctxV3 = localizedRouting.createLocalizedRoutingContext({
    site: 'zh-CN',
    records: recordsV2,
    availablePages: ['delete-entities'],
    localizedInputsByPageUrl: new Map([
      [
        'tutorials/manage-data/delete-entities',
        {
          locale: 'zh-CN',
          group: 'guides',
          page: 'delete-entities',
          page_url: 'tutorials/manage-data/delete-entities',
          inputs_sha256: 'b'.repeat(64),
          record: 'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json',
        },
      ],
    ]),
  })
  const planChangedDigest = planIncrementalFetch({
    manualName: 'guides',
    docSourceDir: dir,
    records: recordsV2,
    previousSnapshot: snap1,
    routingContext: ctxV3,
  })
  assert.equal(planChangedDigest.changed_records.length, 1)
  assert.ok(planChangedDigest.changed_records[0].reasons.includes('localized inputs changed'))
  assert.deepEqual(planChangedDigest.changed_tokens, [])
})
