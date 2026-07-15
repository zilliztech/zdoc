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
});
