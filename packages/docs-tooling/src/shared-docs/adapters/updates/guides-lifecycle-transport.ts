import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { parseStrictJson } from '../../core/updates/canonical'
import { createOwnedDirectory, rawSha256, readRegularBytes, type EvidenceStore } from './evidence'
import { boundArtifact, retainedMetadata, type ReadonlyGitHub } from './github'
import { scheduledFetchRunPath } from './guides-run-metadata'
import { createRemoteTransport } from './remote-github'

const repository = 'repos/zilliztech/zdoc'
const sourceLimit = 256 * 1024 * 1024
const publicationLimit = 1024 * 1024
export const metadataLimit = 16 * 1024 * 1024
const runResource = /^\/actions\/runs\/[1-9][0-9]*(?:\/(?:attempts\/[1-9][0-9]*\/jobs|artifacts)\?per_page=100&page=(?:[1-9]|1[0-9]|20))?$/
const workflowResource = /^\/actions\/workflows\/(?:fetch-docs|fetch-guides-requested)\.yml\/runs\?created=%3E%3D[0-9]{4}-[0-9]{2}-[0-9]{2}&per_page=100&page=(?:[1-9]|10)$/

function deadline(milliseconds: number, signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(milliseconds)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

/** The worker independently observes GitHub. A staged archive supplies bytes only. */
export function publicGuidesReads(archives: StageResult, signal?: AbortSignal): ReadonlyGitHub {
  return {
    async get(path) {
      const resource = path.slice(repository.length)
      if (!path.startsWith(repository) || !(resource === '' || resource === '/branches/dev' ||
        runResource.test(resource) || workflowResource.test(resource))) throw new Error('Unsupported public lifecycle endpoint')
      const response = await fetch(`https://api.github.com/${path}`, {
        method: 'GET', credentials: 'omit', redirect: 'error', signal: deadline(30_000, signal),
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'zdoc-guides-lifecycle', 'X-GitHub-Api-Version': '2022-11-28' },
      })
      if (!response.ok || !response.body) {
        await response.body?.cancel()
        throw new Error(`Public GitHub lifecycle read failed (HTTP ${response.status})`)
      }
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let size = 0
      try {
        while (true) {
          const {done, value} = await reader.read()
          if (done) break
          size += value.byteLength
          if (size > metadataLimit) {
            await reader.cancel()
            throw new Error('Oversized GitHub lifecycle metadata')
          }
          chunks.push(value)
        }
      } finally { reader.releaseLock() }
      return parseStrictJson(Buffer.concat(chunks, size))
    },
    async zip(id, maximum = sourceLimit) {
      if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > sourceLimit) throw new Error('Invalid lifecycle archive byte limit')
      if (!archives) throw new Error('Authenticated lifecycle archive unavailable')
      if ('oversized' in archives) throw new Error(archives.oversized === 'source'
        ? 'Guides source ZIP exceeds the 256 MiB staging limit' : 'Guides publication ZIP exceeds the 1 MiB staging limit')
      if (archives.source.id === id) return readRegularBytes(archives.source.path, maximum)
      if (archives.publication.id === id) return readRegularBytes(archives.publication.path, Math.min(maximum, publicationLimit))
      throw new Error('Authenticated lifecycle archive unavailable')
    },
  }
}

interface StagedArchive { id: number; path: string }
export interface StagedArchives { source: StagedArchive; publication: StagedArchive }
type StageResult = StagedArchives | { oversized: 'source' | 'publication' } | null

