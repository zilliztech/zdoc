#!/usr/bin/env bash
# One conformance round against the Zilliz Cloud UAT3 environment.
# Control plane suite runs against $ZILLIZ_UAT3_CONTROL_PLANE; the dataplane
# suite runs against a cluster endpoint discovered from the control plane.
# Credentials: ZILLIZ_UAT3_* from the repo-root .env. Never echoed or logged.
#
# Usage: runner/uat_round.sh [--mode capture|verify|plain] [--date YYYY-MM-DD] [--suites controlplane,dataplane]
set -euo pipefail
REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)" || { echo "not inside a git repo" >&2; exit 2; }
cd "$REPO_ROOT"

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

# ---- dataplane (endpoint discovery, with self-provisioned fixture fallback) ----
if [[ ",$SUITES," == *",uat-dataplane,"* || ",$SUITES," == *"uat-dataplane"* ]]; then
  DP_URL="${ZILLIZ_UAT3_DP_URL:-}"
  FIXTURE_CLUSTER_ID=""
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
except Exception:
    print(""); raise SystemExit(0)
data = body.get("data") or {}
clusters = data.get("clusters") if isinstance(data, dict) else data
running = [c for c in (clusters or [])
           if isinstance(c, dict) and "RUNNING" in str(c.get("status", ""))]
# prefer a pre-existing (non-fixture) cluster; a RUNNING cpz_ cluster left by
# the control-plane round is equally usable.
ordered = [c for c in running if not str(c.get("clusterName", "")).startswith("cpz_")] + \
          [c for c in running if str(c.get("clusterName", "")).startswith("cpz_")]
for c in ordered:
    for k in ("clusterEndpoint", "endpoint", "host", "clusterHost", "connection", "connectAddress"):
        v = c.get(k)
        if isinstance(v, str) and v:
            print(("https://" + v) if "://" not in v else v); raise SystemExit(0)
print("")
PY
)"
  fi
  if [ -z "$DP_URL" ] && [ -z "${ZILLIZ_UAT3_NO_FIXTURE:-}" ]; then
    echo "== no RUNNING cluster found — provisioning a cpz_dp_ dedicated fixture (self-sufficient round, dropped afterwards)"
    PROV_OUT="$(python3 - <<'PY'
import json, os, time, urllib.request
key = os.environ["ZILLIZ_UAT3_API_KEY"]
base = os.environ["ZILLIZ_UAT3_CONTROL_PLANE"].rstrip("/")
proj = os.environ.get("ZILLIZ_UAT3_PROJECT", "")
def req(method, path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    r = urllib.request.Request(base + path, data=data, method=method,
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=30) as resp: return json.load(resp)
    except Exception as e:
        return {"code": -1, "message": str(e)}
def region():
    # project-bound regionIds are the authoritative create-validity list;
    # intersect with regions that support dedicated clusters
    pd = req("GET", "/v2/projects/" + os.environ.get("ZILLIZ_UAT3_PROJECT", ""))
    bound = (pd.get("data") or {}).get("regionIds") or []
    d = req("GET", "/v2/regions")
    sup = {r.get("regionId"): (r.get("supportedClusterTypes") or []) for r in (d.get("data") or [])}
    for rid in bound:
        if "dedicated" in sup.get(rid, []):
            return rid
    return "aws-us-west-2"
reg = region()
name = "cpz_dp_" + str(int(time.time()) % 100000)
cid = None
for cu in ("Performance-optimized", "Capacity-optimized"):
    d = req("POST", "/v2/clusters/createDedicated",
            {"clusterName": name, "projectId": proj, "regionId": reg, "cuType": cu, "cuSize": 1})
    dd = d.get("data")
    cid = dd if isinstance(dd, str) else (dd or {}).get("clusterId") or (dd or {}).get("id")
    if cid: break
if not cid:
    print("PROV_FAIL: create rejected " + json.dumps(d)[:160]); raise SystemExit(0)
print("CLUSTER_ID: " + cid, flush=True)
endpoint = None
for i in range(36):  # <=12 min provisioning window
    d = req("GET", f"/v2/clusters/{cid}")
    c = d.get("data") or {}
    st = c.get("status", "?")
    if st == "RUNNING":
        for k in ("clusterEndpoint", "endpoint", "host", "clusterHost", "connection", "connectAddress"):
            v = c.get(k)
            if isinstance(v, str) and v:
                endpoint = ("https://" + v) if "://" not in v else v
                break
        if endpoint: break
    if st in ("FAILED", "ERROR"):
        print("PROV_FAIL: provisioning failed: " + st); raise SystemExit(0)
    time.sleep(20)
if endpoint:
    print("DP_URL: " + endpoint)
else:
    print("PROV_FAIL: not RUNNING within 12min (last status=" + st + ")")
PY
)"
    if echo "$PROV_OUT" | grep -q "^PROV_FAIL:"; then
      echo "SKIP uat-dataplane: fixture provisioning failed — $(echo "$PROV_OUT" | grep '^PROV_FAIL:' | cut -d' ' -f2-)" >&2
    else
      FIXTURE_CLUSTER_ID="$(echo "$PROV_OUT" | grep '^CLUSTER_ID:' | cut -d' ' -f2)"
      DP_URL="$(echo "$PROV_OUT" | grep '^DP_URL:' | cut -d' ' -f2)"
      echo "== fixture cluster $FIXTURE_CLUSTER_ID provisioned (dropped after the suite)"
    fi
  fi
  if [ -z "$DP_URL" ]; then
    echo "SKIP uat-dataplane: no cluster endpoint discovered (set ZILLIZ_UAT3_DP_URL to override)" >&2
  else
    echo "== dataplane endpoint ready (host redacted)"
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
  # fixture teardown: acceptance semantics; leftover is swept by the next round
  if [ -n "$FIXTURE_CLUSTER_ID" ]; then
    echo "== dropping dataplane fixture cluster $FIXTURE_CLUSTER_ID"
    python3 - "$FIXTURE_CLUSTER_ID" <<'PY'
import json, os, sys, urllib.request
cid = sys.argv[1]
key = os.environ["ZILLIZ_UAT3_API_KEY"]
base = os.environ["ZILLIZ_UAT3_CONTROL_PLANE"].rstrip("/")
r = urllib.request.Request(base + f"/v2/clusters/{cid}/drop", data=b"{}", method="DELETE",
    headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
try:
    with urllib.request.urlopen(r, timeout=30) as resp: print("fixture drop accepted:", json.load(resp).get("code", "?"))
except Exception as e:
    print("fixture drop failed (next round's sweep retries):", str(e)[:120])
PY
    FIXTURE_CLUSTER_ID=""
  fi
fi

echo "== UAT round complete: $REPORT_DIR"
