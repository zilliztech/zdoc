import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readSharedDocs } from '../commands/build'
import { groupFile } from './group-context'
import { parseSourceConfig } from '../core/config'
import { collectReferences } from '../core/links'
import { inventoryBlocks, originalPageLine } from '../core/blocks'
import { immutable, imageIdentity } from '../core/updates/types'
import type { DependencyObservation, FixedVersions, ImageObservation, InputFile, PageObservation, UpdateInput } from '../core/updates/types'
import { observeManualAnchors } from '../core/updates/anchors'
import type { InspectionReader, Md2md } from './types'
import type { BuildPageObservation, BuildPageResult, SharedDocsInputs } from './build-page'
import type { SharedDocsError, Variables } from '../core/types'

const digest = (text: string) => createHash('sha256').update(text).digest('hex')
const comparable = (value: unknown) => JSON.stringify(value, (_, child) => child instanceof Map ? [...child] : child)
const fileInput = (file: string, text: string): InputFile => ({ file, text, sha256: digest(text) })
function variableDependency(key: string, variables: Variables): DependencyObservation {
  let value: unknown = variables
  for (const part of key.split('.')) {
    const actual = value && typeof value === 'object' ? Object.keys(value).find(candidate => candidate.toLowerCase() === part.toLowerCase()) : undefined
    value = actual === undefined ? undefined : (value as Record<string, unknown>)[actual]
  }
  return { kind: 'variable', identity: key.toLowerCase(), state: value === undefined ? 'unresolved' : 'resolved',
    sha256: value === undefined ? null : digest(JSON.stringify(value)) }
}
export interface UpdateConfiguration {
  readonly sharedDocs: SharedDocsInputs
  /** Exact local bytes, including all configuration and referenced content files. */
  readonly files: readonly InputFile[]
}

/** Existing configuration parser plus byte evidence. A concurrent local edit fails collection. */
export async function readUpdateConfiguration(directory: string, repositoryRoot = process.cwd()): Promise<UpdateConfiguration | { errors: SharedDocsError[] }> {
  const shared = await readSharedDocs(directory, repositoryRoot)
  if ('errors' in shared) return shared
  const paths = ['source.yaml', 'Variables.json', 'links.yaml', 'product-names.yaml', 'presentation/cloud-sdk-tabs.yaml']
  for (const [pageId, page] of shared.pages) {
    paths.push(`pages/${pageId}/page.yaml`)
    if (page.lockYaml !== undefined) paths.push(`pages/${pageId}/lock.yaml`)
    for (const name of page.contentFiles?.keys() ?? []) paths.push(`pages/${pageId}/${name}`)
  }
  const files: InputFile[] = []
  for (const path of paths.sort()) files.push(fileInput(groupFile(shared.sharedDocsPath, path), await readFile(join(directory, path), 'utf8')))
  const again = await readSharedDocs(directory, repositoryRoot)
  if ('errors' in again) throw new Error('Shared configuration changed during collection')
  const expected = new Map<string, string>([
    ['source.yaml', shared.sourceYaml], ['Variables.json', shared.variablesJson],
    ...[...shared.pages].flatMap(([id, page]) => [[`pages/${id}/page.yaml`, page.pageYaml],
      ...(page.lockYaml === undefined ? [] : [[`pages/${id}/lock.yaml`, page.lockYaml]]),
      ...[...(page.contentFiles ?? new Map())].map(([name, content]) => [`pages/${id}/${name}`, content.text])] as [string, string][]),
  ])
  for (const [path, text] of expected) if (files.find(file => file.file === groupFile(shared.sharedDocsPath, path))?.text !== text) throw new Error('Shared configuration changed during collection')
  if (comparable(shared) !== comparable(again)) throw new Error('Shared configuration changed during collection')
  for (const path of paths) if (await readFile(join(directory, path), 'utf8') !== files.find(file => file.file === groupFile(shared.sharedDocsPath, path))!.text) throw new Error('Shared configuration changed during collection')
  return { sharedDocs: structuredClone(shared), files: immutable(files) }
}

export interface FixedObservationRequest { readonly commit: string; readonly configuration: UpdateConfiguration }
export interface UpdatePageRequest {
  readonly pageId: string
  readonly oldNext: FixedObservationRequest; readonly current: FixedObservationRequest; readonly candidateNext: FixedObservationRequest
}
export interface CollectUpdateInput {
  readonly versions: FixedVersions
  readonly pages: readonly UpdatePageRequest[]
  readonly reader: InspectionReader; readonly md2md: Md2md
  /** Caller owns runtime, local dev inputs, image policy and reader lifetime. */
  readonly build?: (input: { pageId: string; sharedDocs: SharedDocsInputs; observe: (observation: BuildPageObservation) => void }) => Promise<BuildPageResult>
}

