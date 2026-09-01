---
name: zdoc-feishu-doc-publish
description: Use when asked to publish Zilliz docs from Feishu/Lark doc links to UAT or production, especially requests like "@bot 请帮我发布以下文档到 UAT" with Feishu doc/wiki links. Also covers single-doc publish to a version branch, Japanese (ja-JP) offline retranslation, sidebar and localization-inventory regeneration, and the Jenkins version-branch release.
---

# ZDoc Feishu Doc Publish

## Purpose

Follow this for the final deployment stage after document content is updated and approved: single-doc pull from Feishu, Japanese retranslation, sidebar/inventory regeneration, commit/push, and Jenkins publish. It is not for syncing SDK sources wholesale, drafting or verifying content, or planning code-example changes; route those requests to zdoc-local-doc-ops. For an explicit publish request, resolve the Feishu links through the manual root Base, update docs in the correct branch, build and check the site, preserve unfixed issues, and trigger Jenkins publishing.

## Branch And Environment Rules

- UAT maps to branch dev and publish URL https://docs.cloud-uat3.zilliz.com.
- production maps to a version branch named like vX.X.X. Do not publish production from dev.
- A version branch is forked from dev, re-published repeatedly over its lifetime, and archived to a tag at end of cycle. There is no online version routing; rebuilding the branch updates live docs.
- master is for plugin/script checks only; do not use it as a docs publishing branch.
- Link checks compare the local build against production: LINK_CHECKS_REMOTE_BASE_URL=https://docs.zilliz.com.

### Version branch lifecycle

Create the version branch from refreshed dev:

```bash
git fetch origin dev
git switch -c vX.X.X origin/dev
git push -u origin vX.X.X
```

Later Feishu edits flow as single-doc pulls to vX.X.X, then re-publish the branch to update live docs. dev picks up the same content on its routine fetch. Archive the branch to a tag at end of cycle:

```bash
git tag -a vX.X.X <sha> -m "archive vX.X.X"
git push origin refs/tags/vX.X.X
```

## Workflow

1. Extract every Feishu/Lark doc token from the request. Support /wiki/<token>, /docx/<token>, /doc/<token>, and encoded URLs.
2. Inspect config/lark-docs.config.ts to identify candidate manuals. Each manual defines root, base, sourceType, docSourceDir, targets, optional sidebarPath, and output dirs.
3. Use lark-cli base to locate each provided doc in the manual Base. Do not guess from URL alone.
4. Check out the target branch:
   - UAT: git fetch origin dev then git switch dev, or create a worktree from origin/dev.
   - Production: use the requested vX.X.X branch; fork it from origin/dev first if it does not exist.
5. Fetch and write only the requested docs in place with the standalone CLI (see Single-Doc Publish Commands).
6. For a single English doc publish, re-translate the corresponding Japanese (ja-JP) doc by dispatching a subagent for an offline translation update (see Japanese (ja-JP) Retranslation). Do not dispatch translate-codex.yml.
7. If the change adds, removes, or reorders docs, regenerate the sidebar and the localization input inventory (see Sidebar Regeneration and Localization Input Inventory).
8. Build and check: pnpm build:en (the EN site includes the Japanese mirror) and, if the change touches zh-CN, pnpm build:zh-CN. Run pnpm check:localization-input-inventory.
9. Fix build-breaking issues. Keep non-blocking or unresolved issues documented in the run summary rather than hiding them.
10. Commit and push the version branch (or dev for UAT). Explicit git add is required for promoted guides content.
11. Trigger Jenkins publishing for the target branch/commit (see Jenkins Publish).
12. Reply with the UAT/production URL, branch, commit SHA, changed files, fixed issues, and remaining issues.

## Local Bot Runtime Notes

