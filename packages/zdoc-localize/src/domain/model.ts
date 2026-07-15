export type RunState =
  | 'scanning'
  | 'classification_required'
  | 'translation_required'
  | 'review_required'
  | 'stale'
  | 'applying'
  | 'verifying'
  | 'completed'
  | 'blocked'
  | 'partial'
  | 'recovering';

export type DocumentMode = 'mirror' | 'selective' | 'independent' | 'excluded';
export type AlignmentConfidence = 'high' | 'medium' | 'low';
export type ChangeKind = 'insert' | 'replace' | 'delete' | 'move';

export type SemanticNodeKind =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'quote'
  | 'callout'
  | 'code'
  | 'table'
  | 'image'
  | 'whiteboard'
  | 'resource'
  | 'opaque';

export interface SemanticNode {
  nodeId: string;
  kind: SemanticNodeKind;
  headingPath: string[];
  siblingIndex: number;
  text: string;
  xml: string;
  writable: boolean;
  fingerprint: string;
  remote: {
    blockId?: string;
    token?: string;
    attributes: Record<string, string>;
  };
}

export interface SemanticSection {
  headingPath: string[];
  headingNodeId: string;
  nodes: SemanticNode[];
}

export interface SemanticDocument {
  documentId: string;
  revisionId: number;
  title: string;
  nodes: SemanticNode[];
  sections: SemanticSection[];
  canonicalHash: string;
  rawXml: string;
}

export interface DocumentPair {
  pairId: string;
  sourceLocale: 'en';
  targetLocale: 'zh-CN';
  sourceDocUrl: string;
  sourceDocToken?: string;
  targetDocUrl?: string;
  targetDocToken?: string;
  targetParentUrl?: string;
  mode: DocumentMode;
  productScope?: string;
  versionScope?: string;
  environmentScope?: string;
  status: 'active' | 'needs_bootstrap' | 'blocked' | 'disabled';
}

export interface RunRecord {
  runId: string;
  pairId: string;
  state: RunState;
  createdAt: string;
  updatedAt: string;
  sourceFromRevision?: number;
  sourceToRevision?: number;
  targetPlanRevision?: number;
  errorType?: string;
  errorDetail?: unknown;
}
