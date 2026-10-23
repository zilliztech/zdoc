import type { CloudPage } from './types'
import { headingText } from './anchors'

export const normalizeLinkTitle = (text: string) => headingText(text).toLocaleLowerCase('en-US').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
/** Suggestions only: exact titles first, then shared title words, with stable tie breaking. */
export function linkCandidates(title: string, pages: readonly CloudPage[]): CloudPage[] {
  const target = normalizeLinkTitle(title)
  if (!target) return []
  const words = new Set(target.split(' '))
  return pages.map(page => {
    const candidate = normalizeLinkTitle(page.title)
    const terms = new Set(candidate.split(' '))
    const intersection = [...words].filter(word => terms.has(word)).length
    return { page, score: candidate === target ? 2 : intersection / (words.size + terms.size - intersection) }
  }).filter(row => row.score > 0).sort((a, b) => b.score - a.score
    || (a.page.slug < b.page.slug ? -1 : a.page.slug > b.page.slug ? 1 : 0))
    .filter((row, index, rows) => rows.findIndex(other => other.page.slug === row.page.slug) === index)
    .slice(0, 3).map(({ page }) => ({ ...page }))
}
