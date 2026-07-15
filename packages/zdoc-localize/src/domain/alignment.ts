import type {
  AlignedChange,
  HistoricalCorrespondence,
  SemanticChange,
  SemanticDocument,
  SemanticNode,
} from './model.js';

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
): AlignedChange[] {
  const historyBySource = new Map(history.map((item) => [item.sourceNodeId, item.targetNodeId]));
  const targetById = new Map(target.nodes.map((node) => [node.nodeId, node]));

  return changes.map((change) => {
    if (change.kind === 'insert') {
      const historicalAnchorId = change.previousSourceNodeId
        ? historyBySource.get(change.previousSourceNodeId)
        : undefined;
      if (historicalAnchorId && targetById.has(historicalAnchorId)) {
        return {change, confidence: 'high', anchorNodeId: historicalAnchorId, score: 100};
      }
      const source = change.after!;
      const sameSection = target.nodes.filter((node) => node.sectionIndex === source.sectionIndex);
      const anchor = sameSection.at(-1);
      return anchor
        ? {change, confidence: 'medium', anchorNodeId: anchor.nodeId, score: 60}
        : {change, confidence: 'low', score: 0, blocker: 'no insertion anchor found'};
    }

    const source = change.before ?? change.after!;
    const historicalTargetId = historyBySource.get(source.nodeId);
    if (historicalTargetId && targetById.has(historicalTargetId)) {
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
    return {
      change,
      confidence: confidence(best.score),
      targetNodeId: best.node.nodeId,
      score: best.score,
    };
  });
}