// Only the coordinator receives the explicit read token. The fixed HTTPS transport
// bounds streamed bodies and strips credentials on the single permitted ZIP redirect.
export class LifecycleHttpError extends Error {
  constructor(readonly status: number) { super(`GitHub lifecycle read failed (HTTP ${status})`) }
}
export function coordinatorBodyReader(token: string, signal?: AbortSignal) {
  const transport = createRemoteTransport({repositoryFullName: 'zilliztech/zdoc', token})
  return async (path: string, maximum: number, milliseconds: number) => {
    const result = await transport({method: 'GET', path: '/' + path, maximum, signal: deadline(milliseconds, signal)})
    if (result.status !== 200) throw new LifecycleHttpError(result.status)
    return result.body
  }
}
function coordinatorReads(token: string, signal?: AbortSignal): ReadonlyGitHub {
  const read = coordinatorBodyReader(token, signal)
  return {
    async get(path) {
      return parseStrictJson(await read(path, metadataLimit, 30_000))
    },
    async zip(id, maximum = sourceLimit) {
      if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(maximum) || maximum < 1 || maximum > sourceLimit)
        throw new Error('Invalid lifecycle artifact ID or size')
      return read(`${repository}/actions/artifacts/${id}/zip`, maximum, 120_000)
    },
  }
}

type AcquisitionStage = 'METADATA' | 'SOURCE_ZIP' | 'PUBLICATION_ZIP' | 'BINDING'
type AcquisitionFailure = `HTTP_${number}` | 'TRANSPORT_FAILED' | 'RESPONSE_LIMIT' | 'ENDPOINT_INVALID' | 'REDIRECT_REJECTED' | 'CREDENTIAL_UNAVAILABLE' | 'UNAVAILABLE'
export type LifecycleAcquisitionCode = `LIFECYCLE_ACQUIRE_${AcquisitionStage}_${AcquisitionFailure}`
function acquisitionFailure(error: unknown): AcquisitionFailure {
  if (error instanceof LifecycleHttpError && Number.isInteger(error.status) && error.status >= 100 && error.status <= 599)
    return `HTTP_${error.status}`
  // These literals originate in the fixed coordinator transport. Never retain arbitrary messages.
  if (error instanceof Error) switch (error.message) {
    case 'TRANSPORT_FAILED': case 'RESPONSE_LIMIT': case 'ENDPOINT_INVALID': case 'REDIRECT_REJECTED': case 'CREDENTIAL_UNAVAILABLE':
      return error.message
  }
  return 'UNAVAILABLE'
}

/** Only the coordinator can read credentials. Never serialize its API response as authority. */
export async function stageGuidesArchives(runId: number, sourceZip: string | null, evidence: EvidenceStore,
  token?: string, signal?: AbortSignal, diagnostic?: (code: LifecycleAcquisitionCode) => void): Promise<StageResult> {
  // Trusted ordinary-call sink only; it is never part of worker or operator JSON.
  const observe = (code: LifecycleAcquisitionCode) => { try { diagnostic?.(code) } catch { /* Diagnostics cannot change staging. */ } }
  let acquisitionStage: AcquisitionStage = 'METADATA'
  const api = token ? coordinatorReads(token, signal) : publicGuidesReads(null, signal)
  async function acquire() {
    const {run, artifacts, artifact: source} = await retainedMetadata(api, runId)
    acquisitionStage = 'BINDING'
    const publication = boundArtifact(artifacts, run, `publication-results-fetch-${runId}-${run.run_attempt}`)
    if (source.id === publication.id) throw new Error('Ambiguous lifecycle archive identity')
    if (source.size_in_bytes > sourceLimit) return {oversized: 'source'} as const
    if (publication.size_in_bytes > publicationLimit) return {oversized: 'publication'} as const
    signal?.throwIfAborted()
    acquisitionStage = 'SOURCE_ZIP'
    const sourceBytes = sourceZip ? await readRegularBytes(sourceZip, source.size_in_bytes) : await api.zip(source.id, source.size_in_bytes)
    signal?.throwIfAborted()
    // An explicitly supplied source ZIP may have the matching publication archive
    // beside it. Only a missing sibling falls back to GitHub. Its bytes must pass
    // the same no-follow read, size and digest checks as the source archive.
    acquisitionStage = 'PUBLICATION_ZIP'
    const localPublication = sourceZip && join(dirname(sourceZip), publication.name + '.zip')
    const supplied = localPublication ? await readRegularBytes(localPublication, publication.size_in_bytes).catch(error => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }) : null
    const publicationBytes = supplied ?? await api.zip(publication.id, publication.size_in_bytes)
    acquisitionStage = 'BINDING'
    for (const [artifact, bytes] of [[source, sourceBytes], [publication, publicationBytes]] as const) {
      if (artifact.size_in_bytes !== bytes.byteLength || artifact.digest !== 'sha256:' + rawSha256(bytes))
        throw new Error('Lifecycle archive digest or size mismatch')
    }
    return {source, sourceBytes, publication, publicationBytes}
  }
  // Missing, expired or unauthenticated input still gets a measured report with unknown authority.
  const inputs = await acquire().catch(error => {
    observe(`LIFECYCLE_ACQUIRE_${acquisitionStage}_${acquisitionFailure(error)}`)
    return null
  })
  signal?.throwIfAborted()
  if (!inputs) return null
  if (inputs.oversized) {
    observe(`LIFECYCLE_ACQUIRE_${inputs.oversized === 'source' ? 'SOURCE_ZIP' : 'PUBLICATION_ZIP'}_RESPONSE_LIMIT`)
    return {oversized: inputs.oversized}
  }
  // Transport ZIPs have their own authenticated bounds, independent of the evidence blob limit.
  const directory = await createOwnedDirectory(evidence)
  async function stage(name: string, id: number, bytes: Uint8Array) {
    const path = join(directory.root, name)
    await directory.verify()
    signal?.throwIfAborted()
    await writeFile(path, bytes, {flag: 'wx', mode: 0o600})
    await directory.verify()
    return {id, path}
  }
  const source = await stage('source.zip', inputs.source.id, inputs.sourceBytes)
  const publication = await stage('publication.zip', inputs.publication.id, inputs.publicationBytes)
  return {source, publication}
}

