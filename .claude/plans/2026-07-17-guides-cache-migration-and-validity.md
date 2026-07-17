# Guides Cache Migration and Independent Validity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse a complete snapshot-matched Guides source cache across the v1-to-v2 media-cache migration and make only source invalidity trigger a full Feishu source fetch.

**Architecture:** Refactor the Guides cache helper into independent source and media validators, restore exact v2 then exact v1 cache entries, and expose separate workflow outputs for source and media validity. Valid legacy sources continue through normal incremental planning while media is reconstructed from baseline docs and the current render scope; assembly remains the only writer of promoted v2 caches.

**Tech Stack:** Node.js 20 CommonJS, `node:test`, GitHub Actions cache v4, Docusaurus Guides snapshots, SHA-256 cache manifests, existing Guides media prefetcher.

---

## File map and invariants

**Modify**

- `scripts/docs-workflow/guides-source-cache.js` — versioned key generation, source-only validation, media-only validation, and strict CLI parsing.
- `scripts/docs-workflow/guides-source-cache.test.js` — v1 migration, strict v2, source tampering, media tampering, and CLI tests.
- `.github/workflows/_fetch-guides-sources.yml` — v2-first/v1-fallback restore and independent source/media decisions.
- `scripts/validate-workflow-policy.js` — require the new restore and decision boundaries.
- `scripts/validate-workflow-policy.test.js` — executable workflow policy regression tests.
- `scripts/docs-workflow/guides-media-prefetch.test.js` — prove baseline reconstruction plus incremental refresh when no previous media manifest exists.

**Do not modify**

- `plugins/lark-docs/incrementalFetchPlanner.js`; it already honors `forceFull` correctly.
- `scripts/docs-workflow/monitor-docs-progress.js`; cache selection is a producer concern.
- `_assemble-guides.yml` cache-save ordering, except for assertions needed to prove it still writes schema v2 only.

**Non-negotiable invariants**

- `--force-full-fetch` depends only on `source_valid`.
- A v1 cache is accepted only after full source manifest and source-completeness validation.
- Invalid media never deletes valid sources.
- Invalid sources always delete source state and select full bootstrap.
- Only validated assembly saves the promoted v2 cache.

### Task 1: Split source and media cache validation

**Files:**

- Modify: `scripts/docs-workflow/guides-source-cache.test.js`
- Modify: `scripts/docs-workflow/guides-source-cache.js`

- [ ] **Step 1: Extend the fixture to create schema-v1 and schema-v2 manifests**

Add a helper that writes the legacy manifest shape using the same source file inventory:

```js
function writeLegacyManifest(f, manifestPath) {
  const snapshot = JSON.parse(fs.readFileSync(f.snapshotPath, 'utf8'))
  const files = fs.readdirSync(f.sourceDir).filter(file => file.endsWith('.json')).sort().map(file => {
    const bytes = fs.readFileSync(path.join(f.sourceDir, file))
    return {
      path: file,
      size: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    }
  })
  fs.writeFileSync(manifestPath, `${JSON.stringify({
    schemaVersion: 1,
    manual: 'guides',
    buildEnv: 'uat',
    snapshotHash: require('../../plugins/lark-docs/sourceCompleteness').hashSnapshot(snapshot),
    createdAt: '2026-07-14T00:00:00.000Z',
    files,
  }, null, 2)}\n`)
}
```

- [ ] **Step 2: Write failing tests for versioned keys and explicit v1 acceptance**

Import the planned APIs:

```js
const {
  sourceCacheKey,
  createSourceCacheManifest,
  validateMediaCache,
  validateSourceCache,
} = require('./guides-source-cache')
```

Add assertions:

```js
test('uses one snapshot hash with explicit v1 and v2 key prefixes', () => {
  const f = fixture()
  const v1 = sourceCacheKey(f.snapshotPath, { version: 1 })
  const v2 = sourceCacheKey(f.snapshotPath, { version: 2 })
  assert.match(v1, /^guides-source-v1-[0-9a-f]{64}$/)
  assert.equal(v2.replace('guides-source-v2-', ''), v1.replace('guides-source-v1-', ''))
})

test('accepts a valid v1 source cache only when schema 1 is explicitly allowed', () => {
  const f = fixture()
  const manifestPath = path.join(f.root, 'legacy-manifest.json')
  writeLegacyManifest(f, manifestPath)
  assert.throws(() => validateSourceCache({
    sourceDir: f.sourceDir,
    snapshotPath: f.snapshotPath,
    manifestPath,
    rootToken: 'root',
    acceptedSchemaVersions: [2],
  }), /identity/i)
  assert.equal(validateSourceCache({
    sourceDir: f.sourceDir,
    snapshotPath: f.snapshotPath,
    manifestPath,
    rootToken: 'root',
    acceptedSchemaVersions: [1, 2],
  }).complete, true)
})
```

