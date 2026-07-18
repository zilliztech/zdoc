#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf '%s\n' "Usage: $0 --repository PATH --target-branch BRANCH --run-id ID --run-attempt N --recovery-attempt N --pending-set-sha256 SHA256 --staged-sha SHA --expected-target-sha SHA --source-checkpoint-sha SHA --master-sha SHA --trusted-root PATH --pairs-manifest PATH_OR_none" >&2
}

if (( $# != 24 )); then usage; exit 2; fi

exec node "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)/recover-guides-translation.js" "$@"
