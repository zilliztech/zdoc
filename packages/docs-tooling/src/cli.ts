#!/usr/bin/env node
import {spawnSync as nodeSpawnSync} from 'node:child_process';
import {createHash, randomUUID} from 'node:crypto';
import {closeSync, constants, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';

import {
  createPublicationAdapterRegistry,
  createZhCnPublicationAdapterRegistry,
  type PublicationAdapterRegistry,
} from '@zilliz/publication-adapters';
import type {AliyunOssValidator, PublicationContext} from '@zilliz/publication-adapters';
import {resolveSiteProfile} from '@zilliz/site-config';

import {resolveManualPublication, type SourceEntry} from './manuals/registry.ts';
import {manualRegistry, publicationEntries} from './manuals/registry.ts';
import type {ManualDefinition, ManualPublication, ManualSource, SiteId} from './manuals/schema.ts';
import {atomicReplace, withAtomicPublicationGroupFence, type AtomicReplaceOptions, type AtomicValidationSnapshot} from './publication/atomicReplace.ts';
import {
  capturePublicationDiagnostics,
  publicationOwnedTargets,
  readAndValidatePublicationDiagnostics,
  writePublicationAnchor,
  writePublicationDiagnostics,
  type PublicationDiagnostics,
  type PublicationDiagnosticsIdentity,
} from './publication/diagnostics.ts';
import {
  copySecureTree,
  ensureSecureDirectory,
  readSecureFile,
  removeSecureStageTree,
  resolveSecureRepositoryPath,
  securePathExists,
  writeSecureAtomicFile,
} from './publication/stageControl.ts';
import {validateStageFilesystem, type StageInventory} from './validation/filesystem.ts';
import {
  buildReferenceManifests,
  assertSafeRepositoryPathChain,
  captureReferenceTree,
  parseReferenceRetirementRegistry,
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
  serializeReferenceManifest,
  type ReferenceRetirementRegistry,
  type ReferenceSourceManifest,
  type ReferenceTreeSnapshot,
  type ReferenceTranslationManifest,
} from './reference/translationManifest.ts';
import {deriveReferenceSidebarPublicationEntries, deriveZhCnReferenceSidebarGroupEntries} from './reference/sidebarDerivation.ts';
import {deriveRestSidebar, serializeRestSidebar} from './reference/restSidebarDerivation.ts';
import {parseReferenceReconciliationLedger} from './reference/reconciliationLedger.ts';
import {validateReferenceNavigation} from './validation/referenceNavigation.ts';
import {parseLocalizationInputInventory} from './validation/localizationInputInventory.mjs';
import {
  validateReferenceSource,
  validateReferenceTranslation,
  validateReferenceReconciliationLedger,
  type TranslationSourceProvenance,
  type TranslationSourceProvenanceVerifier,
} from './validation/translation.ts';
import {scanIntegrity} from './validation/integrity.mjs';
import {
  assertPublicationOwnership,
  assertSafeRepositoryRelativePath,
  resolveOwnedRepositoryPath,
} from './validation/ownership.ts';
import {canonicalPublicationGroupForManual} from './workflows/groups.ts';

export type DocsToolingCommand = 'fetch' | 'validate' | 'publish';

export type CliRequest = Readonly<{
  command: DocsToolingCommand;
  group: string;
  manual: string;
  site: SiteId;
  stage: string;
}>;

type ResolvedPublication = ReturnType<typeof resolveManualPublication>;

export type CommandContext = Readonly<{
  request: CliRequest;
  repositoryRoot: string;
  stagePath: string;
  manual: ResolvedPublication['manual'];
  source: ResolvedPublication['source'];
  sourceChain: ResolvedPublication['sourceChain'];
  publication: ResolvedPublication['publication'];
  publicationDiagnostics?: PublicationDiagnostics;
  baselineCommit?: string;
  inventory?: StageInventory;
}>;

export type PublicationStagePaths = Readonly<{
  contentRootPath: string;
  outputPath: string;
  sidebarPath: string;
}>;

export type CliDependencies = {
  repositoryRoot?: string;
  environment?: NodeJS.ProcessEnv;
  fetch?: (context: CommandContext) => void | Promise<void>;
  publish?: (context: CommandContext) => void | Promise<void>;
  atomicReplace?: (options: AtomicReplaceOptions) => Promise<void>;
  spawnSync?: GeneratorRunner;
  aliyunOssValidator?: AliyunOssValidator;
  write?: (message: string) => void;
};

export type GeneratorResult = Readonly<{
  error?: Error;
  signal?: NodeJS.Signals | null;
  status: number | null;
}>;

export type GeneratorRunner = (
  command: string,
  args: readonly string[],
  options: Readonly<{cwd: string; env: NodeJS.ProcessEnv; stdio: 'inherit'}>,
) => GeneratorResult;

export type ReferenceCommandDependencies = Readonly<{
  repositoryRoot?: string;
  environment?: NodeJS.ProcessEnv;
  resolveSourceCommit?: (revision: string) => string;
  verifySourceRevision?: (commit: string, sourceRoot: string, snapshot?: ReferenceTreeSnapshot) => void;
  verifyTranslationSourceProvenance?: TranslationSourceProvenanceVerifier;
  manualForPath?: (repositoryRelativePath: string) => string;
  retirementRegistry?: ReferenceRetirementRegistry;
  validateReferenceNavigation?: typeof validateReferenceNavigation;
  write?: (message: string) => void;
}>;

export type ReferenceGitCommandResult = Readonly<{
  error?: Error;
  status: number | null;
  signal?: NodeJS.Signals | null;
  stdout: string | Buffer;
  stderr: string | Buffer;
}>;

export type ReferenceGitRunner = (
  args: readonly string[],
  options: Readonly<{encoding: 'utf8' | 'buffer'; maxBuffer: number; input?: Buffer}>,
) => ReferenceGitCommandResult;

const REFERENCE_SOURCE_ROOT = 'content/en/reference';
const REFERENCE_TARGET_ROOT = 'content/zh-CN/reference';
const REFERENCE_SOURCE_MANIFEST = 'generated/en/manifests/reference.json';
const REFERENCE_TRANSLATION_MANIFEST = 'generated/zh-CN/manifests/reference-translations.json';
const REFERENCE_RETIREMENT_REGISTRY = 'config/reference-retirements.json';
const REFERENCE_RECONCILIATION_LEDGER = 'generated/zh-CN/manifests/reference-reconciliation-ledger.json';
const EXTERNAL_SNAPSHOT_WORKTREE = 'external-snapshot';
const EXTERNAL_SNAPSHOT_TRACKED_INPUTS = 'deploy/contracts/localization-inputs.inventory.json';
const GIT_STDERR_LIMIT = 512;
const GIT_BATCH_BLOB_LIMIT = 64;
const GIT_MAX_BUFFER = 64 * 1024 * 1024;

function resolveGitCommit(repositoryRoot: string, revision: string): string {
  const result = nodeSpawnSync('git', ['rev-parse', '--verify', `${revision}^{commit}`], {cwd: repositoryRoot, encoding: 'utf8'});
  if (result.error || result.status !== 0) throw new Error(`Could not resolve source commit ${revision}: ${result.stderr || result.error?.message || 'git failed'}`);
  const commit = result.stdout.trim();
  if (!/^[a-f0-9]{40}$/u.test(commit)) throw new Error(`Resolved source commit is not a stable commit SHA: ${commit}`);
  return commit;
}

function referenceContentPath(filePath: string, root: string): boolean {
  return filePath !== `${root}/.gitkeep` && filePath !== `${root}/content-manifest.json`;
}

function gitCommitSnapshot(repositoryRoot: string, commit: string, sourceRoot: string): ReferenceTreeSnapshot {
  const listing = nodeSpawnSync('git', ['ls-tree', '-rz', '--full-tree', commit, '--', sourceRoot], {cwd: repositoryRoot, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024});
  if (listing.error || listing.status !== 0) throw new Error(`Could not enumerate declared commit tree ${commit}: ${listing.stderr?.toString() || listing.error?.message || 'git failed'}`);
  const files = new Map<string, string>();
  for (const entry of listing.stdout.toString('utf8').split('\0')) {
    if (!entry) continue;
    const match = /^\d+ blob ([a-f0-9]+)\t(.+)$/u.exec(entry);
    if (!match) throw new Error(`Declared commit tree contains an unsupported entry: ${entry}`);
    const [, objectId, filePath] = match;
    if (!referenceContentPath(filePath, sourceRoot)) continue;
    assertSafeRepositoryRelativePath(filePath, 'Declared Reference source path');
    const blob = nodeSpawnSync('git', ['cat-file', 'blob', objectId], {cwd: repositoryRoot, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024});
    if (blob.error || blob.status !== 0) throw new Error(`Could not read declared source blob ${objectId}: ${blob.stderr?.toString() || blob.error?.message || 'git failed'}`);
    files.set(filePath, createHash('sha256').update(blob.stdout).digest('hex'));
  }
  return files;
}

function assertSnapshotsEqual(expected: ReferenceTreeSnapshot, actual: ReferenceTreeSnapshot, label: string): void {
  if (expected.size !== actual.size) throw new Error(`${label} path set does not match the declared snapshot`);
  for (const [filePath, hash] of expected) {
    if (actual.get(filePath) !== hash) throw new Error(`${label} differs from the declared snapshot at ${filePath}`);
  }
}

function verifyGitSourceRevision(repositoryRoot: string, commit: string, sourceRoot: string, snapshot: ReferenceTreeSnapshot): void {
  assertSnapshotsEqual(gitCommitSnapshot(repositoryRoot, commit, sourceRoot), snapshot, 'Reference source commit tree');
}

function verifyReferenceSourceRevision(
  repositoryRoot: string,
  commit: string,
  sourceRoot: string,
  snapshot: ReferenceTreeSnapshot,
  externalSnapshot: ExternalSnapshotIdentity | undefined,
): void {
  if (externalSnapshot) return;
  verifyGitSourceRevision(repositoryRoot, commit, sourceRoot, snapshot);
}

type ExternalSnapshotIdentity = Readonly<{
  commit: string;
  trackedInputInventory: string;
}>;

function boundedGitOutput(value: string | Buffer | undefined): string {
  const output = Buffer.isBuffer(value) ? value.toString('utf8') : String(value ?? '');
  return output.trim().slice(0, GIT_STDERR_LIMIT);
}

function gitCommandFailure(result: ReferenceGitCommandResult, context: string): Error {
  const stderr = boundedGitOutput(result.stderr);
  if (result.error) return new Error(`${context}: could not start Git: ${result.error.message}${stderr ? `: ${stderr}` : ''}`);
  if (result.signal) return new Error(`${context}: Git terminated by signal ${result.signal}${stderr ? `: ${stderr}` : ''}`);
  return new Error(`${context}: Git failed with status ${result.status ?? 'unknown'}${stderr ? `: ${stderr}` : ''}`);
}

function defaultReferenceGitRunner(repositoryRoot: string): ReferenceGitRunner {
  return (args, options) => nodeSpawnSync('git', args, {cwd: repositoryRoot, ...options}) as ReferenceGitCommandResult;
}

function assertGitCommit(runGit: ReferenceGitRunner, commit: string, label: string): void {
  const result = runGit(['cat-file', '-e', `${commit}^{commit}`], {encoding: 'utf8', maxBuffer: 1024 * 1024});
  if (result.error || result.signal || result.status === null) throw gitCommandFailure(result, `Could not inspect ${label}`);
  if (result.status !== 0) {
    const stderr = boundedGitOutput(result.stderr);
    throw new Error(`${label} is unknown: ${commit}${stderr ? `: ${stderr}` : ''}`);
  }
}

function parseHistoricalTree(listing: Buffer, commit: string): ReadonlyMap<string, Readonly<{mode: string; type: string; objectId: string}>> {
  const entries = new Map<string, Readonly<{mode: string; type: string; objectId: string}>>();
  for (const serialized of listing.toString('utf8').split('\0')) {
    if (!serialized) continue;
    const tab = serialized.indexOf('\t');
    const header = tab < 0 ? [] : serialized.slice(0, tab).split(' ');
    if (header.length !== 3 || !/^[0-7]{6}$/u.test(header[0]) || !/^[a-f0-9]+$/u.test(header[2])) {
      throw new Error(`Historical Reference tree at ${commit} contains an unsupported entry: ${serialized.slice(0, 160)}`);
    }
    entries.set(serialized.slice(tab + 1), {mode: header[0], type: header[1], objectId: header[2]});
  }
  return entries;
}

function parseBlobBatch(output: Buffer, objectIds: readonly string[]): ReadonlyMap<string, string> {
  const hashes = new Map<string, string>();
  let offset = 0;
  for (const expectedObjectId of objectIds) {
    const headerEnd = output.indexOf(0x0a, offset);
    if (headerEnd < 0) throw new Error(`Historical source blob batch response is truncated at ${expectedObjectId}`);
    const [objectId, type, sizeText] = output.subarray(offset, headerEnd).toString('utf8').split(' ');
    const size = Number(sizeText);
    if (objectId !== expectedObjectId || type !== 'blob' || !Number.isSafeInteger(size) || size < 0) {
      throw new Error(`Historical source blob batch returned an invalid header for ${expectedObjectId}`);
    }
    const contentsStart = headerEnd + 1;
    const contentsEnd = contentsStart + size;
    if (contentsEnd >= output.length || output[contentsEnd] !== 0x0a) {
      throw new Error(`Historical source blob batch response is truncated at ${expectedObjectId}`);
    }
    hashes.set(objectId, createHash('sha256').update(output.subarray(contentsStart, contentsEnd)).digest('hex'));
    offset = contentsEnd + 1;
  }
  if (offset !== output.length) throw new Error('Historical source blob batch returned unexpected trailing data');
  return hashes;
}

export function createGitTranslationSourceProvenanceVerifier(
  repositoryRoot: string,
  sourceRoot: string,
  runner: ReferenceGitRunner = defaultReferenceGitRunner(repositoryRoot),
): TranslationSourceProvenanceVerifier {
  return provenance => {
    if (provenance.length === 0) return;
    const pairs = new Map<string, readonly TranslationSourceProvenance[]>();
    for (const record of provenance) {
      const key = `${record.sourceCommit}\0${record.sourceManifestCommit}`;
      pairs.set(key, [...(pairs.get(key) ?? []), record]);
    }
    const verifiedCommits = new Set<string>();
    for (const records of pairs.values()) {
      const [record] = records;
      for (const [commit, label] of [
        [record.sourceCommit, 'Translation source commit'],
        [record.sourceManifestCommit, 'Source manifest commit'],
      ] as const) {
        if (!verifiedCommits.has(commit)) {
          assertGitCommit(runner, commit, label);
          verifiedCommits.add(commit);
        }
      }
      const ancestor = runner(
        ['merge-base', '--is-ancestor', record.sourceCommit, record.sourceManifestCommit],
        {encoding: 'utf8', maxBuffer: 1024 * 1024},
      );
      if (ancestor.error || ancestor.signal || ancestor.status === null || (ancestor.status !== 0 && ancestor.status !== 1)) {
        throw gitCommandFailure(ancestor, `Could not verify Translation source commit ancestry for ${record.sourcePath}`);
      }
      if (ancestor.status === 1) {
        throw new Error(`Translation source commit is not an ancestor of the source manifest commit: ${record.sourcePath}`);
      }
    }

    const recordsBySourceCommit = new Map<string, TranslationSourceProvenance[]>();
    for (const record of provenance) {
      const records = recordsBySourceCommit.get(record.sourceCommit) ?? [];
      records.push(record);
      recordsBySourceCommit.set(record.sourceCommit, records);
    }
    for (const [sourceCommit, records] of recordsBySourceCommit) {
      const listing = runner(
        ['ls-tree', '-r', '-t', '-z', '--full-tree', sourceCommit, '--', sourceRoot],
        {encoding: 'buffer', maxBuffer: GIT_MAX_BUFFER},
      );
      if (listing.error || listing.signal || listing.status !== 0) {
        throw gitCommandFailure(listing, `Could not enumerate historical Reference tree at ${sourceCommit}`);
      }
      const historicalEntries = parseHistoricalTree(Buffer.isBuffer(listing.stdout) ? listing.stdout : Buffer.from(listing.stdout), sourceCommit);
      const blobs = new Map<string, TranslationSourceProvenance[]>();
      for (const record of records) {
        const entry = historicalEntries.get(record.sourcePath);
        if (record.expectedHistoricalSource === 'missing') {
          if (entry) throw new Error(`Historical retired source path must be missing at ${record.sourceCommit}: ${record.sourcePath}`);
          continue;
        }
        if (!entry || !['100644', '100755'].includes(entry.mode) || entry.type !== 'blob') {
          throw new Error(`Historical source path is missing or is not a regular Git blob at ${record.sourceCommit}: ${record.sourcePath}`);
        }
        blobs.set(entry.objectId, [...(blobs.get(entry.objectId) ?? []), record]);
      }
      const objectIds = [...blobs.keys()];
      const hashes = new Map<string, string>();
      for (let index = 0; index < objectIds.length; index += GIT_BATCH_BLOB_LIMIT) {
        const batch = objectIds.slice(index, index + GIT_BATCH_BLOB_LIMIT);
        const result = runner(
          ['cat-file', '--batch'],
          {encoding: 'buffer', maxBuffer: GIT_MAX_BUFFER, input: Buffer.from(`${batch.join('\n')}\n`)},
        );
        if (result.error || result.signal || result.status !== 0) {
          throw gitCommandFailure(result, `Could not read historical source blob batch at ${sourceCommit}`);
        }
        for (const [objectId, hash] of parseBlobBatch(Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.from(result.stdout), batch)) {
          hashes.set(objectId, hash);
        }
      }
      for (const [objectId, blobRecords] of blobs) {
        for (const record of blobRecords) {
          if (hashes.get(objectId) !== record.sourceHash) {
            throw new Error(`Historical source hash mismatch at ${record.sourceCommit}: ${record.sourcePath}`);
          }
        }
      }
    }
  };
}

function resolveExternalSnapshotIdentity(repositoryRoot: string, environment: NodeJS.ProcessEnv): ExternalSnapshotIdentity | undefined {
  const hasCommit = Object.hasOwn(environment, 'ZDOC_PROVENANCE_COMMIT');
  const hasWorktree = Object.hasOwn(environment, 'ZDOC_PROVENANCE_WORKTREE');
  const hasTrackedInputs = Object.hasOwn(environment, 'ZDOC_PROVENANCE_TRACKED_INPUTS');
  if (!hasCommit && !hasWorktree && !hasTrackedInputs) return undefined;
  if (!hasCommit || !hasWorktree || !hasTrackedInputs) {
    throw new Error('External snapshot provenance requires a complete commit, worktree mode, and tracked inputs identity');
  }
  if (environment.ZDOC_PROVENANCE_WORKTREE !== EXTERNAL_SNAPSHOT_WORKTREE) {
    throw new Error(`External snapshot provenance worktree mode must be ${EXTERNAL_SNAPSHOT_WORKTREE}`);
  }
  const commit = String(environment.ZDOC_PROVENANCE_COMMIT);
  if (!/^[a-f0-9]{40}$/u.test(commit)) {
    throw new Error('External snapshot provenance commit must be a 40-character lowercase Git SHA');
  }
  if (existsSync(path.join(repositoryRoot, '.git'))) {
    throw new Error('External snapshot prevalidated provenance cannot be used when Git metadata is present');
  }
  const trackedInputInventory = String(environment.ZDOC_PROVENANCE_TRACKED_INPUTS);
  if (trackedInputInventory !== EXTERNAL_SNAPSHOT_TRACKED_INPUTS) {
    throw new Error(`External snapshot provenance tracked inputs must use ${EXTERNAL_SNAPSHOT_TRACKED_INPUTS}`);
  }
  const inventoryPath = assertSafeRepositoryPathChain(repositoryRoot, trackedInputInventory, 'External snapshot tracked inputs');
  if (!existsSync(inventoryPath) || !lstatSync(inventoryPath).isFile()) {
    throw new Error(`External snapshot provenance tracked inputs inventory is missing: ${trackedInputInventory}`);
  }
  let inventory: unknown;
  try {
    inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  } catch (error) {
    throw new Error('External snapshot provenance tracked inputs inventory is not valid JSON', {cause: error});
  }
  parseLocalizationInputInventory(inventory);
  return {commit, trackedInputInventory};
}

/**
 * Git-backed validation proves ancestry and historical blobs before promotion.
 * A Git-less Docker snapshot revalidates all current manifests, files, hashes,
 * and retirements while consuming the already-prevalidated exact snapshot identity.
 */
function createPrevalidatedExternalSnapshotProvenanceVerifier(
  _identity: ExternalSnapshotIdentity,
): TranslationSourceProvenanceVerifier {
  return () => undefined;
}

export function defaultReferenceManualForPath(filePath: string): string {
  const candidates = publicationEntries(manualRegistry)
    .filter(entry => entry.manual.kind === 'reference')
    .flatMap(entry => {
      const active = entry.publication.outputDir;
      const retired = (entry.publication.retiredPaths ?? []).map(retiredPath => `content/${entry.site}/${retiredPath}`);
      const referenceRoot = `content/${entry.site}/reference/`;
      const relative = active.slice(referenceRoot.length).split('/');
      const family = `${referenceRoot}${relative[0] === 'api' ? relative.slice(0, 2).join('/') : relative[0]}`;
      return [active, ...retired, family].map(prefix => ({manual: entry.manual.id, prefix}));
    })
    .filter(candidate => filePath === candidate.prefix || filePath.startsWith(`${candidate.prefix}/`))
    .sort((left, right) => right.prefix.length - left.prefix.length || (left.manual < right.manual ? -1 : left.manual > right.manual ? 1 : 0));
  const selected = candidates[0];
  if (!selected) throw new Error(`Reference file is not owned by a registered manual: ${filePath}`);
  return selected.manual;
}

function readJson(repositoryRoot: string, relativePath: string): unknown {
  const absolutePath = assertSafeRepositoryPathChain(repositoryRoot, relativePath, 'Reference JSON input');
  if (!existsSync(absolutePath)) throw new Error(`Reference manifest is missing: ${relativePath}`);
  const noFollow = typeof constants.O_NOFOLLOW === 'number' ? constants.O_NOFOLLOW : 0;
  const descriptor = openSync(absolutePath, constants.O_RDONLY | noFollow);
  try {
    return JSON.parse(readFileSync(descriptor, 'utf8'));
  } catch (error) {
    throw new Error(`Reference manifest is not valid JSON: ${relativePath}`, {cause: error});
  } finally {
    closeSync(descriptor);
  }
}

type ReferenceManifestState = Readonly<{
  sourceManifest: ReferenceSourceManifest;
  translationManifest: ReferenceTranslationManifest;
}>;

function referenceJsonExists(repositoryRoot: string, relativePath: string): boolean {
  return existsSync(assertSafeRepositoryPathChain(repositoryRoot, relativePath, 'Reference JSON input'));
}

function readReferenceManifestState(repositoryRoot: string): ReferenceManifestState | undefined {
  const sourceExists = referenceJsonExists(repositoryRoot, REFERENCE_SOURCE_MANIFEST);
  const translationExists = referenceJsonExists(repositoryRoot, REFERENCE_TRANSLATION_MANIFEST);
  if (sourceExists !== translationExists) {
    throw new Error('Reference source and translation manifests must either both exist or both be absent');
  }
  if (!sourceExists) return undefined;
  return {
    sourceManifest: parseReferenceSourceManifest(readJson(repositoryRoot, REFERENCE_SOURCE_MANIFEST)),
    translationManifest: parseReferenceTranslationManifest(readJson(repositoryRoot, REFERENCE_TRANSLATION_MANIFEST)),
  };
}

function sourceManifestSnapshot(
  sourceManifest: ReferenceSourceManifest,
  sourceRoot: string,
  manualForPath: (filePath: string) => string,
): ReferenceTreeSnapshot {
  const snapshot = new Map<string, string>();
  for (const record of sourceManifest.records) {
    if (!record.sourcePath.startsWith(`${sourceRoot}/`)) {
      throw new Error(`Source path must stay within ${sourceRoot}: ${record.sourcePath}`);
    }
    if (manualForPath(record.sourcePath) !== record.manual) {
      throw new Error(`Reference source manual does not match authoritative ownership: ${record.sourcePath}`);
    }
    if (snapshot.has(record.sourcePath)) throw new Error(`Duplicate canonical source: ${record.sourcePath}`);
    snapshot.set(record.sourcePath, record.sourceHash);
  }
  return snapshot;
}

function authenticateHistoricalReferenceManifestState(options: Readonly<{
  repositoryRoot: string;
  state: ReferenceManifestState;
  currentSourceCommit: string;
  manualForPath: (filePath: string) => string;
  verifySourceRevision?: ReferenceCommandDependencies['verifySourceRevision'];
  verifyTranslationSourceProvenance?: TranslationSourceProvenanceVerifier;
}>): void {
  const snapshot = sourceManifestSnapshot(options.state.sourceManifest, REFERENCE_SOURCE_ROOT, options.manualForPath);
  if (options.verifySourceRevision) {
    options.verifySourceRevision(options.state.sourceManifest.sourceCommit, REFERENCE_SOURCE_ROOT, snapshot);
  } else {
    verifyGitSourceRevision(options.repositoryRoot, options.state.sourceManifest.sourceCommit, REFERENCE_SOURCE_ROOT, snapshot);
    const ancestry = defaultReferenceGitRunner(options.repositoryRoot)(
      ['merge-base', '--is-ancestor', options.state.sourceManifest.sourceCommit, options.currentSourceCommit],
      {encoding: 'utf8', maxBuffer: 1024 * 1024},
    );
    if (ancestry.error || ancestry.signal || ancestry.status === null || (ancestry.status !== 0 && ancestry.status !== 1)) {
      throw gitCommandFailure(ancestry, 'Could not verify previous Reference source manifest ancestry');
    }
    if (ancestry.status === 1) {
      throw new Error('Previous Reference source manifest commit is not an ancestor of the current source checkpoint');
    }
  }
  validateReferenceTranslation({
    repositoryRoot: options.repositoryRoot,
    sourceRoot: REFERENCE_SOURCE_ROOT,
    targetRoot: REFERENCE_TARGET_ROOT,
    sourceManifest: options.state.sourceManifest,
    translationManifest: options.state.translationManifest,
    verifyFiles: false,
    manualForPath: options.manualForPath,
    verifySourceProvenance: options.verifyTranslationSourceProvenance
      ?? createGitTranslationSourceProvenanceVerifier(options.repositoryRoot, REFERENCE_SOURCE_ROOT),
  });
}

function unavailableReferenceTargetIds(state: ReferenceManifestState): Set<string> {
  return new Set([
    ...(state.translationManifest.pendingRecords ?? []),
    ...(state.translationManifest.languageExcludedRecords ?? []),
  ]
    .map(record => record.targetPath.slice(`${REFERENCE_TARGET_ROOT}/`.length).replace(/\.mdx?$/u, '')));
}

function writeStagedFile(repositoryRoot: string, relativePath: string, contents: string): {finalPath: string; temporaryPath: string} {
  const parentRelative = path.posix.dirname(relativePath);
  assertSafeRepositoryPathChain(repositoryRoot, parentRelative, 'Reference manifest parent');
  const parent = resolveOwnedRepositoryPath(repositoryRoot, parentRelative, 'Reference manifest parent');
  mkdirSync(parent, {recursive: true});
  assertSafeRepositoryPathChain(repositoryRoot, parentRelative, 'Reference manifest parent');
  const finalPath = assertSafeRepositoryPathChain(repositoryRoot, relativePath, 'Reference manifest output');
  if (existsSync(finalPath) && !lstatSync(finalPath).isFile()) throw new Error(`Reference manifest output must be a regular file: ${relativePath}`);
  const temporaryPath = path.join(parent, `.${path.basename(relativePath)}.${process.pid}.${randomUUID()}.tmp`);
  const noFollow = typeof constants.O_NOFOLLOW === 'number' ? constants.O_NOFOLLOW : 0;
  const descriptor = openSync(temporaryPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | noFollow, 0o600);
  try {
    writeFileSync(descriptor, contents);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  return {finalPath, temporaryPath};
}

function writeManifestPair(repositoryRoot: string, entries: readonly (readonly [string, string])[]): void {
  const staged: Array<{finalPath: string; temporaryPath: string; backupPath?: string; installed?: boolean}> = [];
  let committed = false;
  try {
    for (const [relativePath, contents] of entries) staged.push(writeStagedFile(repositoryRoot, relativePath, contents));
    for (const [index, entry] of staged.entries()) {
      assertSafeRepositoryPathChain(repositoryRoot, entries[index][0], 'Reference manifest output');
      if (existsSync(entry.finalPath)) {
        entry.backupPath = path.join(path.dirname(entry.finalPath), `.${path.basename(entry.finalPath)}.${process.pid}.${randomUUID()}.bak`);
        renameSync(entry.finalPath, entry.backupPath);
      }
    }
    for (const [index, entry] of staged.entries()) {
      assertSafeRepositoryPathChain(repositoryRoot, path.relative(repositoryRoot, path.dirname(entry.finalPath)).split(path.sep).join('/'), 'Reference manifest parent');
      renameSync(entry.temporaryPath, entry.finalPath);
      entry.installed = true;
    }
    for (const entry of staged) {
      const directory = openSync(path.dirname(entry.finalPath), constants.O_RDONLY);
      try { fsyncSync(directory); } finally { closeSync(directory); }
    }
    committed = true;
  } finally {
    if (!committed) {
      for (const entry of [...staged].reverse()) {
        if (entry.installed && existsSync(entry.finalPath)) unlinkSync(entry.finalPath);
        if (entry.backupPath && existsSync(entry.backupPath)) renameSync(entry.backupPath, entry.finalPath);
      }
    }
    for (const entry of staged) if (existsSync(entry.temporaryPath)) unlinkSync(entry.temporaryPath);
    for (const entry of staged) if (entry.backupPath && existsSync(entry.backupPath)) unlinkSync(entry.backupPath);
  }
}

function validateRetirementRegistry(
  registry: ReferenceRetirementRegistry,
  sourceSnapshot: ReferenceTreeSnapshot,
  targetSnapshot: ReferenceTreeSnapshot,
  manualForPath: (filePath: string) => string,
): void {
  for (const record of registry.retirements) {
    if (manualForPath(record.sourcePath) !== record.manual || manualForPath(record.targetPath) !== record.manual) {
      throw new Error(`Reference retirement manual does not match path ownership: ${record.sourcePath}`);
    }
    // A registry entry is active only while exactly one side exists. Once both
    // sides are restored (or both disappear), the approval is obsolete and
    // must not invalidate an otherwise current generated manifest.
  }
}

function assertRetirementsMatchManifest(
  registry: ReferenceRetirementRegistry,
  translationManifest: ReturnType<typeof parseReferenceTranslationManifest>,
  sourceSnapshot: ReferenceTreeSnapshot,
  targetSnapshot: ReferenceTreeSnapshot,
): void {
  // A retirement approval can predate a source becoming explicitly excluded
  // from the target locale. Once the authenticated translation manifest
  // records that tuple as language-excluded, it is covered by that state and
  // must not also be required as a `retired` record. Keep the comparison
  // tuple-based so unrelated registry entries remain fail-closed.
  const languageExcluded = new Set((translationManifest.languageExcludedRecords ?? [])
    .map(record => `${record.manual}\0${record.sourcePath}\0${record.targetPath}`));
  const expected = registry.retirements
    .filter(record => sourceSnapshot.has(record.sourcePath) !== targetSnapshot.has(record.targetPath))
    .filter(record => !languageExcluded.has(`${record.manual}\0${record.sourcePath}\0${record.targetPath}`))
    .map(record => `${record.manual}\0${record.sourcePath}\0${record.targetPath}`);
  const actual = translationManifest.records
    .filter(record => record.status === 'retired')
    .map(record => `${record.manual}\0${record.sourcePath}\0${record.targetPath}`);
  if (expected.length !== actual.length || expected.some((record, index) => record !== actual[index])) {
    throw new Error('Reference retirement registry does not exactly match retired translation manifest records');
  }
}

export async function executeReferenceDocsToolingCommand(
  argv: readonly string[],
  dependencies: ReferenceCommandDependencies = {},
): Promise<void> {
  const repositoryRoot = path.resolve(dependencies.repositoryRoot ?? process.cwd());
  const environment = dependencies.environment ?? process.env;
  if (argv[0] === 'reference-sidebar') {
    if (argv.length !== 4 || argv[1] !== '--group' || !argv[2] || argv[3] !== '--write') {
      throw new Error('Usage: docs-tooling reference-sidebar --group <python|java|node|go|rest|cli|reference-landings> --write');
    }
    const sourceSnapshot = captureReferenceTree(repositoryRoot, REFERENCE_SOURCE_ROOT);
    const targetSnapshot = captureReferenceTree(repositoryRoot, REFERENCE_TARGET_ROOT);
    const manualForPath = dependencies.manualForPath ?? defaultReferenceManualForPath;
    const retirementRegistry = dependencies.retirementRegistry
      ?? parseReferenceRetirementRegistry(readJson(repositoryRoot, REFERENCE_RETIREMENT_REGISTRY));
    validateRetirementRegistry(retirementRegistry, sourceSnapshot, targetSnapshot, manualForPath);
    const retiredTargetIds = new Set(retirementRegistry.retirements
      .filter(record => !targetSnapshot.has(record.targetPath))
      .map(record => record.targetPath.slice(`${REFERENCE_TARGET_ROOT}/`.length).replace(/\.mdx?$/u, '')));
    const manifestState = readReferenceManifestState(repositoryRoot);
    if (manifestState) {
      const externalSnapshot = resolveExternalSnapshotIdentity(repositoryRoot, environment);
      if (dependencies.verifySourceRevision) {
        dependencies.verifySourceRevision(manifestState.sourceManifest.sourceCommit, REFERENCE_SOURCE_ROOT, sourceSnapshot);
      } else {
        verifyReferenceSourceRevision(
          repositoryRoot,
          manifestState.sourceManifest.sourceCommit,
          REFERENCE_SOURCE_ROOT,
          sourceSnapshot,
          externalSnapshot,
        );
      }
      validateReferenceSource({
        repositoryRoot,
        sourceRoot: REFERENCE_SOURCE_ROOT,
        sourceManifest: manifestState.sourceManifest,
        manualForPath,
      });
      assertRetirementsMatchManifest(retirementRegistry, manifestState.translationManifest, sourceSnapshot, targetSnapshot);
      validateReferenceTranslation({
        repositoryRoot,
        sourceRoot: REFERENCE_SOURCE_ROOT,
        targetRoot: REFERENCE_TARGET_ROOT,
        sourceManifest: manifestState.sourceManifest,
        translationManifest: manifestState.translationManifest,
        manualForPath,
        verifySourceProvenance: dependencies.verifyTranslationSourceProvenance
          ?? (externalSnapshot
            ? createPrevalidatedExternalSnapshotProvenanceVerifier(externalSnapshot)
            : createGitTranslationSourceProvenanceVerifier(repositoryRoot, REFERENCE_SOURCE_ROOT)),
      });
      for (const unavailableTargetId of unavailableReferenceTargetIds(manifestState)) retiredTargetIds.add(unavailableTargetId);
    }
    writeManifestPair(repositoryRoot, deriveZhCnReferenceSidebarGroupEntries(repositoryRoot, argv[2], retiredTargetIds));
    dependencies.write?.(`wrote Chinese Reference sidebars for ${argv[2]}`);
    return;
  }
  if (argv[0] === 'reference-manifest') {
    const shorthand = argv.length === 2 && argv[1] === '--write';
    const values: Record<string, string> = shorthand
      ? {'--source': REFERENCE_SOURCE_ROOT, '--target': REFERENCE_TARGET_ROOT, '--source-commit': 'HEAD'}
      : {};
    if (!shorthand) {
      if (argv.length !== 8 || argv[7] !== '--write') throw new Error('Usage: docs-tooling reference-manifest --source <dir> --target <dir> --source-commit <revision> --write');
      for (let index = 1; index < 7; index += 2) {
        const flag = argv[index];
        if (!['--source', '--target', '--source-commit'].includes(flag)) throw new Error(`Unknown reference-manifest argument: ${flag}`);
        if (values[flag]) throw new Error(`Duplicate reference-manifest argument: ${flag}`);
        const value = argv[index + 1];
        if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
        values[flag] = value;
      }
    }
    if (values['--source'] !== REFERENCE_SOURCE_ROOT || values['--target'] !== REFERENCE_TARGET_ROOT || !values['--source-commit']) {
      throw new Error(`Reference manifests must use ${REFERENCE_SOURCE_ROOT} and ${REFERENCE_TARGET_ROOT}`);
    }
    const sourceCommit = (dependencies.resolveSourceCommit ?? (revision => resolveGitCommit(repositoryRoot, revision)))(values['--source-commit']);
    const sourceSnapshot = captureReferenceTree(repositoryRoot, REFERENCE_SOURCE_ROOT);
    const targetSnapshot = captureReferenceTree(repositoryRoot, REFERENCE_TARGET_ROOT);
    if (dependencies.verifySourceRevision) dependencies.verifySourceRevision(sourceCommit, REFERENCE_SOURCE_ROOT);
    else verifyGitSourceRevision(repositoryRoot, sourceCommit, REFERENCE_SOURCE_ROOT, sourceSnapshot);
    const manualForPath = dependencies.manualForPath ?? defaultReferenceManualForPath;
    const retirementRegistry = dependencies.retirementRegistry
      ?? parseReferenceRetirementRegistry(readJson(repositoryRoot, REFERENCE_RETIREMENT_REGISTRY));
    validateRetirementRegistry(retirementRegistry, sourceSnapshot, targetSnapshot, manualForPath);
    const previousManifestState = readReferenceManifestState(repositoryRoot);
    if (previousManifestState) {
      authenticateHistoricalReferenceManifestState({
        repositoryRoot,
        state: previousManifestState,
        currentSourceCommit: sourceCommit,
        manualForPath,
        verifySourceRevision: dependencies.verifySourceRevision,
        verifyTranslationSourceProvenance: dependencies.verifyTranslationSourceProvenance,
      });
    }
    const manifests = buildReferenceManifests({
      repositoryRoot,
      sourceRoot: REFERENCE_SOURCE_ROOT,
      targetRoot: REFERENCE_TARGET_ROOT,
      sourceCommit,
      manualForPath,
      retirementRegistry,
      previousSourceManifest: previousManifestState?.sourceManifest,
      previousTranslationManifest: previousManifestState?.translationManifest,
      sourceSnapshot,
      targetSnapshot,
    });
    validateReferenceSource({repositoryRoot, sourceRoot: REFERENCE_SOURCE_ROOT, sourceManifest: manifests.sourceManifest, manualForPath});
    validateReferenceTranslation({
      repositoryRoot,
      sourceRoot: REFERENCE_SOURCE_ROOT,
      targetRoot: REFERENCE_TARGET_ROOT,
      sourceManifest: manifests.sourceManifest,
      translationManifest: manifests.translationManifest,
      manualForPath,
      verifySourceProvenance: dependencies.verifyTranslationSourceProvenance
        ?? createGitTranslationSourceProvenanceVerifier(repositoryRoot, REFERENCE_SOURCE_ROOT),
    });
    assertSnapshotsEqual(sourceSnapshot, captureReferenceTree(repositoryRoot, REFERENCE_SOURCE_ROOT), 'Reference source snapshot changed during generation');
    assertSnapshotsEqual(targetSnapshot, captureReferenceTree(repositoryRoot, REFERENCE_TARGET_ROOT), 'Reference target snapshot changed during generation');
    const retiredTargetIds = new Set(retirementRegistry.retirements
      .filter(record => !targetSnapshot.has(record.targetPath))
      .map(record => record.targetPath.slice(`${REFERENCE_TARGET_ROOT}/`.length).replace(/\.mdx?$/u, '')));
    for (const unavailableTargetId of unavailableReferenceTargetIds(manifests)) retiredTargetIds.add(unavailableTargetId);
    const sidebarEntries = deriveReferenceSidebarPublicationEntries(repositoryRoot, retiredTargetIds);
    writeManifestPair(repositoryRoot, [
      [REFERENCE_SOURCE_MANIFEST, serializeReferenceManifest(manifests.sourceManifest)],
      [REFERENCE_TRANSLATION_MANIFEST, serializeReferenceManifest(manifests.translationManifest)],
      ...sidebarEntries,
    ]);
    dependencies.write?.(`wrote Reference manifests for ${sourceCommit}`);
    return;
  }
  if (argv[0] === 'validate-reference') {
    if (argv.length !== 3 || argv[1] !== '--site' || (argv[2] !== 'en' && argv[2] !== 'zh-CN')) {
      throw new Error('Usage: docs-tooling validate-reference --site <en|zh-CN>');
    }
    const sourceManifest = parseReferenceSourceManifest(readJson(repositoryRoot, REFERENCE_SOURCE_MANIFEST));
    const sourceSnapshot = captureReferenceTree(repositoryRoot, REFERENCE_SOURCE_ROOT);
    const externalSnapshot = resolveExternalSnapshotIdentity(repositoryRoot, environment);
    if (dependencies.verifySourceRevision) dependencies.verifySourceRevision(sourceManifest.sourceCommit, REFERENCE_SOURCE_ROOT);
    else verifyReferenceSourceRevision(
      repositoryRoot,
      sourceManifest.sourceCommit,
      REFERENCE_SOURCE_ROOT,
      sourceSnapshot,
      externalSnapshot,
    );
    const manualForPath = dependencies.manualForPath ?? defaultReferenceManualForPath;
    validateReferenceSource({repositoryRoot, sourceRoot: REFERENCE_SOURCE_ROOT, sourceManifest, manualForPath});
    let unavailableNavigationIds: ReadonlySet<string> = new Set();
    if (argv[2] === 'en') {
      // Source ownership, revision, and hashes were validated above.
    } else {
      if (existsSync(path.join(repositoryRoot, REFERENCE_RECONCILIATION_LEDGER))) {
        validateReferenceReconciliationLedger(parseReferenceReconciliationLedger(readJson(repositoryRoot, REFERENCE_RECONCILIATION_LEDGER)));
      }
      const translationManifest = parseReferenceTranslationManifest(readJson(repositoryRoot, REFERENCE_TRANSLATION_MANIFEST));
      const targetSnapshot = captureReferenceTree(repositoryRoot, REFERENCE_TARGET_ROOT);
      const retirementRegistry = dependencies.retirementRegistry
        ?? parseReferenceRetirementRegistry(readJson(repositoryRoot, REFERENCE_RETIREMENT_REGISTRY));
      validateRetirementRegistry(retirementRegistry, sourceSnapshot, targetSnapshot, manualForPath);
      assertRetirementsMatchManifest(retirementRegistry, translationManifest, sourceSnapshot, targetSnapshot);
      validateReferenceTranslation({
        repositoryRoot,
        sourceRoot: REFERENCE_SOURCE_ROOT,
        targetRoot: REFERENCE_TARGET_ROOT,
        sourceManifest,
        translationManifest,
        manualForPath,
        verifySourceProvenance: dependencies.verifyTranslationSourceProvenance
          ?? (externalSnapshot
            ? createPrevalidatedExternalSnapshotProvenanceVerifier(externalSnapshot)
            : createGitTranslationSourceProvenanceVerifier(repositoryRoot, REFERENCE_SOURCE_ROOT)),
      });
      unavailableNavigationIds = unavailableReferenceTargetIds({sourceManifest, translationManifest});
    }
    const validateNavigation = dependencies.validateReferenceNavigation ?? validateReferenceNavigation;
    validateNavigation(unavailableNavigationIds.size > 0
      ? {repositoryRoot, site: argv[2], excludedDocumentIds: unavailableNavigationIds}
      : {repositoryRoot, site: argv[2]});
    dependencies.write?.(`validated Reference provenance for ${argv[2]}`);
    return;
  }
  throw new Error(`Unknown Reference command: ${argv[0] ?? '(missing)'}`);
}

const USAGE = 'Usage: docs-tooling <fetch|validate|publish> --manual <id> --group <id> --site <en|zh-CN> --stage <dir>';

export function parseCliArgs(argv: readonly string[]): CliRequest {
  const command = argv[0];
  if (command !== 'fetch' && command !== 'validate' && command !== 'publish') throw new Error(`Unknown command: ${command ?? '(missing)'}. ${USAGE}`);
  if (argv.length !== 9) throw new Error(USAGE);
  const values: Record<string, string> = {};
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index];
    if (!['--manual', '--group', '--site', '--stage'].includes(flag)) throw new Error(`Unknown argument: ${flag}. ${USAGE}`);
    if (Object.hasOwn(values, flag)) throw new Error(`Duplicate argument: ${flag}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}. ${USAGE}`);
    values[flag] = value;
  }
  if (!values['--manual'] || !values['--group'] || !values['--site'] || !values['--stage']) throw new Error(USAGE);
  if (values['--site'] !== 'en' && values['--site'] !== 'zh-CN') throw new Error(`Unknown site: ${values['--site']}`);
  const canonicalGroup = canonicalPublicationGroupForManual(values['--site'], values['--manual']);
  if (values['--group'] !== canonicalGroup) {
    throw new Error(`Publication group mismatch: canonical group for ${values['--site']}/${values['--manual']} is ${canonicalGroup}`);
  }
  assertSafeRepositoryRelativePath(values['--stage'], 'Stage path');
  const canonicalStage = `tmp/docs-tooling/${values['--site']}/${values['--manual']}`;
  if (values['--stage'] !== canonicalStage && !values['--stage'].startsWith(`${canonicalStage}/`)) {
    throw new Error(`Stage path must use the canonical ${canonicalStage} root or one of its descendants`);
  }
  return {command, manual: values['--manual'], group: values['--group'], site: values['--site'], stage: values['--stage']};
}

function pathsOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function assertSafeStageLocation(context: CommandContext): void {
  const protectedPaths = [
    '.git',
    context.publication.outputDir,
    context.publication.contentRoot,
    context.publication.sidebarPath,
    ...(context.publication.overridePath ? [context.publication.overridePath] : []),
    ...context.sourceChain.map(entry => (entry.source as ManualSource).sourceDir),
  ];
  for (const protectedPath of protectedPaths) {
    if (pathsOverlap(context.request.stage, protectedPath)) {
      throw new Error(`Stage path overlaps a protected repository path: ${protectedPath}`);
    }
  }
  const stagePath = resolveSecureRepositoryPath(context.repositoryRoot, context.stagePath, 'Stage path', {allowMissing: true});
  if (securePathExists(context.repositoryRoot, stagePath, 'Stage path')) {
    resolveSecureRepositoryPath(context.repositoryRoot, stagePath, 'Stage path', {finalKind: 'directory'});
  }
}

function assertExistingSource(repositoryRoot: string, source: ManualSource): string {
  const sourcePath = resolveOwnedRepositoryPath(repositoryRoot, source.sourceDir, 'Manual sourceDir');
  if (!existsSync(sourcePath)) throw new Error(`Manual source is missing: ${source.sourceDir}`);
  validateStageFilesystem(sourcePath);
  return sourcePath;
}

