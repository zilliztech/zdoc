#!/usr/bin/env node
import {existsSync, lstatSync, readFileSync, readdirSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import type {AliyunOssValidator} from '@zilliz/publication-adapters';
import {config as loadDotenv} from 'dotenv';

import {executeDocsToolingCommand, executeReferenceDocsToolingCommand, parseCliArgs} from './cli.ts';
import {checkLinks} from './links/check.ts';
import {applyMdxPatches} from './mdx/index.ts';
import {executeReportCard} from './reporting/lark.ts';
import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from './validation/ownership.ts';

const ALIYUN_VALIDATOR_PROVIDER = 'DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER';

function parseOptions(argv: string[]): Record<string, string | boolean> {
  const options: Record<string, string | boolean> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) throw new Error(`Unexpected argument: ${item}`);
    const key = item.slice(2).replace(/-([a-z])/gu, (_match, letter: string) => letter.toUpperCase());
    const next = argv[index + 1];
    options[key] = next && !next.startsWith('--') ? argv[++index] : true;
  }
  return options;
}

function requiredOption(options: Record<string, string | boolean>, key: string): string {
  const value = options[key];
  if (typeof value !== 'string' || !value) throw new Error(`--${key.replace(/[A-Z]/gu, letter => `-${letter.toLowerCase()}`)} is required`);
  return value;
}

function assertNoSymlinkedInput(repositoryRoot: string, relativePath: string): string {
  assertSafeRepositoryRelativePath(relativePath, 'MDX input path');
  const target = resolveOwnedRepositoryPath(repositoryRoot, relativePath, 'MDX input path');
  let current = path.resolve(repositoryRoot);
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment);
    if (!existsSync(current)) throw new Error(`MDX input path does not exist: ${relativePath}`);
    if (lstatSync(current).isSymbolicLink()) throw new Error(`MDX input path must not use symlinks: ${relativePath}`);
  }
  return target;
}

async function validateMdxDirectory(repositoryRoot: string, relativePath: string, verbose: boolean): Promise<void> {
  const directory = assertNoSymlinkedInput(repositoryRoot, relativePath);
  if (!lstatSync(directory).isDirectory()) throw new Error(`MDX input path must be a directory: ${relativePath}`);
  const files: string[] = [];
  const visit = (current: string): void => {
    for (const entry of readdirSync(current, {withFileTypes: true})) {
      const target = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`MDX input must not use symlinks: ${path.relative(repositoryRoot, target)}`);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && /\.mdx?$/u.test(entry.name)) files.push(target);
    }
  };
  visit(directory);
  let patched = 0;
  for (const file of files) {
    if (verbose) process.stdout.write(`Processing ${path.relative(repositoryRoot, file)}...\n`);
    const original = readFileSync(file, 'utf8');
    const result = await applyMdxPatches(original);
    if (result !== original) {
      writeFileSync(file, result);
      process.stdout.write(`Patched: ${path.relative(repositoryRoot, file)}\n`);
      patched += 1;
    }
  }
  process.stdout.write(`MDX validation completed. ${patched}/${files.length} files patched.\n`);
}

async function executeExplicitCommand(argv: string[], repositoryRoot: string): Promise<boolean> {
  if (argv[0] === 'validate-mdx') {
    const options = parseOptions(argv.slice(1));
    await validateMdxDirectory(repositoryRoot, requiredOption(options, 'path'), options.verbose === true);
    return true;
  }
  if (argv[0] === 'check-links') {
    const options = parseOptions(argv.slice(1));
    await checkLinks({repositoryRoot, site: requiredOption(options, 'site'), output: requiredOption(options, 'output')});
    return true;
  }
  if (argv[0] === 'report-card') {
    const action = argv[1];
    if (!action || !['create', 'advance', 'note', 'finish'].includes(action)) {
      throw new Error('report-card action must be create, advance, note, or finish');
    }
    await executeReportCard({repositoryRoot, action, options: parseOptions(argv.slice(2)), environment: process.env});
    return true;
  }
  return false;
}

function assertSafeProviderPath(repositoryRoot: string, providerPath: string): string {
  assertSafeRepositoryRelativePath(providerPath, 'Aliyun OSS validator provider');
  const repositoryReal = realpathSync(repositoryRoot);
  const target = resolveOwnedRepositoryPath(repositoryRoot, providerPath, 'Aliyun OSS validator provider');
  let current = repositoryRoot;
  for (const segment of providerPath.split('/')) {
    current = path.join(current, segment);
    if (!existsSync(current)) throw new Error(`Aliyun OSS validator provider is missing: ${providerPath}`);
    const stats = lstatSync(current);
    if (stats.isSymbolicLink()) throw new Error(`Aliyun OSS validator provider must not use symlinks: ${providerPath}`);
    const resolved = realpathSync(current);
    if (resolved !== repositoryReal && !resolved.startsWith(`${repositoryReal}${path.sep}`)) {
      throw new Error(`Aliyun OSS validator provider escapes the repository root: ${providerPath}`);
    }
  }
  const targetStats = lstatSync(target);
  if (!targetStats.isFile()) throw new Error(`Aliyun OSS validator provider must be a regular file: ${providerPath}`);
  return target;
}

async function loadAliyunOssValidator(repositoryRoot: string, environment: NodeJS.ProcessEnv): Promise<AliyunOssValidator | undefined> {
  const providerPath = environment[ALIYUN_VALIDATOR_PROVIDER];
  if (!providerPath) return undefined;
  const provider = await import(pathToFileURL(assertSafeProviderPath(repositoryRoot, providerPath)).href);
  if (typeof provider.createAliyunOssValidator !== 'function') {
    throw new Error('Aliyun OSS validator provider must export createAliyunOssValidator()');
  }
  const validator = await provider.createAliyunOssValidator();
  if (!validator || typeof validator.validatePublication !== 'function') {
    throw new Error('Aliyun OSS validator provider factory must return validatePublication(root, context)');
  }
  return Object.freeze({validatePublication: validator.validatePublication.bind(validator)});
}

async function main(): Promise<void> {
  try {
    const argv = process.argv.slice(2);
    const repositoryRoot = path.resolve(process.cwd());
    loadDotenv({path: path.join(repositoryRoot, '.env'), override: false});
    if (await executeExplicitCommand(argv, repositoryRoot)) return;
    if (argv[0] === 'reference-manifest' || argv[0] === 'validate-reference') {
      await executeReferenceDocsToolingCommand(argv, {write: message => process.stdout.write(`${message}\n`)});
      return;
    }
    const request = parseCliArgs(argv);
    const aliyunOssValidator = request.site === 'zh-CN'
      ? await loadAliyunOssValidator(repositoryRoot, process.env)
      : undefined;
    await executeDocsToolingCommand(argv, {repositoryRoot, aliyunOssValidator, write: message => process.stdout.write(`${message}\n`)});
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

void main();
