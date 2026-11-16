// Validate entry: authenticate the producer archive, freshness and seal, reserve the target Check
// on the signed commit, and report the reservation. Read-biased; only the reserve uses checks:write.
// The registration is loaded from reviewed-check.json (held when missing) and observed refs are
// read independently through createRemoteReads. The formal receipt encoding is the activation glue
// that runs formalValidation's receipt op over the authenticated plan/report/output.
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const moduleRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(moduleRoot, '../../..')
const fail = message => { throw new Error(message) }

const bundle = join(mkdtempSync(join(tmpdir(), 'shared-guides-validate-')), 'writer-contract.mjs')
execFileSync(join(repoRoot, 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'),
  [join(repoRoot, 'scripts/docs-workflow/shared-guides-update/writer-contract.ts'), '--bundle', '--platform=node', '--format=esm',
    '--target=node22', '--log-level=error', '--outfile=' + bundle])
const c = await import(pathToFileURL(resolve(bundle)))

const registration = c.parseStrictJson(readFileSync(join(moduleRoot, 'reviewed-check.json')))
const producerRunId = Number(process.env.PRODUCER_RUN_ID)
const producerAttempt = Number(process.env.PRODUCER_ATTEMPT)
const outDir = process.env.VALIDATE_OUTPUT ?? join(tmpdir(), 'shared-guides-validate')

async function main() {
  if (!Number.isSafeInteger(producerRunId) || producerRunId < 1) fail('PRODUCER_RUN_INVALID')
  const policy = c.RemotePolicySchema.parse(registration.policy)
  const producers = registration.producers.map(p => c.ApprovedProducerDefinitionSchema.parse(p))
  const evidence = await c.initializeEvidence({ root: mkdtempSync(join(tmpdir(), 'shared-guides-evidence-')), repositories: [], owner: 'validate' })
  const reads = c.createRemoteReads({ policy, evidence, approvedProducers: producers })
  const run = await reads.readRun({ id: producerRunId, attempt: producerAttempt, role: 'producer' })
  if (run.kind !== 'found') fail('PRODUCER_RUN_' + run.kind.toUpperCase())
  const artifact = await reads.readArtifact({ runId: producerRunId, attempt: producerAttempt, name: policy.producerArtifactName })
  if (artifact.kind !== 'found') fail('ARTIFACT_' + artifact.kind.toUpperCase())
  const writer = c.createCheckWriter({ repositoryFullName: policy.repositoryFullName, checkAppId: policy.checkAppId, checkName: policy.checkName })
  const reservation = await writer.reserve({ headSha: artifact.value.toolingHead })
  mkdirSync(outDir, { recursive: true, mode: 0o700 })
  const result = { status: 'prepared', reservation: { id: reservation.id, suiteId: reservation.suiteId, appId: reservation.appId, name: reservation.name, head: reservation.head }, producerRunId, producerAttempt, toolingHead: artifact.value.toolingHead }
  writeFileSync(join(outDir, 'validate.json'), JSON.stringify(result) + '\n')
  process.stdout.write(JSON.stringify(result, null, 2) + '\n')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { process.stderr.write((error instanceof Error ? error.message : 'INVALID_INPUT') + '\n'); process.exitCode = 1 })
}
