import {createHash} from 'node:crypto';
import {closeSync, constants, existsSync, fstatSync, lstatSync, openSync, readdirSync, readFileSync, realpathSync} from 'node:fs';
import path from 'node:path';

import {z} from 'zod';

import {manualRegistry, publicationEntries} from '../manuals/registry.ts';
import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';

const SHA256 = /^[a-f0-9]{64}$/u;
const COMMIT_SHA = /^[a-f0-9]{40}$/u;

export const EMPTY_FILE_SHA256 = createHash('sha256').update(Buffer.alloc(0)).digest('hex');

const RepositoryPathSchema = z.string().superRefine((value, context) => {
  try {
    assertSafeRepositoryRelativePath(value, 'Manifest path');
  } catch (error) {
    context.addIssue({code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : String(error)});
  }
});

const SourceRecordSchema = z.object({
  manual: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  sourcePath: RepositoryPathSchema,
  sourceHash: z.string().regex(SHA256),
}).strict();

const TranslationRecordSchema = z.object({
  manual: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  sourcePath: RepositoryPathSchema,
  targetPath: RepositoryPathSchema,
  sourceCommit: z.string().regex(COMMIT_SHA),
  sourceHash: z.string().regex(SHA256),
  targetHash: z.string().regex(SHA256),
  status: z.enum(['translated', 'unchanged', 'retired']),
}).strict();

const PendingRecordSchema = z.object({
  manual: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  sourcePath: RepositoryPathSchema,
  targetPath: RepositoryPathSchema,
  sourceCommit: z.string().regex(COMMIT_SHA),
  sourceHash: z.string().regex(SHA256),
}).strict();

const LanguageExcludedRecordSchema = z.object({
  manual: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  sourcePath: RepositoryPathSchema,
  targetPath: RepositoryPathSchema,
  sourceCommit: z.string().regex(COMMIT_SHA),
  sourceHash: z.string().regex(SHA256),
  locale: z.literal('zh-CN'),
  reason: z.literal('x-include-langs'),
}).strict();

const ReferenceSourceManifestSchema = z.object({
  schemaVersion: z.literal(1),
  sourceCommit: z.string().regex(COMMIT_SHA),
  records: z.array(SourceRecordSchema),
}).strict().superRefine((manifest, context) => {
  for (let index = 1; index < manifest.records.length; index += 1) {
    if (compareRecords(manifest.records[index - 1], manifest.records[index]) > 0) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['records', index], message: 'Source manifest records must be canonically sorted by manual and sourcePath'});
      return;
    }
  }
});

const ReferenceTranslationManifestSchema = z.object({
  schemaVersion: z.literal(1),
  bootstrapCompletedGroups: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/u)).optional(),
  records: z.array(TranslationRecordSchema),
  pendingRecords: z.array(PendingRecordSchema).optional(),
  languageExcludedRecords: z.array(LanguageExcludedRecordSchema).optional(),
}).strict().superRefine((manifest, context) => {
  if (manifest.bootstrapCompletedGroups) {
    for (let index = 1; index < manifest.bootstrapCompletedGroups.length; index += 1) {
      if (compareText(manifest.bootstrapCompletedGroups[index - 1], manifest.bootstrapCompletedGroups[index]) >= 0) {
        context.addIssue({code: z.ZodIssueCode.custom, path: ['bootstrapCompletedGroups', index], message: 'Bootstrap groups must be unique and canonically sorted'});
        return;
      }
    }
  }
  for (let index = 1; index < manifest.records.length; index += 1) {
    if (compareRecords(manifest.records[index - 1], manifest.records[index]) > 0) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['records', index], message: 'Translation manifest records must be canonically sorted by manual, sourcePath, and targetPath'});
      return;
    }
  }
  const coveredSourcePaths = new Set(manifest.records.map(record => record.sourcePath));
  const coveredTargetPaths = new Set(manifest.records.map(record => record.targetPath));
  for (const [index, record] of (manifest.pendingRecords ?? []).entries()) {
    if (coveredSourcePaths.has(record.sourcePath) || coveredTargetPaths.has(record.targetPath)) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['pendingRecords', index], message: 'Pending records must have unique sourcePath and targetPath values and must not overlap translated or retired records'});
      return;
    }
    coveredSourcePaths.add(record.sourcePath);
    coveredTargetPaths.add(record.targetPath);
    if (index > 0 && compareRecords(manifest.pendingRecords![index - 1], record) > 0) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['pendingRecords', index], message: 'Pending records must be canonically sorted by manual, sourcePath, and targetPath'});
      return;
    }
  }
  for (const [index, record] of (manifest.languageExcludedRecords ?? []).entries()) {
    if (coveredSourcePaths.has(record.sourcePath) || coveredTargetPaths.has(record.targetPath)) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['languageExcludedRecords', index], message: 'Language-excluded records must not overlap translated, retired, pending, or other language-excluded sourcePath and targetPath values'});
      return;
    }
    coveredSourcePaths.add(record.sourcePath);
    coveredTargetPaths.add(record.targetPath);
    if (index > 0 && compareRecords(manifest.languageExcludedRecords![index - 1], record) > 0) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['languageExcludedRecords', index], message: 'Language-excluded records must be canonically sorted by manual, sourcePath, and targetPath'});
      return;
    }
  }
});

