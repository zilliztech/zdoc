#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const { lstat, open, readlink, realpath, readdir } = require('node:fs/promises');
const path = require('node:path');
const { loadTypeScript } = require('../lib/load-typescript');
const { getContentGroup } = require('./content-groups');
const { validateBatchInput } = require('./translation-batch-input');
const { validateReconciliationPlan, validateReconciliationResult } = require('../translation/reconciliation-plan');
const { validateApprovalReceipt } = require('../translation/reconciliation-policy');
const { resolveTranslationTarget } = loadTypeScript('../../packages/docs-tooling/src/translation/targets.ts');

const COMMON_KEYS = ['schemaVersion', 'stage', 'group', 'masterSha', 'devBaselineSha', 'createdAt', 'ownershipVersion', 'files', 'deletions', 'snapshotManual'];
const TRANSLATION_IDENTITY_KEYS = ['translationTarget', 'sourceSite', 'targetSite', 'sourceCheckpointSha', 'toolingSha'];
const SCHEMA_1_KEYS = [...COMMON_KEYS, 'validation'];
const SCHEMA_1_TRANSLATION_KEYS = [...SCHEMA_1_KEYS, ...TRANSLATION_IDENTITY_KEYS];
const SCHEMA_2_KEYS = [...COMMON_KEYS, 'batch', 'batchInput', ...TRANSLATION_IDENTITY_KEYS];
const SCHEMA_3_NUMBERED_KEYS = [...SCHEMA_2_KEYS, 'reconciliation'];
const SCHEMA_3_UNBATCHED_KEYS = [...SCHEMA_1_TRANSLATION_KEYS, 'reconciliation'];
const FILE_KEYS = ['path', 'sha256', 'size'];
const VALIDATION_KEYS = ['commands', 'passed'];
const BATCH_KEYS = ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount', 'pendingSetSha256'];
const BATCH_INPUT_KEYS = ['path', 'size', 'sha256'];
const RECONCILIATION_KEYS = ['contractVersion', 'plan', 'approval', 'result'];
const EVIDENCE_KEYS = ['path', 'size', 'sha256', 'documentSha256'];

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`Unexpected ${label} key: ${key}`);
  for (const key of keys) if (!Object.hasOwn(value, key)) throw new Error(`Missing ${label} key: ${key}`);
}

function validPath(value) {
  if (typeof value !== 'string' || !value || value.startsWith('/') || value.endsWith('/') || value.includes('\\') || /[\0\r\n]/.test(value)) return false;
  return !value.split('/').some((part) => !part || part === '.' || part === '..');
}

function ownershipIsFile(owned) { return /\.[A-Za-z0-9]+$/.test(owned); }
function translationOwnedPaths(targetId, group) {
  const target = resolveTranslationTarget(targetId);
  if (target.id === 'ja-JP') {
    const roots = group.ownedPaths.flatMap((owned) => target.mappings.flatMap((mapping) => {
      if (owned === mapping.sourceRoot) return [mapping.targetRoot];
      if (owned.startsWith(`${mapping.sourceRoot}/`)) return [`${mapping.targetRoot}/${owned.slice(mapping.sourceRoot.length + 1)}`];
      if (mapping.sourceRoot.startsWith(`${owned}/`)) return [mapping.targetRoot];
      return [];
    }));
    return [...new Set([...roots, target.state.path])];
  }
  if (target.id === 'zh-CN-reference') {
    const roots = group.ownedPaths.flatMap((owned) => {
      if (owned === target.sourceRoot) return [target.targetRoot];
      if (owned.startsWith(`${target.sourceRoot}/`)) return [`${target.targetRoot}/${owned.slice(target.sourceRoot.length + 1)}`];
      if (target.sourceRoot.startsWith(`${owned}/`)) return [target.targetRoot];
      return [];
    });
    if (roots.length === 0) throw new Error(`Translation target ${target.id} is not compatible with group ${group.snapshotManual}`);
    const sidebarNames = group.snapshotManual === 'reference-landings'
      ? ['python', 'java', 'node', 'go', 'cli']
      : group.ownedPaths.flatMap((owned) => {
          const match = /^generated\/en\/sidebars\/(python|java|node|go|cli|restful)\.sidebar\.js$/u.exec(owned);
          return match ? [match[1]] : [];
        });
    const sidebars = sidebarNames.map(name => `generated/zh-CN/sidebars/${name}.sidebar.js`);
    return [...new Set([...roots, target.state.path, ...sidebars])];
  }
  if (group.snapshotManual !== 'guides') throw new Error(`Translation target ${target.id} requires Guides ownership`);
  return [target.targetRoot, target.sidebarTarget, target.state.path];
}
function isOwned(rel, ownedPaths) {
  return ownedPaths.some((owned) => rel === owned || (!ownershipIsFile(owned) && rel.startsWith(`${owned}/`)));
}
function sorted(values) { return values.every((value, i) => i === 0 || values[i - 1] < value); }
function pathsConflict(one, two) { return one === two || one.startsWith(`${two}/`) || two.startsWith(`${one}/`); }
function deepFreeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') deepFreeze(child);
  return Object.freeze(value);
}

