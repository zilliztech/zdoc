// @vitest-environment node
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { fetchProducerProfile, parseFetchTree, pilotLockPath } from '../../adapters/updates/fetch-producer-profile'
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