export function publicationStagePaths(context: CommandContext): PublicationStagePaths {
  return {
    contentRootPath: resolveSecureRepositoryPath(context.stagePath, context.publication.contentRoot, 'Staged publication contentRoot', {allowMissing: true}),
    outputPath: resolveSecureRepositoryPath(context.stagePath, context.publication.outputDir, 'Staged publication outputDir', {allowMissing: true}),
    sidebarPath: resolveSecureRepositoryPath(context.stagePath, context.publication.sidebarPath, 'Staged publication sidebarPath', {allowMissing: true}),
  };
}

function resetStage(context: CommandContext): void {
  assertSafeStageLocation(context);
  removeSecureStageTree(context.repositoryRoot, context.stagePath, 'Stage path');
  ensureSecureDirectory(context.repositoryRoot, context.stagePath, 'Stage path');
}

function stageExistingSidebar(context: CommandContext): void {
  const sourcePath = resolveOwnedRepositoryPath(context.repositoryRoot, context.publication.sidebarPath, 'Publication sidebarPath');
  if (!existsSync(sourcePath)) throw new Error(`Publication sidebar source is missing: ${context.publication.sidebarPath}`);
  const staged = publicationStagePaths(context).sidebarPath;
  writeSecureAtomicFile(context.repositoryRoot, staged, readSecureFile(context.repositoryRoot, sourcePath, 'Publication sidebar source'), 'Staged publication sidebar');
}

