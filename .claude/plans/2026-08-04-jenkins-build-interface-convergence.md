# Jenkins Build Interface Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make English/Japanese and Chinese container builds expose the same three Jenkins inputs while preserving Reference content-integrity validation and removing current four-job topology from repository-owned interface documentation.

**Architecture:** Keep the existing site-specific `pnpm` commands and Dockerfiles as the public interface. Remove the second external Reference SHA only from the Docker external-snapshot path; normal Git-worktree provenance checks remain unchanged. Update focused tests first, then production code and current documentation, without changing release records, image promotion, publish bot behavior, historical migration evidence, or publish FIFO.

**Tech Stack:** TypeScript, Vitest, Node.js test runner, pnpm, Docker, Docusaurus

---

## File Map

- Modify `deploy/contracts/container.test.mjs`: enforce identical active Docker inputs for both sites and execute revision validation without a Reference-specific SHA.
- Modify `deploy/zh-CN/Dockerfile`: remove the `ZDOC_REFERENCE_SOURCE_SHA` build argument, validation, and environment export.
- Modify `packages/docs-tooling/src/reference/translationManifest.test.ts`: prove external snapshots need no second SHA and still reject content hash drift.
- Modify `packages/docs-tooling/src/cli.ts`: make `external-snapshot` skip Git revision lookup while retaining all manifest/tree validation performed after the revision gate.
- Modify `deploy/contracts/site-validation-workflow.test.mjs`: test the current environment-neutral build interface separately from immutable historical shadow reports.
- Modify `deploy/contracts/README.md`: replace the four-job build-interface description with target commands shared by UAT and Prod; retain release-record and verifier documentation.
- Modify `README.md`: document the three Docker inputs explicitly and state that target builds are independent.
- Do not modify `deploy/contracts/release.schema.json`, `deploy/contracts/release-record.example.json`, `deploy/contracts/verify-image.mjs`, `deploy/contracts/verify-image.test.mjs`, `scripts/doc-publish-bot/**`, `migration/reports/**`, or `.github/workflows/**`.

### Task 1: Converge the Docker Build Arguments

**Files:**
- Modify: `deploy/contracts/container.test.mjs:89-146`
- Modify: `deploy/zh-CN/Dockerfile:16-32`

- [ ] **Step 1: Write the failing container contract assertions**

In `deploy/contracts/container.test.mjs`, replace the Chinese-only positive assertions at lines 106-112 with a negative assertion shared by both sites:

```javascript
    assert.doesNotMatch(activeContents, /ZDOC_REFERENCE_SOURCE_SHA/);
```

In the same file, make the validation shell environment identical for both sites by replacing lines 132-138 with:

```javascript
      env: {
        ...process.env,
        ZDOC_SHA: sha,
        ZDOC_SITE: site,
        JENKINS_BUILD_ID: 'test-build',
      },
```

- [ ] **Step 2: Run the container contract test and verify RED**

Run:

```bash
pnpm test:containers
```

Expected: FAIL for `zh-CN image has an isolated build and immutable site identity` because `deploy/zh-CN/Dockerfile` still contains `ZDOC_REFERENCE_SOURCE_SHA`.

- [ ] **Step 3: Remove the Chinese-only Docker input**

In `deploy/zh-CN/Dockerfile`, change the build-stage argument and validation block to exactly:

```dockerfile
ARG ZDOC_SHA
ARG ZDOC_SITE=zh-CN
ARG JENKINS_BUILD_ID
RUN test -n "$ZDOC_SHA" \
    && test "${#ZDOC_SHA}" -eq 40 \
    && test "${ZDOC_SHA#*[!0-9a-f]}" = "$ZDOC_SHA" \
    && test "$ZDOC_SITE" = "zh-CN" \
    && test -n "$JENKINS_BUILD_ID"
ENV ZDOC_PROVENANCE_COMMIT=${ZDOC_SHA} \
    ZDOC_PROVENANCE_WORKTREE=external-snapshot \
    ZDOC_PROVENANCE_TRACKED_INPUTS=deploy/contracts/localization-inputs.inventory.json
RUN pnpm run build:zh-CN
```

Leave the runtime-stage arguments and image labels unchanged.

- [ ] **Step 4: Run the container contract test and verify GREEN**

Run:

```bash
pnpm test:containers
```

Expected: PASS, including malformed `ZDOC_SHA` rejection for both sites.

- [ ] **Step 5: Commit the Docker argument convergence**

