#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {loadTypeScript} = require('../lib/load-typescript');
const {promptNamesFor} = require('./restSpecLocalization');
const {assertSafeRepositoryRelativePath} = loadTypeScript('../../packages/docs-tooling/src/validation/ownership.ts');

const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT_SHA = /^[0-9a-f]{40}$/;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function promptContractSha256(target, repositoryRoot = process.cwd()) {
  const names = Object.values(promptNamesFor(target)).filter(Boolean);
  if (target === 'ja-JP') names.push('codex-correction-agent.md');
  const parts = [target];
  for (const name of [...new Set(names)].sort()) {
    parts.push(name, fs.readFileSync(path.join(repositoryRoot, '.github/prompts', name), 'utf8'));
  }
  if (target === 'zh-CN-reference') {
    parts.push('config/reference-navigation.json', fs.readFileSync(path.join(repositoryRoot, 'config/reference-navigation.json'), 'utf8'));
  }
  return sha256(Buffer.from(parts.join('\0'), 'utf8'));
}

function safePath(root, relativePath, label) {
  assertSafeRepositoryRelativePath(relativePath, label);
  const resolved = path.resolve(root, ...relativePath.split('/'));
  const absoluteRoot = path.resolve(root);
  if (resolved !== absoluteRoot && !resolved.startsWith(`${absoluteRoot}${path.sep}`)) throw new Error(`${label} escapes its root`);
  return resolved;
}

function assertIdentity(identity) {
  if (!identity || !['ja-JP', 'zh-CN'].includes(identity.locale)) throw new Error('Recovery locale is invalid');
  if (typeof identity.group !== 'string' || !identity.group) throw new Error('Recovery group is required');
  if (!SHA256.test(identity.promptContractSha256 || '')) throw new Error('Recovery prompt contract SHA-256 is invalid');
  if (typeof identity.model !== 'string' || !identity.model) throw new Error('Recovery model is required');
  for (const name of ['sourceSha', 'toolingSha']) {
    if (!COMMIT_SHA.test(identity[name] || '')) throw new Error(`Recovery ${name} is invalid`);
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createRecoveryArtifact({siteDir, outputDir, results, identity}) {
  assertIdentity(identity);
  fs.rmSync(outputDir, {recursive: true, force: true});
  fs.mkdirSync(outputDir, {recursive: true});
  const files = [];
  for (const result of results.filter(item => item.status === 'translated')) {
    const sourcePath = safePath(siteDir, result.sourcePath, 'Recovery source path');
    const targetPath = safePath(siteDir, result.targetPath, 'Recovery target path');
    const sourceBytes = fs.readFileSync(sourcePath);
    const targetBytes = fs.readFileSync(targetPath);
    const sourceHash = sha256(sourceBytes);
    if (sourceHash !== result.sourceHash) throw new Error(`Recovery source hash changed: ${result.sourcePath}`);
    const artifactTarget = safePath(path.join(outputDir, 'translated-files'), result.targetPath, 'Recovery artifact target path');
    fs.mkdirSync(path.dirname(artifactTarget), {recursive: true});
    fs.writeFileSync(artifactTarget, targetBytes);
    files.push({
      sourcePath: result.sourcePath,
      targetPath: result.targetPath,
      sourceHash,
      targetHash: sha256(targetBytes),
      targetSize: targetBytes.length,
      locale: identity.locale,
      group: identity.group,
      promptContractSha256: identity.promptContractSha256,
      model: identity.model,
      status: 'translated',
    });
  }
  files.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath) || left.targetPath.localeCompare(right.targetPath));
  const metadata = {
    schemaVersion: 1,
    ...identity,
    translated: files.length,
  };
  writeJson(path.join(outputDir, 'metadata.json'), metadata);
  writeJson(path.join(outputDir, 'manifest.json'), {schemaVersion: 1, files});
  return {metadata, files};
}

