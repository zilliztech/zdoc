// Run 1: reserve has checks:write; validate independently reauthenticates with read-only permissions.
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { targetCheckMain } from './target-check.mjs'
export { runTargetCheckCLI } from './target-check.mjs'
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  targetCheckMain('validate').catch(() => {
    process.stderr.write('TARGET_CHECK_CLI_FAILED\n')
    process.exitCode = 1
  })
