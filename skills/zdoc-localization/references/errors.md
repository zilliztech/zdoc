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
| `partial_write` / state `partial` | Run `recover inspect`; do not update the receipt or claim completion. Reverse only from an exact preview token when `safeToRecover=true`. |
| `verification_failed` | Preserve snapshots and validation output; do not update the receipt. |
| state `manual_action_required` | Present the exact native synced-reference actions. Do not claim completion; run `manual verify` only after the user replaces the placeholders in Feishu. |
| retryable `upstream` | Retry a bounded number of times without changing arguments. |

Recovery inspection:

```bash
zdoc-localize recover inspect --run <run-id> --format json
zdoc-localize recover reverse --run <run-id> --preview --format json
zdoc-localize recover reverse --run <run-id> --approval-token <token> --format json
```

Recovery inspection also supports `manual_action_required` and verifies that the target differs only by the planned native-reference replacements. Whiteboard recovery compares canonical raw hashes and restores the durable pre-write raw snapshot. After a safe reverse completes, the failed run remains blocked and a fresh plan can be created. `accept-current` is intentionally forbidden while a partial write is unresolved.

For stale or pre-write blocked runs, starting a new run from current remote state leaves the failed run unchanged:

```bash
zdoc-localize recover accept-current --run <run-id> --format json
```
