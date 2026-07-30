'use strict';

const { loadTypeScript } = require('../lib/load-typescript');
const { resolveBootstrapSite } = loadTypeScript('../../packages/site-config/src/resolve.ts');
const { getContentGroup } = require('./content-groups');
const { resolvePublicationGroupWorkflow } = loadTypeScript('../../packages/docs-tooling/src/workflows/groups.ts');

const TRANSLATION_ROOT = 'i18n/ja-JP';
const REFERENCE_I18N_ROOT = `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs-reference/current`;

function referenceTranslationPath(ownedPath) {
  const prefix = 'content/en/reference/';
  if (!ownedPath.startsWith(prefix)) return null;
  return `${REFERENCE_I18N_ROOT}/${ownedPath.slice(prefix.length)}`;
}

function getGroupPaths(groupName, site = resolveBootstrapSite(undefined)) {
  const group = getContentGroup(groupName, site);
  const publication = resolvePublicationGroupWorkflow(site, groupName).group;
  const englishOutputs = Object.freeze([...publication.ownedPaths]);
  const translationOutputs = Object.freeze(site !== 'en' ? [] : groupName === 'guides'
    ? [
        `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs/current/tutorials`,
        `${TRANSLATION_ROOT}/docusaurus-plugin-content-docs-byoc/current/tutorials`,
      ]
    : publication.ownedPaths.map(referenceTranslationPath).filter(Boolean));
  const sidebars = Object.freeze(publication.ownedPaths.filter((ownedPath) => (
    ownedPath.startsWith(`generated/${site}/sidebars/`) && ownedPath.endsWith('.sidebar.js')
  )));

  return Object.freeze({
    site,
    group: groupName,
    englishOutputs,
    translationOutputs,
    sidebars,
    snapshot: group.ownedPaths.find((ownedPath) => (
      ownedPath.startsWith('packages/docs-tooling/src/lark/meta/snapshots/') && ownedPath.endsWith('.json')
    )) || null,
    preservedEnglish: group.preservedPaths,
    protectedPaths: group.protectedPaths,
    publicationManifest: group.publicationManifest,
    translate: Boolean(group.translate),
  });
}

module.exports = { getGroupPaths, referenceTranslationPath };
