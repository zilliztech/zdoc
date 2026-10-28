// @vitest-environment node
import { createRequire } from 'node:module'
import { expect, it } from 'vitest'
import { filterContent } from '../../core/transforms'
const require = createRequire(import.meta.url)
const Writer = require('../../../lark/larkDocWriter.js')
const writer = Object.create(Writer.prototype)
const mapped = (text: string) => text.split('\n').map((text, index) => ({ text, origin: { kind: 'content-file' as const, file: 'cloud.md', line: index + 1 } }))

it('matches legacy Markdown filtering for token targets and nested regions', () => {
  const text = '<include target="zilliz">\nShared\n<include target="paas">\nBYOC\n</include>\n<exclude target="paas">\nSaaS\n</exclude>\n</include>'
  for (const target of ['zilliz.saas', 'zilliz.paas']) {
    const result = filterContent(mapped(text), target)
    if ('errors' in result) throw new Error(JSON.stringify(result))
    expect(result.lines.map(line => line.text).filter(Boolean)).toEqual(writer.__filter_content(text, target).split('\n').filter((line: string) => line.trim()))
  }
})

it('keeps an excluded outer region excluded after a kept inner region closes', () => {
  const result = filterContent(mapped('<include target="paas">\n<include target="zilliz">\nHidden inner\n</include>\nHidden outer\n</include>\nVisible'), 'zilliz.saas')
  expect(result).toEqual({ lines: [mapped('Visible').map(line => ({ ...line, origin: { ...line.origin, line: 7 } }))[0]] })
})

it('rejects dotted targets, malformed standalone tags and mismatched nesting at original lines', () => {
  for (const text of ['<include target="zilliz.paas">\nHidden\n</include>', '<include target=paas>', '</exclude>']) {
    expect(filterContent(mapped('Text\n' + text), 'zilliz.paas')).toMatchObject({ errors: expect.arrayContaining([expect.objectContaining({ code: 'TRANSFORM_CONTENT_MARKUP', file: 'cloud.md', line: 2 })]) })
  }
})
