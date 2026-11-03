// @vitest-environment node
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import * as contract from '../../core/updates/envelope'
import { computeUpdateUnits } from '../../core/updates/units'
import vectors from './fixtures/member-vectors.json'
const sha = 'a'.repeat(40), target = 'b'.repeat(40), hash = 'c'.repeat(64)
const subject = { kind: 'guides-page' as const, group: 'guides' as const, pageId: 'alpha' }
const blob = { path: 'evidence/data.json', sha256: hash, bytes: 0 }
const member = { manualId: 'guides', logicalId: 'alpha', origin: 'upstream' as const, token: 'shared-alpha', outputPath: 'content/en/guides/alpha.mdx', current: true, next: true }
const tree = { entries: [{ path: 'data/input.md', sha256: hash, bytes: 0 }] }
const semantic = () => ({ kind: 'shared-update-semantic' as const, schemaVersion: 1 as const, subject,
  source: { repository: 'source', directory: 'pages/alpha', track: 'main' }, config: tree,
  lockSchema: { version: 1, path: 'shared-docs/guides/pages/alpha/lock.yaml' }, upstream: { current: tree, oldNext: tree, target: tree }, images: [], members: [member], registry: null,
  authority: { provider: 'guides-retained-source' as const, state: 'eligible-to-propose' as const, reasons: [], policySha256: hash }, providerPolicySha256: hash, toolsetSha256: hash })
const report = () => ({ kind: 'shared-update' as const, schemaVersion: 1 as const, subject,
  pins: { master: sha, dev: sha, trustedTools: sha, configSnapshot: sha, configTreeOid: sha, relevantConfigSha256: hash, comparisonConfig: null, toolsetSha256: hash, registrySha256: hash,
    source: { repository: 'source', track: 'main', observedTrackHead: target, current: sha, oldNext: sha, target } },
  authority: { provider: 'guides-retained-source' as const, subject, evidence: [blob], updateState: 'eligible-to-propose' as const, reasons: [] }, members: [member], memberSetSha256: digest('members', [member]),
  axes: [{ axis: 'old-next-to-target' as const, sourceChanged: true, outputChanged: true, contentStatus: 'valid' as const, added: [], removed: [], renameCandidates: [] },
    { axis: 'current-to-candidate-next' as const, sourceChanged: true, outputChanged: true, contentStatus: 'valid' as const, added: [], removed: [], renameCandidates: [] }],
  configurationChanges: [], detail: { kind: 'guides-impact-v1' as const, file: blob }, diagnostics: [], semanticProjection: semantic(), semanticInputSha256: digest('semantic', semantic()) })
