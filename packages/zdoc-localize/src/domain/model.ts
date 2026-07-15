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
