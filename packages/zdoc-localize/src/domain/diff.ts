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
  return canonicalHash({
    kind,
    before: before ? {fingerprint: before.fingerprint, nodeId: before.nodeId, documentIndex: before.documentIndex} : undefined,
    after: after ? {fingerprint: after.fingerprint, nodeId: after.nodeId, documentIndex: after.documentIndex} : undefined,
  }).slice(0, 16);
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

  const exactMatches: Match[] = [];
  const stableCandidates: Match[] = [];
  const currentByBlockId = new Map<string, number[]>();
  current.nodes.forEach((node, index) => {
    if (!node.remote.blockId) return;
    const indexes = currentByBlockId.get(node.remote.blockId) ?? [];
    indexes.push(index);
    currentByBlockId.set(node.remote.blockId, indexes);
  });
  baseline.nodes.forEach((node, beforeIndex) => {
    const blockId = node.remote.blockId;
    if (!blockId) return;
    const candidates = currentByBlockId.get(blockId) ?? [];
    if (candidates.length !== 1) return;
    const afterIndex = candidates[0]!;
    if (current.nodes[afterIndex]!.fingerprint !== node.fingerprint) return;
    stableCandidates.push({beforeIndex, afterIndex});
  });
  let lastStableAfterIndex = -1;
  for (const match of stableCandidates) {
    if (match.afterIndex <= lastStableAfterIndex) continue;
    exactMatches.push(match);
    beforeUsed.add(match.beforeIndex);
    afterUsed.add(match.afterIndex);
    lastStableAfterIndex = match.afterIndex;
  }
  const remainingBefore = baseline.nodes.map((node, index) => ({node, index})).filter(({index}) => !beforeUsed.has(index));
  const remainingAfter = current.nodes.map((node, index) => ({node, index})).filter(({index}) => !afterUsed.has(index));
  for (const match of lcsMatches(remainingBefore.map(({node}) => node), remainingAfter.map(({node}) => node))) {
    exactMatches.push({
      beforeIndex: remainingBefore[match.beforeIndex]!.index,
      afterIndex: remainingAfter[match.afterIndex]!.index,
    });
  }
  exactMatches.sort((left, right) => left.beforeIndex - right.beforeIndex);
  for (const match of exactMatches) {
    beforeUsed.add(match.beforeIndex);
    afterUsed.add(match.afterIndex);
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

  const boundaries = [
    {beforeIndex: -1, afterIndex: -1},
    ...exactMatches,
    {beforeIndex: baseline.nodes.length, afterIndex: current.nodes.length},
  ];
  for (let boundaryIndex = 0; boundaryIndex < boundaries.length - 1; boundaryIndex += 1) {
    const left = boundaries[boundaryIndex]!;
    const right = boundaries[boundaryIndex + 1]!;
    const beforeGap = baseline.nodes
      .map((node, index) => ({node, index}))
      .filter(({index}) => index > left.beforeIndex && index < right.beforeIndex && !beforeUsed.has(index));
    const afterGap = current.nodes
      .map((node, index) => ({node, index}))
      .filter(({index}) => index > left.afterIndex && index < right.afterIndex && !afterUsed.has(index));
    if (beforeGap.length === 0 || beforeGap.length !== afterGap.length) continue;
    if (beforeGap.some((item, index) => item.node.kind !== afterGap[index]!.node.kind)) continue;
    for (let index = 0; index < beforeGap.length; index += 1) {
      const beforeItem = beforeGap[index]!;
      const afterItem = afterGap[index]!;
      if (beforeItem.node.kind === 'list') continue;
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
  }

  for (const beforeItem of unmatchedBefore()) {
    if (beforeItem.node.kind === 'list') continue;
    const blockId = beforeItem.node.remote.blockId;
    if (!blockId) continue;
    const candidates = unmatchedAfter().filter(({node}) => node.remote.blockId === blockId);
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
