# Docs Agent Chat Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing zdoc chat panel to the internal `cloud-ai-assistant` Kubernetes service through zdoc Nginx, with `site: "docs.zilliz.com"`, streamed responses, session affinity, remote interruption, and UAT verification.

**Architecture:** The browser continues to call same-origin `/api/chat` endpoints. Exact Nginx routes forward chat and interrupt requests to a consistently hashed StatefulSet pod and inject the runtime bearer token, while the generic `/api/` route continues to serve search and feedback through `chat-proxy`. A focused TypeScript parser normalizes the agent's raw and normalized SSE formats before `ChatContext` updates the existing UI.

**Tech Stack:** Docusaurus 3, React 18, TypeScript 5.6, Vitest, Testing Library, Playwright, Nginx, Docker, Kubernetes DNS.

---

## File Structure

- Create `src/components/ChatPanel/agentStream.ts`: parse raw and normalized agent SSE payloads into typed UI updates.
- Create `src/components/ChatPanel/agentStream.test.ts`: unit coverage for all supported event formats, deduplication, malformed input, and safe errors.
- Modify `src/components/ChatPanel/ChatContext.tsx`: send the new request contract, manage session/conversation state, apply parser updates, and interrupt remotely.
- Modify `src/components/ChatPanel/ChatContext.test.tsx`: request, session, history, cancellation, and redacted-debug contract tests.
- Modify `src/components/ChatPanel/types.ts`: persist optional transport identifiers with chat history.
- Modify `packages/chat-ui/src/types.ts`: add the optional assistant status field used by the existing progress row.
- Modify `src/components/ChatPanel/index.tsx`: render agent status through the existing `ThinkingText` component.
- Modify `docusaurus.config.ts`: expose one environment-aware agent config code.
- Modify `src/theme/DocRoot/Layout/index.tsx`: pass the configured agent code to `ChatProvider`.
- Modify `src/theme/NotFound/Content/index.tsx`: pass the same agent code to the not-found chat provider.
- Modify `Dockerfile`: make the agent config code available during the static build without baking the bearer token into the image.
- Modify `docker-entrypoint.d/40-zdoc-env.sh`: validate the runtime token and generate the private Nginx upstream/auth include.
- Modify `nginx.conf`: add exact chat/interrupt routes while retaining the generic `/api/` fallback.
- Create `scripts/chat-agent-nginx.test.js`: static policy tests for routing, streaming, affinity, and secret isolation.
- Modify `tests/chat.spec.ts`: align the mocked browser flow with the new same-origin request and raw SSE contract.
- Modify `package.json`: add a focused Nginx configuration test command.

### Task 1: Add the agent SSE parser

**Files:**
- Create: `src/components/ChatPanel/agentStream.test.ts`
- Create: `src/components/ChatPanel/agentStream.ts`

- [ ] **Step 1: Write failing parser tests**

Create `agentStream.test.ts` with focused tests that exercise raw payloads without React:

