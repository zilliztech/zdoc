import type {SemanticDocument} from './model.js';

export function findReverseInsertionAnchor(
  prewrite: SemanticDocument,
  deletedBlockId: string,
  deletedBlockIds: Set<string>,
): string | undefined {
  const index = prewrite.nodes.findIndex((node) => node.remote.blockId === deletedBlockId);
  for (let candidateIndex = index - 1; candidateIndex >= 0; candidateIndex -= 1) {
    const blockId = prewrite.nodes[candidateIndex]!.remote.blockId;
    if (blockId && !deletedBlockIds.has(blockId)) return blockId;
  }
  return undefined;
}
