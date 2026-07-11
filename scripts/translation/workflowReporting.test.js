'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')

test('translation workflow creates, updates, summarizes, and finishes a Lark card', () => {
  const workflow = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')

  assert.match(workflow, /report-to-lark --card-create/)
  assert.match(workflow, /report-to-lark --card-advance/)
  assert.match(workflow, /reportSummary\.js/)
  assert.match(workflow, /report-to-lark --card-note-file tmp\/translation-report\.md/)
  assert.match(workflow, /if: always\(\)/)
  assert.match(workflow, /report-to-lark --card-finish/)
  assert.match(workflow, /APP_ID: \$\{\{ secrets\.APP_ID \}\}/)
  assert.match(workflow, /APP_SECRET: \$\{\{ secrets\.APP_SECRET \}\}/)
  assert.match(workflow, /FEISHU_HOST: \$\{\{ vars\.FEISHU_HOST \}\}/)
  assert.match(workflow, /TRANSLATION_CHUNK_TARGET_CHARS:/)
  assert.match(workflow, /TRANSLATION_CHUNK_MAX_CHARS:/)
})
