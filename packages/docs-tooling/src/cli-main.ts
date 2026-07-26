#!/usr/bin/env node
import {existsSync, lstatSync, realpathSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import type {AliyunOssValidator} from '@zilliz/publication-adapters';

import {executeDocsToolingCommand, executeReferenceDocsToolingCommand, parseCliArgs} from './cli.ts';
import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from './validation/ownership.ts';

const ALIYUN_VALIDATOR_PROVIDER = 'DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER';

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
    if (argv[0] === 'reference-manifest' || argv[0] === 'validate-reference') {
      await executeReferenceDocsToolingCommand(argv, {write: message => process.stdout.write(`${message}\n`)});
      return;
    }
    const request = parseCliArgs(argv);
    const repositoryRoot = path.resolve(process.cwd());
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
