import type {DesiredNode, InlineContent} from 'feishu-docx-engine';

import {LocalizeError} from './errors.js';
import {canonicalHash} from './hash.js';
import type {SemanticNodeStructure, StructuredListItem} from './model.js';
import type {PreservedToken, StructuredTranslationSlot} from './translation.js';

export type StructuredContent = Extract<SemanticNodeStructure, {kind: 'list' | 'table'}>;

export interface SlotTranslation {
  slotId: string;
  translatedText: string;
}

interface InlineSlotLocation {
  slotId: string;
  content: InlineContent[];
  replace(content: InlineContent[]): void;
}

interface StringSlotLocation {
  slotId: string;
  value: string;
  replace(value: string): void;
}

type SlotLocation = InlineSlotLocation | StringSlotLocation;

function structuredError(subtype: string, message: string, details?: unknown): LocalizeError {
  return new LocalizeError({type: 'validation', subtype, message, details});
}

function equivalentTextMarks(
  left: Extract<InlineContent, {kind: 'text'}>,
  right: Extract<InlineContent, {kind: 'text'}>,
): boolean {
  return (left.bold === true) === (right.bold === true)
    && (left.italic === true) === (right.italic === true)
    && (left.underline === true) === (right.underline === true)
    && (left.strike === true) === (right.strike === true);
}

function canonicalInlineContent(content: InlineContent[]): InlineContent[] {
  const result: InlineContent[] = [];
  for (const part of content) {
    const previous = result.at(-1);
    if (part.kind === 'text' && previous?.kind === 'text' && equivalentTextMarks(previous, part)) {
      previous.text += part.text;
    } else {
      result.push({...part});
    }
  }
  return result;
}

const escapedInlineCharacters = new Set(['\\', '`', '*', '~', '[', ']', '(', ')', '<', '>']);

function escapeInlineValue(value: string): string {
  return [...value].map((character) => escapedInlineCharacters.has(character) ? `\\${character}` : character).join('');
}

function inlineMarkdown(content: InlineContent[]): string {
  return canonicalInlineContent(content).map((part) => {
    if (part.kind === 'code') return `\`${escapeInlineValue(part.text)}\``;
    if (part.kind === 'link') return `[${escapeInlineValue(part.text)}](${escapeInlineValue(part.url)})`;
    let text = escapeInlineValue(part.text);
    if (part.strike) text = `~~${text}~~`;
    if (part.italic) text = `*${text}*`;
    if (part.bold) text = `**${text}**`;
    if (part.underline) text = `<u>${text}</u>`;
    return text;
  }).join('');
}

function preservedTokens(content: InlineContent[]): PreservedToken[] {
  const tokens = new Map<string, PreservedToken>();
  const add = (kind: PreservedToken['kind'], value: string): void => {
    const key = `${kind}\u0000${value}`;
    const existing = tokens.get(key);
    if (existing) existing.count += 1;
    else tokens.set(key, {kind, value, count: 1});
  };
  for (const part of canonicalInlineContent(content)) {
    if (part.kind === 'code') add('inline_code', part.text);
    else if (part.kind === 'link') add('url', part.url);
    else if (part.bold) add('bold_span', '');
  }
  return [...tokens.values()];
}

function hasTranslatableText(content: InlineContent[]): boolean {
  return content.some((part) => part.kind !== 'code' && part.text.trim().length > 0);
}

function collectListSlots(
  items: StructuredListItem[],
  prefix: string,
  locations: SlotLocation[],
): void {
  items.forEach((item, itemIndex) => {
    const itemPrefix = `${prefix}item-${itemIndex}`;
    if (hasTranslatableText(item.content)) {
      locations.push({
        slotId: `${itemPrefix}/text`,
        content: item.content,
        replace(content: InlineContent[]) {
          item.content = content;
        },
      });
    }
    item.children.forEach((child, childIndex) => {
      collectListSlots(child.items, `${itemPrefix}/child-${childIndex}/`, locations);
    });
  });
}

