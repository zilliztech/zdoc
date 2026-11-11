import { join } from 'node:path'
import { parseStrictJson } from '../../core/updates/canonical'
import { rawSha256, readRegularBytes, writeOwnedBlob, type EvidenceStore } from './evidence'
import { boundArtifact, GitHubReads, retainedMetadata, type ReadonlyGitHub } from './github'

const repository = 'repos/zilliztech/zdoc'
const sourceLimit = 256 * 1024 * 1024
const publicationLimit = 1024 * 1024
const metadataLimit = 16 * 1024 * 1024
const runResource = /^\/actions\/runs\/[1-9][0-9]*(?:\/(?:attempts\/[1-9][0-9]*\/jobs|artifacts)\?per_page=100&page=(?:[1-9]|1[0-9]|20))?$/
const workflowResource = /^\/actions\/workflows\/(?:fetch-docs|fetch-guides-requested)\.yml\/runs\?created=%3E%3D[0-9]{4}-[0-9]{2}-[0-9]{2}&per_page=100&page=(?:[1-9]|10)$/

/** The worker independently observes GitHub. A staged archive supplies bytes only. */
export function publicGuidesReads(archives: StagedArchives | null): ReadonlyGitHub {
  return {
    async get(path) {
      const resource = path.slice(repository.length)
      if (!path.startsWith(repository) || !(resource === '' || resource === '/branches/dev' ||
        runResource.test(resource) || workflowResource.test(resource))) throw new Error('Unsupported public lifecycle endpoint')
      const response = await fetch(`https://api.github.com/${path}`, {
        method: 'GET', credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(30_000),
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
      if (archives?.source.id === id) return readRegularBytes(archives.source.path, maximum)
      if (archives?.publication.id === id) return readRegularBytes(archives.publication.path, Math.min(maximum, publicationLimit))
      throw new Error('Authenticated lifecycle archive unavailable')
    },
  }
}

interface StagedArchive { id: number; path: string }
export interface StagedArchives { source: StagedArchive; publication: StagedArchive }

/** Only the coordinator can read credentials. Never serialize its API response as authority. */
export async function stageGuidesArchives(runId: number, sourceZip: string | null, evidence: EvidenceStore,
  token?: string, signal?: AbortSignal): Promise<StagedArchives | null> {
  const api = new GitHubReads(token)
  async function acquire() {
    const {run, artifacts, artifact: source} = await retainedMetadata(api, runId)
    const publication = boundArtifact(artifacts, run, `publication-results-fetch-${runId}-${run.run_attempt}`)
    if (source.id === publication.id || source.size_in_bytes > sourceLimit || publication.size_in_bytes > publicationLimit)
      throw new Error('Unsupported lifecycle archive size or identity')
    signal?.throwIfAborted()
    const sourceBytes = sourceZip ? await readRegularBytes(sourceZip, source.size_in_bytes) : await api.zip(source.id, source.size_in_bytes)
    signal?.throwIfAborted()
    const publicationBytes = await api.zip(publication.id, publication.size_in_bytes)
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
  const source = await writeOwnedBlob(evidence, inputs.sourceBytes)
  signal?.throwIfAborted()
  const publication = await writeOwnedBlob(evidence, inputs.publicationBytes)
  return {source: {id: inputs.source.id, path: join(evidence.root, source.path)},
    publication: {id: inputs.publication.id, path: join(evidence.root, publication.path)}}
}