import {object} from './github'
import {currentBatchLifetime, reserveBatchAllocation} from './evidence'
import {replayMetadataReader} from './guides-metadata-broker'
import {BatchReplayFixtureSchema, type BatchReplayFixture, type BatchScope} from './batch-collection-contract'
function scheduledRun(value: unknown) {
  const data = object(value)
  if (!Array.isArray(data.workflow_runs) || data.workflow_runs.length !== 1) throw Error('SCHEDULED_FETCH_MISSING')
  const run = data.workflow_runs[0]
  if (!Number.isSafeInteger(run.id) || run.id < 1 || run.run_attempt !== 1 || !/^[a-f0-9]{40}$/.test(run.head_sha) ||
    run.repository?.id !== 660446555 || run.head_repository?.id !== 660446555 || run.workflow_id !== 83360731 ||
    run.path !== '.github/workflows/fetch-docs.yml' || run.head_branch !== 'master' || run.event !== 'schedule' ||
    run.status !== 'completed' || run.conclusion !== 'success') throw Error('SCHEDULED_FETCH_UNAVAILABLE')
  return run
}
export interface BatchRunLease {run: BatchScope['run']; archives: StagedArchives; source: {id: number; bytes: number; sha256: string};
  publication: {id: number; bytes: number; sha256: string}; broker: {runId: number; token: string} | {runId: number; replay: BatchReplayFixture['qualification']}}
/** Fixed coordinator acquisition. A prospective run is selected here, never supplied
 * by an operator, material header, index or child response. */
