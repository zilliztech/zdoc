import type {
  BlockRef,
  DesiredListNode,
  DesiredNode,
  DocumentSnapshot,
  FeishuDocxEngine,
  MutationIntentV2,
  PreparedMutationBatch,
  SnapshotBlockRef,
  SnapshotNode,
} from 'feishu-docx-engine';

import {LocalizeError} from '../domain/errors.js';
import {canonicalHash} from '../domain/hash.js';
import {manualSyncPlaceholderDetails} from './manual-actions.js';
import type {ApprovedReview, LocalizationPlan, PlanOperation} from '../domain/review.js';
import {
  applySlotTranslations,
  parseStructuredInlineMarkdown,
  type StructuredContent,
} from '../domain/structured-content.js';

export interface EngineOperationSummary {
  operationId: string;
  kind: PlanOperation['kind'];
  nodeKind: PlanOperation['targetNodeKind'];
  createdSubtreeCount: number;
}

export interface CompiledEngineBatch {
  batch: PreparedMutationBatch;
  operations: EngineOperationSummary[];
}

interface CompileEngineBatchInput {
  runId: string;
  plan: LocalizationPlan;
  approved: ApprovedReview;
  targetSnapshot: DocumentSnapshot;
  engine: Pick<FeishuDocxEngine, 'prepare'>;
  sourceUrl?: string;
}

function compilationError(subtype: string, message: string, details?: unknown): LocalizeError {
  return new LocalizeError({type: 'verification_failed', subtype, message, details});
}

function snapshotRef(blockId: string): SnapshotBlockRef {
  return {kind: 'snapshot-block', blockId};
}

function operationRef(operationId: string): BlockRef {
  return {
    kind: 'operation-output',
    operationId,
    output: {kind: 'last-root'},
  };
}

function nodeById(snapshot: DocumentSnapshot, blockId: string): SnapshotNode {
  const node = snapshot.nodes.find((candidate) => candidate.blockId === blockId);
  if (!node) throw compilationError('engine_target_missing', `Engine snapshot does not contain block ${blockId}.`);
  return node;
}

function desiredList(structure: Extract<StructuredContent, {kind: 'list'}>): DesiredListNode {
  const items = structure.items.map((item): DesiredListNode['items'][number] => ({
    content: item.content,
    children: item.children.map((child) => desiredList({kind: 'list', ...child})),
  }));
  return {kind: 'list', ordered: structure.ordered, items};
}

function desiredStructured(
  operation: PlanOperation,
  approvedSlots: Array<{slotId: string; approvedText: string}>,
): DesiredNode {
  const structured = operation.structured;
  if (!structured) {
    throw compilationError(
      'structured_review_missing',
      `Operation ${operation.operationId} has structured approvals but no immutable structure.`,
    );
  }
  const translated = applySlotTranslations(
    structured.sourceStructure,
    approvedSlots.map((slot) => ({slotId: slot.slotId, translatedText: slot.approvedText})),
    structured.topologyHash,
  );
  return translated.kind === 'list' ? desiredList(translated) : translated;
}

function headingLevel(operation: PlanOperation): 1 | 2 | 3 | 4 | 5 | 6 {
  const match = /^h([1-6])$/.exec(operation.targetElementName ?? '');
  if (match) return Number(match[1]) as 1 | 2 | 3 | 4 | 5 | 6;
  return Math.min(6, Math.max(1, operation.sourceHeadingPath?.length ?? 1)) as 1 | 2 | 3 | 4 | 5 | 6;
}

function desiredTextNode(operation: PlanOperation, approvedText: string): DesiredNode {
  const content = parseStructuredInlineMarkdown(approvedText);
  if (operation.targetNodeKind === 'title') return {kind: 'title', content};
  if (operation.targetNodeKind === 'heading') return {kind: 'heading', level: headingLevel(operation), content};
  if (operation.targetNodeKind === 'paragraph') return {kind: 'paragraph', content};
  if (operation.targetNodeKind === 'quote') return {kind: 'quote', content};
  if (operation.targetNodeKind === 'callout') {
    return {
      kind: 'callout',
      calloutType: operation.targetAttributes?.type ?? 'note',
      ...(operation.targetAttributes?.title ? {title: operation.targetAttributes.title} : {}),
      children: [{kind: 'paragraph', content}],
    };
  }
  if (operation.targetNodeKind === 'code') {
    return {
      kind: 'code',
      language: operation.targetAttributes?.lang ?? operation.targetAttributes?.language ?? 'plaintext',
      text: approvedText,
      ...(operation.targetAttributes?.caption ? {caption: operation.targetAttributes.caption} : {}),
    };
  }
  throw compilationError(
    'engine_desired_node_unsupported',
    `Operation ${operation.operationId} cannot compile ${operation.targetNodeKind} as a typed Docx node.`,
  );
}

