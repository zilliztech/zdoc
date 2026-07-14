'use strict';

const { getContentGroup } = require('./content-groups');

const TRANSLATION_ROOT = 'i18n/ja-JP';
const REFERENCE_I18N_ROOT = `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs-reference/current`;
const PRESERVED_ENGLISH = Object.freeze({
  guides: Object.freeze([]),
  python: Object.freeze(['reference/api/python/python/python.md']),
  java: Object.freeze(['reference/api/java/java/java.md']),
  node: Object.freeze(['reference/api/nodejs/nodejs/nodejs.md']),
  go: Object.freeze(['reference/api/go/go/go.md']),
  cli: Object.freeze(['reference/cli/cli/Overview.md']),
  rest: Object.freeze([]),
});

function referenceTranslationPath(ownedPath) {
  if (!ownedPath.startsWith('reference/')) return null;
  return `${REFERENCE_I18N_ROOT}/${ownedPath.slice('reference/'.length)}`;
}

function getGroupPaths(groupName) {
  const group = getContentGroup(groupName);
  const englishOutputs = Object.freeze([...group.ownedPaths]);
  const translationOutputs = Object.freeze(groupName === 'guides'
    ? [
        `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs/current/tutorials`,
        `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs-byoc/current/tutorials`,
      ]
    : group.ownedPaths.map(referenceTranslationPath).filter(Boolean));
  const sidebars = Object.freeze(group.ownedPaths.filter((ownedPath) => (
    ownedPath.startsWith('config/generated/') && ownedPath.endsWith('.sidebar.js')
  )));
  const snapshot = group.ownedPaths.find((ownedPath) => (
    ownedPath.startsWith('plugins/lark-docs/meta/snapshots/') && ownedPath.endsWith('.json')
  )) || null;
  const preservedEnglish = Object.freeze([...PRESERVED_ENGLISH[groupName]]);

  return Object.freeze({
    group: groupName,
    englishOutputs,
    translationOutputs,
    sidebars,
    snapshot,
    preservedEnglish,
    translate: Boolean(group.translate),
  });
}

module.exports = { getGroupPaths, referenceTranslationPath };
