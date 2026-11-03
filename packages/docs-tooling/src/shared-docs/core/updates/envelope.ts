import { createHash } from 'node:crypto'
import { z } from 'zod'
import { canonicalBytes, compareUtf8, digest, isValidUnicode, parseStrictJson } from './canonical'

/** Structural validity is not authority. Adapters authenticate objects, paths and retained bytes. */
export type GitSha = string; // exact lowercase 40 hex; independently verified commit object
export type GitTreeOid = string; // exact lowercase 40 hex; verified tree object, not SHA-256
export type Digest = string; // exact lowercase 64 hex
export type RepoPath = string; // confined, normalized repository-relative path
export interface BlobRef { path: RepoPath; sha256: Digest; bytes: number } // exact retained bytes; path within evidence root
export type Subject =
  | { kind: 'guides-page'; group: 'guides'; pageId: string }
  | { kind: 'sdk-manual'; group: string; manualId: string };
export interface LockState { path: RepoPath; sha256: Digest; current: GitSha; next: GitSha }
export interface SourcePins {
  repository: string; track: string; observedTrackHead: GitSha;
  current: GitSha; oldNext: GitSha; target: GitSha;
}
export interface ExecutionPins {
  master: GitSha; dev: GitSha; trustedTools: GitSha;
  configSnapshot: GitSha; configTreeOid: GitTreeOid; relevantConfigSha256: Digest;
  comparisonConfig: GitSha | null; toolsetSha256: Digest;
  registrySha256: Digest; source: SourcePins;
}
export interface ContentMember {
  // en only; identity (manualId, logicalId); token key (manualId, token).
  // outputPath is the complete repository-relative physical file path.
  logicalId: string; manualId: string; token: string; outputPath: RepoPath;
  origin: 'upstream' | 'local'; current: boolean; next: boolean;
}
export interface AuthorityObservation {
  provider: 'guides-retained-source' | 'manual-git-registration';
  subject: Subject; evidence: BlobRef[];
  updateState: 'eligible-to-propose' | 'retired' | 'unknown';
  reasons: string[];
}
export interface AxisSummary {
  axis: 'old-next-to-target' | 'current-to-candidate-next';
  sourceChanged: boolean | 'unknown'; outputChanged: boolean | 'unknown';
  contentStatus: 'valid' | 'content-failure' | 'unavailable';
  added: string[]; removed: string[];
  renameCandidates: { before: string; after: string; evidence: BlobRef[] }[];
}
export interface UpdateReportEnvelope {
  kind: 'shared-update'; schemaVersion: 1;
  subject: Subject; pins: ExecutionPins; authority: AuthorityObservation;
  members: ContentMember[]; memberSetSha256: Digest;
  axes: AxisSummary[];
  configurationChanges: { path: RepoPath; before: BlobRef | null; after: BlobRef | null }[];
  detail: { kind: 'guides-impact-v1' | 'manual-impact-v1'; file: BlobRef };
  diagnostics: { code: string; message: string; file: RepoPath | null; line: number | null }[];
  semanticProjection: SemanticInput | null; semanticInputSha256: Digest | null;
}
export interface NextLockEdit {
  subject: Subject; before: LockState; target: GitSha;
  afterBlob: BlobRef; // parsed after must preserve schema/current and change next only
}
export interface UpdateUnitPlan {
  kind: 'shared-update-unit'; schemaVersion: 1; unitKey: string;
  subjects: Subject[]; membersSha256: Digest;
  reports: BlobRef[]; nextEdits: NextLockEdit[];
  disposition: 'noop' | 'report-only' | 'draft-failure' | 'candidate' | 'hold';
  holdReasons: string[]; semanticInputSha256: Digest | null;
}
export interface ObservedPr {
  repositoryId: number; number: number; base: GitSha; head: GitSha;
  state: 'open' | 'closed' | 'merged'; draft: boolean;
  actorId: number; metadataEvidence: BlobRef[];
}
export interface TransactionPreconditions {
  master: GitSha; dev: GitSha; trustedTools: GitSha;
  prs: ObservedPr[]; unitPlanSha256: Digest; authorityEvidence: BlobRef[];
}
export interface BotRevision {
  kind: 'shared-update-revision'; schemaVersion: 1; unitKey: string;
  subjects: Subject[]; parentHead: GitSha; master: GitSha; dev: GitSha;
  tools: GitSha; memberSetSha256: Digest; planSha256: Digest;
  previousBotCommit: GitSha | null;
  lockDeltas: { path: RepoPath; current: GitSha; oldNext: GitSha; next: GitSha }[];
  preservedHumanHeads: GitSha[];
}
export interface UpdateProvider {
  kind: Subject['kind'];
  collect(subject: Subject, pins: ExecutionPins): Promise<UpdateReportEnvelope>;
  planNext(report: UpdateReportEnvelope): UpdateUnitPlan; // pure calculation
}
export interface MetadataStore {
  read(pr: ObservedPr): Promise<{ status: 'verified'; revision: BotRevision }
    | { status: 'unknown'; reasons: string[] }>;
  prepare(revision: BotRevision): { commitMessage: string; files: BlobRef[] };
}
export type OriginalObject =
  | { state: 'present'; commit: GitSha; repositoryPath: RepoPath; content: BlobRef }
  | { state: 'absent'; commit: GitSha; repositoryPath: RepoPath; inventory: BlobRef }
  | { state: 'unavailable'; reasons: string[] };
