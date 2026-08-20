const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const yaml = require('js-yaml')

const GUIDES_BUILD_MAPPING = "${{ inputs.site == 'en' && 'pnpm run build:en' || inputs.site == 'zh-CN' && 'pnpm run build:zh-CN:site' || '' }}"
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
  assert.match(selectionRun, /^[ \t]*snapshot="\$snapshot_path"$/m)
  assert.match(selectionRun, /guides-cache-generation-lifecycle\.js select[\s\S]*--candidate "\$candidate" --baseline "\$snapshot"/)
  assert.match(selectionRun, /if \[\[ "\$selected" == candidate \]\]; then[\s\S]*promote-lark-doc-snapshot\.js[\s\S]*--candidate "\$candidate"[\s\S]*--output "\$snapshot"/)
  assert.match(checkpoint.run || '', /printf -v build_validation 'node scripts\/run-doc-build-stage\.js --build "%s" --skipLinkChecks --skipCardReporting' "\$ZDOC_BUILD_COMMAND"/)
  assert.match(checkpoint.run || '', /--validation-command "\$build_validation"/, 'checkpoint creation must embed the site-owned no-card build validation')

  assert.doesNotMatch(source, /update-lark-doc-snapshot\.js/)
  assert.doesNotMatch(source, /\[snapshot\] Base scan|\[snapshot\] Wiki metadata/)
}

