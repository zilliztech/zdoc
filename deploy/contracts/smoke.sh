#!/usr/bin/env bash
set -euo pipefail

EXPECTED_SOURCE=https://github.com/zilliztech/zdoc
SOURCE_LABEL=org.opencontainers.image.source
REVISION_LABEL=org.opencontainers.image.revision
SITE_LABEL=com.zilliz.zdoc.site
JENKINS_LABEL=com.zilliz.jenkins.build-id

die() {
  echo "$*" >&2
  return 1
}

trim() {
  printf '%s' "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
}

representative_route() {
  case "$1" in
    en) printf '%s\n' /docs/home /ja-JP/docs/home ;;
    zh-CN) printf '%s\n' /docs/home ;;
    *) die "unexpected site: $1" ;;
  esac
}

rejected_route() {
  case "$1" in
    en) return 0 ;;
    zh-CN) printf '%s\n' /ja-JP/docs/home ;;
    *) die "unexpected site: $1" ;;
  esac
}

validate_labels() {
  local source=$1 revision=$2 actual_site=$3 jenkins_build_id=$4 expected_site=$5
  jenkins_build_id=$(trim "$jenkins_build_id")

  [[ -n "$source" && "$source" != '<no value>' ]] || die 'missing source label'
  [[ "$source" == "$EXPECTED_SOURCE" ]] || die 'source label mismatch'
  [[ "$revision" != '<no value>' && "$revision" =~ ^[0-9a-f]{40}$ ]] || die 'invalid revision label'
  [[ -n "$actual_site" && "$actual_site" != '<no value>' ]] || die 'missing site label'
  [[ "$actual_site" == "$expected_site" ]] || die "site mismatch: expected $expected_site, image is $actual_site"
  [[ -n "$jenkins_build_id" && "$jenkins_build_id" != '<no value>' ]] || die 'missing Jenkins build identity'
}

label() {
  local key=$1
  docker image inspect --format "{{ with index .Config.Labels \"$key\" }}{{ . }}{{ end }}" "$IMAGE"
}

http_200_nonempty() {
  local url=$1 output status
  output=$(mktemp "${TMPDIR:-/tmp}/zdoc-smoke-response.XXXXXX")
  if ! status=$(curl --location --fail --silent --show-error \
    --output "$output" --write-out '%{http_code}' "$url"); then
    rm -f "$output"
    return 1
  fi
  if [[ "$status" == 200 && -s "$output" ]]; then
    rm -f "$output"
    return 0
  fi
  rm -f "$output"
  return 1
}

http_expect_status() {
  local url=$1 expected=$2 output status
  output=$(mktemp "${TMPDIR:-/tmp}/zdoc-smoke-response.XXXXXX")
  status=$(curl --location --silent --show-error \
    --output "$output" --write-out '%{http_code}' "$url")
  rm -f "$output"
  [[ "$status" == "$expected" ]] || die "expected HTTP $expected from $url, received $status"
}

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}

main() {
  IMAGE=${1:?usage: smoke.sh IMAGE SITE}
  local expected_site=${2:?usage: smoke.sh IMAGE SITE}

  validate_labels \
    "$(label "$SOURCE_LABEL")" \
    "$(label "$REVISION_LABEL")" \
    "$(label "$SITE_LABEL")" \
    "$(label "$JENKINS_LABEL")" \
    "$expected_site"

  CONTAINER=zdoc-smoke-$(date +%s)-$$
  trap cleanup EXIT INT TERM
  docker run --detach --name "$CONTAINER" --publish 127.0.0.1::80 "$IMAGE" >/dev/null

  local port attempt=0
  port=$(docker port "$CONTAINER" 80/tcp | sed -n 's/.*://p' | head -n 1)
  [[ -n "$port" ]] || die 'container did not publish port 80'

  until http_200_nonempty "http://127.0.0.1:$port/healthz"; do
    attempt=$((attempt + 1))
    [[ "$attempt" -lt 30 ]] || { docker logs "$CONTAINER" >&2; return 1; }
    sleep 1
  done

  while IFS= read -r representative; do
    http_200_nonempty "http://127.0.0.1:$port$representative"
  done < <(representative_route "$expected_site")
  while IFS= read -r rejected; do
    [[ -n "$rejected" ]] && http_expect_status "http://127.0.0.1:$port$rejected" 404
  done < <(rejected_route "$expected_site")
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
