---
name: zdoc-feishu-doc-publish
description: Use when asked to publish Zilliz docs from Feishu/Lark doc links to UAT or production, especially requests like "@bot 请帮我发布以下文档到 UAT" with Feishu doc/wiki links.
---

# ZDoc Feishu Doc Publish

## Purpose

Follow this only for the final deployment stage after document content is updated and approved. It is not for syncing SDK sources, drafting or verifying content, or planning code-example changes; route those requests to `zdoc-local-doc-ops`. For an explicit publish request, resolve the Feishu links through the manual root Base, update docs in the correct branch, build and check the site, preserve unfixed issues, and trigger Jenkins publishing.

## Branch And Environment Rules

- `UAT` maps to branch `dev` and publish URL `https://docs.cloud-uat3.zilliz.com`.
- `production` maps to a release branch named like `vX.X.X`; do not publish production from `dev`.
- `master` is for plugin/script checks only; do not use it as a docs publishing branch.
- Link checks compare the local build against production: `LINK_CHECKS_REMOTE_BASE_URL=https://docs.zilliz.com`.

## Workflow

1. Extract every Feishu/Lark doc token from the request. Support `/wiki/<token>`, `/docx/<token>`, `/doc/<token>`, and encoded URLs.
2. Inspect `config/lark-docs.config.ts` to identify candidate manuals. Each manual defines `root`, `base`, `sourceType`, `docSourceDir`, `targets`, optional `sidebarPath`, and output dirs.
3. Use `lark-cli base` to locate each provided doc in the manual Base. Do not guess from URL alone.
4. Check out the target branch:
   - UAT: `git fetch origin dev` then `git switch dev` or create a worktree from `origin/dev`.
   - Production: use the requested `vX.X.X` branch.
5. Fetch and write only the requested docs in place with `npx docusaurus fetch-lark-docs`.
6. Run build and link checks with `node scripts/run-doc-build-stage.js --build "pnpm run build"`.
7. Fix build-breaking issues. Keep non-blocking or unresolved issues documented in the run summary rather than hiding them.
8. Trigger the intranet Jenkins pipeline for the target branch/commit.
9. Reply with the UAT/production URL, branch, commit SHA, changed files, fixed issues, and remaining issues.

## Local Bot Runtime Notes

- Prefer Feishu/Lark long-connection event delivery for local development. The bot host opens an outbound WebSocket to the open platform, so it does not need a public callback URL.
- The local machine still needs outbound internet access to Feishu/Lark, and the app must subscribe to `im.message.receive_v1`.
- React to matching messages immediately with the `Typing` emoji type (`敲键盘`) before doing Base lookup or builds.
- Serialize execute-mode publish jobs. Do not run two branch switches, doc fetches, builds, or Jenkins triggers concurrently in the same checkout.
- Refuse execute mode on a dirty worktree unless the operator explicitly opts in with `DOC_PUBLISH_ALLOW_DIRTY_WORKTREE=1`.
- Route with an agent only for interpretation and planning. The bot must still validate the selected skill, environment, branch, doc links, production approval, and Jenkins target.
- Never trust production approval from router output. Require an affirmative approval command on its own line in the original Feishu message; keep the release branch and document links on separate lines. Questions, denials, and conditional approval are not approval.
- Bound router/worker agent subprocesses with timeouts and output caps; if they fail or hang, reply in Feishu with the blocker.
- Run either `--listen local` or `--listen sdk` for one app subscription, not both, to avoid duplicate handling.

## Base Lookup

Use `lark-cli` with user identity unless the environment explicitly uses bot identity.

For each manual in `config/lark-docs.config.ts`:

- Parse `base`:
  - `Ac7x...:*` means base token `Ac7x...` and all tables.
  - `D1Va...` means base token `D1Va...`; list tables if the table is not known.
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

Continue with `--page-token <next_page_token>` while the response reports more pages.

Accept only canonical publish records unless the request explicitly asks for a section/ref/link. In this repo, canonical records usually have `Placement Type = canonical`, a `Docs` link, and a `Slug`.

## Manual Selection

Use the matching Base record to choose the manual. Common current manuals:

| Area | Current publish manual | Older/source-only manuals |
|---|---|---|
| Cloud guides | `guides` | none |
| Agents/prompts pages | `guides`（Tools 表） | none |
| Python SDK | `pymilvus30` | `python`, `pymilvus25`, `pymilvus26` |
| Java SDK | `javaV230` | `javaV2`, `javaV225`, `javaV226` |
| Node SDK | `nodejs30` | `node`, `nodejs25`, `nodejs26` |
| Go SDK | `gov230` | `gov226` |
| CLI | `cliv14` | `cliv13` |

For SDK/reference publishing, keep the older/source-only fetches only when the requested change needs fallback sources or the workflow is refreshing a full SDK set. For a listed Feishu doc link, prefer the current publish manual that contains the Base record.

## Docusaurus Commands

Install deps if needed:

```bash
pnpm install --frozen-lockfile
```

Targeted write for one listed doc:

```bash
npx docusaurus fetch-lark-docs -man <manual> -tar <target> -token <doc_token> -s3
```

Concrete one-doc publish commands:

