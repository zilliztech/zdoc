# Feishu Skill Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an internal OpenClaw-style Feishu agent that accepts natural-language requests, loads and follows skill files, executes docs publishing workflows through isolated worktrees and Codex workers, deploys to UAT through Jenkins, and gates production on Feishu approval.

**Architecture:** Add a separate Node.js service under `tools/feishu-skill-agent`. Feishu long-connection events create persisted agent runs; a skill registry selects and loads `SKILL.md` guidance; a planner converts the request and skills into executable steps; an executor runs tools in a worktree and delegates code edits to Codex with scoped prompts.

**Tech Stack:** Node.js 20+, CommonJS modules, Feishu/Lark Node SDK long-connection client, file-backed JSON run store, Markdown skill files, child-process command runner, Codex CLI, Jenkins HTTP API, existing `pnpm`/Docusaurus scripts.

---

## File Structure

- Create: `tools/feishu-skill-agent/package.json`
  - Local package metadata and scripts.
- Create: `tools/feishu-skill-agent/src/config.js`
  - Loads env config, skill roots, allowed users, Jenkins settings, and execution limits.
- Create: `tools/feishu-skill-agent/src/runStore.js`
  - Persists agent runs, events, plans, selected skills, loaded skill paths, and approval state.
- Create: `tools/feishu-skill-agent/src/skillRegistry.js`
  - Discovers allowlisted skill files and extracts name/description metadata.
- Create: `tools/feishu-skill-agent/src/skillSelector.js`
  - Selects relevant skills from natural-language requests.
- Create: `tools/feishu-skill-agent/src/skillLoader.js`
  - Reads selected `SKILL.md` files fully and records loaded paths.
- Create: `tools/feishu-skill-agent/src/planner.js`
  - Produces a concrete plan from request text, loaded skills, and repo context.
- Create: `tools/feishu-skill-agent/src/controlParser.js`
  - Parses only control messages: `status`, `approve`, `reject`, and `stop`.
- Create: `tools/feishu-skill-agent/src/commandRunner.js`
  - Runs child processes with log capture and timeout handling.
- Create: `tools/feishu-skill-agent/src/worktree.js`
  - Creates and cleans isolated worktrees for each run.
- Create: `tools/feishu-skill-agent/src/codexWorker.js`
  - Builds scoped Codex prompts from request, loaded skill files, plan step, and logs.
- Create: `tools/feishu-skill-agent/src/jenkins.js`
  - Triggers Jenkins UAT and production jobs.
- Create: `tools/feishu-skill-agent/src/executor.js`
  - Executes plans step by step, including docs publishing and repair.
- Create: `tools/feishu-skill-agent/src/feishu.js`
  - Wires Feishu long-connection events to run creation, clarification, status, and approval.
- Create: `tools/feishu-skill-agent/src/index.js`
  - Starts the service.
- Create: `tools/feishu-skill-agent/test/*.test.js`
  - Unit tests for config, skill registry/selector/loader, run store, planner, control parser, Codex prompts, and approval gates.
- Modify: root `package.json`
  - Add `feishu-skill-agent:start` and `feishu-skill-agent:test`.
- Modify: `.gitignore`
  - Ignore local agent state, logs, worktrees, and environment file.
- Create: `.env.feishu-skill-agent.example`
  - Documents required runtime settings.

## Task 1: Add Agent Package Skeleton

**Files:**
- Create: `tools/feishu-skill-agent/package.json`
- Create: `tools/feishu-skill-agent/src/index.js`
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `.env.feishu-skill-agent.example`

- [ ] **Step 1: Create package metadata**

Create `tools/feishu-skill-agent/package.json`:

```json
{
  "name": "@zdoc/feishu-skill-agent",
  "version": "0.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "start": "node src/index.js",
    "test": "node --test test/*.test.js"
  },
  "dependencies": {
    "@larksuiteoapi/node-sdk": "^1.52.0",
    "dotenv": "^16.3.1",
    "gray-matter": "^4.0.3",
    "zod": "^3.25.13"
  }
}
```

- [ ] **Step 2: Create initial entrypoint**

Create `tools/feishu-skill-agent/src/index.js`:

```js
function main() {
  console.log('feishu-skill-agent service skeleton ready')
}

if (require.main === module) {
  main()
}

module.exports = { main }
```

- [ ] **Step 3: Add root scripts**

Modify the root `package.json` `scripts` block to include:

```json
"feishu-skill-agent:start": "pnpm --dir tools/feishu-skill-agent start",
"feishu-skill-agent:test": "pnpm --dir tools/feishu-skill-agent test"
```

- [ ] **Step 4: Ignore local runtime state**

Add these entries to `.gitignore`:

```gitignore
.env.feishu-skill-agent
.claude/feishu-skill-agent/runs/
.claude/feishu-skill-agent/logs/
.claude/worktrees/feishu-skill-agent/
```

- [ ] **Step 5: Document runtime configuration**

Create `.env.feishu-skill-agent.example`:

```dotenv
FEISHU_APP_ID=cli_example
FEISHU_APP_SECRET=example_app_secret
FEISHU_ENCRYPT_KEY=example_encrypt_key
FEISHU_VERIFICATION_TOKEN=example_verification_token
FEISHU_AGENT_NAME=docs-agent
FEISHU_SKILL_AGENT_ALLOWED_REQUESTERS=ou_requester_1,ou_requester_2
FEISHU_SKILL_AGENT_ALLOWED_APPROVERS=ou_approver_1,ou_approver_2
FEISHU_SKILL_AGENT_RUN_ROOT=.claude/feishu-skill-agent
FEISHU_SKILL_AGENT_WORKTREE_ROOT=.claude/worktrees/feishu-skill-agent
FEISHU_SKILL_AGENT_SKILL_ROOTS=.claude/skills,.claude/superpowers,/Users/anthony/.codex/skills,/Users/anthony/.agents/skills
FEISHU_SKILL_AGENT_MAX_CODEX_ATTEMPTS=2
FEISHU_SKILL_AGENT_MAX_CONCURRENT_RUNS=1
JENKINS_BASE_URL=https://jenkins.intranet.example
JENKINS_USER=docs-agent
JENKINS_TOKEN=example_jenkins_token
JENKINS_UAT_JOB=docs/deploy-uat
JENKINS_PROD_JOB=docs/deploy-production
DOCS_UAT_BASE_URL=https://docs.cloud-uat3.zilliz.com
DOCS_PROD_BASE_URL=https://docs.zilliz.com
```

- [ ] **Step 6: Verify skeleton**

Run:

```bash
pnpm install
pnpm feishu-skill-agent:start
```

Expected: `feishu-skill-agent service skeleton ready`.

Commit:

```bash
git add package.json pnpm-lock.yaml .gitignore .env.feishu-skill-agent.example tools/feishu-skill-agent/package.json tools/feishu-skill-agent/src/index.js
git commit -m "feat(feishu-agent): add service skeleton"
```

## Task 2: Runtime Configuration

**Files:**
- Create: `tools/feishu-skill-agent/src/config.js`
- Create: `tools/feishu-skill-agent/test/config.test.js`
- Modify: `tools/feishu-skill-agent/src/index.js`

- [ ] **Step 1: Add config tests**

Create `tools/feishu-skill-agent/test/config.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { loadConfigFromEnv } = require('../src/config')

test('loadConfigFromEnv parses agent settings', () => {
  const config = loadConfigFromEnv({
    FEISHU_APP_ID: 'cli_123',
    FEISHU_APP_SECRET: 'secret',
    FEISHU_AGENT_NAME: 'docs-agent',
    FEISHU_SKILL_AGENT_ALLOWED_REQUESTERS: 'ou_a,ou_b',
    FEISHU_SKILL_AGENT_ALLOWED_APPROVERS: 'ou_c',
    FEISHU_SKILL_AGENT_RUN_ROOT: '.claude/feishu-skill-agent',
    FEISHU_SKILL_AGENT_WORKTREE_ROOT: '.claude/worktrees/feishu-skill-agent',
    FEISHU_SKILL_AGENT_SKILL_ROOTS: '.claude/skills,.claude/superpowers',
    FEISHU_SKILL_AGENT_MAX_CODEX_ATTEMPTS: '2',
    FEISHU_SKILL_AGENT_MAX_CONCURRENT_RUNS: '1',
    JENKINS_BASE_URL: 'https://jenkins.example',
    JENKINS_USER: 'agent',
    JENKINS_TOKEN: 'token',
    JENKINS_UAT_JOB: 'docs/deploy-uat',
    JENKINS_PROD_JOB: 'docs/deploy-production'
  })

  assert.equal(config.feishu.agentName, 'docs-agent')
  assert.deepEqual(config.allowedRequesters, ['ou_a', 'ou_b'])
  assert.deepEqual(config.allowedApprovers, ['ou_c'])
  assert.deepEqual(config.skillRoots.map(root => root.endsWith('.claude/skills')), [true, false])
  assert.equal(config.maxCodexAttempts, 2)
})

test('loadConfigFromEnv rejects missing Feishu app id', () => {
  assert.throws(() => loadConfigFromEnv({
    FEISHU_APP_SECRET: 'secret',
    JENKINS_BASE_URL: 'https://jenkins.example',
    JENKINS_USER: 'agent',
    JENKINS_TOKEN: 'token',
    JENKINS_UAT_JOB: 'docs/deploy-uat',
    JENKINS_PROD_JOB: 'docs/deploy-production'
  }), /FEISHU_APP_ID/)
})
```

- [ ] **Step 2: Implement config loader**

Create `tools/feishu-skill-agent/src/config.js`:

```js
const path = require('node:path')
const dotenv = require('dotenv')

function splitCsv(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean)
}

function requireString(env, key) {
  const value = env[key]
  if (!value || !String(value).trim()) throw new Error(`${key} is required`)
  return String(value).trim()
}

function intFromEnv(env, key, fallback, min, max) {
  const value = Number.parseInt(env[key] || String(fallback), 10)
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${key} must be an integer from ${min} to ${max}`)
  }
  return value
}

function resolveRoots(values) {
  return values.map(root => path.resolve(root))
}

function loadConfigFromEnv(env = process.env) {
  const skillRoots = resolveRoots(splitCsv(env.FEISHU_SKILL_AGENT_SKILL_ROOTS || '.claude/skills,.claude/superpowers'))
  return {
    feishu: {
      appId: requireString(env, 'FEISHU_APP_ID'),
      appSecret: requireString(env, 'FEISHU_APP_SECRET'),
      encryptKey: env.FEISHU_ENCRYPT_KEY || '',
      verificationToken: env.FEISHU_VERIFICATION_TOKEN || '',
      agentName: env.FEISHU_AGENT_NAME || 'docs-agent'
    },
    allowedRequesters: splitCsv(env.FEISHU_SKILL_AGENT_ALLOWED_REQUESTERS),
    allowedApprovers: splitCsv(env.FEISHU_SKILL_AGENT_ALLOWED_APPROVERS),
    runRoot: path.resolve(env.FEISHU_SKILL_AGENT_RUN_ROOT || '.claude/feishu-skill-agent'),
    worktreeRoot: path.resolve(env.FEISHU_SKILL_AGENT_WORKTREE_ROOT || '.claude/worktrees/feishu-skill-agent'),
    skillRoots,
    maxCodexAttempts: intFromEnv(env, 'FEISHU_SKILL_AGENT_MAX_CODEX_ATTEMPTS', 2, 0, 5),
    maxConcurrentRuns: intFromEnv(env, 'FEISHU_SKILL_AGENT_MAX_CONCURRENT_RUNS', 1, 1, 4),
    jenkins: {
      baseUrl: requireString(env, 'JENKINS_BASE_URL').replace(/\/$/, ''),
      user: requireString(env, 'JENKINS_USER'),
      token: requireString(env, 'JENKINS_TOKEN'),
      uatJob: requireString(env, 'JENKINS_UAT_JOB'),
      prodJob: requireString(env, 'JENKINS_PROD_JOB')
    },
    docs: {
      uatBaseUrl: env.DOCS_UAT_BASE_URL || 'https://docs.cloud-uat3.zilliz.com',
      prodBaseUrl: env.DOCS_PROD_BASE_URL || 'https://docs.zilliz.com'
    }
  }
}