export interface ReplacementContext {
  logicalPath: string; ruleSha256: Digest; channel: 'current' | 'next';
  block: string; language: string | null;
  match: 'matched' | 'missing' | 'ambiguous';
  source: OriginalObject;
  span: { firstLine: number; lastLine: number; text: BlobRef } | null;
  fullContext: BlobRef | null;
}
export interface ManualImpactReport {
  kind: 'manual-impact'; schemaVersion: 1; manualId: string;
  inventories: { current: BlobRef; oldNext: BlobRef; target: BlobRef };
  pages: { logicalPath: string; origin: 'upstream' | 'local';
    upstream: { current: OriginalObject; oldNext: OriginalObject; target: OriginalObject } | null;
    local: { snapshot: GitSha; file: BlobRef } | null;
    replacements: ReplacementContext[];
    views: { pair: 'baseline' | 'candidate'; channel: 'current' | 'next';
      status: 'compiled' | 'absent' | 'error' | 'unavailable'; output: BlobRef | null }[];
  }[];
  fullBuild: { baseline: 'valid' | 'failed' | 'unavailable'; candidate: 'valid' | 'failed' | 'unavailable' };
  diagnostics: UpdateReportEnvelope['diagnostics'];
}
export type PreparedBase =
  | { kind: 'new'; master: GitSha; base: GitSha; tree: GitTreeOid }
  | { kind: 'existing'; master: GitSha; humanHead: GitSha;
      base: GitSha; tree: GitTreeOid; mergeEvidence: BlobRef;
      preservationEvidence: BlobRef };
export interface CandidateSnapshotProof {
  prepared: PreparedBase; candidate: GitSha; candidateTree: GitTreeOid;
  patch: BlobRef; preservedHumanHeads: GitSha[];
  trustedToolsetSha256: Digest; executableClosure: BlobRef;
  nextEdits: NextLockEdit[];
}
export interface ToolsetMaterial {
  kind: 'shared-update-toolset'; schemaVersion: 1;
  runtime: { name: string; version: string; platform: string; architecture: string };
  flags: string[]; // execution order is material
  environment: { name: string; value: string }[]; // only allowlisted nonsecret execution settings
  files: MaterialFile[];
  dependencies: { name: string; version: string; integrity: string; resolvedPath: RepoPath }[];
}
export interface MaterialFile { path: RepoPath; sha256: Digest; bytes: number }
export interface MaterialTree { entries: MaterialFile[] }
export interface SemanticInput {
  kind: 'shared-update-semantic'; schemaVersion: 1; subject: Subject;
  source: { repository: string; directory: RepoPath; track: string };
  config: MaterialTree; // relevant local bytes; lock OIDs excluded as specified below
  lockSchema: { version: number; path: RepoPath };
  upstream: { current: MaterialTree; oldNext: MaterialTree; target: MaterialTree };
  images: { logicalSource: string; sha256: Digest; bytes: number; address: string }[];
  members: ContentMember[];
  registry: { manualId: string; group: string; configPath: RepoPath;
    outputRoot: RepoPath; landingPath: RepoPath; policySha256: Digest } | null;
  authority: { provider: AuthorityObservation['provider'];
    state: AuthorityObservation['updateState']; reasons: string[]; policySha256: Digest };
  providerPolicySha256: Digest; toolsetSha256: Digest;
}

