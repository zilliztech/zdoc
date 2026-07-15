import {canonicalHash} from './hash.js';
import type {SemanticChange, SemanticDocument, SemanticNode} from './model.js';

interface Match {
  beforeIndex: number;
  afterIndex: number;
}

function lcsMatches(before: SemanticNode[], after: SemanticNode[]): Match[] {
  const table = Array.from({length: before.length + 1}, () =>
    Array<number>(after.length + 1).fill(0),
  );
  for (let left = before.length - 1; left >= 0; left -= 1) {
    for (let right = after.length - 1; right >= 0; right -= 1) {
      table[left]![right] = before[left]!.fingerprint === after[right]!.fingerprint
        ? 1 + table[left + 1]![right + 1]!
        : Math.max(table[left + 1]![right]!, table[left]![right + 1]!);
    }
  }
  const matches: Match[] = [];
  let left = 0;
  let right = 0;
  while (left < before.length && right < after.length) {
    if (before[left]!.fingerprint === after[right]!.fingerprint) {
      matches.push({beforeIndex: left, afterIndex: right});
      left += 1;
      right += 1;
    } else if (table[left + 1]![right]! >= table[left]![right + 1]!) {
      left += 1;
    } else {
      right += 1;
    }
  }
  return matches;
}

function changeId(kind: SemanticChange['kind'], before?: SemanticNode, after?: SemanticNode): string {
  return canonicalHash({kind, before: before?.fingerprint, after: after?.fingerprint}).slice(0, 16);
}

function previousNodeId(document: SemanticDocument, node: SemanticNode): string | undefined {
  return document.nodes[node.documentIndex - 1]?.nodeId;
}

export function diffDocuments(
  baseline: SemanticDocument,
  current: SemanticDocument,
): SemanticChange[] {
  const beforeUsed = new Set<number>();
  const afterUsed = new Set<number>();
  const changes: SemanticChange[] = [];

  const currentByNodeId = new Map(current.nodes.map((node, index) => [node.nodeId, {node, index}]));
  baseline.nodes.forEach((before, beforeIndex) => {
    const matched = currentByNodeId.get(before.nodeId);
    if (!matched || matched.node.fingerprint === before.fingerprint) return;
    beforeUsed.add(beforeIndex);
    afterUsed.add(matched.index);
    changes.push({
      changeId: changeId('replace', before, matched.node),
      kind: 'replace',
      before,
      after: matched.node,
      previousSourceNodeId: previousNodeId(current, matched.node),
    });
  });

  const remainingBefore = baseline.nodes
    .map((node, index) => ({node, index}))
    .filter(({index}) => !beforeUsed.has(index));
  const remainingAfter = current.nodes
    .map((node, index) => ({node, index}))
    .filter(({index}) => !afterUsed.has(index));
  for (const match of lcsMatches(
    remainingBefore.map(({node}) => node),
    remainingAfter.map(({node}) => node),
  )) {
    beforeUsed.add(remainingBefore[match.beforeIndex]!.index);
    afterUsed.add(remainingAfter[match.afterIndex]!.index);
  }

  const unmatchedBefore = () => baseline.nodes
    .map((node, index) => ({node, index}))
    .filter(({index}) => !beforeUsed.has(index));
  const unmatchedAfter = () => current.nodes
    .map((node, index) => ({node, index}))
    .filter(({index}) => !afterUsed.has(index));

  for (const beforeItem of unmatchedBefore()) {
    const candidates = unmatchedAfter().filter(({node}) => node.fingerprint === beforeItem.node.fingerprint);
    if (candidates.length !== 1) continue;
    const afterItem = candidates[0]!;
    beforeUsed.add(beforeItem.index);
    afterUsed.add(afterItem.index);
    changes.push({
      changeId: changeId('move', beforeItem.node, afterItem.node),
      kind: 'move',
      before: beforeItem.node,
      after: afterItem.node,
      previousSourceNodeId: previousNodeId(current, afterItem.node),
    });
  }

  for (const beforeItem of unmatchedBefore()) {
    const candidates = unmatchedAfter().filter(({node}) =>
      node.kind === beforeItem.node.kind
      && node.sectionIndex === beforeItem.node.sectionIndex
      && node.siblingIndex === beforeItem.node.siblingIndex,
    );
    if (candidates.length !== 1) continue;
    const afterItem = candidates[0]!;
    beforeUsed.add(beforeItem.index);
    afterUsed.add(afterItem.index);
    changes.push({
      changeId: changeId('replace', beforeItem.node, afterItem.node),
      kind: 'replace',
      before: beforeItem.node,
      after: afterItem.node,
      previousSourceNodeId: previousNodeId(current, afterItem.node),
    });
  }

  for (const {node, index} of unmatchedBefore()) {
    beforeUsed.add(index);
    changes.push({
      changeId: changeId('delete', node),
      kind: 'delete',
      before: node,
    });
  }
  for (const {node, index} of unmatchedAfter()) {
    afterUsed.add(index);
    changes.push({
      changeId: changeId('insert', undefined, node),
      kind: 'insert',
      after: node,
      previousSourceNodeId: previousNodeId(current, node),
    });
  }

  return changes.sort((left, right) => {
    const leftIndex = left.after?.documentIndex ?? left.before?.documentIndex ?? 0;
    const rightIndex = right.after?.documentIndex ?? right.before?.documentIndex ?? 0;
    return leftIndex - rightIndex;
  });
}
