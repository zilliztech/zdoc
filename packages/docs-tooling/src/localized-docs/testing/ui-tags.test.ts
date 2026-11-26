// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { maskCodeAndComments, scanUiTags, validateUiTags } from '../core/ui-tags.ts'

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

  it('does not over-mask past JSX attributes containing {/*, <!--, or backticks and preserves comment masking in prose', () => {
    const mdWithAttrComments = [
      '<Admonition type="note" title={/* c */ "Note"}>',
      'hidden',
      '</Admonition>',
      '',
      '<Admonition type="note" title="{/*" data-x="<!--">',
      'hidden',
      '</Admonition>',
      '',
      '<Admonition type="note" title="a`b" x={`>`}>',
      'hidden',
      '</Admonition>',
      '',
      'Click <UI>Save</UI> and <UI attr-bad />.',
    ].join('\n')

    const errors = validateUiTags(mdWithAttrComments)
    expect(errors).toHaveLength(1)
    expect(errors[0].code).toBe('UI_TAG_MALFORMED')
    expect(errors[0].line).toBe(13)

    const validAfterAttr = [
      '<Admonition type="note" title={/* c */ "Note"}>',
      'body',
      '</Admonition>',
      '',
      'Click <UI>Confirm</UI>.',
    ].join('\n')
    expect(scanUiTags(validAfterAttr)).toEqual({
      tags: [{ text: 'Confirm', rawInner: 'Confirm', line: 5, column: 7 }],
    })

    // Standalone prose MDX comments (including space before }) and HTML comments still mask cleanly,
    // while comment-bearing prose expressions like {/* c */ "Note"} do not blank subsequent lines.
    const proseMasked = maskCodeAndComments(
      '{/* single */}\n{/* spaced */ }\n<!-- html -->\n{/*\nmulti\n*/}\n{/* c */ "Note"}\nAfter <UI>Keep</UI>\n',
    )
    expect(proseMasked).toContain('After <UI>Keep</UI>')
    expect(proseMasked).not.toContain('single')
    expect(proseMasked).not.toContain('spaced')
    expect(proseMasked).not.toContain('html')
    expect(proseMasked).not.toContain('multi')
  })

  it('scans 4-space indented JSX/UI inside open JSX containers while masking top-level 4-space code blocks and indented fences', () => {
    const mdInsideContainer = [
      '<Tabs>',
      '',
      '    <TabItem value="a" label="A">',
      '',
      '    Click <UI>Submit</UI>.',
      '',
      '    ```tsx',
      '    <UI>ignored inside indented fence</UI>',
      '    ```',
      '',
      '    </TabItem>',
      '',
      '</Tabs>',
      '',
      '    <UI>top-level indented code block</UI>',
    ].join('\n')

    expect(scanUiTags(mdInsideContainer)).toEqual({
      tags: [{ text: 'Submit', rawInner: 'Submit', line: 5, column: 11 }],
    })

    // Unclosed prose angle bracket <T> must not disable top-level 4-space code block masking
    const proseAngleThenCode = [
      'Use <T> here.',
      '',
      '    <UI>still top-level indented code</UI>',
    ].join('\n')
    expect(scanUiTags(proseAngleThenCode)).toEqual({ tags: [] })
  })
})