/** The repository disables strictNullChecks; explicitly expose frozen required-field types.
 * Zod still enforces required fields and explicit nulls at runtime. */
const text = z.string().refine(isValidUnicode, 'Invalid Unicode surrogate')
const label = text.min(1).refine(value => !/[\x00-\x1f\x7f-\x9f]/.test(value), 'Control character in identifier')
const id = label.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const GitShaSchema = text.regex(/^[0-9a-f]{40}$/) as z.ZodType<GitSha>
export const GitTreeOidSchema = text.regex(/^[0-9a-f]{40}$/) as z.ZodType<GitTreeOid>
export const DigestSchema = text.regex(/^[0-9a-f]{64}$/) as z.ZodType<Digest>
export const RepoPathSchema = label.refine(value => !value.includes('\\') && !/^[a-z]:/i.test(value)
  && value.split('/').every(part => part !== '' && part !== '.' && part !== '..'), 'Noncanonical repository path') as z.ZodType<RepoPath>
const integer = z.number().refine(value => Number.isSafeInteger(value) && !Object.is(value, -0), 'Expected safe integer other than -0')
const size = integer.refine(value => value >= 0, 'Expected nonnegative integer')
const positive = integer.refine(value => value > 0, 'Expected positive integer')
type SortPart = string | number
function compareTuple(a: readonly SortPart[], b: readonly SortPart[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const result = typeof a[i] === 'number' && typeof b[i] === 'number' ? (a[i] as number) - (b[i] as number) : compareUtf8(String(a[i]), String(b[i]))
    if (result) return result
  }
  return a.length - b.length
}
function ordered<T>(schema: z.ZodType<T>, key: (value: T) => readonly SortPart[]) {
  return z.array(schema).superRefine((values, context) => {
    for (let i = 1; i < values.length; i++) if (compareTuple(key(values[i - 1]), key(values[i])) >= 0) {
      context.addIssue({ code: 'custom', path: [i], message: 'Array must be strictly sorted with unique identities' })
    }
  })
}
function checked<T extends z.ZodType>(schema: T, check: (value: z.infer<T>) => void) {
  return schema.superRefine((value, context) => {
    try { check(value) } catch (error) { context.addIssue({ code: 'custom', message: error instanceof Error ? error.message : String(error) }) }
  })
}
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
function equal(a: unknown, b: unknown): boolean {
  const left = canonicalBytes(a), right = canonicalBytes(b)
  return left.length === right.length && left.every((value, index) => value === right[index])
}
const reasons = ordered(label, value => [value])
const heads = ordered(GitShaSchema, value => [value])
export const SubjectSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('guides-page'), group: z.literal('guides'), pageId: id }),
  z.strictObject({ kind: z.literal('sdk-manual'), group: id, manualId: id }),
]) as z.ZodType<Subject>
export function subjectKey(subject: Subject): readonly string[] { return [subject.kind, subject.group, subject.kind === 'guides-page' ? subject.pageId : subject.manualId] }
export function compareSubjects(a: Subject, b: Subject): number { return compareTuple(subjectKey(a), subjectKey(b)) }
const subjects = ordered(SubjectSchema, subjectKey).min(1)
export function expectedLockPath(subject: Subject): string {
  const valid = SubjectSchema.parse(subject)
  return valid.kind === 'guides-page' ? `shared-docs/guides/pages/${valid.pageId}/lock.yaml` : `shared-docs/${valid.group}/lock.yaml`
}
export function guidesUnitKey(values: Subject[]): string {
  const valid = subjects.parse(values)
  assert(valid.every(value => value.kind === 'guides-page'), 'Guides unit requires Guides subjects')
  return `guides:${createHash('sha256').update(canonicalBytes(valid)).digest('hex')}`
}
function bindUnit(key: string, values: Subject[]): void {
  assert(values.every(value => value.kind === values[0].kind), 'Mixed Guides/SDK unit')
  if (values[0].kind === 'sdk-manual') {
    assert(values.length === 1 && key === `sdk-manual:${values[0].manualId}`, 'SDK unit must retain its single whole-manual identity')
  } else assert(key === guidesUnitKey(values), 'Guides unit key does not bind its subjects')
}
export const BlobRefSchema = z.strictObject({ path: RepoPathSchema, sha256: DigestSchema, bytes: size }) as z.ZodType<BlobRef>
const blobs = ordered(BlobRefSchema, value => [value.path])
export const MaterialFileSchema = z.strictObject({ path: RepoPathSchema, sha256: DigestSchema, bytes: size }) as z.ZodType<MaterialFile>
export const MaterialTreeSchema = z.strictObject({ entries: ordered(MaterialFileSchema, value => [value.path]) }) as z.ZodType<MaterialTree>
export const LockStateSchema = z.strictObject({ path: RepoPathSchema, sha256: DigestSchema, current: GitShaSchema, next: GitShaSchema }) as z.ZodType<LockState>
export const SourcePinsSchema = z.strictObject({ repository: label, track: label, observedTrackHead: GitShaSchema, current: GitShaSchema, oldNext: GitShaSchema, target: GitShaSchema }) as z.ZodType<SourcePins>
export const ExecutionPinsSchema = z.strictObject({ master: GitShaSchema, dev: GitShaSchema, trustedTools: GitShaSchema, configSnapshot: GitShaSchema, configTreeOid: GitTreeOidSchema,
  relevantConfigSha256: DigestSchema, comparisonConfig: GitShaSchema.nullable(), toolsetSha256: DigestSchema, registrySha256: DigestSchema, source: SourcePinsSchema }) as z.ZodType<ExecutionPins>
