#!/usr/bin/env node
import {appendFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import type {AliyunOssValidator} from '@zilliz/publication-adapters';
import {config as loadDotenv} from 'dotenv';

import {executeDocsToolingCommand, executeReferenceDocsToolingCommand, parseCliArgs} from './cli.ts';
import {manualRegistry, resolveGuidesSourceConfig} from './manuals/registry.ts';
import {checkLinks} from './links/check.ts';
import {checkBrokenLinks} from './links/brokenLinks.ts';
import {analyzeBrokenLinksCommand} from './links/brokenLinkAnalysis.ts';
import {reportBrokenLinksCommand} from './links/reportBrokenLinks.ts';
import {reportCanonicalLinksCommand} from './links/reportCanonicalLinks.ts';
import {applyMdxPatches} from './mdx/index.ts';
import {executeReportCard} from './reporting/lark.ts';
import type {
  RevisionGroup,
  RevisionInventory,
  SourceSnapshot,
} from './lark/revisionInventory.ts';
import {validateTranslationCoverage} from './translation/validate.ts';
import {TranslationTargetIdSchema} from './translation/schema.ts';
import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from './validation/ownership.ts';
import {executePublicationGroup, parsePublishGroupArgs} from './workflows/run.ts';
import {listPublicationGroups} from './workflows/groups.ts';

const requireFromDocsTooling = createRequire(import.meta.url);

const ALIYUN_VALIDATOR_PROVIDER = 'DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER';
const ALIYUN_STORAGE_ENVIRONMENT = [
  'OSS_ACCESS_KEY_ID',
  'OSS_ACCESS_KEY_SECRET',
  'OSS_REGION',
  'OSS_BUCKET',
  'OSS_ENDPOINT',
] as const;
type RevisionInventoryModule = typeof import('./lark/revisionInventory.ts');

let revisionInventoryModule: Promise<RevisionInventoryModule> | undefined;

function loadRevisionInventoryModule(): Promise<RevisionInventoryModule> {
  if (!revisionInventoryModule) {
    const injected = (globalThis as typeof globalThis & {
      __DOCS_TOOLING_REVISION_INVENTORY__?: RevisionInventoryModule
    }).__DOCS_TOOLING_REVISION_INVENTORY__;
    if (injected) return Promise.resolve(injected);
    const {loadTypeScript} = requireFromDocsTooling('../../../scripts/lib/load-typescript.js') as {
      loadTypeScript: (modulePath: string) => RevisionInventoryModule;
    };
    revisionInventoryModule = Promise.resolve(
      loadTypeScript(path.join(path.dirname(process.argv[1]), 'lark/revisionInventory.ts')),
    );
  }
  return revisionInventoryModule;
}

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

function revisionGroup(value: string): RevisionGroup {
  if (!listPublicationGroups('en').includes(value)) throw new Error(`Unsupported revision inventory group: ${value}`);
  return value as RevisionGroup;
}

function resolveSafeRevisionPath(
  repositoryRoot: string,
  relativePath: string,
  label: string,
  mustExist: boolean,
): string {
  const target = resolveOwnedRepositoryPath(repositoryRoot, relativePath, label);
  let current = path.resolve(repositoryRoot);
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment);
    if (!existsSync(current)) break;
    if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} must not use symlinks: ${relativePath}`);
  }
  if (mustExist && !existsSync(target)) throw new Error(`${label} is missing: ${relativePath}`);
  return target;
}

function readJsonFile(file: string, label: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(`${label} is malformed JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function readSourceSnapshot(repositoryRoot: string, relativePath: string): SourceSnapshot {
  const value = readJsonFile(resolveSafeRevisionPath(repositoryRoot, relativePath, 'Revision snapshot path', true), 'Revision snapshot');
  if (typeof value !== 'object' || value === null || Array.isArray(value) || !Array.isArray((value as {records?: unknown}).records)) {
    throw new Error(`Revision snapshot must be a container with a records array: ${relativePath}`);
  }
  return value as SourceSnapshot;
}