async function readRegularNoFollow(file, label = 'Payload') {
  // On platforms without O_NOFOLLOW, the directory walk's lstat and descriptor fstat checks are the fallback.
  const handle = await open(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const before = await handle.stat();
    if (!before.isFile()) throw new Error(`${label} is not a regular file: ${file}`);
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size) throw new Error(`${label} file changed during validation: ${file}`);
    return bytes;
  } finally { await handle.close(); }
}

async function walkPayload(root, current = root, found = [], directories = []) {
  let entries;
  try { entries = await readdir(current, { withFileTypes: true }); } catch (error) {
    if (error.code === 'ENOENT') return found;
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(current, entry.name);
    const stat = await lstat(full);
    if (stat.isSymbolicLink()) throw new Error(`Payload symlink is not allowed: ${path.relative(root, full)}`);
    if (stat.isDirectory()) {
      directories.push(path.relative(root, full).split(path.sep).join('/'));
      await walkPayload(root, full, found, directories);
    }
    else if (stat.isFile()) found.push(path.relative(root, full).split(path.sep).join('/'));
    else throw new Error(`Unsupported payload entry: ${path.relative(root, full)}`);
  }
  return found;
}

async function pinArtifactDirectory(artifactDir) {
  const requested = path.resolve(artifactDir);
  const stat = await lstat(requested);
  if (!stat.isSymbolicLink()) {
    if (!stat.isDirectory()) throw new Error('Artifact path must be a directory or managed pointer');
    return realpath(requested);
  }
  const target = await readlink(requested);
  const prefix = `.${path.basename(requested)}.version-`;
  if (path.isAbsolute(target) || target.includes('/') || target.includes('\\') || !target.startsWith(prefix)) throw new Error('Artifact symlink is not a managed version pointer');
  const pinned = path.join(path.dirname(requested), target);
  const targetStat = await lstat(pinned);
  if (!targetStat.isDirectory() || targetStat.isSymbolicLink()) throw new Error('Managed artifact version must be a real sibling directory');
  const canonical = await realpath(pinned);
  const canonicalParent = await realpath(path.dirname(requested));
  if (path.dirname(canonical) !== canonicalParent) throw new Error('Managed artifact version escapes its trusted parent');
  return canonical;
}

async function validateTranslationRoot(artifactDir, {numbered, reconciliation}) {
  const expected = new Set(['manifest.json', 'payload']);
  if (numbered) expected.add('batch-input.json');
  if (reconciliation) {
    expected.add('reconciliation-plan.json');
    if (reconciliation.approval) expected.add('reconciliation-approval.json');
    if (reconciliation.result) expected.add('reconciliation-result.json');
  }
  const entries = await readdir(artifactDir);
  for (const name of entries) if (!expected.has(name)) throw new Error(`Unexpected schema 2 artifact root entry: ${name}`);
  for (const name of expected) {
    if (!entries.includes(name)) throw new Error(`Missing schema 2 artifact root entry: ${name}`);
    const stat = await lstat(path.join(artifactDir, name));
    if (stat.isSymbolicLink()) throw new Error(`Schema 2 artifact root entry must not be a symlink: ${name}`);
    if (name === 'payload' ? !stat.isDirectory() : !stat.isFile()) throw new Error(`Invalid schema 2 artifact root entry type: ${name}`);
  }
}