function stageGeneratedRestSidebar(context: CommandContext): void {
  const staged = publicationStagePaths(context);
  const idPrefix = path.relative(staged.contentRootPath, staged.outputPath).split(path.sep).join('/');
  const sidebar = deriveRestSidebar({targetRoot: staged.outputPath, idPrefix});
  writeSecureAtomicFile(
    context.repositoryRoot,
    staged.sidebarPath,
    serializeRestSidebar(sidebar),
    'Staged generated REST sidebar',
  );
}

function stagePreservedPublicationFiles(context: CommandContext, replace = false): void {
  const outputPath = publicationStagePaths(context).outputPath;
  for (const relativePath of context.publication.preservedFiles ?? []) {
    const sourcePath = resolveOwnedRepositoryPath(
      context.repositoryRoot,
      `${context.publication.outputDir}/${relativePath}`,
      'Preserved publication source',
    );
    if (!existsSync(sourcePath) || !lstatSync(sourcePath).isFile()) {
      throw new Error(`Preserved publication file is missing or is not a regular file: ${context.publication.outputDir}/${relativePath}`);
    }
    const targetPath = resolveOwnedRepositoryPath(outputPath, relativePath, 'Preserved staged publication file');
    writeSecureAtomicFile(
      context.repositoryRoot,
      targetPath,
      readSecureFile(context.repositoryRoot, sourcePath, 'Preserved publication source'),
      'Preserved staged publication file',
      {replace},
    );
  }
}