const edit = () => ({ subject, before: { path: 'shared-docs/guides/pages/alpha/lock.yaml', sha256: hash, current: sha, next: sha }, target, afterBlob: blob })
const plan = () => ({ kind: 'shared-update-unit' as const, schemaVersion: 1 as const, unitKey: contract.guidesUnitKey([subject]), subjects: [subject], membersSha256: digest('unit-members', [{ subject, memberSetSha256: report().memberSetSha256 }]), reports: [blob], nextEdits: [edit()], disposition: 'candidate' as const, holdReasons: [], semanticInputSha256: digest('unit-semantic', [{ subject, semanticInputSha256: report().semanticInputSha256 }]) })
const toolset = () => ({ kind: 'shared-update-toolset', schemaVersion: 1, runtime: { name: 'node', version: '22', platform: 'linux', architecture: 'x64' }, flags: ['--z', '--a'], environment: [{ name: 'A', value: '' }, { name: 'Z', value: '1' }], files: tree.entries, dependencies: [{ name: 'x', version: '1', integrity: 'sha512-a', resolvedPath: 'node_modules/x' }] })
const revision = () => ({ kind: 'shared-update-revision', schemaVersion: 1, unitKey: contract.guidesUnitKey([subject]), subjects: [subject], parentHead: sha, master: sha, dev: sha, tools: sha, memberSetSha256: plan().membersSha256, planSha256: digest('plan', plan()), previousBotCommit: null, lockDeltas: [{ path: edit().before.path, current: sha, oldNext: sha, next: target }], preservedHumanHeads: [sha, target] })
const prepared = () => ({ kind: 'new', master: sha, base: sha, tree: sha })
const proof = () => ({ prepared: prepared(), candidate: target, candidateTree: sha, patch: blob, preservedHumanHeads: [sha], trustedToolsetSha256: hash, executableClosure: blob, nextEdits: [edit()] })
const pr = () => ({ repositoryId: 1, number: 1, base: sha, head: target, state: 'open', draft: true, actorId: 1, metadataEvidence: [blob] })
const manualDetail = () => ({ kind: 'manual-impact', schemaVersion: 1, manualId: 'rust', inventories: { current: blob, oldNext: blob, target: blob }, pages: [{ logicalPath: 'local.md', origin: 'local', upstream: null, local: { snapshot: sha, file: blob }, replacements: [], views: [{ pair: 'baseline', channel: 'current', status: 'compiled', output: blob }] }], fullBuild: { baseline: 'valid', candidate: 'failed' }, diagnostics: [] })
const samples = () => [
  ['Subject', subject], ['BlobRef', blob], ['LockState', edit().before], ['SourcePins', report().pins.source], ['ExecutionPins', report().pins], ['ContentMember', member], ['AuthorityObservation', report().authority], ['AxisSummary', report().axes[0]], ['UpdateReportEnvelope', report()], ['NextLockEdit', edit()], ['UpdateUnitPlan', plan()], ['ObservedPr', pr()], ['TransactionPreconditions', { master: sha, dev: sha, trustedTools: sha, prs: [pr()], unitPlanSha256: hash, authorityEvidence: [blob] }], ['BotRevision', revision()], ['OriginalObject', { state: 'present', commit: sha, repositoryPath: 'data/input.md', content: blob }], ['ReplacementContext', { logicalPath: 'p', ruleSha256: hash, channel: 'next', block: 'b', language: null, match: 'matched', source: { state: 'unavailable', reasons: ['MISSING'] }, span: null, fullContext: null }], ['ManualImpactReport', manualDetail()], ['PreparedBase', prepared()], ['CandidateSnapshotProof', proof()], ['ToolsetMaterial', toolset()], ['MaterialFile', tree.entries[0]], ['MaterialTree', tree], ['SemanticInput', semantic()],
] as const
const schema = (name: string) => (contract as unknown as Record<string, { parse(value: unknown): unknown }>)[`${name}Schema`]

