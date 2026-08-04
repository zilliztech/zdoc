# Docs Ingestion Watchdog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 24-hour ingestion watchdog select production runs from validated result artifacts, accept full manual dev recovery runs, repeat alerts while stale, and explicitly finalize every alert card.

**Architecture:** Roll out in two stages. First, fetch-docs.yml emits a strict artifact named from the concrete workflow run ID (`docs-production-result-${runId}`) and a successful full production run establishes an activation point. Second, a hardened artifact adapter and rewritten evaluator qualify runs solely from validated artifact identity plus required-job conclusions; the read-only watchdog uploads a decision artifact and alerts on every unhealthy scan.

**Tech Stack:** Node.js 22, node:test, GitHub Actions REST/artifact APIs, ZIP preflight and safe extraction, Feishu report-card CLI.

---

## File map

- Create scripts/docs-workflow/docs-production-result.js and its test.
- Modify .github/workflows/fetch-docs.yml to create, validate, and upload production evidence.
- Create scripts/docs-workflow/github-artifact-json.js and its test; reuse it from monitor-docs-progress.js.
- Rewrite scripts/docs-workflow/docs-ingestion-watchdog.js and its test.
- Modify .github/workflows/docs-ingestion-watchdog.yml and workflow-policy tests.

## Rollout boundary

Tasks 1-4 are the producer stage. Submit them, complete one full production dev run, validate the artifact, and record the run ID in repository variable DOCS_PRODUCTION_RESULT_ACTIVATION_RUN_ID. Only then execute and submit Tasks 5-10. This prevents the repaired consumer from requiring evidence before the producer has emitted its first qualifying artifact.

### Task 1: Implement the exact production-result schema

**Files:**
- Create: scripts/docs-workflow/docs-production-result.js
- Create: scripts/docs-workflow/docs-production-result.test.js

- [ ] **Step 1: Write failing validator tests**

~~~javascript
const SHA = '0123456789abcdef0123456789abcdef01234567'

function valid(overrides = {}) {
  return {
    schemaVersion: 1,
    runId: 30854402640,
    event: 'schedule',
    selectedGroup: 'all',
    publishEnabled: true,
    targetBranch: 'dev',
    toolingSha: SHA,
    sourceSha: '1'.repeat(40),
    finalDevSha: '2'.repeat(40),
    overallStatus: 'success',
    generatedAt: '2026-08-04T01:00:00.000Z',
    ...overrides,
  }
}

test('validates and freezes exact successful evidence', () => {
  const result = validateProductionResult(valid(), {expectedRunId: 30854402640})
  assert.deepEqual(result, valid())
  assert.equal(Object.isFrozen(result), true)
})

test('allows null finalDevSha only when status is not success', () => {
  assert.equal(validateProductionResult(valid({overallStatus: 'failure', finalDevSha: null})).finalDevSha, null)
  assert.equal(validateProductionResult(valid({overallStatus: 'cancelled', finalDevSha: null})).finalDevSha, null)
  assert.throws(() => validateProductionResult(valid({finalDevSha: null})), /finalDevSha/i)
})
~~~

Add rejection cases for unknown keys, wrong schema, non-positive/mismatched run ID, unsupported event/group/status, string boolean, unsafe branch/control characters, uppercase/short/null required SHAs, and non-canonical timestamp.

- [ ] **Step 2: Run and confirm the module is missing**

Run: node --test scripts/docs-workflow/docs-production-result.test.js

Expected: FAIL with MODULE_NOT_FOUND.

- [ ] **Step 3: Implement exact validation**

~~~javascript
const ROOT_KEYS = Object.freeze([
  'schemaVersion', 'runId', 'event', 'selectedGroup', 'publishEnabled', 'targetBranch',
  'toolingSha', 'sourceSha', 'finalDevSha', 'overallStatus', 'generatedAt',
])
const EVENTS = new Set(['schedule', 'workflow_dispatch'])
const OVERALL_STATUSES = new Set(['success', 'failure', 'cancelled'])
const SHA = /^[0-9a-f]{40}$/
~~~

