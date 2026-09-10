# ja-JP sidebar + site navigation translation fix

Investigation date: 2026-09-10. Live site inspected with playwright: `https://docs.zilliz.com/ja-JP/docs/home`.

## Collected from the live ja-JP site

### Guides sidebar (section dropdown + secondary pane, all 8 sections)

- 80/80 category labels render in English (sections have no page, so no localized
  front matter; Docusaurus falls back to the English `label` baked into
  `generated/en/sidebars/*.sidebar.js` because the locale JSON is absent).
- 8/8 top-level section names (dropdown) are English: Get Started, Development,
  Management, Client Libraries, Tools, AI Models, Architecture, Solution.
- 137/348 doc labels are English — these are untranslated pages (Translation
  pipeline coverage), NOT a sidebar mechanism problem. Out of scope here.

### Top navbar

English strings on ja-JP: `Docs`, `Zilliz-Managed Cloud`, `Bring Your Own Cloud`,
`API & SDK` (dropdown trigger), `Releases`, `Search`, `Ask AI`, `Support`,
`Log In`, `Sign Up Free`. Reference/SDK dropdown contents are explicitly out of
scope per request.

Full raw collection: `/tmp/zdoc-ja-sidebar-full.json`, `/tmp/en-cats.json`,
`/tmp/en-docs.json`.

## Root causes (verified)

1. `origin/dev` has no `i18n/ja-JP/docusaurus-plugin-content-docs/current.json`
   nor the `-byoc` sibling. Docusaurus 3.10.2 translates category labels only via
   `sidebar.<sidebarName>.category.<item.key ?? item.label>` in those files
   (`@docusaurus/plugin-content-docs/src/translations.ts`).
2. `scripts/docs-workflow/generate-ja-sidebar-labels.js` (added in 25106c8fc1
   together with `config/translation/ja-JP-sidebar-labels.json`) is invoked by
   nothing — no workflow, no package script. Its output must ride to `dev`
   through the ja Guides publication allowlist (`offline-guides-publication.js`
   `SIDEBAR_PATHS`).
3. The Feishu sheet restructured Management/Schema sections: `origin/dev`'s
   generated sidebars carry 20 new category keys (plus 2 byoc-specific) that the
   dictionary does not cover; 14 old keys on `master` are gone on `dev`.
   Dictionary coverage vs `dev`: guides 21 missing, byoc 19 missing → 22 unique
   new entries needed (see below).
4. Navbar UI chrome comes from `packages/docs-ui/src/shared/i18n/uiText.ts`,
   selected by `customFields.site` ('en' | 'zh-CN') — no Japanese variant, no
   locale dimension (`useDocusaurusContext().i18n.currentLocale`). Secondary nav
   item labels ('Zilliz-Managed Cloud' etc.) render raw from
   `packages/site-config/src/sites/en.ts` `navigation.secondaryItems`.

## Implementation steps

Status 2026-09-10: Step A done (dictionary 92→114 entries) and Step C done via the
repo-internal route (Japanese `uiText` dictionary selected by `i18n.currentLocale`,
`localizeNavLabel` mapping for secondary navbar labels, matrix entry
`docs-ui-ui-text` added). Step B (publish current.json to dev via the next ja
Guides candidate) and Step D (wire the generator into the publication chain)
remain open. Reference/SDK scopes excluded per request.

### A. Dictionary additions (master PR, review required on the Japanese copy)

Add 22 entries to `config/translation/ja-JP-sidebar-labels.json` `labels`
(proposals; keys verified against `origin/dev` generated sidebars):

