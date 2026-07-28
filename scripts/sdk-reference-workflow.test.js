const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const yaml = require('js-yaml')

const GUIDES_BUILD_MAPPING = "${{ inputs.site == 'en' && 'pnpm run build:en' || inputs.site == 'zh-CN' && 'pnpm run build:zh-CN' || '' }}"
const GUIDES_BUILD_VALIDATION = 'node scripts/run-doc-build-stage.js --build "$ZDOC_BUILD_COMMAND" --skipLinkChecks --skipCardReporting'

function assertGuidesAssemblySnapshotLifecycle(source) {
  const workflow = yaml.load(source)
  const steps = workflow.jobs?.assemble?.steps || []
  const named = name => steps.filter(step => step.name === name)
  const validations = named('Validate combined guides output')
  const selections = named('Select promoted Guides source snapshot')
  const checkpoints = named('Create combined guides checkpoint')
  assert.equal(validations.length, 1, 'combined Guides validation must be owned by exactly one step')
  assert.equal(selections.length, 1, 'snapshot selection must be owned by exactly one step')
  assert.equal(checkpoints.length, 1, 'checkpoint creation must be owned by exactly one step')

  const validation = validations[0]
  const selection = selections[0]
  const checkpoint = checkpoints[0]
  assert.equal(workflow.jobs.assemble.env.ZDOC_BUILD_COMMAND, GUIDES_BUILD_MAPPING, 'Guides assembly must map each site to its owned build')
  assert.match(validation.run || '', /node scripts\/validate-generated-sidebars\.js/)
  assert.equal((validation.run || '').includes(GUIDES_BUILD_VALIDATION), true, 'combined validation step must run the exact no-card build')
  assert.ok(steps.indexOf(validation) < steps.indexOf(selection), 'snapshot selection and conditional promotion must follow combined validation')
  assert.ok(steps.indexOf(selection) < steps.indexOf(checkpoint), 'checkpoint creation must include the selected snapshot identity')

  const selectionRun = selection.run || ''
  assert.match(selectionRun, /^[ \t]*candidate=packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-source-snapshot-candidate\.json$/m)
  assert.match(selectionRun, /^[ \t]*snapshot=packages\/docs-tooling\/src\/lark\/meta\/snapshots\/guides-uat-last-success\.json$/m)
  assert.match(selectionRun, /guides-cache-generation-lifecycle\.js select[\s\S]*--candidate "\$candidate" --baseline "\$snapshot"/)
  assert.match(selectionRun, /if \[\[ "\$selected" == candidate \]\]; then[\s\S]*promote-lark-doc-snapshot\.js[\s\S]*--candidate "\$candidate"[\s\S]*--output "\$snapshot"/)
  assert.match(checkpoint.run || '', /printf -v build_validation 'node scripts\/run-doc-build-stage\.js --build "%s" --skipLinkChecks --skipCardReporting' "\$ZDOC_BUILD_COMMAND"/)
  assert.match(checkpoint.run || '', /--validation-command "\$build_validation"/, 'checkpoint creation must embed the site-owned no-card build validation')

  assert.doesNotMatch(source, /update-lark-doc-snapshot\.js/)
  assert.doesNotMatch(source, /\[snapshot\] Base scan|\[snapshot\] Wiki metadata/)
}

test('SDK reference compatibility wrapper invokes content groups in order', () => {
  const fetchScript = fs.readFileSync('scripts/fetch-sdk-reference-docs.sh', 'utf8')
  assert.match(fetchScript, /for group in python java node go cli rest/)
  assert.match(fetchScript, /docs-tooling publish-group --site en --group "\$group" --stage fetch/)
  assert.match(fetchScript, /docs-tooling publish-group --site en --group "\$group" --stage validate/)
  assert.match(fetchScript, /docs-tooling publish-group --site en --group "\$group" --stage publish/)
  assert.doesNotMatch(fetchScript, /run-content-group\.js/)
  assert.doesNotMatch(fetchScript, /report-to-lark/)
})

