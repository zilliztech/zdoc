'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {execFileSync} = require('node:child_process');

const {
  bootstrapStatus,
  inspectSync,
  isDevOwned,
  loadContract,
  pathMatches,
  validateContract,
  verifySyncCandidate,
} = require('./master-tooling-sync');

const repositoryRoot = path.resolve(__dirname, '../..');
const contract = loadContract({cwd: repositoryRoot});
const inventoryPath = 'deploy/contracts/localization-inputs.inventory.json';

function contractInput(overrides = {}) {
  return {
    schemaVersion: contract.schemaVersion,
    enabled: contract.enabled,
    targetBranch: contract.targetBranch,
    syncBranchPrefix: contract.syncBranchPrefix,
    validationWorkflow: contract.validationWorkflow,
    devOwnedPaths: [...contract.devOwnedPaths],
    masterAuthoritativePaths: [...contract.masterAuthoritativePaths],
    candidateDerivedPaths: [inventoryPath],
    ...overrides,
  };
}

const derivedContract = Object.freeze({
  ...contract,
  candidateDerivedPaths: Object.freeze([inventoryPath]),
});

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function write(root, relative, contents) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, contents);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-master-tooling-sync-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'config', 'user.email', 'test@example.com');
  write(root, 'scripts/tool.js', 'base\n');
  write(root, 'content/en/page.md', 'base\n');
  write(root, 'config/reference-retirements.json', '{"schemaVersion":1}\n');
  write(root, inventoryPath, `${JSON.stringify({schemaVersion: 1, paths: ['content/en/page.md']}, null, 2)}\n`);
  write(root, 'deploy/contracts/master-tooling-sync.json', JSON.stringify(contract));
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'base');
  const base = git(root, 'rev-parse', 'HEAD');
  git(root, 'branch', 'dev');
  return {root, base};
}

function fixtureInventoryBytes(root) {
  const paths = git(root, 'ls-files', '-z', '--', 'content/en')
    .split('\0')
    .filter(Boolean)
    .sort();
  return `${JSON.stringify({schemaVersion: 1, paths}, null, 2)}\n`;
}

function checkFixtureInventory(root) {
  const current = fs.existsSync(path.join(root, inventoryPath))
    ? fs.readFileSync(path.join(root, inventoryPath), 'utf8')
    : '';
  if (current !== fixtureInventoryBytes(root)) {
    throw new Error('Localization input inventory is stale; run fixture inventory generation');
  }
}

function commit(root, branch, relative, contents, message) {
  git(root, 'switch', '-q', branch);
  write(root, relative, contents);
  git(root, 'add', relative);
  git(root, 'commit', '-qm', message);
  return git(root, 'rev-parse', 'HEAD');
}

test('matches repository roots without matching sibling prefixes', () => {
  assert.equal(pathMatches('content/en/page.md', 'content'), true);
  assert.equal(pathMatches('content-other/page.md', 'content'), false);
  assert.equal(pathMatches('config/reference-retirements.json', 'config/reference-retirements.json'), true);
});

test('validates the exact candidate-derived ownership contract', () => {
  const validated = validateContract(contractInput());
  assert.deepEqual(validated.candidateDerivedPaths, [inventoryPath]);

  const missing = contractInput();
  delete missing.candidateDerivedPaths;
  assert.throws(() => validateContract(missing), /keys must be exactly.*candidateDerivedPaths/);
  assert.throws(() => validateContract({...contractInput(), unexpected: true}), /keys must be exactly/);
  assert.throws(() => validateContract(contractInput({candidateDerivedPaths: [inventoryPath, inventoryPath]})), /must not contain duplicates/);
  assert.throws(() => validateContract(contractInput({candidateDerivedPaths: ['../inventory.json']})), /unsafe repository path/);
  assert.throws(() => validateContract(contractInput({candidateDerivedPaths: ['deploy/contracts']})), /explicitly supported candidate-derived files/);
  assert.throws(() => validateContract(contractInput({candidateDerivedPaths: ['content/generated.json']})), /overlaps dev ownership/);
  assert.throws(() => validateContract(contractInput({candidateDerivedPaths: ['config/reference-retirements.json']})), /overlaps master-authoritative ownership/);
});

