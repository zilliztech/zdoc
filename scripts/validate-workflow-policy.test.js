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

test('publish-capable top-level workflows share the durable dev queue', () => {
  const fetch = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const recovery = yaml.load(fs.readFileSync('.github/workflows/recover-translation.yml', 'utf8'))
  const translation = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  const tooling = yaml.load(fs.readFileSync('.github/workflows/sync-master-tooling-to-dev.yml', 'utf8'))
  assert.deepEqual(fetch.concurrency, {group: 'docs-production-dev', queue: 'max'})
  assert.deepEqual(tooling.concurrency, {group: 'docs-production-dev', queue: 'max'})
  assert.deepEqual(recovery.concurrency, {
    group: "${{ inputs.publish && 'docs-production-dev' || format('translation-recovery-readonly-{0}', github.run_id) }}",
    queue: 'max',
  })
  assert.equal(translation.concurrency.queue, 'max')
  assert.equal(
    translation.concurrency.group,
    "${{ inputs.publish && !inputs.production_queue_owned && 'docs-production-dev' || format('translation-readonly-{0}', github.run_id) }}",
  )
})

test('operator recovery grants the reusable Translation writer permission ceiling', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'translation-recovery-permissions-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, {recursive: true})
    const file = path.join(directory, 'recover-translation.yml')
    const source = fs.readFileSync(file, 'utf8')
    const mutated = source.replace('  contents: write', '  contents: read')
    assert.notEqual(mutated, source)
    fs.writeFileSync(file, mutated)
    assert.ok(validateWorkflowPolicies(directory).includes('recover-translation.yml: caller must grant contents: write so publish_ready can publish'))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('operator recovery keeps preparation read-only while granting only the reusable call its writer ceiling', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/recover-translation.yml', 'utf8'))
  assert.deepEqual(workflow.jobs.prepare_recovery.permissions, {actions: 'read', contents: 'read'})
  assert.deepEqual(workflow.jobs.run_translation.permissions, {actions: 'read', contents: 'write'})
})

test('reusable workflows never reacquire the production dev queue', () => {
  for (const file of fs.readdirSync('.github/workflows').filter(name => name.startsWith('_') && /\.ya?ml$/.test(name))) {
    const workflow = yaml.load(fs.readFileSync(path.join('.github/workflows', file), 'utf8'))
    assert.notEqual(workflow?.concurrency?.group, 'docs-production-dev', file)
  }
})

