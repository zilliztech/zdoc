'use strict'

// Contract test for the hourly translation dispatcher and the Guides
// pending-file cap. The cap only works when _prepare-translation-batches and
// the per-batch producer rebuild the SAME (possibly capped) pending set, so
// the wiring is pinned here end to end: translate-codex passes one value to
// both sides, and both reusable workflows gate it on incremental mode.

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const yaml = require('js-yaml')

const repositoryRoot = path.resolve(__dirname, '../..')
const workflowPath = name => path.join(repositoryRoot, '.github/workflows', name)
const workflowSource = name => fs.readFileSync(workflowPath(name), 'utf8')
const workflow = name => yaml.load(workflowSource(name))

test('translate-codex passes one Guides cap to both the batch planner and the batch producers', () => {
  const source = workflowSource('translate-codex.yml')
  const doc = workflow('translate-codex.yml')
  for (const trigger of ['workflow_dispatch', 'workflow_call']) {
    assert.equal(doc.on[trigger].inputs.guides_max_files.default, '0', `${trigger} default must stay uncapped for existing callers`)
  }
  const prepare = doc.jobs.prepare_guides_batches.with
  assert.equal(prepare.max_files, "${{ inputs.guides_max_files || '0' }}", 'the batch planner must receive the same cap')
  const batches = doc.jobs.translate_guides_batches.with
  assert.equal(batches.max_files, "${{ inputs.guides_max_files || '0' }}", 'the per-batch producers must receive the same cap')
  assert.match(source, /guides_max_files/, 'the input must be declared')
})

test('the batch planner caps only incremental manifests', () => {
  const source = workflowSource('_prepare-translation-batches.yml')
  const doc = workflow('_prepare-translation-batches.yml')
  assert.equal(doc.on.workflow_call.inputs.max_files.default, '0')
  assert.match(source, /if \[\[ "\$effective_mode" == "incremental" \]\]; then effective_max_files="\$MAX_FILES"; fi/, 'the cap binds only in incremental mode')
  assert.match(source, /--max-files "\$effective_max_files"/, 'the manifest call must pass the effective cap')
})

test('the per-batch producer applies the same incremental-only cap rule', () => {
  const source = workflowSource('_translate-content-group.yml')
  assert.match(source, /if \(\( \$\{\{ inputs\.batch_number \}\} > 0 \)\) && \[\[ "\$EFFECTIVE_TRANSLATION_MODE" != "incremental" \]\]/, 'batch jobs must drop the cap outside incremental mode')
  assert.match(source, /--max-files "\$manifest_max_files"/, 'the manifest call must pass the gated cap')
})

test('the dispatcher workflow stays off the production queue and arms only through the repo variable or a manual run', () => {
  const doc = workflow('translation-dispatcher.yml')
  assert.equal(doc.concurrency.group, 'translation-dispatcher', 'the dispatcher owns its own group, never docs-production-dev')
  assert.equal(doc.concurrency['cancel-in-progress'], false)
  assert.equal(doc.permissions.contents, 'read', 'the workflow ceiling stays read-only; only the dispatch job escalates actions')
  assert.equal(doc.jobs.dispatch.permissions.actions, 'write')
  assert.equal(doc.jobs.dispatch.permissions.contents, 'read')
  assert.ok(doc.on.schedule.some(entry => entry.cron === '30 * * * *'), 'hourly schedule at :30')
  assert.equal(doc.jobs.dispatch['timeout-minutes'], 75, 'counting plus the armed-only build gate fits the cycle')
  const source = workflowSource('translation-dispatcher.yml')
  assert.match(source, /TRANSLATION_DISPATCHER_DISPATCH/, 'arming must flow through the repo variable')
  assert.match(source, /--dispatch "\$armed"/, 'the armed flag must reach the dispatcher CLI')
  assert.doesNotMatch(source, /docs-production-dev/, 'the dispatcher must never reference the production queue')
})

test('the dispatcher dispatches with the producer selection semantics, not hand-filtered handoffs', () => {
  const source = fs.readFileSync(path.join(repositoryRoot, 'scripts/docs-workflow/translation-dispatcher.js'), 'utf8')
  assert.match(source, /guidesMaxFiles/, 'dispatches carry the Guides cap')
  assert.match(source, /mode: 'auto'/, 'the dispatcher never requests a full retranslation')
  assert.match(source, /publish: true/, 'dispatched producers publish through their own short-lock publisher')
  assert.match(source, /buildHandoff\(\{groups: dispatchSelection\.groups\.join\(','\)\}\)/, 'handoffs come from the group selector, not unit filtering')
  assert.match(source, /selection\.groups\.filter\(group => !blockedGroups\.includes\(group\)\)/, 'the build gate drops whole groups, never single units or locales')
})

