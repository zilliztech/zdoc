# Docs analytics events and search-origin 404 reporting

Date: 2026-09-20
Status: implemented (GA4/GTM container configuration is an operator follow-up)
Scope: `packages/docs-ui`, `scripts/ga4-search-404-report*`, `.github/workflows/ga4-search-404-report.yml`, README "Analytics"

## Goals

A complete measure-collect-report loop for both docs sites (en, zh-CN) on top of the existing
GTM containers (en `GTM-MBBF2KR`, zh-CN `GTM-MBBL6Z9Q`):

1. Instrument the user actions that matter for the docs funnel (search, code copy, Ask-AI chat,
   TOC navigation, language switch, console CTAs, 404 landings) with a uniform GA4 event schema.
2. Keep the in-repo surface thin: theme code pushes to `window.dataLayer`; consent gating,
   container routing, and parameter registration live in the GTM/GA4 configuration.
3. Report search-origin 404s — pages Google still serves that now 404 — through a manual GA4
   Data API report, so stale search results can be closed out with nginx 301 redirects.

## Architecture

```
docs-ui components ──trackEvent()──▶ window.dataLayer ──▶ GTM container (per site)
                                                            ├─ GA4 event tags (11 triggers)
                                                            └─ Consent Mode: en gated (default denied, tag-level
                                                               require-consent); zh ungated for now
GA4 property (en) ─┐
GA4 property (zh) ─┴─ ga4-search-404-report.js ──▶ Feishu report card + artifact + Explore funnels
```

The en navbar (`packages/docs-ui/src/en/theme/Navbar/Content`) is re-exported by
`shared/theme/Navbar/Content`, so navbar instrumentation covers zh-CN too; the zh-CN tree only
overrides the home page. GTM loads in dev as well — filter internal traffic in GA4 (Admin →
Data streams → configure internal traffic), not in code.

## Event schema

| Event | Params | Hook point |
|---|---|---|
| `ask_ai_open` | `trigger` = navbar\|selection\|code\|search\|dock\|keyboard\|url\|programmatic | `DocRoot/Layout/index.tsx` open/toggle funnels; dispatch sites pass `detail.trigger` |
| `ask_ai_query` | `query_chars`, `has_context`, `surface` = panel\|notfound | `ChatContext.tsx` `send` (single funnel for dock, panel, 404, search, `?chat=`) |
| `ask_ai_completed` | `status` = completed\|error, `duration_bucket`, `source_count`, `surface` | beside `chat.client.completed` / both `chat.client.error` sites in `send`; user aborts emit nothing |
| `ask_ai_feedback` | `rating` = up\|down, `surface` | `ChatContext.tsx` `rateFeedback` (covers ChatPanel and 404 thumbs) |
| `code_copy` | `code_language` | `CodeBlock/Layout/index.tsx` `CodeCopyButton` |
| (code Ask-AI rides `ask_ai_open` with `trigger=code` — not a separate event) | | `CodeBlock/Layout/index.tsx` `AskAiCodeButton` |
| `toc_click` | `heading_id`, `surface` = desktop\|mobile | `TOCItems/index.tsx` capture listener; `DocItem/TOC/Mobile/index.tsx` |
| `lang_switch` | `to_locale` = en\|ja-JP | en navbar `LanguageDropdown` (en site only) |
| `cta_click` | `cta_id` = signup\|login\|support, `cta_location` = navbar | en navbar external CTA links |
| `search_open` | `surface` = navbar\|mobile | en navbar `openSearch` |
| `page_not_found` | `requested_path` | `NotFound/Content/index.tsx` body-class effect |
| `search_result_clicked` | `search_term`, `result_path` | `shared/theme/Search/index.tsx` `goTo` (fallback local-search modal) |

Deliberate schema decisions:

- **No query text in GA4.** Ask-AI prompts carry company/internal-system names; GA4 params cap at
  100 chars and PII is a compliance hazard. Only `query_chars` crosses. `search_term` is sent only
  by the fallback search modal (standard GA4 practice for site search, which enhanced measurement
  does the same way); the production search providers are excluded (below).
- **Shared names across sites.** Locale is not a parameter; GA4 distinguishes by property. Never
  fork event names per site or bilingual funnels cannot be compared.
- **Derived funnel attributes stay out of dataLayer.** Trigger/surface are inferred at the funnel
  points (body class, event detail) rather than threaded through every component.

### Helper contract (`packages/docs-ui/src/shared/utils/analytics.ts`)

