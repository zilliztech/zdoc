// @vitest-environment node
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { imageDigest } from '../../core/links'
import { RealMd2md } from '../../adapters/md2md'
import { createBuildDemo, git, write, externalImage, imageBytes, pageYaml } from '../build/demo'
import { buildPage, createBuildReader, createBuildRuntime } from '../../adapters/build-page'
import { FakeImageFetcher } from '../../adapters/images'
import { createZdocContentReader } from '../../adapters/zdoc-content'
import { createGuidesSnapshot, guidesSnapshotPath } from '../../adapters/guides-snapshot'
import { collectUpdateInputs, readUpdateConfiguration } from '../../adapters/update-inputs'
import { analyzeUpdates, renderImpactJson, renderImpactMarkdown } from '../../core/updates/impact'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'shared-impact-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const demo = await createBuildDemo(root)
  const reader = createBuildReader(demo.repo)
  onTestFinished(() => reader.dispose())
  const canonicalRoot = dirname(dirname(demo.sharedDocs))
  const config = await readUpdateConfiguration(demo.sharedDocs, canonicalRoot)
  if ('errors' in config) throw new Error(JSON.stringify(config.errors))
  const versions = { master: demo.commit, dev: demo.devCommit, tools: { zdoc: demo.commit, md2md: '1.3.0' } }
  const build = async ({ pageId, sharedDocs, observe }: Parameters<NonNullable<Parameters<typeof collectUpdateInputs>[0]['build']>>[0]) => {
    const runtime = createBuildRuntime({ sharedDocs, reader, fetcher: new FakeImageFetcher(new Map([[externalImage, imageBytes]])),
      guides: createGuidesSnapshot(demo.dev), zdoc: new Map(['guides', 'guides-byoc'].map(manual => [manual,
        createZdocContentReader({ checkout: demo.dev, manualDirectory: `content/en/${manual === 'guides' ? 'guides' : 'byoc'}` })])) })
    return buildPage({ pageId, sharedDocs, reader, md2md: new RealMd2md(), runtime, observe })
  }
  const collect = (commit = demo.commit, candidateConfig = config, observe = true) => collectUpdateInputs({ versions, reader, md2md: new RealMd2md(),
    pages: [{ pageId: 'build-pipeline', oldNext: { commit: demo.commit, configuration: config }, current: { commit: demo.commit, configuration: config },
      candidateNext: { commit, configuration: candidateConfig } }], ...(observe ? { build } : {}) })
  const change = async (file: string, mutate: (text: string) => string) => {
    await write(demo.repo, file, mutate(await readFile(join(demo.repo, file), 'utf8')))
    await git(demo.repo, 'add', '.'); await git(demo.repo, 'commit', '--quiet', '-m', 'Synthetic impact change')
    return git(demo.repo, 'rev-parse', 'HEAD')
  }
  return { ...demo, config, versions, collect, change, root: canonicalRoot, reader, build }
}

it('reports ordinary raw and actual manual deltas deterministically with separate comparison axes', async () => {
  const f = await fixture()
  const commit = await f.change('site/en/build-pipeline.md', text => text.replace('Use {{VAR.Cloud.Product}}', 'Now use {{var.cloud.Product}}'))
  const input = await f.collect(commit)
  expect(Object.isFrozen(input.pages[0].candidateNext)).toBe(true)
  const report = analyzeUpdates(input)
  expect(report.pages[0].sourceImpact.candidate).toBe(true)
  expect(report.pages[0].sourceImpact.axis).toBe('old-next-to-target')
  expect(report.pages[0].promotion.axis).toBe('current-to-candidate-next')
  expect(report.pages[0].sourceImpact.outputChanged).toBe(true)
  expect(report.pages[0].sourceImpact.changes.some(change => change.kind === 'source')).toBe(true)
  expect(renderImpactJson(analyzeUpdates(await f.collect(commit)))).toBe(renderImpactJson(report))
  expect(renderImpactMarkdown(report)).toContain('old-next-to-target')
  expect(report.input.versions).toEqual(f.versions)
})

