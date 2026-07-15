import {describe, expect, it} from 'vitest';

import {buildValidationReport} from '../src/application/validation-report.js';

describe('validation report', () => {
  it('summarizes passed, failed, and skipped checks without hiding skipped live validation', () => {
    const report = buildValidationReport([
      {id: 'typecheck', status: 'passed', detail: 'TypeScript passed.'},
      {id: 'unit-tests', status: 'passed', detail: '46 tests passed.'},
      {id: 'package-smoke', status: 'passed', detail: 'Packed CLI ran.'},
      {id: 'live-feishu-write', status: 'skipped', reason: 'No production pair or registry target configured'},
    ]);

    expect(report.summary).toEqual({passed: 3, failed: 0, skipped: 1});
    expect(report.checks.find((check) => check.id === 'live-feishu-write')).toEqual({
      id: 'live-feishu-write',
      status: 'skipped',
      reason: 'No production pair or registry target configured',
    });
    expect(report.ok).toBe(true);
  });

  it('marks the report failed when any required check fails', () => {
    const report = buildValidationReport([{id: 'tests', status: 'failed', detail: 'One test failed.'}]);
    expect(report.ok).toBe(false);
    expect(report.summary.failed).toBe(1);
  });
});
