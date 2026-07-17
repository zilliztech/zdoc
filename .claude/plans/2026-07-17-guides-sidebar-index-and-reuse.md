# Guides Sidebar Index and Reuse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove repeated whole-directory parsing from the combined Guides sidebar workflow and skip generation only when a committed identity proves the exact baseline output is reusable, without changing per-document/subtree publication.

**Architecture:** Load Guides JSON into one immutable index shared by separate SaaS and BYOC writers. Compute canonical source, navigation, and conservative tooling identities; carry a strict run decision through the source artifact; first verify decisions in observe-only mode, then enable mutually exclusive reuse or regeneration with unconditional final validation.

**Tech Stack:** Node.js CommonJS, Docusaurus CLI plugin, Node test runner, GitHub Actions YAML, existing Guides stage/checkpoint infrastructure.

**Prerequisite:** Complete the media plan first so source-stage report allowlist changes land in one order. Approved design: `.claude/specs/2026-07-17-guides-pipeline-reuse-staging-and-reporting-design.md`.

---

## File structure

- Create `plugins/lark-docs/larkSourceIndex.js` and `.test.js`: immutable, deterministic source lookup.
- Modify `plugins/lark-docs/larkDocWriter.js` and tests: use an injected index only for the combined sidebar path; preserve the existing no-index lookup path byte-for-byte for per-document publication.
- Create `scripts/docs-workflow/generate-guides-sidebars.js` and `.test.js`: hard-coded one-process two-target wrapper.
- Modify `plugins/lark-docs/index.js`: combined sidebar target option and shared index.
- Create `scripts/docs-workflow/guides-assembly-identity.js` and `.test.js`: projections, fingerprint, descriptor, decision, and CLI.
- Modify `scripts/docs-workflow/content-groups.js` and `.test.js`: committed descriptor ownership.
- Modify `scripts/restore-generated-state.sh` and `.test.js`: exact descriptor restoration.
- Modify `scripts/docs-workflow/guides-stage-artifact.js` and `.test.js`: required decision artifact and identity validation.
- Modify `.github/workflows/_fetch-guides-sources.yml`: calculate the decision after table planning.
- Modify `.github/workflows/_assemble-guides.yml`: observe-only comparison, then real reuse.
- Modify `scripts/collect-build-card-notes.js` and tests: decision/result notes.
- Modify `scripts/docs-workflow/docs-progress-state.js` and tests: live task names.
- Modify `scripts/validate-workflow-policy.js` and tests: observe-only and enabled-mode invariants.

### Task 1: Build the immutable source index

**Files:**
- Create: `plugins/lark-docs/larkSourceIndex.js`
- Create: `plugins/lark-docs/larkSourceIndex.test.js`

- [ ] **Step 1: Write failing lookup and parse-count tests**

Create fixtures with node, origin, object, generic token, Base virtual navigation, and duplicate aliases. Assert:

```js
const index = LarkSourceIndex.load(sourceDir, {
  onRead: file => reads.push(file),
})

assert.equal(reads.length, 4)
assert.equal(index.find('node_token', 'node-a').title, 'A')
assert.equal(index.find(['token', 'obj_token'], 'object-a').title, 'A')
assert.equal(index.findAnyToken('origin-a').title, 'A')
assert.equal(index.findBaseSourceMeta({ title: 'Section', slug: 'section' }).base_record_id, 'rec-section')
assert.equal(reads.length, 4)
```

Add an ambiguous duplicate test that requires both source filenames in the error. Add a slug-qualified duplicate test that selects one unique source.

- [ ] **Step 2: Run the new test and confirm failure**

Run:

```bash
node plugins/lark-docs/larkSourceIndex.test.js
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement deterministic loading and indexes**

Implement the public API:

```js
class LarkSourceIndex {
  static load(sourceDir, options = {}) { /* sorted safe load */ }
  find(typeOrTypes, value, options = {}) { /* array-key precedence + slug */ }
  findAnyToken(token) { /* node/origin/object/token */ }
  findBaseSourceMeta({ title, slug, token = null }) { /* token first */ }
}

