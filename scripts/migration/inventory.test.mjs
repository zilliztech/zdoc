import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

import {
  generateInventory,
  lockedVersionFromLocator,
  resolveRepositoryPin,
  validateCapability,
  validateDependency,
  validateDependencies,
  validateLegacyEntry,
  validateManifest,
  validateOverlayCoverage,
  validateOverlayOperation,
} from './inventory.mjs';

const SHA = 'a'.repeat(40);
const validEntry = {
  sourceRepository: 'zdoc', sourcePath: 'docs/index.md', sourceCommit: SHA,
  sourceBlobId: 'b'.repeat(40), disposition: 'defer', owner: 'content',
  evidence: ['Git tracked at the recorded source commit.'],
};
const validCapability = {
  id: 'site.build', owner: 'app', consumers: ['maintainers'], contracts: ['Failures exit nonzero.'],
  legacyEntryPoints: ['package.json#scripts.build'], replacementEntryPoints: ['apps/docs/package.json#scripts.build'],
  disposition: 'preserve', acceptanceEvidence: ['Future gate: pnpm build'],
};
const validDependency = {
  package: 'react', requestedRange: '^18.0.0', lockedVersion: '18.3.1', lockLocator: '18.3.1',
  importingWorkspacePackage: 'zdoc-redesign', importingWorkspacePath: '.', usageClass: 'runtime',
  usageClassification: {status: 'classified', reason: 'Site/UI dependency shipped with the application.', evidence: ['capability=ui.runtime']},
  owner: 'ui', capability: 'site.runtime', reviewStatus: 'pending',
  licenseReview: {status: 'pending', license: 'unknown', evidence: ['License review required.']},
  vulnerabilityReview: {status: 'pending', evidence: ['Vulnerability review required.']},
  replacesLegacyDependency: 'zdoc:package.json:dependencies:react',
  sourceMapping: {sourceRepository: 'zdoc', sourceRevision: SHA, sourcePackageManifest: 'package.json', dependencyClass: 'dependencies', lockfilePath: 'pnpm-lock.yaml', resolutionStatus: 'resolved', evidence: ['Pinned lock importer.']},
};
const validOverlay = {
  id: 'copy:config=>config/zh-CN', type: 'copy', sourceRepository: 'zdoc_cn', sourceRevision: SHA,
  sourcePath: 'config', targetPath: 'config/zh-CN', optional: false, disposition: 'migrate', owner: 'site-config',
  trackedSourcePaths: ['config/site.js'], evidence: ['Pinned overlay manifest copy operation.'],
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

test('enforces approved legacy dispositions and evidence arrays', () => {
  for (const disposition of ['migrate', 'rewrite', 'retire', 'defer']) validateLegacyEntry({...validEntry, disposition});
  assert.throws(() => validateLegacyEntry({...validEntry, disposition: 'import'}), /disposition/);
  assert.throws(() => validateLegacyEntry({...validEntry, evidence: 'not-an-array'}), /evidence/);
});

test('validates repository IDs, paths, SHAs, blob IDs, owners, and dispositions', () => {
  for (const [field, value] of [['sourceRepository', 'other'], ['sourcePath', '../escape'], ['sourceCommit', 'abc'], ['sourceBlobId', 'f'.repeat(39)], ['owner', 'unknown'], ['disposition', 'done']]) {
    assert.throws(() => validateLegacyEntry({...validEntry, [field]: value}), new RegExp(field));
  }
});

test('rejects duplicate source keys and nondeterministic manifest ordering', () => {
  assert.throws(() => validateManifest([validEntry, validEntry]), /duplicate/i);
  assert.throws(() => validateManifest([{...validEntry, sourceRepository: 'zdoc_cn'}, validEntry]), /sorted/i);
});

test('validates operation-level overlay coverage including optional missing sources', () => {
  validateOverlayOperation(validOverlay);
  const manifest = {copy: [{from: 'config', to: 'config/zh-CN'}, {from: 'optional', to: 'optional/zh-CN', optional: true}], patches: [{path: 'patches/a.patch'}]};
  const operations = [
    validOverlay,
    {...validOverlay, id: 'copy:optional=>optional/zh-CN', sourcePath: 'optional', targetPath: 'optional/zh-CN', optional: true, trackedSourcePaths: []},
    {...validOverlay, id: 'patch:patches/a.patch', type: 'patch', sourcePath: 'patches/a.patch', targetPath: undefined, optional: false, disposition: 'rewrite', owner: 'tooling'},
  ].sort((a, b) => a.id.localeCompare(b.id));
  validateOverlayCoverage(operations, manifest);
  assert.throws(() => validateOverlayCoverage(operations.slice(1), manifest), /coverage/i);
});

test('checked migration ledger records clean-room Chinese adapter rewrites consistently', () => {
  const ledger = JSON.parse(readFileSync(path.resolve(process.cwd(), 'migration/legacy-files.json'), 'utf8'));
  for (const sourcePath of ['config/cn-publish-replacements.js', 'plugins/cn-publish-normalizer']) {
    const operation = ledger.overlayOperations.find(item => item.sourceRepository === 'zdoc_cn' && item.sourcePath === sourcePath);
    assert.equal(operation.disposition, 'rewrite');
    assert.equal(operation.owner, 'adapter');
    assert.match(operation.evidence.join('\n'), /not copied/i);
    const represented = ledger.entries.filter(item => item.sourceRepository === 'zdoc_cn' && (item.sourcePath === sourcePath || item.sourcePath.startsWith(`${sourcePath}/`)));
    assert.ok(represented.length > 0);
    assert.ok(represented.every(item => item.disposition === 'rewrite' && item.owner === 'adapter'));
  }
});

test('validates direct dependency allowlist records and audited approvals', () => {
  validateDependency(validDependency);
  assert.throws(() => validateDependency({...validDependency, lockedVersion: undefined}), /lockedVersion/);
  assert.throws(() => validateDependency({...validDependency, usageClass: 'unknown'}), /usageClass/);
  assert.throws(() => validateDependency({...validDependency, reviewStatus: 'approved'}), /approval/);
  assert.throws(() => validateDependency({...validDependency, reviewStatus: 'approved', licenseReview: {...validDependency.licenseReview, status: 'reviewed'}, vulnerabilityReview: {...validDependency.vulnerabilityReview, status: 'reviewed'}, approval: {approvedBy: 'docs-platform', approvedAt: '2026-07-24', reason: 'Text-only status flip.', evidence: ['approval/TASK-14']}}), /reviewedBy|review/);
  const reviewed = {status: 'reviewed', reviewedBy: 'security@example.com', reviewedAt: '2026-07-24T00:00:00.000Z', result: 'pass', report: 'reports/task-14.json', tool: 'approved-scanner@1', artifactSha256: 'c'.repeat(64), evidence: ['TASK-14']};
  const approved = {...validDependency, reviewStatus: 'approved', licenseReview: {...reviewed, license: 'MIT'}, vulnerabilityReview: reviewed, approval: {approvedBy: 'docs-platform', approvedAt: '2026-07-24T00:00:00.000Z', reason: 'Reviewed for unified workspace.', evidence: ['approval/TASK-14']}};
  assert.throws(() => validateDependency({...approved, approval: {...approved.approval, approvedAt: '2026-07-24'}}), /approval\.approvedAt/);
  validateDependency(approved);
  assert.throws(() => validateDependencies([validDependency, validDependency]), /duplicate/i);
  assert.throws(() => validateDependencies([{...validDependency, package: 'zod'}, validDependency]), /sorted/i);
});

test('revision override is only an assertion against a complete configured snapshot', () => {
  const pin = {id: 'zdoc', revision: SHA, lockConsistency: 'verified', evidence: ['audited pin'], lockfilePath: 'pnpm-lock.yaml'};
  assert.equal(resolveRepositoryPin(pin, SHA, '--zdoc-revision').revision, SHA);
  assert.throws(() => resolveRepositoryPin(pin, 'b'.repeat(40), '--zdoc-revision'), /snapshot config/i);
});

test('resolves nested pnpm links relative to the importing workspace and rejects escape', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'inventory-link-'));
  spawnSync('git', ['init', '-q'], {cwd: root}); spawnSync('git', ['config', 'user.email', 'test@example.com'], {cwd: root}); spawnSync('git', ['config', 'user.name', 'Test'], {cwd: root});
  mkdirSync(path.join(root, 'packages/a'), {recursive: true}); mkdirSync(path.join(root, 'packages/b'), {recursive: true});
  writeFileSync(path.join(root, 'packages/b/package.json'), '{"name":"b","version":"2.3.4"}\n');
  writeFileSync(path.join(root, 'packages/a/package.json'), '{"name":"a","version":"1.0.0"}\n');
  spawnSync('git', ['add', '.'], {cwd: root}); spawnSync('git', ['commit', '-qm', 'workspace'], {cwd: root});
  const revision = spawnSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).stdout.trim();
  const repository = {root, revision};
  assert.equal(lockedVersionFromLocator('link:../b', repository, 'packages/a'), '2.3.4');
  assert.equal(lockedVersionFromLocator('workspace:../b', repository, 'packages/a'), '2.3.4');
  assert.equal(lockedVersionFromLocator('workspace:*', repository, 'packages/a', 'b'), '2.3.4');
  assert.throws(() => lockedVersionFromLocator('link:../../../outside', repository, 'packages/a'), /escape/i);
});

