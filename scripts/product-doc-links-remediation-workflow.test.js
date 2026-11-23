'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const yaml = require('js-yaml')

const workflowPath = '.github/workflows/product-doc-links-remediation.yml'
const source = fs.readFileSync(workflowPath, 'utf8')
const workflow = yaml.load(source)
const jobs = workflow.jobs
const remediation = jobs.remediation
const applyReply = jobs.apply_reply
const triageProposal = jobs.triage_proposal

function stepNamed(job, name) {
  return job.steps.find(step => step.name === name)
}

function orderedNeedles(haystack, needles) {
  let cursor = -1
  for (const needle of needles) {
    const index = haystack.indexOf(needle, cursor + 1)
    assert.ok(index > cursor, `expected ${JSON.stringify(needle)} after offset ${cursor}`)
    cursor = index
  }
}

test('the workflow reacts to schedule, dispatch, and PR comments with read-only top-level permissions', () => {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['issue_comment', 'schedule', 'workflow_dispatch'])
  assert.equal(workflow.on.schedule[0].cron, '23 4 * * *')
  assert.deepEqual(workflow.on.issue_comment, {types: ['created']})
  assert.equal(workflow.on.workflow_dispatch, null)
  assert.deepEqual(workflow.permissions, {contents: 'read'})
  assert.deepEqual(workflow.concurrency, {
    group: 'product-doc-links-remediation',
    'cancel-in-progress': false,
  })
  assert.deepEqual(Object.keys(jobs).sort(), ['apply_reply', 'remediation', 'triage_proposal'])
  // The scan probes every product URL, so the classification job gets a
  // wider ceiling than the GA4 zero-dependency job.
  assert.equal(remediation['timeout-minutes'], 30)
  assert.equal(applyReply['timeout-minutes'], 20)
  assert.equal(triageProposal['timeout-minutes'], 20)
  assert.equal(applyReply.if, "github.event_name == 'issue_comment' && github.event.issue.pull_request != null")
  assert.equal(workflow.env?.PRODUCT_LINKS_LEDGER, 'scripts/redirects/product-doc-links-ledger.json')
})

