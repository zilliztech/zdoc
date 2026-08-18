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

type WebpackResolveConfig = {
  extensions?: string[];
  alias?: Record<string, string>;
};

type WebpackConfig = {
  mode?: 'development';
  resolve?: WebpackResolveConfig;
};

function docusaurusCoreRequire() {
  const appRequire = createRequire(path.join(process.cwd(), 'apps/docs/package.json'));
  const coreRoot = path.dirname(appRequire.resolve('@docusaurus/core/package.json'));
  return {coreRequire: createRequire(path.join(coreRoot, 'package.json')), coreRoot};
}

function applyDocusaurusWebpackConfig(
  plugin: ReturnType<typeof docsUiPlugin>,
  config: WebpackConfig,
): WebpackConfig {
  const {coreRequire, coreRoot} = docusaurusCoreRequire();
  const {applyConfigureWebpack} = coreRequire(path.join(coreRoot, 'lib/webpack/configure.js')) as {
    applyConfigureWebpack(options: {
      configureWebpack: NonNullable<typeof plugin.configureWebpack>;
      config: WebpackConfig;
      isServer: boolean;
      configureWebpackUtils: Record<string, never>;
      content: undefined;
    }): WebpackConfig;
  };
  return applyConfigureWebpack({
    configureWebpack: plugin.configureWebpack!,
    config,
    isServer: false,
    configureWebpackUtils: {},
    content: undefined,
  });
}

