'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')

const workflow = fs.readFileSync('.github/workflows/check-404.yml', 'utf8')

test('push runs create an external link progress card before checking', () => {
  assert.match(workflow, /id: push_card[\s\S]*github\.event_name == 'push'[\s\S]*report-to-lark --card-create[\s\S]*--title "External Link Check"[\s\S]*--stages "Check external links"/)
})

test('pull requests create a card only when new broken links exist', () => {
  assert.match(workflow, /id: pr_card[\s\S]*github\.event_name == 'pull_request'[\s\S]*steps\.summary\.outputs\.has_new_broken == 'true'[\s\S]*report-to-lark --card-create/)
})

test('summary and card finalization run after checker failure without replacing its result', () => {
  assert.match(workflow, /id: check[\s\S]*continue-on-error: true[\s\S]*node scripts\/check-404\.js/)
  assert.match(workflow, /id: summary[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*external-link-report-summary\.js/)
  assert.match(workflow, /name: Finish Feishu card[\s\S]*if: \$\{\{ always\(\)[\s\S]*report-to-lark --card-finish/)
  assert.match(workflow, /name: Preserve link-check result[\s\S]*exit 1/)
  assert.match(workflow, /CHECK_OUTCOME: \$\{\{ steps\.check\.outcome \}\}/)
})

test('reporting steps receive Feishu configuration and preserve the JSON artifact', () => {
  assert.match(workflow, /APP_ID: \$\{\{ secrets\.APP_ID \}\}/)
  assert.match(workflow, /APP_SECRET: \$\{\{ secrets\.APP_SECRET \}\}/)
  assert.match(workflow, /FEISHU_HOST: \$\{\{ vars\.FEISHU_HOST \}\}/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*tmp\/external-link-report\.json/)
})
