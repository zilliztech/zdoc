#!/bin/sh
set -eu

: "${CHAT_AGENT_AUTH_TOKEN:?CHAT_AGENT_AUTH_TOKEN is required}"

case "$CHAT_AGENT_AUTH_TOKEN" in
  *[!A-Za-z0-9._~+/=-]*)
    echo "CHAT_AGENT_AUTH_TOKEN contains unsupported characters" >&2
    exit 1
    ;;
esac

chat_agent_token="$CHAT_AGENT_AUTH_TOKEN"

cat > /etc/nginx/chat-agent-runtime.conf <<EOF
resolver 10.255.0.10 valid=30s ipv6=off;

upstream docs_agent {
  zone docs_agent 64k;
  hash \$http_x_conversation_id consistent;
  server cloud-ai-assistant-0.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000 resolve;
  server cloud-ai-assistant-1.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000 resolve;
  server cloud-ai-assistant-2.cloud-ai-assistant-hs.vdc.svc.cluster.local:9000 resolve;
}

map \$host \$chat_agent_authorization {
  default "Bearer ${chat_agent_token}";
}
EOF

env_js="${INSTALL_PATH:-/usr/share/nginx/html}/env.js"

escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > "$env_js" <<EOF
window.__ZDOC_ENV__ = {
  INKEEP_API_KEY: "$(escape_js "${INKEEP_API_KEY:-}")",
  INKEEP_INTEGRATION_ID: "$(escape_js "${INKEEP_INTEGRATION_ID:-}")",
  INKEEP_ORGANIZATION_ID: "$(escape_js "${INKEEP_ORGANIZATION_ID:-}")"
};
EOF
