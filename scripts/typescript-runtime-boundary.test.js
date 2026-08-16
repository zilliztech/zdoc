'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const repositoryRoot = path.resolve(__dirname, '..')
const productionEntries = [
  'scripts/doc-publish-bot/manualConfig.js',
  'scripts/docs-workflow/group-paths.js',
  'scripts/docs-workflow/guides-render-readiness.js',
  'scripts/translation/applySourceDelta.js',
  'scripts/translation/apply-reconciliation-plan.js',
  'scripts/translation/prepare-reconciliation-plan.js',
  'scripts/translation/reconciliation-discovery.js',
  'scripts/translation/reconciliation-plan.js',
  'scripts/translation/reconciliation-policy.js',
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

test('docs-tooling CLI launcher works without Node native TypeScript stripping', () => {
  const result = spawnSync(process.execPath, [
    '--no-experimental-strip-types',
    path.join(repositoryRoot, 'scripts/docs-tooling.js'),
    'definitely-not-a-command',
  ], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })

  assert.equal(result.status, 1, result.stderr || result.stdout)
  assert.match(result.stderr, /Unknown command: definitely-not-a-command/u)
  assert.doesNotMatch(result.stderr, /ERR_UNKNOWN_FILE_EXTENSION|SyntaxError|Unexpected token/u)
})

test('publication read-fence launcher loads and reports usage without Node native TypeScript stripping', () => {
  const result = spawnSync(process.execPath, [
    '--no-experimental-strip-types',
    path.join(repositoryRoot, 'scripts/build/run-with-publication-read-fence.mjs'),
  ], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })

  assert.equal(result.status, 1, result.stderr || result.stdout)
  assert.match(result.stderr, /Usage: run-with-publication-read-fence\.mjs/u)
  assert.doesNotMatch(result.stderr, /ERR_UNKNOWN_FILE_EXTENSION|SyntaxError|Unexpected token/u)
})

test('root docs-tooling package script uses the shared launcher', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8'))

  assert.equal(packageJson.scripts['docs-tooling'], 'node scripts/docs-tooling.js')
})