function loadConfig() {
  dotenv.config({ path: '.env.feishu-skill-agent' })
  return loadConfigFromEnv(process.env)
}

module.exports = { loadConfig, loadConfigFromEnv }
```

- [ ] **Step 3: Wire entrypoint**

Replace `tools/feishu-skill-agent/src/index.js` with:

```js
const { loadConfig } = require('./config')

function main() {
  const config = loadConfig()
  console.log(`feishu-skill-agent configured for ${config.feishu.agentName}`)
}

if (require.main === module) {
  main()
}

module.exports = { main }
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: config tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/config.js tools/feishu-skill-agent/src/index.js tools/feishu-skill-agent/test/config.test.js
git commit -m "feat(feishu-agent): validate runtime config"
```

## Task 3: Run Store

**Files:**
- Create: `tools/feishu-skill-agent/src/runStore.js`
- Create: `tools/feishu-skill-agent/test/runStore.test.js`

- [ ] **Step 1: Add run store tests**

Create `tools/feishu-skill-agent/test/runStore.test.js`:

```js
const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { RunStore } = require('../src/runStore')

test('RunStore creates and transitions agent runs', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'skillrun-'))
  try {
    const store = new RunStore(root)
    const run = store.createRun({
      requestedBy: { open_id: 'ou_a', name: 'Alice' },
      chatId: 'oc_a',
      messageId: 'om_a',
      requestText: 'Update docs from branch dev',
      worktreeRoot: path.join(root, 'worktrees')
    })

    assert.match(run.id, /^skillrun_/)
    assert.equal(run.status, 'queued')

    const updated = store.transition(run.id, 'selecting_skills', {
      selected_skills: [{ name: 'sdk-doc-sync', reason: 'request mentions SDK docs' }]
    }, 'Selecting skills')

    assert.equal(updated.status, 'selecting_skills')
    assert.equal(updated.selected_skills[0].name, 'sdk-doc-sync')
    assert.equal(store.get(run.id).events.length, 2)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
```

- [ ] **Step 2: Implement run store**

Create `tools/feishu-skill-agent/src/runStore.js`:

```js
const fs = require('node:fs')
const path = require('node:path')

function nowIso() {
  return new Date().toISOString()
}

function createRunId() {
  const compact = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  const suffix = Math.random().toString(16).slice(2, 8)
  return `skillrun_${compact}_${suffix}`
}

class RunStore {
  constructor(root) {
    this.root = root
    this.runsDir = path.join(root, 'runs')
    fs.mkdirSync(this.runsDir, { recursive: true })
  }

  pathFor(id) {
    return path.join(this.runsDir, `${id}.json`)
  }

  get(id) {
    return JSON.parse(fs.readFileSync(this.pathFor(id), 'utf8'))
  }

  save(run) {
    fs.mkdirSync(this.runsDir, { recursive: true })
    fs.writeFileSync(this.pathFor(run.id), `${JSON.stringify(run, null, 2)}\n`)
    return run
  }

  createRun(input) {
    const id = createRunId()
    const createdAt = nowIso()
    return this.save({
      id,
      requested_at: createdAt,
      requested_by: input.requestedBy,
      chat_id: input.chatId,
      message_id: input.messageId,
      request_text: input.requestText,
      status: 'queued',
      selected_skills: [],
      loaded_skill_files: [],
      plan: [],
      branch: null,
      commit_sha: null,
      worktree: path.join(input.worktreeRoot, id),
      codex_attempts: 0,
      uat: { jenkins_build_url: null, page_url: null },
      approval: { status: 'pending', approved_by: null, approved_at: null },
      events: [{ at: createdAt, status: 'queued', message: 'Run created' }]
    })
  }

  transition(id, status, patch = {}, message = '') {
    const run = this.get(id)
    Object.assign(run, patch, { status })
    run.events.push({ at: nowIso(), status, message })
    return this.save(run)
  }
}

module.exports = { RunStore }
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: config and run store tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/runStore.js tools/feishu-skill-agent/test/runStore.test.js
git commit -m "feat(feishu-agent): persist agent runs"
```

## Task 4: Skill Registry And Loader

**Files:**
- Create: `tools/feishu-skill-agent/src/skillRegistry.js`
- Create: `tools/feishu-skill-agent/src/skillLoader.js`
- Create: `tools/feishu-skill-agent/test/skillRegistry.test.js`

- [ ] **Step 1: Add skill registry tests**

Create `tools/feishu-skill-agent/test/skillRegistry.test.js`:

```js
const assert = require('node:assert/strict')
const { mkdtempSync, mkdirSync, rmSync, writeFileSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { discoverSkills } = require('../src/skillRegistry')
const { loadSkillFiles } = require('../src/skillLoader')

test('discoverSkills finds SKILL.md metadata', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'skills-'))
  try {
    const skillDir = path.join(root, 'sdk-doc-sync')
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(path.join(skillDir, 'SKILL.md'), [
      '---',
      'name: sdk-doc-sync',
      'description: Sync SDK docs from source repos',
      '---',
      '',
      '# SDK Doc Sync'
    ].join('\n'))

    const skills = discoverSkills([root])
    assert.equal(skills.length, 1)
    assert.equal(skills[0].name, 'sdk-doc-sync')
    assert.match(skills[0].description, /SDK docs/)

    const loaded = loadSkillFiles([skills[0]])
    assert.match(loaded[0].content, /SDK Doc Sync/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
```

- [ ] **Step 2: Implement skill registry**

Create `tools/feishu-skill-agent/src/skillRegistry.js`:

```js
const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, results)
    if (entry.isFile() && entry.name === 'SKILL.md') results.push(full)
  }
  return results
}

