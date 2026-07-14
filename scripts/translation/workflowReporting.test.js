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
  assert.match(workflow, /^      translation_pending_count:/m)
  assert.match(workflow, /CARD_JOB_NAME: \$\{\{ inputs\.translation_batch_number > 0 && format\('\{0\}_translation_batch_\{1\}_of_\{2\}_pending_\{3\} \/ publish batch \{1\} of \{2\} \(\{4\} docs\)'/)
  const wrapper = fs.readFileSync('.github/workflows/_translate-publish-batch.yml', 'utf8')
  const publishJob = wrapper.slice(wrapper.indexOf('\n  publish:'), wrapper.indexOf('\n    uses:', wrapper.indexOf('\n  publish:')))
  assert.match(publishJob, /needs: translate/)
  assert.doesNotMatch(publishJob, /\n    if:/)
  assert.match(wrapper, /artifact_name: \$\{\{ format\('translation-checkpoint-\{0\}-\{1\}-batch-\{2\}'/)
  assert.match(wrapper, /baseline_artifact_name: \$\{\{ format\('translation-baseline-\{0\}-\{1\}-batch-\{2\}'/)
  assert.match(wrapper, /translation_pending_count: \$\{\{ inputs\.pending_count \}\}/)
  assert.match(wrapper, /translation_published_count: \$\{\{ needs\.translate\.outputs\.translated_count \}\}/)
})
