# Docs behavior analytics — phase 2 design (v2)

Date: 2026-10-14 (v2 rewrite after GTM batch go-live; supersedes v1 same day)
Status: design approved direction, not implemented
Owner surface: `packages/docs-ui` (+ GTM/GA4 operator config)

## Baseline as of this rewrite (what changed since v1)

- **5 of 11 phase-1 events are live in GA4** (GTM published 2026-10-14, verified
  against the live container): `page_not_found`, `ask_ai_feedback`,
  `search_open`, `search_result_clicked`, `code_copy` — all → `G-KKMVYG8YF2`.
- Custom definitions registered: `surface`, `search_term`, `result_path`,
  `code_language`, `requested_path` (+ `rating` pre-existed and is reused).
  A GTM Data Layer variable reading `rating` already exists and is wired into
  the `ask_ai_feedback` tag.
- AI Assistant Console owns everything inside Ask AI conversations (raw
  transcripts, auto-scored badcases, weekly LLM intent mining). Ask-AI raw
  text never goes to GA4.
- The docs search modal is **custom** (`Search/index.tsx` + `useSearch`,
  endpoint derived from the chat endpoint) — result counts are client-visible.
- `search_term` raw text is already flowing to GA4 via the live
  `search_result_clicked`; the v1 "privacy ruling pending" is effectively
  settled as *collect* (keyword input, industry standard). Enhanced-measurement
  site search stays OFF (modal search never navigates a `?q=` URL anyway).

## Workstream A — `doc_feedback` (committed: new UI + event)

Page-level "was this page helpful" 👍/👎. The only explicit per-page quality
signal; console covers AI-scope only, `code_copy` is merely implicit-positive.

- **Component**: new `DocFeedback` in shared theme; mount at the bottom of the
  TOC column — in `DocItem/Layout`, right after the `tocScroll` block
  (`tocCol → tocCopyPage (Copy page / Contact Sales) → tocScroll (TOC) →
  DocFeedback`). Frameless (no card): muted question line plus two icon-only
  square chips using the `--zd-surface-2/3` tokens, so it reads as part of the
  right rail rather than a boxed widget. Sticky sidebar keeps it visible
  throughout reading, which out-performs a content-bottom widget (many readers
  never reach the page end, and the bottom is already crowded by the paginator
  + Ask-AI bar).
- **Site gating**: rendered on the `en` site only
  (`resolveDocsUiSite(...) === 'en'`). zh-CN has no GA property and no GA4 tag
  in its container, so a vote there would lock the browser out while the data
  goes nowhere; re-enable when zh gets a real destination (Baidu event layer
  or self-hosted analytics — separate decision).
- **Coverage trade-off (accepted for v1)**: the TOC column renders only when
  `showDesktopTOC` (desktop AND page has a TOC) — mobile and TOC-less pages
  get no widget. If mobile votes prove material later, add a second mount of
  the same component at the end of `<article>` shown only on mobile via the
  existing `windowSize` breakpoint logic (localStorage dedupe already prevents
  double-counting).
- **UX**: question + two icon buttons (lucide `ThumbsUp`/`ThumbsDown`,
  matching the Ask-AI feedback visual language); after voting, buttons lock
  with the chosen state and a short thanks. **One vote per page per browser**
  (localStorage `zd_doc_feedback_voted:<pathname>`), no vote-changing in v1.
- **i18n**: add `docFeedback: {question, helpful, notHelpful, thanks}` to
  every locale in `uiText.ts`.
- **Event**: `trackEvent('doc_feedback', {rating: 'up' | 'down'})` —
  **rating only**. No `page_path` param: GA4 auto-collects `pagePath` on the
  hit, and the `rating` parameter reuses the existing DLV + GA4 dimension.
  Zero new GA4-side config; zh site pushes harmlessly into a container with
  no GA4 tags (no-op until zh GA exists).
- **No backend**: GA4 is the durable record — consistent with the
  chat-proxy `/api/feedback` retirement decision for `ask_ai_feedback`.
- **GTM**: 1 trigger (`CE - doc_feedback`) + 1 tag (GA4 Event,
  `G-KKMVYG8YF2`, `rating = {{rating}}`) — same recipe as `ask_ai_feedback`.

## Workstream B — `search_performed` (highest analytics value)

Closes the funnel gap: "query executed → N results → clicked / not clicked".
Zero-result and zero-click queries are the most direct content-planning input,
and only the client can see them (the console does not surface search).

- **Insertion**: `SearchModal` on the `loading` → settled transition for a
  non-empty query; dedupe per distinct query string per modal-open
  (as-you-type must not fire per debounce tick).
- **Params**: `search_term` (raw, settled), `result_count`, `surface: 'modal'`.
- **GA4**: register `result_count` as a custom **metric** (Integer, Event
  scope) — it is numeric. `search_term`/`surface` dimensions exist.
- **GTM**: 1 trigger + 1 tag; needs one new DLV (`result_count`).

## Workstream C — `ai_source_click`

Clicks on the source chips attached to Ask AI answers. "Low-scored answer AND
nobody opens the cited doc" is the strongest doc-gap compound signal.

- **Insertion**: the shared sources-row renderer used by ChatPanel and the
  404-page card (extract/share if duplicated).
- **Params**: `surface`, `source_index`, `source_host` (host only — keeps the
  100-char cap safe, avoids full-URL noise).
- **GTM**: 1 trigger + 1 tag; new DLVs `source_index`, `source_host`.

## Explicitly rejected (unchanged)

- `version_switch`: no switcher component exists; slice the auto `pagePath`
  dimension by `/docs/vX.Y/` segments instead.
- Scroll-depth tiers: automatic `scroll` + `user_engagement` suffice.
- More `ask_ai_*` count events in GA4: console owns the domain; only add if a
  channel/device join analysis is ever requested.

## Phase-2 config checklist (operator, after code ships)

| Object | GTM | GA4 |
|---|---|---|
| doc_feedback | CE trigger + GA4 Event tag (rating) | — |
| search_performed | CE trigger + tag (search_term, result_count, surface) | custom metric `result_count` |
| ai_source_click | CE trigger + tag (surface, source_index, source_host) | dimensions `source_index`, `source_host` |

## Test / matrix obligations

- `docs-ui-analytics` matrix entry covers all docs-ui analytics changes.
- Extend `analytics.test.ts` for every new `trackEvent` call site; component
  test for `DocFeedback` (render, i18n, one-vote lockout, event fire).
- `pnpm test:for-change -- <changed paths>` for the full diff of each PR.

## Delivery plan

1. PR-1: `doc_feedback` (component + i18n + tests) — self-contained feature.
2. PR-2: `search_performed` + `ai_source_click` — analytics-only, one diff.
3. After ~2 weeks of accumulation: phase-3 weekly digests via the GA4 Data API
   + GitHub Actions pattern already proven by the 404 report
   (down-voted pages, zero-result queries, top-copied code blocks).

## Follow-ups parked

- Merge PR #723 (404 report daily schedule) — repo-side leftover from phase 1.
- Optional GTM tier for remaining 6 phase-1 events (`cta_click`,
  `lang_switch`, `toc_click`, `ask_ai_open/query/completed`) — same recipe.