export async function acquireBatchRunLease(evidence: EvidenceStore, replay?: BatchReplayFixture): Promise<BatchRunLease> {
  const lifetime = currentBatchLifetime(); lifetime?.check()
  const fixture = replay && BatchReplayFixtureSchema.parse(replay)
  const raw = fixture && replayMetadataReader(fixture.acquisition)
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? ''
  const api: ReadonlyGitHub = fixture ? {
    get: async path => parseStrictJson(await raw!.read(path)),
    zip: async id => {
      const item = [fixture.archives.source, fixture.archives.publication].find(a => a.id === id)
      if (!item) throw Error('BATCH_REPLAY_ARCHIVE_INVALID')
      const bytes = await readRegularBytes(join(fixture.root, item.path), item.bytes)
      if (bytes.length !== item.bytes || rawSha256(bytes) !== item.sha256) throw Error('BATCH_REPLAY_ARCHIVE_INVALID')
      return bytes
    },
  } : coordinatorReads(token, lifetime?.signal)
  const selected = scheduledRun(await api.get(scheduledFetchRunPath))
  const facts = await retainedMetadata(api, selected.id)
  if (facts.run.id !== selected.id || facts.run.run_attempt !== 1 || facts.run.head_sha !== selected.head_sha) throw Error('BATCH_RUN_BINDING_INVALID')
  // Validate the selected run again against the independently read run body.
  scheduledRun({workflow_runs: [facts.run]})
  const publication = boundArtifact(facts.artifacts, facts.run, `publication-results-fetch-${selected.id}-1`)
  const source = facts.artifact
  if (source.id === publication.id || source.size_in_bytes > sourceLimit || publication.size_in_bytes > publicationLimit) throw Error('BATCH_ARCHIVE_LIMIT')
  lifetime?.check()
  await reserveBatchAllocation(evidence, source.size_in_bytes + publication.size_in_bytes, 3)
  const sourceBytes = await api.zip(source.id, source.size_in_bytes), publicationBytes = await api.zip(publication.id, publication.size_in_bytes)
  for (const [item, bytes] of [[source, sourceBytes], [publication, publicationBytes]] as const) {
    if (item.size_in_bytes !== bytes.length || item.digest !== 'sha256:' + rawSha256(bytes)) throw Error('BATCH_ARTIFACT_BINDING_INVALID')
  }
  raw?.finish()
  const owned = await createOwnedDirectory(evidence)
  const stage = async (name: string, id: number, bytes: Uint8Array) => {
    lifetime?.check(); await reserveBatchAllocation(evidence, bytes.length); await owned.verify(); const path = join(owned.root, name); await writeFile(path, bytes, {flag: 'wx', mode: 0o600}); lifetime?.check(); await owned.verify(); return {id, path}
  }
  return {run: {id: selected.id, attempt: 1, head: selected.head_sha},
    archives: {source: await stage('source.zip', source.id, sourceBytes), publication: await stage('publication.zip', publication.id, publicationBytes)},
    source: {id: source.id, bytes: sourceBytes.length, sha256: rawSha256(sourceBytes)},
    publication: {id: publication.id, bytes: publicationBytes.length, sha256: rawSha256(publicationBytes)},
    broker: fixture ? {runId: selected.id, replay: fixture.qualification} : {runId: selected.id, token}}
}

/** One independently bounded pin read at run attachment. Final publication uses
 * another fresh sequence; the qualifier broker is never reused. */
export async function readBatchAttachmentPins(replay?: BatchReplayFixture) {
  if (!replay) {
    const {createBatchGitHub} = await import('./batch-github'), {batchBudget} = await import('./batch-source')
    return createBatchGitHub(batchBudget()).pins()
  }
  const raw = replayMetadataReader(replay.pins)
  const get = async (path: string) => object(parseStrictJson(await raw.read(path)))
  for (const [repo, id] of [['zilliztech/zdoc', 660446555], ['milvus-io/milvus-docs', 267273319]] as const) {
    const value = await get('repos/' + repo)
    if (value.id !== id || value.full_name !== repo) throw Error('GITHUB_REPOSITORY_MISMATCH')
  }
  async function ref(repo: string, branch: string) {
    const value = await get(`repos/${repo}/git/ref/heads/${branch}`)
    if (value.ref !== 'refs/heads/' + branch || value.object?.type !== 'commit' || !/^[a-f0-9]{40}$/.test(value.object.sha)) throw Error('GITHUB_REF_MISMATCH')
    return value.object.sha as string
  }
  const result = {master: await ref('zilliztech/zdoc', 'master'), dev: await ref('zilliztech/zdoc', 'dev'), source: await ref('milvus-io/milvus-docs', 'v3.0.x')}
  raw.finish(); return result
}
