# Docs Agent Chat Integration Design

## Goal

Connect the existing zdoc chat UI to the deployed `cloud-ai-assistant` service without changing the agent service or the existing `chat-proxy` service.

The integration must:

- identify requests with `site: "docs.zilliz.com"`;
- preserve streamed responses and the current chat-panel UX;
- keep multi-turn requests and interrupts on the same agent pod;
- keep the agent bearer token out of browser JavaScript;
- support local contract testing even though the Kubernetes service is reachable only after UAT deployment; and
- leave the existing `/api/search` and `/api/feedback` routes on `chat-proxy`.

## Constraints and Decisions

Zdoc is a statically built Docusaurus application served by Nginx. Browser code cannot resolve the internal Kubernetes hostname, and it must not receive the agent bearer token. Therefore, the browser will use same-origin endpoints exposed by the zdoc Nginx container. Nginx is an adapter owned by this repository, not a new service.

The approved request path is:

```text
ChatPanel / ChatContext
        |
        | POST /api/chat or /api/chat/interrupt
        | X-Conversation-ID: <client-generated UUID>
        v
zdoc Nginx in Kubernetes
        |
        | Authorization: Bearer <runtime secret>
        | consistent hash by X-Conversation-ID
        v
cloud-ai-assistant-N.cloud-ai-assistant-hs.vdc:9000
        |
        | /api/chat/stream or /api/chat/interrupt
        v
Agent SSE response
```

Direct browser-to-Kubernetes calls are excluded because internal DNS is unavailable outside the cluster and direct calls would expose authentication material. Reusing `chat-proxy` is excluded because this work must not modify or depend on changes to that service. Sending requests through the load-balanced ClusterIP without affinity is excluded because the referenced implementation documents that conversation state is held in an individual pod.

## Nginx Transport Adapter

### Routing

Add exact-match routes ahead of the existing generic `location /api/` block:

- `POST /api/chat` proxies to `/api/chat/stream` on an agent pod.
- `POST /api/chat/interrupt` proxies to `/api/chat/interrupt` on the same selected pod.
- Other `/api/*` requests continue to use `chat-proxy.zdocs.svc.cluster.local:9000`.

The agent upstream lists the three StatefulSet pod DNS names documented by the reference implementation:

- `cloud-ai-assistant-0.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000`
- `cloud-ai-assistant-1.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000`
- `cloud-ai-assistant-2.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000`

Nginx uses consistent hashing on `X-Conversation-ID`. The browser sends the same conversation ID for the stream and interrupt requests, so both reach the same pod. The pod count remains an explicit deployment assumption and must be changed in zdoc configuration if the StatefulSet replica count changes.

### Streaming

The chat route uses HTTP/1.1 with buffering and caching disabled. It retains the existing five-minute read and send timeouts and forwards the response as an SSE stream without accumulating it in Nginx.

### Authentication and runtime configuration

Nginx injects `Authorization: Bearer <token>` from a zdoc deployment environment variable such as `CHAT_AGENT_AUTH_TOKEN`. The token is substituted into the Nginx configuration at container startup and is never written to `env.js` or included in the Docusaurus bundle.

The container entrypoint must refuse to start when `CHAT_AGENT_AUTH_TOKEN` is absent. The validation message names the missing variable but must not log the token.

## Client Request Contract

`ChatProvider` retains `/api/chat` as its configured chat endpoint. Each new chat creates one in-memory `conversationId`. It is reset by New Chat and is sent in both a header and the JSON body.

Each message request sends:

```json
{
  "message": "the latest user message, including selected-page context",
  "session_id": "the current server session ID or null",
  "conversationId": "the current client conversation UUID",
  "streaming_mode": "token",
  "site": "docs.zilliz.com",
  "agent_config": {
    "agent_config_code": "zilliz_agent_dev"
  }
}
```

Headers include:

```text
Content-Type: application/json
Accept: text/event-stream
X-Request-ID: <per-request UUID>
X-Conversation-ID: <per-chat UUID>
```

`site` is a fixed application identifier, not derived from `window.location`, so UAT requests still identify the docs corpus as `docs.zilliz.com`.

The agent config code is environment-aware. UAT uses `zilliz_agent_dev`; production uses `zilliz_agent_prod`. It is exposed to the static client through Docusaurus build configuration, not hard-coded differently in multiple components.

The client sends only the latest user message because the agent maintains conversation state using `session_id`. Existing selected-text and selected-code context remains folded into that message exactly as it is today.

## Session and History State

The client stores these transport identifiers separately from visible message text:

- `sessionId`, learned from the stream;
- `conversationId`, generated at the start of a chat; and
- the current request generation, used to ignore stale events after cancellation.

Chat history entries gain optional `sessionId` and `conversationId` fields. Loading a history entry restores them when present. Legacy local-storage entries remain valid and start a new remote session if those optional fields are absent. New Chat clears both identifiers.

