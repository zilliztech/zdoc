#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --run-id ID --batch-count N --branch BRANCH [--repository OWNER/REPO]" >&2
}

run_id= batch_count= branch= repository=${GITHUB_REPOSITORY:-zilliztech/zdoc}
while (($#)); do
  case "$1" in
    --run-id) [[ $# -ge 2 ]] || { usage; exit 2; }; run_id=$2; shift 2 ;;
    --batch-count) [[ $# -ge 2 ]] || { usage; exit 2; }; batch_count=$2; shift 2 ;;
    --branch) [[ $# -ge 2 ]] || { usage; exit 2; }; branch=$2; shift 2 ;;
    --repository) [[ $# -ge 2 ]] || { usage; exit 2; }; repository=$2; shift 2 ;;
    --help) usage; exit 0 ;;
    *) usage; exit 2 ;;
  esac
done

[[ "$run_id" =~ ^[1-9][0-9]*$ ]] || { echo "run ID must be a positive integer" >&2; exit 2; }
[[ "$batch_count" =~ ^[1-9][0-9]*$ ]] && ((batch_count <= 100)) || { echo "batch count must be from 1 to 100" >&2; exit 2; }
git check-ref-format --branch "$branch" >/dev/null
[[ "$repository" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || { echo "invalid repository" >&2; exit 2; }

run_json=$(gh api "repos/$repository/actions/runs/$run_id")
master_sha=$(node -e 'const r=JSON.parse(process.argv[1]); if(!/^[0-9a-f]{40}$/.test(r.head_sha)) process.exit(1); process.stdout.write(r.head_sha)' "$run_json")
scratch=$(mktemp -d "${TMPDIR:-/tmp}/recover-translation-batches.XXXXXX")
trap 'rm -rf "$scratch"' EXIT INT TERM

extract_archive() {
  local archive=$1 destination=$2 listing=$3
  tar -tf "$archive" > "$listing"
  ARCHIVE_LISTING=$listing node - <<'NODE'
  const fs = require('node:fs')
  const entries = fs.readFileSync(process.env.ARCHIVE_LISTING, 'utf8').split('\n').filter(Boolean)
  if (!entries.length) throw new Error('checkpoint archive is empty')
  for (const entry of entries) {
    const name = entry.endsWith('/') ? entry.slice(0, -1) : entry
    if (!name || name.startsWith('/') || name.split('/').some(part => part === '' || part === '..')) throw new Error(`unsafe archive path: ${entry}`)
    if (name !== 'checkpoint-group' && !name.startsWith('checkpoint-group/')) throw new Error(`unexpected archive root: ${entry}`)
  }
NODE
  mkdir -p "$destination"
  tar -xf "$archive" -C "$destination"
}

for ((batch=1; batch<=batch_count; batch++)); do
  batch_dir="$scratch/batch-$batch"
  checkpoint_download="$batch_dir/checkpoint-download"
  baseline_download="$batch_dir/baseline-download"
  checkpoint_extract="$batch_dir/checkpoint"
  baseline_extract="$batch_dir/baseline"
  checkpoint_name="translation-checkpoint-guides-$run_id-batch-$batch"
  baseline_name="translation-baseline-guides-$run_id-batch-$batch"
  mkdir -p "$checkpoint_download" "$baseline_download"

  echo "Recovering batch $batch of $batch_count"
  gh run download "$run_id" --repo "$repository" --name "$checkpoint_name" --dir "$checkpoint_download"
  gh run download "$run_id" --repo "$repository" --name "$baseline_name" --dir "$baseline_download"
  extract_archive "$checkpoint_download/checkpoint-group.tar" "$checkpoint_extract" "$batch_dir/checkpoint-paths.txt"
  extract_archive "$baseline_download/checkpoint-group.tar" "$baseline_extract" "$batch_dir/baseline-paths.txt"

  node scripts/docs-workflow/validate-checkpoint-artifact.js --artifact "$checkpoint_extract/checkpoint-group" --group guides --master-sha "$master_sha"
  node scripts/docs-workflow/validate-checkpoint-artifact.js --artifact "$baseline_extract/checkpoint-group" --group guides --master-sha "$master_sha"
  ARTIFACT="$checkpoint_extract/checkpoint-group" BATCH_NUMBER=$batch BATCH_COUNT=$batch_count node - <<'NODE'
  const { validateCheckpointArtifact } = require('./scripts/docs-workflow/validate-checkpoint-artifact')
  validateCheckpointArtifact(process.env.ARTIFACT).then(manifest => {
    if (manifest.batch?.batchNumber !== Number(process.env.BATCH_NUMBER) || manifest.batch?.batchCount !== Number(process.env.BATCH_COUNT)) {
      throw new Error('checkpoint batch identity mismatch')
    }
  }).catch(error => { console.error(error.message); process.exit(1) })
NODE

  bash scripts/docs-workflow/publish-checkpoint.sh \
    --artifact "$checkpoint_extract/checkpoint-group" \
    --baseline-dir "$baseline_extract/checkpoint-group/payload" \
    --branch "$branch" \
    --message "i18n(guides): publish batch $batch of $batch_count" \
    --max-attempts 3 \
    --validate-command "pnpm run build"
  rm -rf "$batch_dir"
done
