import type {DesiredNode} from 'feishu-docx-engine';

import {LocalizeError} from './errors.js';
import {canonicalHash} from './hash.js';
import type {
  ApprovedReviewOperation,
  AlignmentConfidence,
  ChangeKind,
  SemanticNodeKind,
} from './model.js';
import {
  applySlotTranslations,
  renderStructuredInlineMarkdown,
  type StructuredContent,
  type StructuredContentKind,
} from './structured-content.js';
import type {StructuredTranslationSlot} from './translation.js';

export type {ApprovedReviewOperation} from './model.js';

export interface StructuredReviewShape {
  kind: StructuredContentKind;
  topologyVersion?: number;
  topologyHash: string;
  sourceStructure: StructuredContent;
  slots: Array<StructuredTranslationSlot & {proposedText: string}>;
}

export interface PlanOperation {
  operationId: string;
  policy?: OperationPolicy;
  effect?: OperationEffect;
  kind: ChangeKind;
  confidence: AlignmentConfidence;
  sourceBefore?: string;
  sourceAfter?: string;
  sourceNodeId?: string;
  sourceNodeHash?: string;
  sourceMemoryIdentity?: string;
  sourceProviderHash?: string;
  sourceHeadingPath?: string[];
  targetCurrent?: string;
  proposedText: string;
  targetNodeKind: SemanticNodeKind;
  targetElementName?: string;
  targetAttributes?: Record<string, string>;
  targetNodeId?: string;
  targetBlockId?: string;
  targetBlockIds?: string[];
  targetNodeHash?: string;
  anchorNodeId?: string;
  anchorOperationId?: string;
  anchorBlockId?: string;
  anchorNodeHash?: string;
  preserved?: Array<{kind: string; value: string; count: number}>;
  sourceDocumentId?: string;
  sourceBlockId?: string;
  sourceResourceToken?: string;
  sourceResourceRawHash?: string;
  sourceResourceHash?: string;
  targetResourceToken?: string;
  sourceXml?: string;
  structured?: StructuredReviewShape;
}

export type OperationPolicy =
  | 'translation'
  | 'verbatim_code'
  | 'whiteboard_mirror'
  | 'manual_synced_reference'
  | 'verify_synced_reference'
  | 'delete';

export type OperationEffect = 'write' | 'mirror' | 'manual' | 'verify_only' | 'delete';

export interface LocalizationPlan {
  planVersion: 1 | 2 | 3;
  runId: string;
  pairId: string;
  sourceRevision: number;
  targetRevision: number;
  sourceHash: string;
  targetHash: string;
  operations: PlanOperation[];
}

export interface ApprovedReview {
  planHash: string;
  operations: ApprovedReviewOperation[];
}

function field(value: string | undefined): string {
  return value?.trim() ? value : '(none)';
}

function semanticListMarkdown(
  items: Extract<StructuredContent, {kind: 'list'}>['items'],
  ordered: boolean,
  depth = 0,
): string {
  return items.flatMap((item, index) => {
    const marker = ordered ? `${index + 1}.` : '-';
    return [
      `${'  '.repeat(depth)}${marker} ${renderStructuredInlineMarkdown(item.content)}`,
      ...item.children.flatMap((child) => child.kind === 'paragraph'
        ? [`${'  '.repeat(depth + 1)}${renderStructuredInlineMarkdown(child.content)}`]
        : semanticListMarkdown(child.items, child.ordered, depth + 1).split('\n')),
    ];
  }).join('\n');
}

function desiredListMarkdown(
  node: Extract<DesiredNode, {kind: 'list'}>,
  depth = 0,
): string {
  return node.items.flatMap((item, index) => {
    const marker = node.ordered ? `${index + 1}.` : '-';
    const children = item.children.flatMap((child) => child.kind === 'list'
      ? desiredListMarkdown(child, depth + 1).split('\n')
      : [`${'  '.repeat(depth + 1)}${renderStructuredInlineMarkdown(child.content)}`]);
    return [`${'  '.repeat(depth)}${marker} ${renderStructuredInlineMarkdown(item.content)}`, ...children];
  }).join('\n');
}

