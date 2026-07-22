import {LocalizeError} from './errors.js';
import type {ResolvedGlossaryTerm} from './glossary.js';
import type {ChangeKind, SemanticNodeKind} from './model.js';
import {assertExactStructuredSlotIds, parseStructuredInlineMarkdown} from './structured-content.js';

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

export interface StructuredTranslationSlot {
  slotId: string;
  sourceText: string;
  targetCurrent?: string;
  preserved: PreservedToken[];
}

export interface StructuredTranslationShape {
  kind: 'list' | 'table';
  topologyHash: string;
  slots: StructuredTranslationSlot[];
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
  structured?: StructuredTranslationShape;
}

export interface TranslationResponse {
  operationId: string;
  translatedText?: string;
  slots?: Array<{slotId: string; translatedText: string}>;
  decision?: 'delete';
  targetNodeKind?: SemanticNodeKind;
}

export type ValidatedTranslation =
  | {operationId: string; decision: 'delete'}
  | {operationId: string; translatedText: string; targetNodeKind: SemanticNodeKind}
  | {
      operationId: string;
      topologyHash: string;
      slots: Array<{slotId: string; translatedText: string}>;
      translatedText: string;
      targetNodeKind: 'list' | 'table';
    };

function countOccurrences(text: string, value: string): number {
  if (!value) return 0;
  return text.split(value).length - 1;
}

function validationError(subtype: string, message: string, details?: unknown): LocalizeError {
  return new LocalizeError({type: 'validation', subtype, message, details});
}

function countParsedInlineCode(text: string, value: string): number {
  return parseStructuredInlineMarkdown(text)
    .filter((part) => part.kind === 'code' && part.text === value)
    .length;
}

function countParsedBoldSpans(text: string): number {
  let count = 0;
  let previousMarks: string | undefined;
  for (const part of parseStructuredInlineMarkdown(text)) {
    if (part.kind !== 'text') {
      previousMarks = undefined;
      continue;
    }
    const marks = JSON.stringify({
      bold: part.bold === true,
      italic: part.italic === true,
      underline: part.underline === true,
      strike: part.strike === true,
    });
    if (part.bold === true && marks !== previousMarks) count += 1;
    previousMarks = marks;
  }
  return count;
}

