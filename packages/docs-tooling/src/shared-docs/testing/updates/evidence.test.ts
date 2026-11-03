import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, symlink, link, rename, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { initializeEvidence } from '../../adapters/updates/evidence'
const roots: string[] = []
const git = (root: string, ...args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim()
async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'update-evidence-'))); roots.push(root)
  const repo = join(root, 'repo'); await mkdir(repo); git(repo, 'init', '-q')
  await writeFile(join(repo, 'input'), 'preserved'); git(repo, 'add', '.'); git(repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'fixture')
  return { root, repo, before: git(repo, 'show-ref') + git(repo, 'count-objects', '-v') }
}
// Fixtures are retained until the process exits: never recursively remove an unverified path.
afterEach(() => { roots.length = 0 })
describe('owned evidence bytes', () => {
  it('exclusively initializes, writes exact raw bytes, checks references and resumes only the same owner', async () => {
    const { root, repo } = await fixture(), out = join(root, 'evidence')
    const store = await initializeEvidence({ root: out, repositories: [repo], owner: 'transaction-1' })
    const bytes = Buffer.from([0, 255, 10]), ref = await store.writeBlob(bytes)
    expect(Buffer.from(await store.readBlob(ref))).toEqual(bytes)
    expect(ref.sha256).toBe(createHash('sha256').update(bytes).digest('hex'))
    await expect(store.readBlob({ ...ref, bytes: 2 })).rejects.toThrow()
    await expect(initializeEvidence({ root: out, repositories: [repo], owner: 'transaction-1' })).rejects.toThrow()
    await expect(initializeEvidence({ root: out, repositories: [repo], owner: 'other', resume: true })).rejects.toThrow()
    const resumed = await initializeEvidence({ root: out, repositories: [repo], owner: 'transaction-1', resume: true })
    await resumed.writeJournal('journal.json', Buffer.from('first')); await resumed.writeJournal('journal.json', Buffer.from('second'))
    expect(await readFile(join(out, 'journal.json'), 'utf8')).toBe('second')
  })
  it('allows disjoint task-owned .claude output but rejects empty/existing unowned roots', async () => {
    const { root, repo } = await fixture(); await mkdir(join(repo, '.claude'))
    await initializeEvidence({ root: join(repo, '.claude', 'evidence'), repositories: [repo], owner: 'owned' })
    const empty = join(root, 'empty'); await mkdir(empty)
    await expect(initializeEvidence({ root: empty, repositories: [repo], owner: 'owned' })).rejects.toThrow()
  })
  it('rejects symlink, case alias, repository, common Git and object-store output without changing source objects/refs', async () => {
    const { root, repo, before } = await fixture(); await symlink(repo, join(root, 'alias'))
    const linked = join(root, 'linked'); git(repo, 'worktree', 'add', '--detach', linked, 'HEAD')
    const objects = join(root, 'objects'); await mkdir(objects)
    await writeFile(join(repo, '.git', 'objects', 'info', 'alternates'), objects + '\n')
    const baseline = git(repo, 'show-ref') + git(repo, 'count-objects', '-v')
    for (const out of [repo, join(repo, 'new'), join(root, 'alias', 'out'), join(repo, '.git', 'out'), join(objects, 'out'), join(root, 'REPO', 'out')]) {
      await expect(initializeEvidence({ root: out, repositories: [repo, linked], owner: 'owned' })).rejects.toThrow()
      expect(git(repo, 'show-ref') + git(repo, 'count-objects', '-v')).toBe(baseline)
    }
    expect(before).toContain(git(repo, 'rev-parse', 'HEAD'))
  })
  it('rejects traversal, hardlinks, substituted ancestors, symlink journals and oversized reads', async () => {
    const { root, repo } = await fixture(), out = join(root, 'out')
    const store = await initializeEvidence({ root: out, repositories: [repo], owner: 'owner', maxBytes: 8 })
    await expect(store.writeBlob(Buffer.alloc(9))).rejects.toThrow()
    const ref = await store.writeBlob(Buffer.from('abc'))
    await expect(store.readBlob({ ...ref, path: '../repo/input' })).rejects.toThrow()
    await link(join(out, ref.path), join(root, 'hardlink'))
    await expect(store.readBlob(ref)).rejects.toThrow()
    await symlink(join(repo, 'input'), join(out, 'journal.json'))
    await expect(store.writeJournal('journal.json', Buffer.from('bad'))).rejects.toThrow()
    await rename(out, out + '-moved'); await symlink(repo, out)
    await expect(store.writeBlob(Buffer.from('bad'))).rejects.toThrow()
    expect(await readFile(join(repo, 'input'), 'utf8')).toBe('preserved')
  })
})
