// @vitest-environment node
import { readFileSync } from 'node:fs'
import { RealMd2md } from '../../adapters/md2md'
import { inventoryBlocks } from '../../core/blocks'
import { parsePageConfig } from '../../core/config'
import { parseTabsRules } from '../../core/site'
import { applyPlan, planTransforms, stripMappedMarkers } from '../../core/transforms'
import type { Transform } from '../../core/types'

const md2md = new RealMd2md()
const parsedRules = parseTabsRules(readFileSync(new URL('../../fixtures/site/cloud-sdk-tabs.yaml', import.meta.url), 'utf8'), {})
if ('errors' in parsedRules) throw new Error('Invalid test rules')
export const rules = parsedRules.rules
export const block = (body: string, id = 'example') => `<!-- doc:block:start id="${id}" -->\n${body}\n<!-- doc:block:end id="${id}" -->`
export const group = (...fences: string[]) => `<div class="multipleCode">stale labels</div>\n\n${fences.join('\n\n')}`
export const fence = (language: string, body = 'value = 1') => '```' + language + '\n' + body + '\n```'
export function execute(markdown: string, transforms: Transform[], files: Record<string, string> = {}, channel: 'current' | 'next' = 'current', yaml?: string) {
  const pageYaml = yaml ?? JSON.stringify({ schema_version: 1, source: { file: 'site/en/page.md' }, publish: [{ manual: 'guides', path: 'tutorials/example' }], transforms }, null, 2)
  const config = parsePageConfig('example', pageYaml, { file: 'page.yaml', channel: 'both', manuals: ['guides'], betaValues: [] })
  if ('errors' in config) return config
  const parsed = md2md.parseBlocks(markdown, { sourceName: 'site/en/page.md' })
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors))
  const plan = planTransforms({ markdown, blocks: inventoryBlocks(markdown, parsed), transforms: config.config.transforms ?? [],
    contentFiles: new Map(Object.entries(files).map(([name, text]) => [name, { file: `pages/example/${name}`, text }])),
    tabsRules: rules, pageYaml, configFile: 'page.yaml', sourceFile: 'site/en/page.md', page: 'example', channel })
  if ('errors' in plan) return plan
  const lines = stripMappedMarkers(applyPlan(markdown, 'site/en/page.md', plan), parsed.blocks)
  return { lines, text: lines.map(line => line.text).join('\n') }
}
