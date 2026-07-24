import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

import {
  generateInventory,
  validateCapability,
  validateDependency,
  validateDependencies,
  validateLegacyEntry,
  validateManifest,
} from './inventory.mjs';

const validEntry = {
  sourceRepository: 'zdoc',
  sourcePath: 'docs/index.md',
  sourceCommit: 'a'.repeat(40),
  sourceBlobId: 'b'.repeat(40),
  disposition: 'defer',
  owner: 'content',
  evidence: 'Git tracked at the recorded source commit.',
};

const validCapability = {
  id: 'site.build',
  owner: 'app',
  consumers: ['maintainers'],
  contracts: ['A failed build exits nonzero.'],
  legacyEntryPoints: ['package.json#scripts.build'],
  replacementEntryPoints: ['apps/docs/package.json#scripts.build'],
  disposition: 'preserve',
  acceptanceEvidence: ['Future gate: pnpm build'],
};

const validDependency = {
  package: 'react',
  versionRange: '^18.0.0',
  sourceRepository: 'zdoc',
  sourcePackageManifest: 'package.json',
  dependencyClass: 'dependencies',
  owner: 'ui',
  capability: 'site.runtime',
  reviewStatus: 'pending',
};

test('rejects a migration entry without immutable source identity', () => {
  assert.throws(() => validateLegacyEntry({sourceRepository: 'zdoc', sourcePath: 'docs'}), /sourceCommit/);
});

test('rejects deferred entries in cutover mode', () => {
  assert.throws(() => validateManifest([{...validEntry, disposition: 'defer'}], {cutover: true}), /defer/);
});

test('requires every capability to name acceptance evidence', () => {
  assert.throws(() => validateCapability({...validCapability, acceptanceEvidence: []}), /acceptanceEvidence/);
});

test('validates repository IDs, paths, SHAs, blob IDs, owners, and dispositions', () => {
  for (const [field, value] of [
    ['sourceRepository', 'other'], ['sourcePath', '../escape'], ['sourceCommit', 'abc'],
    ['sourceBlobId', 'f'.repeat(39)], ['owner', 'unknown'], ['disposition', 'done'],
  ]) assert.throws(() => validateLegacyEntry({...validEntry, [field]: value}), new RegExp(field));
});

test('rejects duplicate source keys and nondeterministic manifest ordering', () => {
  assert.throws(() => validateManifest([validEntry, validEntry]), /duplicate/i);
  const later = {...validEntry, sourceRepository: 'zdoc_cn'};
  assert.throws(() => validateManifest([later, validEntry]), /sorted/i);
});

test('validates dependency records and deterministic ordering', () => {
  validateDependency(validDependency);
  assert.throws(() => validateDependency({...validDependency, reviewStatus: 'approved'}), /reviewStatus/);
  assert.throws(() => validateDependency({...validDependency, sourcePackageManifest: '/package.json'}), /sourcePackageManifest/);
  assert.throws(() => validateDependencies([validDependency, validDependency]), /duplicate/i);
  const later = {...validDependency, package: 'zod'};
  assert.throws(() => validateDependencies([later, validDependency]), /sorted/i);
});

test('generates tracked-only inventory with immutable Git identities and exclusions', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'inventory-'));
  spawnSync('git', ['init', '-q'], {cwd: root});
  spawnSync('git', ['config', 'user.email', 'test@example.com'], {cwd: root});
  spawnSync('git', ['config', 'user.name', 'Test'], {cwd: root});
  mkdirSync(path.join(root, 'docs'));
  mkdirSync(path.join(root, 'build'));
  writeFileSync(path.join(root, 'docs', 'index.md'), '# Docs\n');
  writeFileSync(path.join(root, 'build', 'tracked.txt'), 'excluded\n');
  writeFileSync(path.join(root, 'untracked.txt'), 'not inventoried\n');
  writeFileSync(path.join(root, 'package.json'), '{"dependencies":{"react":"^18"}}\n');
  spawnSync('git', ['add', 'docs/index.md', 'build/tracked.txt', 'package.json'], {cwd: root});
  spawnSync('git', ['commit', '-qm', 'fixture'], {cwd: root});
  const result = generateInventory({repositories: [{id: 'zdoc', root}]});
  assert.deepEqual(result.legacyFiles.map(entry => entry.sourcePath), ['docs/index.md', 'package.json']);
  assert.match(result.legacyFiles[0].sourceCommit, /^[0-9a-f]{40}$/);
  assert.match(result.legacyFiles[0].sourceBlobId, /^[0-9a-f]{40}$/);
  assert.equal(result.dependencies[0].reviewStatus, 'pending');
});
