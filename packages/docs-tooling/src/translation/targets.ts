import {TranslationTargetSchema, type TranslationTarget, type TranslationTargetId} from './schema.ts';

const TARGETS = [
  {
    id: 'ja-JP',
    sourceSite: 'en',
    locale: 'ja-JP',
    mappings: [
      {sourceRoot: 'content/en/guides/tutorials', targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'},
      {sourceRoot: 'content/en/byoc/tutorials', targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials'},
      {sourceRoot: 'content/en/reference', targetRoot: 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current'},
    ],
    state: {kind: 'cache', path: '.translation-cache/ja-JP.json'},
    validation: ['validate-mdx', 'validate-coverage', 'build:en'],
  },
  {
    id: 'zh-CN-reference',
    sourceSite: 'en',
    targetSite: 'zh-CN',
    locale: 'zh-CN',
    sourceRoot: 'content/en/reference',
    targetRoot: 'content/zh-CN/reference',
    state: {kind: 'reference-manifest', path: 'generated/zh-CN/manifests/reference-translations.json'},
    validation: ['reference-manifest', 'validate-reference', 'build:zh-CN'],
  },
  {
    id: 'zh-CN-tools',
    sourceSite: 'en',
    targetSite: 'zh-CN',
    locale: 'zh-CN',
    sourceRoot: 'content/en/guides/tutorials/tools',
    targetRoot: 'content/zh-CN/guides/tutorials/tools',
    sidebarSource: 'generated/en/sidebars/guides.sidebar.js#category:tutorials/tools',
    sidebarTarget: 'generated/zh-CN/sidebars/tools.sidebar.js',
    state: {kind: 'tools-manifest', path: 'generated/zh-CN/manifests/tools-translations.json'},
    validation: ['validate-mdx', 'validate-tools-sidebar', 'validate-coverage', 'build:zh-CN'],
  },
] as const;

function ownershipPaths(target: TranslationTarget): string[] {
  if (target.id === 'ja-JP') return target.mappings.map(mapping => mapping.targetRoot);
  return target.id === 'zh-CN-tools' ? [target.targetRoot, target.sidebarTarget] : [target.targetRoot];
}

function overlaps(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) deepFreeze(child);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
}

export function parseTranslationTargets(value: unknown): readonly TranslationTarget[] {
  const targets = TranslationTargetSchema.array().parse(value);
  const ids = new Set<string>();
  const ownership: Array<{id: string; path: string}> = [];
  for (const target of targets) {
    if (ids.has(target.id)) throw new Error(`Duplicate translation target: ${target.id}`);
    ids.add(target.id);
    for (const targetPath of ownershipPaths(target)) {
      const collision = ownership.find(entry => overlaps(entry.path, targetPath));
      if (collision) throw new Error(`Translation target ownership must be disjoint: ${collision.id}:${collision.path} overlaps ${target.id}:${targetPath}`);
      ownership.push({id: target.id, path: targetPath});
    }
  }
  return targets;
}

export const translationTargets = deepFreeze(parseTranslationTargets(TARGETS));

export function resolveTranslationTarget(id: string): TranslationTarget {
  const target = translationTargets.find(candidate => candidate.id === id);
  if (!target) throw new Error(`Unknown translation target: ${id}`);
  return target;
}

export type {TranslationTarget, TranslationTargetId} from './schema.ts';
