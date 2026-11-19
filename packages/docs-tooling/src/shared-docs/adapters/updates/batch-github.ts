import { createHash } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import { Agent, request as httpsRequest, type RequestOptions } from 'node:https'
import * as z from 'zod'
import type { BatchPullIdentity, BatchPathChange } from '../../core/updates/batch-discovery'
import { parseStrictJson } from '../../core/updates/canonical'
import { GitShaSchema, RepoPathSchema } from '../../core/updates/envelope'
import { REMOTE_IO_LIMITS as IO } from '../../core/updates/remote'
import { createRemoteTransport, type RemoteTransport } from './remote-github'
import { BatchReadError, stop, type BatchBudget } from './batch-source'
import { currentBatchLifetime } from './evidence'

const zdoc = 'zilliztech/zdoc', milvus = 'milvus-io/milvus-docs'
const githubOrigin = 'https://api.github.com'
export const BATCH_ASSOCIATION_WINDOW = 8
const repoIds = { [zdoc]: 660446555, [milvus]: 267273319 }
const positive = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
const repository = z.object({ id: positive, full_name: z.string() })
const reference = z.object({ ref: z.string(), object: z.object({ type: z.literal('commit'), sha: GitShaSchema }) })
const summary = z.object({ id: positive, number: positive, state: z.enum(['open', 'closed']), merged_at: z.iso.datetime().nullable(),
  base: z.object({ ref: z.string(), sha: GitShaSchema, repo: repository }), head: z.object({ sha: GitShaSchema }) })
const detail = summary.extend({ merged: z.boolean(), merge_commit_sha: GitShaSchema.nullable(), commits: positive,
  changed_files: z.number().int().nonnegative() })
const file = z.object({ filename: RepoPathSchema, previous_filename: RepoPathSchema.optional(), sha: GitShaSchema,
  status: z.enum(['added', 'modified', 'removed', 'renamed', 'copied', 'changed', 'unchanged']) })
export interface BatchPullFile { path: string; previousPath: string | null; status: BatchPathChange['status']; sha: string }
export interface BatchGitHubReply {body: Uint8Array; link: string | undefined; digest: string}
interface ObservedPull {
  identity: BatchPullIdentity; commits: number; files: BatchPullFile[]; evidence: string[];
  singlePageProof: {detail: BatchGitHubReply; files: BatchGitHubReply} | null;
}

function hasNext(link: string | undefined, endpoint: string, current: number) {
  if (link === undefined) return false
  if (!link || link.length > 8192) stop('METADATA_PAGINATION_INVALID')
  const relations = new Set<string>()
  let last: number | undefined
  for (const part of link.split(',')) {
    const match = /^\s*<([^<>\s]+)>;\s*rel="(next|last|first|prev)"\s*$/.exec(part)
    if (!match || relations.has(match[2])) stop('METADATA_PAGINATION_INVALID')
    const [, href, rel] = match
    if (!URL.canParse(href)) stop('METADATA_PAGINATION_INVALID')
    const url = new URL(href)
    // GitHub may canonicalize owner/name to the fixed numeric repository in Link headers.
    if (url.origin !== githubOrigin || url.username || url.password || url.hash ||
        ![endpoint, endpoint.replace('/repos/' + milvus, '/repositories/' + repoIds[milvus])].includes(url.pathname) ||
        [...url.searchParams.keys()].sort().join(',') !== 'page,per_page' || url.searchParams.get('per_page') !== '100') stop('METADATA_PAGINATION_INVALID')
    const page = url.searchParams.get('page')!
    if (!/^[1-9][0-9]*$/.test(page) || Number(page) > IO.pages) stop('METADATA_PAGE_LIMIT')
    if (rel === 'next' && Number(page) !== current + 1 || rel === 'prev' && Number(page) !== current - 1 ||
        rel === 'last' && Number(page) < current || rel === 'first' && page !== '1') stop('METADATA_PAGINATION_INVALID')
    if (rel === 'last') last = Number(page)
    relations.add(rel)
  }
  if (last !== undefined && (last > current) !== relations.has('next')) stop('METADATA_PAGINATION_INVALID')
  return relations.has('next')
}

