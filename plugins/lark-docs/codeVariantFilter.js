'use strict'

const DIRECTIVE_BODY = '(include|exclude)-(next-line|start|end)(?:\\s+([A-Za-z0-9._-]+))?'
const COMMENT_PATTERNS = [
  new RegExp(`^(\\s*)#\\s*${DIRECTIVE_BODY}\\s*$`, 'i'),
  new RegExp(`^(\\s*)//\\s*${DIRECTIVE_BODY}\\s*$`, 'i'),
  new RegExp(`^(\\s*)/\\*\\s*${DIRECTIVE_BODY}\\s*\\*/\\s*$`, 'i'),
  new RegExp(`^(\\s*)<!--\\s*${DIRECTIVE_BODY}\\s*-->\\s*$`, 'i'),
  new RegExp(`^(\\s*)\\{/\\*\\s*${DIRECTIVE_BODY}\\s*\\*/\\}\\s*$`, 'i'),
]

function activeTargetParts(targets) {
  return new Set(String(targets || '')
    .toLowerCase()
    .split('.')
    .map(part => part.trim())
    .filter(Boolean))
}

function targetMatches(target, parts) {
  return parts.has(String(target || '').trim().toLowerCase())
}

function directiveEnabled(kind, target, parts) {
  const match = targetMatches(target, parts)
  return kind === 'include' ? match : !match
}

function parseCommentDirective(line, lineNumber) {
  for (const pattern of COMMENT_PATTERNS) {
    const match = line.match(pattern)
    if (!match) continue

    const [, indent, rawKind, rawOperation, rawTarget] = match
    const kind = rawKind.toLowerCase()
    const operation = rawOperation.toLowerCase()
    const target = rawTarget ? rawTarget.toLowerCase() : null

    if (operation !== 'end' && !target) {
      throw new Error(`Code variant ${kind}-${operation} requires a target at line ${lineNumber}`)
    }
    if (operation === 'end' && target) {
      throw new Error(`Code variant ${kind}-end must not specify a target at line ${lineNumber}`)
    }

    return { indent, kind, operation, target, lineNumber }
  }
  return null
}

function filterCommentDirectives(content, targets) {
  const input = String(content ?? '').replace(/\r\n/g, '\n')
  const hadTrailingNewline = input.endsWith('\n')
  const lines = input.split('\n')
  if (hadTrailingNewline) lines.pop()

  const parts = activeTargetParts(targets)
  const regions = []
  const output = []
  let nextLine = null

  const regionsEnabled = () => regions.every(region => region.enabled)

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1
    const line = lines[index]
    const directive = parseCommentDirective(line, lineNumber)

    if (directive) {
      if (nextLine) {
        throw new Error(`Code variant ${nextLine.kind}-next-line at line ${nextLine.lineNumber} must be followed by a code line`)
      }

      if (directive.operation === 'next-line') {
        nextLine = {
          ...directive,
          enabled: directiveEnabled(directive.kind, directive.target, parts),
        }
        continue
      }

      if (directive.operation === 'start') {
        regions.push({
          ...directive,
          enabled: directiveEnabled(directive.kind, directive.target, parts),
        })
        continue
      }

      const current = regions.at(-1)
      if (!current || current.kind !== directive.kind) {
        throw new Error(`Code variant ${directive.kind}-end at line ${lineNumber} does not match an open ${directive.kind}-start`)
      }
      if (current.indent !== directive.indent) {
        throw new Error(`Code variant ${directive.kind}-end indentation at line ${lineNumber} does not match line ${current.lineNumber}`)
      }
      regions.pop()
      continue
    }

    const enabled = regionsEnabled() && (!nextLine || nextLine.enabled)
    if (enabled) output.push(line)
    nextLine = null
  }

  if (nextLine) {
    throw new Error(`Code variant ${nextLine.kind}-next-line at line ${nextLine.lineNumber} has no following code line`)
  }
  if (regions.length > 0) {
    const current = regions.at(-1)
    throw new Error(`Code variant ${current.kind}-start at line ${current.lineNumber} has no matching ${current.kind}-end`)
  }

  const rendered = output.join('\n')
  return hadTrailingNewline && rendered ? `${rendered}\n` : rendered
}

function filterCodeVariants(content, targets) {
  return filterCommentDirectives(content, targets)
}

module.exports = {
  filterCodeVariants,
}
