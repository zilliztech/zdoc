import {z} from 'zod';

import {
  ManualDefinitionSchema,
  type ManualDefinition,
  type ManualPublication,
  type ManualSource,
  type SiteId,
} from './schema.ts';

export type DeepReadonly<T> =
  T extends (...args: never[]) => unknown ? T :
  T extends readonly unknown[] ? {readonly [Key in keyof T]: DeepReadonly<T[Key]>} :
  T extends object ? {readonly [Key in keyof T]: DeepReadonly<T[Key]>} :
  T;

function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}

function pathsOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function siteOwnedPath(site: SiteId, path: string, category: 'content' | 'generated' | 'override'): boolean {
  const root = category === 'content' ? `content/${site}` : category === 'generated' ? `generated/${site}` : `sidebar-overrides/${site}`;
  return path === root || path.startsWith(`${root}/`);
}

export type PublicationEntry = {
  manual: DeepReadonly<ManualDefinition>;
  site: SiteId;
  publication: DeepReadonly<ManualPublication>;
};

export type SourceEntry = Readonly<{
  key: string;
  source: DeepReadonly<ManualSource>;
}>;

function sourceChainFor(manual: DeepReadonly<ManualDefinition>, sourceKey: string): readonly SourceEntry[] {
  const chain: SourceEntry[] = [];
  const seen = new Set<string>();
  let currentKey: string | undefined = sourceKey;
  while (currentKey) {
    if (seen.has(currentKey)) throw new Error(`Manual ${manual.id} source fallback cycle includes ${currentKey}`);
    seen.add(currentKey);
    const source = manual.sources[currentKey];
    if (!source) throw new Error(`Manual ${manual.id} references unknown source ${currentKey}`);
    if (source.lifecycle === 'retired') throw new Error(`Manual ${manual.id} retired source ${currentKey} cannot be an active fallback`);
    chain.push({key: currentKey, source});
    currentKey = source.fallbackSource;
  }
  return deepFreeze(chain.reverse());
}

export function publicationEntries(registry: readonly DeepReadonly<ManualDefinition>[]): PublicationEntry[] {
  return registry.flatMap(manual => (['en', 'zh-CN'] as const).flatMap(site => {
    const publication = manual.publications[site];
    return publication ? [{manual, site, publication}] : [];
  }));
}

