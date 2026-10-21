// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { onTestFinished } from 'vitest'
import { buildMilvusDocs } from '../../fixtures/milvus-docs/build'
import { FakeMilvusDocsReader } from '../fake/milvus-docs-reader'
import { readerContract } from './suites'

readerContract('fake MilvusDocsReader', async () => {
  const { dir, commits } = await buildMilvusDocs('02-paragraph')
  onTestFinished(() => rm(dir, { recursive: true, force: true }))
  const path = 'site/en/userGuide/insert-and-delete/delete-entities.md'
  const [before, after] = [commits['01-base'], commits['02-paragraph']]
  const read = (commit: string) => execFileSync('git', ['-C', dir, 'show', `${commit}:${path}`], { encoding: 'utf8' })
  const [original, changed] = [read(before), read(after)]
  return { reader: new FakeMilvusDocsReader({ [before]: { [path]: original }, [after]: { [path]: changed } }),
    before, after, path, original, changed }
})
