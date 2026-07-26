#!/usr/bin/env node

import {readFile, realpath} from 'node:fs/promises';
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
  if (record.status !== undefined && !['succeeded', 'failed'].includes(record.status)) {
    fail('status must be succeeded or failed');
  }

  const variantFields = [];
  if (record.environment === 'prod' && record.mode === 'rebuild') {
    variantFields.push('requestedSourceSha', 'sourceUatDigest');
    requireString(record, 'requestedSourceSha', SOURCE_SHA);
    requireString(record, 'sourceUatDigest', REGISTRY_DIGEST);
    if (record.requestedSourceSha !== record.sourceSha) {
      fail('requestedSourceSha must equal sourceSha');
    }
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

function findUatEvidence(record, uatRecords, {sameSourceSha}) {
  const candidates = uatRecords.filter((candidate) =>
    candidate?.environment === 'uat'
    && candidate?.site === record.site
    && candidate?.sourceRepository === 'zdoc'
    && candidate?.finalDeployedDigest === record.sourceUatDigest,
  );
  const evidence = sameSourceSha
    ? candidates.find((candidate) => candidate.sourceSha === record.sourceSha)
    : candidates[0];
  return evidence;
}

export function verifyRebuildRelease(record, uatRecords) {
  validateReleaseRecord(record);
  if (record.environment !== 'prod' || record.mode !== 'rebuild') {
    fail('rebuild verification requires a Prod rebuild record');
  }
  const evidence = findUatEvidence(record, uatRecords, {sameSourceSha: true});
  if (!evidence) {
    fail('rebuild requires UAT evidence with the same site, same source SHA, and sourceUatDigest');
  }
  validateReleaseRecord(evidence);
  return record;
}

export async function verifySpecifiedImageRelease(record, uatRecords, dependencies) {
  validateReleaseRecord(record);
  if (record.environment !== 'prod' || record.mode !== 'specified-image') {
    fail('specified-image verification requires a Prod specified-image record');
  }
  if (typeof dependencies?.resolveImageReference !== 'function') {
    fail('resolveImageReference dependency is required');
  }

  const resolvedDigest = await dependencies.resolveImageReference(record.operatorImageRef);
  if (!REGISTRY_DIGEST.test(resolvedDigest ?? '')) {
    fail('resolver must return an immutable sha256 registry digest');
  }
  if (resolvedDigest !== record.sourceUatDigest) {
    fail('resolved digest must equal sourceUatDigest');
  }
  if (record.finalDeployedDigest !== resolvedDigest) {
    fail('finalDeployedDigest must equal the resolved immutable digest');
  }

  const digestEvidence = uatRecords.filter((candidate) =>
    candidate?.finalDeployedDigest === resolvedDigest,
  );
  if (digestEvidence.length === 0 || digestEvidence.every((candidate) => candidate.environment !== 'uat')) {
    fail('specified-image requires UAT provenance');
  }
  const evidence = findUatEvidence(record, uatRecords, {sameSourceSha: true});
  if (!evidence) {
    fail('specified-image requires UAT provenance from the same site and source SHA');
  }
  validateReleaseRecord(evidence);
  return record;
}

export function verifyRollbackTarget(request, prodReleaseRecords) {
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
  const sourceRelease = prodReleaseRecords.find((record) =>
    record?.environment === 'prod'
    && record?.status === 'succeeded'
    && record?.site === request.site
    && record?.finalDeployedDigest === request.targetDigest,
  );
  if (!sourceRelease) {
    fail('rollback target must reference a recorded successful Prod release for the same site');
  }
  validateReleaseRecord(sourceRelease);
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

function resolveWithinRoot(root, relativePath) {
  if (typeof relativePath !== 'string' || relativePath.length === 0 || path.isAbsolute(relativePath)) {
    fail('path escapes --root');
  }
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    fail('path escapes --root');
  }
  return resolvedPath;
}

async function readJson(root, relativePath, label) {
  if (!relativePath) {
    fail(`${label} path is required`);
  }
  const file = resolveWithinRoot(root, relativePath);
  try {
    const resolvedRoot = await realpath(path.resolve(root));
    const resolvedFile = await realpath(file);
    if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)) {
      fail('path escapes --root');
    }
    return JSON.parse(await readFile(resolvedFile, 'utf8'));
  } catch (error) {
    if (error.message.includes('path escapes --root')) {
      throw error;
    }
    fail(`${label} must be readable valid JSON: ${error.message}`);
  }
}

function assertAllowedOptions(options, allowed) {
  for (const key of Object.keys(options)) {
    if (!allowed.includes(key)) {
      fail(`unsupported CLI option: --${key}`);
    }
  }
}

export async function main(argv, dependencies = {}) {
  const {command, options} = parseArgs(argv);
  const write = dependencies.write ?? ((value) => process.stdout.write(value));
  if (!options.root) {
    fail('--root is required');
  }

  if (command === 'verify-record') {
    assertAllowedOptions(options, ['root', 'record']);
    const record = await readJson(options.root, options.record, 'record');
    validateReleaseRecord(record);
    write(`${JSON.stringify(record)}\n`);
    return record;
  }

  if (command === 'verify-rebuild') {
    assertAllowedOptions(options, ['root', 'record', 'uat-records']);
    const record = await readJson(options.root, options.record, 'record');
    const uatRecords = await readJson(options.root, options['uat-records'], 'uat-records');
    const result = verifyRebuildRelease(record, uatRecords);
    write(`${JSON.stringify(result)}\n`);
    return result;
  }

  if (command === 'verify-specified-image') {
    assertAllowedOptions(options, ['root', 'record', 'uat-records', 'resolutions']);
    const record = await readJson(options.root, options.record, 'record');
    const uatRecords = await readJson(options.root, options['uat-records'], 'uat-records');
    const resolutions = await readJson(options.root, options.resolutions, 'resolutions');
    const result = await verifySpecifiedImageRelease(record, uatRecords, {
      resolveImageReference: async (reference) => resolutions[reference],
    });
    write(`${JSON.stringify(result)}\n`);
    return result;
  }

  assertAllowedOptions(options, ['root', 'request', 'prod-records']);
  const request = await readJson(options.root, options.request, 'request');
  const prodRecords = await readJson(options.root, options['prod-records'], 'prod-records');
  const result = verifyRollbackTarget(request, prodRecords);
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
