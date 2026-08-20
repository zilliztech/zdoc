import {manualRegistry} from '../registry.ts';
import type {ReferencePresentation, SiteId} from '../schema.ts';

type PresentationManual = Readonly<{
  id: string;
  presentation: Readonly<ReferencePresentation>;
}>;

const referenceManuals: PresentationManual[] = manualRegistry
  .filter((manual): manual is typeof manual & {presentation: NonNullable<typeof manual.presentation>} =>
    manual.kind === 'reference' && manual.presentation !== undefined,
  )
  .map(manual => ({id: manual.id, presentation: manual.presentation as Readonly<ReferencePresentation>}));

function orderedBy(site: SiteId, manuals: readonly PresentationManual[] = referenceManuals): PresentationManual[] {
  return [...manuals].sort((left, right) => left.presentation.navOrder[site] - right.presentation.navOrder[site]);
}

function quote(value: string): string {
  return JSON.stringify(value);
}

export type ReferenceNavTarget = Readonly<{
  manual: string;
  sidebarKey: string;
  sidebar: string;
  documentIdPrefix: string;
  landingPage: string;
  minimumProseCharacters: number;
  minimumHeadingCount: number;
  requireSourceDifference: boolean;
}>;

export function referenceNavTargets(): readonly ReferenceNavTarget[] {
  return orderedBy('en').map(({id, presentation}) => ({
    manual: id,
    sidebarKey: presentation.sidebarKey,
    sidebar: presentation.sidebar,
    documentIdPrefix: presentation.documentIdPrefix,
    landingPage: presentation.landingPage,
    minimumProseCharacters: presentation.minimumProseCharacters,
    minimumHeadingCount: presentation.minimumHeadingCount,
    requireSourceDifference: presentation.requireSourceDifference,
  }));
}

export type ReferenceNavItem = Readonly<{label: string; href: string; prefix: string; icon: string}>;

export function referenceNavigationFragment(): Readonly<{
  en: {dropdown: readonly ReferenceNavItem[]; standalone: ReferenceNavItem | null};
  'zh-CN': {dropdown: readonly ReferenceNavItem[]; standalone: ReferenceNavItem | null};
}> {
  const build = (site: SiteId) => {
    const ordered = orderedBy(site);
    const dropdown = ordered
      .filter(({presentation}) => !presentation.standalone)
      .map(({presentation}) => ({
        label: presentation.label[site],
        href: presentation.href,
        prefix: presentation.prefix,
        icon: presentation.icon,
      }));
    const standalone = ordered.find(({presentation}) => presentation.standalone);
    const standaloneItem = standalone ? {
      label: standalone.presentation.label[site],
      href: standalone.presentation.navHref ?? standalone.presentation.href,
      prefix: standalone.presentation.prefix,
      icon: standalone.presentation.icon,
    } : null;
    return {dropdown, standalone: standaloneItem};
  };
  return {en: build('en'), 'zh-CN': build('zh-CN')};
}

export type DocsUiReferenceTarget = Readonly<{kind: string; landingHref: string; hrefPrefixes: readonly string[]}>;

export function docsUiReferenceTargets(): Readonly<{
  kinds: readonly string[];
  aliases: Readonly<Record<string, string>>;
  navigation: readonly DocsUiReferenceTarget[];
}> {
  const ordered = orderedBy('en');
  const kinds = ordered.map(({presentation}) => presentation.referenceKind);
  const aliases: Record<string, string> = {};
  for (const {presentation} of ordered) {
    const segment = presentation.href.split('/').filter(Boolean)[1] ?? presentation.referenceKind;
    aliases[segment] = presentation.referenceKind;
    if (presentation.referenceKind === 'nodejs') aliases.node = 'nodejs';
    aliases[presentation.referenceKind] = presentation.referenceKind;
  }
  const navigation = ordered.map(({presentation}) => ({
    kind: presentation.referenceKind,
    landingHref: presentation.href,
    hrefPrefixes: presentation.referenceKind === 'nodejs' ? [presentation.href, '/reference/node'] : [presentation.href],
  }));
  return {kinds, aliases, navigation};
}

export function generateReferenceNavigationJson(): string {
  return `${JSON.stringify({schemaVersion: 1, targets: referenceNavTargets()}, null, 2)}\n`;
}