function discoverSkills(skillRoots) {
  return skillRoots.flatMap(root => walk(root)).map(file => {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = matter(raw)
    const name = parsed.data.name || path.basename(path.dirname(file))
    return {
      name,
      description: parsed.data.description || '',
      path: file,
      root: skillRoots.find(root => file.startsWith(root)) || null
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
}

module.exports = { discoverSkills }
```

- [ ] **Step 3: Implement skill loader**

Create `tools/feishu-skill-agent/src/skillLoader.js`:

```js
const fs = require('node:fs')

function loadSkillFiles(skills) {
  return skills.map(skill => ({
    name: skill.name,
    description: skill.description,
    path: skill.path,
    content: fs.readFileSync(skill.path, 'utf8')
  }))
}

module.exports = { loadSkillFiles }
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: skill registry tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/skillRegistry.js tools/feishu-skill-agent/src/skillLoader.js tools/feishu-skill-agent/test/skillRegistry.test.js
git commit -m "feat(feishu-agent): discover and load skills"
```

## Task 5: Skill Selector

**Files:**
- Create: `tools/feishu-skill-agent/src/skillSelector.js`
- Create: `tools/feishu-skill-agent/test/skillSelector.test.js`

- [ ] **Step 1: Add selector tests**

Create `tools/feishu-skill-agent/test/skillSelector.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { selectSkills } = require('../src/skillSelector')

const skills = [
  { name: 'sdk-doc-sync', description: 'Sync SDK and API docs from source repositories', path: '/skills/sdk/SKILL.md' },
  { name: 'lark-doc', description: 'Read and edit Feishu or Lark docs', path: '/skills/lark/SKILL.md' },
  { name: 'systematic-debugging', description: 'Use when encountering any bug or test failure', path: '/skills/debug/SKILL.md' }
]

test('selectSkills honors explicit skill mention', () => {
  const selected = selectSkills('Use sdk-doc-sync to update Node docs', skills)
  assert.equal(selected[0].name, 'sdk-doc-sync')
  assert.match(selected[0].reason, /explicit/)
})

test('selectSkills infers docs and debugging skills', () => {
  const selected = selectSkills('Update Feishu docs and fix Docusaurus build failures', skills)
  assert.deepEqual(selected.map(skill => skill.name), ['lark-doc', 'systematic-debugging'])
})
```

- [ ] **Step 2: Implement selector**

Create `tools/feishu-skill-agent/src/skillSelector.js`:

```js
function scoreSkill(request, skill) {
  const text = request.toLowerCase()
  const name = skill.name.toLowerCase()
  const description = String(skill.description || '').toLowerCase()
  if (text.includes(name)) return { score: 100, reason: `explicit mention of ${skill.name}` }

  let score = 0
  const reasons = []
  for (const token of name.split(/[-_:]/).filter(Boolean)) {
    if (text.includes(token)) {
      score += 8
      reasons.push(`matched ${token}`)
    }
  }
  if (text.match(/\b(feishu|lark)\b/) && description.match(/\b(feishu|lark)\b/)) {
    score += 20
    reasons.push('matched Feishu/Lark docs intent')
  }
  if (text.match(/\b(sdk|api|client library|node|python|java|go)\b/) && description.match(/\b(sdk|api|source repositories)\b/)) {
    score += 20
    reasons.push('matched SDK/API docs intent')
  }
  if (text.match(/\b(error|failure|failed|fix|debug|build)\b/) && description.match(/\b(bug|failure|debug)\b/)) {
    score += 20
    reasons.push('matched debugging/build failure intent')
  }
  return { score, reason: reasons.join(', ') }
}

function selectSkills(request, skills, limit = 4) {
  return skills
    .map(skill => ({ ...skill, ...scoreSkill(request, skill) }))
    .filter(skill => skill.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ score, ...skill }) => skill)
}

module.exports = { selectSkills }
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: selector tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/skillSelector.js tools/feishu-skill-agent/test/skillSelector.test.js
git commit -m "feat(feishu-agent): select skills from requests"
```

## Task 6: Natural-Language Planner

**Files:**
- Create: `tools/feishu-skill-agent/src/planner.js`
- Create: `tools/feishu-skill-agent/test/planner.test.js`

- [ ] **Step 1: Add planner tests**

Create `tools/feishu-skill-agent/test/planner.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { createPlan } = require('../src/planner')

test('createPlan produces docs publish steps from natural language', () => {
  const plan = createPlan({
    requestText: 'Update Node docs from branch release/node-docs, deploy to UAT, wait for approval before prod.',
    loadedSkills: [{ name: 'sdk-doc-sync', path: '/skills/sdk/SKILL.md' }]
  })

  assert.equal(plan.needsClarification, false)
  assert.equal(plan.context.branch, 'release/node-docs')
  assert.equal(plan.steps[0].type, 'prepare_worktree')
  assert.equal(plan.steps.some(step => step.type === 'deploy_uat'), true)
  assert.equal(plan.steps.some(step => step.type === 'await_approval'), true)
})

test('createPlan asks clarification when branch is missing', () => {
  const plan = createPlan({
    requestText: 'Update Node docs and deploy to UAT.',
    loadedSkills: []
  })

  assert.equal(plan.needsClarification, true)
  assert.match(plan.question, /branch/)
})
```

- [ ] **Step 2: Implement planner**

Create `tools/feishu-skill-agent/src/planner.js`:

```js
function inferBranch(text) {
  const match = text.match(/\bbranch\s+([A-Za-z0-9._/-]+)/i) || text.match(/\bfrom\s+branch\s+([A-Za-z0-9._/-]+)/i)
  return match ? match[1] : null
}

function inferManual(text) {
  const lower = text.toLowerCase()
  if (lower.includes('node')) return 'node'
  if (lower.includes('python')) return 'python'
  if (lower.includes('java')) return 'java'
  if (lower.includes('go')) return 'go'
  if (lower.includes('guide')) return 'guides'
  return null
}

function createPlan({ requestText, loadedSkills }) {
  const branch = inferBranch(requestText)
  if (!branch) {
    return {
      needsClarification: true,
      question: 'Which branch should I check out for this docs update?',
      context: {},
      steps: []
    }
  }

  const manual = inferManual(requestText)
  const context = {
    branch,
    manual,
    skillNames: loadedSkills.map(skill => skill.name)
  }

  const steps = [
    { type: 'prepare_worktree', title: 'Prepare isolated git worktree' },
    { type: 'fetch_or_update_docs', title: 'Fetch or update requested docs' },
    { type: 'build_docs', title: 'Run Docusaurus build pipeline' },
    { type: 'repair_if_needed', title: 'Use Codex with loaded skill guidance if build fails' },
    { type: 'deploy_uat', title: 'Deploy exact commit to UAT through Jenkins' },
    { type: 'await_approval', title: 'Wait for authorized Feishu approval before production' },
    { type: 'deploy_production', title: 'Deploy approved commit to production through Jenkins' }
  ]

  return { needsClarification: false, question: null, context, steps }
}

module.exports = { createPlan }
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: planner tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/planner.js tools/feishu-skill-agent/test/planner.test.js
git commit -m "feat(feishu-agent): plan natural language requests"
```

## Task 7: Control Message Parser

**Files:**
- Create: `tools/feishu-skill-agent/src/controlParser.js`
- Create: `tools/feishu-skill-agent/test/controlParser.test.js`

- [ ] **Step 1: Add control parser tests**

Create `tools/feishu-skill-agent/test/controlParser.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { parseControlMessage } = require('../src/controlParser')

test('parse status control message', () => {
  assert.deepEqual(parseControlMessage('@docs-agent status skillrun_1'), {
    type: 'status',
    runId: 'skillrun_1'
  })
})

test('parse approve control message', () => {
  assert.deepEqual(parseControlMessage('@docs-agent approve skillrun_1'), {
    type: 'approve',
    runId: 'skillrun_1'
  })
})

test('non-control text returns null', () => {
  assert.equal(parseControlMessage('@docs-agent Please update the docs from branch dev'), null)
})
```

- [ ] **Step 2: Implement control parser**

Create `tools/feishu-skill-agent/src/controlParser.js`:

```js
function parseControlMessage(text) {
  const clean = String(text || '').replace(/^@\S+\s+/, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  const verb = parts[0]
  if (!['status', 'approve', 'reject', 'stop'].includes(verb)) return null
  const runId = parts[1]
  if (!runId || !runId.startsWith('skillrun_')) throw new Error(`Invalid run id: ${runId || ''}`)
  if (verb === 'reject') {
    const reason = clean.includes('reason=') ? clean.split('reason=').slice(1).join('reason=').trim() : 'Rejected in Feishu'
    return { type: 'reject', runId, reason }
  }
  return { type: verb, runId }
}

module.exports = { parseControlMessage }
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: control parser tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/controlParser.js tools/feishu-skill-agent/test/controlParser.test.js
git commit -m "feat(feishu-agent): parse control messages"
```

## Task 8: Codex Worker Prompt Builder

**Files:**
- Create: `tools/feishu-skill-agent/src/codexWorker.js`
- Create: `tools/feishu-skill-agent/test/codexWorker.test.js`

- [ ] **Step 1: Add Codex prompt tests**

Create `tools/feishu-skill-agent/test/codexWorker.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { buildCodexPrompt } = require('../src/codexWorker')

test('buildCodexPrompt includes skills, step, and safety gates', () => {
  const prompt = buildCodexPrompt({
    run: {
      id: 'skillrun_1',
      request_text: 'Update docs from branch dev',
      branch: 'dev'
    },
    loadedSkills: [
      { name: 'sdk-doc-sync', path: '/skills/sdk/SKILL.md', content: '# SDK sync\nFollow source verification.' }
    ],
    step: { type: 'repair_if_needed', title: 'Fix build failure' },
    logPath: '/tmp/build.log',
    allowedEditRoots: ['docs/**', 'plugins/lark-docs/**'],
    verificationCommand: 'pnpm run build'
  })

  assert.match(prompt, /skillrun_1/)
  assert.match(prompt, /sdk-doc-sync/)
  assert.match(prompt, /Follow source verification/)
  assert.match(prompt, /Do not deploy/)
  assert.match(prompt, /pnpm run build/)
})
```

- [ ] **Step 2: Implement Codex prompt builder**

Create `tools/feishu-skill-agent/src/codexWorker.js`:

```js
const path = require('node:path')
const { runCommand } = require('./commandRunner')

function buildCodexPrompt({ run, loadedSkills, step, logPath, allowedEditRoots, verificationCommand }) {
  const skillBlocks = loadedSkills.map(skill => [
    `## Skill: ${skill.name}`,
    `Path: ${skill.path}`,
    skill.content
  ].join('\n')).join('\n\n')

  return [
    `You are executing Feishu agent run ${run.id}.`,
    `Original Feishu request: ${run.request_text}`,
    `Branch: ${run.branch || 'unknown'}`,
    '',
    '# Loaded Skill Instructions',
    skillBlocks || 'No skill files were loaded for this step.',
    '',
    '# Current Step',
    `${step.type}: ${step.title}`,
    logPath ? `Failure log path: ${logPath}` : '',
    '',
    '# Allowed Edits',
    allowedEditRoots.map(root => `- ${root}`).join('\n'),
    '',
    '# Verification',
    `Run ${verificationCommand} before finishing.`,
    '',
    '# Safety',
    'Do not deploy, approve production, edit credentials, print secrets, or make unrelated refactors.'
  ].filter(Boolean).join('\n')
}

async function runCodexStep({ run, worktreePath, loadedSkills, step, logDir, logPath, allowedEditRoots, verificationCommand }) {
  const prompt = buildCodexPrompt({ run, loadedSkills, step, logPath, allowedEditRoots, verificationCommand })
  return runCommand({
    cmd: 'codex',
    args: ['exec', '--cd', worktreePath, prompt],
    cwd: worktreePath,
    logPath: path.join(logDir, `codex-${step.type}.log`)
  })
}

module.exports = { buildCodexPrompt, runCodexStep }
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: Codex prompt tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/codexWorker.js tools/feishu-skill-agent/test/codexWorker.test.js
git commit -m "feat(feishu-agent): build skill-aware codex prompts"
```

## Task 9: Command Runner, Worktree, Jenkins

**Files:**
- Create: `tools/feishu-skill-agent/src/commandRunner.js`
- Create: `tools/feishu-skill-agent/src/worktree.js`
- Create: `tools/feishu-skill-agent/src/jenkins.js`
- Create: `tools/feishu-skill-agent/test/adapters.test.js`

- [ ] **Step 1: Implement command runner**

Create `tools/feishu-skill-agent/src/commandRunner.js`:

```js
const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')

function runCommand({ cmd, args = [], cwd, env = {}, logPath, timeoutMs = 30 * 60 * 1000 }) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true })
  const output = fs.createWriteStream(logPath, { flags: 'a' })
  output.write(`$ ${cmd} ${args.join(' ')}\n`)

  return new Promise(resolve => {
    const child = spawn(cmd, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    })
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      output.write(`\n[timeout ${timeoutMs}ms]\n`)
    }, timeoutMs)
    child.stdout.pipe(output, { end: false })
    child.stderr.pipe(output, { end: false })
    child.on('close', code => {
      clearTimeout(timer)
      output.write(`\n[exit ${code}]\n`)
      output.end()
      resolve({ code, logPath })
    })
  })
}

