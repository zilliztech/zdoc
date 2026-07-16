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