async function readRevisionInventory(file: string, label: string): Promise<RevisionInventory> {
  const value = readJsonFile(file, label);
  const {validateRevisionInventory} = await loadRevisionInventoryModule();
  validateRevisionInventory(value);
  return value as RevisionInventory;
}

function writeRepositoryFile(repositoryRoot: string, relativePath: string, contents: string, label: string): void {
  const file = resolveSafeRevisionPath(repositoryRoot, relativePath, label, false);
  mkdirSync(path.dirname(file), {recursive: true});
  writeFileSync(file, contents);
}

async function executeRevisionInventoryBuild(argv: string[], repositoryRoot: string): Promise<void> {
  if (argv[1] !== 'build') throw new Error('revision-inventory action must be build');
  const options = parseOptions(argv.slice(2));
  const group = revisionGroup(requiredOption(options, 'group'));
  const snapshotOption = options.snapshot;
  if (group === 'rest' && snapshotOption !== undefined) throw new Error('REST revision inventory does not accept snapshots');
  if (group !== 'rest' && (typeof snapshotOption !== 'string' || !snapshotOption)) throw new Error('--snapshot is required');
  const snapshotPaths = typeof snapshotOption === 'string' ? snapshotOption.split(',') : [];
  if (snapshotPaths.some(value => !value)) throw new Error('--snapshot must contain repository-relative paths');
  const baselinePath = requiredOption(options, 'baseline');
  const outputPath = requiredOption(options, 'output');
  const reportDir = requiredOption(options, 'reportDir');
  assertSafeRepositoryRelativePath(reportDir, 'Revision report directory');
  const generatedAt = requiredOption(options, 'generatedAt');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(generatedAt)
    || !Number.isFinite(Date.parse(generatedAt))) {
    throw new Error('--generated-at must be an ISO date string');
  }

  const snapshots = snapshotPaths.map(value => readSourceSnapshot(repositoryRoot, value));
  const complete = snapshots.every(snapshot => snapshot.records.every(record => !record.node_metadata?.fetch_error));
  const baselineFile = resolveSafeRevisionPath(repositoryRoot, baselinePath, 'Revision baseline path', false);
  const baselineBytes = existsSync(baselineFile) ? readFileSync(baselineFile, 'utf8') : undefined;
  const baseline = baselineBytes === undefined ? null : await readRevisionInventory(baselineFile, 'Revision baseline');
  if (baseline && baseline.group !== group) throw new Error(`Revision baseline group must be ${group}`);
  const {
    buildRevisionInventory,
    diffRevisionInventories,
    editedToday,
    renderRevisionDiffMarkdown,
    serializeRevisionInventory,
  } = await loadRevisionInventoryModule();
  const candidate = buildRevisionInventory({
    group,
    complete,
    generatedAt,
    sourceRunId: requiredOption(options, 'sourceRunId'),
    snapshots,
  });
  const changes = diffRevisionInventories(baseline, candidate);
  const inventoryBytes = serializeRevisionInventory(candidate, baseline && baselineBytes !== undefined
    ? {inventory: baseline, bytes: baselineBytes}
    : undefined);
  const report = {group, changes, editedToday: editedToday(candidate.records, new Date(generatedAt))};
  writeRepositoryFile(repositoryRoot, outputPath, inventoryBytes, 'Revision inventory output path');
  writeRepositoryFile(repositoryRoot, `${reportDir}/${group}.json`, `${JSON.stringify(report, null, 2)}\n`, 'Revision JSON report path');
  writeRepositoryFile(repositoryRoot, `${reportDir}/${group}.md`, renderRevisionDiffMarkdown(group, changes), 'Revision Markdown report path');
  process.stdout.write(`Revision inventory built for ${group}.\n`);
}

