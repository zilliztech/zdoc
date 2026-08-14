# zdoc Integrated OpenAPI Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the partial upload-time merge with one deterministic integrated-spec builder that publishes latest zdoc/Zilliz specs and minor-track Milvus specs in English and Chinese, while leaving zdoc REST pages latest-only.

**Architecture:** Split pure OpenAPI transformation from filesystem and S3 effects. A lifecycle module validates and filters track-aware objects, a component graph prunes unreachable definitions, and an integrated builder applies `latest` or `track` source policy before localization and deterministic serialization. Artifact writing and S3 upload consume the exact same bytes and manifest.

**Tech Stack:** Node.js CommonJS for REST generation modules, `node:test`, Commander, AWS SDK v3, existing docs-tooling CLI/Vitest publication tests.

**Approved design:** `.claude/superpowers/specs/2026-08-14-milvus-rest-track-publication-design.md`

---

## File Map

- Create `packages/docs-tooling/src/reference/rest/releaseTrack.js`: strict minor-track parsing/comparison.
- Create `packages/docs-tooling/src/reference/rest/lifecycle.js`: lifecycle validation, visibility, deprecation, recursive field filtering, and required-array repair.
- Create `packages/docs-tooling/src/reference/rest/componentGraph.js`: reachable-ref collection, pruning, and dangling-ref validation.
- Create `packages/docs-tooling/src/reference/rest/integratedSpecBuilder.js`: shared `latest`/`track` transformation pipeline and deterministic serialization.
- Create `packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.js`: filenames, manifests, atomic local writes, and SHA256 calculation.
- Create `packages/docs-tooling/src/reference/rest/integratedSpecPublisher.js`: orchestrate builder, local artifacts, optional S3, and compatibility aliases.
- Create focused `*.test.js` files beside those modules.
- Modify `packages/docs-tooling/src/reference/rest/s3Uploader.js`: reduce it to injected-client upload of prepared artifacts.
- Modify `packages/docs-tooling/src/reference/rest/index.js`: keep page generation compatible and add explicit integrated-spec command/options.
- Modify `packages/docs-tooling/src/reference/rest/specLoader.js`: preserve supported top-level OpenAPI objects consistently when merging fragments.
- Modify `packages/docs-tooling/src/reference/rest/scripts/prune-components.js`: reuse `componentGraph.js` instead of maintaining separate reachability logic.
- Modify `packages/docs-tooling/src/reference/rest/CUSTOM_ATTRIBUTES.md`: document lifecycle attributes and integrated publication policies.
- Modify `packages/docs-tooling/src/validation/validation.test.ts`: prove the existing REST page publication adapter arguments remain unchanged.
- Add test fixtures under `packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/`; production track snapshots are created only by the bootstrap migration plan.

## Task 1: Add release-track and lifecycle validation primitives

**Files:**
- Create: `packages/docs-tooling/src/reference/rest/releaseTrack.js`
- Create: `packages/docs-tooling/src/reference/rest/lifecycle.js`
- Test: `packages/docs-tooling/src/reference/rest/lifecycle.test.js`

- [ ] **Step 1: Write failing track and lifecycle tests**

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyLifecycleForTrack,
  validateLifecycle,
} = require('./lifecycle');
const {compareReleaseTracks, normalizeReleaseTrack} = require('./releaseTrack');

test('minor tracks compare numerically and reject patches', () => {
  assert.equal(normalizeReleaseTrack('v2.6.x'), '2.6.x');
  assert.equal(compareReleaseTracks('2.10.x', '2.6.x'), 1);
  assert.throws(() => normalizeReleaseTrack('2.6.22'), /REST_RELEASE_TRACK_INVALID/);
});

test('added fields are omitted before their track and removed from required', () => {
  const schema = {
    type: 'object',
    required: ['collectionName', 'functionChains'],
    properties: {
      collectionName: lifecycleField('2.6.x', {type: 'string'}),
      functionChains: lifecycleField('3.0.x', {type: 'array', items: {type: 'object'}}),
    },
  };
  const filtered = applyLifecycleForTrack(schema, '2.6.x', '#/components/schemas/SearchRequest');
  assert.deepEqual(Object.keys(filtered.value.properties), ['collectionName']);
  assert.deepEqual(filtered.value.required, ['collectionName']);
  assert.equal(filtered.stats.omittedElements, 1);
});

