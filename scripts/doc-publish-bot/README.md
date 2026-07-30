# ZDoc Feishu Publish Bot

Internal bot entrypoint for requests like:

```text
@小涂,请帮我发布以下文档到 UAT:
- https://zilliverse.feishu.cn/wiki/<token>
- https://zilliverse.feishu.cn/docx/<token>
```

The bot follows `.claude/skills/zdoc-feishu-doc-publish/SKILL.md`.

## Environment

Create or update `.env` files. Do not commit real secrets.

Load order:

```text
1. <repo>/.env
2. <repo>/scripts/doc-publish-bot/.env
```

Values in `scripts/doc-publish-bot/.env` override the repo root `.env`, so bot-specific Jenkins and SDK credentials can live there while the root `.env` continues to provide Docusaurus build variables.

Minimal dry-run/local listener:

```dotenv
# Optional. If unset, the bot uses deterministic parsing directly.
DOC_PUBLISH_ROUTER_AGENT_COMMAND="codex exec -"

# Optional. Used only with --execute, before Docusaurus/build/Jenkins steps.
DOC_PUBLISH_AGENT_COMMAND="codex exec -"

# Optional. Feishu reaction added immediately after receiving a publish request.
# "Typing" is Feishu's emoji_type for 敲键盘.
DOC_PUBLISH_ACK_EMOJI_TYPE="Typing"
```

SDK long-connection mode:

```dotenv
# Required for --listen sdk.
FEISHU_APP_ID="cli_xxx"
FEISHU_APP_SECRET="xxx"
```

Execute mode and Jenkins publish:

```dotenv
# Required for --execute when triggering Jenkins.
JENKINS_USER="your-jenkins-user"
JENKINS_TOKEN="your-jenkins-api-token"
```

Docusaurus Feishu fetch/build execution:

```dotenv
# Required by packages/docs-tooling/src/lark when fetch-lark-docs talks to Feishu OpenAPI.
FEISHU_HOST="https://open.feishu.cn"
APP_ID="cli_xxx"
APP_SECRET="xxx"
SPACE_ID="xxx"

# Required when using -s3 image upload.
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_REGION="us-west-2"
AWS_BUCKET="zdoc-images"
IMAGE_BED_URL="https://zdoc-images.s3.us-west-2.amazonaws.com"

# Optional rate/retry tuning.
FEISHU_MAX_CONCURRENT="1"
FEISHU_MIN_TIME_MS="500"
FEISHU_RETRY_ATTEMPTS="5"
FEISHU_RETRY_DELAY_MS="1000"

# Build/link-check defaults used by the publish workflow.
DOCS_BUILD_ENV="uat"
DOCS_PUBLISH_URL="https://docs.cloud-uat3.zilliz.com"
LINK_CHECKS_REMOTE_BASE_URL="https://docs.zilliz.com"
```

Optional build integrations used by the existing docs site:

```dotenv
FIGMA_API_KEY="xxx"
INKEEP_API_KEY="xxx"
INKEEP_INTEGRATION_ID="xxx"
INKEEP_ORGANIZATION_ID="xxx"
```

Agent timeout and output caps:

```dotenv
# Optional. Router should be fast because it only classifies and normalizes the message.
DOC_PUBLISH_ROUTER_TIMEOUT_MS="30000"
DOC_PUBLISH_ROUTER_MAX_OUTPUT_BYTES="65536"

# Optional. Worker agent can be slower because it may inspect build failures.
DOC_PUBLISH_AGENT_TIMEOUT_MS="600000"
DOC_PUBLISH_AGENT_MAX_OUTPUT_BYTES="524288"

# Optional. Applies to each read-only/dry-run bridge helper command.
DOC_PUBLISH_BRIDGE_COMMAND_TIMEOUT_MS="600000"
DOC_PUBLISH_BRIDGE_MAX_OUTPUT_BYTES="524288"

# Optional escape hatch for local experiments. Keep unset in normal execute mode.
DOC_PUBLISH_ALLOW_DIRTY_WORKTREE="0"
```

`lark-cli` identity is not stored in this `.env`. For local listener and Base lookup, configure it separately:

```bash
lark-cli config init
lark-cli auth login --domain all
```

## Dry Run

```bash
npm run doc-publish-bot -- --message "@小涂 请发布到 UAT https://zilliverse.feishu.cn/wiki/<token>"
```

Default mode is dry-run. It resolves each doc token through the configured manual Base, prints the targeted Docusaurus commands, build command, and Jenkins trigger.

## Local Listener

For a laptop or intranet host without a public callback URL:

```bash
npm run doc-publish-bot -- --listen local
```

This uses:

```bash
lark-cli event consume im.message.receive_v1 --as bot
```