export const ContentMemberSchema = z.strictObject({ logicalId: label, manualId: id, token: label, outputPath: RepoPathSchema, origin: z.enum(['upstream', 'local']), current: z.boolean(), next: z.boolean() }) as z.ZodType<ContentMember>
/** These keys apply across reports and units, irrespective of origin or unit identity. */
function assertMemberNamespace(members: ContentMember[]): void {
  const logical = new Set<string>(), tokens = new Set<string>(), paths = new Set<string>()
  for (const member of members) {
    const logicalKey = JSON.stringify([member.manualId, member.logicalId]), tokenKey = JSON.stringify([member.manualId, member.token])
    assert(!logical.has(logicalKey), 'DUPLICATE_MANUAL_LOGICAL_ID'); logical.add(logicalKey)
    assert(!tokens.has(tokenKey), 'DUPLICATE_MANUAL_TOKEN'); tokens.add(tokenKey)
    assert(!paths.has(member.outputPath), 'DUPLICATE_OUTPUT_PATH'); paths.add(member.outputPath)
  }
}
export const ContentMembersSchema = checked(ordered(ContentMemberSchema, value => [value.manualId, value.logicalId, value.origin]), assertMemberNamespace) as z.ZodType<ContentMember[]>
function bindMembers(subject: Subject, members: ContentMember[]): void {
  for (const member of members) {
    if (subject.kind === 'sdk-manual') assert(member.manualId === subject.manualId, 'Member manual differs from SDK subject')
    else {
      assert(member.manualId === 'guides' || member.manualId === 'guides-byoc', 'Unexpected Guides publication manual')
      assert(member.logicalId === subject.pageId && member.token === `shared-${subject.pageId}`, 'Guides member identity/token differs from subject')
    }
  }
}
const provider = z.enum(['guides-retained-source', 'manual-git-registration'])
const authorityState = z.enum(['eligible-to-propose', 'retired', 'unknown'])
function bindProvider(subject: Subject, value: AuthorityObservation['provider']): void {
  assert(value === (subject.kind === 'guides-page' ? 'guides-retained-source' : 'manual-git-registration'), 'Authority provider differs from subject')
}
export const AuthorityObservationSchema = checked(z.strictObject({ provider, subject: SubjectSchema, evidence: blobs, updateState: authorityState, reasons }), value => bindProvider(value.subject, value.provider)) as z.ZodType<AuthorityObservation>
const axis = z.enum(['old-next-to-target', 'current-to-candidate-next'])
const changed = z.union([z.boolean(), z.literal('unknown')])
export const AxisSummarySchema = z.strictObject({ axis, sourceChanged: changed, outputChanged: changed, contentStatus: z.enum(['valid', 'content-failure', 'unavailable']), added: reasons, removed: reasons,
  renameCandidates: ordered(z.strictObject({ before: label, after: label, evidence: blobs }), value => [value.before, value.after]) }) as z.ZodType<AxisSummary>
