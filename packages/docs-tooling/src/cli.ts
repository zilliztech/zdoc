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
import {isolateZhCnGuidesSourceTools} from './publication/zhCnGuidesToolsIsolation.ts';
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
  type ReferenceTreeSnapshot,
} from './reference/translationManifest.ts';
import {deriveZhCnReferenceSidebarEntries} from './reference/sidebarDerivation.ts';
import {validateReferenceSource, validateReferenceTranslation} from './validation/translation.ts';
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
  resolveSourceCommit?: (revision: string) => string;
  verifySourceRevision?: (commit: string, sourceRoot: string) => void;
  manualForPath?: (repositoryRelativePath: string) => string;
  retirementRegistry?: ReferenceRetirementRegistry;
  write?: (message: string) => void;
}>;

const REFERENCE_SOURCE_ROOT = 'content/en/reference';
const REFERENCE_TARGET_ROOT = 'content/zh-CN/reference';
const REFERENCE_SOURCE_MANIFEST = 'generated/en/manifests/reference.json';
const REFERENCE_TRANSLATION_MANIFEST = 'generated/zh-CN/manifests/reference-translations.json';
const REFERENCE_RETIREMENT_REGISTRY = 'config/reference-retirements.json';

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

function defaultReferenceManualForPath(filePath: string): string {
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
    if (sourceSnapshot.has(record.sourcePath) === targetSnapshot.has(record.targetPath)) {
      throw new Error(`Reference retirement must have exactly one missing side: ${record.sourcePath} -> ${record.targetPath}`);
    }
  }
}

function assertRetirementsMatchManifest(registry: ReferenceRetirementRegistry, translationManifest: ReturnType<typeof parseReferenceTranslationManifest>): void {
  const expected = registry.retirements.map(record => `${record.manual}\0${record.sourcePath}\0${record.targetPath}`);
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
    const manifests = buildReferenceManifests({
      repositoryRoot,
      sourceRoot: REFERENCE_SOURCE_ROOT,
      targetRoot: REFERENCE_TARGET_ROOT,
      sourceCommit,
      manualForPath,
      retirementRegistry,
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
    });
    assertSnapshotsEqual(sourceSnapshot, captureReferenceTree(repositoryRoot, REFERENCE_SOURCE_ROOT), 'Reference source snapshot changed during generation');
    assertSnapshotsEqual(targetSnapshot, captureReferenceTree(repositoryRoot, REFERENCE_TARGET_ROOT), 'Reference target snapshot changed during generation');
    const retiredTargetIds = new Set(retirementRegistry.retirements
      .filter(record => !targetSnapshot.has(record.targetPath))
      .map(record => record.targetPath.slice(`${REFERENCE_TARGET_ROOT}/`.length).replace(/\.mdx?$/u, '')));
    const sidebarEntries = deriveZhCnReferenceSidebarEntries(repositoryRoot, retiredTargetIds);
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
    if (dependencies.verifySourceRevision) dependencies.verifySourceRevision(sourceManifest.sourceCommit, REFERENCE_SOURCE_ROOT);
    else verifyGitSourceRevision(repositoryRoot, sourceManifest.sourceCommit, REFERENCE_SOURCE_ROOT, sourceSnapshot);
    const manualForPath = dependencies.manualForPath ?? defaultReferenceManualForPath;
    validateReferenceSource({repositoryRoot, sourceRoot: REFERENCE_SOURCE_ROOT, sourceManifest, manualForPath});
    if (argv[2] === 'en') {
      // Source ownership, revision, and hashes were validated above.
    } else {
      const translationManifest = parseReferenceTranslationManifest(readJson(repositoryRoot, REFERENCE_TRANSLATION_MANIFEST));
      const targetSnapshot = captureReferenceTree(repositoryRoot, REFERENCE_TARGET_ROOT);
      const retirementRegistry = dependencies.retirementRegistry
        ?? parseReferenceRetirementRegistry(readJson(repositoryRoot, REFERENCE_RETIREMENT_REGISTRY));
      validateRetirementRegistry(retirementRegistry, sourceSnapshot, targetSnapshot, manualForPath);
      assertRetirementsMatchManifest(retirementRegistry, translationManifest);
      validateReferenceTranslation({
        repositoryRoot,
        sourceRoot: REFERENCE_SOURCE_ROOT,
        targetRoot: REFERENCE_TARGET_ROOT,
        sourceManifest,
        translationManifest,
        manualForPath,
      });
    }
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

function stagePreservedPublicationFiles(context: CommandContext): void {
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
    writeSecureAtomicFile(context.repositoryRoot, targetPath, readSecureFile(context.repositoryRoot, sourcePath, 'Preserved publication source'), 'Preserved staged publication file');
  }
}

function stageZhCnGuidesToolsTranslations(context: CommandContext, replace = false): void {
  if (context.request.site !== 'zh-CN' || context.request.manual !== 'guides') return;
  const target = path.join(publicationStagePaths(context).outputPath, 'tools');
  if (replace) removeSecureStageTree(context.repositoryRoot, target, 'Staged Chinese Guides Tools translations');
  const source = `${context.publication.outputDir}/tools`;
  if (!securePathExists(context.repositoryRoot, source, 'Chinese Guides Tools translations')) return;
  copySecureTree(
    context.repositoryRoot,
    source,
    context.repositoryRoot,
    target,
    'Chinese Guides Tools translations',
  );
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
    stageExistingSidebar(context);
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
      stageZhCnGuidesToolsTranslations(fetchContext);
    }
    if (dependencies.fetch) await dependencies.fetch(fetchContext);
    else await defaultFetch(fetchContext, dependencies.spawnSync ?? nodeSpawnSync, environment);
    if (publicationDiagnostics) {
      if (request.site === 'zh-CN' && request.manual === 'guides') {
        stageZhCnGuidesToolsTranslations(fetchContext, true);
        const staged = publicationStagePaths(fetchContext);
        isolateZhCnGuidesSourceTools({
          canonicalToolsRoot: path.join(repositoryRoot, 'content/en/guides/tutorials/tools'),
          stagedOutputRoot: staged.outputPath,
          stagedSidebarPath: staged.sidebarPath,
        });
      }
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
