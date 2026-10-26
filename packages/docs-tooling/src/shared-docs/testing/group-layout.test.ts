// @vitest-environment node
import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { readSharedDocs, runBuild } from '../commands/build'
import { runInspect } from '../commands/inspect'
import { runLinksSeed } from '../commands/links-seed'
import { runLock } from '../commands/lock'
import { createBuildDemo } from './build/demo'
import { groupContext } from '../adapters/group-context'
import { readPageSources } from '../adapters/read-page'
import { inspectPage } from '../adapters/inspect-page'
import { GitMilvusDocsReader } from '../adapters/git-milvus-docs-reader'
import { RealMd2md } from '../adapters/md2md'
import { inspectionContext } from '../commands/inspect'
import { createInspectDemo } from './demo'
import { createSeedDemo } from './links-seed/demo'

vi.mock('node:fs/promises', { spy: true })
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })
async function temp() {
  const root = await fs.mkdtemp(join(tmpdir(), 'group-layout-'))
  onTestFinished(() => fs.rm(root, { recursive: true, force: true }))
  return fs.realpath(root)
}
const cli = (action: string, ...args: string[]) => spawnSync(process.execPath,
  [resolve('scripts/docs-tooling.js'), 'shared-docs', action, ...args], { encoding: 'utf8' })

it.each(['build', 'lock', 'inspect', 'links-seed'])('rejects unsupported %s groups before filesystem or Git access', async action => {
  vi.clearAllMocks()
  const read = vi.spyOn(fs, 'readFile'), stat = vi.spyOn(fs, 'lstat'), real = vi.spyOn(fs, 'realpath')
  const list = vi.spyOn(fs, 'readdir'), writeFile = vi.spyOn(fs, 'writeFile')
  try {
    for (const sharedDocs of ['/missing/shared-docs', '/missing/reference']) {
      let output = ''
      const write = (text: string) => { output += text }
      const options = { sharedDocs, repo: '/missing/repo', dev: '/missing/dev', out: '/missing/out', page: 'example', commit: 'a'.repeat(40) }
      const code = action === 'build' ? await runBuild(options, write)
        : action === 'lock' ? await runLock(options, write)
        : action === 'inspect' ? await runInspect(options, write)
        : await runLinksSeed(options, write)
      expect(code).toBe(1)
      expect(output).toContain('CONFIG_FIELD_MISSING')
      expect(output).toContain('Only the guides group is supported')
    }
    for (const spy of [read, stat, real, list, writeFile]) expect(spy).not.toHaveBeenCalled()
  } finally { vi.restoreAllMocks() }
})

it.each(['build', 'lock', 'inspect', 'links-seed'])('validates the group through the real %s CLI, including explicit commits', action => {
  for (const sharedDocs of ['/missing/shared-docs', '/missing/reference']) {
    const extra = action === 'links-seed' ? ['--commit', 'a'.repeat(40)] : []
    const args = action === 'lock' ? [] : action === 'inspect' ? ['--page', 'example'] : ['--dev', '/missing/dev', '--out', '/missing/out']
    const result = cli(action, '--shared-docs', sharedDocs, '--repo', '/missing/repo', ...args, ...extra)
    expect(result.status).toBe(1)
    expect(result.stdout + result.stderr).toContain('CONFIG_FIELD_MISSING')
    expect(result.stdout + result.stderr).toContain('Only the guides group is supported')
    expect(result.stdout + result.stderr).not.toContain('ENOENT')
  }
})

it('requires the grouped option for inspect and links-seed and preserves unconditional fork refusal', () => {
  expect(cli('inspect', '--pages', '/missing/pages', '--page', 'example', '--repo', '/missing').status).toBe(1)
  const seed = cli('links-seed', '--repo', '/missing', '--dev', '/missing', '--out', '/missing/out', '--commit', 'a'.repeat(40))
  expect(seed.stderr).toContain('--shared-docs is required')
  const fork = cli('lock', '--from-fork', '--shared-docs', '/missing/reference')
  expect(fork.stdout).toContain('LOCK_FORK_PR')
  expect(fork.stdout + fork.stderr).not.toContain('Only the guides')
})

