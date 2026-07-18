'use strict'

const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')

const workflowDirectory = path.join(process.cwd(), '.github', 'workflows')
const publishingWorkflows = new Set([
  'fetch-docs.yml',
  'translate-codex.yml',
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
    if (/\b(?:mdx-parse|validate-translated-coverage(?:\.js)?|run-doc-build-stage(?:\.js)?)\b/.test(trimmed)) return true
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

function validateWorkflowPolicies(directory = workflowDirectory, options = {}) {
  const errors = []
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.yml')).sort()

  for (const file of files) {
    const source = fs.readFileSync(path.join(directory, file), 'utf8')
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
    if (/push_options:\s*--force/.test(source) || /git push\s+--force/.test(source)) {
      errors.push(`${file}: force-pushing generated documentation can discard concurrent updates`)
    }

    if (publishingWorkflows.has(file)) {
      if (!['_publish-content-group.yml', '_publish-translation-batches.yml', '_translate-publish-batch.yml'].includes(file) && !/^concurrency:\n  group: docs-production-dev\n  cancel-in-progress: false$/m.test(source)) {
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

    if (file === '_fetch-content-group.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/, 'must check out the immutable master_sha input'],
        [/restore-generated-state\.sh --exact --ref "\$DEV_BASELINE_SHA"/, 'must exactly restore generated state from the immutable baseline SHA'],
        [/name: Restore generated state from dev baseline[\s\S]*name: Prepare selected content group workspace[\s\S]*prepare-content-group-workspace\.js "\$GROUP"[\s\S]*name: Fetch content group/, 'must prepare the selected group after baseline restore and before generation'],
        [/create-checkpoint-artifact\.js/, 'must create a checkpoint artifact'],
        [/validate-checkpoint-artifact\.js/, 'must validate the checkpoint artifact'],
        [/actions\/upload-artifact@v4/, 'must upload the checkpoint artifact'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
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
        [/sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/, 'must classify the selected group source delta'],
        [/manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/, 'must build the durable pending set from the source delta'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
    }

    if (file === '_translate-content-group.yml') {
      const requiredPatterns = [
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^" 2>\/dev\/null \|\| git fetch --no-tags --depth=2 origin "\$SOURCE_COMMIT_SHA"/, 'must recover source checkpoint ancestry after generated-state restore'],
        [/git cat-file -e "\$SOURCE_COMMIT_SHA\^"[\s\S]*git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must verify the source checkpoint parent before translation reconciliation'],
        [/git diff --name-status "\$SOURCE_COMMIT_SHA\^" "\$SOURCE_COMMIT_SHA"/, 'must derive translation reconciliation from the immutable source checkpoint diff'],
        [/sourceDelta\.js --group "\$GROUP"[\s\S]*--output tmp\/source-delta\.json/, 'must classify the selected group source delta'],
        [/applySourceDelta\.js --delta tmp\/source-delta\.json --report tmp\/source-delta-report\.json/, 'must apply translated output and cache deletions before manifest creation'],
        [/manifest\.js[\s\S]*--source-delta tmp\/source-delta\.json/, 'must prioritize current source changes and preserve reconciliation metadata'],
        [/steps\.source_delta\.outputs\.has_mutation == 'true'/, 'must create checkpoints for deletion-only translation mutations'],
        [/\(steps\.agents\.outputs\.failed_count \|\| '0'\) != '0'/, 'must create checkpoints for batches that only record failed translations'],
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
      const normalizeCondition = value => String(value || '').trim().replace(/\s+/g, ' ')
      const expectedNumberedCondition = "${{ inputs.should_translate && inputs.group == 'guides' && inputs.batch_number > 0 && ((steps.agents.outputs.translated_count || '0') != '0' || (steps.agents.outputs.failed_count || '0') != '0' || steps.source_delta.outputs.has_mutation == 'true') }}"
      const expectedUnbatchedCondition = "${{ inputs.should_translate && inputs.batch_number == 0 && ((steps.agents.outputs.translated_count || '0') != '0' || (steps.agents.outputs.failed_count || '0') != '0' || steps.source_delta.outputs.has_mutation == 'true') }}"

      if (!numbered || normalizeCondition(numberedCondition) !== normalizeCondition(expectedNumberedCondition)) {
        errors.push(`${file}: numbered Guides batches must use the dedicated mutation-aware local validation step`)
      }
      if (/mdx-parse/.test(numberedRun)) errors.push(`${file}: numbered Guides batches must not run full-tree MDX parsing`)
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
      if (!/mdx-parse/.test(unbatchedRun) || !/validate-translated-coverage\.js --group "\$GROUP"/.test(unbatchedRun) || !/pnpm run build/.test(unbatchedRun)) {
        errors.push(`${file}: unbatched translations must retain full MDX, coverage, and build validation`)
      }
      for (const step of steps) {
        if (step === unbatched || step === checkpoint) continue
        if (containsFullValidationCommand(step?.run)) errors.push(`${file}: full validation and build commands must exist only in the exact unbatched validation path`)
      }
      const checkpointAttestation = 'if (( ${{ inputs.batch_number }} == 0 )); then validation_args=(--validation-command "pnpm run build"); fi'
      const checkpointLines = checkpointRun.split('\n')
      const attestationEntries = executableShellLineEntries(checkpointRun).filter(entry => entry.trimmed === checkpointAttestation)
      const attestationIndexes = new Set(attestationEntries.map(entry => entry.index))
      const checkpointWithoutAttestation = checkpointLines.filter((line, index) => !attestationIndexes.has(index)).join('\n')
      if (attestationEntries.length !== 1 || containsFullValidationCommand(checkpointWithoutAttestation)) {
        errors.push(`${file}: checkpoint build attestation must remain restricted to unbatched runs`)
      }
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
      const downloadIndex = steps.findIndex(step => step.name === 'Download Guides translation checkpoints')
      if (!capture || captureIndex < 0 || downloadIndex < 0 || captureIndex >= downloadIndex || !/createInitialPublisherState/.test(capture.run || '') || !/SOURCE_COMMIT_SHA/.test(capture.run || '') || !/EXPECTED_TARGET_SHA/.test(capture.run || '') || !/refs\/remotes\/origin\/\$TARGET_BRANCH\^\{commit\}/.test(capture.run || '')) errors.push(`${file}: publisher must authenticate and persist source and target identities before artifact download`)
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
        [/generate-guides-sidebars\.js --media-manifest plugins\/lark-docs\/meta\/media-cache\/guides\.json/, 'must generate both combined sidebars through the offline wrapper'],
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
      const createIndex = stepIndex('Create Guides v4 generation payload')
      const saveIndex = stepIndex('Save Guides v4 generation')
      const reportIndex = stepIndex('Record Guides cache generation persistence')
      if (!(validateIndex >= 0 && validateIndex < selectIndex && selectIndex < createIndex && createIndex < saveIndex && saveIndex < reportIndex)) {
        errors.push(`${file}: Guides v4 generation must follow combined validation and promoted snapshot selection before save and reporting`)
      }
      if (!(decisionIndex >= 0 && decisionIndex < generateIndex && generateIndex < validateIndex && validateIndex < finalizeIndex && finalizeIndex < selectIndex)) {
        errors.push(`${file}: observe-only assembly must validate decision, generate, validate output, then finalize identity`)
      }
      const decisionStep = steps[decisionIndex]
      if (!/validate-decision[\s\S]*decision-sha[\s\S]*inputs\.assembly_decision_sha256/.test(decisionStep?.run || '')) errors.push(`${file}: assembly must validate the restored decision against the plumbed canonical hash`)
      const generatorStep = steps[generateIndex]
      if (generatorStep?.if || generatorStep?.run !== 'node scripts/docs-workflow/generate-guides-sidebars.js --media-manifest plugins/lark-docs/meta/media-cache/guides.json') errors.push(`${file}: observe-only assembly generator must always run the fixed two-target wrapper once`)
      const validationStep = steps[validateIndex]
      if (!/validate-generated-sidebars\.js[\s\S]*run-doc-build-stage\.js --build "pnpm run build"/.test(validationStep?.run || '')) errors.push(`${file}: combined sidebar and full build validation must run before descriptor promotion`)
      const finalizeStep = steps[finalizeIndex]
      if (!/saas=config\/generated\/guides\.sidebar\.js[\s\S]*byoc=config\/generated\/guides-byoc\.sidebar\.js[\s\S]*cmp -s[^\n]*\$saas[\s\S]*cmp -s[^\n]*\$byoc[\s\S]*write-descriptor[\s\S]*--expected-decision-sha256 "\$\{\{ inputs\.assembly_decision_sha256 \}\}"[\s\S]*verify-descriptor[\s\S]*write-result[\s\S]*guides-assembly-result\.json/.test(finalizeStep?.run || '')) errors.push(`${file}: finalize must compare reuse bytes and write verified descriptor plus a separate result`)
      if (/npx docusaurus fetch-lark-docs[\s\S]*-sidebar/.test(source) || /cp[^\n]*baseline[^\n]*config\/generated\/guides(?:-byoc)?\.sidebar\.js/.test(source)) errors.push(`${file}: observe-only assembly must not restore sidebars or use the legacy split generators`)
      if (/--output plugins\/lark-docs\/meta\/reports\/guides-assembly-decision\.json/.test(finalizeStep?.run || '')) errors.push(`${file}: finalize must never mutate the immutable assembly decision`)
      const selection = stepById.get('promoted_snapshot')
      if (!/guides-cache-generation-lifecycle\.js select[\s\S]*--cache-version "\$\{\{ inputs\.cache_version \}\}"[\s\S]*--save-required "\$\{\{ inputs\.cache_save_required \}\}"[\s\S]*if \[\[ "\$selected" == candidate \]\]; then[\s\S]*promote-lark-doc-snapshot\.js/.test(selection?.run || '')) {
        errors.push(`${file}: unchanged valid-v4 assembly must preserve the baseline snapshot while save-required runs promote the candidate`)
      }
      const generation = stepById.get('guides_v4_generation')
      if (generation?.if !== "${{ inputs.cache_save_required == 'true' }}" ||
          !/guides-source-cache-generation\.js keys[\s\S]*--snapshot "\$snapshot"[\s\S]*guides-source-cache-generation\.js create[\s\S]*guides-source-cache-generation\.js validate[\s\S]*key=\$key/.test(generation?.run || '')) {
        errors.push(`${file}: v4 generation payload must be created, keyed, and revalidated from the exact promoted snapshot only when save is required`)
      }
      const save = stepById.get('save_guides_v4_generation')
      if (save?.if !== "${{ inputs.cache_save_required == 'true' && steps.guides_v4_generation.outcome == 'success' }}" || save?.['continue-on-error'] !== true || save?.uses !== 'actions/cache/save@v4' || save?.with?.path !== 'tmp/guides-source-cache-v4' || save?.with?.key !== '${{ steps.guides_v4_generation.outputs.key }}') {
        errors.push(`${file}: Guides v4 cache save must be conditional, nonfatal, and use the promoted snapshot generation key`)
      }
      const report = steps.find(step => step.name === 'Record Guides cache generation persistence')
      if (report?.if !== '${{ always() }}' || !/guides-cache-generation-lifecycle\.js report[\s\S]*steps\.promoted_snapshot\.outcome[\s\S]*steps\.promoted_source_manifest\.outcome[\s\S]*steps\.guides_v4_generation\.outcome[\s\S]*steps\.save_guides_v4_generation\.outcome[\s\S]*guides-cache-generation\.json/.test(report?.run || '')) {
        errors.push(`${file}: Guides cache generation report must run after save and record the actual preparation and save outcomes`)
      }
      if (/guides-source-cache\.js key[^\n]*--version 3/.test(source)) errors.push(`${file}: legacy v3 cache persistence is forbidden`)
    }

    if (file === 'fetch-docs.yml') {
      const requiredPatterns = [
        [/^          GUIDES_TRANSLATION_CANDIDATES: \$\{\{ needs\.prepare_guides_translation_batches\.outputs\.candidate_counts \}\}$/m, 'must pass Guides candidate counts to aggregation'],
        [/render_guides_tables:[\s\S]*max-parallel: 4[\s\S]*fromJSON\(needs\.produce_guides_sources\.outputs\.table_matrix\)/, 'must render Guides target/table matrix with max-parallel 4'],
        [/produce_guides:[\s\S]*render_guides_tables\.result == 'skipped'/, 'must assemble an empty Guides render matrix'],
        [/produce_guides:[\s\S]*cache_version: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_version \}\}[\s\S]*cache_save_required: \$\{\{ needs\.produce_guides_sources\.outputs\.cache_save_required \}\}/, 'must pass Guides cache version and save requirement into assembly'],
        [/publish_guides_translation_batches:[\s\S]*needs: \[[^\]]*publish_guides[^\]]*\][\s\S]*source_commit_sha: \$\{\{ needs\.publish_guides\.outputs\.commit_sha \|\| needs\.prepare\.outputs\.dev_baseline_sha \}\}[\s\S]*expected_target_sha: \$\{\{ needs\.publish_guides\.outputs\.commit_sha \}\}/, 'must pass authenticated final Guides source and target identities'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      const finalizeStep = workflow.jobs?.finalize_guides_translation?.steps?.find(step => step.id === 'result')
      if (finalizeStep?.env?.BATCH_COUNT !== "${{ needs.prepare_guides_translation_batches.result != 'success' && '0' || needs.prepare_guides_translation_batches.outputs.batch_count }}" ||
          finalizeStep?.env?.BATCH_RESULT !== '${{ needs.translate_guides_batches.result }}' ||
          finalizeStep?.env?.PUBLISHER_RESULT !== '${{ needs.publish_guides_translation_batches.result }}' ||
          finalizeStep?.env?.PUBLISHER_STATUS !== '${{ needs.publish_guides_translation_batches.outputs.status }}' ||
          finalizeStep?.env?.PUBLISHER_COMMIT_SHA !== '${{ needs.publish_guides_translation_batches.outputs.commit_sha }}' ||
          Object.hasOwn(finalizeStep?.env || {}, 'TARGET_BRANCH')) {
        errors.push(`${file}: Guides translation finalizer must use only exact publisher status and commit outputs`)
      }
      const aggregateStep = workflow.jobs?.aggregate?.steps?.find(step => step.id === 'aggregate')
      if (aggregateStep?.env?.GUIDES_TRANSLATOR !== '${{ needs.finalize_guides_translation.outputs.translator_status }}' ||
          aggregateStep?.env?.GUIDES_TRANSLATION !== '${{ needs.finalize_guides_translation.outputs.publisher_status }}' ||
          aggregateStep?.env?.GUIDES_TRANSLATION_SHA !== '${{ needs.finalize_guides_translation.outputs.commit_sha }}') {
        errors.push(`${file}: aggregate must consume the exact finalized Guides translation result without fallback`)
      }
      const aggregateSteps = workflow.jobs?.aggregate?.steps || []
      const publicationDownload = aggregateSteps.find(step => step.name === 'Download Guides translation publication report')
      const cardNotes = aggregateSteps.find(step => step.id === 'reports')
      if (!publicationDownload || aggregateSteps.indexOf(publicationDownload) >= aggregateSteps.indexOf(cardNotes) || publicationDownload['continue-on-error'] !== true ||
          publicationDownload.with?.name !== 'docs-translation-publication-guides-${{ github.run_id }}-${{ github.run_attempt }}' ||
          publicationDownload.with?.path !== '${{ runner.temp }}/guides-translation-publication-evidence' || !/always\(\)/.test(publicationDownload.if || '') ||
          cardNotes?.env?.CARD_GUIDES_PUBLICATION_REPORT !== '${{ runner.temp }}/guides-translation-publication-evidence/publication-report.json' ||
          cardNotes?.env?.CARD_GUIDES_RUN_ID !== '${{ github.run_id }}' || cardNotes?.env?.CARD_GUIDES_RUN_ATTEMPT !== '${{ github.run_attempt }}' ||
          cardNotes?.env?.CARD_GUIDES_SOURCE_SHA !== '${{ needs.publish_guides.outputs.commit_sha }}' || cardNotes?.env?.CARD_GUIDES_TARGET_SHA !== '${{ needs.publish_guides.outputs.commit_sha }}' ||
          cardNotes?.env?.CARD_GUIDES_PENDING_SET_SHA256 !== '${{ needs.prepare_guides_translation_batches.outputs.pending_set_sha256 }}' ||
          cardNotes?.env?.CARD_GUIDES_FINAL_PUBLISHER_STATUS !== '${{ needs.finalize_guides_translation.outputs.publisher_status }}' ||
          cardNotes?.env?.CARD_GUIDES_FINAL_COMMIT_SHA !== '${{ needs.finalize_guides_translation.outputs.commit_sha }}' ||
          /resolve_final|\|\|/.test(JSON.stringify({ path: cardNotes?.env?.CARD_GUIDES_PUBLICATION_REPORT, source: cardNotes?.env?.CARD_GUIDES_SOURCE_SHA, target: cardNotes?.env?.CARD_GUIDES_TARGET_SHA }))) {
        errors.push(`${file}: aggregate must collect exact run-attempt Guides publication evidence before card notes`)
      }
    }

    if (file === '_publish-content-group.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}/, 'must check out immutable publisher tooling'],
        [/actions\/download-artifact@v4/, 'must download the exact checkpoint artifact'],
        [/inputs\.baseline_artifact_name != ''[\s\S]*name: \$\{\{ inputs\.baseline_artifact_name \}\}/, 'must conditionally download the exact baseline artifact'],
        [/tar -tf[\s\S]*tar -tvf/, 'must inspect archive paths and entry types before extraction'],
        [/extract_checkpoint_archive[\s\S]*extract_checkpoint_archive[\s\S]*manifest\.resolvedDir[\s\S]*payload[\s\S]*--baseline-dir/, 'must reuse safe extraction and pass the validated baseline payload directory'],
        [/validate-checkpoint-artifact\.js/, 'must validate checkpoint identity'],
        [/publish-checkpoint\.sh/, 'must invoke the checkpoint publisher'],
        [/status=failed[\s\S]*status=skipped[\s\S]*published[\s\S]*no_changes/, 'must emit deterministic terminal outputs'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/^concurrency:/m.test(source)) errors.push(`${file}: reusable publisher must let the orchestrator serialize publication`)
      if (/git-auto-commit|git push[^\n]*--force/.test(source)) errors.push(`${file}: publisher must not auto-commit or force-push`)
    }

    if (file === '_verify-docs.yml') {
      const requiredPatterns = [
        [/^  workflow_call:$/m, 'must be a workflow_call reusable workflow'],
        [/name: Check out immutable master tooling[\s\S]*actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.master_sha \}\}[\s\S]*fetch-depth: 0/, 'must check out immutable master tooling'],
        [/git fetch --no-tags origin "\$FINAL_DEV_SHA"[\s\S]*git worktree add --detach "\$RUNNER_TEMP\/final-dev" "\$FINAL_DEV_SHA"/, 'must materialize the exact final dev SHA'],
        [/restore-generated-state\.sh --exact --ref "\$FINAL_DEV_SHA"/, 'must restore generated content from the exact final dev SHA'],
        [/name: Clean up final dev worktree[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*git worktree remove --force "\$RUNNER_TEMP\/final-dev"/, 'must always clean up the final dev worktree'],
        [/validate-generated-sidebars\.js/, 'must validate generated sidebars'],
        [/for group in guides python java node go cli rest; do[\s\S]*validate-translated-coverage\.js --group "\$group"[\s\S]*done/, 'must validate translated coverage for every translatable group'],
        [/run-doc-build-stage\.js --build "pnpm run build"/, 'must run the documentation build stage'],
        [/name: Verify final documentation state[\s\S]*run: \|\n\s+set -euo pipefail\n[\s\S]*validate-generated-sidebars\.js[^\n]*\| tee/, 'must propagate failures from verification commands piped to report logs'],
        [/validate-workflow-policy\.js/, 'must validate workflow policy'],
        [/actions\/upload-artifact@v4[\s\S]*if-no-files-found: ignore/, 'must always preserve verification reports'],
        [/status=passed[\s\S]*status=failed/, 'must emit a deterministic terminal status'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      if (/actions\/checkout@v4[\s\S]*ref: \$\{\{ inputs\.final_dev_sha \}\}/.test(source)) errors.push(`${file}: final verification tooling must not come from the dev content commit`)
      if (/contents: write|git push/.test(source)) errors.push(`${file}: final verification must remain read-only and must not publish`)
    }

    if (file === 'translate-codex.yml') {
      const requiredPatterns = [
        [/TARGET_BRANCH_INPUT: \$\{\{ inputs\.target_branch \}\}/, 'must pass the branch input through the step environment'],
        [/git check-ref-format --branch "\$target_branch"/, 'must validate the target branch before fetching'],
        [/refs\/heads\/\$target_branch:refs\/remotes\/origin\/\$target_branch/, 'must fetch the validated branch with an explicit refspec'],
        [/TRANSLATION_AGENT_API_KEY: \$\{\{ secrets\.TRANSLATION_AGENT_API_KEY \}\}[\s\S]*REVIEW_AGENT_API_KEY: \$\{\{ secrets\.REVIEW_AGENT_API_KEY \}\}/, 'must map only the translation agent secrets'],
      ]
      for (const [pattern, message] of requiredPatterns) if (!pattern.test(source)) errors.push(`${file}: ${message}`)
      const resolver = source.slice(source.indexOf('- id: refs'), source.indexOf('  translate:'))
      if (/run: \|[\s\S]*\$\{\{ inputs\.target_branch \}\}/.test(resolver)) errors.push(`${file}: target branch input must not be interpolated into shell source`)
      if (/secrets: inherit/.test(source)) errors.push(`${file}: reusable translation must receive an explicit secret allowlist`)
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
    const monitorNeeds = Array.isArray(monitor?.needs) ? monitor.needs : monitor?.needs ? [monitor.needs] : []
    if (monitorNeeds.length !== 1 || monitorNeeds[0] !== 'prepare') errors.push('fetch-docs.yml: central monitor must start after prepare only')
    if (monitor?.uses !== './.github/workflows/_monitor-docs-progress.yml') errors.push('fetch-docs.yml: central monitor must use _monitor-docs-progress.yml')
    const aggregateNeeds = Array.isArray(caller?.jobs?.aggregate?.needs) ? caller.jobs.aggregate.needs : []
    if (aggregateNeeds.includes('monitor_docs_progress')) errors.push('fetch-docs.yml: aggregate must not depend on the central monitor')
    const fallback = caller?.jobs?.finalize_card_fallback
    const fallbackNeeds = Array.isArray(fallback?.needs) ? fallback.needs : []
    if (fallbackNeeds.join(',') !== 'prepare,aggregate,monitor_docs_progress') errors.push('fetch-docs.yml: fallback must depend on prepare, aggregate, and monitor')
    if (!String(fallback?.if || '').includes("needs.monitor_docs_progress.result != 'success'")) errors.push('fetch-docs.yml: fallback must run only when the monitor is unsuccessful')
    const aggregateSource = callerSource.slice(callerSource.indexOf('  aggregate:'), callerSource.indexOf('  finalize_card_fallback:'))
    if (!/name: docs-card-report-\$\{\{ github\.run_id \}\}/.test(aggregateSource) || !/name: Upload final card report artifact[\s\S]*if: \$\{\{ always\(\) \}\}[\s\S]*continue-on-error: true/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: aggregate must always attempt the final card report artifact')
    }
    const restoreReports = aggregateSource.indexOf('name: Restore committed report directories')
    const downloadGuidesReports = aggregateSource.indexOf('name: Download current Guides reports')
    const collectReports = aggregateSource.indexOf('name: Collect card report summaries')
    if (downloadGuidesReports < 0) errors.push('fetch-docs.yml: aggregate must download current Guides reports')
    if (!(restoreReports >= 0 && downloadGuidesReports > restoreReports && collectReports > downloadGuidesReports)) {
      errors.push('fetch-docs.yml: current Guides reports must be downloaded before card collection')
    }
    if (!/name: Download current Guides reports[\s\S]*path: plugins\/lark-docs\/meta\/reports/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: Guides reports must restore into the collector report directory')
    }
    if (!/CARD_REPORT_ARTIFACT_URL:/.test(aggregateSource)) {
      errors.push('fetch-docs.yml: artifact-only card reports require a workflow artifact URL')
    }
    if (!/produce_guides:[\s\S]*assembly_decision_sha256: \$\{\{ needs\.produce_guides_sources\.outputs\.assembly_decision_sha256 \}\}/.test(callerSource)) {
      errors.push('fetch-docs.yml: must pass the canonical Guides assembly decision hash into assembly')
    }
    const createReport = aggregateSource.indexOf('name: Create final card report artifact')
    const reportIngestion = aggregateSource.slice(Math.max(0, restoreReports), createReport >= 0 ? createReport : aggregateSource.length)
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
  const distributedPattern = /report-live-card\.sh|report-to-lark --card-(?:phase|finish|state-file|advance)/
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
    let lastCacheStep = -1
    for (const name of requiredCacheSteps) {
      const index = guidesSteps.findIndex(step => step.name === name)
      if (index <= lastCacheStep) {
        errors.push('_fetch-guides-sources.yml: Guides cache candidates must restore and validate in v4, v3, v2, v1 order')
        break
      }
      lastCacheStep = index
    }
    const restoreKeyLines = guidesSource.match(/^\s+restore-keys:/gm) || []
    const v4Restore = stepById.get('source_cache_v4')
    const keyStep = stepById.get('source_cache_keys')
    if (restoreKeyLines.length !== 1 || v4Restore?.if !== "${{ steps.source_cache_keys.outputs.v4_restore_enabled == 'true' }}" || v4Restore?.with?.['restore-keys'] !== '${{ steps.source_cache_keys.outputs.v4_prefix }}' || v4Restore?.with?.path !== 'tmp/guides-source-cache-v4' || v4Restore?.with?.key !== '${{ steps.source_cache_keys.outputs.v4_lookup }}' ||
        !/guides-source-cache-generation\.js keys[\s\S]*\.prefix[\s\S]*v4_prefix[\s\S]*v4_restore_enabled/.test(keyStep?.run || '')) {
      errors.push('_fetch-guides-sources.yml: Guides v4 restore requires the sole snapshot-scoped restore prefix and isolated payload path')
    }
    const v4Validation = stepById.get('source_cache_v4_check')?.run || ''
    if (!/guides-source-cache-source-promotion\.js validate[\s\S]*--payload "\$staged"[\s\S]*guides-source-cache\.js validate-media[\s\S]*"\$staged\/media-manifest\.json"/.test(v4Validation) ||
        !/else[\s\S]*guides-source-cache-source-promotion\.js promote[\s\S]*--payload "\$staged"[\s\S]*source_valid=true/.test(v4Validation)) {
      errors.push('_fetch-guides-sources.yml: v4 Guides source and media validity must remain independent before promotion')
    }
    if (!/\[\[ -e "\$payload" \|\| -L "\$payload" \]\] && candidate_present=true[\s\S]*\[\[ -d "\$payload" && ! -L "\$payload" && -f "\$snapshot" \]\]/.test(v4Validation)) {
      errors.push('_fetch-guides-sources.yml: malformed v4 cache payload must be reported as an invalid candidate')
    }
    for (const [id, preceding] of [['source_cache_v3', 'source_cache_v4_check'], ['source_cache_v2', 'source_cache_v3_check'], ['source_cache_v1', 'source_cache_v2_check']]) {
      if (stepById.get(id)?.if !== `\${{ steps.${preceding}.outputs.source_valid != 'true' }}`) {
        errors.push('_fetch-guides-sources.yml: legacy Guides fallback must depend on preceding source validity')
        break
      }
    }
    for (const [id, preceding] of [['source_cache_v3_check', 'source_cache_v4_check'], ['source_cache_v2_check', 'source_cache_v3_check'], ['source_cache_v1_check', 'source_cache_v2_check']]) {
      const validation = stepById.get(id)
      if (validation?.if || !new RegExp(`steps\\.${preceding}\\.outputs\\.source_valid[\\s\\S]*source_valid=true`).test(validation?.run || '')) {
        errors.push('_fetch-guides-sources.yml: Guides validation chain must propagate prior source validity to stop fallback')
        break
      }
    }
    for (const [id, includesMedia] of [['source_cache_v3_check', true], ['source_cache_v2_check', true], ['source_cache_v1_check', false]]) {
      const run = stepById.get(id)?.run || ''
      const sourcePresence = /\[\[ -e plugins\/lark-docs\/meta\/sources\/guides \|\| -L plugins\/lark-docs\/meta\/sources\/guides[\s\S]*-e "\$manifest" \|\| -L "\$manifest"/.test(run)
      const mediaPresence = /-e "\$media" \|\| -L "\$media" \]\] && candidate_present=true/.test(run)
      if (!sourcePresence || (includesMedia && !mediaPresence) || (!includesMedia && !/\|\| -L "\$manifest" \]\] && candidate_present=true/.test(run))) {
        errors.push('_fetch-guides-sources.yml: malformed legacy cache leaves must be reported as invalid candidates')
        break
      }
    }
    if (/cache-hit/.test(guidesSource)) errors.push('_fetch-guides-sources.yml: Guides fallback must never trust cache-hit before validation')
    if (/rm -rf[^\n]*plugins\/lark-docs\/meta\/(?:source-cache|media-cache)\/?(?:\s|$)/.test(guidesSource)) {
      errors.push('_fetch-guides-sources.yml: Guides cleanup must remove exact cache leaves and preserve unrelated cache state')
    }
    for (const [validationName, nextRestoreName, requiredCleanup] of [
      ['Validate and promote Guides v4 cache candidate', 'Restore Guides v3 cache candidate', /rm -rf "\$staged" tmp\/guides-source-cache-v4[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all/],
      ['Validate Guides v3 cache candidate', 'Restore Guides v2 cache candidate', /guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all/],
      ['Validate Guides v2 cache candidate', 'Restore Guides v1 cache candidate', /guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope all/],
    ]) {
      const block = guidesSource.slice(guidesSource.indexOf(`name: ${validationName}`), guidesSource.indexOf(`name: ${nextRestoreName}`))
      if (!requiredCleanup.test(block)) {
        errors.push('_fetch-guides-sources.yml: rejected Guides cache residue must be removed before fallback restore')
        break
      }
    }
    for (const [validationName, nextRestoreName] of [['Validate Guides v3 cache candidate', 'Restore Guides v2 cache candidate'], ['Validate Guides v2 cache candidate', 'Restore Guides v1 cache candidate']]) {
      const block = guidesSource.slice(guidesSource.indexOf(`name: ${validationName}`), guidesSource.indexOf(`name: ${nextRestoreName}`))
      if (!/guides-source-cache-source-promotion\.js validate-live-source[\s\S]*guides-source-cache-source-promotion\.js validate-live-media/.test(block)) {
        errors.push('_fetch-guides-sources.yml: legacy Guides physical validation must precede semantic source and media reads')
        break
      }
      if (!/elif \[\[ "\$media_valid" != true \]\]; then[\s\S]*guides-source-cache-source-promotion\.js cleanup[\s\S]*--scope media/.test(block)) {
        errors.push('_fetch-guides-sources.yml: invalid legacy media must preserve valid Guides sources and select recovery')
        break
      }
    }
    const v1Validation = guidesSource.slice(guidesSource.indexOf('name: Validate Guides v1 cache candidate'), guidesSource.indexOf('id: source_cache_check'))
    if (!/guides-source-cache-source-promotion\.js validate-live-source[\s\S]*--schemas 1,2/.test(v1Validation)) {
      errors.push('_fetch-guides-sources.yml: v1 Guides physical validation must precede semantic source reads')
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
        !/--snapshot plugins\/lark-docs\/meta\/reports\/guides-source-snapshot-candidate\.json/.test(mediaPrefetchBlock) ||
        !/--report plugins\/lark-docs\/meta\/reports\/guides-media-prefetch\.json/.test(mediaPrefetchBlock) ||
        !/if \[\[ "\$\{\{ steps\.source_cache_check\.outputs\.media_valid \}\}" == true \]\]; then[\s\S]*--mode incremental[\s\S]*--cache-state valid[\s\S]*--plan plugins\/lark-docs\/meta\/reports\/guides-incremental-fetch-plan\.json[\s\S]*--previous-manifest plugins\/lark-docs\/meta\/media-cache\/guides\.json/.test(mediaPrefetchBlock) ||
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
