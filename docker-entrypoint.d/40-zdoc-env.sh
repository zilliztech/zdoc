#!/bin/sh
set -eu

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
