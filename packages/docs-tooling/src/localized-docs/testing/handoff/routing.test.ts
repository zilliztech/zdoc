// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  createLocalizedRoutingContext,
  normalizeLocalizedPageUrl,
  parseActiveLocalizedRegistry,
  tryNormalizeLocalizedPageUrl,
  validateActiveLocalizedRegistry,
  type ActiveLocalizedRegistry,
} from '../../core/handoff/routing.ts'

const PAGE_URL = 'tutorials/development/insert-and-delete/delete-entities'
const DOC_LINK =
  'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/delete-entities'
const OTHER_DOC_LINK =
  'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/insert-entities'
const FEISHU_LINK = 'https://zilliverse.feishu.cn/wiki/wikcnOldToken'

function makeActiveRegistry(overrides: Partial<ActiveLocalizedRegistry> = {}): ActiveLocalizedRegistry {
  return {
    schema_version: 1,
    locale: 'zh-CN',
    group: 'guides',
    pages: [
      {
        page: 'delete-entities',
        page_url: PAGE_URL,
        feishu_token: 'wikcnOldToken',
        feishu_aliases: ['wikcnOldToken', 'doxcnObjToken'],
        anchors: { blk123: 'delete-entities-by-filtering-conditions' },
        activated_in: '20261127001',
        last_seen_record_id: 'recA',
      },
    ],
    ...overrides,
  }
}

