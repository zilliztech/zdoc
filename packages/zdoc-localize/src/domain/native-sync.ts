import {LocalizeError} from './errors.js';
import {canonicalHash} from './hash.js';
import type {SemanticDocument, SemanticNode} from './model.js';

export interface LegacyCorrespondence {
  sourceNodeId: string;
  targetNodeId: string;
}

export type Correspondence =
  | {kind: 'content'; sourceNodeId: string; targetNodeId: string}
  | {
      kind: 'native_sync';
      sourceNodeId: string;
      targetNodeId: string;
      sourceDocumentId: string;
      sourceBlockId: string;
    }
  | {
      kind: 'copied_resource';
      sourceNodeId: string;
      targetNodeId: string;
      resourceKind: 'whiteboard';
      sourceResourceHash: string;
    };

export type StoredCorrespondence = Correspondence | LegacyCorrespondence;

export function normalizeCorrespondences(values: StoredCorrespondence[]): Correspondence[] {
  return values.map((value) => 'kind' in value ? value : {kind: 'content', ...value});
}

export interface ManualReferenceExpectation {
  operationId: string;
  marker: string;
  placeholderBlockId: string;
  sourceNodeId: string;
  sourceDocumentId: string;
  sourceBlockId: string;
  sourceUrl: string;
  predecessorBlockId?: string;
  successorBlockId?: string;
}

function blockId(node: SemanticNode | undefined): string | undefined {
  return node?.remote.blockId;
}

function sequence(document: SemanticDocument, excluded: Set<string>): string {
  return JSON.stringify(document.nodes
    .filter((node) => !node.remote.blockId || !excluded.has(node.remote.blockId))
    .map((node) => ({
      blockId: node.remote.blockId ?? null,
      kind: node.kind,
      fingerprint: node.kind === 'title'
        ? canonicalHash({kind: node.kind, xml: node.xml})
        : node.fingerprint,
    })));
}

function atExpectedPosition(
  document: SemanticDocument,
  node: SemanticNode,
  expectation: ManualReferenceExpectation,
): boolean {
  const index = document.nodes.indexOf(node);
  if (index < 0) return false;
  const predecessor = expectation.predecessorBlockId
    ? document.nodes.findIndex((candidate) => blockId(candidate) === expectation.predecessorBlockId)
    : -1;
  const successor = expectation.successorBlockId
    ? document.nodes.findIndex((candidate) => blockId(candidate) === expectation.successorBlockId)
    : -1;
  if (expectation.predecessorBlockId && predecessor < 0) return false;
  if (expectation.successorBlockId && successor < 0) return false;
  if (predecessor >= 0 && index !== predecessor + 1) return false;
  if (successor >= 0 && successor !== index + 1) return false;
  return true;
}

export function verifyManualSyncedReferences(
  expectations: ManualReferenceExpectation[],
  plannedTarget: SemanticDocument,
  currentTarget: SemanticDocument,
): {correspondences: Correspondence[]; resolvedBlockIds: Map<string, string>} {
  const placeholderIds = new Set(expectations.map((expectation) => expectation.placeholderBlockId));
  for (const expectation of expectations) {
    const placeholder = plannedTarget.nodes.find((node) => node.remote.blockId === expectation.placeholderBlockId);
    if (!placeholder || !placeholder.text.includes(expectation.marker)) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'manual_placeholder_missing',
        message: `Manual action ${expectation.operationId} has no verified placeholder in the post-automatic snapshot.`,
      });
    }
  }

  const correspondences: Correspondence[] = [];
  const resolvedBlockIds = new Map<string, string>();
  const insertedReferenceIds = new Set<string>();
  for (const expectation of expectations) {
    if (currentTarget.nodes.some((node) => node.remote.blockId === expectation.placeholderBlockId)) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'manual_reference_missing',
        message: `Manual action ${expectation.operationId} still contains its placeholder.`,
      });
    }
    const exact = currentTarget.nodes.filter((node) =>
      node.kind === 'synced_reference'
      && node.remote.sourceDocumentId === expectation.sourceDocumentId
      && node.remote.sourceBlockId === expectation.sourceBlockId,
    );
    if (exact.length > 1) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'manual_reference_ambiguous',
        message: `Manual action ${expectation.operationId} has multiple matching synced references.`,
      });
    }
    const reference = exact[0];
    if (!reference) {
      const positionedReference = currentTarget.nodes.find((node) =>
        node.kind === 'synced_reference' && atExpectedPosition(currentTarget, node, expectation),
      );
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: positionedReference ? 'manual_reference_mismatch' : 'manual_reference_missing',
        message: positionedReference
          ? `Manual action ${expectation.operationId} points to the wrong synced source.`
          : `Manual action ${expectation.operationId} has no matching synced reference.`,
      });
    }
    if (!atExpectedPosition(currentTarget, reference, expectation)) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'manual_target_changed',
        message: `Manual action ${expectation.operationId} is not at the planned document position.`,
      });
    }
    const referenceBlockId = reference.remote.blockId;
    if (!referenceBlockId) {
      throw new LocalizeError({
        type: 'verification_failed', subtype: 'manual_reference_missing',
        message: `Manual action ${expectation.operationId} has no remote reference block ID.`,
      });
    }
    insertedReferenceIds.add(referenceBlockId);
    resolvedBlockIds.set(expectation.operationId, referenceBlockId);
    correspondences.push({
      kind: 'native_sync',
      sourceNodeId: expectation.sourceNodeId,
      targetNodeId: reference.nodeId,
      sourceDocumentId: expectation.sourceDocumentId,
      sourceBlockId: expectation.sourceBlockId,
    });
  }
  if (sequence(plannedTarget, placeholderIds) !== sequence(currentTarget, insertedReferenceIds)) {
    throw new LocalizeError({
      type: 'verification_failed', subtype: 'manual_target_changed',
      message: 'The Chinese target contains changes outside the approved manual synced-reference replacements.',
    });
  }
  return {correspondences, resolvedBlockIds};
}
