import { createRequire } from 'node:module'
import { expect } from 'vitest'
import { segmentMarkdown } from '../../core/merge/segment'
import type { MergeOutput, SegmentInput } from '../../core/merge/types'

const require = createRequire(import.meta.url)
export const { resolveNextChannelCurrentView: currentView } = require('../../../../../../apps/docs/plugins/next-channel-view.js') as { resolveNextChannelCurrentView(text: string): string }

/** Independent NEXT walker: fences shield literal tags; directives use all five styles. */
export function nextView(text: string): string {
  const parts = text.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
  let gate: string | undefined
  return parts.map((part, index) => {
    if (index % 2) {
      if (gate === 'exclude') return ''
      let region: string | undefined, pending: string | undefined
      return part.split('\n').filter(line => {
        const directive = /^(?:\s*)(?:#\s*|\/\/\s*|\/\*\s*|<!--\s*|\{\/\*\s*)(next|current)-channel-(next-line|start|end)\s*(?:\*\/|-->|\*\/\})?\s*$/.exec(line)
        if (directive) {
          if (directive[2] === 'start') region = directive[1]
          else if (directive[2] === 'end') region = undefined
          else pending = directive[1]
          return false
        }
        const visible = (pending ?? region) !== 'current'
        pending = undefined
        return visible
      }).join('\n')
    }
    let out = '', cursor = 0
    for (const match of part.matchAll(/<NextChannel action="(include|exclude)">|<\/NextChannel>/g)) {
      if (gate !== 'exclude') out += part.slice(cursor, match.index)
      gate = match[1]
      cursor = match.index! + match[0].length
    }
    if (gate !== 'exclude') out += part.slice(cursor)
    return out
  }).join('')
}

export function segmented(markdown: string) {
  const result = segmentMarkdown({ markdown })
  if ('errors' in result) throw new Error(JSON.stringify(result.errors))
  return result.document
}

/** Only parser-owned empty inter-block/edge lines are ignored. No trim or byte rewriting. */
export function normalizeBody(markdown: string) {
  return segmented(markdown).blocks.map(block => [block.kind, block.text])
}

export function input(markdown: string, channel: 'current' | 'next'): SegmentInput {
  return { markdown, context: { file: `${channel}.md`, channel },
    origins: markdown.split(/\r\n|\r|\n/).map((_, line) => [{ channel, file: `${channel}-content.md`, line: line + 40 }]) }
}

/** Remove only manifest-proven terminal padding, after the real deployment resolver. */
export function projected(output: MergeOutput, channel: 'current' | 'next') {
  const resolver = channel === 'current' ? currentView : nextView
  const body = output.markdown.slice(segmented(output.markdown).bodyStart)
  const bodyStart = output.markdown.length - body.length
  let view = resolver(body)
  for (const emission of output.emissions.filter(item => item.channels.includes(channel))) {
    if (!emission.terminalPadding) continue
    const offset = emission.terminalPadding.start - bodyStart
    const prefix = resolver(body.slice(0, offset))
    // A nonterminated source block must be last in that channel. The suffix is
    // exclusively synthetic boundary and parser-owned empty separator bytes.
    expect(view.slice(prefix.length)).toMatch(/^[\r\n]*$/)
    view = view.slice(0, prefix.length)
  }
  return view
}

export function assertViews(output: MergeOutput, current: SegmentInput, next: SegmentInput) {
  if (output.unchanged) {
    expect(output.markdown).toBe(current.markdown)
    expect(output.markdown).toBe(next.markdown)
    return
  }
  for (const channel of ['current', 'next'] as const) {
    const source = channel === 'current' ? current.markdown : next.markdown
    const resolver = channel === 'current' ? currentView : nextView
    const body = source.slice(segmented(source).bodyStart)
    expect(normalizeBody(projected(output, channel))).toEqual(normalizeBody(resolver(body)))
    // Separate structural oracle: exact source blocks and their order, retaining
    // authored gate/directive bytes, before deployment semantics apply.
    const retained = output.emissions.filter(item => item.channels.includes(channel))
    expect(retained.map(item => [item.kind, output.markdown.slice(item.span.start, item.span.end)]))
      .toEqual(segmented(source).blocks.map(block => [block.kind, block.text]))
  }
}
