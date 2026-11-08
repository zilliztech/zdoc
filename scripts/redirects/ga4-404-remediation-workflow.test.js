'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const workflowPath = '.github/workflows/ga4-404-remediation.yml'
const source = fs.readFileSync(workflowPath, 'utf8')
const workflow = yaml.load(source)
const jobs = workflow.jobs
const remediation = jobs.remediation
const applyReply = jobs.apply_reply

function stepNamed(job, name) {
  return job.steps.find(step => step.name === name)
}

test('the workflow classifies on schedule and dispatch, and reacts to PR comments', () => {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['issue_comment', 'schedule', 'workflow_dispatch'])
  assert.equal(workflow.on.schedule[0].cron, '19 3 * * *')
  assert.deepEqual(workflow.on.issue_comment, {types: ['created']})
  assert.deepEqual(workflow.on.workflow_dispatch.inputs.days.default, '7')
  // The PAT carries every write capability; the workflow token stays read-only.
  assert.deepEqual(workflow.permissions, {contents: 'read'})
  assert.deepEqual(workflow.concurrency, {
    group: 'ga4-404-remediation',
    'cancel-in-progress': false,
  })
  assert.deepEqual(Object.keys(jobs).sort(), ['apply_reply', 'remediation'])
  assert.equal(remediation['timeout-minutes'], 20)
  assert.equal(applyReply['timeout-minutes'], 10)
  // The executor only wakes for PR comments, never for plain issue comments.
  assert.equal(applyReply.if, "github.event_name == 'issue_comment' && github.event.issue.pull_request != null")
})

test('the classification job consumes the tracked ledger and degrades without credentials', () => {
  const credentials = stepNamed(remediation, 'Resolve GA4 credentials')
  assert.equal(credentials.env.GA4_SERVICE_ACCOUNT_JSON, '${{ secrets.GA4_SERVICE_ACCOUNT_JSON }}')
  assert.match(credentials.run, /::notice::GA4 404 remediation is not configured/)

  const run = stepNamed(remediation, 'Run GA4 404 remediation')
  assert.match(run.run, /--ledger scripts\/redirects\/ga4-404-remediation-ledger\.json/)
  assert.match(run.run, /--output-dir tmp\/ga4-404-remediation/)
  // The tool is zero-dependency: no pnpm install in the classification path,
  // and setup-node must not reach for the repo-root pnpm-lock.yaml either.
  assert.doesNotMatch(source, /pnpm install/)
  assert.doesNotMatch(source, /pnpm\/action-setup/)
  for (const step of [...remediation.steps, ...applyReply.steps]) {
    if (step.uses?.startsWith('actions/setup-node@')) {
      assert.equal(step.with['package-manager-cache'], false, `${step.name} must disable the package-manager cache`)
    }
  }

  for (const name of ['Run GA4 404 remediation', 'Append proposal summary', 'Upload remediation artifacts', 'Publish remediation pull request']) {
    assert.equal(stepNamed(remediation, name).if, "${{ steps.credentials.outputs.has_credentials == 'true' }}", `${name} must be gated on credentials`)
  }
})

test('the publish step opens exactly one labeled PR per batch through apply mode', () => {
  const publish = stepNamed(remediation, 'Publish remediation pull request')
  // Gate order: rules exist, no open remediation PR, then the fail-closed PAT gate.
  const script = publish.run
  const indexOf = needle => script.indexOf(needle)
  assert.ok(indexOf('No deterministic rules in this window') < indexOf('An open ga4-404-remediation PR already exists'), 'rule-count gate precedes the open-PR gate')
  assert.ok(indexOf('An open ga4-404-remediation PR already exists') < indexOf('REST_UPSTREAM_REFRESH_PAT is not configured'), 'open-PR gate precedes the PAT gate')
  assert.match(script, /gh pr list --label ga4-404-remediation --state open --json number --jq 'length'/)
  // Gate 10: the PAT opens the PR so pull_request checks actually run.
  assert.match(script, /git push "https:\/\/x-access-token:\$\{REST_UPSTREAM_REFRESH_PAT\}@github\.com\/\$\{GITHUB_REPOSITORY\}\.git"/)
  assert.doesNotMatch(source, /git push origin/)
  // The publish path is apply mode with the generator writing conf + ledger.
  assert.match(script, /--mode apply \\\n\s+--mapping tmp\/ga4-404-remediation\/publish-mapping\.json/)
  assert.match(script, /--write-conf/)
  assert.match(script, /--ledger scripts\/redirects\/ga4-404-remediation-ledger\.json/)
  assert.match(script, /branch="ga4-404-remediation\/\$\{batch_date\}-\$\{GITHUB_RUN_ID\}"/)
  assert.match(script, /gh label create ga4-404-remediation/)
  // The PR body file is a bash variable (gh pr create reads it) carried into
  // the node truncation via BODY_FILE — regression pin for the live failure
  // where gh received `--body-file ""` because the variable was never defined.
  assert.match(script, /body_file="\$RUNNER_TEMP\/pr-body\.md"/)
  assert.match(script, /BODY_FILE="\$body_file" node -e/)
  assert.match(script, /test -s "\$body_file" \|\| \{/)
  assert.match(script, /--body-file "\$body_file" \\/)
  assert.match(script, /gh pr create \\\n\s+--repo "\$GITHUB_REPOSITORY" \\\n\s+--base master --head "\$branch"/)
  assert.match(script, /--label ga4-404-remediation\)/)
  assert.match(script, /gh pr comment "\$pr_url" --repo "\$GITHUB_REPOSITORY" --body-file tmp\/ga4-404-remediation\/triage\.md/)
  // The proposal body is bounded in the PR like every other bot PR.
  assert.match(script, /60000/)
  // The publish checkout must not leave the default token in the workspace.
  const checkout = remediation.steps.find(step => step.uses?.startsWith('actions/checkout@'))
  assert.equal(checkout.with['persist-credentials'], false)
})

