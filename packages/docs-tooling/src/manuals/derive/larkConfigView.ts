import {z} from 'zod';

import {
  manualRegistry,
  type DeepReadonly,
  type PublicationEntry,
} from '../registry.ts';
import type {ManualDefinition, ManualSource, SiteId} from '../schema.ts';
import {
  activeGeneratorSources,
  configManualName,
  fallbackSourceDir,
  sourceDirWithPrefix,
  type DerivableSource,
} from './shared.ts';

/**
 * Runtime compatibility view that mirrors the shape of the committed
 * config/lark-docs.config.ts manual objects.
 *
 * The committed config file is a generated artifact (see larkConfig.ts).
 * Runtime consumers that previously parsed the config file should consume this
 * view instead, so the registry remains the single source of truth.
 */

export type TargetConfig = Readonly<{
  outputDir: string;
  contentRoot?: string;
  imageDir: string;
  sidebarPath?: string;
  overridePath?: string;
  preserveOutput?: boolean;
}>;

export type Targets = Readonly<{[key: string]: TargetConfig | {[key: string]: TargetConfig}}>;

export type ManualView = Readonly<{
  root: string;
  base: string;
  sourceType: 'wiki' | 'drive' | 'onePager';
  version?: string;
  displayedSidebar: string;
  docSourceDir: string;
  fallbackSourceDir?: string;
  targets: Targets;
  sidebarPath?: string;
  overridePath?: string;
  contentRoot?: string;
}>;

export type LarkDocsConfigView = Readonly<Record<string, ManualView>>;

const LARK_SOURCE_PREFIX = './';

function sdkSidebarPaths(manual: DeepReadonly<ManualDefinition>, site: SiteId): {
  sidebarPath?: string;
  overridePath?: string;
  contentRoot?: string;
} {
  const publication = manual.publications[site];
  if (!publication) return {};
  return {
    sidebarPath: publication.sidebarPath,
    overridePath: publication.overridePath ?? publication.sidebarPath,
    contentRoot: publication.contentRoot,
  };
}

function hasSdkSidebarPaths(source: DerivableSource): boolean {
  if (source.manualId === 'cli') return true;
  const version = source.version ?? '';
  return /^v?2\.[6-9]|^v?3\.|^v?1\.[4-9]/u.test(version);
}

function targetForPublication(publication: DeepReadonly<ManualDefinition['publications'][SiteId]>): TargetConfig {
  return {
    outputDir: publication.outputDir,
    imageDir: 'static/img',
  };
}

function guidesView(site: SiteId): ManualView {
  const isZh = site === 'zh-CN';
  const guidesStage = `tmp/docs-tooling/${site}/guides`;
  const guidesByocStage = `tmp/docs-tooling/${site}/guides-byoc`;
  return {
    root: isZh ? 'XyeFwdx6kiK9A6kq3yIcLNdEnDd' : 'Tg6mwbRGDitPQ3kLUQzc44I7nth',
    base: isZh ? 'I6YUb1M0JajHrqsJGcLcZNh7neP:*' : 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*',
    sourceType: 'wiki',
    displayedSidebar: 'default',
    docSourceDir: `${LARK_SOURCE_PREFIX}packages/docs-tooling/src/lark/meta/sources/${isZh ? 'guides-zh-CN' : 'guides'}`,
    sidebarPath: `./${guidesStage}/generated/${site}/sidebars/guides.sidebar.js`,
    overridePath: `./sidebar-overrides/${site}/guides.json`,
    contentRoot: `${guidesStage}/content/${site}/guides`,
    targets: {
      zilliz: {
        saas: {
          outputDir: `${guidesStage}/content/${site}/guides/tutorials`,
          contentRoot: `${guidesStage}/content/${site}/guides`,
          imageDir: 'static/img',
        },
        paas: {
          outputDir: `${guidesByocStage}/content/${site}/byoc/tutorials`,
          contentRoot: `${guidesByocStage}/content/${site}/byoc`,
          imageDir: 'static/img',
          sidebarPath: `./${guidesByocStage}/generated/${site}/sidebars/guides-byoc.sidebar.js`,
          overridePath: `./sidebar-overrides/${site}/guides-byoc.json`,
        },
      },
    },
  };
}

function sdkManualView(
  source: DerivableSource,
  manual: DeepReadonly<ManualDefinition>,
  site: SiteId,
): ManualView {
  const publication = manual.publications[site];
  if (!publication) throw new Error(`Manual ${manual.id} has no ${site} publication`);
  const view: {[key: string]: unknown} = {
    root: source.root ?? '',
    base: source.base ?? '',
    sourceType: source.sourceType as 'wiki' | 'drive' | 'onePager',
    displayedSidebar: `${source.manualId}Sidebar`,
    docSourceDir: sourceDirWithPrefix(source),
    targets: {zilliz: targetForPublication(publication)},
  };
  if (source.version !== undefined) view.version = source.version;
  const fallback = fallbackSourceDir(source, activeGeneratorSources(manual));
  if (fallback !== undefined) view.fallbackSourceDir = fallback;
  if (hasSdkSidebarPaths(source)) {
    const paths = sdkSidebarPaths(manual, site);
    if (paths.sidebarPath) view.sidebarPath = paths.sidebarPath;
    if (paths.overridePath) view.overridePath = paths.overridePath;
    if (paths.contentRoot) view.contentRoot = paths.contentRoot;
  }
  return Object.freeze(view) as ManualView;
}

/**
 * Build the Lark Docs config view for a site. Iterates the registry in the
 * same order as the committed config export list (guides first, then SDK
 * reference manuals in sourceOrder), so `Object.keys` matches the committed
 * `export default` keys.
 */
export function larkDocsConfigView(registry: readonly DeepReadonly<ManualDefinition>[], site: SiteId): LarkDocsConfigView {
  const view: Record<string, ManualView> = {};
  view.guides = guidesView(site);
  for (const manual of registry) {
    if (manual.kind !== 'reference') continue;
    for (const source of activeGeneratorSources(manual)) {
      if (!source.generatorManual) continue;
      view[configManualName(source)] = sdkManualView(source, manual, site);
    }
  }
  return Object.freeze(view);
}

export function larkDocsConfigForSite(site: SiteId): LarkDocsConfigView {
  return larkDocsConfigView(manualRegistry, site);
}
