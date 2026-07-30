import {canonicalHash} from './hash.js';
import type {AlignedChange, SemanticChange, SemanticDocument, SemanticNode} from './model.js';
import type {PlanOperation} from './review.js';

export interface InitialPlanInputs {
  operations: PlanOperation[];
  changes: SemanticChange[];
  translatableAligned: AlignedChange[];
  unsupported: SemanticNode[];
}

export function buildInitialPlanInputs(
  source: SemanticDocument,
  target: SemanticDocument,
): InitialPlanInputs {
  const targetTitle = target.nodes.find((node) => node.kind === 'title');
  const operations: PlanOperation[] = [];
  const changes: SemanticChange[] = [];
  const translatableAligned: AlignedChange[] = [];
  const unsupported: SemanticNode[] = [];
  let previousOperationId: string | undefined;

  source.nodes.forEach((node, index) => {
    const operationId = canonicalHash({kind: 'initial', nodeId: node.nodeId, index}).slice(0, 16);
    const kind = node.kind === 'title' ? 'replace' as const : 'insert' as const;
    const change: SemanticChange = {
      changeId: operationId,
      kind,
      after: node,
      ...(index > 0 ? {previousSourceNodeId: source.nodes[index - 1]?.nodeId} : {}),
    };
    const common: PlanOperation = {
      operationId,
      kind,
      confidence: 'high',
      sourceAfter: node.text,
      sourceNodeId: node.nodeId,
      sourceNodeHash: node.fingerprint,
      sourceHeadingPath: node.headingPath,
      proposedText: '',
      targetNodeKind: node.kind,
      targetElementName: node.remote.elementName,
      targetAttributes: node.remote.attributes,
      sourceXml: node.xml,
      ...(previousOperationId ? {anchorOperationId: previousOperationId} : {}),
    };

    let operation: PlanOperation | undefined;
    if (node.kind === 'title' && targetTitle) {
      operation = {
        ...common,
        policy: 'translation',
        effect: 'write',
        targetCurrent: targetTitle.text,
        targetNodeId: targetTitle.nodeId,
        targetBlockId: targetTitle.remote.blockId,
        targetNodeHash: targetTitle.fingerprint,
        targetElementName: targetTitle.remote.elementName,
        targetAttributes: targetTitle.remote.attributes,
      };
      translatableAligned.push({
        change,
        confidence: 'high',
        targetNodeId: targetTitle.nodeId,
        score: 100,
      });
    } else if (node.kind === 'code') {
      operation = {...common, policy: 'verbatim_code', effect: 'write', proposedText: node.text};
    } else if (node.kind === 'list' || node.kind === 'table' || node.kind === 'callout') {
      if (node.writable && node.structure?.kind === node.kind) {
        operation = {...common, policy: 'translation', effect: 'write'};
        translatableAligned.push({
          change,
          confidence: 'high',
          ...(previousOperationId ? {anchorOperationId: previousOperationId} : {}),
          score: 100,
        });
      } else {
        unsupported.push(node);
      }
    } else if (node.writable) {
      operation = {...common, policy: 'translation', effect: 'write'};
      translatableAligned.push({
        change,
        confidence: 'high',
        ...(previousOperationId ? {anchorOperationId: previousOperationId} : {}),
        score: 100,
      });
    } else if (node.kind === 'whiteboard' && node.remote.token) {
      operation = {
        ...common,
        policy: 'whiteboard_mirror',
        effect: 'mirror',
        sourceResourceToken: node.remote.token,
      };
    } else if (node.kind === 'synced_source' && node.remote.blockId) {
      operation = {
        ...common,
        policy: 'manual_synced_reference',
        effect: 'manual',
        targetNodeKind: 'synced_reference',
        sourceDocumentId: source.documentId,
        sourceBlockId: node.remote.blockId,
      };
    } else {
      unsupported.push(node);
    }

    changes.push(change);
    if (operation) {
      operations.push(operation);
      previousOperationId = operationId;
    }
  });

  return {operations, changes, translatableAligned, unsupported};
}