Supported groups are new Set([...listContentGroups('en'), 'all']). publishEnabled must be a real boolean. Branches are 1-255 single-line characters and must pass git check-ref-format --branch in the producer workflow. generatedAt is canonical only when new Date(value).toISOString() === value.

- [ ] **Step 4: Implement create/read/write and CLI**

Export createProductionResult, validateProductionResult, readProductionResult, and writeProductionResult. Write through a mode-0600 sibling temporary file and rename atomically. Support only:

~~~text
docs-production-result.js create --run-id --event --selected-group --publish-enabled --target-branch --tooling-sha --source-sha --final-dev-sha --overall-status --generated-at --output
docs-production-result.js validate --input --run-id
~~~

Parse only literal true/false; convert an empty final SHA to null; reject duplicate/unknown flags.

- [ ] **Step 5: Add CLI tests, run, and commit**

~~~bash
node --test scripts/docs-workflow/docs-production-result.test.js
git add scripts/docs-workflow/docs-production-result.js scripts/docs-workflow/docs-production-result.test.js
git commit -m "feat: define docs production result artifact"
~~~

### Task 2: Emit validated evidence from fetch-docs.yml

**Files:**
- Modify: .github/workflows/fetch-docs.yml:672-790
- Modify: scripts/validate-workflow-policy.js
- Modify: scripts/validate-workflow-policy.test.js

- [ ] **Step 1: Add a failing producer-contract test**

Assert `resolve_final` runs under `always()` so every successful artifact-only, partial, drill, or production run records the exact final target-branch SHA. Also assert fetch-docs.yml contains an always-running create step, every exact CLI field, validation against GITHUB_RUN_ID, artifact name `docs-production-result-${{ github.run_id }}`, exact file `production-result.json`, `if-no-files-found: error`, and retention 14 days.

- [ ] **Step 2: Run and confirm the artifact is absent**

Run: node --test scripts/validate-workflow-policy.test.js --test-name-pattern="production result"

Expected: FAIL.

- [ ] **Step 3: Make final target SHA collection unconditional**

Change only the `resolve_final` job condition from `always() && publish == 'true'` to `always()`. Keep its exact target-branch fetch and published-commit ancestry checks. When publication jobs are skipped, their expected SHA outputs are empty and the job records the current exact target-branch SHA. Keep `verify` restricted to `publish == 'true'`, so artifact-only runs do not gain final verification work.

- [ ] **Step 4: Add create and validate steps**

~~~yaml
- name: Create production result artifact
  if: ${{ always() }}
  env:
    SELECTED_GROUP: ${{ needs.prepare.outputs.selected_group }}
    PUBLISH_ENABLED: ${{ needs.prepare.outputs.publish }}
    TARGET_BRANCH: ${{ needs.prepare.outputs.target_branch }}
    TOOLING_SHA: ${{ needs.prepare.outputs.tooling_sha }}
    SOURCE_SHA: ${{ needs.prepare.outputs.source_sha }}
    FINAL_DEV_SHA: ${{ needs.resolve_final.outputs.final_dev_sha }}
    OVERALL_STATUS: ${{ steps.aggregate.outputs.overall_status == 'success' && 'success' || 'failure' }}
  run: |
    set -euo pipefail
    git check-ref-format --branch "$TARGET_BRANCH"
    generated_at=$(date -u +'%Y-%m-%dT%H:%M:%S.000Z')
    node scripts/docs-workflow/docs-production-result.js create \
      --run-id "$GITHUB_RUN_ID" --event "$GITHUB_EVENT_NAME" \
      --selected-group "$SELECTED_GROUP" --publish-enabled "$PUBLISH_ENABLED" \
      --target-branch "$TARGET_BRANCH" --tooling-sha "$TOOLING_SHA" \
      --source-sha "$SOURCE_SHA" --final-dev-sha "$FINAL_DEV_SHA" \
      --overall-status "$OVERALL_STATUS" --generated-at "$generated_at" \
      --output tmp/docs-production-result/production-result.json
    node scripts/docs-workflow/docs-production-result.js validate \
      --input tmp/docs-production-result/production-result.json \
      --run-id "$GITHUB_RUN_ID"
