import {createHash} from 'node:crypto';
import path from 'node:path';

import {z} from 'zod';

import {resolveSiteProfile} from '@zilliz/site-config';
import type {SourceEntry} from '../manuals/registry.ts';
import type {ManualPublication, ManualSource, SiteId} from '../manuals/schema.ts';
import {ownedTreeCommit} from './atomicReplace.ts';
import {
  ensureSecureDirectory,
  confirmSecureFileDurability,
  readSecureFile,
  resolveSecureRepositoryPath,
  securePathExists,
  writeSecureAtomicFile,
  writeSecureFencedImmutableFile,
} from './stageControl.ts';

export const PUBLICATION_DIAGNOSTICS_FILE = '.publication-diagnostics.json';
export const PUBLICATION_ANCHOR_ROOT = 'tmp/docs-tooling/.publication-anchors';

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
  preservedFiles: z.array(z.string().min(1)),
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

const PublicationAnchorSchema = z.object({
  schemaVersion: z.literal(1),
  createdBy: z.literal('@zilliz/docs-tooling'),
  site: z.enum(['en', 'zh-CN']),
  manual: z.string().min(1),
  stage: z.string().min(1),
  identitySha256: z.string().regex(SHA256),
  publicationIdentitySha256: z.string().regex(SHA256),
  sourceIdentitySha256: z.string().regex(SHA256),
  ownedTargets: z.array(z.string().min(1)).min(2),
  baselineCommit: z.string().regex(SHA256),
  diagnosticsManifestSha256: z.string().regex(SHA256),
  anchorSha256: z.string().regex(SHA256),
}).strict();

export type PublicationDiagnostics = Readonly<z.infer<typeof PublicationDiagnosticsSchema>>;
export type PublicationAnchor = Readonly<z.infer<typeof PublicationAnchorSchema>>;

type PublicationIdentityInput = Readonly<Omit<ManualPublication, 'preservedFiles' | 'retiredPaths'>> & Readonly<{
  preservedFiles?: readonly string[];
  retiredPaths?: readonly string[];
}>;

export type PublicationDiagnosticsIdentity = Readonly<{
  site: SiteId;
  manual: string;
  stage: string;
  publication: PublicationIdentityInput;
  sourceChain: readonly SourceEntry[];
}>;

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
    preservedFiles: [...(publication.preservedFiles ?? [])].sort((left, right) => left.localeCompare(right, 'en')),
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

function anchorIdentity(input: PublicationDiagnosticsIdentity) {
  const publication = publicationIdentity(input.publication);
  const source = sourceIdentity(input);
  const identity = {
    site: input.site,
    manual: input.manual,
    stage: input.stage,
    publicationIdentitySha256: publication.sha256,
    sourceIdentitySha256: source.sha256,
    ownedTargets: [...publicationOwnedTargets(input.site, input.publication)],
  };
  return {...identity, identitySha256: sha256(identity)};
}

export function publicationOwnedTargets(site: SiteId, publication: PublicationIdentityInput): readonly string[] {
  return Object.freeze([
    publication.outputDir,
    publication.sidebarPath,
    ...localizedRestTargets(site, publication).map(target => target.outputDir),
    ...(publication.retiredPaths ?? []).map(retiredPath => `content/${site}/${retiredPath}`),
  ].sort((left, right) => left.localeCompare(right, 'en')));
}