test('accepts a normal tooling merge while preserving dev content byte-for-byte', () => {
  const {root} = fixture();
  const dev = commit(root, 'dev', 'content/en/page.md', 'dev content\n', 'publish content');
  const tooling = commit(root, 'master', 'scripts/tool.js', 'new tooling\n', 'update tooling');
  git(root, 'switch', '-q', 'dev');
  git(root, 'merge', '-q', '--no-ff', '-m', 'merge tooling', tooling);
  const candidate = git(root, 'rev-parse', 'HEAD');
  const inspected = inspectSync({cwd: root, devSha: dev, toolingSha: tooling, contract});
  assert.equal(inspected.needsSync, true);
  assert.deepEqual(inspected.toolingChanges, ['scripts/tool.js']);
  const verified = verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: candidate, contract});
  assert.deepEqual(verified.changedDevOwned, []);
  assert.deepEqual(verified.changedToolingOwned, []);
  assert.equal(fs.readFileSync(path.join(root, 'content/en/page.md'), 'utf8'), 'dev content\n');
});

test('accepts only declared candidate-derived inventory while retaining both ownership boundaries', () => {
  const {root} = fixture();
  const dev = commit(root, 'dev', 'content/en/dev-only.md', 'dev content\n', 'publish content');
  const tooling = commit(root, 'master', 'scripts/tool.js', 'new tooling\n', 'update tooling');
  git(root, 'switch', '-q', 'dev');
  git(root, 'merge', '-q', '--no-ff', '--no-commit', tooling);

  assert.throws(() => checkFixtureInventory(root), /inventory is stale/);
  write(root, inventoryPath, fixtureInventoryBytes(root));
  checkFixtureInventory(root);
  git(root, 'add', inventoryPath);
  git(root, 'commit', '-qm', 'merge tooling with derived inventory');
  const candidate = git(root, 'rev-parse', 'HEAD');
  const verified = verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: candidate, contract: derivedContract});
  assert.deepEqual(verified.changedDevOwned, []);
  assert.deepEqual(verified.changedToolingOwned, []);

  git(root, 'switch', '-q', '-c', 'bad-tooling', candidate);
  write(root, 'scripts/tool.js', 'candidate tooling\n');
  git(root, 'add', 'scripts/tool.js');
  git(root, 'commit', '-qm', 'mutate tooling');
  assert.throws(
    () => verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: git(root, 'rev-parse', 'HEAD'), contract: derivedContract}),
    /does not match master outside dev-owned paths: scripts\/tool\.js/,
  );

  git(root, 'switch', '-q', '-c', 'bad-content', candidate);
  write(root, 'content/en/dev-only.md', 'candidate content\n');
  git(root, 'add', 'content/en/dev-only.md');
  git(root, 'commit', '-qm', 'mutate content');
  assert.throws(
    () => verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: git(root, 'rev-parse', 'HEAD'), contract: derivedContract}),
    /changes dev-owned paths: content\/en\/dev-only\.md/,
  );

  git(root, 'switch', '-q', '-c', 'forged-derived', candidate);
  write(root, inventoryPath, '{"schemaVersion":1,"paths":[]}\n');
  git(root, 'add', inventoryPath);
  git(root, 'commit', '-qm', 'forge derived inventory');
  verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: git(root, 'rev-parse', 'HEAD'), contract: derivedContract});
  assert.throws(() => checkFixtureInventory(root), /inventory is stale/);

  git(root, 'switch', '-q', '-c', 'deleted-derived', candidate);
  git(root, 'rm', '-q', inventoryPath);
  git(root, 'commit', '-qm', 'delete derived inventory');
  verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: git(root, 'rev-parse', 'HEAD'), contract: derivedContract});
  assert.throws(() => checkFixtureInventory(root), /inventory is stale/);
});

