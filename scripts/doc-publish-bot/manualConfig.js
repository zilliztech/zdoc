'use strict'

const { loadTypeScript } = require('../lib/load-typescript')
const { resolveBootstrapSite } = loadTypeScript('../../packages/site-config/src/resolve.ts')
const { larkDocsConfigForSite } = loadTypeScript('../../packages/docs-tooling/src/manuals/derive/larkConfigView.ts')

/**
 * Returns the Lark Docs manual view for the resolved site.
 *
 * The config file path argument is retained for call-site compatibility but is
 * no longer read; the manual registry is the single source of truth and the
 * view mirrors the committed config surface.
 */
function loadLarkDocsConfig(_configPath, explicitSite) {
  return larkDocsConfigForSite(resolveBootstrapSite(explicitSite))
}

module.exports = {
  loadLarkDocsConfig,
}
