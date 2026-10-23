// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { it } from 'vitest'
import { toMdx } from '../../adapters/mdx'
import { parseTabsRules } from '../../core/site'
import { expectErrorCase, loadErrorCases } from '../errors'
import { adapt, context } from './helpers'

const cases = loadErrorCases(fileURLToPath(new URL('../../fixtures/site-errors/', import.meta.url)))
it.each(cases.map(fixture => [fixture.expected[0].code, fixture] as const))('[%s] runs its minimal diagnostic fixture', async (_code, fixture) => {
  await expectErrorCase(fixture, async directory => {
    const result = fixture.name === 'tabs-rules-invalid'
      ? parseTabsRules(readFileSync(join(directory, 'rules.yaml'), 'utf8'), { ...context, file: 'rules.yaml' })
      : adapt(readFileSync(join(directory, 'page.md'), 'utf8'))
    if ('errors' in result) return result.errors
    if (!('markdown' in result)) throw new Error('Invalid rules unexpectedly succeeded')
    const mdx = await toMdx(result, context)
    return 'errors' in mdx ? mdx.errors : []
  })
})
