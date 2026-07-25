import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'apps/docs/src/**/*.test.{ts,tsx}', 'packages/site-config/**/*.test.{ts,tsx}', 'packages/docs-tooling/**/*.test.{ts,tsx}', 'packages/docs-ui/**/*.test.{ts,tsx}'],
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
      '@site/src/components': path.resolve(__dirname, 'packages/docs-ui/src/shared/components'),
      '@site/src/theme': path.resolve(__dirname, 'packages/docs-ui/src/shared/theme'),
      '@site/src/utils': path.resolve(__dirname, 'packages/docs-ui/src/shared/utils'),
      '@site/config/generated/guides.sidebar': path.resolve(__dirname, 'generated/en/sidebars/guides.sidebar.js'),
    },
  },
});