export function generateEnReferenceSidebarModule(): string {
  const lines: string[] = [
    "import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';",
    '',
    '// Generated sidebar files are produced through the docs-tooling manual pipeline.',
    '// Run `pnpm docs-tooling fetch|validate|publish --manual <name> --group <group> --site en --stage <dir>`.',
    '// To customise without regenerating, edit the corresponding file in sidebar-overrides/en/.',
    '// eslint-disable-next-line @typescript-eslint/no-explicit-any',
    'function tryRequire(path: string): any[] {',
    '  try { return require(path) } catch { return [] }',
    '}',
    '// eslint-disable-next-line @typescript-eslint/no-var-requires',
    "const applyOverrides = require('../../../../../config/applyOverrides')",
    '',
    'const sidebars: SidebarsConfig = {',
  ];
  let sdkHeaderEmitted = false;
  for (const {presentation} of orderedBy('en')) {
    if (presentation.referenceKind === 'restful') {
      lines.push('  // REST API reference sidebar — generated from Apifox specifications');
    } else if (!sdkHeaderEmitted) {
      lines.push('  // SDK reference sidebars — generated from Feishu drive/wiki sources');
      sdkHeaderEmitted = true;
    }
    lines.push(`  ${presentation.sidebarKey}: applyOverrides(tryRequire('../../../../../generated/en/sidebars/${presentation.sidebar}.sidebar'), require.resolve('../../../../../sidebar-overrides/en/${presentation.sidebar}.json')),`);
  }
  lines.push('};', '', 'export default sidebars;', '');
  return lines.join('\n');
}

export function generateZhCnReferenceSidebarModule(): string {
  const lines: string[] = [
    "import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';",
    "import {loadPublishedSidebar} from './referenceLoader';",
    '',
    'const sidebars = {',
  ];
  for (const {presentation} of orderedBy('en')) {
    lines.push(`  ${presentation.sidebarKey}: loadPublishedSidebar(${quote(presentation.sidebar)}, () => require('../../../../../generated/zh-CN/sidebars/${presentation.sidebar}.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/${presentation.sidebar}.json')),`);
  }
  lines.push("} satisfies SidebarsConfig;", '', 'export default sidebars;', '');
  return lines.join('\n');
}

export function generateSiteConfigReferenceFragment(): string {
  const fragment = referenceNavigationFragment();
  const kinds = orderedBy('en').map(({presentation}) => presentation.referenceKind);
  const lines: string[] = [
    '// Generated by scripts/generate-reference-presentation.js — do not edit.',
    `export const referenceKinds = [${kinds.map(quote).join(', ')}] as const;`,
    '',
    'export const referenceNavigation = {',
  ];
  for (const site of ['en', 'zh-CN'] as const) {
    const block = fragment[site];
    lines.push(`  ${quote(site)}: {`);
    lines.push('    dropdown: [');
    for (const item of block.dropdown) {
      lines.push(`      {label: ${quote(item.label)}, href: ${quote(item.href)}, prefix: ${quote(item.prefix)}, icon: ${quote(item.icon)}},`);
    }
    lines.push('    ],');
    if (block.standalone) {
      lines.push(`    standalone: {label: ${quote(block.standalone.label)}, href: ${quote(block.standalone.href)}, prefix: ${quote(block.standalone.prefix)}, icon: ${quote(block.standalone.icon)}},`);
    } else {
      lines.push('    standalone: null,');
    }
    lines.push('  },');
  }
  lines.push('} as const;', '');
  return lines.join('\n');
}

export function generateDocsUiReferenceTargetsModule(): string {
  const targets = docsUiReferenceTargets();
  const lines: string[] = [
    '// Generated by scripts/generate-reference-presentation.js — do not edit.',
    'export const referenceTargetKinds = [' + targets.kinds.map(quote).join(', ') + '] as const;',
    'export type ReferenceTargetKind = (typeof referenceTargetKinds)[number];',
    '',
    'export const referenceTargetAliases: Readonly<Record<string, ReferenceTargetKind>> = {',
    ...Object.entries(targets.aliases).map(([key, value]) => `  ${quote(key)}: ${quote(value)},`),
    '};',
    '',
    'export const referenceTargetNavigation: ReadonlyArray<Readonly<{kind: ReferenceTargetKind; landingHref: string; hrefPrefixes: readonly string[]}>> = [',
    ...targets.navigation.map(target => `  {kind: ${quote(target.kind)}, landingHref: ${quote(target.landingHref)}, hrefPrefixes: [${target.hrefPrefixes.map(quote).join(', ')}]},`),
    '];',
    '',
  ];
  return lines.join('\n');
}