```ts
import {describe, expect, it} from 'vitest';
import {createAgentStreamState, parseAgentStreamEvent} from './agentStream';

describe('parseAgentStreamEvent', () => {
  it('captures session ids from raw data-only events', () => {
    const state = createAgentStreamState();
    expect(parseAgentStreamEvent('', JSON.stringify({type: 'connected', session_id: 'pending_1'}), state)).toEqual([]);
    expect(parseAgentStreamEvent('', JSON.stringify({type: 'session_id', session_id: 'session-1'}), state)).toEqual([
      {type: 'session', sessionId: 'session-1'},
    ]);
  });

  it('renders stream-event text and ignores duplicate chunk text', () => {
    const state = createAgentStreamState();
    parseAgentStreamEvent('', JSON.stringify({type: 'stream_event', event_type: 'block_start', block_index: 0, block_type: 'text'}), state);
    expect(parseAgentStreamEvent('', JSON.stringify({type: 'stream_event', event_type: 'delta', block_index: 0, delta: 'hello'}), state)).toEqual([
      {type: 'text', text: 'hello'},
    ]);
    expect(parseAgentStreamEvent('', JSON.stringify({type: 'chunk', data: {type: 'text', text: 'hello'}}), state)).toEqual([]);
  });

  it('renders chunk text and ignores thinking content', () => {
    const state = createAgentStreamState();
    expect(parseAgentStreamEvent('chunk', JSON.stringify({data: {type: 'thinking', thinking: 'private reasoning'}}), state)).toEqual([]);
    expect(parseAgentStreamEvent('chunk', JSON.stringify({data: {type: 'text', text: 'answer'}}), state)).toEqual([
      {type: 'text', text: 'answer'},
    ]);
  });

  it('normalizes metadata and safe errors', () => {
    const state = createAgentStreamState();
    expect(parseAgentStreamEvent('agent', JSON.stringify({type: 'general', name: 'Docs Agent'}), state)).toEqual([
      {type: 'agent', name: 'Docs Agent', agentType: 'general'},
    ]);
    expect(parseAgentStreamEvent('status', JSON.stringify({phase: 'Searching docs'}), state)).toEqual([
      {type: 'status', status: 'Searching docs'},
    ]);
    expect(parseAgentStreamEvent('tool-call', JSON.stringify({tool: 'search', count: 2}), state)).toEqual([
      {type: 'tool-call', count: 2},
    ]);
    expect(parseAgentStreamEvent('error', JSON.stringify({error: 'session not found or inactive'}), state)).toEqual([
      {type: 'error', message: 'Your session has been disconnected due to inactivity. Please refresh the page to start a new conversation.'},
    ]);
  });

  it('normalizes sources, grounding, confidence, completion, and malformed input', () => {
    const state = createAgentStreamState();
    expect(parseAgentStreamEvent('sources', JSON.stringify({sources: [{title: 'Create a cluster', url: '/docs/create-cluster'}]}), state)[0]?.type).toBe('sources');
    expect(parseAgentStreamEvent('grounding', JSON.stringify({citations: [{paragraphIndex: 0, sourceIndices: [0]}]}), state)[0]?.type).toBe('grounding');
    expect(parseAgentStreamEvent('confidence', JSON.stringify({level: 'high'}), state)).toEqual([{type: 'confidence', level: 'high'}]);
    expect(parseAgentStreamEvent('', '[DONE]', state)).toEqual([{type: 'done'}]);
    expect(parseAgentStreamEvent('delta', '{bad json', state)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the parser test and verify RED**

Run:

```bash
pnpm vitest run src/components/ChatPanel/agentStream.test.ts
```

Expected: FAIL because `./agentStream` does not exist.

- [ ] **Step 3: Implement the parser**

Create `agentStream.ts` with these public types and functions:

```ts
import type {AgentType, ConfidenceLevel, GroundingCitation, Source} from './types';

const SESSION_EXPIRED_ERROR =
  'Your session has been disconnected due to inactivity. Please refresh the page to start a new conversation.';
const GENERIC_ERROR = 'Something went wrong. Please refresh the page and try again.';

export interface AgentStreamState {
  contentSource: 'stream-event' | 'chunk' | null;
  blockTypes: Record<number, string>;
  toolCallCount: number;
}

export type AgentStreamUpdate =
  | {type: 'session'; sessionId: string}
  | {type: 'text'; text: string}
  | {type: 'agent'; name: string; agentType?: AgentType}
  | {type: 'status'; status: string}
  | {type: 'tool-call'; count: number}
  | {type: 'sources'; sources: Source[]}
  | {type: 'grounding'; citations: GroundingCitation[]}
  | {type: 'confidence'; level: ConfidenceLevel}
  | {type: 'error'; message: string}
  | {type: 'done'};

export function createAgentStreamState(): AgentStreamState {
  return {contentSource: null, blockTypes: {}, toolCallCount: 0};
}

