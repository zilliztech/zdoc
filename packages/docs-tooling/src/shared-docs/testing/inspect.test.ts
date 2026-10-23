// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { inspectPage } from '../adapters/inspect-page'
import { GitMilvusDocsReader } from '../adapters/git-milvus-docs-reader'
import { RealMd2md } from '../adapters/md2md'
import { inspectionContext, runInspect } from '../commands/inspect'
import { createInspectDemo } from './demo'

// These tests start Git or CLI subprocesses. A slow shared CI runner can run several
// times slower than usual, so they get a generous per-file limit instead of vitest's 5 s.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'shared-docs-inspect-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const demo = await createInspectDemo(root)
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')))
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_AUTHOR_NAME: 'Inspection', GIT_AUTHOR_EMAIL: 'inspection@example.test',
    GIT_COMMITTER_NAME: 'Inspection', GIT_COMMITTER_EMAIL: 'inspection@example.test' })
  const git = (...args: string[]) => execFileSync('git', ['-c', 'commit.gpgsign=false', '-C', demo.repo, ...args], { encoding: 'utf8', env }).trim()
  const pagePath = 'site/en/userGuide/insert-and-delete/delete-entities.md'
  const fragmentPath = 'site/en/fragments/example.md'
  const commit = async (markdown: string, fragment = 'Fragment') => {
    await writeFile(join(demo.repo, pagePath), markdown)
    await writeFile(join(demo.repo, fragmentPath), fragment)
    git('add', '--all')
    git('commit', '--quiet', '--allow-empty', '-m', 'Inspection source')
    const sha = git('rev-parse', 'HEAD')
    git('update-ref', 'refs/heads/v3.0.x', sha)
    return sha
  }
  const input = {
    pageId: demo.page, sourceYaml: await readFile(join(root, 'shared-docs/source.yaml'), 'utf8'),
    pageYaml: await readFile(join(demo.pages, demo.page, 'page.yaml'), 'utf8'),
    variablesJson: '{"Product":"Zilliz Cloud"}', context: inspectionContext,
  }
  const reader = new GitMilvusDocsReader(demo.repo)
  const adapter = new RealMd2md()
  return { ...demo, root, git, input, reader, adapter, commit, pagePath, fragmentPath }
}
const locked = (current: string, next = current) => JSON.stringify({ schema_version: 1, current, next })

it('loads the live heading-tag export through commands and excludes BYOC', () => {
  expect(inspectionContext.betaValues).toEqual(expect.arrayContaining(['PUBLIC', 'PRIVATE', 'CONTACT SALES']))
  expect(inspectionContext.betaValues).not.toContain('BYOC')
  expect(inspectionContext.manuals).toEqual(expect.arrayContaining(['guides', 'guides-byoc']))
})

it('[1-1] passes the unchanged Cloud table, uses each locked fragment, and ignores checkout edits', async () => {
  const f = await setup()
  const markdown = '<!-- doc:block:start id="intro" -->\n{{var.Product}}\n<!-- doc:block:end id="intro" -->\n{{fragments/example.md}}\n'
  const before = await f.commit(markdown, 'Before {{var.Product}}\n')
  const after = await f.commit(markdown, 'After {{var.Product}}\n')
  await writeFile(join(f.repo, f.pagePath), 'Dirty page')
  await writeFile(join(f.repo, f.fragmentPath), 'Dirty fragment')
  const gitState = f.git('status', '--porcelain')
  const preprocess = vi.spyOn(f.adapter, 'preprocess')
  const result = await inspectPage({ ...f.input, lockYaml: locked(before, after) }, f.reader, f.adapter)
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  expect(result.channels.current.content).toBe('Zilliz Cloud\nBefore Zilliz Cloud\n\n')
  expect(result.channels.next.content).toBe('Zilliz Cloud\nAfter Zilliz Cloud\n\n')
  expect(result.channels.current.blocks[0]).toMatchObject({ id: 'intro', type: 'markdown', startLine: 1, endLine: 3 })
  expect(result.channels.current.dependencies.fragments[0].sha256).not.toBe(result.channels.next.dependencies.fragments[0].sha256)
  expect(preprocess.mock.calls).toHaveLength(2)
  for (const [input] of preprocess.mock.calls) {
    expect(input.variables).toEqual(JSON.parse(f.input.variablesJson))
    expect(input.variables).toBe(preprocess.mock.calls[0][0].variables)
    expect(existsSync(input.fragmentRoot)).toBe(false)
  }
  expect(f.git('status', '--porcelain')).toBe(gitState)
  expect(f.git('rev-parse', 'HEAD')).toBe(after)
})

it('fails missing Cloud variables without fallback and remaps page diagnostics after stripping', async () => {
  const f = await setup()
  const sha = await f.commit('<!-- doc:block:start id="intro" -->\nText\n<!-- doc:block:end id="intro" -->\n{{var.product_name}}\n')
  const result = await inspectPage({ ...f.input, lockYaml: locked(sha) }, f.reader, f.adapter)
  expect(result).toMatchObject({ errors: [
    { code: 'VAR_MISSING', file: f.pagePath, line: 4, page: f.page, channel: 'current' },
    { code: 'VAR_MISSING', file: f.pagePath, line: 4, page: f.page, channel: 'next' },
  ] })
  expect('channels' in result).toBe(false)
})

