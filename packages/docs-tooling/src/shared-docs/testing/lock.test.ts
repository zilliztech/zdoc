// @vitest-environment node
import { expect, it } from 'vitest'
import { parseLock, planLock, validateLockHistory } from '../core/lock'
import { createReaderFixture } from './reader-fixture'

it('[3-1] plans both channels at the supplied tracking head and leaves an existing lock fixed', async () => {
  const { before, after, git } = await createReaderFixture('git')
  const trackedHead = git('rev-parse', 'refs/heads/v3.0.x').trim()
  expect(trackedHead).toBe(after)
  const created = planLock({ trackedHead, fromFork: false })
  expect(created).toEqual({ lock: { schema_version: 1, current: after, next: after } })
  const existing = { schema_version: 1 as const, current: before, next: before }
  expect(planLock({ existing, trackedHead, fromFork: false })).toEqual({ lock: existing })
  expect(planLock({ existing, trackedHead, fromFork: true })).toEqual({ lock: existing })
  expect(existing).toEqual({ schema_version: 1, current: before, next: before })
})

it('does not accept malformed planner inputs or mutate an existing lock', () => {
  expect(planLock({ trackedHead: 'HEAD', fromFork: false })).toMatchObject({ errors: [{ code: 'LOCK_INVALID' }] })
  const existing = { schema_version: 1 as const, current: 'bad', next: 'none' }
  expect(planLock({ existing, trackedHead: 'a'.repeat(40), fromFork: false })).toHaveProperty('errors')
  expect(existing.current).toBe('bad')
})

it('distinguishes a missing generation lock from onboarding and collects invalid fields', () => {
  expect(parseLock(undefined)).toMatchObject({ errors: [{ code: 'LOCK_INVALID', line: 1 }] })
  expect(parseLock('schema_version: 2\ncurrent: short\nnext: none\nextra: true\n')).toMatchObject({ errors: [
    { code: 'LOCK_INVALID', line: 4 }, { code: 'LOCK_INVALID', line: 1 },
    { code: 'LOCK_INVALID', channel: 'current', line: 2 }, { code: 'LOCK_NONE_UNSUPPORTED', channel: 'next', line: 3 },
  ] })
})

it.each(['', '[]', 'schema_version: 1\ncurrent: [', 'schema_version: 1\ncurrent: null\nnext: 123'])
  ('rejects invalid lock syntax or shape %j', text => expect(parseLock(text)).toHaveProperty('errors'))

it('requires affirmative ancestry evidence when both commits are on the branch', () => {
  expect(validateLockHistory({ schema_version: 1, current: 'a'.repeat(40), next: 'b'.repeat(40) },
    { current: 'on-branch', next: 'on-branch' }, 'current: a\nnext: b\n'))
    .toMatchObject([{ code: 'LOCK_ORDER', line: 1 }])
})
