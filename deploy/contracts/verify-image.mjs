#!/usr/bin/env node

import {constants} from 'node:fs';
import {lstat, open, realpath} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const SOURCE_SHA = /^[0-9a-f]{40}$/;
const REGISTRY_DIGEST = /^sha256:[0-9a-f]{64}$/;
const IMAGE_REFERENCE = /^[a-zA-Z0-9][a-zA-Z0-9._/:@-]*$/;
const COMMON_FIELDS = [
  'site',
  'environment',
  'mode',
  'sourceRepository',
  'sourceSha',
  'finalDeployedDigest',
  'jenkinsBuildIdentity',
];
const OPTIONAL_FIELDS = ['status'];
const TRUSTED_EVIDENCE_FILES = Object.freeze({
  uat: 'uat-records.json',
  resolutions: 'resolved-images.json',
  prod: 'prod-records.json',
});

function fail(message) {
  throw new Error(`release contract violation: ${message}`);
}

function requireString(record, field, pattern) {
  if (typeof record[field] !== 'string' || record[field].length === 0) {
    fail(`${field} is required`);
  }
  if (pattern && !pattern.test(record[field])) {
    fail(`${field} has an invalid format`);
  }
}

function expectedPipeline(record) {
  const language = record.site === 'en' ? 'english' : 'chinese';
  return new RegExp(`^vdc-jenkins/${language}-${record.environment}/[1-9][0-9]*$`);
}

export function validateReleaseRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    fail('record must be an object');
  }
  if (!['en', 'zh-CN'].includes(record.site)) {
    fail('site must be en or zh-CN');
  }
  if (!['uat', 'prod'].includes(record.environment)) {
    fail('environment must be uat or prod');
  }
  if (!['rebuild', 'specified-image'].includes(record.mode)) {
    fail('mode must be rebuild or specified-image');
  }
  if (record.environment === 'uat' && record.mode !== 'rebuild') {
    fail('UAT records must use rebuild mode');
  }
  if (record.sourceRepository !== 'zdoc') {
    fail('sourceRepository must be zdoc');
  }

  requireString(record, 'sourceSha', SOURCE_SHA);
  requireString(record, 'finalDeployedDigest', REGISTRY_DIGEST);
  requireString(record, 'jenkinsBuildIdentity');
  if (!expectedPipeline(record).test(record.jenkinsBuildIdentity)) {
    fail('jenkinsBuildIdentity must identify the matching external vdc-jenkins pipeline');
  }
  if (record.status !== undefined && !['succeeded', 'failed', 'pending'].includes(record.status)) {
    fail('status must be succeeded, failed, or pending');
  }
  if (record.environment === 'uat' && record.status === undefined) {
    fail('UAT record status is required');
  }

  const variantFields = [];
  if (record.environment === 'prod' && record.mode === 'rebuild') {
    variantFields.push('sourceUatDigest');
    requireString(record, 'sourceUatDigest', REGISTRY_DIGEST);
  }
  if (record.environment === 'prod' && record.mode === 'specified-image') {
    variantFields.push('operatorImageRef', 'sourceUatDigest');
    requireString(record, 'operatorImageRef', IMAGE_REFERENCE);
    requireString(record, 'sourceUatDigest', REGISTRY_DIGEST);
  }

  const allowed = new Set([...COMMON_FIELDS, ...OPTIONAL_FIELDS, ...variantFields]);
  for (const field of Object.keys(record)) {
    if (!allowed.has(field)) {
      fail(`unexpected field: ${field}`);
    }
  }
  return record;
}

function requireTrustedEvidenceProvider(provider) {
  for (const method of [
    'getAuthenticatedUatRecords',
    'resolveImageReference',
    'getSuccessfulProdRecords',
  ]) {
    if (typeof provider?.[method] !== 'function') {
      fail(`trustedEvidenceProvider.${method} is required`);
    }
  }
  return provider;
}

