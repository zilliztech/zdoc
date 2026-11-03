// @vitest-environment node
import { mkdtemp, mkdir, realpath, rm, readFile, readdir, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { createBuildDemo, git, write, externalImage, imageBytes, pageYaml } from '../build/demo'
import { FakeImageFetcher } from '../../adapters/images'
import { runUpdate } from '../../commands/update'
it('writes four read-only artifacts, preserves all pages and is semantically repeatable', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'update-command-')); onTestFinished(() => rm(temporary, { recursive: true, force: true }))
  const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
  await write(d.repo, 'site/en/unactivated.md', '---\nid: unactivated-public.md\ntitle: Unactivated\n---\n# Unactivated\n')
  await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'unactivated source')
  d.commit = await git(d.repo, 'rev-parse', 'HEAD')
  for (const page of ['build-pipeline', 'shared-target']) await write(d.sharedDocs, `pages/${page}/lock.yaml`, JSON.stringify({ schema_version: 1, current: d.commit, next: d.commit }))
  await write(d.sharedDocs, 'pages/unactivated/page.yaml', pageYaml('site/en/unactivated.md', 'tutorials/unactivated'))
  await write(d.sharedDocs, 'pages/unactivated/lock.yaml', JSON.stringify({ schema_version: 1, current: d.commit, next: d.commit }))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'config')
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const opts = { sharedDocs: d.sharedDocs, repo: d.repo, dev: d.dev, out: join(root, 'report1') }
  const deps = { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) }
  const refs = await git(root, 'show-ref'), sourceRefs = await git(d.repo, 'show-ref'), before = await readFile(join(d.sharedDocs, 'pages/build-pipeline/lock.yaml'))
  const messages: string[] = []
  const code = await runUpdate(opts, x => messages.push(x), root, deps)
  expect(code, await readFile(join(opts.out, 'report.json'), 'utf8')).toBe(0)
  expect((await readdir(opts.out)).sort()).toEqual(['pins.json', 'plan.json', 'report.json', 'report.md'])
  const report = JSON.parse(await readFile(join(opts.out, 'report.json'), 'utf8'))
  expect(report.pages).toHaveLength(3); expect(report.pages.every((p: any) => p.lifecycle.state === 'unknown')).toBe(true)
  expect(report.pages.find((p: any) => p.pageId === 'unactivated').status).toBe('content-failure')
  expect(await runUpdate({ ...opts, out: join(root, 'report2') }, () => {}, root, deps)).toBe(0)
  const plan = JSON.parse(await readFile(join(opts.out, 'plan.json'), 'utf8'))
  expect(JSON.parse(await readFile(join(root, 'report2/plan.json'), 'utf8')).inputSha256).toBe(plan.inputSha256)
  expect(plan.operations).toEqual([]); expect(await git(root, 'show-ref')).toBe(refs); expect(await git(d.repo, 'show-ref')).toBe(sourceRefs)
  expect(await readFile(join(d.sharedDocs, 'pages/build-pipeline/lock.yaml'))).toEqual(before)
  expect(await runUpdate(opts, () => {}, root, deps)).toBe(2)
  expect(await runUpdate({ ...opts, mode: 'write' }, () => {}, root, deps)).toBe(2)
  expect(await runUpdate({ ...opts, out: join(root, 'unknown'), pages: 'nonexistent' }, () => {}, root, deps)).toBe(2)
  await symlink(d.sharedDocs, join(root, 'linked'))
  expect(await runUpdate({ ...opts, out: join(root, 'linked/out') }, () => {}, root, deps)).toBe(2)
  expect(await runUpdate({ ...opts, out: join(root, 'partial'), evidenceRun: '1' }, () => {}, root,
    { ...deps, github: { get: async () => { throw new Error('offline unavailable') }, zip: async () => { throw new Error('unreachable') } } })).toBe(1)
  expect(JSON.parse(await readFile(join(root, 'partial/report.json'), 'utf8')).pages).toHaveLength(3)
}, 120_000)

