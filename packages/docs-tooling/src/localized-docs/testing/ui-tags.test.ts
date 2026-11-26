// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { scanUiTags, validateUiTags } from '../core/ui-tags.ts'

describe('scanUiTags & validateUiTags', () => {
  it('extracts valid <UI>...</UI> tags with accurate 1-based line numbers', () => {
    const md = [
      '# 创建集群',
      '',
      '在控制台点击 <UI>创建集群</UI> 并选择 <UI>Dedicated</UI>。',
      '',
      '然后前往 <UI>Cluster Overview</UI> 查看状态。',
    ].join('\n')

    const res = scanUiTags(md)
    expect('tags' in res).toBe(true)
    if ('tags' in res) {
      expect(res.tags).toEqual([
        { text: '创建集群', rawInner: '创建集群', line: 3, column: 8 },
        { text: 'Dedicated', rawInner: 'Dedicated', line: 3, column: 26 },
        { text: 'Cluster Overview', rawInner: 'Cluster Overview', line: 5, column: 6 },
      ])
    }
  })

  it('ignores <UI> inside fenced code blocks, indented code, inline backticks, and comments', () => {
    const md = [
      'Inline code: `<UI>unclosed` and ``<UI className="x"></UI>`` and `<UI />`.',
      '',
      '<!-- <UI>commented out</UI> -->',
      '{/* <UI>mdx comment</UI> */}',
      '',
      '```tsx',
      '<UI>inside backtick fence</UI>',
      '<UI>unclosed inside fence',
      '```',
      '',
      '~~~md',
      '<UI><UI>nested inside tilde fence</UI></UI>',
      '~~~',
      '',
      '    <UI>indented code block</UI>',
      '',
      'Real tag: <UI>确定</UI> and non-matching component <UIComponent>ok</UIComponent>.',
    ].join('\n')

    const res = scanUiTags(md)
    expect(res).toEqual({
      tags: [{ text: '确定', rawInner: '确定', line: 17, column: 11 }],
    })
  })

  it.each([
    ['unclosed tag', 'Line 1\nClick <UI>Create Cluster\nLine 3', 2],
    ['unmatched closing tag', 'Line 1\nClick </UI>', 2],
    ['nested tags', '<UI>Outer <UI>Inner</UI></UI>', 1],
    ['extra attributes', '<UI className="btn">Save</UI>', 1],
    ['self-closing tag', 'Click <UI /> now', 1],
    ['empty tag', 'Click <UI></UI> now', 1],
    ['whitespace-only tag', 'Click <UI>   </UI> now', 1],
    ['unclosed delimiter', 'Click <UI now', 1],
    ['malformed closing tag', '<UI>Save</UI foo>', 1],
  ])('rejects %s with UI_TAG_MALFORMED', (_label, markdown, expectedLine) => {
    const errors = validateUiTags(markdown)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].code).toBe('UI_TAG_MALFORMED')
    expect(errors[0].line).toBe(expectedLine)
  })
})