// The English REST manual is also generated for each docusaurus-i18n locale in the
// English site profile (currently ja-JP). Its output lands under
// `${translationRoot}/${locale}/docusaurus-plugin-content-docs-${contentId}/current/...`
// rather than `content/<site>/...`, so it is not derived from the publication path
// convention alone.
export function localizedRestTargets(site: SiteId, publication: PublicationIdentityInput): readonly Readonly<{lang: string; outputDir: string}>[] {
  if (site !== 'en') return Object.freeze([]);
  // Only the spec-generated REST manual (sidebar basename `restful`) is localized
  // from the English source; the SDK reference manuals are translated, not generated.
  if (!publication.sidebarPath.endsWith('/restful.sidebar.js')) return Object.freeze([]);
  const profile = resolveSiteProfile('en');
  const content = profile.content.find(entry => entry.sourcePath === publication.contentRoot);
  if (!content) return Object.freeze([]);
  const relativePath = path.relative(publication.contentRoot, publication.outputDir).split(path.sep).join('/');
  return Object.freeze(profile.localization.locales
    .filter(locale => locale.source === 'docusaurus-i18n')
    .map(locale => Object.freeze({
      lang: locale.id,
      outputDir: `${profile.localization.translationRoot}/${locale.id}/docusaurus-plugin-content-docs-${content.id}/current/${relativePath}`,
    })));
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

function createPublicationAnchor(
  input: PublicationDiagnosticsIdentity,
  diagnostics: PublicationDiagnostics,
): PublicationAnchor {
  const identity = anchorIdentity(input);
  const anchor = {
    schemaVersion: 1 as const,
    createdBy: '@zilliz/docs-tooling' as const,
    site: identity.site,
    manual: identity.manual,
    stage: identity.stage,
    identitySha256: identity.identitySha256,
    publicationIdentitySha256: identity.publicationIdentitySha256,
    sourceIdentitySha256: identity.sourceIdentitySha256,
    ownedTargets: identity.ownedTargets,
    baselineCommit: diagnostics.baselineCommit,
    diagnosticsManifestSha256: diagnostics.manifestSha256,
  };
  return deepFreeze({...anchor, anchorSha256: sha256(anchor)});
}

function assertSelfConsistentAnchor(anchor: z.infer<typeof PublicationAnchorSchema>): void {
  const {anchorSha256, ...contents} = anchor;
  if (sha256(contents) !== anchorSha256) throw new Error('Publication diagnostics trusted anchor checksum mismatch');
}

function resolveAnchorRoot(repositoryRootInput: string, create: boolean): string {
  if (create) return ensureSecureDirectory(repositoryRootInput, PUBLICATION_ANCHOR_ROOT, 'Publication diagnostics trusted anchor root');
  if (!securePathExists(repositoryRootInput, PUBLICATION_ANCHOR_ROOT, 'Publication diagnostics trusted anchor root')) {
    throw new Error(`Publication diagnostics trusted anchor root is missing: ${PUBLICATION_ANCHOR_ROOT}`);
  }
  resolveSecureRepositoryPath(repositoryRootInput, PUBLICATION_ANCHOR_ROOT, 'Publication diagnostics trusted anchor root', {finalKind: 'directory'});
  return ensureSecureDirectory(repositoryRootInput, PUBLICATION_ANCHOR_ROOT, 'Publication diagnostics trusted anchor root');
}

function anchorFileName(input: PublicationDiagnosticsIdentity, diagnosticsManifestSha256: string): string {
  if (!SHA256.test(diagnosticsManifestSha256)) throw new Error('Publication diagnostics trusted anchor manifest checksum is invalid');
  return `${anchorIdentity(input).identitySha256.slice('sha256:'.length)}-${diagnosticsManifestSha256.slice('sha256:'.length)}.json`;
}

export function publicationAnchorPath(repositoryRoot: string, input: PublicationDiagnosticsIdentity, diagnosticsManifestSha256: string): string {
  return path.join(resolveAnchorRoot(repositoryRoot, false), anchorFileName(input, diagnosticsManifestSha256));
}

function resolveStageRoot(repositoryRootInput: string, stageRootInput: string): string {
  return resolveSecureRepositoryPath(
    repositoryRootInput,
    stageRootInput,
    'Publication diagnostics stage',
    {finalKind: 'directory'},
  );
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
  return writeSecureAtomicFile(repositoryRoot, target, `${JSON.stringify(parsed, null, 2)}\n`, 'Publication diagnostics manifest');
}

export function writePublicationAnchor(
  repositoryRoot: string,
  expectedIdentity: PublicationDiagnosticsIdentity,
  diagnostics: PublicationDiagnostics,
  options: Readonly<{
    testing?: Readonly<{
      afterRename?: (target: string) => void;
      beforeRename?: (target: string) => void;
      beforeParentFsync?: (parent: string) => void;
    }>;
  }> = {},
): string {
  const parsedDiagnostics = PublicationDiagnosticsSchema.parse(diagnostics);
  assertSelfConsistentDiagnostics(parsedDiagnostics);
  const expectedDiagnostics = createPublicationDiagnostics(expectedIdentity, parsedDiagnostics.baselineCommit);
  if (canonicalJson(parsedDiagnostics) !== canonicalJson(expectedDiagnostics)) {
    throw new Error('Publication diagnostics cannot be anchored because their identity does not match the selected publication');
  }
  const anchor = PublicationAnchorSchema.parse(createPublicationAnchor(expectedIdentity, parsedDiagnostics));
  assertSelfConsistentAnchor(anchor);
  const anchorRoot = resolveAnchorRoot(repositoryRoot, true);
  const target = path.join(anchorRoot, anchorFileName(expectedIdentity, parsedDiagnostics.manifestSha256));
  const serialized = `${JSON.stringify(anchor, null, 2)}\n`;
  if (securePathExists(repositoryRoot, target, 'Publication diagnostics trusted anchor')) {
    if (readSecureFile(repositoryRoot, target, 'Publication diagnostics trusted anchor').toString('utf8') !== serialized) {
      throw new Error('Publication diagnostics trusted anchor generation already exists with different bytes');
    }
    confirmSecureFileDurability(repositoryRoot, target, 'Publication diagnostics trusted anchor', options.testing);
    return target;
  }
  try {
    return writeSecureFencedImmutableFile(repositoryRoot, target, serialized, 'Publication diagnostics trusted anchor', 0o600, options);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST'
      && securePathExists(repositoryRoot, target, 'Publication diagnostics trusted anchor')
      && readSecureFile(repositoryRoot, target, 'Publication diagnostics trusted anchor').toString('utf8') === serialized) {
      confirmSecureFileDurability(repositoryRoot, target, 'Publication diagnostics trusted anchor', options.testing);
      return target;
    }
    throw error;
  }
}