async function validateCheckpointArtifact(artifactDir, expected = {}) {
  if (expected.site !== undefined && expected.site !== 'en' && expected.site !== 'zh-CN') throw new Error('Expected site must be en or zh-CN');
  const pinnedArtifactDir = await pinArtifactDirectory(artifactDir);
  const manifestPath = path.join(pinnedArtifactDir, 'manifest.json');
  const manifestStat = await lstat(manifestPath);
  if (manifestStat.isSymbolicLink() || !manifestStat.isFile()) throw new Error('Manifest must be a regular non-symlink file');
  const manifest = JSON.parse((await readRegularNoFollow(manifestPath, 'Manifest')).toString('utf8'));
  await expected.testHooks?.afterManifestRead?.({ artifactDir: pinnedArtifactDir, manifest });
  if (manifest.schemaVersion === 1) exactKeys(manifest, manifest.stage === 'translation' ? SCHEMA_1_TRANSLATION_KEYS : SCHEMA_1_KEYS, 'manifest');
  else if (manifest.schemaVersion === 2 || manifest.schemaVersion === 3) {
    if (manifest.stage !== 'translation') throw new Error(`Unsupported schemaVersion for ${manifest.stage || 'unknown'} stage: ${manifest.schemaVersion}`);
    const numbered = Object.hasOwn(manifest, 'batch');
    exactKeys(manifest, manifest.schemaVersion === 3 ? (numbered ? SCHEMA_3_NUMBERED_KEYS : SCHEMA_3_UNBATCHED_KEYS) : SCHEMA_2_KEYS, 'manifest');
    await validateTranslationRoot(pinnedArtifactDir, {numbered, reconciliation: manifest.reconciliation});
  }
  else throw new Error(`Unsupported schemaVersion: ${manifest.schemaVersion}`);
  if (manifest.stage !== 'source' && manifest.stage !== 'translation') throw new Error(`Invalid artifact stage: ${manifest.stage}`);
  if (manifest.ownershipVersion !== 1) throw new Error(`Unsupported ownershipVersion: ${manifest.ownershipVersion}`);
  if (typeof manifest.group !== 'string') throw new Error('group must be a string');
  const group = getContentGroup(manifest.group, expected.site);
  if (manifest.stage === 'translation' && !group.translate) throw new Error('Translation stage is not enabled for this group');
  const translationArtifact = manifest.stage === 'translation' && group.translate;
  let ownedPaths = group.ownedPaths;
  if (translationArtifact) {
    const target = resolveTranslationTarget(manifest.translationTarget);
    const expectedTargetSite = target.targetSite || target.sourceSite;
    if (manifest.sourceSite !== target.sourceSite || manifest.targetSite !== expectedTargetSite) throw new Error('Invalid translation target identity: site mismatch');
    const sha = /^[0-9a-f]{40}$/;
    if (!sha.test(manifest.sourceCheckpointSha) || !sha.test(manifest.toolingSha)) throw new Error('Invalid translation target identity SHA');
    if (manifest.sourceCheckpointSha !== manifest.devBaselineSha) throw new Error('Translation source checkpoint/dev baseline mismatch');
    if (manifest.toolingSha !== manifest.masterSha) throw new Error('Translation tooling/master SHA mismatch');
    ownedPaths = translationOwnedPaths(target.id, group);
  }
  const numberedArtifact = manifest.schemaVersion === 2 || (manifest.schemaVersion === 3 && Object.hasOwn(manifest, 'batch'));
  if (numberedArtifact) {
    if (!translationArtifact || manifest.stage !== 'translation') throw new Error('Schema 2 is only allowed for numbered translation artifacts');
    if (manifest.group !== 'guides') throw new Error('Schema 2 numbered translation artifacts currently require group guides');
    exactKeys(manifest.batch, BATCH_KEYS, 'batch');
    const batch = manifest.batch;
    for (const key of ['batchIndex', 'batchNumber', 'batchCount', 'batchSize', 'pendingCount']) if (!Number.isSafeInteger(batch[key])) throw new Error(`Invalid batch ${key}`);
    if (batch.batchIndex < 0 || batch.batchNumber !== batch.batchIndex + 1 || batch.batchCount < batch.batchNumber || batch.batchSize <= 0 || batch.pendingCount < 0 || !/^[0-9a-f]{64}$/.test(batch.pendingSetSha256)) throw new Error('Invalid batch metadata');
  }
  const sha = /^[0-9a-f]{40}$/;
  if (!sha.test(manifest.masterSha)) throw new Error('Invalid masterSha');
  if (!sha.test(manifest.devBaselineSha)) throw new Error('Invalid devBaselineSha');
  if (typeof manifest.createdAt !== 'string' || Number.isNaN(Date.parse(manifest.createdAt)) || new Date(manifest.createdAt).toISOString() !== manifest.createdAt) throw new Error('Invalid createdAt timestamp');
  if (manifest.snapshotManual !== group.snapshotManual) throw new Error('snapshotManual mismatch');
  if (manifest.schemaVersion === 1 || (manifest.schemaVersion === 3 && !numberedArtifact)) {
    exactKeys(manifest.validation, VALIDATION_KEYS, 'validation');
    if (!Array.isArray(manifest.validation.commands) || !manifest.validation.commands.every((x) => typeof x === 'string') || manifest.validation.passed !== true) throw new Error('Invalid validation');
  }
  if (!Array.isArray(manifest.files) || !Array.isArray(manifest.deletions)) throw new Error('files and deletions must be arrays');
  const statePath = translationArtifact ? resolveTranslationTarget(manifest.translationTarget).state.path : '.translation-cache/ja-JP.json';
  const stateFileCount = manifest.files.filter((entry) => entry?.path === statePath).length;
  const stateDeletionCount = manifest.deletions.filter((rel) => rel === statePath).length;
  if (manifest.stage === 'translation' && stateDeletionCount) throw new Error('Translation stage must not list translation state deletion');
  if (manifest.stage === 'translation' && stateFileCount !== 1) throw new Error('Translation stage must contain exactly one translation state payload file');
  if (manifest.stage === 'source' && (stateFileCount || stateDeletionCount)) throw new Error('Source stage must not contain translation state');
  for (const entry of manifest.files) {
    exactKeys(entry, FILE_KEYS, 'file');
    if (!validPath(entry.path)) throw new Error(`Invalid path: ${entry.path}`);
    if (!isOwned(entry.path, ownedPaths)) throw new Error(`Path is not owned by group allowlist or translation target: ${entry.path}`);
    if (!/^[0-9a-f]{64}$/.test(entry.sha256)) throw new Error(`Invalid checksum: ${entry.path}`);
    if (!Number.isSafeInteger(entry.size) || entry.size < 0) throw new Error(`Invalid size: ${entry.path}`);
  }
  for (const rel of manifest.deletions) {
    if (!validPath(rel)) throw new Error(`Invalid path: ${rel}`);
    if (!isOwned(rel, ownedPaths)) throw new Error(`Path is not owned by group allowlist or translation target: ${rel}`);
  }
  const filePaths = manifest.files.map((x) => x.path);
  if (new Set(filePaths).size !== filePaths.length) throw new Error('Duplicate file path');
  if (new Set(manifest.deletions).size !== manifest.deletions.length) throw new Error('Duplicate deletion path');
  if (!sorted(filePaths) || !sorted(manifest.deletions)) throw new Error('Manifest entries must be sorted');
  const deletions = new Set(manifest.deletions);
  if (filePaths.some((rel) => deletions.has(rel))) throw new Error('File/deletion overlap');
  for (let i = 1; i < filePaths.length; i++) if (filePaths[i].startsWith(`${filePaths[i - 1]}/`)) throw new Error('Ambiguous ancestor file paths');
  for (let i = 0; i < manifest.deletions.length; i++) {
    for (let j = i + 1; j < manifest.deletions.length; j++) if (pathsConflict(manifest.deletions[i], manifest.deletions[j])) throw new Error('Ambiguous ancestor deletion paths');
  }
  if (manifest.stage === 'source') {
    for (const preservedPath of group.preservedPaths) {
      if (!filePaths.includes(preservedPath)) throw new Error(`Source checkpoint is missing declared preserved path: ${preservedPath}`);
    }
  }
  if (expected.group !== undefined && expected.group !== manifest.group) throw new Error('Expected group mismatch');
  if (expected.masterSha !== undefined && expected.masterSha !== manifest.masterSha) throw new Error('Expected master SHA mismatch');
  if (expected.devBaselineSha !== undefined && expected.devBaselineSha !== manifest.devBaselineSha) throw new Error('Expected dev baseline SHA mismatch');
  if (expected.translationTarget !== undefined && expected.translationTarget !== manifest.translationTarget) throw new Error('Expected translation target mismatch');
  if (expected.sourceCheckpointSha !== undefined && expected.sourceCheckpointSha !== manifest.sourceCheckpointSha) throw new Error('Expected source checkpoint SHA mismatch');
  if (expected.toolingSha !== undefined && expected.toolingSha !== manifest.toolingSha) throw new Error('Expected tooling SHA mismatch');

  const payloadRoot = path.join(pinnedArtifactDir, 'payload');
  const directories = [];
  const actual = (await walkPayload(payloadRoot, payloadRoot, [], directories)).sort();
  for (const rel of directories) if (!filePaths.some((file) => file.startsWith(`${rel}/`))) throw new Error(`Unexpected payload directory: ${rel}`);
  for (const rel of filePaths) if (!actual.includes(rel)) throw new Error(`Missing payload file: ${rel}`);
  for (const rel of actual) if (!filePaths.includes(rel)) throw new Error(`Unexpected payload file: ${rel}`);
  let translationCacheBytes = null;
  for (const entry of manifest.files) {
    const bytes = await readRegularNoFollow(path.join(payloadRoot, ...entry.path.split('/')));
    if (bytes.length !== entry.size) throw new Error(`Payload size mismatch: ${entry.path}`);
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error(`Payload checksum mismatch: ${entry.path}`);
    if (entry.path === statePath) translationCacheBytes = Buffer.from(bytes);
  }
  let parsedBatchInput = null;
  let batchInputBytes = null;
  if (numberedArtifact) {
    exactKeys(manifest.batchInput, BATCH_INPUT_KEYS, 'batchInput');
    if (manifest.batchInput.path !== 'batch-input.json') throw new Error('Schema 2 batch input path must be exactly batch-input.json');
    if (!Number.isSafeInteger(manifest.batchInput.size) || manifest.batchInput.size < 0) throw new Error('Invalid batch input size');
    if (!/^[0-9a-f]{64}$/.test(manifest.batchInput.sha256)) throw new Error('Invalid batch input SHA-256');
    const inputPath = path.join(pinnedArtifactDir, 'batch-input.json');
    const stat = await lstat(inputPath);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Batch input must be a regular non-symlink file');
    batchInputBytes = await readRegularNoFollow(inputPath, 'Batch input');
    if (batchInputBytes.length !== manifest.batchInput.size) throw new Error('Batch input size mismatch');
    const batchInputSha256 = crypto.createHash('sha256').update(batchInputBytes).digest('hex');
    if (batchInputSha256 !== manifest.batchInput.sha256) throw new Error('Batch input checksum mismatch');
    try { parsedBatchInput = JSON.parse(batchInputBytes.toString('utf8')); }
    catch (error) { throw new Error(`Batch input JSON is invalid: ${error.message}`); }
    validateBatchInput(parsedBatchInput);
    const canonicalBytes = Buffer.from(`${JSON.stringify(parsedBatchInput, null, 2)}\n`);
    if (!batchInputBytes.equals(canonicalBytes)) throw new Error('Batch input bytes are not canonical JSON');
    if (parsedBatchInput.group !== manifest.group) throw new Error('Batch input group mismatch');
    if (parsedBatchInput.sourceCheckpointSha !== manifest.devBaselineSha) throw new Error('Batch input source checkpoint/dev baseline mismatch');
    if (BATCH_KEYS.some((key) => parsedBatchInput.batch[key] !== manifest.batch[key])) throw new Error('Batch input batch identity mismatch');
    deepFreeze(parsedBatchInput);
  }
  let reconciliationEvidence = null;
  if (manifest.schemaVersion === 3) {
    exactKeys(manifest.reconciliation, RECONCILIATION_KEYS, 'reconciliation');
    if (manifest.reconciliation.contractVersion !== 1) throw new Error('Unsupported reconciliation contract version');
    const readEvidence = async (entry, expectedPath, label) => {
      if (entry === null) return null;
      exactKeys(entry, EVIDENCE_KEYS, `${label} evidence`);
      if (entry.path !== expectedPath || !Number.isSafeInteger(entry.size) || entry.size < 0 || !/^[0-9a-f]{64}$/.test(entry.sha256) || !/^sha256:[0-9a-f]{64}$/.test(entry.documentSha256)) throw new Error(`${label} evidence identity is invalid`);
      const bytes = await readRegularNoFollow(path.join(pinnedArtifactDir, entry.path), label);
      if (bytes.length !== entry.size || crypto.createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error(`${label} evidence checksum mismatch`);
      let document;
      try { document = JSON.parse(bytes.toString('utf8')); } catch (error) { throw new Error(`${label} evidence JSON is invalid: ${error.message}`); }
      if (!bytes.equals(Buffer.from(`${JSON.stringify(document, null, 2)}\n`))) throw new Error(`${label} evidence bytes are not canonical JSON`);
      return {bytes, document};
    };
    const planEvidence = await readEvidence(manifest.reconciliation.plan, 'reconciliation-plan.json', 'Reconciliation plan');
    if (!planEvidence) throw new Error('Reconciliation plan evidence is required');
    const plan = validateReconciliationPlan(planEvidence.document);
    if (plan.planSha256 !== manifest.reconciliation.plan.documentSha256) throw new Error('Reconciliation plan document digest mismatch');
    if (plan.target !== manifest.translationTarget || plan.group !== manifest.group || plan.sourceCheckpointSha !== manifest.sourceCheckpointSha || plan.toolingSha !== manifest.toolingSha) throw new Error('Reconciliation plan artifact identity mismatch');
    const approvalEvidence = await readEvidence(manifest.reconciliation.approval, 'reconciliation-approval.json', 'Reconciliation approval');
    const approval = approvalEvidence ? validateApprovalReceipt(approvalEvidence.document, plan) : null;
    if (approval && approval.receiptSha256 !== manifest.reconciliation.approval.documentSha256) throw new Error('Reconciliation approval document digest mismatch');
    const resultEvidence = await readEvidence(manifest.reconciliation.result, 'reconciliation-result.json', 'Reconciliation result');
    const result = resultEvidence ? validateReconciliationResult(resultEvidence.document, plan) : null;
    if (result && result.resultSha256 !== manifest.reconciliation.result.documentSha256) throw new Error('Reconciliation result document digest mismatch');
    reconciliationEvidence = {plan, approval, result};
  }
  Object.defineProperty(manifest, 'resolvedDir', { value: pinnedArtifactDir, enumerable: false });
  if (translationArtifact) {
    Object.defineProperty(manifest, 'translationCacheBytes', { get: () => Buffer.from(translationCacheBytes), enumerable: false });
  }
  if (numberedArtifact) {
    Object.defineProperties(manifest, {
      parsedBatchInput: { value: parsedBatchInput, enumerable: false },
      batchInputBytes: { get: () => Buffer.from(batchInputBytes), enumerable: false },
    });
  }
  if (reconciliationEvidence) Object.defineProperty(manifest, 'reconciliationEvidence', {value: reconciliationEvidence, enumerable: false});
  return deepFreeze(manifest);
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function validateTranslationCheckpointPair(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Translation checkpoint pair options are required');
  if (typeof options.checkpointDir !== 'string' || !options.checkpointDir) throw new Error('Translation checkpoint directory is required');
  if (typeof options.baselineDir !== 'string' || !options.baselineDir) throw new Error('Translation baseline directory is required');
  const expected = options.expected || {};
  if (!expected || typeof expected !== 'object' || Array.isArray(expected)) throw new Error('Translation checkpoint pair expected identity must be an object');
  for (const key of ['checkpointManifestSha256', 'baselineManifestSha256']) {
    if (expected[key] !== undefined && !/^[0-9a-f]{64}$/.test(expected[key])) throw new Error(`Expected ${key} must be a lowercase SHA-256 checksum`);
  }
  const artifactExpected = {
    group: expected.group,
    translationTarget: expected.translationTarget,
    sourceCheckpointSha: expected.sourceCheckpointSha,
    toolingSha: expected.toolingSha,
    site: expected.site,
  };
  const [checkpoint, baseline] = await Promise.all([
    validateCheckpointArtifact(options.checkpointDir, artifactExpected),
    validateCheckpointArtifact(options.baselineDir, artifactExpected),
  ]);
  if (checkpoint.stage !== 'translation' || baseline.stage !== 'translation') throw new Error('Translation checkpoint pair must contain translation artifacts');
  for (const key of ['group', 'translationTarget', 'sourceSite', 'targetSite', 'sourceCheckpointSha', 'toolingSha', 'masterSha', 'devBaselineSha']) {
    if (checkpoint[key] !== baseline[key]) throw new Error(`Translation checkpoint/baseline ${key} mismatch`);
  }
  if (checkpoint.schemaVersion === 3 || baseline.schemaVersion === 3) {
    if (checkpoint.schemaVersion !== 3 || baseline.schemaVersion !== 3) throw new Error('Translation checkpoint/baseline reconciliation contract mismatch');
    const checkpointPlan = checkpoint.reconciliationEvidence.plan;
    const baselinePlan = baseline.reconciliationEvidence.plan;
    if (checkpointPlan.planSha256 !== baselinePlan.planSha256) throw new Error('Translation checkpoint/baseline reconciliation plan mismatch');
    const checkpointApproval = checkpoint.reconciliationEvidence.approval?.receiptSha256 || null;
    const baselineApproval = baseline.reconciliationEvidence.approval?.receiptSha256 || null;
    if (checkpointApproval !== baselineApproval) throw new Error('Translation checkpoint/baseline reconciliation approval mismatch');
    if (!checkpoint.reconciliationEvidence.result) throw new Error('Translation checkpoint reconciliation result is required');
    if (baseline.reconciliationEvidence.result) throw new Error('Translation baseline must not contain a reconciliation result');
  }
  const checksums = [
    ['checkpoint', checkpoint, expected.checkpointManifestSha256],
    ['baseline', baseline, expected.baselineManifestSha256],
  ];
  for (const [label, manifest, checksum] of checksums) {
    if (checksum === undefined) continue;
    const bytes = await readRegularNoFollow(path.join(manifest.resolvedDir, 'manifest.json'), `${label} manifest`);
    if (sha256(bytes) !== checksum) throw new Error(`Translation ${label} manifest checksum mismatch`);
  }
  return Object.freeze({checkpoint, baseline});
}

function usage() { return 'Usage: node validate-checkpoint-artifact.js --artifact <dir> [--group <group>] [--master-sha <sha>] [--dev-baseline-sha <sha>] [--translation-target <target>] [--source-checkpoint-sha <sha>] [--tooling-sha <sha>]'; }
function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  if (args.includes('--help')) throw new Error('--help must be used alone');
  const map = {};
  const allowed = new Set(['artifact', 'group', 'master-sha', 'dev-baseline-sha', 'translation-target', 'source-checkpoint-sha', 'tooling-sha']);
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith('--') || args[i + 1] === undefined) throw new Error(usage());
    const key = args[i].slice(2);
    if (!allowed.has(key)) throw new Error(`Unknown argument: --${key}`);
    if (Object.hasOwn(map, key)) throw new Error(`Duplicate argument: --${key}`);
    map[key] = args[i + 1];
  }
  if (!map.artifact) throw new Error(usage());
  return { artifact: map.artifact, expected: { group: map.group, masterSha: map['master-sha'], devBaselineSha: map['dev-baseline-sha'], translationTarget: map['translation-target'], sourceCheckpointSha: map['source-checkpoint-sha'], toolingSha: map['tooling-sha'] } };
}
if (require.main === module) {
  (async () => { const args = parseArgs(process.argv.slice(2)); if (args.help) console.log(usage()); else await validateCheckpointArtifact(args.artifact, args.expected); })()
    .catch((error) => { console.error(`Checkpoint artifact validation failed: ${error.message}`); process.exitCode = 1; });
}

module.exports = { translationOwnedPaths, validateCheckpointArtifact, validateTranslationCheckpointPair };
