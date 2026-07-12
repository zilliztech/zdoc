#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [branch] | --ref <git-ref-or-sha>" >&2
}

target_branch="dev"
target_ref=""

case "$#" in
  0)
    ;;
  1)
    if [ "$1" = "--ref" ] || [ -z "$1" ] || [[ "$1" == -* ]]; then
      usage
      exit 2
    fi
    target_branch="$1"
    ;;
  2)
    if [ "$1" != "--ref" ] || [ -z "$2" ]; then
      usage
      exit 2
    fi
    target_ref="$2"
    ;;
  *)
    usage
    exit 2
    ;;
esac

if [[ "${target_branch}${target_ref}" == *$'\n'* || "${target_branch}${target_ref}" == *$'\r'* ]]; then
  echo "[restore-generated-state] branch and ref values must not contain newlines" >&2
  usage
  exit 2
fi

if [ -n "${target_ref}" ]; then
  git fetch --depth=1 origin -- "${target_ref}"
  resolved_ref="FETCH_HEAD"
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
)

for restore_path in "${paths[@]}"; do
  if git ls-tree --name-only "${resolved_ref}" -- "${restore_path}" | grep -Fxq "${restore_path}"; then
    git checkout "${resolved_ref}" -- "${restore_path}"
  else
    echo "[restore-generated-state] ${restore_path} not found on ${resolved_ref}; skipping"
  fi
done