| key | English | proposal |
| --- | --- | --- |
| category:tutorials/solution | Solution | ソリューション |
| category:tutorials/solution/schema-evolution | Schema Evolution | スキーマ進化 |
| category:tutorials/development/search-and-query/struct-array-search | Search with StructArray | StructArray での検索 |
| category:tutorials/development/collection/collection-on-console | Collection on Console | コンソールでのコレクション操作 |
| category:tutorials/development/schema/json-fields | JSON Field | JSON フィールド |
| category:tutorials/development/schema/struct-array | StructArray | StructArray |
| category:tutorials/development/spark-batch-jobs | Spark Batch Jobs | Spark バッチジョブ |
| category:tutorials/development/function/text-embedding-funcs | Text Embedding Functions | テキスト埋め込み関数 |
| category:tutorials/development/analyzer/analyzer-tokenizers | Tokenizer | トークナイザー |
| category:tutorials/management/clusters/on-demand-compute | On-Demand Cluster | On-Demand クラスター |
| category:tutorials/management/migrations/migrate-from-external-sources | Migration from External Sources | 外部ソースからの移行 |
| category:tutorials/management/metrics-alerts | Metrics & Alerts | メトリクスとアラート |
| category:tutorials/management/metrics-alerts/observability-integrations | Observability Integrations | オブザーバビリティ統合 |
| category:tutorials/management/identity-management | Identity Management | アイデンティティ管理 |
| category:tutorials/management/identity-management/manage-cluster-users | Manage Cluster Users | クラスターユーザーの管理 |
| category:tutorials/identity-management/single-sign-on | Single Sign-on (SSO) | シングルサインオン（SSO） |
| category:tutorials/management/identity-management/scim-provisioning | SCIM Provisioning | SCIM プロビジョニング |
| category:tutorials/management/access-control/manage-cluster-roles | Manage Cluster Roles | クラスターロールの管理 |
| category:tutorials/management/access-control/privilege-reference | Privilege Reference | 権限リファレンス |
| category:tutorials/management/billing-management/separate-billing | Separate Billing by Marketplace Account | マーケットプレイスアカウント別の請求 |
| category:tutorials/deployment/deploy-byoc-i-aws | Deploy BYOC-I on AWS | AWS での BYOC-I デプロイ |
| category:tutorials/get-started/release-notes | Release notes (byoc only) | リリースノート |

Notes: guides' legacy shim converts Release notes into a keyless link whose
dictionary entry (`Release notes` → リリースノート) already exists; the byoc shim
does not convert it, so the category entry is still required. Old keys that exist
only on `master` can stay in the dictionary until the next sync retires them.

Validation: `pnpm test:for-change -- config/translation/ja-JP-sidebar-labels.json`
(→ `node --test scripts/docs-workflow/generate-ja-sidebar-labels.test.js`).

### B. Publish the locale JSON to dev

Run `node scripts/docs-workflow/generate-ja-sidebar-labels.js` (against a
workspace whose `generated/en` matches the intended dev state) and include the
two `current.json` files in the next ja Guides publication — the offline
candidate path (`publish-offline-translation.yml`) already allowlists exactly
these paths; a labels-only candidate is NOT valid (`expectedMdxCount >= 1`), so
they must ride along with a translation batch. Never commit them to `master`
(`i18n` is dev-owned).

### C. Navbar / UI chrome (separate master PR, code change)

1. Add a Japanese dictionary to `packages/docs-ui/src/shared/i18n/uiText.ts` and
   select it by locale: `useDocusaurusContext().i18n.currentLocale === 'ja-JP'`
   (keep site fallback). Covers `Docs/Search/Ask AI/Support/Log In/Sign Up
   Free` + breadcrumbs + sidebar aria labels.
2. Localize secondary nav labels (`Zilliz-Managed Cloud`, `Bring Your Own
   Cloud`, `API & SDK`, `Releases`) — smallest consistent option: an
   English→Japanese mapping in the same dictionary consumed by
   `packages/docs-ui/src/en/navigation/SecondaryNavbar/index.tsx` (pattern:
   existing `search.sections` + `localizeSearchSection`). Skip the API & SDK
   dropdown contents (out of scope).
3. Tests: extend `uiText` unit tests + run
   `pnpm test:for-change -- packages/docs-ui/...`; then `pnpm build:en` and
   check `build/en/ja-JP/docs/home.html` (site-validation already asserts this
   path exists).

### D. Wire the generator so this does not regress

Add a step that runs `generate-ja-sidebar-labels.js` (fail-closed on missing
keys) in the ja Guides publication finalize path, or an explicit runbook
paragraph + CI check. Without this, every Feishu section restructure silently
re-breaks the ja sidebar until someone reruns the generator manually.

## Out of scope (per request)

- Reference/SDK sidebars (`packages/site-config/src/sidebars/en/reference.ts`,
  135 keyed categories) and the `docusaurus-plugin-content-docs-reference`
  plugin locale files.
- Translating the 137 English doc pages (Translation pipeline batches).
