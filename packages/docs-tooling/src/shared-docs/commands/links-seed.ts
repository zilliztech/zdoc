import { readFile, realpath, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { groupContext } from '../adapters/group-context'
import { GitMilvusDocsReader } from '../adapters/git-milvus-docs-reader'
import { GitLinkInputReader, readMilvusPages } from '../adapters/links-input'
import { createZdocContentReader } from '../adapters/zdoc-content'
import { parseSourceConfig } from '../core/config'
import { formatSeed, seedLinkMap } from '../core/links/seed'

export async function runLinksSeed(options: { sharedDocs: string; repo: string; dev: string; out: string; commit?: string },
  write: (text: string) => void, repositoryRoot = process.cwd()): Promise<number> {
  const group = groupContext(options.sharedDocs, repositoryRoot)
  if ('errors' in group) {
    for (const error of group.errors) write(`${error.file}:${error.line} ${error.code}: ${error.message}\n`)
    return 1
  }
  // The initial link map is seeded before the first page creates the group directory;
  // with --commit the group is only an --out guard, so a missing directory is allowed.
  const sharedRoot = await realpath(group.root).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return group.root
    throw error
  })
  const repo = await realpath(resolve(options.repo))
  const dev = await realpath(resolve(options.dev))
  const output = join(await realpath(dirname(resolve(options.out))), basename(resolve(options.out)))
  const inside = (parent: string) => { const path = relative(parent, output); return !path || (!path.startsWith(`..${sep}`) && path !== '..' && !path.startsWith(sep)) }
  if ([repo, dev, join(await realpath(repositoryRoot), 'shared-docs'), sharedRoot].some(inside)) {
    throw new Error('--out must be a candidate file outside the input checkouts and repository-root shared-docs')
  }
  let commit = options.commit
  if (!commit) {
    const sourcePath = join(group.root, 'source.yaml')
    const sourceYaml = await readFile(sourcePath, 'utf8').catch(error => {
      if (error instanceof Error) error.message = error.message.replaceAll(sourcePath, group.file('source.yaml'))
      throw error
    })
    const source = parseSourceConfig(sourceYaml, { file: group.file('source.yaml') })
    if ('errors' in source) throw new Error(JSON.stringify(source.errors))
    commit = await new GitMilvusDocsReader(repo).trackedHead(source.config.track)
  }
  const reader = createZdocContentReader({ checkout: dev, manualDirectory: 'content/en/guides' })
  const devCommit = await reader.getCommit()
  const milvusPages = await readMilvusPages(commit, new GitLinkInputReader(repo))
  const cloudPages = await Promise.all((await reader.listPages()).map(async page => ({
    slug: page.slug, title: page.title, links: await reader.readInternalLinks(page.path),
  })))
  const result = seedLinkMap({ milvusPages, cloudPages })
  result.provenance = { milvusCommit: commit, devCommit, generatedDate: new Date().toISOString().slice(0, 10) }
  if (await reader.getCommit() !== devCommit) throw new Error('zdoc commit changed during the read')
  // Exclusive creation also prevents following an existing output symlink into an input.
  await writeFile(output, formatSeed(result, group.file('links.yaml')), { flag: 'wx' })
  write(JSON.stringify({ output, ...result.provenance, coverage: result.coverage, sources: result.sources,
    inferenceTies: result.inferenceTies }, null, 2) + '\n')
  return 0
}