module.exports = LarkSourceIndex
```

Requirements:

- resolve and validate the real source directory;
- read sorted regular `.json` files once;
- reject directory/file symlinks and malformed JSON;
- recursively freeze each parsed source;
- store source path with each candidate for duplicate diagnostics;
- never choose an ambiguous candidate by enumeration order;
- preserve current `typeOrTypes` precedence and slug behavior.

- [ ] **Step 4: Re-run tests and syntax check**

Run:

```bash
node plugins/lark-docs/larkSourceIndex.test.js
node --check plugins/lark-docs/larkSourceIndex.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add plugins/lark-docs/larkSourceIndex.js plugins/lark-docs/larkSourceIndex.test.js
git commit -m "perf(guides): index lark source lookups"
```

### Task 2: Inject the index into `larkDocWriter`

**Files:**
- Modify: `plugins/lark-docs/larkDocWriter.js`
- Modify: `plugins/lark-docs/larkDocWriter.test.js`
- Modify: `plugins/lark-docs/larkDocWriter.beta.test.js`

- [ ] **Step 1: Add failing writer regression tests**

Append an optional constructor argument and assert repeated private lookup use performs no filesystem enumeration after construction. Exercise ref targets, parent traversal, Base sections, and slug-qualified lookup through public sidebar generation fixtures.

Use a test index spy:

```js
const sourceIndex = {
  find: (...args) => { calls.push(['find', ...args]); return fixtures.node },
  findAnyToken: token => { calls.push(['any', token]); return fixtures.node },
  findBaseSourceMeta: input => { calls.push(['base', input]); return fixtures.section },
}
const writer = new LarkDocWriter('', '', 'default', sourceDir, null, 'zilliz.saas', true, false, null, null, sourceIndex)
```

- [ ] **Step 2: Run existing writer tests and confirm failure**

Run:

```bash
node plugins/lark-docs/larkDocWriter.test.js
node plugins/lark-docs/larkDocWriter.beta.test.js
```

Expected: FAIL because the constructor and lookups do not use the index.

- [ ] **Step 3: Replace the three scanning helpers**

Append `sourceIndex = null` to the constructor without changing existing positional arguments. Store it without constructing an index:

```js
this.sourceIndex = sourceIndex
```

Add indexed branches to the three helpers while leaving their existing filesystem implementation as the exact fallback when `sourceIndex` is null:

```js
__fetch_doc_source(type, value, slug = '') {
  if (this.sourceIndex) {
    const source = this.sourceIndex.find(type, value, { slug })
    if (!source) throw new Error(`Cannot find ${value} in ${this.docSourceDir}`)
    return source
  }
  const file = fs.readdirSync(this.docSourceDir).filter(file => {
    const page = JSON.parse(fs.readFileSync(`${this.docSourceDir}/${file}`, { encoding: 'utf-8', flag: 'r' }))
    try {
      type = type instanceof Array ? type.filter(candidate => Object.keys(page).includes(candidate))[0] : type
    } catch (error) {
      throw new Error(`1. Cannot find ${type} in ${this.docSourceDir}/${file}`)
    }
    return page[type] === value
  })
  if (file.length > 0) {
    if (slug) {
      return file.map(name => JSON.parse(fs.readFileSync(`${this.docSourceDir}/${name}`, { encoding: 'utf-8', flag: 'r' })))
        .filter(page => page.slug === slug)[0]
    }
    return JSON.parse(fs.readFileSync(`${this.docSourceDir}/${file[0]}`, { encoding: 'utf-8', flag: 'r' }))
  }
  throw new Error(`2. Cannot find ${value} in ${this.docSourceDir}`)
}

__fetch_doc_source_by_any_token(token) {
  if (this.sourceIndex) return this.sourceIndex.findAnyToken(token)
  const tokenKeys = ['node_token', 'origin_node_token', 'obj_token', 'token']
  const files = fs.readdirSync(this.docSourceDir).filter(file => file.endsWith('.json'))
  for (const file of files) {
    const source = JSON.parse(fs.readFileSync(`${this.docSourceDir}/${file}`, { encoding: 'utf-8', flag: 'r' }))
    if (tokenKeys.some(key => source[key] === token)) return source
  }
  return null
}

