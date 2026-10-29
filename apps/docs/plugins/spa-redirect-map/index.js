'use strict';

// Publishes the site profile's redirects.rules as plugin global data so the
// swizzled 404 page (packages/docs-ui/src/shared/theme/NotFound/Content) can
// redirect in-app SPA clicks from retired paths to their live successors.
// nginx 301s only see full page loads; this map is the client-router fallback.
// The plugin name must stay in sync with SPA_REDIRECT_MAP_PLUGIN_NAME in
// packages/docs-ui/src/shared/theme/NotFound/Content/spaRedirectMap.ts.

const PluginName = 'zdoc-spa-redirect-map';

// A bad rule here would redirect visitors into another 404 (or bounce between
// two retired paths forever), so the map is validated at config time: unique
// sources, no self loops, and an acyclic graph. postBuild then fails the build
// when a target is not a route the site serves.
function normalizeRules(rules) {
  if (!Array.isArray(rules)) {
    throw new Error(`[${PluginName}] rules option must be an array`);
  }
  const seen = new Set();
  for (const rule of rules) {
    if (!rule || typeof rule.from !== 'string' || typeof rule.to !== 'string') {
      throw new Error(`[${PluginName}] every rule needs string "from" and "to"`);
    }
    if (rule.from === rule.to) {
      throw new Error(`[${PluginName}] redirect rule ${rule.from} targets itself`);
    }
    if (seen.has(rule.from)) {
      throw new Error(`[${PluginName}] duplicate redirect source: ${rule.from}`);
    }
    seen.add(rule.from);
  }
  const targets = new Map(rules.map(rule => [rule.from, rule.to]));
  for (const start of targets.keys()) {
    const walked = new Set([start]);
    let current = targets.get(start);
    while (targets.has(current)) {
      if (walked.has(current)) {
        throw new Error(`[${PluginName}] redirect rules form a cycle through ${current}`);
      }
      walked.add(current);
      current = targets.get(current);
    }
  }
  return rules.map(({from, to}) => ({from, to}));
}

function stripTrailingSlash(path) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

module.exports = function spaRedirectMapPlugin(_context, options) {
  const rules = normalizeRules(options.rules);
  return {
    name: PluginName,
    async loadContent() {
      return rules;
    },
    contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
    async postBuild({routesPaths, baseUrl}) {
      const served = new Set(routesPaths.map(stripTrailingSlash));
      const basePrefix = baseUrl === '/' ? '' : baseUrl.replace(/\/+$/, '');
      for (const {from, to} of rules) {
        const target = `${basePrefix}${to}`;
        if (!served.has(stripTrailingSlash(target))) {
          throw new Error(
            `[${PluginName}] redirect ${from} -> ${to} targets a route the site does not serve; `
            + 'retire the rule together with its target page',
          );
        }
      }
    },
  };
};

module.exports.PluginName = PluginName;
