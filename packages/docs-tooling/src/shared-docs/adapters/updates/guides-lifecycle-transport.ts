import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { parseStrictJson } from '../../core/updates/canonical'
import { createOwnedDirectory, rawSha256, readRegularBytes, type EvidenceStore } from './evidence'
import { boundArtifact, retainedMetadata, type ReadonlyGitHub } from './github'
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

/** Only the coordinator can read credentials. Never serialize its API response as authority. */
export async function stageGuidesArchives(runId: number, sourceZip: string | null, evidence: EvidenceStore,
  token?: string, signal?: AbortSignal): Promise<StageResult> {
  const api = token ? coordinatorReads(token, signal) : publicGuidesReads(null, signal)
  async function acquire() {
    const {run, artifacts, artifact: source} = await retainedMetadata(api, runId)
    const publication = boundArtifact(artifacts, run, `publication-results-fetch-${runId}-${run.run_attempt}`)
    if (source.id === publication.id) throw new Error('Ambiguous lifecycle archive identity')
    if (source.size_in_bytes > sourceLimit) return {oversized: 'source'} as const
    if (publication.size_in_bytes > publicationLimit) return {oversized: 'publication'} as const
    signal?.throwIfAborted()
    const sourceBytes = sourceZip ? await readRegularBytes(sourceZip, source.size_in_bytes) : await api.zip(source.id, source.size_in_bytes)
    signal?.throwIfAborted()
    // An explicitly supplied source ZIP may have the matching publication archive
    // beside it. Only a missing sibling falls back to GitHub. Its bytes must pass
    // the same no-follow read, size and digest checks as the source archive.
    const localPublication = sourceZip && join(dirname(sourceZip), publication.name + '.zip')
    const supplied = localPublication ? await readRegularBytes(localPublication, publication.size_in_bytes).catch(error => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }) : null
    const publicationBytes = supplied ?? await api.zip(publication.id, publication.size_in_bytes)
    for (const [artifact, bytes] of [[source, sourceBytes], [publication, publicationBytes]] as const) {
      if (artifact.size_in_bytes !== bytes.byteLength || artifact.digest !== 'sha256:' + rawSha256(bytes))
        throw new Error('Lifecycle archive digest or size mismatch')
    }
    return {source, sourceBytes, publication, publicationBytes}
  }
  // Missing, expired or unauthenticated input still gets a measured report with unknown authority.
  const inputs = await acquire().catch(() => null)
  signal?.throwIfAborted()
  if (!inputs) return null
  if (inputs.oversized) return {oversized: inputs.oversized}
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
