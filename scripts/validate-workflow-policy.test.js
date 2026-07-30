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

test('docs ingestion watchdog is read-only and preserves evaluator failures after alerting', () => {
  const file = '.github/workflows/docs-ingestion-watchdog.yml'
  const source = fs.readFileSync(file, 'utf8')
  const workflow = yaml.load(source)
  assert.deepEqual(workflow.permissions, { actions: 'read', contents: 'read' })
  assert.match(source, /node scripts\/docs-workflow\/docs-ingestion-watchdog\.js[\s\S]*--repository "\$GITHUB_REPOSITORY"[\s\S]*--output tmp\/docs-ingestion-watchdog\.json/)
  assert.match(source, /continue-on-error: true[\s\S]*docs-ingestion-watchdog\.js/)
  assert.match(source, /if-no-files-found: error/)
  assert.match(source, /report-card create[\s\S]*report-card note --file[\s\S]*report-card finish/)
  assert.match(source, /if \[ "\$WATCHDOG_OUTCOME" != "success" \][\s\S]*exit 1/)
  assert.doesNotMatch(source, /git push|workflow_dispatches|gh workflow run|fetch-lark-docs|deploy|contents: write|actions: write/)
})

test('workflow policy rejects writable or non-failing docs ingestion watchdog mutations', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const original = fs.readFileSync(path.join(sourceDirectory, 'docs-ingestion-watchdog.yml'), 'utf8')
  const cases = [
    original.replace('contents: read', 'contents: write'),
    original.replace('exit 1', 'echo ignored'),
    `${original}\n# forbidden mutation\n# git push origin HEAD:dev\n`,
  ]
  for (const source of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'watchdog-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      fs.writeFileSync(path.join(directory, 'docs-ingestion-watchdog.yml'), source)
      assert.ok(validateWorkflowPolicies(directory).some(error => error.startsWith('docs-ingestion-watchdog.yml:')))
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('translation workflows declare immutable target identity and exact target validation', () => {
  const reusableFiles = [
    '_prepare-translation-batches.yml',
    '_translate-content-group.yml',
    '_translate-publish-batch.yml',
    '_publish-translation-batches.yml',
  ]
  for (const file of reusableFiles) {
    const workflow = yaml.load(fs.readFileSync(path.join('.github/workflows', file), 'utf8'))
    const inputs = workflow.on.workflow_call.inputs
    for (const input of ['target', 'tooling_sha', 'source_sha']) {
      assert.equal(inputs[input]?.required, true, `${file} must require ${input}`)
    }
  }
  const publisherInputs = yaml.load(fs.readFileSync('.github/workflows/_publish-content-group.yml', 'utf8')).on.workflow_call.inputs
  for (const input of ['target', 'tooling_sha', 'source_sha']) assert.ok(publisherInputs[input], `_publish-content-group.yml must declare ${input}`)

  const wrapper = yaml.load(fs.readFileSync('.github/workflows/translate-content.yml', 'utf8'))
  assert.deepEqual(wrapper.on.workflow_dispatch.inputs.target.options, ['ja-JP', 'zh-CN-reference', 'zh-CN-tools'])
  assert.equal(wrapper.on.workflow_dispatch.inputs.tooling_sha?.required, true)
  assert.equal(wrapper.on.workflow_dispatch.inputs.source_ref?.default, 'dev')
  for (const input of ['tooling_sha', 'source_sha']) assert.equal(wrapper.on.workflow_call.inputs[input]?.required, true)
  assert.equal(wrapper.concurrency, undefined)
  const wrapperSource = fs.readFileSync('.github/workflows/translate-content.yml', 'utf8')
  assert.ok(wrapperSource.indexOf('name: Validate immutable translation identities') < wrapperSource.indexOf('uses: actions/checkout@v4'))
  assert.match(wrapperSource, /ref: ['"]?\$\{\{ inputs\.tooling_sha \}\}['"]?/)
  assert.match(wrapperSource, /validate-mdx --path content\/zh-CN\/reference --check/)
  assert.doesNotMatch(wrapperSource, /refs\/remotes\/origin\/(?:master|\$TARGET_BRANCH)|REQUESTED_(?:TOOLING|SOURCE)_SHA|git rev-parse .*TARGET_BRANCH/)

  const compatibility = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  assert.deepEqual(compatibility.on.workflow_dispatch.inputs.target.options, ['ja-JP', 'zh-CN-reference', 'zh-CN-tools'])
  assert.deepEqual(compatibility.on.workflow_dispatch.inputs.group.options, ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest', 'tools', 'reference-landings'])
  for (const input of ['target', 'group', 'tooling_sha', 'source_sha']) assert.equal(compatibility.on.workflow_dispatch.inputs[input]?.required, true)
  assert.equal(compatibility.jobs.translate.with.target, '${{ inputs.target }}')
  assert.equal(compatibility.jobs.translate.with.tooling_sha, '${{ inputs.tooling_sha }}')
  assert.equal(compatibility.jobs.translate.with.source_sha, '${{ inputs.source_sha }}')
  const compatibilitySource = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')
  assert.match(compatibilitySource, /ja-JP\) \[\[ "\$INPUT_GROUP" =~ \^\(guides\|python\|java\|node\|go\|cli\|rest\)\$ \]\] ;;/)
  assert.match(compatibilitySource, /zh-CN-reference\) \[\[ "\$INPUT_GROUP" =~ \^\(python\|java\|node\|go\|cli\|rest\|reference-landings\)\$ \]\] ;;/)
  assert.match(compatibilitySource, /zh-CN-tools\) \[\[ "\$INPUT_GROUP" == tools \]\] ;;/)
  const source = fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8')
  assert.match(source, /validate-mdx --path i18n\/ja-JP[\s\S]*validate-translation --target ja-JP[\s\S]*build:en/)
  for (const landing of [
    'content/zh-CN/reference/api/python/python/python.md',
    'content/zh-CN/reference/api/java/java/java.md',
    'content/zh-CN/reference/api/nodejs/nodejs/nodejs.md',
    'content/zh-CN/reference/api/go/go/go.md',
    'content/zh-CN/reference/cli/cli/Overview.md',
  ]) {
    assert.ok(source.includes(`validate-mdx --path ${landing} --write`))
  }
  assert.match(source, /validate-mdx --path content\/zh-CN\/reference --check[\s\S]*reference-manifest --source content\/en\/reference --target content\/zh-CN\/reference --source-commit "\$SOURCE_COMMIT_SHA" --write[\s\S]*validate-reference --site zh-CN[\s\S]*build:zh-CN/)
  assert.doesNotMatch(source, /validate-mdx --path content\/zh-CN\/reference --write/)
  assert.match(source, /validate-mdx --path content\/zh-CN\/guides\/tutorials\/tools[\s\S]*validate-translation --target zh-CN-tools --group tools[\s\S]*validate-tools-sidebar[\s\S]*build:zh-CN/)
  assert.match(source, /applySourceDelta\.js --target "\$TRANSLATION_TARGET" --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/)
  for (const name of [
    'ZDOC_PROVENANCE_CANDIDATE_TARGET',
    'ZDOC_PROVENANCE_CANDIDATE_TOOLING_SHA',
    'ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA',
  ]) {
    assert.equal(
      yaml.load(source).jobs.translate.steps.find(step => step.name === 'Validate unbatched translated group').env[name],
      name.endsWith('TARGET') ? '${{ inputs.target }}' : name.endsWith('TOOLING_SHA') ? '${{ inputs.tooling_sha }}' : '${{ inputs.source_sha }}',
    )
  }

  const publisher = yaml.load(fs.readFileSync('.github/workflows/_publish-content-group.yml', 'utf8'))
  const publisherStep = publisher.jobs.publish.steps.find(step => step.name === 'Publish checkpoint')
  assert.equal(publisherStep.env.ZDOC_PROVENANCE_CANDIDATE_TARGET, '${{ inputs.target }}')
  assert.equal(publisherStep.env.ZDOC_PROVENANCE_CANDIDATE_TOOLING_SHA, '${{ inputs.tooling_sha }}')
  assert.equal(publisherStep.env.ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA, '${{ inputs.source_sha }}')
})

test('candidate provenance authorization is absent from Docker and general site validation builds', () => {
  for (const file of ['deploy/en/Dockerfile', 'deploy/zh-CN/Dockerfile', '.github/workflows/site-validation.yml']) {
    const source = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /ZDOC_PROVENANCE_CANDIDATE_/u, `${file} must retain strict tracked-input provenance`)
  }
})

test('source publication workflows require site-owned publish-group contracts', () => {
  for (const file of ['_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml']) {
    const source = fs.readFileSync(path.join('.github/workflows', file), 'utf8')
    const workflow = yaml.load(source)
    assert.equal(workflow.on.workflow_call.inputs.site.required, true, `${file} must require site`)
    assert.match(source, /pnpm docs-tooling publish-group --site/, `${file} must use publish-group`)
    assert.doesNotMatch(source, /run-content-group\.js|config\/generated|(?:^|[\s"'])docs\/tutorials|(?:^|[\s"'])docs-byoc(?:\/|[\s"'])|(?:^|[\s"'])reference\/api/, `${file} must not use legacy publication roots`)
  }
})

test('workflow policy rejects Chinese source publication collisions with protected Tools ownership', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'tools-source-collision-'))
  try {
    fs.cpSync(sourceDirectory, directory, {recursive: true})
    const file = path.join(directory, '_fetch-content-group.yml')
    fs.appendFileSync(file, '\n# content/zh-CN/guides/tutorials/tools/forbidden.md\n')
    assert.ok(validateWorkflowPolicies(directory).includes('_fetch-content-group.yml: source publication workflow must not claim Chinese Tools protected paths'))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('workflow policy rejects missing or miswired site-validation Tools validators', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      from: 'pnpm docs-tooling validate-translation --target zh-CN-tools --group tools',
      to: 'pnpm docs-tooling validate-translation --target zh-CN-reference --group tools',
    },
    {
      from: 'pnpm docs-tooling validate-tools-sidebar',
      to: 'pnpm docs-tooling validate-reference --site zh-CN',
    },
  ]
  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'site-tools-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const file = path.join(directory, 'site-validation.yml')
      const source = fs.readFileSync(file, 'utf8')
      assert.ok(source.includes(fixture.from), `site-validation.yml must contain ${fixture.from}`)
      fs.writeFileSync(file, source.replace(fixture.from, fixture.to))
      assert.ok(validateWorkflowPolicies(directory).includes('site-validation.yml: Chinese Tools coverage must run exact translation and sidebar validators'))
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('workflow policy requires localization inventory freshness before both site builds', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'inventory-freshness-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, {recursive: true})
    const file = path.join(directory, 'site-validation.yml')
    const source = fs.readFileSync(file, 'utf8')
    const withEnglishOnly = source.replace(
      '      - run: pnpm check:localization-input-inventory\n      - run: pnpm docs-tooling validate-reference --site zh-CN\n      - run: pnpm build:zh-CN',
      '      - run: pnpm docs-tooling validate-reference --site zh-CN\n      - run: pnpm build:zh-CN',
    )
    assert.notEqual(withEnglishOnly, source)
    fs.writeFileSync(file, withEnglishOnly)
    assert.ok(validateWorkflowPolicies(directory).includes('site-validation.yml: both site builds must check the localization input inventory before building'))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('workflow policy requires Chinese Reference validation before the build and in focused coverage', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const validSource = fs.readFileSync(path.join(sourceDirectory, 'site-validation.yml'), 'utf8')
  assert.match(validSource, /pnpm docs-tooling validate-reference --site zh-CN[\s\S]*pnpm build:zh-CN/)
  const cases = [
    validSource.replace(
      '      - run: pnpm docs-tooling validate-reference --site zh-CN\n      - run: pnpm build:zh-CN',
      '      - run: pnpm build:zh-CN',
    ),
    validSource.replace(
      '      - run: pnpm docs-tooling validate-reference --site zh-CN\n\n  tools_coverage:',
      '      - run: echo missing focused Reference validation\n\n  tools_coverage:',
    ),
  ]
  for (const mutated of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'site-reference-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      fs.writeFileSync(path.join(directory, 'site-validation.yml'), mutated)
      assert.ok(validateWorkflowPolicies(directory).includes('site-validation.yml: Chinese Reference validation must run before the Chinese build and in focused coverage'))
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('workflow policy rejects Task 8 translation safety mutations', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    ...[
      'git push -f origin HEAD:dev',
      'git push origin -f HEAD:dev',
      'git push --force origin HEAD:dev',
      'git push --force-with-lease origin HEAD:dev',
    ].map(command => ({
      file: 'translate-content.yml',
      mutate: source => `${source}\n# mutation\n# ${command}\nrun: ${command}\n`,
      expected: 'translate-content.yml: force-pushing generated documentation can discard concurrent updates',
    })),
    {
      file: '_translate-content-group.yml',
      mutate: source => source.replace('ref: ${{ inputs.tooling_sha }}', 'ref: master'),
      expected: '_translate-content-group.yml: translation tooling checkout must use exact inputs.tooling_sha',
    },
    {
      file: '_translate-content-group.yml',
      mutate: source => source.replace('          ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA: ${{ inputs.source_sha }}\n', ''),
      expected: '_translate-content-group.yml: candidate provenance must receive exact target, tooling, and source identities only in unbatched validation',
    },
    {
      file: '_translate-content-group.yml',
      mutate: source => source.replace('applySourceDelta.js --target "$TRANSLATION_TARGET"', 'applySourceDelta.js'),
      expected: '_translate-content-group.yml: source delta application must receive the exact translation target',
    },
    {
      file: 'translate-content.yml',
      mutate: source => source.replace("ref: '${{ inputs.tooling_sha }}'", 'ref: master'),
      expected: 'translate-content.yml: translation tooling checkout must use exact inputs.tooling_sha',
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('target: ${{ inputs.target }}', 'target: ja-JP'),
      expected: 'translate-codex.yml: compatibility boundary must expose and forward the selected translation target',
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('zh-CN-tools) [[ "$INPUT_GROUP" == tools ]] ;;', 'zh-CN-tools) true ;;'),
      expected: 'translate-codex.yml: compatibility boundary must enforce exact target and group pairings',
    },
    {
      file: '_publish-content-group.yml',
      mutate: source => source.replace('name: Check out immutable translation tooling\n        if:', 'name: Check out immutable translation tooling\n        if:').replace('ref: ${{ inputs.tooling_sha }}', 'ref: ${{ inputs.master_sha }}'),
      expected: '_publish-content-group.yml: must check out exact translation tooling and separate source tooling',
    },
    {
      file: '_publish-content-group.yml',
      mutate: source => source.replace('          ZDOC_PROVENANCE_CANDIDATE_TOOLING_SHA: ${{ inputs.tooling_sha }}\n', ''),
      expected: '_publish-content-group.yml: checkpoint validation must receive exact candidate provenance identities',
    },
    {
      file: '_translate-content-group.yml',
      mutate: source => source.replace('ja-JP)\n              pnpm docs-tooling', 'ja-JP)\n              test -f content/zh-CN/reference/forbidden.md\n              pnpm docs-tooling'),
      expected: '_translate-content-group.yml: ja-JP branch must not claim cross-target translation paths',
    },
    {
      file: '_translate-content-group.yml',
      mutate: source => source.replace('zh-CN-reference)\n              if [[ "$GROUP" == reference-landings ]]; then', 'zh-CN-reference)\n              test -f i18n/ja-JP/forbidden.md\n              if [[ "$GROUP" == reference-landings ]]; then'),
      expected: '_translate-content-group.yml: zh-CN-reference branch must not claim cross-target translation paths',
    },
    {
      file: '_translate-content-group.yml',
      mutate: source => source.replace('zh-CN-tools)\n              pnpm docs-tooling', 'zh-CN-tools)\n              test -f content/zh-CN/reference/forbidden.md\n              pnpm docs-tooling'),
      expected: '_translate-content-group.yml: zh-CN-tools branch must not claim cross-target translation paths',
    },
    ...[
      ['ja-JP', 'pnpm run build:zh-CN'],
      ['zh-CN-reference', 'pnpm run build:en'],
      ['zh-CN-tools', 'pnpm run build:en'],
    ].map(([target, command]) => ({
      file: '_translate-content-group.yml',
      mutate: source => {
        const firstCommand = target === 'zh-CN-reference' ? 'if [[ "$GROUP" == reference-landings ]]; then' : 'pnpm docs-tooling'
        return source.replace(`${target})\n              ${firstCommand}`, `${target})\n              ${command}\n              ${firstCommand}`)
      },
      expected: '_translate-content-group.yml: translation target branch contains a wrong-site build',
    })),
    {
      file: 'translate-content.yml',
      mutate: source => source.replace('pnpm run build:zh-CN\' || \'pnpm docs-tooling validate-mdx --path content/zh-CN/guides', 'pnpm run build:zh-CN && pnpm run build:en\' || \'pnpm docs-tooling validate-mdx --path content/zh-CN/guides'),
      expected: 'translate-content.yml: target publication must use the exact target-owned validation and build command',
    },
  ]
  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'task8-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const file = path.join(directory, fixture.file)
      const before = fs.readFileSync(file, 'utf8')
      const after = fixture.mutate(before)
      assert.notEqual(after, before, `${fixture.file} mutation must change source`)
      fs.writeFileSync(file, after)
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally { fs.rmSync(directory, {recursive: true, force: true}) }
  }
})

test('jobs that execute docs-tooling use its supported Node runtime', () => {
  const requirements = [
    ['check-404.yml', 'Check-404'],
    ['_translate-content-group.yml', 'translate'],
    ['fetch-docs.yml', 'prepare'],
    ['fetch-docs.yml', 'finalize_card_fallback'],
    ['_monitor-docs-progress.yml', 'monitor'],
    ['_verify-docs.yml', 'verify'],
    ['_publish-translation-batches.yml', 'publish'],
  ]
  for (const [file, jobName] of requirements) {
    const workflow = yaml.load(fs.readFileSync(path.join('.github/workflows', file), 'utf8'))
    const setup = workflow.jobs[jobName].steps.find(step => String(step.uses || '').startsWith('actions/setup-node@'))
    const version = String(setup?.with?.['node-version'] || '')
    assert.ok(version === '22' || /^22\.(?:[6-9]|[1-9][0-9])(?:\.|$)/.test(version), `${file}:${jobName} must use Node 22.6 or newer`)
  }
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
    {
      token: 'docs-validation.XXXXXX',
      expected: 'publish-checkpoint.sh: checkpoint publisher must validate with pinned tooling',
    },
    {
      token: 'restore-generated-state.sh" --exact --ref "$target_sha"',
      expected: 'publish-checkpoint.sh: checkpoint publisher must materialize the exact target state for validation',
    },
    {
      token: 'cd "$validation_worktree" && bash -o errexit',
      expected: 'publish-checkpoint.sh: checkpoint publisher must run validation in the pinned tooling worktree',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'publisher-policy-'))
    const publisherPath = path.join(directory, 'publish-checkpoint.sh')
    try {
      assert.ok(publisherSource.includes(fixture.token))
      fs.writeFileSync(publisherPath, publisherSource.replace(fixture.token, 'REMOVED_POLICY_TOKEN'))
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

test('all paid translation waits for successful selected source publication', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']
  const barrier = workflow.jobs.source_publication_barrier
  assert.deepEqual(barrier.needs, ['prepare', ...groups.map(group => `publish_${group}`)])
  assert.match(barrier.if, /always\(\).*needs\.prepare\.outputs\.publish == 'true'/)
  assert.equal(barrier.steps.at(-1).run, 'node scripts/docs-workflow/source-publication-barrier.js')
  const paidJobs = [
    'translate_guides_batches',
    ...['python', 'java', 'node', 'go', 'cli', 'rest'].map(group => `translate_${group}`),
    ...['python', 'java', 'node', 'go', 'cli', 'rest'].map(group => `translate_${group}_zh_reference`),
    'translate_guides_zh_tools',
  ]
  for (const jobName of paidJobs) {
    const job = workflow.jobs[jobName]
    const needs = Array.isArray(job.needs) ? job.needs : [job.needs]
    assert.equal(needs.includes('source_publication_barrier'), true, jobName)
    assert.match(job.if, /needs\.source_publication_barrier\.result == 'success'/, jobName)
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
  assert.match(aggregate, /path: packages\/docs-tooling\/src\/lark\/meta\/reports/)
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
        return source.replace('node scripts/docs-workflow/guides-source-cache-source-promotion.js cleanup \\\n              --workspace "$GITHUB_WORKSPACE" --scope all', 'rm -rf packages/docs-tooling/src/lark/meta/source-cache packages/docs-tooling/src/lark/meta/media-cache')
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
          '[[ -e packages/docs-tooling/src/lark/meta/sources/guides || -L packages/docs-tooling/src/lark/meta/sources/guides || \\\n               -e "$manifest" || -L "$manifest" || -e "$media" || -L "$media" ]]',
          '[[ -d packages/docs-tooling/src/lark/meta/sources/guides || -f "$manifest" || -f "$media" ]]',
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
        return source.replace(/      - name: Download current Guides reports[\s\S]*?          path: packages\/docs-tooling\/src\/lark\/meta\/reports\n/, '')
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
        return source.replace('path: packages/docs-tooling/src/lark/meta/reports', 'path: tmp/guides-reports')
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
  const rootPackage = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
  assert.equal(rootPackage.scripts['test:typescript-runtime-boundary'], 'node --test scripts/typescript-runtime-boundary.test.js')
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
  assert.match(workflow, /run-doc-build-stage\.js --build "pnpm run build:en"/)
  assert.match(workflow, /run-doc-build-stage\.js --build "pnpm run build:en" --skipCardReporting/)
  const verificationStep = workflow.slice(workflow.indexOf('name: Verify final documentation state'), workflow.indexOf('name: Upload final verification reports'))
  assert.match(verificationStep, /pnpm test:typescript-runtime-boundary[^\n]*\| tee tmp\/final-verification-reports\/typescript-runtime-boundary\.log/)
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

test('workflow policy rejects final verification without the TypeScript runtime boundary regression', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'typescript-runtime-boundary-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const file = path.join(directory, '_verify-docs.yml')
    const source = fs.readFileSync(file, 'utf8')
    const requiredCommand = 'pnpm test:typescript-runtime-boundary'
    assert.ok(source.includes(requiredCommand))
    fs.writeFileSync(file, source.replace(requiredCommand, 'pnpm test:workflow-policy'))
    assert.ok(validateWorkflowPolicies(directory).includes('_verify-docs.yml: must test CommonJS TypeScript loading without native stripping'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('workflow policy rejects final verification waterline and two-site mutations', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    ['      revision_status:\n        description: passed or failed\n        value: ${{ jobs.verify.outputs.revision_status }}\n', '', '_verify-docs.yml: must expose revision status separately from overall status'],
    ['pnpm check:localization-input-inventory', 'echo skipped revision inventory', '_verify-docs.yml: revision waterline must validate localization and revision inventories'],
    [
      '      - name: Verify revision waterline\n        id: revision\n        continue-on-error: true\n        run: |\n          set -euo pipefail\n',
      '      - name: Verify revision waterline\n        id: revision\n        continue-on-error: true\n        run: |\n          set -euo pipefail\n          exit 0\n',
      '_verify-docs.yml: revision waterline must not terminate before validation completes',
    ],
    ['pnpm docs-tooling validate-reference --site zh-CN', 'echo skipped Chinese reference', '_verify-docs.yml: site verification must run ordered Chinese validators before both site builds'],
    ['pnpm docs-tooling validate-reference --site zh-CN 2>&1 | tee tmp/final-verification-reports/zh-cn-reference.log', "echo 'pnpm docs-tooling validate-reference --site zh-CN' 2>&1 | tee tmp/final-verification-reports/zh-cn-reference.log", '_verify-docs.yml: site verification must run ordered Chinese validators before both site builds'],
    [
      '          pnpm docs-tooling validate-reference --site zh-CN 2>&1 | tee tmp/final-verification-reports/zh-cn-reference.log\n          pnpm docs-tooling validate-translation --target zh-CN-tools --group tools 2>&1 | tee tmp/final-verification-reports/zh-cn-tools-translation.log',
      '          pnpm docs-tooling validate-translation --target zh-CN-tools --group tools 2>&1 | tee tmp/final-verification-reports/zh-cn-tools-translation.log\n          pnpm docs-tooling validate-reference --site zh-CN 2>&1 | tee tmp/final-verification-reports/zh-cn-reference.log',
      '_verify-docs.yml: site verification must run ordered Chinese validators before both site builds',
    ],
    ['node scripts/run-doc-build-stage.js --build "pnpm run build:zh-CN" --skipCardReporting', 'echo skipped Chinese build', '_verify-docs.yml: site verification must run ordered Chinese validators before both site builds'],
    [
      '      - name: Verify final documentation state\n        id: verification\n        continue-on-error: true\n        run: |\n          set -euo pipefail\n',
      '      - name: Verify final documentation state\n        id: verification\n        continue-on-error: true\n        run: |\n          set -euo pipefail\n          exit 0\n',
      '_verify-docs.yml: site verification must not terminate before validation completes',
    ],
    ['steps.revision.outcome }}" == success && "${{ steps.verification.outcome', 'steps.verification.outcome }}" == success && "${{ steps.verification.outcome', '_verify-docs.yml: overall status must require revision and site verification success'],
    [
      '          if [[ "${{ steps.revision.outcome }}" == success && "${{ steps.verification.outcome }}" == success ]]; then\n            echo "status=passed" >> "$GITHUB_OUTPUT"\n          else\n            echo "status=failed" >> "$GITHUB_OUTPUT"\n          fi',
      '          # ${{ steps.revision.outcome }} and ${{ steps.verification.outcome }} retained as inert evidence\n          echo "status=passed" >> "$GITHUB_OUTPUT"',
      '_verify-docs.yml: overall status must require revision and site verification success',
    ],
    ['fetch-depth: 0', 'fetch-depth: 1', '_verify-docs.yml: must check out immutable master tooling'],
    ['git worktree add --detach "$RUNNER_TEMP/final-dev" "$FINAL_DEV_SHA"', 'git worktree add --detach "$RUNNER_TEMP/final-dev" origin/dev', '_verify-docs.yml: must materialize the exact final dev SHA'],
    ['restore-generated-state.sh --exact --ref "$FINAL_DEV_SHA"', 'restore-generated-state.sh --ref "$FINAL_DEV_SHA"', '_verify-docs.yml: must restore generated content from the exact final dev SHA'],
  ]
  for (const [from, to, expected] of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'final-verification-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, '_verify-docs.yml')
      const source = fs.readFileSync(file, 'utf8')
      const mutated = source.replace(from, to)
      assert.notEqual(mutated, source, `mutation must replace ${from}`)
      fs.writeFileSync(file, mutated)
      assert.ok(validateWorkflowPolicies(directory).includes(expected), expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow policy requires exact revision reconciliation aggregation wiring', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'revision-aggregate-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const file = path.join(directory, 'fetch-docs.yml')
    const source = fs.readFileSync(file, 'utf8')
    const required = '          REVISION_RECONCILIATION: ${{ needs.verify.outputs.revision_status }}\n'
    assert.ok(source.includes(required))
    fs.writeFileSync(file, source.replace(required, ''))
    assert.ok(validateWorkflowPolicies(directory).includes('fetch-docs.yml: aggregate must consume revision reconciliation separately from overall verification'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('workflow policy binds final verification reports and deterministic revision evidence to exact steps', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    [
      '      - name: Upload final verification reports\n        if: ${{ always() }}',
      '      - name: Upload final verification reports',
      '_verify-docs.yml: final verification report upload must always run',
    ],
    [
      '      - name: Emit revision reconciliation result\n        id: revision_result',
      '      - name: Emit revision reconciliation result\n        id: skipped_revision_result',
      '_verify-docs.yml: revision reconciliation result must deterministically emit passed or failed',
    ],
    [
      '      - name: Emit revision reconciliation result\n        id: revision_result\n        if: ${{ always() }}\n        run: |\n          if [[ "${{ steps.revision.outcome }}" == success ]]; then\n            echo "status=passed" >> "$GITHUB_OUTPUT"\n          else\n            echo "status=failed" >> "$GITHUB_OUTPUT"\n          fi\n',
      '',
      '_verify-docs.yml: revision reconciliation result must deterministically emit passed or failed',
    ],
    [
      'pnpm check:localization-input-inventory 2>&1 | tee tmp/final-verification-reports/localization-input-inventory.log',
      'pnpm check:localization-input-inventory',
      '_verify-docs.yml: revision waterline commands must preserve exact report logs',
    ],
    [
      'pnpm docs-tooling validate-revision-inventory --site en 2>&1 | tee tmp/final-verification-reports/revision-inventory.log',
      'pnpm docs-tooling validate-revision-inventory --site en 2>&1 | tee tmp/final-verification-reports/revisions.log',
      '_verify-docs.yml: revision waterline commands must preserve exact report logs',
    ],
  ]
  for (const [from, to, expected] of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'final-evidence-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, '_verify-docs.yml')
      const source = fs.readFileSync(file, 'utf8')
      const mutated = source.replace(from, to)
      assert.notEqual(mutated, source, `mutation must replace ${from}`)
      fs.writeFileSync(file, mutated)
      assert.ok(validateWorkflowPolicies(directory).includes(expected), expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('reusable content producer is immutable, read-only, and publishes a validated checkpoint artifact', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_fetch-content-group.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'reusable content producer workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /^name: fetch docs content group$/m)
  assert.match(workflow, /^  workflow_call:$/m)
  for (const input of ['site', 'group', 'master_sha', 'dev_baseline_sha', 'artifact_retention_days']) {
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
  assert.match(workflow, /prepare-content-group-workspace\.js "\$SITE" "\$GROUP"/)
  const inventoryStart = workflow.indexOf('name: Generate revision inventory')
  assert.ok(inventoryStart > workflow.indexOf('name: Update content snapshots'))
  assert.ok(inventoryStart < workflow.indexOf('name: Create source checkpoint artifact'))
  const inventoryEnd = workflow.indexOf('\n      - name:', inventoryStart + 1)
  const inventoryStep = workflow.slice(inventoryStart, inventoryEnd)
  assert.match(inventoryStep, /if: \$\{\{ inputs\.site == 'en' \}\}/)
  assert.match(inventoryStep, /tmp\/docs-tooling\/revision-baseline\/\$GROUP\.json/)
  assert.match(inventoryStep, /getContentGroup\(process\.env\.GROUP, process\.env\.SITE\)/)
  assert.match(inventoryStep, /group\.sourceSnapshots\.join\(","\)/)
  assert.match(inventoryStep, /inventory_args=\([\s\S]*revision-inventory build/)
  assert.match(inventoryStep, /pnpm docs-tooling "\$\{inventory_args\[@\]\}"/)
  assert.match(inventoryStep, /--snapshot "\$SNAPSHOTS"/)
  assert.match(inventoryStep, /--baseline "tmp\/docs-tooling\/revision-baseline\/\$GROUP\.json"/)
  assert.match(inventoryStep, /--output "generated\/en\/manifests\/lark-revisions\/\$GROUP\.json"/)
  assert.match(inventoryStep, /--report-dir "tmp\/docs-tooling\/revision-diff"/)
  assert.match(inventoryStep, /--source-run-id "\$GITHUB_RUN_ID"/)
  assert.match(inventoryStep, /--generated-at "\$GENERATED_AT"/)
  assert.doesNotMatch(inventoryStep, /APP_ID|APP_SECRET|fetch-lark|publish-group|update-lark-doc-snapshot|update-sdk-reference-snapshots/)
  assert.match(workflow, /create-checkpoint-artifact\.js[\s\S]*--baseline-dir "\$BASELINE_DIR"[\s\S]*--workspace "\$GITHUB_WORKSPACE"/)
  assert.match(workflow, /validate-checkpoint-artifact\.js/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*docs-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /artifact_name: \$\{\{ format\('docs-checkpoint-\{0\}-\{1\}', inputs\.group, github\.run_id\) \}\}/)
  assert.match(workflow, /id: checkpoint_upload[\s\S]*uses: actions\/upload-artifact@v4/)
  assert.match(workflow, /name: Upload revision inventory report[\s\S]*if: \$\{\{ inputs\.site == 'en' \}\}[\s\S]*generated\/en\/manifests\/lark-revisions\/\$\{\{ inputs\.group \}\}\.json[\s\S]*tmp\/docs-tooling\/revision-diff\/\$\{\{ inputs\.group \}\}\.json[\s\S]*tmp\/docs-tooling\/revision-diff\/\$\{\{ inputs\.group \}\}\.md[\s\S]*if-no-files-found: error/)
  assert.match(workflow, /name: Upload Guides content reports[\s\S]*inputs\.group == 'guides'/)
  assert.match(workflow, /name: Emit producer result\n        id: result\n        if: \$\{\{ always\(\) \}\}[\s\S]*steps\.checkpoint_upload\.outcome[\s\S]*artifact_ready[\s\S]*failed/)
  const jobEnv = workflow.match(/^    env:\n([\s\S]*?)^    steps:$/m)?.[1] || ''
  assert.doesNotMatch(jobEnv, /secrets\./, 'producer secrets must be scoped to individual steps')
  const sourceUpload = workflow.slice(workflow.indexOf('name: Upload source checkpoint artifact'), workflow.indexOf('name: Upload content group reports'))
  assert.doesNotMatch(sourceUpload, /^        env:/m, 'artifact upload must not receive credentials')
  assert.match(workflow, /name: Install dependencies\n        id: install\n        run: pnpm install --frozen-lockfile/)
  assert.doesNotMatch(workflow, /report-live-card|card_id|card_started_at|card_stages|card_mode/)
})

test('workflow policy rejects revision inventory producer mutations', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const fixtures = [
    { mutate: source => source.replace('name: Generate revision inventory', 'name: Generate missing inventory'), expected: '_fetch-content-group.yml: English producer must generate the selected revision inventory' },
    { mutate: source => source.replace('name: Update content snapshots', 'name: __TEMP_STEP__').replace('name: Generate revision inventory', 'name: Update content snapshots').replace('name: __TEMP_STEP__', 'name: Generate revision inventory'), expected: '_fetch-content-group.yml: English producer must generate the selected revision inventory' },
    { mutate: source => source.replace("if: ${{ inputs.site == 'en' }}", "if: ${{ inputs.site != 'en' }}"), expected: '_fetch-content-group.yml: revision inventory generation and report upload must be English-only' },
    { mutate: source => source.replace('tmp/docs-tooling/revision-baseline/$GROUP.json', 'generated/en/manifests/lark-revisions/$GROUP.json'), expected: '_fetch-content-group.yml: revision inventory baseline must use the exact safe repository-relative path' },
    { mutate: source => source.replace('name: Generate revision inventory', 'name: Generate revision inventory\n        env:\n          APP_ID: ${{ secrets.APP_ID }}'), expected: '_fetch-content-group.yml: revision inventory step must not receive Feishu credentials or fetch source metadata' },
    { mutate: source => source.replace('          pnpm docs-tooling "${inventory_args[@]}"', '          pnpm docs-tooling publish-group --site "$SITE" --group "$GROUP" --stage fetch\n          pnpm docs-tooling "${inventory_args[@]}"'), expected: '_fetch-content-group.yml: revision inventory step must not receive Feishu credentials or fetch source metadata' },
    { mutate: source => source.replace('name: Upload revision inventory report', 'name: Upload missing revision report'), expected: '_fetch-content-group.yml: English producer must upload revision JSON and Markdown reports' },
  ]
  for (const fixture of fixtures) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'revision-producer-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, '_fetch-content-group.yml')
      const source = fs.readFileSync(file, 'utf8')
      const mutated = fixture.mutate(source)
      assert.notEqual(mutated, source, 'mutation must change workflow source')
      fs.writeFileSync(file, mutated)
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('guides source and table render expose jobs for the central monitor without patching cards', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_fetch-guides-sources.yml'), 'utf8')
  const render = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_render-guides-table.yml'), 'utf8')
  assert.doesNotMatch(source, /report-live-card|card_id|card_mode|card_started_at/)
  assert.doesNotMatch(render, /report-live-card|secrets\./)
  assert.equal(yaml.load(source).on.workflow_call.inputs.site.required, true)
  assert.equal(yaml.load(render).on.workflow_call.inputs.site.required, true)
  const caller = yaml.load(fs.readFileSync(path.join(process.cwd(), '.github/workflows/fetch-docs.yml'), 'utf8'))
  assert.equal(caller.jobs.produce_guides_sources.with.site, 'en')
  assert.equal(caller.jobs.render_guides_tables.with.site, 'en')
  assert.equal(caller.jobs.produce_guides.with.site, 'en')
  assert.match(source, /name: Create Guides progress metadata[\s\S]*continue-on-error: true/)
  assert.match(source, /name: Upload Guides progress metadata[\s\S]*continue-on-error: true[\s\S]*name: docs-progress-metadata-\$\{\{ github\.run_id \}\}/)
  const metadataSteps = source.slice(source.indexOf('name: Create Guides progress metadata'), source.indexOf('name: Create shared source artifact'))
  assert.doesNotMatch(metadataSteps, /APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/)
})

test('Guides table matrix generation is site-qualified and policy rejects site-blind generation', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const sourcePath = path.join(sourceDirectory, '_fetch-guides-sources.yml')
  const source = fs.readFileSync(sourcePath, 'utf8')
  const siteArgument = '            --site "${{ inputs.site }}" \\\n'
  assert.match(source, /guides-tables\.js matrix \\\n\s+--site "\$\{\{ inputs\.site \}\}"/)

  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-matrix-site-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const fixture = path.join(directory, '_fetch-guides-sources.yml')
    const fixtureSource = fs.readFileSync(fixture, 'utf8')
    assert.ok(fixtureSource.includes(siteArgument))
    fs.writeFileSync(fixture, fixtureSource.replace(siteArgument, ''))
    assert.ok(validateWorkflowPolicies(directory).includes('_fetch-guides-sources.yml: Guides table matrix generation must pass the required site'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('Tools table is the only Agents producer while Releases keeps its sidebar', () => {
  const config = fs.readFileSync('config/lark-docs.config.ts', 'utf8')
  const profile = fs.readFileSync('packages/site-config/src/sites/en.ts', 'utf8')
  const sidebars = fs.readFileSync('generated/en/sidebars/guides.sidebar.js', 'utf8')
  const items = fs.readFileSync('generated/en/sidebars/guides.items.js', 'utf8')
  const workflows = fs.readdirSync('.github/workflows').map(file => fs.readFileSync(path.join('.github/workflows', file), 'utf8')).join('\n')
  assert.doesNotMatch(config, /const agents: Manual|agents,/)
  assert.match(profile, /sidebarPath: 'packages\/site-config\/src\/sidebars\/en\/guides\.legacy\.ts'/)
  assert.doesNotMatch(sidebars, /agentsSidebar|agents\.sidebar/)
  assert.match(sidebars, /"label": "Release notes"[\s\S]*tutorials\/get-started\/release-notes/)
  assert.match(items, /"label": "Tools"/)
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
  const assembleSteps = yaml.load(assemble).jobs.assemble.steps
  const baselineIndex = assembleSteps.findIndex(step => step.name === 'Prepare immutable baseline')
  const workspaceIndex = assembleSteps.findIndex(step => step.name === 'Prepare selected Guides workspace')
  const sourceRestoreIndex = assembleSteps.findIndex(step => step.name === 'Restore validated Guides source')
  assert.ok(baselineIndex >= 0 && workspaceIndex > baselineIndex && sourceRestoreIndex > workspaceIndex)
  assert.equal(assembleSteps[workspaceIndex].run, 'node scripts/docs-workflow/prepare-content-group-workspace.js "${{ inputs.site }}" guides')
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
  assert.doesNotMatch(source, /cp -a "\$staged\/sources" packages\/docs-tooling\/src\/lark\/meta\/sources/)
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
    assert.match(block, /\[\[ -e packages\/docs-tooling\/src\/lark\/meta\/sources\/guides \|\| -L packages\/docs-tooling\/src\/lark\/meta\/sources\/guides/)
    assert.match(block, /-e "\$manifest" \|\| -L "\$manifest"/)
    if (validationName !== 'Validate Guides v1 cache candidate') assert.match(block, /-e "\$media" \|\| -L "\$media"/)
  }
  assert.doesNotMatch(source, /rm -rf[^\n]*packages\/docs-tooling\/src\/lark\/meta\/(?:source-cache|media-cache)\/?(?:\s|$)/)
  assert.match(source, /guides-source-cache-source-promotion\.js validate-live-source/)
  assert.match(source, /guides-source-cache\.js validate-media/)
  for (const [validationName, nextName] of [['Validate Guides v3 cache candidate', 'Restore Guides v2 cache candidate'], ['Validate Guides v2 cache candidate', 'Restore Guides v1 cache candidate']]) {
    const block = source.slice(source.indexOf(`name: ${validationName}`), source.indexOf(`name: ${nextName}`))
    assert.ok(block.indexOf('guides-source-cache-source-promotion.js validate-live-source') < block.indexOf('guides-source-cache-source-promotion.js validate-live-media'))
  }
  assert.match(source, /guides-source-cache-generation\.js promote/)
  assert.match(source, /packages\/docs-tooling\/src\/lark\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--media-manifest "?packages\/docs-tooling\/src\/lark\/meta\/media-cache\/guides\.json"?/)
  assert.match(source, /export DOCS_TOOLING_FORCE_FULL_FETCH=1/)
  assert.match(source, /id: source_cache_result[\s\S]*source_valid[\s\S]*media_valid[\s\S]*cache_version[\s\S]*cache_save_required/)
  assert.match(source, /guides-cache-save-decision\.js decide[\s\S]*--cache-version "\$cache_version"[\s\S]*--prefetch-mode[\s\S]*--candidate "\$candidate"[\s\S]*--baseline "\$baseline"/)
  assert.doesNotMatch(source, /candidate_key|baseline_key/)
  assert.match(source, /cache_state=invalid/)
  assert.match(source, /steps\.source_cache_check\.outputs\.source_valid[\s\S]*export DOCS_TOOLING_FORCE_FULL_FETCH=1/)
  assert.doesNotMatch(source, /media_valid[^\n]*[\s\S]{0,180}DOCS_TOOLING_FORCE_FULL_FETCH/)
  assert.match(caller, /produce_guides:[\s\S]*cache_version: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_version \}\}[\s\S]*cache_save_required: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_save_required \}\}/)
  assert.match(assemble, /cache_version: \{ required: true, type: string \}/)
  assert.match(assemble, /cache_save_required: \{ required: true, type: string \}/)
  assert.match(assemble, /name: Select promoted Guides source snapshot[\s\S]*guides-cache-generation-lifecycle\.js select[\s\S]*--cache-version "\$\{\{ inputs\.cache_version \}\}"[\s\S]*--save-required "\$\{\{ inputs\.cache_save_required \}\}"/)
  assert.match(assemble, /name: Prepare promoted Guides source manifest[\s\S]*guides-source-cache\.js create/)
  assert.match(assemble, /id: guides_v4_generation\n\s+name: Create Guides v4 generation payload\n\s+if: \$\{\{ inputs\.cache_save_required == 'true' \}\}[\s\S]*guides-source-cache-generation\.js keys[\s\S]*--snapshot "\$snapshot"[\s\S]*guides-source-cache-generation\.js create[\s\S]*guides-source-cache-generation\.js validate/)
  assert.match(assemble, /--media-manifest "?packages\/docs-tooling\/src\/lark\/meta\/media-cache\/guides\.json"?/)
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
  assert.match(source, /--snapshot packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-source-snapshot-candidate\.json/)
  assert.match(source, /--report packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-media-prefetch\.json/)
  assert.match(source, /if \[\[ "\$\{\{ steps\.source_cache_check\.outputs\.media_valid \}\}" == true \]\]; then[\s\S]*--mode incremental[\s\S]*--cache-state valid[\s\S]*--plan packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-incremental-fetch-plan\.json[\s\S]*--previous-manifest packages\/docs-tooling\/src\/lark\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--previous-manifest packages\/docs-tooling\/src\/lark\/meta\/media-cache\/guides\.json/)
  assert.match(source, /--bootstrap-docs content\/\$\{\{ inputs\.site \}\}\/guides,content\/\$\{\{ inputs\.site \}\}\/byoc/)
  assert.match(source, /media cache unavailable; rebuilding complete canonical media coverage/i)
  assert.match(source, /else[\s\S]*cache_state="\$\{\{ steps\.source_cache_check\.outputs\.cache_state \}\}"[\s\S]*--mode recovery[\s\S]*--cache-state "\$cache_state"[\s\S]*node scripts\/docs-workflow\/guides-media-prefetch\.js "\$\{args\[@\]\}"/)
  const recoveryBranch = source.slice(source.indexOf('else\n            echo "[source-cache] Media cache unavailable'), source.indexOf('node scripts/docs-workflow/guides-media-prefetch.js'))
  assert.doesNotMatch(recoveryBranch, /--plan|--previous-manifest/)
  assert.match(source, /--concurrency 4/)
  assert.match(source, /GUIDES_FIGMA_MAX_CONCURRENT: '1'/)
  assert.match(source, /GUIDES_FIGMA_MIN_TIME_MS: '1000'/)
  assert.match(source, /AWS_ACCESS_KEY_ID: \$\{\{ secrets\.AWS_ACCESS_KEY_ID \}\}/)
  assert.match(source, /AWS_SECRET_ACCESS_KEY: \$\{\{ secrets\.AWS_SECRET_ACCESS_KEY \}\}/)

  assert.match(runner, /--offline[\s\S]*--mediaManifest[\s\S]*packages\/docs-tooling\/src\/lark\/meta\/media-cache\/guides\.json/)
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
  assert.match(sourceDecision, /--candidate-snapshot packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-source-snapshot-candidate\.json/)
  assert.match(sourceDecision, /--incremental-plan packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-incremental-fetch-plan\.json/)
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
  assert.match(generation, /node scripts\/docs-workflow\/generate-guides-sidebars\.js --media-manifest packages\/docs-tooling\/src\/lark\/meta\/media-cache\/guides\.json/)
  assert.doesNotMatch(generation, /\n\s+if:/)
  assert.doesNotMatch(assemble, /npx docusaurus fetch-lark-docs[\s\S]*-sidebar/)
  const validation = assemble.slice(indices[0], indices[1])
  assert.match(validation, /decision-sha/)
  assert.match(validation, /guides-assembly-decision\.json/)
  assert.match(validation, /generated\/\$\{\{ inputs\.site \}\}\/sidebars\/guides\.sidebar\.js/)
  const finalValidation = assemble.slice(indices[2], indices[3])
  assert.match(finalValidation, /validate-generated-sidebars\.js/)
  assert.match(assemble, /ZDOC_BUILD_COMMAND: \$\{\{ inputs\.site == 'en' && 'pnpm run build:en' \|\| inputs\.site == 'zh-CN' && 'pnpm run build:zh-CN' \|\| '' \}\}/)
  assert.match(finalValidation, /run-doc-build-stage\.js --build "\$ZDOC_BUILD_COMMAND"/)
  const finalize = assemble.slice(indices[3], assemble.indexOf('name: Select promoted Guides source snapshot'))
  assert.match(finalize, /saas=generated\/\$\{\{ inputs\.site \}\}\/sidebars\/guides\.sidebar\.js[\s\S]*cmp -s[^\n]*\$saas/)
  assert.match(finalize, /byoc=generated\/\$\{\{ inputs\.site \}\}\/sidebars\/guides-byoc\.sidebar\.js[\s\S]*cmp -s[^\n]*\$byoc/)
  assert.match(finalize, /write-descriptor[\s\S]*--expected-decision-sha256/)
  assert.match(finalize, /verify-descriptor/)
  assert.match(finalize, /write-result[\s\S]*guides-assembly-result\.json/)
  assert.doesNotMatch(finalize, />\s*packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-assembly-decision\.json|--output packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-assembly-decision\.json/)
  assert.doesNotMatch(assemble, /if:.*reuse[\s\S]{0,200}(?:cp|copyFile).*config\/generated\/guides(?:-byoc)?\.sidebar\.js/)
  assert.doesNotMatch(assemble, /cp[^\n]*baseline[^\n]*config\/generated\/guides(?:-byoc)?\.sidebar\.js/)
  assert.match(sourceDecision, /git -C "\$RUNNER_TEMP\/baseline" rev-parse HEAD/)
  assert.match(source, /assembly_decision_sha256:/)
  assert.match(assemble, /^      assembly_decision_sha256: \{ required: true, type: string \}$/m)
  const caller = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  assert.match(caller, /produce_guides:[\s\S]*assembly_decision_sha256: \$\{\{ needs\.produce_guides_sources\.outputs\.assembly_decision_sha256 \}\}/)
})

test('Guides assembly uses one explicit site-owned build mapping and policy rejects an unconditional English build', () => {
  const workflowDirectory = path.join(process.cwd(), '.github/workflows')
  const workflowPath = path.join(workflowDirectory, '_assemble-guides.yml')
  const source = fs.readFileSync(workflowPath, 'utf8')
  const workflow = yaml.load(source)
  const expectedMapping = "${{ inputs.site == 'en' && 'pnpm run build:en' || inputs.site == 'zh-CN' && 'pnpm run build:zh-CN' || '' }}"
  assert.equal(workflow.jobs.assemble.env.ZDOC_BUILD_COMMAND, expectedMapping)
  const validation = workflow.jobs.assemble.steps.find(step => step.name === 'Validate combined guides output')?.run || ''
  const checkpoint = workflow.jobs.assemble.steps.find(step => step.name === 'Create combined guides checkpoint')?.run || ''
  assert.match(validation, /\[\[ -n "\$ZDOC_BUILD_COMMAND" \]\]/)
  assert.match(validation, /run-doc-build-stage\.js --build "\$ZDOC_BUILD_COMMAND" --skipLinkChecks --skipCardReporting/)
  assert.match(checkpoint, /printf -v build_validation 'node scripts\/run-doc-build-stage\.js --build "%s" --skipLinkChecks --skipCardReporting' "\$ZDOC_BUILD_COMMAND"/)
  assert.match(checkpoint, /--validation-command "\$build_validation"/)
  assert.doesNotMatch(source, /run-doc-build-stage\.js --build "pnpm run build:en"/)

  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-build-site-policy-'))
  try {
    fs.cpSync(workflowDirectory, directory, { recursive: true })
    const fixture = path.join(directory, '_assemble-guides.yml')
    const fixtureSource = fs.readFileSync(fixture, 'utf8')
    assert.ok(fixtureSource.includes(expectedMapping))
    fs.writeFileSync(fixture, fixtureSource.replace(expectedMapping, 'pnpm run build:en'))
    assert.ok(validateWorkflowPolicies(directory).includes('_assemble-guides.yml: Guides assembly build validation must use the explicit site-owned build mapping'))

    const variableBuild = '--build "$ZDOC_BUILD_COMMAND"'
    assert.ok(fixtureSource.includes(variableBuild))
    fs.writeFileSync(fixture, fixtureSource.replace(variableBuild, '--build "pnpm run build:en"'))
    assert.ok(validateWorkflowPolicies(directory).includes('_assemble-guides.yml: Guides assembly build validation must use the explicit site-owned build mapping'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('reusable content publisher safely downloads, validates, and publishes checkpoints', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_publish-content-group.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'reusable content publisher workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')
  const steps = yaml.load(workflow).jobs.publish.steps
  const pnpmSetupIndex = steps.findIndex(step => step.uses === 'pnpm/action-setup@v4')
  const nodeSetupIndex = steps.findIndex(step => step.uses === 'actions/setup-node@v4')
  const installIndex = steps.findIndex(step => step.name === 'Install dependencies')
  const contractIndex = steps.findIndex(step => step.name === 'Validate content group contract')
  assert.ok(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < contractIndex)

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
  assert.match(workflow, /name: Check out immutable translation tooling[\s\S]*ref: \$\{\{ inputs\.tooling_sha \}\}[\s\S]*name: Check out immutable source tooling[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /actions\/download-artifact@v4[\s\S]*name: \$\{\{ inputs\.artifact_name \}\}/)
  assert.match(workflow, /publish batch \$\{number\} of \$\{count\}[\s\S]*publish translations[\s\S]*group\.commitMessage/)
  assert.match(workflow, /name: Download baseline artifact[\s\S]*if: \$\{\{ inputs\.should_publish && inputs\.baseline_artifact_name != '' \}\}[\s\S]*name: \$\{\{ inputs\.baseline_artifact_name \}\}[\s\S]*baseline-download/)
  assert.match(workflow, /extract_checkpoint_archive "\$DOWNLOAD_DIR\/checkpoint-group\.tar" "\$EXTRACT_DIR" "\$ARTIFACT_DIR" "\$CHECKPOINT_PREFLIGHT_MANIFEST"[\s\S]*extract_checkpoint_archive "\$BASELINE_DOWNLOAD_DIR\/checkpoint-group\.tar" "\$BASELINE_EXTRACT_DIR" "\$BASELINE_DIR" "\$BASELINE_PREFLIGHT_MANIFEST"/)
  assert.match(workflow, /--translation-target[\s\S]*--source-checkpoint-sha[\s\S]*--tooling-sha[\s\S]*--source-site[\s\S]*--target-site[\s\S]*preflight-checkpoint-archive\.js[\s\S]*--manifest-output[\s\S]*tar -xf "\$archive"/)
  assert.ok(workflow.indexOf('preflight-checkpoint-archive.js') < workflow.indexOf('tar -xf "$archive"'))
  assert.match(workflow, /validate-checkpoint-artifact\.js[\s\S]*--group "\$GROUP"[\s\S]*--master-sha "\$MASTER_SHA"/)
  assert.match(workflow, /publish-checkpoint\.sh[\s\S]*--artifact "\$ARTIFACT_DIR"[\s\S]*--branch "\$TARGET_BRANCH"[\s\S]*--message "\$COMMIT_MESSAGE"[\s\S]*--max-attempts 10[\s\S]*--validate-command "\$VALIDATE_COMMAND"/)
  assert.match(workflow, /id: baseline_validation[\s\S]*validateCheckpointArtifact[\s\S]*manifest\.resolvedDir[\s\S]*resolveTranslationTarget\(manifest\.translationTarget\)\.state\.path[\s\S]*baseline_dir=/)
  assert.match(workflow, /const \{ loadTypeScript \} = require\('\.\/scripts\/lib\/load-typescript'\)[\s\S]*loadTypeScript\('\.\.\/\.\.\/packages\/docs-tooling\/src\/translation\/targets\.ts'\)/)
  assert.doesNotMatch(workflow, /require\(['"][^'"]+\.ts['"]\)/)
  assert.match(workflow, /BASELINE_PAYLOAD_DIR: \$\{\{ steps\.baseline_validation\.outputs\.baseline_dir \}\}[\s\S]*baseline_args=\(\)[\s\S]*baseline_args=\(--baseline-dir "\$BASELINE_PAYLOAD_DIR"\)[\s\S]*"\$\{baseline_args\[@\]\}"/)
  assert.match(workflow, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*status=failed[\s\S]*status=skipped[\s\S]*published[\s\S]*no_changes/)
  assert.match(workflow, /commit_sha=/)
  assert.match(workflow, /name: Fail unsuccessful publication[\s\S]*steps\.result\.outputs\.status == 'failed'/)
  assert.match(workflow, /actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/)
  assert.doesNotMatch(workflow, /git-auto-commit|git push[^\n]*--force/)
  const publicationBody = workflow.slice(workflow.indexOf('name: Publish checkpoint'))
  assert.doesNotMatch(publicationBody, /secrets\./)
})

test('workflow policy rejects content group contract validation before dependencies are installed', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'publisher-install-order-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const file = path.join(directory, '_publish-content-group.yml')
    const workflow = yaml.load(fs.readFileSync(file, 'utf8'))
    const steps = workflow.jobs.publish.steps
    const contractIndex = steps.findIndex(step => step.name === 'Validate content group contract')
    const installIndex = steps.findIndex(step => step.name === 'Install dependencies')
    assert.ok(contractIndex > installIndex)
    const [contract] = steps.splice(contractIndex, 1)
    steps.splice(installIndex, 0, contract)
    fs.writeFileSync(file, yaml.dump(workflow, { lineWidth: -1, noRefs: true }))
    assert.ok(validateWorkflowPolicies(directory).includes('_publish-content-group.yml: must install dependencies before validating the content group contract'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('workflow policy rejects content group validation before producer dependencies are installed', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'producer-install-order-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const file = path.join(directory, '_fetch-content-group.yml')
    const workflow = yaml.load(fs.readFileSync(file, 'utf8'))
    const steps = workflow.jobs.produce.steps
    const validationIndex = steps.findIndex(step => step.name === 'Validate content group')
    const installIndex = steps.findIndex(step => step.name === 'Install dependencies')
    assert.ok(validationIndex > installIndex)
    const [validation] = steps.splice(validationIndex, 1)
    steps.splice(installIndex, 0, validation)
    fs.writeFileSync(file, yaml.dump(workflow, { lineWidth: -1, noRefs: true }))
    assert.ok(validateWorkflowPolicies(directory).includes('_fetch-content-group.yml: must install dependencies before validating the content group'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('workflow policy rejects direct TypeScript requires in the content publisher', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'publisher-typescript-loader-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const file = path.join(directory, '_publish-content-group.yml')
    const source = fs.readFileSync(file, 'utf8')
    const loaderCall = "loadTypeScript('../../packages/docs-tooling/src/translation/targets.ts')"
    assert.ok(source.includes(loaderCall))
    fs.writeFileSync(file, source.replace(loaderCall, "require('./packages/docs-tooling/src/translation/targets.ts')"))
    assert.ok(validateWorkflowPolicies(directory).includes('_publish-content-group.yml: must load TypeScript modules through the shared loader'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
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
  assert.equal(steps.find(step => step.name === 'Check out immutable master tooling').with.ref, '${{ inputs.tooling_sha }}')
  assert.equal(steps.find(step => step.name === 'Check out immutable master tooling').with['fetch-depth'], 0)
  const capture = steps.find(step => step.name === 'Capture Guides translation publication identities')
  const install = steps.find(step => step.name === 'Install immutable master tooling')
  const initialize = steps.find(step => step.name === 'Initialize Guides translation publisher')
  assert.match(initialize.run, /! -L "\$trusted_root"[\s\S]*realpath -e -- "\$trusted_root"[\s\S]*stat -c '%u' -- "\$trusted_root"[\s\S]*id -u/)
  assert.match(capture.run, /createInitialPublisherState/)
  assert.match(capture.run, /SOURCE_COMMIT_SHA[\s\S]*EXPECTED_TARGET_SHA/)
  assert.match(capture.run, /refs\/remotes\/origin\/\$TARGET_BRANCH\^\{commit\}[\s\S]*EXPECTED_TARGET_SHA/)
  assert.ok(steps.indexOf(install) < steps.indexOf(capture))
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
  assert.doesNotMatch(validate, /validate-generated-sidebars|validate-translated-coverage|pnpm run build:en/)

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
      expected: `${workflowName}: publisher must install tooling, then authenticate and persist source and target identities before artifact download`,
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
      mutate(workflow) { workflow.jobs.publish.steps.find(step => step.name === 'Validate combined Guides translation').run += '\npnpm run build:en' },
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
    assert.equal(job.with.validate_command, `pnpm docs-tooling validate-mdx --path i18n/ja-JP && pnpm docs-tooling validate-translation --target ja-JP --group ${group} && pnpm run build:en`)
  }
})

test('Chinese publishers wait for the Guides translation publication barrier', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const barrierName = 'guides_translation_publication_barrier'
  const barrier = workflow.jobs[barrierName]
  assert.ok(workflow.jobs.finalize_guides_translation.needs.includes('publish_guides_translation_batches'))
  const barrierNeeds = [
    'produce_guides_sources',
    'render_guides_tables',
    'produce_guides',
    'publish_guides',
    'prepare_guides_translation_batches',
    'translate_guides_batches',
    'publish_guides_translation_batches',
    'finalize_guides_translation',
  ]
  assert.deepEqual(barrier.needs, barrierNeeds)
  assert.equal(barrier.if, '${{ always() }}')
  const barrierRun = barrier.steps.find(step => step.name === 'Accept completed Guides translation publication').run
  const skippedEnvironment = {
    PRODUCE_GUIDES_SOURCES_RESULT: 'skipped',
    RENDER_GUIDES_TABLES_RESULT: 'skipped',
    PRODUCE_GUIDES_RESULT: 'skipped',
    PUBLISH_GUIDES_RESULT: 'skipped',
    PREPARE_GUIDES_TRANSLATION_BATCHES_RESULT: 'skipped',
    TRANSLATE_GUIDES_BATCHES_RESULT: 'skipped',
    PUBLISH_GUIDES_TRANSLATION_BATCHES_RESULT: 'skipped',
    FINALIZER_RESULT: 'success',
    TRANSLATOR_STATUS: 'skipped',
    PUBLISHER_STATUS: 'skipped',
  }
  const runBarrier = overrides => spawnSync('bash', ['-c', barrierRun], {
    encoding: 'utf8',
    env: {...process.env, ...skippedEnvironment, ...overrides},
  })
  assert.equal(runBarrier({}).status, 0, 'intentionally unselected Guides publication must pass')
  assert.equal(runBarrier({
    PRODUCE_GUIDES_SOURCES_RESULT: 'success',
    PRODUCE_GUIDES_RESULT: 'success',
    PUBLISH_GUIDES_RESULT: 'success',
    PREPARE_GUIDES_TRANSLATION_BATCHES_RESULT: 'success',
    TRANSLATOR_STATUS: 'no_changes',
    PUBLISHER_STATUS: 'no_changes',
  }).status, 0, 'intentional zero-batch no_changes must pass')
  for (const [label, overrides] of [
    ['failed Guides source publisher with skipped downstream', {PUBLISH_GUIDES_RESULT: 'failure'}],
    ['cancelled Guides source publisher with skipped downstream', {PUBLISH_GUIDES_RESULT: 'cancelled'}],
    ['earlier Guides assembly failure with skipped downstream', {PRODUCE_GUIDES_RESULT: 'failure'}],
  ]) {
    assert.notEqual(runBarrier(overrides).status, 0, label)
  }
  const publishingJobs = [
    'translate_python_zh_reference',
    'translate_java_zh_reference',
    'translate_node_zh_reference',
    'translate_go_zh_reference',
    'translate_cli_zh_reference',
    'translate_rest_zh_reference',
    'translate_guides_zh_tools',
  ]
  for (const jobName of publishingJobs) {
    const job = workflow.jobs[jobName]
    assert.ok(job.needs.includes(barrierName), `${jobName} must wait for the Guides publication barrier`)
    assert.match(job.if, /needs\.guides_translation_publication_barrier\.result == 'success'/)
  }
  for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest']) {
    assert.equal(
      workflow.jobs[`translate_${group}_zh_reference`].with.source_sha,
      `\${{ needs.publish_${group}.outputs.commit_sha || needs.prepare.outputs.dev_baseline_sha }}`,
    )
  }
  const chineseReferenceOrder = ['python', 'java', 'node', 'go', 'cli', 'rest']
  for (const [index, group] of chineseReferenceOrder.entries()) {
    const needs = workflow.jobs[`translate_${group}_zh_reference`].needs
    if (index > 0) {
      const predecessor = chineseReferenceOrder[index - 1]
      assert.ok(
        needs.includes(`translate_${predecessor}_zh_reference`),
        `${group} Chinese Reference publication must wait for ${predecessor}`,
      )
      assert.match(
        workflow.jobs[`translate_${group}_zh_reference`].if,
        new RegExp(`needs\\.translate_${predecessor}_zh_reference\\.result == 'success'`),
      )
    }
  }
  assert.equal(
    workflow.jobs.translate_guides_zh_tools.with.source_sha,
    '${{ needs.publish_guides.outputs.commit_sha || needs.prepare.outputs.dev_baseline_sha }}',
  )

  const visiting = new Set(), visited = new Set()
  const visit = jobName => {
    if (visiting.has(jobName)) assert.fail(`dependency cycle at ${jobName}`)
    if (visited.has(jobName)) return
    visiting.add(jobName)
    const needs = workflow.jobs[jobName].needs
    for (const dependency of Array.isArray(needs) ? needs : needs ? [needs] : []) visit(dependency)
    visiting.delete(jobName)
    visited.add(jobName)
  }
  for (const jobName of Object.keys(workflow.jobs)) visit(jobName)

  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'chinese-publication-barrier-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'fetch-docs.yml')
    const mutated = yaml.load(fs.readFileSync(file, 'utf8'))
    mutated.jobs.translate_python_zh_reference.needs = mutated.jobs.translate_python_zh_reference.needs.filter(need => need !== barrierName)
    fs.writeFileSync(file, yaml.dump(mutated, {lineWidth: -1, noRefs: true}))
    assert.ok(validateWorkflowPolicies(directory).includes('fetch-docs.yml: every Chinese publisher must wait for the Guides translation publication barrier'))
    mutated.jobs.translate_python_zh_reference.needs.push(barrierName)
    mutated.jobs[barrierName].needs = mutated.jobs[barrierName].needs.filter(need => need !== 'publish_guides')
    fs.writeFileSync(file, yaml.dump(mutated, {lineWidth: -1, noRefs: true}))
    assert.ok(validateWorkflowPolicies(directory).includes('fetch-docs.yml: Guides translation publication barrier must validate authoritative prerequisite results'))
    const unqueued = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
    unqueued.jobs.translate_java_zh_reference.needs = unqueued.jobs.translate_java_zh_reference.needs.filter(
      need => need !== 'translate_python_zh_reference',
    )
    fs.writeFileSync(file, yaml.dump(unqueued, {lineWidth: -1, noRefs: true}))
    assert.ok(validateWorkflowPolicies(directory).includes('fetch-docs.yml: Chinese Reference publishers must form the source-ordered publication queue'))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('reusable translation producer creates group-scoped checkpoint artifacts without publishing', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  const workflow = yaml.load(source)
  const steps = workflow.jobs.translate.steps
  const numbered = steps.find(step => step.name === 'Validate translated batch outputs')
  const unbatched = steps.find(step => step.name === 'Validate unbatched translated group')
  const checkpoint = steps.find(step => step.name === 'Create validated translation checkpoints')

  for (const input of ['target', 'group', 'tooling_sha', 'source_sha', 'source_commit_sha', 'master_sha', 'should_translate']) assert.match(source, new RegExp(`^      ${input}:`, 'm'))
  for (const output of ['status', 'artifact_name', 'baseline_artifact_name', 'translated_count']) assert.match(source, new RegExp(`^      ${output}:`, 'm'))
  assert.match(source, /^  contents: read$/m)
  assert.match(source, /actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.tooling_sha \}\}/)
  assert.match(source, /restore-generated-state\.sh --exact --ref "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(source, /sourceDelta\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/)
  assert.match(source, /applySourceDelta\.js --target "\$TRANSLATION_TARGET" --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/)
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
  assert.doesNotMatch(numbered.run, /mdx-parse|validate-mdx|validate-translated-coverage|pnpm run build:en/)
  assert.match(numbered.run, /translation-batch-input\.js validate --input tmp\/translation-batch-input\.json/)
  assert.match(numbered.run, /validate-translation-batch-outputs\.js[\s\S]*--manifest tmp\/translation-manifest\.json[\s\S]*--report tmp\/translation-report\.json[\s\S]*--batch-input tmp\/translation-batch-input\.json[\s\S]*--workspace "\$GITHUB_WORKSPACE"[\s\S]*--agents-outcome "\$AGENTS_OUTCOME"[\s\S]*--translated-count "\$TRANSLATED_COUNT"[\s\S]*--failed-count "\$FAILED_COUNT"[\s\S]*--remaining-count "\$REMAINING_COUNT"/)

  assert.ok(unbatched, 'unbatched translations need their existing full validation')
  assert.match(unbatched.if, /inputs\.batch_number == 0/)
  assert.match(unbatched.if, /steps\.agents\.outputs\.failed_count \|\| '0'/)
  assert.match(unbatched.run, /validate-mdx/)
  assert.match(unbatched.run, /validate-translation --target ja-JP --group "\$GROUP"[\s\S]*pnpm run build:en/)
  assert.match(unbatched.run, /reference-manifest --source content\/en\/reference --target content\/zh-CN\/reference --source-commit "\$SOURCE_COMMIT_SHA" --write[\s\S]*validate-reference --site zh-CN[\s\S]*pnpm run build:zh-CN/)
  assert.match(unbatched.run, /validate-translation --target zh-CN-tools --group tools[\s\S]*validate-tools-sidebar[\s\S]*pnpm run build:zh-CN/)

  assert.match(checkpoint.run, /--include-translation-cache/)
  assert.match(checkpoint.run, /--translation-target "\$TRANSLATION_TARGET"[\s\S]*--source-checkpoint-sha "\$SOURCE_COMMIT_SHA"[\s\S]*--tooling-sha "\$MASTER_SHA"/)
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
      mutate(steps) { steps.find(step => step.name === 'Create validated translation checkpoints').run += '\npnpm run build:en' },
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
  const steps = yaml.load(workflow).jobs.prepare.steps
  const pnpmSetupIndex = steps.findIndex(step => step.uses === 'pnpm/action-setup@v4')
  const nodeSetupIndex = steps.findIndex(step => step.uses === 'actions/setup-node@v4')
  const installIndex = steps.findIndex(step => step.name === 'Install dependencies')
  const materializeIndex = steps.findIndex(step => step.name === 'Materialize immutable translation source')
  assert.ok(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < materializeIndex)
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/)
  assert.match(workflow, /sourceDelta\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/)
  assert.match(workflow, /manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/)
})

test('fetch preparation blocks paid translation until publication readiness regressions pass', () => {
  const workflow = yaml.load(fs.readFileSync(path.join(process.cwd(), '.github/workflows/fetch-docs.yml'), 'utf8'))
  const steps = workflow.jobs.prepare.steps
  const installIndex = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
  const readinessIndex = steps.findIndex(step => step.name === 'Verify translation publication readiness')
  const cardIndex = steps.findIndex(step => step.name === 'Create progress card')
  assert.ok(installIndex >= 0 && readinessIndex > installIndex && readinessIndex < cardIndex)
  const command = steps[readinessIndex].run
  assert.equal(command, 'node --test scripts/build/write-provenance.test.mjs scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/prepare-content-group-workspace.test.js scripts/docs-workflow/source-publication-barrier.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js')
})

test('manual translation wrapper calls the target-aware reusable workflow without legacy automation', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/translate-codex.yml'), 'utf8')
  assert.doesNotMatch(workflow, /workflow_run|git-auto-commit|git push/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /uses: \.\/.github\/workflows\/translate-content\.yml/)
  assert.match(workflow, /target: \$\{\{ inputs\.target \}\}/)
  assert.doesNotMatch(workflow, /secrets: inherit/)
  assert.match(workflow, /secrets:\n      TRANSLATION_AGENT_API_KEY: \$\{\{ secrets\.TRANSLATION_AGENT_API_KEY \}\}\n      REVIEW_AGENT_API_KEY: \$\{\{ secrets\.REVIEW_AGENT_API_KEY \}\}/)
  assert.match(workflow, /target_branch: \$\{\{ inputs\.target_branch \}\}/)
})

test('top-level production workflows resolve separate tooling and source refs once', () => {
  const fetchWorkflow = yaml.load(fs.readFileSync(path.join(process.cwd(), '.github/workflows/fetch-docs.yml'), 'utf8'))
  assert.equal(fetchWorkflow.on.workflow_dispatch.inputs.tooling_ref.default, 'master')
  assert.equal(fetchWorkflow.on.workflow_dispatch.inputs.source_ref.default, 'dev')
  for (const output of ['tooling_sha', 'source_sha']) assert.ok(fetchWorkflow.jobs.prepare.outputs[output])
  const fetchSource = fs.readFileSync(path.join(process.cwd(), '.github/workflows/fetch-docs.yml'), 'utf8')
  assert.match(fetchSource, /SOURCE_REF: \$\{\{ github\.event\.inputs\.source_ref \|\| 'dev' \}\}/)
  assert.match(fetchSource, /tooling_sha=%s\\nsource_sha=%s/)

  const translationWorkflow = yaml.load(fs.readFileSync(path.join(process.cwd(), '.github/workflows/translate-content.yml'), 'utf8'))
  assert.equal(translationWorkflow.on.workflow_dispatch.inputs.source_ref.default, 'dev')
  assert.equal(translationWorkflow.on.workflow_dispatch.inputs.source_sha, undefined)
  assert.equal(translationWorkflow.on.workflow_call.inputs.source_sha.required, true)
  const translationSource = fs.readFileSync(path.join(process.cwd(), '.github/workflows/translate-content.yml'), 'utf8')
  assert.match(translationSource, /SOURCE_REF: \$\{\{ inputs\.source_ref \}\}/)
  assert.match(translationSource, /source_sha=\$\(git rev-parse/)
  assert.match(translationSource, /ref: ['"]?\$\{\{ inputs\.tooling_sha \}\}['"]?/)
})

test('translation workers restore and always upload per-file recovery artifacts', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  const workflow = yaml.load(source)
  assert.equal(workflow.on.workflow_call.inputs.recovery_run_id.default, '')
  const steps = workflow.jobs.translate.steps
  const downloadIndex = steps.findIndex(step => step.name === 'Download requested recovery artifacts')
  const agentsIndex = steps.findIndex(step => step.name === 'Run translation agents')
  const createIndex = steps.findIndex(step => step.name === 'Create per-file recovery artifact')
  const uploadIndex = steps.findIndex(step => step.name === 'Upload per-file recovery artifact')
  const validateIndex = steps.findIndex(step => step.name === 'Validate unbatched translated group')
  assert.ok(downloadIndex >= 0 && downloadIndex < agentsIndex)
  assert.ok(agentsIndex < createIndex && createIndex < uploadIndex && uploadIndex < validateIndex)
  assert.match(steps[agentsIndex].run, /--recovery-dir "\$RECOVERY_DOWNLOAD_DIR"/)
  assert.equal(steps[createIndex].if, '${{ always() && inputs.should_translate && steps.manifest.outputs.count != \'0\' }}')
  assert.equal(steps[uploadIndex].if, '${{ always() && inputs.should_translate && steps.manifest.outputs.count != \'0\' }}')
  assert.equal(steps[uploadIndex].with['retention-days'], 30)
  assert.match(steps[uploadIndex].with.name, /translation-recovery-/)
})