test('workflow policy rejects durable production dev queue regressions', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const fixtures = [
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace('  queue: max', '  cancel-in-progress: false'),
      expected: 'fetch-docs.yml: production dev queue owner must use group docs-production-dev with queue: max',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => `concurrency:\n  group: docs-production-dev\n  queue: max\n\n${source}`,
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => `concurrency: docs-production-dev\n\n${source}`,
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => `concurrency:\n  group: DOCS-PRODUCTION-DEV\n  queue: max\n\n${source}`,
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => `concurrency: DOCS-PRODUCTION-DEV\n\n${source}`,
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => `concurrency: external-link-watchdog-docs-production-dev-metrics\n\n${source}`,
      allowed: true,
      unexpected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        '  verify:\n    concurrency:\n      group: docs-production-dev\n      queue: max\n    runs-on: ubuntu-latest',
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        '  verify:\n    concurrency:\n      group: DOCS-PRODUCTION-DEV\n      queue: max\n    runs-on: ubuntu-latest',
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        "  verify:\n    concurrency:\n      group: ${{ inputs.target_branch == 'dev' && 'docs-production-dev' || 'verify-readonly' }}\n      queue: max\n    runs-on: ubuntu-latest",
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        '  verify:\n    concurrency: DOCS-PRODUCTION-DEV\n    runs-on: ubuntu-latest',
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        "  verify:\n    concurrency: ${{ inputs.target_branch == 'dev' && 'DOCS-PRODUCTION-DEV' || 'verify-readonly' }}\n    runs-on: ubuntu-latest",
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        '  verify:\n    concurrency: ${{ inputs.target_branch == "dev" && "DOCS-PRODUCTION-DEV" || "verify-readonly" }}\n    runs-on: ubuntu-latest',
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        '  verify:\n    concurrency: docs-production-dev\n    runs-on: ubuntu-latest',
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: '_verify-docs.yml',
      mutate: source => source.replace(
        '  verify:\n    runs-on: ubuntu-latest',
        "  verify:\n    concurrency: ${{ inputs.target_branch == 'dev' && 'docs-production-dev' || 'verify-readonly' }}\n    runs-on: ubuntu-latest",
      ),
      expected: '_verify-docs.yml: reusable workflow must not reacquire docs-production-dev',
    },
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace(
        'concurrency:\n  group: docs-production-dev\n  queue: max',
        'concurrency: docs-production-dev',
      ),
      expected: 'fetch-docs.yml: production dev queue owner must use group docs-production-dev with queue: max',
    },
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace(
        '  prepare:\n    runs-on: ubuntu-latest',
        '  prepare:\n    concurrency:\n      group: docs-production-dev\n      queue: max\n    runs-on: ubuntu-latest',
      ),
      expected: 'fetch-docs.yml: job-level concurrency must not reacquire docs-production-dev',
    },
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace(
        '  prepare:\n    runs-on: ubuntu-latest',
        '  prepare:\n    concurrency: DOCS-PRODUCTION-DEV\n    runs-on: ubuntu-latest',
      ),
      expected: 'fetch-docs.yml: job-level concurrency must not reacquire docs-production-dev',
    },
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace(
        '  prepare:\n    runs-on: ubuntu-latest',
        '  prepare:\n    concurrency: docs-production-dev\n    runs-on: ubuntu-latest',
      ),
      expected: 'fetch-docs.yml: job-level concurrency must not reacquire docs-production-dev',
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace(
        "  group: ${{ inputs.publish && !inputs.production_queue_owned && 'docs-production-dev' || format('translation-readonly-{0}', github.run_id) }}",
        '  group: docs-production-dev',
      ),
      expected: 'translate-codex.yml: read-only Translation must use a unique concurrency group',
    },
    {
      file: '_queue-bypass.yaml',
      sourceFile: '_verify-docs.yml',
      mutate: source => `concurrency: docs-production-dev\n\n${source}`,
      expected: '_queue-bypass.yaml: reusable workflow must not reacquire docs-production-dev',
    },
  ]

  for (const fixture of fixtures) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'production-dev-queue-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const file = path.join(directory, fixture.file)
      const source = fs.readFileSync(path.join(directory, fixture.sourceFile || fixture.file), 'utf8')
      const mutated = fixture.mutate(source)
      assert.notEqual(mutated, source, `${fixture.file} mutation must change source`)
      fs.writeFileSync(file, mutated)
      const errors = validateWorkflowPolicies(directory)
      if (fixture.allowed) assert.ok(!errors.includes(fixture.unexpected), fixture.unexpected)
      else assert.ok(errors.includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('workflow policy rejects action majors that still target the deprecated Node 20 runtime', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'node-action-runtime-policy-'))
  const upgrades = [
    ['actions/checkout@v4', 'actions/checkout@v5'],
    ['actions/setup-node@v4', 'actions/setup-node@v5'],
    ['pnpm/action-setup@v4', 'pnpm/action-setup@v5'],
    ['actions/upload-artifact@v4', 'actions/upload-artifact@v6'],
    ['actions/download-artifact@v4', 'actions/download-artifact@v7'],
    ['actions/cache/restore@v4', 'actions/cache/restore@v5'],
    ['actions/cache/save@v4', 'actions/cache/save@v5'],
  ]
  try {
    fs.cpSync(sourceDirectory, directory, {recursive: true})
    for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.yml'))) {
      const filePath = path.join(directory, file)
      let source = fs.readFileSync(filePath, 'utf8')
      for (const [oldReference, newReference] of upgrades) {
        source = source.replaceAll(oldReference, newReference)
      }
      fs.writeFileSync(filePath, source)
    }
    const file = path.join(directory, 'fetch-docs.yml')
    const source = fs.readFileSync(file, 'utf8')
    assert.ok(source.includes('actions/checkout@v5'))
    fs.writeFileSync(file, source.replace('actions/checkout@v5', 'actions/checkout@v4'))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'fetch-docs.yml: actions/checkout@v4 uses the deprecated Node 20 action runtime; require @v5 or newer',
    ))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('manual translation entry selects recoverable locale groups before paid work', () => {
  const source = fs.readFileSync('.github/workflows/translate-content.yml', 'utf8')
  const workflow = yaml.load(source)
  const inputs = workflow.on.workflow_dispatch.inputs
  assert.deepEqual(inputs.locale.options, ['ja-JP', 'zh-CN', 'all'])
  assert.deepEqual(inputs.group.options, ['all', 'guides', 'python', 'java', 'node', 'go', 'cli', 'rest', 'tools'])
  assert.deepEqual(inputs.mode.options, ['auto', 'full', 'incremental'])
  assert.equal(inputs.mode.default, 'auto')
  assert.equal(inputs.publish.default, false)
  assert.equal(workflow.on.workflow_call.inputs.publish.default, false)
  assert.equal(inputs.source_ref.default, 'dev')
  assert.equal(inputs.target_branch.default, 'dev')
  assert.equal(inputs.tooling_sha.required, true)
  assert.equal(inputs.recovery_run_id.required, false)
  assert.equal(inputs.batch_size.default, 25)

  assert.match(source, /selection\.js --locale "\$INPUT_LOCALE" --group "\$INPUT_GROUP"/)
  assert.equal(workflow.jobs.translate.needs, 'prepare')
  assert.equal(workflow.jobs.translate.strategy['max-parallel'], 1)
  assert.equal(workflow.jobs.translate.strategy['fail-fast'], true)
  assert.equal(workflow.jobs.translate.with.mode, '${{ inputs.mode }}')
  assert.equal(workflow.jobs.translate.with.recovery_run_id, '${{ inputs.recovery_run_id }}')
  assert.match(source, /if: \$\{\{ inputs\.group == 'all' && inputs\.publish/)
  assert.match(source, /validate-reference --site zh-CN/)
  assert.doesNotMatch(source, /pnpm run build:(?:en|zh-CN)/)
})

test('English production defaults to no translation or site build work', () => {
  const source = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const workflow = yaml.load(source)
  assert.equal(workflow.on.workflow_dispatch.inputs.run_translations.type, 'boolean')
  assert.equal(workflow.on.workflow_dispatch.inputs.run_translations.default, false)
  assert.equal(workflow.jobs.prepare.outputs.run_translations, '${{ steps.refs.outputs.run_translations }}')
  const paidJobs = Object.entries(workflow.jobs).filter(([, job]) => job?.secrets?.TRANSLATION_AGENT_API_KEY)
  for (const [name, job] of paidJobs) {
    assert.match(String(job.if || ''), /needs\.prepare\.outputs\.run_translations == 'true'/, `${name} must be explicitly requested`)
  }
  assert.doesNotMatch(source, /needs\.prepare\.outputs\.run_translations != 'true'[\s\S]{0,200}(?:build:en|build:zh-CN)/)
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

test('workflow policy rejects external link watchdog boundary regressions', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const original = fs.readFileSync(path.join(sourceDirectory, 'external-link-watchdog.yml'), 'utf8')
  const retiredExternalScanner = ['check', '404'].join('-')
  const cases = [
    {
      label: 'pull request trigger',
      mutate: source => source.replace('  workflow_dispatch:\n', '  workflow_dispatch:\n  pull_request:\n'),
      expected: 'external-link-watchdog.yml: watchdog triggers must be the daily schedule and manual dispatch only',
    },
    {
      label: 'retired scanner command',
      mutate: source => source.replace(
        'pnpm docs-tooling check-links --site en --output tmp/external-link-watchdog/latest.md',
        `node scripts/${retiredExternalScanner}.js`,
      ),
      expected: 'external-link-watchdog.yml: watchdog must use the canonical rendered-site checker and no retired scanner',
    },
    {
      label: 'stateful cache',
      mutate: source => source.replace(
        '      - uses: pnpm/action-setup@v5',
        '      - uses: actions/cache@v5\n        with:\n          path: tmp/cache\n          key: external-links\n\n      - uses: pnpm/action-setup@v5',
      ),
      expected: 'external-link-watchdog.yml: watchdog must not cache or suppress external-link observations',
    },
    {
      label: 'cancel in progress',
      mutate: source => source.replace('  cancel-in-progress: false', '  cancel-in-progress: true'),
      expected: 'external-link-watchdog.yml: watchdog concurrency must serialize scans without cancellation',
    },
    {
      label: 'expiry-only report card',
      mutate: source => source.replace(
        '      - name: Create documentation site report card',
        "      - name: Create documentation site report card\n        if: ${{ steps.scan.outputs.expired_count != '0' }}",
      ),
      expected: 'external-link-watchdog.yml: report card must run after every successful scan',
    },
    {
      label: 'old report title',
      mutate: source => source.replace('Documentation Site Change & Link Health Report', 'External Link Watchdog'),
      expected: 'external-link-watchdog.yml: report card must use the approved title',
    },
    {
      label: 'constant failure presentation',
      mutate: source => source.replace('--status "$CARD_STATUS"', '--status fail'),
      expected: 'external-link-watchdog.yml: report card presentation must derive from confirmed expiry',
    },
    {
      label: 'report before artifact',
      mutate: source => {
        const uploadStart = source.indexOf('      - name: Upload external link report')
        const noteStart = source.indexOf('      - name: Build documentation site change and link health note')
        const uploadBlock = source.slice(uploadStart, noteStart)
        const withoutUpload = source.slice(0, uploadStart) + source.slice(noteStart)
        const createStart = withoutUpload.indexOf('      - name: Create documentation site report card')
        return withoutUpload.slice(0, createStart) + uploadBlock + withoutUpload.slice(createStart)
      },
      expected: 'external-link-watchdog.yml: complete report upload must precede Feishu reporting',
    },
    {
      label: 'non-failing scan',
      mutate: source => source.replace(
        '        id: scan\n        env:',
        '        id: scan\n        continue-on-error: true\n        env:',
      ),
      expected: 'external-link-watchdog.yml: rendered-site scan must fail closed on checker errors',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'external-link-watchdog-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const mutated = fixture.mutate(original)
      assert.notEqual(mutated, original, `${fixture.label} mutation must change source`)
      fs.writeFileSync(path.join(directory, 'external-link-watchdog.yml'), mutated)
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('translation workflows declare immutable target identity and exact target validation', () => {
  for (const file of ['_prepare-translation-batches.yml', '_translate-content-group.yml']) {
    const workflow = yaml.load(fs.readFileSync(path.join('.github/workflows', file), 'utf8'))
    const inputs = workflow.on.workflow_call.inputs
    for (const input of ['target', 'tooling_sha', 'source_baseline_sha', 'source_checkpoint_sha']) {
      assert.equal(inputs[input]?.required, true, `${file} must require ${input}`)
    }
  }
  for (const file of ['_translate-publish-batch.yml', '_publish-translation-batches.yml']) {
    const workflow = yaml.load(fs.readFileSync(path.join('.github/workflows', file), 'utf8'))
    const inputs = workflow.on.workflow_call.inputs
    for (const input of ['target', 'tooling_sha', 'source_sha']) assert.equal(inputs[input]?.required, true, `${file} must require ${input}`)
  }
  const publisherInputs = yaml.load(fs.readFileSync('.github/workflows/_publish-content-group.yml', 'utf8')).on.workflow_call.inputs
  for (const input of ['target', 'tooling_sha', 'source_sha']) assert.ok(publisherInputs[input], `_publish-content-group.yml must declare ${input}`)

  const wrapper = yaml.load(fs.readFileSync('.github/workflows/translate-content.yml', 'utf8'))
  assert.deepEqual(wrapper.on.workflow_dispatch.inputs.locale.options, ['ja-JP', 'zh-CN', 'all'])
  assert.equal(wrapper.on.workflow_dispatch.inputs.tooling_sha?.required, true)
  assert.equal(wrapper.on.workflow_dispatch.inputs.source_ref?.default, 'dev')
  for (const input of ['tooling_sha', 'source_sha']) assert.equal(wrapper.on.workflow_call.inputs[input]?.required, true)
  assert.equal(wrapper.concurrency, undefined)
  const wrapperSource = fs.readFileSync('.github/workflows/translate-content.yml', 'utf8')
  assert.ok(wrapperSource.indexOf('name: Validate immutable tooling identity') < wrapperSource.indexOf('uses: actions/checkout@v5'))
  assert.match(wrapperSource, /ref: ['"]?\$\{\{ inputs\.tooling_sha \}\}['"]?/)
  assert.match(wrapperSource, /validate-reference --site zh-CN/)
  assert.doesNotMatch(wrapperSource, /refs\/remotes\/origin\/(?:master|\$TARGET_BRANCH)|REQUESTED_(?:TOOLING|SOURCE)_SHA|git rev-parse .*TARGET_BRANCH/)

  const compatibility = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  assert.equal(compatibility.on.workflow_dispatch.inputs.handoff_json?.required, true)
  for (const input of ['locale', 'group', 'tooling_sha', 'source_shas_json', 'target_branch']) assert.equal(compatibility.on.workflow_dispatch.inputs[input], undefined)
  assert.equal(compatibility.on.workflow_dispatch.inputs.publish.default, false)
  assert.deepEqual(compatibility.concurrency, {
    group: "${{ inputs.publish && !inputs.production_queue_owned && 'docs-production-dev' || format('translation-readonly-{0}', github.run_id) }}",
    queue: 'max',
  })
  const compatibilitySource = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')
  assert.match(compatibilitySource, /strategy:[\s\S]*matrix: \$\{\{ fromJSON\(needs\.prepare\.outputs\.sdk_producer_matrix\) \}\}/)
  assert.match(compatibilitySource, /publish_ready:[\s\S]*publication-coordinator\.js[\s\S]*aggregate:/)
  assert.doesNotMatch(compatibilitySource, /^  publish_(?:ja|zh)_|^  reconcile_(?:localization_inventory|reference_state|published_state):/m)
  assert.doesNotMatch(compatibilitySource, /zh-CN-tools|tools-translations\.json/)
  const source = fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8')
  assert.match(source, /validate-group\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP"/)
  assert.doesNotMatch(source, /validate-reference --site zh-CN|pnpm run build:(?:en|zh-CN)/)
  assert.match(source, /applySourceDelta\.js --target "\$TRANSLATION_TARGET" --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/)
  for (const name of [
    'ZDOC_PROVENANCE_CANDIDATE_TARGET',
    'ZDOC_PROVENANCE_CANDIDATE_TOOLING_SHA',
    'ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA',
  ]) {
    assert.equal(
      yaml.load(source).jobs.translate.steps.find(step => step.name === 'Validate unbatched translated group').env[name],
      name.endsWith('TARGET') ? '${{ inputs.target }}' : name.endsWith('TOOLING_SHA') ? '${{ inputs.tooling_sha }}' : '${{ inputs.source_checkpoint_sha }}',
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

test('site classifier checks out only the shallow contract tree and fetches a missing comparison base by exact SHA', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/site-validation.yml', 'utf8'))
  const steps = workflow.jobs.classify.steps
  const checkout = steps.find(step => step.name === 'Check out candidate')
  const comparison = steps.find(step => step.name === 'Fetch comparison base')

  assert.equal(checkout.uses, 'actions/checkout@v5')
  assert.equal(checkout.with['fetch-depth'], 2)
  assert.equal(checkout.with['sparse-checkout'], 'deploy/contracts')
  assert.equal(comparison.if, "${{ github.event_name != 'workflow_dispatch' || inputs.site == 'auto' }}")
  assert.equal(comparison.env.BASE_SHA, '${{ github.event.pull_request.base.sha || github.event.before || github.sha }}')
  assert.match(comparison.run, /git cat-file -e "\$BASE_SHA\^\{commit\}"/)
  assert.match(comparison.run, /git fetch --no-tags --filter=blob:none --depth=1 origin -- "\$BASE_SHA"/)
})

test('site classifier disables package-manager caching when pnpm is not installed', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/site-validation.yml', 'utf8'))
  const setupNode = workflow.jobs.classify.steps.find(step => step.name === 'Set up Node.js')

  assert.equal(setupNode.uses, 'actions/setup-node@v5')
  assert.equal(setupNode.with['package-manager-cache'], false)
})

test('workflow policy rejects classifier checkout regressions that restore whole-repository fetches', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    ['fetch-depth: 2', 'fetch-depth: 0'],
    ['sparse-checkout: deploy/contracts', 'sparse-checkout: .'],
    ['git fetch --no-tags --filter=blob:none --depth=1 origin -- "$BASE_SHA"', 'git fetch origin "$BASE_SHA"'],
  ]
  for (const [from, to] of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'site-classifier-fetch-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const file = path.join(directory, 'site-validation.yml')
      const source = fs.readFileSync(file, 'utf8')
      assert.ok(source.includes(from), `site-validation.yml must contain ${from}`)
      fs.writeFileSync(file, source.replace(from, to))
      assert.ok(validateWorkflowPolicies(directory).includes('site-validation.yml: classifier must use a shallow sparse checkout and exact comparison-base fetch'))
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('master tooling sync keeps the full commit graph without downloading historical blobs', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/sync-master-tooling-to-dev.yml', 'utf8'))
  const checkout = workflow.jobs.sync.steps.find(step => step.name === 'Check out workflow tooling')

  assert.equal(checkout.uses, 'actions/checkout@v5')
  assert.equal(checkout.with.ref, '${{ github.sha }}')
  assert.equal(checkout.with['fetch-depth'], 0)
  assert.equal(checkout.with.filter, 'blob:none')
})

test('Chinese Reference validation jobs shallow-checkout the candidate and fetch only the manifest source commit', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/site-validation.yml', 'utf8'))
  for (const jobName of ['build_zh_cn', 'reference_coverage']) {
    const steps = workflow.jobs[jobName].steps
    const checkout = steps.find(step => step.uses === 'actions/checkout@v5')
    const sourceFetch = steps.find(step => step.name === 'Fetch immutable Reference source commit')

    assert.equal(checkout.with.ref, '${{ needs.classify.outputs.source_sha }}')
    assert.equal(checkout.with['fetch-depth'], 1)
    assert.match(sourceFetch.run, /generated\/en\/manifests\/reference\.json/)
    assert.match(sourceFetch.run, /\[\[ "\$source_commit" =~ \^\[0-9a-f\]\{40\}\$ \]\]/)
    assert.match(sourceFetch.run, /git fetch --no-tags --depth=1 origin -- "\$source_commit"/)
    assert.match(sourceFetch.run, /git cat-file -e "\$source_commit\^\{commit\}"/)
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

test('workflow policy rejects Chinese Tools gates that bypass provenance or require unavailable source state', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      from: 'toolsSidebarReachable',
      to: 'toolsSidebarUnchecked',
    },
    {
      from: 'run: test "$ZH_CN_RESULT" = success',
      to: 'run: true',
    },
    {
      from: 'run: test "$ZH_CN_RESULT" = success',
      to: 'run: |\n          test "$ZH_CN_RESULT" = success\n          node scripts/validate-guides-source-contract.js --site zh-CN',
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
      assert.ok(validateWorkflowPolicies(directory).includes('site-validation.yml: Chinese Tools validation must rely on the provenance-enforced Chinese build without unavailable source-state checks'))
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('workflow policy rejects generated sidebar validation without an explicit site', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'sidebar-site-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const file = path.join(directory, '_fetch-content-group.yml')
    const source = fs.readFileSync(file, 'utf8')
    assert.ok(source.includes('node scripts/validate-generated-sidebars.js --site "$SITE"'))
    fs.writeFileSync(file, source.replace('node scripts/validate-generated-sidebars.js --site "$SITE"', 'node scripts/validate-generated-sidebars.js'))
    assert.ok(validateWorkflowPolicies(directory).includes('_fetch-content-group.yml: generated sidebar validation must declare an explicit site'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
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
      mutate: source => source.replace('          ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA: ${{ inputs.source_checkpoint_sha }}\n', ''),
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
      expected: 'translate-content.yml: validate exact immutable SHAs before checkout without branch-tip fallback',
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('matrix: ${{ fromJSON(needs.prepare.outputs.sdk_producer_matrix) }}', 'matrix: {target: [ja-JP]}'),
      expected: 'translate-codex.yml: must run selected SDK translation producers through one matrix',
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('--handoff-json "$HANDOFF_JSON" --repository "$GITHUB_WORKSPACE"', '--handoff-json "$HANDOFF_JSON"'),
      expected: 'translate-codex.yml: must validate the exact translation handoff before paid work',
    },
    {
      file: '_translate-content-group.yml',
      mutate: source => source.replace(
        'node scripts/translation/sourceDelta.js --repository "$GITHUB_WORKSPACE"',
        'git diff --name-status "$TOOLING_SHA" "$SOURCE_CHECKPOINT_SHA"\n          node scripts/translation/sourceDelta.js --repository "$GITHUB_WORKSPACE"',
      ),
      expected: '_translate-content-group.yml: tooling identity must never be a source-delta endpoint',
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
      mutate: source => source.replace(
        'validate-group.js --target "$TRANSLATION_TARGET" --group "$GROUP"',
        'validate-group.js --target zh-CN-tools --group tools',
      ),
      expected: '_translate-content-group.yml: unbatched translations must use group-local target validation',
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
    ['external-link-watchdog.yml', 'watchdog'],
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
  const checkpointPublicationPath = path.join(directory, 'checkpoint-publication.js')
  try {
    fs.writeFileSync(checkpointPublicationPath, 'git add --all -- "${paths[@]}"\n')
    const errors = validateWorkflowPolicies(undefined, { checkpointPublicationPath })
    assert.ok(errors.includes('publish-checkpoint.sh: checkpoint publisher must select stageable manifest paths'))
    assert.ok(errors.includes('publish-checkpoint.sh: checkpoint publisher must use NUL-delimited literal pathspec staging'))
    assert.ok(errors.includes('publish-checkpoint.sh: checkpoint publisher must verify staged manifest scope'))
    assert.ok(errors.includes('publish-checkpoint.sh: direct manifest pathspec staging is not idempotent'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('workflow policy independently requires checkpoint stage selection and verification', () => {
  const publisherSource = fs.readFileSync('scripts/docs-workflow/checkpoint-publication.js', 'utf8')
  const cases = [
    {
      token: 'writeStagePathFile({artifactDir, worktree: publicationWorktree, output: stagePathFile, site})',
      expected: 'publish-checkpoint.sh: checkpoint publisher must select stageable manifest paths',
    },
    {
      token: 'verifyStagedCheckpointPaths({artifactDir, worktree: publicationWorktree, site})',
      expected: 'publish-checkpoint.sh: checkpoint publisher must verify staged manifest scope',
    },
    {
      token: "'docs-validation.'",
      expected: 'publish-checkpoint.sh: checkpoint publisher must validate with pinned tooling',
    },
    {
      token: "path.join(__dirname, '../restore-generated-state.sh'), '--exact', '--ref', baseSha",
      expected: 'publish-checkpoint.sh: checkpoint publisher must materialize the exact target state for validation',
    },
    {
      token: "command(validationWorktree, 'bash', ['-o', 'errexit', '-o', 'nounset', '-o', 'pipefail', '-c', validationCommand]",
      expected: 'publish-checkpoint.sh: checkpoint publisher must run validation in the pinned tooling worktree',
    },
  ]

  const baselineErrors = validateWorkflowPolicies(undefined, {
    checkpointPublicationPath: path.join(process.cwd(), 'scripts/docs-workflow/checkpoint-publication.js'),
  })
  for (const fixture of cases) assert.equal(baselineErrors.includes(fixture.expected), false)

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'publisher-policy-'))
    const checkpointPublicationPath = path.join(directory, 'checkpoint-publication.js')
    try {
      assert.ok(publisherSource.includes(fixture.token))
      fs.writeFileSync(checkpointPublicationPath, publisherSource.replace(fixture.token, 'REMOVED_POLICY_TOKEN'))
      assert.ok(validateWorkflowPolicies(undefined, { checkpointPublicationPath }).includes(fixture.expected))
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
    source => source.replace('  push:\n    branches:\n      - dev\n      - master', '  push:\n    branches:\n      - "**"\n      - master'),
    source => source.replace(/  push:\n    branches:\n      - dev\n      - master\n/, '  push:\n'),
    source => source.replace(/  push:\n    branches:\n      - dev\n      - master/, '  push: {}'),
  ]) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'staging-trigger-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, 'site-validation.yml')
      fs.writeFileSync(file, mutate(fs.readFileSync(file, 'utf8')))
      assert.ok(validateWorkflowPolicies(directory).includes('site-validation.yml: push deployment triggers must exclude docs-translation-staging/**'))
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

test('Fetch producers stay parallel while publication and derived-state writers stay serialized', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const source = fs.readFileSync(workflowPath, 'utf8')
  const workflow = yaml.load(source)
  assert.deepEqual(workflow.permissions, {contents: 'read', actions: 'read'})
  assert.equal(workflow.jobs.prepare.outputs.publication_selection_artifact_name, '${{ steps.publication_selection.outputs.artifact_name }}')
  assert.equal(workflow.jobs.prepare.outputs.publication_selection_sha256, '${{ steps.publication_selection.outputs.selection_sha256 }}')
  assert.equal(workflow.jobs.prepare.outputs.initial_target_sha, '${{ steps.refs.outputs.initial_target_sha }}')
  assert.match(source, /fetch-publication-selection\.js selection/)
  assert.match(source, /name: publication-selection-fetch-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/)

  const units = {
    produce_java: 'source/java', produce_node: 'source/node', produce_go: 'source/go',
    produce_cli: 'source/cli', produce_rest: 'source/rest', produce_python: 'source/python',
    produce_guides: 'source/guides-en', produce_zh_guides: 'source/guides-zh-CN',
  }
  for (const [jobName, unitKey] of Object.entries(units)) {
    const job = workflow.jobs[jobName]
    assert.equal(job.with.publication_selection_artifact_name, '${{ needs.prepare.outputs.publication_selection_artifact_name }}')
    assert.equal(job.with.publication_selection_sha256, '${{ needs.prepare.outputs.publication_selection_sha256 }}')
    assert.equal(job.with.publication_unit_key, unitKey)
  }
  const coordinator = workflow.jobs.publish_ready
  assert.deepEqual(coordinator.needs, ['prepare'])
  assert.deepEqual(coordinator.permissions, {actions: 'read', contents: 'write'})
  const coordinatorPublish = coordinator.steps.find(step => step.id === 'publish')
  assert.equal(coordinatorPublish.uses, 'actions/github-script@v8')
  assert.equal(coordinatorPublish.run, undefined)
  assert.match(coordinatorPublish.with.script, /process\.env\.PUBLISH === 'true' \? 'publish' : 'artifact_only'/)
  assert.match(coordinatorPublish.with.script, /exec\.exec\('node', \[[\s\S]*publication-coordinator\.js[\s\S]*'--mode', mode/)
  assert.doesNotMatch(JSON.stringify(coordinator), /APP_ID|APP_SECRET|FEISHU_HOST/)
  for (const legacy of ['publish_java', 'publish_node', 'publish_go', 'publish_cli', 'publish_rest', 'publish_python', 'publish_guides', 'publish_zh_guides', 'resolve_final']) {
    assert.equal(workflow.jobs[legacy], undefined)
  }
  assert.deepEqual(workflow.jobs.source_publication_barrier.needs, ['prepare', 'publish_ready', 'reconcile_reference_state'])
  assert.deepEqual(workflow.jobs.prepare_translation_handoff.needs, ['prepare', 'source_publication_barrier', 'publish_ready', 'reconcile_reference_state'])
  assert.deepEqual(workflow.jobs.verify.needs, ['prepare', 'publish_ready', 'reconcile_reference_state'])
  assert.deepEqual(workflow.jobs.aggregate.needs, ['prepare', 'publish_ready', 'reconcile_reference_state', 'prepare_translation_handoff', 'dispatch_translations', 'verify'])
  assert.equal(workflow.jobs.monitor_docs_progress.with.publication_run_attempt, '${{ fromJSON(github.run_attempt) }}')
  assert.equal(workflow.jobs.monitor_docs_progress.with.publication_selection_sha256, '${{ needs.prepare.outputs.publication_selection_sha256 }}')
  assert.deepEqual(workflow.jobs.dispatch_translations.permissions, {actions: 'write', contents: 'read'})
})

test('Fetch independently reconciles Reference derived state before handoff and final verification', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const workflow = yaml.load(fs.readFileSync(workflowPath, 'utf8'))
  const reconciliation = workflow.jobs.reconcile_reference_state
  assert.deepEqual(reconciliation.needs, ['prepare', 'publish_ready'])
  assert.deepEqual(reconciliation.permissions, {actions: 'read', contents: 'write'})
  assert.doesNotMatch(String(reconciliation.if), /run_translations/)
  const step = reconciliation.steps.find(candidate => candidate.name === 'Reconcile and publish Fetch Reference derived state')
  assert.match(step.run, /fetch-reference-reconciliation\.js plan/)
  assert.match(step.run, /restore-generated-state\.sh --exact --ref "\$target_sha"/)
  assert.match(step.run, /reference-manifest --source content\/en\/reference --target content\/zh-CN\/reference --source-commit "\$source_sha" --write/)
  assert.match(step.run, /validate-reference --site zh-CN/)
  assert.match(step.run, /git -C "\$publish_worktree" push origin "HEAD:refs\/heads\/\$target_branch"/)
  assert.deepEqual(workflow.jobs.source_publication_barrier.needs, ['prepare', 'publish_ready', 'reconcile_reference_state'])
  assert.deepEqual(workflow.jobs.verify.needs, ['prepare', 'publish_ready', 'reconcile_reference_state'])
  assert.deepEqual(workflow.jobs.aggregate.needs, ['prepare', 'publish_ready', 'reconcile_reference_state', 'prepare_translation_handoff', 'dispatch_translations', 'verify'])
})

test('workflow policy rejects Fetch without independent Reference reconciliation', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'fetch-reference-reconciliation-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, {recursive: true})
    const file = path.join(directory, 'fetch-docs.yml')
    const source = fs.readFileSync(file, 'utf8')
    const mutated = source.replace('  reconcile_reference_state:\n', '  disabled_reference_state_reconciliation:\n')
    assert.notEqual(mutated, source)
    fs.writeFileSync(file, mutated)
    assert.ok(validateWorkflowPolicies(directory).includes(
      'fetch-docs.yml: Fetch must independently reconcile Reference derived state after source publication',
    ))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('Fetch source publication barrier installs its runtime before validating results', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const workflow = yaml.load(fs.readFileSync(workflowPath, 'utf8'))
  const steps = workflow.jobs.source_publication_barrier.steps
  const pnpmSetupIndex = steps.findIndex(step => step.uses === 'pnpm/action-setup@v5')
  const nodeSetupIndex = steps.findIndex(step => step.uses === 'actions/setup-node@v5')
  const installIndex = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
  const barrierIndex = steps.findIndex(step => step.name === 'Block paid translation until selected sources are published')
  assert.ok(pnpmSetupIndex >= 0)
  assert.ok(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < barrierIndex)
})

test('Fetch translation handoff installs its runtime before building schema v2', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const workflow = yaml.load(fs.readFileSync(workflowPath, 'utf8'))
  const steps = workflow.jobs.prepare_translation_handoff.steps
  const pnpmSetupIndex = steps.findIndex(step => step.uses === 'pnpm/action-setup@v5')
  const nodeSetupIndex = steps.findIndex(step => step.uses === 'actions/setup-node@v5')
  const installIndex = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
  const handoffIndex = steps.findIndex(step => step.name === 'Validate exact downstream translation handoff')
  assert.ok(pnpmSetupIndex >= 0)
  assert.ok(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < handoffIndex)
})

test('Fetch translation handoff consumes the reconciled target while preserving immutable source evidence', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const source = fs.readFileSync(workflowPath, 'utf8')
  const workflow = yaml.load(source)
  const handoff = workflow.jobs.prepare_translation_handoff
  const step = handoff.steps.find(candidate => candidate.name === 'Validate exact downstream translation handoff')
  assert.deepEqual(handoff.needs, ['prepare', 'source_publication_barrier', 'publish_ready', 'reconcile_reference_state'])
  assert.equal(step.env.TARGET_BASELINE_SHA, '${{ needs.reconcile_reference_state.outputs.final_target_sha }}')
  assert.match(step.run, /--fetch-selection "\$RUNNER_TEMP\/publication-selection\/publication-selection\.json"/)
  assert.match(step.run, /--fetch-results "\$RUNNER_TEMP\/publication-results\/publication-results\.json"/)
  assert.match(step.run, /--target-baseline-sha "\$TARGET_BASELINE_SHA"/)
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
      - uses: actions/upload-artifact@v6
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
  assert.equal(workflow.jobs.monitor_docs_progress.with.run_translations, "${{ needs.prepare.outputs.run_translations == 'true' }}")
  assert.equal(workflow.jobs.aggregate.needs.includes('monitor_docs_progress'), false)
  assert.deepEqual(workflow.jobs.finalize_card_fallback.needs, ['prepare', 'aggregate', 'monitor_docs_progress'])
  assert.equal(workflow.jobs.finalize_card_fallback.if, "${{ always() && needs.prepare.outputs.card_id != '' }}")
  assert.match(callerSource, /name: docs-card-report-\$\{\{ github\.run_id \}\}/)
  assert.doesNotMatch(callerSource, /name: Finish progress card/)
  const sourceCard = workflow.jobs.prepare.steps.find(step => step.id === 'card')
  assert.equal(sourceCard['continue-on-error'], true)
  assert.equal(sourceCard.env.CARD_TITLE, 'Zilliz Cloud Docs Build')

  const translationSource = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')
  const translation = yaml.load(translationSource)
  const translationCard = translation.jobs.initialize_translation_card.steps.find(step => step.id === 'card')
  assert.equal(translationCard['continue-on-error'], true)
  assert.match(translationCard.run, /Zilliz Cloud Docs Translation/)
  assert.equal(translation.jobs.monitor_translation_progress.uses, './.github/workflows/_monitor-translation-progress.yml')
  assert.equal(translation.jobs.monitor_translation_progress.if, "${{ always() && needs.initialize_translation_card.outputs.card_id != '' }}")
  assert.equal(translation.jobs.aggregate.needs.includes('monitor_translation_progress'), false)

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

test('workflow validator enforces the separate Build and Translation card contract', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace('CARD_TITLE: Zilliz Cloud Docs Build', 'CARD_TITLE: Legacy Docs Build'),
      expected: /Build card must use the approved title/,
    },
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace("      run_translations: ${{ needs.prepare.outputs.run_translations == 'true' }}\n", ''),
      expected: /Build monitor must receive translation handoff intent/,
    },
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace('name: docs-translation-handoff-${{ github.run_id }}', 'name: docs-translation-handoff'),
      expected: /fixed-schema handoff monitor metadata/,
    },
    {
      file: 'fetch-docs.yml',
      mutate: source => source.replace('resolve-card-artifact-links.js', 'missing-artifact-resolver.js'),
      expected: /resolve exact Guides report artifact links/,
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('Zilliz Cloud Docs Translation', 'Legacy Translation'),
      expected: /Translation card must use the approved title/,
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('    needs: [prepare, publish_ready]\n', '    needs: [prepare, publish_ready, monitor_translation_progress]\n'),
      expected: /Translation monitor must be independent/,
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'report-card-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const file = path.join(directory, fixture.file)
      const source = fs.readFileSync(file, 'utf8')
      const mutated = fixture.mutate(source)
      assert.notEqual(mutated, source, `${fixture.file} mutation must change source`)
      fs.writeFileSync(file, mutated)
      assert.match(validateWorkflowPolicies(directory).join('\n'), fixture.expected)
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
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
        return source.replace('        name: Validate and promote Guides v4 cache candidate', '        name: Validate Guides v4 candidate')
      },
      expected: /restore and validate in v5 then v4 order/,
    },
    {
      mutate(source) {
        return source.replace('steps.source_cache_check.outputs.source_valid }}" != true', 'steps.source_cache_check.outputs.media_valid }}" != true')
      },
      expected: /full fetch must depend only on source validity/,
    },
    {
      mutate(source) {
        return source.replace("if: ${{ steps.source_cache_v5_check.outputs.source_valid != 'true' && steps.source_cache_keys.outputs.v4_restore_enabled == 'true' }}", "if: ${{ steps.source_cache_v5.outputs.cache-hit != 'true' }}")
      },
      expected: /preceding source validity|never trust cache-hit/,
    },
    {
      mutate(source) {
        return source.replace('          restore-keys: ${{ steps.source_cache_keys.outputs.v4_prefix }}', '          restore-keys: guides-source-v4-')
      },
      expected: /self-contained restore and v4 snapshot-scoped fallback/,
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
      expected: /malformed v5 cache payload must be rejected/,
    },
    {
      mutate(source) {
        return `${source}\n# source_cache_v3 must not return\n`
      },
      expected: /retain only v5 and temporary v4/,
    },
    {
      mutate(source) {
        source += '\n# Guides v2 cache must not return\n'
        if (source.includes('[[ -e "$source_dir" || -L "$source_dir"')) {
          return source.replace('[[ -e "$source_dir" || -L "$source_dir"', '[[ -d "$source_dir"')
        }
        return source.replace(
          '[[ -e packages/docs-tooling/src/lark/meta/sources/guides || -L packages/docs-tooling/src/lark/meta/sources/guides || \\\n               -e "$manifest" || -L "$manifest" || -e "$media" || -L "$media" ]]',
          '[[ -d packages/docs-tooling/src/lark/meta/sources/guides || -f "$manifest" || -f "$media" ]]',
        )
      },
      expected: /retain only v5 and temporary v4/,
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
      mutate(source) { return source.replace("if: ${{ inputs.cache_save_required == 'true' && steps.guides_v5_generation.outcome == 'success' }}", 'if: ${{ always() }}') },
      expected: /v5 cache save must be conditional, nonfatal/,
    },
    {
      mutate(source) { return source.replace('continue-on-error: true\n        uses: actions/cache/save@v5', 'continue-on-error: false\n        uses: actions/cache/save@v5') },
      expected: /v5 cache save must be conditional, nonfatal/,
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
        return source.replace(/      - name: Download current English Guides reports[\s\S]*?          path: tmp\/card-guides-reports\/zh-CN\n/, '')
      },
      expected: /aggregate must download current Guides locale reports/,
    },
    {
      mutate(source) {
        return source
          .replace('      - name: Download current English Guides reports', '      - name: Download current English Guides reports late')
          .replace('      - name: Download current Chinese Guides reports', '      - name: Download current Chinese Guides reports late')
          .replace('      - id: reports\n        name: Collect card report summaries', '      - id: reports\n        name: Download current English Guides reports')
      },
      expected: /downloaded before card collection/,
    },
    {
      mutate(source) {
        return source.replace('path: tmp/card-guides-reports/en', 'path: tmp/guides-reports')
      },
      expected: /isolated collector directories/,
    },
    {
      mutate(source) {
        return source.replace(/      - id: report_artifact_links[\s\S]*?      - id: reports\n/, '      - id: reports\n')
      },
      expected: /exact Guides report artifact links/,
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

test('reusable final verification uses immutable master tooling for complete final consistency', () => {
  const workflowPath = path.join(process.cwd(), '.github/workflows/_verify-docs.yml')
  assert.equal(fs.existsSync(workflowPath), true, 'final verification workflow must exist')
  const workflow = fs.readFileSync(workflowPath, 'utf8')
  for (const input of ['final_dev_sha', 'master_sha', 'target_branch']) assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  assert.match(workflow, /^  contents: read$/m)
  assert.match(workflow, /timeout-minutes: 180/)
  assert.match(workflow, /name: Check out immutable master tooling[\s\S]*actions\/checkout@v5[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}[\s\S]*fetch-depth: 0/)
  assert.match(workflow, /git fetch --no-tags origin "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /git merge-base --is-ancestor "\$PUBLISHED_FINAL_SHA" "\$FINAL_DEV_SHA"/)
  assert.match(workflow, /restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/)
  assert.doesNotMatch(workflow, /git worktree add --detach "\$RUNNER_TEMP\/final-dev"/)
  assert.doesNotMatch(workflow, /actions\/checkout@v5[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}/)
  assert.match(workflow, /name: Verify final Reference derived state[\s\S]*validate-reference --site en[\s\S]*validate-reference --site zh-CN/)
  assert.match(workflow, /actions\/upload-artifact@v6[\s\S]*if: \$\{\{ always\(\) \}\}/)
  assert.match(workflow, /value: \$\{\{ jobs\.verify\.outputs\.status \}\}/)
  assert.match(workflow, /status=passed[\s\S]*status=failed/)
  assert.doesNotMatch(workflow, /contents: write|git push/)
  assert.doesNotMatch(workflow, /secrets\./)
})

test('workflow policy rejects final verification waterline mutations', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    ['      revision_status:\n        description: passed or failed\n        value: ${{ jobs.verify.outputs.revision_status }}\n', '', '_verify-docs.yml: must expose revision status separately from overall status'],
    ['pnpm check:localization-input-inventory', 'echo skipped revision inventory', '_verify-docs.yml: revision waterline must validate localization and revision inventories'],
    [
      '      - name: Verify revision waterline\n        id: revision\n        continue-on-error: true\n        run: |\n          set -euo pipefail\n',
      '      - name: Verify revision waterline\n        id: revision\n        continue-on-error: true\n        run: |\n          set -euo pipefail\n          exit 0\n',
      '_verify-docs.yml: revision waterline must not terminate before validation completes',
    ],
    [
      '      - name: Emit verification result\n        id: result\n        if: ${{ always() }}\n        run: |\n          if [[ "${{ steps.revision.outcome }}" == success && "${{ steps.reference.outcome }}" == success ]]; then\n            echo "status=passed" >> "$GITHUB_OUTPUT"\n          else\n            echo "status=failed" >> "$GITHUB_OUTPUT"\n          fi',
      '      - name: Emit verification result\n        id: result\n        if: ${{ always() }}\n        run: |\n          if true; then\n            echo "status=passed" >> "$GITHUB_OUTPUT"\n          else\n            echo "status=failed" >> "$GITHUB_OUTPUT"\n          fi',
      '_verify-docs.yml: overall status must require revision and Reference verification success',
    ],
    ['pnpm docs-tooling validate-reference --site zh-CN', 'echo skipped Chinese Reference validation', '_verify-docs.yml: final verification must validate both English and Chinese Reference derived state'],
    ['fetch-depth: 0', 'fetch-depth: 1', '_verify-docs.yml: must check out immutable master tooling'],
    ['git fetch --no-tags origin "$FINAL_DEV_SHA"', 'git fetch --no-tags origin dev', '_verify-docs.yml: must materialize the exact final dev SHA'],
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

test('Chinese site-only build stays scoped to the Guides source lane', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'zh-site-build-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const file = path.join(directory, 'site-validation.yml')
    fs.appendFileSync(file, '\n# pnpm run build:zh-CN:site\n')
    assert.ok(validateWorkflowPolicies(directory).includes(
      'site-validation.yml: Chinese site-only build is reserved for the Chinese Guides source lane',
    ))
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
  assert.match(workflow, /actions\/checkout@v5[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
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
  assert.match(workflow, /actions\/upload-artifact@v6[\s\S]*docs-checkpoint-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(workflow, /artifact_name: \$\{\{ format\('docs-checkpoint-\{0\}-\{1\}', inputs\.group, github\.run_id\) \}\}/)
  assert.match(workflow, /id: checkpoint_upload[\s\S]*uses: actions\/upload-artifact@v6/)
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

test('Fetch producers upload bound publication ready descriptors after their checkpoints', () => {
  const cases = [
    {
      file: '_fetch-content-group.yml',
      job: 'produce',
      checkpointStepId: 'checkpoint_upload',
      readyCondition: "${{ steps.checkpoint_upload.outcome == 'success' }}",
      resultPattern: /steps\.checkpoint_upload\.outcome[\s\S]*steps\.ready_upload\.outcome[\s\S]*artifact_ready/,
    },
    {
      file: '_assemble-guides.yml',
      job: 'assemble',
      checkpointStepId: 'upload',
      readyCondition: "${{ steps.upload.outcome == 'success' && steps.reports.outcome == 'success' }}",
      resultPattern: /steps\.upload\.outcome[\s\S]*steps\.ready_upload\.outcome[\s\S]*artifact_ready/,
    },
  ]

  for (const fixture of cases) {
    const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows', fixture.file), 'utf8')
    const workflow = yaml.load(source)
    for (const input of ['publication_selection_artifact_name', 'publication_selection_sha256', 'publication_unit_key']) {
      assert.equal(workflow.on.workflow_call.inputs[input]?.required, true, `${fixture.file} must require ${input}`)
    }
    assert.equal(workflow.permissions.contents, 'read')
    const steps = workflow.jobs[fixture.job].steps
    const checkpointIndex = steps.findIndex(step => step.id === fixture.checkpointStepId)
    const downloadIndex = steps.findIndex(step => step.name === 'Download publication selection')
    const validateIndex = steps.findIndex(step => step.name === 'Validate publication selection identity')
    const readyIndex = steps.findIndex(step => step.name === 'Create publication ready descriptor')
    const uploadIndex = steps.findIndex(step => step.id === 'ready_upload')
    assert.ok(downloadIndex >= 0 && validateIndex > downloadIndex)
    assert.ok(readyIndex > checkpointIndex && uploadIndex > readyIndex)
    assert.equal(steps[downloadIndex].uses, 'actions/download-artifact@v7')
    assert.equal(steps[downloadIndex].with.name, '${{ inputs.publication_selection_artifact_name }}')
    assert.match(steps[validateIndex].run, /publication-contracts\.js validate-selection/)
    assert.match(steps[validateIndex].run, /inputs\.publication_selection_sha256/)
    assert.match(steps[validateIndex].run, /inputs\.publication_unit_key/)
    assert.equal(steps[readyIndex].if, fixture.readyCondition)
    assert.match(steps[readyIndex].run, /fetch-publication-selection\.js ready/)
    assert.match(steps[readyIndex].run, /--selection "\$PUBLICATION_SELECTION"/)
    assert.match(steps[readyIndex].run, /--unit-key "\$PUBLICATION_UNIT_KEY"/)
    assert.match(steps[readyIndex].run, /--archive "\$CHECKPOINT_TAR"/)
    assert.match(steps[readyIndex].run, /--manifest "\$CHECKPOINT_MANIFEST"/)
    assert.match(steps[readyIndex].run, /publication-ready-fetch-\$unit_token-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/)
    assert.equal(steps[uploadIndex].uses, 'actions/upload-artifact@v6')
    assert.equal(steps[uploadIndex].with.name, '${{ steps.publication_ready.outputs.artifact_name }}')
    assert.equal(steps[uploadIndex].with['if-no-files-found'], 'error')
    assert.match(source, fixture.resultPattern)
    assert.doesNotMatch(source, /git push|contents: write|report-live-card|card_id|ACTION_TOKEN|GH_TOKEN|PUBLICATION_GITHUB_TOKEN/)
  }
})

test('workflow policy rejects unbound or writable Fetch publication producers', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      file: '_fetch-content-group.yml',
      mutate: source => source.replace(/      publication_selection_sha256:\n        required: true\n        type: string\n/, ''),
      expected: '_fetch-content-group.yml: producer must require and authenticate the publication selection identity',
    },
    {
      file: '_fetch-content-group.yml',
      mutate: source => source.replace('name: ${{ inputs.publication_selection_artifact_name }}', 'name: publication-selection-unbound'),
      expected: '_fetch-content-group.yml: producer must create and upload the exact bound publication ready descriptor',
    },
    {
      file: '_assemble-guides.yml',
      mutate: source => source.replace("if: ${{ steps.upload.outcome == 'success' && steps.reports.outcome == 'success' }}", "if: ${{ steps.upload.outcome == 'success' }}"),
      expected: '_assemble-guides.yml: producer must create and upload the exact bound publication ready descriptor',
    },
    {
      file: '_assemble-guides.yml',
      mutate: source => source.replace('  contents: read', '  contents: write'),
      expected: '_assemble-guides.yml: producer must remain read-only and coordinator-free',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'publication-ready-producer-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const file = path.join(directory, fixture.file)
      const source = fs.readFileSync(file, 'utf8')
      const mutated = fixture.mutate(source)
      assert.notEqual(mutated, source, 'mutation must change workflow source')
      fs.writeFileSync(file, mutated)
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
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
  assert.match(source, /name: Upload Guides progress metadata[\s\S]*continue-on-error: true[\s\S]*name: docs-progress-metadata-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/)
  const metadataSteps = source.slice(source.indexOf('name: Create Guides progress metadata'), source.indexOf('name: Create shared source artifact'))
  assert.doesNotMatch(metadataSteps, /APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/)
})

test('Guides table matrix generation is site-qualified and policy rejects site-blind generation', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const sourcePath = path.join(sourceDirectory, '_fetch-guides-sources.yml')
  const source = fs.readFileSync(sourcePath, 'utf8')
  assert.match(source, /guides-tables\.js matrix \\\n\s+--site "\$\{\{ inputs\.site \}\}"/)

  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-matrix-site-policy-'))
  try {
    fs.cpSync(sourceDirectory, directory, { recursive: true })
    const fixture = path.join(directory, '_fetch-guides-sources.yml')
    const fixtureSource = fs.readFileSync(fixture, 'utf8')
    const siteQualifiedMatrix = /(matrix=\$\(node scripts\/docs-workflow\/guides-tables\.js matrix \\\n)\s+--site "\$\{\{ inputs\.site \}\}" \\\n/g
    assert.equal([...fixtureSource.matchAll(siteQualifiedMatrix)].length >= 2, true)
    fs.writeFileSync(fixture, fixtureSource.replace(siteQualifiedMatrix, '$1'))
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
  const sourceConfigIndex = sourceSteps.findIndex(step => step.name === 'Resolve site-owned Guides source')
  const requiredCacheSteps = [
    'Compute Guides cache generation keys',
    'Restore Guides v5 cache candidate',
    'Validate and promote Guides v5 cache candidate',
    'Restore Guides v4 cache candidate',
    'Validate and promote Guides v4 cache candidate',
  ]
  const assemble = fs.readFileSync('.github/workflows/_assemble-guides.yml', 'utf8')
  const assembleSteps = yaml.load(assemble).jobs.assemble.steps
  const baselineIndex = assembleSteps.findIndex(step => step.name === 'Prepare immutable baseline')
  const workspaceIndex = assembleSteps.findIndex(step => step.name === 'Prepare selected Guides workspace')
  const sourceRestoreIndex = assembleSteps.findIndex(step => step.name === 'Restore validated Guides source')
  assert.equal(sourceSteps[sourceConfigIndex].run, 'pnpm docs-tooling guides-source-config --site "${{ inputs.site }}" --github-output "$GITHUB_ENV"')
  assert.ok(sourceConfigIndex < sourceSteps.findIndex(step => step.name === 'Compute Guides cache generation keys'))
  const basePreflightIndex = sourceSteps.findIndex(step => step.name === 'Preflight Guides Base before source fetch')
  const publicationPreflightIndex = sourceSteps.findIndex(step => step.name === 'Preflight Chinese publication validator')
  const sourceFetchIndex = sourceSteps.findIndex(step => step.name === 'Fetch shared guides sources')
  const renderReadinessIndex = sourceSteps.findIndex(step => step.name === 'Validate Guides render readiness')
  const tableMatrixIndex = sourceSteps.findIndex(step => step.name === 'Build Guides table render matrix')
  assert.ok(basePreflightIndex > sourceConfigIndex && basePreflightIndex < sourceFetchIndex)
  assert.ok(publicationPreflightIndex > sourceConfigIndex && publicationPreflightIndex < basePreflightIndex)
  assert.equal(sourceSteps[publicationPreflightIndex].if, "${{ inputs.site == 'zh-CN' }}")
  assert.equal(sourceSteps[publicationPreflightIndex].run, 'pnpm docs-tooling validate-publication-provider --site zh-CN')
  assert.equal(sourceSteps[publicationPreflightIndex].env.DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER, 'packages/docs-tooling/providers/aliyun-oss-validator.mjs')
  assert.equal(sourceSteps[publicationPreflightIndex].env.IMAGE_BED_URL, '${{ vars.ZH_CN_IMAGE_BED_URL }}')
  assert.equal(sourceSteps[publicationPreflightIndex].env.OSS_ACCESS_KEY_ID, '${{ secrets.OSS_ACCESS_KEY_ID }}')
  assert.equal(sourceSteps[publicationPreflightIndex].env.OSS_ACCESS_KEY_SECRET, '${{ secrets.OSS_ACCESS_KEY_SECRET }}')
  assert.match(sourceSteps[basePreflightIndex].run, /--manual guides --guidesBasePreflight/)
  assert.ok(renderReadinessIndex > sourceFetchIndex && renderReadinessIndex < tableMatrixIndex)
  assert.match(sourceSteps[renderReadinessIndex].run, /guides-render-readiness\.js[\s\S]*--site "\$\{\{ inputs\.site \}\}"/)
  const auditIndex = sourceSteps.findIndex(step => step.name === 'Audit canonical links in fetched Guides sources')
  assert.ok(auditIndex > sourceFetchIndex && auditIndex < renderReadinessIndex)
  assert.match(sourceSteps[auditIndex].run, /--manual guides --auditCanonicalLinks[\s\S]*guides-\$\{\{ inputs\.site \}\}-canonical-link-audit/)
  assert.match(source, /artifact_name: guides-sources-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(source, /name: guides-sources-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(assemble, /artifact_name: docs-checkpoint-guides-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(assemble, /name: docs-checkpoint-guides-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/)
  assert.ok(baselineIndex >= 0 && workspaceIndex > baselineIndex && sourceRestoreIndex > workspaceIndex)
  assert.equal(assembleSteps[workspaceIndex].run, 'node scripts/docs-workflow/prepare-content-group-workspace.js "${{ inputs.site }}" guides')
  const publicationStep = assembleSteps.find(step => step.name === 'Publish assembled Guides through docs-tooling')
  assert.equal(publicationStep.env.DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER, "${{ inputs.site == 'zh-CN' && 'packages/docs-tooling/providers/aliyun-oss-validator.mjs' || '' }}")
  assert.equal(publicationStep.env.IMAGE_BED_URL, "${{ inputs.site == 'zh-CN' && vars.ZH_CN_IMAGE_BED_URL || '' }}")
  const mediaStep = sourceSteps.find(step => step.name === 'Prefetch shared guides media')
  assert.equal(mediaStep.env.IMAGE_BED_URL, "${{ inputs.site == 'zh-CN' && vars.ZH_CN_IMAGE_BED_URL || vars.IMAGE_BED_URL }}")
  assert.equal(mediaStep.env.AWS_ACCESS_KEY_ID, "${{ inputs.site == 'en' && secrets.AWS_ACCESS_KEY_ID || '' }}")
  assert.equal(mediaStep.env.OSS_ACCESS_KEY_ID, "${{ inputs.site == 'zh-CN' && secrets.OSS_ACCESS_KEY_ID || '' }}")
  const renderWorkflow = yaml.load(fs.readFileSync('.github/workflows/_render-guides-table.yml', 'utf8'))
  const renderStep = renderWorkflow.jobs.render.steps.find(step => step.name === 'Render Guides table offline')
  assert.equal(renderStep.env.IMAGE_BED_URL, "${{ inputs.site == 'zh-CN' && vars.ZH_CN_IMAGE_BED_URL || vars.IMAGE_BED_URL }}")
  assert.deepEqual(yaml.load(caller).permissions, {contents: 'read', actions: 'read'})
  let previousIndex = -1
  for (const name of requiredCacheSteps) {
    const index = sourceSteps.findIndex(step => step.name === name)
    assert.ok(index > previousIndex, `${name} must appear in the required order`)
    previousIndex = index
  }
  assert.equal((source.match(/^\s+restore-keys:/gm) || []).length, 2)

  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-render-readiness-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, { recursive: true })
    const fixture = path.join(directory, '_fetch-guides-sources.yml')
    const parsed = yaml.load(fs.readFileSync(fixture, 'utf8'))
    parsed.jobs.fetch.steps = parsed.jobs.fetch.steps.filter(step => step.name !== 'Validate Guides render readiness')
    fs.writeFileSync(fixture, yaml.dump(parsed, { lineWidth: -1 }))
    assert.ok(validateWorkflowPolicies(directory).includes('_fetch-guides-sources.yml: Guides render readiness must be validated before table matrix fan-out'))
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
  assert.match(source, /name: Restore Guides v5 cache candidate[\s\S]*path: tmp\/guides-source-cache-v5[\s\S]*restore-keys: guides-source-\$\{\{ inputs\.site \}\}-v5-/)
  assert.match(source, /name: Restore Guides v4 cache candidate[\s\S]*if: \$\{\{ steps\.source_cache_v5_check\.outputs\.source_valid != 'true' && steps\.source_cache_keys\.outputs\.v4_restore_enabled == 'true' \}\}[\s\S]*path: tmp\/guides-source-cache-v4[\s\S]*key: \$\{\{ steps\.source_cache_keys\.outputs\.v4_lookup \}\}[\s\S]*restore-keys: \$\{\{ steps\.source_cache_keys\.outputs\.v4_prefix \}\}/)
  assert.match(source, /guides-source-cache\.js key[^\n]*--version 4[\s\S]*v4_prefix/)
  assert.match(source, /\[\[ -e "\$payload" \|\| -L "\$payload" \]\] && candidate_present=true[\s\S]*\[\[ -d "\$payload" && ! -L "\$payload" && -f "\$snapshot" \]\]/)
  assert.match(source, /name: Validate and promote Guides v4 cache candidate[\s\S]*guides-source-cache-source-promotion\.js validate[\s\S]*--payload "\$staged"[\s\S]*guides-source-cache\.js validate-media[\s\S]*"\$staged\/media-manifest\.json"[\s\S]*else[\s\S]*guides-source-cache-source-promotion\.js promote[\s\S]*--payload "\$staged"[\s\S]*source_valid=true/)
  assert.doesNotMatch(source, /cp -a "\$staged\/sources" packages\/docs-tooling\/src\/lark\/meta\/sources/)
  assert.doesNotMatch(source, /source_cache_v[123]|Guides v[123] cache|--version [123]\b/)
  assert.doesNotMatch(source, /cache-hit/)
  assert.match(source, /name: Validate and promote Guides v4 cache candidate[\s\S]*rm -rf tmp\/guides-source-cache-v4[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all[\s\S]*name: Select validated Guides cache candidate/)
  assert.doesNotMatch(source, /rm -rf[^\n]*packages\/docs-tooling\/src\/lark\/meta\/(?:source-cache|media-cache)\/?(?:\s|$)/)
  assert.match(source, /guides-source-cache\.js validate-media/)
  assert.match(source, /source_cache_v5_check\.outputs\.source_valid[\s\S]*cache_version=v5[\s\S]*cache_state=valid[\s\S]*source_cache_v4_check\.outputs\.source_valid[\s\S]*cache_version=v4[\s\S]*cache_state=legacy/)
  assert.match(source, /guides-source-cache-generation\.js promote/)
  assert.match(source, /--previous-manifest "\$media_manifest_path"/)
  assert.match(source, /--media-manifest "\$media_manifest_path"/)
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
  assert.match(assemble, /id: guides_v5_generation\n\s+name: Create Guides v5 generation payload\n\s+if: \$\{\{ inputs\.cache_save_required == 'true' \}\}[\s\S]*guides-source-cache-generation\.js keys[\s\S]*--snapshot "\$snapshot"[\s\S]*guides-source-cache-generation\.js create[\s\S]*guides-source-cache-generation\.js validate/)
  assert.match(assemble, /--media-manifest "\$media_manifest_path"/)
  assert.match(assemble, /id: save_guides_v5_generation\n\s+name: Save Guides v5 generation\n\s+if: \$\{\{ inputs\.cache_save_required == 'true' && steps\.guides_v5_generation\.outcome == 'success' \}\}\n\s+continue-on-error: true\n\s+uses: actions\/cache\/save@v5[\s\S]*path: tmp\/guides-source-cache-v5[\s\S]*key: \$\{\{ steps\.guides_v5_generation\.outputs\.key \}\}/)
  assert.match(assemble, /name: Record Guides cache generation persistence\n\s+if: \$\{\{ always\(\) \}\}[\s\S]*guides-cache-generation-lifecycle\.js report[\s\S]*steps\.promoted_snapshot\.outcome[\s\S]*steps\.promoted_source_manifest\.outcome[\s\S]*guides-cache-generation\.json/)
  assert.match(assemble, /^  actions: write$/m)
  assert.ok(assemble.indexOf('Validate combined guides output') < assemble.indexOf('Select promoted Guides source snapshot'))
  assert.ok(assemble.indexOf('Select promoted Guides source snapshot') < assemble.indexOf('Create Guides v5 generation payload'))
  assert.ok(assemble.indexOf('Create Guides v5 generation payload') < assemble.indexOf('Save Guides v5 generation'))
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
  assert.match(source, /if \[\[ "\$\{\{ steps\.source_cache_check\.outputs\.media_valid \}\}" == true \]\]; then[\s\S]*--mode incremental[\s\S]*--cache-state valid[\s\S]*--plan packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-incremental-fetch-plan\.json[\s\S]*--previous-manifest "\$media_manifest_path"/)
  assert.match(source, /--previous-manifest "\$media_manifest_path"/)
  assert.match(source, /--bootstrap-docs "content\/\$\{\{ inputs\.site \}\}\/guides,content\/\$\{\{ inputs\.site \}\}\/byoc"/)
  assert.match(source, /media cache unavailable; rebuilding complete canonical media coverage/i)
  assert.match(source, /else[\s\S]*cache_state="\$\{\{ steps\.source_cache_check\.outputs\.cache_state \}\}"[\s\S]*--mode recovery[\s\S]*--cache-state "\$cache_state"[\s\S]*node scripts\/docs-workflow\/guides-media-prefetch\.js "\$\{args\[@\]\}"/)
  const recoveryBranch = source.slice(source.indexOf('else\n            echo "[source-cache] Media cache unavailable'), source.indexOf('node scripts/docs-workflow/guides-media-prefetch.js'))
  assert.doesNotMatch(recoveryBranch, /--plan|--previous-manifest/)
  assert.match(source, /--concurrency 4/)
  assert.match(source, /GUIDES_FIGMA_MAX_CONCURRENT: '1'/)
  assert.match(source, /GUIDES_FIGMA_MIN_TIME_MS: '1000'/)
  assert.match(source, /AWS_ACCESS_KEY_ID: \$\{\{ inputs\.site == 'en' && secrets\.AWS_ACCESS_KEY_ID \|\| '' \}\}/)
  assert.match(source, /AWS_SECRET_ACCESS_KEY: \$\{\{ inputs\.site == 'en' && secrets\.AWS_SECRET_ACCESS_KEY \|\| '' \}\}/)
  assert.match(source, /OSS_ACCESS_KEY_ID: \$\{\{ inputs\.site == 'zh-CN' && secrets\.OSS_ACCESS_KEY_ID \|\| '' \}\}/)
  assert.match(source, /IMAGE_BED_URL: \$\{\{ inputs\.site == 'zh-CN' && vars\.ZH_CN_IMAGE_BED_URL \|\| vars\.IMAGE_BED_URL \}\}/)

  assert.match(runner, /resolveGuidesSourceConfig\(site\)[\s\S]*--offline[\s\S]*--mediaManifest[\s\S]*sourceConfig\.mediaManifestPath/)
  assert.doesNotMatch(render, /GUIDES_MEDIA_MANIFEST|GUIDES_MEDIA_PREFETCH_REQUIRED/)
  assert.doesNotMatch(render, /APP_ID|APP_SECRET|SPACE_ID|MODEL_API_KEY|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/)
  assert.match(render, /NO_UPDATE_NOTIFIER: '1'/)

  assert.deepEqual(caller.jobs.render_guides_tables.needs, ['prepare', 'produce_guides_sources'])
  assert.equal(caller.jobs.render_guides_tables.strategy['max-parallel'], 4)
  assert.equal(caller.jobs.render_guides_tables.strategy['fail-fast'], false)
  assert.equal(caller.jobs.render_guides_tables.strategy.matrix, '${{ fromJSON(needs.produce_guides_sources.outputs.table_matrix) }}')
  assert.equal(caller.jobs.render_guides_tables.secrets, undefined)
})

test('artifact-only Guides validation has a fail-closed no-write media mode', () => {
  const caller = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const input = caller.on.workflow_dispatch.inputs.media_upload_mode
  assert.equal(input.default, 'write')
  assert.deepEqual(input.options, ['write', 'skip'])
  assert.ok(caller.jobs.prepare.outputs.media_upload_mode)

  const refs = caller.jobs.prepare.steps.find(step => step.id === 'refs')
  assert.equal(refs.env.MEDIA_UPLOAD_MODE, "${{ github.event_name == 'workflow_dispatch' && github.event.inputs.media_upload_mode || 'write' }}")
  assert.match(refs.run, /MEDIA_UPLOAD_MODE.*skip[\s\S]*PUBLISH.*false[\s\S]*RUN_TRANSLATIONS.*false[\s\S]*SELECTED_GROUP.*guides/)
  assert.equal(caller.jobs.produce_guides_sources.with.media_upload_mode, '${{ needs.prepare.outputs.media_upload_mode }}')
  assert.equal(caller.jobs.produce_zh_guides_sources.with.media_upload_mode, '${{ needs.prepare.outputs.media_upload_mode }}')

  const source = yaml.load(fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8'))
  assert.equal(source.on.workflow_call.inputs.media_upload_mode.default, 'write')
  const steps = source.jobs.fetch.steps
  const nativeSharp = steps.find(step => step.name === 'Verify Sharp native runtime for no-write validation')
  assert.equal(nativeSharp.if, "${{ inputs.media_upload_mode == 'skip' }}")
  assert.match(nativeSharp.run, /sharp\.versions/)
  assert.match(nativeSharp.run, /real Sharp processing trims a board and adds the publication border/)
  const prefetch = steps.find(step => step.name === 'Prefetch shared guides media')
  assert.match(prefetch.run, /--upload-mode "\$\{\{ inputs\.media_upload_mode \}\}"/)
  const cacheResult = steps.find(step => step.name === 'Finalize Guides cache generation state')
  assert.equal(cacheResult.env.MEDIA_UPLOAD_MODE, '${{ inputs.media_upload_mode }}')
  assert.match(cacheResult.run, /MEDIA_UPLOAD_MODE.*skip[\s\S]*cache_save_required=false/)
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
  assert.match(generation, /node scripts\/docs-workflow\/generate-guides-sidebars\.js --media-manifest "\$media_manifest_path"/)
  assert.doesNotMatch(generation, /\n\s+if:/)
  assert.doesNotMatch(assemble, /npx docusaurus fetch-lark-docs[\s\S]*-sidebar/)
  const validation = assemble.slice(indices[0], indices[1])
  assert.match(validation, /decision-sha/)
  assert.match(validation, /guides-assembly-decision\.json/)
  assert.match(validation, /generated\/\$\{\{ inputs\.site \}\}\/sidebars\/guides\.sidebar\.js/)
  const finalValidation = assemble.slice(indices[2], indices[3])
  assert.match(finalValidation, /validate-guides-source-contract\.js --site "\$ZDOC_SITE"[\s\S]*validate-guides-coverage\.js --site "\$ZDOC_SITE"[\s\S]*validate-generated-sidebars\.js --site "\$ZDOC_SITE"/)
  assert.match(assemble, /ZDOC_BUILD_COMMAND: \$\{\{ inputs\.site == 'en' && 'pnpm run build:en' \|\| inputs\.site == 'zh-CN' && 'pnpm run build:zh-CN:site' \|\| '' \}\}/)
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

test('Guides source recovery expands an empty cache delta before final assembly decision', () => {
  const source = fs.readFileSync('.github/workflows/_fetch-guides-sources.yml', 'utf8')
  const recoveryIndex = source.indexOf('name: Evaluate Guides baseline recovery')
  const matrixIndex = source.indexOf('name: Build Guides table render matrix')
  const decisionIndex = source.indexOf('name: Evaluate Guides assembly reuse')
  assert.ok(recoveryIndex >= 0 && recoveryIndex < matrixIndex && matrixIndex < decisionIndex)
  const recovery = source.slice(recoveryIndex, matrixIndex)
  assert.match(recovery, /guides-assembly-identity\.js decide[\s\S]*--table-count 0/)
  const matrix = source.slice(matrixIndex, decisionIndex)
  assert.match(matrix, /--force-full "\$\{\{ steps\.baseline_recovery\.outputs\.required \}\}"/)
})

test('Guides assembly uses one explicit site-owned build mapping and policy rejects an unconditional English build', () => {
  const workflowDirectory = path.join(process.cwd(), '.github/workflows')
  const workflowPath = path.join(workflowDirectory, '_assemble-guides.yml')
  const source = fs.readFileSync(workflowPath, 'utf8')
  const workflow = yaml.load(source)
  const expectedMapping = "${{ inputs.site == 'en' && 'pnpm run build:en' || inputs.site == 'zh-CN' && 'pnpm run build:zh-CN:site' || '' }}"
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
  const pnpmSetupIndex = steps.findIndex(step => step.uses === 'pnpm/action-setup@v5')
  const nodeSetupIndex = steps.findIndex(step => step.uses === 'actions/setup-node@v5')
  const installIndex = steps.findIndex(step => step.name === 'Install dependencies')
  const contractIndex = steps.findIndex(step => step.name === 'Validate content group contract')
  assert.ok(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < contractIndex)

  assert.match(workflow, /^name: publish docs content group$/m)
  assert.match(workflow, /^  workflow_call:$/m)
  for (const input of ['group', 'site', 'artifact_name', 'commit_message', 'should_publish', 'master_sha', 'validate_command', 'baseline_artifact_name', 'target_branch']) {
    assert.match(workflow, new RegExp(`^      ${input}:$`, 'm'))
  }
  assert.match(workflow, /validate_command:[\s\S]*default: node "\$GITHUB_WORKSPACE\/scripts\/validate-generated-sidebars\.js" --site en/)
  assert.match(workflow, /site:[\s\S]*default: en/)
  assert.match(workflow, /ZDOC_SITE: \$\{\{ inputs\.site \}\}/)
  assert.match(workflow, /baseline_artifact_name:[\s\S]*default: ''/)
  assert.match(workflow, /target_branch:[\s\S]*default: dev/)
  assert.match(workflow, /^  contents: write$/m)
  assert.doesNotMatch(workflow, /APP_ID|APP_SECRET|report-live-card|card_id|card_started_at|card_stages|card_mode/)
  assert.doesNotMatch(workflow, /^concurrency:/m)
  assert.match(workflow, /name: Check out immutable translation tooling[\s\S]*ref: \$\{\{ inputs\.tooling_sha \}\}[\s\S]*name: Check out immutable source tooling[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/)
  assert.match(workflow, /actions\/download-artifact@v7[\s\S]*name: \$\{\{ inputs\.artifact_name \}\}/)
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
  assert.match(workflow, /actions\/upload-artifact@v6[\s\S]*if-no-files-found: ignore/)
  assert.doesNotMatch(workflow, /git-auto-commit|git push[^\n]*--force/)
  const publicationBody = workflow.slice(workflow.indexOf('name: Publish checkpoint'))
  assert.doesNotMatch(publicationBody, /secrets\./)
})

test('Fetch workflow binds Chinese Guides to the site-qualified publication unit', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  assert.equal(workflow.jobs.produce_zh_guides.with.site, 'zh-CN')
  assert.equal(workflow.jobs.produce_zh_guides.with.publication_unit_key, 'source/guides-zh-CN')
  assert.equal(workflow.jobs.publish_zh_guides, undefined)
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

test('Guides publisher resolves and preflights locale-qualified artifact pairs before extraction', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_publish-translation-batches.yml'), 'utf8')
  const workflow = yaml.load(source)
  const steps = workflow.jobs.publish.steps
  const checkpointsIndex = steps.findIndex(step => step.name === 'Download Guides translation checkpoints')
  const baselinesIndex = steps.findIndex(step => step.name === 'Download Guides translation baselines')
  const resolveIndex = steps.findIndex(step => step.name === 'Resolve Guides translation artifact pairs')
  const validateIndex = steps.findIndex(step => step.name === 'Validate Guides translation batch identities')
  const resolution = steps[resolveIndex]
  const validation = steps[validateIndex]

  assert.ok(checkpointsIndex < resolveIndex && baselinesIndex < resolveIndex && resolveIndex < validateIndex)
  assert.match(resolution.run, /translation-artifact-pairs\.js/)
  assert.match(resolution.run, /--target "\$TRANSLATION_TARGET"/)
  assert.match(resolution.run, /--group "\$GROUP"/)
  assert.match(resolution.run, /--run-id "\$GITHUB_RUN_ID"/)
  assert.match(validation.run, /preflight-checkpoint-archive\.js/)
  assert.match(validation.run, /ARTIFACT_PAIRS_MANIFEST/)
  assert.doesNotMatch(validation.run, /translation-(?:checkpoint|baseline)-\$GROUP-\$\{GITHUB_RUN_ID\}/)
})

test('Guides publisher passes the trusted expected target baseline to combined validation', () => {
  const workflow = yaml.load(fs.readFileSync(path.join(process.cwd(), '.github/workflows/_publish-translation-batches.yml'), 'utf8'))
  const validation = workflow.jobs.publish.steps.find(step => step.name === 'Validate combined Guides translation')
  assert.match(validation.run, /--expected-target-sha "\$EXPECTED_TARGET_SHA"/)
})

test('workflow policy rejects repaired Guides helper boundary mutations', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      option: 'translationStagingPath',
      source: fs.readFileSync(path.join(process.cwd(), 'scripts/docs-workflow/translation-staging.js'), 'utf8').replaceAll("'--no-renames', ", ''),
      expected: 'translation-staging.js: staged batch comparisons must disable rename detection',
    },
    {
      option: 'groupsPath',
      source: fs.readFileSync(path.join(process.cwd(), 'packages/docs-tooling/src/workflows/groups.ts'), 'utf8').replace("site === 'en' && groupName === 'guides' ? GUIDES_CHECKPOINT_PATHS : []", "groupName === 'guides' ? GUIDES_CHECKPOINT_PATHS : []"),
      expected: 'groups.ts: shared Guides diagnostics must remain English-owned',
    },
    {
      option: 'guidesValidationPath',
      source: fs.readFileSync(path.join(process.cwd(), 'scripts/docs-workflow/validate-guides-translation-staging.js'), 'utf8').replaceAll('content/en/guides', 'docs'),
      expected: 'validate-guides-translation-staging.js: combined validation must require canonical tracked roots only',
    },
    {
      option: 'guidesValidationPath',
      source: fs.readFileSync(path.join(process.cwd(), 'scripts/docs-workflow/validate-guides-translation-staging.js'), 'utf8').replace('verifyRestoredPaths(repository, expectedTargetSha, outside', 'verifyRestoredPaths(repository, stagedSha, outside'),
      expected: 'validate-guides-translation-staging.js: outside restored paths must exactly match the trusted expected target baseline',
    },
    {
      option: 'guidesValidationPath',
      source: fs.readFileSync(path.join(process.cwd(), 'scripts/docs-workflow/validate-guides-translation-staging.js'), 'utf8').replace("  try { git(repository, ['merge-base', '--is-ancestor', expectedTargetSha, stagedSha], environment) } catch { throw new Error('expected target SHA must be an ancestor of staged SHA') }\n", ''),
      expected: 'validate-guides-translation-staging.js: expected target must be an ancestor of staged translation',
    },
    {
      option: 'publicationReportPath',
      source: fs.readFileSync(path.join(process.cwd(), 'scripts/docs-workflow/translation-publication-report.js'), 'utf8').replace('content/en/byoc', 'docs-byoc'),
      expected: 'translation-publication-report.js: validation receipts must use canonical tracked commands',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-helper-policy-'))
    try {
      const file = path.join(directory, 'mutated.js')
      fs.writeFileSync(file, fixture.source)
      assert.ok(validateWorkflowPolicies(sourceDirectory, { [fixture.option]: file }).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
})

test('workflow policy rejects paid translation or matrices before immutable validation', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const cases = [
    {
      file: '_translate-content-group.yml',
      mutate(workflow) {
        const steps = workflow.jobs.translate.steps
        const agentsIndex = steps.findIndex(step => step.name === 'Run translation agents')
        const [agents] = steps.splice(agentsIndex, 1)
        steps.splice(steps.findIndex(step => step.name === 'Build group translation manifest'), 0, agents)
      },
      expected: '_translate-content-group.yml: paid translation must follow immutable identity, source delta, mode, and manifest validation',
    },
    {
      file: 'translate-codex.yml',
      mutate(workflow) { workflow.jobs.translate_sdk.needs = [] },
      expected: 'translate-codex.yml: translation matrices must wait for complete handoff repository validation',
    },
  ]

  for (const fixture of cases) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'translation-order-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, { recursive: true })
      const file = path.join(directory, fixture.file)
      const workflow = yaml.load(fs.readFileSync(file, 'utf8'))
      fixture.mutate(workflow)
      fs.writeFileSync(file, yaml.dump(workflow, { lineWidth: -1, noRefs: true }))
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  }
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

test('reusable translation producer creates group-scoped checkpoint artifacts without publishing', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  const workflow = yaml.load(source)
  const steps = workflow.jobs.translate.steps
  const numbered = steps.find(step => step.name === 'Validate translated batch outputs')
  const unbatched = steps.find(step => step.name === 'Validate unbatched translated group')
  const checkpoint = steps.find(step => step.name === 'Create validated translation checkpoints')
  const result = steps.find(step => step.name === 'Emit translation result')
  const failureGate = steps.find(step => step.name === 'Fail unsuccessful translation')

  for (const input of ['target', 'group', 'tooling_sha', 'source_baseline_sha', 'source_checkpoint_sha', 'should_translate']) assert.match(source, new RegExp(`^      ${input}:`, 'm'))
  for (const output of ['status', 'artifact_name', 'baseline_artifact_name', 'translated_count']) assert.match(source, new RegExp(`^      ${output}:`, 'm'))
  assert.match(source, /^  contents: read$/m)
  assert.match(source, /actions\/checkout@v5[\s\S]*ref: \$\{\{ inputs\.tooling_sha \}\}/)
  assert.match(source, /restore-generated-state\.sh --exact --ref "\$SOURCE_CHECKPOINT_SHA"/)
  assert.match(source, /sourceDelta\.js --repository "\$GITHUB_WORKSPACE" --source-baseline-sha "\$SOURCE_BASELINE_SHA" --source-checkpoint-sha "\$SOURCE_CHECKPOINT_SHA" --target "\$TRANSLATION_TARGET" --group "\$GROUP" --output tmp\/source-delta\.json/)
  assert.doesNotMatch(source, /git diff[^\n]*(?:TOOLING_SHA|MASTER_SHA|tooling_sha)/)
  assert.match(source, /applySourceDelta\.js --target "\$TRANSLATION_TARGET" --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/)
  assert.match(source, /manifest\.js[\s\S]*--group "\$GROUP"[\s\S]*--source-checkpoint-sha "\$SOURCE_CHECKPOINT_SHA"[\s\S]*--source-delta tmp\/source-delta\.json/)
  assert.match(source, /steps\.source_delta\.outputs\.has_mutation == 'true'/)
  assert.match(source, /\(steps\.agents\.outputs\.failed_count \|\| '0'\) != '0'/)
  assert.match(source, /agentRunner\.js[\s\S]*TRANSLATION_ALLOW_PARTIAL: "true"/)
  for (const artifactPrefix of ['translation-checkpoint', 'translation-baseline', 'translation-report', 'translation-recovery']) {
    assert.match(
      source,
      new RegExp(`${artifactPrefix}-\\$\\{\\{ inputs\\.target \\}\\}-\\$\\{\\{ inputs\\.group \\}\\}`),
      `${artifactPrefix} artifacts must include target and group`,
    )
  }
  assert.match(source, /artifact_name="translation-checkpoint-\$TRANSLATION_TARGET-\$GROUP-/)
  assert.match(source, /baseline_artifact_name="translation-baseline-\$TRANSLATION_TARGET-\$GROUP-/)

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

  assert.ok(unbatched, 'unbatched translations need group-local validation')
  assert.match(unbatched.if, /inputs\.batch_number == 0/)
  assert.match(unbatched.if, /steps\.agents\.outputs\.failed_count \|\| '0'/)
  assert.match(unbatched.run, /validate-group\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP"/)
  assert.doesNotMatch(unbatched.run, /validate-reference|reference-manifest|build:(?:en|zh-CN)/)

  assert.match(checkpoint.run, /--include-translation-cache/)
  assert.match(checkpoint.if, /inputs\.batch_number == 0/)
  assert.match(checkpoint.if, /steps\.agents\.outcome == 'skipped'/)
  assert.match(checkpoint.run, /--translation-target "\$TRANSLATION_TARGET"[\s\S]*--source-checkpoint-sha "\$SOURCE_CHECKPOINT_SHA"[\s\S]*--tooling-sha "\$TOOLING_SHA"/)
  assert.match(checkpoint.run, /validate-checkpoint-artifact\.js --artifact "\$BASELINE_CHECKPOINT_DIR"/)
  assert.match(checkpoint.run, /validate-checkpoint-artifact\.js --artifact "\$CHECKPOINT_DIR"/)
  assert.match(checkpoint.run, /if \(\( \$\{\{ inputs\.batch_number \}\} > 0 \)\) && \[\[ "\$GROUP" == guides \]\]; then[\s\S]*validate-translation-batch\.js[\s\S]*--artifact "\$CHECKPOINT_DIR"[\s\S]*--baseline "\$BASELINE_CHECKPOINT_DIR"[\s\S]*--batch-number "\$\{\{ inputs\.batch_number \}\}"[\s\S]*--batch-count "\$\{\{ inputs\.batch_count \}\}"[\s\S]*\n\s*fi/)

  assert.match(source, /translation-checkpoint-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(source, /translation-baseline-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}-\$\{\{ github\.run_id \}\}/)
  assert.match(source, /id: result[\s\S]*if: \$\{\{ always\(\) \}\}/)
  assert.match(result.run, /steps\.agents\.outputs\.failed_count \|\| '0'[\s\S]*== 0/)
  assert.match(result.run, /steps\.agents\.outputs\.remaining_count \|\| '0'[\s\S]*== 0/)
  assert.match(result.run, /steps\.agents\.outcome[\s\S]*== success/)
  assert.match(result.run, /steps\.agents\.outcome[\s\S]*== skipped/)
  assert.equal(failureGate.if, "${{ always() && steps.result.outputs.status == 'failed' }}")
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
      expected: `${workflowName}: translation producer must not run whole-site build commands`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += '\nnpx docusaurus build' },
      expected: `${workflowName}: translation producer must not run whole-site build commands`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Create validated translation checkpoints').run += '\nnpm run build' },
      expected: `${workflowName}: translation producer must not run whole-site build commands`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Run translation agents').run += '\nyarn build' },
      expected: `${workflowName}: translation producer must not run whole-site build commands`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += '\npnpm exec docusaurus build' },
      expected: `${workflowName}: translation producer must not run whole-site build commands`,
    },
    {
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += '\ndocusaurus build' },
      expected: `${workflowName}: translation producer must not run whole-site build commands`,
    },
    ...[
      'npm --prefix . run build',
      'pnpm --dir . run build',
      'yarn --cwd . build',
      'npx -p @docusaurus/core docusaurus build',
    ].map(command => ({
      mutate(steps) { steps.find(step => step.name === 'Validate translated batch outputs').run += `\n${command}` },
      expected: `${workflowName}: translation producer must not run whole-site build commands`,
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
  const pnpmSetupIndex = steps.findIndex(step => step.uses === 'pnpm/action-setup@v5')
  const nodeSetupIndex = steps.findIndex(step => step.uses === 'actions/setup-node@v5')
  const installIndex = steps.findIndex(step => step.name === 'Install dependencies')
  const materializeIndex = steps.findIndex(step => step.name === 'Materialize immutable translation source')
  assert.ok(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < materializeIndex)
  assert.match(workflow, /sourceDelta\.js --repository "\$GITHUB_WORKSPACE" --source-baseline-sha "\$SOURCE_BASELINE_SHA" --source-checkpoint-sha "\$SOURCE_CHECKPOINT_SHA" --target "\$TRANSLATION_TARGET" --group "\$GROUP" --output tmp\/source-delta\.json/)
  assert.doesNotMatch(workflow, /git diff[^\n]*(?:TOOLING_SHA|MASTER_SHA|tooling_sha)/)
  assert.match(workflow, /manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/)
})

test('fetch preparation blocks paid translation until publication readiness regressions pass', () => {
  const workflow = yaml.load(fs.readFileSync(path.join(process.cwd(), '.github/workflows/fetch-docs.yml'), 'utf8'))
  const steps = workflow.jobs.prepare.steps
  const checkout = steps[0]
  assert.equal(checkout.uses, 'actions/checkout@v5')
  assert.equal(checkout.with.ref, '${{ github.sha }}')
  assert.equal(checkout.with['fetch-depth'], 1)
  const installIndex = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
  const readinessIndex = steps.findIndex(step => step.name === 'Verify translation publication readiness')
  const inventoryIndex = steps.findIndex(step => step.name === 'Verify immutable target localization inventory')
  const cardIndex = steps.findIndex(step => step.name === 'Create progress card')
  assert.ok(installIndex >= 0 && readinessIndex > installIndex && inventoryIndex > readinessIndex && inventoryIndex < cardIndex)
  const command = steps[readinessIndex].run
  assert.equal(command, 'node --test scripts/build/write-provenance.test.mjs scripts/doc-publish-bot/manualConfig.test.js scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/fetch-reference-reconciliation.test.js scripts/docs-workflow/guides-cache-generation-lifecycle.test.js scripts/docs-workflow/guides-render-readiness.test.js scripts/docs-workflow/prepare-content-group-workspace.test.js scripts/docs-workflow/source-publication-barrier.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js')
  const inventory = steps[inventoryIndex]
  assert.equal(inventory.if, "${{ steps.refs.outputs.publish == 'true' }}")
  assert.equal(inventory.env.INITIAL_TARGET_SHA, '${{ steps.refs.outputs.initial_target_sha }}')
  assert.match(inventory.run, /git fetch --no-tags origin "\$INITIAL_TARGET_SHA"/)
  assert.match(inventory.run, /restore-generated-state\.sh --exact --ref "\$INITIAL_TARGET_SHA"/)
  assert.match(inventory.run, /pnpm check:localization-input-inventory/)
})

test('workflow policy rejects fetch preparation without immutable inventory preflight', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'fetch-inventory-preflight-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'fetch-docs.yml')
    const original = fs.readFileSync(file, 'utf8')
    const mutated = original.replace('          pnpm check:localization-input-inventory\n', '          echo skipped localization inventory preflight\n')
    assert.notEqual(mutated, original)
    fs.writeFileSync(file, mutated)
    assert.ok(validateWorkflowPolicies(directory).includes(
      'fetch-docs.yml: prepare must validate the immutable target localization inventory before paid work starts',
    ))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('fetch workflow owns only source production and dispatches translation once after fail-early handoff', () => {
  const file = path.join(process.cwd(), '.github/workflows/fetch-docs.yml')
  const source = fs.readFileSync(file, 'utf8')
  const workflow = yaml.load(source)
  for (const forbidden of [
    '_translate-content-group.yml', '_prepare-translation-batches.yml', '_publish-translation-batches.yml',
    'translate-content.yml', 'TRANSLATION_AGENT_API_KEY', 'REVIEW_AGENT_API_KEY',
  ]) assert.doesNotMatch(source, new RegExp(forbidden.replaceAll('.', '\\.'), 'u'))
  assert.equal((source.match(/gh workflow run translate-codex\.yml/g) || []).length, 1)
  assert.ok(workflow.jobs.prepare_translation_handoff.needs.includes('source_publication_barrier'))
  assert.deepEqual(workflow.jobs.dispatch_translations.needs, ['prepare', 'prepare_translation_handoff'])
  assert.match(workflow.jobs.dispatch_translations.if, /needs\.prepare_translation_handoff\.result == 'success'/)
  assert.match(source, /translation-handoff\.js[\s\S]*--locale all[\s\S]*--fetch-selection[\s\S]*--fetch-results/)
  assert.match(source, /name: translation-handoff-v2-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/)
  assert.match(source, /-f handoff_json="\$HANDOFF_JSON"/)
  assert.match(source, /WORKFLOW_REF: \$\{\{ github\.ref_name \}\}/)
  assert.match(source, /run_url[\s\S]*github\\\.com[\s\S]*actions\/runs\//)
  assert.match(source, /\[1-9\]\[0-9\]\*/)
  assert.match(source, /request_id="\$REQUEST_ID"[\s\S]*displayTitle[\s\S]*expected_title/)
  assert.match(source, /gh run list[^\n]*--json displayTitle,url,headBranch/)
  assert.match(source, /\.displayTitle == \$title and \.headBranch == \$ref/)
  const dispatchStep = workflow.jobs.dispatch_translations.steps.find(step => step.name === 'Dispatch the single translation workflow')
  assert.equal(dispatchStep.env.TOOLING_SHA, undefined)
  assert.doesNotMatch(dispatchStep.run, /\.headSha == \$sha|TOOLING_SHA/)
  assert.match(source, /\$\{#run_urls\[@\]\} == 1/)
  assert.doesNotMatch(source, /Translate manuals|Publish translations|Publish [a-z]+ translation/)
  assert.match(source, /card_parts\+=\("Handoff"\)/)
  assert.match(source, /Zilliz Cloud Docs Build/)
  assert.doesNotMatch(source, /Translate manuals|Publish translations|Dispatch downstream translation/)
})

test('PR-ready Fetch workflow contains no canary-only configuration', () => {
  const source = fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8')
  const workflow = yaml.load(source)
  const refs = workflow.jobs.prepare.steps.find(step => step.id === 'refs')
  const aggregate = workflow.jobs.aggregate.steps.find(step => step.id === 'aggregate')

  assert.equal(workflow.on.workflow_dispatch.inputs.canary_suppress_translation_dispatch, undefined)
  assert.equal(refs.env.TARGET_BRANCH, "${{ github.event_name == 'workflow_dispatch' && github.event.inputs.target_branch || 'dev' }}")
  assert.equal(refs.env.CANARY_SUPPRESS_TRANSLATION_DISPATCH, undefined)
  assert.equal(workflow.jobs.prepare.outputs.canary_suppress_translation_dispatch, undefined)
  assert.doesNotMatch(workflow.jobs.dispatch_translations.if, /canary|suppress/iu)
  assert.equal(aggregate.env.TRANSLATION_HANDOFF_REQUESTED, '${{ needs.prepare.outputs.run_translations }}')
  assert.doesNotMatch(source, /canary_suppress_translation_dispatch|fetch-publication-fifo-p0-canary-dev|production\s+shadow|publish_ready_shadow/iu)
  assert.deepEqual(workflow.jobs.prepare_translation_handoff.needs, ['prepare', 'source_publication_barrier', 'publish_ready', 'reconcile_reference_state'])
})

test('workflow policy rejects reconciled handoff and branch child lookup regressions', () => {
  const fixtures = [
    {
      mutate: source => source.replace(
        'needs: [prepare, source_publication_barrier, publish_ready, reconcile_reference_state]',
        'needs: [prepare, source_publication_barrier, publish_ready]',
      ),
      expected: 'fetch-docs.yml: translation handoff must directly depend on reconciliation and consume its exact final target SHA',
    },
    {
      mutate: source => source.replace(
        'TARGET_BASELINE_SHA: ${{ needs.reconcile_reference_state.outputs.final_target_sha }}',
        'TARGET_BASELINE_SHA: ${{ needs.publish_ready.outputs.final_target_sha }}',
      ),
      expected: 'fetch-docs.yml: translation handoff must directly depend on reconciliation and consume its exact final target SHA',
    },
    {
      mutate: source => source.replace(
        '--target-baseline-sha "$TARGET_BASELINE_SHA"',
        '--target-baseline-sha "$PUBLISHED_TARGET_SHA"',
      ),
      expected: 'fetch-docs.yml: translation handoff must directly depend on reconciliation and consume its exact final target SHA',
    },
    {
      mutate: source => source.replace(
        '--json displayTitle,url,headBranch',
        '--json displayTitle,url,headSha',
      ),
      expected: 'fetch-docs.yml: downstream dispatch must identify one child by exact request title and workflow branch',
    },
    {
      mutate: source => source.replace(
        '.displayTitle == $title and .headBranch == $ref',
        '.displayTitle == $title and .headSha == $sha',
      ),
      expected: 'fetch-docs.yml: downstream dispatch must identify one child by exact request title and workflow branch',
    },
  ]
  for (const fixture of fixtures) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'fetch-reconciled-handoff-policy-'))
    try {
      fs.cpSync('.github/workflows', directory, {recursive: true})
      const file = path.join(directory, 'fetch-docs.yml')
      const original = fs.readFileSync(file, 'utf8')
      const mutated = fixture.mutate(original)
      assert.notEqual(mutated, original)
      fs.writeFileSync(file, mutated)
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('workflow policy rejects reintroduced canary-only configuration', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'fetch-canary-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'fetch-docs.yml')
    const original = fs.readFileSync(file, 'utf8')
    fs.writeFileSync(file, original.replace('name: fetch lark docs', 'name: fetch lark docs\n# publish_ready_shadow'))
    assert.ok(validateWorkflowPolicies(directory).some(error => error.includes('must not contain temporary canary or shadow configuration')))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('workflow policy rejects embedded translation and an unvalidated downstream dispatch', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'translation-handoff-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'fetch-docs.yml')
    const original = fs.readFileSync(file, 'utf8')
    fs.writeFileSync(file, original.replace('  verify:', '  embedded_translation:\n    uses: ./.github/workflows/_translate-content-group.yml\n\n  verify:'))
    assert.ok(validateWorkflowPolicies(directory).some(error => error.includes('must not embed translation implementation')))
    fs.writeFileSync(file, original.replace("needs.prepare_translation_handoff.result == 'success'", "needs.prepare.result == 'success'"))
    assert.ok(validateWorkflowPolicies(directory).some(error => error.includes('downstream dispatch must wait for a validated handoff')))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('Chinese Guides remains a direct site-qualified source lane', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  assert.equal(workflow.jobs.produce_zh_guides_sources.with.site, 'zh-CN')
  assert.equal(workflow.jobs.render_zh_guides_tables.with.site, 'zh-CN')
  assert.equal(workflow.jobs.produce_zh_guides.with.site, 'zh-CN')
  assert.equal(workflow.jobs.produce_zh_guides.with.publication_unit_key, 'source/guides-zh-CN')
  assert.equal(workflow.jobs.publish_zh_guides, undefined)
})

test('Fetch grants both reusable Guides assembly jobs their exact cache permission contract', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  for (const job of ['produce_guides', 'produce_zh_guides']) {
    assert.deepEqual(workflow.jobs[job].permissions, {actions: 'write', contents: 'read'}, job)
  }
})

test('workflow policy rejects a Guides assembly caller that cannot satisfy reusable permissions', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'guides-permissions-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'fetch-docs.yml')
    const original = fs.readFileSync(file, 'utf8')
    fs.writeFileSync(file, original.replace(
      '  produce_guides:\n    permissions:\n      actions: write\n      contents: read\n',
      '  produce_guides:\n    permissions:\n      actions: read\n      contents: read\n',
    ))
    assert.ok(validateWorkflowPolicies(directory).some(error => error.includes('Guides assembly callers must grant actions: write and contents: read')))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('source aggregate reports downstream handoff and downloads Guides reports before card collection', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/fetch-docs.yml', 'utf8'))
  const steps = workflow.jobs.aggregate.steps
  const aggregate = steps.find(step => step.id === 'aggregate')
  const englishReports = steps.find(step => step.name === 'Download current English Guides reports')
  const chineseReports = steps.find(step => step.name === 'Download current Chinese Guides reports')
  const collector = steps.find(step => step.name === 'Collect card report summaries')
  assert.equal(aggregate.env.TRANSLATION_HANDOFF_RESULT, '${{ needs.dispatch_translations.result }}')
  assert.equal(aggregate.env.TRANSLATION_HANDOFF_RUN_URL, '${{ needs.dispatch_translations.outputs.run_url }}')
  assert.equal(englishReports.with.name, 'docs-checkpoint-guides-en-${{ github.run_id }}-reports')
  assert.equal(englishReports.with.path, 'tmp/card-guides-reports/en')
  assert.equal(chineseReports.with.name, 'docs-checkpoint-guides-zh-CN-${{ github.run_id }}-reports')
  assert.equal(chineseReports.with.path, 'tmp/card-guides-reports/zh-CN')
  assert.ok(steps.indexOf(englishReports) < steps.indexOf(collector))
  assert.ok(steps.indexOf(chineseReports) < steps.indexOf(collector))
  assert.equal(collector.env.CARD_GUIDES_REPORTS_ROOT, 'tmp/card-guides-reports')
  assert.equal(collector.env.CARD_EXPECT_EN_GUIDES_REPORTS, "${{ needs.prepare.outputs.selected_group == 'all' || needs.prepare.outputs.selected_group == 'guides' }}")
  assert.equal(collector.env.CARD_EXPECT_ZH_GUIDES_REPORTS, "${{ needs.prepare.outputs.selected_group == 'all' || needs.prepare.outputs.selected_group == 'guides' }}")
  assert.equal(aggregate.env.REVISION_RECONCILIATION, "${{ needs.verify.outputs.revision_status || 'skipped' }}")
  assert.match(aggregate.run, /--publication-selection[\s\S]*--publication-results/)
  assert.equal(collector.env.CARD_REPORT_REF, '${{ needs.publish_ready.outputs.final_target_sha }}')
})

test('workflow policy rejects aggregate wiring that ignores publication results', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'zh-guides-aggregate-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'fetch-docs.yml')
    const original = fs.readFileSync(file, 'utf8')
    fs.writeFileSync(file, original.replace(/\s+--publication-results "\$RUNNER_TEMP\/publication-results\/publication-results\.json"/, ''))
    assert.ok(validateWorkflowPolicies(directory).some(error => error.includes('aggregate must consume publication selection and results')))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('manual translation workflow keeps producers parallel and delegates publication to the ready FIFO', () => {
  const source = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')
  const workflow = yaml.load(source)
  assert.doesNotMatch(source, /workflow_run|git-auto-commit|git push/)
  assert.match(source, /uses: \.\/.github\/workflows\/_translate-content-group\.yml/)
  assert.match(source, /matrix: \$\{\{ fromJSON\(needs\.prepare\.outputs\.sdk_producer_matrix\) \}\}/)
  assert.deepEqual(workflow.jobs.publish_ready.needs, ['prepare'])
  assert.deepEqual(workflow.jobs.aggregate.needs, ['prepare', 'publish_ready'])
})
test('Translation cuts over to one ready FIFO Git writer and artifact-bound aggregate', () => {
  const source = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')
  const workflow = yaml.load(source)
  const legacy = [
    'observe_publication_ready',
    'publish_ja_guides', 'publish_ja_python', 'publish_zh_python', 'publish_ja_java', 'publish_zh_java',
    'publish_ja_node', 'publish_zh_node', 'publish_ja_go', 'publish_zh_go', 'publish_ja_cli', 'publish_zh_cli',
    'publish_ja_rest', 'publish_zh_rest', 'publish_zh_reference_landings',
    'reconcile_localization_inventory', 'reconcile_reference_state', 'reconcile_published_state',
  ]
  for (const job of legacy) assert.equal(workflow.jobs[job], undefined, job)

  assert.deepEqual(workflow.permissions, {actions: 'read', contents: 'read'})
  const writable = Object.entries(workflow.jobs).filter(([, job]) => job?.permissions?.contents === 'write').map(([name]) => name)
  assert.deepEqual(writable, ['publish_ready'])
  const writer = workflow.jobs.publish_ready
  assert.deepEqual(writer.needs, ['prepare'])
  assert.deepEqual(writer.permissions, {actions: 'read', contents: 'write'})
  assert.doesNotMatch(JSON.stringify(writer), /APP_ID|APP_SECRET|FEISHU/)
  const publish = writer.steps.find(step => step.id === 'publish')
  assert.equal(publish.uses, 'actions/github-script@v8')
  assert.match(publish.with.script, /process\.env\.PUBLISH === 'true' \? 'publish' : 'artifact_only'/)
  assert.match(publish.with.script, /'--poll-milliseconds', '10000'/)
  assert.match(publish.with.script, /'--candidate-polls', '6'/)
  assert.match(publish.with.script, /'--max-publish-attempts', '10'/)

  assert.deepEqual(workflow.jobs.aggregate.needs, ['prepare', 'publish_ready'])
  assert.deepEqual(workflow.jobs.aggregate.permissions, {actions: 'read', contents: 'read'})
  const aggregate = JSON.stringify(workflow.jobs.aggregate)
  assert.match(aggregate, /artifactNames/)
  assert.match(aggregate, /publication-selection\.json/)
  assert.match(aggregate, /publication-results\.json/)
  assert.match(aggregate, /verifyTranslationPublicationRepository/)
  assert.match(source, /refs\/heads\/\$TARGET_BRANCH:refs\/remotes\/origin\/\$TARGET_BRANCH/)
  assert.match(source, /target_sha.*FINAL_TARGET_SHA/)
  assert.doesNotMatch(aggregate, /publish_ja_|publish_zh_|reconcile_/)
})

test('workflow policy rejects Translation ready FIFO writer regressions', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const original = fs.readFileSync(path.join(sourceDirectory, 'translate-codex.yml'), 'utf8')
  const fixtures = [
    {
      mutate: source => source.replace('    needs: [prepare]\n    if: ${{ needs.prepare.result == \'success\' }}\n    runs-on: ubuntu-latest\n    timeout-minutes: 360\n    permissions:\n      actions: read\n      contents: write', '    needs: [prepare, prepare_guides_publication_ready]\n    if: ${{ needs.prepare.result == \'success\' }}\n    runs-on: ubuntu-latest\n    timeout-minutes: 360\n    permissions:\n      actions: read\n      contents: write'),
      expected: 'translate-codex.yml: publish_ready must be the single mode-aware Translation Git writer from prepare',
    },
    {
      mutate: source => source.replace("const mode = process.env.PUBLISH === 'true' ? 'publish' : 'artifact_only'", "const mode = 'artifact_only'"),
      expected: 'translate-codex.yml: publish_ready must be the single mode-aware Translation Git writer from prepare',
    },
    {
      mutate: source => source.replace("'--candidate-polls', '6'", "'--candidate-polls', '60'"),
      expected: 'translate-codex.yml: publish_ready must be the single mode-aware Translation Git writer from prepare',
    },
    {
      mutate: source => source.replace('\n  aggregate:\n', '\n  publish_ja_python:\n    runs-on: ubuntu-latest\n\n  aggregate:\n'),
      expected: 'translate-codex.yml: legacy Translation writer must be absent: publish_ja_python',
    },
    {
      mutate: source => source.replace('  aggregate:\n    needs: [prepare, publish_ready]\n    if: ${{ always() && needs.prepare.result == \'success\' }}\n    runs-on: ubuntu-latest\n    timeout-minutes: 10\n    permissions:\n      actions: read\n      contents: read', '  aggregate:\n    needs: [prepare, publish_ready]\n    if: ${{ always() && needs.prepare.result == \'success\' }}\n    runs-on: ubuntu-latest\n    timeout-minutes: 10\n    permissions:\n      actions: read\n      contents: write'),
      expected: 'translate-codex.yml: Git writer inventory must be exactly publish_ready',
    },
    {
      mutate: source => source.replace('      - run: pnpm install --frozen-lockfile\n      - id: artifacts', '      - run: pnpm install --frozen-lockfile\n      - run: git push origin HEAD:refs/heads/dev\n      - id: artifacts'),
      expected: 'translate-codex.yml: git push is forbidden outside the declared Git writer inventory: aggregate',
    },
  ]
  for (const fixture of fixtures) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'translation-ready-writer-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const changed = fixture.mutate(original)
      assert.notEqual(changed, original)
      fs.writeFileSync(path.join(directory, 'translate-codex.yml'), changed)
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})
test('Translation prepare installs exact tooling checkout dependencies before resolving the handoff', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  const steps = workflow.jobs.prepare.steps
  const checkout = steps.findIndex(step => step.uses === 'actions/checkout@v5')
  const pnpmSetup = steps.findIndex(step => step.uses === 'pnpm/action-setup@v5')
  const nodeSetup = steps.findIndex(step => step.uses === 'actions/setup-node@v5')
  const install = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
  const handoff = steps.findIndex(step => step.name === 'Resolve and validate the complete translation handoff')

  assert.ok(checkout >= 0)
  assert.ok(pnpmSetup > checkout)
  assert.ok(nodeSetup > pnpmSetup)
  assert.deepEqual(steps[nodeSetup].with, {'node-version': '22.6', cache: 'pnpm'})
  assert.ok(install > nodeSetup)
  assert.ok(handoff > install)
})

test('Translation producers bind one immutable selection and emit ready descriptors after checkpoint artifacts', () => {
  const reusable = yaml.load(fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8'))
  const reusableSteps = reusable.jobs.translate.steps
  for (const input of ['publication_selection_artifact_name', 'publication_selection_sha256', 'publication_unit_key']) {
    assert.deepEqual(reusable.on.workflow_call.inputs[input], {required: false, type: 'string', default: ''}, input)
  }
  const download = reusableSteps.find(step => step.name === 'Download translation publication selection')
  const validate = reusableSteps.find(step => step.name === 'Validate translation publication selection identity')
  const checkpoint = reusableSteps.findIndex(step => step.name === 'Upload translation checkpoint')
  const baseline = reusableSteps.findIndex(step => step.name === 'Upload translation baseline')
  const ready = reusableSteps.findIndex(step => step.name === 'Create immutable Translation ready descriptor')
  const upload = reusableSteps.findIndex(step => step.name === 'Upload immutable Translation ready descriptor')
  assert.equal(download.uses, 'actions/download-artifact@v7')
  assert.equal(download.with.name, '${{ inputs.publication_selection_artifact_name }}')
  assert.match(validate.run, /publication-contracts\.js validate-selection/)
  assert.equal(validate.env.PUBLICATION_SELECTION_SHA256, '${{ inputs.publication_selection_sha256 }}')
  assert.equal(reusable.jobs.translate.env.PUBLICATION_UNIT_KEY, '${{ inputs.publication_unit_key }}')
  assert.ok(checkpoint >= 0 && baseline > checkpoint && ready > baseline && upload > ready)
  assert.match(reusableSteps[ready].run, /translation-publication-selection\.js ready/)
  assert.equal(reusableSteps[ready].id, 'publication_ready')
  assert.match(reusableSteps[ready].run, /unit_token=\$\{PUBLICATION_UNIT_KEY\/\/\\\/\/-\}/)
  assert.match(reusableSteps[ready].run, /artifact_name=publication-ready-translation-\$unit_token-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/)
  assert.equal(reusableSteps[upload].uses, 'actions/upload-artifact@v6')
  assert.equal(reusableSteps[upload].with.name, '${{ steps.publication_ready.outputs.artifact_name }}')
  assert.match(validate.run, /selected\.target !== process\.env\.TRANSLATION_TARGET/)
  assert.match(validate.run, /selected\.group !== process\.env\.GROUP/)
  assert.match(validate.run, /selected\.toolingSha !== process\.env\.TOOLING_SHA/)
  assert.match(validate.run, /selected\.sourceBaselineSha !== process\.env\.SOURCE_BASELINE_SHA/)
  assert.match(validate.run, /selected\.sourceCheckpointSha !== process\.env\.SOURCE_CHECKPOINT_SHA/)
  assert.match(validate.run, /selected\.artifacts\.checkpoint/)
  assert.match(validate.run, /selected\.artifacts\.baseline/)
  assert.equal(reusable.permissions.contents, 'read')
  assert.doesNotMatch(JSON.stringify(reusable), /git push/)

  const workflow = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  assert.equal(workflow.jobs.prepare.outputs.publication_selection_artifact_name, '${{ steps.publication_selection.outputs.artifact_name }}')
  assert.equal(workflow.jobs.prepare.outputs.publication_selection_sha256, '${{ steps.publication_selection.outputs.selection_sha256 }}')
  const prepareSource = fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8')
  assert.match(prepareSource, /translation-publication-selection\.js selection/)
  assert.match(prepareSource, /name: publication-selection-translation-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/)
  for (const jobName of ['translate_sdk', 'translate_guides_batches']) {
    const job = workflow.jobs[jobName]
    assert.equal(job.with.publication_selection_artifact_name, '${{ needs.prepare.outputs.publication_selection_artifact_name }}')
    assert.equal(job.with.publication_selection_sha256, '${{ needs.prepare.outputs.publication_selection_sha256 }}')
  }
  assert.equal(workflow.jobs.translate_sdk.with.publication_unit_key, '${{ matrix.publicationUnitKey }}')
  assert.equal(workflow.jobs.translate_sdk.name, 'translate:${{ matrix.target }}/${{ matrix.group }}')
  assert.equal(workflow.jobs.translate_guides_batches.if, "${{ needs.prepare_guides_batches.outputs.batch_count != '0' }}")
  const fanIn = workflow.jobs.prepare_guides_publication_ready
  assert.deepEqual(fanIn.needs, ['prepare', 'prepare_guides_batches', 'translate_guides_batches'])
  assert.deepEqual(fanIn.permissions, {actions: 'read', contents: 'read'})
  const fanInSource = JSON.stringify(fanIn)
  const fanInRun = fanIn.steps.find(step => step.name === 'Validate and package complete Guides translation batch set').run
  assert.match(fanInSource, /translation-artifact-pairs\.js/)
  assert.match(fanInRun, /--checkpoints-root "\$RUNNER_TEMP\/translation-checkpoints"/)
  assert.match(fanInRun, /--baselines-root "\$RUNNER_TEMP\/translation-baselines"/)
  assert.match(fanInRun, /--target ja-JP --group guides --run-id "\$GITHUB_RUN_ID" --batch-count "\$BATCH_COUNT"/)
  assert.match(fanInRun, /--output "\$RUNNER_TEMP\/guides-artifact-pairs\.json"/)
  assert.match(fanInSource, /translation-batch-set\.js plan/)
  assert.match(fanIn.if, /needs\.translate_guides_batches\.result == 'skipped'/)
  assert.doesNotMatch(fanIn.if, /batch_count != '0'/)
  assert.match(fanInSource, /batchCount: 0/)
  assert.match(fanInSource, /runAttempt: Number\(process\.env\.GITHUB_RUN_ATTEMPT\)/)
  assert.match(fanInSource, /pendingSetSha256/)
  assert.match(fanInSource, /checkpoint-manifest\.json/)
  assert.match(fanInSource, /baseline-manifest\.json/)
  assert.match(fanInSource, /checkpoint-manifest\.json[\s\S]*checkpoint-group\/manifest\.json/)
  assert.match(fanInSource, /tar -cf .*checkpoint-group\.tar[\s\S]*checkpoint-group/)
  assert.equal(fanIn.steps.find(step => step.name === 'Upload Guides translation checkpoint').with.path, '${{ runner.temp }}/guides-ready/checkpoint/checkpoint-group.tar')
  assert.equal(fanIn.steps.find(step => step.name === 'Upload Guides translation baseline').with.path, '${{ runner.temp }}/guides-ready/baseline/checkpoint-group.tar')
  assert.equal(fanIn.steps.find(step => step.name === 'Upload immutable Translation ready descriptor').with.name,
    'publication-ready-translation-translation-ja-JP-guides-${{ github.run_id }}-${{ github.run_attempt }}')
  assert.doesNotMatch(fanInSource, /git push|staging/)
})

test('retained legacy Translation callers map source identities without gaining publication-selection authority', () => {
  const reusable = yaml.load(fs.readFileSync('.github/workflows/_translate-content-group.yml', 'utf8'))
  const inputs = reusable.on.workflow_call.inputs
  assert.deepEqual(inputs.legacy_without_publication_selection, {required: false, type: 'boolean', default: false})
  for (const input of ['publication_selection_artifact_name', 'publication_selection_sha256', 'publication_unit_key']) {
    assert.deepEqual(inputs[input], {required: false, type: 'string', default: ''}, input)
  }

  const steps = reusable.jobs.translate.steps
  assert.equal(steps.find(step => step.name === 'Download translation publication selection').if, '${{ !inputs.legacy_without_publication_selection }}')
  assert.equal(steps.find(step => step.name === 'Validate translation publication selection identity').if, '${{ !inputs.legacy_without_publication_selection }}')
  assert.match(steps.find(step => step.name === 'Create immutable Translation ready descriptor').if, /^\$\{\{ !inputs\.legacy_without_publication_selection &&/)
  assert.match(steps.find(step => step.name === 'Upload immutable Translation ready descriptor').if, /^\$\{\{ !inputs\.legacy_without_publication_selection &&/)

  const legacyCallers = [
    ['_translate-publish-batch.yml', 'translate', '${{ inputs.tooling_sha }}', '${{ inputs.source_sha }}'],
    ['_translate-selected-group.yml', 'translate', '${{ inputs.tooling_sha }}', '${{ inputs.source_sha }}'],
    ['translate-content.yml', 'translate_exact', '${{ inputs.tooling_sha }}', '${{ inputs.source_sha }}'],
  ]
  for (const [file, jobName, sourceBaselineSha, sourceCheckpointSha] of legacyCallers) {
    const workflow = yaml.load(fs.readFileSync(`.github/workflows/${file}`, 'utf8'))
    const call = workflow.jobs[jobName]
    assert.equal(call.with.legacy_without_publication_selection, true, file)
    assert.equal(call.with.source_baseline_sha, sourceBaselineSha, file)
    assert.equal(call.with.source_checkpoint_sha, sourceCheckpointSha, file)
    for (const stale of ['source_sha', 'source_commit_sha', 'master_sha']) assert.equal(call.with[stale], undefined, `${file}:${stale}`)
    for (const selection of ['publication_selection_artifact_name', 'publication_selection_sha256', 'publication_unit_key']) {
      assert.equal(call.with[selection], undefined, `${file}:${selection}`)
    }
  }

  const batch = yaml.load(fs.readFileSync('.github/workflows/_translate-publish-batch.yml', 'utf8'))
  assert.equal(batch.jobs.translate.needs, 'validate_legacy_aliases')
  const preflight = batch.jobs.validate_legacy_aliases
  assert.equal(preflight['runs-on'], 'ubuntu-latest')
  assert.equal(preflight['timeout-minutes'], 5)
  assert.deepEqual(preflight.permissions, {contents: 'read'})
  const aliasStep = preflight.steps.find(step => step.name === 'Validate retained Translation aliases')
  assert.deepEqual(aliasStep.env, {
    SOURCE_SHA: '${{ inputs.source_sha }}',
    SOURCE_COMMIT_SHA: '${{ inputs.source_commit_sha }}',
    TOOLING_SHA: '${{ inputs.tooling_sha }}',
    MASTER_SHA: '${{ inputs.master_sha }}',
  })
  assert.match(aliasStep.run, /SOURCE_COMMIT_SHA.*!==.*SOURCE_SHA/)
  assert.match(aliasStep.run, /MASTER_SHA.*!==.*TOOLING_SHA/)

  const strict = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  for (const jobName of ['translate_sdk', 'translate_guides_batches']) {
    const call = strict.jobs[jobName]
    assert.equal(call.with.legacy_without_publication_selection, undefined, jobName)
    assert.equal(call.with.publication_selection_artifact_name, '${{ needs.prepare.outputs.publication_selection_artifact_name }}', jobName)
    assert.equal(call.with.publication_selection_sha256, '${{ needs.prepare.outputs.publication_selection_sha256 }}', jobName)
    assert.ok(call.with.publication_unit_key, jobName)
  }
})

test('workflow policy allowlists exactly three legacy Translation selection bypass callers', () => {
  const sourceDirectory = path.join(process.cwd(), '.github/workflows')
  const fixtures = [
    {
      file: 'recover-translation.yml',
      mutate: source => source.replace('      handoff_json: ${{ needs.prepare_recovery.outputs.handoff_json }}\n', '      legacy_without_publication_selection: ${{ true }}\n      handoff_json: ${{ needs.prepare_recovery.outputs.handoff_json }}\n'),
      expected: 'recover-translation.yml:run_translation: legacy Translation selection bypass is not allowlisted',
    },
    {
      file: 'recover-translation.yml',
      mutate: source => source.replace('      handoff_json: ${{ needs.prepare_recovery.outputs.handoff_json }}\n', "      ${{ 'legacy_without_publication_selection' }}: true\n      handoff_json: ${{ needs.prepare_recovery.outputs.handoff_json }}\n"),
      expected: 'recover-translation.yml:run_translation: legacy Translation selection bypass is not allowlisted',
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('      publication_unit_key: ${{ matrix.publicationUnitKey }}\n', '      legacy_without_publication_selection: true\n      publication_unit_key: ${{ matrix.publicationUnitKey }}\n'),
      expected: 'translate-codex.yml:translate_sdk: legacy Translation selection bypass is not allowlisted',
    },
    {
      file: 'translate-codex.yml',
      mutate: source => source.replace('      publication_unit_key: translation/ja-JP/guides\n', '      legacy_without_publication_selection: true\n      publication_unit_key: translation/ja-JP/guides\n'),
      expected: 'translate-codex.yml:translate_guides_batches: legacy Translation selection bypass is not allowlisted',
    },
    ...[
      ['_translate-publish-batch.yml', 'translate'],
      ['_translate-selected-group.yml', 'translate'],
      ['translate-content.yml', 'translate_exact'],
    ].map(([file, job]) => ({
      file,
      mutate: source => source.replace('      legacy_without_publication_selection: true\n', ''),
      expected: `${file}:${job}: allowlisted legacy Translation selection bypass must be explicit`,
    })),
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('      source_baseline_sha: ${{ inputs.tooling_sha }}\n', '      source_baseline_sha: ${{ inputs.source_sha }}\n'),
      expected: '_translate-publish-batch.yml:translate: legacy Translation source identity mapping is invalid',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('      source_checkpoint_sha: ${{ inputs.source_sha }}\n', '      source_checkpoint_sha: ${{ inputs.source_commit_sha }}\n'),
      expected: '_translate-publish-batch.yml:translate: legacy Translation source identity mapping is invalid',
    },
    {
      file: '_translate-selected-group.yml',
      mutate: source => source.replace('      source_baseline_sha: ${{ inputs.tooling_sha }}\n', '      source_baseline_sha: ${{ inputs.source_sha }}\n'),
      expected: '_translate-selected-group.yml:translate: legacy Translation source identity mapping is invalid',
    },
    {
      file: '_translate-selected-group.yml',
      mutate: source => source.replace('      source_checkpoint_sha: ${{ inputs.source_sha }}\n', '      source_checkpoint_sha: ${{ inputs.tooling_sha }}\n'),
      expected: '_translate-selected-group.yml:translate: legacy Translation source identity mapping is invalid',
    },
    {
      file: 'translate-content.yml',
      mutate: source => source.replace('      source_baseline_sha: ${{ inputs.tooling_sha }}\n', '      source_baseline_sha: ${{ inputs.source_sha }}\n'),
      expected: 'translate-content.yml:translate_exact: legacy Translation source identity mapping is invalid',
    },
    {
      file: 'translate-content.yml',
      mutate: source => source.replace('      source_checkpoint_sha: ${{ inputs.source_sha }}\n', '      source_checkpoint_sha: ${{ inputs.tooling_sha }}\n'),
      expected: 'translate-content.yml:translate_exact: legacy Translation source identity mapping is invalid',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('    needs: validate_legacy_aliases\n', ''),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('    needs: validate_legacy_aliases\n', '    needs: validate_legacy_aliases\n    continue-on-error: true\n'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('    needs: validate_legacy_aliases\n', '    needs: validate_legacy_aliases\n    if: ${{ always() }}\n'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('    timeout-minutes: 5\n', '    timeout-minutes: 5\n    continue-on-error: true\n'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('    timeout-minutes: 5\n', '    timeout-minutes: 5\n    if: ${{ always() }}\n'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('      - name: Validate retained Translation aliases\n', '      - name: Validate retained Translation aliases\n        continue-on-error: true\n'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('      - name: Validate retained Translation aliases\n', '      - name: Validate retained Translation aliases\n        if: ${{ always() }}\n'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('process.env.SOURCE_COMMIT_SHA !== process.env.SOURCE_SHA', 'process.env.SOURCE_COMMIT_SHA === process.env.SOURCE_SHA'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace('process.env.MASTER_SHA !== process.env.TOOLING_SHA', 'process.env.MASTER_SHA === process.env.TOOLING_SHA'),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
    {
      file: '_translate-publish-batch.yml',
      mutate: source => source.replace(
        'node -e \'if(process.env.SOURCE_COMMIT_SHA !== process.env.SOURCE_SHA)throw new Error("source_commit_sha must equal source_sha");if(process.env.MASTER_SHA !== process.env.TOOLING_SHA)throw new Error("master_sha must equal tooling_sha")\'',
        'node -e \'console.log(process.env.SOURCE_COMMIT_SHA !== process.env.SOURCE_SHA, process.env.MASTER_SHA !== process.env.TOOLING_SHA)\'',
      ),
      expected: '_translate-publish-batch.yml: legacy Translation aliases must fail closed before paid work',
    },
  ]

  for (const fixture of fixtures) {
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'legacy-translation-bypass-policy-'))
    try {
      fs.cpSync(sourceDirectory, directory, {recursive: true})
      const target = path.join(directory, fixture.file)
      const source = fs.readFileSync(target, 'utf8')
      const changed = fixture.mutate(source)
      assert.notEqual(changed, source, fixture.file)
      fs.writeFileSync(target, changed)
      assert.ok(validateWorkflowPolicies(directory).includes(fixture.expected), fixture.expected)
    } finally {
      fs.rmSync(directory, {recursive: true, force: true})
    }
  }
})

test('workflow policy rejects Translation selection and ready-descriptor wiring regressions', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'translation-ready-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const producer = path.join(directory, '_translate-content-group.yml')
    const workflow = path.join(directory, 'translate-codex.yml')
    const producerSource = fs.readFileSync(producer, 'utf8')
    fs.writeFileSync(producer, producerSource.replace("      publication_unit_key: { required: false, type: string, default: '' }\n", ''))
    assert.ok(validateWorkflowPolicies(directory).includes(
      '_translate-content-group.yml: Translation producer must require and authenticate the immutable publication selection identity',
    ))

    fs.writeFileSync(producer, producerSource)
    const workflowSource = fs.readFileSync(workflow, 'utf8')
    fs.writeFileSync(workflow, workflowSource.replace('      publication_unit_key: ${{ matrix.publicationUnitKey }}\n', ''))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: SDK Translation matrix units must receive their exact publication unit key',
    ))

    fs.writeFileSync(workflow, workflowSource.replace(
      '      publication_selection_artifact_name: ${{ needs.prepare.outputs.publication_selection_artifact_name }}\n',
      '      legacy_without_publication_selection: true\n      publication_selection_artifact_name: ${{ needs.prepare.outputs.publication_selection_artifact_name }}\n',
    ))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: translate_guides_batches must receive the immutable Translation publication selection identity',
    ))

    fs.writeFileSync(workflow, workflowSource.replace("    name: translate:${{ matrix.target }}/${{ matrix.group }}\n", ''))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: SDK Translation matrix caller job must use its selected producer identity',
    ))

    fs.writeFileSync(workflow, workflowSource.replace("needs.prepare_guides_batches.outputs.batch_count != '0'", "needs.prepare_guides_batches.outputs.pending_count != '0'"))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: Guides translation batch matrix must run whenever its batch count is nonzero',
    ))

    fs.writeFileSync(workflow, workflowSource.replaceAll('pendingSetSha256: process.env.PENDING_SET_SHA256', 'pendingSetSha256: undefined'))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: Guides ready fan-in must bind run attempt, batch count, pending checksum, and recoverable manifests',
    ))

    fs.writeFileSync(workflow, workflowSource.replace('cp "$RUNNER_TEMP/guides-ready/checkpoint-manifest.json" "$RUNNER_TEMP/guides-ready/checkpoint/checkpoint-group/manifest.json"', ''))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: Guides ready fan-in must bind run attempt, batch count, pending checksum, and recoverable manifests',
    ))

    fs.writeFileSync(workflow, workflowSource.replace('--batch-count "$BATCH_COUNT"', ''))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: Guides ready fan-in must bind run attempt, batch count, pending checksum, and recoverable manifests',
    ))

    fs.writeFileSync(workflow, workflowSource.replace('path: ${{ runner.temp }}/guides-ready/baseline/checkpoint-group.tar', 'path: ${{ runner.temp }}/guides-ready/checkpoint/checkpoint-group.tar'))
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: Guides ready fan-in must bind run attempt, batch count, pending checksum, and recoverable manifests',
    ))

    fs.writeFileSync(producer, producerSource.replace('artifact_name=publication-ready-translation-$unit_token-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT', 'artifact_name=publication-ready-translation-$unit_token-$GITHUB_RUN_ID'))
    assert.ok(validateWorkflowPolicies(directory).includes(
      '_translate-content-group.yml: Translation producer ready artifact name must use the normalized unit token and run attempt',
    ))

    fs.writeFileSync(producer, producerSource.replace('selected.target !== process.env.TRANSLATION_TARGET || ', ''))
    assert.ok(validateWorkflowPolicies(directory).includes(
      '_translate-content-group.yml: Translation producer must authenticate the exact selected unit identity',
    ))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('Translation coordinator reconciliation is terminal before artifact-bound aggregate success', () => {
  const workflow = yaml.load(fs.readFileSync('.github/workflows/translate-codex.yml', 'utf8'))
  const adapter = fs.readFileSync('scripts/docs-workflow/translation-publication-adapter.js', 'utf8')
  assert.match(adapter, /reconcileTranslationPublication/)
  assert.match(adapter, /overallStatus: 'orchestrator_failed'/)
  assert.deepEqual(workflow.jobs.aggregate.needs, ['prepare', 'publish_ready'])
  const aggregate = JSON.stringify(workflow.jobs.aggregate)
  assert.match(aggregate, /publication-results\.json/)
  assert.match(aggregate, /results\.overallStatus !== 'success'/)
  assert.match(aggregate, /verifyTranslationPublicationRepository/)
})

test('workflow policy rejects Translation aggregate that bypasses terminal publication artifacts', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'translation-terminal-results-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'translate-codex.yml')
    const original = fs.readFileSync(file, 'utf8')
    const changed = original.replace('          verifyTranslationPublicationRepository({selection, results, repository: process.env.GITHUB_WORKSPACE})', '          console.log(results.finalTargetSha)')
    assert.notEqual(changed, original)
    fs.writeFileSync(file, changed)
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: aggregate must consume and authenticate exact terminal Translation selection and results artifacts',
    ))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})

test('workflow policy rejects Translation aggregate that does not bind the final SHA to the published target tip', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'translation-final-tip-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'translate-codex.yml')
    const original = fs.readFileSync(file, 'utf8')
    const changed = original.replace('          [[ "$target_sha" == "$FINAL_TARGET_SHA" ]] || { echo "Translation target moved after publication: expected $FINAL_TARGET_SHA, got $target_sha" >&2; exit 1; }\n', '')
    assert.notEqual(changed, original)
    fs.writeFileSync(file, changed)
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: aggregate must consume and authenticate exact terminal Translation selection and results artifacts',
    ))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})
test('Guides translation batches take row identity from the matrix and shared metadata from preparation outputs', () => {
  const workflow = yaml.load(fs.readFileSync(path.join(process.cwd(), '.github/workflows/translate-codex.yml'), 'utf8'))
  const inputs = workflow.jobs.translate_guides_batches.with
  assert.equal(inputs.batch_index, '${{ matrix.batchIndex }}')
  assert.equal(inputs.batch_number, '${{ matrix.batchNumber }}')
  assert.equal(inputs.batch_count, '${{ fromJSON(needs.prepare_guides_batches.outputs.batch_count) }}')
  assert.equal(inputs.batch_size, '${{ fromJSON(needs.prepare_guides_batches.outputs.batch_size) }}')
  assert.equal(inputs.pending_count, '${{ fromJSON(needs.prepare_guides_batches.outputs.pending_count) }}')
  assert.equal(inputs.pending_set_sha256, '${{ needs.prepare_guides_batches.outputs.pending_set_sha256 }}')
})

test('GitHub expressions use single-quoted string literals for property keys', () => {
  const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'github-expression-policy-'))
  try {
    fs.cpSync('.github/workflows', directory, {recursive: true})
    const file = path.join(directory, 'translate-codex.yml')
    const source = fs.readFileSync(file, 'utf8')
    const mutated = source.replace(
      'fromJSON(needs.prepare.outputs.guides_unit_json).sourceBaselineSha',
      'fromJSON(needs.prepare.outputs.guides_unit_json)["sourceBaselineSha"]',
    )
    assert.notEqual(mutated, source)
    fs.writeFileSync(file, mutated)
    assert.ok(validateWorkflowPolicies(directory).includes(
      'translate-codex.yml: GitHub expressions must use single-quoted string literals',
    ))
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
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
  assert.equal(translationWorkflow.jobs.prepare.if, "${{ inputs.source_sha == '' }}")
  assert.equal(translationWorkflow.jobs.translate.if, "${{ inputs.source_sha == '' }}")
  assert.equal(translationWorkflow.jobs.translate_exact.if, "${{ inputs.source_sha != '' }}")
  assert.equal(translationWorkflow.jobs.publish_exact.if, "${{ inputs.source_sha != '' }}")
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

test('translation workers always upload retirement review evidence without masking manifest failure', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  const workflow = yaml.load(source)
  const steps = workflow.jobs.translate.steps
  const manifestIndex = steps.findIndex(step => step.name === 'Build group translation manifest')
  const uploadIndex = steps.findIndex(step => step.name === 'Upload translation retirement review')
  const agentsIndex = steps.findIndex(step => step.name === 'Run translation agents')

  assert.ok(manifestIndex >= 0 && manifestIndex < uploadIndex && uploadIndex < agentsIndex)
  assert.match(steps[manifestIndex].run, /--retirement-report tmp\/translation-retirement-review\.json/)
  assert.equal(steps[uploadIndex].if, '${{ always() && inputs.should_translate }}')
  assert.equal(steps[uploadIndex].uses, 'actions/upload-artifact@v6')
  assert.match(steps[uploadIndex].with.name, /translation-retirement-review-/)
  assert.equal(steps[uploadIndex].with.path, 'tmp/translation-retirement-review.json')
  assert.equal(steps[uploadIndex].with['if-no-files-found'], 'ignore')
  assert.equal(steps[manifestIndex]['continue-on-error'], undefined)
})

test('translation workers resolve bootstrap mode and validate only their selected group', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  const workflow = yaml.load(source)
  assert.equal(workflow.on.workflow_call.inputs.mode.default, 'auto')
  const steps = workflow.jobs.translate.steps
  const resolveIndex = steps.findIndex(step => step.name === 'Resolve effective translation mode')
  const manifestIndex = steps.findIndex(step => step.name === 'Build group translation manifest')
  const validationIndex = steps.findIndex(step => step.name === 'Validate unbatched translated group')
  const markerIndex = steps.findIndex(step => step.name === 'Mark completed translation bootstrap')
  const sourceIdentityIndex = steps.findIndex(step => step.name === 'Validate immutable inputs')
  const regenerateIndex = steps.findIndex(step => step.name === 'Regenerate selected Chinese Reference sidebar')
  const checkpointIndex = steps.findIndex(step => step.name === 'Create validated translation checkpoints')
  assert.ok(resolveIndex >= 0 && resolveIndex < manifestIndex)
  assert.ok(sourceIdentityIndex >= 0 && sourceIdentityIndex < manifestIndex)
  assert.match(steps[sourceIdentityIndex].run, /source_baseline_sha/)
  assert.match(steps[sourceIdentityIndex].run, /source_checkpoint_sha/)
  assert.match(steps[manifestIndex].run, /--mode "\$EFFECTIVE_TRANSLATION_MODE"/)
  assert.match(steps[validationIndex].run, /validate-group\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP"/)
  assert.doesNotMatch(steps[validationIndex].run, /validate-reference|build:en|build:zh-CN|reference-manifest/)
  assert.ok(validationIndex < markerIndex && markerIndex < checkpointIndex)
  assert.ok(markerIndex < regenerateIndex && regenerateIndex < checkpointIndex)
  assert.match(steps[regenerateIndex].run, /reference-sidebar[\s\S]*--group "\$GROUP"[\s\S]*--write/)
  assert.doesNotMatch(steps[regenerateIndex].run, /reference-manifest|validate-reference/)
  assert.match(steps[markerIndex].if, /steps\.agents\.outputs\.failed_count.*== '0'/)
  assert.match(steps[markerIndex].if, /steps\.agents\.outputs\.remaining_count.*== '0'/)
})

test('translation workers authenticate exact source checkpoint inputs without binding to stale Reference manifest provenance', () => {
  const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/_translate-content-group.yml'), 'utf8')
  const workflow = yaml.load(source)
  const job = workflow.jobs.translate
  assert.equal(job.env.SOURCE_BASELINE_SHA, '${{ inputs.source_baseline_sha }}')
  assert.equal(job.env.SOURCE_CHECKPOINT_SHA, '${{ inputs.source_checkpoint_sha }}')
  assert.equal(job.env.TOOLING_SHA, '${{ inputs.tooling_sha }}')
  const validation = job.steps.find(step => step.name === 'Validate immutable inputs')
  assert.match(validation.run, /source_baseline_sha/)
  assert.match(validation.run, /source_checkpoint_sha/)
  assert.doesNotMatch(source, /git diff[^\n]*(?:TOOLING_SHA|MASTER_SHA|tooling_sha)/)
  assert.doesNotMatch(source, /generated\/en\/manifests\/reference\.json[\s\S]*sourceCommit/)
})
