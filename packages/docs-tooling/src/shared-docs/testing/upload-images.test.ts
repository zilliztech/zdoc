// @vitest-environment node
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { runUploadImages } from '../commands/upload-images'
import { sourceDir } from './manual/demo'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'upload-images-')); roots.push(root)
  return root
}

const imageBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 9, 8, 7, 6])
const imageSha = createHash('sha256').update(imageBytes).digest('hex')
const address = `shared/${imageSha}.png`

/** A record shaped like the producer's whole-manual record, attesting one image. */
async function writeRecord(root: string, overrides: Record<string, unknown> = {}, images: unknown[] = [
  { source: `${sourceDir}/Collections/images/diagram.png`, sha256: imageSha, address },
]) {
  const record = { schema_version: 1, group: 'node', manual: 'node',
    inputs: { images }, outputs: [], artifacts: [], ...overrides }
  await mkdir(join(root, 'generated/en/manifests/shared-manuals'), { recursive: true })
  await writeFile(join(root, 'generated/en/manifests/shared-manuals/node.json'), `${JSON.stringify(record, null, 2)}\n`)
  return 'generated/en/manifests/shared-manuals/node.json'
}

async function writeScratch(root: string, entries: Record<string, Uint8Array>) {
  await mkdir(join(root, 'scratch/images'), { recursive: true })
  for (const [name, bytes] of Object.entries(entries)) {
    await writeFile(join(root, 'scratch/images', name), bytes)
  }
}

function uploading() {
  const uploads: { group: string; key: string; sha256: string; bytes: Uint8Array }[] = []
  return { uploads, uploader: { async upload(input: { group: string; key: string; sha256: string; bytes: Uint8Array }) {
    uploads.push(input); return `https://images.example.com/${input.key}`
  } } }
}

it('uploads every record-attested image from the scratch and reports the count', async () => {
  const root = await fixture()
  const record = await writeRecord(root)
  await writeScratch(root, { [imageSha]: imageBytes })
  const { uploads, uploader } = uploading()
  const output: string[] = []
  const code = await runUploadImages({ group: 'node', record, scratch: join(root, 'scratch') },
    text => output.push(text), { uploader, repositoryRoot: root })
  expect(code).toBe(0)
  expect(uploads).toEqual([{ group: 'node', key: address, sha256: imageSha, bytes: imageBytes }])
  expect(JSON.parse(output.at(-1)!)).toEqual({ group: 'node', record, images: 1 })
})

it('is a no-op upload loop for an imageless record with an empty scratch', async () => {
  const root = await fixture()
  const record = await writeRecord(root, {}, [])
  await mkdir(join(root, 'scratch/images'), { recursive: true })
  const { uploads, uploader } = uploading()
  const code = await runUploadImages({ group: 'node', record, scratch: join(root, 'scratch') }, () => {}, { uploader, repositoryRoot: root })
  expect(code).toBe(0)
  expect(uploads).toEqual([])
})

it('fails closed when the scratch and the record disagree', async () => {
  const root = await fixture()
  const record = await writeRecord(root)
  const other = Uint8Array.from([1, 2, 3])
  // A missing scratch directory reads as the clean missing-image failure, not a crash.
  const missing: string[] = []
  expect(await runUploadImages({ group: 'node', record, scratch: join(root, 'scratch') },
    text => missing.push(text), { uploader: uploading().uploader, repositoryRoot: root })).toBe(1)
  expect(missing.join('')).toMatch(/Missing scratch images directory/)
  // Missing body + unattested orphan + digest mismatch, one run each.
  await writeScratch(root, {})
  expect(await runUploadImages({ group: 'node', record, scratch: join(root, 'scratch') }, () => {}, { uploader: uploading().uploader, repositoryRoot: root })).toBe(1)
  await rm(join(root, 'scratch/images'), { recursive: true })
  await writeScratch(root, { [createHash('sha256').update(other).digest('hex')]: other })
  expect(await runUploadImages({ group: 'node', record, scratch: join(root, 'scratch') }, () => {}, { uploader: uploading().uploader, repositoryRoot: root })).toBe(1)
  await rm(join(root, 'scratch/images'), { recursive: true })
  await writeScratch(root, { [imageSha]: other })
  const uploads: unknown[] = []
  expect(await runUploadImages({ group: 'node', record, scratch: join(root, 'scratch') }, () => {},
    { uploader: { async upload(input) { uploads.push(input); return '' } }, repositoryRoot: root })).toBe(1)
  expect(uploads).toEqual([])
})

it('rejects a record whose addresses do not key by their own digest or whose group differs', async () => {
  const root = await fixture()
  const drifted = await writeRecord(root, {}, [{ source: 'x.png', sha256: imageSha, address: 'shared/deadbeef.png' }])
  await writeScratch(root, { [imageSha]: imageBytes })
  await expect(runUploadImages({ group: 'node', record: drifted, scratch: join(root, 'scratch') }, () => {},
    { uploader: uploading().uploader, repositoryRoot: root })).rejects.toThrow(/must key the image bed/)
  const other = await writeRecord(root, { group: 'guides' })
  await expect(runUploadImages({ group: 'node', record: other, scratch: join(root, 'scratch') }, () => {},
    { uploader: uploading().uploader, repositoryRoot: root })).rejects.toThrow(/names group guides/)
})

it('stays reachable through the docs-tooling CLI and refuses unknown options', async () => {
  const root = await fixture()
  const record = await writeRecord(root)
  await writeScratch(root, { [imageSha]: imageBytes })
  const script = resolve('scripts/docs-tooling.js')
  // A no-credentials environment cannot upload; assert the CLI surfaces the uploader's
  // validation failure (IMAGE_BED_URL missing) rather than misparsing the arguments.
  const cli = await import('node:child_process')
  const environment = {...process.env, IMAGE_BED_URL: '', AWS_BUCKET: ''}
  const missing = cli.spawnSync(process.execPath, [script, 'shared-docs', 'upload-images',
    '--group', 'node', '--record', record, '--scratch', join(root, 'scratch')], { encoding: 'utf8', cwd: root, env: environment })
  expect(missing.stderr).toMatch(/IMAGE_BED_URL/)
  const unknown = cli.spawnSync(process.execPath, [script, 'shared-docs', 'upload-images',
    '--group', 'node', '--record', record, '--scratch', join(root, 'scratch'), '--bogus'], { encoding: 'utf8', cwd: root, env: environment })
  expect(unknown.stderr).toMatch(/Unknown upload-images option/)
})
