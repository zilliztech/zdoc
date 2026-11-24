// @vitest-environment node
import {execFileSync} from 'node:child_process'
import {mkdir, mkdtemp, realpath, rm, symlink, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {afterEach, expect, it} from 'vitest'
import {collectBatchScopeEvidence} from '../../adapters/updates/batch-scope-evidence'
import {BatchGitStore, batchBudget} from '../../adapters/updates/batch-source'

const roots: string[] = []
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, {recursive: true, force: true})
})

async function repository() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'zdoc-scope-evidence-')))
  roots.push(root)
  const git = (...args: string[]) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim()
  git('init', '-b', 'main')
  git('config', 'user.name', 'Scope Fixture')
  git('config', 'user.email', 'scope@example.invalid')
  async function put(path: string, value: string) {
    const file = join(root, path)
    await mkdir(dirname(file), {recursive: true})
    await writeFile(file, value)
  }
  function commit(message: string) {
    git('add', '-A')
    git('commit', '-qm', message)
    return git('rev-parse', 'HEAD')
  }
  return {root, git, put, commit}
}

async function fixture() {
  const source = await repository(), zdoc = await repository()
  const page = 'site/en/pinned.md', fragment = 'site/en/fragments/temporary.md'
  await source.put(page, 'original\n')
  const current = source.commit('current')
  await source.put(page, 'next\n')
  const next = source.commit('next')
  source.git('switch', '-qc', 'topic')
  await source.put(fragment, 'transient\n')
  const topic = source.commit('add transient fragment')
  source.git('switch', '-q', 'main')
  await source.put(page, 'later root\n')
  const first = source.commit('edit root independently')
  // Keep the first parent's tree, so the transient fragment is absent at both
  // oldNext and S and its removal exists only on the merge's second-parent edge.
  source.git('merge', '-q', '--no-ff', '-s', 'ours', 'topic', '-m', 'merge topic')
  const target = source.git('rev-parse', 'HEAD')
  await zdoc.put('shared-docs/guides/source.yaml', JSON.stringify({schema_version: 1, repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x'}))
  for (const [pageId, oldNext] of [['pinned', next], ['bad-range', 'a'.repeat(40)]]) {
    const prefix = `shared-docs/guides/pages/${pageId}/`
    await zdoc.put(prefix + 'page.yaml', JSON.stringify({schema_version: 1, source: {file: page}, publish: [{manual: 'guides', path: `tutorials/${pageId}`}]}))
    await zdoc.put(prefix + 'lock.yaml', JSON.stringify({schema_version: 1, current, next: oldNext}))
  }
  const master = zdoc.commit('registry')
  await zdoc.put('shared-docs/guides/pages/pinned/page.yaml', 'publication branch and checkout are outside M')
  const dev = zdoc.commit('unrelated working tree')
  return {source, zdoc, current, next, topic, first, fragment, target, pins: {master, dev, source: target}}
}

it('reads the pinned registry and every parent edge, including a transient intermediate file', async () => {
  const f = await fixture()
  const result = await collectBatchScopeEvidence({zdocRepository: f.zdoc.root, sourceRepository: f.source.root, pins: f.pins})
  expect(result.pins).toEqual(f.pins)
  expect(result.pages).toMatchObject([
    {pageId: 'bad-range', reasons: ['SOURCE_NOT_ANCESTOR']},
    {pageId: 'pinned', sourceFile: 'site/en/pinned.md', current: f.current, oldNext: f.next, reasons: []},
  ])
  expect(result.history.find(row => row.oid === f.target)).toEqual({oid: f.target, parents: [f.first, f.topic], tree: f.source.git('rev-parse', `${f.target}^{tree}`)})
  expect(result.edges).toHaveLength(4)
  const fragmentOid = f.source.git('rev-parse', `${f.topic}:${f.fragment}`)
  expect(result.edges).toEqual(expect.arrayContaining([
    {parent: f.first, commit: f.target, changes: []},
    {parent: f.next, commit: f.topic, changes: [{path: f.fragment, before: null, after: fragmentOid, beforeMode: null, afterMode: '100644'}]},
    {parent: f.topic, commit: f.target, changes: expect.arrayContaining([{path: f.fragment, before: fragmentOid, after: null, beforeMode: '100644', afterMode: null}])},
  ]))
})

it('holds when the exact dev object is unavailable', async () => {
  const f = await fixture()
  const options = {zdocRepository: f.zdoc.root, sourceRepository: f.source.root, pins: {...f.pins, dev: 'a'.repeat(40)}}
  await expect(collectBatchScopeEvidence(options)).rejects.toThrow('GIT_OBJECT_UNAVAILABLE')
})

it('records an unsupported edge separately from an authenticated empty delta', async () => {
  const f = await fixture()
  await symlink('pinned.md', join(f.source.root, 'site/en/pointer.md'))
  const source = f.source.commit('add nonregular input')
  const result = await collectBatchScopeEvidence({zdocRepository: f.zdoc.root, sourceRepository: f.source.root, pins: {...f.pins, source}})
  expect(result.edges).toEqual(expect.arrayContaining([
    {parent: f.first, commit: f.target, changes: []},
    {parent: f.target, commit: source, changes: null},
  ]))
})

it('can diff authenticated tree entries without a blob; a missing tree still leaves that edge unknown', async () => {
  const f = await fixture()
  const blob = f.source.git('rev-parse', f.topic + ':' + f.fragment)
  const object = (oid: string) => join(f.source.root, '.git/objects', oid.slice(0, 2), oid.slice(2))
  await rm(object(blob))
  const options = {zdocRepository: f.zdoc.root, sourceRepository: f.source.root, pins: f.pins}
  const report = await collectBatchScopeEvidence(options)
  const edge = report.edges.find(e => e.parent === f.next && e.commit === f.topic)
  expect(edge?.changes).toEqual([{path: f.fragment, before: null, after: blob, beforeMode: null, afterMode: '100644'}])
  const strict = await BatchGitStore.open(f.source.root, batchBudget())
  await expect(strict.delta(f.next, f.topic)).rejects.toThrow('GIT_OBJECT_UNAVAILABLE')
  const tree = f.source.git('rev-parse', f.topic + ':site/en/fragments')
  await rm(object(tree))
  const missing = await collectBatchScopeEvidence(options)
  expect(missing.edges.find(e => e.parent === f.next && e.commit === f.topic)?.changes).toBeNull()
})

it('holds a tree-identity edge with a non-regular entry', async () => {
  const repo = await repository()
  await repo.put('page.md', 'source')
  const start = repo.commit('start')
  await symlink('page.md', join(repo.root, 'alias.md'))
  const end = repo.commit('symbolic link')
  const store = await BatchGitStore.open(repo.root, batchBudget())
  await expect(store.treeIdentityDelta(start, end)).rejects.toThrow('GIT_PATH_TYPE_INVALID')
})

it('reads registered Cloud references from both current and next channel outputs at the pinned dev', async () => {
  const f = await fixture()
  const ids = ['pinned', 'bad-range']
  const active = ids.map(page => ({page, record: 'rec-' + page, feishu_token: null, anchors: {}, activated_in: '123'}))
  await f.zdoc.put('generated/en/manifests/shared-pages/guides/active.json', JSON.stringify({schema_version: 1, pages: active}))
  const records = ids.map((id, i) => ({
    record_id: 'rec-' + id, slug: id, release_channel: i === 0 ? 'current' : 'next', placement_type: 'canonical',
    source_kind: 'shared-page', shared_page: {group: 'guides', page: id, inputs_sha256: 'a'.repeat(64),
      record: 'generated/en/manifests/shared-pages/guides/' + id + '.json'},
    doc_link: 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/' + id,
    doc_token: null, source_file: null, source_hash: null, node_metadata: null, outgoing_tokens: [],
    publish_targets: ['Zilliz.SaaS'], output_paths: ['content/en/guides/tutorials/' + id + '.md'],
  }))
  await f.zdoc.put('packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json', JSON.stringify({
    schema_version: 3, build_env: 'uat', manual: 'guides', source_branch: 'dev', targets_built: ['zilliz.saas'], records,
  }))
  for (const [i, row] of records.entries()) {
    await f.zdoc.put(row.output_paths[0], '[peer](./' + ids[1-i] + '#anchor)\n[external](https://example.org/pinned)\n')
  }
  const dev = f.zdoc.commit('published views')
  await f.zdoc.put(records[0].output_paths[0], 'uncommitted new view')
  const evidence = await collectBatchScopeEvidence({zdocRepository: f.zdoc.root, sourceRepository: f.source.root, pins: {...f.pins, dev}})
  expect(evidence.publicationReasons).toEqual([])
  for (const [i, pageId] of ids.entries()) {
    const path = records[i].output_paths[0]
    expect(evidence.publications).toContainEqual({pageId, outputsRead: 1, reasons: []})
    expect(evidence.pages.find(page => page.pageId === pageId)?.publishedReferences).toEqual([{
      manual: 'guides', dev, targetPageId: ids[1-i], anchor: 'anchor', outputPath: path, outputOid: f.zdoc.git('rev-parse', dev + ':' + path),
    }])
  }
})
