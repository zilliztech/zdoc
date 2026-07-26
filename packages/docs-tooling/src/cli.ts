#!/usr/bin/env node
import {spawnSync as nodeSpawnSync} from 'node:child_process';
import {copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  createPublicationAdapterRegistry,
  createZhCnPublicationAdapterRegistry,
  type PublicationAdapterRegistry,
} from '@zilliz/publication-adapters';
import type {AliyunOssStorage, PublicationContext} from '@zilliz/publication-adapters';
import {resolveSiteProfile} from '@zilliz/site-config';

import {resolveManualPublication, type SourceEntry} from './manuals/registry.ts';
import type {ManualDefinition, ManualPublication, ManualSource, SiteId} from './manuals/schema.ts';
import {atomicReplace, type AtomicReplaceOptions, type AtomicValidationSnapshot} from './publication/atomicReplace.ts';
import {
  capturePublicationDiagnostics,
  publicationOwnedTargets,
  readAndValidatePublicationDiagnostics,
  writePublicationAnchor,
  writePublicationDiagnostics,
  type PublicationDiagnostics,
  type PublicationDiagnosticsIdentity,
} from './publication/diagnostics.ts';
import {validateStageFilesystem, type StageInventory} from './validation/filesystem.ts';
import {scanIntegrity} from './validation/integrity.mjs';
import {
  assertPublicationOwnership,
  assertSafeRepositoryRelativePath,
  resolveOwnedRepositoryPath,
} from './validation/ownership.ts';

export type DocsToolingCommand = 'fetch' | 'validate' | 'publish';

export type CliRequest = Readonly<{
  command: DocsToolingCommand;
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
  aliyunOssStorage?: AliyunOssStorage;
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

const USAGE = 'Usage: docs-tooling <fetch|validate|publish> --manual <id> --site <en|zh-CN> --stage <dir>';

export function parseCliArgs(argv: readonly string[]): CliRequest {
  const command = argv[0];
  if (command !== 'fetch' && command !== 'validate' && command !== 'publish') throw new Error(`Unknown command: ${command ?? '(missing)'}. ${USAGE}`);
  if (argv.length !== 7) throw new Error(USAGE);
  const values: Record<string, string> = {};
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index];
    if (!['--manual', '--site', '--stage'].includes(flag)) throw new Error(`Unknown argument: ${flag}. ${USAGE}`);
    if (Object.hasOwn(values, flag)) throw new Error(`Duplicate argument: ${flag}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}. ${USAGE}`);
    values[flag] = value;
  }
  if (!values['--manual'] || !values['--site'] || !values['--stage']) throw new Error(USAGE);
  if (values['--site'] !== 'en' && values['--site'] !== 'zh-CN') throw new Error(`Unknown site: ${values['--site']}`);
  assertSafeRepositoryRelativePath(values['--stage'], 'Stage path');
  const canonicalStage = `tmp/docs-tooling/${values['--site']}/${values['--manual']}`;
  if (values['--stage'] !== canonicalStage && !values['--stage'].startsWith(`${canonicalStage}/`)) {
    throw new Error(`Stage path must use the canonical ${canonicalStage} root or one of its descendants`);
  }
  return {command, manual: values['--manual'], site: values['--site'], stage: values['--stage']};
}

function pathsOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function assertPathAncestorsSafe(repositoryRoot: string, targetPath: string, label: string): void {
  const repositoryReal = realpathSync(repositoryRoot);
  const relative = path.relative(repositoryRoot, targetPath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${label} must stay below the repository root`);
  let current = repositoryRoot;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (!existsSync(current)) continue;
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`${label} has a symlink ancestor: ${path.relative(repositoryRoot, current)}`);
    const currentReal = realpathSync(current);
    if (currentReal !== repositoryReal && !currentReal.startsWith(`${repositoryReal}${path.sep}`)) {
      throw new Error(`${label} escapes the repository through an ancestor: ${path.relative(repositoryRoot, current)}`);
    }
    if (current !== targetPath && !stats.isDirectory()) throw new Error(`${label} has a non-directory ancestor: ${path.relative(repositoryRoot, current)}`);
  }
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
  assertPathAncestorsSafe(context.repositoryRoot, context.stagePath, 'Stage path');
  if (existsSync(context.stagePath) && !lstatSync(context.stagePath).isDirectory()) {
    throw new Error(`Stage root must be a directory: ${context.request.stage}`);
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
    contentRootPath: resolveOwnedRepositoryPath(context.stagePath, context.publication.contentRoot, 'Staged publication contentRoot'),
    outputPath: resolveOwnedRepositoryPath(context.stagePath, context.publication.outputDir, 'Staged publication outputDir'),
    sidebarPath: resolveOwnedRepositoryPath(context.stagePath, context.publication.sidebarPath, 'Staged publication sidebarPath'),
  };
}

function resetStage(context: CommandContext): void {
  assertSafeStageLocation(context);
  if (existsSync(context.stagePath)) {
    rmSync(context.stagePath, {recursive: true, force: true});
  }
  mkdirSync(context.stagePath, {recursive: true});
}

function stageExistingSidebar(context: CommandContext): void {
  const sourcePath = resolveOwnedRepositoryPath(context.repositoryRoot, context.publication.sidebarPath, 'Publication sidebarPath');
  if (!existsSync(sourcePath)) throw new Error(`Publication sidebar source is missing: ${context.publication.sidebarPath}`);
  const staged = publicationStagePaths(context).sidebarPath;
  mkdirSync(path.dirname(staged), {recursive: true});
  copyFileSync(sourcePath, staged);
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

function missingAliyunOssStorage(): AliyunOssStorage {
  return {
    async validateOrPublish() {
      throw new Error('zh-CN publication validation requires explicit Aliyun OSS storage injection');
    },
  };
}

function selectedPublicationAdapters(site: SiteId, aliyunOssStorage: AliyunOssStorage | undefined): SelectedPublicationAdapters {
  const ids = resolveSiteProfile(site).publicationAdapters;
  if (ids.length === 0) return {ids, registry: createPublicationAdapterRegistry([])};
  if (site !== 'zh-CN') throw new Error(`Site ${site} cannot select Chinese publication adapters`);
  return {
    ids,
    registry: createZhCnPublicationAdapterRegistry({aliyunOssStorage: aliyunOssStorage ?? missingAliyunOssStorage()}),
  };
}

function publicationAdapterContext(context: CommandContext): PublicationContext {
  const source = context.source as ManualSource;
  return {
    site: context.request.site,
    manual: context.request.manual,
    publicationRoot: context.stagePath,
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
      contents: readFileSync(absolutePath, 'utf8'),
    }, adapterContext);
    writeFileSync(absolutePath, document.contents);
  }
}

async function validateSelectedPublicationAdapters(context: CommandContext, selected: SelectedPublicationAdapters): Promise<void> {
  if (selected.ids.length === 0) return;
  await selected.registry.validatePublication(selected.ids, publicationAdapterContext(context));
}

async function validatePublicationFilesystem(root: string, publication: ManualPublication): Promise<StageInventory> {
  const outputPath = path.join(root, publication.outputDir);
  const sidebarPath = path.join(root, publication.sidebarPath);
  if (!existsSync(outputPath)) throw new Error(`Publication content artifact is missing: ${publication.outputDir}`);
  if (!existsSync(sidebarPath)) throw new Error(`Publication sidebar artifact is missing: ${publication.sidebarPath}`);
  if (!lstatSync(sidebarPath).isFile() || lstatSync(sidebarPath).isSymbolicLink()) {
    throw new Error(`Publication sidebar artifact must be a regular file: ${publication.sidebarPath}`);
  }
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

async function validatePublicationSnapshot(context: CommandContext, snapshot: AtomicValidationSnapshot): Promise<void> {
  const expectedOwnedPaths = publicationOwnedTargets(context.request.site, context.publication as ManualPublication);
  if (snapshot.ownedPaths.length !== expectedOwnedPaths.length
    || expectedOwnedPaths.some((target, index) => snapshot.ownedPaths[index] !== target)) {
    throw new Error('Atomic publication snapshot owned paths do not match the validated publication contract');
  }
  await validatePublicationFilesystem(snapshot.publicationRoot, context.publication as ManualPublication);
}

async function copyLocalSource(context: CommandContext): Promise<void> {
  const sourcePath = assertExistingSource(context.repositoryRoot, context.source as ManualSource);
  const outputPath = publicationStagePaths(context).outputPath;
  mkdirSync(outputPath, {recursive: true});
  cpSync(sourcePath, outputPath, {recursive: true, force: true, errorOnExist: false});
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
      cpSync(sourcePath, context.stagePath, {recursive: true, force: true, errorOnExist: false});
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
    validatePublication: snapshot => validatePublicationSnapshot(context, snapshot),
  });
}

export async function executeDocsToolingCommand(argv: readonly string[], dependencies: CliDependencies = {}): Promise<CommandContext> {
  const request = parseCliArgs(argv);
  const repositoryRoot = path.resolve(dependencies.repositoryRoot ?? process.cwd());
  const stagePath = resolveOwnedRepositoryPath(repositoryRoot, request.stage, 'Stage path');
  const resolved = resolveManualPublication(request.manual, request.site);
  const environment = dependencies.environment ?? process.env;
  const selectedAdapters = selectedPublicationAdapters(request.site, dependencies.aliyunOssStorage);
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
    }
    if (dependencies.fetch) await dependencies.fetch(fetchContext);
    else await defaultFetch(fetchContext, dependencies.spawnSync ?? nodeSpawnSync, environment);
    if (publicationDiagnostics) {
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
    else await defaultPublish(validatedContext, dependencies.atomicReplace);
  }
  dependencies.write?.(`${request.command === 'publish' ? 'published' : 'validated'} ${request.manual}/${request.site} from ${request.stage}`);
  return validatedContext;
}

async function main(): Promise<void> {
  try {
    await executeDocsToolingCommand(process.argv.slice(2), {write: message => process.stdout.write(`${message}\n`)});
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) void main();
