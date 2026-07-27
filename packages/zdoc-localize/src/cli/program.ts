import {access, mkdir, readFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {join, resolve, sep} from 'node:path';

import {Command, CommanderError, Option} from 'commander';
import {ENGINE_CAPABILITIES, ENGINE_SCHEMA_VERSION, ENGINE_VERSION} from 'feishu-docx-engine';

import {createRuntime, type Runtime} from '../application/runtime.js';
import {feishuRegistrySchema} from '../adapters/lark-base-schema.js';
import {NodeProcessRunner, type ProcessRunner} from '../adapters/process-runner.js';
import {asLocalizeError, LocalizeError, toErrorEnvelope} from '../domain/errors.js';
import type {DocumentMode, RunRecord} from '../domain/model.js';
import {ConfigStore, type WorkspaceConfig} from '../storage/config-store.js';

export const CLI_VERSION = '0.1.1';
export const SCHEMA_VERSION = 1;

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface RunCliOptions {
  cwd?: string;
  runtimeFactory?: (cwd: string) => Promise<Runtime>;
  diagnosticRunner?: ProcessRunner;
}

const commands = [
  'init',
  'doctor',
  'registry',
  'pair',
  'bootstrap',
  'plan',
  'apply',
  'manual',
  'status',
  'recover',
] as const;

const features = [
  'external-translation-provider',
  'review-markdown-v1',
  'write-preview-v1',
  'existing-empty-target-initialization-v1',
  'manual-synced-reference-v1',
  'whiteboard-mirror-v1',
  'docx-engine-v1',
  'structured-list-localization-v1',
  'native-table-localization-v1',
] as const;

class MemoryIo {
  private readonly stdoutChunks: string[] = [];
  private readonly stderrChunks: string[] = [];

  writeStdout(value: string): void { this.stdoutChunks.push(value); }
  writeStderr(value: string): void { this.stderrChunks.push(value); }
  result(exitCode: number): CliResult {
    return {exitCode, stdout: this.stdoutChunks.join(''), stderr: this.stderrChunks.join('')};
  }
}

function emit(io: MemoryIo, data: unknown, format: string): void {
  io.writeStdout(format === 'json'
    ? `${JSON.stringify({ok: true, data})}\n`
    : `${JSON.stringify(data, null, 2)}\n`);
}

function formatOption(command: Command): Command {
  return command.option('--format <format>', 'Output format: json | pretty', 'pretty');
}

function workspacePath(cwd: string, path: string): string {
  const workspace = resolve(cwd);
  const absolute = resolve(workspace, path);
  if (absolute !== workspace && !absolute.startsWith(`${workspace}${sep}`)) {
    throw new LocalizeError({type: 'validation', subtype: 'unsafe_input_path', message: 'Input paths must stay inside the workspace.'});
  }
  return absolute;
}

export function projectRunStatus(run: RunRecord): Record<string, unknown> {
  const manualActions = (run.metadata?.manualActions as Array<Record<string, unknown>> | undefined) ?? [];
  const errorDetail = run.errorDetail as Record<string, unknown> | undefined;
  return {
    runId: run.runId,
    pairId: run.pairId,
    state: run.state,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    ...(run.sourceFromRevision === undefined ? {} : {sourceFromRevision: run.sourceFromRevision}),
    ...(run.sourceToRevision === undefined ? {} : {sourceToRevision: run.sourceToRevision}),
    ...(run.targetPlanRevision === undefined ? {} : {targetPlanRevision: run.targetPlanRevision}),
    ...(run.errorType ? {errorType: run.errorType} : {}),
    ...(errorDetail ? {errorDetail: {
      type: errorDetail.type,
      subtype: errorDetail.subtype,
      message: errorDetail.message,
      hint: errorDetail.hint,
      retryable: errorDetail.retryable,
    }} : {}),
    ...(typeof run.metadata?.validationPath === 'string' ? {validationPath: run.metadata.validationPath} : {}),
    ...(manualActions.length > 0 ? {
      manualActions: manualActions.map((action) => ({
        operationId: action.operationId,
        sourceDocumentId: action.sourceDocumentId,
        sourceBlockId: action.sourceBlockId,
        sourceUrl: action.sourceUrl,
      })),
    } : {}),
  };
}

async function withRuntime<T>(
  cwd: string,
  factory: (cwd: string) => Promise<Runtime>,
  action: (runtime: Runtime) => Promise<T>,
): Promise<T> {
  const runtime = await factory(cwd);
  try {
    return await action(runtime);
  } finally {
    await runtime.close();
  }
}

function createProgram(
  io: MemoryIo,
  cwd: string,
  runtimeFactory: (cwd: string) => Promise<Runtime>,
  diagnosticRunner: ProcessRunner,
): Command {
  const program = new Command();
  program
    .name('zdoc-localize')
    .description('Stale-safe localization planning for ZDoc Feishu documents.')
    .version(CLI_VERSION)
    .exitOverride()
    .configureOutput({
      writeOut: (value) => io.writeStdout(value),
      writeErr: (value) => io.writeStderr(value),
    });

  formatOption(program.command('capabilities'))
    .action((options: {format: string}) => emit(io, {
      cliVersion: CLI_VERSION,
      schemaVersion: SCHEMA_VERSION,
      docxEngine: {
        version: ENGINE_VERSION,
        schemaVersion: ENGINE_SCHEMA_VERSION,
        capabilities: [...ENGINE_CAPABILITIES],
      },
      commands: [...commands],
      features: [...features],
    }, options.format));

  const registry = program.command('registry').description('Inspect the shared Feishu registry contract');
  formatOption(registry.command('schema'))
    .description('Print the exact Base table, field, option, and view schema')
    .action((options: {format: string}) => emit(io, feishuRegistrySchema, options.format));

  formatOption(program.command('doctor'))
    .option('--offline', 'Do not access Feishu or external CLIs')
    .action(async (options: {format: string; offline?: boolean}) => {
      await mkdir(join(cwd, '.zdoc-localize'), {recursive: true});
      await access(join(cwd, '.zdoc-localize'), constants.W_OK);
      const config = await new ConfigStore(cwd).read();
      const checks: Array<{id: string; status: 'passed' | 'failed' | 'skipped'; detail?: string}> = [
        {id: 'node-version', status: 'passed', detail: process.version},
        {id: 'workspace-write', status: 'passed'},
      ];
      if (options.offline) {
        emit(io, {mode: 'offline', healthy: true, checks}, options.format);
        return;
      }
      const runCheck = async (id: string, executable: string, args: string[], optional = false): Promise<void> => {
        try {
          const result = await diagnosticRunner.run({executable, args});
          checks.push(result.exitCode === 0
            ? {id, status: 'passed', ...(result.stdout.trim() ? {detail: result.stdout.trim().slice(0, 300)} : {})}
            : {id, status: optional ? 'skipped' : 'failed', detail: result.stderr.trim() || `exit ${result.exitCode}`});
        } catch (error) {
          checks.push({id, status: optional ? 'skipped' : 'failed', detail: String(error)});
        }
      };
      await runCheck('lark-cli-version', 'lark-cli', ['--version']);
      await runCheck('lark-auth', 'lark-cli', ['auth', 'status', '--json', '--verify']);
      checks.push({
        id: 'feishu-docx-engine',
        status: ENGINE_SCHEMA_VERSION === 2 ? 'passed' : 'failed',
        detail: ENGINE_VERSION,
      });
      try {
        await withRuntime(cwd, runtimeFactory, async (runtime) => {
          await runtime.registry.listPairs();
          await runtime.registry.listGlossary();
        });
        checks.push({id: 'registry-access', status: 'passed'});
        checks.push({id: 'sqlite', status: 'passed'});
      } catch (error) {
        checks.push({id: 'registry-access', status: 'failed', detail: String(error)});
        checks.push({id: 'sqlite', status: 'failed', detail: 'Runtime initialization or registry check failed.'});
      }
      if (config?.mode === 'feishu' && config.stateFolderUrl) {
        await runCheck('drive-state-folder', 'lark-cli', ['drive', '+inspect', '--url', config.stateFolderUrl, '--format', 'json', '--as', 'user']);
      } else {
        checks.push({id: 'drive-state-folder', status: 'skipped', detail: 'Local registry mode does not use a shared Drive state folder.'});
      }
      emit(io, {
        mode: config?.mode ?? 'local',
        healthy: checks.every((check) => check.status !== 'failed'),
        checks,
      }, options.format);
    });

  const pair = program.command('pair').description('Manage registered document pairs');
  formatOption(pair.command('add'))
    .requiredOption('--pair <id>')
    .requiredOption('--source <url>')
    .option('--target <url>')
    .option('--target-parent <url>')
    .option('--target-parent-token <token>')
    .addOption(new Option('--mode <mode>').choices(['mirror', 'selective', 'independent', 'excluded']).default('mirror'))
    .action(async (options: {pair: string; source: string; target?: string; targetParent?: string; targetParentToken?: string; mode: DocumentMode; format: string}) => {
      const documentPair = {
        pairId: options.pair,
        sourceLocale: 'en' as const,
        targetLocale: 'zh-CN' as const,
        sourceDocUrl: options.source,
        ...(options.target ? {targetDocUrl: options.target} : {}),
        ...(options.targetParent ? {targetParentUrl: options.targetParent} : {}),
        ...(options.targetParentToken ? {targetParentToken: options.targetParentToken} : {}),
        mode: options.mode,
        status: 'needs_bootstrap' as const,
      };
      await withRuntime(cwd, runtimeFactory, (runtime) => runtime.registry.savePair(documentPair));
      emit(io, {pair: documentPair}, options.format);
    });
  formatOption(pair.command('list'))
    .action(async (options: {format: string}) => {
      const pairs = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.registry.listPairs());
      emit(io, {pairs}, options.format);
    });
  formatOption(pair.command('show'))
    .requiredOption('--pair <id>')
    .action(async (options: {pair: string; format: string}) => {
      const found = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.registry.getPair(options.pair));
      if (!found) throw new LocalizeError({type: 'not_found', subtype: 'pair_not_found', message: `Document pair ${options.pair} was not found.`});
      emit(io, {pair: found}, options.format);
    });

  const bootstrap = program.command('bootstrap').description('Establish the first localization baseline');
  formatOption(bootstrap.command('plan'))
    .requiredOption('--pair <id>')
    .action(async (options: {pair: string; format: string}) => {
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.planBootstrap(options.pair));
      emit(io, result, options.format);
    });
  formatOption(bootstrap.command('accept'))
    .requiredOption('--run <id>')
    .action(async (options: {run: string; format: string}) => {
      await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.acceptBootstrap(options.run));
      emit(io, {runId: options.run, state: 'completed'}, options.format);
    });

  const plan = program.command('plan').description('Create and complete localization plans');
  formatOption(plan.command('create'))
    .requiredOption('--pair <id>')
    .action(async (options: {pair: string; format: string}) => {
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.createPlan(options.pair));
      emit(io, result, options.format);
    });
  formatOption(plan.command('classify'))
    .requiredOption('--run <id>')
    .requiredOption('--applicable <ids>', 'Comma-separated applicable change IDs')
    .action(async (options: {run: string; applicable: string; format: string}) => {
      const ids = options.applicable.split(',').map((value) => value.trim()).filter(Boolean);
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.classifyPlan(options.run, ids));
      emit(io, result, options.format);
    });
  formatOption(plan.command('complete'))
    .requiredOption('--run <id>')
    .requiredOption('--translations <file>')
    .action(async (options: {run: string; translations: string; format: string}) => {
      const responses = JSON.parse(await readFile(workspacePath(cwd, options.translations), 'utf8')) as Parameters<Runtime['workflows']['completePlan']>[1];
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.completePlan(options.run, responses));
      emit(io, result, options.format);
    });

  formatOption(program.command('status'))
    .requiredOption('--run <id>')
    .action(async (options: {run: string; format: string}) => {
      const run = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.registry.getRun(options.run));
      if (!run) throw new LocalizeError({type: 'not_found', subtype: 'run_not_found', message: `Localization run ${options.run} was not found.`});
      emit(io, projectRunStatus(run), options.format);
    });

  formatOption(program.command('apply').description('Apply an approved localization review'))
    .requiredOption('--run <id>')
    .requiredOption('--review <file>')
    .option('--preview', 'Generate the immutable write preview and approval token')
    .option('--approval-token <token>', 'Exact token returned by --preview')
    .action(async (options: {run: string; review: string; preview?: boolean; approvalToken?: string; format: string}) => {
      const result = options.preview
        ? await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.previewApply(options.run, options.review))
        : await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.apply(options.run, options.review, options.approvalToken));
      emit(io, result, options.format);
    });

  const manual = program.command('manual').description('Verify planned human localization actions');
  formatOption(manual.command('verify'))
    .requiredOption('--run <id>')
    .action(async (options: {run: string; format: string}) => {
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.verifyManualActions(options.run));
      emit(io, result, options.format);
    });

  const recover = program.command('recover').description('Inspect and recover incomplete writes');
  formatOption(recover.command('inspect'))
    .requiredOption('--run <id>')
    .action(async (options: {run: string; format: string}) => {
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.inspectRecovery(options.run));
      emit(io, result, options.format);
    });
  formatOption(recover.command('accept-current'))
    .requiredOption('--run <id>')
    .action(async (options: {run: string; format: string}) => {
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.restartFromCurrent(options.run));
      emit(io, result, options.format);
    });
  formatOption(recover.command('finalize'))
    .requiredOption('--run <id>')
    .action(async (options: {run: string; format: string}) => {
      const result = await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.finalizeVerified(options.run));
      emit(io, result, options.format);
    });
  formatOption(recover.command('reverse'))
    .requiredOption('--run <id>')
    .option('--preview', 'Generate the reverse patch preview and approval token')
    .option('--approval-token <token>', 'Exact token returned by --preview')
    .action(async (options: {run: string; preview?: boolean; approvalToken?: string; format: string}) => {
      const result = options.preview
        ? await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.previewReverse(options.run))
        : await withRuntime(cwd, runtimeFactory, (runtime) => runtime.workflows.reversePartial(options.run, options.approvalToken));
      emit(io, result, options.format);
    });
  formatOption(program.command('init').description('Configure shared Feishu registry and snapshot storage'))
    .addOption(new Option('--mode <mode>').choices(['local', 'feishu']).makeOptionMandatory())
    .option('--registry <url>')
    .option('--registry-token <token>')
    .option('--pairs-table <id>')
    .option('--glossary-table <id>')
    .option('--runs-table <id>')
    .option('--state-folder <url>')
    .option('--state-folder-token <token>')
    .action(async (options: {
      mode: 'local' | 'feishu'; format: string; registry?: string; registryToken?: string;
      pairsTable?: string; glossaryTable?: string; runsTable?: string;
      stateFolder?: string; stateFolderToken?: string;
    }) => {
      let config: WorkspaceConfig = {mode: options.mode};
      if (options.mode === 'feishu') {
        const required = [
          options.registry, options.registryToken, options.pairsTable, options.glossaryTable,
          options.runsTable, options.stateFolder, options.stateFolderToken,
        ];
        if (required.some((value) => !value)) {
          throw new LocalizeError({
            type: 'validation',
            subtype: 'feishu_init_incomplete',
            message: 'Feishu mode requires registry URL/token, three table IDs, and state-folder URL/token.',
          });
        }
        config = {
          mode: 'feishu',
          registryUrl: options.registry,
          registryBaseToken: options.registryToken,
          stateFolderUrl: options.stateFolder,
          stateFolderToken: options.stateFolderToken,
          registryTableIds: {
            documentPairs: options.pairsTable!,
            glossary: options.glossaryTable!,
            localizationRuns: options.runsTable!,
          },
        };
      }
      await new ConfigStore(cwd).write(config);
      emit(io, {config}, options.format);
    });

  return program;
}

export async function runCli(argv: string[], options: RunCliOptions = {}): Promise<CliResult> {
  const io = new MemoryIo();
  const cwd = options.cwd ?? process.cwd();
  const program = createProgram(io, cwd, options.runtimeFactory ?? createRuntime, options.diagnosticRunner ?? new NodeProcessRunner());
  try {
    await program.parseAsync(['node', 'zdoc-localize', ...argv]);
    return io.result(0);
  } catch (error) {
    if (error instanceof CommanderError) {
      if (error.code === 'commander.version' || error.code === 'commander.helpDisplayed') return io.result(0);
      return io.result(error.exitCode || 2);
    }
    const localizeError = asLocalizeError(error);
    io.writeStderr(`${JSON.stringify(toErrorEnvelope(localizeError))}\n`);
    return io.result(localizeError.exitCode);
  }
}
