import {existsSync, lstatSync, readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

import {
  EMPTY_FILE_SHA256,
  assertSafeRepositoryPathChain,
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
  readReferenceTree,
  type ReferenceSourceManifest,
  type ReferenceTranslationManifest,
} from '../reference/translationManifest.ts';

export type ValidateReferenceTranslationOptions = Readonly<{
  repositoryRoot: string;
  sourceRoot: string;
  targetRoot: string;
  sourceManifest: ReferenceSourceManifest;
  translationManifest: ReferenceTranslationManifest;
  verifyFiles?: boolean;
  manualForPath?: (repositoryRelativePath: string) => string;
}>;

export type ValidateReferenceSourceOptions = Readonly<{
  repositoryRoot: string;
  sourceRoot: string;
  sourceManifest: ReferenceSourceManifest;
}>;

function assertBelowRoot(filePath: string, root: string, label: string): void {
  if (!filePath.startsWith(`${root}/`)) throw new Error(`${label} must stay within ${root}: ${filePath}`);
}

function relativeBelowRoot(filePath: string, root: string): string {
  assertBelowRoot(filePath, root, 'Translation path');
  return filePath.slice(root.length + 1);
}

function fileHash(repositoryRoot: string, relativePath: string): string | undefined {
  const absolutePath = assertSafeRepositoryPathChain(repositoryRoot, relativePath, 'Manifest file');
  if (!existsSync(absolutePath)) return undefined;
  const stats = lstatSync(absolutePath);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`Manifest file must be a regular non-symlink file: ${relativePath}`);
  return createHash('sha256').update(readFileSync(absolutePath)).digest('hex');
}

