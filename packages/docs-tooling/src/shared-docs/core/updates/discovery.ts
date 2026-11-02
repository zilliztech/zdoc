import type { FixedPageInput, PageImpact } from './types'
import type { LifecycleResult } from './lifecycle'
export interface PageDiscovery {
  pageId: string; status: 'analyzed' | 'content-failure'; sourceChanged: boolean; outputChanged: boolean | 'unknown';
  configurationChanges: string[]; lifecycle: LifecycleResult;
  proposedNext: { current: string; oldNext: string; next: string } | null;
  futureEligible: boolean; reasons: string[];
}
/** No hashing, I/O or writes; image/output-only evidence cannot invent a source delta. */
export function discoverPage(page: FixedPageInput, impact: PageImpact, lifecycle: LifecycleResult): PageDiscovery {
  const old = new Map(page.oldNext.localInputs.map(f => [f.file, f.sha256]))
  const after = new Map(page.candidateNext.localInputs.map(f => [f.file, f.sha256]))
  const configurationChanges = [...new Set([...old.keys(), ...after.keys()])].filter(file => old.get(file) !== after.get(file) &&
    (file.includes(`/pages/${page.pageId}/`) && !file.endsWith('/lock.yaml') ||
      /\/(links.yaml|product-names.yaml|cloud-sdk-tabs.yaml)$/.test(file))).sort()
  if (impact.sourceImpact.changes.some(c => c.kind === 'variable')) configurationChanges.push('used-variables')
  const sourceChanged = impact.sourceImpact.changes.some(c => c.kind === 'source' || c.kind === 'fragment' ||
    c.kind === 'image' && (c.image?.before?.origin.kind === 'repository' || c.image?.after?.origin.kind === 'repository'))
  const proposedNext = sourceChanged && page.oldNext.commit !== page.candidateNext.commit
    ? { current: page.current.commit, oldNext: page.oldNext.commit, next: page.candidateNext.commit } : null
  const failed = page.candidateNext.outputStatus === 'error' || impact.errors.length > 0
  return { pageId: page.pageId, status: failed ? 'content-failure' : 'analyzed', sourceChanged,
    outputChanged: impact.sourceImpact.outputChanged, configurationChanges, lifecycle, proposedNext,
    futureEligible: !!proposedNext && lifecycle.state === 'active', reasons: [
      ...(proposedNext ? [] : [configurationChanges.length ? 'CONFIGURATION_ONLY' : 'NO_FORWARD_RELEVANT_DELTA']),
      ...(lifecycle.state === 'active' ? [] : [`LIFECYCLE_${lifecycle.state.toUpperCase()}`]),
      ...(failed ? ['CONTENT_FAILURE_REQUIRES_REVIEW'] : []),
    ] }
}
