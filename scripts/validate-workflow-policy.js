'use strict'

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')

const workflowDirectory = path.join(process.cwd(), '.github', 'workflows')
const PRODUCTION_DEV_QUEUE = 'docs-production-dev'
const PRODUCTION_QUEUE_OWNERS = Object.freeze(new Map([
  ['fetch-docs.yml', {conditional: false}],
  ['recover-translation.yml', {conditional: true, expectedGroup: "${{ inputs.publish && 'docs-production-dev' || format('translation-recovery-readonly-{0}', github.run_id) }}"}],
  ['translate-codex.yml', {conditional: true, expectedGroup: "${{ inputs.publish && !(inputs.production_queue_owned || false) && 'docs-production-dev' || format('translation-readonly-{0}', github.run_id) }}"}],
  ['sync-master-tooling-to-dev.yml', {conditional: false}],
]))
const TOP_LEVEL_WRITER_INVENTORY = Object.freeze(new Map([
  ['fetch-docs.yml', ['publish_ready', 'reconcile_reference_state']],
  ['translate-codex.yml', ['publish_ready']],
  ['sync-master-tooling-to-dev.yml', ['sync']],
]))
const TOP_LEVEL_DIRECT_PUSH_JOBS = Object.freeze(new Map([
  ['fetch-docs.yml', new Set(['reconcile_reference_state'])],
  ['sync-master-tooling-to-dev.yml', new Set(['sync'])],
]))
const publishingWorkflows = new Set([
  'fetch-docs.yml',
  'recover-translation.yml',
  'translate-codex.yml',
  'sync-master-tooling-to-dev.yml',
])

