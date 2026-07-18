'use strict'

const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const yaml = require('js-yaml')
const { validateWorkflowPolicies } = require('./validate-workflow-policy')

test('GitHub Actions workflows satisfy documentation production safety policy', () => {
  assert.deepEqual(validateWorkflowPolicies(), [])
})

test('workflow policy rejects checkpoint publishers without idempotent scoped staging', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'publisher-policy-'))
  const publisherPath = path.join(directory, 'publish-checkpoint.sh')
  try {
    fs.writeFileSync(publisherPath, '(cd "$active_worktree" && git add --all -- "${paths[@]}")\n')
    const errors = validateWorkflowPolicies(undefined, { publisherPath })
    assert.ok(errors.includes('publish-checkpoint.sh: checkpoint publisher must select stageable manifest paths'))
    assert.ok(errors.includes('publish-checkpoint.sh: checkpoint publisher must use NUL-delimited literal pathspec staging'))
    assert.ok(errors.includes('publish-checkpoint.sh: checkpoint publisher must verify staged manifest scope'))
    assert.ok(errors.includes('publish-checkpoint.sh: direct manifest pathspec staging is not idempotent'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('workflow policy rejects missing translation candidate reporting requirements', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      file: '_prepare-translation-batches.yml',
      token: 'candidate_counts',
      expected: '_prepare-translation-batches.yml: must expose translation candidate counts',
    },
    {
      file: '_prepare-translation-batches.yml',
      token: 'summary.candidateCounts',
      expected: '_prepare-translation-batches.yml: must emit classified translation candidate counts',
    },
    {
      file: 'fetch-docs.yml',
      token: 'GUIDES_TRANSLATION_CANDIDATES',
      expected: 'fetch-docs.yml: must pass Guides candidate counts to aggregation',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'candidate-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, fixture.file)
      const source = fs.readFileSync(file, 'utf8')
      assert.ok(source.includes(fixture.token), `${fixture.file} must contain ${fixture.token}`)
      fs.writeFileSync(file, source.replaceAll(fixture.token, '__REMOVED_POLICY_TOKEN__'))
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected))
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow policy rejects miswired translation candidate reporting values', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      file: '_prepare-translation-batches.yml',
      from: "      candidate_counts: { value: '${{ jobs.prepare.outputs.candidate_counts }}' }",
      to: "      candidate_counts: { value: '{}' }",
      expected: '_prepare-translation-batches.yml: must expose translation candidate counts',
    },
    {
      file: '_prepare-translation-batches.yml',
      from: '      candidate_counts: ${{ steps.summary.outputs.candidate_counts }}',
      to: '      candidate_counts: ${{ steps.summary.outputs.pending_count }}',
      expected: '_prepare-translation-batches.yml: must map prepare candidate counts from the summary step',
    },
    {
      file: '_prepare-translation-batches.yml',
      from: '            candidate_counts: JSON.stringify(summary.candidateCounts),',
      to: '            candidate_counts: JSON.stringify({}),',
      expected: '_prepare-translation-batches.yml: must emit classified translation candidate counts',
    },
    {
      file: 'fetch-docs.yml',
      from: '          GUIDES_TRANSLATION_CANDIDATES: ${{ needs.prepare_guides_translation_batches.outputs.candidate_counts }}',
      to: '          GUIDES_TRANSLATION_CANDIDATES: ${{ needs.prepare_guides_translation_batches.outputs.pending_count }}',
      expected: 'fetch-docs.yml: must pass Guides candidate counts to aggregation',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'candidate-wiring-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, fixture.file)
      const source = fs.readFileSync(file, 'utf8')
      assert.ok(source.includes(fixture.from), `${fixture.file} must contain the expected candidate mapping`)
      fs.writeFileSync(file, source.replace(fixture.from, fixture.to))
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected))
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow policy rejects Guides translation SHA authority regressions', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      from: "          BATCH_COUNT: ${{ needs.prepare_guides_translation_batches.result != 'success' && '0' || needs.prepare_guides_translation_batches.outputs.batch_count }}",
      to: "          BATCH_COUNT: ${{ needs.prepare_guides_translation_batches.outputs.batch_count || '0' }}",
      expected: 'fetch-docs.yml: Guides translation finalizer must use only exact publisher status and commit outputs',
    },
    {
      from: '          BATCH_RESULT: ${{ needs.translate_guides_batches.result }}',
      to: '          BATCH_RESULT: ${{ needs.publish_guides_translation_batches.result }}',
      expected: 'fetch-docs.yml: Guides translation finalizer must use only exact publisher status and commit outputs',
    },
    {
      from: '          PUBLISHER_COMMIT_SHA: ${{ needs.publish_guides_translation_batches.outputs.commit_sha }}',
      to: '          PUBLISHER_COMMIT_SHA: ${{ needs.resolve_final.outputs.final_dev_sha }}',
      expected: 'fetch-docs.yml: Guides translation finalizer must use only exact publisher status and commit outputs',
    },
    {
      from: '          GUIDES_TRANSLATION_SHA: ${{ needs.finalize_guides_translation.outputs.commit_sha }}',
      to: '          GUIDES_TRANSLATION_SHA: ${{ needs.finalize_guides_translation.outputs.commit_sha || needs.resolve_final.outputs.final_dev_sha }}',
      expected: 'fetch-docs.yml: aggregate must consume the exact finalized Guides translation result without fallback',
    },
  ]
  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-sha-authority-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, 'fetch-docs.yml')
      const source = fs.readFileSync(file, 'utf8')
      assert.ok(source.includes(fixture.from))
      fs.writeFileSync(file, source.replace(fixture.from, fixture.to))
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected))
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow policy rejects Guides publication evidence collection regressions', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    ['docs-translation-publication-guides-${{ github.run_id }}-${{ github.run_attempt }}', 'docs-translation-publication-guides-${{ github.run_id }}', 'fetch-docs.yml: aggregate must collect exact run-attempt Guides publication evidence before card notes'],
    ['          CARD_GUIDES_TARGET_SHA: ${{ needs.publish_guides.outputs.commit_sha }}', '          CARD_GUIDES_TARGET_SHA: ${{ needs.resolve_final.outputs.final_dev_sha }}', 'fetch-docs.yml: aggregate must collect exact run-attempt Guides publication evidence before card notes'],
  ]
  for (const [from, to, expected] of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-publication-evidence-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, 'fetch-docs.yml')
      const source = fs.readFileSync(file, 'utf8')
      assert.ok(source.includes(from))
      fs.writeFileSync(file, source.replace(from, to))
      assert.ok(validateWorkflowPolicies(directory).includes(expected))
    } finally { fs.rmSync(directory, { recursive: true, force: true }) }
  }
})

test('workflow policy independently requires checkpoint stage selection and verification', () => {
  const publisherSource = fs.readFileSync('scripts/docs-workflow/publish-checkpoint.sh', 'utf8')
  const cases = [
    {
      token: 'checkpoint-stage-paths.js" select',
      expected: 'publish-checkpoint.sh: checkpoint publisher must select stageable manifest paths',
    },
    {
      token: 'checkpoint-stage-paths.js" verify',
      expected: 'publish-checkpoint.sh: checkpoint publisher must verify staged manifest scope',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'publisher-policy-'))
    const publisherPath = path.join(directory, 'publish-checkpoint.sh')
    try {
      assert.ok(publisherSource.includes(fixture.token))
      fs.writeFileSync(publisherPath, publisherSource.replace(fixture.token, fixture.token.replace(/ (select|verify)$/, ' missing_$1')))
      assert.ok(validateWorkflowPolicies(undefined, { publisherPath }).includes(fixture.expected))
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow policy rejects unsafe Guides recovery shortcuts', () => {
  const shell = fs.readFileSync('scripts/docs-workflow/recover-translation-batches.sh', 'utf8')
  const helper = fs.readFileSync('scripts/docs-workflow/recover-guides-translation.js', 'utf8')
  const cases = [
    { shell: shell.replace('recover-guides-translation.js', 'publish-checkpoint.sh'), helper, expected: 'recover-translation-batches.sh: recovery must be a strict delta-safe helper entrypoint' },
    { shell, helper: helper.replaceAll('promoteStaging', 'unsafePromotion'), expected: 'recover-guides-translation.js: must use normal fast-forward staging promotion' },
    { shell, helper: `${helper}\nexecFileSync('git', ['push', '--force', 'origin', 'HEAD:dev'])\n`, expected: 'recover-guides-translation.js: recovery must not replay batches, merge, rebase, eval, or force-push' },
  ]
  for (const fixture of cases) {
    const directory = fs.realpathSync(fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'recovery-policy-')))
    const shellPath = path.join(directory, 'recover.sh'), helperPath = path.join(directory, 'recover.js')
    fs.writeFileSync(shellPath, fixture.shell); fs.writeFileSync(helperPath, fixture.helper)
    try { assert.ok(validateWorkflowPolicies(undefined, { recoveryShellPath: shellPath, recoveryHelperPath: helperPath }).includes(fixture.expected)) }
    finally { fs.rmSync(directory, { recursive: true, force: true }) }
  }
})

