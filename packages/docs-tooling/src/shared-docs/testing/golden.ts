import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect } from 'vitest'

/** A separate root lets helper tests update temporary files, never approved goldens. */
export function goldenAt(root: string) {
  return (relativePath: string, actual: string): void => {
    const file = resolve(root, relativePath)
    if (isAbsolute(relativePath) || !file.startsWith(resolve(root) + sep)) {
      throw new Error(`Golden path must be inside its root: ${relativePath}`)
    }
    if (process.env.UPDATE_GOLDEN === '1' && !process.env.CI) {
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, actual)
    } else {
      expect(actual, `Golden mismatch: ${relativePath}`).toBe(readFileSync(file, 'utf8'))
    }
  }
}

export const expectGolden: (relativePath: string, actual: string) => void =
  goldenAt(fileURLToPath(new URL('../fixtures/golden/', import.meta.url)))
