import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isDeepStrictEqual as equal } from 'node:util'
import { GitLinkInputReader } from '../links-input'
import { gitRead, sha } from './git'
import { boundArtifact, object, type ReadonlyGitHub, type retainedMetadata } from './github'
import { parseRemoteZip } from './remote-github'
import { parseStrictJson } from '../../core/updates/canonical'

const require = createRequire(import.meta.url)
const { validatePublicationResults } = require('../../../../../../scripts/docs-workflow/publication-contracts.js')
const { validatePublishedReceipt } = require('../../../lark/sharedPagePublication.js')
const { validateCandidateSnapshot } = require('../../../lark/sourceSnapshot.js')
const apiRoot = 'repos/zilliztech/zdoc'
const publishedSnapshot = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
const sha256 = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
type Row = Record<string, any>
type Metadata = Awaited<ReturnType<typeof retainedMetadata>>
export type SelectedPage = { page: string; producerRepo: string; devRepo: string; dev: string }
const unknown = (reason: string) => ({ reason } as const)

// The producer at 47a7274cb runs a new scraper across all tables before shared
// routing. createSourceSnapshot consumes those Base rows even in incremental body
// mode. Bind that audit to its runtime, workflows and dependency configuration,
// so unrelated master commits do not change the meaning of the collection.
const producerRoots = ['.github', 'config', 'deploy', 'packages', 'scripts', 'patches',
  'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.pnpmfile.cjs', '.npmrc', 'tsconfig.json', 'apps/docs/package.json']
export function producerInventoryDigest(tree: string) {
  const entries = tree.split('\0').filter(entry => {
    if (!entry) return false
    const path = entry.slice(entry.indexOf('\t') + 1)
    // The Fetch CLI loads update commands only for explicit shared-docs update
    // invocations. Its own source-job preflight tests under scripts stay bound.
    return path !== 'packages/docs-tooling/src/shared-docs/README.md' &&
      !/^packages\/docs-tooling\/src\/shared-docs\/(?:testing\/|(?:adapters|core)\/updates\/|commands\/update[^/]*\.ts$)/.test(path) &&
      !/^packages\/docs-tooling\/src\/.*\.test\.ts$/.test(path) && !path.startsWith('scripts/testing/')
  })
  return sha256(entries.join('\0'))
}
const reviewedProducerDigest = '3890e0dde5e0e1f9c9fd8051d739c26014f70e2c2fd6716d297f01d87d5108e1'
function exactlyOne(rows: Row[], predicate: (row: Row) => boolean) {
  const matches = rows.filter(predicate)
  return matches.length === 1 ? matches[0] : undefined
}
function successfulJob(jobs: Row[], name: string, run: Row) {
  const job = exactlyOne(jobs, row => row.name === name)
  return job?.run_id === run.id && job.run_attempt === run.run_attempt && job.head_sha === run.head_sha &&
    job.status === 'completed' && job.conclusion === 'success' ? job : undefined
}
function stepWindow(job: Row | undefined, name: string) {
  const step = exactlyOne(job?.steps ?? [], s => s.name === name)
  if (!step || step.conclusion !== 'success') return undefined
  const start = Date.parse(step.started_at), end = Date.parse(step.completed_at)
  return Number.isFinite(start) && start <= end ? { start, end } : undefined
}
function during(time: string, window: ReturnType<typeof stepWindow>) {
  const instant = Date.parse(time)
  // Actions reports whole seconds, whereas stage metadata has milliseconds.
  return window !== undefined && instant >= window.start && instant < window.end + 1000
}

// New dispatches and reruns of older runs can supersede an observation. Check
// both Guides entry points across all branches, including incomplete attempts.
// Duplicated/truncated/changing pagination cannot prove the absence of a newer run.
export async function latestGuidesRun(api: ReadonlyGitHub, observed: Row, started: number) {
  // GitHub permits reruns for 30 days and a workflow can run for 35 days.
  // Cover both intervals plus five days before the collection, including older
  // initial runs whose later attempt could still have observed the Base.
  const earliest = new Date(started - 70 * 24 * 3600_000).toISOString().slice(0, 10)
  let matched = false
  for (const [file, workflow] of [['fetch-docs.yml', 83360731], ['fetch-guides-requested.yml', 355332213]] as const) {
    let total: number | undefined
    const ids = new Set<number>()
    for (let page = 1; page <= 10; page++) {
      const data = object(await api.get(`${apiRoot}/actions/workflows/${file}/runs?created=%3E%3D${earliest}&per_page=100&page=${page}`))
      if (!Number.isSafeInteger(data.total_count) || data.total_count < 0 || data.total_count >= 1000 ||
        (total !== undefined && total !== data.total_count) || !Array.isArray(data.workflow_runs) || data.workflow_runs.length > 100) return false
      total = data.total_count
      for (const row of data.workflow_runs) {
        if (!Number.isSafeInteger(row.id) || row.id < 1 || ids.has(row.id) || row.repository?.id !== 660446555 ||
          row.workflow_id !== workflow || !Number.isFinite(Date.parse(row.updated_at))) return false
        ids.add(row.id)
        if (row.id === observed.id) {
          if (matched || workflow !== observed.workflow_id || row.run_attempt !== observed.run_attempt ||
            row.head_sha !== observed.head_sha || row.status !== 'completed' || row.conclusion !== 'success') return false
          matched = true
        } else if (row.status !== 'completed' || Date.parse(row.updated_at) >= started) return false
      }
      if (ids.size === total) break
      if (data.workflow_runs.length < 100 || page === 10) return false
    }
  }
  return matched
}

