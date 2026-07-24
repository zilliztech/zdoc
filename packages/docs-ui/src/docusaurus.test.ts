import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import docsUiPlugin from './docusaurus';
import {hasInkeepCredentials} from './en/inkeepRuntime';

const runtimeSingletons = [
  '@docusaurus/core',
  '@docusaurus/plugin-content-docs',
  '@docusaurus/theme-common',
  'react',
  'react-dom',
] as const;

const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'] as const;

function resolveRelativeImport(importer: string, specifier: string): string | undefined {
  const candidate = path.resolve(path.dirname(importer), specifier);
  const candidates = [
    candidate,
    ...sourceExtensions.map(extension => `${candidate}${extension}`),
    ...sourceExtensions.map(extension => path.join(candidate, `index${extension}`)),
  ];
  return candidates.find(target => fs.existsSync(target) && fs.statSync(target).isFile());
}

function relativeImportClosure(roots: string[]): string[] {
  const pending = [...roots];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const file = pending.pop()!;
    if (visited.has(file)) continue;
    visited.add(file);
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:import|export)[^'"\n]*from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const resolved = resolveRelativeImport(file, match[1]);
      if (resolved) pending.push(resolved);
    }
  }
  return [...visited].sort();
}

function sourceFiles(directory: string): string[] {
  const files: string[] = [];
  const collect = (current: string): void => {
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) collect(target);
      else if (entry.isFile() && sourceExtensions.includes(path.extname(entry.name) as typeof sourceExtensions[number])) {
        files.push(target);
      }
    }
  };
  collect(directory);
  return files.sort();
}