it('exports strict validators for every frozen common value', () => {
  for (const [name, value] of samples()) expect(schema(name).parse(value), name).toEqual(value)
})
it('rejects unknown and omitted fields in every common object schema', () => {
  for (const [name, value] of samples()) {
    expect(() => schema(name).parse({ ...value, extra: true }), name).toThrow()
    for (const key of Object.keys(value)) {
      const missing = { ...value } as Record<string, unknown>; delete missing[key]
      expect(() => schema(name).parse(missing), `${name}.${key}`).toThrow()
    }
  }
})
it('validates decoded bytes through the strict parser before the envelope schema', () => {
  expect(contract.parseUpdateReportEnvelope(canonicalBytes(report()))).toEqual(report())
  expect(() => contract.parseUpdateReportEnvelope(Buffer.from('{"kind":"shared-update","kind":"shared-update"}'))).toThrow(/duplicate/i)
})
it.each(['../escape', '/absolute', 'a//b', 'a/./b', 'a/../b', 'a\\b', 'a/', 'C:/drive', 'a\u0000b', 'a\u007fb'])('rejects noncanonical repository paths: %s', path => {
  expect(() => contract.BlobRefSchema.parse({ ...blob, path })).toThrow()
})
it.each([-0, -1, 0.1, 9007199254740992])('rejects invalid byte lengths %s', bytes => { expect(() => contract.BlobRefSchema.parse({ ...blob, bytes })).toThrow() })
it('rejects invalid IDs, hashes, variants and nested unknown keys', () => {
  for (const value of [{ ...subject, pageId: '../alpha' }, { ...subject, group: 'rust' }, { ...subject, kind: 'other' }]) expect(() => contract.SubjectSchema.parse(value)).toThrow()
  for (const value of [{ ...blob, sha256: sha }, { ...blob, sha256: hash.toUpperCase() }]) expect(() => contract.BlobRefSchema.parse(value)).toThrow()
  expect(() => contract.ExecutionPinsSchema.parse({ ...report().pins, master: hash })).toThrow()
  expect(() => contract.ExecutionPinsSchema.parse({ ...report().pins, source: { ...report().pins.source, extra: 1 } })).toThrow()
  expect(() => contract.MaterialFileSchema.parse({ ...tree.entries[0], path: '\ud800' })).toThrow()
})
it('keeps explicit nulls and requires semantic projection/digest together', () => {
  expect(contract.validateUpdateReportEnvelope({ ...report(), semanticProjection: null, semanticInputSha256: null }).semanticProjection).toBeNull()
  expect(() => contract.validateUpdateReportEnvelope({ ...report(), semanticProjection: null })).toThrow()
  expect(() => contract.validateUpdateReportEnvelope({ ...report(), semanticInputSha256: null })).toThrow()
  expect(() => contract.validateUpdateReportEnvelope({ ...report(), semanticProjection: { ...semantic(), upstream: {} } })).toThrow()
})
it.each([
  (r: any) => { r.memberSetSha256 = hash }, (r: any) => { r.semanticInputSha256 = hash },
  (r: any) => { r.authority.subject = { ...subject, pageId: 'other' } },
  (r: any) => { r.detail.kind = 'manual-impact-v1' }, (r: any) => { r.authority.provider = 'manual-git-registration' },
  (r: any) => { r.semanticProjection.subject = { ...subject, pageId: 'other' }; r.semanticInputSha256 = digest('semantic', r.semanticProjection) },
  (r: any) => { r.semanticProjection.members = []; r.semanticInputSha256 = digest('semantic', r.semanticProjection) },
  (r: any) => { r.semanticProjection.source.track = 'other'; r.semanticInputSha256 = digest('semantic', r.semanticProjection) },
  (r: any) => { r.semanticProjection.toolsetSha256 = 'd'.repeat(64); r.semanticInputSha256 = digest('semantic', r.semanticProjection) },
])('rejects independently checkable report misbindings %#', mutate => {
  const value = structuredClone(report()); mutate(value); expect(() => contract.validateUpdateReportEnvelope(value)).toThrow()
})
it('requires both comparison axes in declared order', () => {
  for (const axes of [[], report().axes.slice(1), [...report().axes].reverse(), [report().axes[0], report().axes[0]]]) expect(() => contract.validateUpdateReportEnvelope({ ...report(), axes })).toThrow()
})
it('rejects unsorted or duplicate set arrays without silently normalizing them', () => {
  const bad: [string, unknown][] = [
    ['AuthorityObservation', { ...report().authority, reasons: ['Z', 'A'] }], ['AuthorityObservation', { ...report().authority, reasons: ['A', 'A'] }],
    ['AxisSummary', { ...report().axes[0], added: ['z', 'a'] }], ['AxisSummary', { ...report().axes[0], removed: ['a', 'a'] }],
    ['MaterialTree', { entries: [{ ...tree.entries[0], path: 'z' }, { ...tree.entries[0], path: 'a' }] }],
    ['ToolsetMaterial', { ...toolset(), environment: [...toolset().environment].reverse() }],
    ['ToolsetMaterial', { ...toolset(), dependencies: [{ ...toolset().dependencies[0], resolvedPath: 'z' }, { ...toolset().dependencies[0], resolvedPath: 'a' }] }],
    ['UpdateReportEnvelope', { ...report(), diagnostics: [{ code: 'Z', file: null, line: null, message: 'a' }, { code: 'A', file: null, line: null, message: 'a' }] }],
    ['UpdateReportEnvelope', { ...report(), configurationChanges: [{ path: 'z', before: null, after: blob }, { path: 'a', before: null, after: blob }] }],
    ['BotRevision', { ...revision(), preservedHumanHeads: [target, sha] }],
    ['AxisSummary', { ...report().axes[0], renameCandidates: [{ before: 'z', after: 'a', evidence: [] }, { before: 'a', after: 'z', evidence: [] }] }],
    ['AuthorityObservation', { ...report().authority, evidence: [{ ...blob, path: 'z' }, { ...blob, path: 'a' }] }],
    ['SemanticInput', { ...semantic(), images: [{ logicalSource: 'z', sha256: hash, bytes: 1, address: 'a' }, { logicalSource: 'a', sha256: hash, bytes: 1, address: 'b' }] }],
  ]
  for (const [name, value] of bad) expect(() => schema(name).parse(value), name).toThrow()
  expect(contract.ToolsetMaterialSchema.parse(toolset()).flags).toEqual(['--z', '--a'])
})
it('binds lock edits, unit subjects, disposition and report-derived unit digests', () => {
  expect(contract.validateUnitReports(plan(), [report()])).toEqual(plan())
  for (const value of [{ ...edit(), before: { ...edit().before, path: 'arbitrary/lock.yaml' } }, { ...edit(), target: sha }]) expect(() => contract.NextLockEditSchema.parse(value)).toThrow()
  for (const value of [{ ...plan(), disposition: 'hold' }, { ...plan(), nextEdits: [edit(), edit()] }, { ...plan(), subjects: [subject, subject] }, { ...plan(), unitKey: 'sdk-manual:rust' }]) expect(() => contract.UpdateUnitPlanSchema.parse(value)).toThrow()
  expect(() => contract.validateUnitReports({ ...plan(), membersSha256: hash }, [report()])).toThrow()
  expect(() => contract.validateUnitReports({ ...plan(), semanticInputSha256: hash }, [report()])).toThrow()
  expect(() => contract.validateUnitReports(plan(), [])).toThrow()
})
it('supports SDK contracts without Guides or Base fields and keeps the manual key stable', () => {
  const r: any = structuredClone(report()), s = { kind: 'sdk-manual', group: 'rust', manualId: 'rust' }
  r.subject = s; r.members = [{ ...member, manualId: 'rust', logicalId: 'api/create', token: 'create' }]; r.memberSetSha256 = digest('members', r.members)
  r.authority.subject = s; r.authority.provider = 'manual-git-registration'; r.detail.kind = 'manual-impact-v1'
  r.semanticProjection = null; r.semanticInputSha256 = null
  expect(contract.validateUpdateReportEnvelope(r)).toEqual(r)
  const p = { ...plan(), unitKey: 'sdk-manual:rust', subjects: [s], nextEdits: [{ ...edit(), subject: s, before: { ...edit().before, path: 'shared-docs/rust/lock.yaml' } }] }
  expect(contract.UpdateUnitPlanSchema.parse(p).unitKey).toBe('sdk-manual:rust')
  expect(() => contract.UpdateUnitPlanSchema.parse({ ...p, subjects: [s, subject] })).toThrow()
})
it.each(vectors.cases)('runs frozen $id through production member validation and existing Guides grouping', vector => {
  const validate = () => contract.validateMemberBatch(vector.units)
  if (vector.expectedErrors.length) expect(validate).toThrow(vector.expectedErrors[0])
  else {
    expect(validate()).toEqual(vector.units)
    const claims = vector.units.flatMap(unit => unit.reports)
    expect(new Set(claims.map(claim => claim.lockPath)).size).toBe(vector.expectedDistinctLocks)
    const pages = claims.flatMap(claim => claim.members.map(m => ({ pageId: claim.subject.pageId, manual: m.manualId, path: m.outputPath })))
    expect(computeUpdateUnits({ pages })).toHaveLength(1)
    expect(contract.NextLockEditSchema.parse({ ...edit(), subject: claims[0].subject, before: { ...edit().before, path: claims[0].lockPath } })).toBeDefined()
  }
})
it('preserves the frozen vector bytes and V1 canonical members digest', () => {
  expect(createHash('sha256').update(readFileSync(new URL('./fixtures/member-vectors.json', import.meta.url))).digest('hex')).toBe('a4d6ae5a4913272ac6f7d6f7093a37554a83c47f74b475539977bc9bd7cfb712')
  const members = vectors.cases[0].units[0].reports[0].members
  expect(digest('members', members)).toBe('3b1874d3f85b3148b8d24a7aadb64a8429277b429331fc367becd7c798480c62')
})
it('checks subject and lock uniqueness independently of member identities across the batch', () => {
  const first = { subject, lockPath: edit().before.path, members: [member] }
  expect(() => contract.validateMemberBatch([{ unitKey: 'a', reports: [first] }, { unitKey: 'b', reports: [{ ...first, members: [] }] }])).toThrow(/SUBJECT/)
  expect(() => contract.validateMemberBatch([{ unitKey: 'a', reports: [{ ...first, lockPath: 'other/lock.yaml' }] }])).toThrow(/lock/i)
})
it('verifies retained BlobRef bytes with raw SHA-256, including the final newline', () => {
  const bytes = Buffer.from('value\n'), reference = { ...blob, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }
  expect(contract.validateBlobBytes(reference, bytes)).toEqual(reference)
  expect(() => contract.validateBlobBytes(reference, Buffer.from('value'))).toThrow()
  expect(() => contract.validateBlobBytes({ ...reference, sha256: digest('policy', 'value\n') }, bytes)).toThrow()
  expect(() => contract.validateBlobBytes({ ...reference, bytes: bytes.length + 1 }, bytes)).toThrow()
})
it('strictly validates the alternate SDK, original-object and prepared-base variants', () => {
  const values: [string, Record<string, unknown>][] = [
    ['Subject', { kind: 'sdk-manual', group: 'rust', manualId: 'rust' }],
    ['OriginalObject', { state: 'absent', commit: sha, repositoryPath: 'missing.md', inventory: blob }],
    ['OriginalObject', { state: 'unavailable', reasons: ['MISSING_OBJECT'] }],
    ['PreparedBase', { kind: 'existing', master: sha, humanHead: target, base: sha, tree: sha, mergeEvidence: blob, preservationEvidence: blob }],
  ]
  for (const [name, value] of values) {
    expect(schema(name).parse(value)).toEqual(value)
    expect(() => schema(name).parse({ ...value, extra: 1 })).toThrow()
    for (const key of Object.keys(value)) { const missing = { ...value }; delete missing[key]; expect(() => schema(name).parse(missing)).toThrow() }
  }
})
it('uses UTF-8 tuple ordering for subjects, members and diagnostics', () => {
  const sdk = { kind: 'sdk-manual' as const, group: 'rust', manualId: 'rust' }
  expect(contract.compareSubjects(subject, sdk)).toBeLessThan(0)
  const members = [{ ...member, logicalId: '\ue000', token: 'a', outputPath: 'a.mdx' }, { ...member, logicalId: '𐀀', token: 'b', outputPath: 'b.mdx' }]
  expect(contract.ContentMembersSchema.parse(members)).toEqual(members)
  expect(() => contract.ContentMembersSchema.parse([...members].reverse())).toThrow()
  const d = [{ code: 'A', message: 'a', file: null, line: null }, { code: 'A', message: 'a', file: 'a', line: 1 }, { code: 'A', message: 'b', file: 'a', line: 1 }]
  expect(contract.UpdateReportEnvelopeSchema.parse({ ...report(), diagnostics: d }).diagnostics).toEqual(d)
  expect(() => contract.UpdateReportEnvelopeSchema.parse({ ...report(), diagnostics: [...d].reverse() })).toThrow()
})
it('binds semantic registry, authority and lock exclusion independently of a supplied digest', () => {
  for (const projection of [
    { ...semantic(), registry: { manualId: 'rust', group: 'rust', configPath: 'config.yaml', outputRoot: 'content/en/rust', landingPath: 'index.md', policySha256: hash } },
    { ...semantic(), lockSchema: { version: 1, path: 'elsewhere/lock.yaml' } },
    { ...semantic(), config: { entries: [{ ...tree.entries[0], path: edit().before.path }] } },
    { ...semantic(), authority: { ...semantic().authority, provider: 'manual-git-registration' } },
  ]) expect(() => contract.SemanticInputSchema.parse(projection)).toThrow()
  const projection = { ...semantic(), authority: { ...semantic().authority, reasons: ['NEW_POLICY'] } }
  expect(() => contract.validateUpdateReportEnvelope({ ...report(), semanticProjection: projection, semanticInputSha256: digest('semantic', projection) })).toThrow()
})
it('rejects duplicate/out-of-order lock edits and subjects, preserving report reference subject order', () => {
  const other = { ...subject, pageId: 'beta' }, otherEdit = { ...edit(), subject: other, before: { ...edit().before, path: 'shared-docs/guides/pages/beta/lock.yaml' } }
  const multi = { ...plan(), unitKey: contract.guidesUnitKey([subject, other]), subjects: [subject, other], nextEdits: [edit(), otherEdit], reports: [{ ...blob, path: 'z.json' }, { ...blob, path: 'a.json' }] }
  expect(contract.UpdateUnitPlanSchema.parse(multi).reports.map(ref => ref.path)).toEqual(['z.json', 'a.json'])
  expect(() => contract.UpdateUnitPlanSchema.parse({ ...multi, nextEdits: [...multi.nextEdits].reverse() })).toThrow()
  expect(() => contract.UpdateUnitPlanSchema.parse({ ...multi, subjects: [...multi.subjects].reverse() })).toThrow()
  expect(() => contract.BotRevisionSchema.parse({ ...revision(), lockDeltas: [{ ...revision().lockDeltas[0], path: 'other/lock.yaml' }] })).toThrow()
})
it('preserves Transform evaluation order but rejects repeated replacement identities and view identities', () => {
  const replacement = { logicalPath: 'p', ruleSha256: hash, channel: 'next', block: 'z', language: null, match: 'missing', source: { state: 'unavailable', reasons: ['UNKNOWN'] }, span: null, fullContext: null }
  const value = manualDetail(), page = { ...value.pages[0], replacements: [replacement, { ...replacement, block: 'a' }] }
  expect(contract.ManualImpactReportSchema.parse({ ...value, pages: [page] }).pages[0].replacements.map(item => item.block)).toEqual(['z', 'a'])
  expect(() => contract.ManualImpactReportSchema.parse({ ...value, pages: [{ ...page, replacements: [replacement, replacement] }] })).toThrow()
  expect(() => contract.ManualImpactReportSchema.parse({ ...value, pages: [{ ...page, views: [page.views[0], page.views[0]] }] })).toThrow()
  expect(() => contract.ReplacementContextSchema.parse({ ...replacement, span: { firstLine: 3, lastLine: 1, text: blob } })).toThrow()
})
it('does not apply local metadata capacity limits to frozen report shapes', () => {
  const long = 'a'.repeat(1024)
  expect(contract.ContentMemberSchema.parse({ ...member, logicalId: long, token: long }).logicalId).toHaveLength(1024)
  expect(contract.BlobRefSchema.parse({ ...blob, bytes: Number.MAX_SAFE_INTEGER }).bytes).toBe(Number.MAX_SAFE_INTEGER)
})
it('rejects unknown keys at every nested object boundary and parses common values from bytes', () => {
  for (const [name, original] of samples()) {
    const visit = (value: unknown, path: (string | number)[]) => {
      if (!value || typeof value !== 'object') return
      if (!Array.isArray(value)) {
        const corrupt = structuredClone(original) as unknown as Record<string | number, unknown>
        let at = corrupt
        for (const segment of path) at = at[segment] as Record<string | number, unknown>
        at.unexpected = true
        expect(() => schema(name).parse(corrupt), `${name}.${path.join('.')}`).toThrow()
      }
      for (const [key, child] of Object.entries(value)) visit(child, [...path, key])
    }
    visit(original, [])
  }
  expect(contract.parseCanonicalValue(contract.ToolsetMaterialSchema, canonicalBytes(toolset()))).toEqual(toolset())
  expect(() => contract.parseCanonicalValue(contract.BlobRefSchema, Buffer.from('{"path":"a","path":"b"}'))).toThrow(/duplicate/i)
})

