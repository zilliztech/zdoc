import {existsSync, lstatSync, readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

import {
  EMPTY_FILE_SHA256,
  assertSafeRepositoryPathChain,
  parseReferenceSourceManifest,
  parseReferenceTranslationManifest,
  readReferenceTree,
  referenceLanguageExclusionReason,
  type ReferenceSourceManifest,
  type ReferenceTranslationManifest,
} from '../reference/translationManifest.ts';
import {
  parseReferenceReconciliationLedger,
  type ReferenceReconciliationLedger,
} from '../reference/reconciliationLedger.ts';

export type TranslationSourceProvenance = Readonly<{
  sourceCommit: string;
  sourceManifestCommit: string;
  sourcePath: string;
  sourcePathAtCommit: string;
  sourceHash: string;
  expectedHistoricalSource: 'blob' | 'missing';
}>;

export type TranslationSourceProvenanceVerifier = (provenance: readonly TranslationSourceProvenance[]) => void;

export type ValidateReferenceTranslationOptions = Readonly<{
  repositoryRoot: string;
  sourceRoot: string;
  targetRoot: string;
  rootMappings?: readonly Readonly<{sourceRoot: string; targetRoot: string}>[];
  sourceManifest: ReferenceSourceManifest;
  translationManifest: ReferenceTranslationManifest;
  verifyFiles?: boolean;
  manualForPath?: (repositoryRelativePath: string) => string;
  verifySourceProvenance?: TranslationSourceProvenanceVerifier;
  supplementalMappings?: readonly Readonly<{sourcePath: string; targetPath: string; manual: string}>[];
}>;

export type ValidateReferenceSourceOptions = Readonly<{
  repositoryRoot: string;
  sourceRoot: string;
  sourceManifest: ReferenceSourceManifest;
  manualForPath?: (repositoryRelativePath: string) => string;
}>;

function assertBelowRoot(filePath: string, root: string, label: string): void {
  if (!filePath.startsWith(`${root}/`)) throw new Error(`${label} must stay within ${root}: ${filePath}`);
}

function relativeBelowRoot(filePath: string, root: string): string {
  assertBelowRoot(filePath, root, 'Translation path');
  return filePath.slice(root.length + 1);
}

function rootMappings(options: Pick<ValidateReferenceTranslationOptions, 'sourceRoot' | 'targetRoot' | 'rootMappings'>): readonly Readonly<{sourceRoot: string; targetRoot: string}>[] {
  return options.rootMappings ?? [{sourceRoot: options.sourceRoot, targetRoot: options.targetRoot}];
}

function mappingForSource(sourcePath: string, mappings: readonly Readonly<{sourceRoot: string; targetRoot: string}>[]): Readonly<{sourceRoot: string; targetRoot: string}> | undefined {
  return mappings.find(mapping => sourcePath.startsWith(`${mapping.sourceRoot}/`));
}

function mappingForTarget(targetPath: string, mappings: readonly Readonly<{sourceRoot: string; targetRoot: string}>[]): Readonly<{sourceRoot: string; targetRoot: string}> | undefined {
  return mappings.find(mapping => targetPath.startsWith(`${mapping.targetRoot}/`));
}

function assertCanonicalMapping(
  sourcePath: string,
  targetPath: string,
  mappings: readonly Readonly<{sourceRoot: string; targetRoot: string}>[],
  label: string,
): void {
  const mapping = mappingForSource(sourcePath, mappings);
  if (!mapping) throw new Error(`${label} source path is outside canonical mappings: ${sourcePath}`);
  assertBelowRoot(targetPath, mapping.targetRoot, `${label} target path`);
  if (relativeBelowRoot(sourcePath, mapping.sourceRoot) !== relativeBelowRoot(targetPath, mapping.targetRoot)) {
    throw new Error(`${label} mapping must use the same canonical relative path: ${sourcePath} -> ${targetPath}`);
  }
}

function readMappedTrees(repositoryRoot: string, mappings: readonly Readonly<{sourceRoot: string; targetRoot: string}>[], side: 'source' | 'target'): ReadonlyMap<string, string> {
  const files = new Map<string, string>();
  for (const mapping of mappings) {
    for (const [filePath, hash] of readReferenceTree(repositoryRoot, side === 'source' ? mapping.sourceRoot : mapping.targetRoot)) {
      if (files.has(filePath)) throw new Error(`Duplicate mapped Reference ${side} path: ${filePath}`);
      files.set(filePath, hash);
    }
  }
  return files;
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
  const mappings = rootMappings(options);
  const sourceRecords = new Map<string, ReferenceSourceManifest['records'][number]>();
  const supplementalBySource = new Map((options.supplementalMappings ?? []).map(mapping => [mapping.sourcePath, mapping]));
  for (const record of sourceManifest.records) {
    if (!mappingForSource(record.sourcePath, mappings)) throw new Error(`Source path is outside canonical mappings: ${record.sourcePath}`);
    if (sourceRecords.has(record.sourcePath)) throw new Error(`Duplicate canonical source: ${record.sourcePath}`);
    sourceRecords.set(record.sourcePath, record);
  }

  const translationsBySource = new Map<string, ReferenceTranslationManifest['records'][number]>();
  const targetPaths = new Set<string>();
  const sourceProvenance: TranslationSourceProvenance[] = [];
  for (const record of translationManifest.records) {
    const supplemental = supplementalBySource.get(record.sourcePath);
    if (supplemental) {
      if (record.targetPath !== supplemental.targetPath || record.manual !== supplemental.manual) {
        throw new Error(`Supplemental translation mapping is not canonical: ${record.sourcePath}`);
      }
    } else {
      assertCanonicalMapping(record.sourcePath, record.targetPath, mappings, 'Translation');
    }
    if (translationsBySource.has(record.sourcePath)) throw new Error(`Duplicate source mapping: ${record.sourcePath}`);
    if (targetPaths.has(record.targetPath)) throw new Error(`Duplicate target mapping: ${record.targetPath}`);
    translationsBySource.set(record.sourcePath, record);
    targetPaths.add(record.targetPath);

    const source = sourceRecords.get(record.sourcePath);
    if (!source && !supplemental && !(record.status === 'retired' && record.sourceHash === EMPTY_FILE_SHA256)) {
      throw new Error(`Orphan target has no active or retired source mapping: ${record.targetPath}`);
    }
    if (source && source.manual !== record.manual) throw new Error(`Translation manual mismatch: ${record.sourcePath}`);
    if (options.manualForPath && !supplemental) {
      if (options.manualForPath(record.sourcePath) !== record.manual || options.manualForPath(record.targetPath) !== record.manual) {
        throw new Error(`Translation manual does not match source and target ownership: ${record.sourcePath}`);
      }
    }
    if (source && source.sourceHash !== record.sourceHash && record.sourceCommit === sourceManifest.sourceCommit) {
      throw new Error(`Declared source hash mismatch: ${record.sourcePath}`);
    }
    if (record.sourceCommit !== sourceManifest.sourceCommit || supplemental) {
      sourceProvenance.push({
        sourceCommit: record.sourceCommit,
        sourceManifestCommit: sourceManifest.sourceCommit,
        sourcePath: record.sourcePath,
        sourcePathAtCommit: record.sourcePathAtCommit ?? record.sourcePath,
        sourceHash: record.sourceHash,
        expectedHistoricalSource: supplemental || source !== undefined ? 'blob' : 'missing',
      });
    }
    if (record.status === 'unchanged' && record.sourceHash !== record.targetHash) {
      throw new Error(`Unchanged translation must have identical source and target hashes: ${record.targetPath}`);
    }
    if (record.status === 'translated' && record.sourceHash === record.targetHash) {
      throw new Error(`Translated status requires source and target hashes to differ: ${record.targetPath}`);
    }
  }

  const pendingBySource = new Map<string, NonNullable<ReferenceTranslationManifest['pendingRecords']>[number]>();
  for (const record of translationManifest.pendingRecords ?? []) {
    assertCanonicalMapping(record.sourcePath, record.targetPath, mappings, 'Pending');
    if (translationsBySource.has(record.sourcePath) || pendingBySource.has(record.sourcePath)) {
      throw new Error(`Reference source coverage overlaps translation and pending records: ${record.sourcePath}`);
    }
    if (targetPaths.has(record.targetPath)) throw new Error(`Duplicate target mapping across translation and pending records: ${record.targetPath}`);
    const source = sourceRecords.get(record.sourcePath);
    if (!source) throw new Error(`Pending source is absent from the active source manifest: ${record.sourcePath}`);
    if (source.manual !== record.manual) throw new Error(`Pending manual mismatch: ${record.sourcePath}`);
    if (options.manualForPath) {
      if (options.manualForPath(record.sourcePath) !== record.manual || options.manualForPath(record.targetPath) !== record.manual) {
        throw new Error(`Pending manual does not match source and target ownership: ${record.sourcePath}`);
      }
    }
    if (record.sourceCommit !== sourceManifest.sourceCommit) throw new Error(`Pending source commit must match the current source manifest: ${record.sourcePath}`);
    if (record.sourceHash !== source.sourceHash) throw new Error(`Pending source hash must match the current source manifest: ${record.sourcePath}`);
    pendingBySource.set(record.sourcePath, record);
    targetPaths.add(record.targetPath);
  }

  const languageExcludedBySource = new Map<string, NonNullable<ReferenceTranslationManifest['languageExcludedRecords']>[number]>();
  for (const record of translationManifest.languageExcludedRecords ?? []) {
    assertCanonicalMapping(record.sourcePath, record.targetPath, mappings, 'Language-excluded');
    if (translationsBySource.has(record.sourcePath) || pendingBySource.has(record.sourcePath) || languageExcludedBySource.has(record.sourcePath)) {
      throw new Error(`Reference source coverage overlaps translation, pending, and language-excluded records: ${record.sourcePath}`);
    }
    if (targetPaths.has(record.targetPath)) throw new Error(`Duplicate target mapping across translation, pending, and language-excluded records: ${record.targetPath}`);
    const source = sourceRecords.get(record.sourcePath);
    if (!source) throw new Error(`Language-excluded source is absent from the active source manifest: ${record.sourcePath}`);
    if (source.manual !== record.manual) throw new Error(`Language-excluded manual mismatch: ${record.sourcePath}`);
    if (options.manualForPath) {
      if (options.manualForPath(record.sourcePath) !== record.manual || options.manualForPath(record.targetPath) !== record.manual) {
        throw new Error(`Language-excluded manual does not match source and target ownership: ${record.sourcePath}`);
      }
    }
    if (record.sourceCommit !== sourceManifest.sourceCommit) throw new Error(`Language-excluded source commit must match the current source manifest: ${record.sourcePath}`);
    if (record.sourceHash !== source.sourceHash) throw new Error(`Language-excluded source hash must match the current source manifest: ${record.sourcePath}`);
    if (referenceLanguageExclusionReason(options.repositoryRoot, record.sourcePath, record.locale) !== record.reason) {
      throw new Error(`Language-excluded source does not declare a matching active policy: ${record.sourcePath}`);
    }
    languageExcludedBySource.set(record.sourcePath, record);
    targetPaths.add(record.targetPath);
  }

  for (const source of sourceManifest.records) {
    if (options.manualForPath && options.manualForPath(source.sourcePath) === 'rest') continue;
    if (!translationsBySource.has(source.sourcePath) && !pendingBySource.has(source.sourcePath) && !languageExcludedBySource.has(source.sourcePath)) {
      throw new Error(`Active Reference source lacks coverage by a translation record, pending record, or language-excluded record: ${source.sourcePath}`);
    }
  }

  if (sourceProvenance.length > 0) {
    if (!options.verifySourceProvenance) {
      throw new Error(`Translation source provenance cannot be verified for checkpoint mismatch: ${sourceProvenance[0].sourcePath}`);
    }
    options.verifySourceProvenance(sourceProvenance);
  }

  if (options.verifyFiles === false) return;
  const sourceFiles = readMappedTrees(options.repositoryRoot, mappings, 'source');
  const targetFiles = readMappedTrees(options.repositoryRoot, mappings, 'target');
  for (const record of translationManifest.pendingRecords ?? []) {
    if (fileHash(options.repositoryRoot, record.targetPath) !== undefined) {
      throw new Error(`Pending target must be missing: ${record.targetPath}`);
    }
  }
  for (const record of translationManifest.languageExcludedRecords ?? []) {
    if (fileHash(options.repositoryRoot, record.targetPath) !== undefined) {
      throw new Error(`Language-excluded target must be missing: ${record.targetPath}`);
    }
  }
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
    if (sourceHash && sourceHash !== record.sourceHash && record.sourceCommit === sourceManifest.sourceCommit) {
      throw new Error(`Source hash mismatch: ${record.sourcePath}`);
    }
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
    if (options.manualForPath && options.manualForPath(filePath) === 'rest') continue;
    if (!mappingForTarget(filePath, mappings)) throw new Error(`Active target is outside canonical mappings: ${filePath}`);
    if (!targetPaths.has(filePath)) throw new Error(`Orphan target is absent from the translation manifest: ${filePath}`);
  }
}

