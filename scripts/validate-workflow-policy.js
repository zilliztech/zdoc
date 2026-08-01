'use strict'

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')

const workflowDirectory = path.join(process.cwd(), '.github', 'workflows')
const publishingWorkflows = new Set([
  'fetch-docs.yml',
  'translate-codex.yml',
  'translate-content.yml',
  '_translate-selected-group.yml',
  '_publish-content-group.yml',
  '_publish-translation-batches.yml',
  '_translate-publish-batch.yml',
])

function executableShellLineEntries(source) {
  const entries = []
  let heredocDelimiter = null
  for (const [index, raw] of String(source || '').split('\n').entries()) {
    const trimmed = raw.trim()
    if (heredocDelimiter !== null) {
      if (trimmed === heredocDelimiter) heredocDelimiter = null
      continue
    }
    if (!trimmed || trimmed.startsWith('#')) continue
    entries.push({ index, raw, trimmed })
    const heredoc = trimmed.match(/<<-?\s*(?:(['"])([A-Za-z_][A-Za-z0-9_]*)\1|([A-Za-z_][A-Za-z0-9_]*))/)
    if (heredoc) heredocDelimiter = heredoc[2] || heredoc[3]
  }
  return entries
}

function containsFullValidationCommand(source) {
  return executableShellLineEntries(source).some(({ trimmed }) => {
    if (/\b(?:mdx-parse|validate-mdx|validate-translated-coverage(?:\.js)?|run-doc-build-stage(?:\.js)?)\b/.test(trimmed)) return true
    const segments = trimmed.split(/\s*(?:&&|\|\||;|\|)\s*/)
    return segments.some(segment => {
      const command = segment.trim().replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=[^\s]+\s+)*/, '')
      const match = command.match(/^(\S+)(?:\s+([\s\S]*))?$/)
      if (!match) return false
      const executable = path.posix.basename(match[1])
      const rest = match[2] || ''
      if (executable === 'npm') return /\b(?:run|run-script)\b[\s\S]*\bbuild\b/.test(rest)
      if (['pnpm', 'yarn', 'bun'].includes(executable)) return /\bbuild\b/.test(rest)
      if (executable === 'npx') return /\bdocusaurus\b[\s\S]*\bbuild\b/.test(rest)
      if (executable === 'docusaurus') return /\bbuild\b/.test(rest)
      return false
    })
  })
}

function containsForcePush(source) {
  if (/push_options:\s*(?:[^\n]*\s)?(?:-f\b|--force(?:-with-lease)?\b)/.test(source)) return true
  return executableShellLineEntries(source).some(({trimmed}) => {
    if (!/\bgit\s+push\b/.test(trimmed)) return false
    return /(?:^|\s)(?:-f|--force(?:-with-lease)?)(?:=\S+)?(?=\s|$)/.test(trimmed)
  })
}

function translationCaseBranches(run) {
  const results = { 'ja-JP': [], 'zh-CN-reference': [] }
  const lines = String(run || '').split('\n')
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*case "\$TRANSLATION_TARGET" in\s*$/.test(lines[index])) continue
    let target = null
    for (index += 1; index < lines.length && !/^\s*esac\s*$/.test(lines[index]); index += 1) {
      const branch = lines[index].match(/^\s*(ja-JP|zh-CN-reference)\)\s*(.*)$/)
      if (branch) { target = branch[1]; if (branch[2]) results[target].push(branch[2]); continue }
      if (target) results[target].push(lines[index])
      if (/;;\s*$/.test(lines[index])) target = null
    }
  }
  return Object.fromEntries(Object.entries(results).map(([target, body]) => [target, body.join('\n')]))
}

function validateTargetBranches(run, file, errors) {
  const branches = translationCaseBranches(run)
  const forbidden = {
    'ja-JP': /content\/zh-CN|generated\/zh-CN/,
    'zh-CN-reference': /i18n\/ja-JP|content\/zh-CN\/guides\/tutorials\/tools|generated\/zh-CN\/sidebars\/guides\.sidebar\.js/,
  }
  for (const [target, pattern] of Object.entries(forbidden)) if (pattern.test(branches[target])) errors.push(`${file}: ${target} branch must not claim cross-target translation paths`)
  if (/build:zh-CN/.test(branches['ja-JP']) || /build:en/.test(branches['zh-CN-reference'])) {
    errors.push(`${file}: translation target branch contains a wrong-site build`)
  }
}

function namedJobStep(workflow, jobName, stepName) {
  return (workflow?.jobs?.[jobName]?.steps || []).find(step => step?.name === stepName)
}

function executableCommandLines(run) {
  return executableShellLineEntries(run).map(({ trimmed }) =>
    trimmed.replace(/\s+2>&1\s*\|\s*tee\s+\S+\s*$/, ''))
}

function commandsAppearInOrder(actual, required) {
  let previous = -1
  return required.every(command => {
    const index = actual.indexOf(command, previous + 1)
    if (index < 0) return false
    previous = index
    return true
  })
}

function terminatesBeforeCommand(actual, finalCommand) {
  const finalIndex = actual.lastIndexOf(finalCommand)
  if (finalIndex < 0) return false
  return actual.slice(0, finalIndex).some(command => /^(?:exit|return|exec)(?:\s|$)/.test(command))
}

