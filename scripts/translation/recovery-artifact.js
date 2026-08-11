#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {loadTypeScript} = require('../lib/load-typescript');
const {localeContractPathFor} = require('./localeContract');
const {promptNamesFor} = require('./restSpecLocalization');
const {boundedFailureDetails, classifyFailure} = require('./failureClassification');
const {
  MAX_PARTIAL_ARTIFACT_BYTES,
  persistChunkCheckpoints,
  validatePersistedPrefix,
} = require('./chunkRecovery');
const {
  persistSemanticCheckpoints,
  semanticCheckpointsFromCompleteTranslation,
  semanticCheckpointBytes,
  validatePersistedSemanticCheckpoints,
} = require('./semanticRecovery');
const {assertSafeRepositoryRelativePath} = loadTypeScript('../../packages/docs-tooling/src/validation/ownership.ts');

const SHA256 = /^[0-9a-f]{64}$/;
const COMMIT_SHA = /^[0-9a-f]{40}$/;
const MAX_REVIEW_RECEIPT_BYTES = 512 * 1024;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function promptContractSha256(target, repositoryRoot = process.cwd()) {
  const names = Object.values(promptNamesFor(target)).filter(Boolean);
  const parts = [target];
  for (const name of [...new Set(names)].sort()) {
    parts.push(name, fs.readFileSync(path.join(repositoryRoot, '.github/prompts', name), 'utf8'));
  }
  const contractPath = localeContractPathFor(target);
  parts.push(contractPath, fs.readFileSync(path.join(repositoryRoot, contractPath), 'utf8'));
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

function cloneJson(value, label) {
  let bytes;
  try {
    bytes = Buffer.from(JSON.stringify(value));
  } catch (error) {
    throw new Error(`${label} is not JSON serializable: ${String(error?.message || error)}`);
  }
  if (bytes.length > MAX_REVIEW_RECEIPT_BYTES) throw new Error(`${label} is oversized`);
  return JSON.parse(bytes.toString('utf8'));
}

function exactReceiptKeys(value) {
  const required = [
    'schemaVersion', 'sourcePath', 'targetPath', 'sourceHash', 'targetHash', 'locale', 'group',
    'promptContractSha256', 'model', 'toolingSha', 'review', 'validationErrors',
  ];
  const optional = ['restSpecReview'];
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Recovery review receipt must be an object');
  const missing = required.filter(key => !Object.hasOwn(value, key));
  const unknown = Object.keys(value).filter(key => !required.includes(key) && !optional.includes(key));
  if (missing.length || unknown.length) throw new Error('Recovery review receipt keys are invalid');
}

function validateRecoveryReviewReceipt(value, expected = {}) {
  const receipt = cloneJson(value, 'Recovery review receipt');
  exactReceiptKeys(receipt);
  if (receipt.schemaVersion !== 1 || !SHA256.test(receipt.sourceHash || '') || !SHA256.test(receipt.targetHash || '') ||
      !['ja-JP', 'zh-CN'].includes(receipt.locale) || typeof receipt.group !== 'string' || !receipt.group ||
      !SHA256.test(receipt.promptContractSha256 || '') || typeof receipt.model !== 'string' || !receipt.model ||
      !COMMIT_SHA.test(receipt.toolingSha || '')) {
    throw new Error('Recovery review receipt identity is invalid');
  }
  for (const key of ['sourcePath', 'targetPath']) safePath(process.cwd(), receipt[key], `Recovery review receipt ${key}`);
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (expectedValue !== undefined && receipt[key] !== expectedValue) throw new Error(`Recovery review receipt ${key} does not match the recovered file`);
  }
  if (!receipt.review || typeof receipt.review !== 'object' || Array.isArray(receipt.review) || receipt.review.pass !== true ||
      !Array.isArray(receipt.review.issues) || receipt.review.issues.length !== 0) {
    throw new Error('Recovery review receipt does not attest reviewer success');
  }
  if (!Array.isArray(receipt.validationErrors) || receipt.validationErrors.length !== 0) {
    throw new Error('Recovery review receipt does not attest clean per-document validation');
  }
  if (receipt.restSpecReview !== undefined && (
    !receipt.restSpecReview || typeof receipt.restSpecReview !== 'object' || Array.isArray(receipt.restSpecReview) ||
    receipt.restSpecReview.pass !== true
  )) {
    throw new Error('Recovery review receipt does not attest REST reviewer success');
  }
  return receipt;
}