- Prefer Feishu/Lark long-connection event delivery for local development. The bot host opens an outbound WebSocket to the open platform, so it does not need a public callback URL.
- The local machine still needs outbound internet access to Feishu/Lark, and the app must subscribe to im.message.receive_v1.
- React to matching messages immediately with the Typing emoji type (敲键盘) before doing Base lookup or builds.
- Serialize execute-mode publish jobs. Do not run two branch switches, doc fetches, builds, or Jenkins triggers concurrently in the same checkout.
- Refuse execute mode on a dirty worktree unless the operator explicitly opts in with DOC_PUBLISH_ALLOW_DIRTY_WORKTREE=1.
- Route with an agent only for interpretation and planning. The bot must still validate the selected skill, environment, branch, doc links, production approval, and Jenkins target.
- Never trust production approval from router output. Require an affirmative approval command on its own line in the original Feishu message; keep the release branch and document links on separate lines. Questions, denials, and conditional approval are not approval.
- Bound router/worker agent subprocesses with timeouts and output caps; if they fail or hang, reply in Feishu with the blocker.
- Run either --listen local or --listen sdk for one app subscription, not both, to avoid duplicate handling.

## Base Lookup

Use lark-cli with user identity unless the environment explicitly uses bot identity.

For each manual in config/lark-docs.config.ts:

- Parse base:
  - Ac7x...:* means base token Ac7x... and all tables.
  - D1Va... means base token D1Va...; list tables if the table is not known.
- List tables:

```bash
lark-cli base +table-list --base-token <base_token> --as user --format json
```

- Search likely doc fields in each table:

```bash
lark-cli base +record-search \
  --base-token <base_token> \
  --table-id <table_id_or_name> \
  --keyword <doc_token> \
  --search-field Docs \
  --field-id Docs \
  --field-id Slug \
  --field-id Targets \
  --field-id "Publish Targets" \
  --field-id Status \
  --field-id "Placement Type" \
  --limit 20 \
  --format json \
  --as user
```

If search misses a hyperlink token, page through records with projection and inspect the JSON for the token:

```bash
lark-cli base +record-list \
  --base-token <base_token> \
  --table-id <table_id_or_name> \
  --field-id Docs \
  --field-id Slug \
  --field-id Targets \
  --field-id "Publish Targets" \
  --field-id Status \
  --field-id "Placement Type" \
  --limit 200 \
  --format json \
  --as user
```

Continue with --page-token <next_page_token> while the response reports more pages.

Accept only canonical publish records unless the request explicitly asks for a section/ref/link. In this repo, canonical records usually have Placement Type = canonical, a Docs link, and a Slug.

## Manual Selection

Use the matching Base record to choose the manual. Common current manuals:

| Area | Current publish manual | Older/source-only manuals |
|---|---|---|
| Cloud guides | guides | none |
| Agents/prompts pages | guides（Tools 表） | none |
| Python SDK | pymilvus30 | python, pymilvus25, pymilvus26 |
| Java SDK | javaV230 | javaV2, javaV225, javaV226 |
| Node SDK | nodejs30 | node, nodejs25, nodejs26 |
| Go SDK | gov230 | gov226 |
| CLI | cliv14 | cliv13 |

For SDK/reference publishing, keep the older/source-only fetches only when the requested change needs fallback sources or the workflow is refreshing a full SDK set. For a listed Feishu doc link, prefer the current publish manual that contains the Base record.

### Guides targets

guides is a single manual with two targets, not two manuals:

- zilliz.saas -> SaaS (content/<site>/guides/tutorials)
- zilliz.paas -> BYOC (content/<site>/byoc/tutorials)

Target is usually derived from Base Targets: Zilliz.SaaS -> zilliz.saas, Zilliz.PaaS -> zilliz.paas. If both apply, run both targets.

## Single-Doc Publish Commands

Install deps if needed:

```bash
pnpm install --frozen-lockfile
```

The retired npx docusaurus fetch-lark-docs wrapper is gone (guarded by pnpm test:retirement). Use the standalone CLI. ZDOC_SITE defaults to en; set ZDOC_SITE=zh-CN for Chinese.

Targeted write for one listed doc:

```bash
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man <manual> -tar <target> -token <doc_token> -s3
```

Concrete one-doc publish commands:

```bash
# Guide doc to SaaS sources
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man guides -tar zilliz.saas -token <doc_token> -s3
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man guides -tar zilliz.saas -post -skipS

# Guide doc to PaaS/BYOC sources
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man guides -tar zilliz.paas -token <doc_token> -s3
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man guides -tar zilliz.paas -post -skipS

# SDK/reference doc
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man <sdk_manual> -tar zilliz -token <doc_token> -s3
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man <sdk_manual> -tar zilliz -post
```