`trackEvent(name, params)` is a no-op without `window` (SSR/prerender), creates `window.dataLayer`
if GTM has not bootstrapped it yet, stringifies and truncates values to the GA4 100-char cap, drops
`undefined`/empty params, and strips the reserved `event` key from params. `durationBucket(ms)`
renders `<1s|1-3s|3-10s|10-30s|>30s`. GA4 event-name rules are the call sites' responsibility;
names here are fixed literals.

## GA4 configuration (operator)

Admin → Custom definitions — register so params appear in standard reports (standard property caps:
50 event dims / 25 user dims / 50 metrics; this uses ~12):

| Display name | Scope | Parameter | Type |
|---|---|---|---|
| Search term | Event | `search_term` | Dimension |
| Result path | Event | `result_path` | Dimension |
| Code language | Event | `code_language` | Dimension |
| Heading ID | Event | `heading_id` | Dimension |
| CTA ID | Event | `cta_id` | Dimension |
| CTA location | Event | `cta_location` | Dimension |
| Open trigger | Event | `trigger` | Dimension |
| Chat surface | Event | `surface` | Dimension |
| To locale | Event | `to_locale` | Dimension |
| Requested path | Event | `requested_path` | Dimension |
| Query chars | Event | `query_chars` | Metric (standard) |
| Source count | Event | `source_count` | Metric (standard) |
| Has context | Event | `has_context` | Dimension |

Key events (Admin → Events, mark as key event): `cta_click` (signup is the docs→console
conversion), `ask_ai_query`, `code_copy`. Adjust as product priorities change.

Enhanced measurement (Data streams): enable outbound clicks, scrolls, site search (search term
parameter `q` — covers zh-CN local search when its results page route `/search?q=` is hit),
downloads, video engagement. Do **not** enable enhanced page-view stripping that conflicts with
SPA history tracking.

Events marked as key events surface in the Data API as the `keyEvents` metric, which the daily
funnel reviews can pull alongside `eventCount` per `eventName`.

## GTM container wiring (operator, per container)

For each event above: one **Custom Event trigger** (event name = the GA4 event name) + one
**GA4 Event tag** whose Event Name maps 1:1 and whose Event Parameters reference Data Layer
Variables (`DLV_*`) of the same name. `page_view` for this SPA needs a GA4 Config tag on
**Initialization** plus a **History Change** trigger so client-side route changes emit page_view.

Consent Mode (decision updated 2026-09-20 after probing production):

- **en (docs.zilliz.com): consent-gated.** The banner scripts are NOT in the server HTML or this
  repo — a **GTM Custom HTML tag in the shared container GTM-MBBF2KR** injects
  `https://assets.zilliz.com/cookieconsent.js` + `https://assets.zilliz.com/zilliz.js` into
  `<body>` at runtime (vanilla cookieconsent v2.9.2; visibility toggles via the
  `show--consent` class on `<html>`). Its contract: `onFirstAction`/`onAccept`/`onChange` all
  push a bare `{event: 'consent_update'}`, and `window.cc.allowedCategory('analytics')` reports
  the recorded choice. GTM en container therefore gets: (1) a Consent Initialization Custom HTML
  tag running `gtag('consent','default',{analytics_storage:'denied', …})`, (2) a Custom HTML tag
  on the `consent_update` custom event that reads `window.cc.allowedCategory('analytics')` and
  calls `gtag('consent','update',{analytics_storage: granted ? 'granted' : 'denied'})`, (3) on
  every GA4 tag, Advanced Settings → Consent Settings → "Require additional consent for tag to
  fire" with `analytics_storage`, so denied users produce no hits at all rather than cookieless
  pings. **Banner flakiness owned by the same GTM tag:** repeated loads of the same page end in
  two different states (modal shown with `show--consent` on `<html>` vs hidden with the class
  missing) while the library itself has no auto-hide — consistent with the injecting tag firing
  more than once / racing itself. Before wiring the consent gate, the container owner should
  make the injection single-shot (one tag, one trigger, e.g. Init - All Pages); after that the
  banner persists until an explicit choice (verified by sampling + screenshot on a purged-cookie
  first visit). Remaining platform-script observation for the owner: the GPC branch
  `cc.accept(GPC ? ['necessary','analytics'] : [])` grants `analytics` to GPC users, which reads
  backwards; the banner copy ("By continuing to use our site, you agree…") also expresses
  implied consent, contradicting a hard gate.
  Until Consent Mode is configured, events fire unconditionally.