function displayError(payload: Record<string, unknown>): string {
  const value = payload.error ?? payload.content ?? payload.message;
  return typeof value === 'string' && /session not found or inactive/i.test(value)
    ? SESSION_EXPIRED_ERROR
    : GENERIC_ERROR;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

export function parseAgentStreamEvent(
  eventName: string,
  raw: string,
  state: AgentStreamState,
): AgentStreamUpdate[] {
  if (raw === '[DONE]') return [{type: 'done'}];

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(raw) as Record<string, any>;
  } catch {
    return [];
  }

  const eventType = eventName || stringValue(payload.type) || '';

  if (['session', 'session_id', 'connected'].includes(eventType)) {
    const sessionId = stringValue(payload.sessionId) || stringValue(payload.session_id);
    return sessionId && !sessionId.startsWith('pending') ? [{type: 'session', sessionId}] : [];
  }

  if (eventType === 'stream-event' || eventType === 'stream_event') {
    const blockIndex = typeof payload.block_index === 'number' ? payload.block_index : null;
    if (payload.event_type === 'block_start' && blockIndex !== null && typeof payload.block_type === 'string') {
      state.blockTypes[blockIndex] = payload.block_type;
      return [];
    }
    if (payload.event_type === 'block_stop' && blockIndex !== null) {
      delete state.blockTypes[blockIndex];
      return [];
    }
    const delta = stringValue(payload.delta);
    if (!delta) return [];
    const blockType = stringValue(payload.block_type) || (blockIndex === null ? undefined : state.blockTypes[blockIndex]);
    if (blockType === 'thinking' || state.contentSource === 'chunk') return [];
    state.contentSource = 'stream-event';
    return [{type: 'text', text: delta}];
  }

  if (eventType === 'chunk') {
    if (state.contentSource === 'stream-event') return [];
    const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
    if (data.type === 'tool_use') {
      state.toolCallCount += 1;
      return [{type: 'tool-call', count: state.toolCallCount}];
    }
    if (data.type !== 'text' || typeof data.text !== 'string' || !data.text) return [];
    state.contentSource = 'chunk';
    return [{type: 'text', text: data.text}];
  }

  if (eventType === 'delta') {
    const text = stringValue(payload.text) || stringValue(payload.delta);
    return text ? [{type: 'text', text}] : [];
  }
  if (eventType === 'agent') {
    const name = stringValue(payload.name) || stringValue(payload.type);
    return name ? [{type: 'agent', name, agentType: payload.type as AgentType | undefined}] : [];
  }
  if (eventType === 'status') {
    const status = stringValue(payload.phase) || stringValue(payload.status) || stringValue(payload.message);
    return status ? [{type: 'status', status}] : [];
  }
  if (eventType === 'tool-call') {
    const count = typeof payload.count === 'number' ? payload.count : state.toolCallCount + 1;
    state.toolCallCount = count;
    return [{type: 'tool-call', count}];
  }
  if (eventType === 'sources' && Array.isArray(payload.sources)) return [{type: 'sources', sources: payload.sources as Source[]}];
  if (eventType === 'grounding' && Array.isArray(payload.citations)) return [{type: 'grounding', citations: payload.citations as GroundingCitation[]}];
  if (eventType === 'confidence' && ['high', 'medium', 'low'].includes(payload.level)) return [{type: 'confidence', level: payload.level as ConfidenceLevel}];
  if (eventType === 'error') return [{type: 'error', message: displayError(payload)}];
  if (['done', 'complete', 'completed'].includes(eventType)) return [{type: 'done'}];
  return [];
}
```

- [ ] **Step 4: Run the parser test and verify GREEN**

Run:

```bash
pnpm vitest run src/components/ChatPanel/agentStream.test.ts
```

Expected: all parser tests PASS.

- [ ] **Step 5: Commit the parser**

```bash
git add src/components/ChatPanel/agentStream.ts src/components/ChatPanel/agentStream.test.ts
git commit -m "feat(chat): parse agent SSE streams"
```

### Task 2: Add the client request and configuration contract

**Files:**
- Modify: `src/components/ChatPanel/ChatContext.test.tsx`
- Modify: `src/components/ChatPanel/ChatContext.tsx`
- Modify: `docusaurus.config.ts`
- Modify: `src/theme/DocRoot/Layout/index.tsx`
- Modify: `src/theme/NotFound/Content/index.tsx`
- Modify: `Dockerfile`

- [ ] **Step 1: Replace the request-contract assertion with a failing agent request test**

Update the test wrapper to supply `agentConfigCode="zilliz_agent_dev"`, then assert:

```tsx
function wrapper(debugDefault = false) {
  return function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <ChatProvider
        chatEndpoint="/api/chat"
        agentConfigCode="zilliz_agent_dev"
        debugDefault={debugDefault}
      >
        {children}
      </ChatProvider>
    );
  };
}

it('sends the docs agent request contract', async () => {
  const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});

  await act(async () => {
    await result.current.send('secret user prompt');
  });

  const [url, init] = vi.mocked(fetch).mock.calls[0];
  expect(url).toBe('/api/chat');
  expect((init as RequestInit).headers).toMatchObject({
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'X-Request-ID': 'client-request-1',
    'X-Conversation-ID': 'client-conversation-1',
  });
  expect(JSON.parse((init as RequestInit).body as string)).toEqual({
    message: 'secret user prompt',
    session_id: null,
    conversationId: 'client-conversation-1',
    streaming_mode: 'token',
    site: 'docs.zilliz.com',
    agent_config: {agent_config_code: 'zilliz_agent_dev'},
  });
});
```

Adjust the deterministic UUID stub so the first request UUID is `client-request-1` and the next generated chat UUID is `client-conversation-1`.

- [ ] **Step 2: Run the focused test and verify RED**

```bash
pnpm vitest run src/components/ChatPanel/ChatContext.test.tsx -t "sends the docs agent request contract"
```

Expected: FAIL because `ChatProvider` has no `agentConfigCode` prop and the request still uses the legacy `messages` contract.

- [ ] **Step 3: Implement the new provider prop and request body**

In `ChatContext.tsx`, define and use:

```tsx
interface ChatProviderProps {
  chatEndpoint: string;
  agentConfigCode: string;
  debugDefault?: boolean;
  children: React.ReactNode;
}

