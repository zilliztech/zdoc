/** Synthetic local adapter only. No production SDK builder, registry installation or authority claim. */
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { canonicalBytes, compareUtf8, digest } from '../../../core/updates/canonical'
import { ManualImpactReportSchema, validateUpdateReportEnvelope, type BlobRef, type ContentMember, type ExecutionPins,
  type ManualImpactReport, type MaterialTree, type OriginalObject, type SemanticInput, type Subject, type UpdateProvider, type UpdateReportEnvelope } from '../../../core/updates/envelope'
import { captureUnitMaterial, planUpdateUnit, type UnitMaterialContext } from '../../../core/updates/unit-plan'
import { immutable } from '../../../core/updates/types'
import { rawSha256 } from '../../../adapters/updates/evidence'
import { git, write } from '../../build/demo'
const committedBytes = (repository: string, commit: string, path: string) => execFileSync('git', ['--no-replace-objects', '-C', repository, 'show', `${commit}:${path}`], { env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))), GIT_NO_LAZY_FETCH: '1' }, maxBuffer: 4 * 1024 * 1024 })
const policy = digest('policy', 'synthetic-manual-fixture-only-v1')
export const fixtureSubject: Subject = { kind: 'sdk-manual', group: 'fixture', manualId: 'fixture' }
export function fixtureBlob(bytes: Uint8Array | string): BlobRef {
  const data = typeof bytes === 'string' ? Buffer.from(bytes) : bytes, sha256 = rawSha256(data)
  return { path: `blobs/${sha256}`, sha256, bytes: data.length }
}
/** Complete explicit fixture envelopes can also exercise the pure common planner without IO. */
export function fixtureMaterial(options: { subject?: Subject; members?: ContentMember[]; current?: string; target?: string;
  disposition?: 'candidate' | 'draft-failure' | 'report-only' | 'noop' | 'hold'; master?: string } = {}): UnitMaterialContext {
  const subject = options.subject ?? fixtureSubject
  const current = options.current ?? '1'.repeat(40), target = options.target ?? '2'.repeat(40), master = options.master ?? '3'.repeat(40)
  const path = subject.kind === 'guides-page' ? `shared-docs/guides/pages/${subject.pageId}/lock.yaml` : `shared-docs/${subject.group}/lock.yaml`
  const members: ContentMember[] = options.members ?? [{ logicalId: 'api/Client.md', manualId: 'fixture', token: 'client', outputPath: 'content/en/fixture/api/Client.mdx', origin: 'upstream', current: true, next: true }]
  const beforeText = `{"schema_version":1,"current":"${current}","next":"${current}"}\n`
  const nextText = beforeText.replace(`"next":"${current}"`, `"next":"${target}"`)
  const sourceBefore: MaterialTree = { entries: [{ path: 'api/Client.md', ...(({ path: _, ...ref }) => ref)(fixtureBlob('old\n')) }] }
  const sourceAfter: MaterialTree = options.disposition === 'noop' || options.disposition === 'report-only' ? sourceBefore : { entries: [{ path: 'api/Client.md', ...(({ path: _, ...ref }) => ref)(fixtureBlob('new\n')) }] }
  const authority = { provider: subject.kind === 'guides-page' ? 'guides-retained-source' as const : 'manual-git-registration' as const, subject,
    evidence: [fixtureBlob('synthetic authority\n')], updateState: options.disposition === 'hold' ? 'unknown' as const : 'eligible-to-propose' as const, reasons: options.disposition === 'hold' ? ['SYNTHETIC_UNKNOWN'] : [] }
  const semantic: SemanticInput = { kind: 'shared-update-semantic', schemaVersion: 1, subject, source: { repository: 'https://example.test/synthetic-manual', directory: 'api', track: 'main' },
    config: { entries: [{ path: 'fixture/config.yaml', ...(({ path: _, ...ref }) => ref)(fixtureBlob('synthetic config\n')) }] }, lockSchema: { version: 1, path },
    upstream: { current: sourceBefore, oldNext: sourceBefore, target: sourceAfter }, images: [], members,
    registry: subject.kind === 'guides-page' ? null : { manualId: subject.manualId, group: subject.group, configPath: 'fixture/config.yaml', outputRoot: 'content/en/fixture', landingPath: 'fixture/index.md', policySha256: policy },
    authority: { provider: authority.provider, state: authority.updateState, reasons: authority.reasons, policySha256: policy }, providerPolicySha256: policy, toolsetSha256: policy }
  const report = { kind: 'shared-update' as const, schemaVersion: 1 as const, subject, pins: { master, dev: master, trustedTools: master, configSnapshot: master, configTreeOid: master,
    relevantConfigSha256: policy, comparisonConfig: null, toolsetSha256: policy, registrySha256: policy,
    source: { repository: semantic.source.repository, track: 'main', observedTrackHead: target, current, oldNext: current, target } }, authority, members,
    memberSetSha256: digest('members', members), axes: ['old-next-to-target', 'current-to-candidate-next'].map(axis => ({ axis,
      sourceChanged: sourceBefore !== sourceAfter, outputChanged: sourceBefore !== sourceAfter, contentStatus: options.disposition === 'draft-failure' ? 'content-failure' : 'valid', added: [], removed: [], renameCandidates: [] })),
    configurationChanges: [], detail: { kind: subject.kind === 'guides-page' ? 'guides-impact-v1' : 'manual-impact-v1', file: fixtureBlob('synthetic detail\n') }, diagnostics: [],
    semanticProjection: semantic, semanticInputSha256: digest('semantic', semantic) } as UpdateReportEnvelope
  return captureUnitMaterial({ subject, reportBlob: fixtureBlob(canonicalBytes(report)), collectedReport: report, members,
    lock: { path, before: { blob: fixtureBlob(beforeText), text: beforeText }, preparedNext: { blob: fixtureBlob(nextText), text: nextText } },
    history: [{ oid: current, parents: [] }, { oid: target, parents: [current] }], sourceInventories: [current, current, target].map(commit => ({ commit, treeOid: commit, inventory: fixtureBlob('synthetic complete inventory\n'), absentPaths: [] })), relevantSource: semantic.upstream,
    reportingChanges: options.disposition === 'report-only' ? ['synthetic-config-only'] : [], holdReasons: [] })
}
export async function createManualFixture() {
  const root = await mkdtemp(join(tmpdir(), 'manual-provider-')), source = join(root, 'source'), local = join(root, 'local')
  await write(source, 'api/Client.md', '# Client\n\nVersion one.\n'); await write(source, 'api/Search.md', '# Search\n\nVersion one.\n')
  await git(source, 'init', '-q', '-b', 'main'); await git(source, 'add', '.'); await git(source, 'commit', '-qm', 'synthetic manual current')
  const current = await git(source, 'rev-parse', 'HEAD')
  await write(source, 'api/Search.md', '# Search\n\nVersion two.\n'); await git(source, 'add', '.'); await git(source, 'commit', '-qm', 'synthetic manual next')
  const second = await git(source, 'rev-parse', 'HEAD')
  await write(local, 'index.md', '# Local manual landing\n'); await write(local, 'shared-docs/fixture/lock.yaml', `schema_version: 1\ncurrent: ${current}\nnext: ${current}\n`)
  await git(local, 'init', '-q', '-b', 'master'); await git(local, 'add', '.'); await git(local, 'commit', '-qm', 'synthetic local landing and manual lock')
  const master = await git(local, 'rev-parse', 'HEAD'), configTreeOid = await git(local, 'rev-parse', 'HEAD^{tree}')
  const blobs = new Map<string, Uint8Array>(), contexts = new Map<string, UnitMaterialContext>(), details = new Map<string, ManualImpactReport>()
  const retain = (bytes: Uint8Array | string) => { const data = typeof bytes === 'string' ? Buffer.from(bytes) : bytes, blob = fixtureBlob(data); blobs.set(blob.sha256, data); return blob }
  let target = second
  const pins: ExecutionPins = { ...fixtureMaterial({ current, target, master }).collectedReport.pins, configTreeOid }
  async function collect(): Promise<UpdateReportEnvelope> {
    const refs: BlobRef[] = [], maps: Map<string, Uint8Array>[] = [], inventories: MaterialTree[] = []
    for (const commit of [current, current, target]) {
      const names = (await git(source, 'ls-tree', '-r', '--name-only', commit, '--', 'api')).split('\n').filter(Boolean).sort(compareUtf8)
      const files = new Map<string, Uint8Array>()
      for (const path of names) files.set(path, committedBytes(source, commit, path))

      const listing = canonicalBytes(names); refs.push(retain(listing)); maps.push(files)
      inventories.push({ entries: [...files].map(([path, bytes]) => ({ path, sha256: retain(bytes).sha256, bytes: bytes.length })) })
    }
    const landing = committedBytes(local, master, 'index.md'), landingRef = retain(landing)
    const names = [...new Set(maps.flatMap(map => [...map.keys()]))].sort(compareUtf8)
    const members: ContentMember[] = [...names.map(path => ({ logicalId: path, manualId: 'fixture', token: path.replace(/^api\//, '').replace(/\.md$/, '').toLowerCase(),
      outputPath: `content/en/fixture/${path.replace(/\.md$/, '.mdx')}`, origin: 'upstream' as const, current: maps[0].has(path), next: maps[2].has(path) })),
    { logicalId: 'index.md', manualId: 'fixture', token: 'index', outputPath: 'content/en/fixture/index.mdx', origin: 'local' as const, current: true, next: true }]
      .sort((a, b) => compareUtf8(a.logicalId, b.logicalId) || compareUtf8(a.origin, b.origin))
    const original = (index: number, path: string): OriginalObject => maps[index].has(path) ? { state: 'present', commit: [current, current, target][index], repositoryPath: path, content: retain(maps[index].get(path)!) }
      : { state: 'absent', commit: [current, current, target][index], repositoryPath: path, inventory: refs[index] }
    const views = (path: string, bytes?: Uint8Array): ManualImpactReport['pages'][number]['views'] => [
      { pair: 'baseline', channel: 'current', status: bytes ? 'compiled' : 'absent', output: bytes ? retain(bytes) : null },
      { pair: 'baseline', channel: 'next', status: bytes ? 'compiled' : 'absent', output: bytes ? retain(bytes) : null },
      { pair: 'candidate', channel: 'current', status: bytes ? 'compiled' : 'absent', output: bytes ? retain(bytes) : null },
      { pair: 'candidate', channel: 'next', status: maps[2].has(path) ? 'compiled' : 'absent', output: maps[2].has(path) ? retain(maps[2].get(path)!) : null },
    ]
    const detail = ManualImpactReportSchema.parse({ kind: 'manual-impact', schemaVersion: 1, manualId: 'fixture', inventories: { current: refs[0], oldNext: refs[1], target: refs[2] },
      pages: [...names.map(path => ({ logicalPath: path, origin: 'upstream', upstream: { current: original(0, path), oldNext: original(1, path), target: original(2, path) }, local: null,
        replacements: [], views: views(path, maps[0].get(path)) })), { logicalPath: 'index.md', origin: 'local', upstream: null, local: { snapshot: master, file: landingRef }, replacements: [],
        views: views('index.md', landing).map(view => ({ ...view, status: 'compiled', output: landingRef })) }], fullBuild: { baseline: 'valid', candidate: 'valid' }, diagnostics: [] })
    const material = fixtureMaterial({ current, target, master, members }), report = structuredClone(material.collectedReport)
    report.pins = { ...pins, source: { ...pins.source, target, observedTrackHead: target } }
    report.detail.file = retain(canonicalBytes(detail)); report.semanticProjection.upstream = { current: inventories[0], oldNext: inventories[1], target: inventories[2] }
    report.semanticProjection.config = { entries: [{ path: 'fixture/index.md', sha256: landingRef.sha256, bytes: landingRef.bytes }] }
    report.semanticInputSha256 = digest('semantic', report.semanticProjection)
    validateUpdateReportEnvelope(report)
    const beforeText = committedBytes(local, master, 'shared-docs/fixture/lock.yaml').toString('utf8')
    // This explicit fixture substitution is test data preparation, not the production lock patcher.
    const afterText = beforeText.replace(`next: ${current}`, `next: ${target}`)
    const sourceInventories = await Promise.all([current, current, target].map(async (commit, index) => ({ commit, treeOid: await git(source, 'rev-parse', `${commit}^{tree}`), inventory: refs[index], absentPaths: names.filter(path => !maps[index].has(path)) })))
    const commits = [current, second, ...(target === second ? [] : [target])]
    const history = await Promise.all(commits.map(async oid => ({ oid, parents: (await git(source, 'show', '-s', '--format=%P', oid)).split(' ').filter(Boolean) })))
    const context = captureUnitMaterial({ ...material, collectedReport: report, reportBlob: retain(canonicalBytes(report)), history, sourceInventories,
      lock: { path: material.lock.path, before: { blob: retain(beforeText), text: beforeText }, preparedNext: { blob: retain(afterText), text: afterText } }, relevantSource: report.semanticProjection.upstream })
    contexts.set(context.reportBlob.sha256, context); details.set(report.detail.file.sha256, detail)
    return immutable(report)
  }
  const provider: UpdateProvider = { kind: 'sdk-manual', async collect(subject, requestedPins) {
    if (JSON.stringify(subject) !== JSON.stringify(fixtureSubject) || JSON.stringify(requestedPins) !== JSON.stringify(pins)) throw new Error('Synthetic fixture subject/pins mismatch')
    return collect()
  }, planNext(report) {
    const context = contexts.get(fixtureBlob(canonicalBytes(report)).sha256)
    if (!context) throw new Error('Synthetic manual requires its independently collected context')
    return planUpdateUnit([report], [context])
  } }
  return { root, source, local, subject: fixtureSubject, pins, provider, blobs, details, contexts,
    async advance() { await write(source, 'api/Query.md', '# Query\n\nThird fixture version.\n'); await git(source, 'add', '.'); await git(source, 'commit', '-qm', 'synthetic manual inventory addition'); target = await git(source, 'rev-parse', 'HEAD'); return collect() },
    async dispose() { await rm(root, { recursive: true, force: true }) } }
}
