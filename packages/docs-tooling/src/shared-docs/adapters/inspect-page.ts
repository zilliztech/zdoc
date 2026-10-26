import { groupFile } from './group-context'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { inventoryBlocks, originalPageLine } from '../core/blocks'
import { parseLock, planLock } from '../core/lock'
import { parseVariables } from '../core/variables'
import type { Channel, NamedBlockInventory, SharedDocsError } from '../core/types'
import { readPageSources } from './read-page'
import type { ReadPageInput, ReadPageResult } from './read-page'
import type { InspectionReader, Md2md, PreprocessResult } from './types'

type ReadSuccess = Exclude<ReadPageResult, { errors: SharedDocsError[] }>
export interface InspectedChannel {
  commit: string
  blocks: NamedBlockInventory[]
  content: string
  dependencies: PreprocessResult['dependencies']
  engine: PreprocessResult['engine']
}
export type InspectionResult = Omit<ReadSuccess, 'markdown'> & {
  planned: boolean
  channels: Record<Channel, InspectedChannel>
} | { errors: SharedDocsError[] }

/** No writes to the page or source repository; temporary snapshots belong to the reader. */
export async function inspectPage(input: ReadPageInput & { variablesJson: string }, reader: InspectionReader, md2md: Md2md): Promise<InspectionResult> {
  const context = { page: input.pageId, channel: 'both' as const }
  const pageFile = input.context.file ?? groupFile(input.sharedDocsPath, `pages/${input.pageId}/page.yaml`)
  const source = parseSourceConfig(input.sourceYaml, { ...context, file: input.sourceName ?? groupFile(input.sharedDocsPath, 'source.yaml') })
  const page = parsePageConfig(input.pageId, input.pageYaml, { ...input.context, file: pageFile })
  const variables = parseVariables(input.variablesJson, { ...context, file: groupFile(input.sharedDocsPath, 'Variables.json') })
  const lockContext = { ...context, file: pageFile.replace(/[^/]*$/, 'lock.yaml') }
  const existing = input.lockYaml === undefined ? undefined : parseLock(input.lockYaml, lockContext)
  const errors: SharedDocsError[] = []
  for (const result of [source, page, variables, existing]) if (result && 'errors' in result) errors.push(...result.errors)
  if ('errors' in source || 'errors' in page || 'errors' in variables || (existing && 'errors' in existing)) return { errors }
  let lockYaml = input.lockYaml
  if (lockYaml === undefined) {
    const planned = planLock({ trackedHead: await reader.trackedHead(source.config.track), fromFork: false }, lockContext)
    if ('errors' in planned) return planned
    lockYaml = JSON.stringify(planned.lock)
  }
  const read = await readPageSources({ ...input, lockYaml }, reader)
  if ('errors' in read) return read
  const channels = {} as Record<Channel, InspectedChannel>
  for (const channel of ['current', 'next'] as const) {
    const sourceName = read.config.source.file
    const markdown = read.markdown[channel]
    const parsed = md2md.parseBlocks(markdown, { sourceName })
    const annotate = (error: SharedDocsError): SharedDocsError => ({ ...error, page: input.pageId, channel })
    if (!parsed.ok) { errors.push(...parsed.errors.map(annotate)); continue }
    const blocks = inventoryBlocks(markdown, parsed)
    const content = md2md.stripBlockMarkers(markdown)
    await reader.withFragments(read.lock[channel], async snapshot => {
      const annotateSnapshotError = (error: SharedDocsError): SharedDocsError => annotate({ ...error,
        ...(error.file && snapshot.files.has(error.file) ? { file: `site/en/${error.file}` } : {}),
        ...(error.file === sourceName && error.line ? { line: originalPageLine(error.line, parsed.blocks) } : {}),
      })
      const result = md2md.preprocess({ content, fragmentRoot: snapshot.root, variables: variables.variables, sourceName })
      errors.push(...result.errors.map(annotateSnapshotError))
      // Validate every successfully read dependency before any content can be returned.
      // Unreferenced fragments do not affect this page; md2md owns traversal and limits.
      for (const dependency of result.dependencies.fragments) {
        const fragment = snapshot.files.get(dependency.path)
        if (fragment === undefined) throw new Error(`Preprocessor returned an unknown fragment: ${dependency.path}`)
        const checked = md2md.parseBlocks(fragment, { sourceName: dependency.path, isFragment: true })
        errors.push(...checked.errors.map(annotateSnapshotError))
      }
      if (result.ok) channels[channel] = { commit: read.lock[channel], blocks, content: result.content,
        dependencies: result.dependencies, engine: result.engine }
    })
  }
  if (errors.length) return { errors }
  return { config: read.config, source: read.source, lock: read.lock, planned: input.lockYaml === undefined, channels }
}
