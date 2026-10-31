import fs from 'node:fs';

/** One exact-match nginx `return 301` edge, normalized the way the 404 page's
 * spaRedirectTarget() matches: site-root-relative, no trailing slash, no
 * fragment. Fragments are dropped because the client redirect target is a
 * route hop (nginx still serves its own fragment-bearing targets on full page
 * loads); this module only decides where an in-app SPA click can land. */
export type NginxRedirectPair = {readonly from: string; readonly to: string};

// Exact-match location blocks in the hand-maintained confs are flat (no nested
// braces), so a non-greedy scan to the first `}` is sufficient. Whitespace
// around `=` and the brace is tolerated, and `#`-comments are stripped first
// (only when the `#` starts the line or follows whitespace, so fragment-bearing
// targets like `/docs/x#anchor` survive) — a commented-out rule must not become
// a phantom client redirect. Quoted location sources (`location = "/x y"`) are
// not supported. Blocks whose body carries several `return` directives are
// ambiguous for this purpose and are skipped — adding a second return to a
// redirect block means the block needs human review, not a silent client-side
// guess.
const EXACT_BLOCK_PATTERN = /location\s*=\s*([^ {]+?)\s*\{([^}]*)\}/gu;
const RETURN_301_PATTERN = /return\s+301\s+([^;\s]+);/gu;

function stripComments(conf: string): string {
  return conf.replaceAll(/(^|\s)#.*$/gmu, '$1');
}

function normalizePath(rawPath: string): string {
  let normalized = rawPath.trim();
  const hash = normalized.indexOf('#');
  if (hash !== -1) normalized = normalized.slice(0, hash);
  if (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1);
  return normalized;
}

function isSkippedTarget(target: string): boolean {
  // Absolute external URLs cannot be react-router Redirect targets, and
  // `$`-carrying targets are nginx variable rewrites the client map cannot
  // express. Both stay nginx-only; the SPA map simply has no entry for them.
  return /^https?:\/\//iu.test(target) || target.includes('$');
}

/** Parses every usable exact-match 301 edge out of one nginx conf. Blocks
 * without a 301 (try_files fallbacks, 204/404 gates) contribute nothing but
 * their sources still participate as chain intermediates. Trailing-slash
 * catch rules (`location = /x/ { return 301 /x; }`) vanish here: after
 * normalization both sides collapse to `/x`, a self-loop the client matcher
 * can never need (a normalized request to `/x` is already the live route).
 * The site root is a legal target (the SPA serves a real route at `/`), so
 * only normalized self-loops are dropped. */
export function extractExact301Pairs(conf: string): NginxRedirectPair[] {
  const pairs: NginxRedirectPair[] = [];
  for (const block of stripComments(conf).matchAll(EXACT_BLOCK_PATTERN)) {
    const from = normalizePath(block[1]);
    if (from.length <= 1) continue;
    const returns = [...block[2].matchAll(RETURN_301_PATTERN)];
    if (returns.length !== 1) continue;
    const to = normalizePath(returns[0][1]);
    if (to === from) continue;
    pairs.push({from, to});
  }
  return pairs;
}

/** Walks every edge to its final destination so the SPA map sends clicks
 * straight to a live route instead of through retired intermediates (each hop
 * would otherwise flash the 404 page once per hop). Targets that only nginx
 * can serve (external, `$var`) cut the walk: rules resolving to one are
 * dropped from the client map rather than pointed at a guaranteed 404. */
export function resolveRedirectChains(pairs: readonly NginxRedirectPair[]): NginxRedirectPair[] {
  const bySource = new Map<string, string>();
  for (const {from, to} of pairs) {
    const existing = bySource.get(from);
    if (existing !== undefined && existing !== to) {
      throw new Error(`Duplicate nginx redirect source "${from}" with conflicting targets "${existing}" vs "${to}"`);
    }
    bySource.set(from, to);
  }
  const resolved: NginxRedirectPair[] = [];
  for (const [from, firstTarget] of bySource) {
    const walked = new Set<string>([from]);
    let current = firstTarget;
    while (bySource.has(current)) {
      if (walked.has(current)) {
        throw new Error(`nginx redirect rules form a cycle through "${current}"`);
      }
      walked.add(current);
      current = bySource.get(current)!;
    }
    if (isSkippedTarget(current)) continue;
    resolved.push({from, to: current});
  }
  return resolved;
}

/** Reads one site's hand-maintained nginx conf and derives the client-side
 * redirect map from it. Missing or unreadable confs fail the config load on
 * purpose: a silently empty map would send every in-app click to a retired
 * path straight to the 404 body. */
export function loadNginxRedirectRules(confPath: string): NginxRedirectPair[] {
  let conf: string;
  try {
    conf = fs.readFileSync(confPath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read the nginx redirect map at ${confPath}: ${String(error)}`);
  }
  return resolveRedirectChains(extractExact301Pairs(conf));
}

/** Merges the nginx-derived rules with the site profile's hand-maintained
 * rules into the single SPA map. The profile entries exist for paths the
 * operator wants redirected client-side even though nginx does not carry them;
 * a source carried by both with different targets is a drift between two
 * hand-maintained lists, which fails the config load instead of silently
 * picking a winner. */
export function mergeRedirectRules(
  derived: readonly NginxRedirectPair[],
  profileRules: readonly NginxRedirectPair[],
): NginxRedirectPair[] {
  const merged = new Map<string, string>();
  for (const {from, to} of derived) merged.set(from, to);
  for (const {from, to} of profileRules) {
    const existing = merged.get(from);
    if (existing !== undefined && existing !== to) {
      throw new Error(
        // `existing` is the chain-resolved conf target, not verbatim conf text.
        `Redirect source "${from}" resolves to "${existing}" via the nginx conf (chains walked to their final target) but the site profile declares "${to}"`,
      );
    }
    merged.set(from, to);
  }
  return [...merged].map(([from, to]) => ({from, to}));
}
