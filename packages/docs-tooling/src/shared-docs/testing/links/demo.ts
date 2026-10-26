import { cp, mkdir, readFile, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildMilvusDocs } from '../../fixtures/milvus-docs/build'
import { GitMilvusDocsReader } from '../../adapters/git-milvus-docs-reader'
import { GitLinkInputReader, prepareLinkInputs } from '../../adapters/links-input'
import { RealMd2md } from '../../adapters/md2md'
import { FakeImageFetcher } from '../../adapters/images'
import { parseLinkMap, rewriteLinksAndImages } from '../../core/links'

/** Read-only WP5 demonstration against a caller-owned temporary synthetic repository. */
export async function runLinksDemo(directory: string) {
  const repository = join(resolve(directory), 'milvus-docs')
  await mkdir(repository) // Refuse to overwrite an earlier demo.
  const built = await buildMilvusDocs('01-base')
  try { await cp(built.dir, repository, { recursive: true }) }
  finally { await rm(built.dir, { recursive: true, force: true }) }
  const commit = built.commits['01-base']
  const reader = new GitLinkInputReader(repository)
  const preprocessingReader = new GitMilvusDocsReader(repository)
  const md2md = new RealMd2md()
  const pilots = fileURLToPath(new URL('../../fixtures/pilots/', import.meta.url))
  const parsed = parseLinkMap(await readFile(join(pilots, 'delete-entities/shared-docs/guides/links.yaml'), 'utf8'), { file: 'shared-docs/guides/links.yaml' })
  if ('errors' in parsed) throw new Error(JSON.stringify(parsed.errors))
  const linkMap = new Map(parsed.map)
  // This demo exercises WP5 on the original pilot; WP10 will replace the
  // credentials section. An explicit external mapping isolates the requested
  // unresolved overview link without implementing transforms here.
  linkMap.set('configure-docker.md', 'https://milvus.io/docs/configure-docker.md')
  const pages = [
    ['delete-entities', 'site/en/userGuide/insert-and-delete/delete-entities.md'],
    ['openai', 'site/en/userGuide/embeddings-reranking/embedding-function/openai.md'],
  ] as const
  const results = new Map<string, ReturnType<typeof rewriteLinksAndImages>>()
  for (const [page, sourceFile] of pages) {
    const source = await reader.readFile(commit, sourceFile)
    const variables = JSON.parse(await readFile(join(pilots, page, 'shared-docs/guides/Variables.json'), 'utf8'))
    const preprocessed = await preprocessingReader.withFragments(commit, snapshot => Promise.resolve(md2md.preprocess({
      content: md2md.stripBlockMarkers(source), fragmentRoot: snapshot.root, variables, sourceName: sourceFile,
    })))
    if (!preprocessed.ok) throw new Error(JSON.stringify(preprocessed.errors))
    const context = { file: sourceFile, page, channel: 'current' as const }
    const prepared = await prepareLinkInputs(preprocessed.content, sourceFile, commit, reader, new FakeImageFetcher(new Map()), context)
    results.set(page, rewriteLinksAndImages({ markdown: preprocessed.content, sourceFile, sharedPages: new Map(), linkMap,
      // Demo-only injected inventory; the production source belongs to WP8.
      cloudPages: [{ slug: 'text-embedding-functions', title: 'Embedding Function Overview' },
        { slug: 'model-inference', title: 'Embedding Functions' }], context, ...prepared }))
  }
  const deleted = results.get('delete-entities')!
  const openai = results.get('openai')!
  if (!deleted.markdown?.includes('(./filtering-overview)')) throw new Error('Delete Entities did not resolve boolean.md')
  if (openai.errors?.length !== 1 || openai.errors[0].code !== 'LINK_UNRESOLVED') throw new Error('OpenAI did not produce the expected unresolved link')
  return {
    repository, commit,
    deleteEntities: { replacement: 'boolean.md -> ./filtering-overview', excerpt: deleted.markdown.split('\n').find(line => line.includes('(./filtering-overview)')) },
    openai: openai.errors,
  }
}
