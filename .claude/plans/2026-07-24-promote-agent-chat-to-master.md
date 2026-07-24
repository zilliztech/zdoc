# Promote Agent Chat Integration to Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the UAT-verified agent chat integration to `master` through a focused branch and make one Docker image select the development or production agent configuration from the runtime hostname.

**Architecture:** Cherry-pick only the seven verified chat implementation commits from `dev` onto `codex/promote-agent-chat-to-master`, which is based on `origin/master`. Keep the same in-cluster `cloud-ai-assistant` routing, same-origin browser endpoints, fixed `site: "docs.zilliz.com"`, and token-free Nginx client. Replace build-time `CHAT_AGENT_CONFIG_CODE` wiring with a small runtime hostname selector used when each chat request is created.

**Tech Stack:** Git, Docusaurus 3, React 18, TypeScript 5.6, Vitest, Testing Library, Playwright, Nginx, Docker, Kubernetes.

---

## File Structure

- Create `src/components/ChatPanel/agentConfig.ts`: map the deployed browser hostname to `zilliz_agent_dev` or `zilliz_agent_prod`.
- Create `src/components/ChatPanel/agentConfig.test.ts`: unit coverage for production, UAT, local, and server-side/default hostname behavior.
- Modify `src/components/ChatPanel/ChatContext.tsx`: resolve `agent_config_code` at request time instead of accepting a build-time provider prop.
- Modify `src/components/ChatPanel/ChatContext.test.tsx`: mock the selector at the request boundary and prove both development and production request bodies.
- Modify `src/theme/DocRoot/Layout/index.tsx`: stop reading and forwarding `chatAgentConfigCode`.
- Modify `src/theme/NotFound/Content/index.tsx`: stop reading and forwarding `chatAgentConfigCode`.
- Modify `docusaurus.config.ts`: remove the build-time `chatAgentConfigCode` custom field.
- Modify `Dockerfile`: remove the `CHAT_AGENT_CONFIG_CODE` build argument and environment value.
- Modify `scripts/chat-agent-nginx.test.js`: assert the image and static configuration do not contain build-time chat agent selection or client authentication.
- Retain the cherry-picked parser, streaming, session, Nginx, shared chat-ui type, and browser contract files unchanged except where runtime selection requires edits.
- Retain `.claude/specs/2026-07-24-promote-agent-chat-to-master-design.md` as the authoritative corrected architecture record.

### Task 1: Promote only the verified UAT implementation commits

**Files:**
- Modify through cherry-pick: `Dockerfile`
- Modify through cherry-pick: `docker-entrypoint.d/40-zdoc-env.sh`
- Modify through cherry-pick: `docusaurus.config.ts`
- Modify through cherry-pick: `nginx.conf`
- Modify through cherry-pick: `package.json`
- Modify through cherry-pick: `packages/chat-ui/dist/types.d.ts`
- Modify through cherry-pick: `packages/chat-ui/dist/types.d.ts.map`
- Modify through cherry-pick: `packages/chat-ui/src/types.ts`
- Create through cherry-pick: `scripts/chat-agent-nginx.test.js`
- Modify through cherry-pick: `src/components/ChatPanel/ChatContext.test.tsx`
- Modify through cherry-pick: `src/components/ChatPanel/ChatContext.tsx`
- Create through cherry-pick: `src/components/ChatPanel/agentStream.test.ts`
- Create through cherry-pick: `src/components/ChatPanel/agentStream.ts`
- Modify through cherry-pick: `src/components/ChatPanel/index.tsx`
- Modify through cherry-pick: `src/components/ChatPanel/types.ts`
- Modify through cherry-pick: `src/theme/DocRoot/Layout/index.tsx`
- Modify through cherry-pick: `src/theme/NotFound/Content/index.tsx`
- Modify through cherry-pick: `tests/chat.spec.ts`

- [ ] **Step 1: Confirm the promotion branch and clean worktree**

Run:

```bash
git branch --show-current
git status --short
git merge-base HEAD origin/master
```

Expected:

- branch is `codex/promote-agent-chat-to-master`;
- `git status --short` is empty;
- the merge base is the current `origin/master` commit used to create the branch.

