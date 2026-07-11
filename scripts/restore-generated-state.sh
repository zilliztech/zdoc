#!/usr/bin/env bash
set -euo pipefail

target_branch="${1:-dev}"

if [ -z "${target_branch}" ]; then
  target_branch="dev"
fi

git fetch origin "${target_branch}" --depth=1

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
  if git ls-tree --name-only "origin/${target_branch}" -- "${restore_path}" | grep -Fxq "${restore_path}"; then
    git checkout "origin/${target_branch}" -- "${restore_path}"
  else
    echo "[restore-generated-state] ${restore_path} not found on origin/${target_branch}; skipping"
  fi
done
