# Feishu Skill Agent Design

## Goal

Build an internal OpenClaw-style Feishu agent, not a command-only bot. A user should be able to mention the bot in Feishu with natural instructions such as "update these docs from this branch, fix build issues, deploy to UAT, and ask me before production." The agent should interpret the request, load and follow relevant skill files, run the docs publishing workflow, use Codex-style coding agents for implementation and repair, and keep production deployment behind an explicit human approval gate.

## Core Shift From The Previous Design

The bot should not primarily expose a narrow command language like:

```text
@docs-bot publish branch=<branch> manual=<manual> docs=<docs>
```

It should instead behave like an agent runtime:

```text
@docs-agent Please update the Node v3.0 docs from branch release/node-v3-docs.
Follow the SDK doc sync skill, fix any Docusaurus build errors, deploy the preview to UAT,
and send me the URL for review before production.
```

Concise commands can still exist for control-plane operations such as `status`, `approve`, `reject`, and `stop`, but task execution should be driven by natural language plus skill instructions.

## Context

The chosen deployment model is still a long-running internal Node.js service running on a developer machine, internal VM, or CI runner. It should use Feishu/Lark long-connection event subscription so the service opens an outbound connection to Feishu instead of exposing a public callback URL.

The repo already has useful docs publishing primitives:

- `package.json` defines `pnpm run build` as the Docusaurus build command.
- `scripts/run-doc-build-stage.js` runs the build, reports status through `npx docusaurus report-to-lark`, and runs `npx docusaurus link-checks`.
- `plugins/lark-docs/index.js` provides `npx docusaurus fetch-lark-docs`.
- `plugins/report-to-lark/index.js` can update Feishu/Lark build cards.
- `.claude/superpowers/specs` and `.claude/superpowers/plans` already hold agent-readable project guidance.
- Local and global skill files exist as Markdown instructions, typically named `SKILL.md`.

## Recommended Architecture

Create an internal service under `tools/feishu-skill-agent` with these units:

1. **Feishu ingress** receives mention events over the Feishu/Lark SDK WebSocket client, verifies app credentials, extracts the conversation context, and creates an agent run from the user request.
2. **Run store** persists runs, plans, logs, tool calls, approval state, and skill traces under `.claude/feishu-skill-agent`.
3. **Skill registry** indexes allowed skill roots and reads `SKILL.md` files. It should support repo-local `.claude/skills`, checked-in `.claude/superpowers`, and explicitly configured global skill roots.
4. **Skill selector** maps a natural-language request to relevant skills using skill names, descriptions, path hints, and optional keywords. The selector must favor explicit user mentions of skills.
5. **Skill loader** reads selected `SKILL.md` files fully before execution, follows direct references only when needed, and records which skill files influenced the run.
6. **Planner** turns the user request plus loaded skills into a concrete task plan. For docs publishing, this includes branch/worktree setup, docs fetch/update, build, repair, UAT deploy, and approval.
7. **Agent executor** runs plan steps in an isolated git worktree. It can call deterministic local commands and spawn Codex for coding tasks, but the service owns permissions, logging, and approval gates.
8. **Tool adapters** expose safe capabilities: git worktree, Docusaurus commands, Codex CLI, Jenkins HTTP API, Feishu replies/cards, and local file reads/writes inside the worktree.
9. **Approval gate** pauses before production deployment and waits for an authorized Feishu approval. Approval must reference the run id and the exact UAT commit SHA.

## Agent Run Model

Each Feishu request creates a run:

```json
{
  "id": "skillrun_20260708_110000_ab12cd",
  "requested_at": "2026-07-08T11:00:00.000+08:00",
  "requested_by": {
    "open_id": "ou_xxx",
    "name": "Requester"
  },
  "chat_id": "oc_xxx",
  "message_id": "om_xxx",
  "request_text": "Please update the Node v3.0 docs from branch release/node-v3-docs...",
  "status": "queued",
  "selected_skills": [],
  "loaded_skill_files": [],
  "plan": [],
  "worktree": ".claude/worktrees/feishu-skill-agent/skillrun_20260708_110000_ab12cd",
  "branch": null,
  "commit_sha": null,
  "uat": {
    "jenkins_build_url": null,
    "page_url": null
  },
  "approval": {
    "status": "pending",
    "approved_by": null,
    "approved_at": null
  },
  "events": []
}
```

Allowed statuses:

```text
queued
selecting_skills
loading_skills
planning
awaiting_clarification
preparing_worktree
executing
agent_fixing
uat_deploying
uat_ready
awaiting_approval
approved
production_deploying
production_deployed
rejected
failed
stopped
```

## Skill Behavior

The agent should follow a skill protocol:

1. Discover candidate skills from configured roots.
2. Select the minimal relevant skill set.
3. Read selected `SKILL.md` files completely before task execution.
4. If a selected skill references directly required files, read only those relevant references.
5. Record selected skill names, file paths, and short reasons in the run.
6. Treat skill instructions as process guidance, while Feishu user instructions remain the requested outcome.
7. If skill guidance conflicts with safety controls, safety controls win.
8. If the request is ambiguous and a reasonable assumption would be risky, ask a Feishu clarification question and pause the run.