it('does not create candidates for irrelevant commits or unused fragments and variables', async () => {
  const f = await fixture()
  const commit = await f.change('site/en/fragments/unused.md', text => text + 'Unused change.\n')
  const input = await f.collect(commit)
  expect(analyzeUpdates(input).pages[0].sourceImpact).toMatchObject({ candidate: false, outputChanged: false, changes: [] })
  await write(f.sharedDocs, 'Variables.json', JSON.stringify({ ...f.config.sharedDocs.variables, unused: 'changed' }))
  const config = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in config) throw new Error('Bad configuration')
  expect(analyzeUpdates(await f.collect(commit, config)).pages[0].sourceImpact.candidate).toBe(false)
})

it('retains overwritten raw blocks and full changed code groups with neighboring Markdown', async () => {
  const f = await fixture()
  const pageFile = join(f.sharedDocs, 'pages/build-pipeline/page.yaml')
  const text = await readFile(pageFile, 'utf8')
  await write(f.sharedDocs, 'pages/build-pipeline/page.yaml', text + '\ntransforms:\n  - operation: replace\n    target: {block: connect}\n    content: {file: replacement.md}\n')
  await write(f.sharedDocs, 'pages/build-pipeline/replacement.md', '```python\nstable()\n```\n')
  const config = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in config) throw new Error(JSON.stringify(config))
  const collect = (commit: string) => collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build, pages: [{ pageId: 'build-pipeline',
    oldNext: { commit: f.commit, configuration: config }, current: { commit: f.commit, configuration: config }, candidateNext: { commit, configuration: config } }] })
  const commit = await f.change('site/en/build-pipeline.md', value => value.replace('connect("{{var.cloud.region}}")', 'changed("{{var.cloud.region}}")'))
  const report = analyzeUpdates(await collect(commit))
  expect(report.pages[0].sourceImpact.candidate).toBe(true)
  expect(report.pages[0].sourceImpact.outputChanged).toBe(false)
  expect(report.pages[0].sourceImpact.blocks.some(block => block.id === 'connect')).toBe(true)
  const codeCommit = await f.change('site/en/build-pipeline.md', value => value.replace('changed("{{var.cloud.region}}")', 'changed("new-region")'))
  const code = analyzeUpdates(await collect(codeCommit)).pages[0].sourceImpact.blocks.find(block => block.type === 'code-group')!
  expect(code.after!.text).toContain('```python')
  expect(code.after!.text).toContain('```java')
  expect(code.after!.contextBefore).toContain('Local & API')
})

it('compares used dependency values and keeps missing source, block and line diagnostics', async () => {
  const f = await fixture()
  const commit = await f.change('site/en/fragments/used.md', text => text.replace('A fragment', 'Changed fragment'))
  expect(analyzeUpdates(await f.collect(commit)).pages[0].sourceImpact.changes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'fragment' })]))
  await write(f.sharedDocs, 'Variables.json', JSON.stringify({ Cloud: { Product: 'Zilliz Cloud', Region: 'ap-south' } }))
  const config = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in config) throw new Error('Bad config')
  expect(analyzeUpdates(await f.collect(commit, config)).pages[0].sourceImpact.changes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'variable', identity: 'cloud.region' })]))
  await git(f.repo, 'rm', 'site/en/build-pipeline.md'); await git(f.repo, 'commit', '--quiet', '-m', 'Delete source')
  const missing = analyzeUpdates(await f.collect(await git(f.repo, 'rev-parse', 'HEAD')))
  expect(missing.pages[0].sourceImpact.outputChanged).toBe('unknown')
  expect(missing.pages[0].errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'CONFIG_SOURCE_NOT_FOUND', file: 'site/en/build-pipeline.md' })]))
})

