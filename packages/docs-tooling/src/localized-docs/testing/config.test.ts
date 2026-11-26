// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  mergeVariables,
  parseLocalizedPageConfig,
  parseLocalizedVariables,
  resolvePageLifecycleState,
  validatePageId,
} from '../core/config.ts'

describe('validatePageId', () => {
  it('accepts lowercase hyphenated slugs', () => {
    expect(validatePageId('delete-entities')).toEqual({ pageId: 'delete-entities' })
    expect(validatePageId('get-and-scalar-query-v2')).toEqual({ pageId: 'get-and-scalar-query-v2' })
    expect(validatePageId('a')).toEqual({ pageId: 'a' })
  })

  it.each([
    'active',
    '',
    '.',
    '..',
    '../escape',
    'foo/bar',
    'foo\\bar',
    'Delete_Entities',
    'delete--entities',
    '-leading',
    'trailing-',
  ])('rejects invalid or reserved page ID %j', badId => {
    const res = validatePageId(badId)
    expect('errors' in res).toBe(true)
    if ('errors' in res) {
      expect(res.errors[0].code).toBe('CONFIG_PAGE_ID_INVALID')
    }
  })
})

describe('parseLocalizedVariables & mergeVariables', () => {
  it('parses valid Variables.json and rejects malformed JSON or case collisions', () => {
    const ok = parseLocalizedVariables('{"product_name":"Zilliz Cloud","region":"cn-hangzhou"}')
    expect('variables' in ok).toBe(true)

    const badJson = parseLocalizedVariables('{invalid')
    expect('errors' in badJson && badJson.errors[0].code).toBe('CONFIG_SYNTAX_INVALID')

    const nonObject = parseLocalizedVariables('["a"]')
    expect('errors' in nonObject && nonObject.errors[0].code).toBe('CONFIG_VARIABLES_INVALID')

    const collision = parseLocalizedVariables('{"region":"cn","Region":"us"}')
    expect('errors' in collision && collision.errors[0].code).toBe('CONFIG_VARIABLES_INVALID')
  })

  it('merges page-level variables over group variables including case-folded overrides', () => {
    const merged = mergeVariables(
      { product_name: 'Zilliz Cloud', Region: 'cn-shanghai' },
      { region: 'cn-hangzhou', cluster_tier: 'Enterprise' },
    )
    expect(merged).toEqual({
      variables: {
        product_name: 'Zilliz Cloud',
        region: 'cn-hangzhou',
        cluster_tier: 'Enterprise',
      },
    })
  })
})

describe('parseLocalizedPageConfig', () => {
  it('accepts incremental, manual, and paused modes', () => {
    const incremental = parseLocalizedPageConfig(
      'delete-entities',
      `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
sync_policy: independent
variables:
  region: cn-hangzhou
`,
    )
    expect('config' in incremental).toBe(true)

    const manual = parseLocalizedPageConfig(
      'region-and-network',
      `schema_version: 1
mode: manual
en_source:
  manual: guides
  shared_page: region-and-network
notify_on_en_change: true
`,
    )
    expect('config' in manual).toBe(true)

    const paused = parseLocalizedPageConfig(
      'global-only-feature',
      `schema_version: 1
mode: paused
en_source:
  manual: guides
  shared_page: global-only-feature
pause_reason: "中国站暂未上线该能力"
follow_up: "@zilliztech/docs-team"
`,
    )
    expect('config' in paused).toBe(true)
  })

  it('explicitly rejects legacy owner and feishu_record_id fields', () => {
    const withOwner = parseLocalizedPageConfig(
      'delete-entities',
      `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
owner: "@alice"
`,
    )
    expect('errors' in withOwner).toBe(true)
    if ('errors' in withOwner) {
      expect(withOwner.errors.map(e => e.code)).toContain('CONFIG_LEGACY_FIELD_FORBIDDEN')
      expect(withOwner.errors[0].message).toContain('owner')
    }

    const withRecordId = parseLocalizedPageConfig(
      'delete-entities',
      `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
feishu_record_id: rec123456
`,
    )
    expect('errors' in withRecordId).toBe(true)
    if ('errors' in withRecordId) {
      expect(withRecordId.errors.map(e => e.code)).toContain('CONFIG_LEGACY_FIELD_FORBIDDEN')
      expect(withRecordId.errors[0].message).toContain('feishu_record_id')
    }
  })

  it('rejects invalid fields, wrong en_source manual, pause fields on non-paused modes, and non-scalar variables', () => {
    const badManual = parseLocalizedPageConfig(
      'delete-entities',
      `schema_version: 1
mode: incremental
en_source:
  manual: guides-byoc
  shared_page: delete-entities
`,
    )
    expect('errors' in badManual).toBe(true)

    const badPauseField = parseLocalizedPageConfig(
      'delete-entities',
      `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
follow_up: "@zilliztech/docs-team"
`,
    )
    expect('errors' in badPauseField).toBe(true)

    const badVarValue = parseLocalizedPageConfig(
      'delete-entities',
      `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: delete-entities
variables:
  nested:
    a: b
`,
    )
    expect('errors' in badVarValue).toBe(true)
    if ('errors' in badVarValue) {
      expect(badVarValue.errors[0].code).toBe('CONFIG_VARIABLES_INVALID')
    }

    const badSharedPage = parseLocalizedPageConfig(
      'delete-entities',
      `schema_version: 1
mode: incremental
en_source:
  manual: guides
  shared_page: active
`,
    )
    expect('errors' in badSharedPage).toBe(true)
  })
})

describe('resolvePageLifecycleState', () => {
  it('distinguishes pending-initial-translation from baseline-missing-error strictly', () => {
    expect(resolvePageLifecycleState('incremental', false, false)).toBe('pending-initial-translation')
    expect(resolvePageLifecycleState('incremental', true, false)).toBe('baseline-missing-error')
    expect(resolvePageLifecycleState('incremental', false, true)).toBe('source-missing-error')
    expect(resolvePageLifecycleState('incremental', true, true)).toBe('ready')

    expect(resolvePageLifecycleState('manual', false, false)).toBe('source-missing-error')
    expect(resolvePageLifecycleState('manual', true, false)).toBe('baseline-missing-error')
    expect(resolvePageLifecycleState('manual', false, true)).toBe('source-missing-error')
    expect(resolvePageLifecycleState('manual', true, true)).toBe('ready')

    expect(resolvePageLifecycleState('paused', false, false)).toBe('paused')
    expect(resolvePageLifecycleState('paused', true, false)).toBe('baseline-missing-error')
    expect(resolvePageLifecycleState('paused', false, true)).toBe('source-missing-error')
    expect(resolvePageLifecycleState('paused', true, true)).toBe('ready')
  })
})
