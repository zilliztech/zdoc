import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { resolveOwnedRepositoryPath } from '../../validation/ownership.ts'

/** The upload step for manual-layout shared-source fetches (design 10 R2-b). The fetch
 * producer deliberately hands image bodies over through a caller-owned scratch (it has
 * no storage credentials); this command uploads them to the publication image bed keyed
 * by the immutable addresses the published manual record attests, so the fetched MDX
 * never names an address whose bytes were not accepted first. */
export interface UploadImagesOptions {
  /** The content group the record belongs to; the record must name the same group. */
  group: string
  /** Repository-relative path of the published manual record. */
  record: string
  /** The producer's scratch root, holding `images/<sha256>` bodies. */
  scratch: string
}

export interface UploadImagesDependencies {
  /** Test seam: the production uploader needs AWS credentials and a network. */
  uploader?: {
    upload(input: { group: string; key: string; sha256: string; bytes: Uint8Array }): Promise<string>
    destroy?(): void
  }
  repositoryRoot?: string
}

interface RecordImage { source: string; sha256: string; address: string }

function recordImages(record: unknown, group: string): RecordImage[] {
  if (typeof record !== 'object' || record === null) throw new Error('Manual record must be a JSON object')
  const value = record as { schema_version?: unknown; group?: unknown; inputs?: { images?: unknown } }
  if (value.schema_version !== 1) throw new Error(`Manual record schema_version must be 1, got ${String(value.schema_version)}`)
  if (value.group !== group) throw new Error(`Manual record names group ${String(value.group)}, expected ${group}`)
  const images = value.inputs?.images
  if (!Array.isArray(images)) throw new Error('Manual record inputs.images must be an array')
  return images.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) throw new Error(`Manual record inputs.images[${index}] must be an object`)
    const { source, sha256, address } = entry as Record<string, unknown>
    for (const [field, fieldValue] of [['source', source], ['sha256', sha256], ['address', address]] as const) {
      if (typeof fieldValue !== 'string' || !fieldValue) throw new Error(`Manual record inputs.images[${index}].${field} must be a non-empty string`)
    }
    if (!/^[a-f0-9]{64}$/.test(sha256 as string)) {
      throw new Error(`Manual record inputs.images[${index}].sha256 must be a lowercase 64-character digest: ${String(sha256)}`)
    }
    if (!new RegExp(`^shared/${sha256 as string}\\.[a-z0-9]+$`, 'u').test(address as string)) {
      throw new Error(`Manual record inputs.images[${index}].address must key the image bed by its own digest: ${String(address)}`)
    }
    return { source: source as string, sha256: sha256 as string, address: address as string }
  })
}

export async function runUploadImages(options: UploadImagesOptions, write: (text: string) => void = text => process.stdout.write(text),
  dependencies: UploadImagesDependencies = {}): Promise<number> {
  const repositoryRoot = resolve(dependencies.repositoryRoot ?? process.cwd())
  const recordPath = resolveOwnedRepositoryPath(repositoryRoot, options.record, 'Manual record path')
  const imagesDir = join(resolve(options.scratch), 'images')
  const record = JSON.parse(await readFile(recordPath, 'utf8')) as unknown
  const images = recordImages(record, options.group)

  // The scratch must hold exactly the record's image bodies: the producer reset it for
  // this run, so a missing body or an unattested orphan both mean the staged bytes and
  // the attested record disagree and the fetch must not be published.
  let entries: string[]
  try {
    entries = await readdir(imagesDir)
  } catch {
    write(`Missing scratch images directory: ${imagesDir}\n`)
    return 1
  }
  const scratchFiles = new Set(entries)
  const expected = new Set(images.map(image => image.sha256))
  const missing = [...expected].filter(digest => !scratchFiles.has(digest))
  const orphans = [...scratchFiles].filter(digest => !expected.has(digest))
  if (missing.length || orphans.length) {
    for (const digest of missing) write(`Missing scratch image for the record: ${digest}\n`)
    for (const digest of orphans) write(`Scratch image is not attested by the record: ${digest}\n`)
    return 1
  }

  let uploader = dependencies.uploader
  if (!uploader) {
    // The uploader module loads lazily: its top level requires the AWS S3 client.
    const { SharedImageUploader } = await import('../../lark/sharedImageUploader.js')
    uploader = new SharedImageUploader()
  }
  let count = 0
  try {
    for (const image of [...images].sort((left, right) => left.sha256.localeCompare(right.sha256))) {
      const bytes = await readFile(join(imagesDir, image.sha256))
      const digest = createHash('sha256').update(bytes).digest('hex')
      if (digest !== image.sha256) {
        write(`Scratch image digest mismatch for ${image.address}: record ${image.sha256}, bytes ${digest}\n`)
        return 1
      }
      const body = new Uint8Array(bytes)
      if (body.byteLength > 32 * 1024 * 1024) {
        write(`Accepted image exceeds the 32 MiB publication cap: ${image.address}\n`)
        return 1
      }
      await uploader.upload({ group: options.group, key: image.address, sha256: image.sha256, bytes: body })
      count += 1
    }
  } finally {
    uploader.destroy?.()
  }
  write(JSON.stringify({ group: options.group, record: options.record, images: count }, null, 2) + '\n')
  return 0
}
