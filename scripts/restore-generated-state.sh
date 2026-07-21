#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [--exact] [branch] | [--exact] --ref <git-ref-or-sha>" >&2
}

target_branch="dev"
target_ref=""
exact=false

positional=()
while (( "$#" )); do
  case "$1" in
    --exact)
      if [ "$exact" = true ]; then usage; exit 2; fi
      exact=true
      shift
      ;;
    --ref)
      if [ -n "$target_ref" ] || (( "$#" < 2 )) || [ -z "$2" ]; then usage; exit 2; fi
      target_ref="$2"
      shift 2
      ;;
    --*)
      usage
      exit 2
      ;;
    *)
      positional+=("$1")
      shift
      ;;
  esac
done

if (( "${#positional[@]}" > 1 )) || { [ -n "$target_ref" ] && (( "${#positional[@]}" )); }; then
  usage
  exit 2
fi
if (( "${#positional[@]}" == 1 )); then
  if [ -z "${positional[0]}" ] || [[ "${positional[0]}" == -* ]]; then
    usage
    exit 2
  fi
  target_branch="${positional[0]}"
fi
if [ "$exact" = true ] && [ -z "$target_ref" ] && (( "${#positional[@]}" == 0 )); then
  usage
  exit 2
fi

if [[ "${target_branch}${target_ref}" == *$'\n'* || "${target_branch}${target_ref}" == *$'\r'* ]]; then
  echo "[restore-generated-state] branch and ref values must not contain newlines" >&2
  usage
  exit 2
fi

if [ -z "${target_ref}" ]; then
  if [[ "${target_branch}" == *:* ]] || ! git check-ref-format --branch "${target_branch}" >/dev/null 2>&1; then
    echo "[restore-generated-state] invalid branch name: ${target_branch}" >&2
    usage
    exit 2
  fi
fi

repo_root="$(git rev-parse --show-toplevel)"
if [ "$(pwd -P)" != "$(cd "$repo_root" && pwd -P)" ]; then
  echo "[restore-generated-state] must run from the Git repository top-level" >&2
  exit 2
fi

if [ -n "${target_ref}" ]; then
  if [[ "${target_ref}" =~ ^[0-9a-f]{40}$ ]] && git cat-file -e "${target_ref}^{commit}" 2>/dev/null; then
    resolved_ref="${target_ref}"
  else
    git fetch --depth=1 origin -- "${target_ref}"
    resolved_ref="FETCH_HEAD"
  fi
else
  git fetch origin "${target_branch}" --depth=1
  resolved_ref="origin/${target_branch}"
fi

paths=(
  "docs"
  "docs-byoc"
  "reference"
  "i18n"
  ".translation-cache"
  "config/generated"
  "plugins/lark-docs/meta/snapshots"
  "plugins/lark-docs/meta/assembly"
  "plugins/lark-docs/meta/reports"
)

for restore_path in "${paths[@]}"; do
  source_has_path=false
  if git ls-tree --name-only "${resolved_ref}" -- "${restore_path}" | grep -Fxq "${restore_path}"; then
    source_has_path=true
  fi

  if [ "$exact" = true ]; then
    rm -rf -- "$restore_path"
    if [ "$source_has_path" = true ] || git ls-files --error-unmatch -- "$restore_path" >/dev/null 2>&1; then
      git restore --source="${resolved_ref}" --staged --worktree -- "$restore_path"
    else
      echo "[restore-generated-state] ${restore_path} not found on ${resolved_ref}; skipping"
    fi
  elif [ "$source_has_path" = true ]; then
    git checkout "${resolved_ref}" -- "${restore_path}"
  else
    echo "[restore-generated-state] ${restore_path} not found on ${resolved_ref}; skipping"
  fi
done