module.exports = { runCommand }
```

- [ ] **Step 2: Implement worktree manager**

Create `tools/feishu-skill-agent/src/worktree.js`:

```js
const fs = require('node:fs')
const path = require('node:path')
const { runCommand } = require('./commandRunner')

async function prepareWorktree({ repoRoot, worktreePath, branch, logDir }) {
  fs.mkdirSync(path.dirname(worktreePath), { recursive: true })
  const fetch = await runCommand({
    cmd: 'git',
    args: ['fetch', 'origin', branch],
    cwd: repoRoot,
    logPath: path.join(logDir, 'git-fetch.log')
  })
  if (fetch.code !== 0) return fetch
  return runCommand({
    cmd: 'git',
    args: ['worktree', 'add', '-B', branch, worktreePath, `origin/${branch}`],
    cwd: repoRoot,
    logPath: path.join(logDir, 'git-worktree-add.log')
  })
}

module.exports = { prepareWorktree }
```

- [ ] **Step 3: Implement Jenkins helpers**

Create `tools/feishu-skill-agent/src/jenkins.js`:

```js
function buildJobUrl(baseUrl, jobName) {
  return `${baseUrl.replace(/\/$/, '')}/job/${jobName.split('/').map(encodeURIComponent).join('/job/')}`
}

