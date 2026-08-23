import {manualRegistry, resolveManualPublication} from '../manuals/registry.ts';
import type {ManualDefinition, SiteId} from '../manuals/schema.ts';

export type PublicationGroupStage = 'fetch' | 'validate' | 'publish';

export type PublicationGroup = Readonly<{
  site: SiteId;
  manuals: readonly string[];
  ownedPaths: readonly string[];
  protectedPaths?: readonly string[];
  publicationManifest?: string;
}>;

export type PublicationGroupWorkflow = Readonly<{
  group: PublicationGroup;
  sourceManuals: readonly string[];
  sourceSnapshots: readonly string[];
  snapshotManual: string | null;
  translate: boolean;
  durableTranslationBatchSize: number;
  checkpointPaths: readonly string[];
  preservedPaths: readonly string[];
  commitMessage: string;
}>;

type DeepReadonlyManual = Readonly<ManualDefinition>;

function englishGroupOrder(): readonly string[] {
  return Object.freeze([
    'guides',
    ...manualRegistry
      .filter((manual): manual is DeepReadonlyManual => manual.kind === 'reference' && manual.publications.en !== undefined)
      .sort((left, right) => (left.presentation?.groupOrder ?? Number.MAX_SAFE_INTEGER) - (right.presentation?.groupOrder ?? Number.MAX_SAFE_INTEGER))
      .map(manual => manual.id),
  ]);
}

function chineseGroupOrder(): readonly string[] {
  return Object.freeze([
    'guides',
    ...manualRegistry
      .filter(manual => manual.kind !== 'reference' && manual.id !== 'guides' && manual.id !== 'guides-byoc' && manual.publications['zh-CN'])
      .map(manual => manual.id),
  ]);
}

const GROUP_ORDER = Object.freeze({
  en: englishGroupOrder(),
  'zh-CN': chineseGroupOrder(),
} as const);

function guidesGroupManuals(site: SiteId): readonly string[] {
  return Object.freeze(
    manualRegistry
      .filter(manual => manual.kind === 'guides' && manual.publications[site])
      .map(manual => manual.id),
  );
}

function groupManualsForGroup(site: SiteId, group: string): readonly string[] {
  if (group === 'guides') return guidesGroupManuals(site);
  return Object.freeze([group]);
}

const MANUALS = Object.freeze({
  en: Object.freeze(Object.fromEntries(
    GROUP_ORDER.en.map(group => [group, groupManualsForGroup('en', group)]),
  ) as Record<string, readonly string[]>),
  'zh-CN': Object.freeze(Object.fromEntries(
    GROUP_ORDER['zh-CN'].map(group => [group, groupManualsForGroup('zh-CN', group)]),
  ) as Record<string, readonly string[]>),
} as const);

const ZH_CN_GUIDES_PUBLICATION_MANIFEST = 'generated/zh-CN/manifests/guides-source-publication.json';

const GUIDES_CHECKPOINT_PATHS = Object.freeze([
  'packages/docs-tooling/src/lark/meta/assembly/guides.json',
  'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.json',
  'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.md',
  'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.csv',
  'packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.json',
  'packages/docs-tooling/src/lark/meta/reports/guides-incremental-fetch-plan.md',
  'packages/docs-tooling/src/lark/meta/reports/guides-broken-content-links.json',
]);

const REFERENCE_GROUP_IDS = Object.freeze([
  ...manualRegistry.filter(manual => manual.kind === 'reference').map(manual => manual.id),
  'reference',
]);

function deriveCommitMessages(): Readonly<Record<string, string>> {
  const messages: Record<string, string> = {
    guides: 'docs(guides): publish fetched content',
  };
  for (const manual of manualRegistry) {
    if (manual.id === 'guides' || manual.id === 'guides-byoc') continue;
    if (!manual.publications.en && !manual.publications['zh-CN']) continue;
    if (manual.kind !== 'reference') {
      messages[manual.id] = `docs(${manual.id}): publish fetched content`;
      continue;
    }
    const referenceKind = manual.presentation?.referenceKind;
    if (referenceKind === 'cli') messages[manual.id] = `docs(${manual.id}): publish CLI reference`;
    else if (referenceKind === 'restful') messages[manual.id] = `docs(${manual.id}): publish REST reference`;
    else messages[manual.id] = `docs(${manual.id}): publish SDK reference`;
  }
  return Object.freeze(messages);
}

