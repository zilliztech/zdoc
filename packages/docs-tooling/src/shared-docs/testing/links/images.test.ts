// @vitest-environment node
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { FakeImageFetcher, HttpImageFetcher } from '../../adapters/images'
import type { ImageFetcher } from '../../adapters/images'

const first = new Uint8Array([0x89, 0, 255, 10]), second = new Uint8Array([255, 1, 0, 128])
interface Fixture { fetcher: ImageFetcher; url: string; close(): Promise<void> }
function contract(name: string, create: () => Promise<Fixture>, live: boolean) {
  describe.skipIf(live && process.env.SHARED_DOCS_LINKS_L3 !== '1')(name, () => {
    let fixture: Fixture
    beforeAll(async () => { fixture = await create() })
    afterAll(async () => { await fixture?.close() })
    it('returns complete binary response bytes', async () => {
      expect(await fixture.fetcher.fetch(`${fixture.url}/image.png`)).toEqual(first)
    })
    it('returns independent byte arrays on repeated reads', async () => {
      const bytes = await fixture.fetcher.fetch(`${fixture.url}/image.png`)
      bytes[0] = 0
      expect(await fixture.fetcher.fetch(`${fixture.url}/image.png`)).toEqual(first)
    })
    it('rejects a missing or failed image', async () => {
      await expect(fixture.fetcher.fetch(`${fixture.url}/missing.png`)).rejects.toThrow()
    })
    it('exposes changed content on the second read', async () => {
      expect(await fixture.fetcher.fetch(`${fixture.url}/changing.png`)).toEqual(first)
      expect(await fixture.fetcher.fetch(`${fixture.url}/changing.png`)).toEqual(second)
    })
  })
}
contract('fake image fetcher contract', async () => ({ url: 'https://images.example.test', close: async () => {},
  fetcher: new FakeImageFetcher(new Map([
    ['https://images.example.test/image.png', first],
    ['https://images.example.test/changing.png', [first, second]],
  ] as [string, Uint8Array | Uint8Array[]][])) }), false)
contract('L3 HTTP image fetcher contract (loopback, no production services)', async () => {
  let reads = 0
  const server = createServer((request, response) => {
    if (request.url === '/missing.png') { response.writeHead(404).end(); return }
    response.writeHead(200, { 'Content-Type': 'image/png' })
    response.end(request.url === '/changing.png' && reads++ > 0 ? second : first)
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  return { url, fetcher: new HttpImageFetcher(), close: () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
}, true)
