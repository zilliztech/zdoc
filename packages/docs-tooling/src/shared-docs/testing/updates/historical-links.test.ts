// @vitest-environment node
import {execFileSync} from 'node:child_process'
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {expect, it, onTestFinished, vi} from 'vitest'
import {GitLinkInputReader} from '../../adapters/links-input'
import {BatchGitStore, batchBudget} from '../../adapters/updates/batch-source'
import {git, write} from '../build/demo'

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'batch-verified-links-'))
  onTestFinished(() => rm(root, {recursive: true, force: true}))
  const repo = join(root, 'repo'), bin = join(root, 'bin')
  await mkdir(repo); await mkdir(bin)
  await git(repo, 'init', '-qb', 'main', '--object-format=sha1', '--template=')
  const batches = join(root, 'batches'), images = join(root, 'images'), corrupt = join(root, 'corrupt')
  const quote = (value: string) => "'" + value.replaceAll("'", "'\\''") + "'"
  const executable = quote(execFileSync('which', ['git'], {encoding: 'utf8'}).trim())
  await writeFile(join(bin, 'git'), `#!/bin/sh
case "$*" in
  *' cat-file --batch')
    if [ -f ${quote(corrupt)} ]; then
      IFS= read -r oid
      printf '%s blob 3\nno!\n' "$oid"
      exit 0
    fi
    tee -a ${quote(batches)} | ${executable} "$@"
    exit $?
    ;;
  *' cat-file blob '*) printf '%s\n' "$*" >> ${quote(images)} ;;
esac
exec ${executable} "$@"
`, {mode: 0o700})
  return {repo, bin, batches, images, corrupt}
}

it('rereads literal path identities, reuses shared OIDs, and observes each image read', async () => {
  const f = await fixture(), a = 'site/en/a.md', b = 'site/en/b.md', image = 'site/en/assets/sample.png'
  await write(f.repo, a, 'Exact multilingual text 文.\r\n')
  await write(f.repo, b, 'Exact multilingual text 文.\r\n')
  await write(f.repo, image, Buffer.from([1, 2, 3]))
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'Same blob at two paths')
  const first = await git(f.repo, 'rev-parse', 'HEAD')
  await git(f.repo, 'commit', '--allow-empty', '-qm', 'Unchanged blob identities')
  const second = await git(f.repo, 'rev-parse', 'HEAD')
  await write(f.repo, a, 'Independent new bytes.\n')
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'Change one path identity')
  const third = await git(f.repo, 'rev-parse', 'HEAD')
  const budget = batchBudget(), store = await BatchGitStore.open(f.repo, budget)
  const verified = new Map<string, Map<string, string>>()
  for (const commit of [first, second, third]) {
    verified.set(commit, new Map((await store.inventory(commit, 'site/en')).map(({path, oid}) => [path, oid])))
  }
  const ordinary = new GitLinkInputReader(f.repo)
  const expected = await Promise.all([first, second, third].map(commit => ordinary.readFiles(commit, [a, b])))
  const reader = GitLinkInputReader.historical(f.repo, budget.remaining, (commit, path) => verified.get(commit)?.get(path))
  const oldOid = verified.get(first)!.get(a)!, newOid = verified.get(third)!.get(a)!
  vi.stubEnv('PATH', f.bin + ':' + process.env.PATH)
  try {
    expect(await reader.readFiles(first, [a, b])).toEqual(expected[0])
    expect(await reader.readFiles(second, [a, b])).toEqual(expected[1])
    verified.get(third)!.set(a, oldOid)
    await expect(reader.readFiles(third, [a, b])).rejects.toThrow('Unexpected historical Git path identity')
    verified.get(third)!.set(a, newOid)
    expect(await reader.readFiles(third, [a, b])).toEqual(expected[2])
    expect(await readFile(f.batches, 'utf8')).toBe(`${oldOid}\n${newOid}\n`)
    await expect(reader.readFiles(third, ['site/en/missing.md'])).rejects.toMatchObject({code: 'MISSING_FILE'})
    await expect(reader.readFiles('a'.repeat(40), [a])).rejects.toMatchObject({code: 'MISSING_COMMIT'})
    for (const commit of [first, second]) expect(await reader.readBytes(commit, image)).toEqual(new Uint8Array([1, 2, 3]))
    expect((await readFile(f.images, 'utf8')).trim().split('\n')).toHaveLength(2)
  } finally {vi.unstubAllEnvs()}
})

it('rejects bad native blob bytes before caching them and checks the operation deadline', async () => {
  const f = await fixture(), path = 'site/en/a.md'
  await write(f.repo, path, 'yes')
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '-qm', 'Expected three bytes')
  const commit = await git(f.repo, 'rev-parse', 'HEAD')
  const oid = await git(f.repo, 'rev-parse', `${commit}:${path}`)
  const verified = (sha: string, file: string) => sha === commit && file === path ? oid : undefined
  const reader = GitLinkInputReader.historical(f.repo, batchBudget().remaining, verified)
  vi.stubEnv('PATH', f.bin + ':' + process.env.PATH)
  try {
    await writeFile(f.corrupt, '')
    await expect(reader.readFiles(commit, [path])).rejects.toThrow('Unexpected Git blob identity')
    await rm(f.corrupt)
    expect(await reader.readFiles(commit, [path])).toEqual(new Map([[path, 'yes']]))
    expect(await readFile(f.batches, 'utf8')).toBe(`${oid}\n`)
    const expired = GitLinkInputReader.historical(f.repo, () => {throw Error('OBSERVATION_DEADLINE')}, verified)
    await expect(expired.readFiles(commit, [path])).rejects.toThrow('OBSERVATION_DEADLINE')
  } finally {vi.unstubAllEnvs()}
})
