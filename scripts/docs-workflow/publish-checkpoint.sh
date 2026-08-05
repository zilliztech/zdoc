#!/usr/bin/env bash
set -eEuo pipefail

usage() { echo 'Usage: bash publish-checkpoint.sh --artifact <dir> --branch <branch> --message <text> --max-attempts <1-10> --validate-command <command> [--remote <name>] [--author-name <name>] [--author-email <email>] [--baseline-dir <dir>]'; }
terminal_output=0
emit_line() { printf '%s=%s\n' "$1" "$2"; [[ -z "${GITHUB_OUTPUT:-}" ]] || printf '%s=%s\n' "$1" "$2" >> "$GITHUB_OUTPUT"; }
finish_output() { [[ $terminal_output -eq 0 ]] || return 0; terminal_output=1; emit_line status "$1"; emit_line commit_sha "$2"; }
die() { echo "Checkpoint publication failed: $*" >&2; finish_output failed ''; exit 1; }

trap 'finish_output failed ""; exit 130' INT
trap 'finish_output failed ""; exit 143' TERM

if [[ $# -eq 1 && $1 == --help ]]; then usage; terminal_output=1; exit 0; fi

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
set +e
result=$(node "$script_dir/checkpoint-publication.js" legacy-json "$@")
code=$?
set -e
[[ $code -eq 0 ]] || die "structured transaction exited $code"

publication_status=$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).status)' "$result")
commit_sha=$(node -e 'const value=JSON.parse(process.argv[1]);process.stdout.write(value.resultSha || "")' "$result")
case "$publication_status" in
  published|no_changes)
    finish_output "$publication_status" "$commit_sha"
    ;;
  publish_failed)
    detail=$(node -e 'const value=JSON.parse(process.argv[1]);process.stdout.write(value.failure?.message || "Publication failed")' "$result")
    echo "Checkpoint publication failed: $detail" >&2
    finish_output failed ''
    exit 1
    ;;
  *)
    die "unexpected structured status: $publication_status"
    ;;
esac
