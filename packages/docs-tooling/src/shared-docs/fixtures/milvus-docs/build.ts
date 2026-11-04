import { execFile } from 'node:child_process'
import { cp, lstat, mkdir, mkdtemp, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const snapshots = fileURLToPath(new URL('./commits/', import.meta.url))

export interface FixtureCommit {
  name: string
  writes?: Readonly<Record<string, string | Uint8Array>>
  deletes?: readonly string[]
  renames?: readonly { from: string; to: string }[]
}

/** Caller owns cleanup of dir. Only the requested prefix is materialized. */
export async function buildMilvusDocs(upTo: string, additions: readonly FixtureCommit[] = []): Promise<{ dir: string; commits: Record<string, string> }> {
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
    async function path(name: string): Promise<string> {
      if (!name || isAbsolute(name) || /[\\\x00]/.test(name) || name.split('/').some(part => !part || part === '.' || part === '..' || part === '.git')) throw new Error(`Unsafe fixture path: ${name}`)
      let current = dir
      for (const part of name.split('/')) {
        current = join(current, part)
        try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Symbolic fixture path: ${name}`) }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      }
      return join(dir, name)
    }
    for (const [index, change] of additions.entries()) {
      if (!change.name || Object.hasOwn(commits, change.name)) throw new Error(`Duplicate or empty fixture commit: ${change.name}`)
      for (const name of change.deletes ?? []) await rm(await path(name))
      for (const move of change.renames ?? []) {
        const from = await path(move.from), to = await path(move.to)
        try { await lstat(to); throw new Error(`Fixture rename target exists: ${move.to}`) }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
        await mkdir(dirname(to), { recursive: true }); await rename(from, to)
      }
      for (const [name, text] of Object.entries(change.writes ?? {})) {
        const destination = await path(name)
        await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, text)
      }
      const date = new Date(Date.UTC(2020, 0, 1, 0, 0, end + 1 + index)).toISOString()
      Object.assign(env, { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date })
      await git('add', '--all'); await git('commit', '--quiet', '--allow-empty', '-m', change.name)
      commits[change.name] = await git('rev-parse', 'HEAD')
    }
    return { dir, commits }
  } catch (error) {
    await rm(dir, { recursive: true, force: true })
    throw error
  }
}
