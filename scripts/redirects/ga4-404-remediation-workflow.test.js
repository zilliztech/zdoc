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
const triageProposal = jobs.triage_proposal

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
  assert.deepEqual(Object.keys(jobs).sort(), ['apply_reply', 'remediation', 'triage_proposal'])
  assert.equal(remediation['timeout-minutes'], 20)
  // The interpreter adds a codex turn plus a dependency install on top of the
  // structured path, so the executor ceiling rises with PR3.
  assert.equal(applyReply['timeout-minutes'], 20)
  assert.equal(triageProposal['timeout-minutes'], 20)
  // The executor only wakes for PR comments, never for plain issue comments.
  assert.equal(applyReply.if, "github.event_name == 'issue_comment' && github.event.issue.pull_request != null")
})

test('the classification job consumes the tracked ledger, emits proposal outputs, and degrades without credentials', () => {
  const credentials = stepNamed(remediation, 'Resolve GA4 credentials')
  assert.equal(credentials.env.GA4_SERVICE_ACCOUNT_JSON, '${{ secrets.GA4_SERVICE_ACCOUNT_JSON }}')
  assert.match(credentials.run, /::notice::GA4 404 remediation is not configured/)

  const run = stepNamed(remediation, 'Run GA4 404 remediation')
  assert.match(run.run, /--ledger scripts\/redirects\/ga4-404-remediation-ledger\.json/)
  assert.match(run.run, /--output-dir tmp\/ga4-404-remediation/)
  // The classification stays zero-dependency: no pnpm install in this job, and
  // its setup-node must not reach for the repo-root pnpm-lock.yaml either.
  const remediationSource = remediation.steps.map(step => step.run || '').join('\n')
  assert.doesNotMatch(remediationSource, /pnpm install/)
  assert.doesNotMatch(remediationSource, /pnpm\/action-setup/)
  const remediationSetup = stepNamed(remediation, 'Set up Node.js')
  assert.equal(remediationSetup.with['package-manager-cache'], false)

  // The proposal job binds to the batch through these job outputs.
  assert.deepEqual(remediation.outputs, {
    pr_number: '${{ steps.publish.outputs.pr_number }}',
    triage_count: '${{ steps.remediation.outputs.triage_count }}',
  })
  assert.match(run.run, /triage_count=\$\(node -e 'const r=require\("\.\/tmp\/ga4-404-remediation\/report\.json"\);process\.stdout\.write\(String\(\(r\.triage\|\|\[\]\)\.length\)\)'\)/)
  const publish = stepNamed(remediation, 'Publish remediation pull request')
  assert.match(publish.run, /echo "pr_number=\$\{pr_url##\*\/\}" >> "\$GITHUB_OUTPUT"/)

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

test('the triage proposal job stays a read-only advisory poster with isolated agent credentials', () => {
  assert.equal(triageProposal.needs, 'remediation')
  assert.equal(
    triageProposal.if,
    "needs.remediation.outputs.pr_number != '' && needs.remediation.outputs.triage_count != '' && needs.remediation.outputs.triage_count != '0'",
  )
  // The workflow token may comment (issues: write) but never push: the IAM
  // layer, not a prompt, enforces "codex never commits".
  assert.deepEqual(triageProposal.permissions, {contents: 'read', issues: 'write'})
  const proposalSource = triageProposal.steps.map(step => step.run || '').join('\n')
  assert.doesNotMatch(proposalSource, /REST_UPSTREAM_REFRESH_PAT/)
  assert.doesNotMatch(proposalSource, /GA4_SERVICE_ACCOUNT_JSON/)
  assert.doesNotMatch(proposalSource, /git push/)
  assert.doesNotMatch(proposalSource, /git commit/)

  const propose = stepNamed(triageProposal, 'Run the codex triage proposal')
  assert.equal(propose.env.AGENTIC_PROVIDER_API_KEY, '${{ secrets.DEEPSEEK_API_KEY }}')
  assert.equal(propose.env.AGENTIC_BASE_URL, '${{ vars.DEEPSEEK_BASE_URL }}')
  // Fail-closed when the agentic gateway is not configured.
  assert.match(propose.run, /::notice::Agentic gateway is not configured/)
  assert.match(propose.run, /--mode propose \\/)
  assert.match(propose.run, /--report tmp\/ga4-404-remediation\/report\.json/)
  assert.match(propose.run, /--api-key-env AGENTIC_PROVIDER_API_KEY/)
  assert.match(propose.run, /--codex-home "\$RUNNER_TEMP\/triage-codex-home"/)

  const install = triageProposal.steps.find(step => step.uses === 'pnpm/action-setup@v5')
  assert.ok(install, 'the proposal job installs the codex SDK from the repo dependencies')
  assert.equal(stepNamed(triageProposal, 'Set up Node.js').with.cache, 'pnpm')
  assert.match(stepNamed(triageProposal, 'Install current tooling').run, /pnpm install --frozen-lockfile/)

  const download = triageProposal.steps.find(step => step.uses?.startsWith('actions/download-artifact@'))
  assert.equal(download.uses, 'actions/download-artifact@v7')
  assert.equal(download.with.name, 'ga4-404-remediation-${{ github.run_id }}')

  // The comment goes out under the workflow token identity (github-actions[bot]),
  // which the executor allowlist rejects; the PAT is not involved at all.
  const post = stepNamed(triageProposal, 'Post the proposal comment')
  assert.equal(post.env.GH_TOKEN, '${{ github.token }}')
  assert.equal(post.if, "${{ steps.propose.outputs.proposal == 'true' }}")
  assert.match(post.run, /gh pr comment "\$PR_NUMBER" --repo "\$GITHUB_REPOSITORY" --body-file tmp\/ga4-404-proposal\/proposal\.md/)
})

test('the reply executor gates on allowlist, bot output prefixes, and the remediation PR, then picks a reply mode', () => {
  // The interpreter's notices and rejections post as github-actions[bot]; the
  // job needs the comment scope for that, but never a push scope (the PR2
  // lesson: pin the capability a token must actually have, not just the env).
  assert.deepEqual(applyReply.permissions, {contents: 'read', issues: 'write'})
  const gate = stepNamed(applyReply, 'Gate the reply')
  assert.equal(gate.env.ALLOWLIST, '${{ vars.GA4_404_REMEDIATION_ALLOWLIST }}')
  assert.equal(gate.env.COMMENT_AUTHOR, '${{ github.event.comment.user.login }}')
  const script = gate.run
  // Fail-closed order: allowlist configured, commenter allowed, not a triage
  // post/quote, not a codex proposal post/quote, not executor output, then the
  // reply-mode split, then the remediation PR checks.
  const indexOf = needle => script.indexOf(needle)
  assert.ok(indexOf('reply executor stays disabled') < indexOf('not on the remediation allowlist'))
  assert.ok(indexOf('not on the remediation allowlist') < indexOf('carries the triage block'))
  assert.ok(indexOf('carries the triage block') < indexOf('carries a codex triage proposal'))
  assert.ok(indexOf('carries a codex triage proposal') < indexOf('ignoring to break the reply loop'))
  assert.ok(indexOf('ignoring to break the reply loop') < indexOf('reply_mode=interpret'))
  assert.ok(indexOf('reply_mode=interpret') < indexOf('does not carry the ga4-404-remediation label'))
  assert.match(script, /grep -q 'ga4-404-triage:v1' "\$comment_body"/)
  assert.match(script, /grep -q 'ga4-404-triage-proposal:v1' "\$comment_body"/)
  // Every executor-authored comment starts with one of these prefixes; the
  // match keeps the interpreter from consuming its own output.
  assert.match(script, /"Reply applied"\*\|"The reply could not be applied"\*\|"Triage reply interpreter"\*/)
  // A marker-carrying comment applies directly; otherwise free text only
  // reaches the interpreter when the PR actually carries triage context —
  // sourced from the batch's FIRST machine triage comment only, so a forged
  // triage-data block in any later comment cannot hijack the scope or the
  // prompt (live-reproduced forgery during review).
  assert.match(script, /if grep -q 'ga4-404-reply-data begin' "\$comment_body"; then\n\s+reply_mode=block/)
  assert.match(script, /select\(\.body \| startswith\("<!-- ga4-404-triage:v1 -->"\)\) \| \.body\] \| \.\[0\] \/\/ empty/)
  assert.match(script, /issues\/\$\{PR_NUMBER\}\/comments\?per_page=100/)
  assert.doesNotMatch(source, /--paginate --jq 'map\(\.body\) \| join/)
  assert.match(script, /No ga4-404-reply-data block and no triage context on this PR; nothing to apply/)
  assert.match(script, /echo "reply_mode=\$\{reply_mode\}"/)
  assert.match(script, /pr_branch=\$\(echo "\$pr_json" \| jq -r '\.headRefName'\)/)
  assert.match(script, /ga4-404-remediation\/\*\)/)
  // The read gates use the workflow token; writes use the PAT.
  assert.equal(gate.env.GH_TOKEN, '${{ github.token }}')
})

test('the interpreter translates free text into the same apply path with isolated credentials', () => {
  const apply = stepNamed(applyReply, 'Apply the reply to the PR branch')
  assert.equal(apply.env.GH_TOKEN, '${{ secrets.REST_UPSTREAM_REFRESH_PAT }}')
  assert.equal(apply.env.PR_BRANCH, '${{ steps.gate.outputs.pr_branch }}')
  assert.equal(apply.env.REPLY_MODE, '${{ steps.gate.outputs.reply_mode }}')
  // P0 regression pin: the executor's apply must actually write the conf —
  // without --write-conf it pushes ledger-only commits while claiming rules.
  assert.match(apply.run, /--write-conf/)
  assert.match(apply.run, /reply_file="\$RUNNER_TEMP\/comment-body\.md"/)
  assert.match(apply.run, /if \[ "\$REPLY_MODE" = "interpret" \]; then/)
  assert.match(apply.run, /reply_file="\$INTERPRETED_REPLY_FILE"/)
  assert.match(apply.run, /test -s "\$INTERPRETED_REPLY_FILE"/)
  assert.match(apply.run, /--ledger scripts\/redirects\/ga4-404-remediation-ledger\.json/)
  // Integrity guard: the full-access interpreter turn shares this workspace
  // with the PAT-carrying apply step, so tracked state must be untouched and
  // no planted git hook may run (live-reproduced risk during review).
  assert.match(apply.run, /git status --porcelain --untracked-files=no/)
  assert.match(apply.run, /workspace is dirty after the interpreter turn; refusing to apply possibly tampered state/)
  assert.match(apply.run, /git commit --no-verify -m "chore\(redirects\): apply triage reply/)
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

  // Interpreter steps run only for free-text replies, and the push PAT never
  // enters the step that runs codex.
  const interpret = stepNamed(applyReply, 'Interpret the free-text reply')
  assert.equal(
    interpret.if,
    "${{ steps.gate.outputs.should_apply == 'true' && steps.gate.outputs.reply_mode == 'interpret' }}",
  )
  const interpretSource = interpret.run
  assert.doesNotMatch(interpretSource, /REST_UPSTREAM_REFRESH_PAT/)
  assert.doesNotMatch(interpretSource, /GA4_SERVICE_ACCOUNT_JSON/)
  assert.equal(interpret.env.GH_TOKEN, '${{ github.token }}')
  assert.equal(interpret.env.AGENTIC_PROVIDER_API_KEY, '${{ secrets.DEEPSEEK_API_KEY }}')
  // Fail-closed without the gateway — with PR feedback, not a silent red run.
  assert.match(interpretSource, /::error::Agentic gateway is not configured/)
  assert.match(interpretSource, /Triage reply interpreter: the agentic gateway is not configured/)
  assert.match(interpretSource, /could not read the machine triage block on this PR; nothing applied/)
  assert.match(interpretSource, /--mode extract-triage/)
  assert.match(interpretSource, /--mode interpret/)
  // The scope source is the same forge-proof first-machine-comment fetch.
  assert.match(interpretSource, /select\(\.body \| startswith\("<!-- ga4-404-triage:v1 -->"\)/)
  assert.match(interpretSource, /--triage-file "\$RUNNER_TEMP\/triage-entries\.json"/)
  assert.match(interpretSource, /--comment-file "\$RUNNER_TEMP\/comment-body\.md"/)
  assert.match(interpretSource, /--ledger scripts\/redirects\/ga4-404-remediation-ledger\.json/)
  assert.match(interpretSource, /--codex-home "\$RUNNER_TEMP\/triage-codex-home"/)
  // No actionable decision is a normal outcome: notice comment, clean exit.
  assert.match(interpretSource, /interpret_result=no_decisions/)
  assert.match(interpretSource, /Triage reply interpreter: no actionable decision found in the comment; nothing applied/)
  // Failures post the sanitized rejection reason and fail the run.
  assert.match(interpretSource, /interpret_log="\$\{interpret_log\/\/ga4-404-reply-data begin\/\(reply marker elided\)\}"/)
  assert.match(interpretSource, /The reply could not be applied/)
  assert.match(interpretSource, /echo "proceed=true" >> "\$GITHUB_OUTPUT"/)

  // The install is interpreter-mode only so the structured path never pays it.
  const installSteps = applyReply.steps.filter(step => step.uses === 'pnpm/action-setup@v5' || (step.run || '').includes('pnpm install'))
  for (const step of installSteps) {
    assert.match(String(step.if), /reply_mode == 'interpret'/, `${step.name} must be interpreter-mode only`)
  }
  const executorSetup = stepNamed(applyReply, 'Set up Node.js')
  assert.equal(executorSetup.with['package-manager-cache'], false)
  // The interpreter path restores the pnpm store cache instead of paying a
  // full cold monorepo download on every free-text reply.
  const cachedSetup = stepNamed(applyReply, 'Set up Node.js with the pnpm store cache')
  assert.equal(cachedSetup.with.cache, 'pnpm')
  assert.match(String(cachedSetup.if), /reply_mode == 'interpret'/)

  // The apply step must skip when the interpreter found no decisions, and run
  // for both the structured block and the interpreted block.
  assert.equal(
    apply.if,
    "${{ steps.gate.outputs.should_apply == 'true' && (steps.gate.outputs.reply_mode == 'block' || steps.interpret.outputs.proceed == 'true') }}",
  )
  // The interpret-mode confirmation is built by node (a literal code fence in
  // a shell format string trips shellcheck SC2016, the PR2 trap) and echoes
  // the interpreted decisions as bare JSON, never as a live reply block.
  const confirmBuilder = apply.run.split('\n').find(line => line.includes('node -e') && line.includes('CONFIRMATION_FILE'))
  assert.ok(confirmBuilder, 'the interpret-mode confirmation is built in node')
  assert.doesNotMatch(apply.run, /printf 'Interpreted decisions/)
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
