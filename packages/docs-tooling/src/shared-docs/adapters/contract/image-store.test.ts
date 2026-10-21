// @vitest-environment node
import { expect, it } from 'vitest'
import { FakeImageStore } from '../fake/image-store'
import { imageStoreContract } from './suites'

imageStoreContract('fake ImageStore', () => new FakeImageStore())
it('records uploaded digests and copies uploaded bytes', async () => {
  const store = new FakeImageStore()
  const bytes = new Uint8Array([1])
  await store.upload('fixture-digest', bytes)
  bytes[0] = 2
  expect(store.uploads).toEqual([{ sha256: 'fixture-digest', bytes: new Uint8Array([1]) }])
})
