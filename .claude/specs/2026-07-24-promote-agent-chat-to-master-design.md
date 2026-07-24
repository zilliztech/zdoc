# Promote Agent Chat Integration to Master Design

## Objective

Promote the UAT-verified `cloud-ai-assistant` chat integration from `dev` to `master` without merging unrelated generated documentation changes, while allowing the exact same Docker image to run in UAT and production.

## Verified starting point

- UAT image `dev-20260724-0234ed4c4` is running successfully in namespace `zdocs` with zero restarts.
- `https://docs.cloud-uat3.zilliz.com/docs/home` returns HTTP 200.
- The chat panel streams a response from `cloud-ai-assistant` in UAT.
- `cloud-ai-assistant` is a three-replica StatefulSet in namespace `vdc`.
- The zdocs client does not require or forward an authentication token.
- `master` does not yet contain the chat integration.

## Promotion strategy

Create `codex/promote-agent-chat-to-master` from the current `origin/master`. Cherry-pick only the seven implementation commits that produced the verified UAT behavior:

1. `8f2198806` — parse agent SSE streams
2. `864e283b0` — send the docs agent request contract
3. `84c751268` — render raw agent streams
4. `ec4e5e20d` — preserve and interrupt agent sessions
5. `68fe77f46` — proxy agent traffic through Nginx
6. `e3125bf3e` — cover the browser agent contract
7. `830b6bb44` — remove the client authentication requirement

Do not merge `dev` wholesale. Do not cherry-pick the original design and plan commits because they describe a bearer-token requirement that was disproved by the UAT deployment and removed in PR #127.

After cherry-picking, add one focused runtime-environment correction so the same built image selects the correct agent configuration after deployment.

## Runtime architecture

The network path is identical in UAT and production:

```text
Browser
  POST /api/chat
  POST /api/chat/interrupt
       |
       v
zdocs Nginx
       |
       v
cloud-ai-assistant-<0..2>.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000
```

The browser always uses same-origin zdocs endpoints. Nginx owns the in-cluster routing and consistently hashes `X-Conversation-ID` so chat and interrupt requests reach the same StatefulSet pod.

The URL and request site identity do not change by environment:

- internal agent URL: the existing `cloud-ai-assistant` service/pod DNS in namespace `vdc`;
- browser endpoint: `/api/chat` and `/api/chat/interrupt`;
- request field: `site: "docs.zilliz.com"`.

Neither the browser nor zdocs Nginx sends an `Authorization` header or reads a chat token environment variable.

## Runtime agent configuration selection

The UAT image may be promoted unchanged to production, so `agent_config_code` must not be baked into the Docusaurus bundle or Docker image.

Add a focused helper under the chat component boundary:

```ts
export type ChatAgentConfigCode = 'zilliz_agent_dev' | 'zilliz_agent_prod';

export function getChatAgentConfigCode(hostname?: string): ChatAgentConfigCode {
  const resolvedHostname = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname);
  return resolvedHostname === 'docs.zilliz.com'
    ? 'zilliz_agent_prod'
    : 'zilliz_agent_dev';
}
```

Resolve the value when sending a request, not during static rendering. This avoids server-side rendering access to `window` and ensures the deployed hostname determines the environment:

- `docs.zilliz.com` → `zilliz_agent_prod`;
- UAT, preview, localhost, and every other hostname → `zilliz_agent_dev`.

Remove the `agentConfigCode` prop from `ChatProvider`, remove the duplicated provider wiring, remove `chatAgentConfigCode` from Docusaurus `customFields`, and remove `CHAT_AGENT_CONFIG_CODE` from the Docker build arguments and environment.

## Request contract

The chat request remains:

```json
{
  "message": "current user message",
  "session_id": null,
  "conversationId": "client-generated UUID",
  "streaming_mode": "token",
  "site": "docs.zilliz.com",
  "agent_config": {
    "agent_config_code": "zilliz_agent_dev or zilliz_agent_prod from runtime hostname"
  }
}
```

The hostname affects only `agent_config.agent_config_code`. It does not affect the internal upstream URL or the `site` field.

## Testing strategy

Add unit tests for the runtime selector:

- exact production hostname returns `zilliz_agent_prod`;
- UAT hostname returns `zilliz_agent_dev`;
- localhost and missing hostname return `zilliz_agent_dev`.

Update `ChatContext` tests to remove the provider prop and prove requests use the selector result. Keep the UAT/default request assertion on `zilliz_agent_dev`, and add a production-hostname assertion for `zilliz_agent_prod`.

Update the Playwright contract test to keep the UAT expectation `zilliz_agent_dev`. The existing same-origin route, site identity, SSE, redacted debug, session, and interrupt tests remain unchanged.

Run the complete verification gate:

- focused agent selector, stream parser, and ChatContext tests;
- Nginx policy tests;
- Playwright chat test;
- chat-ui build;
- TypeScript;
- static environment validation;
- full frontend tests;
- production Docusaurus build;
- Docker build and token-free `nginx -t`;
- secret and diff checks.

## Promotion and rollout

Open a focused PR from `codex/promote-agent-chat-to-master` to `master`. The PR must contain only the chat integration, runtime selector, corrected design/plan artifacts, and directly generated chat-ui type output.

After merge, production may deploy either a newly built image or the already tested UAT image. Runtime hostname selection must produce `zilliz_agent_prod` on `docs.zilliz.com` without deployment-specific environment variables.

Post-deployment checks:

1. Confirm the production zdocs pod is ready with zero restarts.
2. Confirm `/docs/home` returns HTTP 200.
3. Send a production chat request and verify the body contains `site: "docs.zilliz.com"` and `agent_config_code: "zilliz_agent_prod"`.
4. Verify streaming, multi-turn context, Stop/interrupt, and New Chat behavior.
5. Confirm the browser request and built assets contain no authentication token.

## Downstream assessment

`zdoc_cn` uses an independent Inkeep integration in `src/theme/Root.js`. This promotion does not change shared documentation generation, translation tooling, or zdoc_cn deployment code. No zdoc_cn code or build change is required.

## Success criteria

- The master PR is limited to the intended chat integration and runtime-environment correction.
- One Docker image behaves as UAT on non-production hostnames and as production on `docs.zilliz.com`.
- Both environments use the same internal agent URL and `site: "docs.zilliz.com"`.
- No token is required, forwarded, logged, or exposed.
- All local verification commands pass.
- Production chat passes the same functional checks already completed in UAT.
