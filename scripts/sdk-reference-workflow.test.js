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
  assert.match(snapshotScript, /DOCS_SOURCE_BRANCH/)
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

test('docs workflow orchestrates parallel producers and checkpointed sequential publication', () => {
  const source = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  assert.match(source, /^  workflow_dispatch:\n    inputs:\n      group:/m)
  assert.match(source, /artifact_retention_days:[\s\S]*default: 3/)
  assert.match(source, /target_branch:[\s\S]*type: string[\s\S]*default: dev/)
  assert.match(source, /publish:[\s\S]*type: boolean[\s\S]*default: true/)
  assert.match(source, /git check-ref-format --branch "\$TARGET_BRANCH"/)
  assert.match(source, /refs\/heads\/\$TARGET_BRANCH:refs\/remotes\/origin\/\$TARGET_BRANCH/)
  assert.match(source, /TARGET_BRANCH: \$\{\{ github\.event_name == 'workflow_dispatch' && github\.event\.inputs\.target_branch \|\| 'dev' \}\}/)
  assert.match(source, /PUBLISH: \$\{\{ github\.event_name != 'workflow_dispatch' \|\| github\.event\.inputs\.publish == 'true' \}\}/)
  assert.match(source, /^  schedule:$/m)
  assert.match(source, /cron: "0 2,10,18 \* \* \*"/)
  assert.match(source, /^  actions: read$/m)
  assert.match(source, /group: docs-production-dev\n  cancel-in-progress: false/)
  assert.match(source, /git fetch --no-tags origin refs\/heads\/master:refs\/remotes\/origin\/master "refs\/heads\/\$TARGET_BRANCH:refs\/remotes\/origin\/\$TARGET_BRANCH"/)
  assert.doesNotMatch(source, /git-auto-commit|git push|--force|fetch-sdk-reference-docs|update-sdk-reference-snapshots/)

  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']
  for (const group of groups) {
    assert.match(source, new RegExp(`produce_${group}:\\n    needs: prepare\\n[\\s\\S]*?uses: \\.\\/.github/workflows/_fetch-content-group\\.yml`))
    assert.match(source, new RegExp(`publish_${group}:\\n    needs: \\[prepare, produce_${group}(?:,|\\])`))
    assert.match(source, new RegExp(`translate_${group}:\\n    needs: \\[prepare, publish_${group}\\]`))
    assert.match(source, new RegExp(`publish_${group}_translation:\\n    needs: \\[prepare, publish_${group}, translate_${group}\\]`))
  }
  assert.match(source, /target_branch: \$\{\{ needs\.prepare\.outputs\.target_branch \}\}/)
  assert.match(source, /should_publish: \$\{\{ needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /should_translate: \$\{\{ needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /resolve_final:[\s\S]*needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /publish_python:\n    needs: \[prepare, produce_python, publish_guides_translation\]/)
  assert.match(source, /publish_rest_translation:[\s\S]*commit_message: 'i18n\(rest\): publish translations'/)
  assert.match(source, /resolve_final:[\s\S]*needs: \[prepare, publish_rest_translation\][\s\S]*if: \$\{\{ always\(\) \}\}/)
  assert.match(source, /verify:[\s\S]*uses: \.\/.github\/workflows\/_verify-docs\.yml/)
  assert.match(source, /aggregate:[\s\S]*aggregate-results\.js[\s\S]*report-to-lark --card-note-file[\s\S]*report-to-lark --card-finish/)
  assert.doesNotMatch(source, /secrets: inherit/)
})
