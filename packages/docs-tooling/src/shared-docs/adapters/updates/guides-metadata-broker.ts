import { createHash } from 'node:crypto'
import { Socket } from 'node:net'
import type { Readable, Writable } from 'node:stream'
import { parseStrictJson } from '../../core/updates/canonical'
import { retainedMetadata, type ReadonlyGitHub } from './github'
import { coordinatorBodyReader, LifecycleHttpError, metadataLimit } from './guides-lifecycle-transport'
import { latestGuidesRun, stepWindow, successfulJob } from './guides-run-metadata'

const maximumRequests = 63 // repo, run, jobs/artifacts (20 pages each), two histories (10 each), dev
const requestBytes = 33
const replyHeaderBytes = 5

function requestFrame(sequence: number, path: string) {
  if (sequence > maximumRequests) throw new Error('Guides metadata request limit exceeded')
  return Buffer.concat([Buffer.from([sequence]), createHash('sha256').update(path).digest()])
}

/** Read one bounded frame across any number of pipe chunks. A peer cannot select an allocation size. */
function framedReader(input: Readable) {
  const chunks = input[Symbol.asyncIterator]()
  let rest = Buffer.alloc(0)
  return async (count: number) => {
    if (count < 1 || count > metadataLimit) throw new Error('Invalid Guides metadata frame size')
    const result = Buffer.allocUnsafe(count)
    let offset = 0
    while (offset < count) {
      if (!rest.length) {
        const chunk = await chunks.next()
        if (chunk.done) throw new Error('Guides metadata channel closed')
        rest = chunk.value
      }
      const length = Math.min(count - offset, rest.length)
      rest.copy(result, offset, 0, length)
      rest = rest.subarray(length)
      offset += length
    }
    return result
  }
}

function write(pipe: Writable, data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => pipe.write(data, error => error ? reject(error) : resolve()))
}

/** Launched only by the measured worker entry, using inherited descriptors and no named rendezvous. */
export function openWorkerMetadataReader() {
  const requests = new Socket({fd: 4, readable: false, writable: true})
  const replies = new Socket({fd: 5, readable: true, writable: false})
  const read = framedReader(replies)
  requests.on('error', () => replies.destroy())
  replies.on('error', () => requests.destroy())
  let sequence = 0
  return {
    async get(path: string) {
      const id = ++sequence
      await write(requests, requestFrame(id, path))
      const header = await read(replyHeaderBytes)
      if (header[0] === (id | 0x80)) {
        const status = header.readUInt32BE(1)
        if (status >= 100 && status <= 599) throw new LifecycleHttpError(status)
        throw new Error('Guides metadata read failed')
      }
      if (header[0] !== id) throw new Error('Unexpected Guides metadata response sequence')
      return parseStrictJson(await read(header.readUInt32BE(1)))
    },
    close() { requests.destroy(); replies.destroy() },
  }
}

/** The parent derives every endpoint from the selected run and fresh responses. The child sends
 * only its sequence and expected path digest. It still authenticates all returned metadata itself. */
export async function serveGuidesMetadata(requests: Readable, replies: Writable, runId: number, token: string, signal: AbortSignal) {
  const read = framedReader(requests)
  const fetchBody = coordinatorBodyReader(token, signal)
  let sequence = 0
  const api: ReadonlyGitHub = {
    async get(path) {
      const expected = requestFrame(++sequence, path)
      const received = await read(requestBytes)
      if (!received.equals(expected)) throw new Error('Unexpected Guides metadata operation')
      signal.throwIfAborted()
      const header = Buffer.alloc(replyHeaderBytes)
      let bytes: Uint8Array, value: unknown
      try {
        bytes = await fetchBody(path, metadataLimit, 30_000)
        value = parseStrictJson(bytes)
      } catch (error) {
        // Only a bounded status code is visible to the child, never a response body or headers.
        header[0] = sequence | 0x80
        header.writeUInt32BE(error instanceof LifecycleHttpError ? error.status : 0, 1)
        await write(replies, header)
        throw error
      }
      header[0] = sequence
      header.writeUInt32BE(bytes.length, 1)
      await write(replies, header)
      await write(replies, bytes)
      return value
    },
    async zip() { throw new Error('Guides metadata channel does not serve archives') },
  }
  const {run, jobs} = await retainedMetadata(api, runId)
  const scan = stepWindow(successfulJob(jobs, 'produce_guides_sources / fetch', run), 'Fetch shared guides sources')
  if (scan && await latestGuidesRun(api, run, scan.start)) await api.get('repos/zilliztech/zdoc/branches/dev')
}
