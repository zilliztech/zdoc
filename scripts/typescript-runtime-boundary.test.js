'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const test = require('node:test')

const repositoryRoot = path.resolve(__dirname, '..')
const productionEntries = [
  'scripts/docs-workflow/group-paths.js',
  'scripts/translation/applySourceDelta.js',
  'scripts/translation/agentRunner.js',
  'scripts/docs-workflow/create-checkpoint-artifact.js',
  'scripts/docs-workflow/validate-checkpoint-artifact.js',
  'scripts/docs-workflow/apply-checkpoint-artifact.js',
  'scripts/docs-workflow/checkpoint-stage-paths.js',
]

for (const entry of productionEntries) {
  test(`${entry} loads without Node native TypeScript stripping`, () => {
    const result = spawnSync(process.execPath, [
      '--no-experimental-strip-types',
      '-e',
      'require(process.argv[1])',
      path.join(repositoryRoot, entry),
    ], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    })

    assert.equal(result.status, 0, result.stderr || result.stdout)
  })
}