const RetirementRecordSchema = z.object({
  manual: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  sourcePath: RepositoryPathSchema,
  targetPath: RepositoryPathSchema,
  changeKind: z.enum(['source_deleted', 'source_renamed', 'sidebar_removed']).nullable(),
  rationale: z.string().min(1),
}).strict().superRefine((record, context) => {
  const sourceRelative = relativeToRoot(record.sourcePath, 'content/en/reference');
  const targetRelative = relativeToRoot(record.targetPath, 'content/zh-CN/reference');
  if (sourceRelative !== targetRelative) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Retirement source and target must use the same canonical relative path'});
  }
  const manual = referenceManualForRelativePath(sourceRelative);
  if (!manual || manual !== record.manual) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Retirement manual does not match Reference path ownership'});
  }
});

const ReferenceRetirementRegistrySchema = z.object({
  schemaVersion: z.literal(2),
  retirements: z.array(RetirementRecordSchema),
}).strict().superRefine((registry, context) => {
  const sourcePaths = new Set<string>();
  const targetPaths = new Set<string>();
  for (const [index, record] of registry.retirements.entries()) {
    if (sourcePaths.has(record.sourcePath) || targetPaths.has(record.targetPath)) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['retirements', index], message: 'Retirement sourcePath and targetPath decisions must be unique'});
      return;
    }
    sourcePaths.add(record.sourcePath);
    targetPaths.add(record.targetPath);
  }
  for (let index = 1; index < registry.retirements.length; index += 1) {
    if (compareRecords(registry.retirements[index - 1], registry.retirements[index]) > 0) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['retirements', index], message: 'Retirement records must be canonically sorted'});
      return;
    }
  }
});

export interface TranslationRecord {
  manual: string;
  sourcePath: string;
  targetPath: string;
  sourceCommit: string;
  sourceHash: string;
  targetHash: string;
  status: 'translated' | 'unchanged' | 'retired';
}

export interface ReferencePendingRecord {
  manual: string;
  sourcePath: string;
  targetPath: string;
  sourceCommit: string;
  sourceHash: string;
}

export interface ReferenceLanguageExcludedRecord {
  manual: string;
  sourcePath: string;
  targetPath: string;
  sourceCommit: string;
  sourceHash: string;
  locale: 'zh-CN';
  reason: 'x-include-langs';
}

export type ReferenceSourceRecord = z.infer<typeof SourceRecordSchema>;
export type ReferenceSourceManifest = z.infer<typeof ReferenceSourceManifestSchema>;
export type ReferenceTranslationManifest = Readonly<{
  schemaVersion: 1;
  bootstrapCompletedGroups?: readonly string[];
  records: readonly TranslationRecord[];
  pendingRecords?: readonly ReferencePendingRecord[];
  languageExcludedRecords?: readonly ReferenceLanguageExcludedRecord[];
}>;
export type ReferenceRetirementRecord = z.infer<typeof RetirementRecordSchema>;
export type ReferenceRetirementRegistry = z.infer<typeof ReferenceRetirementRegistrySchema>;
export type ReferenceTreeSnapshot = ReadonlyMap<string, string>;

export type BuildReferenceManifestOptions = Readonly<{
  repositoryRoot: string;
  sourceRoot: string;
  targetRoot: string;
  sourceCommit: string;
  manualForPath: (repositoryRelativePath: string) => string;
  retirementRegistry?: ReferenceRetirementRegistry;
  previousSourceManifest?: ReferenceSourceManifest;
  previousTranslationManifest?: ReferenceTranslationManifest;
  sourceSnapshot?: ReferenceTreeSnapshot;
  targetSnapshot?: ReferenceTreeSnapshot;
}>;

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareRecords(
  left: {manual?: string; sourcePath?: string; targetPath?: string},
  right: {manual?: string; sourcePath?: string; targetPath?: string},
): number {
  return compareText(left.manual ?? '', right.manual ?? '')
    || compareText(left.sourcePath ?? '', right.sourcePath ?? '')
    || compareText(left.targetPath ?? '', right.targetPath ?? '');
}

