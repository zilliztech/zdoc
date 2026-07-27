import {
  assertPreparedMutationBatchIntegrity,
  canonicalWhiteboardRawHash,
  calloutToXml,
  providerBlocksToXml,
  toProviderTree,
  type AssessRecoveryInput,
  type DesiredListNode,
  type DesiredNode,
  type DocumentSnapshot,
  type InlineContent,
  type MutationIntentV2,
  type PartialMutationEvidence,
  type PreparedMutationBatch,
  type MutationOutcome,
  type RecoveryAssessment,
  type VerifiedOperationEvidence,
} from 'feishu-docx-engine';
import {SaxesParser} from 'saxes';

import type {DocumentPair, RunRecord, SemanticNode} from '../domain/model.js';
import {LocalizeError} from '../domain/errors.js';
import {canonicalHash} from '../domain/hash.js';
import {parseFeishuDocument} from '../domain/xml-parser.js';
import {canonicalWhiteboard} from '../domain/whiteboard.js';
import type {LocalizationPlan} from '../domain/review.js';
import {verifyManualSyncedReferences} from '../domain/native-sync.js';
import type {ManualSyncedReferenceAction} from './manual-actions.js';
import type {
  DocumentGateway,
  LocalizationDocxEngine,
  RegistryStore,
  SnapshotReference,
  SnapshotStore,
  WhiteboardGateway,
} from './ports.js';

export interface EngineRecoveryInspection {
  runId: string;
  state: RunRecord['state'];
  appliedOperations: number;
  prewriteRef: SnapshotReference;
  disposition: RecoveryAssessment['disposition'];
  batchFingerprint: string;
  completedOperationIds?: string[];
  pendingOperationIds?: string[];
  inferredOperations?: VerifiedOperationEvidence[];
  reverseIntents?: Extract<RecoveryAssessment, {disposition: 'reverse_possible'}>['reverseIntents'];
  reason?: string;
  safeToRecover: boolean;
  recoveryToken?: string;
}

function requiredReference(run: RunRecord, field: string): SnapshotReference {
  const value = run.metadata?.[field] as SnapshotReference | undefined;
  if (!value) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_evidence_missing',
      message: `Engine recovery is missing ${field}.`,
    });
  }
  return value;
}

async function immutableJson<T>(
  snapshots: SnapshotStore,
  reference: SnapshotReference,
  filename: string,
): Promise<T> {
  const value = (await snapshots.getBundle(reference)).files[filename];
  if (!value) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_evidence_missing',
      message: `Engine recovery snapshot is missing ${filename}.`,
    });
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_evidence_malformed',
      message: `Engine recovery snapshot ${filename} is not valid JSON.`, details: String(error),
    });
  }
}