it('uses absolute build configuration locations for a guides directory outside the repository', async () => {
  const root = await temp(), demo = await createBuildDemo(root)
  const group = join(root, 'custom', 'guides')
  await fs.mkdir(join(root, 'custom'))
  await fs.rename(demo.sharedDocs, group)
  const fixtures = { 'source.yaml': 'schema_version: 2\n', 'Variables.json': '[]', 'links.yaml': 'bad: []\n',
    'product-names.yaml': 'check: []\nunknown: true\n', 'presentation/cloud-sdk-tabs.yaml': 'unknown: true\n',
    'pages/build-pipeline/page.yaml': 'schema_version: 2\n' }
  for (const [file, text] of Object.entries(fixtures)) await fs.writeFile(join(group, file), text)
  const result = await readSharedDocs(group)
  if (!('errors' in result)) throw new Error('Expected invalid configuration')
  expect(new Set(result.errors.map(error => error.file))).toEqual(new Set(Object.keys(fixtures).map(file => `${group}/${file}`)))
  expect(result.errors.every(error => error.line === undefined || error.line >= 1)).toBe(true)
})

it('reports custom page, lock, source and variable locations before Git access', async () => {
  const root = await temp(), demo = await createInspectDemo(root)
  const prefix = 'custom/guides', file = `${prefix}/pages/${demo.page}/page.yaml`
  const reader = new GitMilvusDocsReader('/unavailable')
  const head = vi.spyOn(reader, 'trackedHead')
  const result = await inspectPage({ pageId: demo.page, sourceYaml: 'schema_version: 2\n', pageYaml: 'schema_version: 2\n',
    lockYaml: 'schema_version: 2\n', variablesJson: '[]', sharedDocsPath: prefix, context: inspectionContext }, reader, new RealMd2md())
  if (!('errors' in result)) throw new Error('Expected invalid configuration')
  expect(new Set(result.errors.map(error => error.file))).toEqual(new Set([file, `${prefix}/source.yaml`, `${prefix}/Variables.json`, `${prefix}/pages/${demo.page}/lock.yaml`]))
  expect(head).not.toHaveBeenCalled()
})

it.each(['build', 'lock', 'inspect', 'links-seed'])('uses repository-relative custom group diagnostics through the real %s CLI', async action => {
  const root = await temp(), demo = await createBuildDemo(root)
  const group = join(root, 'custom/guides')
  await fs.mkdir(join(root, 'custom'))
  await fs.rename(demo.sharedDocs, group)
  await fs.writeFile(join(group, 'source.yaml'), 'schema_version: 2\n')
  for (const sharedDocs of [group, 'custom/guides']) {
    const args = ['--shared-docs', sharedDocs, '--repo', demo.repo]
    if (action === 'inspect') args.push('--page', 'build-pipeline')
    if (action === 'build' || action === 'links-seed') args.push('--dev', demo.dev, '--out', demo.out)
    const result = spawnSync(process.execPath, [resolve('scripts/docs-tooling.js'), 'shared-docs', action, ...args],
      { encoding: 'utf8', cwd: root })
    expect(result.status).toBe(1)
    expect(result.stdout + result.stderr).toContain('custom/guides/source.yaml')
    expect(result.stdout + result.stderr).toContain('CONFIG_FIELD_MISSING')
    expect(result.stdout + result.stderr).not.toContain(group)
  }
  await expect(fs.stat(demo.out)).rejects.toMatchObject({ code: 'ENOENT' })
})


it('protects a selected custom group and its output symlinks when seeding an explicit commit', async () => {
  const root = await temp(), demo = await createSeedDemo(root)
  const sharedDocs = join(root, 'custom/guides')
  await fs.mkdir(sharedDocs, { recursive: true })
  const out = join(sharedDocs, 'candidate.yaml')
  await expect(runLinksSeed({ ...demo, sharedDocs, out }, () => {}, root)).rejects.toThrow('--out')
  const alias = join(root, 'group-alias')
  await fs.symlink(sharedDocs, alias)
  await expect(runLinksSeed({ ...demo, sharedDocs, out: join(alias, 'candidate.yaml') }, () => {}, root)).rejects.toThrow('--out')
  await expect(fs.stat(out)).rejects.toMatchObject({ code: 'ENOENT' })
})