- **zh-CN (docs.zilliz.com.cn): ungated, deferred.** Production zh has no banner at all (the
  repo's `apps/docs/static/zh-CN/js/cookieconsent.js`/`zilliz.js` are not deployed there) and no
  GA4 tags yet; it keeps Baidu Analytics + HubSpot. A consent decision for zh is deferred until
  the banner deployment question is settled.

Blast radius and main-site findings (zilliz.com probing, 2026-09-20): **GTM-MBBF2KR is shared
between docs.zilliz.com and the corporate main site** (same container, same two GA4 streams,
`_ga` client id shared across hosts). www.zilliz.com has no consent gate either — the banner is
informational only: GA fires before any interaction, nothing consumes the `consent_update`
dataLayer event (no `gtag('consent', …)` calls anywhere), and the choice is only recorded in the
`zilliz_cookie_consent` cookie. The banner copy ("By continuing to use our site, you agree…")
expresses implied consent, which contradicts a hard gate and needs updating platform-side.
Consequences for rollout: (1) adding a Consent Default (denied) tag to GTM-MBBF2KR affects every
site using that container, so the main-site/marketing analytics owners must sign off and GA on
those sites switches to cookieless modeling until users accept; (2) tag-level require-consent
should be rolled out per-tag, not big-bang; (3) the `consent_update` event fires twice per first
action (`onFirstAction` + `onAccept`) — the consumer tag must be idempotent (a plain
`gtag('consent','update')` is).

Verification: GTM Preview + GA4 DebugView (enable debug device), walk one happy path per event.

## Search scope decision

- en: search is the Inkeep modal — Inkeep's console is the analytics source of record; GA4 gets
  `search_open`/`ask_ai_*` only. Revisit if funnel mixing is ever required (cxkit callbacks).
- zh-CN: search is `@easyops-cn/docusaurus-search-local`. GA4 captures queries through enhanced
  measurement site search on the `q` parameter when the results route is used; the shared
  `SearchModal` fallback also emits `search_result_clicked`.

## Search-origin 404 reporting

`scripts/ga4-search-404-report.js` (zero-dependency: hand-built RS256 JWT via `node:crypto` →
OAuth2 token → GA4 Data API `runReport`): for each configured property, last N days (default 7) of
`page_not_found` events whose `pageReferrer` contains `google`, top 25 `pagePath`s by `eventCount`.
Writes `report.json` + `note.md` into the output dir; informational only (never fails the run —
a steady 404 trickle is normal, the note's top-path list is the action item).

`.github/workflows/ga4-search-404-report.yml`: dispatch-only until operators configure secrets,
then uncomment the schedule. Credential-gated: without `GA4_SERVICE_ACCOUNT_JSON` the run
degrades to a notice, not a failure. No content restore or site build — this is a pure API pull.
Feishu report card + artifact (14 days) follow the external-link-watchdog pattern, including the
`FEISHU_NOTIFICATIONS_DISABLED` kill switch.

Operator setup:

1. Create a service account with the **Viewer** role (or the Analytics Read-only IAM role) on both
   GA4 properties; store its JSON key in the repo secret `GA4_SERVICE_ACCOUNT_JSON`.
2. Add repo variables `GA4_PROPERTY_ID_EN`, `GA4_PROPERTY_ID_ZH_CN` (numeric property IDs).
3. Trigger the workflow once, confirm the Feishu card and artifact, then enable the schedule.
4. Remediation loop: for recurring top paths, add `return 301` rules in `deploy/{en,zh-CN}/nginx.conf`
   (precedent: the "Analytics-derived 404 cleanup" blocks) with the redirect assertions in
   `deploy/contracts/container.test.mjs`.

A host-side nginx access-log 404 analysis (crawler coverage, non-GA traffic) needs host log access
and is intentionally out of scope; the GA4 report covers real search-origin user 404s.

## Verification

- `pnpm vitest run packages/docs-ui/src/shared/utils/analytics.test.ts packages/docs-ui/src/shared/components/ChatPanel/ChatContext.test.tsx packages/docs-ui/src/shared/theme/Search/index.test.tsx`
- `node --test scripts/ga4-search-404-report.test.js scripts/ga4-search-404-report-workflow.test.js`
- `pnpm test:for-change` over the full diff (matrix entries `docs-ui-analytics`, `ga4-search-404-report-tooling`, `workflow-yaml`), `pnpm test:workflow-policy`, `pnpm typecheck`, `git diff --check`
- Post-deploy: GTM Preview + DebugView per event; then GA4 realtime during rollout.

## Out of scope

GTM/GA4 container configuration itself (external UI, steps above), host-side nginx log analysis,
a publish-gate forcing nginx 301s for deleted/renamed slugs (separate task — the legacy v3.0.0
push-gate is the model), Inkeep search instrumentation in GA4, FeedbackBox (UAT/localhost-only).