function createRecoveryReviewReceipt({result, identity, targetHash}) {
  const expected = {
    sourcePath: result.sourcePath,
    targetPath: result.targetPath,
    sourceHash: result.sourceHash,
    targetHash,
    locale: identity.locale,
    group: identity.group,
  };
  if (result.recoveryReviewReceipt) return validateRecoveryReviewReceipt(result.recoveryReviewReceipt, expected);
  if (!result.review || result.review.pass !== true || !Array.isArray(result.validationErrors) || result.validationErrors.length !== 0 ||
      (result.restSpecReview && result.restSpecReview.pass !== true)) return null;
  return validateRecoveryReviewReceipt({
    schemaVersion: 1,
    ...expected,
    promptContractSha256: identity.promptContractSha256,
    model: identity.model,
    toolingSha: identity.toolingSha,
    review: result.review,
    validationErrors: result.validationErrors,
    ...(result.restSpecReview ? {restSpecReview: result.restSpecReview} : {}),
  }, expected);
}

function reviewFields(receipt) {
  return {
    recoveryReviewReceipt: receipt,
    review: receipt.review,
    validationErrors: receipt.validationErrors,
    ...(receipt.restSpecReview ? {restSpecReview: receipt.restSpecReview} : {}),
  };
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
    const targetHash = sha256(targetBytes);
    if (sourceHash !== result.sourceHash) throw new Error(`Recovery source hash changed: ${result.sourcePath}`);
    const artifactTarget = safePath(path.join(outputDir, 'translated-files'), result.targetPath, 'Recovery artifact target path');
    fs.mkdirSync(path.dirname(artifactTarget), {recursive: true});
    fs.writeFileSync(artifactTarget, targetBytes);
    const reviewReceipt = createRecoveryReviewReceipt({result, identity, targetHash});
    files.push({
      sourcePath: result.sourcePath,
      targetPath: result.targetPath,
      sourceHash,
      targetHash,
      targetSize: targetBytes.length,
      locale: identity.locale,
      group: identity.group,
      promptContractSha256: identity.promptContractSha256,
      model: identity.model,
      status: 'translated',
      ...(reviewReceipt ? {reviewReceipt} : {}),
    });
  }
  let partialArtifactBytes = 0;
  const failures = results.filter(item => item.status !== 'translated').map(result => {
    let chunkCheckpoints = null;
    let semanticCheckpoints = null;
    const errorDetails = boundedFailureDetails(result.errorDetails);
    if (result.chunkCheckpoints) {
      const sourcePath = safePath(siteDir, result.sourcePath, 'Recovery partial source path');
      const sourceHash = sha256(fs.readFileSync(sourcePath));
      if (sourceHash !== result.sourceHash) throw new Error(`Recovery partial source hash changed: ${result.sourcePath}`);
      chunkCheckpoints = persistChunkCheckpoints(result.chunkCheckpoints, identity);
      partialArtifactBytes += chunkCheckpoints.entries.reduce((total, entry) => total + entry.targetSize, 0);
    }
    if (result.semanticCheckpoints) {
      const sourcePath = safePath(siteDir, result.sourcePath, 'Recovery semantic source path');
      const sourceHash = sha256(fs.readFileSync(sourcePath));
      if (sourceHash !== result.sourceHash) throw new Error(`Recovery semantic source hash changed: ${result.sourcePath}`);
      semanticCheckpoints = persistSemanticCheckpoints(result.semanticCheckpoints, identity, {
        ...result,
        target: result.target || result.semanticCheckpoints.target,
        locale: result.locale || result.semanticCheckpoints.locale,
      });
      partialArtifactBytes += semanticCheckpointBytes(semanticCheckpoints);
    }
    if (partialArtifactBytes > MAX_PARTIAL_ARTIFACT_BYTES) throw new Error('Recovery partial artifact payload is oversized');
    return {
      sourcePath: result.sourcePath,
      targetPath: result.targetPath,
      sourceHash: result.sourceHash,
      status: 'failed',
      failureCategory: classifyFailure(result),
      error: String(result.error || 'translation failed').slice(0, 2000),
      ...(errorDetails ? {errorDetails} : {}),
      retryFailures: Array.isArray(result.retryFailures) ? result.retryFailures.map(failure => {
        const retryErrorDetails = boundedFailureDetails(failure.errorDetails);
        return {
          attempt: failure.attempt,
          category: failure.category || classifyFailure(failure),
          error: String(failure.error || 'translation attempt failed').slice(0, 2000),
          ...(typeof failure.code === 'string' ? {code: failure.code.slice(0, 200)} : {}),
          ...(retryErrorDetails ? {errorDetails: retryErrorDetails} : {}),
        };
      }) : [],
      ...(chunkCheckpoints ? {chunkCheckpoints} : {}),
      ...(semanticCheckpoints ? {semanticCheckpoints} : {}),
    };
  });
  failures.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath) || left.targetPath.localeCompare(right.targetPath));
  const failureCounts = {};
  for (const failure of failures) failureCounts[failure.failureCategory] = (failureCounts[failure.failureCategory] || 0) + 1;
  files.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath) || left.targetPath.localeCompare(right.targetPath));
  const metadata = {
    schemaVersion: 2,
    ...identity,
    translated: files.length,
    failed: failures.length,
    resumableFiles: failures.filter(failure => failure.chunkCheckpoints?.entries?.length || failure.semanticCheckpoints?.report?.entries?.length).length,
    checkpointedChunks: failures.reduce((total, failure) => total + (failure.chunkCheckpoints?.entries?.length || 0), 0),
    checkpointedSemanticUnits: failures.reduce((total, failure) => total + (failure.semanticCheckpoints?.report?.entries?.length || 0), 0),
    failureCounts,
  };
  writeJson(path.join(outputDir, 'metadata.json'), metadata);
  writeJson(path.join(outputDir, 'manifest.json'), {schemaVersion: 2, files, failures});
  return {metadata, files, failures};
}