export function observedRecord(bundle: Row, snapshot: Row, page: string) {
  const link = `https://github.com/zilliztech/zdoc/tree/master/shared-docs/guides/pages/${page}`
  const raw = exactlyOne(bundle.preparation.records, row => row.fields?.Docs?.link === link || row.fields?.Slug === page)
  const record = exactlyOne(snapshot.records, r => r.slug === page || r.shared_page?.page === page)
  if (!raw || !record || raw.fields['Placement Type'] !== 'canonical' || raw.fields.Docs?.link !== link ||
    raw.fields.Slug !== page || !['CURRENT', 'NEXT', 'RETIRE-IN-NEXT'].includes(raw.fields['Release Channel']) ||
    raw.fields['Release Channel'].toLowerCase() !== record.release_channel || !Array.isArray(raw.fields.Targets) ||
    !equal([...raw.fields.Targets].sort(), record.publish_targets) || record.doc_link !== link ||
    raw.record_id !== record.record_id || raw.base_table_id !== record.table_id ||
    record.source_kind !== 'shared-page' || record.placement_type !== 'canonical' || record.shared_page?.page !== page) return undefined
  const outcome = exactlyOne(bundle.outcomes, row => row.record_id === raw.record_id || row.page === page)
  if (!outcome || outcome.record_id !== raw.record_id || outcome.page !== page || outcome.status !== 'success' ||
    !equal(outcome.identity, record.shared_page)) return undefined
  return { record, outcome }
}