it('distinguishes authenticated source deletion from network failure and retains inventory when dev is unavailable', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'update-failures-')); onTestFinished(() => rm(temporary, { recursive: true, force: true }))
  const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'config')
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const opts = { sharedDocs: d.sharedDocs, repo: d.repo, dev: d.dev, out: join(root, 'network') }
  expect(await runUpdate(opts, () => {}, root, { fetcher: { async fetch() { throw new Error('Network unavailable') } } })).toBe(1)
  const network = JSON.parse(await readFile(join(opts.out, 'report.json'), 'utf8'))
  expect(network.infrastructureErrors.length).toBeGreaterThan(0); expect(network.pages).toHaveLength(2)
  expect(await runUpdate({ ...opts, out: join(root, 'dev-missing'), dev: join(root, 'absent') }, () => {}, root)).toBe(1)
  expect(JSON.parse(await readFile(join(root, 'dev-missing/report.json'), 'utf8')).pages).toHaveLength(2)
  await git(d.repo, 'rm', 'site/en/build-pipeline.md'); await git(d.repo, 'commit', '-qm', 'delete source')
  expect(await runUpdate({ ...opts, out: join(root, 'deleted'), pages: 'build-pipeline' }, () => {}, root,
    { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })).toBe(0)
  const deleted = JSON.parse(await readFile(join(root, 'deleted/report.json'), 'utf8'))
  expect(deleted.pages.find((p: any) => p.pageId === 'build-pipeline').status).toBe('content-failure')
  expect(deleted.impact.pages[0].errors.some((e: any) => e.code === 'CONFIG_SOURCE_NOT_FOUND')).toBe(true)
}, 120_000)

it('does not conflate Cloud source remapping with an unrelated forward source commit', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'update-config-axis-')); onTestFinished(() => rm(temporary, { recursive: true, force: true }))
  const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
  await write(d.repo, 'site/en/alternate.md', (await readFile(join(d.repo, 'site/en/build-pipeline.md'), 'utf8')).replace('Pipeline example', 'Alternate example').replace('pipeline-public.md', 'alternate-public.md'))
  await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'existing alternate source'); d.commit = await git(d.repo, 'rev-parse', 'HEAD')
  for (const page of ['build-pipeline', 'shared-target']) await write(d.sharedDocs, `pages/${page}/lock.yaml`, JSON.stringify({ schema_version: 1, current: d.commit, next: d.commit }))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'old mapping')
  const before = await git(root, 'rev-parse', 'HEAD')
  await write(d.sharedDocs, 'pages/build-pipeline/page.yaml', (await readFile(join(d.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')).replace('site/en/build-pipeline.md', 'site/en/alternate.md'))
  await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'Cloud remapping')
  await write(d.repo, 'irrelevant.txt', 'unrelated source advance'); await git(d.repo, 'add', '.'); await git(d.repo, 'commit', '-qm', 'unrelated')
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const out = join(root, 'report')
  expect(await runUpdate({ sharedDocs: d.sharedDocs, repo: d.repo, dev: d.dev, out, comparisonMasterSha: before }, () => {}, root,
    { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })).toBe(0)
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8')), page = report.pages.find((p: any) => p.pageId === 'build-pipeline')
  expect(page.sourceChanged).toBe(false); expect(page.proposedNext).toBeNull()
  expect(page.configurationChanges).toContain('shared-docs/guides/pages/build-pipeline/page.yaml')
}, 120_000)

it.each(['dev', 'master', 'source'].flatMap(role => ['bare', 'separate', 'linked'].map(layout => ({ role, layout }))))(
  'protects actual $role Git metadata for $layout repositories before writing', async ({ role, layout }) => {
    const temporary = await mkdtemp(join(tmpdir(), 'update-metadata-')); onTestFinished(() => rm(temporary, { recursive: true, force: true }))
    const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
    await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'config')
    let target = role === 'dev' ? d.dev : role === 'source' ? d.repo : root
    if (layout === 'bare') {
      const bare = join(root, `${role}-bare.git`)
      await git(root, 'clone', '--bare', target, bare); target = bare
    } else {
      const metadata = join(root, `${role}-metadata`)
      await git(target, 'init', '--separate-git-dir', metadata)
      if (layout === 'linked') {
        const linked = join(root, `${role}-linked`)
        await git(target, 'worktree', 'add', '--detach', linked); target = linked
      }
    }
    const master = role === 'master' ? target : root
    const options = { sharedDocs: join(master, 'shared-docs/guides'), repo: role === 'source' ? target : d.repo,
      dev: role === 'dev' ? target : d.dev, out: '' }
    const refs = await git(target, 'show-ref')
    for (const option of ['--git-dir', '--git-common-dir']) {
      const metadata = await git(target, 'rev-parse', '--path-format=absolute', option)
      const out = join(metadata, 'objects/review-report')
      expect(await runUpdate({ ...options, out }, () => {}, master)).toBe(2)
      await expect(readFile(join(out, 'report.json'))).rejects.toMatchObject({ code: 'ENOENT' })
      await expect(readdir(out)).rejects.toMatchObject({ code: 'ENOENT' })
    }
    expect(await git(target, 'show-ref')).toBe(refs)
  }, 120_000)