test('rejects master history that modifies dev-owned content', () => {
  const {root, base} = fixture();
  const tooling = commit(root, 'master', 'content/en/page.md', 'wrong owner\n', 'modify content from master');
  assert.throws(
    () => inspectSync({cwd: root, devSha: base, toolingSha: tooling, contract}),
    /modifies dev-owned paths: content\/en\/page\.md/,
  );
});

test('treats preserved landing pages as master-authoritative despite living under content/', () => {
  assert.equal(isDevOwned('content/en/reference/api/cpp/cpp/cpp.md', contract), false);
  assert.equal(isDevOwned('content/en/page.md', contract), true);

  const {root, base} = fixture();
  const tooling = commit(root, 'master', 'content/en/reference/api/cpp/cpp/cpp.md', 'new landing\n', 'update landing page');
  const inspected = inspectSync({cwd: root, devSha: base, toolingSha: tooling, contract});
  assert.deepEqual(inspected.forbiddenToolingChanges, []);
  assert.deepEqual(inspected.toolingChanges, ['content/en/reference/api/cpp/cpp/cpp.md']);
});

test('rejects merge resolutions that change dev-owned content or retain dev tooling', () => {
  const first = fixture();
  const dev = commit(first.root, 'dev', 'content/en/page.md', 'dev content\n', 'publish content');
  const tooling = commit(first.root, 'master', 'scripts/tool.js', 'master tooling\n', 'update tooling');
  git(first.root, 'switch', '-q', 'dev');
  git(first.root, 'merge', '-q', '--no-ff', '-m', 'merge tooling', tooling);
  write(first.root, 'content/en/page.md', 'mutated candidate\n');
  git(first.root, 'add', '.');
  git(first.root, 'commit', '-qm', 'bad content resolution');
  assert.throws(
    () => verifySyncCandidate({cwd: first.root, devSha: dev, toolingSha: tooling, candidateSha: git(first.root, 'rev-parse', 'HEAD'), contract}),
    /changes dev-owned paths/,
  );

  const second = fixture();
  const secondDev = commit(second.root, 'dev', 'scripts/tool.js', 'dev tooling\n', 'diverge tooling');
  const secondTooling = commit(second.root, 'master', 'config/reference-retirements.json', '{"schemaVersion":2}\n', 'update retirements');
  git(second.root, 'switch', '-q', 'dev');
  git(second.root, 'merge', '-q', '--no-ff', '-m', 'merge tooling', secondTooling);
  assert.throws(
    () => verifySyncCandidate({cwd: second.root, devSha: secondDev, toolingSha: secondTooling, candidateSha: git(second.root, 'rev-parse', 'HEAD'), contract}),
    /does not match master outside dev-owned paths: scripts\/tool\.js/,
  );
});

test('treats the retirement registry as master-authoritative and requires bootstrap on dev', () => {
  const {root, base} = fixture();
  assert.equal(bootstrapStatus({cwd: root, devSha: base, contract}).bootstrapped, true);
  git(root, 'switch', '-q', 'dev');
  const legacyContract = JSON.parse(JSON.stringify(contract));
  delete legacyContract.candidateDerivedPaths;
  write(root, 'deploy/contracts/master-tooling-sync.json', JSON.stringify(legacyContract));
  git(root, 'add', 'deploy/contracts/master-tooling-sync.json');
  git(root, 'commit', '-qm', 'retain the enabled pre-derived bootstrap contract');
  assert.equal(bootstrapStatus({cwd: root, devSha: git(root, 'rev-parse', 'HEAD'), contract}).bootstrapped, true);
  git(root, 'rm', '-q', 'deploy/contracts/master-tooling-sync.json');
  git(root, 'commit', '-qm', 'pre-bootstrap dev');
  assert.equal(bootstrapStatus({cwd: root, devSha: git(root, 'rev-parse', 'HEAD'), contract}).bootstrapped, false);
  const tooling = commit(root, 'master', 'config/reference-retirements.json', '{"schemaVersion":2}\n', 'update retirements');
  const inspected = inspectSync({cwd: root, devSha: base, toolingSha: tooling, contract});
  assert.deepEqual(inspected.toolingChanges, ['config/reference-retirements.json']);
});
