#!/usr/bin/env bash
set -euo pipefail

for group in python java node go cli rest; do
  node scripts/docs-workflow/run-content-group.js --group "$group"
done