~~~

- [ ] **Step 5: Upload required evidence**

~~~yaml
- name: Upload production result artifact
  if: ${{ always() }}
  uses: actions/upload-artifact@v4
  with:
    name: docs-production-result-${{ github.run_id }}
    path: tmp/docs-production-result/production-result.json
    if-no-files-found: error
    retention-days: 14
~~~

Do not use continue-on-error; inability to emit valid terminal evidence must not look like a fully healthy production run.

- [ ] **Step 6: Add policy mutations**

Reject restoring the old publish-only `resolve_final` condition, removal of validation, a different artifact name, `if-no-files-found: warn`, retention below seven days, or a create/upload step without `always()`.

- [ ] **Step 7: Run and commit**

~~~bash
node --test scripts/docs-workflow/docs-production-result.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
git add .github/workflows/fetch-docs.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat: publish docs production result evidence"
~~~

### Task 3: Replay the producer locally with real artifacts

- [ ] **Step 1: Run focused gates**

~~~bash
node --test scripts/docs-workflow/docs-production-result.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
~~~

- [ ] **Step 2: Dispatch one coherent artifact-only run**

~~~bash
IMPLEMENTATION_SHA="$(git rev-parse HEAD)"
gh workflow run fetch-docs.yml --ref master \
  -f group=all -f artifact_retention_days=7 -f target_branch=dev \
  -f publish=false -f run_translations=false \
  -f tooling_ref="$IMPLEMENTATION_SHA" -f source_ref=dev
SOURCE_RUN_ID="$(gh run list --workflow fetch-docs.yml --event workflow_dispatch --limit 20 --json databaseId,headSha --jq ".[]|select(.headSha==\"$IMPLEMENTATION_SHA\")|.databaseId" | head -1)"
gh run watch "$SOURCE_RUN_ID" --exit-status
~~~

- [ ] **Step 3: Download and preflight eight lanes**

~~~bash
REPLAY_ROOT="$(mktemp -d /private/tmp/zdoc-ingestion-watchdog-replay.XXXXXX)"
for suffix in java node go cli rest python guides-en guides-zh-CN; do
  artifact_name="docs-checkpoint-$suffix-$SOURCE_RUN_ID"
  artifact_dir="$REPLAY_ROOT/downloads/$artifact_name"
  mkdir -p "$artifact_dir"
  gh run download "$SOURCE_RUN_ID" --name "$artifact_name" --dir "$artifact_dir"
  node scripts/docs-workflow/preflight-checkpoint-archive.js \
    --archive "$artifact_dir/checkpoint-group.tar" \
    --manifest-output "$artifact_dir/manifest.json"
done
node - "$REPLAY_ROOT/downloads" <<'NODE' > "$REPLAY_ROOT/dev-baseline-sha"
const fs = require('node:fs')
const path = require('node:path')
const root = process.argv[2]
const manifests = fs.readdirSync(root).map(name => JSON.parse(fs.readFileSync(path.join(root, name, 'manifest.json'))))
const baselines = new Set(manifests.map(value => value.devBaselineSha))
if (baselines.size !== 1) throw new Error('checkpoint artifacts have mixed dev baselines')
process.stdout.write([...baselines][0])
NODE
~~~

Expected: every archive passes preflight before extraction and one common baseline is recorded.

- [ ] **Step 4: Replay publication in production order**

~~~bash
BASELINE_SHA="$(cat "$REPLAY_ROOT/dev-baseline-sha")"
git init --bare "$REPLAY_ROOT/remote.git"
git push "$REPLAY_ROOT/remote.git" "$BASELINE_SHA:refs/heads/dev"
git remote add ingestion-replay "$REPLAY_ROOT/remote.git"

