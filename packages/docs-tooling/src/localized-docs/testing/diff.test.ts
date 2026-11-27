// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { computeThreeWayDiff } from '../core/diff.ts'
import { buildBaselineSections, parseStructuredDocument } from '../core/sections.ts'
import type { BaselineJson } from '../core/types.ts'
import { sha256Hex } from '../core/types.ts'

function parseEn(text: string) {
  const res = parseStructuredDocument({ kind: 'en', text, isAlreadyStripped: true })
  if (!('doc' in res)) throw new Error('EN parse failed')
  return res.doc
}

function parseZh(text: string) {
  const res = parseStructuredDocument({ kind: 'zh', text })
  if (!('doc' in res)) throw new Error('ZH parse failed')
  return res.doc
}

function makeBaseline(enText: string, zhText: string): BaselineJson {
  const enDoc = parseEn(enText)
  const zhDoc = parseZh(zhText)
  return {
    schema_version: 1,
    page_id: 'delete-entities',
    en_baseline: {
      manual: 'guides',
      shared_page: 'delete-entities',
      dev_commit: '1'.repeat(40),
      en_path: 'content/en/guides/delete-entities.md',
      manifest_path: 'generated/en/manifests/shared-pages/guides/delete-entities.json',
      file_sha256: sha256Hex(enText),
      channels: {
        current_sha256: sha256Hex(enText),
        next_sha256: sha256Hex(enText),
      },
    },
    zh_reviewed: {
      source_sha256: sha256Hex(zhText),
      reviewed_pr: 128,
      updated_at: '2026-11-25T08:45:00Z',
    },
    last_notified_en_sha: null,
    sections: buildBaselineSections(enDoc, zhDoc),
  }
}

