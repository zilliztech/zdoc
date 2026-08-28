import {createHash} from 'node:crypto';
import {constants, closeSync, existsSync, fstatSync, lstatSync, openSync, readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

import {
  assertSafeRepositoryPathChain,
  parseReferenceTranslationManifest,
  referenceLanguageExclusionReason,
  type ReferenceRetirementRegistry,
  type TranslationRecord,
} from '../reference/translationManifest.ts';
import {assertSafeRepositoryRelativePath} from '../validation/ownership.ts';
import {
  type TranslationCandidateReason,
  type TranslationRetirementChangeKind,
  type TranslationTarget,
  type TranslationTargetId,
} from './schema.ts';
import {resolveTranslationTarget} from './targets.ts';

export type TranslationCandidate = Readonly<{
  sourcePath: string;
  targetPath: string;
  sourceHash: string;
  locale: 'ja-JP' | 'zh-CN';
  reason: TranslationCandidateReason;
}>;

export type RetirementCandidate = Readonly<{
  manual: string;
  sourcePath: string;
  targetPath: string;
  changeKind: TranslationRetirementChangeKind;
}>;

export type CandidateBuildOptions = Readonly<{
  repositoryRoot: string;
  targetId: TranslationTargetId;
  group: string;
  ownedSourcePaths: readonly string[];
  preservedSourcePaths: readonly string[];
  forceTranslationPaths?: readonly string[];
  changedSourcePaths?: readonly string[];
  mode: 'full' | 'incremental';
  retirementRegistry?: ReferenceRetirementRegistry;
}>;

export class TranslationRetirementRequiredError extends Error {
  readonly retirementCandidates: readonly RetirementCandidate[];

  constructor(candidates: readonly RetirementCandidate[]) {
    super(`Translation retirement decision required for ${candidates.length} source mapping(s)`);
    this.name = 'TranslationRetirementRequiredError';
    this.retirementCandidates = deepFreeze(candidates.map(candidate => ({...candidate})).sort(compareRetirements));
  }
}

type PreviousRecord = Readonly<{sourcePath: string; targetPath?: string; sourceHash?: string; status?: string}>;
type CachePreviousRecord = PreviousRecord;
type PreviousRecordState =
  | Readonly<{kind: 'cache'; records: readonly CachePreviousRecord[]}>
  | Readonly<{kind: 'reference-manifest'; records: readonly TranslationRecord[]}>;

function canonicalJapaneseSourcePath(sourcePath: string): string {
  if (sourcePath.startsWith('docs/tutorials/')) return `content/en/guides/tutorials/${sourcePath.slice('docs/tutorials/'.length)}`;
  if (sourcePath.startsWith('docs-byoc/tutorials/')) return `content/en/byoc/tutorials/${sourcePath.slice('docs-byoc/tutorials/'.length)}`;
  if (sourcePath.startsWith('reference/')) return `content/en/reference/${sourcePath.slice('reference/'.length)}`;
  return sourcePath;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function hash(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function readRegularFile(repositoryRoot: string, relativePath: string, label: string): Buffer {
  const absolutePath = assertSafeRepositoryPathChain(repositoryRoot, relativePath, label);
  const descriptor = openSync(absolutePath, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    if (!fstatSync(descriptor).isFile()) throw new Error(`${label} must be a regular file: ${relativePath}`);
    return readFileSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function readJson(repositoryRoot: string, relativePath: string): unknown {
  if (!existsSync(path.join(repositoryRoot, relativePath))) return undefined;
  return JSON.parse(readRegularFile(repositoryRoot, relativePath, 'Translation state').toString('utf8'));
}

function isOwnedPath(filePath: string, ownedPaths: readonly string[]): boolean {
  return ownedPaths.some(owned => filePath === owned || filePath.startsWith(`${owned}/`));
}

function intersectsOwnership(filePath: string, ownedPaths: readonly string[]): boolean {
  return isOwnedPath(filePath, ownedPaths) || ownedPaths.some(owned => owned.startsWith(`${filePath}/`));
}

function sourceFiles(repositoryRoot: string, relativeRoot: string, ownedPaths: readonly string[]): Map<string, string> {
  const absoluteRoot = path.join(repositoryRoot, relativeRoot);
  if (!existsSync(absoluteRoot)) return new Map();
  assertSafeRepositoryPathChain(repositoryRoot, relativeRoot, 'Translation source root');
  const rootStats = lstatSync(absoluteRoot);
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) throw new Error(`Translation source root must be a non-symlink directory: ${relativeRoot}`);
  const files = new Map<string, string>();
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort((left, right) => compareText(left.name, right.name))) {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.relative(repositoryRoot, absolutePath).split(path.sep).join('/');
      if (!intersectsOwnership(relativePath, ownedPaths)) continue;
      if (entry.name !== entry.name.normalize('NFC')) throw new Error(`Translation source names must use NFC: ${entry.name}`);
      if (entry.isSymbolicLink()) throw new Error(`Translation source tree must not contain symlinks: ${absolutePath}`);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!entry.isFile()) throw new Error(`Translation source tree contains a non-regular file: ${absolutePath}`);
      if (!/\.mdx?$/u.test(entry.name)) continue;
      files.set(relativePath, hash(readRegularFile(repositoryRoot, relativePath, 'Translation source file')));
    }
  };
  visit(absoluteRoot);
  return files;
}

function validatePreviousRecordPaths<T extends Readonly<{sourcePath: string; targetPath?: string}>>(
  records: readonly T[],
  ownedPaths: readonly string[],
): T[] {
  const ownedRecords = records.filter(record => isOwnedPath(record.sourcePath, ownedPaths));
  for (const record of ownedRecords) {
    assertSafeRepositoryRelativePath(record.sourcePath, 'Translation state sourcePath');
    if (record.sourcePath !== record.sourcePath.normalize('NFC')) throw new Error(`Translation state sourcePath must use NFC: ${record.sourcePath}`);
    if (record.targetPath) {
      assertSafeRepositoryRelativePath(record.targetPath, 'Translation state targetPath');
      if (record.targetPath !== record.targetPath.normalize('NFC')) throw new Error(`Translation state targetPath must use NFC: ${record.targetPath}`);
    }
  }
  return ownedRecords;
}

function previousRecords(target: TranslationTarget, value: unknown, ownedPaths: readonly string[]): PreviousRecordState {
  if (target.state.kind === 'cache') {
    if (!value || typeof value !== 'object') return {kind: 'cache', records: []};
    const files = (value as {files?: Record<string, {sourceHash?: string; targetPath?: string}>}).files ?? {};
    const canonical = new Map<string, CachePreviousRecord>();
    for (const [sourcePath, record] of Object.entries(files)) {
      const canonicalPath = canonicalJapaneseSourcePath(sourcePath);
      if (!canonical.has(canonicalPath) || canonicalPath === sourcePath) canonical.set(canonicalPath, {sourcePath: canonicalPath, ...record});
    }
    return {kind: 'cache', records: validatePreviousRecordPaths([...canonical.values()], ownedPaths)};
  }
  if (!value || typeof value !== 'object') return {kind: 'reference-manifest', records: []};
  const rawRecords = Array.isArray((value as {records?: unknown[]}).records) ? (value as {records: unknown[]}).records : [];
  const selectedRecords = rawRecords.filter(record => (
    record !== null
    && typeof record === 'object'
    && typeof (record as {sourcePath?: unknown}).sourcePath === 'string'
    && isOwnedPath((record as {sourcePath: string}).sourcePath, ownedPaths)
  ));
  const records = parseReferenceTranslationManifest({...value, records: selectedRecords}).records;
  return {kind: 'reference-manifest', records: validatePreviousRecordPaths(records, ownedPaths)};
}

function mappings(target: TranslationTarget): ReadonlyArray<{sourceRoot: string; targetRoot: string}> {
  if (target.id !== 'ja-JP') return [{sourceRoot: target.sourceRoot, targetRoot: target.targetRoot}];
  return target.mappings.map(mapping => {
    if (!mapping.sourceRoot || !mapping.targetRoot) throw new Error('Japanese translation mappings require source and target roots');
    return {sourceRoot: mapping.sourceRoot, targetRoot: mapping.targetRoot};
  });
}

function mappedTarget(sourcePath: string, mapping: {sourceRoot: string; targetRoot: string}): string {
  return `${mapping.targetRoot}/${sourcePath.slice(mapping.sourceRoot.length + 1)}`;
}

function findSidebarNode(value: unknown, key: string): unknown {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findSidebarNode(child, key);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== 'object') return undefined;
  const node = value as {key?: unknown; items?: unknown};
  if (node.key === key) return value;
  return findSidebarNode(node.items, key);
}

