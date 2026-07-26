# Chinese site rollback runbook

## Trigger conditions

Rollback for sustained health failures, critical route or asset loss, incorrect Chinese product structure, canonical/robots errors, redirect loops, search failure, unsafe chat proxy behavior, or a release record/provenance mismatch. Non-blocking legacy broken-link warnings alone are not a rollback trigger unless they represent a new production regression.

## Required immutable inputs

- Failed candidate source SHA: `f3c889e01e6e462156e3080ce46baeb394364805`
- Failed candidate registry digest: record at deployment time; do not substitute the local image ID.
- Rollback target: a `finalDeployedDigest` from a prior successful Chinese Prod release record.
- Archive staging location: `.claude/archives/zdoc-cn-pre-merge.bundle`
- Archive SHA-256: `56cfb5d87da352e31b2d84451c299c8beaa1f0729bce4e72daa0ff80fb874e44`

## Procedure

1. Incident commander freezes Chinese publication and declares rollback.
2. Release engineering creates a request containing only `site: zh-CN` and the prior successful `targetDigest`.
3. Run `node deploy/contracts/verify-image.mjs verify-rollback` with authenticated Prod history from the kernel-enforced read-only Jenkins evidence mount.
4. Reject the request if the digest is absent from successful Chinese Prod history, belongs to English, or requires rebuilding.
5. Use Chinese Prod `specified-image` mode to redeploy the verified digest. Resolve any operator tag before approval and record the immutable digest.
6. Restore traffic using the existing platform procedure.
7. Verify `/healthz`, `/docs/home`, representative Chinese content routes, `/search`, canonical metadata, critical static assets, and chat routing.
8. Observe for at least 30 minutes. Keep publication frozen until health and acceptance recover.
9. Record the failed digest, rollback digest, Jenkins identity, owners, timestamps, reason, verifier output, smoke output, and actual recovery time.
10. Unfreeze publication only after Chinese documentation and release owners approve recovery.

## If digest rollback is unavailable

Do not rebuild an arbitrary commit under incident pressure. Stop traffic promotion, keep publication frozen, and escalate to release engineering. The protected `zdoc_cn` archive is disaster-recovery evidence, not an automatic deployment input; using it requires a separately reviewed recovery plan and must not silently restore the old build-time assembly dependency.

## Recovery objectives

- Decision target: 10 minutes.
- Verified specified-image redeployment target: 15 minutes.
- Total recovery-time objective: 30 minutes.
- Observation window after rollback: 30 minutes minimum.