__fetch_base_source_meta(title, slug, token = null) {
  if (this.sourceIndex) return this.sourceIndex.findBaseSourceMeta({ title, slug, token })
  if (!slug || !fs.existsSync(this.docSourceDir)) return null
  const files = fs.readdirSync(this.docSourceDir).filter(file => file.endsWith('.json'))
  const sources = files.map(file => JSON.parse(fs.readFileSync(`${this.docSourceDir}/${file}`, 'utf8')))
  if (token) {
    const tokenMatch = sources.find(source =>
      (source.base_record_id || source.base_nav_virtual) &&
      (source.node_token === token || source.origin_node_token === token || source.token === token)
    )
    if (tokenMatch) return tokenMatch
  }
  return sources.find(source =>
    (source.base_record_id || source.base_nav_virtual) &&
    source.slug === slug &&
    (source.title === title || source.name === title)
  ) || null
}
```

Do not create or inject an index in the existing `opts.docToken` path. Leave its
call order, fetch behavior, writer construction, cleanup, output paths,
post-processing, and sidebar behavior unchanged. Do not share writer mutable
state.

- [ ] **Step 4: Run index and writer regressions**

Run:

```bash
node plugins/lark-docs/larkSourceIndex.test.js
node plugins/lark-docs/larkDocWriter.test.js
node plugins/lark-docs/larkDocWriter.beta.test.js
node plugins/lark-docs/offlineRender.test.js
node scripts/doc-publish-bot/publishRequest.test.js
node scripts/doc-publish-bot/publishJob.test.js
```

Expected: PASS and existing sidebar fixtures remain byte-equivalent.

- [ ] **Step 5: Commit**

```bash
git add plugins/lark-docs/larkDocWriter.js plugins/lark-docs/larkDocWriter.test.js plugins/lark-docs/larkDocWriter.beta.test.js
git commit -m "perf(guides): use indexed source lookups"
```

### Task 3: Generate both sidebars in one process

**Files:**
- Create: `scripts/docs-workflow/generate-guides-sidebars.js`
- Create: `scripts/docs-workflow/generate-guides-sidebars.test.js`
- Modify: `plugins/lark-docs/index.js`

- [ ] **Step 1: Add failing combined-target tests**

Test a pure helper exported from the plugin:

```js
const result = await generateSidebarTargets({
  manual: guides,
  targetNames: ['zilliz.saas', 'zilliz.paas'],
  sourceIndex,
  writerFactory: options => writers.push(options) || fakeWriter(options),
})
assert.equal(writers.length, 2)
assert.equal(writers[0].sourceIndex, writers[1].sourceIndex)
assert.notEqual(writers[0], writers[1])
assert.deepEqual(result.map(item => item.sidebarPath), [
  './config/generated/guides.sidebar.js',
  './config/generated/guides-byoc.sidebar.js',
])
```

Add rejection tests for duplicate/unknown targets and use outside Guides sidebar-only mode.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/generate-guides-sidebars.test.js
```

Expected: FAIL because the wrapper/helper do not exist.

- [ ] **Step 3: Add the Guides-only Docusaurus option**

Add `--sidebarTargets <targets>` to `plugins/lark-docs/index.js`. It is valid only with `--sidebarOnly`, `manual=guides`, and offline media resolution. Parse exactly `zilliz.saas` and `zilliz.paas`, create one `LarkSourceIndex`, then create two separate writers with that shared index and write each configured sidebar.

Place this branch entirely inside `opts.sidebarOnly` before the existing
per-document/subtree branch. Add a regression test that the `opts.docToken`
branch constructs the same writer arguments and executes the same fetch and
`write_subtree()` calls as before when `--sidebarTargets` is absent.

- [ ] **Step 4: Implement the hard-coded workflow wrapper**

`generate-guides-sidebars.js` must accept only `--media-manifest <path>` and run this fixed vector:

```js
[
  'docusaurus', 'fetch-lark-docs',
  '--manual', 'guides',
  '--sidebarOnly',
  '--skipSourceDown',
  '--offline',
  '--sidebarTargets', 'zilliz.saas,zilliz.paas',
  '--mediaManifest', mediaManifest,
]
```

After the child exits 0, require both generated sidebar paths to be regular non-symlink files.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test scripts/docs-workflow/generate-guides-sidebars.test.js
node plugins/lark-docs/larkSourceIndex.test.js
node plugins/lark-docs/larkDocWriter.beta.test.js
node scripts/doc-publish-bot/publishRequest.test.js
node scripts/doc-publish-bot/publishJob.test.js
node --check plugins/lark-docs/index.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/generate-guides-sidebars.js scripts/docs-workflow/generate-guides-sidebars.test.js plugins/lark-docs/index.js
git commit -m "perf(guides): generate sidebars from one source index"
```

### Task 4: Define committed assembly identity and run decision

**Files:**
- Create: `scripts/docs-workflow/guides-assembly-identity.js`
- Create: `scripts/docs-workflow/guides-assembly-identity.test.js`

- [ ] **Step 1: Write failing projection and decision tests**

Test that volatile fields and `targets_built` do not change semantic identity, while every approved navigation field and table digest does. Assert a different `masterSha` changes the generator fingerprint.

The reuse assertion is:

```js
const decision = decideAssembly({
  candidateSnapshot,
  incrementalPlan: { mode: 'incremental', changed_tokens: [], removed_tokens: [] },
  tableCount: 0,
  baselineDescriptor,
  baselineSidebarBytes,
  masterSha: 'a'.repeat(40),
  repositoryRoot,
})
assert.equal(decision.mode, 'reuse')
assert.deepEqual(decision.reasons, [])
assert.equal(decision.semanticSourceGraphSha256, baselineDescriptor.semanticSourceGraphSha256)
assert.equal(decision.navigationOwnershipSha256, baselineDescriptor.navigationOwnershipSha256)
assert.equal(decision.generatorFingerprintSha256, baselineDescriptor.generatorFingerprintSha256)
```

Add missing/corrupt/old descriptor, tampered sidebar, nonzero table count, source delta, schema-2 baseline, and target/navigation-change cases; all must return `regenerate` with bounded reasons.

- [ ] **Step 2: Run tests and confirm missing module failure**

Run:

```bash
node --test scripts/docs-workflow/guides-assembly-identity.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement canonical projections and fingerprint**

Export:

```js
module.exports = {
  decideAssembly,
  generatorFingerprint,
  navigationOwnershipProjection,
  semanticSourceProjection,
  validateAssemblyDecision,
  validateCommittedDescriptor,
  writeCommittedDescriptor,
}
```

Use the exact spec projections. Require schema-3 `snapshot.navigation_records`, sort them by `table_id`, numeric `order`, and `record_id`, and include sorted `snapshot.table_digests`. The generator fingerprint hashes schema version, exact `masterSha`, and the approved allowlist bytes, including this module and `generate-guides-sidebars.js`.

Descriptor exact keys:

```js
{
  schemaVersion: 1,
  semanticSourceGraphSha256,
  navigationOwnershipSha256,
  generatorFingerprintSha256,
  saasSidebarSha256,
  byocSidebarSha256,
}
```

Decision exact keys add `generated_at`, `masterSha`, `devBaselineSha`, `mode`, `reasons`, `tableCount`, and baseline sidebar/descriptor facts.

- [ ] **Step 4: Add strict CLI operations**

Support `decide`, `validate-decision`, `write-descriptor`, and `verify-descriptor`. Require explicit SHA/path arguments; reject duplicates, unknown flags, unsafe paths, unsupported schemas, and extra JSON keys.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
node --test scripts/docs-workflow/guides-assembly-identity.test.js plugins/lark-docs/sourceSnapshot.test.js
node --check scripts/docs-workflow/guides-assembly-identity.js
```

Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/guides-assembly-identity.js scripts/docs-workflow/guides-assembly-identity.test.js
git commit -m "feat(guides): define assembly reuse identity"
```

### Task 5: Wire descriptor ownership and artifact integrity

