#!/usr/bin/env bash
set -euo pipefail

[[ -n "${CARD_ID:-}" ]] || exit 0
target_branch="${CARD_TARGET_BRANCH:-}"
if [[ -z "$target_branch" && -n "${GITHUB_EVENT_PATH:-}" && -f "$GITHUB_EVENT_PATH" ]]; then
  target_branch=$(node -e 'const e=require(process.argv[1]); process.stdout.write(String(e.inputs?.target_branch || ""))' "$GITHUB_EVENT_PATH")
fi
target_branch="${target_branch:-dev}"
if [[ "${CARD_MODE:-ordered}" == ordered ]]; then
  npx docusaurus report-to-lark --card-phase --message-id "$CARD_ID" --title "$CARD_TITLE" --started-at "$CARD_STARTED_AT" --stages "$CARD_STAGES" --stage "$CARD_PHASE" --status "$CARD_STATUS" --note "$CARD_NOTE" --target-branch "$target_branch"
  exit 0
fi

if [[ "$SELECTED_GROUP" == all ]]; then
  groups_json='["guides","python","java","node","go","cli","rest"]'
else
  groups_json=$(node -e 'process.stdout.write(JSON.stringify([process.argv[1]]))' "$SELECTED_GROUP")
fi
jobs_file="$RUNNER_TEMP/docs-workflow-jobs.json"
state_file="$RUNNER_TEMP/docs-card-state.json"
no_change_groups_json='[]'
if [[ -n "${CARD_NO_CHANGES_GROUP:-}" ]]; then
  no_change_groups_json=$(node -e 'process.stdout.write(JSON.stringify([process.argv[1]]))' "$CARD_NO_CHANGES_GROUP")
fi
gh api --paginate --slurp "repos/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID/jobs?per_page=100" > "$jobs_file"
node scripts/docs-workflow/build-live-card-state.js \
  --groups-json "$groups_json" \
  --jobs-file "$jobs_file" \
  --publish "$PUBLISH_ENABLED" \
  --override-job "$CARD_JOB_NAME" \
  --override-conclusion "$CARD_JOB_CONCLUSION" \
  --no-change-groups-json "$no_change_groups_json" \
  --notes-json "${CARD_NOTES_JSON:-[]}" \
  --output "$state_file"
npx docusaurus report-to-lark --card-state-file "$state_file" --message-id "$CARD_ID" --title "$CARD_TITLE" --started-at "$CARD_STARTED_AT" --target-branch "$target_branch"
