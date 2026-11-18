// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { runBuild } from '../commands/build'
import type { BuiltPage } from '../adapters/build-page'
import { guidesSnapshotPath } from '../adapters/guides-snapshot'
import type { SharedReceipt, SharedRenderTarget } from '../core/handoff/source-state'

const toolingRoot = resolve(import.meta.dirname, '../../../../..')
const launcher = join(toolingRoot, 'scripts/docs-tooling.js')
const require = createRequire(import.meta.url)
const { receiptProjection, renderIdentity } = require('../../lark/sharedPageRenderIdentity.js')
const group = 'shared-docs/guides'
const manifests = 'generated/en/manifests/shared-pages/guides'
const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const scratch: string[] = []
const readOnlyEvidence: string[] = []
vi.setConfig({ testTimeout: 60_000 })
const imageBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64')
const imageObject = `shared/${sha256(imageBytes)}.png`
const imageBase = 'https://images.example.invalid'
const images = [{ source: './diagram.png', sha256: sha256(imageBytes), object: imageObject }]

afterEach(() => {
  for (const root of readOnlyEvidence.splice(0)) {
    chmodSync(root, 0o755)
    chmodSync(join(root, 'evidence'), 0o755)
  }
  for (const root of scratch.splice(0)) rmSync(root, { recursive: true, force: true })
})