- [ ] **Step 3: Write failing tests proving media validation is independent**

Create a valid v2 manifest, corrupt only `guides.json`, and assert:

```js
assert.equal(validateSourceCache({
  sourceDir: f.sourceDir,
  snapshotPath: f.snapshotPath,
  manifestPath,
  rootToken: 'root',
  acceptedSchemaVersions: [2],
}).complete, true)

assert.throws(() => validateMediaCache({
  sourceDir: f.sourceDir,
  snapshotPath: f.snapshotPath,
  manifestPath,
  mediaManifestPath: f.mediaManifestPath,
}), /media manifest|coverage/i)
```

- [ ] **Step 4: Run the focused tests and verify the new contract fails**

Run:

```bash
node --test scripts/docs-workflow/guides-source-cache.test.js
```

Expected: FAIL because `sourceCacheKey` does not accept a version and `validateMediaCache` is not exported.

- [ ] **Step 5: Implement versioned keys and source-only validation**

Replace the fixed key helper with:

```js
function sourceCacheKey(snapshotPath, { version = 2 } = {}) {
  if (![1, 2].includes(version)) throw new Error(`Unsupported Guides source cache version: ${version}`)
  return `guides-source-v${version}-${hashSnapshot(readSnapshot(snapshotPath))}`
}
```

Change `validateSourceCache` to validate only manifest identity, snapshot hash,
the exact source inventory, and `assertSourceCompleteness`:

```js
function validateSourceCache({
  sourceDir,
  snapshotPath,
  manifestPath,
  rootToken,
  acceptedSchemaVersions = [2],
}) {
  const snapshot = readSnapshot(snapshotPath)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (!acceptedSchemaVersions.includes(manifest.schemaVersion) || manifest.manual !== 'guides' || manifest.buildEnv !== 'uat') {
    throw new Error('Source cache manifest identity is invalid')
  }
  if (manifest.snapshotHash !== hashSnapshot(snapshot)) throw new Error('Source cache snapshot identity mismatch')
  if (JSON.stringify(sourceFiles(sourceDir)) !== JSON.stringify(manifest.files)) {
    throw new Error('Source cache is invalid: file manifest mismatch')
  }
  return assertSourceCompleteness({ manual: 'guides', buildEnv: 'uat', rootToken, sourceDir, snapshot })
}
```

- [ ] **Step 6: Implement strict media-only validation**

Add:

```js
function validateMediaCache({ sourceDir, snapshotPath, manifestPath, mediaManifestPath }) {
  const snapshot = readSnapshot(snapshotPath)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (manifest.schemaVersion !== 2 || manifest.manual !== 'guides' || manifest.buildEnv !== 'uat' || !manifest.mediaManifest) {
    throw new Error('Source cache does not contain v2 media identity')
  }
  if (manifest.snapshotHash !== hashSnapshot(snapshot)) throw new Error('Source cache snapshot identity mismatch')
  const actualMedia = mediaManifestFile(mediaManifestPath, sourceDir, snapshot)
  if (JSON.stringify(actualMedia) !== JSON.stringify(manifest.mediaManifest)) {
    throw new Error('Source cache is invalid: media manifest mismatch')
  }
  return actualMedia
}
```

Keep `createSourceCacheManifest` strict schema v2 and export all four public APIs.

- [ ] **Step 7: Extend the CLI without weakening argument validation**

Support these dispatch branches:

```js
if (input.operation === 'key') {
  process.stdout.write(sourceCacheKey(input.snapshot, { version: Number(input.version || 2) }))
} else if (input.operation === 'validate-source') {
  validateSourceCache({
    sourceDir: input['source-dir'],
    snapshotPath: input.snapshot,
    manifestPath: input.manifest,
    rootToken: input['root-token'],
    acceptedSchemaVersions: String(input.schemas || '2').split(',').map(Number),
  })
} else if (input.operation === 'validate-media') {
  validateMediaCache({
    sourceDir: input['source-dir'],
    snapshotPath: input.snapshot,
    manifestPath: input.manifest,
    mediaManifestPath: input['media-manifest'],
  })
}
```

Retain `validate` as a temporary compatibility alias that runs source validation
with schema 2 followed by media validation. Reject schema values other than 1 or
2 before reading cache files.