it('[2-4] aggregates bad markers and next-channel preprocess errors without partial Markdown', async () => {
  const f = await setup()
  const before = await f.commit('<!-- doc:block:start id="Wrong" -->\n<!-- doc:block:end id="absent" -->\n')
  const after = await f.commit('{{var.missing}}\n{{fragments/example.md}}\n', '<!-- doc:block:start id="fragment" -->\n{{var.fragment_missing}}\n')
  const result = await inspectPage({ ...f.input, lockYaml: locked(before, after) }, f.reader, f.adapter)
  expect(result).toMatchObject({ errors: [
    { code: 'BLOCK_MALFORMED', file: f.pagePath, line: 1, page: f.page, channel: 'current' },
    { code: 'BLOCK_UNMATCHED_END', line: 2, channel: 'current' },
    { code: 'VAR_MISSING', line: 1, channel: 'next' },
    { code: 'VAR_MISSING', file: f.fragmentPath, line: 2, channel: 'next' },
    { code: 'BLOCK_IN_FRAGMENT', file: f.fragmentPath, line: 1, channel: 'next' },
  ] })
  expect('channels' in result).toBe(false)
})

it('rejects fragment symlinks from committed objects and cleans snapshots on failure', async () => {
  const f = await setup()
  await f.commit('{{fragments/link.md}}\n')
  await symlink('example.md', join(f.repo, 'site/en/fragments/link.md'))
  f.git('add', '--all'); f.git('commit', '--quiet', '-m', 'Fragment symlink')
  const sha = f.git('rev-parse', 'HEAD')
  f.git('update-ref', 'refs/heads/v3.0.x', sha)
  expect(await inspectPage({ ...f.input, lockYaml: locked(sha) }, f.reader, f.adapter)).toMatchObject({ errors: [
    { code: 'FRAGMENT_SYMLINK', channel: 'current' }, { code: 'FRAGMENT_SYMLINK', channel: 'next' },
  ] })
  let snapshotRoot = ''
  await expect(f.reader.withFragments(sha, async snapshot => { snapshotRoot = snapshot.root; throw new Error('Injected') }))
    .rejects.toThrow('Injected')
  expect(existsSync(snapshotRoot)).toBe(false)
})

it('reports all configuration errors before Git or md2md and leaves leaf validation to md2md', async () => {
  const f = await setup()
  const head = vi.spyOn(f.reader, 'trackedHead')
  const parse = vi.spyOn(f.adapter, 'parseBlocks')
  expect(await inspectPage({ ...f.input, pageYaml: f.input.pageYaml + '\nunknown: true\n',
    variablesJson: '{"unused":{"X":1,"x":2}}' }, f.reader, f.adapter)).toMatchObject({ errors: [
      { code: 'CONFIG_FIELD_UNKNOWN' }, { code: 'CONFIG_VARIABLES_INVALID', file: 'shared-docs/Variables.json' },
    ] })
  expect(head).not.toHaveBeenCalled()
  expect(parse).not.toHaveBeenCalled()
  const sha = await f.commit('{{var.nil}} {{var.list}} {{var.object}}')
  const result = await inspectPage({ ...f.input, lockYaml: locked(sha),
    variablesJson: '{"nil":null,"list":[],"object":{"nested":"value"}}' }, f.reader, f.adapter)
  expect('errors' in result && result.errors.map(error => error.code)).toEqual(Array(6).fill('VAR_NOT_SCALAR'))
})

it('[3-1] inspects both planned channels at the tracked head without writing a lock', async () => {
  const f = await setup()
  let output = ''
  expect(await runInspect(f, text => { output += text })).toBe(0)
  expect(output).toContain('Lock: planned (no lock.yaml)')
  for (const channel of ['current', 'next']) {
    expect(output).toContain(`${channel}: ${f.commits['02-paragraph']} — planned (no lock.yaml)`)
    expect(output).toContain(`--- ${channel} expanded Markdown ---`)
  }
  expect(existsSync(join(f.pages, f.page, 'lock.yaml'))).toBe(false)
  expect(f.git('status', '--porcelain')).toBe('')
})

it('runs inspect via the real CLI and reports a broken page field with a failing exit', async () => {
  const f = await setup()
  const args = ['scripts/docs-tooling.js', 'shared-docs', 'inspect', '--pages', f.pages, '--page', f.page, '--repo', f.repo]
  const success = spawnSync(process.execPath, args, { encoding: 'utf8' })
  expect(success.status, success.stderr).toBe(0)
  expect(success.stdout).toContain('--- next expanded Markdown ---')
  const pageFile = join(f.pages, f.page, 'page.yaml')
  await writeFile(pageFile, f.input.pageYaml.replace('manual: guides\n', 'manual: nonexistent\n'))
  const failure = spawnSync(process.execPath, args, { encoding: 'utf8' })
  expect(failure.status, failure.stderr).toBe(1)
  expect(failure.stdout).toMatch(/shared-docs\/pages\/delete-entities\/page.yaml:\d+ .*CONFIG_MANUAL_UNKNOWN/)
  expect(failure.stdout).not.toContain('expanded Markdown')
}, 120_000)

it('prints both locked versions even when the commits match', async () => {
  const f = await setup()
  await writeFile(join(f.pages, f.page, 'lock.yaml'), locked(f.commits['01-base']))
  let output = ''
  expect(await runInspect(f, text => { output += text })).toBe(0)
  expect(output).toContain('Lock: valid')
  expect(output).toContain(`current: ${f.commits['01-base']}`)
  expect(output).toContain(`next: ${f.commits['01-base']}`)
})