function validateWorkflowPolicies(directory = workflowDirectory, options = {}) {
  const errors = []
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.yml')).sort()
  const sourcePublicationWorkflows = new Set(['_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml'])

  for (const file of files) {
    const source = fs.readFileSync(path.join(directory, file), 'utf8')
    const bareSidebarValidation = source.split('\n').some(line => {
      const commandIndex = line.indexOf('validate-generated-sidebars.js')
      return commandIndex >= 0 && !line.slice(commandIndex).includes('--site')
    })
    if (bareSidebarValidation) errors.push(`${file}: generated sidebar validation must declare an explicit site`)
    let workflow
    try {
      workflow = yaml.load(source)
    } catch (error) {
      errors.push(`${file}: invalid YAML: ${error.message}`)
      continue
    }
    for (const job of Object.values(workflow.jobs || {})) {
      if (Object.values(job?.env || {}).some(value => String(value).includes('${{ runner.temp }}'))) {
        errors.push(`${file}: job-level env must not reference runner.temp`)
      }
    }
    if (sourcePublicationWorkflows.has(file)) {
      if (workflow.on?.workflow_call?.inputs?.site?.required !== true) {
        errors.push(`${file}: source publication workflow must require site input`)
      }
      if (!/pnpm docs-tooling publish-group --site/.test(source)) {
        errors.push(`${file}: source publication workflow must use docs-tooling publish-group`)
      }
      if (/run-content-group\.js|config\/generated|(?:^|[\s"'])docs\/tutorials|(?:^|[\s"'])docs-byoc(?:\/|[\s"'])|(?:^|[\s"'])reference\/api/m.test(source)) {
        errors.push(`${file}: source publication workflow must not use legacy publication roots`)
      }
      if (/content\/zh-CN\/guides\/tutorials\/tools|generated\/zh-CN\/sidebars\/tools\.sidebar\.js|generated\/zh-CN\/manifests\/tools-translations\.json/.test(source)) {
        errors.push(`${file}: source publication workflow must not claim Chinese Tools protected paths`)
      }
    }
    if (!/^permissions:\n(?:  .+\n)+/m.test(source)) {
      errors.push(`${file}: declare explicit top-level permissions`)
    }
    const primaryJobs = Object.values(workflow.jobs || {}).filter(job => job?.['runs-on'])
    if (primaryJobs.some(job => !Number.isFinite(job?.['timeout-minutes']))) {
      errors.push(`${file}: every primary job must have a timeout`)
    }
    if (/node-version:\s*(?:lts\/\*|latest)/.test(source)) {
      errors.push(`${file}: use a stable Node major instead of a moving alias`)
    }
    if (/::set-output\b/.test(source)) {
      errors.push(`${file}: write step outputs through GITHUB_OUTPUT`)
    }
    if (containsForcePush(source)) {
      errors.push(`${file}: force-pushing generated documentation can discard concurrent updates`)
    }

    const immutableTranslationToolingFiles = new Set([
      '_prepare-translation-batches.yml', '_translate-content-group.yml', '_translate-publish-batch.yml',
      '_publish-translation-batches.yml',
    ])
    if (immutableTranslationToolingFiles.has(file)) {
      const checkoutSteps = Object.values(workflow.jobs || {}).flatMap(job => Array.isArray(job?.steps) ? job.steps : [])
        .filter(step => String(step?.uses || '').startsWith('actions/checkout@'))
      if (checkoutSteps.length === 0 || checkoutSteps.some(step => step.with?.ref !== '${{ inputs.tooling_sha }}')) {
        errors.push(`${file}: translation tooling checkout must use exact inputs.tooling_sha`)
      }
    }

    if (publishingWorkflows.has(file)) {
      if (!['_publish-content-group.yml', '_publish-translation-batches.yml', '_translate-publish-batch.yml', '_translate-selected-group.yml', 'translate-content.yml', 'translate-codex.yml'].includes(file) && !/^concurrency:\n  group: docs-production-dev\n  cancel-in-progress: false$/m.test(source)) {
        errors.push(`${file}: serialize dev publication through docs-production-dev`)
      }
      if (!/^  contents: write$/m.test(source)) {
        errors.push(`${file}: publishing workflow requires explicit contents: write`)
      }
    } else if (!/^  contents: read$/m.test(source)) {
      errors.push(`${file}: validation workflow must be read-only`)
    }

    if (file === 'check-404.yml' || file === 'playwright.yml') {
      if (!workflow.on?.push || !workflow.on?.pull_request) {
        errors.push(`${file}: push and pull_request must both be declared under on`)
      }
      if (workflow.concurrency?.pull_request) {
        errors.push(`${file}: pull_request must not be nested under concurrency`)
      }
    }

    if (file === 'site-validation.yml') {
      if (!/validate-guides-source-contract\.js --site zh-CN[\s\S]*validate-guides-coverage\.js --site zh-CN[\s\S]*validate-generated-sidebars\.js --site zh-CN[\s\S]*pnpm run build:zh-CN/.test(source)) {
        errors.push(`${file}: Chinese Guides validation must cover source ownership, sidebars, and the Chinese build`)
      }
      const siteBuilds = [
        ['build_en', 'pnpm build:en'],
        ['build_zh_cn', 'pnpm build:zh-CN'],
      ]
      const freshnessCommand = 'pnpm check:localization-input-inventory'
      if (siteBuilds.some(([jobName, buildCommand]) => {
        const runs = (workflow.jobs?.[jobName]?.steps || []).map(step => String(step?.run || '').trim())
        const freshnessIndex = runs.indexOf(freshnessCommand)
        const buildIndex = runs.indexOf(buildCommand)
        return freshnessIndex < 0 || buildIndex < 0 || freshnessIndex > buildIndex
      })) {
        errors.push(`${file}: both site builds must check the localization input inventory before building`)
      }
      const referenceCommand = 'pnpm docs-tooling validate-reference --site zh-CN'
      const zhBuildRuns = (workflow.jobs?.build_zh_cn?.steps || []).map(step => String(step?.run || '').trim())
      const referenceRuns = (workflow.jobs?.reference_coverage?.steps || []).map(step => String(step?.run || '').trim())
      const referenceIndex = zhBuildRuns.indexOf(referenceCommand)
      const zhBuildIndex = zhBuildRuns.indexOf('pnpm build:zh-CN')
      if (referenceIndex < 0 || zhBuildIndex < 0 || referenceIndex > zhBuildIndex || !referenceRuns.includes(referenceCommand)) {
        errors.push(`${file}: Chinese Reference validation must run before the Chinese build and in focused coverage`)
      }
    }

    if (file === '_fetch-content-group.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/, 'must check out the immutable master_sha input'],
        [/restore-generated-state\.sh --exact --ref "\$DEV_BASELINE_SHA"/, 'must exactly restore generated state from the immutable baseline SHA'],
        [/name: Restore generated state from dev baseline[\s\S]*name: Prepare selected content group workspace[\s\S]*prepare-content-group-workspace\.js "\$SITE" "\$GROUP"[\s\S]*name: Fetch content group/, 'must prepare the selected site group after baseline restore and before generation'],
        [/create-checkpoint-artifact\.js/, 'must create a checkpoint artifact'],
        [/validate-checkpoint-artifact\.js/, 'must validate the checkpoint artifact'],
        [/actions\/upload-artifact@v4/, 'must upload the checkpoint artifact'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      const steps = workflow.jobs?.produce?.steps || []
      const snapshotIndex = steps.findIndex(step => step.name === 'Update content snapshots')
      const inventoryIndex = steps.findIndex(step => step.name === 'Generate revision inventory')
      const checkpointIndex = steps.findIndex(step => step.name === 'Create source checkpoint artifact')
      const inventory = steps[inventoryIndex]
      const inventoryRun = String(inventory?.run || '')
      const report = steps.find(step => step.name === 'Upload revision inventory report')
      const reportPaths = String(report?.with?.path || '')
      const englishCondition = "${{ inputs.site == 'en' }}"
      if (!(snapshotIndex >= 0 && snapshotIndex < inventoryIndex && inventoryIndex < checkpointIndex) ||
        !/pnpm docs-tooling "\$\{inventory_args\[@\]\}"/.test(inventoryRun) ||
        !/revision-inventory build/.test(inventoryRun) ||
        !/--output "generated\/en\/manifests\/lark-revisions\/\$GROUP\.json"/.test(inventoryRun) ||
        !/--report-dir "tmp\/docs-tooling\/revision-diff"/.test(inventoryRun) ||
        !/--source-run-id "\$GITHUB_RUN_ID"/.test(inventoryRun) ||
        !/--generated-at "\$GENERATED_AT"/.test(inventoryRun)) {
        errors.push(`${file}: English producer must generate the selected revision inventory`)
      }
      if (String(inventory?.if || '').trim() !== englishCondition || String(report?.if || '').trim() !== englishCondition) {
        errors.push(`${file}: revision inventory generation and report upload must be English-only`)
      }
      if (!/baseline_path="tmp\/docs-tooling\/revision-baseline\/\$GROUP\.json"/.test(inventoryRun) ||
        !/baseline_source="\$BASELINE_DIR\/generated\/en\/manifests\/lark-revisions\/\$GROUP\.json"/.test(inventoryRun) ||
        !/if \[\[ -f "\$baseline_source" \]\]; then[\s\S]*cp -- "\$baseline_source" "\$baseline_path"/.test(inventoryRun) ||
        !/--baseline "tmp\/docs-tooling\/revision-baseline\/\$GROUP\.json"/.test(inventoryRun)) {
        errors.push(`${file}: revision inventory baseline must use the exact safe repository-relative path`)
      }
      if (!/getContentGroup\(process\.env\.GROUP, process\.env\.SITE\)/.test(inventoryRun) ||
        !/group\.sourceSnapshots\.join\(","\)/.test(inventoryRun) ||
        !/\[\[ "\$GROUP" != rest && -z "\$SNAPSHOTS" \]\]/.test(inventoryRun) ||
        !/inventory_args\+\=\(--snapshot "\$SNAPSHOTS"\)/.test(inventoryRun) ||
        /APP_ID|APP_SECRET|fetch-lark|publish-group|update-lark-doc-snapshot|update-sdk-reference-snapshots/.test(inventoryRun) ||
        Object.keys(inventory?.env || {}).some(name => /APP_ID|APP_SECRET|FEISHU/i.test(name))) {
        errors.push(`${file}: revision inventory step must not receive Feishu credentials or fetch source metadata`)
      }
      if (!report || report.uses !== 'actions/upload-artifact@v4' || report.with?.['if-no-files-found'] !== 'error' ||
        !reportPaths.includes('generated/en/manifests/lark-revisions/${{ inputs.group }}.json') ||
        !reportPaths.includes('tmp/docs-tooling/revision-diff/${{ inputs.group }}.json') ||
        !reportPaths.includes('tmp/docs-tooling/revision-diff/${{ inputs.group }}.md')) {
        errors.push(`${file}: English producer must upload revision JSON and Markdown reports`)
      }
      if (/git-auto-commit|git push(?:\s+--force|[^\n]*\s--force)|git push\b/.test(source)) {
        errors.push(`${file}: producer must not publish or push content`)
      }
    }

    if (file === '_prepare-translation-batches.yml') {
      const requiredPatterns = [
        [/^      candidate_counts: \{ value: '\$\{\{ jobs\.prepare\.outputs\.candidate_counts \}\}' \}$/m, 'must expose translation candidate counts'],
        [/^      candidate_counts: \$\{\{ steps\.summary\.outputs\.candidate_counts \}\}$/m, 'must map prepare candidate counts from the summary step'],
        [/^            candidate_counts: JSON\.stringify\(summary\.candidateCounts\),$/m, 'must emit classified translation candidate counts'],
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/, 'must recover source checkpoint ancestry after generated-state restore'],
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must verify the source checkpoint parent before deriving durable batches'],
        [/git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must derive durable batches from the immutable source checkpoint diff'],
        [/sourceDelta\.js[\s\S]*--target "\$TRANSLATION_TARGET"[\s\S]*--group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/, 'must classify the selected group source delta'],
        [/manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/, 'must build the durable pending set from the source delta'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
    }

    if (file === '_translate-content-group.yml') {
      const requiredPatterns = [
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/, 'must recover source checkpoint ancestry after generated-state restore'],
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must verify the source checkpoint parent before translation reconciliation'],
        [/git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must derive translation reconciliation from the immutable source checkpoint diff'],
        [/sourceDelta\.js[\s\S]*--target "\$TRANSLATION_TARGET"[\s\S]*--group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/, 'must classify the selected group source delta'],
        [/applySourceDelta\.js --target "\$TRANSLATION_TARGET" --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/, 'source delta application must receive the exact translation target'],
        [/manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/, 'must prioritize current source changes and preserve reconciliation metadata'],
        [/manifest\.js[\s\S]*--mode "\$EFFECTIVE_TRANSLATION_MODE"/, 'must build candidates with the resolved bootstrap mode'],
        [/steps\.source_delta\.outputs\.has_mutation == 'true'/, 'must create checkpoints for deletion-only translation mutations'],
        [/\(steps\.agents\.outputs\.failed_count \|\| '0'\) != '0'/, 'must create checkpoints for batches that only record failed translations'],
        [/translation-checkpoint-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'checkpoint artifacts must include target and group'],
        [/translation-baseline-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'baseline artifacts must include target and group'],
        [/translation-report-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'report artifacts must include target and group'],
        [/translation-recovery-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'recovery artifacts must include target and group'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)

      const steps = workflow.jobs?.translate?.steps || []
      const numbered = steps.find(step => step.name === 'Validate translated batch outputs')
      const unbatched = steps.find(step => step.name === 'Validate unbatched translated group')
      const checkpoint = steps.find(step => step.name === 'Create validated translation checkpoints')
      const numberedCondition = String(numbered?.if || '')
      const numberedRun = String(numbered?.run || '')
      const unbatchedCondition = String(unbatched?.if || '')
      const unbatchedRun = String(unbatched?.run || '')
      const checkpointRun = String(checkpoint?.run || '')
      const candidateIdentity = {
        ZDOC_PROVENANCE_CANDIDATE_TARGET: '${{ inputs.target }}',
        ZDOC_PROVENANCE_CANDIDATE_TOOLING_SHA: '${{ inputs.tooling_sha }}',
        ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA: '${{ inputs.source_sha }}',
      }
      validateTargetBranches(steps.map(step => String(step?.run || '')).join('\n'), file, errors)
      const normalizeCondition = value => String(value || '').trim().replace(/\s+/g, ' ')
      const expectedNumberedCondition = "${{ inputs.should_translate && inputs.group == 'guides' && inputs.batch_number > 0 && ((steps.agents.outputs.translated_count || '0') != '0' || (steps.agents.outputs.failed_count || '0') != '0' || steps.source_delta.outputs.has_mutation == 'true') }}"
      const expectedUnbatchedCondition = "${{ inputs.should_translate && inputs.batch_number == 0 && ((steps.agents.outputs.translated_count || '0') != '0' || (steps.agents.outputs.failed_count || '0') != '0' || steps.source_delta.outputs.has_mutation == 'true') }}"

      if (!numbered || normalizeCondition(numberedCondition) !== normalizeCondition(expectedNumberedCondition)) {
        errors.push(`${file}: numbered Guides batches must use the dedicated mutation-aware local validation step`)
      }
      if (/mdx-parse|validate-mdx/.test(numberedRun)) errors.push(`${file}: numbered Guides batches must not run full-tree MDX parsing`)
      if (/validate-translated-coverage/.test(numberedRun)) errors.push(`${file}: numbered Guides batches must not run full-tree translated coverage`)
      if (/pnpm\s+run\s+build/.test(numberedRun)) errors.push(`${file}: numbered Guides batches must not run a full documentation build`)
      if (!/translation-batch-input\.js validate --input tmp\/translation-batch-input\.json/.test(numberedRun)) {
        errors.push(`${file}: numbered Guides batches must validate the canonical batch input`)
      }
      if (!/validate-translation-batch-outputs\.js[\s\S]*--manifest tmp\/translation-manifest\.json[\s\S]*--report tmp\/translation-report\.json[\s\S]*--batch-input tmp\/translation-batch-input\.json[\s\S]*--workspace "\$GITHUB_WORKSPACE"[\s\S]*--agents-outcome "\$AGENTS_OUTCOME"[\s\S]*--translated-count "\$TRANSLATED_COUNT"[\s\S]*--failed-count "\$FAILED_COUNT"[\s\S]*--remaining-count "\$REMAINING_COUNT"/.test(numberedRun)) {
        errors.push(`${file}: numbered Guides batches must validate agent report evidence and exact candidate output files`)
      }

      if (!unbatched || normalizeCondition(unbatchedCondition) !== normalizeCondition(expectedUnbatchedCondition)) {
        errors.push(`${file}: full translated validation must be restricted to unbatched runs`)
      }
      const candidateNames = Object.keys(candidateIdentity)
      const candidateIdentityIsExact = candidateNames.every(name => unbatched?.env?.[name] === candidateIdentity[name])
      const leaksCandidateIdentity = steps.some(step => step !== unbatched && candidateNames.some(name =>
        Object.hasOwn(step?.env || {}, name) || String(step?.run || '').includes(name)))
      if (!candidateIdentityIsExact || leaksCandidateIdentity) {
        errors.push(`${file}: candidate provenance must receive exact target, tooling, and source identities only in unbatched validation`)
      }
      if (!/node scripts\/translation\/validate-group\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP"/.test(unbatchedRun)) {
        errors.push(`${file}: unbatched translations must use group-local target validation`)
      }
      if (/validate-reference|reference-manifest|build:(?:en|zh-CN)/.test(unbatchedRun)) {
        errors.push(`${file}: group-local translation validation must not run whole-locale validation or site builds`)
      }
      for (const step of steps) {
        if (containsFullValidationCommand(step?.run)) errors.push(`${file}: translation producer must not run whole-site build commands`)
      }
      if (/--validation-command/.test(checkpointRun)) errors.push(`${file}: translation checkpoints must not attest a whole-site build`)
      if (!/validate-checkpoint-artifact\.js --artifact "\$BASELINE_CHECKPOINT_DIR"/.test(checkpointRun) || !/validate-checkpoint-artifact\.js --artifact "\$CHECKPOINT_DIR"/.test(checkpointRun)) {
        errors.push(`${file}: translation checkpoints must validate baseline and result artifact integrity`)
      }
      if (!/if \(\( \$\{\{ inputs\.batch_number \}\} > 0 \)\) && \[\[ "\$GROUP" == guides \]\]; then[\s\S]*validate-translation-batch\.js[\s\S]*--artifact "\$CHECKPOINT_DIR"[\s\S]*--baseline "\$BASELINE_CHECKPOINT_DIR"[\s\S]*--batch-number "\$\{\{ inputs\.batch_number \}\}"[\s\S]*--batch-count "\$\{\{ inputs\.batch_count \}\}"[\s\S]*\n\s*fi/.test(checkpointRun)) {
        errors.push(`${file}: numbered Guides checkpoints must validate baseline/result pair identity`)
      }
    }

    if (file === '_publish-translation-batches.yml') {
      const steps = workflow.jobs?.publish?.steps || []
      for (const input of ['source_commit_sha', 'expected_target_sha']) {
        if (workflow.on?.workflow_call?.inputs?.[input]?.required !== true) errors.push(`${file}: publisher must require authenticated source and target identities`)
      }
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
      const present = steps.filter(step => requiredNames.includes(step.name)).map(step => step.name)
      if (present.length !== requiredNames.length || present.some((name, index) => name !== requiredNames[index])) errors.push(`${file}: required staging publisher steps are missing or out of order`)
      const byName = new Map(steps.map(step => [step.name, step]))
      const initialize = String(byName.get('Initialize Guides translation publisher')?.run || '')
      if (!/! -L "\$trusted_root"/.test(initialize) || !/realpath -e -- "\$trusted_root"/.test(initialize) || !/stat -c '%u' -- "\$trusted_root"/.test(initialize) || !/id -u/.test(initialize)) errors.push(`${file}: publisher trusted root must be real, private, and owned by the runner user`)
      const capture = byName.get('Capture Guides translation publication identities')
      const captureIndex = steps.indexOf(capture)
      const installIndex = steps.findIndex(step => step.name === 'Install immutable master tooling')
      const downloadIndex = steps.findIndex(step => step.name === 'Download Guides translation checkpoints')
      if (!capture || captureIndex < 0 || installIndex < 0 || downloadIndex < 0 || installIndex >= captureIndex || captureIndex >= downloadIndex || !/createInitialPublisherState/.test(capture.run || '') || !/SOURCE_COMMIT_SHA/.test(capture.run || '') || !/EXPECTED_TARGET_SHA/.test(capture.run || '') || !/refs\/remotes\/origin\/\$TARGET_BRANCH\^\{commit\}/.test(capture.run || '')) errors.push(`${file}: publisher must install tooling, then authenticate and persist source and target identities before artifact download`)
      for (const name of requiredNames.slice(5)) if (String(byName.get(name)?.if || '') !== '${{ always() }}') errors.push(`${file}: cleanup, report, upload, and result steps must always run`)

      const identities = String(byName.get(requiredNames[0])?.run || '')
      const apply = String(byName.get(requiredNames[1])?.run || '')
      const push = String(byName.get(requiredNames[2])?.run || '')
      const validation = String(byName.get(requiredNames[3])?.run || '')
      const promotion = String(byName.get(requiredNames[4])?.run || '')
      const cleanup = String(byName.get(requiredNames[5])?.run || '')
      const report = String(byName.get(requiredNames[6])?.run || '')
      const result = String(byName.get(requiredNames[8])?.run || '')
      const publisherHelperPath = path.join(process.cwd(), 'scripts', 'docs-workflow', 'translation-staging-publisher.js')
      const publisherHelper = fs.existsSync(publisherHelperPath) ? fs.readFileSync(publisherHelperPath, 'utf8') : ''
      if (!/translation-batch-set\.js plan/.test(identities) || !/PAIRS_MANIFEST/.test(identities) || !/--expected-target-sha/.test(identities) || !/--source-checkpoint-sha/.test(identities) || !/tar -tf/.test(identities) || !/tar -tvf/.test(identities) || !/bindPublisherBatchIdentity/.test(identities) || !/find "\$result_root" -mindepth 1 -maxdepth 1/.test(identities) || !/! -L "\$result_root\/checkpoint-group\.tar"/.test(identities) || /git fetch/.test(identities)) errors.push(`${file}: publisher must safely extract every exact pair and plan the complete batch set before staging`)
      if (!/translation-staging-publisher/.test(apply) || !/applyPhase/.test(apply) || !/prepareStagingWorktree/.test(publisherHelper) || !/applyTranslationBatch/.test(publisherHelper) || !/commitAppliedBatch/.test(publisherHelper)) errors.push(`${file}: publisher must use one detached worktree and apply and commit batches in order`)
      if (!/translation-staging-publisher/.test(push) || !/pushPhase/.test(push) || !/deterministicStagingRef/.test(publisherHelper) || !/pushStagingRef/.test(publisherHelper) || !/probeRemoteStaging/.test(publisherHelper)) errors.push(`${file}: publisher must push and reconcile the exact deterministic Guides staging ref`)
      if (!/restore-generated-state\.sh --exact --ref "\$staged_sha"/.test(validation) || !/validate-guides-translation-staging\.js/.test(validation) || !/--trusted-root/.test(validation) || !/recordValidationInfrastructureFailure/.test(validation)) errors.push(`${file}: publisher must restore and validate the exact combined staged SHA through the fixed wrapper with retained failure evidence`)
      if (containsFullValidationCommand(validation)) errors.push(`${file}: combined staging validation must run only through the fixed validation wrapper`)
      if (!/status === 'no_changes'[\s\S]*promotePhase/.test(promotion) || !/promoteStaging/.test(publisherHelper) || !/probeRemoteTarget/.test(publisherHelper)) errors.push(`${file}: publisher must skip no-change promotion and otherwise use the normal fast-forward staging helper`)
      if (!/cleanupPhase/.test(cleanup) || !/deleteStagingWithLease/.test(publisherHelper)) errors.push(`${file}: staging cleanup must use the exact SHA lease helper`)
      if (!/createTerminalReport/.test(report) || !/writePublicationReport/.test(report) || !/trustedRoot/.test(report) || !/readPublicationReport/.test(result)) errors.push(`${file}: publisher must write and consume strict trusted publication evidence`)

      const outputs = ['status', 'commit_sha', 'staging_ref', 'staging_sha', 'report_artifact_name']
      for (const output of outputs) {
        if (workflow.on?.workflow_call?.outputs?.[output]?.value !== `\${{ jobs.publish.outputs.${output} }}` || workflow.jobs?.publish?.outputs?.[output] !== `\${{ steps.result.outputs.${output} }}`) errors.push(`${file}: publisher output ${output} must come from the validated terminal result`)
      }
      const upload = byName.get(requiredNames[7])
      if (upload?.with?.name !== 'docs-translation-publication-guides-${{ github.run_id }}-${{ github.run_attempt }}' || upload?.with?.path !== '${{ runner.temp }}/guides-translation-publication/publication-report.json') errors.push(`${file}: publisher must upload the exact run-attempt-scoped publication report`)
      if (!/mkdir -m 700/.test(source) || !/stat -c '%a' -- "\$trusted_root"/.test(source) || !/TRUSTED_ROOT/.test(source) || !/STATE_FILE/.test(source) || !/status: 'no_changes'[\s\S]*resultSha: state\.expectedTargetSha/.test(publisherHelper)) errors.push(`${file}: publisher must keep strict private JSON state and preserve the exact no-change SHA`)
      if (/publish-checkpoint\.sh|--max-attempts|for \(\(number=1; number<=BATCH_COUNT; number\+\+\)\)[\s\S]*publish-checkpoint/.test(source)) errors.push(`${file}: staging publisher must not use legacy or per-batch publication`)
      if (/git push[^\n]*(?:--force(?:\s|$)|-f(?:\s|$))/.test(source)) errors.push(`${file}: staging publisher must not force-update the target`)
      if (/APP_ID|APP_SECRET|FEISHU|report-live-card/.test(source)) errors.push(`${file}: staging publisher must not receive Feishu credentials`)
      if (/sed -n ['"]s\/\^status=|tee [^\n]*(?:publication|state)|tail -1/.test(source)) errors.push(`${file}: staging publisher must not derive state from logs`)
    }

    if (file === '_fetch-content-group.yml') {
      const steps = workflow.jobs?.produce?.steps || []
      const pnpmSetupIndex = steps.findIndex(step => step?.uses === 'pnpm/action-setup@v4')
      const nodeSetupIndex = steps.findIndex(step => step?.uses === 'actions/setup-node@v4')
      const installIndex = steps.findIndex(step => step?.name === 'Install dependencies')
      const validationIndex = steps.findIndex(step => step?.name === 'Validate content group')
      if (!(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < validationIndex)) {
        errors.push(`${file}: must install dependencies before validating the content group`)
      }
    }

    if (file === '_publish-content-group.yml') {
      const publisher = (workflow.jobs?.publish?.steps || []).find(step => step.name === 'Publish checkpoint')
      const expected = {
        ZDOC_PROVENANCE_CANDIDATE_TARGET: '${{ inputs.target }}',
        ZDOC_PROVENANCE_CANDIDATE_TOOLING_SHA: '${{ inputs.tooling_sha }}',
        ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA: '${{ inputs.source_sha }}',
      }
      if (!publisher || Object.entries(expected).some(([name, value]) => publisher.env?.[name] !== value)) {
        errors.push(`${file}: checkpoint validation must receive exact candidate provenance identities`)
      }
    }

    if (file === '_render-guides-table.yml') {
      const requiredPatterns = [
        [/render-guides-table\.js/, 'must invoke the table-scoped renderer'],
        [/guides-table-artifact\.js --operation create/, 'must create a validated table artifact'],
        [/NO_UPDATE_NOTIFIER: '1'/, 'must disable update notifier network checks'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/secrets:|APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|MODEL_API_KEY/.test(source)) {
        errors.push(`${file}: offline table render must not receive third-party credentials`)
      }
    }

    if (file === '_assemble-guides.yml') {
      const requiredPatterns = [
        [/inputs\.table_count != '0'[\s\S]*pattern: guides-table-/, 'must skip table artifact download for an empty matrix'],
        [/restore-guides-table-artifacts\.js/, 'must restore validated table artifacts'],
        [/generate-guides-sidebars\.js --media-manifest "\$media_manifest_path"/, 'must generate both combined sidebars through the offline wrapper'],
        [/publish-group --site[\s\S]*DOCS_TOOLING_GUIDES_STAGE: baseline/, 'must seed canonical Guides stages through docs-tooling'],
        [/publish-group --site[\s\S]*DOCS_TOOLING_GUIDES_STAGE: assembled/, 'must validate assembled canonical stages through docs-tooling'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      const steps = workflow.jobs?.assemble?.steps || []
      const stepById = new Map(steps.filter(step => step.id).map(step => [step.id, step]))
      const stepIndex = name => steps.findIndex(step => step.name === name)
      if (!workflow.on?.workflow_call?.inputs?.cache_version?.required || !workflow.on?.workflow_call?.inputs?.cache_save_required?.required) {
        errors.push(`${file}: must receive Guides cache version and save requirement from source validation`)
      }
      if (!workflow.on?.workflow_call?.inputs?.assembly_decision_sha256?.required) errors.push(`${file}: must receive the canonical Guides assembly decision hash`)
      const decisionIndex = stepIndex('Validate Guides assembly decision')
      const generateIndex = stepIndex('Generate combined Guides sidebars offline')
      const validateIndex = stepIndex('Validate combined guides output')
      const finalizeIndex = stepIndex('Finalize Guides assembly identity')
      const selectIndex = stepIndex('Select promoted Guides source snapshot')
      const createIndex = stepIndex('Create Guides v5 generation payload')
      const saveIndex = stepIndex('Save Guides v5 generation')
      const reportIndex = stepIndex('Record Guides cache generation persistence')
      const publicationStep = steps.find(step => step.name === 'Publish assembled Guides through docs-tooling')
      if (publicationStep?.env?.DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER !== "${{ inputs.site == 'zh-CN' && 'packages/docs-tooling/providers/aliyun-oss-validator.mjs' || '' }}" ||
          publicationStep?.env?.IMAGE_BED_URL !== "${{ inputs.site == 'zh-CN' && vars.ZH_CN_IMAGE_BED_URL || '' }}") {
        errors.push(`${file}: Chinese Guides publication must inject the repository-local Aliyun OSS validator without changing English validation`)
      }
      if (!(validateIndex >= 0 && validateIndex < selectIndex && selectIndex < createIndex && createIndex < saveIndex && saveIndex < reportIndex)) {
        errors.push(`${file}: Guides v5 generation must follow combined validation and promoted snapshot selection before save and reporting`)
      }
      if (!(decisionIndex >= 0 && decisionIndex < generateIndex && generateIndex < validateIndex && validateIndex < finalizeIndex && finalizeIndex < selectIndex)) {
        errors.push(`${file}: observe-only assembly must validate decision, generate, validate the selected site, then finalize identity`)
      }
      const decisionStep = steps[decisionIndex]
      if (!/validate-decision[\s\S]*decision-sha[\s\S]*inputs\.assembly_decision_sha256/.test(decisionStep?.run || '')) errors.push(`${file}: assembly must validate the restored decision against the plumbed canonical hash`)
      const generatorStep = steps[generateIndex]
      if (generatorStep?.if || generatorStep?.run !== 'node scripts/docs-workflow/generate-guides-sidebars.js --media-manifest "$media_manifest_path"') errors.push(`${file}: observe-only assembly generator must always run the fixed two-target wrapper once`)
      const validationStep = steps[validateIndex]
      if (!/validate-guides-source-contract\.js --site "\$ZDOC_SITE" --snapshot[\s\S]*validate-guides-coverage\.js --site "\$ZDOC_SITE"[\s\S]*validate-generated-sidebars\.js --site "\$ZDOC_SITE"/.test(validationStep?.run || '')) {
        errors.push(`${file}: Guides assembly must fail early on source completeness, media, coverage, and generated navigation for the selected site`)
      }
      const checkpointStep = steps.find(step => step.name === 'Create combined guides checkpoint')
      const expectedBuildMapping = "${{ inputs.site == 'en' && 'pnpm run build:en' || inputs.site == 'zh-CN' && 'pnpm run build:zh-CN' || '' }}"
      if (workflow.jobs?.assemble?.env?.ZDOC_BUILD_COMMAND !== expectedBuildMapping ||
          !/\[\[ -n "\$ZDOC_BUILD_COMMAND" \]\][\s\S]*validate-generated-sidebars\.js --site "\$ZDOC_SITE"[\s\S]*run-doc-build-stage\.js --build "\$ZDOC_BUILD_COMMAND" --skipLinkChecks --skipCardReporting/.test(validationStep?.run || '') ||
          !/printf -v build_validation[\s\S]*"\$ZDOC_BUILD_COMMAND"[\s\S]*--validation-command "\$build_validation"/.test(checkpointStep?.run || '') ||
          /run-doc-build-stage\.js --build "pnpm run build:en"/.test(source)) {
        errors.push(`${file}: Guides assembly build validation must use the explicit site-owned build mapping`)
      }
      const finalizeStep = steps[finalizeIndex]
      if (!/saas=generated\/\$\{\{ inputs\.site \}\}\/sidebars\/guides\.sidebar\.js[\s\S]*byoc=generated\/\$\{\{ inputs\.site \}\}\/sidebars\/guides-byoc\.sidebar\.js[\s\S]*cmp -s[^\n]*\$saas[\s\S]*cmp -s[^\n]*\$byoc[\s\S]*write-descriptor[\s\S]*--expected-decision-sha256 "\$\{\{ inputs\.assembly_decision_sha256 \}\}"[\s\S]*verify-descriptor[\s\S]*write-result[\s\S]*guides-assembly-result\.json/.test(finalizeStep?.run || '')) errors.push(`${file}: finalize must compare reuse bytes and write verified descriptor plus a separate result`)
      if (/npx docusaurus fetch-lark-docs[\s\S]*-sidebar/.test(source) || /cp[^\n]*baseline[^\n]*config\/generated\/guides(?:-byoc)?\.sidebar\.js/.test(source)) errors.push(`${file}: observe-only assembly must not restore sidebars or use the legacy split generators`)
      if (/--output packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-assembly-decision\.json/.test(finalizeStep?.run || '')) errors.push(`${file}: finalize must never mutate the immutable assembly decision`)
      const selection = stepById.get('promoted_snapshot')
      if (!/guides-cache-generation-lifecycle\.js select[\s\S]*--cache-version "\$\{\{ inputs\.cache_version \}\}"[\s\S]*--save-required "\$\{\{ inputs\.cache_save_required \}\}"[\s\S]*if \[\[ "\$selected" == candidate \]\]; then[\s\S]*promote-lark-doc-snapshot\.js/.test(selection?.run || '')) {
        errors.push(`${file}: unchanged valid-v5 assembly must preserve the baseline snapshot while save-required runs promote the candidate`)
      }
      const generation = stepById.get('guides_v5_generation')
      if (generation?.if !== "${{ inputs.cache_save_required == 'true' }}" ||
          !/guides-source-cache-generation\.js keys[\s\S]*--snapshot "\$snapshot"[\s\S]*guides-source-cache-generation\.js create[\s\S]*guides-source-cache-generation\.js validate[\s\S]*key=\$key/.test(generation?.run || '')) {
        errors.push(`${file}: v5 generation payload must be created, keyed, and revalidated from the exact promoted snapshot only when save is required`)
      }
      const save = stepById.get('save_guides_v5_generation')
      if (save?.if !== "${{ inputs.cache_save_required == 'true' && steps.guides_v5_generation.outcome == 'success' }}" || save?.['continue-on-error'] !== true || save?.uses !== 'actions/cache/save@v4' || save?.with?.path !== 'tmp/guides-source-cache-v5' || save?.with?.key !== '${{ steps.guides_v5_generation.outputs.key }}') {
        errors.push(`${file}: Guides v5 cache save must be conditional, nonfatal, and use the promoted snapshot generation key`)
      }
      const report = steps.find(step => step.name === 'Record Guides cache generation persistence')
      if (report?.if !== '${{ always() }}' || !/guides-cache-generation-lifecycle\.js report[\s\S]*steps\.promoted_snapshot\.outcome[\s\S]*steps\.promoted_source_manifest\.outcome[\s\S]*steps\.guides_v5_generation\.outcome[\s\S]*steps\.save_guides_v5_generation\.outcome[\s\S]*guides-cache-generation\.json/.test(report?.run || '')) {
        errors.push(`${file}: Guides cache generation report must run after save and record the actual preparation and save outcomes`)
      }
      if (/guides-source-cache\.js key[^\n]*--version 3/.test(source)) errors.push(`${file}: legacy v3 cache persistence is forbidden`)
    }

    if (file === 'fetch-docs.yml') {
      const forbidden = [
        '_translate-content-group.yml', '_prepare-translation-batches.yml',
        '_publish-translation-batches.yml', 'translate-content.yml',
        'TRANSLATION_AGENT_API_KEY', 'REVIEW_AGENT_API_KEY',
      ]
      for (const value of forbidden) if (source.includes(value)) errors.push(`${file}: source workflow must not embed translation implementation: ${value}`)
      const dispatches = source.match(/gh workflow run translate-codex\.yml/g) || []
      if (dispatches.length !== 1) errors.push(`${file}: source workflow must dispatch translate-codex.yml exactly once`)
      const handoff = workflow.jobs?.prepare_translation_handoff
      const handoffNeeds = Array.isArray(handoff?.needs) ? handoff.needs : []
      if (!handoffNeeds.includes('source_publication_barrier') ||
          !/translation-handoff\.js[\s\S]*--locale all[\s\S]*--source-shas-json "\$source_shas_json"/.test(source) ||
          !/WORKFLOW_REF: \$\{\{ github\.ref_name \}\}/.test(source)) {
        errors.push(`${file}: translation handoff must validate exact published source SHAs and trusted workflow ref`)
      }
      const dispatch = workflow.jobs?.dispatch_translations
      const dispatchNeeds = Array.isArray(dispatch?.needs) ? dispatch.needs : []
      if (dispatchNeeds.join(',') !== 'prepare,prepare_translation_handoff' ||
          !String(dispatch?.if || '').includes("needs.prepare_translation_handoff.result == 'success'") ||
          !/request_id="\$REQUEST_ID"[\s\S]*displayTitle[\s\S]*expected_title[\s\S]*run_url/.test(source) ||
          !/run_url[\s\S]*https:\/\/github\\\.com\/[\s\S]*actions\/runs\//.test(source) || !source.includes('[1-9][0-9]*')) {
        errors.push(`${file}: downstream dispatch must wait for a validated handoff and authenticate its run URL`)
      }
      const requiredSourcePatterns = [
        [/render_guides_tables:[\s\S]*max-parallel: 4[\s\S]*fromJSON\(needs\.produce_guides_sources\.outputs\.table_matrix\)/, 'must render Guides target/table matrix with max-parallel 4'],
        [/produce_guides:[\s\S]*render_guides_tables\.result == 'skipped'/, 'must assemble an empty Guides render matrix'],
        [/produce_guides:[\s\S]*cache_version: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_version \}\}[\s\S]*cache_save_required: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_save_required \}\}/, 'must pass Guides cache version and save requirement into assembly'],
      ]
      for (const [pattern, message] of requiredSourcePatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
    }

    if (file === '_publish-content-group.yml') {
      const steps = workflow.jobs?.publish?.steps || []
      const pnpmSetupIndex = steps.findIndex(step => step?.uses === 'pnpm/action-setup@v4')
      const nodeSetupIndex = steps.findIndex(step => step?.uses === 'actions/setup-node@v4')
      const installIndex = steps.findIndex(step => step?.name === 'Install dependencies')
      const contractIndex = steps.findIndex(step => step?.name === 'Validate content group contract')
      if (!(pnpmSetupIndex < nodeSetupIndex && nodeSetupIndex < installIndex && installIndex < contractIndex)) {
        errors.push(`${file}: must install dependencies before validating the content group contract`)
      }
      if (/require\(['"][^'"]+\.ts['"]\)/.test(source)) {
        errors.push(`${file}: must load TypeScript modules through the shared loader`)
      }
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/name: Check out immutable translation tooling[\s\S]*ref: \$\{\{ inputs\.tooling_sha \}\}[\s\S]*name: Check out immutable source tooling[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/, 'must check out exact translation tooling and separate source tooling'],
        [/actions\/download-artifact@v4/, 'must download the exact checkpoint artifact'],
        [/inputs\.baseline_artifact_name != ''[\s\S]*name: \$\{\{ inputs\.baseline_artifact_name \}\}/, 'must conditionally download the exact baseline artifact'],
        [/--translation-target[\s\S]*--source-checkpoint-sha[\s\S]*--tooling-sha[\s\S]*--source-site[\s\S]*--target-site[\s\S]*preflight-checkpoint-archive\.js[\s\S]*--manifest-output[\s\S]*tar -xf/, 'must verify the unique checkpoint manifest identity before full extraction'],
        [/extract_checkpoint_archive[\s\S]*extract_checkpoint_archive[\s\S]*manifest\.resolvedDir[\s\S]*payload[\s\S]*--baseline-dir/, 'must reuse safe extraction and pass the validated baseline payload directory'],
        [/validate-checkpoint-artifact\.js/, 'must validate checkpoint identity'],
        [/publish-checkpoint\.sh/, 'must invoke the checkpoint publisher'],
        [/status=failed[\s\S]*status=skipped[\s\S]*published[\s\S]*no_changes/, 'must emit deterministic terminal outputs'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/^concurrency:/m.test(source)) errors.push(`${file}: reusable publisher must let the orchestrator serialize publication`)
      if (/git-auto-commit|git push[^\n]*--force/.test(source)) errors.push(`${file}: publisher must not auto-commit or force-push`)
    }

    if (file === '_assemble-guides.yml') {
      const steps = workflow.jobs?.assemble?.steps || []
      const baselineIndex = steps.findIndex(step => step?.name === 'Prepare immutable baseline')
      const workspaceIndex = steps.findIndex(step => step?.name === 'Prepare selected Guides workspace')
      const sourceRestoreIndex = steps.findIndex(step => step?.name === 'Restore validated Guides source')
      if (baselineIndex < 0 || workspaceIndex <= baselineIndex || sourceRestoreIndex <= workspaceIndex ||
          steps[workspaceIndex]?.run !== 'node scripts/docs-workflow/prepare-content-group-workspace.js "${{ inputs.site }}" guides') {
        errors.push(`${file}: Guides assembly must restore and track site-wide build manifests before source assembly`)
      }
    }

    if (file === '_translate-publish-batch.yml' && !/preflight-checkpoint-archive\.js[\s\S]*--translation-target "\$TRANSLATION_TARGET"[\s\S]*--source-checkpoint-sha "\$SOURCE_COMMIT_SHA"[\s\S]*--tooling-sha "\$MASTER_SHA"[\s\S]*--source-site en[\s\S]*--target-site en[\s\S]*tar -xf/.test(source)) {
      errors.push(`${file}: durable publisher must verify checkpoint manifests before full extraction`)
    }

    if (file === '_verify-docs.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/name: Check out immutable master tooling[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}[\s\S]*fetch-depth: 0/, 'must check out immutable master tooling'],
        [/git fetch --no-tags origin "\$FINAL_DEV_SHA"[\s\S]*restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/, 'must materialize the exact final dev SHA'],
        [/restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/, 'must restore generated content from the exact final dev SHA'],
        [/name: Verify final cross-site consistency[\s\S]*run: \|\n\s+set -euo pipefail\n[\s\S]*validate-reference --site zh-CN[^\n]*\| tee/, 'must validate the final English-to-Chinese Reference relationship'],
        [/actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/, 'must always preserve verification reports'],
        [/status=passed[\s\S]*status=failed/, 'must emit a deterministic terminal status'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      const outputs = workflow.on?.workflow_call?.outputs || {}
      const jobOutputs = workflow.jobs?.verify?.outputs || {}
      if (outputs.revision_status?.value !== '${{ jobs.verify.outputs.revision_status }}' ||
        jobOutputs.revision_status !== '${{ steps.revision_result.outputs.status }}') {
        errors.push(`${file}: must expose revision status separately from overall status`)
      }
      const steps = workflow.jobs?.verify?.steps || []
      const revision = namedJobStep(workflow, 'verify', 'Verify revision waterline')
      const revisionRun = String(revision?.run || '')
      const revisionCommands = executableCommandLines(revisionRun)
      if (revision?.id !== 'revision' || revision?.['continue-on-error'] !== true ||
        !commandsAppearInOrder(revisionCommands, [
          'set -euo pipefail',
          'pnpm check:localization-input-inventory',
          'pnpm docs-tooling validate-revision-inventory --site en',
        ]) ||
        !/tmp\/final-verification-reports/.test(revisionRun)) {
        errors.push(`${file}: revision waterline must validate localization and revision inventories`)
      }
      if (terminatesBeforeCommand(revisionCommands, 'pnpm docs-tooling validate-revision-inventory --site en')) {
        errors.push(`${file}: revision waterline must not terminate before validation completes`)
      }
      const exactRevisionLogs = [
        'pnpm check:localization-input-inventory 2>&1 | tee tmp/final-verification-reports/localization-input-inventory.log',
        'pnpm docs-tooling validate-revision-inventory --site en 2>&1 | tee tmp/final-verification-reports/revision-inventory.log',
      ]
      if (exactRevisionLogs.some(command => !revisionRun.split('\n').map(line => line.trim()).includes(command))) {
        errors.push(`${file}: revision waterline commands must preserve exact report logs`)
      }
      const revisionResult = namedJobStep(workflow, 'verify', 'Emit revision reconciliation result')
      const revisionResultCommands = executableCommandLines(revisionResult?.run)
      const expectedRevisionResult = [
        'if [[ "${{ steps.revision.outcome }}" == success ]]; then',
        'echo "status=passed" >> "$GITHUB_OUTPUT"',
        'else',
        'echo "status=failed" >> "$GITHUB_OUTPUT"',
        'fi',
      ]
      if (revisionResult?.id !== 'revision_result' || String(revisionResult?.if || '').trim() !== '${{ always() }}' ||
        JSON.stringify(revisionResultCommands) !== JSON.stringify(expectedRevisionResult)) {
        errors.push(`${file}: revision reconciliation result must deterministically emit passed or failed`)
      }
      const materializeIndex = steps.findIndex(step => step?.name === 'Materialize exact final dev state')
      const revisionIndex = steps.indexOf(revision)
      const verification = namedJobStep(workflow, 'verify', 'Verify final cross-site consistency')
      const verificationIndex = steps.indexOf(verification)
      const verificationRun = String(verification?.run || '')
      const verificationCommands = executableCommandLines(verificationRun)
      const consistencyCommand = 'pnpm docs-tooling validate-reference --site zh-CN'
      if (!(materializeIndex >= 0 && materializeIndex < revisionIndex && revisionIndex < verificationIndex) ||
        verification?.id !== 'verification' || verification?.['continue-on-error'] !== true ||
        !commandsAppearInOrder(verificationCommands, ['set -euo pipefail', consistencyCommand])) {
        errors.push(`${file}: final verification must run lightweight cross-site consistency after revision reconciliation`)
      }
      if (terminatesBeforeCommand(verificationCommands, consistencyCommand)) {
        errors.push(`${file}: final consistency verification must not terminate before validation completes`)
      }
      if (/build:(?:en|zh-CN)|validate-generated-sidebars|validate-translated-coverage|validate-guides-source-contract|validate-workflow-policy|test:typescript-runtime-boundary/.test(verificationRun)) {
        errors.push(`${file}: final verification must not repeat site builds, site-owned validation, or tooling test suites`)
      }
      const uploadReports = namedJobStep(workflow, 'verify', 'Upload final verification reports')
      if (String(uploadReports?.if || '').trim() !== '${{ always() }}') {
        errors.push(`${file}: final verification report upload must always run`)
      }
      const resultCommands = executableCommandLines(namedJobStep(workflow, 'verify', 'Emit verification result')?.run)
      const expectedResult = [
        'if [[ "${{ steps.revision.outcome }}" == success && "${{ steps.verification.outcome }}" == success ]]; then',
        'echo "status=passed" >> "$GITHUB_OUTPUT"',
        'else',
        'echo "status=failed" >> "$GITHUB_OUTPUT"',
        'fi',
      ]
      if (JSON.stringify(resultCommands) !== JSON.stringify(expectedResult)) {
        errors.push(`${file}: overall status must require revision and site verification success`)
      }
      if (/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}/.test(source)) errors.push(`${file}: final verification tooling must not come from the dev content commit`)
      if (/contents: write|git push/.test(source)) errors.push(`${file}: final verification must remain read-only and must not publish`)
    }

    if (file === 'translate-codex.yml') {
      const requiredPatterns = [
        [/strategy:[\s\S]*matrix: \$\{\{ fromJSON\(needs\.prepare\.outputs\.sdk_producer_matrix\) \}\}[\s\S]*uses: \.\/\.github\/workflows\/_translate-content-group\.yml/, 'must run selected SDK translation producers through one matrix'],
        [/TRANSLATION_AGENT_API_KEY: \$\{\{ secrets\.TRANSLATION_AGENT_API_KEY \}\}[\s\S]*REVIEW_AGENT_API_KEY: \$\{\{ secrets\.REVIEW_AGENT_API_KEY \}\}/, 'must map only the translation agent secrets'],
        [/translation-handoff\.js[\s\S]*--source-shas-json "\$SOURCE_SHAS_JSON"/, 'must validate the exact translation handoff before paid work'],
        [/publish_ja_guides:[\s\S]*publish_ja_python:[\s\S]*publish_zh_python:[\s\S]*publish_ja_java:[\s\S]*publish_zh_java:/, 'must declare the deterministic publication chain'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/secrets: inherit/.test(source)) errors.push(`${file}: reusable translation must receive an explicit secret allowlist`)
      if (/^concurrency:/m.test(source)) errors.push(`${file}: translation producers must not share publication concurrency`)
      const inputs = workflow.on?.workflow_dispatch?.inputs || {}
      if (JSON.stringify(inputs.locale?.options) !== JSON.stringify(['all', 'ja-JP', 'zh-CN']) ||
        JSON.stringify(inputs.group?.options) !== JSON.stringify(['all', 'guides', 'python', 'java', 'node', 'go', 'cli', 'rest', 'reference-landings'])) {
        errors.push(`${file}: must expose the canonical locale and group selection contract`)
      }
      if (['locale', 'group', 'tooling_sha', 'source_shas_json'].some(input => inputs[input]?.required !== true)) {
        errors.push(`${file}: must require exact selection and immutable source identities`)
      }
    }

    if (file === 'translate-content.yml' && /^concurrency:/m.test(source)) {
      errors.push(`${file}: reusable target-aware workflow must not share its caller's publication concurrency group`)
    }
    if (file === 'translate-content.yml') {
      const dispatchInputs = workflow.on?.workflow_dispatch?.inputs || {}
      const callInputs = workflow.on?.workflow_call?.inputs || {}
      if (
        dispatchInputs.tooling_sha?.required !== true
        || dispatchInputs.source_ref?.default !== 'dev'
        || callInputs.tooling_sha?.required !== true
        || callInputs.source_sha?.required !== true
      ) errors.push(`${file}: manual translation must resolve source_ref while reusable callers pass exact immutable SHAs`)
      const steps = workflow.jobs?.prepare?.steps || []
      const validationIndex = steps.findIndex(step => step?.name === 'Validate immutable tooling identity')
      const checkoutIndex = steps.findIndex(step => String(step?.uses || '').startsWith('actions/checkout@'))
      if (validationIndex < 0 || checkoutIndex < 0 || validationIndex >= checkoutIndex || steps[checkoutIndex]?.with?.ref !== '${{ inputs.tooling_sha }}' || /refs\/remotes\/origin\/(?:master|\$TARGET_BRANCH)|REQUESTED_(?:TOOLING|SOURCE)_SHA|git rev-parse[^\n]*TARGET_BRANCH/.test(source)) {
        errors.push(`${file}: validate exact immutable SHAs before checkout without branch-tip fallback`)
      }
      const groupValidation = 'node scripts/translation/validate-group.js --target "$TRANSLATION_TARGET" --group "$GROUP"'
      if (workflow.jobs?.publish_exact?.with?.validate_command !== groupValidation) errors.push(`${file}: target publication must use group-local validation without a site build`)
    }
  }

  const readWorkflow = (file) => fs.existsSync(path.join(directory, file))
    ? fs.readFileSync(path.join(directory, file), 'utf8')
    : ''
  const translationWorkflow = yaml.load(readWorkflow('_translate-content-group.yml'))
  const publisherWorkflow = yaml.load(readWorkflow('_publish-content-group.yml'))
  const nodeVersion = (workflow, jobName) => (workflow?.jobs?.[jobName]?.steps || [])
    .find(step => step?.uses === 'actions/setup-node@v4')?.with?.['node-version']
  const translationNodeVersion = nodeVersion(translationWorkflow, 'translate')
  const publisherNodeVersion = nodeVersion(publisherWorkflow, 'publish')
  if (!translationNodeVersion || publisherNodeVersion !== translationNodeVersion) {
    errors.push('_publish-content-group.yml: publisher Node runtime must match the translation runtime')
  }
  const callerSource = readWorkflow('fetch-docs.yml')
  if (callerSource) {
    let caller
    try { caller = yaml.load(callerSource) } catch (_) { caller = null }
    const monitor = caller?.jobs?.monitor_docs_progress
    const prepareSteps = caller?.jobs?.prepare?.steps || []
    const installIndex = prepareSteps.findIndex(step => step?.run === 'pnpm install --frozen-lockfile')
    const readinessIndex = prepareSteps.findIndex(step => step?.name === 'Verify translation publication readiness')
    const cardIndex = prepareSteps.findIndex(step => step?.name === 'Create progress card')
    const readinessCommand = readinessIndex >= 0 ? String(prepareSteps[readinessIndex]?.run || '') : ''
    if (installIndex < 0 || readinessIndex <= installIndex || cardIndex <= readinessIndex ||
        readinessCommand !== 'node --test scripts/build/write-provenance.test.mjs scripts/doc-publish-bot/manualConfig.test.js scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/guides-cache-generation-lifecycle.test.js scripts/docs-workflow/guides-render-readiness.test.js scripts/docs-workflow/prepare-content-group-workspace.test.js scripts/docs-workflow/source-publication-barrier.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js') {
      errors.push('fetch-docs.yml: prepare must prove translation publication readiness before paid work starts')
    }
    const sourceGroups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']
    const sourceBarrier = caller?.jobs?.source_publication_barrier
    const sourceBarrierNeeds = Array.isArray(sourceBarrier?.needs) ? sourceBarrier.needs : []
    const expectedSourceBarrierNeeds = ['prepare', 'publish_guides', 'publish_zh_guides', ...sourceGroups.filter(group => group !== 'guides').map(group => `publish_${group}`)]
    const sourceBarrierSteps = sourceBarrier?.steps || []
    if (JSON.stringify(sourceBarrierNeeds) !== JSON.stringify(expectedSourceBarrierNeeds) ||
        !String(sourceBarrier?.if || '').includes("needs.prepare.outputs.publish == 'true'") ||
        !/ZH_GUIDES_RESULT[\s\S]*ZH_GUIDES_STATUS/.test(JSON.stringify(sourceBarrierSteps.at(-1)?.env || {})) ||
        !/\[\[ "\$ZH_GUIDES_RESULT" == success[\s\S]*"\$ZH_GUIDES_STATUS" == published[\s\S]*node scripts\/docs-workflow\/source-publication-barrier\.js/.test(sourceBarrierSteps.at(-1)?.run || '')) {
      errors.push('fetch-docs.yml: source publication barrier must verify every selected source publisher before paid translation')
    }
    const zhSource = caller?.jobs?.produce_zh_guides_sources
    const zhRender = caller?.jobs?.render_zh_guides_tables
    const zhAssemble = caller?.jobs?.produce_zh_guides
    const zhPublish = caller?.jobs?.publish_zh_guides
    if (zhSource?.with?.site !== 'zh-CN' || zhRender?.with?.site !== 'zh-CN' || zhAssemble?.with?.site !== 'zh-CN' ||
        JSON.stringify(zhRender?.needs) !== JSON.stringify(['prepare', 'produce_zh_guides_sources']) ||
        JSON.stringify(zhAssemble?.needs) !== JSON.stringify(['prepare', 'produce_zh_guides_sources', 'render_zh_guides_tables']) ||
        JSON.stringify(zhPublish?.needs) !== JSON.stringify(['prepare', 'produce_zh_guides', 'publish_guides']) ||
        zhPublish?.with?.group !== 'guides' || !/build:zh-CN/.test(zhPublish?.with?.validate_command || '')) {
      errors.push('fetch-docs.yml: Chinese Guides must use a complete site-qualified lane and serialize after English publication')
    }
    const handoffJob = caller?.jobs?.prepare_translation_handoff
    const dispatchJob = caller?.jobs?.dispatch_translations
    const handoffNeeds = Array.isArray(handoffJob?.needs) ? handoffJob.needs : []
    const dispatchNeeds = Array.isArray(dispatchJob?.needs) ? dispatchJob.needs : []
    if (!handoffNeeds.includes('source_publication_barrier') ||
        dispatchNeeds.join(',') !== 'prepare,prepare_translation_handoff' ||
        !String(dispatchJob?.if || '').includes("needs.prepare_translation_handoff.result == 'success'")) {
      errors.push('fetch-docs.yml: downstream translation dispatch must wait for successful source publication handoff')
    }
    const monitorNeeds = Array.isArray(monitor?.needs) ? monitor.needs : monitor?.needs ? [monitor.needs] : []
    if (monitorNeeds.length !== 1 || monitorNeeds[0] !== 'prepare') errors.push('fetch-docs.yml: central monitor must start after prepare only')
    if (monitor?.uses !== './.github/workflows/_monitor-docs-progress.yml') errors.push('fetch-docs.yml: central monitor must use _monitor-docs-progress.yml')
    const aggregateNeeds = Array.isArray(caller?.jobs?.aggregate?.needs) ? caller.jobs.aggregate.needs : []
    if (aggregateNeeds.includes('monitor_docs_progress')) errors.push('fetch-docs.yml: aggregate must not depend on the central monitor')
    const aggregateStep = (caller?.jobs?.aggregate?.steps || []).find(step => step?.id === 'aggregate')
    const aggregateEnv = aggregateStep?.env || {}
    if (aggregateEnv.ZH_GUIDES_PRODUCER !== '${{ needs.produce_zh_guides.outputs.status }}' ||
        aggregateEnv.ZH_GUIDES_SOURCE !== '${{ needs.publish_zh_guides.outputs.status }}' ||
        aggregateEnv.ZH_GUIDES_SOURCE_SHA !== '${{ needs.publish_zh_guides.outputs.commit_sha }}') {
      errors.push('fetch-docs.yml: aggregate must include both Guides locale lanes')
    }
    const fallback = caller?.jobs?.finalize_card_fallback
    const fallbackNeeds = Array.isArray(fallback?.needs) ? fallback.needs : []
    if (fallbackNeeds.join(',') !== 'prepare,aggregate,monitor_docs_progress') errors.push('fetch-docs.yml: fallback must depend on prepare, aggregate, and monitor')
    if (!String(fallback?.if || '').includes("needs.monitor_docs_progress.result != 'success'")) errors.push('fetch-docs.yml: fallback must run only when the monitor is unsuccessful')
    const aggregateSource = callerSource.slice(callerSource.indexOf('  aggregate:'), callerSource.indexOf('  finalize_card_fallback:'))
    if (!/name: docs-card-report-\$\{\{ github\.run_id \}\}/.test(aggregateSource) || !/name: Upload final card report artifact[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*continue-on-error: true/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: aggregate must always attempt the final card report artifact')
    }
    const downloadGuidesReports = aggregateSource.indexOf('name: Download current Guides reports')
    const collectReports = aggregateSource.indexOf('name: Collect card report summaries')
    if (downloadGuidesReports < 0) errors.push('fetch-docs.yml: aggregate must download current Guides reports')
    if (!(downloadGuidesReports >= 0 && collectReports > downloadGuidesReports)) {
      errors.push('fetch-docs.yml: current Guides reports must be downloaded before card collection')
    }
    if (!/name: Download current Guides reports[\s\S]*path: packages\/docs-tooling\/src\/lark\/meta\/reports/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: Guides reports must restore into the collector report directory')
    }
    if (!/CARD_REPORT_ARTIFACT_URL:/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: artifact-only card reports require a workflow artifact URL')
    }
    if (!/produce_guides:[\s\S]*assembly_decision_sha256: \$\{\{ needs\.produce_guides_sources\.outputs\.assembly_decision_sha256 \}\}/.test(callerSource)) {
      errors.push('fetch-docs.yml: must pass the canonical Guides assembly decision hash into assembly')
    }
    const createReport = aggregateSource.indexOf('name: Create final card report artifact')
    const reportIngestion = aggregateSource.slice(Math.max(0, downloadGuidesReports), createReport >= 0 ? createReport : aggregateSource.length)
    if (/APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY/.test(reportIngestion)) {
      errors.push('fetch-docs.yml: aggregate report ingestion must not receive Feishu credentials')
    }
    if (/name: Finish progress card|report-live-card\.sh/.test(callerSource)) errors.push('fetch-docs.yml: aggregate must not directly patch the card')
  }

  const distributedFiles = [
    '_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml',
    '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml',
    '_translate-publish-batch.yml', '_verify-docs.yml',
  ]
  const distributedPattern = /report-live-card\.sh|report-to-lark --card-(?:phase|finish|state-file|advance)|docs-tooling report-card (?:advance|finish|note)/
  for (const file of distributedFiles) {
    const source = readWorkflow(file)
    if (distributedPattern.test(source)) errors.push(`${file}: distributed card update is forbidden`)
    if (/^      card_(?:id|started_at|stages|mode):/m.test(source)) errors.push(`${file}: reporting-only card inputs are forbidden`)
  }

  const guidesSource = readWorkflow('_fetch-guides-sources.yml')
  if (guidesSource) {
    if (!/name: Create Guides progress metadata[\s\S]*continue-on-error: true/.test(guidesSource) ||
        !/name: Upload Guides progress metadata[\s\S]*continue-on-error: true[\s\S]*name: docs-progress-metadata-\$\{\{ github\.run_id \}\}/.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: Guides progress metadata must be best-effort and run-scoped')
    }
    let guidesWorkflow = {}
    try { guidesWorkflow = yaml.load(guidesSource) } catch {}
    const guidesSteps = guidesWorkflow.jobs?.fetch?.steps || []
    const stepById = new Map(guidesSteps.filter(step => step.id).map(step => [step.id, step]))
    const sourceConfigIndex = guidesSteps.findIndex(step => step.name === 'Resolve site-owned Guides source')
    const firstCacheIndex = guidesSteps.findIndex(step => step.name === 'Compute Guides cache generation keys')
    if (sourceConfigIndex < 0 || sourceConfigIndex >= firstCacheIndex ||
        guidesSteps[sourceConfigIndex]?.run !== 'pnpm docs-tooling guides-source-config --site "${{ inputs.site }}" --github-output "$GITHUB_ENV"') {
      errors.push('_fetch-guides-sources.yml: site-owned Guides source config must be resolved before cache operations')
    }
    if (!/artifact_name: guides-sources-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/.test(guidesSource) ||
        !/name: guides-sources-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: Guides source artifact identity must include the site')
    }
    const tableMatrix = stepById.get('table_matrix')
    if (!/guides-tables\.js matrix[\s\S]*--site "\$\{\{ inputs\.site \}\}"/.test(tableMatrix?.run || '')) {
      errors.push('_fetch-guides-sources.yml: Guides table matrix generation must pass the required site')
    }
    const sourceFetchIndex = guidesSteps.findIndex(step => step.name === 'Fetch shared guides sources')
    const renderReadinessIndex = guidesSteps.findIndex(step => step.name === 'Validate Guides render readiness')
    const tableMatrixIndex = guidesSteps.findIndex(step => step.id === 'table_matrix')
    if (!(renderReadinessIndex > sourceFetchIndex && renderReadinessIndex < tableMatrixIndex) ||
        !/guides-render-readiness\.js[\s\S]*--site "\$\{\{ inputs\.site \}\}"/.test(guidesSteps[renderReadinessIndex]?.run || '')) {
      errors.push('_fetch-guides-sources.yml: Guides render readiness must be validated before table matrix fan-out')
    }
    const requiredCacheSteps = [
      'Compute Guides cache generation keys',
      'Restore Guides v5 cache candidate',
      'Validate and promote Guides v5 cache candidate',
      'Restore Guides v4 cache candidate',
      'Validate and promote Guides v4 cache candidate',
    ]
    let lastCacheStep = -1
    for (const name of requiredCacheSteps) {
      const index = guidesSteps.findIndex(step => step.name === name)
      if (index <= lastCacheStep) {
        errors.push('_fetch-guides-sources.yml: Guides cache candidates must restore and validate in v5 then v4 order')
        break
      }
      lastCacheStep = index
    }
    const restoreKeyLines = guidesSource.match(/^\s+restore-keys:/gm) || []
    const v5Restore = stepById.get('source_cache_v5')
    const v4Restore = stepById.get('source_cache_v4')
    const keyStep = stepById.get('source_cache_keys')
    if (restoreKeyLines.length !== 2 || v5Restore?.with?.['restore-keys'] !== 'guides-source-${{ inputs.site }}-v5-' || v5Restore?.with?.path !== 'tmp/guides-source-cache-v5' ||
        v4Restore?.if !== "${{ steps.source_cache_v5_check.outputs.source_valid != 'true' && steps.source_cache_keys.outputs.v4_restore_enabled == 'true' }}" || v4Restore?.with?.['restore-keys'] !== '${{ steps.source_cache_keys.outputs.v4_prefix }}' || v4Restore?.with?.path !== 'tmp/guides-source-cache-v4' || v4Restore?.with?.key !== '${{ steps.source_cache_keys.outputs.v4_lookup }}' ||
        !/guides-source-cache\.js key[^\n]*--version 4[\s\S]*v4_prefix[\s\S]*v4_restore_enabled/.test(keyStep?.run || '')) {
      errors.push('_fetch-guides-sources.yml: Guides v5 self-contained restore and v4 snapshot-scoped fallback require isolated payload paths')
    }
    const v4Validation = stepById.get('source_cache_v4_check')?.run || ''
    const v5Validation = stepById.get('source_cache_v5_check')?.run || ''
    if (!/\[\[ -e "\$payload" \|\| -L "\$payload" \]\] && candidate_present=true[\s\S]*\[\[ -d "\$payload" && ! -L "\$payload" \]\][\s\S]*guides-source-cache-generation\.js validate[\s\S]*guides-source-cache-generation\.js promote[\s\S]*source_valid=true[\s\S]*media_valid=true/.test(v5Validation)) {
      errors.push('_fetch-guides-sources.yml: malformed v5 cache payload must be rejected before self-contained snapshot promotion')
    }
    if (!/guides-source-cache-source-promotion\.js validate[\s\S]*--payload "\$staged"[\s\S]*guides-source-cache\.js validate-media[\s\S]*"\$staged\/media-manifest\.json"/.test(v4Validation) ||
        !/else[\s\S]*guides-source-cache-source-promotion\.js promote[\s\S]*--payload "\$staged"[\s\S]*source_valid=true/.test(v4Validation)) {
      errors.push('_fetch-guides-sources.yml: v4 Guides source and media validity must remain independent before promotion')
    }
    if (!/\[\[ -e "\$payload" \|\| -L "\$payload" \]\] && candidate_present=true[\s\S]*\[\[ -d "\$payload" && ! -L "\$payload" && -f "\$snapshot" \]\]/.test(v4Validation)) {
      errors.push('_fetch-guides-sources.yml: malformed v4 cache payload must be reported as an invalid candidate')
    }
    if (/source_cache_v[123]|Guides v[123] cache|--version [123]\b/.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: Guides cache compatibility must retain only v5 and temporary v4')
    }
    if (/cache-hit/.test(guidesSource)) errors.push('_fetch-guides-sources.yml: Guides fallback must never trust cache-hit before validation')
    if (/rm -rf[^\n]*packages\/docs-tooling\/src\/lark\/meta\/(?:source-cache|media-cache)\/?(?:\s|$)/.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: Guides cleanup must remove exact cache leaves and preserve unrelated cache state')
    }
    for (const [validationName, nextRestoreName, requiredCleanup] of [
      ['Validate and promote Guides v5 cache candidate', 'Restore Guides v4 cache candidate', /rm -rf "\$staged" "\$payload"[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all/],
      ['Validate and promote Guides v4 cache candidate', 'Select validated Guides cache candidate', /rm -rf "\$staged" tmp\/guides-source-cache-v4[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all/],
    ]) {
      const block = guidesSource.slice(guidesSource.indexOf(`name: ${validationName}`), guidesSource.indexOf(`name: ${nextRestoreName}`))
      if (!requiredCleanup.test(block)) {
        errors.push('_fetch-guides-sources.yml: rejected Guides cache residue must be removed before fallback restore')
        break
      }
    }
    const cacheSelection = stepById.get('source_cache_check')?.run || ''
    if (!/source_cache_v5_check\.outputs\.source_valid[\s\S]*cache_version=v5[\s\S]*cache_state=valid[\s\S]*source_cache_v4_check\.outputs\.source_valid[\s\S]*cache_version=v4[\s\S]*cache_state=legacy/.test(cacheSelection)) {
      errors.push('_fetch-guides-sources.yml: Guides cache selection must prefer valid v5 and classify v4 as legacy')
    }
    const sourceFetchBlock = guidesSource.slice(
      guidesSource.indexOf('name: Fetch shared guides sources'),
      guidesSource.indexOf('name: Prefetch shared guides media'),
    )
    if (!/steps\.source_cache_check\.outputs\.source_valid/.test(sourceFetchBlock) || /steps\.source_cache_check\.outputs\.media_valid/.test(sourceFetchBlock)) {
      errors.push('_fetch-guides-sources.yml: full fetch must depend only on source validity')
    }
    const mediaPrefetchBlock = guidesSource.slice(
      guidesSource.indexOf('name: Prefetch shared guides media'),
      guidesSource.indexOf('id: source_cache_result'),
    )
    if (!/steps\.source_cache_check\.outputs\.media_valid/.test(mediaPrefetchBlock) ||
        !/Media cache unavailable; rebuilding complete canonical media coverage/.test(mediaPrefetchBlock) ||
        !/--snapshot packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-source-snapshot-candidate\.json/.test(mediaPrefetchBlock) ||
        !/--report packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-media-prefetch\.json/.test(mediaPrefetchBlock) ||
        !/if \[\[ "\$\{\{ steps\.source_cache_check\.outputs\.media_valid \}\}" == true \]\]; then[\s\S]*--mode incremental[\s\S]*--cache-state valid[\s\S]*--plan packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-incremental-fetch-plan\.json[\s\S]*--previous-manifest "\$media_manifest_path"/.test(mediaPrefetchBlock) ||
        !/else[\s\S]*--mode recovery[\s\S]*--cache-state "\$cache_state"/.test(mediaPrefetchBlock)) {
      errors.push('_fetch-guides-sources.yml: invalid media cache must trigger full canonical media recovery')
    }
    const recoveryBranch = mediaPrefetchBlock.slice(mediaPrefetchBlock.indexOf('else'), mediaPrefetchBlock.indexOf('node scripts/docs-workflow/guides-media-prefetch.js'))
    if (/--plan|--doc-token|--previous-manifest/.test(recoveryBranch)) errors.push('_fetch-guides-sources.yml: recovery media prefetch must use complete candidate snapshot coverage')
    const resultStep = stepById.get('source_cache_result')
    if (!resultStep || !/source_valid=true[\s\S]*media_valid=true[\s\S]*cache_version[\s\S]*cache_save_required/.test(resultStep.run || '') ||
        !/guides-cache-save-decision\.js decide[\s\S]*--cache-version "\$cache_version"[\s\S]*--prefetch-mode[\s\S]*--candidate "\$candidate"[\s\S]*--baseline "\$baseline"/.test(resultStep.run || '') || /candidate_key|baseline_key/.test(resultStep.run || '')) {
      errors.push('_fetch-guides-sources.yml: Guides cache result must emit validity, version, and save requirement from legacy, recovery, or snapshot change')
    }
    const tableIndex = guidesSteps.findIndex(step => step.name === 'Build Guides table render matrix')
    const decisionIndex = guidesSteps.findIndex(step => step.name === 'Evaluate Guides assembly reuse')
    const artifactIndex = guidesSteps.findIndex(step => step.name === 'Create shared source artifact')
    const decisionStep = stepById.get('assembly_decision')
    if (!(tableIndex >= 0 && tableIndex < decisionIndex && decisionIndex < artifactIndex) ||
        !/git -C "\$RUNNER_TEMP\/baseline" rev-parse HEAD[\s\S]*guides-assembly-identity\.js decide[\s\S]*--table-count "\$\{\{ steps\.table_matrix\.outputs\.count \}\}"[\s\S]*validate-decision[\s\S]*decision-sha[\s\S]*assembly_decision_sha256/.test(decisionStep?.run || '')) {
      errors.push('_fetch-guides-sources.yml: assembly reuse decision must follow final table planning and precede source artifact creation')
    }
    if (!/^      assembly_decision_sha256: \{ value: '\$\{\{ jobs\.fetch\.outputs\.assembly_decision_sha256 \}\}' \}$/m.test(guidesSource) || !/^      assembly_decision_sha256: \$\{\{ steps\.assembly_decision\.outputs\.assembly_decision_sha256 \}\}$/m.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: must expose the canonical assembly decision hash')
    }
  }

  for (const file of ['_assemble-guides.yml', '_publish-content-group.yml', '_translate-content-group.yml', '_publish-translation-batches.yml', '_translate-publish-batch.yml', '_verify-docs.yml']) {
    if (/APP_ID|APP_SECRET/.test(readWorkflow(file))) errors.push(`${file}: non-source job must not receive Feishu app credentials`)
  }

  const monitorSource = readWorkflow('_monitor-docs-progress.yml')
  if (monitorSource) {
    if (!/^permissions:\n  actions: read\n  contents: read$/m.test(monitorSource)) errors.push('_monitor-docs-progress.yml: monitor permissions must be actions: read and contents: read')
    if (/contents: write|actions: write|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/.test(monitorSource)) errors.push('_monitor-docs-progress.yml: monitor must not receive write or source-production credentials')
  } else if (callerSource) {
    errors.push('_monitor-docs-progress.yml: central monitor workflow is required')
  }

  const watchdogSource = readWorkflow('docs-ingestion-watchdog.yml')
  if (watchdogSource) {
    const watchdog = yaml.load(watchdogSource)
    if (watchdog.permissions?.actions !== 'read' || watchdog.permissions?.contents !== 'read' || Object.keys(watchdog.permissions || {}).length !== 2) {
      errors.push('docs-ingestion-watchdog.yml: watchdog permissions must be actions: read and contents: read only')
    }
    if (!/node scripts\/docs-workflow\/docs-ingestion-watchdog\.js[\s\S]*--repository "\$GITHUB_REPOSITORY"[\s\S]*--output tmp\/docs-ingestion-watchdog\.json/.test(watchdogSource)) {
      errors.push('docs-ingestion-watchdog.yml: watchdog must call the repository evaluator')
    }
    if (/git push|workflow_dispatches|gh workflow run|fetch-lark-docs|\bdeploy\b|contents: write|actions: write/.test(watchdogSource)) {
      errors.push('docs-ingestion-watchdog.yml: watchdog must remain read-only and must not dispatch, publish, or deploy')
    }
    if (!/continue-on-error: true[\s\S]*docs-ingestion-watchdog\.js/.test(watchdogSource) ||
        !/if-no-files-found: error/.test(watchdogSource) ||
        !/report-card create[\s\S]*report-card note --file[\s\S]*report-card finish/.test(watchdogSource) ||
        !/if \[ "\$WATCHDOG_OUTCOME" != "success" \][\s\S]*exit 1/.test(watchdogSource)) {
      errors.push('docs-ingestion-watchdog.yml: watchdog must upload evidence, alert best-effort, and preserve evaluator failure')
    }
  }

  for (const file of fs.readdirSync(directory).filter(name => /\.ya?ml$/.test(name))) {
    const workflow = yaml.load(fs.readFileSync(path.join(directory, file), 'utf8'))
    if (!workflow?.on || !Object.hasOwn(workflow.on, 'push')) continue
    const branches = workflow.on.push?.branches
    if (!Array.isArray(branches) || branches.some(branch => typeof branch !== 'string' || branch.includes('*') || branch.startsWith('docs-translation-staging/'))) {
      errors.push(`${file}: push deployment triggers must exclude docs-translation-staging/**`)
    }
  }

  const publisherPath = options.publisherPath || path.join(process.cwd(), 'scripts/docs-workflow/publish-checkpoint.sh')
  const publisherSource = fs.readFileSync(publisherPath, 'utf8')
  for (const [pattern, message] of [
    [/checkpoint-stage-paths\.js" select/, 'checkpoint publisher must select stageable manifest paths'],
    [/--pathspec-from-file="\$stage_paths_file"[\s\S]*--pathspec-file-nul/, 'checkpoint publisher must use NUL-delimited literal pathspec staging'],
    [/checkpoint-stage-paths\.js" verify/, 'checkpoint publisher must verify staged manifest scope'],
    [/docs-validation\.XXXXXX/, 'checkpoint publisher must validate with pinned tooling'],
    [/restore-generated-state\.sh" --exact --ref "\$target_sha"/, 'checkpoint publisher must materialize the exact target state for validation'],
    [/cd "\$validation_worktree" && bash -o errexit/, 'checkpoint publisher must run validation in the pinned tooling worktree'],
  ]) {
    if (!pattern.test(publisherSource)) errors.push(`publish-checkpoint.sh: ${message}`)
  }
  if (/git add --all -- "\$\{paths\[@\]\}"/.test(publisherSource)) {
    errors.push('publish-checkpoint.sh: direct manifest pathspec staging is not idempotent')
  }

  const recoveryShell = fs.readFileSync(options.recoveryShellPath || path.join(process.cwd(), 'scripts/docs-workflow/recover-translation-batches.sh'), 'utf8')
  const recoveryHelper = fs.readFileSync(options.recoveryHelperPath || path.join(process.cwd(), 'scripts/docs-workflow/recover-guides-translation.js'), 'utf8')
  if (!/^set -euo pipefail$/m.test(recoveryShell) || !/recover-guides-translation\.js/.test(recoveryShell) || /publish-checkpoint|gh run download|for \(\(batch|eval|git push/.test(recoveryShell)) {
    errors.push('recover-translation-batches.sh: recovery must be a strict delta-safe helper entrypoint')
  }
  for (const [pattern, message] of [
    [/deterministicStagingRef/, 'must derive the exact run-attempt pending-set staging ref'],
    [/assertGuidesSourceAuthority/, 'must verify all Guides source-authority paths'],
    [/planTranslationBatchSet/, 'must replan complete validated pairs when the target moved'],
    [/applyPhase/, 'must recompose through the delta-safe staging worktree path'],
    [/validate-guides-translation-staging\.js/, 'must rerun the fixed seven-command validation gate'],
    [/promoteStaging/, 'must use normal fast-forward staging promotion'],
    [/deleteStagingWithLease/, 'must use exact leased staging cleanup'],
    [/complete validated recovery pairs are unavailable/, 'must fail closed when target movement lacks complete recovery pairs'],
  ]) if (!pattern.test(recoveryHelper)) errors.push(`recover-guides-translation.js: ${message}`)
  if (/publish-checkpoint|gh run download|\[['"](?:merge|rebase)['"]|git[^\n]*push[^\n]*(?:--force|-f)|eval\(/.test(recoveryHelper)) {
    errors.push('recover-guides-translation.js: recovery must not replay batches, merge, rebase, eval, or force-push')
  }

  return errors
}

function main() {
  const errors = validateWorkflowPolicies()
  if (errors.length) {
    console.error(`Workflow policy violations:\n- ${errors.join('\n- ')}`)
    process.exitCode = 1
    return
  }
  console.log('All GitHub Actions workflows satisfy documentation production policy.')
}

if (require.main === module) main()

module.exports = { validateWorkflowPolicies }
