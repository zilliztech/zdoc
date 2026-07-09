#!/usr/bin/env bash
set -euo pipefail

common_args=(
  --targets-built zilliz
  --build-env uat
  --source-branch dev
  --publish-url https://docs.cloud-uat3.zilliz.com
  --link-check-remote https://docs.zilliz.com
)

node scripts/update-lark-doc-snapshot.js --manual pymilvus30 "${common_args[@]}"
node scripts/update-lark-doc-snapshot.js --manual javaV230 "${common_args[@]}"
node scripts/update-lark-doc-snapshot.js --manual nodejs30 "${common_args[@]}"
node scripts/update-lark-doc-snapshot.js --manual gov230 "${common_args[@]}"
node scripts/update-lark-doc-snapshot.js --manual cliv14 "${common_args[@]}"
