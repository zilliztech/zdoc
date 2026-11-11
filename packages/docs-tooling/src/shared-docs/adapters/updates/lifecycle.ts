import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { lstat, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import type { LifecycleEvidence } from '../../core/updates/lifecycle'
import { selectedObservation, type SelectedPage } from './selected-lifecycle'
import { retainedMetadata, type ReadonlyGitHub } from './github'
const require = createRequire(import.meta.url)
const { validateGuidesStageArtifact } = require('../../../../../../scripts/docs-workflow/guides-stage-artifact.js')
const { validateCandidateSnapshot } = require('../../../lark/sourceSnapshot.js')
const exec = promisify(execFile)
export const hash = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
export const rawSnapshotPath = 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json'
/** Inspect every member before extracting; Python stdlib, no archive-controlled program execution. */
const extract = `import sys,zipfile,tarfile,pathlib,stat,shutil
zpath,root=sys.argv[1:];root=pathlib.Path(root)
with zipfile.ZipFile(zpath) as z:
 items=z.infolist()
 if len(items)!=1 or items[0].filename!='guides-source.tar' or stat.S_ISLNK(items[0].external_attr>>16) or items[0].file_size>536870912: raise ValueError('Unsafe source ZIP')
 with z.open(items[0]) as a,open(root/'source.tar','xb') as b: shutil.copyfileobj(a,b)
with tarfile.open(root/'source.tar') as t:
 items=t.getmembers();seen=set();total=0
 if len(items)>20000: raise ValueError('Too many archive entries')
 for i in items:
  n=i.name.rstrip('/');parts=n.split('/')
  if not n or n.startswith('/') or any(p in ('','.','..') for p in parts) or any(c in n for c in ('\\\\','\\r','\\n')) or n in seen or not(i.isfile() or i.isdir()): raise ValueError('Unsafe source tar')
  if parts[0]!='guides-source': raise ValueError('Unexpected source tar root')
  seen.add(n);total+=i.size
  if total>536870912: raise ValueError('Oversized source tar')
 for i in items:
  dest=root/i.name
  if i.isdir(): dest.mkdir(parents=True,exist_ok=True)
  else:
   dest.parent.mkdir(parents=True,exist_ok=True)
   with t.extractfile(i) as a,open(dest,'xb') as b: shutil.copyfileobj(a,b)
print(len(items))
`
export async function extractSourceZip(bytes: Uint8Array, destination: string) {
  if (bytes.length > 256 * 1024 * 1024) throw new Error('Oversized source ZIP')
  const zip = join(destination, 'artifact.zip')
  await writeFile(zip, bytes, { flag: 'wx' })
  return Number((await exec('python3', ['-c', extract, zip, destination], { timeout: 60_000, maxBuffer: 1024 * 1024 })).stdout.trim())
}
export async function readLifecycle(api: ReadonlyGitHub, runId: number, directory: string, localZip?: string, expectedBase?: string, selected?: SelectedPage): Promise<LifecycleEvidence> {
  const facts = await retainedMetadata(api, runId)
  const { run, jobs, artifact } = facts
  if (artifact.size_in_bytes > 256 * 1024 * 1024) throw new Error('Source ZIP exceeds 256 MiB')
  if (localZip) {
    const stat = await lstat(localZip)
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 256 * 1024 * 1024) throw new Error('Evidence ZIP must be a bounded regular file')
  }
  const bytes = localZip ? await readFile(localZip) : await api.zip(artifact.id, artifact.size_in_bytes)
  if (`sha256:${hash(bytes)}` !== artifact.digest || bytes.length !== artifact.size_in_bytes) throw new Error('Source ZIP digest/size mismatch')
  const archiveEntries = await extractSourceZip(bytes, directory)
  const stage = join(directory, 'guides-source')
  const manifest = await validateGuidesStageArtifact(stage, { site: 'en', stage: 'source', masterSha: run.head_sha })
  const raw = await readFile(join(stage, 'payload', rawSnapshotPath), 'utf8')
  const snapshot = validateCandidateSnapshot(JSON.parse(raw), { manual: 'guides', buildEnv: 'uat', ...(expectedBase ? { baseAppToken: expectedBase } : {}) })
  const reasons = producerReasons({ run, jobs, artifact }, manifest, snapshot)
  if (!expectedBase) reasons.push('BASE_IDENTITY_UNPROVEN')
  const navigation = new Map(snapshot.navigation_records.map((r: any) => [r.record_id, r.table_id]))
  if (snapshot.records.some((r: any) => !r.table_id || !Object.hasOwn(snapshot.table_digests, r.table_id) || navigation.get(r.record_id) !== r.table_id)) reasons.push('TABLE_RECORD_BINDING_UNPROVEN')
  const evidence: LifecycleEvidence = { reasons, generatedAt: snapshot.generated_at, records: snapshot.records, identity: { runId, attempt: run.run_attempt,
    artifactId: artifact.id, zipSha256: hash(bytes), payloadSha256: hash(raw), masterSha: manifest.masterSha,
    devSha: manifest.devBaselineSha, archiveEntries, files: manifest.files.length, records: snapshot.records.length,
    sharedRecords: snapshot.records.filter((r: any) => r.source_kind === 'shared-page').length } }
  if (selected && !reasons.length) {
    const proof = await selectedObservation(api, facts, manifest, snapshot, join(stage, 'payload'), selected)
    if ('identity' in proof) {
      evidence.observedPage = selected.page
      evidence.generatedAt = proof.observedAt
      evidence.records = evidence.records.map(row => row.record_id === proof.recordId ? {...row, output_paths: proof.outputPaths} : row)
      Object.assign(evidence.identity, proof.identity, {snapshotGeneratedAt: snapshot.generated_at})
      return evidence
    }
    reasons.push(proof.reason)
    return evidence
  }
  reasons.push('RECORD_FRESHNESS_COMPLETENESS_UNPROVEN', 'LATEST_OBSERVATION_UNPROVEN')
  return evidence
}

