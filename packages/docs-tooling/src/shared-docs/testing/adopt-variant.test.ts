// @vitest-environment node
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { runAdoptVariant } from '../commands/adopt-variant'
import { git, pageYaml, write } from './build/demo'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

const roots: string[] = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })

const base = 'Original upstream content.\n\nBody text.\n'
const adopted = 'Adopted upstream PR content.\n\nChanged body text.\n'

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'shared-docs-adopt-test-')); roots.push(root)
  const repo = join(root, 'upstream'), group = join(root, 'shared-docs/guides')
  await write(repo, 'site/en/sample.md', base)
  await git(repo, 'init', '--quiet', '--initial-branch=v3.0.x', '--template=')
  await git(repo, 'add', '--all'); await git(repo, 'commit', '--quiet', '-m', 'Base')
  const baseCommit = await git(repo, 'rev-parse', 'HEAD')
  await write(repo, 'site/en/sample.md', adopted)
  await git(repo, 'add', '--all'); await git(repo, 'commit', '--quiet', '-m', 'Upstream PR change')
  const head = await git(repo, 'rev-parse', 'HEAD')
  await git(repo, 'update-ref', 'refs/pull/42/head', head)
  await write(group, 'source.yaml', `schema_version: 1\nrepository: ${repo}\ntrack: v3.0.x\n`)
  await write(group, 'pages/sample/page.yaml', pageYaml('site/en/sample.md', 'tutorials/sample'))
  await write(group, 'pages/sample/lock.yaml', JSON.stringify({ schema_version: 1, current: baseCommit, next: baseCommit }))
  return { root, repo, group, baseCommit, head }
}

async function output(setup: Awaited<ReturnType<typeof fixture>>, overrides: Record<string, unknown> = {}) {
  let text = ''
  const code = await runAdoptVariant({ sharedDocs: setup.group, page: 'sample', pull: 42, ...overrides },
    value => { text += value }, setup.root)
  return { code, text }
}

it('adopts a pull request head as the next-channel variant with full provenance', async () => {
  const setup = await fixture()
  const { code, text } = await output(setup)
  expect(code).toBe(0)
  expect(text).toContain('Created')
  expect(text).toContain(`at ${setup.head.slice(0, 12)}`)
  const variant = await readFile(join(setup.group, 'pages/sample/variant-next.md'), 'utf8')
  expect(variant).toBe(adopted)
  const sidecar = JSON.parse(await readFile(join(setup.group, 'pages/sample/variant-next.provenance.json'), 'utf8'))
  expect(sidecar).toMatchObject({ pull: 42, head_sha: setup.head, adopted_via: 'adopt-variant' })
  expect(typeof sidecar.adopted_at).toBe('string')
})

it('a dry run reports the plan without writing anything', async () => {
  const setup = await fixture()
  const { code, text } = await output(setup, { dryRun: true })
  expect(code).toBe(0)
  expect(text).toContain('Planned')
  expect(text).toContain('Dry run; nothing written.')
  await expect(readFile(join(setup.group, 'pages/sample/variant-next.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
})

it('re-adoption of identical bytes is a no-op and promotion writes both channels', async () => {
  const setup = await fixture()
  expect((await output(setup)).text).toContain('Created')
  const again = await output(setup)
  expect(again.code).toBe(0)
  expect(again.text).toContain('Unchanged')
  const promoted = await output(setup, { promote: true })
  expect(promoted.code).toBe(0)
  expect(promoted.text).toContain('channels=current,next')
  expect(await readFile(join(setup.group, 'pages/sample/variant-current.md'), 'utf8')).toBe(adopted)
})

it('fails closed when the pinned expectation no longer matches the live pull request head', async () => {
  const setup = await fixture()
  await write(setup.repo, 'site/en/late.md', 'Late upstream addition.\n')
  await git(setup.repo, 'add', '--all'); await git(setup.repo, 'commit', '--quiet', '-m', 'Late')
  const late = await git(setup.repo, 'rev-parse', 'HEAD')
  await git(setup.repo, 'update-ref', 'refs/pull/42/head', late)
  const { code, text } = await output(setup, { ref: setup.head })
  expect(code).toBe(1)
  expect(text).toContain('head moved')
})

it('fails closed when the adopted source file is absent from the pull request head', async () => {
  const setup = await fixture()
  const emptyTree = await git(setup.repo, 'hash-object', '-t', 'tree', '/dev/null')
  const orphan = await git(setup.repo, 'commit-tree', emptyTree, '-m', 'Unrelated head')
  await git(setup.repo, 'update-ref', 'refs/pull/43/head', orphan.trim())
  const { code, text } = await output(setup, { pull: 43 })
  expect(code).toBe(1)
  expect(text).toContain('is not present at pull request #43')
})

it('requires an onboarded page with a committed lock', async () => {
  const setup = await fixture()
  const { code, text } = await output(setup, { page: 'missing-page' })
  expect(code).toBe(1)
  expect(text).toContain('Adoption requires an onboarded shared page')
})
