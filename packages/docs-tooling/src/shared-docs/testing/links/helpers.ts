import type { RewriteInput } from '../../core/links'
export const sourceFile = 'site/en/wp5-links.md'
export const context = { file: sourceFile, page: 'wp5-links', channel: 'current' as const }
export function input(markdown: string, overrides: Partial<RewriteInput> = {}): RewriteInput {
  return { markdown, sourceFile, context, sharedPages: new Map(), linkMap: new Map(), cloudPages: [], targets: new Map(), images: new Map(), ...overrides }
}
