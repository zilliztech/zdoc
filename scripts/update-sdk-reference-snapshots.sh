#!/usr/bin/env bash
set -euo pipefail

common_args=(
  --targets-built zilliz
  --build-env uat
  --source-branch "${DOCS_SOURCE_BRANCH:-dev}"
  --publish-url https://docs.cloud-uat3.zilliz.com
  --link-check-remote https://docs.zilliz.com
)

groups=(python java node go cli)
if (( $# > 1 )); then
  echo "Usage: $0 [python|java|node|go|cli]" >&2
  exit 1
fi
if (( $# == 1 )); then
  groups=("$1")
fi

for group in "${groups[@]}"; do
  manual="$(node -e 'const { getContentGroup } = require("./scripts/docs-workflow/content-groups.js"); const group = getContentGroup(process.argv[1]); if (!group.snapshotManual || process.argv[1] === "guides") throw new Error(`Content group ${process.argv[1]} has no SDK Lark snapshot`); process.stdout.write(group.snapshotManual)' "$group")"
  node scripts/update-lark-doc-snapshot.js --manual "$manual" "${common_args[@]}"
done
