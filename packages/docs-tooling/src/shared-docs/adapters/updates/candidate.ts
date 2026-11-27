import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { readSharedDocs } from '../../commands/build'
import { classifyLink, collectReferences } from '../../core/links'
import type { SharedDocsError } from '../../core/types'
import { groupFile } from '../group-context'
import { buildPage, createBuildReader, createBuildRuntime, createHistoricalPageBuilder } from '../build-page'
import { collectHistoricalUpdateObservation, collectUpdateInputs, readUpdateConfiguration, type CollectUpdateInput, type UpdateConfiguration } from '../update-inputs'
import { GitMilvusDocsReader } from '../git-milvus-docs-reader'
import { RealMd2md } from '../md2md'
import { HttpImageFetcher, type ImageFetcher } from '../images'
import { createGuidesSnapshot } from '../guides-snapshot'
import { createZdocContentReader } from '../zdoc-content'
import type { FixedVersions } from '../../core/updates/types'
import type { toMdx } from '../mdx'
import type { InspectionReader } from '../types'
import type { LinkInputReader } from '../links-input'
/** Report-only isolation over a private committed export. Production parsing/build contracts stay strict. */
export async function readReportConfiguration(directory: string, repositoryRoot: string, pageIds: readonly string[]) {
  const complete = await readUpdateConfiguration(directory, repositoryRoot)
  const pageErrors = new Map<string, SharedDocsError[]>()
  if (!('errors' in complete)) return { configuration: complete, pageErrors }
  const global = await readSharedDocs(directory, repositoryRoot, [])
  if ('errors' in global) return global
  const sharedDocsPath = global.sharedDocsPath
  const pages = new Map(global.pages)
  for (const pageId of pageIds) {
    const result = await readSharedDocs(directory, repositoryRoot, [pageId])
    if ('errors' in result) pageErrors.set(pageId, result.errors.map(error => ({ ...error, page: pageId })))
    else for (const [id, page] of result.pages) pages.set(id, page)
  }
  // Retain even invalid YAML/replacement bytes as fixed evidence, not just the surviving pages.
  const files: UpdateConfiguration['files'][number][] = []
  async function walk(path: string) {
    for (const entry of (await readdir(join(directory, path), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = path ? `${path}/${entry.name}` : entry.name
      if (entry.isDirectory()) await walk(child)
      else if (entry.isFile()) {
        const text = await readFile(join(directory, child), 'utf8')
        files.push({ file: groupFile(sharedDocsPath, child), text, sha256: createHash('sha256').update(text).digest('hex') })
      } else throw new Error('Expected regular committed configuration files')
    }
  }
  await walk('')
  return { configuration: { sharedDocs: { ...global, pages }, files }, pageErrors }
}

interface CandidateSource {
  repo: string; dev: string; pageId: string; target: string; configuration: UpdateConfiguration; fetcher?: ImageFetcher
  invalidPageIds?: readonly string[]
}
type CandidateServices = Pick<CollectUpdateInput, 'reader' | 'md2md' | 'build'>
function createCandidateDevInputs(dev: string) {
  const guides = createGuidesSnapshot(dev)
  const zdoc = new Map(['guides', 'guides-byoc'].map(manual => [manual,
    createZdocContentReader({ checkout: dev, manualDirectory: `content/en/${manual === 'guides' ? 'guides' : 'byoc'}` })]))
  return { guides, zdoc }
}

async function withCandidateServices<T>(input: CandidateSource, use: (services: CandidateServices) => Promise<T>,
  historical?: {buildPage: typeof buildPage; devInputs: ReturnType<typeof createCandidateDevInputs>; finalizeMdx: typeof toMdx;
    fragments?: Pick<InspectionReader, 'withFragments'>; links?: LinkInputReader}) {
  const git = new GitMilvusDocsReader(input.repo)
  const reader = createBuildReader(input.repo, {
    readFile: (commit, path) => git.readFile(commit, path),
    trackedHead: async () => input.target, isOnBranch: commit => git.isAncestor(commit, input.target),
    isAncestor: (a, b) => (historical?.links ?? git).isAncestor(a, b),
    withFragments: (commit, use) => (historical?.fragments ?? git).withFragments(commit, use),
  }, historical?.links)
  const {guides, zdoc} = historical?.devInputs ?? createCandidateDevInputs(input.dev)
  // The cached promise must also be observed if source collection fails before build.
  const records = await guides.getRecords()
  try {
    return await use({ reader, md2md: new RealMd2md(),
      build: async ({ pageId, sharedDocs, observe }) => {
        const runtime = createBuildRuntime({ sharedDocs, reader, zdoc, guides: { async getRecords() { return structuredClone(records) } },
          fetcher: input.fetcher ?? new HttpImageFetcher(120_000) })
        const prepare = runtime.prepare.bind(runtime)
        runtime.prepare = async (content, source, commit, context) => {
          const prepared = await prepare(content, source, commit, context)
          // A malformed page can hide or collide with any shared public ID. Never let its omission
          // silently fall through to Cloud/link-map resolution. Independent link-free pages still build.
          const uncertain = input.invalidPageIds?.length ? collectReferences(content).links.filter(ref => classifyLink(ref.url) === 'page') : []
          return { ...prepared, errors: [...(prepared.errors ?? []), ...uncertain.map(ref => ({ ...context, file: source, line: ref.line,
            code: 'UPDATE_CONFIGURATION_DEPENDENCY_UNAVAILABLE', message: `Cannot authenticate shared target ${ref.url}: invalid page configuration`,
            detail: { target: ref.url, invalidPages: [...input.invalidPageIds!] } }))] }
        }
        return (historical?.buildPage ?? buildPage)({ pageId, sharedDocs, reader, observe, md2md: new RealMd2md(), runtime, finalizeMdx: historical?.finalizeMdx })
      } })
  } finally { await reader.dispose() }
}

export async function collectCandidate(input: CandidateSource & {current: string; oldNext: string; previousConfiguration: UpdateConfiguration; versions: FixedVersions}) {
  return withCandidateServices(input, services => collectUpdateInputs({ ...services, versions: input.versions, pages: [{ pageId: input.pageId,
    oldNext: { commit: input.oldNext, configuration: input.previousConfiguration },
    current: { commit: input.current, configuration: input.configuration },
    candidateNext: { commit: input.target, configuration: input.configuration },
  }] }))
}

/** One batch page owns one bounded, private Dev export. Share its validated
 * namespace and front matter; each commit still gets fresh source/build state. */
export function createHistoricalCandidateCollector(input: Omit<CandidateSource, 'invalidPageIds' | 'target'>, finalizeMdx: typeof toMdx,
  fragments?: Pick<InspectionReader, 'withFragments'>, links?: LinkInputReader) {
  const buildHistoricalPage = createHistoricalPageBuilder()
  let devInputs: ReturnType<typeof createCandidateDevInputs> | undefined
  return (target: string) => {
    if (!devInputs) {
      devInputs = createCandidateDevInputs(input.dev)
      for (const [manual, reader] of devInputs.zdoc) {
        let pages: ReturnType<typeof reader.listPages> | undefined
        devInputs.zdoc.set(manual, { ...reader, listPages: () => pages ??= reader.listPages() })
      }
    }
    return withCandidateServices({ ...input, target }, services => collectHistoricalUpdateObservation({ ...services,
      pageId: input.pageId, request: { commit: target, configuration: input.configuration },
    }), {buildPage: buildHistoricalPage, devInputs, finalizeMdx, fragments, links})
  }
}
