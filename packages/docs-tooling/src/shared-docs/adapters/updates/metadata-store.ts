import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createHash } from 'node:crypto'
import { lstat } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import * as z from 'zod'
import { canonicalBytes, digest } from '../../core/updates/canonical'
import { BlobRefSchema, CandidateSnapshotProofSchema, DigestSchema, GitShaSchema, GitTreeOidSchema, RepoPathSchema, UpdateUnitPlanSchema, validateBlobBytes,
  type BlobRef, type BotRevision, type CandidateSnapshotProof, type MetadataStore, type UpdateUnitPlan } from '../../core/updates/envelope'
import { assertRevisionBinding, encodeRevisionMessage, METADATA_LIMITS, parseRevisionMessage } from '../../core/updates/metadata'
import { assertNextOnlyDiff, type NextOnlyDelta } from '../../core/updates/transaction'
import { immutable } from '../../core/updates/types'
import type { EvidenceStore } from './evidence'

export function createMetadataStore(): MetadataStore {
  return { async read() { return { status: 'unknown', reasons: ['REMOTE_AUTH_REQUIRED'] } }, prepare: encodeRevisionMessage }
}

/** Installed only by the trusted transaction adapter. Never deserialize this dependency
 * from a request. Task 5 derives it from the accepted execution capability, freshly
 * checking access/toolset pins, not from request.master or a journal's assertions. */
export interface TrustedMetadataContext {
  readonly baseline: string; readonly baselineTree: string; readonly trustedTools: string
  readonly gitBinary: string; readonly toolsetSha256: string; readonly executableClosure: BlobRef
}
const contextSchema = z.strictObject({ baseline: GitShaSchema, baselineTree: GitTreeOidSchema, trustedTools: GitShaSchema,
  gitBinary: z.string().refine(isAbsolute), toolsetSha256: DigestSchema, executableClosure: BlobRefSchema })
export interface CommitFacts { readonly oid: string; readonly tree: string; readonly parents: readonly string[] }
export interface LocalJournalFacts {
  readonly context: TrustedMetadataContext; readonly candidate: CommitFacts; readonly parent: CommitFacts
  readonly revision: BotRevision; readonly rawDiff: Uint8Array; readonly deltas: readonly NextOnlyDelta[]
  readonly graph: readonly CommitFacts[]
  /** Complete, memoized invocation graph only. No subprocess or budget reset. */
  isAncestor(ancestor: string, descendant: string): boolean
  /** Must be checked around Task 5's graph/object reconstruction operations. */
  checkBudget(): void
}
/** Output of actual owned-journal revalidation, not a serialized trust flag. The
 * callback must re-read its strict journal through EvidenceStore.readJournal,
 * verify local ref/CAS identity, reconstruct ordinary prepared merges, compare
 * original/fresh reports and source authority, and freshly recheck executable
 * closure/access. Task 4 additionally checks these immutable bindings/BlobRefs. */
export interface LocalRevisionEvidence {
  readonly anchor: { readonly commit: string; readonly tree: string }
  readonly journal: BlobRef; readonly plan: UpdateUnitPlan; readonly proof: CandidateSnapshotProof
  readonly originalReports: readonly BlobRef[]; readonly validation: BlobRef; readonly authority: readonly BlobRef[]
}
const localEvidenceSchema = z.strictObject({ anchor: z.strictObject({ commit: GitShaSchema, tree: GitTreeOidSchema }), journal: BlobRefSchema,
  plan: UpdateUnitPlanSchema, proof: CandidateSnapshotProofSchema, originalReports: z.array(BlobRefSchema), validation: BlobRefSchema, authority: z.array(BlobRefSchema).min(1) })