describe('docs UI Docusaurus integration', () => {
  it('keeps a shared-only selection independent from English UI and generated English files', () => {
    const plugin = docsUiPlugin({}, {modules: ['shared-theme', 'shared-components']});
    const webpack = plugin.configureWebpack?.({} as never, false, {} as never, {} as never) as {
      resolve?: {alias?: Record<string, string>};
    };
    expect(plugin.getThemePath?.()).toMatch(
      new RegExp(`packages${path.sep}docs-ui${path.sep}src${path.sep}shared${path.sep}theme$`),
    );
    expect(webpack.resolve?.alias?.['@site/src/components/Supademo$']).toMatch(
      new RegExp(`packages${path.sep}docs-ui${path.sep}src${path.sep}shared${path.sep}components${path.sep}Supademo$`),
    );
    expect(webpack.resolve?.alias?.['@site/src/components/ChatPanel/endpoints$']).toMatch(/ChatPanel[/\\]endpoints\.ts$/);
    expect(webpack.resolve?.alias?.['@site/src/theme/Heading/CopyPageButton$']).toMatch(/Heading[/\\]CopyPageButton\.tsx$/);
    expect(webpack.resolve?.alias).not.toHaveProperty('@theme/Navbar/Content$');
    expect(webpack.resolve?.alias).not.toHaveProperty('@theme/Navbar/MobileSidebar/SecondaryMenu$');
    expect(webpack.resolve?.alias).not.toHaveProperty('@theme/DocSidebar$');
    expect(webpack.resolve?.alias).not.toHaveProperty('@site/config/generated/guides.sidebar$');

    const forbiddenRoots = [
      path.join(process.cwd(), 'packages/docs-ui/src/en'),
      path.join(process.cwd(), 'generated/en'),
    ];
    for (const target of Object.values(webpack.resolve?.alias ?? {})) {
      expect(forbiddenRoots.some(root => path.resolve(target).startsWith(`${root}${path.sep}`))).toBe(false);
    }

    const sharedRoot = path.join(process.cwd(), 'packages/docs-ui/src/shared');
    expect(fs.existsSync(path.join(sharedRoot, 'theme/Navbar/MobileSidebar/SecondaryMenu'))).toBe(false);
    const closure = relativeImportClosure(sourceFiles(sharedRoot));
    expect(closure.filter(file => forbiddenRoots.some(root => file.startsWith(`${root}${path.sep}`)))).toEqual([]);
  });

  it('adds exact English navigation aliases only for the complete English module selection', () => {
    const plugin = docsUiPlugin({}, {
      modules: ['shared-theme', 'shared-components', 'english-navigation', 'english-home'],
    });
    const webpack = plugin.configureWebpack?.({} as never, false, {} as never, {} as never) as {
      resolve?: {alias?: Record<string, string>};
    };
    expect(webpack.resolve?.alias?.['@theme/Navbar/Content$']).toMatch(/docs-ui[/\\]src[/\\]en[/\\]theme[/\\]Navbar[/\\]Content[/\\]index\.tsx$/);
    expect(webpack.resolve?.alias?.['@theme/Navbar/MobileSidebar/SecondaryMenu$']).toMatch(/docs-ui[/\\]src[/\\]en[/\\]theme[/\\]Navbar[/\\]MobileSidebar[/\\]SecondaryMenu[/\\]index\.tsx$/);
    expect(webpack.resolve?.alias?.['@theme/DocSidebar$']).toMatch(/docs-ui[/\\]src[/\\]en[/\\]theme[/\\]DocSidebar[/\\]index\.tsx$/);
    expect(webpack.resolve?.alias?.['@site/config/generated/guides.sidebar$']).toMatch(/generated.en.sidebars.guides\.sidebar\.js$/);
  });

  it('keeps the legacy RestSpecs MDX import as a thin docs-ui runtime wrapper', () => {
    const wrapperPath = path.join(process.cwd(), 'apps/docs/src/components/RestSpecs/index.ts');
    expect(fs.existsSync(wrapperPath)).toBe(true);
    if (!fs.existsSync(wrapperPath)) return;

    expect(fs.readFileSync(wrapperPath, 'utf8')).toBe(
      "export {RestSpecs as default} from '@zilliz/docs-ui/runtime';\n",
    );
    expect(fs.readFileSync(path.join(process.cwd(), 'packages/docs-ui/src/runtime.ts'), 'utf8')).toContain(
      "export {default as RestSpecs} from './shared/components/RestSpecs';",
    );
  });

  it('keeps English standalone page routes thin and sources the home module from docs-ui', () => {
    const homeEntry = path.join(process.cwd(), 'apps/docs/src/pages/index.tsx');
    const markdownEntry = path.join(process.cwd(), 'apps/docs/src/pages/markdown-page.md');
    expect(fs.existsSync(homeEntry)).toBe(true);
    expect(fs.existsSync(markdownEntry)).toBe(true);
    if (!fs.existsSync(homeEntry) || !fs.existsSync(markdownEntry)) return;

    expect(fs.readFileSync(homeEntry, 'utf8')).toBe(
      "export {EnglishHomePage as default} from '@zilliz/docs-ui/runtime';\n",
    );
    expect(fs.readFileSync(path.join(process.cwd(), 'packages/docs-ui/src/runtime.ts'), 'utf8')).toContain(
      "export {default as EnglishHomePage} from './en/pages/Home';",
    );
  });

  it('keeps migrated legacy sidebar loaders as explicit generated-wrapper shims', () => {
    for (const [loader, generated] of [
      ['guides.legacy.ts', 'guides.sidebar'],
      ['byoc.legacy.ts', 'guides-byoc.sidebar'],
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'packages/site-config/src/sidebars/en', loader),
        'utf8',
      );
      expect(source).toContain(`generated/en/sidebars/${generated}`);
      expect(source).not.toContain('config/generated');
      expect(source).not.toContain('config/sidebar-overrides');
    }
  });

  it('uses fully specified relative imports in JavaScript shipped from the ESM package', () => {
    const javascriptFiles: string[] = [];
    const collect = (directory: string): void => {
      for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) collect(target);
        else if (entry.isFile() && entry.name.endsWith('.js')) javascriptFiles.push(target);
      }
    };
    collect(path.join(process.cwd(), 'packages/docs-ui/src'));

    const incomplete: string[] = [];
    for (const file of javascriptFiles) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/(?:import|export)[^'"\n]*from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
        if (!path.extname(match[1])) incomplete.push(`${path.relative(process.cwd(), file)}: ${match[1]}`);
      }
    }
    expect(incomplete).toEqual([]);
  });

  it('rejects incomplete or unsupported module selections', () => {
    expect(() => docsUiPlugin({}, {modules: ['shared-theme']})).toThrow(/shared-components/);
    expect(() => docsUiPlugin({}, {
      modules: ['shared-theme', 'shared-components', 'english-navigation'],
    })).toThrow(/english-home/);
    expect(() => docsUiPlugin({}, {
      modules: ['shared-theme', 'shared-components', 'english-home'],
    })).toThrow(/english-navigation/);
    expect(() => docsUiPlugin({}, {modules: ['unknown'] as never})).toThrow(/unsupported/i);
  });

  it('uses peer dependencies for React and Docusaurus context singletons', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'packages/docs-ui/package.json'), 'utf8'));
    expect(manifest.peerDependencies).toMatchObject({
      '@docusaurus/core': '3.10.1',
      '@docusaurus/plugin-content-docs': '3.10.1',
      '@docusaurus/theme-common': '3.10.1',
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    });
    for (const singleton of runtimeSingletons) {
      expect(manifest.dependencies).not.toHaveProperty(singleton);
    }
    expect(manifest.dependencies).toMatchObject({
      '@inkeep/cxkit-docusaurus': expect.any(String),
      zod: expect.any(String),
    });
    expect(Object.keys(manifest.dependencies)).not.toContainEqual(expect.stringMatching(/^@docusaurus\//));
  });

  it('mounts English Inkeep UI only when all runtime credentials are available', () => {
    expect(hasInkeepCredentials({})).toBe(false);
    expect(hasInkeepCredentials({apiKey: 'key'})).toBe(false);
    expect(hasInkeepCredentials({
      apiKey: 'key', integrationId: 'integration', organizationId: 'organization',
    })).toBe(true);
  });

  it('resolves app and docs-ui React and Docusaurus runtime imports to one installed instance', () => {
    const appRequire = createRequire(path.join(process.cwd(), 'apps/docs/package.json'));
    const docsUiRequire = createRequire(path.join(process.cwd(), 'packages/docs-ui/package.json'));
    const resolvableRuntimeEntries = [
      '@docusaurus/plugin-content-docs',
      '@docusaurus/theme-common',
      'react',
      'react-dom',
    ];

    for (const runtimeEntry of resolvableRuntimeEntries) {
      expect(fs.realpathSync(docsUiRequire.resolve(runtimeEntry))).toBe(fs.realpathSync(appRequire.resolve(runtimeEntry)));
    }
  });

  it('uses the initial built-in theme implementation from wrappers contributed by the docs-ui theme plugin', () => {
    const sharedWrappers = ['Heading', 'TOCItems', 'Tabs'];
    for (const wrapper of sharedWrappers) {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'packages/docs-ui/src/shared/theme', wrapper, 'index.tsx'),
        'utf8',
      );
      expect(source).toContain(`from '@theme-init/${wrapper}'`);
      expect(source).not.toContain(`from '@theme-original/${wrapper}'`);
    }
    const docSidebar = fs.readFileSync(
      path.join(process.cwd(), 'packages/docs-ui/src/en/theme/DocSidebar/index.tsx'),
      'utf8',
    );
    expect(docSidebar).toContain("from '@theme-init/DocSidebar'");
    expect(docSidebar).not.toContain("from '@theme-original/DocSidebar'");
  });
});
