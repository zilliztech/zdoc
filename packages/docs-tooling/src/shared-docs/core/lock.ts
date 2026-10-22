import type { DiagnosticContext, LockHistory, LockResult, PageLock, SharedDocsError } from './types'
import { ConfigValidation, diagnostic, isCommit, parseYaml, yamlLine } from './yaml'

export function parseLock(text: string | undefined, context: DiagnosticContext = {}): LockResult {
  const location = { file: 'lock.yaml', channel: 'both' as const, ...context }
  if (text === undefined) return { errors: [diagnostic('LOCK_INVALID', 'Missing lock.yaml', location)] }
  const parsed = parseYaml(text, 'LOCK_INVALID', location)
  if ('errors' in parsed) return parsed
  const check = new ConfigValidation(parsed.document, location, 'LOCK_INVALID', 'LOCK_INVALID')
  const value = parsed.document.value
  if (check.object(value, [], ['schema_version', 'current', 'next'], ['schema_version', 'current', 'next'])) {
    if ('schema_version' in value && value.schema_version !== 1) check.error(['schema_version'], 'Unsupported schema_version; expected 1')
    for (const channel of ['current', 'next'] as const) {
      if (!(channel in value)) continue
      const code = value[channel] === 'none' ? 'LOCK_NONE_UNSUPPORTED' : 'LOCK_INVALID'
      if (!isCommit(value[channel])) {
        check.errors.push(diagnostic(code, `${channel} must be a complete lowercase commit SHA; none is not supported in Phase 1`,
          { ...location, channel }, parsed.document.line([channel])))
      }
    }
  }
  return check.errors.length ? { errors: check.errors } : { lock: value as unknown as PageLock }
}

/** Git facts are supplied by an adapter; core never resolves or reads commits. */
export function validateLockHistory(lock: PageLock, history: LockHistory, text: string, context: DiagnosticContext = {}): SharedDocsError[] {
  const location = { file: 'lock.yaml', ...context }
  const errors: SharedDocsError[] = []
  for (const channel of ['current', 'next'] as const) {
    if (history[channel] !== 'on-branch') errors.push(diagnostic('LOCK_COMMIT_NOT_FOUND',
      `${channel} commit ${lock[channel]} is ${history[channel] === 'missing' ? 'missing' : 'outside the tracking branch history'}`,
      { ...location, channel }, yamlLine(text, [channel])))
  }
  if (!errors.length && history.ordered !== true) errors.push(diagnostic('LOCK_ORDER',
    'current must be an ancestor of or equal to next', { ...location, channel: 'both' }, yamlLine(text, ['current'])))
  return errors
}

export function planLock(input: { existing?: PageLock; trackedHead: string; fromFork: boolean }, context: DiagnosticContext = {}): LockResult {
  const location = { file: 'lock.yaml', channel: 'both' as const, ...context }
  if (input.existing !== undefined) return parseLock(JSON.stringify(input.existing), location)
  if (input.fromFork) return { errors: [diagnostic('LOCK_FORK_PR',
    'Cannot create a lock for a fork PR; submit the onboarding PR from a branch in the zdoc repository', location)] }
  if (!isCommit(input.trackedHead)) return { errors: [diagnostic('LOCK_INVALID', 'trackedHead must be a complete lowercase commit SHA', location)] }
  return { lock: { schema_version: 1, current: input.trackedHead, next: input.trackedHead } }
}
