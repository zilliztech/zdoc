import { groupFile } from './group-context'
import { parsePageConfig, parseSourceConfig } from '../core/config'
import { inventoryBlocks, originalPageLine } from '../core/blocks'
import { parseLock, planLock } from '../core/lock'
import { parseVariables } from '../core/variables'
import type { Channel, NamedBlockInventory, SharedDocsError } from '../core/types'
import { readPageSources } from './read-page'
import type { ReadPageInput, ReadPageResult } from './read-page'
import type { InspectionReader, Md2md, PreprocessResult } from './types'
import { applyPlan, planTransforms, stripMappedMarkers, filterContent } from '../core/transforms'
import type { ContentFile, MappedLine, TransformPlan } from '../core/transforms'
import { provenanceCarrier, remapError, survivingSources } from '../core/transforms/provenance'
import type { TabsRules } from '../core/site'
import type { ProductNameSource } from '../core/product-names'

type ReadSuccess = Exclude<ReadPageResult, { errors: SharedDocsError[] }>
export interface InspectedChannel {
  commit: string
  blocks: NamedBlockInventory[]
  content: string
  dependencies: PreprocessResult['dependencies']
  engine: PreprocessResult['engine']
  provenance?: MappedLine[]
  transformSources?: ProductNameSource[]
}
export type InspectionResult = Omit<ReadSuccess, 'markdown'> & {
  planned: boolean
  channels: Record<Channel, InspectedChannel>
  manualChannels?: ReadonlyMap<string, Record<Channel, InspectedChannel>>
} | { errors: SharedDocsError[] }

/** No writes to the page or source repository; temporary snapshots belong to the reader. */
export async function inspectPage(input: ReadPageInput & { variablesJson: string; transformContext?: {
  contentFiles: ReadonlyMap<string, ContentFile>; tabsRules: TabsRules
  manuals: readonly { name: string; availableChannels: readonly Channel[] }[]
} }, reader: InspectionReader, md2md: Md2md): Promise<InspectionResult> {
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
  const manualChannels = new Map<string, Record<Channel, InspectedChannel>>()
  for (const manual of input.transformContext?.manuals ?? []) manualChannels.set(manual.name, {} as Record<Channel, InspectedChannel>)
  const prepared = new Map<Channel, { parsed: ReturnType<Md2md['parseBlocks']>; blocks: NamedBlockInventory[]; plan?: TransformPlan }>()
  // Both channels are validated before applying any edit or preprocessing a page.
  for (const channel of ['current', 'next'] as const) {
    const sourceName = read.config.source.file
    const markdown = read.markdown[channel]
    const parsed = md2md.parseBlocks(markdown, { sourceName })
    const annotate = (error: SharedDocsError): SharedDocsError => ({ ...error, page: input.pageId, channel })
    if (!parsed.ok) { errors.push(...parsed.errors.map(annotate)); continue }
    const blocks = inventoryBlocks(markdown, parsed)
    let plan: TransformPlan | undefined
    if (input.transformContext && read.config.transforms?.length) {
      const reported = new Map<string, number>()
      for (const manual of input.transformContext.manuals) {
        const result = planTransforms({ contentFiles: input.transformContext.contentFiles, tabsRules: input.transformContext.tabsRules,
          availableChannels: manual.availableChannels, markdown, blocks, transforms: read.config.transforms,
          channel, page: input.pageId, pageYaml: input.pageYaml, configFile: pageFile, sourceFile: sourceName })
        if ('errors' in result) {
          // Preserve repeated failures from distinct rules, while collapsing only
          // the same occurrence repeated by another manual's availability check.
          const occurrences = new Map<string, number>()
          for (const error of result.errors) {
            const identity = JSON.stringify(error), count = (occurrences.get(identity) ?? 0) + 1
            occurrences.set(identity, count)
            if (count > (reported.get(identity) ?? 0)) { errors.push(error); reported.set(identity, count) }
          }
        }
        else plan ??= result
      }
      if (!plan) continue
    }
    prepared.set(channel, { parsed, blocks, plan })
  }
  if (errors.length && input.transformContext) return { errors }
  for (const channel of ['current', 'next'] as const) {
    const ready = prepared.get(channel)
    if (!ready) continue
    const { parsed, blocks, plan } = ready
    const sourceName = read.config.source.file
    const annotate = (error: SharedDocsError): SharedDocsError => ({ ...error, page: input.pageId, channel })
    const mapped = plan ? stripMappedMarkers(applyPlan(read.markdown[channel], sourceName, plan), parsed.blocks) : undefined
    const content = mapped ? mapped.map(line => line.text).join('\n') : md2md.stripBlockMarkers(read.markdown[channel])
    await reader.withFragments(read.lock[channel], async snapshot => {
      const annotateSnapshotError = (error: SharedDocsError): SharedDocsError => annotate({ ...error,
        ...(error.file && snapshot.files.has(error.file) ? { file: `site/en/${error.file}` } : {}),
        ...(error.file === sourceName && error.line ? mapped ? remapError(error, mapped, sourceName) : { line: originalPageLine(error.line, parsed.blocks) } : {}),
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
      if (result.ok) {
        const output = result.content
        if (mapped?.length) {
          // The unannotated whole-page call above owns validation, dependencies and limits.
          // A second public-engine call transports origin boundaries without duplicating
          // expansion logic. Expanded fragment lines retain their inclusion-site origin;
          // exact fragment locations await an md2md output source map.
          const carrier = provenanceCarrier(mapped, [content, JSON.stringify(variables.variables), ...snapshot.files.values()])
          const tagged = md2md.preprocess({ content: carrier.content, fragmentRoot: snapshot.root, variables: variables.variables, sourceName,
            limits: { maxOutputBytes: 2 * 1024 * 1024 + carrier.overhead } })
          if (!tagged.ok) throw new Error('md2md could not preserve transform origin boundaries')
          const expanded = carrier.decode(tagged.content)
          if (expanded.map(line => line.text).join('\n') !== output) throw new Error('md2md transform provenance changed output bytes')
          for (const manual of input.transformContext!.manuals) {
            const filtered = filterContent(expanded, manual.name === 'guides-byoc' ? 'zilliz.paas' : 'zilliz.saas')
            if ('errors' in filtered) { errors.push(...filtered.errors.map(annotate)); continue }
            const view = filtered.lines
            manualChannels.get(manual.name)![channel] = { commit: read.lock[channel], blocks,
              content: view.map(line => line.text).join('\n'), dependencies: result.dependencies, engine: result.engine,
              provenance: view, transformSources: survivingSources(mapped, view) }
          }
        }
        channels[channel] = { commit: read.lock[channel], blocks, content: output, dependencies: result.dependencies, engine: result.engine }
      }
    })
  }
  if (errors.length) return { errors }
  return { config: read.config, source: read.source, lock: read.lock, planned: input.lockYaml === undefined, channels,
    ...(manualChannels.size ? { manualChannels } : {}) }
}