function collectDesiredNodeSlots(
  node: DesiredNode,
  prefix: string,
  nodeLabel: string,
  locations: SlotLocation[],
): void {
  if (node.kind === 'paragraph' || node.kind === 'heading' || node.kind === 'quote' || node.kind === 'title') {
    if (hasTranslatableText(node.content)) {
      locations.push({
        slotId: `${prefix}${nodeLabel}`,
        content: node.content,
        replace(replacement: InlineContent[]) {
          node.content = replacement;
        },
      });
    }
    return;
  }
  if (node.kind === 'list') {
    collectDesiredListSlots(node.items, `${prefix}${nodeLabel}/`, locations);
    return;
  }
  if (node.kind === 'table') {
    collectTableSlots(node.rows, `${prefix}${nodeLabel}/`, locations);
    return;
  }
  if (node.kind === 'callout') {
    if (node.title?.trim()) {
      locations.push({
        slotId: `${prefix}${nodeLabel}/title`,
        value: node.title,
        replace(value: string) {
          node.title = value;
        },
      });
    }
    collectDesiredNodes(node.children, `${prefix}${nodeLabel}/`, locations);
  }
  // Code is deliberately omitted: it is protected verbatim content, not a slot.
}

function collectDesiredListSlots(
  items: Extract<DesiredNode, {kind: 'list'}>['items'],
  prefix: string,
  locations: SlotLocation[],
): void {
  items.forEach((item, itemIndex) => {
    const itemPrefix = `${prefix}item-${itemIndex}`;
    if (hasTranslatableText(item.content)) {
      locations.push({
        slotId: `${itemPrefix}/text`,
        content: item.content,
        replace(content: InlineContent[]) {
          item.content = content;
        },
      });
    }
    item.children.forEach((child, childIndex) => {
      if (child.kind === 'list') {
        collectDesiredListSlots(child.items, `${itemPrefix}/child-${childIndex}/`, locations);
      } else if (hasTranslatableText(child.content)) {
        locations.push({
          slotId: `${itemPrefix}/child-${childIndex}/paragraph-0`,
          content: child.content,
          replace(content: InlineContent[]) {
            child.content = content;
          },
        });
      }
    });
  });
}

function collectDesiredNodes(nodes: DesiredNode[], prefix: string, locations: SlotLocation[]): void {
  const kindCounts = new Map<DesiredNode['kind'], number>();
  for (const node of nodes) {
    const index = kindCounts.get(node.kind) ?? 0;
    kindCounts.set(node.kind, index + 1);
    collectDesiredNodeSlots(node, prefix, `${node.kind}-${index}`, locations);
  }
}

function collectTableSlots(
  rows: Extract<StructuredContent, {kind: 'table'}>['rows'],
  prefix: string,
  locations: SlotLocation[],
): void {
  rows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, cellIndex) => {
      collectDesiredNodes(cell.content, `${prefix}row-${rowIndex}/cell-${cellIndex}/`, locations);
    });
  });
}

function slotLocations(content: StructuredContent): SlotLocation[] {
  const locations: SlotLocation[] = [];
  if (content.kind === 'list') collectListSlots(content.items, '', locations);
  else collectTableSlots(content.rows, '', locations);
  return locations;
}

export function extractTranslationSlots(content: StructuredContent): StructuredTranslationSlot[] {
  return slotLocations(content).map((location) => {
    if ('content' in location) {
      return {
        slotId: location.slotId,
        sourceText: inlineMarkdown(location.content),
        preserved: preservedTokens(location.content),
      };
    }
    return {slotId: location.slotId, sourceText: location.value, preserved: []};
  });
}

function inlineTopology(content: InlineContent[]): unknown[] {
  return canonicalInlineContent(content).map((part) => {
    if (part.kind === 'code') return {kind: part.kind, text: part.text};
    if (part.kind === 'link') return {kind: part.kind};
    return {
      kind: part.kind,
      bold: part.bold === true,
      italic: part.italic === true,
      underline: part.underline === true,
      strike: part.strike === true,
      ...(part.text.length === 0 ? {empty: true} : {}),
    };
  });
}