function diagnosticsIdentity(context: CommandContext): PublicationDiagnosticsIdentity {
  return {
    site: context.request.site,
    manual: context.request.manual,
    stage: context.request.stage,
    publication: context.publication as ManualPublication,
    sourceChain: context.sourceChain,
  };
}

async function validatePublicationStage(context: CommandContext): Promise<Readonly<{
  inventory: StageInventory;
  diagnostics: PublicationDiagnostics;
}>> {
  const diagnostics = readAndValidatePublicationDiagnostics(context.repositoryRoot, context.stagePath, diagnosticsIdentity(context));
  const inventory = await validatePublicationFilesystem(context.stagePath, context.publication as ManualPublication);
  return {inventory, diagnostics};
}

type SelectedPublicationAdapters = Readonly<{
  ids: readonly string[];
  registry: PublicationAdapterRegistry;
}>;

function missingAliyunOssValidator(): AliyunOssValidator {
  return {
    async validatePublication() {
      throw new Error('zh-CN publication validation requires explicit Aliyun OSS validator injection');
    },
  };
}

function selectedPublicationAdapters(site: SiteId, aliyunOssValidator: AliyunOssValidator | undefined): SelectedPublicationAdapters {
  const ids = resolveSiteProfile(site).publicationAdapters;
  if (ids.length === 0) return {ids, registry: createPublicationAdapterRegistry([])};
  if (site !== 'zh-CN') throw new Error(`Site ${site} cannot select Chinese publication adapters`);
  return {
    ids,
    registry: createZhCnPublicationAdapterRegistry({aliyunOssValidator: aliyunOssValidator ?? missingAliyunOssValidator()}),
  };
}