it.each(['invalid-yaml', 'missing-replacement', 'selected-independent'])(
  'preserves the full configured inventory and independent output after %s', async failure => {
    const temporary = await mkdtemp(join(tmpdir(), 'update-isolation-')); onTestFinished(() => rm(temporary, { recursive: true, force: true }))
    const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
    await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'valid config')
    await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
    const deps = { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) }
    const options = { sharedDocs: d.sharedDocs, repo: d.repo, dev: d.dev, out: join(root, 'baseline') }
    expect(await runUpdate(options, () => {}, root, deps)).toBe(0)
    const baseline = JSON.parse(await readFile(join(options.out, 'report.json'), 'utf8'))
    expect(baseline.counts).toMatchObject({ configured: 2, analyzed: 2, outputs: 4 })
    expect(baseline.pages.every((p: any) => p.status === 'analyzed')).toBe(true)
    const yaml = await readFile(join(d.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')
    await write(d.sharedDocs, 'pages/build-pipeline/page.yaml', failure === 'missing-replacement'
      ? yaml + '\ntransforms:\n  - operation: replace\n    target: {block: connect}\n    content: {file: missing.md}\n' : 'this: [invalid yaml')
    await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'one invalid page')
    const out = join(root, 'isolated')
    expect(await runUpdate({ ...options, out, ...(failure === 'selected-independent' ? { pages: 'shared-target' } : {}) }, () => {}, root, deps)).toBe(0)
    const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
    expect(report.counts).toMatchObject({ configured: 2, analyzed: 1, outputs: 2, selected: failure === 'selected-independent' ? 1 : 2 })
    expect(report.infrastructureErrors).toEqual([])
    expect(report.pages.find((p: any) => p.pageId === 'shared-target').status).toBe('analyzed')
    const invalid = report.pages.find((p: any) => p.pageId === 'build-pipeline')
    expect(invalid.status).toBe(failure === 'selected-independent' ? 'not-selected' : 'content-failure')
    expect(invalid.configurationErrors.some((e: any) => e.code === (failure === 'missing-replacement' ? 'TRANSFORM_CONTENT_NOT_FOUND' : 'CONFIG_SYNTAX_INVALID'))).toBe(true)
    expect(invalid.lifecycle.state).toBe('unknown')
    expect(report.impact.pages[0].pageId).toBe('shared-target')
    const plan = JSON.parse(await readFile(join(out, 'plan.json'), 'utf8'))
    expect(plan.operations).toEqual([]); expect(plan.pages).toHaveLength(2)
    expect(plan.pages.every((p: any) => !p.futureEligible)).toBe(true)
  }, 120_000)

it('does not let an invalid shared target silently fall through to a same-name Cloud page', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'update-dependency-')); onTestFinished(() => rm(temporary, { recursive: true, force: true }))
  const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'valid config')
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const deps = { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) }
  const options = { sharedDocs: d.sharedDocs, repo: d.repo, dev: d.dev, out: join(root, 'baseline') }
  expect(await runUpdate(options, () => {}, root, deps)).toBe(0)
  expect(JSON.parse(await readFile(join(options.out, 'report.json'), 'utf8')).counts).toMatchObject({ configured: 2, analyzed: 2, outputs: 4 })
  await write(d.sharedDocs, 'pages/shared-target/page.yaml', 'broken: [yaml')
  await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'broken shared dependency')
  const out = join(root, 'broken-target')
  expect(await runUpdate({ ...options, out, pages: 'build-pipeline' }, () => {}, root, deps)).toBe(0)
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report.counts).toMatchObject({ configured: 2, selected: 1, analyzed: 1, outputs: 0 })
  expect(report.infrastructureErrors).toEqual([])
  expect(report.pages.find((p: any) => p.pageId === 'build-pipeline').status).toBe('content-failure')
  expect(report.impact.pages[0].errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'UPDATE_CONFIGURATION_DEPENDENCY_UNAVAILABLE',
    detail: { target: 'public-target.md#Target--API', invalidPages: ['shared-target'] } })]))
}, 120_000)

