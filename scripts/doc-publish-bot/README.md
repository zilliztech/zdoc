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
DOC_PUBLISH_ROUTER_AGENT_COMMAND="codex exec --stdin"

# Optional. Used only with --execute, before Docusaurus/build/Jenkins steps.
DOC_PUBLISH_AGENT_COMMAND="codex exec --stdin"

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
# Required by plugins/lark-docs when fetch-lark-docs talks to Feishu OpenAPI.
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

Run with `--execute` only after git, `lark-cli`, `pnpm`, Jenkins credentials, and the agent hook are configured.

## SDK Long Connection

For the official Feishu Node SDK long-connection mode:

```bash
pnpm add @larksuiteoapi/node-sdk
FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx npm run doc-publish-bot -- --listen sdk
```

The SDK mode uses `createLarkChannel` when available. It does not require a public URL.

## Router Agent

Set `DOC_PUBLISH_ROUTER_AGENT_COMMAND` to make Codex/OpenClaw-style agents parse raw Feishu messages and select a skill before the deterministic planner runs:

```bash
DOC_PUBLISH_ROUTER_AGENT_COMMAND="codex exec --stdin" npm run doc-publish-bot -- --listen local
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

## Worker Agent

Set `DOC_PUBLISH_AGENT_COMMAND` to put Codex/OpenClaw-style agents in the execution loop:

```bash
DOC_PUBLISH_AGENT_COMMAND="codex exec --stdin" npm run doc-publish-bot -- --listen local --execute
```

The hook receives the publish plan JSON on stdin before Docusaurus/build/Jenkins execution. Use it to fix build errors, preserve unfixed issues, and produce a run summary.

## Jenkins

The planner uses:

```text
https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-dev/buildWithParameters
https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-prod/buildWithParameters
```

Set `JENKINS_USER` and `JENKINS_TOKEN` before using `--execute`.
