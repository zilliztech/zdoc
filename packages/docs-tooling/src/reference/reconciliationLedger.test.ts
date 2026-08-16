import {describe, expect, it} from 'vitest';

import {appendReferenceReconciliationLedger, parseReferenceReconciliationLedger} from './reconciliationLedger.ts';
import {validateReferenceReconciliationLedger} from '../validation/translation.ts';

const entry = {
  operationId: `sha256:${'1'.repeat(64)}`,
  planSha256: `sha256:${'2'.repeat(64)}`,
  resultSha256: `sha256:${'3'.repeat(64)}`,
  target: 'zh-CN-reference' as const,
  group: 'python',
  sourceCheckpointSha: '4'.repeat(40),
  targetBaselineSha: '5'.repeat(40),
  sourcePath: 'content/en/reference/api/python/old.md',
  targetPath: 'content/zh-CN/reference/api/python/old.md',
  kind: 'delete_target' as const,
  status: 'applied' as const,
  removedPaths: ['content/zh-CN/reference/api/python/old.md'],
  removedStateKeys: ['content/en/reference/api/python/old.md'],
};

describe('Reference reconciliation ledger', () => {
  it('appends canonically and treats an identical replay as idempotent', () => {
    const first = appendReferenceReconciliationLedger(undefined, [entry]);
    expect(appendReferenceReconciliationLedger(first, [entry])).toEqual(first);
  });

  it('rejects conflicting reuse of an operation identity', () => {
    const first = appendReferenceReconciliationLedger(undefined, [entry]);
    expect(() => appendReferenceReconciliationLedger(first, [{...entry, targetPath: 'content/zh-CN/reference/api/python/other.md'}])).toThrow(/identity conflict/i);
  });

  it('rejects unsafe paths, duplicates, and unknown fields', () => {
    expect(() => parseReferenceReconciliationLedger({...appendReferenceReconciliationLedger(undefined, [entry]), extra: true})).toThrow();
    expect(() => appendReferenceReconciliationLedger(undefined, [{...entry, targetPath: '../escape.md'}])).toThrow(/safe normalized/i);
  });

  it('is accepted by the Reference validation boundary', () => {
    expect(() => validateReferenceReconciliationLedger(appendReferenceReconciliationLedger(undefined, [entry]))).not.toThrow();
  });
});
