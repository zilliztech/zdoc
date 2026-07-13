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
  assert.match(workflow, /CARD_NO_CHANGES_GROUP: \$\{\{ steps\.result\.outputs\.status == 'no_changes' && inputs\.group \|\| '' \}\}/)
  for (const input of ['batch_index', 'batch_number', 'batch_count', 'batch_size', 'pending_count', 'pending_set_sha256']) {
    assert.match(workflow, new RegExp(`^      ${input}:`, 'm'))
  }
  assert.match(workflow, /ARTIFACT_SUFFIX/)
  assert.match(workflow, /--expected-pending-set-sha256/)
  assert.match(workflow, /CARD_JOB_NAME: \$\{\{ inputs\.batch_number > 0 && format\('\{0\}_translation_batch_\{1\}_of_\{2\}_pending_\{3\} \/ translate batch \{1\} of \{2\}'/)
})

test('batch publisher reports a reconstructable durable job identity', () => {
  const workflow = fs.readFileSync('.github/workflows/_publish-content-group.yml', 'utf8')
  assert.match(workflow, /^      artifact_run_id:/m)
  assert.match(workflow, /run-id: \$\{\{ inputs\.artifact_run_id > 0 && inputs\.artifact_run_id \|\| github\.run_id \}\}/)
  assert.match(workflow, /github-token: \$\{\{ github\.token \}\}/)
  assert.match(workflow, /^      translation_pending_count:/m)
  assert.match(workflow, /CARD_JOB_NAME: \$\{\{ inputs\.translation_batch_number > 0 && format\('\{0\}_translation_batch_\{1\}_of_\{2\}_pending_\{3\} \/ publish batch \{1\} of \{2\} \(\{4\} docs\)'/)
  const wrapper = fs.readFileSync('.github/workflows/_translate-publish-batch.yml', 'utf8')
  assert.match(wrapper, /if: \$\{\{ always\(\) && needs\.translate\.result == 'success' \}\}/)
  assert.match(wrapper, /artifact_name: \$\{\{ format\('translation-checkpoint-\{0\}-\{1\}-batch-\{2\}'/)
  assert.match(wrapper, /baseline_artifact_name: \$\{\{ format\('translation-baseline-\{0\}-\{1\}-batch-\{2\}'/)
  assert.match(wrapper, /translation_pending_count: \$\{\{ inputs\.pending_count \}\}/)
  assert.match(wrapper, /translation_published_count: \$\{\{ needs\.translate\.outputs\.translated_count \}\}/)
})

test('manual recovery workflow publishes prior-run batches sequentially', () => {
  const workflow = fs.readFileSync('.github/workflows/recover-translation-batches.yml', 'utf8')
  assert.match(workflow, /^  workflow_dispatch:/m)
  assert.match(workflow, /artifact_run_id:/)
  assert.match(workflow, /batch_count:/)
  assert.match(workflow, /max-parallel: 1/)
  assert.match(workflow, /fail-fast: false/)
  assert.match(workflow, /uses: \.\/\.github\/workflows\/_publish-content-group\.yml/)
  assert.match(workflow, /artifact_run_id: \$\{\{ fromJSON\(inputs\.artifact_run_id\) \}\}/)
  assert.match(workflow, /translation-checkpoint-guides-\{0\}-batch-\{1\}/)
  assert.match(workflow, /translation-baseline-guides-\{0\}-batch-\{1\}/)
  assert.doesNotMatch(workflow, /TRANSLATION_AGENT_API_KEY|REVIEW_AGENT_API_KEY/)
})