function git(root: string, ...args: string[]) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' })
}
function put(root: string, path: string, content: string | Buffer) {
  const file = join(root, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}
function init(root: string) {
  mkdirSync(root)
  git(root, 'init', '-q')
  git(root, 'config', 'user.name', 'Replay')
  git(root, 'config', 'user.email', 'replay@example.invalid')
}
function commit(root: string, message: string) {
  git(root, 'add', '.')
  git(root, 'commit', '-qm', message)
  return git(root, 'rev-parse', 'HEAD').trim()
}
function lock(a: string, b: string) { return `schema_version: 1\ncurrent: '${a}' # reviewed pin\nnext:    ${b}\n` }
function pageYaml(id: string) {
  return `schema_version: 1\nsource: {file: site/en/${id}.md}\npublish:\n  - {manual: guides, path: tutorials/${id}}\n  - {manual: guides-byoc, path: tutorials/${id}}\n`
}
function md(page: string, version: string, href?: string) {
  return [
    '---', `id: ${page}.md`, `title: Replay ${page}`, 'summary: Test page', '---', '',
    '## Setup', '', '<!-- doc:block:start id="sample-prose" -->', `Version ${version}. See [setup](#Setup).`,
    '<!-- doc:block:end id="sample-prose" -->', '', ...(href ? [`[Related page](${href})`, ''] : []), '![diagram](./diagram.png)', '',
    '```python', `version = "${version}"`, '```', '',
  ].join('\n')
}

function targetsFor(page: string): SharedRenderTarget[] {
  return ['guides', 'guides-byoc'].map(manual => ({
    manual, path: `tutorials/${page}`, extension: '.mdx', navigation: { sidebar_label: page, sidebar_position: 1 }, channel: 'current',
  }))
}

async function buildFixture(master: string, upstream: string, dev: string, page: string, out: string) {
  let built: readonly BuiltPage[] = []
  let log = ''
  const status = await runBuild({ sharedDocs: join(master, group), repo: upstream, dev, page, out }, text => { log += text }, {
    repositoryRoot: master, onBuilt(outputs) { built = outputs },
    fetchContext: { page, targets: targetsFor(page), records: [] },
    fetcher: { async fetch(url) { throw new Error(`Unexpected network image: ${url}`) } },
  })
  expect(status, log).toBe(0)
  return new Map(built.map(output => [output.manual, output.mdx.replaceAll(imageObject, `${imageBase}/${imageObject}`)]))
}

async function fixture(options: { secondEligible?: boolean; missingTarget?: boolean; badDigest?: boolean; mismatchedOutput?: string;
  omittedTarget?: boolean; channelRules?: boolean; openUpdatePages?: readonly string[];
  devInventory?: 'missing' | 'mismatched'; dependencyHref?: string; snapshotMismatch?: 'targets' | 'navigation';
  malformedYaml?: 'lock.yaml' | 'page.yaml'; nextAliasForSelected?: boolean } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'wp13-replay-')))
  scratch.push(root)
  const repos = Object.fromEntries(['master', 'dev', 'upstream'].map(name => {
    const path = join(root, name)
    init(path)
    return [name, path]
  }))
  const { master, dev, upstream } = repos
  const pages = ['first', 'second', 'third']
  put(upstream, 'site/en/diagram.png', imageBytes)
  for (const manual of ['guides', 'byoc']) {
    put(dev, `content/en/${manual}/tutorials/other.md`, '---\nslug: /other\ntitle: Other\ntoken: feishu-old-other\n---\n\nHistorical page.\n')
  }
  put(dev, `${manifests}/active.json`, json({ schema_version: 1, pages: [] }))
  put(dev, guidesSnapshotPath, json({ schema_version: 1, records: [], navigation_records: [], table_digests: {} }))
  const devBaseline = commit(dev, 'Pinned Guides destination context')
  const devFiles = git(dev, 'ls-files', 'content/en/guides', 'content/en/byoc', guidesSnapshotPath, manifests)
    .trim().split('\n').map(path => ({ path, sha256: sha256(readFileSync(join(dev, path))) }))
  function writeUpstreamVersion(version: string) {
    for (const page of pages) {
      const href = page === 'first' ? options.dependencyHref
        : page === 'second' && options.dependencyHref ? 'https://external.example/docs/byoc/other' : undefined
      put(upstream, `site/en/${page}.md`, md(page, version, href))
    }
  }
  writeUpstreamVersion('A')
  const a = commit(upstream, 'Initial upstream pages')
  writeUpstreamVersion('B')
  const b = commit(upstream, 'UAT upstream pages')
  writeUpstreamVersion('C')
  const c = commit(upstream, 'Later upstream pages')
  git(upstream, 'branch', 'v3.0.x')
  for (const file of ['source.yaml', 'Variables.json', 'links.yaml', 'product-names.yaml', 'presentation/cloud-sdk-tabs.yaml']) {
    put(master, `${group}/${file}`, readFileSync(join(toolingRoot, group, file)))
  }
  for (const page of [...pages, 'inactive']) {
    put(master, `${group}/pages/${page}/page.yaml`, pageYaml(page))
    put(master, `${group}/pages/${page}/lock.yaml`, lock(page === 'second' && !options.secondEligible ? b : a, b))
  }
  if (options.channelRules) {
    put(master, `${group}/pages/first/page.yaml`, pageYaml('first') + [
      '', 'transforms:', '  # Review note outside both rules.', '  - operation: replace', '    channel: current',
      '    target: {block: sample-prose}', '    content: {file: old.md}', '  - operation: replace',
      '    target: {block: sample-prose}', '    content: {file: new.md}', '    channel: next', '',
    ].join('\n'))
    put(master, `${group}/pages/first/old.md`, 'Previous Cloud settings.\n')
    put(master, `${group}/pages/first/new.md`, 'Accepted Cloud settings.\n')
  }
  if (options.malformedYaml) {
    const file = `${group}/pages/first/${options.malformedYaml}`
    put(master, file, Buffer.concat([Buffer.from('# invalid Git bytes: '), Buffer.from([0xff]), Buffer.from('\n'), readFileSync(join(master, file))]))
  }
  const acceptedMaster = commit(master, 'Pinned Guides overlay')
  const overlay = git(master, 'ls-files', group).trim().split('\n').map(path => ({ path, sha256: sha256(readFileSync(join(master, path))) }))
  const historicalBuilds = new Map<string, Awaited<ReturnType<typeof buildFixture>>>()
  for (const page of pages) historicalBuilds.set(page, await buildFixture(master, upstream, dev, page, join(root, `built-${page}`)))
  const active = [], records = [], navigationRecords = []
  for (const page of pages) {
    const path = `${manifests}/${page}.json`
    const recordId = `record-${page}`
    const docLink = `https://github.com/zilliztech/zdoc/tree/master/${group}/pages/${page}`
    const targets = options.omittedTarget && page === 'first' ? targetsFor(page).slice(0, 1) : targetsFor(page)
    const snapshotTargets = targets.length === 1 || options.snapshotMismatch === 'targets' && page === 'first'
      ? ['Zilliz.SaaS'] : ['Zilliz.PaaS', 'Zilliz.SaaS']
    const navigation = { record_id: recordId, table_id: 'fixture-table', table_name: 'Guides replay', placement_type: 'canonical',
      parent_record_ids: [], order: 1, title: page, labels: null, slug: page, targets: snapshotTargets.map(value => value.toLowerCase()),
      progress: 'published', doc_token: null, doc_link: docLink, ref_target: null, ref_target_token: null, ref_target_anchor: null,
      source_kind: 'shared-page', shared_page: { group: 'guides', page } }
    const built = historicalBuilds.get(page)!
    const outputs = targets.map(target => {
      const file = `content/en/${target.manual === 'guides' ? 'guides' : 'byoc'}/${target.path}.mdx`
      const generated = built.get(target.manual)!
      const content = page === options.mismatchedOutput ? generated.replace('Version B.', 'Unapproved deployment content.') : generated
      if (!(options.missingTarget && page === 'first' && target.manual === 'guides-byoc')) put(dev, file, content)
      return { manual: target.manual, path: file, sha256: options.badDigest && page === 'first' ? 'f'.repeat(64) : sha256(content) }
    })
    const current = page === 'second' && !options.secondEligible ? b : a
    const sourcePath = `site/en/${page}.md`
    const upstreamFiles = [{ path: sourcePath,
      current: sha256(git(upstream, 'show', `${current}:${sourcePath}`)), next: sha256(git(upstream, 'show', `${b}:${sourcePath}`)) }]
    const historicalFiles = page !== 'first' ? devFiles : options.devInventory === 'missing' ? devFiles.slice(1)
      : options.devInventory === 'mismatched' ? [{ ...devFiles[0], sha256: 'f'.repeat(64) }, ...devFiles.slice(1)] : devFiles
    const receipt: SharedReceipt = { schema_version: 1, page, token: `shared-${page}`, inputs: {
      milvus_docs: { repository: 'milvus-io/milvus-docs', current, next: b, files: upstreamFiles },
      zdoc: { repository: 'zilliztech/zdoc', commit: acceptedMaster, files: overlay },
      dev: { commit: devBaseline, files: historicalFiles },
      fetch: { navigation: { navigationRecords: [navigation], tableDigests: {} }, image_base_url: imageBase,
        render_targets: { schema_version: 1, targets: [...targets] }, active: null },
      tools: { zdoc: acceptedMaster, md2md: '1.3.0' }, images,
    }, outputs, channel: null, notes: [] }
    const identity = renderIdentity(receiptProjection(receipt.inputs, page))
    expect(identity.record).toBe(path)
    active.push({ page, record: recordId, feishu_token: `wiki-${page}`, feishu_aliases: [`wiki-${page}`], anchors: {}, activated_in: '1' })
    records.push({ record_id: recordId, table_id: navigation.table_id, table_name: navigation.table_name, placement_type: 'canonical',
      title: page, labels: null, slug: page, doc_link: docLink, source_kind: 'shared-page', shared_page: identity, parent_record_ids: [],
      order: 1, publish_status: 'published', publish_targets: snapshotTargets, release_channel: 'current',
      doc_token: null, source_file: null, source_hash: null, node_metadata: null, outgoing_tokens: [], output_paths: outputs.map(output => output.path) })
    navigationRecords.push({ ...navigation, shared_page: identity,
      title: options.snapshotMismatch === 'navigation' && page === 'first' ? 'Unapproved navigation title' : navigation.title })
    put(dev, path, json(receipt))
  }
  put(dev, `${manifests}/active.json`, json({ schema_version: 1, pages: active }))
  put(dev, guidesSnapshotPath, json({ schema_version: 1, records, navigation_records: navigationRecords,
    table_digests: { 'fixture-table': sha256(JSON.stringify(navigationRecords)) } }))
  const byocDependency = options.dependencyHref ? 'channel: next\n' : ''
  put(dev, 'content/en/byoc/tutorials/other.md', `---\nslug: /other\ntitle: Other\ntoken: feishu-old-other\n${byocDependency}---\n\nPublished page after the historical dev pin.\n`)
  if (options.nextAliasForSelected) {
    put(dev, 'content/en/reference/sdk-forward.mdx', '---\nslug: /sdk-forward\ntoken: shared-first\nchannel: next\n---\n\nNEXT Reference copy.\n')
  }
  const deployed = commit(dev, 'Committed UAT outputs')
  put(master, `${group}/pages/third/lock.yaml`, lock(a, c))
  const currentMaster = commit(master, 'Advance third after acceptance')
  const recordPath = join(root, 'uat.json')
  writeFileSync(recordPath, json({ schema_version: 1, observation: 'replay', openUpdatePages: options.openUpdatePages ?? [], release: {
    site: 'en', environment: 'uat', status: 'succeeded', mode: 'rebuild', sourceRepository: 'zdoc', sourceSha: deployed,
    finalDeployedDigest: `sha256:${'1'.repeat(64)}`, jenkinsBuildIdentity: 'vdc-jenkins/english-uat/1',
  } }))
  return { root, master, dev, upstream, recordPath, currentMaster, deployed, devBaseline, a, b, c }
}

