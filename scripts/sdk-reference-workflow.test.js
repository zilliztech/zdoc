const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const { test } = require('node:test')

test('SDK reference compatibility wrapper invokes content groups in order', () => {
  const fetchScript = fs.readFileSync('scripts/fetch-sdk-reference-docs.sh', 'utf8')
  assert.match(fetchScript, /for group in python java node go cli rest/)
  assert.match(fetchScript, /run-content-group\.js --group "\$group"/)
  assert.doesNotMatch(fetchScript, /report-to-lark/)
})

test('SDK reference snapshots are updated after successful build', () => {
  const snapshotScript = fs.readFileSync('scripts/update-sdk-reference-snapshots.sh', 'utf8')
  assert.match(snapshotScript, /groups=\(python java node go cli\)/)
  assert.match(snapshotScript, /content-groups\.js/)
  assert.match(snapshotScript, /--manual "\$manual"/)
  assert.match(snapshotScript, /--targets-built zilliz/)
  assert.match(snapshotScript, /--build-env uat/)
  assert.match(snapshotScript, /--source-branch dev/)
  assert.match(snapshotScript, /--publish-url https:\/\/docs\.cloud-uat3\.zilliz\.com/)
  assert.match(snapshotScript, /--link-check-remote https:\/\/docs\.zilliz\.com/)
})

test('SDK snapshot wrapper clearly rejects groups without an SDK Lark snapshot', () => {
  for (const group of ['rest', 'unknown']) {
    const result = spawnSync('bash', ['scripts/update-sdk-reference-snapshots.sh', group], { encoding: 'utf8' })
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, group === 'rest' ? /rest.*no SDK Lark snapshot/i : /Unknown content group: unknown/)
  }
})

test('docs workflow supports scheduled and manual runs with the shared SDK reference scripts', () => {
  const source = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  assert.match(source, /^  workflow_dispatch:$/m)
  assert.match(source, /^  schedule:$/m)
  assert.match(source, /cron: "0 2,10,18 \* \* \*"/)
  assert.match(source, /bash scripts\/fetch-sdk-reference-docs\.sh/)
  assert.match(source, /bash scripts\/update-sdk-reference-snapshots\.sh/)
  assert.match(source, /node scripts\/validate-generated-sidebars\.js/)
  assert.match(source, /git reset --hard HEAD\s+git switch --force-create dev origin\/dev/)
})