test('deprecated elements remain and receive standard OpenAPI deprecation', () => {
  const operation = lifecycleObject('2.6.x', '3.0.x', {responses: {}});
  const filtered = applyLifecycleForTrack(operation, '3.0.x', '#/paths/~1search/post');
  assert.equal(filtered.value.deprecated, true);
});
```

Add failure cases for malformed values, missing attributes in managed scope, invalid ordering, `deprecated: true` without `x-deprecated-since`, and a retained `required` name without a retained property.

- [ ] **Step 2: Verify failure**

```bash
node --test packages/docs-tooling/src/reference/rest/lifecycle.test.js
```

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement `releaseTrack.js`**

Match the approved `^v?(\d+)\.(\d+)\.x$` syntax, normalize away the optional `v`, and compare numeric major/minor pairs.

- [ ] **Step 4: Implement lifecycle validation**

Export:

```javascript
validateLifecycle(node, jsonPointer, {required})
applyLifecycleForTrack(node, releaseTrack, jsonPointer, options)
```

`validateLifecycle` returns normalized values or throws errors containing the exact JSON pointer. Enforce:

```text
added <= lastModified
added <= deprecatedSince when non-null
lastModified <= deprecatedSince when non-null
```

- [ ] **Step 5: Implement recursive filtering**

Requirements:

- omit managed objects whose `x-added-at` is after the target;
- retain deprecated objects and set `deprecated: true` where valid;
- recurse through schema `properties`, `items`, object combinator branches, parameters, request bodies, responses, headers, and reusable components;
- repair `required` arrays after property omission;
- preserve `$ref` wrappers and siblings;
- return `{value, stats}` without mutating the input.

- [ ] **Step 6: Run focused tests**

Expected: all lifecycle tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/docs-tooling/src/reference/rest/releaseTrack.js \
  packages/docs-tooling/src/reference/rest/lifecycle.js \
  packages/docs-tooling/src/reference/rest/lifecycle.test.js
git commit -m "feat(rest): add minor-track lifecycle filtering"
```

## Task 2: Extract reusable component graph and validation

**Files:**
- Create: `packages/docs-tooling/src/reference/rest/componentGraph.js`
- Test: `packages/docs-tooling/src/reference/rest/componentGraph.test.js`
- Modify: `packages/docs-tooling/src/reference/rest/scripts/prune-components.js`

- [ ] **Step 1: Write failing graph tests**

Cover:

```javascript
const refs = collectReachableRefs(spec);
assert.deepEqual([...refs].sort(), [
  '#/components/responses/SearchResponse',
  '#/components/schemas/SearchResult',
]);

const {spec: pruned, stats} = pruneUnreachableComponents(spec);
assert.ok(pruned.components.schemas.SearchResult);
assert.equal(pruned.components.schemas.Unused, undefined);
assert.equal(stats.removed, 1);

assert.throws(
  () => assertNoDanglingLocalRefs(specWithMissingRef),
  /REST_OPENAPI_REF_MISSING.*#\/components\/schemas\/Missing/,
);
```

Include cyclic component refs and `securitySchemes` preservation.

- [ ] **Step 2: Verify failure**

```bash
node --test packages/docs-tooling/src/reference/rest/componentGraph.test.js
```

- [ ] **Step 3: Implement pure graph functions**

Export:

```javascript
collectReachableRefs(spec)
pruneUnreachableComponents(spec)
assertNoDanglingLocalRefs(spec)
```

Walk from `paths`, `webhooks`, top-level `security`, and callbacks as applicable. Preserve all referenced component categories and all security schemes. Never mutate the caller's object.

- [ ] **Step 4: Refactor the maintenance script**

Replace its local graph implementation with imports from `componentGraph.js`. Preserve its CLI output and default directory behavior.

- [ ] **Step 5: Run graph and script regressions**

