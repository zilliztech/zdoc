import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { toMdx } from '../../adapters/mdx'
import { adaptPage, parseTabsRules } from '../../core/site'
import { inspectionContext } from '../../commands/inspect'
import { headingStub, inspectPilot, preparePilot } from './helpers'

/** The caller provides an empty temporary directory and owns its cleanup. */
export async function createSiteDemo(root: string) {
  await preparePilot(root, 'delete-entities')
  await mkdir(join(root, 'presentation'))
  await copyFile(new URL('../../fixtures/site/cloud-sdk-tabs.yaml', import.meta.url), join(root, 'presentation/cloud-sdk-tabs.yaml'))
}

export async function runSiteDemo(root: string): Promise<number> {
  const pageId = 'delete-entities'
  const context = { file: 'presentation/cloud-sdk-tabs.yaml', page: pageId, channel: 'current' as const }
  const parsed = parseTabsRules(await readFile(join(root, context.file), 'utf8'), context)
  if ('errors' in parsed) { console.error(JSON.stringify(parsed.errors, null, 2)); return 1 }
  const inspected = await inspectPilot(root, pageId)
  context.file = inspected.config.source.file
  const adapted = adaptPage({ markdown: inspected.channels.current.content, pageId, manual: 'guides',
    metadata: inspected.config.metadata, tabsRules: parsed.rules, betaValues: inspectionContext.betaValues,
    headingAnchor: headingStub, navigation: { sidebar_label: 'Delete', sidebar_position: 4 }, context })
  if ('errors' in adapted) { console.error(JSON.stringify(adapted.errors, null, 2)); return 1 }
  const result = await toMdx(adapted, context)
  if ('errors' in result) { console.error(JSON.stringify(result.errors, null, 2)); return 1 }
  const path = join(root, 'delete-entities.mdx')
  await writeFile(path, result.mdx)
  console.log(result.mdx.slice(0, result.mdx.indexOf('\n---', 4) + 4))
  console.log(result.mdx.match(/^<Tabs .*$/m)?.[0])
  console.log(`Compiled MDX: ${path}`)
  return 0
}