type Fixture = Awaited<ReturnType<typeof fixture>>

function deploymentFixture(f: Fixture, root = join(f.root, 'trusted')) {
  const { release } = JSON.parse(readFileSync(f.recordPath, 'utf8'))
  const uat = 'evidence/uat-records.json'
  put(root, uat, json([release]))
  put(root, 'evidence/resolved-images.json', json({}))
  put(root, 'evidence/prod-records.json', json([]))
  for (const file of readdirSync(join(root, 'evidence'))) chmodSync(join(root, 'evidence', file), 0o444)
  chmodSync(join(root, 'evidence'), 0o555)
  chmodSync(root, 0o555)
  readOnlyEvidence.push(root)
  return { release, root, env: { ...process.env, VDC_JENKINS_EVIDENCE_ROOT: root,
    VDC_JENKINS_EVIDENCE_PROTECTION: 'kernel-read-only-mount' } }
}

function deploymentPreview(f: Fixture, evidence: ReturnType<typeof deploymentFixture>, out: string, page = 'first') {
  return spawnSync(process.execPath, [launcher, 'shared-docs', 'promote-guides',
    '--mode', 'preview', '--repo', f.upstream, '--dev', f.dev,
    '--uat-build', evidence.release.jenkinsBuildIdentity, '--page', page, '--out', out],
  { cwd: f.master, encoding: 'utf8', env: evidence.env })
}

