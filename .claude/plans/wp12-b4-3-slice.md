# WP12-B4.3 Slice — Offline verification of the production signed commit

**Goal.** Let `formal-validation.ts` `receipt`/`prepublish`/`accept` validate the production
writer's `shared-update-unit` plan and its referenced impact reports, while preserving the
existing private-format behavior. Next slice wires the validator to the GitHub Check; this
slice is offline only.

**Authority.** Fixed task card `WP12-zdoc-upstream-updates.md` section "B4.3 生产签名提交的离线验证"
(design repo `0b85f0d72c8f3b8ec10526e0dcaaaf6ebb072ddf`).

**Baseline.** Product baseline is `zilliztech/zdoc@f9d5f90f146aeaf54a7b814ff41e3774ab29605f`
(the #1236 merge). Upstream `master` has NOT advanced past it: `origin/master` is exactly
`f9d5f90f`. Fork `master` is stale (`4b453a0b`), so this PR targets a dedicated
`review-base/wp12-b4-3` branch cut at `f9d5f90f`.

## 1. Where the production evidence comes from

- The **producer archive** is GitHub Actions run `43170134677` attempt 1, artifact `13923258931`
  ("six-member producer archive"), ZIP SHA-256
  `b0dbe10600152602cb6104f448bd095f1250c4eea528f489402ea90afb2ea1c9`.
  Its members are exactly the `producerBundle()` output in
  `scripts/docs-workflow/shared-guides-update/write.mjs`:
  - `plan.json` — the `UpdateUnitPlan` (`kind: shared-update-unit`) that references `reports[]`.
  - `reports/<sha256>.json` — the `UpdateReportEnvelope` impact report (`kind: shared-update`)
    carrying `pins.master` / `pins.dev` / `pins.source.observedTrackHead`.
  - `proof.json`, `patch.raw`, `locks/<sha256>.yaml`, `provenance.json` (encoded
    `ProducerBundleReceipt`).
- The plan's `planSha256 = digest('plan', unit)` binds the plan to the seal and receipt; the
  report is authenticated by the plan's `reports[]` `BlobRef` (path + bytes + SHA-256) and then
  cross-checked with `validateUnitReports`.
- The producer's impact report and the validator's own output (`facts.output`) are **two
  independent pieces of evidence**; only the report supplies the master/dev/source anchors.
- Observed SHAs (master/dev/Milvus track head) are supplied independently by the trusted caller
  through the existing `observed` input — never read back from the archive.

## 2. Which layer authenticates

- `checkInputs` in `formal-validation.ts` is the shared input-binding layer for the three ops.
  It detects the format from the plan's own structure (`kind === 'shared-update-unit'` vs
  `scope === 'private-single-page-projection'`), not from any request-selected flag. It:
  1. authenticates the raw plan bytes (strict canonical + `digest('plan', plan)`),
  2. for the unit plan, authenticates each report against its `BlobRef` and runs
     `validateUnitReports(plan, reports)` (reused from `core/updates/envelope.ts`),
  3. derives `{ master, dev, source: pins.source.observedTrackHead }` from the report and runs
     the existing `freshness()` against `observed`,
  4. enforces the pilot invariants: single Guides page `json-field-overview`, a single
     `lock.next` edit, and `pins.source.target === pins.source.observedTrackHead === nextEdits[0].target`.
- Production identity (repositoryId `660446555`, bound by the receipt / policy) with a
  **private-format** plan is rejected; no request field can select a more lenient path.
- Deeper acceptance (signature, producer identity, artifact digests, reserved Check, Check App /
  target commit binding) stays in `acceptExactValidation` / `inspectReservedValidation`
  (`core/updates/remote.ts`), unchanged. `validateUnitReports`, `producerBundle`, and the seal /
  Check bindings are reused as-is.

## 3. Files to change

- `packages/docs-tooling/src/shared-docs/adapters/updates/formal-validation.ts` — extend
  `checkInputs` (and the `receipt`/`prepublish`/`accept` dispatch) to accept report bytes and run
  the production path, preserving the private path byte-for-byte.
- `packages/docs-tooling/src/shared-docs/testing/updates/formal-validation.test.ts` (new focused
  test, covered by the existing `shared-docs/**` matrix entry → `pnpm test:shared-docs`) —
  production-format success and rejection cases using synthetic fixtures, plus the preserved
  private-format positives. Synthetic validator/Check facts are explicitly marked test data.
- `.claude/plans/wp12-b4-3-slice.md` — this temporary plan, removed by normal commit before any
  upstream proposal.

Out of scope (unchanged): production workflow, branch protection, frozen v1 envelope
(`remote.ts` `RemoteSealV1`/`BotRevision`), `write.mjs`, producer/validator schemas, multi-page
discovery.

## 4. Counterexamples that must be rejected

- **Replaced report**: tampered report bytes or size without matching `BlobRef.sha256`/`bytes`
  (report authentication), or a report that no longer satisfies `validateUnitReports`.
- **Wrong page / wrong lock**: a different `pageId`, or a `lock` whose `next` edit does not match
  `pins.source.target` / the single-page pilot invariants.
- **Production identity + private format**: a `{ scope: private-single-page-projection }` plan
  under repositoryId `660446555` is rejected rather than downgraded.
- **Replaced signature head / wrong Check**: a different seal `head`, or a Check from another App
  / suite / head — no valid success receipt or acceptance.
- **Moved inputs**: independently changing `master`, `dev`, or the Milvus track head yields the
  corresponding `STALE_MASTER` / `STALE_DEV` / `STALE_SOURCE` hold. Replaying the already-merged
  #1236 against today's production state must stop on freshness.

## Implementation and verification sequence (after plan approved)

- Download the real producer archive (run `43170134677`, attempt 1, artifact `13923258931`) and
  verify its ZIP SHA-256; replay the production `receipt`/`prepublish`/`accept` binding with the
  real `plan.json` + `reports/*.json`, recording commands, input digests and results.
- Run `pnpm test:for-change --` over the two changed product paths; then focused
  `pnpm vitest run .../formal-validation.test.ts`; then `pnpm test:shared-docs`, `pnpm typecheck`,
  `pnpm test:workflow-matrix`, `git diff --check` (and `pnpm test:workflow-policy`).
- Commit only the two product files; run the full-diff selector against `review-base/wp12-b4-3`
  and `HEAD`, reporting the temporary planning-only path separately.
- CI uses bounded synthetic fixtures (never the retained archive); the real archive replay is a
  one-time offline evidence run.