export function validateReferenceSource(options: ValidateReferenceSourceOptions): void {
  const sourceManifest = parseReferenceSourceManifest(options.sourceManifest);
  const files = readReferenceTree(options.repositoryRoot, options.sourceRoot);
  const records = new Map(sourceManifest.records.map(record => [record.sourcePath, record]));
  if (records.size !== sourceManifest.records.length) throw new Error('Reference source manifest contains duplicate source paths');
  for (const record of sourceManifest.records) {
    assertBelowRoot(record.sourcePath, options.sourceRoot, 'Source path');
    if (options.manualForPath && options.manualForPath(record.sourcePath) !== record.manual) {
      throw new Error(`Reference source manual does not match authoritative ownership: ${record.sourcePath}`);
    }
  }
  for (const [filePath, hash] of files) {
    const record = records.get(filePath);
    if (!record) throw new Error(`Active canonical source is absent from the source manifest: ${filePath}`);
    if (record.sourceHash !== hash) throw new Error(`Source hash mismatch: ${filePath}`);
  }
  for (const record of sourceManifest.records) {
    if (!files.has(record.sourcePath)) throw new Error(`Source manifest path is missing: ${record.sourcePath}`);
  }
}

export function validateReferenceReconciliationLedger(value: ReferenceReconciliationLedger): void {
  parseReferenceReconciliationLedger(value);
}
