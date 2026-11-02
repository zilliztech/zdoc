// @vitest-environment node
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished } from 'vitest'
import { createBuildDemo, git, write, externalImage, imageBytes } from '../build/demo'
import { FakeImageFetcher } from '../../adapters/images'
import { readUpdateConfiguration } from '../../adapters/update-inputs'
import { collectCandidate } from '../../adapters/updates/candidate'
import { analyzeUpdates } from '../../core/updates/impact'
import { discoverPage } from '../../core/updates/discovery'
it('collects actual old/current/target bytes and outputs while retaining hidden source changes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'update-candidate-')); onTestFinished(() => rm(root, { recursive: true, force: true }))
  const demo = await createBuildDemo(root)
  const configRoot = dirname(dirname(demo.sharedDocs))
  await write(demo.sharedDocs, 'pages/build-pipeline/page.yaml', (await readFile(join(demo.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')) + '\ntransforms:\n  - operation: replace\n    target: {block: connect}\n    content: {file: replacement.md}\n')
  await write(demo.sharedDocs, 'pages/build-pipeline/replacement.md', '```python\nfixed()\n```\n')
  const config = await readUpdateConfiguration(demo.sharedDocs, configRoot); if ('errors' in config) throw new Error(JSON.stringify(config.errors))
  await write(demo.repo, 'site/en/build-pipeline.md', (await readFile(join(demo.repo, 'site/en/build-pipeline.md'), 'utf8')).replaceAll('connect(', 'changed('))
  await git(demo.repo, 'commit', '-qam', 'hidden source update'); const target = await git(demo.repo, 'rev-parse', 'HEAD')
  const input = await collectCandidate({ repo: demo.repo, dev: demo.dev, pageId: 'build-pipeline', current: demo.commit, oldNext: demo.commit,
    target, configuration: config, previousConfiguration: config, versions: { master: demo.commit, dev: demo.devCommit, tools: { md2md: '1.3.0' } },
    fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })
  const page = input.pages[0], impact = analyzeUpdates(input)
  expect(page.current.source?.text).toContain('connect('); expect(page.candidateNext.source?.text).toContain('changed(')
  expect(page.candidateNext.manuals).toHaveLength(2); expect(page.candidateNext.images.length).toBeGreaterThan(0)
  expect(impact.pages[0].sourceImpact).toMatchObject({ candidate: true, outputChanged: false })
  expect(discoverPage(page, impact.pages[0], { state: 'unknown', reasons: ['NO_EVIDENCE'] })).toMatchObject({ sourceChanged: true,
    proposedNext: { current: demo.commit, oldNext: demo.commit, next: target }, futureEligible: false })
}, 120_000)

it('reports mutable external image bytes at the same source SHA without proposing next', async () => {
  const root = await mkdtemp(join(tmpdir(), 'update-image-')); onTestFinished(() => rm(root, { recursive: true, force: true }))
  const d = await createBuildDemo(root), config = await readUpdateConfiguration(d.sharedDocs, dirname(dirname(d.sharedDocs)))
  if ('errors' in config) throw new Error('fixture')
  let calls = 0
  const input = await collectCandidate({ repo: d.repo, dev: d.dev, pageId: 'build-pipeline', current: d.commit, oldNext: d.commit, target: d.commit,
    configuration: config, previousConfiguration: config, versions: { master: d.commit, dev: d.devCommit, tools: { md2md: '1.3.0' } },
    fetcher: { async fetch() { calls++; return calls <= 2 ? imageBytes : new Uint8Array([...imageBytes, 42]) } } })
  const impact = analyzeUpdates(input)
  expect(calls).toBe(6)
  expect(impact.pages[0].sourceImpact.changes.some(c => c.kind === 'image' && c.image?.after?.origin.kind === 'external')).toBe(true)
  expect(discoverPage(input.pages[0], impact.pages[0], { state: 'active', reasons: [] }).proposedNext).toBeNull()
}, 120_000)