export function ChatProvider({chatEndpoint, agentConfigCode, debugDefault = false, children}: ChatProviderProps) {
  const conversationIdRef = useRef<string | null>(null);
  // existing state and refs remain
```

Immediately before creating the request body:

```ts
if (!conversationIdRef.current) conversationIdRef.current = uuid();
const conversationId = conversationIdRef.current;
const requestBody = {
  message: outgoing,
  session_id: sessionIdRef.current,
  conversationId,
  streaming_mode: 'token',
  site: 'docs.zilliz.com',
  agent_config: {agent_config_code: agentConfigCode},
};
```

Use these fetch headers:

```ts
headers: {
  'Content-Type': 'application/json',
  Accept: 'text/event-stream',
  'X-Request-ID': requestId,
  'X-Conversation-ID': conversationId,
},
```

Remove `messages`, `pageContext`, `pageUrl`, `userId`, and `screenResolution` from the agent request body. Keep page context folded into `outgoing`; keep `getUserId()` for the unchanged feedback request.

- [ ] **Step 4: Wire the environment-aware agent code through the application**

Add to `docusaurus.config.ts`:

```ts
chatAgentConfigCode: process.env.CHAT_AGENT_CONFIG_CODE || 'zilliz_agent_dev',
```

In both provider call sites read the field and pass it:

```tsx
const agentConfigCode =
  (siteConfig.customFields?.chatAgentConfigCode as string) || 'zilliz_agent_dev';

<ChatProvider
  chatEndpoint={chatEndpoint}
  agentConfigCode={agentConfigCode}
  debugDefault={chatDebug}
>
```

In the Docker build stage add:

```dockerfile
ARG CHAT_AGENT_CONFIG_CODE=zilliz_agent_dev
ENV CHAT_AGENT_CONFIG_CODE=${CHAT_AGENT_CONFIG_CODE}
```

Do not add the bearer token as a Docker build argument or browser environment value.

- [ ] **Step 5: Run the request and existing debug tests**

```bash
pnpm vitest run src/components/ChatPanel/ChatContext.test.tsx
```

Expected: both tests PASS, and the debug log assertions still confirm that prompt, answer, session ID, and conversation ID values are redacted.

- [ ] **Step 6: Commit the request contract**

```bash
git add Dockerfile docusaurus.config.ts src/components/ChatPanel/ChatContext.tsx src/components/ChatPanel/ChatContext.test.tsx src/theme/DocRoot/Layout/index.tsx src/theme/NotFound/Content/index.tsx
git commit -m "feat(chat): send docs agent request contract"
```

### Task 3: Integrate raw streaming updates and progress metadata

**Files:**
- Modify: `src/components/ChatPanel/ChatContext.test.tsx`
- Modify: `src/components/ChatPanel/ChatContext.tsx`
- Modify: `packages/chat-ui/src/types.ts`
- Modify: `src/components/ChatPanel/index.tsx`

- [ ] **Step 1: Add a failing raw-stream integration test**

Add a helper that emits data-only SSE payloads and a test with `connected`, `session_id`, `tool_use`, `stream_event`, duplicate `chunk`, `sources`, and `completed` payloads. Assert the final assistant message contains text once, metadata, and status cleanup:

```tsx
it('renders raw agent events without duplicate text', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(rawSseResponse([
    {type: 'connected', session_id: 'pending_1'},
    {type: 'session_id', session_id: 'server-session-1'},
    {type: 'status', phase: 'Searching docs'},
    {type: 'chunk', data: {type: 'tool_use', name: 'search'}},
    {type: 'stream_event', event_type: 'block_start', block_index: 0, block_type: 'text'},
    {type: 'stream_event', event_type: 'delta', block_index: 0, delta: 'one answer'},
    {type: 'chunk', data: {type: 'text', text: 'one answer'}},
    {type: 'sources', sources: [{title: 'Source', url: '/docs/source'}]},
    {type: 'confidence', level: 'high'},
    {type: 'completed'},
    '[DONE]',
  ]));

  const {result} = renderHook(() => useChatContext(), {wrapper: wrapper(false)});
  await act(async () => result.current.send('question'));

  expect(result.current.messages.at(-1)).toMatchObject({
    role: 'assistant',
    text: 'one answer',
    toolCallCount: 1,
    confidence: 'high',
    sources: [{title: 'Source', url: '/docs/source'}],
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

```bash
pnpm vitest run src/components/ChatPanel/ChatContext.test.tsx -t "renders raw agent events"
```

Expected: FAIL because `ChatContext` only handles named normalized events.

- [ ] **Step 3: Replace inline event interpretation with the parser**

Import:

```ts
import {createAgentStreamState, parseAgentStreamEvent, type AgentStreamUpdate} from './agentStream';
```

Create one parser state per request. Preserve the existing line buffer, but accept both named and data-only SSE. For every parsed update, mutate only the current final assistant message:

```ts
const streamState = createAgentStreamState();
let currentEvent = '';
let assistantText = '';

const applyUpdate = (update: AgentStreamUpdate) => {
  if (update.type === 'session') {
    sessionIdRef.current = update.sessionId;
    return;
  }
  if (update.type === 'text') assistantText += update.text;

  updateLastAssistant(
    update.type === 'text' ? {text: assistantText, status: undefined} :
    update.type === 'agent' ? {agent: update.name, agentType: update.agentType} :
    update.type === 'status' ? {status: update.status, toolCallCount: undefined} :
    update.type === 'tool-call' ? {toolCallCount: update.count, status: undefined} :
    update.type === 'sources' ? {sources: update.sources} :
    update.type === 'grounding' ? {grounding: update.citations} :
    update.type === 'confidence' ? {confidence: update.level} :
    update.type === 'error' ? {text: assistantText || update.message, status: undefined} :
    update.type === 'done' ? {status: undefined} : {},
  );
};
```

When a `data:` line arrives, pass `currentEvent` and the trimmed payload to `parseAgentStreamEvent`, reset `currentEvent`, and apply every returned update. Keep the existing redacted event counters and debug summaries, but count the effective payload type for data-only events.

- [ ] **Step 4: Add status to the shared message type and existing progress row**

Add to `packages/chat-ui/src/types.ts`:

```ts
status?: string;
```

In both `ThinkingText` call sites in `ChatPanel/index.tsx`, use:

```tsx
<ThinkingText label={msg.status || (msg.toolCallCount ? 'Searching' : 'Thinking')} />
```

This reuses the current visual treatment and does not add a new thinking-block component.

- [ ] **Step 5: Run parser, context, and chat-ui builds**

```bash
pnpm vitest run src/components/ChatPanel/agentStream.test.ts src/components/ChatPanel/ChatContext.test.tsx
pnpm --filter @zdoc/chat-ui build
```

Expected: tests PASS and the chat-ui package build exits 0.

- [ ] **Step 6: Commit streaming integration**

```bash
git add packages/chat-ui/src/types.ts src/components/ChatPanel/agentStream.ts src/components/ChatPanel/ChatContext.tsx src/components/ChatPanel/ChatContext.test.tsx src/components/ChatPanel/index.tsx
git commit -m "feat(chat): render raw agent streams"
```

### Task 4: Preserve sessions in history and interrupt remotely

**Files:**
- Modify: `src/components/ChatPanel/types.ts`
- Modify: `src/components/ChatPanel/ChatContext.test.tsx`
- Modify: `src/components/ChatPanel/ChatContext.tsx`

- [ ] **Step 1: Add failing multi-turn, history, and interrupt tests**

Add tests that prove:

```tsx
it('reuses the server session and conversation id on the next turn', async () => {
  // first response emits server-session-1; second response is empty but successful
  // send twice and assert the second JSON body contains session_id: 'server-session-1'
  // assert both requests have the same X-Conversation-ID
});

it('stores and restores session transport state with chat history', async () => {
  // send one answered message, wait for history, call newChat(), then loadChat(id)
  // send a follow-up and assert restored session_id and conversationId
});

it('posts an interrupt before aborting the local stream', async () => {
  // keep the stream open after emitting a session id, call stop(), and assert:
  expect(fetch).toHaveBeenNthCalledWith(2, '/api/chat/interrupt', expect.objectContaining({
    method: 'POST',
    keepalive: true,
    headers: expect.objectContaining({'X-Conversation-ID': 'client-conversation-1'}),
  }));
  expect(JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string)).toEqual({
    session_id: 'server-session-1',
    conversationId: 'client-conversation-1',
  });
});

it('ignores late stream events after stop', async () => {
  // enqueue text after stop and assert it does not change the partial assistant response
});
```

- [ ] **Step 2: Run the four tests and verify RED**

```bash
pnpm vitest run src/components/ChatPanel/ChatContext.test.tsx -t "session|transport state|interrupt|late stream"
```

Expected: FAIL because history has no transport fields, Stop only aborts locally, and stale events have no request-generation guard.

- [ ] **Step 3: Extend history transport state**

Add optional fields in `types.ts`:

```ts
export interface ChatHistoryEntry {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  sessionId?: string | null;
  conversationId?: string | null;
}
```

When autosaving history, include the current refs. When updating an existing entry, update both fields. `loadChat` restores both optional values, while legacy entries fall back to `null`. `newChat` and deleting the active chat clear both refs.

- [ ] **Step 4: Add request-generation cancellation and remote interrupt**

Add:

```ts
const requestGenerationRef = useRef(0);
```

At the start of `send`:

```ts
const generation = requestGenerationRef.current + 1;
requestGenerationRef.current = generation;
const isCurrentRequest = () =>
  requestGenerationRef.current === generation && !controller?.signal.aborted;
```

Check `isCurrentRequest()` after fetch, after every reader read, before applying parsed updates, and in `finally` before clearing the current request state.

Replace Stop with:

```ts
const stop = useCallback(() => {
  const sessionId = sessionIdRef.current;
  const conversationId = conversationIdRef.current;
  if (sessionId && conversationId) {
    void fetch(`${chatEndpoint.replace(/\/+$/, '')}/interrupt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Conversation-ID': conversationId,
      },
      body: JSON.stringify({session_id: sessionId, conversationId}),
      keepalive: true,
    }).catch(() => {});
  }
  requestGenerationRef.current += 1;
  abortRef.current?.abort();
  abortRef.current = null;
  setIsStreaming(false);
  setMessages(prev => prev.map((message, index) =>
    index === prev.length - 1 && message.role === 'assistant'
      ? {...message, status: undefined}
      : message,
  ));
}, [chatEndpoint]);
```

Apply the same generation invalidation before aborting in New Chat and Load Chat.

- [ ] **Step 5: Run the complete ChatContext suite**

```bash
pnpm vitest run src/components/ChatPanel/ChatContext.test.tsx
```

Expected: all request, streaming, session, history, interrupt, stale-event, and debug tests PASS.

- [ ] **Step 6: Commit session and interruption support**

```bash
git add src/components/ChatPanel/types.ts src/components/ChatPanel/ChatContext.tsx src/components/ChatPanel/ChatContext.test.tsx
git commit -m "feat(chat): preserve and interrupt agent sessions"
```

### Task 5: Add the private Nginx Kubernetes adapter

**Files:**
- Create: `scripts/chat-agent-nginx.test.js`
- Modify: `package.json`
- Modify: `docker-entrypoint.d/40-zdoc-env.sh`
- Modify: `nginx.conf`

- [ ] **Step 1: Write the failing Nginx policy test**

Create `scripts/chat-agent-nginx.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const nginx = fs.readFileSync('nginx.conf', 'utf8');
const entrypoint = fs.readFileSync('docker-entrypoint.d/40-zdoc-env.sh', 'utf8');

