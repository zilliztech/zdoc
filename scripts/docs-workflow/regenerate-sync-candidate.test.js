'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {execFileSync} = require('node:child_process');

const {loadContract, verifySyncCandidate} = require('./master-tooling-sync');
const {
  RECONCILE_COMMIT_SUBJECT,
  RECONCILE_DERIVED_PATHS,
  REST_DERIVED_PATHS,
  regenerateSyncCandidate,
} = require('./regenerate-sync-candidate');

const repositoryRoot = path.resolve(__dirname, '../..');
const contract = loadContract({cwd: repositoryRoot});

const EN_PAGE = 'content/en/reference/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
const EN_NEW_PAGE = 'content/en/reference/api/restful/restful/v2/control-plane/project-operations-v2/describe-project-v2.mdx';
const ZH_PAGE = 'content/zh-CN/reference/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
const JA_PAGE = 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
const PRESERVED_PAGE = 'content/en/reference/api/restful/restful/restful.md';
const FRAGMENT = 'packages/docs-tooling/src/reference/rest/meta/openapi/21-project-operations-v2.json';
const INVENTORY = 'deploy/contracts/localization-inputs.inventory.json';
const EN_REFERENCE_MANIFEST = 'generated/en/manifests/reference.json';
const ZH_REFERENCE_MANIFEST = 'generated/zh-CN/manifests/reference-translations.json';
const REST_MANIFESTS = Object.freeze(['en', 'ja-JP', 'zh-CN'].map(locale => `generated/${locale}/manifests/rest-derivation.json`));
const ENVIRONMENT = Object.freeze({
  DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER: 'packages/docs-tooling/providers/aliyun-oss-validator.mjs',
  IMAGE_BED_URL: 'https://example.invalid',
});

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function write(root, relative, contents) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, contents);
}

function commitAll(root, message) {
  git(root, 'add', '-A');
  git(root, 'commit', '-qm', message);
  return git(root, 'rev-parse', 'HEAD');
}

// Mirrors the workflow's compose step: dev publication state plus one master
// fragment change, merged with --no-ff into a merge commit at HEAD.
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-regenerate-sync-candidate-'));
  git(root, 'init', '-q');
  git(root, 'symbolic-ref', 'HEAD', 'refs/heads/dev');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'config', 'user.email', 'test@example.com');
  write(root, 'scripts/tool.js', 'base\n');
  write(root, FRAGMENT, '{"plan":"Standard"}\n');
  write(root, EN_PAGE, 'en page\n');
  write(root, ZH_PAGE, 'zh page\n');
  write(root, JA_PAGE, 'ja page\n');
  write(root, PRESERVED_PAGE, 'preserved landing\n');
  write(root, 'generated/en/sidebars/restful.sidebar.js', 'module.exports = [];\n');
  write(root, 'generated/zh-CN/sidebars/restful.sidebar.js', 'module.exports = [];\n');
  for (const manifest of REST_MANIFESTS) write(root, manifest, '{"fragmentHashes":{"old":"1"}}\n');
  write(root, EN_REFERENCE_MANIFEST, '{"sourceCommit":"old"}\n');
  write(root, ZH_REFERENCE_MANIFEST, '{"sourceCommit":"old"}\n');
  write(root, INVENTORY, '{"schemaVersion":1,"paths":["i18n/ja-JP/a"]}\n');
  write(root, 'content/en/guides/page.md', 'guide\n');
  write(root, 'deploy/contracts/master-tooling-sync.json', JSON.stringify(contract));
  const dev = commitAll(root, 'dev state');

  git(root, 'switch', '-q', '-c', 'tooling');
  write(root, FRAGMENT, '{"plan":"BusinessCritical"}\n');
  const tooling = commitAll(root, 'docs(rest): change fragment');

  git(root, 'switch', '-q', 'dev');
  git(root, 'merge', '-q', '--no-ff', '-m', 'chore(dev): sync master tooling', tooling);
  return {root, dev, tooling, merge: git(root, 'rev-parse', 'HEAD')};
}

function isStage(step, site, stage) {
  return step.args.includes('publish-group') && step.args.includes(site) && step.args.includes(stage);
}

