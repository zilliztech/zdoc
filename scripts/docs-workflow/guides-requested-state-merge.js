#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {
  RequestedFetchError,
  validateRequestedPlanForArtifact,
  verifyRequestedStateMergeReceipt,
} = require('../../packages/docs-tooling/src/lark/requestedGuidesFetchPlanner')
const { validateSourceCompleteness } = require('../../packages/docs-tooling/src/lark/sourceCompleteness')
const { readSnapshot } = require('../../packages/docs-tooling/src/lark/sourceSnapshot')

const ALLOWED_FLAGS = new Set(['--operation', '--receipt', '--plan', '--candidate', '--baseline', '--root-token', '--source-dir', '--site', '--output'])

function parseArgs(argv) {
  const args = {}
  let index = 0
  if (argv[0] && !argv[0].startsWith('--')) {
    args['--operation'] = argv[0]
    index = 1
  }
  for (; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!ALLOWED_FLAGS.has(flag) || value === undefined || value === '') throw new Error(`Invalid argument: ${flag || '(missing)'}`)
    if (Object.hasOwn(args, flag)) throw new Error(`Duplicate argument: ${flag}`)
    args[flag] = value
  }
  return args
}

function readJsonFile(file, label) {
  const resolved = path.resolve(file)
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) throw new Error(`${label} is not a readable file: ${file}`)
  return JSON.parse(fs.readFileSync(resolved, 'utf8'))
}

function verifyRequestedStateMerge({ receiptPath, planPath, candidatePath, baselinePath, sourceDir, rootToken, site }) {
  const receipt = readJsonFile(receiptPath, 'Requested state-merge receipt')
  const plan = readJsonFile(planPath, 'Requested plan')
  const candidate = readJsonFile(candidatePath, 'Merged candidate snapshot')
  const baseline = baselinePath ? readSnapshot(path.resolve(baselinePath)) : null

  validateRequestedPlanForArtifact(plan, { site: site || plan.site || null, baselineSnapshot: baseline })
  verifyRequestedStateMergeReceipt({ receipt, plan, candidateSnapshot: candidate, baselineSnapshot: baseline })

  if (sourceDir && rootToken) {
    const completeness = validateSourceCompleteness({
      manual: 'guides',
      buildEnv: receipt.build_env,
      rootToken,
      sourceDir: path.resolve(sourceDir),
      snapshot: candidate,
    })
    if (!completeness.complete) {
      throw new RequestedFetchError('TABLE_SOURCE_INCOMPLETE', 'Merged candidate source graph failed the completeness re-check.', {
        valid: completeness.validCanonicalSources,
        expected: completeness.expectedCanonicalSources,
      })
    }
  }
  return { receipt, plan, candidate }
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const operation = args['--operation']
  if (operation !== 'verify') throw new Error('Usage: guides-requested-state-merge.js verify --receipt <file> --plan <file> --candidate <file> [--baseline <file>] [--source-dir <dir> --root-token <token>] [--site <en|zh-CN>] [--output <file>]')
  for (const required of ['--receipt', '--plan', '--candidate']) {
    if (!args[required]) throw new Error(`Missing required argument: ${required}`)
  }
  const result = verifyRequestedStateMerge({
    receiptPath: args['--receipt'],
    planPath: args['--plan'],
    candidatePath: args['--candidate'],
    baselinePath: args['--baseline'] || null,
    sourceDir: args['--source-dir'] || null,
    rootToken: args['--root-token'] || null,
    site: args['--site'] || null,
  })
  const verdict = {
    schema_version: 1,
    verified: true,
    plan_sha256: result.plan.plan_sha256,
    receipt_sha256: result.receipt.receipt_sha256,
    candidate_records: result.candidate.records.length,
    state_promotion: result.receipt.state_promotion,
  }
  if (args['--output']) {
    fs.mkdirSync(path.dirname(path.resolve(args['--output'])), { recursive: true })
    fs.writeFileSync(args['--output'], `${JSON.stringify(verdict, null, 2)}\n`)
  }
  process.stdout.write(`${JSON.stringify(verdict)}\n`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    if (error instanceof RequestedFetchError) {
      console.error(`[requested-state-merge] ${error.code}: ${error.message}`)
    } else {
      console.error(`[requested-state-merge] ${error.message}`)
    }
    process.exitCode = 1
  }
}

module.exports = { verifyRequestedStateMerge }
