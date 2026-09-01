import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import test from 'node:test';
import yaml from 'js-yaml';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');
const require = createRequire(import.meta.filename);

// CJS bridge to the TypeScript workflow-unit registry. print-workflow-groups.js
// is a CLI that only prints, so reach through its shared loader instead:
// scripts/lib/load-typescript.js loads workflowUnits.ts (jiti), which is where
// fetchUnitDefinitions()/sdkGroupIds() actually live.
const {loadTypeScript} = require(path.join(repositoryRoot, 'scripts/lib/load-typescript.js'));
const workflowUnits = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/workflowUnits.ts');
const {artifactNames} = require(path.join(repositoryRoot, 'scripts/docs-workflow/publication-contracts.js'));

async function workflowSource(name) {
  return readFile(path.join(repositoryRoot, '.github/workflows', name), 'utf8');
}

test('every fetch producer resolves to a job or the SDK matrix, which tolerates independent group failure', async () => {
  const source = await workflowSource('fetch-docs.yml');
  const workflow = yaml.load(source);
  const sdkGroups = new Set(workflowUnits.sdkGroupIds());

  for (const definition of workflowUnits.fetchUnitDefinitions()) {
    if (sdkGroups.has(definition.group) && definition.unitKey === `source/${definition.group}`) continue; // matrixized below
    assert.ok(workflow.jobs[definition.producerJob], `fetch producer job ${definition.producerJob} for ${definition.unitKey} is missing`);
  }
  assert.ok(workflow.jobs.produce_guides, 'static produce_guides job must exist');
  assert.ok(workflow.jobs.produce_zh_guides, 'static produce_zh_guides job must exist');
  assert.ok(workflow.jobs['publish_rest_zh-CN'], 'static publish_rest_zh-CN job must exist');

  const sdkMatrix = workflow.jobs.produce_sdk_reference;
  assert.equal(sdkMatrix.name, 'produce_${{ matrix.group }}');
  assert.equal(sdkMatrix.strategy.matrix.group, '${{ fromJSON(needs.prepare.outputs.selected_sdk_groups) }}');
  assert.equal(sdkMatrix.with.publication_unit_key, 'source/${{ matrix.group }}');
  assert.equal(sdkMatrix.with.site, 'en');
  assert.equal(sdkMatrix.strategy['fail-fast'], false, 'one SDK group failing must not cancel its producer siblings');
  assert.match(source, /print-workflow-groups\.js --selected-sdk-groups-json "\$SELECTED_GROUP"/);
});