```bash
git add deploy/contracts/container.test.mjs deploy/zh-CN/Dockerfile
git commit -m "fix(containers): converge Jenkins build inputs"
```

### Task 2: Remove the Second SHA From External Reference Validation

**Files:**
- Modify: `packages/docs-tooling/src/reference/translationManifest.test.ts:490-528`
- Modify: `packages/docs-tooling/src/cli.ts:172-190`

- [ ] **Step 1: Rewrite the external-snapshot test around content integrity**

In `packages/docs-tooling/src/reference/translationManifest.test.ts`, replace the `dependencies` object and the two expectations in the `validates an immutable external snapshot without Git metadata` test with:

```typescript
    const dependencies = {
      repositoryRoot: roots.repositoryRoot,
      environment: {
        ZDOC_PROVENANCE_WORKTREE: 'external-snapshot',
      },
      manualForPath: () => 'python',
      retirementRegistry: {schemaVersion: 2 as const, retirements: []},
      validateReferenceNavigation: vi.fn(),
    };
    await expect(executeReferenceDocsToolingCommand(
      ['validate-reference', '--site', 'zh-CN'],
      dependencies,
    )).resolves.toBeUndefined();

    writeFileSync(
      path.join(roots.repositoryRoot, 'content/en/reference/api/python/page.md'),
      '# changed source\n',
    );
    await expect(executeReferenceDocsToolingCommand(
      ['validate-reference', '--site', 'zh-CN'],
      dependencies,
    )).rejects.toThrow(/source hash/i);
```

This test must contain no `ZDOC_REFERENCE_SOURCE_SHA` value.

- [ ] **Step 2: Run the focused Reference test and verify RED**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/reference/translationManifest.test.ts
```

Expected: FAIL on the first external-snapshot validation with `External snapshot Reference source SHA must be a 40-character lowercase Git SHA`.

- [ ] **Step 3: Implement the minimal external-snapshot revision gate**

In `packages/docs-tooling/src/cli.ts`, replace `verifyReferenceSourceRevision` with:

```typescript
function verifyReferenceSourceRevision(
  repositoryRoot: string,
  commit: string,
  sourceRoot: string,
  snapshot: ReferenceTreeSnapshot,
  environment: NodeJS.ProcessEnv,
): void {
  if (environment.ZDOC_PROVENANCE_WORKTREE === 'external-snapshot') return;
  verifyGitSourceRevision(repositoryRoot, commit, sourceRoot, snapshot);
}
```

Do not change the subsequent calls to `validateReferenceSource`, `validateReferenceTranslation`, retirement validation, or navigation validation.

- [ ] **Step 4: Run the focused Reference test and verify GREEN**

Run:

```bash
pnpm vitest run packages/docs-tooling/src/reference/translationManifest.test.ts
```

Expected: PASS. The clean external snapshot succeeds, and the mutated Reference source fails with a source-hash error.

- [ ] **Step 5: Type-check the revision-gate change**

Run:

```bash
pnpm typecheck
```

Expected: PASS with no TypeScript diagnostics.

- [ ] **Step 6: Commit the Reference validation change**

```bash
git add packages/docs-tooling/src/cli.ts packages/docs-tooling/src/reference/translationManifest.test.ts
git commit -m "fix(reference): validate external snapshots without second sha"
```

### Task 3: Document the Repository-Owned Jenkins Interface

**Files:**
- Modify: `deploy/contracts/site-validation-workflow.test.mjs:199-209`
- Modify: `deploy/contracts/README.md:1-16`
- Modify: `deploy/contracts/README.md:65`
- Modify: `README.md:58-70`

- [ ] **Step 1: Write the failing current-interface documentation test**

Replace the final test in `deploy/contracts/site-validation-workflow.test.mjs` with these two tests:

```javascript
test('current Jenkins handoff exposes environment-neutral target commands', async () => {
  const readme = await readFile(path.join(repositoryRoot, 'deploy/contracts/README.md'), 'utf8');
  assert.match(readme, /UAT and Prod.*same repository build interface/is);
  assert.match(readme, /`pnpm build:en`/);
  assert.match(readme, /`pnpm build:zh-CN`/);
  assert.match(readme, /English and Japanese/i);
  assert.match(readme, /independent/i);
  assert.doesNotMatch(readme, /`zilliz-docs-(?:cn-)?(?:dev|prod)`/);
  assert.match(readme, /GitHub Actions.*does not deploy|does not deploy.*GitHub Actions/i);
});

