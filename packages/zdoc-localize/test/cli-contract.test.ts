import {mkdtemp, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {runCli} from '../src/cli/program.js';
import type {ProcessCall, ProcessResult, ProcessRunner} from '../src/adapters/process-runner.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';

class DiagnosticRunner implements ProcessRunner {
  readonly calls: ProcessCall[] = [];
  constructor(private readonly results: ProcessResult[]) {}
  async run(call: ProcessCall): Promise<ProcessResult> {
    this.calls.push(call);
    return this.results.shift()!;
  }
}

describe('CLI contract', () => {
  it('returns versioned capabilities as a JSON success envelope', async () => {
    const result = await runCli(['capabilities', '--format', 'json']);

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      data: {
        cliVersion: '0.1.1',
        schemaVersion: 1,
        docxEngine: {
          version: '0.2.0',
          schemaVersion: 2,
          capabilities: expect.arrayContaining([
            'nested-list-create-v1',
            'native-table-create-v1',
            'whiteboard-overwrite-v1',
            'partial-write-evidence-v1',
            'batch-operation-output-refs-v1',
            'whiteboard-create-copy-v1',
            'contiguous-range-replace-v1',
          ]),
        },
        commands: expect.arrayContaining([
          'doctor',
          'pair',
          'bootstrap',
          'plan',
          'apply',
          'manual',
          'status',
          'recover',
        ]),
        features: expect.arrayContaining([
          'external-translation-provider',
          'review-markdown-v1',
          'existing-empty-target-initialization-v1',
          'manual-synced-reference-v1',
          'whiteboard-mirror-v1',
          'docx-engine-v1',
          'structured-list-localization-v1',
          'native-table-localization-v1',
        ]),
      },
    });
  });

  it('exposes the exact typed Feishu registry schema', async () => {
    const result = await runCli(['registry', 'schema', '--format', 'json']);

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      data: {
        baseName: 'ZDoc Localization Registry',
        timeZone: 'Asia/Shanghai',
        tables: {
          documentPairs: {name: 'document_pairs'},
          glossary: {name: 'glossary'},
          localizationRuns: {
            name: 'localization_runs',
            fields: expect.arrayContaining([expect.objectContaining({name: 'state', type: 'select', multiple: false})]),
          },
        },
      },
    });
  });

  it('registers and lists a document pair in an isolated workspace', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-cli-'));

    const added = await runCli([
      'pair', 'add', '--pair', 'pair-1', '--source', 'source-url', '--target', 'target-url',
      '--mode', 'mirror', '--format', 'json',
    ], {cwd});
    const listed = await runCli(['pair', 'list', '--format', 'json'], {cwd});

    expect(added.exitCode).toBe(0);
    expect(JSON.parse(added.stdout).data.pair).toMatchObject({pairId: 'pair-1', status: 'needs_bootstrap'});
    expect(JSON.parse(listed.stdout).data.pairs).toEqual([
      expect.objectContaining({pairId: 'pair-1', sourceDocUrl: 'source-url', targetDocUrl: 'target-url'}),
    ]);
  });

  it('runs offline doctor checks without accessing Feishu', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-doctor-'));
    const result = await runCli(['doctor', '--offline', '--format', 'json'], {cwd});

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      data: {
        mode: 'offline',
        checks: [
          {id: 'node-version', status: 'passed'},
          {id: 'workspace-write', status: 'passed'},
        ],
      },
    });
  });

  it('runs explicit external diagnostics in online mode', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-doctor-online-'));
    await runCli(['init', '--mode', 'local', '--format', 'json'], {cwd});
    const diagnostics = new DiagnosticRunner([
      {exitCode: 0, stdout: '1.2.3\n', stderr: ''},
      {exitCode: 0, stdout: '{"ok":true,"data":{"authenticated":true}}\n', stderr: ''},
    ]);

    const result = await runCli(['doctor', '--format', 'json'], {cwd, diagnosticRunner: diagnostics});

    expect(result.exitCode).toBe(0);
    const data = JSON.parse(result.stdout).data;
    expect(data).toMatchObject({mode: 'local', healthy: true});
    expect(data.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({id: 'lark-cli-version', status: 'passed'}),
        expect.objectContaining({id: 'lark-auth', status: 'passed'}),
        expect.objectContaining({id: 'registry-access', status: 'passed'}),
        expect.objectContaining({id: 'sqlite', status: 'passed'}),
        expect.objectContaining({id: 'feishu-docx-engine', status: 'passed', detail: '0.2.0'}),
    ]));
    expect(diagnostics.calls).toEqual([
      {executable: 'lark-cli', args: ['--version']},
      {executable: 'lark-cli', args: ['auth', 'status', '--json', '--verify']},
    ]);
  });

  it('exposes plan completion, apply, and recovery command contracts', async () => {
    const planHelp = await runCli(['plan', '--help']);
    const applyHelp = await runCli(['apply', '--help']);
    const recoverHelp = await runCli(['recover', '--help']);
    const manualHelp = await runCli(['manual', '--help']);

    expect(planHelp.stdout).toContain('complete');
    expect(planHelp.stdout).toContain('classify');
    expect(applyHelp.stdout).toContain('--review');
    expect(applyHelp.stdout).toContain('--run');
    expect(applyHelp.stdout).toContain('--preview');
    expect(applyHelp.stdout).toContain('--approval-token');
    expect(recoverHelp.stdout).toContain('inspect');
    expect(manualHelp.stdout).toContain('verify');
  });

  it('projects manual-action status without exposing internal placeholder or recovery payloads', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-status-'));
    const registry = new LocalRegistryStore(cwd);
    await registry.saveRun({
      runId: 'run-initialize', pairId: 'pair-1', state: 'manual_action_required',
      createdAt: '2026-07-16T00:00:00.000Z', updatedAt: '2026-07-16T00:01:00.000Z',
      metadata: {
        manualActions: [{
          operationId: 'sync-1', sourceDocumentId: 'source-doc', sourceBlockId: 'sync-source',
          sourceUrl: 'https://example.feishu.cn/docx/source-doc#sync-source',
          placeholderBlockId: 'private-placeholder', marker: 'private-marker',
        }],
        prewriteRef: {provider: 'drive', id: 'private-snapshot'},
      },
    });

    const result = await runCli(['status', '--run', 'run-initialize', '--format', 'json'], {cwd});
    const data = JSON.parse(result.stdout).data;

    expect(data).toMatchObject({
      runId: 'run-initialize', state: 'manual_action_required',
      manualActions: [{
        operationId: 'sync-1', sourceDocumentId: 'source-doc', sourceBlockId: 'sync-source',
        sourceUrl: 'https://example.feishu.cn/docx/source-doc#sync-source',
      }],
    });
    expect(JSON.stringify(data)).not.toContain('private-placeholder');
    expect(JSON.stringify(data)).not.toContain('private-snapshot');
  });

  it('initializes explicit local workspace configuration', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-init-'));
    const result = await runCli(['init', '--mode', 'local', '--format', 'json'], {cwd});

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout).data.config.mode).toBe('local');
    expect(JSON.parse(await readFile(join(cwd, '.zdoc-localize', 'config.json'), 'utf8'))).toEqual({mode: 'local'});
  });
});
