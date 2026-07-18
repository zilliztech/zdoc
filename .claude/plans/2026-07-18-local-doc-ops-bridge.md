# Local Doc Ops Bridge Implementation Plan

**Implementation status (2026-07-18):** Complete on branch `codex/local-doc-ops-bridge`. The bridge repo's existing `patch-code-blocks --apply=false` command replaced the proposed new patch planner. All local bot tests pass. Live Feishu smoke testing requires renewed `lark-cli` user authorization for `base:table:read`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the local Feishu publish bot into a local doc-ops router that can publish docs and run selected `../feishu-markdown-bridge` code-to-doc workflows safely.

**Architecture:** Keep `scripts/doc-publish-bot` as the only Feishu listener and local execution boundary. Add a bridge workflow registry that maps approved router intents to bounded commands in `../feishu-markdown-bridge`, always dry-run by default, and require explicit approval before Feishu writes, Bitable writes, git pushes, or Jenkins triggers.

**Tech Stack:** Node.js CommonJS, `node:test`, `lark-cli`, local Codex/OpenClaw command hooks, `../feishu-markdown-bridge/.claude/skills/*`, existing `scripts/doc-publish-bot` listener/router/executor.

---

## File Structure

- Modify `scripts/doc-publish-bot/routerAgent.js`: broaden allowed intents and required router schema.
- Create `scripts/doc-publish-bot/bridgeWorkflows.js`: bridge intent normalization, command planning, safety policy, and renderer.
- Create `scripts/doc-publish-bot/bridgeWorkflows.test.js`: unit coverage for every bridge intent and safety gate.
- Modify `scripts/doc-publish-bot/index.js`: route non-publish decisions to bridge workflow execution and reply with bridge plans/results.
- Modify `scripts/doc-publish-bot/index.test.js`: coverage for bridge command bounds and reply behavior through exported helpers.
- Modify `scripts/doc-publish-bot/README.md`: document local bridge setup, env vars, and Feishu request examples.
- Modify `.claude/skills/zdoc-feishu-doc-publish/SKILL.md`: mention that publish is the final deploy stage after bridge workflows have updated Feishu docs.
- Create `.claude/skills/zdoc-local-doc-ops/SKILL.md`: concise skill file for the bot/router covering publish, SDK sync, verified draft, code verify, and code patch requests.

## Supported Intents

The first implementation supports these router intents:

```js
const ALLOWED_INTENTS = [
  'publish_docs',
  'sync_sdk_docs',
  'draft_verified_doc',
  'verify_doc_code',
  'patch_doc_code_examples',
]
```

Default policy:

| Intent | Default mode | Live write allowed by bot | Working directory |
| --- | --- | --- | --- |
| `publish_docs` | dry-run unless `--execute` | yes, existing guarded path | `zdoc` |
| `sync_sdk_docs` | dry-run | only after explicit approval in later task | `../feishu-markdown-bridge` |
| `draft_verified_doc` | draft/plan only | no in first implementation | `../feishu-markdown-bridge` |
| `verify_doc_code` | read-only verification | not needed | `../feishu-markdown-bridge` |
| `patch_doc_code_examples` | patch plan only | no in first implementation | `../feishu-markdown-bridge` |

---

### Task 1: Router Schema For Doc Ops Intents

**Files:**
- Modify: `scripts/doc-publish-bot/routerAgent.js`
- Test: `scripts/doc-publish-bot/routerAgent.test.js`

- [ ] **Step 1: Write failing router tests**

Add tests to `scripts/doc-publish-bot/routerAgent.test.js`:

```js
test('normalizeRouterDecision accepts bridge code verification requests', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-local-doc-ops',
    intent: 'verify_doc_code',
    docLinks: ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'],
    approved: false,
  })

  assert.equal(decision.skill, 'zdoc-local-doc-ops')
  assert.equal(decision.intent, 'verify_doc_code')
  assert.deepEqual(decision.docLinks, ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'])
  assert.equal(decision.approved, false)
})

test('normalizeRouterDecision accepts SDK sync requests with language and version', () => {
  const decision = normalizeRouterDecision({
    skill: 'zdoc-local-doc-ops',
    intent: 'sync_sdk_docs',
    language: 'python',
    sdkVersion: 'v3.0.x',
    approved: false,
  })

  assert.equal(decision.intent, 'sync_sdk_docs')
  assert.equal(decision.language, 'python')
  assert.equal(decision.sdkVersion, 'v3.0.x')
})

test('normalizeRouterDecision rejects unsupported bridge intents', () => {
  assert.throws(
    () => normalizeRouterDecision({
      skill: 'zdoc-local-doc-ops',
      intent: 'delete_docs',
      docLinks: ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'],
    }),
    /unsupported intent/
  )
})
```