test('historical shadow reports retain their recorded Jenkins pipeline names', async () => {
  const english = JSON.parse(await readFile(path.join(repositoryRoot, 'migration/reports/shadow-en.json'), 'utf8'));
  const chinese = JSON.parse(await readFile(path.join(repositoryRoot, 'migration/reports/shadow-zh-CN.json'), 'utf8'));
  assert.equal(english.externalShadow.uatPipeline, 'zilliz-docs-dev');
  assert.equal(chinese.externalShadow.uatPipeline, 'zilliz-docs-cn-dev');
});
```

- [ ] **Step 2: Run the documentation contract and verify RED**

Run:

```bash
node --test deploy/contracts/site-validation-workflow.test.mjs
```

Expected: FAIL because `deploy/contracts/README.md` still presents four site-specific Jenkins jobs.

- [ ] **Step 3: Replace the active four-job interface documentation**

Replace `deploy/contracts/README.md` lines 1-14 with:

```markdown
# Jenkins release contracts

This directory contains repository-owned build and release data contracts consumed by the externally managed `vdc-jenkins` release system. It does not contain or replace Jenkins Groovy, credentials, registry access, approval policy, environment configuration, target orchestration, or deployment behavior.

## Repository build interface

UAT and Prod use the same repository build interface after Jenkins checks out the selected branch.

| Target | Build command | Dockerfile | Content |
| --- | --- | --- | --- |
| `en` | `pnpm build:en` | `deploy/en/Dockerfile` | English and Japanese |
| `zh-CN` | `pnpm build:zh-CN` | `deploy/zh-CN/Dockerfile` | Chinese |

Jenkins may select either target or both. The targets are independently invocable and independently failing. Repository container builds accept only `ZDOC_SHA`, `ZDOC_SITE`, and `JENKINS_BUILD_ID`; branch selection, environment selection, image naming, execution order, retry, deployment, and approval remain Jenkins-owned.

## Release records

Every record fixes `sourceRepository` to `zdoc`, uses a lowercase 40-character Git SHA, records an immutable registry digest, and identifies the producing `vdc-jenkins` build. The Chinese release contract has no build-time or runtime dependency on `zdoc_cn`.
```

Replace the named UAT handoff paragraph near the Path filters section with:

```markdown
The `site validation` GitHub Actions workflow is a read-only build gate: it does not deploy, use deployment secrets, publish documentation, or replace Jenkins approvals. After it passes, external Jenkins UAT may invoke either selected target through the repository build interface above. Jenkins remains responsible for registry access, deployment credentials, immutable UAT evidence, environment checks, and approvals.
```

Do not edit the release-record, verifier, Prod-mode, path-filter, or daily-waterline semantics beyond moving the existing release-record paragraph under its explicit heading.

- [ ] **Step 4: Update the root container examples**

In `README.md`, replace the Content production summary paragraph with:

```markdown
GitHub Actions owns source production, translation, validation, and image build orchestration. English/Japanese and Chinese production remain independently addressable. External Jenkins UAT and Prod pipelines consume the selected repository branch through the same site-qualified build interface; Jenkins configuration is maintained outside this repository.
```

Replace the container command block with:

```bash
SOURCE_SHA="$(git rev-parse HEAD)"
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=en --build-arg JENKINS_BUILD_ID=local-preview -f deploy/en/Dockerfile -t zdoc-en .
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=zh-CN --build-arg JENKINS_BUILD_ID=local-preview -f deploy/zh-CN/Dockerfile -t zdoc-zh-cn .
```

Immediately after the block, add:

```markdown
The English image includes Japanese content. The two commands are independent; invoke only the selected target or invoke both without treating one target's failure as a repository-level requirement for the other. The Dockerfiles build the static sites internally, so Jenkins does not need to run `pnpm build:*` before these container builds. Image naming and registry tagging remain Jenkins-owned.
```

- [ ] **Step 5: Run the current-interface documentation test and verify GREEN**

Run:

```bash
node --test deploy/contracts/site-validation-workflow.test.mjs
```

Expected: PASS. The current README has no four-job topology, while historical shadow reports retain their recorded names.

- [ ] **Step 6: Commit the documentation contract**

```bash
git add README.md deploy/contracts/README.md deploy/contracts/site-validation-workflow.test.mjs
git commit -m "docs(jenkins): publish target-based build interface"
```

### Task 4: Run Focused and Site-Build Verification

**Files:**
- Verify: `deploy/contracts/container.test.mjs`
- Verify: `packages/docs-tooling/src/reference/translationManifest.test.ts`
- Verify: `deploy/contracts/site-validation-workflow.test.mjs`
- Verify: all TypeScript sources reached by repository type checking
- Verify: English/Japanese and Chinese static build inputs

- [ ] **Step 1: Run all focused contract tests together**

Run:

```bash
pnpm test:containers
pnpm vitest run packages/docs-tooling/src/reference/translationManifest.test.ts
node --test deploy/contracts/site-validation-workflow.test.mjs
```

Expected: all commands PASS.

- [ ] **Step 2: Run repository type checking**

Run:

```bash
pnpm typecheck
```

Expected: PASS with no diagnostics.

- [ ] **Step 3: Build the English and Japanese site**

Run:

```bash
pnpm build:en
```

Expected: PASS and produce the English site output, including Japanese localization, under the configured `build/en` tree.

- [ ] **Step 4: Build the Chinese site**

Run:

```bash
pnpm build:zh-CN
```

Expected: PASS without setting `ZDOC_REFERENCE_SOURCE_SHA` and produce the configured `build/zh-CN` tree.

- [ ] **Step 5: Check formatting and workspace state**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` produces no output. `git status --short` shows no uncommitted Jenkins-interface changes; pre-existing unrelated untracked `.claude/plans/*` and `.claude/specs/*` files may remain.