test('workflow policy excludes staging namespace from push deployment triggers', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  for (const mutate of [
    source => source.replace('      - "dev"', '      - "**"'),
    source => source.replace(/    branches:\n      - "dev"\n      - "master"\n/, ''),
    source => source.replace(/  push:\n    branches:\n      - "dev"\n      - "master"/, '  push: {}'),
  ]) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'staging-trigger-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, 'check-404.yml')
      fs.writeFileSync(file, mutate(fs.readFileSync(file, 'utf8')))
      assert.ok(validateWorkflowPolicies(directory).includes('check-404.yml: push deployment triggers must exclude docs-translation-staging/**'))
    } finally { fs.rmSync(directory, { recursive: true, force: true }) }
  }
})

test('docs production runs only on schedules or explicit manual dispatch', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const triggerBlock = fs.readFileSync(workflowPath, 'utf8').split('\npermissions:')[0]
  assert.match(triggerBlock, /workflow_dispatch:/)
  assert.match(triggerBlock, /schedule:/)
  assert.doesNotMatch(triggerBlock, /\n\s+push:/)
})

test('content producers stay parallel while source publishers form an explicit commit queue', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const workflow = yaml.load(fs.readFileSync(workflowPath, 'utf8'))
  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']
  const publicationOrder = ['java', 'node', 'go', 'cli', 'rest', 'python', 'guides']

  for (const group of groups) {
    assert.deepEqual(workflow.jobs[`produce_${group}`].needs, group === 'guides' ? ['prepare', 'produce_guides_sources', 'render_guides_tables'] : 'prepare')
    const condition = workflow.jobs[`publish_${group}`].if
    assert.match(condition, /always\(\)/, `${group} publisher must tolerate skipped serialization dependencies`)
    assert.match(condition, /needs\.prepare\.outputs\.publish == 'true'/, `${group} publisher must require publish mode`)
    assert.match(condition, new RegExp(`needs\\.prepare\\.outputs\\.selected_group == '${group}'`), `${group} publisher must require group selection`)
    assert.match(condition, new RegExp(`needs\\.produce_${group}\\.outputs\\.status == 'artifact_ready'`), `${group} publisher must require an artifact-ready producer`)
  }
  for (const [index, group] of publicationOrder.entries()) {
    const expectedNeeds = ['prepare', `produce_${group}`]
    if (index > 0) expectedNeeds.push(`publish_${publicationOrder[index - 1]}`)
    assert.deepEqual(workflow.jobs[`publish_${group}`].needs, expectedNeeds)
  }
})

test('job-level env must not reference the runner context', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'workflow-policy-'))
  try {
    fs.writeFileSync(path.join(directory, 'fixture.yml'), `name: fixture
on: push
permissions:
  contents: read
jobs:
  fixture:
    timeout-minutes: 5
    runs-on: ubuntu-latest
    env:
      INVALID_PATH: \${{ runner.temp }}/job
    steps:
      - uses: actions/upload-artifact@v4
        with:
          path: \${{ runner.temp }}/step
`)
    assert.ok(
      validateWorkflowPolicies(directory).includes('fixture.yml: job-level env must not reference runner.temp'),
    )
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('central monitor owns live and terminal card presentation', () => {
  const callerSource = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const workflow = yaml.load(callerSource)
  assert.deepEqual(workflow.jobs.monitor_docs_progress.needs, ['prepare'])
  assert.equal(workflow.jobs.monitor_docs_progress.uses, './.github/workflows/_monitor-docs-progress.yml')
  assert.equal(workflow.jobs.aggregate.needs.includes('monitor_docs_progress'), false)
  assert.deepEqual(workflow.jobs.finalize_card_fallback.needs, ['prepare', 'aggregate', 'monitor_docs_progress'])
  assert.match(workflow.jobs.finalize_card_fallback.if, /monitor_docs_progress\.result != 'success'/)
  assert.match(callerSource, /name: docs-card-report-\$\{\{ github\.run_id \}\}/)
  assert.doesNotMatch(callerSource, /name: Finish progress card/)

  const monitor = fs.readFileSync('.github/workflows/_monitor-docs-progress.yml', 'utf8')
  assert.match(monitor, /^\s+actions: read$/m)
  assert.match(monitor, /^\s+contents: read$/m)
  assert.doesNotMatch(monitor, /contents: write|actions: write|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY|AWS_ACCESS_KEY_ID/)

  for (const file of [
    '_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml',
    '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml',
    '_translate-publish-batch.yml', '_verify-docs.yml',
  ]) {
    const source = fs.readFileSync(path.join('.github/workflows', file), 'utf8')
    assert.doesNotMatch(source, /report-live-card\.sh|report-to-lark --card-(?:phase|finish|state-file|advance)/, file)
    assert.doesNotMatch(source, /^      card_(?:id|started_at|stages|mode):/m, file)
  }
  for (const file of ['_assemble-guides.yml', '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml', '_translate-publish-batch.yml', '_verify-docs.yml']) {
    assert.doesNotMatch(fs.readFileSync(path.join('.github/workflows', file), 'utf8'), /APP_ID|APP_SECRET/, file)
  }
})

test('aggregate restores current Guides reports before building the final card artifact', () => {
  const workflow = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const aggregate = workflow.slice(workflow.indexOf('  aggregate:'), workflow.indexOf('  finalize_card_fallback:'))
  const restoreIndex = aggregate.indexOf('name: Restore committed report directories')
  const downloadIndex = aggregate.indexOf('name: Download current Guides reports')
  const collectIndex = aggregate.indexOf('name: Collect card report summaries')
  assert.ok(restoreIndex >= 0)
  assert.ok(downloadIndex > restoreIndex)
  assert.ok(collectIndex > downloadIndex)
  assert.match(aggregate, /name: docs-checkpoint-guides-\$\{\{ github\.run_id \}\}-reports/)
  assert.match(aggregate, /path: plugins\/lark-docs\/meta\/reports/)
  assert.match(aggregate, /CARD_EXPECT_GUIDES_REPORTS:.*produce_guides\.outputs\.status.*artifact_ready/)
  assert.match(aggregate, /CARD_REPORT_ARTIFACT_URL:/)
})

test('workflow validator rejects distributed card ownership and broken monitor topology', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      mutate(directory) {
        fs.appendFileSync(path.join(directory, '_verify-docs.yml'), '\n# report-live-card.sh\n')
      },
      expected: /distributed card update/,
    },
    {
      mutate(directory) {
        const file = path.join(directory, 'fetch-docs.yml')
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('monitor_docs_progress:\n    needs: [prepare]', 'monitor_docs_progress:\n    needs: [prepare, produce_python]'))
      },
      expected: /monitor must start after prepare only/,
    },
    {
      mutate(directory) {
        const file = path.join(directory, 'fetch-docs.yml')
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('name: docs-card-report-${{ github.run_id }}', 'name: missing-final-report'))
      },
      expected: /final card report artifact/,
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'central-card-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      fixture.mutate(directory)
      assert.match(validateWorkflowPolicies(directory).join('\n'), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow validator rejects unsafe Guides cache migration shapes', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      mutate(source) {
        return source.replace('        name: Validate Guides v1 cache candidate', '        name: Validate Guides v1 candidate')
      },
      expected: /restore and validate in v4, v3, v2, v1 order/,
    },
    {
      mutate(source) {
        return source.replace('steps.source_cache_check.outputs.source_valid }}" != true', 'steps.source_cache_check.outputs.media_valid }}" != true')
      },
      expected: /full fetch must depend only on source validity/,
    },
    {
      mutate(source) {
        return source.replace("if: ${{ steps.source_cache_v3_check.outputs.source_valid != 'true' }}", "if: ${{ steps.source_cache_v3.outputs.cache-hit != 'true' }}")
      },
      expected: /preceding source validity|never trust cache-hit/,
    },
    {
      mutate(source) {
        return source.replace('          key: ${{ steps.source_cache_keys.outputs.v2 }}', '          key: ${{ steps.source_cache_keys.outputs.v2 }}\n          restore-keys: guides-source-v2-')
      },
      expected: /sole snapshot-scoped restore prefix/,
    },
    {
      mutate(source) {
        return source.replace('--workspace "$GITHUB_WORKSPACE" --scope all', '--workspace "$GITHUB_WORKSPACE" --scope media')
      },
      expected: /residue must be removed/,
    },
    {
      mutate(source) {
        return source.replace('node scripts/docs-workflow/guides-source-cache-source-promotion.js cleanup \\\n              --workspace "$GITHUB_WORKSPACE" --scope all', 'rm -rf plugins/lark-docs/meta/source-cache plugins/lark-docs/meta/media-cache')
      },
      expected: /exact cache leaves/,
    },
    {
      mutate(source) {
        return source.replace('guides-source-cache-source-promotion.js promote', 'guides-source-cache-source-promotion.js unsafe')
      },
      expected: /source and media validity must remain independent/,
    },
    {
      mutate(source) {
        return source.replace('[[ -e "$payload" || -L "$payload" ]] && candidate_present=true', 'candidate_present=false')
      },
      expected: /malformed v4 cache payload must be reported as an invalid candidate/,
    },
    {
      mutate(source) {
        return source.replace('guides-source-cache-source-promotion.js validate-live-source', 'guides-source-cache.js validate-source')
      },
      expected: /physical validation must precede semantic/,
    },
    {
      mutate(source) {
        return source.replace(
          '[[ -e plugins/lark-docs/meta/sources/guides || -L plugins/lark-docs/meta/sources/guides || \\\n               -e "$manifest" || -L "$manifest" || -e "$media" || -L "$media" ]]',
          '[[ -d plugins/lark-docs/meta/sources/guides || -f "$manifest" || -f "$media" ]]',
        )
      },
      expected: /malformed legacy cache leaves must be reported as invalid candidates/,
    },
    {
      mutate(source) {
        return source.replace('Media cache unavailable; rebuilding complete canonical media coverage', 'Media cache unavailable')
      },
      expected: /full canonical media recovery/,
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-cache-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, '_fetch-guides-sources.yml')
      fs.writeFileSync(file, fixture.mutate(fs.readFileSync(file, 'utf8')))
      assert.match(validateWorkflowPolicies(directory).join('\n'), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }

  const assemblyCases = [
    {
      mutate(source) { return source.replace("if: ${{ inputs.cache_save_required == 'true' && steps.guides_v4_generation.outcome == 'success' }}", 'if: ${{ always() }}') },
      expected: /v4 cache save must be conditional, nonfatal/,
    },
    {
      mutate(source) { return source.replace('continue-on-error: true\n        uses: actions/cache/save@v4', 'continue-on-error: false\n        uses: actions/cache/save@v4') },
      expected: /v4 cache save must be conditional, nonfatal/,
    },
    {
      mutate(source) { return source.replace('guides-cache-generation-lifecycle.js select', 'guides-cache-generation-lifecycle.js unsafe') },
      expected: /preserve the baseline snapshot/,
    },
    {
      mutate(source) { return source.replace('name: Record Guides cache generation persistence\n        if: ${{ always() }}', 'name: Record Guides cache generation persistence\n        if: ${{ success() }}') },
      expected: /report must run after save/,
    },
    {
      mutate(source) { return `${source}\n# guides-source-cache.js key --snapshot "$snapshot" --version 3\n` },
      expected: /legacy v3 cache persistence is forbidden/,
    },
  ]
  for (const fixture of assemblyCases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-cache-save-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, '_assemble-guides.yml')
      fs.writeFileSync(file, fixture.mutate(fs.readFileSync(file, 'utf8')))
      assert.match(validateWorkflowPolicies(directory).join('\n'), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }

  const callerDirectory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-cache-caller-policy-'))
  try {
    fs.cpSync(sourceDirectory, callerDirectory, { recursive: true })
    const file = path.join(callerDirectory, 'fetch-docs.yml')
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('      cache_save_required: ${{ needs.produce_guides_sources.outputs.cache_save_required }}\n', ''))
    assert.match(validateWorkflowPolicies(callerDirectory).join('\n'), /pass Guides cache version and save requirement into assembly/)
  } finally {
    fs.rmSync(callerDirectory, { recursive: true, force: true })
  }
})

