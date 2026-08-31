'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const repositoryRoot = path.resolve(__dirname, '../..')

function read(relative) {
  return fs.readFileSync(path.join(repositoryRoot, relative), 'utf8')
}

test('package scripts expose stable focused and aggregate replay harness entrypoints', () => {
  const scripts = JSON.parse(read('package.json')).scripts
  const expected = {
    'test:replay:contract': 'node --test scripts/docs-workflow/replay-harness-contract.test.js',
    'test:replay:fetch': 'node --test scripts/docs-workflow/replay-fetch-publication-fifo.test.js',
    'test:replay:recovery': 'node --test scripts/docs-workflow/replay-recovery-plan.test.js',
    'test:replay:translation': 'node --test scripts/docs-workflow/replay-translation-publication-fifo.test.js scripts/docs-workflow/replay-translation-monitor-artifacts.test.js',
    'test:workflow-matrix': 'node --test scripts/docs-workflow/select-tests-for-changes.test.js',
    'test:for-change': 'node scripts/docs-workflow/select-tests-for-changes.js',
    'test:replay': 'pnpm run test:replay:contract && pnpm run test:workflow-matrix && pnpm run test:replay:fetch && pnpm run test:replay:recovery',
    'test:replay:all': 'pnpm run test:replay && pnpm run test:replay:translation',
  }
  for (const [name, command] of Object.entries(expected)) assert.equal(scripts[name], command, name)
  for (const command of Object.values(expected)) {
    for (const match of command.matchAll(/scripts\/docs-workflow\/[A-Za-z0-9._-]+\.test\.js/gu)) {
      assert.equal(fs.existsSync(path.join(repositoryRoot, match[0])), true, match[0])
    }
  }
})

test('PR and scheduled CI use the stable replay harness entrypoints', () => {
  const pullRequestWorkflow = read('.github/workflows/site-validation.yml')
  const scheduledWorkflow = read('.github/workflows/replay-tests.yml')
  assert.match(pullRequestWorkflow, /- run: pnpm test:replay(?:\r?\n|$)/u)
  assert.match(scheduledWorkflow, /run: pnpm test:replay:translation(?:\r?\n|$)/u)
})

test('operator and agent prose name the replay harness selection contract', () => {
  const readme = read('README.md')
  const agents = read('AGENTS.md')
  assert.match(readme, /^### Replay harnesses$/mu)
  assert.match(readme, /pnpm test:replay:recovery/u)
  assert.match(readme, /replay-recovery-plan\.js/u)
  assert.match(readme, /pnpm test:for-change/u)
  assert.match(readme, /^### Branch ownership$/mu)
  assert.match(readme, /master-tooling-sync\.json/u)
  assert.match(agents, /^### Replay harness selection$/mu)
  assert.match(agents, /^### Master\/dev branch ownership$/mu)
  for (const command of ['pnpm test:replay:fetch', 'pnpm test:replay:recovery', 'pnpm test:replay:translation', 'pnpm test:replay:all']) {
    assert.equal(agents.includes(command), true, command)
  }
  assert.equal(agents.includes('pnpm test:for-change'), true)
  assert.equal(fs.existsSync(path.join(repositoryRoot, '.claude/specs/2026-08-31-docs-workflow-code-test-matrix.md')), true)
})
