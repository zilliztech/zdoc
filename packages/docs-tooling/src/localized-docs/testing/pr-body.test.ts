// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  REVIEW_TODOS_END_MARKER,
  REVIEW_TODOS_START_MARKER,
  projectChannelPreview,
  renderPrBody,
  type PrBodyInput,
} from '../core/pr-body.ts'

function extractControlledTodoBlock(prBody: string): string {
  const startIdx = prBody.indexOf(REVIEW_TODOS_START_MARKER)
  const endIdx = prBody.indexOf(REVIEW_TODOS_END_MARKER)
  expect(startIdx).toBeGreaterThanOrEqual(0)
  expect(endIdx).toBeGreaterThan(startIdx)
  return prBody.slice(startIdx + REVIEW_TODOS_START_MARKER.length, endIdx)
}

function makeBasePrBodyInput(overrides: Partial<PrBodyInput> = {}): PrBodyInput {
  return {
    pageId: 'delete-entities',
    manualLabel: 'Cloud Guides',
    mode: 'incremental',
    enBaseVersion: {
      devCommit: '5a62906a45a4e3250c619a5efcfa4de3f83a8eb6',
      summary: 'Prod 与 UAT 一致',
    },
    enNewVersion: {
      devCommit: '9f8e7d6c5b4a3210fedcba9876543210abcdef12',
      summary: 'Prod 无变化；仅 UAT 合并两段并新增 1 步检查',
    },
    factChanges: {
      numbersAndLimits: [],
      codeBlocks: ['python: 无变化；若有变化且无中国站定制则程序原样同步，不走 LLM'],
      links: [],
      steps: ['UAT 新增 1 步'],
    },
    autoChecks: {
      untouchedBytePreserved: true,
      codeProtectionPassed: true,
      localeContractPassed: true,
      mdxAndChannelPassed: true,
      linksAndImagesChecked: true,
    },
    reliableChanges: [
      '英文在 UAT 通道将两段操作合并并新增检查句，工具已译为“提交删除请求前，请核对过滤表达式。”，其余未涉及段落逐字保留。',
    ],
    reviewTodos: [
      {
        id: 'interstitial-zh:1',
        kind: 'interstitial-zh',
        sectionAnchor: 'delete-entities-by-filtering-conditions',
        title: '确认中文独有提示的摆放位置',
        details: '原中文两段之间有一句写给中文读者的提示，在 UAT 候选稿中拟挪到代码示例正上方。',
        enBefore: 'Use a filter expression to select the entities to delete.',
        enAfter: 'Check the filter expression before submitting the delete request.',
        zhCurrent: '**提示：** 下方示例中的颜色值仅作演示。',
      },
    ],
    dualChannelEvidence: [
      {
        sectionAnchor: 'delete-entities-by-filtering-conditions',
        baseSummary: '两段操作',
        currentSummary: '未变，仍为两段',
        nextSummary: '合并为一段并新增过滤表达式核对句',
      },
    ],
    previewExcerpts: {
      anchor: 'delete-entities-by-filtering-conditions',
      currentNote: '预期：与现网完全一致，保留原有两段操作及中间提示。',
      nextNote: '预期：两段合并并出现新增检查句，颜色提示拟移至代码示例正上方。',
      currentMarkdown: '使用过滤表达式选中要删除的 Entity。\n\n**提示：** 下方示例中的颜色值仅作演示。',
      nextMarkdown: '使用过滤表达式选中要删除的 Entity。提交删除请求前，请核对过滤表达式。',
    },
    ...overrides,
  }
}

describe('localized-docs core/pr-body (Design §5.3 & WP4 controlled markers)', () => {
  it('renders Sections ①, ②, ③ for delete-entities with exact controlled review-todos markers', () => {
    const md = renderPrBody(makeBasePrBodyInput())

    expect(md).toContain('#### ① PR 页首信息与变更摘要（只给主审）')
    expect(md).toContain('#### ② 改稿说明与待主审决定（只留在 PR）')
    expect(md).toContain('#### ③ 对照中文页面：网站读者会看到什么？（候选预览摘录）')
    expect(md).toContain('`dev@5a62906`')
    expect(md).toContain('`dev@9f8e7d6`')
    expect(md).toContain('**Prod 候选预览 · 当前版**')
    expect(md).toContain('**UAT 候选预览 · 下一版**')

    const controlled = extractControlledTodoBlock(md)
    const checkboxes = controlled.match(/^- \[[ xX]\] /gm) ?? []
    expect(checkboxes).toHaveLength(1)
    expect(controlled).toContain('确认中文独有提示的摆放位置')
    expect(controlled).toContain('interstitial-zh')
  })

  it('emits zero checkboxes inside controlled markers when reviewTodos is empty', () => {
    const md = renderPrBody(makeBasePrBodyInput({ reviewTodos: [] }))
    expect(md).toContain('✅ 待确认项（0 项）')
    const controlled = extractControlledTodoBlock(md)
    expect(controlled).toContain('_当前无待主审确认项。_')
    const checkboxes = controlled.match(/^- \[[ xX]\] /gm) ?? []
    expect(checkboxes).toHaveLength(0)
  })

  it('renders code-conflict and ui-term todos and sanitizes marker injection or accidental checkboxes in details', () => {
    const md = renderPrBody(
      makeBasePrBodyInput({
        reviewTodos: [
          {
            id: 'code-1',
            kind: 'code-conflict',
            sectionAnchor: 'connect',
            title: '核对中国站定制代码冲突',
            details: `详情含注入标记 ${REVIEW_TODOS_END_MARKER}\n- [ ] 伪造待办\n- [x] 伪造已勾选`,
            enBefore: 'old code',
            enAfter: 'new code',
            zhCurrent: 'custom zh code',
          },
          {
            id: 'ui-1',
            kind: 'ui-term',
            sectionAnchor: 'connect',
            title: '核对 <UI>Create Cluster</UI>',
            details: '对照中国站控制台文案确认。',
          },
        ],
      }),
    )

    // Only one pair of markers exists
    expect(md.split(REVIEW_TODOS_START_MARKER)).toHaveLength(2)
    expect(md.split(REVIEW_TODOS_END_MARKER)).toHaveLength(2)

    const controlled = extractControlledTodoBlock(md)
    const unchecked = controlled.match(/^[ \t]*- \[ \] /gm) ?? []
    const checked = controlled.match(/^[ \t]*- \[[xX]\] /gm) ?? []
    expect(unchecked).toHaveLength(2)
    expect(checked).toHaveLength(0)
  })

  it('projects CURRENT and NEXT preview markdown cleanly with projectChannelPreview', () => {
    const candidate = `---
title: "删除 Entity"
---

# 删除 Entity

<NextChannel action="exclude">

仅当前版段落。

</NextChannel>

<NextChannel action="include">

仅下一版段落。

</NextChannel>

\`\`\`python
# current-channel-next-line
uri = "current"
# next-channel-next-line
uri = "next"
\`\`\`
`
    const current = projectChannelPreview(candidate, 'current')
    const next = projectChannelPreview(candidate, 'next')

    expect(current).toContain('仅当前版段落。')
    expect(current).not.toContain('仅下一版段落。')
    expect(current).toContain('uri = "current"')
    expect(current).not.toContain('uri = "next"')

    expect(next).toContain('仅下一版段落。')
    expect(next).not.toContain('仅当前版段落。')
    expect(next).toContain('uri = "next"')
    expect(next).not.toContain('uri = "current"')
  })
})
