'use strict';

// Shared loader for the cloud-data marker resolution consumed by the
// embed-markdown and llms-txt plugins. The core lives in
// packages/docs-ui/src/shared/cloud-data (single source shared with the nginx
// njs renderer and the React components); Node >=22.12 loads those ESM files
// through require(). Site resolution follows the Docusaurus site profile —
// `customFields.site` — not the i18n locale: the English site's ja-JP pages
// resolve to the same English snapshot (the CMS has no Japanese data).

const SNAPSHOT_MODULES = {
  en: '@zilliz/docs-ui/cloud-data/snapshots/en.json',
  'zh-CN': '@zilliz/docs-ui/cloud-data/snapshots/zh-CN.json',
};

let resolveModule = null;

function loadResolveModule() {
  if (!resolveModule) {
    resolveModule = require('@zilliz/docs-ui/cloud-data/resolveMarkdown.js');
  }
  return resolveModule;
}

function resolveCloudDataSite(context) {
  const site = context && context.siteConfig && context.siteConfig.customFields
    ? context.siteConfig.customFields.site
    : null;
  return site === 'zh-CN' ? 'zh-CN' : 'en';
}

function loadModel(site) {
  const moduleId = SNAPSHOT_MODULES[site];
  if (!moduleId) throw new Error(`[cloud-data] No snapshot module for site: ${site}`);
  return require(moduleId).model;
}

// mode "ssi":      block stub + include directive (build-time .md artifacts)
// mode "snapshot": baked table only (dev server middleware, llms.txt)
function resolveForSite(content, site, mode) {
  return loadResolveModule().resolveCloudDataMarkers(content, loadModel(site), {mode});
}

module.exports = {resolveCloudDataSite, loadModel, resolveForSite};