- [ ] **Step 2: Run router tests and verify failure**

Run:

```bash
node --test scripts/doc-publish-bot/routerAgent.test.js
```

Expected: tests fail because `zdoc-local-doc-ops` and bridge intents are not allowed.

- [ ] **Step 3: Update router constants and normalization**

In `scripts/doc-publish-bot/routerAgent.js`, replace the constants and schema with:

```js
const ALLOWED_SKILLS = ['zdoc-feishu-doc-publish', 'zdoc-local-doc-ops']
const ALLOWED_INTENTS = [
  'publish_docs',
  'sync_sdk_docs',
  'draft_verified_doc',
  'verify_doc_code',
  'patch_doc_code_examples',
]
const DOC_LINK_INTENTS = new Set(['publish_docs', 'draft_verified_doc', 'verify_doc_code', 'patch_doc_code_examples'])
```

Add `language`, `sdkVersion`, `references`, and `targetDoc` to `requiredOutputSchema`:

```js
requiredOutputSchema: {
  skill: 'string',
  intent: ALLOWED_INTENTS.join('|'),
  environment: 'uat|production',
  branch: 'dev|vX.X.X',
  docLinks: ['Feishu doc/wiki URLs'],
  language: 'python|java|node|go|cpp|zilliz-cli|rest',
  sdkVersion: 'string',
  targetDoc: 'Feishu doc/wiki URL',
  references: ['Feishu docs, URLs, issue links, or local paths'],
  approved: 'boolean',
  needsApproval: 'boolean',
  notes: ['string'],
}
```

After `docLinks` normalization, require doc links only for `DOC_LINK_INTENTS`:

```js
const docLinks = Array.isArray(decision.docLinks) ? decision.docLinks.filter(Boolean).map(String) : []
if (DOC_LINK_INTENTS.has(decision.intent) && !docLinks.length) {
  throw new Error('router decision must include docLinks')
}
```

Return the bridge-specific fields:

```js
return {
  skill: decision.skill,
  intent: decision.intent,
  environment,
  branch,
  docLinks,
  language: decision.language ? String(decision.language) : null,
  sdkVersion: decision.sdkVersion ? String(decision.sdkVersion) : null,
  targetDoc: decision.targetDoc ? String(decision.targetDoc) : null,
  references: Array.isArray(decision.references) ? decision.references.map(String) : [],
  approved: Boolean(decision.approved),
  needsApproval: Boolean(decision.needsApproval),
  notes: Array.isArray(decision.notes) ? decision.notes.map(String) : [],
}
```

- [ ] **Step 4: Run router tests and verify pass**

Run:

```bash
node --test scripts/doc-publish-bot/routerAgent.test.js
```

Expected: all router tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/doc-publish-bot/routerAgent.js scripts/doc-publish-bot/routerAgent.test.js
git commit -m "feat: route local doc ops intents"
```

---

### Task 2: Bridge Workflow Planner

**Files:**
- Create: `scripts/doc-publish-bot/bridgeWorkflows.js`
- Create: `scripts/doc-publish-bot/bridgeWorkflows.test.js`

- [ ] **Step 1: Write failing workflow planner tests**

Create `scripts/doc-publish-bot/bridgeWorkflows.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')

const {
  BRIDGE_ROOT,
  assertBridgeDecisionAllowed,
  buildBridgeWorkflowPlan,
  renderBridgePlan,
} = require('./bridgeWorkflows')

test('buildBridgeWorkflowPlan plans Feishu code verification as read-only', () => {
  const plan = buildBridgeWorkflowPlan({
    intent: 'verify_doc_code',
    docLinks: ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'],
  })

  assert.equal(plan.intent, 'verify_doc_code')
  assert.equal(plan.cwd, BRIDGE_ROOT)
  assert.equal(plan.requiresApproval, false)
  assert.deepEqual(plan.commands, [[
    'node',
    '.claude/skills/feishu-code-verify/scripts/verify-feishu-doc-code.js',
    '--doc',
    'https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf',
    '--scenario',
    '--report',
    '/tmp/doc-publish-bot-feishu-code-verify.json',
  ]])
})