function buildJobParameters({ run }) {
  return {
    BRANCH: run.branch || '',
    COMMIT_SHA: run.commit_sha || '',
    REQUEST_TEXT: run.request_text,
    REQUESTED_BY: run.requested_by.open_id,
    RUN_ID: run.id
  }
}

class JenkinsClient {
  constructor(config) {
    this.config = config
  }

  authHeader() {
    return `Basic ${Buffer.from(`${this.config.user}:${this.config.token}`).toString('base64')}`
  }

  async trigger(jobName, params) {
    const url = new URL(`${buildJobUrl(this.config.baseUrl, jobName)}/buildWithParameters`)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value || '')
    const response = await fetch(url, { method: 'POST', headers: { Authorization: this.authHeader() } })
    if (!response.ok) throw new Error(`Jenkins trigger failed: ${response.status} ${response.statusText}`)
    return response.headers.get('location') || buildJobUrl(this.config.baseUrl, jobName)
  }
}

module.exports = { JenkinsClient, buildJobUrl, buildJobParameters }
```

- [ ] **Step 4: Add adapter tests**

Create `tools/feishu-skill-agent/test/adapters.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { runCommand } = require('../src/commandRunner')
const { prepareWorktree } = require('../src/worktree')
const { buildJobUrl, buildJobParameters } = require('../src/jenkins')

