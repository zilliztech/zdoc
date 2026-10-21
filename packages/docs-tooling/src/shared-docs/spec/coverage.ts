import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

export interface Requirements {
  behaviours: { id: string }[]
  acceptance: { id: string }[]
  errors: { code: string; area_id: string }[]
}
const md2mdIds = new Set(['1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', 'T01', 'T02', 'T03', 'T11'])
const md2mdAreas = new Set(['named-blocks', 'variables-and-fragments'])
export function requirementIds(requirements: Requirements, ownedOnly = false): string[] {
  return [...requirements.behaviours, ...requirements.acceptance].map(row => row.id)
    .filter(id => !ownedOnly || !md2mdIds.has(id))
    .concat(requirements.errors.filter(row => !ownedOnly || !md2mdAreas.has(row.area_id)).map(row => row.code))
}

/** Parse test declarations, not comments, assertion strings or fake error responses. */
export function testReferences(source: string): { id: string; covered: boolean }[] {
  const references: { id: string; covered: boolean }[] = []
  const file = ts.createSourceFile('tests.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  function callee(node: ts.Expression): string[] {
    if (ts.isIdentifier(node)) return [node.text]
    if (ts.isPropertyAccessExpression(node)) return [...callee(node.expression), node.name.text]
    if (ts.isCallExpression(node)) return callee(node.expression)
    return []
  }
  function visit(node: ts.Node, skipped = false) {
    if (ts.isCallExpression(node)) {
      const parts = callee(node.expression)
      const isSuite = parts[0] === 'describe' || parts[0] === 'suite'
      const isTest = parts[0] === 'it' || parts[0] === 'test'
      if (isTest || isSuite) {
        skipped ||= parts.some(part => ['skip', 'todo', 'skipIf', 'runIf'].includes(part))
        const title = node.arguments[0]
        if (isTest && title && ts.isStringLiteralLike(title)) {
          for (const match of title.text.matchAll(/\[(\d+-\d+|T\d+|[A-Z][A-Z0-9_]*)\]/g)) {
            references.push({ id: match[1], covered: !skipped })
          }
        }
      }
    }
    ts.forEachChild(node, child => visit(child, skipped))
  }
  visit(file)
  return references
}

export function readTestSources(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name)
    if (entry.isDirectory()) return readTestSources(path)
    return /\.test\.tsx?$/.test(entry.name) ? [readFileSync(path, 'utf8')] : []
  })
}

export function checkCoverage(requirements: Requirements, pending: Record<string, string>, sources: string[]) {
  const known = new Set(requirementIds(requirements))
  const owned = new Set(requirementIds(requirements, true))
  const references = sources.flatMap(testReferences)
  const covered = new Set(references.filter(ref => ref.covered).map(ref => ref.id))
  const problems: string[] = []
  for (const { id } of references) if (!known.has(id)) problems.push(`Unknown requirement: ${id}`)
  for (const [id, wp] of Object.entries(pending)) {
    if (!owned.has(id)) problems.push(`Pending ID is not owned by zdoc: ${id}`)
    if (!/^WP(?:[3-9]|1[0-5])$/.test(wp)) problems.push(`Invalid pending work package: ${id} -> ${wp}`)
    if (covered.has(id)) problems.push(`Remove covered ID from pending.json: ${id}`)
  }
  for (const id of owned) if (!covered.has(id) && !Object.hasOwn(pending, id)) problems.push(`Missing coverage or pending entry: ${id}`)
  if (problems.length) throw new Error([...new Set(problems)].sort().join('\n'))
  return { remaining: Object.keys(pending).length }
}