const COMMIT_MESSAGES = deriveCommitMessages();

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function groupManuals(site: SiteId, group: string): readonly string[] {
  const definitions = MANUALS[site] as Readonly<Record<string, readonly string[]>>;
  const manuals = Object.hasOwn(definitions, group) ? definitions[group] : undefined;
  if (manuals) return manuals;
  if (site === 'zh-CN' && group === 'tools') {
    throw new Error('Agent-produced Chinese Tools publication cannot be fetched as a source publication group');
  }
  if (site === 'zh-CN' && REFERENCE_GROUP_IDS.includes(group)) {
    throw new Error('Agent-produced Chinese Reference publication cannot be fetched as a source publication group');
  }
  throw new Error(`Unknown publication group for site ${site}: ${group}`);
}

function ownedPaths(site: SiteId, manuals: readonly string[]): readonly string[] {
  const resolved = manuals.map(manual => resolveManualPublication(manual, site));
  return Object.freeze([
    ...resolved.map(entry => entry.manual.kind === 'guides' ? entry.publication.contentRoot : entry.publication.outputDir),
    ...resolved.map(entry => entry.publication.sidebarPath),
    ...resolved.flatMap(entry => (entry.publication.retiredPaths ?? []).map(retired => `content/${site}/${retired}`)),
  ]);
}

function createGroup(site: SiteId, group: string): PublicationGroup {
  const manuals = groupManuals(site, group);
  const value: PublicationGroup = {
    site,
    manuals: Object.freeze([...manuals]),
    ownedPaths: Object.freeze([
      ...ownedPaths(site, manuals),
      ...(site === 'zh-CN' && group === 'guides' ? ['generated/zh-CN/sidebars/tools.sidebar.js'] : []),
    ]),
    ...(site === 'zh-CN' && group === 'guides' ? {
      publicationManifest: ZH_CN_GUIDES_PUBLICATION_MANIFEST,
    } : {}),
  };
  return deepFreeze(value);
}

const REGISTRY = deepFreeze(Object.fromEntries(
  (['en', 'zh-CN'] as const).flatMap(site => GROUP_ORDER[site].map(group => [`${site}:${group}`, createGroup(site, group)])),
) as Record<string, PublicationGroup>);

export function listPublicationGroups(site: SiteId): readonly string[] {
  return GROUP_ORDER[site];
}

export function resolvePublicationGroup(site: SiteId, group: string): PublicationGroup {
  // Keep the Agent-produced errors more actionable than a generic missing key.
  groupManuals(site, group);
  return REGISTRY[`${site}:${group}`];
}

export function canonicalPublicationGroupForManual(site: SiteId, manual: string): string {
  resolveManualPublication(manual, site);
  return manual === 'guides-byoc' ? 'guides' : manual;
}

function distinct(values: readonly (string | undefined)[]): readonly string[] {
  return Object.freeze([...new Set(values.filter((value): value is string => Boolean(value)))]);
}

const ENGLISH_REFERENCE_CONTENT_MANIFEST = 'content/en/reference/content-manifest.json';

export function resolvePublicationGroupWorkflow(site: SiteId, groupName: string): PublicationGroupWorkflow {
  const group = resolvePublicationGroup(site, groupName);
  const resolved = group.manuals.map(manual => resolveManualPublication(manual, site));
  const sourceManuals = distinct(resolved.flatMap(entry => entry.sourceChain.map(source => source.source.generatorManual)));
  const sourceSnapshots = distinct(resolved.map(entry => entry.source.snapshotPath));
  const preservedPaths = distinct(resolved.flatMap(entry => (entry.publication.preservedFiles ?? []).map(file => `${entry.publication.outputDir}/${file}`)));
  return deepFreeze({
    group,
    sourceManuals,
    sourceSnapshots,
    snapshotManual: sourceManuals.at(-1) ?? null,
    translate: site === 'en',
    durableTranslationBatchSize: site === 'en' && groupName === 'guides' ? 30 : 0,
    checkpointPaths: distinct([
      ...group.ownedPaths,
      ...preservedPaths,
      ...sourceSnapshots,
      ...(site === 'en' && groupName === 'guides' ? GUIDES_CHECKPOINT_PATHS : []),
      ...(site === 'en' ? [ENGLISH_REFERENCE_CONTENT_MANIFEST] : []),
      ...(group.publicationManifest ? [group.publicationManifest] : []),
      ...(site === 'en' ? [`generated/en/manifests/lark-revisions/${groupName}.json`] : []),
    ]),
    preservedPaths,
    commitMessage: COMMIT_MESSAGES[groupName as keyof typeof COMMIT_MESSAGES],
  });
}

export const publicationGroupOrder = GROUP_ORDER;