- [ ] **Step 2: Cherry-pick the verified commits in dependency order**

Run:

```bash
git cherry-pick \
  8f2198806 \
  864e283b0 \
  84c751268 \
  ec4e5e20d \
  68fe77f46 \
  e3125bf3e \
  830b6bb44
```

Expected: seven commits apply cleanly. If a conflict occurs, stop and compare the conflicted file against both `origin/master` and `origin/dev`; do not accept either side wholesale.

- [ ] **Step 3: Verify the promotion diff contains only chat integration files**

Run:

```bash
git diff --name-only origin/master...HEAD
git diff origin/master...HEAD --check
```

Expected: only the design specification and files listed in this task appear; no generated documentation, translation cache, workflow, or unrelated plugin files appear.

- [ ] **Step 4: Run the cherry-picked UAT contract tests**

Run:

```bash
pnpm vitest run src/components/ChatPanel/agentStream.test.ts src/components/ChatPanel/ChatContext.test.tsx
pnpm test:chat-agent-config
```

Expected: parser/context tests and both Nginx policy tests pass before runtime selector work begins.

### Task 2: Add the runtime hostname selector

**Files:**
- Create: `src/components/ChatPanel/agentConfig.test.ts`
- Create: `src/components/ChatPanel/agentConfig.ts`

- [ ] **Step 1: Write the failing hostname selector tests**

Create `src/components/ChatPanel/agentConfig.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {getChatAgentConfigCode} from './agentConfig';

describe('getChatAgentConfigCode', () => {
  it('uses the production agent on the production docs hostname', () => {
    expect(getChatAgentConfigCode('docs.zilliz.com')).toBe('zilliz_agent_prod');
  });

  it('uses the development agent on UAT and preview hostnames', () => {
    expect(getChatAgentConfigCode('docs.cloud-uat3.zilliz.com')).toBe('zilliz_agent_dev');
    expect(getChatAgentConfigCode('preview.example.com')).toBe('zilliz_agent_dev');
  });

  it('uses the development agent locally and without a browser hostname', () => {
    expect(getChatAgentConfigCode('localhost')).toBe('zilliz_agent_dev');
    expect(getChatAgentConfigCode('')).toBe('zilliz_agent_dev');
  });
});
```

- [ ] **Step 2: Run the selector test and verify RED**

Run:

```bash
pnpm vitest run src/components/ChatPanel/agentConfig.test.ts
```

Expected: FAIL because `./agentConfig` does not exist.

- [ ] **Step 3: Implement the hostname selector**

Create `src/components/ChatPanel/agentConfig.ts`:

```ts
export type ChatAgentConfigCode = 'zilliz_agent_dev' | 'zilliz_agent_prod';

export function getChatAgentConfigCode(hostname?: string): ChatAgentConfigCode {
  const resolvedHostname = hostname ?? (
    typeof window === 'undefined' ? '' : window.location.hostname
  );

  return resolvedHostname === 'docs.zilliz.com'
    ? 'zilliz_agent_prod'
    : 'zilliz_agent_dev';
}
```

- [ ] **Step 4: Run the selector test and verify GREEN**

Run:

```bash
pnpm vitest run src/components/ChatPanel/agentConfig.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit the selector**

```bash
git add src/components/ChatPanel/agentConfig.ts src/components/ChatPanel/agentConfig.test.ts
git commit -m "feat(chat): select agent config from runtime hostname"
```

### Task 3: Use runtime selection in every chat request

**Files:**
- Modify: `src/components/ChatPanel/ChatContext.test.tsx`
- Modify: `src/components/ChatPanel/ChatContext.tsx`

- [ ] **Step 1: Add a controllable selector mock to the context tests**

Near the existing module mocks in `ChatContext.test.tsx`, add:

```ts
const {getChatAgentConfigCodeMock} = vi.hoisted(() => ({
  getChatAgentConfigCodeMock: vi.fn(() => 'zilliz_agent_dev'),
}));

