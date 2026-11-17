// @vitest-environment node
import { cp, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { runUpdate } from '../../commands/update'
import { manualPromote } from '../../commands/promote'
import { runBuild } from '../../commands/build'
import { runLock } from '../../commands/lock'
import { createManualDemo, git, write, sourceDir } from './demo'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

async function temp(prefix = 'manual-update-') {
  // Realpath first: output-state checks reject symlinked ancestors (/var on macOS).
  const root = await realpath(await mkdtemp(join(tmpdir(), prefix)))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  return root
}

const TOOLING = 'a1b2c3d4'.repeat(5)

it('reports no changes when the tracking head equals the locked next', async () => {
  const demo = await createManualDemo(await temp('manual-upd-none-'))
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  const out = join(demo.root, 'report')
  let output = ''
  const code = await runUpdate({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text })
  expect(code).toBe(0)
  expect(output).toContain('"upToDate":true')
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report).toMatchObject({ kind: 'shared-manual-update', manual: 'node', upToDate: true,
    counts: { added: 0, removed: 0, changed: 0 } })
  await expect(readdir(out)).resolves.not.toContain('next-lock.yaml')
})

it('produces the candidate next lock and the whole-manual impact report', async () => {
  const demo = await createManualDemo(await temp('manual-upd-'), {
    later: { 'Client/MilvusClientV2.md': '# MilvusClientV2\n\nChanged upstream after the pin.\n' } })
  // lock pins next at the first update; a second upstream commit then lands on master.
  expect(await runLock({ fromFork: false, sharedDocs: demo.sharedDocs, repo: demo.repo }, () => {})).toBe(0)
  await write(demo.repo, `${sourceDir}/Extras/pointer.md`, '# pointer\n\nAdded upstream.\n')
  await write(demo.repo, `${sourceDir}/Client/MilvusClientV2.md`, '# MilvusClientV2\n\nChanged again upstream.\n')
  await git(demo.repo, 'rm', '-q', `${sourceDir}/Collections/DataType.md`)
  await git(demo.repo, 'add', '.')
  await git(demo.repo, 'commit', '--quiet', '-m', 'Second upstream batch')
  const head = await git(demo.repo, 'rev-parse', 'HEAD')
  const out = join(demo.root, 'report')
  let output = ''
  const code = await runUpdate({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text })
  expect(code).toBe(0)
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report.to).toBe(head)
  expect(report.added).toEqual(['Extras/pointer.md'])
  expect(report.removed).toEqual(['Collections/DataType.md'])
  expect(report.changed).toEqual(['Client/MilvusClientV2.md'])
  expect(await readFile(join(out, 'next-lock.yaml'), 'utf8'))
    .toBe(`schema_version: 1\ncurrent: ${demo.nextCommit}\nnext: ${head}\n`)
  const markdown = await readFile(join(out, 'report.md'), 'utf8')
  expect(markdown).toContain('`shared-docs: update node to master')
  expect(markdown).toContain('Added (whole-page `next` candidates): `Extras/pointer.md`')
  // A second run cannot reuse the output directory.
  expect(await runUpdate({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    () => {})).toBe(2)
})

it('refuses to adopt a next that is not a descendant of the locked next', async () => {
  const demo = await createManualDemo(await temp('manual-upd-diverge-'))
  const initial = demo.commit
  await git(demo.repo, 'checkout', '-q', '-b', 'side')
  await write(demo.repo, `${sourceDir}/Side/page.md`, '# side\n\nA diverged upstream line.\n')
  await git(demo.repo, 'add', '.')
  await git(demo.repo, 'commit', '--quiet', '-m', 'Side commit')
  const side = await git(demo.repo, 'rev-parse', 'HEAD')
  await git(demo.repo, 'checkout', '-q', 'master')
  await write(demo.repo, `${sourceDir}/Master/page.md`, '# master\n\nThe real tracking line.\n')
  await git(demo.repo, 'add', '.')
  await git(demo.repo, 'commit', '--quiet', '-m', 'Master commit')
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${initial}\nnext: ${side}\n`)
  const out = join(demo.root, 'report')
  let output = ''
  const code = await runUpdate({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text })
  expect(code).toBe(2)
  // The side branch head is off the tracking branch, which the history check rejects
  // before the ancestor comparison runs; both guards fail closed with exit 2.
  expect(output).toContain('is missing from or off the tracking branch')
})

const PROMOTE_MANUAL = (overviewChannel = 'next') => `schema_version: 1
source:
  dir: ${sourceDir}
publish:
  manual: node
exclude:
  - Collections/DataType.md
metadata:
  Client/:
    beta: ON REQUEST
  Collections/DataType.md:
    added_since: v2.3.x
cloud_pages:
  Overview.md:
    file: overview.md
    channel: ${overviewChannel}
  MilvusCloud/Legacy.md:
    file: legacy.md
    channel: retire-in-next
`

async function createPromotionDemo(prefix: string, options: { breakUpstreamLink?: boolean } = {}) {
  const demo = await createManualDemo(await temp(prefix), {
    manual: PROMOTE_MANUAL(),
    upstream: { 'Client/MilvusClientV2.md': `# MilvusClientV2

The client for a Milvus instance.

See [createCollection](../Collections/createCollection.md).
` } })
  // The upstream batch that ends the pin: DataType is removed and the page linking it is
  // fixed in the same commit (the well-behaved upstream case).
  await write(demo.repo, `${sourceDir}/Client/MilvusClientV2.md`, '# MilvusClientV2\n\nChanged upstream.\n\nSee [createCollection](../Collections/createCollection.md).\n')
  if (options.breakUpstreamLink) {
    await write(demo.repo, `${sourceDir}/Collections/createCollection.md`, `# createCollection()

Creates a collection with default or customized settings.

See [DataType](DataType.md) and [MilvusClientV2](../Client/MilvusClientV2.md).
`)
  } else {
    await write(demo.repo, `${sourceDir}/Collections/createCollection.md`, `# createCollection()

Creates a collection with default or customized settings.

See [MilvusClientV2](../Client/MilvusClientV2.md).
`)
  }
  await write(demo.repo, `${sourceDir}/Extras/pointer.md`, '# pointer\n\nAdded upstream.\n')
  await git(demo.repo, 'rm', '-q', `${sourceDir}/Collections/DataType.md`)
  await git(demo.repo, 'add', '.')
  await git(demo.repo, 'commit', '--quiet', '-m', 'Upstream batch removing DataType')
  const nextCommit = await git(demo.repo, 'rev-parse', 'HEAD')
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${demo.commit}\nnext: ${nextCommit}\n`)
  await write(demo.sharedDocs, 'content/overview.md', '# Overview\n\nManual-local page linking [pointer](Extras/pointer.md).\n')
  await write(demo.sharedDocs, 'content/legacy.md', '# Legacy\n\nA page being retired.\n')
  return { ...demo, nextCommit }
}

