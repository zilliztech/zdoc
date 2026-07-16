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
  | 'title'
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
  sectionIndex: number;
  documentIndex: number;
  siblingIndex: number;
  text: string;
  xml: string;
  writable: boolean;
  fingerprint: string;
  remote: {
    blockId?: string;
    blockIds?: string[];
    token?: string;
    elementName: string;
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

export interface SemanticChange {
  changeId: string;
  kind: ChangeKind;
  before?: SemanticNode;
  after?: SemanticNode;
  previousSourceNodeId?: string;
}

export interface HistoricalCorrespondence {
  sourceNodeId: string;
  targetNodeId: string;
}

export interface AlignedChange {
  change: SemanticChange;
  confidence: AlignmentConfidence;
  targetNodeId?: string;
  anchorNodeId?: string;
  anchorOperationId?: string;
  score: number;
  blocker?: string;
}

export interface DocumentPair {
  pairId: string;
  sourceLocale: 'en';
  targetLocale: 'zh-CN';
  sourceDocUrl: string;
  sourceDocTitle?: string;
  sourceDocToken?: string;
  targetDocUrl?: string;
  targetDocTitle?: string;
  targetDocToken?: string;
  targetParentUrl?: string;
  targetParentToken?: string;
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
  metadata?: Record<string, unknown>;
}
