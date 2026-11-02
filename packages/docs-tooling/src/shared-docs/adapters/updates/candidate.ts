import { buildPage, createBuildReader, createBuildRuntime } from '../build-page'
import { collectUpdateInputs, type UpdateConfiguration } from '../update-inputs'
import { GitMilvusDocsReader } from '../git-milvus-docs-reader'
import { RealMd2md } from '../md2md'
import { HttpImageFetcher, type ImageFetcher } from '../images'
import { createGuidesSnapshot } from '../guides-snapshot'
import { createZdocContentReader } from '../zdoc-content'
import type { FixedVersions } from '../../core/updates/types'
export async function collectCandidate(input: { repo: string; dev: string; pageId: string; current: string; oldNext: string; target: string;
  configuration: UpdateConfiguration; previousConfiguration: UpdateConfiguration; versions: FixedVersions; fetcher?: ImageFetcher }) {
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
      build: async ({ pageId, sharedDocs, observe }) => buildPage({ pageId, sharedDocs, reader, observe, md2md: new RealMd2md(),
        runtime: createBuildRuntime({ sharedDocs, reader, zdoc, guides: { async getRecords() { return structuredClone(records) } },
          fetcher: input.fetcher ?? new HttpImageFetcher(120_000) }) }) })
  } finally { await reader.dispose() }
}