test('routes chat and interrupt directly to the private agent with affinity', () => {
  assert.match(nginx, /include \/etc\/nginx\/chat-agent-runtime\.conf;/);
  assert.match(nginx, /location = \/api\/chat\s*{/);
  assert.match(nginx, /proxy_pass http:\/\/docs_agent\/api\/chat\/stream;/);
  assert.match(nginx, /location = \/api\/chat\/interrupt\s*{/);
  assert.match(nginx, /proxy_pass http:\/\/docs_agent\/api\/chat\/interrupt;/);
  assert.ok(nginx.indexOf('location = /api/chat') < nginx.indexOf('location /api/'));
  assert.match(entrypoint, /hash \\$http_x_conversation_id consistent;/);
  for (const pod of [0, 1, 2]) {
    assert.match(entrypoint, new RegExp(`cloud-ai-assistant-${pod}\\.cloud-ai-assistant-hs\\.vdc\\.svc\\.cluster\\.local:9000`));
  }
});

test('keeps streaming unbuffered and the token out of browser env', () => {
  assert.match(nginx, /proxy_buffering off;/);
  assert.match(nginx, /proxy_cache off;/);
  assert.match(nginx, /proxy_read_timeout 300s;/);
  assert.match(entrypoint, /CHAT_AGENT_AUTH_TOKEN/);
  assert.doesNotMatch(entrypoint, /window\.__ZDOC_ENV__[\s\S]*CHAT_AGENT_AUTH_TOKEN/);
  assert.doesNotMatch(nginx, /Bearer 123456/);
});
```

Add the script:

```json
"test:chat-agent-config": "node --test scripts/chat-agent-nginx.test.js"
```

- [ ] **Step 2: Run the policy test and verify RED**

```bash
pnpm test:chat-agent-config
```

Expected: FAIL because the runtime include and exact agent routes do not exist.

- [ ] **Step 3: Generate the private runtime include at container startup**

At the top of `40-zdoc-env.sh`, before writing browser `env.js`, validate and escape the token, then write `/etc/nginx/chat-agent-runtime.conf`:

```sh
: "${CHAT_AGENT_AUTH_TOKEN:?CHAT_AGENT_AUTH_TOKEN is required}"

case "$CHAT_AGENT_AUTH_TOKEN" in
  *'
'*)
    echo "CHAT_AGENT_AUTH_TOKEN must not contain newlines" >&2
    exit 1
    ;;
esac

escape_nginx() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\$/\\$/g'
}

chat_agent_token="$(escape_nginx "$CHAT_AGENT_AUTH_TOKEN")"

cat > /etc/nginx/chat-agent-runtime.conf <<EOF
upstream docs_agent {
  hash \$http_x_conversation_id consistent;
  server cloud-ai-assistant-0.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000;
  server cloud-ai-assistant-1.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000;
  server cloud-ai-assistant-2.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000;
}

map \$host \$chat_agent_authorization {
  default "Bearer ${chat_agent_token}";
}
EOF
```

Keep `CHAT_AGENT_AUTH_TOKEN` out of the existing `window.__ZDOC_ENV__` object.

- [ ] **Step 4: Add exact unbuffered Nginx routes**

Add before `server {`:

```nginx
include /etc/nginx/chat-agent-runtime.conf;
```

Add before the generic `location /api/` block:

```nginx
location = /api/chat {
    proxy_pass http://docs_agent/api/chat/stream;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
    proxy_set_header Authorization $chat_agent_authorization;
    proxy_set_header Accept text/event-stream;
    proxy_set_header Content-Type application/json;
    proxy_set_header X-Conversation-ID $http_x_conversation_id;
    proxy_set_header X-Request-ID $http_x_request_id;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location = /api/chat/interrupt {
    proxy_pass http://docs_agent/api/chat/interrupt;
    proxy_http_version 1.1;
    proxy_set_header Authorization $chat_agent_authorization;
    proxy_set_header Content-Type application/json;
    proxy_set_header X-Conversation-ID $http_x_conversation_id;
    proxy_set_header X-Request-ID $http_x_request_id;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Do not change the generic `/api/` block; `/api/search` and `/api/feedback` must still reach `chat-proxy`.

- [ ] **Step 5: Run the configuration test and validate a container config**

```bash
pnpm test:chat-agent-config
docker build --build-arg CHAT_AGENT_CONFIG_CODE=zilliz_agent_dev -t zdoc-chat-agent-test .
docker run --rm -e CHAT_AGENT_AUTH_TOKEN=test-token zdoc-chat-agent-test nginx -t
```

Expected: Node tests PASS, Docker build exits 0, and `nginx -t` reports syntax successful.

- [ ] **Step 6: Commit the adapter**

```bash
git add package.json scripts/chat-agent-nginx.test.js docker-entrypoint.d/40-zdoc-env.sh nginx.conf
git commit -m "feat(chat): proxy agent traffic through nginx"
```

### Task 6: Align the mocked browser test

**Files:**
- Modify: `tests/chat.spec.ts`

- [ ] **Step 1: Update the Playwright route and assertions**

Route `**/api/chat`, not the internal `/api/chat/stream`, and assert:

```ts
await page.route('**/api/chat', async route => {
  const request = route.request();
  capturedRequestId = request.headers()['x-request-id'];
  const conversationId = request.headers()['x-conversation-id'];
  capturedBody = request.postDataJSON() as Record<string, unknown>;

  expect(conversationId).toMatch(requestIdPattern);
  expect(capturedBody).toMatchObject({
    message: prompt,
    session_id: null,
    conversationId,
    site: 'docs.zilliz.com',
    agent_config: {agent_config_code: 'zilliz_agent_dev'},
    streaming_mode: 'token',
  });

  await route.fulfill({
    status: 200,
    headers: {'Content-Type': 'text/event-stream', 'X-Request-ID': capturedRequestId!},
    body: sse([
      {type: 'connected', session_id: 'pending_1779357600.123456'},
      {type: 'session_id', session_id: serverSessionId},
      {type: 'chunk', data: {type: 'tool_use', name: 'search'}},
      {type: 'stream_event', event_type: 'block_start', block_index: 0, block_type: 'text'},
      {type: 'stream_event', event_type: 'delta', block_index: 0, delta: assistantAnswer},
      {type: 'stream_event', event_type: 'block_stop', block_index: 0},
      {type: 'completed', session_id: serverSessionId},
      '[DONE]',
    ]),
  });
});
```

Keep all safe-debug assertions and remove the obsolete `user_id` assertion.

- [ ] **Step 2: Run the browser test and verify it passes**

```bash
pnpm playwright test tests/chat.spec.ts --project=chromium
```

Expected: one test PASS with the mocked same-origin route.

- [ ] **Step 3: Commit the browser contract**

```bash
git add tests/chat.spec.ts
git commit -m "test(chat): cover browser agent contract"
```

### Task 7: Run the full local verification gate

**Files:**
- No source changes expected.

- [ ] **Step 1: Run focused tests**

```bash
pnpm vitest run src/components/ChatPanel/agentStream.test.ts src/components/ChatPanel/ChatContext.test.tsx
pnpm test:chat-agent-config
pnpm playwright test tests/chat.spec.ts --project=chromium
```

Expected: all focused tests PASS.

- [ ] **Step 2: Run package and repository checks**

```bash
pnpm --filter @zdoc/chat-ui build
pnpm typecheck
pnpm check:static-env
pnpm test:frontend
CHAT_AGENT_CONFIG_CODE=zilliz_agent_dev pnpm build
```

Expected: every command exits 0. Record any pre-existing unrelated failure separately; do not describe the integration as locally verified until the relevant command passes.

- [ ] **Step 3: Inspect the final diff and secret boundary**

```bash
git diff origin/master...HEAD --check
git diff origin/master...HEAD -- Dockerfile docker-entrypoint.d/40-zdoc-env.sh nginx.conf docusaurus.config.ts src/components/ChatPanel tests/chat.spec.ts scripts/chat-agent-nginx.test.js
rg -n "CHAT_AGENT_AUTH_TOKEN|Bearer 123456" build src static docusaurus.config.ts
```

Expected: no whitespace errors; the token variable appears only in server/container configuration; no hard-coded bearer token appears in browser assets or source.

- [ ] **Step 4: Commit any verification-only corrections**

If verification required a code correction, rerun the failing command and commit only that correction:

```bash
git add Dockerfile docusaurus.config.ts docker-entrypoint.d/40-zdoc-env.sh nginx.conf package.json packages/chat-ui/src src/components/ChatPanel src/theme/DocRoot/Layout/index.tsx src/theme/NotFound/Content/index.tsx scripts/chat-agent-nginx.test.js tests/chat.spec.ts
git commit -m "fix(chat): satisfy integration verification"
```

If no correction was required, do not create an empty commit.

### Task 8: Deploy to UAT and verify the real internal service

**Files:**
- No additional source changes unless UAT reveals a defect.

- [ ] **Step 1: Publish the implementation branch**

Use the fixed branch name:

```bash
git switch -c codex/docs-agent-chat-integration
git push -u origin codex/docs-agent-chat-integration
gh pr create --base dev --head codex/docs-agent-chat-integration --title "Connect docs chat UI to cloud AI assistant" --body "Routes zdoc chat through the in-cluster cloud-ai-assistant with docs.zilliz.com site identity, streaming, session affinity, and interrupt support. Local contract tests and build are included; live validation requires the UAT deployment."
```

If execution already started on that branch, omit the `git switch -c` command and verify `git branch --show-current` returns `codex/docs-agent-chat-integration` before pushing.

- [ ] **Step 2: Confirm UAT deployment configuration**

Before triggering the UAT build, verify the zdoc UAT workload receives the token from the existing UAT secret store and supplies the non-secret agent code:

```text
CHAT_AGENT_AUTH_TOKEN is mapped from the existing UAT Kubernetes Secret
CHAT_AGENT_CONFIG_CODE=zilliz_agent_dev
```

Do not print or copy the token into the PR, logs, shell history, or repository. Confirm the zdoc namespace can resolve `cloud-ai-assistant-0.cloud-ai-assistant-hs.vdc.svc.cluster.local` through pod logs or the deployment team's standard Kubernetes check.

- [ ] **Step 3: Merge to `dev` and wait for the UAT deployment**

After review approval, merge the PR into `dev` using the repository's normal merge policy. Wait until `https://docs.cloud-uat3.zilliz.com` serves the merged commit before live testing. Confirm the deployed asset or build metadata corresponds to the merge SHA; do not test an older UAT build.

- [ ] **Step 4: Run the live UAT browser checks**

Open `https://docs.cloud-uat3.zilliz.com/docs/home?chatDebug=1` and verify:

1. Ask “What is a collection in Zilliz Cloud?” and observe incremental streamed text.
2. Ask “How does that relate to partitions?” and confirm the answer retains first-turn context.
3. Start a long answer, click Stop, and confirm the stream stops immediately.
4. Send another message after Stop and confirm the chat remains usable.
5. Click New Chat and confirm the next request uses a different `X-Conversation-ID`.
6. Inspect the browser Network panel: requests are same-origin `/api/chat` and `/api/chat/interrupt`, the body contains `site: "docs.zilliz.com"`, and no bearer token is visible.
7. Confirm there are no CORS, mixed-content, 401, 502, or SSE buffering errors.

- [ ] **Step 5: Record evidence and fix any UAT-only defect test-first**

Record the deployed SHA, timestamps, request status codes, whether multi-turn and Stop passed, and any redacted error text. If UAT exposes a defect, first add a failing local contract or configuration test reproducing it, then implement the smallest correction, rerun Task 7, redeploy, and repeat the affected UAT check.

Do not promote to production until every UAT check passes.

### Task 9: Final review and downstream assessment

**Files:**
- Review: `.claude/specs/2026-07-23-docs-agent-chat-integration-design.md`
- Review: implementation diff

- [ ] **Step 1: Check every design requirement against the implementation**

Confirm the final diff implements: fixed docs site identity, UAT/prod agent config separation, private auth injection, exact route precedence, consistent pod affinity, raw/normalized SSE parsing, duplicate suppression, session history, remote interrupt, stale-event protection, local tests, and UAT evidence.

- [ ] **Step 2: Confirm downstream scope**

Verify `../zdoc_cn/src/theme/Root.js` remains unchanged and still uses its independent Inkeep integration. Because no shared zdoc_cn deployment tooling is modified, record “no downstream code or build change required.”

- [ ] **Step 3: Run final status checks**

```bash
git status --short
git log --oneline --decorate -10
```

Expected: clean worktree and a readable sequence of focused commits. Report local command results and UAT evidence separately.