async function validateCommittedRevisionInventories(argv: string[], repositoryRoot: string): Promise<void> {
  const options = parseOptions(argv.slice(1));
  if (requiredOption(options, 'site') !== 'en') throw new Error('Revision inventory validation supports only --site en');
  for (const group of listPublicationGroups('en')) {
    // A reference manual that is registered but not yet fetched (its content and generated
    // sidebars are dev-owned and produced by the fetch pipeline) has no revision inventory on
    // this branch — skip it, mirroring the unseeded-manual tolerance in validate-reference and
    // Reference sidebar derivation.
    const manual = manualRegistry.find(candidate => candidate.id === group);
    if (manual?.kind === 'reference' && manual.publications.en
      && !existsSync(path.join(repositoryRoot, manual.publications.en.sidebarPath))) {
      continue;
    }
    const relativePath = `generated/en/manifests/lark-revisions/${group}.json`;
    const file = resolveSafeRevisionPath(repositoryRoot, relativePath, 'Revision inventory path', true);
    const inventory = await readRevisionInventory(file, `Revision inventory ${group}`);
    if (inventory.group !== group) throw new Error(`Revision inventory ${group} has group ${inventory.group}`);
  }
  process.stdout.write('Revision inventories validated.\n');
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

async function validateMdxPath(repositoryRoot: string, relativePath: string, verbose: boolean, write: boolean): Promise<void> {
  const input = assertNoSymlinkedInput(repositoryRoot, relativePath);
  const files: string[] = [];
  const visit = (current: string): void => {
    for (const entry of readdirSync(current, {withFileTypes: true})) {
      const target = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`MDX input must not use symlinks: ${path.relative(repositoryRoot, target)}`);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && /\.mdx?$/u.test(entry.name)) files.push(target);
    }
  };
  const inputStats = lstatSync(input);
  if (inputStats.isDirectory()) visit(input);
  else if (inputStats.isFile() && /\.mdx?$/u.test(input)) files.push(input);
  else throw new Error(`MDX input path must be a Markdown file or directory: ${relativePath}`);
  let patched = 0;
  for (const file of files) {
    if (verbose) process.stdout.write(`Processing ${path.relative(repositoryRoot, file)}...\n`);
    const original = readFileSync(file, 'utf8');
    const result = await applyMdxPatches(original);
    if (result !== original) {
      if (write) {
        writeFileSync(file, result);
        process.stdout.write(`Patched: ${path.relative(repositoryRoot, file)}\n`);
      } else if (verbose) {
        process.stdout.write(`Requires patch: ${path.relative(repositoryRoot, file)}\n`);
      }
      patched += 1;
    }
  }
  const outcome = write ? 'patched' : 'require patches';
  process.stdout.write(`MDX validation completed. ${patched}/${files.length} files ${outcome}.\n`);
}