function desiredForOperation(
  operation: PlanOperation,
  approved: ApprovedReview['operations'][number],
  sourceUrl?: string,
): DesiredNode {
  if ('approvedSlots' in approved) return desiredStructured(operation, approved.approvedSlots);
  if ('approvedText' in approved) return desiredTextNode(operation, approved.approvedText);
  if (operation.policy === 'verbatim_code') return desiredTextNode(operation, operation.proposedText);
  if (operation.policy === 'manual_synced_reference') {
    if (!sourceUrl) {
      throw compilationError(
        'manual_sync_source_url_missing',
        `Manual synced-reference operation ${operation.operationId} has no source document URL.`,
      );
    }
    const details = manualSyncPlaceholderDetails(operation, sourceUrl);
    return {
      kind: 'callout',
      calloutType: 'warning',
      title: 'Manual synced-code reference required',
      children: [
        {kind: 'paragraph', content: [{kind: 'text', text: '需要人工插入飞书同步块', bold: true}]},
        {kind: 'paragraph', content: [{kind: 'code', text: details.marker}]},
        {kind: 'paragraph', content: [{kind: 'link', text: '打开英文同步源', url: details.sourceBlockUrl}]},
        {kind: 'paragraph', content: [
          {kind: 'text', text: 'Source document: '},
          {kind: 'code', text: details.sourceDocumentId},
          {kind: 'text', text: ' Source block: '},
          {kind: 'code', text: details.sourceBlockId},
        ]},
      ],
    };
  }
  throw compilationError(
    'engine_review_operation_missing',
    `Operation ${operation.operationId} has no approved typed content.`,
  );
}

function desiredNodeCount(node: DesiredNode): number {
  if (node.kind === 'list') {
    return 1 + node.items.reduce((total, item) => total
      + item.children.reduce((children, child) => children + desiredNodeCount(child), 0), 0);
  }
  if (node.kind === 'table') {
    return 1 + node.rows.reduce((rows, row) => rows
      + row.cells.reduce((cells, cell) => cells
        + cell.content.reduce((content, child) => content + desiredNodeCount(child), 0), 0), 0);
  }
  if (node.kind === 'callout') {
    return 1 + node.children.reduce((total, child) => total + desiredNodeCount(child), 0);
  }
  return 1;
}

function targetBlockIds(operation: PlanOperation): string[] {
  return operation.targetBlockIds?.length
    ? operation.targetBlockIds
    : operation.targetBlockId ? [operation.targetBlockId] : [];
}

function commonParent(snapshot: DocumentSnapshot, blockIds: string[], operationId: string): string {
  const parents = new Set(blockIds.map((blockId) => nodeById(snapshot, blockId).parentBlockId ?? snapshot.rootBlockId));
  if (parents.size !== 1) {
    throw compilationError(
      'engine_target_parent_mismatch',
      `Operation ${operationId} targets blocks under different parents.`,
    );
  }
  return [...parents][0]!;
}

function insertionBoundary(
  snapshot: DocumentSnapshot,
  operation: PlanOperation,
  parentByOperation: ReadonlyMap<string, string>,
  beforeByOperation: ReadonlyMap<string, string | undefined>,
  afterByOperation: ReadonlyMap<string, BlockRef>,
): {parentBlockId: string; after: BlockRef; before?: SnapshotBlockRef} {
  if (operation.anchorOperationId) {
    const parentBlockId = parentByOperation.get(operation.anchorOperationId);
    if (!parentBlockId) {
      throw compilationError(
        'engine_anchor_operation_missing',
        `Operation ${operation.operationId} depends on unknown operation ${operation.anchorOperationId}.`,
      );
    }
    const beforeBlockId = beforeByOperation.get(operation.anchorOperationId);
    return {
      parentBlockId,
      after: afterByOperation.get(operation.anchorOperationId) ?? operationRef(operation.anchorOperationId),
      ...(beforeBlockId ? {before: snapshotRef(beforeBlockId)} : {}),
    };
  }
  const anchorBlockId = operation.anchorBlockId ?? snapshot.rootBlockId;
  const anchor = nodeById(snapshot, anchorBlockId);
  const parentBlockId = anchor.parentBlockId ?? anchor.blockId;
  const parent = nodeById(snapshot, parentBlockId);
  const anchorIndex = anchorBlockId === parentBlockId ? -1 : parent.childBlockIds.indexOf(anchorBlockId);
  if (anchorBlockId !== parentBlockId && anchorIndex < 0) {
    throw compilationError(
      'engine_anchor_parent_mismatch',
      `Operation ${operation.operationId} anchor ${anchorBlockId} is not a child of ${parentBlockId}.`,
    );
  }
  const beforeBlockId = parent.childBlockIds[anchorIndex + 1];
  return {
    parentBlockId,
    after: snapshotRef(anchorBlockId),
    ...(beforeBlockId ? {before: snapshotRef(beforeBlockId)} : {}),
  };
}

