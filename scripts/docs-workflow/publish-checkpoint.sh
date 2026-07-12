#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo 'Usage: bash publish-checkpoint.sh --artifact <dir> --branch <branch> --message <text> --max-attempts <1-10> --validate-command <command> [--remote <name>] [--author-name <name>] [--author-email <email>] [--baseline-dir <dir>]'
}
die() { echo "Checkpoint publication failed: $*" >&2; exit 1; }
emit() { printf '%s=%s\n' "$1" "$2"; if [[ -n "${GITHUB_OUTPUT:-}" ]]; then printf '%s=%s\n' "$1" "$2" >> "$GITHUB_OUTPUT"; fi; }

artifact= branch= message= validate_command= baseline_dir= remote=origin author_name='docs-publish-bot' author_email='docs-publish-bot@users.noreply.github.com' max_attempts=3
seen='|'
if [[ $# -eq 1 && $1 == --help ]]; then usage; exit 0; fi
[[ $# -gt 0 ]] || { usage >&2; exit 1; }
while [[ $# -gt 0 ]]; do
  flag=$1; shift
  case "$flag" in
    --artifact|--branch|--message|--max-attempts|--validate-command|--remote|--author-name|--author-email|--baseline-dir) ;;
    --help) die '--help must be used alone' ;;
    *) die "Unknown argument: $flag" ;;
  esac
  [[ "$seen" != *"|$flag|"* ]] || die "Duplicate argument: $flag"; seen="$seen$flag|"
  [[ $# -gt 0 ]] || die "Missing value for $flag"; value=$1; shift
  case "$flag" in
    --artifact) artifact=$value;; --branch) branch=$value;; --message) message=$value;;
    --max-attempts) max_attempts=$value;; --validate-command) validate_command=$value;; --remote) remote=$value;;
    --author-name) author_name=$value;; --author-email) author_email=$value;; --baseline-dir) baseline_dir=$value;;
  esac
done
for required in --artifact --branch --message --validate-command; do [[ "$seen" == *"|$required|"* ]] || die "Missing required argument: $required"; done
[[ -d "$artifact" ]] || die 'Artifact must be a directory'
[[ "$message" != *$'\n'* && -n "$message" ]] || die 'Message must be non-empty and single-line'
[[ "$validate_command" != *$'\n'* && -n "$validate_command" ]] || die 'Validation command must be non-empty and single-line (trusted workflow input only)'
[[ "$max_attempts" =~ ^([1-9]|10)$ ]] || die 'max-attempts must be an integer from 1 to 10'
[[ "$remote" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || die 'Remote must be a simple configured name'
git check-ref-format --branch "$branch" >/dev/null 2>&1 || die 'Unsafe branch name'
git config --get "remote.$remote.url" >/dev/null || die 'Remote is not configured'

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
node "$script_dir/validate-checkpoint-artifact.js" --artifact "$artifact" >/dev/null
manifest_json=$(node -e "const {validateCheckpointArtifact}=require(process.argv[1]); validateCheckpointArtifact(process.argv[2]).then(m=>process.stdout.write(JSON.stringify({group:m.group,stage:m.stage,masterSha:m.masterSha,devBaselineSha:m.devBaselineSha,paths:[...new Set([...m.files.map(x=>x.path),...m.deletions])]}))).catch(e=>{console.error(e.message);process.exit(1)})" "$script_dir/validate-checkpoint-artifact.js" "$artifact")
group=$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).group)' "$manifest_json")
stage=$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).stage)' "$manifest_json")
master_sha=$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).masterSha)' "$manifest_json")
baseline_sha=$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).devBaselineSha)' "$manifest_json")

active_worktree=
cleanup() {
  if [[ -n "$active_worktree" ]]; then git worktree remove --force "$active_worktree" >/dev/null 2>&1 || true; active_worktree=; fi
  git worktree prune >/dev/null 2>&1 || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

attempt=1
while (( attempt <= max_attempts )); do
  git fetch --no-tags "$remote" "+refs/heads/$branch:refs/remotes/$remote/$branch"
  root=${RUNNER_TEMP:-/tmp}; mkdir -p "$root"; active_worktree=$(mktemp -d "$root/docs-publish.XXXXXX"); rmdir "$active_worktree"
  git worktree add --detach "$active_worktree" "refs/remotes/$remote/$branch" >/dev/null
  apply_args=(--artifact "$artifact" --target "$active_worktree")
  [[ -z "$baseline_dir" ]] || apply_args+=(--baseline-dir "$baseline_dir")
  node "$script_dir/apply-checkpoint-artifact.js" "${apply_args[@]}"
  (cd "$active_worktree" && bash -o errexit -o nounset -o pipefail -c "$validate_command")
  paths_file=$(mktemp "$root/docs-paths.XXXXXX")
  node -e 'for(const p of JSON.parse(process.argv[1]).paths) process.stdout.write(p+"\0")' "$manifest_json" > "$paths_file"
  paths=(); while IFS= read -r -d '' p; do paths+=("$p"); done < "$paths_file"; rm -f "$paths_file"
  (cd "$active_worktree" && git add --all -- "${paths[@]}")
  if (cd "$active_worktree" && git diff --cached --quiet); then
    sha=$(git -C "$active_worktree" rev-parse HEAD); emit status no_changes; emit commit_sha "$sha"; exit 0
  fi
  git -C "$active_worktree" config user.name "$author_name"; git -C "$active_worktree" config user.email "$author_email"
  body=$(printf 'group: %s\nstage: %s\nmasterSha: %s\ndevBaselineSha: %s' "$group" "$stage" "$master_sha" "$baseline_sha")
  [[ -z "${GITHUB_RUN_ID:-}" ]] || body="$body"$'\n'"GITHUB_RUN_ID: $GITHUB_RUN_ID"
  [[ -z "${GITHUB_SERVER_URL:-}" || -z "${GITHUB_REPOSITORY:-}" || -z "${GITHUB_RUN_ID:-}" ]] || body="$body"$'\n'"GITHUB_RUN_URL: $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
  git -C "$active_worktree" commit -m "$message" -m "$body" >/dev/null
  if [[ "${NODE_ENV:-}" == test && -n "${DOCS_PUBLISH_BEFORE_PUSH_HOOK:-}" ]]; then (cd "$active_worktree" && bash -c "$DOCS_PUBLISH_BEFORE_PUSH_HOOK"); fi
  push_err=$(mktemp "$root/docs-push.XXXXXX")
  if git -C "$active_worktree" push "$remote" "HEAD:refs/heads/$branch" 2>"$push_err"; then
    sha=$(git -C "$active_worktree" rev-parse HEAD); rm -f "$push_err"; emit status published; emit commit_sha "$sha"; exit 0
  fi
  error=$(<"$push_err"); rm -f "$push_err"; echo "$error" >&2
  if [[ "$error" == *"non-fast-forward"* || "$error" == *"fetch first"* ]]; then
    cleanup
    if (( attempt == max_attempts )); then emit status failed; exit 1; fi
    attempt=$((attempt + 1)); continue
  fi
  exit 1
done