it('rejects duplicate or incomplete identities instead of inventing fixed input evidence', async () => {
  const f = await fixture()
  const input = await f.collect()
  expect(() => analyzeUpdates({ ...input, pages: [...input.pages, ...input.pages] })).toThrow(/duplicate/i)
  expect(() => analyzeUpdates({ ...input, versions: { ...input.versions, master: '' } })).toThrow(/master/i)
  expect(() => analyzeUpdates({ ...input, pages: [{ ...input.pages[0], current: undefined } as never] })).toThrow(/current/i)
  const badReader = { ...f.reader, readFile: async () => { throw new Error('infrastructure unavailable') } }
  await expect(collectUpdateInputs({ versions: f.versions, reader: badReader, md2md: new RealMd2md(), pages: [{ pageId: 'build-pipeline',
    oldNext: { commit: f.commit, configuration: f.config }, current: { commit: f.commit, configuration: f.config }, candidateNext: { commit: f.commit, configuration: f.config } }] })).rejects.toThrow('infrastructure unavailable')
})


it('retains actual missing transform block and line origins as unknown output', async () => {
  const f = await fixture()
  for (const target of ['{block: absent}', '{block: connect, language: python, lines: "missing_selector()"}']) {
    await write(f.sharedDocs, 'pages/build-pipeline/page.yaml', (await readFile(join(f.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')).split('\ntransforms:')[0] + `\ntransforms:\n  - operation: remove\n    target: ${target}\n`)
    const config = await readUpdateConfiguration(f.sharedDocs, f.root)
    if ('errors' in config) throw new Error(JSON.stringify(config))
    const report = analyzeUpdates(await f.collect(f.commit, config))
    expect(report.pages[0].sourceImpact.outputChanged).toBe('unknown')
    expect(report.pages[0].errors).toEqual(expect.arrayContaining([expect.objectContaining({
      code: target.includes('absent') ? 'TRANSFORM_TARGET_NOT_FOUND' : 'LINE_NOT_FOUND',
      file: 'shared-docs/guides/pages/build-pipeline/page.yaml', line: expect.any(Number),
    })]))
  }
})

it('includes dependencies introduced by Cloud transforms as well as hidden raw dependencies', async () => {
  const f = await fixture()
  await write(f.repo, 'site/en/fragments/injected.md', 'Injected {{var.cloud.extra}}.\n')
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '--quiet', '-m', 'Synthetic transform dependency baseline')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  const original = await readFile(join(f.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')
  await write(f.sharedDocs, 'pages/build-pipeline/page.yaml', original + '\ntransforms:\n  - operation: add\n    target: {block: connect}\n    position: before\n    content: {file: dependency.md}\n')
  await write(f.sharedDocs, 'pages/build-pipeline/dependency.md', '{{fragments/injected.md}}\n')
  await write(f.sharedDocs, 'Variables.json', JSON.stringify({ Cloud: { Product: 'Zilliz Cloud', Region: 'eu-west', Extra: 'first value' } }))
  const config = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in config) throw new Error(JSON.stringify(config))
  const collect = (commit: string, nextConfig = config) => collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
    pages: [{ pageId: 'build-pipeline', oldNext: { commit: baseline, configuration: config }, current: { commit: baseline, configuration: config }, candidateNext: { commit, configuration: nextConfig } }] })
  const commit = await f.change('site/en/fragments/injected.md', text => text.replace('Injected', 'Changed injected'))
  const fragment = analyzeUpdates(await collect(commit)).pages[0]
  expect(fragment.errors).toEqual([])
  expect(fragment.sourceImpact).toMatchObject({ candidate: true, outputChanged: true })
  expect(fragment.sourceImpact.changes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'fragment', identity: 'site/en/fragments/injected.md' })]))
  await write(f.sharedDocs, 'Variables.json', JSON.stringify({ Cloud: { Product: 'Zilliz Cloud', Region: 'eu-west', Extra: 'second value' } }))
  const variables = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in variables) throw new Error(JSON.stringify(variables))
  expect(analyzeUpdates(await collect(baseline, variables)).pages[0].sourceImpact.changes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'variable', identity: 'cloud.extra' })]))
})

