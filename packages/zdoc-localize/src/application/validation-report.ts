export type ValidationStatus = 'passed' | 'failed' | 'skipped';

export interface ValidationCheck {
  id: string;
  status: ValidationStatus;
  detail?: string;
  reason?: string;
}

export interface ValidationReport {
  ok: boolean;
  generatedAt: string;
  summary: {passed: number; failed: number; skipped: number};
  checks: ValidationCheck[];
}

export function buildValidationReport(
  checks: ValidationCheck[],
  generatedAt = new Date().toISOString(),
): ValidationReport {
  const summary = checks.reduce((counts, check) => {
    counts[check.status] += 1;
    return counts;
  }, {passed: 0, failed: 0, skipped: 0});
  return {
    ok: summary.failed === 0,
    generatedAt,
    summary,
    checks,
  };
}