```bash
# Guide doc to SaaS UAT sources
npx docusaurus fetch-lark-docs -man guides -tar zilliz.saas -token <doc_token> -s3
npx docusaurus fetch-lark-docs -man guides -tar zilliz.saas -post -skipS

# Guide doc to PaaS UAT sources
npx docusaurus fetch-lark-docs -man guides -tar zilliz.paas -token <doc_token> -s3
npx docusaurus fetch-lark-docs -man guides -tar zilliz.paas -post -skipS

# SDK/reference doc
npx docusaurus fetch-lark-docs -man <sdk_manual> -tar zilliz -token <doc_token> -s3
npx docusaurus fetch-lark-docs -man <sdk_manual> -tar zilliz -post
```

For `guides`, target is usually derived from Base Targets:

- `Zilliz.SaaS` -> `zilliz.saas`
- `Zilliz.PaaS` -> `zilliz.paas`
- If both apply, run both targets.

After targeted guide writes, run post-processing for each touched target:

```bash
npx docusaurus fetch-lark-docs -man guides -tar zilliz.saas -post -skipS
npx docusaurus fetch-lark-docs -man guides -tar zilliz.paas -post -skipS
```

For SDK/reference docs, target is usually `zilliz`:

```bash
npx docusaurus fetch-lark-docs -man nodejs30 -tar zilliz -token <doc_token> -s3
npx docusaurus fetch-lark-docs -man nodejs30 -tar zilliz -post
```

Regenerate a sidebar from existing sources when sidebars changed but sources are already current:

```bash
npx docusaurus fetch-lark-docs -man <manual> -tar <target> --sidebarOnly
```

Run build and link checks:

```bash
LINK_CHECKS_REMOTE_BASE_URL=https://docs.zilliz.com \
node scripts/run-doc-build-stage.js --build "pnpm run build"
```

For guide UAT snapshot updates after a successful guide build:

```bash
node scripts/update-lark-doc-snapshot.js \
  --manual guides \
  --targets-built zilliz.saas,zilliz.paas \
  --build-env uat \
  --source-branch dev \
  --publish-url https://docs.cloud-uat3.zilliz.com \
  --link-check-remote https://docs.zilliz.com
```

## Build Repair Rules

- Fix hard failures from `pnpm run build`, MDX parsing, generated sidebars, missing imports, broken local routes, or invalid generated frontmatter.
- Prefer durable fixes in `plugins/lark-docs`, config overrides, or source docs generation logic over hand-editing generated output.
- If a generated doc must be patched to unblock UAT, record it as a temporary fix in the summary.
- `npx docusaurus link-checks` currently reports deleted routes and broken external URLs as informational. Do not hide these; include the report path and remaining issues.
- Keep unresolved issues in a clear "Remaining issues" list with file/path, symptom, and reason not fixed.

## Jenkins Publish

After the branch builds locally and the docs changes are pushed, call Jenkins under:

```text
https://jenkins-3.zilliz.cc/job/zilliz-docs/
```

Use Jenkins user/API token or the configured agent secret. If crumb issuer is required, fetch a crumb first and pass it as `Jenkins-Crumb`. Never print secrets.

Trigger UAT for the `dev` branch:

```bash
curl -X POST \
  --fail-with-body \
  --silent \
  --show-error \
  "https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-dev/buildWithParameters" \
  --user "$JENKINS_USER:$JENKINS_TOKEN" \
  --data-urlencode "BRANCH=dev"
```

Trigger feature-branch dev-test if the request needs a non-`dev` preview:

```bash
curl -X POST \
  --fail-with-body \
  --silent \
  --show-error \
  "https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-dev-test/buildWithParameters" \
  --user "$JENKINS_USER:$JENKINS_TOKEN" \
  --data-urlencode "BRANCH=<feature_branch>" \
  --data-urlencode "REPO=zdoc" \
  --data-urlencode "ENVIRONMENT=development"
```

Trigger production only after UAT approval, using the approved release branch:

```bash
curl -X POST \
  --fail-with-body \
  --silent \
  --show-error \
  "https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-prod/buildWithParameters" \
  --user "$JENKINS_USER:$JENKINS_TOKEN" \
  --data-urlencode "BRANCH=vX.X.X"
```

Deploy an already-built production image by adding `image_tag`:

```bash
curl -X POST \
  --fail-with-body \
  --silent \
  --show-error \
  "https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-prod/buildWithParameters" \
  --user "$JENKINS_USER:$JENKINS_TOKEN" \
  --data-urlencode "BRANCH=vX.X.X" \
  --data-urlencode "image_tag=<existing_image_tag>"
```

Jenkins job mapping:

```text
zilliz-docs-dev       -> UAT3, https://docs.cloud-uat3.zilliz.com, overlay uat3, parameter BRANCH
zilliz-docs-dev-test  -> feature preview, https://docs-test.cloud-uat3.zilliz.com, overlay dev-test, parameters BRANCH/REPO/ENVIRONMENT
zilliz-docs-prod      -> production, parameter BRANCH and optional image_tag
```

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

If blocked, reply with the blocker, the last successful step, and the exact command/log path to inspect.

## Safety

- Do not use `master` for UAT or production docs publishing.
- Do not publish docs that are not found in the manual root Base.
- Do not silently switch manual or target when multiple Base records match; ask for clarification.
- Do not print Feishu, AWS, model, or Jenkins secrets.
- Do not delete generated directories wholesale during targeted publish unless running the full workflow intentionally.