/** Facts come from the GET response and validated stage, never a CLI authentication flag. */
export function producerReasons({ run, jobs, artifact }: Pick<Awaited<ReturnType<typeof retainedMetadata>>, 'run' | 'jobs' | 'artifact'>, manifest: { files: { path: string }[]; createdAt: string }, snapshot: { generated_at: string }) {
  const reasons: string[] = []
  if (run.path !== '.github/workflows/fetch-docs.yml' || run.head_branch !== 'master' || run.status !== 'completed' || run.conclusion !== 'success') reasons.push('PRODUCER_NOT_SUCCESSFUL')
  if (run.event !== 'schedule' || manifest.files.some((f: { path: string }) => /guides-requested-fetch/.test(f.path))) reasons.push('COLLECTION_MODE_UNPROVEN')
  const referenced = run.referenced_workflows?.filter((w: any) => w.path === `zilliztech/zdoc/.github/workflows/_fetch-guides-sources.yml@${run.head_sha}` && w.sha === run.head_sha)
  if (referenced?.length !== 1) reasons.push('SOURCE_WORKFLOW_UNPROVEN')
  const source = jobs.filter(j => j.name === 'produce_guides_sources / fetch')
  const job = source.length === 1 ? source[0] : undefined
  if (!job || job.run_id !== run.id || job.run_attempt !== run.run_attempt || job.head_sha !== run.head_sha || job.conclusion !== 'success' ||
    !['Fetch shared guides sources', 'Create shared source artifact'].every(name => job.steps?.filter((s: any) => s.name === name && s.conclusion === 'success').length === 1)) reasons.push('SOURCE_STAGE_UNPROVEN')
  const generated = Date.parse(snapshot.generated_at), created = Date.parse(manifest.createdAt), uploaded = Date.parse(artifact.created_at)
  if (!job || ![generated, created, uploaded, Date.parse(job.started_at), Date.parse(job.completed_at)].every(Number.isFinite) ||
    generated < Date.parse(job.started_at) || generated > created || created > uploaded || uploaded > Date.parse(job.completed_at)) reasons.push('SOURCE_TIME_BINDING_UNPROVEN')
  return reasons
}
