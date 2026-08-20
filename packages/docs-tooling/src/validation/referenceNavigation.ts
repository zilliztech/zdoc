import {existsSync, lstatSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

import {z} from 'zod';

import {manualRegistry} from '../manuals/registry.ts';
import {
  assertSafeRepositoryPathChain,
  parseReferenceRetirementRegistry,
  type ReferenceRetirementRegistry,
} from '../reference/translationManifest.ts';
import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from './ownership.ts';

const requireModule = createRequire(import.meta.url);

const referencePresentations = manualRegistry.filter(
  (manual): manual is typeof manual & {presentation: NonNullable<typeof manual.presentation>} =>
    manual.kind === 'reference' && manual.presentation !== undefined,
);

const EXPECTED_TARGETS: Readonly<Record<string, {sidebar: string; sidebarKey: string}>> = Object.freeze(
  Object.fromEntries(
    referencePresentations.map(manual => [
      manual.id,
      {sidebar: manual.presentation.sidebar, sidebarKey: manual.presentation.sidebarKey},
    ]),
  ),
);

const REFERENCE_MANUAL_IDS = Object.freeze(Object.keys(EXPECTED_TARGETS)) as readonly [string, ...string[]];
const REFERENCE_SIDEBARS = Object.freeze(
  referencePresentations.map(manual => manual.presentation.sidebar),
) as readonly [string, ...string[]];
const REFERENCE_SIDEBAR_KEYS = Object.freeze(
  referencePresentations.map(manual => manual.presentation.sidebarKey),
) as readonly [string, ...string[]];

type Site = 'en' | 'zh-CN';
type Manual = string;

function repositoryRelativePathSchema() {
  return z.string().superRefine((value, context) => {
    try {
      assertSafeRepositoryRelativePath(value, 'Reference navigation path');
    } catch (error) {
      context.addIssue({code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : String(error)});
    }
  });
}

const TargetSchema = z.object({
  manual: z.enum(REFERENCE_MANUAL_IDS),
  sidebarKey: z.enum(REFERENCE_SIDEBAR_KEYS),
  sidebar: z.enum(REFERENCE_SIDEBARS),
  documentIdPrefix: repositoryRelativePathSchema(),
  landingPage: repositoryRelativePathSchema().refine(value => /\.mdx?$/u.test(value), 'Landing page must be a .md or .mdx file'),
  minimumProseCharacters: z.number().int().positive(),
  minimumHeadingCount: z.number().int().positive(),
  requireSourceDifference: z.boolean(),
}).strict().superRefine((target, context) => {
  const expected = EXPECTED_TARGETS[target.manual];
  if (target.sidebar !== expected.sidebar || target.sidebarKey !== expected.sidebarKey) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Manual ${target.manual} must use ${expected.sidebar}.sidebar.js and ${expected.sidebarKey}`,
    });
  }
  const landingId = target.landingPage.replace(/\.mdx?$/u, '');
  if (landingId !== target.documentIdPrefix && !landingId.startsWith(`${target.documentIdPrefix}/`)) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Landing page must stay below documentIdPrefix'});
  }
});

const ReferenceNavigationSchema = z.object({
  schemaVersion: z.literal(1),
  targets: z.array(TargetSchema).length(REFERENCE_MANUAL_IDS.length),
}).strict().superRefine((config, context) => {
  const manuals = new Set(config.targets.map(target => target.manual));
  for (const manual of Object.keys(EXPECTED_TARGETS) as Manual[]) {
    if (!manuals.has(manual)) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['targets'], message: `Missing required manual: ${manual}`});
    }
  }
  if (manuals.size !== config.targets.length) {
    context.addIssue({code: z.ZodIssueCode.custom, path: ['targets'], message: 'Each manual must appear exactly once'});
  }
});

type Target = z.infer<typeof TargetSchema>;
type SidebarItem = string | Readonly<Record<string, unknown>>;
type StructureNode = Readonly<{
  type: 'doc' | 'category';
  id?: string;
  link?: string;
  items?: readonly StructureNode[];
}>;

type SidebarAnalysis = Readonly<{
  documentIds: ReadonlySet<string>;
  signature: readonly StructureNode[];
}>;

type ErrorContext = Readonly<{
  site: Site;
  manual: string;
  sidebarPath: string;
  documentId: string;
  invariant: string;
}>;

function contextualError(context: ErrorContext, message: string): Error {
  return new Error(
    `site=${context.site} manual=${context.manual} sidebar=${context.sidebarPath} `
    + `documentId=${context.documentId} invariant=${context.invariant}: ${message}`,
  );
}

function configError(site: Site, relativePath: string, invariant: string, error: unknown): Error {
  return contextualError({
    site,
    manual: 'config',
    sidebarPath: relativePath,
    documentId: '(none)',
    invariant,
  }, error instanceof Error ? error.message : String(error));
}

function parseJsonFile(repositoryRoot: string, relativePath: string): unknown {
  const absolutePath = resolveOwnedRepositoryPath(repositoryRoot, relativePath, 'Reference navigation config');
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as unknown;
}

function loadConfig(repositoryRoot: string, site: Site): z.infer<typeof ReferenceNavigationSchema> {
  const relativePath = 'config/reference-navigation.json';
  try {
    return ReferenceNavigationSchema.parse(parseJsonFile(repositoryRoot, relativePath));
  } catch (error) {
    throw configError(site, relativePath, 'config-schema', error);
  }
}

function loadRetirements(repositoryRoot: string, site: Site): ReferenceRetirementRegistry {
  const relativePath = 'config/reference-retirements.json';
  try {
    return parseReferenceRetirementRegistry(parseJsonFile(repositoryRoot, relativePath));
  } catch (error) {
    throw configError(site, relativePath, 'retirement-schema', error);
  }
}

function sidebarRelativePath(site: Site, target: Target): string {
  return `generated/${site}/sidebars/${target.sidebar}.sidebar.js`;
}

function targetError(
  site: Site,
  target: Target,
  sidebarPath: string,
  documentId: string,
  invariant: string,
  message: string,
): Error {
  return contextualError({site, manual: target.manual, sidebarPath, documentId, invariant}, message);
}

function loadSidebar(repositoryRoot: string, site: Site, target: Target, reportedSite: Site): readonly SidebarItem[] {
  const relativePath = sidebarRelativePath(site, target);
  let absolutePath: string;
  let stats;
  try {
    absolutePath = assertSafeRepositoryPathChain(repositoryRoot, relativePath, 'Reference sidebar');
    stats = lstatSync(absolutePath);
  } catch (error) {
    throw targetError(reportedSite, target, relativePath, '(none)', 'sidebar-file', error instanceof Error ? error.message : String(error));
  }
  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw targetError(reportedSite, target, relativePath, '(none)', 'sidebar-file', 'sidebar must be a regular non-symlink file');
  }
  try {
    const resolved = requireModule.resolve(absolutePath);
    delete requireModule.cache[resolved];
    const loaded = requireModule(resolved) as unknown;
    const sidebar = loaded && typeof loaded === 'object' && !Array.isArray(loaded) && 'default' in loaded
      ? (loaded as {default: unknown}).default
      : loaded;
    if (!Array.isArray(sidebar)) {
      throw new Error('sidebar module must export an array');
    }
    return sidebar as readonly SidebarItem[];
  } catch (error) {
    throw targetError(reportedSite, target, relativePath, '(none)', 'sidebar-file', error instanceof Error ? error.message : String(error));
  }
}

function retirementDocumentIds(registry: ReferenceRetirementRegistry, manual: string): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const retirement of registry.retirements) {
    if (retirement.manual !== manual) continue;
    for (const [root, filePath] of [
      ['content/en/reference/', retirement.sourcePath],
      ['content/zh-CN/reference/', retirement.targetPath],
    ] as const) {
      if (filePath.startsWith(root) && /\.mdx?$/u.test(filePath)) {
        ids.add(filePath.slice(root.length).replace(/\.mdx?$/u, ''));
      }
    }
  }
  return ids;
}

function sidebarAnalysis(options: Readonly<{
  sidebar: readonly SidebarItem[];
  site: Site;
  target: Target;
  sidebarPath: string;
  retiredIds: ReadonlySet<string>;
}>): SidebarAnalysis {
  const documentIds = new Set<string>();

  const documentNode = (id: unknown): StructureNode | null => {
    if (typeof id !== 'string' || id.length === 0) {
      throw targetError(options.site, options.target, options.sidebarPath, '(invalid)', 'sidebar-structure', 'document item requires a non-empty string ID');
    }
    documentIds.add(id);
    if (options.retiredIds.has(id)) return null;
    return {type: 'doc', id};
  };

  const visit = (item: SidebarItem): StructureNode | null => {
    if (typeof item === 'string') return documentNode(item);
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw targetError(options.site, options.target, options.sidebarPath, '(invalid)', 'sidebar-structure', 'sidebar items must be document IDs or objects');
    }
    if (item.type === 'doc' || item.type === 'ref') return documentNode(item.id);
    if (item.type !== 'category' || !Array.isArray(item.items)) {
      throw targetError(options.site, options.target, options.sidebarPath, '(invalid)', 'sidebar-structure', 'sidebar objects must be doc, ref, or category items');
    }
    const children = item.items
      .map(child => visit(child as SidebarItem))
      .filter((child): child is StructureNode => child !== null);
    let link: string | undefined;
    if (item.link !== undefined) {
      if (!item.link || typeof item.link !== 'object' || Array.isArray(item.link)) {
        throw targetError(options.site, options.target, options.sidebarPath, '(invalid)', 'sidebar-structure', 'category links must be document link objects');
      }
      const categoryLink = item.link as Readonly<Record<string, unknown>>;
      if (categoryLink.type !== 'doc' || typeof categoryLink.id !== 'string') {
        throw targetError(options.site, options.target, options.sidebarPath, '(invalid)', 'sidebar-structure', 'category links must use a document ID');
      }
      documentIds.add(categoryLink.id);
      if (!options.retiredIds.has(categoryLink.id)) {
        link = categoryLink.id;
      }
    }
    if (children.length === 0 && link === undefined) return null;
    return {type: 'category', ...(link === undefined ? {} : {link}), items: children};
  };

  const signature = options.sidebar
    .map(item => visit(item))
    .filter((item): item is StructureNode => item !== null);
  return {documentIds, signature};
}

function assertOwnedDocumentId(site: Site, target: Target, sidebarPath: string, documentId: string): void {
  if (documentId !== target.documentIdPrefix && !documentId.startsWith(`${target.documentIdPrefix}/`)) {
    throw targetError(site, target, sidebarPath, documentId, 'document-ownership', `document ID must stay below ${target.documentIdPrefix}`);
  }
  try {
    assertSafeRepositoryRelativePath(documentId, 'Reference document ID');
  } catch (error) {
    throw targetError(site, target, sidebarPath, documentId, 'document-ownership', error instanceof Error ? error.message : String(error));
  }
}

function resolveDocument(
  repositoryRoot: string,
  site: Site,
  target: Target,
  sidebarPath: string,
  documentId: string,
): string {
  assertOwnedDocumentId(site, target, sidebarPath, documentId);
  const matches: string[] = [];
  for (const extension of ['.md', '.mdx']) {
    const relativePath = `content/${site}/reference/${documentId}${extension}`;
    const absolutePath = resolveOwnedRepositoryPath(repositoryRoot, relativePath, 'Reference document');
    if (!existsSync(absolutePath)) continue;
    const stats = lstatSync(absolutePath);
    if (stats.isSymbolicLink() || !stats.isFile()) {
      throw targetError(site, target, sidebarPath, documentId, 'document-resolution', `${relativePath} must be a regular non-symlink file`);
    }
    matches.push(absolutePath);
  }
  if (matches.length !== 1) {
    throw targetError(site, target, sidebarPath, documentId, 'document-resolution', `expected exactly one .md or .mdx file, found ${matches.length}`);
  }
  return matches[0];
}

function contentMetrics(source: string, site: Site): Readonly<{headingCount: number; proseUnits: number}> {
  const withoutFrontMatter = source.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, '');
  const meaningfulLines: string[] = [];
  let fence: '`' | '~' | null = null;
  let multilineImport = false;
  let headingCount = 0;
  for (const line of withoutFrontMatter.split(/\r?\n/u)) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/u.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0] as '`' | '~';
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence !== null) continue;
    if (/^ {0,3}#{1,6}\s+\S/u.test(line)) headingCount += 1;
    const trimmed = line.trim();
    if (multilineImport) {
      if (/;\s*$/u.test(trimmed) || /\bfrom\s+['"][^'"]+['"]\s*;?\s*$/u.test(trimmed)) multilineImport = false;
      continue;
    }
    if (/^(?:import|export)\b/u.test(trimmed)) {
      multilineImport = !/;\s*$/u.test(trimmed) && !/\bfrom\s+['"][^'"]+['"]\s*;?\s*$/u.test(trimmed);
      continue;
    }
    if (/^<\/?[A-Za-z][^>]*>\s*;?$/u.test(trimmed)) continue;
    meaningfulLines.push(line);
  }
  const proseUnits = [...meaningfulLines.join('\n').matchAll(/[\p{L}\p{N}]/gu)]
    .reduce((total, [character]) => total + (site === 'zh-CN' && /\p{Script=Han}/u.test(character) ? 2.5 : 1), 0);
  return {headingCount, proseUnits};
}

