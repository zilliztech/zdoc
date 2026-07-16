import type {SemanticDocument} from './model.js';

export function isStrictlyEmptyTarget(document: SemanticDocument): boolean {
  return document.nodes.length === 1 && document.nodes[0]?.kind === 'title';
}
