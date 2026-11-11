import {defineConfig} from 'vitest/config';
import {transformWithEsbuild} from 'vite';
import path from 'path';

// The REST reference components are JSX authored in .js files, which the
// Docusaurus Babel pipeline accepts but Vite only parses as plain JS. Compile
// exactly those files as JSX so their render tests exercise the real modules.
const jsxInJsComponents = /packages\/docs-ui\/src\/shared\/components\/Rest(Specs|Header)\/[^/]+\.js$/;

export default defineConfig({
  plugins: [{
    name: 'docs-ui-rest-jsx-in-js',
    enforce: 'pre',
    transform(code, id) {
      return jsxInJsComponents.test(id) ? transformWithEsbuild(code, id, {loader: 'jsx', jsx: 'automatic'}) : null;
    },
  }],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'apps/docs/src/**/*.test.{ts,tsx}', 'packages/site-config/**/*.test.{ts,tsx}', 'packages/docs-tooling/**/*.test.{ts,tsx}', 'packages/docs-ui/**/*.test.{ts,tsx}', 'packages/chat-ui/src/**/*.test.{ts,tsx}', 'packages/publication-adapters/**/*.test.{ts,tsx}', 'scripts/translation/schema.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/docs-ui/src/shared/components/ChatPanel/**/*.tsx', 'packages/docs-ui/src/shared/theme/Search/**/*.tsx'],
      exclude: ['**/*.test.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@docusaurus/useDocusaurusContext': path.resolve(__dirname, 'node_modules/@docusaurus/core/lib/client/exports/useDocusaurusContext.js'),
      '@docusaurus/router': path.resolve(__dirname, 'node_modules/@docusaurus/core/lib/client/exports/router.js'),
      '@docusaurus/BrowserOnly': path.resolve(__dirname, 'node_modules/@docusaurus/core/lib/client/exports/BrowserOnly.js'),
      '@docusaurus/ErrorBoundary': path.resolve(__dirname, 'node_modules/@docusaurus/core/lib/client/exports/ErrorBoundary.js'),
      '@docusaurus/useGlobalData': path.resolve(__dirname, 'node_modules/@docusaurus/core/lib/client/exports/useGlobalData.js'),
      '@theme/Admonition': path.resolve(__dirname, 'src/test/AdmonitionStub.tsx'),
      '@theme/CodeBlock': path.resolve(__dirname, 'src/test/CodeBlockStub.tsx'),
      '@theme-init/Heading': path.resolve(__dirname, 'src/test/HeadingInitStub.tsx'),
      '@docusaurus/Link': path.resolve(__dirname, 'src/test/LinkStub.tsx'),
      '@site/src/components': path.resolve(__dirname, 'packages/docs-ui/src/shared/components'),
      '@site/src/theme': path.resolve(__dirname, 'packages/docs-ui/src/shared/theme'),
      '@site/src/utils': path.resolve(__dirname, 'packages/docs-ui/src/shared/utils'),
      '@site/config/generated/guides.sidebar': path.resolve(__dirname, 'generated/en/sidebars/guides.sidebar.js'),
    },
  },
});
