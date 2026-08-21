import {manualRegistry} from '../registry.ts';
import type {SiteId} from '../schema.ts';
import {activeGeneratorSources} from './shared.ts';

export type FetchUnitDefinition = Readonly<{
  unitKey: string;
  producerJob: string;
  site: SiteId;
  group: string;
  translationSourceGroup: string | null;
  commitMessage: string;
}>;

function referenceManuals() {
  return manualRegistry
    .filter((manual) => manual.kind === 'reference' && manual.presentation !== undefined && manual.publications.en !== undefined)
    .sort((left, right) => left.presentation!.groupOrder - right.presentation!.groupOrder);
}

function commitMessage(group: string, referenceKind: string | undefined): string {
  if (referenceKind === 'cli') return `docs(${group}): publish CLI reference`;
  if (referenceKind === 'restful') return `docs(${group}): publish REST reference`;
  if (referenceKind) return `docs(${group}): publish SDK reference`;
  return `docs(${group}): publish fetched content`;
}

// Stable business ordering for the English source fetch units. The set of
// SDK/reference units is derived from the registry; this sequence controls
// document and card ordering and is intentionally stable across runs.
export const FETCH_BUSINESS_ORDER = Object.freeze([
  'source/java', 'source/node', 'source/go', 'source/cli', 'source/cpp',
  'source/rest', 'source/python', 'source/guides-en', 'source/guides-zh-CN',
]) as readonly string[];

export function sdkGroupIds(): readonly string[] {
  return Object.freeze(referenceManuals().map((manual) => manual.id));
}

// SDK groups that carry a Lark snapshot source (excludes spec-generated
// manuals such as rest); used by the SDK snapshot update wrapper.
export function sdkSnapshotGroupIds(): readonly string[] {
  return Object.freeze(
    referenceManuals()
      .filter((manual) => activeGeneratorSources(manual).some((source) => Boolean(source.generatorManual)))
      .map((manual) => manual.id),
  );
}

export function fetchUnitDefinitions(): readonly FetchUnitDefinition[] {
  const sdk = referenceManuals().map((manual) => ({
    unitKey: `source/${manual.id}`,
    producerJob: `produce_${manual.id}`,
    site: 'en' as SiteId,
    group: manual.id,
    translationSourceGroup: manual.id,
    commitMessage: commitMessage(manual.id, manual.presentation!.referenceKind),
  }));
  const units = [
    ...sdk,
    {unitKey: 'source/guides-en', producerJob: 'produce_guides', site: 'en' as SiteId, group: 'guides', translationSourceGroup: 'guides', commitMessage: 'docs(guides): publish fetched content'},
    {unitKey: 'source/guides-zh-CN', producerJob: 'produce_zh_guides', site: 'zh-CN' as SiteId, group: 'guides', translationSourceGroup: null, commitMessage: 'docs(guides): publish fetched content'},
  ];
  const byKey = new Map(units.map((unit) => [unit.unitKey, unit]));
  return Object.freeze(FETCH_BUSINESS_ORDER.map((unitKey) => {
    const unit = byKey.get(unitKey);
    if (!unit) throw new Error(`Fetch business order references unknown unit: ${unitKey}`);
    return Object.freeze(unit);
  }));
}

export function fetchUnitKeys(): readonly string[] {
  return Object.freeze(fetchUnitDefinitions().map((unit) => unit.unitKey));
}

export function fetchGroupUnitKeys(): Readonly<Record<string, readonly string[]>> {
  const grouped: Record<string, string[]> = {};
  for (const unit of fetchUnitDefinitions()) {
    (grouped[unit.group] ??= []).push(unit.unitKey);
  }
  return Object.freeze(Object.fromEntries(
    Object.entries(grouped).map(([group, keys]) => [group, Object.freeze(keys)]),
  ));
}

export function sourcePublicationGroups(): readonly string[] {
  return Object.freeze(['guides', ...sdkGroupIds()]);
}

// Parses the workflow_dispatch group input: 'all', a single registered group
// (e.g. 'guides' or 'python'), or a comma-separated subset such as
// 'python,java'. Throws on empty or unknown groups so CI can fail closed.
export function parseSelectedGroups(value: string): readonly string[] {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) throw new Error('Selected publication group is empty');
  if (trimmed === 'all') return sourcePublicationGroups();
  const groups = trimmed.split(',').map(part => part.trim()).filter(Boolean);
  if (groups.length === 0) throw new Error(`Invalid selected publication groups: ${value}`);
  const valid = new Set(sourcePublicationGroups());
  for (const group of groups) {
    if (!valid.has(group)) throw new Error(`Unknown publication group: ${group}`);
  }
  return Object.freeze([...new Set(groups)]);
}

