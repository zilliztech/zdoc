const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const yaml = require('js-yaml')

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

test('Guides assembly promotes the source candidate only after combined validation', () => {
  const source = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  const build = source.indexOf('node scripts/run-doc-build-stage.js')
  const promote = source.indexOf('node scripts/promote-lark-doc-snapshot.js')
  const checkpoint = source.indexOf('node scripts/docs-workflow/create-checkpoint-artifact.js')
  assert.ok(build >= 0, 'combined build validation must exist')
  assert.ok(promote > build, 'candidate promotion must follow combined build validation')
  assert.ok(checkpoint > promote, 'checkpoint creation must include the promoted snapshot')
  assert.match(source, /--candidate plugins\/lark-docs\/meta\/reports\/guides-source-snapshot-candidate\.json/)
  assert.match(source, /--output plugins\/lark-docs\/meta\/snapshots\/guides-uat-last-success\.json/)
  assert.doesNotMatch(source, /update-lark-doc-snapshot\.js/)
  assert.doesNotMatch(source, /\[snapshot\] Base scan|\[snapshot\] Wiki metadata/)
  assert.equal(
    source.match(/run-doc-build-stage\.js --build \"pnpm run build\" --skipLinkChecks --skipCardReporting/g)?.length,
    2,
    'assembly and checkpoint revalidation must not report Lark card progress',
  )
})

test('docs workflow orchestrates independent checkpointed publication lanes', () => {
  const source = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const workflow = yaml.load(source)
  assert.match(source, /^  workflow_dispatch:\n    inputs:\n      group:/m)
  assert.match(source, /artifact_retention_days:[\s\S]*default: 3/)
  assert.match(source, /target_branch:[\s\S]*type: string[\s\S]*default: dev/)
  assert.match(source, /publish:[\s\S]*type: boolean[\s\S]*default: true/)
  assert.match(source, /tooling_ref:[\s\S]*description: Non-production tooling ref override[\s\S]*type: string[\s\S]*default: master/)
  assert.match(source, /git check-ref-format --branch "\$TARGET_BRANCH"/)
  assert.match(source, /refs\/heads\/\$TARGET_BRANCH:refs\/remotes\/origin\/\$TARGET_BRANCH/)
  assert.match(source, /TARGET_BRANCH: \$\{\{ github\.event_name == 'workflow_dispatch' && github\.event\.inputs\.target_branch \|\| 'dev' \}\}/)
  assert.match(source, /PUBLISH: \$\{\{ github\.event_name != 'workflow_dispatch' \|\| github\.event\.inputs\.publish == 'true' \}\}/)
  assert.match(source, /TOOLING_REF: \$\{\{ github\.event\.inputs\.tooling_ref \|\| 'master' \}\}/)
  assert.match(source, /^  schedule:$/m)
  assert.match(source, /cron: "0 2,10,18 \* \* \*"/)
  assert.match(source, /^  actions: write$/m)
  assert.match(source, /group: docs-production-dev\n  cancel-in-progress: false/)
  assert.match(source, /if \[\[ "\$PUBLISH" == true && "\$TARGET_BRANCH" == dev \]\]; then\n\s+tooling_ref=master/)
  assert.match(source, /\^\[0-9a-f\]\{40\}\$/)
  assert.match(source, /git fetch --no-tags origin "\$tooling_ref"[\s\S]*git rev-parse FETCH_HEAD/)
  assert.match(source, /refs\/heads\/\$tooling_ref:refs\/remotes\/origin\/\$tooling_ref/)
  const resolver = source.slice(source.indexOf('        run: |', source.indexOf('      - id: refs')), source.indexOf('      - uses: pnpm/action-setup'))
  assert.doesNotMatch(resolver, /\$\{\{[^\n]*tooling_ref/)
  assert.doesNotMatch(source, /git-auto-commit|git push|--force|fetch-sdk-reference-docs|update-sdk-reference-snapshots/)

  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']
  const sourceOrder = ['java', 'node', 'go', 'cli', 'rest', 'python', 'guides']
  for (const group of groups) {
    if (group !== 'guides') assert.match(source, new RegExp(`produce_${group}:\\n    needs: prepare\\n[\\s\\S]*?uses: \\.\\/.github/workflows/_fetch-content-group\\.yml`))
    if (group !== 'guides') {
      assert.match(source, new RegExp(`translate_${group}:\\n    needs: \\[prepare, publish_${group}\\]`))
      assert.match(source, new RegExp(`translate_${group}:\\n    needs: \\[prepare, publish_${group}\\]\\n    if: \\$\\{\\{ always\\(\\) && needs\\.prepare\\.outputs\\.publish == 'true' && \\(needs\\.prepare\\.outputs\\.selected_group == 'all' \\|\\| needs\\.prepare\\.outputs\\.selected_group == '${group}'\\) && \\(needs\\.publish_${group}\\.outputs\\.status == 'published' \\|\\| needs\\.publish_${group}\\.outputs\\.status == 'no_changes'\\) \\}\\}`))
      assert.deepEqual(workflow.jobs[`translate_${group}`].needs, ['prepare', `publish_${group}`])
    }
  }
  for (const [index, group] of sourceOrder.entries()) {
    const expected = ['prepare', `produce_${group}`]
    if (index > 0) expected.push(`publish_${sourceOrder[index - 1]}`)
    assert.deepEqual(workflow.jobs[`publish_${group}`].needs, expected)
  }
  const translationOrder = ['python', 'java', 'node', 'go', 'cli', 'rest']
  for (const [index, group] of translationOrder.entries()) {
    const predecessor = index === 0 ? 'publish_guides_translation_batches' : `publish_${translationOrder[index - 1]}_translation`
    assert.deepEqual(workflow.jobs[`publish_${group}_translation`].needs, ['prepare', `publish_${group}`, `translate_${group}`, predecessor])
  }
  assert.equal(workflow.jobs.translate_guides, undefined)
  assert.equal(workflow.jobs.publish_guides_translation, undefined)
  assert.deepEqual(workflow.jobs.prepare_guides_translation_batches.needs, ['prepare', 'publish_guides'])
  assert.equal(workflow.jobs.prepare_guides_translation_batches.uses, './.github/workflows/_prepare-translation-batches.yml')
  assert.deepEqual(workflow.jobs.translate_guides_batches.needs, ['prepare', 'publish_guides', 'prepare_guides_translation_batches'])
  assert.equal(workflow.jobs.translate_guides_batches.uses, './.github/workflows/_translate-content-group.yml')
  assert.equal(workflow.jobs.translate_guides_batches.strategy['fail-fast'], false)
  assert.equal(workflow.jobs.translate_guides_batches.strategy['max-parallel'], undefined)
  assert.equal(workflow.jobs.translate_guides_batches.strategy.matrix, '${{ fromJSON(needs.prepare_guides_translation_batches.outputs.matrix) }}')
  assert.match(workflow.jobs.translate_guides_batches.name, /pending_\$\{\{ needs\.prepare_guides_translation_batches\.outputs\.pending_count \}\}/)
  assert.deepEqual(workflow.jobs.publish_guides_translation_batches.needs, ['prepare', 'publish_rest', 'prepare_guides_translation_batches', 'translate_guides_batches'])
  assert.deepEqual(workflow.jobs.finalize_guides_translation.needs, ['prepare', 'prepare_guides_translation_batches', 'translate_guides_batches', 'publish_guides_translation_batches'])
  assert.deepEqual(workflow.jobs.produce_guides_sources.needs, 'prepare')
  assert.deepEqual(workflow.jobs.render_guides_saas.needs, ['prepare', 'produce_guides_sources'])
  assert.deepEqual(workflow.jobs.render_guides_byoc.needs, ['prepare', 'produce_guides_sources'])
  assert.deepEqual(workflow.jobs.produce_guides.needs, ['prepare', 'produce_guides_sources', 'render_guides_saas', 'render_guides_byoc'])
  assert.equal(workflow.jobs.produce_guides.uses, './.github/workflows/_assemble-guides.yml')
  for (const jobName of ['produce_guides_sources', 'render_guides_saas', 'render_guides_byoc']) {
    assert.equal(workflow.jobs[jobName].with.card_id, '${{ needs.prepare.outputs.phase_card_id }}')
    assert.equal(workflow.jobs[jobName].with.card_mode, '${{ needs.prepare.outputs.card_mode }}')
  }
  assert.match(source, /target_branch: \$\{\{ needs\.prepare\.outputs\.target_branch \}\}/)
  assert.match(source, /should_publish: \$\{\{ needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /should_translate: \$\{\{ needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /resolve_final:[\s\S]*needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /publish_rest_translation:[\s\S]*commit_message: 'i18n\(rest\): publish translations'/)
  assert.deepEqual(workflow.jobs.resolve_final.needs, ['prepare', 'finalize_guides_translation', ...groups.filter(group => group !== 'guides').map(group => `publish_${group}_translation`)])
  assert.match(source, /verify:[\s\S]*uses: \.\/.github\/workflows\/_verify-docs\.yml/)
  assert.match(source, /verify:[\s\S]*target_branch: \$\{\{ needs\.prepare\.outputs\.target_branch \}\}/)
  assert.match(source, /aggregate:[\s\S]*aggregate-results\.js[\s\S]*report-live-card\.sh/)
  assert.match(source, /name: Collect card report summaries[\s\S]*CARD_REPORT_REF: \$\{\{ needs\.resolve_final\.outputs\.final_dev_sha \}\}[\s\S]*collect-build-card-notes\.js/)
  assert.match(source, /CARD_NOTES_JSON: \$\{\{ steps\.reports\.outputs\.card_notes_json \|\| steps\.aggregate\.outputs\.notes_json \}\}/)
  assert.match(source, /card_parts\+=\("Publish \$group" "Translate \$group" "Publish \$group translation"\)/)
  for (const workflow of ['_fetch-content-group.yml', '_publish-content-group.yml', '_translate-content-group.yml', '_verify-docs.yml']) {
    const reusable = fs.readFileSync(path.join(process.cwd(), '.github/workflows', workflow), 'utf8')
    assert.match(reusable, /card_started_at:/, `${workflow} must accept the original card start time`)
    assert.match(reusable, /card_stages:/, `${workflow} must accept the complete card stage list`)
    assert.match(reusable, /report-live-card\.sh/, `${workflow} must report its owned phase`)
  }
  assert.doesNotMatch(source, /report-to-lark --card-note-file/)
  assert.match(source, /report-live-card\.sh[\s\S]*CARD_NOTES_JSON: \$\{\{ steps\.reports\.outputs\.card_notes_json \|\| steps\.aggregate\.outputs\.notes_json \}\}/)
  assert.match(source, /name: Finish progress card[\s\S]*continue-on-error: true/)
  assert.match(source, /name: Finish progress card[\s\S]*report-live-card\.sh[\s\S]*CARD_MODE: \$\{\{ needs\.prepare\.outputs\.card_mode \}\}[\s\S]*CARD_NOTES_JSON:/)
  assert.doesNotMatch(source, /name: Finish progress card[\s\S]*report-to-lark --card-finish/)
  assert.match(source, /phase_card_id: \$\{\{ steps\.card\.outputs\.card_id \}\}/)
  assert.match(source, /CARD_MODE: \$\{\{ needs\.prepare\.outputs\.card_mode \}\}/)
  assert.doesNotMatch(source, /CARD_MODE: aggregate/)
  assert.doesNotMatch(source, /secrets: inherit/)
})
