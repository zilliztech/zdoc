import {
  calloutToXml,
  decodeSnapshotNode,
  decodeSnapshotRoots,
  providerBlocksToXml,
  tableToXml,
  type DesiredListNode,
  type DesiredNode,
  type DocumentSnapshot,
  type InlineContent,
  type ProviderBlock,
  type SnapshotNode,
} from 'feishu-docx-engine';

import type {
  SemanticDocument,
  SemanticNode,
  SemanticNodeKind,
  SemanticNodeStructure,
  SemanticSection,
  StructuredListItem,
} from './model.js';
import {canonicalHash} from './hash.js';

type RecordValue = Record<string, unknown>;

const codeLanguages = new Map<number, string>([
  [1, 'plaintext'],
  [7, 'bash'],
  [9, 'cpp'],
  [10, 'c'],
  [12, 'css'],
  [15, 'dart'],
  [18, 'dockerfile'],
  [19, 'erlang'],
  [22, 'go'],
  [23, 'groovy'],
  [24, 'html'],
  [26, 'http'],
  [27, 'haskell'],
  [28, 'json'],
  [29, 'java'],
  [30, 'javascript'],
  [32, 'kotlin'],
  [33, 'latex'],
  [34, 'lisp'],
  [36, 'lua'],
  [37, 'matlab'],
  [38, 'makefile'],
  [40, 'markdown'],
  [41, 'nginx'],
  [44, 'php'],
  [45, 'perl'],
  [47, 'powershell'],
  [48, 'protobuf'],
  [49, 'python'],
  [50, 'python'],
  [52, 'ruby'],
  [53, 'rust'],
  [55, 'scss'],
  [56, 'scheme'],
  [57, 'sql'],
  [58, 'scala'],
  [59, 'swift'],
  [60, 'thrift'],
  [62, 'shell'],
  [64, 'typescript'],
  [65, 'vb'],
  [66, 'xml'],
  [67, 'yaml'],
  [68, 'cmake'],
  [69, 'diff'],
  [70, 'gherkin'],
  [71, 'graphql'],
  [73, 'properties'],
  [74, 'solidity'],
  [75, 'toml'],
]);

function asRecord(value: unknown): RecordValue | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as RecordValue
    : undefined;
}

function requiredRecord(value: unknown, location: string): RecordValue {
  const record = asRecord(value);
  if (!record) throw new Error(`${location} must be an object.`);
  return record;
}

function asProviderBlock(node: SnapshotNode): ProviderBlock {
  return node.raw as ProviderBlock;
}

function payload(node: SnapshotNode, key: string): RecordValue {
  return requiredRecord(node.raw[key], `${node.blockId}.${key}`);
}

function inlineContent(value: unknown, location: string): InlineContent[] {
  const container = requiredRecord(value, location);
  if (!Array.isArray(container.elements)) {
    throw new Error(`${location}.elements must be an array.`);
  }
  return container.elements.map((elementValue, index) => {
    const element = requiredRecord(elementValue, `${location}.elements[${index}]`);
    const run = requiredRecord(element.text_run, `${location}.elements[${index}].text_run`);
    if (typeof run.content !== 'string') {
      throw new Error(`${location}.elements[${index}].text_run.content must be a string.`);
    }
    const style = run.text_element_style === undefined
      ? {}
      : requiredRecord(run.text_element_style, `${location}.elements[${index}].text_run.text_element_style`);
    const unsupportedStyle = Object.keys(style).find((key) =>
      !['bold', 'italic', 'underline', 'strikethrough', 'inline_code', 'link'].includes(key),
    );
    if (unsupportedStyle) {
      throw new Error(`${location}.elements[${index}] has unsupported style ${unsupportedStyle}.`);
    }
    for (const key of ['bold', 'italic', 'underline', 'strikethrough', 'inline_code']) {
      if (style[key] !== undefined && typeof style[key] !== 'boolean') {
        throw new Error(`${location}.elements[${index}] style ${key} must be boolean.`);
      }
    }
    const link = style.link === undefined
      ? undefined
      : requiredRecord(style.link, `${location}.elements[${index}].text_run.text_element_style.link`);

    if (link) {
      if (typeof link.url !== 'string') {
        throw new Error(`${location}.elements[${index}] link URL must be a string.`);
      }
      if (Object.keys(link).some((key) => key !== 'url')) {
        throw new Error(`${location}.elements[${index}] has unsupported link metadata.`);
      }
      return {
        kind: 'link',
        text: run.content,
        url: link.url,
        ...(style.bold === true ? {bold: true} : {}),
        ...(style.italic === true ? {italic: true} : {}),
        ...(style.underline === true ? {underline: true} : {}),
        ...(style.strikethrough === true ? {strike: true} : {}),
        ...(style.inline_code === true ? {inlineCode: true} : {}),
      };
    }
    if (style.inline_code === true) {
      if (['bold', 'italic', 'underline', 'strikethrough'].some((key) => style[key] === true)) {
        throw new Error(`${location}.elements[${index}] combines inline code with unsupported styles.`);
      }
      return {kind: 'code', text: run.content};
    }
    return {
      kind: 'text',
      text: run.content,
      ...(style.bold === true ? {bold: true} : {}),
      ...(style.italic === true ? {italic: true} : {}),
      ...(style.underline === true ? {underline: true} : {}),
      ...(style.strikethrough === true ? {strike: true} : {}),
    };
  });
}

