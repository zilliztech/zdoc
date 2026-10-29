// @vitest-environment node
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { toMdx } from '../../adapters/mdx'
import { mergeMarkdown } from '../../core/merge'
import { assertViews, currentView, input } from './helpers'

const require = createRequire(import.meta.url)
const Writer = require('../../../lark/larkDocWriter.js')
const common = '````md\n```js\n````\n'
const current = common + '\nOld\n'
const next = common + '\n```js\nnext_secret()\n```\n'

async function finalize(markdown: string) {
  const lines = markdown.split('\n')
  const result = await toMdx({ markdown, components: [],
    provenance: { inputLines: lines, outputLines: lines.map((_, index) => index + 1) } }, {})
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  return result.mdx
}

describe('complete assembled-document resolver compatibility', () => {
  it('[6-4] fails closed before a valid common long fence can expose next-only code after actual finalization', async () => {
    // Pin the deployment limitation independently: lint and the real compiler
    // accept this historical output, but the production CURRENT resolver leaks.
    const unsafe = common + '\n<NextChannel action="exclude">\n\nOld\n\n</NextChannel>\n\n<NextChannel action="include">\n\n```js\nnext_secret()\n```\n\n</NextChannel>\n'
    Writer.prototype.__validate_next_channel_tags.call(Writer.prototype, unsafe, 'current')
    Writer.prototype.__validate_channel_code_directives.call(Writer.prototype, unsafe)
    expect(await finalize(unsafe)).toBe(unsafe)
    expect(currentView(unsafe)).toBe(unsafe)
    expect(currentView(current)).toBe(current)
    expect(currentView(current)).not.toContain('next_secret()')

    const result = mergeMarkdown({ current: input(current, 'current'), next: input(next, 'next') })
    expect(result).toMatchObject({ errors: [expect.objectContaining({
      code: 'ADAPT_UNSUPPORTED_MARKUP', channel: 'current', file: 'current-content.md', line: 42,
      message: expect.stringContaining('static resolver'), fix: expect.stringContaining('fence'),
    })] })
    expect(result).not.toHaveProperty('markdown')
  })

  it.each(['`', '~'])('checks generated opening and closing boundaries across common and changed %s fences', marker => {
    for (const width of [4, 5, 7]) {
      const long = marker.repeat(width), short = marker.repeat(3)
      const shared = `${long}md\n${short}js\n${long}\n`
      const code = `${short}js\nnext_secret()\n${short}\n`
      const changed = `${long}md\n${short}js\nold()\n${long}\n`
      for (const [a, b, line] of [
        [shared + '\nOld\n', shared + '\n' + code, 42],
        [shared, shared + '\n' + code, 42],
        [shared + '\n' + code, shared + '\nNew\n', 42],
        [changed, code, 43],
      ] as const) {
        const result = mergeMarkdown({ current: input(a, 'current'), next: input(b, 'next') })
        expect(result).toMatchObject({ errors: expect.arrayContaining([expect.objectContaining({
          code: 'ADAPT_UNSUPPORTED_MARKUP', file: 'current-content.md', channel: 'current', line,
          message: expect.stringContaining('static resolver'),
        })]) })
        expect(result).not.toHaveProperty('markdown')
      }
    }
  })

  it('maps the offending marker through original fragment origins rather than generated output lines', () => {
    const source = input(current, 'current')
    source.origins = source.origins!.map((origins, index) => index === 2
      ? [{ channel: 'current', file: 'fragments/example.md', line: 117 }] : origins)
    const result = mergeMarkdown({ current: source, next: input(next, 'next'), context: { page: 'example' } })
    expect(result).toMatchObject({ errors: [expect.objectContaining({
      code: 'ADAPT_UNSUPPORTED_MARKUP', file: 'fragments/example.md', line: 117, channel: 'current', page: 'example',
    })] })
    expect(result).not.toHaveProperty('markdown')
  })

  it.each(['`', '~'])('locates a changed next %s fence that hides its generated closing boundary before a common fence', marker => {
    const short = marker.repeat(3), long = marker.repeat(4)
    const shared = `${short}js\nshared()\n${short}\n`
    const result = mergeMarkdown({ current: input('Old\n\n' + shared, 'current'),
      next: input(`${long}md\n${short}js\nnext_secret()\n${long}\n\n${shared}`, 'next') })
    expect(result).toMatchObject({ errors: [expect.objectContaining({
      code: 'ADAPT_UNSUPPORTED_MARKUP', file: 'next-content.md', channel: 'next', line: 43,
    })] })
    expect(result).not.toHaveProperty('markdown')
  })

  it.each(['\r\n', '\r'])('keeps original source line attribution with %j separators', newline => {
    const result = mergeMarkdown({ current: input(current.replaceAll('\n', newline), 'current'),
      next: input(next.replaceAll('\n', newline), 'next') })
    expect(result).toMatchObject({ errors: [expect.objectContaining({
      code: 'ADAPT_UNSUPPORTED_MARKUP', file: 'current-content.md', channel: 'current', line: 42,
    })] })
    expect(result).not.toHaveProperty('markdown')
  })

  it.each(['`', '~'])('preserves ordinary and long %s fences when every generated boundary is visible', async marker => {
    for (const width of [3, 4, 5, 6, 7]) {
      const fence = marker.repeat(width)
      const shared = `${fence}js\nshared()\n${fence}\n`
      const a = shared + `\n${fence}js\nold()\n${fence}\n`
      const b = shared + `\n${fence}js\nnext_secret()\n${fence}\n`
      const result = mergeMarkdown({ current: input(a, 'current'), next: input(b, 'next') })
      if ('errors' in result) throw new Error(JSON.stringify(result.errors))
      assertViews(result, input(a, 'current'), input(b, 'next'))
      const final = await finalize(result.markdown)
      expect(final).toBe(result.markdown)
      expect(currentView(final)).not.toContain('next_secret()')
    }
  })

  it('preserves the exact equal-input fast path for the unsupported fence segmentation', () => {
    const result = mergeMarkdown({ current: input(current, 'current'), next: input(current, 'next') })
    expect(result).toMatchObject({ markdown: current, unchanged: true, generatedRegions: [], notes: [] })
  })

  it.each(['next', 'retire-in-next'] as const)('keeps %s whole-page selection without introducing generated boundaries', releaseChannel => {
    const result = mergeMarkdown({ current: input(current, 'current'), next: input(next, 'next'), releaseChannel })
    expect(result).toMatchObject({ markdown: releaseChannel === 'next' ? next : current, generatedRegions: [] })
    if ('errors' in result) throw new Error(JSON.stringify(result.errors))
    expect(result.origins.flat().every(origin => origin.channel === (releaseChannel === 'next' ? 'next' : 'current'))).toBe(true)
  })
})