test('buildBridgeWorkflowPlan plans SDK sync as dry-run only', () => {
  const plan = buildBridgeWorkflowPlan({
    intent: 'sync_sdk_docs',
    language: 'python',
    sdkVersion: 'v3.0.x',
  })

  assert.deepEqual(plan.commands, [[
    'node',
    '.claude/skills/sdk-doc-sync/bin/sdk-doc-sync.js',
    '--language=python',
    '--sdk-version',
    'v3.0.x',
    '--dry-run',
  ]])
  assert.equal(plan.requiresApproval, true)
})

test('assertBridgeDecisionAllowed blocks live bridge writes in initial implementation', () => {
  assert.throws(
    () => assertBridgeDecisionAllowed({
      intent: 'patch_doc_code_examples',
      approved: true,
      live: true,
    }),
    /live bridge writes are not enabled/
  )
})

test('renderBridgePlan includes commands and safety mode', () => {
  const plan = buildBridgeWorkflowPlan({
    intent: 'patch_doc_code_examples',
    docLinks: ['https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf'],
  })

  assert.match(renderBridgePlan(plan), /Intent: patch_doc_code_examples/)
  assert.match(renderBridgePlan(plan), /Mode: dry-run/)
  assert.match(renderBridgePlan(plan), /patch-feishu-code/)
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node --test scripts/doc-publish-bot/bridgeWorkflows.test.js
```

Expected: fails because `bridgeWorkflows.js` does not exist.

- [ ] **Step 3: Implement bridge workflow planner**

Create `scripts/doc-publish-bot/bridgeWorkflows.js`:

```js
const path = require('node:path')
const { shellQuote } = require('./publishJob')

const BRIDGE_ROOT = path.resolve(__dirname, '../../..', '../feishu-markdown-bridge')
const REPORT_PATHS = Object.freeze({
  verify_doc_code: '/tmp/doc-publish-bot-feishu-code-verify.json',
})

function firstDocLink(decision) {
  const link = decision.docLinks?.[0] || decision.targetDoc
  if (!link) throw new Error(`${decision.intent} requires a Feishu doc/wiki link`)
  return link
}

function assertLanguage(value) {
  const language = String(value || '').toLowerCase()
  const allowed = new Set(['python', 'java', 'node', 'go', 'cpp', 'zilliz-cli', 'rest'])
  if (!allowed.has(language)) {
    throw new Error(`unsupported SDK language for bridge workflow: ${value}`)
  }
  return language
}

function assertBridgeDecisionAllowed({ intent, live }) {
  if (live) {
    throw new Error(`live bridge writes are not enabled for ${intent}; run a dry-run and approve the concrete patch plan first`)
  }
}

function buildBridgeWorkflowPlan(decision, { live = false } = {}) {
  assertBridgeDecisionAllowed({ intent: decision.intent, live })

  if (decision.intent === 'verify_doc_code') {
    return {
      intent: decision.intent,
      mode: 'dry-run',
      cwd: BRIDGE_ROOT,
      requiresApproval: false,
      commands: [[
        'node',
        '.claude/skills/feishu-code-verify/scripts/verify-feishu-doc-code.js',
        '--doc',
        firstDocLink(decision),
        '--scenario',
        '--report',
        REPORT_PATHS.verify_doc_code,
      ]],
    }
  }

  if (decision.intent === 'sync_sdk_docs') {
    const language = assertLanguage(decision.language)
    const sdkVersion = decision.sdkVersion ? String(decision.sdkVersion) : 'latest'
    const command = [
      'node',
      '.claude/skills/sdk-doc-sync/bin/sdk-doc-sync.js',
      `--language=${language}`,
    ]
    if (sdkVersion !== 'latest') command.push('--sdk-version', sdkVersion)
    command.push('--dry-run')
    return {
      intent: decision.intent,
      mode: 'dry-run',
      cwd: BRIDGE_ROOT,
      requiresApproval: true,
      commands: [command],
    }
  }

  if (decision.intent === 'patch_doc_code_examples') {
    return {
      intent: decision.intent,
      mode: 'dry-run',
      cwd: BRIDGE_ROOT,
      requiresApproval: true,
      commands: [[
        'node',
        '.claude/skills/patch-feishu-code/scripts/plan-patch-feishu-code.js',
        firstDocLink(decision),
      ]],
    }
  }

  if (decision.intent === 'draft_verified_doc') {
    return {
      intent: decision.intent,
      mode: 'dry-run',
      cwd: BRIDGE_ROOT,
      requiresApproval: true,
      commands: [[
        'codex',
        'exec',
        '--stdin',
      ]],
      stdin: JSON.stringify({
        skill: 'draft-verified-docs',
        targetDoc: firstDocLink(decision),
        references: decision.references || decision.docLinks || [],
        instruction: 'Create a source-verified draft only. Do not patch Feishu.',
      }, null, 2),
    }
  }

  throw new Error(`unsupported bridge intent: ${decision.intent}`)
}

function renderBridgePlan(plan) {
  const lines = [
    `Intent: ${plan.intent}`,
    `Mode: ${plan.mode}`,
    `Working directory: ${plan.cwd}`,
    `Requires approval: ${plan.requiresApproval ? 'yes' : 'no'}`,
    '',
    'Commands:',
  ]
  for (const command of plan.commands) lines.push(`- ${shellQuote(command)}`)
  return lines.join('\n')
}

module.exports = {
  BRIDGE_ROOT,
  assertBridgeDecisionAllowed,
  buildBridgeWorkflowPlan,
  renderBridgePlan,
}
```

- [ ] **Step 4: Run workflow planner tests**

Run:

```bash
node --test scripts/doc-publish-bot/bridgeWorkflows.test.js
```

Expected: tests pass except `patch_doc_code_examples` if `plan-patch-feishu-code.js` is missing. If that file is missing, keep the command planner test and implement Task 3 before running the full suite.

- [ ] **Step 5: Commit**

```bash
git add scripts/doc-publish-bot/bridgeWorkflows.js scripts/doc-publish-bot/bridgeWorkflows.test.js
git commit -m "feat: plan bridge doc ops workflows"
```

---

### Task 3: Patch-Code Dry-Run Entrypoint In Bridge Repo

**Files:**
- Create in bridge repo: `../feishu-markdown-bridge/.claude/skills/patch-feishu-code/scripts/plan-patch-feishu-code.js`
- Test in bridge repo if test harness exists: `../feishu-markdown-bridge/.claude/skills/patch-code-blocks/tests/plan-patch-feishu-code.test.js`

- [ ] **Step 1: Confirm whether dry-run planner already exists**

Run:

```bash
find ../feishu-markdown-bridge/.claude/skills -path '*patch*' -type f | sort
```

Expected: if a dry-run planner exists, update Task 2 command to call the existing script. If none exists, continue this task.

- [ ] **Step 2: Create a minimal read-only planner**

Create `../feishu-markdown-bridge/.claude/skills/patch-feishu-code/scripts/plan-patch-feishu-code.js`:

```js
#!/usr/bin/env node

const doc = process.argv[2]
if (!doc) {
  console.error('Usage: plan-patch-feishu-code.js <feishu-doc-url-or-token>')
  process.exit(2)
}

console.log(JSON.stringify({
  ok: true,
  mode: 'dry-run',
  skill: 'patch-feishu-code',
  target: doc,
  nextSteps: [
    'Fetch Feishu blocks for the target doc.',
    'Group adjacent code blocks by procedure step.',
    'Identify missing Java, Go, JavaScript, Bash, Shell, and C++ blocks.',
    'Verify equivalent SDK APIs from local source repos before proposing code.',
    'Return an insertion plan only; do not patch Feishu in this command.',
  ],
}, null, 2))
```

- [ ] **Step 3: Make the planner executable**

Run:

```bash
chmod +x ../feishu-markdown-bridge/.claude/skills/patch-feishu-code/scripts/plan-patch-feishu-code.js
```

Expected: command exits `0`.

- [ ] **Step 4: Smoke-test planner**

Run:

```bash
node ../feishu-markdown-bridge/.claude/skills/patch-feishu-code/scripts/plan-patch-feishu-code.js https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf
```

Expected: JSON output with `"mode": "dry-run"` and no Feishu write.

- [ ] **Step 5: Commit in the bridge repo**

Run from `../feishu-markdown-bridge`:

```bash
git add .claude/skills/patch-feishu-code/scripts/plan-patch-feishu-code.js
git commit -m "feat: add patch-code dry-run planner"
```

---

### Task 4: Execute Bridge Plans From The Local Bot

**Files:**
- Modify: `scripts/doc-publish-bot/index.js`
- Test: `scripts/doc-publish-bot/index.test.js`

- [ ] **Step 1: Write failing tests for bridge execution helper**

Add to `scripts/doc-publish-bot/index.test.js`:

```js
const { executeBridgePlan } = require('./index')

test('executeBridgePlan runs commands in the bridge working directory', async () => {
  const calls = []
  await executeBridgePlan({
    cwd: '/tmp/bridge-root',
    commands: [['node', '--version']],
  }, {
    run: async (argv, options) => {
      calls.push({ argv, options })
      return { stdout: 'v22.0.0\n', stderr: '' }
    },
  })

  assert.deepEqual(calls[0].argv, ['node', '--version'])
  assert.equal(calls[0].options.cwd, '/tmp/bridge-root')
})
```

- [ ] **Step 2: Run test and verify failure**

Run:

```bash
node --test scripts/doc-publish-bot/index.test.js
```

Expected: fails because `executeBridgePlan` is not exported.

- [ ] **Step 3: Extend `runCommand` to support cwd**

In `scripts/doc-publish-bot/index.js`, update the `spawn` call:

```js
const child = spawn(argv[0], argv.slice(1), {
  stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
  cwd: options.cwd,
  env: { ...process.env, ...(options.env || {}) },
})
```

- [ ] **Step 4: Add bridge execution helper**

Add imports near the existing imports:

```js
const { buildBridgeWorkflowPlan, renderBridgePlan } = require('./bridgeWorkflows')
```

Add helper:

```js
async function executeBridgePlan(plan, { run = runCommand } = {}) {
  const outputs = []
  for (const command of plan.commands) {
    const result = await run(command, { cwd: plan.cwd })
    if (result.stdout?.trim()) outputs.push(result.stdout.trim())
  }
  return outputs.join('\n\n')
}
```

Export `executeBridgePlan`.

- [ ] **Step 5: Route bridge decisions in `handleEvent`**

In `handleEvent`, after `decision?.intent === 'ignore'`:

```js
if (decision && decision.intent !== 'publish_docs') {
  const bridgePlan = buildBridgeWorkflowPlan(decision)
  if (dryRun) {
    const rendered = renderBridgePlan(bridgePlan)
    if (reply && messageId) await replyToMessage(messageId, `Dry run:\n\n\`\`\`\n${rendered}\n\`\`\``)
    return rendered
  }
  const output = await executeBridgePlan(bridgePlan)
  const rendered = output || renderBridgePlan(bridgePlan)
  if (reply && messageId) await replyToMessage(messageId, `已完成文档操作:\n\n\`\`\`\n${rendered}\n\`\`\``)
  return rendered
}
```

- [ ] **Step 6: Run focused bot tests**

Run:

```bash
node --test scripts/doc-publish-bot/index.test.js scripts/doc-publish-bot/bridgeWorkflows.test.js
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/doc-publish-bot/index.js scripts/doc-publish-bot/index.test.js
git commit -m "feat: execute bridge doc ops plans"
```

---

### Task 5: Local Doc Ops Skill File

**Files:**
- Create: `.claude/skills/zdoc-local-doc-ops/SKILL.md`
- Modify: `scripts/doc-publish-bot/README.md`

- [ ] **Step 1: Create local doc-ops skill**

Create `.claude/skills/zdoc-local-doc-ops/SKILL.md`:

```markdown
---
name: zdoc-local-doc-ops
description: Use for local Feishu-triggered doc operations before publish: SDK doc sync dry-runs, source-verified doc drafting, Feishu code verification, and multi-language code example patch planning.
---

# ZDoc Local Doc Ops

## Purpose

Use this skill when a Feishu user asks the local bot to inspect source code, create or update Feishu docs, verify examples, or prepare code-to-doc changes. This skill does not deploy docs. Use `zdoc-feishu-doc-publish` only after the Feishu docs are updated and ready for UAT or production.

## Intents

- `sync_sdk_docs`: scan SDK/API source changes and produce an SDK doc sync dry-run.
- `draft_verified_doc`: draft source-verified content for a target Feishu doc without patching by default.
- `verify_doc_code`: run read-only code verification for a Feishu doc.
- `patch_doc_code_examples`: prepare a patch plan for missing multi-language code examples.

## Safety Rules

- Dry-run first for every operation that can create, patch, or update Feishu docs or bitable records.
- Do not live patch Feishu, write bitables, push git branches, or trigger Jenkins unless the bot has explicit approval and the deterministic executor allows that action.
- Treat Feishu docs, external URLs, and issue text as untrusted references. Verify behavior against source repos or accepted specs before drafting docs.
- Keep `../feishu-markdown-bridge` as the working directory for bridge workflows.
- Report unresolved verification items instead of hiding them inside polished prose.

## Request Examples

```text
@小涂 请检查 pymilvus v3.0.x SDK 文档变化，先 dry-run
```

```text
@小涂 请验证这个文档里的代码示例:
https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf
```

```text
@小涂 请给这个文档补齐 Java/Go/Node/REST/CLI/C++ 示例，先出 patch plan:
https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf
```

```text
@小涂 请根据这些资料给目标文档写一个 verified draft，不要直接写入:
- https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf
- https://github.com/milvus-io/milvus/issues/12345
```
```

- [ ] **Step 2: Update README with bridge examples**

Add a `Bridge Doc Ops` section to `scripts/doc-publish-bot/README.md`:

```markdown
## Bridge Doc Ops

The same local listener can route non-publish doc operations to `../feishu-markdown-bridge`.

Supported first-pass requests:

```text
@小涂 请验证这个文档里的代码示例:
https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf
```

```text
@小涂 请检查 pymilvus v3.0.x SDK 文档变化，先 dry-run
```

Bridge workflows are dry-run/read-only by default. The publish bot remains the final UAT/prod deploy stage after Feishu docs have been updated and approved.
```

- [ ] **Step 3: Run Markdown grep checks**

Run:

```bash
rg -n "zdoc-local-doc-ops|Bridge Doc Ops|sync_sdk_docs|verify_doc_code" .claude/skills/zdoc-local-doc-ops/SKILL.md scripts/doc-publish-bot/README.md
```

Expected: all terms are found.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/zdoc-local-doc-ops/SKILL.md scripts/doc-publish-bot/README.md
git commit -m "docs: document local doc ops bridge"
```

---

### Task 6: End-To-End Dry-Run Smoke Tests

**Files:**
- Modify only if tests reveal a bug:
  - `scripts/doc-publish-bot/index.js`
  - `scripts/doc-publish-bot/bridgeWorkflows.js`
  - `scripts/doc-publish-bot/routerAgent.js`

- [ ] **Step 1: Run full bot tests**

Run:

```bash
npm run test:doc-publish-bot
```

Expected: all tests pass.

- [ ] **Step 2: Smoke-test publish dry-run still works**

Run:

```bash
node scripts/doc-publish-bot/index.js --message "@小涂 请发布到 UAT https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf"
```

Expected: dry-run plan includes:

```text
Environment: uat
Branch: dev
Jenkins:
- POST https://jenkins-3.zilliz.cc/job/zilliz-docs/job/zilliz-docs-dev/buildWithParameters
```

- [ ] **Step 3: Smoke-test bridge verification plan through router bypass**

If no router command is configured, invoke the bridge planner test command directly:

```bash
node --test scripts/doc-publish-bot/bridgeWorkflows.test.js
```

Expected: bridge workflow planner tests pass.

- [ ] **Step 4: Smoke-test bridge command manually**

Run:

```bash
node ../feishu-markdown-bridge/.claude/skills/feishu-code-verify/scripts/verify-feishu-doc-code.js --doc https://zilliverse.feishu.cn/wiki/LMfdwRwKIiJtywkwbHVcGnOFnRf --scenario --report /tmp/doc-publish-bot-feishu-code-verify.json
```

Expected: command either writes `/tmp/doc-publish-bot-feishu-code-verify.json` or fails with a Feishu/auth error that is actionable and safe to report. It must not patch Feishu.

- [ ] **Step 5: Commit fixes if smoke tests exposed issues**

```bash
git add scripts/doc-publish-bot
git commit -m "fix: stabilize bridge doc ops smoke tests"
```

Skip this commit when no fixes were needed.

---

## Self-Review

- Spec coverage: local-only operation is preserved; bridge repo workflows are invoked as dry-run/read-only first; publish remains the final UAT/prod stage; router selects skills; bot validates and executes bounded operations.
- Safety coverage: live bridge writes are blocked in the first implementation; production publish approval remains separate; existing Jenkins and dirty-worktree guards remain intact.
- Test coverage: each new decision path gets unit tests before implementation; end-to-end smoke tests cover publish dry-run and bridge verification dry-run.
- Known deliberate limitation: first bridge integration does not live-patch Feishu docs from bot approval. That should be a second plan after dry-run reports and approval cards are stable.
