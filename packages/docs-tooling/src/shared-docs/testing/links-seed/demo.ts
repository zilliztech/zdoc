import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function git(repository: string, ...args: string[]): string {
  return execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}
export async function createRepository(repository: string, files: Record<string, string>): Promise<string> {
  await mkdir(repository)
  git(repository, 'init', '--initial-branch=v3.0.x')
  for (const [file, text] of Object.entries(files)) {
    await mkdir(dirname(join(repository, file)), { recursive: true })
    await writeFile(join(repository, file), text)
  }
  git(repository, 'add', '.')
  git(repository, '-c', 'user.name=Seed Demo', '-c', 'user.email=seed@example.test', '-c', 'commit.gpgsign=false', 'commit', '-m', 'Synthetic seed inputs')
  return git(repository, 'rev-parse', 'HEAD')
}
export async function createSeedDemo(directory: string) {
  const fixture = JSON.parse(await readFile(fileURLToPath(new URL('../../fixtures/links-seed/demo.json', import.meta.url)), 'utf8'))
  const repo = join(resolve(directory), 'milvus-docs'), dev = join(resolve(directory), 'zdoc-dev')
  const commit = await createRepository(repo, fixture.milvus)
  const devCommit = await createRepository(dev, fixture.cloud)
  const sharedDocs = join(resolve(directory), 'shared-docs/guides')
  await mkdir(sharedDocs, { recursive: true })
  return { sharedDocs, repo, dev, commit, devCommit, out: join(resolve(directory), 'candidate.yaml') }
}

/** Creates tiny temporary repositories and runs the real CLI, without network access. */
export async function runSeedDemo(directory: string) {
  const options = await createSeedDemo(directory)
  const repositoryRoot = fileURLToPath(new URL('../../../../../..', import.meta.url))
  const stdout = execFileSync(process.execPath, ['scripts/docs-tooling.js', 'shared-docs', 'links-seed',
    '--shared-docs', options.sharedDocs, '--repo', options.repo, '--commit', options.commit, '--dev', options.dev, '--out', options.out],
  { cwd: repositoryRoot, encoding: 'utf8', timeout: 30_000 })
  return { ...options, summary: JSON.parse(stdout), yaml: await readFile(options.out, 'utf8') }
}