function readSidebarFragment(repositoryRoot: string, identity: string): unknown {
  const [relativePath, key] = identity.split('#');
  if (!relativePath || !key) throw new Error(`Invalid sidebar fragment identity: ${identity}`);
  const absolutePath = assertSafeRepositoryPathChain(repositoryRoot, relativePath, 'Translation sidebar source');
  if (!existsSync(absolutePath)) return undefined;
  readRegularFile(repositoryRoot, relativePath, 'Translation sidebar source');
  const require = createRequire(import.meta.url);
  const resolved = require.resolve(absolutePath);
  delete require.cache[resolved];
  const loaded = require(resolved) as {default?: unknown} | unknown;
  const sidebar = loaded && typeof loaded === 'object' && 'default' in loaded ? loaded.default : loaded;
  return findSidebarNode(sidebar, key);
}

function targetIsRegular(repositoryRoot: string, relativePath: string): boolean {
  const absolutePath = path.join(repositoryRoot, relativePath);
  assertSafeRepositoryPathChain(repositoryRoot, relativePath, 'Translation target');
  if (!existsSync(absolutePath)) return false;
  const stats = lstatSync(absolutePath);
  if (stats.isSymbolicLink() || !stats.isFile()) throw new Error(`Translation target must be a regular non-symlink file: ${relativePath}`);
  return true;
}

