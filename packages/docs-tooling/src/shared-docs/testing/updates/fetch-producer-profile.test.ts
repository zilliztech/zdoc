// @vitest-environment node
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { fetchProducerProfile, fetchProducerProfileV2, parseFetchTree, parseFetchTreeV2, pilotLockPath } from '../../adapters/updates/fetch-producer-profile'
const oid = (bytes: Uint8Array) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
const lock = (pin = 'a'.repeat(40)) => Buffer.from(`schema_version: 1\ncurrent: ${pin}\nnext: ${pin}\n`)
function listing(bytes = lock(), extra = '100644 blob ' + 'b'.repeat(40) + '\tREADME.md\0') {
  return Buffer.from(['shared-docs', 'shared-docs/guides', 'shared-docs/guides/pages', 'shared-docs/guides/pages/json-field-overview']
    .map(path => `040000 tree ${'c'.repeat(40)}\t${path}\0`).join('') + `100644 blob ${oid(bytes)}\t${pilotLockPath}\0` + extra)
}
it('normalizes only byte-canonical pilot lock values and tree OIDs with a domain-separated profile', () => {
  expect(fetchProducerProfile(parseFetchTree(listing()), lock())).toBe(fetchProducerProfile(parseFetchTree(listing(lock('d'.repeat(40)))), lock('d'.repeat(40))))
  const quoted = Buffer.from(lock().toString().replace('current: ', 'current: "').replace('\nnext:', '"\nnext:'))
  expect(fetchProducerProfile(parseFetchTree(listing(quoted)), quoted)).not.toBe(fetchProducerProfile(parseFetchTree(listing()), lock()))
  const original = listing()
  expect(fetchProducerProfile(parseFetchTree(Buffer.from(original.toString().replaceAll('040000 tree ' + 'c'.repeat(40), '040000 tree ' + 'd'.repeat(40)))), lock())).toBe(fetchProducerProfile(parseFetchTree(original), lock()))
  for (const path of ['README.md', 'unknown.ts', '.github/workflows/fetch-docs.yml', 'packages/docs-tooling/loader.ts', '.pnpmfile.cjs', 'pnpm-lock.yaml', 'package.json', 'build.config.js', 'site/page.mdx', 'generated/sidebar.js', 'policy/registration.json']) {
    const parts = path.split('/'), parents = parts.slice(0, -1).map((_, index) => `040000 tree ${'e'.repeat(40)}\t${parts.slice(0, index + 1).join('/')}\0`).join('')
    const a = listing(lock(), parents + `100644 blob ${'a'.repeat(40)}\t${path}\0`), b = listing(lock(), parents + `100644 blob ${'b'.repeat(40)}\t${path}\0`)
    expect(fetchProducerProfile(parseFetchTree(a), lock())).not.toBe(fetchProducerProfile(parseFetchTree(b), lock()))
  }
})
it('rejects malformed framing, UTF-8, unsafe/duplicate paths, modes, OIDs, missing parents and collisions', () => {
  for (const bytes of [Buffer.from(''), listing().subarray(0, -1), Buffer.from([255, 0]), Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), listing()]), listing(lock(), `100644 blob ${'b'.repeat(40)}\t../escape\0`),
    listing(lock(), `100644 blob ${'b'.repeat(40)}\tREADME.md\0`.repeat(2)), listing(lock(), `100755 tree ${'b'.repeat(40)}\tbad\0`),
    listing(lock(), `100644 blob ${'0'.repeat(40)}\tbad\0`), listing(lock(), `100644 blob ${'b'.repeat(40)}\tmissing/file\0`),
    listing(lock(), `120000 blob ${'b'.repeat(40)}\tlink\0`), listing(lock(), `160000 commit ${'b'.repeat(40)}\tsubmodule\0`)]) expect(() => parseFetchTree(bytes)).toThrow()
  expect(() => fetchProducerProfile(parseFetchTree(listing()), Buffer.from('invalid'))).toThrow()
  expect(() => fetchProducerProfile(parseFetchTree(listing()), Buffer.alloc(65537))).toThrow()
})
it('retains empty directories, executable modes, paths, and the exact existing CLAUDE alias', () => {
  const base = fetchProducerProfile(parseFetchTree(listing()), lock())
  for (const extra of [`040000 tree ${'a'.repeat(40)}\tempty\0`, `100755 blob ${'b'.repeat(40)}\tREADME.md\0`, `100644 blob ${'b'.repeat(40)}\trenamed\0`])
    expect(fetchProducerProfile(parseFetchTree(listing(lock(), extra)), lock())).not.toBe(base)
  const alias = `120000 blob 47dc3e3d863cfb5727b87d785d09abf9743c0a72\tCLAUDE.md\0`
  expect(() => parseFetchTree(listing(lock(), alias + `100644 blob ${'b'.repeat(40)}\tAGENTS.md\0`))).not.toThrow()
  expect(() => parseFetchTree(listing(lock(), alias))).toThrow()
  expect(() => parseFetchTree(listing(lock(), alias.replace('47dc', '57dc')))).toThrow()
})

