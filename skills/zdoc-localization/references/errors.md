# Error Routing

| Error type or state | Action |
|---|---|
| `validation` | Fix the local input or review file; do not write remotely. |
| `configuration` | Repair workspace registry/state configuration. |
| `authentication` / `authorization` | Route to `$lark-shared`; preserve the reported hint and missing scopes. |
| `compatibility` | Stop and install a supported CLI version. |
| `stale_plan` | Regenerate the plan and obtain approval again. |
| `alignment_blocked` / state `blocked` | Present the unmatched section or candidates for human resolution. |
| `unsupported_content` | Report the table/image/Whiteboard/resource change; do not omit it. |
| `confirmation_required` | Present the exact action and wait for explicit approval; never auto-retry. |
| `partial_write` / state `partial` | Run `recover inspect`; do not update the receipt or claim completion. |
| `verification_failed` | Preserve snapshots and validation output; do not update the receipt. |
| retryable `upstream` | Retry a bounded number of times without changing arguments. |

Recovery inspection:

```bash
zdoc-localize recover inspect --run <run-id> --format json
```

Starting a new run from current remote state leaves the failed run unchanged:

```bash
zdoc-localize recover accept-current --run <run-id> --format json
```