export async function inspectEngineRecovery(input: {
  run: RunRecord;
  engine: LocalizationDocxEngine;
  snapshots: SnapshotStore;
}): Promise<EngineRecoveryInspection> {
  const {run, engine, snapshots} = input;
  const previewBundleRef = requiredReference(run, 'previewBundleRef');
  const prewriteRef = requiredReference(run, 'prewriteRef');
  const batch = await immutableJson<PreparedMutationBatch>(snapshots, previewBundleRef, 'prepared-batch.json');
  assertPreparedMutationBatchIntegrity(batch);
  if (batch.schemaVersion !== 2 || batch.engineVersion !== '0.2.0') {
    throw new LocalizeError({
      type: 'compatibility', subtype: 'engine_recovery_batch_unsupported',
      message: `Plan v3 recovery requires an Engine 0.2.0 schema-v2 batch, received ${batch.engineVersion}/schema-${batch.schemaVersion}.`,
    });
  }
  if (batch.fingerprint !== run.metadata?.engineBatchFingerprint) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_batch_mismatch',
      message: 'The recovery batch does not match the exact approved Engine fingerprint.',
    });
  }
  const prewriteSnapshot = await immutableJson<AssessRecoveryInput['checkpoint']['prewriteSnapshot']>(
    snapshots, prewriteRef, 'target-prewrite.snapshot.json',
  );
  const completedOperations = (run.metadata?.engineEvidence as VerifiedOperationEvidence[] | undefined) ?? [];
  const evidenceRef = run.metadata?.engineEvidenceRef as SnapshotReference | undefined;
  if (!evidenceRef && completedOperations.length > 0) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_evidence_missing',
      message: 'Non-empty Engine recovery evidence has no immutable journal snapshot.',
    });
  }
  const immutableEvidence = evidenceRef
    ? await immutableJson<VerifiedOperationEvidence[]>(snapshots, evidenceRef, 'apply-evidence.json')
    : [];
  if (canonicalHash(immutableEvidence) !== canonicalHash(completedOperations)) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_evidence_mismatch',
      message: 'Engine recovery metadata does not match the immutable operation journal.',
    });
  }
  let partialMutationEvidence: PartialMutationEvidence | undefined;
  const partialRef = run.metadata?.enginePartialMutationEvidenceRef as SnapshotReference | undefined;
  if (run.metadata?.enginePartialMutationEvidence !== undefined) {
    if (!partialRef) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'engine_recovery_evidence_missing',
        message: 'Engine partial mutation evidence has no immutable snapshot reference.',
      });
    }
    partialMutationEvidence = run.metadata.enginePartialMutationEvidence as PartialMutationEvidence;
    const immutablePartial = await immutableJson<PartialMutationEvidence>(
      snapshots, partialRef, 'partial-mutation-evidence.json',
    );
    if (canonicalHash(immutablePartial) !== canonicalHash(partialMutationEvidence)) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'engine_recovery_evidence_mismatch',
        message: 'Engine partial mutation evidence does not match its immutable snapshot.',
      });
    }
  }
  const checkpoint: AssessRecoveryInput['checkpoint'] = {
    completedOperations,
    prewriteSnapshot,
    ...(partialMutationEvidence ? {partialMutationEvidence} : {}),
  };
  const assessment = await engine.assessRecovery({batch, checkpoint});
  const base = {
    runId: run.runId,
    state: run.state,
    appliedOperations: completedOperations.length,
    prewriteRef,
    disposition: assessment.disposition,
    batchFingerprint: batch.fingerprint,
  };
  if (assessment.disposition === 'manual_inspection_required') {
    return {...base, reason: assessment.reason, safeToRecover: false};
  }
  if (assessment.disposition === 'resume_possible') {
    return {
      ...base,
      completedOperationIds: assessment.completedOperationIds,
      pendingOperationIds: assessment.pendingOperationIds,
      ...(assessment.inferredOperations ? {inferredOperations: assessment.inferredOperations} : {}),
      safeToRecover: false,
    };
  }
  const recoveryToken = canonicalHash({
    runId: run.runId,
    batchFingerprint: batch.fingerprint,
    checkpoint,
    reverseIntents: assessment.reverseIntents,
  });
  return {
    ...base,
    reverseIntents: assessment.reverseIntents,
    safeToRecover: true,
    recoveryToken,
  };
}

export async function inspectRecoveryPhase(input: {
  run: RunRecord;
  engine: LocalizationDocxEngine;
  snapshots: SnapshotStore;
}): Promise<EngineRecoveryInspection> {
  const {run, engine, snapshots} = input;
  const checkpointRef = requiredReference(run, 'recoveryPhaseRef');
  const batch = await immutableJson<PreparedMutationBatch>(snapshots, checkpointRef, 'prepared-batch.json');
  assertPreparedMutationBatchIntegrity(batch);
  if (![1, 2].includes(batch.schemaVersion) || batch.engineVersion !== '0.2.0') {
    throw new LocalizeError({
      type: 'compatibility', subtype: 'engine_recovery_batch_unsupported',
      message: `Recovery-phase inspection requires an Engine 0.2.0 schema-v1/v2 batch, received ${batch.engineVersion}/schema-${batch.schemaVersion}.`,
    });
  }
  if (batch.fingerprint !== run.metadata?.recoveryPhaseBatchFingerprint) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_batch_mismatch',
      message: 'The recovery-phase batch does not match its immutable fingerprint.',
    });
  }
  const prewriteSnapshot = await immutableJson<DocumentSnapshot>(
    snapshots, checkpointRef, 'target-prewrite.snapshot.json',
  );
  const completedOperations = (run.metadata?.reverseEngineEvidence as VerifiedOperationEvidence[] | undefined) ?? [];
  const immutableEvidence = await immutableJson<VerifiedOperationEvidence[]>(
    snapshots, checkpointRef, 'apply-evidence.json',
  );
  if (canonicalHash(immutableEvidence) !== canonicalHash(completedOperations)) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_evidence_mismatch',
      message: 'Recovery-phase metadata does not match its immutable operation journal.',
    });
  }
  const partialMutationEvidence = run.metadata?.reversePartialMutationEvidence as PartialMutationEvidence | undefined;
  if (partialMutationEvidence) {
    const immutablePartial = await immutableJson<PartialMutationEvidence>(
      snapshots, checkpointRef, 'partial-mutation-evidence.json',
    );
    if (canonicalHash(immutablePartial) !== canonicalHash(partialMutationEvidence)) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'engine_recovery_evidence_mismatch',
        message: 'Recovery-phase partial mutation evidence changed after persistence.',
      });
    }
  }
  const checkpoint: AssessRecoveryInput['checkpoint'] = {
    completedOperations,
    prewriteSnapshot,
    ...(partialMutationEvidence ? {partialMutationEvidence} : {}),
  };
  const assessment = await engine.assessRecovery({batch, checkpoint});
  const base = {
    runId: run.runId,
    state: run.state,
    appliedOperations: completedOperations.length,
    prewriteRef: checkpointRef,
    disposition: assessment.disposition,
    batchFingerprint: batch.fingerprint,
  };
  if (assessment.disposition === 'manual_inspection_required') {
    return {...base, reason: assessment.reason, safeToRecover: false};
  }
  if (assessment.disposition === 'resume_possible') {
    return {
      ...base,
      completedOperationIds: assessment.completedOperationIds,
      pendingOperationIds: assessment.pendingOperationIds,
      ...(assessment.inferredOperations ? {inferredOperations: assessment.inferredOperations} : {}),
      safeToRecover: false,
    };
  }
  return {
    ...base,
    reverseIntents: assessment.reverseIntents,
    safeToRecover: true,
    recoveryToken: canonicalHash({
      runId: run.runId,
      recoveryPhase: true,
      batchFingerprint: batch.fingerprint,
      checkpoint,
      reverseIntents: assessment.reverseIntents,
    }),
  };
}

