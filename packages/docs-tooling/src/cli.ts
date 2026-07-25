#!/usr/bin/env node
import {spawnSync as nodeSpawnSync} from 'node:child_process';
import {copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {resolveManualPublication, type SourceEntry} from './manuals/registry.ts';
import type {ManualDefinition, ManualPublication, ManualSource, SiteId} from './manuals/schema.ts';
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
  spawnSync?: GeneratorRunner;
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
  return {command, manual: values['--manual'], site: values['--site'], stage: values['--stage']};
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
  if (existsSync(context.stagePath)) {
    if (lstatSync(context.stagePath).isSymbolicLink()) throw new Error(`Stage root must not be a symlink: ${context.request.stage}`);
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

async function validatePublicationStage(context: CommandContext): Promise<StageInventory> {
  const paths = publicationStagePaths(context);
  if (!existsSync(paths.outputPath)) throw new Error(`Publication content artifact is missing: ${context.publication.outputDir}`);
  if (!existsSync(paths.sidebarPath)) throw new Error(`Publication sidebar artifact is missing: ${context.publication.sidebarPath}`);
  if (!lstatSync(paths.sidebarPath).isFile() || lstatSync(paths.sidebarPath).isSymbolicLink()) {
    throw new Error(`Publication sidebar artifact must be a regular file: ${context.publication.sidebarPath}`);
  }
  const inventory = validateStageFilesystem(context.stagePath);
  const integrity = await scanIntegrity(context.stagePath, {
    repository: 'zdoc',
    contentRoots: [context.publication.outputDir],
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

async function copyLocalSource(context: CommandContext): Promise<void> {
  const sourcePath = assertExistingSource(context.repositoryRoot, context.source as ManualSource);
  const outputPath = publicationStagePaths(context).outputPath;
  mkdirSync(outputPath, {recursive: true});
  cpSync(sourcePath, outputPath, {recursive: true, force: true, errorOnExist: false});
  stageExistingSidebar(context);
  await validatePublicationStage(context);
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
): string[] {
  const source = sourceEntry.source as ManualSource;
  if (!source.root || !source.base) {
    throw new Error(`Manual ${context.request.manual} ${source.sourceType} source is missing its Lark root or base identity`);
  }
  return [
    '--manual', context.request.manual,
    '--site', context.request.site,
    '--source', sourceEntry.key,
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
  ];
}

async function defaultFetch(context: CommandContext, runner: GeneratorRunner, environment: NodeJS.ProcessEnv): Promise<void> {
  const source = context.source as ManualSource;
  resetStage(context);
  if (source.sourceType === 'local') {
    await copyLocalSource(context);
    return;
  }
  if (source.sourceType === 'wiki' || source.sourceType === 'drive' || source.sourceType === 'onePager') {
    const guidesSourceOnly = isGuidesSourceStage(context, environment);
    const chain = context.sourceChain;
    for (const [index, entry] of chain.entries()) {
      const sourceOnly = guidesSourceOnly || index < chain.length - 1;
      runGenerator(
        context,
        runner,
        path.join(context.repositoryRoot, 'packages/docs-tooling/src/lark/cli.js'),
        larkGeneratorArgs(context, environment, entry, sourceOnly),
        environment,
        false,
      );
      assertExistingSource(context.repositoryRoot, entry.source as ManualSource);
    }
    if (guidesSourceOnly) {
      const sourcePath = assertExistingSource(context.repositoryRoot, source);
      cpSync(sourcePath, context.stagePath, {recursive: true, force: true, errorOnExist: false});
      validateStageFilesystem(context.stagePath);
    } else await validatePublicationStage(context);
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
    await validatePublicationStage(context);
    return;
  }
  const exhaustive: never = source.sourceType;
  throw new Error(`Unsupported manual source type: ${String(exhaustive)}`);
}

function defaultPublish(context: CommandContext): void {
  const staged = publicationStagePaths(context);
  const outputPath = resolveOwnedRepositoryPath(context.repositoryRoot, context.publication.outputDir, 'Publication outputDir');
  const sidebarPath = resolveOwnedRepositoryPath(context.repositoryRoot, context.publication.sidebarPath, 'Publication sidebarPath');
  mkdirSync(outputPath, {recursive: true});
  cpSync(staged.outputPath, outputPath, {recursive: true, force: true, errorOnExist: false});
  mkdirSync(path.dirname(sidebarPath), {recursive: true});
  copyFileSync(staged.sidebarPath, sidebarPath);
}

export async function executeDocsToolingCommand(argv: readonly string[], dependencies: CliDependencies = {}): Promise<CommandContext> {
  const request = parseCliArgs(argv);
  const repositoryRoot = path.resolve(dependencies.repositoryRoot ?? process.cwd());
  const stagePath = resolveOwnedRepositoryPath(repositoryRoot, request.stage, 'Stage path');
  const resolved = resolveManualPublication(request.manual, request.site);
  const environment = dependencies.environment ?? process.env;
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

  if (request.command === 'fetch') {
    if (dependencies.fetch) await dependencies.fetch(baseContext);
    else await defaultFetch(baseContext, dependencies.spawnSync ?? nodeSpawnSync, environment);
    dependencies.write?.(`fetched ${request.manual}/${request.site} into ${request.stage}`);
    return baseContext;
  }

  const inventory = await validatePublicationStage(baseContext);
  const validatedContext: CommandContext = {...baseContext, inventory};
  if (request.command === 'publish') await (dependencies.publish ?? defaultPublish)(validatedContext);
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