export function validateManualRegistry(input: unknown): ManualDefinition[] {
  const registry = z.array(ManualDefinitionSchema).min(1).parse(input);
  const ids = new Set<string>();

  for (const manual of registry) {
    if (ids.has(manual.id)) throw new Error(`Duplicate manual id: ${manual.id}`);
    ids.add(manual.id);

    const sourceOrder = manual.sourceOrder ?? Object.keys(manual.sources);
    if (new Set(sourceOrder).size !== sourceOrder.length || sourceOrder.length !== Object.keys(manual.sources).length || sourceOrder.some(key => !Object.hasOwn(manual.sources, key))) {
      throw new Error(`Manual ${manual.id} sourceOrder must contain every source key exactly once`);
    }
    const sourcePositions = new Map(sourceOrder.map((key, index) => [key, index]));
    for (const [sourceKey, source] of Object.entries(manual.sources)) {
      if (source.fallbackSource !== undefined && !Object.hasOwn(manual.sources, source.fallbackSource)) {
        throw new Error(`Manual ${manual.id} source ${sourceKey} references unknown fallback source ${source.fallbackSource}`);
      }
      if (source.fallbackSource !== undefined && (sourcePositions.get(source.fallbackSource) ?? Infinity) >= (sourcePositions.get(sourceKey) ?? -1)) {
        throw new Error(`Manual ${manual.id} source ${sourceKey} fallback must precede it in sourceOrder`);
      }
      if (source.lifecycle === 'retired' && source.fallbackSource !== undefined) {
        throw new Error(`Manual ${manual.id} retired source ${sourceKey} must not declare a fallback`);
      }
    }

    const reachableSources = new Set<string>();
    for (const site of ['en', 'zh-CN'] as const) {
      const publication = manual.publications[site];
      if (!publication) continue;
      const source = manual.sources[publication.source];
      if (!source) throw new Error(`Manual ${manual.id} ${site} publication references unknown source key ${publication.source}`);
      for (const entry of sourceChainFor(manual, publication.source)) reachableSources.add(entry.key);
      if (!siteOwnedPath(site, publication.outputDir, 'content') || !siteOwnedPath(site, publication.contentRoot, 'content')) {
        throw new Error(`Manual ${manual.id} ${site} publication content paths must be site-owned`);
      }
      if (!siteOwnedPath(site, publication.sidebarPath, 'generated')) {
        throw new Error(`Manual ${manual.id} ${site} publication sidebar path must be site-owned`);
      }
      if (publication.overridePath && !siteOwnedPath(site, publication.overridePath, 'override')) {
        throw new Error(`Manual ${manual.id} ${site} publication override path must be site-owned`);
      }
      if (publication.enabled && publication.missingContent !== 'error') {
        throw new Error(`Manual ${manual.id} ${site} active publication must use missingContent: error`);
      }
      if (!publication.enabled) {
        if (publication.missingContent !== 'explicitly-disabled') {
          throw new Error(`Manual ${manual.id} ${site} disabled publication must use missingContent: explicitly-disabled`);
        }
        if (source.fallbackSource !== undefined) {
          throw new Error(`Manual ${manual.id} ${site} disabled publication must not use a fallback source`);
        }
      }
      if (manual.kind === 'reference' && site === 'zh-CN' && publication.enabled) {
        if (source.sourceType !== 'local' || !source.sourceDir.startsWith('content/zh-CN/reference/')) {
          throw new Error(`Manual ${manual.id} Chinese Reference publication must use committed local content`);
        }
        if (source.fallbackSource !== undefined) {
          throw new Error(`Manual ${manual.id} Chinese Reference publication must not use a fallback source`);
        }
      }
    }
    for (const [sourceKey, source] of Object.entries(manual.sources)) {
      if (!reachableSources.has(sourceKey) && source.lifecycle !== 'retired') {
        throw new Error(`Manual ${manual.id} source ${sourceKey} is dead or unreachable and must be classified retired`);
      }
    }
  }

  const entries = publicationEntries(registry);
  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const left = entries[leftIndex];
      const right = entries[rightIndex];
      if (pathsOverlap(left.publication.outputDir, right.publication.outputDir)) {
        throw new Error(`Manual publication output overlap: ${left.manual.id}/${left.site} and ${right.manual.id}/${right.site}`);
      }
    }
  }

  const activeTargets = entries
    .filter(entry => entry.publication.enabled)
    .flatMap(entry => [entry.publication.outputDir, entry.publication.sidebarPath]);
  for (const entry of entries) {
    for (const retiredPath of entry.publication.retiredPaths ?? []) {
      const absoluteRetiredPath = `content/${entry.site}/${retiredPath}`;
      if (activeTargets.some(target => pathsOverlap(absoluteRetiredPath, target))) {
        throw new Error(`Manual ${entry.manual.id}/${entry.site} retired path overlaps an active publication target: ${retiredPath}`);
      }
    }
  }

  return registry;
}

const larkSourceRoot = 'packages/docs-tooling/src/lark/meta/sources';

function remote(
  sourceType: Exclude<ManualSource['sourceType'], 'local' | 'rest'>,
  root: string,
  base: string,
  sourceDir: string,
  generatorManual?: string,
  version?: string,
  lifecycle: ManualSource['lifecycle'] = 'active',
  fallbackSource?: string,
): ManualSource {
  return {
    sourceType,
    lifecycle,
    root,
    base,
    ...(generatorManual ? {
      generatorManual,
      snapshotPath: `packages/docs-tooling/src/lark/meta/snapshots/${generatorManual}-uat-last-success.json`,
    } : {}),
    ...(version ? {version} : {}),
    sourceDir: `${larkSourceRoot}/${sourceDir}`,
    ...(fallbackSource ? {fallbackSource} : {}),
  };
}

function local(sourceDir: string): ManualSource {
  return {sourceType: 'local', lifecycle: 'translation', sourceDir};
}

function rest(sourceDir: string): ManualSource {
  return {sourceType: 'rest', lifecycle: 'active', sourceDir};
}