const diagnostic = z.strictObject({ code: label, message: text, file: RepoPathSchema.nullable(), line: positive.nullable() })
const diagnostics = ordered(diagnostic, value => [value.code, value.file ?? '', value.line ?? 0, value.message])
export const ToolsetMaterialSchema = z.strictObject({ kind: z.literal('shared-update-toolset'), schemaVersion: z.literal(1), runtime: z.strictObject({ name: label, version: label, platform: label, architecture: label }), flags: z.array(text),
  environment: ordered(z.strictObject({ name: label, value: text }), value => [value.name]), files: ordered(MaterialFileSchema, value => [value.path]),
  dependencies: ordered(z.strictObject({ name: label, version: label, integrity: label, resolvedPath: RepoPathSchema }), value => [value.resolvedPath]) }) as z.ZodType<ToolsetMaterial>
export const SemanticInputSchema = checked(z.strictObject({ kind: z.literal('shared-update-semantic'), schemaVersion: z.literal(1), subject: SubjectSchema,
  source: z.strictObject({ repository: label, directory: RepoPathSchema, track: label }), config: MaterialTreeSchema,
  lockSchema: z.strictObject({ version: positive, path: RepoPathSchema }), upstream: z.strictObject({ current: MaterialTreeSchema, oldNext: MaterialTreeSchema, target: MaterialTreeSchema }),
  images: ordered(z.strictObject({ logicalSource: label, sha256: DigestSchema, bytes: size, address: label }), value => [value.logicalSource]), members: ContentMembersSchema,
  registry: z.strictObject({ manualId: id, group: id, configPath: RepoPathSchema, outputRoot: RepoPathSchema, landingPath: RepoPathSchema, policySha256: DigestSchema }).nullable(),
  authority: z.strictObject({ provider, state: authorityState, reasons, policySha256: DigestSchema }), providerPolicySha256: DigestSchema, toolsetSha256: DigestSchema,
}), value => {
  bindProvider(value.subject, value.authority.provider); bindMembers(value.subject, value.members)
  assert(value.lockSchema.path === expectedLockPath(value.subject), 'Semantic lock path differs from subject')
  assert(!value.config.entries.some(file => file.path === value.lockSchema.path), 'Semantic config must exclude lock bytes')
  if (value.subject.kind === 'guides-page') assert(value.registry === null, 'Guides semantic registry must be null')
  else assert(value.registry?.manualId === value.subject.manualId && value.registry?.group === value.subject.group, 'Semantic registry differs from SDK subject')
}) as z.ZodType<SemanticInput>
export const UpdateReportEnvelopeSchema = checked(z.strictObject({ kind: z.literal('shared-update'), schemaVersion: z.literal(1), subject: SubjectSchema, pins: ExecutionPinsSchema, authority: AuthorityObservationSchema,
  members: ContentMembersSchema, memberSetSha256: DigestSchema, axes: z.array(AxisSummarySchema).length(2),
  configurationChanges: ordered(z.strictObject({ path: RepoPathSchema, before: BlobRefSchema.nullable(), after: BlobRefSchema.nullable() }), value => [value.path]),
  detail: z.strictObject({ kind: z.enum(['guides-impact-v1', 'manual-impact-v1']), file: BlobRefSchema }), diagnostics,
  semanticProjection: SemanticInputSchema.nullable(), semanticInputSha256: DigestSchema.nullable(),
}), value => {
  assert(equal(value.subject, value.authority.subject), 'Authority subject differs from report')
  bindMembers(value.subject, value.members)
  assert(value.memberSetSha256 === digest('members', value.members), 'Members digest mismatch')
  assert(value.detail.kind === (value.subject.kind === 'guides-page' ? 'guides-impact-v1' : 'manual-impact-v1'), 'Detail kind differs from subject')
  assert(value.axes[0].axis === 'old-next-to-target' && value.axes[1].axis === 'current-to-candidate-next', 'Comparison axes missing, duplicate or out of order')
  assert((value.semanticProjection === null) === (value.semanticInputSha256 === null), 'Semantic projection and digest must both be null or both present')
  if (value.semanticProjection !== null) {
    const projection = value.semanticProjection
    assert(value.semanticInputSha256 === digest('semantic', projection), 'Semantic digest mismatch')
    assert(equal(projection.subject, value.subject) && equal(projection.members, value.members), 'Semantic subject/members differ from report')
    assert(projection.source.repository === value.pins.source.repository && projection.source.track === value.pins.source.track, 'Semantic source differs from pins')
    assert(projection.toolsetSha256 === value.pins.toolsetSha256, 'Semantic toolset differs from pins')
    assert(projection.authority.provider === value.authority.provider && projection.authority.state === value.authority.updateState && equal(projection.authority.reasons, value.authority.reasons), 'Semantic authority differs from report')
  }
}) as z.ZodType<UpdateReportEnvelope>
export const NextLockEditSchema = checked(z.strictObject({ subject: SubjectSchema, before: LockStateSchema, target: GitShaSchema, afterBlob: BlobRefSchema }), value => {
  assert(value.before.path === expectedLockPath(value.subject), 'Lock path differs from subject')
  assert(value.target !== value.before.next, 'Next edit must change next')
}) as z.ZodType<NextLockEdit>
const nextEdits = checked(ordered(NextLockEditSchema, value => [value.before.path]), values => {
  const seen = new Set<string>()
  for (const value of values) { const key = JSON.stringify(subjectKey(value.subject)); assert(!seen.has(key), 'Duplicate next edit subject'); seen.add(key) }
})
export const UpdateUnitPlanSchema = checked(z.strictObject({ kind: z.literal('shared-update-unit'), schemaVersion: z.literal(1), unitKey: label, subjects, membersSha256: DigestSchema,
  reports: z.array(BlobRefSchema), nextEdits, disposition: z.enum(['noop', 'report-only', 'draft-failure', 'candidate', 'hold']), holdReasons: reasons, semanticInputSha256: DigestSchema.nullable(),
}), value => {
  bindUnit(value.unitKey, value.subjects)
  assert(value.reports.length === value.subjects.length, 'One report reference is required per subject')
  assert(new Set(value.reports.map(item => item.path)).size === value.reports.length, 'Duplicate report reference')
  for (const edit of value.nextEdits) assert(value.subjects.some(subject => equal(subject, edit.subject)), 'Next edit subject is outside unit')
  if (value.disposition === 'candidate' || value.disposition === 'draft-failure') {
    assert(value.nextEdits.length > 0, 'Candidate/draft-failure requires next edits')
    if (value.subjects[0].kind === 'sdk-manual') assert(value.nextEdits.length === 1, 'SDK candidate requires one whole-manual lock edit')
  } else assert(value.nextEdits.length === 0, 'Noop/report-only/hold cannot edit next')
}) as z.ZodType<UpdateUnitPlan>
export const ObservedPrSchema = z.strictObject({ repositoryId: positive, number: positive, base: GitShaSchema, head: GitShaSchema, state: z.enum(['open', 'closed', 'merged']), draft: z.boolean(), actorId: positive, metadataEvidence: blobs }) as z.ZodType<ObservedPr>
export const TransactionPreconditionsSchema = checked(z.strictObject({ master: GitShaSchema, dev: GitShaSchema, trustedTools: GitShaSchema, prs: z.array(ObservedPrSchema), unitPlanSha256: DigestSchema, authorityEvidence: blobs }), value => {
  const keys = value.prs.map(pr => JSON.stringify([pr.repositoryId, pr.number]))
  assert(new Set(keys).size === keys.length, 'Duplicate observed PR')
}) as z.ZodType<TransactionPreconditions>
export const BotRevisionSchema = checked(z.strictObject({ kind: z.literal('shared-update-revision'), schemaVersion: z.literal(1), unitKey: label, subjects, parentHead: GitShaSchema, master: GitShaSchema, dev: GitShaSchema,
  tools: GitShaSchema, memberSetSha256: DigestSchema, planSha256: DigestSchema, previousBotCommit: GitShaSchema.nullable(),
  lockDeltas: ordered(z.strictObject({ path: RepoPathSchema, current: GitShaSchema, oldNext: GitShaSchema, next: GitShaSchema }), value => [value.path]), preservedHumanHeads: heads,
}), value => {
  bindUnit(value.unitKey, value.subjects)
  for (const delta of value.lockDeltas) {
    assert(value.subjects.some(subject => expectedLockPath(subject) === delta.path), 'Revision lock delta is outside subjects')
    assert(delta.oldNext !== delta.next, 'Revision delta must change next')
  }
}) as z.ZodType<BotRevision>
export const OriginalObjectSchema = z.discriminatedUnion('state', [
  z.strictObject({ state: z.literal('present'), commit: GitShaSchema, repositoryPath: RepoPathSchema, content: BlobRefSchema }),
  z.strictObject({ state: z.literal('absent'), commit: GitShaSchema, repositoryPath: RepoPathSchema, inventory: BlobRefSchema }),
  z.strictObject({ state: z.literal('unavailable'), reasons }),
]) as z.ZodType<OriginalObject>
export const ReplacementContextSchema = checked(z.strictObject({ logicalPath: label, ruleSha256: DigestSchema, channel: z.enum(['current', 'next']), block: label, language: text.nullable(), match: z.enum(['matched', 'missing', 'ambiguous']),
  source: OriginalObjectSchema, span: z.strictObject({ firstLine: positive, lastLine: positive, text: BlobRefSchema }).nullable(), fullContext: BlobRefSchema.nullable(),
}), value => { if (value.span) assert(value.span.firstLine <= value.span.lastLine, 'Replacement span is reversed') }) as z.ZodType<ReplacementContext>
const view = checked(z.strictObject({ pair: z.enum(['baseline', 'candidate']), channel: z.enum(['current', 'next']), status: z.enum(['compiled', 'absent', 'error', 'unavailable']), output: BlobRefSchema.nullable() }), value => {
  assert((value.status === 'compiled') === (value.output !== null), 'Only compiled views have output bytes')
})
const manualPage = checked(z.strictObject({ logicalPath: label, origin: z.enum(['upstream', 'local']), upstream: z.strictObject({ current: OriginalObjectSchema, oldNext: OriginalObjectSchema, target: OriginalObjectSchema }).nullable(),
  local: z.strictObject({ snapshot: GitShaSchema, file: BlobRefSchema }).nullable(), replacements: z.array(ReplacementContextSchema), views: ordered(view, value => [value.pair, value.channel]),
}), value => {
  assert(value.origin === 'local' ? value.local !== null && value.upstream === null : value.upstream !== null && value.local === null, 'Manual page origin does not bind its original objects')
  const identities = value.replacements.map(item => JSON.stringify([item.logicalPath, item.ruleSha256, item.channel, item.block, item.language]))
  assert(new Set(identities).size === identities.length, 'Duplicate replacement context')
})
export const ManualImpactReportSchema = z.strictObject({ kind: z.literal('manual-impact'), schemaVersion: z.literal(1), manualId: id, inventories: z.strictObject({ current: BlobRefSchema, oldNext: BlobRefSchema, target: BlobRefSchema }),
  pages: ordered(manualPage, value => [value.logicalPath]), fullBuild: z.strictObject({ baseline: z.enum(['valid', 'failed', 'unavailable']), candidate: z.enum(['valid', 'failed', 'unavailable']) }), diagnostics }) as z.ZodType<ManualImpactReport>