test('the classification job scans Link.ts at a fail-closed revision and runs the lane classifier', () => {
  const checkout = stepNamed(remediation, 'Check out immutable tooling revision')
  assert.equal(checkout.with.ref, '${{ github.sha }}')
  assert.equal(checkout.with['persist-credentials'], false)

  const revision = stepNamed(remediation, 'Resolve product link source revision')
  assert.equal(revision.env.PRODUCT_DOC_LINKS_GITHUB_TOKEN, '${{ secrets.PRODUCT_DOC_LINKS_GITHUB_TOKEN }}')
  assert.match(revision.run, /test -n "\$PRODUCT_DOC_LINKS_GITHUB_TOKEN"/)
  assert.match(revision.run, /curl -s --fail-with-body/)
  assert.match(revision.run, /https:\/\/api\.github\.com\/repos\/zilliztech\/zilliz-cloud\/commits\/master/)
  assert.match(revision.run, /jq -e -r '\.sha \| select\(type == "string" and test\("\^\[0-9a-f\]\{40\}\$"\)\)'/)
  assert.doesNotMatch(remediation.run ?? '', /git ls-remote/)

  const scan = stepNamed(remediation, 'Scan product UI doc links')
  assert.equal(scan.env.PRODUCT_DOC_LINKS_SOURCE_REVISION, '${{ steps.source.outputs.revision }}')
  assert.equal(scan.env.PRODUCT_DOC_LINKS_GITHUB_TOKEN, '${{ secrets.PRODUCT_DOC_LINKS_GITHUB_TOKEN }}')
  assert.match(scan.run, /check-product-doc-links --output tmp\/product-remediation\/report\.md/)

  const classify = stepNamed(remediation, 'Classify broken links into site lanes')
  assert.match(classify.run, /product-doc-remediation\.js \\\n\s+--product-report tmp\/product-remediation\/report\.json/)
  // The classifier writes into its own subdirectory so the scan's raw
  // report.json survives in the artifact as the raw evidence.
  assert.match(classify.run, /--output-dir tmp\/product-remediation\/classification/)
  assert.match(classify.run, /--ledger "\$PRODUCT_LINKS_LEDGER"/)
  assert.match(classify.run, /direct_count=\$\(node -e .*classification\/report\.json/)
  assert.match(classify.run, /triage_count=\$\(node -e .*classification\/report\.json/)

  const upload = stepNamed(remediation, 'Upload remediation artifacts')
  assert.equal(upload.with.name, 'product-doc-remediation-${{ github.run_id }}')
  assert.equal(upload.with.path, 'tmp/product-remediation')
  assert.equal(upload.with['retention-days'], 14)
})

test('the publish step gates on direct or triage work and applies each lane through its own conf contract', () => {
  const publish = stepNamed(remediation, 'Publish remediation pull request')
  assert.equal(publish.env.REST_UPSTREAM_REFRESH_PAT, '${{ secrets.REST_UPSTREAM_REFRESH_PAT }}')
  assert.equal(publish.env.GH_TOKEN, '${{ github.token }}')
  // Deliberate gate difference from the GA4 loop: the ledger-filtered product
  // batch opens a PR for triage-only work (no traffic-volume noise exists
  // here, so triage implies genuinely new findings).
  orderedNeedles(publish.run, [
    'if [ "$direct" = "0" ] && [ "$triage" = "0" ]; then',
    'gh pr list --label product-doc-links-remediation --state open --json number --jq \'length\'',
    'REST_UPSTREAM_REFRESH_PAT is not configured',
  ])
  // Per-lane apply: each site invocation pins its own conf and snapshot; the
  // zh lane must never splice the en conf and vice versa.
  orderedNeedles(publish.run, [
    'publish-mapping-en.json',
    '--mode apply --site en \\',
    '--conf deploy/en/nginx.conf',
    '--snapshot deploy/contracts/en-redirect-target-routes.json',
    'en lane apply failed:',
    'publish-mapping-zh.json',
    '--mode apply --site zh-CN \\',
    '--conf deploy/zh-CN/nginx.conf',
    '--snapshot deploy/contracts/zh-CN-redirect-target-routes.json',
    'zh lane apply failed:',
    'if [ "$ledger_in" != "$PRODUCT_LINKS_LEDGER" ]; then',
    'cp "$ledger_in" "$PRODUCT_LINKS_LEDGER"',
  ])
  assert.match(publish.run, /branch="product-doc-remediation\/\$\{batch_date\}-\$\{GITHUB_RUN_ID\}"/)
  assert.match(publish.run, /git add "\$PRODUCT_LINKS_LEDGER"/)
  assert.match(publish.run, /git add deploy\/en\/nginx\.conf/)
  assert.match(publish.run, /git add deploy\/zh-CN\/nginx\.conf/)
  assert.match(publish.run, /git commit --no-verify/)
  // The triage-only exit: a batch with new unresolved paths but no
  // deterministic rules has no diff to commit, and an empty-marker commit is
  // what lets the PR (and its triage comment) exist at all — this is the
  // exit the GA4 loop's direct-only gate never had.
  orderedNeedles(publish.run, [
    'if git diff --cached --quiet; then',
    'if [ "$direct" = "0" ] && [ "$triage" != "0" ]; then',
    'git commit --no-verify --allow-empty -m "chore(redirects): product-doc-links remediation batch ${batch_date} (triage-only, ${triage} new paths)"',
    'refusing to open an empty PR',
    'fix(redirects): product-doc-links remediation batch ${batch_date} (en ${en_rules} + zh ${zh_rules} rules)',
  ])
  assert.match(publish.run, /x-access-token:\$\{REST_UPSTREAM_REFRESH_PAT\}@github\.com/)
  assert.doesNotMatch(publish.run, /git push origin/)
  assert.match(publish.run, /gh label create product-doc-links-remediation/)
  assert.match(publish.run, /--base master --head "\$branch"/)
  assert.match(publish.run, /--label product-doc-links-remediation\)/)
  assert.match(publish.run, /60000/)
  assert.match(publish.run, /gh pr comment "\$pr_url" --repo "\$GITHUB_REPOSITORY" --body-file tmp\/product-remediation\/classification\/triage\.md/)
  assert.match(source, /persist-credentials: false/)
})

test('the proposal job stays read-only and posts as the bot identity', () => {
  assert.equal(triageProposal.needs, 'remediation')
  assert.equal(triageProposal.if, "needs.remediation.outputs.pr_number != '' && needs.remediation.outputs.triage_count != '' && needs.remediation.outputs.triage_count != '0'")
  assert.deepEqual(triageProposal.permissions, {contents: 'read', issues: 'write', 'pull-requests': 'write'})
  const proposalSource = JSON.stringify(triageProposal)
  assert.doesNotMatch(proposalSource, /REST_UPSTREAM_REFRESH_PAT/)
  assert.doesNotMatch(proposalSource, /git push|git commit --no-verify/)
  // Every checkout is credential-free: the PAT never rides the runner disk.
  for (const [jobName, jobObj] of Object.entries(jobs)) {
    const checkouts = (jobObj.steps ?? []).filter(step => step.uses?.startsWith('actions/checkout@'))
    assert.ok(checkouts.length > 0, `${jobName} has a checkout`)
    for (const checkout of checkouts) {
      assert.equal(checkout.with['persist-credentials'], false, `${jobName} checkout must not persist credentials`)
    }
  }
  const propose = stepNamed(triageProposal, 'Run the codex triage proposal')
  assert.match(propose.run, /--mode propose/)
  assert.match(propose.run, /--report tmp\/product-remediation\/classification\/report\.json/)
  assert.match(propose.run, /--api-key-env AGENTIC_PROVIDER_API_KEY/)
  assert.equal(propose.env.AGENTIC_PROVIDER_API_KEY, '${{ secrets.DEEPSEEK_API_KEY }}')
  assert.equal(propose.env.AGENTIC_BASE_URL, '${{ vars.DEEPSEEK_BASE_URL }}')
  const download = stepNamed(triageProposal, 'Download remediation artifacts')
  assert.equal(download.with.name, 'product-doc-remediation-${{ github.run_id }}')
  const post = stepNamed(triageProposal, 'Post the proposal comment')
  assert.equal(post.env.GH_TOKEN, '${{ github.token }}')
})

test('the reply executor gates in the fixed order with the product allowlist', () => {
  assert.deepEqual(applyReply.permissions, {contents: 'read', issues: 'write', 'pull-requests': 'write'})
  const gate = stepNamed(applyReply, 'Gate the reply')
  assert.equal(gate.env.ALLOWLIST, '${{ vars.PRODUCT_DOC_REMEDIATION_ALLOWLIST }}')
  assert.match(gate.run, /PRODUCT_DOC_REMEDIATION_ALLOWLIST is not configured/)
  orderedNeedles(gate.run, [
    'PRODUCT_DOC_REMEDIATION_ALLOWLIST is not configured',
    'is not on the remediation allowlist',
    "grep -q 'ga4-404-triage:v1'",
    "grep -q 'ga4-404-triage-proposal:v1'",
    '"Reply applied"*|"The reply could not be applied"*|"Triage reply interpreter"*',
    "grep -q 'ga4-404-reply-data begin'",
    'startswith("<!-- ga4-404-triage:v1 -->")',
    '"product-doc-links-remediation"',
    'product-doc-remediation/*',
  ])
  assert.match(gate.run, /per_page=100/)
  assert.doesNotMatch(gate.run, /--paginate/)
})

test('the executor routes every decision through the triage entries before any conf moves', () => {
  const interpret = stepNamed(applyReply, 'Interpret the free-text reply')
  assert.equal(interpret.env.GH_TOKEN, '${{ github.token }}')
  assert.match(interpret.run, /--mode extract-triage/)
  assert.match(interpret.run, /--mode interpret/)
  assert.match(interpret.run, /--ledger "\$PRODUCT_LINKS_LEDGER"/)
  assert.match(interpret.run, /interpret_result=no_decisions/)
  assert.match(interpret.run, /\(reply marker elided\)/)

  const apply = stepNamed(applyReply, 'Apply the reply to the PR branch')
  assert.equal(apply.env.GH_TOKEN, '${{ secrets.REST_UPSTREAM_REFRESH_PAT }}')
  assert.equal(apply.env.INTERPRETED_REPLY_FILE, '${{ steps.interpret.outputs.reply_file }}')
  // Integrity guard after the free-access interpreter turn.
  assert.match(apply.run, /workspace is dirty after the interpreter turn/)
  // Lane routing: the split step reads the machine triage entries, and an
  // unassignable decision fails the reply before the first apply.
  orderedNeedles(apply.run, [
    'if [ ! -s "$RUNNER_TEMP/triage-comments.md" ]; then',
    '--mode extract-triage',
    '--mode split-reply',
    '--triage-file "$RUNNER_TEMP/triage-entries.json"',
    'mapping-en.json',
    '--mode apply --site en \\',
    '--conf deploy/en/nginx.conf',
    '--snapshot deploy/contracts/en-redirect-target-routes.json',
    'mapping-zh-CN.json',
    '--mode apply --site zh-CN \\',
    '--conf deploy/zh-CN/nginx.conf',
    '--snapshot deploy/contracts/zh-CN-redirect-target-routes.json',
    'if [ "$ledger_in" != "$PRODUCT_LINKS_LEDGER" ]; then',
    'cp "$ledger_in" "$PRODUCT_LINKS_LEDGER"',
  ])
  // The GA4 parity pins: interpreter mode echoes the interpreted decisions,
  // and the confirmation stays prefix-marked and marker-free.
  orderedNeedles(apply.run, [
    "if [ \"$REPLY_MODE\" = \"interpret\" ]; then",
    'Reply applied (interpreted from your comment by the triage agent):',
    "printf 'Reply applied: %s rule(s) + ledger update pushed to this PR by @",
  ])
  assert.match(apply.run, /--write-conf/)
  assert.match(apply.run, /git add "\$PRODUCT_LINKS_LEDGER"/)
  assert.match(apply.run, /git add deploy\/en\/nginx\.conf/)
  assert.match(apply.run, /git add deploy\/zh-CN\/nginx\.conf/)
  assert.match(apply.run, /git commit --no-verify/)
  assert.match(apply.run, /git push "https:\/\/x-access-token:\$\{GH_TOKEN\}@github\.com/)
  // The confirmation stays prefix-marked and never carries reply markers.
  assert.match(apply.run, /^  printf 'Reply applied: %s rule\(s\) \+ ledger update pushed to this PR by @/m)
  assert.doesNotMatch(apply.run, /ga4-404-reply-data begin.*confirmation/)
})

test('the pushing jobs stay identical to the Git writer inventory', () => {
  const policy = fs.readFileSync('scripts/validate-workflow-policy.js', 'utf8')
  assert.match(policy, /\['product-doc-links-remediation\.yml', new Set\(\['remediation', 'apply_reply'\]\)\]/)
  const pushing = new Set()
  for (const [name, job] of Object.entries(jobs)) {
    if (JSON.stringify(job).includes('git push')) pushing.add(name)
  }
  assert.deepEqual([...pushing].sort(), ['apply_reply', 'remediation'])
})

test('the seeded product ledger is complete, site-tagged, and denylist-shaped', () => {
  const ledger = JSON.parse(fs.readFileSync('scripts/redirects/product-doc-links-ledger.json', 'utf8'))
  assert.equal(ledger.schema_version, 1)
  // The 14 seeded international-product denylist paths (10-29/30 operator
  // decisions); the loop must never start by re-triaging them.
  const seededPaths = new Set([
    '/docs/byoc/configure-vpc',
    '/docs/byoc/deploy-byoc-aws',
    '/docs/byoc/deploy-byoc-gcp',
    '/docs/byoc/deploy-byoc-i-aws',
    '/docs/byoc/deploy-byoc-i-azure',
    '/docs/byoc/deploy-byoc-i-gcp',
    '/docs/integrate-with-azure-blob-storage',
    '/docs/openid-connect',
    '/docs/scim-provisioning-overview',
    '/docs/single-sign-on-with-google-workspace',
    '/docs/single-sign-on-with-microsoft-entra',
    '/docs/single-sign-on-with-other-idp',
    '/docs/subscribe-by-adding-credit-card',
    '/docs/zero-downtime-migration',
  ])
  for (const seedPath of seededPaths) {
    assert.ok(ledger.entries.some(entry => entry.from === seedPath), `the seed must denylist ${seedPath}`)
  }
  // Post-seed decisions may add en rules or declined entries; every entry
  // must still carry a site tag and a known status.
  for (const entry of ledger.entries) {
    assert.ok(entry.site === 'en' || entry.site === 'zh-CN', `entry ${entry.from} must be site-tagged`)
    assert.ok(['fixed', 'declined', 'denylist'].includes(entry.status), `entry ${entry.from} has unknown status ${entry.status}`)
    assert.match(entry.from, /^\//)
    assert.match(entry.decided_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  }
})
