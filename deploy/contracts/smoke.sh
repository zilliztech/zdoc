#!/usr/bin/env bash
set -euo pipefail

IMAGE=${1:?usage: smoke.sh IMAGE SITE}
EXPECTED_SITE=${2:?usage: smoke.sh IMAGE SITE}

case "$EXPECTED_SITE" in
  en) REPRESENTATIVE_ROUTE=/docs/home ;;
  zh-CN) REPRESENTATIVE_ROUTE=/home/ ;;
  *) echo "unexpected site: $EXPECTED_SITE" >&2; exit 2 ;;
esac

SOURCE_LABEL=org.opencontainers.image.source
REVISION_LABEL=org.opencontainers.image.revision
SITE_LABEL=com.zilliz.zdoc.site
JENKINS_LABEL=com.zilliz.jenkins.build-id
EXPECTED_SOURCE=https://github.com/zilliztech/zdoc

label() {
  docker image inspect --format "{{ index .Config.Labels \"$1\" }}" "$IMAGE"
}

SOURCE=$(label "$SOURCE_LABEL")
REVISION=$(label "$REVISION_LABEL")
ACTUAL_SITE=$(label "$SITE_LABEL")
JENKINS_BUILD_ID=$(label "$JENKINS_LABEL")

[ "$SOURCE" = "$EXPECTED_SOURCE" ] || { echo "source label mismatch" >&2; exit 1; }
echo "$REVISION" | grep -Eq '^[0-9a-f]{40}$' || { echo "invalid revision label" >&2; exit 1; }
[ "$ACTUAL_SITE" = "$EXPECTED_SITE" ] || { echo "site mismatch: expected $EXPECTED_SITE, image is $ACTUAL_SITE" >&2; exit 1; }
[ -n "$JENKINS_BUILD_ID" ] || { echo "missing Jenkins build identity" >&2; exit 1; }

CONTAINER=zdoc-smoke-$(date +%s)-$$
trap 'docker rm -f "$CONTAINER" >/dev/null 2>&1 || true' EXIT INT TERM
docker run --detach --name "$CONTAINER" --publish 127.0.0.1::80 "$IMAGE" >/dev/null

PORT=$(docker port "$CONTAINER" 80/tcp | sed -n 's/.*://p' | head -n 1)
[ -n "$PORT" ] || { echo "container did not publish port 80" >&2; exit 1; }

attempt=0
until curl --fail --silent --show-error "http://127.0.0.1:$PORT/healthz" >/dev/null; do
  attempt=$((attempt + 1))
  [ "$attempt" -lt 30 ] || { docker logs "$CONTAINER" >&2; exit 1; }
  sleep 1
done

curl --fail --silent --show-error "http://127.0.0.1:$PORT$REPRESENTATIVE_ROUTE" >/dev/null