it('derives multi-page adoption units from actual renamed anchors and references', async () => {
  const f = await fixture()
  const targetFile = 'site/en/source-target.md'
  const before = (await readFile(join(f.repo, targetFile), 'utf8')).replace('## Target & API', '<!-- doc:block:start id="target-section" -->\n## Target & API') + '<!-- doc:block:end id="target-section" -->\n'
  await write(f.repo, targetFile, before)
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '--quiet', '-m', 'Synthetic stable section baseline')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  await write(f.repo, targetFile, before.replace('## Target & API', '## Target & Client'))
  await f.change('site/en/build-pipeline.md', text => text.replace('public-target.md#Target--API', 'public-target.md#Target--Client'))
  const candidate = await git(f.repo, 'rev-parse', 'HEAD')
  const input = await collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
    pages: ['build-pipeline', 'shared-target'].map(pageId => ({ pageId, oldNext: { commit: baseline, configuration: f.config },
      current: { commit: baseline, configuration: f.config }, candidateNext: { commit: candidate, configuration: f.config } })) })
  const report = analyzeUpdates(input)
  expect(report.pages.flatMap(page => page.errors)).toEqual([])
  expect(report.pages.find(page => page.pageId === 'shared-target')!.promotion.anchors).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'renamed', status: 'confirmed', manual: 'guides' })]))
  expect(report.units).toHaveLength(1)
  expect(report.units[0].pages).toHaveLength(4)
  expect(report.units[0].dependencies).toHaveLength(2)
  const dependency = report.units[0].dependencies[0]
  expect(() => analyzeUpdates({ ...input, adoptionDependencies: [{ ...dependency, evidence: { ...dependency.evidence,
    reference: { ...dependency.evidence.reference, url: '/unrelated#target-and-client' } } }] })).toThrow(/not present/)
})

it('reports complete multilingual code groups even without named markers', async () => {
  const f = await fixture()
  const baseline = await f.change('site/en/build-pipeline.md', text => text.replace(/^<!-- doc:block:.*-->\n/gm, ''))
  const candidate = await f.change('site/en/build-pipeline.md', text => text.replace('connect("{{var.cloud.region}}")\n', 'changed("{{var.cloud.region}}")\n'))
  const input = await collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), pages: [{ pageId: 'build-pipeline',
    oldNext: { commit: baseline, configuration: f.config }, current: { commit: baseline, configuration: f.config }, candidateNext: { commit: candidate, configuration: f.config } }] })
  const code = analyzeUpdates(input).pages[0].sourceImpact.blocks.find(block => block.type === 'code-group')!
  expect(code.after!.text).toContain('class="multipleCode"')
  expect(code.after!.text).toContain('```java')
  expect(code.after!.text).toContain('```python')
})


