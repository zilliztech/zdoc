#!/bin/sh
# Authenticate the single local-only OpenDirectory profile before the ordinary-user B2 capture.
set -eu
umask 077
evidence=$(/usr/bin/mktemp -d "$RUNNER_TEMP/b4-profile.XXXXXXXX")
receipt="$evidence/profile.json"
printf 'evidence=%s\n' "$receipt" >> "$GITHUB_OUTPUT"
printf '%s\n' '{"schemaVersion":1,"result":"bootstrap-held","modeChanged":null,"productionQualified":false}' > "$receipt"
test "$HOSTED_RUNNER_ENVIRONMENT" = github-hosted
test "$RUNNER_OS" = macOS
test "$RUNNER_ARCH" = ARM64
test "$(/usr/bin/uname -m)" = arm64
test "$(/usr/bin/id -u)" = 501
case "$(/usr/bin/sw_vers -productVersion)" in 15.*) ;; *) exit 1 ;; esac
exec 3<"$GITHUB_WORKSPACE/scripts/docs-workflow/shared-guides-update/provision-profile"
test -f /dev/fd/3
cd /
if /usr/bin/sudo -n /usr/bin/env -i PATH=/usr/bin:/bin HOME=/var/root OPENSSL_CONF=/dev/null /bin/sh -ec '
  umask 077
  test ! -L /private/tmp
  test -k /private/tmp
  test "$(/usr/bin/stat -f "%u:%g:%Lp" /private/tmp)" = 0:0:777
  stage=$(/usr/bin/mktemp -d /private/tmp/b4-profile.XXXXXXXX)
  cleanup() { /bin/rm -f "$stage/helper"; /bin/rmdir "$stage"; }
  trap cleanup EXIT
  /usr/bin/head -c 65536 > "$stage/helper"
  actual=$(/usr/bin/openssl dgst -sha256 -r "$stage/helper")
  test "${actual%% *}" = ea2bfc8dbc770ae8198fd553939e8b04ea67f9f9dbd5fbdb9ab0df363d2fbe56
  /bin/chmod 0500 "$stage/helper"
  "$stage/helper" </dev/null
' <&3 > "$evidence/output" 2>/dev/null; then result=0; else result=1; fi
if test -s "$evidence/output" && /usr/bin/jq -e '.schemaVersion == 1 and .productionQualified == false and (.result|type == "string")' "$evidence/output" >/dev/null 2>&1; then
  /bin/mv "$evidence/output" "$receipt"
else
  result=1
fi
digest=$(/usr/bin/openssl dgst -sha256 -r "$receipt")
printf 'sha256=%s\n' "${digest%% *}" >> "$GITHUB_OUTPUT"
exit "$result"