const minimumNode24ActionMajors = new Map([
  ['actions/checkout', 5],
  ['actions/setup-node', 5],
  ['actions/upload-artifact', 6],
  ['actions/download-artifact', 7],
  ['actions/cache', 5],
  ['actions/cache/restore', 5],
  ['actions/cache/save', 5],
  ['pnpm/action-setup', 5],
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

function hasDoubleQuotedGithubExpressionString(source) {
  return [...String(source || '').matchAll(/\$\{\{([\s\S]*?)\}\}/g)]
    .some(([, expression]) => /\[\s*"[^"\r\n]+"\s*\]/.test(expression))
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

function concurrencyGroupOf(concurrency) {
  return typeof concurrency === 'string' ? concurrency : concurrency?.group
}

function isProductionDevQueueGroup(group) {
  if (typeof group !== 'string') return false
  const expressions = [...group.matchAll(/\$\{\{([\s\S]*?)\}\}/g)]
  if (expressions.length === 0) return group.toLowerCase() === PRODUCTION_DEV_QUEUE
  return expressions.some(([, expression]) =>
    [...expression.matchAll(/'((?:[^']|'')*)'|"((?:[^"\\]|\\.)*)"/g)]
      .some(match => String(match[1] ?? match[2]).toLowerCase() === PRODUCTION_DEV_QUEUE))
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

function validateFetchPublicationProducer({workflow, source, file, jobName, checkpointStepId, readyCondition, errors}) {
  const inputs = workflow.on?.workflow_call?.inputs || {}
  const requiredInputs = ['publication_selection_artifact_name', 'publication_selection_sha256', 'publication_unit_key']
  const steps = workflow.jobs?.[jobName]?.steps || []
  const download = steps.find(step => step?.name === 'Download publication selection')
  const validate = steps.find(step => step?.name === 'Validate publication selection identity')
  const validationRun = String(validate?.run || '')
  if (requiredInputs.some(input => inputs[input]?.required !== true) ||
      !/publication-contracts\.js validate-selection/.test(validationRun) ||
      !/inputs\.publication_selection_sha256/.test(validationRun) ||
      !/inputs\.publication_unit_key/.test(validationRun)) {
    errors.push(`${file}: producer must require and authenticate the publication selection identity`)
  }

  const checkpointIndex = steps.findIndex(step => step?.id === checkpointStepId)
  const downloadIndex = steps.indexOf(download)
  const validateIndex = steps.indexOf(validate)
  const readyIndex = steps.findIndex(step => step?.name === 'Create publication ready descriptor')
  const ready = steps[readyIndex]
  const readyRun = String(ready?.run || '')
  const uploadIndex = steps.findIndex(step => step?.id === 'ready_upload')
  const upload = steps[uploadIndex]
  const resultRun = String(steps.find(step => step?.id === 'result')?.run || '')
  const descriptorIsBound = download?.uses === 'actions/download-artifact@v7' &&
    download?.with?.name === '${{ inputs.publication_selection_artifact_name }}' &&
    downloadIndex >= 0 && validateIndex > downloadIndex && checkpointIndex > validateIndex &&
    readyIndex > checkpointIndex && uploadIndex > readyIndex && ready?.if === readyCondition &&
    /fetch-publication-selection\.js ready/.test(readyRun) &&
    /--selection "\$PUBLICATION_SELECTION"/.test(readyRun) &&
    /--unit-key "\$PUBLICATION_UNIT_KEY"/.test(readyRun) &&
    /--archive "\$CHECKPOINT_TAR"/.test(readyRun) &&
    /--manifest "\$CHECKPOINT_MANIFEST"/.test(readyRun) &&
    /publication-ready-fetch-\$unit_token-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/.test(readyRun) &&
    upload?.uses === 'actions/upload-artifact@v6' &&
    upload?.with?.name === '${{ steps.publication_ready.outputs.artifact_name }}' &&
    upload?.with?.['if-no-files-found'] === 'error' &&
    new RegExp(`steps\\.${checkpointStepId}\\.outcome`).test(resultRun) &&
    /steps\.ready_upload\.outcome/.test(resultRun) && /artifact_ready/.test(resultRun)
  if (!descriptorIsBound) errors.push(`${file}: producer must create and upload the exact bound publication ready descriptor`)

  if (workflow.permissions?.contents !== 'read' ||
      /git push|contents: write|report-live-card|card_id|ACTION_TOKEN|GH_TOKEN|PUBLICATION_GITHUB_TOKEN/.test(source)) {
    errors.push(`${file}: producer must remain read-only and coordinator-free`)
  }
}

function validateTranslationReadyProducer({workflow, source, file, errors}) {
  const inputs = workflow.on?.workflow_call?.inputs || {}
  const selectionInputs = ['publication_selection_artifact_name', 'publication_selection_sha256', 'publication_unit_key']
  const steps = workflow.jobs?.translate?.steps || []
  const download = steps.find(step => step?.name === 'Download translation publication selection')
  const validate = steps.find(step => step?.name === 'Validate translation publication selection identity')
  const checkpoint = steps.findIndex(step => step?.name === 'Upload translation checkpoint')
  const baseline = steps.findIndex(step => step?.name === 'Upload translation baseline')
  const checkpointCreation = steps.findIndex(step => step?.name === 'Create validated translation checkpoints')
  const numberedValidation = steps.findIndex(step => step?.name === 'Validate translated batch outputs')
  const unbatchedValidation = steps.findIndex(step => step?.name === 'Validate unbatched translated group')
  const ready = steps.findIndex(step => step?.name === 'Create immutable Translation ready descriptor')
  const upload = steps.findIndex(step => step?.name === 'Upload immutable Translation ready descriptor')
  const readyRun = String(steps[ready]?.run || '')
  const validationRun = String(validate?.run || '')
  const validIdentity = selectionInputs.every(input => inputs[input]?.required === false && inputs[input]?.type === 'string' && inputs[input]?.default === '') &&
    download?.uses === 'actions/download-artifact@v7' &&
    download?.if === undefined &&
    download?.with?.name === '${{ inputs.publication_selection_artifact_name }}' &&
    validate?.if === undefined &&
    /publication-contracts\.js validate-selection/.test(validationRun) &&
    /inputs\.publication_selection_sha256/.test(String(validate?.env?.PUBLICATION_SELECTION_SHA256 || '')) &&
    /PUBLICATION_UNIT_KEY/.test(String(validate?.run || ''))
  if (!validIdentity) errors.push(`${file}: Translation producer must require and authenticate the immutable publication selection identity`)
  const exactUnitIdentity = [
    'selected.target !== process.env.TRANSLATION_TARGET',
    'selected.group !== process.env.GROUP',
    'selected.toolingSha !== process.env.TOOLING_SHA',
    'selected.sourceBaselineSha !== process.env.SOURCE_BASELINE_SHA',
    'selected.sourceCheckpointSha !== process.env.SOURCE_CHECKPOINT_SHA',
    'selected.artifacts.checkpoint',
    'selected.artifacts.baseline',
  ].every(fragment => validationRun.includes(fragment))
  if (!exactUnitIdentity) errors.push(`${file}: Translation producer must authenticate the exact selected unit identity`)
  const validDescriptor = checkpoint >= 0 && baseline > checkpoint && ready > baseline && upload > ready &&
    steps[ready]?.id === 'publication_ready' &&
    String(steps[ready]?.if || '').startsWith('${{ inputs.batch_number == 0 &&') &&
    /translation-publication-selection\.js ready/.test(readyRun) &&
    /--selection "\$RUNNER_TEMP\/publication-selection\/publication-selection\.json"/.test(readyRun) &&
    /--unit-key "\$PUBLICATION_UNIT_KEY"/.test(readyRun) &&
    /--checkpoint-archive "\$RUNNER_TEMP\/checkpoint\/checkpoint-group\.tar"/.test(readyRun) &&
    /--baseline-archive "\$RUNNER_TEMP\/baseline\/checkpoint-group\.tar"/.test(readyRun) &&
    readyRun.includes('unit_token=${PUBLICATION_UNIT_KEY//\\//-}') &&
    readyRun.includes('artifact_name=publication-ready-translation-$unit_token-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT') &&
    /artifact_name=publication-ready-translation-\$unit_token-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT" >> "\$GITHUB_OUTPUT"/.test(readyRun) &&
    steps[upload]?.uses === 'actions/upload-artifact@v6' &&
    String(steps[upload]?.if || '').startsWith('${{ inputs.batch_number == 0 &&') &&
    steps[upload]?.with?.name === '${{ steps.publication_ready.outputs.artifact_name }}'
  if (!validDescriptor) errors.push(`${file}: Translation producer must upload checkpoint and baseline artifacts before its bound ready descriptor`)
  const materializationSteps = [checkpointCreation, checkpoint, ready, upload]
  if ([numberedValidation, unbatchedValidation, ...materializationSteps].some(index => index < 0) ||
      [numberedValidation, unbatchedValidation].some(validationIndex => materializationSteps.some(index => validationIndex >= index))) {
    errors.push(`${file}: Translation validators must precede checkpoint and ready-descriptor materialization`)
  }
  if (!readyRun.includes('artifact_name=publication-ready-translation-$unit_token-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT') ||
      !/artifact_name=publication-ready-translation-\$unit_token-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT" >> "\$GITHUB_OUTPUT"/.test(readyRun) ||
      steps[upload]?.with?.name !== '${{ steps.publication_ready.outputs.artifact_name }}') {
    errors.push(`${file}: Translation producer ready artifact name must use the normalized unit token and run attempt`)
  }
  if (workflow.permissions?.contents !== 'read' || /git push|contents: write/.test(source)) {
    errors.push(`${file}: Translation producer must remain read-only and coordinator-free`)
  }
}

function validateWorkflowPolicies(directory = workflowDirectory, options = {}) {
  const errors = []
  const files = fs.readdirSync(directory).filter(file => /\.ya?ml$/.test(file)).sort()
  const sourcePublicationWorkflows = new Set(['_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml'])
  const scriptsRoot = options.scriptsRoot || path.join(process.cwd(), 'scripts', 'docs-workflow')

  if (files.includes('fetch-docs.yml')) {
    const transactionSource = fs.readFileSync(path.join(scriptsRoot, 'fetch-reference-reconciliation.js'), 'utf8')
    const transactionRequirements = [
      'return runPublicationStrategyTransaction({',
      'restore-generated-state.sh',
      "'--exact', '--ref', candidate.candidateSha",
      'async validateNoChanges({targetSha}) {',
      "'--exact', '--ref', targetSha",
      "'docs-tooling', 'validate-reference', '--site', 'zh-CN'",
      "['push', remote, `HEAD:refs/heads/${selection.targetBranch}`]",
      'async probeRemoteCandidate(context) {',
      'merge-base',
      'is-ancestor',
    ]
    const referenceValidationCount = transactionSource.split("'docs-tooling', 'validate-reference', '--site', 'zh-CN'").length - 1
    if (transactionRequirements.some(fragment => !transactionSource.includes(fragment)) || referenceValidationCount < 2 ||
        /\['push',[^\]]*(?:force-with-lease|--force\b)/.test(transactionSource)) {
      errors.push('fetch-reference-reconciliation.js: Fetch reconciliation must use the common transaction with exact validation, non-force promotion, and remote probing')
    }
  }

  for (const file of files) {
    const source = fs.readFileSync(path.join(directory, file), 'utf8')
    if (hasDoubleQuotedGithubExpressionString(source)) {
      errors.push(`${file}: GitHub expressions must use single-quoted string literals`)
    }
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
    if (file === 'recover-translation.yml') {
      if (workflow.permissions?.contents !== 'write') errors.push('recover-translation.yml: caller must grant contents: write so publish_ready can publish')
      if (workflow.jobs?.prepare_recovery?.permissions?.contents !== 'read' || workflow.jobs?.run_translation?.permissions?.contents !== 'write') {
        errors.push('recover-translation.yml: only the reusable Translation call may receive the contents write ceiling')
      }
    }
    const productionQueueOwner = PRODUCTION_QUEUE_OWNERS.get(file)
    const concurrencyGroup = concurrencyGroupOf(workflow?.concurrency)
    if (productionQueueOwner?.conditional) {
      const expectedGroup = productionQueueOwner.expectedGroup
      if (concurrencyGroup !== expectedGroup) {
        errors.push(`${file}: read-only Translation must use a unique concurrency group`)
      }
      if (workflow?.concurrency?.queue !== 'max') {
        errors.push(`${file}: production dev queue owner must use group docs-production-dev with queue: max`)
      }
    } else if (productionQueueOwner) {
      if (concurrencyGroup !== PRODUCTION_DEV_QUEUE || workflow?.concurrency?.queue !== 'max') {
        errors.push(`${file}: production dev queue owner must use group docs-production-dev with queue: max`)
      }
    } else if (isProductionDevQueueGroup(concurrencyGroup)) {
      errors.push(file.startsWith('_')
        ? `${file}: reusable workflow must not reacquire docs-production-dev`
        : `${file}: only production dev queue owners may use docs-production-dev`)
    }
    const jobAcquiresProductionQueue = Object.values(workflow.jobs || {})
      .some(job => isProductionDevQueueGroup(concurrencyGroupOf(job?.concurrency)))
    if (jobAcquiresProductionQueue) {
      errors.push(file.startsWith('_')
        ? `${file}: reusable workflow must not reacquire docs-production-dev`
        : productionQueueOwner
          ? `${file}: job-level concurrency must not reacquire docs-production-dev`
          : `${file}: job-level concurrency must not acquire docs-production-dev`)
    }
    const deprecatedActionRuntimeErrors = new Set()
    for (const job of Object.values(workflow.jobs || {})) {
      for (const step of Array.isArray(job?.steps) ? job.steps : []) {
        const reference = String(step?.uses || '')
        const match = reference.match(/^([^@\s]+)@v(\d+)$/)
        if (!match) continue
        const [, action, majorText] = match
        const minimumMajor = minimumNode24ActionMajors.get(action)
        const major = Number(majorText)
        if (minimumMajor && major < minimumMajor) {
          deprecatedActionRuntimeErrors.add(
            `${file}: ${action}@v${major} uses the deprecated Node 20 action runtime; require @v${minimumMajor} or newer`,
          )
        }
      }
    }
    errors.push(...deprecatedActionRuntimeErrors)
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
    if (file === '_fetch-content-group.yml') {
      validateFetchPublicationProducer({
        workflow, source, file, jobName: 'produce', checkpointStepId: 'checkpoint_upload',
        readyCondition: "${{ steps.checkpoint_upload.outcome == 'success' }}", errors,
      })
    }
    if (file === '_assemble-guides.yml') {
      validateFetchPublicationProducer({
        workflow, source, file, jobName: 'assemble', checkpointStepId: 'upload',
        readyCondition: "${{ steps.upload.outcome == 'success' && steps.reports.outcome == 'success' }}", errors,
      })
    }
    if (/build:zh-CN:site/.test(source) && !['_assemble-guides.yml', 'fetch-docs.yml'].includes(file)) {
      errors.push(`${file}: Chinese site-only build is reserved for the Chinese Guides source lane`)
    }

    const immutableTranslationToolingFiles = new Set([
      '_prepare-translation-batches.yml', '_translate-content-group.yml',
    ])
    if (immutableTranslationToolingFiles.has(file)) {
      const checkoutSteps = Object.values(workflow.jobs || {}).flatMap(job => Array.isArray(job?.steps) ? job.steps : [])
        .filter(step => String(step?.uses || '').startsWith('actions/checkout@'))
      if (checkoutSteps.length === 0 || checkoutSteps.some(step => step.with?.ref !== '${{ inputs.tooling_sha }}')) {
        errors.push(`${file}: translation tooling checkout must use exact inputs.tooling_sha`)
      }
    }

    if (publishingWorkflows.has(file)) {
      if (file === 'fetch-docs.yml' || file === 'translate-codex.yml') {
        const writableJobs = Object.entries(workflow.jobs || {}).filter(([, job]) => job?.permissions?.contents === 'write')
        const expected = TOP_LEVEL_WRITER_INVENTORY.get(file)
        if (workflow.permissions?.contents !== 'read' || workflow.permissions?.actions !== 'read' ||
            JSON.stringify(writableJobs.map(([name]) => name)) !== JSON.stringify(expected)) {
          errors.push(`${file}: Git writer inventory must be exactly ${expected.join(',')}`)
        }
      } else if (!/^  contents: write$/m.test(source)) {
        errors.push(`${file}: publishing workflow requires explicit contents: write`)
      }
    } else if (!/^  contents: read$/m.test(source)) {
      errors.push(`${file}: validation workflow must be read-only`)
    }

    if (!file.startsWith('_')) {
      const allowed = TOP_LEVEL_DIRECT_PUSH_JOBS.get(file) || new Set()
      const directPushJobs = []
      for (const [jobName, job] of Object.entries(workflow.jobs || {})) {
        if (/git(?:\s+-C\s+\S+)?\s+push\b/.test(JSON.stringify(job))) {
          directPushJobs.push(jobName)
          if (!allowed.has(jobName)) errors.push(`${file}: git push is forbidden outside the declared Git writer inventory: ${jobName}`)
        }
      }
      if (file === 'sync-master-tooling-to-dev.yml' && JSON.stringify(directPushJobs) !== JSON.stringify(['sync'])) {
        errors.push(`${file}: Git writer inventory must be exactly sync`)
      }
    }

    if (file === 'playwright.yml') {
      if (!workflow.on?.push || !workflow.on?.pull_request) {
        errors.push(`${file}: push and pull_request must both be declared under on`)
      }
      if (workflow.concurrency?.pull_request) {
        errors.push(`${file}: pull_request must not be nested under concurrency`)
      }
    }

    if (file === 'site-validation.yml') {
      const classifierCheckout = namedJobStep(workflow, 'classify', 'Check out candidate')
      const comparisonFetch = namedJobStep(workflow, 'classify', 'Fetch comparison base')
      const comparisonRun = String(comparisonFetch?.run || '')
      if (classifierCheckout?.uses !== 'actions/checkout@v5' ||
          classifierCheckout?.with?.['fetch-depth'] !== 2 ||
          classifierCheckout?.with?.['sparse-checkout'] !== 'deploy/contracts' ||
          String(comparisonFetch?.if || '').trim() !== "${{ github.event_name != 'workflow_dispatch' || inputs.site == 'auto' }}" ||
          comparisonFetch?.env?.BASE_SHA !== '${{ github.event.pull_request.base.sha || github.event.before || github.sha }}' ||
          !/\[\[ "\$BASE_SHA" =~ \^\[0-9a-f\]\{40\}\$ \]\]/.test(comparisonRun) ||
          !/\[\[ ! "\$BASE_SHA" =~ \^0\{40\}\$ \]\][\s\S]*git cat-file -e "\$BASE_SHA\^\{commit\}"/.test(comparisonRun) ||
          !/git fetch --no-tags --filter=blob:none --depth=1 origin -- "\$BASE_SHA"/.test(comparisonRun)) {
        errors.push(`${file}: classifier must use a shallow sparse checkout and exact comparison-base fetch`)
      }
      for (const jobName of ['build_zh_cn', 'reference_coverage']) {
        const steps = workflow.jobs?.[jobName]?.steps || []
        const checkout = steps.find(step => step?.uses === 'actions/checkout@v5')
        const sourceFetch = steps.find(step => step?.name === 'Fetch immutable Reference source commit')
        if (checkout?.with?.ref !== '${{ needs.classify.outputs.source_sha }}' ||
            checkout?.with?.['fetch-depth'] !== 0 ||
            sourceFetch) {
          errors.push(`${file}: ${jobName} must retain full history for per-record Reference source checkpoints`)
        }
      }
      const chineseBuildRuns = (workflow.jobs?.build_zh_cn?.steps || []).map(step => String(step?.run || '')).join('\n')
      const toolsCoverageRuns = (workflow.jobs?.tools_coverage?.steps || []).map(step => String(step?.run || '')).join('\n')
      if (!/build\/zh-CN\/build-provenance\.json[\s\S]*toolsSidebarReachable[\s\S]*docs-agents/.test(chineseBuildRuns) ||
          !/test "\$ZH_CN_RESULT" = success/.test(toolsCoverageRuns) ||
          /validate-guides-source-contract|validate-guides-coverage|validate-generated-sidebars|pnpm (?:run )?build:zh-CN/.test(toolsCoverageRuns)) {
        errors.push(`${file}: Chinese Tools validation must rely on the provenance-enforced Chinese build without unavailable source-state checks`)
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

    if (file === 'sync-master-tooling-to-dev.yml') {
      const checkout = namedJobStep(workflow, 'sync', 'Check out workflow tooling')
      if (checkout?.uses !== 'actions/checkout@v5' ||
          checkout?.with?.ref !== '${{ github.sha }}' ||
          checkout?.with?.['fetch-depth'] !== 0 ||
          checkout?.with?.filter !== 'blob:none') {
        errors.push(`${file}: tooling sync must retain the full commit graph without downloading historical blobs`)
      }
    }

    if (file === '_fetch-content-group.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/actions\/checkout@v5[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/, 'must check out the immutable master_sha input'],
        [/restore-generated-state\.sh --exact --ref "\$DEV_BASELINE_SHA"/, 'must exactly restore generated state from the immutable baseline SHA'],
        [/name: Restore generated state from dev baseline[\s\S]*name: Prepare selected content group workspace[\s\S]*prepare-content-group-workspace\.js "\$SITE" "\$GROUP"[\s\S]*name: Fetch content group/, 'must prepare the selected site group after baseline restore and before generation'],
        [/create-checkpoint-artifact\.js/, 'must create a checkpoint artifact'],
        [/validate-checkpoint-artifact\.js/, 'must validate the checkpoint artifact'],
        [/actions\/upload-artifact@v6/, 'must upload the checkpoint artifact'],
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
      if (!report || report.uses !== 'actions/upload-artifact@v6' || report.with?.['if-no-files-found'] !== 'error' ||
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
        [/SOURCE_BASELINE_SHA: \$\{\{ inputs\.source_baseline_sha \}\}[\s\S]*SOURCE_CHECKPOINT_SHA: \$\{\{ inputs\.source_checkpoint_sha \}\}[\s\S]*TARGET_BASELINE_SHA: \$\{\{ inputs\.target_baseline_sha \|\| inputs\.source_checkpoint_sha \}\}[\s\S]*TOOLING_SHA: \$\{\{ inputs\.tooling_sha \}\}/, 'must bind separate source baseline, source checkpoint, target baseline, and tooling identities'],
        [/git worktree add --detach "\$target_baseline_dir" "\$TARGET_BASELINE_SHA"[\s\S]*materialize-translation-baseline\.js[\s\S]*--baseline "\$target_baseline_dir"[\s\S]*--target "\$TRANSLATION_TARGET"[\s\S]*--group "\$GROUP"[\s\S]*manifest\.js/, 'must materialize target baseline translation state before deterministic batching'],
        [/sourceChanges\.js --repository "\$GITHUB_WORKSPACE" --source-baseline-sha "\$SOURCE_BASELINE_SHA" --source-checkpoint-sha "\$SOURCE_CHECKPOINT_SHA" --target "\$TRANSLATION_TARGET" --group "\$GROUP" --output tmp\/source-changes\.json/, 'must derive durable batches from the group-scoped dev source checkpoint diff'],
        [/manifest\.js[\s\S]*--source-changes tmp\/source-changes\.json/, 'must build the durable pending set from current source changes'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/git diff[^\n]*(?:TOOLING_SHA|MASTER_SHA|tooling_sha)/.test(source)) {
        errors.push(`${file}: tooling identity must never be a source-delta endpoint`)
      }
    }

    if (file === '_translate-content-group.yml') {
      validateTranslationReadyProducer({workflow, source, file, errors})
      const requiredPatterns = [
        [/SOURCE_BASELINE_SHA: \$\{\{ inputs\.source_baseline_sha \}\}[\s\S]*SOURCE_CHECKPOINT_SHA: \$\{\{ inputs\.source_checkpoint_sha \}\}[\s\S]*TARGET_BASELINE_SHA: \$\{\{ inputs\.target_baseline_sha \|\| inputs\.source_checkpoint_sha \}\}[\s\S]*TOOLING_SHA: \$\{\{ inputs\.tooling_sha \}\}/, 'must bind separate source baseline, source checkpoint, target baseline, and tooling identities'],
        [/materialize-translation-baseline\.js[\s\S]*--baseline "\$BASELINE_DIR"[\s\S]*--target "\$TRANSLATION_TARGET"[\s\S]*--group "\$GROUP"/, 'must materialize selected target translation state before bootstrap resolution'],
        [/sourceChanges\.js --repository "\$GITHUB_WORKSPACE" --source-baseline-sha "\$SOURCE_BASELINE_SHA" --source-checkpoint-sha "\$SOURCE_CHECKPOINT_SHA" --target "\$TRANSLATION_TARGET" --group "\$GROUP" --output tmp\/source-changes\.json/, 'must derive translation candidates from the group-scoped dev source checkpoint diff'],
        [/prepare-reconciliation-plan\.js[\s\S]*--target "\$TRANSLATION_TARGET"[\s\S]*apply-reconciliation-plan\.js[\s\S]*--source-checkpoint-sha "\$SOURCE_CHECKPOINT_SHA"[\s\S]*--target-baseline-sha "\$TARGET_BASELINE_SHA"/, 'reconciliation application must receive the exact translation target and immutable identities'],
        [/manifest\.js[\s\S]*--source-changes tmp\/source-changes\.json/, 'must prioritize current source changes and preserve reconciliation metadata'],
        [/manifest\.js[\s\S]*--mode "\$EFFECTIVE_TRANSLATION_MODE"/, 'must build candidates with the resolved bootstrap mode'],
        [/bootstrap-state\.js resolve[\s\S]*--summary-file tmp\/bootstrap-decision\.json[\s\S]*Requested mode:[\s\S]*Effective mode:[\s\S]*Decision:/, 'must fail closed and summarize bootstrap repair before paid translation'],
        [/steps\.reconciliation\.outputs\.has_mutation == 'true'/, 'must create checkpoints for deletion-only translation mutations'],
        [/\(steps\.agents\.outputs\.failed_count \|\| '0'\) != '0'/, 'must create checkpoints for batches that only record failed translations'],
        [/translation-checkpoint-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'checkpoint artifacts must include target and group'],
        [/translation-baseline-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'baseline artifacts must include target and group'],
        [/translation-report-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'report artifacts must include target and group'],
        [/translation-recovery-\$\{\{ inputs\.target \}\}-\$\{\{ inputs\.group \}\}/, 'recovery artifacts must include target and group'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/git diff[^\n]*(?:TOOLING_SHA|MASTER_SHA|tooling_sha)/.test(source)) {
        errors.push(`${file}: tooling identity must never be a source-delta endpoint`)
      }

      const steps = workflow.jobs?.translate?.steps || []
      const paidWorkOrder = [
        'Validate immutable inputs',
        'Materialize source checkpoint and baseline',
        'Materialize target baseline translation state',
        'Prepare and apply translation reconciliation',
        'Resolve effective translation mode',
        'Build group translation manifest',
        'Resolve current recovery compatibility',
        'Run translation agents',
      ].map(name => steps.findIndex(step => step.name === name))
      if (paidWorkOrder.some(index => index < 0) || paidWorkOrder.some((index, position) => position > 0 && index <= paidWorkOrder[position - 1])) {
        errors.push(`${file}: paid translation must follow immutable identity, source delta, mode, and manifest validation`)
      }
      const recoveryPreflight = steps.find(step => step.name === 'Resolve current recovery compatibility')
      const recoveryCondition = String(recoveryPreflight?.if || '')
      const recoveryRun = String(recoveryPreflight?.run || '')
      if (!/inputs\.recovery_run_id != ''/.test(recoveryCondition) || !/inputs\.recovery_bundle_artifact_name != ''/.test(recoveryCondition) ||
          !/recovery-preflight\.js/.test(recoveryRun) || !/--allow-full-retranslate "\$\{\{ inputs\.allow_full_retranslate \}\}"/.test(recoveryRun)) {
        errors.push(`${file}: every requested recovery path must pass the full-retranslation admission gate before agents`)
      }
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
        ZDOC_PROVENANCE_CANDIDATE_SOURCE_SHA: '${{ inputs.source_checkpoint_sha }}',
      }
      validateTargetBranches(steps.map(step => String(step?.run || '')).join('\n'), file, errors)
      const normalizeCondition = value => String(value || '').trim().replace(/\s+/g, ' ')
      const expectedNumberedCondition = "${{ inputs.should_translate && inputs.group == 'guides' && inputs.batch_number > 0 && ((steps.agents.outputs.translated_count || '0') != '0' || (steps.agents.outputs.failed_count || '0') != '0' || steps.reconciliation.outputs.has_mutation == 'true') }}"
      const expectedUnbatchedCondition = "${{ inputs.should_translate && inputs.batch_number == 0 && ((steps.agents.outputs.translated_count || '0') != '0' || (steps.agents.outputs.failed_count || '0') != '0' || steps.reconciliation.outputs.has_mutation == 'true' || steps.mode.outputs.bootstrap_status == 'safe_repair') }}"

      if (!numbered || normalizeCondition(numberedCondition) !== normalizeCondition(expectedNumberedCondition)) {
        errors.push(`${file}: numbered Guides batches must use the dedicated mutation-aware local validation step`)
      }
      if (/mdx-parse|validate-mdx/.test(numberedRun)) errors.push(`${file}: numbered Guides batches must not run full-tree MDX parsing`)
      if (/validate-translated-coverage/.test(numberedRun)) errors.push(`${file}: numbered Guides batches must not run full-tree translated coverage`)
      if (/pnpm\s+run\s+build/.test(numberedRun)) errors.push(`${file}: numbered Guides batches must not run a full documentation build`)
      if (!/translation-batch-input\.js validate --input tmp\/translation-batch-input\.json/.test(numberedRun)) {
        errors.push(`${file}: numbered Guides batches must validate the canonical batch input`)
      }
      if (!/validate-translation-batch-outputs\.js[\s\S]*--manifest tmp\/translation-manifest\.json[\s\S]*--report tmp\/translation-report\.json[\s\S]*--batch-input tmp\/translation-batch-input\.json[\s\S]*--workspace "\$GITHUB_WORKSPACE"[\s\S]*--baseline "\$BASELINE_DIR"[\s\S]*--reconciliation-plan tmp\/reconciliation-plan\.json[\s\S]*--agents-outcome "\$AGENTS_OUTCOME"[\s\S]*--translated-count "\$TRANSLATED_COUNT"[\s\S]*--failed-count "\$FAILED_COUNT"[\s\S]*--remaining-count "\$REMAINING_COUNT"/.test(numberedRun)) {
        errors.push(`${file}: numbered Guides batches must validate agent report evidence and exact candidate output files`)
      }

      if (!unbatched || normalizeCondition(unbatchedCondition) !== normalizeCondition(expectedUnbatchedCondition)) {
        errors.push(`${file}: full translated validation must be restricted to unbatched runs`)
      }
      const bootstrapMarker = steps.find(step => step.name === 'Mark completed translation bootstrap')
      const expectedBootstrapMarkerCondition = "${{ inputs.should_translate && inputs.batch_number == 0 && (steps.mode.outputs.effective_mode == 'full' || steps.mode.outputs.bootstrap_status == 'safe_repair') && (steps.agents.outputs.remaining_count || '0') == '0' && steps.unbatched_validation.outcome == 'success' && inputs.target != 'ja-JP' }}"
      if (unbatched?.id !== 'unbatched_validation' || normalizeCondition(bootstrapMarker?.if) !== normalizeCondition(expectedBootstrapMarkerCondition)) {
        errors.push(`${file}: bootstrap markers must require batch zero, full or safe repair mode, zero remaining work, successful validation, and non-Japanese target`)
      }
      const candidateNames = Object.keys(candidateIdentity)
      const candidateIdentityIsExact = candidateNames.every(name => unbatched?.env?.[name] === candidateIdentity[name])
      const leaksCandidateIdentity = steps.some(step => step !== unbatched && candidateNames.some(name =>
        Object.hasOwn(step?.env || {}, name) || String(step?.run || '').includes(name)))
      if (!candidateIdentityIsExact || leaksCandidateIdentity) {
        errors.push(`${file}: candidate provenance must receive exact target, tooling, and source identities only in unbatched validation`)
      }
      if (!/validate-unbatched-translation-outputs\.js[\s\S]*--manifest tmp\/translation-manifest\.json[\s\S]*--report tmp\/translation-report\.json[\s\S]*--workspace "\$GITHUB_WORKSPACE"[\s\S]*--baseline "\$BASELINE_DIR"[\s\S]*--agents-outcome "\$AGENTS_OUTCOME"[\s\S]*--translated-count "\$TRANSLATED_COUNT"[\s\S]*--failed-count "\$FAILED_COUNT"[\s\S]*--remaining-count "\$REMAINING_COUNT"/.test(unbatchedRun)) {
        errors.push(`${file}: unbatched translations must authenticate terminal agent reports and target-owned outputs`)
      }
      if (!/validate-unbatched-translation-outputs\.js[\s\S]*if \[\[ "\$TRANSLATION_TARGET" == ja-JP && "\$FAILED_COUNT" != 0 \]\]; then[\s\S]*validate-group\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP" --allow-pending[\s\S]*else[\s\S]*validate-group\.js --target "\$TRANSLATION_TARGET" --group "\$GROUP"[\s\S]*fi/.test(unbatchedRun)) {
        errors.push(`${file}: only authenticated unbatched Japanese failures may bypass strict translation freshness`)
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
      const resolveArtifacts = byName.get('Resolve Guides translation artifact pairs')
      const resolveIndex = steps.indexOf(resolveArtifacts)
      const baselineDownloadIndex = steps.findIndex(step => step.name === 'Download Guides translation baselines')
      const identitiesIndex = steps.indexOf(byName.get(requiredNames[0]))
      const resolution = String(resolveArtifacts?.run || '')
      if (!(downloadIndex < resolveIndex && baselineDownloadIndex < resolveIndex && resolveIndex < identitiesIndex) ||
          !/translation-artifact-pairs\.js/.test(resolution) ||
          !/--target "\$TRANSLATION_TARGET"/.test(resolution) ||
          !/--group "\$GROUP"/.test(resolution) ||
          !/--run-id "\$GITHUB_RUN_ID"/.test(resolution) ||
          !/--output "\$ARTIFACT_PAIRS_MANIFEST"/.test(resolution)) {
        errors.push(`${file}: publisher must resolve locale-qualified artifact pairs before extraction`)
      }
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
      if (!/translation-batch-set\.js plan/.test(identities) || !/PAIRS_MANIFEST/.test(identities) || !/ARTIFACT_PAIRS_MANIFEST/.test(identities) || !/--expected-target-sha/.test(identities) || !/--source-checkpoint-sha/.test(identities) || !/preflight-checkpoint-archive\.js/.test(identities) || !/bindPublisherBatchIdentity/.test(identities) || /translation-(?:checkpoint|baseline)-\$GROUP-\$\{GITHUB_RUN_ID\}/.test(identities) || /git fetch/.test(identities)) errors.push(`${file}: publisher must preflight and extract every resolved locale-qualified pair before staging`)
      if (!/translation-staging-publisher/.test(apply) || !/applyPhase/.test(apply) || !/prepareStagingWorktree/.test(publisherHelper) || !/applyTranslationBatch/.test(publisherHelper) || !/commitAppliedBatch/.test(publisherHelper)) errors.push(`${file}: publisher must use one detached worktree and apply and commit batches in order`)
      if (!/translation-staging-publisher/.test(push) || !/pushPhase/.test(push) || !/deterministicStagingRef/.test(publisherHelper) || !/pushStagingRef/.test(publisherHelper) || !/probeRemoteStaging/.test(publisherHelper)) errors.push(`${file}: publisher must push and reconcile the exact deterministic Guides staging ref`)
      if (!/restore-generated-state\.sh --exact --ref "\$staged_sha"/.test(validation) || !/validate-guides-translation-staging\.js/.test(validation) || !/--expected-target-sha "\$EXPECTED_TARGET_SHA"/.test(validation) || !/--trusted-root/.test(validation) || !/recordValidationInfrastructureFailure/.test(validation)) errors.push(`${file}: publisher must restore and validate the exact combined staged SHA through the fixed wrapper with retained failure evidence`)
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
      const pnpmSetupIndex = steps.findIndex(step => step?.uses === 'pnpm/action-setup@v5')
      const nodeSetupIndex = steps.findIndex(step => step?.uses === 'actions/setup-node@v5')
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
      const expectedBuildMapping = "${{ inputs.site == 'en' && 'pnpm run build:en' || inputs.site == 'zh-CN' && 'pnpm run build:zh-CN:site' || '' }}"
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
      if (save?.if !== "${{ inputs.cache_save_required == 'true' && steps.guides_v5_generation.outcome == 'success' }}" || save?.['continue-on-error'] !== true || save?.uses !== 'actions/cache/save@v5' || save?.with?.path !== 'tmp/guides-source-cache-v5' || save?.with?.key !== '${{ steps.guides_v5_generation.outputs.key }}') {
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
        'TRANSLATION_AGENT_API_KEY', 'REVIEW_AGENT_API_KEY',
      ]
      for (const value of forbidden) if (source.includes(value)) errors.push(`${file}: source workflow must not embed translation implementation: ${value}`)
      const dispatches = source.match(/gh workflow run translate-codex\.yml/g) || []
      if (dispatches.length !== 1) errors.push(`${file}: source workflow must dispatch translate-codex.yml exactly once`)
      const handoff = workflow.jobs?.prepare_translation_handoff
      const handoffNeeds = Array.isArray(handoff?.needs) ? handoff.needs : []
      const handoffStep = (handoff?.steps || []).find(step => step?.name === 'Validate exact downstream translation handoff')
      if (handoffNeeds.join(',') !== 'prepare,source_publication_barrier,publish_ready,reconcile_reference_state' ||
          handoffStep?.env?.TARGET_BASELINE_SHA !== '${{ needs.reconcile_reference_state.outputs.final_target_sha }}' ||
          !/--target-baseline-sha "\$TARGET_BASELINE_SHA"/.test(handoffStep?.run || '')) {
        errors.push(`${file}: translation handoff must directly depend on reconciliation and consume its exact final target SHA`)
      }
      if (!/translation-handoff\.js[\s\S]*--locale all[\s\S]*--fetch-selection[\s\S]*--fetch-results/.test(source) ||
          !/name: Upload validated schema-v3 translation handoff[\s\S]*name: translation-handoff-v3-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/.test(source) ||
          !/handoff_json=\$HANDOFF_JSON|handoff_json=%s/.test(source) ||
          !/WORKFLOW_REF: \$\{\{ github\.ref_name \}\}/.test(source)) {
        errors.push(`${file}: translation handoff must consume publication results, preserve schema v3 evidence, and use the trusted workflow ref`)
      }
      const dispatch = workflow.jobs?.dispatch_translations
      const dispatchNeeds = Array.isArray(dispatch?.needs) ? dispatch.needs : []
      const dispatchStep = (dispatch?.steps || []).find(step => step?.name === 'Dispatch the single translation workflow')
      const dispatchRun = dispatchStep?.run || ''
      if (dispatchNeeds.join(',') !== 'prepare,prepare_translation_handoff' ||
          dispatch?.permissions?.actions !== 'write' || dispatch?.permissions?.contents !== 'read' ||
          !String(dispatch?.if || '').includes("needs.prepare_translation_handoff.result == 'success'") ||
          !/request_id="\$REQUEST_ID"[\s\S]*displayTitle[\s\S]*expected_title[\s\S]*run_url/.test(source) ||
          !/run_url[\s\S]*https:\/\/github\\\.com\/[\s\S]*actions\/runs\//.test(source) || !source.includes('[1-9][0-9]*')) {
        errors.push(`${file}: downstream dispatch must wait for a validated handoff and authenticate its run URL`)
      }
      if (!/--json displayTitle,url,headBranch/.test(dispatchRun) ||
          !/--arg title "\$expected_title" --arg ref "\$WORKFLOW_REF"/.test(dispatchRun) ||
          !/\.displayTitle == \$title and \.headBranch == \$ref/.test(dispatchRun) ||
          !/\$\{#run_urls\[@\]\} > 1[\s\S]*exit 1[\s\S]*\$\{#run_urls\[@\]\} == 1/.test(dispatchRun) ||
          /\.headSha == \$sha|TOOLING_SHA/.test(dispatchRun)) {
        errors.push(`${file}: downstream dispatch must identify one child by exact request title and workflow branch`)
      }
      const aggregate = (workflow.jobs?.aggregate?.steps || []).find(step => step?.id === 'aggregate')
      const temporaryCanaryMarkers = [
        'canary_suppress_translation_dispatch',
        'fetch-publication-fifo-p0-canary-dev',
        'publish_ready_shadow',
      ]
      if (temporaryCanaryMarkers.some(marker => source.includes(marker)) ||
          /production\s+shadow/iu.test(source) ||
          aggregate?.env?.TRANSLATION_HANDOFF_REQUESTED !== '${{ needs.prepare.outputs.run_translations }}') {
        errors.push(`${file}: PR-ready source workflow must not contain temporary canary or shadow configuration`)
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
      const pnpmSetupIndex = steps.findIndex(step => step?.uses === 'pnpm/action-setup@v5')
      const nodeSetupIndex = steps.findIndex(step => step?.uses === 'actions/setup-node@v5')
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
        [/actions\/download-artifact@v7/, 'must download the exact checkpoint artifact'],
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
        [/name: Check out immutable master tooling[\s\S]*actions\/checkout@v5[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}[\s\S]*fetch-depth: 0/, 'must check out immutable master tooling'],
        [/git fetch --no-tags origin "\$FINAL_DEV_SHA"[\s\S]*restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/, 'must materialize the exact final dev SHA'],
        [/git merge-base --is-ancestor "\$PUBLISHED_FINAL_SHA" "\$FINAL_DEV_SHA"/, 'must prove the reconciled final SHA descends from the published source SHA'],
        [/restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/, 'must restore generated content from the exact final dev SHA'],
        [/actions\/upload-artifact@v6[\s\S]*if-no-files-found: ignore/, 'must always preserve verification reports'],
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
      if (!(materializeIndex >= 0 && materializeIndex < revisionIndex)) {
        errors.push(`${file}: final verification must materialize the exact state before revision reconciliation`)
      }
      const reference = namedJobStep(workflow, 'verify', 'Verify final Reference derived state')
      const referenceRun = String(reference?.run || '')
      const referenceCommands = executableCommandLines(referenceRun)
      if (reference?.id !== 'reference' || reference?.['continue-on-error'] !== true ||
          !commandsAppearInOrder(referenceCommands, [
            'set -euo pipefail',
            'pnpm docs-tooling validate-reference --site en',
            'pnpm docs-tooling validate-reference --site zh-CN',
          ]) || !/reference-en\.log/.test(referenceRun) || !/reference-zh-CN\.log/.test(referenceRun)) {
        errors.push(`${file}: final verification must validate both English and Chinese Reference derived state`)
      }
      const uploadReports = namedJobStep(workflow, 'verify', 'Upload final verification reports')
      if (String(uploadReports?.if || '').trim() !== '${{ always() }}') {
        errors.push(`${file}: final verification report upload must always run`)
      }
      const resultCommands = executableCommandLines(namedJobStep(workflow, 'verify', 'Emit verification result')?.run)
      const expectedResult = [
        'if [[ "${{ steps.revision.outcome }}" == success && "${{ steps.reference.outcome }}" == success ]]; then',
        'echo "status=passed" >> "$GITHUB_OUTPUT"',
        'else',
        'echo "status=failed" >> "$GITHUB_OUTPUT"',
        'fi',
      ]
      if (JSON.stringify(resultCommands) !== JSON.stringify(expectedResult)) {
        errors.push(`${file}: overall status must require revision and Reference verification success`)
      }
      if (/actions\/checkout@v5[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}/.test(source)) errors.push(`${file}: final verification tooling must not come from the dev content commit`)
      if (/contents: write|git push/.test(source)) errors.push(`${file}: final verification must remain read-only and must not publish`)
    }

    if (file === 'translate-codex.yml') {
      const dispatchInputs = workflow.on?.workflow_dispatch?.inputs || {}
      const callInputs = workflow.on?.workflow_call?.inputs || {}
      const prepare = workflow.jobs?.prepare
      const prepareSteps = prepare?.steps || []
      const cardTarget = workflow.jobs?.initialize_translation_card?.steps?.find(step => step?.id === 'target')
      const recoveryDownload = prepareSteps.find(step => step?.name === 'Download authenticated recovery plan')
      const handoffStep = prepareSteps.find(step => step?.name === 'Resolve and validate the complete translation handoff')
      const selectionStep = prepareSteps.find(step => step?.id === 'publication_selection')
      const monitor = workflow.jobs?.monitor_translation_progress
      const guidesProducer = workflow.jobs?.translate_guides_batches
      const sdkProducer = workflow.jobs?.translate_sdk
      const stringDefault = input => `\${{ inputs.${input} || '' }}`
      const booleanDefault = input => `\${{ inputs.${input} || false }}`
      const internalDispatchDefaults = {
        recovery_bundle_artifact_name: {
          type: 'string', default: '', bindings: [
            [recoveryDownload?.if, "${{ (inputs.recovery_bundle_artifact_name || '') != '' }}"],
            [recoveryDownload?.with?.name, stringDefault('recovery_bundle_artifact_name')],
            [cardTarget?.env?.RECOVERY_BUNDLE_ARTIFACT_NAME, stringDefault('recovery_bundle_artifact_name')],
            [handoffStep?.env?.RECOVERY_BUNDLE_ARTIFACT_NAME, stringDefault('recovery_bundle_artifact_name')],
            [selectionStep?.env?.RECOVERY_BUNDLE_ARTIFACT_NAME, stringDefault('recovery_bundle_artifact_name')],
            [monitor?.with?.operator_recovery, "${{ (inputs.recovery_bundle_artifact_name || '') != '' }}"],
            [guidesProducer?.with?.recovery_bundle_artifact_name, stringDefault('recovery_bundle_artifact_name')],
            [sdkProducer?.with?.recovery_bundle_artifact_name, stringDefault('recovery_bundle_artifact_name')],
          ],
        },
        recovery_plan_sha256: {
          type: 'string', default: '', bindings: [
            [handoffStep?.env?.RECOVERY_PLAN_SHA256, stringDefault('recovery_plan_sha256')],
            [selectionStep?.env?.RECOVERY_PLAN_SHA256, stringDefault('recovery_plan_sha256')],
            [guidesProducer?.with?.recovery_plan_sha256, stringDefault('recovery_plan_sha256')],
            [sdkProducer?.with?.recovery_plan_sha256, stringDefault('recovery_plan_sha256')],
          ],
        },
        recovery_provenance_json: {
          type: 'string', default: '', bindings: [
            [handoffStep?.env?.RECOVERY_PROVENANCE_JSON, stringDefault('recovery_provenance_json')],
            [selectionStep?.env?.RECOVERY_PROVENANCE_JSON, stringDefault('recovery_provenance_json')],
          ],
        },
        production_queue_owned: {
          type: 'boolean', default: false, bindings: [
            [workflow.concurrency?.group, "${{ inputs.publish && !(inputs.production_queue_owned || false) && 'docs-production-dev' || format('translation-readonly-{0}', github.run_id) }}"],
          ],
        },
        allow_full_retranslate: {
          type: 'boolean', default: false, bindings: [
            [guidesProducer?.with?.allow_full_retranslate, booleanDefault('allow_full_retranslate')],
            [sdkProducer?.with?.allow_full_retranslate, booleanDefault('allow_full_retranslate')],
          ],
        },
      }
      const countInputReferences = (value, input) => {
        if (typeof value === 'string') {
          const propertyReference = new RegExp(`\\binputs\\b(?:\\s*\\.\\s*${input}\\b|\\s*\\[\\s*(['"])${input}\\1\\s*\\])`, 'gi')
          return (value.match(propertyReference) || []).length
        }
        if (Array.isArray(value)) return value.reduce((total, entry) => total + countInputReferences(entry, input), 0)
        if (value && typeof value === 'object') {
          return Object.entries(value).reduce((total, [key, entry]) =>
            total + countInputReferences(key, input) + countInputReferences(entry, input), 0)
        }
        return 0
      }
      for (const [input, expected] of Object.entries(internalDispatchDefaults)) {
        const declaration = callInputs[input]
        const bindingsAreExact = expected.bindings.every(([actual, required]) => actual === required)
        const referenceCount = countInputReferences(workflow, input)
        if (dispatchInputs[input] !== undefined || declaration?.type !== expected.type || declaration?.default !== expected.default ||
            !bindingsAreExact || referenceCount !== expected.bindings.length) {
          errors.push(`${file}: workflow_call-only input ${input} must use its explicit direct-dispatch default`)
        }
      }

      const requiredPatterns = [
        [/strategy:[\s\S]*matrix: \$\{\{ fromJSON\(needs\.prepare\.outputs\.sdk_producer_matrix\) \}\}[\s\S]*uses: \.\/\.github\/workflows\/_translate-content-group\.yml/, 'must run selected SDK translation producers through one matrix'],
        [/TRANSLATION_AGENT_API_KEY: \$\{\{ secrets\.TRANSLATION_AGENT_API_KEY \}\}[\s\S]*REVIEW_AGENT_API_KEY: \$\{\{ secrets\.REVIEW_AGENT_API_KEY \}\}/, 'must map only the translation agent secrets'],
        [/translation-handoff\.js --handoff-json "\$HANDOFF_JSON" "\$\{handoff_recovery_args\[@\]\}" --repository "\$GITHUB_WORKSPACE"/, 'must validate the exact translation handoff before paid work'],
        [/target_branch_sha[\s\S]*EXPECTED_TARGET_SHA[\s\S]*Target branch moved after handoff/, 'must fail closed when the target baseline moves'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)

      const selectionUpload = prepareSteps.find(step => step?.name === 'Upload immutable Translation publication selection')
      if (prepare?.outputs?.publication_selection_artifact_name !== '${{ steps.publication_selection.outputs.artifact_name }}' ||
          prepare?.outputs?.publication_selection_sha256 !== '${{ steps.publication_selection.outputs.selection_sha256 }}' ||
          !/translation-publication-selection\.js selection/.test(String(selectionStep?.run || '')) ||
          !/--publish "\$PUBLISH_ENABLED"/.test(String(selectionStep?.run || '')) ||
          selectionStep?.env?.PUBLISH_ENABLED !== '${{ inputs.publish }}' ||
          selectionUpload?.uses !== 'actions/upload-artifact@v6' ||
          selectionUpload?.with?.name !== 'publication-selection-translation-${{ github.run_id }}-${{ github.run_attempt }}') {
        errors.push(`${file}: prepare must create one mode-bound immutable Translation publication selection`)
      }

      const legacyJobs = [
        'observe_publication_ready',
        'publish_ja_guides', 'publish_ja_python', 'publish_zh_python', 'publish_ja_java', 'publish_zh_java',
        'publish_ja_node', 'publish_zh_node', 'publish_ja_go', 'publish_zh_go', 'publish_ja_cli', 'publish_zh_cli',
        'publish_ja_rest', 'publish_zh_rest', 'publish_zh_reference_landings',
        'reconcile_localization_inventory', 'reconcile_reference_state', 'reconcile_published_state',
      ]
      for (const jobName of legacyJobs) if (workflow.jobs?.[jobName]) {
        errors.push(`${file}: legacy Translation writer must be absent: ${jobName}`)
      }

      const writer = workflow.jobs?.publish_ready
      const writerSteps = writer?.steps || []
      const writerCheckout = writerSteps.find(step => step?.uses === 'actions/checkout@v5')
      const writerSelection = writerSteps.find(step => step?.name === 'Download immutable Translation publication selection')
      const writerValidation = writerSteps.find(step => step?.name === 'Validate immutable Translation publication selection')
      const writerPublish = writerSteps.find(step => step?.id === 'publish')
      const writerScript = String(writerPublish?.with?.script || '')
      const writerSource = JSON.stringify(writer || {})
      const expectedWriterScript = [
        "const mode = process.env.PUBLISH === 'true' ? 'publish' : 'artifact_only'",
        "await exec.exec('node', [",
        "  'scripts/docs-workflow/publication-coordinator.js',",
        "  '--selection', `${process.env.RUNNER_TEMP}/publication-selection/publication-selection.json`,",
        "  '--mode', mode,",
        "  '--poll-milliseconds', '10000',",
        "  '--candidate-polls', '6',",
        "  '--max-publish-attempts', '10',",
        '])',
      ].join('\n')
      if (writer?.name !== 'publish_ready' || JSON.stringify(writer?.needs) !== JSON.stringify(['prepare']) ||
          writer?.if !== "${{ needs.prepare.result == 'success' }}" ||
          writer?.permissions?.actions !== 'read' || writer?.permissions?.contents !== 'write' ||
          writer?.['continue-on-error'] !== undefined ||
          writerCheckout?.with?.ref !== '${{ needs.prepare.outputs.tooling_sha }}' ||
          writerCheckout?.with?.['fetch-depth'] !== 0 ||
          writerCheckout?.with?.['persist-credentials'] !== '${{ inputs.publish }}' ||
          writerSelection?.uses !== 'actions/download-artifact@v7' ||
          writerSelection?.with?.name !== '${{ needs.prepare.outputs.publication_selection_artifact_name }}' ||
          !/publication selection checksum mismatch/.test(String(writerValidation?.run || '')) ||
          !/publication selection run attempt mismatch/.test(String(writerValidation?.run || '')) ||
          writerPublish?.uses !== 'actions/github-script@v8' || writerPublish?.run !== undefined ||
          writerPublish?.env?.GITHUB_TOKEN !== '${{ github.token }}' ||
          writerPublish?.env?.PUBLISH !== '${{ inputs.publish }}' ||
          writerScript.trim() !== expectedWriterScript ||
          /APP_ID|APP_SECRET|FEISHU/.test(writerSource)) {
        errors.push(`${file}: publish_ready must be the single mode-aware Translation Git writer from prepare`)
      }

      for (const jobName of ['translate_sdk', 'translate_guides_batches']) {
        const job = workflow.jobs?.[jobName]
        if (job?.with?.publication_selection_artifact_name !== '${{ needs.prepare.outputs.publication_selection_artifact_name }}' ||
            job?.with?.publication_selection_sha256 !== '${{ needs.prepare.outputs.publication_selection_sha256 }}' ||
            job?.with?.legacy_without_publication_selection !== undefined) {
          errors.push(`${file}: ${jobName} must receive the immutable Translation publication selection identity`)
        }
      }
      if (workflow.jobs?.translate_sdk?.with?.publication_unit_key !== '${{ matrix.publicationUnitKey }}') {
        errors.push(`${file}: SDK Translation matrix units must receive their exact publication unit key`)
      }
      if (workflow.jobs?.translate_sdk?.name !== 'translate:${{ matrix.target }}/${{ matrix.group }}') {
        errors.push(`${file}: SDK Translation matrix caller job must use its selected producer identity`)
      }
      if (workflow.jobs?.translate_guides_batches?.if !== "${{ needs.prepare_guides_batches.outputs.batch_count != '0' }}") {
        errors.push(`${file}: Guides translation batch matrix must run whenever its batch count is nonzero`)
      }
      if (['prepare_guides_batches', 'translate_guides_batches', 'translate_sdk'].some(jobName =>
        workflow.jobs?.[jobName]?.with?.target_baseline_sha !== '${{ needs.prepare.outputs.target_branch_sha }}')) {
        errors.push(`${file}: Translation producers must receive the same queue-owned target baseline`)
      }

      const guidesReady = workflow.jobs?.prepare_guides_publication_ready
      const guidesReadySource = JSON.stringify(guidesReady || {})
      if (JSON.stringify(guidesReady?.needs) !== JSON.stringify(['prepare', 'prepare_guides_batches', 'translate_guides_batches']) ||
          guidesReady?.permissions?.contents !== 'read' || guidesReady?.permissions?.actions !== 'read' ||
          !/translation-artifact-pairs\.js/.test(guidesReadySource) || !/translation-batch-set\.js plan/.test(guidesReadySource) ||
          /git push|staging/.test(guidesReadySource)) {
        errors.push(`${file}: Guides ready fan-in must validate complete batches read-only before emitting its descriptor`)
      }
      const guidesReadyRun = String(guidesReady?.steps?.find(step => step?.name === 'Validate and package complete Guides translation batch set')?.run || '')
      const guidesReadyDescriptor = guidesReady?.steps?.find(step => step?.name === 'Upload immutable Translation ready descriptor')
      const guidesCheckpointUpload = guidesReady?.steps?.find(step => step?.name === 'Upload Guides translation checkpoint')
      const guidesBaselineUpload = guidesReady?.steps?.find(step => step?.name === 'Upload Guides translation baseline')
      const guidesReadyBindings = String(guidesReady?.if || '').includes("needs.translate_guides_batches.result == 'skipped'") &&
        !String(guidesReady?.if || '').includes("batch_count != '0'") &&
        ['if [[ "$BATCH_COUNT" == 0 ]]', 'batchCount: 0', 'runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT)',
          'pendingSetSha256: process.env.PENDING_SET_SHA256', 'checkpoint-manifest.json', 'baseline-manifest.json',
          'node scripts/docs-workflow/translation-artifact-pairs.js',
          '--checkpoints-root "$RUNNER_TEMP/translation-checkpoints"',
          '--baselines-root "$RUNNER_TEMP/translation-baselines"',
          '--target ja-JP --group guides --run-id "$GITHUB_RUN_ID" --batch-count "$BATCH_COUNT"',
          '--output "$RUNNER_TEMP/guides-artifact-pairs.json"',
          'checkpoint/checkpoint-group/manifest.json', 'baseline/checkpoint-group/manifest.json',
          'checkpoint/checkpoint-group.tar', 'baseline/checkpoint-group.tar',
          'tar -cf "$RUNNER_TEMP/guides-ready/checkpoint/checkpoint-group.tar" -C "$RUNNER_TEMP/guides-ready/checkpoint" checkpoint-group',
          'tar -cf "$RUNNER_TEMP/guides-ready/baseline/checkpoint-group.tar" -C "$RUNNER_TEMP/guides-ready/baseline" checkpoint-group']
          .every(fragment => guidesReadyRun.includes(fragment)) &&
        guidesCheckpointUpload?.with?.path === '${{ runner.temp }}/guides-ready/checkpoint/checkpoint-group.tar' &&
        guidesBaselineUpload?.with?.path === '${{ runner.temp }}/guides-ready/baseline/checkpoint-group.tar' &&
        guidesReadyDescriptor?.with?.name === 'publication-ready-translation-translation-ja-JP-guides-${{ github.run_id }}-${{ github.run_attempt }}'
      if (!guidesReadyBindings) {
        errors.push(`${file}: Guides ready fan-in must bind run attempt, batch count, pending checksum, and recoverable manifests`)
      }

      const aggregate = workflow.jobs?.aggregate
      const aggregateSource = JSON.stringify(aggregate || {})
      const aggregateSteps = aggregate?.steps || []
      const artifactNamesStep = aggregateSteps.find(step => step?.id === 'artifacts')
      const selectionDownload = aggregateSteps.find(step => step?.name === 'Download exact immutable Translation publication selection')
      const resultsDownload = aggregateSteps.find(step => step?.name === 'Download exact terminal Translation publication results')
      const documents = aggregateSteps.find(step => step?.id === 'documents')
      const verification = aggregateSteps.find(step => step?.name === 'Verify every successful publication result reaches the final target')
      if (JSON.stringify(aggregate?.needs) !== JSON.stringify(['prepare', 'publish_ready']) ||
          aggregate?.if !== "${{ always() && needs.prepare.result == 'success' }}" ||
          aggregate?.permissions?.actions !== 'read' || aggregate?.permissions?.contents !== 'read' ||
          !/artifactNames/.test(String(artifactNamesStep?.run || '')) ||
          selectionDownload?.with?.name !== '${{ steps.artifacts.outputs.selection }}' ||
          resultsDownload?.with?.name !== '${{ steps.artifacts.outputs.results }}' ||
          !/readPublicationDocument/.test(String(documents?.run || '')) ||
          !/validateTranslationPublicationDocuments/.test(String(documents?.run || '')) ||
          !/selection\.repository !== process\.env\.GITHUB_REPOSITORY/.test(String(documents?.run || '')) ||
          !/selection\.runAttempt !== Number\(process\.env\.GITHUB_RUN_ATTEMPT\)/.test(String(documents?.run || '')) ||
          !/selection\.selectionSha256 !== process\.env\.EXPECTED_SELECTION_SHA256/.test(String(documents?.run || '')) ||
          !/results\.overallStatus !== 'success'/.test(String(documents?.run || '')) ||
          verification?.env?.TARGET_BRANCH !== '${{ needs.prepare.outputs.target_branch }}' ||
          verification?.env?.PUBLISH_ENABLED !== '${{ inputs.publish }}' ||
          !/refs\/heads\/\$TARGET_BRANCH:refs\/remotes\/origin\/\$TARGET_BRANCH/.test(String(verification?.run || '')) ||
          !/target_sha.*FINAL_TARGET_SHA/.test(String(verification?.run || '')) ||
          !/verifyTranslationPublicationRepository\(\{selection, results, repository: process\.env\.GITHUB_WORKSPACE\}\)/.test(String(verification?.run || '')) ||
          /publish_ja_|publish_zh_|reconcile_/.test(aggregateSource)) {
        errors.push(`${file}: aggregate must consume and authenticate exact terminal Translation selection and results artifacts`)
      }

      if (/secrets: inherit/.test(source)) errors.push(`${file}: reusable translation must receive an explicit secret allowlist`)
      const inputs = workflow.on?.workflow_dispatch?.inputs || {}
      if (inputs.handoff_json?.required !== true || ['locale', 'group', 'tooling_sha', 'source_shas_json', 'target_branch'].some(input => inputs[input] !== undefined)) {
        errors.push(`${file}: must require one complete immutable handoff without duplicate identity inputs`)
      }
      const needsPrepare = job => {
        const needs = workflow.jobs?.[job]?.needs
        return (Array.isArray(needs) ? needs : [needs]).includes('prepare')
      }
      if (!needsPrepare('prepare_guides_batches') || !needsPrepare('translate_sdk') || !needsPrepare('translate_guides_batches')) {
        errors.push(`${file}: translation matrices must wait for complete handoff repository validation`)
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
  const callerSource = readWorkflow('fetch-docs.yml')
  if (callerSource) {
    let caller
    try { caller = yaml.load(callerSource) } catch (_) { caller = null }
    const monitor = caller?.jobs?.monitor_docs_progress
    const prepareSteps = caller?.jobs?.prepare?.steps || []
    const installIndex = prepareSteps.findIndex(step => step?.run === 'pnpm install --frozen-lockfile')
    const readinessIndex = prepareSteps.findIndex(step => step?.name === 'Verify translation publication readiness')
    const inventoryIndex = prepareSteps.findIndex(step => step?.name === 'Verify immutable target localization inventory')
    const cardIndex = prepareSteps.findIndex(step => step?.name === 'Create progress card')
    const cardStep = cardIndex >= 0 ? prepareSteps[cardIndex] : null
    const readinessCommand = readinessIndex >= 0 ? String(prepareSteps[readinessIndex]?.run || '') : ''
    if (installIndex < 0 || readinessIndex <= installIndex || cardIndex <= readinessIndex ||
        readinessCommand !== 'node --test scripts/build/write-provenance.test.mjs scripts/doc-publish-bot/manualConfig.test.js scripts/docs-workflow/content-groups.test.js scripts/docs-workflow/fetch-reference-reconciliation.test.js scripts/docs-workflow/guides-cache-generation-lifecycle.test.js scripts/docs-workflow/guides-render-readiness.test.js scripts/docs-workflow/prepare-content-group-workspace.test.js scripts/docs-workflow/source-publication-barrier.test.js scripts/docs-workflow/publish-checkpoint.test.js scripts/restore-generated-state.test.js scripts/validate-workflow-policy.test.js') {
      errors.push('fetch-docs.yml: prepare must prove translation publication readiness before paid work starts')
    }
    const inventoryStep = inventoryIndex >= 0 ? prepareSteps[inventoryIndex] : null
    const inventoryCommands = executableCommandLines(inventoryStep?.run)
    if (inventoryIndex <= readinessIndex || cardIndex <= inventoryIndex ||
        String(inventoryStep?.if || '').trim() !== "${{ steps.refs.outputs.publish == 'true' }}" ||
        inventoryStep?.env?.INITIAL_TARGET_SHA !== '${{ steps.refs.outputs.initial_target_sha }}' ||
        !commandsAppearInOrder(inventoryCommands, [
          'set -euo pipefail',
          'git fetch --no-tags origin "$INITIAL_TARGET_SHA"',
          'bash scripts/restore-generated-state.sh --exact --ref "$INITIAL_TARGET_SHA"',
          'pnpm check:localization-input-inventory',
        ]) || /generate:localization-input-inventory/.test(String(inventoryStep?.run || ''))) {
      errors.push('fetch-docs.yml: prepare must validate the immutable target localization inventory before paid work starts')
    }
    if (cardStep?.['continue-on-error'] !== true || cardStep?.env?.CARD_TITLE !== 'Zilliz Cloud Docs Build' ||
        !/card_parts=\("Produce"\)[\s\S]*"Publish" "Verify"[\s\S]*"Handoff"/.test(callerSource)) {
      errors.push('fetch-docs.yml: Build card must use the approved title, stages, and best-effort creation')
    }
    if (/Translate manuals|Publish translations|Dispatch downstream translation/.test(callerSource)) {
      errors.push('fetch-docs.yml: Build card must not include downstream translation phases')
    }
    const coordinator = caller?.jobs?.publish_ready
    const coordinatorNeeds = Array.isArray(coordinator?.needs) ? coordinator.needs : []
    const coordinatorSteps = coordinator?.steps || []
    const coordinatorPublish = coordinatorSteps.find(step => step?.id === 'publish')
    const coordinatorScript = String(coordinatorPublish?.with?.script || '')
    if (coordinatorNeeds.join(',') !== 'prepare,reconciliation_preflight' || coordinator?.permissions?.contents !== 'write' || coordinator?.permissions?.actions !== 'read' ||
        coordinatorPublish?.uses !== 'actions/github-script@v8' || coordinatorPublish?.run !== undefined ||
        !/process\.env\.PUBLISH === 'true' \? 'publish' : 'artifact_only'[\s\S]*exec\.exec\('node', \[[\s\S]*publication-coordinator\.js[\s\S]*'--selection'[\s\S]*'--mode', mode/.test(coordinatorScript)) {
      errors.push('fetch-docs.yml: publish_ready must be the single Git writer and poll ready units from prepare only')
    }
    for (const legacy of ['publish_java', 'publish_node', 'publish_go', 'publish_cli', 'publish_rest', 'publish_python', 'publish_guides', 'publish_zh_guides', 'resolve_final']) {
      if (caller?.jobs?.[legacy]) errors.push(`fetch-docs.yml: legacy fixed publication job must be absent: ${legacy}`)
    }
    const referenceReconcile = caller?.jobs?.reconcile_reference_state
    const referenceNeeds = Array.isArray(referenceReconcile?.needs) ? referenceReconcile.needs : []
    const referenceStep = (referenceReconcile?.steps || []).find(step => step?.name === 'Reconcile and publish Fetch Reference derived state')
    const referenceRun = String(referenceStep?.run || '')
    const requiredReferenceCommands = [
      'fetch-reference-reconciliation.js reconcile',
      '--selection "$RUNNER_TEMP/publication-selection/publication-selection.json"',
      '--results "$RUNNER_TEMP/publication-results/publication-results.json"',
      '--repository-root "$GITHUB_WORKSPACE"',
      '--runner-temp "$RUNNER_TEMP"',
      '--remote origin',
    ]
    if (referenceNeeds.join(',') !== 'prepare,publish_ready' ||
        referenceReconcile?.permissions?.actions !== 'read' || referenceReconcile?.permissions?.contents !== 'write' ||
        String(referenceReconcile?.if || '').includes('run_translations') ||
        !String(referenceReconcile?.if || '').includes('always()') ||
        !String(referenceReconcile?.if || '').includes("needs.publish_ready.outputs.results_artifact_name != ''") ||
        /overall_status|needs\.publish_ready\.result\s*==\s*['\"]success['\"]/.test(String(referenceReconcile?.if || '')) ||
        referenceReconcile?.outputs?.final_target_sha !== '${{ steps.reconcile.outputs.final_target_sha }}' ||
        requiredReferenceCommands.some(command => !referenceRun.includes(command)) ||
        /git\s+(?:-C\s+[^\s]+\s+)?push|reference-manifest|restore-generated-state|validate-reference|publicationPaths|mapfile -t paths/.test(referenceRun)) {
      errors.push('fetch-docs.yml: Fetch must independently reconcile Reference derived state after source publication')
    }
    const sourceBarrier = caller?.jobs?.source_publication_barrier
    const sourceBarrierNeeds = Array.isArray(sourceBarrier?.needs) ? sourceBarrier.needs : []
    const sourceBarrierSteps = sourceBarrier?.steps || []
    const sourceBarrierPnpmIndex = sourceBarrierSteps.findIndex(step => step?.uses === 'pnpm/action-setup@v5')
    const sourceBarrierNodeIndex = sourceBarrierSteps.findIndex(step => step?.uses === 'actions/setup-node@v5')
    const sourceBarrierInstallIndex = sourceBarrierSteps.findIndex(step => step?.run === 'pnpm install --frozen-lockfile')
    const sourceBarrierIndex = sourceBarrierSteps.findIndex(step => step?.name === 'Block paid translation until selected sources are published')
    const sourceBarrierRun = String(sourceBarrierSteps[sourceBarrierIndex]?.run || '')
    if (sourceBarrierNeeds.join(',') !== 'prepare,publish_ready,reconcile_reference_state' ||
        !String(sourceBarrier?.if || '').includes("needs.prepare.outputs.publish == 'true'") ||
        !String(sourceBarrier?.if || '').includes("needs.reconcile_reference_state.result == 'success'") ||
        !(sourceBarrierPnpmIndex >= 0 && sourceBarrierPnpmIndex < sourceBarrierNodeIndex && sourceBarrierNodeIndex < sourceBarrierInstallIndex && sourceBarrierInstallIndex < sourceBarrierIndex) ||
        !/source-publication-barrier\.js[\s\S]*--selection[\s\S]*--results/.test(sourceBarrierRun)) {
      errors.push('fetch-docs.yml: source publication barrier must install its runtime and consume canonical publication selection and results before paid translation')
    }
    const zhSource = caller?.jobs?.produce_zh_guides_sources
    const zhRender = caller?.jobs?.render_zh_guides_tables
    const zhAssemble = caller?.jobs?.produce_zh_guides
    if (zhSource?.with?.site !== 'zh-CN' || zhRender?.with?.site !== 'zh-CN' || zhAssemble?.with?.site !== 'zh-CN' ||
        JSON.stringify(zhRender?.needs) !== JSON.stringify(['prepare', 'produce_zh_guides_sources']) ||
        JSON.stringify(zhAssemble?.needs) !== JSON.stringify(['prepare', 'produce_zh_guides_sources', 'render_zh_guides_tables']) ||
        zhAssemble?.with?.publication_unit_key !== 'source/guides-zh-CN') {
      errors.push('fetch-docs.yml: Chinese Guides must use a complete site-qualified producer lane bound to source/guides-zh-CN')
    }
    const guidesAssemblyPermissions = ['produce_guides', 'produce_zh_guides']
      .map(jobName => caller?.jobs?.[jobName]?.permissions)
    if (guidesAssemblyPermissions.some(permissions => permissions?.actions !== 'write' || permissions?.contents !== 'read' || Object.keys(permissions || {}).length !== 2)) {
      errors.push('fetch-docs.yml: Guides assembly callers must grant actions: write and contents: read')
    }
    const handoffJob = caller?.jobs?.prepare_translation_handoff
    const dispatchJob = caller?.jobs?.dispatch_translations
    const handoffNeeds = Array.isArray(handoffJob?.needs) ? handoffJob.needs : []
    const dispatchNeeds = Array.isArray(dispatchJob?.needs) ? dispatchJob.needs : []
    const handoffSteps = handoffJob?.steps || []
    const handoffPnpmIndex = handoffSteps.findIndex(step => step?.uses === 'pnpm/action-setup@v5')
    const handoffNodeIndex = handoffSteps.findIndex(step => step?.uses === 'actions/setup-node@v5')
    const handoffInstallIndex = handoffSteps.findIndex(step => step?.run === 'pnpm install --frozen-lockfile')
    const handoffValidationIndex = handoffSteps.findIndex(step => step?.name === 'Validate exact downstream translation handoff')
    const handoffValidation = handoffSteps[handoffValidationIndex]
    const handoffPlanIndex = handoffSteps.findIndex(step => step?.name === 'Prepare authenticated reconciliation plans')
    const handoffPlanStep = handoffSteps[handoffPlanIndex]
    if (handoffNeeds.join(',') !== 'prepare,source_publication_barrier,publish_ready,reconcile_reference_state' ||
        handoffValidation?.env?.TARGET_BASELINE_SHA !== '${{ needs.reconcile_reference_state.outputs.final_target_sha }}' ||
        !/--target-baseline-sha "\$TARGET_BASELINE_SHA"/.test(handoffValidation?.run || '') ||
        !/fetch-reconciliation-plans\.js generate[\s\S]*--selection[\s\S]*--results[\s\S]*--repository "\$GITHUB_WORKSPACE"[\s\S]*--target-baseline-sha "\$TARGET_BASELINE_SHA"[\s\S]*--output "\$RUNNER_TEMP\/reconciliation-plans"/.test(handoffPlanStep?.run || '') ||
        !/--reconciliation-plans-dir "\$RUNNER_TEMP\/reconciliation-plans"/.test(handoffValidation?.run || '') ||
        !(handoffPnpmIndex >= 0 && handoffPnpmIndex < handoffNodeIndex && handoffNodeIndex < handoffInstallIndex && handoffInstallIndex < handoffValidationIndex) ||
        dispatchNeeds.join(',') !== 'prepare,prepare_translation_handoff' ||
        !String(dispatchJob?.if || '').includes("needs.prepare_translation_handoff.result == 'success'")) {
      errors.push('fetch-docs.yml: downstream translation handoff must install its runtime before validated schema-v3 dispatch')
    }
    const dispatchSteps = dispatchJob?.steps || []
    const handoffMetadata = dispatchSteps.find(step => step?.name === 'Create translation handoff monitor metadata')
    const handoffUpload = dispatchSteps.find(step => step?.name === 'Upload translation handoff monitor metadata')
    if (!/schemaVersion:1[\s\S]*parentRunId[\s\S]*childRunId[\s\S]*childRunUrl/.test(handoffMetadata?.run || '') ||
        handoffUpload?.['continue-on-error'] !== true ||
        handoffUpload?.with?.name !== 'docs-translation-handoff-${{ github.run_id }}' ||
        handoffUpload?.with?.path !== '${{ runner.temp }}/docs-translation-handoff/handoff-metadata.json') {
      errors.push('fetch-docs.yml: downstream dispatch must upload fixed-schema handoff monitor metadata')
    }
    const monitorNeeds = Array.isArray(monitor?.needs) ? monitor.needs : monitor?.needs ? [monitor.needs] : []
    if (monitorNeeds.length !== 1 || monitorNeeds[0] !== 'prepare') errors.push('fetch-docs.yml: central monitor must start after prepare only')
    if (monitor?.uses !== './.github/workflows/_monitor-docs-progress.yml') errors.push('fetch-docs.yml: central monitor must use _monitor-docs-progress.yml')
    if (monitor?.with?.run_translations !== "${{ needs.prepare.outputs.run_translations == 'true' }}" || !String(monitor?.if || '').includes("card_id != ''")) {
      errors.push('fetch-docs.yml: Build monitor must receive translation handoff intent and require a created card')
    }
    const aggregateNeeds = Array.isArray(caller?.jobs?.aggregate?.needs) ? caller.jobs.aggregate.needs : []
    if (aggregateNeeds.includes('monitor_docs_progress')) errors.push('fetch-docs.yml: aggregate must not depend on the central monitor')
    const aggregateStep = (caller?.jobs?.aggregate?.steps || []).find(step => step?.id === 'aggregate')
    const aggregateRun = String(aggregateStep?.run || '')
    if (!/build-aggregate-input\.js[\s\S]*--publication-selection[\s\S]*--publication-results/.test(aggregateRun)) {
      errors.push('fetch-docs.yml: aggregate must consume publication selection and results')
    }
    const fallback = caller?.jobs?.finalize_card_fallback
    const fallbackNeeds = Array.isArray(fallback?.needs) ? fallback.needs : []
    if (fallbackNeeds.join(',') !== 'prepare,aggregate,monitor_docs_progress') errors.push('fetch-docs.yml: fallback must depend on prepare, aggregate, and monitor')
    if (String(fallback?.if || '').trim() !== "${{ always() && needs.prepare.outputs.card_id != '' }}") errors.push('fetch-docs.yml: terminal card finalizer must always run after aggregate and monitor when a card exists')
    const aggregateSource = callerSource.slice(callerSource.indexOf('  aggregate:'), callerSource.indexOf('  finalize_card_fallback:'))
    if (!/name: docs-card-report-\$\{\{ github\.run_id \}\}/.test(aggregateSource) || !/name: Upload final card report artifact[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*continue-on-error: true/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: aggregate must always attempt the final card report artifact')
    }
    const downloadEnglishGuidesReports = aggregateSource.indexOf('name: Download current English Guides reports')
    const downloadChineseGuidesReports = aggregateSource.indexOf('name: Download current Chinese Guides reports')
    const collectReports = aggregateSource.indexOf('name: Collect card report summaries')
    if (downloadEnglishGuidesReports < 0 || downloadChineseGuidesReports < 0) errors.push('fetch-docs.yml: aggregate must download current Guides locale reports')
    if (!(downloadEnglishGuidesReports >= 0 && downloadChineseGuidesReports >= 0 && collectReports > downloadEnglishGuidesReports && collectReports > downloadChineseGuidesReports)) {
      errors.push('fetch-docs.yml: current Guides locale reports must be downloaded before card collection')
    }
    if (!/name: Download current English Guides reports[\s\S]*name: docs-checkpoint-guides-en-\$\{\{ github\.run_id \}\}-reports[\s\S]*path: tmp\/card-guides-reports\/en/.test(aggregateSource) ||
        !/name: Download current Chinese Guides reports[\s\S]*name: docs-checkpoint-guides-zh-CN-\$\{\{ github\.run_id \}\}-reports[\s\S]*path: tmp\/card-guides-reports\/zh-CN/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: Guides locale reports must restore into isolated collector directories')
    }
    if (!/CARD_GUIDES_REPORTS_ROOT: tmp\/card-guides-reports/.test(aggregateSource) ||
        !/CARD_EXPECT_EN_GUIDES_REPORTS:/.test(aggregateSource) ||
        !/CARD_EXPECT_ZH_GUIDES_REPORTS:/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: card collection must declare both expected Guides locale report sets')
    }
    const aggregateSteps = caller?.jobs?.aggregate?.steps || []
    const artifactLinkIndex = aggregateSteps.findIndex(step => step?.id === 'report_artifact_links')
    const reportsIndex = aggregateSteps.findIndex(step => step?.id === 'reports')
    const artifactLinkStep = artifactLinkIndex >= 0 ? aggregateSteps[artifactLinkIndex] : null
    const reportsStep = reportsIndex >= 0 ? aggregateSteps[reportsIndex] : null
    if (artifactLinkIndex < 0 || reportsIndex <= artifactLinkIndex || artifactLinkStep?.['continue-on-error'] !== true ||
        !/gh api --paginate[^\n]*\| jq -s '\[\.\[\]\.artifacts\[\]\]'[\s\S]*resolve-card-artifact-links\.js/.test(artifactLinkStep?.run || '') ||
        reportsStep?.env?.CARD_REPORT_ARTIFACT_URL_EN !== '${{ steps.report_artifact_links.outputs.en_url }}' ||
        reportsStep?.env?.CARD_REPORT_ARTIFACT_URL_ZH_CN !== '${{ steps.report_artifact_links.outputs.zh_cn_url }}' ||
        Object.hasOwn(reportsStep?.env || {}, 'CARD_REPORT_ARTIFACT_URL')) {
      errors.push('fetch-docs.yml: aggregate must resolve exact Guides report artifact links before collection')
    }
    if (/#artifacts|CARD_GUIDES_PUBLICATION|Guides translation publication/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: Build report collection must not use run-wide or inline translation reports')
    }
    if (!/produce_guides:[\s\S]*assembly_decision_sha256: \$\{\{ needs\.produce_guides_sources\.outputs\.assembly_decision_sha256 \}\}/.test(callerSource)) {
      errors.push('fetch-docs.yml: must pass the canonical Guides assembly decision hash into assembly')
    }
    const createReport = aggregateSource.indexOf('name: Create final card report artifact')
    const firstReportDownload = Math.min(...[downloadEnglishGuidesReports, downloadChineseGuidesReports].filter(index => index >= 0))
    const reportIngestion = aggregateSource.slice(Number.isFinite(firstReportDownload) ? firstReportDownload : 0, createReport >= 0 ? createReport : aggregateSource.length)
    if (/APP_ID|APP_SECRET|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY/.test(reportIngestion)) {
      errors.push('fetch-docs.yml: aggregate report ingestion must not receive Feishu credentials')
    }
    if (/name: Finish progress card|report-live-card\.sh/.test(callerSource)) errors.push('fetch-docs.yml: aggregate must not directly patch the card')
  }

  const distributedFiles = [
    '_fetch-content-group.yml', '_fetch-guides-sources.yml', '_assemble-guides.yml',
    '_translate-content-group.yml', '_verify-docs.yml',
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
        !/schemaVersion:2[\s\S]*locale:process\.env\.ZDOC_SITE[\s\S]*tableTotal:/.test(guidesSource) ||
        !/name: Upload Guides progress metadata[\s\S]*continue-on-error: true[\s\S]*name: docs-progress-metadata-\$\{\{ inputs\.site \}\}-\$\{\{ github\.run_id \}\}/.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: Guides progress metadata must be best-effort, locale-qualified, and run-scoped')
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

  for (const file of ['_assemble-guides.yml', '_translate-content-group.yml', '_verify-docs.yml']) {
    if (/APP_ID|APP_SECRET/.test(readWorkflow(file))) errors.push(`${file}: non-source job must not receive Feishu app credentials`)
  }

  const monitorSource = readWorkflow('_monitor-docs-progress.yml')
  if (monitorSource) {
    if (!/^permissions:\n  actions: read\n  contents: read$/m.test(monitorSource)) errors.push('_monitor-docs-progress.yml: monitor permissions must be actions: read and contents: read')
    if (/contents: write|actions: write|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/.test(monitorSource)) errors.push('_monitor-docs-progress.yml: monitor must not receive write or source-production credentials')
  } else if (callerSource) {
    errors.push('_monitor-docs-progress.yml: central monitor workflow is required')
  }

  const translationSource = readWorkflow('translate-codex.yml')
  const translationMonitorSource = readWorkflow('_monitor-translation-progress.yml')
  if (translationSource) {
    let translation = {}
    try { translation = yaml.load(translationSource) } catch {}
    const initialize = translation.jobs?.initialize_translation_card
    const translationMonitor = translation.jobs?.monitor_translation_progress
    const translationAggregateNeeds = Array.isArray(translation.jobs?.aggregate?.needs) ? translation.jobs.aggregate.needs : []
    const translationCard = (initialize?.steps || []).find(step => step?.id === 'card')
    if (!String(initialize?.if || '').includes("inputs.request_id != ''") ||
        translationCard?.['continue-on-error'] !== true ||
        !/Zilliz Cloud Docs Translation/.test(translationCard?.run || '') ||
        !/Prepare,Translate,Publish,Aggregate/.test(translationCard?.run || '')) {
      errors.push('translate-codex.yml: Translation card must use the approved title, stages, and best-effort creation')
    }
    if (translationMonitor?.uses !== './.github/workflows/_monitor-translation-progress.yml' ||
        JSON.stringify(translationMonitor?.needs) !== JSON.stringify(['initialize_translation_card', 'prepare']) ||
        translationMonitor?.if !== "${{ always() && needs.initialize_translation_card.outputs.card_id != '' }}" ||
        translationMonitor?.with?.publication_run_attempt !== '${{ fromJSON(github.run_attempt) }}' ||
        translationMonitor?.with?.publication_selection_sha256 !== '${{ needs.prepare.outputs.publication_selection_sha256 }}' ||
        translationAggregateNeeds.includes('monitor_translation_progress')) {
      errors.push('translate-codex.yml: Translation monitor must be independent from the child aggregate')
    }
  }
  if (translationMonitorSource) {
    let translationMonitorWorkflow = {}
    try { translationMonitorWorkflow = yaml.load(translationMonitorSource) } catch {}
    const translationMonitorInputs = translationMonitorWorkflow.on?.workflow_call?.inputs || {}
    const translationMonitorScript = fs.readFileSync(path.join(process.cwd(), 'scripts/docs-workflow/monitor-translation-progress.js'), 'utf8')
    if (!/^permissions:\n  actions: read\n  contents: read$/m.test(translationMonitorSource) ||
        translationMonitorInputs.publication_run_attempt?.required !== true ||
        translationMonitorInputs.publication_selection_sha256?.required !== false ||
        translationMonitorInputs.publication_selection_sha256?.default !== '' ||
        !/HANDOFF_JSON: \$\{\{ inputs\.handoff_json \}\}[\s\S]*REQUEST_ID: \$\{\{ inputs\.request_id \}\}[\s\S]*PUBLISH_ENABLED: \$\{\{ inputs\.publish_enabled \}\}[\s\S]*PUBLICATION_RUN_ATTEMPT: \$\{\{ inputs\.publication_run_attempt \}\}[\s\S]*PUBLICATION_SELECTION_SHA256: \$\{\{ inputs\.publication_selection_sha256 \}\}/.test(translationMonitorSource) ||
        !/artifactNames/.test(translationMonitorScript) ||
        !/candidate\.revision > minimumRevision[\s\S]*sort\(\(left, right\) => right\.revision - left\.revision/.test(translationMonitorScript) ||
        !/downloadPublicationResults[\s\S]*publication-results\.json/.test(translationMonitorScript) ||
        !/prepare\?\.status === 'completed' && prepare\.conclusion === 'success' && !publicationSelectionSha256/.test(translationMonitorScript) ||
        !/if \(publicationSelectionSha256\) await loadPublicationArtifacts\(\)/.test(translationMonitorScript) ||
        !/aggregate\?\.status === 'completed' && !publicationResults/.test(translationMonitorScript) ||
        /contents: write|actions: write|SPACE_ID|FIGMA_API_KEY|MODEL_API_KEY/.test(translationMonitorSource)) {
      errors.push('_monitor-translation-progress.yml: Translation monitor must be read-only and consume exact progress and terminal result artifacts')
    }
  } else if (translationSource) {
    errors.push('_monitor-translation-progress.yml: Translation monitor workflow is required')
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

  const externalLinkWatchdogSource = readWorkflow('external-link-watchdog.yml')
  if (externalLinkWatchdogSource) {
    const externalLinkWatchdog = yaml.load(externalLinkWatchdogSource)
    const retiredExternalScanner = ['check', '404'].join('-')
    const triggerNames = Object.keys(externalLinkWatchdog.on || {}).sort()
    if (triggerNames.length !== 2 || triggerNames[0] !== 'schedule' || triggerNames[1] !== 'workflow_dispatch' ||
        externalLinkWatchdog.on?.schedule?.length !== 1 || externalLinkWatchdog.on.schedule[0]?.cron !== '0 1 * * *') {
      errors.push('external-link-watchdog.yml: watchdog triggers must be the daily schedule and manual dispatch only')
    }
    if (externalLinkWatchdog.permissions?.actions !== 'read' || externalLinkWatchdog.permissions?.contents !== 'read' || Object.keys(externalLinkWatchdog.permissions || {}).length !== 2) {
      errors.push('external-link-watchdog.yml: watchdog permissions must be actions: read and contents: read only')
    }
    if (externalLinkWatchdog.concurrency?.group !== 'external-link-watchdog' || externalLinkWatchdog.concurrency?.['cancel-in-progress'] !== false) {
      errors.push('external-link-watchdog.yml: watchdog concurrency must serialize scans without cancellation')
    }
    if (!/pnpm docs-tooling check-links --site en --output tmp\/external-link-watchdog\/latest\.md/.test(externalLinkWatchdogSource) || externalLinkWatchdogSource.includes(`scripts/${retiredExternalScanner}.js`)) {
      errors.push('external-link-watchdog.yml: watchdog must use the canonical rendered-site checker and no retired scanner')
    }
    if (/uses:\s*actions\/cache@|\bbaseline\b|\backnowledg(?:e|ement)\b|\bsuppress(?:ion|ed)?\b/i.test(externalLinkWatchdogSource)) {
      errors.push('external-link-watchdog.yml: watchdog must not cache or suppress external-link observations')
    }
    const externalLinkJobs = Object.values(externalLinkWatchdog.jobs || {})
    const externalLinkSteps = externalLinkJobs.length === 1 && Array.isArray(externalLinkJobs[0]?.steps) ? externalLinkJobs[0].steps : []
    const externalLinkScan = externalLinkSteps.find(step => step?.id === 'scan')
    if (!externalLinkScan || externalLinkScan['continue-on-error'] !== undefined) {
      errors.push('external-link-watchdog.yml: rendered-site scan must fail closed on checker errors')
    }
    const upload = externalLinkSteps.find(step => step?.name === 'Upload external link report')
    const reportNote = externalLinkSteps.find(step => step?.name === 'Build documentation site change and link health note')
    const reportCreate = externalLinkSteps.find(step => step?.name === 'Create documentation site report card')
    const reportAttach = externalLinkSteps.find(step => step?.name === 'Attach documentation site report note')
    const reportFinish = externalLinkSteps.find(step => step?.name === 'Finish documentation site report card')
    const reportSteps = [reportNote, reportCreate, reportAttach, reportFinish]
    if (reportSteps.some(step => !step) || reportNote?.if !== undefined || reportCreate?.if !== undefined ||
        String(reportAttach?.if || '') !== "${{ steps.report_card.outputs.card_id != '' && steps.report_note.outcome == 'success' }}" ||
        String(reportFinish?.if || '') !== "${{ steps.report_card.outputs.card_id != '' }}") {
      errors.push('external-link-watchdog.yml: report card must run after every successful scan')
    }
    if (reportSteps.some(step => step?.['continue-on-error'] !== true)) {
      errors.push('external-link-watchdog.yml: Feishu reporting must remain best effort')
    }
    if (!String(reportCreate?.run || '').includes('--title "Documentation Site Change & Link Health Report"')) {
      errors.push('external-link-watchdog.yml: report card must use the approved title')
    }
    if (!/cardStatus = expiredCount === 0 \? 'success' : 'fail'/.test(externalLinkScan?.run || '') ||
        !/card_status=\$\{cardStatus\}/.test(externalLinkScan?.run || '') ||
        reportFinish?.env?.CARD_STATUS !== '${{ steps.scan.outputs.card_status }}' ||
        !String(reportFinish?.run || '').includes('--status "$CARD_STATUS"')) {
      errors.push('external-link-watchdog.yml: report card presentation must derive from confirmed expiry')
    }
    if (!upload || !reportNote || externalLinkSteps.indexOf(upload) >= externalLinkSteps.indexOf(reportNote)) {
      errors.push('external-link-watchdog.yml: complete report upload must precede Feishu reporting')
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

  const translationStagingSource = fs.readFileSync(options.translationStagingPath || path.join(process.cwd(), 'scripts/docs-workflow/translation-staging.js'), 'utf8')
  if (!/\['diff', '--no-renames', '--name-only', '-z', 'HEAD', '--'\]/.test(translationStagingSource) ||
      !/\['diff', '--cached', '--no-renames', '--name-only', '-z'\]/.test(translationStagingSource)) {
    errors.push('translation-staging.js: staged batch comparisons must disable rename detection')
  }

  const groupsSource = fs.readFileSync(options.groupsPath || path.join(process.cwd(), 'packages/docs-tooling/src/workflows/groups.ts'), 'utf8')
  if (!/site === 'en' && groupName === 'guides' \? GUIDES_CHECKPOINT_PATHS : \[\]/.test(groupsSource)) {
    errors.push('groups.ts: shared Guides diagnostics must remain English-owned')
  }

  const guidesValidationSource = fs.readFileSync(options.guidesValidationPath || path.join(process.cwd(), 'scripts/docs-workflow/validate-guides-translation-staging.js'), 'utf8')
  const canonicalRequiredRoots = [
    'content/en/guides',
    'content/en/byoc',
    'i18n/ja-JP/docusaurus-plugin-content-docs/current',
    'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current',
    '.translation-cache/ja-JP.json',
    'generated/en/sidebars',
  ]
  if (canonicalRequiredRoots.some(root => !guidesValidationSource.includes(`'${root}'`)) ||
      !/for \(const root of REQUIRED_ROOTS\)/.test(guidesValidationSource) ||
      /\n\s*'(?:docs|docs-byoc|reference|config\/generated)',/.test(guidesValidationSource)) {
    errors.push('validate-guides-translation-staging.js: combined validation must require canonical tracked roots only')
  }
  if (!/exactCommit\(repository, expectedTargetSha, 'expectedTargetSha'/.test(guidesValidationSource) ||
      !/verifyRestoredPaths\(repository, expectedTargetSha, outside/.test(guidesValidationSource)) {
    errors.push('validate-guides-translation-staging.js: outside restored paths must exactly match the trusted expected target baseline')
  }
  if (!/git\(repository, \['merge-base', '--is-ancestor', expectedTargetSha, stagedSha\], environment\)/.test(guidesValidationSource)) {
    errors.push('validate-guides-translation-staging.js: expected target must be an ancestor of staged translation')
  }

  const publicationReportSource = fs.readFileSync(options.publicationReportPath || path.join(process.cwd(), 'scripts/docs-workflow/translation-publication-report.js'), 'utf8')
  if (!/validationSpec\('english-saas-mdx',[\s\S]*'content\/en\/guides'/.test(publicationReportSource) ||
      !/validationSpec\('english-byoc-mdx',[\s\S]*'content\/en\/byoc'/.test(publicationReportSource) ||
      !/validationSpec\('build-and-links',[\s\S]*'pnpm run build'/.test(publicationReportSource) ||
      /validate-mdx', '--path', 'docs(?:-byoc)?'/.test(publicationReportSource)) {
    errors.push('translation-publication-report.js: validation receipts must use canonical tracked commands')
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
    [/--expected-target-sha['"], values\.expectedTargetSha/, 'must bind validation to the candidate expected target baseline'],
    [/promoteStaging/, 'must use normal fast-forward staging promotion'],
    [/deleteStagingWithLease/, 'must use exact leased staging cleanup'],
    [/complete validated recovery pairs are unavailable/, 'must fail closed when target movement lacks complete recovery pairs'],
  ]) if (!pattern.test(recoveryHelper)) errors.push(`recover-guides-translation.js: ${message}`)
  if (/publish-checkpoint|gh run download|\[['"](?:merge|rebase)['"]|git[^\n]*push[^\n]*(?:--force|-f)|eval\(/.test(recoveryHelper)) {
    errors.push('recover-guides-translation.js: recovery must not replay batches, merge, rebase, eval, or force-push')
  }

  const selectionPath = options.translationSelectionPath || path.join(process.cwd(), 'scripts/translation/selection.js')
  try {
    delete require.cache[require.resolve(selectionPath)]
    const {buildTranslationSelection} = require(selectionPath)
    const japaneseRest = buildTranslationSelection({locale: 'ja-JP', group: 'rest'})
    const allRest = buildTranslationSelection({locale: 'all', group: 'rest'})
    if (JSON.stringify(japaneseRest.map(unit => `${unit.target}/${unit.group}`)) !== JSON.stringify(['ja-JP/rest']) ||
        JSON.stringify(allRest.map(unit => `${unit.target}/${unit.group}`)) !== JSON.stringify(['ja-JP/rest'])) {
      errors.push('translation selection: canonical REST selection must retain only ja-JP/rest')
    }
    try {
      buildTranslationSelection({locale: 'zh-CN', group: 'rest'})
      errors.push('translation selection: canonical REST selection must reject zh-CN-reference/rest')
    } catch {}
  } catch {
    errors.push('translation selection: canonical REST selection policy could not be evaluated')
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
