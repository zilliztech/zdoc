/** Client-side fallback for retired URLs. nginx 301s only see full page loads;
 * an in-app click handled by the React router never reaches the server, so it
 * lands on this 404. The spa-redirect-map plugin (apps/docs/plugins) publishes
 * the site profile's redirects.rules as global data; this helper resolves the
 * requested path against that map so the 404 page can redirect to the live
 * successor instead of flashing "not found". The plugin name must stay in sync
 * with apps/docs/plugins/spa-redirect-map/index.js. */

export const SPA_REDIRECT_MAP_PLUGIN_NAME = 'zdoc-spa-redirect-map';

export type SpaRedirectRule = {readonly from: string; readonly to: string};
export type SpaRedirectRules = ReadonlyArray<SpaRedirectRule>;

/** Resolves one miss. Paths in the map are site-root-relative (same form as
 * nginx rules); the baseUrl prefix is stripped from the requested pathname
 * before matching and re-attached to the target, and query/hash survive the
 * hop. Exact match only — an unmapped miss keeps the regular 404 page. */
export function spaRedirectTarget(
  pathname: string,
  search: string,
  hash: string,
  rules: SpaRedirectRules | undefined,
  baseUrl: string,
): string | null {
  if (!rules || rules.length === 0) {
    return null;
  }
  // baseUrl always ends with "/": keeping that slash when slicing preserves the
  // leading "/" of the site-root-relative path.
  const withoutBase = baseUrl !== '/' && pathname.startsWith(baseUrl) ? pathname.slice(baseUrl.length - 1) : pathname;
  const normalized = withoutBase.length > 1 && withoutBase.endsWith('/') ? withoutBase.slice(0, -1) : withoutBase;
  for (const rule of rules) {
    if (rule.from === normalized) {
      const prefix = baseUrl === '/' ? '' : baseUrl.replace(/\/+$/, '');
      return `${prefix}${rule.to}${search}${hash}`;
    }
  }
  return null;
}