for spec in \
  'java|en|docs(java): publish SDK reference' \
  'node|en|docs(node): publish SDK reference' \
  'go|en|docs(go): publish SDK reference' \
  'cli|en|docs(cli): publish CLI reference' \
  'rest|en|docs(rest): publish REST reference' \
  'python|en|docs(python): publish SDK reference' \
  'guides-en|en|docs(guides): publish fetched content' \
  'guides-zh-CN|zh-CN|docs(guides): publish fetched content'; do
  IFS='|' read -r suffix site message <<< "$spec"
  artifact_dir="$REPLAY_ROOT/downloads/docs-checkpoint-$suffix-$SOURCE_RUN_ID"
  extracted_dir="$REPLAY_ROOT/extracted/$suffix"
  mkdir -p "$extracted_dir"
  tar -xf "$artifact_dir/checkpoint-group.tar" -C "$extracted_dir"
  ZDOC_SITE="$site" bash scripts/docs-workflow/publish-checkpoint.sh \
    --artifact "$extracted_dir/checkpoint-group" \
    --branch dev \
    --message "$message" \
    --max-attempts 1 \
    --remote ingestion-replay \
    --validate-command "node scripts/validate-generated-sidebars.js --site $site" \
    | tee "$REPLAY_ROOT/$suffix-publication.txt"
  grep -Eq '^status=(published|no_changes)$' "$REPLAY_ROOT/$suffix-publication.txt"
done

SELECTED_GROUP=all \
GUIDES_RESULT=success GUIDES_STATUS="$(sed -n 's/^status=//p' "$REPLAY_ROOT/guides-en-publication.txt" | tail -1)" \
PYTHON_RESULT=success PYTHON_STATUS="$(sed -n 's/^status=//p' "$REPLAY_ROOT/python-publication.txt" | tail -1)" \
JAVA_RESULT=success JAVA_STATUS="$(sed -n 's/^status=//p' "$REPLAY_ROOT/java-publication.txt" | tail -1)" \
NODE_RESULT=success NODE_STATUS="$(sed -n 's/^status=//p' "$REPLAY_ROOT/node-publication.txt" | tail -1)" \
GO_RESULT=success GO_STATUS="$(sed -n 's/^status=//p' "$REPLAY_ROOT/go-publication.txt" | tail -1)" \
CLI_RESULT=success CLI_STATUS="$(sed -n 's/^status=//p' "$REPLAY_ROOT/cli-publication.txt" | tail -1)" \
REST_RESULT=success REST_STATUS="$(sed -n 's/^status=//p' "$REPLAY_ROOT/rest-publication.txt" | tail -1)" \
node scripts/docs-workflow/source-publication-barrier.js
grep -Eq '^status=(published|no_changes)$' "$REPLAY_ROOT/guides-zh-CN-publication.txt"
LOCAL_FINAL_SHA="$(git --git-dir="$REPLAY_ROOT/remote.git" rev-parse refs/heads/dev)"
git remote remove ingestion-replay
~~~

- [ ] **Step 5: Run final replay validation**

~~~bash
bash scripts/restore-generated-state.sh --exact --ref "$LOCAL_FINAL_SHA"
pnpm check:localization-input-inventory
pnpm docs-tooling validate-revision-inventory --site en
~~~

Replay card collection with isolated en and zh-CN directories; require exactly nine notes and no Unavailable section. Preserve run/artifact IDs, common baseline, replay root, lane logs, final SHA, validation logs, and card JSON.

### Task 4: Deploy producer stage and establish activation

- [ ] **Step 1: Submit only Tasks 1-3**

The producer-stage change must not yet replace .github/workflows/docs-ingestion-watchdog.yml.

- [ ] **Step 2: Dispatch full production after merge**

~~~bash
MASTER_SHA="$(gh api repos/zilliztech/zdoc/git/ref/heads/master --jq .object.sha)"
DEV_SHA="$(gh api repos/zilliztech/zdoc/git/ref/heads/dev --jq .object.sha)"
gh workflow run fetch-docs.yml --ref master \
  -f group=all -f artifact_retention_days=14 -f target_branch=dev \
  -f publish=true -f run_translations=false \
  -f tooling_ref="$MASTER_SHA" -f source_ref="$DEV_SHA"