it('closes actual slug-route adoption across different publication directories', async () => {
  const f = await fixture()
  await write(f.repo, 'site/en/source.md', '---\nid: source.md\ntitle: Source\nsummary: Source example.\n---\n\n# Source\n\n[Target](target.md#Old)\n')
  const targetBefore = '---\nid: target.md\ntitle: Target\nsummary: Target example.\n---\n\n# Target\n\n<!-- doc:block:start id="section" -->\n## Old\n\nStable target context.\n<!-- doc:block:end id="section" -->\n'
  await write(f.repo, 'site/en/target.md', targetBefore)
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '--quiet', '-m', 'Synthetic cross-directory adoption baseline')
  const baseline = await git(f.repo, 'rev-parse', 'HEAD')
  for (const [pageId, path] of [['source', 'tutorials/source'], ['target', 'concepts/target']]) {
    await write(f.sharedDocs, `pages/${pageId}/page.yaml`, pageYaml(`site/en/${pageId}.md`, path))
    for (const physical of ['guides', 'byoc']) await write(f.dev, `content/en/${physical}/${path}.mdx`, `---\nslug: /${pageId}\ntitle: ${pageId}\n---\n\nExisting content.\n`)
  }
  const snapshot = JSON.parse(await readFile(join(f.dev, guidesSnapshotPath), 'utf8'))
  snapshot.records.push(...['source', 'target'].map(slug => ({ record_id: `cross-directory-${slug}`, slug, placement_type: 'canonical', release_channel: 'CURRENT', publish_targets: ['Zilliz.SaaS'], output_paths: [] })))
  await write(f.dev, guidesSnapshotPath, JSON.stringify(snapshot))
  await git(f.dev, 'add', '.'); await git(f.dev, 'commit', '--quiet', '-m', 'Synthetic cross-directory publication inputs')
  const versions = { ...f.versions, dev: await git(f.dev, 'rev-parse', 'HEAD') }
  const configuration = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in configuration) throw new Error(JSON.stringify(configuration.errors))
  await write(f.repo, 'site/en/target.md', targetBefore.replace('## Old', '## Renamed'))
  const candidate = await f.change('site/en/source.md', text => text.replace('target.md#Old', 'target.md#Renamed'))
  const input = await collectUpdateInputs({ versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
    pages: ['source', 'target'].map(pageId => ({ pageId, oldNext: { commit: baseline, configuration }, current: { commit: baseline, configuration }, candidateNext: { commit: candidate, configuration } })) })
  const source = input.pages.find(page => page.pageId === 'source')!
  expect(source.candidateNext.manuals.every(manual => manual.output!.includes('slug: /source') && manual.output!.includes('[Target](./target#renamed)'))).toBe(true)
  const report = analyzeUpdates(input)
  expect(report.pages.flatMap(page => page.errors)).toEqual([])
  expect(report.units).toHaveLength(1)
  expect(report.units[0].pages).toEqual([
    { pageId: 'source', manual: 'guides', path: 'tutorials/source' },
    { pageId: 'source', manual: 'guides-byoc', path: 'tutorials/source' },
    { pageId: 'target', manual: 'guides', path: 'concepts/target' },
    { pageId: 'target', manual: 'guides-byoc', path: 'concepts/target' },
  ])
  expect(report.units[0].dependencies).toHaveLength(2)
  const relation = report.pages.find(page => page.pageId === 'target')!.promotion.anchors.find(relation => relation.manual === 'guides')!
  const reference = source.candidateNext.manuals.find(manual => manual.manual === 'guides')!.references.find(reference => reference.url === './target#renamed')!
  const explicit = { from: { pageId: 'source', manual: 'guides', path: 'tutorials/source' }, to: { pageId: 'target', manual: 'guides', path: 'concepts/target' }, evidence: { axis: 'current-to-candidate-next' as const, relation, reference } }
  expect(analyzeUpdates({ ...input, adoptionDependencies: [explicit] }).units).toEqual(report.units)
})


it('retains unresolved raw variables hidden by replacement without aborting a page batch', async () => {
  const f = await fixture()
  const original = await readFile(join(f.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')
  await write(f.sharedDocs, 'pages/build-pipeline/page.yaml', original + '\ntransforms:\n  - operation: replace\n    target: {block: connect}\n    content: {file: replacement.md}\n')
  await write(f.sharedDocs, 'pages/build-pipeline/replacement.md', '```python\nstable()\n```\n')
  const configuration = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in configuration) throw new Error(JSON.stringify(configuration))
  const candidate = await f.change('site/en/build-pipeline.md', text => text.replace('connect("{{var.cloud.region}}")', 'connect("{{var.cloud.missing}}")'))
  const raw = await readFile(join(f.repo, 'site/en/build-pipeline.md'), 'utf8')
  const line = raw.split('\n').findIndex(line => line.includes('cloud.missing')) + 1
  const input = await collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
    pages: ['build-pipeline', 'shared-target'].map(pageId => ({ pageId, oldNext: { commit: f.commit, configuration }, current: { commit: f.commit, configuration }, candidateNext: { commit: candidate, configuration } })) })
  const missing = input.pages.find(page => page.pageId === 'build-pipeline')!.candidateNext
  expect(missing.outputStatus).toBe('observed')
  expect(missing.errors).toEqual([])
  expect(missing.rawErrors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'VAR_MISSING', file: 'site/en/build-pipeline.md', line })]))
  expect(missing.dependencies).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'variable', identity: 'cloud.missing', state: 'unresolved', sha256: null })]))
  const report = analyzeUpdates(input)
  expect(report.pages.find(page => page.pageId === 'build-pipeline')!.sourceImpact).toMatchObject({ candidate: true, outputChanged: false })
  expect(report.pages.find(page => page.pageId === 'build-pipeline')!.sourceImpact.changes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'variable', identity: 'cloud.missing', beforeState: 'absent', afterState: 'unresolved', before: null, after: null })]))
  expect(report.pages.find(page => page.pageId === 'shared-target')!.sourceImpact).toMatchObject({ candidate: false, outputChanged: false })
  expect(renderImpactMarkdown(report)).toContain('VAR_MISSING')
  expect(renderImpactJson(analyzeUpdates(await collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
    pages: ['build-pipeline', 'shared-target'].map(pageId => ({ pageId, oldNext: { commit: f.commit, configuration }, current: { commit: f.commit, configuration }, candidateNext: { commit: candidate, configuration } })) })))).toBe(renderImpactJson(report))
})