export type BatchGitHubTestSeam = Pick<Parameters<typeof createRemoteTransport>[0], 'socketRequest' | 'token'> & { transport?: RemoteTransport }
export function createBatchGitHub(budget: BatchBudget, seam: BatchGitHubTestSeam = {}, mode?: 'discovery') {
  // Only discovery owns this private pool. The underlying transport still owns
  // the URL allowlist, authentication, TLS options and response decoding.
  const agent = mode === 'discovery' && !seam.transport ? new Agent({keepAlive: true, maxSockets: BATCH_ASSOCIATION_WINDOW,
    maxTotalSockets: BATCH_ASSOCIATION_WINDOW, maxFreeSockets: BATCH_ASSOCIATION_WINDOW}) : undefined
  const socket = seam.socketRequest ?? httpsRequest
  const socketRequest = agent ? ((url: URL, options: RequestOptions, callback: (message: IncomingMessage) => void) => {
    if (url.origin !== githubOrigin || url.username || url.password || options.method !== 'GET') stop('METADATA_QUERY_INVALID')
    return socket(url, {...options, agent}, callback)
  }) as typeof httpsRequest : seam.socketRequest
  const client = (repositoryFullName: string) => seam.transport ?? createRemoteTransport({ repositoryFullName, token: seam.token, socketRequest })
  const clients = { [milvus]: client(milvus), [zdoc]: client(zdoc) }
  const inFlight = new Set<Promise<void>>()
  let reserved = 0
  let admissionClosed = false
  // Dispatch shares the same limits as pins and pagination. Near a limit a concurrent
  // read can spend the last allowance, leaving another edge unresolved.
  async function get(repo: keyof typeof clients, suffix = '') {
    let available: number
    for (;;) {
      budget.remaining()
      if (admissionClosed) stop('METADATA_READ_FAILED')
      if (budget.calls >= IO.calls) stop('METADATA_CALL_LIMIT')
      if (budget.apiBytes >= IO.expandedBytes) stop('METADATA_BYTE_LIMIT')
      available = IO.expandedBytes - budget.apiBytes - reserved
      // A partial allowance should reflect bytes already spent, not temporary reservations.
      if (inFlight.size < BATCH_ASSOCIATION_WINDOW && (available >= IO.jsonBytes || !inFlight.size)) break
      await Promise.race(inFlight)
    }
    const maximum = Math.min(IO.jsonBytes, available)
    const controller = new AbortController(), timeout = budget.remaining()
    const lifetimeSignal = currentBatchLifetime()?.signal
    const signal = lifetimeSignal ? AbortSignal.any([controller.signal, lifetimeSignal]) : controller.signal
    if (signal.aborted) {
      admissionClosed = true
      stop('METADATA_READ_FAILED')
    }
    let settle!: () => void
    const done = new Promise<void>(resolve => { settle = resolve })
    inFlight.add(done); reserved += maximum; budget.calls++
    const deadline = performance.now() + timeout
    const timer = setTimeout(() => controller.abort(), timeout)
    let onAbort!: () => void
    const aborted = new Promise<never>((_, reject) => {
      onAbort = () => {
        // A timed-out transport may not have released its physical slot yet.
        admissionClosed = true
        reject(new BatchReadError('METADATA_READ_FAILED'))
      }
    })
    signal.addEventListener('abort', onAbort, {once: true})
    // Failed/oversized streams may have used their whole allowance.
    let charge = maximum
    try {
      const response = await Promise.race([aborted, clients[repo]({ method: 'GET', path: '/repos/' + repo + suffix, signal, maximum })])
      if (signal.aborted || performance.now() >= deadline) {
        admissionClosed = true
        stop('METADATA_READ_FAILED')
      }
      if (response.body.byteLength > maximum) stop('METADATA_BYTE_LIMIT')
      charge = response.body.byteLength
      if (response.status !== 200) stop('METADATA_READ_FAILED')
      const value = parseStrictJson(response.body)
      budget.remaining()
      const requestHash = createHash('sha256').update('GET /repos/' + repo + suffix + '\n200\n' + (response.headers.link ?? '')).digest('hex')
      return { value, body: response.body, link: response.headers.link,
        digest: 'api:' + requestHash + ':' + createHash('sha256').update(response.body).digest('hex') }
    } catch (error) {
      if (error instanceof BatchReadError) throw error
      stop('METADATA_READ_FAILED')
    }
    finally {
      clearTimeout(timer); signal.removeEventListener('abort', onAbort)
      budget.apiBytes += charge; reserved -= maximum
      inFlight.delete(done); settle()
    }
  }
  async function pages<T>(suffix: string, schema: z.ZodType<T>, key: (entry: T) => string | number, count?: number) {
    const rows: T[] = [], seen = new Set<string | number>(), evidence: string[] = []
    for (let page = 1; page <= IO.pages; page++) {
      const response = await get(milvus, suffix + '?per_page=100&page=' + page)
      const entries = z.array(schema).max(IO.pageSize).safeParse(response.value)
      if (!entries.success) stop('METADATA_SHAPE_INVALID')
      const next = hasNext(response.link, '/repos/' + milvus + suffix, page)
      for (const row of entries.data) {
        const id = key(row)
        if (seen.has(id)) stop('METADATA_DUPLICATE')
        seen.add(id); rows.push(row)
      }
      evidence.push(response.digest)
      if (count !== undefined && rows.length > count) stop('PR_FILES_INCOMPLETE')
      if (!next) {
        if (count !== undefined ? rows.length !== count : entries.data.length === IO.pageSize) stop('METADATA_TRUNCATED')
        return { rows, evidence, singlePage: page === 1 && response.link === undefined ? response as BatchGitHubReply : null }
      }
      if (entries.data.length !== IO.pageSize || count !== undefined && rows.length >= count) stop('METADATA_TRUNCATED')
    }
    return stop('METADATA_PAGE_LIMIT')
  }
  type PullSummary = z.infer<typeof summary>
  const pulls = new Map<number, { summary: PullSummary; pull: Promise<ObservedPull> }>()
  async function listAssociation(oid: string) {
    if (!GitShaSchema.safeParse(oid).success) stop('METADATA_QUERY_INVALID')
    const listed = await pages('/commits/' + oid + '/pulls', summary, row => row.number)
    if (!listed.rows.length) return { candidate: null, evidence: listed.evidence, singlePage: null }
    if (listed.rows.some(row => row.base.repo.id !== repoIds[milvus] || row.base.repo.full_name !== milvus)) stop('PR_BASE_MISMATCH')
    const inTrack = listed.rows.filter(row => row.base.ref === 'v3.0.x')
    if (!inTrack.length) stop('PR_BASE_MISMATCH')
    const eligible = inTrack.filter(row => row.state === 'closed' && row.merged_at)
    if (!eligible.length) stop('UPSTREAM_UNMERGED')
    if (eligible.length !== 1) stop('AMBIGUOUS_COMMIT_ASSOCIATION')
    return { candidate: eligible[0], evidence: listed.evidence, singlePage: listed.singlePage }
  }
  async function readPull(candidate: PullSummary): Promise<ObservedPull> {
    const response = await get(milvus, '/pulls/' + candidate.number), parsed = detail.safeParse(response.value)
    if (!parsed.success) stop('METADATA_SHAPE_INVALID')
    const pr = parsed.data
    if (JSON.stringify(summary.parse(pr)) !== JSON.stringify(candidate) || !pr.merged || !pr.merge_commit_sha) stop('PR_IDENTITY_CHANGED')
    if (pr.changed_files > IO.pages * IO.pageSize) stop('METADATA_PAGE_LIMIT')
    const files = await pages('/pulls/' + pr.number + '/files', file, row => row.filename, pr.changed_files)
    return { identity: { number: pr.number, repository: milvus, baseBranch: pr.base.ref, base: pr.base.sha,
      head: pr.head.sha, mergeCommit: pr.merge_commit_sha, merged: true }, commits: pr.commits, evidence: [response.digest, ...files.evidence],
      singlePageProof: response.link === undefined && files.singlePage && files.rows.length < IO.pageSize
        ? {detail: response, files: files.singlePage} : null,
      files: files.rows.map(row => {
        if ((row.status === 'renamed' || row.status === 'copied') !== (row.previous_filename !== undefined) ||
            row.previous_filename === row.filename) stop('PR_FILES_INVALID')
        return { path: row.filename, previousPath: row.previous_filename ?? null, status: row.status, sha: row.sha }
      }) }
  }
  async function associations(oids: readonly string[]) {
    if (oids.length > BATCH_ASSOCIATION_WINDOW || new Set(oids).size !== oids.length) stop('METADATA_QUERY_INVALID')
    const failures = new Map<number, Promise<ObservedPull>>()
    let previous = Promise.resolve()
    const pending = oids.map(oid => {
      const listing = listAssociation(oid)
      // Observe a rejection while the earlier listings are still being registered.
      void listing.catch(() => {})
      const registered = previous.then(async () => {
        const {candidate, evidence, singlePage} = await listing
        if (!candidate) return {pull: null, evidence, singlePage}
        let cached = pulls.get(candidate.number)
        if (cached) {
          if (JSON.stringify(candidate) !== JSON.stringify(cached.summary)) stop('PR_IDENTITY_CHANGED')
        } else {
          const pull = readPull(candidate).catch(error => { failures.set(candidate.number, pull); throw error })
          cached = {summary: candidate, pull}
          pulls.set(candidate.number, cached)
        }
        return {pull: cached.pull, evidence, singlePage}
      })
      // Input order owns the PR reservation. Its detail/files can finish independently.
      previous = registered.then(() => {}, () => {})
      return registered.then(async ({pull, evidence, singlePage}) => ({pull: await pull, evidence, singlePage}))
    })
    const settled = await Promise.allSettled(pending)
    // This window shares each PR failure. Only a later window can re-observe it.
    for (const [number, pull] of failures) if (pulls.get(number)?.pull === pull) pulls.delete(number)
    return settled
  }
  async function association(oid: string) {
    const [result] = await associations([oid])
    if (result.status === 'rejected') throw result.reason
    return result.value
  }
  async function fixedReads<T>(reads: (() => Promise<T>)[]) {
    if (mode === 'discovery') {
      const outcomes = await Promise.allSettled(reads.map(read => read()))
      return outcomes.map(outcome => {
        if (outcome.status === 'rejected') throw outcome.reason
        return outcome.value
      })
    }
    const values: T[] = []
    for (const read of reads) values.push(await read())
    return values
  }
  async function pins() {
    async function identify(repo: keyof typeof clients) {
      const result = repository.safeParse((await get(repo)).value)
      if (!result.success || result.data.id !== repoIds[repo] || result.data.full_name !== repo) stop('GITHUB_REPOSITORY_MISMATCH')
    }
    async function ref(repo: keyof typeof clients, branch: string) {
      const result = reference.safeParse((await get(repo, '/git/ref/heads/' + branch)).value)
      if (!result.success || result.data.ref !== 'refs/heads/' + branch) stop('GITHUB_REF_MISMATCH')
      return result.data.object.sha
    }
    await fixedReads([() => identify(zdoc), () => identify(milvus)])
    const [master, dev, source] = await fixedReads([() => ref(zdoc, 'master'), () => ref(zdoc, 'dev'), () => ref(milvus, 'v3.0.x')])
    return { master, dev, source }
  }
  function close() { admissionClosed = true; agent?.destroy() }
  return { pins, association, associations, close }
}