function listTopology(items: StructuredListItem[]): unknown[] {
  return items.map((item) => ({
    content: inlineTopology(item.content),
    children: item.children.map((child) => ({
      ordered: child.ordered,
      items: listTopology(child.items),
    })),
  }));
}

function desiredNodeTopology(node: DesiredNode): unknown {
  if (node.kind === 'paragraph' || node.kind === 'heading' || node.kind === 'quote' || node.kind === 'title') {
    return {
      kind: node.kind,
      ...('level' in node ? {level: node.level} : {}),
      content: inlineTopology(node.content),
    };
  }
  if (node.kind === 'list') {
    return {
      kind: node.kind,
      ordered: node.ordered,
      items: node.items.map((item) => ({
        content: inlineTopology(item.content),
        children: item.children.map((child) => child.kind === 'list'
          ? desiredNodeTopology(child)
          : {kind: child.kind, content: inlineTopology(child.content)}),
      })),
    };
  }
  if (node.kind === 'table') {
    return {
      kind: node.kind,
      rows: node.rows.map((row) => ({
        cells: row.cells.map((cell) => ({content: cell.content.map(desiredNodeTopology)})),
      })),
    };
  }
  if (node.kind === 'code') {
    return {kind: node.kind, language: node.language, text: node.text, caption: node.caption};
  }
  if (node.kind === 'callout') {
    return {
      kind: node.kind,
      calloutType: node.calloutType,
      hasTitle: node.title !== undefined,
      children: node.children.map(desiredNodeTopology),
    };
  }
  const exhaustive: never = node;
  return exhaustive;
}

export function structuredTopologyHash(content: StructuredContent): string {
  return canonicalHash(content.kind === 'list'
    ? {kind: content.kind, ordered: content.ordered, items: listTopology(content.items)}
    : {
        kind: content.kind,
        rows: content.rows.map((row) => ({
          cells: row.cells.map((cell) => ({content: cell.content.map(desiredNodeTopology)})),
        })),
      });
}

export function assertExactStructuredSlotIds(
  expected: ReadonlyArray<{slotId: string}>,
  actual: ReadonlyArray<{slotId: string}>,
): void {
  const expectedIds = expected.map((slot) => slot.slotId);
  const actualIds = actual.map((slot) => slot.slotId);
  if (
    new Set(expectedIds).size !== expectedIds.length
    || new Set(actualIds).size !== actualIds.length
    || expectedIds.length !== actualIds.length
    || expectedIds.some((slotId, index) => actualIds[index] !== slotId)
  ) {
    throw structuredError(
      'structured_slot_mismatch',
      'Structured translations must contain every slot exactly once, in immutable topology order.',
      {expectedSlotIds: expectedIds, actualSlotIds: actualIds},
    );
  }
}

function markedText(
  content: InlineContent[],
  marks: Pick<Extract<InlineContent, {kind: 'text'}>, 'bold' | 'italic' | 'underline' | 'strike'>,
): InlineContent[] {
  return content.map((part) => part.kind === 'text' ? {...part, ...marks} : part);
}

function findUnescaped(value: string, marker: string, start: number): number {
  for (let index = start; index <= value.length - marker.length; index += 1) {
    if (value[index] === '\\') {
      index += 1;
      continue;
    }
    if (value.startsWith(marker, index)) return index;
  }
  return -1;
}

function decodeEscapedValue(value: string): string {
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]!;
    if (character === '\\' && index + 1 < value.length && escapedInlineCharacters.has(value[index + 1]!)) {
      result += value[index + 1]!;
      index += 1;
    } else {
      result += character;
    }
  }
  return result;
}

