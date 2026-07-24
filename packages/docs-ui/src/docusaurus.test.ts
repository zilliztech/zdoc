import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import docsUiPlugin from './docusaurus';

const runtimeSingletons = [
  '@docusaurus/core',
  '@docusaurus/plugin-content-docs',
  '@docusaurus/theme-common',
  'react',
  'react-dom',
] as const;

describe('docs UI Docusaurus integration', () => {
  it('uses exact compatibility aliases so the built-in @site alias cannot shadow moved modules', () => {
    const plugin = docsUiPlugin({}, {modules: ['shared-theme', 'shared-components']});
    const webpack = plugin.configureWebpack?.({} as never, false, {} as never, {} as never) as {
      resolve?: {alias?: Record<string, string>};
    };
    expect(webpack.resolve?.alias?.['@site/src/components/Supademo$']).toMatch(
      new RegExp(`packages${path.sep}docs-ui${path.sep}src${path.sep}shared${path.sep}components${path.sep}Supademo$`),
    );
    expect(webpack.resolve?.alias?.['@site/src/components/ChatPanel/endpoints$']).toMatch(/ChatPanel[/\\]endpoints\.ts$/);
    expect(webpack.resolve?.alias?.['@site/src/theme/Heading/CopyPageButton$']).toMatch(/Heading[/\\]CopyPageButton\.tsx$/);
    expect(webpack.resolve?.alias?.['@site/config/generated/guides.sidebar$']).toMatch(/generated.en.sidebars.guides\.sidebar\.js$/);
  });

  it('rejects incomplete or unsupported module selections', () => {
    expect(() => docsUiPlugin({}, {modules: ['shared-theme']})).toThrow(/shared-components/);
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
    expect(Object.keys(manifest.dependencies)).not.toContainEqual(expect.stringMatching(/^@docusaurus\//));
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
    const wrappers = ['Heading', 'TOCItems', 'Tabs', 'DocSidebar'];
    for (const wrapper of wrappers) {
      const source = fs.readFileSync(
        path.join(process.cwd(), 'packages/docs-ui/src/shared/theme', wrapper, 'index.tsx'),
        'utf8',
      );
      expect(source).toContain(`from '@theme-init/${wrapper}'`);
      expect(source).not.toContain(`from '@theme-original/${wrapper}'`);
    }
  });
});