Available options: -man/--manual, -token/--docToken, -tar/--pubTarget, -s3/--uploadToS3, -post/--postProcess, -skipS/--skipSourceDown, -skipI/--skipImageDown, -sidebar/--sidebarOnly, --sidebarTargets, --offline, --mediaManifest, -skipSidebar/--skipSidebar, --validateLinks, --linkShim.

The -token path pulls the subtree, writes it, and returns early, so it skips sidebar generation: a new doc is an orphan until the sidebar is regenerated (see Sidebar Regeneration).

## Where Content Lands

- SDK/reference: output dir is content/<site>/reference/... (tracked), no promote step needed.
- guides: guidesView output is tmp/docs-tooling/<site>/guides/content/<site>/guides/tutorials (SaaS) and tmp/docs-tooling/<site>/guides-byoc/content/<site>/byoc/tutorials (BYOC). These paths are gitignored and must be promoted.

### Promote guides content

```bash
cp -n tmp/docs-tooling/en/guides/content/en/guides/tutorials/<slug>.md* content/en/guides/tutorials/
cp -n tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials/<slug>.md* content/en/byoc/tutorials/
git add content/en/guides/tutorials content/en/byoc/tutorials
```

Explicit git add is mandatory because the parents are gitignored.

## Japanese (ja-JP) Retranslation

Single English doc publish requires re-translating the corresponding Japanese doc. Do this by dispatching a subagent for an offline translation update (equivalent to handing the doc to a person for offline translation). Do NOT dispatch the machine translate-codex.yml workflow for this step.

Contract (packages/docs-tooling/src/translation/targets.ts):

| Source | Target |
|---|---|
| content/en/guides/tutorials | i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials |
| content/en/byoc/tutorials | i18n/ja-JP/docusaurus-plugin-content-docs-byoc/current/tutorials |
| content/en/reference | i18n/ja-JP/docusaurus-plugin-content-docs-reference/current |

State cache: .translation-cache/ja-JP.json (files.<sourcePath>.{sourceHash,targetPath,translatedAt}).

Validation after retranslation:

```bash
pnpm docs-tooling validate-mdx --path i18n/ja-JP --check
pnpm docs-tooling validate-translation --target ja-JP --group <group>
pnpm build:en   # en mirror includes ja
```

<group> is one of guides, python, java, node, go, cli, cpp, rest, reference-landings.

## Sidebar Regeneration

Only when the change adds, removes, or reorders docs (structure change). A pure body edit does not need this.

SDK:

```bash
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  -man <sdk_manual> -tar zilliz --sidebarOnly --skipSourceDown
```

Guides (all four flags plus both targets are required):

```bash
ZDOC_SITE=en node packages/docs-tooling/src/lark/standalone-cli.js fetch-lark-docs \
  --manual guides --sidebarOnly --skipSourceDown --offline \
  --sidebarTargets zilliz.saas,zilliz.paas --mediaManifest <media_manifest_path>
```

Media manifest bootstrap for guides (a fresh checkout has no local meta/media-cache):

```bash
pnpm docs-tooling guides-source-config --site en --github-output /tmp/guides-en.env
source /tmp/guides-en.env
node scripts/docs-workflow/guides-media-prefetch.js \
  --source-dir "$source_dir" --output "$media_manifest_path" \
  --report packages/docs-tooling/src/lark/meta/reports/guides-media-prefetch.json \
  --snapshot packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json \
  --bootstrap-docs "content/en/guides,content/en/byoc" \
  --concurrency 4 --upload-mode skip --mode recovery --cache-state missing
```

The media prefetch needs APP_ID/APP_SECRET/FEISHU_HOST/SPACE_ID (and FIGMA_API_KEY for Figma). These are already in the repository root `.env`; load it with `set -a; source .env; set +a` before running the prefetch. If credentials are still unavailable, prefer CI instead of hand-run assembly.

### CI alternative for structure changes

For guides structure changes on a version branch, fetch-docs.yml is safer than hand-run assembly because it handles assembly/manifest/inventory:

```text
fetch-docs.yml group=guides publish=true target_branch=vX.X.X run_translations=false
```