BOOTSTRAP_RUN_ID="$(gh run list --workflow fetch-docs.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId')"
gh run watch "$BOOTSTRAP_RUN_ID" --exit-status
~~~

Live-monitor all producers, serialized publishers, resolve_final, verify / verify, aggregate, production-result upload, and Build card finalization.

- [ ] **Step 3: Validate the exact artifact**

~~~bash
BOOTSTRAP_ROOT="$(mktemp -d /private/tmp/zdoc-production-result-bootstrap.XXXXXX)"
gh run download "$BOOTSTRAP_RUN_ID" --name "docs-production-result-$BOOTSTRAP_RUN_ID" --dir "$BOOTSTRAP_ROOT"
node scripts/docs-workflow/docs-production-result.js validate --input "$BOOTSTRAP_ROOT/production-result.json" --run-id "$BOOTSTRAP_RUN_ID"
node -e "const r=require(process.argv[1]);if(r.selectedGroup!=='all'||r.publishEnabled!==true||r.targetBranch!=='dev'||r.overallStatus!=='success'||!/^[0-9a-f]{40}$/.test(r.finalDevSha))throw new Error('not qualifying');console.log(r.finalDevSha)" "$BOOTSTRAP_ROOT/production-result.json"
~~~

- [ ] **Step 4: Record activation**

~~~bash
gh variable set DOCS_PRODUCTION_RESULT_ACTIVATION_RUN_ID --repo zilliztech/zdoc --body "$BOOTSTRAP_RUN_ID"
test "$(gh variable get DOCS_PRODUCTION_RESULT_ACTIVATION_RUN_ID --repo zilliztech/zdoc)" = "$BOOTSTRAP_RUN_ID"
~~~

Stop before consumer enablement if any producer, artifact, final SHA, or card-finalization check fails.

### Task 5: Extract a hardened JSON artifact adapter

**Files:**
- Create: scripts/docs-workflow/github-artifact-json.js
- Create: scripts/docs-workflow/github-artifact-json.test.js
- Modify: scripts/docs-workflow/monitor-docs-progress.js and its test

- [ ] **Step 1: Write failing archive tests**

~~~javascript
test('archive validation rejects unsafe and duplicate entries', () => {
  for (const entries of [
    ['../production-result.json'], ['/production-result.json'],
    ['dir\\production-result.json'],
    ['production-result.json', 'production-result.json'],
  ]) assert.throws(() => validateArchiveEntries(entries), /unsafe|duplicate/i)
})
~~~

Add tests for zero and multiple live exact-name artifacts, expired-only matches, pagination, symlink after extraction, duplicate expected basenames, unexpected filename, cleanup after success/failure, bounded 429/5xx retries, and non-retryable 4xx failure.

- [ ] **Step 2: Run and confirm the module is missing**

Run: node --test scripts/docs-workflow/github-artifact-json.test.js

Expected: FAIL with MODULE_NOT_FOUND.

- [ ] **Step 3: Implement the helper**

Export validateArchiveEntries, assertSafeExtraction, findExactFile, and createGitHubArtifactJsonClient. Its download({runId, artifactName, fileName, validate}) method must resolve exactly one live artifact, download to a fresh directory, preflight before unzip, reject extracted symlinks, require exactly one expected basename, validate JSON, return {artifactId, artifactUrl, value}, and clean up in finally.

Construct the artifact URL exactly as `https://github.com/${repository}/actions/runs/${runId}/artifacts/${artifact.id}`.

- [ ] **Step 4: Reuse it from the progress monitor**

Move duplicate archive helpers out of monitor-docs-progress.js; preserve public download behavior with downloaded?.value ?? null. Move helper tests to the new test file and keep progress-monitor regressions green.

- [ ] **Step 5: Run and commit**

~~~bash
node --test scripts/docs-workflow/github-artifact-json.test.js scripts/docs-workflow/monitor-docs-progress.test.js
git add scripts/docs-workflow/github-artifact-json.js scripts/docs-workflow/github-artifact-json.test.js scripts/docs-workflow/monitor-docs-progress.js scripts/docs-workflow/monitor-docs-progress.test.js
git commit -m "refactor: share hardened GitHub artifact downloads"
~~~

