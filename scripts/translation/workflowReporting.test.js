'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')

test('reusable translation workflow produces and uploads a group-scoped report', () => {
  const workflow = fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8')
  assert.match(workflow, /agentRunner\.js --manifest tmp\/translation-manifest\.json --report tmp\/translation-report\.json/)
  assert.match(workflow, /reportSummary\.js/)
  assert.match(workflow, /name: Upload translation report/)
  assert.match(workflow, /if: \$\{\{ always\(\) \}\}/)
  assert.match(workflow, /translation-report-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
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

test('batch publisher validates and publishes a reconstructable durable checkpoint', () => {
  const wrapper = fs.readFileSync('.github/workflows/_translate-publish-batch.yml', 'utf8')
  const publishJob = wrapper.slice(wrapper.indexOf('\n  publish:'))
  assert.match(publishJob, /needs: translate/)
  assert.doesNotMatch(publishJob, /\n    if:/)
  assert.match(publishJob, /runs-on: ubuntu-latest/)
  assert.match(publishJob, /permissions:[\s\S]*contents: write/)
  assert.doesNotMatch(publishJob, /uses: \.\/\.github\/workflows\/_publish-content-group\.yml/)
  assert.match(publishJob, /actions\/download-artifact@v4[\s\S]*translation-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}-batch-\$\{\{ inputs\.batch_number \}\}/)
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

test('aggregate receives Guides translation candidate counts', () => {
  const workflow = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  assert.match(workflow, /^          GUIDES_TRANSLATION_CANDIDATES: \$\{\{ needs\.prepare_guides_translation_batches\.outputs\.candidate_counts \}\}$/m)
})
