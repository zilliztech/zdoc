// @vitest-environment node
import {execFileSync} from 'node:child_process'
import {mkdir, mkdtemp, realpath, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {afterEach, expect, it} from 'vitest'
import {observeBatchScopeSourceReads} from '../../adapters/updates/batch-scope-source-reads'
import type {BatchScopeInput} from '../../core/updates/batch-scope'

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, {recursive: true, force: true}) })

async function repository() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'zdoc-scope-source-')))
  roots.push(root)
  const git = (...args: string[]) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim()
  git('init', '-b', 'main')
  git('config', 'user.name', 'Scope Fixture')
  git('config', 'user.email', 'scope@example.invalid')
  async function put(path: string, text: string) {
    const file = join(root, path)
    await mkdir(dirname(file), {recursive: true})
    await writeFile(file, text, 'utf8')
  }
  function commit(message: string) {
    git('add', '-A')
    git('commit', '-qm', message)
    return git('rev-parse', 'HEAD')
  }
  return {root, git, put, commit}
}

async function fixture(transforms?: 'clean' | 'include', largeLeaf = false) {
  const source = await repository(), zdoc = await repository(), fragment = 'site/en/fragments/selected.md'
  await source.put(fragment, 'Before {{var.product}}\n')
  await source.put('site/en/fragments/outer.md', '{{fragments/selected.md}}\n')
  await source.put('site/en/consumer.md', '# Consumed\n{{fragments/outer.md}}\n')
  await source.put('site/en/leaf.md', '# No include\n{{var.product}}\n' + (largeLeaf ? 'x'.repeat(1024 * 1024) : ''))
  await source.put('site/en/partial.md', '{{fragments/unknown.md}}\n')
  await source.put('site/en/transform.md', '<!-- doc:block:start id="content" -->\n## Transform present\n\nBody.\n<!-- doc:block:end id="content" -->\n')
  const before = source.commit('before')
  await source.put(fragment, 'After {{var.product}}\n')
  const after = source.commit('after')
  const input: BatchScopeInput = {pins: {master: '', dev: '', source: after}, pages: [],
    history: [{oid: before, parents: [], tree: source.git('rev-parse', `${before}^{tree}`)}, {oid: after, parents: [before], tree: source.git('rev-parse', `${after}^{tree}`)}],
    seeds: [{number: 1, mergeCommit: after, firstParent: before, head: after, commitCount: 1}],
    edges: [{parent: before, commit: after, changes: [{path: fragment, before: source.git('rev-parse', `${before}:${fragment}`),
      after: source.git('rev-parse', `${after}:${fragment}`), beforeMode: '100644', afterMode: '100644'}]}]}
  await zdoc.put('shared-docs/guides/Variables.json', JSON.stringify({product: 'Milvus'}))
  if (transforms) {
    await zdoc.put('shared-docs/guides/presentation/cloud-sdk-tabs.yaml',
      'schema_version: 1\ngroup_id: code\ndefault: python\nlanguages:\n  - value: python\n    label: Python\n')
    await zdoc.put('shared-docs/guides/pages/transform/cloud.md', transforms === 'include' ? '{{fragments/selected.md}}\n' : 'Published replacement.\n')
  }
  for (const pageId of ['consumer', 'leaf', 'partial', 'transform']) {
    const sourceFile = `site/en/${pageId}.md`, name = `shared-docs/guides/pages/${pageId}`
    await zdoc.put(`${name}/page.yaml`, JSON.stringify({schema_version: 1, source: {file: sourceFile}, publish: [{manual: 'guides', path: pageId}],
      ...(pageId === 'transform' ? {transforms: [{operation: 'replace', target: {block: 'content'}, content: {file: 'cloud.md'}}]} : {})}))
    await zdoc.put(`${name}/lock.yaml`, JSON.stringify({schema_version: 1, current: before, next: before}))
    input.pages.push({pageId, sourceFile, current: before, oldNext: before, evidence: ['pinned-fixture']})
  }
  input.pins.master = input.pins.dev = zdoc.commit('configuration')
  return {zdocRepository: zdoc.root, sourceRepository: source.root, input, before, after, fragment}
}

it('runs the official recursive preprocessor for each real Git endpoint and keeps partial or transformed negatives unknown', async () => {
  const f = await fixture()
  const result = await observeBatchScopeSourceReads(f)
  expect(result.sourceReads.counts).toEqual({read: 2, absent: 2, unknown: 4})
  expect(result.sourceReads.points.filter(point => point.pageId === 'consumer')).toMatchObject([
    {state: 'read', path: f.fragment, commit: expect.any(String), oid: expect.stringMatching(/^[0-9a-f]{40}$/)},
    {state: 'read', path: f.fragment, commit: expect.any(String), oid: expect.stringMatching(/^[0-9a-f]{40}$/)},
  ])
  const page = (id: string) => result.report.pages.find(row => row.pageId === id)
  expect(page('consumer')).toMatchObject({disposition: 'full', sourceObligations: 'hit'})
  expect(page('leaf')).toMatchObject({disposition: 'unknown', sourceObligations: 'disjoint'})
  expect(page('partial')?.sourceObligations).toBe('possible-fragment')
  expect(page('transform')?.sourceObligations).toBe('possible-fragment')
})

it('keeps a claimed edge OID or registry source that differs from Git unknown', async () => {
  const f = await fixture()
  f.input.edges[0].changes![0].after = 'a'.repeat(40)
  f.input.pages.find(row => row.pageId === 'leaf')!.sourceFile = 'site/en/consumer.md'
  const result = await observeBatchScopeSourceReads(f)
  expect(result.sourceReads.points.find(row => row.pageId === 'consumer' && row.commit === f.after)?.state).toBe('unknown')
  expect(result.sourceReads.points.filter(row => row.pageId === 'leaf').every(row => row.state === 'unknown')).toBe(true)
})

it('proves transformed absence only when both actual planning paths and their Git snippets are closed', async () => {
  const clean = await observeBatchScopeSourceReads(await fixture('clean'))
  expect(clean.sourceReads.points.filter(row => row.pageId === 'transform')).toMatchObject([
    {state: 'absent', reason: 'COMPLETE_TRANSFORM_FRAGMENT_READS'}, {state: 'absent', reason: 'COMPLETE_TRANSFORM_FRAGMENT_READS'},
  ])
  expect(clean.report.pages.find(row => row.pageId === 'transform')).toMatchObject({sourceObligations: 'disjoint', disposition: 'unknown'})
  const possible = await observeBatchScopeSourceReads(await fixture('include'))
  expect(possible.sourceReads.points.filter(row => row.pageId === 'transform')).toMatchObject([
    {state: 'unknown', reason: 'GENERATED_FRAGMENT_POSSIBLE'}, {state: 'unknown', reason: 'GENERATED_FRAGMENT_POSSIBLE'},
  ])
})

it('records an oversized root as unknown and keeps bounded reads for other pages', async () => {
  const result = await observeBatchScopeSourceReads(await fixture(undefined, true))
  const oversized = result.sourceReads.points.filter(row => row.pageId === 'leaf')
  expect(oversized).toHaveLength(2)
  expect(oversized.every(row => row.state === 'unknown' && row.reason === 'SOURCE_ROOT_LIMIT')).toBe(true)
  expect(result.sourceReads.points.filter(row => row.pageId === 'consumer').every(row => row.state === 'read')).toBe(true)
})