function readDiagnosticsFile(repositoryRoot: string, stageRootInput: string): unknown {
  const stageRoot = resolveStageRoot(repositoryRoot, stageRootInput);
  const target = path.join(stageRoot, PUBLICATION_DIAGNOSTICS_FILE);
  if (!securePathExists(repositoryRoot, target, 'Publication diagnostics manifest')) throw new Error(`Publication diagnostics manifest is missing: ${target}`);
  try {
    const contents = readSecureFile(repositoryRoot, target, 'Publication diagnostics manifest');
    if (contents.byteLength > 1024 * 1024) throw new Error('Publication diagnostics manifest exceeds the size limit');
    return JSON.parse(contents.toString('utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error('Publication diagnostics manifest is not valid JSON', {cause: error});
    throw error;
  }
}

function readAnchorFile(repositoryRoot: string, expectedIdentity: PublicationDiagnosticsIdentity, diagnosticsManifestSha256: string): unknown {
  const target = publicationAnchorPath(repositoryRoot, expectedIdentity, diagnosticsManifestSha256);
  if (!securePathExists(repositoryRoot, target, 'Publication diagnostics trusted anchor')) throw new Error(`Publication diagnostics trusted anchor is missing: ${target}`);
  const contents = readSecureFile(repositoryRoot, target, 'Publication diagnostics trusted anchor');
  if (contents.byteLength > 1024 * 1024) throw new Error('Publication diagnostics trusted anchor exceeds the size limit');
  try {
    return JSON.parse(contents.toString('utf8'));
  } catch (error) {
    throw new Error('Publication diagnostics trusted anchor is not valid JSON', {cause: error});
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
  const anchor = PublicationAnchorSchema.safeParse(readAnchorFile(repositoryRoot, expectedIdentity, parsed.data.manifestSha256));
  if (!anchor.success) throw new Error(`Publication diagnostics trusted anchor schema validation failed: ${anchor.error.message}`);
  assertSelfConsistentAnchor(anchor.data);
  const expectedAnchor = createPublicationAnchor(expectedIdentity, parsed.data);
  if (canonicalJson(anchor.data) !== canonicalJson(expectedAnchor)) {
    throw new Error('Publication diagnostics manifest does not match its trusted external anchor');
  }
  return deepFreeze(parsed.data);
}
