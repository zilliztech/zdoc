// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { promoteLocalizedSource } from '../../core/handoff/promote.ts'
import { sha256Hex } from '../../core/types.ts'

const EN_NEXT_SHA = 'a'.repeat(64)
const EN_NEXT_SHA_DRIFTED = 'b'.repeat(64)

describe('localized-docs handoff promote', () => {
  it('unwraps generator-managed include blocks and removes paired exclude blocks when EN NEXT SHA matches', () => {
    const sourceMarkdown = [
      '# 删除 Entity',
      '',
      '使用过滤表达式选中要删除的 Entity。',
      '',
      '<NextChannel action="exclude">',
      '旧版 CURRENT 段落，将在提升后移除。',
      '</NextChannel>',
      '',
      '<NextChannel action="include">',
      '新版 NEXT 段落，点击 <UI>删除</UI> 确认操作。',
      '</NextChannel>',
      '',
      '公共结尾说明。',
      '',
    ].join('\n')

    const result = promoteLocalizedSource({
      sourceMarkdown,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.promotedMarkdown).toBe(
      [
        '# 删除 Entity',
        '',
        '使用过滤表达式选中要删除的 Entity。',
        '',
        '新版 NEXT 段落，点击 <UI>删除</UI> 确认操作。',
        '',
        '公共结尾说明。',
        '',
      ].join('\n'),
    )
    expect(result.sourceSha256).toBe(sha256Hex(sourceMarkdown))
    expect(result.promotedSha256).toBe(sha256Hex(result.promotedMarkdown))
    expect(result.summary).toEqual({
      unwrappedIncludeCount: 1,
      removedExcludeCount: 1,
      preservedAuthoredBlockIds: [],
      changed: true,
    })
  })

  it('blocks with PROMOTE_EN_MISMATCH and preserves live Chinese unchanged when EN NEXT SHA differs or is invalid', () => {
    const sourceMarkdown = [
      '<NextChannel action="exclude">',
      '现网中文。',
      '</NextChannel>',
      '<NextChannel action="include">',
      '待提升中文。',
      '</NextChannel>',
    ].join('\n')

    for (const [expected, baseline] of [
      [EN_NEXT_SHA, EN_NEXT_SHA_DRIFTED],
      ['not-a-sha', EN_NEXT_SHA],
      [EN_NEXT_SHA, ''],
    ] as const) {
      const result = promoteLocalizedSource({
        sourceMarkdown,
        expectedEnNextSha: expected,
        baselineEnNextSha: baseline,
      })
      expect(result.ok).toBe(false)
      if (!('errors' in result)) continue
      expect(result.code).toBe('PROMOTE_EN_MISMATCH')
      expect(result.errors[0].code).toBe('PROMOTE_EN_MISMATCH')
      expect(result.preservedMarkdown).toBe(sourceMarkdown)
      expect(result.sourceSha256).toBe(sha256Hex(sourceMarkdown))
    }
  })

  it('preserves author-marked independent hand-written channel blocks verbatim while promoting generator blocks', () => {
    const sourceMarkdown = [
      '# 功能说明',
      '',
      '<NextChannel action="exclude">',
      '旧版文案。',
      '</NextChannel>',
      '',
      '<NextChannel action="include">',
      '已审核的新版文案。',
      '</NextChannel>',
      '',
      '<!-- localized-docs:authored-channel:cn-beta-callout -->',
      '<NextChannel action="include">',
      '作者手写的独立未发布功能说明。',
      '</NextChannel>',
      '',
      '<NextChannel action="exclude">',
      '<!-- localized-docs:authored-channel:cn-legacy-tip -->',
      '作者手写的独立现网提示。',
      '</NextChannel>',
      '',
    ].join('\n')

    // 1. Default (authoredChannelBlockIds omitted): preserves all author-marked blocks
    const defaultResult = promoteLocalizedSource({
      sourceMarkdown,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
    })
    expect(defaultResult.ok).toBe(true)
    if (!defaultResult.ok) return
    expect(defaultResult.promotedMarkdown).toContain('已审核的新版文案。')
    expect(defaultResult.promotedMarkdown).not.toContain('旧版文案。')
    expect(defaultResult.promotedMarkdown).toContain(
      '<!-- localized-docs:authored-channel:cn-beta-callout -->\n<NextChannel action="include">\n作者手写的独立未发布功能说明。\n</NextChannel>',
    )
    expect(defaultResult.promotedMarkdown).toContain(
      '<NextChannel action="exclude">\n<!-- localized-docs:authored-channel:cn-legacy-tip -->\n作者手写的独立现网提示。\n</NextChannel>',
    )
    expect(defaultResult.summary).toEqual({
      unwrappedIncludeCount: 1,
      removedExcludeCount: 1,
      preservedAuthoredBlockIds: ['cn-beta-callout', 'cn-legacy-tip'],
      changed: true,
    })

    // 2. Explicit authoredChannelBlockIds list: preserves only listed IDs and promotes the unlisted one cleanly
    const selectiveResult = promoteLocalizedSource({
      sourceMarkdown,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
      authoredChannelBlockIds: ['cn-legacy-tip'],
    })
    expect(selectiveResult.ok).toBe(true)
    if (!selectiveResult.ok) return
    expect(selectiveResult.promotedMarkdown).toContain('作者手写的独立未发布功能说明。')
    expect(selectiveResult.promotedMarkdown).not.toContain('cn-beta-callout')
    expect(selectiveResult.promotedMarkdown).toContain('cn-legacy-tip')
    expect(selectiveResult.summary).toEqual({
      unwrappedIncludeCount: 2,
      removedExcludeCount: 1,
      preservedAuthoredBlockIds: ['cn-legacy-tip'],
      changed: true,
    })
  })

  it('keeps <NextChannel> examples inside fenced code blocks, inline code, and HTML comments untouched', () => {
    const sourceMarkdown = [
      '# 通道示例',
      '',
      '内联代码 `<NextChannel action="exclude">保留</NextChannel>` 不应被改写。',
      '',
      '<!-- <NextChannel action="include">注释中的标签</NextChannel> -->',
      '',
      '```mdx',
      '<NextChannel action="exclude">',
      '示例代码中的旧块',
      '</NextChannel>',
      '<NextChannel action="include">',
      '示例代码中的新块',
      '</NextChannel>',
      '```',
      '',
      '<NextChannel action="include">',
      '真实待提升正文。',
      '</NextChannel>',
      '',
    ].join('\n')

    const result = promoteLocalizedSource({
      sourceMarkdown,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.promotedMarkdown).toContain('`<NextChannel action="exclude">保留</NextChannel>`')
    expect(result.promotedMarkdown).toContain('<!-- <NextChannel action="include">注释中的标签</NextChannel> -->')
    expect(result.promotedMarkdown).toContain('```mdx\n<NextChannel action="exclude">\n示例代码中的旧块\n</NextChannel>')
    expect(result.promotedMarkdown).toContain('真实待提升正文。')
    expect(result.summary).toEqual({
      unwrappedIncludeCount: 1,
      removedExcludeCount: 0,
      preservedAuthoredBlockIds: [],
      changed: true,
    })
  })

  it('handles inline <NextChannel> spans and no-op documents cleanly', () => {
    const inlineMd =
      '请使用 <NextChannel action="exclude">v1</NextChannel><NextChannel action="include">v2</NextChannel> 接口。'
    const inlineResult = promoteLocalizedSource({
      sourceMarkdown: inlineMd,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
    })
    expect(inlineResult.ok).toBe(true)
    if (inlineResult.ok) {
      expect(inlineResult.promotedMarkdown).toBe('请使用 v2 接口。')
      expect(inlineResult.summary).toEqual({
        unwrappedIncludeCount: 1,
        removedExcludeCount: 1,
        preservedAuthoredBlockIds: [],
        changed: true,
      })
    }

    const plainMd = '# 纯正文\n\n无需解包。\n'
    const noopResult = promoteLocalizedSource({
      sourceMarkdown: plainMd,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
    })
    expect(noopResult.ok).toBe(true)
    if (noopResult.ok) {
      expect(noopResult.promotedMarkdown).toBe(plainMd)
      expect(noopResult.summary.changed).toBe(false)
    }
  })

  it('fails closed when source has unbalanced <NextChannel> or malformed <UI> tags', () => {
    const brokenChannel = '<NextChannel action="include">\n未闭合的块\n'
    const res1 = promoteLocalizedSource({
      sourceMarkdown: brokenChannel,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
    })
    expect(res1.ok).toBe(false)
    if ('errors' in res1) {
      expect(res1.code).toBe('PROMOTE_SOURCE_INVALID')
      expect(res1.preservedMarkdown).toBe(brokenChannel)
    }

    const brokenUi = '<NextChannel action="include">\n点击 <UI>未闭合\n</NextChannel>\n'
    const res2 = promoteLocalizedSource({
      sourceMarkdown: brokenUi,
      expectedEnNextSha: EN_NEXT_SHA,
      baselineEnNextSha: EN_NEXT_SHA,
    })
    expect(res2.ok).toBe(false)
    if ('errors' in res2) {
      expect(res2.code).toBe('PROMOTE_SOURCE_INVALID')
      expect(res2.errors.some(e => e.code === 'UI_TAG_MALFORMED')).toBe(true)
    }
  })
})
