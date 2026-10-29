import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {
  isExcludedInputPath,
  isInputPath,
  releaseInputDefinition,
} from '../../packages/docs-tooling/src/validation/localizationInputInventory.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const DERIVED_SIDEBAR_TRANSLATIONS = Object.freeze([
  'i18n/ja-JP/docusaurus-plugin-content-docs/current.json',
  'i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current.json',
]);

test('en release definition excludes the build-derived ja sidebar translation outputs', () => {
  const excluded = releaseInputDefinition('en').excluded ?? [];
  for (const relativePath of DERIVED_SIDEBAR_TRANSLATIONS) {
    assert.ok(excluded.includes(relativePath), `releaseInputDefinition('en') must exclude ${relativePath}`);
  }
});

test('excluded paths are never localization inputs even when tracked or present on disk', () => {
  const definition = releaseInputDefinition('en');
  for (const relativePath of DERIVED_SIDEBAR_TRANSLATIONS) {
    assert.equal(isExcludedInputPath(relativePath, definition), true);
    assert.equal(isInputPath(relativePath, definition), false);
  }
  assert.equal(isInputPath('i18n/ja-JP/docusaurus-plugin-content-docs/current/home.md', definition), true);
  assert.equal(isExcludedInputPath('i18n/ja-JP/docusaurus-plugin-content-docs/current/home.md', definition), false);
  assert.equal(isInputPath('generated/en/sidebars/guides.sidebar.js', definition), true);
});

test('.gitignore ignores the derived ja sidebar translations so git-side checks stay clean', () => {
  const gitignore = fs.readFileSync(path.join(repositoryRoot, '.gitignore'), 'utf8');
  for (const relativePath of DERIVED_SIDEBAR_TRANSLATIONS) {
    assert.match(
      gitignore,
      new RegExp(`^/${relativePath.replace(/[.]/g, '\\.')}$`, 'm'),
      `.gitignore must carry an uncommented ignore line for ${relativePath}`,
    );
  }
});