test('every workflow that invokes docs-tooling uses its supported Node runtime', () => {
  const workflowDirectory = path.join(process.cwd(), '.github/workflows')
  const invoking = fs.readdirSync(workflowDirectory)
    .filter(file => file.endsWith('.yml'))
    .filter(file => /pnpm docs-tooling/.test(fs.readFileSync(path.join(workflowDirectory, file), 'utf8')))
    .sort()
  assert.deepEqual(invoking, [
    '_assemble-guides.yml',
    '_fetch-content-group.yml',
    '_fetch-guides-sources.yml',
    '_translate-content-group.yml',
    'check-404.yml',
    'fetch-docs.yml',
    'site-validation.yml',
  ])
  for (const file of invoking) {
    const source = fs.readFileSync(path.join(workflowDirectory, file), 'utf8')
    assert.match(source, /node-version:\s*['"]?22['"]?/, `${file} must use the supported Node 22 runtime`)
  }
})

test('root docs-tooling command uses the shared TypeScript launcher', () => {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  assert.equal(rootPackage.scripts['docs-tooling'], 'node scripts/docs-tooling.js')
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
    assert.match(result.stderr, group === 'rest' ? /rest.*no SDK Lark snapshot/i : /Unknown publication group.*unknown/)
  }
})

test('Guides assembly promotes the source candidate only after combined validation', () => {
  const source = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  assertGuidesAssemblySnapshotLifecycle(source)
})

test('Guides assembly rejects build validation moved out of the combined validation step', () => {
  const source = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  const moved = source
    .replace(`          ${GUIDES_BUILD_VALIDATION}\n`, '          true\n')
    .replace('          candidate=packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json', `          ${GUIDES_BUILD_VALIDATION}\n          candidate=packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json`)
  assert.equal((moved.match(/run-doc-build-stage\.js/g) || []).length, 2, 'mutation retains the misleading global command count')
  assert.throws(() => assertGuidesAssemblySnapshotLifecycle(moved), /combined validation step must run the exact no-card build/)
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
  assert.deepEqual(workflow.jobs.publish_guides_translation_batches.needs, ['prepare', 'publish_guides', 'publish_rest', 'prepare_guides_translation_batches', 'translate_guides_batches'])
  assert.deepEqual(workflow.jobs.finalize_guides_translation.needs, ['prepare', 'prepare_guides_translation_batches', 'translate_guides_batches', 'publish_guides_translation_batches'])
  assert.deepEqual(workflow.jobs.produce_guides_sources.needs, 'prepare')
  assert.deepEqual(workflow.jobs.render_guides_tables.needs, ['prepare', 'produce_guides_sources'])
  assert.equal(workflow.jobs.render_guides_tables.strategy['max-parallel'], 4)
  assert.deepEqual(workflow.jobs.produce_guides.needs, ['prepare', 'produce_guides_sources', 'render_guides_tables'])
  assert.equal(workflow.jobs.produce_guides.uses, './.github/workflows/_assemble-guides.yml')
  assert.equal(workflow.jobs.produce_guides_sources.with.card_id, undefined)
  assert.equal(workflow.jobs.produce_guides_sources.with.card_mode, undefined)
  assert.deepEqual(workflow.jobs.monitor_docs_progress.needs, ['prepare'])
  assert.equal(workflow.jobs.monitor_docs_progress.uses, './.github/workflows/_monitor-docs-progress.yml')
  assert.match(source, /target_branch: \$\{\{ needs\.prepare\.outputs\.target_branch \}\}/)
  assert.match(source, /should_publish: \$\{\{ needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /should_translate: \$\{\{ needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /resolve_final:[\s\S]*needs\.prepare\.outputs\.publish == 'true'/)
  assert.match(source, /publish_rest_translation:[\s\S]*commit_message: 'i18n\(rest\): publish translations'/)
  assert.deepEqual(workflow.jobs.resolve_final.needs, ['prepare', 'finalize_guides_translation', ...groups.filter(group => group !== 'guides').map(group => `publish_${group}_translation`)])
  assert.match(source, /verify:[\s\S]*uses: \.\/.github\/workflows\/_verify-docs\.yml/)
  assert.match(source, /verify:[\s\S]*target_branch: \$\{\{ needs\.prepare\.outputs\.target_branch \}\}/)
  assert.match(source, /aggregate:[\s\S]*aggregate-results\.js[\s\S]*docs-card-report\.js create[\s\S]*docs-card-report-\$\{\{ github\.run_id \}\}/)
  assert.match(source, /name: Collect card report summaries[\s\S]*CARD_REPORT_REF: \$\{\{ needs\.resolve_final\.outputs\.final_dev_sha \}\}[\s\S]*collect-build-card-notes\.js/)
  assert.match(source, /reports_file="\$\{\{ steps\.reports\.outputs\.card_notes_file \}\}"/)
  assert.match(source, /card_parts\+=\("Publish \$group" "Translate \$group" "Publish \$group translation"\)/)
  for (const workflow of ['_fetch-content-group.yml', '_publish-content-group.yml', '_translate-content-group.yml', '_verify-docs.yml']) {
    const reusable = fs.readFileSync(path.join(process.cwd(), '.github/workflows', workflow), 'utf8')
    assert.doesNotMatch(reusable, /card_started_at:|card_stages:|report-live-card\.sh/, `${workflow} must leave card ownership to the monitor`)
  }
  assert.doesNotMatch(source, /report-to-lark --card-note-file/)
  assert.doesNotMatch(source, /report-live-card\.sh|name: Finish progress card|phase_card_id|CARD_MODE:/)
  assert.deepEqual(workflow.jobs.finalize_card_fallback.needs, ['prepare', 'aggregate', 'monitor_docs_progress'])
  assert.match(workflow.jobs.finalize_card_fallback.if, /monitor_docs_progress\.result != 'success'/)
  assert.match(source, /monitor-docs-progress\.js --finalize-only --report-file/)
  assert.doesNotMatch(source, /secrets: inherit/)
})
