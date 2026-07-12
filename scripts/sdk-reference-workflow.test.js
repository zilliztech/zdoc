const assert = require('node:assert/strict')
const fs = require('node:fs')
const { test } = require('node:test')

const activeManuals = ['pymilvus30', 'javaV230', 'nodejs30', 'gov230', 'cliv14']

test('SDK reference workflow uses incremental fetch for active generated manuals', () => {
  const fetchScript = fs.readFileSync('scripts/fetch-sdk-reference-docs.sh', 'utf8')
  for (const manual of activeManuals) {
    assert.match(
      fetchScript,
      new RegExp(`fetch-lark-docs -man ${manual} -tar zilliz -s3 --incremental --buildEnv uat`),
      `${manual} target fetch should be incremental`
    )
  }
})

test('SDK reference snapshots are updated after successful build', () => {
  const snapshotScript = fs.readFileSync('scripts/update-sdk-reference-snapshots.sh', 'utf8')
  for (const manual of activeManuals) {
    assert.match(
      snapshotScript,
      new RegExp(`update-lark-doc-snapshot\\.js --manual ${manual}\\b`),
      `${manual} should update last-success snapshot`
    )
  }
  assert.match(snapshotScript, /--targets-built zilliz/)
  assert.match(snapshotScript, /--build-env uat/)
  assert.match(snapshotScript, /--source-branch dev/)
  assert.match(snapshotScript, /--publish-url https:\/\/docs\.cloud-uat3\.zilliz\.com/)
  assert.match(snapshotScript, /--link-check-remote https:\/\/docs\.zilliz\.com/)
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
