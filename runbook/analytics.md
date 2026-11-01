# Analytics

Both sites measure user actions (Ask-AI chat funnel, code copy, TOC navigation, console CTA clicks, 404 landings) through GTM into GA4. Theme code only pushes events to `window.dataLayer` via `trackEvent` in `packages/docs-ui/src/shared/utils/analytics.ts`; consent gating, trigger/tag wiring, custom definitions, and key events live in the GTM containers (en `GTM-MBBF2KR`, zh-CN `GTM-MBBL6Z9Q`) and the GA4 properties. The English site's search events (`search_performed`, `search_result_clicked`) come from Inkeep's modal through the `baseSettings.onEvent` bridge in `packages/docs-ui/src/en/inkeepEventBridge.ts` — the docs-ui search modal swizzle is not part of either production bundle. The full event schema, the GA4/GTM setup steps, and the container-side Consent Mode decision are specified in `.claude/specs/2026-09-20-docs-analytics-and-search-404-design.md` and `.claude/specs/2026-10-14-docs-behavior-analytics-phase2.md`.

## Search-origin 404 report

`ga4 search 404 report` (`.github/workflows/ga4-search-404-report.yml`) lists the pages that Google search results still point at which now return 404 — the `page_not_found` events whose referrer was Google, per site, for a sliding window. It is scheduled daily at 03:17 UTC and can also be dispatched manually. Until the GA4 access below is configured, every run degrades to a notice instead of failing:

1. Create a service account with read-only access to both GA4 properties and store its JSON key in the repository secret `GA4_SERVICE_ACCOUNT_JSON`.
2. Add the repository variables `GA4_PROPERTY_ID_EN` and `GA4_PROPERTY_ID_ZH_CN` (numeric GA4 property IDs); at least one is required.
3. Dispatch the workflow once and verify the Feishu card and the report artifact — the daily schedule then picks up the same configuration automatically.

Without the secret and property variables the run degrades to a notice instead of failing. Remediation for recurring paths is an nginx `return 301` in `deploy/{en,zh-CN}/nginx.conf` with a matching redirect assertion in `deploy/contracts/container.test.mjs` — the same pattern as the existing "Analytics-derived 404 cleanup" blocks. Two invariants keep a fixed English rule from regressing on another surface:

- **ja-JP mirrors.** Every English exact-match 301 needs a `/ja-JP`-prefixed twin in the same conf unless the twin is withheld on purpose (the ja page is still live and the mirror would shadow it). The twins of the 2026-10-31 batch were production-probed so no twin chains into a second 404; the drift test in `container.test.mjs` fails when a new English rule lands without its twin, and withheld twins are recorded in its `JA_MIRROR_EXEMPTIONS` list with a reason.
- **SPA fallback coverage.** The 404 page's client-side redirect map (in-app SPA clicks never reach nginx) is derived at config load from the same nginx conf by `apps/docs/src/config/nginxRedirectRules.ts`, so no separate SPA rule list needs maintenance. Whole-version retirements that use regex `location ~` rules stay nginx-only — the SPA map intentionally covers exact-match rules.

## Engagement funnel report

`ga4 engagement report` (`.github/workflows/ga4-engagement-report.yml`) collects the tracked dataLayer events the 404 report does not cover — the search funnel (`search_open`, `search_performed`, `search_result_clicked`), the Ask-AI funnel (`ask_ai_open`, `ask_ai_query`, `ask_ai_completed`, `ask_ai_feedback`, `ai_source_click`, `chat_message_copy`), page engagement (`code_copy`, `doc_feedback`, `toc_click`), and navigation/conversion (`lang_switch`, `cta_click`) — as per-event totals plus GA4 key-event counts for each site. It is scheduled weekly Monday 04:17 UTC and can also be dispatched manually. It reuses the same `GA4_SERVICE_ACCOUNT_JSON` plus property-variable setup as the 404 report, so no extra operator configuration is needed. Like the 404 report it is informational only; the signal to watch is an event whose count stays 0 across runs, which means the instrumentation or its GTM trigger went quiet.

## Periodic GA4 console reconciliation

The two scheduled reports start from what the docs site sends. Reconcile them against the GA4 console itself about once a month so a silent report or a missed instrumentation surface cannot hide:

1. In each GA4 property, compare the 404 landing share and the top 404 pages against the latest `ga4 search 404 report` artifact. A page trending in the console but absent from the report means the report's Google-referrer or window filter is missing it — investigate the report before touching content.
2. Japanese 404 paths are usually redirect-rule gaps, not missing pages: probe the target before assuming content is absent — a miss returns a real HTTP 404 whose `<title>` is the Page Not Found title, while a live page returns 200 with its own title (curl needs `--compressed`; responses are gzip-encoded). A live target means the missing piece is a `/ja-JP` mirror 301.
3. Audit mirror coverage against the ja-JP twin invariant documented under the search-origin 404 report above — anything beyond its recorded `JA_MIRROR_EXEMPTIONS` list is a gap.
4. Feed confirmed recurring paths into the remediation path documented above (nginx `return 301` + matching redirect assertion), and let the next daily report confirm the counts decay.
