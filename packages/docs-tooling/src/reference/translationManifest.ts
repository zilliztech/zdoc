import {createHash} from 'node:crypto';
import {lstatSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

import {z} from 'zod';

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
  records: z.array(TranslationRecordSchema),
}).strict().superRefine((manifest, context) => {
  for (let index = 1; index < manifest.records.length; index += 1) {
    if (compareRecords(manifest.records[index - 1], manifest.records[index]) > 0) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['records', index], message: 'Translation manifest records must be canonically sorted by manual, sourcePath, and targetPath'});
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

export type ReferenceSourceRecord = z.infer<typeof SourceRecordSchema>;
export type ReferenceSourceManifest = z.infer<typeof ReferenceSourceManifestSchema>;
export type ReferenceTranslationManifest = Readonly<{
  schemaVersion: 1;
  records: readonly TranslationRecord[];
}>;

export type BuildReferenceManifestOptions = Readonly<{
  repositoryRoot: string;
  sourceRoot: string;
  targetRoot: string;
  sourceCommit: string;
  manualForPath: (repositoryRelativePath: string) => string;
  retiredRecords?: readonly TranslationRecord[];
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

function repositoryFiles(repositoryRoot: string, relativeRoot: string): Map<string, string> {
  assertSafeRepositoryRelativePath(relativeRoot, 'Reference root');
  const absoluteRoot = resolveOwnedRepositoryPath(repositoryRoot, relativeRoot, 'Reference root');
  const rootStats = lstatSync(absoluteRoot);
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new Error(`Reference root must be a regular directory: ${relativeRoot}`);
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
      assertSafeRepositoryRelativePath(relativePath, 'Reference file');
      files.set(relativePath, sha256(readFileSync(absolutePath)));
    }
  };
  visit(absoluteRoot);
  return files;
}

function relativeToRoot(filePath: string, root: string): string {
  if (!filePath.startsWith(`${root}/`)) throw new Error(`Reference file must stay below ${root}: ${filePath}`);
  return filePath.slice(root.length + 1);
}

export function parseReferenceSourceManifest(value: unknown): ReferenceSourceManifest {
  return ReferenceSourceManifestSchema.parse(value);
}

export function parseReferenceTranslationManifest(value: unknown): ReferenceTranslationManifest {
  return ReferenceTranslationManifestSchema.parse(value) as unknown as ReferenceTranslationManifest;
}

export function serializeReferenceManifest(value: ReferenceSourceManifest | ReferenceTranslationManifest): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildReferenceManifests(options: BuildReferenceManifestOptions): Readonly<{
  sourceManifest: ReferenceSourceManifest;
  translationManifest: ReferenceTranslationManifest;
}> {
  const sourceCommit = z.string().regex(COMMIT_SHA).parse(options.sourceCommit);
  const sourceFiles = repositoryFiles(options.repositoryRoot, options.sourceRoot);
  const targetFiles = repositoryFiles(options.repositoryRoot, options.targetRoot);
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
  const retired = new Set((options.retiredRecords ?? [])
    .filter(record => record.status === 'retired')
    .map(record => `${record.sourcePath}\0${record.targetPath}`));
  for (const record of options.retiredRecords ?? []) {
    if (record.status === 'retired' && !sourceFiles.has(record.sourcePath) && !targetFiles.has(record.targetPath)) {
      throw new Error(`Registered retirement lost its remaining file; both sides are missing: ${record.sourcePath} -> ${record.targetPath}`);
    }
  }
  const relativePaths = new Set([...sourceByRelative.keys(), ...targetByRelative.keys()]);
  const records: TranslationRecord[] = [];
  for (const relativePath of [...relativePaths].sort(compareText)) {
    const source = sourceByRelative.get(relativePath);
    const target = targetByRelative.get(relativePath);
    const sourcePath = source?.filePath ?? `${options.sourceRoot}/${relativePath}`;
    const targetPath = target?.filePath ?? `${options.targetRoot}/${relativePath}`;
    if ((!source || !target) && !retired.has(`${sourcePath}\0${targetPath}`)) {
      throw new Error(`Reference path requires an explicit retirement before generation: ${sourcePath} -> ${targetPath}`);
    }
    const manual = options.manualForPath(source?.filePath ?? target!.filePath);
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
  return {
    sourceManifest: parseReferenceSourceManifest(sourceManifest),
    translationManifest: parseReferenceTranslationManifest({schemaVersion: 1, records}),
  };
}

export function readReferenceTree(repositoryRoot: string, relativeRoot: string): ReadonlyMap<string, string> {
  return repositoryFiles(repositoryRoot, relativeRoot);
}
