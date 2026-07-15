import {SaxesParser} from 'saxes';

import {canonicalHash} from './hash.js';
import type {
  SemanticDocument,
  SemanticNode,
  SemanticNodeKind,
  SemanticSection,
} from './model.js';

interface XmlElement {
  name: string;
  attributes: Record<string, string>;
  children: Array<XmlElement | string>;
}

export interface ParseFeishuDocumentOptions {
  documentId: string;
  revisionId: number;
}

const writableKinds = new Set<SemanticNodeKind>([
  'heading',
  'paragraph',
  'list',
  'quote',
  'callout',
]);

function parseFragment(xml: string): XmlElement[] {
  const roots: XmlElement[] = [];
  const stack: XmlElement[] = [];
  const parser = new SaxesParser({fragment: true});

  parser.on('opentag', (tag) => {
    const attributes = Object.fromEntries(
      Object.entries(tag.attributes).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : value.value,
      ]),
    );
    const element: XmlElement = {name: tag.name, attributes, children: []};
    const parent = stack.at(-1);
    if (parent) parent.children.push(element);
    else roots.push(element);
    stack.push(element);
  });
  parser.on('text', (text) => {
    stack.at(-1)?.children.push(text);
  });
  parser.on('cdata', (text) => {
    stack.at(-1)?.children.push(text);
  });
  parser.on('closetag', () => {
    stack.pop();
  });
  parser.write(xml).close();
  return roots;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function serialize(element: XmlElement): string {
  const attributes = Object.entries(element.attributes)
    .filter(([key]) => key !== 'id')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
    .join('');
  const children = element.children
    .map((child) => typeof child === 'string' ? escapeXml(child) : serialize(child))
    .join('');
  return `<${element.name}${attributes}>${children}</${element.name}>`;
}

function textContent(element: XmlElement): string {
  const pieces: string[] = [];
  for (const child of element.children) {
    if (typeof child === 'string') {
      pieces.push(child);
      continue;
    }
    pieces.push(textContent(child));
    if (child.name === 'li' || child.name === 'p' || child.name === 'br') pieces.push('\n');
  }
  return pieces.join('').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
}

function kindFor(name: string): SemanticNodeKind {
  if (/^h[1-9]$/.test(name)) return 'heading';
  if (name === 'p') return 'paragraph';
  if (name === 'ul' || name === 'ol') return 'list';
  if (name === 'blockquote') return 'quote';
  if (name === 'callout') return 'callout';
  if (name === 'pre') return 'code';
  if (name === 'table') return 'table';
  if (name === 'img') return 'image';
  if (name === 'whiteboard') return 'whiteboard';
  if (['sheet', 'bitable', 'synced_reference', 'synced_source', 'source'].includes(name)) return 'resource';
  return 'opaque';
}

function headingLevel(element: XmlElement): number | undefined {
  const match = /^h([1-9])$/.exec(element.name);
  return match ? Number(match[1]) : undefined;
}

export function parseFeishuDocument(
  xml: string,
  options: ParseFeishuDocumentOptions,
): SemanticDocument {
  const roots = parseFragment(xml);
  const titleElement = roots.find((element) => element.name === 'title');
  const title = titleElement ? textContent(titleElement) : '';
  const headingPath: string[] = [];
  const siblingCounts = new Map<string, number>();
  const nodes: SemanticNode[] = [];
  const sections: SemanticSection[] = [];

  for (const element of roots) {
    if (element.name === 'title') continue;
    const level = headingLevel(element);
    const text = textContent(element);
    if (level !== undefined) {
      headingPath.splice(level - 1);
      headingPath[level - 1] = text;
      headingPath.splice(level);
    }

    const kind = kindFor(element.name);
    const path = [...headingPath];
    const siblingKey = `${path.join(' > ')}\u0000${kind}`;
    const siblingIndex = siblingCounts.get(siblingKey) ?? 0;
    siblingCounts.set(siblingKey, siblingIndex + 1);
    const normalizedXml = serialize(element);
    const fingerprint = canonicalHash({kind, path, text, xml: normalizedXml});
    const nodeId = `${path.join('/') || '$root'}:${kind}:${siblingIndex}`;
    const node: SemanticNode = {
      nodeId,
      kind,
      headingPath: path,
      siblingIndex,
      text,
      xml: normalizedXml,
      writable: writableKinds.has(kind),
      fingerprint,
      remote: {
        ...(element.attributes.id ? {blockId: element.attributes.id} : {}),
        ...(element.attributes.token ? {token: element.attributes.token} : {}),
        attributes: {...element.attributes},
      },
    };
    nodes.push(node);

    if (kind === 'heading') {
      sections.push({headingPath: path, headingNodeId: nodeId, nodes: []});
    } else {
      const section = [...sections].reverse().find((candidate) =>
        candidate.headingPath.every((part, index) => path[index] === part),
      );
      section?.nodes.push(node);
    }
  }

  const canonical = {
    title,
    nodes: nodes.map((node) => ({
      kind: node.kind,
      headingPath: node.headingPath,
      siblingIndex: node.siblingIndex,
      text: node.text,
      xml: node.xml,
      writable: node.writable,
    })),
  };

  return {
    documentId: options.documentId,
    revisionId: options.revisionId,
    title,
    nodes,
    sections,
    canonicalHash: canonicalHash(canonical),
    rawXml: xml,
  };
}
