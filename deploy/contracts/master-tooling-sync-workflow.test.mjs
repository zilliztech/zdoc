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
  assert.deepEqual(workflow.concurrency, {group: 'docs-production-dev', 'cancel-in-progress': false});
  assert.match(source, /master-tooling-sync\.js bootstrap[\s\S]*steps\.bootstrap\.outputs\.bootstrapped == 'true'/);
  assert.match(source, /SYNC_BRANCH_PREFIX: \$\{\{ steps\.bootstrap\.outputs\.sync_branch_prefix \}\}/);
  assert.match(source, /VALIDATION_WORKFLOW: \$\{\{ steps\.bootstrap\.outputs\.validation_workflow \}\}/);
  assert.match(source, /git merge-base --is-ancestor "\$tooling_sha" origin\/master/);
  assert.doesNotMatch(source, /push --force|push -f|--force-with-lease/);
});

test('scheduled tooling sync resolves the current master SHA without dispatch inputs', async () => {
  const source = await readFile(path.join(repositoryRoot, '.github/workflows/sync-master-tooling-to-dev.yml'), 'utf8');
  assert.match(source, /GITHUB_EVENT_NAME" == workflow_dispatch[\s\S]*tooling_sha="\$REQUESTED_TOOLING_SHA"/);
  assert.match(source, /GITHUB_EVENT_NAME" == push[\s\S]*tooling_sha="\$GITHUB_SHA"/);
  assert.match(source, /tooling_sha=\$\(git rev-parse origin\/master\)/);
});

test('master tooling sync validates exact ownership, both sites, and dev identity before merge', async () => {
  const source = await readFile(path.join(repositoryRoot, '.github/workflows/sync-master-tooling-to-dev.yml'), 'utf8');
  assert.match(source, /git merge --no-ff --no-commit "\$TOOLING_SHA"/);
  assert.match(source, /master-tooling-sync\.js verify[\s\S]*--candidate-sha "\$candidate_sha"/);
  assert.match(source, /pnpm check:localization-input-inventory/);
  assert.match(source, /validate-revision-inventory --site en/);
  assert.match(source, /gh workflow run "\$VALIDATION_WORKFLOW"[\s\S]*-f site=all[\s\S]*-f source_ref="\$CANDIDATE_SHA"/);
  assert.match(source, /gh run watch "\$validation_run_id" --exit-status/);
  assert.equal((source.match(/test "\$\(git rev-parse origin\/dev\)" = "\$DEV_SHA"/g) || []).length, 2);
  assert.match(source, /gh pr merge "\$PR_URL" --merge --delete-branch --match-head-commit "\$CANDIDATE_SHA"/);
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
});