function validateEvidenceRecords(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array`);
  }
  const identities = new Set();
  for (const record of value) {
    validateReleaseRecord(record);
    if (identities.has(record.jenkinsBuildIdentity)) {
      fail(`${label} contains duplicate jenkinsBuildIdentity: ${record.jenkinsBuildIdentity}`);
    }
    identities.add(record.jenkinsBuildIdentity);
  }
  return value;
}

function successfulUatEvidence(record, uatRecords) {
  const matches = uatRecords.filter((candidate) =>
    candidate.environment === 'uat'
    && candidate.status === 'succeeded'
    && candidate.site === record.site
    && candidate.sourceRepository === 'zdoc'
    && candidate.sourceSha === record.sourceSha
    && candidate.finalDeployedDigest === record.sourceUatDigest,
  );
  if (matches.length === 0) {
    fail('release requires successful UAT evidence for the same site, source SHA, and sourceUatDigest');
  }
  if (matches.length !== 1) {
    fail('release requires unique successful UAT evidence');
  }
  return matches[0];
}

export async function verifyRebuildRelease(record, trustedEvidenceProvider) {
  validateReleaseRecord(record);
  if (record.environment !== 'prod' || record.mode !== 'rebuild') {
    fail('rebuild verification requires a Prod rebuild record');
  }
  const provider = requireTrustedEvidenceProvider(trustedEvidenceProvider);
  const records = validateEvidenceRecords(
    await provider.getAuthenticatedUatRecords(),
    'authenticated UAT records',
  );
  successfulUatEvidence(record, records);
  return record;
}

export async function verifySpecifiedImageRelease(record, trustedEvidenceProvider) {
  validateReleaseRecord(record);
  if (record.environment !== 'prod' || record.mode !== 'specified-image') {
    fail('specified-image verification requires a Prod specified-image record');
  }
  const provider = requireTrustedEvidenceProvider(trustedEvidenceProvider);
  const records = validateEvidenceRecords(
    await provider.getAuthenticatedUatRecords(),
    'authenticated UAT records',
  );
  const resolvedDigest = await provider.resolveImageReference(record.operatorImageRef);
  if (!REGISTRY_DIGEST.test(resolvedDigest ?? '')) {
    fail('trusted resolver must return an immutable sha256 registry digest');
  }
  if (resolvedDigest !== record.sourceUatDigest) {
    fail('resolved digest must equal sourceUatDigest');
  }
  if (record.finalDeployedDigest !== resolvedDigest) {
    fail('finalDeployedDigest must equal the resolved immutable digest');
  }
  successfulUatEvidence(record, records);
  return record;
}

function validateRollbackRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    fail('rollback request must be an object');
  }
  const fields = Object.keys(request);
  if (fields.length !== 2 || !fields.includes('site') || !fields.includes('targetDigest')) {
    fail('rollback request accepts only site and targetDigest');
  }
  if (!['en', 'zh-CN'].includes(request.site)) {
    fail('rollback site must be en or zh-CN');
  }
  requireString(request, 'targetDigest', REGISTRY_DIGEST);
}

export async function verifyRollbackTarget(request, trustedEvidenceProvider) {
  validateRollbackRequest(request);
  const provider = requireTrustedEvidenceProvider(trustedEvidenceProvider);
  const records = validateEvidenceRecords(
    await provider.getSuccessfulProdRecords(),
    'successful Prod records',
  );
  const sourceRelease = records.find((record) =>
    record.environment === 'prod'
    && record.status === 'succeeded'
    && record.site === request.site
    && record.finalDeployedDigest === request.targetDigest,
  );
  if (!sourceRelease) {
    fail('rollback target must reference a recorded successful Prod release for the same site');
  }
  return request.targetDigest;
}

function parseArgs(argv) {
  const [command, ...args] = argv;
  const supportedCommands = new Set([
    'verify-record',
    'verify-rebuild',
    'verify-specified-image',
    'verify-rollback',
  ]);
  if (!supportedCommands.has(command)) {
    fail(`unsupported command: ${command ?? '<missing>'}`);
  }
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!name?.startsWith('--') || value === undefined || value.startsWith('--')) {
      fail('CLI options must be --name value pairs');
    }
    const key = name.slice(2);
    if (options[key] !== undefined) {
      fail(`duplicate CLI option: --${key}`);
    }
    options[key] = value;
  }
  return {command, options};
}

function assertAllowedOptions(options, allowed) {
  for (const key of Object.keys(options)) {
    if (!allowed.includes(key)) {
      fail(`unsupported CLI option: --${key}`);
    }
  }
}

function sameIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size;
}

async function pinDirectory(directory, label) {
  const stats = await lstat(directory);
  if (stats.isSymbolicLink() || !stats.isDirectory() || await realpath(directory) !== directory) {
    fail(`${label} must be a canonical real directory`);
  }
  return {path: directory, dev: stats.dev, ino: stats.ino};
}

async function pinRoot(directory, label) {
  const requested = path.resolve(directory);
  let canonical;
  try {
    canonical = await realpath(requested);
  } catch (error) {
    fail(`${label} must be an existing real directory: ${error.message}`);
  }
  if (canonical !== requested) {
    fail(`${label} must not use symlink ancestors`);
  }
  return {path: canonical, ancestors: [await pinDirectory(canonical, label)]};
}

async function verifyAncestorChain(ancestors, label) {
  for (const identity of ancestors) {
    let stats;
    try {
      stats = await lstat(identity.path);
    } catch (error) {
      fail(`${label} ancestor identity changed: ${error.message}`);
    }
    if (stats.isSymbolicLink() || !stats.isDirectory()
      || stats.dev !== identity.dev || stats.ino !== identity.ino
      || await realpath(identity.path) !== identity.path) {
      fail(`${label} ancestor identity changed`);
    }
  }
}

function requireSafeRelativePath(relativePath, label) {
  if (typeof relativePath !== 'string' || relativePath.length === 0
    || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
    fail(`${label} path is unsafe`);
  }
  const parts = relativePath.split('/');
  if (parts.some((part) => part === '' || part === '.' || part === '..')) {
    fail(`${label} path is unsafe`);
  }
  return parts;
}

async function pinFile(root, relativePath, label) {
  const parts = requireSafeRelativePath(relativePath, label);
  const ancestors = [...root.ancestors];
  let current = root.path;
  for (const segment of parts.slice(0, -1)) {
    current = path.join(current, segment);
    ancestors.push(await pinDirectory(current, `${label} ancestor`));
  }
  await verifyAncestorChain(ancestors, label);
  return {target: path.join(current, parts.at(-1)), ancestors};
}

async function readJsonUnderPinnedRoot(root, relativePath, label) {
  if (typeof constants.O_NOFOLLOW !== 'number' || typeof constants.O_NONBLOCK !== 'number') {
    fail('safe JSON reads require O_NOFOLLOW and O_NONBLOCK');
  }
  const pinned = await pinFile(root, relativePath, label);
  await verifyAncestorChain(pinned.ancestors, label);
  let handle;
  try {
    handle = await open(pinned.target, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const before = await handle.stat();
    if (!before.isFile()) {
      fail(`${label} must be a regular non-symlink file`);
    }
    await verifyAncestorChain(pinned.ancestors, label);
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (!sameIdentity(before, after)) {
      fail(`${label} identity changed while reading`);
    }
    await verifyAncestorChain(pinned.ancestors, label);
    try {
      return JSON.parse(bytes.toString('utf8'));
    } catch (error) {
      fail(`${label} must be valid JSON: ${error.message}`);
    }
  } catch (error) {
    if (error.code === 'ELOOP') {
      fail(`${label} must be a regular non-symlink file`);
    }
    throw error;
  } finally {
    if (handle) await handle.close();
  }
}

function rootsOverlap(left, right) {
  const relation = path.relative(left, right);
  const reverse = path.relative(right, left);
  const inside = (value) => value === '' || (!value.startsWith('..') && !path.isAbsolute(value));
  return inside(relation) || inside(reverse);
}

function filesystemTrustedEvidenceProvider(root) {
  return {
    getAuthenticatedUatRecords: () => readJsonUnderPinnedRoot(root, TRUSTED_EVIDENCE_FILES.uat, 'authenticated UAT records'),
    resolveImageReference: async (reference) => {
      const resolutions = await readJsonUnderPinnedRoot(root, TRUSTED_EVIDENCE_FILES.resolutions, 'trusted image resolutions');
      if (!resolutions || typeof resolutions !== 'object' || Array.isArray(resolutions)) {
        fail('trusted image resolutions must be an object');
      }
      for (const [imageReference, digest] of Object.entries(resolutions)) {
        if (!IMAGE_REFERENCE.test(imageReference) || typeof digest !== 'string' || !REGISTRY_DIGEST.test(digest)) {
          fail(`trusted image resolutions contain an invalid entry: ${imageReference}`);
        }
      }
      return Object.hasOwn(resolutions, reference) ? resolutions[reference] : undefined;
    },
    getSuccessfulProdRecords: () => readJsonUnderPinnedRoot(root, TRUSTED_EVIDENCE_FILES.prod, 'successful Prod records'),
  };
}

async function cliRoots(options, dependencies, requireTrust) {
  if (!options.root) fail('--root is required');
  const requestRoot = await pinRoot(options.root, 'request root');
  if (!requireTrust) return {requestRoot};
  const env = dependencies.env ?? process.env;
  const evidenceDirectory = env.VDC_JENKINS_EVIDENCE_ROOT;
  if (!evidenceDirectory) {
    fail('VDC_JENKINS_EVIDENCE_ROOT is required for approval verification');
  }
  const evidenceRoot = await pinRoot(evidenceDirectory, 'trusted evidence root');
  if (rootsOverlap(requestRoot.path, evidenceRoot.path)) {
    fail('request root and trusted evidence root must not overlap');
  }
  return {
    requestRoot,
    provider: filesystemTrustedEvidenceProvider(evidenceRoot),
  };
}

function patternMatches(relativePath, pattern) {
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3);
    return relativePath === prefix || relativePath.startsWith(`${prefix}/`);
  }
  return relativePath === pattern;
}

export function resolvePathChecks(relativePath, filters) {
  requireSafeRelativePath(relativePath, 'changed file');
  if (!filters || typeof filters !== 'object' || !Array.isArray(filters.precedence)
    || !filters.rules || typeof filters.rules !== 'object') {
    fail('path filters must define precedence and rules');
  }
  for (const ruleId of filters.precedence) {
    const rule = filters.rules[ruleId];
    if (!rule || !Array.isArray(rule.include) || !Array.isArray(rule.checks)) {
      fail(`path filter rule is invalid: ${ruleId}`);
    }
    const included = rule.include.some((pattern) => patternMatches(relativePath, pattern));
    const excluded = (rule.exclude ?? []).some((pattern) => patternMatches(relativePath, pattern));
    if (included && !excluded) return [...rule.checks];
  }
  return [];
}

export async function main(argv, dependencies = {}) {
  const {command, options} = parseArgs(argv);
  const write = dependencies.write ?? ((value) => process.stdout.write(value));

  if (command === 'verify-record') {
    assertAllowedOptions(options, ['root', 'record']);
    const {requestRoot} = await cliRoots(options, dependencies, false);
    const record = await readJsonUnderPinnedRoot(requestRoot, options.record, 'record');
    validateReleaseRecord(record);
    write(`${JSON.stringify(record)}\n`);
    return record;
  }

  if (command === 'verify-rebuild') {
    assertAllowedOptions(options, ['root', 'record']);
    const {requestRoot, provider} = await cliRoots(options, dependencies, true);
    const record = await readJsonUnderPinnedRoot(requestRoot, options.record, 'record');
    const result = await verifyRebuildRelease(record, provider);
    write(`${JSON.stringify(result)}\n`);
    return result;
  }

  if (command === 'verify-specified-image') {
    assertAllowedOptions(options, ['root', 'record']);
    const {requestRoot, provider} = await cliRoots(options, dependencies, true);
    const record = await readJsonUnderPinnedRoot(requestRoot, options.record, 'record');
    const result = await verifySpecifiedImageRelease(record, provider);
    write(`${JSON.stringify(result)}\n`);
    return result;
  }

  assertAllowedOptions(options, ['root', 'request']);
  const {requestRoot, provider} = await cliRoots(options, dependencies, true);
  const request = await readJsonUnderPinnedRoot(requestRoot, options.request, 'rollback request');
  const result = await verifyRollbackTarget(request, provider);
  write(`${JSON.stringify({targetDigest: result})}\n`);
  return result;
}

const isExecutable = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isExecutable) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
