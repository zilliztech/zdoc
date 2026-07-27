# Error Routing

| Error type or state | Action |
|---|---|
| `validation` | Fix the local input or review file; do not write remotely. |
| `configuration` | Repair workspace registry/state configuration. |
| `authentication` / `authorization` | Route to `$lark-shared`; preserve the reported hint and missing scopes. |
| `compatibility` | Stop and install a supported CLI version. |
| `stale_plan` | Regenerate the plan and obtain approval again. |
| `alignment_blocked` / state `blocked` | Present the unmatched section or candidates for human resolution. |
| `unsupported_content` | Report unrecognized table/image/resource changes; do not omit them. Supported Whiteboards use the mirror policy. |
| `confirmation_required` | Present the exact action and wait for explicit approval; never auto-retry. |
| `partial_write` / state `partial` | Run `recover inspect`; do not update the receipt or claim completion. Preserve the immutable Engine batch, pre-write snapshot, verified-operation journal, and checkpoint. Reverse only from a current-snapshot-bound Engine preview token when the assessment is `reverse_possible`. |
| `verification_failed` | Preserve snapshots and validation output; do not update the receipt. |
| state `manual_action_required` | Present the exact native synced-reference actions. Do not claim completion; run `manual verify` only after the user replaces the placeholders in Feishu. |
| retryable `upstream` | Retry a bounded number of times without changing arguments. |

Recovery inspection:

```bash
zdoc-localize recover inspect --run <run-id> --format json
zdoc-localize recover reverse --run <run-id> --preview --format json
zdoc-localize recover reverse --run <run-id> --approval-token <token> --format json
```

Engine recovery assessment validates the exact stored batch fingerprint and verified evidence before returning one of `reverse_possible`, `resume_possible`, or `manual_inspection_required`. Engine `0.2.0` does not expose a safe resume/rebase write API, so `resume_possible` is read-only guidance and must not produce or imply an approval token. A reverse uses a separate Engine batch, immutable current/pre-write snapshot, journal, fingerprint, and approval token. If that recovery batch itself partially writes, keep its checkpoint separate and inspect it before returning to the original forward recovery.

Recovery inspection also supports `manual_action_required` and verifies that the target differs only by the planned native-reference replacements. Whiteboard recovery compares canonical raw hashes and restores the durable pre-write raw snapshot. After a safe reverse completes, the failed run remains blocked and a fresh plan can be created. `accept-current` is intentionally forbidden while a partial write is unresolved.

Legacy plan routing is fail closed. Unapplied plan v1/v2 reviews and legacy-hash plan v3 reviews return `legacy_plan_requires_regeneration`. At the next `plan create`, a legacy receipt is rebound to Engine snapshots only when source revision, target revision, and unchanged correspondences can be proven; ambiguity or drift blocks migration. Existing legacy partial runs may still be inspected. When their stored evidence is sufficient for a lossless reverse, the CLI compiles and previews a new Engine batch; it never calls the retired legacy document writer. Otherwise report `legacy_reverse_not_lossless` or the more specific compatibility/verification error and require manual inspection.

For stale or pre-write blocked runs, starting a new run from current remote state leaves the failed run unchanged:

```bash
zdoc-localize recover accept-current --run <run-id> --format json
```
