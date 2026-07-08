#!/usr/bin/env bash
set -euo pipefail

target_branch="${1:-dev}"

if [ -z "${target_branch}" ]; then
  target_branch="dev"
fi

git fetch origin "${target_branch}" --depth=1

paths=(
  "plugins/lark-docs/meta/snapshots"
)

for path in "${paths[@]}"; do
  if git ls-tree -r --name-only "origin/${target_branch}" -- "${path}" | grep -q .; then
    git checkout "origin/${target_branch}" -- "${path}"
  else
    echo "[restore-generated-state] ${path} not found on origin/${target_branch}; skipping"
  fi
done