Long-connection event delivery is the supported local-development path for Feishu/Lark bots: the local process opens an outbound WebSocket to the open platform, so no public callback URL is required. The machine still needs outbound internet access to Feishu/Lark, and the app must subscribe to `im.message.receive_v1`.

The listener adds the `敲键盘` reaction immediately, serializes matching publish requests so only one request mutates the checkout at a time, and replies in Feishu when parsing, Base lookup, build, or Jenkins triggering fails.

Run with `--execute` only after git, `lark-cli`, `pnpm`, Jenkins credentials, and the agent hook are configured. Execute mode refuses to run with a dirty git worktree unless `DOC_PUBLISH_ALLOW_DIRTY_WORKTREE=1` is set.

## SDK Long Connection

For the official Feishu Node SDK long-connection mode:

```bash
pnpm add @larksuiteoapi/node-sdk
FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx npm run doc-publish-bot -- --listen sdk
```

The SDK mode uses `createLarkChannel` when available. It does not require a public URL.

Use either `--listen local` or `--listen sdk` for a bot instance, not both for the same app subscription, otherwise one Feishu message may be consumed twice.

## Router Agent

Set `DOC_PUBLISH_ROUTER_AGENT_COMMAND` to make Codex/OpenClaw-style agents parse raw Feishu messages and select a skill before the deterministic planner runs:

```bash
DOC_PUBLISH_ROUTER_AGENT_COMMAND="codex exec -" npm run doc-publish-bot -- --listen local
```

The router receives JSON containing the raw message, message/chat/sender IDs, `.claude/skills`, and allowed skills. It must return JSON only:

```json
{
  "skill": "zdoc-feishu-doc-publish",
  "intent": "publish_docs",
  "environment": "uat",
  "branch": "dev",
  "docLinks": ["https://zilliverse.feishu.cn/wiki/<token>"],
  "needsApproval": false,
  "notes": []
}
```

The bot validates the returned skill, intent, environment, branch, and doc links before Base lookup or execution.

Router and worker commands are bounded by timeout and output limits so a stuck Codex/OpenClaw command cannot hang the local bot indefinitely.

## Bridge Doc Ops

The router can select `.claude/skills/zdoc-local-doc-ops/SKILL.md` for `sync_sdk_docs`, `draft_verified_doc`, `verify_doc_code`, or `patch_doc_code_examples`. Start the local listener with routing enabled:

```bash
DOC_PUBLISH_ROUTER_AGENT_COMMAND="codex exec -" npm run doc-publish-bot -- --listen local
```

Examples include "verify code in `https://zilliverse.feishu.cn/wiki/<token>`", "dry-run Python SDK docs for version 2.6.1", and "draft this Feishu doc from `https://example.com/spec`". Link-based intents require an HTTPS Feishu `/wiki/` or `/docx/` URL. SDK sync supports Python, Java, Node, Go, C++, and `zilliz-cli`, and requires an SDK version.

Bridge helpers run from sibling `../feishu-markdown-bridge`; that checkout and its referenced `repos/...` sources must exist. Install the required CLIs for the selected workflow, including Node.js, `lark-cli`, and Codex (`codex`) where applicable.

Current bridge behavior is read-only/dry-run only: it does not patch Feishu, write Bitable, push git, or trigger Jenkins. Each received message selects exactly one skill and one intent. For mixed requests, run only the earliest safe prerequisite; do not queue later work. After each report/approval, the user sends the next explicit bridge request, then a final separate `publish_docs` request after content approval.

Bridge subprocesses receive a reduced environment. Draft-agent runs do not inherit Jenkins or Feishu credentials, and their output is still bounded before it can be returned to Feishu.

## Worker Agent

Set `DOC_PUBLISH_AGENT_COMMAND` to put Codex/OpenClaw-style agents in the execution loop:

```bash
DOC_PUBLISH_AGENT_COMMAND="codex exec -" npm run doc-publish-bot -- --listen local --execute
```

The hook receives the publish plan JSON on stdin before Docusaurus/build/Jenkins execution. Use it to fix build errors, preserve unfixed issues, and produce a run summary.

## Jenkins

The planner uses:

```text
https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-dev/buildWithParameters
https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-prod/buildWithParameters
```

Set `JENKINS_USER` and `JENKINS_TOKEN` before using `--execute`.

Production approval is never trusted from router-agent JSON. The original Feishu message must contain an approval command on its own line, with the release branch and document links on separate lines:

```text
approve production
v2.6.0
https://zilliverse.feishu.cn/wiki/<token>
```

Equivalent standalone Chinese commands include `批准发布到生产`, `同意发布到生产`, and `确认上线`. Questions, denials, conditional approval, or approval text followed by other words on the same line do not authorize production.

The bot triggers Jenkins with `curl --fail-with-body`, so HTTP 403/500 responses are treated as publish failures and are reported back to Feishu instead of being shown as successful publishes.
