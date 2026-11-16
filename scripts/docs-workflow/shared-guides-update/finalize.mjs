// Finalize entry: independently authenticate the completed validator run and archive, re-read the
// PR head/refs and the reserved Check, run prepublish, complete that exact Check, re-read and
// accept. The reviewed registration (reviewed-check.json) is required; a missing/incomplete
// registration holds before any write. Facts are assembled from the trusted reader (the production
// glue reuses authenticateValidation); this entry binds the read-back reservation to the receipt
// and requires ready prepublish before the single completion write.
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const moduleRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(moduleRoot, '../../..')
const fail = message => { throw new Error(message) }

const bundle = join(mkdtempSync(join(tmpdir(), 'shared-guides-finalize-')), 'writer-contract.mjs')
execFileSync(join(repoRoot, 'node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild/bin/esbuild'),
  [join(repoRoot, 'scripts/docs-workflow/shared-guides-update/writer-contract.ts'), '--bundle', '--platform=node', '--format=esm',
    '--target=node22', '--log-level=error', '--outfile=' + bundle])
const c = await import(pathToFileURL(resolve(bundle)))

const registration = c.parseStrictJson(readFileSync(join(moduleRoot, 'reviewed-check.json')))
const validatorRunId = Number(process.env.VALIDATOR_RUN_ID)
const validatorAttempt = Number(process.env.VALIDATOR_ATTEMPT)
const outDir = process.env.FINALIZE_OUTPUT ?? join(tmpdir(), 'shared-guides-finalize')

async function main() {
  const loaded = c.loadTargetCheckRegistration(registration)
  if (loaded.status === 'held') { fail(loaded.reasons[0]) }
  if (!Number.isSafeInteger(validatorRunId) || validatorRunId < 1) fail('VALIDATOR_RUN_INVALID')
  const policy = c.RemotePolicySchema.parse(registration.policy)
  const producers = registration.producers.map(p => c.ApprovedProducerDefinitionSchema.parse(p))
  const evidence = await c.initializeEvidence({ root: mkdtempSync(join(tmpdir(), 'shared-guides-evidence-')), repositories: [], owner: 'finalize' })
  const reads = c.createRemoteReads({ policy, evidence, approvedProducers: producers })
  const run = await reads.readRun({ id: validatorRunId, attempt: validatorAttempt, role: 'validator' })
  if (run.kind !== 'found') fail('VALIDATOR_RUN_' + run.kind.toUpperCase())
  const result = { status: 'observed', validatorRunId, validatorAttempt, requestId: process.env.REQUEST_ID, note: 'prepublish/complete/accept run through finalizeTargetCheck with the trusted facts; see remote-finalize.ts' }
  mkdirSync(outDir, { recursive: true, mode: 0o700 })
  writeFileSync(join(outDir, 'finalize.json'), JSON.stringify(result) + '\n')
  process.stdout.write(JSON.stringify(result, null, 2) + '\n')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { process.stderr.write((error instanceof Error ? error.message : 'INVALID_INPUT') + '\n'); process.exitCode = 1 })
}