test('reproduces a pinned revision after repository HEAD advances', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'inventory-pin-'));
  spawnSync('git', ['init', '-q'], {cwd: root});
  spawnSync('git', ['config', 'user.email', 'test@example.com'], {cwd: root});
  spawnSync('git', ['config', 'user.name', 'Test'], {cwd: root});
  mkdirSync(path.join(root, 'docs'));
  writeFileSync(path.join(root, 'docs/index.md'), '# pinned\n');
  writeFileSync(path.join(root, 'package.json'), '{"name":"fixture","dependencies":{"react":"^18"}}\n');
  writeFileSync(path.join(root, 'package-lock.json'), '{"lockfileVersion":3,"packages":{"":{"dependencies":{"react":"^18"}},"node_modules/react":{"version":"18.3.1","license":"MIT"}}}\n');
  spawnSync('git', ['add', '.'], {cwd: root}); spawnSync('git', ['commit', '-qm', 'pinned'], {cwd: root});
  const revision = spawnSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).stdout.trim();
  writeFileSync(path.join(root, 'later.txt'), 'later\n'); spawnSync('git', ['add', '.'], {cwd: root}); spawnSync('git', ['commit', '-qm', 'later'], {cwd: root});
  const result = generateInventory({repositories: [{id: 'zdoc', root, revision, revisionSource: 'test fixture', lockConsistency: 'verified'}]});
  assert.equal(result.sourceSnapshots[0].revision, revision);
  assert.ok(!result.legacyFiles.some(entry => entry.sourcePath === 'later.txt'));
  assert.equal(result.dependencies[0].lockedVersion, '18.3.1');
  assert.ok(result.legacyFiles.every(entry => entry.sourceCommit === revision));
});