function normalizePaths(values: readonly string[], label: string): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    assertSafeRepositoryRelativePath(value, label);
    if (value !== value.normalize('NFC')) throw new Error(`${label} must use NFC: ${value}`);
    if (seen.has(value)) throw new Error(`${label} must be unique: ${value}`);
    seen.add(value);
    result.push(value);
  }
  return result;
}

function mappingForSource(target: TranslationTarget, sourcePath: string): {sourceRoot: string; targetRoot: string} | undefined {
  return mappings(target).find(mapping => sourcePath.startsWith(`${mapping.sourceRoot}/`));
}

function manualForReferenceSource(sourcePath: string): string | undefined {
  const relativePath = sourcePath.slice('content/en/reference/'.length);
  const ownership = [
    ['api/python', 'python'],
    ['api/java', 'java'],
    ['api/nodejs', 'node'],
    ['api/go', 'go'],
    ['api/cpp', 'cpp'],
    ['api/restful', 'rest'],
    ['cli', 'cli'],
  ] as const;
  return ownership.find(([prefix]) => relativePath === prefix || relativePath.startsWith(`${prefix}/`))?.[1];
}

function compareCandidates(left: TranslationCandidate, right: TranslationCandidate): number {
  const reasonOrder: Record<TranslationCandidateReason, number> = {current_delta: 0, missing_target: 1, stale_source: 2};
  return reasonOrder[left.reason] - reasonOrder[right.reason] || compareText(left.sourcePath, right.sourcePath);
}

function compareRetirements(left: RetirementCandidate, right: RetirementCandidate): number {
  return compareText(left.manual, right.manual)
    || compareText(left.sourcePath, right.sourcePath)
    || compareText(left.targetPath, right.targetPath)
    || compareText(left.changeKind, right.changeKind);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function withoutLabels(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutLabels);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, key === 'label' ? '<translated-label>' : withoutLabels(child)]));
}

export function validateTranslatedSidebarFragment(source: unknown, translated: unknown): void {
  if (JSON.stringify(withoutLabels(source)) !== JSON.stringify(withoutLabels(translated))) {
    throw new Error('Translated sidebar structure, IDs, hrefs, keys, and nesting must match the English fragment');
  }
}