function parseLink(value: string, offset: number): {content: InlineContent; end: number} | undefined {
  const labelEnd = findUnescaped(value, ']', offset + 1);
  if (labelEnd < 0 || value[labelEnd + 1] !== '(') return undefined;
  let depth = 1;
  let urlEnd = labelEnd + 2;
  for (; urlEnd < value.length; urlEnd += 1) {
    if (value[urlEnd] === '\\') {
      urlEnd += 1;
      continue;
    }
    if (value[urlEnd] === '(') depth += 1;
    else if (value[urlEnd] === ')' && --depth === 0) break;
  }
  if (depth !== 0) return undefined;
  return {
    content: {
      kind: 'link',
      text: decodeEscapedValue(value.slice(offset + 1, labelEnd)),
      url: decodeEscapedValue(value.slice(labelEnd + 2, urlEnd)),
    },
    end: urlEnd + 1,
  };
}

export function parseStructuredInlineMarkdown(value: string): InlineContent[] {
  const parts: InlineContent[] = [];
  let plainText = '';
  let offset = 0;
  const flushPlainText = (): void => {
    if (!plainText) return;
    parts.push({kind: 'text', text: plainText});
    plainText = '';
  };
  const wrapped = (
    open: string,
    close: string,
    marks: Pick<Extract<InlineContent, {kind: 'text'}>, 'bold' | 'italic' | 'underline' | 'strike'>,
  ): boolean => {
    if (!value.startsWith(open, offset)) return false;
    const closeIndex = findUnescaped(value, close, offset + open.length);
    if (closeIndex < 0) return false;
    flushPlainText();
    parts.push(...markedText(
      parseStructuredInlineMarkdown(value.slice(offset + open.length, closeIndex)),
      marks,
    ));
    offset = closeIndex + close.length;
    return true;
  };
  while (offset < value.length) {
    if (value[offset] === '\\' && offset + 1 < value.length && escapedInlineCharacters.has(value[offset + 1]!)) {
      plainText += value[offset + 1]!;
      offset += 2;
      continue;
    }
    if (wrapped('<u>', '</u>', {underline: true})) continue;
    if (wrapped('***', '***', {bold: true, italic: true})) continue;
    if (wrapped('**', '**', {bold: true})) continue;
    if (wrapped('~~', '~~', {strike: true})) continue;
    if (wrapped('*', '*', {italic: true})) continue;
    if (value[offset] === '`') {
      const closeIndex = findUnescaped(value, '`', offset + 1);
      if (closeIndex >= 0) {
        flushPlainText();
        parts.push({kind: 'code', text: decodeEscapedValue(value.slice(offset + 1, closeIndex))});
        offset = closeIndex + 1;
        continue;
      }
    }
    if (value[offset] === '[') {
      const link = parseLink(value, offset);
      if (link) {
        flushPlainText();
        parts.push(link.content);
        offset = link.end;
        continue;
      }
    }
    plainText += value[offset]!;
    offset += 1;
  }
  flushPlainText();
  return parts.length > 0 ? parts : [{kind: 'text', text: value}];
}

export function applySlotTranslations<T extends StructuredContent>(
  content: T,
  translations: SlotTranslation[],
  expectedTopologyHash = structuredTopologyHash(content),
): T {
  const actualTopologyHash = structuredTopologyHash(content);
  if (actualTopologyHash !== expectedTopologyHash) {
    throw structuredError(
      'structured_topology_mismatch',
      'Structured content topology no longer matches the reviewed topology hash.',
      {expectedTopologyHash, actualTopologyHash},
    );
  }

  const result = structuredClone(content);
  const locations = slotLocations(result);
  assertExactStructuredSlotIds(locations, translations);
  translations.forEach((translation, index) => {
    const location = locations[index]!;
    const translatedText = translation.translatedText;
    if (!translatedText.trim()) {
      throw structuredError(
        'translation_missing_text',
        `Structured slot ${translation.slotId} has no translated text.`,
      );
    }
    if ('content' in location) location.replace(canonicalInlineContent(parseStructuredInlineMarkdown(translatedText)));
    else location.replace(translatedText);
  });

  const translatedTopologyHash = structuredTopologyHash(result);
  if (translatedTopologyHash !== expectedTopologyHash) {
    throw structuredError(
      'structured_topology_mismatch',
      'A structured translation changed protected content or topology.',
      {expectedTopologyHash, translatedTopologyHash},
    );
  }
  return result;
}
