const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const nginx = fs.readFileSync('nginx.conf', 'utf8');
const entrypoint = fs.readFileSync('docker-entrypoint.d/40-zdoc-env.sh', 'utf8');
const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
const docusaurusConfig = fs.readFileSync('docusaurus.config.ts', 'utf8');

test('selects the agent at browser runtime instead of image build time', () => {
  assert.doesNotMatch(dockerfile, /CHAT_AGENT_CONFIG_CODE/);
  assert.doesNotMatch(docusaurusConfig, /chatAgentConfigCode/);
  assert.doesNotMatch(docusaurusConfig, /CHAT_AGENT_CONFIG_CODE/);
});

test('routes chat and interrupt directly to the private agent with affinity', () => {
  assert.match(nginx, /include \/etc\/nginx\/chat-agent-runtime\.conf;/);
  assert.match(nginx, /location = \/api\/chat\s*{/);
  assert.match(nginx, /proxy_pass http:\/\/docs_agent\/api\/chat\/stream;/);
  assert.match(nginx, /location = \/api\/chat\/interrupt\s*{/);
  assert.match(nginx, /proxy_pass http:\/\/docs_agent\/api\/chat\/interrupt;/);
  assert.ok(nginx.indexOf('location = /api/chat') < nginx.indexOf('location /api/'));
  assert.ok(entrypoint.includes('hash \\$http_x_conversation_id consistent;'));
  assert.match(entrypoint, /zone docs_agent 64k;/);
  for (const pod of [0, 1, 2]) {
    assert.match(
      entrypoint,
      new RegExp(`cloud-ai-assistant-${pod}\\.cloud-ai-assistant-hs\\.vdc\\.svc\\.cluster\\.local:9000 resolve`),
    );
  }
});

test('keeps streaming unbuffered and does not require client authentication', () => {
  assert.match(nginx, /proxy_buffering off;/);
  assert.match(nginx, /proxy_cache off;/);
  assert.match(nginx, /proxy_read_timeout 300s;/);
  assert.doesNotMatch(entrypoint, /CHAT_AGENT_AUTH_TOKEN/);
  assert.doesNotMatch(entrypoint, /chat_agent_authorization/);
  assert.doesNotMatch(nginx, /proxy_set_header Authorization/);
  assert.doesNotMatch(nginx, /Bearer /);
});
