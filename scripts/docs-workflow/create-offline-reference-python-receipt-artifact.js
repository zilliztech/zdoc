#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const {
  CANDIDATE_REF_PREFIX,
  canonicalJson,
  inspectOfflineReferenceCandidate,
  validateReceipt,
} = require('./offline-reference-python-publication')

const OUTPUT_NAME = 'offline-reference-python-receipt.json'
const SHA = /^[0-9a-f]{40}$/u

function parseArguments(argv) {
  const options = {}
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || value === undefined) throw new Error(`invalid argument: ${key || '<missing>'}`)
    const name = key.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase())
    if (Object.hasOwn(options, name)) throw new Error(`duplicate argument: ${key}`)
    options[name] = value
  }
  return options
}

function exactKeys(value, expected) {
  const actual = Object.keys(value).sort()
  if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) {
    throw new Error(`arguments must be exactly: ${expected.map(key => `--${key.replace(/[A-Z]/gu, letter => `-${letter.toLowerCase()}`)}`).join(', ')}`)
  }
}

function createReceiptArtifact(options, environment = process.env) {
  exactKeys(options, [
    'repositoryRoot', 'candidateRef', 'candidateSha', 'toolingSha', 'sourceCheckpointSha',
    'targetBaselineSha', 'receiptJsonEnv', 'outputFile',
  ])
  if (!options.candidateRef.startsWith(CANDIDATE_REF_PREFIX) ||
      !/^refs\/heads\/offline-reference-candidates\/python\/[A-Za-z0-9._/-]+$/u.test(options.candidateRef) ||
      options.candidateRef.includes('..') || options.candidateRef.endsWith('/')) {
    throw new Error('candidateRef is outside the fixed Python staging namespace')
  }
  for (const key of ['candidateSha', 'toolingSha', 'sourceCheckpointSha', 'targetBaselineSha']) {
    if (!SHA.test(options[key] || '')) throw new Error(`${key} must be an exact lowercase Git SHA`)
  }
  if (options.sourceCheckpointSha !== options.targetBaselineSha) {
    throw new Error('Python MVP requires sourceCheckpointSha to equal targetBaselineSha')
  }
  if (!/^[A-Z][A-Z0-9_]*$/u.test(options.receiptJsonEnv || '') || !Object.hasOwn(environment, options.receiptJsonEnv)) {
    throw new Error('receiptJsonEnv must name one present environment variable')
  }
  if (path.basename(options.outputFile) !== OUTPUT_NAME) throw new Error(`outputFile must end with ${OUTPUT_NAME}`)
  let receipt
  try {
    receipt = JSON.parse(environment[options.receiptJsonEnv])
  } catch (error) {
    throw new Error(`receipt JSON is invalid: ${error.message}`)
  }
  receipt = validateReceipt(receipt)
  const candidate = inspectOfflineReferenceCandidate({
    repositoryRoot: options.repositoryRoot,
    candidateSha: options.candidateSha,
    targetBaselineSha: options.targetBaselineSha,
    sourceCheckpointSha: options.sourceCheckpointSha,
    toolingSha: options.toolingSha,
    receipt,
  })
  const outputDirectory = path.dirname(path.resolve(options.outputFile))
  fs.mkdirSync(outputDirectory, {recursive: true, mode: 0o700})
  fs.writeFileSync(options.outputFile, `${canonicalJson(receipt)}\n`, {flag: 'wx', mode: 0o600})
  return Object.freeze({outputFile: path.resolve(options.outputFile), paths: candidate.paths})
}

if (require.main === module) {
  try {
    const result = createReceiptArtifact(parseArguments(process.argv.slice(2)))
    process.stdout.write(`${JSON.stringify(result)}\n`)
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

module.exports = {OUTPUT_NAME, createReceiptArtifact, parseArguments}