target_branch accepts any existing branch; source_ref defaults to dev.

## Localization Input Inventory

pnpm check:localization-input-inventory byte-compares deploy/contracts/localization-inputs.inventory.json. Regenerate only when touching generated/en/sidebars/*, i18n/ja-JP/**, .translation-cache/ja-JP.json, or generated/zh-CN/sidebars/tools.sidebar.js. Pure content/en body edits do not change it.

```bash
pnpm generate:localization-input-inventory
pnpm check:localization-input-inventory
```

Jenkins also runs pnpm check:localization-input-inventory as a build gate, so the inventory must be committed with the change.

## Build Repair Rules

- Fix hard failures from pnpm build:en / pnpm build:zh-CN, MDX parsing, generated sidebars, missing imports, broken local routes, or invalid generated frontmatter.
- Prefer durable fixes in tooling, config overrides, or source docs generation logic over hand-editing generated output.
- If a generated doc must be patched to unblock UAT, record it as a temporary fix in the summary.
- Keep unresolved issues in a clear "Remaining issues" list with file/path, symptom, and reason not fixed.

## Jenkins Publish

The release pipeline contract is zdoc-release.groovy in the vdc-jenkins repo (zilliz-docs/zdoc-release.groovy). It is a unified pipeline: empty IMAGE_TAG builds from BRANCH, a non-empty IMAGE_TAG reuses existing images. Jenkins job URL: https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zdoc-release/.

Parameters:

- BRANCH: branch to build when IMAGE_TAG is empty (default master). Version branch publish uses BRANCH=vX.X.X.
- IMAGE_TAG: existing image tag to reuse; non-empty skips compile and Docker build.
- TARGET_ENVS: uat and/or prod.
- TARGET_SITES: oversea (EN site, includes ja) and/or cn (Chinese site).

Behavior:

- checkout uses branches: [[name: "*/${BRANCH}"]], so only branch refs work. After the version branch is archived to a tag, you cannot rebuild via BRANCH; reuse IMAGE_TAG or keep the branch.
- Build gates: pnpm install --frozen-lockfile and pnpm check:localization-input-inventory.
- EN image: deploy/en/Dockerfile (build:en, includes ja). CN image: deploy/zh-CN/Dockerfile.
- No version routing. Overlays: EN uat zdocs/overlays/uat3, CN uat zdocs-cn/overlays/ali-vdc-uat, EN prod zdocs/overlays/vdc-global, CN prod zdocs-cn/vdc-ali-global.
- Production deploys require an in-pipeline approval input; do not bypass it.

Version-branch publish:

```text
BRANCH=vX.X.X
IMAGE_TAG=<empty>
TARGET_ENVS=uat,prod
TARGET_SITES=oversea,cn
```

Re-publish after later single-doc updates by pushing new commits to vX.X.X and re-running with the same BRANCH and empty IMAGE_TAG; each run builds a fresh image from the branch head.

Record these request details in the Feishu reply or run log because Jenkins does not accept them as pipeline parameters:

```text
COMMIT_SHA=<current or approved sha>
REQUESTED_DOCS=<comma-separated Feishu links or tokens>
REQUESTED_BY=<Feishu user/open_id if available>
```

Do not trigger production until the user or authorized reviewer approves the UAT URL.

## Final Reply Format

Reply concisely in Feishu:

```text
已发布到 UAT:
- URL: <uat url>
- Branch: dev
- Commit: <sha>
- Docs: <titles or tokens>
- Fixed: <short list>
- Remaining issues: <short list or "None">
- Jenkins: <build url>
```

For a version-branch production publish, replace the URL/branch lines accordingly.

If blocked, reply with the blocker, the last successful step, and the exact command/log path to inspect.

## Safety

- Do not use master for UAT or production docs publishing.
- Do not publish docs that are not found in the manual root Base.
- Do not silently switch manual or target when multiple Base records match; ask for clarification.
- Do not print Feishu, AWS, model, or Jenkins secrets.
- Do not delete generated directories wholesale during targeted publish unless running the full workflow intentionally.
- Do not dispatch translate-codex.yml for ja-JP updates covered by this skill; use the offline subagent retranslation path.
