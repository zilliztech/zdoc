#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { loadTypeScript } = require('../lib/load-typescript')
const { resolveBootstrapSite } = require('../../packages/site-config/src/resolve.ts')
const { resolveManualPublication } = require('../../packages/docs-tooling/src/manuals/registry.ts')
const { assertSourceCompleteness } = require('../../packages/docs-tooling/src/lark/sourceCompleteness')

function normalizeRepositoryPath(value) {
  return path.posix.normalize(String(value).replace(/^\.\//, ''))
}

function validateGuidesRenderReadiness(options) {
  const site = resolveBootstrapSite(options.site)
  const workspace = path.resolve(options.workspace)
  const manual = options.manual || loadTypeScript(path.join(workspace, 'config/lark-docs.config.ts')).guides
  const expectedSource = options.expectedSource || resolveManualPublication('guides', site).source
  const actualIdentity = {
    root: manual?.root,
    base: manual?.base,
    sourceDir: normalizeRepositoryPath(manual?.docSourceDir),
  }
  const expectedIdentity = {
    root: expectedSource?.root,
    base: expectedSource?.base,
    sourceDir: normalizeRepositoryPath(expectedSource?.sourceDir),
  }
  if (JSON.stringify(actualIdentity) !== JSON.stringify(expectedIdentity)) {
    throw new Error(`Guides renderer source identity mismatch for ${site}: expected ${JSON.stringify(expectedIdentity)}, received ${JSON.stringify(actualIdentity)}`)
  }
  const snapshot = options.snapshot || JSON.parse(fs.readFileSync(options.snapshotPath, 'utf8'))
  return assertSourceCompleteness({
    manual: 'guides',
    buildEnv: 'uat',
    rootToken: expectedIdentity.root,
    sourceDir: path.join(workspace, expectedIdentity.sourceDir),
    snapshot,
  })
}

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined) throw new Error('Invalid Guides render readiness arguments')
    const key = flag.slice(2)
    if (!['workspace', 'site', 'snapshot'].includes(key) || Object.hasOwn(result, key)) throw new Error(`Invalid argument: ${flag}`)
    result[key] = value
  }
  for (const key of ['workspace', 'site', 'snapshot']) if (!result[key]) throw new Error(`Missing required argument: --${key}`)
  return result
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2))
    const result = validateGuidesRenderReadiness({ workspace: args.workspace, site: args.site, snapshotPath: args.snapshot })
    process.stdout.write(`${JSON.stringify({ site: args.site, canonicalSources: result.validCanonicalSources })}\n`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { validateGuidesRenderReadiness }
