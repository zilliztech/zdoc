'use strict';

const { getContentGroup } = require('./content-groups');

const TRANSLATION_ROOT = 'i18n/ja-JP';
const REFERENCE_I18N_ROOT = `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs-reference/current`;

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

  return Object.freeze({
    group: groupName,
    englishOutputs,
    translationOutputs,
    sidebars,
    snapshot,
    translate: Boolean(group.translate),
  });
}

module.exports = { getGroupPaths, referenceTranslationPath };
