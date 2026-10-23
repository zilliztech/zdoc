import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { manualRegistry } from '../../manuals/registry'
import { DOC_HEADING_TAGS } from '../../../../docs-ui/src/shared/utils/docHeadingTags'
import { GitMilvusDocsReader } from '../adapters/git-milvus-docs-reader'
import { inspectPage } from '../adapters/inspect-page'
import type { InspectionResult } from '../adapters/inspect-page'
import { RealMd2md } from '../adapters/md2md'
import type { SharedDocsError } from '../core/types'

export const inspectionContext = {
  manuals: manualRegistry.map(manual => manual.id),
  betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC'),
}

export function formatInspection(page: string, result: InspectionResult): string {
  if ('errors' in result) return [`Validation failed: ${page}`, ...result.errors.map(error =>
    `${error.file ?? '<input>'}${error.line ? `:${error.line}` : ''} [${error.page ?? page}/${error.channel ?? 'both'}] ${error.code}: ${error.message}`)].join('\n') + '\n'
  const output = [`Page: ${page}`, 'Configuration: valid', `Lock: ${result.planned ? 'planned (no lock.yaml)' : 'valid'}`,
    `Source: ${result.source.repository} (${result.source.track}) ${result.config.source.file}`,
    ...result.config.publish.map(target => `Publish: ${target.manual}/${target.path}`)]
  for (const channel of ['current', 'next'] as const) {
    const value = result.channels[channel]
    output.push(`\n${channel}: ${value.commit}${result.planned ? ' — planned (no lock.yaml)' : ''}`,
      `Named blocks: ${JSON.stringify(value.blocks, null, 2)}`,
      `Engine: ${value.engine.name}@${value.engine.version}`,
      `Dependencies: ${JSON.stringify(value.dependencies, null, 2)}`,
      `--- ${channel} expanded Markdown ---`, value.content, `--- end ${channel} ---`)
  }
  return output.join('\n') + '\n'
}

export async function runInspect(options: { pages: string; page: string; repo: string }, write: (text: string) => void): Promise<number> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.page)) {
    write(formatInspection(options.page, { errors: [{ code: 'CONFIG_PAGE_ID_INVALID',
      message: 'Page ID must contain lowercase letters, numbers, and hyphens', page: options.page,
      file: 'shared-docs/pages', line: 1 }] }))
    return 1
  }
  const pages = resolve(options.pages)
  const root = dirname(pages)
  const errors: SharedDocsError[] = []
  async function read(path: string, file: string, optional = false): Promise<string | undefined> {
    try { return await readFile(path, 'utf8') }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      if (!optional) errors.push({ code: 'CONFIG_FIELD_MISSING', message: `Required file not found: ${file}`,
        file, line: 1, page: options.page, channel: 'both' })
      return undefined
    }
  }
  const pageFile = `shared-docs/pages/${options.page}/page.yaml`
  const [sourceYaml, pageYaml, lockYaml, variablesJson] = await Promise.all([
    read(join(root, 'source.yaml'), 'shared-docs/source.yaml'),
    read(join(pages, options.page, 'page.yaml'), pageFile),
    read(join(pages, options.page, 'lock.yaml'), `shared-docs/pages/${options.page}/lock.yaml`, true),
    read(join(root, 'Variables.json'), 'shared-docs/Variables.json'),
  ])
  const result = errors.length ? { errors } : await inspectPage({ pageId: options.page, sourceYaml: sourceYaml!,
    pageYaml: pageYaml!, lockYaml, variablesJson: variablesJson!, context: { ...inspectionContext, file: pageFile } },
  new GitMilvusDocsReader(resolve(options.repo)), new RealMd2md())
  write(formatInspection(options.page, result))
  return 'errors' in result ? 1 : 0
}