function readArtifact(artifactDir) {
  try {
    const metadata = JSON.parse(fs.readFileSync(path.join(artifactDir, 'metadata.json'), 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(path.join(artifactDir, 'manifest.json'), 'utf8'));
    if (![1, 2].includes(metadata.schemaVersion) || manifest.schemaVersion !== metadata.schemaVersion || !Array.isArray(manifest.files)) throw new Error('schema mismatch');
    if (manifest.schemaVersion === 2 && !Array.isArray(manifest.failures)) throw new Error('schema mismatch');
    if (manifest.schemaVersion === 2) {
      let partialArtifactBytes = 0;
      for (const failure of manifest.failures) {
        for (const entry of failure?.chunkCheckpoints?.entries || []) {
          if (typeof entry?.translatedContent !== 'string') continue;
          partialArtifactBytes += Buffer.byteLength(entry.translatedContent);
        }
        partialArtifactBytes += semanticCheckpointBytes(failure?.semanticCheckpoints);
        if (partialArtifactBytes > MAX_PARTIAL_ARTIFACT_BYTES) throw new Error('partial artifact payload is oversized');
      }
    }
    return {artifactDir, metadata, files: manifest.files, failures: manifest.failures || []};
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

function metadataCompatibilityReason(metadata, identity) {
  if (metadata.locale !== identity.locale || metadata.group !== identity.group) return 'recovery artifact locale or group mismatch';
  return '';
}

function preferRecoveryReason(reasons) {
  const priorities = [
    /source hash/i,
    /prompt contract/i,
    /model/i,
    /locale or group/i,
    /corrupt/i,
    /invalid/i,
    /missing/i,
  ];
  for (const pattern of priorities) {
    const match = reasons.find(reason => pattern.test(reason));
    if (match) return match;
  }
  return reasons[0] || 'missing recovery record';
}

function restoreCandidate({siteDir, candidate, artifacts, identity, revalidate, chunkOptions}) {
  const sourcePath = safePath(siteDir, candidate.sourcePath, 'Recovery candidate source path');
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  const currentSourceHash = sha256(Buffer.from(sourceContent));
  if (currentSourceHash !== candidate.sourceHash) return {reason: 'current source hash does not match recovery candidate'};
  const reasons = [];
  let bestChunkResume = null;
  let bestSemanticResume = null;
  for (const artifact of artifacts) {
    if (artifact.error) {
      reasons.push(`corrupt recovery artifact: ${artifact.error}`);
      continue;
    }
    const metadataReason = metadataCompatibilityReason(artifact.metadata, identity);
    if (metadataReason) {
      reasons.push(metadataReason);
      continue;
    }
    const records = artifact.files.filter(record => record?.sourcePath === candidate.sourcePath && record?.targetPath === candidate.targetPath);
    if (!records.length) {
      reasons.push('missing recovery record for current candidate');
      continue;
    }
    for (const record of records) {
      try {
        safePath(siteDir, record.sourcePath, 'Recovery record source path');
        const targetPath = safePath(siteDir, record.targetPath, 'Recovery record target path');
        if (record.sourceHash !== candidate.sourceHash) {
          reasons.push('recovery record source hash mismatch');
          continue;
        }
        if (record.promptContractSha256 !== artifact.metadata.promptContractSha256 || record.model !== artifact.metadata.model) {
          reasons.push('invalid recovery record execution identity');
          continue;
        }
        if (record.status !== 'translated' || record.locale !== identity.locale || record.group !== identity.group ||
            !SHA256.test(record.targetHash || '') || !Number.isInteger(record.targetSize) || record.targetSize < 0) {
          reasons.push('invalid recovery record');
          continue;
        }
        const artifactTarget = safePath(path.join(artifact.artifactDir, 'translated-files'), record.targetPath, 'Recovery artifact file');
        const stats = fs.lstatSync(artifactTarget);
        if (!stats.isFile() || stats.isSymbolicLink() || stats.size !== record.targetSize) {
          reasons.push('corrupt recovery record target payload');
          continue;
        }
        const targetBytes = fs.readFileSync(artifactTarget);
        if (sha256(targetBytes) !== record.targetHash) {
          reasons.push('corrupt recovery record target hash');
          continue;
        }
        const compatibility = record.promptContractSha256 === identity.promptContractSha256 && record.model === identity.model &&
          artifact.metadata.toolingSha === identity.toolingSha
          ? 'strict'
          : 'revalidated'
        let currentContractValidated = false;
        if (compatibility === 'revalidated') {
          if (typeof revalidate !== 'function') {
            reasons.push(record.promptContractSha256 !== identity.promptContractSha256
              ? 'recovery prompt contract mismatch'
              : record.model !== identity.model
                ? 'recovery model mismatch'
                : 'recovery tooling validation identity mismatch');
            continue;
          }
          const validationErrors = revalidate({
            candidate,
            sourceContent,
            targetContent: targetBytes.toString('utf8'),
          });
          if (!Array.isArray(validationErrors) || validationErrors.length) {
            reasons.push(`revalidation failed: ${(validationErrors || ['validator did not return an error list']).join('; ')}`);
            continue;
          }
          currentContractValidated = true;
        }
        let reviewReceipt = null;
        try {
          reviewReceipt = validateRecoveryReviewReceipt(record.reviewReceipt, {
            sourcePath: record.sourcePath,
            targetPath: record.targetPath,
            sourceHash: record.sourceHash,
            targetHash: record.targetHash,
            locale: record.locale,
            group: record.group,
          });
        } catch (error) {
          reasons.push(`recovery reviewer receipt is missing or invalid: ${String(error?.message || error)}`);
        }
        if (reviewReceipt) {
          fs.mkdirSync(path.dirname(targetPath), {recursive: true});
          fs.writeFileSync(targetPath, targetBytes);
          return {
            result: {
              ...candidate,
              status: 'translated',
              recovered: true,
              recoveryCompatibility: compatibility,
              ...reviewFields(reviewReceipt),
            },
            targetHash: record.targetHash,
            targetSize: record.targetSize,
          };
        }
        if (typeof revalidate !== 'function') continue;
        if (!currentContractValidated) {
          const validationErrors = revalidate({candidate, sourceContent, targetContent: targetBytes.toString('utf8')});
          if (!Array.isArray(validationErrors) || validationErrors.length) {
            reasons.push(`revalidation failed: ${(validationErrors || ['validator did not return an error list']).join('; ')}`);
            continue;
          }
        }
        try {
          const target = identity.target || (identity.locale === 'ja-JP' ? 'ja-JP' : 'zh-CN-reference');
          const semanticItem = {...candidate, target, locale: identity.locale};
          const report = semanticCheckpointsFromCompleteTranslation({
            sourceContent,
            targetContent: targetBytes.toString('utf8'),
            item: semanticItem,
            chunkOptions,
          });
          const persisted = persistSemanticCheckpoints(report, artifact.metadata, semanticItem);
          const semanticResume = validatePersistedSemanticCheckpoints({
            value: persisted,
            artifactIdentity: artifact.metadata,
            currentIdentity: identity,
            candidate,
            target,
            sourceContent,
            chunkOptions,
          });
          if (!bestSemanticResume || semanticResume.report.entries.length > bestSemanticResume.report.entries.length) bestSemanticResume = semanticResume;
        } catch (error) {
          reasons.push(`recovery reviewer receipt is unavailable and the complete target could not be retained as semantic checkpoints: ${String(error?.message || error)}`);
        }
      } catch (error) {
        reasons.push(`invalid recovery record: ${String(error?.message || error)}`);
      }
    }
  }
  const rejectedChunks = [];
  for (const artifact of artifacts) {
    if (artifact.error || artifact.metadata?.schemaVersion !== 2) continue;
    const metadataReason = metadataCompatibilityReason(artifact.metadata, identity);
    if (metadataReason) continue;
    const records = artifact.failures.filter(record => record?.sourcePath === candidate.sourcePath && record?.targetPath === candidate.targetPath);
    for (const record of records) {
      if (record.sourceHash !== candidate.sourceHash) continue;
      if (record.chunkCheckpoints) {
        const outcome = validatePersistedPrefix({
          value: record.chunkCheckpoints,
          artifactIdentity: artifact.metadata,
          currentIdentity: identity,
          sourceContent,
          chunkOptions,
          revalidate: input => revalidate?.({...candidate, ...input, candidate}),
        });
        rejectedChunks.push(...outcome.rejected.map(rejection => ({...rejection, artifactDir: artifact.artifactDir})));
        if (outcome.resume && (!bestChunkResume || outcome.resume.recoveredChunkCount > bestChunkResume.recoveredChunkCount)) bestChunkResume = outcome.resume;
      }
      if (record.semanticCheckpoints) {
        try {
          const semanticResume = validatePersistedSemanticCheckpoints({
            value: record.semanticCheckpoints,
            artifactIdentity: artifact.metadata,
            currentIdentity: identity,
            candidate,
            target: identity.target || (identity.locale === 'ja-JP' ? 'ja-JP' : 'zh-CN-reference'),
            sourceContent,
            chunkOptions,
          });
          if (!bestSemanticResume || semanticResume.report.entries.length > bestSemanticResume.report.entries.length) bestSemanticResume = semanticResume;
        } catch (error) {
          reasons.push(`invalid semantic recovery checkpoint: ${String(error?.message || error)}`);
        }
      }
    }
  }
  if (bestChunkResume || bestSemanticResume) return {chunkResume: bestChunkResume, semanticResume: bestSemanticResume, rejectedChunks};
  return {reason: preferRecoveryReason(reasons), rejectedChunks};
}

function restoreRecoveryFiles({siteDir, candidates, artifacts, identity, revalidate, chunkOptions}) {
  assertIdentity(identity);
  const parsedArtifacts = artifacts.map(readArtifact);
  const restored = [];
  const pending = [];
  const rejected = [];
  const rejectedChunks = [];
  for (const candidate of candidates) {
    let outcome;
    try {
      outcome = restoreCandidate({siteDir, candidate, artifacts: parsedArtifacts, identity, revalidate, chunkOptions});
    } catch (error) {
      outcome = {reason: String(error?.message || error)};
    }
    if (outcome.result) restored.push({...outcome.result, recoveryTargetHash: outcome.targetHash, recoveryTargetSize: outcome.targetSize});
    else {
      pending.push({
        ...candidate,
        ...(outcome.chunkResume ? {recoveryChunkResume: outcome.chunkResume} : {}),
        ...(outcome.semanticResume ? {recoverySemanticResume: outcome.semanticResume} : {}),
      });
      if (artifacts.length > 0 && !outcome.chunkResume && !outcome.semanticResume) rejected.push({...candidate, recoveryReason: outcome.reason});
    }
    rejectedChunks.push(...(outcome.rejectedChunks || []).map(rejection => ({
      sourcePath: candidate.sourcePath,
      targetPath: candidate.targetPath,
      index: rejection.index,
      reason: rejection.reason,
    })));
  }
  return {restored, pending, rejected, rejectedChunks};
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

module.exports = {
  createRecoveryArtifact,
  discoverRecoveryArtifacts,
  parseCliArgs,
  promptContractSha256,
  readArtifact,
  restoreRecoveryFiles,
  sha256,
  validateRecoveryReviewReceipt,
};
