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
})