```bash
node --test packages/docs-tooling/src/reference/rest/componentGraph.test.js
node packages/docs-tooling/src/reference/rest/scripts/prune-components.js \
  packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/prune-input
```

Expected: tests pass and the fixture-only command reports deterministic kept/removed counts.

- [ ] **Step 6: Commit**

```bash
git add packages/docs-tooling/src/reference/rest/componentGraph.js \
  packages/docs-tooling/src/reference/rest/componentGraph.test.js \
  packages/docs-tooling/src/reference/rest/scripts/prune-components.js \
  packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/prune-input
git commit -m "refactor(rest): share OpenAPI component pruning"
```

## Task 3: Preserve complete top-level OpenAPI data during fragment merge

**Files:**
- Modify: `packages/docs-tooling/src/reference/rest/specLoader.js`
- Modify: `packages/docs-tooling/src/reference/rest/specLoader.test.js`

- [ ] **Step 1: Add failing merge tests**

Add fragments containing `externalDocs`, `security`, `webhooks`, and extension metadata plus existing `openapi`, `info`, `servers`, `tags`, `paths`, and `components`. Assert the loader:

- preserves singleton top-level fields from the first fragment unless later identical values repeat;
- merges `paths`, `webhooks`, and component categories by key;
- concatenates tags without duplicate tag names;
- rejects conflicting `openapi` versions or incompatible `info` objects with `REST_SPEC_TOP_LEVEL_CONFLICT`.

- [ ] **Step 2: Run and observe failure**

```bash
node packages/docs-tooling/src/reference/rest/specLoader.test.js
```

- [ ] **Step 3: Implement explicit top-level merge policy**

Do not use a generic deep merge. Add named handlers for singleton, keyed-map, and tag-list fields so conflicts produce precise messages.

- [ ] **Step 4: Run loader and existing REST tests**

```bash
node packages/docs-tooling/src/reference/rest/specLoader.test.js
node packages/docs-tooling/src/reference/rest/on-demand-cluster-segment.test.js
```

- [ ] **Step 5: Commit**

```bash
git add packages/docs-tooling/src/reference/rest/specLoader.js \
  packages/docs-tooling/src/reference/rest/specLoader.test.js
git commit -m "fix(rest): preserve complete OpenAPI fragment metadata"
```

## Task 4: Build one integrated spec for latest and track policies

**Files:**
- Create: `packages/docs-tooling/src/reference/rest/integratedSpecBuilder.js`
- Create: `packages/docs-tooling/src/reference/rest/integratedSpecBuilder.test.js`
- Create: `packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/canonical.json`
- Create: `packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/milvus-2.6.x.json`
- Create: `packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/milvus-3.0.x.json`

- [ ] **Step 1: Write failing policy tests**

```javascript
const latest = buildIntegratedSpec(canonical, {
  publicationPolicy: 'latest', target: 'zilliz', language: 'en-US', apiSurface: 'v2',
});
assert.equal(latest.releaseTrack, null);
assert.ok(latest.spec.paths['/v2/projects']);
assert.equal(latest.spec.paths['/v1/clusters'], undefined);

const track26 = buildIntegratedSpec(snapshot26, {
  publicationPolicy: 'track', target: 'milvus', language: 'en-US', releaseTrack: '2.6.x',
});
assert.equal(
  track26.spec.components.schemas.SearchRequest.properties.functionChains,
  undefined,
);

assert.throws(
  () => buildIntegratedSpec(canonical, {publicationPolicy: 'latest', releaseTrack: '2.6.x'}),
  /REST_LATEST_POLICY_REJECTS_TRACK/,
);
assert.throws(
  () => buildIntegratedSpec(snapshot26, {publicationPolicy: 'track'}),
  /REST_TRACK_POLICY_REQUIRES_TRACK/,
);
assert.throws(
  () => buildIntegratedSpec(snapshot26, {
    publicationPolicy: 'track', target: 'milvus', releaseTrack: '2.6.x', apiSurface: 'v2',
  }),
  /REST_TRACK_POLICY_REJECTS_API_SURFACE/,
);
```

- [ ] **Step 2: Add localization and target tests**