- [ ] **Step 8: Run focused tests**

Run:

```bash
node --test scripts/docs-workflow/guides-source-cache.test.js
```

Expected: all Guides source-cache tests PASS.

- [ ] **Step 9: Commit the cache contract**

```bash
git add scripts/docs-workflow/guides-source-cache.js scripts/docs-workflow/guides-source-cache.test.js
git commit -m "fix: separate Guides source and media cache validity"
```

### Task 2: Restore v2 first and v1 only on an exact miss

**Files:**

- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `.github/workflows/_fetch-guides-sources.yml`

- [ ] **Step 1: Write failing workflow assertions for both exact keys**

In `guides workflows bootstrap full sources and persist only verified caches`,
replace the single-cache assertions with:

```js
assert.match(source, /id: source_cache_keys[\s\S]*--version 2[\s\S]*--version 1/)
assert.match(source, /id: source_cache_v2[\s\S]*actions\/cache\/restore@v4[\s\S]*steps\.source_cache_keys\.outputs\.v2/)
assert.match(source, /id: source_cache_v1[\s\S]*if:.*source_cache_v2\.outputs\.cache-hit != 'true'[\s\S]*steps\.source_cache_keys\.outputs\.v1/)
assert.match(source, /id: source_cache_check[\s\S]*source_valid[\s\S]*media_valid[\s\S]*cache_version/)
assert.match(source, /args\+=\(--force-full-fetch\)[\s\S]*steps\.source_cache_check\.outputs\.source_valid/)
assert.doesNotMatch(source, /args\+=\(--force-full-fetch\)[\s\S]{0,200}media_valid/)
```

- [ ] **Step 2: Run the workflow policy test and verify failure**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because `_fetch-guides-sources.yml` still has one combined cache restore and one `valid` output.

- [ ] **Step 3: Compute both cache keys in one step**

Replace `source_cache_key` with `source_cache_keys`:

```yaml
      - id: source_cache_keys
        name: Compute Guides source cache keys
        run: |
          snapshot=plugins/lark-docs/meta/snapshots/guides-uat-last-success.json
          if [[ -f "$snapshot" ]]; then
            v2=$(node scripts/docs-workflow/guides-source-cache.js key --snapshot "$snapshot" --version 2)
            v1=$(node scripts/docs-workflow/guides-source-cache.js key --snapshot "$snapshot" --version 1)
          else
            v2="guides-source-v2-bootstrap-${{ inputs.dev_baseline_sha }}"
            v1="guides-source-v1-bootstrap-${{ inputs.dev_baseline_sha }}"
          fi
          printf 'v2=%s\nv1=%s\n' "$v2" "$v1" >> "$GITHUB_OUTPUT"
```

- [ ] **Step 4: Add exact v2 and conditional exact v1 restores**

Use the same fixed paths for both actions:

```yaml
      - id: source_cache_v2
        uses: actions/cache/restore@v4
        with:
          path: |
            plugins/lark-docs/meta/sources/guides
            plugins/lark-docs/meta/source-cache/guides-manifest.json
            plugins/lark-docs/meta/media-cache/guides.json
          key: ${{ steps.source_cache_keys.outputs.v2 }}
      - id: source_cache_v1
        if: ${{ steps.source_cache_v2.outputs.cache-hit != 'true' }}
        uses: actions/cache/restore@v4
        with:
          path: |
            plugins/lark-docs/meta/sources/guides
            plugins/lark-docs/meta/source-cache/guides-manifest.json
          key: ${{ steps.source_cache_keys.outputs.v1 }}
```

Do not add `restore-keys`; cache identity must remain exact.

- [ ] **Step 5: Produce independent source and media outputs**

Replace the combined validation shell with logic equivalent to:

