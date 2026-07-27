import type {MutationJournal, VerifiedOperationEvidence} from 'feishu-docx-engine';

import {LocalizeError} from '../domain/errors.js';
import type {RunRecord} from '../domain/model.js';
import type {RegistryStore, SnapshotReference, SnapshotStore} from './ports.js';

interface EngineApplyJournalInput {
  run: RunRecord;
  operationIds: string[];
  registry: RegistryStore;
  snapshots: SnapshotStore;
  now(): Date;
}

export class EngineApplyJournal implements MutationJournal {
  private run: RunRecord;
  private readonly evidence: VerifiedOperationEvidence[];
  private evidenceRef?: SnapshotReference;

  constructor(private readonly input: EngineApplyJournalInput) {
    this.run = input.run;
    this.evidence = Array.isArray(input.run.metadata?.engineEvidence)
      ? structuredClone(input.run.metadata.engineEvidence) as VerifiedOperationEvidence[]
      : [];
    this.evidenceRef = input.run.metadata?.engineEvidenceRef as SnapshotReference | undefined;
  }

  async recordVerified(evidence: VerifiedOperationEvidence): Promise<void> {
    if (this.evidence.some((item) => item.operationId === evidence.operationId)) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'engine_evidence_duplicate',
        message: `Engine returned duplicate verified evidence for ${evidence.operationId}.`,
      });
    }
    const expectedOperationId = this.input.operationIds[this.evidence.length];
    if (evidence.operationId !== expectedOperationId) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'engine_evidence_out_of_order',
        message: `Engine returned ${evidence.operationId}; expected ${expectedOperationId ?? 'no further operation'}.`,
      });
    }
    if (evidence.verified !== true) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'engine_evidence_unverified',
        message: `Engine evidence for ${evidence.operationId} is not verified.`,
      });
    }

    const nextEvidence = [...this.evidence, structuredClone(evidence)];
    const evidenceRef = await this.input.snapshots.putBundle({
      runId: this.run.runId,
      files: {'apply-evidence.json': `${JSON.stringify(nextEvidence, null, 2)}\n`},
    });
    const updated: RunRecord = {
      ...this.run,
      updatedAt: this.input.now().toISOString(),
      metadata: {
        ...this.run.metadata,
        engineEvidence: nextEvidence,
        engineEvidenceRef: evidenceRef,
        appliedOperations: nextEvidence.length,
        lastVerifiedTargetHash: evidence.afterSnapshotHash,
      },
    };
    await this.input.registry.saveRun(updated);
    this.evidence.splice(0, this.evidence.length, ...nextEvidence);
    this.evidenceRef = evidenceRef;
    this.run = updated;
  }

  currentRun(): RunRecord {
    return this.run;
  }

  verifiedEvidence(): VerifiedOperationEvidence[] {
    return structuredClone(this.evidence);
  }

  currentEvidenceRef(): SnapshotReference | undefined {
    return this.evidenceRef;
  }
}
