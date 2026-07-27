import {createHash} from 'node:crypto';
import {copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';

import {executeDocsToolingCommand, publicationStagePaths, type CliDependencies, type CommandContext} from '../cli.ts';
import {resolveManualPublication} from '../manuals/registry.ts';
import type {SiteId} from '../manuals/schema.ts';
import {atomicReplace, ownedTreeCommit, type AtomicReplaceOptions} from '../publication/atomicReplace.ts';
import {publicationOwnedTargets} from '../publication/diagnostics.ts';
import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {validateStageFilesystem} from '../validation/filesystem.ts';
import {
  type PublicationGroup,
  type PublicationGroupStage,
  resolvePublicationGroupWorkflow,
} from './groups.ts';

const GROUP_DIAGNOSTICS_FILE = '.docs-tooling-publication-group.json';

type PublishGroupRequest = Readonly<{
  site: SiteId;
  group: string;
  stage: PublicationGroupStage;
}>;

type ManualExecutor = (
  argv: readonly string[],
  dependencies: CliDependencies,
) => Promise<CommandContext | void>;

export type PublicationGroupDependencies = CliDependencies & Readonly<{
  executeManual?: ManualExecutor;
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

const USAGE = 'Usage: docs-tooling publish-group --site <en|zh-CN> --group <name> --stage <fetch|validate|publish>';

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function pathOverlaps(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function protectedPath(group: PublicationGroup, candidate: string): string | undefined {
  return group.protectedPaths?.find(protectedTarget => pathOverlaps(candidate, protectedTarget));
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

function inventoryFiles(repositoryRoot: string, relativePath: string, group: PublicationGroup): InventoryEntry[] {
  if (protectedPath(group, relativePath)) return [];
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
  return resolveOwnedRepositoryPath(repositoryRoot, `${publicationGroupStagePath(site, group)}/${GROUP_DIAGNOSTICS_FILE}`, 'Publication group diagnostics');
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
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, `${JSON.stringify(diagnostics, null, 2)}\n`, 'utf8');
}

function readPublicationGroupDiagnostics(repositoryRoot: string, site: SiteId, groupName: string): PublicationGroupDiagnostics {
  const target = groupDiagnosticsPath(repositoryRoot, site, groupName);
  if (!existsSync(target)) throw new Error(`Publication group diagnostics are missing: ${path.relative(repositoryRoot, target)}`);
  let input: unknown;
  try {
    input = JSON.parse(readFileSync(target, 'utf8'));
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

function walkStageFiles(root: string, relativePath: string): string[] {
  const target = resolveOwnedRepositoryPath(root, relativePath, 'Staged publication path');
  if (!existsSync(target)) throw new Error(`Staged publication path is missing: ${relativePath}`);
  const stats = lstatSync(target);
  if (stats.isSymbolicLink()) throw new Error(`Staged publication path must not be a symlink: ${relativePath}`);
  if (stats.isFile()) return [relativePath];
  if (!stats.isDirectory()) throw new Error(`Staged publication path must be a file or directory: ${relativePath}`);
  return readdirSync(target, {withFileTypes: true})
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
    .flatMap(entry => walkStageFiles(root, `${relativePath}/${entry.name}`));
}

function stagedManifestFiles(repositoryRoot: string, group: PublicationGroup): readonly string[] {
  const files = group.manuals.flatMap(manual => {
    const publication = resolveManualPublication(manual, group.site).publication;
    const stageRoot = resolveOwnedRepositoryPath(repositoryRoot, manualStagePath(group.site, manual), 'Manual stage root');
    const content = walkStageFiles(stageRoot, publication.outputDir);
    const sidebar = walkStageFiles(stageRoot, publication.sidebarPath);
    return [...content, ...sidebar].map(relative => assertManifestFilePath(group, relative));
  });
  return Object.freeze([...files].sort((left, right) => left.localeCompare(right, 'en')));
}

function stagedManifestPath(repositoryRoot: string, group: PublicationGroup, groupName: string): string {
  if (!group.publicationManifest) throw new Error(`Publication group ${group.site}/${groupName} is not manifest-owned`);
  return resolveOwnedRepositoryPath(
    repositoryRoot,
    `${publicationGroupStagePath(group.site, groupName)}/${group.publicationManifest}`,
    'Staged source publication manifest',
  );
}

function writeStagedManifest(repositoryRoot: string, group: PublicationGroup, groupName: string): void {
  const target = stagedManifestPath(repositoryRoot, group, groupName);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, serializeSourcePublicationManifest(stagedManifestFiles(repositoryRoot, group)), 'utf8');
}

function readManifestAt(repositoryRoot: string, relativePath: string, group: PublicationGroup): SourcePublicationManifest {
  const target = resolveOwnedRepositoryPath(repositoryRoot, relativePath, 'Chinese Guides source publication manifest');
  if (!existsSync(target) || !lstatSync(target).isFile() || lstatSync(target).isSymbolicLink()) {
    throw new Error(`Chinese Guides source publication manifest must be a regular file: ${relativePath}`);
  }
  return parseSourcePublicationManifest(readFileSync(target, 'utf8'), group);
}

function sourceForManifestFile(repositoryRoot: string, group: PublicationGroup, target: string): string {
  for (const manual of group.manuals) {
    const publication = resolveManualPublication(manual, group.site).publication;
    if (target === publication.sidebarPath || target.startsWith(`${publication.contentRoot}/`)) {
      return resolveOwnedRepositoryPath(
        repositoryRoot,
        `${manualStagePath(group.site, manual)}/${target}`,
        'Staged manifest-owned publication file',
      );
    }
  }
  throw new Error(`No staged manual owns manifest file: ${target}`);
}

function copyRegularPublicationFile(sourceRoot: string, stageRoot: string, relativePath: string): void {
  const source = resolveOwnedRepositoryPath(sourceRoot, relativePath, 'Seeded publication source file');
  if (!existsSync(source) || !lstatSync(source).isFile() || lstatSync(source).isSymbolicLink()) {
    throw new Error(`Seeded publication source must be a regular file: ${relativePath}`);
  }
  const target = resolveOwnedRepositoryPath(stageRoot, relativePath, 'Seeded publication stage file');
  mkdirSync(path.dirname(target), {recursive: true});
  copyFileSync(source, target);
}

function copyPublicationTarget(sourceRoot: string, stageRoot: string, relativePath: string): boolean {
  const source = resolveOwnedRepositoryPath(sourceRoot, relativePath, 'Immutable baseline publication target');
  if (!existsSync(source)) return false;
  const stats = lstatSync(source);
  if (stats.isSymbolicLink()) throw new Error(`Immutable baseline publication target must not be a symlink: ${relativePath}`);
  const target = resolveOwnedRepositoryPath(stageRoot, relativePath, 'Staged immutable baseline publication target');
  mkdirSync(path.dirname(target), {recursive: true});
  if (stats.isFile()) {
    copyFileSync(source, target);
    return true;
  }
  if (!stats.isDirectory()) throw new Error(`Immutable baseline publication target must be a file or directory: ${relativePath}`);
  validateStageFilesystem(source);
  cpSync(source, target, {recursive: true, force: true, errorOnExist: false});
  return true;
}

function seedCurrentPublicationStage(context: CommandContext, group: PublicationGroup, baselineRootInput: string): void {
  const baselineRoot = path.resolve(baselineRootInput);
  const manifest = group.publicationManifest ? readManifestAt(baselineRoot, group.publicationManifest, group) : null;
  const targets = manifest
    ? manifest.files.filter(file => (
        file === context.publication.sidebarPath || file.startsWith(`${context.publication.outputDir}/`)
      ))
    : publicationOwnedTargets(context.request.site, context.publication);
  const liveCommit = ownedTreeCommit(context.repositoryRoot, targets);
  const baselineCommit = ownedTreeCommit(baselineRoot, targets);
  if (liveCommit !== baselineCommit) {
    throw new Error(`Live ${context.request.site}/${context.request.manual} publication does not match the immutable Guides baseline`);
  }
  const staged = publicationStagePaths(context);
  mkdirSync(staged.outputPath, {recursive: true});
  if (manifest) {
    for (const file of targets) copyRegularPublicationFile(baselineRoot, context.stagePath, file);
    return;
  }

  const sourceOutput = resolveOwnedRepositoryPath(baselineRoot, context.publication.outputDir, 'Seeded publication output');
  if (!existsSync(sourceOutput) || !lstatSync(sourceOutput).isDirectory() || lstatSync(sourceOutput).isSymbolicLink()) {
    throw new Error(`Seeded publication output must be a real directory: ${context.publication.outputDir}`);
  }
  validateStageFilesystem(sourceOutput);
  cpSync(sourceOutput, staged.outputPath, {recursive: true, force: true, errorOnExist: false});
  copyRegularPublicationFile(baselineRoot, context.stagePath, context.publication.sidebarPath);
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
  const restoreStage = resolveOwnedRepositoryPath(
    repositoryRoot,
    `${publicationGroupStagePath(group.site, groupName)}/baseline-restore`,
    'Immutable baseline restore stage',
  );
  rmSync(restoreStage, {recursive: true, force: true});
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
  try {
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
    rmSync(restoreStage, {recursive: true, force: true});
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
  const restoreStage = resolveOwnedRepositoryPath(
    repositoryRoot,
    `${publicationGroupStagePath(group.site, groupName)}/baseline-restore`,
    'Immutable baseline restore stage',
  );
  rmSync(restoreStage, {recursive: true, force: true});
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
  const expectedCommit = ownedTreeCommit(baselineRoot, targets);
  try {
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
    rmSync(restoreStage, {recursive: true, force: true});
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
    const source = sourceForManifestFile(repositoryRoot, group, file);
    if (!existsSync(source) || !lstatSync(source).isFile() || lstatSync(source).isSymbolicLink()) {
      throw new Error(`Manifest-owned staged publication file must be a regular file: ${file}`);
    }
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

export async function executePublicationGroup(
  request: PublishGroupRequest,
  dependencies: PublicationGroupDependencies = {},
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
  const executeManual = dependencies.executeManual ?? executeDocsToolingCommand;
  const {executeManual: _executeManual, ...manualDependencies} = dependencies;

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

  if (request.stage === 'fetch' && group.publicationManifest && !sourceOnly) {
    writePublicationGroupDiagnostics(repositoryRoot, request.site, request.group);
  }

  if (request.stage === 'publish' && group.publicationManifest) {
    await publishManifestOwnedGroup(repositoryRoot, group, request.group, dependencies.atomicReplace ?? atomicReplace);
  } else {
    if (finalizeAssembly && group.publicationManifest) writeStagedManifest(repositoryRoot, group, request.group);
    for (const [index, manual] of manuals.entries()) {
      const command = [
        request.stage,
        '--manual', manual,
        '--site', request.site,
        '--stage', manualStagePath(request.site, manual),
      ];
      const commandEnvironment = request.stage === 'fetch' && request.group === 'guides' && index > 0
        ? {...environment, DOCS_TOOLING_REUSE_LARK_SOURCE: '1'}
        : environment;
      await executeManual(command, {
        ...manualDependencies,
        repositoryRoot,
        environment: commandEnvironment,
        ...(seedBaseline ? {fetch: (context: CommandContext) => seedCurrentPublicationStage(context, group, baselineRoot)} : {}),
      });
    }
  }

  if (group.publicationManifest && !sourceOnly) {
    if (request.stage === 'fetch') writeStagedManifest(repositoryRoot, group, request.group);
    if (request.stage === 'validate') validateStagedManifest(repositoryRoot, group, request.group);
  }

  return deepFreeze({
    request,
    manuals: Object.freeze([...manuals]),
    stages: Object.freeze(manuals.map(manual => manualStagePath(request.site, manual))),
    ownedPaths: group.ownedPaths,
    sourceSnapshots: workflow.sourceSnapshots,
  });
}