async function resolveWithWebpack(config: WebpackConfig, importer: string, request: string): Promise<string> {
  type Resolver = {
    resolve(
      context: Record<string, never>,
      importer: string,
      request: string,
      resolveContext: Record<string, never>,
      callback: (error?: Error | null, result?: string | false) => void,
    ): void;
  };
  type Compiler = {
    options: {resolve: WebpackResolveConfig};
    resolverFactory: {get(type: 'normal', options: WebpackResolveConfig): Resolver};
    close(callback: (error?: Error | null) => void): void;
  };
  const {coreRequire} = docusaurusCoreRequire();
  const webpack = coreRequire('webpack') as (options: WebpackConfig) => Compiler;
  const compiler = webpack({mode: 'development', resolve: config.resolve});
  const resolver = compiler.resolverFactory.get('normal', compiler.options.resolve);

  return new Promise((resolve, reject) => {
    resolver.resolve({}, importer, request, {}, (resolveError, result) => {
      compiler.close(closeError => {
        if (resolveError) reject(resolveError);
        else if (closeError) reject(closeError);
        else if (!result) reject(new Error(`Webpack did not resolve ${request}`));
        else resolve(result);
      });
    });
  });
}

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
  it('exposes the production navigation shell from the shared Docusaurus theme path', () => {
    const plugin = docsUiPlugin({}, {modules: ['shared-theme', 'shared-components']});
    const webpack = plugin.configureWebpack?.({} as never, false, {} as never, {} as never) as {
      resolve?: {alias?: Record<string, string>};
    };
    expect(plugin.getThemePath?.()).toMatch(
      new RegExp(`packages${path.sep}docs-ui${path.sep}src${path.sep}shared${path.sep}theme$`),
    );
    const sharedTheme = plugin.getThemePath?.() as string;
    expect(fs.existsSync(path.join(sharedTheme, 'Navbar/Content/index.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(sharedTheme, 'Navbar/MobileSidebar/SecondaryMenu/index.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(sharedTheme, 'DocSidebar/index.tsx'))).toBe(true);
    expect(webpack.resolve?.alias?.['@site/src/components/Supademo$']).toMatch(
      new RegExp(`packages${path.sep}docs-ui${path.sep}src${path.sep}shared${path.sep}components${path.sep}Supademo$`),
    );
    expect(webpack.resolve?.alias?.['@site/src/components/ChatPanel/endpoints$']).toMatch(/ChatPanel[/\\]endpoints\.ts$/);
    expect(webpack.resolve?.alias?.['@site/src/theme/Heading/CopyPageButton$']).toMatch(/Heading[/\\]CopyPageButton\.tsx$/);
    expect(webpack.resolve?.alias).not.toHaveProperty('@theme/Navbar/Content$');
    expect(webpack.resolve?.alias).not.toHaveProperty('@theme/Navbar/MobileSidebar/SecondaryMenu$');
    expect(webpack.resolve?.alias).not.toHaveProperty('@theme/DocSidebar$');
    expect(webpack.resolve?.alias).not.toHaveProperty('@zilliz/docs-ui/guides-sidebar$');

    const sharedRoot = path.join(process.cwd(), 'packages/docs-ui/src/shared');
    expect(fs.readFileSync(path.join(sharedRoot, 'theme/Navbar/Content/index.tsx'), 'utf8')).toContain(
      "export {default} from '../../../../en/theme/Navbar/Content';",
    );
    expect(fs.readFileSync(path.join(sharedRoot, 'theme/DocSidebar/index.tsx'), 'utf8')).toContain(
      "export {default} from '../../../en/theme/DocSidebar';",
    );
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
    expect(webpack.resolve?.alias?.['@zilliz/docs-ui/guides-sidebar$']).toMatch(/generated.en.sidebars.guides\.sidebar\.js$/);
    expect(webpack.resolve?.alias?.['@theme/Root']).toMatch(/docs-ui[/\\]src[/\\]shared[/\\]theme[/\\]Root(?:\.tsx)?$/);
    expect(webpack.resolve?.alias?.['@theme/SearchBar']).toMatch(/docs-ui[/\\]src[/\\]shared[/\\]theme[/\\]SearchBar(?:\.tsx)?$/);
  });

  it('selects the Chinese Guides sidebar for the complete Chinese module selection', () => {
    const plugin = docsUiPlugin({}, {
      modules: ['shared-theme', 'shared-components', 'chinese-home'],
    });
    const webpack = plugin.configureWebpack?.({} as never, false, {} as never, {} as never) as {
      resolve?: {alias?: Record<string, string>};
    };

    expect(webpack.resolve?.alias?.['@zilliz/docs-ui/guides-sidebar$']).toMatch(/generated.zh-CN.sidebars.guides\.sidebar\.js$/);
  });

  it('keeps the standalone Chinese developer hub localized', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'apps/docs/static/zh-CN/home/index.html'),
      'utf8',
    );
    expect(source).toContain('<html lang="zh-CN">');
    expect(source).toContain('Zilliz Cloud 开发者中心');
    expect(source).toContain('查找使用 Zilliz Cloud 所需的文档');
    expect(source).toContain('开发指南');
    expect(source).not.toMatch(/>\s*(?:Release Notes|FAQs|Home|Guide|API Reference|Discussion|Getting Started|Quick Start|Free Trials|Install SDKs|Example Dataset)\s*</u);
  });

  it('resolves the Chinese Guides sidebar without colliding with Docusaurus site aliases', async () => {
    const plugin = docsUiPlugin({}, {
      modules: ['shared-theme', 'shared-components', 'chinese-home'],
    });
    const config = applyDocusaurusWebpackConfig(plugin, {
      resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {'@site': path.join(process.cwd(), 'apps/docs')},
      },
    });

    await expect(resolveWithWebpack(
      config,
      path.join(process.cwd(), 'packages/docs-ui/src/en/theme/DocSidebar'),
      '@zilliz/docs-ui/guides-sidebar',
    )).resolves.toBe(path.join(process.cwd(), 'generated/zh-CN/sidebars/guides.sidebar.js'));
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

  it('consumes sanitized embed-markdown plugin data in both copy-page implementations', () => {
    const sharedRoot = path.join(process.cwd(), 'packages/docs-ui/src/shared');
    for (const relativePath of [
      'components/CopyPage/index.js',
      'theme/Heading/CopyPageButton.tsx',
    ]) {
      const source = fs.readFileSync(path.join(sharedRoot, relativePath), 'utf8');
      expect(source).toContain("usePluginData('embed-markdown')");
      expect(source).toContain('pluginData?.sources');
      expect(source).toContain('pluginData?.enableSourceView');
    }
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

  it('keeps the Chinese root route in a site-owned page directory', () => {
    const homeEntry = path.join(process.cwd(), 'packages/docs-ui/src/zh-CN/pages/index.tsx');
    expect(fs.existsSync(homeEntry)).toBe(true);
    if (!fs.existsSync(homeEntry)) return;

    const source = fs.readFileSync(homeEntry, 'utf8');
    expect(source).toContain("import {Redirect} from '@docusaurus/router';");
    expect(source).toContain('<Redirect to="/docs/home" />');
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
      expect(source).toContain('toDocusaurusSidebar');
      expect(source).not.toContain('config/generated');
      expect(source).not.toContain('config/sidebar-overrides');
    }
  });

  it('adapts generated Chinese Guides sidebars at the Docusaurus boundary', () => {
    for (const [loader, generated] of [
      ['guides.ts', 'guides.sidebar'],
      ['byoc.ts', 'guides-byoc.sidebar'],
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'packages/site-config/src/sidebars/zh-CN', loader),
        'utf8',
      );
      expect(source).toContain(`generated/zh-CN/sidebars/${generated}`);
      expect(source).toContain('toDocusaurusSidebar');
      expect(source).not.toContain('autogenerated');
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
      '@docusaurus/core': '3.10.2',
      '@docusaurus/plugin-content-docs': '3.10.2',
      '@docusaurus/theme-common': '3.10.2',
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
