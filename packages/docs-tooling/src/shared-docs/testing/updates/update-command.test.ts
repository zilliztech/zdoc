// @vitest-environment node
import { mkdtemp, rm, readFile, readdir, symlink } from 'node:fs/promises'
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
