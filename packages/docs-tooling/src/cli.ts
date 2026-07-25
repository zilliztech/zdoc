#!/usr/bin/env node
import {spawnSync as nodeSpawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {resolveManualPublication} from './manuals/registry.ts';
import type {ManualDefinition, ManualPublication, ManualSource, SiteId} from './manuals/schema.ts';
import {validateStageFilesystem, type StageInventory} from './validation/filesystem.ts';
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
  publication: ResolvedPublication['publication'];
  inventory?: StageInventory;
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

function copyLocalSource(context: CommandContext): void {
  const sourcePath = assertExistingSource(context.repositoryRoot, context.source as ManualSource);
  mkdirSync(context.stagePath, {recursive: true});
  cpSync(sourcePath, context.stagePath, {recursive: true, force: true, errorOnExist: false});
  validateStageFilesystem(context.stagePath);
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

function larkGeneratorArgs(context: CommandContext, environment: NodeJS.ProcessEnv): string[] {
  const source = context.source as ManualSource;
  if (!source.root || !source.base) {
    throw new Error(`Manual ${context.request.manual} ${source.sourceType} source is missing its Lark root or base identity`);
  }
  return [
    '--manual', context.request.manual,
    '--site', context.request.site,
    '--source', context.publication.source,
    '--source-type', source.sourceType,
    '--root', source.root,
    '--base', source.base,
    '--source-dir', source.sourceDir,
    '--stage', context.request.stage,
    ...(source.version ? ['--version', source.version] : []),
    ...(isGuidesSourceStage(context, environment) ? [
      '--source-only',
      '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
    ] : []),
    ...(environment.DOCS_TOOLING_FORCE_FULL_FETCH === '1' ? ['--force-full-fetch'] : []),
  ];
}

function defaultFetch(context: CommandContext, runner: GeneratorRunner, environment: NodeJS.ProcessEnv): void {
  const source = context.source as ManualSource;
  if (source.sourceType === 'local') {
    copyLocalSource(context);
    return;
  }
  if (source.sourceType === 'wiki' || source.sourceType === 'drive' || source.sourceType === 'onePager') {
    const sourceOnly = isGuidesSourceStage(context, environment);
    runGenerator(
      context,
      runner,
      path.join(context.repositoryRoot, 'packages/docs-tooling/src/lark/cli.js'),
      larkGeneratorArgs(context, environment),
      environment,
      !sourceOnly,
    );
    if (sourceOnly) copyLocalSource(context);
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
        '--output_path', context.stagePath,
        '--lang', context.request.site === 'en' ? 'en-US' : 'zh-CN',
        '--target', 'zilliz',
      ],
      environment,
    );
    return;
  }
  const exhaustive: never = source.sourceType;
  throw new Error(`Unsupported manual source type: ${String(exhaustive)}`);
}

function defaultPublish(context: CommandContext): void {
  const outputPath = resolveOwnedRepositoryPath(context.repositoryRoot, context.publication.outputDir, 'Publication outputDir');
  mkdirSync(outputPath, {recursive: true});
  cpSync(context.stagePath, outputPath, {recursive: true, force: true, errorOnExist: false});
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
    publication: resolved.publication,
  };

  if (request.command === 'fetch') {
    if (dependencies.fetch) await dependencies.fetch(baseContext);
    else defaultFetch(baseContext, dependencies.spawnSync ?? nodeSpawnSync, environment);
    dependencies.write?.(`fetched ${request.manual}/${request.site} into ${request.stage}`);
    return baseContext;
  }

  const inventory = validateStageFilesystem(stagePath);
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
