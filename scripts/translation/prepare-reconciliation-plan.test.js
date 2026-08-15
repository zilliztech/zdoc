'use strict'

const assert = require('node:assert/strict')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const {prepareReconciliationPlan} = require('./prepare-reconciliation-plan')

function git(root, args) { return execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim() }
function write(root, relative, bytes) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, bytes) }

function repositoryFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prepare-reconciliation-'))
  git(root, ['init', '-q'])
  git(root, ['config', 'user.name', 'Reconciliation Test'])
  git(root, ['config', 'user.email', 'reconciliation@example.com'])
  const policy = fs.readFileSync(path.join(__dirname, '../../config/translation/reconciliation-policy.json'))
  write(root, 'config/translation/reconciliation-policy.json', policy)
  for (let index = 0; index < 20; index += 1) write(root, `content/en/guides/tutorials/doc-${index}.md`, `# Doc ${index}\n`)
  write(root, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/doc-0.md', '# 翻訳\n')
  write(root, '.translation-cache/ja-JP.json', '{"files":{}}\n')
  git(root, ['add', '.'])
  git(root, ['commit', '-qm', 'baseline'])
  const baseline = git(root, ['rev-parse', 'HEAD'])
  fs.rmSync(path.join(root, 'content/en/guides/tutorials/doc-0.md'))
  git(root, ['add', '-u'])
  git(root, ['commit', '-qm', 'checkpoint'])
  return {root, baseline, checkpoint: git(root, ['rev-parse', 'HEAD'])}
}

test('prepares an approved canonical Japanese plan from immutable Git identities', () => {
  const fixture = repositoryFixture()
  try {
    const planOutput = path.join(fixture.root, 'tmp/plan.json')
    const evaluation = prepareReconciliationPlan({repository: fixture.root, target: 'ja-JP', group: 'guides', toolingSha: '1'.repeat(40), sourceBaselineSha: fixture.baseline, sourceCheckpointSha: fixture.checkpoint, targetBaselineSha: fixture.baseline, planOutput})
    assert.equal(evaluation.status, 'approved')
    assert.equal(evaluation.plan.operations.length, 1)
    assert.equal(evaluation.plan.operations[0].targetPath, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/doc-0.md')
    assert.deepEqual(JSON.parse(fs.readFileSync(planOutput, 'utf8')), evaluation.plan)
  } finally { fs.rmSync(fixture.root, {recursive: true, force: true}) }
})

test('writes deterministic review evidence and stops before execution when thresholds fail', () => {
  const fixture = repositoryFixture()
  try {
    for (let index = 1; index < 20; index += 1) fs.rmSync(path.join(fixture.root, `content/en/guides/tutorials/doc-${index}.md`))
    git(fixture.root, ['add', '-u'])
    git(fixture.root, ['commit', '-qm', 'mass deletion'])
    const planOutput = path.join(fixture.root, 'tmp/plan.json')
    const reviewOutput = path.join(fixture.root, 'tmp/review.json')
    assert.throws(() => prepareReconciliationPlan({repository: fixture.root, target: 'ja-JP', group: 'guides', toolingSha: '1'.repeat(40), sourceBaselineSha: fixture.baseline, sourceCheckpointSha: git(fixture.root, ['rev-parse', 'HEAD']), targetBaselineSha: fixture.baseline, planOutput, reviewOutput}), error => error.code === 'RECONCILIATION_REVIEW_REQUIRED')
    const review = JSON.parse(fs.readFileSync(reviewOutput, 'utf8'))
    assert.equal(review.document, 'translation-reconciliation-review')
    assert.equal(review.summary.thresholdExceeded, true)
  } finally { fs.rmSync(fixture.root, {recursive: true, force: true}) }
})