function fakeRunner(root, {pagesChange = true, inventoryChanges = true, extraWrite = null} = {}) {
  const calls = [];
  return {
    calls,
    run(step, options) {
      calls.push({command: step.command, args: [...step.args], env: options.env, cwd: options.cwd});
      if (isStage(step, 'en', 'publish')) {
        if (pagesChange) {
          write(root, EN_PAGE, 'en page with contact link\n');
          write(root, EN_NEW_PAGE, 'brand new en page\n');
          write(root, JA_PAGE, 'ja page with contact link\n');
        }
        write(root, 'generated/en/manifests/rest-derivation.json', `{"fragmentHashes":{"new":"2"},"toolingSha":"${options.env.ZDOC_REST_TOOLING_SHA}"}\n`);
        write(root, 'generated/ja-JP/manifests/rest-derivation.json', `{"fragmentHashes":{"new":"2"},"toolingSha":"${options.env.ZDOC_REST_TOOLING_SHA}"}\n`);
        if (extraWrite) write(root, extraWrite, 'out of scope\n');
      }
      if (isStage(step, 'zh-CN', 'publish')) {
        write(root, 'generated/zh-CN/manifests/rest-derivation.json', `{"fragmentHashes":{"new":"2"},"toolingSha":"${options.env.ZDOC_REST_TOOLING_SHA}"}\n`);
      }
      if (step.args.includes('reference-manifest')) {
        const sourceCommit = step.args[step.args.indexOf('--source-commit') + 1];
        assert.equal(sourceCommit, git(root, 'rev-parse', 'HEAD'), 'reference manifests must point at the committed REST candidate');
        write(root, EN_REFERENCE_MANIFEST, `{"sourceCommit":"${sourceCommit}"}\n`);
        write(root, ZH_REFERENCE_MANIFEST, `{"sourceCommit":"${sourceCommit}"}\n`);
      }
      if (step.args[0] === 'generate:localization-input-inventory' && inventoryChanges) {
        write(root, INVENTORY, '{"schemaVersion":1,"paths":["i18n/ja-JP/a","i18n/ja-JP/b"]}\n');
      }
    },
  };
}

function commandLines(calls) {
  return calls.map(call => `${call.command} ${call.args.join(' ')}`);
}

test('regenerates REST outputs into the amended merge commit and reconciles reference state in a child commit', () => {
  const {root, dev, tooling, merge} = fixture();
  const runner = fakeRunner(root);
  const result = regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract, environment: ENVIRONMENT, run: runner.run});

  const lines = commandLines(runner.calls);
  assert.deepEqual(lines.slice(0, 6), [
    'pnpm docs-tooling publish-group --site en --group rest --stage fetch',
    'pnpm docs-tooling publish-group --site en --group rest --stage validate',
    'pnpm docs-tooling publish-group --site en --group rest --stage publish',
    'pnpm docs-tooling publish-group --site zh-CN --group rest --stage fetch',
    'pnpm docs-tooling publish-group --site zh-CN --group rest --stage validate',
    'pnpm docs-tooling publish-group --site zh-CN --group rest --stage publish',
  ]);
  assert.equal(lines[6], `pnpm docs-tooling reference-manifest --source content/en/reference --target content/zh-CN/reference --source-commit ${result.restCandidateSha} --write`);
  assert.deepEqual(lines.slice(7), ['pnpm generate:localization-input-inventory', 'pnpm check:localization-input-inventory']);
  for (const call of runner.calls.slice(0, 6)) assert.equal(call.env.ZDOC_REST_TOOLING_SHA, tooling);
  for (const call of runner.calls.slice(6)) assert.equal(call.env.ZDOC_REST_TOOLING_SHA, undefined);

  assert.equal(result.mergeSha, merge);
  assert.notEqual(result.restCandidateSha, merge);
  assert.equal(result.referenceChanged, true);
  assert.ok(result.restChanges.includes(EN_NEW_PAGE), 'untracked generated pages are part of the REST candidate');
  assert.deepEqual(result.reconcileChanges, [INVENTORY, EN_REFERENCE_MANIFEST, ZH_REFERENCE_MANIFEST]);

  assert.equal(git(root, 'rev-parse', 'HEAD'), result.candidateSha);
  assert.equal(git(root, 'rev-parse', 'HEAD~1'), result.restCandidateSha);
  assert.deepEqual(git(root, 'rev-list', '--parents', '-n', '1', result.restCandidateSha).split(' ').slice(1).sort(), [dev, tooling].sort());
  assert.equal(git(root, 'log', '-1', '--format=%s', result.restCandidateSha), 'chore(dev): sync master tooling');
  assert.equal(git(root, 'log', '-1', '--format=%s', result.candidateSha), RECONCILE_COMMIT_SUBJECT);
  assert.match(git(root, 'log', '-1', '--format=%b', result.candidateSha), new RegExp(`REST-Candidate-SHA: ${result.restCandidateSha}`));
  assert.deepEqual(
    git(root, 'diff', '--name-only', `${result.restCandidateSha}..${result.candidateSha}`).split('\n').sort(),
    [INVENTORY, EN_REFERENCE_MANIFEST, ZH_REFERENCE_MANIFEST].sort(),
  );
  const restDiff = git(root, 'diff', '--name-only', `${dev}..${result.restCandidateSha}`).split('\n').sort();
  assert.deepEqual(restDiff, [FRAGMENT, EN_PAGE, EN_NEW_PAGE, JA_PAGE, ...REST_MANIFESTS].sort());
  assert.equal(git(root, 'status', '--porcelain', '--untracked-files=all'), '');
  assert.equal(fs.readFileSync(path.join(root, PRESERVED_PAGE), 'utf8'), 'preserved landing\n');

  const verified = verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: result.candidateSha, contract});
  assert.deepEqual(verified.changedDevOwned, []);
  assert.deepEqual(verified.changedToolingOwned, []);
});

