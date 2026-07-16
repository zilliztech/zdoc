import {LocalizeError} from './errors.js';
import type {ResolvedGlossaryTerm} from './glossary.js';
import type {ChangeKind, SemanticNodeKind} from './model.js';

export interface PreservedToken {
  kind: 'inline_code' | 'code_block' | 'bold_span' | 'url' | 'resource_token' | 'citation';
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
  warnings: string[];
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

function listOutline(value: string): Array<{indent: number; ordered: boolean}> | undefined {
  const lines = value.split('\n').filter((line) => line.trim());
  const outline: Array<{indent: number; ordered: boolean}> = [];
  for (const line of lines) {
    const match = /^(\s*)(?:(\d+)\.|[-*])\s+/.exec(line);
    if (!match) return undefined;
    outline.push({indent: match[1]!.length, ordered: Boolean(match[2])});
  }
  return outline;
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
    if (request.targetNodeKind === 'list') {
      const sourceOutline = listOutline(request.sourceAfter ?? request.sourceBefore ?? '');
      const translatedOutline = listOutline(text);
      if (!sourceOutline || !translatedOutline || JSON.stringify(sourceOutline) !== JSON.stringify(translatedOutline)) {
        throw validationError(
          'list_structure_mismatch',
          `Operation ${request.operationId} changed the ordered, unordered, or indentation structure of the list.`,
          {sourceOutline, translatedOutline},
        );
      }
    }
    for (const token of request.preserved) {
      if (token.kind === 'bold_span') {
        const boldCount = [...text.matchAll(/\*\*[^*]+\*\*/g)].length;
        if (boldCount !== token.count) {
          throw validationError(
            'preserved_token_mismatch',
            `Operation ${request.operationId} did not preserve ${token.count} bold span(s).`,
            token,
          );
        }
        continue;
      }
      if (token.kind === 'url') {
        const mapping = request.linkMappings.find((candidate) => candidate.sourceUrl === token.value);
        if (!mapping && token.value.includes('#')) {
          const baseUrl = token.value.slice(0, token.value.indexOf('#'));
          const baseMapping = request.linkMappings.find((candidate) => candidate.sourceUrl === baseUrl);
          if (baseMapping?.targetUrl) {
            throw validationError(
              'unresolved_internal_anchor',
              `Operation ${request.operationId} has no verified Chinese block mapping for ${token.value}.`,
              {sourceUrl: token.value, targetDocumentUrl: baseMapping.targetUrl},
            );
          }
        }
        if (mapping?.targetUrl) {
          if (
            countOccurrences(text, mapping.targetUrl) !== token.count
            || countOccurrences(text, token.value) !== 0
          ) {
            throw validationError(
              'internal_link_not_localized',
              `Operation ${request.operationId} must rewrite ${token.value} to ${mapping.targetUrl}.`,
              mapping,
            );
          }
          continue;
        }
      }
      const requiredValue = token.kind === 'inline_code' && !token.value.startsWith('`')
        ? `\`${token.value}\``
        : token.value;
      if (countOccurrences(text, requiredValue) !== token.count) {
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