function cli(f: Fixture, args: string[], nodeArgs: string[] = []) {
  return spawnSync(process.execPath, [...nodeArgs, launcher, 'shared-docs', 'promote-guides',
    '--repo', f.upstream, '--dev', f.dev, '--uat-record', f.recordPath, ...args], { cwd: f.master, encoding: 'utf8' })
}
function preview(f: Fixture) {
  const out = join(f.root, 'preview')
  const result = cli(f, ['--mode', 'preview', '--out', out])
  expect(result.status, result.stderr || result.stdout).toBe(0)
  return JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
}

it('previews only activated pages from the pinned English UAT deployment', async () => {
  const f = await fixture()
  put(f.dev, 'content/en/byoc/tutorials/first.mdx', 'Uncommitted bytes must be ignored.\n')
  const report = preview(f)
  expect(report).toMatchObject({ observation: 'replay', status: 'preview',
    baseline: { master: f.currentMaster, dev: f.deployed }, uat: { record: { sourceSha: f.deployed } } })
  expect(report.pages.map((page: { page: string; status: string }) => [page.page, page.status])).toEqual([
    ['first', 'eligible'], ['second', 'unnecessary'], ['third', 'blocked'],
  ])
  expect(report.pages[0]).toMatchObject({ lock: { current: f.a, next: f.b }, acceptedNext: f.b,
    targets: [{ manual: 'guides' }, { manual: 'guides-byoc' }] })
  expect(report.pages[2].reason).toMatch(/locked next changed/i)
})

it.each([
  [{ missingTarget: true }, /missing Git blob/i],
  [{ badDigest: true }, /output digest mismatch/i],
  [{ omittedTarget: true }, /cover every configured/i],
  [{ openUpdatePages: ['first'] }, /open upstream update/i],
] as const)('holds an active page when its replay evidence is incomplete or conflicted (%j)', async (options, reason) => {
  const f = await fixture(options)
  expect(preview(f).pages[0]).toMatchObject({ page: 'first', status: 'blocked', reason: expect.stringMatching(reason) })
})

function prepare(f: Fixture, selection: string, name = 'prepare', nodeArgs: string[] = []) {
  const out = join(f.root, name)
  const command = cli(f, ['--mode', 'prepare', '--preview', join(f.root, 'preview/promotion-preview.json'),
    '--pages', selection, '--out', out], nodeArgs)
  const report = JSON.parse(readFileSync(join(out, 'promotion-result.json'), 'utf8'))
  const patch = join(out, 'promotion.patch')
  return { out, command, report, patch }
}

