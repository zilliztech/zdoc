// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  REVIEW_TODOS_END_MARKER,
  REVIEW_TODOS_START_MARKER,
  evaluateReviewTodos,
  githubHeadingSlug,
  projectChannelView,
  projectDualChannelMdx,
  validateProjectedChannelView,
} from '../core/review-gate.ts'

describe('evaluateReviewTodos', () => {
  it('fails with REVIEW_TODOS_UNRESOLVED on unchecked - [ ], * [ ], or 1. [ ] items', () => {
    const prBody = `## Summary
- [ ] unrelated human checkbox outside block

${REVIEW_TODOS_START_MARKER}
- [x] Resolved UI term: <UI>删除</UI>
- [ ] Confirm Chinese note placement above code block
* [ ] Check custom code block diff
1. [ ] Verify link target
${REVIEW_TODOS_END_MARKER}
`
    const res = evaluateReviewTodos(prBody, { file: 'pr-body.md' })
    expect(res.ok).toBe(false)
    expect(res.hasBlock).toBe(true)
    expect(res.totalCount).toBe(4)
    expect(res.resolvedCount).toBe(1)
    expect(res.unresolvedItems).toHaveLength(3)
    expect(res.unresolvedItems.map(item => item.line)).toEqual([6, 7, 8])
    expect(res.unresolvedItems[0].text).toBe('Confirm Chinese note placement above code block')
    expect(res.errors[0].code).toBe('REVIEW_TODOS_UNRESOLVED')
    expect(res.errors[0].line).toBe(6)
    expect(res.errors[0].file).toBe('pr-body.md')
  })

  it('passes when all review todos are checked with - [x] or - [X]', () => {
    const prBody = `
${REVIEW_TODOS_START_MARKER}
- [x] Checked lowercase
- [X] Checked uppercase
2) [X] Numbered checked item
${REVIEW_TODOS_END_MARKER}
`
    const res = evaluateReviewTodos(prBody)
    expect(res.ok).toBe(true)
    expect(res.hasBlock).toBe(true)
    expect(res.totalCount).toBe(3)
    expect(res.resolvedCount).toBe(3)
    expect(res.unresolvedItems).toEqual([])
    expect(res.errors).toEqual([])
  })

  it('passes on an empty controlled block or prose-only controlled block', () => {
    const emptyRes = evaluateReviewTodos(`${REVIEW_TODOS_START_MARKER}\n${REVIEW_TODOS_END_MARKER}\n`)
    expect(emptyRes.ok).toBe(true)
    expect(emptyRes.hasBlock).toBe(true)
    expect(emptyRes.totalCount).toBe(0)
    expect(emptyRes.errors).toEqual([])

    const proseRes = evaluateReviewTodos(
      `${REVIEW_TODOS_START_MARKER}\nNo pending reviewer confirmations.\n${REVIEW_TODOS_END_MARKER}`,
    )
    expect(proseRes.ok).toBe(true)
    expect(proseRes.hasBlock).toBe(true)
    expect(proseRes.totalCount).toBe(0)
  })

  it('passes when markers are absent and requireBlock is false (even with PR template checkboxes)', () => {
    const humanPrBody = `## Checklist
- [ ] Did you update docs?
- [x] Self-reviewed
`
    const res = evaluateReviewTodos(humanPrBody)
    expect(res.ok).toBe(true)
    expect(res.hasBlock).toBe(false)
    expect(res.totalCount).toBe(0)
    expect(res.errors).toEqual([])
  })

  it('fails closed with REVIEW_TODOS_MARKER_MISSING when requireBlock is true and markers are absent or fenced', () => {
    expect(evaluateReviewTodos('Plain PR body', { requireBlock: true }).errors[0].code).toBe(
      'REVIEW_TODOS_MARKER_MISSING',
    )

    const fencedOnly = `\`\`\`markdown
${REVIEW_TODOS_START_MARKER}
- [x] Inside code fence
${REVIEW_TODOS_END_MARKER}
\`\`\`
`
    const res = evaluateReviewTodos(fencedOnly, { requireBlock: true })
    expect(res.ok).toBe(false)
    expect(res.hasBlock).toBe(false)
    expect(res.errors[0].code).toBe('REVIEW_TODOS_MARKER_MISSING')
  })

  it('fails closed with REVIEW_TODOS_MARKER_MALFORMED on half-markers, unpaired, reversed, duplicate, or corrupted checkboxes', () => {
    const malformedCases = [
      '<!-- localized-docs:review-todos:start\n- [x] broken closing',
      'localized-docs:review-todos:start -->\n- [x] missing open',
      '<!-- localized-docs:review-todos:mid -->',
      `${REVIEW_TODOS_START_MARKER}\n- [x] unclosed`,
      `- [x] stray end\n${REVIEW_TODOS_END_MARKER}`,
      `${REVIEW_TODOS_END_MARKER}\n- [x] reversed\n${REVIEW_TODOS_START_MARKER}`,
      `${REVIEW_TODOS_START_MARKER}\n${REVIEW_TODOS_START_MARKER}\n${REVIEW_TODOS_END_MARKER}`,
      `${REVIEW_TODOS_START_MARKER}\n${REVIEW_TODOS_END_MARKER}\n${REVIEW_TODOS_END_MARKER}`,
      `${REVIEW_TODOS_START_MARKER}\n- [] missing space\n${REVIEW_TODOS_END_MARKER}`,
      `${REVIEW_TODOS_START_MARKER}\n- [~] tilde box\n${REVIEW_TODOS_END_MARKER}`,
      `${REVIEW_TODOS_START_MARKER}\n- [?] question box\n${REVIEW_TODOS_END_MARKER}`,
      `${REVIEW_TODOS_START_MARKER}\n- [ ]no-space\n${REVIEW_TODOS_END_MARKER}`,
    ]

    for (const sample of malformedCases) {
      const res = evaluateReviewTodos(sample)
      expect(res.ok, sample).toBe(false)
      expect(res.errors[0].code, sample).toBe('REVIEW_TODOS_MARKER_MALFORMED')
    }
  })

  it('ignores markers and unchecked tasks inside fenced code blocks and inline code spans', () => {
    const prBody = `Inline example \`${REVIEW_TODOS_START_MARKER}\` and \`<!-- localized-docs:review-todos:bad\`.

\`\`\`markdown
${REVIEW_TODOS_START_MARKER}
- [ ] fake item inside fence
${REVIEW_TODOS_END_MARKER}
\`\`\`

${REVIEW_TODOS_START_MARKER}
- [x] Real checked item with \`- [ ] inline code\`
~~~
- [ ] fake item in tilde fence inside controlled block
~~~
${REVIEW_TODOS_END_MARKER}
`
    const res = evaluateReviewTodos(prBody)
    expect(res.ok).toBe(true)
    expect(res.hasBlock).toBe(true)
    expect(res.totalCount).toBe(1)
    expect(res.resolvedCount).toBe(1)
    expect(res.items[0].text).toBe('Real checked item with `- [ ] inline code`')
  })
})