export function referenceGroupIds(): readonly string[] {
  return Object.freeze(referenceManuals().map((manual) => manual.id));
}

export function referenceSidebars(): readonly string[] {
  return Object.freeze(referenceManuals().map((manual) => manual.presentation!.sidebar));
}

export function referenceLandingSidebars(): readonly string[] {
  return Object.freeze(
    referenceManuals()
      .filter((manual) => manual.presentation!.referenceKind !== 'restful')
      .map((manual) => manual.presentation!.sidebar),
  );
}

// Stable translation unit order matching the committed Translation
// publication selection. zh-CN-reference/rest is intentionally absent
// (the REST Chinese reference is spec-generated).
export const TRANSLATION_UNIT_ORDER = Object.freeze([
  'translation/ja-JP/guides',
  ...sdkGroupIds().flatMap((id) => [
    `translation/ja-JP/${id}`,
    ...(id === 'rest' ? [] : [`translation/zh-CN-reference/${id}`]),
  ]),
  'translation/zh-CN-reference/reference-landings',
]) as readonly string[];

// monitor-translation-progress historically tracked zh-CN-reference/rest;
// kept as a distinct order to preserve that display behavior.
export const MONITOR_TRANSLATION_UNIT_ORDER = Object.freeze([
  'translation/ja-JP/guides',
  ...sdkGroupIds().flatMap((id) => [
    `translation/ja-JP/${id}`,
    `translation/zh-CN-reference/${id}`,
  ]),
  'translation/zh-CN-reference/reference-landings',
]) as readonly string[];

export function translationSelectedGroups(): readonly string[] {
  return Object.freeze(['all', 'guides', ...sdkGroupIds(), 'reference-landings']);
}

export function translationGroupLabels(): Readonly<Record<string, string>> {
  const labels: Record<string, string> = {
    guides: 'Guides',
    'reference-landings': 'Reference landing pages',
  };
  for (const manual of referenceManuals()) {
    const label = manual.presentation!.label.en;
    labels[manual.id] = manual.id === 'cli' ? manual.presentation!.label['zh-CN'] : label;
  }
  return Object.freeze(labels);
}

export function unitToCardId(): Readonly<Record<string, string>> {
  const mapping: Record<string, string> = {
    'source/guides-en': 'guides-en',
    'source/guides-zh-CN': 'guides-zh-CN',
  };
  for (const manual of referenceManuals()) {
    mapping[`source/${manual.id}`] = manual.id;
  }
  return Object.freeze(mapping);
}

export function referenceRootsZhCn(): Readonly<Record<string, string>> {
  const roots: Record<string, string> = {};
  for (const manual of referenceManuals()) {
    const publication = manual.publications['zh-CN'];
    if (!publication) continue;
    const referenceRoot = 'content/zh-CN/reference/';
    const relative = publication.outputDir.slice(referenceRoot.length).split('/');
    const family = relative[0] === 'api' ? relative.slice(0, 2).join('/') : relative[0];
    roots[manual.id] = `${referenceRoot}${family}`;
  }
  return Object.freeze(roots);
}

export function referenceLandingsZhCn(): readonly string[] {
  return Object.freeze(
    referenceManuals().filter((manual) => manual.presentation!.referenceKind !== 'restful').map((manual) => {
      return `content/zh-CN/reference/${manual.presentation!.documentIdPrefix}/${manual.presentation!.landingPage.split('/').at(-1)}`;
    }),
  );
}

export function reconciliationTargetGroups(): Readonly<Record<string, readonly string[]>> {
  const sdk = sdkGroupIds();
  return Object.freeze({
    'ja-JP': Object.freeze(['guides', ...sdk]),
    'zh-CN-reference': Object.freeze([...sdk, 'reference-landings']),
  });
}

export const RECONCILIATION_TARGET_MAPPINGS = Object.freeze({
  'ja-JP': Object.freeze([
    Object.freeze(['content/en/guides/tutorials', 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials']),
    Object.freeze(['content/en/byoc/tutorials', 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials']),
    Object.freeze(['content/en/reference', 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current']),
  ]),
  'zh-CN-reference': Object.freeze([
    Object.freeze(['content/en/reference', 'content/zh-CN/reference']),
  ]),
}) as Readonly<Record<string, readonly (readonly string[])[]>>;
