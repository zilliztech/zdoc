'use strict'

const assert = require('node:assert/strict')
const {spawnSync} = require('node:child_process')
const fs = require('node:fs')
const yaml = require('js-yaml')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {createBatchSummary} = require('./batches')
const {buildManifest} = require('./manifest')
const {materializeTranslationBaseline} = require('./materialize-translation-baseline')

function write(root, relative, contents) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, contents)
}

function runTranslationResultStep(overrides = {}) {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8'))
  let script = workflow.jobs.translate.steps.find(step => step.name === 'Emit translation result').run
  const values = {
    "${{ inputs.should_translate }}": 'true',
    "${{ steps.manifest.outputs.count || '0' }}": '30',
    "${{ steps.agents.outputs.translated_count || '0' }}": '23',
    "${{ steps.agents.outputs.failed_count || '0' }}": '7',
    "${{ steps.agents.outputs.remaining_count || '0' }}": '0',
    "${{ steps.agents.outcome }}": 'success',
    "${{ steps.translation_upload.outcome }}": 'success',
    "${{ steps.baseline_upload.outcome }}": 'success',
    "${{ github.run_id }}": '12345',
    ...overrides,
  }
  for (const [expression, value] of Object.entries(values)) script = script.replaceAll(expression, value)
  assert.doesNotMatch(script, /\$\{\{/)
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-result-step-'))
  const output = path.join(root, 'github-output')
  try {
    const result = spawnSync('bash', ['-c', script], {
      encoding: 'utf8',
      env: {...process.env, GITHUB_OUTPUT: output, TRANSLATION_TARGET: 'ja-JP', GROUP: 'guides', ARTIFACT_SUFFIX: ''},
    })
    assert.equal(result.status, 0, result.stderr)
    return Object.fromEntries(fs.readFileSync(output, 'utf8').trim().split('\n').map(line => line.split(/=(.*)/s, 2)))
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
  }
}

test('reusable translation workflow produces and uploads a group-scoped report', () => {
  const workflow = fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8')
  assert.match(workflow, /args=\(--manifest tmp\/translation-manifest\.json --report tmp\/translation-report\.json\)/)
  assert.match(workflow, /node scripts\/translation\/agentRunner\.js "\$\{args\[@\]\}"/)
  assert.match(workflow, /reportSummary\.js/)
  assert.match(workflow, /name: Upload translation report/)
  assert.match(workflow, /if: \$\{\{ always\(\) \}\}/)
  assert.match(workflow, /translation-report-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /TRANSLATION_ALLOW_PARTIAL: "true"/)
  assert.match(workflow, /timeout-minutes: 360/)
  assert.match(workflow, /id: agents/)
  assert.match(workflow, /steps\.agents\.outputs\.translated_count/)
  for (const input of ['batch_index', 'batch_number', 'batch_count', 'batch_size', 'pending_count', 'pending_set_sha256']) {
    assert.match(workflow, new RegExp(`^      ${input}:`, 'm'))
  }
  assert.match(workflow, /ARTIFACT_SUFFIX/)
  assert.match(workflow, /--expected-pending-set-sha256/)
})

test('translation readiness accepts complete terminal failures but remains conservative for incomplete and bootstrap work', () => {
  const workflow = fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8')
  assert.match(workflow, /translated_count \+ failed_count == candidate_count/)
  assert.match(workflow, /remaining_count[^\n]*== 0/)
  assert.doesNotMatch(workflow, /\bfailed_count\s*==\s*0[^\n]*status=translation_ready/)
  assert.match(workflow, /Mark completed translation bootstrap[\s\S]*failed_count \|\| '0'\) == '0'/)
  assert.match(workflow, /Regenerate selected Chinese Reference sidebar[\s\S]*failed_count \|\| '0'\) == '0'/)

  assert.equal(runTranslationResultStep().status, 'translation_ready')
  assert.equal(runTranslationResultStep({
    "${{ steps.manifest.outputs.count || '0' }}": '7',
    "${{ steps.agents.outputs.translated_count || '0' }}": '0',
    "${{ steps.agents.outputs.failed_count || '0' }}": '7',
  }).status, 'translation_ready')
  assert.equal(runTranslationResultStep({
    "${{ steps.manifest.outputs.count || '0' }}": '251',
    "${{ steps.agents.outputs.translated_count || '0' }}": '243',
    "${{ steps.agents.outputs.failed_count || '0' }}": '0',
    "${{ steps.agents.outputs.remaining_count || '0' }}": '8',
  }).status, 'failed')
  assert.equal(runTranslationResultStep({"${{ steps.agents.outputs.failed_count || '0' }}": '6'}).status, 'failed')
  assert.equal(runTranslationResultStep({"${{ steps.agents.outcome }}": 'failure'}).status, 'failed')
  assert.equal(runTranslationResultStep({"${{ steps.translation_upload.outcome }}": 'failure'}).status, 'failed')
})