describe('projectChannelView / validateProjectedChannelView / projectDualChannelMdx', () => {
  it('isolates NEXT sentinels from CURRENT view and CURRENT content from NEXT view across tags and all 5 fence directive styles', () => {
    const mdx = `---
title: "删除 Entity | Cloud"
slug: /delete-entities
---

import Admonition from '@theme/Admonition';

# 删除 Entity

通用说明。

<NextChannel action="exclude">
当前版本仅支持旧参数。
</NextChannel>

<NextChannel action="include">
NEXT_PROSE_SENTINEL_ONLY: 提交删除请求前，请核对过滤表达式。
</NextChannel>

\`\`\`python
# current-channel-next-line
mode = "legacy"
# next-channel-next-line
mode = "NEXT_PY_SENTINEL"
common = True
\`\`\`

\`\`\`js
// next-channel-start
const nextOnly = "NEXT_JS_SENTINEL";
// next-channel-end
const sharedJs = 1;
\`\`\`

\`\`\`css
/* current-channel-start */
.legacy { display: block; }
/* current-channel-end */
/* next-channel-next-line */
.nextOnly { display: grid; }
\`\`\`

\`\`\`html
<!-- next-channel-next-line -->
<div>NEXT_HTML_SENTINEL</div>
<!-- current-channel-next-line -->
<div>CURRENT_HTML_ONLY</div>
\`\`\`

\`\`\`jsx
{/* next-channel-next-line */}
<Badge>NEXT_JSX_SENTINEL</Badge>
\`\`\`

> \`\`\`bash
> # next-channel-next-line
> echo "NEXT_BQ_SENTINEL"
> echo "COMMON_BQ"
> \`\`\`

\`\`\`markdown
<NextChannel action="include">literal example</NextChannel>
\`\`\`

Inline \`<NextChannel action="include">code</NextChannel>\` stays literal.
`

    const result = projectDualChannelMdx(mdx, { file: 'pages/delete-entities/source.md', page: 'delete-entities' })
    expect(result.ok, JSON.stringify(result.errors)).toBe(true)
    expect(result.errors).toEqual([])

    // Frontmatter preserved verbatim
    expect(result.current.mdx.startsWith('---\ntitle: "删除 Entity | Cloud"\nslug: /delete-entities\n---\n')).toBe(true)
    expect(result.next.mdx.startsWith('---\ntitle: "删除 Entity | Cloud"\nslug: /delete-entities\n---\n')).toBe(true)

    // CURRENT view assertions
    expect(result.current.mdx).toContain('当前版本仅支持旧参数。')
    expect(result.current.mdx).toContain('mode = "legacy"')
    expect(result.current.mdx).toContain('common = True')
    expect(result.current.mdx).toContain('.legacy { display: block; }')
    expect(result.current.mdx).toContain('<div>CURRENT_HTML_ONLY</div>')
    expect(result.current.mdx).toContain('> echo "COMMON_BQ"')
    expect(result.current.mdx).not.toContain('NEXT_PROSE_SENTINEL_ONLY')
    expect(result.current.mdx).not.toContain('NEXT_PY_SENTINEL')
    expect(result.current.mdx).not.toContain('NEXT_JS_SENTINEL')
    expect(result.current.mdx).not.toContain('.nextOnly')
    expect(result.current.mdx).not.toContain('NEXT_HTML_SENTINEL')
    expect(result.current.mdx).not.toContain('NEXT_JSX_SENTINEL')
    expect(result.current.mdx).not.toContain('NEXT_BQ_SENTINEL')
    expect(result.current.mdx).not.toContain('next-channel-')
    expect(result.current.mdx).not.toContain('current-channel-')

    // NEXT view assertions
    expect(result.next.mdx).toContain('NEXT_PROSE_SENTINEL_ONLY')
    expect(result.next.mdx).toContain('mode = "NEXT_PY_SENTINEL"')
    expect(result.next.mdx).toContain('common = True')
    expect(result.next.mdx).toContain('NEXT_JS_SENTINEL')
    expect(result.next.mdx).toContain('.nextOnly { display: grid; }')
    expect(result.next.mdx).toContain('<div>NEXT_HTML_SENTINEL</div>')
    expect(result.next.mdx).toContain('<Badge>NEXT_JSX_SENTINEL</Badge>')
    expect(result.next.mdx).toContain('> echo "NEXT_BQ_SENTINEL"')
    expect(result.next.mdx).not.toContain('当前版本仅支持旧参数。')
    expect(result.next.mdx).not.toContain('mode = "legacy"')
    expect(result.next.mdx).not.toContain('.legacy { display: block; }')
    expect(result.next.mdx).not.toContain('CURRENT_HTML_ONLY')
    expect(result.next.mdx).not.toContain('next-channel-')
    expect(result.next.mdx).not.toContain('current-channel-')

    // Literal code examples remain byte-identical
    expect(result.current.mdx).toContain('```markdown\n<NextChannel action="include">literal example</NextChannel>\n```')
    expect(result.next.mdx).toContain('```markdown\n<NextChannel action="include">literal example</NextChannel>\n```')
    expect(result.current.mdx).toContain('Inline `<NextChannel action="include">code</NextChannel>` stays literal.')
  })

  it('fails closed on unterminated gates during projection and catches residual tags/directives', () => {
    const unterminatedInclude = 'Keep\n\n<NextChannel action="include">\nSTAGED_TAIL\n'
    expect(projectChannelView(unterminatedInclude, 'current')).not.toContain('STAGED_TAIL')
    expect(projectChannelView(unterminatedInclude, 'next')).toContain('STAGED_TAIL')

    const unterminatedExclude = 'Keep\n\n<NextChannel action="exclude">\nCURRENT_TAIL\n'
    expect(projectChannelView(unterminatedExclude, 'next')).not.toContain('CURRENT_TAIL')
    expect(projectChannelView(unterminatedExclude, 'current')).toContain('CURRENT_TAIL')

    const malformedTag = projectDualChannelMdx('<NextChannel variant="next">\nBad\n</NextChannel>\n')
    expect(malformedTag.ok).toBe(false)
    expect(malformedTag.errors.some(e => e.code === 'CHANNEL_RESIDUAL_TAG')).toBe(true)

    const nestedTag = projectDualChannelMdx(
      '<NextChannel action="include">\n<NextChannel action="exclude">\nX\n</NextChannel>\n</NextChannel>\n',
    )
    expect(nestedTag.ok).toBe(false)
    expect(nestedTag.errors.some(e => e.code === 'CHANNEL_RESIDUAL_TAG')).toBe(true)

    const unclosedDirective = projectDualChannelMdx('```python\n# next-channel-start\nx = 1\n```\n')
    expect(unclosedDirective.ok).toBe(false)
    expect(unclosedDirective.errors.some(e => e.code === 'CHANNEL_RESIDUAL_DIRECTIVE')).toBe(true)

    const directResidual = validateProjectedChannelView('```js\n// current-channel-end\n```\n', 'current')
    expect(directResidual.errors.some(e => e.code === 'CHANNEL_RESIDUAL_DIRECTIVE')).toBe(true)
  })

  it('computes githubHeadingSlug for CJK and English headings and detects duplicate heading/anchor conflicts', () => {
    expect(githubHeadingSlug('概览')).toBe('概览')
    expect(githubHeadingSlug('Delete Entities (v2)')).toBe('delete-entities-v2')
    expect(githubHeadingSlug('使用 API_Key 连接')).toBe('使用-api_key-连接')

    // Channel-exclusive duplicate headings pass in both views
    const exclusive = `
<NextChannel action="exclude">
## 概览
</NextChannel>
<NextChannel action="include">
## 概览
</NextChannel>
`
    expect(projectDualChannelMdx(exclusive).ok).toBe(true)

    // Channel-leaked duplicate CJK heading fails in NEXT view only
    const leakedCjk = `
## 概览

<NextChannel action="include">
## 概览
</NextChannel>
`
    const leakedRes = projectDualChannelMdx(leakedCjk)
    expect(leakedRes.ok).toBe(false)
    expect(leakedRes.current.errors).toEqual([])
    expect(leakedRes.next.errors.some(e => e.code === 'DUPLICATE_HEADING_ANCHOR')).toBe(true)

    // Duplicate English headings fail
    const dupEn = '## Step 1\n\n## Step 1\n'
    expect(validateProjectedChannelView(dupEn, 'current').errors[0].code).toBe('DUPLICATE_HEADING_ANCHOR')

    // Explicit {#id} / \{#id} and <a id="..."> collisions fail
    expect(validateProjectedChannelView('## A {#dup}\n\n## B \\{#dup}\n', 'current').errors[0].code).toBe(
      'DUPLICATE_HEADING_ANCHOR',
    )
    expect(validateProjectedChannelView('## Overview\n\n## 概览 {#overview}\n', 'current').errors[0].code).toBe(
      'DUPLICATE_HEADING_ANCHOR',
    )
    expect(validateProjectedChannelView('<a id="overview"></a>\n\n## Overview\n', 'current').errors[0].code).toBe(
      'DUPLICATE_HEADING_ANCHOR',
    )

    // Disambiguated headings pass
    expect(validateProjectedChannelView('## 概览 {#overview-1}\n\n## 概览 {#overview-2}\n', 'current').errors).toEqual(
      [],
    )

    // Headings inside fenced code, HTML comments, and MDX comments do not trigger false positives
    const commentedAndFenced = `
## 概览

<!--
## 概览
-->

{/* ## 概览 */}

\`\`\`markdown
## 概览
\`\`\`

> \`\`\`markdown
> ## 概览
> \`\`\`
`
    expect(validateProjectedChannelView(commentedAndFenced, 'current').errors).toEqual([])
  })
})
