import {mkdtemp, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {runCli} from '../src/cli/program.js';
import type {ProcessCall, ProcessResult, ProcessRunner} from '../src/adapters/process-runner.js';

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
        cliVersion: '0.1.0',
        schemaVersion: 1,
        commands: expect.arrayContaining([
          'doctor',
          'pair',
          'bootstrap',
          'plan',
          'apply',
          'status',
          'recover',
        ]),
        features: expect.arrayContaining([
          'external-translation-provider',
          'review-markdown-v1',
          'existing-empty-target-initialization-v1',
          'manual-synced-reference-v1',
          'whiteboard-mirror-v1',
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
      {exitCode: 0, stdout: '0.3.0\n', stderr: ''},
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
        expect.objectContaining({id: 'feishu-md-sync', status: 'passed'}),
    ]));
  });

  it('exposes plan completion, apply, and recovery command contracts', async () => {
    const planHelp = await runCli(['plan', '--help']);
    const applyHelp = await runCli(['apply', '--help']);
    const recoverHelp = await runCli(['recover', '--help']);

    expect(planHelp.stdout).toContain('complete');
    expect(planHelp.stdout).toContain('classify');
    expect(applyHelp.stdout).toContain('--review');
    expect(applyHelp.stdout).toContain('--run');
    expect(applyHelp.stdout).toContain('--preview');
    expect(applyHelp.stdout).toContain('--approval-token');
    expect(recoverHelp.stdout).toContain('inspect');
  });

  it('initializes explicit local workspace configuration', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-init-'));
    const result = await runCli(['init', '--mode', 'local', '--format', 'json'], {cwd});

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout).data.config.mode).toBe('local');
    expect(JSON.parse(await readFile(join(cwd, '.zdoc-localize', 'config.json'), 'utf8'))).toEqual({mode: 'local'});
  });
});
