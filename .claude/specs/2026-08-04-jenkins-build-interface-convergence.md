# Jenkins Build Interface Convergence

Date: 2026-08-04

## Goal

Converge the repository-owned Jenkins build interface for the merged documentation repository. Jenkins has separate UAT and Prod pipelines, and each pipeline may select a branch and one or both build targets. The repository defines only the commands and build inputs it provides to Jenkins; Jenkins orchestration and deployment behavior remain external.

## Decisions

- UAT and Prod use the same repository build interface.
- Jenkins owns branch checkout, environment selection, target selection, execution order, retry, tagging, deployment, and approval.
- The supported targets are `en` and `zh-CN`.
- The `en` target includes both English and Japanese content.
- Selecting both targets means invoking the two target interfaces independently.
- A failure in one target does not require the other target to fail, stop, or roll back.
- The checked-out repository commit is the only external source revision:
  `SOURCE_SHA="$(git rev-parse HEAD)"`.
- Docker builds receive that revision as `ZDOC_SHA`.
- Jenkins no longer reads `generated/en/manifests/reference.json.sourceCommit` or supplies `ZDOC_REFERENCE_SOURCE_SHA`.
- The Reference source Manifest keeps `sourceCommit` as internal translation provenance. It is not the checked-out repository revision and is not a Jenkins build input.

## Repository-Owned Interface

### Static site builds

From the repository root, dependency preparation is:

```bash
corepack enable
pnpm install --frozen-lockfile
```

The target commands are:

```bash
pnpm build:en
pnpm build:zh-CN
```

Jenkins invokes only the selected target commands. The repository does not add a combined command whose exit status couples the two targets.

### Container builds

The shared source revision is:

```bash
SOURCE_SHA="$(git rev-parse HEAD)"
```

The English and Japanese container is built with:

```bash
docker build \
  --build-arg ZDOC_SHA="$SOURCE_SHA" \
  --build-arg ZDOC_SITE=en \
  --build-arg JENKINS_BUILD_ID="$JENKINS_BUILD_ID" \
  -f deploy/en/Dockerfile \
  .
```

The Chinese container is built with:

```bash
docker build \
  --build-arg ZDOC_SHA="$SOURCE_SHA" \
  --build-arg ZDOC_SITE=zh-CN \
  --build-arg JENKINS_BUILD_ID="$JENKINS_BUILD_ID" \
  -f deploy/zh-CN/Dockerfile \
  .
```

The three repository-defined Docker inputs are:

| Input | Requirement |
| --- | --- |
| `ZDOC_SHA` | The lowercase 40-character SHA returned by `git rev-parse HEAD` |
| `ZDOC_SITE` | Exactly `en` for the English/Japanese image or `zh-CN` for the Chinese image |
| `JENKINS_BUILD_ID` | A non-empty Jenkins-owned build identifier |

Image names, registry locations, tags, and additional Jenkins-owned Docker arguments are outside this contract. Each Dockerfile installs dependencies and runs its target build internally, so a preceding static site build is not required for the container build.

## Reference Validation

The normal Git-worktree validation path continues to verify that the Reference source tree matches the Manifest's `sourceCommit`.

The Docker `external-snapshot` path cannot assume the checked-out repository SHA equals the historical Reference source commit. It therefore does not accept or compare a second external SHA. It still validates:

- Reference source Manifest schema and ownership;
- current Reference source paths and content hashes;
- Chinese translation Manifest consistency;
- retirement registry consistency;
- Reference navigation integrity.

This preserves content-integrity checks without assigning two different meanings to the repository build SHA.

## Failure Semantics

- A missing or malformed `ZDOC_SHA`, mismatched `ZDOC_SITE`, or empty `JENKINS_BUILD_ID` fails only the invoked container build.
- Reference path or hash drift fails the affected target build.
- The repository does not impose an all-target success barrier.
- The repository does not define how Jenkins represents partial success or whether Jenkins continues another target after a failure.

## Change Scope

The implementation may change:

- `deploy/zh-CN/Dockerfile`;
- `packages/docs-tooling/src/cli.ts`;
- focused Reference validation tests;
- container contract tests;
- current Jenkins build-interface documentation and its focused tests;
- the root README container command examples.

Current documentation must stop presenting four site-specific Jenkins jobs as the repository build interface. Historical migration reports and evidence retain their original values.

## Explicitly Out of Scope

- Jenkinsfile, Groovy, credentials, agents, parameters, job names, registry configuration, approvals, deployment, or retry policy;
- release record schemas, examples, and validation behavior;
- image promotion and rollback contracts;
- `scripts/doc-publish-bot` and its Jenkins trigger behavior;
- historical migration reports and run evidence;
- publish FIFO design, implementation, and workflow changes;
- a combined repository command for building both targets.

In particular, these active implementation files remain unchanged in this phase:

- `deploy/contracts/release.schema.json`;
- `deploy/contracts/release-record.example.json`;
- `deploy/contracts/verify-image.mjs`;
- `deploy/contracts/verify-image.test.mjs`;
- `scripts/doc-publish-bot/**`.

## Test Strategy

Implementation follows test-driven development:

1. Add failing contract tests that require the two Dockerfiles to expose the same three repository inputs and reject `ZDOC_REFERENCE_SOURCE_SHA` as an active input.
2. Add a failing Reference validation test showing that an external snapshot succeeds without a Reference source SHA while content hash drift still fails.
3. Add or update a failing documentation contract test that rejects current four-job Jenkins topology as the repository build interface.
4. Make the smallest production changes required to pass those tests.
5. Run focused tests, then both site builds.
6. If a Docker daemon is available, build both images with the documented three arguments.
7. Verify that all explicitly excluded files remain unchanged.

Expected verification includes:

- container contract tests;
- Reference Manifest and translation validation tests;
- current Jenkins interface documentation tests;
- `pnpm build:en`;
- `pnpm build:zh-CN`;
- actual English and Chinese Docker builds when supported by the local environment.

## Acceptance Criteria

- Jenkins can build either target from any checked-out branch using the documented commands.
- UAT and Prod require no different repository command or build argument.
- Both Dockerfiles require only `ZDOC_SHA`, `ZDOC_SITE`, and `JENKINS_BUILD_ID` from Jenkins.
- The Chinese build has no dependency on `ZDOC_REFERENCE_SOURCE_SHA`.
- Reference content-integrity validation remains effective.
- English/Japanese and Chinese targets remain independently invocable and independently failing.
- Current repository documentation does not prescribe Jenkins job topology or deployment behavior.
- Release records, image promotion, publish bot behavior, historical evidence, and publish FIFO are unchanged.
