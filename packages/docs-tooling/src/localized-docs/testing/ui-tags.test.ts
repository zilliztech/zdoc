// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  createJsExpressionScanCache,
  maskCodeAndComments,
  maskCodeAndCommentsWithRanges,
  scanJsExpression,
  scanUiTags,
  validateUiTags,
} from '../core/ui-tags.ts'

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

  it('masks JS literals inside prose expressions without masking nested JSX and prevents unclosed backticks from crossing into 4-space fences', () => {
    // Finding 1: prose JS expressions containing "<!--", "<UI>", or "`" must not trigger HTML comments, tags, or backticks
    for (const expr of ['{/* c */ "<!--"}', '{"<!--"}', '{"<UI>"}', '{/* c */ "`"}']) {
      const md = `${expr}\n\nClick <UI>Save</UI> and <UI bad />.\n`
      const errors = validateUiTags(md)
      expect(errors, expr).toHaveLength(1)
      expect(errors[0].code, expr).toBe('UI_TAG_MALFORMED')
      expect(errors[0].line, expr).toBe(3)
    }

    // Nested JSX inside prose expressions (with comments, comparisons, or apostrophes) stays visible
    expect(scanUiTags('{/* c */ <UI>Keep</UI>}')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 1, column: 10 }],
    })
    expect(scanUiTags('{cond && <Admonition type="note">It\'s <UI>Keep</UI></Admonition>}')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 1, column: 39 }],
    })
    expect(scanUiTags('{a < b && <UI>Ok</UI>}')).toEqual({
      tags: [{ text: 'Ok', rawInner: 'Ok', line: 1, column: 11 }],
    })

    // Finding 2: unclosed prose backtick before 4-space indented fence inside <TabItem>
    const unclosedTickBeforeIndentedFence = [
      '<Tabs>',
      '',
      '    <TabItem value="a" label="A">',
      '',
      '    Use a `backtick',
      '    ```js',
      '    // <UI bad />',
      '    const s = "`";',
      '    ```',
      '',
      '    </TabItem>',
      '',
      '</Tabs>',
      '',
      'Click <UI>After</UI>.',
    ].join('\n')
    expect(scanUiTags(unclosedTickBeforeIndentedFence)).toEqual({
      tags: [{ text: 'After', rawInner: 'After', line: 15, column: 7 }],
    })

    // Finding 3: JSX inside non-UI prop expressions is scanned, while string attributes and JS string literals are masked
    expect(
      scanUiTags(
        '<Admonition type="note" title="<UI>fake</UI>" x={"<UI>also fake</UI>"} y={<UI>Real</UI>}>body</Admonition>',
      ),
    ).toEqual({
      tags: [{ text: 'Real', rawInner: 'Real', line: 1, column: 75 }],
    })
    const uiPropBad = validateUiTags('<Details summary={<UI bad />}>body</Details>')
    expect(uiPropBad).toHaveLength(1)
    expect(uiPropBad[0].code).toBe('UI_TAG_MALFORMED')
  })

  it('ignores fake closing tags in inline code/comments for lastCloseOffset and runs in linear time on unclosed regex brackets', () => {
    // Minor 2: fake </T> inside inline code, HTML comments, or JS strings must not keep jsxStack open
    expect(scanUiTags('Use <T> and `</T>` here.\n\n    <UI>indented code</UI>\n')).toEqual({ tags: [] })
    expect(scanUiTags('Use <T> and <!-- </T> --> here.\n\n    <UI>indented code</UI>\n')).toEqual({ tags: [] })
    expect(scanUiTags('Use <T> and {"</T>"} here.\n\n    <UI>indented code</UI>\n')).toEqual({ tags: [] })

    // Minor 1: linear-time memoization on crafted unclosed regex-bracket lines (while still matching later valid /a/)
    const t0 = performance.now()
    const malformed = scanJsExpression(`{ ${'/['.repeat(5000)}`, 0)
    const malformedClass = scanJsExpression(`{ ${'/a[/]'.repeat(2500)}`, 0)
    const elapsedMs = performance.now() - t0
    expect(malformed.end).toBe(-1)
    expect(malformedClass.end).toBe(-1)
    expect(elapsedMs).toBeLessThan(100)

    const validAfterOpenBracket = scanJsExpression('{/[/a/}', 0)
    expect(validAfterOpenBracket.end).toBe(7)
    expect(validAfterOpenBracket.maskRanges).toEqual([[3, 6]])
  })

  it('skips 4-space indented fences in computeLastCloseOffsets, updates deadMask bit 1, and masks nested-brace JSX wrappers', () => {
    // Finding 1 (Iter 6): unclosed <!-- or {/* inside 4-space fence in <TabItem> must not break lastCloseOffset
    const htmlCommentInFence = [
      '<Tabs>',
      '',
      '    <TabItem value="a" label="A">',
      '',
      '    ```html',
      '    <!-- unclosed html comment in 4-space fence',
      '    ```',
      '',
      '    </TabItem>',
      '',
      '</Tabs>',
      '',
      '<blockquote>',
      '',
      '    <UI bad />',
      '',
      '</blockquote>',
    ].join('\n')
    const uiErrorsHtml = validateUiTags(htmlCommentInFence)
    expect(uiErrorsHtml).toHaveLength(1)
    expect(uiErrorsHtml[0].code).toBe('UI_TAG_MALFORMED')
    expect(uiErrorsHtml[0].line).toBe(15)

    const jsxCommentInFence = [
      '<Tabs>',
      '',
      '    <TabItem value="a" label="A">',
      '',
      '    ```jsx',
      '    {/* unclosed JSX comment in 4-space fence',
      '    ```',
      '',
      '    </TabItem>',
      '',
      '</Tabs>',
      '',
      '<Wrapper>',
      '',
      '    <UI>InsideWrapper</UI>',
      '',
      '</Wrapper>',
    ].join('\n')
    expect(scanUiTags(jsxCommentInFence)).toEqual({
      tags: [{ text: 'InsideWrapper', rawInner: 'InsideWrapper', line: 15, column: 5 }],
    })

    // Finding 2 (Iter 6) & Reviewer Minor: deadMask updates bit 1 on subsequent failed regex scans in O(N)
    const slashBackslashInput = `{ /[${'\\/'.repeat(10000)} }`
    const slashPlusInput = `{ /[+${'\\/+'.repeat(5000)} }`
    const t0 = performance.now()
    const slashBackslash = scanJsExpression(slashBackslashInput, 0)
    const slashPlus = scanJsExpression(slashPlusInput, 0)
    const elapsedMs = performance.now() - t0
    expect(slashBackslash.end).toBe(slashBackslashInput.length)
    expect(slashPlus.end).toBe(slashPlusInput.length)
    expect(elapsedMs).toBeLessThan(100)

    const validCharClass = scanJsExpression('{ [/[a, /b/] }', 0)
    expect(validCharClass.end).toBe(14)
    expect(validCharClass.maskRanges).toEqual([[8, 11]])

    const validAfterUnclosed = scanJsExpression('{ x = /[unclosed, y = /ok/ }', 0)
    expect(validAfterUnclosed.end).toBe(28)
    expect(validAfterUnclosed.maskRanges).toEqual([[22, 26]])

    // Finding 3 (Iter 6): nested-brace and template-literal JSX wrappers are masked while inner <UI> stays visible
    const nestedBraceExpr = '{(() => { return <Admonition type="note"><UI>Keep</UI></Admonition>; })()}'
    const nestedBraceUi = maskCodeAndComments(nestedBraceExpr)
    expect(nestedBraceUi).toContain('<Admonition type="    "><UI>Keep</UI></Admonition>')
    expect(nestedBraceUi).not.toContain('return')
    expect(scanUiTags(nestedBraceExpr)).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 1, column: 42 }],
    })

    expect(scanUiTags('{`${<UI>TemplateKeep</UI>}`}')).toEqual({
      tags: [{ text: 'TemplateKeep', rawInner: 'TemplateKeep', line: 1, column: 5 }],
    })
  })

  it('masks top-level 4-space indented fences while preserving unmatched 4-space Markdown indented code block behavior', () => {
    // Finding 1 (Iter 7): top-level 4-space indented fences with <4-space body lines must be masked
    const topLevel4SpaceFence = [
      '# T',
      '',
      '    ```jsx',
      '<UI bad />',
      '    ```',
      '',
      '    ~~~tsx',
      '<UI>ignored</UI>',
      '    ~~~',
      '',
      'Real <UI>Keep</UI>.',
    ].join('\n')
    expect(scanUiTags(topLevel4SpaceFence)).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 11, column: 6 }],
    })

    // Unmatched fence opener inside a top-level 4-space Markdown indented code block masks only the indented lines
    const unmatchedTopLevelMdCode = [
      '# T',
      '',
      '    ```bash',
      '    echo example',
      '',
      'Real <UI>Keep</UI>.',
    ].join('\n')
    expect(scanUiTags(unmatchedTopLevelMdCode)).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 6, column: 6 }],
    })

    // Adjacent JSX fragment foo<>...</>bar still preserves inner <UI>
    expect(scanUiTags('foo<><UI>Keep</UI></>bar')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 1, column: 6 }],
    })
  })

  it('resolves 4+-space fences closed by 0-3 space fences sequentially without inverting parity and records nested-brace JSX wrappers inside JSX', () => {
    // Iter 8 Finding 1: 4+-space fence closed by 0-3 space fence must not invert fence parity
    expect(scanUiTags('# T\n\n    ```jsx\n<UI bad />\n```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 6 }],
    })
    expect(scanUiTags('# T\n\n    ```jsx\n<UI bad />\n   ```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 6 }],
    })
    expect(scanUiTags('# T\n\n    ~~~jsx\n<UI bad />\n~~~\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 6 }],
    })

    const bypassUiErrors = validateUiTags('# T\n\n    ```jsx\nconst a = 1;\n```\n\n<UI bad />\n\nReal paragraph.\n')
    expect(bypassUiErrors).toHaveLength(1)
    expect(bypassUiErrors[0].code).toBe('UI_TAG_MALFORMED')
    expect(bypassUiErrors[0].line).toBe(7)

    const parityInversion = [
      '# T',
      '',
      '    ```jsx',
      'const a = 1;',
      '```',
      '',
      'Real paragraph with <UI>Keep</UI>.',
      '',
      '```js',
      '<UI bad />',
      '```',
      '',
    ].join('\n')
    expect(scanUiTags(parityInversion)).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 21 }],
    })

    // 0-space opener closed by 4-space closer, and 4-space 4-backtick fence containing 0-space 3-backtick fence
    expect(scanUiTags('# T\n\n```jsx\n<UI bad />\n    ```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 6 }],
    })
    expect(scanUiTags('# T\n\n    ````md\n```js\n<UI bad />\n```\n````\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 9, column: 6 }],
    })

    // Blockquote, list, and <Tabs><TabItem> fences with 0-3 space closers
    expect(scanUiTags('# T\n\n> ```js\n> <UI bad />\n> ```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 6 }],
    })
    expect(scanUiTags('# T\n\n- item\n\n    ```js\n    <UI bad />\n    ```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 9, column: 6 }],
    })
    expect(
      scanUiTags(
        '<Tabs>\n\n    <TabItem value="a" label="A">\n\n    ```jsx\n<UI bad />\n```\n\n    </TabItem>\n\n</Tabs>\n\nReal <UI>Keep</UI>.\n',
      ),
    ).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 13, column: 6 }],
    })

    // Unmatched top-level 4-space fence opener followed by <Wrapper><UI>Keep</UI></Wrapper>
    expect(
      scanUiTags('# T\n\n    ```js\n    const x = 1;\n\n<Wrapper>\n\n    <UI>Keep</UI>\n\n</Wrapper>\n'),
    ).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 8, column: 5 }],
    })

    // Strict O(N) time on thousands of unmatched 4-space fence openers
    const t0 = performance.now()
    const manyUnclosed = `# T\n\n${'    ```js\n'.repeat(5000)}\nReal <UI>Keep</UI>.\n`
    const manyRes = scanUiTags(manyUnclosed)
    expect(performance.now() - t0).toBeLessThan(150)
    expect(manyRes).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 5004, column: 6 }],
    })

    // Iter 8 Finding 2: doubly-nested {...} / template wrappers inside {<Tag>...</Tag>}
    for (const expr of [
      '{<p>{`prefix ${<UI>Keep</UI>} suffix`}</p>}',
      '{<p>{(() => { return <UI>Keep</UI>; })()}</p>}',
      '{<p>{(() => { const x = { a: 1 }; return <UI>Keep</UI>; })()}</p>}',
      '{<>{`prefix ${<UI>Keep</UI>} suffix`}</>}',
    ]) {
      expect(scanUiTags(expr), expr).toEqual({
        tags: [{ text: 'Keep', rawInner: 'Keep', line: 1, column: expr.indexOf('<UI>') + 1 }],
      })
      const { masked, jsxExprWrapperRanges } = maskCodeAndCommentsWithRanges(expr)
      expect(jsxExprWrapperRanges.length, expr).toBeGreaterThan(2)
      expect(masked, expr).toContain('<UI>Keep</UI>')
      expect(masked, expr).not.toContain('prefix')
      expect(masked, expr).not.toContain('return')
    }
  })

  it('ignores fence markers inside MDX/HTML comments, resolves blockquote 4+-space fences without depth mismatch, and strips inline {/* c */} ranges (Iter 9 Findings 1-4)', () => {
    // Finding 1: {/* ... */} and <!-- ... --> containing fence marker lines must not open fences
    expect(scanUiTags('# T\n\n{/*\n```js\n*/}\n\nReal paragraph <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 16 }],
    })
    expect(scanUiTags('# T\n\n<!--\n```js\n-->\n\nReal paragraph <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 16 }],
    })
    expect(scanUiTags('# T\n\n- item\n\n  {/*\n  ```js\n  */}\n\n  Real <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 9, column: 8 }],
    })
    const uiAfterCommentFence = validateUiTags('# T\n\n{/*\n```js\n*/}\n\n<UI bad />\n\n```py\nconst x = 1;\n```\n')
    expect(uiAfterCommentFence).toHaveLength(1)
    expect(uiAfterCommentFence[0].code).toBe('UI_TAG_MALFORMED')
    expect(uiAfterCommentFence[0].line).toBe(7)

    // Negative check: {/* inside a fence is code, not a comment, and `{/*` inline code does not open a comment
    expect(scanUiTags('# T\n\n```js\n{/*\n```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 6 }],
    })
    expect(scanUiTags('# T\n\n`{/*`\n```js\n<UI bad />\n```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 8, column: 6 }],
    })

    // Finding 2: blockquote-prefixed 4+-space fences (single, nested, list-nested, inside Tabs)
    expect(scanUiTags('# T\n\n>     ```jsx\n> <UI bad />\n>     ```\n\nReal paragraph.\n')).toEqual({ tags: [] })
    expect(scanUiTags('# T\n\n>     ```jsx\n> <UI bad />\n> ```\n\nReal paragraph.\n')).toEqual({ tags: [] })
    expect(scanUiTags('# T\n\n> >     ```jsx\n> > <UI bad />\n> >     ```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 6 }],
    })
    expect(scanUiTags('# T\n\n- item\n\n  >     ```jsx\n  > <UI bad />\n  >     ```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 9, column: 6 }],
    })
    expect(
      scanUiTags(
        '# T\n\n<Tabs>\n\n  <TabItem value="a" label="A">\n\n  >     ```jsx\n  > <UI bad />\n  >     ```\n\n  </TabItem>\n\n</Tabs>\n\nReal <UI>Keep</UI>.\n',
      ),
    ).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 15, column: 6 }],
    })

    const bqBypassErrors = validateUiTags('# T\n\n>     ```jsx\n> const a = 1;\n> ```\n>\n> <UI bad />\n\nReal paragraph.\n')
    expect(bqBypassErrors).toHaveLength(1)
    expect(bqBypassErrors[0].code).toBe('UI_TAG_MALFORMED')
    expect(bqBypassErrors[0].line).toBe(7)

    expect(
      scanUiTags('# T\n\n>     ```jsx\n> const a = 1;\n> ```\n>\n> Real <UI>Keep</UI>.\n>\n> ```js\n> <UI bad />\n> ```\n'),
    ).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 7, column: 8 }],
    })

    // Unmatched >     ```bash must not swallow prose outside blockquote (or cross exiting line / mismatched depth)
    expect(scanUiTags('# T\n\n>     ```bash\n>     echo hi\n\nReal <UI>Keep</UI>.\n\n> ```\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 6, column: 6 }],
    })
    expect(scanUiTags('# T\n\n> >     ```jsx\n> >     echo hi\n> ```\n> <UI bad />\n> ```\n\nReal <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 9, column: 6 }],
    })

    // O(N) performance on 10,000 unclosed 4-space lines, 5,000 comment fences, and 5,000 nested blockquote depth mismatches
    const t0 = performance.now()
    const tenK = scanUiTags(`# T\n\n${'    ```js\n'.repeat(10000)}\nReal <UI>Keep</UI>.\n`)
    const commentMany = scanUiTags(`# T\n\n{/*\n${'```js\n'.repeat(5000)}*/}\n\nReal <UI>Keep</UI>.\n`)
    const nestedMismatch = scanUiTags(`# T\n\n${'> >     ```js\n'.repeat(5000)}> \`\`\`\n\nReal <UI>Keep</UI>.\n`)
    expect(performance.now() - t0).toBeLessThan(200)
    expect(tenK).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 10004, column: 6 }] })
    expect(commentMany).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 5006, column: 6 }] })
    expect(nestedMismatch).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 5005, column: 6 }] })

    // Finding 3 & 4 surface helpers: fenceRanges + outerNonJsxGaps/proseCommentRanges
    const fenceRes = maskCodeAndCommentsWithRanges('# T\n\n>     ```py\n> x\n> ```\n\n{/*\n```js\n*/}\n')
    expect(fenceRes.fenceRanges).toEqual([{ start: 2, end: 4, bqDepth: 1, closed: true }])

    const commentInJsxExpr = maskCodeAndCommentsWithRanges('{<p>{/* c */}{(() => <UI>Keep</UI>)()}</p>}')
    expect(commentInJsxExpr.jsxExprWrapperRanges.some(([s, e]) => commentInJsxExpr.masked.slice(s, e).trim() === '' && e - s >= 9)).toBe(true)

    const topComment = maskCodeAndCommentsWithRanges('<p>{/* c */}Hello</p>')
    expect(topComment.proseCommentRanges).toEqual([[3, 12]])
  })

  it('stops inline backtick spans at block boundaries, runs O(N) on unclosed comments/braces, and scans blockquote-4sp JSX inside containers (Iter 10 Findings 1-3)', () => {
    // Finding 1: cross-block backtick pairing must not expose `{/*` across blockquote blank lines,
    // blockquote depth changes, ATX headings, lists, thematic breaks, or top-level 4-space blocks
    const crossBlockUiCases: [string, string, number][] = [
      ['blockquote blank line', '# T\n\n> Here is `unclosed\n>\n> `{/*`\n> ```js\n> */}\n> ```\n>\n> <UI bad />\n', 10],
      ['blockquote deeper nesting', '# T\n\n> Here is `unclosed\n> > `{/*`\n> > ```js\n> > */}\n> > ```\n\n<UI bad />\n', 9],
      ['entering blockquote', '# T\n\nHere is `unclosed\n> `{/*`\n> ```js\n> */}\n> ```\n\n<UI bad />\n', 9],
      ['exiting blockquote', '# T\n\n> Here is `unclosed\n`{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 9],
      ['ATX heading', '# T\n\nHere is `unclosed\n# Heading `{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 9],
      ['bullet list -', '# T\n\nHere is `unclosed\n- item `{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 9],
      ['bullet list *', '# T\n\nHere is `unclosed\n* item `{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 9],
      ['ordered list 1.', '# T\n\nHere is `unclosed\n1. item `{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 9],
      ['ordered list 1)', '# T\n\nHere is `unclosed\n1) item `{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 9],
      ['thematic break', '# T\n\nHere is `unclosed\n***\n`{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 10],
      ['setext underline', '# T\n\nHere is `unclosed\n---\n`{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 10],
      ['top-level 4-space code block', '# T\n\n    Here is `unclosed\n`{/*`\n```js\n*/}\n```\n\n<UI bad />\n', 9],
    ]
    for (const [label, md, expectedLine] of crossBlockUiCases) {
      const errs = validateUiTags(md)
      expect(errs, label).toHaveLength(1)
      expect(errs[0].code, label).toBe('UI_TAG_MALFORMED')
      expect(errs[0].line, label).toBe(expectedLine)
    }

    expect(
      scanUiTags('# T\n\n> Here is `unclosed\n>\n> `{/*`\n> ```js\n> */}\n> ```\n>\n> Real <UI>Keep</UI>.\n'),
    ).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 10, column: 8 }] })

    // Valid multi-line inline backticks inside a single paragraph, blockquote paragraph, and <Tabs> remain intact
    expect(scanUiTags('# T\n\nHere is `multi\nline <UI bad />` and <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 4, column: 22 }],
    })
    expect(scanUiTags('# T\n\n> Here is `multi\n> line <UI bad />` and <UI>Keep</UI>.\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 4, column: 24 }],
    })
    expect(
      scanUiTags(
        '# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n    Here is `multi\n    line` and `{/*`\n    ```js\n    */}\n    ```\n\n    Real <UI>Keep</UI>.\n\n</TabItem>\n</Tabs>\n',
      ),
    ).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 12, column: 10 }] })

    // Finding 2: subtle nested `{ foo }` after unclosed `{` stays accurate while 10,000-line unclosed cases stay O(N)
    const subtleCache = createJsExpressionScanCache()
    const subtleSrc = '    {\n    { foo }'
    expect(scanJsExpression(subtleSrc, 4, subtleCache).end).toBe(-1)
    expect(scanJsExpression(subtleSrc, 10, subtleCache).end).toBe(17)

    expect(scanUiTags('{\n{ <UI>Keep</UI> }\n')).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 2, column: 3 }],
    })
    expect(
      scanUiTags('<Tabs>\n<TabItem value="a" label="A">\n\n    {\n    { <UI>Keep</UI> }\n\n</TabItem>\n</Tabs>\n'),
    ).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 5, column: 7 }] })

    for (const [label, line] of [
      ['4sp-brace', '    {'],
      ['bq-4sp-brace', '>     {'],
      ['0sp-brace', '{'],
      ['4sp-html-comment', '    <!--'],
      ['bq-4sp-html-comment', '>     <!--'],
      ['4sp-mdx-comment', '    {/*'],
      ['4sp-str-brace', '    { "'],
    ] as const) {
      const doc = `${Array.from({ length: 10000 }, () => line).join('\n')}\n\nReal <UI>Keep</UI>.\n`
      const t0 = performance.now()
      const res = scanUiTags(doc)
      const elapsed = performance.now() - t0
      expect(elapsed, `${label} took ${elapsed.toFixed(2)}ms`).toBeLessThan(100)
      expect(res, label).toEqual({
        tags: [{ text: 'Keep', rawInner: 'Keep', line: 10002, column: 6 }],
      })
    }

    const tabs10kBraces = `<Tabs>\n<TabItem value="a" label="A">\n\n${Array.from({ length: 10000 }, () => '    {').join('\n')}\n\n</TabItem>\n</Tabs>\n\nReal <UI>Keep</UI>.\n`
    const tTabs0 = performance.now()
    const tabs10kRes = scanUiTags(tabs10kBraces)
    const tabsElapsed = performance.now() - tTabs0
    expect(tabsElapsed, `tabs-10k-brace took ${tabsElapsed.toFixed(2)}ms`).toBeLessThan(100)
    expect(tabs10kRes).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 10008, column: 6 }],
    })

    const fiveKBackticks = `${Array.from({ length: 5000 }, () => 'x `').join('\n')}\n\nReal <UI>Keep</UI>.\n`
    const tBt0 = performance.now()
    const fiveKRes = scanUiTags(fiveKBackticks)
    const btElapsed = performance.now() - tBt0
    expect(btElapsed, `5k-unclosed-bt took ${btElapsed.toFixed(2)}ms`).toBeLessThan(100)
    expect(fiveKRes).toEqual({
      tags: [{ text: 'Keep', rawInner: 'Keep', line: 5002, column: 6 }],
    })

    // Finding 3: blockquote-prefixed 4+-space JSX inside open JSX containers is live JSX
    for (const containerDoc of [
      '# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n>     <UI bad />\n\n</TabItem>\n</Tabs>\n',
      '# T\n\n<Admonition type="note">\n\n>     <UI bad />\n\n</Admonition>\n',
      '# T\n\n<details><summary>Info</summary>\n\n>     <UI bad />\n\n</details>\n',
    ]) {
      const errs = validateUiTags(containerDoc)
      expect(errs, containerDoc).toHaveLength(1)
      expect(errs[0].code, containerDoc).toBe('UI_TAG_MALFORMED')
    }

    expect(
      scanUiTags('# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n>     <UI>Keep</UI>\n\n</TabItem>\n</Tabs>\n'),
    ).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 6, column: 7 }] })

    // Unclosed >     ```bash spans its blockquote (matching MDX codeIndented: false) and exits when blockquote depth drops
    expect(
      scanUiTags(
        '# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n>     ```bash\n>     <UI bad />\n\n>     <UI>Keep</UI>\n\n</TabItem>\n</Tabs>\n',
      ),
    ).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 9, column: 7 }] })
    expect(
      scanUiTags(
        '# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n>     ```bash\n>     <UI bad />\n> <UI>Keep</UI>\n\n</TabItem>\n</Tabs>\n',
      ),
    ).toEqual({ tags: [] })
  })

  it('masks unclosed blockquote 4+-space fences after paragraphs, linearizes mismatched JSX stacks and trailing */ comments, and aligns preJsxStack (Iter 11 Findings 1-3 & Reviewer Minor 1-2)', () => {
    // Fix 1: unclosed >     ```js after > Paragraph line (in <Tabs>, <Admonition>, <details>, nested > >, and top-level)
    for (const maskedFenceDoc of [
      '# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n> Paragraph line\n>     ```js\n> <UI bad />\n\n</TabItem>\n</Tabs>\n',
      '# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n> Paragraph line\n>     ```js\n> <UI>NotLive</UI>\n\n</TabItem>\n</Tabs>\n',
      '# T\n\n<Admonition type="note">\n\n> Paragraph line\n>     ```js\n> <UI bad />\n\n</Admonition>\n',
      '# T\n\n<details><summary>Info</summary>\n\n> Paragraph line\n>     ```js\n> <UI bad />\n\n</details>\n',
      '# T\n\n> Paragraph line\n>     ```js\n> <UI bad />\n\nReal.\n',
    ]) {
      expect(scanUiTags(maskedFenceDoc), maskedFenceDoc).toEqual({ tags: [] })
    }

    // Nested > > unclosed fence exits back to > level and keeps > <UI>Keep</UI> live
    expect(
      scanUiTags(
        '# T\n\n<Tabs>\n<TabItem value="a" label="A">\n\n> > Paragraph line\n> >     ```js\n> > <UI bad />\n> <UI>Keep</UI>\n\n</TabItem>\n</Tabs>\n',
      ),
    ).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 9, column: 3 }] })

    // Fix 2: O(N) scaling on 20,000-line mismatched closing JSX tags (both inside {...} and top-level JSX)
    const exprMismatch = `{\n${Array.from({ length: 10000 }, () => '<div>').join('\n')}\n${Array.from({ length: 10000 }, () => '</section>').join('\n')}\n</div>\n}\nReal <UI>Keep</UI>.\n`
    const jsxMismatch = `${Array.from({ length: 10000 }, () => '<div>').join('\n')}\n${Array.from({ length: 10000 }, () => '</section>').join('\n')}\n</div>\nReal <UI>Keep</UI>.\n`
    const deepBracesThenBr = `{\n<div>\n${'{'.repeat(4000)}\n<br />\n${'}'.repeat(4000)}\n</div>\n}\nReal <UI>Keep</UI>.\n`
    for (const [label, doc, expectedLine] of [
      ['expr-stack-mismatch', exprMismatch, 20004],
      ['jsx-stack-mismatch', jsxMismatch, 20002],
      ['deep-braces-jsx-span', deepBracesThenBr, 8],
    ] as const) {
      const t0 = performance.now()
      const res = scanUiTags(doc)
      const elapsed = performance.now() - t0
      expect(elapsed, `${label} took ${elapsed.toFixed(2)}ms`).toBeLessThan(150)
      expect(res, label).toEqual({
        tags: [{ text: 'Keep', rawInner: 'Keep', line: expectedLine, column: 6 }],
      })
    }

    // Fix 3: fake </TagName> inside inline backticks, HTML comments, or fences must not push preJsxStack
    for (const fakeCloseTail of ['`</span>`', '<!-- </span> -->', '```html\n</span>\n```']) {
      const doc = `# T\n\n<span>\n\n    Here is \`unclosed and \`{/*\`\n\n\`\`\`js\n*/}\n\`\`\`\n\n<UI bad />\n\n${fakeCloseTail}\n`
      const errs = validateUiTags(doc)
      expect(errs, fakeCloseTail).toHaveLength(1)
      expect(errs[0].code, fakeCloseTail).toBe('UI_TAG_MALFORMED')
      expect(errs[0].line, fakeCloseTail).toBe(11)
    }

    // Valid non-KNOWN container <Wrapper> with real </Wrapper> still prevents 4-space comment from breaking fences
    expect(
      scanUiTags('# T\n\n<Wrapper>\n\n    {/*\n    ```js\n    */}\n\n</Wrapper>\n\nReal <UI>Keep</UI>.\n'),
    ).toEqual({ tags: [{ text: 'Keep', rawInner: 'Keep', line: 11, column: 6 }] })

    // Fix 4: O(N) scaling on 10,000 unclosed `{ /*` lines preceding a single trailing `*/`
    const topOpenBlockComments = `${Array.from({ length: 10000 }, () => '{ /*').join('\n')}\n*/\n\nReal <UI>Keep</UI>.\n`
    const tabsOpenBlockComments = `<Tabs>\n<TabItem value="a" label="A">\n\n${Array.from({ length: 10000 }, () => '    { /*').join('\n')}\n    */\n\n</TabItem>\n</Tabs>\n\nReal <UI>Keep</UI>.\n`
    for (const [label, doc, expectedLine] of [
      ['0sp-open-block-comment-eof', topOpenBlockComments, 10003],
      ['tabs-4sp-open-block-comment-eof', tabsOpenBlockComments, 10009],
    ] as const) {
      const t0 = performance.now()
      const res = scanUiTags(doc)
      const elapsed = performance.now() - t0
      expect(elapsed, `${label} took ${elapsed.toFixed(2)}ms`).toBeLessThan(150)
      expect(res, label).toEqual({
        tags: [{ text: 'Keep', rawInner: 'Keep', line: expectedLine, column: 6 }],
      })
    }
  })
})
