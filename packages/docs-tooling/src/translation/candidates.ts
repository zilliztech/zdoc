import {createHash} from 'node:crypto';
import {constants, closeSync, existsSync, fstatSync, lstatSync, openSync, readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

import {assertSafeRepositoryPathChain} from '../reference/translationManifest.ts';
import {assertSafeRepositoryRelativePath} from '../validation/ownership.ts';
import {type TranslationCandidateReason, type TranslationTarget, type TranslationTargetId} from './schema.ts';
import {resolveTranslationTarget} from './targets.ts';

export type TranslationCandidate = Readonly<{
  sourcePath: string;
  targetPath: string;
  sourceHash: string;
  locale: 'ja-JP' | 'zh-CN';
  reason: TranslationCandidateReason;
}>;

export type RetirementCandidate = Readonly<{
  sourcePath: string;
  targetPath: string;
  reason: 'source_deleted' | 'source_renamed' | 'sidebar_removed';
}>;

export class TranslationRetirementRequiredError extends Error {
  readonly retirementCandidates: readonly RetirementCandidate[];

  constructor(candidates: readonly RetirementCandidate[]) {
    super(`Translation retirement decision required for ${candidates.length} source mapping(s)`);
    this.name = 'TranslationRetirementRequiredError';
    this.retirementCandidates = candidates;
  }
}

type PreviousRecord = Readonly<{sourcePath: string; targetPath?: string; sourceHash?: string; status?: string}>;

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

function sourceFiles(repositoryRoot: string, relativeRoot: string): Map<string, string> {
  const absoluteRoot = path.join(repositoryRoot, relativeRoot);
  if (!existsSync(absoluteRoot)) return new Map();
  assertSafeRepositoryPathChain(repositoryRoot, relativeRoot, 'Translation source root');
  const rootStats = lstatSync(absoluteRoot);
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) throw new Error(`Translation source root must be a non-symlink directory: ${relativeRoot}`);
  const files = new Map<string, string>();
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort((left, right) => compareText(left.name, right.name))) {
      if (entry.name !== entry.name.normalize('NFC')) throw new Error(`Translation source names must use NFC: ${entry.name}`);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Translation source tree must not contain symlinks: ${absolutePath}`);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!entry.isFile()) throw new Error(`Translation source tree contains a non-regular file: ${absolutePath}`);
      if (!/\.mdx?$/u.test(entry.name)) continue;
      const relativePath = path.relative(repositoryRoot, absolutePath).split(path.sep).join('/');
      files.set(relativePath, hash(readRegularFile(repositoryRoot, relativePath, 'Translation source file')));
    }
  };
  visit(absoluteRoot);
  return files;
}

function previousRecords(target: TranslationTarget, value: unknown): PreviousRecord[] {
  if (!value || typeof value !== 'object') return [];
  let records: PreviousRecord[];
  if (target.state.kind === 'cache') {
    const files = (value as {files?: Record<string, {sourceHash?: string; targetPath?: string}>}).files ?? {};
    const canonical = new Map<string, PreviousRecord>();
    for (const [sourcePath, record] of Object.entries(files)) {
      const canonicalPath = canonicalJapaneseSourcePath(sourcePath);
      if (!canonical.has(canonicalPath) || canonicalPath === sourcePath) canonical.set(canonicalPath, {sourcePath: canonicalPath, ...record});
    }
    records = [...canonical.values()];
  } else {
    records = Array.isArray((value as {records?: unknown[]}).records)
      ? (value as {records: PreviousRecord[]}).records
      : [];
  }
  for (const record of records) {
    assertSafeRepositoryRelativePath(record.sourcePath, 'Translation state sourcePath');
    if (record.sourcePath !== record.sourcePath.normalize('NFC')) throw new Error(`Translation state sourcePath must use NFC: ${record.sourcePath}`);
    if (record.targetPath) {
      assertSafeRepositoryRelativePath(record.targetPath, 'Translation state targetPath');
      if (record.targetPath !== record.targetPath.normalize('NFC')) throw new Error(`Translation state targetPath must use NFC: ${record.targetPath}`);
    }
  }
  return records;
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

function retirementRegistryPath(targetId: TranslationTargetId): string | undefined {
  if (targetId === 'zh-CN-reference') return 'config/reference-retirements.json';
  return undefined;
}

function registeredRetirements(repositoryRoot: string, targetId: TranslationTargetId): Set<string> {
  const registryPath = retirementRegistryPath(targetId);
  const registry = registryPath ? readJson(repositoryRoot, registryPath) as {retirements?: RetirementCandidate[]} | undefined : undefined;
  return new Set((registry?.retirements ?? []).map(record => `${record.sourcePath}\0${record.targetPath}\0${record.reason}`));
}

function registeredRetirementTargets(repositoryRoot: string, targetId: TranslationTargetId): Set<string> {
  const registryPath = retirementRegistryPath(targetId);
  const registry = registryPath ? readJson(repositoryRoot, registryPath) as {retirements?: RetirementCandidate[]} | undefined : undefined;
  return new Set((registry?.retirements ?? []).map(record => record.targetPath));
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

export function buildTranslationCandidates(options: Readonly<{
  repositoryRoot: string;
  targetId: TranslationTargetId;
  changedSourcePaths?: readonly string[];
  renamedSourcePaths?: Readonly<Record<string, string>>;
}>): Readonly<{candidates: readonly TranslationCandidate[]; retirementCandidates: readonly RetirementCandidate[]}> {
  const target = resolveTranslationTarget(options.targetId);
  const changed = new Set(options.changedSourcePaths ?? []);
  const previous = previousRecords(target, readJson(options.repositoryRoot, target.state.path));
  const previousBySource = new Map(previous.map(record => [record.sourcePath, record]));
  const activeSources = new Set<string>();
  const candidates: TranslationCandidate[] = [];
  const retiredTargets = registeredRetirementTargets(options.repositoryRoot, target.id);

  for (const mapping of mappings(target)) {
    for (const [sourcePath, sourceHash] of sourceFiles(options.repositoryRoot, mapping.sourceRoot)) {
      activeSources.add(sourcePath);
      const targetPath = mappedTarget(sourcePath, mapping);
      if (retiredTargets.has(targetPath)) continue;
      const targetExists = targetIsRegular(options.repositoryRoot, targetPath);
      const prior = previousBySource.get(sourcePath);
      if (targetExists && prior?.sourceHash === sourceHash) continue;
      const reason: TranslationCandidateReason = changed.has(sourcePath)
        ? 'current_delta'
        : !targetExists ? 'missing_target' : 'stale_source';
      candidates.push({sourcePath, targetPath, sourceHash, locale: target.locale, reason});
    }
  }

  const retirementCandidates: RetirementCandidate[] = [];
  if (target.id !== 'ja-JP') {
    for (const record of previous) {
      if (record.status === 'retired' || activeSources.has(record.sourcePath)) continue;
      const renamed = options.renamedSourcePaths?.[record.sourcePath];
      retirementCandidates.push({
        sourcePath: record.sourcePath,
        targetPath: record.targetPath ?? mappedTarget(record.sourcePath, mappings(target)[0]),
        reason: renamed ? 'source_renamed' : 'source_deleted',
      });
    }
  }

  const reasonOrder: Record<TranslationCandidateReason, number> = {current_delta: 0, missing_target: 1, stale_source: 2};
  candidates.sort((left, right) => reasonOrder[left.reason] - reasonOrder[right.reason] || compareText(left.sourcePath, right.sourcePath));
  retirementCandidates.sort((left, right) => compareText(left.sourcePath, right.sourcePath) || compareText(left.targetPath, right.targetPath));

  const registered = registeredRetirements(options.repositoryRoot, target.id);
  const unresolved = retirementCandidates.filter(record => !registered.has(`${record.sourcePath}\0${record.targetPath}\0${record.reason}`));
  if (unresolved.length > 0) throw new TranslationRetirementRequiredError(unresolved);
  return {candidates, retirementCandidates: []};
}