test('skips reference reconciliation and the child commit when only derivation manifests change', () => {
  const {root, dev, tooling} = fixture();
  const runner = fakeRunner(root, {pagesChange: false, inventoryChanges: false});
  const result = regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract, environment: ENVIRONMENT, run: runner.run});

  const lines = commandLines(runner.calls);
  assert.equal(lines.some(line => line.includes('reference-manifest')), false);
  assert.deepEqual(lines.slice(-2), ['pnpm generate:localization-input-inventory', 'pnpm check:localization-input-inventory']);
  assert.equal(result.referenceChanged, false);
  assert.deepEqual(result.reconcileChanges, []);
  assert.equal(result.candidateSha, result.restCandidateSha);
  assert.deepEqual(git(root, 'rev-list', '--parents', '-n', '1', result.candidateSha).split(' ').slice(1).sort(), [dev, tooling].sort());
  assert.deepEqual(result.restChanges, [...REST_MANIFESTS].sort());
  verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: result.candidateSha, contract});
});

test('fails closed when regeneration touches paths outside the candidate-derived set', () => {
  const {root, dev, tooling, merge} = fixture();
  const runner = fakeRunner(root, {extraWrite: 'content/en/guides/page.md'});
  assert.throws(
    () => regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract, environment: ENVIRONMENT, run: runner.run}),
    /REST publication changed paths outside its candidate-derived set: content\/en\/guides\/page\.md/,
  );
  assert.equal(git(root, 'rev-parse', 'HEAD'), merge, 'nothing is committed when the gate fails');
});

test('requires the Chinese publication adapter environment and a clean composed candidate', () => {
  const {root, dev, tooling} = fixture();
  const runner = fakeRunner(root);
  assert.throws(
    () => regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract, environment: {IMAGE_BED_URL: 'https://example.invalid'}, run: runner.run}),
    /DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER is required/,
  );
  assert.throws(
    () => regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract, environment: {DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER: 'p.mjs'}, run: runner.run}),
    /IMAGE_BED_URL is required/,
  );
  assert.deepEqual(runner.calls, []);

  write(root, 'scripts/tool.js', 'dirty\n');
  assert.throws(
    () => regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract, environment: ENVIRONMENT, run: runner.run}),
    /not clean before regeneration: scripts\/tool\.js/,
  );
  assert.deepEqual(runner.calls, []);
});

test('requires the contract to declare every supported candidate-derived path and a candidate containing both parents', () => {
  const {root, dev, tooling} = fixture();
  const runner = fakeRunner(root);
  const partial = {...contract, candidateDerivedPaths: [INVENTORY]};
  assert.throws(
    () => regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract: partial, environment: ENVIRONMENT, run: runner.run}),
    /must declare every supported candidate-derived path/,
  );
  git(root, 'switch', '-q', '--detach', dev);
  assert.throws(
    () => regenerateSyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, contract, environment: ENVIRONMENT, run: runner.run}),
    /master tooling SHA is not contained in the merge candidate/,
  );
  assert.deepEqual(runner.calls, []);
});

test('phase path sets partition the contract exactly', () => {
  const phases = [...REST_DERIVED_PATHS, ...RECONCILE_DERIVED_PATHS].sort();
  assert.deepEqual(phases, [...contract.candidateDerivedPaths].sort());
  assert.equal(new Set(phases).size, phases.length);
});
