import {LocalizeError} from './errors.js';
import type {ResolvedGlossaryTerm} from './glossary.js';
import type {ChangeKind, SemanticNodeKind} from './model.js';

export interface PreservedToken {
  kind: 'inline_code' | 'code_block' | 'url' | 'resource_token' | 'citation';
  value: string;
  count: number;
}

export interface TranslationMemoryExample {
  source: string;
  target: string;
  headingPath: string[];
}

export interface LinkMapping {
  sourceUrl: string;
  targetUrl?: string;
}

export interface TranslationRequest {
  operationId: string;
  changeKind: ChangeKind;
  sourceBefore?: string;
  sourceAfter?: string;
  targetCurrent?: string;
  sectionContext: {source: string; target: string};
  glossary: ResolvedGlossaryTerm[];
  memoryExamples: TranslationMemoryExample[];
  preserved: PreservedToken[];
  linkMappings: LinkMapping[];
  targetNodeKind: SemanticNodeKind;
}

export interface TranslationResponse {
  operationId: string;
  translatedText?: string;
  decision?: 'delete';
  targetNodeKind?: SemanticNodeKind;
}

export type ValidatedTranslation =
  | {operationId: string; decision: 'delete'}
  | {operationId: string; translatedText: string; targetNodeKind: SemanticNodeKind};

function countOccurrences(text: string, value: string): number {
  if (!value) return 0;
  return text.split(value).length - 1;
}

function validationError(subtype: string, message: string, details?: unknown): LocalizeError {
  return new LocalizeError({type: 'validation', subtype, message, details});
}

export function validateTranslations(
  requests: TranslationRequest[],
  responses: TranslationResponse[],
): ValidatedTranslation[] {
  const requestIds = new Set(requests.map((request) => request.operationId));
  const responseIds = responses.map((response) => response.operationId);
  const uniqueResponseIds = new Set(responseIds);
  if (
    uniqueResponseIds.size !== responseIds.length
    || responses.some((response) => !requestIds.has(response.operationId))
    || requests.some((request) => !uniqueResponseIds.has(request.operationId))
  ) {
    throw validationError(
      'translation_operation_mismatch',
      'Translation responses must contain every requested operation exactly once and no unknown operations.',
      {requestIds: [...requestIds], responseIds},
    );
  }

  const responseById = new Map(responses.map((response) => [response.operationId, response]));
  return requests.map((request): ValidatedTranslation => {
    const response = responseById.get(request.operationId)!;
    if (request.changeKind === 'delete') {
      if (response.decision !== 'delete' || response.translatedText !== undefined) {
        throw validationError(
          'delete_decision_required',
          `Deletion ${request.operationId} requires an explicit delete decision.`,
        );
      }
      return {operationId: request.operationId, decision: 'delete'};
    }
    if (request.changeKind === 'move') {
      throw new LocalizeError({
        type: 'unsupported_content',
        subtype: 'move_not_writable',
        message: 'Move operations are report-only in the first release.',
      });
    }
    const text = response.translatedText?.trim();
    if (!text) {
      throw validationError('translation_missing_text', `Operation ${request.operationId} has no translated text.`);
    }
    if (response.targetNodeKind !== request.targetNodeKind) {
      throw validationError('translation_node_kind_mismatch', `Operation ${request.operationId} changed node kind.`);
    }
    for (const token of request.preserved) {
      if (countOccurrences(text, token.value) !== token.count) {
        throw validationError(
          'preserved_token_mismatch',
          `Operation ${request.operationId} did not preserve ${token.kind} ${token.value}.`,
          token,
        );
      }
    }
    for (const term of request.glossary) {
      for (const variant of term.prohibitedVariants) {
        if (variant && text.includes(variant)) {
          throw validationError(
            'prohibited_glossary_variant',
            `Operation ${request.operationId} contains prohibited glossary variant ${variant}.`,
          );
        }
      }
      const source = request.sourceAfter ?? request.sourceBefore ?? '';
      if (!source.toLowerCase().includes(term.source.toLowerCase())) continue;
      if (term.disposition === 'translate' && term.target && !text.includes(term.target)) {
        throw validationError(
          'approved_glossary_missing',
          `Operation ${request.operationId} must use approved term ${term.target}.`,
        );
      }
      if (term.disposition === 'keep_as_is' && !text.includes(term.source)) {
        throw validationError(
          'keep_as_is_missing',
          `Operation ${request.operationId} must preserve ${term.source}.`,
        );
      }
    }
    return {
      operationId: request.operationId,
      translatedText: text,
      targetNodeKind: request.targetNodeKind,
    };
  });
}