```bash
source_valid=false
media_valid=false
cache_version=none
snapshot=plugins/lark-docs/meta/snapshots/guides-uat-last-success.json
manifest=plugins/lark-docs/meta/source-cache/guides-manifest.json
media=plugins/lark-docs/meta/media-cache/guides.json

if [[ "${{ steps.source_cache_v2.outputs.cache-hit }}" == true ]]; then
  cache_version=v2
elif [[ "${{ steps.source_cache_v1.outputs.cache-hit }}" == true ]]; then
  cache_version=v1
fi

if [[ "$cache_version" != none && -f "$snapshot" && -f "$manifest" ]]; then
  schemas=2
  [[ "$cache_version" == v1 ]] && schemas=1,2
  if node scripts/docs-workflow/guides-source-cache.js validate-source \
    --source-dir plugins/lark-docs/meta/sources/guides \
    --snapshot "$snapshot" --manifest "$manifest" \
    --root-token Tg6mwbRGDitPQ3kLUQzc44I7nth --schemas "$schemas"; then
    source_valid=true
  fi
fi

if [[ "$source_valid" == true && "$cache_version" == v2 && -f "$media" ]]; then
  if node scripts/docs-workflow/guides-source-cache.js validate-media \
    --source-dir plugins/lark-docs/meta/sources/guides \
    --snapshot "$snapshot" --manifest "$manifest" --media-manifest "$media"; then
    media_valid=true
  fi
fi

if [[ "$source_valid" != true ]]; then
  rm -rf plugins/lark-docs/meta/sources/guides plugins/lark-docs/meta/source-cache
fi
if [[ "$media_valid" != true ]]; then
  rm -rf plugins/lark-docs/meta/media-cache
fi
printf 'source_valid=%s\nmedia_valid=%s\ncache_version=%s\n' \
  "$source_valid" "$media_valid" "$cache_version" >> "$GITHUB_OUTPUT"
echo "[source-cache] source=$source_valid media=$media_valid version=$cache_version"
```

- [ ] **Step 6: Make only source validity select full fetch**

Use:

```bash
args=(--group guides --stage source)
if [[ "${{ steps.source_cache_check.outputs.source_valid }}" != true ]]; then
  echo "[source-cache] Source graph unavailable; forcing full bootstrap fetch."
  args+=(--force-full-fetch)
fi
node scripts/docs-workflow/run-content-group.js "${args[@]}"
```

Keep media prefetch after source fetching. Its `--previous-manifest` input may
point to a missing file because the prefetcher already treats that as an empty
manifest. Set `--reuse-existing` from source validity exactly as before:

```yaml
--reuse-existing "${{ steps.source_cache_check.outputs.source_valid != 'true' }}"
```

- [ ] **Step 7: Run policy tests**

Run:

```bash
node --test scripts/validate-workflow-policy.test.js scripts/docs-workflow/guides-source-cache.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit the workflow migration**

```bash
git add .github/workflows/_fetch-guides-sources.yml scripts/validate-workflow-policy.test.js
git commit -m "fix: migrate Guides source caches without full fetch"
```

### Task 3: Enforce the new workflow boundary in the policy validator

**Files:**

- Modify: `scripts/validate-workflow-policy.test.js`
- Modify: `scripts/validate-workflow-policy.js`

- [ ] **Step 1: Add failing validator fixture cases**

Create temporary workflow variants that each violate one rule:

1. remove the v1 fallback restore;
2. make `--force-full-fetch` depend on `media_valid`;
3. delete both sources and media when only media validation fails;
4. allow `restore-keys` prefix fallback.

For each variant, run `validateWorkflowPolicies(directory)` and assert a specific
message:

```js
assert.match(errors.join('\n'), /v1 exact migration fallback/)
assert.match(errors.join('\n'), /full fetch must depend only on source validity/)
assert.match(errors.join('\n'), /media invalidation must preserve source files/)
assert.match(errors.join('\n'), /Guides source cache restore must remain exact/)
```

- [ ] **Step 2: Run the policy tests and verify failure**

```bash
node --test scripts/validate-workflow-policy.test.js
```

Expected: FAIL because the validator does not yet enforce the new rules.

- [ ] **Step 3: Add bounded source-workflow policy checks**

Inside the existing `_fetch-guides-sources.yml` block, add checks for:

```js
if (!/id: source_cache_v2[\s\S]*id: source_cache_v1/.test(guidesSource)) {
  errors.push('_fetch-guides-sources.yml: Guides source cache requires a v1 exact migration fallback')
}
if (/restore-keys:/.test(guidesSource)) {
  errors.push('_fetch-guides-sources.yml: Guides source cache restore must remain exact')
}
if (!/source_valid[\s\S]*args\+=\(--force-full-fetch\)/.test(guidesSource) || /media_valid[^\n]*[\s\S]{0,180}args\+=\(--force-full-fetch\)/.test(guidesSource)) {
  errors.push('_fetch-guides-sources.yml: full fetch must depend only on source validity')
}
const validationBlock = guidesSource.slice(
  guidesSource.indexOf('id: source_cache_check'),
  guidesSource.indexOf('name: Fetch shared guides sources'),
)
if (!/media_valid[\s\S]*rm -rf plugins\/lark-docs\/meta\/media-cache/.test(validationBlock) ||
    /media_valid[\s\S]{0,240}rm -rf plugins\/lark-docs\/meta\/sources\/guides/.test(validationBlock)) {
  errors.push('_fetch-guides-sources.yml: media invalidation must preserve source files')
}
```

- [ ] **Step 4: Run the complete policy suite**

```bash
node scripts/validate-workflow-policy.js
node --test scripts/validate-workflow-policy.test.js
```

Expected: validator prints `All GitHub Actions workflows satisfy documentation production policy.` and tests PASS.

- [ ] **Step 5: Commit the policy guard**

```bash
git add scripts/validate-workflow-policy.js scripts/validate-workflow-policy.test.js
git commit -m "test: enforce Guides cache migration boundaries"
```

### Task 4: Prove media reconstruction works without a previous manifest

**Files:**

- Modify: `scripts/docs-workflow/guides-media-prefetch.test.js`

- [ ] **Step 1: Add a regression test for migrated v1 sources**

Create source files for `unchanged` and `changed`, baseline Markdown containing
an existing image for `unchanged`, and an incremental plan that expands only
`changed`. Invoke `prefetchGuidesMedia` with no previous manifest and
`reuseExisting: false`.

Use a fake downloader that records requested tokens. Assert:

```js
assert.deepEqual(downloadedTokens, ['changed-image'])
assert.deepEqual(manifest.entries.map(entry => entry.id).sort(), [
  'feishu-image:changed-image',
  'feishu-image:unchanged-image',
])
```

This proves baseline docs seed unchanged entries while the current incremental
scope is downloaded rather than reused.

- [ ] **Step 2: Run the focused test before changing implementation**

```bash
node --test scripts/docs-workflow/guides-media-prefetch.test.js
```

Expected: PASS if the existing bootstrap behavior already satisfies the new
contract. If it fails, the failure must identify either missing baseline merge
or incorrect selected-source download behavior; change only that behavior.

- [ ] **Step 3: Run the complete Guides workflow regression set**

```bash
node --test \
  scripts/docs-workflow/guides-source-cache.test.js \
  scripts/docs-workflow/guides-media-prefetch.test.js \
  scripts/docs-workflow/run-content-group.test.js \
  scripts/validate-workflow-policy.test.js