test('the reply executor gates on allowlist, triage markers, reply markers, and the remediation PR', () => {
  const gate = stepNamed(applyReply, 'Gate the reply')
  assert.equal(gate.env.ALLOWLIST, '${{ vars.GA4_404_REMEDIATION_ALLOWLIST }}')
  assert.equal(gate.env.COMMENT_AUTHOR, '${{ github.event.comment.user.login }}')
  const script = gate.run
  // Fail-closed order: allowlist configured, commenter allowed, not a triage
  // post/quote, carries a reply block, targets a remediation PR.
  const indexOf = needle => script.indexOf(needle)
  assert.ok(indexOf('reply executor stays disabled') < indexOf('not on the remediation allowlist'))
  assert.ok(indexOf('not on the remediation allowlist') < indexOf('carries the triage block'))
  assert.ok(indexOf('carries the triage block') < indexOf('nothing to apply'))
  assert.ok(indexOf('nothing to apply') < indexOf('does not carry the ga4-404-remediation label'))
  assert.match(script, /grep -q 'ga4-404-triage:v1' "\$comment_body"/)
  assert.match(script, /grep -q 'ga4-404-reply-data begin' "\$comment_body"/)
  assert.match(script, /pr_branch=\$\(echo "\$pr_json" \| jq -r '\.headRefName'\)/)
  assert.match(script, /ga4-404-remediation\/\*\)/)
  // The read gates use the workflow token; writes use the PAT.
  assert.equal(gate.env.GH_TOKEN, '${{ github.token }}')

  const apply = stepNamed(applyReply, 'Apply the reply to the PR branch')
  assert.equal(apply.env.GH_TOKEN, '${{ secrets.REST_UPSTREAM_REFRESH_PAT }}')
  assert.equal(apply.env.PR_BRANCH, '${{ steps.gate.outputs.pr_branch }}')
  // P0 regression pin: the executor's apply must actually write the conf —
  // without --write-conf it pushes ledger-only commits while claiming rules.
  assert.match(apply.run, /--write-conf/)
  assert.match(apply.run, /--reply-file "\$RUNNER_TEMP\/comment-body\.md"/)
  assert.match(apply.run, /--ledger scripts\/redirects\/ga4-404-remediation-ledger\.json/)
  // The ledger is always committed; the conf only when the reply carried rules.
  assert.match(apply.run, /git add scripts\/redirects\/ga4-404-remediation-ledger\.json/)
  assert.match(apply.run, /if \[ "\$\{rules:-0\}" != "0" \]; then\n\s+git add deploy\/en\/nginx\.conf/)
  assert.match(apply.run, /if git diff --cached --quiet; then/)
  // Rejections never echo the reply markers back into a comment.
  assert.match(apply.run, /apply_log="\$\{apply_log\/\/ga4-404-reply-data begin\/\(reply marker elided\)\}"/)
  // Loop safety: the bot's confirmation comment itself never carries markers.
  const confirmationLine = apply.run.split('\n').find(line => line.includes("printf 'Reply applied:"))
  assert.ok(confirmationLine, 'the executor posts an apply confirmation')
  assert.ok(!confirmationLine.includes('ga4-404-reply-data'), 'the confirmation text must not contain reply markers')
  // Rejections post the reason and fail the run.
  assert.match(apply.run, /The reply could not be applied/)
  const executorCheckout = applyReply.steps.find(step => step.uses?.startsWith('actions/checkout@'))
  assert.equal(executorCheckout.with['persist-credentials'], false)
  assert.equal(executorCheckout.with.ref, '${{ steps.gate.outputs.pr_branch }}')
})

test('the pushing jobs stay identical to the declared Git writer inventory', () => {
  const policySource = fs.readFileSync('scripts/validate-workflow-policy.js', 'utf8')
  assert.match(policySource, /\['ga4-404-remediation\.yml', new Set\(\['remediation', 'apply_reply'\]\)\]/)
  const pushingJobs = Object.entries(jobs)
    .filter(([, job]) => /git(?:\s+-C\s+\S+)?\s+push\b/.test(JSON.stringify(job)))
    .map(([name]) => name)
    .sort()
  assert.deepEqual(pushingJobs, ['apply_reply', 'remediation'])
})