it('rejects the exact tree-byte and entry-count boundaries without omitting members', () => {
  expect(() => parseFetchTree(Buffer.alloc(32 * 1024 * 1024 + 1))).toThrow()
  expect(() => parseFetchTree(listing(lock(), Array.from({length: 20_000}, (_, i) => `100644 blob ${'a'.repeat(40)}\tfile${i}\0`).join('')))).toThrow(/entry limit/)
})

it('validates deep shared prefixes within the existing tree bounds without rebuilding every ancestor', () => {
  const depth = 1800, leaves = 7800, blob = oid(Buffer.alloc(0)), directory = 'c'.repeat(40)
  const prefixes = Array.from({length: depth}, (_, i) => 'd/'.repeat(i + 1).slice(0, -1))
  const nested = prefixes.at(-1)!
  const extra = prefixes.map(path => `040000 tree ${directory}\t${path}\0`).join('') +
    Array.from({length: leaves}, (_, i) => `100644 blob ${blob}\t${nested}/f${i}\0`).join('')
  const raw = listing(lock(), extra)
  expect(raw.length).toBeLessThan(32 * 1024 * 1024)
  const parsed = parseFetchTree(raw)
  expect(parsed).toHaveLength(depth + leaves + 5)
  expect(fetchProducerProfile(parsed, lock())).toMatch(/^[0-9a-f]{64}$/)
  expect(() => parseFetchTree(listing(lock(), `100644 blob ${blob}\tdir\0` +
    `100644 blob ${blob}\tdir/file\0`))).toThrow(/parent/)
  expect(() => parseFetchTree(listing(lock(), `040000 tree ${directory}\tmissing/dir\0` +
    `100644 blob ${blob}\tmissing/dir/file\0`))).toThrow(/parent/)
})

it('v2 uses its exact distinct domain and marker while binding directories, modes and unsupported variants', () => {
  const bytes = lock(), path = 'shared-docs/guides/pages/page-a/lock.yaml'
  const raw = Buffer.from(listing(bytes).toString().replaceAll('json-field-overview', 'page-a'))
  const entries = parseFetchTreeV2(raw), locks = new Map([[path, bytes]])
  const expected = createHash('sha256').update('zdoc/fetch-producer-profile-v2\0')
  for (const entry of entries) expected.update(`${entry.mode} ${entry.type} ${entry.type === 'tree' ? '<directory>' : entry.path === path ? '<guides-lock-data>' : entry.oid}\t${entry.path}\0`)
  const base = fetchProducerProfileV2(entries, locks)
  expect(base).toBe(expected.digest('hex'))
  expect(() => parseFetchTree(raw)).toThrow(/pilot/)
  expect(fetchProducerProfileV2(parseFetchTreeV2(Buffer.from(raw.toString().replaceAll('040000 tree ' + 'c'.repeat(40), '040000 tree ' + 'd'.repeat(40)))), locks)).toBe(base)
  for (const extra of [`040000 tree ${'a'.repeat(40)}\tempty\0`, `100644 blob ${'a'.repeat(40)}\tshared-docs/guides/pages/page-a/variant-next.md\0`]) {
    expect(fetchProducerProfileV2(parseFetchTreeV2(Buffer.concat([raw, Buffer.from(extra)])), locks)).not.toBe(base)
  }
  expect(fetchProducerProfileV2(parseFetchTreeV2(Buffer.from(raw.toString().replace('100644 blob ' + 'b'.repeat(40), '100755 blob ' + 'b'.repeat(40)))), locks)).not.toBe(base)
  expect(fetchProducerProfileV2(entries.filter(entry => entry.path !== 'README.md'), locks)).not.toBe(base)
  const alias = `120000 blob 47dc3e3d863cfb5727b87d785d09abf9743c0a72\tCLAUDE.md\0`
  expect(() => parseFetchTreeV2(Buffer.concat([raw, Buffer.from(alias)]))).toThrow(/alias/)
  expect(() => parseFetchTreeV2(Buffer.concat([raw, Buffer.from(alias + `100644 blob ${'b'.repeat(40)}\tAGENTS.md\0`)]))).not.toThrow()
})