function desiredNodeMarkdown(node: DesiredNode): string {
  if (node.kind === 'paragraph' || node.kind === 'heading' || node.kind === 'quote' || node.kind === 'title') {
    return renderStructuredInlineMarkdown(node.content);
  }
  if (node.kind === 'list') return desiredListMarkdown(node);
  if (node.kind === 'code') {
    const caption = node.caption ? ` (${node.caption})` : '';
    return `\`${node.text.replaceAll('`', '\\`')}\`${caption}`;
  }
  if (node.kind === 'callout') {
    return [node.title, ...node.children.map(desiredNodeMarkdown)].filter(Boolean).join('\n');
  }
  return tableMarkdown(node);
}

function tableMarkdown(table: Extract<StructuredContent, {kind: 'table'}>): string {
  const columns = Math.max(0, ...table.rows.map((row) => row.cells.length));
  const header = ['Row', ...Array.from({length: columns}, (_, index) => `Cell ${index + 1}`)];
  const separator = header.map(() => '---');
  const rows = table.rows.map((row, rowIndex) => [
    String(rowIndex + 1),
    ...Array.from({length: columns}, (_, cellIndex) => {
      const cell = row.cells[cellIndex];
      if (!cell) return '(empty)';
      const value = cell.content.map(desiredNodeMarkdown).join('\n');
      return field(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
    }),
  ]);
  return [header, separator, ...rows].map((row) => `| ${row.join(' | ')} |`).join('\n');
}

function structuredContentMarkdown(content: StructuredContent): string {
  if (content.kind === 'list') return semanticListMarkdown(content.items, content.ordered);
  if (content.kind === 'table') return tableMarkdown(content);
  return desiredNodeMarkdown(content);
}

function structuredOverview(operation: PlanOperation): string {
  const structured = operation.structured!;
  const proposedStructure = applySlotTranslations(
    structured.sourceStructure,
    structured.slots.map((slot) => ({slotId: slot.slotId, translatedText: slot.proposedText})),
  );
  const dimensions = structured.sourceStructure.kind === 'table'
    ? `\n\nRows: ${structured.sourceStructure.rows.length}\n\nColumns: ${Math.max(0, ...structured.sourceStructure.rows.map((row) => row.cells.length))}`
    : '';
  return `### Structured ${structured.kind} · ${structured.slots.length} editable slots

Topology hash: ${structured.topologyHash}
${dimensions}

#### English source structure

${structuredContentMarkdown(structured.sourceStructure)}

#### Proposed target structure

${structuredContentMarkdown(proposedStructure)}`;
}

function structuredEditableSlots(operation: PlanOperation): string {
  return operation.structured!.slots.map((slot) => `#### Slot \`${slot.slotId}\`

English: ${field(slot.sourceText)}

Current Chinese: ${field(slot.targetCurrent)}

<!-- BEGIN EDITABLE TRANSLATION op:${operation.operationId} slot:${slot.slotId} -->
${slot.proposedText}
<!-- END EDITABLE TRANSLATION op:${operation.operationId} slot:${slot.slotId} -->`).join('\n\n');
}

export function compileReview(plan: LocalizationPlan): string {
  const planHash = canonicalHash(plan);
  const sections = plan.operations.map((operation, index) => {
    const header = `## Change ${index + 1} · ${operation.kind}

Operation: ${operation.operationId}

Confidence: ${operation.confidence}`;
    const policy = operation.policy ?? (operation.kind === 'delete' ? 'delete' : 'translation');
    if (policy !== 'translation' && policy !== 'delete') {
      return `${header}

Policy: ${policy}

Effect: ${operation.effect ?? '(none)'}

Source document: ${field(operation.sourceDocumentId)}

Source block: ${field(operation.sourceBlockId)}

Source resource: ${field(operation.sourceResourceToken)}

Target block: ${field(operation.targetBlockId)}

Target resource: ${field(operation.targetResourceToken)}

### Protected action

This operation is planned and reviewable, but it has no editable translation text.

Protected content: ${field(operation.proposedText)}`;
    }
    if (operation.structured) {
      return `${header}

Policy: ${policy}

Effect: ${operation.effect ?? '(none)'}

${structuredOverview(operation)}

### Editable structured slots

${structuredEditableSlots(operation)}`;
    }
    return `${header}

### English before

${field(operation.sourceBefore)}

### English after

${field(operation.sourceAfter)}

### Current Chinese

${field(operation.targetCurrent)}

### Approved Chinese

<!-- BEGIN EDITABLE TRANSLATION op:${operation.operationId} -->
${operation.proposedText}
<!-- END EDITABLE TRANSLATION op:${operation.operationId} -->`;
  });

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
const structuredEditablePattern = /<!-- BEGIN EDITABLE TRANSLATION op:([^\s]+) slot:([^\s]+) -->\n([\s\S]*?)\n<!-- END EDITABLE TRANSLATION op:\1 slot:\2 -->/g;

function masked(review: string): string {
  return review
    .replace(structuredEditablePattern, (_match, operationId: string, slotId: string) =>
      `<!-- BEGIN EDITABLE TRANSLATION op:${operationId} slot:${slotId} -->\n<EDITABLE>\n<!-- END EDITABLE TRANSLATION op:${operationId} slot:${slotId} -->`,
    )
    .replace(editablePattern, (_match, operationId: string) =>
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
  const structuredMatches = [...review.matchAll(structuredEditablePattern)];
  const editableOperations = plan.operations.filter((operation) => {
    const policy = operation.policy ?? (operation.kind === 'delete' ? 'delete' : 'translation');
    return policy === 'translation' || policy === 'delete';
  });
  const expectedIds = editableOperations.flatMap((operation) => operation.structured
    ? operation.structured.slots.map((slot) => `${operation.operationId}\u0000${slot.slotId}`)
    : [operation.operationId]);
  const orderedActualIds = [...review.matchAll(/<!-- BEGIN EDITABLE TRANSLATION op:([^\s]+)(?: slot:([^\s]+))? -->/g)]
    .map((match) => match[2] ? `${match[1]}\u0000${match[2]}` : match[1]!);
  if (orderedActualIds.length !== expectedIds.length || orderedActualIds.some((id, index) => id !== expectedIds[index])) {
    throw reviewError(
      'review_operation_mismatch',
      'Review operation markers are missing, duplicated, unknown, or reordered.',
      {expectedIds, actualIds: orderedActualIds},
    );
  }

  const editableById = new Map(matches.map((match) => [match[1]!, match[2]!.trim()]));
  const structuredById = new Map(structuredMatches.map((match) => [
    `${match[1]}\u0000${match[2]}`,
    match[3]!,
  ]));
  const operations = plan.operations.map((operation): ApprovedReviewOperation => {
    const policy = operation.policy ?? (operation.kind === 'delete' ? 'delete' : 'translation');
    if (policy !== 'translation' && policy !== 'delete') {
      return {operationId: operation.operationId, decision: 'protected'};
    }
    if (operation.structured) {
      const approvedSlots = operation.structured.slots.map((slot) => {
        const approvedText = structuredById.get(`${operation.operationId}\u0000${slot.slotId}`) ?? '';
        if (!approvedText.trim()) {
          throw reviewError(
            'review_translation_blank',
            `Operation ${operation.operationId} slot ${slot.slotId} has a blank approved translation.`,
          );
        }
        return {slotId: slot.slotId, approvedText};
      });
      return {operationId: operation.operationId, approvedSlots};
    }
    const text = editableById.get(operation.operationId) ?? '';
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