export function compileEngineBatch(input: CompileEngineBatchInput): CompiledEngineBatch {
  if (input.plan.planVersion !== 3) {
    throw compilationError(
      'engine_plan_version_unsupported',
      `Plan ${input.plan.runId} must be regenerated as plan version 3.`,
    );
  }
  if (input.approved.planHash !== canonicalHash(input.plan)) {
    throw compilationError('review_metadata_changed', 'The approved review no longer matches the immutable plan.');
  }
  if (input.targetSnapshot.canonicalHash !== input.plan.targetHash) {
    throw compilationError(
      'engine_target_snapshot_mismatch',
      'The stored target snapshot does not match the reviewed target hash.',
    );
  }

  const approvedById = new Map(input.approved.operations.map((operation) => [operation.operationId, operation]));
  const parentByOperation = new Map<string, string>();
  const beforeByOperation = new Map<string, string | undefined>();
  const afterByOperation = new Map<string, BlockRef>();
  const intents: MutationIntentV2[] = [];
  const summaries: EngineOperationSummary[] = [];

  for (const operation of input.plan.operations) {
    const approved = approvedById.get(operation.operationId);
    if (!approved) {
      throw compilationError(
        'engine_review_operation_missing',
        `Approved review is missing operation ${operation.operationId}.`,
      );
    }
    const policy = operation.policy ?? (operation.kind === 'delete' ? 'delete' : 'translation');

    if (policy === 'verify_synced_reference') {
      if (!operation.targetBlockId || !operation.targetNodeHash) {
        throw compilationError('engine_assert_target_missing', `Verify-only operation ${operation.operationId} has no target identity.`);
      }
      intents.push({
        operationId: operation.operationId,
        kind: 'assert',
        target: snapshotRef(operation.targetBlockId),
        expectedHash: operation.targetNodeHash,
      });
      const target = nodeById(input.targetSnapshot, operation.targetBlockId);
      const parentBlockId = target.parentBlockId ?? target.blockId;
      const parent = nodeById(input.targetSnapshot, parentBlockId);
      const index = target.blockId === parentBlockId ? -1 : parent.childBlockIds.indexOf(target.blockId);
      parentByOperation.set(operation.operationId, parentBlockId);
      beforeByOperation.set(operation.operationId, parent.childBlockIds[index + 1]);
      afterByOperation.set(operation.operationId, snapshotRef(target.blockId));
      summaries.push({operationId: operation.operationId, kind: operation.kind, nodeKind: operation.targetNodeKind, createdSubtreeCount: 0});
      continue;
    }

    if (policy === 'whiteboard_mirror') {
      if (!operation.sourceResourceToken || !operation.sourceResourceRawHash) {
        throw compilationError('whiteboard_source_evidence_missing', `Whiteboard operation ${operation.operationId} has no verified source hash.`);
      }
      const content = {
        kind: 'copy-token' as const,
        sourceToken: operation.sourceResourceToken,
        expectedSourceRawHash: operation.sourceResourceRawHash,
      };
      if (operation.targetBlockId) {
        const target = nodeById(input.targetSnapshot, operation.targetBlockId);
        intents.push({
          operationId: operation.operationId,
          kind: 'whiteboard-overwrite',
          target: {
            ref: snapshotRef(target.blockId),
            expectedHash: operation.targetNodeHash ?? target.canonicalHash,
            ...(operation.targetResourceToken ? {token: operation.targetResourceToken} : {}),
          },
          content,
        });
        const parentBlockId = target.parentBlockId ?? target.blockId;
        const parent = nodeById(input.targetSnapshot, parentBlockId);
        const index = target.blockId === parentBlockId ? -1 : parent.childBlockIds.indexOf(target.blockId);
        parentByOperation.set(operation.operationId, parentBlockId);
        beforeByOperation.set(operation.operationId, parent.childBlockIds[index + 1]);
        afterByOperation.set(operation.operationId, snapshotRef(target.blockId));
      } else {
        const boundary = insertionBoundary(input.targetSnapshot, operation, parentByOperation, beforeByOperation, afterByOperation);
        intents.push({
          operationId: operation.operationId,
          kind: 'whiteboard-create',
          parent: snapshotRef(boundary.parentBlockId),
          after: boundary.after,
          ...(boundary.before ? {before: boundary.before} : {}),
          content,
        });
        parentByOperation.set(operation.operationId, boundary.parentBlockId);
        beforeByOperation.set(operation.operationId, boundary.before?.blockId);
        afterByOperation.set(operation.operationId, operationRef(operation.operationId));
      }
      summaries.push({operationId: operation.operationId, kind: operation.kind, nodeKind: operation.targetNodeKind, createdSubtreeCount: operation.targetBlockId ? 0 : 1});
      continue;
    }

    if (operation.kind === 'delete') {
      const blockIds = targetBlockIds(operation);
      if (blockIds.length === 0 || !('decision' in approved) || approved.decision !== 'delete') {
        throw compilationError('engine_delete_not_approved', `Delete operation ${operation.operationId} is not exactly approved.`);
      }
      const parentBlockId = commonParent(input.targetSnapshot, blockIds, operation.operationId);
      intents.push({
        operationId: operation.operationId,
        kind: 'delete',
        parent: snapshotRef(parentBlockId),
        targets: blockIds.map((blockId) => {
          const target = nodeById(input.targetSnapshot, blockId);
          return {ref: snapshotRef(blockId), expectedHash: target.canonicalHash};
        }),
      });
      summaries.push({operationId: operation.operationId, kind: operation.kind, nodeKind: operation.targetNodeKind, createdSubtreeCount: 0});
      continue;
    }

    const desired = desiredForOperation(operation, approved, input.sourceUrl);
    if (operation.kind === 'replace') {
      const blockIds = targetBlockIds(operation);
      if (blockIds.length === 0) {
        throw compilationError('engine_replace_target_missing', `Replace operation ${operation.operationId} has no target block.`);
      }
      if (blockIds.length === 1) {
        const target = nodeById(input.targetSnapshot, blockIds[0]!);
        intents.push({
          operationId: operation.operationId,
          kind: 'replace',
          target: snapshotRef(target.blockId),
          expectedHash: operation.targetNodeHash ?? target.canonicalHash,
          desired,
        });
        const parentBlockId = target.parentBlockId ?? target.blockId;
        const parent = nodeById(input.targetSnapshot, parentBlockId);
        const index = target.blockId === parentBlockId ? -1 : parent.childBlockIds.indexOf(target.blockId);
        parentByOperation.set(operation.operationId, parentBlockId);
        beforeByOperation.set(operation.operationId, parent.childBlockIds[index + 1]);
      } else {
        const parentBlockId = commonParent(input.targetSnapshot, blockIds, operation.operationId);
        intents.push({
          operationId: operation.operationId,
          kind: 'replace-range',
          parent: snapshotRef(parentBlockId),
          targets: blockIds.map((blockId) => {
            const target = nodeById(input.targetSnapshot, blockId);
            return {ref: snapshotRef(blockId), expectedHash: target.canonicalHash};
          }),
          desired,
        });
        const parent = nodeById(input.targetSnapshot, parentBlockId);
        const lastTargetIndex = Math.max(...blockIds.map((blockId) => parent.childBlockIds.indexOf(blockId)));
        parentByOperation.set(operation.operationId, parentBlockId);
        beforeByOperation.set(operation.operationId, parent.childBlockIds[lastTargetIndex + 1]);
      }
      afterByOperation.set(operation.operationId, operationRef(operation.operationId));
      summaries.push({operationId: operation.operationId, kind: operation.kind, nodeKind: operation.targetNodeKind, createdSubtreeCount: 0});
      continue;
    }

    if (operation.kind === 'insert') {
      const boundary = insertionBoundary(input.targetSnapshot, operation, parentByOperation, beforeByOperation, afterByOperation);
      intents.push({
        operationId: operation.operationId,
        kind: 'insert',
        parent: snapshotRef(boundary.parentBlockId),
        after: boundary.after,
        ...(boundary.before ? {before: boundary.before} : {}),
        desired: [desired],
      });
      parentByOperation.set(operation.operationId, boundary.parentBlockId);
      beforeByOperation.set(operation.operationId, boundary.before?.blockId);
      afterByOperation.set(operation.operationId, operationRef(operation.operationId));
      summaries.push({
        operationId: operation.operationId,
        kind: operation.kind,
        nodeKind: operation.targetNodeKind,
        createdSubtreeCount: desiredNodeCount(desired),
      });
      continue;
    }

    throw compilationError(
      'engine_operation_unsupported',
      `Operation ${operation.operationId} has unsupported kind ${operation.kind}.`,
    );
  }

  const batch = input.engine.prepare({
    snapshot: input.targetSnapshot,
    operations: intents,
    idempotencyNamespace: `zdoc-localize:${input.runId}`,
  });
  if (batch.schemaVersion !== 2) {
    throw compilationError(
      'engine_schema_version_mismatch',
      `Engine prepared schema ${batch.schemaVersion}; schema 2 is required.`,
    );
  }
  return {batch, operations: summaries};
}
