// @vitest-environment node
import { createRequire } from 'node:module'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { expect, it, onTestFinished, vi } from 'vitest'
import { createTransformDemo } from './demo'
import { git } from '../build/demo'
const require = createRequire(import.meta.url)
const { prepareSharedSources, digest } = require('../../../lark/sharedPageFetch.js')
const { receiptDraft } = require('../../../../../../scripts/docs-workflow/guides-shared-sources.js')
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

it('includes a committed Cloud content file in the existing Fetch receipt inventory without changing Fetch', async () => {
  const root = await mkdtemp(join(tmpdir(), 'wp10-receipt-'))
  onTestFinished(() => rm(root, { recursive: true, force: true }))
  const options = await createTransformDemo(root)
  const repositoryRoot = dirname(dirname(options.sharedDocs))
  await git(repositoryRoot, 'init', '--quiet', '--initial-branch=master', '--template=')
  await git(repositoryRoot, 'add', 'shared-docs')
  await git(repositoryRoot, 'commit', '--quiet', '-m', 'Synthetic WP10 configuration')
  const records = [{ record_id: 'record', base_table_id: 'table', base_table_name: 'Examples', base_record_index: 0,
    fields: { Docs: { text: 'build-pipeline', link: 'https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/build-pipeline' },
      Slug: 'build-pipeline', Labels: 'Example', Targets: ['Zilliz.SaaS', 'Zilliz.PaaS'], Progress: 'Published', 'Placement Type': 'Canonical', 'Release Channel': 'CURRENT' } }]
  const prepared = prepareSharedSources({ records, repositoryRoot, baselineRoot: options.dev,
    masterCommit: await git(repositoryRoot, 'rev-parse', 'HEAD'), devCommit: options.devCommit })
  expect(prepared.data.errors).toEqual([])
  const receipt = receiptDraft({ page: 'build-pipeline', input: prepared.data.inputs.record, upstream: { current: [], next: [] },
    lock: { current: options.commit, next: options.commit }, outputs: [], images: [], channel: 'current', imageBaseUrl: 'https://images.example.test' })
  const path = 'shared-docs/guides/pages/build-pipeline/cloud-intro.md'
  expect(receipt.inputs.zdoc.files).toContainEqual({ path, sha256: digest(await readFile(join(repositoryRoot, path))) })
})
