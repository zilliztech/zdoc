import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildMilvusDocs } from '../fixtures/milvus-docs/build'

/** Create a self-contained demo in an empty caller-supplied temporary directory. */
export async function createInspectDemo(directory: string) {
  const root = resolve(directory)
  const repo = join(root, 'milvus-docs')
  const shared = join(root, 'shared-docs')
  const pages = join(shared, 'pages')
  const page = 'delete-entities'
  // Exclusive directory creation prevents overwriting a previous demo.
  await mkdir(repo)
  await mkdir(shared)
  const fixture = await buildMilvusDocs('02-paragraph')
  try { await cp(fixture.dir, repo, { recursive: true }) }
  finally { await rm(fixture.dir, { recursive: true, force: true }) }
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  execFileSync('git', ['-C', repo, 'branch', 'v3.0.x', fixture.commits['02-paragraph']], { env })
  const pilot = fileURLToPath(new URL('../fixtures/pilots/delete-entities/shared-docs/', import.meta.url))
  await mkdir(join(pages, page), { recursive: true })
  await writeFile(join(pages, page, 'page.yaml'), await readFile(join(pilot, 'page.yaml')))
  await writeFile(join(shared, 'Variables.json'), await readFile(join(pilot, 'Variables.json')))
  await writeFile(join(shared, 'source.yaml'), 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n')
  return { repo, pages, page, commits: fixture.commits }
}
