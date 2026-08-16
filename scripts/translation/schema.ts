export type ReconciliationTarget = 'ja-JP' | 'zh-CN-reference';
export type ReconciliationGroup = 'guides' | 'python' | 'java' | 'node' | 'go' | 'cli' | 'rest' | 'reference-landings';
export type ReconciliationOperationKind = 'delete_target' | 'replace_path' | 'remove_navigation_only' | 'preserve_target';
export type ReconciliationOperationReason = 'source_deleted' | 'source_replaced' | 'navigation_removed' | 'reviewed_exception';
export type ReconciliationAuthorizationStatus = 'approved' | 'review_required' | 'rejected';
export type ReconciliationAuthorizationMethod = 'automatic' | 'human' | 'legacy' | 'none';
export type ReconciliationResultStatus = 'applied' | 'already_applied' | 'review_required' | 'rejected' | 'failed';

export type ReconciliationEvidence = Readonly<{
  sourceExistedAtBaseline: boolean;
  sourceMissingAtCheckpoint: boolean;
  targetExistsAtBaseline: boolean;
  mappingIsCanonical: true;
  ownedByGroup: true;
  preserved: boolean;
  generatorCompletenessReceipt: string | null;
}>;

export type ReconciliationAuthorization = Readonly<{
  status: ReconciliationAuthorizationStatus;
  method: ReconciliationAuthorizationMethod;
  ruleId: string | null;
  receiptSha256: string | null;
}>;

export type ReconciliationOperation = Readonly<{
  operationId: string;
  kind: ReconciliationOperationKind;
  sourcePath: string;
  targetPath: string;
  replacementSourcePath: string | null;
  replacementTargetPath: string | null;
  reason: ReconciliationOperationReason;
  evidence: ReconciliationEvidence;
  authorization: ReconciliationAuthorization;
}>;

export type ReconciliationPlan = Readonly<{
  schemaVersion: 1;
  document: 'translation-reconciliation-plan';
  target: ReconciliationTarget;
  group: ReconciliationGroup;
  toolingSha: string;
  sourceBaselineSha: string;
  sourceCheckpointSha: string;
  targetBaselineSha: string;
  policyId: string;
  operations: readonly ReconciliationOperation[];
  planSha256: string;
}>;

export type ReconciliationResultOperation = Readonly<{
  operationId: string;
  status: ReconciliationResultStatus;
  removedPaths: readonly string[];
  removedStateKeys: readonly string[];
}>;

export type ReconciliationResult = Readonly<{
  schemaVersion: 1;
  document: 'translation-reconciliation-result';
  planSha256: string;
  targetBaselineSha: string;
  status: ReconciliationResultStatus;
  operations: readonly ReconciliationResultOperation[];
  resultSha256: string;
}>;