function inlineText(content: InlineContent[]): string {
  return content.map((part) => part.text).join('');
}

function headingLevel(node: SnapshotNode): 1 | 2 | 3 | 4 | 5 | 6 {
  const level = node.blockType - 2;
  if (!Number.isInteger(level) || level < 1 || level > 6) {
    throw new Error(`${node.blockId} has unsupported heading level ${level}.`);
  }
  return level as 1 | 2 | 3 | 4 | 5 | 6;
}

function listOrdered(node: SnapshotNode): boolean {
  if (node.blockType === 12 && asRecord(node.raw.bullet)) return false;
  if (node.blockType === 13 && asRecord(node.raw.ordered)) return true;
  throw new Error(`${node.blockId} is not a supported list block.`);
}

function safeListOrdered(node: SnapshotNode): boolean | undefined {
  try {
    return listOrdered(node);
  } catch {
    return undefined;
  }
}

function listItem(
  node: SnapshotNode,
  nodesById: ReadonlyMap<string, SnapshotNode>,
): StructuredListItem {
  const ordered = listOrdered(node);
  const content = inlineContent(payload(node, ordered ? 'ordered' : 'bullet'), `${node.blockId}.${ordered ? 'ordered' : 'bullet'}`);
  const children: StructuredListItem['children'] = [];
  let active: {ordered: boolean; items: StructuredListItem[]} | undefined;
  for (const childId of node.childBlockIds) {
    const child = nodesById.get(childId);
    if (!child || child.kind !== 'list') {
      throw new Error(`${node.blockId} contains an unsupported non-list child ${childId}.`);
    }
    const childOrdered = listOrdered(child);
    if (!active || active.ordered !== childOrdered) {
      active = {ordered: childOrdered, items: []};
      children.push(active);
    }
    active.items.push(listItem(child, nodesById));
  }
  return {content, children};
}

function listBlockIds(nodes: SnapshotNode[], nodesById: ReadonlyMap<string, SnapshotNode>): string[] {
  const ids: string[] = [];
  const visit = (node: SnapshotNode): void => {
    ids.push(node.blockId);
    for (const childId of node.childBlockIds) {
      const child = nodesById.get(childId);
      if (child) visit(child);
    }
  };
  nodes.forEach(visit);
  return ids;
}

function structuredListItem(
  item: DesiredListNode['items'][number],
): StructuredListItem {
  const children = item.children.map((child): StructuredListItem['children'][number] => child.kind === 'list'
    ? {ordered: child.ordered, items: child.items.map(structuredListItem)}
    : {kind: 'paragraph', content: child.content});
  return {content: item.content, children};
}

