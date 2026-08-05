import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import yaml from 'js-yaml';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');

test('master tooling sync uses a reviewed bootstrap and the shared dev writer lock', async () => {
  const source = await readFile(path.join(repositoryRoot, '.github/workflows/sync-master-tooling-to-dev.yml'), 'utf8');
  const workflow = yaml.load(source);
  assert.deepEqual(workflow.on.push.branches, ['master']);
  assert.deepEqual(workflow.on.schedule, [{cron: '17 */6 * * *'}]);
  assert.equal(workflow.on.workflow_dispatch.inputs.tooling_sha.required, true);
  assert.deepEqual(workflow.permissions, {actions: 'write', contents: 'write', 'pull-requests': 'write'});
  assert.deepEqual(workflow.concurrency, {group: 'docs-production-dev', queue: 'max'});
  assert.match(source, /master-tooling-sync\.js bootstrap[\s\S]*steps\.bootstrap\.outputs\.bootstrapped == 'true'/);
  assert.match(source, /SYNC_BRANCH_PREFIX: \$\{\{ steps\.bootstrap\.outputs\.sync_branch_prefix \}\}/);
  assert.match(source, /VALIDATION_WORKFLOW: \$\{\{ steps\.bootstrap\.outputs\.validation_workflow \}\}/);
  assert.match(source, /git merge-base --is-ancestor "\$tooling_sha" origin\/master/);
  assert.doesNotMatch(source, /push --force|push -f|--force-with-lease/);
});

test('the production dev publication queue contract documents operational behavior', async () => {
  const readme = await readFile(path.join(repositoryRoot, 'deploy/contracts/README.md'), 'utf8');
  assert.match(readme, /docs-production-dev/);
  assert.match(readme, /100 pending/i);
  assert.match(readme, /no priority|does not prioritize/i);
  assert.match(readme, /tooling.*wait.*Fetch|tooling.*wait.*Translation/is);
  assert.match(readme, /manually cancel/i);
  assert.match(readme, /one exact `dev` commit/i);
});