### Task 5: Validate the Published Docker Commands and Scope Boundary

**Files:**
- Verify: `deploy/en/Dockerfile`
- Verify: `deploy/zh-CN/Dockerfile`
- Verify unchanged: `deploy/contracts/release.schema.json`
- Verify unchanged: `deploy/contracts/release-record.example.json`
- Verify unchanged: `deploy/contracts/verify-image.mjs`
- Verify unchanged: `deploy/contracts/verify-image.test.mjs`
- Verify unchanged: `scripts/doc-publish-bot/**`
- Verify unchanged: `migration/reports/**`
- Verify unchanged: `.github/workflows/**`

- [ ] **Step 1: Confirm Docker is available**

Run:

```bash
docker info
```

Expected when the local daemon is available: exit status 0. If the daemon is unavailable, preserve the exact error in the handoff and treat the focused container contract tests as the executed Dockerfile validation rather than claiming an image build passed.

- [ ] **Step 2: Build the English/Japanese image with the published interface**

When `docker info` succeeds, run:

```bash
SOURCE_SHA="$(git rev-parse HEAD)"
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=en --build-arg JENKINS_BUILD_ID=local-verification -f deploy/en/Dockerfile -t zdoc-jenkins-interface-en:local .
```

Expected: PASS without any Reference-specific build argument.

- [ ] **Step 3: Build the Chinese image with the published interface**

When `docker info` succeeds, run:

```bash
SOURCE_SHA="$(git rev-parse HEAD)"
docker build --build-arg ZDOC_SHA="$SOURCE_SHA" --build-arg ZDOC_SITE=zh-CN --build-arg JENKINS_BUILD_ID=local-verification -f deploy/zh-CN/Dockerfile -t zdoc-jenkins-interface-zh-cn:local .
```

Expected: PASS without `ZDOC_REFERENCE_SOURCE_SHA`.

- [ ] **Step 4: Audit the explicitly excluded paths**

Run:

```bash
git diff --exit-code origin/master -- deploy/contracts/release.schema.json deploy/contracts/release-record.example.json deploy/contracts/verify-image.mjs deploy/contracts/verify-image.test.mjs scripts/doc-publish-bot migration/reports .github/workflows
```

Expected: exit status 0 and no output.

- [ ] **Step 5: Audit the final change set**

Run:

```bash
git diff --stat origin/master...HEAD
git log --oneline origin/master..HEAD
```

Expected: the change set contains the approved specification, this plan, and the three implementation commits only. No FIFO workflow change is present.

- [ ] **Step 6: Hand off Jenkins interface completion**

Report:

- the final commit SHA;
- focused test and type-check results;
- both static site build results;
- both Docker build results, or the exact daemon-unavailable limitation;
- confirmation that excluded paths are unchanged;
- the exact Jenkins-facing commands from the approved specification.

Do not start publish FIFO implementation in the same change set. Begin FIFO only as a separately designed, implemented, and validated phase after the Jenkins interface handoff is accepted.