test('batch publisher validates and publishes a reconstructable durable checkpoint', () => {
  const wrapper = fs.readFileSync('.github/workflows/_translate-publish-batch.yml', 'utf8')
  const publishJob = wrapper.slice(wrapper.indexOf('\n  publish:'))
  assert.match(publishJob, /needs: translate/)
  assert.doesNotMatch(publishJob, /\n    if:/)
  assert.match(publishJob, /runs-on: ubuntu-latest/)
  assert.match(publishJob, /permissions:[\s\S]*contents: write/)
  assert.doesNotMatch(publishJob, /uses: \.\/\.github\/workflows\/_publish-content-group\.yml/)
  assert.match(publishJob, /actions\/download-artifact@v7[\s\S]*translation-checkpoint-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}-batch-\$\{\{ inputs\.batch_number \}\}/)
  assert.match(publishJob, /validate-checkpoint-artifact\.js[\s\S]*checkpoint translation batch identity mismatch/)
  assert.match(publishJob, /publish-checkpoint\.sh[\s\S]*--max-attempts 10[\s\S]*\$GITHUB_WORKSPACE\/scripts\/validate-generated-sidebars\.js[\s\S]*\$GITHUB_WORKSPACE\/scripts\/validate-translated-coverage\.js/)
  assert.match(publishJob, /status=\$\(sed[\s\S]*published \|\| "\$status" == no_changes/)
})

test('batch preparation reports translation candidate reason counts', () => {
  const prepare = fs.readFileSync('.github/workflows/_prepare-translation-batches.yml', 'utf8')
  assert.match(prepare, /^      candidate_counts: \{ value: '\$\{\{ jobs\.prepare\.outputs\.candidate_counts \}\}' \}$/m)
  assert.match(prepare, /^      candidate_counts: \$\{\{ steps\.summary\.outputs\.candidate_counts \}\}$/m)
  assert.match(prepare, /candidate_counts: JSON\.stringify\(summary\.candidateCounts\)/)
  assert.match(prepare, /^          console\.log\(`translation candidates: total=\$\{summary\.candidateCounts\.total\} current_delta=\$\{summary\.candidateCounts\.current_delta\} missing_target=\$\{summary\.candidateCounts\.missing_target\} stale_source=\$\{summary\.candidateCounts\.stale_source\}`\)$/m)
})

test('Guides preparation and workers derive the same pending set from the target baseline', t => {
  const prepareWorkflow = fs.readFileSync('.github/workflows/_prepare-translation-batches.yml', 'utf8')
  const workerWorkflow = fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8')
  assert.match(prepareWorkflow, /^      target_baseline_sha: \{ required: false, type: string, default: '' \}$/m)
  assert.match(prepareWorkflow, /^      TARGET_BASELINE_SHA: \$\{\{ inputs\.target_baseline_sha \|\| inputs\.source_checkpoint_sha \}\}$/m)
  assert.match(prepareWorkflow, /materialize-translation-baseline\.js[\s\S]*--target "\$TRANSLATION_TARGET"[\s\S]*--group "\$GROUP"/)
  assert.match(workerWorkflow, /materialize-translation-baseline\.js[\s\S]*--target "\$TRANSLATION_TARGET"[\s\S]*--group "\$GROUP"/)

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-guides-target-baseline-'))
  const baseline = path.join(root, 'baseline')
  const preparation = path.join(root, 'preparation')
  const worker = path.join(root, 'worker')
  fs.mkdirSync(baseline)
  fs.mkdirSync(preparation)
  fs.mkdirSync(worker)
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const sourcePath = 'content/en/guides/tutorials/completed.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/completed.md'
  const source = '# Completed guide\n'
  const sourceHash = require('node:crypto').createHash('sha256').update(source).digest('hex')
  for (const workspace of [preparation, worker]) write(workspace, sourcePath, source)
  write(baseline, targetPath, '# 完了したガイド\n')
  write(baseline, '.translation-cache/ja-JP.json', `${JSON.stringify({files: {
    [sourcePath]: {sourceHash, targetPath},
  }})}\n`)

  const summaries = [preparation, worker].map(workspace => {
    materializeTranslationBaseline({repositoryRoot: workspace, baselineRoot: baseline, target: 'ja-JP', group: 'guides'})
    const manifest = buildManifest({siteDir: workspace, target: 'ja-JP', group: 'guides', sourceCheckpointSha: 'a'.repeat(40)})
    assert.deepEqual(manifest.items, [])
    return createBatchSummary(manifest, 40)
  })
  assert.equal(summaries[0].pendingCount, 0)
  assert.equal(summaries[0].pendingSetSha256, summaries[1].pendingSetSha256)
})

test('source aggregate records the authenticated downstream translation handoff', () => {
  const workflow = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  assert.match(workflow, /^          TRANSLATION_HANDOFF_REQUESTED: \$\{\{ needs\.prepare\.outputs\.run_translations \}\}$/m)
  assert.match(workflow, /^          TRANSLATION_HANDOFF_RUN_URL: \$\{\{ needs\.dispatch_translations\.outputs\.run_url \}\}$/m)
  assert.doesNotMatch(workflow, /prepare_guides_translation_batches|GUIDES_TRANSLATION_CANDIDATES/)
})
