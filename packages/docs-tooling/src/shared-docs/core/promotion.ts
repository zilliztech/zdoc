import type { PageLock } from './types'

export interface ReplayUatRelease {
  site: 'en'
  environment: 'uat'
  mode: 'rebuild'
  sourceRepository: 'zdoc'
  sourceSha: string
  finalDeployedDigest: string
  jenkinsBuildIdentity: string
  status: 'succeeded'
}

export interface PromotionTarget {
  manual: string
  path: string
  sha256: string
}

export interface PromotionPage {
  page: string
  status: 'eligible' | 'unnecessary' | 'blocked'
  lock?: PageLock
  acceptedNext?: string
  targets: PromotionTarget[]
  inputs?: { active: string; receipt: string; overlay: string; snapshot: string }
  reason?: string
}

export interface PromotionPreview {
  schema_version: 1
  observation: 'replay'
  status: 'preview' | 'paused'
  uat?: { record: ReplayUatRelease; sha256: string; openUpdatePages: string[] }
  baseline?: { master: string; dev: string; upstream: string }
  pages: PromotionPage[]
  reason?: string
}

export function classifyPromotion(page: Omit<PromotionPage, 'status'>): PromotionPage {
  if (page.reason || !page.lock || !page.acceptedNext || !page.targets.length || !page.inputs) {
    return { ...page, status: 'blocked', reason: page.reason ?? 'Incomplete promotion inputs' }
  }
  return { ...page, status: page.lock.current === page.lock.next ? 'unnecessary' : 'eligible' }
}

export const promotionPageId = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value !== 'active' && value !== 'all-eligible'

export function selectPromotionPages(preview: PromotionPreview, selection: 'all-eligible' | readonly string[]) {
  const eligible = preview.pages.filter(page => page.status === 'eligible')
  if (selection === 'all-eligible') return { pages: eligible, reasons: [] }
  const requested = new Set(selection)
  return {
    pages: eligible.filter(page => requested.has(page.page)),
    reasons: selection.flatMap(id => {
      const page = preview.pages.find(row => row.page === id)
      return page?.status === 'eligible' ? [] : [`${id}: ${page?.reason ?? (page ? 'No promotion needed' : 'Absent from the approved preview')}`]
    }),
  }
}

export type PromotionEdit = { path: string; before: string; after: string }
export interface PromotionViewCheck {
  manual: string
  path: string
  deployedSha256: string
  uatViewSha256: string
  candidateProdViewSha256: string
}

export interface UatEvidencePreview {
  schema_version: 1
  observation: 'uat-evidence'
  status: 'preview' | 'paused'
  page: string
  build: string
  baseline?: PromotionPreview['baseline']
  deployment:
    | { status: 'record-validated'; record: ReplayUatRelease; recordSha256: string }
    | { status: 'unavailable' | 'changed'; reason: string }
  comparison:
    | { status: 'matched'; lock: PageLock; deployedNext: string; views: PromotionViewCheck[] }
    | { status: 'unnecessary'; lock: PageLock; deployedNext: string }
    | { status: 'blocked'; reason: string }
    | { status: 'not-run' }
  imageLabels: { status: 'pending' }
  operatorAcceptance: { status: 'pending' }
  openUpdatePrs: { status: 'unobserved' }
}

export interface PromotionPageCheck {
  page: string
  lock?: { from: PageLock; to: PageLock }
  edits?: string[]
  views?: PromotionViewCheck[]
  reason?: string
}

export interface PromotionResult {
  schema_version: 1
  observation: 'replay'
  status: 'prepared' | 'empty' | 'paused'
  previewSha256?: string
  uat?: PromotionPreview['uat']
  baseline?: PromotionPreview['baseline']
  selected: string[]
  pages: PromotionPageCheck[]
  reasons: string[]
  patchSha256?: string
}

export function decidePromotion(pages: readonly PromotionPageCheck[], reasons: readonly string[]) {
  if (reasons.length || pages.some(page => page.reason)) return 'paused'
  return pages.length ? 'prepared' : 'empty'
}