it.each(['lock', 'links-seed'])('keeps missing source diagnostics relative through the real %s CLI', async action => {
  const root = await temp(), demo = await createBuildDemo(root)
  await fs.rm(join(demo.sharedDocs, 'source.yaml'))
  const args = ['--shared-docs', demo.sharedDocs, '--repo', demo.repo]
  if (action === 'links-seed') args.push('--dev', demo.dev, '--out', demo.out)
  const result = spawnSync(process.execPath, [resolve('scripts/docs-tooling.js'), 'shared-docs', action, ...args],
    { encoding: 'utf8', cwd: root })
  expect(result.status).toBe(1)
  expect(result.stdout + result.stderr).toContain('shared-docs/guides/source.yaml')
  expect(result.stdout + result.stderr).not.toContain(demo.sharedDocs)
  await expect(fs.stat(demo.out)).rejects.toMatchObject({ code: 'ENOENT' })
})


it('keeps diagnostic paths repository-relative for a group inside the repository', () => {
  for (const directory of ['shared-docs/guides', '/repository/shared-docs/guides', '..drafts/guides']) {
    const group = groupContext(directory, '/repository')
    if ('errors' in group) throw new Error('Expected the guides group')
    const prefix = directory.startsWith('/repository/') ? directory.slice('/repository/'.length) : directory
    expect(group.file('source.yaml')).toBe(`${prefix}/source.yaml`)
  }
})

it('uses absolute diagnostic paths for a group outside the repository', () => {
  for (const directory of ['../guides', '../repository-copy/guides', '/temporary/shared-docs/guides']) {
    const group = groupContext(directory, '/repository')
    if ('errors' in group) throw new Error('Expected the guides group')
    expect(group.file('pages/example/page.yaml')).toBe(`${resolve('/repository', directory)}/pages/example/page.yaml`)
  }
})

it('keeps paths relative when the repository root itself is the selected guides directory', () => {
  const group = groupContext('/repository/guides', '/repository/guides')
  if ('errors' in group) throw new Error('Expected the guides group')
  expect(group.file('source.yaml')).toBe('source.yaml')
})


it.each(['inspect', 'read'])('preserves empty group prefixes through the %s adapter', async action => {
  const reader = new GitMilvusDocsReader('/unavailable')
  const head = vi.spyOn(reader, 'trackedHead')
  const input = { pageId: 'example', sourceYaml: 'schema_version: 2\n', pageYaml: 'schema_version: 2\n',
    lockYaml: 'schema_version: 2\n', variablesJson: '[]', sharedDocsPath: '', context: inspectionContext }
  const result = action === 'inspect' ? await inspectPage(input, reader, new RealMd2md()) : await readPageSources(input, reader)
  if (!('errors' in result)) throw new Error('Expected invalid configuration')
  const expected = ['source.yaml', 'pages/example/page.yaml', 'pages/example/lock.yaml']
  if (action === 'inspect') expected.push('Variables.json')
  expect(new Set(result.errors.map(error => error.file))).toEqual(new Set(expected))
  expect(result.errors.every(error => error.line === 1)).toBe(true)
  expect(head).not.toHaveBeenCalled()
})

it('propagates an empty group prefix through real inspect with --shared-docs .', async () => {
  const root = await temp(), demo = await createBuildDemo(root), group = join(root, 'guides')
  await fs.rename(demo.sharedDocs, group)
  for (const [file, text] of Object.entries({ 'source.yaml': 'schema_version: 2\n', 'Variables.json': '[]',
    'pages/build-pipeline/page.yaml': 'schema_version: 2\n', 'pages/build-pipeline/lock.yaml': 'schema_version: 2\n' })) {
    await fs.writeFile(join(group, file), text)
  }
  const result = spawnSync(process.execPath, [resolve('scripts/docs-tooling.js'), 'shared-docs', 'inspect', '--shared-docs', '.',
    '--page', 'build-pipeline', '--repo', demo.repo], { encoding: 'utf8', cwd: group })
  expect(result.status).toBe(1)
  for (const file of ['source.yaml', 'Variables.json', 'pages/build-pipeline/page.yaml', 'pages/build-pipeline/lock.yaml']) {
    expect(result.stdout).toContain(`\n${file}:1 `)
  }
  expect(result.stdout).not.toMatch(/^\//m)
})