/**
 * Reference path ownership families derived from the manual registry English
 * publications. Each reference manual contributes the path family that owns
 * every document below its English output directory (e.g. api/python for the
 * python manual, cli for the cli manual).
 */
const REFERENCE_MANUAL_FAMILIES = Object.freeze(
  publicationEntries(manualRegistry)
    .filter(entry => entry.manual.kind === 'reference' && entry.site === 'en')
    .flatMap(entry => {
      const referenceRoot = 'content/en/reference/';
      const relative = entry.publication.outputDir.slice(referenceRoot.length).split('/');
      const family = relative[0] === 'api' ? relative.slice(0, 2).join('/') : relative[0];
      return [{manual: entry.manual.id, prefix: family}];
    }),
);

function referenceManualForRelativePath(relativePath: string): string | undefined {
  return REFERENCE_MANUAL_FAMILIES
    .filter(candidate => relativePath === candidate.prefix || relativePath.startsWith(`${candidate.prefix}/`))
    .sort((left, right) => right.prefix.length - left.prefix.length)[0]?.manual;
}

export function assertSafeRepositoryPathChain(repositoryRoot: string, relativePath: string, label: string): string {
  assertSafeRepositoryRelativePath(relativePath, label);
  const repositoryReal = realpathSync(repositoryRoot);
  let current = repositoryRoot;
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment);
    if (!existsSync(current)) continue;
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`${label} must not use a symlink ancestor or final target: ${relativePath}`);
    const resolved = realpathSync(current);
    if (resolved !== repositoryReal && !resolved.startsWith(`${repositoryReal}${path.sep}`)) {
      throw new Error(`${label} escapes the repository root: ${relativePath}`);
    }
  }
  return resolveOwnedRepositoryPath(repositoryRoot, relativePath, label);
}

function readRegularFileNoFollow(absolutePath: string): Buffer {
  const noFollow = typeof constants.O_NOFOLLOW === 'number' ? constants.O_NOFOLLOW : 0;
  const descriptor = openSync(absolutePath, constants.O_RDONLY | noFollow);
  try {
    const stats = fstatSync(descriptor);
    if (!stats.isFile()) throw new Error(`Reference file must be regular: ${absolutePath}`);
    return readFileSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

export function unseededReferencePreservedSourcePaths(repositoryRoot: string): ReadonlySet<string> {
  const paths = new Set<string>();
  for (const {manual, site, publication} of publicationEntries(manualRegistry)) {
    if (manual.kind !== 'reference' || site !== 'en') continue;
    const preservedFiles = publication.preservedFiles;
    if (!preservedFiles || preservedFiles.length === 0) continue;
    // A manual whose canonical English sidebar has not been seeded yet (dev-owned,
    // produced by the fetch pipeline) keeps its preserved landing page on master but is
    // not yet part of the translation source tree — exclude it until it is first fetched.
    if (existsSync(path.join(repositoryRoot, publication.sidebarPath))) continue;
    for (const file of preservedFiles) paths.add(`${publication.outputDir}/${file}`);
  }
  return paths;
}

function repositoryFiles(repositoryRoot: string, relativeRoot: string): Map<string, string> {
  assertSafeRepositoryRelativePath(relativeRoot, 'Reference root');
  const absoluteRoot = assertSafeRepositoryPathChain(repositoryRoot, relativeRoot, 'Reference root');
  const rootStats = lstatSync(absoluteRoot);
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new Error(`Reference root must be a regular directory: ${relativeRoot}`);
  const excludedSourcePaths = unseededReferencePreservedSourcePaths(repositoryRoot);
  const files = new Map<string, string>();
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort((left, right) => compareText(left.name, right.name))) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Reference tree must not contain symlinks: ${absolutePath}`);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!entry.isFile()) throw new Error(`Reference tree contains a non-regular file: ${absolutePath}`);
      if (entry.name === '.gitkeep' || (directory === absoluteRoot && entry.name === 'content-manifest.json')) continue;
      const relativePath = path.relative(repositoryRoot, absolutePath).split(path.sep).join('/');
      if (excludedSourcePaths.has(relativePath)) continue;
      assertSafeRepositoryRelativePath(relativePath, 'Reference file');
      files.set(relativePath, sha256(readRegularFileNoFollow(absolutePath)));
    }
  };
  visit(absoluteRoot);
  return files;
}

function relativeToRoot(filePath: string, root: string): string {
  if (!filePath.startsWith(`${root}/`)) throw new Error(`Reference file must stay below ${root}: ${filePath}`);
  return filePath.slice(root.length + 1);
}

export function referenceLanguageExclusionReason(
  repositoryRoot: string,
  sourcePath: string,
  locale: 'zh-CN',
): 'x-include-langs' | undefined {
  if (!sourcePath.startsWith('content/en/reference/api/restful/') || !sourcePath.endsWith('.mdx')) return undefined;
  const absolutePath = assertSafeRepositoryPathChain(repositoryRoot, sourcePath, 'REST Reference source');
  const source = readRegularFileNoFollow(absolutePath).toString('utf8');
  const marker = 'export const specs = ';
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return undefined;
  const jsonStart = markerIndex + marker.length;
  const jsonEnd = source.indexOf('\nexport const endpoint', jsonStart);
  if (jsonEnd === -1) throw new Error(`REST Reference specs export is missing its endpoint boundary: ${sourcePath}`);
  let specs: unknown;
  try {
    specs = JSON.parse(source.slice(jsonStart, jsonEnd));
  } catch (error) {
    throw new Error(`REST Reference specs export is malformed JSON: ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) {
    throw new Error(`REST Reference specs export must be a JSON object: ${sourcePath}`);
  }
  const includeLangs = (specs as {'x-include-langs'?: unknown})['x-include-langs'];
  if (includeLangs === undefined) return undefined;
  if (!Array.isArray(includeLangs) || includeLangs.length === 0 || includeLangs.some(value => typeof value !== 'string')) {
    throw new Error(`REST Reference x-include-langs must be a non-empty string array: ${sourcePath}`);
  }
  return includeLangs.includes(locale) ? undefined : 'x-include-langs';
}

