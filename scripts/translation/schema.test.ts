import {describe, expect, it} from 'vitest';
import type {
  ReconciliationAuthorization,
  ReconciliationEvidence,
  ReconciliationOperation,
  ReconciliationPlan,
  ReconciliationResult,
} from './schema.ts';

describe('translation reconciliation schema types', () => {
  it('describe the strict schema-v1 plan and result documents', () => {
    const evidence = {
      sourceExistedAtBaseline: true,
      sourceMissingAtCheckpoint: true,
      targetExistsAtBaseline: true,
      mappingIsCanonical: true,
      ownedByGroup: true,
      preserved: false,
      generatorCompletenessReceipt: null,
    } satisfies ReconciliationEvidence;
    const authorization = {
      status: 'approved',
      method: 'automatic',
      ruleId: 'test-rule',
      receiptSha256: null,
    } satisfies ReconciliationAuthorization;
    const operation = {
      operationId: `sha256:${'1'.repeat(64)}`,
      kind: 'delete_target',
      sourcePath: 'content/en/reference/api/python/python/old.md',
      targetPath: 'content/zh-CN/reference/api/python/python/old.md',
      replacementSourcePath: null,
      replacementTargetPath: null,
      reason: 'source_deleted',
      evidence,
      authorization,
    } satisfies ReconciliationOperation;
    const plan = {
      schemaVersion: 1,
      document: 'translation-reconciliation-plan',
      target: 'zh-CN-reference',
      group: 'python',
      toolingSha: '1'.repeat(40),
      sourceBaselineSha: '2'.repeat(40),
      sourceCheckpointSha: '3'.repeat(40),
      targetBaselineSha: '4'.repeat(40),
      policyId: 'test-policy',
      operations: [operation],
      planSha256: `sha256:${'2'.repeat(64)}`,
    } satisfies ReconciliationPlan;
    const result = {
      schemaVersion: 1,
      document: 'translation-reconciliation-result',
      planSha256: plan.planSha256,
      targetBaselineSha: plan.targetBaselineSha,
      status: 'applied',
      operations: [{operationId: operation.operationId, status: 'applied', removedPaths: [operation.targetPath], removedStateKeys: [operation.sourcePath]}],
      resultSha256: `sha256:${'3'.repeat(64)}`,
    } satisfies ReconciliationResult;

    expect(plan.operations[0].authorization.status).toBe('approved');
    expect(result.operations[0].status).toBe('applied');
  });
});
