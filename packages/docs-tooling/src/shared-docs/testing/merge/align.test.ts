// @vitest-environment node
import { expect, it } from 'vitest'
import { alignBlocks } from '../../core/merge/align'
const blocks = (items: string[]) => items.map(text => ({ kind: 'paragraph' as const, text }))
const common = (current: number, next: number) => ({ kind: 'common', current, next })
const change = (current: number[], next: number[]) => ({ kind: 'change', current, next })
it.each([
  [['A', 'B', 'C'], ['B', 'A', 'C'], [change([0], []), common(1, 0), change([], [1]), common(2, 2)]],
  [['A', 'A', 'B'], ['A', 'B', 'A'], [common(0, 0), change([1], []), common(2, 1), change([], [2])]],
  [['A', 'B'], ['B', 'A'], [change([0], []), common(1, 0), change([], [1])]],
  [['A', 'B', 'C', 'D'], ['A', 'X', 'Y', 'D'], [common(0, 0), change([1, 2], [1, 2]), common(3, 3)]],
  [['A', 'B'], ['X', 'Y'], [change([0, 1], [0, 1])]],
  [[], ['A', 'B'], [change([], [0, 1])]],
  [['A', 'B'], [], [change([0, 1], [])]],
  [[], [], []],
])('aligns %j with %j deterministically', (current, next, expected) => {
  expect(alignBlocks(blocks(current as string[]), blocks(next as string[]))).toEqual(expected)
})
it('compares both kind and all exact bytes', () => {
  expect(alignBlocks([{ kind: 'paragraph', text: 'A\n' }], [{ kind: 'html', text: 'A\n' }])).toEqual([change([0], [0])])
  for (const text of ['A', 'A\r\n', 'A  \n', ' A\n']) expect(alignBlocks(blocks(['A\n']), blocks([text]))).toEqual([change([0], [0])])
})
it('preserves both orders over fixed-seed repeated-block sequences', () => {
  let seed = 1102
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed }
  for (let run = 0; run < 100; run++) {
    const current = blocks(Array.from({ length: random() % 15 }, () => String(random() % 4)))
    const next = blocks(Array.from({ length: random() % 15 }, () => String(random() % 4)))
    const before = JSON.stringify({ current, next })
    const aligned = alignBlocks(current, next)
    expect(aligned).toEqual(alignBlocks(current, next))
    expect(aligned.flatMap(item => item.kind === 'common' ? [item.current] : item.current)).toEqual(current.map((_, i) => i))
    expect(aligned.flatMap(item => item.kind === 'common' ? [item.next] : item.next)).toEqual(next.map((_, i) => i))
    for (const item of aligned) if (item.kind === 'common') expect(current[item.current]).toEqual(next[item.next])
    expect(JSON.stringify({ current, next })).toBe(before)
  }
})