describe('localized-docs handoff routing (record_id-decoupled)', () => {
  it('normalizes localized page_url consistently and rejects unsafe values', () => {
    expect(normalizeLocalizedPageUrl(`/${PAGE_URL}/`)).toBe(PAGE_URL)
    expect(normalizeLocalizedPageUrl(`${PAGE_URL}.md`)).toBe(PAGE_URL)
    expect(normalizeLocalizedPageUrl(`/${PAGE_URL}.mdx`)).toBe(PAGE_URL)
    expect(normalizeLocalizedPageUrl(`/${PAGE_URL}.MD/`)).toBe(PAGE_URL)
    expect(normalizeLocalizedPageUrl('delete-entities')).toBe('delete-entities')
    expect(normalizeLocalizedPageUrl('/v2.4/milvus_lite')).toBe('v2.4/milvus_lite')

    for (const bad of [
      '',
      '/',
      '.md',
      'tutorials/.md',
      '..',
      '.',
      'tutorials/../secret',
      'tutorials/./page',
      'tutorials//page',
      '//tutorials/page',
      'https://docs.zilliz.com.cn/docs/delete-entities',
      'tutorials\\page',
      'tutorials/page?a=1',
      'tutorials/page#hash',
      'tutorials/page with space',
      'tutorials/page\nnext',
      'tutorials/page\0null',
      'tutorials/%2e%2e/secret',
      'tutorials/foo..bar',
      'tutorials/trailing.',
      null,
      123,
    ]) {
      expect(() => normalizeLocalizedPageUrl(bad), String(bad)).toThrow()
      expect(tryNormalizeLocalizedPageUrl(bad), String(bad)).toBeNull()
    }
  })

  it('validates ActiveLocalizedRegistry schema strictly while keeping last_seen_record_id reference-only', () => {
    const valid = makeActiveRegistry()
    expect(validateActiveLocalizedRegistry(valid)).toBe(valid)
    expect(parseActiveLocalizedRegistry(JSON.stringify(valid))).toEqual(valid)

    // Two pages with omitted or identical last_seen_record_id are still valid because
    // last_seen_record_id is reference-only and NEVER a uniqueness key.
    const sharedRefRecord = makeActiveRegistry({
      pages: [
        valid.pages[0],
        {
          page: 'insert-entities',
          page_url: 'tutorials/development/insert-and-delete/insert-entities',
          feishu_token: null,
          feishu_aliases: [],
          anchors: {},
          activated_in: '20261127002',
          last_seen_record_id: 'recA',
        },
      ],
    })
    expect(validateActiveLocalizedRegistry(sharedRefRecord)).toBe(sharedRefRecord)

    // Reject schema mismatches, unknown fields, non-canonical page_url, duplicate page/page_url/alias
    const invalidMutations: unknown[] = [
      { ...valid, schema_version: 2 },
      { ...valid, locale: 'en' },
      { ...valid, group: 'reference' },
      { ...valid, extra: true },
      { ...valid, pages: [{ ...valid.pages[0], page: 'active' }] },
      { ...valid, pages: [{ ...valid.pages[0], page_url: `/${PAGE_URL}.md` }] },
      { ...valid, pages: [{ ...valid.pages[0], feishu_token: 'base_123' }] },
      { ...valid, pages: [{ ...valid.pages[0], feishu_aliases: ['doxcnObjToken'] }] }, // missing primary token
      { ...valid, pages: [{ ...valid.pages[0], feishu_token: null, feishu_aliases: ['doxcnObjToken'] }] },
      { ...valid, pages: [{ ...valid.pages[0], anchors: { blk: '../bad' } }] },
      { ...valid, pages: [{ ...valid.pages[0], activated_in: '' }] },
      { ...valid, pages: [{ ...valid.pages[0], unknownField: 1 }] },
      // Duplicate page ID
      {
        ...valid,
        pages: [
          valid.pages[0],
          { ...valid.pages[0], page_url: 'tutorials/other', feishu_token: null, feishu_aliases: [] },
        ],
      },
      // Duplicate page_url
      {
        ...valid,
        pages: [
          valid.pages[0],
          { ...valid.pages[0], page: 'insert-entities', feishu_token: null, feishu_aliases: [] },
        ],
      },
      // Duplicate Feishu alias across two pages
      {
        ...valid,
        pages: [
          valid.pages[0],
          {
            page: 'insert-entities',
            page_url: 'tutorials/insert-entities',
            feishu_token: 'wikcnOther',
            feishu_aliases: ['wikcnOther', 'doxcnObjToken'],
            anchors: {},
            activated_in: '20261127002',
          },
        ],
      },
    ]

    for (const candidate of invalidMutations) {
      expect(() => validateActiveLocalizedRegistry(candidate)).toThrow()
    }
    expect(() => parseActiveLocalizedRegistry('{not-json')).toThrow(/Malformed/)
  })

  it('is completely immune to Feishu record_id changes (recA -> recB) when page_url stays stable', () => {
    const active = makeActiveRegistry()
    const ctx = createLocalizedRoutingContext({
      site: 'zh-CN',
      availablePages: ['delete-entities'],
      active,
      previousSnapshot: {
        records: [
          {
            record_id: 'recA',
            page_url: `/${PAGE_URL}.md`,
            doc_token: 'wikcnOldToken',
            origin_node_token: 'nodcnOrigin123',
          },
        ],
      },
      records: [
        {
          // Simulated cross-table move / recreation in Feishu Base: record_id changed recA -> recB!
          record_id: 'recB',
          placement_type: 'canonical',
          page_url: `/${PAGE_URL}/`,
          doc_link: DOC_LINK,
        },
      ],
    })

    expect(ctx.errors).toEqual([])
    expect(ctx.resolveRoute(PAGE_URL)).toEqual({
      kind: 'localized-page',
      locale: 'zh-CN',
      group: 'guides',
      page: 'delete-entities',
      directory: 'localized-docs/zh-CN/guides/pages/delete-entities',
      url: DOC_LINK,
    })
    expect(ctx.resolveRoute(`/${PAGE_URL}.mdx`)).toEqual(ctx.resolveRoute(PAGE_URL))

    // Fallback baseline lookup works by normalized page_url regardless of record_id change
    expect(ctx.getFallbackBaseline(`/${PAGE_URL}/`)).toMatchObject({
      record_id: 'recA',
      page_url: PAGE_URL,
      doc_token: 'wikcnOldToken',
      origin_node_token: 'nodcnOrigin123',
    })

    // Alias tracking maps old Feishu tokens to normalized page_url
    expect(ctx.aliasesByToken.get('wikcnOldToken')).toBe(PAGE_URL)
    expect(ctx.aliasesByToken.get('doxcnObjToken')).toBe(PAGE_URL)
    expect(ctx.aliasesByToken.get('nodcnOrigin123')).toBe(PAGE_URL)

    // Next active registry preserves activation history & aliases, and refreshes reference-only last_seen_record_id
    const nextActive = ctx.computeNextActiveRegistry({ activatedIn: '20261128001' })
    expect(nextActive.pages).toEqual([
      {
        page: 'delete-entities',
        page_url: PAGE_URL,
        feishu_token: 'wikcnOldToken',
        feishu_aliases: ['wikcnOldToken', 'doxcnObjToken', 'nodcnOrigin123'],
        anchors: { blk123: 'delete-entities-by-filtering-conditions' },
        activated_in: '20261127001',
        last_seen_record_id: 'recB',
      },
    ])
  })

  it('blocks OWNERSHIP_REVERTED when an activated page_url reverts to a Feishu link (even after record_id change)', () => {
    const active = makeActiveRegistry()
    expect(() =>
      createLocalizedRoutingContext({
        site: 'zh-CN',
        availablePages: ['delete-entities'],
        active,
        records: [
          {
            record_id: 'recRebuiltNewId',
            placement_type: 'canonical',
            page_url: `/${PAGE_URL}.md`,
            doc_link: FEISHU_LINK,
          },
        ],
      }),
    ).toThrow(/OWNERSHIP_REVERTED/)
  })

  it('rejects active page_url switching to a different page-id and duplicate page-id owners', () => {
    const active = makeActiveRegistry()

    // 1. Active page_url pointing to a different <page-id>
    const switchedCtx = createLocalizedRoutingContext({
      site: 'zh-CN',
      availablePages: ['delete-entities', 'insert-entities'],
      active,
      records: [
        {
          record_id: 'recB',
          placement_type: 'canonical',
          page_url: PAGE_URL,
          doc_link: OTHER_DOC_LINK,
        },
      ],
    })
    expect(switchedCtx.errors).toHaveLength(1)
    expect(switchedCtx.errors[0]).toMatchObject({
      page_url: PAGE_URL,
      code: 'OWNERSHIP_CONFIG_MISSING',
    })
    expect(switchedCtx.resolveRoute(PAGE_URL)).toMatchObject({
      kind: 'invalid',
      code: 'OWNERSHIP_CONFIG_MISSING',
    })

    // 2. Two distinct page_urls claiming the same <page-id>
    const dupCtx = createLocalizedRoutingContext({
      site: 'zh-CN',
      availablePages: ['delete-entities'],
      active: null,
      records: [
        {
          record_id: 'rec1',
          placement_type: 'canonical',
          page_url: 'tutorials/first-delete',
          doc_link: DOC_LINK,
        },
        {
          record_id: 'rec2',
          placement_type: 'canonical',
          page_url: 'tutorials/second-delete',
          doc_link: DOC_LINK,
        },
      ],
    })
    expect(dupCtx.resolveRoute('tutorials/first-delete')).toMatchObject({
      kind: 'localized-page',
      page: 'delete-entities',
    })
    expect(dupCtx.resolveRoute('tutorials/second-delete')).toMatchObject({
      kind: 'invalid',
      code: 'OWNERSHIP_CONFIG_MISSING',
    })
    expect(dupCtx.errors).toHaveLength(1)
    expect(dupCtx.errors[0].message).toMatch(/Duplicate localized page owner/)

    // 3. New page_url attempting to hijack an actively owned <page-id>
    const hijackCtx = createLocalizedRoutingContext({
      site: 'zh-CN',
      availablePages: ['delete-entities'],
      active,
      records: [
        {
          record_id: 'recRogue',
          placement_type: 'canonical',
          page_url: 'tutorials/hijacked-copy',
          doc_link: DOC_LINK,
        },
      ],
    })
    expect(hijackCtx.errors).toHaveLength(1)
    expect(hijackCtx.errors[0]).toMatchObject({
      page_url: 'tutorials/hijacked-copy',
      code: 'OWNERSHIP_CONFIG_MISSING',
    })
  })

  it('rejects duplicate canonical page_urls and conflicting Feishu aliases', () => {
    // Duplicate normalized page_url across two canonical rows
    expect(() =>
      createLocalizedRoutingContext({
        site: 'zh-CN',
        availablePages: ['delete-entities'],
        records: [
          { record_id: 'rec1', placement_type: 'canonical', page_url: PAGE_URL, doc_link: DOC_LINK },
          {
            record_id: 'rec2',
            placement_type: 'canonical',
            page_url: `/${PAGE_URL}.md`,
            doc_link: DOC_LINK,
          },
        ],
      }),
    ).toThrow(/Duplicate canonical page_url/)

    // Another Feishu row reusing an active page's historical Feishu token
    expect(() =>
      createLocalizedRoutingContext({
        site: 'zh-CN',
        availablePages: ['delete-entities'],
        active: makeActiveRegistry(),
        records: [
          {
            record_id: 'recOther',
            placement_type: 'canonical',
            page_url: 'tutorials/unrelated-feishu-page',
            doc_link: 'https://zilliverse.feishu.cn/wiki/doxcnObjToken',
          },
        ],
      }),
    ).toThrow(/Conflicting localized Feishu alias/)
  })

  it('allows disjoint-target Feishu records (SaaS vs PaaS) to share a page_url while still rejecting overlaps and localized collisions', () => {
    const saasLink = 'https://zilliverse.feishu.cn/wiki/FeishuSaasDoc01'
    const paasLink = 'https://zilliverse.feishu.cn/wiki/FeishuPaasDoc02'
    const ctx = createLocalizedRoutingContext({
      site: 'zh-CN',
      availablePages: ['delete-entities'],
      previousSnapshot: {
        records: [
          {
            page_url: 'integrate-with-amazon-s3-cn',
            publish_targets: ['Zilliz.SaaS'],
            doc_token: 'FeishuSaasDoc01',
          },
          {
            page_url: 'integrate-with-amazon-s3-cn',
            publish_targets: ['Zilliz.PaaS'],
            doc_token: 'FeishuPaasDoc02',
          },
        ],
      },
      records: [
        {
          record_id: 'rec-saas',
          placement_type: 'canonical',
          page_url: 'integrate-with-amazon-s3-cn',
          doc_link: saasLink,
          publish_targets: ['Zilliz.SaaS'],
        },
        {
          record_id: 'rec-paas',
          placement_type: 'canonical',
          page_url: 'integrate-with-amazon-s3-cn',
          doc_link: paasLink,
          publish_targets: ['Zilliz.PaaS'],
        },
      ],
    })
    expect(ctx.errors).toEqual([])
    expect(ctx.inspectedFeishuLinksByPageUrl.get('integrate-with-amazon-s3-cn')).toEqual(
      new Set([saasLink, paasLink]),
    )

    // Overlapping targets on the same page_url must still fail closed.
    expect(() =>
      createLocalizedRoutingContext({
        site: 'zh-CN',
        records: [
          {
            placement_type: 'canonical',
            page_url: 'integrate-with-amazon-s3-cn',
            doc_link: saasLink,
            publish_targets: ['Zilliz.SaaS'],
          },
          {
            placement_type: 'canonical',
            page_url: 'integrate-with-amazon-s3-cn',
            doc_link: paasLink,
            publish_targets: ['Zilliz.SaaS', 'Zilliz.PaaS'],
          },
        ],
      }),
    ).toThrow(/Duplicate canonical page_url/)

    // A localized-page record can never share a page_url with a Feishu record, even across disjoint targets.
    expect(() =>
      createLocalizedRoutingContext({
        site: 'zh-CN',
        availablePages: ['delete-entities'],
        records: [
          {
            placement_type: 'canonical',
            page_url: 'integrate-with-amazon-s3-cn',
            doc_link: saasLink,
            publish_targets: ['Zilliz.SaaS'],
          },
          {
            placement_type: 'canonical',
            page_url: 'integrate-with-amazon-s3-cn',
            doc_link: DOC_LINK,
            publish_targets: ['Zilliz.PaaS'],
          },
        ],
      }),
    ).toThrow(/Duplicate canonical page_url/)

    // Disjoint-target Feishu sibling still checks conflicting localized Feishu aliases.
    expect(() =>
      createLocalizedRoutingContext({
        site: 'zh-CN',
        availablePages: ['delete-entities'],
        active: makeActiveRegistry(),
        records: [
          {
            placement_type: 'canonical',
            page_url: 'integrate-with-amazon-s3-cn',
            doc_link: saasLink,
            publish_targets: ['Zilliz.SaaS'],
          },
          {
            placement_type: 'canonical',
            page_url: 'integrate-with-amazon-s3-cn',
            doc_link: 'https://zilliverse.feishu.cn/wiki/doxcnObjToken',
            publish_targets: ['Zilliz.PaaS'],
          },
        ],
      }),
    ).toThrow(/Conflicting localized Feishu alias/)
  })

  it('activates a new localized page with no record_id and preserves non-active Feishu records', () => {
    const ctx = createLocalizedRoutingContext({
      site: 'zh-CN',
      availablePages: ['insert-entities'],
      active: null,
      records: [
        {
          placement_type: 'section',
          page_url: '',
          doc_link: '',
        },
        {
          placement_type: 'canonical',
          page_url: '/tutorials/insert-entities.md',
          doc_link: OTHER_DOC_LINK,
        },
        {
          placement_type: 'canonical',
          page_url: '/tutorials/still-feishu',
          doc_link: 'https://zilliverse.feishu.cn/wiki/wikcnLiveFeishu',
        },
      ],
    })

    expect(ctx.errors).toEqual([])
    expect(ctx.resolveRoute('tutorials/insert-entities')).toMatchObject({
      kind: 'localized-page',
      page: 'insert-entities',
    })
    expect(ctx.resolveRoute('tutorials/still-feishu')).toMatchObject({
      kind: 'feishu',
      token: 'wikcnLiveFeishu',
    })

    const nextActive = ctx.computeNextActiveRegistry({
      activatedIn: '20261127009',
      anchorsByPageUrl: new Map([['/tutorials/insert-entities/', { blk9: 'overview' }]]),
    })
    expect(nextActive).toEqual({
      schema_version: 1,
      locale: 'zh-CN',
      group: 'guides',
      pages: [
        {
          page: 'insert-entities',
          page_url: 'tutorials/insert-entities',
          feishu_token: null,
          anchors: { blk9: 'overview' },
          activated_in: '20261127009',
        },
      ],
    })
  })
})