export function parseReferenceSourceManifest(value: unknown): ReferenceSourceManifest {
  return ReferenceSourceManifestSchema.parse(value);
}

export function parseReferenceTranslationManifest(value: unknown): ReferenceTranslationManifest {
  return ReferenceTranslationManifestSchema.parse(value) as unknown as ReferenceTranslationManifest;
}

export function parseReferenceRetirementRegistry(value: unknown): ReferenceRetirementRegistry {
  return ReferenceRetirementRegistrySchema.parse(value);
}

export function normalizeReferenceRetirementRegistry(options: Readonly<{
  registry: ReferenceRetirementRegistry;
  manual: string;
  sourcePaths: ReadonlySet<string>;
  targetPaths: ReadonlySet<string>;
}>): ReferenceRetirementRegistry {
  const retirements = options.registry.retirements.filter(record => (
    record.manual !== options.manual
    || (!options.sourcePaths.has(record.sourcePath) && options.targetPaths.has(record.targetPath))
  ));
  return parseReferenceRetirementRegistry({schemaVersion: 2, retirements: [...retirements].sort(compareRecords)});
}

export function serializeReferenceManifest(value: ReferenceSourceManifest | ReferenceTranslationManifest): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildReferenceManifests(options: BuildReferenceManifestOptions): Readonly<{
  sourceManifest: ReferenceSourceManifest;
  translationManifest: ReferenceTranslationManifest;
}> {
  const sourceCommit = z.string().regex(COMMIT_SHA).parse(options.sourceCommit);
  const sourceFiles = new Map(options.sourceSnapshot ?? repositoryFiles(options.repositoryRoot, options.sourceRoot));
  const targetFiles = new Map(options.targetSnapshot ?? repositoryFiles(options.repositoryRoot, options.targetRoot));
  const sourceManifest: ReferenceSourceManifest = {
    schemaVersion: 1,
    sourceCommit,
    records: [...sourceFiles].map(([sourcePath, sourceHash]) => ({
      manual: options.manualForPath(sourcePath),
      sourcePath,
      sourceHash,
    })).sort(compareRecords),
  };
  const sourceByRelative = new Map([...sourceFiles].map(([filePath, hash]) => [relativeToRoot(filePath, options.sourceRoot), {filePath, hash}]));
  const targetByRelative = new Map([...targetFiles].map(([filePath, hash]) => [relativeToRoot(filePath, options.targetRoot), {filePath, hash}]));
  const previousSourceManifest = options.previousSourceManifest
    ? parseReferenceSourceManifest(options.previousSourceManifest)
    : undefined;
  const previousTranslationManifest = options.previousTranslationManifest
    ? parseReferenceTranslationManifest(options.previousTranslationManifest)
    : undefined;
  const previousSourcePaths = new Set(previousSourceManifest?.records.map(record => record.sourcePath) ?? []);
  const previousBySource = new Map(previousTranslationManifest?.records.map(record => [record.sourcePath, record]) ?? []);
  const previousPendingBySource = new Map(previousTranslationManifest?.pendingRecords?.map(record => [record.sourcePath, record]) ?? []);
  const previousExcludedBySource = new Map(previousTranslationManifest?.languageExcludedRecords?.map(record => [record.sourcePath, record]) ?? []);
  const registeredRetirements = (options.retirementRegistry?.retirements ?? []).filter(record => (
    sourceFiles.has(record.sourcePath) !== targetFiles.has(record.targetPath)
  ));
  const retired = new Set(registeredRetirements.map(record => `${record.sourcePath}\0${record.targetPath}`));
  const relativePaths = new Set([...sourceByRelative.keys(), ...targetByRelative.keys()]);
  const records: TranslationRecord[] = [];
  const pendingRecords: ReferencePendingRecord[] = [];
  const languageExcludedRecords: ReferenceLanguageExcludedRecord[] = [];
  for (const relativePath of [...relativePaths].sort(compareText)) {
    const source = sourceByRelative.get(relativePath);
    const target = targetByRelative.get(relativePath);
    const sourcePath = source?.filePath ?? `${options.sourceRoot}/${relativePath}`;
    const targetPath = target?.filePath ?? `${options.targetRoot}/${relativePath}`;
    const previous = previousBySource.get(sourcePath);
    const previousPending = previousPendingBySource.get(sourcePath);
    const previousExcluded = previousExcludedBySource.get(sourcePath);
    const exclusionReason = source ? referenceLanguageExclusionReason(options.repositoryRoot, sourcePath, 'zh-CN') : undefined;
    if (source && exclusionReason) {
      if (target) throw new Error(`Language-excluded Reference target must be absent: ${targetPath}`);
      languageExcludedRecords.push({
        manual: options.manualForPath(sourcePath),
        sourcePath,
        targetPath,
        sourceCommit,
        sourceHash: source.hash,
        locale: 'zh-CN',
        reason: exclusionReason,
      });
      continue;
    }
    if (source && previousSourcePaths.has(sourcePath) && !previous && !previousPending && !previousExcluded) {
      throw new Error(`Historical Reference source is missing its translation record, pending record, or language-excluded record: ${sourcePath}`);
    }
    if ((!source || !target) && !retired.has(`${sourcePath}\0${targetPath}`)) {
      if (source && !target && !previous) {
        pendingRecords.push({
          manual: options.manualForPath(sourcePath),
          sourcePath,
          targetPath,
          sourceCommit,
          sourceHash: source.hash,
        });
        continue;
      }
      throw new Error(`Reference path requires an explicit retirement before generation: ${sourcePath} -> ${targetPath}`);
    }
    const manual = options.manualForPath(source?.filePath ?? target!.filePath);
    if (source && target && previous && (previous.status === 'translated' || previous.status === 'unchanged')) {
      if (previous.manual !== manual || previous.targetPath !== targetPath) {
        throw new Error(`Previous Reference translation record does not match the canonical mapping: ${sourcePath}`);
      }
      if (previous.targetHash !== target.hash) {
        throw new Error(`Reference target changed without an updated translation record: ${targetPath}`);
      }
      records.push(previous);
      continue;
    }
    records.push({
      manual,
      sourcePath,
      targetPath,
      sourceCommit,
      sourceHash: source?.hash ?? EMPTY_FILE_SHA256,
      targetHash: target?.hash ?? EMPTY_FILE_SHA256,
      status: source && target ? (source.hash === target.hash ? 'unchanged' : 'translated') : 'retired',
    });
  }
  records.sort(compareRecords);
  pendingRecords.sort(compareRecords);
  languageExcludedRecords.sort(compareRecords);
  return {
    sourceManifest: parseReferenceSourceManifest(sourceManifest),
    translationManifest: parseReferenceTranslationManifest({
      schemaVersion: 1,
      ...(previousTranslationManifest?.bootstrapCompletedGroups
        ? {bootstrapCompletedGroups: previousTranslationManifest.bootstrapCompletedGroups}
        : {}),
      records,
      pendingRecords,
      ...(languageExcludedRecords.length > 0 || previousTranslationManifest?.languageExcludedRecords
        ? {languageExcludedRecords}
        : {}),
    }),
  };
}

export function readReferenceTree(repositoryRoot: string, relativeRoot: string): ReadonlyMap<string, string> {
  return repositoryFiles(repositoryRoot, relativeRoot);
}

export function captureReferenceTree(repositoryRoot: string, relativeRoot: string): ReferenceTreeSnapshot {
  return repositoryFiles(repositoryRoot, relativeRoot);
}
