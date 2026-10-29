// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { mergeMarkdown } from '../../core/merge'
import { assertViews, currentView, input, nextView, normalizeBody, projected } from './helpers'

function pair(a: string, b: string) {
  const current = input(a, 'current'), next = input(b, 'next')
  const snapshot = JSON.stringify({ current, next })
  const output = mergeMarkdown({ current, next })
  if ('errors' in output) throw new Error(JSON.stringify(output.errors))
  assertViews(output, current, next)
  expect(mergeMarkdown({ current, next })).toEqual(output)
  expect(JSON.stringify({ current, next })).toBe(snapshot)
  return output
}

describe('strict two-view oracle', () => {
  it.each([
    ['```js\na()\n\nb()\n```\n', '```js\na()\nb()\n```\n'],
    ['- first\n\n  continued\n\n- second\n', '- first\n  continued\n\n- second\n'],
    ['Hard break  \nnext\n', 'Hard break\nnext\n'],
    ['```md\n<NextChannel>\n```\n', '```md\n<NextChannel >\n```\n'],
    ['## Heading{#id}\n', '## Heading{#other}\n'],
    ['Text\n', 'Text'],
    ['Text\r\n', 'Text\n'],
    ['Text\n\n  \n', 'Text\n\n'],
  ])('detects a nonseparator byte mutation (%j)', (a, b) => {
    expect(normalizeBody(a)).not.toEqual(normalizeBody(b))
  })
  it('normalizes only parser-confirmed empty separators', () => {
    expect(normalizeBody('\nA\n\n\nB\n\n')).toEqual(normalizeBody('A\n\nB\n'))
  })
  it('[6-4] production CURRENT resolver drops next-only prose and code sentinels', () => {
    const output = pair('Old\n', 'Next secret\n\n```js\nnext_secret()\n```\n')
    expect(currentView(output.markdown)).not.toContain('secret')
    expect(nextView(output.markdown)).toContain('next_secret()')
  })
  it.each(['# %s', '// %s', '/* %s */', '<!-- %s -->', '{/* %s */}'])('pins directive compatibility for %s independently', style => {
    const comment = (value: string) => style.replace('%s', value)
    const fence = ['```js', comment('next-channel-next-line'), 'next()', comment('current-channel-start'), 'old()', comment('current-channel-end'), 'both()', '```'].join('\n') + '\n'
    expect(currentView(fence)).toBe('```js\nold()\nboth()\n```\n')
    expect(nextView(fence)).toBe('```js\nnext()\nboth()\n```\n')
    pair(fence, fence.replace('both()', 'changed()'))
  })
  it('pins NEXT gates, literal fenced tags and directive regions to explicit expected bytes', () => {
    const source = '<NextChannel action="exclude">old</NextChannel>\n<NextChannel action="include">new</NextChannel>\n\n```md\n<NextChannel action="exclude">literal</NextChannel>\n```\n'
    expect(nextView(source)).toBe('\nnew\n\n```md\n<NextChannel action="exclude">literal</NextChannel>\n```\n')
  })
  it.each(['\n', '\r\n', '\r'])('preserves unicode, hard breaks, indentation and terminal newline differences (%j)', newline => {
    pair(`字  ${newline}line${newline}${newline}End`, `字  ${newline}line${newline}${newline}Changed`)
    pair(`A${newline}`, 'A')
    pair(`A${newline}${newline}    code${newline}${newline}`, `B${newline}${newline}    code${newline}${newline}`)
  })
  it('records the precise synthesized terminal boundary separately from source bytes', () => {
    const output = pair('Old', 'New\n')
    const old = output.emissions.find(item => item.channels.includes('current'))!
    expect(output.markdown.slice(old.span.start, old.span.end)).toBe('Old')
    expect(output.markdown.slice(old.terminalPadding!.start, old.terminalPadding!.end)).toBe('\n')
    expect(projected(output, 'current')).toBe('\n\nOld')
    expect(normalizeBody(projected(output, 'current'))).not.toEqual(normalizeBody('Old\n'))
  })
  it('checks empty documents, insertions, deletions, repeated blocks and moves', () => {
    for (const [a, b] of [['', ''], ['', 'A\n'], ['A\n', ''], ['A\n\nB\n\nC\n', 'B\n\nA\n\nC\n'], ['A\n\nA\n\nB\n', 'A\n\nB\n\nA\n'], ['A\n\nB\n', 'X\n\nY\n']]) pair(a, b)
  })
  it('reconstructs both views for fixed-seed adversarial block sequences (seed 0x5eed)', () => {
    let seed = 0x5eed
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed }
    const blocks = ['Repeated\n', 'Unicode 字  \nline\n', '- one\n\n  detail\n\n- two\n', '| a |\n| - |\n| 1 |\n', '```js\na()\n\nb()\n```\n', '> note\n>\n> text\n']
    for (let run = 0; run < 60; run++) {
      const sequence = () => Array.from({ length: random() % 7 }, () => blocks[random() % blocks.length]).join('\n')
      const a = sequence(), b = sequence()
      try { pair(a, b) } catch (error) { throw new Error(`seed=0x5eed run=${run} fixture=${JSON.stringify({ a, b })}`, { cause: error }) }
    }
  })
})
