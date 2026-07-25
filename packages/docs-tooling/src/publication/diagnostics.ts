import {createHash, randomUUID} from 'node:crypto';
import {
  constants,
  closeSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import {z} from 'zod';

import type {SourceEntry} from '../manuals/registry.ts';
import type {ManualPublication, ManualSource, SiteId} from '../manuals/schema.ts';
import {ownedTreeCommit} from './atomicReplace.ts';

export const PUBLICATION_DIAGNOSTICS_FILE = '.publication-diagnostics.json';

const SHA256 = /^sha256:[0-9a-f]{64}$/u;
const NullableString = z.string().nullable();

const SourceIdentityEntrySchema = z.object({
  key: z.string().min(1),
  sourceType: z.enum(['wiki', 'drive', 'onePager', 'rest', 'local']),
  lifecycle: z.enum(['active', 'fallback', 'retired', 'translation']),
  root: NullableString,
  base: NullableString,
  version: NullableString,
  generatorManual: NullableString,
  snapshotPath: NullableString,
  sourceDir: z.string().min(1),
  fallbackSource: NullableString,
}).strict();

const PublicationIdentitySchema = z.object({
  source: z.string().min(1),
  generatorTarget: z.enum(['zilliz', 'zilliz.saas', 'zilliz.paas']),
  outputDir: z.string().min(1),
  contentRoot: z.string().min(1),
  sidebarPath: z.string().min(1),
  overridePath: NullableString,
  missingContent: z.enum(['error', 'explicitly-disabled']),
  retiredPaths: z.array(z.string().min(1)),
  sha256: z.string().regex(SHA256),
}).strict();

const SourceIdentitySchema = z.object({
  publicationSource: z.string().min(1),
  chain: z.array(SourceIdentityEntrySchema).min(1),
  sha256: z.string().regex(SHA256),
}).strict();

const PublicationDiagnosticsSchema = z.object({
  schemaVersion: z.literal(1),
  createdBy: z.literal('@zilliz/docs-tooling'),
  site: z.enum(['en', 'zh-CN']),
  manual: z.string().min(1),
  stage: z.string().min(1),
  publicationIdentity: PublicationIdentitySchema,
  ownedTargets: z.array(z.string().min(1)).min(2),
  baselineCommit: z.string().regex(SHA256),
  sourceIdentity: SourceIdentitySchema,
  manifestSha256: z.string().regex(SHA256),
}).strict();

export type PublicationDiagnostics = Readonly<z.infer<typeof PublicationDiagnosticsSchema>>;

type PublicationIdentityInput = Readonly<Omit<ManualPublication, 'retiredPaths'>> & Readonly<{
  retiredPaths?: readonly string[];
}>;

export type PublicationDiagnosticsIdentity = Readonly<{
  site: SiteId;
  manual: string;
  stage: string;
  publication: PublicationIdentityInput;
  sourceChain: readonly SourceEntry[];
}>;

function pathEntryExists(target: string): boolean {
  try {
    lstatSync(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

function sourceIdentityEntry(entry: SourceEntry): z.infer<typeof SourceIdentityEntrySchema> {
  const source = entry.source as ManualSource;
  return {
    key: entry.key,
    sourceType: source.sourceType,
    lifecycle: source.lifecycle,
    root: source.root ?? null,
    base: source.base ?? null,
    version: source.version ?? null,
    generatorManual: source.generatorManual ?? null,
    snapshotPath: source.snapshotPath ?? null,
    sourceDir: source.sourceDir,
    fallbackSource: source.fallbackSource ?? null,
  };
}

function publicationIdentity(publication: PublicationIdentityInput): z.infer<typeof PublicationIdentitySchema> {
  const identity = {
    source: publication.source,
    generatorTarget: publication.generatorTarget,
    outputDir: publication.outputDir,
    contentRoot: publication.contentRoot,
    sidebarPath: publication.sidebarPath,
    overridePath: publication.overridePath ?? null,
    missingContent: publication.missingContent,
    retiredPaths: [...(publication.retiredPaths ?? [])].sort((left, right) => left.localeCompare(right, 'en')),
  };
  return {...identity, sha256: sha256(identity)};
}

function sourceIdentity(input: PublicationDiagnosticsIdentity): z.infer<typeof SourceIdentitySchema> {
  const identity = {
    publicationSource: input.publication.source,
    chain: input.sourceChain.map(sourceIdentityEntry),
  };
  return {...identity, sha256: sha256(identity)};
}

export function publicationOwnedTargets(site: SiteId, publication: PublicationIdentityInput): readonly string[] {
  return Object.freeze([
    publication.outputDir,
    publication.sidebarPath,
    ...(publication.retiredPaths ?? []).map(retiredPath => `content/${site}/${retiredPath}`),
  ].sort((left, right) => left.localeCompare(right, 'en')));
}

export function createPublicationDiagnostics(
  input: PublicationDiagnosticsIdentity,
  baselineCommit: string,
): PublicationDiagnostics {
  if (!SHA256.test(baselineCommit)) throw new Error('Publication diagnostics baselineCommit must be a sha256 owned-tree commit');
  const manifest = {
    schemaVersion: 1 as const,
    createdBy: '@zilliz/docs-tooling' as const,
    site: input.site,
    manual: input.manual,
    stage: input.stage,
    publicationIdentity: publicationIdentity(input.publication),
    ownedTargets: [...publicationOwnedTargets(input.site, input.publication)],
    baselineCommit,
    sourceIdentity: sourceIdentity(input),
  };
  return deepFreeze({...manifest, manifestSha256: sha256(manifest)});
}

export function capturePublicationDiagnostics(
  repositoryRoot: string,
  input: PublicationDiagnosticsIdentity,
): PublicationDiagnostics {
  const ownedTargets = publicationOwnedTargets(input.site, input.publication);
  return createPublicationDiagnostics(input, ownedTreeCommit(repositoryRoot, ownedTargets));
}

function assertSelfConsistentDiagnostics(diagnostics: z.infer<typeof PublicationDiagnosticsSchema>): void {
  const {sha256: publicationSha256, ...publication} = diagnostics.publicationIdentity;
  if (sha256(publication) !== publicationSha256) throw new Error('Publication diagnostics publication identity checksum mismatch');
  const {sha256: sourceSha256, ...source} = diagnostics.sourceIdentity;
  if (sha256(source) !== sourceSha256) throw new Error('Publication diagnostics source identity checksum mismatch');
  const {manifestSha256, ...manifest} = diagnostics;
  if (sha256(manifest) !== manifestSha256) throw new Error('Publication diagnostics manifest checksum mismatch');
}

function resolveStageRoot(repositoryRootInput: string, stageRootInput: string): string {
  const repositoryInput = path.resolve(repositoryRootInput);
  const stageInput = path.resolve(stageRootInput);
  const relative = path.relative(repositoryInput, stageInput);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Publication diagnostics stage must stay below the repository root');
  const repositoryStats = lstatSync(repositoryInput);
  if (repositoryStats.isSymbolicLink() || !repositoryStats.isDirectory()) throw new Error('Publication diagnostics repository root must be a non-symlink directory');
  const repositoryRoot = realpathSync(repositoryInput);
  let current = repositoryInput;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (!pathEntryExists(current)) throw new Error(`Publication diagnostics stage is missing: ${stageRootInput}`);
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`Publication diagnostics stage has a symlink ancestor: ${current}`);
    if (!stats.isDirectory()) throw new Error(`Publication diagnostics stage ancestor must be a directory: ${current}`);
  }
  const stageRoot = realpathSync(stageInput);
  if (!stageRoot.startsWith(`${repositoryRoot}${path.sep}`)) throw new Error('Publication diagnostics stage escapes the repository root');
  return stageRoot;
}

function fsyncDirectory(directory: string): void {
  const descriptor = openSync(directory, 'r');
  try {
    fsyncSync(descriptor);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'EINVAL' && code !== 'EBADF' && code !== 'EISDIR') throw error;
  } finally {
    closeSync(descriptor);
  }
}

export function writePublicationDiagnostics(
  repositoryRoot: string,
  stageRootInput: string,
  diagnostics: PublicationDiagnostics,
): string {
  const parsed = PublicationDiagnosticsSchema.parse(diagnostics);
  assertSelfConsistentDiagnostics(parsed);
  const stageRoot = resolveStageRoot(repositoryRoot, stageRootInput);
  const target = path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE);
  if (pathEntryExists(target)) throw new Error(`Publication diagnostics manifest already exists: ${target}`);
  const temporary = path.join(stageRoot, `.${PUBLICATION_DIAGNOSTICS_FILE}.tmp-${process.pid}-${randomUUID()}`);
  const descriptor = openSync(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
  try {
    writeFileSync(descriptor, `${JSON.stringify(parsed, null, 2)}\n`);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  try {
    linkSync(temporary, target);
    unlinkSync(temporary);
    fsyncDirectory(stageRoot);
  } catch (error) {
    if (pathEntryExists(temporary)) unlinkSync(temporary);
    throw error;
  }
  return target;
}

function readDiagnosticsFile(repositoryRoot: string, stageRootInput: string): unknown {
  const stageRoot = resolveStageRoot(repositoryRoot, stageRootInput);
  const target = path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE);
  if (!pathEntryExists(target)) throw new Error(`Publication diagnostics manifest is missing: ${target}`);
  const before = lstatSync(target);
  if (before.isSymbolicLink() || !before.isFile()) throw new Error('Publication diagnostics manifest must be a regular non-symlink file');
  if (before.nlink !== 1) throw new Error('Publication diagnostics manifest must not be hard-linked');
  if (before.size > 1024 * 1024) throw new Error('Publication diagnostics manifest exceeds the size limit');
  const descriptor = openSync(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor);
    if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error('Publication diagnostics manifest identity changed while opening');
    }
    const text = readFileSync(descriptor, 'utf8');
    const after = lstatSync(target);
    if (after.dev !== opened.dev || after.ino !== opened.ino || after.size !== opened.size) {
      throw new Error('Publication diagnostics manifest identity changed while reading');
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('Publication diagnostics manifest is not valid JSON', {cause: error});
    }
  } finally {
    closeSync(descriptor);
  }
}

export function readAndValidatePublicationDiagnostics(
  repositoryRoot: string,
  stageRoot: string,
  expectedIdentity: PublicationDiagnosticsIdentity,
): PublicationDiagnostics {
  const parsed = PublicationDiagnosticsSchema.safeParse(readDiagnosticsFile(repositoryRoot, stageRoot));
  if (!parsed.success) throw new Error(`Publication diagnostics manifest schema validation failed: ${parsed.error.message}`);
  assertSelfConsistentDiagnostics(parsed.data);
  const expected = createPublicationDiagnostics(expectedIdentity, parsed.data.baselineCommit);
  if (canonicalJson(parsed.data) !== canonicalJson(expected)) {
    throw new Error('Publication diagnostics manifest does not match the selected site, manual, stage, publication, or source identity');
  }
  return deepFreeze(parsed.data);
}