### Task 6: Rewrite production qualification and freshness

**Files:**
- Modify: scripts/docs-workflow/docs-ingestion-watchdog.js:1-184
- Modify: scripts/docs-workflow/docs-ingestion-watchdog.test.js

- [ ] **Step 1: Replace run-input fixtures with artifact fixtures**

~~~javascript
function productionResult(overrides = {}) {
  return {
    schemaVersion: 1, runId: 42, event: 'schedule', selectedGroup: 'all',
    publishEnabled: true, targetBranch: 'dev', toolingSha: 'a'.repeat(40),
    sourceSha: 'b'.repeat(40), finalDevSha: 'c'.repeat(40),
    overallStatus: 'success', generatedAt: '2026-08-04T03:00:00.000Z',
    ...overrides,
  }
}

function evidence(value = productionResult(), overrides = {}) {
  return {
    artifactId: 9001,
    artifactUrl: 'https://github.com/acme/docs/actions/runs/42/artifacts/9001',
    value,
    ...overrides,
  }
}
~~~

Test scheduled/manual parity, newer manual full-dev recovery, partial/artifact-only/drill/alternate-branch/failed/cancelled exclusion, all three required jobs, newest completion selection, exactly 24 hours healthy, 24 hours plus 1ms stale, final/tooling/source SHA provenance, missing vs invalid artifacts, and API failure not becoming production staleness.

- [ ] **Step 2: Run and confirm API-input logic fails**

Run: node --test scripts/docs-workflow/docs-ingestion-watchdog.test.js

Expected: FAIL because the current evaluator reads detailsByRunId.inputs and never consumes artifacts.

- [ ] **Step 3: Implement stable reason codes**

~~~javascript
const REASONS = Object.freeze({
  healthy: 'qualifying production ingestion completed within 24 hours',
  no_qualifying_success: 'no qualifying successful production result was found',
  success_too_old: 'the newest qualifying production result is older than 24 hours',
  required_job_missing: 'qualifying evidence is missing a required successful job',
  required_job_failed: 'qualifying evidence disagrees with a required job conclusion',
  result_artifact_missing: 'a completed scheduled run is missing its required result artifact',
  result_artifact_invalid: 'a production result artifact failed validation',
  github_api_failure: 'the watchdog could not inspect GitHub workflow evidence',
})
~~~

qualifiesProduction requires group all, boolean publish true, branch dev, overall success, and valid final SHA. Remove isProductionRun, detailsByRunId, reportsByRunId, and card-report final-SHA fallback.

- [ ] **Step 4: Emit the decision contract**

The JSON contains schema_version, ok, reason_code, reason, evaluated_at, run ID/URL, completion time, final/tooling/source SHAs, and evidence artifact ID/URL. Add `validateWatchdogDecision` with exact keys, reason-code enum, canonical timestamp, nullable URL/SHA/artifact fields, and consistency checks (`ok` is true only for `healthy`). Validate immediately before the mode-0600 write. Add tests for unknown keys, invalid reason/status combinations, and malformed SHAs/URLs. GitHub outputs use ok, reason_code, reason, run_url, last_successful_at, final_dev_sha, tooling_sha, source_sha, and evidence_artifact_url, with existing control/newline stripping.

- [ ] **Step 5: Run and commit**

~~~bash
node --test scripts/docs-workflow/docs-ingestion-watchdog.test.js
git add scripts/docs-workflow/docs-ingestion-watchdog.js scripts/docs-workflow/docs-ingestion-watchdog.test.js
git commit -m "feat: qualify ingestion from production artifacts"
~~~

### Task 7: Download bounded recent evidence

**Files:**
- Modify: scripts/docs-workflow/docs-ingestion-watchdog.js
- Modify: scripts/docs-workflow/docs-ingestion-watchdog.test.js

- [ ] **Step 1: Add failing adapter tests**