export function assertCurrentPlanVersion(planVersion: number): void {
  if (planVersion >= 3) return;
  throw new LocalizeError({
    type: 'stale_plan', subtype: 'legacy_plan_requires_regeneration',
    message: 'Plan version 1 or 2 must be regenerated before it can be previewed or applied.',
    hint: 'Create a fresh plan version 3 from the current document pair.',
  });
}

export class RecoveryApplyJournal {
  private run: RunRecord;
  private evidence: VerifiedOperationEvidence[] = [];
  private evidenceRef?: SnapshotReference;

  constructor(private readonly input: {
    run: RunRecord;
    operationIds: string[];
    registry: RegistryStore;
    snapshots: SnapshotStore;
    now: () => Date;
    metadataKeys?: {
      evidence: string;
      evidenceRef: string;
      appliedOperations: string;
    };
  }) {
    this.run = input.run;
  }

  currentRun(): RunRecord { return this.run; }
  verifiedEvidence(): VerifiedOperationEvidence[] { return structuredClone(this.evidence); }
  currentEvidenceRef(): SnapshotReference | undefined { return this.evidenceRef; }

  async recordVerified(value: VerifiedOperationEvidence): Promise<void> {
    if (value.verified !== true) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_evidence_unverified', message: `Recovery evidence ${value.operationId} is not verified.`});
    }
    const expected = this.input.operationIds[this.evidence.length];
    if (this.evidence.some((item) => item.operationId === value.operationId)) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_evidence_duplicate', message: `Recovery evidence ${value.operationId} was recorded twice.`});
    }
    if (value.operationId !== expected) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_evidence_out_of_order', message: `Expected recovery evidence ${expected ?? '(none)'}, received ${value.operationId}.`});
    }
    const next = [...this.evidence, structuredClone(value)];
    const evidenceRef = await this.input.snapshots.putBundle({
      runId: this.run.runId,
      files: {'recovery-apply-evidence.json': `${JSON.stringify(next, null, 2)}\n`},
    });
    const keys = this.input.metadataKeys ?? {
      evidence: 'reverseEngineEvidence',
      evidenceRef: 'reverseEngineEvidenceRef',
      appliedOperations: 'reverseAppliedOperations',
    };
    this.run = {
      ...this.run,
      updatedAt: this.input.now().toISOString(),
      metadata: {
        ...this.run.metadata,
        [keys.evidence]: next,
        [keys.evidenceRef]: evidenceRef,
        [keys.appliedOperations]: next.length,
      },
    };
    await this.input.registry.saveRun(this.run);
    this.evidence = next;
    this.evidenceRef = evidenceRef;
  }
}

export function assertRecoveryOutcome(input: {
  batch: PreparedMutationBatch;
  evidence: VerifiedOperationEvidence[];
  outcome: MutationOutcome;
  expectedFinalSnapshotHash: string;
}): void {
  if (
    canonicalHash(input.evidence) !== canonicalHash(input.outcome.operations)
    || input.evidence.length !== input.batch.steps.length
    || input.evidence.some((entry, index) => entry.operationId !== input.batch.steps[index]?.operationId)
    || input.outcome.finalSnapshot.canonicalHash !== input.expectedFinalSnapshotHash
  ) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'engine_recovery_outcome_mismatch',
      message: 'Engine recovery outcome does not cover the exact approved recovery batch.',
    });
  }
}

interface XmlElement {
  name: string;
  attributes: Record<string, string>;
  children: Array<XmlElement | string>;
}