export interface LocalMetadataDependencies {
  readonly repository: string
  readonly trustedContext: () => Promise<TrustedMetadataContext>
  readonly evidence: EvidenceStore
  readonly revalidateJournal?: (facts: LocalJournalFacts) => Promise<LocalRevisionEvidence>
}
export interface LocalMetadataRequest {
  readonly master: string; readonly head?: string; readonly donorHeads?: readonly string[]; readonly journalCandidates?: readonly string[]
}
export interface LocalMetadataInspection {
  readonly status: 'local-consistent' | 'hold'
  readonly reasons: readonly string[]; readonly revision: { readonly commit: string; readonly value: BotRevision } | null
  readonly counts: { readonly verificationHeaders: number; readonly metadataCommits: number; readonly mergeCommits: number; readonly messageBytes: number }
  readonly graph: readonly CommitFacts[]; readonly boundaries: readonly { readonly from: string; readonly to: string }[]
  readonly pendingHeads: readonly string[]; readonly preservedHeads: readonly string[]
  readonly evidence: readonly LocalRevisionEvidence[]
}
const requestSchema = z.strictObject({ master: GitShaSchema, head: GitShaSchema.optional(), donorHeads: z.array(GitShaSchema).optional(), journalCandidates: z.array(GitShaSchema).optional() })
const fail = (code: string): never => { throw new Error(code) }
/** Shared guard, exported for boundary tests; callers cannot change either limit. */
export function checkMetadataVerificationBudget(headers: number, elapsedMilliseconds: number): void {
  if (!Number.isSafeInteger(headers) || headers < 0 || !Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0
    || headers > METADATA_LIMITS.verificationHeaders || elapsedMilliseconds >= METADATA_LIMITS.verificationMilliseconds) fail('ANCESTRY_VERIFICATION_LIMIT')
}
const equal = (a: unknown, b: unknown) => Buffer.from(canonicalBytes(a)).equals(Buffer.from(canonicalBytes(b)))
const exec = promisify(execFile)
const safeEnv = () => ({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C', TZ: 'UTC', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_ATTR_NOSYSTEM: '1', GIT_NO_LAZY_FETCH: '1', GIT_NO_REPLACE_OBJECTS: '1', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' })
const gitArgs = (repository: string, args: string[]) => ['--no-replace-objects', '-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false',
  '-c', 'core.useReplaceRefs=false', '-c', 'diff.external=', '-c', 'core.attributesFile=/dev/null', '-C', repository, ...args]

/** One bounded object stream; immutable object hashes are checked independently.
 * Neither checkout, hooks, filters nor Git's trailer parser participate. */