test('workflow validator rejects incomplete aggregate report ingestion', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      mutate(source) {
        return source.replace(/      - name: Download current Guides reports[\s\S]*?          path: plugins\/lark-docs\/meta\/reports\n/, '')
      },
      expected: /aggregate must download current Guides reports/,
    },
    {
      mutate(source) {
        return source
          .replace('      - name: Restore committed report directories', '      - name: Collect card report summaries\n        run: true\n      - name: Restore committed report directories')
          .replace('      - id: reports\n        name: Collect card report summaries', '      - id: reports\n        name: Collect card report summaries late')
      },
      expected: /downloaded before card collection/,
    },
    {
      mutate(source) {
        return source.replace('path: plugins/lark-docs/meta/reports', 'path: tmp/guides-reports')
      },
      expected: /collector report directory/,
    },
    {
      mutate(source) {
        return source.replace(/^\s+CARD_REPORT_ARTIFACT_URL:.*\n/m, '')
      },
      expected: /artifact-only card reports require a workflow artifact URL/,
    },
    {
      mutate(source) {
        return source.replace('CARD_REPORT_STARTED_AT: ${{ needs.prepare.outputs.card_started_at }}', 'APP_ID: ${{ secrets.APP_ID }}\n          CARD_REPORT_STARTED_AT: ${{ needs.prepare.outputs.card_started_at }}')
      },
      expected: /report ingestion must not receive Feishu credentials/,
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'aggregate-report-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, 'fetch-docs.yml')
      fs.writeFileSync(file, fixture.mutate(fs.readFileSync(file, 'utf8')))
      assert.match(validateWorkflowPolicies(directory).join('\n'), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('reusable final verification uses immutable master tooling against exact final dev content read-only', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_verify-docs.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'final verification workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')
  for (const input of ['final_dev_sha', 'master_sha', 'target_branch']) assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  assert.match(workflow, /^  contents: read$/m)
  assert.match(workflow, /timeout-minutes: 180/)
  assert.match(workflow, /name: Check out immutable master tooling[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}[\s\S]*fetch-depth: 0/)
  assert.match(workflow, /git fetch --no-tags origin "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /git worktree add --detach "\$RUNNER_TEMP\/final-dev" "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /name: Clean up final dev worktree[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*git worktree remove --force "\$RUNNER_TEMP\/final-dev"/)
  assert.doesNotMatch(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}/)
  assert.match(workflow, /validate-generated-sidebars\.js/)
  assert.match(workflow, /for group in guides python java node go cli rest; do[\s\S]*validate-translated-coverage\.js --group "\$group"[\s\S]*done/)
  assert.match(workflow, /run-doc-build-stage\.js --build "pnpm run build"/)
  assert.match(workflow, /run-doc-build-stage\.js --build "pnpm run build" --skipCardReporting/)
  const verificationStep = workflow.slice(workflow.indexOf('name: Verify final documentation state'), workflow.indexOf('name: Upload final verification reports'))
  assert.match(verificationStep, /run: \|\n\s+set -euo pipefail\n[\s\S]*validate-generated-sidebars\.js[^\n]*\| tee/)
  assert.ok(verificationStep.indexOf('set -euo pipefail') < verificationStep.indexOf('validate-generated-sidebars.js'))
  assert.match(workflow, /validate-workflow-policy\.js/)
  for (const testFile of ['sdk-reference-workflow.test.js', 'restore-generated-state.test.js', 'validate-workflow-policy.test.js', 'aggregate-results.test.js', 'build-aggregate-input.test.js', 'checkpoint-contention.test.js']) assert.match(workflow, new RegExp(testFile.replaceAll('.', '\\.')))
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*if: \$\{\{ always\(\) \}\}/)
  assert.match(workflow, /value: \$\{\{ jobs\.verify\.outputs\.status \}\}/)
  assert.match(workflow, /status=passed[\s\S]*status=failed/)
  assert.doesNotMatch(workflow, /contents: write|git push/)
  const verificationBody = workflow.slice(workflow.indexOf('name: Verify final documentation state'), workflow.indexOf('name: Report verification phase'))
  assert.doesNotMatch(verificationBody, /secrets\./)
})

test('reusable content producer is immutable, read-only, and publishes a validated checkpoint artifact', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_fetch-content-group.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'reusable content producer workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /^name: fetch docs content group$/m)
  assert.match(workflow, /^  workflow_call:$/m)
  for (const input of ['group', 'master_sha', 'dev_baseline_sha', 'artifact_retention_days']) {
    assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  }
  for (const secret of ['APP_ID', 'APP_SECRET', 'SPACE_ID', 'FIGMA_API_KEY', 'MODEL_API_KEY', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']) {
    assert.match(workflow, new RegExp(`^      ${secret}:$`, 'm'))
  }
  assert.doesNotMatch(workflow, /TRANSLATION|ACTION_TOKEN/)
  assert.match(workflow, /^  contents: read$/m)
  assert.doesNotMatch(workflow, /^concurrency:/m)
  assert.doesNotMatch(workflow, /git-auto-commit|git push(?:\s+--force|[^\n]*\s--force)/)
  assert.match(workflow, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$DEV_BASELINE_SHA"/)
  assert.match(workflow, /name: Restore generated state from dev baseline[\s\S]*name: Prepare selected content group workspace[\s\S]*name: Fetch content group/)
  assert.match(workflow, /prepare-content-group-workspace\.js "\$GROUP"/)
  assert.match(workflow, /create-checkpoint-artifact\.js[\s\S]*--baseline-dir "\$BASELINE_DIR"[\s\S]*--workspace "\$GITHUB_WORKSPACE"/)
  assert.match(workflow, /validate-checkpoint-artifact\.js/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*docs-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /artifact_name: \$\{\{ format\('docs-checkpoint-\{0\}-\{1\}', inputs\.group, github\.run_id\) \}\}/)
  assert.match(workflow, /id: checkpoint_upload[\s\S]*uses: actions\/upload-artifact@v4/)
  assert.match(workflow, /name: Emit producer result\n        id: result\n        if: \$\{\{ always\(\) \}\}[\s\S]*steps\.checkpoint_upload\.outcome[\s\S]*artifact_ready[\s\S]*failed/)
  const jobEnv = workflow.match(/^    env:\n([\s\S]*?)^    steps:$/m)?.[1] || ''
  assert.doesNotMatch(jobEnv, /secrets\./, 'producer secrets must be scoped to individual steps')
  const sourceUpload = workflow.slice(workflow.indexOf('name: Upload source checkpoint artifact'), workflow.indexOf('name: Upload content group reports'))
  assert.doesNotMatch(sourceUpload, /^        env:/m, 'artifact upload must not receive credentials')
  assert.match(workflow, /name: Install dependencies\n        id: install\n        run: pnpm install --frozen-lockfile/)
  assert.doesNotMatch(workflow, /report-live-card|card_id|card_started_at|card_stages|card_mode/)
})

test('guides source and table render expose jobs for the central monitor without patching cards', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_fetch-guides-sources.yml'), 'utf8')
  const render = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_render-guides-table.yml'), 'utf8')
  assert.doesNotMatch(source, /report-live-card|card_id|card_mode|card_started_at/)
  assert.doesNotMatch(render, /report-live-card|secrets\./)
  assert.match(source, /name: Create Guides progress metadata[\s\S]*continue-on-error: true/)
  assert.match(source, /name: Upload Guides progress metadata[\s\S]*continue-on-error: true[\s\S]*name: docs-progress-metadata-\$\{\{ github\.run_id \}\}/)
  const metadataSteps = source.slice(source.indexOf('name: Create Guides progress metadata'), source.indexOf('name: Create shared source artifact'))
  assert.doesNotMatch(metadataSteps, /APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/)
})