it('reports global configuration errors separately from Git/API failures and allows disjoint linked-worktree evidence', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'update-global-')); onTestFinished(() => rm(temporary, { recursive: true, force: true }))
  const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'valid config')
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  await git(root, 'init', '--separate-git-dir', join(root, 'master-metadata'))
  const linked = join(root, 'linked-master')
  await git(root, 'worktree', 'add', '--detach', linked)
  const options = { sharedDocs: join(linked, 'shared-docs/guides'), repo: d.repo, dev: d.dev, out: join(linked, '.claude/report') }
  const deps = { fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) }
  expect(await runUpdate(options, () => {}, linked, deps)).toBe(0)
  expect(JSON.parse(await readFile(join(options.out, 'report.json'), 'utf8')).counts).toMatchObject({ configured: 2, analyzed: 2, outputs: 4 })
  await write(options.sharedDocs, 'source.yaml', 'source: [broken')
  await git(linked, 'add', 'shared-docs'); await git(linked, 'commit', '-qm', 'invalid group source')
  const out = join(linked, '.claude/invalid-group')
  expect(await runUpdate({ ...options, out }, () => {}, linked, deps)).toBe(0)
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report.counts).toMatchObject({ configured: 2, analyzed: 0 })
  expect(report.infrastructureErrors).toEqual([])
  expect(report.configurationErrors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'CONFIG_SYNTAX_INVALID' })]))
  expect(report.pages.every((p: any) => p.status === 'content-failure' && p.lifecycle.state === 'unknown')).toBe(true)
}, 120_000)

async function caseAliasFixture() {
  const temporary = await mkdtemp(join(tmpdir(), 'update-case-alias-'))
  onTestFinished(() => rm(temporary, { recursive: true, force: true }))
  const d = await createBuildDemo(temporary), root = dirname(dirname(d.sharedDocs))
  await git(root, 'init', '-q', '-b', 'master'); await git(root, 'add', 'shared-docs'); await git(root, 'commit', '-qm', 'config')
  await git(d.repo, 'remote', 'add', 'origin', 'https://github.com/milvus-io/milvus-docs')
  const bare = join(root, 'dev.git'), alias = join(root, 'DEV.GIT')
  await git(root, 'clone', '--bare', d.dev, bare)
  let aliasPath: string | undefined
  try { aliasPath = await realpath(alias) }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  return { root, bare, alias, aliases: aliasPath === await realpath(bare),
    options: { sharedDocs: d.sharedDocs, repo: d.repo, dev: bare, out: '', pages: 'shared-target' },
    deps: { fetcher: { async fetch(): Promise<Uint8Array> { throw new Error('Case-alias fixture must not access the network') } } } }
}

for (const state of ['absent', 'existing-empty']) it(`rejects case-aliased Git metadata with ${state} output on a case-insensitive filesystem`, async context => {
  const f = await caseAliasFixture()
  if (!f.aliases) { context.skip('Filesystem is case-sensitive: alias scenario not executed'); return }
  expect(await realpath(f.alias)).toBe(await realpath(f.bare))
  const out = join(f.alias, 'objects', 'review-report'), actual = join(f.bare, 'objects', 'review-report')
  if (state === 'existing-empty') await mkdir(out)
  const refs = await git(f.bare, 'show-ref'), objects = await readdir(join(f.bare, 'objects'))
  expect(await runUpdate({ ...f.options, out }, () => {}, f.root, f.deps)).toBe(2)
  if (state === 'existing-empty') expect(await readdir(actual)).toEqual([])
  else await expect(readdir(actual)).rejects.toMatchObject({ code: 'ENOENT' })
  expect(await readdir(join(f.bare, 'objects'))).toEqual(objects)
  expect(await git(f.bare, 'show-ref')).toBe(refs)
}, 120_000)

it('allows a genuinely distinct case-variant directory on a case-sensitive filesystem', async context => {
  const f = await caseAliasFixture()
  if (f.aliases) { context.skip('Filesystem is case-insensitive: distinct-directory scenario not executed'); return }
  await mkdir(f.alias)
  expect(await realpath(f.alias)).not.toBe(await realpath(f.bare))
  const out = join(f.alias, 'objects', 'review-report'), refs = await git(f.bare, 'show-ref')
  expect(await runUpdate({ ...f.options, out }, () => {}, f.root, f.deps)).toBe(0)
  expect((await readdir(out)).sort()).toEqual(['pins.json', 'plan.json', 'report.json', 'report.md'])
  await expect(readdir(join(f.bare, 'objects', 'review-report'))).rejects.toMatchObject({ code: 'ENOENT' })
  expect(await git(f.bare, 'show-ref')).toBe(refs)
}, 120_000)