function publicationAdapterContext(context: CommandContext, publicationRoot = context.stagePath): PublicationContext {
  const source = context.source as ManualSource;
  return {
    site: context.request.site,
    manual: context.request.manual,
    publicationRoot,
    baselineCommit: context.baselineCommit ?? context.publicationDiagnostics?.baselineCommit ?? '',
    sourceIdentity: {
      type: source.sourceType,
      sourceType: source.sourceType,
      lifecycle: source.lifecycle,
      sourceDir: source.sourceDir,
      ...(source.root ? {root: source.root} : {}),
      ...(source.base ? {base: source.base} : {}),
      ...(source.version ? {version: source.version} : {}),
    },
  };
}

function transformStagedMarkdown(context: CommandContext, selected: SelectedPublicationAdapters): void {
  if (selected.ids.length === 0) return;
  const inventory = validateStageFilesystem(context.stagePath);
  const outputPrefix = `${context.publication.outputDir}/`;
  const adapterContext = publicationAdapterContext(context);
  for (const file of inventory.files) {
    if (!file.path.startsWith(outputPrefix) || !/\.mdx?$/u.test(file.path)) continue;
    const absolutePath = path.join(context.stagePath, file.path);
    const document = selected.registry.transformDocument(selected.ids, {
      path: file.path,
      contents: readSecureFile(context.repositoryRoot, absolutePath, 'Staged publication Markdown').toString('utf8'),
    }, adapterContext);
    writeSecureAtomicFile(context.repositoryRoot, absolutePath, document.contents, 'Staged publication Markdown', {replace: true});
  }
}

