// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  classifyLocalizedSourceRoute,
  isLocalizedDocsUrl,
  isSharedDocsUrl,
  safeHandoffPath,
} from '../../core/handoff/source-state.ts'

const VALID_URL =
  'https://github.com/zilliztech/zdoc/tree/master/localized-docs/zh-CN/guides/pages/delete-entities'
const SHARED_URL =
  'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/delete-entities'

describe('localized-docs handoff source-state', () => {
  it('detects localized-docs and shared-docs URLs accurately', () => {
    expect(isLocalizedDocsUrl(VALID_URL)).toBe(true)
    expect(
      isLocalizedDocsUrl(
        'https://github.com/zilliztech/zdoc/tree/master/localized-docs/ja-JP/guides/pages/foo',
      ),
    ).toBe(true)
    expect(isLocalizedDocsUrl(SHARED_URL)).toBe(false)
    expect(isLocalizedDocsUrl('https://zilliverse.feishu.cn/wiki/wikcn123')).toBe(false)
    expect(isLocalizedDocsUrl(null)).toBe(false)

    expect(isSharedDocsUrl(SHARED_URL)).toBe(true)
    expect(isSharedDocsUrl(VALID_URL)).toBe(false)
  })

  it('routes valid zh-CN localized guides URLs only when site is zh-CN and page is in availablePages', () => {
    expect(
      classifyLocalizedSourceRoute(VALID_URL, {
        site: 'zh-CN',
        availablePages: ['delete-entities'],
      }),
    ).toEqual({
      kind: 'localized-page',
      locale: 'zh-CN',
      group: 'guides',
      page: 'delete-entities',
      directory: 'localized-docs/zh-CN/guides/pages/delete-entities',
      url: VALID_URL,
    })

    // Trailing slash is accepted verbatim
    expect(
      classifyLocalizedSourceRoute(`${VALID_URL}/`, {
        site: 'zh-CN',
        availablePages: new Set(['delete-entities']),
      }),
    ).toMatchObject({
      kind: 'localized-page',
      page: 'delete-entities',
      url: `${VALID_URL}/`,
    })

    // Group/locale-qualified availablePages entries also work
    expect(
      classifyLocalizedSourceRoute(VALID_URL, {
        site: 'zh-CN',
        availablePages: ['zh-CN/guides/delete-entities'],
      }),
    ).toMatchObject({ kind: 'localized-page', page: 'delete-entities' })

    // Missing from availablePages -> OWNERSHIP_CONFIG_MISSING
    expect(
      classifyLocalizedSourceRoute(VALID_URL, {
        site: 'zh-CN',
        availablePages: ['other-page'],
      }),
    ).toMatchObject({ kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING' })
  })

  it('enforces site exclusivity and rejects shared-docs or other locales with OWNERSHIP_PATH_MISMATCH', () => {
    // Symmetric rejection on EN side
    expect(
      classifyLocalizedSourceRoute(VALID_URL, {
        site: 'en',
        availablePages: ['delete-entities'],
      }),
    ).toMatchObject({ kind: 'invalid', code: 'OWNERSHIP_PATH_MISMATCH' })

    // shared-docs URL on zh-CN side
    expect(
      classifyLocalizedSourceRoute(SHARED_URL, {
        site: 'zh-CN',
        availablePages: ['delete-entities'],
      }),
    ).toMatchObject({ kind: 'invalid', code: 'OWNERSHIP_PATH_MISMATCH' })

    // Other locale under localized-docs/<other>/...
    for (const otherLocaleUrl of [
      'https://github.com/zilliztech/zdoc/tree/master/localized-docs/ja-JP/guides/pages/delete-entities',
      'https://github.com/zilliztech/zdoc/tree/master/localized-docs/en/guides/pages/delete-entities',
    ]) {
      expect(
        classifyLocalizedSourceRoute(otherLocaleUrl, {
          site: 'zh-CN',
          availablePages: ['delete-entities'],
        }),
        otherLocaleUrl,
      ).toMatchObject({ kind: 'invalid', code: 'OWNERSHIP_PATH_MISMATCH' })
    }
  })

  it('rejects reserved page ID active, path traversal, query/hash, extra segments, and malformed URLs', () => {
    const activeUrl = VALID_URL.replace('delete-entities', 'active')
    expect(
      classifyLocalizedSourceRoute(activeUrl, {
        site: 'zh-CN',
        availablePages: ['active'],
      }),
    ).toMatchObject({ kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING' })

    const invalidUrls = [
      '',
      '   ',
      `${VALID_URL}?foo=1`,
      `${VALID_URL}#section`,
      `${VALID_URL}/source.md`,
      VALID_URL.replace('master', 'dev'),
      VALID_URL.replace('guides', 'reference'),
      VALID_URL.replace('delete-entities', '..'),
      VALID_URL.replace('delete-entities', '../other'),
      VALID_URL.replace('delete-entities', '%64elete-entities'),
      VALID_URL.replace('delete-entities', 'Delete-Entities'),
      VALID_URL.replace('github.com', 'github.com.evil.example'),
      VALID_URL.replace('https:', 'http:'),
      'https://example.com/wiki/abc',
      'https://evilfeishu.cn/wiki/abc',
      'https://feishu.cn/wiki/abc/extra',
      'https://user:pass@zilliverse.feishu.cn/wiki/abc',
      'https://zilliverse.feishu.cn:8443/wiki/abc',
    ]

    for (const bad of invalidUrls) {
      expect(
        classifyLocalizedSourceRoute(bad, {
          site: 'zh-CN',
          availablePages: ['delete-entities'],
        }),
        bad,
      ).toMatchObject({ kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING' })
    }
    expect(classifyLocalizedSourceRoute(null, { site: 'zh-CN' })).toMatchObject({
      kind: 'invalid',
      code: 'OWNERSHIP_CONFIG_MISSING',
    })
  })

  it('classifies valid Feishu and Larksuite document URLs', () => {
    for (const [url, token] of [
      ['https://zilliverse.feishu.cn/wiki/wikcnAbc123#anchor', 'wikcnAbc123'],
      ['https://zilliverse.feishu.cn/docx/doxcn_456-789/', 'doxcn_456-789'],
      ['https://org.larksuite.com/docs/doccnXYZ', 'doccnXYZ'],
      ['https://larksuite.com/doc/doc123?from=base', 'doc123'],
    ] as const) {
      expect(classifyLocalizedSourceRoute(url, { site: 'zh-CN' })).toEqual({
        kind: 'feishu',
        token,
        url,
      })
    }
  })

  it('validates safe handoff paths', () => {
    expect(safeHandoffPath('content/zh-CN/guides/tutorials/delete-entities.md')).toBe(true)
    for (const bad of [
      '',
      '/abs/path.md',
      '../escape.md',
      'a/./b.md',
      'a//b.md',
      'a\\b.md',
      'a\nb.md',
      'a\0b.md',
      null,
    ]) {
      expect(safeHandoffPath(bad), String(bad)).toBe(false)
    }
  })
})