test('Fetch checkpoint and selection artifact names match the publication contracts', async () => {
  const fetchSource = await workflowSource('fetch-docs.yml');
  const contentGroupSource = await workflowSource('_fetch-content-group.yml');
  const selectionSource = await readFile(path.join(repositoryRoot, 'scripts/docs-workflow/fetch-publication-selection.js'), 'utf8');
  const contentGroup = yaml.load(contentGroupSource);

  // _fetch-content-group.yml strips the source/ prefix into checkpoint_group and
  // names the checkpoint artifact docs-checkpoint-<group>-<run_id>; the selection
  // script's checkpointArtifactName slices the same prefix.
  const produce = contentGroup.jobs.produce;
  assert.equal(produce.outputs.artifact_name, "${{ format('docs-checkpoint-{0}-{1}', steps.paths.outputs.checkpoint_group, github.run_id) }}");
  assert.match(contentGroupSource, /checkpoint_group="\$\{unit_key#source\/\}"/);
  const checkpointUpload = produce.steps.find(step => step.id === 'checkpoint_upload');
  assert.equal(checkpointUpload.with.name, 'docs-checkpoint-${{ steps.paths.outputs.checkpoint_group }}-${{ github.run_id }}');
  assert.match(selectionSource, /function checkpointArtifactName\(unitKey, runId\) \{[\s\S]*const suffix = unitKey\.slice\('source\/'\.length\)[\s\S]*return `docs-checkpoint-\$\{suffix\}-\$\{runId\}`/);

  // The fetch workflow's selection artifact must equal artifactNames().selection.
  assert.equal(artifactNames({workflow: 'fetch', runId: 123, runAttempt: 2, unitKey: 'source/java', revision: 7}).selection, 'publication-selection-fetch-123-2');
  assert.match(fetchSource, /artifact_name="publication-selection-fetch-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT"/);
  assert.match(fetchSource, /name: publication-selection-fetch-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/);
});

test('Fetch dependency graph is acyclic and gates publication on reconciliation preflight', async () => {
  const source = await workflowSource('fetch-docs.yml');
  const workflow = yaml.load(source);
  const jobNames = new Set(Object.keys(workflow.jobs));
  for (const [name, job] of Object.entries(workflow.jobs)) {
    for (const need of [].concat(job.needs || [])) {
      assert.ok(jobNames.has(need), `${name} needs missing job ${need}`);
    }
  }
  assert.deepEqual(workflow.jobs.publish_ready.needs, ['prepare', 'reconciliation_preflight']);
  assert.deepEqual(workflow.jobs.reconcile_reference_state.needs, ['prepare', 'publish_ready']);
  assert.match(String(workflow.jobs.reconcile_reference_state.if), /always\(\)/);
  assert.deepEqual(workflow.jobs.publish_ready.permissions, {actions: 'read', contents: 'write'});
});

test('Translation producer naming, checkpoint, and ready artifact names match the publication contracts', async () => {
  const translateSource = await workflowSource('translate-codex.yml');
  const translateGroupSource = await workflowSource('_translate-content-group.yml');
  const selectionSource = await readFile(path.join(repositoryRoot, 'scripts/docs-workflow/translation-publication-selection.js'), 'utf8');
  const translateWorkflow = yaml.load(translateSource);
  const translateGroup = yaml.load(translateGroupSource);

  // translate_sdk name == selection producerJob for non-guides units.
  assert.equal(translateWorkflow.jobs.translate_sdk.name, 'translate:${{ matrix.target }}/${{ matrix.group }}');
  assert.match(selectionSource, /producerJob: guides \? 'prepare_guides_publication_ready' : `translate:\$\{handoffUnit\.target\}\/\$\{handoffUnit\.group\}`/);
  assert.ok(translateWorkflow.jobs.prepare_guides_publication_ready, 'prepare_guides_publication_ready job must exist');

  // Checkpoint/baseline names == selection aggregate artifact names.
  assert.match(selectionSource, /checkpoint: `translation-checkpoint-\$\{handoffUnit\.target\}-\$\{handoffUnit\.group\}-\$\{input\.runId\}`/);
  assert.match(selectionSource, /baseline: `translation-baseline-\$\{handoffUnit\.target\}-\$\{handoffUnit\.group\}-\$\{input\.runId\}`/);
  assert.match(translateGroupSource, /const checkpoint = `translation-checkpoint-\$\{selected\.target\}-\$\{selected\.group\}-\$\{selection\.runId\}`/);
  assert.match(translateGroupSource, /const baseline = `translation-baseline-\$\{selected\.target\}-\$\{selected\.group\}-\$\{selection\.runId\}`/);
  const steps = translateGroup.jobs.translate.steps;
  assert.equal(steps.find(step => step.id === 'translation_upload').with.name, "translation-checkpoint-${{ inputs.target }}-${{ inputs.group }}-${{ github.run_id }}${{ env.ARTIFACT_SUFFIX }}");
  assert.equal(steps.find(step => step.id === 'baseline_upload').with.name, "translation-baseline-${{ inputs.target }}-${{ inputs.group }}-${{ github.run_id }}${{ env.ARTIFACT_SUFFIX }}");

  // Ready descriptor name == artifactNames({workflow:'translation'}).ready with the unit token.
  assert.equal(artifactNames({workflow: 'translation', runId: 123, runAttempt: 1, unitKey: 'translation/ja-JP/guides', revision: 1}).ready, 'publication-ready-translation-translation-ja-JP-guides-123-1');
  const readyStep = steps.find(step => step.id === 'publication_ready');
  assert.ok(readyStep.run.includes('unit_token=${PUBLICATION_UNIT_KEY//\\//-}'));
  assert.match(readyStep.run, /artifact_name=publication-ready-translation-\$unit_token-\$GITHUB_RUN_ID-\$GITHUB_RUN_ATTEMPT/);

  assert.equal(translateWorkflow.jobs.translate_guides_batches.strategy['max-parallel'], 1);
  assert.equal(translateWorkflow.jobs.translate_guides_batches.strategy['fail-fast'], false);
  // Guides batches stay serial; publish_ready waits for both producers before starting its writer deadline.
  assert.deepEqual(translateWorkflow.jobs.publish_ready.needs, ['prepare', 'translate_sdk', 'prepare_guides_publication_ready']);
});