test('SDK reference compatibility wrapper invokes content groups in order', () => {
  const fetchScript = fs.readFileSync('scripts/fetch-sdk-reference-docs.sh', 'utf8')
  assert.match(fetchScript, /for group in \$\(node scripts\/docs-workflow\/print-workflow-groups\.js --sdk-groups\)/)
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
    '_build-publish-site.yml',
    '_fetch-content-group.yml',
    '_fetch-guides-sources.yml',
    '_translate-content-group.yml',
    '_verify-docs.yml',
    'docs-ingestion-watchdog.yml',
    'external-link-watchdog.yml',
    'fetch-docs.yml',
    'site-validation.yml',
    'sync-master-tooling-to-dev.yml',
    'translate-codex.yml',
    'translate-content.yml',
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
  assert.match(snapshotScript, /groups=\(\$\(node scripts\/docs-workflow\/print-workflow-groups\.js --sdk-snapshot-groups\)\)/)
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
  assert.match(source, /tooling_ref:[\s\S]*description: Tooling ref override; exact SHA allowed for controlled dev publication[\s\S]*type: string[\s\S]*default: master/)
  assert.match(source, /git check-ref-format --branch "\$TARGET_BRANCH"/)
  assert.match(source, /refs\/heads\/\$TARGET_BRANCH:refs\/remotes\/origin\/\$TARGET_BRANCH/)
  assert.match(source, /TARGET_BRANCH: \$\{\{ github\.event_name == 'workflow_dispatch' && github\.event\.inputs\.target_branch \|\| 'dev' \}\}/)
  assert.match(source, /PUBLISH: \$\{\{ github\.event_name != 'workflow_dispatch' \|\| github\.event\.inputs\.publish == 'true' \}\}/)
  assert.match(source, /TOOLING_REF: \$\{\{ github\.event\.inputs\.tooling_ref \|\| 'master' \}\}/)
  assert.match(source, /^  schedule:$/m)
  assert.match(source, /cron: "0 2,10,18 \* \* \*"/)
  assert.deepEqual(workflow.permissions, {contents: 'read', actions: 'read'})
  assert.match(source, /group: docs-production-dev\n  cancel-in-progress: false/)
  assert.match(source, /if \[\[ "\$PUBLISH" == true && "\$TARGET_BRANCH" == dev && ! "\$tooling_ref" =~ \^\[0-9a-f\]\{40\}\$ \]\]; then\n\s+tooling_ref=master/)
  assert.match(source, /\^\[0-9a-f\]\{40\}\$/)
  assert.match(source, /git fetch --no-tags origin "\$tooling_ref"[\s\S]*git rev-parse FETCH_HEAD/)
  assert.match(source, /refs\/heads\/\$tooling_ref:refs\/remotes\/origin\/\$tooling_ref/)
  const resolver = source.slice(source.indexOf('        run: |', source.indexOf('      - id: refs')), source.indexOf('      - uses: pnpm/action-setup'))
  assert.doesNotMatch(resolver, /\$\{\{[^\n]*tooling_ref/)
  assert.doesNotMatch(source, /git-auto-commit|git push|--force|fetch-sdk-reference-docs|update-sdk-reference-snapshots/)

  const sdkMatrix = workflow.jobs.produce_sdk_reference
  assert.equal(sdkMatrix.name, 'produce_${{ matrix.group }}')
  assert.equal(sdkMatrix.strategy.matrix.group, '${{ fromJSON(needs.prepare.outputs.selected_sdk_groups) }}')
  assert.equal(sdkMatrix.with.group, '${{ matrix.group }}')
  assert.equal(sdkMatrix.with.publication_unit_key, 'source/${{ matrix.group }}')
  assert.equal(sdkMatrix.with.site, 'en')
  assert.equal(workflow.jobs.produce_guides.with.publication_unit_key, 'source/guides-en')
  assert.equal(workflow.jobs.produce_zh_guides.with.publication_unit_key, 'source/guides-zh-CN')
  for (const legacy of ['produce_python', 'produce_java', 'produce_node', 'produce_go', 'produce_cli', 'produce_rest', 'translate_python', 'translate_java', 'translate_node', 'translate_go', 'translate_cli', 'translate_rest']) {
    assert.equal(workflow.jobs[legacy], undefined)
  }

  for (const legacy of ['publish_java', 'publish_node', 'publish_go', 'publish_cli', 'publish_rest', 'publish_python', 'publish_guides', 'publish_zh_guides', 'resolve_final']) {
    assert.equal(workflow.jobs[legacy], undefined)
  }
  for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) assert.equal(workflow.jobs[`publish_${group}_translation`], undefined)
  assert.equal(workflow.jobs.translate_guides, undefined)
  assert.equal(workflow.jobs.publish_guides_translation, undefined)
  for (const job of ['prepare_guides_translation_batches', 'translate_guides_batches', 'publish_guides_translation_batches', 'finalize_guides_translation']) assert.equal(workflow.jobs[job], undefined)
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
  assert.deepEqual(workflow.jobs.publish_ready.needs, ['prepare'])
  assert.deepEqual(workflow.jobs.publish_ready.permissions, {actions: 'read', contents: 'write'})
  assert.match(source, /publication-coordinator\.js[\s\S]*'--mode', mode/)
  assert.deepEqual(workflow.jobs.dispatch_translations.needs, ['prepare', 'prepare_translation_handoff'])
  assert.match(source, /gh workflow run translate-codex\.yml/)
  assert.match(source, /verify:[\s\S]*uses: \.\/.github\/workflows\/_verify-docs\.yml/)
  assert.match(source, /verify:[\s\S]*publication_results_artifact_name: \$\{\{ needs\.publish_ready\.outputs\.results_artifact_name \}\}/)
  assert.match(source, /verify:[\s\S]*target_branch: \$\{\{ needs\.prepare\.outputs\.target_branch \}\}/)
  assert.match(source, /aggregate:[\s\S]*aggregate-results\.js[\s\S]*docs-card-report\.js create[\s\S]*docs-card-report-\$\{\{ github\.run_id \}\}/)
  assert.match(source, /name: Collect card report summaries[\s\S]*CARD_REPORT_REF: \$\{\{ needs\.publish_ready\.outputs\.final_target_sha \}\}[\s\S]*collect-build-card-notes\.js/)
  assert.match(source, /reports_file="\$\{\{ steps\.reports\.outputs\.card_notes_file \}\}"/)
  assert.match(source, /name: Download current English Guides reports[\s\S]*name: docs-checkpoint-guides-en-\$\{\{ github\.run_id \}\}-reports[\s\S]*name: Download current Chinese Guides reports[\s\S]*name: docs-checkpoint-guides-zh-CN-\$\{\{ github\.run_id \}\}-reports/)
  assert.match(source, /\[\[ "\$RUN_TRANSLATIONS" == true \]\] && card_parts\+=\("Handoff"\)/)
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