export const PreparedBaseSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('new'), master: GitShaSchema, base: GitShaSchema, tree: GitTreeOidSchema }),
  z.strictObject({ kind: z.literal('existing'), master: GitShaSchema, humanHead: GitShaSchema, base: GitShaSchema, tree: GitTreeOidSchema, mergeEvidence: BlobRefSchema, preservationEvidence: BlobRefSchema }),
]) as z.ZodType<PreparedBase>
export const CandidateSnapshotProofSchema = z.strictObject({ prepared: PreparedBaseSchema, candidate: GitShaSchema, candidateTree: GitTreeOidSchema, patch: BlobRefSchema, preservedHumanHeads: heads,
  trustedToolsetSha256: DigestSchema, executableClosure: BlobRefSchema, nextEdits }) as z.ZodType<CandidateSnapshotProof>

/** Independently bound claims supplied by adapters; this validates namespaces, not that binding. */
export interface MemberClaim { subject: Subject; lockPath: RepoPath; members: ContentMember[] }
export interface MemberBatchUnit { unitKey: string; reports: MemberClaim[] }
export const MemberClaimSchema = z.strictObject({ subject: SubjectSchema, lockPath: RepoPathSchema, members: ContentMembersSchema }) as z.ZodType<MemberClaim>
export const MemberBatchUnitSchema = z.strictObject({ unitKey: label, reports: ordered(MemberClaimSchema, value => subjectKey(value.subject)).min(1) }) as z.ZodType<MemberBatchUnit>
export const MemberBatchSchema = checked(z.array(MemberBatchUnitSchema), units => {
  const subjects = new Set<string>(), locks = new Set<string>(), keys = new Set<string>()
  for (const unit of units) {
    assert(!keys.has(unit.unitKey), 'DUPLICATE_UNIT_KEY'); keys.add(unit.unitKey)
    for (const claim of unit.reports) {
      const key = JSON.stringify(subjectKey(claim.subject))
      assert(!subjects.has(key), 'DUPLICATE_SUBJECT'); subjects.add(key)
      assert(!locks.has(claim.lockPath), 'DUPLICATE_LOCK_PATH'); locks.add(claim.lockPath)
      assert(claim.lockPath === expectedLockPath(claim.subject), 'Lock path differs from subject')
    }
  }
  assertMemberNamespace(units.flatMap(unit => unit.reports.flatMap(report => report.members)))
  for (const unit of units) {
    const values = unit.reports.map(report => report.subject)
    assert(values.every(value => value.kind === values[0].kind), 'Mixed Guides/SDK batch unit')
    if (values[0].kind === 'sdk-manual') assert(values.length === 1, 'SDK batch unit must contain one whole manual')
    for (const claim of unit.reports) bindMembers(claim.subject, claim.members)
  }
}) as z.ZodType<MemberBatchUnit[]>
export function validateMemberBatch(value: unknown): MemberBatchUnit[] { return MemberBatchSchema.parse(value) }
export function validateUpdateReportEnvelope(value: unknown): UpdateReportEnvelope { return UpdateReportEnvelopeSchema.parse(value) }
export function parseUpdateReportEnvelope(bytes: Uint8Array): UpdateReportEnvelope { return validateUpdateReportEnvelope(parseStrictJson(bytes)) }