export async function selectedObservation(api: ReadonlyGitHub, facts: Metadata, manifest: Row, snapshot: Row, payload: string, selected: SelectedPage) {
  const { run } = facts
  if (!sha(run.head_sha) || run.head_repository?.id !== 660446555 || run.workflow_id !== 83360731 ||
    snapshot.base_app_token !== 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh') return unknown('BASE_SCAN_PRODUCER_UNPROVEN')
  const tree = await gitRead(selected.producerRepo, ['ls-tree', '-r', '-z', run.head_sha, '--', ...producerRoots])
  if (producerInventoryDigest(tree) !== reviewedProducerDigest) return unknown('BASE_SCAN_PRODUCER_UNPROVEN')
  return readReviewedObservation(api, facts, manifest, snapshot, payload, selected)
}

// Called only after the authenticated producer revision matches the reviewed
// acquisition code. Tests exercise the retained artifacts and real Git blobs here.
export async function readReviewedObservation(api: ReadonlyGitHub, facts: Metadata, manifest: Row, snapshot: Row, payload: string, selected: SelectedPage) {
  const { run, jobs, artifact } = facts
  const job = successfulJob(jobs, 'produce_guides_sources / fetch', run)
  const scan = stepWindow(job, 'Fetch shared guides sources')
  if (!scan || !during(snapshot.generated_at, scan) || !stepWindow(job, 'Generate selected shared Guides sources') ||
    !during(artifact.created_at, stepWindow(job, 'Run actions/upload-artifact@v6'))) return unknown('BASE_SCAN_ATTEMPT_UNPROVEN')

  // validateGuidesStageArtifact has authenticated the bundle, its contents,
  // the successful/fallback outcomes, and their bindings to this candidate.
  const bundlePath = 'tmp/docs-tooling/en/shared-pages/guides/bundle.json'
  if (!manifest.files.some((f: Row) => f.path === bundlePath)) return unknown('BASE_SCAN_RECORD_UNPROVEN')
  const bundleBytes = await readFile(join(payload, bundlePath))
  const observation = observedRecord(JSON.parse(bundleBytes.toString()), snapshot, selected.page)
  if (!observation) return unknown('BASE_SCAN_RECORD_UNPROVEN')
  const { record, outcome } = observation
  const publication = boundArtifact(facts.artifacts, run, `publication-results-fetch-${run.id}-${run.run_attempt}`)
  const publisher = successfulJob(jobs, 'publish_ready', run)
  const publishWindow = stepWindow(publisher, 'Publish ready Fetch units in producer completion FIFO order')
  if (publication.size_in_bytes > 1024 * 1024) return unknown('PUBLICATION_ARCHIVE_OVERSIZED')
  if (!during(publication.created_at, publishWindow)) return unknown('PUBLICATION_ATTEMPT_UNPROVEN')
  const archive = await api.zip(publication.id, publication.size_in_bytes)
  if (archive.length !== publication.size_in_bytes || `sha256:${sha256(archive)}` !== publication.digest) throw new Error('Publication ZIP digest/size mismatch')
  const files = parseRemoteZip(archive), member = files.get('publication-results.json')
  if (files.size !== 1 || !member) throw new Error('Unexpected publication ZIP members')
  const result = validatePublicationResults(parseStrictJson(member))
  const unit = exactlyOne(result.units, u => u.unitKey === 'source/guides-en')
  const assemble = successfulJob(jobs, 'produce_guides / assemble', run)
  if (result.runId !== run.id || result.runAttempt !== run.run_attempt || result.workflow !== 'fetch' ||
    result.repository !== 'zilliztech/zdoc' || result.mode !== 'publish' || result.targetBranch !== 'dev' ||
    result.initialTargetSha !== manifest.devBaselineSha || result.overallStatus !== 'success' || !during(result.completedAt, publishWindow) ||
    !assemble || unit?.producerJobId !== assemble.id || unit?.status !== 'published' ||
    !unit.commitShas.includes(unit.resultSha)) return unknown('GUIDES_PUBLICATION_UNPROVEN')

  const reader = new GitLinkInputReader(selected.devRepo)
  if (!await reader.isAncestor(manifest.devBaselineSha, unit.resultSha) || !await reader.isAncestor(unit.resultSha, selected.dev)) return unknown('PUBLICATION_ANCESTRY_UNPROVEN')
  const effectiveBytes = await reader.readBytes(unit.resultSha, publishedSnapshot)
  const effective = validateCandidateSnapshot(JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(effectiveBytes)), { manual: 'guides', buildEnv: 'uat', baseAppToken: snapshot.base_app_token })
  const published = exactlyOne(effective.records, row => row.record_id === record.record_id || row.slug === selected.page || row.shared_page?.page === selected.page)
  const outputPaths = outcome.outputs.map((o: Row) => o.path).sort()
  if (effective.generated_at !== snapshot.generated_at || !equal(published, { ...record, output_paths: outputPaths }) ||
    !equal(effectiveBytes, await reader.readBytes(selected.dev, publishedSnapshot))) return unknown('PUBLISHED_RECORD_MISMATCH')

  const receiptPath = record.shared_page.record
  const receiptBytes = await reader.readBytes(unit.resultSha, receiptPath)
  const receipt = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(receiptBytes))
  validatePublishedReceipt(receipt, published, {snapshot: effective})
  const outputs = outcome.outputs.map(({manual, path, sha256}: Row) => ({ manual, path, sha256 }))
  if (receipt.inputs.zdoc.commit !== run.head_sha || receipt.inputs.tools.zdoc !== run.head_sha ||
    receipt.inputs.dev.commit !== manifest.devBaselineSha) return unknown('PUBLICATION_RECEIPT_IDENTITY_MISMATCH')
  if (!equal(receipt.outputs, outputs) || !equal(receiptBytes, await reader.readBytes(selected.dev, receiptPath))) return unknown('PUBLISHED_OUTPUT_MISMATCH')
  for (const output of outputs) {
    for (const commit of new Set([unit.resultSha, selected.dev])) {
      if (sha256(await reader.readBytes(commit, output.path)) !== output.sha256) return unknown('PUBLISHED_OUTPUT_MISMATCH')
    }
  }
  if (!await latestGuidesRun(api, run, scan.start)) return unknown('LATEST_OBSERVATION_UNPROVEN')
  const tip = object(await api.get(`${apiRoot}/branches/dev`))
  if (tip.name !== 'dev' || tip.commit?.sha !== selected.dev) return unknown('DEV_TIP_CHANGED')
  return { outputPaths, recordId: record.record_id, observedAt: new Date(scan.start).toISOString(), identity: {
    observedPage: selected.page, observedRecordId: record.record_id, observedTableId: record.table_id, sourceJobId: job!.id, producerInventorySha256: reviewedProducerDigest,
    bundleSha256: sha256(bundleBytes), publicationArtifactId: publication.id, publicationZipSha256: sha256(archive),
    publicationResultSha: unit.resultSha, publicationSnapshotSha256: sha256(effectiveBytes), publicationReceiptSha256: sha256(receiptBytes),
    latestRunId: run.id, sampledDev: selected.dev, publishedOutputsSha256: sha256(JSON.stringify(outputs)),
  } }
}
