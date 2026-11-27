// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  buildBaselineSections,
  computeChannelDigests,
  parseStructuredDocument,
  projectChannelText,
} from '../core/sections.ts'
import { stripEnShell } from '../core/strip-en.ts'
import {
  DELETE_ENTITIES_EN_MDX,
  GET_AND_SCALAR_QUERY_EN_MDX,
} from './fixtures/en-samples.ts'

describe('localized-docs core/sections', () => {
  it('parses DELETE_ENTITIES_EN_MDX deterministically with heading anchors, <NextChannel>, <Tabs>, and code blocks', () => {
    const res = parseStructuredDocument({ kind: 'en', text: DELETE_ENTITIES_EN_MDX })
    expect('doc' in res).toBe(true)
    if (!('doc' in res)) return

    const { doc } = res
    expect(doc.sections.map(s => s.anchor)).toEqual([
      '__h1__',
      'delete-entities-by-filtering-conditions',
    ])

    const filterSec = doc.sections[1]
    expect(filterSec.headingLevel).toBe(2)
    expect(filterSec.headingText).toBe('Delete Entities by Filtering Conditions')

    const kinds = filterSec.blocks.map(b => b.kind)
    expect(kinds).toContain('channel-open')
    expect(kinds).toContain('channel-close')
    expect(kinds).toContain('jsx-tag')
    expect(kinds).toContain('code')

    const codeBlocks = filterSec.blocks.filter(b => b.kind === 'code')
    expect(codeBlocks).toHaveLength(2)
    expect(codeBlocks[0].code?.lang).toBe('python')
    expect(codeBlocks[0].code?.tabValue).toBe('python')
    expect(codeBlocks[0].code?.directives).toEqual([
      { lineOffset: 9, channel: 'next', operation: 'next-line' },
    ])
    expect(codeBlocks[1].code?.lang).toBe('java')
    expect(codeBlocks[1].code?.tabValue).toBe('java')

    // Byte-exact section reconstruction
    expect(`${doc.leadingRaw}${doc.sections.map(s => s.raw).join('')}`).toBe(doc.bodyText)
  })

  it('parses GET_AND_SCALAR_QUERY_EN_MDX including <Admonition>, <table>, and fenced code blocks', () => {
    const res = parseStructuredDocument({ kind: 'en', text: GET_AND_SCALAR_QUERY_EN_MDX })
    expect('doc' in res).toBe(true)
    if (!('doc' in res)) return

    const { doc } = res
    expect(doc.sections.map(s => s.anchor)).toEqual(['__h1__', 'overview'])
    expect(doc.sections[0].blocks.some(b => b.kind === 'jsx-tag')).toBe(true)
    expect(doc.sections[1].blocks.some(b => b.kind === 'table')).toBe(true)
    expect(doc.sections[1].blocks.some(b => b.kind === 'code')).toBe(true)
    expect(`${doc.leadingRaw}${doc.sections.map(s => s.raw).join('')}`).toBe(doc.bodyText)
  })

  it('projects CURRENT and NEXT channels cleanly including code directives and <NextChannel> blocks', () => {
    const stripped = stripEnShell(DELETE_ENTITIES_EN_MDX)
    expect('body' in stripped).toBe(true)
    if (!('body' in stripped)) return

    const current = projectChannelText(stripped.body, 'current')
    const next = projectChannelText(stripped.body, 'next')

    expect(current).not.toContain('Query Explorer')
    expect(current).not.toContain('purple_4976')
    expect(current).not.toContain('<NextChannel')

    expect(next).toContain('Query Explorer')
    expect(next).toContain('purple_4976')
    expect(next).not.toContain('<NextChannel')

    const d1 = computeChannelDigests(stripped.body)
    const d2 = computeChannelDigests(stripped.body)
    expect(d1).toEqual(d2)
    expect(d1.currentSha256).not.toBe(d1.nextSha256)
  })

  it('preserves ZH source.md front matter raw and disambiguates duplicate heading anchors', () => {
    const zh = `---
title: "测试页"
---

# 主标题

## 重复标题

第一段。

## 重复标题

第二段。
`
    const res = parseStructuredDocument({ kind: 'zh', text: zh })
    expect('doc' in res).toBe(true)
    if (!('doc' in res)) return
    expect(res.doc.frontMatterRaw).toBe('---\ntitle: "测试页"\n---\n\n'.replace('\n\n', '\n'))
    expect(`${res.doc.frontMatterRaw}${res.doc.leadingRaw}${res.doc.sections.map(s => s.raw).join('')}`).toBe(zh)
    expect(res.doc.sections.map(s => s.anchor)).toEqual(['__h1__', '重复标题', '重复标题-2'])
  })

  it('builds baseline sections paired by anchor with customized code block flags', () => {
    const enRes = parseStructuredDocument({ kind: 'en', text: DELETE_ENTITIES_EN_MDX })
    const zhRes = parseStructuredDocument({
      kind: 'zh',
      text: `# 删除 Entity

按条件删除。

## 按过滤条件删除 Entity\\{#delete-entities-by-filtering-conditions}

点击 <UI>Delete</UI>。

\`\`\`python
print("zh")
\`\`\`
`,
    })
    expect('doc' in enRes && 'doc' in zhRes).toBe(true)
    if (!('doc' in enRes) || !('doc' in zhRes)) return

    const firstCodeSha = enRes.doc.sections[1].blocks.find(b => b.kind === 'code')!.sha256
    const sections = buildBaselineSections(
      enRes.doc,
      zhRes.doc,
      new Map([[firstCodeSha, true]]),
    )
    expect(sections).toHaveLength(2)
    expect(sections[1].anchor).toBe('delete-entities-by-filtering-conditions')
    expect(sections[1].code_blocks[0].customized_for_zh).toBe(true)
    expect(sections[1].code_blocks[0].en_sha256).toBe(firstCodeSha)
  })
})
