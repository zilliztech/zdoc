import {createHash} from 'node:crypto';
import {existsSync, lstatSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';

import {
  publicationStagePaths,
  withDocsToolingGroupFence,
  type AlreadyFencedDocsToolingExecutor,
  type CliDependencies,
  type CommandContext,
} from '../cli.ts';
import {resolveManualPublication} from '../manuals/registry.ts';
import type {SiteId} from '../manuals/schema.ts';
import {atomicReplace, ownedTreeCommit, type AtomicReplaceOptions} from '../publication/atomicReplace.ts';
import {publicationOwnedTargets} from '../publication/diagnostics.ts';
import {
  captureSecureInventory,
  copySecureTree,
  ensureSecureDirectory,
  readSecureFile,
  removeSecureStageTree,
  resolveSecureRepositoryPath,
  writeSecureAtomicFile,
  type SecureInventoryEntry,
} from '../publication/stageControl.ts';
import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {validateStageFilesystem} from '../validation/filesystem.ts';
import {
  type PublicationGroup,
  type PublicationGroupStage,
  resolvePublicationGroupWorkflow,
} from './groups.ts';

const GROUP_DIAGNOSTICS_FILE = '.docs-tooling-publication-group.json';
const VALIDATED_STAGE_ATTESTATION_FILE = '.docs-tooling-validated-stage.json';

type PublishGroupRequest = Readonly<{
  site: SiteId;
  group: string;
  stage: PublicationGroupStage;
}>;

export type PublicationGroupDependencies = CliDependencies & Readonly<{
  testing?: Readonly<{
    beforeManual?: (argv: readonly string[], dependencies: CliDependencies) => void | Promise<void>;
  }>;
}>;

export type PublicationGroupResult = Readonly<{
  request: PublishGroupRequest;
  manuals: readonly string[];
  stages: readonly string[];
  ownedPaths: readonly string[];
  sourceSnapshots: readonly string[];
}>;

type SourcePublicationManifest = Readonly<{
  schemaVersion: 1;
  site: 'zh-CN';
  group: 'guides';
  files: readonly string[];
}>;

type InventoryEntry = Readonly<{path: string; sha256: string}>;
type PublicationGroupDiagnostics = Readonly<{
  schemaVersion: 1;
  site: SiteId;
  group: string;
  inventory: readonly InventoryEntry[];
}>;
type ValidatedStageIdentity = Readonly<{manual: string; stage: string}>;
type ValidatedStageAttestation = Readonly<{
  schemaVersion: 1;
  kind: 'validated-stage';
  site: SiteId;
  group: string;
  stages: readonly ValidatedStageIdentity[];
  inventory: readonly SecureInventoryEntry[];
  checksum: string;
}>;

const USAGE = 'Usage: docs-tooling publish-group --site <en|zh-CN> --group <name> --stage <fetch|validate|publish>';

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function frozenHookCopy<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(entry => frozenHookCopy(entry))) as T;
  }
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) {
      const copy = Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, frozenHookCopy(entry)]),
      );
      return Object.freeze(copy) as T;
    }
  }
  return value;
}

