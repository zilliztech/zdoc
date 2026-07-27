#!/usr/bin/env bash
set -euo pipefail

for group in python java node go cli rest; do
  pnpm docs-tooling publish-group --site en --group "$group" --stage fetch
  pnpm docs-tooling publish-group --site en --group "$group" --stage validate
  pnpm docs-tooling publish-group --site en --group "$group" --stage publish
done