async function validateSelectedPublicationAdapters(
  context: CommandContext,
  selected: SelectedPublicationAdapters,
  publicationRoot = context.stagePath,
): Promise<void> {
  if (selected.ids.length === 0) return;
  await selected.registry.validatePublication(selected.ids, publicationAdapterContext(context, publicationRoot));
}

async function validatePublicationFilesystem(root: string, publication: ManualPublication): Promise<StageInventory> {
  const outputPath = resolveSecureRepositoryPath(root, publication.outputDir, 'Publication content artifact', {allowMissing: true});
  const sidebarPath = resolveSecureRepositoryPath(root, publication.sidebarPath, 'Publication sidebar artifact', {allowMissing: true});
  if (!securePathExists(root, outputPath, 'Publication content artifact')) throw new Error(`Publication content artifact is missing: ${publication.outputDir}`);
  if (!securePathExists(root, sidebarPath, 'Publication sidebar artifact')) throw new Error(`Publication sidebar artifact is missing: ${publication.sidebarPath}`);
  resolveSecureRepositoryPath(root, outputPath, 'Publication content artifact', {finalKind: 'directory'});
  resolveSecureRepositoryPath(root, sidebarPath, 'Publication sidebar artifact', {finalKind: 'file'});
  const inventory = validateStageFilesystem(root);
  const integrity = await scanIntegrity(root, {
    repository: 'zdoc',
    contentRoots: [publication.outputDir],
    allowedRoutePrefixes: ['/docs', '/img', '/reference'],
    allowedExactRoutes: ['/'],
  });
  const unreviewed = integrity.findings.filter((finding: {status: string}) => finding.status === 'unreviewed');
  if (unreviewed.length > 0) {
    const summary = unreviewed.slice(0, 5).map((finding: {path: string; rule: string}) => `${finding.rule} at ${finding.path}`).join(', ');
    throw new Error(`Publication integrity validation failed with ${unreviewed.length} unreviewed finding(s): ${summary}`);
  }
  return inventory;
}

async function validatePublicationSnapshot(
  context: CommandContext,
  selected: SelectedPublicationAdapters,
  snapshot: AtomicValidationSnapshot,
): Promise<void> {
  const expectedOwnedPaths = publicationOwnedTargets(context.request.site, context.publication as ManualPublication);
  if (snapshot.ownedPaths.length !== expectedOwnedPaths.length
    || expectedOwnedPaths.some((target, index) => snapshot.ownedPaths[index] !== target)) {
    throw new Error('Atomic publication snapshot owned paths do not match the validated publication contract');
  }
  await validatePublicationFilesystem(snapshot.publicationRoot, context.publication as ManualPublication);
  await validateSelectedPublicationAdapters(context, selected, snapshot.publicationRoot);
}

async function copyLocalSource(context: CommandContext): Promise<void> {
  const sourcePath = assertExistingSource(context.repositoryRoot, context.source as ManualSource);
  const outputPath = publicationStagePaths(context).outputPath;
  copySecureTree(context.repositoryRoot, path.relative(context.repositoryRoot, sourcePath).split(path.sep).join('/'), context.repositoryRoot, outputPath, 'Local publication source');
  stageExistingSidebar(context);
}

function runGenerator(
  context: CommandContext,
  runner: GeneratorRunner,
  entrypoint: string,
  args: readonly string[],
  environment: NodeJS.ProcessEnv,
  validateStage = true,
): void {
  const result = runner(process.execPath, [entrypoint, ...args], {
    cwd: context.repositoryRoot,
    env: environment,
    stdio: 'inherit',
  });
  if (result.error) {
    throw new Error(`Manual ${context.request.manual} generator could not be spawned: ${result.error.message}`, {cause: result.error});
  }
  if (typeof result.status !== 'number') {
    throw new Error(`Manual ${context.request.manual} generator ended without a numeric status${result.signal ? ` (signal ${result.signal})` : ''}`);
  }
  if (result.status !== 0) throw new Error(`Manual ${context.request.manual} generator failed with status ${result.status}`);
  if (validateStage) validateStageFilesystem(context.stagePath);
}

function isGuidesSourceStage(context: CommandContext, environment: NodeJS.ProcessEnv): boolean {
  return context.request.manual === 'guides' && environment.DOCS_TOOLING_GUIDES_STAGE === 'source';
}

function larkGeneratorArgs(
  context: CommandContext,
  environment: NodeJS.ProcessEnv,
  sourceEntry: SourceEntry,
  sourceOnly = false,
  reuseSource = environment.DOCS_TOOLING_REUSE_LARK_SOURCE === '1',
): string[] {
  const source = sourceEntry.source as ManualSource;
  if (!source.root || !source.base) {
    throw new Error(`Manual ${context.request.manual} ${source.sourceType} source is missing its Lark root or base identity`);
  }
  if (!source.generatorManual || !source.snapshotPath) {
    throw new Error(`Manual ${context.request.manual} remote source ${sourceEntry.key} is missing its generator or snapshot identity`);
  }
  return [
    '--manual', context.request.manual,
    '--site', context.request.site,
    '--source', sourceEntry.key,
    '--generator-manual', source.generatorManual,
    '--snapshot-path', source.snapshotPath,
    '--generator-target', context.publication.generatorTarget,
    '--source-type', source.sourceType,
    '--root', source.root,
    '--base', source.base,
    '--source-dir', source.sourceDir,
    '--stage', context.request.stage,
    ...(source.version ? ['--version', source.version] : []),
    ...(source.fallbackSource ? ['--fallback-source-dir', context.manual.sources[source.fallbackSource].sourceDir] : []),
    ...(!sourceOnly ? [
      '--output-dir', context.publication.outputDir,
      '--content-root', context.publication.contentRoot,
      '--sidebar-path', context.publication.sidebarPath,
      ...(context.publication.overridePath ? ['--override-path', context.publication.overridePath] : []),
    ] : []),
    ...(isGuidesSourceStage(context, environment) ? [
      '--source-only',
      '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
    ] : sourceOnly ? ['--source-only'] : []),
    ...(environment.DOCS_TOOLING_FORCE_FULL_FETCH === '1' ? ['--force-full-fetch'] : []),
    ...(reuseSource ? ['--reuse-source'] : []),
  ];
}

