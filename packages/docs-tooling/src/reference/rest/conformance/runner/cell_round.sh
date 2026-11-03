#!/usr/bin/env bash
# One REST-reference conformance round on milvus-cell vClusters.
#
# Lifecycle (user decision 2026-11-03): create-per-round, delete-after, no idle.
# Safety valve: if the user's own vCluster already exists (Running/Sleeping), it
# is only woken — never deleted; only the round's helm releases are cleaned.
# Auth: human Feishu JWT (~/.milvus-cell/token.json, <=14 days). On auth failure
# the script exits 10 (TOKEN_EXPIRED) and never retries — re-login is manual.
#
# Usage: runner/cell_round.sh [--mode capture|verify|plain] \
#          [--anchors v2.6.26,v3.0.5] [--filter <substring|family=x>] [--date YYYY-MM-DD]
set -euo pipefail
REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)" || { echo "not inside a git repo" >&2; exit 2; }
cd "$REPO_ROOT"

MODE="capture"; ANCHORS="v2.6.26,v3.0.5"; FILTER=""; DATE="$(date +%F)"
while [ $# -gt 0 ]; do
  case "$1" in
    --mode) MODE="$2"; shift 2;;
    --anchors) ANCHORS="$2"; shift 2;;
    --filter) FILTER="$2"; shift 2;;
    --date) DATE="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done

export KUBECONFIG="${KUBECONFIG:-$HOME/.milvus-cell/kubeconfig}"
REPORT_DIR="packages/docs-tooling/src/reference/rest/conformance/reports/$DATE"
mkdir -p "$REPORT_DIR"

status_json="$(milvus-cell status --json 2>/dev/null)" || {
  echo "TOKEN_EXPIRED: milvus-cell auth failed. Run 'milvus-cell status' and complete the browser login, then retry." >&2
  exit 10
}
phase="$(echo "$status_json" | python3 -c 'import json,sys;print(json.load(sys.stdin)["phase"])')"
CREATED=0
case "$phase" in
  NotFound) milvus-cell create >/dev/null; CREATED=1;;
  Sleeping) milvus-cell wake >/dev/null;;
  Running) : ;;
  *) echo "vCluster phase=$phase — not runnable, aborting" >&2; exit 1;;
esac
echo "== vCluster phase=$phase created=$CREATED"

PF_PIDS=()
cleanup() {
  set +e
  for pid in "${PF_PIDS[@]:-}"; do kill "$pid" 2>/dev/null; done
  for rel in "${INSTALLED[@]:-}"; do
    ns="conf-${rel#m-}"
    helm uninstall "$rel" -n "$ns" >/dev/null 2>&1
    kubectl delete ns "$ns" --ignore-not-found >/dev/null 2>&1
  done
  if [ "$CREATED" = "1" ]; then
    echo "== deleting round-created vCluster"
    milvus-cell delete --confirm >/dev/null 2>&1 || echo "WARN: vCluster delete failed — inspect with milvus-cell status" >&2
  fi
  set -e
}
INSTALLED=()
trap cleanup EXIT

# residual sweep: namespaces from crashed prior rounds
for ns in $(kubectl get ns -o name | grep 'conf-' | cut -d/ -f2 || true); do
  echo "== residual sweep: removing stale $ns"
  helm uninstall "m-${ns#conf-}" -n "$ns" >/dev/null 2>&1 || true
  kubectl delete ns "$ns" --ignore-not-found >/dev/null 2>&1 || true
done

helm repo add milvus https://zilliztech.github.io/milvus-helm/ --force-update >/dev/null 2>&1 || true

IFS=',' read -ra ANCHOR_LIST <<< "$ANCHORS"
for ver in "${ANCHOR_LIST[@]}"; do
  ns="conf-$(echo "$ver" | tr -d .)"
  rel="m-$(echo "$ver" | tr -d .)"
  echo "== [$ver] helm install (ns=$ns)"
  kubectl create ns "$ns" --dry-run=client -o yaml | kubectl apply -f - >/dev/null
  helm upgrade --install "$rel" milvus/milvus -n "$ns" \
    --set cluster.enabled=false --set etcd.replicaCount=1 \
    --set minio.mode=standalone --set pulsar.enabled=false --set pulsarv3.enabled=false \
    --set image.all.repository=milvusdb/milvus --set image.all.tag="$ver" \
    --set proxy.http.enabled=true --wait --timeout 15m >/dev/null
  INSTALLED+=("$rel")
  kubectl rollout status deployment/"$rel"-milvus-standalone -n "$ns" --timeout=10m >/dev/null

  digest="$(kubectl -n "$ns" get deployment "$rel"-milvus-standalone \
    -o jsonpath='{.spec.template.spec.containers[?(@.name=="milvus")].image}' 2>/dev/null || true)"
  echo "{\"anchor\":\"$ver\",\"image\":\"$digest\"}" >> "$REPORT_DIR/images.jsonl"

  pfport=$(( 20000 + RANDOM % 20000 ))
  kubectl port-forward -n "$ns" svc/"$rel"-milvus "$pfport":19530 >/dev/null 2>&1 &
  pfpid=$!
  PF_PIDS+=("$pfpid")
  for i in $(seq 1 60); do
    curl -sf -X POST "http://127.0.0.1:$pfport/v2/vectordb/collections/list" -H 'Content-Type: application/json' -d '{}' >/dev/null 2>&1 && break
    sleep 2
  done
  echo "== [$ver] running suite (mode=$MODE)"

  EXTRA=()
  [ -n "$FILTER" ] && EXTRA=(--filter "$FILTER")
  node packages/docs-tooling/src/reference/rest/conformance/lib/case-runner.mjs \
    --suite "packages/docs-tooling/src/reference/rest/conformance/suites/milvus-${ver#v}" \
    --base-url "http://127.0.0.1:$pfport" \
    --mode "$MODE" \
    --out "$REPORT_DIR/results-milvus-$ver.json" \
    "${EXTRA[@]:-}"

  kill "$pfpid" 2>/dev/null || true
  PF_PIDS=("${PF_PIDS[@]/$pfpid/}")
  helm uninstall "$rel" -n "$ns" >/dev/null 2>&1 || true
  kubectl delete ns "$ns" --ignore-not-found >/dev/null 2>&1 || true
  INSTALLED=("${INSTALLED[@]/$rel/}")
  echo "== [$ver] done, namespace cleaned"
done

echo "== round complete: $REPORT_DIR"
