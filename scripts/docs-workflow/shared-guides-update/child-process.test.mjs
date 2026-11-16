import assert from 'node:assert/strict'
import { mkdtempSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import {
  fixtureChildEnvironment,
  readFixtureResult,
  runFixtureChild
} from './fixtures/child-process.mjs'

test('a real env-node child resolves the current runner Node through the sanitized environment', async () => {
  const child = await runFixtureChild([
    '-e',
    `const {execFileSync}=require('node:child_process');process.stdout.write(execFileSync('/usr/bin/env',['node','-p','JSON.stringify({version:process.version,execPath:process.execPath})'],{encoding:'utf8'}))`
  ])
  assert.equal(child.code, 0, child.stderr)
  assert.deepEqual(JSON.parse(child.stdout), {
    version: process.version,
    execPath: process.execPath
  })
  assert.deepEqual(Object.keys(fixtureChildEnvironment()).sort(), [
    'HOME',
    'PATH'
  ])
})

test('a real bootstrap failure reports its exit and streams instead of masking it as missing result JSON', async () => {
  const out = mkdtempSync(join(realpathSync(tmpdir()), 'fixture-bootstrap-'))
  const child = await runFixtureChild([
    '-e',
    `process.stdout.write('fixture bootstrap stdout');process.stderr.write('fixture bootstrap stderr');process.exitCode=7`
  ])
  assert.equal(child.code, 7)
  assert.throws(
    () => readFixtureResult(out, child),
    (error) => {
      assert.match(error.message, /FIXTURE_CHILD_RESULT_MISSING/)
      assert.match(error.message, /"exitCode":7/)
      assert.match(error.message, /"signal":null/)
      assert.match(error.message, /fixture bootstrap stdout/)
      assert.match(error.message, /fixture bootstrap stderr/)
      assert.doesNotMatch(error.message, /ENOENT/)
      return true
    }
  )
})

test('bootstrap diagnostics bound each child stream without dumping the parent environment', async () => {
  const out = mkdtempSync(
    join(realpathSync(tmpdir()), 'fixture-bootstrap-bound-')
  )
  const child = await runFixtureChild([
    '-e',
    `process.stdout.write('stdout-marker '+ 'x'.repeat(12000));process.stderr.write('stderr-marker '+ 'y'.repeat(12000));process.exitCode=9`
  ])
  assert.throws(
    () => readFixtureResult(out, child),
    (error) => {
      assert.match(error.message, /"exitCode":9/)
      assert.match(error.message, /stdout-marker/)
      assert.match(error.message, /stderr-marker/)
      assert.match(error.message, /"stdoutTruncated":true/)
      assert.match(error.message, /"stderrTruncated":true/)
      assert.ok(error.message.length < 9000)
      return true
    }
  )
})