node scripts/validate-workflow-policy.js
```

Expected: all tests PASS and workflow policy validation succeeds.

- [ ] **Step 4: Inspect workflow expressions and cache paths**

```bash
git diff --check
git diff -- .github/workflows/_fetch-guides-sources.yml scripts/docs-workflow/guides-source-cache.js scripts/docs-workflow/guides-media-prefetch.test.js scripts/validate-workflow-policy.js
```

Expected: no whitespace errors; cache paths contain only Guides sources,
source manifest, and media manifest; no credentials were added to cache actions.

- [ ] **Step 5: Commit final regression coverage**

```bash
git add scripts/docs-workflow/guides-media-prefetch.test.js
git commit -m "test: cover Guides media reconstruction after cache migration"
```

### Task 5: Disposable-branch workflow verification

**Files:**

- No repository files expected.

- [ ] **Step 1: Run artifact-only Guides against a branch with v1 but no v2 cache**

Dispatch `fetch lark docs` with:

```text
group=guides
publish=false
target_branch=<disposable branch>
tooling_ref=<implementation branch>
```

Expected source log:

```text
[source-cache] source=true media=false version=v1
```

Expected plan: `mode: incremental`; it must not contain `Forced full fetch requested.`

- [ ] **Step 2: Verify assembly saved a v2 key**

Inspect `Save promoted guides source cache`.

Expected: `Cache saved with key: guides-source-v2-<64 lowercase hex characters>`.
This key belongs to the candidate snapshot created by the artifact-only run; it
does not replace the target branch's committed baseline snapshot.

- [ ] **Step 3: Run the same artifact-only dispatch again**

Expected source log:

```text
[source-cache] source=true media=false version=v1
```

Expected: no full source bootstrap and no source completeness warning. Reusing
the exact v1 baseline is acceptable until a publish run advances the branch to
the candidate snapshot.

- [ ] **Step 4: Publish the candidate on the disposable branch and run once more**

Expected: after the published candidate snapshot becomes the branch baseline,
the next run logs:

```text
[source-cache] source=true media=true version=v2
```

- [ ] **Step 5: Record run URLs in the pull request description**

Include both run URLs and the plan summaries. Do not commit generated Guides
content from the disposable branch into the implementation branch.