Require at most two `per_page=100` completed-run pages and at most 100 retained runs. For each retained `run`, list jobs and download artifact ``docs-production-result-${run.id}`` with exact file `production-result.json`. Assert no request is made to the run-detail endpoint for inputs.

Test: scheduled run at/after activation with no artifact => result_artifact_missing; pre-activation missing evidence is ignored; malformed artifact => result_artifact_invalid; API/download/ZIP errors => github_api_failure.

- [ ] **Step 2: Run and confirm old adapter calls run details**

Run: node --test scripts/docs-workflow/docs-ingestion-watchdog.test.js

Expected: FAIL.

- [ ] **Step 3: Implement bounded inspection**

createGitHubAdapter requires activationRunId and returns runs, jobsByRunId, resultsByRunId, artifactErrorsByRunId, and missingScheduledResultRunIds. Use createGitHubArtifactJsonClient for every artifact. Transport/archive failures throw; schema errors remain attached to their run so the evaluator emits result_artifact_invalid.

- [ ] **Step 4: Require activation on CLI**

Support only:

~~~text
docs-ingestion-watchdog.js --repository owner/repo --activation-run-id positive-integer --output safe/repository/path.json
~~~

Reject missing, duplicate, zero, and non-integer activation values.

- [ ] **Step 5: Run and commit**

~~~bash
node --test scripts/docs-workflow/github-artifact-json.test.js scripts/docs-workflow/docs-production-result.test.js scripts/docs-workflow/docs-ingestion-watchdog.test.js
git add scripts/docs-workflow/docs-ingestion-watchdog.js scripts/docs-workflow/docs-ingestion-watchdog.test.js
git commit -m "feat: inspect bounded ingestion evidence"
~~~

### Task 8: Repair workflow alerting and card finalization

**Files:**
- Modify: .github/workflows/docs-ingestion-watchdog.yml:1-99
- Modify: scripts/validate-workflow-policy.js:1129-1147
- Modify: scripts/validate-workflow-policy.test.js:55-86

- [ ] **Step 1: Add failing workflow assertions**

Require non-cancelling concurrency, repository activation variable, --activation-run-id, alert condition steps.watchdog.outputs.ok != 'true', evidence URL in the note, explicit message ID/start/stages/title on finish, no dispatch/publish/cache/suppression operations, and preservation of evaluator failure.

- [ ] **Step 2: Run and verify current finalization fails**

Run: node --test scripts/validate-workflow-policy.test.js --test-name-pattern="ingestion watchdog"

Expected: FAIL because current finish is only --status fail.

- [ ] **Step 3: Add concurrency and activation**

~~~yaml
concurrency:
  group: docs-ingestion-watchdog
  cancel-in-progress: false
~~~

Pass vars.DOCS_PRODUCTION_RESULT_ACTIVATION_RUN_ID as ACTIVATION_RUN_ID and call the evaluator with --activation-run-id "$ACTIVATION_RUN_ID".

- [ ] **Step 4: Drive alerts from the decision**

Use steps.watchdog.outputs.ok != 'true' for create/note/finish. The note includes stable reason code/detail, last completion, production run URL, final/tooling/source SHAs, evidence artifact URL, and watchdog run URL. Healthy scans create no card.

Keep `Upload watchdog result` under `always() && !cancelled()`, with exact artifact name `docs-ingestion-watchdog-${{ github.run_id }}`, exact validated JSON path, `if-no-files-found: error`, and 14-day retention. This upload occurs for healthy, stale, required-job disagreement, missing/invalid evidence, and bounded API failures.

- [ ] **Step 5: Explicitly finish the card**

~~~bash
pnpm docs-tooling report-card finish \
  --message-id "$CARD_ID" \
  --status fail \
  --started-at "$CARD_STARTED_AT" \
  --stages "$CARD_STAGES" \
  --title "$CARD_TITLE"
~~~

Populate all values from alert_card outputs. Keep Feishu steps best effort. Keep the final preserve step authoritative: evaluator failure exits 1 even when Feishu fails.

- [ ] **Step 6: Add policy mutations**