it('compares both target views through the mounted-deployment preview CLI', async () => {
  const f = await fixture()
  const evidence = deploymentFixture(f)
  const out = join(f.root, 'preview')
  const command = deploymentPreview(f, evidence, out)
  expect(command.status, command.stderr || command.stdout).toBe(0)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({
    observation: 'uat-evidence', status: 'preview', page: 'first',
    deployment: { status: 'record-validated', record: evidence.release, recordSha256: expect.stringMatching(/^[0-9a-f]{64}$/) },
    comparison: { status: 'matched', deployedNext: f.b, views: [{ manual: 'guides' }, { manual: 'guides-byoc' }] },
    imageLabels: { status: 'pending' }, operatorAcceptance: { status: 'pending' }, openUpdatePrs: { status: 'unobserved' },
  })
  for (const view of report.comparison.views) expect(view.uatViewSha256).toBe(view.candidateProdViewSha256)
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
  const nested = join(evidence.root, '..output')
  const invalid = deploymentPreview(f, evidence, nested)
  expect(invalid.status).toBe(2)
  expect(invalid.stdout).toContain('overlaps input data')
  expect(existsSync(nested)).toBe(false)
  expect(git(f.master, 'status', '--porcelain')).toBe('')
  expect(git(f.dev, 'status', '--porcelain')).toBe('')
  const replay = prepare(f, 'first')
  expect(replay.command.status).toBe(1)
  expect(existsSync(replay.patch)).toBe(false)
})

it('holds a deployment preview for a page whose next pin advanced after deployment', async () => {
  const f = await fixture()
  const out = join(f.root, 'stale')
  const command = deploymentPreview(f, deploymentFixture(f), out, 'third')
  expect(command.status, command.stderr || command.stdout).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ observation: 'uat-evidence', status: 'paused', page: 'third',
    deployment: { status: 'record-validated' }, comparison: { status: 'blocked', reason: expect.stringMatching(/locked next changed/i) } })
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
})

it('holds a deployment preview when BYOC evidence is missing', async () => {
  const f = await fixture({ omittedTarget: true })
  const out = join(f.root, 'missing-target')
  const command = deploymentPreview(f, deploymentFixture(f), out)
  expect(command.status, command.stderr || command.stdout).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ observation: 'uat-evidence', status: 'paused',
    deployment: { status: 'record-validated' }, comparison: { status: 'blocked', reason: expect.stringMatching(/cover every configured/i) } })
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
})

it('keeps repositories and output paths separate from the mounted deployment evidence', async () => {
  const f = await fixture()
  const evidence = deploymentFixture(f, join(f.master, 'trusted'))
  const out = join(f.root, 'overlapping-root')
  expect(deploymentPreview(f, evidence, out).status).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ status: 'paused', deployment: { status: 'unavailable', reason: expect.stringMatching(/must not overlap/i) } })
  expect(readdirSync(join(evidence.root, 'evidence')).sort()).toEqual(['prod-records.json', 'resolved-images.json', 'uat-records.json'])
})

