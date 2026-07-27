import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import type {VerifiedOperationEvidenceV2} from 'feishu-docx-engine';
import {describe, expect, it} from 'vitest';

import {EngineApplyJournal} from '../src/application/engine-journal.js';
import {LocalRegistryStore} from '../src/storage/local-registry-store.js';
import {LocalSnapshotStore} from '../src/storage/local-snapshot-store.js';

function evidence(operationId: string, createdBlockIds: string[]): VerifiedOperationEvidenceV2 {
  return {
    operationId,
    createdBlockIds,
    revision: operationId === 'op-list' ? '5' : '6',
    afterSnapshotHash: `${operationId}-hash`,
    verified: true,
    outputs: [{
      slotId: 'created-roots',
      kind: 'block-roots',
      rootBlockIds: [createdBlockIds[0]!],
      createdBlockIds,
    }],
  };
}

describe('EngineApplyJournal', () => {
  it('persists each verified operation before allowing the next one', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-engine-journal-'));
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const run = {
      runId: 'run-engine-journal', pairId: 'pair-engine-journal', state: 'applying' as const,
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {kind: 'initialization'},
    };
    await registry.saveRun(run);
    const journal = new EngineApplyJournal({
      run,
      operationIds: ['op-list', 'op-table'],
      registry,
      snapshots,
      now: () => new Date('2026-07-27T00:01:00.000Z'),
    });

    await journal.recordVerified(evidence('op-list', ['list-root', 'list-child']));
    const afterList = await registry.getRun(run.runId);
    expect(afterList?.metadata?.engineEvidence).toEqual([
      expect.objectContaining({operationId: 'op-list', createdBlockIds: ['list-root', 'list-child']}),
    ]);
    const listEvidenceRef = afterList?.metadata?.engineEvidenceRef as Parameters<LocalSnapshotStore['getBundle']>[0];
    await expect(snapshots.getBundle(listEvidenceRef)).resolves.toMatchObject({
      files: {'apply-evidence.json': expect.stringContaining('list-child')},
    });

    await journal.recordVerified(evidence('op-table', ['table-root']));
    const afterTable = await registry.getRun(run.runId);
    expect(afterTable?.metadata?.engineEvidence).toEqual([
      expect.objectContaining({operationId: 'op-list'}),
      expect.objectContaining({operationId: 'op-table', createdBlockIds: ['table-root']}),
    ]);
    expect(afterTable?.metadata?.engineEvidenceRef).not.toEqual(listEvidenceRef);
  });

  it('rejects duplicate and out-of-order operation evidence', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'zdoc-localize-engine-journal-order-'));
    const registry = new LocalRegistryStore(cwd);
    const snapshots = new LocalSnapshotStore(cwd);
    const run = {
      runId: 'run-engine-journal-order', pairId: 'pair-engine-journal', state: 'applying' as const,
      createdAt: '2026-07-27T00:00:00.000Z', updatedAt: '2026-07-27T00:00:00.000Z',
      metadata: {kind: 'initialization'},
    };
    await registry.saveRun(run);
    const journal = new EngineApplyJournal({
      run,
      operationIds: ['op-list', 'op-table'],
      registry,
      snapshots,
      now: () => new Date('2026-07-27T00:01:00.000Z'),
    });

    await expect(journal.recordVerified(evidence('op-table', ['table-root']))).rejects.toMatchObject({
      subtype: 'engine_evidence_out_of_order',
    });
    await journal.recordVerified(evidence('op-list', ['list-root']));
    await expect(journal.recordVerified(evidence('op-list', ['list-root']))).rejects.toMatchObject({
      subtype: 'engine_evidence_duplicate',
    });
  });
});