it('compares unresolved variable value and absence transitions while preserving successful hidden output', async () => {
  const f = await fixture()
  const page = await readFile(join(f.sharedDocs, 'pages/build-pipeline/page.yaml'), 'utf8')
  const originalSource = await readFile(join(f.repo, 'site/en/build-pipeline.md'), 'utf8')
  const missingCommit = await f.change('site/en/build-pipeline.md', text => text.replace('connect("{{var.cloud.region}}")', 'connect("{{var.cloud.missing}}")'))
  const restoredCommit = await f.change('site/en/build-pipeline.md', () => originalSource)
  await write(f.sharedDocs, 'pages/build-pipeline/page.yaml', page + '\ntransforms:\n  - operation: replace\n    target: {block: connect}\n    content: {file: replacement.md}\n')
  await write(f.sharedDocs, 'pages/build-pipeline/replacement.md', '```python\nstable()\n```\n')
  const missing = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in missing) throw new Error(JSON.stringify(missing))
  await write(f.sharedDocs, 'Variables.json', JSON.stringify({ ...missing.sharedDocs.variables, Cloud: { ...(missing.sharedDocs.variables.Cloud as object), Missing: 'A resolved raw value' } }))
  const resolved = await readUpdateConfiguration(f.sharedDocs, f.root)
  if ('errors' in resolved) throw new Error(JSON.stringify(resolved))
  for (const [before, after, beforeState, afterState] of [[missing, resolved, 'unresolved', 'resolved'], [resolved, missing, 'resolved', 'unresolved']] as const) {
    const input = await collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
      pages: [{ pageId: 'build-pipeline', oldNext: { commit: missingCommit, configuration: before }, current: { commit: missingCommit, configuration: before }, candidateNext: { commit: missingCommit, configuration: after } }] })
    const report = analyzeUpdates(input)
    expect(report.pages[0].errors).toEqual([])
    expect(report.pages[0].sourceImpact).toMatchObject({ candidate: true, outputChanged: false })
    expect(report.pages[0].sourceImpact.changes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'variable', identity: 'cloud.missing', beforeState, afterState })]))
  }
  const input = await collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
    pages: [{ pageId: 'build-pipeline', oldNext: { commit: missingCommit, configuration: missing }, current: { commit: missingCommit, configuration: missing }, candidateNext: { commit: restoredCommit, configuration: missing } }] })
  expect(analyzeUpdates(input).pages[0].sourceImpact.changes).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'variable', identity: 'cloud.missing', beforeState: 'unresolved', afterState: 'absent' })]))
})