/** No branch-head lookup, lock writes, lifecycle reads or rendered-view reconstruction. */
export async function collectUpdateInputs(input: CollectUpdateInput): Promise<UpdateInput> {
  const versions = structuredClone(input.versions)
  const requests = structuredClone(input.pages)
  const pages: UpdateInput['pages'][number][] = []
  for (const page of requests) {
    const observe = async (request: FixedObservationRequest, role: 'oldNext' | 'current' | 'candidateNext'): Promise<PageObservation> => {
      const { commit, configuration } = request
      if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`Invalid ${role} source commit`)
      const { sharedDocs: shared } = configuration
      if (new Set(configuration.files.map(file => file.file)).size !== configuration.files.length
        || configuration.files.some(file => digest(file.text) !== file.sha256)) throw new Error('Invalid or duplicate local configuration byte evidence')
      const pageInput = shared.pages.get(page.pageId)
      if (!pageInput) throw new Error(`Unknown shared page: ${page.pageId}`)
      const sourceConfig = parseSourceConfig(shared.sourceYaml)
      if ('errors' in sourceConfig) throw new Error('Expected validated source configuration')
      for (const [file, text] of [[groupFile(shared.sharedDocsPath, 'source.yaml'), shared.sourceYaml],
        [groupFile(shared.sharedDocsPath, 'Variables.json'), shared.variablesJson],
        [groupFile(shared.sharedDocsPath, `pages/${page.pageId}/page.yaml`), pageInput.pageYaml]] as const) {
        if (!configuration.files.some(input => input.file === file && input.text === text)) throw new Error(`Missing exact local input: ${file}`)
      }
      const sourceFile = pageInput.config.source.file
      const errors: SharedDocsError[] = [], rawErrors: SharedDocsError[] = []
      let source: InputFile | null = null
      try { source = fileInput(sourceFile, await input.reader.readFile(commit, sourceFile)) }
      catch (error) {
        if ((error as { code?: string }).code !== 'MISSING_FILE') throw error
        errors.push({ code: 'CONFIG_SOURCE_NOT_FOUND', file: sourceFile, page: page.pageId, channel: role === 'current' ? 'current' : 'next',
          message: `Source file not found at ${commit}: ${sourceFile}` })
      }
      const files: InputFile[] = source ? [source] : []
      const dependencies: PageObservation['dependencies'][number][] = []
      let blocks: PageObservation['blocks'] = []
      let engine: PageObservation['engine'] = null
      const buildLock = input.build ? { current: page.current.commit, next: role === 'current' ? page.candidateNext.commit : commit } : null
      if (source) {
        const parsed = input.md2md.parseBlocks(source.text, { sourceName: sourceFile })
        rawErrors.push(...parsed.errors.map(error => ({ ...error, page: page.pageId })))
        if (parsed.ok) blocks = inventoryBlocks(source.text, parsed)
        // Raw dependencies survive Cloud replacements. The normal builder still owns generation.
        await input.reader.withFragments(commit, async snapshot => {
          const raw = input.md2md.preprocess({ content: input.md2md.stripBlockMarkers(source!.text), fragmentRoot: snapshot.root,
            variables: shared.variables, sourceName: sourceFile })
          engine = { ...raw.engine }
          rawErrors.push(...raw.errors.map(error => ({ ...error, page: page.pageId, channel: role === 'current' ? 'current' as const : 'next' as const,
            ...(error.file && snapshot.files.has(error.file) ? { file: `site/en/${error.file}` } : {}),
            ...(error.file === sourceFile && error.line ? { line: originalPageLine(error.line, parsed.blocks) } : {}) })))
          for (const dependency of raw.dependencies.fragments) {
            const text = snapshot.files.get(dependency.path)
            if (text === undefined) throw new Error(`Unknown raw fragment dependency: ${dependency.path}`)
            const file = fileInput(`site/en/${dependency.path}`, text)
            files.push(file)
            dependencies.push({ kind: 'fragment', identity: file.file, state: 'resolved', sha256: file.sha256 })
          }
          for (const variable of raw.dependencies.variables) dependencies.push(variableDependency(variable.key, shared.variables))
          // Raw preprocessing may intentionally be removed by a transform. Its diagnostics
          // are not generation failures; builder observations below authenticate those.
        })
      }
      for (const content of pageInput.contentFiles?.values() ?? []) files.push(fileInput(content.file, content.text))
      let outputStatus: PageObservation['outputStatus'] = source && !errors.length ? 'unobserved' : 'error'
      let manuals: PageObservation['manuals'] = []
      let images: ImageObservation[] = [], imageStatus: PageObservation['imageStatus'] = 'unavailable'
      if (input.build) {
        const pages = new Map(shared.pages)
        pages.set(page.pageId, { ...pageInput, lockYaml: JSON.stringify({ schema_version: 1, ...buildLock }) })
        let observation: BuildPageObservation | undefined
        const result = await input.build({ pageId: page.pageId, sharedDocs: { ...shared, pages }, observe: value => { observation = structuredClone(value) } })
        if (!observation) throw new Error('Build callback did not provide actual channel observations')
        if (observation.pageId !== page.pageId) throw new Error('Build observation page identity mismatch')
        if ('errors' in result) { errors.push(...result.errors); outputStatus = 'error' }
        else {
          const channel = role === 'current' ? 'current' : 'next'
          const views = observation.channels.filter(view => view.channel === channel)
          if (views.length !== pageInput.config.publish.length || pageInput.config.publish.some(target => !views.some(view => view.manual === target.manual && view.path === target.path && view.commit === commit))) throw new Error('Incomplete build observation identity')
          for (const view of views) errors.push(...view.errors)
          await input.reader.withFragments(commit, async snapshot => {
            for (const view of views) {
              for (const dependency of view.dependencies.fragments) {
                const text = snapshot.files.get(dependency.path)
                if (text === undefined) throw new Error(`Unknown generated fragment dependency: ${dependency.path}`)
                const file = fileInput(`site/en/${dependency.path}`, text)
                if (!files.some(existing => existing.file === file.file)) files.push(file)
                dependencies.push({ kind: 'fragment', identity: file.file, state: 'resolved', sha256: file.sha256 })
              }
              for (const variable of view.dependencies.variables) dependencies.push(variableDependency(variable.key, shared.variables))
            }
          })
          const imageMap = new Map<string, ImageObservation>()
          imageStatus = views.every(view => view.imageStatus === 'observed') ? 'observed' : 'unavailable'
          for (const view of views) for (const image of view.images) {
            const uses = image.uses.map(use => {
              const candidates = use.origins.flatMap(origin => {
                const file = files.find(file => file.file === origin.file)
                if (!file || !origin.line) return []
                const matching = collectReferences(file.text).images.filter(reference => reference.line === origin.line && reference.url === image.original)
                if (matching.length !== 1) return []
                const reference = matching[0]
                return [{ file: file.file, start: reference.start, end: reference.end, line: reference.line,
                  endLine: file.text.slice(0, Math.max(reference.start, reference.end - 1)).split(/\r\n|\r|\n/).length + 1 }]
              })
              const sources = [...new Map(candidates.map(source => [JSON.stringify(source), source])).values()]
              return { ...use, ...(sources.length === 1 ? { source: sources[0] } : {}) }
            })
            const key = imageIdentity(image), previous = imageMap.get(key)
            if (previous && (JSON.stringify(previous.observed) !== JSON.stringify(image.observed) || JSON.stringify(previous.emitted) !== JSON.stringify(image.emitted))) throw new Error('Conflicting image evidence for one fixed dependency')
            imageMap.set(key, { ...image, uses: [...(previous?.uses ?? []), ...uses] })
          }
          images = [...imageMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, image]) => image)
          manuals = views.map(view => observeManualAnchors({ ...view, output: view.mdx, files, blocks, sourceFile }))
          outputStatus = errors.length || views.some(view => view.mdx === undefined) ? 'error' : 'observed'
          if (outputStatus === 'error' && !errors.length) throw new Error('Channel finalization returned no output or diagnostics')
        }
      }
      return { commit, buildLock, engine, repository: sourceConfig.config.repository, track: sourceConfig.config.track, sourceFile, source, files,
        localInputs: configuration.files.map(({ file, sha256 }) => ({ file, sha256 })), blocks,
        dependencies: [...new Map(dependencies.map(dependency => [JSON.stringify([dependency.kind, dependency.identity]), dependency])).values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.identity.localeCompare(b.identity)),
        targets: pageInput.config.publish.map(target => ({ ...target })), manuals, rawErrors, images, imageStatus, errors, outputStatus, hasChannelRules: !!pageInput.config.transforms?.some(transform => transform.channel !== undefined) }
    }
    pages.push({ pageId: page.pageId, oldNext: await observe(page.oldNext, 'oldNext'), current: await observe(page.current, 'current'), candidateNext: await observe(page.candidateNext, 'candidateNext') })
  }
  return immutable({ schema_version: 1 as const, versions, pages })
}