it('protects the whole Git worktree when the request names a subdirectory', async () => {
  const f = await fixture()
  const evidence = deploymentFixture(f, join(f.dev, 'trusted'))
  const devSubdirectory = { ...f, dev: join(f.dev, 'content') }

  const insideWorktree = join(f.dev, 'preview')
  const outputOverlap = deploymentPreview(devSubdirectory, evidence, insideWorktree)
  expect(outputOverlap.status).toBe(2)
  expect(outputOverlap.stdout).toContain('overlaps input data')
  expect(existsSync(insideWorktree)).toBe(false)

  const outsideWorktree = join(f.root, 'preview')
  const evidenceOverlap = deploymentPreview(devSubdirectory, evidence, outsideWorktree)
  expect(evidenceOverlap.status).toBe(1)
  const report = JSON.parse(readFileSync(join(outsideWorktree, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ status: 'paused', deployment: { status: 'unavailable', reason: expect.stringMatching(/must not overlap/i) } })
})

it('holds a deployment preview before using a local Git history overlay', async () => {
  const f = await fixture()
  put(f.dev, '.git/info/grafts', '')
  const out = join(f.root, 'grafted')
  const command = deploymentPreview(f, deploymentFixture(f), out)
  expect(command.status, command.stderr || command.stdout).toBe(1)
  const report = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(report).toMatchObject({ status: 'paused',
    deployment: { status: 'record-validated' }, comparison: { status: 'blocked', reason: expect.stringMatching(/Git grafts/i) } })
  expect(readdirSync(out)).toEqual(['promotion-preview.json'])
})

it('prepares one selected page and the fixed eligible group as exact patches', async () => {
  const f = await fixture({ secondEligible: true })
  const reviewed = preview(f)
  expect(reviewed.pages.filter((page: { status: string }) => page.status === 'eligible').map((page: { page: string }) => page.page)).toEqual(['first', 'second'])
  const before = readFileSync(join(f.dev, 'content/en/guides/tutorials/first.mdx'), 'utf8')
  expect(before).toContain('<NextChannel action="exclude">')
  expect(before).toContain('<NextChannel action="include">')
  expect(before).toContain('Version A.')
  expect(before).toContain('Version B.')

  const single = prepare(f, 'first')
  expect(single.command.status, single.command.stderr || single.command.stdout).toBe(0)
  expect(single.report).toMatchObject({ observation: 'replay', status: 'prepared', selected: ['first'],
    pages: [{ page: 'first', lock: { from: { current: f.a, next: f.b }, to: { current: f.b, next: f.b } },
      views: [{ manual: 'guides' }, { manual: 'guides-byoc' }] }] })
  expect(single.report.patchSha256).toBe(sha256(readFileSync(single.patch)))
  for (const view of single.report.pages[0].views) expect(view.uatViewSha256).toBe(view.candidateProdViewSha256)

  const isolated = join(f.root, 'isolated')
  git(f.root, 'clone', '-q', f.master, isolated)
  git(isolated, 'apply', '--check', single.patch)
  git(isolated, 'apply', single.patch)
  expect(git(isolated, 'diff', '--name-only').trim()).toBe(`${group}/pages/first/lock.yaml`)
  expect(readFileSync(join(isolated, group, 'pages/first/lock.yaml'), 'utf8')).toBe(lock(f.b, f.b))
  const built = await buildFixture(isolated, f.upstream, f.dev, 'first', join(f.root, 'candidate-built'))
  for (const output of built.values()) {
    expect(output).toContain('Version B.')
    expect(output).toContain('version = "B"')
    expect(output).toContain('{#setup}')
    expect(output).toContain('[setup](#setup)')
    expect(output).toContain(`${imageBase}/${imageObject}`)
    expect(output).not.toMatch(/Version A\.|NextChannel/)
  }

  const all = prepare(f, 'all-eligible', 'all')
  expect(all.command.status, all.command.stderr || all.command.stdout).toBe(0)
  expect(all.report).toMatchObject({ status: 'prepared', selected: ['first', 'second'] })
  git(f.master, 'apply', '--check', all.patch)
  expect(readFileSync(all.patch, 'utf8').match(/^diff --git.*$/gm)).toEqual(['first', 'second'].map(page =>
    `diff --git a/${group}/pages/${page}/lock.yaml b/${group}/pages/${page}/lock.yaml`))
  expect(git(f.master, 'status', '--porcelain')).toBe('')
  const preload = join(f.root, 'fail-report-link.cjs')
  writeFileSync(preload, [
    'const fs = require("node:fs/promises")',
    'const link = fs.link',
    'fs.link = async (from, to) => {',
    '  if (to.endsWith("/promotion-result.json")) throw new Error("Injected report publication failure")',
    '  return link(from, to)',
    '}',
    'require("node:module").syncBuiltinESMExports()',
  ].join('\n'))
  const failed = prepare(f, 'first', 'publication-failed', ['--require', preload])
  expect(failed.command.status).toBe(1)
  expect(failed.report).toMatchObject({ status: 'paused', reasons: [expect.stringMatching(/Injected report publication failure/)] })
  expect(existsSync(failed.patch)).toBe(false)
  if (process.env.ZDOC_KEEP_PROMOTION_REPLAY === '1') {
    scratch.splice(scratch.indexOf(f.root), 1)
    process.stdout.write(`WP13 replay sample: ${f.root}\n`)
  }
})

it('holds every pick when one deployed artifact cannot be independently reproduced', async () => {
  const f = await fixture({ secondEligible: true, mismatchedOutput: 'second' })
  preview(f)
  const outcome = prepare(f, 'all-eligible')
  expect(outcome.command.status).toBe(1)
  expect(outcome.report).toMatchObject({ observation: 'replay', status: 'paused', selected: ['first', 'second'], pages: [
    { page: 'first', views: expect.any(Array) }, { page: 'second', reason: expect.stringMatching(/differs from deployed UAT/) },
  ] })
  expect(existsSync(outcome.patch)).toBe(false)
})

it('holds stale or altered preview input and reports empty or rejected picks without a patch', async () => {
  const f = await fixture()
  const original = preview(f)
  const empty = prepare(f, '', 'empty')
  expect(empty.command.status).toBe(0)
  expect(empty.report).toMatchObject({ status: 'empty', selected: [], pages: [] })
  expect(existsSync(empty.patch)).toBe(false)

  const blocked = prepare(f, 'first,third', 'blocked')
  expect(blocked.command.status).toBe(1)
  expect(blocked.report.reasons).toEqual([expect.stringMatching(/^third: Locked next changed/)])
  expect(existsSync(blocked.patch)).toBe(false)

  const file = join(f.root, 'preview/promotion-preview.json')
  original.pages[1].status = 'eligible'
  writeFileSync(file, json(original))
  const edited = prepare(f, 'all-eligible', 'edited')
  expect(edited.command.status).toBe(1)
  expect(edited.report.reasons[0]).toMatch(/preview no longer matches/i)
  expect(existsSync(edited.patch)).toBe(false)
  original.pages[1].status = 'unnecessary'
  writeFileSync(file, json(original))

  const envelope = JSON.parse(readFileSync(f.recordPath, 'utf8'))
  envelope.release.jenkinsBuildIdentity = 'vdc-jenkins/english-uat/2'
  writeFileSync(f.recordPath, json(envelope))
  const swapped = prepare(f, 'all-eligible', 'swapped')
  expect(swapped.command.status).toBe(1)
  expect(existsSync(swapped.patch)).toBe(false)
  envelope.release.jenkinsBuildIdentity = 'vdc-jenkins/english-uat/1'
  writeFileSync(f.recordPath, json(envelope))

  put(f.master, `${group}/pages/first/lock.yaml`, lock(f.a, f.c))
  commit(f.master, 'Move a selected lock after preview')
  const stale = prepare(f, 'all-eligible', 'stale')
  expect(stale.command.status).toBe(1)
  expect(stale.report.reasons[0]).toMatch(/preview no longer matches/i)
  expect(existsSync(stale.patch)).toBe(false)
})

it('edits only the selected lock and channel rule lines, and holds when Cloud content drifts', async () => {
  const f = await fixture({ channelRules: true })
  preview(f)
  const result = prepare(f, 'first')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(0)
  const isolated = join(f.root, 'rules-candidate')
  git(f.root, 'clone', '-q', f.master, isolated)
  git(isolated, 'apply', '--check', result.patch)
  git(isolated, 'apply', result.patch)
  expect(git(isolated, 'diff', '--name-only').trim().split('\n')).toEqual(['lock.yaml', 'page.yaml'].map(file => `${group}/pages/first/${file}`))
  const config = readFileSync(join(isolated, group, 'pages/first/page.yaml'), 'utf8')
  expect(config).toContain('# Review note outside both rules.')
  expect(config).toContain('    content: {file: new.md}')
  expect(config).not.toMatch(/channel:|old\.md/)
  const rebuilt = await buildFixture(isolated, f.upstream, f.dev, 'first', join(f.root, 'rule-output'))
  for (const output of rebuilt.values()) expect(output).toContain('Accepted Cloud settings.')

  put(f.master, `${group}/pages/first/new.md`, 'Changed after UAT.\n')
  commit(f.master, 'Alter the accepted Cloud dependency')
  const stale = prepare(f, 'first', 'cloud-drift')
  expect(stale.command.status).toBe(1)
  expect(existsSync(stale.patch)).toBe(false)
  const out = join(f.root, 'cloud-drift-preview')
  expect(cli(f, ['--mode', 'preview', '--out', out]).status).toBe(0)
  const fresh = JSON.parse(readFileSync(join(out, 'promotion-preview.json'), 'utf8'))
  expect(fresh.pages[0]).toMatchObject({ status: 'blocked', reason: expect.stringMatching(/Cloud content changed after UAT/) })
})

it('holds an entire release group when an absolute cross-manual link targets a NEXT route', async () => {
  const url = 'https://docs.zilliz.com/docs/byoc/other?from=guides'
  const f = await fixture({ secondEligible: true, dependencyHref: url })
  expect(git(f.dev, 'show', `${f.devBaseline}:content/en/byoc/tutorials/other.md`)).toContain('Historical page.')
  expect(git(f.dev, 'show', `${f.deployed}:content/en/byoc/tutorials/other.md`)).toContain('channel: next')
  expect(git(f.dev, 'show', `${f.deployed}:content/en/guides/tutorials/first.mdx`)).toContain(url)
  preview(f)

  const result = prepare(f, 'all-eligible')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', selected: ['first', 'second'], pages: [
    { page: 'first', reason: expect.stringContaining(`Unproved current page dependency: guides ${url}`) },
    { page: 'second', views: expect.any(Array) },
  ] })
  expect(existsSync(result.patch)).toBe(false)
  expect(git(f.master, 'status', '--porcelain')).toBe('')
  expect(git(f.dev, 'status', '--porcelain')).toBe('')
  const externalOnly = prepare(f, 'second', 'external-only')
  expect(externalOnly.command.status, externalOnly.command.stderr || externalOnly.command.stdout).toBe(0)
  expect(externalOnly.report).toMatchObject({ status: 'prepared', selected: ['second'] })
})

