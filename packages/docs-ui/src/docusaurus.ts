import fs from 'node:fs';
import path from 'node:path';
import type {Plugin} from '@docusaurus/types';
import {chineseUiModules, englishUiModules, sharedUiModules, type DocsUiModule} from './index';

type Options = {modules: DocsUiModule[]};

const supportedModules = new Set<DocsUiModule>([...sharedUiModules, ...englishUiModules, ...chineseUiModules]);

function findRepositoryRoot(startDirectory: string): string {
  let current = path.resolve(startDirectory);
  while (true) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`Unable to locate pnpm-workspace.yaml from ${startDirectory}`);
    current = parent;
  }
}

function exactModuleAliases(prefix: string, root: string): Record<string, string> {
  const aliases: Record<string, string> = {};
  const visit = (current: string): void => {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const target = path.join(current, entry.name);
      const relative = path.relative(root, target).split(path.sep).join('/');
      if (entry.isDirectory()) {
        aliases[`${prefix}/${relative}$`] = target;
        visit(target);
      } else if (entry.isFile() && /\.(?:[cm]?[jt]sx?|css)$/.test(entry.name)) {
        aliases[`${prefix}/${relative.replace(/\.[^.]+$/, '')}$`] = target;
      }
    }
  };
  visit(root);
  return aliases;
}

export default function docsUiPlugin(_context: unknown, options: Options): Plugin {
  const modules = options?.modules ?? [];
  const invalid = modules.filter(module => !supportedModules.has(module));
  if (invalid.length > 0) throw new Error(`Unsupported docs UI modules: ${invalid.join(', ')}`);
  for (const required of sharedUiModules) {
    if (!modules.includes(required)) throw new Error(`Docs UI module selection requires ${required}`);
  }
  const selectedEnglishModules = englishUiModules.filter(module => modules.includes(module));
  if (selectedEnglishModules.length > 0 && selectedEnglishModules.length !== englishUiModules.length) {
    const missing = englishUiModules.filter(module => !modules.includes(module));
    throw new Error(`Docs UI English module selection requires ${missing.join(', ')}`);
  }
  const selectedChineseModules = chineseUiModules.filter(module => modules.includes(module));
  if (selectedEnglishModules.length > 0 && selectedChineseModules.length > 0) {
    throw new Error('Docs UI English and Chinese modules are mutually exclusive');
  }

  const repositoryRoot = findRepositoryRoot(__dirname);
  const sharedRoot = path.join(__dirname, 'shared');
  const englishNavigationSelected = selectedEnglishModules.length === englishUiModules.length;
  const aliases = {
    ...exactModuleAliases('@site/src/components', path.join(sharedRoot, 'components')),
    ...exactModuleAliases('@site/src/theme', path.join(sharedRoot, 'theme')),
    ...exactModuleAliases('@site/src/utils', path.join(sharedRoot, 'utils')),
    ...(englishNavigationSelected
      ? {
          '@theme/Navbar/Content$': path.join(__dirname, 'en/theme/Navbar/Content/index.tsx'),
          '@theme/Navbar/MobileSidebar/SecondaryMenu$': path.join(
            __dirname,
            'en/theme/Navbar/MobileSidebar/SecondaryMenu/index.tsx',
          ),
          '@theme/DocSidebar$': path.join(__dirname, 'en/theme/DocSidebar/index.tsx'),
          '@site/config/generated/guides.sidebar$': path.join(repositoryRoot, 'generated/en/sidebars/guides.sidebar.js'),
        }
      : {}),
  };
  return {
    name: 'zilliz-docs-ui',
    getThemePath: () => path.join(sharedRoot, 'theme'),
    configureWebpack: () => ({
      resolve: {
        alias: aliases,
      },
    }),
  };
}