class ObjectReader {
  private child: ReturnType<typeof spawn>
  private iterator: AsyncIterator<Buffer>
  private buffer = Buffer.alloc(0)
  private timer: ReturnType<typeof setTimeout>
  constructor(binary: string, repository: string, milliseconds: number) {
    this.child = spawn(binary, gitArgs(repository, ['cat-file', '--batch']), { env: safeEnv(), stdio: ['pipe', 'pipe', 'pipe'] })
    this.child.on('error', () => this.child.stdout.destroy())
    this.child.stderr.resume()
    this.iterator = this.child.stdout[Symbol.asyncIterator]()
    this.timer = setTimeout(() => this.child.kill(), milliseconds)
  }
  private async fill() {
    const part = await this.iterator.next()
    if (part.done) fail('GIT_OBJECT_READ_FAILED')
    this.buffer = Buffer.concat([this.buffer, part.value])
  }
  async read(oid: string, type: 'commit' | 'blob' | 'tree', maximum: number): Promise<Buffer> {
    GitShaSchema.parse(oid)
    await new Promise<void>((yes, no) => this.child.stdin.write(`${oid}\n`, error => error ? no(error) : yes()))
    while (this.buffer.indexOf(10) === -1) { if (this.buffer.length > 256) fail('GIT_OBJECT_HEADER_INVALID'); await this.fill() }
    const end = this.buffer.indexOf(10), header = this.buffer.subarray(0, end).toString('ascii')
    this.buffer = this.buffer.subarray(end + 1)
    const match = /^([0-9a-f]{40}) (commit|blob|tree) ([0-9]+)$/.exec(header)
    if (!match || match[1] !== oid || match[2] !== type) fail('GIT_OBJECT_MISSING_OR_TYPE')
    const size = Number(match[3])
    if (!Number.isSafeInteger(size) || size > maximum) fail('GIT_OBJECT_SIZE_LIMIT')
    while (this.buffer.length < size + 1) await this.fill()
    if (this.buffer[size] !== 10) fail('GIT_OBJECT_TRUNCATED')
    const bytes = Buffer.from(this.buffer.subarray(0, size)); this.buffer = this.buffer.subarray(size + 1)
    if (createHash('sha1').update(`${type} ${size}\0`).update(bytes).digest('hex') !== oid) fail('GIT_OBJECT_HASH_MISMATCH')
    return bytes
  }
  close() { clearTimeout(this.timer); this.child.stdin.destroy(); this.child.kill() }
}
function commit(bytes: Buffer, oid: string): { facts: CommitFacts; message: Uint8Array } {
  const at = bytes.indexOf('\n\n')
  if (at < 0 || at > 8192) fail('GIT_COMMIT_HEADER_INVALID')
  const header = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes.subarray(0, at)), lines = header.split('\n')
  if (/[\x00\r]/.test(header)) fail('GIT_COMMIT_HEADER_INVALID')
  if (!/^tree [a-f0-9]{40}$/.test(lines[0])) fail('GIT_COMMIT_HEADER_INVALID')
  // Git recognizes parents only in the contiguous block immediately after tree.
  // A parent elsewhere is malformed data, never another ancestry edge.
  let cursor = 1
  const parents: string[] = []
  while (lines[cursor]?.startsWith('parent ')) parents.push(lines[cursor++].slice(7))
  if (parents.some(parent => !GitShaSchema.safeParse(parent).success) || new Set(parents).size !== parents.length) fail('GIT_COMMIT_HEADER_INVALID')
  if (parents.length > 2) fail('UNSUPPORTED_OCTOPUS_MERGE')
  if (!/^author .+$/.test(lines[cursor++] ?? '') || !/^committer .+$/.test(lines[cursor++] ?? '')) fail('GIT_COMMIT_HEADER_INVALID')
  let extension = false
  for (; cursor < lines.length; cursor++) {
    const line = lines[cursor]
    if (line.startsWith(' ')) {
      if (!extension) fail('GIT_COMMIT_HEADER_INVALID')
      continue // Extended-header continuations cannot declare mandatory headers.
    }
    const key = line.split(' ', 1)[0]
    if (!/^[^\x00-\x20\x7f]+$/.test(key) || ['tree', 'parent', 'author', 'committer'].includes(key)) fail('GIT_COMMIT_HEADER_INVALID')
    extension = true
  }
  return { facts: immutable({ oid, tree: lines[0].slice(5), parents }), message: Uint8Array.from(bytes.subarray(at + 2)) }
}