If the remote service reports that a session is missing or inactive, the assistant displays the established session-expired message. The user can then start a new chat; the client does not silently attach an expired conversation to a new session.

## SSE Parsing

Move raw agent event interpretation into a small, independently tested parser/helper rather than expanding the `send` callback further. The parser consumes SSE event names and JSON payloads and returns typed client updates.

It supports:

- `session` and payloads whose type is `session_id`, `session`, or `connected`;
- normalized `delta` text;
- raw `stream-event` block start, block delta, and block stop events;
- raw `chunk` payloads containing `data.type === "text"`;
- `agent`, `status`, and `tool-call` metadata;
- `sources`, `grounding`, and `confidence` metadata;
- `error`, `done`, and `[DONE]` termination signals.

The remote service can emit both `stream-event` and `chunk` content for the same answer. The parser locks onto the first raw content-bearing format and ignores the alternate raw format for the rest of that request. This mirrors the referenced hook and prevents duplicated text.

Thinking blocks are recognized so they are not accidentally appended to the visible answer, but adding a new thinking-block UI is outside this integration. Existing status and tool-call indicators continue to communicate progress.

Malformed JSON events are ignored without terminating an otherwise healthy stream. A remote error replaces an empty assistant response with a safe user-facing error. If visible text has already streamed, transport failure preserves the partial response instead of adding a second assistant message.

## Interrupt and Cancellation

Stop performs two actions:

1. If a session ID exists, send a best-effort `POST /api/chat/interrupt` with `session_id`, `conversationId`, and `X-Conversation-ID`. Use `keepalive: true`.
2. Abort the local stream immediately and advance the request generation so late events cannot mutate the UI.

Failure of the remote interrupt request does not prevent local cancellation. The partially streamed response remains visible, and any open progress state is cleared.

New Chat and Load Chat also abort any local stream and invalidate its request generation. New Chat clears the session and conversation identifiers. Load Chat restores the selected history entry's identifiers when available.

## Testing Strategy

### Local automated verification

Local tests do not call the Kubernetes service. They use mocked `fetch` responses and synthetic SSE streams to verify:

- the exact request body, including `site: "docs.zilliz.com"`;
- UAT agent configuration and conversation/request headers;
- session ID capture and reuse on the second turn;
- `stream-event`, `chunk`, and normalized `delta` rendering;
- deduplication when both raw content formats appear;
- sources, grounding, confidence, agent, status, and tool-call updates;
- malformed-event tolerance and session-expired errors;
- interrupt-before-local-abort behavior;
- stale-event rejection after cancellation;
- New Chat reset and history transport-state restoration; and
- Nginx exact-route precedence, streaming directives, affinity configuration, and absence of the token from browser runtime configuration.

Run the focused Vitest suite first, followed by the complete frontend suite, TypeScript checking, static-environment validation, and the production Docusaurus build.

### UAT integration verification

The real connection can only be verified after deploying the branch to UAT. Test against `https://docs.cloud-uat3.zilliz.com` and record evidence for:

1. A first question produces streamed visible text.
2. The request identifies the site as `docs.zilliz.com`.
3. A follow-up question retains conversational context.
4. Source and other supported metadata render when emitted.
5. Stop halts a long-running response and the UI becomes usable immediately.
6. A message after Stop remains on the same usable conversation when the remote session is still valid.
7. New Chat starts with new session and conversation identifiers.
8. No browser CORS, mixed-content, or authentication error occurs.
9. Nginx and browser diagnostics do not expose the bearer token or message contents beyond the existing redacted debug policy.

UAT failure must be reported as an integration result rather than masked by local mocked tests.

## Deployment and Rollout

The UAT deployment must provide:

- `CHAT_AGENT_AUTH_TOKEN` for Nginx;
- `CHAT_AGENT_CONFIG_CODE=zilliz_agent_dev` for the Docusaurus build; and
- Kubernetes DNS access from the zdoc Nginx pod to the three `cloud-ai-assistant` StatefulSet pods in namespace `vdc`.

Production promotion changes the agent config code to `zilliz_agent_prod` and uses the production token. The fixed site identifier remains `docs.zilliz.com` in both environments.

The generic `/api/` fallback remains in place, allowing a narrow rollback: remove or disable the two exact agent locations and restore the previous `/api/chat` behavior without changing search or feedback routing.

## Downstream Compatibility

`zdoc_cn` does not mirror this chat panel; it currently uses the Inkeep component from its own `src/theme/Root.js`. No downstream code change is required. The implementation must not copy the new `docs.zilliz.com` site identifier into `zdoc_cn`, and zdoc_cn build validation is unnecessary unless shared deployment tooling is changed outside the files described here.

## Out of Scope

- Changes to `cloud-ai-assistant` or `chat-proxy`.
- A public agent ingress or direct browser access to Kubernetes DNS.
- A new thinking-block visual design.
- Changes to search retrieval or feedback service contracts.
- Migrating `zdoc_cn` to the redesigned zdoc chat panel.