import {retainedMetadata, boundArtifact, object, type ReadonlyGitHub} from './github'
import {latestGuidesRun, scheduledFetchRunPath, stepWindow, successfulJob} from './guides-run-metadata'
import {coordinatorBodyReader} from './guides-lifecycle-transport'
import {replayMetadataReader, type ReplayMetadataRow} from './guides-metadata-broker'
/** A separate fixed GET sequence, after Python has finished reading. No broker
 * channels, archive grant or caller-supplied positive classification is reused. */
export async function verifyBatchFinalFreshness(expected: {scanStartMs: number; sourceJobId: number; run: {id: number; attempt: 1; head: string};
  sourceArtifact: {id: number; bytes: number; sha256: string}; publicationArtifact: {id: number; bytes: number; sha256: string};
  pins: {master: string; dev: string; source: string}}, now: number, replay?: readonly ReplayMetadataRow[], signal?: AbortSignal) {
  const raw = replay === undefined ? undefined : replayMetadataReader(replay)
  const read = coordinatorBodyReader(process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? '', signal, {includeMilvusPins: true})
  let count = 0, total = 0
  const api: ReadonlyGitHub = {async get(path) {
    signal?.throwIfAborted()
    if (++count > 63) throw Error('BATCH_FINAL_METADATA_LIMIT')
    const bytes = raw ? await raw.read(path) : await read(path, 16 * 1024 * 1024, 30_000)
    total += bytes.length
    if (total > 64 * 1024 * 1024) throw Error('BATCH_FINAL_METADATA_LIMIT')
    signal?.throwIfAborted(); return parseStrictJson(bytes)
  }, async zip() {throw Error('BATCH_FINAL_ARCHIVE_REQUEST_INVALID')}}
  const select = (value: unknown) => {
    const rows = object(value).workflow_runs
    if (!Array.isArray(rows) || rows.length !== 1) throw Error('SCHEDULED_FETCH_MISSING')
    const run = object(rows[0])
    if (run.id !== expected.run.id || run.run_attempt !== 1 || run.head_sha !== expected.run.head ||
      run.repository?.id !== 660446555 || run.head_repository?.id !== 660446555 || run.workflow_id !== 83360731 ||
      run.path !== '.github/workflows/fetch-docs.yml' || run.head_branch !== 'master' || run.event !== 'schedule' ||
      run.status !== 'completed' || run.conclusion !== 'success') throw Error('BATCH_FINAL_RUN_CHANGED')
    return run
  }
  select(await api.get(scheduledFetchRunPath))
  const facts = await retainedMetadata(api, expected.run.id), run = select({workflow_runs: [facts.run]})
  for (const [name, expectedArtifact] of [[`guides-sources-en-${run.id}`, expected.sourceArtifact],
    [`publication-results-fetch-${run.id}-1`, expected.publicationArtifact]] as const) {
    const artifact = boundArtifact(facts.artifacts, run, name)
    if (artifact.id !== expectedArtifact.id || artifact.size_in_bytes !== expectedArtifact.bytes || artifact.digest !== 'sha256:' + expectedArtifact.sha256) throw Error('BATCH_FINAL_ARTIFACT_CHANGED')
  }
  const sourceJob = successfulJob(facts.jobs, 'produce_guides_sources / fetch', run)
  const scan = stepWindow(sourceJob, 'Fetch shared guides sources')
  if (!scan || scan.start !== expected.scanStartMs || sourceJob?.id !== expected.sourceJobId) throw Error('BATCH_FINAL_SCAN_CHANGED')
  if (!scan || !Number.isSafeInteger(now) || now - scan.start > 36 * 3600_000 || scan.start - now > 5 * 60_000) throw Error('BATCH_FRESHNESS_EXPIRED')
  if (!await latestGuidesRun(api, run, scan.start)) throw Error('BATCH_FINAL_HISTORY_CHANGED')
  for (const [repo, id] of [['zilliztech/zdoc', 660446555], ['milvus-io/milvus-docs', 267273319]] as const) {
    const value = object(await api.get('repos/' + repo))
    if (value.id !== id || value.full_name !== repo) throw Error('GITHUB_REPOSITORY_MISMATCH')
  }
  for (const [repo, branch, sha] of [['zilliztech/zdoc', 'master', expected.pins.master], ['zilliztech/zdoc', 'dev', expected.pins.dev], ['milvus-io/milvus-docs', 'v3.0.x', expected.pins.source]]) {
    const value = object(await api.get(`repos/${repo}/git/ref/heads/${branch}`))
    if (value.ref !== 'refs/heads/' + branch || value.object?.type !== 'commit' || value.object.sha !== sha) throw Error('BATCH_PIN_CHANGED')
  }
  raw?.finish(); signal?.throwIfAborted()
}
