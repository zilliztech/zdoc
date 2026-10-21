import { execFile } from 'node:child_process'
import { cp, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const snapshots = fileURLToPath(new URL('./commits/', import.meta.url))

/** Caller owns cleanup of dir. Only the requested prefix is materialized. */
export async function buildMilvusDocs(upTo: string): Promise<{ dir: string; commits: Record<string, string> }> {
  const names = (await readdir(snapshots, { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
  const end = names.indexOf(upTo)
  if (end < 0) throw new Error(`Unknown fixture commit: ${upTo}`)
  const dir = await mkdtemp(join(tmpdir(), 'shared-docs-git-'))
  // Ambient Git configuration, attributes, hooks and object format must not affect IDs.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_AUTHOR_NAME: 'Shared Docs Fixtures', GIT_AUTHOR_EMAIL: 'fixtures@example.test',
    GIT_COMMITTER_NAME: 'Shared Docs Fixtures', GIT_COMMITTER_EMAIL: 'fixtures@example.test' })
  const git = async (...args: string[]) => (await exec('git', [
    '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', '-c', 'core.filemode=false',
    '-c', 'core.attributesFile=/dev/null', '-c', 'core.hooksPath=/dev/null', ...args,
  ], { cwd: dir, env })).stdout.trim()
  try {
    await git('init', '--quiet', '--initial-branch=main', '--object-format=sha1', '--template=')
    const commits: Record<string, string> = {}
    for (const [index, name] of names.slice(0, end + 1).entries()) {
      for (const entry of await readdir(join(snapshots, name))) {
        await cp(join(snapshots, name, entry), join(dir, entry), { recursive: true })
      }
      const date = new Date(Date.UTC(2020, 0, 1, 0, 0, index)).toISOString()
      Object.assign(env, { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date })
      await git('add', '--all')
      await git('commit', '--quiet', '--allow-empty', '-m', name)
      commits[name] = await git('rev-parse', 'HEAD')
    }
    return { dir, commits }
  } catch (error) {
    await rm(dir, { recursive: true, force: true })
    throw error
  }
}