**Files:**
- Modify: `scripts/docs-workflow/content-groups.js`
- Test: `scripts/docs-workflow/content-groups.test.js`
- Modify: `scripts/restore-generated-state.sh`
- Test: `scripts/restore-generated-state.test.js`
- Modify: `scripts/docs-workflow/guides-stage-artifact.js`
- Test: `scripts/docs-workflow/guides-stage-artifact.test.js`
- Test: `scripts/docs-workflow/create-checkpoint-artifact.test.js`

- [ ] **Step 1: Add failing ownership/restoration tests**

Assert Guides owns `plugins/lark-docs/meta/assembly/guides.json`, exact restore includes `plugins/lark-docs/meta/assembly`, and a translation checkpoint built after exact restore does not declare the descriptor deleted.

Require source artifacts to contain and semantically validate `plugins/lark-docs/meta/reports/guides-assembly-decision.json` against `masterSha` and `devBaselineSha`.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/docs-workflow/content-groups.test.js scripts/restore-generated-state.test.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js
```

Expected: FAIL because ownership, restoration, and decision artifact wiring are absent.

- [ ] **Step 3: Implement fixed path changes**

Add exactly:

```js
'plugins/lark-docs/meta/assembly/guides.json'
```

to Guides `ownedPaths`, and:

```bash
"plugins/lark-docs/meta/assembly"
```

to `restore-generated-state.sh`. Add the run decision report to source-stage allowed/required paths and call `validateAssemblyDecision()` during creation and validation.

- [ ] **Step 4: Re-run and commit**

Run the command from Step 2. Expected: PASS.

Commit:

```bash
git add scripts/docs-workflow/content-groups.js scripts/docs-workflow/content-groups.test.js scripts/restore-generated-state.sh scripts/restore-generated-state.test.js scripts/docs-workflow/guides-stage-artifact.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/docs-workflow/create-checkpoint-artifact.test.js
git commit -m "feat(guides): preserve assembly identity in checkpoints"
```

### Task 6: Add observe-only workflow decisions

**Files:**
- Modify: `.github/workflows/_fetch-guides-sources.yml`
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `scripts/collect-build-card-notes.js`
- Test: `scripts/collect-build-card-notes.test.js`
- Modify: `scripts/docs-workflow/docs-progress-state.js`
- Test: `scripts/docs-workflow/docs-progress-state.test.js`
- Modify: `scripts/validate-workflow-policy.js`
- Test: `scripts/validate-workflow-policy.test.js`

- [ ] **Step 1: Add failing observe-only policy tests**

Require `Evaluate Guides assembly reuse` after table matrix creation. In assembly, require decision validation, unconditional indexed generation, byte comparison when the decision says reuse, unconditional output validation, and creation of `plugins/lark-docs/meta/reports/guides-assembly-result.json` without mutating the immutable source decision.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-progress-state.test.js
```

Expected: FAIL.

- [ ] **Step 3: Wire source decision generation**

After table matrix calculation, invoke `guides-assembly-identity.js decide` with candidate snapshot, incremental plan, exact baseline directory, table count, `master_sha`, and `dev_baseline_sha`. Validate the file before source artifact creation.

- [ ] **Step 4: Wire observe-only assembly**

Always call `generate-guides-sidebars.js`. When the decision says reuse, first save baseline sidebar bytes, then compare regenerated bytes and hashes with the descriptor; divergence fails the observe-only run. Validate sidebars, write the committed descriptor, and write a separate result report containing mode, reasons, elapsed milliseconds, and byte comparison.

- [ ] **Step 5: Add truthful card notes and commit**

Render `Reuse eligible (observe-only)` or `Regenerated: <bounded reasons>` and normalize `Evaluate Guides assembly reuse` / `Generate combined Guides sidebars offline` task names.

Run:

```bash
node --test scripts/docs-workflow/guides-assembly-identity.test.js scripts/docs-workflow/guides-stage-artifact.test.js scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-progress-state.test.js scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
node -e "const fs=require('node:fs'),yaml=require('js-yaml'); for (const f of ['.github/workflows/_fetch-guides-sources.yml','.github/workflows/_assemble-guides.yml']) yaml.load(fs.readFileSync(f,'utf8'))"
```

