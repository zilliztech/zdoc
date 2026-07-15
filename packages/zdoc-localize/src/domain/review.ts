import {LocalizeError} from './errors.js';
import {canonicalHash} from './hash.js';
import type {
  AlignmentConfidence,
  ChangeKind,
  SemanticNodeKind,
} from './model.js';

export interface PlanOperation {
  operationId: string;
  kind: ChangeKind;
  confidence: AlignmentConfidence;
  sourceBefore?: string;
  sourceAfter?: string;
  sourceNodeId?: string;
  sourceNodeHash?: string;
  sourceHeadingPath?: string[];
  targetCurrent?: string;
  proposedText: string;
  targetNodeKind: SemanticNodeKind;
  targetElementName?: string;
  targetAttributes?: Record<string, string>;
  targetNodeId?: string;
  targetBlockId?: string;
  targetNodeHash?: string;
  anchorNodeId?: string;
  anchorOperationId?: string;
  anchorBlockId?: string;
  anchorNodeHash?: string;
  preserved?: Array<{kind: string; value: string; count: number}>;
}

export interface LocalizationPlan {
  planVersion: 1;
  runId: string;
  pairId: string;
  sourceRevision: number;
  targetRevision: number;
  sourceHash: string;
  targetHash: string;
  operations: PlanOperation[];
}

export type ApprovedReviewOperation =
  | {operationId: string; approvedText: string}
  | {operationId: string; decision: 'delete'};

export interface ApprovedReview {
  planHash: string;
  operations: ApprovedReviewOperation[];
}

function field(value: string | undefined): string {
  return value?.trim() ? value : '(none)';
}

export function compileReview(plan: LocalizationPlan): string {
  const planHash = canonicalHash(plan);
  const sections = plan.operations.map((operation, index) => `## Change ${index + 1} · ${operation.kind}

Operation: ${operation.operationId}

Confidence: ${operation.confidence}

### English before

${field(operation.sourceBefore)}

### English after

${field(operation.sourceAfter)}

### Current Chinese

${field(operation.targetCurrent)}

### Approved Chinese

<!-- BEGIN EDITABLE TRANSLATION op:${operation.operationId} -->
${operation.proposedText}
<!-- END EDITABLE TRANSLATION op:${operation.operationId} -->`);

  return `# ZDoc Localization Review

<!-- ZDOC-LOCALIZE PLAN sha256:${planHash} -->

Run: ${plan.runId}

Pair: ${plan.pairId}

Source revision: ${plan.sourceRevision}

Target revision: ${plan.targetRevision}

${sections.join('\n\n---\n\n')}
`;
}

const editablePattern = /<!-- BEGIN EDITABLE TRANSLATION op:([^\s]+) -->\n([\s\S]*?)\n<!-- END EDITABLE TRANSLATION op:\1 -->/g;

function masked(review: string): string {
  return review.replace(editablePattern, (_match, operationId: string) =>
    `<!-- BEGIN EDITABLE TRANSLATION op:${operationId} -->\n<EDITABLE>\n<!-- END EDITABLE TRANSLATION op:${operationId} -->`,
  );
}

function reviewError(subtype: string, message: string, details?: unknown): LocalizeError {
  return new LocalizeError({type: 'validation', subtype, message, details});
}

export function parseReview(review: string, plan: LocalizationPlan): ApprovedReview {
  const expected = compileReview(plan);
  if (masked(review) !== masked(expected)) {
    throw reviewError(
      'review_metadata_changed',
      'Only text inside editable translation markers may be changed.',
    );
  }

  const matches = [...review.matchAll(editablePattern)];
  const expectedIds = plan.operations.map((operation) => operation.operationId);
  const actualIds = matches.map((match) => match[1]);
  if (actualIds.length !== expectedIds.length || actualIds.some((id, index) => id !== expectedIds[index])) {
    throw reviewError(
      'review_operation_mismatch',
      'Review operation markers are missing, duplicated, unknown, or reordered.',
      {expectedIds, actualIds},
    );
  }

  const operations = plan.operations.map((operation, index): ApprovedReviewOperation => {
    const text = matches[index]![2]!.trim();
    if (operation.kind === 'delete') {
      if (text !== 'DELETE') {
        throw reviewError(
          'delete_review_changed',
          `Deletion ${operation.operationId} must remain explicitly marked DELETE.`,
        );
      }
      return {operationId: operation.operationId, decision: 'delete'};
    }
    if (!text) {
      throw reviewError(
        'review_translation_blank',
        `Operation ${operation.operationId} has a blank approved translation.`,
      );
    }
    return {operationId: operation.operationId, approvedText: text};
  });

  return {planHash: canonicalHash(plan), operations};
}