it('allows complete semantic material when compiled output is unavailable', () => {
  const value: contract.UpdateReportEnvelope = structuredClone(report())
  value.axes[0].contentStatus = 'unavailable'; value.axes[0].outputChanged = 'unknown'
  expect(contract.validateUpdateReportEnvelope(value).semanticInputSha256).toBe(report().semanticInputSha256)
  expect(contract.RepoPathSchema.parse('data/a:b.md')).toBe('data/a:b.md')
})
it.each(['candidate', 'draft-failure', 'noop', 'report-only'] as const)('rejects a null semantic digest for standalone %s units', disposition => {
  const value = { ...plan(), disposition, semanticInputSha256: null, nextEdits: disposition === 'candidate' || disposition === 'draft-failure' ? [edit()] : [] }
  expect(() => contract.UpdateUnitPlanSchema.parse(value)).toThrow(/semantic.*hold/i)
})
it.each(['candidate', 'draft-failure', 'noop', 'report-only'] as const)('rejects a null semantic digest for report-bound %s units', disposition => {
  const value = { ...plan(), disposition, semanticInputSha256: null, nextEdits: disposition === 'candidate' || disposition === 'draft-failure' ? [edit()] : [] }
  const incomplete = { ...report(), semanticProjection: null, semanticInputSha256: null }
  expect(() => contract.validateUnitReports(value, [incomplete])).toThrow(/semantic.*hold/i)
})
it('retains holds with null or complete material, including unavailable compiled output', () => {
  const hold = { ...plan(), disposition: 'hold' as const, nextEdits: [], holdReasons: ['INPUT_UNKNOWN'] }
  const incomplete = { ...report(), semanticProjection: null, semanticInputSha256: null }
  expect(contract.validateUnitReports({ ...hold, semanticInputSha256: null }, [incomplete]).disposition).toBe('hold')
  expect(contract.validateUnitReports(hold, [report()]).semanticInputSha256).toBe(hold.semanticInputSha256)
  const complete: contract.UpdateReportEnvelope = structuredClone(report())
  complete.axes[0].contentStatus = 'unavailable'; complete.axes[0].outputChanged = 'unknown'
  expect(contract.validateUnitReports(hold, [complete]).semanticInputSha256).toBe(hold.semanticInputSha256)
})
it.each(['current', 'oldNext', 'target'] as const)('rejects an edit that differs from its report source %s pin', field => {
  const value = structuredClone(plan()), mismatch = 'd'.repeat(40)
  if (field === 'current') value.nextEdits[0].before.current = mismatch
  else if (field === 'oldNext') value.nextEdits[0].before.next = mismatch
  else value.nextEdits[0].target = mismatch
  expect(() => contract.validateUnitReports(value, [report()])).toThrow(/edit.*source.*pin/i)
})
it('matches each edit to its exact report subject in a multi-subject unit', () => {
  const other = { ...subject, pageId: 'beta' }, otherMembers = [{ ...member, logicalId: 'beta', token: 'shared-beta', outputPath: 'content/en/guides/beta.mdx' }]
  const otherProjection = { ...semantic(), subject: other, members: otherMembers, lockSchema: { version: 1, path: 'shared-docs/guides/pages/beta/lock.yaml' } }
  const otherSource = { ...report().pins.source, current: 'c'.repeat(40), oldNext: 'd'.repeat(40), target: 'e'.repeat(40) }
  const otherReport = { ...report(), subject: other, pins: { ...report().pins, source: otherSource }, authority: { ...report().authority, subject: other }, members: otherMembers,
    memberSetSha256: digest('members', otherMembers), semanticProjection: otherProjection, semanticInputSha256: digest('semantic', otherProjection) }
  const reports = [report(), otherReport]
  const value = { ...plan(), unitKey: contract.guidesUnitKey([subject, other]), subjects: [subject, other], reports: [blob, { ...blob, path: 'evidence/other-report.json' }],
    membersSha256: digest('unit-members', reports.map(r => ({ subject: r.subject, memberSetSha256: r.memberSetSha256 }))),
    semanticInputSha256: digest('unit-semantic', reports.map(r => ({ subject: r.subject, semanticInputSha256: r.semanticInputSha256 }))),
    nextEdits: [edit(), { ...edit(), subject: other, before: { ...edit().before, path: otherProjection.lockSchema.path, current: otherSource.current, next: otherSource.oldNext }, target: otherSource.target }] }
  expect(contract.validateUnitReports(value, reports)).toEqual(value)
})

it('loads and validates envelopes through the actual app-local TypeScript launcher', () => {
  const launcher = fileURLToPath(new URL('../../../../../../scripts/lib/load-typescript.js', import.meta.url))
  const envelope = fileURLToPath(new URL('../../core/updates/envelope.ts', import.meta.url))
  const output = execFileSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict')
    const { loadTypeScript } = require(process.argv[1])
    const envelope = loadTypeScript(process.argv[2])
    const value = JSON.parse(process.argv[3])
    assert.deepEqual(envelope.parseUpdateReportEnvelope(Buffer.from(process.argv[3])), value)
    assert.equal(envelope.BlobRefSchema.safeParse(value.detail.file).success, true)
    assert.equal(envelope.BlobRefSchema.safeParse({ ...value.detail.file, extra: true }).success, false)
    process.stdout.write('app-local-loader-ok')
  `, launcher, envelope, JSON.stringify(report())], { encoding: 'utf8', timeout: 30_000 })
  expect(output).toBe('app-local-loader-ok')
})
