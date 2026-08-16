'use strict'

const assert = require('node:assert/strict')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {createCheckpointArtifact} = require('./create-checkpoint-artifact')
const {buildFetchPublicationSelection} = require('./fetch-publication-selection')
const {prepareFetchReconciliationPreflight} = require('./fetch-reconciliation-preflight')

const SHA_A = 'a'.repeat(40)

function git(repository, args) {
  return execFileSync('git', ['-C', repository, ...args], {encoding: 'utf8'}).trim()
}

function write(repository, relative, bytes) {
  const file = path.join(repository, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, bytes)
}

async function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-reconciliation-preflight-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const repository = path.join(root, 'repository')
  fs.mkdirSync(repository)
  git(repository, ['init', '-q'])
  git(repository, ['config', 'user.name', 'Fetch Reconciliation Preflight Test'])
  git(repository, ['config', 'user.email', 'fetch-preflight@example.com'])
  write(repository, 'config/translation/reconciliation-policy.json', fs.readFileSync(path.join(__dirname, '../../config/translation/reconciliation-policy.json')))
  for (let index = 0; index < 5; index += 1) write(repository, `content/en/guides/tutorials/doc-${index}.md`, `# Doc ${index}\n`)
  write(repository, 'content/en/guides/tutorials/home.md', '# Home\n')
  write(repository, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/doc-0.md', '# 翻訳\n')
  write(repository, '.translation-cache/ja-JP.json', '{"files":{}}\n')
  git(repository, ['add', '.'])
  git(repository, ['commit', '-qm', 'baseline'])
  const baseline = git(repository, ['rev-parse', 'HEAD'])

  const workspace = path.join(root, 'workspace')
  write(workspace, 'content/en/guides/tutorials/home.md', '# Home\n')
  for (let index = 1; index < 5; index += 1) write(workspace, `content/en/guides/tutorials/doc-${index}.md`, `# Doc ${index}\n`)
  const output = path.join(root, 'artifact')
  await createCheckpointArtifact({
    group: 'guides',
    masterSha: SHA_A,
    devBaselineSha: baseline,
    baselineDir: repository,
    workspace,
    output,
    validationCommands: ['node --version'],
    createdAt: '2026-08-15T00:00:00.000Z',
  })

  const checkpointRoot = path.join(root, 'checkpoints')
  const sourceCheckpointRoot = path.join(checkpointRoot, 'source-guides-en')
  fs.mkdirSync(sourceCheckpointRoot, {recursive: true})
  const archiveStaging = path.join(root, 'archive-staging')
  fs.cpSync(fs.realpathSync(output), path.join(archiveStaging, 'checkpoint-group'), {recursive: true})
  execFileSync('tar', ['-cf', path.join(sourceCheckpointRoot, 'checkpoint-group.tar'), '-C', archiveStaging, 'checkpoint-group'])
  return {root, repository, baseline, checkpointRoot}
}

test('preflight applies an immutable source checkpoint and approves Japanese deletion before publication', async t => {
  const {root, repository, baseline, checkpointRoot} = await fixture(t)
  const selection = buildFetchPublicationSelection({
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA_A,
    targetBranch: 'dev',
    initialTargetSha: baseline,
    sourceBaselineSha: baseline,
    selectedGroup: 'guides',
    publish: true,
    runTranslations: true,
  })
  const runnerTemp = path.join(root, 'runner')
  fs.mkdirSync(runnerTemp)
  const outputDir = path.join(root, 'plans')
  const summary = await prepareFetchReconciliationPreflight({
    selection,
    repository,
    runnerTemp,
    checkpointRoot,
    targetBaselineSha: baseline,
    outputDir,
  })

  assert.equal(summary.status, 'approved')
  assert.equal(summary.planCount, 1)
  assert.equal(summary.candidateCommits[0].sourceGroup, 'guides')
  assert.match(summary.candidateCommits[0].sourceCheckpointSha, /^[0-9a-f]{40}$/)
  const plan = JSON.parse(fs.readFileSync(path.join(outputDir, 'translation-reconciliation-plan-ja-JP-guides.json'), 'utf8'))
  assert.equal(plan.operations.length, 1)
  assert.equal(plan.operations[0].targetPath, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/doc-0.md')
})