it('holds a Cloud link to a current page whose BYOC copy shares a NEXT token', async () => {
  const url = 'https://docs.zilliz.com/docs/other'
  const f = await fixture({ dependencyHref: url })
  const cloud = git(f.dev, 'show', `${f.deployed}:content/en/guides/tutorials/other.md`)
  const byoc = git(f.dev, 'show', `${f.deployed}:content/en/byoc/tutorials/other.md`)
  expect(cloud).toContain('token: feishu-old-other')
  expect(cloud).not.toContain('channel: next')
  expect(byoc).toContain('token: feishu-old-other')
  expect(byoc).toContain('channel: next')
  preview(f)
  const result = prepare(f, 'first')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', pages: [
    { page: 'first', reason: expect.stringContaining(`Unproved current page dependency: guides ${url} (NEXT route)`) },
  ] })
  expect(existsSync(result.patch)).toBe(false)
})

it('holds selected routes that share their token with a NEXT Reference page', async () => {
  const f = await fixture({ nextAliasForSelected: true })
  preview(f)
  const result = prepare(f, 'first')
  expect(result.command.status, result.command.stderr || result.command.stdout).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', pages: [
    { page: 'first', reason: expect.stringContaining('Selected route is gated on English Prod: /docs/first') },
  ] })
  expect(existsSync(result.patch)).toBe(false)
})

