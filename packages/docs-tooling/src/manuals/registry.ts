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

    for (const [sourceKey, source] of Object.entries(manual.sources)) {
      if (source.fallbackSource !== undefined && !Object.hasOwn(manual.sources, source.fallbackSource)) {
        throw new Error(`Manual ${manual.id} source ${sourceKey} references unknown fallback source ${source.fallbackSource}`);
      }
    }

    for (const site of ['en', 'zh-CN'] as const) {
      const publication = manual.publications[site];
      if (!publication) continue;
      const source = manual.sources[publication.source];
      if (!source) throw new Error(`Manual ${manual.id} ${site} publication references unknown source key ${publication.source}`);
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

  return registry;
}

const larkSourceRoot = 'packages/docs-tooling/src/lark/meta/sources';

function remote(
  sourceType: Exclude<ManualSource['sourceType'], 'local' | 'rest'>,
  root: string,
  base: string,
  sourceDir: string,
  version?: string,
): ManualSource {
  return {sourceType, root, base, ...(version ? {version} : {}), sourceDir: `${larkSourceRoot}/${sourceDir}`};
}

function local(sourceDir: string): ManualSource {
  return {sourceType: 'local', sourceDir};
}

function rest(sourceDir: string): ManualSource {
  return {sourceType: 'rest', sourceDir};
}

function publication(
  site: SiteId,
  source: string,
  outputDir: string,
  contentRoot: string,
  sidebar: string,
  retiredPaths?: string[],
): ManualPublication {
  return {
    enabled: true,
    source,
    outputDir: `content/${site}/${outputDir}`,
    contentRoot: `content/${site}/${contentRoot}`,
    sidebarPath: `generated/${site}/sidebars/${sidebar}.sidebar.js`,
    overridePath: `sidebar-overrides/${site}/${sidebar}.json`,
    missingContent: 'error',
    ...(retiredPaths ? {retiredPaths} : {}),
  };
}

