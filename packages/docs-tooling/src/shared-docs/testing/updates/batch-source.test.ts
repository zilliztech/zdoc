// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { BatchGitStore, batchBudget, batchRenderCommitSet, measureBatchRenderFragments } from '../../adapters/updates/batch-source'

import { collectBatchDiscovery } from '../../adapters/updates/batch-discovery'
import { guidesSnapshotPath } from '../../adapters/guides-snapshot'
import { validateSharedSnapshotRecord } from '../../core/handoff/source-state'
import type { RemoteTransport } from '../../adapters/updates/remote-github'

const roots: string[] = []
afterEach(async () => { for (const path of roots.splice(0)) await rm(path, { recursive: true, force: true }) })
async function repository() {
  const root = await mkdtemp(join(tmpdir(), 'batch-raw-git-')); roots.push(root)
  const git = (...args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  git('init', '-b', 'main'); git('config', 'user.name', 'Tests'); git('config', 'user.email', 'test@example.com')
  async function change(name: string, data: string) {
    const path = join(root, name)
    await mkdir(join(path, '..'), { recursive: true }); await writeFile(path, data)
    git('add', '--', name); git('commit', '-m', 'change'); return git('rev-parse', 'HEAD')
  }
  return { root, git, change }
}

it('binds exact bytes and both sides of changes across a merge DAG and overlapping intervals', async () => {
  const r = await repository(), base = await r.change('root.md', '  v1\r\n\n')
  r.git('checkout', '-b', 'side'); const side = await r.change('fragments/part.md', 'part')
  r.git('checkout', 'main'); const main = await r.change('root.md', 'v2')
  r.git('merge', '--no-ff', 'side', '-m', 'merge'); const target = r.git('rev-parse', 'HEAD')
  const store = await BatchGitStore.open(r.root, batchBudget()), history = await store.history(target)
  expect(history.range(base, target).sort()).toEqual([main, side, target].sort())
  expect(history.range(main, target).sort()).toEqual([side, target].sort())
  expect(() => history.range(main, side)).toThrow('SOURCE_NOT_ANCESTOR')
  expect((await store.file(base, 'root.md')).bytes.toString()).toBe('  v1\r\n\n')
  expect(await store.delta(base, main)).toEqual([{ path: 'root.md', before: r.git('rev-parse', base + ':root.md'),
    after: r.git('rev-parse', main + ':root.md'), beforeMode: '100644', afterMode: '100644' }])
  expect(await store.delta(main, target)).toMatchObject([{ path: 'fragments/part.md', before: null }])
})

it.each(['commit', 'tree', 'blob'])('rejects different raw %s bytes stored at a requested object ID', async kind => {
  const r = await repository(), a = await r.change('root.md', 'A'), b = await r.change('root.md', 'B')
  const object = (rev: string) => kind === 'commit' ? rev : r.git('rev-parse', rev + (kind === 'tree' ? '^{tree}' : ':root.md'))
  const loose = (id: string) => join(r.root, '.git/objects', id.slice(0, 2), id.slice(2))
  const destination = loose(object(a))
  await rm(destination); await writeFile(destination, await readFile(loose(object(b))))
  const store = await BatchGitStore.open(r.root, batchBudget())
  await expect(store.file(a, 'root.md')).rejects.toThrow()
})

it.each(['shallow', 'grafts', 'replace'])('holds %s stores', async mutation => {
  const r = await repository(), a = await r.change('a', 'a'), b = await r.change('b', 'b')
  if (mutation === 'replace') r.git('replace', a, b)
  else await writeFile(join(r.root, '.git', mutation === 'grafts' ? 'info/grafts' : 'shallow'), a + '\n')
  await expect(BatchGitStore.open(r.root, batchBudget())).rejects.toThrow()
})

it('rejects symlinks, missing files and retargeted metadata', async () => {
  const r = await repository(); await r.change('a', 'a')
  await symlink('a', join(r.root, 'link')); r.git('add', 'link'); r.git('commit', '-m', 'link')
  const store = await BatchGitStore.open(r.root, batchBudget()), head = r.git('rev-parse', 'HEAD')
  await expect(store.file(head, 'link')).rejects.toThrow()
  await expect(store.file(head, 'missing')).rejects.toThrow()
  await writeFile(join(r.root, '.git/info/grafts'), head)
  await expect(store.verify()).rejects.toThrow()
})

it('excludes shared ancestors reached through a pre-oldNext side branch while including its actual new commits', async () => {
  const r = await repository(), fork = await r.change('base', 'old'), oldNext = await r.change('base', 'new')
  r.git('checkout', '-b', 'topic', fork); const side = await r.change('side', 'one')
  r.git('checkout', 'main'); r.git('merge', '--no-ff', 'topic', '-m', 'merge')
  const target = r.git('rev-parse', 'HEAD'), store = await BatchGitStore.open(r.root, batchBudget()), history = await store.history(target)
  expect(history.range(oldNext, target).sort()).toEqual([target, side].sort())
  expect(history.introduces(side, target, oldNext, side, 1)).toBe(true)
  expect(history.introduces(oldNext, target, oldNext, side, 1)).toBe(false)
  expect(history.introduces(target, target, oldNext, fork, 1)).toBe(false)
})

it('measures each stopped-history snapshot through shared authenticated fragment trees', async () => {
  const r = await repository()
  const absent = await r.change('README.md', 'initial')
  const fragment = 'site/en/fragments/part.md'
  const ancestor = await r.change(fragment, 'base')
  const current = await r.change('site/en/current.md', 'current')
  const oldNext = await r.change('site/en/current.md', 'next')
  r.git('checkout', '-b', 'topic', ancestor)
  const intermediate = 'intermediate fragment edit'
  const changed = [await r.change(fragment, intermediate)]
  for (let n = 0; n < 10; n++) changed.push(await r.change('site/en/topic.md', String(n)))
  const restored = await r.change(fragment, 'base')
  r.git('checkout', 'main'); r.git('merge', '--no-ff', 'topic', '-m', 'merge')
  const target = r.git('rev-parse', 'HEAD')
  const history = await (await BatchGitStore.open(r.root, batchBudget())).history(target)
  // The side branch bypasses current. Its path through ancestor and absent contributes snapshots.
  expect(batchRenderCommitSet(history.records(), current, oldNext, target))
    .toEqual([absent, ancestor, oldNext, ...changed, restored, target].sort())
  expect(history.range(oldNext, target).sort()).toEqual([...changed, restored, target].sort())

  const log = join(r.root, 'git-calls')
  const bin = join(r.root, 'bin')
  const git = execFileSync('which', ['git'], {encoding: 'utf8'}).trim()
  const quote = (path: string) => "'" + path.replaceAll("'", "'\\''") + "'"
  await mkdir(bin)
  await writeFile(join(bin, 'git'), '#!/bin/sh\nprintf "%s\\n" "$*" >> ' + quote(log) + '\nexec ' + quote(git) + ' "$@"\n', {mode: 0o700})
  vi.stubEnv('PATH', bin + ':' + process.env.PATH)
  try {
    expect(await measureBatchRenderFragments(r.root, [current, oldNext, target])).toEqual({
      bytes: intermediate.length, count: 9, snapshots: 3 + 3 + changed.length,
      endpoints: {bytes: 12, count: 9},
      sequential: [
        {commit: absent, bytes: 0, count: 1},
        {commit: ancestor, bytes: 4, count: 3},
        {commit: restored, bytes: 4, count: 3},
        ...changed.map(commit => ({commit, bytes: intermediate.length, count: 3})),
      ].sort((a, b) => a.commit.localeCompare(b.commit)),
    })
    const calls = (await readFile(log, 'utf8')).split('\n')
    expect(calls.filter(line => line.includes(' cat-file ')).length).toBeLessThan(12)
  } finally { vi.unstubAllEnvs() }
})

it('proves squash and rebased introductions without requiring the original PR head to survive at T', async () => {
  const r = await repository(), base = await r.change('a', '0'), first = await r.change('a', '1'), tip = await r.change('a', '2')
  const history = await (await BatchGitStore.open(r.root, batchBudget())).history(tip), original = 'c'.repeat(40)
  expect(history.introduces(tip, tip, base, original, 7)).toBe(true)
  expect(history.introduces(first, tip, base, original, 2)).toBe(true)
  expect(history.introduces(base, tip, base, original, 3)).toBe(false)
  expect(history.introduces(first, tip, 'e'.repeat(40), original, 2)).toBe(false)
})

it('shares Git byte and wall-time allowances across stores and object reads', async () => {
  const r = await repository(), oid = await r.change('a', 'old'), budget = batchBudget()
  const store = await BatchGitStore.open(r.root, budget)
  budget.gitBytes = 64 * 1024 * 1024 - 4
  await expect(store.file(oid, 'a')).rejects.toThrow('GIT_BYTE_LIMIT')
  budget.remaining = () => { throw new Error('deadline') }
  await expect(store.verify()).rejects.toThrow()
})

async function inventoryFixture(scenario: string) {
  const source = await repository(), zdoc = await repository()
  const fragment = 'site/en/fragments/shared.md'
  // #3707's topic merge 37f5505d imported primary-field.md from v3.0.x. Its PR files
  // include prepare-source-data.md, while primary-field.md has identical lock/target bytes.
  const sync = scenario.startsWith('3707-'), secondParent = scenario === 'second-parent-lock'
  const sourcePath = sync ? 'site/en/userGuide/schema/primary-field.md' : 'site/en/a.md'
  const prPath = sync ? 'site/en/userGuide/data-import/prepare-source-data.md' : sourcePath
  async function stageSecondRoot(bytes: string) {
    await mkdir(join(source.root, 'site/en'), { recursive: true })
    await writeFile(join(source.root, 'site/en/b.md'), bytes)
    source.git('add', 'site/en/b.md')
  }
  if (scenario === 'api-failed') await stageSecondRoot('old b')
  let old = await source.change(sourcePath, scenario === 'fragment' ? '{{fragments/shared.md}}' : 'hello\n')
  const unrelated = await source.change('unmapped', 'unrelated')
  let t: string, topic = '', syncCommit = ''
  if (sync) {
    source.git('checkout', '-b', 'topic'); await source.change(prPath, 'topic edit')
    source.git('checkout', 'main'); old = await source.change(sourcePath, 'base version')
    source.git('checkout', 'topic'); source.git('merge', '--no-ff', 'main', '-m', 'import base')
    syncCommit = source.git('rev-parse', 'HEAD')
    topic = scenario === '3707-later-edit' ? await source.change(sourcePath, 'later topic edit') : syncCommit
    source.git('checkout', 'main'); source.git('merge', '--no-ff', 'topic', '-m', 'merge topic')
    t = source.git('rev-parse', 'HEAD')
  } else if (secondParent) {
    source.git('checkout', '-b', 'side'); old = await source.change(sourcePath, 'lock version')
    source.git('checkout', 'main'); source.git('merge', '--no-ff', '-s', 'ours', 'side', '-m', 'resolve to first parent')
    t = source.git('rev-parse', 'HEAD')
  } else {
    if (scenario === 'api-failed') await stageSecondRoot('new b')
    t = await source.change(scenario.endsWith('fragment') ? fragment : sourcePath, 'updated\n')
  }
  async function put(path: string, value: unknown) {
    const name = join(zdoc.root, path)
    await mkdir(join(name, '..'), { recursive: true })
    await writeFile(name, typeof value === 'string' ? value : JSON.stringify(value))
  }
  const grouped = 'shared-docs/guides/', ids = ['a', 'b']
  await put(grouped + 'source.yaml', { schema_version: 1, repository: 'https://github.com/milvus-io/milvus-docs', track: 'v3.0.x' })
  for (const id of ids) {
    const prefix = grouped + 'pages/' + id + '/'
    await put(prefix + 'page.yaml', { schema_version: 1, source: { file: scenario === 'api-failed' && id === 'b' ? 'site/en/b.md' : sourcePath }, publish: [{ manual: 'guides', path: 'tutorials/' + id }] })
    if (id === 'a' && scenario.startsWith('variant-')) await put(prefix + scenario, 'unsupported')
    if (id !== 'b' || scenario !== 'bad-registry') await put(prefix + 'lock.yaml', { schema_version: 1, current: old, next: id === 'b' && !['inactive-member', 'api-failed', '3707-base-import'].includes(scenario) ? t : scenario === 'clean' ? unrelated : old })
  }
  zdoc.git('add', '.'); zdoc.git('commit', '-m', 'registry'); const m = zdoc.git('rev-parse', 'HEAD')
  const active = ids.map(page => ({ page, record: 'rec-' + page, feishu_token: null, anchors: {}, activated_in: '123' }))
  await put('generated/en/manifests/shared-pages/guides/active.json', { schema_version: 1, pages: scenario === 'inactive-member' ? active.slice(0, 1) : active })
  const records = ids.map(id => ({ record_id: 'rec-' + id, slug: id, release_channel: 'current', placement_type: 'canonical',
    source_kind: 'shared-page', shared_page: { group: 'guides', page: id, inputs_sha256: 'a'.repeat(64), record: 'generated/en/manifests/shared-pages/guides/' + id + '.json' },
    doc_link: 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/' + id,
    doc_token: null, source_file: null, source_hash: null, node_metadata: null, outgoing_tokens: [], publish_targets: ['Zilliz.SaaS'],
    output_paths: ['content/en/guides/tutorials/' + id + '.md'] }))
  if (scenario === 'node-record') {
    records[0].shared_page.group = 'node'
    records[0].shared_page.record = 'generated/en/manifests/shared-pages/node/a.json'
    records[0].doc_link = 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/node/pages/a'
  }
  if (scenario === 'record-mismatch') records[0].record_id = 'other-record'
  if (scenario === 'output-mismatch') records[0].output_paths.push('content/en/byoc/tutorials/a.md')
  if (scenario === 'channel-mismatch') records[0].release_channel = 'next'
  if (scenario === 'invalid-snapshot') records[0].shared_page.inputs_sha256 = 'bad'
  const ordinary = scenario.endsWith('-claim') ? [{ record_id: 'ordinary', slug: 'ordinary', placement_type: 'canonical',
    release_channel: scenario === 'ordinary-current-claim' ? 'current' : 'next', doc_token: 'ordinary-token',
    output_paths: [...records[0].output_paths] }] : []
  await put(guidesSnapshotPath, { manual: 'guides', schema_version: 3, build_env: 'uat', source_branch: 'dev', targets_built: ['zilliz.saas'], records: [...records, ...ordinary] })
  for (const id of ids) if (scenario !== 'missing-output' || id !== 'a') await put('content/en/guides/tutorials/' + id + '.md', 'published')
  zdoc.git('add', '.'); zdoc.git('commit', '-m', 'snapshot'); const d = zdoc.git('rev-parse', 'HEAD')
  await put(grouped + 'pages/a/page.yaml', 'invalid uncommitted config')
  let rounds = 0
  const repo = { id: 267273319, full_name: 'milvus-io/milvus-docs' }
  const transport: RemoteTransport = async ({ path, method }) => {
    expect(method).toBe('GET')
    if (path === '/repos/zilliztech/zdoc') rounds++
    const branch = path.split('/heads/')[1]
    const pr = { number: sync ? 3707 : 5, id: 55, state: 'closed', merged_at: '2026-01-01T00:00:00Z', merged: true,
      base: { repo, ref: 'v3.0.x', sha: old }, head: { repo: null, sha: topic || 'f'.repeat(40) }, merge_commit_sha: t, commits: 1, changed_files: scenario === '3707-later-edit' ? 2 : 1 }
    let data: unknown
    if (branch) data = { ref: 'refs/heads/' + branch, object: { type: 'commit', sha: branch === 'master' ? m : branch === 'dev'
      ? scenario === 'missing-dev' ? 'd'.repeat(40) : d : scenario === 'ref-moved' && rounds > 1 ? unrelated : t } }
    else if (path.includes('/commits/')) {
      if (scenario === 'api-failed' && path.includes(t)) return { status: 500, headers: {}, body: Buffer.from('private-token') }
      data = scenario === 'merged' && path.includes(t) || sync && (path.includes(syncCommit) || path.includes(topic) || path.includes(t)) ? [pr] : []
    } else if (path.endsWith('/pulls/' + pr.number)) data = pr
    else if (path.includes('/files?')) {
      const filenames = scenario === '3707-later-edit' ? [prPath, sourcePath] : [prPath]
      data = filenames.map(filename => ({ filename, sha: source.git('rev-parse', t + ':' + filename), status: 'modified' }))
    }
    else data = path.endsWith('zdoc') ? { id: 660446555, full_name: 'zilliztech/zdoc' } : repo
    return { status: 200, body: Buffer.from(JSON.stringify(data)), headers: {} }
  }
  const run = () => collectBatchDiscovery({ zdocRepository: zdoc.root, sourceRepository: scenario === 'missing-source' ? join(source.root, 'absent') : source.root,
    tools: old }, { transport })
  return { run, t, old, m, d, unrelated, records, source, zdoc, transport, sourcePath, syncCommit, rounds: () => rounds }
}

it('retains the raw lock-side edge of an ours merge even when its first parent has the target bytes', async () => {
  const f = await inventoryFixture('second-parent-lock'), report = await f.run()
  const before = f.source.git('rev-parse', f.old + ':' + f.sourcePath), after = f.source.git('rev-parse', f.t + ':' + f.sourcePath)
  expect(before).not.toBe(after)
  expect(report.changes.find(c => c.path === f.sourcePath)?.evidence).toContain(`edge:${f.old}:${f.t}:100644:${before}:100644:${after}`)
  expect(report.pages[0].intervals[0]).toMatchObject({ commits: [f.t], changePaths: [f.sourcePath], association: 'unknown' })
  expect(report.pages[0].reasons).not.toContain('NO_DIRECT_SOURCE_CHANGE')
  expect(report.groups.map(g => g.pageIds)).toEqual([['a']])
  expect(report.status).toBe('held')
})

it('keeps a #3707-style imported base path as a held clue without assigning the PR as a page seed', async () => {
  const f = await inventoryFixture('3707-base-import'), report = await f.run()
  const blob = (rev: string) => f.source.git('rev-parse', rev + ':' + f.sourcePath)
  expect(blob(f.syncCommit)).toBe(blob(f.syncCommit + '^2')); expect(blob(f.old)).toBe(blob(f.t))
  expect(blob(f.syncCommit)).not.toBe(blob(f.syncCommit + '^1'))
  expect(report.seeds.map(s => s.key)).toContain('pr:3707')
  for (const page of report.pages) {
    expect(page.seedKeys).toEqual([])
    expect(page.intervals[0]).toMatchObject({ commits: [f.syncCommit], changePaths: [f.sourcePath], association: 'unknown' })
    expect(report.dependencies).toContainEqual({ pageIds: [page.pageId], seedKeys: ['pr:3707'], paths: [f.sourcePath],
      evidence: ['git:' + f.syncCommit], reasons: ['PR_CHANGED_PATH_UNVERIFIED'] })
  }
  expect(report.groups.map(g => g.pageIds)).toEqual([['a', 'b']])
  expect(report.status).toBe('held')
})

it('keeps the imported transition uncertain when a later real PR edit also touches the same path', async () => {
  const f = await inventoryFixture('3707-later-edit'), report = await f.run()
  expect(report.pages[0].seedKeys).toEqual(['pr:3707'])
  expect(report.dependencies).toContainEqual({ pageIds: ['a'], seedKeys: ['pr:3707'], paths: [f.sourcePath],
    evidence: ['git:' + f.syncCommit], reasons: ['PR_CHANGED_PATH_UNVERIFIED'] })
  expect(report.pages[0].intervals[0].association).toBe('unknown')
})

it.each(['ordinary-current-claim', 'ordinary-next-claim'])('checks current shared output ownership across record types: %s', async scenario => {
  const f = await inventoryFixture(scenario), report = await f.run()
  expect(report.pages[1].published).toBe(true)
  if (scenario === 'ordinary-current-claim') {
    expect(report.pages[0].published).toBeNull()
    expect(report.reasons).toContain('PUBLISHED_OUTPUT_OWNERSHIP_AMBIGUOUS')
  } else expect(report.pages[0].published).toBe(true)
})

it('holds Guides publication inventory when a valid node record shares the Guides page and targets', async () => {
  const fixture = await inventoryFixture('node-record')
  const nodeRecord = fixture.records[0]
  expect(validateSharedSnapshotRecord(nodeRecord)).toBe(nodeRecord)
  const report = await fixture.run()
  expect(report.pages.find(page => page.pageId === 'a')).toMatchObject({ active: true, published: null })
  expect(report.reasons).toContain('PUBLISHED_INVENTORY_UNAVAILABLE')
  expect(report.status).toBe('held')
})

it.each(['direct', 'merged', 'ref-moved', 'api-failed', 'missing-source', 'missing-dev', 'bad-registry', 'record-mismatch',
  'output-mismatch', 'channel-mismatch', 'invalid-snapshot', 'missing-output', 'clean', 'fragment', 'inactive-member', 'variant-current.md', 'variant-next.provenance.json'])('assembles committed independent M/D/T inventory in the %s case', async scenario => {
  const f = await inventoryFixture(scenario)
  if (scenario === 'bad-registry') { await expect(f.run()).rejects.toThrow(/^[A-Z_]+$/); return }
  const report = await f.run(), [a, b] = report.pages
  expect(f.rounds()).toBe(2); expect(report.writeEligible).toBe(false)
  expect(report.inventory.configured).toBe(2); expect(report.pins.master).toBe(f.m); expect(report.tools).toBe(f.old)
  if (scenario === 'invalid-snapshot' || scenario === 'missing-dev') expect(report.inventory.publishedUnknown).toBe(2)
  else if (scenario === 'missing-output') expect(a.published).toBeNull()
  else if (scenario.endsWith('mismatch')) expect(a.published).toBe(false)
  else if (scenario === 'inactive-member') expect(report.inventory.published).toBe(1)
  else expect(report.inventory.published).toBe(2)
  if (scenario === 'ref-moved') expect(report.reasons).toContain('OBSERVED_REF_MOVED')
  if (scenario === 'api-failed') {
    expect(a.seedKeys).toEqual([]); expect(a.intervals[0].association).toBe('unknown')
    expect(b.intervals[0].commits).toContain(f.t); expect(b.seedKeys).toEqual([])
    expect(report.seeds).toEqual([])
    expect(report.groups.map(g => [g.pageIds, g.seedKeys])).toEqual([[['a', 'b'], []]])
    expect(report.dependencies).toContainEqual({ pageIds: ['a', 'b'], seedKeys: [], paths: [f.sourcePath, 'site/en/b.md'],
      evidence: ['git:' + f.t], reasons: ['METADATA_READ_FAILED'] })
    expect(report.reasons).toContain('METADATA_READ_FAILED'); expect(JSON.stringify(report)).not.toContain('private-token')
  }
  if (scenario === 'missing-source') { expect(a.intervals).toEqual([]); expect(a.reasons).not.toContain('NO_DIRECT_SOURCE_CHANGE'); return }
  if (scenario === 'merged' || scenario === 'direct') {
    expect(a.seedKeys).toEqual([scenario === 'merged' ? 'pr:5' : 'commit:' + f.t]); expect(a.intervals[0].commits).toEqual([f.t])
    expect(b.seedKeys).toEqual([]); expect(b.reasons).toContain('NO_DIRECT_SOURCE_CHANGE'); expect(report.groups[0].pageIds).toEqual(['a'])
    expect(report.reasons).toContain('UNMAPPED_SOURCE_CHANGE')
  }
  if (scenario === 'fragment') {
    expect(a.intervals[0].changePaths).toEqual(['site/en/fragments/shared.md'])
    expect(report.dependencies.some(clue => clue.pageIds.includes('a') && clue.reasons.includes('FRAGMENT_REQUIRES_COLLECTOR'))).toBe(true)
  }
  if (scenario.startsWith('variant-')) {
    expect(a.reasons).toContain('ADOPTED_VARIANT_UNSUPPORTED')
    expect(a.evidence.some(ref => ref.startsWith('variant:' + scenario + ':'))).toBe(true)
  }
  if (scenario === 'inactive-member') {
    expect(report.groups[0].pageIds).toEqual(['a', 'b'])
    expect(b.reasons).toContain('INACTIVE_NECESSARY_PAGE')
  }
  expect(report.status).toBe(scenario === 'clean' ? 'provisional' : 'held')
})

it('rejects a history exceeding the 50,000-commit traversal limit before consuming its bodies', { timeout: 30_000 }, async () => {
  const r = await repository()
  const commits = Array.from({ length: 50_001 }, (_, i) => 'commit refs/heads/long\ncommitter Test <test@example.com> ' + (1000 + i) + ' +0000\ndata 1\nx\n\n')
  execFileSync('git', ['-C', r.root, 'fast-import', '--quiet'], { input: commits.join(''), stdio: ['pipe', 'ignore', 'pipe'] })
  const store = await BatchGitStore.open(r.root, batchBudget())
  await expect(store.history(r.git('rev-parse', 'long'))).rejects.toThrow('SOURCE_HISTORY_LIMIT')
})

it('does not accept a regular tree entry with an unavailable object as a published output or source blob', async () => {
  const r = await repository(), tip = await r.change('page.md', 'doc'), oid = r.git('rev-parse', tip + ':page.md')
  await rm(join(r.root, '.git/objects', oid.slice(0, 2), oid.slice(2)))
  const store = await BatchGitStore.open(r.root, batchBudget())
  await expect(store.regularOid(tip, 'page.md')).rejects.toThrow('GIT_OBJECT_UNAVAILABLE')
  await expect(store.file(tip, 'page.md')).rejects.toThrow('GIT_OBJECT_UNAVAILABLE')
})

it('authenticates a private fragment ledger before any public group exists', async () => {
  const f = await inventoryFixture('orphan-fragment')
  const discovery = await import('../../adapters/updates/batch-discovery')
  expect(discovery.replayBatchDiscovery).toBeTypeOf('function')
  // The public report is intentionally insufficient to manufacture this operation ledger.
  expect(() => discovery.readBatchDiscoveryCapture(awaitablePlain())).toThrow()
  function awaitablePlain() {return {} as never}
  const captured = await discovery.replayBatchDiscovery({zdocRepository: f.zdoc.root, sourceRepository: f.source.root, tools: f.old},
    {fixtureBytes: Buffer.from('private-ledger'), replayClockMs: 0}, {transport: f.transport})
  const view = discovery.readBatchDiscoveryCapture(captured)
  expect(view.report.groups).toEqual([])
  const edge = view.ledger.find(e => e.newPath === 'site/en/fragments/shared.md')!
  expect(edge).toMatchObject({commit: f.t, associationResult: 'complete', seedKey: `commit:${f.t}`, introductionOid: f.t})
  expect(edge.rangeIds).toEqual(['a'])
  expect(edge.evidenceRefs.length).toBeGreaterThan(0)
  expect(view.origin.kind).toBe('replay')
  expect(() => discovery.readBatchDiscoveryCapture(view.report as never)).toThrow()

})

it('authenticates the complete per-commit source inventory from raw hashed trees', async () => {
  const r = await repository(), tip = await r.change('site/en/fragments/nested/item.md', 'raw fragment')
  const store = await BatchGitStore.open(r.root, batchBudget())
  expect(store.inventory).toBeTypeOf('function')
  const entries = await store.inventory(tip, 'site/en')
  expect(entries).toEqual([{path: 'site/en/fragments/nested/item.md', oid: r.git('rev-parse', tip + ':site/en/fragments/nested/item.md'), mode: '100644'}])
  await expect(store.inventory(tip, 'site/absent')).resolves.toEqual([])
})