/** Local consistency only. All roots share one complete graph and one metadata budget. */
export function createLocalMetadataInspector(dependencies: LocalMetadataDependencies) {
  return async function inspectLocal(requestValue: LocalMetadataRequest): Promise<LocalMetadataInspection> {
    const started = performance.now(), headers = new Map<string, CommitFacts>(), baseline = new Set<string>(), relevant = new Set<string>()
    const boundaries: { from: string; to: string }[] = [], revisions = new Map<string, BotRevision>(), proofs: LocalRevisionEvidence[] = []
    const counts = { verificationHeaders: 0, metadataCommits: 0, mergeCommits: 0, messageBytes: 0 }
    let reader: ObjectReader, preservedHeads: string[] = [], roots: string[] = []
    const checkTime = () => checkMetadataVerificationBudget(counts.verificationHeaders, performance.now() - started)
    const bounded = async <T>(operation: Promise<T>): Promise<T> => {
      checkTime(); let timer: ReturnType<typeof setTimeout>
      try {
        return await Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('ANCESTRY_VERIFICATION_LIMIT')),
          Math.max(1, METADATA_LIMITS.verificationMilliseconds - (performance.now() - started))) })])
      } finally { clearTimeout(timer) }
    }
    const finish = (reasons: string[], selected: LocalMetadataInspection['revision'] = null): LocalMetadataInspection => immutable({
      status: reasons.length ? 'hold' : 'local-consistent', reasons, revision: selected, counts: { ...counts }, graph: [...headers.values()], boundaries,
      pendingHeads: reasons.length ? roots : [], preservedHeads, evidence: proofs })
    try {
      const request = requestSchema.parse(requestValue)
      const donors = [...request.donorHeads ?? []].sort()
      preservedHeads = [...new Set([request.head, ...donors].filter((oid): oid is string => !!oid))].sort()
      roots = [...new Set([...preservedHeads, ...[...request.journalCandidates ?? []].sort()])]
      if (donors.length > METADATA_LIMITS.donorHeads || new Set(donors).size !== donors.length) fail('METADATA_LIMIT_EXCEEDED')
      const context = immutable(contextSchema.parse(await bounded(dependencies.trustedContext()))) as TrustedMetadataContext
      if (request.master !== context.baseline) fail('TRUSTED_BASELINE_MISMATCH')
      await bounded(dependencies.evidence.readBlob(context.executableClosure))
      const command = async (args: string[], maximum = 32 * 1024 * 1024) => {
        checkTime()
        return (await exec(context.gitBinary, gitArgs(dependencies.repository, args), { env: safeEnv(), encoding: 'buffer', maxBuffer: maximum,
          timeout: Math.max(1, Math.ceil(METADATA_LIMITS.verificationMilliseconds - (performance.now() - started))) })).stdout
      }
      const directories = new Set<string>()
      for (const option of ['--git-dir', '--git-common-dir']) directories.add((await command(['rev-parse', '--path-format=absolute', option], 4096)).toString('utf8').trim())
      for (const directory of directories) {
        if (!isAbsolute(directory) || /[\x00\r\n]/.test(directory)) fail('GIT_DIRECTORY_INVALID')
        for (const name of ['shallow', 'info/grafts']) {
          const exists = await lstat(join(directory, name)).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error })
          if (exists) fail('INCOMPLETE_OR_REWRITTEN_HISTORY')
        }
      }
      if ((await command(['for-each-ref', '--format=%(refname)', 'refs/replace'], 4096)).length) fail('INCOMPLETE_OR_REWRITTEN_HISTORY')
      reader = new ObjectReader(context.gitBinary, dependencies.repository, Math.max(1, METADATA_LIMITS.verificationMilliseconds - (performance.now() - started)))
      type TreeEntry = { mode: string; name: string; oid: string }
      const treeObjects = new Map<string, TreeEntry[]>(); let treeBytes = 0, expandedLeaves = 0
      const treeObject = async (oid: string) => {
        checkTime()
        if (treeObjects.has(oid)) return treeObjects.get(oid)!
        const raw = await reader.read(oid, 'tree', 32 * 1024 * 1024)
        treeBytes += raw.length
        if (treeBytes > 32 * 1024 * 1024) fail('GIT_TREE_SIZE_LIMIT')
        const entries: TreeEntry[] = [], names = new Set<string>(); let at = 0
        while (at < raw.length) {
          checkTime()
          const space = raw.indexOf(32, at), nul = raw.indexOf(0, space + 1)
          if (space < at || nul < space || nul + 21 > raw.length) fail('GIT_TREE_INVALID')
          const mode = raw.subarray(at, space).toString('utf8')
          const name = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(raw.subarray(space + 1, nul))
          if (!['40000', '100644', '100755', '120000', '160000'].includes(mode) || name.includes('/') || !RepoPathSchema.safeParse(name).success || names.has(name)) fail('GIT_TREE_INVALID')
          names.add(name)
          entries.push({ mode, name, oid: raw.subarray(nul + 1, nul + 21).toString('hex') }); at = nul + 21
        }
        treeObjects.set(oid, entries); return entries
      }
      const trees = new Map<string, Map<string, { mode: string; oid: string }>>()
      const tree = async (root: string) => {
        if (trees.has(root)) return trees.get(root)!
        const files = new Map<string, { mode: string; oid: string }>(), pending = [{ oid: root, prefix: '' }]
        while (pending.length) {
          checkTime(); const { oid, prefix } = pending.pop()!
          for (const entry of await treeObject(oid)) {
            checkTime()
            const path = prefix + entry.name
            if (entry.mode === '40000') pending.push({oid:entry.oid,prefix:path+'/'})
            else { if (files.has(path) || expandedLeaves >= 100_000) fail('GIT_TREE_SIZE_LIMIT'); expandedLeaves++; files.set(path, {mode:entry.mode,oid:entry.oid}) }
          }
        }
        trees.set(root, files); return files
      }
      const load = async (oid: string) => {
        checkTime()
        if (!headers.has(oid)) checkMetadataVerificationBudget(counts.verificationHeaders + 1, performance.now() - started)
        const parsed = commit(await reader.read(oid, 'commit', 8192 + METADATA_LIMITS.commitMessageBytes + 2), oid)
        if (!headers.has(oid)) { headers.set(oid, parsed.facts); counts.verificationHeaders++ }
        checkTime(); return parsed
      }
      // Complete baseline membership is computed independently from raw parent headers.
      // Baseline messages are never decoded as BotRevision metadata or retained.
      const accepted = [context.baseline]
      while (accepted.length) {
        const oid = accepted.pop()!
        if (baseline.has(oid)) continue
        const { facts } = await load(oid); baseline.add(oid)
        if (oid === context.baseline) {
          if (facts.tree !== context.baselineTree) fail('TRUSTED_BASELINE_TREE_MISMATCH')
          await treeObject(facts.tree)
        }
        for (const parent of [...facts.parents].reverse()) accepted.push(parent)
      }
      const pending = [...roots].reverse()
      while (pending.length) {
        const oid = pending.pop()!
        if (baseline.has(oid) || relevant.has(oid)) continue
        if (counts.metadataCommits >= METADATA_LIMITS.discoveryCommits) fail('METADATA_SCAN_LIMIT')
        const { facts, message } = await load(oid)
        if (facts.parents.length === 2 && counts.mergeCommits >= METADATA_LIMITS.discoveryMergeCommits) fail('METADATA_SCAN_LIMIT')
        if (counts.messageBytes + message.length > METADATA_LIMITS.discoveryTotalMessageBytes) fail('METADATA_SCAN_LIMIT')
        counts.metadataCommits++; counts.messageBytes += message.length; counts.mergeCommits += Number(facts.parents.length === 2); relevant.add(oid)
        if (message.length > METADATA_LIMITS.commitMessageBytes) fail('METADATA_LIMIT_EXCEEDED')
        const revision = parseRevisionMessage(message)
        if (revision) revisions.set(oid, immutable(revision))
        if (!facts.parents.length) fail('UNROOTED_ARM')
        for (const parent of [...facts.parents].reverse()) {
          if (baseline.has(parent)) boundaries.push({ from: oid, to: parent }); else pending.push(parent)
        }
      }
      const ancestry = new Map<string, boolean>()
      const isAncestor = (ancestor: string, descendant: string): boolean => {
        checkTime(); GitShaSchema.parse(ancestor); GitShaSchema.parse(descendant)
        const key = `${ancestor}:${descendant}`
        if (ancestry.has(key)) return ancestry.get(key)!
        const pending = [descendant], seen = new Set<string>(); let result = false
        while (pending.length) {
          checkTime(); const oid = pending.pop()!
          if (seen.has(oid)) continue
          seen.add(oid)
          if (!headers.has(oid)) fail('JOURNAL_ROOT_NOT_SCANNED')
          if (oid === ancestor) { result = true; break }
          pending.push(...headers.get(oid)!.parents)
        }
        ancestry.set(key, result); return result
      }
      // Never select a plausible first trailer before the entire relevant graph passes.
      const verified = new Map<string, BotRevision>()
      for (const [oid, revision] of revisions) {
        const candidate = headers.get(oid)!
        if (candidate.parents.length !== 1 || candidate.parents[0] !== revision.parentHead) fail('LOCAL_REVISION_PARENT_CHANGED')
        const parent = headers.get(revision.parentHead)
        if (!parent || revision.master !== context.baseline || revision.tools !== context.trustedTools) fail('LOCAL_REVISION_BINDING_CHANGED')
        if (!dependencies.revalidateJournal) fail('LOCAL_JOURNAL_REQUIRED')
        const beforeTree = await tree(parent.tree), afterTree = await tree(candidate.tree)
        const changedPaths = new Set([...new Set([...beforeTree.keys(), ...afterTree.keys()])].filter(path => {
          const before = beforeTree.get(path), after = afterTree.get(path)
          return !before || !after || before.mode !== after.mode || before.oid !== after.oid
        }))
        if (changedPaths.size !== revision.lockDeltas.length || revision.lockDeltas.some(delta => !changedPaths.has(delta.path))) fail('LOCAL_REVISION_NOT_NEXT_ONLY')
        const rawDiff = await command(['diff-tree', '--raw', '-r', '-z', '--no-abbrev', '--no-color', '--no-renames', '--no-ext-diff', '--no-commit-id', parent.oid, oid])
        const tokens = rawDiff.toString('utf8').split('\0'); if (tokens.pop() !== '') fail('TREE_DIFF_INVALID')
        const deltas: NextOnlyDelta[] = []
        for (let i = 0; i < tokens.length; i += 2) {
          const match = /^:(100644|100755) (100644|100755) ([a-f0-9]{40}) ([a-f0-9]{40}) M$/.exec(tokens[i])
          const path = tokens[i + 1], claimed = revision.lockDeltas.find(delta => delta.path === path)
          const subject = revision.subjects.find(subject => subject.kind === 'guides-page' ? path === `shared-docs/guides/pages/${subject.pageId}/lock.yaml` : path === `shared-docs/${subject.group}/lock.yaml`)
          if (!match || !claimed || !subject) fail('LOCAL_REVISION_NOT_NEXT_ONLY')
          const beforeEntry = beforeTree.get(path), afterEntry = afterTree.get(path)
          if (!beforeEntry || !afterEntry || beforeEntry.mode !== match[1] || afterEntry.mode !== match[2] || beforeEntry.oid !== match[3] || afterEntry.oid !== match[4]) fail('TREE_DIFF_INVALID')
          const beforeBytes = await reader.read(match[3], 'blob', 1024 * 1024), afterBytes = await reader.read(match[4], 'blob', 1024 * 1024)
          const afterBlob = { path: `blobs/${createHash('sha256').update(afterBytes).digest('hex')}`, sha256: createHash('sha256').update(afterBytes).digest('hex'), bytes: afterBytes.length }
          deltas.push({ path, beforeMode: match[1], afterMode: match[2], beforeBytes, afterBytes, edit: { subject,
            before: { path, sha256: createHash('sha256').update(beforeBytes).digest('hex'), current: claimed.current, next: claimed.oldNext }, target: claimed.next, afterBlob } })
        }
        if (!deltas.length || deltas.length !== revision.lockDeltas.length) fail('LOCAL_REVISION_NOT_NEXT_ONLY')
        assertNextOnlyDiff(deltas)
        // Copy byte arrays before handing facts to the trusted callback. The graph and
        // decoded revisions are immutable; callback mutations cannot alter verified facts.
        const facts: LocalJournalFacts = Object.freeze({ context, candidate, parent, revision, rawDiff: Uint8Array.from(rawDiff),
          deltas: Object.freeze(deltas.map(delta => Object.freeze({ ...delta, edit: immutable(structuredClone(delta.edit)),
            beforeBytes: Uint8Array.from(delta.beforeBytes), afterBytes: Uint8Array.from(delta.afterBytes) }))), graph: immutable([...headers.values()]), isAncestor, checkBudget: checkTime })
        const evidence = immutable(localEvidenceSchema.parse(await bounded(dependencies.revalidateJournal(facts)))) as LocalRevisionEvidence
        const plan = evidence.plan, proof = evidence.proof
        if (evidence.anchor.commit !== context.baseline || evidence.anchor.tree !== context.baselineTree) fail('JOURNAL_ANCHOR_MISMATCH')
        assertRevisionBinding(revision, { parent: parent.oid, master: context.baseline, tools: context.trustedTools, planSha256: digest('plan', plan), unitKey: plan.unitKey, memberSetSha256: plan.membersSha256 })
        if (!equal(plan.subjects, revision.subjects) || !equal(plan.reports, evidence.originalReports) || !['candidate', 'draft-failure'].includes(plan.disposition)
          || proof.candidate !== oid || proof.candidateTree !== candidate.tree || proof.prepared.base !== parent.oid || proof.prepared.tree !== parent.tree || proof.prepared.master !== context.baseline
          || proof.trustedToolsetSha256 !== context.toolsetSha256 || !equal(proof.executableClosure, context.executableClosure)
          || !equal(proof.nextEdits, plan.nextEdits) || !equal(proof.preservedHumanHeads, revision.preservedHumanHeads)) fail('LOCAL_JOURNAL_BINDING_CHANGED')
        if (!revision.previousBotCommit && (proof.prepared.kind !== 'new' || parent.oid !== context.baseline)) fail('LOCAL_ORIGIN_UNKNOWN')
        if (plan.nextEdits.length !== deltas.length) fail('LOCAL_JOURNAL_BINDING_CHANGED')
        for (const delta of deltas) {
          const edit = plan.nextEdits.find(edit => edit.before.path === delta.path)
          if (!edit || !equal(edit.subject, delta.edit.subject) || !equal(edit.before, delta.edit.before) || edit.target !== delta.edit.target) fail('LOCAL_JOURNAL_BINDING_CHANGED')
          validateBlobBytes(edit.afterBlob, delta.afterBytes)
        }
        if (revision.preservedHumanHeads.some(head => !isAncestor(head, parent.oid))) fail('PRESERVED_HEAD_NOT_ANCESTOR')
        if (revision.previousBotCommit && !isAncestor(revision.previousBotCommit, parent.oid)) fail('PREVIOUS_REVISION_NOT_ANCESTOR')
        await bounded(dependencies.evidence.readJournal(evidence.journal))
        for (const ref of [...plan.reports, ...plan.nextEdits.map(edit => edit.afterBlob), proof.patch, proof.executableClosure, evidence.validation, ...evidence.authority,
          ...(proof.prepared.kind === 'existing' ? [proof.prepared.mergeEvidence, proof.prepared.preservationEvidence] : [])]) await bounded(dependencies.evidence.readBlob(ref))
        if (!Buffer.from(await bounded(dependencies.evidence.readBlob(proof.patch))).equals(rawDiff)) fail('LOCAL_JOURNAL_PATCH_CHANGED')
        verified.set(oid, revision); proofs.push(evidence)
      }
      for (const [oid, revision] of verified) {
        const previous = revision.previousBotCommit ? verified.get(revision.previousBotCommit) : null
        if (revision.previousBotCommit && (!previous || previous.unitKey !== revision.unitKey || !equal(previous.subjects, revision.subjects))) fail('PREVIOUS_REVISION_UNKNOWN')
        // Null may begin a new local chain only directly above the trusted baseline.
        if (!revision.previousBotCommit && [...verified.keys()].some(other => other !== oid && isAncestor(other, revision.parentHead))) fail('PREVIOUS_REVISION_ERASED')
        if (revision.previousBotCommit && [...verified.keys()].some(other => other !== oid && isAncestor(other, revision.parentHead) && !isAncestor(other, revision.previousBotCommit))) fail('PREVIOUS_REVISION_CHAIN_CHANGED')
      }
      let selected: LocalMetadataInspection['revision'] = null
      for (const [oid, revision] of verified) {
        if (selected && (!isAncestor(selected.commit, oid) && !isAncestor(oid, selected.commit) || selected.value.unitKey !== revision.unitKey)) fail('INCOMPARABLE_PRIOR_REVISIONS')
        if (!selected || isAncestor(selected.commit, oid)) selected = { commit: oid, value: revision }
      }
      for (const head of preservedHeads) if (![...verified.keys()].some(oid => isAncestor(oid, head))) fail('LOCAL_ORIGIN_UNKNOWN')
      // Even an empty/new scan rechecks the independently supplied execution facts.
      if (!equal(context, contextSchema.parse(await bounded(dependencies.trustedContext())))) fail('TRUSTED_CONTEXT_CHANGED')
      checkTime(); return finish([], selected)
    } catch (error) {
      const reason = performance.now() - started >= METADATA_LIMITS.verificationMilliseconds ? 'ANCESTRY_VERIFICATION_LIMIT' : error instanceof Error ? error.message : 'LOCAL_METADATA_UNKNOWN'
      return finish([reason])
    } finally { reader?.close() }
  }
}