function pathOverlaps(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function protectedPath(group: PublicationGroup, candidate: string): string | undefined {
  return group.protectedPaths?.find(protectedTarget => pathOverlaps(candidate, protectedTarget));
}

function protectedInventoryPath(group: PublicationGroup, candidate: string): string | undefined {
  return group.protectedPaths?.find(protectedTarget => (
    candidate === protectedTarget || candidate.startsWith(`${protectedTarget}/`)
  ));
}

function assertManifestFilePath(group: PublicationGroup, value: string): string {
  assertSafeRepositoryRelativePath(value, 'Source publication manifest file');
  const collision = protectedPath(group, value);
  if (collision) throw new Error(`Chinese Guides source publication cannot claim protected Tools path ${collision}: ${value}`);
  if (value === group.publicationManifest) throw new Error('Source publication manifest must not claim itself as a content file');
  const allowed = group.manuals.some(manual => {
    const publication = resolveManualPublication(manual, group.site).publication;
    return value === publication.sidebarPath || value.startsWith(`${publication.contentRoot}/`);
  });
  if (!allowed) throw new Error(`Source publication manifest file is outside Chinese Guides ownership: ${value}`);
  return value;
}

export function serializeSourcePublicationManifest(files: readonly string[]): string {
  const group = resolvePublicationGroupWorkflow('zh-CN', 'guides').group;
  const normalized = files.map(file => assertManifestFilePath(group, file));
  if (new Set(normalized).size !== normalized.length) throw new Error('Source publication manifest files must be unique');
  const manifest: SourcePublicationManifest = {
    schemaVersion: 1,
    site: 'zh-CN',
    group: 'guides',
    files: [...normalized].sort((left, right) => left.localeCompare(right, 'en')),
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function parseSourcePublicationManifest(contents: string, group: PublicationGroup): SourcePublicationManifest {
  let input: unknown;
  try {
    input = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Chinese Guides source publication manifest is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Chinese Guides source publication manifest must be an object');
  const value = input as Record<string, unknown>;
  const keys = Object.keys(value);
  if (keys.length !== 4 || keys.some(key => !['schemaVersion', 'site', 'group', 'files'].includes(key))) {
    throw new Error('Chinese Guides source publication manifest must contain exactly schemaVersion, site, group, and files');
  }
  if (value.schemaVersion !== 1 || value.site !== 'zh-CN' || value.group !== 'guides' || !Array.isArray(value.files)) {
    throw new Error('Chinese Guides source publication manifest identity is invalid');
  }
  const files = value.files.map(file => {
    if (typeof file !== 'string') throw new Error('Chinese Guides source publication manifest files must be strings');
    return assertManifestFilePath(group, file);
  });
  const sorted = [...files].sort((left, right) => left.localeCompare(right, 'en'));
  if (new Set(files).size !== files.length || files.some((file, index) => file !== sorted[index])) {
    throw new Error('Chinese Guides source publication manifest files must be unique and sorted');
  }
  return deepFreeze({schemaVersion: 1, site: 'zh-CN', group: 'guides', files});
}

export function publicationGroupStagePath(site: SiteId, group: string): string {
  return `tmp/docs-tooling/${site}/groups/${group}`;
}

function manualStagePath(site: SiteId, manual: string): string {
  return `tmp/docs-tooling/${site}/${manual}`;
}

function sha256(contents: Buffer | string): string {
  return createHash('sha256').update(contents).digest('hex');
}

function validatedStageAttestationPath(site: SiteId, group: string): string {
  return `${publicationGroupStagePath(site, group)}/${VALIDATED_STAGE_ATTESTATION_FILE}`;
}

function validatedStageIdentity(group: PublicationGroup): readonly ValidatedStageIdentity[] {
  return Object.freeze(group.manuals.map(manual => Object.freeze({
    manual,
    stage: manualStagePath(group.site, manual),
  })));
}

function validatedStageInventoryRoots(group: PublicationGroup, groupName: string): readonly string[] {
  return Object.freeze([
    ...group.manuals.map(manual => manualStagePath(group.site, manual)),
    publicationGroupStagePath(group.site, groupName),
  ]);
}

function canonicalAttestationBody(value: Omit<ValidatedStageAttestation, 'checksum'>): string {
  return JSON.stringify(value);
}

function createValidatedStageAttestation(
  repositoryRoot: string,
  group: PublicationGroup,
  groupName: string,
): ValidatedStageAttestation {
  const attestationPath = validatedStageAttestationPath(group.site, groupName);
  const body = {
    schemaVersion: 1 as const,
    kind: 'validated-stage' as const,
    site: group.site,
    group: groupName,
    stages: validatedStageIdentity(group),
    inventory: captureSecureInventory(
      repositoryRoot,
      validatedStageInventoryRoots(group, groupName),
      'Validated publication stage inventory',
      {exclude: [attestationPath]},
    ),
  };
  return deepFreeze({...body, checksum: sha256(canonicalAttestationBody(body))});
}

function writeValidatedStageAttestation(repositoryRoot: string, group: PublicationGroup, groupName: string): void {
  ensureSecureDirectory(repositoryRoot, publicationGroupStagePath(group.site, groupName), 'Publication group stage');
  const attestation = createValidatedStageAttestation(repositoryRoot, group, groupName);
  writeSecureAtomicFile(
    repositoryRoot,
    validatedStageAttestationPath(group.site, groupName),
    `${JSON.stringify(attestation, null, 2)}\n`,
    'Validated publication stage attestation',
    {replace: true},
  );
}

function parseValidatedStageAttestation(
  contents: string,
  group: PublicationGroup,
  groupName: string,
): ValidatedStageAttestation {
  let input: unknown;
  try {
    input = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Validated publication stage attestation is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Validated publication stage attestation must be an object');
  }
  const value = input as Record<string, unknown>;
  const keys = Object.keys(value);
  if (keys.length !== 7 || keys.some(key => !['schemaVersion', 'kind', 'site', 'group', 'stages', 'inventory', 'checksum'].includes(key))) {
    throw new Error('Validated publication stage attestation schema is invalid');
  }
  if (value.schemaVersion !== 1 || value.kind !== 'validated-stage' || value.site !== group.site || value.group !== groupName
    || !Array.isArray(value.stages) || !Array.isArray(value.inventory) || typeof value.checksum !== 'string') {
    throw new Error('Validated publication stage attestation identity is invalid');
  }
  const stages = value.stages.map(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Validated publication stage identity is invalid');
    const record = entry as Record<string, unknown>;
    if (Object.keys(record).length !== 2 || typeof record.manual !== 'string' || typeof record.stage !== 'string') {
      throw new Error('Validated publication stage identity is invalid');
    }
    assertSafeRepositoryRelativePath(record.stage, 'Validated publication stage path');
    return {manual: record.manual, stage: record.stage};
  });
  const expectedStages = validatedStageIdentity(group);
  if (JSON.stringify(stages) !== JSON.stringify(expectedStages)) {
    throw new Error('Validated publication stage attestation request identity does not match this site, group, manual, and stage');
  }
  const inventory = value.inventory.map(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Validated publication stage inventory entry is invalid');
    const record = entry as Record<string, unknown>;
    if (Object.keys(record).length !== 3 || typeof record.path !== 'string' || typeof record.size !== 'number'
      || !Number.isSafeInteger(record.size) || record.size < 0 || typeof record.sha256 !== 'string' || !/^[0-9a-f]{64}$/u.test(record.sha256)) {
      throw new Error('Validated publication stage inventory entry is invalid');
    }
    assertSafeRepositoryRelativePath(record.path, 'Validated publication stage inventory path');
    return {path: record.path, size: record.size, sha256: record.sha256};
  });
  const sorted = [...inventory].sort((left, right) => left.path.localeCompare(right.path, 'en'));
  if (new Set(inventory.map(entry => entry.path)).size !== inventory.length || JSON.stringify(inventory) !== JSON.stringify(sorted)) {
    throw new Error('Validated publication stage inventory must be unique and sorted');
  }
  const body = {
    schemaVersion: 1 as const,
    kind: 'validated-stage' as const,
    site: group.site,
    group: groupName,
    stages,
    inventory,
  };
  const expectedChecksum = sha256(canonicalAttestationBody(body));
  if (value.checksum !== expectedChecksum) throw new Error('Validated publication stage attestation checksum is invalid');
  return deepFreeze({...body, checksum: value.checksum});
}

function assertValidatedStageAttestation(repositoryRoot: string, group: PublicationGroup, groupName: string): void {
  const relative = validatedStageAttestationPath(group.site, groupName);
  const target = resolveSecureRepositoryPath(repositoryRoot, relative, 'Validated publication stage attestation', {allowMissing: true});
  if (!existsSync(target)) throw new Error(`Validated publication stage attestation is missing: ${relative}`);
  const attestation = parseValidatedStageAttestation(
    readSecureFile(repositoryRoot, relative, 'Validated publication stage attestation').toString('utf8'),
    group,
    groupName,
  );
  const current = captureSecureInventory(
    repositoryRoot,
    validatedStageInventoryRoots(group, groupName),
    'Validated publication stage inventory',
    {exclude: [relative]},
  );
  if (JSON.stringify(current) !== JSON.stringify(attestation.inventory)) {
    throw new Error(`Validated ${group.site}/${groupName} publication stage changed after validate`);
  }
}

function inventoryFiles(repositoryRoot: string, relativePath: string, group: PublicationGroup): InventoryEntry[] {
  if (protectedInventoryPath(group, relativePath)) return [];
  const target = resolveOwnedRepositoryPath(repositoryRoot, relativePath, 'Publication group inventory path');
  if (!existsSync(target)) return [];
  const stats = lstatSync(target);
  if (stats.isSymbolicLink()) throw new Error(`Publication group inventory must not contain symlinks: ${relativePath}`);
  if (stats.isFile()) return [{path: relativePath, sha256: sha256(readFileSync(target))}];
  if (!stats.isDirectory()) throw new Error(`Publication group inventory supports only files and directories: ${relativePath}`);
  return readdirSync(target, {withFileTypes: true})
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
    .flatMap(entry => inventoryFiles(repositoryRoot, `${relativePath}/${entry.name}`, group));
}

function captureGroupInventory(repositoryRoot: string, group: PublicationGroup): readonly InventoryEntry[] {
  const roots = [...group.ownedPaths, ...(group.publicationManifest ? [group.publicationManifest] : [])];
  const entries = roots.flatMap(root => inventoryFiles(repositoryRoot, root, group));
  return Object.freeze(entries.sort((left, right) => left.path.localeCompare(right.path, 'en')));
}

function groupDiagnosticsPath(repositoryRoot: string, site: SiteId, group: string): string {
  return resolveSecureRepositoryPath(
    repositoryRoot,
    `${publicationGroupStagePath(site, group)}/${GROUP_DIAGNOSTICS_FILE}`,
    'Publication group diagnostics',
    {allowMissing: true},
  );
}

export function writePublicationGroupDiagnostics(repositoryRootInput: string, site: SiteId, groupName: string): void {
  const repositoryRoot = path.resolve(repositoryRootInput);
  const group = resolvePublicationGroupWorkflow(site, groupName).group;
  const diagnostics: PublicationGroupDiagnostics = {
    schemaVersion: 1,
    site,
    group: groupName,
    inventory: captureGroupInventory(repositoryRoot, group),
  };
  const target = groupDiagnosticsPath(repositoryRoot, site, groupName);
  writeSecureAtomicFile(repositoryRoot, target, `${JSON.stringify(diagnostics, null, 2)}\n`, 'Publication group diagnostics', {replace: true});
}

function readPublicationGroupDiagnostics(repositoryRoot: string, site: SiteId, groupName: string): PublicationGroupDiagnostics {
  const target = groupDiagnosticsPath(repositoryRoot, site, groupName);
  if (!existsSync(target)) throw new Error(`Publication group diagnostics are missing: ${path.relative(repositoryRoot, target)}`);
  let input: unknown;
  try {
    input = JSON.parse(readSecureFile(repositoryRoot, target, 'Publication group diagnostics').toString('utf8'));
  } catch (error) {
    throw new Error(`Publication group diagnostics are invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Publication group diagnostics must be an object');
  const value = input as Record<string, unknown>;
  if (value.schemaVersion !== 1 || value.site !== site || value.group !== groupName || !Array.isArray(value.inventory)) {
    throw new Error('Publication group diagnostics identity is invalid');
  }
  const inventory = value.inventory.map(entry => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Publication group diagnostics inventory entry is invalid');
    const record = entry as Record<string, unknown>;
    if (typeof record.path !== 'string' || typeof record.sha256 !== 'string' || !/^[0-9a-f]{64}$/u.test(record.sha256)) {
      throw new Error('Publication group diagnostics inventory entry is invalid');
    }
    return {path: record.path, sha256: record.sha256};
  });
  return deepFreeze({schemaVersion: 1, site, group: groupName, inventory});
}

function assertUnchangedGroupInventory(repositoryRoot: string, groupName: string, group: PublicationGroup): void {
  const diagnostics = readPublicationGroupDiagnostics(repositoryRoot, group.site, groupName);
  const current = captureGroupInventory(repositoryRoot, group);
  if (JSON.stringify(current) !== JSON.stringify(diagnostics.inventory)) {
    throw new Error(`Stale ${group.site}/${groupName} publication baseline: live owned files changed after fetch`);
  }
}

function stagedManifestFiles(repositoryRoot: string, group: PublicationGroup): readonly string[] {
  const files = group.manuals.flatMap(manual => {
    const publication = resolveManualPublication(manual, group.site).publication;
    const stageRoot = manualStagePath(group.site, manual);
    return captureSecureInventory(
      repositoryRoot,
      [`${stageRoot}/${publication.outputDir}`, `${stageRoot}/${publication.sidebarPath}`],
      'Staged publication manifest inventory',
    ).flatMap(entry => {
      const relative = entry.path.slice(`${stageRoot}/`.length);
      return protectedInventoryPath(group, relative) ? [] : [assertManifestFilePath(group, relative)];
    });
  });
  return Object.freeze([...files].sort((left, right) => left.localeCompare(right, 'en')));
}

function stagedManifestPath(repositoryRoot: string, group: PublicationGroup, groupName: string): string {
  if (!group.publicationManifest) throw new Error(`Publication group ${group.site}/${groupName} is not manifest-owned`);
  return resolveSecureRepositoryPath(
    repositoryRoot,
    `${publicationGroupStagePath(group.site, groupName)}/${group.publicationManifest}`,
    'Staged source publication manifest',
    {allowMissing: true},
  );
}

function writeStagedManifest(repositoryRoot: string, group: PublicationGroup, groupName: string): void {
  const target = stagedManifestPath(repositoryRoot, group, groupName);
  writeSecureAtomicFile(
    repositoryRoot,
    target,
    serializeSourcePublicationManifest(stagedManifestFiles(repositoryRoot, group)),
    'Staged source publication manifest',
    {replace: true},
  );
}

function readManifestAt(repositoryRoot: string, relativePath: string, group: PublicationGroup): SourcePublicationManifest {
  const target = resolveSecureRepositoryPath(repositoryRoot, relativePath, 'Chinese Guides source publication manifest', {allowMissing: true});
  if (!existsSync(target)) {
    throw new Error(`Chinese Guides source publication manifest must be a regular file: ${relativePath}`);
  }
  return parseSourcePublicationManifest(readSecureFile(repositoryRoot, target, 'Chinese Guides source publication manifest').toString('utf8'), group);
}

function sourceForManifestFile(repositoryRoot: string, group: PublicationGroup, target: string): string {
  for (const manual of group.manuals) {
    const publication = resolveManualPublication(manual, group.site).publication;
    if (target === publication.sidebarPath || target.startsWith(`${publication.contentRoot}/`)) {
      return resolveSecureRepositoryPath(
        repositoryRoot,
        `${manualStagePath(group.site, manual)}/${target}`,
        'Staged manifest-owned publication file',
        {finalKind: 'file'},
      );
    }
  }
  throw new Error(`No staged manual owns manifest file: ${target}`);
}

function copyRegularPublicationFile(sourceRoot: string, stageRoot: string, relativePath: string): void {
  const source = resolveSecureRepositoryPath(sourceRoot, relativePath, 'Seeded publication source file', {
    allowMissing: true,
    finalKind: 'file',
  });
  if (!existsSync(source)) {
    throw new Error(`Seeded publication source must be a regular file: ${relativePath}`);
  }
  copySecureTree(sourceRoot, relativePath, stageRoot, relativePath, 'Seeded publication file');
}

function copyPublicationTarget(sourceRoot: string, stageRoot: string, relativePath: string): boolean {
  const source = resolveSecureRepositoryPath(sourceRoot, relativePath, 'Immutable baseline publication target', {allowMissing: true});
  if (!existsSync(source)) return false;
  const stats = lstatSync(source);
  if (!stats.isFile() && !stats.isDirectory()) throw new Error(`Immutable baseline publication target must be a file or directory: ${relativePath}`);
  if (stats.isDirectory()) validateStageFilesystem(source);
  copySecureTree(sourceRoot, relativePath, stageRoot, relativePath, 'Immutable baseline publication target');
  return true;
}

function seedCurrentPublicationStage(
  context: CommandContext,
  group: PublicationGroup,
  baselineRootInput: string,
  expectedTreeOwnedCommit?: string,
): void {
  const baselineRoot = path.resolve(baselineRootInput);
  const manifest = group.publicationManifest ? readManifestAt(baselineRoot, group.publicationManifest, group) : null;
  const targets = manifest
    ? manifest.files.filter(file => (
        file === context.publication.sidebarPath || file.startsWith(`${context.publication.outputDir}/`)
      ))
    : publicationOwnedTargets(context.request.site, context.publication);
  const liveCommit = ownedTreeCommit(context.repositoryRoot, targets);
  const baselineCommit = manifest
    ? ownedTreeCommit(baselineRoot, targets)
    : expectedTreeOwnedCommit ?? ownedTreeCommit(baselineRoot, targets);
  if (liveCommit !== baselineCommit) {
    throw new Error(`Live ${context.request.site}/${context.request.manual} publication does not match the immutable Guides baseline`);
  }
  const staged = publicationStagePaths(context);
  ensureSecureDirectory(context.repositoryRoot, staged.outputPath, 'Seeded publication output stage');
  if (manifest) {
    for (const file of targets) copyRegularPublicationFile(baselineRoot, context.stagePath, file);
    return;
  }

  const sourceRoot = expectedTreeOwnedCommit ? context.repositoryRoot : baselineRoot;
  const sourceOutput = resolveSecureRepositoryPath(sourceRoot, context.publication.outputDir, 'Seeded publication output', {allowMissing: true});
  if (!existsSync(sourceOutput) || !lstatSync(sourceOutput).isDirectory() || lstatSync(sourceOutput).isSymbolicLink()) {
    throw new Error(`Seeded publication output must be a real directory: ${context.publication.outputDir}`);
  }
  validateStageFilesystem(sourceOutput);
  copySecureTree(sourceRoot, context.publication.outputDir, context.repositoryRoot, staged.outputPath, 'Seeded publication output');
  copyRegularPublicationFile(sourceRoot, context.stagePath, context.publication.sidebarPath);
}

async function prepareManifestOwnedBaseline(
  repositoryRoot: string,
  baselineRoot: string,
  group: PublicationGroup,
  groupName: string,
  replace: (options: AtomicReplaceOptions) => Promise<void>,
): Promise<void> {
  if (!group.publicationManifest) throw new Error(`Publication group ${group.site} is not manifest-owned`);
  const current = readManifestAt(repositoryRoot, group.publicationManifest, group);
  const baseline = readManifestAt(baselineRoot, group.publicationManifest, group);
  const restoreStageRelative = `${publicationGroupStagePath(group.site, groupName)}/baseline-restore`;
  removeSecureStageTree(repositoryRoot, restoreStageRelative, 'Immutable baseline restore stage');
  try {
    const restoreStage = ensureSecureDirectory(repositoryRoot, restoreStageRelative, 'Immutable baseline restore stage');
    for (const file of baseline.files) copyRegularPublicationFile(baselineRoot, restoreStage, file);
    copyRegularPublicationFile(baselineRoot, restoreStage, group.publicationManifest);
    const replacements = [
      ...baseline.files.map(target => ({
        source: resolveOwnedRepositoryPath(restoreStage, target, 'Staged immutable baseline publication file'),
        target,
      })),
      {
        source: resolveOwnedRepositoryPath(restoreStage, group.publicationManifest, 'Staged immutable baseline publication manifest'),
        target: group.publicationManifest,
      },
    ];
    const next = new Set(baseline.files);
    const removals = current.files.filter(file => !next.has(file));
    const ownedTargets = [...new Set([...replacements.map(entry => entry.target), ...removals])]
      .sort((left, right) => left.localeCompare(right, 'en'));
    await replace({
      publicationRoot: repositoryRoot,
      baselineCommit: ownedTreeCommit(repositoryRoot, ownedTargets),
      replacements,
      removals,
      validatePublication(snapshot) {
        for (const target of snapshot.ownedPaths) {
          const collision = protectedPath(group, target);
          if (collision) throw new Error(`Immutable Chinese Guides baseline includes protected Tools path ${collision}`);
        }
        const restored = readManifestAt(snapshot.publicationRoot, group.publicationManifest!, group);
        if (JSON.stringify(restored.files) !== JSON.stringify(baseline.files)) {
          throw new Error('Immutable Chinese Guides baseline manifest changed during preparation');
        }
      },
    });
  } finally {
    removeSecureStageTree(repositoryRoot, restoreStageRelative, 'Immutable baseline restore stage');
  }
}

async function prepareTreeOwnedBaseline(
  repositoryRoot: string,
  baselineRoot: string,
  group: PublicationGroup,
  groupName: string,
  replace: (options: AtomicReplaceOptions) => Promise<void>,
): Promise<void> {
  const targets = [...new Set(group.manuals.flatMap(manual => {
    const publication = resolveManualPublication(manual, group.site).publication;
    return publicationOwnedTargets(group.site, publication);
  }))].sort((left, right) => left.localeCompare(right, 'en'));
  const restoreStageRelative = `${publicationGroupStagePath(group.site, groupName)}/baseline-restore`;
  removeSecureStageTree(repositoryRoot, restoreStageRelative, 'Immutable baseline restore stage');
  try {
    const restoreStage = ensureSecureDirectory(repositoryRoot, restoreStageRelative, 'Immutable baseline restore stage');
    const replacements: {source: string; target: string}[] = [];
    const removals: string[] = [];
    for (const target of targets) {
      if (copyPublicationTarget(baselineRoot, restoreStage, target)) {
        replacements.push({
          source: resolveOwnedRepositoryPath(restoreStage, target, 'Staged immutable baseline publication target'),
          target,
        });
      } else {
        removals.push(target);
      }
    }
    for (const manual of group.manuals) {
      const publication = resolveManualPublication(manual, group.site).publication;
      for (const relativePath of publication.preservedFiles ?? []) {
        copyRegularPublicationFile(
          repositoryRoot,
          restoreStage,
          `${publication.outputDir}/${relativePath}`,
        );
      }
    }
    const expectedCommit = ownedTreeCommit(restoreStage, targets);
    await replace({
      publicationRoot: repositoryRoot,
      baselineCommit: ownedTreeCommit(repositoryRoot, targets),
      replacements,
      removals,
      validatePublication(snapshot) {
        if (ownedTreeCommit(snapshot.publicationRoot, targets) !== expectedCommit) {
          throw new Error(`Immutable ${group.site}/${groupName} baseline changed during preparation`);
        }
      },
    });
  } finally {
    removeSecureStageTree(repositoryRoot, restoreStageRelative, 'Immutable baseline restore stage');
  }
}

function validateStagedManifest(repositoryRoot: string, group: PublicationGroup, groupName: string): SourcePublicationManifest {
  if (!group.publicationManifest) throw new Error(`Publication group ${group.site}/${groupName} is not manifest-owned`);
  const manifest = readManifestAt(repositoryRoot, `${publicationGroupStagePath(group.site, groupName)}/${group.publicationManifest}`, group);
  const inventory = stagedManifestFiles(repositoryRoot, group);
  if (JSON.stringify(manifest.files) !== JSON.stringify(inventory)) {
    throw new Error('Chinese Guides staged files must exactly match the authoritative source publication manifest');
  }
  for (const file of manifest.files) {
    sourceForManifestFile(repositoryRoot, group, file);
  }
  return manifest;
}

async function publishManifestOwnedGroup(
  repositoryRoot: string,
  group: PublicationGroup,
  groupName: string,
  replace: (options: AtomicReplaceOptions) => Promise<void>,
): Promise<void> {
  if (!group.publicationManifest) throw new Error(`Publication group ${group.site}/${groupName} is not manifest-owned`);
  assertUnchangedGroupInventory(repositoryRoot, groupName, group);
  const current = readManifestAt(repositoryRoot, group.publicationManifest, group);
  const stagedRelativeManifest = `${publicationGroupStagePath(group.site, groupName)}/${group.publicationManifest}`;
  const staged = readManifestAt(repositoryRoot, stagedRelativeManifest, group);
  for (const file of [...current.files, ...staged.files]) assertManifestFilePath(group, file);
  const replacements = [
    ...staged.files.map(target => ({source: sourceForManifestFile(repositoryRoot, group, target), target})),
    {source: resolveOwnedRepositoryPath(repositoryRoot, stagedRelativeManifest, 'Staged source publication manifest'), target: group.publicationManifest},
  ];
  const next = new Set(staged.files);
  const removals = current.files.filter(file => !next.has(file));
  const ownedTargets = [...new Set([...replacements.map(entry => entry.target), ...removals])]
    .sort((left, right) => left.localeCompare(right, 'en'));
  await replace({
    publicationRoot: repositoryRoot,
    baselineCommit: ownedTreeCommit(repositoryRoot, ownedTargets),
    replacements,
    removals,
    validatePublication(snapshot) {
      for (const target of snapshot.ownedPaths) {
        const collision = protectedPath(group, target);
        if (collision) throw new Error(`Atomic Chinese Guides source publication includes protected Tools path ${collision}`);
      }
      const snapshotManifest = readManifestAt(snapshot.publicationRoot, group.publicationManifest!, group);
      if (JSON.stringify(snapshotManifest.files) !== JSON.stringify(staged.files)) {
        throw new Error('Atomic Chinese Guides source publication manifest changed during validation');
      }
      for (const file of snapshotManifest.files) {
        const target = resolveOwnedRepositoryPath(snapshot.publicationRoot, file, 'Manifest-owned publication snapshot file');
        if (!existsSync(target) || !lstatSync(target).isFile() || lstatSync(target).isSymbolicLink()) {
          throw new Error(`Manifest-owned publication snapshot file is missing or unsafe: ${file}`);
        }
      }
    },
  });
}

export function parsePublishGroupArgs(argv: readonly string[]): PublishGroupRequest {
  if (argv[0] !== 'publish-group') throw new Error(USAGE);
  const values: Record<string, string> = {};
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!['--site', '--group', '--stage'].includes(flag) || !value || value.startsWith('--')) throw new Error(USAGE);
    if (Object.hasOwn(values, flag)) throw new Error(`Duplicate argument: ${flag}`);
    values[flag] = value;
  }
  if (argv.length !== 7 || !values['--site'] || !values['--group'] || !values['--stage']) throw new Error(USAGE);
  if (values['--site'] !== 'en' && values['--site'] !== 'zh-CN') throw new Error(`Unknown site: ${values['--site']}`);
  if (!['fetch', 'validate', 'publish'].includes(values['--stage'])) throw new Error('--stage must be fetch, validate, or publish');
  resolvePublicationGroupWorkflow(values['--site'], values['--group']);
  return {site: values['--site'], group: values['--group'], stage: values['--stage'] as PublicationGroupStage};
}

async function executePublicationGroupAlreadyFenced(
  request: PublishGroupRequest,
  dependencies: PublicationGroupDependencies,
  executeAlreadyFenced: AlreadyFencedDocsToolingExecutor,
): Promise<PublicationGroupResult> {
  const repositoryRoot = path.resolve(dependencies.repositoryRoot ?? process.cwd());
  const workflow = resolvePublicationGroupWorkflow(request.site, request.group);
  const group = workflow.group;
  const environment = dependencies.environment ?? process.env;
  const sourceOnly = request.stage === 'fetch' && request.group === 'guides' && environment.DOCS_TOOLING_GUIDES_STAGE === 'source';
  const seedBaseline = request.stage === 'fetch' && request.group === 'guides' && environment.DOCS_TOOLING_GUIDES_STAGE === 'baseline';
  const baselineRoot = seedBaseline ? path.resolve(environment.DOCS_TOOLING_BASELINE_ROOT ?? repositoryRoot) : repositoryRoot;
  const finalizeAssembly = request.stage === 'validate' && request.group === 'guides' && environment.DOCS_TOOLING_GUIDES_STAGE === 'assembled';
  const manuals = sourceOnly ? group.manuals.slice(0, 1) : group.manuals;
  const {testing, ...manualDependencies} = dependencies;

  if (seedBaseline && baselineRoot !== repositoryRoot) {
    const replace = dependencies.atomicReplace ?? atomicReplace;
    if (group.publicationManifest) {
      await prepareManifestOwnedBaseline(repositoryRoot, baselineRoot, group, request.group, replace);
    } else {
      await prepareTreeOwnedBaseline(repositoryRoot, baselineRoot, group, request.group, replace);
    }
  }

  if (seedBaseline && group.publicationManifest) {
    const liveInventory = captureGroupInventory(repositoryRoot, group);
    const baselineInventory = captureGroupInventory(baselineRoot, group);
    if (JSON.stringify(liveInventory) !== JSON.stringify(baselineInventory)) {
      throw new Error(`Live ${request.site}/${request.group} publication does not match the immutable Guides baseline`);
    }
  }

  const expectedTreeOwnedCommits = seedBaseline && !group.publicationManifest
    ? new Map(group.manuals.map(manual => {
        const publication = resolveManualPublication(manual, group.site).publication;
        return [manual, ownedTreeCommit(repositoryRoot, publicationOwnedTargets(group.site, publication))] as const;
      }))
    : null;

  if (request.stage === 'fetch' && group.publicationManifest && !sourceOnly) {
    writePublicationGroupDiagnostics(repositoryRoot, request.site, request.group);
  }

  const executeManualStagesAlreadyFenced = async (): Promise<void> => {
    if (finalizeAssembly && group.publicationManifest) writeStagedManifest(repositoryRoot, group, request.group);
    for (const [index, manual] of manuals.entries()) {
      const command = [
        request.stage,
        '--manual', manual,
        '--group', request.group,
        '--site', request.site,
        '--stage', manualStagePath(request.site, manual),
      ];
      const commandEnvironment = request.stage === 'fetch' && request.group === 'guides' && index > 0
        ? {...environment, DOCS_TOOLING_REUSE_LARK_SOURCE: '1'}
        : environment;
      const commandDependencies: CliDependencies = {
        ...manualDependencies,
        repositoryRoot,
        environment: commandEnvironment,
        ...(seedBaseline ? {
          fetch: (context: CommandContext) => seedCurrentPublicationStage(
            context,
            group,
            baselineRoot,
            expectedTreeOwnedCommits?.get(manual),
          ),
        } : {}),
      };
      await testing?.beforeManual?.(frozenHookCopy(command), frozenHookCopy(commandDependencies));
      await executeAlreadyFenced(command, commandDependencies);
    }
  };

  if (request.stage === 'publish') {
    assertValidatedStageAttestation(repositoryRoot, group, request.group);
    if (group.publicationManifest) {
      await publishManifestOwnedGroup(repositoryRoot, group, request.group, dependencies.atomicReplace ?? atomicReplace);
    } else {
      await executeManualStagesAlreadyFenced();
    }
  } else {
    await executeManualStagesAlreadyFenced();
  }

  if (group.publicationManifest && !sourceOnly) {
    if (request.stage === 'fetch') writeStagedManifest(repositoryRoot, group, request.group);
    if (request.stage === 'validate') validateStagedManifest(repositoryRoot, group, request.group);
  }
  if (request.stage === 'validate') writeValidatedStageAttestation(repositoryRoot, group, request.group);

  return deepFreeze({
    request,
    manuals: Object.freeze([...manuals]),
    stages: Object.freeze(manuals.map(manual => manualStagePath(request.site, manual))),
    ownedPaths: group.ownedPaths,
    sourceSnapshots: workflow.sourceSnapshots,
  });
}

export async function executePublicationGroup(
  request: PublishGroupRequest,
  dependencies: PublicationGroupDependencies = {},
): Promise<PublicationGroupResult> {
  const repositoryRoot = path.resolve(dependencies.repositoryRoot ?? process.cwd());
  return withDocsToolingGroupFence(repositoryRoot, request.site, request.group, executeAlreadyFenced => (
    executePublicationGroupAlreadyFenced(request, {...dependencies, repositoryRoot}, executeAlreadyFenced)
  ));
}