it('promotes the whole manual and carries the one-sided configuration across', async () => {
  const demo = await createPromotionDemo('manual-promote-')
  const out = join(demo.root, 'promotion')
  let output = ''
  const code = await manualPromote({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text }, demo.root)
  expect(code).toBe(0)
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report).toMatchObject({ kind: 'shared-manual-promotion', manual: 'node',
    lock: { from: { current: demo.commit, next: demo.nextCommit }, to: { current: demo.nextCommit, next: demo.nextCommit } },
    cloudPagesPromoted: ['Overview.md'], cloudPagesRetired: ['MilvusCloud/Legacy.md'],
    upstreamPagesRetired: ['Collections/DataType.md'],
    metadataRemoved: ['Collections/DataType.md'], excludeRemoved: ['Collections/DataType.md'] })
  expect(await readFile(join(out, 'lock.yaml'), 'utf8'))
    .toBe(`schema_version: 1\ncurrent: ${demo.nextCommit}\nnext: ${demo.nextCommit}\n`)
  const promotedManual = await readFile(join(out, 'manual.yaml'), 'utf8')
  expect(promotedManual).toContain('file: overview.md')
  expect(promotedManual).not.toContain('channel: next')
  expect(promotedManual).not.toContain('Legacy')
  expect(promotedManual).not.toContain('Collections/DataType.md')
  expect(promotedManual).toContain('beta: ON REQUEST')
  // The physical content file of the retired page stays in place.
  await expect(readFile(join(demo.sharedDocs, 'content', 'legacy.md'), 'utf8')).resolves.toBeTruthy()

  // Applying the promotion outputs to the group must produce a green two-channel build.
  const applied = await temp('manual-promote-applied-')
  const group = join(applied, 'shared-docs/node')
  await cp(demo.sharedDocs, group, { recursive: true })
  await cp(join(out, 'lock.yaml'), join(group, 'lock.yaml'))
  await cp(join(out, 'manual.yaml'), join(group, 'manual.yaml'))
  let buildOutput = ''
  const build = await runBuild({ sharedDocs: group, repo: demo.repo, dev: join(applied, 'dev'), out: join(applied, 'out') },
    text => { buildOutput += text }, { toolingCommit: TOOLING, repositoryRoot: applied })
  expect(buildOutput).not.toContain('LINK_TARGET_EXCLUDED')
  expect(build).toBe(0)
  const overview = await readFile(join(applied, 'out', 'node/Overview.md'), 'utf8')
  // The promoted cloud page is now two-sided: no whole-page channel gate remains.
  expect(overview).not.toContain('channel: next')
  expect(overview).toContain('](./Extras-pointer)')
  const created = await readFile(join(applied, 'out', 'node/Collections/Collections-createCollection.md'), 'utf8')
  expect(created).not.toContain('NextChannel')
  await expect(readFile(join(applied, 'out', 'node/MilvusCloud/MilvusCloud-Legacy.md'), 'utf8')).rejects.toThrow()
})

