import { JSON_SCHEMA, load, YAMLException } from 'js-yaml'
import type { DiagnosticContext, SharedDocsError } from './types'

type KeyPath = (string | number)[]
interface Node { position: number; kind?: string | null; value?: unknown; children: Node[] }
interface YamlDocument { value: unknown; line(path: KeyPath): number }

export function diagnostic(code: string, message: string, context: DiagnosticContext, line = 1): SharedDocsError {
  return { ...context, code, message, line }
}

/** The YAML parser's node listener supplies positions, including flow mappings and aliases. */
export function parseYaml(text: string, syntaxCode: string, context: DiagnosticContext):
  { document: YamlDocument } | { errors: SharedDocsError[] } {
  const stack: Node[] = []
  let root: Node | undefined
  try {
    const value: unknown = load(text, { schema: JSON_SCHEMA,
      listener(event: string, state: { position: number; kind: string | null; result: unknown }) {
        if (event === 'open') {
          const node: Node = { position: state.position, children: [] }
          if (stack.length) stack[stack.length - 1].children.push(node)
          else root = node
          stack.push(node)
        } else {
          const node = stack.pop()!
          node.kind = state.kind
          node.value = state.result
        }
      },
    })
    const positions = new Map<string, number>()
    function visit(node: Node, path: KeyPath) {
      // Skip trivia before a value; errors point to the actual YAML token.
      const tail = text.slice(node.position)
      const trivia = /^(?:\s|#[^\r\n]*(?:\r?\n|$))*/.exec(tail)![0].length
      positions.set(JSON.stringify(path), text.slice(0, node.position + trivia).split(/\r\n|\r|\n/).length)
      if (node.kind === 'mapping') {
        for (let i = 0; i + 1 < node.children.length; i += 2) {
          const key = node.children[i]
          visit(node.children[i + 1], [...path, String(key.value)])
          positions.set(JSON.stringify([...path, String(key.value), '$key']),
            text.slice(0, key.position).split(/\r\n|\r|\n/).length)
        }
      } else if (node.kind === 'sequence') {
        node.children.forEach((child, index) => visit(child, [...path, index]))
      }
    }
    if (root) visit(root, [])
    return { document: { value, line(path) {
      while (!positions.has(JSON.stringify(path)) && path.length) path = path.slice(0, -1)
      return positions.get(JSON.stringify(path)) ?? 1
    } } }
  } catch (error) {
    if (!(error instanceof YAMLException)) throw error
    return { errors: [diagnostic(syntaxCode, error.reason, context, (error.mark?.line ?? 0) + 1)] }
  }
}

export function yamlLine(text: string, path: KeyPath): number {
  const parsed = parseYaml(text, 'CONFIG_SYNTAX_INVALID', {})
  return 'document' in parsed ? parsed.document.line(path) : 1
}

export class ConfigValidation {
  readonly errors: SharedDocsError[] = []
  constructor(readonly document: YamlDocument, readonly context: DiagnosticContext,
    private readonly invalidCode = 'CONFIG_FIELD_UNKNOWN', private readonly missingCode = 'CONFIG_FIELD_MISSING') {}
  error(path: KeyPath, message: string, code = this.invalidCode) {
    this.errors.push(diagnostic(code, message, this.context, this.document.line(path)))
  }
  object(value: unknown, path: KeyPath, allowed: string[], required: string[] = []): value is Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      this.error(path, `${path.join('.') || 'Document'} must be a mapping`)
      return false
    }
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) this.error([...path, key, '$key'], `Unknown field: ${[...path, key].join('.')}`)
    }
    for (const key of required) {
      if (!Object.hasOwn(value, key)) this.error(path, `Missing required field: ${[...path, key].join('.')}`, this.missingCode)
    }
    return true
  }
  string(value: unknown, path: KeyPath): value is string {
    if (typeof value !== 'string' || !value.trim()) {
      this.error(path, `${path.join('.')} must be a nonempty string`)
      return false
    }
    return true
  }
}

export function isRepositoryPath(value: string): boolean {
  return !/[\\:\x00-\x1f\x7f]/.test(value)
    && value.split('/').every(part => part !== '' && part !== '.' && part !== '..')
}

/** A local branch name, never an arbitrary Git revision expression. */
export function isBranchName(value: string): boolean {
  return value !== '@' && !value.startsWith('-') && !value.includes('..') && !value.includes('@{')
    && !/[\s~^:?*\[\\\x00-\x1f\x7f]/.test(value) && !value.endsWith('.')
    && value.split('/').every(part => part !== '' && !part.startsWith('.') && !part.endsWith('.lock'))
}
export function isCommit(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{40}$/.test(value)
}