function countParsedUrl(text: string, value: string): number {
  return parseStructuredInlineMarkdown(text).reduce((count, part) => {
    if (part.kind === 'link') return count + (part.url === value ? 1 : 0);
    if (part.kind === 'text') return count + countOccurrences(part.text, value);
    return count;
  }, 0);
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

function validateTextContent(input: {
  operationId: string;
  sourceText: string;
  translatedText: string;
  preserved: PreservedToken[];
  glossary: ResolvedGlossaryTerm[];
  linkMappings: LinkMapping[];
  slotId?: string;
  structured?: boolean;
}): void {
  const label = input.slotId
    ? `Operation ${input.operationId} slot ${input.slotId}`
    : `Operation ${input.operationId}`;
  for (const token of input.preserved) {
    if (token.kind === 'bold_span') {
      const boldCount = countParsedBoldSpans(input.translatedText);
      if (boldCount !== token.count) {
        throw validationError(
          'preserved_token_mismatch',
          `${label} did not preserve ${token.count} bold span(s).`,
          token,
        );
      }
      continue;
    }
    if (token.kind === 'url') {
      const mapping = input.linkMappings.find((candidate) => candidate.sourceUrl === token.value);
      if (!mapping && token.value.includes('#')) {
        const baseUrl = token.value.slice(0, token.value.indexOf('#'));
        const baseMapping = input.linkMappings.find((candidate) => candidate.sourceUrl === baseUrl);
        if (baseMapping?.targetUrl) {
          throw validationError(
            'unresolved_internal_anchor',
            `${label} has no verified Chinese block mapping for ${token.value}.`,
            {sourceUrl: token.value, targetDocumentUrl: baseMapping.targetUrl},
          );
        }
      }
      if (mapping?.targetUrl) {
        if (
          countParsedUrl(input.translatedText, mapping.targetUrl) !== token.count
          || countParsedUrl(input.translatedText, token.value) !== 0
        ) {
          throw validationError(
            'internal_link_not_localized',
            `${label} must rewrite ${token.value} to ${mapping.targetUrl}.`,
            mapping,
          );
        }
        continue;
      }
      if (countParsedUrl(input.translatedText, token.value) !== token.count) {
        throw validationError(
          'preserved_token_mismatch',
          `${label} did not preserve ${token.kind} ${token.value}.`,
          token,
        );
      }
      continue;
    }
    const actualCount = token.kind === 'inline_code'
      ? countParsedInlineCode(input.translatedText, !input.structured && token.value.startsWith('`') && token.value.endsWith('`')
        ? token.value.slice(1, -1)
        : token.value)
      : countOccurrences(input.translatedText, token.value);
    if (actualCount !== token.count) {
      throw validationError(
        'preserved_token_mismatch',
        `${label} did not preserve ${token.kind} ${token.value}.`,
        token,
      );
    }
  }
  for (const term of input.glossary) {
    for (const variant of term.prohibitedVariants) {
      if (variant && input.translatedText.includes(variant)) {
        throw validationError(
          'prohibited_glossary_variant',
          `${label} contains prohibited glossary variant ${variant}.`,
        );
      }
    }
    if (!input.sourceText.toLowerCase().includes(term.source.toLowerCase())) continue;
    if (term.disposition === 'translate' && term.target && !input.translatedText.includes(term.target)) {
      throw validationError(
        'approved_glossary_missing',
        `${label} must use approved term ${term.target}.`,
      );
    }
    if (term.disposition === 'keep_as_is' && !input.translatedText.includes(term.source)) {
      throw validationError(
        'keep_as_is_missing',
        `${label} must preserve ${term.source}.`,
      );
    }
  }
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
    if (request.structured) {
      if (!/^[a-f0-9]{64}$/.test(request.structured.topologyHash)) {
        throw validationError(
          'structured_topology_mismatch',
          `Operation ${request.operationId} has an invalid immutable topology hash.`,
          {topologyHash: request.structured.topologyHash},
        );
      }
      if (request.targetNodeKind !== request.structured.kind || (
        response.targetNodeKind !== undefined && response.targetNodeKind !== request.targetNodeKind
      )) {
        throw validationError('translation_node_kind_mismatch', `Operation ${request.operationId} changed node kind.`);
      }
      if (response.translatedText !== undefined || response.decision !== undefined || !response.slots) {
        throw validationError(
          'structured_slot_mismatch',
          `Operation ${request.operationId} requires structured slot translations.`,
        );
      }
      assertExactStructuredSlotIds(request.structured.slots, response.slots);
      const slots = response.slots.map((slot, index) => {
        const translatedText = slot.translatedText;
        if (!translatedText.trim()) {
          throw validationError(
            'translation_missing_text',
            `Operation ${request.operationId} slot ${slot.slotId} has no translated text.`,
          );
        }
        const requestedSlot = request.structured!.slots[index]!;
        validateTextContent({
          operationId: request.operationId,
          slotId: requestedSlot.slotId,
          sourceText: requestedSlot.sourceText,
          translatedText,
          preserved: requestedSlot.preserved,
          glossary: request.glossary,
          linkMappings: request.linkMappings,
          structured: true,
        });
        return {slotId: slot.slotId, translatedText};
      });
      return {
        operationId: request.operationId,
        topologyHash: request.structured.topologyHash,
        slots,
        translatedText: slots.map((slot) => slot.translatedText).join('\n'),
        targetNodeKind: request.structured.kind,
      };
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
    validateTextContent({
      operationId: request.operationId,
      sourceText: request.sourceAfter ?? request.sourceBefore ?? '',
      translatedText: text,
      preserved: request.preserved,
      glossary: request.glossary,
      linkMappings: request.linkMappings,
    });
    return {
      operationId: request.operationId,
      translatedText: text,
      targetNodeKind: request.targetNodeKind,
    };
  });
}
