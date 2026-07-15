import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {runCli} from '../src/cli/program.js';

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
        ]),
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

  it('exposes plan completion, apply, and recovery command contracts', async () => {
    const planHelp = await runCli(['plan', '--help']);
    const applyHelp = await runCli(['apply', '--help']);
    const recoverHelp = await runCli(['recover', '--help']);

    expect(planHelp.stdout).toContain('complete');
    expect(applyHelp.stdout).toContain('--review');
    expect(applyHelp.stdout).toContain('--run');
    expect(recoverHelp.stdout).toContain('inspect');
  });
});