test('dispatcher guard alerts bypass the global Feishu mute through their own variable', () => {
  const doc = workflow('translation-dispatcher.yml')
  const steps = doc.jobs.dispatch.steps
  const alertIndex = steps.findIndex(step => step.name === 'Send dispatcher guard alerts')
  const uploadIndex = steps.findIndex(step => step.name === 'Upload the dispatch plan')
  assert.ok(alertIndex > -1, 'the alert step exists')
  assert.ok(alertIndex > -1 && alertIndex < uploadIndex, 'delivery marks the plan notified before the plan is uploaded, so a failed send retries next cycle')
  assert.equal(steps[alertIndex]['continue-on-error'], true, 'a failed card delivery never fails the dispatcher cycle')
  assert.equal(steps[alertIndex].env.FEISHU_NOTIFICATIONS_DISABLED, "${{ vars.TRANSLATION_DISPATCHER_ALERTS_DISABLED || '' }}", 'alerts use their own default-off mute, never the repo-wide kill switch')
  assert.equal(steps[alertIndex].env.APP_ID, '${{ secrets.APP_ID }}')
  assert.match(workflowSource('translation-dispatcher.yml'), /--alerts-output tmp\/dispatch-alerts\/alerts\.json/, 'the dispatcher hands unseen guard events to the card step')
  // The mute guard must read the variable the step actually injects — a bare
  // vars.* name in bash is always empty, and a dead guard would let the muted
  // path silently ledger-consume undelivered alerts.
  const alertStepSource = workflowSource('translation-dispatcher.yml').split('- name: Send dispatcher guard alerts')[1].split('- name:')[0]
  assert.match(alertStepSource, /if \[\[ "\$\{FEISHU_NOTIFICATIONS_DISABLED:-\}" == "true" \|\| "\$\{FEISHU_NOTIFICATIONS_DISABLED:-\}" == "1" \]\]/, 'the mute guard reads the injected mute variable')
  assert.doesNotMatch(alertStepSource, /TRANSLATION_DISPATCHER_ALERTS_DISABLED:-\}/, 'vars.* names never reach bash without an env mapping')
  assert.match(alertStepSource, /leaving the dedup ledger unmarked so unmute replays them/, 'muting must skip ledger marking: report-card exits 0 without delivering while muted')
})

test('comma group selectors stay subset-strict in the canonical order', () => {
  const {buildTranslationSelection} = require('../translation/selection')
  const subset = buildTranslationSelection({locale: 'all', group: 'java,guides'})
  assert.deepEqual(subset.map(item => `${item.target}/${item.group}`), ['ja-JP/guides', 'ja-JP/java', 'zh-CN-reference/java'], 'selection follows canonical order regardless of selector order')
  assert.deepEqual(subset.map(item => item.publicationOrder), [0, 1, 2], 'subset publication order is renumbered')
  assert.throws(() => buildTranslationSelection({locale: 'all', group: 'guides,nope'}), /Unsupported translation selection/)
  assert.throws(() => buildTranslationSelection({locale: 'all', group: 'guides,reference-landings'}), /Unsupported translation selection/, 'landings stay a single-token selector')
  assert.deepEqual(
    buildTranslationSelection({locale: 'all', group: 'guides,'}).map(item => `${item.target}/${item.group}`),
    ['ja-JP/guides'],
    'empty tokens normalize away, matching parseSelectedGroups',
  )
})

test('a capped pending set stays batch-identifiable across independent rebuilds', () => {
  const {createBatchSummary, selectManifestBatch} = require('../translation/batches')
  const manifestOf = (count) => ({target: 'ja-JP', group: 'guides', items: Array.from({length: count}, (_, index) => ({sourcePath: `content/en/guides/page-${index}.md`, reason: 'stale_source'}))})
  // Prepare side: manifest.js --max-files 150 slices a 300-file pending set.
  const prepared = createBatchSummary(manifestOf(150), 15)
  assert.equal(prepared.pendingCount, 150)
  assert.equal(prepared.batchCount, 10)
  // Batch side rebuilds the SAME capped set (identical cap) — the identity
  // matches and batch 0 selects cleanly.
  const rebuilt = selectManifestBatch(manifestOf(150), {batchIndex: 0, batchSize: 15, expectedPendingSetSha256: prepared.pendingSetSha256})
  assert.equal(rebuilt.items.length, 15)
  // A rebuild with a DIFFERENT effective cap (the regression this pins: one
  // side gating on mode, the other not) fails closed on the identity check.
  assert.throws(
    () => selectManifestBatch(manifestOf(300), {batchIndex: 0, batchSize: 15, expectedPendingSetSha256: prepared.pendingSetSha256}),
    /pending set identity mismatch/,
  )
})
