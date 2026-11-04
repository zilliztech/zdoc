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
it('does not propose next for unused dependencies or same-SHA used-variable changes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'update-discover-')); onTestFinished(() => rm(root, { recursive: true, force: true }))
  const d = await createBuildDemo(root), configRoot = dirname(dirname(d.sharedDocs))
  const old = await readUpdateConfiguration(d.sharedDocs, configRoot); if ('errors' in old) throw new Error('fixture')
  await write(d.repo, 'site/en/fragments/unused.md', 'unrelated\n'); await git(d.repo, 'commit', '-qam', 'unused')
  for (const changed of [false, true]) {
    if (changed) await write(d.sharedDocs, 'Variables.json', (await readFile(join(d.sharedDocs, 'Variables.json'), 'utf8')).replace('Zilliz Cloud', 'Cloud Changed'))
    const config = await readUpdateConfiguration(d.sharedDocs, configRoot); if ('errors' in config) throw new Error('fixture')
    const result = await collectCandidate({ repo: d.repo, dev: d.dev, pageId: 'build-pipeline', current: d.commit, oldNext: d.commit,
      target: changed ? d.commit : await git(d.repo, 'rev-parse', 'HEAD'), configuration: config, previousConfiguration: old,
      versions: { master: d.commit, dev: d.devCommit, tools: { md2md: "1.3.0" } }, fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])) })
    const decision = discoverPage(result.pages[0], analyzeUpdates(result).pages[0], { state: 'active', reasons: [] })
    expect(decision.proposedNext).toBeNull(); expect(decision.futureEligible).toBe(false)
    expect(decision.configurationChanges).toEqual(changed ? ['used-variables'] : [])
  }
}, 120_000)