function parseRoot(xml: string): XmlElement {
  const roots: XmlElement[] = [];
  const stack: XmlElement[] = [];
  const parser = new SaxesParser({fragment: true});
  parser.on('opentag', (tag) => {
    const element: XmlElement = {
      name: tag.name,
      attributes: Object.fromEntries(Object.entries(tag.attributes).map(([key, value]) => [
        key, typeof value === 'string' ? value : value.value,
      ])),
      children: [],
    };
    const parent = stack.at(-1);
    if (parent) parent.children.push(element);
    else roots.push(element);
    stack.push(element);
  });
  parser.on('text', (value) => stack.at(-1)?.children.push(value));
  parser.on('cdata', (value) => stack.at(-1)?.children.push(value));
  parser.on('closetag', () => { stack.pop(); });
  parser.write(xml).close();
  if (roots.length !== 1) throw new Error('Legacy recovery node must contain exactly one XML root.');
  return roots[0]!;
}

function inlineContent(children: XmlElement['children']): InlineContent[] {
  return children.flatMap((child): InlineContent[] => {
    if (typeof child === 'string') return child ? [{kind: 'text', text: child}] : [];
    const text = child.children.map((value) => typeof value === 'string' ? value : '').join('');
    if (child.children.some((value) => typeof value !== 'string')) throw new Error(`Nested inline ${child.name} is not lossless.`);
    if (child.name === 'code') return [{kind: 'code', text}];
    if (child.name === 'b' || child.name === 'strong') return [{kind: 'text', text, bold: true}];
    if (child.name === 'a' && child.attributes.href) return [{kind: 'link', text, url: child.attributes.href}];
    throw new Error(`Inline element ${child.name} is not losslessly supported.`);
  });
}

function desiredList(element: XmlElement): DesiredListNode {
  const items = element.children.filter((child): child is XmlElement => typeof child !== 'string');
  if (items.length === 0 || items.some((item) => item.name !== 'li')) throw new Error('Legacy list is malformed.');
  return {
    kind: 'list', ordered: element.name === 'ol',
    items: items.map((item) => {
      const nested = item.children.filter((child): child is XmlElement =>
        typeof child !== 'string' && (child.name === 'ol' || child.name === 'ul'));
      const inline = item.children.filter((child) =>
        typeof child === 'string' || (child.name !== 'ol' && child.name !== 'ul'));
      return {content: inlineContent(inline), children: nested.map(desiredList)};
    }),
  };
}

function desiredFromLegacyNode(node: SemanticNode): DesiredNode {
  const root = parseRoot(node.xml);
  if (node.kind === 'title') return {kind: 'title', content: inlineContent(root.children)};
  if (node.kind === 'paragraph') return {kind: 'paragraph', content: inlineContent(root.children)};
  if (node.kind === 'heading') {
    const level = Number(root.name.slice(1));
    if (!Number.isInteger(level) || level < 1 || level > 6) throw new Error('Legacy heading level is not supported.');
    return {kind: 'heading', level: level as 1 | 2 | 3 | 4 | 5 | 6, content: inlineContent(root.children)};
  }
  if (node.kind === 'list') return desiredList(root);
  if (node.kind === 'code') {
    const code = root.children.find((child): child is XmlElement => typeof child !== 'string' && child.name === 'code');
    if (!code) throw new Error('Legacy Code block has no code child.');
    return {
      kind: 'code', language: root.attributes.lang ?? 'plaintext',
      text: code.children.map((child) => typeof child === 'string' ? child : '').join(''),
      ...(root.attributes.caption ? {caption: root.attributes.caption} : {}),
    };
  }
  if (node.kind === 'quote') {
    const first = root.children[0];
    const body = root.children.length === 1 && first !== undefined && typeof first !== 'string' && first.name === 'p'
      ? first.children : root.children;
    return {kind: 'quote', content: inlineContent(body)};
  }
  if (node.kind === 'callout') {
    const paragraph = root.children.find((child): child is XmlElement => typeof child !== 'string' && child.name === 'p');
    if (!paragraph) throw new Error('Legacy Callout has no paragraph child.');
    const type = root.attributes.type
      ?? (root.attributes.emoji === '❗' ? 'warning' : root.attributes.emoji === '📘' ? 'note' : undefined);
    if (type !== 'note' && type !== 'warning') throw new Error('Legacy Callout presentation is not exactly representable.');
    return {kind: 'callout', calloutType: type, children: [{kind: 'paragraph', content: inlineContent(paragraph.children)}]};
  }
  throw new Error(`Legacy ${node.kind} is not exactly representable as an Engine desired node.`);
}

