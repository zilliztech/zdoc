// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import ts from 'typescript'

const coreRoot = fileURLToPath(new URL('../core/', import.meta.url))

function violations(source: string, path = join(coreRoot, 'types.ts')): string[] {
  const failures: string[] = []
  const file = ts.createSourceFile('core.ts', source, ts.ScriptTarget.Latest, true)
  function visit(node: ts.Node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      const specifier = (node.moduleSpecifier as ts.StringLiteral).text
      const target = specifier.startsWith('.') ? resolve(dirname(path), specifier) : specifier
      if (
        /^(?:node:)?(?:fs|child_process|http|https|http2|net|tls|dgram|dns|worker_threads|module|process)(?:\/|$)/.test(target) ||
        /^(?:axios|node-fetch|undici|got|simple-git|isomorphic-git)(?:\/|$)/.test(target) ||
        /(?:^|\/)(?:lark|adapters|commands)(?:\/|$)/.test(target)
      ) {
        failures.push(`I/O or adapter core import: ${specifier}`)
      }
    }
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const call = node.expression.getText(file)
      if (/(?:^|\.)(?:require|import|fetch|WebSocket|XMLHttpRequest|EventSource|sendBeacon)$/.test(call)) {
        failures.push(call)
      }
    }
    if (
      ts.isIdentifier(node) &&
      ['fetch', 'WebSocket', 'XMLHttpRequest', 'EventSource', 'sendBeacon'].includes(node.text)
    ) {
      failures.push(node.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return failures
}

it('keeps every localized-docs core source free of I/O, network, lark, and adapter imports', () => {
  const scanned: string[] = []
  function check(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) check(path)
      else if (/\.tsx?$/.test(path)) {
        scanned.push(path.slice(coreRoot.length))
        expect(violations(readFileSync(path, 'utf8'), path), path).toEqual([])
      }
    }
  }
  check(coreRoot)
  expect(scanned).toEqual(
    expect.arrayContaining([
      'handoff/source-state.ts',
      'handoff/routing.ts',
      'handoff/receipt.ts',
      'handoff/promote.ts',
    ]),
  )
})

it('detects forbidden filesystem, process, network, lark, and adapter dependencies', () => {
  for (const source of [
    "import fs from 'node:fs'",
    "import proc from 'node:process'",
    "export * from 'node:child_process'",
    "import x from '../../lark/x'",
    "import x from '../adapters/md2md.ts'",
    "import x from '../commands/check.ts'",
    "import('node:http')",
    "require('fs')",
    "fetch('url')",
    "new WebSocket('url')",
  ]) {
    expect(violations(source), source).not.toEqual([])
  }
  expect(
    violations("import { createHash } from 'node:crypto'; import type { PageId } from './types.ts';"),
  ).toEqual([])
})
