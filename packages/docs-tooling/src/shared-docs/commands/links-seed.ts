import { readFile, realpath, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { GitMilvusDocsReader } from '../adapters/git-milvus-docs-reader'
import { GitLinkInputReader, readMilvusPages } from '../adapters/links-input'
import { createZdocContentReader } from '../adapters/zdoc-content'
import { parseSourceConfig } from '../core/config'
import { formatSeed, seedLinkMap } from '../core/links/seed'

export async function runLinksSeed(options: { repo: string; dev: string; out: string; commit?: string },
  write: (text: string) => void, repositoryRoot = process.cwd()): Promise<number> {
  const repo = await realpath(resolve(options.repo))
  const dev = await realpath(resolve(options.dev))
  const output = join(await realpath(dirname(resolve(options.out))), basename(resolve(options.out)))
  const inside = (parent: string) => { const path = relative(parent, output); return !path || (!path.startsWith(`..${sep}`) && path !== '..' && !path.startsWith(sep)) }
  if ([repo, dev, join(await realpath(repositoryRoot), 'shared-docs')].some(inside)) {
    throw new Error('--out must be a candidate file outside the input checkouts and repository-root shared-docs')
  }
  let commit = options.commit
  if (!commit) {
    const source = parseSourceConfig(await readFile(join(repositoryRoot, 'shared-docs/source.yaml'), 'utf8'))
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
  await writeFile(output, formatSeed(result), { flag: 'wx' })
  write(JSON.stringify({ output, ...result.provenance, coverage: result.coverage, sources: result.sources,
    inferenceTies: result.inferenceTies }, null, 2) + '\n')
  return 0
}