function inlineXml(content: InlineContent[]): string {
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  return content.map((part) => {
    const value = escape(part.text);
    if (part.kind === 'code') return `<code>${value}</code>`;
    if (part.kind === 'link') return `<a href="${escape(part.url)}">${value}</a>`;
    return part.bold ? `<b>${value}</b>` : value;
  }).join('');
}

function desiredXml(desired: DesiredNode): string {
  if (desired.kind === 'title') return `<title>${inlineXml(desired.content)}</title>`;
  if (desired.kind === 'callout') return calloutToXml(desired);
  return providerBlocksToXml(toProviderTree([desired]));
}

function losslessDesired(node: SemanticNode): DesiredNode {
  try {
    const desired = desiredFromLegacyNode(node);
    const roundTrip = parseFeishuDocument(desiredXml(desired), {documentId: 'roundtrip', revisionId: 0}).nodes[0];
    if (!roundTrip || roundTrip.fingerprint !== node.fingerprint) throw new Error('Engine desired node changes legacy XML semantics.');
    return desired;
  } catch (error) {
    throw new LocalizeError({
      type: 'unsupported_content', subtype: 'legacy_reverse_not_lossless',
      message: `Legacy block ${node.remote.blockId ?? node.nodeId} cannot be reversed losslessly through the Engine.`,
      details: String(error),
    });
  }
}

function snapshotNode(snapshot: DocumentSnapshot, blockId: string) {
  const node = snapshot.nodes.find((candidate) => candidate.blockId === blockId);
  if (!node) throw new LocalizeError({
    type: 'verification_failed', subtype: 'legacy_reverse_block_missing',
    message: `Engine snapshot is missing legacy recovery block ${blockId}.`,
  });
  return node;
}

function topLevelRoots(snapshot: DocumentSnapshot, blockIds: string[]): string[] {
  const selected = new Set(blockIds);
  return [...selected].filter((blockId) => {
    let parent = snapshotNode(snapshot, blockId).parentBlockId;
    while (parent) {
      if (selected.has(parent)) return false;
      parent = snapshot.nodes.find((node) => node.blockId === parent)?.parentBlockId;
    }
    return true;
  });
}

export interface PreparedLegacyReverse {
  batch: PreparedMutationBatch;
  currentSnapshot: DocumentSnapshot;
  currentTargetHash: string;
  restoreTargetHash: string;
  operations: Array<{operationId: string; kind: 'replace' | 'insert' | 'delete'}>;
  resourceHashes: Array<{operationId: string; token: string; currentRawHash: string; restoreRawHash: string}>;
}

