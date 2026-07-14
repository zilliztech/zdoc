# Nginx 404 Redirect Design for Top 100 Broken Paths

## Goal
Reduce high-volume `Page Not Found` responses for the provided top-100 path list by adding conservative nginx routing fixes in `default.conf`, while preserving true 404s for unresolved or ambiguous URLs.

## Context
The current nginx config in `default.conf` already uses a large set of exact-match redirects plus a strict fallback:

- `location /` uses `try_files $uri $uri.html =404`
- many legacy paths are fixed via `location = /old-path { return 301 /new-path; }`
- unresolved paths still go to `404.html`

The supplied 404 list is not a complete mapping spec. It is only evidence of commonly broken incoming URLs. Because of that, redirects must be added only when the destination can be verified from the current repo or build output.

## Non-Goals
- Do not convert all unknown docs paths into redirects.
- Do not add a generic fallback from unresolved docs pages to `/docs/home`.
- Do not guess destinations when the target cannot be verified from source or build output.
- Do not change site content, slugs, or Docusaurus routing as part of this work.

## Design

### 1. Keep the strict fallback
Retain the existing `try_files $uri $uri.html =404` behavior in `default.conf`. This ensures truly invalid URLs still surface as 404s instead of silently landing on unrelated pages.

### 2. Add a small normalization layer for safe repeated patterns
Add a narrow set of regex-based rewrites before the exact-match redirect list. These rules must be limited to cases that are clearly mechanical and safe:

- normalize locale casing from `/ja-jp/...` to `/ja-JP/...`
- normalize known slug variants such as `/docs/quickstart` to `/docs/quick-start`
- normalize similarly obvious one-off formatting defects only when the resulting target is verified to exist

These rules should be intentionally small. They are for repeated, low-risk mistakes visible in the top-100 list, not for broad heuristic routing.

### 3. Add explicit redirects for verified legacy paths
For broken paths with specific, confirmed destinations, add exact `location = ...` redirects following the existing pattern in `default.conf`.

Representative examples already supported by repo evidence:

- `/ja-JP/docs/view-snapshot-details` → `/ja-JP/docs/manage-backup-files`
- `/ja-jp/docs/access-control` → `/ja-JP/docs/access-control`
- `/ja-jp/docs/authentication` → `/ja-JP/docs/authentication`
- `/ja-jp/docs/projects` → `/ja-JP/docs/projects`
- `/ja-jp/docs/home` → `/ja-JP/docs/home`
- `/docs/manage-stages` → `/docs/managed-volume`
- `/docs/volume-explained` → `/docs/volume`
- `/reference/restful/list-stages-v2` → `/reference/restful/list-volumes-v2`
- `/docs/quickstart` → `/docs/quick-start`

Other paths from the top-100 list should be added only after verifying their current canonical destinations from repo files or build output.

### 4. Handle non-doc endpoints explicitly when needed
A few top-100 entries are not normal docs pages and should be handled individually:

- `/robots.txt`: serve the static asset if it exists, otherwise decide whether to add one separately
- `/img/docusaurus-social-card.jpg`: redirect only if the asset exists at another stable path
- `/api/health`: only redirect or return success if there is a documented, intentional health endpoint requirement; otherwise leave unresolved
- `/404`: likely redirect to `/404.html` only if consistent with current deployment behavior

These should not be folded into generic docs rewrite rules.

## Verification Rules
A redirect may be added only if at least one of the following is true:

1. the target page exists in current built output under `build/`
2. the target slug is clearly present in source docs and matches current routing patterns
3. there is already an equivalent redirect pattern in `default.conf` that proves the intended canonical destination

If none of the above is true, leave the path unresolved.

## File Changes
- Modify: `default.conf`
- No code changes elsewhere are required for the initial fix

## Testing
- Build or use existing built output to verify target pages resolve
- For each added redirect, test with curl or equivalent to confirm the response is `301` and the `Location` header matches the intended destination
- Spot-check representative unresolved paths to confirm they still return `404`
- Re-test existing neighboring redirect rules to ensure the new normalization rules do not shadow or override them unintentionally

## Risks
- Overly broad regex rules could redirect unrelated URLs incorrectly
- Locale normalization could interfere with paths outside the intended docs subtree if scoped too broadly
- Guessing destinations from naming similarity could hide real content gaps

## Risk Mitigation
- Prefer exact-match rules over regex rules unless the pattern is clearly repeated
- Scope normalization rules narrowly to the affected path families
- Keep unresolved cases as 404s
- Verify every new target before adding the redirect

## Success Criteria
- A meaningful subset of the provided top-100 404 paths now returns a verified `301` to the correct destination
- Repeated safe patterns such as `ja-jp` casing mismatches are fixed once in nginx rather than repeated manually
- Ambiguous paths remain 404 instead of being misrouted
- Existing redirect behavior in `default.conf` continues to work unchanged
