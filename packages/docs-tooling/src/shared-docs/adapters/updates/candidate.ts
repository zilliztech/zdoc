import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { readSharedDocs } from '../../commands/build'
import { classifyLink, collectReferences } from '../../core/links'
import type { SharedDocsError } from '../../core/types'
import { groupFile } from '../group-context'
import { buildPage, createBuildReader, createBuildRuntime } from '../build-page'
import { collectUpdateInputs, readUpdateConfiguration, type UpdateConfiguration } from '../update-inputs'
import { GitMilvusDocsReader } from '../git-milvus-docs-reader'
import { RealMd2md } from '../md2md'
import { HttpImageFetcher, type ImageFetcher } from '../images'
import { createGuidesSnapshot } from '../guides-snapshot'
import { createZdocContentReader } from '../zdoc-content'
import type { FixedVersions } from '../../core/updates/types'
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

export async function collectCandidate(input: { repo: string; dev: string; pageId: string; current: string; oldNext: string; target: string;
  configuration: UpdateConfiguration; previousConfiguration: UpdateConfiguration; versions: FixedVersions; fetcher?: ImageFetcher; invalidPageIds?: readonly string[] }) {
  const git = new GitMilvusDocsReader(input.repo)
  const reader = createBuildReader(input.repo, { readFile: (commit, path) => git.readFile(commit, path),
    trackedHead: async () => input.target, isOnBranch: commit => git.isAncestor(commit, input.target),
    isAncestor: (a, b) => git.isAncestor(a, b), withFragments: (commit, use) => git.withFragments(commit, use) })
  const guides = createGuidesSnapshot(input.dev)
  // The cached promise must also be observed if source collection fails before build.
  const records = await guides.getRecords()
  const zdoc = new Map(['guides', 'guides-byoc'].map(manual => [manual,
    createZdocContentReader({ checkout: input.dev, manualDirectory: `content/en/${manual === 'guides' ? 'guides' : 'byoc'}` })]))
  try {
    return await collectUpdateInputs({ versions: input.versions, reader, md2md: new RealMd2md(), pages: [{ pageId: input.pageId,
      oldNext: { commit: input.oldNext, configuration: input.previousConfiguration },
      current: { commit: input.current, configuration: input.configuration }, candidateNext: { commit: input.target, configuration: input.configuration } }],
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
        return buildPage({ pageId, sharedDocs, reader, observe, md2md: new RealMd2md(), runtime })
      } })
  } finally { await reader.dispose() }
}