test('Tools table is the only Agents producer while Releases keeps its sidebar', () => {
  const config = fs.readFileSync('config/lark-docs.config.ts', 'utf8')
  const sidebars = fs.readFileSync('sidebarsTutorial.ts', 'utf8')
  const workflows = fs.readdirSync('.github/workflows').map(file => fs.readFileSync(path.join('.github/workflows', file), 'utf8')).join('\n')
  assert.doesNotMatch(config, /const agents: Manual|agents,/)
  assert.doesNotMatch(sidebars, /agentsSidebar|agents\.sidebar/)
  assert.match(sidebars, /releasesSidebar/)
  assert.doesNotMatch(workflows, /produce_guides_agents|guides-agents|merge-agents-sidebar/)
})

test('guides workflows bootstrap full sources and persist only verified caches', () => {
  const caller = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const source = fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8')
  const sourceWorkflow = yaml.load(source)
  const sourceSteps = sourceWorkflow.jobs.fetch.steps
  const requiredCacheSteps = [
    'Compute Guides cache generation keys',
    'Restore Guides v4 cache candidate',
    'Validate and promote Guides v4 cache candidate',
    'Restore Guides v3 cache candidate',
    'Validate Guides v3 cache candidate',
    'Restore Guides v2 cache candidate',
    'Validate Guides v2 cache candidate',
    'Restore Guides v1 cache candidate',
    'Validate Guides v1 cache candidate',
  ]
  const assemble = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  assert.match(caller, /^  actions: write$/m)
  let previousIndex = -1
  for (const name of requiredCacheSteps) {
    const index = sourceSteps.findIndex(step => step.name === name)
    assert.ok(index > previousIndex, `${name} must appear in the required order`)
    previousIndex = index
  }
  assert.equal((source.match(/^\s+restore-keys:/gm) || []).length, 1)
  assert.match(source, /name: Restore Guides v4 cache candidate[\s\S]*if: \$\{\{ steps\.source_cache_keys\.outputs\.v4_restore_enabled == 'true' \}\}[\s\S]*path: tmp\/guides-source-cache-v4[\s\S]*key: \$\{\{ steps\.source_cache_keys\.outputs\.v4_lookup \}\}[\s\S]*restore-keys: \$\{\{ steps\.source_cache_keys\.outputs\.v4_prefix \}\}/)
  assert.match(source, /guides-source-cache-generation\.js keys[\s\S]*\.prefix[\s\S]*v4_prefix/)
  assert.match(source, /\[\[ -e "\$payload" \|\| -L "\$payload" \]\] && candidate_present=true[\s\S]*\[\[ -d "\$payload" && ! -L "\$payload" && -f "\$snapshot" \]\]/)
  assert.match(source, /name: Validate and promote Guides v4 cache candidate[\s\S]*guides-source-cache-source-promotion\.js validate[\s\S]*--payload "\$staged"[\s\S]*guides-source-cache\.js validate-media[\s\S]*"\$staged\/media-manifest\.json"[\s\S]*else[\s\S]*guides-source-cache-source-promotion\.js promote[\s\S]*--payload "\$staged"[\s\S]*source_valid=true/)
  assert.doesNotMatch(source, /cp -a "\$staged\/sources" plugins\/lark-docs\/meta\/sources/)
  assert.match(source, /name: Restore Guides v3 cache candidate\n\s+if: \$\{\{ steps\.source_cache_v4_check\.outputs\.source_valid != 'true' \}\}/)
  assert.match(source, /name: Restore Guides v2 cache candidate\n\s+if: \$\{\{ steps\.source_cache_v3_check\.outputs\.source_valid != 'true' \}\}/)
  assert.match(source, /name: Restore Guides v1 cache candidate\n\s+if: \$\{\{ steps\.source_cache_v2_check\.outputs\.source_valid != 'true' \}\}/)
  assert.doesNotMatch(source, /cache-hit/)
  for (const [id, preceding] of [['source_cache_v3_check', 'source_cache_v4_check'], ['source_cache_v2_check', 'source_cache_v3_check'], ['source_cache_v1_check', 'source_cache_v2_check']]) {
    const step = sourceSteps.find(candidate => candidate.id === id)
    assert.equal(step.if, undefined)
    assert.match(step.run, new RegExp(`steps\\.${preceding}\\.outputs\\.source_valid[\\s\\S]*source_valid=true`))
  }
  assert.match(source, /name: Validate and promote Guides v4 cache candidate[\s\S]*rm -rf tmp\/guides-source-cache-v4[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all[\s\S]*name: Restore Guides v3 cache candidate/)
  assert.match(source, /name: Validate Guides v3 cache candidate[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all[\s\S]*name: Restore Guides v2 cache candidate/)
  assert.match(source, /name: Validate Guides v2 cache candidate[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all[\s\S]*name: Restore Guides v1 cache candidate/)
  for (const validationName of ['Validate Guides v3 cache candidate', 'Validate Guides v2 cache candidate', 'Validate Guides v1 cache candidate']) {
    const start = source.indexOf(`name: ${validationName}`)
    const end = source.indexOf('\n      - id:', start + 1)
    const block = source.slice(start, end)
    assert.match(block, /\[\[ -e plugins\/lark-docs\/meta\/sources\/guides \|\| -L plugins\/lark-docs\/meta\/sources\/guides/)
    assert.match(block, /-e "\$manifest" \|\| -L "\$manifest"/)
    if (validationName !== 'Validate Guides v1 cache candidate') assert.match(block, /-e "\$media" \|\| -L "\$media"/)
  }
  assert.doesNotMatch(source, /rm -rf[^\n]*plugins\/lark-docs\/meta\/(?:source-cache|media-cache)\/?(?:\s|$)/)
  assert.match(source, /guides-source-cache-source-promotion\.js validate-live-source/)
  assert.match(source, /guides-source-cache\.js validate-media/)
  for (const [validationName, nextName] of [['Validate Guides v3 cache candidate', 'Restore Guides v2 cache candidate'], ['Validate Guides v2 cache candidate', 'Restore Guides v1 cache candidate']]) {
    const block = source.slice(source.indexOf(`name: ${validationName}`), source.indexOf(`name: ${nextName}`))
    assert.ok(block.indexOf('guides-source-cache-source-promotion.js validate-live-source') < block.indexOf('guides-source-cache-source-promotion.js validate-live-media'))
  }
  assert.match(source, /guides-source-cache-generation\.js promote/)
  assert.match(source, /plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--media-manifest "?plugins\/lark-docs\/meta\/media-cache\/guides\.json"?/)
  assert.match(source, /--force-full-fetch/)
  assert.match(source, /id: source_cache_result[\s\S]*source_valid[\s\S]*media_valid[\s\S]*cache_version[\s\S]*cache_save_required/)
  assert.match(source, /guides-cache-save-decision\.js decide[\s\S]*--cache-version "\$cache_version"[\s\S]*--prefetch-mode[\s\S]*--candidate "\$candidate"[\s\S]*--baseline "\$baseline"/)
  assert.doesNotMatch(source, /candidate_key|baseline_key/)
  assert.match(source, /cache_state=invalid/)
  assert.match(source, /steps\.source_cache_check\.outputs\.source_valid[\s\S]*args\+=\(--force-full-fetch\)/)
  assert.doesNotMatch(source, /media_valid[^\n]*[\s\S]{0,180}args\+=\(--force-full-fetch\)/)
  assert.match(caller, /produce_guides:[\s\S]*cache_version: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_version \}\}[\s\S]*cache_save_required: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_save_required \}\}/)
  assert.match(assemble, /cache_version: \{ required: true, type: string \}/)
  assert.match(assemble, /cache_save_required: \{ required: true, type: string \}/)
  assert.match(assemble, /name: Select promoted Guides source snapshot[\s\S]*guides-cache-generation-lifecycle\.js select[\s\S]*--cache-version "\$\{\{ inputs\.cache_version \}\}"[\s\S]*--save-required "\$\{\{ inputs\.cache_save_required \}\}"/)
  assert.match(assemble, /name: Prepare promoted Guides source manifest[\s\S]*guides-source-cache\.js create/)
  assert.match(assemble, /id: guides_v4_generation\n\s+name: Create Guides v4 generation payload\n\s+if: \$\{\{ inputs\.cache_save_required == 'true' \}\}[\s\S]*guides-source-cache-generation\.js keys[\s\S]*--snapshot "\$snapshot"[\s\S]*guides-source-cache-generation\.js create[\s\S]*guides-source-cache-generation\.js validate/)
  assert.match(assemble, /--media-manifest "?plugins\/lark-docs\/meta\/media-cache\/guides\.json"?/)
  assert.match(assemble, /id: save_guides_v4_generation\n\s+name: Save Guides v4 generation\n\s+if: \$\{\{ inputs\.cache_save_required == 'true' && steps\.guides_v4_generation\.outcome == 'success' \}\}\n\s+continue-on-error: true\n\s+uses: actions\/cache\/save@v4[\s\S]*path: tmp\/guides-source-cache-v4[\s\S]*key: \$\{\{ steps\.guides_v4_generation\.outputs\.key \}\}/)
  assert.match(assemble, /name: Record Guides cache generation persistence\n\s+if: \$\{\{ always\(\) \}\}[\s\S]*guides-cache-generation-lifecycle\.js report[\s\S]*steps\.promoted_snapshot\.outcome[\s\S]*steps\.promoted_source_manifest\.outcome[\s\S]*guides-cache-generation\.json/)
  assert.match(assemble, /^  actions: write$/m)
  assert.ok(assemble.indexOf('Validate combined guides output') < assemble.indexOf('Select promoted Guides source snapshot'))
  assert.ok(assemble.indexOf('Select promoted Guides source snapshot') < assemble.indexOf('Create Guides v4 generation payload'))
  assert.ok(assemble.indexOf('Create Guides v4 generation payload') < assemble.indexOf('Save Guides v4 generation'))
  assert.doesNotMatch(assemble, /guides-source-cache\.js key[^\n]*--version 3/)
})

test('guides media is prefetched once for the incremental render scope and shared by parallel renders', () => {
  const caller = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const source = fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8')
  const render = fs.readFileSync('.github/workflows/_render-guides-table.yml', 'utf8')
  const runner = fs.readFileSync('scripts/docs-workflow/render-guides-table.js', 'utf8')

  assert.match(source, /guides-media-prefetch\.js/)
  assert.match(source, /--snapshot plugins\/lark-docs\/meta\/reports\/guides-source-snapshot-candidate\.json/)
  assert.match(source, /--report plugins\/lark-docs\/meta\/reports\/guides-media-prefetch\.json/)
  assert.match(source, /if \[\[ "\$\{\{ steps\.source_cache_check\.outputs\.media_valid \}\}" == true \]\]; then[\s\S]*--mode incremental[\s\S]*--cache-state valid[\s\S]*--plan plugins\/lark-docs\/meta\/reports\/guides-incremental-fetch-plan\.json[\s\S]*--previous-manifest plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--previous-manifest plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--bootstrap-docs docs,docs-byoc/)
  assert.match(source, /media cache unavailable; rebuilding complete canonical media coverage/i)
  assert.match(source, /else[\s\S]*cache_state="\$\{\{ steps\.source_cache_check\.outputs\.cache_state \}\}"[\s\S]*--mode recovery[\s\S]*--cache-state "\$cache_state"[\s\S]*node scripts\/docs-workflow\/guides-media-prefetch\.js "\$\{args\[@\]\}"/)
  const recoveryBranch = source.slice(source.indexOf('else\n            echo "[source-cache] Media cache unavailable'), source.indexOf('node scripts/docs-workflow/guides-media-prefetch.js'))
  assert.doesNotMatch(recoveryBranch, /--plan|--previous-manifest/)
  assert.match(source, /--concurrency 4/)
  assert.match(source, /GUIDES_FIGMA_MAX_CONCURRENT: '1'/)
  assert.match(source, /GUIDES_FIGMA_MIN_TIME_MS: '1000'/)
  assert.match(source, /AWS_ACCESS_KEY_ID: \$\{\{ secrets\.AWS_ACCESS_KEY_ID \}\}/)
  assert.match(source, /AWS_SECRET_ACCESS_KEY: \$\{\{ secrets\.AWS_SECRET_ACCESS_KEY \}\}/)

  assert.match(runner, /--offline[\s\S]*--mediaManifest[\s\S]*plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.doesNotMatch(render, /GUIDES_MEDIA_MANIFEST|GUIDES_MEDIA_PREFETCH_REQUIRED/)
  assert.doesNotMatch(render, /APP_ID|APP_SECRET|SPACE_ID|MODEL_API_KEY|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/)
  assert.match(render, /NO_UPDATE_NOTIFIER: '1'/)

  assert.deepEqual(caller.jobs.render_guides_tables.needs, ['prepare', 'produce_guides_sources'])
  assert.equal(caller.jobs.render_guides_tables.strategy['max-parallel'], 4)
  assert.equal(caller.jobs.render_guides_tables.strategy['fail-fast'], false)
  assert.equal(caller.jobs.render_guides_tables.strategy.matrix, '${{ fromJSON(needs.produce_guides_sources.outputs.table_matrix) }}')
  assert.equal(caller.jobs.render_guides_tables.secrets, undefined)
})

test('Guides table matrix permits empty renders and exact assembly', () => {
  const caller = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const assemble = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  assert.match(caller.jobs.render_guides_tables.if, /table_count != '0'/)
  assert.match(caller.jobs.produce_guides.if, /render_guides_tables\.result == 'success'.*render_guides_tables\.result == 'skipped'/)
  assert.deepEqual(caller.jobs.produce_guides.needs, ['prepare', 'produce_guides_sources', 'render_guides_tables'])
  assert.match(assemble, /if: \$\{\{ inputs\.table_count != '0' \}\}[\s\S]*pattern: guides-table-/)
  assert.match(assemble, /restore-guides-table-artifacts\.js/)
  assert.doesNotMatch(assemble, /saas_artifact_name|byoc_artifact_name|guides-render\.tar/)
})

test('Guides assembly reuse remains observe-only with immutable decision and separate result', () => {
  const source = fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8')
  const assemble = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  const tableIndex = source.indexOf('name: Build Guides table render matrix')
  const decisionIndex = source.indexOf('name: Evaluate Guides assembly reuse')
  const artifactIndex = source.indexOf('name: Create shared source artifact')
  assert.ok(tableIndex >= 0 && tableIndex < decisionIndex && decisionIndex < artifactIndex)
  const sourceDecision = source.slice(decisionIndex, artifactIndex)
  assert.match(sourceDecision, /guides-assembly-identity\.js decide/)
  assert.match(sourceDecision, /--repository-root "\$GITHUB_WORKSPACE"/)
  assert.match(sourceDecision, /--baseline-root "\$RUNNER_TEMP\/baseline"/)
  assert.match(sourceDecision, /--candidate-snapshot plugins\/lark-docs\/meta\/reports\/guides-source-snapshot-candidate\.json/)
  assert.match(sourceDecision, /--incremental-plan plugins\/lark-docs\/meta\/reports\/guides-incremental-fetch-plan\.json/)
  assert.match(sourceDecision, /--table-count "\$\{\{ steps\.table_matrix\.outputs\.count \}\}"/)
  assert.match(sourceDecision, /decision-sha[\s\S]*assembly_decision_sha256/)

  const names = [
    'Validate Guides assembly decision',
    'Generate combined Guides sidebars offline',
    'Validate combined guides output',
    'Finalize Guides assembly identity',
  ]
  const indices = names.map(name => assemble.indexOf(`name: ${name}`))
  assert.equal(indices.every(index => index >= 0), true)
  assert.deepEqual([...indices].sort((a, b) => a - b), indices)
  const generation = assemble.slice(indices[1], indices[2])
  assert.match(generation, /node scripts\/docs-workflow\/generate-guides-sidebars\.js --media-manifest plugins\/lark-docs\/meta\/media-cache\/guides\.json/)
  assert.doesNotMatch(generation, /\n\s+if:/)
  assert.doesNotMatch(assemble, /npx docusaurus fetch-lark-docs[\s\S]*-sidebar/)
  const validation = assemble.slice(indices[0], indices[1])
  assert.match(validation, /decision-sha/)
  assert.match(validation, /guides-assembly-decision\.json/)
  assert.match(validation, /baseline\/config\/generated\/guides\.sidebar\.js|\$RUNNER_TEMP\/baseline[\s\S]*config\/generated\/guides\.sidebar\.js/)
  const finalValidation = assemble.slice(indices[2], indices[3])
  assert.match(finalValidation, /validate-generated-sidebars\.js/)
  assert.match(finalValidation, /run-doc-build-stage\.js --build "pnpm run build"/)
  const finalize = assemble.slice(indices[3], assemble.indexOf('name: Select promoted Guides source snapshot'))
  assert.match(finalize, /saas=config\/generated\/guides\.sidebar\.js[\s\S]*cmp -s[^\n]*\$saas/)
  assert.match(finalize, /byoc=config\/generated\/guides-byoc\.sidebar\.js[\s\S]*cmp -s[^\n]*\$byoc/)
  assert.match(finalize, /write-descriptor[\s\S]*--expected-decision-sha256/)
  assert.match(finalize, /verify-descriptor/)
  assert.match(finalize, /write-result[\s\S]*guides-assembly-result\.json/)
  assert.doesNotMatch(finalize, />\s*plugins\/lark-docs\/meta\/reports\/guides-assembly-decision\.json|--output plugins\/lark-docs\/meta\/reports\/guides-assembly-decision\.json/)
  assert.doesNotMatch(assemble, /if:.*reuse[\s\S]{0,200}(?:cp|copyFile).*config\/generated\/guides(?:-byoc)?\.sidebar\.js/)
  assert.doesNotMatch(assemble, /cp[^\n]*baseline[^\n]*config\/generated\/guides(?:-byoc)?\.sidebar\.js/)
  assert.match(sourceDecision, /git -C "\$RUNNER_TEMP\/baseline" rev-parse HEAD/)
  assert.match(source, /assembly_decision_sha256:/)
  assert.match(assemble, /^      assembly_decision_sha256: \{ required: true, type: string \}$/m)
  const caller = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  assert.match(caller, /produce_guides:[\s\S]*assembly_decision_sha256: \$\{\{ needs\.produce_guides_sources\.outputs\.assembly_decision_sha256 \}\}/)
})

test('reusable content publisher safely downloads, validates, and publishes checkpoints', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_publish-content-group.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'reusable content publisher workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /^name: publish docs content group$/m)
  assert.match(workflow, /^  workflow_call:$/m)
  for (const input of ['group', 'artifact_name', 'commit_message', 'should_publish', 'master_sha', 'validate_command', 'baseline_artifact_name', 'target_branch']) {
    assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  }
  assert.match(workflow, /validate_command:[\s\S]*default: node "\$GITHUB_WORKSPACE\/scripts\/validate-generated-sidebars\.js"/)
  assert.match(workflow, /baseline_artifact_name:[\s\S]*default: ''/)
  assert.match(workflow, /target_branch:[\s\S]*default: dev/)
  assert.match(workflow, /^  contents: write$/m)
  assert.doesNotMatch(workflow, /APP_ID|APP_SECRET|report-live-card|card_id|card_started_at|card_stages|card_mode/)
  assert.doesNotMatch(workflow, /^concurrency:/m)
  assert.match(workflow, /if: \$\{\{ inputs\.should_publish \}\}[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /actions\/download-artifact@v4[\s\S]*name: \$\{\{ inputs\.artifact_name \}\}/)
  assert.match(workflow, /publish batch \$\{number\} of \$\{count\}[\s\S]*publish translations[\s\S]*group\.commitMessage/)
  assert.match(workflow, /name: Download baseline artifact[\s\S]*if: \$\{\{ inputs\.should_publish && inputs\.baseline_artifact_name != '' \}\}[\s\S]*name: \$\{\{ inputs\.baseline_artifact_name \}\}[\s\S]*baseline-download/)
  assert.match(workflow, /extract_checkpoint_archive "\$DOWNLOAD_DIR\/checkpoint-group\.tar" "\$EXTRACT_DIR" "\$ARTIFACT_DIR" checkpoint[\s\S]*extract_checkpoint_archive "\$BASELINE_DOWNLOAD_DIR\/checkpoint-group\.tar" "\$BASELINE_EXTRACT_DIR" "\$BASELINE_DIR" baseline/)
  assert.match(workflow, /tar -tf "\$archive"[\s\S]*tar -tvf "\$archive"[\s\S]*checkpoint-group\.tar/)
  assert.match(workflow, /validate-checkpoint-artifact\.js[\s\S]*--group "\$GROUP"[\s\S]*--master-sha "\$MASTER_SHA"/)
  assert.match(workflow, /publish-checkpoint\.sh[\s\S]*--artifact "\$ARTIFACT_DIR"[\s\S]*--branch "\$TARGET_BRANCH"[\s\S]*--message "\$COMMIT_MESSAGE"[\s\S]*--max-attempts 10[\s\S]*--validate-command "\$VALIDATE_COMMAND"/)
  assert.match(workflow, /id: baseline_validation[\s\S]*validateCheckpointArtifact[\s\S]*manifest\.resolvedDir[\s\S]*payload[\s\S]*\.translation-cache\/ja-JP\.json[\s\S]*baseline_dir=/)
  assert.match(workflow, /BASELINE_PAYLOAD_DIR: \$\{\{ steps\.baseline_validation\.outputs\.baseline_dir \}\}[\s\S]*baseline_args=\(\)[\s\S]*baseline_args=\(--baseline-dir "\$BASELINE_PAYLOAD_DIR"\)[\s\S]*"\$\{baseline_args\[@\]\}"/)
  assert.match(workflow, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*status=failed[\s\S]*status=skipped[\s\S]*published[\s\S]*no_changes/)
  assert.match(workflow, /commit_sha=/)
  assert.match(workflow, /name: Fail unsuccessful publication[\s\S]*steps\.result\.outputs\.status == 'failed'/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/)
  assert.doesNotMatch(workflow, /git-auto-commit|git push[^\n]*--force/)
  const publicationBody = workflow.slice(workflow.indexOf('name: Publish checkpoint'))
  assert.doesNotMatch(publicationBody, /secrets\./)
})

test('Guides translation batches publish through one validated staging ref', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const translate = workflow.jobs.translate_guides_batches
  assert.equal(translate.strategy['max-parallel'], undefined)
  assert.equal(translate.uses, './.github/workflows/_translate-content-group.yml')
  const publish = workflow.jobs.publish_guides_translation_batches
  assert.ok(publish.needs.includes('translate_guides_batches'))
  assert.ok(publish.needs.includes('publish_rest'))
  assert.ok(publish.needs.includes('publish_guides'))
  assert.equal(publish.uses, './.github/workflows/_publish-translation-batches.yml')
  assert.equal(publish.with.source_commit_sha, '${{ needs.publish_guides.outputs.commit_sha || needs.prepare.outputs.dev_baseline_sha }}')
  assert.equal(publish.with.expected_target_sha, '${{ needs.publish_guides.outputs.commit_sha }}')

  const source = fs.readFileSync('.github/workflows/_publish-translation-batches.yml', 'utf8')
  const reusable = yaml.load(source)
  assert.equal(reusable.on.workflow_call.inputs.source_commit_sha.required, true)
  assert.equal(reusable.on.workflow_call.inputs.expected_target_sha.required, true)
  const steps = reusable.jobs.publish.steps
  const requiredNames = [
    'Validate Guides translation batch identities',
    'Apply Guides translation batches to staging',
    'Push Guides translation staging ref',
    'Validate combined Guides translation',
    'Promote validated Guides translation',
    'Clean up Guides translation staging ref',
    'Write Guides translation publication report',
    'Upload Guides translation publication report',
    'Emit Guides translation publication result',
  ]
  assert.deepEqual(steps.filter(step => requiredNames.includes(step.name)).map(step => step.name), requiredNames)
  for (const output of ['status', 'commit_sha', 'staging_ref', 'staging_sha', 'report_artifact_name']) {
    assert.equal(reusable.on.workflow_call.outputs[output].value, `\${{ jobs.publish.outputs.${output} }}`)
    assert.equal(reusable.jobs.publish.outputs[output], `\${{ steps.result.outputs.${output} }}`)
  }
  assert.equal(steps.find(step => step.name === 'Check out immutable master tooling').with.ref, '${{ inputs.master_sha }}')
  assert.equal(steps.find(step => step.name === 'Check out immutable master tooling').with['fetch-depth'], 0)
  const capture = steps.find(step => step.name === 'Capture Guides translation publication identities')
  const initialize = steps.find(step => step.name === 'Initialize Guides translation publisher')
  assert.match(initialize.run, /! -L "\$trusted_root"[\s\S]*realpath -e -- "\$trusted_root"[\s\S]*stat -c '%u' -- "\$trusted_root"[\s\S]*id -u/)
  assert.match(capture.run, /createInitialPublisherState/)
  assert.match(capture.run, /SOURCE_COMMIT_SHA[\s\S]*EXPECTED_TARGET_SHA/)
  assert.match(capture.run, /refs\/remotes\/origin\/\$TARGET_BRANCH\^\{commit\}[\s\S]*EXPECTED_TARGET_SHA/)
  assert.ok(steps.indexOf(capture) < steps.findIndex(step => step.name === 'Download Guides translation checkpoints'))

  const byName = new Map(steps.map(step => [step.name, step]))
  const orchestration = fs.readFileSync('scripts/docs-workflow/translation-staging-publisher.js', 'utf8')
  const identities = byName.get(requiredNames[0]).run
  assert.match(identities, /translation-batch-set\.js plan/)
  assert.match(identities, /PAIRS_MANIFEST/)
  assert.match(identities, /expected-target-sha/)
  assert.match(identities, /source-checkpoint-sha/)
  assert.match(identities, /tar -tf[\s\S]*tar -tvf/)
  assert.match(initialize.run, /mkdir -m 700/)
  assert.match(identities, /bindPublisherBatchIdentity/)
  assert.match(identities, /find "\$result_root" -mindepth 1 -maxdepth 1[\s\S]*! -L "\$result_root\/checkpoint-group\.tar"/)
  assert.doesNotMatch(identities, /git fetch/)

  const apply = byName.get(requiredNames[1]).run
  assert.match(apply, /translation-staging-publisher[\s\S]*applyPhase/)
  assert.match(orchestration, /prepareStagingWorktree[\s\S]*applyTranslationBatch[\s\S]*commitAppliedBatch/)

  const push = byName.get(requiredNames[2]).run
  assert.match(push, /translation-staging-publisher[\s\S]*pushPhase/)
  assert.match(orchestration, /deterministicStagingRef[\s\S]*pushStagingRef[\s\S]*probeRemoteStaging/)
  assert.match(push, /GITHUB_RUN_ID[\s\S]*GITHUB_RUN_ATTEMPT/)

  const validate = byName.get(requiredNames[3]).run
  assert.match(validate, /restore-generated-state\.sh --exact --ref "\$staged_sha"/)
  assert.match(validate, /validate-guides-translation-staging\.js[\s\S]*--trusted-root/)
  assert.match(validate, /recordValidationInfrastructureFailure/)
  assert.doesNotMatch(validate, /validate-generated-sidebars|validate-translated-coverage|pnpm run build/)

  assert.match(byName.get(requiredNames[4]).run, /status === 'no_changes'[\s\S]*promotePhase/)
  assert.match(orchestration, /promoteStaging[\s\S]*probeRemoteTarget/)
  assert.equal(byName.get(requiredNames[5]).if, '${{ always() }}')
  assert.match(byName.get(requiredNames[5]).run, /cleanupPhase/)
  assert.match(orchestration, /deleteStagingWithLease/)
  assert.equal(byName.get(requiredNames[6]).if, '${{ always() }}')
  assert.match(byName.get(requiredNames[6]).run, /createTerminalReport[\s\S]*writePublicationReport[\s\S]*trustedRoot/)
  assert.equal(byName.get(requiredNames[7]).if, '${{ always() }}')
  assert.equal(byName.get(requiredNames[7]).with.name, 'docs-translation-publication-guides-${{ github.run_id }}-${{ github.run_attempt }}')
  assert.equal(byName.get(requiredNames[7]).with.path, '${{ runner.temp }}/guides-translation-publication/publication-report.json')
  assert.equal(byName.get(requiredNames[8]).if, '${{ always() }}')
  assert.match(byName.get(requiredNames[8]).run, /readPublicationReport[\s\S]*status[\s\S]*commit_sha[\s\S]*staging_ref[\s\S]*staging_sha[\s\S]*report_artifact_name/)

  for (const step of steps.filter(step => typeof step.run === 'string')) {
    const syntax = spawnSync('bash', ['-n'], { input: step.run, encoding: 'utf8' })
    assert.equal(syntax.status, 0, `${step.name || step.id || 'unnamed'}: ${syntax.stderr}`)
  }
  assert.doesNotMatch(source, /publish-checkpoint\.sh|--max-attempts|tee [^\n]*publication|sed -n 's\/\^status|git push[^\n]*--force(?:\s|$)|APP_ID|APP_SECRET|FEISHU|report-live-card/)
  assert.doesNotMatch(source, /for \(\(number=1; number<=BATCH_COUNT; number\+\+\)\)[\s\S]*git push/)
  assert.match(orchestration, /status: 'no_changes'[\s\S]*resultSha: state\.expectedTargetSha/)

  assert.equal(workflow.jobs.verify.uses, './.github/workflows/_verify-docs.yml')
  assert.ok(workflow.jobs.verify.needs.includes('resolve_final'))
})

test('workflow policy rejects unsafe Guides staging publisher mutations', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const workflowName = '_publish-translation-batches.yml'
  const cases = [
    {
      mutate(workflow) { workflow.on.workflow_call.inputs.source_commit_sha.required = false },
      expected: `${workflowName}: publisher must require authenticated source and target identities`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Capture Guides translation publication identities').run = 'true' },
      expected: `${workflowName}: publisher must authenticate and persist source and target identities before artifact download`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Promote validated Guides translation').run = workflow.jobs.publish.steps.find(step => step.name === 'Promote validated Guides translation').run.replace("if (state.status === 'no_changes') process.exit(0)\n", '') },
      expected: `${workflowName}: publisher must skip no-change promotion and otherwise use the normal fast-forward staging helper`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Clean up Guides translation staging ref').if = '${{ success() }}' },
      expected: `${workflowName}: cleanup, report, upload, and result steps must always run`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Promote validated Guides translation').run += '\nbash scripts/docs-workflow/publish-checkpoint.sh' },
      expected: `${workflowName}: staging publisher must not use legacy or per-batch publication`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Promote validated Guides translation').run += '\ngit push --force origin HEAD:dev' },
      expected: `${workflowName}: staging publisher must not force-update the target`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Validate combined Guides translation').run += '\npnpm run build' },
      expected: `${workflowName}: combined staging validation must run only through the fixed validation wrapper`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Write Guides translation publication report').env = { APP_SECRET: '${{ secrets.APP_SECRET }}' } },
      expected: `${workflowName}: staging publisher must not receive Feishu credentials`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Emit Guides translation publication result').run += "\nsed -n 's/^status=//p' output.log" },
      expected: `${workflowName}: staging publisher must not derive state from logs`,
    },
    {
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Push Guides translation staging ref').name = 'Push translation' },
      expected: `${workflowName}: required staging publisher steps are missing or out of order`,
    },
  ]
  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'staging-publisher-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, workflowName)
      const workflow = yaml.load(fs.readFileSync(file, 'utf8'))
      fixture.mutate(workflow)
      fs.writeFileSync(file, yaml.dump(workflow, { lineWidth: -1, noRefs: true }))
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('translation publishers form a short queue with scoped validation', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const groups = ['python', 'java', 'node', 'go', 'cli', 'rest']
  for (const [index, group] of groups.entries()) {
    const job = workflow.jobs[`publish_${group}_translation`]
    const predecessor = index === 0 ? 'publish_guides_translation_batches' : `publish_${groups[index - 1]}_translation`
    assert.ok(job.needs.includes(predecessor))
    assert.equal(job.with.validate_command, `node "$GITHUB_WORKSPACE/scripts/validate-generated-sidebars.js" && node "$GITHUB_WORKSPACE/scripts/validate-translated-coverage.js" --group "${group}"`)
  }
})

test('reusable translation producer creates group-scoped checkpoint artifacts without publishing', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  const workflow = yaml.load(source)
  const steps = workflow.jobs.translate.steps
  const numbered = steps.find(step => step.name === 'Validate translated batch outputs')
  const unbatched = steps.find(step => step.name === 'Validate unbatched translated group')
  const checkpoint = steps.find(step => step.name === 'Create validated translation checkpoints')

  for (const input of ['group', 'source_commit_sha', 'master_sha', 'should_translate']) assert.match(source, new RegExp(`^      ${input}:`, 'm'))
  for (const output of ['status', 'artifact_name', 'baseline_artifact_name', 'translated_count']) assert.match(source, new RegExp(`^      ${output}:`, 'm'))
  assert.match(source, /^  contents: read$/m)
  assert.match(source, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(source, /restore-generated-state\.sh --exact --ref "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/)
  assert.match(source, /applySourceDelta\.js --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/)
  assert.match(source, /manifest\.js[\s\S]*--group "\$GROUP"[\s\S]*--source-checkpoint-sha "\$SOURCE_COMMIT_SHA"[\s\S]*--source-delta tmp\/source-delta\.json/)
  assert.match(source, /steps\.source_delta\.outputs\.has_mutation == 'true'/)
  assert.match(source, /\(steps\.agents\.outputs\.failed_count \|\| '0'\) != '0'/)
  assert.match(source, /agentRunner\.js[\s\S]*TRANSLATION_ALLOW_PARTIAL: "true"/)

  assert.ok(numbered, 'numbered Guides batches need a dedicated local-output validation step')
  assert.match(numbered.if, /inputs\.should_translate/)
  assert.match(numbered.if, /inputs\.group == 'guides'/)
  assert.match(numbered.if, /inputs\.batch_number > 0/)
  assert.match(numbered.if, /steps\.agents\.outputs\.translated_count \|\| '0'/)
  assert.match(numbered.if, /steps\.agents\.outputs\.failed_count \|\| '0'/)
  assert.match(numbered.if, /steps\.source_delta\.outputs\.has_mutation == 'true'/)
  assert.doesNotMatch(numbered.run, /mdx-parse|validate-translated-coverage|pnpm run build/)
  assert.match(numbered.run, /translation-batch-input\.js validate --input tmp\/translation-batch-input\.json/)
  assert.match(numbered.run, /validate-translation-batch-outputs\.js[\s\S]*--manifest tmp\/translation-manifest\.json[\s\S]*--report tmp\/translation-report\.json[\s\S]*--batch-input tmp\/translation-batch-input\.json[\s\S]*--workspace "\$GITHUB_WORKSPACE"[\s\S]*--agents-outcome "\$AGENTS_OUTCOME"[\s\S]*--translated-count "\$TRANSLATED_COUNT"[\s\S]*--failed-count "\$FAILED_COUNT"[\s\S]*--remaining-count "\$REMAINING_COUNT"/)

  assert.ok(unbatched, 'unbatched translations need their existing full validation')
  assert.match(unbatched.if, /inputs\.batch_number == 0/)
  assert.match(unbatched.if, /steps\.agents\.outputs\.failed_count \|\| '0'/)
  assert.match(unbatched.run, /mdx-parse/)
  assert.match(unbatched.run, /validate-translated-coverage\.js --group "\$GROUP"/)
  assert.match(unbatched.run, /pnpm run build/)

  assert.match(checkpoint.run, /--include-translation-cache/)
  assert.match(checkpoint.run, /validate-checkpoint-artifact\.js --artifact "\$BASELINE_CHECKPOINT_DIR"/)
  assert.match(checkpoint.run, /validate-checkpoint-artifact\.js --artifact "\$CHECKPOINT_DIR"/)
  assert.match(checkpoint.run, /if \(\( \$\{\{ inputs\.batch_number \}\} > 0 \)\) && \[\[ "\$GROUP" == guides \]\]; then[\s\S]*validate-translation-batch\.js[\s\S]*--artifact "\$CHECKPOINT_DIR"[\s\S]*--baseline "\$BASELINE_CHECKPOINT_DIR"[\s\S]*--batch-number "\$\{\{ inputs\.batch_number \}\}"[\s\S]*--batch-count "\$\{\{ inputs\.batch_count \}\}"[\s\S]*\n\s*fi/)

  assert.match(source, /translation-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(source, /translation-baseline-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(source, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}/)
  for (const status of ['translation_ready', 'no_changes', 'failed']) assert.match(source, new RegExp(`status=${status}`))
  assert.doesNotMatch(source, /git push|git-auto-commit|contents: write/)
})

test('workflow policy rejects numbered translation batch validation regressions', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const workflowName = '_translate-content-group.yml'
  const cases = [
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += '\nnode scripts/validate-translated-coverage.js --group "$GROUP"' },
      expected: `${workflowName}: numbered Guides batches must not run full-tree translated coverage`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').if = "${{ inputs.should_translate && inputs.group == 'guides' && (inputs.batch_number > 0 || inputs.batch_number == 0) && (steps.agents.outputs.translated_count != '0' || steps.source_delta.outputs.has_mutation == 'true') }}" },
      expected: `${workflowName}: numbered Guides batches must use the dedicated mutation-aware local validation step`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate unbatched translated group').if = '${{ inputs.should_translate }}' },
      expected: `${workflowName}: full translated validation must be restricted to unbatched runs`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate unbatched translated group').if = '${{ inputs.should_translate && (inputs.batch_number == 0 || inputs.batch_number > 0) }}' },
      expected: `${workflowName}: full translated validation must be restricted to unbatched runs`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run = 'node scripts/docs-workflow/translation-batch-input.js validate --input tmp/translation-batch-input.json' },
      expected: `${workflowName}: numbered Guides batches must validate agent report evidence and exact candidate output files`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Create validated translation checkpoints').run = steps.find(step => step.name === 'Create validated translation checkpoints').run.replace(/\n\s*node scripts\/docs-workflow\/validate-translation-batch\.js[\s\S]*?--batch-count "\$\{\{ inputs\.batch_count \}\}"/, '') },
      expected: `${workflowName}: numbered Guides checkpoints must validate baseline/result pair identity`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Create validated translation checkpoints').run += '\npnpm run build' },
      expected: `${workflowName}: checkpoint build attestation must remain restricted to unbatched runs`,
    },
    {
      mutate(steps) {
        const step = steps.find(item => item.name === 'Create validated translation checkpoints')
        step.run = step.run.replace(
          'if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi',
          '# if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi',
        )
      },
      expected: `${workflowName}: checkpoint build attestation must remain restricted to unbatched runs`,
    },
    {
      mutate(steps) {
        const step = steps.find(item => item.name === 'Create validated translation checkpoints')
        step.run = step.run.replace(
          'if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi',
          'cat <<\'ATTESTATION\'\nif (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi\nATTESTATION',
        )
      },
      expected: `${workflowName}: checkpoint build attestation must remain restricted to unbatched runs`,
    },
    {
      mutate(steps) {
        const step = steps.find(item => item.name === 'Create validated translation checkpoints')
        step.run = step.run.replace(
          'if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi',
          'echo \'if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi\'',
        )
      },
      expected: `${workflowName}: checkpoint build attestation must remain restricted to unbatched runs`,
    },
    {
      mutate(steps) {
        const step = steps.find(item => item.name === 'Create validated translation checkpoints')
        step.run = step.run.replace(
          'if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi',
          '\'if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi\'',
        )
      },
      expected: `${workflowName}: checkpoint build attestation must remain restricted to unbatched runs`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += '\nnpx docusaurus build' },
      expected: `${workflowName}: full validation and build commands must exist only in the exact unbatched validation path`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Create validated translation checkpoints').run += '\nnpm run build' },
      expected: `${workflowName}: checkpoint build attestation must remain restricted to unbatched runs`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Run translation agents').run += '\nyarn build' },
      expected: `${workflowName}: full validation and build commands must exist only in the exact unbatched validation path`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += '\npnpm exec docusaurus build' },
      expected: `${workflowName}: full validation and build commands must exist only in the exact unbatched validation path`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += '\ndocusaurus build' },
      expected: `${workflowName}: full validation and build commands must exist only in the exact unbatched validation path`,
    },
    ...[
      'npm --prefix . run build',
      'pnpm --dir . run build',
      'yarn --cwd . build',
      'npx -p @docusaurus/core docusaurus build',
    ].map(command => ({
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += `\n${command}` },
      expected: `${workflowName}: full validation and build commands must exist only in the exact unbatched validation path`,
    })),
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'numbered-translation-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, workflowName)
      const workflow = yaml.load(fs.readFileSync(file, 'utf8'))
      fixture.mutate(workflow.jobs.translate.steps)
      fs.writeFileSync(file, yaml.dump(workflow, { lineWidth: -1, noRefs: true }))
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('durable translation batch preparation uses the same source delta as batch execution', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_prepare-translation-batches.yml'), 'utf8')
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/)
  assert.match(workflow, /manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/)
})

