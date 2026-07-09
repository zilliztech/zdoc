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

test('manual and auto workflows share the same SDK reference scripts', () => {
  for (const workflow of ['.github/workflows/fetch-docs-manual.yml', '.github/workflows/fetch-docs-auto.yml']) {
    const source = fs.readFileSync(workflow, 'utf8')
    assert.match(source, /bash scripts\/fetch-sdk-reference-docs\.sh/)
    assert.match(source, /bash scripts\/update-sdk-reference-snapshots\.sh/)
  }
})
