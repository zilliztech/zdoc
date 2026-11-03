#!/usr/bin/env bash
# One conformance round against the Zilliz Cloud UAT3 environment.
# Control plane suite runs against $ZILLIZ_UAT3_CONTROL_PLANE; the dataplane
# suite runs against a cluster endpoint discovered from the control plane.
# Credentials: ZILLIZ_UAT3_* from the repo-root .env. Never echoed or logged.
#
# Usage: runner/uat_round.sh [--mode capture|verify|plain] [--date YYYY-MM-DD] [--suites controlplane,dataplane]
set -euo pipefail
cd "$(dirname "$0")/../.."

MODE="capture"; DATE="$(date +%F)"; SUITES="uat-controlplane,uat-dataplane"
while [ $# -gt 0 ]; do
  case "$1" in
    --mode) MODE="$2"; shift 2;;
    --date) DATE="$2"; shift 2;;
    --suites) SUITES="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done

# load credentials
if [ -f .env ]; then
  while IFS='=' read -r k v; do
    case "$k" in ZILLIZ_UAT3_*) export "$k=$v";; esac
  done < <(grep -E '^ZILLIZ_UAT3_[A-Z_]+=' .env)
fi
: "${ZILLIZ_UAT3_API_KEY:?ZILLIZ_UAT3_API_KEY missing (add to .env)}"
: "${ZILLIZ_UAT3_CONTROL_PLANE:?ZILLIZ_UAT3_CONTROL_PLANE missing (add to .env)}"

REPORT_DIR="packages/docs-tooling/src/reference/rest/conformance/reports/$DATE"
mkdir -p "$REPORT_DIR"
RUNNER="packages/docs-tooling/src/reference/rest/conformance/lib/case-runner.mjs"

run_suite() { # suite base out
  echo "== suite $1 → $2"
  node "$RUNNER" --suite "packages/docs-tooling/src/reference/rest/conformance/suites/$1" \
    --base-url "$2" --mode "$MODE" --out "$3"
}

# ---- control plane ----
if [[ ",$SUITES," == *",uat-controlplane,"* || ",$SUITES," == *"uat-controlplane"* ]]; then
  run_suite uat-controlplane "$ZILLIZ_UAT3_CONTROL_PLANE" "$REPORT_DIR/results-uat-controlplane.json"
fi

# ---- dataplane (endpoint discovery) ----
if [[ ",$SUITES," == *",uat-dataplane,"* || ",$SUITES," == *"uat-dataplane"* ]]; then
  DP_URL="${ZILLIZ_UAT3_DP_URL:-}"
  if [ -z "$DP_URL" ]; then
    echo "== discovering dataplane endpoint via control plane"
    DP_URL="$(python3 - <<'PY'
import json, os, urllib.request
key = os.environ["ZILLIZ_UAT3_API_KEY"]
base = os.environ["ZILLIZ_UAT3_CONTROL_PLANE"].rstrip("/")
req = urllib.request.Request(base + "/v2/clusters?pageSize=100", headers={"Authorization": "Bearer " + key})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        body = json.load(r)
except Exception as e:
    print(""); raise SystemExit(0)
data = body.get("data") or {}
clusters = data.get("clusters") if isinstance(data, dict) else data
for c in clusters or []:
    for k in ("clusterEndpoint", "endpoint", "host", "clusterHost", "connection", "connectAddress"):
        v = (c.get(k) if isinstance(c, dict) else None)
        if isinstance(v, str) and v:
            print(("https://" + v) if "://" not in v else v); raise SystemExit(0)
        if isinstance(v, dict):
            for vv in v.values():
                if isinstance(vv, str) and vv:
                    print(("https://" + vv) if "://" not in vv else vv); raise SystemExit(0)
print("")
PY
)"
  fi
  if [ -z "$DP_URL" ]; then
    echo "SKIP uat-dataplane: no cluster endpoint discovered (set ZILLIZ_UAT3_DP_URL to override)" >&2
  else
    echo "== dataplane endpoint discovered (host redacted)"
    # stale sweep: drop uatdp_ prefixed collections left by crashed rounds
    python3 - "$DP_URL" <<'PY'
import json, os, sys, urllib.request
base, key = sys.argv[1].rstrip("/"), os.environ["ZILLIZ_UAT3_API_KEY"]
def post(path, payload):
    req = urllib.request.Request(base + path, data=json.dumps(payload).encode(),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)
    except Exception: return {}
lst = post("/v2/vectordb/collections/list", {})
for c in (lst.get("data") or []):
    if isinstance(c, str) and c.startswith("uatdp_"):
        print("# sweep: dropping stale collection", c)
        post("/v2/vectordb/collections/drop", {"collectionName": c})
PY
    run_suite uat-dataplane "$DP_URL" "$REPORT_DIR/results-uat-dataplane.json"
  fi
fi

echo "== UAT round complete: $REPORT_DIR"