export async function prepareLegacyReverse(input: {
  run: RunRecord;
  pair: DocumentPair;
  plan: LocalizationPlan;
  engine: LocalizationDocxEngine;
  docs: Pick<DocumentGateway, 'fetch'>;
  snapshots: SnapshotStore;
  whiteboards?: Pick<WhiteboardGateway, 'queryRaw'>;
}): Promise<PreparedLegacyReverse> {
  const targetUrl = input.pair.targetDocUrl;
  if (!targetUrl) throw new LocalizeError({type: 'configuration', subtype: 'target_missing', message: 'Legacy recovery has no target document.'});
  const [currentFetch, currentSnapshot] = await Promise.all([
    input.docs.fetch(targetUrl),
    input.engine.snapshot({kind: 'url', url: targetUrl}),
  ]);
  const current = parseFeishuDocument(currentFetch.content, {documentId: currentFetch.documentId, revisionId: currentFetch.revisionId});
  if (current.canonicalHash !== input.run.metadata?.lastVerifiedTargetHash
    || currentSnapshot.documentId !== currentFetch.documentId
    || currentSnapshot.revision !== String(currentFetch.revisionId)) {
    throw new LocalizeError({
      type: 'confirmation_required', subtype: 'reverse_not_proven_safe',
      message: 'Legacy XML and Engine snapshots do not prove the same verified target state.',
    });
  }
  const prewriteRef = input.run.metadata?.prewriteRef as SnapshotReference | undefined;
  if (!prewriteRef) throw new LocalizeError({type: 'verification_failed', subtype: 'prewrite_target_missing', message: 'Legacy recovery has no prewrite snapshot.'});
  const prewriteXml = (await input.snapshots.getBundle(prewriteRef)).files['target-prewrite.xml'];
  if (!prewriteXml) throw new LocalizeError({type: 'verification_failed', subtype: 'prewrite_target_missing', message: 'Legacy recovery has no prewrite XML.'});
  const prewrite = parseFeishuDocument(prewriteXml, {documentId: current.documentId, revisionId: 0});
  const planById = new Map(input.plan.operations.map((operation) => [operation.operationId, operation]));
  const applyLog = [...((input.run.metadata?.applyLog as Array<{
    operationId: string;
    resolvedBlockId?: string;
    resolvedBlockIds?: string[];
    sourceResourceHash?: string;
    targetResourceToken?: string;
    targetResourcePrewriteRef?: SnapshotReference;
    targetResourcePrewriteHash?: string;
  }> | undefined) ?? [])];
  if (input.run.state === 'manual_action_required') {
    const postAutomaticRef = input.run.metadata?.postAutomaticRef as SnapshotReference | undefined;
    const postAutomaticXml = postAutomaticRef
      ? (await input.snapshots.getBundle(postAutomaticRef)).files['target-after-automatic-apply.xml']
      : undefined;
    if (!postAutomaticXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'manual_target_snapshot_missing', message: 'Legacy manual recovery has no post-automatic target snapshot.'});
    }
    const plannedTarget = parseFeishuDocument(postAutomaticXml, {
      documentId: current.documentId,
      revisionId: current.revisionId,
    });
    const manual = verifyManualSyncedReferences(
      (input.run.metadata?.manualActions as ManualSyncedReferenceAction[] | undefined) ?? [],
      plannedTarget,
      current,
    );
    for (const entry of applyLog) {
      const resolved = manual.resolvedBlockIds.get(entry.operationId);
      if (resolved) {
        entry.resolvedBlockId = resolved;
        entry.resolvedBlockIds = [resolved];
      }
    }
  }
  const deletedIds = new Set(applyLog.flatMap((entry) => {
    const operation = planById.get(entry.operationId);
    return operation?.kind === 'delete'
      ? operation.targetBlockIds?.length ? operation.targetBlockIds : operation.targetBlockId ? [operation.targetBlockId] : []
      : [];
  }));
  const deletedRestoreEntries = applyLog.flatMap((entry) => {
    const operation = planById.get(entry.operationId);
    if (operation?.kind !== 'delete') return [];
    const deletedBlockId = operation.targetBlockId;
    const nodeIndex = prewrite.nodes.findIndex((node) =>
      node.remote.blockId === deletedBlockId || node.remote.blockIds?.includes(deletedBlockId ?? ''));
    const node = nodeIndex >= 0 ? prewrite.nodes[nodeIndex] : undefined;
    if (!node || node.kind === 'title') {
      throw new LocalizeError({
        type: 'unsupported_content', subtype: 'legacy_reverse_not_lossless',
        message: `Deleted block ${deletedBlockId ?? operation.operationId} cannot be restored.`,
      });
    }
    return [{entry, operation, node, nodeIndex}];
  }).sort((left, right) => left.nodeIndex - right.nodeIndex);
  const deletedRestoreGroups: Array<typeof deletedRestoreEntries> = [];
  for (const item of deletedRestoreEntries) {
    const active = deletedRestoreGroups.at(-1);
    if (active?.at(-1)?.nodeIndex === item.nodeIndex - 1) active.push(item);
    else deletedRestoreGroups.push([item]);
  }
  const deleteGroupByOperationId = new Map<string, typeof deletedRestoreEntries>();
  for (const group of deletedRestoreGroups) {
    for (const item of group) deleteGroupByOperationId.set(item.operation.operationId, group);
  }
  const emittedDeleteGroups = new Set<typeof deletedRestoreEntries>();
  const intents: MutationIntentV2[] = [];
  const operations: PreparedLegacyReverse['operations'] = [];
  const resourceHashes: PreparedLegacyReverse['resourceHashes'] = [];
  for (const entry of [...applyLog].reverse()) {
    const operation = planById.get(entry.operationId);
    if (!operation) throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_operation_missing', message: `Missing legacy operation ${entry.operationId}.`});
    if (operation.policy === 'verify_synced_reference') continue;
    const operationId = `legacy-reverse:${operation.operationId}`;
    if (operation.policy === 'whiteboard_mirror' && operation.kind === 'replace') {
      if (!input.whiteboards || !entry.targetResourceToken || !entry.targetResourcePrewriteRef
        || !entry.targetResourcePrewriteHash || !entry.sourceResourceHash) {
        throw new LocalizeError({type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_missing', message: `Whiteboard ${operation.operationId} has incomplete legacy recovery evidence.`});
      }
      const resourceBundle = await input.snapshots.getBundle(entry.targetResourcePrewriteRef);
      const rawJson = Object.values(resourceBundle.files)[0];
      if (!rawJson) throw new LocalizeError({type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_missing', message: `Whiteboard ${operation.operationId} has no prewrite raw payload.`});
      const restoreRaw = JSON.parse(rawJson) as unknown;
      if (canonicalWhiteboard(restoreRaw).hash !== entry.targetResourcePrewriteHash) {
        throw new LocalizeError({type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_mismatch', message: `Whiteboard ${operation.operationId} prewrite hash changed.`});
      }
      const currentRaw = await input.whiteboards.queryRaw(entry.targetResourceToken);
      const currentLegacyHash = canonicalWhiteboard(currentRaw).hash;
      if (currentLegacyHash !== entry.sourceResourceHash && currentLegacyHash !== entry.targetResourcePrewriteHash) {
        throw new LocalizeError({type: 'confirmation_required', subtype: 'reverse_not_proven_safe', message: `Whiteboard ${operation.operationId} changed outside the verified legacy states.`});
      }
      const currentRawHash = canonicalWhiteboardRawHash(currentRaw);
      const restoreRawHash = canonicalWhiteboardRawHash(restoreRaw);
      resourceHashes.push({operationId: operation.operationId, token: entry.targetResourceToken, currentRawHash, restoreRawHash});
      if (currentLegacyHash !== entry.targetResourcePrewriteHash) {
        const target = snapshotNode(currentSnapshot, operation.targetBlockId ?? '');
        intents.push({
          operationId,
          kind: 'whiteboard-overwrite',
          target: {
            ref: {kind: 'snapshot-block', blockId: target.blockId},
            expectedHash: target.canonicalHash,
            token: entry.targetResourceToken,
          },
          content: {kind: 'raw', value: restoreRaw},
        });
        operations.push({operationId: operation.operationId, kind: 'replace'});
      }
      continue;
    }
    if (operation.kind === 'insert') {
      const ids = entry.resolvedBlockIds?.length ? entry.resolvedBlockIds : entry.resolvedBlockId ? [entry.resolvedBlockId] : [];
      const roots = topLevelRoots(currentSnapshot, ids);
      if (roots.length === 0) throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_insert_block_missing', message: `Inserted block for ${operation.operationId} is missing.`});
      const parentIds = new Set(roots.map((id) => snapshotNode(currentSnapshot, id).parentBlockId));
      const parentBlockId = [...parentIds][0];
      if (parentIds.size !== 1 || !parentBlockId) throw new LocalizeError({type: 'unsupported_content', subtype: 'legacy_reverse_ambiguous_parent', message: `Inserted roots for ${operation.operationId} have no single parent.`});
      const parent = snapshotNode(currentSnapshot, parentBlockId);
      const indexes = roots.map((id) => parent.childBlockIds.indexOf(id)).sort((a, b) => a - b);
      if (indexes.some((value, index) => value < 0 || index > 0 && value !== indexes[index - 1]! + 1)) {
        throw new LocalizeError({type: 'unsupported_content', subtype: 'legacy_reverse_noncontiguous', message: `Inserted roots for ${operation.operationId} are not contiguous.`});
      }
      intents.push({
        operationId, kind: 'delete', parent: {kind: 'snapshot-block', blockId: parentBlockId},
        targets: roots.map((id) => ({ref: {kind: 'snapshot-block', blockId: id}, expectedHash: snapshotNode(currentSnapshot, id).canonicalHash})),
      });
      operations.push({operationId: operation.operationId, kind: 'delete'});
      continue;
    }
    if (operation.kind === 'delete') {
      const group = deleteGroupByOperationId.get(operation.operationId);
      if (!group) throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_prewrite_block_missing', message: `Deleted block for ${operation.operationId} is missing from the recovery group.`});
      if (emittedDeleteGroups.has(group)) continue;
      emittedDeleteGroups.add(group);
      const first = group[0]!;
      const last = group.at(-1)!;
      const predecessor = [...prewrite.nodes.slice(0, first.nodeIndex)].reverse().find((candidate) => {
        const id = candidate.kind === 'title' ? currentSnapshot.rootBlockId : candidate.remote.blockId;
        return id && !deletedIds.has(id) && currentSnapshot.nodes.some((currentNode) => currentNode.blockId === id);
      });
      const successor = prewrite.nodes.slice(last.nodeIndex + 1).find((candidate) => {
        const id = candidate.remote.blockId;
        return id && !deletedIds.has(id) && currentSnapshot.nodes.some((currentNode) => currentNode.blockId === id);
      });
      const afterId = predecessor?.kind === 'title' ? currentSnapshot.rootBlockId : predecessor?.remote.blockId ?? currentSnapshot.rootBlockId;
      const operationSummaryId = group.length === 1
        ? group[0]!.operation.operationId
        : group.map((item) => item.operation.operationId).join('+');
      const groupOperationId = `legacy-reverse:${operationSummaryId}`;
      intents.push({
        operationId: groupOperationId, kind: 'insert', parent: {kind: 'snapshot-block', blockId: currentSnapshot.rootBlockId},
        after: {kind: 'snapshot-block', blockId: afterId},
        ...(successor?.remote.blockId ? {before: {kind: 'snapshot-block' as const, blockId: successor.remote.blockId}} : {}),
        desired: group.map((item) => losslessDesired(item.node)),
      });
      operations.push({operationId: operationSummaryId, kind: 'insert'});
      continue;
    }
    if (operation.kind === 'replace') {
      const targetId = operation.targetBlockId;
      const prewriteNode = prewrite.nodes.find((node) => node.remote.blockId === targetId || node.remote.blockIds?.includes(targetId ?? ''));
      if (!prewriteNode || !targetId) throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_prewrite_block_missing', message: `Prewrite block for ${operation.operationId} is missing.`});
      const desired = losslessDesired(prewriteNode);
      if (prewriteNode.kind === 'title') {
        intents.push({operationId, kind: 'replace', target: {kind: 'snapshot-block', blockId: currentSnapshot.rootBlockId}, expectedHash: snapshotNode(currentSnapshot, currentSnapshot.rootBlockId).canonicalHash, desired});
      } else {
        const ids = topLevelRoots(currentSnapshot, operation.targetBlockIds?.length ? operation.targetBlockIds : [entry.resolvedBlockId ?? targetId]);
        const parentBlockId = snapshotNode(currentSnapshot, ids[0]!).parentBlockId;
        if (!parentBlockId) throw new LocalizeError({type: 'unsupported_content', subtype: 'legacy_reverse_ambiguous_parent', message: `Replacement ${operation.operationId} has no parent.`});
        if (ids.length === 1 && desired.kind !== 'list') {
          intents.push({operationId, kind: 'replace', target: {kind: 'snapshot-block', blockId: ids[0]!}, expectedHash: snapshotNode(currentSnapshot, ids[0]!).canonicalHash, desired});
        } else {
          intents.push({operationId, kind: 'replace-range', parent: {kind: 'snapshot-block', blockId: parentBlockId}, targets: ids.map((id) => ({ref: {kind: 'snapshot-block', blockId: id}, expectedHash: snapshotNode(currentSnapshot, id).canonicalHash})), desired});
        }
      }
      operations.push({operationId: operation.operationId, kind: 'replace'});
      continue;
    }
    throw new LocalizeError({type: 'unsupported_content', subtype: 'legacy_reverse_move_unsupported', message: 'Legacy move recovery is not supported.'});
  }
  if (intents.length === 0 && resourceHashes.length > 0) {
    const root = snapshotNode(currentSnapshot, currentSnapshot.rootBlockId);
    intents.push({
      operationId: 'legacy-reverse:verify-restored-resources',
      kind: 'assert',
      target: {kind: 'snapshot-block', blockId: currentSnapshot.rootBlockId},
      expectedHash: root.canonicalHash,
    });
  }
  if (intents.length === 0) throw new LocalizeError({type: 'unsupported_content', subtype: 'legacy_reverse_empty', message: 'Legacy recovery produced no reversible Engine operations.'});
  const batch = input.engine.prepare({snapshot: currentSnapshot, operations: intents, idempotencyNamespace: `legacy-reverse:${input.run.runId}`});
  return {batch, currentSnapshot, currentTargetHash: current.canonicalHash, restoreTargetHash: prewrite.canonicalHash, operations, resourceHashes};
}

export async function verifyLegacyRecoveryResources(input: {
  run: RunRecord;
  snapshots: SnapshotStore;
  whiteboards?: Pick<WhiteboardGateway, 'queryRaw'>;
}): Promise<void> {
  const applyLog = (input.run.metadata?.applyLog as Array<{
    operationId: string;
    kind?: string;
    targetResourceToken?: string;
    targetResourcePrewriteRef?: SnapshotReference;
    targetResourcePrewriteHash?: string;
  }> | undefined) ?? [];
  for (const entry of applyLog) {
    if (!entry.targetResourceToken) continue;
    if (entry.kind === 'insert') continue;
    if (!input.whiteboards || !entry.targetResourcePrewriteRef || !entry.targetResourcePrewriteHash) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_missing', message: `Whiteboard ${entry.operationId} cannot be verified after reverse.`});
    }
    const rawJson = Object.values((await input.snapshots.getBundle(entry.targetResourcePrewriteRef)).files)[0];
    if (!rawJson || canonicalWhiteboard(JSON.parse(rawJson)).hash !== entry.targetResourcePrewriteHash) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_mismatch', message: `Whiteboard ${entry.operationId} prewrite evidence is invalid.`});
    }
    const current = await input.whiteboards.queryRaw(entry.targetResourceToken);
    if (canonicalWhiteboard(current).hash !== entry.targetResourcePrewriteHash) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'whiteboard_reverse_verification_mismatch', message: `Whiteboard ${entry.operationId} was not restored.`});
    }
  }
}