async function executeExplicitCommand(argv: string[], repositoryRoot: string): Promise<boolean> {
  if (argv[0] === 'validate-publication-provider') {
    const options = parseOptions(argv.slice(1));
    const site = requiredOption(options, 'site');
    if (site !== 'en' && site !== 'zh-CN') throw new Error(`Unsupported documentation site: ${site}`);
    if (site === 'en') {
      process.stdout.write('English publication does not require a locale-specific validator.\n');
      return true;
    }
    const validator = await loadAliyunOssValidator(repositoryRoot, process.env);
    if (!validator) throw new Error('zh-CN publication validation requires explicit Aliyun OSS validator injection');
    for (const name of ALIYUN_STORAGE_ENVIRONMENT) {
      if (!process.env[name]) throw new Error(`Chinese publication requires Aliyun OSS storage configuration: ${name}`);
    }
    const imageBedUrl = process.env.IMAGE_BED_URL;
    if (!imageBedUrl) throw new Error('Chinese publication requires IMAGE_BED_URL');
    const imageBed = new URL(imageBedUrl);
    if (imageBed.protocol !== 'https:' || /(?:^|\.)s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/iu.test(imageBed.hostname)) {
      throw new Error('Chinese publication IMAGE_BED_URL must use HTTPS Aliyun OSS storage, not Amazon S3');
    }
    process.stdout.write('Chinese publication validator is ready.\n');
    return true;
  }
  if (argv[0] === 'guides-source-config') {
    const options = parseOptions(argv.slice(1));
    const site = requiredOption(options, 'site');
    if (site !== 'en' && site !== 'zh-CN') throw new Error(`Unsupported Guides site: ${site}`);
    const output = requiredOption(options, 'githubOutput');
    const config = resolveGuidesSourceConfig(site);
    appendFileSync(output, Object.entries(config)
      .map(([key, value]) => `${key.replace(/[A-Z]/gu, letter => `_${letter.toLowerCase()}`)}=${value}\n`)
      .join(''));
    return true;
  }
  if (argv[0] === 'revision-inventory') {
    await executeRevisionInventoryBuild(argv, repositoryRoot);
    return true;
  }
  if (argv[0] === 'validate-revision-inventory') {
    await validateCommittedRevisionInventories(argv, repositoryRoot);
    return true;
  }
  if (argv[0] === 'validate-translation') {
    const options = parseOptions(argv.slice(1));
    validateTranslationCoverage({
      repositoryRoot,
      targetId: TranslationTargetIdSchema.parse(requiredOption(options, 'target')),
      group: requiredOption(options, 'group'),
    });
    process.stdout.write('Translation coverage validated.\n');
    return true;
  }
  if (argv[0] === 'validate-mdx') {
    const options = parseOptions(argv.slice(1));
    if (options.check === true && options.write === true) throw new Error('validate-mdx accepts either --check or --write, not both');
    await validateMdxPath(repositoryRoot, requiredOption(options, 'path'), options.verbose === true, options.check !== true);
    return true;
  }
  if (argv[0] === 'check-links') {
    const options = parseOptions(argv.slice(1));
    await checkLinks({repositoryRoot, site: requiredOption(options, 'site'), output: requiredOption(options, 'output')});
    return true;
  }
  if (argv[0] === 'check-broken-links') {
    const options = parseOptions(argv.slice(1));
    await checkBrokenLinks({repositoryRoot, site: requiredOption(options, 'site'), output: requiredOption(options, 'output')});
    return true;
  }
  if (argv[0] === 'analyze-broken-links') {
    const options = parseOptions(argv.slice(1));
    await analyzeBrokenLinksCommand({repositoryRoot, site: requiredOption(options, 'site'), reportPath: requiredOption(options, 'report'), output: requiredOption(options, 'output')});
    return true;
  }
  if (argv[0] === 'report-broken-links') {
    const options = parseOptions(argv.slice(1));
    const analysisPaths = requiredOption(options, 'analysis').split(',').map(part => part.trim()).filter(Boolean);
    await reportBrokenLinksCommand({analysisPaths, notePath: requiredOption(options, 'note')});
    return true;
  }
  if (argv[0] === 'report-canonical-links') {
    const options = parseOptions(argv.slice(1));
    await reportCanonicalLinksCommand({site: requiredOption(options, 'site'), reportPath: requiredOption(options, 'report'), tableUrlPath: requiredOption(options, 'table-url')});
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
    if (argv[0] === 'reference-manifest' || argv[0] === 'reference-sidebar' || argv[0] === 'validate-reference') {
      await executeReferenceDocsToolingCommand(argv, {write: message => process.stdout.write(`${message}\n`)});
      return;
    }
    if (argv[0] === 'publish-group') {
      const request = parsePublishGroupArgs(argv);
      const aliyunOssValidator = request.site === 'zh-CN'
        ? await loadAliyunOssValidator(repositoryRoot, process.env)
        : undefined;
      await executePublicationGroup(request, {
        repositoryRoot,
        aliyunOssValidator,
        write: message => process.stdout.write(`${message}\n`),
      });
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