Assert:

- `zh-CN` applies nested `x-i18n.zh-CN` values before removing `x-i18n`;
- `en-US` retains English text;
- target filtering works for tags, operations, parameters, properties, and examples;
- `x-include-langs` works independently of target filtering;
- public output strips internal `x-*` authoring metadata but retains standard `deprecated`;
- required referenced components survive pruning.

- [ ] **Step 3: Verify failure**

```bash
node --test packages/docs-tooling/src/reference/rest/integratedSpecBuilder.test.js
```

- [ ] **Step 4: Implement the shared pipeline**

Export:

```javascript
buildIntegratedSpec(specifications, {
  publicationPolicy,
  target,
  language,
  apiSurface,
  releaseTrack,
})
```

Pipeline order:

1. validate policy options (`latest` requires `apiSurface: v1|v2`; `track` rejects it);
2. deep clone input;
3. filter target and language;
4. validate lifecycle metadata;
5. apply lifecycle filtering only for `track`;
6. apply localization;
7. remove internal authoring extensions;
8. prune unreachable components;
9. assert no dangling refs;
10. return spec plus sorted endpoint/method inventory and stats.

The `latest` policy validates lifecycle values that exist but does not require the entire legacy corpus to be populated until bootstrap enforcement is enabled.

- [ ] **Step 5: Run focused tests**

Expected: all policy, target, lifecycle, and localization tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/docs-tooling/src/reference/rest/integratedSpecBuilder.js \
  packages/docs-tooling/src/reference/rest/integratedSpecBuilder.test.js \
  packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec
git commit -m "feat(rest): build latest and track OpenAPI specs"
```

## Task 5: Add deterministic local artifacts and manifests

**Files:**
- Create: `packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.js`
- Test: `packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.test.js`

- [ ] **Step 1: Write failing artifact tests**

Assert exact filenames:

```text
latest zilliz v2 en-US: openapi-zilliz-v2-en-US.json
latest zilliz v2 zh-CN: openapi-zilliz-v2-zh-CN.json
track milvus 2.6.x en-US: openapi-milvus-2.6.x-en-US.json
track milvus 3.0.x zh-CN: openapi-milvus-3.0.x-zh-CN.json
```

Assert repeated serialization produces identical bytes and SHA256. Assert the manifest contains policy, nullable release track, language, source digest, file digest/length, sorted operation inventory, counts, and generator Git SHA. Informational timestamps must not affect `semanticDigest`.

- [ ] **Step 2: Verify failure**

```bash
node --test packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.test.js
```

- [ ] **Step 3: Implement deterministic serialization**

Use recursively sorted object keys where OpenAPI ordering is not semantically significant, retain array order, serialize with two spaces and a trailing newline, and calculate SHA256 over those exact bytes.

- [ ] **Step 4: Implement atomic writes**

Export:

```javascript
prepareIntegratedArtifact(buildResult, metadata)
writeIntegratedArtifacts(outputDirectory, artifacts)
```

Write temporary files in the output directory and rename only after all preparations pass. Do not require AWS credentials.

- [ ] **Step 5: Run focused tests and commit**

```bash
node --test packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.test.js
git add packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.js \
  packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.test.js
