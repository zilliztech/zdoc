import {existsSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

import {manualRegistry} from '../manuals/registry.ts';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml') as {load(source: string): unknown};

const referencePresentations = manualRegistry.filter(
  (manual): manual is typeof manual & {presentation: NonNullable<typeof manual.presentation>} =>
    manual.kind === 'reference' && manual.presentation !== undefined,
);

const REFERENCE_SIDEBARS = Object.freeze(
  referencePresentations
    .slice()
    .sort((left, right) => left.presentation.navOrder.en - right.presentation.navOrder.en)
    .map(manual => manual.presentation.sidebar),
) as readonly string[];
const REFERENCE_NAVIGATION_PATH = 'config/reference-navigation.json';

export type SidebarItem = string | Readonly<Record<string, unknown>>;

type DocumentMetadata = Readonly<{
  id: string;
  directory: string;
  stem: string;
  label: string | null;
  type: string | null;
  hasDocCardList: boolean;
}>;

type ReferenceSidebarName = string;

const REFERENCE_SIDEBAR_GROUPS: Readonly<Record<string, readonly ReferenceSidebarName[]>> = Object.freeze({
  ...Object.fromEntries(
    referencePresentations.map(manual => [manual.id, Object.freeze([manual.presentation.sidebar])]),
  ),
  'reference-landings': Object.freeze(
    referencePresentations
      .slice()
      .sort((left, right) => left.presentation.navOrder.en - right.presentation.navOrder.en)
      .filter(manual => manual.presentation.referenceKind !== 'restful')
      .map(manual => manual.presentation.sidebar),
  ),
});

type ReferenceSidebarTarget = Readonly<{
  sidebar: ReferenceSidebarName;
  landingId: string;
}>;

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readMetadata(targetRoot: string): ReadonlyMap<string, DocumentMetadata> {
  const documents = new Map<string, DocumentMetadata>();
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
      const relativePath = path.relative(targetRoot, absolutePath).split(path.sep).join('/');
      const id = relativePath.replace(/\.mdx?$/u, '');
      documents.set(id, {
        id,
        directory: path.posix.dirname(id),
        stem: path.posix.basename(id),
        label: text(fields.sidebar_label) ?? text(fields.title) ?? text(heading),
        type: text(fields.type),
        hasDocCardList: body.includes('<DocCardList'),
      });
    }
  };
  visit(targetRoot);
  return documents;
}

function requiredDocument(documents: ReadonlyMap<string, DocumentMetadata>, id: string): DocumentMetadata {
  const document = documents.get(id);
  if (!document) throw new Error(`Reference sidebar document "${id}" has no matching Chinese .md or .mdx file`);
  if (!document.label) throw new Error(`Chinese Reference document "${id}" has no sidebar_label, title, or first H1`);
  return document;
}

