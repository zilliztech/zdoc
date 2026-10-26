// @vitest-environment node
import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, it } from 'vitest'
import { loadErrorCases, expectErrorCase } from '../errors'
import { buildMilvusDocs } from '../../fixtures/milvus-docs/build'
import { FakeImageFetcher } from '../../adapters/images'
import { FakeLinkInputReader, prepareLinkInputs } from '../../adapters/links-input'
import { parseLinkMap, rewriteLinksAndImages } from '../../core/links'
import { context, input, sourceFile } from './helpers'

const cases = loadErrorCases(fileURLToPath(new URL('../../fixtures/links-errors/', import.meta.url)))
let fixture: Awaited<ReturnType<typeof buildMilvusDocs>>
beforeAll(async () => { fixture = await buildMilvusDocs('01-base') })
afterAll(async () => { if (fixture) await rm(fixture.dir, { recursive: true, force: true }) })
async function check(name: string) {
  await expectErrorCase(cases.find(item => item.name === name)!, async directory => {
    const data = JSON.parse(await readFile(join(directory, 'case.json'), 'utf8'))
    if (data.yaml) {
      const parsed = parseLinkMap(data.yaml, { ...context, file: 'shared-docs/guides/links.yaml' })
      return 'errors' in parsed ? parsed.errors : []
    }
    const commit = fixture.commits['01-base']
    const fetcher = new FakeImageFetcher(new Map(Object.entries(data.fetch ?? {}).map(([url, responses]) => [url,
      (responses as number[][]).map(bytes => new Uint8Array(bytes))])))
    const prepared = await prepareLinkInputs(data.markdown, sourceFile, commit, new FakeLinkInputReader({ [commit]: {} }), fetcher, context)
    return rewriteLinksAndImages(input(data.markdown, { ...prepared, sharedPages: new Map(data.sharedPages ?? []) })).errors ?? []
  })
}
it('[LINK_UNRESOLVED] points to the unresolved link', () => check('link-unresolved'))
it('[LINK_ROOT_PATH] points to a root path', () => check('link-root-path'))
it('[LINK_UNKNOWN_FORM] points to an unsupported form', () => check('link-unknown-form'))
it('[LINK_TARGET_ABSENT] points to a missing shared target', () => check('link-target-absent'))
it('[LINK_MAP_INVALID] points to the duplicate map entry', () => check('link-map-invalid'))
it('[ANCHOR_NOT_FOUND] rejects an anchor with different case', () => check('anchor-not-found'))
it('[IMAGE_FETCH_FAILED] points to an unavailable external image', () => check('image-fetch-failed'))
it('[IMAGE_NOT_IN_COMMIT] points to an absent committed image', () => check('image-not-in-commit'))
it('[IMAGE_CHANGED_DURING_READ] points to an unstable external image', () => check('image-changed-during-read'))