it.each(['missing', 'mismatched'] as const)('holds a selected page with %s historical dev inventory', async devInventory => {
  const f = await fixture({ devInventory })
  expect(preview(f).pages[0].status).toBe('eligible')
  const result = prepare(f, 'first')
  expect(result.command.status).toBe(1)
  expect(result.report).toMatchObject({ status: 'paused', pages: [
    { page: 'first', reason: expect.stringContaining('Historical dev inventory missing or mismatched: content/en/byoc/tutorials/other.md') },
  ] })
  expect(existsSync(result.patch)).toBe(false)
})

it.each([
  ['targets', /snapshot publication targets do not match receipt renditions/],
  ['navigation', /receipt navigation differs from effective snapshot/],
] as const)('holds a page when committed snapshot %s disagrees with its receipt', async (snapshotMismatch, reason) => {
  const f = await fixture({ snapshotMismatch })
  expect(preview(f).pages[0]).toMatchObject({ status: 'blocked', reason: expect.stringMatching(reason) })
  const result = prepare(f, 'first')
  expect(result.command.status).toBe(1)
  expect(existsSync(result.patch)).toBe(false)
})

it.each(['lock.yaml', 'page.yaml'] as const)('holds the page when committed %s contains invalid UTF-8', async malformedYaml => {
  const f = await fixture({ malformedYaml })
  expect(preview(f).pages[0]).toMatchObject({ status: 'blocked', reason: expect.stringContaining(`Editable ${malformedYaml} must round-trip as UTF-8`) })
  const result = prepare(f, 'first')
  expect(result.command.status).toBe(1)
  expect(existsSync(result.patch)).toBe(false)
})