function readArtifact(artifactDir) {
  try {
    const metadata = JSON.parse(fs.readFileSync(path.join(artifactDir, 'metadata.json'), 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(path.join(artifactDir, 'manifest.json'), 'utf8'));
    if (metadata.schemaVersion !== 1 || manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) throw new Error('schema mismatch');
    return {artifactDir, metadata, files: manifest.files};
  } catch (error) {
    return {artifactDir, error: String(error?.message || error), files: []};
  }
}

function discoverRecoveryArtifacts(root) {
  if (!root || !fs.existsSync(root)) return [];
  if (fs.existsSync(path.join(root, 'metadata.json')) && fs.existsSync(path.join(root, 'manifest.json'))) return [root];
  return fs.readdirSync(root, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(root, entry.name))
    .filter(directory => fs.existsSync(path.join(directory, 'metadata.json')) && fs.existsSync(path.join(directory, 'manifest.json')))
    .sort();
}

function compatibleMetadata(metadata, identity) {
  return metadata.locale === identity.locale
    && metadata.group === identity.group
    && metadata.promptContractSha256 === identity.promptContractSha256
    && metadata.model === identity.model;
}

function restoreCandidate({siteDir, candidate, artifacts, identity}) {
  const sourcePath = safePath(siteDir, candidate.sourcePath, 'Recovery candidate source path');
  const currentSourceHash = sha256(fs.readFileSync(sourcePath));
  if (currentSourceHash !== candidate.sourceHash) return {reason: 'current source hash does not match candidate'};
  for (const artifact of artifacts) {
    if (artifact.error || !compatibleMetadata(artifact.metadata, identity)) continue;
    for (const record of artifact.files) {
      try {
        if (record.sourcePath !== candidate.sourcePath || record.targetPath !== candidate.targetPath) continue;
        safePath(siteDir, record.sourcePath, 'Recovery record source path');
        const targetPath = safePath(siteDir, record.targetPath, 'Recovery record target path');
        if (
          record.status !== 'translated'
          || record.locale !== identity.locale
          || record.group !== identity.group
          || record.promptContractSha256 !== identity.promptContractSha256
          || record.model !== identity.model
          || record.sourceHash !== candidate.sourceHash
          || !SHA256.test(record.targetHash || '')
          || !Number.isInteger(record.targetSize)
          || record.targetSize < 0
        ) continue;
        const artifactTarget = safePath(path.join(artifact.artifactDir, 'translated-files'), record.targetPath, 'Recovery artifact file');
        const stats = fs.lstatSync(artifactTarget);
        if (!stats.isFile() || stats.isSymbolicLink() || stats.size !== record.targetSize) continue;
        const targetBytes = fs.readFileSync(artifactTarget);
        if (sha256(targetBytes) !== record.targetHash) continue;
        fs.mkdirSync(path.dirname(targetPath), {recursive: true});
        fs.writeFileSync(targetPath, targetBytes);
        return {result: {...candidate, status: 'translated', recovered: true}};
      } catch {
        continue;
      }
    }
  }
  return {reason: 'no compatible recovery record'};
}

function restoreRecoveryFiles({siteDir, candidates, artifacts, identity}) {
  assertIdentity(identity);
  const parsedArtifacts = artifacts.map(readArtifact);
  const restored = [];
  const pending = [];
  const rejected = [];
  for (const candidate of candidates) {
    let outcome;
    try {
      outcome = restoreCandidate({siteDir, candidate, artifacts: parsedArtifacts, identity});
    } catch (error) {
      outcome = {reason: String(error?.message || error)};
    }
    if (outcome.result) restored.push(outcome.result);
    else {
      pending.push(candidate);
      if (artifacts.length > 0) rejected.push({...candidate, recoveryReason: outcome.reason});
    }
  }
  return {restored, pending, rejected};
}

function parseCliArgs(argv) {
  const [operation, ...rest] = argv;
  if (operation !== 'create' || rest.length % 2 !== 0) throw new Error('Usage: recovery-artifact.js create --report <path> --output <dir> --target <target> --group <group> --source-sha <sha> --tooling-sha <sha> --model <model> [--mode <mode>]');
  const args = new Map();
  for (let index = 0; index < rest.length; index += 2) args.set(rest[index], rest[index + 1]);
  return {operation, args};
}

function localeForTarget(target) {
  if (target === 'ja-JP') return 'ja-JP';
  if (target === 'zh-CN-reference') return 'zh-CN';
  throw new Error(`Unsupported recovery target: ${target}`);
}

function main() {
  const {args} = parseCliArgs(process.argv.slice(2));
  const reportPath = args.get('--report');
  const outputDir = args.get('--output');
  const target = args.get('--target');
  const report = reportPath && fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {results: []};
  createRecoveryArtifact({
    siteDir: process.cwd(),
    outputDir,
    results: report.results || [],
    identity: {
      locale: localeForTarget(target),
      group: args.get('--group'),
      promptContractSha256: promptContractSha256(target),
      model: args.get('--model'),
      sourceSha: args.get('--source-sha'),
      toolingSha: args.get('--tooling-sha'),
      mode: args.get('--mode') || 'incremental',
    },
  });
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {createRecoveryArtifact, discoverRecoveryArtifacts, parseCliArgs, promptContractSha256, restoreRecoveryFiles, sha256};