git commit -m "feat(rest): write deterministic OpenAPI artifacts"
```

## Task 6: Publish prepared bytes to S3 without rebuilding

**Files:**
- Modify: `packages/docs-tooling/src/reference/rest/s3Uploader.js`
- Create: `packages/docs-tooling/src/reference/rest/s3Uploader.test.js`
- Create: `packages/docs-tooling/src/reference/rest/integratedSpecPublisher.js`
- Test: `packages/docs-tooling/src/reference/rest/integratedSpecPublisher.test.js`

- [ ] **Step 1: Write failing uploader tests with an injected client**

Assert:

- constructor accepts `{client, bucket, region, prefix}`;
- `uploadArtifact({filename, bytes, sha256})` sends the exact supplied bytes;
- unchanged remote checksum skips `PutObjectCommand`;
- a put uses `ContentType: application/json` and the prepared filename;
- upload errors leave local files intact.

- [ ] **Step 2: Refactor `S3Uploader`**

Remove `mergeSpecsByTargetAndVersion()` and `localizeAndCleanSpec()` from the uploader. It must receive prepared artifacts only. Keep an AWS-default constructor path for production and dependency injection for tests.

- [ ] **Step 3: Write failing publisher orchestration tests**

Test both:

```javascript
publishIntegratedSpecs({
  specifications: canonical,
  publicationPolicy: 'latest',
  target: 'zilliz',
  apiSurface: 'v2',
  language: 'en-US',
  outputDirectory,
  uploader,
})
publishIntegratedSpecs({
  specifications: snapshot26,
  publicationPolicy: 'track',
  target: 'milvus',
  releaseTrack: '2.6.x',
  language: 'zh-CN',
  outputDirectory,
  uploader,
})
```

Assert local writes happen before upload and S3 receives bytes identical to the local file. Assert compatibility aliases, if enabled, reference the same bytes and digest rather than rebuilding.

- [ ] **Step 4: Implement the publisher**

Orchestrate source load, builder, artifact preparation, atomic local writes, optional upload, and result reporting. Return separate `localArtifacts`, `uploads`, and `manifest` fields.

- [ ] **Step 5: Run focused tests and commit**

```bash
node --test \
  packages/docs-tooling/src/reference/rest/s3Uploader.test.js \
  packages/docs-tooling/src/reference/rest/integratedSpecPublisher.test.js
git add packages/docs-tooling/src/reference/rest/s3Uploader.js \
  packages/docs-tooling/src/reference/rest/s3Uploader.test.js \
  packages/docs-tooling/src/reference/rest/integratedSpecPublisher.js \
  packages/docs-tooling/src/reference/rest/integratedSpecPublisher.test.js
git commit -m "feat(rest): publish prepared OpenAPI artifacts"
```

## Task 7: Add the explicit integrated-spec CLI and preserve page generation

**Files:**
- Modify: `packages/docs-tooling/src/reference/rest/index.js`
- Create: `packages/docs-tooling/src/reference/rest/index.integrated-spec.test.js`
- Modify: `packages/docs-tooling/src/validation/validation.test.ts`

- [ ] **Step 1: Write failing CLI option tests**

Exercise:

```bash
node packages/docs-tooling/src/reference/rest/index.js generate-integrated-spec \
  --specifications packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/canonical.json \
  --publication-policy latest \
  --target zilliz \
  --api-version v2 \
  --lang en-US \
  --integrated-spec-output /tmp/rest-artifacts
```

and:

```bash
node packages/docs-tooling/src/reference/rest/index.js generate-integrated-spec \
  --specifications packages/docs-tooling/src/reference/rest/test-fixtures/integrated-spec/milvus-2.6.x.json \
  --publication-policy track \
  --target milvus \
  --release-track 2.6.x \
  --lang zh-CN \
  --integrated-spec-output /tmp/rest-artifacts
```

Assert expected files and manifests exist. Assert latest-without-api-version, latest+track, track-with-api-version, and track-without-release fail before writing.

- [ ] **Step 2: Refactor command registration**

Keep the existing `fetch-apifox-docs` page command and its defaults unchanged. Register `generate-integrated-spec` separately so page generation never accidentally uploads or selects a historical track.

- [ ] **Step 3: Preserve docs-tooling publication adapter contract**

Keep the existing expectation in `validation.test.ts` exactly:

```javascript
[
  '--specifications', path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi'),
  '--output_path', path.join(repositoryRoot, 'tmp/docs-tooling/en/rest/content/en/reference/api/restful/restful'),
  '--lang', 'en-US',
  '--target', 'zilliz',
]
```

Add an explicit assertion that no `--publication-policy` or `--release-track` is passed during MDX staging.

- [ ] **Step 4: Run CLI and adapter tests**

```bash
node --test packages/docs-tooling/src/reference/rest/index.integrated-spec.test.js
pnpm vitest run packages/docs-tooling/src/validation/validation.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add packages/docs-tooling/src/reference/rest/index.js \
  packages/docs-tooling/src/reference/rest/index.integrated-spec.test.js \
  packages/docs-tooling/src/validation/validation.test.ts