export function buildTranslationCandidates(options: CandidateBuildOptions): Readonly<{candidates: readonly TranslationCandidate[]; retirementCandidates: readonly RetirementCandidate[]}> {
  if (options.mode !== 'full' && options.mode !== 'incremental') throw new Error(`Unsupported translation candidate mode: ${options.mode}`);
  const target = resolveTranslationTarget(options.targetId);
  const owned = normalizePaths(options.ownedSourcePaths, 'Owned translation source path');
  if (owned.length === 0) throw new Error('Owned translation source paths must not be empty');
  const preserved = new Set(normalizePaths(options.preservedSourcePaths, 'Preserved translation source path'));
  const forced = new Set(normalizePaths(options.forceTranslationPaths ?? [], 'Forced translation source path'));
  const changed = new Set(normalizePaths(options.changedSourcePaths ?? [], 'Changed translation source path'));
  for (const [label, paths] of [['Preserved', preserved], ['Forced', forced], ['Changed', changed]] as const) {
    for (const sourcePath of paths) if (!isOwnedPath(sourcePath, owned)) throw new Error(`${label} translation source path is outside group ownership: ${sourcePath}`);
  }
  const targetMappings = mappings(target);
  for (const sourcePath of owned) {
    if (!targetMappings.some(mapping => intersectsOwnership(mapping.sourceRoot, [sourcePath]))) {
      throw new Error(`Owned translation source path is outside target mappings: ${sourcePath}`);
    }
  }
  const previousState = previousRecords(target, readJson(options.repositoryRoot, target.state.path), owned);
  const previous: readonly PreviousRecord[] = previousState.records;
  if (previousState.kind === 'reference-manifest') {
    for (const record of previousState.records) {
      const mapping = mappingForSource(target, record.sourcePath);
      if (!mapping) throw new Error(`Historical translation source is outside target mappings: ${record.sourcePath}`);
      const expectedManual = manualForReferenceSource(record.sourcePath);
      if (!expectedManual || record.manual !== expectedManual || (options.group !== 'reference-landings' && record.manual !== options.group)) {
        throw new Error(`Historical translation manual does not match selected group ownership: ${record.sourcePath}`);
      }
      const expectedTarget = mappedTarget(record.sourcePath, mapping);
      if (record.targetPath !== expectedTarget) {
        throw new Error(`Historical translation target does not match the canonical source mapping: ${record.sourcePath}`);
      }
    }
  }
  const previousBySource = new Map(previous.map(record => [record.sourcePath, record]));
  const activeSources = new Set<string>();
  const candidates: TranslationCandidate[] = [];

  for (const mapping of targetMappings) {
    if (!intersectsOwnership(mapping.sourceRoot, owned)) continue;
    for (const [sourcePath, sourceHash] of sourceFiles(options.repositoryRoot, mapping.sourceRoot, owned)) {
      activeSources.add(sourcePath);
      if (target.id === 'zh-CN-reference' && referenceLanguageExclusionReason(options.repositoryRoot, sourcePath, 'zh-CN')) continue;
      if (target.id === 'ja-JP' && referenceLanguageExclusionReason(options.repositoryRoot, sourcePath, 'ja-JP')) continue;
      const targetPath = mappedTarget(sourcePath, mapping);
      const targetExists = targetIsRegular(options.repositoryRoot, targetPath);
      const prior = previousBySource.get(sourcePath);
      if (options.mode !== 'full' && !changed.has(sourcePath) && !forced.has(sourcePath) && prior?.status !== 'retired' && targetExists && prior?.sourceHash === sourceHash) continue;
      const reason: TranslationCandidateReason = changed.has(sourcePath)
        ? 'current_delta'
        : !targetExists ? 'missing_target' : 'stale_source';
      candidates.push({sourcePath, targetPath, sourceHash, locale: target.locale, reason});
    }
  }

  const retirementCandidates: RetirementCandidate[] = [];
  if (previousState.kind === 'reference-manifest') {
    for (const record of previousState.records) {
      if (!isOwnedPath(record.sourcePath, owned) || preserved.has(record.sourcePath) || record.status === 'retired' || activeSources.has(record.sourcePath)) continue;
      const mapping = mappingForSource(target, record.sourcePath);
      if (!mapping) throw new Error(`Historical translation source is outside target mappings: ${record.sourcePath}`);
      retirementCandidates.push({
        manual: record.manual,
        sourcePath: record.sourcePath,
        targetPath: record.targetPath,
        changeKind: 'source_deleted',
      });
    }
  }

  candidates.sort(compareCandidates);
  retirementCandidates.sort(compareRetirements);
  return deepFreeze({candidates, retirementCandidates});
}