test('scheduled tooling sync resolves the current master SHA without dispatch inputs', async () => {
  const source = await readFile(path.join(repositoryRoot, '.github/workflows/sync-master-tooling-to-dev.yml'), 'utf8');
  assert.match(source, /GITHUB_EVENT_NAME" == workflow_dispatch[\s\S]*tooling_sha="\$REQUESTED_TOOLING_SHA"/);
  assert.match(source, /GITHUB_EVENT_NAME" == push[\s\S]*tooling_sha="\$GITHUB_SHA"/);
  assert.match(source, /tooling_sha=\$\(git rev-parse origin\/master\)/);
});

test('merge candidate receives the reviewed sync branch prefix', async () => {
  const source = await readFile(path.join(repositoryRoot, '.github/workflows/sync-master-tooling-to-dev.yml'), 'utf8');
  const workflow = yaml.load(source);
  const compose = workflow.jobs.sync.steps.find(step => step.id === 'compose');
  assert.equal(compose.env.SYNC_BRANCH_PREFIX, '${{ steps.bootstrap.outputs.sync_branch_prefix }}');
});

test('master tooling sync validates exact ownership, both sites, and dev identity before merge', async () => {
  const source = await readFile(path.join(repositoryRoot, '.github/workflows/sync-master-tooling-to-dev.yml'), 'utf8');
  const workflow = yaml.load(source);
  const steps = workflow.jobs.sync.steps;
  const indexOf = name => steps.findIndex(step => step.name === name);
  const compose = steps.find(step => step.name === 'Compose exact merge candidate');
  const derived = steps.find(step => step.name === 'Generate and verify candidate-derived files');
  const focused = steps.find(step => step.name === 'Run focused candidate validation');
  const push = steps.find(step => step.name === 'Push immutable candidate and create PR');
  const dispatch = steps.find(step => step.name === 'Dispatch exact-candidate site validation');
  const merge = steps.find(step => step.name === 'Recheck dev identity and merge the validated PR');
  assert.match(source, /git merge --no-ff --no-commit "\$TOOLING_SHA"/);
  assert.ok(indexOf('Compose exact merge candidate') < indexOf('Install candidate tooling'));
  assert.ok(indexOf('Set up Node.js') < indexOf('Generate and verify candidate-derived files'));
  assert.ok(indexOf('Generate and verify candidate-derived files') < indexOf('Run focused candidate validation'));
  assert.ok(indexOf('Run focused candidate validation') < indexOf('Push immutable candidate and create PR'));
  assert.doesNotMatch(compose.run, /master-tooling-sync\.js verify|candidate_sha=/);
  assert.match(derived.run, /pnpm install --frozen-lockfile[\s\S]*pnpm generate:localization-input-inventory[\s\S]*pnpm check:localization-input-inventory/);
  assert.match(derived.run, /git add -- deploy\/contracts\/localization-inputs\.inventory\.json[\s\S]*git commit --amend --no-edit/);
  assert.ok(derived.run.indexOf('git commit --amend --no-edit') < derived.run.indexOf('candidate_sha=$(git rev-parse HEAD)'));
  assert.match(derived.run, /candidate_sha=\$\(git rev-parse HEAD\)[\s\S]*master-tooling-sync\.js verify[\s\S]*--candidate-sha "\$candidate_sha"/);
  assert.match(focused.run, /pnpm check:localization-input-inventory/);
  assert.match(source, /validate-revision-inventory --site en/);
  assert.equal(push.env.CANDIDATE_SHA, '${{ steps.candidate.outputs.candidate_sha }}');
  assert.match(push.run, /test "\$\(git rev-parse HEAD\)" = "\$CANDIDATE_SHA"[\s\S]*git push origin "HEAD:refs\/heads\/\$SYNC_BRANCH"/);
  assert.equal(dispatch.env.CANDIDATE_SHA, '${{ steps.candidate.outputs.candidate_sha }}');
  assert.match(dispatch.run, /gh workflow run "\$VALIDATION_WORKFLOW"[\s\S]*-f site=all[\s\S]*-f source_ref="\$CANDIDATE_SHA"/);
  assert.match(source, /gh run watch "\$validation_run_id" --exit-status/);
  assert.equal((source.match(/test "\$\(git rev-parse origin\/dev\)" = "\$DEV_SHA"/g) || []).length, 2);
  assert.equal(merge.env.CANDIDATE_SHA, '${{ steps.candidate.outputs.candidate_sha }}');
  assert.match(merge.run, /headRefOid[\s\S]*= "\$CANDIDATE_SHA"[\s\S]*gh pr merge "\$PR_URL" --merge --delete-branch --match-head-commit "\$CANDIDATE_SHA"/);
  assert.doesNotMatch(source, /git push origin [^\n]*refs\/heads\/dev/);
});

test('the ownership contract covers every generated publication root and keeps retirements master-authoritative', async () => {
  const contract = JSON.parse(await readFile(path.join(repositoryRoot, 'deploy/contracts/master-tooling-sync.json'), 'utf8'));
  for (const root of [
    '.translation-cache',
    'content',
    'generated',
    'i18n',
    'packages/docs-tooling/src/lark/meta/assembly',
    'packages/docs-tooling/src/lark/meta/reports',
    'packages/docs-tooling/src/lark/meta/snapshots',
    'sidebar-overrides/en',
  ]) assert.ok(contract.devOwnedPaths.includes(root), `missing dev-owned root: ${root}`);
  assert.deepEqual(contract.masterAuthoritativePaths, ['config/reference-retirements.json']);
  assert.deepEqual(contract.candidateDerivedPaths, ['deploy/contracts/localization-inputs.inventory.json']);
});

test('the synchronization specification defines candidate-derived ownership and final candidate identity', async () => {
  const specification = await readFile(path.join(repositoryRoot, '.claude/specs/2026-08-03-master-tooling-dev-sync.md'), 'utf8');
  assert.match(specification, /candidate-derived/i);
  assert.match(specification, /localization-inputs\.inventory\.json/);
  assert.match(specification, /regenerat[ei][\s\S]*exact merge candidate/i);
  assert.match(specification, /amend[\s\S]*merge commit/i);
  assert.match(specification, /final candidate SHA/i);
});