git commit -m "feat(rest): add integrated OpenAPI CLI"
```

## Task 8: Document custom attributes and staged enforcement

**Files:**
- Modify: `packages/docs-tooling/src/reference/rest/CUSTOM_ATTRIBUTES.md`
- Create: `packages/docs-tooling/src/reference/rest/customAttributes.contract.test.js`

- [ ] **Step 1: Write a failing documentation contract test**

Require:

- all three lifecycle names;
- format `major.minor.x`;
- operation and contract-element scopes;
- `x-last-modified` is audit-only, not visibility;
- deprecation retained and `x-removed-since` out of scope;
- `latest` zdoc versus `track` Milvus policy;
- audit/bootstrap/required enforcement stages.

- [ ] **Step 2: Update the custom-attribute table and sections**

Add lifecycle attributes with build/runtime behavior, examples, ordering rules, baseline-floor semantics, field coverage, and public-output stripping. Update CLI documentation for `generate-integrated-spec`.

- [ ] **Step 3: Document enforcement staging**

State:

```text
tooling merge: lifecycle validation is audit-compatible for incomplete legacy fragments
bootstrap migration: all managed Milvus data-plane operations and fields are populated
post-bootstrap: missing lifecycle metadata is a hard validation failure
```

- [ ] **Step 4: Run and commit**

```bash
node --test packages/docs-tooling/src/reference/rest/customAttributes.contract.test.js
git add packages/docs-tooling/src/reference/rest/CUSTOM_ATTRIBUTES.md \
  packages/docs-tooling/src/reference/rest/customAttributes.contract.test.js
git commit -m "docs(rest): define lifecycle and integrated specs"
```

## Task 9: Run complete tooling verification without production migration

**Files:**
- Generate only: `/private/tmp/zdoc-integrated-spec-smoke/`

- [ ] **Step 1: Run all focused REST tests**

```bash
node --test \
  packages/docs-tooling/src/reference/rest/lifecycle.test.js \
  packages/docs-tooling/src/reference/rest/componentGraph.test.js \
  packages/docs-tooling/src/reference/rest/integratedSpecBuilder.test.js \
  packages/docs-tooling/src/reference/rest/integratedSpecArtifacts.test.js \
  packages/docs-tooling/src/reference/rest/s3Uploader.test.js \
  packages/docs-tooling/src/reference/rest/integratedSpecPublisher.test.js \
  packages/docs-tooling/src/reference/rest/index.integrated-spec.test.js \
  packages/docs-tooling/src/reference/rest/customAttributes.contract.test.js
node packages/docs-tooling/src/reference/rest/specLoader.test.js
```

- [ ] **Step 2: Smoke-test latest zdoc artifacts locally**

```bash
node packages/docs-tooling/src/reference/rest/index.js generate-integrated-spec \
  --specifications packages/docs-tooling/src/reference/rest/meta/openapi \
  --publication-policy latest \
  --target zilliz \
  --api-version v2 \
  --lang en-US \
  --integrated-spec-output /private/tmp/zdoc-integrated-spec-smoke
```

Expected: latest-only local artifact and manifest are created without AWS credentials.

- [ ] **Step 3: Smoke-test page generation unchanged**

```bash
node packages/docs-tooling/src/reference/rest/index.js fetch-apifox-docs \
  --specifications packages/docs-tooling/src/reference/rest/meta/openapi \
  --output_path /private/tmp/zdoc-api-ref-test \
  --lang en-US \
  --target zilliz
```

Expected: pages generate successfully; existing metadata warnings are reported separately and are not claimed as new failures.

- [ ] **Step 4: Run proportional repository checks**

```bash
pnpm test:workflow-policy
pnpm test:typescript-runtime-boundary
pnpm typecheck
git diff --check
```

- [ ] **Step 5: Handoff**

Report branch, commits, test evidence, local artifact paths/digests, and confirmation that no production track snapshot or lifecycle backfill was applied. Continue with the separate bootstrap migration plan only after both tooling branches are ready.
