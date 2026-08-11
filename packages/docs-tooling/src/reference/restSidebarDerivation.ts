import {readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml') as {load(source: string): unknown};

export type RestSidebarItem = Readonly<{
  type: 'doc' | 'category';
  id?: string;
  key?: string;
  label: string;
  items?: readonly RestSidebarItem[];
}>;

type RestDocumentMetadata = Readonly<{
  relativePath: string;
  directory: string;
  stem: string;
  label: string | null;
  sidebarLabel: string | null;
  position: number | null;
  slug: string | null;
}>;

type PositionedItem = Readonly<{
  item: RestSidebarItem;
  position: number;
  tieBreaker: string;
}>;

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function position(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readMetadata(targetRoot: string): readonly RestDocumentMetadata[] {
  const documents: RestDocumentMetadata[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!entry.isFile() || !/\.mdx?$/u.test(entry.name)) continue;
      const source = readFileSync(absolutePath, 'utf8');
      const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(source);
      const frontmatter = match ? yaml.load(match[1]) : {};
      const fields = frontmatter && typeof frontmatter === 'object' && !Array.isArray(frontmatter)
        ? frontmatter as Record<string, unknown>
        : {};
      const body = match ? source.slice(match[0].length) : source;
      const heading = /^#\s+(.+?)\s*$/mu.exec(body)?.[1];
      const relativePath = path.relative(targetRoot, absolutePath).split(path.sep).join('/').replace(/\.mdx?$/u, '');
      documents.push({
        relativePath,
        directory: path.posix.dirname(relativePath),
        stem: path.posix.basename(relativePath),
        label: text(fields.sidebar_label) ?? text(fields.title) ?? text(heading),
        sidebarLabel: text(fields.sidebar_label),
        position: position(fields.sidebar_position),
        slug: text(fields.slug),
      });
    }
  };
  visit(targetRoot);
  return documents;
}

function requiredLabel(document: RestDocumentMetadata, kind: string): string {
  if (!document.label) throw new Error(`REST ${kind} "${document.relativePath}" has no sidebar_label, title, or first H1`);
  return document.label;
}

function requiredPosition(document: RestDocumentMetadata, kind: string): number {
  if (document.position === null) throw new Error(`REST ${kind} "${document.relativePath}" has no numeric sidebar_position`);
  return document.position;
}

function categoryKeySegment(document: RestDocumentMetadata): string {
  const segments = document.slug?.split('/').filter(Boolean) ?? [];
  const segment = segments.at(-1);
  if (!segment) throw new Error(`REST category landing "${document.relativePath}" has no usable slug`);
  return segment;
}

function directChildDirectories(documents: readonly RestDocumentMetadata[], directory: string): string[] {
  const prefix = directory === '.' ? '' : `${directory}/`;
  return [...new Set(documents
    .map(document => document.relativePath)
    .filter(relativePath => relativePath.startsWith(prefix))
    .map(relativePath => relativePath.slice(prefix.length).split('/'))
    .filter(parts => parts.length > 1)
    .map(parts => `${prefix}${parts[0]}`))]
    .sort((left, right) => left.localeCompare(right));
}

function buildCategory(
  documents: readonly RestDocumentMetadata[],
  directory: string,
  idPrefix: string,
  parentKey: string,
): PositionedItem | null {
  const direct = documents.filter(document => document.directory === directory);
  const directoryName = path.posix.basename(directory);
  const landing = direct.find(document => document.stem === directoryName);
  if (!landing) {
    const hasSidebarEndpoints = documents.some(document => (
      (document.directory === directory || document.directory.startsWith(`${directory}/`))
      && document.sidebarLabel !== null
    ));
    if (hasSidebarEndpoints) throw new Error(`REST category directory "${directory}" has sidebar endpoints but no matching landing document`);
    return null;
  }
  const segment = categoryKeySegment(landing);
  const key = parentKey ? `${parentKey}/${segment}` : segment;
  const childItems: PositionedItem[] = [];

  for (const childDirectory of directChildDirectories(documents, directory)) {
    const child = buildCategory(documents, childDirectory, idPrefix, key);
    if (child) childItems.push(child);
  }
  for (const document of direct) {
    if (document === landing || !document.sidebarLabel) continue;
    const id = `${idPrefix}/${document.relativePath}`;
    childItems.push({
      item: {type: 'doc', id, label: requiredLabel(document, 'endpoint'), key: `doc:${id}`},
      position: requiredPosition(document, 'endpoint'),
      tieBreaker: document.relativePath,
    });
  }

  if (childItems.length === 0) return null;
  return {
    item: {
      type: 'category',
      label: requiredLabel(landing, 'category landing'),
      key: `category:${key}`,
      items: childItems
        .sort((left, right) => left.position - right.position || left.tieBreaker.localeCompare(right.tieBreaker))
        .map(entry => entry.item),
    },
    position: requiredPosition(landing, 'category landing'),
    tieBreaker: directory,
  };
}

export function deriveRestSidebar(options: Readonly<{
  targetRoot: string;
  idPrefix: string;
}>): RestSidebarItem[] {
  const documents = readMetadata(options.targetRoot);
  const rootStem = path.basename(options.targetRoot);
  const rootLanding = documents.find(document => document.directory === '.' && document.stem === rootStem);
  if (!rootLanding) throw new Error(`REST publication root has no ${rootStem}.md or ${rootStem}.mdx landing document`);

  const categories = directChildDirectories(documents, '.')
    .map(directory => buildCategory(documents, directory, options.idPrefix, ''))
    .filter((entry): entry is PositionedItem => entry !== null)
    .sort((left, right) => left.position - right.position || left.tieBreaker.localeCompare(right.tieBreaker))
    .map(entry => entry.item);

  return [
    {
      type: 'doc',
      id: `${options.idPrefix}/${rootLanding.relativePath}`,
      label: requiredLabel(rootLanding, 'root landing'),
    },
    ...categories,
  ];
}

export function serializeRestSidebar(sidebar: readonly RestSidebarItem[]): string {
  return `module.exports = ${JSON.stringify(sidebar, null, 2)}\n`;
}
