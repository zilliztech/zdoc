### Task 1: Fix `test:all` to run everything

**Files:** Modify `package.json` (scripts block).

- [ ] **Step 1: Add a `test:scripts` umbrella that runs all `scripts/**` node tests via directory discovery**

```jsonc
"test:scripts": "node --test \"scripts/**/*.test.js\" \"scripts/**/*.test.mjs\" \"deploy/**/*.test.mjs\" \"config/**/*.test.js\"",
"test:all": "pnpm run test:scripts && pnpm run test:frontend && pnpm run test:containers && pnpm run test:profiles && pnpm run test:guides-coverage && pnpm run test:workflow-policy && pnpm run test:typescript-runtime-boundary && pnpm run test:architecture"
```

Note: the exact `node --test` glob semantics are verified in Step 2; if Node 22 rejects quoted globs, fall back to `node --test scripts deploy config` (directory discovery, which recurses and runs every matching test file).

- [ ] **Step 2: Verify the umbrella discovers the same files the explicit lists did**

Run: `pnpm run test:scripts -- --test-only 2>&1 | grep -c "^# tests"` (or run a single known-good path). Expected: discovers >150 `scripts/**` tests; no "no tests found" errors.

- [ ] **Step 3: Run `pnpm test:all` locally and record which suites pass/fail**

Run: `pnpm test:all`. Expected: `test:frontend` passes (unchanged); some newly-included suites may FAIL because they were orphaned and drifted. Do NOT fix them here — record the failures for Task 4 triage.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "test: make test:all run every suite via directory discovery"
```

