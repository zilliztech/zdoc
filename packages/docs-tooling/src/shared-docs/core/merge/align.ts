import type { Alignment, MergeBlock } from './types'

type ComparableBlock = Pick<MergeBlock, 'kind' | 'text'>
const equal = (a: ComparableBlock, b: ComparableBlock) => a.kind === b.kind && a.text === b.text

/** Suffix LCS; ties consume current first. Changes are maximal between matches. */
export function alignBlocks(current: readonly ComparableBlock[], next: readonly ComparableBlock[]): Alignment[] {
  const lengths = Array.from({ length: current.length + 1 }, () => new Uint32Array(next.length + 1))
  for (let i = current.length - 1; i >= 0; i--) for (let j = next.length - 1; j >= 0; j--) {
    lengths[i][j] = equal(current[i], next[j]) ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1])
  }
  const result: Alignment[] = []
  let changed: Extract<Alignment, { kind: 'change' }> = { kind: 'change', current: [], next: [] }
  const flush = () => {
    if (changed.current.length || changed.next.length) result.push(changed)
    changed = { kind: 'change', current: [], next: [] }
  }
  let i = 0, j = 0
  while (i < current.length || j < next.length) {
    if (i < current.length && j < next.length && equal(current[i], next[j])) {
      flush()
      result.push({ kind: 'common', current: i++, next: j++ })
    } else if (i < current.length && (j === next.length || lengths[i + 1][j] >= lengths[i][j + 1])) changed.current.push(i++)
    else changed.next.push(j++)
  }
  flush()
  return result
}
