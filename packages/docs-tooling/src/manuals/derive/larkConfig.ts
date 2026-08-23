import {manualRegistry, type DeepReadonly} from '../registry.ts';
import type {ManualDefinition} from '../schema.ts';
import {
  activeGeneratorSources,
  configManualName,
  fallbackSourceDir,
  sourceDirWithPrefix,
  type DerivableSource,
} from './shared.ts';

/**
 * Generates the committed config/lark-docs.config.ts source text from the
 * manual registry.
 *
 * The generated surface is the compatibility view consumed by legacy runtime
 * loaders (manualConfig.js, update-lark-doc-snapshot.js, standalone-cli.js,
 * guides-render-readiness.js). New code should consume the registry directly.
 */

const INDENT = '    ';

function quote(value: string): string {
  return JSON.stringify(value).replace(/"/gu, "'");
}

function sitePath(path: string): string {
  return path
    .replace('content/en/', 'content/${site}/')
    .replace('generated/en/', 'generated/${site}/')
    .replace('sidebar-overrides/en/', 'sidebar-overrides/${site}/');
}

function hasSidebarPaths(source: DerivableSource): boolean {
  const version = source.version ?? '';
  if (source.manualId === 'cli') return true;
  return /^v?2\.[6-9]|^v?3\.|^v?1\.[4-9]/u.test(version);
}

function targetsForSource(source: DerivableSource, manual: DeepReadonly<ManualDefinition>): string {
  const publication = manual.publications.en;
  if (!publication) throw new Error(`Manual ${manual.id} has no English publication`);
  const zillizOutputDir = sitePath(publication.outputDir);
  const lines: string[] = [
    '    targets: {',
    '        zilliz: {',
    `            outputDir: \`${zillizOutputDir}\`,`,
    "            imageDir: 'static/img',",
    '        },',
    '    },',
  ];
  return lines.join('\n');
}

function sdkManualBlock(source: DerivableSource, manual: DeepReadonly<ManualDefinition>): string {
  const publication = manual.publications.en;
  if (!publication) throw new Error(`Manual ${manual.id} has no English publication`);
  const name = configManualName(source);
  const fields: Array<[string, string]> = [
    ['root', quote(source.root ?? '')],
    ['base', quote(source.base ?? '')],
    ['sourceType', quote(source.sourceType)],
  ];
  if (source.version !== undefined) fields.push(['version', quote(source.version)]);
  fields.push(['displayedSidebar', quote(`${source.manualId}Sidebar`)]);
  fields.push(['docSourceDir', quote(sourceDirWithPrefix(source))]);
  const fallback = fallbackSourceDir(source, activeGeneratorSources(manual));
  if (fallback !== undefined) fields.push(['fallbackSourceDir', quote(fallback)]);
  if (hasSidebarPaths(source)) {
    fields.push(['sidebarPath', '`' + sitePath(publication.sidebarPath) + '`']);
    fields.push(['overridePath', '`' + sitePath(publication.overridePath ?? publication.sidebarPath) + '`']);
    fields.push(['contentRoot', '`' + sitePath(publication.contentRoot) + '`']);
  }

  const body = fields.map(([key, value]) => `${INDENT}${key}: ${value},`).join('\n');
  const header = `const ${name}: Manual = {`;
  return `${header}\n${body}\n${targetsForSource(source, manual)}\n}`;
}

const GUIDES_BLOCK = [
  'const guides: Manual = {',
  "    root: site === 'zh-CN' ? 'XyeFwdx6kiK9A6kq3yIcLNdEnDd' : 'Tg6mwbRGDitPQ3kLUQzc44I7nth',",
  "    base: site === 'zh-CN' ? 'I6YUb1M0JajHrqsJGcLcZNh7neP:*' : 'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*',",
  "    sourceType: 'wiki',",
  "    displayedSidebar: 'default',",
  "    docSourceDir: site === 'zh-CN' ? './packages/docs-tooling/src/lark/meta/sources/guides-zh-CN' : './packages/docs-tooling/src/lark/meta/sources/guides',",
  '    sidebarPath: `./${guidesStage}/generated/${site}/sidebars/guides.sidebar.js`,',
  '    overridePath: `./sidebar-overrides/${site}/guides.json`,',
  '    contentRoot: `${guidesStage}/content/${site}/guides`,',
  '    targets: {',
  '        zilliz: {',
  '            saas: {',
  '                outputDir: `${guidesStage}/content/${site}/guides/tutorials`,',
  '                contentRoot: `${guidesStage}/content/${site}/guides`,',
  "                imageDir: 'static/img',",
  '            },',
  '            paas: {',
  '                outputDir: `${guidesByocStage}/content/${site}/byoc/tutorials`,',
  '                contentRoot: `${guidesByocStage}/content/${site}/byoc`,',
  "                imageDir: 'static/img',",
  '                sidebarPath: `./${guidesByocStage}/generated/${site}/sidebars/guides-byoc.sidebar.js`,',
  '                overridePath: `./sidebar-overrides/${site}/guides-byoc.json`,',
  '            },',
  '        },',
  '    },',
  '}',
].join('\n');

const HEADER = [
  "import {resolveBootstrapSite} from '../packages/site-config/src/resolve';",
  '',
  'interface TargetConfig {',
  '    outputDir: string;',
  '    contentRoot?: string;',
  '    imageDir: string;',
  '    sidebarPath?: string;',
  '    overridePath?: string;',
  '    preserveOutput?: boolean;',
  '}',
  '',
  'interface Targets { [key: string]: TargetConfig | { [key: string]: TargetConfig } }',
  '',
  'interface Manual {',
  '    root: string;',
  '    base: string;',
  "    sourceType: 'wiki' | 'drive' | 'onePager';",
  '    version?: string;',
  '    displayedSidebar: string;',
  '    docSourceDir: string;',
  '    fallbackSourceDir?: string;',
  '    targets: Targets;',
  '    sidebarPath?: string;',
  '    overridePath?: string;',
  '    contentRoot?: string;',
  '}',
  '',
  'const site = resolveBootstrapSite(undefined);',
  '',
].join('\n');

const MANUAL_ORDER = Object.freeze(
  manualRegistry
    .filter(manual => manual.kind === 'reference' && manual.presentation)
    .sort((left, right) => left.presentation!.groupOrder - right.presentation!.groupOrder)
    .filter(manual => activeGeneratorSources(manual).some(source => Boolean(source.generatorManual)))
    .map(manual => manual.id),
) as readonly string[];

// Section header separator for each SDK manual, derived from the manual id so
// new reference manuals need no per-manual override. Aligns the committed
// "// sdk: <id> ===" header to a fixed width, close to the historical
// hand-tuned lengths (python 29, java 32, node 31, go 33).
const SECTION_EQUALS_WIDTH = 44;
const SECTION_EQUALS: Readonly<Record<string, number>> = Object.freeze(
  Object.fromEntries(
    MANUAL_ORDER.map(id => [id, Math.max(1, SECTION_EQUALS_WIDTH - 8 - id.length - 1)]),
  ),
);

export function generateLarkDocsConfig(registry: readonly DeepReadonly<ManualDefinition>[]): string {
  const parts: string[] = [HEADER];
  const exportNames: string[] = [];
  parts.push('// guides ========================', '');
  parts.push('const guidesStage = `tmp/docs-tooling/${site}/guides`;');
  parts.push('const guidesByocStage = `tmp/docs-tooling/${site}/guides-byoc`;', '');
  parts.push(GUIDES_BLOCK, '');
  exportNames.push('guides');

  for (const manualId of MANUAL_ORDER) {
    const manual = registry.find(candidate => candidate.id === manualId);
    if (!manual || manual.kind !== 'reference') continue;
    const sources = activeGeneratorSources(manual);
    if (sources.length === 0) continue;
    const equals = '='.repeat(SECTION_EQUALS[manualId] ?? 29);
    parts.push(`// sdk: ${manualId} ${equals}`, '');
    for (const source of sources) {
      if (!source.generatorManual) continue;
      parts.push(sdkManualBlock(source, manual), '');
      exportNames.push(configManualName(source));
    }
  }

  parts.push(`export default {\n${exportNames.map(name => `    ${name},`).join('\n')}\n}`);
  return parts.join('\n') + '\n';
}