it('blocks promotion while a live page still links a vanishing page', async () => {
  const demo = await createPromotionDemo('manual-promote-block-', { breakUpstreamLink: true })
  const out = join(demo.root, 'promotion')
  let output = ''
  const code = await manualPromote({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text }, demo.root)
  expect(code).toBe(1)
  expect(output).toContain('"blocked":1')
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report.blockedReferences).toEqual([
    { kind: 'upstream', file: 'Collections/createCollection.md', line: 5, target: 'datatype.md' }])
  // No lock or configuration is staged for a blocked promotion.
  await expect(readFile(join(out, 'lock.yaml'), 'utf8')).rejects.toThrow()
  await expect(readFile(join(out, 'manual.yaml'), 'utf8')).rejects.toThrow()
  const markdown = await readFile(join(out, 'report.md'), 'utf8')
  expect(markdown).toContain('## Blocked references')
  expect(markdown).toContain('the post-promotion build would fail')
})

it('lists handwritten channel markers for the author without removing them', async () => {
  const demo = await createPromotionDemo('manual-promote-gates-')
  await write(demo.sharedDocs, 'content/overview.md',
    '# Overview\n\n<NextChannel action="include">\n\nPreview-only paragraph.\n\n</NextChannel>\n')
  const out = join(demo.root, 'promotion')
  let output = ''
  expect(await manualPromote({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text }, demo.root)).toBe(0)
  expect(output).toContain('"exitCode":0')
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report.handwrittenGates).toEqual([{ file: 'Overview.md', line: 3 }, { file: 'Overview.md', line: 7 }])
  const markdown = await readFile(join(out, 'report.md'), 'utf8')
  expect(markdown).toContain('## Handwritten channel markers')
  // The rewritten configuration still carries the marker bytes in the content file.
  const applied = await temp('manual-promote-gates-applied-')
  const group = join(applied, 'shared-docs/node')
  await cp(demo.sharedDocs, group, { recursive: true })
  await cp(join(out, 'lock.yaml'), join(group, 'lock.yaml'))
  await cp(join(out, 'manual.yaml'), join(group, 'manual.yaml'))
  expect(await readFile(join(group, 'content', 'overview.md'), 'utf8')).toContain('<NextChannel action="include">')
})

it('promotes a manual whose commits are already equal (local-only changes)', async () => {
  const demo = await createPromotionDemo('manual-promote-local-')
  // current == next: no upstream delta, but the cloud next page still needs its release.
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${demo.commit}\nnext: ${demo.commit}\n`)
  const out = join(demo.root, 'promotion')
  const code = await manualPromote({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    () => {}, demo.root)
  expect(code).toBe(0)
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report.lock.to).toEqual({ current: demo.commit, next: demo.commit })
  expect(report.cloudPagesPromoted).toEqual(['Overview.md'])
  expect(report.upstreamPagesRetired).toEqual([])
})

it('blocks promotion while a remaining cloud page links a vanishing page', async () => {
  const demo = await createPromotionDemo('manual-promote-cloud-block-')
  // The surviving cloud page links the retiring cloud page by basename.
  await write(demo.sharedDocs, 'content/overview.md', '# Overview\n\nSee [the legacy page](MilvusCloud/Legacy.md).\n')
  const out = join(demo.root, 'promotion')
  const code = await manualPromote({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    () => {}, demo.root)
  expect(code).toBe(1)
  const report = JSON.parse(await readFile(join(out, 'report.json'), 'utf8'))
  expect(report.blockedReferences).toEqual([
    { kind: 'cloud', file: 'shared-docs/node/content/overview.md', line: 3, target: 'legacy.md' }])
})

it('blocks promotion on configuration paths that name nothing', async () => {
  const demo = await createPromotionDemo('manual-promote-typo-')
  await write(demo.sharedDocs, 'manual.yaml', PROMOTE_MANUAL().replace(
    '  Collections/DataType.md:\n    added_since: v2.3.x\n',
    '  Collections/DataType.md:\n    added_since: v2.3.x\n  Collections/DataTypo.md:\n    added_since: v2.3.x\n'))
  const out = join(demo.root, 'promotion')
  let output = ''
  const code = await manualPromote({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text }, demo.root)
  expect(code).toBe(2)
  expect(output).toContain('Metadata key names no surviving or vanishing page: Collections/DataTypo.md')
  await expect(readFile(join(out, 'lock.yaml'), 'utf8')).rejects.toThrow()
})

it('refuses an up-to-date report when the locked current left the tracking branch', async () => {
  const demo = await createManualDemo(await temp('manual-upd-rewritten-'))
  const good = demo.commit
  // Rebuild master so the locked current is no longer on the tracking branch.
  await git(demo.repo, 'checkout', '-q', '--orphan', 'rewritten')
  await git(demo.repo, 'add', '-A')
  await git(demo.repo, 'commit', '--quiet', '-m', 'Rewritten history')
  const rewritten = await git(demo.repo, 'rev-parse', 'HEAD')
  await git(demo.repo, 'update-ref', 'refs/heads/master', rewritten)
  await write(demo.sharedDocs, 'lock.yaml', `schema_version: 1\ncurrent: ${good}\nnext: ${rewritten}\n`)
  const out = join(demo.root, 'report')
  let output = ''
  const code = await runUpdate({ sharedDocs: demo.sharedDocs, repo: demo.repo, dev: join(demo.root, 'dev'), out },
    text => { output += text })
  expect(code).toBe(2)
  expect(output).toContain('is missing from or off the tracking branch')
})