vi.mock('./agentConfig', () => ({
  getChatAgentConfigCode: getChatAgentConfigCodeMock,
}));
```

In `beforeEach`, reset the selector explicitly:

```ts
getChatAgentConfigCodeMock.mockReset();
getChatAgentConfigCodeMock.mockReturnValue('zilliz_agent_dev');
```

Update the wrapper to remove `agentConfigCode`:

```tsx
function wrapper(debugDefault = false) {
  return function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <ChatProvider chatEndpoint="/api/chat" debugDefault={debugDefault}>
        {children}
      </ChatProvider>
    );
  };
}
```

- [ ] **Step 2: Add a failing production request-contract test**

Add after the existing development request-contract test:

```ts
it('uses the production agent config selected from the runtime hostname', async () => {
  getChatAgentConfigCodeMock.mockReturnValue('zilliz_agent_prod');
  const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

  await act(async () => {
    await result.current.send('production question');
  });

  const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
  expect(JSON.parse(init.body as string)).toMatchObject({
    site: 'docs.zilliz.com',
    agent_config: {agent_config_code: 'zilliz_agent_prod'},
  });
});
```

- [ ] **Step 3: Run the two request tests and verify RED**

Run:

```bash
pnpm vitest run src/components/ChatPanel/ChatContext.test.tsx -t "request contract|production agent config"
```

Expected: FAIL because `ChatProvider` still requires `agentConfigCode` and request construction still reads the prop.

- [ ] **Step 4: Resolve the selector when constructing the request**

In `ChatContext.tsx`, import:

```ts
import {getChatAgentConfigCode} from './agentConfig';
```

Change the provider interface and function signature to:

```tsx
interface ChatProviderProps {
  chatEndpoint: string;
  debugDefault?: boolean;
  children: React.ReactNode;
}