function validateTarget(
  repositoryRoot: string,
  site: Site,
  target: Target,
  retirements: ReferenceRetirementRegistry,
  excludedDocumentIds: ReadonlySet<string>,
): void {
  const selectedSidebarPath = sidebarRelativePath(site, target);
  const retiredIds = new Set([...retirementDocumentIds(retirements, target.manual), ...excludedDocumentIds]);
  const selectedSidebar = loadSidebar(repositoryRoot, site, target, site);
  const selected = sidebarAnalysis({
    sidebar: selectedSidebar,
    site,
    target,
    sidebarPath: selectedSidebarPath,
    retiredIds,
  });
  if (selected.documentIds.size === 0) {
    throw targetError(site, target, selectedSidebarPath, '(none)', 'non-empty-sidebar', 'sidebar must contain at least one active document ID');
  }

  const resolved = new Map<string, string>();
  for (const documentId of selected.documentIds) {
    resolved.set(documentId, resolveDocument(repositoryRoot, site, target, selectedSidebarPath, documentId));
  }

  const landingId = target.landingPage.replace(/\.mdx?$/u, '');
  if (!selected.documentIds.has(landingId)) {
    throw targetError(site, target, selectedSidebarPath, landingId, 'landing-in-sidebar', 'configured landing page document ID is absent from the sidebar');
  }
  const landingPath = resolved.get(landingId)!;
  const configuredLandingPath = path.join(repositoryRoot, `content/${site}/reference/${target.landingPage}`);
  if (path.resolve(landingPath) !== path.resolve(configuredLandingPath)) {
    throw targetError(site, target, selectedSidebarPath, landingId, 'landing-page-path', `landing document resolved to ${path.relative(repositoryRoot, landingPath)}`);
  }

  if (site === 'zh-CN') {
    const englishSidebarPath = sidebarRelativePath('en', target);
    const englishSidebar = loadSidebar(repositoryRoot, 'en', target, site);
    const english = sidebarAnalysis({
      sidebar: englishSidebar,
      site,
      target,
      sidebarPath: englishSidebarPath,
      retiredIds,
    });
    for (const documentId of english.documentIds) {
      resolveDocument(repositoryRoot, 'en', target, englishSidebarPath, documentId);
    }
    if (JSON.stringify(selected.signature) !== JSON.stringify(english.signature)) {
      throw targetError(site, target, selectedSidebarPath, '(structure)', 'locale-structure', 'English and Chinese category/document structure differs outside explicit unavailable Reference states');
    }
  }

  const landingSource = readFileSync(landingPath, 'utf8');
  const metrics = contentMetrics(landingSource, site);
  if (metrics.proseUnits < target.minimumProseCharacters) {
    throw targetError(
      site,
      target,
      selectedSidebarPath,
      landingId,
      'meaningful-prose',
      `landing page has ${metrics.proseUnits} meaningful prose units; requires ${target.minimumProseCharacters}`,
    );
  }
  if (metrics.headingCount < target.minimumHeadingCount) {
    throw targetError(
      site,
      target,
      selectedSidebarPath,
      landingId,
      'heading-count',
      `landing page has ${metrics.headingCount} Markdown headings; requires ${target.minimumHeadingCount}`,
    );
  }
  if (site === 'zh-CN' && target.requireSourceDifference) {
    const englishPath = resolveDocument(repositoryRoot, 'en', target, sidebarRelativePath('en', target), landingId);
    if (readFileSync(englishPath).equals(readFileSync(landingPath))) {
      throw targetError(site, target, selectedSidebarPath, landingId, 'source-difference', 'Chinese landing page is byte-identical to its English source');
    }
  }
}

export function validateReferenceNavigation(options: Readonly<{
  repositoryRoot: string;
  site: 'en' | 'zh-CN';
  excludedDocumentIds?: ReadonlySet<string>;
}>): void {
  const config = loadConfig(options.repositoryRoot, options.site);
  const retirements = loadRetirements(options.repositoryRoot, options.site);
  const errors: string[] = [];
  for (const target of config.targets) {
    try {
      validateTarget(options.repositoryRoot, options.site, target, retirements, options.excludedDocumentIds ?? new Set());
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (errors.length > 0) throw new Error(`Reference navigation validation failed:\n${errors.join('\n')}`);
}