export function validateReferenceTranslation(options: ValidateReferenceTranslationOptions): void {
  const sourceManifest = parseReferenceSourceManifest(options.sourceManifest);
  const translationManifest = parseReferenceTranslationManifest(options.translationManifest);
  const sourceRecords = new Map<string, ReferenceSourceManifest['records'][number]>();
  for (const record of sourceManifest.records) {
    assertBelowRoot(record.sourcePath, options.sourceRoot, 'Source path');
    if (sourceRecords.has(record.sourcePath)) throw new Error(`Duplicate canonical source: ${record.sourcePath}`);
    sourceRecords.set(record.sourcePath, record);
  }

  const translationsBySource = new Map<string, ReferenceTranslationManifest['records'][number]>();
  const targetPaths = new Set<string>();
  for (const record of translationManifest.records) {
    assertBelowRoot(record.sourcePath, options.sourceRoot, 'Translation source path');
    assertBelowRoot(record.targetPath, options.targetRoot, 'Translation target path');
    if (relativeBelowRoot(record.sourcePath, options.sourceRoot) !== relativeBelowRoot(record.targetPath, options.targetRoot)) {
      throw new Error(`Translation mapping must use the same canonical relative path: ${record.sourcePath} -> ${record.targetPath}`);
    }
    if (record.sourceCommit !== sourceManifest.sourceCommit) throw new Error(`Translation source commit mismatch: ${record.sourcePath}`);
    if (translationsBySource.has(record.sourcePath)) throw new Error(`Duplicate source mapping: ${record.sourcePath}`);
    if (targetPaths.has(record.targetPath)) throw new Error(`Duplicate target mapping: ${record.targetPath}`);
    translationsBySource.set(record.sourcePath, record);
    targetPaths.add(record.targetPath);

    const source = sourceRecords.get(record.sourcePath);
    if (!source && !(record.status === 'retired' && record.sourceHash === EMPTY_FILE_SHA256)) {
      throw new Error(`Orphan target has no active or retired source mapping: ${record.targetPath}`);
    }
    if (source && source.manual !== record.manual) throw new Error(`Translation manual mismatch: ${record.sourcePath}`);
    if (options.manualForPath) {
      if (options.manualForPath(record.sourcePath) !== record.manual || options.manualForPath(record.targetPath) !== record.manual) {
        throw new Error(`Translation manual does not match source and target ownership: ${record.sourcePath}`);
      }
    }
    if (source && source.sourceHash !== record.sourceHash) throw new Error(`Declared source hash mismatch: ${record.sourcePath}`);
    if (record.status === 'unchanged' && record.sourceHash !== record.targetHash) {
      throw new Error(`Unchanged translation must have identical source and target hashes: ${record.targetPath}`);
    }
    if (record.status === 'translated' && record.sourceHash === record.targetHash) {
      throw new Error(`Translated status requires source and target hashes to differ: ${record.targetPath}`);
    }
  }

  for (const source of sourceManifest.records) {
    if (!translationsBySource.has(source.sourcePath)) {
      throw new Error(`Active canonical source is missing a Chinese target mapping: ${source.sourcePath}`);
    }
  }

  if (options.verifyFiles === false) return;
  const sourceFiles = readReferenceTree(options.repositoryRoot, options.sourceRoot);
  const targetFiles = readReferenceTree(options.repositoryRoot, options.targetRoot);
  for (const record of translationManifest.records) {
    const sourceHash = fileHash(options.repositoryRoot, record.sourcePath);
    const targetHash = fileHash(options.repositoryRoot, record.targetPath);
    const sourceMissing = sourceHash === undefined;
    const targetMissing = targetHash === undefined;
    if (record.status === 'retired') {
      if (sourceMissing === targetMissing) {
        throw new Error(`Retired translation must have exactly one missing side: ${record.sourcePath} -> ${record.targetPath}`);
      }
    } else if (sourceMissing || targetMissing) {
      throw new Error(`Active translation source and target must both exist: ${record.sourcePath}`);
    }
    if (sourceHash && sourceHash !== record.sourceHash) throw new Error(`Source hash mismatch: ${record.sourcePath}`);
    if (targetHash && targetHash !== record.targetHash) throw new Error(`Target hash mismatch: ${record.targetPath}`);
    if (sourceMissing && record.sourceHash !== EMPTY_FILE_SHA256) throw new Error(`Missing retired source must use the empty-file hash: ${record.sourcePath}`);
    if (targetMissing && record.targetHash !== EMPTY_FILE_SHA256) throw new Error(`Missing retired target must use the empty-file hash: ${record.targetPath}`);
  }
  for (const [filePath, hash] of sourceFiles) {
    const source = sourceRecords.get(filePath);
    if (!source) throw new Error(`Active canonical source is absent from the source manifest: ${filePath}`);
    if (source.sourceHash !== hash) throw new Error(`Source hash mismatch: ${filePath}`);
  }
  for (const source of sourceManifest.records) {
    if (!sourceFiles.has(source.sourcePath)) throw new Error(`Source manifest path is missing: ${source.sourcePath}`);
  }
  for (const [filePath] of targetFiles) {
    if (!targetPaths.has(filePath)) throw new Error(`Orphan target is absent from the translation manifest: ${filePath}`);
  }
}

export function validateReferenceSource(options: ValidateReferenceSourceOptions): void {
  const sourceManifest = parseReferenceSourceManifest(options.sourceManifest);
  const files = readReferenceTree(options.repositoryRoot, options.sourceRoot);
  const records = new Map(sourceManifest.records.map(record => [record.sourcePath, record]));
  if (records.size !== sourceManifest.records.length) throw new Error('Reference source manifest contains duplicate source paths');
  for (const record of sourceManifest.records) assertBelowRoot(record.sourcePath, options.sourceRoot, 'Source path');
  for (const [filePath, hash] of files) {
    const record = records.get(filePath);
    if (!record) throw new Error(`Active canonical source is absent from the source manifest: ${filePath}`);
    if (record.sourceHash !== hash) throw new Error(`Source hash mismatch: ${filePath}`);
  }
  for (const record of sourceManifest.records) {
    if (!files.has(record.sourcePath)) throw new Error(`Source manifest path is missing: ${record.sourcePath}`);
  }
}