const definitions: ManualDefinition[] = [
  {
    id: 'agents',
    kind: 'agents',
    sources: {
      chinese: remote('wiki', 'R8ZwwvHrJivIAyk8JkQchM0Anng', 'YxSibAMZ4aDqhjs5Ru4clmrun4f', 'agents-and-prompts'),
    },
    publications: {
      'zh-CN': publication('zh-CN', 'chinese', 'agents', 'agents', 'agents'),
    },
  },
  {
    id: 'cli',
    kind: 'reference',
    sources: {
      'chinese-v0.1': remote('drive', 'PPuBfnEIWltim9dw8hxcC3EDnwb', 'OAK4bJaNuac501sX6Y1cS3OGnzf', 'cli/v0.1.x', '0.1.x'),
      'english-v1.3': remote('drive', 'QBLKf6CCPloK0cddw6gcXUZqnob', 'Rr4lbWr8baQj5psICV9cEFa2nYe', 'cli/v1.3.x', 'v1.3.x'),
      'chinese-v1.3': remote('drive', 'QBLKf6CCPloK0cddw6gcXUZqnob', 'Rr4lbWr8baQj5psICV9cEFa2nYe', 'cli/v1.3.x', '1.3.x'),
      'english-v1.4': remote('drive', 'LF1Kf54jFllUBydVk7hcha30nUh', 'Lx1bbCdpMaSmJXs8wz5cjsDengf', 'cli/v1.4.x', '1.4.x'),
      'chinese-v1.4': remote('drive', 'LF1Kf54jFllUBydVk7hcha30nUh', 'Lx1bbCdpMaSmJXs8wz5cjsDengf', 'cli/v1.4.x', '1.4.x'),
      chineseTranslation: local('content/zh-CN/reference/cli/cli'),
    },
    publications: {
      en: publication('en', 'english-v1.4', 'reference/cli/cli', 'reference', 'cli', ['reference/cli/v0.1', 'reference/cli/v1.3']),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/cli/cli', 'reference', 'cli', ['reference/cli/v0.1', 'reference/cli/v1.3']),
    },
  },
  {
    id: 'go',
    kind: 'reference',
    sources: {
      'english-v2.4': remote('wiki', 'V0SCw3U3siZBynkKhUCcRRAin69', 'WA8rbgtu8aq3wtsBm02cepOznPJ', 'go/v2.4.x', 'v2.4.x'),
      'chinese-v2.4': remote('wiki', 'V0SCw3U3siZBynkKhUCcRRAin69', 'WA8rbgtu8aq3wtsBm02cepOznPJ', 'go/v2.4.x', 'v2.4.x'),
      'english-v2.6': remote('drive', 'Pzejf3x4WlXq1HdtTndcfMjVnxh', 'Yc7gbtmgSal2ewsdqlhcLWVanbh', 'go/v2.6.x', 'v2.6.x'),
      'chinese-v2.6': remote('drive', 'Pzejf3x4WlXq1HdtTndcfMjVnxh', 'Yc7gbtmgSal2ewsdqlhcLWVanbh', 'go/v2/v2.6.x', 'v2.6.x'),
      'english-v3.0': remote('drive', 'F9M3fK4Dbl69PPdSxTXcsIwgnDh', 'KQT5bV62QaioKisKZT0crwZDnke', 'go/v3.0.x', 'v3.0.x'),
      'chinese-v3.0': remote('drive', 'F9M3fK4Dbl69PPdSxTXcsIwgnDh', 'KQT5bV62QaioKisKZT0crwZDnke', 'go/v2/v3.0.x', 'v3.0.x'),
      chineseTranslation: local('content/zh-CN/reference/api/go/go/v2'),
    },
    publications: {
      en: publication('en', 'english-v3.0', 'reference/api/go/go/v2', 'reference', 'go', ['reference/api/go/go/v1']),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/go/go/v2', 'reference', 'go', ['reference/api/go/go/v1']),
    },
  },
  {
    id: 'guides',
    kind: 'guides',
    sources: {
      english: remote('wiki', 'Tg6mwbRGDitPQ3kLUQzc44I7nth', 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*', 'guides'),
      chinese: remote('wiki', 'XyeFwdx6kiK9A6kq3yIcLNdEnDd', 'I6YUb1M0JajHrqsJGcLcZNh7neP:*', 'guides-zh-CN'),
    },
    publications: {
      en: publication('en', 'english', 'guides/tutorials', 'guides', 'guides'),
      'zh-CN': publication('zh-CN', 'chinese', 'guides/tutorials', 'guides', 'guides'),
    },
  },
  {
    id: 'guides-byoc',
    kind: 'guides',
    sources: {
      english: remote('wiki', 'Tg6mwbRGDitPQ3kLUQzc44I7nth', 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*', 'guides'),
      chinese: remote('wiki', 'XyeFwdx6kiK9A6kq3yIcLNdEnDd', 'I6YUb1M0JajHrqsJGcLcZNh7neP:*', 'guides-zh-CN'),
    },
    publications: {
      en: publication('en', 'english', 'byoc/tutorials', 'byoc', 'guides-byoc'),
      'zh-CN': publication('zh-CN', 'chinese', 'byoc/tutorials', 'byoc', 'guides-byoc'),
    },
  },
  {
    id: 'java',
    kind: 'reference',
    sources: {
      'english-v1-2.4': remote('onePager', 'D0cfwvTqMiyhSrkCUv4c1a2Fnjd', 'A4ivb7y2XaIND9s93QZcvwykn0d', 'java/v2.4.x/v1', 'v2.4.x'),
      'chinese-v1-2.4': remote('onePager', 'D0cfwvTqMiyhSrkCUv4c1a2Fnjd', 'A4ivb7y2XaIND9s93QZcvwykn0d', 'java/v2.4.x/v1', 'v2.4.x'),
      'english-v2-2.4': remote('drive', 'Sg3EfIgVtlTkeBdtguJchE9ynne', 'WqHJb3zimaxXjssk4Kic4GEDnte', 'java/v2.4.x/v2', 'v2.4.x'),
      'chinese-v2-2.4': remote('drive', 'Sg3EfIgVtlTkeBdtguJchE9ynne', 'WqHJb3zimaxXjssk4Kic4GEDnte', 'java/v2.4.x/v2', 'v2.4.x'),
      'english-v2.5': remote('drive', 'LJ6MfN5wzlHjz8dB642cjUh8nqq', 'Hsq1bRcqraeQW0sGFJbcI3YIn3d', 'java/v2.5.x/v2', 'v2.5.x'),
      'chinese-v2.5': remote('drive', 'LJ6MfN5wzlHjz8dB642cjUh8nqq', 'Hsq1bRcqraeQW0sGFJbcI3YIn3d', 'java/v2.5.x/v2'),
      'english-v2.6': remote('drive', 'B1agfRbPglv4tpdTkjlcUMgVnRV', 'Sbtcbm660abngWsXryKct5nOn2e', 'java/v2.6.x/v2', 'v2.6.x'),
      'chinese-v2.6': remote('drive', 'B1agfRbPglv4tpdTkjlcUMgVnRV', 'Sbtcbm660abngWsXryKct5nOn2e', 'java/v2.6.x/v2', 'v2.6.x'),
      'english-v3.0': remote('drive', 'C4Ckfsx5qlKHbnd5PVrcpxvTn2d', 'AOFDbSmwma9XrNsLa8KcQgt9ngc', 'java/v3.0.x/v2', 'v3.0.x'),
      'chinese-v3.0': remote('drive', 'C4Ckfsx5qlKHbnd5PVrcpxvTn2d', 'AOFDbSmwma9XrNsLa8KcQgt9ngc', 'java/v3.0.x/v2', 'v3.0.x'),
      chineseTranslation: local('content/zh-CN/reference/api/java/java/v2'),
    },
    publications: {
      en: publication('en', 'english-v3.0', 'reference/api/java/java/v2', 'reference', 'java', ['reference/api/java/java/v1']),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/java/java/v2', 'reference', 'java', ['reference/api/java/java/v1']),
    },
  },
  {
    id: 'node',
    kind: 'reference',
    sources: {
      'english-v2.4': remote('drive', 'Vg1kfluyll0h7MdlUMaciXfEnZd', 'DVVobtXQMamuLqsQij5c29nVn3c', 'node/v2.4.x', 'v2.4.x'),
      'chinese-v2.4': remote('drive', 'Vg1kfluyll0h7MdlUMaciXfEnZd', 'DVVobtXQMamuLqsQij5c29nVn3c', 'node/v2.4.x', 'v2.4.x'),
      'english-v2.5': remote('drive', 'U9fWfMPdelsPMydYnolcr2aEnBf', 'JTBebezMDaV8ZhsHF5wc7lJSnuh', 'node/v2.5.x', 'v2.5.x'),
      'chinese-v2.5': remote('drive', 'U9fWfMPdelsPMydYnolcr2aEnBf', 'JTBebezMDaV8ZhsHF5wc7lJSnuh', 'node/v2.5.x'),
      'english-v2.6': remote('drive', 'NFmOfwILlln3JgdePZUclweZnIe', 'R9i8bww4faNsR6smwQwcAtHGnkb', 'node/v2.6.x', 'v2.6.x'),
      'chinese-v2.6': remote('drive', 'NFmOfwILlln3JgdePZUclweZnIe', 'R9i8bww4faNsR6smwQwcAtHGnkb', 'node/v2.6.x', 'v2.6.x'),
      'english-v3.0': remote('drive', 'LW67fVlTvlNCZRdxOVYcQZyJnFQ', 'LlrPbysPZau2dGsSVuicHmvCn0e', 'node/v3.0.x', 'v3.0.x'),
      'chinese-v3.0': remote('drive', 'LW67fVlTvlNCZRdxOVYcQZyJnFQ', 'LlrPbysPZau2dGsSVuicHmvCn0e', 'node/v3.0.x', 'v3.0.x'),
      chineseTranslation: local('content/zh-CN/reference/api/nodejs/nodejs'),
    },
    publications: {
      en: publication('en', 'english-v3.0', 'reference/api/nodejs/nodejs', 'reference', 'node'),
      'zh-CN': publication('zh-CN', 'chineseTranslation', 'reference/api/nodejs/nodejs', 'reference', 'node'),
    },
  },
  {
    id: 'onpremise',
    kind: 'onpremise',
    sources: {
      chinese: remote('wiki', 'PXwawNqh0i40H4krMYlc6qgZnKe', 'V7t6bcQWiaDL99sgUkwcEIJ0nUb', 'onpremise'),
    },
    publications: {
      'zh-CN': publication('zh-CN', 'chinese', 'onpremise', 'onpremise', 'onpremise'),
    },
  },
  {
    id: 'python',
    kind: 'reference',
    sources: {
      'english-v2.4': remote('drive', 'PTJzfzI0ulKGjwdUsxQcFxfJn6b', 'D1VabelmAansLwsNTvLc2Wxxn1g', 'python/v2.4.x', 'v2.4.x'),
      'chinese-v2.4': remote('drive', 'PTJzfzI0ulKGjwdUsxQcFxfJn6b', 'D1VabelmAansLwsNTvLc2Wxxn1g', 'python/v2.4.x', 'v2.4.x'),
      'english-v2.5': remote('drive', 'Z1SFf89zYlGHXvdo6dxcR6gXntc', 'B8X9bJjJta2q4NskclYcxT7lngG', 'python/v2.5.x', 'v2.5.x'),
      'chinese-v2.5': remote('drive', 'Z1SFf89zYlGHXvdo6dxcR6gXntc', 'B8X9bJjJta2q4NskclYcxT7lngG', 'python/v2.5.x'),
      'english-v2.6': remote('drive', 'IaWgf4osAlpdwqdVIclct97wnCg', 'J3Qzbv7AWazzivsv7vqcqlGCnFc', 'python/v2.6.x', 'v2.6.x'),
      'chinese-v2.6': remote('drive', 'IaWgf4osAlpdwqdVIclct97wnCg', 'J3Qzbv7AWazzivsv7vqcqlGCnFc', 'python/v2.6.x'),
      'english-v3.0': remote('drive', 'UxyTfjS3wl0TF8dn9tZcRT39nUe', 'Hk05b5eI6aXXSSsd6j9cqwwMn5a', 'python/v3.0.x', 'v3.0.x'),
      'chinese-v3.0': remote('drive', 'UxyTfjS3wl0TF8dn9tZcRT39nUe', 'Hk05b5eI6aXXSSsd6j9cqwwMn5a', 'python/v3.0.x', 'v3.0.x'),
      chineseTranslation: local('content/zh-CN/reference/api/python/python'),
    },
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
  publication: DeepReadonly<ManualPublication>;
} {
  const manual = manualRegistry.find(candidate => candidate.id === manualId);
  if (!manual) throw new Error(`Unknown manual: ${manualId}`);
  const publication = manual.publications[site];
  if (!publication) throw new Error(`Manual ${manualId} is not published for site ${site}`);
  if (!publication.enabled) throw new Error(`Manual ${manualId} is explicitly disabled for site ${site}`);
  return {manual, source: manual.sources[publication.source], publication};
}
