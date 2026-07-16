import type {
  AlignedChange,
  HistoricalCorrespondence,
  SemanticChange,
  SemanticDocument,
  SemanticNode,
} from './model.js';

export function rebaseCorrespondences<T extends HistoricalCorrespondence>(
  history: T[],
  baseline: SemanticDocument,
  current: SemanticDocument,
): T[] {
  const correspondenceByBaselineId = new Map(history.map((item) => [item.sourceNodeId, item]));
  const rebased: T[] = [];
  const baselineUsed = new Set<number>();
  const currentUsed = new Set<number>();
  const currentByBlockId = new Map<string, number[]>();
  current.nodes.forEach((node, index) => {
    if (!node.remote.blockId) return;
    const indexes = currentByBlockId.get(node.remote.blockId) ?? [];
    indexes.push(index);
    currentByBlockId.set(node.remote.blockId, indexes);
  });
  baseline.nodes.forEach((node, baselineIndex) => {
    const blockId = node.remote.blockId;
    if (!blockId) return;
    const candidates = currentByBlockId.get(blockId) ?? [];
    if (candidates.length !== 1) return;
    const currentIndex = candidates[0]!;
    const correspondence = correspondenceByBaselineId.get(node.nodeId);
    if (correspondence) rebased.push({...correspondence, sourceNodeId: current.nodes[currentIndex]!.nodeId});
    baselineUsed.add(baselineIndex);
    currentUsed.add(currentIndex);
  });

  const remainingBaseline = baseline.nodes
    .map((node, index) => ({node, index}))
    .filter(({index}) => !baselineUsed.has(index));
  const remainingCurrent = current.nodes
    .map((node, index) => ({node, index}))
    .filter(({index}) => !currentUsed.has(index));
  const table = Array.from({length: remainingBaseline.length + 1}, () =>
    Array<number>(remainingCurrent.length + 1).fill(0),
  );
  for (let left = remainingBaseline.length - 1; left >= 0; left -= 1) {
    for (let right = remainingCurrent.length - 1; right >= 0; right -= 1) {
      table[left]![right] = remainingBaseline[left]!.node.fingerprint === remainingCurrent[right]!.node.fingerprint
        ? 1 + table[left + 1]![right + 1]!
        : Math.max(table[left + 1]![right]!, table[left]![right + 1]!);
    }
  }
  let left = 0;
  let right = 0;
  while (left < remainingBaseline.length && right < remainingCurrent.length) {
    const baselineNode = remainingBaseline[left]!.node;
    const currentNode = remainingCurrent[right]!.node;
    if (baselineNode.fingerprint === currentNode.fingerprint) {
      const correspondence = correspondenceByBaselineId.get(baselineNode.nodeId);
      if (correspondence) rebased.push({...correspondence, sourceNodeId: currentNode.nodeId});
      left += 1;
      right += 1;
    } else if (table[left + 1]![right]! >= table[left]![right + 1]!) {
      left += 1;
    } else {
      right += 1;
    }
  }
  return rebased;
}

function similarity(left: string, right: string): number {
  const leftTokens = new Set(left.toLowerCase().split(/\W+/).filter(Boolean));
  const rightTokens = new Set(right.toLowerCase().split(/\W+/).filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

function structuralScore(source: SemanticNode, target: SemanticNode): number {
  return (source.sectionIndex === target.sectionIndex ? 40 : 0)
    + (source.kind === target.kind ? 20 : 0)
    + (source.siblingIndex === target.siblingIndex ? 20 : 0)
    + (source.headingPath.length === target.headingPath.length ? 10 : 0)
    + Math.round(similarity(source.text, target.text) * 10);
}

function confidence(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 55) return 'medium';
  return 'low';
}

export function alignChanges(
  changes: SemanticChange[],
  target: SemanticDocument,
  history: HistoricalCorrespondence[],
  currentHistory: HistoricalCorrespondence[] = history,
): AlignedChange[] {
  const historyBySource = new Map(history.map((item) => [item.sourceNodeId, item.targetNodeId]));
  const currentHistoryBySource = new Map(currentHistory.map((item) => [item.sourceNodeId, item.targetNodeId]));
  const targetById = new Map(target.nodes.map((node) => [node.nodeId, node]));

  return changes.map((change) => {
    if (change.kind === 'insert') {
      const historicalAnchorId = change.previousSourceNodeId
        ? currentHistoryBySource.get(change.previousSourceNodeId)
        : undefined;
      if (historicalAnchorId && targetById.has(historicalAnchorId)) {
        return {change, confidence: 'high', anchorNodeId: historicalAnchorId, score: 100};
      }
      return {change, confidence: 'low', score: 0, blocker: 'no historically verified insertion anchor found'};
    }

    const source = change.before ?? change.after!;
    const historicalTargetId = historyBySource.get(source.nodeId);
    if (historicalTargetId && targetById.has(historicalTargetId)) {
      const historicalTarget = targetById.get(historicalTargetId)!;
      if (change.kind === 'delete' && historicalTarget.documentIndex === 0) {
        return {change, confidence: 'low', score: 0, blocker: 'deleting the first target block has no reversible insertion anchor'};
      }
      return {change, confidence: 'high', targetNodeId: historicalTargetId, score: 100};
    }

    const scored = target.nodes
      .map((node) => ({node, score: structuralScore(source, node)}))
      .filter(({score}) => score >= 55)
      .sort((left, right) => right.score - left.score);
    const best = scored[0];
    if (!best) {
      return {change, confidence: 'low', score: 0, blocker: 'no structural candidate found'};
    }
    if (scored[1]?.score === best.score) {
      return {change, confidence: 'low', score: best.score, blocker: 'multiple candidates have the same score'};
    }
    if (change.kind === 'delete' && best.node.documentIndex === 0) {
      return {change, confidence: 'low', score: best.score, blocker: 'deleting the first target block has no reversible insertion anchor'};
    }
    return {
      change,
      confidence: confidence(best.score),
      targetNodeId: best.node.nodeId,
      score: best.score,
    };
  });
}