test('adapters export expected functions', () => {
  assert.equal(typeof runCommand, 'function')
  assert.equal(typeof prepareWorktree, 'function')
  assert.equal(buildJobUrl('https://jenkins.example', 'docs/deploy-uat'), 'https://jenkins.example/job/docs/job/deploy-uat')
  assert.equal(buildJobParameters({ run: { id: 'skillrun_1', request_text: 'x', requested_by: { open_id: 'ou_a' } } }).RUN_ID, 'skillrun_1')
})
```

- [ ] **Step 5: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: adapter tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/commandRunner.js tools/feishu-skill-agent/src/worktree.js tools/feishu-skill-agent/src/jenkins.js tools/feishu-skill-agent/test/adapters.test.js
git commit -m "feat(feishu-agent): add execution adapters"
```

## Task 10: Plan Executor

**Files:**
- Create: `tools/feishu-skill-agent/src/executor.js`
- Create: `tools/feishu-skill-agent/test/executor.test.js`

- [ ] **Step 1: Add executor approval gate test**

Create `tools/feishu-skill-agent/test/executor.test.js`:

```js
const assert = require('node:assert/strict')
const { test } = require('node:test')
const { shouldDeployProduction } = require('../src/executor')

test('shouldDeployProduction requires approved exact commit', () => {
  assert.equal(shouldDeployProduction({
    status: 'approved',
    commit_sha: 'abc123',
    approval: { status: 'approved', approved_commit_sha: 'abc123' }
  }), true)

  assert.equal(shouldDeployProduction({
    status: 'approved',
    commit_sha: 'abc123',
    approval: { status: 'approved', approved_commit_sha: 'def456' }
  }), false)
})
```

- [ ] **Step 2: Implement executor skeleton**

Create `tools/feishu-skill-agent/src/executor.js`:

```js
function shouldDeployProduction(run) {
  return run.status === 'approved'
    && run.approval.status === 'approved'
    && Boolean(run.commit_sha)
    && run.approval.approved_commit_sha === run.commit_sha
}

async function executeRun({ run, store, plan, loadedSkills, adapters }) {
  if (plan.needsClarification) {
    return store.transition(run.id, 'awaiting_clarification', { clarification_question: plan.question }, plan.question)
  }

  store.transition(run.id, 'preparing_worktree', { branch: plan.context.branch, plan: plan.steps }, 'Preparing worktree')
  const logDir = adapters.logDirFor(run.id)
  const prepared = await adapters.prepareWorktree({ branch: plan.context.branch, worktreePath: run.worktree, logDir })
  if (prepared.code !== 0) return store.transition(run.id, 'failed', {}, `Worktree failed: ${prepared.logPath}`)

  store.transition(run.id, 'executing', {}, 'Running docs publishing workflow')
  const build = await adapters.runDocsBuild({ run: store.get(run.id), plan, logDir })
  if (build.code !== 0) {
    store.transition(run.id, 'agent_fixing', {}, `Build failed: ${build.logPath}`)
    const repaired = await adapters.runCodexStep({
      run: store.get(run.id),
      loadedSkills,
      step: { type: 'repair_if_needed', title: 'Fix docs build failure' },
      logPath: build.logPath,
      logDir
    })
    if (repaired.code !== 0) return store.transition(run.id, 'failed', {}, `Codex repair failed: ${repaired.logPath}`)
  }

  store.transition(run.id, 'uat_deploying', {}, 'Deploying UAT')
  const uatUrl = await adapters.deployUat(store.get(run.id))
  return store.transition(run.id, 'awaiting_approval', { uat: uatUrl }, 'UAT ready; awaiting approval')
}

module.exports = { shouldDeployProduction, executeRun }
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: executor tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/executor.js tools/feishu-skill-agent/test/executor.test.js
git commit -m "feat(feishu-agent): execute skill plans"
```

## Task 11: Feishu Long-Connection Runtime

**Files:**
- Create: `tools/feishu-skill-agent/src/feishu.js`
- Modify: `tools/feishu-skill-agent/src/index.js`

- [ ] **Step 1: Implement Feishu service wrapper**

Create `tools/feishu-skill-agent/src/feishu.js`:

```js
const lark = require('@larksuiteoapi/node-sdk')
const { parseControlMessage } = require('./controlParser')

function isAllowed(openId, allowed) {
  return allowed.length === 0 || allowed.includes(openId)
}

function createFeishuService({ config, store, orchestrator }) {
  const client = new lark.Client({ appId: config.feishu.appId, appSecret: config.feishu.appSecret })

  async function reply(chatId, text) {
    await client.im.message.create({
      params: { receive_id_type: 'chat_id' },
      data: { receive_id: chatId, msg_type: 'text', content: JSON.stringify({ text }) }
    })
  }

  async function handleTextMessage(event) {
    const message = event.event.message
    const sender = event.event.sender.sender_id
    const openId = sender.open_id || sender.user_id
    const chatId = message.chat_id
    const text = JSON.parse(message.content || '{}').text || ''

    const control = parseControlMessage(text)
    if (control) {
      await orchestrator.handleControl({ control, openId, chatId, reply })
      return
    }

    if (!isAllowed(openId, config.allowedRequesters)) {
      await reply(chatId, 'You are not allowed to create agent runs.')
      return
    }

    const run = store.createRun({
      requestedBy: { open_id: openId },
      chatId,
      messageId: message.message_id,
      requestText: text,
      worktreeRoot: config.worktreeRoot
    })
    await reply(chatId, `Created agent run ${run.id}. I will select skills, plan the work, and report progress here.`)
    orchestrator.enqueue(run.id)
  }

  function start() {
    const eventDispatcher = new lark.EventDispatcher({ encryptKey: config.feishu.encryptKey })
      .register({ 'im.message.receive_v1': handleTextMessage })
    const wsClient = new lark.WSClient({
      appId: config.feishu.appId,
      appSecret: config.feishu.appSecret,
      eventDispatcher
    })
    wsClient.start()
  }

  return { start, handleTextMessage }
}

module.exports = { createFeishuService }
```