export function ChatProvider({chatEndpoint, debugDefault = false, children}: ChatProviderProps) {
```

Immediately before constructing `requestBody`, resolve the runtime code:

```ts
const agentConfigCode = getChatAgentConfigCode();
const requestBody = {
  message: outgoing,
  session_id: sessionIdRef.current,
  conversationId,
  streaming_mode: 'token',
  site: 'docs.zilliz.com',
  agent_config: {agent_config_code: agentConfigCode},
};
```

Keep the existing redacted debug field `agentConfigCode`. Remove `agentConfigCode` from the `send` callback dependency list, leaving:

```ts
}, [chatDebug, chatEndpoint, location.pathname]);
```

- [ ] **Step 5: Run the complete ChatContext suite and verify GREEN**

Run:

```bash
pnpm vitest run src/components/ChatPanel/ChatContext.test.tsx
```

Expected: all request, debug, streaming, session, history, interrupt, and stale-event tests pass, including the production agent assertion.

- [ ] **Step 6: Commit runtime request selection**

```bash
git add src/components/ChatPanel/ChatContext.tsx src/components/ChatPanel/ChatContext.test.tsx
git commit -m "feat(chat): resolve agent config at request time"
```

### Task 4: Remove build-time agent configuration wiring

**Files:**
- Modify: `Dockerfile`
- Modify: `docusaurus.config.ts`
- Modify: `scripts/chat-agent-nginx.test.js`
- Modify: `src/theme/DocRoot/Layout/index.tsx`
- Modify: `src/theme/NotFound/Content/index.tsx`

- [ ] **Step 1: Add a failing portability policy test**

At the top of `scripts/chat-agent-nginx.test.js`, add:

```js
const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
const docusaurusConfig = fs.readFileSync('docusaurus.config.ts', 'utf8');
```

Add this test:

```js
test('selects the agent at browser runtime instead of image build time', () => {
  assert.doesNotMatch(dockerfile, /CHAT_AGENT_CONFIG_CODE/);
  assert.doesNotMatch(docusaurusConfig, /chatAgentConfigCode/);
  assert.doesNotMatch(docusaurusConfig, /CHAT_AGENT_CONFIG_CODE/);
});
```

- [ ] **Step 2: Run the portability test and verify RED**

Run:

```bash
pnpm test:chat-agent-config
```

Expected: FAIL because `Dockerfile` and `docusaurus.config.ts` still contain build-time agent configuration.

- [ ] **Step 3: Remove Docker and Docusaurus build-time configuration**

Delete from the Docker build stage:

```dockerfile
ARG CHAT_AGENT_CONFIG_CODE=zilliz_agent_dev
ENV CHAT_AGENT_CONFIG_CODE=${CHAT_AGENT_CONFIG_CODE}
```

Delete from `docusaurus.config.ts`:

```ts
chatAgentConfigCode: process.env.CHAT_AGENT_CONFIG_CODE || 'zilliz_agent_dev',
```

- [ ] **Step 4: Remove duplicated provider wiring**

In `src/theme/DocRoot/Layout/index.tsx`, delete:

```ts
const agentConfigCode = (siteConfig.customFields?.chatAgentConfigCode as string) || 'zilliz_agent_dev';
```

Change the provider to:

```tsx
<ChatProvider chatEndpoint={chatEndpoint} debugDefault={chatDebug}>
```

Make the same two changes in `src/theme/NotFound/Content/index.tsx`.

- [ ] **Step 5: Run policy, context, and type checks and verify GREEN**

Run:

```bash
pnpm test:chat-agent-config
pnpm vitest run src/components/ChatPanel/agentConfig.test.ts src/components/ChatPanel/ChatContext.test.tsx
pnpm typecheck
```

Expected: policy tests pass, selector/context tests pass, and TypeScript exits 0 with no remaining `agentConfigCode` prop usage.

- [ ] **Step 6: Commit image portability**

```bash
git add Dockerfile docusaurus.config.ts scripts/chat-agent-nginx.test.js src/theme/DocRoot/Layout/index.tsx src/theme/NotFound/Content/index.tsx
git commit -m "fix(chat): make the image environment portable"
```

### Task 5: Align the browser test with runtime hostname behavior

**Files:**
- Modify: `tests/chat.spec.ts`

- [ ] **Step 1: Make the UAT hostname expectation explicit**

Keep the existing `agent_config_code: 'zilliz_agent_dev'` assertion and add a hostname assertion immediately before sending the message:

```ts
expect(new URL(page.url()).hostname).toBe('localhost');
```

The local Playwright server represents a non-production deployment, so the expected request remains:

```ts
agent_config: {agent_config_code: 'zilliz_agent_dev'},
```

- [ ] **Step 2: Run the browser contract test**

Run:

```bash
pnpm playwright test tests/chat.spec.ts --project=chromium
```

Expected: 1 Chromium test passes after clicking `Ask AI`, and the captured same-origin request uses `zilliz_agent_dev`, `site: 'docs.zilliz.com'`, and no authorization token.

- [ ] **Step 3: Commit the browser assertion**

```bash
git add tests/chat.spec.ts
git commit -m "test(chat): verify non-production runtime selection"
```

### Task 6: Run the complete promotion verification gate

**Files:**
- No source changes expected.

- [ ] **Step 1: Run focused chat tests**

```bash
pnpm vitest run src/components/ChatPanel/agentConfig.test.ts src/components/ChatPanel/agentStream.test.ts src/components/ChatPanel/ChatContext.test.tsx
pnpm test:chat-agent-config
pnpm playwright test tests/chat.spec.ts --project=chromium
```

Expected: every focused test passes.

- [ ] **Step 2: Run package and repository verification**

```bash
pnpm --filter @zdoc/chat-ui build
pnpm typecheck
pnpm check:static-env
pnpm test:frontend
pnpm build
```

Expected: all commands exit 0. Existing Docusaurus broken-link warnings may remain, but no new chat-related build error is allowed.

- [ ] **Step 3: Build and validate the portable container without chat environment variables**

```bash
docker build -t zdoc-chat-runtime-hostname-test .
docker run --rm zdoc-chat-runtime-hostname-test nginx -t
```

Expected: Docker build exits 0 and `nginx -t` succeeds without `CHAT_AGENT_AUTH_TOKEN` or `CHAT_AGENT_CONFIG_CODE`.

- [ ] **Step 4: Inspect diff and environment boundaries**

```bash
git diff origin/master...HEAD --check
git diff --name-only origin/master...HEAD
rg -n "CHAT_AGENT_AUTH_TOKEN|CHAT_AGENT_CONFIG_CODE|proxy_set_header Authorization|Bearer 123456" Dockerfile docker-entrypoint.d docusaurus.config.ts nginx.conf src static build
```

Expected:

- no whitespace errors;
- only the intended chat and planning files appear;
- no token requirement or authorization proxy header appears;
- no build-time agent configuration variable appears;
- test assertions may mention prohibited strings only inside negative `doesNotMatch` checks.

- [ ] **Step 5: Confirm downstream scope**

Run:

```bash
rg -n "InkeepChatButton" ../zdoc_cn/src/theme/Root.js
git -C ../zdoc_cn status --short
```

Expected: zdoc_cn still uses its independent Inkeep integration and has no changes caused by this promotion. Do not modify or clean unrelated downstream worktree changes if any are reported.

- [ ] **Step 6: Commit verification-only corrections if required**

If verification requires a source correction, add a failing regression test first, implement the smallest fix, rerun the affected command and the focused chat suite, then commit:

```bash
git add Dockerfile docusaurus.config.ts docker-entrypoint.d/40-zdoc-env.sh nginx.conf package.json packages/chat-ui src/components/ChatPanel src/theme/DocRoot/Layout/index.tsx src/theme/NotFound/Content/index.tsx scripts/chat-agent-nginx.test.js tests/chat.spec.ts
git commit -m "fix(chat): satisfy master promotion verification"
```

If no correction is required, do not create an empty commit.

### Task 7: Publish the focused master PR

**Files:**
- No additional source changes expected.

- [ ] **Step 1: Verify final branch state**

```bash
git status --short --branch
git log --oneline --decorate origin/master..HEAD
git diff --stat origin/master...HEAD
```

Expected: clean worktree, readable focused commit sequence, and no unrelated dev/generated content.

- [ ] **Step 2: Push the promotion branch**

```bash
git push -u origin codex/promote-agent-chat-to-master
```

- [ ] **Step 3: Create the master PR**

```bash
gh pr create \
  --base master \
  --head codex/promote-agent-chat-to-master \
  --title "Promote docs agent chat integration" \
  --body "Promotes the UAT-verified cloud-ai-assistant chat integration without merging unrelated dev content. The same Docker image now selects zilliz_agent_prod only on docs.zilliz.com and zilliz_agent_dev elsewhere. The client remains token-free and uses the same internal agent URL in both environments."
