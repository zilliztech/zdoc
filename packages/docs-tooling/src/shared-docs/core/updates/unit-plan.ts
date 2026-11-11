import { canonicalBytes, compareUtf8, digest } from './canonical'
import { compareSubjects, expectedLockPath, guidesUnitKey, validateBlobBytes, validateMemberBatch, validateUnitReports,
  validateUpdateReportEnvelope, type BlobRef, type ContentMember, type MaterialTree, type NextLockEdit,
  type Subject, type UpdateReportEnvelope, type UpdateUnitPlan } from './envelope'
import { parseLock } from '../lock'
import { computeUpdateUnits } from './units'
import { immutable, type AdoptionDependency, type PageIdentity } from './types'

export interface LockBytes { readonly blob: BlobRef; readonly text: string }
export interface CommitParents { readonly oid: string; readonly parents: readonly string[] }
/** Adapter-owned immutable facts, never authority inferred from an input report. The adapter must
 * authenticate Git objects, complete inventories, retained bytes and membership before capture.
 * Task 4 supplies preparedNext from the exact before bytes; this module never serializes YAML. */
export interface UnitMaterialContext {
  readonly subject: Subject
  readonly reportBlob: BlobRef
  readonly collectedReport: UpdateReportEnvelope
  readonly members: readonly ContentMember[]
  readonly lock: { readonly path: string; readonly before: LockBytes; readonly preparedNext: LockBytes | null }
  readonly history: readonly CommitParents[] | null
  /** Complete raw tree inventories are retained separately from semantic projections/OID exclusions. */
  readonly sourceInventories: { readonly commit: string; readonly treeOid: string; readonly inventory: BlobRef; readonly absentPaths: readonly string[] }[]
  /** Raw relevant upstream source/fragment bytes only; config, tools and images cannot open the gate. */
  readonly relevantSource: { readonly current: MaterialTree; readonly oldNext: MaterialTree; readonly target: MaterialTree } | null
  readonly reportingChanges: readonly string[]
  readonly holdReasons: readonly string[]
}
export const captureUnitMaterial = (context: UnitMaterialContext): UnitMaterialContext => immutable(structuredClone(context))
const same = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const reasons = (values: readonly string[]) => [...new Set(values)].sort(compareUtf8)
function ancestor(history: readonly CommitParents[], from: string, to: string) {
  const nodes = new Map(history.map(commit => [commit.oid, commit.parents]))
  if (nodes.size !== history.length || history.some(commit => !/^[0-9a-f]{40}$/.test(commit.oid) || commit.parents.some(p => !/^[0-9a-f]{40}$/.test(p)))) throw new Error('Invalid commit ancestry material')
  const pending = [to], seen = new Set<string>()
  while (pending.length) {
    const oid = pending.pop()!
    if (!nodes.has(oid) || seen.has(oid)) continue
    if (oid === from) return true
    seen.add(oid); pending.push(...nodes.get(oid)!)
  }
  return false
}
function contextFor(report: UpdateReportEnvelope, contexts: readonly UnitMaterialContext[]) {
  const matches = contexts.filter(context => same(context.subject, report.subject))
  if (matches.length !== 1) throw new Error('Exactly one collected material context is required per report')
  const context = matches[0]
  if (!same(context.collectedReport, report)) throw new Error('Report differs from collected material context')
  validateBlobBytes(context.reportBlob, canonicalBytes(report))
  if (!same(context.members, report.members)) throw new Error('Members differ from independently collected membership')
  if (context.lock.path !== expectedLockPath(report.subject)) throw new Error('Collected lock path differs from subject')
  validateBlobBytes(context.lock.before.blob, Buffer.from(context.lock.before.text))
  if (context.sourceInventories.length !== 3 || context.sourceInventories.some((inventory, index) => inventory.commit !== [report.pins.source.current, report.pins.source.oldNext, report.pins.source.target][index])) throw new Error('Source inventory evidence differs from exact source pins')
  return context
}
/** Pure planning over authenticated immutable material. No I/O, external services or build adapters. */
export function planUpdateUnit(reportValues: readonly UpdateReportEnvelope[], contexts: readonly UnitMaterialContext[]): UpdateUnitPlan {
  if (!reportValues.length || contexts.length !== reportValues.length) throw new Error('A complete material context is required for every unit report')
  const reports = [...reportValues].sort((a, b) => compareSubjects(a.subject, b.subject))
  const subjects = reports.map(report => report.subject)
  const unitKey = subjects[0].kind === 'guides-page' ? guidesUnitKey(subjects) : `sdk-manual:${subjects[0].manualId}`
  // Run batch namespace checks before narrower per-report binding, including all frozen F1 cases.
  validateMemberBatch([{ unitKey, reports: reports.map(report => ({ subject: report.subject, lockPath: expectedLockPath(report.subject), members: report.members })) }])
  reports.forEach(validateUpdateReportEnvelope)
  const hold: string[] = [], edits: NextLockEdit[] = []
  let failed = false, reportOnly = false
  const material = reports.map(report => contextFor(report, contexts))
  for (const [index, report] of reports.entries()) {
    const context = material[index], source = report.pins.source, localHoldCount = hold.length
    hold.push(...context.holdReasons)
    if (report.semanticProjection === null || context.relevantSource === null) hold.push('MATERIAL_UNAVAILABLE')
    if (report.authority.updateState !== 'eligible-to-propose') hold.push(report.authority.updateState === 'retired' ? 'AUTHORITY_RETIRED' : 'AUTHORITY_UNKNOWN')
    const before = parseLock(context.lock.before.text)
    if ('errors' in before) throw new Error('Collected lock is invalid')
    if (before.lock.current !== source.current || before.lock.next !== source.oldNext) throw new Error('Collected lock differs from exact source pins')
    if (!context.history) hold.push('SOURCE_HISTORY_UNAVAILABLE')
    else if (!ancestor(context.history, source.current, source.oldNext) || !ancestor(context.history, source.oldNext, source.target)
      || !ancestor(context.history, source.target, source.observedTrackHead)) hold.push('NON_FORWARD_HISTORY')
    if (report.axes.some(axis => axis.contentStatus === 'unavailable')) hold.push('INPUT_UNAVAILABLE')
    reportOnly ||= context.reportingChanges.length > 0 || report.configurationChanges.length > 0
    failed ||= report.axes.some(axis => axis.contentStatus === 'content-failure')
    const forward = context.relevantSource && source.oldNext !== source.target && !same(context.relevantSource.oldNext, context.relevantSource.target)
    if (!forward || hold.length > localHoldCount) continue
    if (!context.lock.preparedNext) { hold.push('PREPARED_NEXT_MATERIAL_REQUIRED'); continue }
    const prepared = context.lock.preparedNext
    validateBlobBytes(prepared.blob, Buffer.from(prepared.text))
    const after = parseLock(prepared.text)
    if ('errors' in after || after.lock.schema_version !== before.lock.schema_version || after.lock.current !== before.lock.current || after.lock.next !== source.target) throw new Error('Prepared lock must preserve schema/current and change next to the exact target')
    edits.push({ subject: report.subject, before: { path: context.lock.path, sha256: context.lock.before.blob.sha256,
      current: before.lock.current, next: before.lock.next }, target: source.target, afterBlob: prepared.blob })
  }
  // Every report in an indivisible unit shares the same transaction pins and repository identity.
  const first = reports[0].pins
  if (reports.some(({ pins }) => !same([pins.master, pins.dev, pins.trustedTools, pins.configSnapshot, pins.configTreeOid, pins.toolsetSha256, pins.registrySha256, pins.source.repository, pins.source.track],
    [first.master, first.dev, first.trustedTools, first.configSnapshot, first.configTreeOid, first.toolsetSha256, first.registrySha256, first.source.repository, first.source.track]))) hold.push('CROSS_REPOSITORY_OR_EXECUTION_PINS')
  const held = reasons(hold)
  const plan: UpdateUnitPlan = { kind: 'shared-update-unit', schemaVersion: 1, unitKey, subjects,
    membersSha256: digest('unit-members', reports.map(report => ({ subject: report.subject, memberSetSha256: report.memberSetSha256 }))),
    reports: material.map(context => context.reportBlob), nextEdits: held.length ? [] : edits.sort((a, b) => compareUtf8(a.before.path, b.before.path)),
    disposition: held.length ? 'hold' : edits.length ? failed ? 'draft-failure' : 'candidate' : reportOnly ? 'report-only' : 'noop', holdReasons: held,
    semanticInputSha256: reports.some(report => report.semanticInputSha256 === null) ? null : digest('unit-semantic', reports.map(report => ({ subject: report.subject, semanticInputSha256: report.semanticInputSha256 }))) }
  return immutable(validateUnitReports(plan, reports))
}
export interface PlanningGroups {
  readonly dependencies?: readonly AdoptionDependency[]
  /** Only a local journal-authenticated adapter may supply these identities; remote trailers are not evidence. */
  readonly localJournalUnits?: readonly (readonly PageIdentity[])[]
  readonly ambiguousExistingSubjects?: readonly Subject[]
}
/** Guides adoption grouping uses the accepted B1 algorithm. SDK manuals remain whole manuals. */
export function planUpdateBatch(contexts: readonly UnitMaterialContext[], grouping: PlanningGroups = {}): UpdateUnitPlan[] {
  const guides = contexts.filter(context => context.subject.kind === 'guides-page')
  const pages = guides.flatMap(context => context.members.map(member => ({ pageId: (context.subject as Extract<Subject, { kind: 'guides-page' }>).pageId, manual: member.manualId, path: member.outputPath })))
  // Validate globally before splitting into units, so cross-unit collisions never escape.
  validateMemberBatch(contexts.map(context => ({ unitKey: JSON.stringify(context.subject), reports: [{ subject: context.subject, lockPath: context.lock.path, members: [...context.members] }] })))
  const groups = computeUpdateUnits({ pages, dependencies: grouping.dependencies, existingUnits: grouping.localJournalUnits })
  const batches = groups.map(group => guides.filter(context => group.pages.some(page => context.subject.kind === 'guides-page' && page.pageId === context.subject.pageId)))
  for (const context of guides) if (!batches.some(batch => batch.includes(context))) batches.push([context])
  batches.push(...contexts.filter(context => context.subject.kind === 'sdk-manual').map(context => [context]))
  const plans = batches.map(batch => {
    const fixed = batch.map(context => grouping.ambiguousExistingSubjects?.some(subject => same(subject, context.subject))
      ? captureUnitMaterial({ ...context, holdReasons: [...context.holdReasons, 'EXISTING_UNIT_AUTHENTICATION_REQUIRED'] }) : context)
    return planUpdateUnit(fixed.map(context => context.collectedReport), fixed)
  })
  return plans.sort((a, b) => compareSubjects(a.subjects[0], b.subjects[0]))
}