- [ ] **Step 2: Wire startup**

Replace `tools/feishu-skill-agent/src/index.js` with startup wiring that constructs config, run store, skill registry, selector, loader, planner, executor adapters, Jenkins client, and Feishu service. Keep orchestration in a small queue object so only one docs run executes at a time in this repo.

Use this shape:

```js
const path = require('node:path')
const { loadConfig } = require('./config')
const { RunStore } = require('./runStore')
const { discoverSkills } = require('./skillRegistry')
const { selectSkills } = require('./skillSelector')
const { loadSkillFiles } = require('./skillLoader')
const { createPlan } = require('./planner')
const { createFeishuService } = require('./feishu')

function createOrchestrator({ config, store }) {
  let running = Promise.resolve()
  const repoRoot = path.resolve(__dirname, '../../..')
  return {
    enqueue(runId) {
      running = running.then(async () => {
        const run = store.get(runId)
        store.transition(runId, 'selecting_skills', {}, 'Selecting skills')
        const skills = discoverSkills(config.skillRoots)
        const selected = selectSkills(run.request_text, skills)
        store.transition(runId, 'loading_skills', { selected_skills: selected }, 'Loading selected skills')
        const loaded = loadSkillFiles(selected)
        store.transition(runId, 'planning', { loaded_skill_files: loaded.map(skill => skill.path) }, 'Planning run')
        const plan = createPlan({ requestText: run.request_text, loadedSkills: loaded, repoRoot })
        store.transition(runId, plan.needsClarification ? 'awaiting_clarification' : 'queued', { plan }, plan.question || 'Plan ready')
      }).catch(error => {
        console.error(error)
        store.transition(runId, 'failed', {}, error.message)
      })
    },
    async handleControl({ control, openId, reply, chatId }) {
      const run = store.get(control.runId)
      if (control.type === 'status') {
        await reply(chatId, `${run.id}: ${run.status}`)
      }
    }
  }
}

function main() {
  const config = loadConfig()
  const store = new RunStore(config.runRoot)
  const orchestrator = createOrchestrator({ config, store })
  createFeishuService({ config, store, orchestrator }).start()
  console.log(`feishu-skill-agent started for ${config.feishu.agentName}`)
}

if (require.main === module) main()

module.exports = { main, createOrchestrator }
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm feishu-skill-agent:test
```

Expected: all unit tests pass.

Commit:

```bash
git add tools/feishu-skill-agent/src/feishu.js tools/feishu-skill-agent/src/index.js
git commit -m "feat(feishu-agent): receive natural language requests"
```

## Task 12: Local End-To-End Dry Run

**Files:**
- Use: `.env.feishu-skill-agent`
- Use: `.claude/feishu-skill-agent/runs`
- Use: `.claude/feishu-skill-agent/logs`

- [ ] **Step 1: Install dependencies**

Run:

```bash
pnpm install
```

Expected: dependencies install successfully.

- [ ] **Step 2: Create local environment file**

Copy `.env.feishu-skill-agent.example` to `.env.feishu-skill-agent` and replace the Feishu app credentials, Jenkins token, allowed Feishu open IDs, and skill roots. Keep `.env.feishu-skill-agent` untracked.

- [ ] **Step 3: Start the agent**

Run:

```bash
pnpm feishu-skill-agent:start
```

Expected: `feishu-skill-agent started for docs-agent`, and the process remains connected to Feishu.

- [ ] **Step 4: Send a natural Feishu task**

In Feishu, send:

```text
@docs-agent Please update the Node docs from branch release/node-docs.
Follow the SDK doc sync workflow, fix build errors if any, deploy to UAT,
and wait for my approval before production.
```

Expected: the agent creates a run, selects and loads relevant skills, writes a plan, and replies with the run id.

- [ ] **Step 5: Inspect run trace**

Run:

```bash
find .claude/feishu-skill-agent/runs -maxdepth 1 -type f
```

Expected: a JSON run file contains `selected_skills`, `loaded_skill_files`, and `plan`.

- [ ] **Step 6: Approve after UAT**

After the agent posts a UAT URL, send:

```text
@docs-agent approve <run-id>
```

Expected: production deployment starts only if the approval user is authorized and the approved commit SHA matches the UAT commit SHA.

## Self-Review

- Spec coverage: The plan covers Feishu long connection, natural-language request ingestion, skill discovery, skill selection, complete `SKILL.md` loading, run persistence, planning, isolated worktrees, Codex skill-aware prompts, Jenkins UAT deployment, approval, production deployment, and status control.
- Placeholder scan: Example environment values are intentionally non-secret placeholders. Implementation tasks include concrete file paths, code blocks, commands, and expected results.
- Type consistency: The run model uses `skillrun_*` ids, `selected_skills`, `loaded_skill_files`, `plan`, `worktree`, `commit_sha`, `uat`, and `approval` consistently.
- Scope check: This implements an internal Feishu skill agent for docs workflows. Public hosting, arbitrary untrusted skill loading, and replacing Jenkins remain outside scope.
