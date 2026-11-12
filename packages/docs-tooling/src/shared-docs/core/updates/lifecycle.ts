export interface LifecyclePolicy { maxAgeMs: number; futureSkewMs: number }
export const defaultLifecyclePolicy: LifecyclePolicy = { maxAgeMs: 36 * 60 * 60 * 1000, futureSkewMs: 5 * 60 * 1000 }
export interface LifecycleRecord {
  record_id: string; table_id: string; slug: string; placement_type: string; release_channel?: string;
  source_kind?: string; shared_page?: { group: string; page: string }; output_paths: string[];
}
export interface LifecycleEvidence {
  reasons: string[]; generatedAt?: string; records: LifecycleRecord[];
  identity: Record<string, string | number | boolean | null>;
  observedPage?: string;
}
export interface LifecycleResult { state: 'active' | 'retire' | 'unknown'; reasons: string[]; recordId?: string; retainedSource?: 'shared-page' | 'feishu' }
/** Positive observation only. No record absence can prove deletion or authorize a close. */
export function classifyLifecycle(evidence: LifecycleEvidence, page: string, targets: readonly { manual: string; path: string }[],
  now: number, policy = defaultLifecyclePolicy): LifecycleResult {
  if (![now, policy.maxAgeMs, policy.futureSkewMs].every(Number.isFinite) || policy.maxAgeMs <= 0 || policy.futureSkewMs < 0) throw new Error('Invalid lifecycle policy/clock')
  const reasons = [...evidence.reasons]
  if (evidence.observedPage !== undefined && evidence.observedPage !== page) reasons.push('RECORD_FRESHNESS_COMPLETENESS_UNPROVEN')
  const time = Date.parse(evidence.generatedAt ?? '')
  if (!Number.isFinite(time)) reasons.push('MISSING_OBSERVATION_TIME')
  else if (time > now + policy.futureSkewMs) reasons.push('FUTURE_OBSERVATION')
  else if (now - time > policy.maxAgeMs) reasons.push('STALE_OBSERVATION')
  const candidates = evidence.records.filter(r => r.slug === page || r.shared_page?.page === page)
  if (candidates.length !== 1) reasons.push(candidates.length ? 'AMBIGUOUS_RECORD' : 'NO_RECORD_NOT_DELETION')
  const record = candidates.length === 1 ? candidates[0] : undefined
  if (record) {
    if (record.source_kind !== 'shared-page' || !record.shared_page) reasons.push('UNACTIVATED_SHARED_RECORD')
    if (record.slug !== page || record.placement_type !== 'canonical' || !record.table_id ||
      (record.shared_page && (record.shared_page.group !== 'guides' || record.shared_page.page !== page))) reasons.push('RECORD_IDENTITY_MISMATCH')
    const expected = targets.map(t => `content/en/${t.manual === 'guides' ? 'guides' : 'byoc'}/${t.path}`)
    if (!Array.isArray(record.output_paths) || record.output_paths.length !== expected.length || expected.some(p =>
      record.output_paths.filter(path => path === `${p}.md` || path === `${p}.mdx`).length !== 1)) reasons.push('OUTPUT_IDENTITY_MISMATCH')
    if (!['current', 'next', 'retire-in-next'].includes(record.release_channel ?? '')) reasons.push('UNKNOWN_CHANNEL')
  }
  return { state: reasons.length ? 'unknown' : record!.release_channel === 'retire-in-next' ? 'retire' : 'active',
    reasons: [...new Set(reasons)].sort(), ...(record ? { recordId: record.record_id, retainedSource: record.source_kind === 'shared-page' ? 'shared-page' as const : 'feishu' as const } : {}) }
}
