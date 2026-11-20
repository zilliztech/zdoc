# Task 1 Report: Fix `test:all` to run every test suite

**Status:** DONE

**Commit:** `d51adfeac` test: make test:all run every test suite (branch `codex/master-tooling-validation`)

## What I changed

Edited the `test:all` script in `/Users/anthony/Documents/projects/zdoc/package.json` from `"pnpm test:frontend"` (which only ran vitest) to an explicit aggregation of every existing `test:*` suite, excluding `test:e2e` (Playwright, needs a browser) and `test:all` itself (recursion).

Per the controller ruling, I did NOT add the brief's proposed `test:scripts` glob script — `test:all` is now the single umbrella.

## Before / After

**Before:**
```jsonc
"test:all": "pnpm test:frontend"
```

**After:**
```jsonc
"test:all": "pnpm run test:frontend && pnpm run test:containers && pnpm run test:profiles && pnpm run test:translation && pnpm run test:retirement && pnpm run test:rest-publication-contract && pnpm run test:guides-coverage && pnpm run test:workflow-policy && pnpm run test:typescript-runtime-boundary && pnpm run test:external-link-watchdog && pnpm run test:chat-agent-config && pnpm run test:doc-publish-bot && pnpm run test:architecture"
```

## Script inventory check

All `test:*` scripts present in package.json:

`test:frontend`, `test:containers`, `test:profiles`, `test:architecture`, `test:retirement`, `test:rest-publication-contract`, `test:e2e`, `test:translation`, `test:guides-coverage`, `test:workflow-policy`, `test:typescript-runtime-boundary`, `test:external-link-watchdog`, `test:chat-agent-config`, `test:doc-publish-bot`, `test:all`

The new `test:all` references 13 scripts; all 13 exist. The only `test:*` scripts not referenced are `test:e2e` (intentionally excluded) and `test:all` (itself). No discrepancy from the controller's mandated value.

## Verification

### 1. JSON parse + token resolution

Command:
```bash
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
console.log('JSON.parse: OK');
const scripts = Object.keys(pkg.scripts);
console.log('All test:* scripts:', scripts.filter(s => s.startsWith('test:')).join(', '));
const testAll = pkg.scripts['test:all'];
const tokens = testAll.split('&&').map(s => s.trim().replace(/^pnpm run /, '')).filter(Boolean);
console.log('test:all tokens (' + tokens.length + '):', tokens.join(', '));
const missing = tokens.filter(t => !(t in pkg.scripts));
console.log('Missing scripts:', missing.length ? missing.join(', ') : 'none');
const excludedFromAll = scripts.filter(s => s.startsWith('test:') && !tokens.includes(s));
console.log('test:* scripts NOT referenced by test:all:', excludedFromAll.join(', ') || 'none');
if (missing.length) process.exit(1);
"
```

Output:
```
JSON.parse: OK
All test:* scripts: test:frontend, test:containers, test:profiles, test:architecture, test:retirement, test:rest-publication-contract, test:e2e, test:translation, test:guides-coverage, test:workflow-policy, test:typescript-runtime-boundary, test:external-link-watchdog, test:chat-agent-config, test:doc-publish-bot, test:all
test:all tokens (13): test:frontend, test:containers, test:profiles, test:translation, test:retirement, test:rest-publication-contract, test:guides-coverage, test:workflow-policy, test:typescript-runtime-boundary, test:external-link-watchdog, test:chat-agent-config, test:doc-publish-bot, test:architecture
Missing scripts: none
test:* scripts NOT referenced by test:all: test:e2e, test:all
```

### 2. Smoke check (fast suite)

Command: `pnpm run test:containers`

Output (tail):
```
# tests 27
# suites 0
# pass 27
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 352.412709
```

Full `pnpm test:all` was intentionally NOT run (slow; failures are triaged by a later task).

## Files changed

- `/Users/anthony/Documents/projects/zdoc/package.json` (single-line change to the `test:all` script)

## Concerns

- None functional. Note: the commit landed on branch `codex/master-tooling-validation` (the active working branch), not `master` as the initial git-status snapshot suggested.
- `test:translation` is a very long single-line script and is now part of `test:all`; it was previously orphaned, so it may fail. That is expected and deferred to Task 4 triage.