test('manual translation wrapper calls reusable translation then publisher without legacy automation', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/translate-codex.yml'), 'utf8')
  assert.doesNotMatch(workflow, /workflow_run|git-auto-commit|git push/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /uses: \.\/.github\/workflows\/_translate-content-group\.yml/)
  assert.match(workflow, /uses: \.\/.github\/workflows\/_publish-content-group\.yml/)
  assert.match(workflow, /baseline_artifact_name: \$\{\{ needs\.translate\.outputs\.baseline_artifact_name \}\}/)
  assert.doesNotMatch(workflow, /secrets: inherit/)
  assert.match(workflow, /secrets:\n      TRANSLATION_AGENT_API_KEY: \$\{\{ secrets\.TRANSLATION_AGENT_API_KEY \}\}\n      REVIEW_AGENT_API_KEY: \$\{\{ secrets\.REVIEW_AGENT_API_KEY \}\}/)
  assert.match(workflow, /commit_message: "\$\{\{ inputs\.group == 'guides' && 'i18n\(guides\): publish translations'[\s\S]*'i18n\(rest\): publish translations' \}\}"/)
  assert.match(workflow, /TARGET_BRANCH_INPUT: \$\{\{ inputs\.target_branch \}\}/)
  const resolverStep = workflow.slice(workflow.indexOf('- id: refs'), workflow.indexOf('  translate:'))
  const resolver = resolverStep.slice(resolverStep.indexOf('        run: |'))
  assert.doesNotMatch(resolver, /\$\{\{ inputs\.target_branch \}\}/)
  assert.match(resolver, /git check-ref-format --branch "\$target_branch"/)
  assert.match(resolver, /"\$target_branch" == -\*/)
  assert.match(resolver, /"\$target_branch" == \*:\*/)
  assert.match(resolver, /refs\/heads\/\$target_branch:refs\/remotes\/origin\/\$target_branch/)
  assert.match(resolver, /git rev-parse "refs\/remotes\/origin\/\$target_branch"/)
  assert.doesNotMatch(resolver, /inputs\.target_branch|\$\{\{[^\n]*target_branch/)
  assert.match(resolver, /\*\$'\\n'\*|\*\$'\\r'\*/)
})