Expected: PASS.

Commit:

```bash
git add .github/workflows/_fetch-guides-sources.yml .github/workflows/_assemble-guides.yml scripts/collect-build-card-notes.js scripts/collect-build-card-notes.test.js scripts/docs-workflow/docs-progress-state.js scripts/docs-workflow/docs-progress-state.test.js scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "feat(guides): observe sidebar reuse decisions"
```

### Task 7: Run the observe-only external gate

**Files:**
- No code changes unless evidence finds a defect.

- [ ] **Step 1: Run a zero-delta disposable workflow**

Verify the decision is `reuse`, generation still runs, regenerated bytes equal both committed sidebar hashes, the descriptor is preserved, and indexed generation timing is recorded.

- [ ] **Step 2: Run a changed-navigation/table workflow**

Verify the decision is `regenerate` when parent, order, label, targets, progress, link/ref, table digest, table count, or source delta changes.

- [ ] **Step 3: Have Hooke review both run artifacts and logs**

Do not enable reuse until Hooke confirms the baseline SHA, master SHA, projection hashes, sidebar hashes, and result report agree.

### Task 8: Enable proven sidebar reuse

**Files:**
- Modify: `.github/workflows/_assemble-guides.yml`
- Modify: `scripts/validate-workflow-policy.js`
- Test: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/docs-workflow/docs-progress-state.js`
- Test: `scripts/docs-workflow/docs-progress-state.test.js`

- [ ] **Step 1: Add failing mutually exclusive branch tests**

Require exact steps:

```text
Validate Guides assembly decision
Reuse unchanged Guides assembly
Generate combined Guides sidebars offline
Finalize Guides assembly identity
Validate combined guides output
```

Assert reuse and generation conditions are mutually exclusive and final validation is unconditional.

- [ ] **Step 2: Run policy tests and confirm failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/docs-progress-state.test.js
```

Expected: FAIL while assembly remains observe-only.

- [ ] **Step 3: Implement the reuse branch**

For `mode=reuse`, copy only the exact baseline descriptor and two sidebar files, then run `verify-descriptor` against all three hashes. For `mode=regenerate`, call the combined generator and write a new descriptor. Both branches converge on unconditional sidebar validation and the existing production build.

- [ ] **Step 4: Run full milestone tests and commit**

Run:

```bash
node plugins/lark-docs/larkSourceIndex.test.js
node plugins/lark-docs/larkDocWriter.test.js
node plugins/lark-docs/larkDocWriter.beta.test.js
node scripts/doc-publish-bot/publishRequest.test.js
node scripts/doc-publish-bot/publishJob.test.js
node --test \
  scripts/docs-workflow/generate-guides-sidebars.test.js \
  scripts/docs-workflow/guides-assembly-identity.test.js \
  scripts/docs-workflow/content-groups.test.js \
  scripts/docs-workflow/guides-stage-artifact.test.js \
  scripts/restore-generated-state.test.js \
  scripts/docs-workflow/docs-progress-state.test.js \
  scripts/collect-build-card-notes.test.js \
  scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
git diff --check
```

Expected: PASS.

Commit:

```bash
git add .github/workflows/_assemble-guides.yml scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js scripts/docs-workflow/docs-progress-state.js scripts/docs-workflow/docs-progress-state.test.js
git commit -m "perf(guides): reuse proven sidebar assembly"
```

### Task 9: Verify one real zero-delta reuse

**Files:**
- Modify only for a test-backed defect.

- [ ] **Step 1: Trigger one zero-delta Guides workflow with unchanged `master_sha`**

Expected log path:

```text
Evaluate Guides assembly reuse: reuse
Reuse unchanged Guides assembly: success
Generate combined Guides sidebars offline: skipped
Validate combined guides output: success
```

- [ ] **Step 2: Compare timing and card state**

Record the prior `Generate combined Guides sidebars offline` duration and the new reuse-step duration. Confirm the Feishu card says `Sidebar reused` and never claims reuse if the descriptor proof failed.