function publication(
  site: SiteId,
  source: string,
  outputDir: string,
  contentRoot: string,
  sidebar: string,
  generatorTarget: ManualPublication['generatorTarget'] = 'zilliz',
  retiredPaths?: string[],
  preservedFiles?: string[],
): ManualPublication {
  return {
    enabled: true,
    source,
    generatorTarget,
    outputDir: `content/${site}/${outputDir}`,
    contentRoot: `content/${site}/${contentRoot}`,
    sidebarPath: `generated/${site}/sidebars/${sidebar}.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/${sidebar}.json`,
    missingContent: 'error',
    ...(retiredPaths ? {retiredPaths} : {}),
    ...(preservedFiles ? {preservedFiles} : {}),
  };
}

const definitions: ManualDefinition[] = [
  {
    id: 'cli',
    kind: 'reference',
    sources: {
      'chinese-v0.1': remote('drive', 'PPuBfnEIWltim9dw8hxcC3EDnwb', 'OAK4bJaNuac501sX6Y1cS3OGnzf', 'cli/v0.1.x', undefined, '0.1.x', 'retired'),
      'english-v1.3': remote('drive', 'QBLKf6CCPloK0cddw6gcXUZqnob', 'Rr4lbWr8baQj5psICV9cEFa2nYe', 'cli/v1.3.x', 'cliv13', 'v1.3.x', 'fallback'),
      'chinese-v1.3': remote('drive', 'QBLKf6CCPloK0cddw6gcXUZqnob', 'Rr4lbWr8baQj5psICV9cEFa2nYe', 'cli/v1.3.x', undefined, '1.3.x', 'retired'),
      'english-v1.4': remote('drive', 'LF1Kf54jFllUBydVk7hcha30nUh', 'Lx1bbCdpMaSmJXs8wz5cjsDengf', 'cli/v1.4.x', 'cliv14', '1.4.x', 'active', 'english-v1.3'),
      chineseTranslation: local('content/zh-CN/reference/cli/cli'),
    },
    sourceOrder: ['chinese-v0.1', 'english-v1.3', 'chinese-v1.3', 'english-v1.4', 'chineseTranslation'],
    publications: {
      en: publication('en', 'english-v1.4', 'reference/cli/cli', 'reference', 'cli', 'zilliz', ['reference/cli/v0.1', 'reference/cli/v1.3']),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/cli/cli', 'reference', 'cli', 'zilliz', ['reference/cli/v0.1', 'reference/cli/v1.3']),
    },
  },
  {
    id: 'go',
    kind: 'reference',
    sources: {
      'english-v2.4': remote('wiki', 'V0SCw3U3siZBynkKhUCcRRAin69', 'WA8rbgtu8aq3wtsBm02cepOznPJ', 'go/v2.4.x', undefined, 'v2.4.x', 'retired'),
      'english-v2.6': remote('drive', 'Pzejf3x4WlXq1HdtTndcfMjVnxh', 'Yc7gbtmgSal2ewsdqlhcLWVanbh', 'go/v2.6.x', 'gov226', 'v2.6.x', 'fallback'),
      'english-v3.0': remote('drive', 'F9M3fK4Dbl69PPdSxTXcsIwgnDh', 'KQT5bV62QaioKisKZT0crwZDnke', 'go/v3.0.x', 'gov230', 'v3.0.x', 'active', 'english-v2.6'),
      chineseTranslation: local('content/zh-CN/reference/api/go/go/v2'),
    },
    sourceOrder: ['english-v2.4', 'english-v2.6', 'english-v3.0', 'chineseTranslation'],
    publications: {
      en: publication('en', 'english-v3.0', 'reference/api/go/go/v2', 'reference', 'go', 'zilliz', ['reference/api/go/go/v1']),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/go/go/v2', 'reference', 'go', 'zilliz', ['reference/api/go/go/v1']),
    },
  },
  {
    id: 'guides',
    kind: 'guides',
    sources: {
      english: remote('wiki', 'Tg6mwbRGDitPQ3kLUQzc44I7nth', 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*', 'guides', 'guides'),
      chinese: remote('wiki', 'XyeFwdx6kiK9A6kq3yIcLNdEnDd', 'I6YUb1M0JajHrqsJGcLcZNh7neP:*', 'guides-zh-CN', 'guides'),
    },
    sourceOrder: ['english', 'chinese'],
    publications: {
      en: publication('en', 'english', 'guides/tutorials', 'guides', 'guides', 'zilliz.saas', undefined, ['home.md']),
      'zh-CN': publication('zh-CN', 'chinese', 'guides/tutorials', 'guides', 'guides', 'zilliz.saas', undefined, ['home.md']),
    },
  },
  {
    id: 'guides-byoc',
    kind: 'guides',
    sources: {
      english: remote('wiki', 'Tg6mwbRGDitPQ3kLUQzc44I7nth', 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*', 'guides', 'guides'),
      chinese: remote('wiki', 'XyeFwdx6kiK9A6kq3yIcLNdEnDd', 'I6YUb1M0JajHrqsJGcLcZNh7neP:*', 'guides-zh-CN', 'guides'),
    },
    sourceOrder: ['english', 'chinese'],
    publications: {
      en: publication('en', 'english', 'byoc/tutorials', 'byoc', 'guides-byoc', 'zilliz.paas'),
      'zh-CN': publication('zh-CN', 'chinese', 'byoc/tutorials', 'byoc', 'guides-byoc', 'zilliz.paas'),
    },
  },
  {
    id: 'java',
    kind: 'reference',
    sources: {
      'english-v1-2.4': remote('onePager', 'D0cfwvTqMiyhSrkCUv4c1a2Fnjd', 'A4ivb7y2XaIND9s93QZcvwykn0d', 'java/v2.4.x/v1', undefined, 'v2.4.x', 'retired'),
      'english-v2-2.4': remote('drive', 'Sg3EfIgVtlTkeBdtguJchE9ynne', 'WqHJb3zimaxXjssk4Kic4GEDnte', 'java/v2.4.x/v2', 'javaV2', 'v2.4.x', 'fallback'),
      'english-v2.5': remote('drive', 'LJ6MfN5wzlHjz8dB642cjUh8nqq', 'Hsq1bRcqraeQW0sGFJbcI3YIn3d', 'java/v2.5.x/v2', 'javaV225', 'v2.5.x', 'fallback', 'english-v2-2.4'),
      'english-v2.6': remote('drive', 'B1agfRbPglv4tpdTkjlcUMgVnRV', 'Sbtcbm660abngWsXryKct5nOn2e', 'java/v2.6.x/v2', 'javaV226', 'v2.6.x', 'fallback', 'english-v2.5'),
      'english-v3.0': remote('drive', 'C4Ckfsx5qlKHbnd5PVrcpxvTn2d', 'AOFDbSmwma9XrNsLa8KcQgt9ngc', 'java/v3.0.x/v2', 'javaV230', 'v3.0.x', 'active', 'english-v2.6'),
      chineseTranslation: local('content/zh-CN/reference/api/java/java/v2'),
    },
    sourceOrder: ['english-v1-2.4', 'english-v2-2.4', 'english-v2.5', 'english-v2.6', 'english-v3.0', 'chineseTranslation'],
    publications: {
      en: publication('en', 'english-v3.0', 'reference/api/java/java/v2', 'reference', 'java', 'zilliz', ['reference/api/java/java/v1']),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/java/java/v2', 'reference', 'java', 'zilliz', ['reference/api/java/java/v1']),
    },
  },
  {
    id: 'node',
    kind: 'reference',
    sources: {
      'english-v2.4': remote('drive', 'Vg1kfluyll0h7MdlUMaciXfEnZd', 'DVVobtXQMamuLqsQij5c29nVn3c', 'node/v2.4.x', 'node', 'v2.4.x', 'fallback'),
      'english-v2.5': remote('drive', 'U9fWfMPdelsPMydYnolcr2aEnBf', 'JTBebezMDaV8ZhsHF5wc7lJSnuh', 'node/v2.5.x', 'nodejs25', 'v2.5.x', 'fallback', 'english-v2.4'),
      'english-v2.6': remote('drive', 'NFmOfwILlln3JgdePZUclweZnIe', 'R9i8bww4faNsR6smwQwcAtHGnkb', 'node/v2.6.x', 'nodejs26', 'v2.6.x', 'fallback', 'english-v2.5'),
      'english-v3.0': remote('drive', 'LW67fVlTvlNCZRdxOVYcQZyJnFQ', 'LlrPbysPZau2dGsSVuicHmvCn0e', 'node/v3.0.x', 'nodejs30', 'v3.0.x', 'active', 'english-v2.6'),
      chineseTranslation: local('content/zh-CN/reference/api/nodejs/nodejs'),
    },
    sourceOrder: ['english-v2.4', 'english-v2.5', 'english-v2.6', 'english-v3.0', 'chineseTranslation'],
    publications: {
      en: publication('en', 'english-v3.0', 'reference/api/nodejs/nodejs', 'reference', 'node'),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/nodejs/nodejs', 'reference', 'node'),
    },
  },
  {
    id: 'onpremise',
    kind: 'onpremise',
    sources: {
      chinese: remote('wiki', 'PXwawNqh0i40H4krMYlc6qgZnKe', 'V7t6bcQWiaDL99sgUkwcEIJ0nUb', 'onpremise', 'onpremise'),
    },
    sourceOrder: ['chinese'],
    publications: {
      'zh-CN': publication('zh-CN', 'chinese', 'onpremise', 'onpremise', 'onpremise'),
    },
  },
  {
    id: 'python',
    kind: 'reference',
    sources: {
      'english-v2.4': remote('drive', 'PTJzfzI0ulKGjwdUsxQcFxfJn6b', 'D1VabelmAansLwsNTvLc2Wxxn1g', 'python/v2.4.x', 'python', 'v2.4.x', 'fallback'),
      'english-v2.5': remote('drive', 'Z1SFf89zYlGHXvdo6dxcR6gXntc', 'B8X9bJjJta2q4NskclYcxT7lngG', 'python/v2.5.x', 'pymilvus25', 'v2.5.x', 'fallback', 'english-v2.4'),
      'english-v2.6': remote('drive', 'IaWgf4osAlpdwqdVIclct97wnCg', 'J3Qzbv7AWazzivsv7vqcqlGCnFc', 'python/v2.6.x', 'pymilvus26', 'v2.6.x', 'fallback', 'english-v2.5'),
      'english-v3.0': remote('drive', 'UxyTfjS3wl0TF8dn9tZcRT39nUe', 'Hk05b5eI6aXXSSsd6j9cqwwMn5a', 'python/v3.0.x', 'pymilvus30', 'v3.0.x', 'active', 'english-v2.6'),
      chineseTranslation: local('content/zh-CN/reference/api/python/python'),
    },
    sourceOrder: ['english-v2.4', 'english-v2.5', 'english-v2.6', 'english-v3.0', 'chineseTranslation'],
    publications: {
      en: publication('en', 'english-v3.0', 'reference/api/python/python', 'reference', 'python'),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/python/python', 'reference', 'python'),
    },
  },
  {
    id: 'rest',
    kind: 'reference',
    sources: {
      canonical: rest('packages/docs-tooling/src/reference/rest/meta/openapi'),
      chineseTranslation: local('content/zh-CN/reference/api/restful'),
    },
    sourceOrder: ['canonical', 'chineseTranslation'],
    publications: {
      en: publication('en', 'canonical', 'reference/api/restful', 'reference', 'restful'),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/restful', 'reference', 'restful'),
    },
  },
];

export const manualRegistry = deepFreeze(validateManualRegistry(definitions));

export function resolveManualPublication(manualId: string, site: SiteId): {
  manual: DeepReadonly<ManualDefinition>;
  source: DeepReadonly<ManualSource>;
  sourceChain: readonly SourceEntry[];
  publication: DeepReadonly<ManualPublication>;
} {
  const manual = manualRegistry.find(candidate => candidate.id === manualId);
  if (!manual) throw new Error(`Unknown manual: ${manualId}`);
  const publication = manual.publications[site];
  if (!publication) throw new Error(`Manual ${manualId} is not published for site ${site}`);
  if (!publication.enabled) throw new Error(`Manual ${manualId} is explicitly disabled for site ${site}`);
  return {manual, source: manual.sources[publication.source], sourceChain: sourceChainFor(manual, publication.source), publication};
}