it('keeps an unhidden missing variable as an actual failed build with unknown output while another page succeeds', async () => {
  const f = await fixture()
  const candidate = await f.change('site/en/build-pipeline.md', text => text.replace('connect("{{var.cloud.region}}")', 'connect("{{var.cloud.missing}}")'))
  const input = await collectUpdateInputs({ versions: f.versions, reader: f.reader, md2md: new RealMd2md(), build: f.build,
    pages: ['build-pipeline', 'shared-target'].map(pageId => ({ pageId, oldNext: { commit: f.commit, configuration: f.config }, current: { commit: f.commit, configuration: f.config }, candidateNext: { commit: candidate, configuration: f.config } })) })
  const report = analyzeUpdates(input)
  expect(report.pages.find(page => page.pageId === 'build-pipeline')!.sourceImpact.outputChanged).toBe('unknown')
  expect(report.pages.find(page => page.pageId === 'build-pipeline')!.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'VAR_MISSING' })]))
  expect(input.pages.find(page => page.pageId === 'shared-target')!.candidateNext.outputStatus).toBe('observed')
})

it('tracks used image byte changes with actual preparation origins and immutable readable evidence', async () => {
  const f = await fixture()
  await write(f.repo, 'site/en/assets/unused.png', new Uint8Array([1, 2, 3]))
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '--quiet', '-m', 'Synthetic unused image change')
  const unused = await git(f.repo, 'rev-parse', 'HEAD')
  const changedBytes = new Uint8Array([137, 80, 78, 71, 9, 8, 7])
  await write(f.repo, 'site/en/assets/diagram.png', changedBytes)
  await git(f.repo, 'add', '.'); await git(f.repo, 'commit', '--quiet', '-m', 'Synthetic used image bytes only')
  const candidate = await git(f.repo, 'rev-parse', 'HEAD')
  expect(analyzeUpdates(await f.collect(unused)).pages[0].sourceImpact).toMatchObject({ candidate: false, outputChanged: false, changes: [] })
  const input = await f.collect(candidate)
  const image = input.pages[0].candidateNext.images.find(image => image.original === 'assets/diagram.png')!
  expect(image.origin).toEqual({ kind: 'repository', commit: candidate, path: 'site/en/assets/diagram.png' })
  expect(image.observed).toEqual({ sha256: imageDigest(changedBytes), bytes: changedBytes.byteLength })
  expect(image.emitted).toEqual({ sha256: imageDigest(changedBytes), address: `shared/${imageDigest(changedBytes)}.png` })
  expect(image.uses.map(use => use.manual).sort()).toEqual(['guides', 'guides-byoc'])
  expect(image.uses.every(use => use.source?.file === 'site/en/build-pipeline.md')).toBe(true)
  const external = input.pages[0].candidateNext.images.find(image => image.original === externalImage)!
  expect(external.origin).toEqual({ kind: 'external', uri: externalImage, policy: 'paired-read' })
  expect(external.observed).toEqual({ sha256: imageDigest(imageBytes), bytes: imageBytes.byteLength })
  expect(external.uses).toHaveLength(4)
  expect(Object.isFrozen(image.observed)).toBe(true)
  const report = analyzeUpdates(input)
  expect(report.pages[0].sourceImpact).toMatchObject({ candidate: true, outputChanged: true })
  expect(report.pages[0].sourceImpact.changes).toEqual([expect.objectContaining({ kind: 'image', identity: 'site/en/assets/diagram.png', before: imageDigest(imageBytes), after: imageDigest(changedBytes), beforeState: 'resolved', afterState: 'resolved', image: expect.objectContaining({ before: expect.any(Object), after: image }) })])
  expect(renderImpactJson(analyzeUpdates(await f.collect(candidate)))).toBe(renderImpactJson(report))
  expect(renderImpactMarkdown(report)).toContain('site/en/assets/diagram.png')
  expect(renderImpactMarkdown(report)).toContain('paired-read')
  expect(renderImpactMarkdown(report)).toContain(imageDigest(changedBytes))
  const withoutBuild = await f.collect(candidate, f.config, false)
  expect(withoutBuild.pages[0].candidateNext.imageStatus).toBe('unavailable')
  expect(withoutBuild.pages[0].candidateNext.images).toEqual([])
})