function listMarkdown(structure: Extract<SemanticNodeStructure, {kind: 'list'}>, depth = 0): string {
  const indent = '   '.repeat(depth);
  const lines: string[] = [];
  structure.items.forEach((item, index) => {
    lines.push(`${indent}${structure.ordered ? `${index + 1}.` : '-'} ${inlineText(item.content)}`);
    for (const child of item.children) {
      lines.push(child.kind === 'paragraph'
        ? `${'   '.repeat(depth + 1)}${inlineText(child.content)}`
        : listMarkdown({kind: 'list', ...child}, depth + 1));
    }
  });
  return lines.join('\n');
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function inlineXml(content: InlineContent[]): string {
  return content.map((part) => {
    let value = escapeXml(part.text);
    if (part.kind === 'code') return `<code>${value}</code>`;
    if (part.kind === 'link') {
      if (part.inlineCode) value = `<code>${value}</code>`;
      if (part.underline) value = `<u>${value}</u>`;
      if (part.strike) value = `<del>${value}</del>`;
      if (part.italic) value = `<em>${value}</em>`;
      if (part.bold) value = `<b>${value}</b>`;
      return `<a href="${escapeXml(part.url)}">${value}</a>`;
    }
    if (part.underline) value = `<u>${value}</u>`;
    if (part.strike) value = `<del>${value}</del>`;
    if (part.italic) value = `<em>${value}</em>`;
    if (part.bold) value = `<b>${value}</b>`;
    return value;
  }).join('');
}

function listXml(structure: Extract<SemanticNodeStructure, {kind: 'list'}>): string {
  const tag = structure.ordered ? 'ol' : 'ul';
  const items = structure.items.map((item) => {
    const children = item.children.map((child) => child.kind === 'paragraph'
      ? `<p>${inlineXml(child.content)}</p>`
      : listXml({kind: 'list', ...child})).join('');
    return `<li>${inlineXml(item.content)}${children}</li>`;
  }).join('');
  return `<${tag}>${items}</${tag}>`;
}

function codeLanguage(node: SnapshotNode): string {
  const style = requiredRecord(payload(node, 'code').style, `${node.blockId}.code.style`);
  if (typeof style.language === 'string' && style.language) return style.language;
  if (typeof style.language === 'number') {
    const language = codeLanguages.get(style.language);
    if (language) return language;
  }
  throw new Error(`${node.blockId} has an unsupported Code language.`);
}

function codeText(node: SnapshotNode): string {
  const code = payload(node, 'code');
  if (!Array.isArray(code.elements)) throw new Error(`${node.blockId}.code.elements must be an array.`);
  return code.elements.map((elementValue, index) => {
    const element = requiredRecord(elementValue, `${node.blockId}.code.elements[${index}]`);
    const run = requiredRecord(element.text_run, `${node.blockId}.code.elements[${index}].text_run`);
    if (typeof run.content !== 'string') {
      throw new Error(`${node.blockId}.code.elements[${index}].text_run.content must be a string.`);
    }
    return run.content;
  }).join('');
}

function descendantBlockIds(node: SnapshotNode, nodesById: ReadonlyMap<string, SnapshotNode>): string[] {
  const ids: string[] = [];
  const visit = (current: SnapshotNode): void => {
    ids.push(current.blockId);
    for (const childId of current.childBlockIds) {
      const child = nodesById.get(childId);
      if (child) visit(child);
    }
  };
  visit(node);
  return ids;
}

function textFromDescendants(node: SnapshotNode, nodesById: ReadonlyMap<string, SnapshotNode>): string {
  const pieces: string[] = [];
  const visit = (current: SnapshotNode): void => {
    try {
      if (current.kind === 'paragraph') pieces.push(inlineText(inlineContent(payload(current, 'text'), `${current.blockId}.text`)));
      else if (current.kind === 'code') pieces.push(codeText(current));
      else if (current.kind === 'list') pieces.push(inlineText(listItem(current, nodesById).content));
      else if (current.kind === 'synced_source') {
        const source = asRecord(current.raw.source_synced);
        if (source) pieces.push(inlineText(inlineContent(source, `${current.blockId}.source_synced`)));
      }
    } catch {
      // The containing resource remains non-writable; missing display text is safe.
    }
    for (const childId of current.childBlockIds) {
      const child = nodesById.get(childId);
      if (child) visit(child);
    }
  };
  visit(node);
  return pieces.filter(Boolean).join('\n');
}

function elementName(node: SnapshotNode): string {
  if (node.kind === 'page') return 'title';
  if (node.kind === 'paragraph') return 'p';
  if (node.kind === 'heading') return `h${Math.max(1, node.blockType - 2)}`;
  if (node.kind === 'list') return node.blockType === 13 ? 'ol' : 'ul';
  if (node.kind === 'code') return 'pre';
  if (node.kind === 'table') return 'table';
  if (node.kind === 'callout') return 'callout';
  if (node.kind === 'whiteboard') return 'whiteboard';
  if (node.kind === 'synced_source') return 'synced-source';
  if (node.kind === 'synced_reference') return 'synced_reference';
  return `provider-block-${node.blockType}`;
}

interface DecodedNode {
  kind: SemanticNodeKind;
  text: string;
  xml: string;
  writable: boolean;
  structure?: SemanticNodeStructure;
  blockIds?: string[];
  subtreeBlockIds?: string[];
  token?: string;
  sourceDocumentId?: string;
  sourceBlockId?: string;
  attributes?: Record<string, string>;
}

function decodeNode(
  snapshot: DocumentSnapshot,
  node: SnapshotNode,
  nodesById: ReadonlyMap<string, SnapshotNode>,
  groupedLists: SnapshotNode[] = [node],
): DecodedNode {
  try {
    if (node.kind === 'page') {
      const desired = decodeSnapshotNode(snapshot, node.blockId);
      if (desired?.kind !== 'title') throw new Error(`${node.blockId} is not a typed title.`);
      const content = desired.content;
      return {kind: 'title', text: inlineText(content), xml: `<title>${inlineXml(content)}</title>`, writable: true};
    }
    if (node.kind === 'paragraph') {
      const desired = decodeSnapshotNode(snapshot, node.blockId);
      if (desired?.kind !== 'paragraph') throw new Error(`${node.blockId} is not a typed paragraph.`);
      const content = desired.content;
      return {kind: 'paragraph', text: inlineText(content), xml: providerBlocksToXml([asProviderBlock(node)]), writable: true};
    }
    if (node.kind === 'heading') {
      const desired = decodeSnapshotNode(snapshot, node.blockId);
      if (desired?.kind !== 'heading') throw new Error(`${node.blockId} is not a typed heading.`);
      const content = desired.content;
      return {kind: 'heading', text: inlineText(content), xml: providerBlocksToXml([asProviderBlock(node)]), writable: true};
    }
    if (node.kind === 'list') {
      const desired = decodeSnapshotRoots(snapshot, groupedLists.map(({blockId}) => blockId));
      if (desired?.length !== 1 || desired[0]?.kind !== 'list') {
        throw new Error(`${node.blockId} is not a typed list group.`);
      }
      const structure: Extract<SemanticNodeStructure, {kind: 'list'}> = {
        kind: 'list',
        ordered: desired[0].ordered,
        items: desired[0].items.map(structuredListItem),
      };
      return {
        kind: 'list',
        text: listMarkdown(structure),
        xml: listXml(structure),
        writable: true,
        structure,
        blockIds: groupedLists.map(({blockId}) => blockId),
        subtreeBlockIds: listBlockIds(groupedLists, nodesById),
      };
    }
    if (node.kind === 'table') {
      const desired = decodeSnapshotNode(snapshot, node.blockId);
      if (desired?.kind !== 'table') throw new Error(`${node.blockId} is not a typed table.`);
      const structure: Extract<SemanticNodeStructure, {kind: 'table'}> = {
        kind: 'table',
        rows: desired.rows,
        ...(desired.columnWidths ? {columnWidths: desired.columnWidths} : {}),
        ...(desired.headerRow !== undefined ? {headerRow: desired.headerRow} : {}),
      };
      return {
        kind: 'table',
        text: structure.rows.map((row) => row.cells.map((cell) => cell.content.map(desiredNodeText).join('\n')).join(' | ')).join('\n'),
        xml: tableToXml(desired),
        writable: true,
        structure,
        blockIds: [node.blockId],
        subtreeBlockIds: descendantBlockIds(node, nodesById),
      };
    }
    if (node.kind === 'code') {
      const desired = decodeSnapshotNode(snapshot, node.blockId);
      if (desired?.kind !== 'code') throw new Error(`${node.blockId} is not a typed Code block.`);
      const style = requiredRecord(payload(node, 'code').style, `${node.blockId}.code.style`);
      const structure: Extract<SemanticNodeStructure, {kind: 'code'}> = {
        kind: 'code',
        language: codeLanguage(node),
        caption: typeof style.caption === 'string' ? style.caption : undefined,
      };
      return {
        kind: 'code',
        text: codeText(node),
        xml: providerBlocksToXml([asProviderBlock(node)]),
        writable: true,
        structure,
        attributes: {lang: structure.language},
      };
    }
    if (node.kind === 'callout') {
      const desired = decodeSnapshotNode(snapshot, node.blockId);
      if (desired?.kind === 'callout') {
        return {
          kind: 'callout',
          text: desiredNodeText(desired),
          xml: calloutToXml(desired),
          writable: true,
          structure: desired,
          blockIds: [node.blockId],
          subtreeBlockIds: descendantBlockIds(node, nodesById),
          attributes: {
            type: desired.calloutType,
            ...(desired.title ? {title: desired.title} : {}),
          },
        };
      }
      return {
        kind: 'callout',
        text: textFromDescendants(node, nodesById),
        xml: `<callout provider-block-id="${escapeXml(node.blockId)}"></callout>`,
        writable: false,
        blockIds: [node.blockId],
        subtreeBlockIds: descendantBlockIds(node, nodesById),
      };
    }
    if (node.kind === 'whiteboard') {
      const token = requiredRecord(node.raw.board, `${node.blockId}.board`).token;
      if (typeof token !== 'string' || !token) throw new Error(`${node.blockId}.board.token must be a string.`);
      return {kind: 'whiteboard', text: '', xml: `<whiteboard token="${escapeXml(token)}"></whiteboard>`, writable: false, token};
    }
    if (node.kind === 'synced_source') {
      return {
        kind: 'synced_source',
        text: textFromDescendants(node, nodesById),
        xml: '<synced-source></synced-source>',
        writable: false,
        blockIds: [node.blockId],
        subtreeBlockIds: descendantBlockIds(node, nodesById),
        sourceDocumentId: undefined,
        sourceBlockId: node.blockId,
      };
    }
    if (node.kind === 'synced_reference') {
      const reference = requiredRecord(node.raw.reference_synced, `${node.blockId}.reference_synced`);
      if (typeof reference.source_document_id !== 'string' || typeof reference.source_block_id !== 'string') {
        throw new Error(`${node.blockId} has an invalid synced reference identity.`);
      }
      return {
        kind: 'synced_reference',
        text: textFromDescendants(node, nodesById),
        xml: '<synced_reference></synced_reference>',
        writable: false,
        sourceDocumentId: reference.source_document_id,
        sourceBlockId: reference.source_block_id,
      };
    }
  } catch {
    // A provider shape is writable only when it losslessly decodes to engine semantics.
  }
  return {
    kind: 'opaque',
    text: textFromDescendants(node, nodesById),
    xml: `<opaque provider-block-type="${node.blockType}"></opaque>`,
    writable: false,
    blockIds: [node.blockId],
    subtreeBlockIds: node.childBlockIds.length > 0 ? descendantBlockIds(node, nodesById) : undefined,
  };
}

function desiredNodeText(node: DesiredNode): string {
  if ('content' in node) return inlineText(node.content);
  if (node.kind === 'list') {
    return listMarkdown({kind: 'list', ordered: node.ordered, items: node.items.map(structuredListItem)});
  }
  if (node.kind === 'code') return node.text;
  if (node.kind === 'table') return node.rows.map((row) => row.cells.map((cell) => cell.content.map(desiredNodeText).join('\n')).join(' | ')).join('\n');
  if (node.kind === 'callout') return [node.title, ...node.children.map(desiredNodeText)].filter(Boolean).join('\n');
  return '';
}

function semanticFingerprint(
  node: SnapshotNode,
  decoded: DecodedNode,
  nodesById: ReadonlyMap<string, SnapshotNode>,
): string {
  if (!decoded.subtreeBlockIds || decoded.subtreeBlockIds.length <= 1) return node.canonicalHash;
  return canonicalHash({
    root: node.canonicalHash,
    subtree: decoded.subtreeBlockIds.map((blockId) => ({
      blockId,
      canonicalHash: nodesById.get(blockId)?.canonicalHash,
    })),
  });
}

export function semanticDocumentFromSnapshot(snapshot: DocumentSnapshot): SemanticDocument {
  const revisionId = Number(snapshot.revision);
  if (!Number.isSafeInteger(revisionId) || revisionId < 0) {
    throw new Error(`Document snapshot revision must be a non-negative integer, received ${snapshot.revision}.`);
  }
  const nodesById = new Map(snapshot.nodes.map((node) => [node.blockId, node]));
  const root = nodesById.get(snapshot.rootBlockId);
  if (!root || root.kind !== 'page') {
    throw new Error(`Document snapshot root ${snapshot.rootBlockId} is not a page node.`);
  }

  const semanticNodes: SemanticNode[] = [];
  const sections: SemanticSection[] = [];
  const headingPath: string[] = [];
  const siblingCounts = new Map<string, number>();
  let activeSectionIndex = -1;

  const append = (node: SnapshotNode, groupedLists: SnapshotNode[] = [node]): void => {
    const decoded = decodeNode(snapshot, node, nodesById, groupedLists);
    if (decoded.kind === 'heading') {
      const level = headingLevel(node);
      headingPath.splice(level - 1);
      headingPath[level - 1] = decoded.text;
      headingPath.splice(level);
      activeSectionIndex = sections.length;
    }
    const path = [...headingPath];
    const siblingKey = `${path.join(' > ')}\u0000${decoded.kind}`;
    const siblingIndex = siblingCounts.get(siblingKey) ?? 0;
    siblingCounts.set(siblingKey, siblingIndex + 1);
    const nodeId = `${path.join('/') || '$root'}:${decoded.kind}:${siblingIndex}`;
    const semanticNode: SemanticNode = {
      nodeId,
      kind: decoded.kind,
      headingPath: path,
      sectionIndex: activeSectionIndex,
      documentIndex: semanticNodes.length,
      siblingIndex,
      text: decoded.text,
      xml: decoded.xml,
      writable: decoded.writable,
      fingerprint: semanticFingerprint(node, decoded, nodesById),
      ...(decoded.structure ? {structure: decoded.structure} : {}),
      remote: {
        blockId: node.blockId,
        ...(decoded.blockIds ? {blockIds: decoded.blockIds} : {}),
        ...(decoded.subtreeBlockIds ? {subtreeBlockIds: decoded.subtreeBlockIds} : {}),
        providerHash: node.canonicalHash,
        ...(decoded.token ? {token: decoded.token} : {}),
        ...(decoded.kind === 'synced_source'
          ? {sourceDocumentId: snapshot.documentId, sourceBlockId: node.blockId}
          : {}),
        ...(decoded.sourceDocumentId ? {sourceDocumentId: decoded.sourceDocumentId} : {}),
        ...(decoded.sourceBlockId ? {sourceBlockId: decoded.sourceBlockId} : {}),
        elementName: elementName(node),
        attributes: {
          blockType: String(node.blockType),
          ...(decoded.attributes ?? {}),
        },
      },
    };
    semanticNodes.push(semanticNode);
    if (decoded.kind === 'heading') {
      sections.push({headingPath: path, headingNodeId: nodeId, nodes: []});
    } else {
      const section = [...sections].reverse().find((candidate) =>
        candidate.headingPath.every((part, index) => path[index] === part),
      );
      section?.nodes.push(semanticNode);
    }
  };

  append(root);
  for (let index = 0; index < root.childBlockIds.length;) {
    const node = nodesById.get(root.childBlockIds[index]!);
    if (!node) throw new Error(`Document root references missing node ${root.childBlockIds[index]}.`);
    if (node.kind !== 'list') {
      append(node);
      index += 1;
      continue;
    }
    const ordered = safeListOrdered(node);
    if (ordered === undefined) {
      append(node);
      index += 1;
      continue;
    }
    const grouped: SnapshotNode[] = [];
    while (index < root.childBlockIds.length) {
      const candidate = nodesById.get(root.childBlockIds[index]!);
      if (!candidate || candidate.kind !== 'list' || safeListOrdered(candidate) !== ordered) break;
      grouped.push(candidate);
      index += 1;
    }
    append(grouped[0]!, grouped);
  }

  return {
    documentId: snapshot.documentId,
    revisionId,
    title: semanticNodes.find((node) => node.kind === 'title')?.text ?? '',
    nodes: semanticNodes,
    sections,
    canonicalHash: snapshot.canonicalHash,
    rawXml: semanticNodes.map((node) => node.xml).join(''),
  };
}
