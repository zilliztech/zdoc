// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it, vi } from 'vitest'
import { readPageSources } from '../adapters/read-page'
import { MilvusDocsReaderError } from '../adapters/reader-errors'
import { planLock } from '../core/lock'
import { expectErrorCase, loadErrorCases } from './errors'
import { createReaderFixture } from './reader-fixture'

const pilot = readFileSync(fileURLToPath(new URL('../fixtures/pilots/delete-entities/shared-docs/guides/page.yaml', import.meta.url)), 'utf8')
const context = { manuals: ['guides', 'guides-byoc'], betaValues: ['PUBLIC', 'BYOC'] }
const source = 'schema_version: 1\nrepository: https://github.com/milvus-io/milvus-docs\ntrack: v3.0.x\n'
const lock = (current: string, next = current) => `schema_version: 1\ncurrent: "${current}"\nnext: "${next}"\n`
const fixtures = loadErrorCases(fileURLToPath(new URL('../fixtures/read-errors/', import.meta.url)))
async function runFixture(name: string) {
  const fixture = fixtures.find(fixture => fixture.name === name)!
  const { reader, before, after, side } = await createReaderFixture('git')
  const values: Record<string, string> = { before, after, side }
  await expectErrorCase(fixture, async directory => {
    const input = (name: string, fallback: string) => existsSync(join(directory, name)) ? readFileSync(join(directory, name), 'utf8') : fallback
    const result = await readPageSources({ pageId: input('page-id.txt', 'delete-entities').trim(),
      pageYaml: input('page.yaml', pilot), sourceYaml: input('source.yaml', source), context,
      lockYaml: input('lock.yaml', lock(before, after)).replace(/\{\{(\w+)\}\}/g, (_, key) => values[key]),
    }, reader)
    if (!('errors' in result)) throw new Error('Expected the page to fail')
    return result.errors
  })
}

it('[CONFIG_PAGE_ID_INVALID] rejects invalid page IDs with page context', () => runFixture('page-id'))
it('[CONFIG_FIELD_MISSING] identifies missing fields at their containing mapping', () => runFixture('field-missing'))
it('[CONFIG_FIELD_UNKNOWN] identifies unsupported fields at their key', () => runFixture('field-unknown'))
it('[CONFIG_SYNTAX_INVALID] reports malformed YAML with its parser location', () => runFixture('syntax-invalid'))
it('[CONFIG_SOURCE_NOT_FOUND] reports absent committed sources separately for both channels', () => runFixture('source-not-found'))
it('[CONFIG_MANUAL_UNKNOWN] rejects manuals outside the injected registry', () => runFixture('manual-unknown'))
it('[CONFIG_BETA_INVALID] rejects BYOC even when present in the injected tag list', () => runFixture('beta-invalid'))
it('[LOCK_INVALID] rejects malformed lock values before reading Git', () => runFixture('lock-invalid'))
it('[LOCK_COMMIT_NOT_FOUND] rejects missing and off-branch commits from real Git history', async () => {
  await runFixture('lock-missing-commit')
  await runFixture('lock-off-branch')
})
it('[LOCK_ORDER] rejects a current commit newer than next', () => runFixture('lock-order'))
it('[LOCK_NONE_UNSUPPORTED] rejects the reserved Phase 1 none value', () => runFixture('lock-none'))
it('[LOCK_FORK_PR] refuses a new onboarding lock for a fork PR', async () => {
  const { after } = await createReaderFixture('git')
  const [fixture] = loadErrorCases(fileURLToPath(new URL('../fixtures/lock-planning-errors/', import.meta.url)))
  await expectErrorCase(fixture, directory => {
    const input = JSON.parse(readFileSync(join(directory, 'plan.json'), 'utf8'))
    const result = planLock({ ...input, trackedHead: after }, { file: 'shared-docs/guides/pages/delete-entities/lock.yaml', page: 'delete-entities' })
    if (!('errors' in result)) throw new Error('Expected planning to fail')
    return result.errors
  })
})

it('reads both locked versions and accepts an equal current/next lock', async () => {
  const { reader, before, after, original, changed } = await createReaderFixture('git')
  const input = { pageId: 'delete-entities', pageYaml: pilot, sourceYaml: source, lockYaml: lock(before, after), context }
  expect(await readPageSources(input, reader)).toMatchObject({ markdown: { current: original, next: changed } })
  expect(await readPageSources({ ...input, lockYaml: lock(before) }, reader))
    .toMatchObject({ markdown: { current: original, next: original } })
})

it('collects source, page and lock syntax errors before any Git calls', async () => {
  const { reader } = await createReaderFixture('fake')
  const spy = vi.spyOn(reader, 'isOnBranch')
  const result = await readPageSources({ pageId: 'delete-entities', context, sourceYaml: 'schema_version: [\n',
    pageYaml: pilot + 'unknown: true\nmetadata: {beta: BYOC}\n' }, reader)
  expect(result).toMatchObject({ errors: [
    { code: 'CONFIG_SYNTAX_INVALID', file: 'shared-docs/guides/source.yaml', line: 2 },
    { code: 'CONFIG_FIELD_UNKNOWN' }, { code: 'CONFIG_BETA_INVALID' }, { code: 'LOCK_INVALID' },
  ] })
  expect(spy).not.toHaveBeenCalled()
})

it('aggregates failures across channels without inventing an ancestry error for missing commits', async () => {
  const { reader, side } = await createReaderFixture('git')
  expect(await readPageSources({ pageId: 'delete-entities', context, pageYaml: pilot, sourceYaml: source,
    lockYaml: lock('0'.repeat(40), side) }, reader)).toMatchObject({ errors: [
      { code: 'LOCK_COMMIT_NOT_FOUND', channel: 'current', line: 2 },
      { code: 'LOCK_COMMIT_NOT_FOUND', channel: 'next', line: 3 },
    ] })
})

it('reports a next-only missing source without returning partial Markdown', async () => {
  const { reader, before, after } = await createReaderFixture('fake')
  const read = reader.readFile.bind(reader)
  vi.spyOn(reader, 'readFile').mockImplementation((commit, path) => {
    if (commit === after) return Promise.reject(new MilvusDocsReaderError('MISSING_FILE', 'Removed upstream'))
    return read(commit, path)
  })
  const result = await readPageSources({ pageId: 'delete-entities', context, pageYaml: pilot, sourceYaml: source, lockYaml: lock(before, after) }, reader)
  expect(result).toMatchObject({ errors: [{ code: 'CONFIG_SOURCE_NOT_FOUND', channel: 'next' }] })
  expect('markdown' in result).toBe(false)
})

it('propagates unavailable branches and infrastructure failures rather than misclassifying page data', async () => {
  const { reader, before } = await createReaderFixture('git')
  await expect(readPageSources({ pageId: 'delete-entities', context, pageYaml: pilot,
    sourceYaml: source.replace('v3.0.x', 'missing-branch'), lockYaml: lock(before) }, reader))
    .rejects.toMatchObject({ code: 'MISSING_BRANCH' })
  const failure = new MilvusDocsReaderError('GIT_ERROR', 'Git process failed')
  vi.spyOn(reader, 'readFile').mockRejectedValue(failure)
  await expect(readPageSources({ pageId: 'delete-entities', context, pageYaml: pilot, sourceYaml: source, lockYaml: lock(before) }, reader))
    .rejects.toBe(failure)
})
