# Chinese site cutover runbook

## Scope and immutable candidate

- Source repository: `zdoc`
- Local validation source SHA: `f3c889e01e6e462156e3080ce46baeb394364805`
- External candidate source SHA: the exact reviewed commit selected for `zilliz-docs-cn-dev`; record it before starting UAT and require every later release record to match it.
- Reviewed master incorporated: `9ae596fd95b092d07f146aacb45d6ef52e934f2c`
- Local candidate image ID: `sha256:53c7f49e734aebc9f1cd105e6ce91619356385734befcc6569b6b27fd7d5e3fe`
- Local image ID is evidence only. Cutover must use the immutable registry digest produced by `zilliz-docs-cn-dev`.
- Legacy archive staging location: `.claude/archives/zdoc-cn-pre-merge.bundle`
- Legacy archive SHA-256: `56cfb5d87da352e31b2d84451c299c8beaa1f0729bce4e72daa0ff80fb874e44`

## Owners

- Release executor: `zilliz-docs-cn-dev` / `zilliz-docs-cn-prod` pipeline owner in `vdc-jenkins`
- Registry and provenance verifier: release engineering
- DNS/CDN/Nginx cutover: Chinese documentation platform owner
- Product acceptance: Chinese documentation owner
- Rollback decision: incident commander and release engineering jointly

Names, ticket IDs, Jenkins build numbers, registry digests, and hostnames must be filled in the release record before approval. Role labels alone are not sufficient for the live cutover.

## Preconditions

1. `git rev-parse HEAD` equals the externally selected candidate SHA and the worktree is clean.
2. `zilliz-docs-cn-dev` builds from `zdoc` with `pnpm build:zh-CN`; it must not clone, assemble, patch, or read `zdoc_cn`.
3. UAT publishes a successful release record whose site is `zh-CN`, source SHA matches, and final image is an immutable registry digest.
4. `node deploy/contracts/verify-image.mjs` validates evidence from the kernel-enforced read-only `VDC_JENKINS_EVIDENCE_ROOT`.
5. A non-mutating shadow uses production-equivalent Nginx/CDN behavior and passes `/healthz`, `/docs/home`, representative guide/BYOC/on-premise/agent/reference routes, canonical metadata, static assets, search, structured data, and chat endpoint routing.
6. Synthetic checks do not publish Lark content, update translations, send notifications, or write production integrations.
7. The prior successful Chinese Prod digest and its release record are available for rollback.
8. The archive bundle has been copied to approved immutable storage and its SHA-256 reverified. Until then, `zdoc_cn` retirement is prohibited.

## Cutover procedure

1. Freeze Chinese documentation publication and record the freeze owner/time.
2. Run `zilliz-docs-cn-dev` in `rebuild` mode for the candidate SHA.
3. Record the UAT registry digest, Jenkins identity, build logs, and smoke evidence in `migration/reports/shadow-zh-CN.json` or its signed external attachment.
4. Deploy that digest to the non-production shadow hostname without rebuilding.
5. Observe for at least 30 minutes. Require zero health-check failures and no new 5xx, redirect loops, missing critical assets, canonical-host errors, or chat proxy authorization leakage.
6. Select one Prod mode:
   - `rebuild`: Prod rebuilds the exact source SHA and links same-site/same-SHA UAT evidence.
   - `specified-image`: Prod resolves the operator reference to the UAT digest and deploys that payload without rebuilding.
7. Run the appropriate verifier before approval. Store `sourceUatDigest` and `finalDeployedDigest` in the release record.
8. Shift Chinese production traffic using the existing `vdc-jenkins`/platform procedure.
9. Run post-cutover checks for `/healthz`, `/docs/home`, at least one route from every Chinese content graph, `/search`, canonical URLs, robots, static assets, `/api/chat`, and `/api/chat/interrupt` routing.
10. Observe for 60 minutes. Keep publication frozen during the observation window.
11. If acceptance holds, unfreeze publication and attach the final release record, owner approvals, metrics snapshot, and exact registry digest.

## Go/no-go gate

Go only when all preconditions and live evidence are complete. Any missing digest, mismatched site/SHA, unverified UAT provenance, mutable tag, critical route/asset regression, archive gap, or unavailable rollback digest is an automatic no-go.

## Recovery objectives

- Rollback decision: within 10 minutes of a critical regression.
- Redeploy recorded prior digest: target within 15 minutes after decision.
- Total recovery-time objective: 30 minutes.
- Data recovery point: no documentation content loss; publication remains frozen during cutover and rollback.
