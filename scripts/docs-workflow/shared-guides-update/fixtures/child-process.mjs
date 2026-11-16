// Test-only subprocess boundary. No production CLI imports this module.
import { execFile } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { delimiter, dirname, join } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)

export function fixtureChildEnvironment() {
  return {
    PATH: [dirname(process.execPath), '/usr/bin', '/bin'].join(delimiter),
    HOME: process.env.HOME
  }
}

export async function runFixtureChild(args, jobEnvironment = {}) {
  try {
    const { stdout, stderr } = await exec(process.execPath, args, {
      timeout: 30000,
      env: { ...jobEnvironment, ...fixtureChildEnvironment() },
      maxBuffer: 1024 * 1024
    })
    return { code: 0, signal: null, stdout, stderr }
  } catch (error) {
    return {
      code: error.code,
      signal: error.signal ?? null,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? ''
    }
  }
}

export function readFixtureResult(out, execution) {
  const resultPath = join(out, 'result.json')
  if (!existsSync(resultPath)) {
    const stdout = String(execution.stdout ?? '')
    const stderr = String(execution.stderr ?? '')
    const limit = 4096
    throw new Error(
      'FIXTURE_CHILD_RESULT_MISSING ' +
        JSON.stringify({
          exitCode: execution.code,
          signal: execution.signal ?? null,
          stdout: stdout.slice(0, limit),
          stderr: stderr.slice(0, limit),
          stdoutTruncated: stdout.length > limit,
          stderrTruncated: stderr.length > limit
        })
    )
  }
  return JSON.parse(readFileSync(resultPath, 'utf8'))
}
