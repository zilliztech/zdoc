import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'apps/docs/src/**/*.test.{ts,tsx}', 'packages/site-config/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/components/ChatPanel/**/*.tsx', 'src/theme/Search/**/*.tsx'],
      exclude: ['src/**/*.test.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@docusaurus/useDocusaurusContext': path.resolve(__dirname, 'node_modules/@docusaurus/core/lib/client/exports/useDocusaurusContext.js'),
      '@docusaurus/router': path.resolve(__dirname, 'node_modules/@docusaurus/core/lib/client/exports/router.js'),
    },
  },
});