```

Expected: an open, mergeable PR targeting `master`. Preserve the isolated worktree for review changes.

### Task 8: Verify production after merge

**Files:**
- No source changes unless production exposes a defect.

- [ ] **Step 1: Confirm the deployed image and pod health**

The deployment operator must provide the production read-only kubeconfig path through the task-specific `PRODUCTION_READONLY_KUBECONFIG` environment variable. Validate it, then check the zdocs Deployment and pod:

```bash
test -n "${PRODUCTION_READONLY_KUBECONFIG:-}"
kubectl --kubeconfig "$PRODUCTION_READONLY_KUBECONFIG" -n zdocs get deployment zdocs -o wide
kubectl --kubeconfig "$PRODUCTION_READONLY_KUBECONFIG" -n zdocs get pods -l app=zdocs -o wide
```

Expected: desired, current, ready, and available replicas agree; the new pod has zero restarts.

- [ ] **Step 2: Confirm the public site and runtime request**

Open `https://docs.zilliz.com/docs/home?chatDebug=1`, click `Ask AI`, send a request, and inspect the browser Network panel.

Expected request properties:

```text
URL: https://docs.zilliz.com/api/chat
site: docs.zilliz.com
agent_config.agent_config_code: zilliz_agent_prod
Authorization header: absent
```

- [ ] **Step 3: Run the production chat behavior checks**

Verify:

1. incremental response streaming;
2. a second question retains first-turn context;
3. Stop sends `/api/chat/interrupt` and stops rendering;
4. chat remains usable after Stop;
5. New Chat generates a different `X-Conversation-ID`;
6. no CORS, 401, 502, 503, or buffering errors occur.

- [ ] **Step 4: Handle any production-only defect test-first**

If production exposes a defect, record the deployed SHA and redacted network/log evidence, add the smallest local failing regression test, implement one correction, rerun Task 6, and publish a focused follow-up PR. Do not patch the production workload manually.
