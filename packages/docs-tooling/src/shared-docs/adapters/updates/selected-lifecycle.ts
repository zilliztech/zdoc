import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isDeepStrictEqual as equal } from 'node:util'
import { GitLinkInputReader } from '../links-input'
import { gitRead, sha } from './git'
import { exactlyOne, latestGuidesRun, stepWindow, successfulJob } from './guides-run-metadata'
export { latestGuidesRun } from './guides-run-metadata'
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

const policyPath = 'packages/docs-tooling/src/shared-docs/adapters/updates/reviewed-fetch-tree.json'
const reviewed = require('./reviewed-fetch-tree.json') as {
  strictProducerSha256: string
  legacyCensus: { producer: string; runId: number; attempt: number; artifactId: number; zipDigest: string;
    page: string; recordId: string; verifiedAt: string; tableCount: number; recordCount: number; membershipSha256: string }
}

// A tree OID changes along the entire path to the policy that records its own fingerprint.
// Normalize just those OIDs, after checking the policy blob against the trusted checkout.
// All other paths, types, modes and OIDs (including empty subtrees) enter the fingerprint.
export function producerInventoryDigest(tree: string, policyBytes: Uint8Array) {
  if (!tree.endsWith('\0') || tree.includes('\uFFFD')) throw new Error('Invalid producer tree listing')
  const policyOid = createHash('sha1').update(`blob ${policyBytes.length}\0`).update(policyBytes).digest('hex')
  const digest = createHash('sha256')
  let foundPolicy = false
  for (const entry of tree.slice(0, -1).split('\0')) {
    const separator = entry.indexOf('\t'), path = entry.slice(separator + 1)
    const header = entry.slice(0, separator)
    if (path === policyPath) {
      if (foundPolicy || header !== `100644 blob ${policyOid}`) throw new Error('Producer review policy differs')
      foundPolicy = true
      digest.update(`100644 blob <review-policy>\t${path}\0`)
    } else if (policyPath.startsWith(path + '/')) {
      if (!/^040000 tree [0-9a-f]{40}$/.test(header)) throw new Error('Invalid producer policy directory')
      digest.update(`040000 tree <policy-directory>\t${path}\0`)
    } else {
      digest.update(entry + '\0')
    }
  }
  if (!foundPolicy) throw new Error('Missing producer review policy')
  return digest.digest('hex')
}

export function recordMembership(rows: Row[]) {
  const tables = new Map<string, string[]>(), ids = new Set<string>()
  for (const {record_id: id, base_table_id: table} of rows) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9]+$/.test(id) || typeof table !== 'string' ||
      !/^[a-zA-Z0-9]+$/.test(table) || ids.has(id)) return undefined
    ids.add(id)
    const members = tables.get(table) ?? []
    members.push(id)
    tables.set(table, members)
  }
  const groups = [...tables.keys()].sort().map(table => {
    const members = tables.get(table)!
    return [table, members.length, sha256(members.sort().join('\n'))]
  })
  return {tableCount: tables.size, recordCount: ids.size, membershipSha256: sha256(JSON.stringify(groups))}
}
function during(time: string, window: ReturnType<typeof stepWindow>) {
  const instant = Date.parse(time)
  // Actions reports whole seconds, whereas stage metadata has milliseconds.
  return window !== undefined && instant >= window.start && instant < window.end + 1000
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
  const legacy = reviewed.legacyCensus
  const legacyProducer = run.head_sha === legacy.producer
  if (legacyProducer) {
    if (run.id !== legacy.runId || run.run_attempt !== legacy.attempt || facts.artifact.id !== legacy.artifactId ||
      facts.artifact.digest !== legacy.zipDigest || selected.page !== legacy.page) return unknown('BASE_SCAN_CENSUS_UNPROVEN')
  } else {
    const tree = await gitRead(selected.producerRepo, ['ls-tree', '-r', '-t', '-z', '--full-tree', run.head_sha])
    const bytes = await readFile(new URL('./reviewed-fetch-tree.json', import.meta.url))
    try {
      if (producerInventoryDigest(tree, bytes) !== reviewed.strictProducerSha256) return unknown('BASE_SCAN_PRODUCER_UNPROVEN')
    } catch { return unknown('BASE_SCAN_PRODUCER_UNPROVEN') }
  }
  const result = await readReviewedObservation(api, facts, manifest, snapshot, payload, selected)
  if (!('identity' in result)) return result
  if (legacyProducer && (result.recordId !== legacy.recordId || result.identity.membershipSha256 !== legacy.membershipSha256 ||
    result.identity.recordCount !== legacy.recordCount || result.identity.tableCount !== legacy.tableCount)) return unknown('BASE_SCAN_CENSUS_UNPROVEN')
  Object.assign(result.identity, legacyProducer ? {censusVerifiedAt: legacy.verifiedAt} :
    {producerInventorySha256: reviewed.strictProducerSha256})
  return result
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
  const bundle = JSON.parse(bundleBytes.toString())
  const membership = recordMembership(bundle.preparation.records)
  if (!membership) return unknown('BASE_SCAN_CENSUS_UNPROVEN')
  const observation = observedRecord(bundle, snapshot, selected.page)
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
    observedPage: selected.page, observedRecordId: record.record_id, observedTableId: record.table_id, sourceJobId: job!.id, ...membership,
    bundleSha256: sha256(bundleBytes), publicationArtifactId: publication.id, publicationZipSha256: sha256(archive),
    publicationResultSha: unit.resultSha, publicationSnapshotSha256: sha256(effectiveBytes), publicationReceiptSha256: sha256(receiptBytes),
    latestRunId: run.id, sampledDev: selected.dev, publishedOutputsSha256: sha256(JSON.stringify(outputs)),
  } }
}