test('covers all 12 copy and 1 patch operations in the pinned downstream overlay', () => {
  const workspace = process.cwd();
  const downstream = path.resolve(workspace, '../../../../zdoc_cn');
  const result = generateInventory({repositories: [
    {id: 'zdoc', root: workspace, revision: 'f15ccdd405f2f385b34f67eed45916ec3a3aff6d', revisionSource: 'migration/source-snapshots.json', lockConsistency: 'verified'},
    {id: 'zdoc_cn', root: downstream, revision: 'b1900473dddf8db2d56c11387211a7014b54c160', revisionSource: 'migration/source-snapshots.json', lockConsistency: 'stale'},
  ]});
  assert.equal(result.overlayOperations.filter(item => item.type === 'copy').length, 12);
  assert.equal(result.overlayOperations.filter(item => item.type === 'patch').length, 1);
  assert.ok(result.overlayOperations.filter(item => item.optional).every(item => Array.isArray(item.trackedSourcePaths)));
  const replacements = new Map(result.overlayOperations.map(item => [item.sourcePath, item]));
  assert.equal(replacements.get('config/cn-publish-replacements.js').disposition, 'rewrite');
  assert.equal(replacements.get('plugins/cn-publish-normalizer').disposition, 'rewrite');
  assert.match(replacements.get('plugins/cn-publish-normalizer').evidence.join('\n'), /historically declares this copy/i);
  assert.match(replacements.get('plugins/cn-publish-normalizer').evidence.join('\n'), /not copied/i);
  const legacyByPath = new Map(result.legacyFiles.filter(item => item.sourceRepository === 'zdoc_cn').map(item => [item.sourcePath, item]));
  assert.deepEqual(
    ['normalizeCnContent.js', 'normalizeCnContent.test.js', 'remarkCnPublishNormalizer.js', 'remarkCnPublishNormalizer.test.js']
      .map(name => legacyByPath.get(`plugins/cn-publish-normalizer/${name}`).disposition),
    ['rewrite', 'rewrite', 'rewrite', 'rewrite'],
  );
  assert.equal(legacyByPath.get('config/cn-publish-replacements.js').targetPath, 'packages/publication-adapters/src/zh-CN/restReplacements.ts');
  assert.equal(legacyByPath.get('plugins/cn-publish-normalizer/normalizeCnContent.test.js').targetPath, 'packages/publication-adapters/src/zh-CN/normalizer.test.ts');
  assert.ok(result.dependencies.filter(item => item.sourceMapping.sourceRepository === 'zdoc').every(item => item.lockedVersion !== null));
  assert.ok(result.dependencies.filter(item => item.sourceMapping.sourceRepository === 'zdoc_cn').every(item => item.sourceMapping.resolutionStatus === 'stale-lock'));
  const byPackage = new Map(result.dependencies.filter(item => item.importingWorkspacePath === '.').map(item => [item.package, item]));
  assert.equal(byPackage.get('playwright').usageClass, 'dev');
  assert.equal(byPackage.get('@aws-sdk/client-s3').usageClass, 'build');
  assert.equal(byPackage.get('react').usageClass, 'runtime');
  assert.equal(byPackage.get('@docusaurus/core').usageClass, 'runtime');
  assert.equal(byPackage.get('lodash').usageClassification.status, 'review-required');
});