async function defaultFetch(context: CommandContext, runner: GeneratorRunner, environment: NodeJS.ProcessEnv): Promise<void> {
  const source = context.source as ManualSource;
  if (source.sourceType === 'local') {
    await copyLocalSource(context);
    return;
  }
  if (source.sourceType === 'wiki' || source.sourceType === 'drive' || source.sourceType === 'onePager') {
    const guidesSourceOnly = isGuidesSourceStage(context, environment);
    const preparesSharedGuidesSource = context.request.manual === 'guides' && !guidesSourceOnly;
    const reusesSharedGuidesSource = context.request.manual === 'guides-byoc' || environment.DOCS_TOOLING_REUSE_LARK_SOURCE === '1';
    const chain = context.sourceChain;
    for (const [index, entry] of chain.entries()) {
      const sourceOnly = guidesSourceOnly || preparesSharedGuidesSource || index < chain.length - 1;
      const argumentEnvironment = preparesSharedGuidesSource
        ? {...environment, DOCS_TOOLING_GUIDES_STAGE: 'source'}
        : environment;
      runGenerator(
        context,
        runner,
        path.join(context.repositoryRoot, 'packages/docs-tooling/src/lark/cli.js'),
        larkGeneratorArgs(context, argumentEnvironment, entry, sourceOnly, !sourceOnly && reusesSharedGuidesSource),
        environment,
        false,
      );
      assertExistingSource(context.repositoryRoot, entry.source as ManualSource);
    }
    if (guidesSourceOnly) {
      const sourcePath = assertExistingSource(context.repositoryRoot, source);
      copySecureTree(
        context.repositoryRoot,
        path.relative(context.repositoryRoot, sourcePath).split(path.sep).join('/'),
        context.repositoryRoot,
        context.stagePath,
        'Guides source stage',
      );
      validateStageFilesystem(context.stagePath);
    } else {
      if (preparesSharedGuidesSource) {
        runGenerator(
          context,
          runner,
          path.join(context.repositoryRoot, 'packages/docs-tooling/src/lark/cli.js'),
          larkGeneratorArgs(context, environment, chain.at(-1)!, false, true),
          environment,
          false,
        );
      }
    }
    return;
  }
  if (source.sourceType === 'rest') {
    const specifications = assertExistingSource(context.repositoryRoot, source);
    runGenerator(
      context,
      runner,
      path.join(context.repositoryRoot, 'packages/docs-tooling/src/reference/rest/index.js'),
      [
        '--specifications', specifications,
        '--output_path', publicationStagePaths(context).outputPath,
        '--lang', context.request.site === 'en' ? 'en-US' : 'zh-CN',
        '--target', 'zilliz',
      ],
      environment,
      false,
    );
    stageGeneratedRestSidebar(context);
    return;
  }
  const exhaustive: never = source.sourceType;
  throw new Error(`Unsupported manual source type: ${String(exhaustive)}`);
}

async function defaultPublish(
  context: CommandContext,
  selected: SelectedPublicationAdapters,
  replace: (options: AtomicReplaceOptions) => Promise<void> = atomicReplace,
): Promise<void> {
  const staged = publicationStagePaths(context);
  if (!context.publicationDiagnostics) throw new Error('Validated publication diagnostics are missing');
  const ownedTargets = publicationOwnedTargets(context.request.site, context.publication as ManualPublication);
  const removalTargets = ownedTargets.filter(target => target !== context.publication.outputDir && target !== context.publication.sidebarPath);
  await replace({
    publicationRoot: context.repositoryRoot,
    baselineCommit: context.publicationDiagnostics.baselineCommit,
    replacements: [
      {source: staged.outputPath, target: context.publication.outputDir},
      {source: staged.sidebarPath, target: context.publication.sidebarPath},
    ],
    removals: removalTargets,
    validatePublication: snapshot => validatePublicationSnapshot(context, selected, snapshot),
  });
}

async function executeParsedDocsToolingCommand(
  request: CliRequest,
  dependencies: CliDependencies,
  repositoryRoot: string,
): Promise<CommandContext> {
  const stagePath = resolveOwnedRepositoryPath(repositoryRoot, request.stage, 'Stage path');
  const resolved = resolveManualPublication(request.manual, request.site);
  const environment = dependencies.environment ?? process.env;
  const selectedAdapters = selectedPublicationAdapters(request.site, dependencies.aliyunOssValidator);
  assertPublicationOwnership(request.site, resolved.publication as ManualPublication);
  const baseContext: CommandContext = {
    request,
    repositoryRoot,
    stagePath,
    manual: resolved.manual,
    source: resolved.source,
    sourceChain: resolved.sourceChain,
    publication: resolved.publication,
  };
  assertSafeStageLocation(baseContext);

  if (request.command === 'fetch') {
    const publicationDiagnostics = isGuidesSourceStage(baseContext, environment)
      ? undefined
      : capturePublicationDiagnostics(repositoryRoot, diagnosticsIdentity(baseContext));
    const fetchContext: CommandContext = {...baseContext, publicationDiagnostics};
    resetStage(fetchContext);
    if (publicationDiagnostics) {
      writePublicationDiagnostics(repositoryRoot, stagePath, publicationDiagnostics);
      writePublicationAnchor(repositoryRoot, diagnosticsIdentity(fetchContext), publicationDiagnostics);
      stagePreservedPublicationFiles(fetchContext);
    }
    if (dependencies.fetch) await dependencies.fetch(fetchContext);
    else await defaultFetch(fetchContext, dependencies.spawnSync ?? nodeSpawnSync, environment);
    if (publicationDiagnostics) {
      stagePreservedPublicationFiles(fetchContext, true);
      transformStagedMarkdown(fetchContext, selectedAdapters);
      await validatePublicationStage(fetchContext);
    }
    dependencies.write?.(`fetched ${request.manual}/${request.site} into ${request.stage}`);
    return fetchContext;
  }

  const {inventory, diagnostics} = await validatePublicationStage(baseContext);
  const validatedContext: CommandContext = {
    ...baseContext,
    inventory,
    publicationDiagnostics: diagnostics,
    baselineCommit: diagnostics.baselineCommit,
  };
  await validateSelectedPublicationAdapters(validatedContext, selectedAdapters);
  if (request.command === 'publish') {
    if (dependencies.publish) await dependencies.publish(validatedContext);
    else await defaultPublish(validatedContext, selectedAdapters, dependencies.atomicReplace);
  }
  dependencies.write?.(`${request.command === 'publish' ? 'published' : 'validated'} ${request.manual}/${request.site} from ${request.stage}`);
  return validatedContext;
}

export type AlreadyFencedDocsToolingExecutor = (
  argv: readonly string[],
  dependencies?: CliDependencies,
) => Promise<CommandContext>;

export async function withDocsToolingGroupFence<T>(
  repositoryRootInput: string,
  site: SiteId,
  group: string,
  operation: (executeAlreadyFenced: AlreadyFencedDocsToolingExecutor) => T | Promise<T>,
): Promise<T> {
  const repositoryRoot = path.resolve(repositoryRootInput);
  return withAtomicPublicationGroupFence(repositoryRoot, site, group, async () => {
    const executeAlreadyFenced: AlreadyFencedDocsToolingExecutor = async (argv, dependencies = {}) => {
      const request = parseCliArgs(argv);
      if (request.site !== site || request.group !== group) {
        throw new Error(`Already-fenced docs-tooling request identity mismatch: expected ${site}/${group}`);
      }
      return executeParsedDocsToolingCommand(request, dependencies, repositoryRoot);
    };
    return operation(executeAlreadyFenced);
  });
}

export async function executeDocsToolingCommand(argv: readonly string[], dependencies: CliDependencies = {}): Promise<CommandContext> {
  const request = parseCliArgs(argv);
  const repositoryRoot = path.resolve(dependencies.repositoryRoot ?? process.cwd());
  return withDocsToolingGroupFence(repositoryRoot, request.site, request.group, executeAlreadyFenced => (
    executeAlreadyFenced(argv, dependencies)
  ));
}