For docs publishing, likely skills include:

- docs sync or SDK doc sync skills when the request mentions SDK/API docs;
- Feishu/Lark docs skills when the request mentions source docs, Feishu docs, or Lark docs;
- testing/build/debugging skills when builds fail;
- deployment/release skills when the request reaches UAT or production.

## Prompt Contract For Codex Workers

Codex should be used as a coding sub-agent inside a bounded worktree, not as the outer Feishu runtime. The service should generate prompts that include:

- the original Feishu request;
- run id;
- loaded skill summaries and paths;
- current plan step;
- allowed edit roots;
- failing command and log path when applicable;
- required verification command;
- explicit prohibition on production deployment or credential edits.

Example:

```text
You are executing run skillrun_20260708_110000_ab12cd in /path/to/worktree.
Original Feishu request: "Please update the Node v3.0 docs..."
Loaded skills:
- sdk-doc-sync: /path/to/SKILL.md
- systematic-debugging: /path/to/SKILL.md

Follow the loaded skill instructions. Complete only this step:
Fix the Docusaurus build failure from logs/build.log.

Allowed edits:
- docs/**
- docs-byoc/**
- reference/**
- plugins/lark-docs/**
- config/**

Run pnpm run build before finishing.
Do not deploy, approve production, edit credentials, or make unrelated refactors.
```

## Docs Publishing Workflow As An Agent Capability

The docs publishing flow becomes one capability the agent can plan, not the only command shape:

1. Infer branch, docs/manual/target, and desired environment from the natural request.
2. Ask for clarification if branch or source docs are missing.
3. Create a git worktree for the run.
4. Check out the requested branch and record commit SHA.
5. Run the relevant docs fetch/update command, usually `pnpm docusaurus fetch-lark-docs ...`.
6. Run `node scripts/run-doc-build-stage.js --build "pnpm run build"`.
7. If build fails, load debugging/build skills if not already loaded, spawn Codex with logs, and retry within a configured attempt limit.
8. Trigger Jenkins UAT deployment for the exact commit SHA.
9. Send Feishu UAT URL, summary, changed files, and skill trace.
10. Wait for authorized approval.
11. Trigger Jenkins production deployment for the exact approved commit SHA.

## Feishu Interaction Model

Natural task requests:

```text
@docs-agent Update the Milvus client library docs from branch release/client-docs.
Use the SDK doc sync workflow. Deploy to UAT and wait for my approval before prod.
```

Clarification:

```text
I need one detail before starting: which manual should I update, `guides`, `python`, `node`, `java`, or `go`?
```

Status:

```text
@docs-agent status skillrun_20260708_110000_ab12cd
```

Approval:

```text
@docs-agent approve skillrun_20260708_110000_ab12cd
```

Rejection:

```text
@docs-agent reject skillrun_20260708_110000_ab12cd reason=The UAT page has the wrong sidebar.
```

## Security And Permissions

- Only configured Feishu users can create agent runs.
- Only configured approvers can approve production.
- Skill roots must be allowlisted; the agent must not load arbitrary Markdown paths from user text.
- The agent should record every loaded skill file path.
- The agent should run work in isolated worktrees under `.claude/worktrees/feishu-skill-agent`.
- Credentials stay in `.env.feishu-skill-agent` or the internal runner secret store.
- Secrets must not be included in Codex prompts.
- Jenkins production deployment requires a run in `uat_ready` or `approved` state and a matching approved commit SHA.
- Destructive commands require explicit allowlist handling or human approval.
- The service should cap Codex repair attempts, command runtime, and total run concurrency.

## Failure Handling

- Skill selection uncertainty: ask a clarification question and pause.
- Missing skill file: report the missing path and fall back only if the task remains safe.
- Ambiguous branch/docs/manual: ask for clarification.
- Worktree checkout failure: fail before running doc commands.
- Build failure: spawn Codex repair only within attempt budget.
- Codex failure: preserve worktree and logs for human review.
- Jenkins UAT failure: post Jenkins URL and status to Feishu.
- Approval rejection: mark run `rejected` and do not deploy production.
- Production failure: post Jenkins URL and leave the run `failed`.

## Acceptance Criteria

- The service runs without a public URL by using Feishu long-connection event subscription.
- A natural-language Feishu mention creates a persisted agent run.
- The run records selected skills, loaded `SKILL.md` files, and the generated plan.
- The agent can ask clarification questions and resume from the answer.
- The agent can execute the docs publishing workflow in an isolated worktree.
- Codex is invoked as a bounded coding worker that follows loaded skill guidance.
- UAT deployment posts a review URL and a summary of changed files, build status, and skill trace.
- Production deployment is blocked until an authorized Feishu approval references the run.
- Production deployment uses the exact commit SHA that produced the UAT review.
- `status <run-id>` reports current status, selected skills, current step, UAT URL, and approval state.

## Out Of Scope

- Public Feishu request URL callback deployment.
- A general internet-connected autonomous agent.
- Loading untrusted skill files from arbitrary user-provided paths.
- Letting Codex approve, deploy, or modify release credentials.
- Replacing Jenkins with another deployment platform.