function readReferenceSidebarTargets(repositoryRoot: string): ReadonlyMap<ReferenceSidebarName, ReferenceSidebarTarget> {
  const configPath = path.join(repositoryRoot, REFERENCE_NAVIGATION_PATH);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot load Reference navigation config: ${REFERENCE_NAVIGATION_PATH}`, {cause: error});
  }
  const targets = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as {targets?: unknown}).targets
    : null;
  if (!Array.isArray(targets)) throw new Error(`Reference navigation config must define targets: ${REFERENCE_NAVIGATION_PATH}`);

  const result = new Map<ReferenceSidebarName, ReferenceSidebarTarget>();
  for (const target of targets) {
    if (!target || typeof target !== 'object' || Array.isArray(target)) continue;
    const fields = target as Record<string, unknown>;
    if (!REFERENCE_SIDEBARS.includes(fields.sidebar as ReferenceSidebarName) || typeof fields.landingPage !== 'string') continue;
    const sidebar = fields.sidebar as ReferenceSidebarName;
    if (result.has(sidebar)) throw new Error(`Reference navigation config repeats sidebar: ${sidebar}`);
    const landingId = fields.landingPage.replace(/\.mdx?$/u, '');
    if (!landingId || landingId === fields.landingPage) throw new Error(`Reference navigation landingPage must be a Markdown file: ${sidebar}`);
    result.set(sidebar, {sidebar, landingId});
  }
  for (const sidebar of REFERENCE_SIDEBARS) {
    if (!result.has(sidebar)) throw new Error(`Reference navigation config is missing sidebar: ${sidebar}`);
  }
  return result;
}

function englishSidebarPresent(repositoryRoot: string, name: ReferenceSidebarName): boolean {
  return existsSync(path.join(repositoryRoot, `generated/en/sidebars/${name}.sidebar.js`));
}

function loadEnglishTemplate(repositoryRoot: string, name: ReferenceSidebarName): SidebarItem[] {
  const relativePath = `generated/en/sidebars/${name}.sidebar.js`;
  const templatePath = path.join(repositoryRoot, relativePath);
  let template: unknown;
  try {
    const resolved = require.resolve(templatePath);
    delete require.cache[resolved];
    template = require(resolved);
  } catch (error) {
    throw new Error(`Cannot load English Reference sidebar template: ${relativePath}`, {cause: error});
  }
  if (!Array.isArray(template) || template.length === 0) {
    throw new Error(`English Reference sidebar template must be a non-empty array: ${relativePath}`);
  }
  return template as SidebarItem[];
}

function withoutDocumentId(item: SidebarItem, documentId: string): SidebarItem | null {
  if (typeof item === 'string') return item === documentId ? null : item;
  if ((item.type === 'doc' || item.type === 'ref') && item.id === documentId) return null;

  const normalized: Record<string, unknown> = {...item};
  const hadContent = (Array.isArray(item.items) && item.items.length > 0) || Boolean(item.link);
  if (Array.isArray(item.items)) {
    normalized.items = item.items
      .map(child => withoutDocumentId(child as SidebarItem, documentId))
      .filter((child): child is SidebarItem => child !== null);
  }
  if (item.link && typeof item.link === 'object' && !Array.isArray(item.link)) {
    const link = item.link as Readonly<Record<string, unknown>>;
    if (link.type === 'doc' && link.id === documentId) delete normalized.link;
  }
  if (item.type === 'category' && hadContent && Array.isArray(normalized.items) && normalized.items.length === 0 && !normalized.link) return null;
  return normalized;
}

function normalizeLandingDocument(
  template: readonly SidebarItem[],
  documents: ReadonlyMap<string, DocumentMetadata>,
  landingId: string,
): SidebarItem[] {
  const landing = requiredDocument(documents, landingId);
  return [
    {type: 'doc', id: landingId, label: landing.label},
    ...template
      .map(item => withoutDocumentId(item, landingId))
      .filter((item): item is SidebarItem => item !== null),
  ];
}

function serializeSidebar(sidebar: readonly SidebarItem[]): string {
  return `module.exports = ${JSON.stringify(sidebar, null, 2)}\n`;
}

function descendantDocIds(item: Readonly<Record<string, unknown>>): string[] {
  const ids: string[] = [];
  if ((item.type === 'doc' || item.type === 'ref') && typeof item.id === 'string') ids.push(item.id);
  if (Array.isArray(item.items)) {
    for (const child of item.items) {
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        ids.push(...descendantDocIds(child as Readonly<Record<string, unknown>>));
      }
    }
  }
  return ids;
}

function commonDirectory(ids: readonly string[]): string | null {
  if (ids.length === 0) return null;
  const directories = ids.map(id => path.posix.dirname(id).split('/'));
  const shared: string[] = [];
  for (let index = 0; index < directories[0].length; index += 1) {
    const segment = directories[0][index];
    if (!directories.every(directory => directory[index] === segment)) break;
    shared.push(segment);
  }
  return shared.length > 0 ? shared.join('/') : null;
}

function landingDocument(
  documents: ReadonlyMap<string, DocumentMetadata>,
  directory: string,
): DocumentMetadata | null {
  const normalized = directory.toLowerCase();
  const actualDirectory = [...documents.values()]
    .map(document => document.directory)
    .find(candidate => candidate.toLowerCase() === normalized);
  if (!actualDirectory) return null;
  const direct = [...documents.values()]
    .filter(document => document.directory === actualDirectory)
    .sort((left, right) => left.id.localeCompare(right.id));
  const directoryName = path.posix.basename(actualDirectory).toLowerCase();
  return direct.find(document => document.stem.toLowerCase() === directoryName)
    ?? direct.find(document => document.type === 'folder')
    ?? direct.find(document => document.hasDocCardList)
    ?? null;
}

function deriveItem(
  item: SidebarItem,
  documents: ReadonlyMap<string, DocumentMetadata>,
  excludedDocIds: ReadonlySet<string>,
): SidebarItem | null {
  if (typeof item === 'string') {
    if (excludedDocIds.has(item)) return null;
    requiredDocument(documents, item);
    return item;
  }
  if ((item.type === 'doc' || item.type === 'ref') && typeof item.id === 'string') {
    if (excludedDocIds.has(item.id)) return null;
    return {...item, label: requiredDocument(documents, item.id).label};
  }

  const derived: Record<string, unknown> = {...item};
  if (Array.isArray(item.items)) {
    derived.items = item.items
      .map(child => deriveItem(child as SidebarItem, documents, excludedDocIds))
      .filter((child): child is SidebarItem => child !== null);
  }
  if (item.link && typeof item.link === 'object' && !Array.isArray(item.link)) {
    const link = item.link as Readonly<Record<string, unknown>>;
    if (link.type === 'doc' && typeof link.id === 'string') {
      if (excludedDocIds.has(link.id)) delete derived.link;
      else requiredDocument(documents, link.id);
    }
  }
  if (item.type === 'category') {
    const effectiveLink = derived.link;
    const link = effectiveLink && typeof effectiveLink === 'object' && !Array.isArray(effectiveLink)
      ? effectiveLink as Readonly<Record<string, unknown>>
      : null;
    const linked = link?.type === 'doc' && typeof link.id === 'string'
      ? requiredDocument(documents, link.id)
      : null;
    const keyedDirectory = typeof item.key === 'string' && item.key.startsWith('category:')
      ? item.key.slice('category:'.length)
      : null;
    const inferredDirectory = commonDirectory(descendantDocIds(item));
    const landing = linked
      ?? (keyedDirectory ? landingDocument(documents, keyedDirectory) : null)
      ?? (inferredDirectory ? landingDocument(documents, inferredDirectory) : null);
    if (landing?.label) derived.label = landing.label;
    if (Array.isArray(derived.items) && derived.items.length === 0 && !derived.link) return null;
  }
  return derived;
}

export function deriveReferenceSidebar(options: Readonly<{
  targetRoot: string;
  template: readonly SidebarItem[];
  excludedDocIds?: ReadonlySet<string>;
}>): SidebarItem[] {
  const documents = readMetadata(options.targetRoot);
  const excludedDocIds = options.excludedDocIds ?? new Set<string>();
  return options.template
    .map(item => deriveItem(item, documents, excludedDocIds))
    .filter((item): item is SidebarItem => item !== null);
}

export function deriveZhCnReferenceSidebarEntries(
  repositoryRoot: string,
  excludedDocIds: ReadonlySet<string> = new Set<string>(),
): readonly (readonly [string, string])[] {
  const targetRoot = path.join(repositoryRoot, 'content/zh-CN/reference');
  return REFERENCE_SIDEBARS.map(name => {
    const template = loadEnglishTemplate(repositoryRoot, name);
    const derived = deriveReferenceSidebar({targetRoot, template, excludedDocIds});
    return [
      `generated/zh-CN/sidebars/${name}.sidebar.js`,
      serializeSidebar(derived),
    ] as const;
  });
}

export function deriveReferenceSidebarPublicationEntries(
  repositoryRoot: string,
  excludedDocIds: ReadonlySet<string> = new Set<string>(),
): readonly (readonly [string, string])[] {
  const targets = readReferenceSidebarTargets(repositoryRoot);
  const sourceDocuments = readMetadata(path.join(repositoryRoot, 'content/en/reference'));
  const targetRoot = path.join(repositoryRoot, 'content/zh-CN/reference');
  const englishEntries: Array<readonly [string, string]> = [];
  const chineseEntries: Array<readonly [string, string]> = [];

  for (const name of REFERENCE_SIDEBARS) {
    const target = targets.get(name)!;
    const normalized = normalizeLandingDocument(loadEnglishTemplate(repositoryRoot, name), sourceDocuments, target.landingId);
    const derived = deriveReferenceSidebar({targetRoot, template: normalized, excludedDocIds});
    englishEntries.push([`generated/en/sidebars/${name}.sidebar.js`, serializeSidebar(normalized)]);
    chineseEntries.push([`generated/zh-CN/sidebars/${name}.sidebar.js`, serializeSidebar(derived)]);
  }
  return [...englishEntries, ...chineseEntries];
}

export function deriveZhCnReferenceSidebarGroupEntries(
  repositoryRoot: string,
  group: string,
  excludedDocIds: ReadonlySet<string> = new Set<string>(),
): readonly (readonly [string, string])[] {
  const names = REFERENCE_SIDEBAR_GROUPS[group];
  if (!names) throw new Error(`Unsupported Reference sidebar group: ${group}`);
  const targets = readReferenceSidebarTargets(repositoryRoot);
  const sourceDocuments = readMetadata(path.join(repositoryRoot, 'content/en/reference'));
  const targetRoot = path.join(repositoryRoot, 'content/zh-CN/reference');

  return names
    .filter(name => englishSidebarPresent(repositoryRoot, name))
    .map(name => {
      const target = targets.get(name)!;
      const normalized = normalizeLandingDocument(loadEnglishTemplate(repositoryRoot, name), sourceDocuments, target.landingId);
      const derived = deriveReferenceSidebar({targetRoot, template: normalized, excludedDocIds});
      return [`generated/zh-CN/sidebars/${name}.sidebar.js`, serializeSidebar(derived)] as const;
    });
}