Reject cancel-in-progress true, missing activation, missing message ID, alerting from step outcome instead of ok, writable permissions, gh workflow run, or removal of the final preserve step.

- [ ] **Step 7: Run and commit**

~~~bash
node --test scripts/docs-workflow/docs-ingestion-watchdog.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
git add .github/workflows/docs-ingestion-watchdog.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "fix: finalize repeated ingestion watchdog alerts"
~~~

### Task 9: Run full pre-submission validation

- [ ] **Step 1: Run targeted suites**

~~~bash
node --test \
  scripts/docs-workflow/docs-production-result.test.js \
  scripts/docs-workflow/github-artifact-json.test.js \
  scripts/docs-workflow/monitor-docs-progress.test.js \
  scripts/docs-workflow/docs-ingestion-watchdog.test.js \
  scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
pnpm typecheck
git diff --check
~~~

- [ ] **Step 2: Prove scheduled/manual equivalence**

Run the watchdog tests with --test-name-pattern="scheduled and manual|manual full dev recovery". Both event types must use identical artifact qualification and no run-detail inputs.

- [ ] **Step 3: Repeat the complete real-artifact replay**

Repeat Task 3 after the shared adapter and consumer changes. Require all eight lanes, Chinese ZDOC_SITE=zh-CN, source barrier, exact final restore, localization/revision validation, and exactly nine card notes with no Unavailable section.

- [ ] **Step 4: Verify repository hygiene**

~~~bash
git status --short
git diff --name-only origin/master...HEAD
~~~

Expected: only planned files; unrelated user-owned .claude files remain unstaged and unmodified.

### Task 10: Enable and verify the consumer online

- [ ] **Step 1: Confirm activation**

~~~bash
ACTIVATION_RUN_ID="$(gh variable get DOCS_PRODUCTION_RESULT_ACTIVATION_RUN_ID --repo zilliztech/zdoc)"
test "$ACTIVATION_RUN_ID" -gt 0
gh run view "$ACTIVATION_RUN_ID" --repo zilliztech/zdoc --json conclusion,url
~~~

- [ ] **Step 2: Submit consumer-stage commits**

Use normal review/merge flow. Do not change publication schedules, groups, translation behavior, or final-verification criteria.

- [ ] **Step 3: Dispatch and monitor a healthy scan**

~~~bash
gh workflow run docs-ingestion-watchdog.yml --ref master
WATCHDOG_RUN_ID="$(gh run list --workflow docs-ingestion-watchdog.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId')"
gh run watch "$WATCHDOG_RUN_ID" --exit-status
gh run download "$WATCHDOG_RUN_ID" --name "docs-ingestion-watchdog-$WATCHDOG_RUN_ID" --dir "/private/tmp/docs-ingestion-watchdog-$WATCHDOG_RUN_ID"
~~~

Validate decision JSON: ok=true, reason_code=healthy, qualifying run ID is at least activation, final SHA is valid, and artifact ID/URL match the selected production result. Healthy scan sends no card.

- [ ] **Step 4: Prove stale and repeated-alert behavior**

Use the injected-time stale fixture twice. Each evaluation returns success_too_old, uploads a decision artifact, creates and explicitly finishes one card, and fails the workflow. The second evaluation creates a second card because no acknowledgement, cache, or suppression state exists. Feishu failure does not replace the authoritative failure conclusion.

- [ ] **Step 5: Observe the next schedule**

At 0 21 * * *, stale state must alert and fail again; after a qualifying full production recovery, the next scan must succeed and send no card.

- [ ] **Step 6: Self-review**

~~~bash
rg -n "TBD|TODO|implement later|similar to|appropriate error handling|detailsByRunId|reportsByRunId" \
  .claude/plans/2026-08-04-docs-ingestion-watchdog-implementation.md \
  scripts/docs-workflow/docs-ingestion-watchdog.js \
  scripts/docs-workflow/docs-ingestion-watchdog.test.js
~~~

Expected: only this self-review command and explicit removal assertions match; all reason codes, property names, CLI flags, artifact names, and SHA fields are consistent across tasks.