/** Reports must already be in the plan's subject order; BlobRef bytes are authenticated by adapters. */
export function validateUnitReports(value: unknown, reportValues: unknown): UpdateUnitPlan {
  const plan = UpdateUnitPlanSchema.parse(value), reports = ordered(UpdateReportEnvelopeSchema, value => subjectKey(value.subject)).parse(reportValues)
  assert(equal(plan.subjects, reports.map(report => report.subject)), 'Unit report subjects differ from plan')
  validateMemberBatch([{ unitKey: plan.unitKey, reports: reports.map(report => ({ subject: report.subject, members: report.members, lockPath: expectedLockPath(report.subject) })) }])
  assert(plan.membersSha256 === digest('unit-members', reports.map(report => ({ subject: report.subject, memberSetSha256: report.memberSetSha256 }))), 'Unit members digest mismatch')
  const semantic = reports.some(report => report.semanticInputSha256 === null) ? null : digest('unit-semantic', reports.map(report => ({ subject: report.subject, semanticInputSha256: report.semanticInputSha256 })))
  assert(plan.semanticInputSha256 === semantic, 'Unit semantic digest mismatch')
  return plan
}

/** Decode all new JSON contracts with this entrypoint before invoking their structural schemas. */
export function parseCanonicalValue<T>(schema: z.ZodType<T>, bytes: Uint8Array): T { return schema.parse(parseStrictJson(bytes)) }

/** Authenticate a retained reference against supplied bytes; locating/reading those bytes is adapter work. */
export function validateBlobBytes(value: unknown, bytes: Uint8Array): BlobRef {
  const reference = BlobRefSchema.parse(value)
  assert(bytes instanceof Uint8Array, 'Expected retained bytes')
  assert(reference.bytes === bytes.byteLength, 'BlobRef byte length mismatch')
  assert(reference.sha256 === createHash('sha256').update(bytes).digest('hex'), 'BlobRef raw SHA-256 mismatch')
  return reference
}