describe('localized-docs core/diff (3-way diff, byte invariance, ambiguous & interstitial preservation)', () => {
  it('locks unchanged sections and human-edited untouched sections byte-for-byte', () => {
    const baseEn = `# Delete Entities

Overview paragraph.

## Section A\\{#section-a}

Sentence A1.

## Section B\\{#section-b}

Sentence B1.
`
    const newEn = `# Delete Entities

Overview paragraph.

## Section A\\{#section-a}

Sentence A1 (updated).

## Section B\\{#section-b}

Sentence B1.
`
    const curZh = `# 删除 Entity

概述段落。

## 小节 A\\{#section-a}

中文句子 A1。

## 小节 B（人工补充）\\{#section-b}

中文句子 B1，以及人工补充的说明文字   保留空格与格式。
`
    const baseline = makeBaseline(baseEn, `# 删除 Entity\n\n概述段落。\n\n## 小节 A\\{#section-a}\n\n中文句子 A1。\n\n## 小节 B\\{#section-b}\n\n中文句子 B1。\n`)
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline,
    })

    expect(diff.isInitialTranslation).toBe(false)
    expect(diff.hasSubstantiveChanges).toBe(true)
    expect(diff.manualZhDriftDetected).toBe(true)

    const secH1 = diff.sections.find(s => s.anchor === '__h1__')!
    const secA = diff.sections.find(s => s.anchor === 'section-a')!
    const secB = diff.sections.find(s => s.anchor === 'section-b')!

    expect(secH1.status).toBe('unchanged')
    expect(secH1.lockedRawSpan?.raw).toBe('# 删除 Entity\n\n概述段落。\n\n')

    expect(secA.status).toBe('modified')
    expect(secA.blocks.some(b => b.status === 'modified' && b.kind === 'paragraph')).toBe(true)

    expect(secB.status).toBe('unchanged')
    expect(secB.lockedRawSpan?.raw).toContain('中文句子 B1，以及人工补充的说明文字   保留空格与格式。')
  })

  it('handles delete-entities split/merge with interstitial ZH tip: preserves ZH verbatim and emits interstitial-zh ReviewTodo', () => {
    const baseEn = `# Delete Entities

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

Use a filter expression to select the entities to delete.

Submit the delete request with that expression.

\`\`\`python
res = client.delete(collection_name="quick_setup")
\`\`\`
`
    const curZh = `# 删除 Entity

## 按过滤条件删除 Entity\\{#delete-entities-by-filtering-conditions}

使用过滤表达式选中要删除的 Entity。

**提示：** 下方示例中的颜色值仅作演示，请按目标 Collection 中的实际取值替换。

使用该表达式提交删除请求。

\`\`\`python
res = client.delete(collection_name="quick_setup")
\`\`\`
`
    const newEn = `# Delete Entities

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

Use a filter expression to select the entities to delete. Check the filter expression before submitting the delete request. Submit the delete request with that expression.

\`\`\`python
res = client.delete(collection_name="quick_setup")
\`\`\`
`
    const baseline = makeBaseline(baseEn, curZh)
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline,
    })

    const sec = diff.sections.find(s => s.anchor === 'delete-entities-by-filtering-conditions')!
    expect(sec.blocks.some(b => b.status === 'ambiguous')).toBe(true)
    const ambiguousBlocks = sec.blocks.filter(b => b.status === 'ambiguous')
    expect(ambiguousBlocks.map(b => b.curZh?.raw).join('\n')).toContain(
      '**提示：** 下方示例中的颜色值仅作演示，请按目标 Collection 中的实际取值替换。',
    )
    expect(diff.todos.some(t => t.kind === 'interstitial-zh')).toBe(true)
    const todo = diff.todos.find(t => t.kind === 'interstitial-zh')!
    expect(todo.enBefore).toContain('Use a filter expression')
    expect(todo.enAfter).toContain('Check the filter expression')
    expect(todo.zhCurrent).toContain('颜色值仅作演示')
  })

  it('handles dual-channel delete-entities (<NextChannel action="exclude|include">): keeps Prod ZH + interstitial tip verbatim and drafts NEXT block + ReviewTodo', () => {
    const baseEn = `# Delete Entities

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

Use a filter expression to select the entities to delete.

Submit the delete request with that expression.
`
    const curZh = `# 删除 Entity

## 按过滤条件删除 Entity\\{#delete-entities-by-filtering-conditions}

使用过滤表达式选中要删除的 Entity。

**提示：** 下方示例中的颜色值仅作演示，请按目标 Collection 中的实际取值替换。

使用该表达式提交删除请求。
`
    const newEn = `# Delete Entities

## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}

<NextChannel action="exclude">

Use a filter expression to select the entities to delete.

Submit the delete request with that expression.

</NextChannel>

<NextChannel action="include">

Use a filter expression to select the entities to delete. Check the filter expression before submitting the delete request. Submit the delete request with that expression.

</NextChannel>
`
    const baseline = makeBaseline(baseEn, curZh)
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline,
    })

    const sec = diff.sections.find(s => s.anchor === 'delete-entities-by-filtering-conditions')!
    expect(sec.status).toBe('modified')
    // All 3 Prod ZH paragraphs remain unchanged (locked)
    const unchangedZh = sec.blocks.filter(b => b.status === 'unchanged' && b.curZh)
    expect(unchangedZh.map(b => b.curZh?.raw).join('\n')).toContain('颜色值仅作演示')
    // NEXT paragraph is added for bounded LLM drafting
    expect(sec.blocks.some(b => b.status === 'added' && b.channel === 'next' && b.kind === 'paragraph')).toBe(true)
    // Interstitial todo emitted for reviewer decision on NEXT placement
    expect(diff.todos.some(t => t.kind === 'interstitial-zh')).toBe(true)
  })

  it('preserves ZH section verbatim and emits heading-rename ReviewTodo when anchor changes', () => {
    const baseEn = `# Title

## Old Section\\{#old-section}

Shared sentence.
`
    const newEn = `# Title

## Renamed Section\\{#renamed-section}

Shared sentence.
`
    const curZh = `# 标题

## 旧小节标题\\{#old-section}

原有中文句子。
`
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline: makeBaseline(baseEn, curZh),
    })

    const ambSec = diff.sections.find(s => s.anchor === 'old-section')!
    expect(ambSec.status).toBe('ambiguous')
    expect(ambSec.lockedRawSpan?.raw).toContain('## 旧小节标题\\{#old-section}')
    expect(diff.todos.some(t => t.kind === 'heading-rename')).toBe(true)
  })

  it('preserves ZH-only sections verbatim without emitting removal', () => {
    const baseEn = `# Title

## First\\{#first}

First EN.
`
    const newEn = `# Title

## First\\{#first}

First EN updated.
`
    const curZh = `# 标题

## First\\{#first}

第一段中文。

## 中国站补充说明\\{#zh-only-note}

此处仅在中国站文档展示。
`
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline: makeBaseline(baseEn, curZh),
    })

    const zhOnly = diff.sections.find(s => s.anchor === 'zh-only-note')!
    expect(zhOnly.status).toBe('zh-only-preserved')
    expect(zhOnly.lockedRawSpan?.raw).toContain('此处仅在中国站文档展示。')
  })

  it('preserves ZH-only code block alongside an EN code block in the same section', () => {
    const baseEn = `# Title

## Connect\\{#connect}

Intro.

\`\`\`python
print("en")
\`\`\`
`
    const newEn = `# Title

## Connect\\{#connect}

Intro updated.

\`\`\`python
print("en-v2")
\`\`\`
`
    const curZh = `# 标题

## 连接\\{#connect}

简介。

\`\`\`bash
# 中国站独有前置命令
export ZILLIZ_REGION=cn-hangzhou
\`\`\`

\`\`\`python
print("en")
\`\`\`
`
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline: makeBaseline(baseEn, curZh),
    })

    const sec = diff.sections.find(s => s.anchor === 'connect')!
    expect(sec.status).toBe('modified')
    const zhOnlyCode = sec.blocks.find(b => b.kind === 'code' && b.status === 'zh-only-preserved')
    expect(zhOnlyCode).toBeDefined()
    expect(zhOnlyCode?.curZh?.raw).toContain('export ZILLIZ_REGION=cn-hangzhou')
    const syncedCode = sec.blocks.find(b => b.kind === 'code' && b.status === 'modified')
    expect(syncedCode?.newEn?.raw).toContain('print("en-v2")')
  })

  it('locks curZh section verbatim without emitting empty <NextChannel> when ambiguous merge wraps prose in <NextChannel action="include"> without exclude copy', () => {
    const baseEn = `# MergeNext

## Steps\\{#steps}

Step 1 original.

Step 2 original.
`
    const curZh = `# MergeNext

## 步骤\\{#steps}

第一步原文。

**提示：** 中文独有夹层提示。

第二步原文。
`
    const newEn = `# MergeNext

## Steps\\{#steps}

<NextChannel action="include">

Step 1 and Step 2 merged into one step.

</NextChannel>
`
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline: makeBaseline(baseEn, curZh),
    })

    const sec = diff.sections.find(s => s.anchor === 'steps')!
    expect(sec.status).toBe('ambiguous')
    expect(sec.lockedRawSpan?.raw).toContain('**提示：** 中文独有夹层提示。')
    expect(sec.blocks.some(b => b.status === 'added' && (b.kind === 'channel-open' || b.kind === 'channel-close'))).toBe(false)
    const todo = diff.todos.find(t => t.sectionAnchor === 'steps')
    expect(todo).toBeDefined()
    expect(todo?.enAfter).toContain('<NextChannel action="include">')
    expect(todo?.enAfter).toContain('Step 1 and Step 2 merged into one step.')
  })

  it('orders ZH-only section before a renamed EN section in diff.sections', () => {
    const baseEn = `# Title

## First\\{#first}

First.

## Old Name\\{#old-name}

Body.
`
    const newEn = `# Title

## First\\{#first}

First.

## New Name\\{#new-name}

Body.
`
    const curZh = `# 标题

## 第一节\\{#first}

第一段。

## 中国站独有前置小节\\{#zh-before-rename}

前置内容。

## 旧名\\{#old-name}

正文。
`
    const diff = computeThreeWayDiff({
      baseEn: parseEn(baseEn),
      newEn: parseEn(newEn),
      curZh: parseZh(curZh),
      baseline: makeBaseline(baseEn, curZh),
    })

    expect(diff.sections.map(s => s.anchor)).toEqual([
      '__h1__',
      'first',
      'zh-before-rename',
      'old-name',
    ])
  })
})
