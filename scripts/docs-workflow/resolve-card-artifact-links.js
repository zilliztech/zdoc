#!/usr/bin/env node
'use strict'

const fs = require('node:fs')

function validateRepository(repository) {
  if (typeof repository !== 'string' || !/^[^/\s]+\/[^/\s]+$/.test(repository)) throw new Error('repository must be owner/repository')
  return repository
}

function validateRunId(runId) {
  if (!Number.isSafeInteger(runId) || runId <= 0) throw new Error('runId must be a positive integer')
  return runId
}

function resolveArtifact(artifacts, expectedName, {repository, runId}) {
  const matches = artifacts.filter(artifact => artifact?.name === expectedName)
  if (matches.length > 1) throw new Error(`duplicate report artifact: ${expectedName}`)
  if (matches.length === 0) return null
  const artifact = matches[0]
  if (artifact.expired !== false) throw new Error(`report artifact is expired: ${expectedName}`)
  if (!Number.isSafeInteger(artifact.id) || artifact.id <= 0) throw new Error(`artifact id is invalid: ${expectedName}`)
  return `https://github.com/${repository}/actions/runs/${runId}/artifacts/${artifact.id}`
}

function resolveArtifactLinks({repository, runId, artifacts}) {
  validateRepository(repository)
  validateRunId(runId)
  if (!Array.isArray(artifacts)) throw new Error('artifacts must be an array')
  return {
    en: resolveArtifact(artifacts, `docs-checkpoint-guides-en-${runId}-reports`, {repository, runId}),
    'zh-CN': resolveArtifact(artifacts, `docs-checkpoint-guides-zh-CN-${runId}-reports`, {repository, runId}),
  }
}

function parseArgs(args) {
  const values = new Map()
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!['--repository', '--run-id', '--artifacts-json'].includes(key) || !value || values.has(key)) throw new Error('Usage: resolve-card-artifact-links.js --repository <owner/repo> --run-id <id> --artifacts-json <file>')
    values.set(key, value)
  }
  if (values.size !== 3) throw new Error('Usage: resolve-card-artifact-links.js --repository <owner/repo> --run-id <id> --artifacts-json <file>')
  return values
}

function main(args = process.argv.slice(2), env = process.env) {
  const values = parseArgs(args)
  const links = resolveArtifactLinks({
    repository: values.get('--repository'),
    runId: Number(values.get('--run-id')),
    artifacts: JSON.parse(fs.readFileSync(values.get('--artifacts-json'), 'utf8')),
  })
  if (!env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required')
  fs.appendFileSync(env.GITHUB_OUTPUT, `en_url=${links.en || ''}\nzh_cn_url=${links['zh-CN'] || ''}\n`)
  return links
}

if (require.main === module) {
  try { main() } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1 }
}

module.exports = {main, resolveArtifactLinks}
