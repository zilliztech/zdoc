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
    // Pure third-party libraries are allowed; I/O and source adapters are not.
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      const specifier = (node.moduleSpecifier as ts.StringLiteral).text
      const target = specifier.startsWith('.') ? resolve(dirname(path), specifier) : specifier
      if (/^(?:node:)?(?:fs|child_process|http|https|http2|net|tls|dgram|dns|worker_threads|module)(?:\/|$)/.test(target)
        || /^(?:axios|node-fetch|undici|got|simple-git|isomorphic-git)(?:\/|$)/.test(target)
        || /(?:^|\/)(?:lark|adapters)(?:\/|$)/.test(target)) failures.push(`I/O core import: ${specifier}`)
    }
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const call = node.expression.getText(file)
      if (/(?:^|\.)(?:require|import|fetch|WebSocket|XMLHttpRequest|EventSource|sendBeacon)$/.test(call)) failures.push(call)
    }
    if (ts.isIdentifier(node) && ['fetch', 'WebSocket', 'XMLHttpRequest', 'EventSource', 'sendBeacon'].includes(node.text)) failures.push(node.text)
    ts.forEachChild(node, visit)
  }
  visit(file)
  return failures
}

it('keeps every core source free of I/O imports and network entrypoints', () => {
  function check(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) check(path)
      else if (/\.tsx?$/.test(path)) expect(violations(readFileSync(path, 'utf8'), path), path).toEqual([])
    }
  }
  check(coreRoot)
})

it('detects filesystem, process, network and lark dependencies', () => {
  for (const source of ["import fs from 'node:fs'", "export * from 'node:child_process'",
    "import x from '../../lark/x'", "import x from './../../../lark/x'", "import('node:http')", "require('fs')", "fetch('url')", "new WebSocket('url')"]) {
    expect(violations(source), source).not.toEqual([])
  }
  expect(violations("import type { PageId } from './types'; import { z } from 'zod'; const result = 'fetch is just text'" )).toEqual([])
})
